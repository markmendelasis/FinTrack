import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import type { CategorySummaryItem } from '../types/report.types';
import { PieChart } from 'lucide-react';

interface CategoryReportTableProps {
  categories: CategorySummaryItem[];
  isLoading: boolean;
}

export function CategoryReportTable({ categories, isLoading }: CategoryReportTableProps) {
  const expenseCategories = categories.filter((c) => c.typeName === 'Expense');
  const incomeCategories = categories.filter((c) => c.typeName === 'Income');

  return (
    <Card
      title="Category Spending & Inflow Analysis"
      subtitle="Breakdown of transactions by category for the selected date range"
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Calculating category aggregations...
        </div>
      ) : categories.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
          <PieChart className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">No categorized transactions</p>
          <p className="text-xs text-slate-400 mt-1">
            Categorized income and expenses for this period will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-3 flex items-center justify-between">
              <span>Expense Categories</span>
              <span className="font-normal text-slate-400 lowercase">
                {expenseCategories.length} categories
              </span>
            </h4>
            {expenseCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No expenses in this period</p>
            ) : (
              <div className="space-y-2.5">
                {expenseCategories.map((item) => (
                  <div
                    key={item.categoryName}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {item.categoryName}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-rose-800">
                          {formatCurrency(item.totalAmount)}
                        </span>
                        <span className="text-slate-400 ml-1.5 font-normal">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.transactionCount} transaction{item.transactionCount === 1 ? '' : 's'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Income Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-3 flex items-center justify-between">
              <span>Income Categories</span>
              <span className="font-normal text-slate-400 lowercase">
                {incomeCategories.length} categories
              </span>
            </h4>
            {incomeCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No income in this period</p>
            ) : (
              <div className="space-y-2.5">
                {incomeCategories.map((item) => (
                  <div
                    key={item.categoryName}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {item.categoryName}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-blue-800">
                          {formatCurrency(item.totalAmount)}
                        </span>
                        <span className="text-slate-400 ml-1.5 font-normal">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.transactionCount} transaction{item.transactionCount === 1 ? '' : 's'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
