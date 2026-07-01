import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HISTORY_SECTIONS } from '../data/history';
import { COLOR, FONT, IS_TABLET, RADIUS, SPACE } from '../utils/tokens';

interface Props { onBack: () => void; }

export default function HistoryScreen({ onBack }: Props) {
  const [activeSection, setActiveSection] = useState(HISTORY_SECTIONS[0].id);
  const [expandedFact, setExpandedFact] = useState<string | null>(null);
  const section = HISTORY_SECTIONS.find(s => s.id === activeSection)!;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backText}>⬅</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Akụkọ Ihe Mere Ụwa 🌍</Text>
          <Text style={s.headerSub}>History of the Igbo People</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabRow} style={s.tabScroll}>
        {HISTORY_SECTIONS.map(sec => (
          <TouchableOpacity key={sec.id}
            style={[s.tab, activeSection === sec.id && s.tabActive]}
            onPress={() => { setActiveSection(sec.id); setExpandedFact(null); }}>
            <Text style={s.tabEmoji}>{sec.emoji}</Text>
            <Text style={[s.tabText, activeSection === sec.id && s.tabTextActive]}
              numberOfLines={2}>{sec.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.factList} showsVerticalScrollIndicator={false}>
        <View style={s.sectionHeader}>
          <Text style={{ fontSize: 36 }}>{section.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Text style={s.sectionIgbo}>{section.igboTitle}</Text>
          </View>
        </View>

        {section.facts.map(fact => (
          <TouchableOpacity key={fact.id}
            style={[s.factCard, expandedFact === fact.id && s.factCardExpanded]}
            onPress={() => setExpandedFact(expandedFact === fact.id ? null : fact.id)}
            activeOpacity={0.85}>
            <View style={s.factTop}>
              <View style={s.factEmojiWrap}>
                <Text style={s.factEmoji}>{fact.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.factMeta}>
                  <View style={s.eraBadge}><Text style={s.eraText}>{fact.era}</Text></View>
                  <Text style={s.factYear}>{fact.year}</Text>
                </View>
                <Text style={s.factTitle}>{fact.title}</Text>
                <Text style={s.factIgbo}>{fact.igboTitle}</Text>
              </View>
              <Text style={s.expandIcon}>{expandedFact === fact.id ? '▲' : '▼'}</Text>
            </View>
            {expandedFact === fact.id && (
              <View style={s.factBody}>
                <Text style={s.factText}>{fact.body}</Text>
                <View style={s.sourceRow}>
                  <Text style={s.sourceLabel}>Source: </Text>
                  <Text style={s.sourceText}>{fact.source}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLOR.forestDark,
    paddingVertical: 14, paddingHorizontal: SPACE.md,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: FONT.xl, color: COLOR.gold },
  headerTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream },
  headerSub: { fontSize: FONT.xs, color: '#7AB897', marginTop: 2 },
  tabScroll: { maxHeight: IS_TABLET ? 110 : 90, backgroundColor: COLOR.forestDark },
  tabRow: { paddingHorizontal: SPACE.md, paddingBottom: SPACE.sm, paddingTop: 4, gap: SPACE.sm, flexDirection: 'row' },
  tab: {
    alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    width: IS_TABLET ? 120 : 90,
  },
  tabActive: { backgroundColor: COLOR.gold, borderColor: COLOR.gold },
  tabEmoji: { fontSize: IS_TABLET ? 22 : 18, marginBottom: 3 },
  tabText: { fontSize: FONT.xs, color: '#A8D8B0', textAlign: 'center', lineHeight: 14 },
  tabTextActive: { color: COLOR.forestDark, fontWeight: '800' },
  factList: { padding: SPACE.md },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLOR.forestLight, borderRadius: RADIUS.md,
    padding: SPACE.md, marginBottom: SPACE.md,
    borderWidth: 1, borderColor: '#B0D8BE',
  },
  sectionTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.forest },
  sectionIgbo: { fontSize: FONT.sm, color: COLOR.textSecond, marginTop: 2, fontStyle: 'italic' },
  factCard: {
    backgroundColor: COLOR.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLOR.border,
    marginBottom: SPACE.sm, overflow: 'visible',
  },
  factCardExpanded: { borderColor: COLOR.forest, borderWidth: 1.5 },
  factTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: SPACE.md },
  factEmojiWrap: {
    width: IS_TABLET ? 56 : 46, height: IS_TABLET ? 56 : 46,
    borderRadius: RADIUS.sm, backgroundColor: COLOR.forestLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  factEmoji: { fontSize: IS_TABLET ? 28 : 24 },
  factMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  eraBadge: {
    backgroundColor: COLOR.goldLight, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLOR.goldBorder,
  },
  eraText: { fontSize: FONT.xs, color: COLOR.clay, fontWeight: '700' },
  factYear: { fontSize: FONT.xs, color: COLOR.textHint },
  factTitle: { fontSize: IS_TABLET ? FONT.lg : FONT.md, fontWeight: '800', color: COLOR.textPrimary },
  factIgbo: { fontSize: FONT.xs, color: COLOR.forest, fontStyle: 'italic', marginTop: 2 },
  expandIcon: { fontSize: 12, color: COLOR.textHint, paddingLeft: 4 },
  factBody: {
    paddingHorizontal: SPACE.md, paddingBottom: SPACE.md,
    borderTopWidth: 1, borderTopColor: COLOR.border,
  },
  factText: {
    fontSize: IS_TABLET ? FONT.md : FONT.sm,
    color: COLOR.textPrimary, lineHeight: IS_TABLET ? 26 : 22, marginTop: SPACE.sm,
  },
  sourceRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginTop: SPACE.sm, paddingTop: SPACE.sm,
    borderTopWidth: 1, borderTopColor: COLOR.border,
  },
  sourceLabel: { fontSize: FONT.xs, color: COLOR.textHint, fontWeight: '700' },
  sourceText: { fontSize: FONT.xs, color: COLOR.textHint, flex: 1 },
});
