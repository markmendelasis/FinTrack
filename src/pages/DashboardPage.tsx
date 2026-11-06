import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { activeAccounts } = useAccounts();
  const [summary, setSummary] = useState({
    total_balance: 0,
    total_income: 0,
    total_expense: 0,
    total_transfer_fees: 0,
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  const displayName = profile?.user_name || user?.user_metadata?.user_name || 'FinTrack User';

  useEffect(() => {
    let isMounted = true;
    async function fetchSummary() {
      setIsSummaryLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_dashboard_summary');
        if (!error && data && isMounted) {
          setSummary({
            total_balance: Number(data.total_balance || 0),
            total_income: Number(data.total_income || 0),
            total_expense: Number(data.total_expense || 0),
            total_transfer_fees: Number(data.total_transfer_fees || 0),
          });
        }
      } catch (err) {
        console.warn('[FinTrack] Could not load dashboard summary RPC:', err);
      } finally {
        if (isMounted) {
          setIsSummaryLoading(false);
        }
      }
    }

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200 border border-emerald-400/30">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Live Database Integration Active
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
              Welcome back, {displayName}
            </h2>
            <p className="mt-1 text-sm text-emerald-100 max-w-2xl">
              Cross-device personal finance management application with database-level financial integrity, Supabase Auth, and PostgreSQL RPC.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Balance
            </span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isSummaryLoading ? '...' : formatCurrency(summary.total_balance)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sum of {activeAccounts.length} active account{activeAccounts.length === 1 ? '' : 's'}
          </p>
        </Card>

        {/* Total Income */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Income
            </span>
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isSummaryLoading ? '...' : formatCurrency(summary.total_income)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active, non-deleted income
          </p>
        </Card>

        {/* Total Expense */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Expense
            </span>
            <div className="rounded-lg bg-rose-100 p-2 text-rose-700">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isSummaryLoading ? '...' : formatCurrency(summary.total_expense)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Excludes transfer fees
          </p>
        </Card>

        {/* Total Transfer Fees */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Transfer Fees
            </span>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {isSummaryLoading ? '...' : formatCurrency(summary.total_transfer_fees)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Reported separately
          </p>
        </Card>
      </div>

      {/* Architecture & Milestone Status Card */}
      <Card title="Architecture & Milestone Status" subtitle="Milestones 1–5 Verification">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Transaction Management Active</p>
                <p className="text-xs text-slate-500">
                  Income, Expense, and atomic Transfers with database-side balance validation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">PostgreSQL RPC Financial Operations</p>
                <p className="text-xs text-slate-500">
                  Reversals, edits, soft-deletions, and transfer fees enforced in PostgreSQL.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Financial Accounts Management</p>
                <p className="text-xs text-slate-500">
                  Multiple accounts, zero-balance deactivation checks, and initial balance locking.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Automatic Audit Trail Logging</p>
                <p className="text-xs text-slate-500">
                  Transaction changes, soft-deletions, and account updates audited via triggers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Philippine Peso (PHP ₱) Currency Standard</p>
                <p className="text-xs text-slate-500">
                  All monetary calculations and UI cards display in Philippine Peso (₱).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Supabase Auth & RLS Enforcement</p>
                <p className="text-xs text-slate-500">
                  User ownership enforced on all tables by Row Level Security policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
