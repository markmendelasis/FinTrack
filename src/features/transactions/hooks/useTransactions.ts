import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { formatErrorMessage } from '@/lib/utils/formatters';
import { transactionService } from '../services/transactionService';
import type {
  TransactionWithDetails,
  TransactionType,
  Category,
  TransactionFilterParams,
  CreateIncomeInput,
  CreateExpenseInput,
  CreateTransferInput,
  EditTransactionInput,
} from '../types/transaction.types';

export function useTransactions(initialFilters: TransactionFilterParams = {}) {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 1,
    pageSize: 20,
    status: 'Y',
    ...initialFilters,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load transaction types and categories on mount
  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      try {
        const [types, cats] = await Promise.all([
          transactionService.getTransactionTypes(),
          transactionService.getCategories(),
        ]);
        if (isMounted) {
          setTransactionTypes(types);
          setCategories(cats);
        }
      } catch (err) {
        console.error('[FinTrack] Error loading transaction metadata:', err);
      }
    }
    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await transactionService.getTransactions(filters);
      setTransactions(result.data);
      setTotalCount(result.totalCount);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load transactions';
      console.error('[FinTrack] Error fetching transactions:', err);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleCreateIncome = async (input: CreateIncomeInput) => {
    try {
      await transactionService.createIncome(input);
      toast.success('Income transaction recorded successfully');
      await fetchTransactions();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Transaction was not successfully created');
      toast.error(message);
      throw err;
    }
  };

  const handleCreateExpense = async (input: CreateExpenseInput) => {
    try {
      await transactionService.createExpense(input);
      toast.success('Expense transaction recorded successfully');
      await fetchTransactions();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Transaction was not successfully created');
      toast.error(message);
      throw err;
    }
  };

  const handleCreateTransfer = async (input: CreateTransferInput) => {
    try {
      await transactionService.createTransfer(input);
      toast.success('Transfer completed successfully');
      await fetchTransactions();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Transfer was not successfully created');
      toast.error(message);
      throw err;
    }
  };

  const handleEditIncomeExpense = async (input: EditTransactionInput) => {
    try {
      await transactionService.editIncomeExpense(input);
      toast.success('Transaction updated successfully');
      await fetchTransactions();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Transaction was not successfully updated');
      toast.error(message);
      throw err;
    }
  };

  const handleSoftDelete = async (transactionId: string) => {
    try {
      await transactionService.softDeleteTransaction(transactionId);
      toast.success('Transaction deleted and balance reversed');
      await fetchTransactions();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Transaction could not be deleted');
      toast.error(message);
      throw err;
    }
  };

  return {
    transactions,
    totalCount,
    transactionTypes,
    categories,
    filters,
    setFilters,
    isLoading,
    fetchTransactions,
    createIncome: handleCreateIncome,
    createExpense: handleCreateExpense,
    createTransfer: handleCreateTransfer,
    editIncomeExpense: handleEditIncomeExpense,
    softDeleteTransaction: handleSoftDelete,
  };
}
