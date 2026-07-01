from pathlib import Path

ROOT = Path.cwd()
OUT = ROOT / "src" / "components" / "illustrations" / "customManifest.ts"

PACKS = {
    "family": [
        "grandmother", "grandfather", "mother", "father", "brother", "sister",
        "child", "children", "uncle", "aunt", "cousin",
    ],
    "body": [
        "head", "eye", "eyebrow", "mouth", "hand", "leg", "ear", "nose",
    ],
    "animals": [
        "dog", "cat", "chicken", "goat", "fish", "bird", "leopard",
    ],
    "home": [
        "house", "water", "book",
    ],
    "food": [
        "food",
    ],
}

lines = [
    "import { ImageSourcePropType } from 'react-native';",
    "",
    "export const CUSTOM_ILLUSTRATIONS: Record<string, ImageSourcePropType> = {",
]

count = 0

for category, names in PACKS.items():
    lines.append(f"  // {category}")
    for name in names:
        asset = ROOT / "assets" / "illustrations" / "custom" / category / f"{name}.png"
        if asset.exists():
            lines.append(f"  '{category}:{name}': require('../../../assets/illustrations/custom/{category}/{name}.png'),")
            count += 1
    lines.append("")

lines.append("};")
lines.append("")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text("\n".join(lines), encoding="utf-8")

print(f"Generated {OUT}")
print(f"Registered custom illustrations: {count}")
