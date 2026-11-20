import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { ReportData, ReportFilterState } from '../types/report.types';
import { ShieldCheck, Wallet } from 'lucide-react';

interface PrintableReportViewProps {
  report: ReportData;
  filters: ReportFilterState;
  userName: string;
  userEmail?: string;
}

export function PrintableReportView({
  report,
  filters,
  userName,
  userEmail,
}: PrintableReportViewProps) {
  const { summary, categoryBreakdown, accountActivity, transactions } = report;
  const isNetPositive = summary.netSavings >= 0;
  const issueDate = new Date();
  const statementRef = `FT-${issueDate.getFullYear()}${(issueDate.getMonth() + 1).toString().padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <div className="hidden print:block w-full bg-white text-slate-900 font-sans text-[11px] leading-relaxed">
      {/* Formal Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider uppercase text-slate-900">
                  FinTrack
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-300">
                  OFFICIAL STATEMENT
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                Personal Finance Management & Ledger System
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] space-y-0.5">
            <p className="font-mono text-slate-500">
              REF: <span className="font-bold text-slate-900">{statementRef}</span>
            </p>
            <p className="text-slate-600">
              Issue Date: <span className="font-semibold text-slate-900">{issueDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </p>
            <div className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Verified & Reconciled
            </div>
          </div>
        </div>
      </div>

      {/* Account Holder & Statement Scope Information Card */}
      <div className="mb-5 border border-slate-300 rounded-lg bg-slate-50/70 p-3.5">
        <div className="grid grid-cols-3 gap-4 text-[11px]">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Account Holder
            </p>
            <p className="font-bold text-slate-900 text-xs mt-0.5">{userName}</p>
            {userEmail && <p className="text-[10px] text-slate-600 font-mono mt-0.5">{userEmail}</p>}
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Statement Period
            </p>
            <p className="font-semibold text-slate-900 mt-0.5">
              {formatDate(filters.startDate)} — {formatDate(filters.endDate)}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Preset: <span className="font-medium text-slate-800">{filters.preset.replace('_', ' ')}</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Base Currency & Records
            </p>
            <p className="font-semibold text-slate-900 mt-0.5">Philippine Peso (PHP • ₱)</p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Total Transactions: <span className="font-bold text-slate-900">{transactions.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Financial Executive Summary Box */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
            1. Financial Performance Summary
          </h2>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
              isNetPositive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {isNetPositive ? 'NET SURPLUS' : 'NET DEFICIT'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 border border-slate-300 rounded-lg p-3 bg-white">
          <div className="border-r border-slate-200 pr-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Gross Income</p>
            <p className="text-sm font-bold text-emerald-700 font-mono mt-1">
              +{formatCurrency(summary.totalIncome)}
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">Total cash inflow</p>
          </div>

          <div className="border-r border-slate-200 pr-2 pl-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Gross Expenses</p>
            <p className="text-sm font-bold text-rose-700 font-mono mt-1">
              −{formatCurrency(summary.totalExpense)}
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">Total expenditures</p>
          </div>

          <div className="border-r border-slate-200 pr-2 pl-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Transfer Fees</p>
            <p className="text-sm font-bold text-slate-700 font-mono mt-1">
              −{formatCurrency(summary.totalTransferFees)}
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">Bank & gateway fees</p>
          </div>

          <div className="pl-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Net Cash Flow</p>
            <p
              className={`text-sm font-black font-mono mt-1 ${
                isNetPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isNetPositive ? '+' : ''}
              {formatCurrency(summary.netSavings)}
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">Period net balance change</p>
          </div>
        </div>
      </div>

      {/* Account Inflows & Outflows */}
      {accountActivity.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2">
            2. Account Cash Inflows & Outflows
          </h2>
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead className="bg-slate-100 font-semibold text-[10px] text-slate-700 border-b border-slate-300 uppercase tracking-wider">
              <tr>
                <th className="p-2 border-r border-slate-300">Account Name</th>
                <th className="p-2 border-r border-slate-300 text-right">Inflows (+)</th>
                <th className="p-2 border-r border-slate-300 text-right">Outflows (−)</th>
                <th className="p-2 border-r border-slate-300 text-right">Transfer Fees</th>
                <th className="p-2 text-right">Net Account Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {accountActivity.map((acc) => (
                <tr key={acc.accountId} className="text-[10px]">
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                    {acc.accountName}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono text-emerald-700">
                    +{formatCurrency(acc.totalInflow)}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono text-rose-700">
                    −{formatCurrency(acc.totalOutflow)}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">
                    {acc.totalFees > 0 ? `−${formatCurrency(acc.totalFees)}` : '₱0.00'}
                  </td>
                  <td
                    className={`p-2 text-right font-mono font-bold ${
                      acc.netChange >= 0 ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {acc.netChange >= 0 ? '+' : ''}
                    {formatCurrency(acc.netChange)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Breakdown (Top Expenses and Incomes) */}
      {categoryBreakdown.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2">
            3. Category Expenditure & Revenue Distribution
          </h2>
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead className="bg-slate-100 font-semibold text-[10px] text-slate-700 border-b border-slate-300 uppercase tracking-wider">
              <tr>
                <th className="p-2 border-r border-slate-300">Category</th>
                <th className="p-2 border-r border-slate-300">Classification</th>
                <th className="p-2 border-r border-slate-300 text-center">Tx Count</th>
                <th className="p-2 border-r border-slate-300 text-right">Share (%)</th>
                <th className="p-2 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categoryBreakdown.map((cat, idx) => (
                <tr key={`${cat.categoryName}-${idx}`} className="text-[10px]">
                  <td className="p-2 border-r border-slate-200 font-medium text-slate-900">
                    {cat.categoryName}
                  </td>
                  <td className="p-2 border-r border-slate-200">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                        cat.typeName === 'Income'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {cat.typeName}
                    </span>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono">
                    {cat.transactionCount}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono font-medium">
                    {cat.percentage.toFixed(1)}%
                  </td>
                  <td className="p-2 text-right font-mono font-semibold">
                    {cat.typeName === 'Income' ? '+' : '−'}
                    {formatCurrency(cat.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Itemized Transactions Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
            4. Itemized Statement of Transactions
          </h2>
          <span className="text-[10px] text-slate-500 font-medium">
            Showing {transactions.length} recorded entries
          </span>
        </div>

        <table className="w-full text-left border-collapse border border-slate-300">
          <thead className="bg-slate-100 font-semibold text-[10px] text-slate-700 border-b border-slate-300 uppercase tracking-wider">
            <tr>
              <th className="p-2 border-r border-slate-300 w-20">Date</th>
              <th className="p-2 border-r border-slate-300 w-16">Type</th>
              <th className="p-2 border-r border-slate-300 w-32">Category / Purpose</th>
              <th className="p-2 border-r border-slate-300 w-28">Account</th>
              <th className="p-2 border-r border-slate-300">Notes / Description</th>
              <th className="p-2 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[10px]">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-400">
                  No transaction records found for this period.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-slate-50/50">
                  <td className="p-2 border-r border-slate-200 font-mono whitespace-nowrap text-slate-700">
                    {tx.transaction_date}
                  </td>
                  <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                    {tx.type_name}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-slate-800">
                    {tx.type_name === 'Transfer'
                      ? `Transfer to ${tx.destination_account_name || 'Destination'}`
                      : tx.category_name || 'Uncategorized'}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-slate-700 font-medium">
                    {tx.account_name}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-slate-600 truncate max-w-[180px]">
                    {tx.description || '—'}
                  </td>
                  <td className="p-2 text-right font-mono font-bold whitespace-nowrap">
                    <span
                      className={
                        tx.type_name === 'Income'
                          ? 'text-emerald-700'
                          : tx.type_name === 'Expense'
                          ? 'text-rose-700'
                          : 'text-slate-800'
                      }
                    >
                      {tx.type_name === 'Income' ? '+' : '−'}
                      {formatCurrency(tx.amount)}
                    </span>
                    {tx.type_name === 'Transfer' && tx.transfer_fee > 0 && (
                      <span className="block text-[8px] font-normal text-slate-500">
                        Fee: {formatCurrency(tx.transfer_fee)}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Formal Certification & Security Disclaimer Footer */}
      <div className="pt-4 border-t-2 border-slate-900 text-[9px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-800 uppercase tracking-wider">
            FinTrack Financial Ledger Services • Official Record
          </p>
          <p className="font-mono text-slate-600">
            Document Security ID: {statementRef}
          </p>
        </div>
        <p className="leading-relaxed">
          <strong>Notice:</strong> This statement is an official, computer-generated financial summary produced from immutable transaction records and audit logs. No manual signature is required. All values are expressed in Philippine Pesos (PHP).
        </p>
        <p className="text-[8px] text-slate-400">
          CONFIDENTIAL DOCUMENT • Intended strictly for the registered account owner. Unauthorized reproduction, distribution, or alteration is prohibited.
        </p>
      </div>
    </div>
  );
}
