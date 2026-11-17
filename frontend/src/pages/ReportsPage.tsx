import React, { useState, useEffect } from 'react';
import { fetchReportSummary, getCSVExportUrl, getHeatmapImageUrl } from '../services/api';
import { ReportSummary } from '../types/finance';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';
import { FileText, Download, Image as ImageIcon, Calendar, Award, ShieldAlert, X } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSeabornModal, setShowSeabornModal] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReportSummary({ month: selectedMonth || undefined });
      setReport(data);
    } catch (err) {
      console.error('Failed to load financial report', err);
      setError('Unable to load report from backend. Please ensure the backend is running.');
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
        <p className="text-xs font-medium text-slate-500">Generating structured financial report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
        <p className="text-sm font-semibold text-rose-800">{error || 'Failed to generate report.'}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const { totals, highest_spending_category, category_distribution, largest_expenses, month_over_month, anomalies, health } = report;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Structured Financial Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit, summary metrics, and analytics export</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Filter */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="glass-input text-xs bg-white border-slate-200 text-slate-700"
            >
              <option value="">All Time Report</option>
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

          {/* Seaborn Heatmap Image View Button */}
          <button
            onClick={() => setShowSeabornModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            Seaborn Heatmap Image
          </button>

          {/* Download CSV Export */}
          <a
            href={getCSVExportUrl(selectedMonth || undefined)}
            download
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV Summary
          </a>
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-8 shadow-sm">
        {/* Document Header */}
        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">PERSONAL FINANCIAL REPORT</h1>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">{report.period_label}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-mono">Generated: {new Date().toLocaleDateString()}</span>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded text-xs font-semibold ${
              health.overall_status === 'Healthy'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              Overall Health: {health.overall_status}
            </span>
          </div>
        </div>

        {/* Section 1: Financial Summary Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Summary Financial Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500">Total Income</span>
              <p className="text-lg font-bold text-emerald-600 font-mono mt-1">{formatCurrency(totals.total_income)}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500">Total Expenses</span>
              <p className="text-lg font-bold text-rose-600 font-mono mt-1">{formatCurrency(totals.total_expense)}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500">Net Savings</span>
              <p className="text-lg font-bold text-indigo-600 font-mono mt-1">{formatCurrency(totals.total_savings)}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500">Savings Rate</span>
              <p className="text-lg font-bold text-slate-900 font-mono mt-1">{totals.savings_rate.toFixed(1)}%</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500">Daily Avg Expense</span>
              <p className="text-lg font-bold text-slate-900 font-mono mt-1">{formatCurrency(totals.daily_avg_expense)}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Key Analytics Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-500">Highest Spending Category</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{highest_spending_category.category}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(highest_spending_category.total)} ({highest_spending_category.percentage.toFixed(1)}% of total)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-500">Monthly Expense Change</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {month_over_month.has_sufficient_data
                  ? `${month_over_month.percentage_change > 0 ? '+' : ''}${month_over_month.percentage_change.toFixed(1)}% vs previous`
                  : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {month_over_month.has_sufficient_data
                  ? `${formatCurrency(month_over_month.current_expense)} vs ${formatCurrency(month_over_month.previous_expense)}`
                  : 'Single month evaluation'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-500">Unusual Expenses Flagged</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{anomalies.length} Flagged Anomalies</p>
              <p className="text-xs text-slate-500 mt-0.5">Evaluated via NumPy Z-score engine</p>
            </div>
          </div>
        </div>

        {/* Section 3: Category Distribution Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Category Spending Audit</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Total Spent</th>
                  <th className="p-3 text-right">% of Total</th>
                  <th className="p-3 text-center">Tx Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {category_distribution.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50">
                    <td className="p-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(cat.category) }} />
                      <span className="font-bold text-slate-900">{cat.category}</span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{formatCurrency(cat.total)}</td>
                    <td className="p-3 text-right font-mono text-indigo-600 font-semibold">{cat.percentage.toFixed(1)}%</td>
                    <td className="p-3 text-center font-mono text-slate-500">{cat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Largest Single Transactions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Largest Expense Items</h3>
          <div className="space-y-2">
            {largest_expenses.map((tx) => (
              <div key={tx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{tx.description || tx.category}</span>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5">{formatDate(tx.date)} • {tx.category}</span>
                </div>
                <span className="text-sm font-bold font-mono text-rose-700">{formatCurrency(tx.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seaborn Heatmap Image Modal */}
      {showSeabornModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-3xl w-full relative space-y-4 shadow-xl">
            <button
              onClick={() => setShowSeabornModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Seaborn & Matplotlib Heatmap Chart</h3>
            </div>

            <p className="text-xs text-slate-500">
              Generated on the Python backend using Seaborn and Matplotlib statistical visualization libraries.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-center min-h-[300px]">
              <img
                src={getHeatmapImageUrl()}
                alt="Seaborn Statistical Heatmap"
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
