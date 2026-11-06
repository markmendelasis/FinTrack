import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { authService } from '../services/authService';
import type {
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  UserProfile,
} from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to load or refresh user profile
  const fetchProfileForUser = async (authUser: User) => {
    try {
      const fallbackName =
        authUser.user_metadata?.user_name ||
        authUser.user_metadata?.full_name ||
        authUser.email?.split('@')[0] ||
        'FinTrack User';

      const userProfile = await authService.getUserProfile(authUser.id, fallbackName);
      setProfile(userProfile);
    } catch (err) {
      console.error('[FinTrack] Failed to load user profile:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[FinTrack] Session check warning:', error.message);
        }

        if (isMounted) {
          const currentSession = data?.session ?? null;
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            await fetchProfileForUser(currentSession.user);
          }
        }
      } catch (err) {
        console.error('[FinTrack] Unexpected session initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Listen to real-time auth state events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' && newSession?.user) {
        await fetchProfileForUser(newSession.user);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        if (!profile) {
          await fetchProfileForUser(newSession.user);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileForUser(user);
    }
  };

  const signInWithEmail = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const data = await authService.signInWithEmail(credentials);
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfileForUser(data.user);
      }
      toast.success('Signed in successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid login credentials';
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const data = await authService.signUpWithEmail(credentials);
      if (data.session && data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfileForUser(data.user);
        toast.success('Registration successful! Welcome to FinTrack.');
      } else {
        toast.success(
          'Registration initiated! Please verify your email if required by your Supabase project.'
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google OAuth sign-in failed';
      toast.error(message);
      throw err;
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      toast.success('Signed out successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error signing out';
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      toast.success('Password recovery link sent! Check your inbox.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send password recovery email';
      toast.error(message);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
