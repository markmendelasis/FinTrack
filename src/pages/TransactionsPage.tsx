import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { TransactionCard } from '@/features/transactions/components/TransactionCard';
import { TransactionFilters } from '@/features/transactions/components/TransactionFilters';
import { CreateTransactionModal } from '@/features/transactions/components/CreateTransactionModal';
import { EditTransactionModal } from '@/features/transactions/components/EditTransactionModal';
import { DeleteTransactionDialog } from '@/features/transactions/components/DeleteTransactionDialog';
import { TransactionAuditLogModal } from '@/features/transactions/components/TransactionAuditLogModal';
import type { TransactionWithDetails } from '@/features/transactions/types/transaction.types';

export function TransactionsPage() {
  const { allAccounts } = useAccounts();
  const {
    transactions,
    totalCount,
    transactionTypes,
    categories,
    filters,
    setFilters,
    isLoading,
    createIncome,
    createExpense,
    createTransfer,
    editIncomeExpense,
    softDeleteTransaction,
  } = useTransactions();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<TransactionWithDetails | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<TransactionWithDetails | null>(null);
  const [selectedForAudit, setSelectedForAudit] = useState<TransactionWithDetails | null>(null);

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters({ ...filters, page: newPage });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transactions</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Record and manage your income, expenses, and account transfers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <TransactionFilters
        filters={filters}
        onFilterChange={setFilters}
        transactionTypes={transactionTypes}
        categories={categories}
        accounts={allAccounts}
      />

      {/* Transactions List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <svg className="animate-spin h-6 w-6 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading transactions...
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No transactions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Record an income, expense, or transfer to start tracking your financial activity.
            </p>
            <div className="mt-4">
              <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Record First Transaction
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>
              Showing {transactions.length} of {totalCount} transaction{totalCount === 1 ? '' : 's'}
            </span>
            <span className="font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <TransactionCard
                key={tx.transaction_id}
                transaction={tx}
                onEdit={(item) => setSelectedForEdit(item)}
                onDelete={(item) => setSelectedForDelete(item)}
                onViewAudit={(item) => setSelectedForAudit(item)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <span className="text-xs text-slate-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateTransactionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        transactionTypes={transactionTypes}
        categories={categories}
        accounts={allAccounts}
        onCreateIncome={createIncome}
        onCreateExpense={createExpense}
        onCreateTransfer={createTransfer}
      />

      <EditTransactionModal
        transaction={selectedForEdit}
        isOpen={!!selectedForEdit}
        onClose={() => setSelectedForEdit(null)}
        transactionTypes={transactionTypes}
        categories={categories}
        accounts={allAccounts}
        onSave={editIncomeExpense}
      />

      <DeleteTransactionDialog
        transaction={selectedForDelete}
        isOpen={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={softDeleteTransaction}
      />

      <TransactionAuditLogModal
        transaction={selectedForAudit}
        isOpen={!!selectedForAudit}
        onClose={() => setSelectedForAudit(null)}
      />
    </div>
  );
}
