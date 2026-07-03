// ─── Haptic feedback with graceful fallback ──────────────────────────────────
// Works if expo-haptics is installed; silently no-ops otherwise.
// Respects the hapticEnabled setting via setHapticsEnabled().

let Haptics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Haptics = require('expo-haptics');
} catch {
  Haptics = null;
}

let enabled = true;
export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

function safe(fn: () => Promise<void>) {
  if (!Haptics || !enabled) return;
  fn().catch(() => {});
}

// Light tap: card presses, tab switches, letter tiles
export function tapLight() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

// Medium: starting a game, opening a level
export function tapMedium() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

// Success: correct answer, badge earned, level complete
export function success() {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

// Warning: wrong answer (gentle, never harsh for kids)
export function wrong() {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

// Selection tick: scrolling pickers, difficulty change
export function tick() {
  safe(() => Haptics.selectionAsync());
}
