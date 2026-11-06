import { TrendingUp, TrendingDown, ArrowLeftRight, Edit2, Trash2, History, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { TransactionWithDetails } from '../types/transaction.types';

interface TransactionCardProps {
  transaction: TransactionWithDetails;
  onEdit: (transaction: TransactionWithDetails) => void;
  onDelete: (transaction: TransactionWithDetails) => void;
  onViewAudit: (transaction: TransactionWithDetails) => void;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  onViewAudit,
}: TransactionCardProps) {
  const isIncome = transaction.type_name === 'Income';
  const isExpense = transaction.type_name === 'Expense';
  const isTransfer = transaction.type_name === 'Transfer';
  const isDeleted = transaction.status === 'N';

  const getTypeStyle = () => {
    if (isIncome) {
      return {
        bg: 'bg-emerald-100 text-emerald-700',
        amountColor: 'text-emerald-600',
        prefix: '+',
        icon: TrendingUp,
      };
    }
    if (isExpense) {
      return {
        bg: 'bg-rose-100 text-rose-700',
        amountColor: 'text-rose-600',
        prefix: '-',
        icon: TrendingDown,
      };
    }
    return {
      bg: 'bg-blue-100 text-blue-700',
      amountColor: 'text-blue-600',
      prefix: '',
      icon: ArrowLeftRight,
    };
  };

  const style = getTypeStyle();
  const IconComponent = style.icon;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isDeleted
          ? 'bg-slate-50/80 border-slate-200 opacity-60'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left column: Type Icon, Category / Description, Account Details */}
        <div className="flex items-start gap-3.5">
          <div className={`rounded-xl p-2.5 shrink-0 ${style.bg}`}>
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {isTransfer
                  ? 'Transfer'
                  : transaction.category_name || transaction.type_name}
              </span>

              {isDeleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                  <AlertCircle className="h-3 w-3" />
                  Deleted
                </span>
              )}

              {transaction.transfer_fee > 0 && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                  Fee: {formatCurrency(transaction.transfer_fee)}
                </span>
              )}
            </div>

            {transaction.description && (
              <p className="text-xs text-slate-600 line-clamp-1">{transaction.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500 pt-0.5">
              <span>{formatDate(transaction.transaction_date)}</span>
              <span>&bull;</span>
              {isTransfer ? (
                <span className="font-medium text-slate-700">
                  {transaction.account_name} &rarr; {transaction.destination_account_name || 'Account'}
                </span>
              ) : (
                <span className="font-medium text-slate-700">{transaction.account_name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Amount & Action buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-left sm:text-right">
            <span
              className={`text-base sm:text-lg font-black tracking-tight ${
                isDeleted ? 'line-through text-slate-400' : style.amountColor
              }`}
            >
              {style.prefix}
              {formatCurrency(transaction.amount)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Edit (only available on active Income/Expense; Transfers are immutable per Section 7.6) */}
            {!isDeleted && !isTransfer && (
              <button
                type="button"
                onClick={() => onEdit(transaction)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Edit transaction"
                aria-label="Edit transaction"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}

            {/* Soft Delete */}
            {!isDeleted && (
              <button
                type="button"
                onClick={() => onDelete(transaction)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Delete transaction and reverse balance"
                aria-label="Delete transaction"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {/* View Audit Trail */}
            <button
              type="button"
              onClick={() => onViewAudit(transaction)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="View transaction audit log"
              aria-label="View transaction audit log"
            >
              <History className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
