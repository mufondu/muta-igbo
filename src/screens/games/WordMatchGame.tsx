import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buildQuizPool } from '../../data/lessons';
import { COLOR, FONT, IS_TABLET, RADIUS, SPACE } from '../../utils/tokens';
import {
  Difficulty,
  DifficultyPicker,
  FeedbackFlash,
  GameOver,
  ScoreBanner,
} from './GameUtils';

interface Props {
  onBack: () => void;
  isPremium: boolean;
}

type MatchItem = {
  igbo: string;
  english: string;
  emoji?: string;
};

type MatchRound = {
  pairs: MatchItem[];
  englishOptions: MatchItem[];
};

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function pairCount(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 3;
  if (difficulty === 'medium') return 4;
  return 5;
}

function pointsForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  return 3;
}

function buildRound(difficulty: Difficulty, isPremium: boolean): MatchRound {
  const pool = buildQuizPool(isPremium).filter(item => item.igbo && item.english);

  const fallback: MatchItem[] = [
    { igbo: 'Nwa', english: 'Child', emoji: '🧒' },
    { igbo: 'Ụlọ', english: 'House', emoji: '🏠' },
    { igbo: 'Mmiri', english: 'Water', emoji: '💧' },
    { igbo: 'Akwụkwọ', english: 'Book', emoji: '📘' },
    { igbo: 'Nri', english: 'Food', emoji: '🍲' },
  ];

  const safePool = pool.length >= 5 ? pool : fallback;
  const selected = shuffle(safePool).slice(0, pairCount(difficulty));

  return {
    pairs: selected,
    englishOptions: shuffle(selected),
  };
}

export default function WordMatchGame({ onBack, isPremium }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentRound, setCurrentRound] = useState<MatchRound | null>(null);
  const [selectedIgbo, setSelectedIgbo] = useState<MatchItem | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  const MAX_ROUNDS = 5;

  const totalPairs = useMemo(() => pairCount(difficulty), [difficulty]);

  const nextRound = useCallback((selectedDifficulty: Difficulty) => {
    setCurrentRound(buildRound(selectedDifficulty, isPremium));
    setSelectedIgbo(null);
    setMatched([]);
    setFeedback(null);
  }, [isPremium]);

  function start(selectedDifficulty: Difficulty) {
    setDifficulty(selectedDifficulty);
    setStarted(true);
    setGameOver(false);
    setRound(1);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCurrentRound(buildRound(selectedDifficulty, isPremium));
    setSelectedIgbo(null);
    setMatched([]);
    setFeedback(null);
  }

  function selectIgbo(item: MatchItem) {
    if (matched.includes(item.igbo)) return;
    setSelectedIgbo(item);
    setFeedback(null);
  }

  function selectEnglish(item: MatchItem) {
    if (!selectedIgbo || matched.includes(item.igbo)) return;

    const isCorrect = selectedIgbo.igbo === item.igbo;

    if (isCorrect) {
      const updatedMatched = [...matched, item.igbo];
      const newStreak = streak + 1;

      setMatched(updatedMatched);
      setScore(current => current + pointsForDifficulty(difficulty));
      setStreak(newStreak);
      setBestStreak(current => Math.max(current, newStreak));
      setSelectedIgbo(null);
      setFeedback({
        correct: true,
        text: updatedMatched.length === totalPairs ? 'Round complete. Great work!' : 'Correct match.',
      });

      if (updatedMatched.length === totalPairs) {
        setTimeout(() => {
          if (round >= MAX_ROUNDS) {
            setGameOver(true);
            return;
          }

          setRound(value => value + 1);
          nextRound(difficulty);
        }, 650);
      }

      return;
    }

    setStreak(0);
    setSelectedIgbo(null);
    setFeedback({
      correct: false,
      text: `Almost. ${selectedIgbo.igbo} means ${selectedIgbo.english}.`,
    });
  }

  if (!started) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backText}>‹</Text>
          </TouchableOpacity>

          <View style={s.headerCopy}>
            <Text style={s.headerKicker}>Mụta Challenge</Text>
            <Text style={s.headerTitle}>Word Match</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.setupPad} showsVerticalScrollIndicator={false}>
          <View style={s.friendCard}>
            <View style={s.friendFace}>
              <Text style={s.friendInitial}>O</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.friendName}>Obi says</Text>
              <Text style={s.friendText}>Match each Igbo word with the right English meaning.</Text>
            </View>
          </View>

          <Text style={s.instrTitle}>Match the words</Text>
          <Text style={s.instrBody}>
            Tap an Igbo word, then tap its matching meaning. Complete every pair to finish the round.
          </Text>

          <DifficultyPicker value={difficulty} onChange={setDifficulty} />

          <TouchableOpacity style={s.startBtn} onPress={() => start(difficulty)} activeOpacity={0.86}>
            <Text style={s.startBtnText}>Start Challenge</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (gameOver) {
    return (
      <ScrollView style={s.root} contentContainerStyle={s.gameOverPad}>
        <View style={s.header}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Word Match</Text>
        </View>

        <GameOver
          score={score}
          streak={bestStreak}
          difficulty={difficulty}
          onReplay={() => start(difficulty)}
          onHome={onBack}
        />
      </ScrollView>
    );
  }

  if (!currentRound) return null;

  const cardMinHeight = IS_TABLET ? 72 : 60;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>

        <View style={s.headerCopy}>
          <Text style={s.headerKicker}>Word Match</Text>
          <Text style={s.headerTitle}>Tap matching pairs</Text>
        </View>

        <Text style={s.roundText}>{round}/{MAX_ROUNDS}</Text>
      </View>

      <ScrollView contentContainerStyle={s.gamePad} showsVerticalScrollIndicator={false}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(matched.length / totalPairs) * 100}%` as any }]} />
        </View>

        <View style={s.promptCard}>
          <Text style={s.promptTitle}>Match the Igbo words</Text>
          <Text style={s.promptBody}>
            {selectedIgbo ? `Now choose the meaning of "${selectedIgbo.igbo}"` : 'Choose an Igbo word to begin.'}
          </Text>
        </View>

        {feedback && <FeedbackFlash text={feedback.text} correct={feedback.correct} />}

        <View style={s.columns}>
          <View style={s.column}>
            <Text style={s.columnTitle}>Igbo</Text>
            {currentRound.pairs.map(item => {
              const done = matched.includes(item.igbo);
              const active = selectedIgbo?.igbo === item.igbo;

              return (
                <TouchableOpacity
                  key={item.igbo}
                  style={[
                    s.matchCard,
                    { minHeight: cardMinHeight },
                    active && s.activeCard,
                    done && s.doneCard,
                  ]}
                  onPress={() => selectIgbo(item)}
                  activeOpacity={done ? 1 : 0.82}
                >
                  <Text style={[s.matchText, done && s.doneText]}>{item.igbo}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.column}>
            <Text style={s.columnTitle}>Meaning</Text>
            {currentRound.englishOptions.map(item => {
              const done = matched.includes(item.igbo);

              return (
                <TouchableOpacity
                  key={item.english}
                  style={[
                    s.matchCard,
                    { minHeight: cardMinHeight },
                    done && s.doneCard,
                  ]}
                  onPress={() => selectEnglish(item)}
                  activeOpacity={done ? 1 : 0.82}
                >
                  <Text style={[s.matchText, done && s.doneText]}>{item.english}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    gap: 12,
    backgroundColor: COLOR.forestDark,
    paddingVertical: 14,
    paddingHorizontal: SPACE.md,
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
    fontWeight: '800',
  },
  headerCopy: {
    flex: 1,
  },
  headerKicker: {
    fontSize: FONT.xs,
    color: COLOR.gold,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: FONT.lg,
    fontWeight: '900',
    color: COLOR.textCream,
    flexShrink: 1,
  },
  roundText: {
    fontSize: FONT.sm,
    color: COLOR.gold,
    fontWeight: '900',
  },
  setupPad: {
    padding: SPACE.lg,
    paddingBottom: 80,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    padding: SPACE.md,
    borderWidth: 1,
    borderColor: COLOR.border,
    marginBottom: SPACE.xl,
  },
  friendFace: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLOR.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLOR.gold,
  },
  friendInitial: {
    fontSize: 34,
    color: COLOR.clay,
    fontWeight: '900',
  },
  friendName: {
    fontSize: FONT.sm,
    color: COLOR.clay,
    fontWeight: '900',
    marginBottom: 2,
  },
  friendText: {
    fontSize: FONT.md,
    color: COLOR.textPrimary,
    fontWeight: '800',
    lineHeight: 22,
  },
  instrTitle: {
    fontSize: FONT.xxl,
    fontWeight: '900',
    color: COLOR.textPrimary,
    marginBottom: SPACE.sm,
    textAlign: 'center',
  },
  instrBody: {
    fontSize: FONT.md,
    color: COLOR.textSecond,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACE.xl,
  },
  startBtn: {
    backgroundColor: COLOR.forest,
    borderRadius: RADIUS.pill,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginTop: SPACE.lg,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: FONT.lg,
    fontWeight: '900',
    color: COLOR.textWhite,
  },
  gameOverPad: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  gamePad: {
    padding: SPACE.md,
    paddingBottom: 80,
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLOR.border,
    borderRadius: 4,
    marginBottom: SPACE.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLOR.gold,
    borderRadius: 4,
  },
  promptCard: {
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    padding: SPACE.lg,
    marginBottom: SPACE.md,
  },
  promptTitle: {
    fontSize: FONT.lg,
    color: COLOR.textPrimary,
    fontWeight: '900',
    marginBottom: 4,
  },
  promptBody: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    fontWeight: '700',
    lineHeight: 20,
  },
  columns: {
    flexDirection: 'row',
    gap: SPACE.md,
  },
  column: {
    flex: 1,
    gap: SPACE.sm,
  },
  columnTitle: {
    fontSize: FONT.sm,
    color: COLOR.textHint,
    fontWeight: '900',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchCard: {
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLOR.border,
    padding: SPACE.sm,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  activeCard: {
    borderColor: COLOR.gold,
    backgroundColor: COLOR.goldLight,
  },
  doneCard: {
    borderColor: COLOR.forest,
    backgroundColor: COLOR.forestLight,
    opacity: 0.72,
  },
  matchText: {
    fontSize: FONT.md,
    color: COLOR.textPrimary,
    fontWeight: '900',
    textAlign: 'center',
  },
  doneText: {
    color: COLOR.forest,
  },
});
