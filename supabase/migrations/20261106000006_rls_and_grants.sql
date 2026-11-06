-- =============================================================================
-- Migration: 20261106000006_rls_and_grants.sql
-- Description: Enables Row Level Security (RLS) on all 8 tables, configures
--              per-table access policies, and defines least-privilege SQL grants.
-- Standards: Follows SECURITY.md Section 4 and DATABASE_DESIGN.md Section 10.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Enable Row Level Security (RLS) on all 8 tables
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_audit_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. Policies: user_profiles
-- Users can only view and update their own application profile.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_user_profiles_select ON public.user_profiles;
CREATE POLICY p_user_profiles_select ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS p_user_profiles_update ON public.user_profiles;
CREATE POLICY p_user_profiles_update ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS p_user_profiles_insert ON public.user_profiles;
CREATE POLICY p_user_profiles_insert ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = auth_user_id);

-- -----------------------------------------------------------------------------
-- 3. Policies: accounts
-- Users can read their own accounts. Writes occur through trusted functions.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_accounts_select ON public.accounts;
CREATE POLICY p_accounts_select ON public.accounts
    FOR SELECT
    TO authenticated
    USING (
        user_profile_id IN (
            SELECT user_profile_id FROM public.user_profiles WHERE auth_user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- 4. Policies: transaction_types & categories (Lookup tables)
-- Publicly readable by all authenticated and anonymous clients; read-only.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_transaction_types_select ON public.transaction_types;
CREATE POLICY p_transaction_types_select ON public.transaction_types
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS p_categories_select ON public.categories;
CREATE POLICY p_categories_select ON public.categories
    FOR SELECT
    TO public
    USING (true);

-- -----------------------------------------------------------------------------
-- 5. Policies: transactions
-- Users can read their own active and historical transactions.
-- Financial writes occur exclusively via approved PostgreSQL RPC functions.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_transactions_select ON public.transactions;
CREATE POLICY p_transactions_select ON public.transactions
    FOR SELECT
    TO authenticated
    USING (
        user_profile_id IN (
            SELECT user_profile_id FROM public.user_profiles WHERE auth_user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- 6. Policies: transaction_audit_logs
-- Users can read audit entries for transactions they own. Modification forbidden.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_transaction_audit_logs_select ON public.transaction_audit_logs;
CREATE POLICY p_transaction_audit_logs_select ON public.transaction_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        transaction_id IN (
            SELECT transaction_id FROM public.transactions
            WHERE user_profile_id IN (
                SELECT user_profile_id FROM public.user_profiles WHERE auth_user_id = auth.uid()
            )
        )
    );

-- -----------------------------------------------------------------------------
-- 7. Policies: account_audit_logs
-- Users can read audit entries for accounts they own. Modification forbidden.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_account_audit_logs_select ON public.account_audit_logs;
CREATE POLICY p_account_audit_logs_select ON public.account_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        account_id IN (
            SELECT account_id FROM public.accounts
            WHERE user_profile_id IN (
                SELECT user_profile_id FROM public.user_profiles WHERE auth_user_id = auth.uid()
            )
        )
    );

-- -----------------------------------------------------------------------------
-- 8. Policies: user_profile_audit_logs
-- Users can read audit entries for their own profile. Modification forbidden.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS p_user_profile_audit_logs_select ON public.user_profile_audit_logs;
CREATE POLICY p_user_profile_audit_logs_select ON public.user_profile_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        user_profile_id IN (
            SELECT user_profile_id FROM public.user_profiles WHERE auth_user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- 9. Permissions & SQL Grants (Least Privilege Principle)
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Lookup tables: read-only
GRANT SELECT ON public.transaction_types TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;

-- User profile: read and update own profile
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;

-- Accounts and transactions: read own records (writes via RPC)
GRANT SELECT ON public.accounts TO authenticated;
GRANT SELECT ON public.transactions TO authenticated;

-- Audit tables: read own records only
GRANT SELECT ON public.transaction_audit_logs TO authenticated;
GRANT SELECT ON public.account_audit_logs TO authenticated;
GRANT SELECT ON public.user_profile_audit_logs TO authenticated;

-- Revoke all direct modifications on audit logs
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.transaction_audit_logs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.account_audit_logs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.user_profile_audit_logs FROM anon, authenticated;

-- Revoke direct table modifications on lookup tables
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.transaction_types FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.categories FROM anon, authenticated;

-- Grant execution on approved financial RPC functions
GRANT EXECUTE ON FUNCTION public.calculate_account_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile_and_default_account(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_account(TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_account_initial_balance(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reactivate_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_income_transaction(UUID, UUID, NUMERIC, DATE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_expense_transaction(UUID, UUID, NUMERIC, DATE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_transfer_transaction(UUID, UUID, NUMERIC, NUMERIC, DATE, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.edit_income_expense_transaction(UUID, UUID, UUID, UUID, NUMERIC, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_transaction(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary() TO authenticated;
