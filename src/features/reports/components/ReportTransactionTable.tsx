import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { TransactionWithDetails } from '@/features/transactions/types/transaction.types';
import { TrendingUp, TrendingDown, ArrowLeftRight, FileText } from 'lucide-react';

interface ReportTransactionTableProps {
  transactions: TransactionWithDetails[];
  isLoading: boolean;
}

export function ReportTransactionTable({ transactions, isLoading }: ReportTransactionTableProps) {
  return (
    <Card
      title="Itemized Transaction History"
      subtitle={`${transactions.length} transactions included in this report`}
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Loading report transactions...
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
          <FileText className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">No transactions found</p>
          <p className="text-xs text-slate-400 mt-1">
            No active transactions match your current date and filter selections.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Category / Details</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((tx) => {
                const isIncome = tx.type_name === 'Income';
                const isExpense = tx.type_name === 'Expense';
                const isTransfer = tx.type_name === 'Transfer';

                return (
                  <tr key={tx.transaction_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {formatDate(tx.transaction_date)}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          isIncome
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : isExpense
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isIncome && <TrendingUp className="h-3 w-3" />}
                        {isExpense && <TrendingDown className="h-3 w-3" />}
                        {isTransfer && <ArrowLeftRight className="h-3 w-3" />}
                        {tx.type_name}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {isTransfer
                        ? `Transfer to ${tx.destination_account_name || 'Destination'}`
                        : tx.category_name || 'Uncategorized'}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-600">
                      {tx.account_name}
                    </td>
                    <td className="px-5 py-3 text-slate-500 max-w-xs truncate">
                      {tx.description || '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-bold whitespace-nowrap">
                      <span
                        className={
                          isIncome
                            ? 'text-blue-700'
                            : isExpense
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                      {isTransfer && tx.transfer_fee > 0 && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Fee: {formatCurrency(tx.transfer_fee)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
