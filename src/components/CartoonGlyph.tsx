import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CARTOON_PALETTE } from '../design/mutaTheme';
import { COLOR, FONT, RADIUS } from '../utils/tokens';

type Props = {
  label: string;
  size?: number;
  index?: number;
  variant?: 'letter' | 'icon';
};

function pickColor(index: number) {
  return CARTOON_PALETTE[Math.abs(index) % CARTOON_PALETTE.length];
}

export default function CartoonGlyph({ label, size = 58, index = 0, variant = 'letter' }: Props) {
  const bg = pickColor(index);
  const fontSize = variant === 'letter' ? Math.max(20, size * 0.46) : Math.max(18, size * 0.4);
  const display = variant === 'letter' ? label.toUpperCase() : label;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg }]}> 
      <View style={[styles.eye, { left: size * 0.27, top: size * 0.24 }]} />
      <View style={[styles.eye, { right: size * 0.27, top: size * 0.24 }]} />
      <Text style={[styles.label, { fontSize, lineHeight: fontSize + 5 }]} numberOfLines={1} adjustsFontSizeToFit>
        {display}
      </Text>
      <View style={[styles.smile, { width: size * 0.22, bottom: size * 0.18 }]} />
      <View style={[styles.foot, { left: size * 0.2, bottom: -2 }]} />
      <View style={[styles.foot, { right: size * 0.2, bottom: -2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(13,51,32,0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    overflow: 'visible',
  },
  label: {
    color: COLOR.textPrimary,
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
    maxWidth: '82%',
  },
  eye: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLOR.textPrimary,
  },
  smile: {
    position: 'absolute',
    height: 5,
    borderBottomWidth: 2,
    borderBottomColor: COLOR.textPrimary,
    borderRadius: RADIUS.pill,
  },
  foot: {
    position: 'absolute',
    width: 12,
    height: 7,
    borderRadius: 8,
    backgroundColor: COLOR.forestDark,
    opacity: 0.22,
  },
});
