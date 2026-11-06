import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { accountService } from '@/features/accounts/services/accountService';
import type { AccountWithBalance } from '@/features/accounts/types/account.types';
import type {
  DashboardSummary,
  MonthlyCashFlowPoint,
  CategoryExpenseBreakdown,
  AccountBalanceShare,
} from '../types/dashboard.types';
import type { TransactionWithDetails } from '@/features/transactions/types/transaction.types';

export function useDashboardData() {
  const [summary, setSummary] = useState<DashboardSummary>({
    total_balance: 0,
    total_income: 0,
    total_expense: 0,
    total_transfer_fees: 0,
  });
  const [monthlyCashFlow, setMonthlyCashFlow] = useState<MonthlyCashFlowPoint[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryExpenseBreakdown[]>([]);
  const [accountShares, setAccountShares] = useState<AccountBalanceShare[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, cashFlowRes, catBreakdownRes, recentTxRes, accountsRes] =
        await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getMonthlyCashFlow(6),
          dashboardService.getCategoryBreakdown(),
          dashboardService.getRecentTransactions(5),
          accountService.getAccounts(),
        ]);

      setSummary(summaryRes);
      setMonthlyCashFlow(cashFlowRes);
      setCategoryBreakdown(catBreakdownRes);
      setRecentTransactions(recentTxRes);
      setAccounts(accountsRes);
      setAccountShares(dashboardService.calculateAccountShares(accountsRes));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      console.error('[useDashboardData] Error:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    summary,
    monthlyCashFlow,
    categoryBreakdown,
    accountShares,
    recentTransactions,
    accounts,
    isLoading,
    error,
    refresh: loadData,
  };
}
