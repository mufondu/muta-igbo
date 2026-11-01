// Desktop web navigation. Replaces the floating bottom bar when the window is wide.
// Child areas on top; the Parent Center sits apart at the bottom.
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SIDEBAR_W } from '../utils/responsive';

export type SidebarItem = {
  key: string;
  /** Ionicons name, e.g. 'home'. */
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
  /** 'parent' items are shown in their own grown-ups section. */
  group?: 'parent';
};

type Props = {
  items: SidebarItem[];
  playerName?: string;
  canSwitchPlayer?: boolean;
  onSwitchPlayer?: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const LOGO = require('../../assets/muta-logo-header.png');

function NavButton({ item }: { item: SidebarItem }) {
  return (
    <TouchableOpacity
      style={[s.item, item.active && s.itemActive]}
      onPress={item.onPress}
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: item.active }}
    >
      {item.active ? <View style={s.activeBar} /> : null}
      <View style={[s.iconTile, item.active && s.iconTileActive]}>
        <Ionicons name={item.icon as any} size={22} color={item.active ? '#1B2A6B' : '#5B6B8C'} />
      </View>
      <Text style={[s.itemLabel, item.active && s.itemLabelActive]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

export default function DesktopSidebar({ items, playerName, canSwitchPlayer, onSwitchPlayer }: Props) {
  const main = items.filter(i => i.group !== 'parent');
  const parent = items.filter(i => i.group === 'parent');

  return (
    <View style={s.root}>
      <View style={s.brand}>
        <Image source={LOGO} style={s.logo} resizeMode="contain" />
        <View style={{ flex: 1 }}>
          <Text style={s.brandName}>Mụta Igbo</Text>
          <Text style={s.brandTag}>Learn Igbo, play along</Text>
        </View>
      </View>

      <View style={s.nav}>
        {main.map(item => <NavButton key={item.key} item={item} />)}
      </View>

      <View style={s.spacer} />

      {playerName ? (
        <View style={s.player}>
          <Text style={s.playerKicker}>LEARNER</Text>
          <Text style={s.playerName} numberOfLines={1}>{playerName}</Text>
          {canSwitchPlayer ? (
            <TouchableOpacity onPress={onSwitchPlayer} activeOpacity={0.86} style={s.switchBtn} accessibilityRole="button">
              <Text style={s.switchText}>Switch player</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {parent.length > 0 ? (
        <View style={s.parentSection}>
          <Text style={s.parentKicker}>FOR GROWN-UPS</Text>
          {parent.map(item => <NavButton key={item.key} item={item} />)}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    width: SIDEBAR_W,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRightWidth: 2,
    borderRightColor: 'rgba(221, 229, 244, 0.95)',
    paddingVertical: 28,
    paddingHorizontal: 18,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, marginBottom: 32 },
  logo: { width: 52, height: 52 },
  brandName: { fontSize: 22, fontWeight: '900', color: '#1B2A6B' },
  brandTag: { fontSize: 13, fontWeight: '700', color: '#5B6B8C', marginTop: 2 },
  nav: { gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  itemActive: { backgroundColor: '#FFF4CC' },
  activeBar: { position: 'absolute', left: 0, top: 10, bottom: 10, width: 4, borderRadius: 4, backgroundColor: '#F5A400' },
  iconTile: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F4FB' },
  iconTileActive: { backgroundColor: '#FFE08A' },
  itemLabel: { fontSize: 17, fontWeight: '800', color: '#3A4A75' },
  itemLabelActive: { color: '#1B2A6B' },
  spacer: { flex: 1, minHeight: 24 },
  player: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F4F8FF',
    borderWidth: 1.5,
    borderColor: 'rgba(49, 189, 237, 0.28)',
    marginBottom: 18,
  },
  playerKicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, color: '#F5A400' },
  playerName: { fontSize: 17, fontWeight: '900', color: '#1B2A6B', marginTop: 2 },
  switchBtn: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#FFF1B8' },
  switchText: { fontSize: 13, fontWeight: '800', color: '#1B2A6B' },
  parentSection: {
    borderTopWidth: 1.5,
    borderTopColor: '#E3E8F5',
    paddingTop: 14,
    gap: 6,
  },
  parentKicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, color: '#8A94AE', paddingHorizontal: 16, marginBottom: 2 },
});
