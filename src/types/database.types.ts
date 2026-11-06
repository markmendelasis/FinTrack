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
        Relationships: [];
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
        Relationships: [];
      };
      transaction_types: {
        Row: {
          transaction_type_id: string;
          type_name: 'Income' | 'Expense' | 'Transfer';
          description: string | null;
          status: 'ACTIVE' | 'INACTIVE';
          created_at: string;
          created_by: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          transaction_type_id?: string;
          type_name: 'Income' | 'Expense' | 'Transfer';
          description?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          transaction_type_id?: string;
          type_name?: 'Income' | 'Expense' | 'Transfer';
          description?: string | null;
          status?: 'ACTIVE' | 'INACTIVE';
          created_at?: string;
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          category_id: string;
          transaction_type_id: string;
          category_name: string;
          description: string | null;
          status: 'ACTIVE' | 'INACTIVE';
          created_at: string;
          created_by: string | null;
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
          created_by?: string | null;
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
          created_by?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      account_audit_logs: {
        Row: {
          audit_log_id: string;
          account_id: string;
          action: 'INSERT' | 'UPDATE' | 'DEACTIVATE' | 'REACTIVATE' | 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'DELETE' | string;
          action_description: string;
          old_values: Json | null;
          new_values: Json | null;
          performed_by: string;
          performed_at: string;
        };
        Insert: {
          audit_log_id?: string;
          account_id: string;
          action: 'INSERT' | 'UPDATE' | 'DEACTIVATE' | 'REACTIVATE' | 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'DELETE' | string;
          action_description: string;
          old_values?: Json | null;
          new_values?: Json | null;
          performed_by: string;
          performed_at?: string;
        };
        Update: {
          audit_log_id?: string;
          account_id?: string;
          action?: 'INSERT' | 'UPDATE' | 'DEACTIVATE' | 'REACTIVATE' | 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'DELETE' | string;
          action_description?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          performed_by?: string;
          performed_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      calculate_account_balance: {
        Args: { p_account_id: string };
        Returns: number;
      };
      create_user_profile_and_default_account: {
        Args: { p_user_name: string };
        Returns: string;
      };
      create_account: {
        Args: { p_account_name: string; p_initial_balance?: number };
        Returns: string;
      };
      update_account_initial_balance: {
        Args: { p_account_id: string; p_new_initial_balance: number };
        Returns: void;
      };
      deactivate_account: {
        Args: { p_account_id: string };
        Returns: void;
      };
      reactivate_account: {
        Args: { p_account_id: string };
        Returns: void;
      };
      create_income_transaction: {
        Args: {
          p_account_id: string;
          p_category_id: string;
          p_amount: number;
          p_transaction_date: string;
          p_description?: string | null;
        };
        Returns: string;
      };
      create_expense_transaction: {
        Args: {
          p_account_id: string;
          p_category_id: string;
          p_amount: number;
          p_transaction_date: string;
          p_description?: string | null;
        };
        Returns: string;
      };
      create_transfer_transaction: {
        Args: {
          p_source_account_id: string;
          p_destination_account_id: string;
          p_amount: number;
          p_transfer_fee?: number;
          p_transaction_date?: string;
          p_description?: string | null;
        };
        Returns: string;
      };
      edit_income_expense_transaction: {
        Args: {
          p_transaction_id: string;
          p_new_account_id: string;
          p_new_category_id: string;
          p_new_transaction_type_id: string;
          p_new_amount: number;
          p_new_description?: string | null;
        };
        Returns: void;
      };
      soft_delete_transaction: {
        Args: { p_transaction_id: string };
        Returns: void;
      };
      get_dashboard_summary: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_balance: number;
          total_income: number;
          total_expense: number;
          total_transfer_fees: number;
        };
      };
    };
    Enums: Record<string, never>;
  };
}
