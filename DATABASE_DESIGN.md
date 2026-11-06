# DATABASE_DESIGN.md

**Project:** FinTrack  
**Status:** Design approved; SQL implementation pending  
**Database:** PostgreSQL (Supabase)

## 1. Purpose

This document defines the approved database structure, relationships, constraints, and financial business rules for FinTrack.

PostgreSQL is the authoritative source for data integrity and financial rule enforcement. Frontend validation may improve user experience but must not replace database validation.

## 2. Database Conventions

- Use lowercase `snake_case` for tables, columns, functions, triggers, constraints, indexes, and views.
- Use uppercase SQL keywords for readability.
- Use `UUID` identifiers with `gen_random_uuid()` defaults where specified.
- Use `TIMESTAMPTZ` for audit timestamps.
- Use `NUMERIC(12,2)` for monetary values. Do not use floating-point types for money.
- Use `DATE` for the transaction date.
- Use unquoted identifiers so PostgreSQL's normal lowercase behavior is preserved.

## 3. Supabase Authentication

`auth.users` is managed by Supabase and stores authentication identities. FinTrack must not store passwords in its application tables.

The application-owned `user_profiles.auth_user_id` references `auth.users.id`.

## 4. Standard Audit Columns

Applicable application-owned business tables use these standard columns:

| Column | Type | Nullability / Default |
|---|---|---|
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` |
| `created_by` | `UUID` | NOT NULL, FK to `auth.users.id` |
| `updated_at` | `TIMESTAMPTZ` | NULL until first update |
| `updated_by` | `UUID` | NULL until first update, FK to `auth.users.id` |

Creation metadata must remain unchanged when a row is updated. Trusted database logic must maintain audit metadata; the frontend must not be trusted to supply arbitrary actor identities.

Developer-managed seed tables (`transaction_types` and `categories`) also have the approved audit columns. Their seed/migration process must explicitly solve the `created_by` foreign-key requirement without inventing a normal end-user actor. Resolve the system-actor or migration strategy before applying seed migrations.

Supabase-managed `auth.users` is excluded from these application audit columns.

## 5. Table Definitions

### 5.1 `user_profiles`

Purpose: stores application-specific profile information. Authentication credentials remain in Supabase Auth.

| Column | Type | Constraints / Default |
|---|---|---|
| `user_profile_id` | UUID | PK, NOT NULL, DEFAULT `gen_random_uuid()` |
| `auth_user_id` | UUID | FK to `auth.users.id`, UNIQUE, NOT NULL |
| `user_name` | VARCHAR(100) | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` |
| `created_by` | UUID | FK to `auth.users.id`, NOT NULL |
| `updated_at` | TIMESTAMPTZ | NULL |
| `updated_by` | UUID | FK to `auth.users.id`, NULL |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT `'ACTIVE'`, CHECK allows `ACTIVE` or `INACTIVE` |

Rules:
- Each FinTrack auth user has one application profile.
- `auth_user_id` is unique.
- `user_profile_id` is the application profile's own primary key.
- `user_name` is an editable display name.
- Users cannot change `user_profile_id` or `auth_user_id` through normal profile editing.
- `created_by` may equal the associated `auth_user_id` during profile creation.
- Profile creation occurs through a trusted signup process, including Google OAuth.
- An inactive profile cannot access application features; its financial records remain until permanent account deletion.
- RLS enforces profile ownership.

### 5.2 `accounts`

Purpose: represents places where a user's money is held, such as Cash Wallet, bank accounts, GCash, or Maya.

| Column | Type | Constraints / Default |
|---|---|---|
| `account_id` | UUID | PK, NOT NULL, DEFAULT `gen_random_uuid()` |
| `user_profile_id` | UUID | FK to `user_profiles.user_profile_id`, NOT NULL |
| `account_name` | VARCHAR(100) | NOT NULL |
| `initial_balance` | NUMERIC(12,2) | NOT NULL, DEFAULT `0.00`, CHECK `>= 0` |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT `'ACTIVE'`, CHECK allows `ACTIVE` or `INACTIVE` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` |
| `created_by` | UUID | FK to `auth.users.id`, NOT NULL |
| `updated_at` | TIMESTAMPTZ | NULL |
| `updated_by` | UUID | FK to `auth.users.id`, NULL |

Additional approved key:
- UNIQUE (`account_id`, `user_profile_id`) to support composite ownership foreign keys from transactions.

Rules:
- Automatically create a default `Cash Wallet` with `0.00` initial balance after successful registration.
- Users may create multiple accounts.
- Account names need not be unique.
- Users cannot rename accounts.
- Users cannot physically delete accounts through normal account management.
- Every user must always have at least one active account.
- Prevent deactivation of the last active account.
- Account deactivation is allowed only when the calculated balance is zero.
- Account history and audit logs remain when an account is inactive.
- An inactive account can regain a positive balance through an approved transaction reversal or edit; it remains inactive until explicitly reactivated.
- Initial balance can be edited only before the account has any transaction history. After the first transaction, it is locked.
- A future balance-adjustment feature is deferred and must not be represented as income or expense.
- Dashboard Total Balance includes active accounts only.

Concurrency requirement: simultaneous account deactivation requests must not leave a user with zero active accounts. Use transaction-safe locking when implementing.

### 5.3 `transaction_types`

Purpose: central lookup table defining supported transaction types.

| Column | Type | Constraints / Default |
|---|---|---|
| `transaction_type_id` | UUID | PK, NOT NULL, DEFAULT `gen_random_uuid()` |
| `type_name` | VARCHAR(50) | NOT NULL, UNIQUE |
| `description` | VARCHAR(255) | NULL |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT `'ACTIVE'`, CHECK allows `ACTIVE` or `INACTIVE` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` |
| `created_by` | UUID | FK to `auth.users.id`, NOT NULL |
| `updated_at` | TIMESTAMPTZ | NULL |
| `updated_by` | UUID | FK to `auth.users.id`, NULL |

Exactly three developer-maintained seed records:
- `Income` — Money received by the user.
- `Expense` — Money spent by the user.
- `Transfer` — Money moved between the user's financial accounts.

Rules:
- Users cannot create, edit, or delete transaction types.
- `type_name` is unique.
- Seeded types start as `ACTIVE`.
- Inactive types cannot be selected for new transactions.
- Historical transactions retain their type reference.
- Categories belong to Income or Expense; Transfer has no categories.
- The three-record set is maintained through migrations/seed logic; a simple CHECK constraint does not enforce an exact row count.

### 5.4 `categories`

Purpose: predefined global categories for Income and Expense.

| Column | Type | Constraints / Default |
|---|---|---|
| `category_id` | UUID | PK, NOT NULL, DEFAULT `gen_random_uuid()` |
| `transaction_type_id` | UUID | FK to `transaction_types.transaction_type_id`, NOT NULL |
| `category_name` | VARCHAR(100) | NOT NULL |
| `description` | VARCHAR(255) | NULL |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT `'ACTIVE'`, CHECK allows `ACTIVE` or `INACTIVE` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` |
| `created_by` | UUID | FK to `auth.users.id`, NOT NULL |
| `updated_at` | TIMESTAMPTZ | NULL |
| `updated_by` | UUID | FK to `auth.users.id`, NULL |

Additional approved key:
- UNIQUE (`category_id`, `transaction_type_id`) to support the transaction composite foreign key.

Additional uniqueness:
- UNIQUE (`transaction_type_id`, `category_name`) to prevent duplicate category names within the same transaction type.

Initial categories:

**Income**
- Salary
- Allowance
- Business Income
- Investment Income
- Other Income

**Expense**
- Food
- Groceries
- Transportation
- Bills
- Utilities
- Entertainment
- Healthcare
- Shopping
- Other Expense

Rules:
- Categories are global and shared by all users.
- No `user_profile_id` is required.
- Users cannot create, edit, or delete categories.
- Category descriptions are available for display.
- User-facing category color customization is not part of the MVP.
- Inactive categories remain available for historical display but cannot be newly selected.
- Historical transaction queries must not hide inactive categories.
- Category deletion is not allowed through normal application workflows.
- A category must belong to the same transaction type as the transaction using it. Enforce this through the approved composite foreign key or equivalent database enforcement.

### 5.5 `transactions`

Purpose: stores Income, Expense, and Transfer records in one table.

| Column | Type | Constraints / Default |
|---|---|---|
| `transaction_id` | UUID | PK, NOT NULL, DEFAULT `gen_random_uuid()` |
| `user_profile_id` | UUID | FK to `user_profiles.user_profile_id`, NOT NULL |
| `account_id` | UUID | FK to `accounts.account_id`, NOT NULL |
| `destination_account_id` | UUID | FK to `accounts.account_id`, NULL |
| `category_id` | UUID | FK to `categories.category_id`, NULL |
| `transaction_type_id` | UUID | FK to `transaction_types.transaction_type_id`, NOT NULL |
| `description` | VARCHAR(255) | NULL |
| `amount` | NUMERIC(12,2) | NOT NULL, CHECK `> 0` |
| `transfer_fee` | NUMERIC(12,2) | NOT NULL, DEFAULT `0.00`, CHECK `>= 0` |
| `transaction_date` | DATE | NOT NULL |
| `status` | VARCHAR(1) | NOT NULL, DEFAULT `'Y'`, CHECK allows `'Y'` or `'N'` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` |
| `created_by` | UUID | FK to `auth.users.id`, NOT NULL |
| `updated_at` | TIMESTAMPTZ | NULL |
| `updated_by` | UUID | FK to `auth.users.id`, NULL |

Approved composite relationships:
- FOREIGN KEY (`account_id`, `user_profile_id`) references `accounts` (`account_id`, `user_profile_id`).
- FOREIGN KEY (`destination_account_id`, `user_profile_id`) references `accounts` (`account_id`, `user_profile_id`).
- FOREIGN KEY (`category_id`, `transaction_type_id`) references `categories` (`category_id`, `transaction_type_id`).

These prevent selecting accounts owned by another user and categories belonging to another transaction type. Nullable destination/category values are valid for Transfer or non-transfer types respectively, subject to transaction-type business rules.

#### Transaction type rules

**Income**
- `account_id` is the receiving account.
- `category_id` is required.
- `destination_account_id` must be NULL.
- `transfer_fee` must be zero.
- Amount must be positive.

**Expense**
- `account_id` is the spending account.
- `category_id` is required.
- `destination_account_id` must be NULL.
- `transfer_fee` must be zero.
- Amount must be positive.

**Transfer**
- `account_id` is the source account.
- `destination_account_id` is the receiving account.
- `category_id` must be NULL.
- Source and destination must differ.
- `transfer_fee` may be zero or greater.
- Both accounts must belong to the transaction owner.
- Both accounts must be active when creating a new transfer.
- The source must have sufficient balance for amount plus fee.
- Destination receives amount only.
- A user must have at least two active accounts to create a transfer.

#### General transaction rules

- New transactions cannot use inactive accounts.
- New transactions cannot use inactive transaction types or categories.
- Existing records preserve references to accounts/categories/types that later become inactive.
- Description is optional and limited to 255 characters.
- Transaction date is required; past dates are allowed; future dates are rejected.
- Transaction date is immutable after creation.
- `created_at` records when the row was created; `transaction_date` records when the financial activity occurred.
- Status `Y` means active; `N` means soft-deleted.
- Soft-deleted transactions do not affect normal balances or reports.

#### Income and Expense editing

Income and Expense transactions can be edited:
- Amount.
- Account.
- Category.
- Transaction type, only between Income and Expense.
- Description.

Transaction date cannot be edited.

Transfer must not be offered as an edit target and the database must reject attempts to change an Income/Expense transaction into Transfer.

When editing:
1. Reverse the original financial effect.
2. Apply the new financial effect.
3. Validate every affected account's resulting balance.
4. Commit all changes atomically.
5. Record the audit event.

An existing Income/Expense transaction may be edited even if its associated account is inactive. It may be moved to another account, including an inactive account, provided both accounts belong to the same user and the resulting balance validation passes. Account status does not change automatically.

If any affected resulting balance would be negative, reject the entire edit and preserve the original transaction.

A newly selected category must be active and match the new transaction type.

#### Transfer editing

Transfer transactions are immutable after creation except for soft deletion. To correct a transfer, delete and recreate it if deletion validation allows, or record a separate correcting transfer.

#### Soft deletion and reversal

Do not physically delete ordinary transaction records.

Before soft deletion, calculate the resulting balance of every affected account:
- Income deletion: subtract the income amount from its account.
- Expense deletion: restore the expense amount to its account.
- Transfer deletion: restore source amount plus fee and deduct destination amount.

If any affected account would become negative, reject deletion and preserve the original transaction. Otherwise set status to `N` and record the audit event.

Deletion/reversal is allowed even when affected accounts are inactive. Account status remains unchanged.

All deletion and reversal operations must be atomic, including audit logging and concurrent balance validation.

### 5.6 `transaction_audit_logs`

Purpose: stores audit history for transaction changes.

Approved fields:
- `audit_log_id` — UUID primary key.
- `transaction_id` — FK to `transactions.transaction_id`.
- `action` — action identifier such as `INSERT`, `UPDATE`, or `DELETE`.
- `action_description` — `VARCHAR(500) NOT NULL`, human-readable explanation.
- `old_values` — JSONB, nullable for creation.
- `new_values` — JSONB, nullable where appropriate.
- `performed_by` — UUID FK to `auth.users.id`.
- `performed_at` — TIMESTAMPTZ.

For soft deletion, the trigger must recognize a status change from `Y` to `N` as a logical `DELETE` audit action, while preserving the resulting state in `new_values`, including `status: N`.

Users may view audit history for a selected transaction but cannot insert, update, or delete audit records directly.

Retain transaction and audit history during the user's account lifetime. Permanent user account deletion removes related records.

### 5.7 `account_audit_logs`

Purpose: stores audit history for meaningful account changes.

Approved fields:
- `audit_log_id` — UUID primary key.
- `account_id` — FK to `accounts.account_id`.
- `action` — approved action types: `INSERT`, `UPDATE`, `DEACTIVATE`, `REACTIVATE`.
- `action_description` — `VARCHAR(500) NOT NULL`.
- `old_values` — JSONB.
- `new_values` — JSONB.
- `performed_by` — UUID FK to `auth.users.id`.
- `performed_at` — TIMESTAMPTZ.

Record meaningful account changes, including creation, initial balance changes, deactivation, reactivation, and future meaningful modifications. Descriptions are generated by trusted database logic, not arbitrary frontend input.

### 5.8 `user_profile_audit_logs`

Purpose: stores audit history for meaningful user profile changes.

Approved fields:
- `audit_log_id` — UUID primary key.
- `user_profile_id` — FK to `user_profiles.user_profile_id`.
- `action` — action identifier.
- `action_description` — `VARCHAR(500) NOT NULL`.
- `old_values` — JSONB.
- `new_values` — JSONB.
- `performed_by` — UUID FK to `auth.users.id`.
- `performed_at` — TIMESTAMPTZ.

Detailed profile audit event definitions are intentionally deferred. Do not invent additional profile audit requirements without approval.

## 6. Relationships and Composite Keys

Main relationships:

- `auth.users` to `user_profiles`: one-to-one, enforced by unique `auth_user_id` and the trusted signup lifecycle.
- `user_profiles` to `accounts`: one-to-many.
- `user_profiles` to `transactions`: one-to-many.
- `transaction_types` to `categories`: one-to-many.
- `transaction_types` to `transactions`: one-to-many.
- `categories` to `transactions`: one-to-many; transaction category is nullable for Transfer.
- `accounts` to `transactions`: one-to-many as source/account.
- `accounts` to `transactions`: one-to-many as destination; destination is nullable for Income/Expense.
- `transactions` to `transaction_audit_logs`: one-to-many.
- `accounts` to `account_audit_logs`: one-to-many.
- `user_profiles` to `user_profile_audit_logs`: one-to-many.

Required composite uniqueness and foreign keys:
1. `accounts`: UNIQUE (`account_id`, `user_profile_id`).
2. `transactions`: composite FK (`account_id`, `user_profile_id`) to accounts.
3. `transactions`: composite FK (`destination_account_id`, `user_profile_id`) to accounts.
4. `categories`: UNIQUE (`category_id`, `transaction_type_id`).
5. `transactions`: composite FK (`category_id`, `transaction_type_id`) to categories.

These relationships enforce same-user account ownership and category/type compatibility at the database level.

## 7. Balance Calculation Rules

Per-account balance:

```text
initial_balance
+ active income amounts
- active expense amounts
- active outgoing transfer amounts
+ active incoming transfer amounts
- active transfer fees
```

For a transfer of amount A and fee F:
- Source decreases by A + F.
- Destination increases by A.
- Overall money across accounts decreases by F.

The application must not maintain an independently editable current-balance column as the authoritative balance.

Database functions must validate the resulting balances before committing operations.

## 8. Dashboard Aggregations

- Total Balance: sum of calculated balances for active accounts only.
- Total Income: sum of active, non-deleted Income transaction amounts.
- Total Expense: sum of active, non-deleted Expense transaction amounts only.
- Total Transfer Fees: sum of fees from active, non-deleted Transfer transactions.

Transfer fees are not included in Total Expense.

Inactive accounts are excluded from dashboard Total Balance even if they regain a positive balance after an approved reversal. Their balances remain part of their account history and become included in total balance if reactivated.

## 9. Constraints Versus Business Logic

Use database constraints for row-level values and relationships, including:
- Required values.
- Positive transaction amounts.
- Nonnegative initial balances and transfer fees.
- Valid status values.
- Unique identifiers and approved composite keys.
- Foreign-key relationships.

Use PostgreSQL functions and transaction-safe triggers for business rules that require evaluating multiple rows or resulting balances, including:
- Sufficient funds.
- Account status and ownership checks.
- Last active account protection.
- Deactivation only at zero balance.
- Transaction create/edit/delete reversals.
- Concurrent spending protection.

React may perform early validation for user experience, but database enforcement is authoritative.

## 10. RLS and Access-Control Design

Enable RLS on all eight application-owned tables.

High-level access matrix:

| Table | User access |
|---|---|
| `user_profiles` | Read and update own profile; creation through trusted signup |
| `accounts` | Read and manage own accounts; no normal physical delete |
| `transaction_types` | Read only |
| `categories` | Read only |
| `transactions` | Read own; financial writes through secure database functions |
| `transaction_audit_logs` | Read own history; no direct modification |
| `account_audit_logs` | Read own history; no direct modification |
| `user_profile_audit_logs` | Read own history; no direct modification |

Use `auth.uid()` and the relationship to `user_profiles.auth_user_id` to derive the user's profile identity. RLS policies and SQL grants must both be configured. The final SQL policy definitions are part of implementation.

## 11. Index and Performance Plan

Design for thousands or tens of thousands of transactions per user.

Initial index candidates:
- `accounts(user_profile_id, status)`
- `transactions(user_profile_id, status, transaction_date)`
- `transactions(account_id, user_profile_id)`
- `transactions(destination_account_id, user_profile_id)`
- `transactions(category_id, transaction_type_id)`
- `categories(transaction_type_id, status)`
- `transaction_audit_logs(transaction_id, performed_at)`
- `account_audit_logs(account_id, performed_at)`
- `user_profile_audit_logs(user_profile_id, performed_at)`

`user_profiles(auth_user_id)` is already indexed by its unique constraint. Primary keys and unique constraints also create indexes. Avoid duplicate indexes.

Use database-side filtering, sorting, and pagination. Initial page size may be 20; review query patterns and performance before choosing final pagination strategy. Use cursor-based pagination where appropriate for larger datasets.

## 12. Deferred Features

Do not add tables or rules for these features until separately designed and approved:
- Budgets.
- Savings Goals.
- Balance adjustments.
- Recurring transactions.
- Multi-currency support.
- Bank integrations.

## 13. Implementation Checklist

Before connecting the frontend:
1. Implement tables and exact approved columns.
2. Implement primary keys, foreign keys, unique constraints, and checks.
3. Resolve the developer seed-record `created_by` strategy.
4. Seed transaction types and categories.
5. Implement indexes without duplication.
6. Implement secure PostgreSQL financial functions.
7. Implement trigger functions and audit triggers.
8. Implement grants and RLS policies.
9. Test ownership and unauthorized access.
10. Test financial calculations, edits, deletions, transfers, and concurrent requests.
11. Review migration scripts before applying them to any hosted database.

This document defines the approved database design. Any required change must be explained and approved before implementation.
