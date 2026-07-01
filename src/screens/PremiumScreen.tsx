// ─── Premium Paywall Screen ───────────────────────────────────────────────────
import React from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useApp } from '../hooks/useAppState';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

interface Props {
  onBack: () => void;
  onUnlocked?: () => void;
}

const FEATURES = [
  { emoji: '📚', text: 'All 7 learning levels unlocked' },
  { emoji: '🎯', text: 'Full quiz engine across all content' },
  { emoji: '🦁', text: 'Animals, colours and advanced grammar' },
  { emoji: '🏃🏾', text: 'Verbs, tenses and parts of speech' },
  { emoji: '📖', text: 'All folktales and Enuani stories' },
  { emoji: '🔊', text: 'Dad\'s voice recordings (coming soon)' },
  { emoji: '⭐', text: 'Priority access to new content' },
];

export default function PremiumScreen({ onBack, onUnlocked }: Props) {
  const { setPremium } = useApp();

  function subscribe(plan: 'monthly' | 'yearly') {
    // In production: integrate RevenueCat or Google Play Billing here
    // For now, unlock immediately as a dev stub
    setPremium(true);
    onUnlocked?.();
    onBack();
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🌟</Text>
          <Text style={s.heroTitle}>Go Premium</Text>
          <Text style={s.heroSub}>
            Unlock everything Kaira and Zara need{'\n'}to master the Igbo language
          </Text>
        </View>

        {/* Feature list */}
        <View style={s.featureList}>
          {FEATURES.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.featureEmoji}>{f.emoji}</Text>
              <Text style={s.featureText}>{f.text}</Text>
              <Text style={s.tick}>✅</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <TouchableOpacity style={s.planYearly} onPress={() => subscribe('yearly')} activeOpacity={0.85}>
          <View style={s.saveBadge}><Text style={s.saveText}>BEST VALUE</Text></View>
          <Text style={s.planTitle}>Yearly Plan</Text>
          <Text style={s.planPrice}>$19.99 / year</Text>
          <Text style={s.planSub}>Just $1.67/month · Save 44%</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.planMonthly} onPress={() => subscribe('monthly')} activeOpacity={0.85}>
          <Text style={s.planTitleDark}>Monthly Plan</Text>
          <Text style={s.planPriceDark}>$2.99 / month</Text>
        </TouchableOpacity>

        <Text style={s.legal}>
          Subscriptions auto-renew unless cancelled 24h before renewal.{'\n'}
          Managed through your app store account.
        </Text>

        <TouchableOpacity onPress={onBack}>
          <Text style={s.noThanks}>No thanks, stay free</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.forestDark },
  header: {
    padding: SPACE.lg, alignItems: 'flex-end',
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 20, color: 'rgba(255,255,255,0.6)' },

  scroll: { paddingHorizontal: SPACE.lg, paddingBottom: 60 },

  hero: { alignItems: 'center', marginBottom: SPACE.xl },
  heroEmoji: { fontSize: 56, marginBottom: SPACE.sm },
  heroTitle: { fontSize: FONT.hero, fontWeight: '900', color: COLOR.gold, marginBottom: SPACE.sm },
  heroSub: { fontSize: FONT.md, color: '#A8D8B0', textAlign: 'center', lineHeight: 22 },

  featureList: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.lg, padding: SPACE.md,
    marginBottom: SPACE.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, gap: 12,
  },
  featureEmoji: { fontSize: 22, width: 30 },
  featureText: { flex: 1, fontSize: FONT.md, color: COLOR.textCream, fontWeight: '500' },
  tick: { fontSize: 16 },

  planYearly: {
    backgroundColor: COLOR.gold,
    borderRadius: RADIUS.lg, padding: SPACE.lg,
    alignItems: 'center', marginBottom: SPACE.md,
    position: 'relative',
  },
  saveBadge: {
    position: 'absolute', top: -10, right: 16,
    backgroundColor: COLOR.coral,
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  saveText: { fontSize: FONT.xs, fontWeight: '800', color: COLOR.textWhite, letterSpacing: 0.8 },
  planTitle: { fontSize: FONT.xl, fontWeight: '800', color: COLOR.forestDark, marginBottom: 4 },
  planPrice: { fontSize: FONT.xxl, fontWeight: '900', color: COLOR.forestDark },
  planSub: { fontSize: FONT.sm, color: COLOR.forest, marginTop: 4 },

  planMonthly: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.lg, padding: SPACE.md,
    alignItems: 'center', marginBottom: SPACE.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  planTitleDark: { fontSize: FONT.lg, fontWeight: '700', color: COLOR.textCream, marginBottom: 4 },
  planPriceDark: { fontSize: FONT.xl, fontWeight: '800', color: COLOR.gold },

  legal: {
    fontSize: FONT.xs, color: 'rgba(255,255,255,0.4)',
    textAlign: 'center', lineHeight: 18, marginBottom: SPACE.md,
  },
  noThanks: {
    textAlign: 'center', fontSize: FONT.sm,
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'underline', marginBottom: SPACE.xl,
  },
});