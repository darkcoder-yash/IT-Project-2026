import React from 'react';
import { FinancialInsight } from '../../types/finance';
import { Lightbulb, AlertTriangle, CheckCircle2, Info, AlertOctagon } from 'lucide-react';

interface InsightCardProps {
  insights: FinancialInsight[];
}

export const InsightCard: React.FC<InsightCardProps> = ({ insights }) => {
  const getIcon = (type: FinancialInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />;
      case 'alert':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />;
    }
  };

  const getItemStyle = (type: FinancialInsight['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-100 bg-emerald-50/40';
      case 'warning':
        return 'border-amber-100 bg-amber-50/40';
      case 'alert':
        return 'border-rose-100 bg-rose-50/40';
      default:
        return 'border-slate-100 bg-slate-50/50';
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Key Insights</h2>
        <p className="text-xs text-slate-400">Automated financial observations</p>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto">
        {insights.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">No insights available.</p>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-xl border ${getItemStyle(insight.type)} transition-all`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  {getIcon(insight.type)}
                  <span className="text-xs font-semibold text-slate-900">{insight.title}</span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white text-slate-600 shrink-0 border border-slate-200/60">
                  {insight.metric_badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 pl-5 leading-relaxed">{insight.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
