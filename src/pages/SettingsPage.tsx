import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, ShieldAlert, KeyRound, Check, Edit2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authService } from '@/features/auth/services/authService';
import { formatErrorMessage } from '@/lib/utils/formatters';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { user, profile, refreshProfile, resetPassword } = useAuth();
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    if (profile?.user_name) {
      setUserName(profile.user_name);
    } else if (user?.user_metadata?.user_name) {
      setUserName(user.user_metadata.user_name);
    }
  }, [profile, user]);

  const handleSaveName = async () => {
    if (!user) return;
    const trimmed = userName.trim();
    if (!trimmed) {
      toast.error('Display name cannot be empty');
      return;
    }

    setIsSavingName(true);
    try {
      await authService.updateUserName(user.id, trimmed);
      await refreshProfile();
      setIsEditingName(false);
      toast.success('Display name updated successfully');
    } catch (err: unknown) {
      const message = formatErrorMessage(err, 'Display name was not updated');
      toast.error(message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setIsSendingReset(true);
    try {
      await resetPassword(user.email);
    } catch {
      // Toast notification is managed by AuthContext
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings & Profile</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your account profile, preferences, and security.
        </p>
      </div>

      {/* User Profile Card */}
      <Card title="User Profile" subtitle="Your personal display information">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Display Name
            </label>
            <div className="flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  disabled={!isEditingName || isSavingName}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors ${
                    isEditingName
                      ? 'bg-white border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                  }`}
                />
              </div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveName}
                    isLoading={isSavingName}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    disabled={isSavingName}
                    onClick={() => {
                      setIsEditingName(false);
                      setUserName(profile?.user_name || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="md" onClick={() => setIsEditingName(true)}>
                  <Edit2 className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your public display name shown across FinTrack.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full max-w-md px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your verified account login email address.
            </p>
          </div>
        </div>
      </Card>

      {/* Security Credentials Card */}
      <Card title="Security & Password" subtitle="Manage your account access and credentials">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Password Recovery & Reset</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Send a secure password recovery link to your registered email address.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPassword}
            isLoading={isSendingReset}
          >
            <KeyRound className="h-4 w-4 mr-1.5" />
            Send Password Reset Email
          </Button>
        </div>
      </Card>

      {/* Danger Zone: Permanent Account Deletion */}
      <Card
        title="Danger Zone"
        subtitle="Irreversible account actions"
        className="border-rose-200"
      >
        <div className="rounded-lg bg-rose-50 border border-rose-200/80 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-rose-900">Permanent Account Deletion</h4>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                Deleting your account is permanent and irreversible. All your profile data, financial accounts, transaction history, and audit records will be permanently erased.
              </p>
              <div className="mt-3">
                <Button variant="danger" size="sm" disabled>
                  Delete FinTrack Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
