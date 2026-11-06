# BACKEND_ARCHITECTURE.md

**Project:** FinTrack  
**Status:** Approved architecture; implementation pending

## 1. Purpose

This document defines the approved backend architecture for FinTrack.

FinTrack uses Supabase as its backend platform and PostgreSQL as its database and financial business-rule enforcement layer. A separate Node.js or Express backend is not part of the approved architecture.

## 2. Architecture Overview

Technology:
- Supabase Auth for authentication.
- PostgreSQL for persistent data.
- PostgreSQL functions called through Supabase RPC for secure financial operations.
- PostgreSQL triggers and trigger functions for automatic audit logging.
- PostgreSQL Row Level Security (RLS) and grants for access control.
- Supabase JavaScript Client Library for frontend communication.

```text
React + Vite + TypeScript
          |
          v
Supabase JavaScript Client
          |
     +----+----------------+
     |                     |
     v                     v
Supabase Auth          PostgreSQL
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
           Tables       RPC Functions   Triggers
                           |             |
                           v             v
                    Financial Rules   Audit Functions
                                         |
                                         v
                                    Audit Tables
```

The frontend does not connect directly to PostgreSQL using raw database credentials. It communicates through the Supabase client.

## 3. Frontend-to-Supabase Communication

Create one centralized Supabase client:

`src/lib/supabase/client.ts`

Read the project URL and publishable key from Vite environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

The publishable key is designed for browser use. It does not authorize unrestricted access by itself; RLS and database grants must protect the data.

Never expose a Supabase secret or service-role key in frontend code or any `VITE_` variable.

Feature-specific service modules communicate with Supabase. React components should not contain scattered database requests.

Typical flow:

```text
Page / Component
      |
      v
Feature Hook
      |
      v
Feature Service
      |
      v
Supabase JavaScript Client
      |
      v
PostgreSQL RPC / permitted read
      |
      v
Database validation and response
```

Read operations may use the Supabase client subject to grants and RLS. Financial writes must use approved PostgreSQL functions through RPC.

## 4. Authentication Architecture

Supabase Auth manages:
- Email/password registration and login.
- Google OAuth.
- Password recovery and reset.
- Session management.

FinTrack does not store passwords in `user_profiles` or other application tables.

A trusted signup process must create the application profile and default Cash Wallet for each new user, including OAuth users. The signup lifecycle must be reliable and idempotent so retries do not create duplicate profiles or accounts.

Email verification requirements and provider redirect configuration must be finalized in Supabase before production release.

## 5. User Identity and Ownership

Supabase Auth provides the authenticated identity through `auth.uid()`.

The database resolves the corresponding `user_profile_id` through:

`user_profiles.auth_user_id = auth.uid()`

All user-owned records must be scoped to that profile.

Do not trust a `user_profile_id`, `account_id`, or other ownership identifier merely because it was supplied by the frontend. Secure database functions must independently verify ownership.

Composite foreign keys approved in `DATABASE_DESIGN.md` reinforce account ownership and category/type consistency.

## 6. PostgreSQL Financial Operations

PostgreSQL functions are responsible for financial operations and authoritative business validation.

Expected operation groups include:
- Account creation and status changes.
- Initial balance changes while permitted.
- Income creation.
- Expense creation.
- Transfer creation.
- Income and Expense editing.
- Transaction soft deletion.
- Secure summary queries where appropriate.

The exact function signatures and implementation details must be derived from the approved database design and reviewed before migration.

### Atomicity

A financial operation must either complete fully or have no effect.

For example, a transfer must not debit the source account without crediting the destination account and recording the corresponding audit entry.

### Balance validation

Database functions must calculate the resulting balance after applying the operation's financial effect. No affected account may end with a negative balance.

### Concurrency

Use appropriate row-level locking and a consistent lock ordering when multiple account rows are involved. This prevents concurrent operations from spending the same available funds and reduces deadlock risk.

### Editing

For Income and Expense edits:
1. Verify the authenticated owner and transaction ownership.
2. Reverse the original effect.
3. Apply the new effect.
4. Validate all affected balances.
5. Persist the edit atomically.
6. Let the audit mechanism record the change.

Transfer transactions are immutable after creation except for soft deletion.

### Deletion

Deletion is a soft-delete operation. Reverse the transaction's effect and mark it deleted only if every resulting balance remains nonnegative. Reversal and audit logging must be atomic.

## 7. Database Constraints

Use PostgreSQL constraints for row-level data integrity:
- Primary keys.
- Foreign keys.
- Unique constraints.
- Check constraints.
- Not-null constraints.
- Composite ownership and category/type relationships.

Use database functions for multi-row business rules and resulting-balance validation. Do not attempt to enforce complex balance rules only in React or with ordinary CHECK constraints.

## 8. Audit Architecture

Audit history is generated by PostgreSQL triggers and trigger functions, not by React.

Conceptual execution:

```text
Financial RPC Function
        |
        v
INSERT / UPDATE transaction row
        |
        v
PostgreSQL Trigger fires
        |
        v
Trigger Function executes
        |
        v
Audit row inserted
        |
        v
Operation commits
```

A trigger is the database mechanism that fires on an event. A trigger function is the function it executes.

Separate audit tables are used:
- `transaction_audit_logs`
- `account_audit_logs`
- `user_profile_audit_logs`

Audit entries include action, old values, new values, `action_description`, actor, and timestamp, as defined in `DATABASE_DESIGN.md`.

The trigger function must generate human-readable descriptions using trusted database logic. Do not accept arbitrary audit descriptions from the frontend.

For transaction soft deletion, an UPDATE changing status from `Y` to `N` must be represented as a logical `DELETE` audit action. Preserve the resulting state in `new_values`.

Audit inserts occur in the same database transaction as the underlying operation. If audit insertion fails, the business operation must roll back.

Trigger functions that need elevated permissions must be designed carefully:
- Use a controlled function owner.
- Set a fixed, safe `search_path`.
- Avoid dynamic SQL unless necessary and safely parameterized.
- Restrict execution privileges.
- Do not trust caller-supplied actor IDs; use authenticated context and validated database logic.
- Review how RLS applies to trigger functions and audit-table inserts.

## 9. RLS and Database Permissions

Enable RLS on all eight application-owned tables.

RLS policies must restrict user-owned records to the authenticated owner. Lookup tables are read-only to ordinary users. Audit tables are readable by the owner but not directly writable by users.

Configure SQL grants as well as RLS policies. RLS alone does not define all object privileges.

Financial table writes must not be available through unrestricted direct client table mutations. Grant execution on approved RPC functions to the intended roles and revoke unnecessary write privileges.

Any `SECURITY DEFINER` function must be narrowly scoped, use a safe search path, validate the caller, and be reviewed for privilege escalation risks.

## 10. Permanent User Deletion

Permanent account deletion must use a trusted server-side process, such as a protected Supabase Edge Function or another approved server-side administrative process.

Requirements:
- Require password reauthentication or an appropriate provider reauthentication for OAuth users.
- Require clear irreversible confirmation.
- Never expose service-role credentials to the browser.
- Delete the Supabase Auth user and all associated application data, including financial records and audit logs.
- Handle foreign-key relationships and deletion order deliberately.
- Disclose that backups may retain data until the configured backup-retention period expires.

Do not implement permanent deletion as an unrestricted frontend database operation.

## 11. Performance

Design for thousands or tens of thousands of transactions per user.

Use:
- Database-side filtering, sorting, and pagination.
- Approved indexes based on query patterns.
- Efficient summary queries.
- Limited result sets.
- Avoidance of N+1 query patterns.
- Query-plan review for expensive operations.

Do not fetch every transaction into the browser to calculate authoritative financial summaries.

## 12. Deployment Architecture

Planned deployment model:
- Responsive React frontend hosted on a static/web application hosting provider such as Netlify or Vercel; provider to be finalized.
- Supabase-hosted PostgreSQL and Auth.
- GitHub for source control.

Production secrets must be configured through secure hosting/provider settings, not committed to source control.

Backup plan, retention, restore testing, and production deployment settings must be finalized before launch.

## 13. Security Principles

- Supabase publishable key may be used in the browser.
- Supabase secret/service-role keys must remain server-side.
- RLS and grants must enforce least privilege.
- Financial rules are enforced in PostgreSQL.
- Ownership is derived from authenticated identity.
- Audit logs are written by trusted database logic.
- Financial operations are atomic and concurrency-safe.
- No production migration or destructive operation is applied without approval.

## 14. Implementation Order

1. Configure the Supabase project and local development environment.
2. Implement reviewed database migrations.
3. Create and seed lookup data using an approved system-actor strategy.
4. Configure constraints and indexes.
5. Implement secure financial RPC functions.
6. Implement audit trigger functions and triggers.
7. Configure grants and RLS.
8. Test database behavior and security.
9. Connect frontend feature services.
10. Implement authentication and application features.

This architecture is approved. Function signatures, detailed policies, and migration scripts remain implementation artifacts that require review before application.
