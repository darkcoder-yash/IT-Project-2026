import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    isIncreaseBad?: boolean;
  };
  icon: LucideIcon;
  iconBgColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBgColor = 'bg-indigo-50 text-indigo-600 border border-indigo-100',
}) => {
  const isPositiveTrend = trend ? trend.value >= 0 : true;
  const isBadTrend = trend?.isIncreaseBad ? isPositiveTrend : !isPositiveTrend;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBgColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>

        <div className="flex items-center gap-2 mt-2">
          {trend && trend.value !== 0 && (
            <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              isBadTrend ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {isPositiveTrend ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
          {subtitle && (
            <span className="text-xs text-slate-400 font-normal">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};
