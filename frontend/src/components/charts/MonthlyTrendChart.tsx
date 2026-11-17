import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { MonthlyTrendItem } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface MonthlyTrendChartProps {
  data: MonthlyTrendItem[];
  height?: number;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data, height = 260 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl">
        <p className="text-xs text-slate-400">No trend data available.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl shadow-md text-xs space-y-1">
          <p className="font-semibold text-slate-900">{label}</p>
          <div className="space-y-0.5 font-mono">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="font-medium">
                {entry.name}: {formatCurrency(entry.value)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
          <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="savings" name="Net Savings" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
