import React, { useCallback, useMemo, useState } from 'react';
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

type SearchItem = {
  igbo: string;
  english: string;
  emoji?: string;
};

type Cell = {
  id: string;
  row: number;
  col: number;
  letter: string;
  target: boolean;
};

type Direction = {
  dr: number;
  dc: number;
};

const IGBO_FILLERS = ['A', 'B', 'D', 'E', 'G', 'I', 'Ị', 'K', 'L', 'M', 'N', 'O', 'Ọ', 'R', 'S', 'T', 'U', 'Ụ', 'W', 'Y'];

const DIRECTIONS: Direction[] = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
];

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function splitLetters(word: string): string[] {
  return Array.from(word.normalize('NFC').toUpperCase());
}

function pointsForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  return 3;
}

function gridSize(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 4;
  if (difficulty === 'medium') return 5;
  return 6;
}

function maxWordLength(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 5;
  if (difficulty === 'medium') return 7;
  return 9;
}

function isCleanSearchItem(item: SearchItem, difficulty: Difficulty): boolean {
  const igbo = String(item.igbo || '').trim();
  const english = String(item.english || '').trim();

  if (!igbo || !english) return false;
  if (igbo.includes(' ') || english.includes('/')) return false;
  if (igbo.includes('/') || igbo.includes('—') || igbo.includes('-')) return false;
  if (/[0-9]/.test(igbo) || /[0-9]/.test(english)) return false;

  const letters = splitLetters(igbo);
  if (letters.length < 2) return false;
  if (letters.length > maxWordLength(difficulty)) return false;

  return true;
}

function getPool(difficulty: Difficulty, isPremium: boolean): SearchItem[] {
  const pool = buildQuizPool(isPremium)
    .map(item => ({
      igbo: String(item.igbo || '').trim(),
      english: String(item.english || '').trim(),
      emoji: item.emoji,
    }))
    .filter(item => isCleanSearchItem(item, difficulty));

  const fallback: SearchItem[] = [
    { igbo: 'Nwa', english: 'Child', emoji: '🧒' },
    { igbo: 'Ụlọ', english: 'House', emoji: '🏠' },
    { igbo: 'Mmiri', english: 'Water', emoji: '💧' },
    { igbo: 'Aka', english: 'Hand', emoji: '✋' },
    { igbo: 'Anya', english: 'Eye', emoji: '👁️' },
    { igbo: 'Nri', english: 'Food', emoji: '🍲' },
    { igbo: 'Azụ', english: 'Fish', emoji: '🐟' },
    { igbo: 'Ọkụ', english: 'Fire', emoji: '🔥' },
  ].filter(item => isCleanSearchItem(item, difficulty));

  return pool.length > 0 ? pool : fallback;
}

function buildGrid(item: SearchItem, difficulty: Difficulty): Cell[][] {
  const size = gridSize(difficulty);
  const letters = splitLetters(item.igbo);
  const empty = Array.from({ length: size }, () => Array.from({ length: size }, () => ''));

  let placed = false;
  let attempts = 0;

  while (!placed && attempts < 40) {
    attempts += 1;

    const direction = shuffle(DIRECTIONS)[0];
    const maxRow = size - 1 - direction.dr * (letters.length - 1);
    const maxCol = size - 1 - direction.dc * (letters.length - 1);

    if (maxRow < 0 || maxCol < 0) continue;

    const startRow = Math.floor(Math.random() * (maxRow + 1));
    const startCol = Math.floor(Math.random() * (maxCol + 1));

    for (let i = 0; i < letters.length; i += 1) {
      empty[startRow + direction.dr * i][startCol + direction.dc * i] = letters[i];
    }

    placed = true;
  }

  if (!placed) {
    letters.slice(0, size).forEach((letter, index) => {
      empty[0][index] = letter;
    });
  }

  return empty.map((row, rowIndex) =>
    row.map((letter, colIndex) => {
      const finalLetter = letter || IGBO_FILLERS[Math.floor(Math.random() * IGBO_FILLERS.length)];

      return {
        id: `${rowIndex}-${colIndex}`,
        row: rowIndex,
        col: colIndex,
        letter: finalLetter,
        target: Boolean(letter),
      };
    })
  );
}

export default function WordSearchGame({ onBack, isPremium = true }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState<SearchItem | null>(null);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [locked, setLocked] = useState(false);

  const MAX_ROUNDS = 6;

  const targetLetters = useMemo(() => splitLetters(target?.igbo || ''), [target]);

  const next = useCallback((selectedDifficulty: Difficulty) => {
    const pool = getPool(selectedDifficulty, isPremium);
    const nextTarget = pool[Math.floor(Math.random() * pool.length)];

    setTarget(nextTarget);
    setGrid(buildGrid(nextTarget, selectedDifficulty));
    setSelectedIds([]);
    setSelectedLetters([]);
    setFeedback(null);
    setLocked(false);
  }, [isPremium]);

  function start(selectedDifficulty: Difficulty) {
    setDifficulty(selectedDifficulty);
    setStarted(true);
    setGameOver(false);
    setRound(1);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedIds([]);
    setSelectedLetters([]);
    setFeedback(null);
    setLocked(false);
    next(selectedDifficulty);
  }

  function selectCell(cell: Cell) {
    if (!target || locked || selectedIds.includes(cell.id)) return;

    const expected = targetLetters[selectedLetters.length];

    if (cell.letter !== expected) {
      setFeedback({
        correct: false,
        text: `Look for "${expected}" next.`,
      });
      return;
    }

    const nextSelectedIds = [...selectedIds, cell.id];
    const nextSelectedLetters = [...selectedLetters, cell.letter];

    setSelectedIds(nextSelectedIds);
    setSelectedLetters(nextSelectedLetters);
    setFeedback(null);

    if (nextSelectedLetters.join('') === targetLetters.join('')) {
      finishRound();
    }
  }

  function finishRound() {
    if (!target || locked) return;

    setLocked(true);

    const newStreak = streak + 1;
    const nextRound = round + 1;

    setScore(current => current + pointsForDifficulty(difficulty));
    setStreak(newStreak);
    setBestStreak(current => Math.max(current, newStreak));
    setFeedback({
      correct: true,
      text: newStreak >= 4 ? `Excellent. ${newStreak} words found!` : 'You found the word.',
    });

    setTimeout(() => {
      if (round >= MAX_ROUNDS) {
        setGameOver(true);
        setLocked(false);
        return;
      }

      setRound(nextRound);
      next(difficulty);
    }, 900);
  }

  function clearSelection() {
    if (locked) return;

    setSelectedIds([]);
    setSelectedLetters([]);
    setFeedback(null);
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
            <Text style={s.headerTitle}>Word Search</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.setupPad} showsVerticalScrollIndicator={false}>
          <View style={s.friendCard}>
            <View style={s.friendFace}>
              <Text style={s.friendInitial}>K</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.friendName}>Kaira says</Text>
              <Text style={s.friendText}>Find Igbo words hidden inside colorful letter tiles.</Text>
            </View>
          </View>

          <Text style={s.instrTitle}>Find the hidden word</Text>
          <Text style={s.instrBody}>
            Tap the letters in order. Each round teaches one clear Igbo word.
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
          <Text style={s.headerTitle}>Word Search</Text>
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

  if (!target) return null;

  const cellSize = difficulty === 'easy' ? 68 : difficulty === 'medium' ? 58 : 50;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>

        <View style={s.headerCopy}>
          <Text style={s.headerKicker}>Word Search</Text>
          <Text style={s.headerTitle}>Find the word</Text>
        </View>

        <Text style={s.roundText}>{round}/{MAX_ROUNDS}</Text>
      </View>

      <ScrollView contentContainerStyle={s.gamePad} showsVerticalScrollIndicator={false}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />

        <View style={s.promptCard}>
          <View style={s.promptIcon}>
            <Text style={s.promptEmoji}>{target.emoji || '🔎'}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.promptLabel}>Find this Igbo word</Text>
            <Text style={s.promptWord}>{target.igbo}</Text>
            <Text style={s.promptEnglish}>{target.english}</Text>
          </View>
        </View>

        <View style={s.answerCard}>
          <Text style={s.answerLabel}>Your letters</Text>
          <Text style={s.answerText}>
            {selectedLetters.length > 0 ? selectedLetters.join('') : 'Tap letters below'}
          </Text>
        </View>

        {feedback && <FeedbackFlash text={feedback.text} correct={feedback.correct} />}

        <View style={s.gridWrap}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={s.gridRow}>
              {row.map(cell => {
                const selected = selectedIds.includes(cell.id);

                return (
                  <TouchableOpacity
                    key={cell.id}
                    style={[
                      s.cell,
                      { width: cellSize, height: cellSize },
                      selected && s.cellSelected,
                    ]}
                    onPress={() => selectCell(cell)}
                    activeOpacity={selected ? 1 : 0.78}
                  >
                    <Text style={[s.cellText, selected && s.cellTextSelected]}>
                      {cell.letter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.clearBtn} onPress={clearSelection} activeOpacity={0.82}>
          <Text style={s.clearText}>Clear letters</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FFE8D6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C05621',
  },
  friendInitial: {
    fontSize: 34,
    color: '#C05621',
    fontWeight: '900',
  },
  friendName: {
    fontSize: FONT.sm,
    color: '#C05621',
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
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: '#FFE8D6',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#F6C8A8',
    padding: SPACE.md,
    marginBottom: SPACE.md,
  },
  promptIcon: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: COLOR.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptEmoji: {
    fontSize: 40,
  },
  promptLabel: {
    fontSize: FONT.xs,
    color: '#C05621',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  promptWord: {
    fontSize: FONT.xxl,
    color: COLOR.textPrimary,
    fontWeight: '900',
    marginBottom: 2,
  },
  promptEnglish: {
    fontSize: FONT.sm,
    color: COLOR.textSecond,
    fontWeight: '800',
  },
  answerCard: {
    backgroundColor: COLOR.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLOR.border,
    padding: SPACE.md,
    marginBottom: SPACE.md,
  },
  answerLabel: {
    fontSize: FONT.xs,
    color: COLOR.textHint,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  answerText: {
    fontSize: FONT.lg,
    color: COLOR.textPrimary,
    fontWeight: '900',
  },
  gridWrap: {
    alignItems: 'center',
    gap: SPACE.sm,
    backgroundColor: COLOR.card,
    borderRadius: 30,
    padding: SPACE.md,
    borderWidth: 1,
    borderColor: COLOR.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACE.sm,
  },
  cell: {
    borderRadius: 20,
    backgroundColor: '#EAF5FF',
    borderWidth: 2,
    borderColor: '#BBDCFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: COLOR.forest,
    borderColor: COLOR.forest,
  },
  cellText: {
    fontSize: FONT.lg,
    color: '#2B6CB0',
    fontWeight: '900',
  },
  cellTextSelected: {
    color: COLOR.textWhite,
  },
  clearBtn: {
    marginTop: SPACE.md,
    backgroundColor: COLOR.goldLight,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLOR.goldBorder,
    paddingVertical: 13,
    alignItems: 'center',
  },
  clearText: {
    color: COLOR.clay,
    fontSize: FONT.md,
    fontWeight: '900',
  },
});
