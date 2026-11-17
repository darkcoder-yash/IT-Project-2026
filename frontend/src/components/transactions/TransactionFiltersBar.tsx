import React from 'react';
import { TransactionFilters } from '../../types/finance';
import { Search, RotateCcw } from 'lucide-react';

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onFilterChange: (updated: Partial<TransactionFilters>) => void;
  onReset: () => void;
}

const CATEGORY_OPTIONS = [
  'Allowance', 'Part-time Job', 'Scholarship', 'Tutoring', 'Food', 'Rent',
  'Education', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health',
  'Electronics', 'Salary', 'Freelance', 'Gift', 'Other'
];


export const TransactionFiltersBar: React.FC<TransactionFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 flex-1 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search description or category..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="glass-input pl-9 w-full text-xs"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => onFilterChange({ type: undefined })}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              !filters.type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange({ type: 'Income' })}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filters.type === 'Income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => onFilterChange({ type: 'Expense' })}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filters.type === 'Expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expense
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
            className="glass-input text-xs pr-8 bg-white border-slate-200 text-slate-700"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c} className="bg-white text-slate-900">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Pickers & Reset */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={filters.start_date || ''}
          onChange={(e) => onFilterChange({ start_date: e.target.value || undefined })}
          className="glass-input text-xs text-slate-700"
          title="Start Date"
        />
        <span className="text-slate-400 text-xs">to</span>
        <input
          type="date"
          value={filters.end_date || ''}
          onChange={(e) => onFilterChange({ end_date: e.target.value || undefined })}
          className="glass-input text-xs text-slate-700"
          title="End Date"
        />

        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          title="Reset Filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
