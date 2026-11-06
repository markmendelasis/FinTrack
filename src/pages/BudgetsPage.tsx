import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { PieChart, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Budgets & Limits</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Set monthly category spending targets and monitor your financial discipline.
        </p>
      </div>

      <Card>
        <div className="py-10 px-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-xs">
            <PieChart className="h-7 w-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Feature Preview &bull; Coming Soon
          </div>
          <h3 className="text-lg font-bold text-slate-900">Smart Budget Tracking is on the Way</h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            We are fine-tuning intelligent budget allocations that connect seamlessly with your transactions, giving you real-time visibility into your monthly category spending.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Category Spending Caps
              </div>
              <p className="text-[11px] text-slate-500">
                Define monthly caps for Food & Dining, Transportation, Utilities, and other categories.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Live Overspend Alerts
              </div>
              <p className="text-[11px] text-slate-500">
                Receive proactive warnings when spending approaches 80% and 100% of your limit.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-3">
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View Recent Transactions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
