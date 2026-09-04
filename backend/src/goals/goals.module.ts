import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal]),
    TransactionsModule
  ],
  providers: [GoalsService],
  controllers: [GoalsController],
  exports: [GoalsService],
})
export class GoalsModule {}