import React, { useState, useEffect } from 'react';
import { Transaction, TransactionCreate, TransactionType } from '../../types/finance';
import { X, Check, AlertCircle } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionCreate) => Promise<void>;
  initialData?: Transaction | null;
}

const EXPENSE_CATEGORIES = [
  'Food', 'Rent', 'Education', 'Travel', 'Shopping', 'Bills',
  'Entertainment', 'Health', 'Electronics', 'Other'
];

const INCOME_CATEGORIES = [
  'Allowance', 'Part-time Job', 'Scholarship', 'Tutoring',
  'Freelance', 'Salary', 'Gift', 'Other'
];


export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('Expense');
  const [category, setCategory] = useState<string>('Food');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setCategory(initialData.category);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setDescription(initialData.description || '');
    } else {
      setType('Expense');
      setCategory('Food');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Amount must be a number greater than 0.';
    }

    if (!date) {
      errs.date = 'Date is required.';
    }

    if (!category.trim()) {
      errs.category = 'Category cannot be empty.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        category: category.trim(),
        amount: parseFloat(amount),
        date,
        description: description.trim()
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.response?.data?.detail || 'Failed to save transaction.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategoryOptions = type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {initialData ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>

        {errors.form && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => { setType('Expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
                className={`py-2 text-xs font-semibold rounded-md transition-all ${
                  type === 'Expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => { setType('Income'); setCategory(INCOME_CATEGORIES[0]); }}
                className={`py-2 text-xs font-semibold rounded-md transition-all ${
                  type === 'Income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 450.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`glass-input w-full ${errors.amount ? 'border-rose-500 ring-rose-500/20' : ''}`}
            />
            {errors.amount && <p className="text-[11px] text-rose-600 mt-1">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="glass-input w-full bg-white border-slate-200 text-slate-900"
            >
              {currentCategoryOptions.map((c) => (
                <option key={c} value={c} className="bg-white text-slate-900">
                  {c}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-[11px] text-rose-600 mt-1">{errors.category}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`glass-input w-full ${errors.date ? 'border-rose-500 ring-rose-500/20' : ''}`}
            />
            {errors.date && <p className="text-[11px] text-rose-600 mt-1">{errors.date}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description / Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Grocery shopping at supermarket"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : initialData ? 'Update Transaction' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
