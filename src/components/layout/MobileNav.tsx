import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, ArrowLeftRight, FileText, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', to: '/accounts', icon: Wallet },
    { name: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
    { name: 'Reports', to: '/reports', icon: FileText },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-30 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md lg:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-2 py-1 text-center transition-colors ${
              isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] leading-tight">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};
