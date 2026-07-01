// ─── Settings Screen ─────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  Alert, Image, Linking, ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { AvatarEmoji, useApp } from '../hooks/useAppState';
import { MUTA_FRIENDS, getMutaFriend } from '../data/mutaFriends';
import { PrivacyScreen, SubscriptionTermsScreen, TermsScreen } from './LegalScreens';
import { ProfileImage } from './OnboardingScreen';
import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';


interface Props { onBack: () => void; }

function Row({ label, sub, right, onPress }: {
  label: string; sub?: string; right?: React.ReactNode; onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

type LegalPage = null | 'terms' | 'privacy' | 'subscription';

export default function SettingsScreen({ onBack }: Props) {
  const { state, activeProfile, toggleSound, toggleHaptic, setPremium, resetAll,
          addProfile, deleteProfile, renameProfile } = useApp();
  const [legalPage, setLegalPage] = useState<LegalPage>(null);
  const [addingChild, setAddingChild] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState<AvatarEmoji>('ada');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (legalPage === 'terms')        return <TermsScreen onBack={() => setLegalPage(null)} />;
  if (legalPage === 'privacy')       return <PrivacyScreen onBack={() => setLegalPage(null)} />;
  if (legalPage === 'subscription')  return <SubscriptionTermsScreen onBack={() => setLegalPage(null)} />;

  function handleSubscribe() {
    Alert.alert(
      '🌟 Go Premium',
      'Unlock all learning levels, bonus folktales and the full quiz engine.\n\n• Monthly: $2.99\n• Yearly: $19.99 (save 44%)',
      [
        { text: 'Maybe later', style: 'cancel' },
        { text: 'Unlock Premium', onPress: () => {
          setPremium(true);
          Alert.alert('🎉 Premium unlocked!', 'All content is now available.');
        }},
      ]
    );
  }

  function confirmReset() {
    Alert.alert(
      'Reset All Progress?',
      'This will delete all profiles, streaks and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          resetAll();
          Alert.alert('Done', 'All data has been cleared.');
        }},
      ]
    );
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      `Remove ${name}?`,
      'This will delete all progress for this child.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteProfile(id) },
      ]
    );
  }

  function saveNewChild() {
    if (!newName.trim() || newName.trim().length < 2) {
      Alert.alert('Name required', 'Please enter at least 2 characters.'); return;
    }
    if (state.profiles.length >= 4) {
      Alert.alert('Maximum reached', 'You can have up to 4 child profiles.'); return;
    }
    addProfile(newName.trim(), newAvatar);
    setNewName(''); setNewAvatar('ada'); setAddingChild(false);
  }

  function saveRename() {
    if (!editingId || !editName.trim() || editName.trim().length < 2) return;
    renameProfile(editingId, editName.trim());
    setEditingId(null); setEditName('');
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backText}>⬅</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings ⚙️</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* Premium */}
        {!state.isPremium ? (
          <TouchableOpacity style={s.premiumBanner} onPress={handleSubscribe} activeOpacity={0.85}>
            <Text style={s.premiumEmoji}>🌟</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.premiumTitle}>Go Premium</Text>
              <Text style={s.premiumSub}>Unlock all levels from $2.99/month</Text>
            </View>
            <Text style={s.premiumArrow}>›</Text>
          </TouchableOpacity>
        ) : (
          <View style={[s.premiumBanner, { backgroundColor: COLOR.successLight }]}>
            <Text style={s.premiumEmoji}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.premiumTitle, { color: COLOR.success }]}>Premium Active</Text>
              <Text style={s.premiumSub}>All content is unlocked</Text>
            </View>
          </View>
        )}

        {/* Child Profiles */}
        <Section title="Child Profiles">
          {state.profiles.map((p, i) => (
            <View key={p.id}>
              {i > 0 && <View style={s.divider} />}
              {editingId === p.id ? (
                <View style={s.editRow}>
                  <ProfileImage avatar={p.avatar} size={34} />
                  <TextInput
                    style={s.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    autoFocus
                    maxLength={20}
                    autoCapitalize="words"
                  />
                  <TouchableOpacity onPress={saveRename} style={s.saveBtn}>
                    <Text style={s.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingId(null)} style={s.cancelBtn}>
                    <Text style={s.cancelBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.profileRow}>
                  <ProfileImage avatar={p.avatar} size={34} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.profileName}>{p.name}</Text>
                    <Text style={s.profileStats}>
                      🔥 {p.streak} streak · {p.wordsLearned} words · Best quiz: {p.quizBest}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => { setEditingId(p.id); setEditName(p.name); }}
                    style={s.iconBtn}>
                    <Text style={s.iconBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(p.id, p.name)} style={s.iconBtn}>
                    <Text style={s.iconBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {state.profiles.length < 4 && (
            <>
              {state.profiles.length > 0 && <View style={s.divider} />}
              {!addingChild ? (
                <TouchableOpacity style={s.addProfileBtn} onPress={() => setAddingChild(true)}>
                  <Text style={s.addProfileText}>+ Add child profile</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ padding: SPACE.sm }}>
                  <Text style={s.addFormLabel}>Child's name</Text>
                  <TextInput
                    style={s.nameInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="e.g. Amara"
                    placeholderTextColor={COLOR.textHint}
                    maxLength={20}
                    autoCapitalize="words"
                    autoFocus
                  />
                  <Text style={s.addFormLabel}>Mụta Friend</Text>
                  <View style={s.avatarRow}>
                    {MUTA_FRIENDS.map(friend => (
                      <TouchableOpacity key={friend.id}
                        style={[s.avatarOpt, newAvatar === friend.id && s.avatarOptActive]}
                        onPress={() => setNewAvatar(friend.id)}>
                        <Image source={friend.image} style={s.avatarImg} resizeMode="cover" />
                        <Text style={s.avatarName} numberOfLines={1}>{friend.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.sm }}>
                    <TouchableOpacity style={[s.saveBtn, { flex: 1 }]} onPress={saveNewChild}>
                      <Text style={s.saveBtnText}>Add child</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.cancelBtn, { paddingHorizontal: 16 }]}
                      onPress={() => { setAddingChild(false); setNewName(''); }}>
                      <Text style={s.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </Section>

        {/* Experience */}
        <Section title="Experience">
          <Row label="Sound Effects" sub="Play sounds on interactions"
            right={<Switch value={state.soundEnabled} onValueChange={toggleSound}
              trackColor={{ true: COLOR.forest, false: COLOR.border }} thumbColor={COLOR.card} />}
          />
          <View style={s.divider} />
          <Row label="Vibration" sub="Haptic feedback"
            right={<Switch value={state.hapticEnabled} onValueChange={toggleHaptic}
              trackColor={{ true: COLOR.forest, false: COLOR.border }} thumbColor={COLOR.card} />}
          />
        </Section>

        {/* About */}
        <Section title="About">
          <Row label="App Version" sub="Mụta Igbo v2.0.0" />
          <View style={s.divider} />
          <Row label="Dialect" sub="Anambra Igbo · Ogwashi-Ukwu Enuani" />
        </Section>

        {/* Legal */}
        <Section title="Legal">
          <Row label="Terms & Conditions" right={<Text style={s.chevron}>›</Text>}
            onPress={() => setLegalPage('terms')} />
          <View style={s.divider} />
          <Row label="Privacy Policy" right={<Text style={s.chevron}>›</Text>}
            onPress={() => setLegalPage('privacy')} />
          <View style={s.divider} />
          <Row label="Subscription Terms" right={<Text style={s.chevron}>›</Text>}
            onPress={() => setLegalPage('subscription')} />
        </Section>

        {/* Data */}
        <Section title="Data">
          <Row label="Reset All Progress" sub="Delete all profiles and progress"
            right={<Text style={s.chevron}>›</Text>} onPress={confirmReset} />
        </Section>

        <Text style={s.footer}>
          Mụta Igbo v2.0.0{'\n'}
          Made with ❤️ for Zara, Kaira, Ije, and every child growing up with Igbo.{"\n"}A MekaOps Edu product{"\n"}© 2026 MekaOps. All rights reserved.{"\n"}
          © 2025 Mụta Igbo
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLOR.forestDark,
    paddingVertical: 16, paddingHorizontal: SPACE.lg,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 20, color: COLOR.gold },
  headerTitle: { fontSize: FONT.lg, fontWeight: '800', color: COLOR.textCream },
  scroll: { padding: SPACE.lg, paddingBottom: 60 },

  premiumBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLOR.goldLight, borderRadius: RADIUS.lg, padding: SPACE.md,
    marginBottom: SPACE.lg, borderWidth: 1, borderColor: COLOR.goldBorder,
  },
  premiumEmoji: { fontSize: 28 },
  premiumTitle: { fontSize: FONT.md, fontWeight: '800', color: COLOR.clay },
  premiumSub: { fontSize: FONT.sm, color: COLOR.textSecond, marginTop: 2 },
  premiumArrow: { fontSize: 22, color: COLOR.clay },

  section: { marginBottom: SPACE.lg },
  sectionTitle: {
    fontSize: FONT.xs, color: COLOR.textHint,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: SPACE.sm, paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: COLOR.card, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLOR.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: SPACE.md, gap: SPACE.sm,
  },
  rowLabel: { fontSize: FONT.md, fontWeight: '600', color: COLOR.textPrimary },
  rowSub: { fontSize: FONT.sm, color: COLOR.textSecond, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLOR.border, marginHorizontal: SPACE.md },
  chevron: { fontSize: 20, color: COLOR.textHint },

  profileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: SPACE.md,
  },
  profileName: { fontSize: FONT.md, fontWeight: '700', color: COLOR.textPrimary },
  profileStats: { fontSize: FONT.xs, color: COLOR.textSecond, marginTop: 2 },
  iconBtn: { padding: 6 },
  iconBtnText: { fontSize: 18 },

  editRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: SPACE.md,
  },
  editInput: {
    flex: 1, backgroundColor: COLOR.bg,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLOR.borderMid,
    paddingHorizontal: 10, paddingVertical: 6,
    fontSize: FONT.md, color: COLOR.textPrimary,
  },
  saveBtn: {
    backgroundColor: COLOR.forest, borderRadius: RADIUS.sm,
    paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center',
  },
  saveBtnText: { fontSize: FONT.sm, fontWeight: '700', color: COLOR.textWhite },
  cancelBtn: {
    backgroundColor: COLOR.bg, borderRadius: RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 8,
    borderWidth: 1, borderColor: COLOR.border,
  },
  cancelBtnText: { fontSize: FONT.sm, color: COLOR.textSecond, fontWeight: '600' },

  addProfileBtn: {
    paddingVertical: 14, paddingHorizontal: SPACE.md, alignItems: 'center',
  },
  addProfileText: { fontSize: FONT.md, fontWeight: '700', color: COLOR.forest },

  addFormLabel: {
    fontSize: FONT.sm, color: COLOR.textSecond, fontWeight: '600',
    marginBottom: SPACE.xs, marginTop: SPACE.sm,
  },
  nameInput: {
    backgroundColor: COLOR.bg, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLOR.borderMid,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: FONT.md, color: COLOR.textPrimary,
  },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  avatarOpt: {
    width: 76, minHeight: 92, borderRadius: 18,
    backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent', padding: 6,
  },
  avatarOptActive: { borderColor: COLOR.forest, backgroundColor: COLOR.forestLight },
  avatarImg: { width: 52, height: 52, borderRadius: 26, marginBottom: 4 },
  avatarName: { fontSize: FONT.xs, fontWeight: '700', color: COLOR.textPrimary },

  footer: {
    textAlign: 'center', fontSize: FONT.xs,
    color: COLOR.textHint, lineHeight: 20, marginTop: SPACE.sm,
  },
});