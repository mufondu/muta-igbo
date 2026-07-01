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
  isPremium?: boolean;
}

type SpellItem = {
  igbo: string;
  english: string;
  emoji?: string;
};

type SpellQuestion = {
  answer: string;
  english: string;
  emoji?: string;
  letters: string[];
};

const IGBO_DISTRACTORS = [
  'a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'ị', 'k', 'l', 'm',
  'n', 'ṅ', 'o', 'ọ', 'p', 'r', 's', 't', 'u', 'ụ', 'w', 'y',
];

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function pointsForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  return 3;
}

function maxLetters(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 6;
  if (difficulty === 'medium') return 9;
  return 12;
}

function splitLetters(word: string): string[] {
  return Array.from(word.normalize('NFC'));
}

function isCleanSpellItem(item: SpellItem, difficulty: Difficulty): boolean {
  const igbo = String(item.igbo || '').trim().normalize('NFC');
  const english = String(item.english || '').trim();

  if (!igbo || !english) return false;

  // Do not teach paired concepts in spelling mode.
  if (english.includes('/') || igbo.includes('/')) return false;
  if (english.includes(',') || igbo.includes(',')) return false;
  if (english.includes('&') || igbo.includes('&')) return false;
  if (english.toLowerCase().includes(' or ')) return false;

  // Spelling mode should focus on one Igbo answer at a time.
  if (igbo.includes(' ')) return false;

  // Avoid numbers and symbol prompts in spelling mode.
  if (/[0-9]/.test(english) || /[0-9]/.test(igbo)) return false;

  const letters = splitLetters(igbo);

  if (letters.length < 2) return false;
  if (letters.length > maxLetters(difficulty)) return false;

  return true;
}

function buildQuestion(difficulty: Difficulty, isPremium: boolean): SpellQuestion {
  const pool = buildQuizPool(isPremium)
    .filter(item => isCleanSpellItem(item, difficulty))
    .map(item => ({
      igbo: String(item.igbo).trim().normalize('NFC'),
      english: String(item.english).trim(),
      emoji: item.emoji,
    }));

  const fallback: SpellItem[] = [
    { igbo: 'Nwa', english: 'Child', emoji: '🧒' },
    { igbo: 'Ụlọ', english: 'House', emoji: '🏠' },
    { igbo: 'Mmiri', english: 'Water', emoji: '💧' },
    { igbo: 'Aka', english: 'Hand', emoji: '✋' },
    { igbo: 'Anya', english: 'Eye', emoji: '👁️' },
    { igbo: 'Nri', english: 'Food', emoji: '🍲' },
    { igbo: 'Azụ', english: 'Fish', emoji: '🐟' },
    { igbo: 'Nkịta', english: 'Dog', emoji: '🐕' },
  ].filter(item => isCleanSpellItem(item, difficulty));

  const safePool = pool.length > 0 ? pool : fallback;
  const answer = safePool[Math.floor(Math.random() * safePool.length)];
  const answerLetters = splitLetters(answer.igbo);

  const neededDistractors = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : 5;
  const distractors = shuffle(IGBO_DISTRACTORS)
    .filter(letter => !answerLetters.includes(letter))
    .slice(0, neededDistractors);

  return {
    answer: answer.igbo,
    english: answer.english,
    emoji: answer.emoji,
    letters: shuffle([...answerLetters, ...distractors]),
  };
}

export default function SpellGame({ onBack, isPremium = true }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState<SpellQuestion | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [usedIndexes, setUsedIndexes] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [locked, setLocked] = useState(false);

  const MAX_ROUNDS = 8;

  const next = useCallback((selectedDifficulty: Difficulty) => {
    setQuestion(buildQuestion(selectedDifficulty, isPremium));
    setSelected([]);
    setUsedIndexes([]);
    setFeedback(null);
    setLocked(false);
  }, [isPremium]);

  function start(selectedDifficulty: Difficulty) {
    setDifficulty(selectedDifficulty);
    setStarted(true);
    setGameOver(false);
    setQuestion(buildQuestion(selectedDifficulty, isPremium));
    setSelected([]);
    setUsedIndexes([]);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setRound(1);
    setFeedback(null);
    setLocked(false);
  }

  function chooseLetter(letter: string, index: number) {
    if (!question || locked || usedIndexes.includes(index)) return;
    if (selected.length >= splitLetters(question.answer).length) return;

    setSelected(current => [...current, letter]);
    setUsedIndexes(current => [...current, index]);
    setFeedback(null);
  }

  function deleteLetter() {
    if (locked) return;

    setSelected(current => current.slice(0, -1));
    setUsedIndexes(current => current.slice(0, -1));
    setFeedback(null);
  }

  function checkAnswer() {
    if (!question || locked) return;

    const guess = selected.join('').normalize('NFC');
    const answer = question.answer.normalize('NFC');
    const correct = guess === answer;
    const nextRound = round + 1;

    setLocked(true);

    if (correct) {
      const newStreak = streak + 1;
      setScore(current => current + pointsForDifficulty(difficulty));
      setStreak(newStreak);
      setBestStreak(current => Math.max(current, newStreak));
      setFeedback({
        correct: true,
        text: newStreak >= 5 ? `Ọkachamara! ${newStreak} in a row!` : 'Correct spelling.',
      });
    } else {
      setStreak(0);
      setFeedback({
        correct: false,
        text: `Almost. Correct spelling: ${question.answer}`,
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
    }, 850);
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
            <Text style={s.headerTitle}>Spell It</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.setupPad} showsVerticalScrollIndicator={false}>
          <View style={s.friendCard}>
            <View style={s.friendFace}>
              <Text style={s.friendInitial}>Z</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.friendName}>Zara says</Text>
              <Text style={s.friendText}>Spell one Igbo word at a time. No confusing word pairs.</Text>
            </View>
          </View>

          <Text style={s.instrTitle}>Spell the Igbo word</Text>
          <Text style={s.instrBody}>
            Look at the English meaning, then tap the letters in the correct order.
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
          <Text style={s.headerTitle}>Spell It</Text>
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

  const answerLength = splitLetters(question.answer).length;
  const canCheck = selected.length === answerLength;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>

        <View style={s.headerCopy}>
          <Text style={s.headerKicker}>Spell It</Text>
          <Text style={s.headerTitle}>Build the word</Text>
        </View>

        <Text style={s.roundText}>{round}/{MAX_ROUNDS}</Text>
      </View>

      <ScrollView contentContainerStyle={s.gamePad} showsVerticalScrollIndicator={false}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(round / MAX_ROUNDS) * 100}%` as any }]} />
        </View>

        <View style={s.promptCard}>
          {!!question.emoji && <Text style={s.promptEmoji}>{question.emoji}</Text>}
          <Text style={s.promptEnglish}>{question.english}</Text>
          <Text style={s.promptLabel}>Spell the Igbo word</Text>
        </View>

        <View style={s.answerRow}>
          {Array.from({ length: answerLength }).map((_, index) => (
            <View key={index} style={s.answerSlot}>
              <Text style={s.answerLetter}>{selected[index] || ''}</Text>
            </View>
          ))}
        </View>

        <View style={s.letterGrid}>
          {question.letters.map((letter, index) => {
            const used = usedIndexes.includes(index);

            return (
              <TouchableOpacity
                key={`${letter}-${index}`}
                style={[s.letterBtn, used && s.letterBtnUsed]}
                onPress={() => chooseLetter(letter, index)}
                activeOpacity={used ? 1 : 0.82}
              >
                <Text style={[s.letterText, used && s.letterTextUsed]}>{letter}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {feedback && <FeedbackFlash text={feedback.text} correct={feedback.correct} />}

        <View style={s.actionRow}>
          <TouchableOpacity style={s.deleteBtn} onPress={deleteLetter} activeOpacity={0.82}>
            <Text style={s.deleteText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.checkBtn, !canCheck && s.checkBtnDisabled]}
            onPress={checkAnswer}
            activeOpacity={canCheck ? 0.82 : 1}
          >
            <Text style={[s.checkText, !canCheck && s.checkTextDisabled]}>Check</Text>
          </TouchableOpacity>
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
    backgroundColor: '#F0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6B46C1',
  },
  friendInitial: {
    fontSize: 34,
    color: '#6B46C1',
    fontWeight: '900',
  },
  friendName: {
    fontSize: FONT.sm,
    color: '#6B46C1',
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
    backgroundColor: '#6B46C1',
    borderRadius: 4,
  },
  promptCard: {
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    padding: SPACE.lg,
    alignItems: 'center',
    marginBottom: SPACE.xl,
  },
  promptEmoji: {
    fontSize: 58,
    marginBottom: SPACE.sm,
  },
  promptEnglish: {
    fontSize: FONT.xxl,
    color: COLOR.textPrimary,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  promptLabel: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    fontStyle: 'italic',
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACE.lg,
    flexWrap: 'wrap',
  },
  answerSlot: {
    width: 38,
    height: 46,
    borderBottomWidth: 4,
    borderColor: COLOR.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerLetter: {
    fontSize: FONT.xl,
    color: COLOR.textPrimary,
    fontWeight: '900',
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACE.sm,
    marginBottom: SPACE.lg,
  },
  letterBtn: {
    minWidth: 58,
    minHeight: 58,
    borderRadius: RADIUS.md,
    backgroundColor: COLOR.forestDark,
    borderWidth: 2,
    borderColor: COLOR.forest,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  letterBtnUsed: {
    backgroundColor: COLOR.border,
    borderColor: COLOR.border,
  },
  letterText: {
    fontSize: FONT.xl,
    color: COLOR.textCream,
    fontWeight: '900',
  },
  letterTextUsed: {
    color: COLOR.textHint,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACE.md,
  },
  deleteBtn: {
    flex: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLOR.clay,
    backgroundColor: '#FFF1EA',
    paddingVertical: 15,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: FONT.md,
    color: COLOR.clay,
    fontWeight: '900',
  },
  checkBtn: {
    flex: 2,
    borderRadius: RADIUS.lg,
    backgroundColor: COLOR.forest,
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkBtnDisabled: {
    backgroundColor: '#9ABDA9',
  },
  checkText: {
    fontSize: FONT.md,
    color: COLOR.textWhite,
    fontWeight: '900',
  },
  checkTextDisabled: {
    color: 'rgba(255,255,255,0.58)',
  },
});
