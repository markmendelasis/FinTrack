import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatters';
import type { MonthlyCashFlowPoint } from '../types/dashboard.types';

interface IncomeExpenseChartProps {
  data: MonthlyCashFlowPoint[];
  isLoading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs">
      <p className="font-semibold text-slate-800 mb-1.5">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name}:
          </span>
          <span className="font-medium text-slate-900">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function IncomeExpenseChart({ data, isLoading }: IncomeExpenseChartProps) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <Card
      title="Income vs. Expense Trend"
      subtitle="Monthly cash flow comparison over the last 6 months"
    >
      {isLoading ? (
        <div className="h-72 flex items-center justify-center text-sm text-slate-400">
          Loading chart data...
        </div>
      ) : !hasData ? (
        <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <p className="text-sm font-medium text-slate-600">No transaction data yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Recorded income and expense transactions will appear here by month.
          </p>
        </div>
      ) : (
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value >= 1000 ? `₱${(value / 1000).toFixed(0)}k` : `₱${value}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar
                name="Income"
                dataKey="income"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                name="Expense"
                dataKey="expense"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
