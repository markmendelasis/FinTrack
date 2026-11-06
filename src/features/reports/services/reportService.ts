import { supabase } from '@/lib/supabase/client';
import type {
  ReportFilterState,
  ReportData,
  ReportSummary,
  CategorySummaryItem,
  AccountActivityItem,
} from '../types/report.types';
import type { TransactionWithDetails } from '@/features/transactions/types/transaction.types';

export const reportService = {
  /**
   * Generates aggregated financial report data based on filter parameters.
   */
  async generateReport(filters: ReportFilterState): Promise<ReportData> {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        accounts!fk_trans_source_account_owner (account_name),
        dest_account:accounts!fk_trans_dest_account_owner (account_name),
        categories (category_name),
        transaction_types (type_name)
      `)
      .eq('status', 'Y')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }
    if (filters.accountId) {
      query = query.or(
        `account_id.eq.${filters.accountId},destination_account_id.eq.${filters.accountId}`
      );
    }
    if (filters.transactionTypeId) {
      query = query.eq('transaction_type_id', filters.transactionTypeId);
    }

    const { data: rawData, error } = await query;
    if (error) {
      console.error('[reportService] Query error:', error);
      throw error;
    }

    const transactions: TransactionWithDetails[] = (rawData || []).map((row) => {
      const sourceAccount = row.accounts as { account_name?: string } | null;
      const destAccount = row.dest_account as { account_name?: string } | null;
      const cat = row.categories as { category_name?: string } | null;
      const tt = row.transaction_types as { type_name?: 'Income' | 'Expense' | 'Transfer' } | null;

      return {
        ...row,
        account_name: sourceAccount?.account_name || 'Unknown Account',
        destination_account_name: destAccount?.account_name || null,
        category_name: cat?.category_name || null,
        type_name: (tt?.type_name || 'Expense') as 'Income' | 'Expense' | 'Transfer',
      };
    });

    // 1. Calculate Summary
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransferFees = 0;

    for (const tx of transactions) {
      const amt = Number(tx.amount) || 0;
      const fee = Number(tx.transfer_fee) || 0;

      if (tx.type_name === 'Income') {
        totalIncome += amt;
      } else if (tx.type_name === 'Expense') {
        totalExpense += amt;
      } else if (tx.type_name === 'Transfer') {
        totalTransferFees += fee;
      }
    }

    const summary: ReportSummary = {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      totalTransferFees: Math.round(totalTransferFees * 100) / 100,
      netSavings: Math.round((totalIncome - totalExpense - totalTransferFees) * 100) / 100,
      transactionCount: transactions.length,
    };

    // 2. Category Breakdown
    const catMap = new Map<string, { type: 'Income' | 'Expense'; amount: number; count: number }>();

    for (const tx of transactions) {
      if (tx.type_name === 'Transfer') continue;
      const name = tx.category_name || 'Uncategorized';
      const amt = Number(tx.amount) || 0;
      const existing = catMap.get(name) || {
        type: tx.type_name,
        amount: 0,
        count: 0,
      };
      existing.amount += amt;
      existing.count += 1;
      catMap.set(name, existing);
    }

    const categoryBreakdown: CategorySummaryItem[] = [];
    catMap.forEach((val, name) => {
      const baseTotal = val.type === 'Income' ? totalIncome : totalExpense;
      const percentage = baseTotal > 0 ? Math.round((val.amount / baseTotal) * 1000) / 10 : 0;
      categoryBreakdown.push({
        categoryName: name,
        typeName: val.type,
        totalAmount: Math.round(val.amount * 100) / 100,
        percentage,
        transactionCount: val.count,
      });
    });

    // Sort categories: Expense first descending, then Income descending
    categoryBreakdown.sort((a, b) => b.totalAmount - a.totalAmount);

    // 3. Account Activity
    const accMap = new Map<
      string,
      {
        name: string;
        inflow: number;
        outflow: number;
        fees: number;
      }
    >();

    for (const tx of transactions) {
      const amt = Number(tx.amount) || 0;
      const fee = Number(tx.transfer_fee) || 0;

      // Source Account
      const srcId = tx.account_id;
      const srcName = tx.account_name;
      if (!accMap.has(srcId)) {
        accMap.set(srcId, { name: srcName, inflow: 0, outflow: 0, fees: 0 });
      }
      const srcObj = accMap.get(srcId)!;

      if (tx.type_name === 'Income') {
        srcObj.inflow += amt;
      } else if (tx.type_name === 'Expense') {
        srcObj.outflow += amt;
      } else if (tx.type_name === 'Transfer') {
        srcObj.outflow += amt;
        srcObj.fees += fee;

        // Destination Account
        if (tx.destination_account_id) {
          const dstId = tx.destination_account_id;
          const dstName = tx.destination_account_name || 'Destination Account';
          if (!accMap.has(dstId)) {
            accMap.set(dstId, { name: dstName, inflow: 0, outflow: 0, fees: 0 });
          }
          accMap.get(dstId)!.inflow += amt;
        }
      }
    }

    const accountActivity: AccountActivityItem[] = [];
    accMap.forEach((val, id) => {
      const net = val.inflow - val.outflow - val.fees;
      accountActivity.push({
        accountId: id,
        accountName: val.name,
        status: 'ACTIVE',
        totalInflow: Math.round(val.inflow * 100) / 100,
        totalOutflow: Math.round(val.outflow * 100) / 100,
        totalFees: Math.round(val.fees * 100) / 100,
        netChange: Math.round(net * 100) / 100,
      });
    });

    return {
      summary,
      categoryBreakdown,
      accountActivity,
      transactions,
    };
  },

  /**
   * Generates and triggers download of a CSV export file.
   */
  exportToCSV(report: ReportData, dateRangeLabel: string) {
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Category',
      'Source Account',
      'Destination Account',
      'Amount (PHP)',
      'Transfer Fee (PHP)',
      'Description',
    ];

    const rows = report.transactions.map((tx) => [
      `"${tx.transaction_id}"`,
      `"${tx.transaction_date}"`,
      `"${tx.type_name}"`,
      `"${tx.category_name || ''}"`,
      `"${tx.account_name.replace(/"/g, '""')}"`,
      `"${(tx.destination_account_name || '').replace(/"/g, '""')}"`,
      tx.amount.toFixed(2),
      tx.transfer_fee.toFixed(2),
      `"${(tx.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Microsoft Excel compatibility
      `"FinTrack Financial Report - ${dateRangeLabel}"\r\n` +
      `"Generated: ${new Date().toLocaleString()}"\r\n` +
      `"Total Income: PHP ${report.summary.totalIncome.toFixed(2)} | Total Expense: PHP ${report.summary.totalExpense.toFixed(2)} | Net: PHP ${report.summary.netSavings.toFixed(2)}"\r\n\r\n` +
      headers.join(',') +
      '\r\n' +
      rows.map((r) => r.join(',')).join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `FinTrack_Report_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
