import React, { useState, useEffect } from 'react';
import { fetchMonthlyAnalytics, fetchSpendingHeatmap } from '../services/api';
import { MonthlyTrendItem, MonthOverMonth, HeatmapData } from '../types/finance';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { SavingsTrendChart } from '../components/charts/SavingsTrendChart';
import { HeatmapGrid } from '../components/charts/HeatmapGrid';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, Flame, Award, Calendar, DollarSign } from 'lucide-react';

export const MonthlyTrendsPage: React.FC = () => {
  const [data, setData] = useState<{
    monthly_series: MonthlyTrendItem[];
    month_over_month: MonthOverMonth;
    highlights: {
      highest_spending_month: MonthlyTrendItem | null;
      lowest_spending_month: MonthlyTrendItem | null;
      best_savings_month: MonthlyTrendItem | null;
      worst_savings_month: MonthlyTrendItem | null;
    };
  } | null>(null);

  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [monthlyRes, heatmapRes] = await Promise.all([
        fetchMonthlyAnalytics(),
        fetchSpendingHeatmap()
      ]);
      setData(monthlyRes);
      setHeatmap(heatmapRes);
    } catch (err) {
      console.error('Failed to load monthly analytics', err);
      setError('Unable to load monthly trends from backend. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-500">Computing monthly time-series & spending heatmap matrix...</p>
      </div>
    );
  }

  if (error || !data || !heatmap) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
        <p className="text-sm font-semibold text-rose-800">{error || 'Failed to load trend data.'}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const { monthly_series, month_over_month, highlights } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Monthly Trends & Heatmaps</h2>
        <p className="text-xs text-slate-500 mt-0.5">Time-series trajectories, MoM changes, and day-of-week spending density</p>
      </div>

      {/* Row 1: MoM Change Callout & Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* MoM Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Month-over-Month Change</span>
            <span className="text-xs font-mono text-slate-400">{month_over_month.current_month} vs {month_over_month.previous_month}</span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 font-mono">{formatCurrency(month_over_month.current_expense)}</h3>
              {month_over_month.has_sufficient_data && (
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                  month_over_month.percentage_change > 0
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {month_over_month.percentage_change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{month_over_month.percentage_change > 0 ? '+' : ''}{month_over_month.percentage_change.toFixed(1)}%</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {month_over_month.has_sufficient_data
                ? `Difference of ${formatCurrency(month_over_month.diff_amount)} compared with previous month (${formatCurrency(month_over_month.previous_expense)}).`
                : 'Insufficient multi-month data to calculate MoM percentage change.'}
            </p>
          </div>
        </div>

        {/* Highlights Cards */}
        {highlights.highest_spending_month && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Peak Expense Month</span>
              <Flame className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">{highlights.highest_spending_month.month}</h4>
              <p className="text-xs text-rose-700 font-mono font-bold mt-0.5">{formatCurrency(highlights.highest_spending_month.expense)}</p>
            </div>
          </div>
        )}

        {highlights.lowest_spending_month && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Lowest Expense Month</span>
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">{highlights.lowest_spending_month.month}</h4>
              <p className="text-xs text-emerald-700 font-mono font-bold mt-0.5">{formatCurrency(highlights.lowest_spending_month.expense)}</p>
            </div>
          </div>
        )}

        {highlights.best_savings_month && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Best Savings Month</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">{highlights.best_savings_month.month}</h4>
              <p className="text-xs text-indigo-700 font-mono font-bold mt-0.5">{formatCurrency(highlights.best_savings_month.savings)} ({highlights.best_savings_month.savings_rate.toFixed(0)}%)</p>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Charts (Monthly Trend & Savings Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Income vs Expenses Trajectory</h3>
              <p className="text-[11px] text-slate-500">Line chart trajectory over time</p>
            </div>
          </div>
          <MonthlyTrendChart data={monthly_series} height={260} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Net Savings Accumulation Trend</h3>
              <p className="text-[11px] text-slate-500">Monthly surplus and savings rate</p>
            </div>
          </div>
          <SavingsTrendChart data={monthly_series} height={260} />
        </div>
      </div>

      {/* Row 3: Heatmap Grid */}
      <HeatmapGrid data={heatmap} />
    </div>
  );
};
