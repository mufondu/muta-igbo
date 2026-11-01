import { Platform, useWindowDimensions } from 'react-native';

/** Window width at which web switches from the bottom bar to the left sidebar. */
export const DESKTOP_MIN = 900;
/** Width of the desktop sidebar. */
export const SIDEBAR_W = 280;
/** Content never grows past this, so ultra-wide monitors stay readable. */
export const CONTENT_MAX = 1200;
/** Below this content width, side-by-side cards stack into one column. */
export const TWO_COLUMN_MIN = 720;

/** True on web when the browser window is wide enough for the sidebar layout. */
export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= DESKTOP_MIN;
}

/**
 * Live layout numbers that follow the window as it is resized.
 *  - isDesktop: sidebar layout
 *  - contentWidth: usable width for page content (window minus sidebar and gutters, capped)
 *  - twoColumn: enough room to put cards side by side
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_MIN;
  const gutter = width >= 1280 ? 64 : width >= 768 ? 40 : 16;
  const available = width - (isDesktop ? SIDEBAR_W : 0) - gutter * 2;
  const contentWidth = Math.max(280, Math.min(available, isDesktop ? CONTENT_MAX : 680));
  return {
    width,
    height,
    isDesktop,
    gutter,
    contentWidth,
    twoColumn: isDesktop && contentWidth >= TWO_COLUMN_MIN,
  };
}
