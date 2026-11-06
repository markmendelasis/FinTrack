import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, PiggyBank } from 'lucide-react';
import type { DashboardSummary } from '../types/dashboard.types';

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
  activeAccountsCount: number;
  isLoading: boolean;
}

export function DashboardSummaryCards({
  summary,
  activeAccountsCount,
  isLoading,
}: DashboardSummaryCardsProps) {
  const netCashFlow = summary.total_income - summary.total_expense - summary.total_transfer_fees;
  const isNetPositive = netCashFlow >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
          {isLoading ? '...' : formatCurrency(summary.total_balance)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Sum of {activeAccountsCount} active account{activeAccountsCount === 1 ? '' : 's'}
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
        <p className="mt-2 text-2xl font-bold text-blue-900 tracking-tight">
          {isLoading ? '...' : formatCurrency(summary.total_income)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Active income transactions
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
        <p className="mt-2 text-2xl font-bold text-rose-900 tracking-tight">
          {isLoading ? '...' : formatCurrency(summary.total_expense)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Excludes transfer fees
        </p>
      </Card>

      {/* Transfer Fees */}
      <Card className="hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Transfer Fees
          </span>
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-amber-900 tracking-tight">
          {isLoading ? '...' : formatCurrency(summary.total_transfer_fees)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Deducted, tracked separately
        </p>
      </Card>

      {/* Net Cash Flow */}
      <Card className="hover:border-slate-300 transition-colors sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Net Savings
          </span>
          <div
            className={`rounded-lg p-2 ${
              isNetPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            <PiggyBank className="h-5 w-5" />
          </div>
        </div>
        <p
          className={`mt-2 text-2xl font-bold tracking-tight ${
            isNetPositive ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {isLoading ? '...' : formatCurrency(netCashFlow)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Income − Expense − Fees
        </p>
      </Card>
    </div>
  );
}
