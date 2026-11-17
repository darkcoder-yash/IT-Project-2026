import React from 'react';
import { Transaction } from '../../types/finance';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Recent Activity</h2>
          <p className="text-xs text-slate-400">Latest recorded transactions</p>
        </div>

        <Link
          to="/transactions"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View All &rarr;
        </Link>
      </div>

      <div className="divide-y divide-slate-100 flex-1">
        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">No transactions recorded yet.</p>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tx.type === 'Income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-900 truncate">{tx.description || tx.category}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: `${getCategoryColor(tx.category)}18`, color: getCategoryColor(tx.category) }}
                    >
                      {tx.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{formatDate(tx.date)}</span>
                </div>
              </div>

              <div className="text-right shrink-0 ml-3">
                <span className={`text-xs font-semibold font-mono ${
                  tx.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                  {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
