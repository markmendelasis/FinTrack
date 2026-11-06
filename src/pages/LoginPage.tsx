import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { ShieldCheck } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 font-black text-2xl text-white shadow-md">
            ₱
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Sign in to FinTrack
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Personal finance management backed by Supabase & PostgreSQL
          </p>
        </div>

        <Card>
          <LoginForm />
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Protected with Row Level Security & Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
