import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { ReportData, ReportFilterState } from '../types/report.types';
import { Wallet } from 'lucide-react';

interface PrintableReportViewProps {
  report: ReportData;
  filters: ReportFilterState;
  userName: string;
}

export function PrintableReportView({ report, filters, userName }: PrintableReportViewProps) {
  const { summary } = report;
  const isNetPositive = summary.netSavings >= 0;

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-800 p-2 text-white">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">FinTrack</h1>
              <p className="text-xs text-slate-600">Personal Finance Management Statement</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Generated for: {userName}</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Period: {formatDate(filters.startDate)} — {formatDate(filters.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Financial Executive Summary */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
          Executive Financial Summary
        </h2>
        <div className="grid grid-cols-4 gap-4 p-4 border border-slate-300 rounded-lg text-xs bg-slate-50">
          <div>
            <p className="text-slate-500 uppercase font-semibold">Total Income</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              +{formatCurrency(summary.totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-slate-500 uppercase font-semibold">Total Expenses</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              −{formatCurrency(summary.totalExpense)}
            </p>
          </div>
          <div>
            <p className="text-slate-500 uppercase font-semibold">Transfer Fees</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              −{formatCurrency(summary.totalTransferFees)}
            </p>
          </div>
          <div>
            <p className="text-slate-500 uppercase font-semibold">Net Cash Flow</p>
            <p
              className={`text-base font-bold mt-1 ${
                isNetPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isNetPositive ? '+' : ''}
              {formatCurrency(summary.netSavings)}
            </p>
          </div>
        </div>
      </div>

      {/* Account Activity Section */}
      {report.accountActivity.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">
            Account Inflows & Outflows
          </h2>
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead className="bg-slate-100 font-semibold border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">Account</th>
                <th className="p-2 border-r border-slate-300 text-right">Inflows (+)</th>
                <th className="p-2 border-r border-slate-300 text-right">Outflows (−)</th>
                <th className="p-2 border-r border-slate-300 text-right">Fees</th>
                <th className="p-2 text-right">Net Change</th>
              </tr>
            </thead>
            <tbody>
              {report.accountActivity.map((acc) => (
                <tr key={acc.accountId} className="border-b border-slate-200">
                  <td className="p-2 border-r border-slate-200 font-medium">{acc.accountName}</td>
                  <td className="p-2 border-r border-slate-200 text-right">
                    +{formatCurrency(acc.totalInflow)}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right">
                    −{formatCurrency(acc.totalOutflow)}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right">
                    {acc.totalFees > 0 ? `−${formatCurrency(acc.totalFees)}` : '₱0.00'}
                  </td>
                  <td className="p-2 text-right font-bold">
                    {acc.netChange >= 0 ? '+' : ''}
                    {formatCurrency(acc.netChange)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Itemized Transactions Section */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">
          Itemized Transactions ({report.transactions.length})
        </h2>
        <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
          <thead className="bg-slate-100 font-semibold border-b border-slate-300">
            <tr>
              <th className="p-2 border-r border-slate-300">Date</th>
              <th className="p-2 border-r border-slate-300">Type</th>
              <th className="p-2 border-r border-slate-300">Category / Detail</th>
              <th className="p-2 border-r border-slate-300">Account</th>
              <th className="p-2 border-r border-slate-300">Description</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {report.transactions.map((tx) => (
              <tr key={tx.transaction_id} className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-200 whitespace-nowrap">
                  {tx.transaction_date}
                </td>
                <td className="p-2 border-r border-slate-200 font-medium">{tx.type_name}</td>
                <td className="p-2 border-r border-slate-200">
                  {tx.type_name === 'Transfer'
                    ? `Transfer to ${tx.destination_account_name || 'Destination'}`
                    : tx.category_name || '—'}
                </td>
                <td className="p-2 border-r border-slate-200">{tx.account_name}</td>
                <td className="p-2 border-r border-slate-200 truncate max-w-[200px]">
                  {tx.description || '—'}
                </td>
                <td className="p-2 text-right font-semibold whitespace-nowrap">
                  {tx.type_name === 'Income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                  {tx.type_name === 'Transfer' && tx.transfer_fee > 0 && (
                    <span className="block text-[10px] text-slate-500 font-normal">
                      Fee: {formatCurrency(tx.transfer_fee)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Statement */}
      <div className="mt-8 pt-4 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between">
        <p>FinTrack • Financial integrity guaranteed by PostgreSQL & Supabase</p>
        <p>Currency: Philippine Peso (₱) • Confidential</p>
      </div>
    </div>
  );
}
