import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Calendar, Wallet, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { DashboardSummaryCards } from '@/features/dashboard/components/DashboardSummaryCards';
import { ExpenseCategoryChart } from '@/features/dashboard/components/ExpenseCategoryChart';
import { RecentTransactionsWidget } from '@/features/dashboard/components/RecentTransactionsWidget';
import { formatCurrency } from '@/lib/utils/formatters';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const {
    summary,
    categoryBreakdown,
    recentTransactions,
    accounts,
    isLoading,
  } = useDashboardData();

  const displayName = profile?.user_name || user?.user_metadata?.user_name || 'FinTrack User';
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200 border border-emerald-400/30">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Personal Finance Dashboard
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-200/80">
            <Calendar className="h-3.5 w-3.5" />
            {todayFormatted}
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
          Welcome back, {displayName}
        </h2>
        <p className="mt-1 text-sm text-emerald-100 max-w-2xl">
          Track income, manage expenses, and monitor financial account balances in real time.
        </p>
      </div>

      {/* Summary Cards Grid */}
      <DashboardSummaryCards
        summary={summary}
        activeAccountsCount={activeAccounts.length}
        isLoading={isLoading}
      />

      {/* Analytics & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseCategoryChart data={categoryBreakdown} isLoading={isLoading} />
        <RecentTransactionsWidget
          transactions={recentTransactions}
          isLoading={isLoading}
        />
      </div>

      {/* Active Accounts Snapshot */}
      <Card
        title="Your Accounts"
        subtitle="Current balances across your active financial accounts"
        action={
          <Link
            to="/accounts"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            Manage Accounts <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading accounts...</div>
        ) : activeAccounts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No active accounts. <Link to="/accounts" className="text-emerald-600 font-semibold underline">Add your first account</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAccounts.map((account) => (
              <div
                key={account.account_id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">
                      {account.account_name}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400">
                      {account.account_name.toLowerCase() === 'cash wallet' ? 'Default Wallet' : 'Financial Account'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(account.calculated_balance)}
                  </p>
                  <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
