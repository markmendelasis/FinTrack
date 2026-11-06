# SECURITY.md

**Project:** FinTrack  
**Status:** Approved  
**Purpose:** Define security requirements and safeguards for development and deployment.

## 1. Security Principles

FinTrack handles personal financial information. Security must be considered throughout development.

Principles:
1. Database-first security for critical business rules and data integrity.
2. Least privilege for users and application components.
3. Defense in depth through authentication, authorization, RLS, constraints, and secure functions.
4. Never trust frontend input for permissions or authoritative financial values.
5. Secure by default; sensitive operations must be inaccessible unless explicitly authorized.

## 2. Authentication

Use Supabase Auth.

Supported methods:
- Email and password registration.
- Email and password login.
- Google OAuth.
- Password recovery and reset.

Requirements:
- Do not store passwords in FinTrack application tables.
- Supabase Auth manages password storage and authentication.
- Handle sessions through the Supabase client library.
- Configure email verification requirements before production release.
- Configure Google OAuth redirect URLs correctly.
- Unauthenticated users cannot access protected features.

## 3. Authorization and User Ownership

Authentication establishes who the user is. Authorization determines which records they may access.

Supabase Auth provides the authenticated user ID through `auth.uid()`. Resolve the corresponding `user_profile_id` through `user_profiles.auth_user_id`.

The database must validate ownership when users:
- View accounts and transactions.
- Create financial records.
- Edit or soft-delete transactions.
- Access audit history.
- Perform account operations.

Changing a UUID or request parameter in the browser must not grant access to another user's data.

## 4. Row Level Security

Enable RLS on all eight application-owned tables:
1. `user_profiles`
2. `accounts`
3. `transaction_types`
4. `categories`
5. `transactions`
6. `transaction_audit_logs`
7. `account_audit_logs`
8. `user_profile_audit_logs`

High-level access rules:

| Table | User permissions |
|---|---|
| `user_profiles` | Read and update own profile; creation through trusted signup |
| `accounts` | Read and manage own accounts; no normal physical deletion |
| `transaction_types` | Read only |
| `categories` | Read only |
| `transactions` | Read own; financial writes through approved database functions |
| `transaction_audit_logs` | Read own history; no direct modification |
| `account_audit_logs` | Read own history; no direct modification |
| `user_profile_audit_logs` | Read own history; no direct modification |

Additional requirements:
- RLS policies validate ownership using authenticated identity.
- Users cannot modify another user's records.
- RLS must be supported by appropriate SQL grants and database permissions.
- Enabling RLS alone is insufficient; privileges must also be configured.
- Test policies using separate user accounts.

## 5. Secure Database Operations

Financial operations must use approved PostgreSQL functions through Supabase RPC.

Examples:
- Creating Income and Expense.
- Creating Transfers.
- Editing Income and Expense.
- Soft-deleting transactions.
- Managing account status.
- Managing initial account balances where permitted.

PostgreSQL validates:
- User and account ownership.
- Account status where applicable.
- Transaction type and category compatibility.
- Sufficient balances.
- Resulting balances after edits and deletions.
- Valid transfer source and destination.
- Other approved financial rules.

Frontend validation may provide immediate feedback but never replaces database validation.

### Atomic operations and concurrency

Financial operations must be atomic. If any part fails, all changes must roll back.

Transfers must not debit the source without crediting the destination. Use appropriate row locking and transaction-safe logic to prevent concurrent requests from spending the same available funds.

## 6. Supabase Keys and Environment Variables

Example frontend configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Publishable key

The Supabase publishable key may be used in the frontend. It is designed for client-side applications and does not replace authentication, RLS, or database permissions.

### Secret and service-role keys

- Never place a Supabase secret or service-role key in React code.
- Never put secret keys in frontend environment variables.
- Never commit secret keys to GitHub.
- Keep server-side secrets only in secure server-side environments.

### Environment file rules

- Use `.env.local` for local development configuration.
- Include `.env.example` with placeholders only.
- Add local environment files to `.gitignore`.
- Configure production variables through secure hosting settings.
- Never share real credential files during code review.

## 7. Audit Log Protection

Audit records are created automatically through PostgreSQL triggers and trusted trigger functions.

Requirements:
- Users cannot directly insert, update, or delete audit records.
- Audit entries are created by trusted database logic.
- Entries identify the actor and timestamp.
- Entries include action, old values, new values, and a human-readable action description where applicable.
- Audit records remain associated with their business records.
- Audit creation occurs in the same database transaction as the operation being audited.

If audit creation fails, the corresponding business operation must fail and roll back.

Audit logs are not a replacement for database backups.

## 8. Account Deletion and Data Privacy

When a user permanently deletes their FinTrack account, all user-related records must be removed, including:
- Supabase Auth user.
- User profile.
- Financial accounts.
- Transactions.
- Transaction audit logs.
- Account audit logs.
- Profile audit logs.
- Other user-related records.

### Deletion safeguards

- Require a clear irreversible deletion warning and confirmation.
- Require password reauthentication or an appropriate provider reauthentication method for OAuth users.
- Execute deletion through a trusted server-side process.
- Handle foreign-key relationships and deletion order deliberately.
- Never expose administrative credentials in the frontend.

Backups may retain previously backed-up data until the configured backup retention period expires. This must be disclosed in privacy information.

## 9. Frontend Security Requirements

- Do not store passwords or secret credentials in application state or browser storage.
- Do not rely on hidden buttons or frontend route protection as the only access control.
- Do not trust user-supplied IDs, amounts, ownership, or transaction types.
- Use the Supabase client and parameterized operations rather than constructing unsafe SQL.
- Avoid rendering untrusted content as executable HTML.
- Do not expose sensitive financial information in logs or error messages.
- Handle authentication errors and expired sessions safely.

## 10. Security Testing

### Authentication
- Unauthenticated users cannot access protected features.
- Invalid login attempts are handled safely.
- Password recovery works.
- Google OAuth uses approved redirect URLs.

### Authorization and RLS
- User A cannot read User B's accounts.
- User A cannot read User B's transactions.
- User A cannot modify User B's records.
- Changing IDs in browser requests does not bypass ownership checks.
- Users cannot modify protected lookup or audit records.

### Financial operations
- Insufficient-balance transactions are rejected.
- Transfers are atomic.
- Invalid ownership is rejected.
- Concurrent spending cannot create negative balances.
- Invalid edits and deletions leave the original transaction unchanged.

### Secrets
- No service-role or secret key is included in the frontend build.
- No real credentials are committed to GitHub.
- Production environment variables are configured securely.

## 11. Security Implementation Rule

Security requirements must not be bypassed for convenience or faster frontend development.

Any proposed change to authentication, authorization, RLS, database permissions, financial validation, audit protection, or secret management must be reviewed before implementation.

**Security is a core requirement of FinTrack, not an optional enhancement.**
