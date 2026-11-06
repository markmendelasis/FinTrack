import type { AccountFilter } from '../types/account.types';

interface AccountFilterTabsProps {
  currentFilter: AccountFilter;
  onFilterChange: (filter: AccountFilter) => void;
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
}

export function AccountFilterTabs({
  currentFilter,
  onFilterChange,
  counts,
}: AccountFilterTabsProps) {
  const tabs: { key: AccountFilter; label: string; count: number }[] = [
    { key: 'ALL', label: 'All Accounts', count: counts.all },
    { key: 'ACTIVE', label: 'Active', count: counts.active },
    { key: 'INACTIVE', label: 'Inactive', count: counts.inactive },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit">
      {tabs.map((tab) => {
        const isSelected = currentFilter === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onFilterChange(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isSelected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-300/70 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
