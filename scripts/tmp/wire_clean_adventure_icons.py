from pathlib import Path
import re

p = Path("src/app/index.tsx")
text = p.read_text(encoding="utf-8")

# Add ADVENTURE_ART constants if missing.
if "ADVENTURE_ART" not in text:
    marker = "type MainTab"
    idx = text.find(marker)
    if idx == -1:
        raise SystemExit("Could not find type MainTab marker")
    text = text[:idx] + """
const ADVENTURE_ART = {
  sayIt: require('../../assets/illustrations/custom/adventures/say-it.png'),
  wordMagic: require('../../assets/illustrations/custom/adventures/word-magic.png'),
  storyHut: require('../../assets/illustrations/custom/adventures/story-hut.png'),
  cultureQuest: require('../../assets/illustrations/custom/adventures/culture-quest.png'),
  gameLand: require('../../assets/illustrations/custom/adventures/game-land.png'),
};

""" + text[idx:]

# Add image field to picker objects. Safe no-op if already present.
repls = {
"{ icon: 'SAY', title: 'Say It!', sub: 'Talk like a star', bg: '#FFE6F0', accent: '#F64F72', action: () => openInner('sayItBack') }": "{ icon: 'SAY', image: ADVENTURE_ART.sayIt, title: 'Say It!', sub: 'Talk like a star', bg: '#FFE6F0', accent: '#F64F72', action: () => openInner('sayItBack') }",
"{ icon: 'ABC', title: 'Word Magic', sub: 'Translate & discover', bg: '#DDF6FF', accent: '#31BDED', action: () => openInner('translator') }": "{ icon: 'ABC', image: ADVENTURE_ART.wordMagic, title: 'Word Magic', sub: 'Translate & discover', bg: '#DDF6FF', accent: '#31BDED', action: () => openInner('translator') }",
"{ icon: 'STORY', title: 'Story Hut', sub: 'Hear folktales', bg: '#FFF1B8', accent: '#FFA62B', action: () => openInner('folktales') }": "{ icon: 'STORY', image: ADVENTURE_ART.storyHut, title: 'Story Hut', sub: 'Hear folktales', bg: '#FFF1B8', accent: '#FFA62B', action: () => openInner('folktales') }",
"{ icon: 'IGBO', title: 'Culture Quest', sub: 'Explore Igbo life', bg: '#E7FAEF', accent: '#19B765', action: () => openInner('history') }": "{ icon: 'IGBO', image: ADVENTURE_ART.cultureQuest, title: 'Culture Quest', sub: 'Explore Igbo life', bg: '#E7FAEF', accent: '#19B765', action: () => openInner('history') }",
"{ icon: 'PLAY', title: 'Game Land', sub: 'Play & earn stars', bg: '#F2E9FF', accent: '#7A45D8', action: () => openInner('games' as InnerView) }": "{ icon: 'PLAY', image: ADVENTURE_ART.gameLand, title: 'Game Land', sub: 'Play & earn stars', bg: '#F2E9FF', accent: '#7A45D8', action: () => openInner('games' as InnerView) }",
"{ icon: '🎤', title: 'Say It!', sub: 'Talk like a star', bg: '#FFE6F0', accent: '#F64F72', action: () => openInner('sayItBack') }": "{ icon: '🎤', image: ADVENTURE_ART.sayIt, title: 'Say It!', sub: 'Talk like a star', bg: '#FFE6F0', accent: '#F64F72', action: () => openInner('sayItBack') }",
"{ icon: '💬', title: 'Word Magic', sub: 'Translate & discover', bg: '#DDF6FF', accent: '#31BDED', action: () => openInner('translator') }": "{ icon: '💬', image: ADVENTURE_ART.wordMagic, title: 'Word Magic', sub: 'Translate & discover', bg: '#DDF6FF', accent: '#31BDED', action: () => openInner('translator') }",
"{ icon: '📚', title: 'Story Hut', sub: 'Hear folktales', bg: '#FFF1B8', accent: '#FFA62B', action: () => openInner('folktales') }": "{ icon: '📚', image: ADVENTURE_ART.storyHut, title: 'Story Hut', sub: 'Hear folktales', bg: '#FFF1B8', accent: '#FFA62B', action: () => openInner('folktales') }",
"{ icon: '🌍', title: 'Culture Quest', sub: 'Explore Igbo life', bg: '#E7FAEF', accent: '#19B765', action: () => openInner('history') }": "{ icon: '🌍', image: ADVENTURE_ART.cultureQuest, title: 'Culture Quest', sub: 'Explore Igbo life', bg: '#E7FAEF', accent: '#19B765', action: () => openInner('history') }",
"{ icon: '🎮', title: 'Game Land', sub: 'Play & earn stars', bg: '#F2E9FF', accent: '#7A45D8', action: () => openInner('games' as InnerView) }": "{ icon: '🎮', image: ADVENTURE_ART.gameLand, title: 'Game Land', sub: 'Play & earn stars', bg: '#F2E9FF', accent: '#7A45D8', action: () => openInner('games' as InnerView) }",
}
for old, new in repls.items():
    text = text.replace(old, new)

# Replace sheet bubble renderer with Image support.
old = """                  <View style={[sh.adventureSheetBubble, { backgroundColor: card.accent }]}>
                    <Text style={sh.adventureSheetIcon}>{card.icon}</Text>
                  </View>"""
new = """                  <View style={[sh.adventureSheetBubble, { backgroundColor: '#FFFFFF' }]}>
                    {'image' in card ? (
                      <Image source={card.image} style={sh.adventureSheetImage} resizeMode=\"contain\" />
                    ) : (
                      <Text style={[sh.adventureSheetIcon, { color: card.accent }]}>{card.icon}</Text>
                    )}
                  </View>"""
text = text.replace(old, new)

# Replace portal icon with Story Hut art.
old_portal = """          <View style={sh.adventurePortalIcon}>
            <Text style={sh.adventurePortalEmoji}>PLAY</Text>
          </View>"""
new_portal = """          <View style={sh.adventurePortalIcon}>
            <Image source={ADVENTURE_ART.storyHut} style={sh.adventurePortalImage} resizeMode=\"contain\" />
          </View>"""
text = text.replace(old_portal, new_portal)

# Insert/update styles.
anchor = "const sh = StyleSheet.create({"
idx = text.find(anchor)
if idx == -1:
    raise SystemExit("Could not find StyleSheet")

# Simple append; duplicate keys are possible if old styles exist, so first remove image style entries only.
for key in ["adventureSheetImage", "adventurePortalImage"]:
    text = re.sub(rf"\n\s*{key}:\s*\{{[\s\S]*?\n\s*\}},", "", text, count=1)

style_insert = """
  adventureSheetImage: {
    width: 104,
    height: 92,
  },
  adventurePortalImage: {
    width: 132,
    height: 112,
  },
"""
idx = text.find(anchor)
text = text[:idx + len(anchor)] + style_insert + text[idx + len(anchor):]

# Make icon container white/clean.
text = re.sub(
    r"adventureSheetBubble:\s*\{[\s\S]*?\n\s*\},",
    """adventureSheetBubble: {
    width: 92,
    height: 82,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(27, 42, 107, 0.08)',
  },""",
    text,
    count=1,
)
text = re.sub(
    r"adventurePortalIcon:\s*\{[\s\S]*?\n\s*\},",
    """adventurePortalIcon: {
    width: 104,
    height: 94,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1B2A6B',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
    overflow: 'visible',
  },""",
    text,
    count=1,
)

p.write_text(text, encoding="utf-8")
print("✅ Wired clean standalone adventure icons.")
