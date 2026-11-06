import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200 border border-emerald-400/30">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Milestone 1 — Project Foundation
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
              Welcome to FinTrack
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
            {formatCurrency(0.00)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sum of active accounts only
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
            {formatCurrency(0.00)}
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
            {formatCurrency(0.00)}
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
            {formatCurrency(0.00)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Reported separately
          </p>
        </Card>
      </div>

      {/* Architecture Baseline Status Card */}
      <Card title="Architecture & Environment Status" subtitle="Milestone 1 Deliverables Verification">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">React + Vite + TypeScript Scaffold</p>
                <p className="text-xs text-slate-500">Modular feature-based architecture with Tailwind CSS.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Centralized Supabase Client</p>
                <p className="text-xs text-slate-500">Located at <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">src/lib/supabase/client.ts</code> with environment variable validation.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Responsive Navigation System</p>
                <p className="text-xs text-slate-500">Sidebar for desktop/tablet, bottom quick navigation for mobile.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Philippine Peso (PHP) Currency Formatting</p>
                <p className="text-xs text-slate-500">Standardized <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">formatCurrency()</code> adhering to Section 7.7.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Git Safeguards Active</p>
                <p className="text-xs text-slate-500">Git initialized on branch <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">main</code>; documentation baseline committed.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Approved Documentation Baseline</p>
                <p className="text-xs text-slate-500">All 6 master architecture documents verified and respected.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
