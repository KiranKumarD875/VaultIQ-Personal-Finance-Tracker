import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal) private repo: Repository<Goal>,
    private transactionsService: TransactionsService,
  ) {}

  create(userId: string, dto: CreateGoalDto) {
    const goal = this.repo.create({ ...dto, user_id: userId });
    return this.repo.save(goal);
  }

  findAll(userId: string) {
    return this.repo.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  async contribute(id: string, amount: number, userId: string) {
    const goal = await this.repo.findOne({ where: { id } });
    if (!goal) throw new NotFoundException('Goal not found');

    goal.current_amount = Number(goal.current_amount) + amount;
    if (goal.current_amount >= Number(goal.target_amount)) {
      goal.status = 'COMPLETED';
    }

    // Log the contribution as an EXPENSE transaction so it affects Safe to Spend
    await this.transactionsService.create(userId, {
      amount: amount,
      type: 'EXPENSE',
      description: `Contribution to goal: ${goal.name}`,
      merchant: 'VaultIQ Goals',
      transaction_date: new Date().toISOString().split('T')[0]
    });

    return this.repo.save(goal);
  }

  remove(id: string) {
    return this.repo.delete({ id });
  }
}