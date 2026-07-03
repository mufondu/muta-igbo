// ─── Parent Gate: required for App Store Kids Category compliance ─────────────
// Blocks access to settings, purchases and external links behind a simple
// multiplication question that pre-readers cannot answer.
import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

interface Props {
  visible: boolean;
  onPass: () => void;
  onCancel: () => void;
}

function makeQuestion() {
  const a = 3 + Math.floor(Math.random() * 6);   // 3..8
  const b = 4 + Math.floor(Math.random() * 6);   // 4..9
  const answer = a * b;
  // Build 4 options including the answer
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const delta = (Math.floor(Math.random() * 10) - 5) || 3;
    const wrong = answer + delta;
    if (wrong > 0) opts.add(wrong);
  }
  return { a, b, answer, options: [...opts].sort(() => Math.random() - 0.5) };
}

export default function ParentGate({ visible, onPass, onCancel }: Props) {
  const [attempt, setAttempt] = useState(0);
  const q = useMemo(makeQuestion, [visible, attempt]);
  const [wrongPick, setWrongPick] = useState(false);

  function pick(n: number) {
    if (n === q.answer) {
      setWrongPick(false);
      onPass();
    } else {
      setWrongPick(true);
      setAttempt(x => x + 1);   // regenerate question on wrong answer
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.emoji}>🔒</Text>
          <Text style={s.title}>Grown-ups only</Text>
          <Text style={s.sub}>Ask a parent or guardian to answer:</Text>

          <Text style={s.question}>{q.a} × {q.b} = ?</Text>
          {wrongPick && <Text style={s.wrongText}>Not quite, try this one:</Text>}

          <View style={s.optRow}>
            {q.options.map(n => (
              <TouchableOpacity
                key={n}
                style={s.optBtn}
                onPress={() => pick(n)}
                accessibilityLabel={`Answer ${n}`}
              >
                <Text style={s.optText}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={onCancel} style={s.cancelBtn} accessibilityLabel="Cancel">
            <Text style={s.cancelText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(13,51,32,0.85)',
    alignItems: 'center', justifyContent: 'center', padding: SPACE.lg,
  },
  card: {
    width: '100%', maxWidth: 360,
    backgroundColor: '#FFFDF8', borderRadius: RADIUS.xl,
    padding: SPACE.xl, alignItems: 'center',
    borderWidth: 2, borderColor: '#F0EBE0',
  },
  emoji: { fontSize: 40, marginBottom: SPACE.sm },
  title: { fontSize: FONT.xxl, fontWeight: '900', color: COLOR.textPrimary },
  sub: { fontSize: FONT.sm, color: COLOR.textSecond, marginTop: 4, marginBottom: SPACE.md, textAlign: 'center' },
  question: { fontSize: FONT.hero, fontWeight: '900', color: COLOR.forest, marginBottom: SPACE.sm },
  wrongText: { fontSize: FONT.xs, color: COLOR.clay, marginBottom: SPACE.xs },
  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm, justifyContent: 'center', marginTop: SPACE.sm },
  optBtn: {
    minWidth: 64, minHeight: 56,
    backgroundColor: COLOR.forestLight,
    borderRadius: RADIUS.md, borderWidth: 2, borderColor: '#B0D8BE',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16,
  },
  optText: { fontSize: FONT.xl, fontWeight: '800', color: COLOR.forest },
  cancelBtn: { marginTop: SPACE.lg, minHeight: 44, justifyContent: 'center', paddingHorizontal: 20 },
  cancelText: { fontSize: FONT.md, color: COLOR.textHint, fontWeight: '600', textDecorationLine: 'underline' },
});
