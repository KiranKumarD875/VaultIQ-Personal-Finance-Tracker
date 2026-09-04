import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { GoalsModule } from '../goals/goals.module';

@Module({
  imports: [TransactionsModule, BudgetsModule, GoalsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
