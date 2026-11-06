import { Card } from '@/components/ui/Card';
import { ShieldCheck, CheckCircle2, Calendar } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { DashboardSummaryCards } from '@/features/dashboard/components/DashboardSummaryCards';
import { ExpenseCategoryChart } from '@/features/dashboard/components/ExpenseCategoryChart';
import { RecentTransactionsWidget } from '@/features/dashboard/components/RecentTransactionsWidget';

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
            Live PostgreSQL RPC & Integrity Active
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
          Track income, manage expenses, and monitor financial account balances with
          database-guaranteed precision.
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

      {/* System Integrity & Milestones Verification Card */}
      <Card
        title="System Architecture & Integrity Status"
        subtitle="Milestones 1–6 Verification & Compliance"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Dynamic PostgreSQL Balance Calculation</p>
                <p className="text-xs text-slate-500">
                  Balances are dynamically calculated from opening balance + active transactions via <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">calculate_account_balance</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Atomic Financial RPC Operations</p>
                <p className="text-xs text-slate-500">
                  Overdraft prevention, atomic transfers, initial balance locking, and safe soft-deletions enforced in PostgreSQL.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Dedicated Feature Modules</p>
                <p className="text-xs text-slate-500">
                  Transactions managed strictly in the Transactions module; financial accounts managed in the Accounts module.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Automated Audit Trail Logging</p>
                <p className="text-xs text-slate-500">
                  Transaction mutations and soft deletions automatically recorded in account and transaction audit tables with readable account names.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Philippine Peso Standard (PHP ₱)</p>
                <p className="text-xs text-slate-500">
                  Standardized on Philippine Peso (<code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">₱</code>) with exact <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">NUMERIC(12,2)</code> precision.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Supabase Auth & Row Level Security</p>
                <p className="text-xs text-slate-500">
                  Strict user isolation on all tables with JWT-authenticated database sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
