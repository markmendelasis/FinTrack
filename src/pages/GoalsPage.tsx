import { Card } from '@/components/ui/Card';
import { Target, Clock } from 'lucide-react';

export function GoalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Savings Goals</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Planned financial goals module.
        </p>
      </div>

      <Card>
        <div className="py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-3">
            <Target className="h-6 w-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 mb-3">
            <Clock className="h-3.5 w-3.5" />
            Milestone 7 — Design Pending
          </div>
          <h3 className="text-base font-semibold text-slate-900">Savings Goals Feature is Planned</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            As outlined in <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">PROJECT_OVERVIEW.md</code> (Section 5.6) and Master Instructions, detailed requirements, business rules, and database schema for Savings Goals are pending design review and will be implemented only after explicit approval.
          </p>
        </div>
      </Card>
    </div>
  );
};
