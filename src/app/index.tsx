/**
 * Mụta Igbo: Premium Kid Edition
 * Enuani / Ogwashi-Ukwu Igbo Learning App
 * src/app/index.tsx
 */

import { IGBO_FOLKTALES } from '../data/igboFolktales';
import { AnimalIllustration } from '../components/illustrations/AnimalIllustration';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  useWindowDimensions,
} from 'react-native';
import LessonIllustration from '../components/illustrations/LessonIllustration';
import AvatarIllustration from '../components/illustrations/AvatarIllustration';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_LEVELS, buildQuizPool, FOLKTALES, TRANSLATOR_POOL, TranslatorItem, VocabItem } from '../data/lessons';
import { useApp } from '../hooks/useAppState';
import HistoryScreen from '../screens/HistoryScreen';
import GamesHub from '../screens/games/GamesHub';
import { PrivacyScreen, TermsScreen } from '../screens/LegalScreens';
import OnboardingScreen, { ProfileImage } from '../screens/OnboardingScreen';
import PremiumScreen from '../screens/PremiumScreen';
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

// ─── Audio (optional, gracefully degraded) ───────────────────────────────────
let Audio: any = null;
try { Audio = require('expo-av').Audio; } catch (_) {}

async function playNativeAudio(file: any) {
  if (!Audio || !file) return;
  try {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
  } catch (e) { console.log('[audio]', e); }
}

function playSoundFallback(label: string) {
  // Audio placeholder - plays when file is added to assets/audio/
  if (__DEV__) console.log('[sound placeholder]', label);
}

// ─── Nav types ────────────────────────────────────────────────────────────────

const MUTA_APP_ICON = require('../../assets/icon.png');
type MainTab = 'home' | 'progress' | 'settings';

type InnerView =
  | 'levelDetail'
  | 'quiz'
  | 'translator'
  | 'sayItBack'
  | 'folktales'
  | 'history'
  | 'games'
  | 'premium'
  | 'terms'
  | 'privacy';

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
function InnerHeader({ title, onBack, accent = COLOR.gold }: { title: string; onBack: () => void; accent?: string }) {
  return (
    <View style={[sh.innerHeader, { backgroundColor: COLOR.forestDark }]}>
      <TouchableOpacity onPress={onBack} style={sh.backBtn} accessibilityLabel="Go back">
        <Text style={[sh.backText, { color: accent }]}>⬅</Text>
      </TouchableOpacity>
      <Text style={sh.innerTitle} numberOfLines={1}>{title}</Text>
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

  useEffect(() => {
    setNav(NAV_RESET);
    setTab('home');
    incrementStreak();
  }, []);

  function openInner(view: InnerView, levelId?: string, sectionId?: string) {
    setNav({ inner: view, levelId: levelId ?? '7A', sectionId: sectionId ?? '' });
  }

  function closeInner() { setNav(NAV_RESET); }

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
          <QuizScreen onBack={closeInner} onPremium={() => openInner('premium')} />
        )}
        {inner === 'translator' && <TranslatorScreen onBack={closeInner} />}
        {inner === 'sayItBack' && <SayItBackScreen onBack={closeInner} />}
        {inner === 'folktales' && (
          <FolktalesScreen onBack={closeInner} onPremium={() => openInner('premium')} />
        )}
        {inner === 'history'  && <HistoryScreen  onBack={closeInner} />}
        {inner === 'games'    && <GamesHub isPremium={state.isPremium} onBack={closeInner} />}
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
        <Image source={MUTA_APP_ICON} style={sh.standaloneLogo} resizeMode="contain" />

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
      {tab !== 'settings' && (
        <View pointerEvents="box-none" style={sh.bottomNavFrame}>
          <View style={sh.bottomNav}>
          {([
            { id: 'home',     badge: 'HOME', label: 'Home' },
            { id: 'progress', badge: 'XP', label: 'Progress' },
            { id: 'quiz',     badge: 'QUIZ', label: 'Quiz', action: () => openInner('quiz') },
          ] as const).map(item => (
            <TouchableOpacity
              key={item.id}
              style={sh.navBtn}
              onPress={'action' in item ? item.action : (() => setTab(item.id as MainTab))}
              accessibilityLabel={item.label}
              activeOpacity={0.86}
            >
              <Text style={[sh.navIcon, tab === item.id && sh.navIconActive]}>{item.badge}</Text>
              <Text style={[sh.navLabel, tab === item.id && sh.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          </View>
        </View>
      )}
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

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ openInner, onOpenProfileSheet }: { openInner: (v: InnerView, levelId?: string) => void; onOpenProfileSheet: () => void }) {
  const { activeProfile, state } = useApp();
  const { width: screenWidth } = useWindowDimensions();
  const homeContentWidth = Math.min(screenWidth - 32, screenWidth >= 768 ? 680 : screenWidth);

  const today = new Date().toDateString();
  const goalCount = activeProfile?.goalDate === today ? (activeProfile?.goalCount ?? 0) : 0;
  const profileName = activeProfile?.name ?? 'Nwa Igbo';
  const avatar = activeProfile?.avatar ?? 'adaeze';

  return (
    <ScrollView style={sh.kidsHomeRoot} contentContainerStyle={[sh.kidsHomeScroll, { width: homeContentWidth, alignSelf: 'center' }]} showsVerticalScrollIndicator={false}>
      <View style={sh.kidsHeroCard}>
        <View style={sh.kidsHeroTopRow}>
          <View style={sh.kidsHeroAvatarWrap}>
            <AvatarIllustration avatar={avatar} size={96} />
          </View>
          <View style={sh.kidsHeroCopy}>
            <View style={sh.heroTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={sh.kidsHeroKicker}>TODAY'S IGBO QUEST</Text>
                <Text style={sh.kidsHeroTitle}>Nnọọ, {profileName}!</Text>
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
          {state.isPremium ? <View style={sh.kidsPremiumBadge}><Text style={sh.kidsPremiumBadgeText}>Premium</Text></View> : null}
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

      <View style={sh.kidsPlaygroundHeader}>
        <Text style={sh.kidsSectionLabel}>PLAY ZONE</Text>
        <Text style={sh.kidsSectionTitle}>Choose your adventure</Text>
        <Text style={sh.kidsSectionSub}>Pick a game path and keep your Igbo growing.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sh.kidsFeatureRail}>
        {[
          { icon: '🎤', title: 'Say It!', sub: 'Talk like a star', bg: '#FFE6F0', accent: '#F64F72', action: () => openInner('sayItBack') },
          { icon: '💬', title: 'Word Magic', sub: 'Translate & discover', bg: '#DDF6FF', accent: '#31BDED', action: () => openInner('translator') },
          { icon: '📚', title: 'Story Hut', sub: 'Hear folktales', bg: '#FFF1B8', accent: '#FFA62B', action: () => openInner('folktales') },
          { icon: '🌍', title: 'Culture Quest', sub: 'Explore Igbo life', bg: '#E7FAEF', accent: '#19B765', action: () => openInner('history') },
          { icon: '🎮', title: 'Game Land', sub: 'Play & earn stars', bg: '#F2E9FF', accent: '#7A45D8', action: () => openInner('games' as InnerView) },
        ].map((card, index) => (
          <TouchableOpacity
            key={card.title}
            style={[
              sh.kidsFeatureCard,
              {
                backgroundColor: card.bg,
                borderColor: card.accent + '44',
                transform: [{ rotate: index % 2 === 0 ? '-1deg' : '1deg' }],
              },
            ]}
            onPress={card.action}
            activeOpacity={0.86}
          >
            <View style={[sh.kidsFeatureBubble, { backgroundColor: card.accent }]}><Text style={sh.kidsFeatureIcon}>{card.icon}</Text></View>
            <Text style={sh.kidsFeatureTitle} numberOfLines={1}>{card.title}</Text>
            <Text style={sh.kidsFeatureSub} numberOfLines={2}>{card.sub}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={sh.kidsSectionHeader}>
        <Text style={sh.kidsSectionLabel}>LESSON PATH</Text>
        <Text style={sh.kidsSectionTitle}>Keep moving forward</Text>
      </View>

      {ALL_LEVELS.map((level, i) => {
        const lc = LEVEL_COLOR[level.id];
        const progress = activeProfile?.levelProgress[level.id] ?? 0;
        const isLocked = !level.free && !state.isPremium;
        return (
          <BounceIn key={level.id} delay={i * 55}>
            <TouchableOpacity
              style={[sh.kidsLevelCard, isLocked && sh.levelCardLocked]}
              onPress={() => { haptics.tapMedium(); isLocked ? openInner('premium') : openInner('levelDetail', level.id); }}
              activeOpacity={0.84}
            >
              <View style={[sh.kidsLevelPip, { backgroundColor: lc.bg }]}>
                {LEVEL_ICONS[level.id] ? <Image source={LEVEL_ICONS[level.id]} style={sh.levelPipImage} resizeMode="contain" /> : <Text style={[sh.featureIcon, { color: lc.pip }]}>{level.level}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <View style={sh.levelTopRow}>
                  <Text style={[sh.levelBadge, { color: lc.text }]}>{level.level}</Text>
                  {isLocked && <LockBadge />}
                  {!level.free && state.isPremium && <View style={sh.premiumTag}><Text style={sh.premiumTagText}>⭐</Text></View>}
                </View>
                <Text style={sh.kidsLevelName}>{level.title}</Text>
                <Text style={sh.kidsLevelSub}>{level.igboTitle} · {level.description}</Text>
                <View style={sh.kidsProgressTrack}><View style={[sh.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: lc.pip }]} /></View>
              </View>
              <Text style={sh.kidsChevron}>›</Text>
            </TouchableOpacity>
          </BounceIn>
        );
      })}
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
        <GuideBanner levelId={levelId} accent={lc.pip} />
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

                      <Text style={sh.vocabAudio}>🔊</Text>
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
                      <Text style={sh.vocabAudio}>🔊</Text>
                    </TouchableOpacity>
                  </BounceIn>
                );
              }

              return (
                <BounceIn key={i} delay={i * 30}>
                  <TouchableOpacity
                    style={sh.vocabCard}
                    onPress={() => { haptics.tapLight(); playSoundFallback(item.igbo); }}
                    accessibilityLabel={`${item.igbo}, ${item.english}`}
                    activeOpacity={0.8}
                  >
                    {levelId === '7A' ? (
                      <View style={[sh.vocabEmojiWrap, { backgroundColor: lc.bg }]}>
                        <Text style={[sh.alphaLetter, { color: lc.pip }]}>{item.igbo}</Text>
                      </View>
                    ) : (
                      <LessonIllustration
                        igbo={item.igbo}
                        english={item.english}
                        emoji={item.emoji}
                        backgroundColor={lc.bg}
                        size={74}
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={sh.vocabIgbo}>{item.igbo}</Text>
                      <Text style={sh.vocabEn}>{item.english}</Text>
                      {item.example && (
                        <Text style={sh.vocabExample}>e.g. {item.example}</Text>
                      )}
                    </View>
                    <Text style={sh.vocabAudio}>🔊</Text>
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

  return (
    <ScrollView contentContainerStyle={{ padding: SPACE.lg, paddingBottom: 100 }}>
      <Text style={sh.progressTitle}>{activeProfile?.name ?? 'Progress'} 📊</Text>
      <View style={sh.statGrid}>
        {[
          { label: 'Day streak',    value: `${activeProfile?.streak ?? 0} 🔥`,         color: COLOR.clay },
          { label: 'Words learned', value: `${activeProfile?.wordsLearned ?? 0}`,        color: COLOR.success },
          { label: 'Quiz best',     value: `${activeProfile?.quizBest ?? 0} 🌟`,        color: COLOR.purple },
          { label: 'Plan',          value: state.isPremium ? '⭐ Premium' : 'Free', color: state.isPremium ? COLOR.gold : COLOR.textSecond },
        ].map(stat => (
          <View key={stat.label} style={sh.statCard}>
            <Text style={sh.statLabel}>{stat.label}</Text>
            <Text style={[sh.statValue, { color: stat.color }]}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <Text style={[sh.sectionLabel, { marginTop: SPACE.lg }]}>Level Progress</Text>
      {ALL_LEVELS.map(level => {
        const lc = LEVEL_COLOR[level.id];
        const progress = activeProfile?.levelProgress[level.id] ?? 0;
        const isLocked = !level.free && !state.isPremium;
        return (
          <View key={level.id} style={sh.progressRow}>
            <Text style={{ fontSize: 20, width: 32 }}>{level.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={sh.progressRowLabel}>{level.level}: {level.title}</Text>
                <Text style={[sh.progressRowLabel, { color: lc.pip }]}>
                  {isLocked ? '🔒' : `${Math.round(progress * 100)}%`}
                </Text>
              </View>
              <View style={sh.progressTrack}>
                <View style={[sh.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: lc.pip }]} />
              </View>
            </View>
          </View>
        );
      })}

      <Text style={[sh.sectionLabel, { marginTop: SPACE.lg }]}>This week</Text>
      <View style={sh.barChart}>
        {DAYS.map((d, i) => (
          <View key={i} style={sh.barCol}>
            <View style={sh.barTrack}>
              <View style={[sh.barFill, { height: `${HEIGHTS[i]}%` as any, opacity: i === 4 ? 1 : 0.5 }]} />
            </View>
            <Text style={sh.barDay}>{d}</Text>
          </View>
        ))}
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
  const pool = buildQuizPool(state.isPremium);
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
      setStreak(nextStreak);
      setRound(current => current + 1);
      updateQuizBest(nextStreak);
      addWordsLearned(1);
      setFeedback({ text: 'Correct. Keep going!', correct: true });
      wiggle.trigger();
      setTimeout(next, 950);
      return;
    }

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

          {numberQuestion && (
            <View style={[sh.quizPromptNumberBadge, { backgroundColor: COLOR.card }]}>
              <Text style={[sh.quizPromptNumberDigit, { color: promptColor.accent }]}>
                {getNumberValue(question.english)}
              </Text>
            </View>
          )}

          <Text style={[sh.quizPromptWord, { color: promptColor.accent }]}>
            {question.igbo}
          </Text>

          <Text style={sh.quizPromptHint}>
            Choose the correct meaning below.
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

        {!state.isPremium && (
          <TouchableOpacity style={sh.quizPremiumNudge} onPress={onPremium} activeOpacity={0.86}>
            <Text style={sh.quizPremiumNudgeTitle}>Unlock more quiz words</Text>
            <Text style={sh.quizPremiumNudgeText}>Premium adds more lessons, games, stories, and songs.</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}


// ─── TRANSLATOR SCREEN ────────────────────────────────────────────────────────
function TranslatorScreen({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState<TranslatorItem | null>(null);
  const [options, setOptions]   = useState<TranslatorItem[]>([]);
  const [streak, setStreak]     = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const wiggle = useWiggle();

  const next = useCallback(() => {
    const correct = randomFrom(TRANSLATOR_POOL);
    const wrong   = shuffle(TRANSLATOR_POOL.filter(i => i.ogwashi !== correct.ogwashi)).slice(0, 3);
    setQuestion(correct);
    setOptions(shuffle([correct, ...wrong]));
    setFeedback(null);
  }, []);

  useEffect(() => { next(); }, []);

  function check(opt: TranslatorItem) {
    if (!question) return;
    if (opt.ogwashi === question.ogwashi) {
      setStreak(s => s + 1);
      setFeedback({ text: 'Ọma nị! Correct! 🎯', correct: true });
      wiggle.trigger();
      setTimeout(next, 1400);
    } else {
      setStreak(0);
      setFeedback({ text: `Ewoo! That means ${opt.english}. Try again! 💪`, correct: false });
    }
  }

  if (!question) return null;

  return (
    <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <InnerHeader title="Enuani Translator 🧠" onBack={onBack} accent={COLOR.sky} />
      <View style={sh.gamePad}>
        <Animated.View style={[sh.streakBanner, { backgroundColor: COLOR.skyLight }, wiggle.style]}>
          <Text style={[sh.streakText, { color: COLOR.sky }]}>🧠 Dialect streak: {streak}</Text>
        </Animated.View>
        <View style={[sh.promptCard, { backgroundColor: COLOR.skyLight, borderColor: COLOR.skyBorder }]}>
          <Text style={sh.promptSpeaker}>How do we say this in Ogwashi-Ukwu Enuani? </Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: COLOR.sky, marginTop: 6 }}>{question.central}</Text>
        </View>
        {feedback && (
          <Text style={[sh.feedbackText, feedback.correct ? sh.feedbackGood : sh.feedbackBad]}>{feedback.text}</Text>
        )}
        <View style={sh.quizGrid}>
          {options.map((opt, i) => (
            <TouchableOpacity key={i} style={sh.transOpt} onPress={() => check(opt)} activeOpacity={0.8}>
              <Text style={{ fontSize: 22 }}>{opt.emoji}</Text>
              <Text style={sh.transOptWord}>{opt.ogwashi}</Text>
              <Text style={sh.transOptEn}>({opt.english})</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
          <Text style={sh.storyHutKicker}>IGBO STORY HUT</Text>
          <Text style={sh.storyHutTitle}>Igbo Folktales</Text>
          <Text style={sh.storyHutSub}>
            Animal stories with wisdom, kindness, courage, and community lessons.
          </Text>
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
  folktaleBody: {
    color: '#375A72',
    fontSize: FONT.md,
    lineHeight: 24,
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
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  folktaleMoralPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
    marginTop: 4,
  },
  folktaleTitle: {
    color: '#1B2A6B',
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  folktaleCharacter: {
    color: '#F64F72',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  folktaleAnimalBadge: {
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
    backgroundColor: '#DDF6FF',
    borderColor: 'rgba(49, 189, 237, 0.30)',
  },
  folktaleCard: {
    borderRadius: 36,
    padding: SPACE.md,
    borderWidth: 2,
    marginBottom: SPACE.md,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  storyHutRoot: {
    flex: 1,
    backgroundColor: '#FFF7E8',
  },
  storyHutScroll: {
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.lg,
    paddingBottom: 140,
  },
  storyHutHero: {
    borderRadius: 36,
    padding: SPACE.lg,
    backgroundColor: '#F2E9FF',
    borderWidth: 2,
    borderColor: 'rgba(122, 69, 216, 0.24)',
    marginBottom: SPACE.lg,
  },
  storyHutKicker: {
    color: '#F64F72',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  storyHutTitle: {
    color: '#7A45D8',
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  storyHutSub: {
    color: '#436B8A',
    fontSize: FONT.md,
    lineHeight: 23,
    fontWeight: '800',
    marginTop: 8,
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
    backgroundColor: '#FFF7E8',
  },
  kidsHomeScroll: {
    paddingHorizontal: SPACE.md,
    paddingTop: 6,
    paddingBottom: 140,
    backgroundColor: '#FFF7E8',
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
    color: KIDS_COLOR.textPrimary,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.9,
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
    ...KIDS_SHADOW.softCard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 32,
    padding: SPACE.md,
    marginBottom: SPACE.xl,
    backgroundColor: KIDS_COLOR.coral,
    borderWidth: 1.5,
    borderColor: 'rgba(246, 79, 114, 0.22)',
  },
  kidsQuestIcon: {
    width: 76,
    height: 76,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.sunshine,
    borderWidth: 0,
  },
  kidsQuestIconText: { fontSize: 34 },
  kidsQuestKicker: {
    color: KIDS_COLOR.sunshine,
    fontSize: FONT.xs,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  kidsQuestTitle: {
    color: KIDS_COLOR.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  kidsQuestSub: {
    color: '#FFE8EF',
    fontSize: FONT.sm,
    fontWeight: '800',
    marginTop: 4,
  },
  kidsQuestArrow: { color: KIDS_COLOR.white, fontSize: 34, fontWeight: '900' },
  kidsSectionHeader: { marginBottom: 10, marginTop: 4 },
  kidsSectionLabel: {
    color: '#F64F72',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 5,
  },
  kidsSectionTitle: {
    color: '#7A45D8',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.8,
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
  kidsLevelPip: { width: 74, height: 74, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
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
    minHeight: 86,
    backgroundColor: KIDS_COLOR.white,
    borderWidth: 1.5,
    borderColor: 'rgba(8, 62, 74, 0.10)',
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#083E4A',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 56,
  },
  navIcon: {
    minWidth: 48,
    minHeight: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: KIDS_COLOR.skyMist,
    color: KIDS_COLOR.sky,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  navIconActive: {
    backgroundColor: KIDS_COLOR.sunshine,
    color: KIDS_COLOR.textPrimary,
  },
  navLabel: {
    fontSize: FONT.xs,
    fontWeight: '900',
    color: KIDS_COLOR.textSecondary,
    textAlign: 'center',
  },
  navLabelActive: {
    color: KIDS_COLOR.textPrimary,
  },

  homeScroll: {
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.lg,
    paddingBottom: 128,
    backgroundColor: '#FFFDF6',
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
    borderColor: 'rgba(255,255,255,0.25)',
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
    width: '100%',
    height: '100%',
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
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: SPACE.md,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 22 },
  innerTitle: { fontSize: FONT.md, fontWeight: '800', color: COLOR.textCream, flex: 1 },

  listPad: { padding: SPACE.md, paddingBottom: 60 },

  sectionTabs: { paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, gap: SPACE.sm, alignItems: 'center' },
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

  vocabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    padding: SPACE.md,
    marginBottom: SPACE.md,
    minHeight: 116,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  vocabEmojiWrap: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  vocabEmoji: { fontSize: 26 },
  vocabIgbo: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textPrimary },
  vocabEn: { fontSize: FONT.sm, color: COLOR.textSecond, marginTop: 2 },
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

  transOpt: {
    width: '47%', backgroundColor: COLOR.card,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLOR.border,
    paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', gap: 3,
  },
  transOptWord: { fontSize: FONT.md, fontWeight: '800', color: COLOR.textPrimary, textAlign: 'center' },
  transOptEn: { fontSize: FONT.xs, color: COLOR.textSecond },

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
    gap: SPACE.md,
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    padding: SPACE.lg,
    minHeight: 110,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
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
  vocabAudio: {
    fontSize: 18,
    alignSelf: 'center',
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
    borderColor: 'rgba(255,255,255,0.52)',
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
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.sunshine,
    borderWidth: 1.5,
    borderColor: KIDS_COLOR.mango,
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
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: SPACE.md,
    paddingBottom: 8,
    backgroundColor: '#FFF7E8',
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
    color: '#436B8A',
    fontSize: FONT.md,
    lineHeight: 22,
    fontWeight: '800',
    marginTop: 7,
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
  kidsAdventureCardTranslate: {
    backgroundColor: '#DDF6FF',
    borderColor: 'rgba(49, 189, 237, 0.30)',
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
  kidsAdventureIconTranslate: {
    backgroundColor: KIDS_COLOR.sky,
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
    paddingHorizontal: SPACE.md,
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
  },});
