import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

type Props = {
  avatar?: string;
  name?: string;
  size?: number;
};

const AVATARS: Record<string, ImageSourcePropType> = {
  adaeze: require('../../../assets/illustrations/custom/avatars/adaeze.png'),
  kaira: require('../../../assets/illustrations/custom/avatars/kaira.png'),
  natachi: require('../../../assets/illustrations/custom/avatars/natachi.png'),
  ebube: require('../../../assets/illustrations/custom/avatars/ebube.png'),
  ekene: require('../../../assets/illustrations/custom/avatars/ekene.png'),
  jc: require('../../../assets/illustrations/custom/avatars/jc.png'),
  somto: require('../../../assets/illustrations/custom/avatars/somto.png'),
  onyeka: require('../../../assets/illustrations/custom/avatars/onyeka.png'),
  chizara: require('../../../assets/illustrations/custom/avatars/chizara.png'),
  kamsi: require('../../../assets/illustrations/custom/avatars/kamsi.png'),
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

  const appNameMap: Record<string, ImageSourcePropType> = {
    adaeze: AVATARS.adaeze,
    kaira: AVATARS.kaira,
    natachi: AVATARS.natachi,
    ebube: AVATARS.ebube,
    ekene: AVATARS.ekene,
    jc: AVATARS.jc,
    somto: AVATARS.somto,
    onyeka: AVATARS.onyeka,
    chizara: AVATARS.chizara,
    kamsi: AVATARS.kamsi,
  };

  if (appNameMap[key]) return appNameMap[key];

  return AVATARS.ekene;
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
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  image: {
    width: '112%',
    height: '112%',
  },
});
