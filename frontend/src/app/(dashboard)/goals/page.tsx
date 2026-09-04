'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Goal, RecurringSubscription } from '@/types';
import { Target, Trash2, Rocket, Plus, PartyPopper } from 'lucide-react';
import clsx from 'clsx';

interface FormData {
  name: string;
  target_amount: number;
  target_date?: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeCustomInput, setActiveCustomInput] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const { register, handleSubmit, reset } = useForm<FormData>();

  const loadData = async () => {
    try {
      const [goalsRes, subsRes] = await Promise.all([
        api.get('/goals'),
        api.get('/predictions/recurring')
      ]);
      setGoals(goalsRes.data);
      setSubscriptions(subsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: FormData) => {
    await api.post('/goals', { ...data, target_amount: Number(data.target_amount) });
    reset();
    setShowForm(false);
    loadData();
  };

  const handleContribute = async (goalId: string, amount: number) => {
    if (!amount || amount <= 0) return;
    await api.patch(`/goals/${goalId}/contribute`, { amount });
    setActiveCustomInput(null);
    setCustomAmount('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/goals/${id}`);
    loadData();
  };

  // Find the active goal with the highest remaining amount
  const activeGoals = goals.filter(g => g.status !== 'COMPLETED');
  const primaryGoal = activeGoals.sort((a, b) => 
    (Number(b.target_amount) - Number(b.current_amount)) - (Number(a.target_amount) - Number(a.current_amount))
  )[0];

  // Find the highest cost subscription
  const highestSub = [...subscriptions].sort((a, b) => {
    const aMonthly = a.avg_amount * (30 / a.frequency_days);
    const bMonthly = b.avg_amount * (30 / b.frequency_days);
    return bMonthly - aMonthly;
  })[0];

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Savings Goals</h1>
          <p className="text-slate-500 font-medium text-sm mt-1 tracking-wide">Visualize and achieve your financial targets</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="shadow-md">
          {showForm ? 'Cancel' : '+ New Goal'}
        </Button>
      </div>

      {primaryGoal && highestSub && (
        <div className="mb-8 p-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-lg shadow-indigo-200/50">
          <div className="bg-white/90 backdrop-blur-md rounded-[22px] p-6 h-full w-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-md">
                <Rocket size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-1 tracking-tight">AI Turbo-Boost Recommendation</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  You have a recurring subscription for <strong className="text-slate-800">{highestSub.merchant}</strong> costing you ~₹{(highestSub.avg_amount * (30 / highestSub.frequency_days)).toFixed(2)}/mo. 
                  If you cancel this and redirect the funds, you will reach your <strong className="text-slate-800">{primaryGoal.name}</strong> goal 
                  <span className="font-bold text-indigo-600"> {( (Number(primaryGoal.target_amount) - Number(primaryGoal.current_amount)) / (highestSub.avg_amount * (30 / highestSub.frequency_days)) ).toFixed(1)} months faster!</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <Card className="mb-8 shadow-lg shadow-slate-200/50 border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="flex flex-col gap-1">
              <Input label="Goal Name" placeholder="e.g. Buy a Car" {...register('name', { required: true })} />
            </div>
            <div className="flex flex-col gap-1">
              <Input label="Target Amount" type="number" step="0.01" {...register('target_amount', { required: true })} />
            </div>
            <div className="flex flex-col gap-1">
              <Input label="Target Date (optional)" type="date" {...register('target_date')} />
            </div>
            <div className="md:col-span-3 pb-[2px]">
              <Button type="submit" className="w-full py-2.5 shadow-md text-base">Create Goal</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100);
          const isCompleted = goal.status === 'COMPLETED';

          return (
            <Card 
              key={goal.id} 
              className={clsx(
                "transition-all duration-300 rounded-3xl overflow-hidden relative",
                isCompleted ? "border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-50/30" : "shadow-md hover:shadow-lg border-slate-100"
              )}
            >
              {isCompleted && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-3 rounded-2xl text-white shadow-sm", isCompleted ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gradient-to-br from-primary-500 to-primary-600")}>
                    {isCompleted ? <PartyPopper size={20} /> : <Target size={20} />}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">{goal.name}</h3>
                </div>
                <button onClick={() => handleDelete(goal.id)} className="text-slate-300 hover:text-danger transition-colors p-2 hover:bg-rose-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-black text-slate-800 tracking-tight">₹{Number(goal.current_amount).toFixed(0)}</span>
                <span className="text-sm font-medium text-slate-400 mb-1">/ ₹{Number(goal.target_amount).toFixed(0)}</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 mb-6 shadow-inner overflow-hidden relative">
                <div
                  className={clsx('h-full rounded-full transition-all duration-1000 ease-out', isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-primary-500')}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {isCompleted ? (
                <div className="flex items-center justify-center gap-2 p-3 bg-emerald-100/50 rounded-xl text-emerald-700 font-bold">
                  <PartyPopper size={18} />
                  Goal Completed! Amazing Job!
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Contribute</p>
                  
                  {activeCustomInput === goal.id ? (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <input
                        type="number"
                        autoFocus
                        placeholder="Amount ₹"
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 font-medium text-slate-800 outline-none"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleContribute(goal.id, Number(customAmount));
                          if (e.key === 'Escape') setActiveCustomInput(null);
                        }}
                      />
                      <Button onClick={() => handleContribute(goal.id, Number(customAmount))} className="shadow-sm">Add</Button>
                      <Button variant="secondary" onClick={() => setActiveCustomInput(null)} className="px-3">✕</Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleContribute(goal.id, 500)}
                        className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-sm rounded-lg transition-colors border border-primary-100"
                      >
                        +₹500
                      </button>
                      <button 
                        onClick={() => handleContribute(goal.id, 1000)}
                        className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-sm rounded-lg transition-colors border border-primary-100"
                      >
                        +₹1k
                      </button>
                      <button 
                        onClick={() => handleContribute(goal.id, 5000)}
                        className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold text-sm rounded-lg transition-colors border border-primary-100"
                      >
                        +₹5k
                      </button>
                      <button 
                        onClick={() => setActiveCustomInput(goal.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-lg transition-colors border border-slate-200 flex items-center gap-1"
                      >
                        <Plus size={14} /> Custom
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4 shadow-inner">
              <Target size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Goals Set</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-6">Dreaming of a vacation or a new gadget? Set a savings goal and track your progress.</p>
            <Button onClick={() => setShowForm(true)} className="shadow-md px-8 rounded-full">
              Create First Goal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}