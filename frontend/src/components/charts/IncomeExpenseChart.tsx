import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { MonthlyTrendItem } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface IncomeExpenseChartProps {
  data: MonthlyTrendItem[];
  height?: number;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data, height = 260 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl">
        <p className="text-xs text-slate-400">No monthly data available.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl shadow-md text-xs space-y-1">
          <p className="font-semibold text-slate-900">{label}</p>
          <div className="space-y-0.5 font-mono">
            <p className="text-emerald-600 font-medium">Income: {formatCurrency(payload[0]?.value || 0)}</p>
            <p className="text-rose-500 font-medium">Expense: {formatCurrency(payload[1]?.value || 0)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
