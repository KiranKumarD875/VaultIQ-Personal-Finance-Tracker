'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'];

export default function CategoryPieChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-64 text-slate-400">No data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie 
          data={chartData} 
          dataKey="value" 
          nameKey="name" 
          cx="50%" 
          cy="50%" 
          innerRadius={65}
          outerRadius={90} 
          paddingAngle={3}
          stroke="none"
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          itemStyle={{ color: '#334155', fontWeight: 500 }}
          formatter={(value: number) => `₹${value.toFixed(2)}`} 
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}