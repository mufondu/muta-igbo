// ─── Games Hub ────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../../utils/tokens';
import FillBlankGame from './FillBlankGame';
import ListenTapGame from './ListenTapGame';
import SpellGame from './SpellGame';
import WordMatchGame from './WordMatchGame';
import WordSearchGame from './WordSearchGame';

interface Props { onBack: () => void; isPremium: boolean; }

type GameId = 'match' | 'blank' | 'spell' | 'listen' | 'search';

const GAMES: {
  id: GameId; emoji: string; title: string; igboTitle: string;
  desc: string; color: string; pip: string; premium: boolean;
}[] = [
  {
    id: 'match',  emoji: '🃏', title: 'Word Match',      igboTitle: 'Tụọ Okwu',
    desc: 'Flip cards to match Igbo words with pictures',
    color: '#EAF0FC', pip: '#4878D8', premium: false,
  },
  {
    id: 'blank',  emoji: '✏️', title: 'Fill the Blank',  igboTitle: 'Dị ka Okwu',
    desc: 'Choose the missing Igbo word to complete a sentence',
    color: '#FFF6D6', pip: '#D4A12A', premium: false,
  },
  {
    id: 'spell',  emoji: '🔤', title: 'Spell It!',        igboTitle: 'Dee Okwu',
    desc: 'Tap letters to spell Igbo words correctly',
    color: '#F0EAFC', pip: '#7030C8', premium: false,
  },
  {
    id: 'listen', emoji: '👂', title: 'Listen & Tap',     igboTitle: 'Nụ & Kụọ',
    desc: 'See an Igbo word and tap the correct picture',
    color: '#FDF0E8', pip: '#E8732A', premium: false,
  },
  {
    id: 'search', emoji: '🔍', title: 'Word Search',      igboTitle: 'Chọọ Okwu',
    desc: 'Find hidden Igbo words in a letter grid',
    color: '#E0F8FA', pip: '#0898A0', premium: true,
  },
];

export default function GamesHub({ onBack, isPremium }: Props) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  if (activeGame === 'match')  return <WordMatchGame  onBack={() => setActiveGame(null)} isPremium={isPremium} />;
  if (activeGame === 'blank')  return <FillBlankGame  onBack={() => setActiveGame(null)} isPremium={isPremium} />;
  if (activeGame === 'spell')  return <SpellGame       onBack={() => setActiveGame(null)} />;
  if (activeGame === 'listen') return <ListenTapGame  onBack={() => setActiveGame(null)} isPremium={isPremium} />;
  if (activeGame === 'search') return <WordSearchGame  onBack={() => setActiveGame(null)} />;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backText}>⬅</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Egwu Igbo 🎮</Text>
          <Text style={s.headerSub}>Igbo Language Games</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.intro}>
          Learn Igbo through play! Choose a game below. All games have Easy, Medium and Hard levels. 🌍
        </Text>

        {GAMES.map((game, i) => {
          const locked = game.premium && !isPremium;
          return (
            <TouchableOpacity
              key={game.id}
              style={[s.gameCard, { borderLeftColor: game.pip, borderLeftWidth: 5 }]}
              onPress={() => !locked && setActiveGame(game.id)}
              activeOpacity={locked ? 1 : 0.85}
            >
              <View style={[s.gameEmojiBg, { backgroundColor: game.color }]}>
                <Text style={s.gameEmoji}>{game.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.gameTitleRow}>
                  <Text style={s.gameTitle}>{game.title}</Text>
                  {locked && <View style={s.lockBadge}><Text style={s.lockText}>🔒 Premium</Text></View>}
                </View>
                <Text style={s.gameIgbo}>{game.igboTitle}</Text>
                <Text style={s.gameDesc}>{game.desc}</Text>
                <View style={s.diffRow}>
                  {['🌱 Easy', '🌿 Medium', '🌳 Hard'].map(d => (
                    <View key={d} style={s.diffPill}><Text style={s.diffPillText}>{d}</Text></View>
                  ))}
                </View>
              </View>
              {!locked && <Text style={s.chevron}>›</Text>}
            </TouchableOpacity>
          );
        })}

        <View style={s.trophyBox}>
          <Text style={s.trophyEmoji}>🏆</Text>
          <Text style={s.trophyTitle}>Earn badges as you play!</Text>
          <Text style={s.trophyBody}>
            Build streaks, score high and unlock badges like{'\n'}
            "On Fire 🔥", "Igbo Scholar 📚" and "Perfect Score 💯"
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLOR.forestDark, paddingVertical: 14, paddingHorizontal: SPACE.md,
  },
  backBtn:     { padding: 4 },
  backText:    { fontSize: FONT.xl, color: COLOR.gold },
  headerTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream },
  headerSub:   { fontSize: FONT.xs, color: '#7AB897' },

  scroll: { padding: SPACE.md, paddingBottom: 60 },
  intro: { fontSize: FONT.md, color: COLOR.textSecond, lineHeight: 22, marginBottom: SPACE.lg, textAlign: 'center' },

  gameCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLOR.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLOR.border,
    padding: SPACE.md, marginBottom: SPACE.md,
    overflow: 'hidden',
  },
  gameEmojiBg: {
    width: 56, height: 56, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  gameEmoji:    { fontSize: 30 },
  gameTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  gameTitle:    { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textPrimary },
  gameIgbo:     { fontSize: FONT.xs, color: COLOR.forest, fontStyle: 'italic', marginBottom: 4 },
  gameDesc:     { fontSize: FONT.sm, color: COLOR.textSecond, lineHeight: 18, marginBottom: 6 },
  lockBadge:    { backgroundColor: COLOR.goldLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLOR.goldBorder },
  lockText:     { fontSize: FONT.xs, color: COLOR.clay, fontWeight: '700' },
  chevron:      { fontSize: 22, color: COLOR.textHint },

  diffRow:      { flexDirection: 'row', gap: 6 },
  diffPill:     { backgroundColor: COLOR.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLOR.border },
  diffPillText: { fontSize: FONT.xs, color: COLOR.textSecond },

  trophyBox: {
    backgroundColor: COLOR.goldLight, borderRadius: RADIUS.lg,
    padding: SPACE.lg, alignItems: 'center',
    borderWidth: 1, borderColor: COLOR.goldBorder, marginTop: SPACE.sm,
  },
  trophyEmoji: { fontSize: 44, marginBottom: SPACE.sm },
  trophyTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.clay, marginBottom: SPACE.sm },
  trophyBody:  { fontSize: FONT.sm, color: COLOR.textSecond, textAlign: 'center', lineHeight: 20 },
});
