-- =============================================================================
-- Migration: 20261106000001_schema_and_constraints.sql
-- Description: Creates the 8 approved application-owned tables, primary keys,
--              foreign keys, check constraints, and composite uniqueness keys.
-- Standards: Follows DATABASE_DESIGN.md specifications.
-- =============================================================================

-- Ensure pgcrypto or uuid extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Table: user_profiles
-- Stores application-specific profile information associated with auth.users.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL REFERENCES auth.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT chk_user_profiles_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

COMMENT ON TABLE public.user_profiles IS 'Application user profiles linked 1:1 with auth.users';

-- -----------------------------------------------------------------------------
-- 2. Table: accounts
-- Represents places where user money is held (Cash Wallet, bank, e-wallets).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID NOT NULL REFERENCES public.user_profiles(user_profile_id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    initial_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00
        CONSTRAINT chk_accounts_initial_balance CHECK (initial_balance >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT chk_accounts_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL REFERENCES auth.users(id),
    CONSTRAINT uq_accounts_id_profile UNIQUE (account_id, user_profile_id)
);

COMMENT ON TABLE public.accounts IS 'User financial accounts with initial balance and ownership composite key';

-- -----------------------------------------------------------------------------
-- 3. Table: transaction_types
-- Central lookup table for predefined transaction types (Income, Expense, Transfer).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transaction_types (
    transaction_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT chk_transaction_types_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL REFERENCES auth.users(id)
);

COMMENT ON TABLE public.transaction_types IS 'Global system lookup table defining Income, Expense, Transfer';

-- -----------------------------------------------------------------------------
-- 4. Table: categories
-- Predefined global categories belonging to Income or Expense.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type_id UUID NOT NULL REFERENCES public.transaction_types(transaction_type_id),
    category_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT chk_categories_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL REFERENCES auth.users(id),
    CONSTRAINT uq_categories_id_type UNIQUE (category_id, transaction_type_id),
    CONSTRAINT uq_categories_type_name UNIQUE (transaction_type_id, category_name)
);

COMMENT ON TABLE public.categories IS 'Global predefined transaction categories linked to Income or Expense';

-- -----------------------------------------------------------------------------
-- 5. Table: transactions
-- Unified table for Income, Expense, and Transfer operations.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID NOT NULL REFERENCES public.user_profiles(user_profile_id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(account_id),
    destination_account_id UUID NULL REFERENCES public.accounts(account_id),
    category_id UUID NULL REFERENCES public.categories(category_id),
    transaction_type_id UUID NOT NULL REFERENCES public.transaction_types(transaction_type_id),
    description VARCHAR(255) NULL,
    amount NUMERIC(12,2) NOT NULL
        CONSTRAINT chk_transactions_amount CHECK (amount > 0),
    transfer_fee NUMERIC(12,2) NOT NULL DEFAULT 0.00
        CONSTRAINT chk_transactions_transfer_fee CHECK (transfer_fee >= 0),
    transaction_date DATE NOT NULL
        CONSTRAINT chk_transactions_date CHECK (transaction_date <= CURRENT_DATE),
    status VARCHAR(1) NOT NULL DEFAULT 'Y'
        CONSTRAINT chk_transactions_status CHECK (status IN ('Y', 'N')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL REFERENCES auth.users(id),
    -- Approved composite relationships to enforce ownership and category compatibility:
    CONSTRAINT fk_trans_source_account_owner
        FOREIGN KEY (account_id, user_profile_id)
        REFERENCES public.accounts (account_id, user_profile_id),
    CONSTRAINT fk_trans_dest_account_owner
        FOREIGN KEY (destination_account_id, user_profile_id)
        REFERENCES public.accounts (account_id, user_profile_id),
    CONSTRAINT fk_trans_category_type
        FOREIGN KEY (category_id, transaction_type_id)
        REFERENCES public.categories (category_id, transaction_type_id)
);

COMMENT ON TABLE public.transactions IS 'Monetary transactions (Income, Expense, Transfer) with composite foreign key integrity';

-- -----------------------------------------------------------------------------
-- 6. Table: transaction_audit_logs
-- Immutable audit records for transaction modifications and soft deletions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transaction_audit_logs (
    audit_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(transaction_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    action_description VARCHAR(500) NOT NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    performed_by UUID NOT NULL REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.transaction_audit_logs IS 'Audit history for transaction changes and soft-deletions';

-- -----------------------------------------------------------------------------
-- 7. Table: account_audit_logs
-- Immutable audit records for account changes, deactivation, and reactivation.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.account_audit_logs (
    audit_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(account_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL
        CONSTRAINT chk_account_audit_action CHECK (action IN ('INSERT', 'UPDATE', 'DEACTIVATE', 'REACTIVATE')),
    action_description VARCHAR(500) NOT NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    performed_by UUID NOT NULL REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.account_audit_logs IS 'Audit history for account creation, balance edits, and deactivations';

-- -----------------------------------------------------------------------------
-- 8. Table: user_profile_audit_logs
-- Audit records for user profile changes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profile_audit_logs (
    audit_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID NOT NULL REFERENCES public.user_profiles(user_profile_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    action_description VARCHAR(500) NOT NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    performed_by UUID NOT NULL REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_profile_audit_logs IS 'Audit history for user profile modifications';
