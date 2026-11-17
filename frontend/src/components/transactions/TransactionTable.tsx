import React, { useState } from 'react';
import { Transaction } from '../../types/finance';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import { Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: number) => void;
  sortBy: 'date' | 'amount';
  order: 'asc' | 'desc';
  onSortChange: (field: 'date' | 'amount') => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  sortBy,
  order,
  onSortChange,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const confirmDelete = (id: number) => {
    onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 w-16">ID</th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none" onClick={() => onSortChange('date')}>
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  {sortBy === 'date' ? (
                    order === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                  )}
                </div>
              </th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors select-none" onClick={() => onSortChange('amount')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount</span>
                  {sortBy === 'amount' ? (
                    order === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                  )}
                </div>
              </th>
              <th className="py-3.5 px-4 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                  No transactions match your current search and filter criteria.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">#{tx.id}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{formatDate(tx.date)}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className="px-2.5 py-1 rounded text-[11px] font-semibold inline-block"
                      style={{ backgroundColor: `${getCategoryColor(tx.category)}15`, color: getCategoryColor(tx.category) }}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">{tx.description || '-'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      tx.type === 'Income'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                    tx.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Transaction #{deletingId}?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deletingId)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
