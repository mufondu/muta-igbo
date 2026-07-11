import { Dimensions } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
export const IS_TABLET = SCREEN_W >= 600;
const BASE_W = 390;
export function rs(size: number): number {
  const scale = Math.min(SCREEN_W / BASE_W, IS_TABLET ? 1.45 : 1.15);
  return Math.round(size * scale);
}
export const SCREEN = { W: SCREEN_W, H: Dimensions.get('window').height };

export const COLOR = {
  forestDark:  '#1B2A6B', forest: '#7A45D8', forestMid: '#854CE6',
  forestLight: '#F0E3FF', forestPale: '#FFF8E7',
  gold: '#D4A12A', goldLight: '#FFF6D6', goldBorder: '#F0C84A',
  clay: '#C05A22', clayLight: '#FDF0E8', clayBright: '#E8732A',
  sky: '#1878C8', skyLight: '#E8F3FC', skyBorder: '#A8C8F0',
  coral: '#E8445A', coralLight: '#FDEEF0',
  purple: '#7030C8', purpleLight: '#F0EAFC', purpleBorder: '#C8A8F0',
  mango: '#F0A800', mangoLight: '#FFFAE0',
  teal: '#0898A0', tealLight: '#E0F8FA',
  bg: '#FAFAF5', card: '#FFFFFF', border: '#E8E4D8', borderMid: '#D0CCC0',
  textPrimary: '#1A1A14', textSecond: '#6A6658', textHint: '#A09C90',
  textWhite: '#FFFFFF', textCream: '#F8F0DC',
  success: '#1A8048', successLight: '#E8F8EE',
  error: '#C82828', errorLight: '#FDEAEA',
  warning: '#D48000', warningLight: '#FFF8E0',
  locked: '#B0AC9C', lockedBg: '#F5F3EE',
  premium: '#D4A12A', premiumBg: '#FFF6D6',
} as const;

export const FONT = {
  xs: rs(10), sm: rs(12), md: rs(14), lg: rs(16),
  xl: rs(18), xxl: rs(22), xxxl: rs(28), hero: rs(36),
} as const;

export const RADIUS = {
  sm: rs(8), md: rs(14), lg: rs(20), xl: rs(28), pill: 999,
} as const;

export const SPACE = {
  xs: rs(4), sm: rs(8), md: rs(14), lg: rs(20), xl: rs(28), xxl: rs(40),
} as const;

export const LEVEL_COLOR: Record<string, { bg: string; pip: string; text: string }> = {
  '7A': { bg: '#EAF0FC', pip: '#4878D8', text: '#1A3878' },
  '6A': { bg: '#FFF6D6', pip: '#D4A12A', text: '#7A5208' },
  '5A': { bg: '#FDF0E8', pip: '#E8732A', text: '#7A3010' },
  '4A': { bg: '#E8F8EE', pip: '#1A8048', text: '#0A4020' },
  '3A': { bg: '#F0EAFC', pip: '#7030C8', text: '#3A1068' },
  '2A': { bg: '#FDEEF0', pip: '#E8445A', text: '#780820' },
  '1A': { bg: '#E0F8FA', pip: '#0898A0', text: '#044850' },
};

export const CHILD_AVATARS = [
  '👦🏿', '👧🏿', '��🏾', '👧🏾', '🧒🏿', '🧒🏾',
] as const;

export type ChildAvatar = typeof CHILD_AVATARS[number];
