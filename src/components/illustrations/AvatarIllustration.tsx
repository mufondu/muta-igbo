import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

type Props = {
  avatar?: string;
  name?: string;
  size?: number;
};

const AVATARS: Record<string, ImageSourcePropType> = {
  adaeze: require('../../../assets/illustrations/custom/avatars/adaeze.png'),
  chizara: require('../../../assets/illustrations/custom/avatars/chizara.png'),
  kaira: require('../../../assets/illustrations/custom/avatars/kaira.png'),
  kamsi: require('../../../assets/illustrations/custom/avatars/kamsi.png'),
  natachi: require('../../../assets/illustrations/custom/avatars/natachi.png'),
  onyeka: require('../../../assets/illustrations/custom/avatars/onyeka.png'),
  somto: require('../../../assets/illustrations/custom/avatars/somto.png'),
  emeka: require('../../../assets/illustrations/custom/avatars/emeka.png'),
  chidozie: require('../../../assets/illustrations/custom/avatars/chidozie.png'),
  ifeanyi: require('../../../assets/illustrations/custom/avatars/ifeanyi.png'),
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

  if (AVATARS[key]) return AVATARS[key];

  // Keep existing app character names while mapping them to approved art.
  if (key.includes('amara')) return AVATARS.adaeze;
  if (key.includes('obi')) return AVATARS.emeka;

  // Existing profile/avatar fallback support.
  if (avatar?.includes('👧')) return AVATARS.kaira;
  if (avatar?.includes('👦')) return AVATARS.emeka;
  if (key.includes('girl')) return AVATARS.kaira;
  if (key.includes('boy')) return AVATARS.emeka;

  return AVATARS.emeka;
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
    width: '122%',
    height: '122%',
  },
});
