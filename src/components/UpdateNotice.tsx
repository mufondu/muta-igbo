import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FONT, RADIUS, SPACE } from '../utils/tokens';

declare global {
  interface Window {
    __mutaUpdateReady?: boolean;
  }
}

/**
 * Web only. When a new version of the app has been downloaded in the background
 * (see the service worker in pwa/sw.js), shows a small bar. Saved progress is kept in
 * the browser on every change, so refreshing does not erase it; only a lesson or quiz
 * round that is half way through restarts. We never reload automatically.
 */
export default function UpdateNotice() {
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (window.__mutaUpdateReady) setReady(true);
    const on = () => setReady(true);
    window.addEventListener('muta-update-ready', on);
    return () => window.removeEventListener('muta-update-ready', on);
  }, []);

  if (Platform.OS !== 'web' || !ready || hidden) return null;

  return (
    <View style={st.wrap} pointerEvents="box-none">
      <View style={st.bar} accessibilityRole="alert">
        <Text style={st.text}>Update ready</Text>
        <TouchableOpacity style={st.btn} onPress={() => window.location.reload()} accessibilityRole="button">
          <Text style={st.btnText}>Tap to refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setHidden(true)} accessibilityLabel="Dismiss update notice" style={st.later}>
          <Text style={st.laterText}>Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: {
    // position: 'fixed' is valid on react-native-web
    position: 'fixed' as any,
    left: 0,
    right: 0,
    bottom: SPACE.lg,
    alignItems: 'center',
    zIndex: 9999,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    backgroundColor: '#1B2A6B',
    borderRadius: RADIUS.pill,
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  text: { color: '#FFFFFF', fontSize: FONT.md, fontWeight: '800' },
  btn: { backgroundColor: '#FFC83D', borderRadius: RADIUS.pill, paddingVertical: SPACE.xs + 2, paddingHorizontal: SPACE.md },
  btnText: { color: '#1B2A6B', fontSize: FONT.md, fontWeight: '900' },
  later: { paddingHorizontal: SPACE.xs },
  laterText: { color: '#C9D1FF', fontSize: FONT.sm, fontWeight: '700' },
});
