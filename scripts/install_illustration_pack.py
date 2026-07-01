from pathlib import Path
import shutil
import sys

ROOT = Path.cwd()
SOURCE = Path.home() / "Downloads" / "muta-illustration-pack"

TARGETS = {
    "family": [
        "grandmother", "grandfather", "mother", "father", "brother", "sister",
        "child", "children", "uncle", "aunt", "cousin",
    ],
    "body": [
        "head", "eye", "mouth", "hand", "leg", "ear", "nose",
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

if not SOURCE.exists():
    print(f"Missing illustration pack folder: {SOURCE}")
    print("Create this folder and add PNGs using the expected names.")
    sys.exit(1)

installed = 0
missing = []

for category, names in TARGETS.items():
    target_dir = ROOT / "assets" / "illustrations" / "custom" / category
    target_dir.mkdir(parents=True, exist_ok=True)

    for name in names:
        source_file = SOURCE / category / f"{name}.png"
        target_file = target_dir / f"{name}.png"

        if source_file.exists():
            shutil.copy2(source_file, target_file)
            installed += 1
            print(f"Installed {category}/{name}.png")
        else:
            missing.append(f"{category}/{name}.png")

print()
print(f"Installed: {installed}")

if missing:
    print("Missing:")
    for item in missing:
        print(f" - {item}")

if installed == 0:
    sys.exit(1)
