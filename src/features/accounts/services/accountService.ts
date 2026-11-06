import { supabase } from '@/lib/supabase/client';
import type {
  AccountWithBalance,
  AccountAuditLog,
  CreateAccountInput,
  UpdateInitialBalanceInput,
} from '../types/account.types';

export const accountService = {
  /**
   * Fetches all accounts belonging to the authenticated user along with their
   * dynamically calculated balances and transaction lock state.
   */
  async getAccounts(): Promise<AccountWithBalance[]> {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    if (!accounts || accounts.length === 0) {
      return [];
    }

    // Enhance each account with calculated dynamic balance and transaction presence check
    const accountsWithBalance: AccountWithBalance[] = await Promise.all(
      accounts.map(async (account) => {
        let calculated_balance = Number(account.initial_balance);

        try {
          const { data: balanceData, error: balanceError } = await supabase.rpc(
            'calculate_account_balance',
            { p_account_id: account.account_id }
          );

          if (!balanceError && balanceData !== null) {
            calculated_balance = Number(balanceData);
          }
        } catch (err) {
          console.warn(`[FinTrack] Could not compute RPC balance for account ${account.account_id}:`, err);
        }

        // Check if any transaction is associated with this account (locks initial balance editing)
        let has_transactions = false;
        try {
          const { count, error: countError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .or(`account_id.eq.${account.account_id},destination_account_id.eq.${account.account_id}`);

          if (!countError && count !== null) {
            has_transactions = count > 0;
          }
        } catch (err) {
          console.warn(`[FinTrack] Could not check transactions for account ${account.account_id}:`, err);
        }

        return {
          ...account,
          calculated_balance,
          has_transactions,
        };
      })
    );

    return accountsWithBalance;
  },

  /**
   * Creates a new financial account using the approved PostgreSQL RPC function.
   */
  async createAccount(input: CreateAccountInput): Promise<string> {
    const trimmedName = input.account_name.trim();
    if (!trimmedName) {
      throw new Error('Account name is required');
    }

    if (input.initial_balance < 0) {
      throw new Error('Initial balance cannot be negative');
    }

    const { data, error } = await supabase.rpc('create_account', {
      p_account_name: trimmedName,
      p_initial_balance: Number(input.initial_balance),
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Modifies an account's initial balance. Rejection is enforced at the database
   * level if any transaction already exists on the account.
   */
  async updateInitialBalance(input: UpdateInitialBalanceInput): Promise<void> {
    if (input.new_initial_balance < 0) {
      throw new Error('Initial balance cannot be negative');
    }

    const { error } = await supabase.rpc('update_account_initial_balance', {
      p_account_id: input.account_id,
      p_new_initial_balance: Number(input.new_initial_balance),
    });

    if (error) {
      throw error;
    }
  },

  /**
   * Deactivates an account if its calculated balance is 0.00 and it is not
   * the user's last active account. Enforced by PostgreSQL RPC.
   */
  async deactivateAccount(accountId: string): Promise<void> {
    const { error } = await supabase.rpc('deactivate_account', {
      p_account_id: accountId,
    });

    if (error) {
      throw error;
    }
  },

  /**
   * Reactivates an inactive financial account.
   */
  async reactivateAccount(accountId: string): Promise<void> {
    const { error } = await supabase.rpc('reactivate_account', {
      p_account_id: accountId,
    });

    if (error) {
      throw error;
    }
  },

  /**
   * Retrieves the immutable audit log history for a specific account.
   */
  async getAccountAuditLogs(accountId: string): Promise<AccountAuditLog[]> {
    const { data, error } = await supabase
      .from('account_audit_logs')
      .select('*')
      .eq('account_id', accountId)
      .order('performed_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },
};
