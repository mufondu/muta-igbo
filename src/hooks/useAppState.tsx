import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MutaFriendId, normalizeFriendId } from '../data/mutaFriends';
import { track } from '../lib/analytics';

export type AvatarEmoji = MutaFriendId;

export interface Profile {
  id: string;
  name: string;
  avatar: AvatarEmoji;
  streak: number;
  lastActive: string;
  levelProgress: Record<string, number>;
  quizBest: number;
  wordsLearned: number;        // unique-word count (kept in sync with learnedWords.length going forward)
  learnedWords: string[];      // set of distinct Igbo words the child has answered correctly
  goalDate: string;        // date string of last goal activity
  goalCount: number;       // activities completed on goalDate
}

/** A lesson or activity the learner opened recently (shown in "Continue Learning"). */
export interface RecentItem {
  key: string;        // dedupe key, e.g. 'level:7A' or 'view:quiz'
  view: string;       // the inner view to reopen
  levelId?: string;
  title: string;
  icon: string;
  ts: number;
}

export interface AppState {
  /** Most recent first, max 6. Shared by all profiles on the account (simple on purpose). */
  recent: RecentItem[];
  onboarded: boolean;
  parentAgreed: boolean;
  activeProfileId: string;
  profiles: Profile[];
  isPremium: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  /** ms since epoch of the last local change. Used to pick the newer copy when syncing. */
  updatedAt: number;
  /** Activities per day the family is aiming for (2, 3, 5 or 10). */
  dailyGoal: number;
}

export const DEFAULT_STATE: AppState = {
  updatedAt: 0,
  dailyGoal: 3,
  recent: [],
  onboarded: false,
  parentAgreed: false,
  activeProfileId: '',
  profiles: [],
  isPremium: false,
  soundEnabled: true,
  hapticEnabled: true,
};

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function makeProfile(name: string, avatar: AvatarEmoji): Profile {
  return {
    id: makeId(),
    name: name.trim(),
    avatar: normalizeFriendId(avatar),
    streak: 0,
    lastActive: '',
    levelProgress: {},
    quizBest: 0,
    wordsLearned: 0,
    learnedWords: [],
    goalDate: '',
    goalCount: 0,
  };
}

const STORE_KEY = '@mutaigbo_state_v3';

async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profiles: (parsed.profiles ?? []).map(p => ({
        ...p,
        avatar: normalizeFriendId(p.avatar),
        streak: p.streak ?? 0,
        lastActive: p.lastActive ?? '',
        levelProgress: p.levelProgress ?? {},
        quizBest: p.quizBest ?? 0,
        wordsLearned: p.wordsLearned ?? 0,
        learnedWords: p.learnedWords ?? [],
        goalDate: p.goalDate ?? '',
        goalCount: p.goalCount ?? 0,
      })),
    };
  } catch { return DEFAULT_STATE; }
}

async function saveState(state: AppState): Promise<void> {
  try { await AsyncStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

/** Wipes everything stored on this device (used after account deletion). */
export async function clearLocalData(): Promise<void> {
  try { await AsyncStorage.multiRemove([STORE_KEY, '@mutaigbo_owner_v1']); } catch {}
}

interface AppContextValue {
  state: AppState;
  activeProfile: Profile | null;
  setActiveProfile: (id: string) => void;
  addProfile: (name: string, avatar: AvatarEmoji) => Profile;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  setProfileAvatar: (id: string, avatar: AvatarEmoji) => void;
  completeOnboarding: (profiles: Profile[]) => void;
  agreeToTerms: () => void;
  updateProgress: (levelId: string, progress: number) => void;
  updateQuizBest: (score: number) => void;
  incrementStreak: () => void;
  markWordLearned: (igbo: string) => void;
  recordActivity: () => void;
  setPremium: (val: boolean) => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  resetAll: () => void;
  /** Replace the whole state (used by cloud sync). Does not bump updatedAt. */
  replaceState: (next: AppState) => void;
  pushRecent: (item: Omit<RecentItem, 'ts'>) => void;
  setDailyGoal: (goal: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState().then(s => { setState(s); setLoaded(true); });
  }, []);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    setState(prev => {
      const next = { ...updater(prev), updatedAt: Date.now() };
      saveState(next);
      return next;
    });
  }, []);

  const replaceState = useCallback((next: AppState) => {
    const normalized: AppState = {
      ...DEFAULT_STATE,
      ...next,
      profiles: (next.profiles ?? []).map(p => ({
        ...makeProfile(p.name ?? '', p.avatar),
        ...p,
        avatar: normalizeFriendId(p.avatar),
      })),
    };
    saveState(normalized);
    setState(normalized);
  }, []);

  const activeProfile: Profile | null =
    state.profiles.find(p => p.id === state.activeProfileId) ?? state.profiles[0] ?? null;

  const setActiveProfile = useCallback((id: string) => {
    update(s => ({ ...s, activeProfileId: id }));
  }, [update]);

  const addProfile = useCallback((name: string, avatar: AvatarEmoji): Profile => {
    const p = makeProfile(name, avatar);
    update(s => ({
      ...s,
      profiles: [...s.profiles, p],
      activeProfileId: s.activeProfileId || p.id,
    }));
    return p;
  }, [update]);

  const deleteProfile = useCallback((id: string) => {
    update(s => {
      const profiles = s.profiles.filter(p => p.id !== id);
      const activeProfileId = s.activeProfileId === id ? (profiles[0]?.id ?? '') : s.activeProfileId;
      return { ...s, profiles, activeProfileId };
    });
  }, [update]);

  const renameProfile = useCallback((id: string, name: string) => {
    update(s => ({
      ...s,
      profiles: s.profiles.map(p => p.id === id ? { ...p, name: name.trim() } : p),
    }));
  }, [update]);

  const setProfileAvatar = useCallback((id: string, avatar: AvatarEmoji) => {
    update(s => ({
      ...s,
      profiles: s.profiles.map(p => p.id === id ? { ...p, avatar: normalizeFriendId(avatar) } : p),
    }));
  }, [update]);

  const completeOnboarding = useCallback((profiles: Profile[]) => {
    update(s => ({
      ...s,
      onboarded: true,
      profiles,
      activeProfileId: profiles[0]?.id ?? '',
    }));
  }, [update]);

  const agreeToTerms = useCallback(() => {
    update(s => ({ ...s, parentAgreed: true }));
  }, [update]);

  const updateProgress = useCallback((levelId: string, progress: number) => {
    track('level_progress', { level: levelId, percent: Math.round(progress * 100) });
    update(s => ({
      ...s,
      profiles: s.profiles.map(p =>
        p.id === s.activeProfileId
          ? { ...p, levelProgress: { ...p.levelProgress, [levelId]: Math.max(p.levelProgress[levelId] ?? 0, progress) } }
          : p
      ),
    }));
  }, [update]);

  const updateQuizBest = useCallback((score: number) => {
    track('quiz_best', { score });
    update(s => ({
      ...s,
      profiles: s.profiles.map(p =>
        p.id === s.activeProfileId && score > p.quizBest ? { ...p, quizBest: score } : p
      ),
    }));
  }, [update]);

  const incrementStreak = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();
    // Step back one CALENDAR day (not a fixed 24h) so daylight-saving transition
    // days (23h/25h) don't miscompute "yesterday" and wrongly break a streak.
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toDateString();
    update(s => ({
      ...s,
      profiles: s.profiles.map(p => {
        if (p.id !== s.activeProfileId) return p;
        if (p.lastActive === today) return p;
        return { ...p, streak: p.lastActive === yesterday ? p.streak + 1 : 1, lastActive: today };
      }),
    }));
  }, [update]);

  const markWordLearned = useCallback((igbo: string) => {
    const word = (igbo ?? '').trim();
    if (!word) return;
    update(s => ({
      ...s,
      profiles: s.profiles.map(p => {
        if (p.id !== s.activeProfileId) return p;
        const learned = p.learnedWords ?? [];
        if (learned.includes(word)) return p;            // already counted — no inflation
        return { ...p, learnedWords: [...learned, word], wordsLearned: p.wordsLearned + 1 };
      }),
    }));
  }, [update]);

  const recordActivity = useCallback(() => {
    track('activity_done');
    const today = new Date().toDateString();
    update(s => ({
      ...s,
      profiles: s.profiles.map(p => {
        if (p.id !== s.activeProfileId) return p;
        const count = p.goalDate === today ? (p.goalCount ?? 0) + 1 : 1;
        return { ...p, goalDate: today, goalCount: count };
      }),
    }));
  }, [update]);

  const pushRecent = useCallback((item: Omit<RecentItem, 'ts'>) => {
    update(s => ({
      ...s,
      recent: [{ ...item, ts: Date.now() }, ...(s.recent ?? []).filter(r => r.key !== item.key)].slice(0, 6),
    }));
  }, [update]);

  const setDailyGoal = useCallback((goal: number) => {
    const clamped = Math.max(1, Math.min(10, Math.round(goal)));
    update(s => ({ ...s, dailyGoal: clamped }));
  }, [update]);

  const setPremium = useCallback((val: boolean) => update(s => ({ ...s, isPremium: val })), [update]);
  const toggleSound = useCallback(() => update(s => ({ ...s, soundEnabled: !s.soundEnabled })), [update]);
  const toggleHaptic = useCallback(() => update(s => ({ ...s, hapticEnabled: !s.hapticEnabled })), [update]);
  const resetAll = useCallback(() => update(() => DEFAULT_STATE), [update]);

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      state, activeProfile, setActiveProfile, addProfile, deleteProfile, renameProfile, setProfileAvatar,
      completeOnboarding, agreeToTerms, updateProgress, updateQuizBest,
      incrementStreak, markWordLearned, recordActivity, setPremium, toggleSound, toggleHaptic, resetAll,
      replaceState, pushRecent, setDailyGoal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
