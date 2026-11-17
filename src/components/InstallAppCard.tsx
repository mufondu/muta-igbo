import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useInstallApp } from '../utils/pwaInstall';
import { FONT, RADIUS, SPACE } from '../utils/tokens';

const DISMISS_KEY = 'muta_install_dismissed_v1';

function readDismissed(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Invites people to install Mụta Igbo on their device, with no app store.
 * variant "banner": Home screen, hidden once dismissed or installed, and only when there is a real way to install.
 * variant "row": Parent Center, always visible in a browser, with generic help if no prompt is available.
 */
export default function InstallAppCard({ variant = 'banner' }: { variant?: 'banner' | 'row' }) {
  const install = useInstallApp();
  const [dismissed, setDismissed] = useState<boolean>(variant === 'banner' ? readDismissed() : false);
  const [note, setNote] = useState<string | null>(null);

  if (!install.show || dismissed) return null;
  if (variant === 'banner' && !install.canPrompt && !install.isIOS) return null;

  const steps = install.isIOS
    ? 'Tap the Share button in Safari, then "Add to Home Screen".'
    : install.canPrompt
      ? null
      : 'Open your browser menu and choose "Install app" or "Add to Home Screen". Chrome and Edge show it in the address bar.';

  async function onInstall() {
    const result = await install.promptInstall();
    if (result === 'accepted') setNote('Installed! Look for Mụta Igbo on your device.');
    else if (result === 'unavailable') setNote('Use your browser menu: "Install app" or "Add to Home Screen".');
  }

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
  }

  return (
    <View style={[st.card, variant === 'row' && st.cardRow]}>
      <View style={st.iconWrap}>
        <Ionicons name="download-outline" size={22} color="#FFFFFF" />
      </View>
      <View style={st.copy}>
        <Text style={st.title}>Install Mụta Igbo</Text>
        <Text style={st.sub}>
          {note ?? steps ?? 'Add it to your home screen or desktop. It opens like an app and works without the app store.'}
        </Text>
      </View>
      {install.canPrompt ? (
        <TouchableOpacity style={st.btn} onPress={onInstall} accessibilityRole="button" accessibilityLabel="Install Mụta Igbo">
          <Text style={st.btnText}>Install</Text>
        </TouchableOpacity>
      ) : null}
      {variant === 'banner' ? (
        <TouchableOpacity onPress={dismiss} accessibilityLabel="Hide install suggestion" style={st.close}>
          <Ionicons name="close" size={18} color="#6B5B95" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: '#F0EAFC',
    borderColor: '#C8A8F0',
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    padding: SPACE.md,
    marginBottom: SPACE.md,
  },
  cardRow: { marginBottom: 0, borderRadius: RADIUS.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7A45D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  title: { fontSize: FONT.lg, fontWeight: '900', color: '#1B2A6B' },
  sub: { fontSize: FONT.sm, lineHeight: Math.round(FONT.sm * 1.4), color: '#4B3F72', marginTop: 2 },
  btn: { backgroundColor: '#7A45D8', borderRadius: RADIUS.pill, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm },
  btnText: { color: '#FFFFFF', fontWeight: '900', fontSize: FONT.md },
  close: { padding: 4 },
});
