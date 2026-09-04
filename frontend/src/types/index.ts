export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  description?: string;
  merchant?: string;
  transaction_date: string;
  category?: Category;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  safeToSpend: number;
  remainingBudgets: number;
  monthlyGoalContributions: number;
  savingsRate: number;
  categoryBreakdown: Record<string, number>;
  transactionCount: number;
  finScore?: number;
}

export interface DailyForecastPoint {
  date: string;
  amount: number;
}

export interface PredictionResult {
  predicted_amount: number;
  confidence: number;
  trend: string;
  model_used: string;
  category_breakdown: Record<string, number>;
  daily_forecast: DailyForecastPoint[];
  message?: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Budget {
  id: string;
  category?: Category;
  monthly_limit: number;
  month: number;
  year: number;
}

export interface RecurringSubscription {
  merchant: string;
  avg_amount: number;
  frequency_days: number;
  occurrences: number;
  last_seen: string;
  confidence: number;
}

export interface AnomalyFlag {
  id: string;
  date: string;
  amount: number;
  category?: string;
  severity: string;
  reason: string;
  z_score: number;
}