import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AvatarIllustration from '../components/illustrations/AvatarIllustration';
import { Profile } from '../hooks/useAppState';
import { KIDS_COLOR, KIDS_SHADOW } from '../theme/kidsTheme';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';


type Props = {
  onComplete?: (profiles: Profile[]) => void;
};

type Step = 'welcome' | 'terms' | 'profiles' | 'profile' | 'age' | 'done';

type MutaFriendId =
  | 'adaeze'
  | 'kaira'
  | 'natachi'
  | 'ebube'
  | 'ekene'
  | 'jc'
  | 'somto'
  | 'onyeka'
  | 'chizara'
  | 'kamsi';

type MutaFriend = {
  id: MutaFriendId;
  name: string;
  subtitle: string;
  description: string;
};

const GIRL_IMG = require('../../assets/illustrations/custom/avatars/kaira.png');
const BOY_IMG = require('../../assets/illustrations/custom/avatars/ekene.png');

const MUTA_FRIENDS: MutaFriend[] = [
  { id: 'adaeze', name: 'Adaeze', subtitle: 'Kind and curious', description: 'Kind and curious,' },
  { id: 'kaira', name: 'Kaira', subtitle: 'Sound star', description: 'Kaira loves sounds and songs.' },
  { id: 'natachi', name: 'Natachi', subtitle: 'Reading friend', description: 'Natachi enjoys reading.' },
  { id: 'ebube', name: 'Ebube', subtitle: 'Bright helper', description: 'Ebube is ready to help.' },
  { id: 'ekene', name: 'Ekene', subtitle: 'Word explorer', description: 'Ekene loves discovering new words.' },
  { id: 'jc', name: 'JC', subtitle: 'Brave learner', description: 'JC learns with courage.' },
  { id: 'somto', name: 'Somto', subtitle: 'Story friend', description: 'Somto enjoys stories and games.' },
  { id: 'onyeka', name: 'Onyeka', subtitle: 'Culture buddy', description: 'Onyeka loves culture and family.' },
  { id: 'chizara', name: 'Chizara', subtitle: 'Animal guide', description: 'Chizara loves animals and nature.' },
  { id: 'kamsi', name: 'Kamsi', subtitle: 'Little helper', description: 'Kamsi is a cheerful helper.' },
]

function getMutaFriend(id: MutaFriendId): MutaFriend {
  return MUTA_FRIENDS.find(friend => friend.id === id) || MUTA_FRIENDS[0];
}

function makeProfile(name: string, avatar: MutaFriendId): Profile {
  const now = new Date().toISOString();

  const profile = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    avatar,
    streak: 0,
    lastActive: now,
    levelProgress: {},
    quizBest: 0,
    stars: 0,
    badges: [],
    completedLessons: [],
    wordsLearned: 0,
    goalDate: now,
    goalCount: 10,
    createdAt: now,
  };

  return profile as unknown as Profile;
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 12 }}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={{
            width: index + 1 === current ? 22 : 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: index + 1 === current ? COLOR.forestMid : 'rgba(0,0,0,0.15)',
          }}
        />
      ))}
    </View>
  );
}

function FriendCard({
  friend,
  selected,
  onPress,
}: {
  friend: MutaFriend;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        s.avatarRosterCard,
        selected && s.avatarRosterCardSelected,
      ]}
    >
      <View style={[s.avatarRosterImageWrap, selected && s.avatarRosterImageWrapSelected]}>
        <AvatarIllustration avatar={friend.id} size={74} />
      </View>
      <Text style={s.avatarRosterName} numberOfLines={1}>{friend.name}</Text>
      <Text style={s.avatarRosterSub} numberOfLines={1}>{friend.subtitle}</Text>
    </TouchableOpacity>
  );
}


export function ProfileImage({ avatar, size = 40 }: { avatar: string; size?: number }) {
  return <AvatarIllustration avatar={avatar} size={size} />;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const { width } = useWindowDimensions();
  const [step, setStep]               = useState<Step>('welcome');
  const [agreed, setAgreed]           = useState(false);
  const [profiles, setProfiles]       = useState<Profile[]>([]);
  const [childName, setChildName]     = useState('');
  const [selectedFriend, setFriend]   = useState<MutaFriendId>('adaeze');

  const horizontalPadding = SPACE.sm * 2;
  const selectedFriendProfile = getMutaFriend(selectedFriend);

  function addChild() {
    if (!childName.trim() || childName.trim().length < 2) {
      Alert.alert('Name required', 'Please enter at least 2 characters.'); return;
    }
    setProfiles(prev => [...prev, makeProfile(childName.trim(), selectedFriend)]);
    setChildName(''); setFriend('adaeze');
  }

  function finish() {
    if (profiles.length === 0) {
      Alert.alert('Add a child', 'Please add at least one child profile to continue.'); return;
    }
    onComplete?.(profiles);
  }

  if (step === 'welcome') {
    return (
      <SafeAreaView style={s.welcomeRoot}>
        <ScrollView contentContainerStyle={s.welcomeScroll} showsVerticalScrollIndicator={false}>
          <View style={s.welcomeHero}>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>MỤTA IGBO</Text>
            </View>

            <View style={s.heroAvatarRow}>
              <View style={[s.heroAvatarShell, s.heroAvatarSmall]}>
                <View style={[s.heroAura, s.heroAuraSide]} />
                <AvatarIllustration avatar="kaira" size={92} />
              </View>
              <View style={[s.heroAvatarShell, s.heroAvatarMain]}>
                <View style={[s.heroAura, s.heroAuraMain]} />
                <AvatarIllustration avatar="ekene" size={126} />
              </View>
              <View style={[s.heroAvatarShell, s.heroAvatarSmall]}>
                <View style={[s.heroAura, s.heroAuraSide]} />
                <AvatarIllustration avatar="somto" size={92} />
              </View>
            </View>

            <Text style={s.welcomeTitle}>Start your child’s Igbo adventure</Text>
            <Text style={s.welcomeSub}>
              A playful, story-rich learning game for Central Igbo and Enuani practice.
            </Text>

            <View style={s.heroStatsRow}>
              <View style={s.heroStatPill}>
                <Text style={s.heroStatIcon}>🎧</Text>
                <Text style={s.heroStatText}>Listen</Text>
              </View>
              <View style={s.heroStatPill}>
                <Text style={s.heroStatIcon}>🎮</Text>
                <Text style={s.heroStatText}>Play</Text>
              </View>
              <View style={s.heroStatPill}>
                <Text style={s.heroStatIcon}>🌍</Text>
                <Text style={s.heroStatText}>Culture</Text>
              </View>
            </View>
          </View>

          <View style={s.parentCardPremium}>
            <View style={s.parentCardHeader}>
              <Text style={s.parentCardKicker}>FOR PARENTS</Text>
              <Text style={s.parentCardTitle}>Set up once. Let them learn daily.</Text>
            </View>

            <View style={s.parentBullet}>
              <Text style={s.parentCheck}>✓</Text>
              <Text style={s.parentBulletText}>Review terms and privacy before setup</Text>
            </View>
            <View style={s.parentBullet}>
              <Text style={s.parentCheck}>✓</Text>
              <Text style={s.parentBulletText}>Create child profiles with learning friends</Text>
            </View>
            <View style={s.parentBullet}>
              <Text style={s.parentCheck}>✓</Text>
              <Text style={s.parentBulletText}>Track progress, streaks, quiz wins, and practice</Text>
            </View>
          </View>

          <TouchableOpacity style={s.welcomePrimaryBtn} onPress={() => setStep('terms')} activeOpacity={0.9}>
            <Text style={s.welcomePrimaryText}>Get Started</Text>
            <Text style={s.welcomePrimaryArrow}>›</Text>
          </TouchableOpacity>

          <Text style={s.welcomeFinePrint}>
            Built for children learning Igbo with confidence, joy, and family support.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'terms') {
    return (
      <SafeAreaView style={s.termsRoot}>
        <ScrollView contentContainerStyle={s.termsScroll} showsVerticalScrollIndicator={false}>
          <View style={s.termsHero}>
            <View style={s.termsBadge}>
              <Text style={s.termsBadgeText}>PARENT CHECKPOINT</Text>
            </View>

            <View style={s.termsAvatarStack}>
              <AvatarIllustration avatar="adaeze" size={92} />
              <AvatarIllustration avatar="ekene" size={104} />
              <AvatarIllustration avatar="kaira" size={92} />
            </View>

            <Text style={s.termsTitle}>Before the adventure begins</Text>
            <Text style={s.termsSub}>
              Review the parent guidance, agree to the basics, then create your child profile.
            </Text>
          </View>

          <View style={s.termsCardPremium}>
            <View style={s.termsRow}>
              <Text style={s.termsIcon}>✓</Text>
              <View style={s.termsCopy}>
                <Text style={s.termsRowTitle}>Child-first learning</Text>
                <Text style={s.termsRowText}>Mụta Igbo is designed as a kid-friendly language practice game.</Text>
              </View>
            </View>

            <View style={s.termsRow}>
              <Text style={s.termsIcon}>✓</Text>
              <View style={s.termsCopy}>
                <Text style={s.termsRowTitle}>Parent-managed setup</Text>
                <Text style={s.termsRowText}>A parent or guardian should create and manage each child profile.</Text>
              </View>
            </View>

            <View style={s.termsRow}>
              <Text style={s.termsIcon}>✓</Text>
              <View style={s.termsCopy}>
                <Text style={s.termsRowTitle}>Respectful privacy</Text>
                <Text style={s.termsRowText}>Use the app with care and review Terms and Privacy before continuing.</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[s.agreeCard, agreed && s.agreeCardActive]}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.88}
          >
            <View style={[s.agreeCheck, agreed && s.agreeCheckActive]}>
              <Text style={s.agreeCheckText}>{agreed ? '✓' : ''}</Text>
            </View>
            <Text style={s.agreeText}>I agree to the Terms and Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.welcomePrimaryBtn, !agreed && s.finishBtnDisabled]}
            onPress={() => agreed && setStep('profiles')}
            activeOpacity={0.9}
          >
            <Text style={s.welcomePrimaryText}>Continue to Profile Setup</Text>
            <Text style={s.welcomePrimaryArrow}>›</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.profileRoot}>
      <ScrollView contentContainerStyle={s.profileScroll} showsVerticalScrollIndicator={false}>
        <View style={s.profileHeader}>
          <Text style={s.kicker}>PLAYER SETUP</Text>
          <Text style={s.profileTitle}>Add Child Profile</Text>
          <Text style={s.profileSub}>Pick a learning friend, add a name, and start the Igbo adventure.</Text>
        </View>

        <View style={s.selectedHero}>
          <View style={s.selectedAvatarWrap}>
            <AvatarIllustration avatar={selectedFriend} size={132} />
          </View>
          <View style={s.selectedHeroText}>
            <Text style={s.selectedLabel}>Current friend</Text>
            <Text style={s.selectedName}>{selectedFriendProfile.name}</Text>
            <Text style={s.selectedDesc}>{selectedFriendProfile.description}</Text>
          </View>
        </View>

        <View style={s.nameCard}>
          <Text style={s.inputLabel}>Child name</Text>
          <TextInput
            value={childName}
            onChangeText={setChildName}
            placeholder="e.g. Zara"
            placeholderTextColor="rgba(255, 248, 223, 0.45)"
            style={s.nameInput}
          />
          <TouchableOpacity style={s.addBtn} onPress={addChild} activeOpacity={0.88}>
            <Text style={s.addBtnText}>Add Profile +</Text>
          </TouchableOpacity>
        </View>

        {profiles.length > 0 ? (
          <View style={s.createdWrap}>
            <Text style={s.createdTitle}>Ready players</Text>
            {profiles.map(p => {
              const friend = getMutaFriend(p.avatar as unknown as MutaFriendId);
              return (
                <View key={p.id} style={s.createdPill}>
                  <AvatarIllustration avatar={p.avatar} size={34} />
                  <Text style={s.createdName}>{p.name}</Text>
                  <Text style={s.createdFriend}>{friend.name}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={s.friendSectionHeader}>
          <Text style={s.friendSectionTitle}>Choose a learning friend</Text>
          <Text style={s.friendSectionSub}>Tap a card</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.avatarRoster}
        >
          {MUTA_FRIENDS.map(friend => (
            <FriendCard
              key={friend.id}
              friend={friend}
              selected={selectedFriend === friend.id}
              onPress={() => setFriend(friend.id)}
            />
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[s.finishBtn, profiles.length === 0 && s.finishBtnDisabled]}
          onPress={finish}
          activeOpacity={0.88}
        >
          <Text style={s.finishBtnText}>Start Learning Adventure</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


const s = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },

  termsRoot: {
    flex: 1,
    backgroundColor: KIDS_COLOR.palmCream,
  },
  termsScroll: {
    flexGrow: 1,
    paddingHorizontal: SPACE.md,
    paddingTop: 28,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  termsHero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  termsBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 161, 42, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 161, 42, 0.34)',
    marginBottom: 14,
  },
  termsBadgeText: {
    color: KIDS_COLOR.mango,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  termsAvatarStack: {
    overflow: 'visible',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 112,
    marginBottom: 10,
    borderWidth: 0,
  },
  termsTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  termsSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  termsCardPremium: {
    ...KIDS_SHADOW.softCard,
    padding: 16,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    marginBottom: 14,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  termsIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 216, 121, 0.20)',
    color: '#7CFFB4',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 16,
    fontWeight: '900',
    marginRight: 10,
  },
  termsCopy: {
    flex: 1,
  },
  termsRowTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  termsRowText: {
    color: KIDS_COLOR.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    marginTop: 3,
  },
  agreeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 22,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    marginBottom: 14,
  },
  agreeCardActive: {
    backgroundColor: 'rgba(212, 161, 42, 0.16)',
    borderColor: COLOR.gold,
  },
  agreeCheck: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    marginRight: 10,
  },
  agreeCheckActive: {
    backgroundColor: KIDS_COLOR.sunshine,
    borderColor: COLOR.gold,
  },
  agreeCheckText: {
    color: KIDS_COLOR.deepForest,
    fontSize: 16,
    fontWeight: '900',
  },
  agreeText: {
    flex: 1,
    color: KIDS_COLOR.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },

  avatarRoster: {
    paddingVertical: 8,
    paddingHorizontal: 2,
    gap: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },
  avatarRosterCard: {
    ...KIDS_SHADOW.softCard,
    width: 104,
    minHeight: 138,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },
  avatarRosterCardSelected: {
    backgroundColor: 'rgba(212, 161, 42, 0.22)',
    borderWidth: 0,
    transform: [{ scale: 1.04 }],
    overflow: 'visible',
  },
  avatarRosterImageWrap: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
overflow: 'visible',
  },
  avatarRosterImageWrapSelected: {
    backgroundColor: 'transparent', 161, 42, 0.16)',
    borderWidth: 0,
    overflow: 'visible',
  },
  avatarRosterName: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },
  avatarRosterSub: {
    color: KIDS_COLOR.textSoft,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },

  welcomeRoot: {
    flex: 1,
    backgroundColor: KIDS_COLOR.palmCream,
  },
  welcomeScroll: {
    flexGrow: 1,
    paddingHorizontal: SPACE.md,
    paddingTop: 28,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  welcomeHero: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 22,
  },
  heroBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 161, 42, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 161, 42, 0.36)',
    marginBottom: 18,
  },
  heroBadgeText: {
    color: KIDS_COLOR.mango,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  heroAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 142,
    marginBottom: 18,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },
  heroAvatarShell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
overflow: 'visible',
  },
  heroAura: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(212, 161, 42, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 223, 0.10)',
  },
  heroAuraMain: {
    width: 146,
    height: 146,
    opacity: 0.72,
  },
  heroAuraSide: {
    width: 104,
    height: 104,
    opacity: 0.42,
  },
  heroAvatarMain: {
    width: 132,
    height: 132,
    borderRadius: 999,
    marginHorizontal: -2,
    zIndex: 2,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },
  heroAvatarSmall: {
    width: 96,
    height: 96,
    borderRadius: 999,
    opacity: 0.98,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },
  welcomeTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginHorizontal: 8,
  },
  welcomeSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  heroStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
  },
  heroStatIcon: {
    fontSize: 15,
    marginRight: 5,
  },
  heroStatText: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  parentCardPremium: {
    ...KIDS_SHADOW.softCard,
    padding: 18,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    marginTop: 12,
    marginBottom: 18,
  },
  parentCardHeader: {
    marginBottom: 12,
  },
  parentCardKicker: {
    color: KIDS_COLOR.mango,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 5,
  },
  parentCardTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  parentBullet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  parentCheck: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 216, 121, 0.20)',
    color: '#7CFFB4',
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 16,
    fontWeight: '900',
    marginRight: 10,
  },
  parentBulletText: {
    flex: 1,
    color: KIDS_COLOR.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  welcomePrimaryBtn: {
    minHeight: 62,
    borderRadius: 999,
    backgroundColor: KIDS_COLOR.palmGreen,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.20,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  welcomePrimaryText: {
    color: KIDS_COLOR.white,
    fontSize: 19,
    fontWeight: '900',
  },
  welcomePrimaryArrow: {
    color: KIDS_COLOR.white,
    fontSize: 32,
    fontWeight: '900',
    marginLeft: 8,
    marginTop: -2,
  },
  welcomeFinePrint: {
    color: KIDS_COLOR.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 20,
  },

  kicker: {
    color: KIDS_COLOR.mango,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  selectedHero: {
    ...KIDS_SHADOW.softCard,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    marginBottom: 14,
  },
  selectedAvatarWrap: {
    borderWidth: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  selectedHeroText: {
    flex: 1,
  },
  selectedLabel: {
    color: KIDS_COLOR.textSoft,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  selectedName: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2,
  },
  selectedDesc: {
    color: KIDS_COLOR.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  nameCard: {
    ...KIDS_SHADOW.softCard,
    padding: 14,
    borderRadius: 26,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    marginBottom: 16,
  },
  inputLabel: {
    color: KIDS_COLOR.mango,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  nameInput: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    color: KIDS_COLOR.textPrimary,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    fontSize: 18,
    fontWeight: '800',
  },
  addBtn: {
    marginTop: 10,
    minHeight: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.sunshine,
  },
  addBtnText: {
    color: KIDS_COLOR.deepForest,
    fontSize: 16,
    fontWeight: '900',
  },
  createdWrap: {
    marginBottom: 16,
  },
  createdTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  createdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    borderRadius: 999,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
  },
  createdName: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 8,
  },
  createdFriend: {
    color: KIDS_COLOR.textSoft,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  friendSectionHeader: {
    marginBottom: 10,
  },
  friendSectionTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  friendSectionSub: {
    color: KIDS_COLOR.textSoft,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  friendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  friendTile: {
    minHeight: 154,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  friendGlow: {
    borderWidth: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
},
  friendGlowSelected: {
    backgroundColor: 'rgba(212, 161, 42, 0.18)',
  },
  friendName: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
  },
  friendSub: {
    color: KIDS_COLOR.textSoft,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  friendSelected: {
    color: KIDS_COLOR.mango,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 5,
  },
  finishBtn: {
    minHeight: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.sunshine,
    marginTop: 18,
    marginBottom: 28,
  },
  finishBtnDisabled: {
    opacity: 0.45,
  },
  finishBtnText: {
    color: KIDS_COLOR.deepForest,
    fontSize: 17,
    fontWeight: '900',
  },

  root: { flex: 1, backgroundColor: KIDS_COLOR.palmCream, paddingHorizontal: SPACE.md, paddingTop: 60, paddingBottom: 40 },

  heroArea: { alignItems: 'center', marginBottom: SPACE.lg },
  heroKids: { flexDirection: 'row', gap: SPACE.lg, marginBottom: SPACE.md },
  heroKidWrap: {
    width: 100, height: 100, borderRadius: 50,
    overflow: 'hidden', borderWidth: 3, borderColor: COLOR.gold,
  },
  heroKidImg: { width: '100%', height: '100%' },
  heroTitle: { fontSize: FONT.hero, fontWeight: '900', color: KIDS_COLOR.mango, textAlign: 'center', lineHeight: 44, marginBottom: SPACE.sm },
  heroSub:   { fontSize: FONT.md, color: '#A8D8B0', textAlign: 'center', lineHeight: 22 },

  card: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: RADIUS.lg, padding: SPACE.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginBottom: SPACE.xl },
  cardTitle: { fontSize: FONT.lg, fontWeight: '800', color: KIDS_COLOR.mango, marginBottom: SPACE.sm },
  cardBody:  { fontSize: FONT.md, color: KIDS_COLOR.textPrimary, lineHeight: 26 },

  stepDots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: SPACE.md },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepDotActive: { backgroundColor: KIDS_COLOR.sunshine },
  stepTitle: { fontSize: FONT.xxl, fontWeight: '900', color: KIDS_COLOR.mango, marginBottom: 4 },
  stepSub:   { fontSize: FONT.sm, color: '#A8D8B0', marginBottom: SPACE.md },

  termsBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, marginBottom: SPACE.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  termsPara: { fontSize: FONT.sm, color: KIDS_COLOR.textPrimary, lineHeight: 22, marginBottom: SPACE.sm },

  checkRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACE.lg },
  checkbox:      { width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  checkboxActive:{ backgroundColor: KIDS_COLOR.sunshine, borderColor: COLOR.gold },
  checkmark:     { fontSize: 16, color: KIDS_COLOR.deepForest, fontWeight: '800' },
  checkLabel:    { flex: 1, fontSize: FONT.md, color: KIDS_COLOR.textPrimary, fontWeight: '600' },

  primaryBtn:        { backgroundColor: KIDS_COLOR.sunshine, borderRadius: RADIUS.pill, paddingVertical: 16, alignItems: 'center' },
  primaryBtnDisabled:{ backgroundColor: 'rgba(212,161,42,0.35)' },
  primaryBtnText:    { fontSize: FONT.lg, fontWeight: '800', color: KIDS_COLOR.deepForest },

  profileRoot: { flex: 1, backgroundColor: KIDS_COLOR.palmCream },
  profileScroll: { paddingHorizontal: SPACE.md, paddingTop: SPACE.md, paddingBottom: 42 },
  profileTitle: { fontSize: 30, fontWeight: '900', color: KIDS_COLOR.textPrimary, textAlign: 'center', marginTop: SPACE.sm },
  titleUnderline: { width: 46, height: 4, borderRadius: 2, backgroundColor: KIDS_COLOR.sunshine, alignSelf: 'center', marginTop: 10, marginBottom: SPACE.sm },
  profileSub: { fontSize: FONT.md, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: SPACE.lg },

  profileChip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.md,
    padding: SPACE.sm, marginBottom: SPACE.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  profileChipName: { fontSize: FONT.lg, fontWeight: '800', color: KIDS_COLOR.textPrimary },
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

  chooseTitle: { fontSize: 24, fontWeight: '900', color: KIDS_COLOR.textPrimary, marginBottom: 5 },
  chooseSub: { fontSize: FONT.sm, color: 'rgba(255,255,255,0.72)', marginBottom: SPACE.md, lineHeight: 20 },
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
    backgroundColor: KIDS_COLOR.sunshine,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  checkBubbleText: { color: KIDS_COLOR.deepForest, fontSize: 18, fontWeight: '900' },
  friendAvatarRing: {
    borderWidth: 0,255,255,0.14)',
    marginBottom: 8,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  friendInterest: { color: 'rgba(255,255,255,0.72)', fontSize: FONT.sm, marginTop: 3, textAlign: 'center' },

  friendSummary: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: SPACE.md,
    marginBottom: SPACE.md,
  },
  friendSummaryTitle: { color: KIDS_COLOR.textPrimary, fontSize: FONT.lg, fontWeight: '900', marginBottom: 6 },
  friendSummaryText: { color: 'rgba(255,255,255,0.72)', fontSize: FONT.md, lineHeight: 22 },
  startBtn: { marginBottom: 6 },});
