import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import AvatarIllustration from '../components/illustrations/AvatarIllustration';
import { useApp } from '../hooks/useAppState';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

type Props = {
  onComplete?: () => void;
};

type Step = 'welcome' | 'profile' | 'age' | 'done';

export function ProfileImage({ avatar, size = 40 }: { avatar: string; size?: number }) {
  return <AvatarIllustration avatar={avatar} size={size} />;
}: { avatar: string; size?: number }) {
  return <AvatarIllustration avatar={avatar} size={size} />;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const { width } = useWindowDimensions();
  const [step, setStep]               = useState<Step>('welcome');
  const [agreed, setAgreed]           = useState(false);
  const [profiles, setProfiles]       = useState<Profile[]>([]);
  const [childName, setChildName]     = useState('');
  const [selectedFriend, setFriend]   = useState<MutaFriendId>('ada');

  const horizontalPadding = SPACE.lg * 2;
  const cardGap = 12;
  const columns = width >= 760 ? 4 : 2;
  const friendCardWidth = Math.floor((width - horizontalPadding - (cardGap * (columns - 1))) / columns);
  const selectedFriendProfile = getMutaFriend(selectedFriend);

  function addChild() {
    if (!childName.trim() || childName.trim().length < 2) {
      Alert.alert('Name required', 'Please enter at least 2 characters.'); return;
    }
    setProfiles(prev => [...prev, makeProfile(childName.trim(), selectedFriend)]);
    setChildName(''); setFriend('ada');
  }

  function finish() {
    if (profiles.length === 0) {
      Alert.alert('Add a child', 'Please add at least one child profile to continue.'); return;
    }
    onComplete(profiles);
  }

  if (step === 'welcome') {
    return (
      <View style={s.root}>
        <View style={s.heroArea}>
          <View style={s.heroKids}>
            <View style={s.heroKidWrap}>
              <Image source={GIRL_IMG} style={s.heroKidImg} resizeMode="cover" />
            </View>
            <View style={s.heroKidWrap}>
              <Image source={BOY_IMG}  style={s.heroKidImg} resizeMode="cover" />
            </View>
          </View>
          <Text style={s.heroTitle}>Welcome to{`\n`}Mụta Igbo</Text>
          <Text style={s.heroSub}>The fun way for children to learn{`\n`}Central Igbo</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>For Parents and Guardians</Text>
          <Text style={s.cardBody}>
            {'✅ Review and agree to our Terms and Privacy Policy\n'}
            {'✅ Create a profile for each child\n'}
            {'✅ Manage subscriptions from Settings'}
          </Text>
        </View>
        <TouchableOpacity style={s.primaryBtn} onPress={() => setStep('terms')} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>Get Started ›</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'terms') {
    return (
      <View style={s.root}>
        <StepDots current={1} total={2} />
        <Text style={s.stepTitle}>Before you continue</Text>
        <Text style={s.stepSub}>Please read and agree as the parent or guardian</Text>
        <ScrollView style={s.termsBox} contentContainerStyle={{ padding: SPACE.md }}>
          <Text style={s.termsPara}>By continuing, you confirm that:</Text>
          <Text style={s.termsPara}>{'• '}You are the parent or legal guardian of the child or children who will use this app.</Text>
          <Text style={s.termsPara}>{'• '}You agree to our Terms and Conditions, Privacy Policy, and Subscription Terms.</Text>
          <Text style={s.termsPara}>{'• '}All profile data is stored locally on this device. We do not collect personal information from children.</Text>
          <Text style={s.termsPara}>{'• '}Subscription purchases are made by you as an adult through your app store account.</Text>
          <Text style={s.termsPara}>{'• '}You can delete all data at any time from Settings.</Text>
        </ScrollView>
        <TouchableOpacity style={s.checkRow} onPress={() => setAgreed(a => !a)} activeOpacity={0.8}>
          <View style={[s.checkbox, agreed && s.checkboxActive]}>
            {agreed && <Text style={s.checkmark}>✓</Text>}
          </View>
          <Text style={s.checkLabel}>I am a parent/guardian and I agree</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.primaryBtn, !agreed && s.primaryBtnDisabled]}
          onPress={() => agreed && setStep('profiles')}
          activeOpacity={agreed ? 0.85 : 1}
        >
          <Text style={s.primaryBtnText}>Continue ›</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.profileRoot}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.profileScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StepDots current={2} total={2} />
        <Text style={s.profileTitle}>Add Child Profile</Text>
        <View style={s.titleUnderline} />
        <Text style={s.profileSub}>Up to 4 children. Each has their own progress.</Text>

        {profiles.map(p => {
          const friend = getMutaFriend(p.avatar);
          return (
            <View key={p.id} style={s.profileChip}>
              <ProfileImage avatar={p.avatar} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={s.profileChipName}>{p.name}</Text>
                <Text style={s.profileChipSub}>{friend.name} is the Mụta Friend</Text>
              </View>
              <TouchableOpacity
                onPress={() => setProfiles(prev => prev.filter(x => x.id !== p.id))}
                style={{ padding: 6 }}>
                <Text style={s.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {profiles.length < 4 && (
          <>
            <View style={s.namePanel}>
              <Text style={s.fieldLabel}>Child's name</Text>
              <TextInput
                style={s.nameInput}
                value={childName}
                onChangeText={setChildName}
                placeholder="e.g. Amara"
                placeholderTextColor="rgba(255,255,255,0.45)"
                maxLength={20}
                autoCapitalize="words"
              />
            </View>

            <Text style={s.chooseTitle}>Choose Your Learning Friend</Text>
            <Text style={s.chooseSub}>Your friend will help your child learn and celebrate every achievement.</Text>

            <View style={[s.friendGrid, { gap: cardGap }]}>
              {MUTA_FRIENDS.map(friend => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  selected={selectedFriend === friend.id}
                  width={friendCardWidth}
                  onPress={() => setFriend(friend.id)}
                />
              ))}
            </View>

            <View style={s.friendSummary}>
              <Text style={s.friendSummaryTitle}>👋 Meet {selectedFriendProfile.name}!</Text>
              <Text style={s.friendSummaryText}>{selectedFriendProfile.description} {selectedFriendProfile.name} can’t wait to learn Igbo with your child.</Text>
            </View>

            <TouchableOpacity style={s.addBtn} onPress={addChild} activeOpacity={0.85}>
              <Text style={s.addBtnText}>+ Add child</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[s.primaryBtn, profiles.length === 0 && s.primaryBtnDisabled, s.startBtn]}
          onPress={finish}
          activeOpacity={profiles.length > 0 ? 0.85 : 1}
        >
          <Text style={s.primaryBtnText}>Start Learning 🚀</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.forestDark, paddingHorizontal: SPACE.lg, paddingTop: 60, paddingBottom: 40 },

  heroArea: { alignItems: 'center', marginBottom: SPACE.lg },
  heroKids: { flexDirection: 'row', gap: SPACE.lg, marginBottom: SPACE.md },
  heroKidWrap: {
    width: 100, height: 100, borderRadius: 50,
    overflow: 'hidden', borderWidth: 3, borderColor: COLOR.gold,
  },
  heroKidImg: { width: '100%', height: '100%' },
  heroTitle: { fontSize: FONT.hero, fontWeight: '900', color: COLOR.gold, textAlign: 'center', lineHeight: 44, marginBottom: SPACE.sm },
  heroSub:   { fontSize: FONT.md, color: '#A8D8B0', textAlign: 'center', lineHeight: 22 },

  card: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.lg, padding: SPACE.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginBottom: SPACE.xl },
  cardTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.gold, marginBottom: SPACE.sm },
  cardBody:  { fontSize: FONT.md, color: COLOR.textCream, lineHeight: 26 },

  stepDots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: SPACE.md },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepDotActive: { backgroundColor: COLOR.gold },
  stepTitle: { fontSize: FONT.xxl, fontWeight: '900', color: COLOR.gold, marginBottom: 4 },
  stepSub:   { fontSize: FONT.sm, color: '#A8D8B0', marginBottom: SPACE.md },

  termsBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, marginBottom: SPACE.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  termsPara: { fontSize: FONT.sm, color: COLOR.textCream, lineHeight: 22, marginBottom: SPACE.sm },

  checkRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACE.lg },
  checkbox:      { width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  checkboxActive:{ backgroundColor: COLOR.gold, borderColor: COLOR.gold },
  checkmark:     { fontSize: 16, color: COLOR.forestDark, fontWeight: '800' },
  checkLabel:    { flex: 1, fontSize: FONT.md, color: COLOR.textCream, fontWeight: '600' },

  primaryBtn:        { backgroundColor: COLOR.gold, borderRadius: RADIUS.pill, paddingVertical: 16, alignItems: 'center' },
  primaryBtnDisabled:{ backgroundColor: 'rgba(212,161,42,0.35)' },
  primaryBtnText:    { fontSize: FONT.lg, fontWeight: '800', color: COLOR.forestDark },

  profileRoot: { flex: 1, backgroundColor: COLOR.forestDark },
  profileScroll: { paddingHorizontal: SPACE.lg, paddingTop: SPACE.md, paddingBottom: 42 },
  profileTitle: { fontSize: 30, fontWeight: '900', color: COLOR.textCream, textAlign: 'center', marginTop: SPACE.sm },
  titleUnderline: { width: 46, height: 4, borderRadius: 2, backgroundColor: COLOR.gold, alignSelf: 'center', marginTop: 10, marginBottom: SPACE.sm },
  profileSub: { fontSize: FONT.md, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: SPACE.lg },

  profileChip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.md,
    padding: SPACE.sm, marginBottom: SPACE.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  profileChipName: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream },
  profileChipSub: { fontSize: FONT.xs, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  removeText: { fontSize: 16, color: 'rgba(255,255,255,0.4)' },

  namePanel: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: SPACE.md,
    marginBottom: SPACE.lg,
  },
  fieldLabel: { fontSize: FONT.sm, color: '#61D391', fontWeight: '800', marginBottom: SPACE.xs },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACE.md,
    paddingVertical: 13,
    fontSize: FONT.lg,
    color: COLOR.textCream,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },

  chooseTitle: { fontSize: 24, fontWeight: '900', color: COLOR.textCream, marginBottom: 5 },
  chooseSub: { fontSize: FONT.sm, color: 'rgba(255,255,255,0.72)', marginBottom: SPACE.md, lineHeight: 20 },
  friendGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACE.lg },
  friendCard: {
    minHeight: 164,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    backgroundColor: 'rgba(255,255,255,0.045)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  friendCardActive: {
    borderColor: COLOR.gold,
    borderWidth: 3,
    backgroundColor: 'rgba(212,161,42,0.1)',
  },
  checkBubble: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLOR.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  checkBubbleText: { color: COLOR.forestDark, fontSize: 18, fontWeight: '900' },
  friendAvatarRing: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.14)',
    marginBottom: 8,
  },
  friendName: { color: COLOR.textCream, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  friendInterest: { color: 'rgba(255,255,255,0.72)', fontSize: FONT.sm, marginTop: 3, textAlign: 'center' },

  friendSummary: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: SPACE.md,
    marginBottom: SPACE.md,
  },
  friendSummaryTitle: { color: COLOR.textCream, fontSize: FONT.lg, fontWeight: '900', marginBottom: 6 },
  friendSummaryText: { color: 'rgba(255,255,255,0.72)', fontSize: FONT.md, lineHeight: 22 },
  addBtn: { backgroundColor: COLOR.forestMid, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center', marginBottom: SPACE.md },
  addBtnText: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream },
  startBtn: { marginBottom: 6 },
});
