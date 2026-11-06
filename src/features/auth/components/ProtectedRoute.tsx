import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, profile, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 font-black text-2xl text-white shadow-md animate-pulse">
          ₱
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 font-medium">
          <svg className="animate-spin h-4 w-4 text-emerald-600" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Loading your financial profile...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce Section 5.1 rule: Inactive profiles cannot access application features
  if (profile && profile.status === 'INACTIVE') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm border border-slate-200 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Account Profile Inactive</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your FinTrack account profile is currently marked as <span className="font-semibold text-rose-600">INACTIVE</span>. As specified in FinTrack security policies, inactive accounts cannot access financial records.
          </p>
          <div className="mt-6">
            <Button variant="outline" size="md" onClick={() => signOut()} className="w-full">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
