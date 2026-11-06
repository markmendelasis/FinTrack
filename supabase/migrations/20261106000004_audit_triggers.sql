-- =============================================================================
-- Migration: 20261106000004_audit_triggers.sql
-- Description: Creates trusted trigger functions and triggers for automatic,
--              atomic audit logging on transactions, accounts, and user profiles.
-- Standards: Follows BACKEND_ARCHITECTURE.md Section 8 and SECURITY.md Section 7.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Trigger Function: process_transaction_audit_log
-- Automatically creates audit entries when transactions are inserted or updated.
-- Recognizes logical soft-deletion (status Y -> N) as audit action DELETE.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_transaction_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_action VARCHAR(50);
    v_action_desc VARCHAR(500);
    v_type_name VARCHAR(50);
    v_actor UUID;
BEGIN
    -- Determine actor
    v_actor := COALESCE(auth.uid(), NEW.updated_by, NEW.created_by);

    -- Retrieve transaction type name for human-readable description
    SELECT type_name INTO v_type_name
    FROM public.transaction_types
    WHERE transaction_type_id = NEW.transaction_type_id;

    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';
        v_action_desc := FORMAT('Created %s transaction of ₱%s on account %s',
                                COALESCE(v_type_name, 'Unknown'),
                                NEW.amount::text,
                                NEW.account_id::text);

        INSERT INTO public.transaction_audit_logs (
            transaction_id,
            action,
            action_description,
            old_values,
            new_values,
            performed_by,
            performed_at
        ) VALUES (
            NEW.transaction_id,
            v_action,
            v_action_desc,
            NULL,
            to_jsonb(NEW),
            v_actor,
            NOW()
        );

    ELSIF TG_OP = 'UPDATE' THEN
        -- Check for soft-deletion (status changing from 'Y' to 'N')
        IF OLD.status = 'Y' AND NEW.status = 'N' THEN
            v_action := 'DELETE';
            v_action_desc := FORMAT('Soft-deleted %s transaction of ₱%s: financial reversal applied',
                                    COALESCE(v_type_name, 'Unknown'),
                                    OLD.amount::text);
        ELSE
            v_action := 'UPDATE';
            v_action_desc := FORMAT('Updated %s transaction fields (amount: ₱%s -> ₱%s)',
                                    COALESCE(v_type_name, 'Unknown'),
                                    OLD.amount::text,
                                    NEW.amount::text);
        END IF;

        INSERT INTO public.transaction_audit_logs (
            transaction_id,
            action,
            action_description,
            old_values,
            new_values,
            performed_by,
            performed_at
        ) VALUES (
            NEW.transaction_id,
            v_action,
            v_action_desc,
            to_jsonb(OLD),
            to_jsonb(NEW),
            v_actor,
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_transactions_audit ON public.transactions;
CREATE TRIGGER trg_transactions_audit
    AFTER INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.process_transaction_audit_log();

-- -----------------------------------------------------------------------------
-- 2. Trigger Function: process_account_audit_log
-- Automatically creates audit entries for accounts (creation, status changes, edits).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_account_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_action VARCHAR(50);
    v_action_desc VARCHAR(500);
    v_actor UUID;
BEGIN
    v_actor := COALESCE(auth.uid(), NEW.updated_by, NEW.created_by);

    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';
        v_action_desc := FORMAT('Account "%s" created with initial balance ₱%s',
                                NEW.account_name,
                                NEW.initial_balance::text);

        INSERT INTO public.account_audit_logs (
            account_id,
            action,
            action_description,
            old_values,
            new_values,
            performed_by,
            performed_at
        ) VALUES (
            NEW.account_id,
            v_action,
            v_action_desc,
            NULL,
            to_jsonb(NEW),
            v_actor,
            NOW()
        );

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'ACTIVE' AND NEW.status = 'INACTIVE' THEN
            v_action := 'DEACTIVATE';
            v_action_desc := FORMAT('Account "%s" deactivated with zero balance', NEW.account_name);
        ELSIF OLD.status = 'INACTIVE' AND NEW.status = 'ACTIVE' THEN
            v_action := 'REACTIVATE';
            v_action_desc := FORMAT('Account "%s" reactivated to ACTIVE status', NEW.account_name);
        ELSE
            v_action := 'UPDATE';
            IF OLD.initial_balance <> NEW.initial_balance THEN
                v_action_desc := FORMAT('Account "%s" initial balance updated from ₱%s to ₱%s',
                                        NEW.account_name,
                                        OLD.initial_balance::text,
                                        NEW.initial_balance::text);
            ELSE
                v_action_desc := FORMAT('Account "%s" details updated', NEW.account_name);
            END IF;
        END IF;

        INSERT INTO public.account_audit_logs (
            account_id,
            action,
            action_description,
            old_values,
            new_values,
            performed_by,
            performed_at
        ) VALUES (
            NEW.account_id,
            v_action,
            v_action_desc,
            to_jsonb(OLD),
            to_jsonb(NEW),
            v_actor,
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_accounts_audit ON public.accounts;
CREATE TRIGGER trg_accounts_audit
    AFTER INSERT OR UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.process_account_audit_log();

-- -----------------------------------------------------------------------------
-- 3. Trigger Function: process_user_profile_audit_log
-- Automatically creates audit entries for user profile modifications.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_user_profile_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_action VARCHAR(50);
    v_action_desc VARCHAR(500);
    v_actor UUID;
BEGIN
    v_actor := COALESCE(auth.uid(), NEW.updated_by, NEW.created_by);

    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';
        v_action_desc := FORMAT('User profile created for "%s"', NEW.user_name);

        INSERT INTO public.user_profile_audit_logs (
            user_profile_id,
            action,
            action_description,
            old_values,
            new_values,
            performed_by,
            performed_at
        ) VALUES (
            NEW.user_profile_id,
            v_action,
            v_action_desc,
            NULL,
            to_jsonb(NEW),
            v_actor,
            NOW()
        );

    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATE';
        v_action_desc := FORMAT('User profile updated: name changed from "%s" to "%s"',
                                OLD.user_name,
                                NEW.user_name);

        INSERT INTO public.user_profile_audit_logs (
            user_profile_id,
            action,
            action_description,
            old_values,
            new_values,
            performed_by,
            performed_at
        ) VALUES (
            NEW.user_profile_id,
            v_action,
            v_action_desc,
            to_jsonb(OLD),
            to_jsonb(NEW),
            v_actor,
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profiles_audit ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_audit
    AFTER INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.process_user_profile_audit_log();
