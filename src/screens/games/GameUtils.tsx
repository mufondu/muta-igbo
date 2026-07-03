// ─── Shared Game Utilities ────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../../utils/tokens';
import { CharacterCheer, Confetti, randomPraise } from '../../components/Celebration';
import { getMutaFriend } from '../../data/mutaFriends';
import * as haptics from '../../utils/haptics';

// ─── Difficulty ───────────────────────────────────────────────────────────────
export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   emoji: '🌱', color: COLOR.success,  age: '3-5',  options: 2, timeBonus: 3 },
  medium: { label: 'Medium', emoji: '🌿', color: COLOR.gold,     age: '6-9',  options: 4, timeBonus: 2 },
  hard:   { label: 'Hard',   emoji: '🌳', color: COLOR.clay,     age: '10+',  options: 6, timeBonus: 1 },
} as const;

// ─── Stars ────────────────────────────────────────────────────────────────────
export function starsFromScore(score: number, total: number): number {
  const pct = score / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}

export function StarDisplay({ stars, size = 28 }: { stars: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3].map(i => (
        <Text key={i} style={{ fontSize: size, opacity: i <= stars ? 1 : 0.25 }}>⭐</Text>
      ))}
    </View>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  emoji: string;
  label: string;
  igbo: string;
  condition: (score: number, streak: number, difficulty: Difficulty) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first_play',  emoji: '🌱', label: 'First Step',    igbo: 'Mbụ Gaa',       condition: (s) => s >= 1 },
  { id: 'streak_5',    emoji: '🔥', label: 'On Fire!',       igbo: 'Ọ na-ere ọkụ!', condition: (_, k) => k >= 5 },
  { id: 'streak_10',   emoji: '⚡', label: 'Lightning',      igbo: 'Ọkpokporo',     condition: (_, k) => k >= 10 },
  { id: 'perfect',     emoji: '💯', label: 'Perfect Score',  igbo: 'Ọ zuru ezu',    condition: (s, _, d) => d === 'hard' && s >= 10 },
  { id: 'easy_master', emoji: '🌿', label: 'Easy Master',    igbo: 'Ọkachamara',    condition: (s, _, d) => d === 'easy' && s >= 15 },
  { id: 'scholar',     emoji: '📚', label: 'Igbo Scholar',   igbo: 'Ọ mụtara Igbo', condition: (s) => s >= 20 },
  { id: 'speedster',   emoji: '🚀', label: 'Speedster',      igbo: 'Ọsọ ọsọ',      condition: (s, k) => k >= 8 && s >= 8 },
];

export function checkBadges(score: number, streak: number, difficulty: Difficulty): Badge[] {
  return BADGES.filter(b => b.condition(score, streak, difficulty));
}

// ─── Animated pop-in ─────────────────────────────────────────────────────────
export function PopIn({ children, trigger }: { children: React.ReactNode; trigger: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!trigger) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 8 }),
    ]).start();
  }, [trigger]);
  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}

// ─── Score banner ─────────────────────────────────────────────────────────────
export function ScoreBanner({ score, streak, difficulty }: {
  score: number; streak: number; difficulty: Difficulty;
}) {
  const dc = DIFFICULTY_CONFIG[difficulty];
  return (
    <View style={sb.row}>
      <View style={[sb.chip, { backgroundColor: dc.color + '22', borderColor: dc.color }]}>
        <Text style={sb.chipText}>{dc.emoji} {dc.label}</Text>
      </View>
      <View style={sb.scoreChip}>
        <Text style={sb.scoreText}>⭐ {score}</Text>
      </View>
      <View style={sb.streakChip}>
        <Text style={sb.streakText}>🔥 {streak}</Text>
      </View>
    </View>
  );
}

// ─── Difficulty picker ────────────────────────────────────────────────────────
export function DifficultyPicker({ value, onChange }: {
  value: Difficulty; onChange: (d: Difficulty) => void;
}) {
  return (
    <View style={sb.diffRow}>
      {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => {
        const dc = DIFFICULTY_CONFIG[d];
        const active = value === d;
        return (
          <View
            key={d}
            style={[sb.diffBtn, active && { backgroundColor: dc.color, borderColor: dc.color }]}
          >
            <Text
              style={[sb.diffText, active && { color: COLOR.textWhite }]}
              onPress={() => { haptics.tick(); onChange(d); }}
            >
              {dc.emoji} {dc.label}
            </Text>
            <Text style={[sb.diffAge, active && { color: 'rgba(255,255,255,0.7)' }]}>
              Age {dc.age}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Feedback flash ───────────────────────────────────────────────────────────
export function FeedbackFlash({ text, correct }: { text: string; correct: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    if (correct) haptics.success(); else haptics.wrong();
    opacity.setValue(0); slideY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(slideY,  { toValue: 0, useNativeDriver: true, damping: 12 }),
    ]).start();
  }, [text]);
  return (
    <Animated.View style={[sb.feedback, { opacity, transform: [{ translateY: slideY }],
      backgroundColor: correct ? COLOR.successLight : COLOR.errorLight,
      borderColor: correct ? COLOR.success : COLOR.error }]}>
      <Text style={[sb.feedbackText, { color: correct ? COLOR.success : COLOR.error }]}>{text}</Text>
    </Animated.View>
  );
}

// ─── Game over screen ─────────────────────────────────────────────────────────
export function GameOver({ score, streak, difficulty, onReplay, onHome, guideId = 'ebuka' }: {
  score: number; streak: number; difficulty: Difficulty;
  onReplay: () => void; onHome: () => void; guideId?: string;
}) {
  const stars   = starsFromScore(score, Math.max(score + 3, 10));
  const badges  = checkBadges(score, streak, difficulty);
  const scale   = useRef(new Animated.Value(0)).current;
  const guide   = getMutaFriend(guideId);
  const praise  = useRef(randomPraise()).current;

  useEffect(() => {
    haptics.success();
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 10, mass: 0.8 }).start();
  }, []);

  return (
    <>
    <Confetti visible={stars >= 1} />
    <Animated.View style={[sb.gameOver, { transform: [{ scale }] }]}>
      <CharacterCheer image={guide.image} name={guide.name} phrase={praise} />
      <StarDisplay stars={stars} size={40} />
      <Text style={sb.gameOverScore}>Score: {score} &nbsp;·&nbsp; Best streak: {streak}</Text>

      {badges.length > 0 && (
        <View style={sb.badgesRow}>
          <Text style={sb.badgesLabel}>Badges earned:</Text>
          <View style={sb.badgesList}>
            {badges.map(b => (
              <View key={b.id} style={sb.badgeChip}>
                <Text style={{ fontSize: 20 }}>{b.emoji}</Text>
                <View>
                  <Text style={sb.badgeName}>{b.label}</Text>
                  <Text style={sb.badgeIgbo}>{b.igbo}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={sb.gameOverBtns}>
        <Text style={sb.replayBtn} onPress={() => { haptics.tapMedium(); onReplay(); }}>🔄 Play Again</Text>
        <Text style={sb.homeBtn}   onPress={onHome}>🏠 Home</Text>
      </View>
    </Animated.View>
    </>
  );
}

const sb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginBottom: SPACE.md, justifyContent: 'center' },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill, borderWidth: 1 },
  chipText: { fontSize: FONT.xs, fontWeight: '700' },
  scoreChip: { backgroundColor: COLOR.goldLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLOR.goldBorder },
  scoreText: { fontSize: FONT.sm, fontWeight: '800', color: COLOR.clay },
  streakChip: { backgroundColor: COLOR.clayLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: '#E8B090' },
  streakText: { fontSize: FONT.sm, fontWeight: '800', color: COLOR.clay },

  diffRow: { flexDirection: 'row', gap: SPACE.sm, justifyContent: 'center', marginBottom: SPACE.md },
  diffBtn: { flex: 1, alignItems: 'center', paddingVertical: SPACE.sm, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLOR.border, backgroundColor: COLOR.card },
  diffText: { fontSize: FONT.sm, fontWeight: '700', color: COLOR.textPrimary },
  diffAge:  { fontSize: FONT.xs, color: COLOR.textHint, marginTop: 2 },

  feedback: { paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, borderRadius: RADIUS.pill, borderWidth: 1, alignSelf: 'center', marginBottom: SPACE.sm },
  feedbackText: { fontSize: FONT.md, fontWeight: '800', textAlign: 'center' },

  gameOver: {
    backgroundColor: COLOR.card, borderRadius: RADIUS.xl,
    padding: SPACE.xl, margin: SPACE.lg,
    alignItems: 'center', gap: SPACE.md,
    borderWidth: 1, borderColor: COLOR.border,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
  },
  gameOverTitle: { fontSize: FONT.xxl, fontWeight: '900', color: COLOR.forest },
  gameOverScore: { fontSize: FONT.md, color: COLOR.textSecond },
  badgesRow: { width: '100%' },
  badgesLabel: { fontSize: FONT.sm, fontWeight: '700', color: COLOR.textSecond, marginBottom: SPACE.sm },
  badgesList: { gap: SPACE.sm },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, backgroundColor: COLOR.goldLight, borderRadius: RADIUS.md, padding: SPACE.sm, borderWidth: 1, borderColor: COLOR.goldBorder },
  badgeName: { fontSize: FONT.sm, fontWeight: '800', color: COLOR.clay },
  badgeIgbo: { fontSize: FONT.xs, color: COLOR.textSecond },
  gameOverBtns: { flexDirection: 'row', gap: SPACE.md },
  replayBtn: { backgroundColor: COLOR.forest, color: COLOR.textWhite, fontWeight: '800', fontSize: FONT.md, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, borderRadius: RADIUS.pill, overflow: 'hidden' },
  homeBtn:   { backgroundColor: COLOR.bg, color: COLOR.textPrimary, fontWeight: '700', fontSize: FONT.md, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLOR.border, overflow: 'hidden' },
});
