import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, ArrowLeftRight, PiggyBank, FileSpreadsheet } from 'lucide-react';
import type { ReportSummary } from '../types/report.types';

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  isLoading: boolean;
}

export function ReportSummaryCards({ summary, isLoading }: ReportSummaryCardsProps) {
  const isNetPositive = summary.netSavings >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Income */}
      <Card className="hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Period Income
          </span>
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-blue-900 tracking-tight">
          {isLoading ? '...' : formatCurrency(summary.totalIncome)}
        </p>
        <p className="mt-1 text-xs text-slate-500">Total received</p>
      </Card>

      {/* Total Expense */}
      <Card className="hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Period Expense
          </span>
          <div className="rounded-lg bg-rose-100 p-2 text-rose-700">
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-rose-900 tracking-tight">
          {isLoading ? '...' : formatCurrency(summary.totalExpense)}
        </p>
        <p className="mt-1 text-xs text-slate-500">Excludes transfer fees</p>
      </Card>

      {/* Transfer Fees */}
      <Card className="hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Transfer Fees
          </span>
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-amber-900 tracking-tight">
          {isLoading ? '...' : formatCurrency(summary.totalTransferFees)}
        </p>
        <p className="mt-1 text-xs text-slate-500">Total transaction fees</p>
      </Card>

      {/* Net Savings */}
      <Card className="hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Net Cash Flow
          </span>
          <div
            className={`rounded-lg p-2 ${
              isNetPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            <PiggyBank className="h-4 w-4" />
          </div>
        </div>
        <p
          className={`mt-2 text-2xl font-bold tracking-tight ${
            isNetPositive ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {isLoading ? '...' : formatCurrency(summary.netSavings)}
        </p>
        <p className="mt-1 text-xs text-slate-500">Income − Expense − Fees</p>
      </Card>

      {/* Transactions Count */}
      <Card className="hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Transactions
          </span>
          <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
          {isLoading ? '...' : summary.transactionCount}
        </p>
        <p className="mt-1 text-xs text-slate-500">Active records in range</p>
      </Card>
    </div>
  );
}
