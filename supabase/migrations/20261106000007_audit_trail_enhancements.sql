-- =============================================================================
-- Migration: 20261106000007_audit_trail_enhancements.sql
-- Description: Enhances audit triggers so that transactions also log into
--              account_audit_logs with readable account names (no raw UUIDs).
-- Standards: Follows BACKEND_ARCHITECTURE.md Section 8 and SECURITY.md Section 7.
-- =============================================================================

-- 1. Expand account_audit_logs action CHECK constraint
ALTER TABLE public.account_audit_logs
    DROP CONSTRAINT IF EXISTS chk_account_audit_action;

ALTER TABLE public.account_audit_logs
    ADD CONSTRAINT chk_account_audit_action
    CHECK (action IN ('INSERT', 'UPDATE', 'DEACTIVATE', 'REACTIVATE', 'INCOME', 'EXPENSE', 'TRANSFER', 'DELETE'));

-- 2. Enhanced Trigger Function: process_transaction_audit_log
CREATE OR REPLACE FUNCTION public.process_transaction_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_action VARCHAR(50);
    v_action_desc VARCHAR(500);
    v_account_desc VARCHAR(500);
    v_type_name VARCHAR(50);
    v_source_account_name VARCHAR(100);
    v_dest_account_name VARCHAR(100);
    v_actor UUID;
BEGIN
    -- Determine actor
    v_actor := COALESCE(auth.uid(), NEW.updated_by, NEW.created_by, OLD.updated_by, OLD.created_by);

    -- Retrieve transaction type name
    SELECT type_name INTO v_type_name
    FROM public.transaction_types
    WHERE transaction_type_id = COALESCE(NEW.transaction_type_id, OLD.transaction_type_id);

    -- Retrieve source account name
    SELECT account_name INTO v_source_account_name
    FROM public.accounts
    WHERE account_id = COALESCE(NEW.account_id, OLD.account_id);

    -- Retrieve destination account name if applicable
    IF NEW.destination_account_id IS NOT NULL OR (TG_OP = 'UPDATE' AND OLD.destination_account_id IS NOT NULL) THEN
        SELECT account_name INTO v_dest_account_name
        FROM public.accounts
        WHERE account_id = COALESCE(NEW.destination_account_id, OLD.destination_account_id);
    END IF;

    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';

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

        -- Insert into transaction_audit_logs
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
            NEW.account_id,
            CASE
                WHEN v_type_name = 'Income' THEN 'INCOME'
                WHEN v_type_name = 'Expense' THEN 'EXPENSE'
                WHEN v_type_name = 'Transfer' THEN 'TRANSFER'
                ELSE 'UPDATE'
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

        -- If Transfer, also insert into account_audit_logs for destination account
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
        -- Check for soft-deletion (status changing from 'Y' to 'N')
        IF OLD.status = 'Y' AND NEW.status = 'N' THEN
            v_action := 'DELETE';
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

            -- Insert into transaction_audit_logs
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
                'DELETE',
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
                    'DELETE',
                    v_action_desc,
                    to_jsonb(OLD),
                    to_jsonb(NEW),
                    v_actor,
                    NOW()
                );
            END IF;

        ELSE
            -- Normal edit / update
            v_action := 'UPDATE';
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
                'UPDATE',
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
