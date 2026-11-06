-- =============================================================================
-- Migration: 20261106000005_financial_functions.sql
-- Description: Creates the approved PostgreSQL RPC functions for authoritative
--              financial validation, calculations, balance integrity, and operations.
-- Standards: Follows BACKEND_ARCHITECTURE.md Section 6 and DATABASE_DESIGN.md Section 7-9.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Function: calculate_account_balance
-- Dynamically derives current account balance from opening balance and active transactions.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_account_balance(p_account_id UUID)
RETURNS NUMERIC(12,2)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_initial_balance NUMERIC(12,2);
    v_total_income NUMERIC(12,2);
    v_total_expense NUMERIC(12,2);
    v_outgoing_transfers NUMERIC(12,2);
    v_incoming_transfers NUMERIC(12,2);
    v_transfer_fees NUMERIC(12,2);
BEGIN
    SELECT initial_balance INTO v_initial_balance
    FROM public.accounts
    WHERE account_id = p_account_id;

    IF v_initial_balance IS NULL THEN
        RETURN 0.00;
    END IF;

    -- Active Income (status = 'Y')
    SELECT COALESCE(SUM(t.amount), 0.00) INTO v_total_income
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    WHERE t.account_id = p_account_id
      AND t.status = 'Y'
      AND tt.type_name = 'Income';

    -- Active Expense (status = 'Y')
    SELECT COALESCE(SUM(t.amount), 0.00) INTO v_total_expense
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    WHERE t.account_id = p_account_id
      AND t.status = 'Y'
      AND tt.type_name = 'Expense';

    -- Outgoing Transfers (amount only)
    SELECT COALESCE(SUM(t.amount), 0.00) INTO v_outgoing_transfers
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    WHERE t.account_id = p_account_id
      AND t.status = 'Y'
      AND tt.type_name = 'Transfer';

    -- Incoming Transfers (credited to destination)
    SELECT COALESCE(SUM(t.amount), 0.00) INTO v_incoming_transfers
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    WHERE t.destination_account_id = p_account_id
      AND t.status = 'Y'
      AND tt.type_name = 'Transfer';

    -- Outgoing Transfer Fees (deducted from source)
    SELECT COALESCE(SUM(t.transfer_fee), 0.00) INTO v_transfer_fees
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    WHERE t.account_id = p_account_id
      AND t.status = 'Y'
      AND tt.type_name = 'Transfer';

    RETURN v_initial_balance + v_total_income - v_total_expense - v_outgoing_transfers + v_incoming_transfers - v_transfer_fees;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Function: create_user_profile_and_default_account
-- Trusted registration handler: provisions profile and default Cash Wallet.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_user_profile_and_default_account(
    p_user_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
    v_existing_profile_id UUID;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Check idempotency
    SELECT user_profile_id INTO v_existing_profile_id
    FROM public.user_profiles
    WHERE auth_user_id = v_auth_uid;

    IF v_existing_profile_id IS NOT NULL THEN
        RETURN v_existing_profile_id;
    END IF;

    -- Create profile
    INSERT INTO public.user_profiles (
        auth_user_id,
        user_name,
        created_by
    ) VALUES (
        v_auth_uid,
        COALESCE(NULLIF(TRIM(p_user_name), ''), 'FinTrack User'),
        v_auth_uid
    ) RETURNING user_profile_id INTO v_profile_id;

    -- Create default Cash Wallet with 0.00 initial balance
    INSERT INTO public.accounts (
        user_profile_id,
        account_name,
        initial_balance,
        status,
        created_by
    ) VALUES (
        v_profile_id,
        'Cash Wallet',
        0.00,
        'ACTIVE',
        v_auth_uid
    );

    RETURN v_profile_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. Function: create_account
-- Creates an additional financial account for the authenticated user.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_account(
    p_account_name TEXT,
    p_initial_balance NUMERIC(12,2) DEFAULT 0.00
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
    v_account_id UUID;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_initial_balance < 0 THEN
        RAISE EXCEPTION 'Initial balance cannot be negative';
    END IF;

    SELECT user_profile_id INTO v_profile_id
    FROM public.user_profiles
    WHERE auth_user_id = v_auth_uid AND status = 'ACTIVE';

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Active user profile not found';
    END IF;

    INSERT INTO public.accounts (
        user_profile_id,
        account_name,
        initial_balance,
        status,
        created_by
    ) VALUES (
        v_profile_id,
        TRIM(p_account_name),
        COALESCE(p_initial_balance, 0.00),
        'ACTIVE',
        v_auth_uid
    ) RETURNING account_id INTO v_account_id;

    RETURN v_account_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Function: update_account_initial_balance
-- Modifies opening balance ONLY before any transaction exists.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_account_initial_balance(
    p_account_id UUID,
    p_new_initial_balance NUMERIC(12,2)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
    v_has_transactions BOOLEAN;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_new_initial_balance < 0 THEN
        RAISE EXCEPTION 'Initial balance cannot be negative';
    END IF;

    -- Lock and verify ownership
    SELECT a.user_profile_id INTO v_profile_id
    FROM public.accounts a
    JOIN public.user_profiles up ON a.user_profile_id = up.user_profile_id
    WHERE a.account_id = p_account_id
      AND up.auth_user_id = v_auth_uid
    FOR UPDATE OF a;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Account not found or access denied';
    END IF;

    -- Check if any transaction exists for this account
    SELECT EXISTS (
        SELECT 1 FROM public.transactions
        WHERE account_id = p_account_id OR destination_account_id = p_account_id
    ) INTO v_has_transactions;

    IF v_has_transactions THEN
        RAISE EXCEPTION 'Initial balance is locked: transactions already exist on this account';
    END IF;

    UPDATE public.accounts
    SET initial_balance = p_new_initial_balance,
        updated_at = NOW(),
        updated_by = v_auth_uid
    WHERE account_id = p_account_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 5. Function: deactivate_account
-- Deactivates an account if balance is 0.00 and it is not the last active account.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deactivate_account(p_account_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
    v_active_accounts_count INT;
    v_current_balance NUMERIC(12,2);
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Lock all accounts of the user to prevent concurrency race
    SELECT user_profile_id INTO v_profile_id
    FROM public.user_profiles
    WHERE auth_user_id = v_auth_uid;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    PERFORM 1
    FROM public.accounts
    WHERE user_profile_id = v_profile_id
    FOR UPDATE;

    -- Verify target account belongs to profile and is active
    IF NOT EXISTS (
        SELECT 1 FROM public.accounts
        WHERE account_id = p_account_id
          AND user_profile_id = v_profile_id
          AND status = 'ACTIVE'
    ) THEN
        RAISE EXCEPTION 'Account not found, access denied, or already inactive';
    END IF;

    -- Verify user has at least one other active account
    SELECT COUNT(*) INTO v_active_accounts_count
    FROM public.accounts
    WHERE user_profile_id = v_profile_id
      AND status = 'ACTIVE'
      AND account_id <> p_account_id;

    IF v_active_accounts_count < 1 THEN
        RAISE EXCEPTION 'Cannot deactivate the last active account: every user must have at least one active account';
    END IF;

    -- Validate balance is zero
    v_current_balance := public.calculate_account_balance(p_account_id);
    IF v_current_balance <> 0.00 THEN
        RAISE EXCEPTION 'Account balance must be exactly ₱0.00 to deactivate (current balance: ₱%s)', v_current_balance;
    END IF;

    UPDATE public.accounts
    SET status = 'INACTIVE',
        updated_at = NOW(),
        updated_by = v_auth_uid
    WHERE account_id = p_account_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. Function: reactivate_account
-- Reactivates an inactive financial account.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reactivate_account(p_account_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT a.user_profile_id INTO v_profile_id
    FROM public.accounts a
    JOIN public.user_profiles up ON a.user_profile_id = up.user_profile_id
    WHERE a.account_id = p_account_id
      AND up.auth_user_id = v_auth_uid;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Account not found or access denied';
    END IF;

    UPDATE public.accounts
    SET status = 'ACTIVE',
        updated_at = NOW(),
        updated_by = v_auth_uid
    WHERE account_id = p_account_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. Function: create_income_transaction
-- Records income, validates category type and account status.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_income_transaction(
    p_account_id UUID,
    p_category_id UUID,
    p_amount NUMERIC(12,2),
    p_transaction_date DATE,
    p_description VARCHAR(255) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
    v_income_type_id UUID;
    v_transaction_id UUID;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Transaction amount must be greater than zero';
    END IF;

    IF p_transaction_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Future transaction dates are not allowed';
    END IF;

    SELECT transaction_type_id INTO v_income_type_id
    FROM public.transaction_types
    WHERE type_name = 'Income' AND status = 'ACTIVE';

    -- Verify category belongs to Income and is active
    IF NOT EXISTS (
        SELECT 1 FROM public.categories
        WHERE category_id = p_category_id
          AND transaction_type_id = v_income_type_id
          AND status = 'ACTIVE'
    ) THEN
        RAISE EXCEPTION 'Invalid or inactive income category';
    END IF;

    -- Lock and verify account ownership and ACTIVE status
    SELECT a.user_profile_id INTO v_profile_id
    FROM public.accounts a
    JOIN public.user_profiles up ON a.user_profile_id = up.user_profile_id
    WHERE a.account_id = p_account_id
      AND up.auth_user_id = v_auth_uid
      AND a.status = 'ACTIVE'
    FOR UPDATE OF a;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Account not found, inactive, or access denied';
    END IF;

    INSERT INTO public.transactions (
        user_profile_id,
        account_id,
        destination_account_id,
        category_id,
        transaction_type_id,
        description,
        amount,
        transfer_fee,
        transaction_date,
        status,
        created_by
    ) VALUES (
        v_profile_id,
        p_account_id,
        NULL,
        p_category_id,
        v_income_type_id,
        TRIM(p_description),
        p_amount,
        0.00,
        p_transaction_date,
        'Y',
        v_auth_uid
    ) RETURNING transaction_id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 8. Function: create_expense_transaction
-- Records expense, checks resulting balance to prevent negative balances.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_expense_transaction(
    p_account_id UUID,
    p_category_id UUID,
    p_amount NUMERIC(12,2),
    p_transaction_date DATE,
    p_description VARCHAR(255) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
    v_expense_type_id UUID;
    v_current_balance NUMERIC(12,2);
    v_transaction_id UUID;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Transaction amount must be greater than zero';
    END IF;

    IF p_transaction_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Future transaction dates are not allowed';
    END IF;

    SELECT transaction_type_id INTO v_expense_type_id
    FROM public.transaction_types
    WHERE type_name = 'Expense' AND status = 'ACTIVE';

    -- Verify category belongs to Expense and is active
    IF NOT EXISTS (
        SELECT 1 FROM public.categories
        WHERE category_id = p_category_id
          AND transaction_type_id = v_expense_type_id
          AND status = 'ACTIVE'
    ) THEN
        RAISE EXCEPTION 'Invalid or inactive expense category';
    END IF;

    -- Lock and verify account ownership and ACTIVE status
    SELECT a.user_profile_id INTO v_profile_id
    FROM public.accounts a
    JOIN public.user_profiles up ON a.user_profile_id = up.user_profile_id
    WHERE a.account_id = p_account_id
      AND up.auth_user_id = v_auth_uid
      AND a.status = 'ACTIVE'
    FOR UPDATE OF a;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Account not found, inactive, or access denied';
    END IF;

    -- Check resulting balance
    v_current_balance := public.calculate_account_balance(p_account_id);
    IF (v_current_balance - p_amount) < 0.00 THEN
        RAISE EXCEPTION 'Insufficient funds: resulting balance cannot be negative (available: ₱%s, requested: ₱%s)',
                        v_current_balance, p_amount;
    END IF;

    INSERT INTO public.transactions (
        user_profile_id,
        account_id,
        destination_account_id,
        category_id,
        transaction_type_id,
        description,
        amount,
        transfer_fee,
        transaction_date,
        status,
        created_by
    ) VALUES (
        v_profile_id,
        p_account_id,
        NULL,
        p_category_id,
        v_expense_type_id,
        TRIM(p_description),
        p_amount,
        0.00,
        p_transaction_date,
        'Y',
        v_auth_uid
    ) RETURNING transaction_id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 9. Function: create_transfer_transaction
-- Records transfer between two accounts with deadlock-safe locking.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_transfer_transaction(
    p_source_account_id UUID,
    p_destination_account_id UUID,
    p_amount NUMERIC(12,2),
    p_transfer_fee NUMERIC(12,2) DEFAULT 0.00,
    p_transaction_date DATE DEFAULT CURRENT_DATE,
    p_description VARCHAR(255) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
    v_transfer_type_id UUID;
    v_source_balance NUMERIC(12,2);
    v_total_deduction NUMERIC(12,2);
    v_fee NUMERIC(12,2);
    v_transaction_id UUID;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_source_account_id = p_destination_account_id THEN
        RAISE EXCEPTION 'Source and destination accounts must be different';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Transfer amount must be greater than zero';
    END IF;

    v_fee := COALESCE(p_transfer_fee, 0.00);
    IF v_fee < 0 THEN
        RAISE EXCEPTION 'Transfer fee cannot be negative';
    END IF;

    IF p_transaction_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Future transaction dates are not allowed';
    END IF;

    SELECT user_profile_id INTO v_profile_id
    FROM public.user_profiles
    WHERE auth_user_id = v_auth_uid AND status = 'ACTIVE';

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Active user profile not found';
    END IF;

    SELECT transaction_type_id INTO v_transfer_type_id
    FROM public.transaction_types
    WHERE type_name = 'Transfer' AND status = 'ACTIVE';

    -- Deadlock-safe row locking in consistent UUID order
    PERFORM 1
    FROM public.accounts
    WHERE account_id IN (p_source_account_id, p_destination_account_id)
      AND user_profile_id = v_profile_id
      AND status = 'ACTIVE'
    ORDER BY account_id
    FOR UPDATE;

    -- Verify both accounts exist, belong to user, and are ACTIVE
    IF (
        SELECT COUNT(*)
        FROM public.accounts
        WHERE account_id IN (p_source_account_id, p_destination_account_id)
          AND user_profile_id = v_profile_id
          AND status = 'ACTIVE'
    ) <> 2 THEN
        RAISE EXCEPTION 'Both source and destination accounts must belong to you and be ACTIVE';
    END IF;

    -- Validate source account has sufficient funds for amount + fee
    v_source_balance := public.calculate_account_balance(p_source_account_id);
    v_total_deduction := p_amount + v_fee;

    IF (v_source_balance - v_total_deduction) < 0.00 THEN
        RAISE EXCEPTION 'Insufficient funds in source account (available: ₱%s, required: ₱%s including fee)',
                        v_source_balance, v_total_deduction;
    END IF;

    INSERT INTO public.transactions (
        user_profile_id,
        account_id,
        destination_account_id,
        category_id,
        transaction_type_id,
        description,
        amount,
        transfer_fee,
        transaction_date,
        status,
        created_by
    ) VALUES (
        v_profile_id,
        p_source_account_id,
        p_destination_account_id,
        NULL,
        v_transfer_type_id,
        TRIM(p_description),
        p_amount,
        v_fee,
        p_transaction_date,
        'Y',
        v_auth_uid
    ) RETURNING transaction_id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 10. Function: edit_income_expense_transaction
-- Edits Income or Expense under reversal-and-reapplication balance validation.
-- Transaction date and Transfer editing are strictly rejected.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.edit_income_expense_transaction(
    p_transaction_id UUID,
    p_new_account_id UUID,
    p_new_category_id UUID,
    p_new_transaction_type_id UUID,
    p_new_amount NUMERIC(12,2),
    p_new_description VARCHAR(255) DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
    v_orig_tx RECORD;
    v_transfer_type_id UUID;
    v_new_type_name VARCHAR(50);
    v_orig_account_balance NUMERIC(12,2);
    v_new_account_balance NUMERIC(12,2);
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_new_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    SELECT transaction_type_id INTO v_transfer_type_id
    FROM public.transaction_types
    WHERE type_name = 'Transfer';

    -- Reject changing to Transfer
    IF p_new_transaction_type_id = v_transfer_type_id THEN
        RAISE EXCEPTION 'Transfer is not an allowed edit target';
    END IF;

    -- Verify new transaction type is Income or Expense
    SELECT type_name INTO v_new_type_name
    FROM public.transaction_types
    WHERE transaction_type_id = p_new_transaction_type_id AND status = 'ACTIVE';

    IF v_new_type_name NOT IN ('Income', 'Expense') THEN
        RAISE EXCEPTION 'Invalid transaction type for editing';
    END IF;

    -- Verify category belongs to the new type and is active
    IF NOT EXISTS (
        SELECT 1 FROM public.categories
        WHERE category_id = p_new_category_id
          AND transaction_type_id = p_new_transaction_type_id
          AND status = 'ACTIVE'
    ) THEN
        RAISE EXCEPTION 'Category must be active and match the selected transaction type';
    END IF;

    -- Retrieve and lock original transaction
    SELECT t.*, tt.type_name AS orig_type_name
    INTO v_orig_tx
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    JOIN public.user_profiles up ON t.user_profile_id = up.user_profile_id
    WHERE t.transaction_id = p_transaction_id
      AND up.auth_user_id = v_auth_uid
      AND t.status = 'Y'
    FOR UPDATE OF t;

    IF v_orig_tx.transaction_id IS NULL THEN
        RAISE EXCEPTION 'Transaction not found or access denied';
    END IF;

    IF v_orig_tx.orig_type_name = 'Transfer' THEN
        RAISE EXCEPTION 'Transfer transactions cannot be edited after creation';
    END IF;

    v_profile_id := v_orig_tx.user_profile_id;

    -- Lock both accounts in consistent order
    PERFORM 1
    FROM public.accounts
    WHERE account_id IN (v_orig_tx.account_id, p_new_account_id)
      AND user_profile_id = v_profile_id
    ORDER BY account_id
    FOR UPDATE;

    -- Verify new account belongs to same user (even if inactive per Section 7.10)
    IF NOT EXISTS (
        SELECT 1 FROM public.accounts
        WHERE account_id = p_new_account_id AND user_profile_id = v_profile_id
    ) THEN
        RAISE EXCEPTION 'Target account does not belong to the transaction owner';
    END IF;

    -- Apply update temporarily to validate resulting balances
    UPDATE public.transactions
    SET account_id = p_new_account_id,
        category_id = p_new_category_id,
        transaction_type_id = p_new_transaction_type_id,
        amount = p_new_amount,
        description = TRIM(p_new_description),
        updated_at = NOW(),
        updated_by = v_auth_uid
    WHERE transaction_id = p_transaction_id;

    -- Check resulting balance of original account
    v_orig_account_balance := public.calculate_account_balance(v_orig_tx.account_id);
    IF v_orig_account_balance < 0.00 THEN
        RAISE EXCEPTION 'Edit rejected: resulting balance on original account would become negative (₱%s)', v_orig_account_balance;
    END IF;

    -- If account changed, check resulting balance of new account
    IF p_new_account_id <> v_orig_tx.account_id THEN
        v_new_account_balance := public.calculate_account_balance(p_new_account_id);
        IF v_new_account_balance < 0.00 THEN
            RAISE EXCEPTION 'Edit rejected: resulting balance on destination account would become negative (₱%s)', v_new_account_balance;
        END IF;
    END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- 11. Function: soft_delete_transaction
-- Soft-deletes a transaction if its financial reversal leaves balances non-negative.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soft_delete_transaction(p_transaction_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_tx RECORD;
    v_source_balance NUMERIC(12,2);
    v_dest_balance NUMERIC(12,2);
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Retrieve and lock transaction
    SELECT t.*, tt.type_name
    INTO v_tx
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    JOIN public.user_profiles up ON t.user_profile_id = up.user_profile_id
    WHERE t.transaction_id = p_transaction_id
      AND up.auth_user_id = v_auth_uid
      AND t.status = 'Y'
    FOR UPDATE OF t;

    IF v_tx.transaction_id IS NULL THEN
        RAISE EXCEPTION 'Transaction not found, already deleted, or access denied';
    END IF;

    -- Lock affected accounts
    PERFORM 1
    FROM public.accounts
    WHERE account_id IN (v_tx.account_id, v_tx.destination_account_id)
    ORDER BY account_id
    FOR UPDATE;

    -- Apply soft-deletion
    UPDATE public.transactions
    SET status = 'N',
        updated_at = NOW(),
        updated_by = v_auth_uid
    WHERE transaction_id = p_transaction_id;

    -- Validate resulting balance on source account
    v_source_balance := public.calculate_account_balance(v_tx.account_id);
    IF v_source_balance < 0.00 THEN
        RAISE EXCEPTION 'Cannot delete transaction: reversal would cause a negative account balance (₱%s)', v_source_balance;
    END IF;

    -- If Transfer, validate resulting balance on destination account (after deducting credited amount)
    IF v_tx.type_name = 'Transfer' AND v_tx.destination_account_id IS NOT NULL THEN
        v_dest_balance := public.calculate_account_balance(v_tx.destination_account_id);
        IF v_dest_balance < 0.00 THEN
            RAISE EXCEPTION 'Cannot delete transfer: destination account would become negative (₱%s)', v_dest_balance;
        END IF;
    END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- 12. Function: get_dashboard_summary
-- Aggregates Total Balance, Total Income, Total Expense, and Transfer Fees.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_auth_uid UUID;
    v_profile_id UUID;
    v_total_balance NUMERIC(12,2) := 0.00;
    v_total_income NUMERIC(12,2) := 0.00;
    v_total_expense NUMERIC(12,2) := 0.00;
    v_total_transfer_fees NUMERIC(12,2) := 0.00;
    r RECORD;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT user_profile_id INTO v_profile_id
    FROM public.user_profiles
    WHERE auth_user_id = v_auth_uid;

    IF v_profile_id IS NULL THEN
        RETURN jsonb_build_object(
            'total_balance', 0.00,
            'total_income', 0.00,
            'total_expense', 0.00,
            'total_transfer_fees', 0.00
        );
    END IF;

    -- Total Balance: sum of calculated balances of ACTIVE accounts only
    FOR r IN
        SELECT account_id
        FROM public.accounts
        WHERE user_profile_id = v_profile_id AND status = 'ACTIVE'
    LOOP
        v_total_balance := v_total_balance + public.calculate_account_balance(r.account_id);
    END LOOP;

    -- Total Income: active non-deleted Income transactions
    SELECT COALESCE(SUM(t.amount), 0.00) INTO v_total_income
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    WHERE t.user_profile_id = v_profile_id
      AND t.status = 'Y'
      AND tt.type_name = 'Income';

    -- Total Expense: active non-deleted Expense transactions only
    SELECT COALESCE(SUM(t.amount), 0.00) INTO v_total_expense
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    WHERE t.user_profile_id = v_profile_id
      AND t.status = 'Y'
      AND tt.type_name = 'Expense';

    -- Total Transfer Fees: active non-deleted Transfer transaction fees
    SELECT COALESCE(SUM(t.transfer_fee), 0.00) INTO v_total_transfer_fees
    FROM public.transactions t
    JOIN public.transaction_types tt ON t.transaction_type_id = tt.transaction_type_id
    WHERE t.user_profile_id = v_profile_id
      AND t.status = 'Y'
      AND tt.type_name = 'Transfer';

    RETURN jsonb_build_object(
        'total_balance', v_total_balance,
        'total_income', v_total_income,
        'total_expense', v_total_expense,
        'total_transfer_fees', v_total_transfer_fees
    );
END;
$$;
