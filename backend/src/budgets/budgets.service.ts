import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget) private repo: Repository<Budget>,
    private redisService: RedisService,
  ) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const budget = this.repo.create({ ...dto, user_id: userId });
    const saved = await this.repo.save(budget);
    await this.redisService.delPattern(`summary:${userId}:*`);
    return saved;
  }

  async update(id: string, updateData: Partial<CreateBudgetDto>, userId: string) {
    await this.repo.update({ id, user_id: userId }, updateData);
    await this.redisService.delPattern(`summary:${userId}:*`);
    return this.repo.findOne({ where: { id } });
  }

  findAll(userId: string, month?: number, year?: number) {
    const where: any = { user_id: userId };
    if (month) where.month = month;
    if (year) where.year = year;
    return this.repo.find({ where, relations: ['category'] });
  }

  async remove(id: string, userId: string) {
    const result = await this.repo.delete({ id, user_id: userId });
    await this.redisService.delPattern(`summary:${userId}:*`);
    return result;
  }
}