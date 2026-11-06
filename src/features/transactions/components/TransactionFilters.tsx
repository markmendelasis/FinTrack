import { Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { TransactionFilterParams, TransactionType, Category } from '../types/transaction.types';
import type { AccountWithBalance } from '@/features/accounts/types/account.types';

interface TransactionFiltersProps {
  filters: TransactionFilterParams;
  onFilterChange: (filters: TransactionFilterParams) => void;
  transactionTypes: TransactionType[];
  categories: Category[];
  accounts: AccountWithBalance[];
}

export function TransactionFilters({
  filters,
  onFilterChange,
  transactionTypes,
  categories,
  accounts,
}: TransactionFiltersProps) {
  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filters, search: val, page: 1 });
  };

  const handleTypeChange = (val: string) => {
    onFilterChange({
      ...filters,
      typeId: val || undefined,
      categoryId: undefined, // reset category when type changes
      page: 1,
    });
  };

  const handleAccountChange = (val: string) => {
    onFilterChange({ ...filters, accountId: val || undefined, page: 1 });
  };

  const handleCategoryChange = (val: string) => {
    onFilterChange({ ...filters, categoryId: val || undefined, page: 1 });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', val: string) => {
    onFilterChange({ ...filters, [field]: val || undefined, page: 1 });
  };

  const handleReset = () => {
    onFilterChange({
      page: 1,
      pageSize: 20,
      status: 'Y',
      typeId: undefined,
      accountId: undefined,
      categoryId: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
    });
  };

  const filteredCategories = filters.typeId
    ? categories.filter((c) => c.transaction_type_id === filters.typeId)
    : categories;

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.typeId ||
      filters.accountId ||
      filters.categoryId ||
      filters.startDate ||
      filters.endDate
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search descriptions..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Transaction Type Filter */}
        <div>
          <select
            value={filters.typeId || ''}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          >
            <option value="">All Types (Income, Expense, Transfer)</option>
            {transactionTypes.map((t) => (
              <option key={t.transaction_type_id} value={t.transaction_type_id}>
                {t.type_name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Filter */}
        <div>
          <select
            value={filters.accountId || ''}
            onChange={(e) => handleAccountChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                {a.account_name} ({a.status})
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          >
            <option value="">All Categories</option>
            {filteredCategories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range & Reset Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium inline-flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Date Range:
          </span>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 self-end sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
