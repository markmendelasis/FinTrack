import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Edit2, AlertCircle, Lock } from 'lucide-react';
import { formatDate, formatErrorMessage } from '@/lib/utils/formatters';
import type {
  TransactionWithDetails,
  TransactionType,
  Category,
  EditTransactionInput,
} from '../types/transaction.types';
import type { AccountWithBalance } from '@/features/accounts/types/account.types';

interface EditTransactionModalProps {
  transaction: TransactionWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  transactionTypes: TransactionType[];
  categories: Category[];
  accounts: AccountWithBalance[];
  onSave: (input: EditTransactionInput) => Promise<void>;
}

export function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
  transactionTypes,
  categories,
  accounts,
  onSave,
}: EditTransactionModalProps) {
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Income and Expense types only (Transfer is prohibited from editing per Section 7.10)
  const allowedTypes = transactionTypes.filter((t) => t.type_name !== 'Transfer');

  useEffect(() => {
    if (transaction) {
      setSelectedTypeId(transaction.transaction_type_id);
      setAccountId(transaction.account_id);
      setCategoryId(transaction.category_id || '');
      setAmount(String(transaction.amount));
      setDescription(transaction.description || '');
      setError(null);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  // Filter categories matching the currently selected type
  const matchingCategories = categories.filter(
    (c) => c.transaction_type_id === selectedTypeId && c.status === 'ACTIVE'
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    if (!accountId) {
      setError('Please select an account');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        transaction_id: transaction.transaction_id,
        new_account_id: accountId,
        new_category_id: categoryId,
        new_transaction_type_id: selectedTypeId,
        new_amount: numericAmount,
        new_description: description.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Transaction was not successfully updated');
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

        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
            <Edit2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit Transaction</h3>
            <p className="text-xs text-slate-500">
              Income & Expense reversal and re-application validation
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector: Income or Expense only */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Transaction Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {allowedTypes.map((t) => (
                <button
                  key={t.transaction_type_id}
                  type="button"
                  onClick={() => {
                    setSelectedTypeId(t.transaction_type_id);
                    setCategoryId(''); // reset category on type change
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    selectedTypeId === t.transaction_type_id
                      ? t.type_name === 'Income'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.type_name}
                </button>
              ))}
            </div>
          </div>

          {/* Account Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Account <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select account...</option>
              {accounts.map((acc) => (
                <option key={acc.account_id} value={acc.account_id}>
                  {acc.account_name} ({acc.status}) &bull; Current: ₱{acc.calculated_balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
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
              <option value="">Select category...</option>
              {matchingCategories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
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

          {/* Transaction Date (Locked per Section 7.8) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Transaction Date</span>
              <span className="text-[10px] text-slate-400 font-normal inline-flex items-center gap-1">
                <Lock className="h-3 w-3" /> Original Date Locked
              </span>
            </label>
            <input
              type="text"
              disabled
              value={formatDate(transaction.transaction_date)}
              className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
            />
          </div>

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
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
