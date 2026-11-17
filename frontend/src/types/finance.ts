export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: number;
  date: string;
  category: string;
  amount: number;
  type: TransactionType;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  date: string;
  category: string;
  amount: number;
  type: TransactionType;
  description?: string;
}

export interface TransactionFilters {
  month?: string;
  start_date?: string;
  end_date?: string;
  category?: string;
  type?: string;
  search?: string;
  sort_by?: 'date' | 'amount';
  order?: 'asc' | 'desc';
}

export interface TotalsSummary {
  total_income: number;
  total_expense: number;
  total_savings: number;
  savings_rate: number;
  daily_avg_expense: number;
  numpy_mean_expense: number;
  total_transactions: number;
  unique_expense_days: number;
}

export interface HighestCategory {
  category: string;
  total: number;
  percentage: number;
}

export interface MonthOverMonth {
  current_month: string;
  previous_month: string;
  current_expense: number;
  previous_expense: number;
  percentage_change: number;
  diff_amount: number;
  has_sufficient_data: boolean;
}

export interface MonthlyTrendItem {
  month: string;
  income: number;
  expense: number;
  savings: number;
  savings_rate: number;
  transaction_count: number;
}

export interface CategoryDistribution {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface Anomaly {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  baseline_mean: number;
  baseline_std: number;
  z_score: number;
  deviation_percentage: number;
  severity: 'Moderate' | 'High';
  reason: string;
  analysis_type: string;
}

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info' | 'alert';
  category: string;
  metric_badge: string;
}

export interface HealthIndicator {
  key: string;
  label: string;
  value: string;
  status: 'Healthy' | 'Moderate' | 'Needs Attention' | 'Neutral';
  badge_type: 'success' | 'warning' | 'danger' | 'info';
  detail: string;
}

export interface FinancialHealth {
  overall_status: 'Healthy' | 'Moderate' | 'Needs Attention' | 'Neutral';
  health_score: number;
  indicators: HealthIndicator[];
}

export interface HeatmapMatrixRow {
  day: string;
  total: number;
  [category: string]: any;
}

export interface HeatmapData {
  days: string[];
  categories: string[];
  matrix: HeatmapMatrixRow[];
  day_totals: Record<string, number>;
  peak_day: string;
  peak_day_amount: number;
}

export interface DashboardSummary {
  totals: TotalsSummary;
  highest_category: HighestCategory;
  month_over_month: MonthOverMonth;
  monthly_trend: MonthlyTrendItem[];
  category_distribution: CategoryDistribution[];
  recent_transactions: Transaction[];
  insights: FinancialInsight[];
  anomalies: Anomaly[];
  health: FinancialHealth;
}

export interface ReportSummary {
  title: string;
  period_label: string;
  totals: TotalsSummary;
  highest_spending_category: HighestCategory;
  category_distribution: CategoryDistribution[];
  largest_expenses: Transaction[];
  month_over_month: MonthOverMonth;
  anomalies: Anomaly[];
  insights: FinancialInsight[];
  health: FinancialHealth;
}

export interface CSVRowError {
  row_index: number;
  data: Record<string, any>;
  error: string;
}

export interface CSVImportPreview {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  errors: CSVRowError[];
  preview_valid: Record<string, any>[];
}

export interface CSVImportResult {
  imported_count: number;
  skipped_count: number;
  message: string;
}
