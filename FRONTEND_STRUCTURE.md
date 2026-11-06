# FRONTEND_STRUCTURE.md

**Project:** FinTrack  
**Status:** Approved  
**Frontend stack:** React, Vite, TypeScript, Tailwind CSS

## 1. Purpose

This document defines how the FinTrack frontend source code is organized.

FinTrack uses a feature-based folder structure. Related components, hooks, services, and types are grouped by application feature.

## 2. Planned Folder Structure

```text
fintrack/
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── accounts/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── transactions/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── budgets/
│   │   ├── goals/
│   │   ├── reports/
│   │   └── settings/
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/
│   │   │   └── client.ts
│   │   └── utils/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── AccountsPage.tsx
│   │   ├── BudgetsPage.tsx
│   │   ├── GoalsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── routes/
│   │   └── AppRouter.tsx
│   ├── types/
│   │   └── database.types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

This is a planned structure, not a requirement to create empty folders in advance. Create folders as features are implemented.

## 3. Folder Responsibilities

### `components/`

Reusable components shared across multiple features:
- `ui/` — buttons, inputs, dialogs, badges, and general interface elements.
- `layout/` — application shell, sidebars, headers, and navigation.
- `shared/` — reusable application-level components not tied to one feature.

### `features/`

Contains feature-specific code.

| Feature | Responsibility |
|---|---|
| `auth/` | Registration, login, Google sign-in, password recovery |
| `accounts/` | Financial account management |
| `transactions/` | Income, expenses, transfers, and transaction history |
| `dashboard/` | Financial summaries and dashboard widgets |
| `budgets/` | Planned feature; detailed design pending |
| `goals/` | Planned feature; detailed design pending |
| `reports/` | Financial reports and exports |
| `settings/` | User profile and application settings |

Within a feature:
- `components/` — feature-specific UI.
- `hooks/` — feature-specific React state and behavior.
- `services/` — Supabase communication and RPC calls.
- `types/` — feature-specific TypeScript types and interfaces.

Do not implement Budgets or Savings Goals until their requirements and database designs are approved.

### `hooks/`

Reusable React hooks that are not specific to one feature.

### `lib/`

Shared library configuration and utilities:
- `supabase/client.ts` — centralized Supabase client.
- `utils/` — general-purpose utility functions.

### `pages/`

Page-level components used by the application router. Pages compose feature components into complete screens.

### `routes/`

Route definitions, navigation configuration, and route protection.

### `types/`

Application-wide TypeScript types, including generated Supabase database types.

## 4. Frontend-to-Backend Communication

Use the Supabase JavaScript Client Library.

Centralized client location:

`src/lib/supabase/client.ts`

Feature services use this client to communicate with Supabase.

```text
Page
  |
  v
Feature Components
  |
  v
Feature Hooks
  |
  v
Feature Services
  |
  v
Supabase Client
  |
  v
PostgreSQL RPC / permitted reads
  |
  v
PostgreSQL Database
```

Financial operations must use approved PostgreSQL functions. The frontend must not bypass database security by directly writing financial transaction records.

## 5. Responsibilities and Boundaries

1. Components display UI and handle user interactions.
2. Hooks manage React state and coordinate feature behavior.
3. Services communicate with Supabase and call approved database functions.
4. Types define data structures used by the frontend.
5. PostgreSQL enforces financial business rules and data integrity.
6. RLS enforces record-level access restrictions.

Frontend validation may provide immediate feedback, but database validation remains authoritative.

## 6. Development Guidelines

- Keep feature-specific code inside its feature folder.
- Reuse shared components rather than duplicating UI.
- Avoid complex business logic directly inside page components.
- Keep Supabase communication inside service files.
- Use TypeScript types instead of untyped data.
- Keep environment variables out of source control.
- Never expose Supabase secret or service-role keys in frontend code.
- Do not treat frontend validation as the only enforcement of financial rules.
- Create folders and files when needed rather than generating the entire structure prematurely.
- Build responsive layouts for desktop, tablet, and mobile.

## 7. Architecture Decision

FinTrack uses a feature-based frontend architecture. The structure is intended to keep code organized, maintainable, and scalable as the application grows.
