from pathlib import Path
import json
import re
import sys

ROOT = Path.cwd()
errors = []

VALID_100 = {"nari", "narị", "otu nari", "otu narị"}
VALID_DRINK = {"ịṅụ", "inu", "ịnu"}

def norm(value):
    return str(value or "").strip().lower()

def check_pair(source, english, igbo):
    e = norm(english)
    i = norm(igbo)

    if e == "one hundred" and i not in VALID_100:
        errors.append(f"{source}: One hundred has incorrect Igbo value: {igbo}")

    if e == "drink" and i not in VALID_DRINK:
        errors.append(f"{source}: Drink has incorrect Igbo value: {igbo}")

    if e == "drink" and i == "nwa":
        errors.append(f"{source}: Drink is incorrectly set to Nwa")

def scan_ts(path: Path):
    if not path.exists():
        return

    text = path.read_text(encoding="utf-8")

    for block in re.findall(r"\{[^{}]*\}", text, flags=re.S):
        english_match = re.search(r"""english\s*:\s*['"]([^'"]+)['"]""", block)
        igbo_match = re.search(r"""igbo\s*:\s*['"]([^'"]+)['"]""", block)

        if english_match and igbo_match:
            check_pair(str(path), english_match.group(1), igbo_match.group(1))

def scan_json(path: Path):
    if not path.exists():
        return

    data = json.loads(path.read_text(encoding="utf-8"))

    def walk(node):
        if isinstance(node, dict):
            if "english" in node and "igbo" in node:
                check_pair(str(path), node.get("english"), node.get("igbo"))

            for value in node.values():
                walk(value)

        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(data)

scan_ts(ROOT / "src/data/lessons.ts")
scan_json(ROOT / "content/vocabulary_master.json")

if errors:
    print("❌ Content validation failed:")
    for error in errors:
        print(f" - {error}")
    sys.exit(1)

print("✅ Content validation passed.")
