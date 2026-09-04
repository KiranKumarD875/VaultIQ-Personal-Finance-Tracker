'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getCategoryIcon } from '@/lib/icons';
import { Budget, Category, Summary } from '@/types';
import { Trash2, Sparkles, ArrowRightLeft, Target } from 'lucide-react';
import clsx from 'clsx';

interface FormData {
  category_id: string;
  monthly_limit: number;
}

const now = new Date();

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const { register, handleSubmit, reset } = useForm<FormData>();

  const loadData = async () => {
    const [budgetsRes, categoriesRes, summaryRes] = await Promise.all([
      api.get(`/budgets?month=${month}&year=${year}`),
      api.get('/categories'),
      api.get(`/transactions/summary?month=${month}&year=${year}`),
    ]);
    setBudgets(budgetsRes.data);
    setCategories(categoriesRes.data.filter((c: Category) => c.type === 'EXPENSE'));
    setSummary(summaryRes.data);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: FormData) => {
    await api.post('/budgets', { ...data, monthly_limit: Number(data.monthly_limit), month, year });
    reset();
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/budgets/${id}`);
    loadData();
  };

  // AI Rebalance Logic
  const overBudget = budgets.filter(b => (summary?.categoryBreakdown[b.category?.name || ''] || 0) > Number(b.monthly_limit));
  const underBudget = budgets.filter(b => (summary?.categoryBreakdown[b.category?.name || ''] || 0) < Number(b.monthly_limit));

  const totalDeficit = overBudget.reduce((sum, b) => {
    const spent = summary?.categoryBreakdown[b.category?.name || ''] || 0;
    return sum + (spent - Number(b.monthly_limit));
  }, 0);

  const handleRebalance = async () => {
    if (overBudget.length === 0 || underBudget.length === 0) return;
    setIsRebalancing(true);

    try {
      let remainingDeficitToFix = totalDeficit;

      // Increase over-budget categories to match their spent amount
      for (const b of overBudget) {
        const spent = summary?.categoryBreakdown[b.category?.name || ''] || 0;
        await api.patch(`/budgets/${b.id}`, { monthly_limit: spent });
      }

      // Decrease under-budget categories to offset the deficit
      for (const b of underBudget) {
        if (remainingDeficitToFix <= 0) break;
        
        const spent = summary?.categoryBreakdown[b.category?.name || ''] || 0;
        const limit = Number(b.monthly_limit);
        const surplus = limit - spent;
        
        const amountToTake = Math.min(surplus, remainingDeficitToFix);
        const newLimit = limit - amountToTake;
        
        await api.patch(`/budgets/${b.id}`, { monthly_limit: newLimit });
        remainingDeficitToFix -= amountToTake;
      }

      await loadData();
    } catch (err) {
      console.error('Failed to rebalance', err);
    } finally {
      setIsRebalancing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Monthly Budgets</h1>
          <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-wider">{new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="shadow-md">
          {showForm ? 'Cancel' : '+ Set Budget'}
        </Button>
      </div>

      {overBudget.length > 0 && underBudget.length > 0 && (
        <Card className="mb-8 border-indigo-200 bg-indigo-50/50 shadow-inner">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Sparkles size={18} />
                <h3 className="font-bold tracking-tight">AI Smart Rebalance Available</h3>
              </div>
              <p className="text-sm text-indigo-900/70 font-medium">
                You are over budget in <span className="font-bold text-indigo-900">{overBudget.length} category</span> by ₹{totalDeficit.toFixed(2)}. 
                I can automatically reallocate funds from your under-budget categories to balance your limits without increasing your total overall budget.
              </p>
            </div>
            <Button onClick={handleRebalance} disabled={isRebalancing} className="whitespace-nowrap flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
              <ArrowRightLeft size={16} />
              {isRebalancing ? 'Rebalancing...' : '1-Click Rebalance'}
            </Button>
          </div>
        </Card>
      )}

      {showForm && (
        <Card className="mb-8 shadow-lg shadow-slate-200/50 border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select {...register('category_id', { required: true })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-medium text-slate-800">
                <option value="">-- Select --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Input label="Monthly Limit" type="number" step="0.01" {...register('monthly_limit', { required: true })} />
            </div>
            <div className="pb-[2px]">
              <Button type="submit" className="w-full py-2.5 shadow-md">Save Budget</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const categoryName = budget.category?.name || 'Uncategorized';
          const spent = summary?.categoryBreakdown[categoryName] || 0;
          const percent = Math.min(100, (spent / Number(budget.monthly_limit)) * 100);
          const isOver = spent > Number(budget.monthly_limit);
          const isUrgent = percent >= 90;

          return (
            <Card 
              key={budget.id} 
              className={clsx(
                "transition-all duration-300 rounded-3xl",
                isUrgent ? "border-danger/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-[pulse_3s_ease-in-out_infinite]" : "shadow-md hover:shadow-lg border-slate-100"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2.5 rounded-xl text-white shadow-sm", isUrgent ? "bg-danger" : "bg-primary-500")}>
                    {getCategoryIcon(categoryName, 20)}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">{categoryName}</h3>
                </div>
                <button onClick={() => handleDelete(budget.id)} className="text-slate-300 hover:text-danger transition-colors p-2 hover:bg-rose-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-black text-slate-800 tracking-tight">₹{spent.toFixed(0)}</span>
                <span className="text-sm font-medium text-slate-400 mb-1">/ ₹{Number(budget.monthly_limit).toFixed(0)}</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 mb-2 shadow-inner overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-1000', isOver ? 'bg-danger' : percent > 80 ? 'bg-warning' : 'bg-emerald-400')}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {isOver ? (
                <p className="text-danger text-xs font-bold tracking-wide uppercase mt-3">⚠️ Over budget by ₹{(spent - Number(budget.monthly_limit)).toFixed(0)}</p>
              ) : isUrgent ? (
                <p className="text-warning text-xs font-bold tracking-wide uppercase mt-3">⚠️ Almost empty</p>
              ) : null}
            </Card>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4 shadow-inner">
              <Target size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Budgets Set</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-6">Take control of your spending by setting limits for your favorite categories.</p>
            <Button onClick={() => setShowForm(true)} className="shadow-md px-8 rounded-full">
              Create First Budget
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}