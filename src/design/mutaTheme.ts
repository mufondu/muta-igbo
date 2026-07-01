import { COLOR, FONT, RADIUS, SPACE } from '../utils/tokens';

export const MUTA_THEME = {
  colors: {
    palm: COLOR.forest,
    palmDark: COLOR.forestDark,
    kola: COLOR.clay,
    coral: COLOR.coral,
    uliCream: COLOR.bg,
    sun: COLOR.gold,
    sky: COLOR.sky,
    leaf: COLOR.success,
  },
  type: FONT,
  radius: RADIUS,
  space: SPACE,
} as const;

export const CARTOON_PALETTE = [
  '#FDE68A', '#BFDBFE', '#FECACA', '#BBF7D0', '#DDD6FE', '#FED7AA', '#CFFAFE', '#FBCFE8',
] as const;
