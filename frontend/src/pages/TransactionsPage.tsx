import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionFilters } from '../types/finance';
import { fetchTransactions, deleteTransaction } from '../services/api';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionFiltersBar } from '../components/transactions/TransactionFiltersBar';
import { formatCurrency } from '../utils/formatters';
import { Plus, Upload, RefreshCw } from 'lucide-react';

interface TransactionsPageProps {
  onOpenAddModal: (tx?: Transaction) => void;
  onOpenImportModal: () => void;
  refreshKey?: number;
  selectedMonth?: string;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onOpenImportModal,
  refreshKey,
  selectedMonth,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<TransactionFilters>({
    sort_by: 'date',
    order: 'desc'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters: TransactionFilters = {
        ...filters,
        month: selectedMonth || filters.month || undefined,
      };
      const res = await fetchTransactions(activeFilters);
      setTransactions(res.transactions);
      setTotalCount(res.count);
      setTotalIncome(res.total_income);
      setTotalExpense(res.total_expense);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleFilterChange = (updated: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({ sort_by: 'date', order: 'desc' });
  };

  const handleSortChange = (field: 'date' | 'amount') => {
    setFilters((prev) => ({
      ...prev,
      sort_by: field,
      order: prev.sort_by === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleDeleteTransaction = async (id: number) => {
    await deleteTransaction(id);
    await loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Actions & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transaction Workbench</h2>
          <p className="text-xs text-slate-500 mt-0.5">Filter, search, add, edit, or import financial records</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import CSV
          </button>
          <button
            onClick={() => onOpenAddModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            New Transaction
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <TransactionFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Filtered Subset Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Record Count</span>
          <span className="text-sm font-bold text-slate-900 font-mono">{totalCount} items</span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
          <span className="text-xs text-emerald-700 font-medium">Filtered Income</span>
          <span className="text-sm font-bold text-emerald-700 font-mono">+{formatCurrency(totalIncome)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
          <span className="text-xs text-rose-700 font-medium">Filtered Expense</span>
          <span className="text-sm font-bold text-rose-700 font-mono">-{formatCurrency(totalExpense)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
          <span className="text-xs text-indigo-700 font-medium">Net Filtered Balance</span>
          <span className="text-sm font-bold text-indigo-700 font-mono">{formatCurrency(totalIncome - totalExpense)}</span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading transactions...</p>
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={(tx) => onOpenAddModal(tx)}
          onDelete={handleDeleteTransaction}
          sortBy={filters.sort_by || 'date'}
          order={filters.order || 'desc'}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  );
};
