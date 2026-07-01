import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MutaFriendId, normalizeFriendId } from '../data/mutaFriends';

export type AvatarEmoji = MutaFriendId;

export interface Profile {
  id: string;
  name: string;
  avatar: AvatarEmoji;
  streak: number;
  lastActive: string;
  levelProgress: Record<string, number>;
  quizBest: number;
  wordsLearned: number;
}

export interface AppState {
  onboarded: boolean;
  parentAgreed: boolean;
  activeProfileId: string;
  profiles: Profile[];
  isPremium: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const DEFAULT_STATE: AppState = {
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
      profiles: (parsed.profiles ?? []).map(p => ({ ...p, avatar: normalizeFriendId(p.avatar) })),
    };
  } catch { return DEFAULT_STATE; }
}

async function saveState(state: AppState): Promise<void> {
  try { await AsyncStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

interface AppContextValue {
  state: AppState;
  activeProfile: Profile | null;
  setActiveProfile: (id: string) => void;
  addProfile: (name: string, avatar: AvatarEmoji) => Profile;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  completeOnboarding: (profiles: Profile[]) => void;
  agreeToTerms: () => void;
  updateProgress: (levelId: string, progress: number) => void;
  updateQuizBest: (score: number) => void;
  incrementStreak: () => void;
  addWordsLearned: (count: number) => void;
  setPremium: (val: boolean) => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  resetAll: () => void;
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
      const next = updater(prev);
      saveState(next);
      return next;
    });
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
    update(s => ({
      ...s,
      profiles: s.profiles.map(p =>
        p.id === s.activeProfileId && score > p.quizBest ? { ...p, quizBest: score } : p
      ),
    }));
  }, [update]);

  const incrementStreak = useCallback(() => {
    const today = new Date().toDateString();
    update(s => ({
      ...s,
      profiles: s.profiles.map(p => {
        if (p.id !== s.activeProfileId) return p;
        if (p.lastActive === today) return p;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        return { ...p, streak: p.lastActive === yesterday ? p.streak + 1 : 1, lastActive: today };
      }),
    }));
  }, [update]);

  const addWordsLearned = useCallback((count: number) => {
    update(s => ({
      ...s,
      profiles: s.profiles.map(p =>
        p.id === s.activeProfileId ? { ...p, wordsLearned: p.wordsLearned + count } : p
      ),
    }));
  }, [update]);

  const setPremium = useCallback((val: boolean) => update(s => ({ ...s, isPremium: val })), [update]);
  const toggleSound = useCallback(() => update(s => ({ ...s, soundEnabled: !s.soundEnabled })), [update]);
  const toggleHaptic = useCallback(() => update(s => ({ ...s, hapticEnabled: !s.hapticEnabled })), [update]);
  const resetAll = useCallback(() => update(() => DEFAULT_STATE), [update]);

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      state, activeProfile, setActiveProfile, addProfile, deleteProfile, renameProfile,
      completeOnboarding, agreeToTerms, updateProgress, updateQuizBest,
      incrementStreak, addWordsLearned, setPremium, toggleSound, toggleHaptic, resetAll,
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
