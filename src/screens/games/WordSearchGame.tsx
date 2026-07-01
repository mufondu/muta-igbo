// ─── Game 5: Word Search ─────────────────────────────────────────────────────
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONT, IS_TABLET, RADIUS, SPACE } from '../../utils/tokens';
import { Difficulty, DifficultyPicker, GameOver, ScoreBanner } from './GameUtils';

interface Props { onBack: () => void; }

// Word lists by difficulty
const WORD_BANKS = {
  easy: [
    { word: 'ISI',   meaning: 'Head',    emoji: '👤' },
    { word: 'EWU',   meaning: 'Goat',    emoji: '🐐' },
    { word: 'NWA',   meaning: 'Child',   emoji: '👶🏿' },
    { word: 'AZU',   meaning: 'Fish',    emoji: '🐟' },
    { word: 'MBE',   meaning: 'Tortoise',emoji: '🐢' },
  ],
  medium: [
    { word: 'ANYA',  meaning: 'Eyes',    emoji: '👀' },
    { word: 'ODUM',  meaning: 'Lion',    emoji: '🦁' },
    { word: 'NKITA', meaning: 'Dog',     emoji: '🐕' },
    { word: 'NNUNU', meaning: 'Bird',    emoji: '🦅' },
    { word: 'EGWU',  meaning: 'Music',   emoji: '🎵' },
    { word: 'MMIRI', meaning: 'Water',   emoji: '💧' },
  ],
  hard: [
    { word: 'ANYANWU', meaning: 'Sun',      emoji: '☀️' },
    { word: 'NWANNE',  meaning: 'Sibling',  emoji: '👫🏿' },
    { word: 'AKWUKWO', meaning: 'Book',     emoji: '📖' },
    { word: 'UBOCHI',  meaning: 'Day',      emoji: '📅' },
    { word: 'NNANNA',  meaning: 'Grandpa',  emoji: '👴🏿' },
    { word: 'ONWA',    meaning: 'Moon',     emoji: '🌙' },
    { word: 'ABALI',   meaning: 'Night',    emoji: '🌙' },
  ],
};

const GRID_SIZE = { easy: 8, medium: 10, hard: 12 };
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface GridCell {
  letter: string;
  wordId: number | null;
  row: number;
  col: number;
}

interface PlacedWord {
  id: number;
  word: string;
  meaning: string;
  emoji: string;
  cells: [number, number][];
  found: boolean;
}

function buildGrid(difficulty: Difficulty): { grid: GridCell[][]; words: PlacedWord[] } {
  const size = GRID_SIZE[difficulty];
  const wordList = WORD_BANKS[difficulty];
  const grid: GridCell[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => ({ letter: '', wordId: null, row: r, col: c }))
  );
  const placed: PlacedWord[] = [];
  const directions = [[0,1],[1,0],[1,1],[0,-1],[-1,0]]; // horiz, vert, diag, reverse

  wordList.forEach((item, idx) => {
    const word = item.word;
    let success = false;
    for (let attempt = 0; attempt < 100 && !success; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const [dr, dc] = dir;
      const maxR = dr === 0 ? size - 1 : dr > 0 ? size - word.length : word.length - 1;
      const maxC = dc === 0 ? size - 1 : dc > 0 ? size - word.length : word.length - 1;
      if (maxR < 0 || maxC < 0) continue;
      const startR = Math.floor(Math.random() * (maxR + 1));
      const startC = Math.floor(Math.random() * (maxC + 1));
      const cells: [number, number][] = [];
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = startR + i * dr;
        const c = startC + i * dc;
        if (r < 0 || r >= size || c < 0 || c >= size) { fits = false; break; }
        if (grid[r][c].letter !== '' && grid[r][c].letter !== word[i]) { fits = false; break; }
        cells.push([r, c]);
      }
      if (fits) {
        cells.forEach(([r, c], i) => {
          grid[r][c].letter = word[i];
          grid[r][c].wordId = idx;
        });
        placed.push({ id: idx, word, meaning: item.meaning, emoji: item.emoji, cells, found: false });
        success = true;
      }
    }
  });

  // Fill empty cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c].letter) {
        grid[r][c].letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, words: placed };
}

export default function WordSearchGame({ onBack }: Props) {
  const [difficulty, setDifficulty]   = useState<Difficulty>('easy');
  const [grid, setGrid]               = useState<GridCell[][]>([]);
  const [words, setWords]             = useState<PlacedWord[]>([]);
  const [selected, setSelected]       = useState<[number, number][]>([]);
  const [selecting, setSelecting]     = useState(false);
  const [score, setScore]             = useState(0);
  const [streak, setStreak]           = useState(0);
  const [gameOver, setGameOver]       = useState(false);
  const [started, setStarted]         = useState(false);
  const [lastFound, setLastFound]     = useState<string | null>(null);

  function start(d: Difficulty) {
    const { grid: g, words: w } = buildGrid(d);
    setGrid(g); setWords(w);
    setSelected([]); setSelecting(false);
    setScore(0); setStreak(0); setGameOver(false);
    setStarted(true); setLastFound(null);
  }

  function touchCell(row: number, col: number) {
    if (!selecting) {
      setSelecting(true);
      setSelected([[row, col]]);
      return;
    }
    const newSel = [...selected, [row, col] as [number, number]];
    setSelected(newSel);
    checkSelection(newSel);
  }

  function checkSelection(sel: [number, number][]) {
    const letters = sel.map(([r, c]) => grid[r][c].letter).join('');
    const match = words.find(w => !w.found && (w.word === letters || w.word === letters.split('').reverse().join('')));
    if (match) {
      const ns = streak + 1;
      setStreak(ns); setScore(s => s + 5 + Math.floor(ns / 2));
      setLastFound(`${match.emoji} ${match.word} = ${match.meaning}!`);
      const updated = words.map(w => w.id === match.id ? { ...w, found: true } : w);
      setWords(updated);
      setSelected([]); setSelecting(false);
      if (updated.every(w => w.found)) setTimeout(() => setGameOver(true), 1000);
    } else if (sel.length >= 10) {
      setSelected([]); setSelecting(false);
    }
  }

  const cellSize = IS_TABLET ? 38 : GRID_SIZE[difficulty] === 8 ? 36 : GRID_SIZE[difficulty] === 10 ? 30 : 26;

  if (!started) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.backText} onPress={onBack}>⬅</Text>
          <View>
            <Text style={s.headerTitle}>Word Search 🔍</Text>
            <Text style={s.headerSub}>Find Igbo words in the grid</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={s.setupPad}>
          <Text style={s.instrEmoji}>🔍</Text>
          <Text style={s.instrTitle}>Word Search</Text>
          <Text style={s.instrBody}>
            Find the Igbo words hidden in the letter grid. Tap the first letter, then tap each letter in sequence to select the word! 🌍
          </Text>
          <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          <TouchableOpacity style={s.startBtn} onPress={() => start(difficulty)} activeOpacity={0.85}>
            <Text style={s.startBtnText}>Start Game 🚀</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (gameOver) {
    return (
      <ScrollView style={s.root} contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
        <View style={s.header}>
          <Text style={s.backText} onPress={onBack}>⬅</Text>
          <Text style={s.headerTitle}>Word Search 🔍</Text>
        </View>
        <GameOver score={score} streak={streak} difficulty={difficulty}
          onReplay={() => start(difficulty)} onHome={onBack} />
      </ScrollView>
    );
  }

  const foundCount = words.filter(w => w.found).length;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.backText} onPress={onBack}>⬅</Text>
        <Text style={s.headerTitle}>Word Search 🔍</Text>
        <Text style={s.roundText}>{foundCount}/{words.length}</Text>
      </View>
      <ScrollView contentContainerStyle={s.gamePad}>
        <ScoreBanner score={score} streak={streak} difficulty={difficulty} />

        {lastFound && (
          <View style={s.foundBanner}>
            <Text style={s.foundText}>Found: {lastFound} ✅</Text>
          </View>
        )}

        {/* Word list to find */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.wordListRow}>
          {words.map(w => (
            <View key={w.id} style={[s.wordChip, w.found && s.wordChipFound]}>
              <Text style={s.wordChipEmoji}>{w.emoji}</Text>
              <Text style={[s.wordChipText, w.found && s.wordChipTextFound]}>{w.word}</Text>
              <Text style={[s.wordChipMeaning, w.found && s.wordChipTextFound]}>{w.meaning}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Grid */}
        <View style={s.grid}>
          {grid.map((row, r) => (
            <View key={r} style={s.gridRow}>
              {row.map((cell, c) => {
                const isSelected = selected.some(([sr, sc]) => sr === r && sc === c);
                const foundWord = words.find(w => w.found && w.cells.some(([wr, wc]) => wr === r && wc === c));
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      s.cell,
                      { width: cellSize, height: cellSize },
                      isSelected && s.cellSelected,
                      foundWord && s.cellFound,
                    ]}
                    onPress={() => touchCell(r, c)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      s.cellLetter,
                      { fontSize: cellSize * 0.45 },
                      isSelected && s.cellLetterSelected,
                      foundWord && s.cellLetterFound,
                    ]}>
                      {cell.letter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.resetBtn} onPress={() => { setSelected([]); setSelecting(false); }}>
          <Text style={s.resetBtnText}>✕ Clear selection</Text>
        </TouchableOpacity>
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
  backText:    { fontSize: FONT.xl, color: COLOR.gold, paddingRight: 4 },
  headerTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream, flex: 1 },
  headerSub:   { fontSize: FONT.xs, color: '#7AB897' },
  roundText:   { fontSize: FONT.sm, color: COLOR.gold, fontWeight: '700' },

  setupPad:    { padding: SPACE.lg, alignItems: 'center' },
  instrEmoji:  { fontSize: 56, marginBottom: SPACE.sm },
  instrTitle:  { fontSize: FONT.xxl, fontWeight: '900', color: COLOR.textPrimary, marginBottom: SPACE.sm },
  instrBody:   { fontSize: FONT.md, color: COLOR.textSecond, textAlign: 'center', lineHeight: 22, marginBottom: SPACE.xl },
  startBtn:    { backgroundColor: COLOR.forest, borderRadius: RADIUS.pill, paddingVertical: 14, paddingHorizontal: 40, marginTop: SPACE.sm },
  startBtnText:{ fontSize: FONT.lg, fontWeight: '800', color: COLOR.textWhite },

  gamePad: { padding: SPACE.sm, paddingBottom: 60, alignItems: 'center' },

  foundBanner: {
    backgroundColor: COLOR.successLight, borderRadius: RADIUS.md,
    padding: SPACE.sm, marginBottom: SPACE.sm,
    borderWidth: 1, borderColor: COLOR.success, width: '100%',
  },
  foundText: { fontSize: FONT.sm, fontWeight: '700', color: COLOR.success, textAlign: 'center' },

  wordListRow: { paddingHorizontal: SPACE.sm, gap: SPACE.sm, marginBottom: SPACE.md },
  wordChip: {
    alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLOR.card, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLOR.border, minWidth: 70,
  },
  wordChipFound:      { backgroundColor: COLOR.successLight, borderColor: COLOR.success },
  wordChipEmoji:      { fontSize: 20, marginBottom: 2 },
  wordChipText:       { fontSize: FONT.xs, fontWeight: '800', color: COLOR.textPrimary },
  wordChipTextFound:  { color: COLOR.success, textDecorationLine: 'line-through' },
  wordChipMeaning:    { fontSize: FONT.xs, color: COLOR.textSecond },

  grid: { backgroundColor: COLOR.card, borderRadius: RADIUS.md, padding: SPACE.xs, borderWidth: 1, borderColor: COLOR.border },
  gridRow: { flexDirection: 'row' },
  cell: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: COLOR.border,
  },
  cellSelected:       { backgroundColor: COLOR.gold + '44' },
  cellFound:          { backgroundColor: COLOR.successLight },
  cellLetter:         { fontWeight: '700', color: COLOR.textPrimary },
  cellLetterSelected: { color: COLOR.clay, fontWeight: '900' },
  cellLetterFound:    { color: COLOR.success, fontWeight: '900' },

  resetBtn: { marginTop: SPACE.md, paddingVertical: 8, paddingHorizontal: 20, backgroundColor: COLOR.clayLight, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: '#E8B090' },
  resetBtnText: { fontSize: FONT.xs, color: COLOR.clay, fontWeight: '700' },
});
