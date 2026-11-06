import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import type { AccountActivityItem } from '../types/report.types';
import { Wallet } from 'lucide-react';

interface AccountActivityTableProps {
  activity: AccountActivityItem[];
  isLoading: boolean;
}

export function AccountActivityTable({ activity, isLoading }: AccountActivityTableProps) {
  return (
    <Card
      title="Account Flow & Activity Summary"
      subtitle="Total inflows, outflows, transfer fees, and net change per account"
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Calculating account activity...
        </div>
      ) : activity.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
          <Wallet className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">No account activity recorded</p>
          <p className="text-xs text-slate-400 mt-1">
            Accounts with transaction flows in this period will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
              <tr>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3 text-right">Inflows (+)</th>
                <th className="px-5 py-3 text-right">Outflows (−)</th>
                <th className="px-5 py-3 text-right">Transfer Fees</th>
                <th className="px-5 py-3 text-right">Net Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activity.map((acc) => {
                const isNetPositive = acc.netChange >= 0;
                return (
                  <tr key={acc.accountId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {acc.accountName}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-blue-700">
                      +{formatCurrency(acc.totalInflow)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-rose-700">
                      −{formatCurrency(acc.totalOutflow)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-amber-700">
                      {acc.totalFees > 0 ? `−${formatCurrency(acc.totalFees)}` : '₱0.00'}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-bold ${
                        isNetPositive ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isNetPositive ? '+' : ''}
                      {formatCurrency(acc.netChange)}
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
