import React, { useState, useEffect } from 'react';
import { fetchCategoryAnalytics } from '../services/api';
import { CategoryDistribution, Transaction } from '../types/finance';
import { CategoryChart } from '../components/charts/CategoryChart';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';
import { PieChart, BarChart2, Layers, Award, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<{
    highest_category: { category: string; total: number; percentage: number };
    distribution: CategoryDistribution[];
    frequency: { category: string; count: number }[];
    top_5_expenses: Transaction[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategoryAnalytics({ month: selectedMonth || undefined });
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load category analytics', err);
      setError('Unable to load analytics data from backend. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-500">Aggregating category statistics with Pandas...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
        <p className="text-sm font-semibold text-rose-800">{error || 'Failed to load category data.'}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const { distribution, frequency, top_5_expenses } = analytics;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Category Spending Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Deep-dive category proportions, frequency & top expenses</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="glass-input text-xs bg-white border-slate-200 text-slate-700"
          >
            <option value="">All Time</option>
            <option value="2026-12">December 2026</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-04">April 2026</option>
            <option value="2026-03">March 2026</option>
            <option value="2026-02">February 2026</option>
            <option value="2026-01">January 2026</option>
          </select>
        </div>
      </div>

      {/* Row 1: Charts (Expense by Category Bar & Distribution Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Expense Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Expense Total by Category</h3>
              <p className="text-[11px] text-slate-500">Summed category spending</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} width={85} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), 'Total Expense']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="total" fill="#4f46e5" radius={[0, 6, 6, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center border border-sky-100">
              <PieChart className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Proportions</h3>
              <p className="text-[11px] text-slate-500">Percentage share of total expense</p>
            </div>
          </div>

          <CategoryChart data={distribution} height={280} />
        </div>
      </div>

      {/* Row 2: Top Spending Categories Table & Top 5 Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranked Category Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ranked Category Spending</h3>
              <p className="text-[11px] text-slate-500">Sorted from highest total spend</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Total Expense</th>
                  <th className="py-2.5 px-3 text-right">% of Total</th>
                  <th className="py-2.5 px-3 text-center">Tx Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {distribution.map((item, idx) => (
                  <tr key={item.category} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-slate-400">#{idx + 1}</td>
                    <td className="py-3 px-3 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: getCategoryColor(item.category) }}
                      />
                      <span className="font-bold text-slate-900">{item.category}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(item.total)}</td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-600 font-semibold">{item.percentage.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Transactions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center border border-rose-100">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top 5 Expenses</h3>
              <p className="text-[11px] text-slate-500">Single largest purchases</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {top_5_expenses.map((tx, idx) => (
              <div key={tx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold font-mono text-rose-600 w-5">#{idx + 1}</span>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">{tx.description || tx.category}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">{formatDate(tx.date)} • {tx.category}</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-slate-900">{formatCurrency(tx.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Transaction Frequency Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Category Transaction Frequency</h3>
            <p className="text-[11px] text-slate-500">Number of transactions logged per category</p>
          </div>
        </div>

        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={frequency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [val, 'Transactions']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
