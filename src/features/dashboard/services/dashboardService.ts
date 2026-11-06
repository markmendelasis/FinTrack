import { supabase } from '@/lib/supabase/client';
import { transactionService } from '@/features/transactions/services/transactionService';
import type {
  DashboardSummary,
  MonthlyCashFlowPoint,
  CategoryExpenseBreakdown,
  AccountBalanceShare,
} from '../types/dashboard.types';
import type { AccountWithBalance } from '@/features/accounts/types/account.types';

const CATEGORY_COLORS = [
  '#0d9488', // Teal 600
  '#f43f5e', // Rose 500
  '#3b82f6', // Blue 500
  '#f59e0b', // Amber 500
  '#8b5cf6', // Purple 500
  '#10b981', // Emerald 500
  '#ec4899', // Pink 500
  '#6366f1', // Indigo 500
  '#14b8a6', // Teal 500
  '#64748b', // Slate 500
];

const ACCOUNT_COLORS = [
  '#10b981', // Emerald 500
  '#06b6d4', // Cyan 500
  '#3b82f6', // Blue 500
  '#8b5cf6', // Violet 500
  '#f59e0b', // Amber 500
  '#ec4899', // Pink 500
  '#64748b', // Slate 500
];

export const dashboardService = {
  /**
   * Calls get_dashboard_summary PostgreSQL RPC function.
   */
  async getSummary(): Promise<DashboardSummary> {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_summary');
      if (error) {
        console.warn('[dashboardService] get_dashboard_summary RPC error:', error);
        return {
          total_balance: 0,
          total_income: 0,
          total_expense: 0,
          total_transfer_fees: 0,
        };
      }

      const raw = data as {
        total_balance?: number | string;
        total_income?: number | string;
        total_expense?: number | string;
        total_transfer_fees?: number | string;
      } | null;

      return {
        total_balance: Number(raw?.total_balance ?? 0),
        total_income: Number(raw?.total_income ?? 0),
        total_expense: Number(raw?.total_expense ?? 0),
        total_transfer_fees: Number(raw?.total_transfer_fees ?? 0),
      };
    } catch (err) {
      console.warn('[dashboardService] Failed to fetch summary:', err);
      return {
        total_balance: 0,
        total_income: 0,
        total_expense: 0,
        total_transfer_fees: 0,
      };
    }
  },

  /**
   * Aggregates Income and Expense by month for the past N months.
   */
  async getMonthlyCashFlow(monthsCount = 6): Promise<MonthlyCashFlowPoint[]> {
    // Generate chronological array of the last N months
    const months: MonthlyCashFlowPoint[] = [];
    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNumber = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${monthNumber}`;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      months.push({
        monthKey,
        monthLabel,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    const startDate = `${months[0].monthKey}-01`;

    // Query active transactions in date range
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        transaction_date,
        transaction_types!inner (type_name)
      `)
      .eq('status', 'Y')
      .gte('transaction_date', startDate)
      .order('transaction_date', { ascending: true });

    if (error || !transactions) {
      return months;
    }

    // Map amounts into respective month buckets
    const bucketMap = new Map<string, { income: number; expense: number }>();
    months.forEach((m) => bucketMap.set(m.monthKey, { income: 0, expense: 0 }));

    for (const tx of transactions) {
      if (!tx.transaction_date) continue;
      const monthKey = tx.transaction_date.slice(0, 7); // "YYYY-MM"
      const bucket = bucketMap.get(monthKey);
      if (!bucket) continue;

      const typeName = (tx.transaction_types as { type_name?: string } | null)?.type_name;
      const amt = Number(tx.amount) || 0;

      if (typeName === 'Income') {
        bucket.income += amt;
      } else if (typeName === 'Expense') {
        bucket.expense += amt;
      }
    }

    return months.map((m) => {
      const b = bucketMap.get(m.monthKey) || { income: 0, expense: 0 };
      return {
        ...m,
        income: Math.round(b.income * 100) / 100,
        expense: Math.round(b.expense * 100) / 100,
        net: Math.round((b.income - b.expense) * 100) / 100,
      };
    });
  },

  /**
   * Aggregates expenses by category for active transactions.
   */
  async getCategoryBreakdown(): Promise<CategoryExpenseBreakdown[]> {
    const { data: expenses, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        categories!fk_trans_category_type (category_name),
        transaction_types!inner (type_name)
      `)
      .eq('status', 'Y')
      .eq('transaction_types.type_name', 'Expense');

    if (error || !expenses || expenses.length === 0) {
      return [];
    }

    const map = new Map<string, number>();
    let grandTotal = 0;

    for (const tx of expenses) {
      const catName =
        (tx.categories as { category_name?: string } | null)?.category_name || 'Uncategorized';
      const amt = Number(tx.amount) || 0;
      grandTotal += amt;
      map.set(catName, (map.get(catName) || 0) + amt);
    }

    if (grandTotal <= 0) return [];

    const result: CategoryExpenseBreakdown[] = [];
    let colorIndex = 0;

    map.forEach((totalAmount, catName) => {
      const percentage = Math.round((totalAmount / grandTotal) * 1000) / 10;
      result.push({
        category_name: catName,
        total_amount: Math.round(totalAmount * 100) / 100,
        percentage,
        color: CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length],
      });
      colorIndex++;
    });

    // Sort descending by amount
    return result.sort((a, b) => b.total_amount - a.total_amount);
  },

  /**
   * Calculates balance share percentages across active accounts.
   */
  calculateAccountShares(accounts: AccountWithBalance[]): AccountBalanceShare[] {
    const active = accounts.filter((a) => a.status === 'ACTIVE' && a.calculated_balance > 0);
    const totalPositive = active.reduce((sum, a) => sum + a.calculated_balance, 0);

    if (totalPositive <= 0) return [];

    return active.map((a, idx) => ({
      account_id: a.account_id,
      account_name: a.account_name,
      balance: a.calculated_balance,
      percentage: Math.round((a.calculated_balance / totalPositive) * 1000) / 10,
      color: ACCOUNT_COLORS[idx % ACCOUNT_COLORS.length],
    }));
  },

  /**
   * Fetches the 5 most recent transactions with full details.
   */
  async getRecentTransactions(limit = 5) {
    const { data } = await transactionService.getTransactions({
      page: 1,
      pageSize: limit,
      status: 'Y',
    });
    return data;
  },
};
