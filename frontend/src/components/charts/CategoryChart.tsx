import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { CategoryDistribution } from '../../types/finance';
import { formatCurrency, getCategoryColor } from '../../utils/formatters';

interface CategoryChartProps {
  data: CategoryDistribution[];
  height?: number;
  showCategoryList?: boolean;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data, height = 240, showCategoryList = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl">
        <p className="text-xs text-slate-400">No category breakdown available.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CategoryDistribution;
      return (
        <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl shadow-md text-xs space-y-0.5">
          <p className="font-bold text-slate-900">{item.category}</p>
          <p className="text-indigo-600 font-mono font-medium">{formatCurrency(item.total)}</p>
          <p className="text-slate-400 text-[11px]">{item.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={getCategoryColor(entry.category)} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {!showCategoryList && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {showCategoryList && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-slate-100 mt-2">
          {data.slice(0, 4).map((item) => (
            <div key={item.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                />
                <span className="text-slate-600 font-medium truncate">{item.category}</span>
              </div>
              <span className="font-mono text-slate-900 font-semibold shrink-0 ml-2">{item.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
