// Parent authentication (Google + email/password) via Supabase.
// Children never sign in: they are profiles under the parent's account.
import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { setAnalyticsUser, track } from '../lib/analytics';
import { authEnabled, supabase } from '../lib/supabase';

type Result = { error?: string; needsEmailConfirm?: boolean };

interface AuthValue {
  /** False when Supabase env vars are missing: app runs without sign-in. */
  enabled: boolean;
  /** True until the stored session has been checked. */
  loading: boolean;
  session: Session | null;
  user: User | null;
  signInWithGoogle: () => Promise<Result>;
  signInWithPassword: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string) => Promise<Result>;
  resetPassword: (email: string) => Promise<Result>;
  signOut: () => Promise<void>;
  /** Permanently deletes the parent account and all its cloud data (server-side RPC). */
  deleteAccount: () => Promise<Result>;
}

const AuthContext = createContext<AuthValue | null>(null);

function webOrigin(): string | undefined {
  const g = globalThis as unknown as { location?: { origin?: string } };
  return g.location?.origin;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(authEnabled);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setAnalyticsUser(data.session?.user.id ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setAnalyticsUser(next?.user.id ?? null);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<Result> => {
    if (!supabase) return { error: 'Sign-in is not configured.' };
    if (Platform.OS !== 'web') return { error: 'Google sign-in is available on the web version for now. Use email and password.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: webOrigin() },
    });
    return error ? { error: error.message } : {};
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<Result> => {
    if (!supabase) return { error: 'Sign-in is not configured.' };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    track('sign_in', { method: 'password' });
    return {};
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<Result> => {
    if (!supabase) return { error: 'Sign-in is not configured.' };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: webOrigin() },
    });
    if (error) return { error: error.message };
    // With "Confirm email" on, no session is returned until the parent clicks the link.
    return data.session ? {} : { needsEmailConfirm: true };
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<Result> => {
    if (!supabase) return { error: 'Sign-in is not configured.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: webOrigin() });
    return error ? { error: error.message } : {};
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async (): Promise<Result> => {
    if (!supabase) return { error: 'Sign-in is not configured.' };
    // Server function removes the auth user; app_state and usage_events cascade.
    const { error } = await supabase.rpc('delete_my_account');
    if (error) return { error: error.message };
    await supabase.auth.signOut();
    return {};
  }, []);

  const value = useMemo<AuthValue>(() => ({
    enabled: authEnabled,
    loading,
    session,
    user: session?.user ?? null,
    signInWithGoogle,
    signInWithPassword,
    signUp,
    resetPassword,
    signOut,
    deleteAccount,
  }), [loading, session, signInWithGoogle, signInWithPassword, signUp, resetPassword, signOut, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
