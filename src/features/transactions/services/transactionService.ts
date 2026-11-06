import { supabase } from '@/lib/supabase/client';
import type {
  TransactionType,
  Category,
  TransactionWithDetails,
  CreateIncomeInput,
  CreateExpenseInput,
  CreateTransferInput,
  EditTransactionInput,
  TransactionFilterParams,
  TransactionAuditLog,
} from '../types/transaction.types';

export const transactionService = {
  /**
   * Fetches supported transaction types (Income, Expense, Transfer).
   */
  async getTransactionTypes(): Promise<TransactionType[]> {
    const { data, error } = await supabase
      .from('transaction_types')
      .select('*')
      .order('type_name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches global categories, optionally filtered by transaction type ID.
   */
  async getCategories(transactionTypeId?: string): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .order('category_name', { ascending: true });

    if (transactionTypeId) {
      query = query.eq('transaction_type_id', transactionTypeId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches paginated, filtered transactions with account and category details.
   */
  async getTransactions(params: TransactionFilterParams = {}): Promise<{
    data: TransactionWithDetails[];
    totalCount: number;
  }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('transactions')
      .select(
        `
        *,
        accounts!fk_trans_source_account_owner (account_name),
        dest_account:accounts!fk_trans_dest_account_owner (account_name),
        categories (category_name),
        transaction_types (type_name)
      `,
        { count: 'exact' }
      );

    // Filter by status (default is active 'Y' only unless 'ALL' or 'N' requested)
    if (params.status && params.status !== 'ALL') {
      query = query.eq('status', params.status);
    } else if (!params.status) {
      query = query.eq('status', 'Y');
    }

    // Filter by transaction type
    if (params.typeId) {
      query = query.eq('transaction_type_id', params.typeId);
    }

    // Filter by account (either source or destination)
    if (params.accountId) {
      query = query.or(
        `account_id.eq.${params.accountId},destination_account_id.eq.${params.accountId}`
      );
    }

    // Filter by category
    if (params.categoryId) {
      query = query.eq('category_id', params.categoryId);
    }

    // Filter by date range
    if (params.startDate) {
      query = query.gte('transaction_date', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('transaction_date', params.endDate);
    }

    // Filter by search keyword in description
    if (params.search && params.search.trim()) {
      query = query.ilike('description', `%${params.search.trim()}%`);
    }

    // Sort order: most recent transaction_date first, then created_at DESC
    query = query
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw error;
    }

    interface SupabaseRawTransactionRow {
      transaction_id: string;
      user_profile_id: string;
      account_id: string;
      destination_account_id: string | null;
      category_id: string | null;
      transaction_type_id: string;
      description: string | null;
      amount: number;
      transfer_fee: number;
      transaction_date: string;
      status: 'Y' | 'N';
      created_at: string;
      created_by: string;
      updated_at: string | null;
      updated_by: string | null;
      accounts?: { account_name: string } | null;
      dest_account?: { account_name: string } | null;
      categories?: { category_name: string } | null;
      transaction_types?: { type_name: 'Income' | 'Expense' | 'Transfer' } | null;
    }

    const formattedData: TransactionWithDetails[] = ((data as unknown as SupabaseRawTransactionRow[]) || []).map((row) => ({
      transaction_id: row.transaction_id,
      user_profile_id: row.user_profile_id,
      account_id: row.account_id,
      destination_account_id: row.destination_account_id,
      category_id: row.category_id,
      transaction_type_id: row.transaction_type_id,
      description: row.description,
      amount: Number(row.amount),
      transfer_fee: Number(row.transfer_fee || 0),
      transaction_date: row.transaction_date,
      status: row.status,
      created_at: row.created_at,
      created_by: row.created_by,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      account_name: row.accounts?.account_name || 'Account',
      destination_account_name: row.dest_account?.account_name || null,
      category_name: row.categories?.category_name || null,
      type_name: row.transaction_types?.type_name || 'Expense',
    }));

    return {
      data: formattedData,
      totalCount: count || 0,
    };
  },

  /**
   * Creates an Income transaction using the approved PostgreSQL RPC function.
   */
  async createIncome(input: CreateIncomeInput): Promise<string> {
    const { data, error } = await supabase.rpc('create_income_transaction', {
      p_account_id: input.account_id,
      p_category_id: input.category_id,
      p_amount: Number(input.amount),
      p_transaction_date: input.transaction_date,
      p_description: input.description?.trim() || null,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Creates an Expense transaction using the approved PostgreSQL RPC function.
   * Rejection is enforced at the database level if resulting balance < 0.
   */
  async createExpense(input: CreateExpenseInput): Promise<string> {
    const { data, error } = await supabase.rpc('create_expense_transaction', {
      p_account_id: input.account_id,
      p_category_id: input.category_id,
      p_amount: Number(input.amount),
      p_transaction_date: input.transaction_date,
      p_description: input.description?.trim() || null,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Creates a Transfer transaction moving funds between two accounts.
   * Rejection is enforced if source has insufficient funds for amount + fee.
   */
  async createTransfer(input: CreateTransferInput): Promise<string> {
    const { data, error } = await supabase.rpc('create_transfer_transaction', {
      p_source_account_id: input.source_account_id,
      p_destination_account_id: input.destination_account_id,
      p_amount: Number(input.amount),
      p_transfer_fee: Number(input.transfer_fee || 0),
      p_transaction_date: input.transaction_date,
      p_description: input.description?.trim() || null,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Edits an Income or Expense transaction under reversal-and-reapplication
   * balance validation. Date editing and Transfer editing are strictly rejected.
   */
  async editIncomeExpense(input: EditTransactionInput): Promise<void> {
    const { error } = await supabase.rpc('edit_income_expense_transaction', {
      p_transaction_id: input.transaction_id,
      p_new_account_id: input.new_account_id,
      p_new_category_id: input.new_category_id,
      p_new_transaction_type_id: input.new_transaction_type_id,
      p_new_amount: Number(input.new_amount),
      p_new_description: input.new_description?.trim() || null,
    });

    if (error) {
      throw error;
    }
  },

  /**
   * Soft-deletes a transaction by setting status = 'N' after reversing
   * its financial effect and ensuring resulting balances remain non-negative.
   */
  async softDeleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_transaction', {
      p_transaction_id: transactionId,
    });

    if (error) {
      throw error;
    }
  },

  /**
   * Fetches the immutable audit trail for a specific transaction.
   */
  async getTransactionAuditLogs(transactionId: string): Promise<TransactionAuditLog[]> {
    const { data, error } = await supabase
      .from('transaction_audit_logs')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('performed_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },
};
