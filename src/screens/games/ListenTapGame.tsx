import React, { useCallback, useState } from 'react';
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

type TapOption = {
  igbo: string;
  english: string;
  emoji: string;
};

type TapQuestion = {
  igbo: string;
  english: string;
  options: TapOption[];
};

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function pointsForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  return 3;
}

function optionCount(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 2;
  if (difficulty === 'medium') return 4;
  return 6;
}

function buildQuestion(difficulty: Difficulty, isPremium: boolean): TapQuestion {
  const pool = buildQuizPool(isPremium).filter(
    item => item.emoji && item.emoji !== '🔡' && item.emoji !== '🔊' && item.emoji !== '🔢'
  );

  const safePool = pool.length > 0 ? pool : [
    { igbo: 'Nwa', english: 'Child', emoji: '🧒' },
    { igbo: 'Ụlọ', english: 'House', emoji: '🏠' },
    { igbo: 'Mmiri', english: 'Water', emoji: '💧' },
    { igbo: 'Akwụkwọ', english: 'Book', emoji: '📘' },
  ];

  const correct = safePool[Math.floor(Math.random() * safePool.length)];
  const count = optionCount(difficulty);
  const wrong = shuffle(safePool.filter(item => item.igbo !== correct.igbo)).slice(0, count - 1);

  return {
    igbo: correct.igbo,
    english: correct.english,
    options: shuffle([correct, ...wrong]),
  };
}

export default function ListenTapGame({ onBack, isPremium }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [question, setQuestion] = useState<TapQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [started, setStarted] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [locked, setLocked] = useState(false);

  const MAX_ROUNDS = 10;

  const next = useCallback((selectedDifficulty: Difficulty) => {
    setQuestion(buildQuestion(selectedDifficulty, isPremium));
    setFeedback(null);
    setShowEnglish(false);
    setLocked(false);
  }, [isPremium]);

  function start(selectedDifficulty: Difficulty) {
    setDifficulty(selectedDifficulty);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRound(1);
    setGameOver(false);
    setStarted(true);
    setLocked(false);
    setQuestion(buildQuestion(selectedDifficulty, isPremium));
    setFeedback(null);
    setShowEnglish(false);
  }

  function tap(option: TapOption) {
    if (!question || locked) return;

    setLocked(true);

    const correct = option.igbo === question.igbo;
    const nextRound = round + 1;

    if (correct) {
      const newStreak = streak + 1;
      setScore(current => current + pointsForDifficulty(difficulty));
      setStreak(newStreak);
      setBestStreak(current => Math.max(current, newStreak));
      setFeedback({
        correct: true,
        text: newStreak >= 5 ? `Ọkachamara! ${newStreak} in a row!` : 'Correct. Great job!',
      });
    } else {
      setStreak(0);
      setFeedback({
        correct: false,
        text: `Almost. That was ${option.english}.`,
      });
    }

    setTimeout(() => {
      if (round >= MAX_ROUNDS) {
        setGameOver(true);
        setLocked(false);
        return;
      }

      setRound(nextRound);
      next(difficulty);
    }, 700);
  }

  const optSize = IS_TABLET
    ? 124
    : difficulty === 'easy'
      ? 132
      : difficulty === 'medium'
        ? 104
        : 88;

  if (!started) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backText}>‹</Text>
          </TouchableOpacity>

          <View style={s.headerCopy}>
            <Text style={s.headerKicker}>Mụta Challenge</Text>
            <Text style={s.headerTitle}>Find It</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.setupPad} showsVerticalScrollIndicator={false}>
          <View style={s.friendCard}>
            <View style={s.friendFace}>
              <Text style={s.friendInitial}>A</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.friendName}>Ada says</Text>
              <Text style={s.friendText}>Find the picture that matches the Igbo word.</Text>
            </View>
          </View>

          <Text style={s.instrTitle}>Ready to play?</Text>
          <Text style={s.instrBody}>
            Choose a level. Each round shows one Igbo word and a set of pictures.
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
          <Text style={s.headerTitle}>Find It</Text>
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

  if (!question) return null;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>

        <View style={s.headerCopy}>
          <Text style={s.headerKicker}>Find It</Text>
          <Text style={s.headerTitle}>Choose the picture</Text>
        </View>

        <Text style={s.roundText}>{round}/{MAX_ROUNDS}</Text>
      </View>

      <ScrollView contentContainerStyle={s.gamePad} showsVerticalScrollIndicator={false}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(round / MAX_ROUNDS) * 100}%` as any }]} />
        </View>

        <View style={s.promptCard}>
          <Text style={s.promptLabel}>Find the picture for</Text>
          <Text style={s.promptIgbo}>{question.igbo}</Text>

          <TouchableOpacity onPress={() => setShowEnglish(value => !value)} style={s.hintBtn}>
            <Text style={s.hintBtnText}>
              {showEnglish ? question.english : 'Need a hint?'}
            </Text>
          </TouchableOpacity>
        </View>

        {feedback && <FeedbackFlash text={feedback.text} correct={feedback.correct} />}

        <View style={s.pictureGrid}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={`${option.igbo}-${index}`}
              style={[s.pictureOpt, { width: optSize, height: optSize }]}
              onPress={() => tap(option)}
              activeOpacity={0.76}
            >
              <Text style={{ fontSize: optSize * 0.44 }}>{option.emoji}</Text>
              <Text style={s.pictureText}>{option.english}</Text>
            </TouchableOpacity>
          ))}
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
    backgroundColor: COLOR.forestLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLOR.forest,
  },
  friendInitial: {
    fontSize: 34,
    color: COLOR.forest,
    fontWeight: '900',
  },
  friendName: {
    fontSize: FONT.sm,
    color: COLOR.forest,
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
    backgroundColor: COLOR.forest,
    borderRadius: 4,
  },
  promptCard: {
    backgroundColor: COLOR.forestLight,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#B0D8BE',
    padding: SPACE.lg,
    alignItems: 'center',
    marginBottom: SPACE.md,
  },
  promptLabel: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    marginBottom: 4,
    fontWeight: '700',
  },
  promptIgbo: {
    fontSize: FONT.hero,
    fontWeight: '900',
    color: COLOR.forest,
  },
  hintBtn: {
    marginTop: SPACE.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLOR.goldLight,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLOR.goldBorder,
  },
  hintBtnText: {
    fontSize: FONT.xs,
    color: COLOR.clay,
    fontWeight: '900',
  },
  pictureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACE.md,
  },
  pictureOpt: {
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLOR.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    padding: 8,
  },
  pictureText: {
    fontSize: FONT.xs,
    color: COLOR.textHint,
    fontWeight: '800',
    marginTop: 4,
    textAlign: 'center',
  },
});
