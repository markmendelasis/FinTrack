import { Card } from '@/components/ui/Card';
import { FileText, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Reports</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Export and analyze income, expense, and transfer fee summaries.
          </p>
        </div>
        <Button variant="outline" size="md" disabled>
          <Download className="h-4 w-4 mr-1.5" />
          Export PDF
        </Button>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs sm:text-sm text-blue-900 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Milestone 8 Scope</p>
          <p className="text-blue-700 mt-0.5">
            Detailed reports, date filtering, category breakdowns, and client-side PDF export will be finalized in Milestone 8 after transaction features are operational.
          </p>
        </div>
      </div>

      <Card>
        <div className="py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Reports Module Ready for Data</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Historical transaction summaries, monthly aggregates, and PDF downloads will be generated here.
          </p>
        </div>
      </Card>
    </div>
  );
};
