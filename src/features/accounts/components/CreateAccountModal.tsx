import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Wallet, AlertCircle } from 'lucide-react';
import { formatErrorMessage } from '@/lib/utils/formatters';
import type { CreateAccountInput } from '../types/account.types';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateAccountInput) => Promise<void>;
}

export function CreateAccountModal({ isOpen, onClose, onSubmit }: CreateAccountModalProps) {
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('0.00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = accountName.trim();
    if (!trimmed) {
      setError('Please provide an account name');
      return;
    }

    const numericBalance = Number(initialBalance);
    if (isNaN(numericBalance) || numericBalance < 0) {
      setError('Initial balance must be a valid non-negative number');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        account_name: trimmed,
        initial_balance: numericBalance,
      });
      // Reset form on success
      setAccountName('');
      setInitialBalance('0.00');
      onClose();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Account was not successfully created');
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
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Financial Account</h3>
            <p className="text-xs text-slate-500">Bank accounts, e-wallets, or cash savings</p>
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
              Account Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. BDO Savings, Maya, Emergency Fund"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Account names cannot be renamed later per Section 7.1 rules.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Initial Balance (PHP ₱)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">₱</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Can be modified only before any transaction history exists.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
