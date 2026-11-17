import React, { useState } from 'react';
import { previewCSVImport, importCSV } from '../../services/api';
import { CSVImportPreview } from '../../types/finance';
import { Upload, X, CheckCircle, AlertOctagon, FileText } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid .csv file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const res = await previewCSVImport(selectedFile);
      setPreview(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to preview CSV file.');
      setFile(null);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      await importCSV(file);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to import CSV dataset.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full relative max-h-[90vh] flex flex-col shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Import CSV Transactions</h2>
            <p className="text-xs text-slate-500">Pandas validation preview prior to ingestion</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!preview ? (
          <div className="space-y-4 flex-1">
            {/* File Dropzone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 rounded-2xl p-8 text-center transition-all cursor-pointer">
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="csv-file-input" className="cursor-pointer space-y-3 block">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {loading ? 'Analyzing CSV with Pandas...' : 'Click to choose or drop CSV file'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Expected columns: Date, Category, Amount, Type, Description</p>
                </div>
              </label>
            </div>

            {/* Example CSV snippet */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600 space-y-1">
              <p className="font-sans font-semibold text-slate-800">Expected Format Example:</p>
              <p className="text-slate-900 font-bold">Date,Category,Amount,Type,Description</p>
              <p>01-08-2026,Food,450,Expense,Groceries</p>
              <p>02-08-2026,Allowance,14000,Income,Monthly Allowance</p>

            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Validation Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500">Total Rows</span>
                <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">{preview.total_rows}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-700 font-medium">Valid Rows</span>
                <p className="text-lg font-bold text-emerald-700 font-mono mt-0.5">{preview.valid_rows}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-xs text-rose-700 font-medium">Invalid Rows</span>
                <p className="text-lg font-bold text-rose-700 font-mono mt-0.5">{preview.invalid_rows}</p>
              </div>
            </div>

            {/* Invalid Row Warnings */}
            {preview.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">Validation Errors Skipped</h4>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {preview.errors.map((err, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                      <strong>Row {err.row_index}:</strong> {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valid Preview Snippet */}
            {preview.preview_valid.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preview Valid Data</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Row</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Type</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {preview.preview_valid.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 text-slate-400 font-mono">#{r.row}</td>
                          <td className="p-2 text-slate-700 font-mono">{r.date}</td>
                          <td className="p-2 font-semibold text-slate-800">{r.category}</td>
                          <td className="p-2 text-slate-600">{r.type}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">₹{r.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Choose Different File
              </button>

              <button
                onClick={handleImport}
                disabled={importing || preview.valid_rows === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                {importing ? 'Importing...' : `Import ${preview.valid_rows} Valid Rows`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
