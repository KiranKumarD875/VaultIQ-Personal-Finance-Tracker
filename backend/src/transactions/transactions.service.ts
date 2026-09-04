import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { RedisService } from '../common/redis/redis.service';
import { Budget } from '../budgets/entities/budget.entity';
import { Goal } from '../goals/entities/goal.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private repo: Repository<Transaction>,
    @InjectRepository(Budget) private budgetRepo: Repository<Budget>,
    @InjectRepository(Goal) private goalRepo: Repository<Goal>,
    private redisService: RedisService,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    const tx = this.repo.create({ ...dto, user_id: userId });
    const saved = await this.repo.save(tx);
    await this.redisService.delPattern(`summary:${userId}:*`);
    return saved;
  }

  async findAll(userId: string, query: QueryTransactionDto) {
    const qb = this.repo.createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.user_id = :userId', { userId })
      .orderBy('t.transaction_date', 'DESC');

    if (query.from && query.to) {
      qb.andWhere('t.transaction_date BETWEEN :from AND :to', { from: query.from, to: query.to });
    }
    if (query.type) {
      qb.andWhere('t.type = :type', { type: query.type });
    }
    if (query.category_id) {
      qb.andWhere('t.category_id = :categoryId', { categoryId: query.category_id });
    }

    if (query.limit) {
      qb.take(query.limit);
      qb.skip(query.offset || 0);
      const [data, total] = await qb.getManyAndCount();
      return { data, total };
    }

    return qb.getMany();
  }

  async getSummary(userId: string, month: number, year: number) {
    const cacheKey = `summary:${userId}:${month}:${year}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${endDate}`;

    // Fetch all required data in parallel
    const [transactions, budgets, goals] = await Promise.all([
      this.repo.find({
        where: { user_id: userId, transaction_date: Between(start, end) },
        relations: ['category'],
      }),
      this.budgetRepo.find({
        where: { user_id: userId, month, year },
      }),
      this.goalRepo.find({
        where: { user_id: userId, status: 'ACTIVE' },
      }),
    ]);

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryBreakdown: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const catName = t.category?.name || 'Uncategorized';
        categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + Number(t.amount);
      });

    // 1. Calculate Remaining Budgets
    let remainingBudgets = 0;
    budgets.forEach((b) => {
      // Find how much was spent in this budget's category this month
      const spentInCategory = transactions
        .filter((t) => t.type === 'EXPENSE' && t.category_id === b.category_id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const remaining = Number(b.monthly_limit) - spentInCategory;
      if (remaining > 0) {
        remainingBudgets += remaining;
      }
    });

    // 2. Calculate Total Goal Contributions (Actual Saved amount for display)
    let totalGoalContributions = 0;
    goals.forEach((g) => {
      totalGoalContributions += Number(g.current_amount);
    });

    // 3. The Safe-to-Spend Formula
    // NOTE: Goal contributions are now logged as 'EXPENSE' transactions in the ledger,
    // so they naturally deduct from totalIncome by increasing totalExpense.
    const safeToSpend = totalIncome - totalExpense - remainingBudgets;

    // Calculate FinScore
    let finScore = 500;
    if (totalIncome > 0) {
      let score = 0;
      // 1. Expense Ratio (Max 400 pts)
      const expenseRatio = Math.min(1, totalExpense / totalIncome);
      score += Math.max(0, 400 - (expenseRatio * 400));
      // 2. Goal Contributions (Max 300 pts)
      const goalRatio = Math.min(0.2, totalGoalContributions / totalIncome) / 0.2;
      score += goalRatio * 300;
      // 3. Safe to Spend Buffer (Max 300 pts)
      const safeRatio = Math.min(0.1, Math.max(0, safeToSpend) / totalIncome) / 0.1;
      score += safeRatio * 300;
      finScore = Math.round(score);
    }

    const result = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      safeToSpend,
      remainingBudgets,
      monthlyGoalContributions: totalGoalContributions, // Kept property name for frontend compatibility
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
      categoryBreakdown,
      transactionCount: transactions.length,
      finScore,
    };

    await this.redisService.set(cacheKey, result, 60);
    return result;
  }

  async getHistoryForAI(userId: string, days = 180) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const transactions = await this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.transaction_date >= :from', { from: from.toISOString().split('T')[0] })
      .orderBy('t.transaction_date', 'ASC')
      .getMany();

    return transactions.map((t) => ({
      date: t.transaction_date,
      amount: Number(t.amount),
      category: t.category?.name || 'Uncategorized',
      type: t.type,
    }));
  }

  async getHistoryWithIdsForAI(userId: string, days = 180) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const transactions = await this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.transaction_date >= :from', { from: from.toISOString().split('T')[0] })
      .orderBy('t.transaction_date', 'ASC')
      .getMany();

    return transactions.map((t) => ({
      id: t.id,
      date: t.transaction_date,
      amount: Number(t.amount),
      category: t.category?.name || 'Uncategorized',
      description: t.description || t.merchant || '',
      type: t.type,
    }));
  }

  async getDailyHistory(userId: string, days = 90) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.transaction_date', 'date')
      .addSelect('SUM(t.amount)', 'amount')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.type = :type', { type: 'EXPENSE' })
      .andWhere('t.transaction_date >= :from', { from: from.toISOString().split('T')[0] })
      .groupBy('t.transaction_date')
      .orderBy('t.transaction_date', 'ASC')
      .getRawMany();

    return rows.map((r) => ({ date: r.date, amount: Number(r.amount) }));
  }

  async remove(userId: string, id: string) {
    const result = await this.repo.delete({ id });
    await this.redisService.delPattern(`summary:${userId}:*`);
    return result;
  }
}