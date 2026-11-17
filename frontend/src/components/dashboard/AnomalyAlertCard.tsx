import React from 'react';
import { Anomaly } from '../../types/finance';
import { ShieldAlert, Cpu } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface AnomalyAlertCardProps {
  anomalies: Anomaly[];
}

export const AnomalyAlertCard: React.FC<AnomalyAlertCardProps> = ({ anomalies }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Unusual Spending Alerts</h2>
          <p className="text-xs text-slate-400">Statistical anomalies detected</p>
        </div>
        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {anomalies.length} Flagged
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {anomalies.length === 0 ? (
          <div className="p-5 text-center border border-dashed border-slate-200 rounded-xl my-auto">
            <p className="text-xs font-medium text-slate-600">All spending looks normal</p>
            <p className="text-[11px] text-slate-400 mt-0.5">No statistical expense anomalies found.</p>
          </div>
        ) : (
          anomalies.map((anom) => (
            <div
              key={anom.id}
              className={`p-4 rounded-xl border ${
                anom.severity === 'High'
                  ? 'border-rose-200/80 bg-rose-50/40'
                  : 'border-amber-200/80 bg-amber-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className="text-xs font-bold text-slate-900">{anom.category} Purchase</span>
                  <span className="text-[11px] text-slate-400 ml-2 font-mono">{formatDate(anom.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                    anom.severity === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {anom.severity}
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-900">{formatCurrency(anom.amount)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 my-1.5 leading-relaxed">{anom.reason}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/50 font-mono">
                <span>Baseline: {formatCurrency(anom.baseline_mean)}</span>
                <span>Z: {anom.z_score.toFixed(2)}</span>
                <span className="text-rose-600 font-semibold">+{anom.deviation_percentage.toFixed(0)}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
