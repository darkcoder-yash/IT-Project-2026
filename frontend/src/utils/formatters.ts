export const formatCurrency = (amount: number, showDecimals: boolean = true): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(Math.abs(amount));

  const prefix = amount < 0 ? '-₹' : '₹';
  return `${prefix}${formatted}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatPercentage = (value: number, includeSign: boolean = true): string => {
  if (isNaN(value) || value === null) return '0%';
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
};

export const CATEGORY_COLORS: Record<string, string> = {
  Allowance: '#10B981',
  'Part-time Job': '#0284C7',
  Scholarship: '#8B5CF6',
  Tutoring: '#06B6D4',
  Salary: '#16A34A',
  Freelance: '#6366F1',
  Business: '#4F46E5',
  Investment: '#8B5CF6',
  Gift: '#EC4899',
  Food: '#F59E0B',
  Rent: '#DC2626',
  Education: '#65A30D',
  Travel: '#EC4899',
  Shopping: '#A855F7',
  Bills: '#6366F1',
  Entertainment: '#38BDF8',
  Health: '#E11D48',
  Electronics: '#2563EB',
  Other: '#64748B'
};


export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || '#94A3B8';
};
