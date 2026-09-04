'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import TrendLineChart, { TrendPoint } from '@/components/charts/TrendLineChart';
import FinScoreGauge from '@/components/ui/FinScoreGauge';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { getCategoryIcon } from '@/lib/icons';
import { Summary, PredictionResult, Transaction } from '@/types';
import { TrendingUp, TrendingDown, Target, Lock, History } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Local state for Mini Ledger Widget
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerLimit, setLedgerLimit] = useState(5);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, predictionRes, dailyRes, txRes] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/predictions/expense'),
          api.get('/transactions/daily-history?days=60'),
          api.get('/transactions?limit=50') // Fetch up to 50 for local filtering/pagination
        ]);

        setSummary(summaryRes.data);
        setPrediction(predictionRes.data);
        setRecentTransactions(txRes.data.data || txRes.data);

        const actualPoints: TrendPoint[] = dailyRes.data.map((d: any) => ({
          date: d.date,
          actual: d.amount,
          predicted: null,
        }));

        const forecast = predictionRes.data.daily_forecast || [];
        const predictedPoints: TrendPoint[] = forecast.map((f: any) => ({
          date: f.date,
          actual: null,
          predicted: f.amount,
        }));

        setTrendData([...actualPoints, ...predictedPoints]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }
  const finScore = summary?.finScore || 500;

  // Local filtering for Mini Ledger
  const filteredLedger = recentTransactions
    .filter(tx => {
      const q = ledgerSearch.toLowerCase();
      if (!q) return true;
      return (
        tx.merchant?.toLowerCase().includes(q) ||
        tx.description?.toLowerCase().includes(q) ||
        tx.category?.name.toLowerCase().includes(q)
      );
    })
    .slice(0, ledgerLimit);

  return (
    <div className="min-h-screen">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20" />
      
      <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg shadow-indigo-100/50 rounded-2xl border border-white/50 backdrop-blur-md bg-white/70 hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-xs tracking-wider uppercase">Total Income</h3>
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm"><TrendingUp size={18} strokeWidth={2.5} /></div>
          </div>
          <p className="text-3xl font-black text-slate-800">
            <AnimatedCounter prefix="₹" value={summary?.totalIncome || 0} />
          </p>
        </Card>

        <Card className="shadow-lg shadow-rose-100/50 rounded-2xl border border-white/50 backdrop-blur-md bg-white/70 hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-xs tracking-wider uppercase">Total Expense</h3>
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shadow-sm"><TrendingDown size={18} strokeWidth={2.5} /></div>
          </div>
          <p className="text-3xl font-black text-slate-800">
            <AnimatedCounter prefix="₹" value={summary?.totalExpense || 0} />
          </p>
        </Card>

        <Card className="shadow-lg shadow-amber-100/50 rounded-2xl border border-white/50 backdrop-blur-md bg-white/70 hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-xs tracking-wider uppercase">Locked in Budgets</h3>
            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl shadow-sm"><Lock size={18} strokeWidth={2.5} /></div>
          </div>
          <p className="text-3xl font-black text-slate-800">
            <AnimatedCounter prefix="₹" value={summary?.remainingBudgets || 0} />
          </p>
        </Card>

        <Card className="shadow-lg shadow-indigo-100/50 rounded-2xl border border-white/50 backdrop-blur-md bg-white/70 hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-xs tracking-wider uppercase">Total Goal Savings</h3>
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm"><Target size={18} strokeWidth={2.5} /></div>
          </div>
          <p className="text-3xl font-black text-slate-800">
            <AnimatedCounter prefix="₹" value={summary?.monthlyGoalContributions || 0} />
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 text-white shadow-2xl shadow-indigo-900/20 rounded-3xl border-none p-8 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-6">
              <div>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Safe to Spend</p>
                <h2 className="text-6xl font-black tracking-tighter text-white drop-shadow-md">
                  <AnimatedCounter prefix="₹" value={summary?.safeToSpend || 0} />
                </h2>
                <p className="text-slate-300 text-sm mt-4 font-medium max-w-sm leading-relaxed">
                  True available cash remaining after deducting your active budgets. Goal contributions are tracked as expenses.
                </p>
              </div>
              <div className="flex-shrink-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl px-6 py-4">
                <FinScoreGauge score={finScore} />
              </div>
            </div>
            
            <div className="mt-8 relative z-10">
              <div className="h-4 bg-white/10 rounded-full flex overflow-hidden shadow-inner p-0.5">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, ((summary?.totalExpense ?? 0) / (summary?.totalIncome || 1)) * 100)}%` }} 
                  title={`Spent: ₹${summary?.totalExpense?.toFixed(2)}`}
                />
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-1000 ml-1" 
                  style={{ width: `${Math.min(100, ((summary?.remainingBudgets ?? 0) / (summary?.totalIncome || 1)) * 100)}%` }}
                  title={`Locked: ₹${(summary?.remainingBudgets ?? 0).toFixed(2)}`}
                />
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ml-1" 
                  style={{ width: `${Math.min(100, ((summary?.safeToSpend ?? 0) / (summary?.totalIncome || 1)) * 100)}%` }}
                  title={`Safe: ₹${summary?.safeToSpend?.toFixed(2)}`}
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-400 mt-3 px-1">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> Spent</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /> Locked</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Safe</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Mini Ledger Widget */}
        <div className="lg:col-span-1">
          <Card className="h-full shadow-lg shadow-slate-200/50 rounded-3xl border border-white/60 backdrop-blur-md bg-white/60 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <History className="text-primary-500" size={20} strokeWidth={2} />
                Recent Activity
              </h3>
            </div>
            
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Search category or merchant..." 
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
              />
            </div>
            
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
              {filteredLedger.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                      {getCategoryIcon(tx.category?.name || '', 18)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{tx.merchant || tx.description || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 font-medium">{format(new Date(tx.transaction_date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${tx.type === 'EXPENSE' ? 'text-slate-800' : 'text-emerald-600'}`}>
                    {tx.type === 'EXPENSE' ? '-' : '+'}₹{Number(tx.amount).toFixed(0)}
                  </div>
                </div>
              ))}
              {filteredLedger.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                  <div className="p-4 bg-slate-100 rounded-full mb-3"><History size={24} /></div>
                  <p>No transactions match</p>
                </div>
              )}
            </div>
            
            {ledgerLimit < recentTransactions.length && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setLedgerLimit(prev => prev + 5)}
                  className="text-primary-600 hover:text-primary-700 hover:underline text-sm font-semibold transition-colors"
                >
                  Load more history
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card className="mb-6 shadow-lg shadow-slate-200/50 rounded-3xl border border-white/60 backdrop-blur-md bg-white/60">
        <h3 className="font-bold text-slate-800 mb-6">Spending Trend: Actual vs. AI Predicted</h3>
        <TrendLineChart data={trendData} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg shadow-slate-200/50 rounded-3xl border border-white/60 backdrop-blur-md bg-white/60">
          <h3 className="font-bold text-slate-800 mb-6">Spending by Category</h3>
          <CategoryPieChart data={summary?.categoryBreakdown || {}} />
        </Card>

        <Card className="shadow-lg shadow-slate-200/50 rounded-3xl border border-white/60 backdrop-blur-md bg-white/60">
          <h3 className="font-bold text-slate-800 mb-6">Predicted Category Breakdown (Next 30 Days)</h3>
          <CategoryPieChart data={prediction?.category_breakdown || {}} />
        </Card>
      </div>
    </div>
  );
}