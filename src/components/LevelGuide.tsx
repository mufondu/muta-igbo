// ─── Level Guides: each Muta Friend hosts a level ─────────────────────────────
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getMutaFriend, MutaFriend } from '../data/mutaFriends';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

// Friend interests map naturally to levels:
// Ada loves books → Alphabet; Amara loves animals → Animals & Colours;
// Chioma loves songs → Greetings (call and response); Kelechi loves drums → Numbers (counting rhythm);
// Chinedu loves stories → Body & Family (family stories); Obinna loves football → Verbs & Actions;
// Ifeoma loves drawing → Grammar (drawing sentences); Ebuka loves puzzles → Games hub.
export const LEVEL_GUIDE: Record<string, string> = {
  '7A': 'ada',
  '6A': 'chioma',
  '5A': 'kelechi',
  '4A': 'chinedu',
  '3A': 'amara',
  '2A': 'obinna',
  '1A': 'ifeoma',
  games: 'ebuka',
};

export function getLevelGuide(levelId: string): MutaFriend {
  return getMutaFriend(LEVEL_GUIDE[levelId] ?? 'ada');
}

// Small banner shown at the top of a level: friend avatar plus welcome line.
export function GuideBanner({ levelId, accent }: { levelId: string; accent?: string }) {
  const guide = getLevelGuide(levelId);
  return (
    <View style={[s.wrap, accent ? { borderColor: accent + '55' } : null]}>
      <Image source={guide.image} style={s.img} resizeMode="contain" />
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{guide.icon} {guide.name} is your guide!</Text>
        <Text style={s.desc}>{guide.description}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF6D6',
    borderWidth: 2, borderColor: '#F0C84A',
    borderRadius: RADIUS.lg,
    padding: SPACE.sm, paddingHorizontal: SPACE.md,
    marginBottom: SPACE.md,
  },
  img: { width: 56, height: 56 },
  name: { fontSize: FONT.md, fontWeight: '900', color: COLOR.clay },
  desc: { fontSize: FONT.xs, color: COLOR.textSecond, marginTop: 2 },
});
