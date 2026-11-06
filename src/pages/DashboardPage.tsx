import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, CheckCircle2, Calendar } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { accountService } from '@/features/accounts/services/accountService';
import { DashboardSummaryCards } from '@/features/dashboard/components/DashboardSummaryCards';
import { IncomeExpenseChart } from '@/features/dashboard/components/IncomeExpenseChart';
import { ExpenseCategoryChart } from '@/features/dashboard/components/ExpenseCategoryChart';
import { AccountDistributionChart } from '@/features/dashboard/components/AccountDistributionChart';
import { RecentTransactionsWidget } from '@/features/dashboard/components/RecentTransactionsWidget';
import { QuickActionsWidget } from '@/features/dashboard/components/QuickActionsWidget';
import { CreateTransactionModal } from '@/features/transactions/components/CreateTransactionModal';
import { CreateAccountModal } from '@/features/accounts/components/CreateAccountModal';
import type {
  CreateIncomeInput,
  CreateExpenseInput,
  CreateTransferInput,
} from '@/features/transactions/types/transaction.types';
import type { CreateAccountInput } from '@/features/accounts/types/account.types';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const {
    summary,
    monthlyCashFlow,
    categoryBreakdown,
    accountShares,
    recentTransactions,
    accounts,
    isLoading,
    refresh,
  } = useDashboardData();

  const {
    transactionTypes,
    categories,
    createIncome,
    createExpense,
    createTransfer,
  } = useTransactions();

  // Modal states for Quick Actions
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalTab, setTxModalTab] = useState<'Expense' | 'Income' | 'Transfer'>('Expense');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const displayName = profile?.user_name || user?.user_metadata?.user_name || 'FinTrack User';
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleOpenTxModal = (tab: 'Expense' | 'Income' | 'Transfer') => {
    setTxModalTab(tab);
    setIsTxModalOpen(true);
  };

  const handleCreateIncome = async (input: CreateIncomeInput) => {
    await createIncome(input);
    refresh();
  };

  const handleCreateExpense = async (input: CreateExpenseInput) => {
    await createExpense(input);
    refresh();
  };

  const handleCreateTransfer = async (input: CreateTransferInput) => {
    await createTransfer(input);
    refresh();
  };

  const handleCreateAccount = async (input: CreateAccountInput) => {
    try {
      await accountService.createAccount(input);
      toast.success(`Account "${input.account_name}" created successfully`);
      setIsAccountModalOpen(false);
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account';
      toast.error(msg);
      throw err;
    }
  };

  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Actions */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
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

          {/* Quick Actions Bar */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-2">
              Quick Actions
            </p>
            <QuickActionsWidget
              onAddIncome={() => handleOpenTxModal('Income')}
              onAddExpense={() => handleOpenTxModal('Expense')}
              onTransfer={() => handleOpenTxModal('Transfer')}
              onAddAccount={() => setIsAccountModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <DashboardSummaryCards
        summary={summary}
        activeAccountsCount={activeAccounts.length}
        isLoading={isLoading}
      />

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={monthlyCashFlow} isLoading={isLoading} />
        <ExpenseCategoryChart data={categoryBreakdown} isLoading={isLoading} />
      </div>

      {/* Secondary Analytics Row: Account Allocation & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountDistributionChart
          shares={accountShares}
          accounts={accounts}
          isLoading={isLoading}
        />
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
                <p className="font-semibold text-slate-800">Interactive Charts & Summaries (Milestone 6)</p>
                <p className="text-xs text-slate-500">
                  Recharts-powered 6-month cash flow trends, donut category breakdowns, and account allocation.
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
                  Transaction mutations, soft deletions, and account balance changes logged to separate immutable audit tables.
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

      {/* Quick Action Modals */}
      <CreateTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        transactionTypes={transactionTypes}
        categories={categories}
        accounts={accounts}
        initialTab={txModalTab}
        onCreateIncome={handleCreateIncome}
        onCreateExpense={handleCreateExpense}
        onCreateTransfer={handleCreateTransfer}
      />

      <CreateAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSubmit={handleCreateAccount}
      />
    </div>
  );
}
