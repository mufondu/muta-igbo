from pathlib import Path

ALLOWED = {
    "docs/content/IGBO_SOURCE_OF_TRUTH.md",
}

BLOCKED_TERMS = [
    "Okowaokwu Igbo",
    "Yvonne Chiọma Mbanefo",
    "Yvonne Chioma Mbanefo",
    "Learn Igbo Now",
    "LearnIgboNow",
    "www.LearnIgboNow.com",
    "learnigbonow.com",
]

hits = []

for path in Path(".").rglob("*"):
    if not path.is_file():
        continue

    if ".git" in path.parts or "node_modules" in path.parts:
        continue

    rel = str(path)

    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue

    for term in BLOCKED_TERMS:
        if term in text and rel not in ALLOWED:
            hits.append((rel, term))

if hits:
    print("Reference-only source appears outside approved internal docs:")
    for rel, term in hits:
        print(f" - {rel}: {term}")
    raise SystemExit(1)

print("Reference-only source audit passed.")
