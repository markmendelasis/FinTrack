# PROJECT_OVERVIEW.md

**Project:** FinTrack  
**Project type:** Cross-device personal finance management application  
**Project status:** Planning and documentation approved; implementation not yet started  
**Currency:** Philippine Peso (PHP)

## 1. Project Introduction

FinTrack is a personal finance management application designed to help users organize, monitor, and understand their personal finances in one place.

It will be available as a responsive web application across desktop computers, laptops, tablets, and smartphones using supported browsers. The same React application will adapt its layout and interactions to different screen sizes.

Users will be able to manage financial accounts, record income and expenses, transfer money between accounts, monitor balances, view financial summaries, and review financial activity.

Budgets and Savings Goals are planned features, but their detailed requirements and database designs have not yet been approved.

## 2. Problem Statement

Managing personal finances manually can become difficult when money is distributed across multiple financial accounts. Users may struggle to monitor balances, calculate income and expenses, track transfers, understand spending patterns, and maintain reliable financial history.

FinTrack aims to provide a centralized and secure way to manage these activities.

## 3. Project Objectives

1. Centralize personal financial records.
2. Calculate account balances accurately from the opening balance and transaction history.
3. Simplify income, expense, and transfer tracking.
4. Provide useful financial summaries and reports.
5. Maintain a traceable history of important changes.
6. Protect users' financial information.
7. Provide a responsive experience across desktop, tablet, and mobile devices.
8. Build a maintainable application that can support future enhancements.

## 4. Platform and Device Support

### Initial platform

FinTrack will initially be implemented as one responsive web application using React and Vite.

Target device categories:
- Desktop and laptop computers.
- Android smartphones and tablets.
- iPhones and iPads.

The interface must adapt to screen size and input method. Mobile layouts must be intentionally designed rather than simply shrinking desktop layouts.

### Future possibilities

PWA installation and native mobile applications may be considered in a later phase. They are not requirements for the initial implementation.

## 5. Main Features and Scope

### 5.1 Authentication and User Profiles

Planned capabilities:
- Email and password registration.
- Email and password login.
- Google OAuth sign-in.
- Password recovery and reset.
- Application profile management.
- Secure permanent account deletion.

Supabase Auth manages authentication credentials. FinTrack must not store passwords in application tables.

### 5.2 Financial Account Management

Users can create and manage financial accounts such as Cash Wallet, bank accounts, GCash, and Maya.

Planned capabilities:
- Automatically create a default Cash Wallet after registration.
- Create additional accounts.
- Set an initial balance.
- View account balances and history.
- Deactivate and reactivate accounts.
- View account audit history.

Users must always have at least one active account. Account deactivation is allowed only when the account balance is zero. Account names cannot be renamed or physically deleted through normal account management.

### 5.3 Transaction Management

FinTrack supports three predefined transaction types:

**Income**
- Records money received.
- Requires a receiving account and an income category.
- Increases the selected account balance.

**Expense**
- Records money spent.
- Requires a spending account and an expense category.
- Decreases the selected account balance.

**Transfer**
- Moves money between two accounts belonging to the same user.
- Requires a source account and destination account.
- May include a transfer fee.
- Deducts the amount and fee from the source account and credits only the amount to the destination account.

Transfer fees reduce the source account balance but are reported separately from expenses.

### 5.4 Dashboard

The dashboard will display:
- Total Balance.
- Total Income.
- Total Expense.
- Total Transfer Fees.

Total Balance is the sum of balances from active accounts only. Financial summaries exclude soft-deleted transactions.

### 5.5 Budgets — Planned, Design Pending

Budgets are part of the planned product scope. Their requirements, business rules, calculations, user workflows, relationships, and database structure have not yet been finalized.

Do not implement this feature or create its tables until its design is discussed and approved.

### 5.6 Savings Goals — Planned, Design Pending

Savings Goals are part of the planned product scope. Their requirements, business rules, calculations, user workflows, relationships, and database structure have not yet been finalized.

Do not implement this feature or create its tables until its design is discussed and approved.

### 5.7 Reports

The general reporting scope includes:
- Income and expense reports.
- Transaction history.
- Transfer fee reports.
- Account activity.
- PDF export.

Detailed report requirements will be defined during feature development.

### 5.8 Audit History

Important account, transaction, and profile changes will be recorded in separate audit tables.

Audit records include the action, old values, new values, human-readable action description, actor, and timestamp, as applicable.

PostgreSQL triggers and trusted trigger functions create audit records automatically.

## 6. Technology Stack

| Area | Technology |
|---|---|
| Frontend | React |
| Build tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend platform | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Database communication | Supabase JavaScript Client Library |
| Financial operations | PostgreSQL functions called through RPC |
| Access control | PostgreSQL Row Level Security |
| Audit automation | PostgreSQL triggers and trigger functions |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Version control | Git and GitHub |
| Hosting/deployment | To be finalized |

A separate Node.js or Express backend is not part of the approved architecture.

## 7. High-Level Architecture

```text
User
  |
  v
React Responsive Web Application
  |
  v
Supabase JavaScript Client Library
  |
  +--------------------+
  |                    |
  v                    v
Supabase Auth       PostgreSQL
                       |
          +------------+-------------+
          |            |             |
          v            v             v
        Tables      RPC Functions   Triggers
          |            |             |
          |            v             v
          |       Financial       Audit Logs
          |       Operations
          v
       RLS Policies
```

The frontend communicates with Supabase through the Supabase JavaScript Client Library. PostgreSQL is authoritative for financial validation, data integrity, and access enforcement.

## 8. Important Financial Rules

1. Account balances are derived from initial balances and active transaction history.
2. Income increases an account balance.
3. Expenses decrease an account balance.
4. Transfers debit the source by amount plus fee and credit the destination by amount only.
5. Transfer fees are reported separately and are not included in Total Expense.
6. No resulting account balance may be negative.
7. Transactions are soft-deleted, not physically deleted through normal application workflows.
8. Income and Expense transactions may be edited under approved reversal-and-reapplication rules.
9. Transfer transactions cannot be edited after creation.
10. Transaction dates cannot be edited after creation.
11. Users can access only their own financial records.
12. PostgreSQL is the authoritative enforcement point for financial business rules.

See `DATABASE_DESIGN.md` for the detailed rules.

## 9. Initial Limitations

- PHP (₱) only; no multi-currency conversion.
- No direct bank integration or automatic bank transaction imports.
- No recurring transaction automation in the initial scope.
- No user-created transaction categories in the initial scope.
- No transaction duplication feature in the initial scope.
- Budgets and Savings Goals require separate design approval.
- PWA and native mobile applications are future possibilities, not initial requirements.

## 10. Development Roadmap

| Sprint | Focus | Status |
|---|---|---|
| Sprint 0 | Planning and Requirements | Completed |
| Sprint 1 | Project Foundation | Pending |
| Sprint 2 | Database Design and Implementation | Design approved; SQL implementation pending |
| Sprint 3 | Authentication and User Profiles | Pending |
| Sprint 4 | Transactions and Financial Accounts | Pending |
| Sprint 5 | Dashboard and Financial Summaries | Pending |
| Sprint 6 | Budgets and Financial Goals | Planned; detailed design pending |
| Sprint 7 | Testing and Deployment | Pending |

## 11. Project Documentation

- `PROJECT_OVERVIEW.md` — introduction, objectives, scope, and roadmap.
- `DATABASE_DESIGN.md` — tables, relationships, constraints, and financial rules.
- `BACKEND_ARCHITECTURE.md` — Supabase and PostgreSQL backend architecture.
- `FRONTEND_STRUCTURE.md` — frontend folder organization and responsibilities.
- `SECURITY.md` — authentication, authorization, RLS, and security requirements.
- `DEVELOPMENT_GUIDELINES.md` — coding standards, testing, Git, and implementation workflow.

These documents are the approved project baseline. Any changes must follow the change-management process in `DEVELOPMENT_GUIDELINES.md`.

## 12. Development Approach

FinTrack will be developed incrementally:
1. Clarify requirements.
2. Review and approve technical designs.
3. Prepare implementation instructions.
4. Implement a defined milestone.
5. Review code, SQL, and configuration.
6. Test the implementation.
7. Fix issues.
8. Approve the milestone.
9. Update documentation when necessary.

The user retains final decision-making authority over requirements, architecture, and business rules.

**Project goal:** Build a secure, reliable, responsive, and maintainable personal finance management application that demonstrates practical full-stack development and sound database engineering.
