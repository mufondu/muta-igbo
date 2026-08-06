// ─── Parent Gate: required for App Store Kids Category compliance ─────────────
// Blocks access to settings, purchases and external links behind a multiplication
// question that must be TYPED IN (no tappable options a pre-reader could guess).
// After several wrong tries it briefly locks to defeat trial-and-error tapping.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

interface Props {
  visible: boolean;
  onPass: () => void;
  onCancel: () => void;
}

const MAX_TRIES = 3;
const LOCK_SECONDS = 15;

function makeQuestion() {
  const a = 3 + Math.floor(Math.random() * 6);   // 3..8
  const b = 4 + Math.floor(Math.random() * 6);   // 4..9
  return { a, b, answer: a * b };
}

export default function ParentGate({ visible, onPass, onCancel }: Props) {
  const [round, setRound] = useState(0);
  const q = useMemo(makeQuestion, [visible, round]);
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);
  const [tries, setTries] = useState(0);
  const [lockLeft, setLockLeft] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset everything whenever the gate is (re)opened.
  useEffect(() => {
    if (visible) {
      setInput(''); setWrong(false); setTries(0); setLockLeft(0); setRound(r => r + 1);
    }
  }, [visible]);

  // Countdown while locked out.
  useEffect(() => {
    if (lockLeft <= 0) return;
    timer.current = setInterval(() => {
      setLockLeft(s => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          setTries(0); setWrong(false); setRound(r => r + 1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [lockLeft]);

  const locked = lockLeft > 0;

  function submit() {
    if (locked) return;
    const val = parseInt(input.trim(), 10);
    if (val === q.answer) {
      setWrong(false); setInput(''); setTries(0);
      onPass();
      return;
    }
    const nextTries = tries + 1;
    setTries(nextTries);
    setWrong(true);
    setInput('');
    if (nextTries >= MAX_TRIES) {
      setLockLeft(LOCK_SECONDS);
    } else {
      setRound(r => r + 1);   // fresh question on each wrong answer
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.emoji}>🔒</Text>
          <Text style={s.title}>Grown-ups only</Text>
          <Text style={s.sub}>Ask a parent or guardian to solve and type the answer:</Text>

          <Text style={s.question}>{q.a} × {q.b} = ?</Text>

          <TextInput
            style={[s.answerBox, wrong && s.answerBoxWrong]}
            value={input}
            onChangeText={t => setInput(t.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            editable={!locked}
            placeholder="Type answer"
            placeholderTextColor={COLOR.textHint}
            returnKeyType="done"
            onSubmitEditing={submit}
            accessibilityLabel="Type the answer"
          />

          {locked ? (
            <Text style={s.wrongText}>Too many tries. Please wait {lockLeft}s…</Text>
          ) : wrong ? (
            <Text style={s.wrongText}>Not quite — here's a new one.</Text>
          ) : null}

          <TouchableOpacity
            onPress={submit}
            disabled={locked || input.length === 0}
            style={[s.submitBtn, (locked || input.length === 0) && s.submitBtnDisabled]}
            accessibilityLabel="Check answer"
          >
            <Text style={s.submitText}>Enter</Text>
          </TouchableOpacity>

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
  question: { fontSize: FONT.hero, fontWeight: '900', color: COLOR.forest, marginBottom: SPACE.md },
  answerBox: {
    width: 180, minHeight: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md, borderWidth: 2, borderColor: '#B0D8BE',
    textAlign: 'center', fontSize: FONT.xl, fontWeight: '800',
    color: COLOR.forest, paddingHorizontal: 16,
  },
  answerBoxWrong: { borderColor: COLOR.clay },
  wrongText: { fontSize: FONT.xs, color: COLOR.clay, marginTop: SPACE.sm, textAlign: 'center' },
  submitBtn: {
    marginTop: SPACE.md, minWidth: 140, minHeight: 52,
    backgroundColor: COLOR.forest, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  submitBtnDisabled: { backgroundColor: '#C3D6C9' },
  submitText: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textWhite },
  cancelBtn: { marginTop: SPACE.lg, minHeight: 44, justifyContent: 'center', paddingHorizontal: 20 },
  cancelText: { fontSize: FONT.md, color: COLOR.textHint, fontWeight: '600', textDecorationLine: 'underline' },
});
