import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import type { CategoryExpenseBreakdown } from '../types/dashboard.types';

interface ExpenseCategoryChartProps {
  data: CategoryExpenseBreakdown[];
  isLoading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryExpenseBreakdown;
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
        <p className="font-semibold text-slate-800">{item.category_name}</p>
      </div>
      <p className="text-slate-900 font-bold">{formatCurrency(item.total_amount)}</p>
      <p className="text-slate-500 mt-0.5">{item.percentage}% of total expenses</p>
    </div>
  );
}

export function ExpenseCategoryChart({ data, isLoading }: ExpenseCategoryChartProps) {
  const hasData = data.length > 0;
  const totalExpense = data.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <Card
      title="Expense by Category"
      subtitle="Breakdown of spending across predefined categories"
    >
      {isLoading ? (
        <div className="h-72 flex items-center justify-center text-sm text-slate-400">
          Loading category breakdown...
        </div>
      ) : !hasData ? (
        <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <p className="text-sm font-medium text-slate-600">No expenses recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Categorized expenses will be grouped here in an interactive breakdown.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Donut Chart */}
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total_amount"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {data.map((entry) => (
                    <Cell key={entry.category_name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Total
              </span>
              <span className="text-sm font-bold text-slate-800">
                {formatCurrency(totalExpense)}
              </span>
            </div>
          </div>

          {/* Category List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 text-xs">
            {data.map((item) => (
              <div
                key={item.category_name}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-700 truncate">
                    {item.category_name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(item.total_amount)}
                  </span>
                  <span className="ml-2 text-slate-400 font-normal">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
