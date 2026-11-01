# Mụta Igbo — Voice Recording Workflow

How to record word pronunciations and get them into the app.
First batch: **Numbers 1–20**.

The app is already wired: every word "🔊 Listen" button, the number ▶ buttons,
and "Say It Back" call `getWordAudio(item.igbo)`. When a recording exists it plays
the real voice; when it doesn't, it falls back to the gentle tap sound. So you just
need to add the audio files — no per-word code changes.

---

## Step 1 — Open the recording studio (on your Mac)

From the project folder, start a local server (the mic only works over a server,
not a `file://` page):

```
python3 -m http.server 8787 --directory tools/recording-studio
```

Then open **http://localhost:8787** in Chrome.

## Step 2 — Load the Numbers 1–20 batch

1. Click **"Load manifest manually"**.
2. Choose `tools/recording-studio/recording-manifest.numbers-1-20.json`.

You'll see just the 20 number words (Otu → Iri abụọ) instead of the whole app.

## Step 3 — Record each number

For each word:

- **Hold** the mic button (or hold **Space**) and say the word clearly.
- Release to preview. Listen back.
- Tick the 4 QA boxes (pronunciation, no noise, no clipping, clean start/end).
- Click **"Approve and download"** — this downloads a `.webm` file
  (e.g. `otu.webm`) to your Downloads folder.
- It advances to the next word automatically. Use **←/→** to move around.

Record all 20. Filenames are pre-assigned, so don't rename them.

## Step 4 — Move the .webm files into the project

Move all 20 downloaded `.webm` files into:

```
recordings/raw-webm/
```

(That folder is gitignored — raw takes never get committed.)

## Step 5 — Process + install + register (one command)

```
sh scripts/add_recordings.sh
```

This uses ffmpeg to trim/normalize each `.webm` → `.m4a`, copies them into
`assets/audio/central-igbo/native-v1/`, and regenerates
`src/data/audioRegistry.ts` so the app can find them.

> No ffmpeg? Install with `brew install ffmpeg`.
> Prefer I do it? Just drop the 20 `.webm` files in `recordings/raw-webm/` and tell
> me — I can run the processing + registry step here and verify it.

## Step 6 — Rebuild and hear it

Run the app (`npm start`, or a fresh EAS build). Open Numbers & Counting → the ▶
button on each number now plays your voice. Any number you haven't recorded yet
still plays the placeholder tap, so you can ship partial batches safely.

---

## Adding more words later

The whole app (296 words) is already in `tools/recording-studio/recording-manifest.json`.
To do another batch, either load that full manifest and record the section you want,
or ask me to generate another scoped manifest (like the numbers one).
Same Steps 4–6 apply every time.
