import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Download, Printer, Filter } from 'lucide-react';
import type { DatePreset, ReportFilterState } from '../types/report.types';
import type { AccountWithBalance } from '@/features/accounts/types/account.types';
import type { TransactionType } from '@/features/transactions/types/transaction.types';

interface ReportFiltersProps {
  filters: ReportFilterState;
  accounts: AccountWithBalance[];
  transactionTypes: TransactionType[];
  onPresetChange: (preset: DatePreset) => void;
  onCustomDateChange: (start: string, end: string) => void;
  onAccountChange: (accountId?: string) => void;
  onTypeChange: (typeId?: string) => void;
  onExportCSV: () => void;
  onPrint: () => void;
}

const PRESET_OPTIONS: { id: DatePreset; label: string }[] = [
  { id: 'THIS_MONTH', label: 'This Month' },
  { id: 'LAST_MONTH', label: 'Last Month' },
  { id: 'THIS_YEAR', label: 'This Year' },
  { id: 'ALL_TIME', label: 'All Time' },
  { id: 'CUSTOM', label: 'Custom Range' },
];

export function ReportFilters({
  filters,
  accounts,
  transactionTypes,
  onPresetChange,
  onCustomDateChange,
  onAccountChange,
  onTypeChange,
  onExportCSV,
  onPrint,
}: ReportFiltersProps) {
  return (
    <Card className="no-print">
      <div className="space-y-4">
        {/* Top: Presets & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPresetChange(opt.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filters.preset === opt.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <Printer className="h-4 w-4 mr-1.5 text-slate-600" />
              Print / Save PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onExportCSV}
              className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            >
              <Download className="h-4 w-4 mr-1.5 text-emerald-700" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Bottom Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Start Date */}
          <div>
            <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onCustomDateChange(e.target.value, filters.endDate)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onCustomDateChange(filters.startDate, e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Account Filter */}
          <div>
            <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              Filter by Account
            </label>
            <select
              value={filters.accountId || ''}
              onChange={(e) => onAccountChange(e.target.value || undefined)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.account_id} value={a.account_id}>
                  {a.account_name} ({a.status})
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              Transaction Type
            </label>
            <select
              value={filters.transactionTypeId || ''}
              onChange={(e) => onTypeChange(e.target.value || undefined)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Types (Income, Expense, Transfer)</option>
              {transactionTypes.map((tt) => (
                <option key={tt.transaction_type_id} value={tt.transaction_type_id}>
                  {tt.type_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
}
