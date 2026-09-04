'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TrendLineChart, { TrendPoint } from '@/components/charts/TrendLineChart';
import { format, parseISO, isAfter, isSameDay } from 'date-fns';
import { Plus, Trash2, Zap, CalendarDays } from 'lucide-react';

interface HypotheticalEvent {
  id: string;
  name: string;
  eventDate: string; // From backend entity
  amount: number;
}

export default function SimulatorPage() {
  const [loading, setLoading] = useState(true);
  const [baselineForecast, setBaselineForecast] = useState<{ date: string; amount: number }[]>([]);
  const [events, setEvents] = useState<HypotheticalEvent[]>([]);
  const [newEvent, setNewEvent] = useState({ name: '', date: format(new Date(), 'yyyy-MM-dd'), amount: '' });

  const loadData = async () => {
    try {
      const [predRes, simRes] = await Promise.all([
        api.get('/predictions/expense?horizon=180'),
        api.get('/simulator')
      ]);
      setBaselineForecast(predRes.data.daily_forecast || []);
      setEvents(simRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date || !newEvent.amount) return;
    
    try {
      await api.post('/simulator', {
        name: newEvent.name,
        eventDate: newEvent.date,
        amount: Number(newEvent.amount)
      });
      setNewEvent({ ...newEvent, name: '', amount: '' });
      await loadData();
    } catch (err) {
      console.error('Failed to add scenario', err);
    }
  };

  const handleRemoveEvent = async (id: string) => {
    try {
      await api.delete(`/simulator/${id}`);
      await loadData();
    } catch (err) {
      console.error('Failed to remove scenario', err);
    }
  };

  // Generate chart data by combining baseline with events
  const chartData: TrendPoint[] = baselineForecast.map((bf) => {
    const bfDate = parseISO(bf.date);
    
    // Find all events that occur on or before this date to calculate cumulative impact
    const cumulativeImpact = events
      .filter((ev) => {
        const evDate = parseISO(ev.eventDate);
        return isSameDay(evDate, bfDate) || isAfter(bfDate, evDate);
      })
      .reduce((sum, ev) => sum + Number(ev.amount), 0);

    return {
      date: bf.date,
      actual: bf.amount, // This acts as the "Baseline" (renamed in chart Legend, but dataKey is actual)
      predicted: bf.amount + cumulativeImpact, // This acts as the "What-If Scenario"
    };
  });

  // Sort events by date for timeline
  const sortedEvents = [...events].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
            <Zap size={24} fill="currentColor" />
          </div>
          Cashflow Forecasting Simulator
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2 max-w-2xl">
          Inject hypothetical future purchases to see how they permanently impact your AI-predicted baseline cashflow. Discover if you can afford that new car or vacation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg shadow-slate-200/50 border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Inject "What-If" Scenario</h3>
            <form onSubmit={handleAddEvent} className="space-y-5">
              <div className="flex flex-col gap-1">
                <Input 
                  label="Event Name" 
                  value={newEvent.name} 
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} 
                  required 
                  placeholder="e.g. Buy a new Macbook"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Input 
                  label="Expected Date" 
                  type="date" 
                  value={newEvent.date} 
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1">
                <Input 
                  label="Expense Amount (₹)" 
                  type="number" 
                  step="0.01" 
                  value={newEvent.amount} 
                  onChange={(e) => setNewEvent({ ...newEvent, amount: e.target.value })} 
                  required 
                  placeholder="e.g. 150000"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 shadow-md font-bold">
                  <Plus size={18} /> Add to Simulation
                </Button>
              </div>
            </form>
          </Card>

          <Card className="shadow-lg shadow-slate-200/50 border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Scenario Timeline</h3>
            {sortedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <CalendarDays size={48} className="mb-3 opacity-20" />
                <p className="font-medium">No events injected yet.</p>
                <p className="text-xs mt-1">Add an event above to see the impact.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-primary-200 ml-3 pl-6 space-y-6">
                {sortedEvents.map((ev) => (
                  <div key={ev.id} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 bg-white border-4 border-primary-500 rounded-full group-hover:scale-125 group-hover:border-primary-600 transition-all shadow-sm" />
                    
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-slate-800">{ev.name}</p>
                          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mt-0.5">
                            {format(parseISO(ev.eventDate), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <button onClick={() => handleRemoveEvent(ev.id)} className="text-slate-300 hover:text-danger hover:bg-rose-50 p-1.5 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-3 p-2 bg-white rounded-xl border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-danger"></div>
                        <span className="font-black text-danger text-lg tracking-tight">₹{Number(ev.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px] shadow-lg shadow-slate-200/50 border-slate-200 flex flex-col">
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Cumulative Expense Trajectory</h3>
              <p className="text-sm text-slate-500 font-medium">6-Month AI Forecast vs Injected Scenarios</p>
            </div>
            {loading ? (
              <div className="flex-1 flex flex-col justify-center items-center text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4" />
                Generating AI Forecast...
              </div>
            ) : (
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0">
                  <TrendLineChart data={chartData} />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
