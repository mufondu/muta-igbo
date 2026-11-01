/**
 * Mụta Igbo — Word pronunciation lookup
 * Author: Michael Ufondu
 *
 * Maps a vocabulary word (item.igbo) to its recorded audio asset in the
 * auto-generated AUDIO_REGISTRY. The slug logic here MUST stay in sync with
 * normalizeIgboSlug() in scripts/generate_recording_manifest.js so that the
 * filename the studio assigns matches the key the app looks up at runtime.
 *
 * Returns null when no recording exists yet, so callers can fall back to the
 * placeholder tap sound. Word "Listen" buttons light up with real audio
 * automatically the moment recordings are added and the registry is
 * regenerated — no per-word wiring required.
 */

import { AUDIO_REGISTRY } from '../data/audioRegistry';
import { DEFAULT_TEACHING_VOICE_SET, VoiceSetId } from '../data/audioManifest';

// Mirror of scripts/generate_recording_manifest.js -> normalizeIgboSlug()
export function igboAudioSlug(input: string): string {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[ịìí]/g, 'i')
    .replace(/[ọòó]/g, 'o')
    .replace(/[ụùú]/g, 'u')
    .replace(/[ṅñ]/g, 'n')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Returns the require()d audio asset for a word, or null if not recorded yet. */
export function getWordAudio(
  igbo: string,
  voiceSetId: VoiceSetId = DEFAULT_TEACHING_VOICE_SET,
): any | null {
  if (!igbo) return null;
  const slug = igboAudioSlug(igbo);
  if (!slug) return null;
  const key = `${voiceSetId}:${slug}.m4a`;
  return AUDIO_REGISTRY[key] ?? null;
}

/** True when a recording exists for this word. */
export function hasWordAudio(
  igbo: string,
  voiceSetId: VoiceSetId = DEFAULT_TEACHING_VOICE_SET,
): boolean {
  return getWordAudio(igbo, voiceSetId) != null;
}
