// ─── Premium Paywall Screen ───────────────────────────────────────────────────
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AvatarIllustration from '../components/illustrations/AvatarIllustration';
import { useApp } from '../hooks/useAppState';
import { KIDS_COLOR, KIDS_SHADOW } from '../theme/kidsTheme';
import { FONT, RADIUS, SPACE } from '../utils/tokens';

interface Props {
  onBack: () => void;
  onUnlocked?: () => void;
}

const FEATURES = [
  { icon: '📚', title: 'All lessons', text: 'Unlock every level from sounds to grammar' },
  { icon: '🎮', title: 'More games', text: 'Practice with quizzes, word games, and play modes' },
  { icon: '📖', title: 'Stories', text: 'Folktales, culture, and family-friendly content' },
  { icon: '🔊', title: 'Audio practice', text: 'Build listening and speaking confidence' },
];

export default function PremiumScreen({ onBack, onUnlocked }: Props) {
  const { setPremium } = useApp();

  function subscribe(plan: 'monthly' | 'yearly') {
    setPremium(true);
    onUnlocked?.();
    onBack();
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back" activeOpacity={0.84}>
          <Text style={s.backText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <View style={s.heroBadge}><Text style={s.heroBadgeText}>MỤTA IGBO PREMIUM</Text></View>
          <View style={s.characterRow}>
            <AvatarIllustration avatar="kaira" size={86} />
            <AvatarIllustration avatar="ekene" size={112} />
            <AvatarIllustration avatar="somto" size={86} />
          </View>
          <Text style={s.heroTitle}>Unlock the full learning adventure</Text>
          <Text style={s.heroSub}>More lessons, more games, more stories, and richer Igbo practice for every child profile.</Text>
        </View>

        <View style={s.featureGrid}>
          {FEATURES.map(f => (
            <View key={f.title} style={s.featureCard}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <Text style={s.featureTitle}>{f.title}</Text>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.planYearly} onPress={() => subscribe('yearly')} activeOpacity={0.88}>
          <View style={s.saveBadge}><Text style={s.saveText}>BEST VALUE</Text></View>
          <Text style={s.planKicker}>Family learning pass</Text>
          <Text style={s.planTitle}>Yearly Plan</Text>
          <Text style={s.planPrice}>$19.99 / year</Text>
          <Text style={s.planSub}>Just $1.67/month · Save 44%</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.planMonthly} onPress={() => subscribe('monthly')} activeOpacity={0.86}>
          <Text style={s.planMonthlyTitle}>Monthly Plan</Text>
          <Text style={s.planMonthlyPrice}>$2.99 / month</Text>
        </TouchableOpacity>

        <Text style={s.legal}>Subscriptions auto-renew unless cancelled 24h before renewal. Managed through your app store account.</Text>

        <TouchableOpacity onPress={onBack} activeOpacity={0.8}>
          <Text style={s.noThanks}>No thanks, stay free</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS_COLOR.palmCream },
  header: { paddingTop: SPACE.lg, paddingHorizontal: SPACE.lg, alignItems: 'flex-end' },
  backBtn: { width: 42, height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: KIDS_COLOR.white, borderWidth: 1, borderColor: KIDS_COLOR.borderSoft },
  backText: { fontSize: 20, color: KIDS_COLOR.deepForest, fontWeight: '900' },
  scroll: { paddingHorizontal: SPACE.md, paddingBottom: 60 },
  heroCard: { ...KIDS_SHADOW.softCard, alignItems: 'center', backgroundColor: KIDS_COLOR.softMint, borderRadius: 36, padding: SPACE.lg, borderWidth: 1.5, borderColor: '#BDEFD2', marginBottom: SPACE.lg },
  heroBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: KIDS_COLOR.sunshine, borderWidth: 1, borderColor: KIDS_COLOR.mango, marginBottom: 10 },
  heroBadgeText: { color: KIDS_COLOR.deepForest, fontSize: FONT.xs, fontWeight: '900', letterSpacing: 1.5 },
  characterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 118, marginBottom: 8 },
  heroTitle: { color: KIDS_COLOR.textPrimary, fontSize: 34, lineHeight: 39, fontWeight: '900', textAlign: 'center', letterSpacing: -0.8 },
  heroSub: { color: KIDS_COLOR.textSecondary, fontSize: FONT.md, lineHeight: 23, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACE.lg },
  featureCard: { ...KIDS_SHADOW.softCard, width: '48%', minHeight: 138, borderRadius: 26, padding: 13, backgroundColor: KIDS_COLOR.white, borderWidth: 1, borderColor: KIDS_COLOR.borderSoft },
  featureIcon: { fontSize: 26, marginBottom: 8 },
  featureTitle: { color: KIDS_COLOR.textPrimary, fontSize: FONT.md, fontWeight: '900', marginBottom: 4 },
  featureText: { color: KIDS_COLOR.textSecondary, fontSize: FONT.xs, lineHeight: 17, fontWeight: '800' },
  planYearly: { ...KIDS_SHADOW.button, backgroundColor: KIDS_COLOR.sunshine, borderRadius: 32, padding: SPACE.lg, alignItems: 'center', marginBottom: SPACE.md, position: 'relative', borderWidth: 1.5, borderColor: KIDS_COLOR.mango },
  saveBadge: { position: 'absolute', top: -11, right: 18, backgroundColor: KIDS_COLOR.coral, paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.pill },
  saveText: { fontSize: FONT.xs, fontWeight: '900', color: KIDS_COLOR.white, letterSpacing: 0.9 },
  planKicker: { fontSize: FONT.xs, color: KIDS_COLOR.deepForest, fontWeight: '900', letterSpacing: 1.3, marginBottom: 4 },
  planTitle: { fontSize: FONT.xl, fontWeight: '900', color: KIDS_COLOR.deepForest, marginBottom: 4 },
  planPrice: { fontSize: 32, fontWeight: '900', color: KIDS_COLOR.deepForest },
  planSub: { fontSize: FONT.sm, color: KIDS_COLOR.forestGreen, marginTop: 4, fontWeight: '900' },
  planMonthly: { backgroundColor: KIDS_COLOR.white, borderRadius: 28, padding: SPACE.md, alignItems: 'center', marginBottom: SPACE.lg, borderWidth: 1.5, borderColor: KIDS_COLOR.borderSoft },
  planMonthlyTitle: { fontSize: FONT.lg, fontWeight: '900', color: KIDS_COLOR.textPrimary, marginBottom: 4 },
  planMonthlyPrice: { fontSize: FONT.xl, fontWeight: '900', color: KIDS_COLOR.palmGreen },
  legal: { fontSize: FONT.xs, color: KIDS_COLOR.textSoft, textAlign: 'center', lineHeight: 18, marginBottom: SPACE.md, paddingHorizontal: SPACE.md, fontWeight: '700' },
  noThanks: { textAlign: 'center', fontSize: FONT.sm, color: KIDS_COLOR.textSecondary, textDecorationLine: 'underline', marginBottom: SPACE.xl, fontWeight: '800' },
});
