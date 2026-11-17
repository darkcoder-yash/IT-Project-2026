import React from 'react';
import { HeatmapData } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { CalendarDays, Flame } from 'lucide-react';

interface HeatmapGridProps {
  data: HeatmapData;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ data }) => {
  if (!data || !data.matrix || data.matrix.length === 0 || data.categories.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
        <p className="text-xs text-slate-400">No spending pattern data available for heatmap matrix.</p>
      </div>
    );
  }

  // Find max value in matrix for relative color intensity calculation
  let maxValue = 0;
  data.matrix.forEach((row) => {
    data.categories.forEach((cat) => {
      const val = row[cat] || 0;
      if (val > maxValue) maxValue = val;
    });
  });

  const getHeatmapColor = (value: number) => {
    if (!value || value === 0) return 'bg-slate-50 text-slate-300 border-slate-100';
    const ratio = value / (maxValue || 1);
    if (ratio < 0.2) return 'bg-indigo-50 text-indigo-700 border-indigo-100/80';
    if (ratio < 0.4) return 'bg-indigo-100 text-indigo-800 border-indigo-200 font-medium';
    if (ratio < 0.7) return 'bg-amber-100 text-amber-900 border-amber-200 font-semibold';
    return 'bg-rose-100 text-rose-900 border-rose-300 font-bold shadow-xs';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Spending Pattern Heatmap</h2>
            <p className="text-[11px] text-slate-500">Day of Week vs Category spending density</p>
          </div>
        </div>

        {data.peak_day !== 'N/A' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Peak Spending Day: <strong className="text-slate-900 font-bold">{data.peak_day}</strong> ({formatCurrency(data.peak_day_amount)})</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full text-xs text-left border-separate border-spacing-1.5">
          <thead>
            <tr>
              <th className="p-2.5 font-semibold text-slate-700 bg-slate-100 rounded-lg">Day / Category</th>
              {data.categories.map((cat) => (
                <th key={cat} className="p-2.5 font-semibold text-slate-700 text-center bg-slate-100 rounded-lg min-w-[90px]">
                  {cat}
                </th>
              ))}
              <th className="p-2.5 font-bold text-slate-900 text-center bg-slate-100 rounded-lg min-w-[100px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row) => (
              <tr key={row.day}>
                <td className="p-2.5 font-semibold text-slate-800 bg-slate-50 rounded-lg border border-slate-200/80">
                  {row.day}
                </td>
                {data.categories.map((cat) => {
                  const val = row[cat] || 0;
                  return (
                    <td
                      key={`${row.day}-${cat}`}
                      className={`p-2.5 text-center font-mono rounded-lg border transition-all ${getHeatmapColor(val)}`}
                      title={`${row.day} ${cat}: ${formatCurrency(val)}`}
                    >
                      {val > 0 ? formatCurrency(val, false) : '-'}
                    </td>
                  );
                })}
                <td className="p-2.5 text-center font-mono font-bold text-slate-900 bg-slate-100/80 rounded-lg border border-slate-300">
                  {formatCurrency(row.total, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-3 text-[11px] text-slate-500">
        <span>Intensity Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-slate-50 border border-slate-200 inline-block" />
          <span>None</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-indigo-50 border border-indigo-100 inline-block" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-indigo-100 border border-indigo-200 inline-block" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-amber-100 border border-amber-200 inline-block" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-rose-100 border border-rose-300 inline-block" />
          <span>Peak</span>
        </div>
      </div>
    </div>
  );
};
