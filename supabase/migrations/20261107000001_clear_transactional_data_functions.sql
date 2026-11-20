-- =============================================================================
-- Migration: 20261107000001_clear_transactional_data_functions.sql
-- Description: Creates stored functions and procedures to safely clear
--              transactional data (transactions, transaction audit logs, and
--              account transactional activity) while preserving user-related
--              tables (auth.users, user_profiles, user_profile_audit_logs, accounts)
--              and master lookup tables (transaction_types, categories).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Function: clear_all_transactional_data
-- Purges all transactions and transaction audit records for ALL users.
-- Accessible only by administrators / service_role.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.clear_all_transactional_data(
    p_reset_initial_balances BOOLEAN DEFAULT FALSE,
    p_clear_all_account_logs BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_transactions_count INT := 0;
    v_trans_audit_count INT := 0;
    v_account_audit_count INT := 0;
    v_accounts_reset_count INT := 0;
    v_result JSONB;
BEGIN
    -- 1. Delete from transaction_audit_logs
    WITH deleted_trans_logs AS (
        DELETE FROM public.transaction_audit_logs
        RETURNING audit_log_id
    )
    SELECT COUNT(*) INTO v_trans_audit_count FROM deleted_trans_logs;

    -- 2. Delete from transactions
    WITH deleted_transactions AS (
        DELETE FROM public.transactions
        RETURNING transaction_id
    )
    SELECT COUNT(*) INTO v_transactions_count FROM deleted_transactions;

    -- 3. Delete transactional audit records from account_audit_logs
    IF p_clear_all_account_logs THEN
        WITH deleted_acc_logs AS (
            DELETE FROM public.account_audit_logs
            RETURNING audit_log_id
        )
        SELECT COUNT(*) INTO v_account_audit_count FROM deleted_acc_logs;
    ELSE
        WITH deleted_acc_logs AS (
            DELETE FROM public.account_audit_logs
            WHERE action IN ('INCOME', 'EXPENSE', 'TRANSFER', 'Income', 'Expense', 'Transfer', 'DELETED', 'DELETE')
               OR (new_values ? 'transaction_id')
               OR (old_values ? 'transaction_id')
            RETURNING audit_log_id
        )
        SELECT COUNT(*) INTO v_account_audit_count FROM deleted_acc_logs;
    END IF;

    -- 4. Optionally reset account initial balances to 0.00
    IF p_reset_initial_balances THEN
        WITH updated_accounts AS (
            UPDATE public.accounts
            SET initial_balance = 0.00,
                updated_at = NOW()
            WHERE initial_balance <> 0.00
            RETURNING account_id
        )
        SELECT COUNT(*) INTO v_accounts_reset_count FROM updated_accounts;
    END IF;

    v_result := jsonb_build_object(
        'success', true,
        'scope', 'GLOBAL_ALL_USERS',
        'transactions_deleted', v_transactions_count,
        'transaction_audit_logs_deleted', v_trans_audit_count,
        'account_audit_logs_deleted', v_account_audit_count,
        'accounts_initial_balance_reset', v_accounts_reset_count,
        'cleared_at', NOW()
    );

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.clear_all_transactional_data(BOOLEAN, BOOLEAN)
IS 'Purges all transactional records, transaction audit logs, and account transaction activity logs across all users while preserving user profiles, accounts, and lookup data.';

-- -----------------------------------------------------------------------------
-- 2. Function: clear_user_transactional_data
-- Purges transactional data for a single user (auth.uid() or supplied UUID).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.clear_user_transactional_data(
    p_user_id UUID DEFAULT NULL,
    p_reset_initial_balances BOOLEAN DEFAULT FALSE,
    p_clear_all_account_logs BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_target_auth_id UUID;
    v_profile_id UUID;
    v_transactions_count INT := 0;
    v_trans_audit_count INT := 0;
    v_account_audit_count INT := 0;
    v_accounts_reset_count INT := 0;
    v_result JSONB;
BEGIN
    -- Determine target user: parameter or auth.uid()
    v_target_auth_id := COALESCE(p_user_id, auth.uid());

    IF v_target_auth_id IS NULL THEN
        RAISE EXCEPTION 'Target user ID is required or user must be authenticated';
    END IF;

    -- If called by authenticated user, prevent clearing another user's transactions unless service role
    IF auth.role() = 'authenticated' AND v_target_auth_id <> auth.uid() THEN
        RAISE EXCEPTION 'Access denied: users can only clear their own transactional data';
    END IF;

    -- Lookup user profile id
    SELECT user_profile_id INTO v_profile_id
    FROM public.user_profiles
    WHERE auth_user_id = v_target_auth_id;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'User profile not found for user ID %', v_target_auth_id;
    END IF;

    -- 1. Delete transaction audit logs for transactions owned by this user
    WITH deleted_trans_logs AS (
        DELETE FROM public.transaction_audit_logs
        WHERE transaction_id IN (
            SELECT transaction_id FROM public.transactions
            WHERE user_profile_id = v_profile_id
        )
        RETURNING audit_log_id
    )
    SELECT COUNT(*) INTO v_trans_audit_count FROM deleted_trans_logs;

    -- 2. Delete transactions owned by this user
    WITH deleted_transactions AS (
        DELETE FROM public.transactions
        WHERE user_profile_id = v_profile_id
        RETURNING transaction_id
    )
    SELECT COUNT(*) INTO v_transactions_count FROM deleted_transactions;

    -- 3. Delete transactional audit records on accounts owned by this user
    IF p_clear_all_account_logs THEN
        WITH deleted_acc_logs AS (
            DELETE FROM public.account_audit_logs
            WHERE account_id IN (
                SELECT account_id FROM public.accounts
                WHERE user_profile_id = v_profile_id
            )
            RETURNING audit_log_id
        )
        SELECT COUNT(*) INTO v_account_audit_count FROM deleted_acc_logs;
    ELSE
        WITH deleted_acc_logs AS (
            DELETE FROM public.account_audit_logs
            WHERE account_id IN (
                SELECT account_id FROM public.accounts
                WHERE user_profile_id = v_profile_id
            )
            AND (
                action IN ('INCOME', 'EXPENSE', 'TRANSFER', 'Income', 'Expense', 'Transfer', 'DELETED', 'DELETE')
                OR (new_values ? 'transaction_id')
                OR (old_values ? 'transaction_id')
            )
            RETURNING audit_log_id
        )
        SELECT COUNT(*) INTO v_account_audit_count FROM deleted_acc_logs;
    END IF;

    -- 4. Optionally reset account initial balances
    IF p_reset_initial_balances THEN
        WITH updated_accounts AS (
            UPDATE public.accounts
            SET initial_balance = 0.00,
                updated_at = NOW()
            WHERE user_profile_id = v_profile_id
              AND initial_balance <> 0.00
            RETURNING account_id
        )
        SELECT COUNT(*) INTO v_accounts_reset_count FROM updated_accounts;
    END IF;

    v_result := jsonb_build_object(
        'success', true,
        'scope', 'USER_SPECIFIC',
        'auth_user_id', v_target_auth_id,
        'user_profile_id', v_profile_id,
        'transactions_deleted', v_transactions_count,
        'transaction_audit_logs_deleted', v_trans_audit_count,
        'account_audit_logs_deleted', v_account_audit_count,
        'accounts_initial_balance_reset', v_accounts_reset_count,
        'cleared_at', NOW()
    );

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.clear_user_transactional_data(UUID, BOOLEAN, BOOLEAN)
IS 'Purges transactions, transaction audit logs, and account transactional activity for a single user, preserving user profiles, accounts, and master data.';

-- -----------------------------------------------------------------------------
-- 3. Stored Procedure: sp_clear_transactional_data
-- Allows execution via standard SQL CALL syntax.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE public.sp_clear_transactional_data(
    p_reset_initial_balances BOOLEAN DEFAULT FALSE,
    p_user_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_user_id IS NULL THEN
        PERFORM public.clear_all_transactional_data(p_reset_initial_balances, FALSE);
    ELSE
        PERFORM public.clear_user_transactional_data(p_user_id, p_reset_initial_balances, FALSE);
    END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Grants and Permissions
-- -----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.clear_all_transactional_data(BOOLEAN, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.clear_all_transactional_data(BOOLEAN, BOOLEAN) TO postgres, service_role;

GRANT EXECUTE ON FUNCTION public.clear_user_transactional_data(UUID, BOOLEAN, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON PROCEDURE public.sp_clear_transactional_data(BOOLEAN, UUID) TO postgres, service_role;
