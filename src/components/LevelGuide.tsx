import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

type Props = {
  activeAvatar?: string;
  levelId?: string;
  accent?: string;
};

const MUTA_GUIDE_IMAGE: ImageSourcePropType = require('../../assets/illustrations/custom/mascot/muta-guide.png');

function getGuideMessage(levelId?: string) {
  switch (levelId) {
    case '4A':
    case '4B':
    case '4':
      return 'Tap the speaker to hear each family word.';
    case '7A':
      return 'Listen, repeat, and trace the sounds.';
    default:
      return 'Let’s learn this one together.';
  }
}

export function GuideBanner({ levelId }: Props) {
  return (
    <View style={s.card}>
      <View style={s.avatarBubble}>
        <Image source={MUTA_GUIDE_IMAGE} style={s.img} resizeMode="contain" />
      </View>

      <View style={s.copy}>
        <Text style={s.name}>🌟 Mụta is your guide!</Text>
        <Text style={s.desc}>{getGuideMessage(levelId)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF7CF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#9BE7B5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  avatarBubble: {
    width: 64,
    height: 64,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
    flexShrink: 0,
  },
  img: {
    width: 70,
    height: 70,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: '#C74400',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  desc: {
    color: '#6B6A58',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
});

export default GuideBanner;
