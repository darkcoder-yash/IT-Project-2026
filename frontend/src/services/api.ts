import axios from 'axios';
import {
  Transaction,
  TransactionCreate,
  TransactionFilters,
  DashboardSummary,
  HeatmapData,
  FinancialInsight,
  FinancialHealth,
  ReportSummary,
  CSVImportPreview,
  CSVImportResult,
  Anomaly
} from '../types/finance';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDashboardSummary = async (month?: string): Promise<DashboardSummary> => {
  const response = await api.get<DashboardSummary>('/dashboard/summary', {
    params: { month }
  });
  return response.data;
};

export const fetchTransactions = async (filters?: TransactionFilters): Promise<{
  count: number;
  total_income: number;
  total_expense: number;
  transactions: Transaction[];
}> => {
  const response = await api.get('/transactions', { params: filters });
  return response.data;
};

export const createTransaction = async (data: TransactionCreate): Promise<Transaction> => {
  const response = await api.post<Transaction>('/transactions', data);
  return response.data;
};

export const updateTransaction = async (id: number, data: Partial<TransactionCreate>): Promise<Transaction> => {
  const response = await api.put<Transaction>(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<{ message: string; id: number }> => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

export const previewCSVImport = async (file: File): Promise<CSVImportPreview> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<CSVImportPreview>('/transactions/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const importCSV = async (file: File): Promise<CSVImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<CSVImportResult>('/transactions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const fetchCategoryAnalytics = async (params?: { month?: string; start_date?: string; end_date?: string }) => {
  const response = await api.get('/analytics/categories', { params });
  return response.data;
};

export const fetchMonthlyAnalytics = async () => {
  const response = await api.get('/analytics/monthly');
  return response.data;
};

export const fetchAnomalies = async (threshold_z: number = 2.0): Promise<{
  status: string;
  message: string;
  total_expenses_analyzed: number;
  anomalies_detected: number;
  anomalies: Anomaly[];
}> => {
  const response = await api.get('/analytics/anomalies', { params: { threshold_z } });
  return response.data;
};

export const fetchSpendingHeatmap = async (): Promise<HeatmapData> => {
  const response = await api.get<HeatmapData>('/analytics/heatmap');
  return response.data;
};

export const fetchFinancialInsights = async (): Promise<FinancialInsight[]> => {
  const response = await api.get<FinancialInsight[]>('/analytics/insights');
  return response.data;
};

export const fetchFinancialHealth = async (): Promise<FinancialHealth> => {
  const response = await api.get<FinancialHealth>('/analytics/health');
  return response.data;
};

export const fetchReportSummary = async (params?: { month?: string; start_date?: string; end_date?: string }): Promise<ReportSummary> => {
  const response = await api.get<ReportSummary>('/reports/summary', { params });
  return response.data;
};

export const getCSVExportUrl = (month?: string): string => {
  return `${API_BASE_URL}/reports/export-csv${month ? `?month=${month}` : ''}`;
};

export const getHeatmapImageUrl = (): string => {
  return `${API_BASE_URL}/reports/heatmap-image`;
};

export const resetSampleData = async (): Promise<{ status: string; message: string; count: number }> => {
  const response = await api.post('/transactions/reset-sample-data');
  return response.data;
};

export const resetStudentData = resetSampleData;


export default api;

