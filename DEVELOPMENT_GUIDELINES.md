# DEVELOPMENT_GUIDELINES.md

**Project:** FinTrack  
**Status:** Approved  
**Purpose:** Establish consistent development, coding, testing, and collaboration practices.

## 1. Development Principles

1. Understand requirements before implementation.
2. Follow the approved project documentation.
3. Keep code readable, reusable, and maintainable.
4. Prioritize correctness and security over speed.
5. Avoid unnecessary complexity.
6. Test before requesting milestone approval.

## 2. Technology Standards

| Area | Technology |
|---|---|
| Frontend | React |
| Build tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Version control | Git and GitHub |

Do not introduce another framework, backend server, or major library without discussing and approving the change.

## 3. Naming Conventions

Use consistent naming across the codebase.

| Item | Convention | Example |
|---|---|---|
| React components | PascalCase | `AccountCard.tsx` |
| Pages | PascalCase with Page suffix | `DashboardPage.tsx` |
| Hooks | camelCase with `use` prefix | `useTransactions.ts` |
| Services | camelCase with service suffix | `transactionService.ts` |
| Utility functions | camelCase | `formatCurrency.ts` |
| Variables | camelCase | `accountBalance` |
| Functions | camelCase | `createTransaction()` |
| Constants | UPPER_SNAKE_CASE when appropriate | `DEFAULT_PAGE_SIZE` |
| TypeScript interfaces/types | PascalCase | `Transaction` |
| Database tables and columns | snake_case | `transaction_audit_logs` |

Database naming must follow the approved database design.

## 4. Frontend Coding Standards

### React components
- Use functional React components.
- Use TypeScript for component props and data.
- Keep components focused on a clear responsibility.
- Extract reusable UI into shared components.
- Avoid placing complex business logic directly inside components.

### Hooks
- Use custom hooks for reusable state and feature behavior.
- Keep hooks focused on their responsibilities.
- Avoid unnecessary global state.

### Services
- Keep Supabase communication inside feature service files.
- Use the centralized Supabase client.
- Call approved PostgreSQL RPC functions for financial operations.
- Do not scatter direct database requests throughout components.

### TypeScript
- Prefer explicit types for important data structures.
- Avoid `any` unless there is a documented reason.
- Reuse shared types when appropriate.
- Keep generated database types synchronized with the actual schema.

### Styling
- Use Tailwind CSS consistently.
- Prefer reusable components for repeated styling patterns.
- Maintain a consistent design across pages.
- Support responsive desktop, tablet, and mobile layouts.

## 5. Backend and Database Standards

PostgreSQL enforces financial business rules.

Requirements:
- Follow the approved database schema.
- Use appropriate primary keys, foreign keys, constraints, and indexes.
- Use PostgreSQL functions for approved financial operations.
- Use triggers and trigger functions for automatic audit logging.
- Apply RLS policies to protect user-owned records.
- Use database transactions and appropriate locking for operations affecting multiple accounts.
- Do not store a manually updated current balance as the authoritative balance when balances are derived from transaction history.
- Avoid physical deletion of financial transactions; follow the approved soft-delete policy.

Any database schema change must be reviewed before implementation.

## 6. Validation and Error Handling

### Frontend validation

Provide immediate feedback for:
- Required fields.
- Invalid input formats.
- Invalid amounts.
- Missing account selections.
- Invalid transaction dates.

### Database validation

PostgreSQL must independently enforce all critical rules, including:
- Sufficient balances.
- Account ownership.
- Valid transfers.
- Valid transaction types and categories.
- Nonnegative resulting balances.

Frontend validation must never be the only protection.

### Error handling

- Handle errors at service and UI boundaries.
- Display clear, user-friendly messages.
- Avoid exposing SQL details, stack traces, or sensitive information.
- Log useful debugging information without exposing credentials or unnecessary financial data.
- Do not silently ignore failed database operations.

## 7. Git and Version Control

Use Git and GitHub to protect the project and track changes.

### Branching

| Branch | Purpose |
|---|---|
| `main` | Stable and approved code |
| `develop` | Integration of completed features |
| `feature/<name>` | New feature development |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation changes |

Example:

```bash
git checkout -b feature/account-management
```

### Commit messages

Recommended format:

```text
type: short description
```

Examples:

```text
feat: add account management
fix: prevent invalid transfer amounts
docs: update database architecture
refactor: simplify transaction service
test: add transaction validation tests
```

### Git safeguards

- Commit approved documentation before implementation.
- Do not commit `.env.local` or real credentials.
- Do not overwrite approved documents without authorization.
- Do not push unreviewed changes directly to `main`.
- Review changes before merging branches.

## 8. Testing Requirements

Testing must be performed throughout development.

### Frontend testing
- Component rendering.
- User interactions.
- Form validation.
- Navigation and route protection.
- Loading, empty, and error states.

### Backend testing
- Database constraints.
- PostgreSQL function behavior.
- RLS and ownership enforcement.
- Trigger and audit log behavior.
- Transaction atomicity.
- Concurrent financial operations.

### Financial test cases

Examples:
- Expense exceeding available balance must fail.
- Transfer exceeding available balance, including fee, must fail.
- Editing a transaction must correctly reverse and apply financial effects.
- Deleting a transaction must not produce a negative resulting balance.
- Inactive accounts must not be available for new transactions.
- Existing transactions associated with inactive accounts must follow approved edit and deletion rules.

Use controlled test data and separate user accounts when checking ownership.

## 9. Antigravity Development Guidelines

Google Antigravity is the implementation assistant.

It must:
1. Read approved project documentation before implementing a feature.
2. Implement only the feature or task currently assigned.
3. Follow the approved folder structure and technology stack.
4. Not independently change approved business rules.
5. Not modify database schemas, RLS policies, permissions, or financial functions without approval.
6. Not introduce a separate Node.js or Express backend.
7. Not expose Supabase secret or service-role keys.
8. Not automatically execute production database migrations.
9. Not delete or overwrite approved project files without authorization.
10. Report files created or modified and summarize important decisions.
11. Identify assumptions and unresolved questions instead of silently making architectural decisions.
12. Not claim a feature is complete without appropriate testing.

### Implementation workflow

For each feature:
1. Review requirements.
2. Prepare an implementation plan.
3. Identify files to create or modify.
4. Implement the approved plan.
5. Run relevant tests and checks.
6. Report results and unresolved issues.
7. Submit work for review.

## 10. ChatGPT Mentorship and Code Review

ChatGPT acts as the Senior Software Developer / Technical Lead. The user acts as the Junior Developer and project decision-maker.

Workflow:
1. Discuss requirements and explain technical concepts.
2. Propose an implementation or design.
3. Allow the user to review and approve decisions.
4. Prepare detailed instructions for Antigravity.
5. Review generated code, SQL, and configuration.
6. Identify issues and recommend corrections.
7. Test and validate the feature.
8. Approve the completed milestone.
9. Update project documentation when necessary.

The user has final approval over architecture and business-rule changes.

## 11. Definition of Done

A feature is complete only when:
- Requirements are satisfied.
- Implementation follows approved architecture.
- Security requirements are respected.
- Relevant tests pass.
- No known critical errors remain.
- Code changes have been reviewed.
- Documentation has been updated when necessary.
- The user approves the completed feature.

## 12. Change Management

If a technical limitation or new requirement requires changing an approved decision:
1. Explain the issue.
2. Describe available solutions.
3. Explain advantages and disadvantages.
4. Recommend an approach.
5. Obtain approval before changing the design.
6. Update the relevant documentation.

**No implementation assistant may silently override an approved FinTrack decision.**
