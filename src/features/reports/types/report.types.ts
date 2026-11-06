import type { TransactionWithDetails } from '@/features/transactions/types/transaction.types';

export type DatePreset = 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'ALL_TIME' | 'CUSTOM';

export interface ReportFilterState {
  preset: DatePreset;
  startDate: string;
  endDate: string;
  accountId?: string;
  transactionTypeId?: string;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  totalTransferFees: number;
  netSavings: number;
  transactionCount: number;
}

export interface CategorySummaryItem {
  categoryName: string;
  typeName: 'Income' | 'Expense';
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface AccountActivityItem {
  accountId: string;
  accountName: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalInflow: number;
  totalOutflow: number;
  totalFees: number;
  netChange: number;
}

export interface ReportData {
  summary: ReportSummary;
  categoryBreakdown: CategorySummaryItem[];
  accountActivity: AccountActivityItem[];
  transactions: TransactionWithDetails[];
}
