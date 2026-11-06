import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate, formatErrorMessage } from '@/lib/utils/formatters';
import type { TransactionWithDetails } from '../types/transaction.types';

interface DeleteTransactionDialogProps {
  transaction: TransactionWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactionId: string) => Promise<void>;
}

export function DeleteTransactionDialog({
  transaction,
  isOpen,
  onClose,
  onConfirm,
}: DeleteTransactionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await onConfirm(transaction.transaction_id);
      onClose();
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Transaction could not be deleted');
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getReversalExplanation = () => {
    if (transaction.type_name === 'Income') {
      return `This will deduct ${formatCurrency(transaction.amount)} from "${transaction.account_name}".`;
    }
    if (transaction.type_name === 'Expense') {
      return `This will restore ${formatCurrency(transaction.amount)} back to "${transaction.account_name}".`;
    }
    const totalSourceRestore = transaction.amount + transaction.transfer_fee;
    return `This will restore ${formatCurrency(totalSourceRestore)} (including fee) to "${transaction.account_name}" and deduct ${formatCurrency(transaction.amount)} from "${transaction.destination_account_name}".`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-rose-100 p-2.5 text-rose-700">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delete Transaction</h3>
            <p className="text-xs text-slate-500">Soft-delete with automatic balance reversal</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-1.5 mb-4">
          <div className="flex justify-between font-semibold text-slate-800">
            <span>{transaction.type_name}: {transaction.category_name || transaction.type_name}</span>
            <span className="font-bold">{formatCurrency(transaction.amount)}</span>
          </div>
          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Account: {transaction.account_name}</span>
            <span>Date: {formatDate(transaction.transaction_date)}</span>
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-900 space-y-1 mb-5">
          <p className="font-semibold">Reversal Effect (Section 7.11):</p>
          <p className="text-amber-800 leading-relaxed">{getReversalExplanation()}</p>
          <p className="text-[11px] text-amber-700 font-medium pt-1">
            If this reversal would cause any account balance to become negative, PostgreSQL will reject the deletion and leave your records unchanged.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" size="md" onClick={handleDelete} isLoading={isDeleting}>
            Confirm Deletion
          </Button>
        </div>
      </div>
    </div>
  );
}
