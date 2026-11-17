import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MonthlyTrendsPage } from './pages/MonthlyTrendsPage';
import { ReportsPage } from './pages/ReportsPage';
import { TransactionFormModal } from './components/transactions/TransactionFormModal';
import { CSVImportModal } from './components/transactions/CSVImportModal';
import { fetchDashboardSummary, createTransaction, updateTransaction } from './services/api';
import { DashboardSummary, Transaction, TransactionCreate } from './types/finance';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await fetchDashboardSummary(selectedMonth || undefined);
      setSummary(data);
      setServerError(null);
    } catch (err: any) {
      console.error('Failed to load dashboard summary', err);
      setServerError('Unable to connect to FastAPI backend at http://localhost:8000. Please start the backend server with: python -m app.main');
    } finally {
      setLoadingSummary(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleSaveTransaction = async (data: TransactionCreate) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await createTransaction(data);
    }
    setEditingTransaction(null);
    setIsAddModalOpen(false);
    await loadSummary();
    setRefreshKey((k) => k + 1);
  };

  const handleImportSuccess = async () => {
    setIsImportModalOpen(false);
    await loadSummary();
    setRefreshKey((k) => k + 1);
  };

  const openAddModal = (tx?: Transaction) => {
    setEditingTransaction(tx || null);
    setIsAddModalOpen(true);
  };

  const anomalyCount = summary?.anomalies ? summary.anomalies.length : 0;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <Sidebar anomalyCount={anomalyCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Personal Finance Intelligence System"
          subtitle="Track your spending, savings, and financial trends"
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onOpenAddModal={() => openAddModal()}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onDataReset={() => {
            loadSummary();
            setRefreshKey((k) => k + 1);
          }}
        />

        {serverError && (
          <div className="bg-rose-50 border-b border-rose-200 px-8 py-3 flex items-center justify-between gap-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{serverError}</span>
            </div>
            <button
              onClick={loadSummary}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        <main className="flex-1 px-8 py-6 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  summary={summary}
                  loading={loadingSummary}
                  onOpenAddModal={() => openAddModal()}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                />
              }
            />
            <Route
              path="/transactions"
              element={
                <TransactionsPage
                  onOpenAddModal={openAddModal}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  refreshKey={refreshKey}
                  selectedMonth={selectedMonth}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/trends" element={<MonthlyTrendsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals: Accessible anywhere including Header & Dashboard */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
      />

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
