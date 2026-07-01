from pathlib import Path
import json
import re

ROOT = Path.cwd()

NUMBER_100 = "narị"
DRINK = "Ịṅụ"

def patch_ts_objects(path: Path):
    if not path.exists():
        return False

    text = path.read_text(encoding="utf-8")
    original = text

    def patch_block(match):
        block = match.group(0)

        has_one_hundred = re.search(r"""english\s*:\s*['"]One hundred['"]""", block, re.I)
        has_number_100 = re.search(r"""(?:number|value|display|label)\s*:\s*['"]?100['"]?""", block, re.I)
        has_drink = re.search(r"""english\s*:\s*['"]Drink['"]""", block, re.I)

        if has_one_hundred or has_number_100:
            if re.search(r"""igbo\s*:\s*['"][^'"]*['"]""", block):
                block = re.sub(r"""igbo\s*:\s*['"][^'"]*['"]""", f"igbo: '{NUMBER_100}'", block, count=1)
            elif re.search(r"""word\s*:\s*['"][^'"]*['"]""", block):
                block = re.sub(r"""word\s*:\s*['"][^'"]*['"]""", f"word: '{NUMBER_100}'", block, count=1)

        if has_drink:
            if re.search(r"""igbo\s*:\s*['"][^'"]*['"]""", block):
                block = re.sub(r"""igbo\s*:\s*['"][^'"]*['"]""", f"igbo: '{DRINK}'", block, count=1)
            elif re.search(r"""word\s*:\s*['"][^'"]*['"]""", block):
                block = re.sub(r"""word\s*:\s*['"][^'"]*['"]""", f"word: '{DRINK}'", block, count=1)

        return block

    text = re.sub(r"\{[^{}]*\}", patch_block, text, flags=re.S)

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"✅ Patched {path}")
        return True

    print(f"ℹ️ No known content fixes needed in {path}")
    return False

def patch_json(path: Path):
    if not path.exists():
        return False

    data = json.loads(path.read_text(encoding="utf-8"))
    changed = False

    def walk(node):
        nonlocal changed

        if isinstance(node, dict):
            values = {str(k).lower(): v for k, v in node.items()}
            english = str(values.get("english", "")).strip().lower()
            label = str(values.get("label", "")).strip().lower()
            value = str(values.get("value", "")).strip().lower()

            if english == "one hundred" or label == "100" or value == "100":
                if node.get("igbo") != NUMBER_100:
                    node["igbo"] = NUMBER_100
                    changed = True

            if english == "drink":
                if node.get("igbo") != DRINK:
                    node["igbo"] = DRINK
                    changed = True

            for item in node.values():
                walk(item)

        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(data)

    if changed:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"✅ Patched {path}")
        return True

    print(f"ℹ️ No known content fixes needed in {path}")
    return False

targets = [
    ROOT / "src/data/lessons.ts",
    ROOT / "content/vocabulary_master.json",
]

for target in targets:
    if target.suffix == ".json":
        patch_json(target)
    else:
        patch_ts_objects(target)

print("✅ Known content fixes complete.")
