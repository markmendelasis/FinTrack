import type { Database } from '@/types/database.types';

export type Account = Database['public']['Tables']['accounts']['Row'];
export type AccountAuditLog = Database['public']['Tables']['account_audit_logs']['Row'];

export interface AccountWithBalance extends Account {
  calculated_balance: number;
  has_transactions: boolean;
}

export interface CreateAccountInput {
  account_name: string;
  initial_balance: number;
}

export interface UpdateInitialBalanceInput {
  account_id: string;
  new_initial_balance: number;
}

export type AccountFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
