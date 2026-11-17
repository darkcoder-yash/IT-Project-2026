import React, { useState } from 'react';
import { Plus, Upload, Calendar, RotateCcw } from 'lucide-react';
import { resetSampleData } from '../../services/api';

interface HeaderProps {
  title: string;
  subtitle?: string;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onDataReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  selectedMonth,
  onMonthChange,
  onOpenAddModal,
  onOpenImportModal,
  onDataReset,
}) => {
  const [resetting, setResetting] = useState(false);

  const monthsOptions = [
    { value: '', label: 'All Time' },
    { value: '2026-12', label: 'December 2026' },
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-03', label: 'March 2026' },
    { value: '2026-02', label: 'February 2026' },
    { value: '2026-01', label: 'January 2026' },
  ];

  const handleResetSampleData = async () => {
    if (window.confirm('Reset database with sample personal finance transactions?')) {
      setResetting(true);
      try {
        await resetSampleData();
        if (onDataReset) onDataReset();
      } catch (err) {
        console.error('Failed to reset sample data', err);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Month Selector */}
        <div className="relative flex items-center">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="glass-input pl-9 pr-8 py-2 font-medium cursor-pointer text-xs focus:ring-indigo-500 appearance-none bg-white border-slate-200 text-slate-700"
          >
            {monthsOptions.map((m) => (
              <option key={m.value} value={m.value} className="bg-white text-slate-900">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Load Sample Data Button */}
        <button
          onClick={handleResetSampleData}
          disabled={resetting}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-xs disabled:opacity-50"
          title="Reset database to sample income & expense dataset"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          {resetting ? 'Resetting...' : 'Load Sample Data'}
        </button>

        {/* CSV Import Button */}
        <button
          onClick={onOpenImportModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          Import CSV
        </button>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>
    </header>
  );
};


