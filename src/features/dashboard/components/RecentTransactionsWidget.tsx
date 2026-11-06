import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { TransactionWithDetails } from '@/features/transactions/types/transaction.types';
import { TrendingUp, TrendingDown, ArrowLeftRight, ArrowRight, ReceiptText } from 'lucide-react';

interface RecentTransactionsWidgetProps {
  transactions: TransactionWithDetails[];
  isLoading: boolean;
}

export function RecentTransactionsWidget({
  transactions,
  isLoading,
}: RecentTransactionsWidgetProps) {
  return (
    <Card
      title="Recent Transactions"
      subtitle="Latest financial activity"
      action={
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Loading recent transactions...
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
          <ReceiptText className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">No transactions recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Your recent income, expenses, and transfers will show up here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const isIncome = tx.type_name === 'Income';
            const isExpense = tx.type_name === 'Expense';
            const isTransfer = tx.type_name === 'Transfer';

            return (
              <div
                key={tx.transaction_id}
                className="py-3 flex items-center justify-between gap-3 text-sm hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors"
              >
                {/* Type Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`rounded-lg p-2 shrink-0 ${
                      isIncome
                        ? 'bg-blue-100 text-blue-700'
                        : isExpense
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isIncome && <TrendingUp className="h-4 w-4" />}
                    {isExpense && <TrendingDown className="h-4 w-4" />}
                    {isTransfer && <ArrowLeftRight className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-xs sm:text-sm">
                      {isTransfer
                        ? `Transfer: ${tx.account_name} → ${
                            tx.destination_account_name || 'Destination'
                          }`
                        : tx.category_name ||
                          tx.description ||
                          'Transaction'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(tx.transaction_date)} •{' '}
                      <span className="font-medium text-slate-600">
                        {tx.account_name}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p
                    className={`font-bold text-xs sm:text-sm ${
                      isIncome
                        ? 'text-blue-700'
                        : isExpense
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </p>
                  {isTransfer && tx.transfer_fee > 0 && (
                    <p className="text-[10px] text-slate-400">
                      Fee: {formatCurrency(tx.transfer_fee)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
