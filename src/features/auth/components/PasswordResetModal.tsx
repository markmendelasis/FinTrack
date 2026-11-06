import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Mail, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function PasswordResetModal({ isOpen, onClose, defaultEmail = '' }: PasswordResetModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { resetPassword } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setIsSent(true);
    } catch {
      // Toast notification is handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered email address and we will send you a secure recovery link.
        </p>

        {isSent ? (
          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
            <p className="text-xs text-emerald-800 font-medium">
              Recovery link has been sent to <span className="font-semibold">{email}</span>. Please check your inbox.
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Send Recovery Link
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
