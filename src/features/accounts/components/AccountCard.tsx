import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatters';
import type { AccountWithBalance } from '../types/account.types';
import {
  Wallet,
  Lock,
  History,
  PowerOff,
  Power,
  Edit3,
} from 'lucide-react';

interface AccountCardProps {
  account: AccountWithBalance;
  activeAccountsCount: number;
  onEditInitialBalance: (account: AccountWithBalance) => void;
  onDeactivate: (account: AccountWithBalance) => void;
  onReactivate: (account: AccountWithBalance) => void;
  onViewAuditLogs: (account: AccountWithBalance) => void;
}

export function AccountCard({
  account,
  activeAccountsCount,
  onEditInitialBalance,
  onDeactivate,
  onReactivate,
  onViewAuditLogs,
}: AccountCardProps) {
  const isActive = account.status === 'ACTIVE';
  const isDefaultCashWallet = account.account_name.toLowerCase() === 'cash wallet';
  const isZeroBalance = account.calculated_balance === 0;
  const isLastActive = isActive && activeAccountsCount <= 1;

  // Deactivation is permitted ONLY if balance is exactly 0.00 and not the last active account
  const canDeactivate = isActive && isZeroBalance && !isLastActive;

  return (
    <Card
      className={`relative transition-all hover:shadow-md ${
        isActive ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-amber-500 bg-slate-50/60 opacity-90'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-2.5 ${
              isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
            }`}
          >
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {account.account_name}
              </h3>
              {isDefaultCashWallet && (
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  Default
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {account.status}
              </span>
              <span className="text-xs text-slate-400">
                Opening: {formatCurrency(Number(account.initial_balance))}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onViewAuditLogs(account)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="View account audit history"
          aria-label="View account audit history"
        >
          <History className="h-4 w-4" />
        </button>
      </div>

      {/* Balance Section */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-baseline justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Calculated Balance
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {formatCurrency(account.calculated_balance)}
          </p>
        </div>

        {/* Initial balance locking indicator */}
        {account.has_transactions && (
          <div
            className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded"
            title="Initial balance is locked because this account has transaction history"
          >
            <Lock className="h-3 w-3" />
            <span>Locked</span>
          </div>
        )}
      </div>

      {/* Account Actions Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Edit initial balance (available only before any transactions exist) */}
        {!account.has_transactions ? (
          <button
            type="button"
            onClick={() => onEditInitialBalance(account)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Opening
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 italic">History Active</span>
        )}

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {isActive ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={!canDeactivate}
              onClick={() => onDeactivate(account)}
              title={
                isLastActive
                  ? 'Cannot deactivate your last active account'
                  : !isZeroBalance
                  ? 'Account balance must be ₱0.00 to deactivate'
                  : 'Deactivate account'
              }
              className={`text-xs ${
                canDeactivate
                  ? 'text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <PowerOff className="h-3.5 w-3.5 mr-1" />
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReactivate(account)}
              className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <Power className="h-3.5 w-3.5 mr-1" />
              Reactivate
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
