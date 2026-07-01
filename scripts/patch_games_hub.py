from pathlib import Path

FILE = Path("src/screens/games/GamesHub.tsx")

text = FILE.read_text()

replacements = {
    "Egwu Igbo 🎮": "Mụta Challenge 🎮",
    "Igbo Language Games": "Learn through Play",
    "Learn Igbo through play! Choose a game below. All games have Easy, Medium and Hard levels. 🌍":
    "Choose a Mụta Challenge and help your Mụta Friend learn Igbo.",
    "Listen & Tap": "Find It!",
    "See an Igbo word and tap the correct picture":
    "Find the picture that matches the Igbo word.",
    "Earn badges as you play!":
    "Earn badges as you learn!"
}

for old,new in replacements.items():
    text = text.replace(old,new)

FILE.write_text(text)

print("✅ Games Hub patched.")
