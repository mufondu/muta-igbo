/**
 * Mụta Igbo Access Control
 * Author: Michael Ufondu
 *
 * Purpose:
 * - Ship beta with all content unlocked.
 * - Keep the app subscription-ready without restructuring lessons later.
 * - Switch to subscription mode later by changing ACCESS_MODE and wiring real store entitlements.
 */

export type AccessMode =
  | 'free_beta'
  | 'subscription';

export type PremiumFeature =
  | 'full_lesson_path'
  | 'quiz_full_pool'
  | 'playroom_all_games'
  | 'story_hut'
  | 'picture_match'
  | 'listen_tap'
  | 'word_match'
  | 'voice_practice'
  | 'multiple_profiles'
  | 'parent_insights';

export const ACCESS_MODE: AccessMode = 'free_beta';

export const PREMIUM_FEATURES: Record<PremiumFeature, true> = {
  full_lesson_path: true,
  quiz_full_pool: true,
  playroom_all_games: true,
  story_hut: true,
  picture_match: true,
  listen_tap: true,
  word_match: true,
  voice_practice: true,
  multiple_profiles: true,
  parent_insights: true,
};

export function isFreeBetaMode(): boolean {
  return ACCESS_MODE === 'free_beta';
}

export function hasPremiumEntitlement(isPremium: boolean): boolean {
  if (ACCESS_MODE === 'free_beta') return true;
  return isPremium;
}

export function canAccessPremiumFeature(
  feature: PremiumFeature,
  isPremium: boolean,
): boolean {
  if (!PREMIUM_FEATURES[feature]) return true;
  return hasPremiumEntitlement(isPremium);
}

export function getPlanLabel(isPremium: boolean): string {
  if (ACCESS_MODE === 'free_beta') return 'Free Beta';
  return isPremium ? 'Premium' : 'Free';
}

export function getPremiumBadgeLabel(isPremium: boolean): string {
  if (ACCESS_MODE === 'free_beta') return 'Beta Access';
  return isPremium ? 'Premium' : 'Free';
}

export function shouldShowUpgradePrompt(isPremium: boolean): boolean {
  if (ACCESS_MODE === 'free_beta') return false;
  return !isPremium;
}
