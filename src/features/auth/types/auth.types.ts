import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  userName: string;
}

export interface AuthContextType extends AuthState {
  signInWithEmail: (credentials: LoginCredentials) => Promise<void>;
  signUpWithEmail: (credentials: RegisterCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}
