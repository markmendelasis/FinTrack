import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { formatErrorMessage } from '@/lib/utils/formatters';
import { accountService } from '../services/accountService';
import type {
  AccountWithBalance,
  AccountFilter,
  CreateAccountInput,
  UpdateInitialBalanceInput,
} from '../types/account.types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [filter, setFilter] = useState<AccountFilter>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load financial accounts';
      console.error('[FinTrack] Error loading accounts:', err);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const activeAccounts = useMemo(
    () => accounts.filter((a) => a.status === 'ACTIVE'),
    [accounts]
  );

  const inactiveAccounts = useMemo(
    () => accounts.filter((a) => a.status === 'INACTIVE'),
    [accounts]
  );

  const filteredAccounts = useMemo(() => {
    if (filter === 'ACTIVE') return activeAccounts;
    if (filter === 'INACTIVE') return inactiveAccounts;
    return accounts;
  }, [filter, accounts, activeAccounts, inactiveAccounts]);

  const handleCreateAccount = async (input: CreateAccountInput) => {
    try {
      await accountService.createAccount(input);
      toast.success(`Account "${input.account_name.trim()}" created successfully`);
      await fetchAccounts();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Account was not successfully created');
      toast.error(message);
      throw err;
    }
  };

  const handleUpdateInitialBalance = async (input: UpdateInitialBalanceInput) => {
    try {
      await accountService.updateInitialBalance(input);
      toast.success('Initial balance updated successfully');
      await fetchAccounts();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Initial balance could not be updated');
      toast.error(message);
      throw err;
    }
  };

  const handleDeactivateAccount = async (accountId: string, accountName: string) => {
    try {
      await accountService.deactivateAccount(accountId);
      toast.success(`Account "${accountName}" deactivated`);
      await fetchAccounts();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Account could not be deactivated');
      toast.error(message);
      throw err;
    }
  };

  const handleReactivateAccount = async (accountId: string, accountName: string) => {
    try {
      await accountService.reactivateAccount(accountId);
      toast.success(`Account "${accountName}" reactivated`);
      await fetchAccounts();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Account could not be reactivated');
      toast.error(message);
      throw err;
    }
  };

  return {
    accounts: filteredAccounts,
    allAccounts: accounts,
    activeAccounts,
    inactiveAccounts,
    isLoading,
    filter,
    setFilter,
    fetchAccounts,
    createAccount: handleCreateAccount,
    updateInitialBalance: handleUpdateInitialBalance,
    deactivateAccount: handleDeactivateAccount,
    reactivateAccount: handleReactivateAccount,
  };
}
