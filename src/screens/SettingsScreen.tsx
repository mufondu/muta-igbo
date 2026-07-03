// ─── Premium Settings Screen ─────────────────────────────────────────────────
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AvatarIllustration from '../components/illustrations/AvatarIllustration';
import { MUTA_FRIENDS, getMutaFriend, MutaFriendId } from '../data/mutaFriends';
import { AvatarEmoji, useApp } from '../hooks/useAppState';
import { KIDS_COLOR, KIDS_SHADOW } from '../theme/kidsTheme';
import { PrivacyScreen, SubscriptionTermsScreen, TermsScreen } from './LegalScreens';
import { FONT, RADIUS, SPACE } from '../utils/tokens';

interface Props {
  onBack: () => void;
}

type LegalPage = null | 'terms' | 'privacy' | 'subscription';
type SettingsIconName = React.ComponentProps<typeof Ionicons>['name'];

function SettingRow({
  icon,
  label,
  sub,
  right,
  onPress,
  danger,
}: {
  icon: SettingsIconName;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={s.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.84 : 1}
      disabled={!onPress}
    >
      <View style={[s.settingIcon, danger && s.settingIconDanger]}>
        <Ionicons
          name={icon}
          size={22}
          color={danger ? KIDS_COLOR.coral : KIDS_COLOR.palmGreen}
        />
      </View>
      <View style={s.settingCopy}>
        <Text style={[s.settingLabel, danger && s.dangerText]}>{label}</Text>
        {sub ? <Text style={s.settingSub}>{sub}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );
}

function SettingsSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionKicker}>{title}</Text>
      {subtitle ? <Text style={s.sectionSubtitle}>{subtitle}</Text> : null}
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

function MiniDivider() {
  return <View style={s.divider} />;
}

export default function SettingsScreen({ onBack }: Props) {
  const {
    state,
    activeProfile,
    toggleSound,
    toggleHaptic,
    setPremium,
    resetAll,
    addProfile,
    deleteProfile,
    renameProfile,
  } = useApp();

  const [legalPage, setLegalPage] = useState<LegalPage>(null);
  const [addingChild, setAddingChild] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState<AvatarEmoji>('adaeze');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (legalPage === 'terms') return <TermsScreen onBack={() => setLegalPage(null)} />;
  if (legalPage === 'privacy') return <PrivacyScreen onBack={() => setLegalPage(null)} />;
  if (legalPage === 'subscription') return <SubscriptionTermsScreen onBack={() => setLegalPage(null)} />;

  const activeFriend = getMutaFriend(activeProfile?.avatar ?? 'adaeze');
  const totalWords = state.profiles.reduce((sum, profile) => sum + (profile.wordsLearned ?? 0), 0);
  const bestStreak = state.profiles.reduce((best, profile) => Math.max(best, profile.streak ?? 0), 0);

  function handleSubscribe() {
    Alert.alert(
      '🌟 Go Premium',
      'Unlock all learning levels, bonus folktales, more games, and the full quiz engine.',
      [
        { text: 'Maybe later', style: 'cancel' },
        {
          text: 'Unlock Premium',
          onPress: () => {
            setPremium(true);
            Alert.alert('🎉 Premium unlocked!', 'All content is now available.');
          },
        },
      ],
    );
  }

  function confirmReset() {
    Alert.alert(
      'Reset all progress?',
      'This deletes all child profiles, streaks, words learned, and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAll();
            Alert.alert('Done', 'All app data has been cleared.');
          },
        },
      ],
    );
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      `Remove ${name}?`,
      'This deletes the profile and progress for this child.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteProfile(id) },
      ],
    );
  }

  function saveNewChild() {
    const name = newName.trim();

    if (name.length < 2) {
      Alert.alert('Name required', 'Please enter at least 2 characters.');
      return;
    }

    if (state.profiles.length >= 4) {
      Alert.alert('Maximum reached', 'You can have up to 4 child profiles.');
      return;
    }

    addProfile(name, newAvatar);
    setNewName('');
    setNewAvatar('adaeze');
    setAddingChild(false);
  }

  function saveRename() {
    const name = editName.trim();

    if (!editingId || name.length < 2) {
      Alert.alert('Name required', 'Please enter at least 2 characters.');
      return;
    }

    renameProfile(editingId, name);
    setEditingId(null);
    setEditName('');
  }

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back" activeOpacity={0.84}>
          <Ionicons name="chevron-back" size={28} color={KIDS_COLOR.deepForest} />
        </TouchableOpacity>
        <View style={s.topTitleWrap}>
          <Text style={s.topKicker}>PARENT CENTER</Text>
          <Text style={s.topTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <View style={s.heroAvatarWrap}>
            <AvatarIllustration avatar={activeProfile?.avatar ?? 'adaeze'} size={104} />
          </View>
          <View style={s.heroCopy}>
            <Text style={s.heroKicker}>ACTIVE CHILD</Text>
            <Text style={s.heroTitle}>{activeProfile?.name ?? 'Nwa Igbo'}</Text>
            <Text style={s.heroSub}>{activeFriend.description}</Text>
          </View>
        </View>

        <View style={s.parentDashboard}>
          <View style={s.dashboardTile}>
            <Text style={s.dashboardValue}>{state.profiles.length}/4</Text>
            <Text style={s.dashboardLabel}>Profiles</Text>
          </View>
          <View style={s.dashboardTile}>
            <Text style={s.dashboardValue}>{bestStreak}</Text>
            <Text style={s.dashboardLabel}>Best streak</Text>
          </View>
          <View style={s.dashboardTile}>
            <Text style={s.dashboardValue}>{totalWords}</Text>
            <Text style={s.dashboardLabel}>Words</Text>
          </View>
        </View>

        {!state.isPremium ? (
          <TouchableOpacity style={s.premiumCard} onPress={handleSubscribe} activeOpacity={0.88}>
            <View style={s.premiumIcon}>
              <Ionicons name="star" size={28} color={KIDS_COLOR.mango} />
            </View>
            <View style={s.premiumCopy}>
              <Text style={s.premiumTitle}>Go Premium</Text>
              <Text style={s.premiumSub}>Unlock all lessons, stories, games, and richer practice.</Text>
            </View>
            <Text style={s.premiumArrow}>›</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.premiumActiveCard}>
            <View style={s.premiumIcon}>
              <Ionicons name="checkmark-circle" size={30} color={KIDS_COLOR.palmGreen} />
            </View>
            <View style={s.premiumCopy}>
              <Text style={s.premiumTitle}>Premium Active</Text>
              <Text style={s.premiumSub}>Your family has access to the full learning adventure.</Text>
            </View>
          </View>
        )}

        <SettingsSection title="Child profiles" subtitle="Manage each child and their learning friend.">
          {state.profiles.map((profile, index) => {
            const friend = getMutaFriend(profile.avatar);

            return (
              <View key={profile.id}>
                {index > 0 ? <MiniDivider /> : null}

                {editingId === profile.id ? (
                  <View style={s.editProfileCard}>
                    <AvatarIllustration avatar={profile.avatar} size={52} />
                    <TextInput
                      style={s.editInput}
                      value={editName}
                      onChangeText={setEditName}
                      autoFocus
                      maxLength={20}
                      autoCapitalize="words"
                      placeholder="Child name"
                      placeholderTextColor={KIDS_COLOR.textSoft}
                    />
                    <TouchableOpacity onPress={saveRename} style={s.smallSaveBtn} activeOpacity={0.86}>
                      <Text style={s.smallSaveText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={s.profileCard}>
                    <AvatarIllustration avatar={profile.avatar} size={58} />
                    <View style={s.profileCopy}>
                      <Text style={s.profileName}>{profile.name}</Text>
                      <Text style={s.profileFriend}>{friend.name} · {friend.subtitle}</Text>
                      <Text style={s.profileStats}>
                        🔥 {profile.streak} streak · ⭐ {profile.wordsLearned} words · 🏆 {profile.quizBest}
                      </Text>
                    </View>
                    <View style={s.profileActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingId(profile.id);
                          setEditName(profile.name);
                        }}
                        style={s.iconButton}
                        activeOpacity={0.82}
                      >
                        <Ionicons name="create" size={18} color={KIDS_COLOR.palmGreen} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDelete(profile.id, profile.name)}
                        style={s.iconButton}
                        activeOpacity={0.82}
                      >
                        <Ionicons name="trash" size={18} color={KIDS_COLOR.coral} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {state.profiles.length < 4 ? (
            <View>
              {state.profiles.length > 0 ? <MiniDivider /> : null}

              {!addingChild ? (
                <TouchableOpacity style={s.addChildCard} onPress={() => setAddingChild(true)} activeOpacity={0.86}>
                  <View style={s.addChildIcon}>
                    <Ionicons name="add" size={30} color={KIDS_COLOR.deepForest} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.addChildTitle}>Add child profile</Text>
                    <Text style={s.addChildSub}>Choose a learning friend and start a new journey.</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={s.addForm}>
                  <Text style={s.formLabel}>Child name</Text>
                  <TextInput
                    style={s.nameInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="e.g. Zara"
                    placeholderTextColor={KIDS_COLOR.textSoft}
                    maxLength={20}
                    autoCapitalize="words"
                    autoFocus
                  />

                  <Text style={s.formLabel}>Learning friend</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.avatarRoster}
                  >
                    {MUTA_FRIENDS.map(friend => (
                      <TouchableOpacity
                        key={friend.id}
                        style={[
                          s.avatarRosterCard,
                          newAvatar === friend.id && s.avatarRosterCardActive,
                        ]}
                        onPress={() => setNewAvatar(friend.id as MutaFriendId)}
                        activeOpacity={0.88}
                      >
                        <AvatarIllustration avatar={friend.id} size={66} />
                        <Text style={s.avatarRosterName} numberOfLines={1}>{friend.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={s.formActions}>
                    <TouchableOpacity style={s.saveChildBtn} onPress={saveNewChild} activeOpacity={0.86}>
                      <Text style={s.saveChildText}>Add child</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.cancelChildBtn}
                      onPress={() => {
                        setAddingChild(false);
                        setNewName('');
                        setNewAvatar('adaeze');
                      }}
                      activeOpacity={0.86}
                    >
                      <Text style={s.cancelChildText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : null}
        </SettingsSection>

        <SettingsSection title="Learning experience" subtitle="Make the game feel right for your child.">
          <SettingRow
            icon="volume-high"
            label="Sound effects"
            sub="Play friendly sounds during lessons and games."
            right={
              <Switch
                value={state.soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ true: KIDS_COLOR.palmGreen, false: '#DDE7E0' }}
                thumbColor={KIDS_COLOR.white}
              />
            }
          />
          <MiniDivider />
          <SettingRow
            icon="phone-portrait"
            label="Gentle vibration"
            sub="Use haptic feedback for taps, wins, and choices."
            right={
              <Switch
                value={state.hapticEnabled}
                onValueChange={toggleHaptic}
                trackColor={{ true: KIDS_COLOR.palmGreen, false: '#DDE7E0' }}
                thumbColor={KIDS_COLOR.white}
              />
            }
          />
          <MiniDivider />
          <SettingRow
            icon="🎯"
            label="Daily learning goal"
            sub="Current goal: 3 activities per day. Editable goal coming soon."
            right={<Text style={s.comingSoonPill}>Soon</Text>}
          />
          <MiniDivider />
          <SettingRow
            icon="shield-checkmark"
            label="Kid-safe mode"
            sub="Parent-managed settings and gentle reset protections."
            right={<Text style={s.safePill}>On</Text>}
          />
        </SettingsSection>

        <SettingsSection title="Parent tools" subtitle="Modern controls for a children’s app.">
          <SettingRow
            icon="trending-up"
            label="Progress snapshot"
            sub={`${totalWords} words learned across ${state.profiles.length} child profile${state.profiles.length === 1 ? '' : 's'}.`}
          />
          <MiniDivider />
          <SettingRow
            icon="earth"
            label="Dialect focus"
            sub="Central Igbo first · Enuani variants where available."
          />
          <MiniDivider />
          <SettingRow
            icon="lock-closed"
            label="Privacy-first setup"
            sub="Profiles stay parent-managed on this device."
          />
        </SettingsSection>

        <SettingsSection title="About & legal">
          <SettingRow icon="phone-portrait-outline" label="App version" sub="Mụta Igbo v2.0.0" />
          <MiniDivider />
          <SettingRow
            icon="document-text"
            label="Terms & Conditions"
            sub="Review app terms."
            right={<Text style={s.chevron}>›</Text>}
            onPress={() => setLegalPage('terms')}
          />
          <MiniDivider />
          <SettingRow
            icon="key"
            label="Privacy Policy"
            sub="How privacy is handled."
            right={<Text style={s.chevron}>›</Text>}
            onPress={() => setLegalPage('privacy')}
          />
          <MiniDivider />
          <SettingRow
            icon="star"
            label="Subscription Terms"
            sub="Premium billing and renewal details."
            right={<Text style={s.chevron}>›</Text>}
            onPress={() => setLegalPage('subscription')}
          />
        </SettingsSection>

        <SettingsSection title="Data controls">
          <SettingRow
            icon="trash"
            label="Reset all progress"
            sub="Delete all profiles, streaks, words, and progress."
            right={<Text style={s.chevronDanger}>›</Text>}
            onPress={confirmReset}
            danger
          />
        </SettingsSection>

        <Text style={s.footer}>
          Made with ❤️ for Zara, Kaira, Ije, and every child growing up with Igbo.{'\n'}
          A MekaOps Edu product{'\n'}
          © 2026 MekaOps. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: KIDS_COLOR.palmCream,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACE.lg,
    paddingHorizontal: SPACE.md,
    paddingBottom: SPACE.md,
    backgroundColor: KIDS_COLOR.palmCream,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.white,
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    marginRight: 12,
  },
  backText: {
    color: KIDS_COLOR.deepForest,
    fontSize: 34,
    fontWeight: '900',
    marginTop: -3,
  },
  topTitleWrap: {
    flex: 1,
  },
  topKicker: {
    color: KIDS_COLOR.mango,
    fontSize: FONT.xs,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  topTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  scroll: {
    paddingHorizontal: SPACE.md,
    paddingBottom: 80,
  },

  heroCard: {
    ...KIDS_SHADOW.softCard,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 34,
    padding: SPACE.md,
    marginBottom: SPACE.md,
    backgroundColor: KIDS_COLOR.softMint,
    borderWidth: 1.5,
    borderColor: '#BDEFD2',
  },
  heroAvatarWrap: {
    width: 104,
    height: 104,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.white,
    marginRight: 14,
    overflow: 'visible',
  },
  heroCopy: {
    flex: 1,
  },
  heroKicker: {
    color: KIDS_COLOR.mango,
    fontSize: FONT.xs,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 2,
  },
  heroTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  heroSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 4,
  },

  parentDashboard: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACE.md,
  },
  dashboardTile: {
    ...KIDS_SHADOW.softCard,
    flex: 1,
    minHeight: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.white,
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
  },
  dashboardValue: {
    color: KIDS_COLOR.palmGreen,
    fontSize: 25,
    fontWeight: '900',
  },
  dashboardLabel: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.xs,
    fontWeight: '900',
    marginTop: 3,
  },

  premiumCard: {
    ...KIDS_SHADOW.button,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACE.md,
    borderRadius: 30,
    backgroundColor: KIDS_COLOR.sunshine,
    borderWidth: 1.5,
    borderColor: KIDS_COLOR.mango,
    marginBottom: SPACE.lg,
  },
  premiumActiveCard: {
    ...KIDS_SHADOW.softCard,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACE.md,
    borderRadius: 30,
    backgroundColor: KIDS_COLOR.white,
    borderWidth: 1.5,
    borderColor: '#BDEFD2',
    marginBottom: SPACE.lg,
  },
  premiumIcon: {
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.white,
    marginRight: 12,
  },
  premiumIconText: {
    fontSize: 28,
  },
  premiumCopy: {
    flex: 1,
  },
  premiumTitle: {
    color: KIDS_COLOR.deepForest,
    fontSize: FONT.lg,
    fontWeight: '900',
  },
  premiumSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 2,
  },
  premiumArrow: {
    color: KIDS_COLOR.deepForest,
    fontSize: 34,
    fontWeight: '900',
  },

  section: {
    marginBottom: SPACE.lg,
  },
  sectionKicker: {
    color: KIDS_COLOR.mango,
    fontSize: FONT.xs,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    fontWeight: '800',
    marginTop: 3,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionCard: {
    ...KIDS_SHADOW.softCard,
    backgroundColor: KIDS_COLOR.white,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: KIDS_COLOR.borderSoft,
    marginHorizontal: SPACE.md,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACE.md,
  },
  settingIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.mintMist,
    marginRight: 12,
  },
  settingIconDanger: {
    backgroundColor: '#FFE8E8',
  },
  settingCopy: {
    flex: 1,
  },
  settingLabel: {
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.md,
    fontWeight: '900',
  },
  settingSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    lineHeight: 19,
    fontWeight: '700',
    marginTop: 2,
  },
  dangerText: {
    color: KIDS_COLOR.coral,
  },
  chevron: {
    color: KIDS_COLOR.textSoft,
    fontSize: 28,
    fontWeight: '900',
  },
  chevronDanger: {
    color: KIDS_COLOR.coral,
    fontSize: 28,
    fontWeight: '900',
  },
  comingSoonPill: {
    color: KIDS_COLOR.deepForest,
    backgroundColor: KIDS_COLOR.sunshine,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: FONT.xs,
    fontWeight: '900',
    overflow: 'hidden',
  },
  safePill: {
    color: KIDS_COLOR.white,
    backgroundColor: KIDS_COLOR.palmGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: FONT.xs,
    fontWeight: '900',
    overflow: 'hidden',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: SPACE.md,
  },
  profileCopy: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.lg,
    fontWeight: '900',
  },
  profileFriend: {
    color: KIDS_COLOR.palmGreen,
    fontSize: FONT.xs,
    fontWeight: '900',
    marginTop: 1,
  },
  profileStats: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.xs,
    fontWeight: '800',
    marginTop: 4,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.mintMist,
  },
  iconButtonText: {
    fontSize: 17,
  },

  editProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: SPACE.md,
  },
  editInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 13,
    backgroundColor: KIDS_COLOR.mintMist,
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.md,
    fontWeight: '800',
  },
  smallSaveBtn: {
    minHeight: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    backgroundColor: KIDS_COLOR.palmGreen,
  },
  smallSaveText: {
    color: KIDS_COLOR.white,
    fontSize: FONT.sm,
    fontWeight: '900',
  },

  addChildCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACE.md,
  },
  addChildIcon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.sunshine,
    marginRight: 12,
  },
  addChildIconText: {
    color: KIDS_COLOR.deepForest,
    fontSize: 28,
    fontWeight: '900',
  },
  addChildTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.md,
    fontWeight: '900',
  },
  addChildSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    fontWeight: '700',
    marginTop: 2,
  },

  addForm: {
    padding: SPACE.md,
  },
  formLabel: {
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.sm,
    fontWeight: '900',
    marginBottom: 7,
  },
  nameInput: {
    minHeight: 54,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: KIDS_COLOR.mintMist,
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.md,
    fontWeight: '800',
    marginBottom: 14,
  },
  avatarRoster: {
    gap: 10,
    paddingVertical: 6,
    paddingRight: 6,
  },
  avatarRosterCard: {
    width: 92,
    minHeight: 112,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: KIDS_COLOR.mintMist,
    borderWidth: 1.5,
    borderColor: KIDS_COLOR.borderSoft,
  },
  avatarRosterCardActive: {
    backgroundColor: '#FFF2C7',
    borderColor: KIDS_COLOR.mango,
    transform: [{ scale: 1.03 }],
  },
  avatarRosterName: {
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.xs,
    fontWeight: '900',
    marginTop: 6,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACE.sm,
    marginTop: 12,
  },
  saveChildBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.palmGreen,
  },
  saveChildText: {
    color: KIDS_COLOR.white,
    fontSize: FONT.md,
    fontWeight: '900',
  },
  cancelChildBtn: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: KIDS_COLOR.white,
    borderWidth: 1,
    borderColor: KIDS_COLOR.borderSoft,
  },
  cancelChildText: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    fontWeight: '900',
  },

  footer: {
    color: KIDS_COLOR.textSoft,
    fontSize: FONT.xs,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACE.sm,
    marginBottom: SPACE.xl,
    paddingHorizontal: SPACE.md,
  },
});
