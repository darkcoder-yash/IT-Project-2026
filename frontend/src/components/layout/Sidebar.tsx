import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  anomalyCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ anomalyCount = 0 }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { label: 'Monthly Trends', path: '/trends', icon: TrendingUp },
    { label: 'Financial Reports', path: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-tight">FinIntel System</h1>
          <p className="text-[11px] text-slate-500 font-medium">Personal Finance Analytics</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="flex-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Anomaly Indicator */}
        {anomalyCount > 0 && (
          <div className="pt-4 mt-4 border-t border-slate-100 px-1">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-900">
                  {anomalyCount} Unusual Expense{anomalyCount > 1 ? 's' : ''}
                </p>
                <p className="text-[11px] text-amber-700/90 mt-0.5 leading-snug">
                  Review spending anomalies flagged by NumPy.
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

