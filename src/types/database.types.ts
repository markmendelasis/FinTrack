export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          user_profile_id: string;
          auth_user_id: string;
          user_name: string;
          status: 'ACTIVE' | 'INACTIVE';
          created_at: string;
          created_by: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          user_profile_id?: string;
          auth_user_id: string;
          user_name: string;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          user_profile_id?: string;
          auth_user_id?: string;
          user_name?: string;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
      accounts: {
        Row: {
          account_id: string;
          user_profile_id: string;
          account_name: string;
          initial_balance: number;
          status: 'ACTIVE' | 'INACTIVE';
          created_at: string;
          created_by: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          account_id?: string;
          user_profile_id: string;
          account_name: string;
          initial_balance?: number;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          account_id?: string;
          user_profile_id?: string;
          account_name?: string;
          initial_balance?: number;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
      transaction_types: {
        Row: {
          transaction_type_id: string;
          type_name: 'Income' | 'Expense' | 'Transfer';
          description: string | null;
          status: 'ACTIVE' | 'INACTIVE';
          created_at: string;
          created_by: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          transaction_type_id?: string;
          type_name: 'Income' | 'Expense' | 'Transfer';
          description?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          transaction_type_id?: string;
          type_name?: 'Income' | 'Expense' | 'Transfer';
          description?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
      categories: {
        Row: {
          category_id: string;
          transaction_type_id: string;
          category_name: string;
          description: string | null;
          status: 'ACTIVE' | 'INACTIVE';
          created_at: string;
          created_by: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          category_id?: string;
          transaction_type_id: string;
          category_name: string;
          description?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          category_id?: string;
          transaction_type_id?: string;
          category_name?: string;
          description?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
      transactions: {
        Row: {
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
        };
        Insert: {
          transaction_id?: string;
          user_profile_id: string;
          account_id: string;
          destination_account_id?: string | null;
          category_id?: string | null;
          transaction_type_id: string;
          description?: string | null;
          amount: number;
          transfer_fee?: number;
          transaction_date: string;
          status?: 'Y' | 'N';
          created_at?: string;
          created_by: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          transaction_id?: string;
          user_profile_id?: string;
          account_id?: string;
          destination_account_id?: string | null;
          category_id?: string | null;
          transaction_type_id?: string;
          description?: string | null;
          amount?: number;
          transfer_fee?: number;
          transaction_date?: string;
          status?: 'Y' | 'N';
          created_at?: string;
          created_by?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
      transaction_audit_logs: {
        Row: {
          audit_log_id: string;
          transaction_id: string;
          action: string;
          action_description: string;
          old_values: Json | null;
          new_values: Json | null;
          performed_by: string;
          performed_at: string;
        };
        Insert: {
          audit_log_id?: string;
          transaction_id: string;
          action: string;
          action_description: string;
          old_values?: Json | null;
          new_values?: Json | null;
          performed_by: string;
          performed_at?: string;
        };
        Update: {
          audit_log_id?: string;
          transaction_id?: string;
          action?: string;
          action_description?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          performed_by?: string;
          performed_at?: string;
        };
      };
      account_audit_logs: {
        Row: {
          audit_log_id: string;
          account_id: string;
          action: 'INSERT' | 'UPDATE' | 'DEACTIVATE' | 'REACTIVATE';
          action_description: string;
          old_values: Json | null;
          new_values: Json | null;
          performed_by: string;
          performed_at: string;
        };
        Insert: {
          audit_log_id?: string;
          account_id: string;
          action: 'INSERT' | 'UPDATE' | 'DEACTIVATE' | 'REACTIVATE';
          action_description: string;
          old_values?: Json | null;
          new_values?: Json | null;
          performed_by: string;
          performed_at?: string;
        };
        Update: {
          audit_log_id?: string;
          account_id?: string;
          action?: 'INSERT' | 'UPDATE' | 'DEACTIVATE' | 'REACTIVATE';
          action_description?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          performed_by?: string;
          performed_at?: string;
        };
      };
      user_profile_audit_logs: {
        Row: {
          audit_log_id: string;
          user_profile_id: string;
          action: string;
          action_description: string;
          old_values: Json | null;
          new_values: Json | null;
          performed_by: string;
          performed_at: string;
        };
        Insert: {
          audit_log_id?: string;
          user_profile_id: string;
          action: string;
          action_description: string;
          old_values?: Json | null;
          new_values?: Json | null;
          performed_by: string;
          performed_at?: string;
        };
        Update: {
          audit_log_id?: string;
          user_profile_id?: string;
          action?: string;
          action_description?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          performed_by?: string;
          performed_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
