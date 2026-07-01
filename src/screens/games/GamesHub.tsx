import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../../utils/tokens';
import FillBlankGame from './FillBlankGame';
import ListenTapGame from './ListenTapGame';
import SpellGame from './SpellGame';
import WordMatchGame from './WordMatchGame';
import WordSearchGame from './WordSearchGame';

interface Props {
  onBack: () => void;
  isPremium: boolean;
}

type GameId = 'listen' | 'match' | 'blank' | 'spell' | 'search';

type GameConfig = {
  id: GameId;
  title: string;
  igboTitle: string;
  description: string;
  difficulty: 'Beginner' | 'Growing' | 'Confident';
  duration: string;
  accent: string;
  bg: string;
  premium: boolean;
};

const GAMES: GameConfig[] = [
  {
    id: 'listen',
    title: 'Find It',
    igboTitle: 'Chọta Ya',
    description: 'Find the picture that matches the Igbo word.',
    difficulty: 'Beginner',
    duration: '2 min',
    accent: '#2E7D32',
    bg: '#E8F6EC',
    premium: false,
  },
  {
    id: 'match',
    title: 'Word Match',
    igboTitle: 'Tụọ Okwu',
    description: 'Match Igbo words with the correct pictures.',
    difficulty: 'Beginner',
    duration: '3 min',
    accent: '#B7791F',
    bg: '#FFF4D6',
    premium: false,
  },
  {
    id: 'blank',
    title: 'Complete It',
    igboTitle: 'Mezuo Ya',
    description: 'Choose the missing Igbo word in a sentence.',
    difficulty: 'Growing',
    duration: '3 min',
    accent: '#2B6CB0',
    bg: '#E3F2FD',
    premium: false,
  },
  {
    id: 'spell',
    title: 'Spell It',
    igboTitle: 'Dee Okwu',
    description: 'Build Igbo words one letter at a time.',
    difficulty: 'Growing',
    duration: '4 min',
    accent: '#6B46C1',
    bg: '#F0E7FF',
    premium: false,
  },
  {
    id: 'search',
    title: 'Word Search',
    igboTitle: 'Chọọ Okwu',
    description: 'Find hidden Igbo words in a letter grid.',
    difficulty: 'Confident',
    duration: '5 min',
    accent: '#C05621',
    bg: '#FFE8D6',
    premium: true,
  },
];

function difficultyStars(level: GameConfig['difficulty']) {
  if (level === 'Beginner') return '●●○';
  if (level === 'Growing') return '●●●';
  return '●●●●';
}

function GameCard({
  game,
  locked,
  onPress,
}: {
  game: GameConfig;
  locked: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.gameCard, locked && s.lockedCard]}
      onPress={onPress}
      activeOpacity={locked ? 1 : 0.86}
    >
      <View style={[s.artPanel, { backgroundColor: game.bg }]}>
        <View style={[s.artCircle, { borderColor: game.accent }]}>
          <Text style={[s.artLetter, { color: game.accent }]}>{game.title.slice(0, 1)}</Text>
        </View>
      </View>

      <View style={s.gameBody}>
        <View style={s.gameTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.gameTitle}>{game.title}</Text>
            <Text style={s.gameIgbo}>{game.igboTitle}</Text>
          </View>

          {locked ? (
            <View style={s.premiumPill}>
              <Text style={s.premiumText}>Premium</Text>
            </View>
          ) : (
            <View style={[s.readyPill, { borderColor: game.accent }]}>
              <Text style={[s.readyText, { color: game.accent }]}>Play</Text>
            </View>
          )}
        </View>

        <Text style={s.gameDesc}>{game.description}</Text>

        <View style={s.metaRow}>
          <View style={s.metaPill}>
            <Text style={s.metaLabel}>Level</Text>
            <Text style={s.metaValue}>{game.difficulty}</Text>
          </View>
          <View style={s.metaPill}>
            <Text style={s.metaLabel}>Time</Text>
            <Text style={s.metaValue}>{game.duration}</Text>
          </View>
          <View style={s.metaPill}>
            <Text style={s.metaLabel}>Progress</Text>
            <Text style={[s.metaValue, { color: game.accent }]}>{difficultyStars(game.difficulty)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function GamesHub({ onBack, isPremium }: Props) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  if (activeGame === 'listen') return <ListenTapGame onBack={() => setActiveGame(null)} isPremium={isPremium} />;
  if (activeGame === 'match') return <WordMatchGame onBack={() => setActiveGame(null)} isPremium={isPremium} />;
  if (activeGame === 'blank') return <FillBlankGame onBack={() => setActiveGame(null)} isPremium={isPremium} />;
  if (activeGame === 'spell') return <SpellGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'search') return <WordSearchGame onBack={() => setActiveGame(null)} />;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>

        <View style={s.headerCopy}>
          <Text style={s.kicker}>Mụta Challenge</Text>
          <Text style={s.headerTitle}>Learn through play</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <Text style={s.heroTitle}>Choose a challenge</Text>
          <Text style={s.heroBody}>
            Practice Igbo with short, playful games made for quick wins and daily confidence.
          </Text>
        </View>

        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Games</Text>
          <Text style={s.sectionHint}>{GAMES.length} activities</Text>
        </View>

        {GAMES.map(game => {
          const locked = game.premium && !isPremium;
          return (
            <GameCard
              key={game.id}
              game={game}
              locked={locked}
              onPress={() => {
                if (!locked) setActiveGame(game.id);
              }}
            />
          );
        })}

        <View style={s.rewardCard}>
          <Text style={s.rewardTitle}>Keep going</Text>
          <Text style={s.rewardBody}>
            Every challenge builds listening, reading, and word recognition skills.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLOR.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.forestDark,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: SPACE.md,
    gap: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backText: {
    fontSize: 34,
    lineHeight: 34,
    color: COLOR.gold,
    fontWeight: '700',
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    fontSize: FONT.xs,
    color: COLOR.gold,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: FONT.xl,
    color: COLOR.textCream,
    fontWeight: '900',
  },
  scroll: {
    padding: SPACE.md,
    paddingBottom: 80,
  },
  heroCard: {
    backgroundColor: COLOR.forest,
    borderRadius: RADIUS.xl,
    padding: SPACE.lg,
    marginBottom: SPACE.lg,
    borderWidth: 1,
    borderColor: '#1F6A3B',
  },
  heroTitle: {
    fontSize: FONT.xxl,
    color: COLOR.textWhite,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroBody: {
    fontSize: FONT.md,
    color: COLOR.textCream,
    lineHeight: 22,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACE.sm,
  },
  sectionTitle: {
    fontSize: FONT.lg,
    color: COLOR.textPrimary,
    fontWeight: '900',
  },
  sectionHint: {
    fontSize: FONT.xs,
    color: COLOR.textHint,
    fontWeight: '700',
  },
  gameCard: {
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    marginBottom: SPACE.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  lockedCard: {
    opacity: 0.72,
  },
  artPanel: {
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.card,
  },
  artLetter: {
    fontSize: 36,
    fontWeight: '900',
  },
  gameBody: {
    padding: SPACE.md,
  },
  gameTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACE.sm,
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: FONT.xl,
    fontWeight: '900',
    color: COLOR.textPrimary,
  },
  gameIgbo: {
    fontSize: FONT.sm,
    color: COLOR.forest,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 2,
  },
  gameDesc: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    lineHeight: 20,
    marginBottom: SPACE.md,
  },
  readyPill: {
    borderWidth: 1.5,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: COLOR.bg,
  },
  readyText: {
    fontSize: FONT.xs,
    fontWeight: '900',
  },
  premiumPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: COLOR.goldLight,
    borderWidth: 1,
    borderColor: COLOR.goldBorder,
  },
  premiumText: {
    fontSize: FONT.xs,
    fontWeight: '900',
    color: COLOR.clay,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACE.sm,
  },
  metaPill: {
    flex: 1,
    backgroundColor: COLOR.bg,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  metaLabel: {
    fontSize: FONT.xs,
    color: COLOR.textHint,
    fontWeight: '700',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: FONT.xs,
    color: COLOR.textPrimary,
    fontWeight: '900',
  },
  rewardCard: {
    backgroundColor: COLOR.goldLight,
    borderRadius: RADIUS.xl,
    padding: SPACE.lg,
    borderWidth: 1,
    borderColor: COLOR.goldBorder,
    marginTop: SPACE.sm,
  },
  rewardTitle: {
    fontSize: FONT.lg,
    color: COLOR.clay,
    fontWeight: '900',
    marginBottom: 6,
  },
  rewardBody: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    lineHeight: 20,
  },
});
