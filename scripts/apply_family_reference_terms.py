
from pathlib import Path

LESSONS = Path('src/data/lessons.ts')
ILLUSTRATION = Path('src/components/illustrations/LessonIllustration.tsx')
DOC = Path('docs/content/FAMILY_TERMS_QA.md')

family_items = [
    ('Nna', 'Father / Dad', '👨🏾'),
    ('Nne', 'Mother / Mum', '👩🏾'),
    ('Nwanne', 'Brother', '👦🏾'),
    ('Nwanne', 'Sister', '👧🏾'),
    ('Nwa nwoke', 'Son', '👦🏾'),
    ('Ada', 'Daughter', '👧🏾'),
    ('Ụmụnne', 'Siblings', '🧒🏾'),
    ('Nna nna', 'Grandfather', '👴🏾'),
    ('Nne nne', 'Grandmother', '👵🏾'),
    ('Nwanne nna', 'Uncle', '👨🏾'),
    ('Nwanne nna', 'Aunty', '👩🏾'),
    ('Nne na nna', 'Parent', '👨‍👩‍👧'),
    ('Nwa', 'Child', '🧒🏾'),
    ('Ọgbọ', 'Generation', '🌳'),
    ('Ezinụlọ', 'Family', '👨‍👩‍👧‍👦'),
    ('Ndị mmadụ', 'People', '👥'),
    ('Enyi', 'Friend', '🤝'),
    ('Ọbịa', 'Guest', '👋🏾'),
]


def find_matching_close(text: str, open_index: int, open_char: str, close_char: str) -> int:
    depth = 0
    quote = None
    escape = False
    for i in range(open_index, len(text)):
        ch = text[i]
        if quote:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == quote:
                quote = None
            continue
        if ch in ('"', "'", '`'):
            quote = ch
            continue
        if ch == open_char:
            depth += 1
        elif ch == close_char:
            depth -= 1
            if depth == 0:
                return i
    raise ValueError('No matching close character found')


def replace_family_section_items(text: str) -> str:
    markers = ["title: 'Family Members'", 'title: "Family Members"']
    marker_index = -1
    for marker in markers:
        marker_index = text.find(marker)
        if marker_index != -1:
            break
    if marker_index == -1:
        raise SystemExit('Could not find Family Members section in src/data/lessons.ts')

    items_index = text.find('items:', marker_index)
    if items_index == -1:
        raise SystemExit('Could not find Family Members items array')

    array_start = text.find('[', items_index)
    if array_start == -1:
        raise SystemExit('Could not find Family Members items opening bracket')

    array_end = find_matching_close(text, array_start, '[', ']')

    lines = ['items: [']
    for igbo, english, emoji in family_items:
        lines.append(f"      {{ igbo: '{igbo}', english: '{english}', emoji: '{emoji}' }},")
    lines.append('    ]')
    replacement = '\n'.join(lines)
    return text[:items_index] + replacement + text[array_end + 1:]


if LESSONS.exists():
    lessons_text = LESSONS.read_text(encoding='utf-8')
    lessons_text = replace_family_section_items(lessons_text)
    LESSONS.write_text(lessons_text, encoding='utf-8')
    print('Updated Family Members lesson terms from approved reference list.')
else:
    raise SystemExit('Missing src/data/lessons.ts')

if ILLUSTRATION.exists():
    illustration_text = ILLUSTRATION.read_text(encoding='utf-8')
    replacements = {
        "'nne ochie'": "'nne nne'",
        "'nna ochie'": "'nna nna'",
        "normalizedIgbo === 'nne ochie'": "normalizedIgbo === 'nne nne'",
        "normalizedIgbo === 'nna ochie'": "normalizedIgbo === 'nna nna'",
        "{ keys: ['uncle', 'nna nna']": "{ keys: ['uncle', 'nwanne nna']",
        "{ keys: ['aunt', 'nwanne nne', 'nwanne nna']": "{ keys: ['aunt', 'nwanne nna']",
    }
    for old, new in replacements.items():
        illustration_text = illustration_text.replace(old, new)
    ILLUSTRATION.write_text(illustration_text, encoding='utf-8')
    print('Updated illustration matching terms for corrected family vocabulary.')
else:
    print('Skipped illustration matching patch because LessonIllustration.tsx was not found.')

doc_text = """# Family Terms QA

These terms are approved for Mụta Igbo as child-safe family vocabulary references.

## App Lesson Subset

| English | Igbo | Notes |
|---|---|---|
| Father / Dad | Nna | Verified reference term |
| Mother / Mum | Nne | Verified reference term |
| Brother | Nwanne | English label disambiguates the illustration |
| Sister | Nwanne | English label disambiguates the illustration |
| Son | Nwa nwoke | Verified reference term |
| Daughter | Ada | Verified reference term |
| Siblings | Ụmụnne | Verified reference term |
| Grandfather | Nna nna | Replaces Nna ochie |
| Grandmother | Nne nne | Replaces Nne ochie |
| Uncle | Nwanne nna | English label disambiguates the illustration |
| Aunty | Nwanne nna | English label disambiguates the illustration |
| Parent | Nne na nna | Verified reference term |
| Child | Nwa | Verified reference term |
| Generation | Ọgbọ | Verified reference term |
| Family | Ezinụlọ | Verified reference term |
| People | Ndị mmadụ | Verified reference term |
| Friend | Enyi | Verified reference term |
| Guest | Ọbịa | Verified reference term |

## Excluded From Kids Lesson For Now

The reference list includes adult relationship terms such as spouse, lover, fiancé/fiancée, in-law, and mistress. These should not be added to the child lesson flow unless a future parent/advanced section explicitly needs them.
"""
DOC.parent.mkdir(parents=True, exist_ok=True)
DOC.write_text(doc_text, encoding='utf-8')
print('Wrote docs/content/FAMILY_TERMS_QA.md')
