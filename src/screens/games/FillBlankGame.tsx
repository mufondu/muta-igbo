import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buildQuizPool } from '../../data/lessons';
import { COLOR, FONT, RADIUS, SPACE } from '../../utils/tokens';
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

type BlankItem = {
  igbo: string;
  english: string;
  emoji?: string;
};

type BlankQuestion = {
  answer: BlankItem;
  sentence: string;
  englishHint: string;
  options: BlankItem[];
};

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function optionCount(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 2;
  if (difficulty === 'medium') return 4;
  return 6;
}

function pointsForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  return 3;
}

function buildQuestion(difficulty: Difficulty, isPremium: boolean): BlankQuestion {
  const pool = buildQuizPool(isPremium).filter(item => item.igbo && item.english);

  const fallback: BlankItem[] = [
    { igbo: 'Nwa', english: 'Child', emoji: '🧒' },
    { igbo: 'Ụlọ', english: 'House', emoji: '🏠' },
    { igbo: 'Mmiri', english: 'Water', emoji: '💧' },
    { igbo: 'Akwụkwọ', english: 'Book', emoji: '📘' },
    { igbo: 'Nri', english: 'Food', emoji: '🍲' },
    { igbo: 'Nkịta', english: 'Dog', emoji: '🐕' },
  ];

  const safePool = pool.length >= 6 ? pool : fallback;
  const answer = safePool[Math.floor(Math.random() * safePool.length)];
  const wrong = shuffle(safePool.filter(item => item.igbo !== answer.igbo)).slice(0, optionCount(difficulty) - 1);

  return {
    answer,
    sentence: `Nke a bụ ____`,
    englishHint: `This is ${answer.english.toLowerCase()}.`,
    options: shuffle([answer, ...wrong]),
  };
}

export default function FillBlankGame({ onBack, isPremium }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState<BlankQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [locked, setLocked] = useState(false);

  const MAX_ROUNDS = 10;

  const next = useCallback((selectedDifficulty: Difficulty) => {
    setQuestion(buildQuestion(selectedDifficulty, isPremium));
    setFeedback(null);
    setShowHint(false);
    setLocked(false);
  }, [isPremium]);

  function start(selectedDifficulty: Difficulty) {
    setDifficulty(selectedDifficulty);
    setStarted(true);
    setGameOver(false);
    setQuestion(buildQuestion(selectedDifficulty, isPremium));
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRound(1);
    setFeedback(null);
    setShowHint(false);
    setLocked(false);
  }

  function choose(option: BlankItem) {
    if (!question || locked) return;

    setLocked(true);

    const correct = option.igbo === question.answer.igbo;
    const nextRound = round + 1;

    if (correct) {
      const newStreak = streak + 1;
      setScore(current => current + pointsForDifficulty(difficulty));
      setStreak(newStreak);
      setBestStreak(current => Math.max(current, newStreak));
      setFeedback({
        correct: true,
        text: newStreak >= 5 ? `Excellent. ${newStreak} in a row!` : 'Correct. You completed it.',
      });
    } else {
      setStreak(0);
      setFeedback({
        correct: false,
        text: `Almost. The answer was ${question.answer.igbo}.`,
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
    }, 750);
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
            <Text style={s.headerTitle}>Complete It</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.setupPad} showsVerticalScrollIndicator={false}>
          <View style={s.friendCard}>
            <View style={s.friendFace}>
              <Text style={s.friendInitial}>N</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.friendName}>Nneka says</Text>
              <Text style={s.friendText}>Choose the Igbo word that completes the sentence.</Text>
            </View>
          </View>

          <Text style={s.instrTitle}>Fill the blank</Text>
          <Text style={s.instrBody}>
            Read the sentence, use the hint when needed, then choose the missing Igbo word.
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
          <Text style={s.headerTitle}>Complete It</Text>
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
          <Text style={s.headerKicker}>Complete It</Text>
          <Text style={s.headerTitle}>Choose the missing word</Text>
        </View>

        <Text style={s.roundText}>{round}/{MAX_ROUNDS}</Text>
      </View>

      <ScrollView contentContainerStyle={s.gamePad} showsVerticalScrollIndicator={false}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(round / MAX_ROUNDS) * 100}%` as any }]} />
        </View>

        <View style={s.promptCard}>
          <Text style={s.promptLabel}>Complete the sentence</Text>
          <Text style={s.sentence}>{question.sentence}</Text>

          <TouchableOpacity onPress={() => setShowHint(value => !value)} style={s.hintBtn}>
            <Text style={s.hintBtnText}>{showHint ? question.englishHint : 'Show hint'}</Text>
          </TouchableOpacity>
        </View>

        {feedback && <FeedbackFlash text={feedback.text} correct={feedback.correct} />}

        <View style={s.optionGrid}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={`${option.igbo}-${index}`}
              style={s.optionCard}
              onPress={() => choose(option)}
              activeOpacity={0.82}
            >
              <Text style={s.optionIgbo}>{option.igbo}</Text>
              <Text style={s.optionEnglish}>{option.english}</Text>
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
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2B6CB0',
  },
  friendInitial: {
    fontSize: 34,
    color: '#2B6CB0',
    fontWeight: '900',
  },
  friendName: {
    fontSize: FONT.sm,
    color: '#2B6CB0',
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
    backgroundColor: '#2B6CB0',
    borderRadius: 4,
  },
  promptCard: {
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    padding: SPACE.lg,
    alignItems: 'center',
    marginBottom: SPACE.md,
  },
  promptLabel: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    marginBottom: SPACE.sm,
    fontWeight: '800',
  },
  sentence: {
    fontSize: FONT.xxl,
    color: COLOR.textPrimary,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: SPACE.md,
  },
  hintBtn: {
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
  optionGrid: {
    gap: SPACE.md,
  },
  optionCard: {
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLOR.border,
    padding: SPACE.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  optionIgbo: {
    fontSize: FONT.xl,
    color: COLOR.textPrimary,
    fontWeight: '900',
    marginBottom: 2,
  },
  optionEnglish: {
    fontSize: FONT.sm,
    color: COLOR.textHint,
    fontWeight: '800',
  },
});
