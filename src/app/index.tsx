/**
 * Mụta Igbo: Premium Kid Edition
 * Enuani / Ogwashi-Ukwu Igbo Learning App
 * src/app/index.tsx
 */

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
} from 'react-native';
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
  const { state, completeOnboarding, incrementStreak } = useApp();
  const [tab, setTab]     = useState<MainTab>('home');
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
      <View style={sh.appHeader}>
        <View style={sh.appHeaderLeft}>
          <View style={sh.logoBadge}><Text style={{ fontSize: 20 }}>🌿</Text></View>
          <View>
            <Text style={sh.appTitle}>Mụta Igbo</Text>
            <Text style={sh.appSub}>Central Igbo / Enuani Edition</Text>
          </View>
        </View>
        <View style={sh.headerRight}>
          <ProfileSwitcher />
          <TouchableOpacity onPress={() => setTab('settings')} style={sh.gearBtn} accessibilityLabel="Settings">
            <Text style={{ fontSize: 22 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      {tab === 'home'     && <HomeScreen openInner={openInner} />}
      {tab === 'progress' && <ProgressScreen />}
      {tab === 'settings' && <SettingsScreen onBack={() => setTab('home')} />}

      {/* Bottom nav */}
      {tab !== 'settings' && (
        <View style={sh.bottomNav}>
          {([
            { id: 'home',     emoji: '🏠', label: 'Home' },
            { id: 'progress', emoji: '📊', label: 'Progress' },
            { id: 'quiz',     emoji: '🎯', label: 'Quiz', action: () => openInner('quiz') },
          ] as const).map(item => (
            <TouchableOpacity
              key={item.id}
              style={sh.navBtn}
              onPress={'action' in item ? item.action : (() => setTab(item.id as MainTab))}
              accessibilityLabel={item.label}
            >
              <Text style={sh.navIcon}>{item.emoji}</Text>
              <Text style={[sh.navLabel, tab === item.id && sh.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
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
    <View style={sh.profileRow}>
      {state.profiles.map(p => (
        <TouchableOpacity
          key={p.id}
          style={[sh.profilePill, activeProfile?.id === p.id && sh.profilePillActive]}
          onPress={() => setActiveProfile(p.id)}
          accessibilityLabel={`Switch to ${p.name}`}
        >
          <Text style={sh.profilePillText}>{p.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ openInner }: { openInner: (v: InnerView, levelId?: string) => void }) {
  const { activeProfile, state } = useApp();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={sh.homeScroll} showsVerticalScrollIndicator={false}>
      {/* Greeting */}
      <View style={sh.greetBanner}>
        <ProfileImage avatar={activeProfile?.avatar ?? "ada"} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={sh.greetName}>{activeProfile?.name ?? 'Welcome'}'s Journey 🌍</Text>
          <View style={sh.streakRow}>
            <Text>🔥</Text>
            <Text style={sh.streakText}>{activeProfile?.streak ?? 0} day streak · {activeProfile?.wordsLearned ?? 0} words</Text>
          </View>
        </View>
        {state.isPremium && (
          <View style={sh.premiumChip}><Text style={sh.premiumChipText}>⭐ Premium</Text></View>
        )}
      </View>

      {/* Quiz CTA */}
      <TouchableOpacity style={sh.quizHero} onPress={() => openInner('quiz')} activeOpacity={0.85}>
        <View>
          <Text style={sh.quizTag}>DAILY CHALLENGE</Text>
          <Text style={sh.quizTitle}>Quiz Mode 🎯</Text>
          <Text style={sh.quizSub}>Match words across all levels!</Text>
        </View>
        <View style={sh.quizBadge}><Text style={{ fontSize: 32 }}>🌟</Text></View>
      </TouchableOpacity>

      {/* Feature rail */}
      <View style={sh.featureHeaderRow}>
        <View>
          <Text style={sh.sectionLabel}>Play & Practice</Text>
          <Text style={sh.featureHeaderTitle}>Choose your next activity</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sh.featureRail}
        style={sh.featureRailScroll}
      >
        {[
          {
            icon: '🎙️',
            title: 'Speak',
            sub: 'Say it back',
            bg: '#FFF1EA',
            accent: '#D4571F',
            action: () => openInner('sayItBack'),
          },
          {
            icon: '💬',
            title: 'Translate',
            sub: 'Enuani words',
            bg: '#EAF5FF',
            accent: '#2B6CB0',
            action: () => openInner('translator'),
          },
          {
            icon: '📖',
            title: 'Stories',
            sub: 'Folktales',
            bg: '#E8F6EC',
            accent: '#087443',
            action: () => openInner('folktales'),
          },
          {
            icon: '🌍',
            title: 'History',
            sub: 'Culture',
            bg: '#E6FAFA',
            accent: '#0B7F83',
            action: () => openInner('history'),
          },
          {
            icon: '🎮',
            title: 'Games',
            sub: 'Play & learn',
            bg: '#F0E7FF',
            accent: '#6B46C1',
            action: () => openInner('games' as InnerView),
          },
        ].map(card => (
          <TouchableOpacity
            key={card.title}
            style={[sh.featureCard, { backgroundColor: card.bg, borderColor: card.accent + '33' }]}
            onPress={card.action}
            activeOpacity={0.84}
          >
            <View style={[sh.featureIconBubble, { backgroundColor: card.accent }]}>
              <Text style={sh.featureIcon}>{card.icon}</Text>
            </View>
            <Text style={sh.featureTitle} numberOfLines={1}>{card.title}</Text>
            <Text style={sh.featureSub} numberOfLines={2}>{card.sub}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Level cards */}
      <Text style={sh.sectionLabel}>Learning Paths</Text>
      {ALL_LEVELS.map((level, i) => {
        const lc = LEVEL_COLOR[level.id];
        const progress = activeProfile?.levelProgress[level.id] ?? 0;
        const isLocked = !level.free && !state.isPremium;
        return (
          <BounceIn key={level.id} delay={i * 55}>
            <TouchableOpacity
              style={[sh.levelCard, isLocked && sh.levelCardLocked]}
              onPress={() => isLocked ? openInner('premium') : openInner('levelDetail', level.id)}
              activeOpacity={0.8}
            >
              <View style={[sh.levelPip, { backgroundColor: lc.bg }]}>
                <Text style={{ fontSize: 22 }}>{level.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={sh.levelTopRow}>
                  <Text style={[sh.levelBadge, { color: lc.text }]}>{level.level}</Text>
                  {isLocked && <LockBadge />}
                  {!level.free && state.isPremium && (
                    <View style={sh.premiumTag}><Text style={sh.premiumTagText}>⭐</Text></View>
                  )}
                </View>
                <Text style={sh.levelName}>{level.title}</Text>
                <Text style={sh.levelSub}>{level.igboTitle} · {level.description}</Text>
                <View style={sh.progressTrack}>
                  <View style={[sh.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: lc.pip }]} />
                </View>
              </View>
              <Text style={sh.chevron}>›</Text>
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
  const { state, activeProfile, updateProgress } = useApp();
  const level = ALL_LEVELS.find(l => l.id === levelId)!;
  const lc = LEVEL_COLOR[levelId];
  const [activeSection, setActiveSection] = useState(0);
  const section = level.sections[activeSection];
  const isAlphabet = levelId === '7A' && section.id === 'alphabet';

  useEffect(() => {
    const currentProfile = state.profiles.find(p => p.id === state.activeProfileId);
    const current = currentProfile?.levelProgress[levelId] ?? 0;
    if (current < 0.1) updateProgress(levelId, 0.1);
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
                    onPress={() => playSoundFallback(item.igbo)}
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
              const singularPlural = grammar && isSingularPluralSection(section.title);
              const [igboLeft, igboRight] = splitLessonPair(item.igbo);
              const [englishLeft, englishRight] = splitLessonPair(item.english);
              const numberColor = getNumberCardColor(i);

              if (numbers) {
                return (
                  <BounceIn key={i} delay={i * 30}>
                    <TouchableOpacity
                      style={[sh.numberCard, { borderColor: numberColor.accent + '44' }]}
                      onPress={() => playSoundFallback(item.igbo)}
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
                      onPress={() => playSoundFallback(item.igbo)}
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

              if (grammar) {
                return (
                  <BounceIn key={i} delay={i * 30}>
                    <TouchableOpacity
                      style={sh.grammarTextCard}
                      onPress={() => playSoundFallback(item.igbo)}
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
                    onPress={() => playSoundFallback(item.igbo)}
                    accessibilityLabel={`${item.igbo}, ${item.english}`}
                    activeOpacity={0.8}
                  >
                    <View style={[sh.vocabEmojiWrap, { backgroundColor: lc.bg }]}>
                      {levelId === '7A' ? (
                        <Text style={[sh.alphaLetter, { color: lc.pip }]}>{item.igbo}</Text>
                      ) : (
                        <Text style={sh.vocabEmoji}>{item.emoji}</Text>
                      )}
                    </View>
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

// ─── QUIZ SCREEN ──────────────────────────────────────────────────────────────
function QuizScreen({ onBack, onPremium }: { onBack: () => void; onPremium: () => void }) {
  const { state, updateQuizBest, addWordsLearned } = useApp();
  const pool = buildQuizPool(state.isPremium);
  const [question, setQuestion] = useState<VocabItem | null>(null);
  const [options, setOptions]   = useState<VocabItem[]>([]);
  const [streak, setStreak]     = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const wiggle = useWiggle();

  const next = useCallback(() => {
    const correct = randomFrom(pool);
    const numberQuestion = isQuizNumberItem(correct);

    const sameFamilyWrong = pool.filter(i =>
      i.igbo !== correct.igbo && isQuizNumberItem(i) === numberQuestion
    );

    const fallbackWrong = pool.filter(i => i.igbo !== correct.igbo);
    const wrongSource = sameFamilyWrong.length >= 3 ? sameFamilyWrong : fallbackWrong;
    const wrong = shuffle(wrongSource).slice(0, 3);

    setQuestion(correct);
    setOptions(shuffle([correct, ...wrong]));
    setFeedback(null);
  }, [pool]);

  useEffect(() => { next(); }, []);

  function check(sel: VocabItem) {
    if (!question) return;
    if (sel.igbo === question.igbo) {
      const ns = streak + 1;
      setStreak(ns);
      updateQuizBest(ns);
      addWordsLearned(1);
      setFeedback({ text: 'Nnukwu! Correct! 🌟', correct: true });
      wiggle.trigger();
      setTimeout(next, 1400);
    } else {
      setStreak(0);
      setFeedback({ text: `Ewoo! That is ${sel.english}. Try again! 💪`, correct: false });
    }
  }

  if (!question) return null;

  return (
    <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <InnerHeader title="Quiz Mode 🎯" onBack={onBack} accent={COLOR.purple} />
      <View style={sh.gamePad}>
        <Animated.View style={[sh.streakBanner, { backgroundColor: COLOR.purpleLight }, wiggle.style]}>
          <Text style={[sh.streakText, { fontSize: FONT.lg, color: COLOR.purple }]}>🌟 Streak: {streak}</Text>
        </Animated.View>

        <View style={[sh.promptCard, { backgroundColor: COLOR.purpleLight, borderColor: COLOR.purpleBorder }]}>
          <Text style={sh.promptSpeaker}>Find the match for:</Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: COLOR.purple, marginTop: 6 }}>{question.igbo}</Text>
        </View>

        {feedback && (
          <Text style={[sh.feedbackText, feedback.correct ? sh.feedbackGood : sh.feedbackBad]}>
            {feedback.text}
          </Text>
        )}

        <View style={sh.quizGrid}>
          {options.map((opt, i) => {
            const numberOption = isQuizNumberItem(opt);
            const numberColor = getNumberCardColor(i);

            return (
              <TouchableOpacity
                key={i}
                style={[
                  sh.quizOpt,
                  numberOption && { borderColor: numberColor.accent + '55', backgroundColor: numberColor.bg },
                ]}
                onPress={() => check(opt)}
                accessibilityLabel={opt.english}
                activeOpacity={0.75}
              >
                {numberOption ? (
                  <>
                    <View style={[sh.quizNumberBadge, { backgroundColor: COLOR.card }]}>
                      <Text style={[sh.quizNumberDigit, { color: numberColor.accent }]}>
                        {getNumberValue(opt.english)}
                      </Text>
                    </View>
                    <Text style={sh.quizOptLabel}>{getNumberEnglish(opt.english)}</Text>
                  </>
                ) : (
                  <>
                    <Text style={sh.quizOptEmoji}>{opt.emoji ?? '❓'}</Text>
                    <Text style={sh.quizOptLabel}>{getNumberEnglish(opt.english)}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {!state.isPremium && (
          <TouchableOpacity style={sh.premiumNudge} onPress={onPremium}>
            <Text style={sh.premiumNudgeText}>🔒 Unlock 100+ more words with Premium</Text>
          </TouchableOpacity>
        )}
      </View>
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
          <Text style={sh.promptSpeaker}>How do we say this in Ogwashi-Ukwu Enuani? 🌿</Text>
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
  const { state } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    const tale = FOLKTALES.find(f => f.id === selected)!;
    return (
      <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
        <InnerHeader title="Level 1A: Ife Ọdịnala" onBack={() => setSelected(null)} />
        <ScrollView contentContainerStyle={sh.listPad}>
          <View style={sh.storyCard}>
            <View style={sh.storyCover}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>{tale.coverEmoji}</Text>
              <Text style={sh.storyCoverTitle}>{tale.title}</Text>
              <Text style={sh.storyCoverSub}>{tale.subtitle}</Text>
            </View>
            <View style={sh.storyBody}>
              <TouchableOpacity style={sh.storyListenBtn} onPress={() => playSoundFallback('Story')}>
                <Text style={sh.storyListenText}>🔊 Listen to the story</Text>
              </TouchableOpacity>
              <Text style={sh.storyText}>{tale.body}</Text>
              <View style={sh.moralBox}>
                <Text style={sh.moralText}>💡 {tale.moral}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <InnerHeader title="Level 1A: Ife Ọdịnala 📚" onBack={onBack} />
      <ScrollView contentContainerStyle={sh.listPad}>
        <Text style={{ fontSize: FONT.sm, color: COLOR.textSecond, marginBottom: SPACE.md }}>
          Igbo folktales from Enuani, stories passed down through generations
        </Text>
        {FOLKTALES.map(tale => {
          const isLocked = !tale.free && !state.isPremium;
          return (
            <TouchableOpacity
              key={tale.id}
              style={[sh.taleCard, isLocked && sh.levelCardLocked]}
              onPress={() => isLocked ? onPremium() : setSelected(tale.id)}
              activeOpacity={0.85}
            >
              <View style={sh.taleCover}>
                <Text style={{ fontSize: 36 }}>{tale.coverEmoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={sh.taleName}>{tale.title}</Text>
                <Text style={sh.taleSub}>{tale.subtitle}</Text>
              </View>
              {isLocked ? <LockBadge /> : <Text style={sh.chevron}>›</Text>}
            </TouchableOpacity>
          );
        })}
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
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  soundIcon: { fontSize: 18 },
});

const sh = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.bg },

  appHeader: {
    paddingVertical: 12, paddingHorizontal: SPACE.md,
    backgroundColor: COLOR.forestDark,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  appHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLOR.gold, alignItems: 'center', justifyContent: 'center',
  },
  appTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream },
  appSub: { fontSize: FONT.xs, color: '#7AB897', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  gearBtn: { padding: 4 },

  profileRow: { flexDirection: 'row', gap: 6 },
  profilePill: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profilePillActive: { backgroundColor: COLOR.gold },
  profilePillText: { fontSize: FONT.sm, fontWeight: '700', color: COLOR.textCream },

  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: COLOR.border,
    backgroundColor: COLOR.card,
    paddingBottom: Platform.OS === 'ios' ? 16 : 4,
  },
  navBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: FONT.xs, color: COLOR.textSecond },
  navLabelActive: { color: COLOR.forest, fontWeight: '700' },

  homeScroll: {
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.md,
    paddingBottom: 110,
  },

  greetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: '#D7F8E5',
    borderRadius: RADIUS.xl,
    padding: SPACE.md,
    marginBottom: SPACE.md,
    borderWidth: 1,
    borderColor: '#94DDB4',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  greetName: {
    fontSize: FONT.xl,
    fontWeight: '900',
    color: COLOR.forest,
    marginBottom: 4,
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
    borderRadius: 28,
    padding: SPACE.lg,
    marginBottom: SPACE.lg,
    borderWidth: 1,
    borderColor: '#1F6A3B',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  quizTag: {
    fontSize: FONT.xs,
    color: COLOR.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '900',
  },
  quizTitle: {
    fontSize: FONT.xxl,
    fontWeight: '900',
    color: COLOR.textCream,
    marginTop: 4,
  },
  quizSub: {
    fontSize: FONT.md,
    color: '#A9DCC1',
    marginTop: 4,
    fontWeight: '700',
  },
  quizBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLOR.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.25)',
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
    color: COLOR.textHint,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: SPACE.xs,
    marginTop: 2,
    fontWeight: '900',
  },

  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    padding: SPACE.md,
    marginBottom: SPACE.md,
    minHeight: 116,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  levelCardLocked: { opacity: 0.65 },
  levelPip: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  levelTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  levelBadge: {
    fontSize: FONT.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  levelName: {
    fontSize: FONT.xl,
    fontWeight: '900',
    color: COLOR.textPrimary,
    marginBottom: 2,
  },
  levelSub: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    marginTop: 1,
    lineHeight: 19,
    fontWeight: '700',
  },
  progressTrack: {
    height: 7,
    backgroundColor: COLOR.border,
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  chevron: { fontSize: 22, color: COLOR.textHint },

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
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLOR.textWhite,
    backgroundColor: COLOR.card,
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
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLOR.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLOR.border,
    padding: SPACE.md, marginBottom: SPACE.sm,
  },
  vocabEmojiWrap: {
    width: 48, height: 48, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
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

  storyCard: {
    borderRadius: RADIUS.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: COLOR.border, marginBottom: 30,
  },
  storyCover: { backgroundColor: COLOR.forestDark, padding: SPACE.lg, alignItems: 'center' },
  storyCoverTitle: { fontSize: FONT.xl, fontWeight: '800', color: COLOR.textCream, textAlign: 'center' },
  storyCoverSub: { fontSize: FONT.sm, color: '#7AB897', marginTop: 4, textAlign: 'center' },
  storyBody: { backgroundColor: COLOR.card, padding: SPACE.md },
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
    marginTop: SPACE.sm,
    marginBottom: SPACE.sm,
  },
  featureHeaderTitle: {
    fontSize: FONT.lg,
    color: COLOR.textPrimary,
    fontWeight: '900',
  },
  featureRailScroll: {
    marginHorizontal: -SPACE.md,
    marginBottom: SPACE.lg,
  },
  featureRail: {
    paddingHorizontal: SPACE.md,
    gap: SPACE.md,
  },
  featureCard: {
    width: 136,
    minHeight: 158,
    borderRadius: 26,
    borderWidth: 1,
    padding: SPACE.md,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featureIconBubble: {
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.sm,
  },
  featureIcon: {
    fontSize: 30,
  },
  featureTitle: {
    fontSize: FONT.md,
    color: COLOR.textPrimary,
    fontWeight: '900',
    marginTop: 2,
  },
  featureSub: {
    fontSize: FONT.xs,
    color: COLOR.textSecond,
    fontWeight: '800',
    lineHeight: 17,
    marginTop: 2,
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

});