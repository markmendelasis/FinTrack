import type { TransactionWithDetails } from '@/features/transactions/types/transaction.types';
import type { AccountWithBalance } from '@/features/accounts/types/account.types';

export interface DashboardSummary {
  total_balance: number;
  total_income: number;
  total_expense: number;
  total_transfer_fees: number;
}

export interface MonthlyCashFlowPoint {
  monthKey: string; // e.g. "2026-11"
  monthLabel: string; // e.g. "Nov 2026"
  income: number;
  expense: number;
  net: number;
}

export interface CategoryExpenseBreakdown {
  category_name: string;
  total_amount: number;
  percentage: number;
  color: string;
}

export interface AccountBalanceShare {
  account_id: string;
  account_name: string;
  balance: number;
  percentage: number;
  color: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  monthlyCashFlow: MonthlyCashFlowPoint[];
  categoryBreakdown: CategoryExpenseBreakdown[];
  accountShares: AccountBalanceShare[];
  recentTransactions: TransactionWithDetails[];
  accounts: AccountWithBalance[];
}
