import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { BudgetsService } from '../budgets/budgets.service';
import { GoalsService } from '../goals/goals.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
    private readonly goalsService: GoalsService,
  ) {}

  async processMessage(userId: string, message: string, history: any[] = []): Promise<{ text: string }> {
    try {
      // 1. Get transaction history context
      const txnHistory = await this.transactionsService.getHistoryForAI(userId, 30);
      const context_data = txnHistory.map(t => `On ${t.date}, I had an ${t.type.toLowerCase()} of ₹${t.amount} for ${t.category}.`);
      
      // Also inject current safe-to-spend and finScore
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
          context_data.push(`My total expenses for ${category} this month are ₹${amount}.`);
        }
      }

      // 1.5 Get budget context
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
      
      // 1.8 Get goals context
      try {
        const goals = await this.goalsService.findAll(userId);
        if (goals && goals.length > 0) {
          for (const goal of goals) {
            context_data.push(`I have a savings goal called "${goal.name}" with a target amount of ₹${goal.target_amount} and I have currently saved ₹${goal.current_amount}.`);
          }
        }
      } catch (err) {
        console.error('Failed to load goals for AI context', err);
      }
      
      // 2. Call local Python RAG LLM
      const aiResponse = await fetch('http://ai-service:8000/api/v1/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Error calling local RAG LLM:', error);
      return { text: 'Sorry, my local LLM is still loading or currently unavailable. Please try again in a moment!' };
    }
  }
}
