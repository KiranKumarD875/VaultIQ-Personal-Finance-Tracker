'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

export interface TrendPoint {
  date: string;
  actual?: number | null;
  predicted?: number | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl shadow-slate-200/50 min-w-[200px]">
        <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider mb-3">
          {label ? format(parseISO(label), 'MMM d, yyyy') : ''}
        </p>
        <div className="flex flex-col gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600 font-medium text-sm">{entry.name}</span>
              </div>
              <span className="font-bold text-slate-800">
                ₹{Number(entry.value).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendLineChart({ data }: { data: TrendPoint[] }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-slate-400">No data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#64748b' }} 
          dy={10} 
          tickFormatter={(val) => {
            try { return format(parseISO(val), 'MMM d'); } catch (e) { return val; }
          }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#64748b' }} 
          tickFormatter={(val) => `₹${val}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 500 }} />
        <Area type="monotone" dataKey="actual" name="Actual Spend" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" connectNulls={false} />
        <Area type="monotone" dataKey="predicted" name="AI Predicted" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" connectNulls={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}