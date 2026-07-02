import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

type Props = {
  avatar?: string;
  name?: string;
  size?: number;
};

const AVATARS: Record<string, ImageSourcePropType> = {
  chinenye: require('../../../assets/illustrations/custom/avatars/chinenye.png'),
  ikenna: require('../../../assets/illustrations/custom/avatars/ikenna.png'),
  adanna: require('../../../assets/illustrations/custom/avatars/adanna.png'),
  emeka: require('../../../assets/illustrations/custom/avatars/emeka.png'),
  uche: require('../../../assets/illustrations/custom/avatars/uche.png'),
  kene: require('../../../assets/illustrations/custom/avatars/kene.png'),
  zane: require('../../../assets/illustrations/custom/avatars/zane.png'),
  nneka: require('../../../assets/illustrations/custom/avatars/nneka.png'),
};

function normalize(value?: string): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim();
}

export function getAvatarIllustrationSource(avatar?: string, name?: string): ImageSourcePropType {
  const key = normalize(avatar || name);

  const direct = AVATARS[key];
  if (direct) return direct;

  // Keep existing app names, only map their art direction.
  if (key.includes('amara')) return AVATARS.chinenye;
  if (key.includes('obi')) return AVATARS.ikenna;

  // Existing emoji/profile fallbacks.
  if (avatar?.includes('👧')) return AVATARS.adanna;
  if (avatar?.includes('👦')) return AVATARS.ikenna;
  if (avatar?.includes('girl')) return AVATARS.adanna;
  if (avatar?.includes('boy')) return AVATARS.ikenna;

  return AVATARS.ikenna;
}

export default function AvatarIllustration({ avatar, name, size = 56 }: Props) {
  const source = getAvatarIllustrationSource(avatar, name);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  image: {
    width: '118%',
    height: '118%',
  },
});
