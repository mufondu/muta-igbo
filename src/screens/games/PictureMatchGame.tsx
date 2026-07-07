import React from 'react';
import {
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LessonIllustration from '../../components/illustrations/LessonIllustration';
import { ALL_LEVELS, VocabItem } from '../../data/lessons';
import * as haptics from '../../utils/haptics';

type Props = {
  onBack: () => void;
  isPremium?: boolean;
};

type RoundItem = VocabItem & {
  matchId: string;
};

const VISUAL_SECTION_KEYWORDS = [
  'family',
  'body',
  'animal',
  'home',
  'food',
];

const VISUAL_WORD_KEYWORDS = [
  'father',
  'mother',
  'grandfather',
  'grandmother',
  'brother',
  'sister',
  'child',
  'children',
  'uncle',
  'aunt',
  'cousin',
  'head',
  'eye',
  'nose',
  'mouth',
  'ear',
  'hand',
  'leg',
  'toe',
  'teeth',
  'tongue',
  'dog',
  'cat',
  'chicken',
  'goat',
  'fish',
  'bird',
  'lion',
  'leopard',
  'elephant',
  'rabbit',
  'rat',
  'snake',
  'python',
  'tortoise',
  'grasshopper',
  'house',
  'home',
  'water',
  'book',
  'food',
];

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function isVisualItem(item: VocabItem, sectionTitle: string): boolean {
  const english = item.english.toLowerCase();
  const igbo = item.igbo.toLowerCase();
  const section = sectionTitle.toLowerCase();

  if (!item.igbo || !item.english) return false;

  // Exclude number rows, phrases, abstract difficulty words, and long sentence prompts.
  if (/\d/.test(item.english)) return false;
  if (english.includes('hard') || english.includes('easy')) return false;
  if (english.includes('go to') || english.includes('school')) return false;
  if (english.length > 34) return false;
  if (igbo.split(/\s+/).length > 3 && !english.includes('grand')) return false;

  const sectionLooksVisual = VISUAL_SECTION_KEYWORDS.some(keyword => section.includes(keyword));
  const wordLooksVisual = VISUAL_WORD_KEYWORDS.some(keyword => english.includes(keyword));

  return sectionLooksVisual || wordLooksVisual;
}

function buildPool(): RoundItem[] {
  const pool: RoundItem[] = [];
  const seen = new Set<string>();

  ALL_LEVELS.forEach(level => {
    level.sections.forEach(section => {
      section.items.forEach(item => {
        if (!isVisualItem(item, section.title)) return;

        const matchId = `${item.igbo.trim()}-${item.english.trim()}`;
        if (seen.has(matchId)) return;

        seen.add(matchId);
        pool.push({ ...item, matchId });
      });
    });
  });

  return pool;
}

function getRoundItems(): RoundItem[] {
  const pool = buildPool();
  return shuffle(pool).slice(0, 4);
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.backBtn} accessibilityLabel="Go back" activeOpacity={0.84}>
      <Ionicons name="chevron-back" size={27} color="#1B2A6B" />
    </TouchableOpacity>
  );
}

function safeHaptic(kind: 'success' | 'error' | 'light') {
  const fn = (haptics as any)[kind];
  if (typeof fn === 'function') fn();
}

export default function PictureMatchGame({ onBack }: Props) {
  const [round, setRound] = React.useState(1);
  const [items, setItems] = React.useState<RoundItem[]>(() => getRoundItems());
  const [words, setWords] = React.useState<RoundItem[]>(() => shuffle(items));
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [matched, setMatched] = React.useState<Record<string, boolean>>({});
  const [missedId, setMissedId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('Pick a picture, then tap its Igbo word.');

  const selectedItem = items.find(item => item.matchId === selectedId);
  const matchedCount = items.filter(item => matched[item.matchId]).length;
  const complete = matchedCount === items.length;

  const startNextRound = React.useCallback(() => {
    const nextItems = getRoundItems();

    setRound(value => value + 1);
    setItems(nextItems);
    setWords(shuffle(nextItems));
    setMatched({});
    setSelectedId(null);
    setMissedId(null);
    setMessage('Pick a picture, then tap its Igbo word.');
  }, []);

  function selectPicture(item: RoundItem) {
    if (matched[item.matchId]) return;

    safeHaptic('light');
    setSelectedId(item.matchId);
    setMissedId(null);
    setMessage(`Now tap the word for ${item.english}.`);
  }

  function selectWord(item: RoundItem) {
    if (matched[item.matchId]) return;

    if (!selectedItem) {
      safeHaptic('light');
      setMessage('Choose a picture first.');
      return;
    }

    if (selectedItem.matchId === item.matchId) {
      safeHaptic('success');
      setMatched(current => ({ ...current, [item.matchId]: true }));
      setSelectedId(null);
      setMissedId(null);
      setMessage(`Nice match: ${item.igbo}`);
      return;
    }

    safeHaptic('error');
    setMissedId(item.matchId);
    setMessage('Almost. Try another word.');
  }

  React.useEffect(() => {
    if (complete) {
      setMessage('Round complete. Great matching.');
    }
  }, [complete]);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <BackButton onPress={onBack} />
        <View style={s.headerCopy}>
          <Text style={s.eyebrow}>PICTURE MATCH</Text>
          <Text style={s.title}>Match pictures to Igbo words</Text>
          <Text style={s.sub}>Round {round} · {matchedCount} of {items.length} matched</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <View style={s.heroTopRow}>
            <View style={s.heroIcon}>
              <Ionicons name="images" size={28} color="#FFFFFF" />
            </View>
            <View style={s.heroCopy}>
              <Text style={s.heroTitle}>Tap to match.</Text>
              <Text style={s.heroSub}>{message}</Text>
            </View>
          </View>

          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${(matchedCount / items.length) * 100}%` as any }]} />
          </View>
        </View>

        <View style={s.gameBoard}>
          <Text style={s.sectionLabel}>Pictures</Text>

          <View style={s.pictureGrid}>
            {items.map(item => {
              const isSelected = selectedId === item.matchId;
              const isMatched = !!matched[item.matchId];

              return (
                <TouchableOpacity
                  key={item.matchId}
                  onPress={() => selectPicture(item)}
                  activeOpacity={0.86}
                  disabled={isMatched}
                  style={[
                    s.pictureCard,
                    isSelected && s.pictureCardSelected,
                    isMatched && s.pictureCardMatched,
                  ]}
                >
                  <View style={s.pictureFrame}>
                    <LessonIllustration igbo={item.igbo} english={item.english} emoji={item.emoji} size={96} />
                  </View>

                  <View style={s.cardStatusRow}>
                    {isMatched ? (
                      <>
                        <Ionicons name="checkmark-circle" size={17} color="#008A4A" />
                        <Text style={[s.pictureHint, s.pictureHintMatched]}>Matched</Text>
                      </>
                    ) : isSelected ? (
                      <>
                        <Ionicons name="radio-button-on" size={16} color="#854CE6" />
                        <Text style={[s.pictureHint, s.pictureHintSelected]}>Selected</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="hand-left" size={16} color="#6B6A58" />
                        <Text style={s.pictureHint}>Tap picture</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={s.sectionLabel}>Igbo words</Text>

          <View style={s.wordGrid}>
            {words.map(item => {
              const isMatched = !!matched[item.matchId];
              const isMissed = missedId === item.matchId;

              return (
                <TouchableOpacity
                  key={item.matchId}
                  onPress={() => selectWord(item)}
                  disabled={isMatched}
                  activeOpacity={0.86}
                  style={[
                    s.wordTile,
                    isMatched && s.wordTileMatched,
                    isMissed && s.wordTileMissed,
                  ]}
                >
                  <View style={s.wordTextGroup}>
                    <Text style={[s.wordText, isMatched && s.wordTextMatched]}>{item.igbo}</Text>
                    <Text style={s.wordSub}>{isMatched ? item.english : 'Tap to match'}</Text>
                  </View>

                  {isMatched ? (
                    <Ionicons name="checkmark-circle" size={25} color="#008A4A" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="#C9BEA3" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {complete && (
          <TouchableOpacity onPress={startNextRound} style={s.nextBtn} activeOpacity={0.88}>
            <Text style={s.nextText}>Next round</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },

  backBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DDF6FF',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.1,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    color: '#854CE6',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  title: {
    color: '#1B2A6B',
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  sub: {
    color: '#6B6A58',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    marginTop: 2,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 44,
  },

  heroCard: {
    backgroundColor: '#F0E3FF',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#D7B8FF',
    padding: 18,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#854CE6',
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
  },

  heroTitle: {
    color: '#1B2A6B',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },

  heroSub: {
    color: '#625F4A',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
    marginTop: 3,
  },

  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
    marginTop: 16,
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#854CE6',
  },

  gameBoard: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#F2E6C9',
    padding: 14,
  },

  sectionLabel: {
    color: '#1B2A6B',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  pictureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  pictureCard: {
    width: '47.5%',
    minHeight: 160,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DDF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  pictureCardSelected: {
    borderColor: '#854CE6',
    backgroundColor: '#F8F1FF',
    transform: [{ scale: 1.015 }],
  },

  pictureCardMatched: {
    backgroundColor: '#E9FBEF',
    borderColor: '#19B36B',
    opacity: 0.92,
  },

  pictureFrame: {
    width: 104,
    height: 104,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FBFF',
    overflow: 'hidden',
    marginBottom: 8,
  },

  cardStatusRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  pictureHint: {
    color: '#6B6A58',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900',
  },

  pictureHintSelected: {
    color: '#854CE6',
  },

  pictureHintMatched: {
    color: '#008A4A',
  },

  wordGrid: {
    gap: 10,
  },

  wordTile: {
    minHeight: 72,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5DDC8',
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  wordTileMatched: {
    backgroundColor: '#E9FBEF',
    borderColor: '#19B36B',
  },

  wordTileMissed: {
    borderColor: '#F04483',
    backgroundColor: '#FFE3EF',
  },

  wordTextGroup: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  wordText: {
    color: '#1B2A6B',
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
  },

  wordTextMatched: {
    color: '#008A4A',
  },

  wordSub: {
    color: '#7A765F',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    marginTop: 2,
  },

  nextBtn: {
    marginTop: 18,
    minHeight: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#854CE6',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  nextText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
});
