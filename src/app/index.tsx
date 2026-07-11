/**
 * Mụta Igbo: Premium Kid Edition
 * Central Igbo Learning App
 * src/app/index.tsx
 */

import { IGBO_FOLKTALES } from '../data/igboFolktales';
import { AnimalIllustration } from '../components/illustrations/AnimalIllustration';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LessonIllustration from '../components/illustrations/LessonIllustration';
import AvatarIllustration from '../components/illustrations/AvatarIllustration';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_LEVELS, buildQuizPool, FOLKTALES, VocabItem } from '../data/lessons';
import { useApp } from '../hooks/useAppState';
import HistoryScreen from '../screens/HistoryScreen';
import GamesHub from '../screens/games/GamesHub';
import PictureMatchGame from '../screens/games/PictureMatchGame';
import ListenTapGame from '../screens/games/ListenTapGame';
import WordMatchGame from '../screens/games/WordMatchGame';
import { PrivacyScreen, TermsScreen } from '../screens/LegalScreens';
import OnboardingScreen, { ProfileImage } from '../screens/OnboardingScreen';
import PremiumScreen from '../screens/PremiumScreen';
import { getPlanLabel, getPremiumBadgeLabel, hasPremiumEntitlement, shouldShowUpgradePrompt } from '../config/accessControl';
import SettingsScreen from '../screens/SettingsScreen';
import { COLOR, FONT, IS_TABLET, LEVEL_COLOR, RADIUS, SPACE } from '../utils/tokens';
import * as haptics from '../utils/haptics';
import { DailyGoalRing } from '../components/DailyGoalRing';
import { KIDS_COLOR, KIDS_SHADOW } from '../theme/kidsTheme';
import ParentGate from '../components/ParentGate';
import { GuideBanner } from '../components/LevelGuide';

const MUTA_LOGO = require('../../assets/muta-logo.png');
const MUTA_HEADER_LOGO = require('../../assets/muta-logo-header.png');
const APP_ICON = require('../../assets/muta-logo.png');

const LEVEL_ICONS: Record<string, any> = {
  '7A': require('../../assets/illustrations/custom/levels/alphabet-sounds.png'),
  '6A': require('../../assets/illustrations/custom/levels/greetings-phrases.png'),
  '5A': require('../../assets/illustrations/custom/levels/numbers-counting.png'),
  '4A': require('../../assets/illustrations/custom/levels/body-family.png'),
  '3A': require('../../assets/illustrations/custom/levels/animals-nature.png'),
  '2A': require('../../assets/illustrations/custom/levels/verbs-actions.png'),
  '1A': require('../../assets/illustrations/custom/levels/grammar-language.png'),
};

function AppBackButton({ onPress, style }: { onPress: () => void; style?: any }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[sh.appBackButton, style]}
      accessibilityLabel="Go back"
      activeOpacity={0.84}
    >
      <Ionicons name="chevron-back" size={26} color="#1B2A6B" />
    </TouchableOpacity>
  );
}

// ─── Audio (optional, gracefully degraded) ───────────────────────────────────
let Audio: any = null;
try { Audio = require('expo-av').Audio; } catch (_) {}

async function playNativeAudio(file: any) {
  if (!Audio || !file) {
    if (__DEV__) console.log('[audio] unavailable or missing file');
    return;
  }

  try {
    await Audio.setAudioModeAsync?.({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      file,
      {
        shouldPlay: false,
        volume: 1.0,
        isLooping: false,
      }
    );

    sound.setOnPlaybackStatusUpdate?.((status: any) => {
      if (status?.didJustFinish) {
        sound.unloadAsync?.().catch(() => {});
      }
    });

    await sound.setVolumeAsync?.(1.0);
    await sound.playAsync();

    if (__DEV__) console.log('[audio] played sfx');
  } catch (e) {
    console.log('[audio]', e);
  }
}

const SFX = {
  tap: require('../../assets/audio/sfx/tap.wav'),
  open: require('../../assets/audio/sfx/open.wav'),
  correct: require('../../assets/audio/sfx/correct.wav'),
  wrong: require('../../assets/audio/sfx/wrong.wav'),
  reward: require('../../assets/audio/sfx/reward.wav'),
  levelComplete: require('../../assets/audio/sfx/level_complete.wav'),
} as const;

type SfxKey = keyof typeof SFX;

function playSfx(key: SfxKey, enabled = true) {
  if (!enabled) return;
  void playNativeAudio(SFX[key]);
}

function playSfxSequence(keys: SfxKey[], enabled = true, delayMs = 300) {
  if (!enabled) return;

  keys.forEach((key, index) => {
    if (index === 0) {
      playSfx(key, true);
      return;
    }

    setTimeout(() => playSfx(key, true), delayMs * index);
  });
}

function playSoundFallback(label: string, enabled = true) {
  // Temporary pronunciation placeholder until native speaker recordings are added.
  playSfx('tap', enabled);
  if (__DEV__) console.log('[sound placeholder]', label);
}

// ─── Nav types ────────────────────────────────────────────────────────────────

const MUTA_APP_ICON = require('../../assets/icon.png');




type MainTab = 'home' | 'progress' | 'settings';

type InnerView =
  | 'levelDetail'
  | 'quiz'
  | 'sayItBack'
  | 'folktales'
  | 'history'
  | 'listenTap'
  | 'wordMatch'
  | 'pictureMatch'
  | 'games'
  | 'premium'
  | 'terms'
  | 'privacy'
  | 'adventurePicker' | 'lessonPath';

interface NavState {
  inner: InnerView | null;
  levelId: string;
  sectionId: string;
}

const NAV_RESET: NavState = { inner: null, levelId: '7A', sectionId: '' };

// ─── Animations ──────────────────────────────────────────────────────────────
function BounceIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const scale = useRef(new Animated.Value(0.75)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 12, mass: 0.8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      ]),
    ]).start();
  }, []);
  return <Animated.View style={{ transform: [{ scale }], opacity }}>{children}</Animated.View>;
}

function useWiggle() {
  const rotate = useRef(new Animated.Value(0)).current;
  const trigger = useCallback(() => {
    rotate.setValue(0);
    Animated.sequence([
      Animated.timing(rotate, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: -1, duration: 55, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, []);
  const style = {
    transform: [{ rotate: rotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-6deg', '0deg', '6deg'] }) }],
  };
  return { style, trigger };
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Shared components ────────────────────────────────────────────────────────
function InnerHeader({ title, onBack }: { title: string; onBack: () => void; accent?: string }) {
  return (
    <View style={sh.innerHeader}>
      <TouchableOpacity onPress={onBack} style={sh.innerBackBtn} accessibilityLabel="Go back" activeOpacity={0.84}>
        <Text style={sh.innerBackText}>‹</Text>
      </TouchableOpacity>

      <View style={sh.innerTitleWrap}>
        <Text style={sh.innerKicker}>MỤTA CHALLENGE</Text>
        <Text style={sh.innerTitle}>{title}</Text>
      </View>
    </View>
  );
}

function LockBadge() {
  return (
    <View style={sh.lockBadge}>
      <Text style={sh.lockIcon}>🔒</Text>
    </View>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function MutaIgboApp() {
  const { state, completeOnboarding, incrementStreak, setActiveProfile } = useApp();
  const hasFullAccess = hasPremiumEntitlement(state.isPremium);
  const { width: screenWidth } = useWindowDimensions();
  const appContentWidth = Math.min(screenWidth - 32, screenWidth >= 768 ? 680 : screenWidth);


  const headerProfile =
    state.profiles.find(profile => profile.id === state.activeProfileId) ??
    state.profiles[0] ??
    null;
  const [tab, setTab]     = useState<MainTab>('home');
  const [profileSheetOpen, setProfileSheetOpen] = React.useState(false);
  const [gate, setGate] = useState<null | 'settings' | 'premium'>(null);
  const [nav, setNav]     = useState<NavState>(NAV_RESET);
  const [returnToLessonPath, setReturnToLessonPath] = useState(false);
  const [returnToAdventurePicker, setReturnToAdventurePicker] = useState(false);

  useEffect(() => {
    setNav(NAV_RESET);
    setTab('home');
    incrementStreak();
  }, []);

  function openInner(view: InnerView, levelId?: string, sectionId?: string) {
    setNav({ inner: view, levelId: levelId ?? '7A', sectionId: sectionId ?? '' });
  }

  function openAdventureInner(view: InnerView) {
    setReturnToAdventurePicker(true);
    openInner(view);
  }

  function backToAdventurePicker() {
    setReturnToAdventurePicker(false);
    openInner('adventurePicker');
  }


  function closeInner() {
    if (returnToLessonPath && nav.inner === 'levelDetail') {
      setReturnToLessonPath(false);
      setReturnToAdventurePicker(false);
      setNav({ inner: 'lessonPath', levelId: '7A', sectionId: '' });
      return;
    }

    setReturnToLessonPath(false);
    setReturnToAdventurePicker(false);
    setNav(NAV_RESET);
  }

  // ── Onboarding flow ──
  if (!state.onboarded) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <OnboardingScreen onComplete={(profiles) => completeOnboarding(profiles)} />
      </SafeAreaView>
    );
  }

  // ── Inner screens (full-screen overlays) ──
  if (nav.inner !== null) {
    const { inner, levelId, sectionId } = nav;
    return (
      <SafeAreaView style={sh.root}>
        {inner === 'levelDetail' && (
          <LevelDetailScreen levelId={levelId} onBack={closeInner}
            onPremium={() => openInner('premium')} />
        )}
        {inner === 'quiz' && (
          <QuizScreen onBack={returnToAdventurePicker ? backToAdventurePicker : closeInner} onPremium={() => openInner('premium')} />
        )}
        {inner === 'adventurePicker' && (
          <AdventurePickerScreen onBack={closeInner} openAdventure={openAdventureInner} />
        )}
        {inner === 'sayItBack' && <SayItBackScreen onBack={returnToAdventurePicker ? backToAdventurePicker : closeInner} />}
        {inner === 'folktales' && (
          <FolktalesScreen onBack={returnToAdventurePicker ? backToAdventurePicker : closeInner} onPremium={() => openInner('premium')} />
        )}
        {inner === 'history'  && <HistoryScreen  onBack={returnToAdventurePicker ? backToAdventurePicker : closeInner} />}
        {inner === 'listenTap' && (
          <ListenTapGame
            isPremium={hasFullAccess}
            onBack={returnToAdventurePicker ? backToAdventurePicker : closeInner}
          />
        )}
        {inner === 'wordMatch' && (
          <WordMatchGame
            isPremium={hasFullAccess}
            onBack={returnToAdventurePicker ? backToAdventurePicker : closeInner}
          />
        )}
        {inner === 'pictureMatch' && (
          <PictureMatchGame
            isPremium={hasFullAccess}
            onBack={returnToAdventurePicker ? backToAdventurePicker : closeInner}
          />
        )}
        {inner === 'games'    && <GamesHub isPremium={hasFullAccess} onBack={returnToAdventurePicker ? backToAdventurePicker : closeInner} />}
        {inner === 'lessonPath' && (
          <LessonPathScreen
            onBack={closeInner}
            openInner={(view, levelId, sectionId) => {
              if (view === 'levelDetail') setReturnToLessonPath(true);
              openInner(view, levelId, sectionId);
            }}
            activeProfile={state.profiles.find((profile) => profile.id === state.activeProfileId) ?? state.profiles[0]}
            isPremium={hasFullAccess}
          />
        )}
        {inner === 'premium' && <PremiumScreen onBack={closeInner} />}
        {inner === 'terms'   && <TermsScreen   onBack={closeInner} />}
        {inner === 'privacy' && <PrivacyScreen  onBack={closeInner} />}
      </SafeAreaView>
    );
  }

  // ── Main shell ──
  return (
    <SafeAreaView style={sh.root}>
      {/* App header */}
      <View style={[sh.brandHeader, { width: appContentWidth }]}>
        {gate !== 'settings' ? (
          <TouchableOpacity
            onPress={() => { haptics.tapLight(); setGate('settings'); }}
            style={sh.settingsIconBtn}
            accessibilityLabel="Open Parent Center settings"
            activeOpacity={0.86}
          >
            <Text style={sh.settingsIconText}>⚙</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Body */}
      {tab === 'home'     && <HomeScreen openInner={openInner} onOpenProfileSheet={() => setProfileSheetOpen(true)} />}
      {tab === 'progress' && <ProgressScreen />}
      {tab === 'settings' && <SettingsScreen onBack={() => setTab('home')} />}

      <ParentGate
        visible={gate !== null}
        onPass={() => {
          const target = gate; setGate(null);
          if (target === 'settings') setTab('settings');
          if (target === 'premium') openInner('premium');
        }}
        onCancel={() => setGate(null)}
      />

      <Modal
        visible={profileSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileSheetOpen(false)}
      >
        <TouchableOpacity
          style={sh.profileSheetBackdrop}
          activeOpacity={1}
          onPress={() => setProfileSheetOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={sh.profileSheet}>
            <View style={sh.profileSheetHandle} />
            <Text style={sh.profileSheetKicker}>CHOOSE PLAYER</Text>
            <Text style={sh.profileSheetTitle}>Who is learning today?</Text>

            <View style={sh.profileSheetGrid}>
              {state.profiles.map(profile => {
                const selected = profile.id === headerProfile?.id;

                return (
                  <TouchableOpacity
                    key={profile.id}
                    style={[sh.profileSheetCard, selected && sh.profileSheetCardActive]}
                    activeOpacity={0.86}
                    onPress={() => {
                      setActiveProfile(profile.id);
                      setProfileSheetOpen(false);
                    }}
                  >
                    <AvatarIllustration avatar={profile.avatar} size={72} />
                    <Text style={sh.profileSheetName} numberOfLines={1}>{profile.name}</Text>
                    {selected ? <Text style={sh.profileSheetSelected}>Current</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={sh.profileSheetAdd}
              activeOpacity={0.86}
              onPress={() => {
                setProfileSheetOpen(false);
                setGate('settings');
              }}
            >
              <Text style={sh.profileSheetAddText}>＋ Add or manage child profiles</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Bottom nav */}
      <View pointerEvents="box-none" style={sh.bottomNavFrame}>
        <View style={sh.bottomNav}>
          <TouchableOpacity
            style={[sh.navBtn, tab === 'home' && !gate && sh.navBtnActive]}
            onPress={() => {
              haptics.tapLight();
              setGate(null);
              setTab('home');
            }}
            accessibilityLabel="Go to Home"
            activeOpacity={0.86}
          >
            <Text style={[sh.navIcon, tab === 'home' && !gate && sh.navIconActive]}>🏠</Text>
            <Text style={[sh.navLabel, tab === 'home' && !gate && sh.navLabelActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[sh.navBtn, tab === 'progress' && !gate && sh.navBtnActive]}
            onPress={() => {
              haptics.tapLight();
              setGate(null);
              setTab('progress');
            }}
            accessibilityLabel="Go to Progress"
            activeOpacity={0.86}
          >
            <Text style={[sh.navIcon, tab === 'progress' && !gate && sh.navIconActive]}>⭐</Text>
            <Text style={[sh.navLabel, tab === 'progress' && !gate && sh.navLabelActive]}>XP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[sh.navBtn, gate === 'settings' && sh.navBtnActive]}
            onPress={() => {
              haptics.tapLight();
              setGate('settings');
            }}
            accessibilityLabel="Open Parent Center"
            activeOpacity={0.86}
          >
            <Text style={[sh.navIcon, gate === 'settings' && sh.navIconActive]}>⚙️</Text>
            <Text style={[sh.navLabel, gate === 'settings' && sh.navLabelActive]}>Parent</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Profile switcher (inside header) ────────────────────────────────────────
function ProfileSwitcher() {
  const { state, activeProfile, setActiveProfile } = useApp();
  if (state.profiles.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={sh.profileSwitcherRail}
      style={sh.profileSwitcherScroll}
    >
      {state.profiles.map(p => {
        const selected = activeProfile?.id === p.id;
        return (
          <TouchableOpacity
            key={p.id}
            style={[sh.profileAvatarPill, selected && sh.profileAvatarPillActive]}
            onPress={() => setActiveProfile(p.id)}
            accessibilityLabel={`Switch to ${p.name}`}
            activeOpacity={0.88}
          >
            <AvatarIllustration avatar={p.avatar} size={34} />
            <Text style={[sh.profileAvatarPillText, selected && sh.profileAvatarPillTextActive]} numberOfLines={1}>{p.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}


// ─── ADVENTURE PICKER SCREEN ─────────────────────────────────────────────────
function AdventurePickerScreen({
  onBack,
  openAdventure,
}: {
  onBack: () => void;
  openAdventure: (view: InnerView) => void;
}) {
  const cards = [
    { modeIcon: 'mic', title: 'Say It', igboTitle: 'Kwuo ya', sub: 'Practice speaking', bg: '#FFE3EF', accent: '#F04483', action: () => openAdventure('sayItBack') },
    { modeIcon: 'ear', title: 'Listen & Tap', igboTitle: 'Gee ntị ma pịa', sub: 'Hear it. Pick it.', bg: '#DDF6FF', accent: '#31BDED', action: () => openAdventure('listenTap') },
    { modeIcon: 'swap-horizontal', title: 'Word Match', igboTitle: 'Dakọrịta okwu', sub: 'Match words fast', bg: '#E9FBEF', accent: '#19B36B', action: () => openAdventure('wordMatch') },
    { modeIcon: 'flash', title: 'Quiz Sprint', igboTitle: 'Ajụjụ ọsọ', sub: 'Quick mixed review', bg: '#F0E3FF', accent: '#854CE6', action: () => openAdventure('quiz') },
    { modeIcon: 'book', title: 'Story Hut', igboTitle: 'Ụlọ akụkọ', sub: 'Listen and learn', bg: '#FFF0B8', accent: '#F5A400', action: () => openAdventure('folktales') },
    { modeIcon: 'images', title: 'Picture Match', igboTitle: 'Dakọrịta foto', sub: 'Drag pictures to words', bg: '#ECE2FF', accent: '#854CE6', action: () => openAdventure('pictureMatch') },
  ];

  return (
    <ScrollView
      style={sh.kidsHomeRoot}
      contentContainerStyle={sh.adventurePickerScreenScroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={sh.adventurePickerScreenHeader}>
        <AppBackButton onPress={onBack} />
        <View style={{ flex: 1 }}>
          <Text style={sh.kidsSectionLabel}>PLAYROOM</Text>
          <Text style={sh.adventureSheetTitle}>Pick your adventure</Text>
          <Text style={sh.adventureSheetSub}>Practice the Central Igbo words you’ve unlocked.</Text>
        </View>
      </View>

      <View style={sh.adventureSheetGrid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.title}
            style={[
              sh.adventureSheetCard,
              {
                backgroundColor: card.bg,
                borderColor: card.accent + '44',
                transform: [{ rotate: index % 2 === 0 ? '-0.7deg' : '0.7deg' }],
              },
            ]}
            activeOpacity={0.88}
            onPress={card.action}
          >
            <View style={sh.adventureSheetBubble}>
              <View style={[sh.adventureModeBadge, { backgroundColor: card.accent }]}>
                <Ionicons name={card.modeIcon as any} size={42} color="#FFFFFF" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={sh.adventureSheetCardTitle}>{card.title}</Text>
              {card.igboTitle ? (
                  <Text style={sh.adventureSheetCardIgbo}>{card.igboTitle}</Text>
                ) : null}
                <Text style={sh.adventureSheetCardSub}>{card.sub}</Text>
            </View>
            <Text style={[sh.adventureSheetArrow, { color: card.accent }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ openInner, onOpenProfileSheet }: { openInner: (v: InnerView, levelId?: string) => void; onOpenProfileSheet: () => void }) {
  const { activeProfile, state } = useApp();
  const [adventurePickerOpen, setAdventurePickerOpen] = useState(false);
  const [returnToAdventurePicker, setReturnToAdventurePicker] = useState(false);

  const openAdventureInner = (view: InnerView) => {
    setReturnToAdventurePicker(true);
    setAdventurePickerOpen(false);
    openInner(view);
  };

  const closeAdventureInner = () => {
    if (returnToAdventurePicker) {
      setReturnToAdventurePicker(false);
      setAdventurePickerOpen(true);
    }
  };


  const { width: screenWidth } = useWindowDimensions();
  const isTabletHome = screenWidth >= 768;
  const homeHorizontalGutter = isTabletHome ? 56 : 16;
  const homeContentWidth = Math.min(
    screenWidth - homeHorizontalGutter * 2,
    isTabletHome ? 680 : screenWidth - 32
  );
  const isCompactHome = homeContentWidth < 390;
  const portalIconSize = isCompactHome ? 86 : 112;
  const portalImageSize = isCompactHome ? 80 : 106;
  const playerName = activeProfile?.name?.trim() || 'Nwa Igbo';
  const greetingText = `Nnọọ, ${playerName}!`;
  const greetingIsLong = greetingText.length > 22;
  const greetingIsVeryLong = greetingText.length > 34;


  const today = new Date().toDateString();
  const goalCount = activeProfile?.goalDate === today ? (activeProfile?.goalCount ?? 0) : 0;
  const profileName = activeProfile?.name ?? 'Nwa Igbo';
  const avatar = activeProfile?.avatar ?? 'adaeze';

  return (
    <ScrollView
      style={sh.kidsHomeRoot}
      contentContainerStyle={[
        sh.kidsHomeScroll,
        {
          width: homeContentWidth,
          alignSelf: 'center',
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View pointerEvents="none" style={sh.homeBgSun} />
      <View pointerEvents="none" style={sh.homeBgCloudOne} />
      <View pointerEvents="none" style={sh.homeBgCloudTwo} />
      <View pointerEvents="none" style={sh.homeBgGrassOne} />
      <View pointerEvents="none" style={sh.homeBgGrassTwo} />
      <View pointerEvents="none" style={sh.homeBgConfettiOne} />
      <View pointerEvents="none" style={sh.homeBgConfettiTwo} />
      <Text pointerEvents="none" style={sh.homeBgPawOne}>🐾</Text>
      <Text pointerEvents="none" style={sh.homeBgPawTwo}>🐾</Text>
      <Text pointerEvents="none" style={sh.homeBgLeafOne}>🌿</Text>
      <Text pointerEvents="none" style={sh.homeBgStarOne}>✦</Text>
      <Text pointerEvents="none" style={sh.homeBgStarTwo}>★</Text>
      <View style={sh.kidsHeroCard}>
        <View style={sh.kidsHeroTopRow}>
          <View style={sh.kidsHeroAvatarWrap}>
            <AvatarIllustration avatar={avatar} size={96} />
          </View>
          <View style={sh.kidsHeroCopy}>
            <View style={sh.heroTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={sh.kidsHeroKicker}>TODAY'S IGBO QUEST</Text>
                <Text
              style={[
                sh.kidsHeroTitle,
                isCompactHome && sh.kidsHeroTitleCompact,
                greetingIsLong && sh.kidsHeroTitleLong,
                greetingIsVeryLong && sh.kidsHeroTitleVeryLong,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.68}
              accessibilityLabel={greetingText}
            >
              {greetingText}
            </Text>
              </View>
            </View>

            <Text style={sh.kidsHeroSub}>Ready to learn, play, and keep your Igbo growing?</Text>

            {state.profiles.length > 1 ? (
              <TouchableOpacity
                style={sh.switchPlayerMiniBtn}
                activeOpacity={0.86}
                onPress={onOpenProfileSheet}
                accessibilityLabel="Switch child profile"
              >
                <Text style={sh.switchPlayerMiniText}>Switch player</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={sh.kidsPremiumBadge}><Text style={sh.kidsPremiumBadgeText}>{getPremiumBadgeLabel(state.isPremium)}</Text></View>
        </View>

        <View style={sh.kidsStatsRow}>
          <View style={sh.kidsStatChip}><Text style={sh.kidsStatEmoji}>🔥</Text><Text style={sh.kidsStatText}>{activeProfile?.streak ?? 0} day streak</Text></View>
          <View style={sh.kidsStatChip}><Text style={sh.kidsStatEmoji}>⭐</Text><Text style={sh.kidsStatText}>{activeProfile?.wordsLearned ?? 0} words</Text></View>
          <DailyGoalRing completed={goalCount} />
        </View>
      </View>

      <TouchableOpacity style={sh.kidsQuestCard} onPress={() => openInner('quiz')} activeOpacity={0.88}>
        <View style={sh.kidsQuestIcon}><Text style={sh.kidsQuestIconText}>🎯</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={sh.kidsQuestKicker}>DAILY CHALLENGE</Text>
          <Text style={sh.kidsQuestTitle}>Play Quiz Mode</Text>
          <Text style={sh.kidsQuestSub}>Earn stars and keep your streak glowing.</Text>
        </View>
        <Text style={sh.kidsQuestArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[sh.adventurePortalCard, isCompactHome && sh.portalCardCompact]}
        activeOpacity={0.88}
        onPress={() => openInner('adventurePicker')}
        accessibilityLabel="Choose your adventure"
      >
        <View style={sh.adventurePortalCloudOne} />
        <View style={sh.adventurePortalCloudTwo} />

        <View style={[sh.adventurePortalTop, isCompactHome && sh.portalTopCompact]}>
          <View style={[sh.adventurePortalIcon, { width: portalIconSize, height: portalIconSize }]}>
            <View style={[sh.homeStickerIcon, sh.homeStickerIconPlay, { width: portalImageSize, height: portalImageSize }]}>
              <Ionicons name="game-controller" size={Math.round(portalImageSize * 0.54)} color="#854CE6" />
              <View style={sh.homeStickerSparkle}>
                <Text style={sh.homeStickerSparkleText}>✦</Text>
              </View>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={sh.kidsSectionLabel}>PLAY ZONE</Text>
            <Text style={[sh.kidsSectionTitle, isCompactHome && sh.portalTitleCompact]}>Choose your adventure</Text>
            <Text style={[sh.kidsSectionSub, isCompactHome && sh.portalSubCompact]}>Open the playroom and pick a game path.</Text>
          </View>
        </View>

        <View style={sh.adventurePortalBottom}>
          <Text style={sh.adventurePortalHint}>6 adventures ready</Text>
          <Text style={sh.adventurePortalArrow}>›</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={adventurePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAdventurePickerOpen(false)}
      >
        <TouchableOpacity
          style={sh.adventureSheetBackdrop}
          activeOpacity={1}
          onPress={() => setAdventurePickerOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={sh.adventureSheet}>
            <View style={sh.profileSheetHandle} />

            <Text style={sh.kidsSectionLabel}>PLAYROOM</Text>
            <Text style={sh.adventureSheetTitle}>Pick your adventure</Text>
            <Text style={sh.adventureSheetSub}>Practice the Central Igbo words you’ve unlocked.</Text>

            <View style={sh.adventureSheetGrid}>
              {[
                { modeIcon: 'mic', title: 'Say It', igboTitle: 'Kwuo ya', sub: 'Practice speaking', bg: '#FFE3EF', accent: '#F04483', action: () => openAdventureInner('sayItBack') },
                { modeIcon: 'ear', title: 'Listen & Tap', igboTitle: 'Gee ntị ma pịa', sub: 'Hear it. Pick it.', bg: '#DDF6FF', accent: '#31BDED', action: () => openAdventureInner('listenTap') },
                { modeIcon: 'swap-horizontal', title: 'Word Match', igboTitle: 'Dakọrịta okwu', sub: 'Match words fast', bg: '#E9FBEF', accent: '#19B36B', action: () => openAdventureInner('wordMatch') },
                { modeIcon: 'flash', title: 'Quiz Sprint', igboTitle: 'Ajụjụ ọsọ', sub: 'Quick mixed review', bg: '#F0E3FF', accent: '#854CE6', action: () => openAdventureInner('quiz') },
                { modeIcon: 'book', title: 'Story Hut', igboTitle: 'Ụlọ akụkọ', sub: 'Listen and learn', bg: '#FFF0B8', accent: '#F5A400', action: () => openAdventureInner('folktales') },
                { modeIcon: 'images', title: 'Picture Match', igboTitle: 'Dakọrịta foto', sub: 'Drag pictures to words', bg: '#ECE2FF', accent: '#854CE6', action: () => openAdventureInner('pictureMatch') },
              ].map((card, index) => (
                <TouchableOpacity
                  key={card.title}
                  style={[
                    sh.adventureSheetCard,
                    {
                      backgroundColor: card.bg,
                      borderColor: card.accent + '44',
                      transform: [{ rotate: index % 2 === 0 ? '-0.7deg' : '0.7deg' }],
                    },
                  ]}
                  activeOpacity={0.88}
                  onPress={() => {
                    setAdventurePickerOpen(false);
                    card.action();
                  }}
                >
                  <View style={sh.adventureSheetBubble}>
                    <View style={[sh.adventureModeBadge, { backgroundColor: card.accent }]}>
                <Ionicons name={card.modeIcon as any} size={42} color="#FFFFFF" />
              </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={sh.adventureSheetCardTitle}>{card.title}</Text>
                    {card.igboTitle ? (
                  <Text style={sh.adventureSheetCardIgbo}>{card.igboTitle}</Text>
                ) : null}
                <Text style={sh.adventureSheetCardSub}>{card.sub}</Text>
                  </View>
                  <Text style={sh.adventureSheetArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={[sh.lessonPortalCard, isCompactHome && sh.portalCardCompact]}
        activeOpacity={0.88}
        onPress={() => openInner('lessonPath')}
        accessibilityLabel="Open Lesson Path"
      >
        <View style={sh.lessonPortalCloudOne} />
        <View style={sh.lessonPortalCloudTwo} />

        <View style={[sh.lessonPortalTop, isCompactHome && sh.portalTopCompact]}>
          <View style={[sh.lessonPortalIcon, { width: portalIconSize, height: portalIconSize }]}>
            <View style={[sh.homeStickerIcon, sh.homeStickerIconLesson, { width: portalImageSize, height: portalImageSize }]}>
              <Ionicons name={'footsteps' as any} size={Math.round(portalImageSize * 0.54)} color="#1B2A6B" />
              <View style={sh.homeStickerSparkle}>
                <Text style={sh.homeStickerSparkleText}>★</Text>
              </View>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={sh.kidsSectionLabel}>LESSON PATH</Text>
            <Text style={[sh.lessonPortalTitle, isCompactHome && sh.portalTitleCompact]}>Keep moving forward</Text>
            <Text style={[sh.lessonPortalSub, isCompactHome && sh.portalSubCompact]}>Open your learning map and pick a level.</Text>
          </View>
        </View>

        <View style={sh.lessonPortalBottom}>
          <Text style={sh.lessonPortalHint}>{ALL_LEVELS.length} lessons waiting</Text>
          <Text style={sh.lessonPortalArrow}>›</Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}


const IGBO_ALPHABET_EXAMPLES: Record<string, string> = {
  a: 'aka',
  b: 'bịa',
  ch: 'chi',
  d: 'dee',
  e: 'ego',
  f: 'fere',
  g: 'gaa',
  gb: 'gbaa',
  gh: 'ghọta',
  gw: 'gwuo',
  h: 'hụ',
  i: 'isi',
  ị: 'ịga',
  j: 'ji',
  k: 'kụ',
  kp: 'kpọ',
  kw: 'kwuo',
  l: 'lee',
  m: 'mmiri',
  n: 'nwa',
  ṅ: 'ṅụọ',
  nw: 'nwee',
  ny: 'nya',
  o: 'oke',
  ọ: 'ọkụ',
  p: 'pee',
  r: 'rie',
  s: 'see',
  sh: 'sha',
  t: 'taa',
  u: 'ude',
  ụ: 'ụlọ',
  v: 'votu',
  w: 'were',
  y: 'yiri',
  z: 'zụta',
};

function getIgboAlphabetExample(letter: string, fallback: string): string {
  return IGBO_ALPHABET_EXAMPLES[String(letter).trim().toLowerCase()] || fallback;
}


const NUMBER_CARD_COLORS = [
  { bg: '#FFF1EA', accent: '#FF6B00' },
  { bg: '#EAF5FF', accent: '#2B6CB0' },
  { bg: '#E8F6EC', accent: '#087443' },
  { bg: '#F0E7FF', accent: '#6B46C1' },
  { bg: '#FFF4D6', accent: '#B7791F' },
  { bg: '#E6FAFA', accent: '#0B7F83' },
];

function isNumbersLevel(levelId: string): boolean {
  return levelId === '5A';
}

function isNumberLessonItem(levelId: string, english: string): boolean {
  if (isNumbersLevel(levelId)) return true;
  return /^\d+\s*[—-]/.test(String(english || '').trim());
}

function getNumberValue(english: string): string {
  const match = String(english || '').match(/^(\d+)/);
  return match ? match[1] : '#';
}

function getNumberEnglish(english: string): string {
  return String(english || '').replace(/^\d+\s*[—-]\s*/, '').trim();
}

function getNumberCardColor(index: number) {
  return NUMBER_CARD_COLORS[index % NUMBER_CARD_COLORS.length];
}


function getFamilyAccent(english?: string) {
  const value = (english ?? '').toLowerCase();

  if (value.includes('father') || value.includes('mother') || value.includes('mum') || value.includes('dad')) {
    return {
      cardBg: '#F0FBFF',
      border: '#B8ECFF',
      portraitBg: '#DDF6FF',
      audioBg: '#E8FAFF',
      audioBorder: '#B8ECFF',
    };
  }

  if (value.includes('grandfather') || value.includes('grandmother')) {
    return {
      cardBg: '#FFF8DF',
      border: '#FFD76A',
      portraitBg: '#FFF1B8',
      audioBg: '#FFF7CF',
      audioBorder: '#FFD76A',
    };
  }

  if (value.includes('brother') || value.includes('sister')) {
    return {
      cardBg: '#FFF1F5',
      border: '#FFB8CA',
      portraitBg: '#FFE6F0',
      audioBg: '#FFF0F5',
      audioBorder: '#FFB8CA',
    };
  }

  if (value.includes('child') || value.includes('children')) {
    return {
      cardBg: '#F1FFF6',
      border: '#9BE7B5',
      portraitBg: '#E7FAEF',
      audioBg: '#ECFFF4',
      audioBorder: '#9BE7B5',
    };
  }

  if (value.includes('uncle') || value.includes('aunt') || value.includes('cousin')) {
    return {
      cardBg: '#F7F0FF',
      border: '#D7BEFF',
      portraitBg: '#F2E9FF',
      audioBg: '#F8F1FF',
      audioBorder: '#D7BEFF',
    };
  }

  return {
    cardBg: '#FFFDF6',
    border: '#FFE8A3',
    portraitBg: '#F0FBFF',
    audioBg: '#E8FAFF',
    audioBorder: '#B8ECFF',
  };
}

function getFamilyVocabCardStyle(english?: string) {
  const accent = getFamilyAccent(english);
  return {
    backgroundColor: accent.cardBg,
    borderColor: accent.border,
  };
}

function getFamilyPortraitSlotStyle(english?: string) {
  const accent = getFamilyAccent(english);
  return {
    backgroundColor: accent.portraitBg,
    borderColor: accent.border,
  };
}

function getFamilyAudioButtonStyle(english?: string) {
  const accent = getFamilyAccent(english);
  return {
    backgroundColor: accent.audioBg,
    borderColor: accent.audioBorder,
  };
}

function getManyPicture(emoji?: string): string {
  const safe = emoji || '●';
  return `${safe} ${safe} ${safe}`;
}

function splitLessonPair(value: string): [string, string] {
  const normalized = String(value || '').replace(' / ', ' — ');
  const parts = normalized.split('—').map(part => part.trim()).filter(Boolean);

  if (parts.length >= 2) return [parts[0], parts.slice(1).join(' — ')];
  return [normalized.trim(), ''];
}

function isGrammarLevel(levelId: string): boolean {
  return levelId === '1A';
}

function isSingularPluralSection(title: string): boolean {
  return title.toLowerCase().includes('singular') || title.toLowerCase().includes('plural');
}

// ─── LEVEL DETAIL SCREEN ──────────────────────────────────────────────────────


function getLessonPathCardSurface(levelId: string) {
  switch (levelId) {
    case '1':
    case '1A':
      return { backgroundColor: '#F0FBFF', borderColor: '#B8ECFF' };
    case '2':
      return { backgroundColor: '#FFF8DF', borderColor: '#FFD76A' };
    case '3':
      return { backgroundColor: '#F1FFF6', borderColor: '#9BE7B5' };
    case '4':
      return { backgroundColor: '#E7FAEF', borderColor: '#7BDEA0' };
    case '5':
      return { backgroundColor: '#F7F0FF', borderColor: '#D7BEFF' };
    case '6':
      return { backgroundColor: '#FFF1F5', borderColor: '#FFB8CA' };
    case '7':
      return { backgroundColor: '#E8FAFF', borderColor: '#8EEAFF' };
    default:
      return { backgroundColor: '#FFFDF6', borderColor: '#FFE8A3' };
  }
}

function LessonPathScreen({
  onBack,
  openInner,
  activeProfile,
  isPremium,
}: {
  onBack: () => void;
  openInner: (view: InnerView, levelId?: string, sectionId?: string) => void;
  activeProfile: any;
  isPremium: boolean;
}) {
    const { width: lessonPathScreenWidth } = useWindowDimensions();
  const lessonPathContentWidth = Math.min(
    lessonPathScreenWidth - 32,
    lessonPathScreenWidth >= 768 ? 720 : lessonPathScreenWidth
  );
  const isCompactLessonPath = lessonPathContentWidth < 430;

return (
    <ScrollView
      style={sh.lessonPathScreen}
      contentContainerStyle={sh.lessonPathScreenScroll}
      showsVerticalScrollIndicator={false}
     stickyHeaderIndices={[0]}>
      <View pointerEvents="none" style={sh.lessonPathBgSun} />
      <View pointerEvents="none" style={sh.lessonPathBgCloudOne} />
      <View pointerEvents="none" style={sh.lessonPathBgCloudTwo} />
      <View pointerEvents="none" style={sh.lessonPathBgMintBlob} />
      <Text pointerEvents="none" style={sh.lessonPathBgStarOne}>✦</Text>
      <Text pointerEvents="none" style={sh.lessonPathBgStarTwo}>✧</Text>
      <Text pointerEvents="none" style={sh.lessonPathBgDotOne}>●</Text>
      <Text pointerEvents="none" style={sh.lessonPathBgDotTwo}>●</Text>

      <View style={[sh.lessonPathHeader, sh.lessonPathStickyHeader]}>
        <TouchableOpacity style={sh.lessonPathBackButton} onPress={onBack} activeOpacity={0.84}>
          <Text style={sh.lessonPathBackText}>‹</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={sh.kidsSectionLabel}>LESSON PATH</Text>
          <Text style={sh.lessonPathTitle}>Choose your lesson</Text>
          <Text style={sh.lessonPathSub}>Pick a level and keep building your Igbo superpowers.</Text>
        </View>
      </View>

      {ALL_LEVELS.map((level, i) => {
        const lc = LEVEL_COLOR[level.id];
        const progress = activeProfile?.levelProgress[level.id] ?? 0;
        const isLocked = !level.free && !isPremium;

        return (
          <BounceIn key={level.id} delay={i * 45}>
            <TouchableOpacity
              style={[sh.lessonPathLevelCard, isCompactLessonPath && sh.lessonPathLevelCardCompact, getLessonPathCardSurface(level.id), isLocked && sh.levelCardLocked]}
              onPress={() => { haptics.tapMedium(); isLocked ? openInner('premium') : openInner('levelDetail', level.id); }}
              activeOpacity={0.86}
            >
              <View style={sh.lessonPathBlobOne} />
              <View style={sh.lessonPathBlobTwo} />

              <View style={[sh.lessonPathLevelArt, isCompactLessonPath && sh.lessonPathLevelArtCompact]}>
                {LEVEL_ICONS[level.id] ? (
                  <Image source={LEVEL_ICONS[level.id]} style={[sh.lessonPathLevelImage, isCompactLessonPath && sh.lessonPathLevelImageCompact]} resizeMode="contain" />
                ) : (
                  <Text style={[sh.featureIcon, { color: lc.pip }]}>{level.level}</Text>
                )}
              </View>

              <View style={sh.lessonPathLevelCopy}>
                <View style={sh.levelTopRow}>
                  <Text style={[sh.levelBadge, { color: lc.text }]}>{level.level}</Text>
                  {isLocked && <LockBadge />}
                  {!level.free && isPremium && <View style={sh.premiumTag}><Text style={sh.premiumTagText}>⭐</Text></View>}
                </View>

                <Text style={[sh.lessonPathLevelName, isCompactLessonPath && sh.lessonPathLevelNameCompact]}>{level.title}</Text>
                <Text style={[sh.lessonPathLevelSub, isCompactLessonPath && sh.lessonPathLevelSubCompact]}>{level.igboTitle} · {level.description}</Text>

                <View style={sh.kidsProgressTrack}>
                  <View style={[sh.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: lc.pip }]} />
                </View>
              </View>

              <View style={sh.lessonPathChevronButton}><Text style={sh.lessonPathChevron}>›</Text></View>
            </TouchableOpacity>
          </BounceIn>
        );
      })}
    </ScrollView>
  );
}

function LevelDetailScreen({ levelId, onBack, onPremium }: {
  levelId: string; onBack: () => void; onPremium: () => void;
}) {
  const { state, activeProfile, updateProgress , recordActivity } = useApp();
  const level = ALL_LEVELS.find(l => l.id === levelId)!;
  const lc = LEVEL_COLOR[levelId];
  const [activeSection, setActiveSection] = useState(0);
  const section = level.sections[activeSection];
  const isAlphabet = levelId === '7A' && section.id === 'alphabet';

  useEffect(() => {
    const currentProfile = state.profiles.find(p => p.id === state.activeProfileId);
    const current = currentProfile?.levelProgress[levelId] ?? 0;
    if (current < 0.1) updateProgress(levelId, 0.1);
    recordActivity();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <View style={[sh.lessonHero, { backgroundColor: lc.pip }]}>
        <TouchableOpacity onPress={onBack} style={sh.lessonBackBtn} accessibilityLabel="Go back">
          <Text style={sh.lessonBackText}>‹</Text>
        </TouchableOpacity>

        <View style={sh.lessonHeroCopy}>
          <Text style={sh.lessonEyebrow}>{level.level}</Text>
          <Text style={sh.lessonHeroTitle}>{level.title}</Text>
          <Text style={sh.lessonHeroSub}>{level.igboTitle}</Text>
        </View>

        <View style={sh.lessonAvatarWrap}>
          <ProfileImage avatar={activeProfile?.avatar ?? '👦🏾'} size={86} />
        </View>
      </View>

      {level.sections.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={sh.sectionTabs}
          style={{ flexGrow: 0 }}
        >
          {level.sections.map((sec, i) => (
            <TouchableOpacity
              key={sec.id}
              style={[sh.sectionTab, activeSection === i && { backgroundColor: lc.pip, borderColor: lc.pip }]}
              onPress={() => setActiveSection(i)}
              activeOpacity={0.84}
            >
              <Text style={[sh.sectionTabText, activeSection === i && { color: COLOR.textWhite }]}>
                {sec.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView contentContainerStyle={sh.listPad} showsVerticalScrollIndicator={false}>
        <GuideBanner levelId={levelId} accent={lc.pip} activeAvatar={activeProfile?.avatar} />
        {isAlphabet ? (
          <>
            <View style={sh.alphaIntroCard}>
              <Text style={sh.alphaIntroIcon}>abc</Text>
              <View style={{ flex: 1 }}>
                <Text style={sh.alphaIntroTitle}>Tap, listen, repeat</Text>
                <Text style={sh.alphaIntroBody}>
                  Learn Igbo letters like building blocks. Start with the sound, then say it out loud.
                </Text>
              </View>
            </View>

            <Text style={sh.sectionHeading}>Igbo Alphabet</Text>
            <Text style={sh.sectionSubHeading}>Mkpụrụ Edemede</Text>

            <View style={sh.alphaList}>
              {section.items.map((item, i) => (
                <BounceIn key={`${item.igbo}-${i}`} delay={i * 18}>
                  <TouchableOpacity
                    style={sh.alphaCard}
                    onPress={() => { haptics.tapLight(); playSoundFallback(item.igbo); }}
                    accessibilityLabel={`${item.igbo}, ${item.english}`}
                    activeOpacity={0.82}
                  >
                    <View style={[sh.alphaLetterBox, { backgroundColor: lc.bg }]}>
                      <Text style={[sh.alphaLetter, { color: lc.pip }]}>{item.igbo}</Text>
                    </View>

                    <View style={sh.alphaCopy}>
                      <Text style={sh.alphaTitle}>{item.igbo}</Text>
                      <Text style={sh.alphaSound} numberOfLines={2}>e.g. {getIgboAlphabetExample(item.igbo, item.igbo)}</Text>
                    </View>

                    <View style={[sh.alphaListenBtn, { backgroundColor: lc.pip }]}>
                      <Text style={sh.alphaListenText}>▶</Text>
                    </View>
                  </TouchableOpacity>
                </BounceIn>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={sh.sectionHeading}>{section.title}</Text>
            <Text style={sh.sectionSubHeading}>{section.igboTitle}</Text>

            {section.items.map((item, i) => {
              const numbers = isNumberLessonItem(levelId, item.english);
              const grammar = isGrammarLevel(levelId);
              const textOnly = false;
              const singularPlural = grammar && isSingularPluralSection(section.title);
              const [igboLeft, igboRight] = splitLessonPair(item.igbo);
              const [englishLeft, englishRight] = splitLessonPair(item.english);
              const numberColor = getNumberCardColor(i);

              if (numbers) {
                return (
                  <BounceIn key={i} delay={i * 30}>
                    <TouchableOpacity
                      style={[sh.numberCard, { borderColor: numberColor.accent + '44' }]}
                      onPress={() => { haptics.tapLight(); playSoundFallback(item.igbo); }}
                      accessibilityLabel={`${item.igbo}, ${item.english}`}
                      activeOpacity={0.84}
                    >
                      <View style={[sh.numberBadge, { backgroundColor: numberColor.bg }]}>
                        <Text style={[sh.numberDigit, { color: numberColor.accent }]}>
                          {getNumberValue(item.english)}
                        </Text>
                      </View>

                      <View style={sh.numberCopy}>
                        <Text style={sh.numberIgbo}>{item.igbo}</Text>
                        <Text style={sh.numberEnglish}>{getNumberEnglish(item.english)}</Text>
                        <View style={[sh.numberMiniPill, { backgroundColor: numberColor.bg }]}>
                          <Text style={[sh.numberMiniText, { color: numberColor.accent }]}>
                            Listen & repeat
                          </Text>
                        </View>
                      </View>

                      <View style={[sh.numberSoundBtn, { backgroundColor: numberColor.accent }]}>
                        <Text style={sh.numberSoundText}>▶</Text>
                      </View>
                    </TouchableOpacity>
                  </BounceIn>
                );
              }

              if (singularPlural) {
                return (
                  <BounceIn key={i} delay={i * 30}>
                    <TouchableOpacity
                      style={sh.pairCard}
                      onPress={() => { haptics.tapLight(); playSoundFallback(item.igbo); }}
                      accessibilityLabel={`${item.igbo}, ${item.english}`}
                      activeOpacity={0.8}
                    >
                      <View style={sh.pairPictureRow}>
                        <View style={sh.pairPictureBox}>
                          <Text style={sh.pairPicture}>{item.emoji || '●'}</Text>
                        </View>

                        <View style={sh.pairArrowBox}>
                          <Text style={sh.pairArrow}>→</Text>
                        </View>

                        <View style={sh.pairPictureBox}>
                          <Text style={sh.pairManyPicture}>{getManyPicture(item.emoji)}</Text>
                        </View>
                      </View>

                      <View style={sh.pairWordRow}>
                        <View style={sh.pairColumn}>
                          <Text style={sh.pairLabel}>One</Text>
                          <Text style={sh.pairIgbo}>{igboLeft}</Text>
                          <Text style={sh.pairEnglish}>{englishLeft}</Text>
                        </View>

                        <View style={sh.pairDivider} />

                        <View style={sh.pairColumn}>
                          <Text style={sh.pairLabel}>Many</Text>
                          <Text style={sh.pairIgbo}>{igboRight || igboLeft}</Text>
                          <Text style={sh.pairEnglish}>{englishRight || englishLeft}</Text>
                        </View>
                      </View>

                      <View style={sh.vocabAudioButton}>
                        <Ionicons name="volume-high" size={20} color="#1B2A6B" />
                      </View>
                    </TouchableOpacity>
                  </BounceIn>
                );
              }

              if (grammar || textOnly) {
                return (
                  <BounceIn key={i} delay={i * 30}>
                    <TouchableOpacity
                      style={sh.grammarTextCard}
                      onPress={() => { haptics.tapLight(); playSoundFallback(item.igbo); }}
                      accessibilityLabel={`${item.igbo}, ${item.english}`}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={sh.vocabIgbo}>{item.igbo}</Text>
                        <Text style={sh.vocabEn}>{item.english}</Text>
                        {item.example && (
                          <Text style={sh.vocabExample}>e.g. {item.example}</Text>
                        )}
                      </View>
                      <View style={sh.vocabAudioButton}>
                        <Ionicons name="volume-high" size={20} color="#1B2A6B" />
                      </View>
                    </TouchableOpacity>
                  </BounceIn>
                );
              }

              return (
                <BounceIn key={i} delay={i * 30}>
                  <TouchableOpacity
                    style={[sh.vocabCard, getFamilyVocabCardStyle(item.english)]}
                    onPress={() => { haptics.tapLight(); playSoundFallback(item.igbo); }}
                    accessibilityLabel={`${item.igbo}, ${item.english}`}
                    activeOpacity={0.8}
                  >
                    {levelId === '7A' ? (
                      <View style={[sh.vocabEmojiWrap, { backgroundColor: lc.bg }]}>
                        <Text style={[sh.alphaLetter, { color: lc.pip }]}>{item.igbo}</Text>
                      </View>
                    ) : (
                      <View style={[sh.vocabPortraitSlot, getFamilyPortraitSlotStyle(item.english)]}>
                        <LessonIllustration
                          igbo={item.igbo}
                          english={item.english}
                          emoji={item.emoji}
                          backgroundColor="transparent"
                          size={88}
                        />
                      </View>
                    )}
                    <View style={sh.vocabTextBlock}>
                      <Text style={sh.vocabIgbo}>{item.igbo}</Text>
                      <Text style={sh.vocabEn}>{item.english}</Text>
                      {item.example && (
                        <Text style={sh.vocabExample}>e.g. {item.example}</Text>
                      )}
                    </View>
                    <View style={[sh.vocabAudioButton, getFamilyAudioButtonStyle(item.english)]}>
                      <Ionicons name="volume-high" size={20} color="#1B2A6B" />
                    </View>
                  </TouchableOpacity>
                </BounceIn>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── PROGRESS SCREEN ──────────────────────────────────────────────────────────
function ProgressScreen() {
  const { activeProfile, state } = useApp();
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const HEIGHTS = [55, 70, 30, 85, 90, 20, 0];
  const { width: xpScreenWidth } = useWindowDimensions();
  const xpContentWidth = Math.min(xpScreenWidth - 32, xpScreenWidth >= 768 ? 720 : xpScreenWidth);
  const isCompactXp = xpContentWidth < 390;

  const progressValues = ALL_LEVELS.map(level => activeProfile?.levelProgress[level.id] ?? 0);
  const totalProgress = progressValues.length
    ? Math.round((progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length) * 100)
    : 0;

  const stats = [
    { label: 'Day streak', value: String(activeProfile?.streak ?? 0), icon: '🔥', bg: '#FFF1B8', accent: '#FFA62B' },
    { label: 'Words', value: String(activeProfile?.wordsLearned ?? 0), icon: '⭐', bg: '#DDF6FF', accent: '#31BDED' },
    { label: 'Quiz best', value: String(activeProfile?.quizBest ?? 0), icon: '🎯', bg: '#FFE6F0', accent: '#F64F72' },
    { label: 'Plan', value: getPlanLabel(state.isPremium), icon: '👑', bg: '#F2E9FF', accent: '#7A45D8' },
  ];

  return (
    <ScrollView
      style={sh.xpRoot}
      contentContainerStyle={[sh.xpScroll, { width: xpContentWidth, alignSelf: 'center' }, isCompactXp && sh.xpScrollCompact]}
      showsVerticalScrollIndicator={false}
    >
      <View pointerEvents="none" style={sh.xpBgSun} />
      <View pointerEvents="none" style={sh.xpBgCloudOne} />
      <View pointerEvents="none" style={sh.xpBgCloudTwo} />

      <View style={[sh.xpHeroCard, isCompactXp && sh.xpHeroCardCompact]}>
        <View style={sh.xpHeroBlob} />
        <View style={[sh.xpHeroTop, isCompactXp && sh.xpHeroTopCompact]}>
          <View style={[sh.xpAvatarRing, isCompactXp && sh.xpAvatarRingCompact]}>
            <AvatarIllustration avatar={activeProfile?.avatar ?? 'adaeze'} size={isCompactXp ? 72 : 92} />
          </View>

          <View style={sh.xpHeroCopy}>
            <Text style={sh.xpKicker}>XP JOURNEY</Text>
            <Text style={[sh.xpHeroTitle, isCompactXp && sh.xpHeroTitleCompact]}>{activeProfile?.name ?? 'Nwa Igbo'}</Text>
            <Text style={[sh.xpHeroSub, isCompactXp && sh.xpHeroSubCompact]}>Your Igbo superpowers are growing.</Text>
          </View>

          <View style={sh.xpPremiumPill}>
            <Text style={sh.xpPremiumText}>{getPlanLabel(state.isPremium)}</Text>
          </View>
        </View>

        <View style={sh.xpHeroProgressCard}>
          <View style={sh.xpHeroProgressTop}>
            <Text style={sh.xpHeroProgressTitle}>Learning map</Text>
            <Text style={sh.xpHeroProgressPercent}>{totalProgress}%</Text>
          </View>
          <View style={sh.xpHeroTrack}>
            <View style={[sh.xpHeroFill, { width: `${totalProgress}%` as any }]} />
          </View>
          <Text style={sh.xpHeroHint}>Complete lessons, quizzes, and practice to fill your map.</Text>
        </View>
      </View>

      <View style={[sh.xpStatGrid, isCompactXp && sh.xpStatGridCompact]}>
        {stats.map(stat => (
          <View key={stat.label} style={[sh.xpStatCard, isCompactXp && sh.xpStatCardCompact, { backgroundColor: stat.bg, borderColor: stat.accent + '55' }]}>
            <View style={[sh.xpStatIconBubble, { backgroundColor: stat.accent }]}>
              <Text style={sh.xpStatIcon}>{stat.icon}</Text>
            </View>
            <Text style={sh.xpStatValue}>{stat.value}</Text>
            <Text style={sh.xpStatLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={sh.xpSectionHeader}>
        <Text style={sh.xpSectionKicker}>LEVEL PROGRESS</Text>
        <Text style={sh.xpSectionTitle}>Keep climbing</Text>
      </View>

      {ALL_LEVELS.map(level => {
        const lc = LEVEL_COLOR[level.id];
        const progress = activeProfile?.levelProgress[level.id] ?? 0;

        return (
          <View key={level.id} style={[sh.xpLevelCard, isCompactXp && sh.xpLevelCardCompact, { backgroundColor: getLessonPathCardSurface(level.id).backgroundColor, borderColor: getLessonPathCardSurface(level.id).borderColor }]}>
            <View style={[sh.xpLevelArt, isCompactXp && sh.xpLevelArtCompact]}>
              {LEVEL_ICONS[level.id] ? (
                <Image source={LEVEL_ICONS[level.id]} style={[sh.xpLevelImage, isCompactXp && sh.xpLevelImageCompact]} resizeMode="contain" />
              ) : (
                <Text style={[sh.featureIcon, { color: lc.pip }]}>{level.level}</Text>
              )}
            </View>

            <View style={sh.xpLevelCopy}>
              <View style={sh.levelTopRow}>
                <Text style={[sh.levelBadge, { color: lc.text }]}>{level.level}</Text>
                <Text style={sh.xpLevelStar}>⭐</Text>
                <Text style={[sh.xpLevelPercent, { color: lc.pip }]}>{Math.round(progress * 100)}%</Text>
              </View>
              <Text style={[sh.xpLevelName, isCompactXp && sh.xpLevelNameCompact]}>{level.title}</Text>
              <View style={sh.xpLevelTrack}>
                <View style={[sh.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: lc.pip }]} />
              </View>
            </View>
          </View>
        );
      })}

      <View style={sh.xpSectionHeader}>
        <Text style={sh.xpSectionKicker}>THIS WEEK</Text>
        <Text style={sh.xpSectionTitle}>Streak garden</Text>
      </View>

      <View style={sh.xpWeekCard}>
        {DAYS.map((day, i) => {
          const active = HEIGHTS[i] >= 70;
          return (
            <View key={`${day}-${i}`} style={sh.xpDayColumn}>
              <View style={[sh.xpDayGem, active && sh.xpDayGemActive, { height: Math.max(18, HEIGHTS[i]) }]} />
              <Text style={[sh.xpDayLabel, active && sh.xpDayLabelActive]}>{day}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}


function isQuizNumberItem(item: { english?: string }): boolean {
  return /^\d+\s*[—-]/.test(String(item.english || '').trim());
}


function getQuizOptionLabel(item: { english?: string }): string {
  return isQuizNumberItem(item) ? getNumberEnglish(String(item.english || '')) : String(item.english || '');
}

// ─── QUIZ SCREEN ──────────────────────────────────────────────────────────────
function QuizScreen({ onBack, onPremium }: { onBack: () => void; onPremium: () => void }) {
  const { state, updateQuizBest, addWordsLearned } = useApp();
  const hasFullAccess = hasPremiumEntitlement(state.isPremium);
  const pool = buildQuizPool(hasFullAccess);
  const [question, setQuestion] = useState<VocabItem | null>(null);
  const [options, setOptions] = useState<VocabItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const wiggle = useWiggle();

  const next = useCallback(() => {
    const correct = randomFrom(pool);
    const numberQuestion = isQuizNumberItem(correct);

    const sameFamilyWrong = pool.filter(item =>
      item.igbo !== correct.igbo && isQuizNumberItem(item) === numberQuestion
    );

    const fallbackWrong = pool.filter(item => item.igbo !== correct.igbo);
    const wrongSource = sameFamilyWrong.length >= 3 ? sameFamilyWrong : fallbackWrong;
    const wrong = shuffle(wrongSource).slice(0, 3);

    setQuestion(correct);
    setOptions(shuffle([correct, ...wrong]));
    setFeedback(null);
  }, [pool]);

  useEffect(() => {
    next();
  }, []);

  function check(sel: VocabItem) {
    if (!question) return;

    if (sel.igbo === question.igbo) {
      const nextStreak = streak + 1;
      playSfx('correct', state.soundEnabled);
      setStreak(nextStreak);
      setRound(current => current + 1);
      updateQuizBest(nextStreak);
      addWordsLearned(1);
      setFeedback({ text: 'Correct. Keep going!', correct: true });
      wiggle.trigger();
      setTimeout(next, 950);
      return;
    }

    playSfx('wrong', state.soundEnabled);
    setStreak(0);
    setFeedback({
      text: `Almost. That means ${getQuizOptionLabel(sel)}.`,
      correct: false,
    });
  }

  if (!question) return null;

  const numberQuestion = isQuizNumberItem(question);
  const promptColor = numberQuestion ? getNumberCardColor(round) : { bg: '#F0E7FF', accent: COLOR.purple };

  return (
    <View style={sh.quizModeRoot}>
      <View style={sh.quizModeHeader}>
        <TouchableOpacity onPress={onBack} style={sh.quizBackBtn} accessibilityLabel="Go back">
          <Text style={sh.quizBackText}>‹</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={sh.quizKicker}>Daily Challenge</Text>
          <Text style={sh.quizModeTitle}>Quiz Mode</Text>
        </View>

        <View style={sh.quizRoundPill}>
          <Text style={sh.quizRoundText}>Round {round}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={sh.quizModePad} showsVerticalScrollIndicator={false}>
        <Animated.View style={[sh.quizStreakCard, wiggle.style]}>
          <View style={sh.quizStreakIcon}>
            <Text style={sh.quizStreakIconText}>⭐</Text>
          </View>
          <View>
            <Text style={sh.quizStreakLabel}>Current streak</Text>
            <Text style={sh.quizStreakValue}>{streak}</Text>
          </View>
        </Animated.View>

        <View style={[sh.quizPromptPremium, { backgroundColor: promptColor.bg, borderColor: promptColor.accent + '55' }]}>
          <Text style={[sh.quizPromptLabel, { color: promptColor.accent }]}>
            Find the match for
          </Text>

          <Text style={[sh.quizPromptWord, { color: promptColor.accent }]}>
            {question.igbo}
          </Text>

          <Text style={sh.quizPromptHint}>
            {numberQuestion ? 'What number is this?' : 'Choose the correct meaning below.'}
          </Text>
        </View>

        {feedback && (
          <View style={[sh.quizFeedbackCard, feedback.correct ? sh.quizFeedbackGood : sh.quizFeedbackBad]}>
            <Text style={sh.quizFeedbackText}>{feedback.text}</Text>
          </View>
        )}

        <View style={sh.quizPremiumGrid}>
          {options.map((opt, i) => {
            const numberOption = isQuizNumberItem(opt);
            const optionColor = numberOption ? getNumberCardColor(i) : getNumberCardColor(i + round);
            const label = getQuizOptionLabel(opt);

            return (
              <TouchableOpacity
                key={`${opt.igbo}-${i}`}
                style={[
                  sh.quizPremiumOption,
                  { backgroundColor: optionColor.bg, borderColor: optionColor.accent + '55' },
                ]}
                onPress={() => check(opt)}
                accessibilityLabel={label}
                activeOpacity={0.82}
              >
                <View style={[sh.quizOptionIconBubble, { backgroundColor: COLOR.card }]}>
                  {numberOption ? (
                    <Text style={[sh.quizOptionNumber, { color: optionColor.accent }]}>
                      {getNumberValue(opt.english)}
                    </Text>
                  ) : (
                    <Text style={sh.quizOptionEmoji}>{opt.emoji ?? '❓'}</Text>
                  )}
                </View>

                <Text style={sh.quizOptionLabel} numberOfLines={2}>
                  {label}
                </Text>

                <Text style={[sh.quizOptionTap, { color: optionColor.accent }]}>
                  Tap answer
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {shouldShowUpgradePrompt(state.isPremium) && (
          <TouchableOpacity style={sh.quizPremiumNudge} onPress={onPremium} activeOpacity={0.86}>
            <Text style={sh.quizPremiumNudgeTitle}>Unlock more quiz words</Text>
            <Text style={sh.quizPremiumNudgeText}>Premium adds more lessons, games, stories, and songs.</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}


// ─── SAY IT BACK SCREEN ───────────────────────────────────────────────────────
function SayItBackScreen({ onBack }: { onBack: () => void }) {
  const { activeProfile } = useApp();
  const pool = ALL_LEVELS.find(l => l.id === '4A')!.sections[0].items;
  const [target, setTarget]       = useState(pool[0]);
  const [recording, setRec]       = useState(false);
  const [done, setDone]           = useState(false);
  const [recordingObj, setRecObj] = useState<any>(null);
  const [playbackUri, setPlayUri] = useState<string | null>(null);
  const profileName = activeProfile?.name ?? 'you';

  function next() {
    setTarget(randomFrom(pool));
    setRec(false); setDone(false);
    setPlayUri(null); setRecObj(null);
  }
  useEffect(() => { next(); }, []);

  async function toggleMic() {
    if (!Audio) {
      Alert.alert('Audio unavailable', 'Please install expo-av to enable recording.');
      return;
    }
    if (!recording) {
      try {
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Please allow microphone access in your device settings.');
          return;
        }
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: rec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecObj(rec);
        setRec(true); setDone(false);
      } catch (e) {
        Alert.alert('Mic error', 'Could not start recording. Check microphone permissions in Settings.');
      }
    } else {
      try {
        await recordingObj?.stopAndUnloadAsync();
        const uri = recordingObj?.getURI() ?? null;
        setPlayUri(uri);
        setRec(false); setDone(true);
      } catch (e) {
        setRec(false); setDone(false);
      }
    }
  }

  async function playback() {
    if (!Audio || !playbackUri) return;
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri: playbackUri });
      await sound.playAsync();
    } catch (e) {
      Alert.alert('Playback error', 'Could not play the recording.');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <InnerHeader title="Say It Back 🗣️" onBack={onBack} />
      <ScrollView contentContainerStyle={[sh.gamePad, { alignItems: 'center' }]}>
        <Text style={{ fontSize: FONT.sm, color: COLOR.textSecond, marginBottom: SPACE.md }}>
          Listen, then say it back!
        </Text>
        <View style={sh.sayCard}>
          <Text style={{ fontSize: 64, marginBottom: 8 }}>{target.emoji}</Text>
          <Text style={sh.sayIgbo}>{target.igbo}</Text>
          <Text style={sh.sayEn}>({target.english})</Text>
          {target.example && (
            <Text style={sh.vocabExample}>"{target.example}"</Text>
          )}
          <TouchableOpacity style={sh.listenBtn}
            onPress={() => playSoundFallback(target.igbo)}
            accessibilityLabel="Listen to pronunciation">
            <Text style={sh.listenBtnText}>🔊 Listen</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[sh.micBtn, recording && sh.micBtnRecording]}
          onPress={toggleMic}
          accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
        >
          <Text style={{ fontSize: 36 }}>{recording ? '🟥' : '🎙️'}</Text>
          <Text style={sh.micStatus}>{recording ? `Recording ${profileName}...` : 'Tap to speak'}</Text>
        </TouchableOpacity>
        {done && (
          <View style={sh.playbackRow}>
            <TouchableOpacity style={sh.pbBtn} onPress={playback}>
              <Text style={sh.pbBtnText}>▶️ Play back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[sh.pbBtn, { backgroundColor: COLOR.clay }]} onPress={next}>
              <Text style={sh.pbBtnText}>Next word ➡️</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function FolktalesScreen({ onBack, onPremium }: { onBack: () => void; onPremium: () => void }) {
  return (
    <View style={sh.storyHutRoot}>
      <InnerHeader title="Story Hut 📚" onBack={onBack} />

      <ScrollView
        style={sh.storyHutRoot}
        contentContainerStyle={sh.storyHutScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={sh.storyHutHero}>
          <View style={sh.storyCloudOne} />
          <View style={sh.storyCloudTwo} />
          <View style={sh.storySunDot} />

          <Text style={sh.storyHutKicker}>IGBO STORY HUT</Text>
          <Text style={sh.storyHutTitle}>Igbo Folktales</Text>
          <Text style={sh.storyHutSub}>
            Step into the story garden for animal tales, wisdom, courage, and kindness.
          </Text>

          <View style={sh.storyHeroChips}>
            <Text style={sh.storyHeroChip}>🐢 Mbe</Text>
            <Text style={sh.storyHeroChip}>🦁 Ọdụm</Text>
            <Text style={sh.storyHeroChip}>🐍 Eke</Text>
          </View>
        </View>

        {IGBO_FOLKTALES.map((story, index) => (
          <TouchableOpacity
            key={story.id}
            style={[sh.folktaleCard, index % 2 === 0 ? sh.folktaleCardSky : sh.folktaleCardSun]}
            activeOpacity={0.88}
          >
            <View style={sh.folktaleCardTop}>
              <View style={sh.folktaleAnimalBadge}>
                <AnimalIllustration animal={story.animal} size={86} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={sh.folktaleCharacter}>{story.character}</Text>
                <Text style={sh.folktaleTitle}>{story.title}</Text>
                <Text style={sh.folktaleSubtitle}>{story.subtitle}</Text>
              </View>
            </View>

            <View style={sh.folktaleMoralPill}>
              <Text style={sh.folktaleMoralLabel}>MORAL</Text>
              <Text style={sh.folktaleMoralText}>{story.moral}</Text>
            </View>

            <Text style={sh.folktaleBody}>{story.story}</Text>

            <View style={sh.storyReadPill}>
              <Text style={sh.storyReadPillText}>Read story ✨</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

// ─── Level Detail Styles ──────────────────────────────────────────────────────
const ld = StyleSheet.create({
  header: {
    backgroundColor: COLOR.forest,
    paddingTop: 52, paddingBottom: 20,
    paddingHorizontal: SPACE.lg,
    flexDirection: 'row', alignItems: 'flex-end',
    minHeight: 140, overflow: 'hidden',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACE.sm, marginBottom: 4, flexShrink: 0,
  },
  backText: { fontSize: 20, color: COLOR.textWhite, fontWeight: '700' },
  headerText: { flex: 1, paddingBottom: 4 },
  headerTitle: {
    fontSize: FONT.xxl, fontWeight: '900',
    color: COLOR.textWhite, lineHeight: 30,
  },
  headerIgbo: {
    fontSize: FONT.md, color: COLOR.gold,
    fontWeight: '700', marginTop: 4,
  },
  heroKid: {
    width: 110, height: 110,
    position: 'absolute', right: 0, bottom: 0,
  },

  tabsWrap: {
    backgroundColor: '#FAF7F0',
    borderBottomWidth: 1, borderBottomColor: '#EDE8DC',
  },
  tabsRow: {
    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm,
    gap: SPACE.sm, flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.pill, borderWidth: 1.5,
    borderColor: COLOR.border,
    backgroundColor: '#FAF7F0',
  },
  tabEmoji: { fontSize: 16 },
  tabText: { fontSize: FONT.sm, fontWeight: '600', color: COLOR.textSecond },

  listPad: { paddingHorizontal: SPACE.md, paddingTop: SPACE.lg },
  secTitle: {
    fontSize: FONT.xxl, fontWeight: '900',
    color: COLOR.textPrimary, marginBottom: 2,
  },
  secIgbo: {
    fontSize: FONT.md, fontStyle: 'italic',
    fontWeight: '600', marginBottom: SPACE.lg,
  },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.lg, marginBottom: SPACE.sm,
    padding: SPACE.sm,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  tile: {
    width: 64, height: 64, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  tileEmoji: { fontSize: 36 },

  igboWord: { fontSize: FONT.xl, fontWeight: '900', color: COLOR.textPrimary },
  engWord:  { fontSize: FONT.sm, color: COLOR.textSecond, marginTop: 2 },
  example:  { fontSize: FONT.xs, fontStyle: 'italic', marginTop: 3 },

  soundBtn: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  soundIcon: { fontSize: 18 },
});

const sh = StyleSheet.create({
  adventurePickerScreenScroll: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 120,
  },
  adventurePickerScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  adventurePickerBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DDF6FF',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  adventurePickerBackText: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '900',
    color: '#1B2A6B',
    marginTop: -2,
  },

  adventureVoiceBadge: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    flexShrink: 0,
  },
  adventureModeBadge: {
    width: 94,
    height: 94,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    flexShrink: 0,
  },
  adventureIconTile: {
    width: 118,
    height: 118,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  adventureSheetImage: {
    width: 114,
    height: 114,
  },
  adventurePortalImage: {
    borderRadius: 28,
    backgroundColor: '#F0E3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeStickerIcon: {
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    transform: [{ rotate: '-2deg' }],
  },
  homeStickerIconPlay: {
    backgroundColor: '#F0E3FF',
    borderColor: '#D7B8FF',
  },
  homeStickerIconLesson: {
    backgroundColor: '#E8FBFF',
    borderColor: '#A9EFFB',
  },
  homeStickerSparkle: {
    position: 'absolute',
    right: -8,
    top: -8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD33D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  homeStickerSparkleText: {
    color: '#1B2A6B',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '900',
  },


  folktaleBody: {
    color: '#375A72',
    fontSize: FONT.md,
    lineHeight: 25,
    fontWeight: '700',
  },
  folktaleMoralText: {
    color: '#1B2A6B',
    fontSize: FONT.sm,
    fontWeight: '900',
    lineHeight: 20,
  },
  folktaleMoralLabel: {
    color: '#7A45D8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  folktaleMoralPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 42, 107, 0.08)',
    marginBottom: SPACE.md,
  },
  folktaleSubtitle: {
    color: '#436B8A',
    fontSize: FONT.sm,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 5,
  },
  folktaleTitle: {
    color: '#1B2A6B',
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  folktaleCharacter: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFE6F0',
    color: '#F64F72',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  folktaleAnimalBadge: {
    width: 106,
    height: 106,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(27, 42, 107, 0.08)',
    overflow: 'visible',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  folktaleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: SPACE.md,
  },
  folktaleCardSun: {
    backgroundColor: '#FFF1B8',
    borderColor: 'rgba(255, 166, 43, 0.34)',
  },
  folktaleCardSky: {
    backgroundColor: '#F2E9FF',
    borderColor: 'rgba(122, 69, 216, 0.24)',
  },
  folktaleCard: {
    borderRadius: 40,
    padding: SPACE.md,
    borderWidth: 2,
    marginBottom: SPACE.lg,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    overflow: 'visible',
  },
  storyHutRoot: {
    flex: 1,
    backgroundColor: '#FFF7E8',
  },
  storyHutScroll: {
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.lg,
    paddingBottom: 150,
    backgroundColor: '#FFF7E8',
  },
  storyHutHero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 40,
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.xl,
    paddingBottom: SPACE.lg,
    backgroundColor: '#DDF6FF',
    borderWidth: 2,
    borderColor: 'rgba(49, 189, 237, 0.32)',
    marginBottom: SPACE.lg,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  storyHutKicker: {
    color: '#F64F72',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.9,
    marginBottom: 7,
  },
  storyHutTitle: {
    color: '#7A45D8',
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  storyHutSub: {
    color: '#1B2A6B',
    fontSize: FONT.md,
    lineHeight: 23,
    fontWeight: '800',
    marginTop: 9,
    maxWidth: 310,
  },

  storyCard: {
    borderRadius: RADIUS.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: COLOR.border, marginBottom: 30,
  },
  storyCardSky: {
    backgroundColor: '#DDF6FF',
    borderColor: 'rgba(49, 189, 237, 0.30)',
  },
  storyCardSun: {
    backgroundColor: '#FFF1B8',
    borderColor: 'rgba(255, 166, 43, 0.34)',
  },
  storyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: SPACE.md,
  },
  storyAnimalBadge: {
    width: 100,
    height: 100,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(27, 42, 107, 0.08)',
    overflow: 'visible',
  },
  storyCharacter: {
    color: '#F64F72',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  storyTitle: {
    color: '#1B2A6B',
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  storySubtitle: {
    color: '#436B8A',
    fontSize: FONT.sm,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  storyMoralPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 42, 107, 0.08)',
    marginBottom: SPACE.md,
  },
  storyMoralLabel: {
    color: '#7A45D8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  storyMoralText: {
    color: '#1B2A6B',
    fontSize: FONT.sm,
    fontWeight: '900',
    lineHeight: 20,
  },
  storyBody: { backgroundColor: COLOR.card, padding: SPACE.md },

  profileSheetAddText: {
    color: KIDS_COLOR.white,
    fontSize: FONT.sm,
    fontWeight: '900',
  },
  profileSheetAdd: {
    marginTop: 14,
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.forestGreen,
  },
  profileSheetSelected: {
    color: KIDS_COLOR.palmGreen,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
  },
  profileSheetName: {
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.sm,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
  },
  profileSheetCardActive: {
    backgroundColor: '#FFF2C7',
    borderColor: KIDS_COLOR.mango,
  },
  profileSheetCard: {
    width: '31.5%',
    minHeight: 126,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.white,
    borderWidth: 1.5,
    borderColor: KIDS_COLOR.borderSoft,
    padding: 8,
  },
  profileSheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profileSheetTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: 2,
    marginBottom: 14,
  },
  profileSheetKicker: {
    color: KIDS_COLOR.mango,
    fontSize: FONT.xs,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  profileSheetHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(18, 59, 42, 0.18)',
    marginBottom: 14,
  },
  profileSheet: {
    backgroundColor: KIDS_COLOR.palmCream,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: SPACE.md,
    paddingTop: 12,
    paddingBottom: 34,
  },
  profileSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 59, 39, 0.28)',
    justifyContent: 'flex-end',
  },
  activePlayerChevron: {
    display: 'none',
  },
  appHeaderTop: {
    display: 'none',
  },
  appTitleWrap: {
    display: 'none',
  },
  parentCenterBtn: {
    display: 'none',
  },
  parentCenterKicker: {
    display: 'none',
  },
  parentCenterText: {
    display: 'none',
  },
  kidsHomeRoot: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  kidsHomeScroll: {
    paddingTop: 8,
    paddingBottom: 128,
    position: 'relative',
  },
  profileSwitcherScroll: {
    maxWidth: 0,
    height: 0,
  },
  profileSwitcherRail: {
    gap: 0,
    paddingRight: 0,
  },
  profileAvatarPill: {
    display: 'none',
  },
  profileAvatarPillActive: {
    display: 'none',
  },
  profileAvatarPillText: {
    display: 'none',
  },
  profileAvatarPillTextActive: {
    display: 'none',
  },
  homeBgSun: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 210, 74, 0.20)',
    right: -78,
    top: 38,
  },
  homeBgCloudOne: {
    position: 'absolute',
    width: 150,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(221, 246, 255, 0.70)',
    left: -72,
    top: 260,
  },
  homeBgCloudTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(242, 233, 255, 0.52)',
    right: -64,
    top: 540,
  },
  homeBgConfettiOne: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(246, 79, 114, 0.22)',
    left: 24,
    top: 430,
  },
  homeBgConfettiTwo: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(122, 69, 216, 0.18)',
    right: 32,
    top: 760,
  },
  kidsHeroCard: {
    ...KIDS_SHADOW.softCard,
    borderRadius: 34,
    padding: SPACE.md,
    marginBottom: SPACE.lg,
    backgroundColor: KIDS_COLOR.softSky,
    borderWidth: 1.5,
    borderColor: 'rgba(49, 189, 237, 0.28)',
  },
  kidsHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  kidsHeroAvatarWrap: {
    width: 104,
    height: 104,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },
  kidsHeroCopy: {
    flex: 1,
    minWidth: 0,
  },
  kidsHeroKicker: {
    color: KIDS_COLOR.mango,
    fontSize: FONT.xs,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  kidsHeroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: '#1B2A6B',
    letterSpacing: -0.7,
    flexShrink: 1,
    maxWidth: '100%',
  },
  kidsHeroTitleCompact: {
    fontSize: 28,
    lineHeight: 33,
  },
  kidsHeroTitleLong: {
    fontSize: 29,
    lineHeight: 34,
    letterSpacing: -0.55,
  },
  kidsHeroTitleVeryLong: {
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -0.35,
  },
  kidsHeroSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  kidsPremiumBadge: { position: 'absolute', top: -8, right: 10, backgroundColor: KIDS_COLOR.sunshine, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: KIDS_COLOR.mango },
  kidsPremiumBadgeText: { color: KIDS_COLOR.deepForest, fontSize: FONT.xs, fontWeight: '900' },
  kidsStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  kidsStatChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: RADIUS.pill, backgroundColor: 'transparent', borderWidth: 1, borderColor: KIDS_COLOR.borderSoft },
  kidsStatEmoji: { fontSize: 15, marginRight: 5 },
  kidsStatText: { color: KIDS_COLOR.textPrimary, fontSize: FONT.xs, fontWeight: '900' },
  kidsQuestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFE6F0',
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FFB8CA',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 24,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  kidsQuestIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD24A',
    borderWidth: 2,
    borderColor: '#FFF1B8',
    flexShrink: 0,
  },
  kidsQuestIconText: {
    fontSize: 34,
  },
  kidsQuestKicker: {
    color: '#F64F72',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 2.6,
  },
  kidsQuestTitle: {
    color: '#1B2A6B',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: -0.45,
    marginTop: 2,
  },
  kidsQuestSub: {
    color: '#326C92',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
    marginTop: 3,
  },
  kidsQuestArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    color: '#1B2A6B',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    flexShrink: 0,
  },
  kidsSectionHeader: { marginBottom: 10, marginTop: 4 },
  kidsSectionLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#F64F72',
  },
  kidsSectionTitle: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
    color: '#7A45D8',
    letterSpacing: -0.65,
  },
  kidsFeatureRail: {
    gap: 15,
    paddingHorizontal: 2,
    paddingTop: 4,
    paddingBottom: 14,
  },
  kidsFeatureCard: {
    width: 174,
    minHeight: 214,
    borderRadius: 40,
    padding: 16,
    borderWidth: 2,
    justifyContent: 'space-between',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  kidsFeatureBubble: {
    width: 76,
    height: 76,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.md,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  kidsFeatureIcon: {
    fontSize: 36,
  },
  kidsFeatureTitle: {
    color: '#1B2A6B',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginTop: 2,
    marginBottom: 6,
  },
  kidsFeatureSub: {
    color: '#436B8A',
    fontSize: FONT.sm,
    lineHeight: 20,
    fontWeight: '800',
  },
  kidsLevelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#DDE5F4',
    paddingVertical: 18,
    paddingLeft: 18,
    paddingRight: 18,
    marginBottom: 24,
    minHeight: 166,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  kidsLevelPip: {
    width: 132,
    height: 132,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    backgroundColor: 'transparent',
    borderWidth: 0,
    flexShrink: 0,
  },
  kidsLevelName: {
    fontSize: FONT.xl,
    fontWeight: '900',
    color: KIDS_COLOR.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.5,
  },
  kidsLevelSub: {
    fontSize: FONT.sm,
    color: KIDS_COLOR.textSecondary,
    marginTop: 1,
    lineHeight: 20,
    fontWeight: '800',
  },
  kidsProgressTrack: {
    height: 9,
    backgroundColor: '#EAF0E8',
    borderRadius: 999,
    marginTop: 12,
    overflow: 'hidden',
  },
  kidsChevron: { fontSize: 34, color: KIDS_COLOR.textSoft, fontWeight: '900' },
  root: {
    flex: 1,
    backgroundColor: KIDS_COLOR.palmCream,
  },
  appHeader: {
    display: 'none',
  },
  appHeaderLeft: {
    display: 'none',
  },
  logoBadge: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLOR.gold, alignItems: 'center', justifyContent: 'center',
  },
  appTitle: {
    display: 'none',
  },
  appSub: {
    display: 'none',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  gearBtn: {
    display: 'none',
  },
  parentBtnText: {
    color: KIDS_COLOR.deepForest,
    fontSize: FONT.xs,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profileRow: {
    display: 'none',
  },
  profilePill: {
    backgroundColor: COLOR.gold,
    borderRadius: RADIUS.pill,
    paddingVertical: 9,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  profilePillActive: { backgroundColor: COLOR.gold },
  profilePillText: {
    fontSize: FONT.sm,
    color: COLOR.forestDark,
    fontWeight: '900',
  },
  bottomNav: {
    width: '100%',
    maxWidth: 560,
    minHeight: 78,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 2,
    borderColor: 'rgba(221, 229, 244, 0.95)',
    borderRadius: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  navBtn: {
    flex: 1,
    minHeight: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 8,
  },
  navBtnActive: {
    backgroundColor: '#FFF1B8',
  },
  navIcon: {
    fontSize: 23,
    lineHeight: 27,
    textAlign: 'center',
  },
  navIconActive: {
    transform: [{ scale: 1.08 }],
  },
  navLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
    color: '#436B8A',
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#1B2A6B',
  },

  homeScroll: {
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.lg,
    paddingBottom: 128,
    backgroundColor: '#FFFDF6',
  },
  homeBgGrassOne: {
    position: 'absolute',
    width: 260,
    height: 118,
    borderRadius: 90,
    backgroundColor: 'rgba(25, 179, 107, 0.12)',
    left: -110,
    top: 980,
  },
  homeBgGrassTwo: {
    position: 'absolute',
    width: 235,
    height: 104,
    borderRadius: 82,
    backgroundColor: 'rgba(86, 229, 154, 0.10)',
    right: -96,
    top: 1220,
  },
  homeBgPawOne: {
    position: 'absolute',
    left: 20,
    top: 560,
    fontSize: 32,
    opacity: 0.13,
    transform: [{ rotate: '-18deg' }],
  },
  homeBgPawTwo: {
    position: 'absolute',
    right: 26,
    top: 1040,
    fontSize: 30,
    opacity: 0.12,
    transform: [{ rotate: '16deg' }],
  },
  homeBgLeafOne: {
    position: 'absolute',
    left: 24,
    top: 1320,
    fontSize: 34,
    opacity: 0.16,
    transform: [{ rotate: '-12deg' }],
  },
  homeBgStarOne: {
    position: 'absolute',
    right: 30,
    top: 420,
    fontSize: 34,
    color: '#FFD33D',
    opacity: 0.24,
    transform: [{ rotate: '12deg' }],
  },
  homeBgStarTwo: {
    position: 'absolute',
    left: 34,
    top: 880,
    fontSize: 28,
    color: '#854CE6',
    opacity: 0.14,
    transform: [{ rotate: '-10deg' }],
  },

  greetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: '#D9FFE9',
    borderRadius: 34,
    padding: SPACE.md,
    marginBottom: SPACE.lg,
    borderWidth: 2,
    borderColor: '#56E59A',
    shadowColor: '#087443',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  greetName: {
    fontSize: FONT.xxl,
    fontWeight: '900',
    color: COLOR.forest,
    marginBottom: 4,
    letterSpacing: -0.6,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  streakText: { fontSize: FONT.sm, color: COLOR.textSecond },
  premiumChip: {
    backgroundColor: COLOR.goldLight, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLOR.goldBorder,
  },
  premiumChipText: { fontSize: FONT.xs, color: COLOR.clay, fontWeight: '700' },

  quizHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLOR.forest,
    borderRadius: 36,
    paddingVertical: SPACE.xl,
    paddingHorizontal: SPACE.lg,
    marginBottom: SPACE.xl,
    borderWidth: 2,
    borderColor: '#16864D',
    shadowColor: '#064C2C',
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 9,
  },
  quizTag: {
    fontSize: FONT.xs,
    color: COLOR.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '900',
    marginBottom: 4,
  },
  quizTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: COLOR.textCream,
    marginTop: 2,
    letterSpacing: -1,
  },
  quizSub: {
    fontSize: FONT.md,
    color: '#BCEED1',
    marginTop: 8,
    fontWeight: '900',
    lineHeight: 22,
  },
  quizBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLOR.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 7,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 7,
  },

  labRow: { flexDirection: 'row', gap: SPACE.sm, marginBottom: SPACE.md },
  labCard: {
    flex: 1, borderRadius: RADIUS.md, padding: SPACE.sm,
    borderWidth: 1, borderColor: COLOR.border, alignItems: 'center',
  },
  labEmoji: { fontSize: 26, marginBottom: 4 },
  labTitle: { fontSize: FONT.sm, fontWeight: '700', color: COLOR.textPrimary, textAlign: 'center' },
  labSub: { fontSize: FONT.xs, color: COLOR.textSecond, textAlign: 'center', marginTop: 2 },

  sectionLabel: {
    fontSize: FONT.xs,
    color: '#9A9587',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 4,
    marginTop: 2,
    fontWeight: '900',
  },
  levelCard: {
    ...KIDS_SHADOW.softCard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: KIDS_COLOR.white,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: KIDS_COLOR.borderSoft,
    padding: SPACE.md,
    marginBottom: SPACE.md,
    minHeight: 120,
  },
  levelCardLocked: { opacity: 0.65 },
  levelPipImage: {
    width: 124,
    height: 124,
  },
  levelPip: {
    width: 76,
    height: 76,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  levelTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  levelBadge: {
    fontSize: FONT.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  levelName: {
    fontSize: FONT.xl,
    fontWeight: '900',
    color: COLOR.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.5,
  },
  levelSub: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    marginTop: 1,
    lineHeight: 20,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLOR.border,
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  chevron: {
    fontSize: 34,
    color: COLOR.textHint,
    fontWeight: '900',
  },

  lockBadge: {
    backgroundColor: COLOR.lockedBg, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  lockIcon: { fontSize: 12 },
  premiumTag: {
    backgroundColor: COLOR.goldLight, paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: RADIUS.pill,
  },
  premiumTagText: { fontSize: 10 },

  innerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: '#1B2A6B',
    paddingHorizontal: SPACE.md,
    paddingVertical: 18,
    minHeight: 118,
  },
  innerBackBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    flexShrink: 0,
  },
  innerBackText: {
    fontSize: 36,
    lineHeight: 36,
    color: '#FFD33D',
    fontWeight: '900',
  },
  innerTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  innerKicker: {
    fontSize: FONT.xs,
    color: '#FFD33D',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 22 },
  innerTitle: {
    fontSize: FONT.xxl,
    color: '#FFF8E7',
    fontWeight: '900',
    flex: 1,
    letterSpacing: -0.6,
  },

  listPad: { padding: SPACE.md, paddingBottom: 60 },

  sectionTabs: { paddingHorizontal: SPACE.md, paddingTop: SPACE.md, paddingBottom: SPACE.md, gap: SPACE.sm, alignItems: 'center', backgroundColor: '#FFF8E7' },
  sectionTab: {
    minWidth: 156,
    minHeight: 50,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACE.md,
    marginRight: SPACE.sm,
  },
  sectionTabText: {
    fontSize: FONT.sm,
    color: COLOR.textPrimary,
    fontWeight: '900',
  },

  lessonHero: {
    minHeight: 132,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.lg,
    paddingBottom: SPACE.lg + SPACE.sm,
    gap: SPACE.md,
  },
  lessonBackBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  lessonBackText: {
    fontSize: 38,
    lineHeight: 38,
    color: COLOR.textWhite,
    fontWeight: '900',
  },
  lessonHeroCopy: {
    flex: 1,
  },
  lessonEyebrow: {
    fontSize: FONT.xs,
    color: COLOR.gold,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  lessonHeroTitle: {
    fontSize: FONT.xxl,
    color: COLOR.textWhite,
    fontWeight: '900',
    lineHeight: 30,
  },
  lessonHeroSub: {
    fontSize: FONT.md,
    color: COLOR.gold,
    fontWeight: '900',
    marginTop: 4,
  },
  lessonAvatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 26,
    overflow: 'visible',
    borderWidth: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  alphaIntroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    padding: SPACE.md,
    borderWidth: 1,
    borderColor: COLOR.border,
    marginBottom: SPACE.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  alphaIntroIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#EAF2FF',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 62,
    fontSize: FONT.lg,
    color: COLOR.forest,
    fontWeight: '900',
  },
  alphaIntroTitle: {
    fontSize: FONT.lg,
    color: COLOR.textPrimary,
    fontWeight: '900',
    marginBottom: 2,
  },
  alphaIntroBody: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    lineHeight: 20,
    fontWeight: '700',
  },
  alphaList: {
    gap: SPACE.md,
  },
  alphaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    padding: SPACE.md,
    minHeight: 96,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  alphaLetterBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphaLetter: {
    fontSize: 34,
    fontWeight: '900',
  },
  alphaCopy: {
    flex: 1,
  },
  alphaTitle: {
    fontSize: FONT.xl,
    color: COLOR.textPrimary,
    fontWeight: '900',
    marginBottom: 4,
  },
  alphaSound: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    fontWeight: '700',
    lineHeight: 20,
  },
  alphaListenBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphaListenText: {
    color: COLOR.textWhite,
    fontSize: FONT.md,
    fontWeight: '900',
  },

  levelDetailBgSun: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 210, 74, 0.16)',
    right: -78,
    top: 180,
  },
  levelDetailBgCloud: {
    position: 'absolute',
    width: 150,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(221, 246, 255, 0.58)',
    left: -76,
    top: 420,
  },
  vocabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F0FBFF',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#9DEBFF',
    paddingVertical: 13,
    paddingLeft: 14,
    paddingRight: 12,
    marginBottom: 14,
    minHeight: 112,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.085,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  vocabEmojiWrap: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#F0FBFF',
    flexShrink: 0,
  },
  vocabEmoji: { fontSize: 26 },
  vocabPortraitSlot: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.72)',
    flexShrink: 0,
  },
  vocabTextBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  vocabIgbo: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    color: '#1B2A6B',
    letterSpacing: -0.35,
  },
  vocabEn: {
    fontSize: 15,
    lineHeight: 20,
    color: '#596657',
    marginTop: 3,
    fontWeight: '800',
  },
  vocabExample: { fontSize: FONT.xs, color: COLOR.forest, marginTop: 3, fontStyle: 'italic' },

  progressTitle: { fontSize: FONT.xxl, fontWeight: '800', color: COLOR.textPrimary, marginBottom: SPACE.md },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm },
  statCard: {
    width: '47%', backgroundColor: COLOR.card,
    borderRadius: RADIUS.md, padding: SPACE.md,
    borderWidth: 1, borderColor: COLOR.border,
  },
  statLabel: { fontSize: FONT.sm, color: COLOR.textSecond },
  statValue: { fontSize: 26, fontWeight: '800', marginTop: 4 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: SPACE.sm,
  },
  progressRowLabel: { fontSize: FONT.sm, color: COLOR.textPrimary, fontWeight: '600' },
  barChart: {
    flexDirection: 'row', alignItems: 'flex-end', height: 80,
    backgroundColor: COLOR.card, borderRadius: RADIUS.md,
    padding: 12, gap: 6, borderWidth: 1, borderColor: COLOR.border,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  barFill: { width: '80%', backgroundColor: COLOR.success, borderRadius: 3 },
  barDay: { fontSize: FONT.xs, color: COLOR.textHint },

  gamePad: { padding: IS_TABLET ? SPACE.xl : SPACE.md, paddingBottom: 40, maxWidth: IS_TABLET ? 680 : undefined, alignSelf: IS_TABLET ? 'center' as const : undefined, width: '100%' },
  streakBanner: {
    borderRadius: RADIUS.pill, paddingVertical: 8, paddingHorizontal: 18,
    alignSelf: 'center', marginBottom: SPACE.md,
  },
  promptCard: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    padding: SPACE.md, alignItems: 'center', marginBottom: SPACE.sm,
  },
  promptSpeaker: { fontSize: FONT.sm, color: COLOR.textSecond },
  feedbackText: { fontSize: FONT.md, fontWeight: '800', textAlign: 'center', marginBottom: SPACE.sm },
  feedbackGood: { color: COLOR.success },
  feedbackBad: { color: COLOR.clay },

  quizGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm, justifyContent: 'space-between' },
  quizOpt: {
    width: '47%', backgroundColor: COLOR.card,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLOR.border,
    paddingVertical: 16, alignItems: 'center', gap: 5,
  },
  quizOptEmoji: { fontSize: 38 },
  quizOptLabel: { fontSize: FONT.sm, fontWeight: '700', color: COLOR.textPrimary, textAlign: 'center' },


  premiumNudge: {
    marginTop: SPACE.md, padding: SPACE.sm,
    backgroundColor: COLOR.goldLight,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLOR.goldBorder,
    alignItems: 'center',
  },
  premiumNudgeText: { fontSize: FONT.sm, color: COLOR.clay, fontWeight: '700' },

  sayCard: {
    width: '100%', backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLOR.border,
    alignItems: 'center', padding: SPACE.lg, marginBottom: SPACE.lg,
  },
  sayIgbo: { fontSize: 30, fontWeight: '800', color: COLOR.textPrimary },
  sayEn: { fontSize: FONT.md, color: COLOR.textSecond, fontStyle: 'italic', marginTop: 4 },
  listenBtn: {
    marginTop: SPACE.md, backgroundColor: COLOR.purpleLight,
    borderRadius: RADIUS.pill, borderWidth: 1, borderColor: '#C8A8F0',
    paddingVertical: 10, paddingHorizontal: 20,
  },
  listenBtnText: { fontSize: FONT.md, fontWeight: '700', color: COLOR.purple },
  micBtn: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLOR.forest,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  micBtnRecording: { backgroundColor: COLOR.clay },
  micStatus: { fontSize: FONT.xs, color: '#F0E8D0', fontWeight: '600', textAlign: 'center', paddingHorizontal: 8 },
  playbackRow: { flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.lg, width: '100%' },
  pbBtn: {
    flex: 1, backgroundColor: COLOR.success,
    borderRadius: RADIUS.md, paddingVertical: 12, alignItems: 'center',
  },
  pbBtnText: { color: COLOR.textWhite, fontWeight: '700', fontSize: FONT.sm },
  storyCover: { backgroundColor: COLOR.forestDark, padding: SPACE.lg, alignItems: 'center' },
  storyCoverTitle: { fontSize: FONT.xl, fontWeight: '800', color: COLOR.textCream, textAlign: 'center' },
  storyCoverSub: { fontSize: FONT.sm, color: '#7AB897', marginTop: 4, textAlign: 'center' },
  storyListenBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: 10, backgroundColor: COLOR.forestLight,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#B0D8BE', marginBottom: SPACE.md,
  },
  storyListenText: { fontSize: FONT.sm, fontWeight: '700', color: COLOR.forest },
  storyText: { fontSize: FONT.md, color: COLOR.textPrimary, lineHeight: 26 },
  moralBox: {
    marginTop: SPACE.md, padding: SPACE.md,
    backgroundColor: COLOR.goldLight, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLOR.goldBorder,
  },
  moralText: { fontSize: FONT.sm, fontWeight: '700', color: '#7A5A0A', textAlign: 'center' },

  taleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLOR.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLOR.border,
    padding: SPACE.md, marginBottom: SPACE.sm,
  },
  taleCover: {
    width: 60, height: 60, borderRadius: RADIUS.sm,
    backgroundColor: COLOR.forestLight, alignItems: 'center', justifyContent: 'center',
  },
  taleName: { fontSize: FONT.md, fontWeight: '800', color: COLOR.textPrimary },
  taleSub: { fontSize: FONT.xs, color: COLOR.textSecond, marginTop: 3 },

  numCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLOR.card, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLOR.border,
    paddingVertical: 12, paddingHorizontal: SPACE.md, marginBottom: SPACE.sm,
  },
  numDigit: { fontSize: 24, fontWeight: '800', color: COLOR.forest, width: 50 },
  sectionHeading: {
    fontSize: FONT.lg,
    fontWeight: '900',
    color: COLOR.textPrimary,
    marginBottom: 2,
  },
  sectionSubHeading: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    marginBottom: SPACE.md,
    fontStyle: 'italic',
    fontWeight: '700',
  },

  grammarTextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFDF6',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFE8A3',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    minHeight: 96,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.075,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  pairCard: {
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    padding: SPACE.md,
    minHeight: 210,
    marginBottom: SPACE.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  pairColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  pairPictureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    marginBottom: SPACE.md,
  },
  pairPictureBox: {
    flex: 1,
    minHeight: 86,
    borderRadius: RADIUS.lg,
    backgroundColor: '#EAFBF9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFEDEA',
  },
  pairPicture: {
    fontSize: 46,
    textAlign: 'center',
  },
  pairManyPicture: {
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 38,
  },
  pairArrowBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLOR.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLOR.goldBorder,
  },
  pairArrow: {
    color: COLOR.clay,
    fontSize: FONT.lg,
    fontWeight: '900',
  },
  pairWordRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  pairDivider: {
    width: 1,
    backgroundColor: COLOR.border,
    marginHorizontal: SPACE.md,
  },
  pairLabel: {
    fontSize: FONT.xs,
    color: COLOR.textHint,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  pairIgbo: {
    fontSize: FONT.lg,
    color: COLOR.textPrimary,
    fontWeight: '900',
    marginBottom: 4,
  },
  pairEnglish: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    fontWeight: '700',
  },
  vocabAudioButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#9DEBFF',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    flexShrink: 0,
  },
  vocabAudio: {
    fontSize: 0,
    width: 0,
    height: 0,
  },

  featureHeaderRow: {
    marginTop: SPACE.xs,
    marginBottom: SPACE.sm,
  },
  featureHeaderTitle: {
    fontSize: FONT.md,
    color: COLOR.textPrimary,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  featureRailScroll: {
    marginHorizontal: -SPACE.md,
    marginBottom: SPACE.xl,
  },
  featureRail: {
    paddingHorizontal: SPACE.md,
    gap: SPACE.md,
  },
  featureCard: {
    width: 136,
    minHeight: 150,
    borderRadius: 30,
    borderWidth: 2,
    padding: SPACE.md,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  featureIconBubble: {
    width: 60,
    height: 60,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.sm,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  featureIcon: {
    fontSize: 32,
  },
  featureTitle: {
    fontSize: FONT.md,
    color: COLOR.textPrimary,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  featureSub: {
    fontSize: FONT.xs,
    color: COLOR.textSecond,
    fontWeight: '800',
    lineHeight: 17,
    marginTop: 3,
  },

  numberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: COLOR.card,
    borderRadius: 28,
    borderWidth: 2,
    padding: SPACE.md,
    minHeight: 118,
    marginBottom: SPACE.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  numberBadge: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numberDigit: {
    fontSize: 34,
    fontWeight: '900',
  },
  numberCopy: {
    flex: 1,
  },
  numberIgbo: {
    fontSize: FONT.xl,
    color: COLOR.textPrimary,
    fontWeight: '900',
    marginBottom: 2,
  },
  numberEnglish: {
    fontSize: FONT.md,
    color: COLOR.textSecond,
    fontWeight: '800',
    marginBottom: 8,
  },
  numberMiniPill: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  numberMiniText: {
    fontSize: FONT.xs,
    fontWeight: '900',
  },
  numberSoundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numberSoundText: {
    color: COLOR.textWhite,
    fontSize: FONT.md,
    fontWeight: '900',
  },

  quizNumberBadge: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.sm,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  quizNumberDigit: {
    fontSize: 30,
    fontWeight: '900',
  },

  quizModeRoot: {
    flex: 1,
    backgroundColor: COLOR.bg,
  },
  quizModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: COLOR.forestDark,
    paddingHorizontal: SPACE.md,
    paddingVertical: 18,
  },
  quizBackBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  quizBackText: {
    fontSize: 36,
    lineHeight: 36,
    color: COLOR.gold,
    fontWeight: '900',
  },
  quizKicker: {
    fontSize: FONT.xs,
    color: COLOR.gold,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  quizModeTitle: {
    fontSize: FONT.xxl,
    color: COLOR.textCream,
    fontWeight: '900',
  },
  quizRoundPill: {
    backgroundColor: COLOR.gold,
    borderRadius: RADIUS.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quizRoundText: {
    color: COLOR.forestDark,
    fontSize: FONT.xs,
    fontWeight: '900',
  },
  quizModePad: {
    padding: SPACE.md,
    paddingBottom: 90,
  },
  quizStreakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: SPACE.sm,
    backgroundColor: '#F0E7FF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#D8C2FF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: SPACE.md,
  },
  quizStreakIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLOR.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizStreakIconText: {
    fontSize: 24,
  },
  quizStreakLabel: {
    fontSize: FONT.xs,
    color: COLOR.textHint,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  quizStreakValue: {
    fontSize: FONT.xl,
    color: COLOR.purple,
    fontWeight: '900',
  },
  quizPromptPremium: {
    borderRadius: 30,
    borderWidth: 2,
    padding: SPACE.lg,
    alignItems: 'center',
    marginBottom: SPACE.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  quizPromptLabel: {
    fontSize: FONT.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: SPACE.sm,
  },
  quizPromptNumberBadge: {
    width: 78,
    height: 78,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.sm,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  quizPromptNumberDigit: {
    fontSize: 36,
    fontWeight: '900',
  },
  quizPromptWord: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  quizPromptHint: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    fontWeight: '800',
    textAlign: 'center',
  },
  quizFeedbackCard: {
    borderRadius: RADIUS.xl,
    padding: SPACE.md,
    marginBottom: SPACE.md,
    borderWidth: 1,
  },
  quizFeedbackGood: {
    backgroundColor: COLOR.successLight,
    borderColor: COLOR.success,
  },
  quizFeedbackBad: {
    backgroundColor: COLOR.errorLight,
    borderColor: COLOR.error,
  },
  quizFeedbackText: {
    fontSize: FONT.md,
    color: COLOR.textPrimary,
    fontWeight: '900',
    textAlign: 'center',
  },
  quizPremiumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACE.md,
    justifyContent: 'center',
  },
  quizPremiumOption: {
    width: '47%',
    minHeight: 178,
    borderRadius: 28,
    borderWidth: 2,
    padding: SPACE.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  quizOptionIconBubble: {
    width: 74,
    height: 74,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.sm,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  quizOptionNumber: {
    fontSize: 32,
    fontWeight: '900',
  },
  quizOptionEmoji: {
    fontSize: 38,
  },
  quizOptionLabel: {
    fontSize: FONT.md,
    color: COLOR.textPrimary,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 21,
    minHeight: 42,
  },
  quizOptionTap: {
    fontSize: FONT.xs,
    fontWeight: '900',
    marginTop: SPACE.sm,
  },
  quizPremiumNudge: {
    marginTop: SPACE.lg,
    backgroundColor: COLOR.goldLight,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.goldBorder,
    padding: SPACE.lg,
  },
  quizPremiumNudgeTitle: {
    fontSize: FONT.md,
    color: COLOR.clay,
    fontWeight: '900',
    marginBottom: 4,
  },
  quizPremiumNudgeText: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    fontWeight: '700',
    lineHeight: 20,
  },

  logoImage: {
    width: '100%',
    height: '100%',
  },
  appLogoBox: {
    display: 'none',
  },
  appLogoImage: {
    display: 'none',
  },
  levelTitle: {
    fontSize: FONT.xl,
    fontWeight: '900',
    color: KIDS_COLOR.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.5,
  },
  levelDesc: {
    fontSize: FONT.sm,
    color: KIDS_COLOR.textSecondary,
    marginTop: 1,
    lineHeight: 20,
    fontWeight: '800',
  },
  brandMark: {
    display: 'none',
  },
  brandLogo: {
    display: 'none',
  },
  compactBrandStack: {
    display: 'none',
  },
  settingsIconBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD24A',
    borderWidth: 2,
    borderColor: '#FFA62B',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  settingsIconText: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: -1,
  },
  brandTopRow: {
    display: 'none',
  },
  standaloneLogo: {
    width: 68,
    height: 68,
    borderRadius: 18,
  },
  compactHudRow: {
    display: 'none',
  },
  activePlayerChip: {
    display: 'none',
  },
  activePlayerTextWrap: {
    display: 'none',
  },
  activePlayerKicker: {
    display: 'none',
  },
  activePlayerName: {
    display: 'none',
  },
  brandHeader: {
    display: 'none',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  switchPlayerMiniBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: KIDS_COLOR.sunshine,
    borderWidth: 1.5,
    borderColor: KIDS_COLOR.mango,
  },
  switchPlayerMiniText: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  navItem: {
    flex: 1,
    minHeight: 66,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  navItemActive: {
    backgroundColor: '#FFF6D1',
    borderWidth: 1.5,
    borderColor: KIDS_COLOR.sunshine,
  },
  kidsStatsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: KIDS_COLOR.skyMist,
    borderWidth: 1.2,
    borderColor: 'rgba(49, 189, 237, 0.22)',
  },
  kidsStatsText: {
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.sm,
    fontWeight: '900',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 30,
    backgroundColor: KIDS_COLOR.white,
    borderWidth: 1.5,
    borderColor: KIDS_COLOR.borderSoft,
    padding: SPACE.md,
    marginTop: SPACE.md,
  },
  goalTitle: {
    color: '#212121',
    fontSize: FONT.lg,
    fontWeight: '900',
    marginBottom: 6,
  },
  goalSub: {
    color: '#6F675E',
    fontSize: FONT.sm,
    fontWeight: '700',
    marginTop: 7,
  },
  kidsPlaySection: {
    marginTop: SPACE.lg,
    marginBottom: SPACE.xl,
  },
  kidsPlayHeader: {
    marginBottom: SPACE.md,
  },
  kidsPlayHeaderCard: {
    borderRadius: 34,
    paddingHorizontal: SPACE.lg,
    paddingVertical: 18,
    backgroundColor: '#FFF1B8',
    borderWidth: 2,
    borderColor: 'rgba(255, 166, 43, 0.35)',
    marginBottom: SPACE.md,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  kidsSectionSub: {
    fontSize: 16,
    lineHeight: 23,
    color: '#326C92',
    fontWeight: '800',
    marginTop: 5,
  },
  kidsAdventureGrid: {
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 8,
  },
  kidsAdventureCard: {
    width: 168,
    minHeight: 204,
    borderRadius: 38,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(27, 42, 107, 0.10)',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  kidsAdventureCardSpeak: {
    backgroundColor: '#FFE6F0',
    borderColor: 'rgba(246, 79, 114, 0.28)',
  },

  kidsAdventureCardStories: {
    backgroundColor: '#F2E9FF',
    borderColor: 'rgba(122, 69, 216, 0.26)',
  },
  kidsAdventureCardQuiz: {
    backgroundColor: '#FFF1B8',
    borderColor: 'rgba(255, 166, 43, 0.32)',
  },
  kidsAdventureIcon: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.md,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  kidsAdventureIconSpeak: {
    backgroundColor: KIDS_COLOR.coral,
  },

  kidsAdventureIconStories: {
    backgroundColor: KIDS_COLOR.purple,
  },
  kidsAdventureIconQuiz: {
    backgroundColor: KIDS_COLOR.sunshine,
  },
  kidsAdventureEmoji: {
    fontSize: 34,
  },
  kidsAdventureTitle: {
    color: KIDS_COLOR.heading,
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginBottom: 7,
  },
  kidsAdventureSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    lineHeight: 20,
    fontWeight: '800',
  },
  kidsAdventureArrow: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.white,
    marginTop: SPACE.md,
    borderWidth: 1.5,
    borderColor: 'rgba(27, 42, 107, 0.08)',
  },
  kidsAdventureArrowText: {
    color: KIDS_COLOR.heading,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '900',
  },
  playZoneGrid: {
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 8,
  },
  playZoneCard: {
    width: 168,
    minHeight: 204,
    borderRadius: 38,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#DDF6FF',
    borderWidth: 2,
    borderColor: 'rgba(49, 189, 237, 0.30)',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  playZoneIcon: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.sky,
    marginBottom: SPACE.md,
  },
  playZoneTitle: {
    color: KIDS_COLOR.heading,
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginBottom: 7,
  },
  playZoneSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    lineHeight: 20,
    fontWeight: '800',
  },
  bottomNavFrame: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  kidsPlaygroundHeader: {
    borderRadius: 34,
    paddingHorizontal: SPACE.lg,
    paddingVertical: 18,
    backgroundColor: '#FFF1B8',
    borderWidth: 2,
    borderColor: 'rgba(255, 166, 43, 0.34)',
    marginTop: SPACE.md,
    marginBottom: SPACE.md,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  storyCloudOne: {
    position: 'absolute',
    right: -24,
    top: 18,
    width: 110,
    height: 58,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  storyCloudTwo: {
    position: 'absolute',
    left: -34,
    bottom: 24,
    width: 130,
    height: 68,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
  },
  storySunDot: {
    position: 'absolute',
    right: 28,
    bottom: 26,
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#FFD24A',
    borderWidth: 3,
    borderColor: '#FFA62B',
  },
  storyHeroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACE.md,
  },
  storyHeroChip: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    color: '#1B2A6B',
    fontSize: 12,
    fontWeight: '900',
  },
  storyReadPill: {
    alignSelf: 'flex-start',
    marginTop: SPACE.md,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(27, 42, 107, 0.08)',
  },
  storyReadPillText: {
    color: '#7A45D8',
    fontSize: 12,
    fontWeight: '900',
  },
  portalCardCompact: {
    padding: 16,
    borderRadius: 30,
    marginBottom: 20,
  },
  portalTopCompact: {
    gap: 12,
  },
  portalTitleCompact: {
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.55,
  },
  portalSubCompact: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  adventurePortalCard: {
    backgroundColor: '#FFF1B8',
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#FFD33D',
    padding: 26,
    marginBottom: 24,
    minHeight: 244,
    overflow: 'hidden',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  adventurePortalCloudOne: {
    position: 'absolute',
    width: 120,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.52)',
    right: -26,
    top: 30,
  },
  adventurePortalCloudTwo: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: 'rgba(255,255,255,0.42)',
    left: -44,
    bottom: -34,
  },
  adventurePortalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  adventurePortalIcon: {
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(133,76,230,0.22)',
    shadowColor: '#854CE6',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    flexShrink: 0,
  },
  adventurePortalEmoji: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  adventurePortalBottom: {
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: 22,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adventurePortalHint: {
    color: '#1B2A6B',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  adventurePortalArrow: {
    color: '#1B2A6B',
    fontSize: 44,
    lineHeight: 44,
    fontWeight: '900',
  },
  adventureSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 42, 107, 0.28)',
    justifyContent: 'flex-end',
  },
  adventureSheet: {
    backgroundColor: '#FFF7E8',
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingHorizontal: SPACE.md,
    paddingTop: 12,
    paddingBottom: 34,
  },
  adventureSheetTitle: {
    color: '#7A45D8',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.9,
  },
  adventureSheetSub: {
    color: '#436B8A',
    fontSize: FONT.md,
    lineHeight: 22,
    fontWeight: '800',
    marginTop: 5,
    marginBottom: SPACE.md,
  },
  adventureSheetGrid: {
    gap: 12,
  },
  adventureSheetCard: {
    minHeight: 96,
    borderRadius: 32,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  adventureSheetBubble: {
    width: 112,
    height: 104,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },
  adventureSheetIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  adventureSheetCardTitle: {
    color: '#1B2A6B',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  adventureSheetCardIgbo: {
    color: '#008A4A',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 2,
  },
  adventureSheetCardSub: {
    color: '#2E6D91',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 1,
  },
  adventureSheetArrow: {
    color: '#7A45D8',
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '900',
  },
  lessonPortalCard: {
    backgroundColor: '#DDF6FF',
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#56DFF8',
    padding: 26,
    marginBottom: 24,
    minHeight: 244,
    overflow: 'hidden',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  lessonPortalIcon: {
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(49,189,237,0.26)',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    flexShrink: 0,
  },

  lessonPortalImage: {
    borderRadius: 28,
    backgroundColor: '#E8FBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lessonPortalCopy: {
    flex: 1,
    minWidth: 0,
  },

  lessonPortalTitle: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
    color: '#1B2A6B',
    letterSpacing: -0.65,
    marginTop: 2,
  },

  lessonPortalSub: {
    fontSize: 16,
    lineHeight: 23,
    color: '#326C92',
    fontWeight: '800',
    marginTop: 5,
  },

  lessonPortalTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E7F0E5',
    overflow: 'hidden',
    marginTop: 12,
  },

  lessonPortalFill: {
    width: '36%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFD24A',
  },

  lessonPortalArrow: {
    color: '#1B2A6B',
    fontSize: 44,
    lineHeight: 44,
    fontWeight: '900',
  },

  lessonPortalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  lessonPortalBottom: {
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: 22,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonPortalHint: {
    color: '#1B2A6B',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  lessonPortalCloudOne: {
    position: 'absolute',
    width: 120,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.46)',
    right: -26,
    top: 30,
  },
  lessonPortalCloudTwo: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: 'rgba(255,255,255,0.36)',
    left: -44,
    bottom: -34,
  },
  lessonPathScreen: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },

  lessonPathScreenScroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },

  lessonPathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },

  lessonPathBackButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008A4A',
  },

  lessonPathBackText: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 38,
    fontWeight: '900',
  },

  lessonPathTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1B2A6B',
    letterSpacing: -0.6,
  },

  lessonPathSub: {
    fontSize: 15,
    lineHeight: 21,
    color: '#436B8A',
    fontWeight: '800',
    marginTop: 3,
  },

  lessonPathChevronButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    flexShrink: 0,
  },
  lessonPathBlobOne: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -42,
    top: -42,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  lessonPathBlobTwo: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    left: -36,
    bottom: -40,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  lessonPathBgSun: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255, 210, 74, 0.18)',
    right: -92,
    top: 36,
  },
  lessonPathBgCloudOne: {
    position: 'absolute',
    width: 170,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(221, 246, 255, 0.72)',
    left: -86,
    top: 210,
  },
  lessonPathBgCloudTwo: {
    position: 'absolute',
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: 'rgba(242, 233, 255, 0.52)',
    right: -70,
    top: 620,
  },
  lessonPathBgMintBlob: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(231, 250, 239, 0.70)',
    left: -92,
    top: 860,
  },
  lessonPathBgStarOne: {
    position: 'absolute',
    right: 36,
    top: 182,
    color: 'rgba(255, 166, 43, 0.34)',
    fontSize: 34,
    fontWeight: '900',
  },
  lessonPathBgStarTwo: {
    position: 'absolute',
    left: 28,
    top: 720,
    color: 'rgba(122, 69, 216, 0.26)',
    fontSize: 30,
    fontWeight: '900',
  },
  lessonPathBgDotOne: {
    position: 'absolute',
    right: 42,
    top: 430,
    color: 'rgba(246, 79, 114, 0.22)',
    fontSize: 22,
  },
  lessonPathBgDotTwo: {
    position: 'absolute',
    left: 34,
    top: 1040,
    color: 'rgba(49, 189, 237, 0.24)',
    fontSize: 24,
  },
  lessonPathStickyHeader: {
    backgroundColor: '#FFF8E7',
    paddingTop: 10,
    paddingBottom: 18,
    marginBottom: 6,
    zIndex: 30,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0,
  },
  lessonPathLevelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFDF6',
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FFE8A3',
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 14,
    marginBottom: 16,
    minHeight: 146,
    overflow: 'hidden',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.085,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },

  lessonPathLevelArt: {
    width: 116,
    height: 116,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.64)',
    flexShrink: 0,
  },

  lessonPathLevelImage: {
    width: 108,
    height: 108,
  },

  lessonPathLevelCopy: {
    flex: 1,
    minWidth: 0,
  },

  lessonPathLevelName: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    color: '#1B2A6B',
    letterSpacing: -0.45,
    marginTop: 4,
  },

  lessonPathLevelSub: {
    fontSize: 15,
    lineHeight: 21,
    color: '#326C92',
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 11,
  },

  lessonPathChevron: {
    fontSize: 32,
    lineHeight: 32,
    color: '#1B2A6B',
    fontWeight: '900',
    marginTop: -2,
  },

  xpScrollCompact: {
    paddingTop: 6,
    paddingBottom: 120,
  },
  xpHeroCardCompact: {
    padding: 14,
    borderRadius: 30,
    marginBottom: 12,
  },
  xpHeroTopCompact: {
    gap: 10,
  },
  xpAvatarRingCompact: {
    width: 82,
    height: 82,
    borderRadius: 28,
  },
  xpHeroTitleCompact: {
    fontSize: 25,
    lineHeight: 30,
  },
  xpHeroSubCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  xpStatGridCompact: {
    gap: 8,
  },
  xpStatCardCompact: {
    minHeight: 102,
    padding: 10,
    borderRadius: 24,
  },
  xpLevelCardCompact: {
    gap: 10,
    padding: 10,
    minHeight: 94,
    borderRadius: 24,
  },
  xpLevelArtCompact: {
    width: 66,
    height: 66,
    borderRadius: 20,
  },
  xpLevelImageCompact: {
    width: 62,
    height: 62,
  },
  xpLevelNameCompact: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 6,
  },
  lessonPathLevelCardCompact: {
    gap: 14,
    minHeight: 138,
    paddingVertical: 15,
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: 32,
    marginBottom: 15,
  },
  lessonPathLevelArtCompact: {
    width: 102,
    height: 102,
    borderRadius: 28,
  },
  lessonPathLevelImageCompact: {
    width: 96,
    height: 96,
  },
  lessonPathLevelNameCompact: {
    fontSize: 21,
    lineHeight: 26,
  },
  lessonPathLevelSubCompact: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 9,
  },
  xpRoot: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },

  xpScroll: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 128,
    position: 'relative',
  },

  xpBgSun: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 210, 74, 0.18)',
    right: -78,
    top: 32,
  },

  xpBgCloudOne: {
    position: 'absolute',
    width: 150,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(221, 246, 255, 0.66)',
    left: -70,
    top: 300,
  },

  xpBgCloudTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(242, 233, 255, 0.46)',
    right: -70,
    top: 650,
  },

  xpHeroCard: {
    backgroundColor: '#DDF6FF',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#8EEAFF',
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  xpHeroBlob: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
    right: -48,
    top: -58,
  },

  xpHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  xpAvatarRing: {
    width: 100,
    height: 100,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.70)',
    flexShrink: 0,
  },

  xpHeroCopy: {
    flex: 1,
    minWidth: 0,
  },

  xpKicker: {
    color: '#FFA62B',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 2.4,
  },

  xpHeroTitle: {
    color: '#1B2A6B',
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.65,
    marginTop: 2,
  },

  xpHeroSub: {
    color: '#326C92',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
    marginTop: 3,
  },

  xpPremiumPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD24A',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFA62B',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  xpPremiumText: {
    color: '#1B2A6B',
    fontSize: 12,
    fontWeight: '900',
  },

  xpHeroProgressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.82)',
    padding: 13,
    marginTop: 14,
  },

  xpHeroProgressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  xpHeroProgressTitle: {
    color: '#1B2A6B',
    fontSize: 16,
    fontWeight: '900',
  },

  xpHeroProgressPercent: {
    color: '#19B765',
    fontSize: 18,
    fontWeight: '900',
  },

  xpHeroTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E7F0E5',
    overflow: 'hidden',
    marginTop: 10,
  },

  xpHeroFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#19B765',
  },

  xpHeroHint: {
    color: '#436B8A',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    marginTop: 8,
  },

  xpStatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },

  xpStatCard: {
    width: '48.5%',
    borderRadius: 26,
    borderWidth: 2,
    padding: 12,
    minHeight: 116,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.075,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  xpStatIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  xpStatIcon: {
    fontSize: 23,
  },

  xpStatValue: {
    color: '#1B2A6B',
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
  },

  xpStatLabel: {
    color: '#436B8A',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3,
  },

  xpSectionHeader: {
    marginTop: 8,
    marginBottom: 10,
  },

  xpSectionKicker: {
    color: '#F64F72',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 2.6,
  },

  xpSectionTitle: {
    color: '#1B2A6B',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.45,
    marginTop: 2,
  },

  xpLevelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 28,
    borderWidth: 2,
    padding: 12,
    marginBottom: 10,
    minHeight: 104,
    overflow: 'hidden',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  xpLevelArt: {
    width: 78,
    height: 78,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.62)',
    flexShrink: 0,
  },

  xpLevelImage: {
    width: 74,
    height: 74,
  },

  xpLevelCopy: {
    flex: 1,
    minWidth: 0,
  },

  xpLevelStar: {
    fontSize: 13,
  },

  xpLevelPercent: {
    marginLeft: 'auto',
    fontSize: 13,
    fontWeight: '900',
  },

  xpLevelName: {
    color: '#1B2A6B',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: -0.25,
    marginTop: 2,
    marginBottom: 8,
  },

  xpLevelTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(231, 240, 229, 0.95)',
    overflow: 'hidden',
  },

  xpWeekCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#DDE5F4',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 13,
    marginBottom: 18,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.075,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  xpDayColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flex: 1,
  },

  xpDayGem: {
    width: 28,
    borderRadius: 14,
    backgroundColor: '#BEE6D2',
  },

  xpDayGemActive: {
    backgroundColor: '#19B765',
  },

  xpDayLabel: {
    color: '#9A9587',
    fontSize: 13,
    fontWeight: '900',
  },

  xpDayLabelActive: {
    color: '#1B2A6B',
  },
  adventureModeIcon: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  appBackButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DDF6FF',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.1,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  adventurePlaceholderBadge: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderWidth: 2,
  },
  adventurePlaceholderText: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
  },
});
