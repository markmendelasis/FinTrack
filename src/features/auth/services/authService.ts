import { supabase } from '@/lib/supabase/client';
import type { LoginCredentials, RegisterCredentials, UserProfile } from '../types/auth.types';

export const authService = {
  /**
   * Authenticates user using email and password via Supabase Auth.
   */
  async signInWithEmail({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Registers a new user via Supabase Auth and provisions their profile
   * and default Cash Wallet via the approved database RPC function.
   */
  async signUpWithEmail({ email, password, userName }: RegisterCredentials) {
    const trimmedName = userName.trim() || 'FinTrack User';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: trimmedName,
        },
      },
    });

    if (error) {
      throw error;
    }

    // If an active session is returned immediately (e.g. email confirmation off),
    // provision the user profile and default Cash Wallet immediately.
    if (data.session && data.user) {
      try {
        await supabase.rpc('create_user_profile_and_default_account', {
          p_user_name: trimmedName,
        });
      } catch (rpcError) {
        console.error('[FinTrack] Error creating profile & default account:', rpcError);
      }
    }

    return data;
  },

  /**
   * Initiates Google OAuth authentication via Supabase Auth.
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Signs the current user out and terminates the Supabase Auth session.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },

  /**
   * Sends a password reset recovery email via Supabase Auth.
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Fetches the user profile linked to the authenticated user ID.
   * If a profile does not exist yet (e.g. first Google OAuth sign-in),
   * calls create_user_profile_and_default_account to provision it.
   */
  async getUserProfile(authUserId: string, fallbackName?: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (error) {
      console.error('[FinTrack] Error fetching user profile:', error);
      return null;
    }

    if (data) {
      return data;
    }

    // Profile does not exist yet: provision automatically via trusted RPC
    try {
      const defaultName = fallbackName || 'FinTrack User';
      await supabase.rpc('create_user_profile_and_default_account', {
        p_user_name: defaultName,
      });

      // Refetch newly created profile
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      return newProfile;
    } catch (provisionError) {
      console.error('[FinTrack] Error auto-provisioning profile for OAuth user:', provisionError);
      return null;
    }
  },

  /**
   * Updates the user's display name in their application profile.
   */
  async updateUserName(authUserId: string, newName: string): Promise<UserProfile> {
    const trimmed = newName.trim();
    if (!trimmed) {
      throw new Error('Display name cannot be empty');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        user_name: trimmed,
        updated_at: new Date().toISOString(),
        updated_by: authUserId,
      })
      .eq('auth_user_id', authUserId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
