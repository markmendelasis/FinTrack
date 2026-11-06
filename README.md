# FinTrack — Cross-Device Personal Finance Management

FinTrack is a cross-device personal finance management application designed to help users organize, monitor, and understand their finances in one place with strict financial accuracy, database integrity, and modern responsive UI.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend & Database:** Supabase & PostgreSQL
- **Authentication:** Supabase Auth
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Charts:** Recharts

## Approved Architecture Rules

1. **No Node.js / Express backend:** React connects directly to Supabase using `@supabase/supabase-js`.
2. **PostgreSQL RPC for financial operations:** All financial writes (income, expense, transfer, edits, soft deletions) execute through trusted PostgreSQL RPC functions.
3. **Dynamic Balance Derivation:** Account balances are dynamically calculated from initial balances and non-deleted transactions.
4. **Row Level Security (RLS):** Enabled across all application tables.
5. **Auditing via Triggers:** Automatic audit trail generated inside the database transaction.
6. **Currency:** Philippine Peso (PHP, ₱).

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and configure your Supabase project keys:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Milestone Status

- [x] **Milestone 1 — Project Foundation:** React + Vite + TypeScript + Tailwind CSS scaffold, centralized Supabase client, responsive layout shell, routing, and type definitions.
- [ ] **Milestone 2 — Database Implementation:** PostgreSQL migrations, tables, constraints, indexes, RLS policies, RPC functions, and audit triggers.
- [ ] **Milestone 3 — Authentication & User Profiles:** Supabase Auth, login, registration, default Cash Wallet provisioning.
- [ ] **Milestone 4 — Financial Accounts:** Account management, zero-balance deactivation, initial balance rules.
- [ ] **Milestone 5 — Transactions:** Income, expense, transfers, editing, soft deletion, and audit logging.
- [ ] **Milestone 6 — Dashboard:** Aggregations and financial summaries.
- [ ] **Milestone 7 — Budgets & Savings Goals:** Planned (design pending approval).
- [ ] **Milestone 8 — Reports & Finalization:** PDF export and deployment.
