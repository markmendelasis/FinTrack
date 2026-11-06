import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { X, TrendingUp, TrendingDown, ArrowLeftRight, AlertCircle } from 'lucide-react';
import type {
  TransactionType,
  Category,
  CreateIncomeInput,
  CreateExpenseInput,
  CreateTransferInput,
} from '../types/transaction.types';
import type { AccountWithBalance } from '@/features/accounts/types/account.types';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionTypes: TransactionType[];
  categories: Category[];
  accounts: AccountWithBalance[];
  onCreateIncome: (input: CreateIncomeInput) => Promise<void>;
  onCreateExpense: (input: CreateExpenseInput) => Promise<void>;
  onCreateTransfer: (input: CreateTransferInput) => Promise<void>;
}

export function CreateTransactionModal({
  isOpen,
  onClose,
  categories,
  accounts,
  onCreateIncome,
  onCreateExpense,
  onCreateTransfer,
}: CreateTransactionModalProps) {
  const [activeTab, setActiveTab] = useState<'Expense' | 'Income' | 'Transfer'>('Expense');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [transferFee, setTransferFee] = useState('0.00');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE');
  const todayStr = new Date().toISOString().split('T')[0];

  // Match categories by type name
  const currentCategories = categories.filter((c) => {
    if (activeTab === 'Income') {
      return ['Salary', 'Allowance', 'Business Income', 'Investment Income', 'Other Income'].includes(
        c.category_name
      );
    }
    if (activeTab === 'Expense') {
      return [
        'Food',
        'Groceries',
        'Transportation',
        'Bills',
        'Utilities',
        'Entertainment',
        'Healthcare',
        'Shopping',
        'Other Expense',
      ].includes(c.category_name);
    }
    return false;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    if (!transactionDate || transactionDate > todayStr) {
      setError('Future transaction dates are not allowed');
      return;
    }

    if (!accountId) {
      setError('Please select an account');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'Income') {
        if (!categoryId) {
          setError('Please select an income category');
          setIsSubmitting(false);
          return;
        }
        await onCreateIncome({
          account_id: accountId,
          category_id: categoryId,
          amount: numericAmount,
          transaction_date: transactionDate,
          description: description.trim() || undefined,
        });
      } else if (activeTab === 'Expense') {
        if (!categoryId) {
          setError('Please select an expense category');
          setIsSubmitting(false);
          return;
        }
        await onCreateExpense({
          account_id: accountId,
          category_id: categoryId,
          amount: numericAmount,
          transaction_date: transactionDate,
          description: description.trim() || undefined,
        });
      } else if (activeTab === 'Transfer') {
        if (!destinationAccountId) {
          setError('Please select a destination account');
          setIsSubmitting(false);
          return;
        }
        if (accountId === destinationAccountId) {
          setError('Source and destination accounts must be different');
          setIsSubmitting(false);
          return;
        }
        const numericFee = Number(transferFee) || 0;
        if (numericFee < 0) {
          setError('Transfer fee cannot be negative');
          setIsSubmitting(false);
          return;
        }
        await onCreateTransfer({
          source_account_id: accountId,
          destination_account_id: destinationAccountId,
          amount: numericAmount,
          transfer_fee: numericFee,
          transaction_date: transactionDate,
          description: description.trim() || undefined,
        });
      }

      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to record transaction';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-4">Record Transaction</h3>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('Expense');
              setCategoryId('');
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Expense'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            Expense
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('Income');
              setCategoryId('');
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Income'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Income
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('Transfer');
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Transfer'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Transfer
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Transfer check: user needs at least 2 active accounts */}
        {activeTab === 'Transfer' && activeAccounts.length < 2 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-xs text-amber-900 space-y-2">
            <p className="font-semibold">At least 2 active accounts are required to transfer money.</p>
            <p className="text-amber-700">
              You currently have {activeAccounts.length} active account. Please create another active account first.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {activeTab === 'Transfer' ? 'Source Account' : 'Account'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select active account...</option>
                {activeAccounts.map((acc) => (
                  <option key={acc.account_id} value={acc.account_id}>
                    {acc.account_name} (Avail: ₱{acc.calculated_balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Account (Transfer only) */}
            {activeTab === 'Transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Destination Account <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select destination account...</option>
                  {activeAccounts
                    .filter((acc) => acc.account_id !== accountId)
                    .map((acc) => (
                      <option key={acc.account_id} value={acc.account_id}>
                        {acc.account_name} (Current: ₱{acc.calculated_balance.toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Category Selector (Income & Expense only) */}
            {activeTab !== 'Transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select {activeTab.toLowerCase()} category...</option>
                  {currentCategories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount and Transfer Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Amount (PHP ₱) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {activeTab === 'Transfer' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Transfer Fee (PHP ₱)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={transferFee}
                      onChange={(e) => setTransferFee(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Deducted from source account</p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Transaction Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    max={todayStr}
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Date for Transfer tab */}
            {activeTab === 'Transfer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Transaction Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  max={todayStr}
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description (Optional, max 255 chars)
              </label>
              <input
                type="text"
                maxLength={255}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch with team, Freelance payment"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Record {activeTab}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
