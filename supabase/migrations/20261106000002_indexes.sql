-- =============================================================================
-- Migration: 20261106000002_indexes.sql
-- Description: Creates the approved performance indexes without duplication.
-- Standards: Follows DATABASE_DESIGN.md Section 11.
-- =============================================================================

-- Accounts indexing
CREATE INDEX IF NOT EXISTS idx_accounts_user_profile_status
    ON public.accounts (user_profile_id, status);

-- Transactions indexing
CREATE INDEX IF NOT EXISTS idx_transactions_user_profile_status_date
    ON public.transactions (user_profile_id, status, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_account_user_profile
    ON public.transactions (account_id, user_profile_id);

CREATE INDEX IF NOT EXISTS idx_transactions_dest_account_user_profile
    ON public.transactions (destination_account_id, user_profile_id)
    WHERE destination_account_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_category_type
    ON public.transactions (category_id, transaction_type_id)
    WHERE category_id IS NOT NULL;

-- Categories indexing
CREATE INDEX IF NOT EXISTS idx_categories_type_status
    ON public.categories (transaction_type_id, status);

-- Audit logs indexing
CREATE INDEX IF NOT EXISTS idx_trans_audit_logs_trans_performed
    ON public.transaction_audit_logs (transaction_id, performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_account_audit_logs_account_performed
    ON public.account_audit_logs (account_id, performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profile_audit_logs_profile_performed
    ON public.user_profile_audit_logs (user_profile_id, performed_at DESC);
