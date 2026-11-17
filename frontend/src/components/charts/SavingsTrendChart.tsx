import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { MonthlyTrendItem } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface SavingsTrendChartProps {
  data: MonthlyTrendItem[];
  height?: number;
}

export const SavingsTrendChart: React.FC<SavingsTrendChartProps> = ({ data, height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
        <p className="text-xs text-slate-400">No savings trend available.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-md text-xs space-y-1">
          <p className="font-bold text-slate-900">{label}</p>
          <p className="text-indigo-600 font-mono font-medium">Net Savings: {formatCurrency(payload[0].value)}</p>
          <p className="text-slate-500 font-mono font-medium">Savings Rate: {payload[0].payload.savings_rate}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsColorLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="savings" name="Savings" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#savingsColorLight)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
