import type { Database } from '@/types/database.types';

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionType = Database['public']['Tables']['transaction_types']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type TransactionAuditLog = Database['public']['Tables']['transaction_audit_logs']['Row'];

export interface TransactionWithDetails extends Transaction {
  account_name: string;
  destination_account_name?: string | null;
  category_name?: string | null;
  type_name: 'Income' | 'Expense' | 'Transfer';
}

export interface CreateIncomeInput {
  account_id: string;
  category_id: string;
  amount: number;
  transaction_date: string;
  description?: string;
}

export interface CreateExpenseInput {
  account_id: string;
  category_id: string;
  amount: number;
  transaction_date: string;
  description?: string;
}

export interface CreateTransferInput {
  source_account_id: string;
  destination_account_id: string;
  amount: number;
  transfer_fee: number;
  transaction_date: string;
  description?: string;
}

export interface EditTransactionInput {
  transaction_id: string;
  new_account_id: string;
  new_category_id: string;
  new_transaction_type_id: string;
  new_amount: number;
  new_description?: string;
}

export interface TransactionFilterParams {
  typeId?: string;
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  status?: 'Y' | 'N' | 'ALL';
  page?: number;
  pageSize?: number;
}
