import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, Plus, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

export function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Accounts</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your cash wallets, bank accounts, and e-wallets.
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Account
        </Button>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs sm:text-sm text-blue-900 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Milestone 4 Feature Preview</p>
          <p className="text-blue-700 mt-0.5">
            Full account management (including default Cash Wallet creation, zero-balance deactivation, and initial balance locking after first transaction) will be connected during Milestone 4 after database implementation.
          </p>
        </div>
      </div>

      {/* Account Card Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Cash Wallet</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  ACTIVE (Default)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs text-slate-500">Calculated Balance</span>
            <span className="text-lg font-bold text-slate-900">{formatCurrency(0.00)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
