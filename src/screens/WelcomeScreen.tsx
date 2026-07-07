import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

interface Props { onGetStarted: () => void; }

function FloatingEmoji({ emoji, style }: { emoji: string; style: any }) {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -12, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(float, { toValue: 0, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);
  return <Animated.Text style={[style, { transform: [{ translateY: float }] }]}>{emoji}</Animated.Text>;
}

export default function WelcomeScreen({ onGetStarted }: Props) {
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, damping: 14 }),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      <View style={[s.blob, s.blob1]} />
      <View style={[s.blob, s.blob2]} />
      <View style={[s.blob, s.blob3]} />

      <FloatingEmoji emoji="🌿" style={s.floatA} />
      <FloatingEmoji emoji="⭐" style={s.floatB} />
      <FloatingEmoji emoji="🎵" style={s.floatC} />
      <FloatingEmoji emoji="📚" style={s.floatD} />

      <Animated.View style={[s.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        {/* Logo */}
        <View style={s.logoRow}>
          <View style={s.logoBadge}><Text style={s.logoLeaf}>🌿</Text></View>
          <View>
            <Text style={s.logoTitle}>Mụta Igbo</Text>
            <Text style={s.logoSub}>Central Igbo · Kid-friendly lessons</Text>
          </View>
        </View>

        {/* Igbo children illustration */}
        <View style={s.kidsCard}>
          <View style={s.kidBlock}>
            <View style={s.kidImgWrap}>
              <Image
                source={require('../../assets/images/igbo-girl.png')}
                style={s.kidImg}
                resizeMode="contain"
              />
            </View>
            <View style={s.kidBubble}>
              <Text style={s.kidBubbleText}>"Nnọọ!" 👋🏿</Text>
            </View>
          </View>

          <View style={s.kidDivider}>
            <Text style={s.heartEmoji}>💚</Text>
          </View>

          <View style={s.kidBlock}>
            <View style={s.kidImgWrap}>
              <Image
                source={require('../../assets/images/igbo-boy.png')}
                style={s.kidImg}
                resizeMode="contain"
              />
            </View>
            <View style={s.kidBubble}>
              <Text style={s.kidBubbleText}>"Daalụ!" 🙏🏿</Text>
            </View>
          </View>
        </View>

        {/* Tagline */}
        <Text style={s.tagline}>Learn Igbo the fun way!</Text>
        <Text style={s.taglineSub}>
          Help your child discover the beauty{'\n'}
          of the Igbo language 🌍
        </Text>

        {/* CTA */}
        <TouchableOpacity style={s.ctaBtn} onPress={onGetStarted} activeOpacity={0.85}>
          <Text style={s.ctaText}>Bido — Let's Start! 🚀</Text>
        </TouchableOpacity>

        {/* Badges */}
        <View style={s.badgeRow}>
          {['🇳🇬 Central Igbo', '🎧 Listen & repeat', '✨ Progressive levels'].map(b => (
            <View key={b} style={s.badge}><Text style={s.badgeText}>{b}</Text></View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.forestDark, alignItems: 'center', justifyContent: 'center' },
  blob: { position: 'absolute', borderRadius: 999 },
  blob1: { width: 280, height: 280, backgroundColor: COLOR.forest, opacity: 0.4, top: -60, left: -80 },
  blob2: { width: 200, height: 200, backgroundColor: COLOR.gold,   opacity: 0.15, bottom: 80, right: -60 },
  blob3: { width: 160, height: 160, backgroundColor: COLOR.coral,  opacity: 0.1,  top: 200, right: 20 },

  floatA: { position: 'absolute', fontSize: 32, top: 60,  right: 30, opacity: 0.6 },
  floatB: { position: 'absolute', fontSize: 24, top: 120, left: 25,  opacity: 0.5 },
  floatC: { position: 'absolute', fontSize: 28, bottom: 160, left: 30, opacity: 0.4 },
  floatD: { position: 'absolute', fontSize: 26, bottom: 200, right: 40, opacity: 0.45 },

  content: { width: '100%', paddingHorizontal: SPACE.lg, alignItems: 'center' },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACE.lg },
  logoBadge: {
    width: 52, height: 52, borderRadius: RADIUS.md,
    backgroundColor: COLOR.gold, alignItems: 'center', justifyContent: 'center',
  },
  logoLeaf: { fontSize: 28 },
  logoTitle: { fontSize: FONT.xxxl, fontWeight: '800', color: COLOR.textCream, letterSpacing: 0.5 },
  logoSub:   { fontSize: FONT.xs, color: '#7AB897', marginTop: 2 },

  kidsCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.xl, padding: SPACE.md,
    width: '100%', marginBottom: SPACE.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  kidBlock:  { alignItems: 'center', flex: 1 },
  kidImgWrap: {
    width: 110, height: 110, borderRadius: 55,
    overflow: 'visible',
    borderWidth: 3, borderColor: COLOR.gold,
    marginBottom: SPACE.sm,
  },
  kidImg: { width: '100%', height: '100%' },
  kidBubble: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  kidBubbleText: { fontSize: FONT.sm, color: COLOR.textCream, fontWeight: '600' },
  kidDivider:   { paddingHorizontal: SPACE.md },
  heartEmoji:   { fontSize: 28 },

  tagline:    { fontSize: FONT.xxl, fontWeight: '800', color: COLOR.gold, textAlign: 'center', marginBottom: SPACE.sm },
  taglineSub: { fontSize: FONT.md,  color: '#A8C8B0', textAlign: 'center', lineHeight: 22, marginBottom: SPACE.xl },

  ctaBtn: {
    backgroundColor: COLOR.gold, paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: RADIUS.pill, marginBottom: SPACE.lg, width: '100%', alignItems: 'center',
  },
  ctaText: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.forestDark },

  badgeRow: { flexDirection: 'row', gap: SPACE.sm, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: RADIUS.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeText: { fontSize: FONT.xs, color: '#A8D8B0', fontWeight: '600' },
});
