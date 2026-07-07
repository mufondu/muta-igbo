/**
 * Mụta Igbo Audio Manifest
 * Author: Michael Ufondu
 *
 * Defines voice sets and stable audio lookup rules.
 * Actual .m4a files will be added after production recording and QA.
 */

export type VoiceSetId =
  | 'central_igbo_native_v1'
  | 'muta_mascot_v1';

export type AudioUseCase =
  | 'teaching'
  | 'mascot'
  | 'reward'
  | 'instruction';

export type VoiceSet = {
  id: VoiceSetId;
  label: string;
  languageFocus: 'Central Igbo';
  speakerRole: 'native_speaker' | 'mascot';
  useCase: AudioUseCase[];
  assetBasePath: string;
  productionStatus: 'planned' | 'recording' | 'qa' | 'approved';
};

export const DEFAULT_TEACHING_VOICE_SET: VoiceSetId = 'central_igbo_native_v1';

export const DEFAULT_MASCOT_VOICE_SET: VoiceSetId = 'muta_mascot_v1';

export const VOICE_SETS: Record<VoiceSetId, VoiceSet> = {
  central_igbo_native_v1: {
    id: 'central_igbo_native_v1',
    label: 'Central Igbo Native Voice V1',
    languageFocus: 'Central Igbo',
    speakerRole: 'native_speaker',
    useCase: ['teaching', 'instruction'],
    assetBasePath: 'assets/audio/central-igbo/native-v1',
    productionStatus: 'planned',
  },

  muta_mascot_v1: {
    id: 'muta_mascot_v1',
    label: 'Mụta Mascot V1',
    languageFocus: 'Central Igbo',
    speakerRole: 'mascot',
    useCase: ['mascot', 'reward', 'instruction'],
    assetBasePath: 'assets/audio/central-igbo/mascot-v1',
    productionStatus: 'planned',
  },
};

export type AudioManifestItem = {
  id: string;
  igbo: string;
  english: string;
  filename: string;
  useCase: AudioUseCase;
  required: boolean;
  status: 'missing' | 'recorded' | 'qa' | 'approved';
};

export const MASCOT_AUDIO_ITEMS: AudioManifestItem[] = [
  {
    id: 'reward-great-job',
    igbo: 'Ị mere nke ọma!',
    english: 'Great job!',
    filename: 'i-mere-nke-oma.m4a',
    useCase: 'reward',
    required: true,
    status: 'missing',
  },
  {
    id: 'reward-try-again',
    igbo: 'Gbalịa ọzọ!',
    english: 'Try again!',
    filename: 'gbalia-ozo.m4a',
    useCase: 'reward',
    required: true,
    status: 'missing',
  },
  {
    id: 'instruction-listen-tap',
    igbo: 'Gee ntị ma pịa.',
    english: 'Listen and tap.',
    filename: 'gee-nti-ma-pia.m4a',
    useCase: 'instruction',
    required: true,
    status: 'missing',
  },
  {
    id: 'instruction-say-it',
    igbo: 'Kwuo ya.',
    english: 'Say it.',
    filename: 'kwuo-ya.m4a',
    useCase: 'instruction',
    required: true,
    status: 'missing',
  },
  {
    id: 'instruction-picture-match',
    igbo: 'Dakọrịta foto.',
    english: 'Match the picture.',
    filename: 'dakọrita-foto.m4a',
    useCase: 'instruction',
    required: true,
    status: 'missing',
  },
];

export function getVoiceSet(id: VoiceSetId): VoiceSet {
  return VOICE_SETS[id];
}
