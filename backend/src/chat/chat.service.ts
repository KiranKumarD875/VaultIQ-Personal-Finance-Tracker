import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from '../transactions/transactions.service';
import { BudgetsService } from '../budgets/budgets.service';
import { GoalsService } from '../goals/goals.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
    private readonly goalsService: GoalsService,
    private readonly configService: ConfigService,
  ) {}

  async processMessage(userId: string, message: string, history: any[] = []): Promise<{ text: string }> {
    try {
      // 1. Get transaction history context
      const txnHistory = await this.transactionsService.getHistoryForAI(userId, 30);
      const context_data = txnHistory.map(t => `On ${t.date}, I had an ${t.type.toLowerCase()} of ₹${t.amount} for ${t.category}.`);
      
      // Inject current summary metrics
      const now = new Date();
      const summary: any = await this.transactionsService.getSummary(userId, now.getMonth() + 1, now.getFullYear());
      context_data.push(`My current safe-to-spend balance is ₹${summary.safeToSpend || 0}.`);
      context_data.push(`My total expenses this month are ₹${summary.totalExpense || 0}.`);
      context_data.push(`My total income this month is ₹${summary.totalIncome || 0}.`);
      context_data.push(`My total locked in budgets amount is ₹${summary.remainingBudgets || 0}.`);
      context_data.push(`My total goal savings amount is ₹${summary.monthlyGoalContributions || 0}.`);
      context_data.push(`My current FinScore (Financial Score) is ${summary.finScore || 500} out of 1000.`);
      
      if (summary.categoryBreakdown) {
        for (const [category, amount] of Object.entries(summary.categoryBreakdown)) {
          context_data.push(`My spending on ${category} is ₹${amount}.`);
        }
      }

      // Budget context
      try {
        const budgets = await this.budgetsService.findAll(userId, now.getMonth() + 1, now.getFullYear());
        if (budgets && budgets.length > 0) {
          for (const budget of budgets) {
            const catName = budget.category ? budget.category.name : 'General';
            context_data.push(`I have a budget limit of ₹${budget.monthly_limit} for ${catName}.`);
          }
        }
      } catch (err) {
        console.error('Failed to load budgets for AI context', err);
      }
      
      // Goals context
      try {
        const goals = await this.goalsService.findAll(userId);
        if (goals && goals.length > 0) {
          for (const goal of goals) {
            context_data.push(`I have a savings goal called "${goal.name}" with a target of ₹${goal.target_amount} and I have saved ₹${goal.current_amount} so far.`);
          }
        }
      } catch (err) {
        console.error('Failed to load goals for AI context', err);
      }
      
      // 2. Call AI service — uses AI_SERVICE_URL env var so it works both locally (Docker) and on Render
      const aiServiceUrl = this.configService.get<string>('aiServiceUrl') || 'http://ai-service:8000';
      const aiResponse = await fetch(`${aiServiceUrl}/api/v1/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message,
          context_data: context_data,
          history: history,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI Service returned ${aiResponse.status}`);
      }

      const data = await aiResponse.json();
      return { text: data.response };
    } catch (error) {
      console.error('Error calling AI service:', error);
      return { text: 'VaultMind is temporarily unreachable. Please check that the AI service is running and try again.' };
    }
  }
}
