import { Button } from '@/components/ui/Button';
import { TrendingUp, TrendingDown, ArrowLeftRight, PlusCircle } from 'lucide-react';

interface QuickActionsWidgetProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onTransfer: () => void;
  onAddAccount: () => void;
}

export function QuickActionsWidget({
  onAddIncome,
  onAddExpense,
  onTransfer,
  onAddAccount,
}: QuickActionsWidgetProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        variant="primary"
        size="sm"
        onClick={onAddIncome}
        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
      >
        <TrendingUp className="h-4 w-4 mr-1.5" />
        Add Income
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onAddExpense}
        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
      >
        <TrendingDown className="h-4 w-4 mr-1.5 text-rose-600" />
        Add Expense
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onTransfer}
        className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
      >
        <ArrowLeftRight className="h-4 w-4 mr-1.5 text-amber-600" />
        Transfer Money
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddAccount}
        className="border-slate-200 text-slate-700 hover:bg-slate-50"
      >
        <PlusCircle className="h-4 w-4 mr-1.5 text-slate-500" />
        New Account
      </Button>
    </div>
  );
}
