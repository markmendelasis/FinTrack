import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/accounts': 'Financial Accounts',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/goals': 'Savings Goals',
  '/reports': 'Financial Reports',
  '/settings': 'Settings',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = routeTitles[location.pathname] || 'FinTrack';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main layout container */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={currentTitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <MobileNav />
      </div>
    </div>
  );
};
