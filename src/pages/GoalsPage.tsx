import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Target, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export function GoalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Savings Goals</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Set and achieve financial milestones, emergency funds, and long-term targets.
        </p>
      </div>

      <Card>
        <div className="py-10 px-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 mb-4 shadow-xs">
            <Target className="h-7 w-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            Feature Preview &bull; Coming Soon
          </div>
          <h3 className="text-lg font-bold text-slate-900">Target Savings is Coming Soon</h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Automate your path to financial freedom. You will be able to set savings targets, assign them to specific accounts, and track your milestone progress over time.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs mb-1">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                Target Milestones
              </div>
              <p className="text-[11px] text-slate-500">
                Create goals for Emergency Fund, Major Purchases, Travel, or Investment with target dates.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs mb-1">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                Progress Tracking
              </div>
              <p className="text-[11px] text-slate-500">
                Visual progress bars and milestone achievements celebrated as your balances grow.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-3">
            <Link
              to="/accounts"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              View Your Financial Accounts <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
