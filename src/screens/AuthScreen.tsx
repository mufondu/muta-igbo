// Parent sign-in / create-account screen. Shown before the app when Supabase is configured.
import React, { useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { PrivacyScreen, TermsScreen } from './LegalScreens';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const LOGO = require('../../assets/muta-logo.png');

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const { signInWithGoogle, signInWithPassword, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [legal, setLegal] = useState<null | 'terms' | 'privacy'>(null);

  if (legal === 'terms') return <TermsScreen onBack={() => setLegal(null)} />;
  if (legal === 'privacy') return <PrivacyScreen onBack={() => setLegal(null)} />;

  const signup = mode === 'signup';

  async function run(fn: () => Promise<{ error?: string; needsEmailConfirm?: boolean }>) {
    setError(''); setNotice(''); setBusy(true);
    try {
      const res = await fn();
      if (res.error) setError(res.error);
      else if (res.needsEmailConfirm) {
        setNotice('Check your email and tap the confirmation link, then come back and sign in.');
        setMode('signin');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function needAdult(): boolean {
    if (adult) return false;
    setError('Please confirm you are a parent or guardian (18 or older).');
    return true;
  }

  function onGoogle() {
    if (needAdult()) return;
    run(signInWithGoogle);
  }

  function onSubmit() {
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (signup) {
      if (needAdult()) return;
      run(() => signUp(email, password));
    } else {
      run(() => signInWithPassword(email, password));
    }
  }

  function onForgot() {
    if (!email.includes('@')) { setError('Enter your email above first.'); return; }
    run(async () => {
      const res = await resetPassword(email);
      if (!res.error) setNotice('If that email has an account, a reset link is on its way.');
      return res;
    });
  }

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.card}>
            <Image source={LOGO} style={s.logo} resizeMode="contain" />
            <Text style={s.kicker}>FOR PARENTS AND GUARDIANS</Text>
            <Text style={s.title}>{signup ? 'Create your family account' : 'Welcome back'}</Text>
            <Text style={s.sub}>
              Sign in to keep your children's Igbo progress safe and across devices. Children
              learn inside your account and never need their own login.
            </Text>

            <TouchableOpacity style={s.googleBtn} onPress={onGoogle} disabled={busy} activeOpacity={0.88} accessibilityLabel="Continue with Google">
              <Text style={s.googleG}>G</Text>
              <Text style={s.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={s.dividerRow}>
              <View style={s.line} /><Text style={s.or}>or use email</Text><View style={s.line} />
            </View>

            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#8A94AE"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (8+ characters)"
              placeholderTextColor="#8A94AE"
              secureTextEntry
              textContentType={signup ? 'newPassword' : 'password'}
              autoComplete={signup ? 'new-password' : 'current-password'}
              onSubmitEditing={onSubmit}
            />

            <TouchableOpacity
              style={s.checkRow}
              onPress={() => setAdult(v => !v)}
              activeOpacity={0.8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: adult }}
            >
              <View style={[s.box, adult && s.boxOn]}>{adult ? <Text style={s.tick}>✓</Text> : null}</View>
              <Text style={s.checkText}>
                I am a parent or guardian (18 or older) and agree to the{' '}
                <Text style={s.link} onPress={() => setLegal('terms')}>Terms</Text> and{' '}
                <Text style={s.link} onPress={() => setLegal('privacy')}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            {error ? <Text style={s.error} accessibilityLiveRegion="polite">{error}</Text> : null}
            {notice ? <Text style={s.notice} accessibilityLiveRegion="polite">{notice}</Text> : null}

            <TouchableOpacity style={[s.primary, busy && { opacity: 0.6 }]} onPress={onSubmit} disabled={busy} activeOpacity={0.88}>
              {busy ? <ActivityIndicator color="#1B2A6B" /> : <Text style={s.primaryText}>{signup ? 'Create account' : 'Sign in'}</Text>}
            </TouchableOpacity>

            <View style={s.footerRow}>
              <TouchableOpacity onPress={() => { setMode(signup ? 'signin' : 'signup'); setError(''); setNotice(''); }}>
                <Text style={s.link}>{signup ? 'I already have an account' : 'Create an account'}</Text>
              </TouchableOpacity>
              {!signup ? (
                <TouchableOpacity onPress={onForgot}><Text style={s.link}>Forgot password?</Text></TouchableOpacity>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8E7' },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    width: '100%', maxWidth: 440, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24,
    borderWidth: 1.5, borderColor: 'rgba(49, 189, 237, 0.28)',
    shadowColor: '#1B2A6B', shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
  },
  logo: { width: 72, height: 72, alignSelf: 'center', marginBottom: 8 },
  kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1.4, color: '#F5A400', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#1B2A6B', textAlign: 'center', marginTop: 4 },
  sub: { fontSize: 14, lineHeight: 20, color: '#4A5A80', textAlign: 'center', marginTop: 8, marginBottom: 18 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 13, borderRadius: 16, borderWidth: 1.5, borderColor: '#D5DCEE', backgroundColor: '#FFFFFF',
  },
  googleG: { fontSize: 18, fontWeight: '900', color: '#4285F4' },
  googleText: { fontSize: 16, fontWeight: '800', color: '#1B2A6B' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: '#E3E8F5' },
  or: { fontSize: 12, fontWeight: '700', color: '#8A94AE' },
  input: {
    borderWidth: 1.5, borderColor: '#D5DCEE', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: '#1B2A6B', marginBottom: 10, backgroundColor: '#FAFBFF',
  },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 6, marginBottom: 6 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#9AA6C6', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: '#FFD84D', borderColor: '#E0A800' },
  tick: { fontSize: 14, fontWeight: '900', color: '#1B2A6B' },
  checkText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#4A5A80' },
  link: { color: '#5B33C9', fontWeight: '800', fontSize: 14 },
  error: { color: '#C82828', fontSize: 13, fontWeight: '700', marginTop: 8 },
  notice: { color: '#1A8048', fontSize: 13, fontWeight: '700', marginTop: 8 },
  primary: { marginTop: 14, backgroundColor: '#FFD84D', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryText: { fontSize: 17, fontWeight: '900', color: '#1B2A6B' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
});
