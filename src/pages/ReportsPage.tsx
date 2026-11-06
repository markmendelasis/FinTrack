import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { useReports } from '@/features/reports/hooks/useReports';
import { ReportFilters } from '@/features/reports/components/ReportFilters';
import { ReportSummaryCards } from '@/features/reports/components/ReportSummaryCards';
import { CategoryReportTable } from '@/features/reports/components/CategoryReportTable';
import { AccountActivityTable } from '@/features/reports/components/AccountActivityTable';
import { ReportTransactionTable } from '@/features/reports/components/ReportTransactionTable';
import { PrintableReportView } from '@/features/reports/components/PrintableReportView';
import { formatDate } from '@/lib/utils/formatters';
import { FileText, ShieldCheck } from 'lucide-react';

export function ReportsPage() {
  const { user, profile } = useAuth();
  const { accounts } = useAccounts();
  const { transactionTypes } = useTransactions();
  const {
    filters,
    reportData,
    isLoading,
    setPreset,
    setCustomDateRange,
    setAccountId,
    setTransactionTypeId,
    handleExportCSV,
    handlePrint,
  } = useReports();

  const displayName = profile?.user_name || user?.user_metadata?.user_name || 'FinTrack User';

  return (
    <div className="space-y-6">
      {/* Printable Statement for PDF Generation */}
      {reportData && (
        <PrintableReportView
          report={reportData}
          filters={filters}
          userName={displayName}
        />
      )}

      {/* Screen View */}
      <div className="no-print space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Live Financial Data
              </span>
              <span className="text-xs text-slate-400">
                {formatDate(filters.startDate)} — {formatDate(filters.endDate)}
              </span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Financial Reports & Analysis
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Generate income and expense summaries, account activity reports, and export to CSV or PDF.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <ReportFilters
          filters={filters}
          accounts={accounts}
          transactionTypes={transactionTypes}
          onPresetChange={setPreset}
          onCustomDateChange={setCustomDateRange}
          onAccountChange={setAccountId}
          onTypeChange={setTransactionTypeId}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
        />

        {/* Summary Cards */}
        {reportData && (
          <ReportSummaryCards summary={reportData.summary} isLoading={isLoading} />
        )}

        {/* Category Breakdown Table */}
        {reportData && (
          <CategoryReportTable
            categories={reportData.categoryBreakdown}
            isLoading={isLoading}
          />
        )}

        {/* Account Flow & Activity Table */}
        {reportData && (
          <AccountActivityTable
            activity={reportData.accountActivity}
            isLoading={isLoading}
          />
        )}

        {/* Itemized Transactions Table */}
        {reportData && (
          <ReportTransactionTable
            transactions={reportData.transactions}
            isLoading={isLoading}
          />
        )}

        {/* Empty / Initial State if no report data yet */}
        {!reportData && !isLoading && (
          <div className="py-16 text-center text-slate-400">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No report data generated</p>
            <p className="text-xs text-slate-400 mt-1">
              Select a date range above to load financial reporting figures.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
