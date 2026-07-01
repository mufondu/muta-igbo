import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { COLOR, FONT } from '../../utils/tokens';

type Props = {
  igbo: string;
  english: string;
  emoji?: string;
  size?: number;
  backgroundColor?: string;
};

type IllustrationEntry = {
  keys: string[];
  source?: ImageSourcePropType;
  fallback: string;
};

type FamilyRole = {
  label: string;
  skin: string;
  hair: string;
  shirt: string;
  bg: string;
  accent: string;
};

const FAMILY_ROLES: Record<string, FamilyRole> = {
  grandmother: {
    label: 'Nne',
    skin: '#8B4A2F',
    hair: '#D8D8D8',
    shirt: '#7C3AED',
    bg: '#F4ECFF',
    accent: '#7C3AED',
  },
  grandfather: {
    label: 'Nna',
    skin: '#8B4A2F',
    hair: '#D8D8D8',
    shirt: '#0F766E',
    bg: '#E6FAF8',
    accent: '#0F766E',
  },
  mother: {
    label: 'Mama',
    skin: '#9A5A38',
    hair: '#3A2418',
    shirt: '#DB2777',
    bg: '#FFEAF4',
    accent: '#DB2777',
  },
  father: {
    label: 'Papa',
    skin: '#8B4A2F',
    hair: '#2B1A12',
    shirt: '#2563EB',
    bg: '#EAF2FF',
    accent: '#2563EB',
  },
  brother: {
    label: 'Nwanne',
    skin: '#9A5A38',
    hair: '#2B1A12',
    shirt: '#F97316',
    bg: '#FFF1EA',
    accent: '#F97316',
  },
  sister: {
    label: 'Nwanne',
    skin: '#9A5A38',
    hair: '#3A2418',
    shirt: '#16A34A',
    bg: '#EAFBEF',
    accent: '#16A34A',
  },
  child: {
    label: 'Nwa',
    skin: '#9A5A38',
    hair: '#2B1A12',
    shirt: '#F59E0B',
    bg: '#FFF7D6',
    accent: '#B7791F',
  },
  children: {
    label: 'Ụmụ',
    skin: '#9A5A38',
    hair: '#2B1A12',
    shirt: '#22C55E',
    bg: '#EAFBEF',
    accent: '#087443',
  },
  uncle: {
    label: 'Dee',
    skin: '#8B4A2F',
    hair: '#2B1A12',
    shirt: '#0891B2',
    bg: '#E6FAFA',
    accent: '#0891B2',
  },
  aunt: {
    label: 'Aunty',
    skin: '#9A5A38',
    hair: '#3A2418',
    shirt: '#9333EA',
    bg: '#F4ECFF',
    accent: '#9333EA',
  },
  cousin: {
    label: 'Ibe',
    skin: '#9A5A38',
    hair: '#2B1A12',
    shirt: '#0284C7',
    bg: '#EAF5FF',
    accent: '#0284C7',
  },
};

const ILLUSTRATIONS: IllustrationEntry[] = [
  { keys: ['dog', 'nkịta', 'nkita'], fallback: '🐶' },
  { keys: ['cat', 'nwamba'], fallback: '🐱' },
  { keys: ['chicken', 'ọkụkọ', 'okuko'], fallback: '🐓' },
  { keys: ['goat', 'ewu'], fallback: '🐐' },
  { keys: ['fish', 'azụ', 'azu'], fallback: '🐟' },
  { keys: ['bird', 'nnụnụ', 'nnunu'], fallback: '🐦' },
  { keys: ['leopard', 'tiger', 'agu'], fallback: '🐆' },
  { keys: ['house', 'ụlọ', 'ulo'], fallback: '🏠' },
  { keys: ['water', 'mmiri'], fallback: '💧' },
  { keys: ['food', 'nri'], fallback: '🍲' },
  { keys: ['book', 'akwụkwọ', 'akwukwo'], fallback: '📘' },
  { keys: ['hand', 'aka'], fallback: '✋🏾' },
  { keys: ['eye', 'anya'], fallback: '👁️' },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[ị]/g, 'i')
    .replace(/[ụ]/g, 'u')
    .replace(/[ọ]/g, 'o')
    .replace(/[ṅ]/g, 'n')
    .replace(/[āáà]/g, 'a')
    .replace(/[ēéè]/g, 'e')
    .replace(/[ōóò]/g, 'o');
}

function findFamilyRole(igbo: string, english: string): FamilyRole | null {
  const combined = `${normalize(igbo)} ${normalize(english)}`;

  if (combined.includes('grandmother') || combined.includes('nne ochie')) return FAMILY_ROLES.grandmother;
  if (combined.includes('grandfather') || combined.includes('nna ochie')) return FAMILY_ROLES.grandfather;
  if (combined.includes('mother') || combined.includes('nne')) return FAMILY_ROLES.mother;
  if (combined.includes('father') || combined.includes('nna')) return FAMILY_ROLES.father;
  if (combined.includes('brother') || combined.includes('nwanne nwoke')) return FAMILY_ROLES.brother;
  if (combined.includes('sister') || combined.includes('nwanne nwanyi')) return FAMILY_ROLES.sister;
  if (combined.includes('children') || combined.includes('umu')) return FAMILY_ROLES.children;
  if (combined.includes('child') || combined === 'nwa child') return FAMILY_ROLES.child;
  if (combined.includes('uncle')) return FAMILY_ROLES.uncle;
  if (combined.includes('aunt')) return FAMILY_ROLES.aunt;
  if (combined.includes('cousin') || combined.includes('ibe')) return FAMILY_ROLES.cousin;

  return null;
}

function findIllustration(igbo: string, english: string): IllustrationEntry | undefined {
  const combined = `${normalize(igbo)} ${normalize(english)}`;

  return ILLUSTRATIONS.find(entry =>
    entry.keys.some(key => combined.includes(normalize(key)))
  );
}

function FamilyPortrait({ role, size }: { role: FamilyRole; size: number }) {
  const faceSize = Math.round(size * 0.42);
  const hairSize = Math.round(size * 0.5);

  return (
    <View
      style={[
        styles.familyWrap,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          backgroundColor: role.bg,
          borderColor: role.accent + '55',
        },
      ]}
    >
      <View style={[styles.hair, { width: hairSize, height: hairSize, borderRadius: hairSize / 2, backgroundColor: role.hair }]} />
      <View style={[styles.face, { width: faceSize, height: faceSize, borderRadius: faceSize / 2, backgroundColor: role.skin }]}>
        <View style={styles.eyeRow}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
        <View style={styles.smile} />
      </View>
      <View style={[styles.shirt, { backgroundColor: role.shirt }]} />
      <View style={[styles.rolePill, { backgroundColor: role.accent }]}>
        <Text style={styles.roleText} numberOfLines={1}>{role.label}</Text>
      </View>
    </View>
  );
}

export default function LessonIllustration({
  igbo,
  english,
  emoji,
  size = 74,
  backgroundColor = '#F2EAFE',
}: Props) {
  const familyRole = findFamilyRole(igbo, english);

  if (familyRole) {
    return <FamilyPortrait role={familyRole} size={size} />;
  }

  const entry = findIllustration(igbo, english);
  const source = entry?.source;
  const fallback = entry?.fallback || emoji || '✨';

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          backgroundColor,
        },
      ]}
    >
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <Text style={[styles.fallback, { fontSize: Math.round(size * 0.44) }]}>
          {fallback}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    fontWeight: '900',
    textAlign: 'center',
  },
  familyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  hair: {
    position: 'absolute',
    top: 9,
  },
  face: {
    position: 'absolute',
    top: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 7,
  },
  eye: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E1E1E',
  },
  smile: {
    width: 16,
    height: 7,
    borderBottomWidth: 2,
    borderColor: '#1E1E1E',
    borderRadius: 10,
  },
  shirt: {
    position: 'absolute',
    bottom: 9,
    width: '58%',
    height: '28%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  rolePill: {
    position: 'absolute',
    bottom: 5,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    maxWidth: '86%',
  },
  roleText: {
    color: COLOR.textWhite,
    fontSize: FONT.xs,
    fontWeight: '900',
  },
});
