import React from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type GuideBannerProps = {
  text?: string;
  levelId?: string;
  accent?: string;
  activeAvatar?: unknown;
};

type GuideCopy = {
  eyebrow: string;
  title: string;
  body: string;
  action: string;
};

function getGuideCopy(levelId?: string, overrideText?: string): GuideCopy {
  if (overrideText) {
    return {
      eyebrow: 'Mụta’s hint',
      title: overrideText,
      body: 'Try it out loud before you move on.',
      action: 'Say it',
    };
  }

  switch (levelId) {
    case '1':
      return {
        eyebrow: 'First words',
        title: 'Listen first, then copy Mụta.',
        body: 'Say each word slowly. Big voice, brave learner.',
        action: 'Listen',
      };

    case '2':
      return {
        eyebrow: 'Colors & shapes',
        title: 'Point, name it, then say it.',
        body: 'Look around the room and find one more example.',
        action: 'Spot it',
      };

    case '3':
      return {
        eyebrow: 'Counting coach',
        title: 'Count it like a rhythm.',
        body: 'Tap each number as you say it from left to right.',
        action: 'Count',
      };

    case '4':
      return {
        eyebrow: 'Family practice',
        title: 'Tap the sound, then say the name.',
        body: 'Try using it for someone in your family.',
        action: 'Say it',
      };

    case '5':
      return {
        eyebrow: 'Animal explorer',
        title: 'Hear it, say it, then act it out.',
        body: 'Can you make the animal sound too?',
        action: 'Explore',
      };

    case '6':
      return {
        eyebrow: 'Action words',
        title: 'Do the action while you say it.',
        body: 'Moving your body helps the word stick.',
        action: 'Move',
      };

    case '7':
      return {
        eyebrow: 'Home words',
        title: 'Find it at home and name it.',
        body: 'Point to the thing before you tap next.',
        action: 'Find it',
      };

    default:
      return {
        eyebrow: 'Mụta’s hint',
        title: 'Try it three ways.',
        body: 'Listen, say it back, then use it in a tiny sentence.',
        action: 'Practice',
      };
  }
}

export function LevelGuide({ size = 72 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/illustrations/custom/mascot/muta-guide.png')}
      style={[styles.mascotImage, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

export function GuideBanner({
  text,
  levelId,
  accent,
}: GuideBannerProps) {
  const copy = getGuideCopy(levelId, text);
  const guidePulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(guidePulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(guidePulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [guidePulse]);

  const mascotMotion = {
    transform: [
      {
        translateY: guidePulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
      {
        rotate: guidePulse.interpolate({
          inputRange: [0, 1],
          outputRange: ['-1.5deg', '1.5deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.guideShell}>
      <Animated.View style={[styles.guideMascotWrap, mascotMotion]}>
        <LevelGuide size={72} />
      </Animated.View>

      <View style={styles.guideBubble}>
        <View style={styles.bubbleTail} />

        <View style={styles.guideTopRow}>
          <View style={[styles.guideAccentDot, accent ? { backgroundColor: accent } : null]} />
          <Text style={styles.guideEyebrow}>{copy.eyebrow}</Text>
        </View>

        <Text style={styles.guideTitle}>{copy.title}</Text>
        <Text style={styles.guideSub}>{copy.body}</Text>

        <View style={styles.guideActionPill}>
          <Text style={styles.guideActionText}>{copy.action}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mascotImage: {
    width: 72,
    height: 72,
  },

  guideShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },

  guideMascotWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFE28A',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    flexShrink: 0,
  },

  guideBubble: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFF8CF',
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFE28A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  bubbleTail: {
    position: 'absolute',
    left: -9,
    top: 28,
    width: 18,
    height: 18,
    backgroundColor: '#FFF8CF',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFE28A',
    transform: [{ rotate: '45deg' }],
  },

  guideTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 3,
  },

  guideAccentDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#58CC02',
  },

  guideEyebrow: {
    color: '#008A4A',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 0.75,
    textTransform: 'uppercase',
  },

  guideTitle: {
    color: '#D94100',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    letterSpacing: -0.25,
  },

  guideSub: {
    color: '#625F4A',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 2,
  },

  guideActionPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#FFE28A',
  },

  guideActionText: {
    color: '#1B2A6B',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});

export default GuideBanner;
