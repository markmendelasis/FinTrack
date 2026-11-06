import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, ShieldAlert, KeyRound, Info } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings & Profile</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your account profile, preferences, and security.
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs sm:text-sm text-blue-900 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Milestone 3 & Security Integration</p>
          <p className="text-blue-700 mt-0.5">
            User profile editing, password changes, and permanent account deletion via server-side process will be fully active upon Milestone 3 implementation.
          </p>
        </div>
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
                  disabled
                  defaultValue="FinTrack User"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-700 cursor-not-allowed"
                />
              </div>
              <Button variant="outline" size="md" disabled>
                Edit
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Editable display name mapped to <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">user_profiles.user_name</code>.
            </p>
          </div>
        </div>
      </Card>

      {/* Security Credentials Card */}
      <Card title="Authentication & Password" subtitle="Manage your Supabase Auth credentials">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Password Recovery & Reset</p>
            <p className="text-xs text-slate-500">
              Handled securely by Supabase Auth; passwords are never stored in application tables.
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            <KeyRound className="h-4 w-4 mr-1.5" />
            Reset Password
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
                As required by <code className="bg-rose-100/80 px-1 py-0.5 rounded text-[11px]">SECURITY.md</code> (Section 8), permanent account deletion requires password/provider re-authentication, irreversible confirmation, and runs through a trusted server-side process that removes auth, profiles, financial accounts, transactions, and audit logs safely.
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
};
