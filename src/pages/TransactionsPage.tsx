import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeftRight, Plus, Info } from 'lucide-react';

export function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transactions</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Record Income, Expense, and Transfers between accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4 mr-1.5" />
            New Transaction
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs sm:text-sm text-blue-900 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Milestone 5 Feature Preview</p>
          <p className="text-blue-700 mt-0.5">
            Full transaction creation, server-side pagination, Income/Expense reversal editing, transfer fee reporting, and soft-deletion will be wired to PostgreSQL RPC functions in Milestone 5.
          </p>
        </div>
      </div>

      <Card>
        <div className="py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No transactions recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Once database migrations and authentication are active, your transaction activity will appear here.
          </p>
        </div>
      </Card>
    </div>
  );
};
