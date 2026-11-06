import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  Target,
  FileText,
  Settings,
  X,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', to: '/accounts', icon: Wallet },
  { name: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
  { name: 'Reports', to: '/reports', icon: FileText },
  { name: 'Budgets', to: '/budgets', icon: PieChart, badge: 'Soon', badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' },
  { name: 'Savings Goals', to: '/goals', icon: Target, badge: 'Soon', badgeColor: 'bg-teal-950 text-teal-400 border border-teal-800/60' },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 font-black text-white shadow-md">
              ₱
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">FinTrack</span>
              <span className="block text-[10px] font-medium text-emerald-400 leading-none">Personal Finance</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {mainNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Security / System Footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/60 p-2.5 text-xs text-slate-300 border border-slate-700/60">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="text-[11px]">
              <p className="font-medium text-white">Bank-Grade Security</p>
              <p className="text-slate-400">Encrypted Cloud Sync</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
