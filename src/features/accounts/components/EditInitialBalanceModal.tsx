import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Edit3, AlertCircle } from 'lucide-react';
import { formatErrorMessage } from '@/lib/utils/formatters';
import type { AccountWithBalance, UpdateInitialBalanceInput } from '../types/account.types';

interface EditInitialBalanceModalProps {
  account: AccountWithBalance | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: UpdateInitialBalanceInput) => Promise<void>;
}

export function EditInitialBalanceModal({
  account,
  isOpen,
  onClose,
  onSubmit,
}: EditInitialBalanceModalProps) {
  const [balance, setBalance] = useState('0.00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setBalance(String(account.initial_balance));
      setError(null);
    }
  }, [account]);

  if (!isOpen || !account) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericBalance = Number(balance);
    if (isNaN(numericBalance) || numericBalance < 0) {
      setError('Initial balance must be a valid non-negative number');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        account_id: account.account_id,
        new_initial_balance: numericBalance,
      });
      onClose();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Initial balance could not be updated');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
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
            <Edit3 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit Opening Balance</h3>
            <p className="text-xs text-slate-500">
              Account: <span className="font-semibold text-slate-700">{account.account_name}</span>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Opening Balance (PHP ₱)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">₱</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Per Section 7.1 rules, once this account has transaction records, its opening balance is permanently locked.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Save Balance
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
