import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, History, ShieldCheck } from 'lucide-react';
import { accountService } from '../services/accountService';
import { formatDate } from '@/lib/utils/formatters';
import type { AccountWithBalance, AccountAuditLog } from '../types/account.types';

interface AccountAuditLogModalProps {
  account: AccountWithBalance | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AccountAuditLogModal({ account, isOpen, onClose }: AccountAuditLogModalProps) {
  const [logs, setLogs] = useState<AccountAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account && isOpen) {
      setIsLoading(true);
      setError(null);
      accountService
        .getAccountAuditLogs(account.account_id)
        .then((data) => setLogs(data))
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to fetch audit history';
          setError(message);
        })
        .finally(() => setIsLoading(false));
    }
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'INCOME':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EXPENSE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'TRANSFER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'DEACTIVATE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REACTIVATE':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'UPDATE':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Account Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Audit history for <span className="font-semibold text-slate-700">{account.account_name}</span>
            </p>
          </div>
        </div>

        {/* Audit Logs List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <svg className="animate-spin h-5 w-5 text-emerald-600 mx-auto mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Retrieving immutable audit history...
            </div>
          ) : error ? (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 text-center">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No audit logs recorded for this account yet.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.audit_log_id}
                className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/60 text-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getActionBadgeColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(log.performed_at)} &bull; {new Date(log.performed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="font-semibold text-slate-800 text-sm">
                  {log.action_description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span className="font-mono text-[10px] truncate max-w-xs" title={`Actor UUID: ${log.performed_by}`}>
                    Actor: {log.performed_by.slice(0, 8)}...
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Trigger
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400">
            Recorded automatically by PostgreSQL database triggers.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
