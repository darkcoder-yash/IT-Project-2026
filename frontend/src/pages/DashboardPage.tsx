import React, { useState } from 'react';
import { DashboardSummary } from '../types/finance';
import { MetricCard } from '../components/dashboard/MetricCard';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { CategoryChart } from '../components/charts/CategoryChart';
import { InsightCard } from '../components/dashboard/InsightCard';
import { AnomalyAlertCard } from '../components/dashboard/AnomalyAlertCard';
import { HealthIndicatorCard } from '../components/dashboard/HealthIndicatorCard';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { formatCurrency } from '../utils/formatters';
import { DollarSign, CreditCard, PiggyBank, Calendar, BarChart3, TrendingUp, Sparkles } from 'lucide-react';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  loading,
  onOpenAddModal,
  onOpenImportModal,
}) => {
  const [chartView, setChartView] = useState<'cashflow' | 'trend'>('cashflow');

  if (loading || !summary) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading overview...</p>
      </div>
    );
  }

  const { totals, month_over_month, monthly_trend, category_distribution, recent_transactions, insights, anomalies, health } = summary;

  if (totals.total_transactions === 0) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl max-w-md mx-auto my-16 space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">No Transactions Yet</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Record an income or expense transaction to unlock real-time financial metrics.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
          >
            Add Transaction
          </button>
          <button
            onClick={onOpenImportModal}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Import CSV
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. Summary KPI Grid: 4 Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Income"
          value={formatCurrency(totals.total_income)}
          subtitle="All income recorded"
          icon={DollarSign}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <MetricCard
          title="Total Expenses"
          value={formatCurrency(totals.total_expense)}
          trend={month_over_month.has_sufficient_data ? {
            value: month_over_month.percentage_change,
            label: 'vs last mo',
            isIncreaseBad: true
          } : undefined}
          icon={CreditCard}
          iconBgColor="bg-rose-50 text-rose-600"
        />

        <MetricCard
          title="Net Savings"
          value={formatCurrency(totals.total_savings)}
          subtitle={`${totals.savings_rate.toFixed(1)}% savings rate`}
          icon={PiggyBank}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />

        <MetricCard
          title="Daily Average"
          value={formatCurrency(totals.daily_avg_expense)}
          subtitle={`Across ${totals.unique_expense_days} active days`}
          icon={Calendar}
          iconBgColor="bg-sky-50 text-sky-600"
        />
      </div>

      {/* 2. Charts Section: Cash Flow & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cash Flow / Trajectory Toggle Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Cash Flow & Trajectory</h2>
              <p className="text-xs text-slate-400">Monthly breakdown and savings path</p>
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium">
              <button
                onClick={() => setChartView('cashflow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'cashflow'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Cash Flow</span>
              </button>
              <button
                onClick={() => setChartView('trend')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'trend'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Trajectory</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            {chartView === 'cashflow' ? (
              <IncomeExpenseChart data={monthly_trend} height={240} />
            ) : (
              <MonthlyTrendChart data={monthly_trend} height={240} />
            )}
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs lg:col-span-5 flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Spending by Category</h2>
            <p className="text-xs text-slate-400">Proportional category distribution</p>
          </div>
          <CategoryChart data={category_distribution} height={200} showCategoryList={true} />
        </div>
      </div>

      {/* 3. Activity & Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-7">
          <RecentTransactions transactions={recent_transactions} />
        </div>

        {/* Intelligence Column: Health + Anomaly/Insights */}
        <div className="lg:col-span-5 space-y-6">
          <HealthIndicatorCard health={health} />

          {anomalies.length > 0 ? (
            <AnomalyAlertCard anomalies={anomalies} />
          ) : (
            <InsightCard insights={insights.slice(0, 2)} />
          )}
        </div>
      </div>
    </div>
  );
};
