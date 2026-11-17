import React from 'react';
import { FinancialHealth } from '../../types/finance';
import { Activity, ShieldCheck, AlertCircle, AlertOctagon } from 'lucide-react';

interface HealthIndicatorCardProps {
  health: FinancialHealth;
}

export const HealthIndicatorCard: React.FC<HealthIndicatorCardProps> = ({ health }) => {
  const getOverallBadge = (status: FinancialHealth['overall_status']) => {
    switch (status) {
      case 'Healthy':
        return {
          label: 'Healthy',
          color: 'bg-emerald-50 text-emerald-700',
          icon: ShieldCheck
        };
      case 'Moderate':
        return {
          label: 'Moderate',
          color: 'bg-amber-50 text-amber-700',
          icon: AlertCircle
        };
      default:
        return {
          label: 'Attention Needed',
          color: 'bg-rose-50 text-rose-700',
          icon: AlertOctagon
        };
    }
  };

  const overall = getOverallBadge(health.overall_status);
  const StatusIcon = overall.icon;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Financial Health</h2>
          <p className="text-xs text-slate-400">Stability & benchmark indicators</p>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${overall.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{overall.label}</span>
          <span className="text-[11px] opacity-75 font-mono">({health.health_score}%)</span>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {health.indicators.map((ind) => (
          <div key={ind.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
            <div>
              <span className="text-xs font-medium text-slate-800 block">{ind.label}</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{ind.detail}</span>
            </div>
            <div className="text-right shrink-0 ml-3">
              <span className="text-xs font-bold text-slate-900 font-mono block">{ind.value}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                ind.badge_type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : ind.badge_type === 'warning'
                  ? 'bg-amber-50 text-amber-700'
                  : ind.badge_type === 'danger'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {ind.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
