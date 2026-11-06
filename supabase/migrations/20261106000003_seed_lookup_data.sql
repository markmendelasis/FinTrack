-- =============================================================================
-- Migration: 20261106000003_seed_lookup_data.sql
-- Description: Seeds the predefined global transaction types and categories.
-- Standards: Follows DATABASE_DESIGN.md Section 5.3 and 5.4.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Seed Transaction Types (Income, Expense, Transfer)
-- -----------------------------------------------------------------------------
INSERT INTO public.transaction_types (transaction_type_id, type_name, description, status)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Income', 'Money received by the user', 'ACTIVE'),
    ('10000000-0000-0000-0000-000000000002', 'Expense', 'Money spent by the user', 'ACTIVE'),
    ('10000000-0000-0000-0000-000000000003', 'Transfer', 'Money moved between the user''s financial accounts', 'ACTIVE')
ON CONFLICT (type_name) DO UPDATE
SET description = EXCLUDED.description,
    status = EXCLUDED.status;

-- -----------------------------------------------------------------------------
-- 2. Seed Predefined Income Categories
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (category_id, transaction_type_id, category_name, description, status)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Salary', 'Regular employment earnings and wages', 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Allowance', 'Regular stipends or financial allowances', 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Business Income', 'Revenue from business or freelance activities', 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Investment Income', 'Dividends, capital gains, or interest income', 'ACTIVE'),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Other Income', 'Miscellaneous or irregular income sources', 'ACTIVE')
ON CONFLICT (transaction_type_id, category_name) DO UPDATE
SET description = EXCLUDED.description,
    status = EXCLUDED.status;

-- -----------------------------------------------------------------------------
-- 3. Seed Predefined Expense Categories
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (category_id, transaction_type_id, category_name, description, status)
VALUES
    ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Food', 'Dining out, snacks, and prepared meals', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Groceries', 'Supermarket, market, and household food supplies', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Transportation', 'Public transit, fuel, tolls, and ride-hailing', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Bills', 'Rent, insurance, memberships, and recurring fees', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Utilities', 'Electricity, water, internet, and mobile data', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Entertainment', 'Movies, games, subscriptions, and recreational activities', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'Healthcare', 'Medical consultations, medicines, and wellness', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'Shopping', 'Clothing, personal gadgets, and non-grocery shopping', 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', 'Other Expense', 'Miscellaneous or unforeseen expenditures', 'ACTIVE')
ON CONFLICT (transaction_type_id, category_name) DO UPDATE
SET description = EXCLUDED.description,
    status = EXCLUDED.status;
