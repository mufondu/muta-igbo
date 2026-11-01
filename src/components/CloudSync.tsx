// Keeps the parent's app state (child profiles + progress) in sync with Supabase.
// Local storage stays the source the UI reads; the cloud is a backup and cross-device copy.
// Strategy: on sign-in pull the remote copy and keep whichever is newer, then push changes
// (debounced). Last-write-wins by device clock. Failures are silent and retried on next change.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { DEFAULT_STATE, useApp } from '../hooks/useAppState';
import { useAuth } from '../hooks/useAuth';
import { track } from '../lib/analytics';
import { supabase } from '../lib/supabase';

const OWNER_KEY = '@mutaigbo_owner_v1';
const PUSH_DELAY_MS = 2000;

export default function CloudSync() {
  const { user } = useAuth();
  const { state, replaceState } = useApp();
  const userId = user?.id ?? null;

  const ready = useRef(false);               // initial pull finished for this user
  const latest = useRef(state);
  latest.current = state;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function push(uid: string) {
    if (!supabase) return;
    const s = latest.current;
    await supabase.from('app_state').upsert({
      user_id: uid,
      state: s,
      client_updated_at: s.updatedAt,
      updated_at: new Date().toISOString(),
    });
  }

  // Initial pull when a parent signs in (or the page reloads while signed in).
  useEffect(() => {
    ready.current = false;
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (!supabase || !userId) return;

    let cancelled = false;
    (async () => {
      try {
        // Shared device safety: if a different parent last used this browser, do not
        // show or upload their children's data under this account.
        const owner = await AsyncStorage.getItem(OWNER_KEY);
        const foreign = Boolean(owner && owner !== userId);
        if (foreign) replaceState(DEFAULT_STATE);

        const { data, error } = await supabase
          .from('app_state')
          .select('state, client_updated_at')
          .eq('user_id', userId)
          .maybeSingle();
        if (cancelled || error) return;

        // A foreign device copy is never uploaded or compared: treat local as empty.
        const localUpdatedAt = foreign ? 0 : latest.current.updatedAt;
        const remoteUpdatedAt = Number(data?.client_updated_at ?? 0);

        if (data?.state && (foreign || remoteUpdatedAt > localUpdatedAt)) {
          replaceState(data.state);
        } else if (!foreign && (latest.current.onboarded || latest.current.profiles.length > 0)) {
          await push(userId);          // first sign-in adopts this device's existing progress
        }
        await AsyncStorage.setItem(OWNER_KEY, userId);
        if (!cancelled) {
          ready.current = true;
          track('session_start');
        }
      } catch {
        // offline or transient: stay local, try again on next change
        if (!cancelled) ready.current = true;
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Push local changes after the initial pull.
  useEffect(() => {
    if (!supabase || !userId || !ready.current || state.updatedAt === 0) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { push(userId).catch(() => {}); }, PUSH_DELAY_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.updatedAt, userId]);

  // Flush on tab close / hide so the last change is not lost.
  useEffect(() => {
    const g = globalThis as unknown as {
      addEventListener?: (t: string, f: () => void) => void;
      removeEventListener?: (t: string, f: () => void) => void;
    };
    if (!g.addEventListener || !userId) return;
    const flush = () => { if (ready.current) push(userId).catch(() => {}); };
    g.addEventListener('pagehide', flush);
    return () => g.removeEventListener?.('pagehide', flush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return null;
}
