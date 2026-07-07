/**
 * Mụta Igbo Audio Playback Helpers
 * Author: Michael Ufondu
 */

import {
  DEFAULT_MASCOT_VOICE_SET,
  DEFAULT_TEACHING_VOICE_SET,
  VoiceSetId,
} from '../data/audioManifest';

export type AudioPlaybackRequest = {
  filename: string;
  voiceSetId?: VoiceSetId;
  fallbackVoiceSetId?: VoiceSetId;
};

export function getDefaultTeachingVoiceSet(): VoiceSetId {
  return DEFAULT_TEACHING_VOICE_SET;
}

export function getDefaultMascotVoiceSet(): VoiceSetId {
  return DEFAULT_MASCOT_VOICE_SET;
}

export function getAudioRegistryKey(request: AudioPlaybackRequest): string {
  const voiceSetId = request.voiceSetId || DEFAULT_TEACHING_VOICE_SET;
  return `${voiceSetId}:${request.filename}`;
}

export function getMascotAudioRegistryKey(filename: string): string {
  return `${DEFAULT_MASCOT_VOICE_SET}:${filename}`;
}
