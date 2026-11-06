import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Wallet } from 'lucide-react';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { AccountCard } from '@/features/accounts/components/AccountCard';
import { CreateAccountModal } from '@/features/accounts/components/CreateAccountModal';
import { EditInitialBalanceModal } from '@/features/accounts/components/EditInitialBalanceModal';
import { AccountAuditLogModal } from '@/features/accounts/components/AccountAuditLogModal';
import { AccountFilterTabs } from '@/features/accounts/components/AccountFilterTabs';
import type { AccountWithBalance } from '@/features/accounts/types/account.types';

export function AccountsPage() {
  const {
    accounts,
    allAccounts,
    activeAccounts,
    inactiveAccounts,
    isLoading,
    filter,
    setFilter,
    createAccount,
    updateInitialBalance,
    deactivateAccount,
    reactivateAccount,
  } = useAccounts();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<AccountWithBalance | null>(null);
  const [selectedForAudit, setSelectedForAudit] = useState<AccountWithBalance | null>(null);

  const filterCounts = {
    all: allAccounts.length,
    active: activeAccounts.length,
    inactive: inactiveAccounts.length,
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Accounts</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your cash wallets, bank savings, and digital payment accounts.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Account
        </Button>
      </div>

      {/* Filter tabs */}
      {allAccounts.length > 0 && (
        <div className="flex items-center justify-between">
          <AccountFilterTabs
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={filterCounts}
          />
        </div>
      )}

      {/* Accounts List Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <svg className="animate-spin h-6 w-6 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading accounts...
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Wallet className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              {allAccounts.length === 0 ? 'No accounts found' : 'No accounts match this filter'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {allAccounts.length === 0
                ? 'Create an account to start tracking your financial balances.'
                : 'Switch filters or add an account.'}
            </p>
            {allAccounts.length === 0 && (
              <div className="mt-4">
                <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add First Account
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.account_id}
              account={account}
              activeAccountsCount={activeAccounts.length}
              onEditInitialBalance={(acc) => setSelectedForEdit(acc)}
              onDeactivate={(acc) => deactivateAccount(acc.account_id, acc.account_name)}
              onReactivate={(acc) => reactivateAccount(acc.account_id, acc.account_name)}
              onViewAuditLogs={(acc) => setSelectedForAudit(acc)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAccountModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createAccount}
      />

      <EditInitialBalanceModal
        account={selectedForEdit}
        isOpen={!!selectedForEdit}
        onClose={() => setSelectedForEdit(null)}
        onSubmit={updateInitialBalance}
      />

      <AccountAuditLogModal
        account={selectedForAudit}
        isOpen={!!selectedForAudit}
        onClose={() => setSelectedForAudit(null)}
      />
    </div>
  );
}
