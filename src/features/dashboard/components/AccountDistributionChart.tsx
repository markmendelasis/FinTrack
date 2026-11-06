import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import type { AccountBalanceShare } from '../types/dashboard.types';
import type { AccountWithBalance } from '@/features/accounts/types/account.types';
import { Wallet } from 'lucide-react';

interface AccountDistributionChartProps {
  shares: AccountBalanceShare[];
  accounts: AccountWithBalance[];
  isLoading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AccountBalanceShare;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <p className="font-semibold text-slate-800">{item.account_name}</p>
      </div>
      <p className="text-slate-900 font-bold">{formatCurrency(item.balance)}</p>
      <p className="text-slate-500 mt-0.5">{item.percentage}% of active funds</p>
    </div>
  );
}

export function AccountDistributionChart({
  shares,
  accounts,
  isLoading,
}: AccountDistributionChartProps) {
  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE');
  const totalActiveBalance = activeAccounts.reduce(
    (sum, a) => sum + a.calculated_balance,
    0
  );
  const hasPositiveBalance = shares.length > 0;

  return (
    <Card
      title="Account Allocation"
      subtitle="Distribution of funds across active accounts"
    >
      {isLoading ? (
        <div className="h-72 flex items-center justify-center text-sm text-slate-400">
          Loading account distribution...
        </div>
      ) : activeAccounts.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <Wallet className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">No active accounts</p>
          <p className="text-xs text-slate-400 mt-1">
            Create an account to start tracking balances.
          </p>
        </div>
      ) : !hasPositiveBalance ? (
        <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <Wallet className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">All account balances are ₱0.00</p>
          <p className="text-xs text-slate-400 mt-1">
            Deposit income or set initial balances to see allocation percentages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Donut Chart */}
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shares}
                  dataKey="balance"
                  nameKey="account_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {shares.map((entry) => (
                    <Cell key={entry.account_id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Active Total
              </span>
              <span className="text-sm font-bold text-slate-800">
                {formatCurrency(totalActiveBalance)}
              </span>
            </div>
          </div>

          {/* Account List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 text-xs">
            {shares.map((item) => (
              <div
                key={item.account_id}
                className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700 truncate">
                      {item.account_name}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 shrink-0">
                    {formatCurrency(item.balance)}
                  </span>
                </div>
                {/* Visual percentage progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {item.percentage}% of active funds
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
