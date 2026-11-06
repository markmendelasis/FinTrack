-- =============================================================================
-- Migration: 20261106000004_audit_triggers.sql
-- Description: Creates trusted trigger functions and triggers for automatic,
--              atomic audit logging on transactions, accounts, and user profiles.
-- Standards: Follows BACKEND_ARCHITECTURE.md Section 8 and SECURITY.md Section 7.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Trigger Function: process_transaction_audit_log
-- Automatically creates audit entries when transactions are inserted or updated.
-- Recognizes logical soft-deletion (status Y -> N) as audit action DELETED.
-- Also logs to account_audit_logs with readable account names.
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
    v_source_account_name VARCHAR(100);
    v_dest_account_name VARCHAR(100);
    v_actor UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_actor := COALESCE(auth.uid(), NEW.created_by);
        v_action := 'CREATED';

        -- Retrieve transaction type name
        SELECT type_name INTO v_type_name
        FROM public.transaction_types
        WHERE transaction_type_id = NEW.transaction_type_id;

        -- Retrieve source account name
        SELECT account_name INTO v_source_account_name
        FROM public.accounts
        WHERE account_id = NEW.account_id;

        -- Retrieve destination account name if applicable
        IF NEW.destination_account_id IS NOT NULL THEN
            SELECT account_name INTO v_dest_account_name
            FROM public.accounts
            WHERE account_id = NEW.destination_account_id;
        END IF;

        IF v_type_name = 'Transfer' THEN
            IF NEW.transfer_fee > 0 THEN
                v_action_desc := FORMAT('Created Transfer transaction of ₱%s from %s to %s with ₱%s fee.',
                                        NEW.amount::text,
                                        COALESCE(v_source_account_name, 'Source Account'),
                                        COALESCE(v_dest_account_name, 'Destination Account'),
                                        NEW.transfer_fee::text);
            ELSE
                v_action_desc := FORMAT('Created Transfer transaction of ₱%s from %s to %s.',
                                        NEW.amount::text,
                                        COALESCE(v_source_account_name, 'Source Account'),
                                        COALESCE(v_dest_account_name, 'Destination Account'));
            END IF;
        ELSIF v_type_name = 'Income' THEN
            v_action_desc := FORMAT('Created Income transaction of ₱%s on %s account.',
                                    NEW.amount::text,
                                    COALESCE(v_source_account_name, 'Account'));
        ELSIF v_type_name = 'Expense' THEN
            v_action_desc := FORMAT('Created Expense transaction of ₱%s on %s account.',
                                    NEW.amount::text,
                                    COALESCE(v_source_account_name, 'Account'));
        ELSE
            v_action_desc := FORMAT('Created %s transaction of ₱%s on %s account.',
                                    COALESCE(v_type_name, 'Unknown'),
                                    NEW.amount::text,
                                    COALESCE(v_source_account_name, 'Account'));
        END IF;

        -- 1. Insert into transaction_audit_logs with action = 'CREATED'
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

        -- 2. Insert into account_audit_logs for source account
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
            CASE
                WHEN v_type_name = 'Income' THEN 'INCOME'
                WHEN v_type_name = 'Expense' THEN 'EXPENSE'
                WHEN v_type_name = 'Transfer' THEN 'TRANSFER'
                ELSE 'CREATED'
            END,
            v_action_desc,
            NULL,
            jsonb_build_object(
                'transaction_id', NEW.transaction_id,
                'type', v_type_name,
                'amount', NEW.amount,
                'transfer_fee', NEW.transfer_fee,
                'source_account', v_source_account_name,
                'destination_account', v_dest_account_name
            ),
            v_actor,
            NOW()
        );

        -- 3. If Transfer, also insert into account_audit_logs for destination account
        IF v_type_name = 'Transfer' AND NEW.destination_account_id IS NOT NULL THEN
            INSERT INTO public.account_audit_logs (
                account_id,
                action,
                action_description,
                old_values,
                new_values,
                performed_by,
                performed_at
            ) VALUES (
                NEW.destination_account_id,
                'TRANSFER',
                v_action_desc,
                NULL,
                jsonb_build_object(
                    'transaction_id', NEW.transaction_id,
                    'type', v_type_name,
                    'amount', NEW.amount,
                    'source_account', v_source_account_name,
                    'destination_account', v_dest_account_name
                ),
                v_actor,
                NOW()
            );
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        v_actor := COALESCE(auth.uid(), NEW.updated_by, OLD.updated_by, NEW.created_by, OLD.created_by);

        -- Retrieve transaction type name
        SELECT type_name INTO v_type_name
        FROM public.transaction_types
        WHERE transaction_type_id = OLD.transaction_type_id;

        -- Retrieve source account name
        SELECT account_name INTO v_source_account_name
        FROM public.accounts
        WHERE account_id = OLD.account_id;

        -- Retrieve destination account name if applicable
        IF OLD.destination_account_id IS NOT NULL THEN
            SELECT account_name INTO v_dest_account_name
            FROM public.accounts
            WHERE account_id = OLD.destination_account_id;
        END IF;

        -- Check for soft-deletion (status changing from 'Y' to 'N')
        IF OLD.status = 'Y' AND NEW.status = 'N' THEN
            v_action := 'DELETED';

            IF v_type_name = 'Transfer' THEN
                v_action_desc := FORMAT('Deleted Transfer transaction of ₱%s from %s to %s.',
                                        OLD.amount::text,
                                        COALESCE(v_source_account_name, 'Source Account'),
                                        COALESCE(v_dest_account_name, 'Destination Account'));
            ELSIF v_type_name = 'Income' THEN
                v_action_desc := FORMAT('Deleted Income transaction of ₱%s on %s account.',
                                        OLD.amount::text,
                                        COALESCE(v_source_account_name, 'Account'));
            ELSIF v_type_name = 'Expense' THEN
                v_action_desc := FORMAT('Deleted Expense transaction of ₱%s on %s account.',
                                        OLD.amount::text,
                                        COALESCE(v_source_account_name, 'Account'));
            ELSE
                v_action_desc := FORMAT('Deleted %s transaction of ₱%s on %s account.',
                                        COALESCE(v_type_name, 'Unknown'),
                                        OLD.amount::text,
                                        COALESCE(v_source_account_name, 'Account'));
            END IF;

            -- Insert into transaction_audit_logs with action = 'DELETED'
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

            -- Insert into account_audit_logs for source account
            INSERT INTO public.account_audit_logs (
                account_id,
                action,
                action_description,
                old_values,
                new_values,
                performed_by,
                performed_at
            ) VALUES (
                OLD.account_id,
                'DELETED',
                v_action_desc,
                to_jsonb(OLD),
                to_jsonb(NEW),
                v_actor,
                NOW()
            );

            -- If Transfer, also insert into account_audit_logs for destination account
            IF v_type_name = 'Transfer' AND OLD.destination_account_id IS NOT NULL THEN
                INSERT INTO public.account_audit_logs (
                    account_id,
                    action,
                    action_description,
                    old_values,
                    new_values,
                    performed_by,
                    performed_at
                ) VALUES (
                    OLD.destination_account_id,
                    'DELETED',
                    v_action_desc,
                    to_jsonb(OLD),
                    to_jsonb(NEW),
                    v_actor,
                    NOW()
                );
            END IF;

        ELSE
            -- Normal edit / update
            v_action := 'UPDATED';
            v_action_desc := FORMAT('Updated %s transaction from ₱%s to ₱%s on %s account.',
                                    COALESCE(v_type_name, 'Unknown'),
                                    OLD.amount::text,
                                    NEW.amount::text,
                                    COALESCE(v_source_account_name, 'Account'));

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
                'UPDATED',
                v_action_desc,
                to_jsonb(OLD),
                to_jsonb(NEW),
                v_actor,
                NOW()
            );
        END IF;
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
    IF TG_OP = 'INSERT' THEN
        v_actor := COALESCE(auth.uid(), NEW.created_by);
        v_action := 'CREATED';
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
        v_actor := COALESCE(auth.uid(), NEW.updated_by, OLD.updated_by, NEW.created_by, OLD.created_by);

        IF OLD.status = 'ACTIVE' AND NEW.status = 'INACTIVE' THEN
            v_action := 'DEACTIVATED';
            v_action_desc := FORMAT('Account "%s" deactivated with zero balance', NEW.account_name);
        ELSIF OLD.status = 'INACTIVE' AND NEW.status = 'ACTIVE' THEN
            v_action := 'REACTIVATED';
            v_action_desc := FORMAT('Account "%s" reactivated to ACTIVE status', NEW.account_name);
        ELSE
            v_action := 'UPDATED';
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
-- Automatically creates audit entries for profile updates.
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
    IF TG_OP = 'INSERT' THEN
        v_actor := COALESCE(auth.uid(), NEW.created_by);
        v_action := 'CREATED';
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
        v_actor := COALESCE(auth.uid(), NEW.updated_by, OLD.updated_by, NEW.created_by, OLD.created_by);
        v_action := 'UPDATED';

        IF OLD.user_name <> NEW.user_name THEN
            v_action_desc := FORMAT('Display name changed from "%s" to "%s"', OLD.user_name, NEW.user_name);
        ELSE
            v_action_desc := 'User profile updated';
        END IF;

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
