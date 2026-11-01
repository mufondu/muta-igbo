// ─── Parent Settings Screen ──────────────────────────────────────────────────
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AvatarIllustration from '../components/illustrations/AvatarIllustration';
import { MUTA_FRIENDS, getMutaFriend, MutaFriendId } from '../data/mutaFriends';
import { ALL_LEVELS } from '../data/lessons';
import { AvatarEmoji, clearLocalData, useApp } from '../hooks/useAppState';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { KIDS_COLOR, KIDS_SHADOW } from '../theme/kidsTheme';
import { PrivacyScreen, SubscriptionTermsScreen, TermsScreen } from './LegalScreens';
import { Alert } from '../utils/alert';
import { FONT, RADIUS, SPACE } from '../utils/tokens';
import { isFreeBetaMode } from '../config/accessControl';
import { useIsDesktop } from '../utils/responsive';

/** Settings reads best as a centered column, not 1400px-wide rows. */
const DESKTOP_COLUMN = { width: '100%' as const, maxWidth: 920, alignSelf: 'center' as const };
const APP_VERSION = Constants.expoConfig?.version ?? '2.0.1';

interface Props {
  onBack: () => void;
}

type LegalPage = null | 'terms' | 'privacy' | 'subscription';
type SettingsIconName = string;

function SettingRow({
  icon,
  label,
  sub,
  right,
  onPress,
  danger,
}: {
  icon?: SettingsIconName;
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
    setDailyGoal,
    setPremium,
    resetAll,
    addProfile,
    deleteProfile,
    renameProfile,
    setProfileAvatar,
  } = useApp();
  const auth = useAuth();
  const isDesktop = useIsDesktop();

  const [legalPage, setLegalPage] = useState<LegalPage>(null);
  const [addingChild, setAddingChild] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState<AvatarEmoji>('adaeze');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<AvatarEmoji>('adaeze');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetText, setResetText] = useState('');

  if (legalPage === 'terms') return <TermsScreen onBack={() => setLegalPage(null)} />;
  if (legalPage === 'privacy') return <PrivacyScreen onBack={() => setLegalPage(null)} />;
  if (legalPage === 'subscription') return <SubscriptionTermsScreen onBack={() => setLegalPage(null)} />;

  const activeFriend = getMutaFriend(activeProfile?.avatar ?? 'adaeze');
  const totalWords = state.profiles.reduce((sum, profile) => sum + (profile.wordsLearned ?? 0), 0);
  const bestStreak = state.profiles.reduce((best, profile) => Math.max(best, profile.streak ?? 0), 0);

  function handleSubscribe() {
    if (isFreeBetaMode()) {
      Alert.alert(
        '🌟 Free Beta Access',
        'All available lessons, games, stories, and quizzes are currently unlocked during beta.',
        [{ text: 'Great!' }],
      );
      return;
    }

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

  // ── Account: export + delete ──
  async function exportMyData() {
    let usageEvents: unknown[] = [];
    try {
      if (supabase) {
        const { data } = await supabase
          .from('usage_events')
          .select('event, props, created_at')
          .order('created_at', { ascending: false })
          .limit(5000);
        usageEvents = data ?? [];
      }
    } catch { /* export what we have */ }

    const json = JSON.stringify(
      { exportedAt: new Date().toISOString(), account: auth.user?.email ?? null, appState: state, usageEvents },
      null,
      2,
    );

    if (Platform.OS === 'web') {
      const g = globalThis as unknown as { document?: Document; URL?: typeof URL };
      if (g.document && g.URL) {
        const url = g.URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        const a = g.document.createElement('a');
        a.href = url;
        a.download = 'muta-igbo-my-data.json';
        g.document.body.appendChild(a);
        a.click();
        a.remove();
        g.URL.revokeObjectURL(url);
      }
    } else {
      await Share.share({ message: json, title: 'Mụta Igbo data' });
    }
  }

  async function performDeleteAccount() {
    const res = await auth.deleteAccount();
    if (res.error) {
      Alert.alert('Could not delete account', res.error);
      return;
    }
    await clearLocalData();
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your parent account, every child profile and all progress, on all devices. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Are you absolutely sure?', 'Everything will be erased now.', [
              { text: 'Keep my account', style: 'cancel' },
              { text: 'Delete forever', style: 'destructive', onPress: () => { performDeleteAccount(); } },
            ]);
          },
        },
      ],
    );
  }

  function confirmReset() {
    setResetText('');
    setResetModalOpen(true);
  }

  function performReset() {
    if (resetText.trim().toLowerCase() !== 'reset') return;
    setResetModalOpen(false);
    setResetText('');
    resetAll();
    Alert.alert('Done', 'All app data has been cleared.');
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
    setProfileAvatar(editingId, editAvatar);
    setEditingId(null);
    setEditName('');
  }

  return (
    <View style={s.root}>
      <View style={[s.topBar, isDesktop && DESKTOP_COLUMN]}>
        {/* On desktop the sidebar already navigates; the arrow would be redundant. */}
        {!isDesktop ? (
          <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back" activeOpacity={0.84}>
            <Text style={s.backText}>‹</Text>
          </TouchableOpacity>
        ) : null}
        <View style={s.topTitleWrap}>
          <Text style={s.topKicker}>PARENT CENTER</Text>
          <Text style={s.topTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[s.scroll, isDesktop && DESKTOP_COLUMN]} showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <View style={s.heroAvatarWrap}>
            <AvatarIllustration avatar={activeProfile?.avatar ?? 'adaeze'} size={104} />
          </View>
          <View style={s.heroCopy}>
            <Text style={s.heroKicker}>ACTIVE PLAYER</Text>
            <Text style={s.heroTitle}>{activeProfile?.name ?? 'Nwa Igbo'}</Text>
            <Text style={s.heroSub}>Learning friend: {activeFriend.name}</Text>
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

        {isFreeBetaMode() ? (
          <View style={s.premiumActiveCard}>
            <View style={s.premiumIcon}>
              <Ionicons name="sparkles" size={26} color="#F5A400" />
            </View>
            <View style={s.premiumCopy}>
              <Text style={s.premiumTitle}>Free Beta Access</Text>
              <Text style={s.premiumSub}>All available lessons, stories, games, and quizzes are unlocked during beta.</Text>
            </View>
          </View>
        ) : !state.isPremium ? (
          <TouchableOpacity style={s.premiumCard} onPress={handleSubscribe} activeOpacity={0.88}>
            <View style={s.premiumIcon}>
              <Ionicons name="sparkles" size={26} color="#F5A400" />
            </View>
            <View style={s.premiumCopy}>
              <Text style={s.premiumTitle}>Free Beta Access</Text>
              <Text style={s.premiumSub}>All available lessons, stories, games, and quizzes are unlocked during beta.</Text>
            </View>
            <Text style={s.premiumArrow}>›</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.premiumActiveCard}>
            <View style={s.premiumIcon}>
              <Ionicons name="checkmark-circle" size={28} color="#19B36B" />
            </View>
            <View style={s.premiumCopy}>
              <Text style={s.premiumTitle}>Free Beta Access</Text>
              <Text style={s.premiumSub}>Your family has access to the full beta learning adventure.</Text>
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
                  <View style={s.addForm}>
                    <Text style={s.formLabel}>Child name</Text>
                    <TextInput
                      style={s.nameInput}
                      value={editName}
                      onChangeText={setEditName}
                      autoFocus
                      maxLength={20}
                      autoCapitalize="words"
                      placeholder="Child name"
                      placeholderTextColor={KIDS_COLOR.textSoft}
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
                            editAvatar === friend.id && s.avatarRosterCardActive,
                          ]}
                          onPress={() => setEditAvatar(friend.id as MutaFriendId)}
                          activeOpacity={0.88}
                        >
                          <AvatarIllustration avatar={friend.id} size={66} />
                          <Text style={s.avatarRosterName} numberOfLines={1}>{friend.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <View style={s.formActions}>
                      <TouchableOpacity style={s.saveChildBtn} onPress={saveRename} activeOpacity={0.86}>
                        <Text style={s.saveChildText}>Save changes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.cancelChildBtn}
                        onPress={() => { setEditingId(null); setEditName(''); }}
                        activeOpacity={0.86}
                      >
                        <Text style={s.cancelChildText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={s.profileCard}>
                    <AvatarIllustration avatar={profile.avatar} size={58} />
                    <View style={s.profileCopy}>
                      <Text style={s.profileName}>{profile.name}</Text>
                      <Text style={s.profileFriend}>{friend.name} · {friend.subtitle}</Text>
                      <Text style={s.profileStats}>
                        🔥 {profile.streak} day streak · ⭐ {profile.wordsLearned} words · 🏆 quiz best {profile.quizBest}
                      </Text>
                    </View>
                    <View style={s.profileActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingId(profile.id);
                          setEditName(profile.name);
                          setEditAvatar(profile.avatar);
                        }}
                        style={s.iconButton}
                        activeOpacity={0.82}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${profile.name}`}
                      >
                        <Ionicons name="create-outline" size={20} color="#1B2A6B" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDelete(profile.id, profile.name)}
                        style={s.iconButton}
                        activeOpacity={0.82}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${profile.name}`}
                      >
                        <Ionicons name="trash-outline" size={20} color={KIDS_COLOR.coral} />
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
                    <Ionicons name="add" size={28} color="#1B2A6B" />
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
            icon="SND"
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
          {Platform.OS !== 'web' ? (
            <>
              <SettingRow
                icon="HAP"
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
            </>
          ) : null}
          <SettingRow
            icon="GOAL"
            label="Daily learning goal"
            sub={`Activities per day (lessons, games or quizzes). Currently ${state.dailyGoal ?? 3}.`}
            right={
              <View style={s.goalChips}>
                {[2, 3, 5, 10].map(n => {
                  const on = (state.dailyGoal ?? 3) === n;
                  return (
                    <TouchableOpacity
                      key={n}
                      onPress={() => setDailyGoal(n)}
                      style={[s.goalChip, on && s.goalChipOn]}
                      activeOpacity={0.86}
                      accessibilityRole="button"
                      accessibilityLabel={`Set daily goal to ${n} activities`}
                      accessibilityState={{ selected: on }}
                    >
                      <Text style={[s.goalChipText, on && s.goalChipTextOn]}>{n}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            }
          />
        </SettingsSection>

        <SettingsSection title="Child progress" subtitle="How each child is doing, level by level.">
          {state.profiles.length === 0 ? (
            <SettingRow label="No profiles yet" sub="Add a child profile to see progress here." />
          ) : state.profiles.map((profile, index) => {
            const friend = getMutaFriend(profile.avatar);
            return (
              <View key={profile.id}>
                {index > 0 ? <MiniDivider /> : null}
                <View style={s.progressBlock}>
                  <View style={s.progressHead}>
                    <AvatarIllustration avatar={profile.avatar} size={44} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.profileName}>{profile.name}</Text>
                      <Text style={s.progressMeta}>
                        {profile.streak} day streak · {profile.wordsLearned} words · quiz best {profile.quizBest}
                        {profile.lastActive ? ` · last active ${profile.lastActive}` : ''}
                      </Text>
                    </View>
                  </View>
                  {ALL_LEVELS.map(level => {
                    const pct = Math.round(Math.min(1, Math.max(0, profile.levelProgress?.[level.id] ?? 0)) * 100);
                    return (
                      <View key={level.id} style={s.progressRow}>
                        <Text style={[s.progressLevel, !isDesktop && { width: 112 }]} numberOfLines={1}>{level.title}</Text>
                        <View style={s.progressTrack}>
                          <View style={[s.progressFill, { width: `${pct}%` }]} />
                        </View>
                        <Text style={s.progressPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </SettingsSection>

        <SettingsSection title="Parent tools" subtitle="Modern controls for a children’s app.">
          <SettingRow
            icon="IGBO"
            label="Language focus"
            sub="Central Igbo lessons, games, stories, and practice."
          />
          <MiniDivider />
          <SettingRow
            icon="PRIV"
            label="Privacy-first setup"
            sub={auth.enabled
              ? 'Profiles and progress are saved to your parent account so they follow you across devices.'
              : 'Profiles stay parent-managed on this device.'}
          />
        </SettingsSection>

        {auth.enabled && auth.user ? (
          <SettingsSection title="Account">
            <SettingRow
              icon="KEY"
              label="Signed in"
              sub={auth.user.email ?? 'Parent account'}
            />
            <MiniDivider />
            <SettingRow
              icon="DOC"
              label="Download my data"
              sub="A JSON copy of your child profiles, progress and activity."
              right={<Text style={s.chevron}>›</Text>}
              onPress={exportMyData}
            />
            <MiniDivider />
            <SettingRow
              icon="DOC"
              label="Sign out"
              sub="Progress is saved to your account."
              right={<Text style={s.chevron}>›</Text>}
              onPress={() => {
                Alert.alert('Sign out?', 'Your children\'s progress stays safe in your account.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign out', style: 'destructive', onPress: () => { auth.signOut(); } },
                ]);
              }}
            />
            <MiniDivider />
            <SettingRow
              icon="DEL"
              danger
              label="Delete account"
              sub="Permanently removes your account, all child profiles and progress."
              right={<Text style={[s.chevron, s.dangerText]}>›</Text>}
              onPress={confirmDeleteAccount}
            />
          </SettingsSection>
        ) : null}

        <SettingsSection title="About & legal">
          {/* App version only matters for installed apps, not a website. */}
          {Platform.OS !== 'web' ? (
            <>
              <SettingRow icon="APP" label="App version" sub={`Mụta Igbo v${APP_VERSION}`} />
              <MiniDivider />
            </>
          ) : null}
          <SettingRow
            icon="DOC"
            label="Terms & Conditions"
            sub="Review app terms."
            right={<Text style={s.chevron}>›</Text>}
            onPress={() => setLegalPage('terms')}
          />
          <MiniDivider />
          <SettingRow
            icon="KEY"
            label="Privacy Policy"
            sub="How privacy is handled."
            right={<Text style={s.chevron}>›</Text>}
            onPress={() => setLegalPage('privacy')}
          />
          {/* Purchase/beta terms are app-store wording; hidden on the free web version. */}
          {Platform.OS !== 'web' ? (
            <>
              <MiniDivider />
              <SettingRow
                icon="STAR"
                label="Beta Access Terms"
                sub="Current free beta and future purchase details."
                right={<Text style={s.chevron}>›</Text>}
                onPress={() => setLegalPage('subscription')}
              />
            </>
          ) : null}
        </SettingsSection>

        <SettingsSection title="Data controls">
          <SettingRow
            icon="RST"
            label="Reset all progress"
            sub="Delete all profiles, streaks, words, and progress."
            right={<Text style={s.chevronDanger}>›</Text>}
            onPress={confirmReset}
            danger
          />
        </SettingsSection>

        <Text style={s.footer}>
          Made with ❤️ for Zara, Kaira, Ije, and every child growing up with Igbo.
        </Text>
      </ScrollView>

      <Modal
        visible={resetModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalOpen(false)}
      >
        <View style={s.resetBackdrop}>
          <View style={s.resetCard}>
            <Text style={s.resetEmoji}>⚠️</Text>
            <Text style={s.resetTitle}>Reset all progress?</Text>
            <Text style={s.resetBody}>
              This permanently deletes all child profiles, streaks, words learned, and
              progress. This cannot be undone.
            </Text>
            <Text style={s.resetLabel}>Type <Text style={s.resetLabelStrong}>reset</Text> to confirm</Text>
            <TextInput
              style={s.resetInput}
              value={resetText}
              onChangeText={setResetText}
              placeholder="reset"
              placeholderTextColor={KIDS_COLOR.textSoft}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={s.resetActions}>
              <TouchableOpacity
                style={s.resetCancelBtn}
                onPress={() => { setResetModalOpen(false); setResetText(''); }}
                activeOpacity={0.86}
              >
                <Text style={s.resetCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.resetConfirmBtn, resetText.trim().toLowerCase() !== 'reset' && s.resetConfirmBtnDisabled]}
                onPress={performReset}
                disabled={resetText.trim().toLowerCase() !== 'reset'}
                activeOpacity={0.86}
              >
                <Text style={s.resetConfirmText}>Reset everything</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  iconButtonTextDanger: {
    color: KIDS_COLOR.coral,
  },
  resetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 42, 107, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACE.lg,
  },
  resetCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: KIDS_COLOR.white,
    borderRadius: RADIUS.xl,
    padding: SPACE.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: KIDS_COLOR.softCoral,
    ...KIDS_SHADOW.softCard,
  },
  resetEmoji: { fontSize: 40, marginBottom: SPACE.sm },
  resetTitle: { fontSize: FONT.xxl, fontWeight: '900', color: KIDS_COLOR.textPrimary, textAlign: 'center' },
  resetBody: {
    fontSize: FONT.sm, color: KIDS_COLOR.textSecondary,
    textAlign: 'center', lineHeight: Math.round(FONT.sm * 1.4), marginTop: SPACE.sm, marginBottom: SPACE.md,
  },
  resetLabel: { fontSize: FONT.sm, color: KIDS_COLOR.textSecondary, marginBottom: 6, alignSelf: 'flex-start' },
  resetLabelStrong: { fontWeight: '900', color: KIDS_COLOR.coral },
  resetInput: {
    width: '100%',
    borderWidth: 2, borderColor: KIDS_COLOR.borderSoft,
    borderRadius: RADIUS.md, paddingHorizontal: SPACE.md, paddingVertical: 12,
    fontSize: FONT.lg, fontWeight: '800', color: KIDS_COLOR.textPrimary,
    backgroundColor: KIDS_COLOR.palmCream,
  },
  resetActions: { flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.lg, width: '100%' },
  resetCancelBtn: {
    flex: 1, minHeight: 48, borderRadius: RADIUS.pill,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: KIDS_COLOR.palmCream, borderWidth: 1.5, borderColor: KIDS_COLOR.borderSoft,
  },
  resetCancelText: { fontSize: FONT.md, fontWeight: '800', color: KIDS_COLOR.textSecondary },
  resetConfirmBtn: {
    flex: 1, minHeight: 48, borderRadius: RADIUS.pill,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: KIDS_COLOR.coral,
  },
  resetConfirmBtnDisabled: { opacity: 0.4 },
  resetConfirmText: { fontSize: FONT.md, fontWeight: '900', color: KIDS_COLOR.white },
  root: {
    flex: 1,
    backgroundColor: KIDS_COLOR.palmCream,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: SPACE.md,
    paddingBottom: 16,
    backgroundColor: KIDS_COLOR.palmCream,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KIDS_COLOR.sunshine,
    borderWidth: 1.5,
    borderColor: KIDS_COLOR.mango,
    marginRight: 14,
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
    letterSpacing: 1.9,
  },
  topTitle: {
    color: KIDS_COLOR.textPrimary,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: SPACE.md,
    paddingTop: 6,
    paddingBottom: 90,
    backgroundColor: KIDS_COLOR.palmCream,
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
    backgroundColor: 'transparent',
    borderWidth: 0,
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
    color: KIDS_COLOR.deepForest,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
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
    marginBottom: SPACE.xl,
  },
  sectionKicker: {
    color: KIDS_COLOR.mango,
    fontSize: FONT.xs,
    fontWeight: '900',
    letterSpacing: 1.6,
    lineHeight: Math.round(FONT.xs * 1.5),
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.sm,
    fontWeight: '800',
    lineHeight: Math.round(FONT.sm * 1.4),
    marginTop: 4,
    marginBottom: 14,
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
    paddingVertical: 18,
    paddingHorizontal: SPACE.lg,
    backgroundColor: KIDS_COLOR.white,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    color: KIDS_COLOR.textPrimary,
    fontSize: FONT.lg,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  settingSub: {
    color: KIDS_COLOR.textSecondary,
    fontSize: FONT.md,
    lineHeight: 23,
    fontWeight: '700',
    marginTop: 4,
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
  goalChips: { flexDirection: 'row', gap: 8 },
  goalChip: {
    minWidth: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: KIDS_COLOR.mintMist, borderWidth: 1.5, borderColor: 'transparent',
  },
  goalChipOn: { backgroundColor: KIDS_COLOR.sunshine, borderColor: '#E0A800' },
  goalChipText: { fontSize: FONT.md, fontWeight: '900', color: KIDS_COLOR.textSecondary },
  goalChipTextOn: { color: KIDS_COLOR.deepForest },
  progressBlock: { paddingVertical: 18, paddingHorizontal: SPACE.lg, gap: 10 },
  progressHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  progressMeta: { fontSize: FONT.sm, fontWeight: '700', color: KIDS_COLOR.textSecondary, lineHeight: Math.round(FONT.sm * 1.4), marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressLevel: { width: 190, fontSize: FONT.sm, fontWeight: '800', color: KIDS_COLOR.textPrimary },
  progressTrack: { flex: 1, height: 10, borderRadius: 6, backgroundColor: '#EEF1F8', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6, backgroundColor: KIDS_COLOR.palmGreen },
  progressPct: { width: 44, textAlign: 'right', fontSize: FONT.sm, fontWeight: '900', color: KIDS_COLOR.textSecondary },
  comingSoonPill: {
    color: KIDS_COLOR.deepForest,
    backgroundColor: KIDS_COLOR.sunshine,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: FONT.xs,
    fontWeight: '900',
    overflow: 'hidden',
  },
  safePill: {
    color: KIDS_COLOR.white,
    backgroundColor: KIDS_COLOR.palmGreen,
    paddingHorizontal: 13,
    paddingVertical: 7,
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
    backgroundColor: KIDS_COLOR.white,
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
    backgroundColor: KIDS_COLOR.white,
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
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
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
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
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
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
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
    backgroundColor: 'transparent',
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
  },});
