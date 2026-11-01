#!/bin/sh
# Mụta Igbo — one-step recording installer
# Author: Michael Ufondu
#
# Chains the full post-recording pipeline:
#   1. Convert/trim/normalize raw .webm captures -> .m4a  (ffmpeg)
#   2. Copy the .m4a files into the native teaching voice-set folder
#   3. Regenerate src/data/audioRegistry.ts so the app can play them
#
# Usage:  sh scripts/add_recordings.sh
# Put your recorded .webm files in recordings/raw-webm/ first.

set -eu

RAW_DIR="recordings/raw-webm"
PROCESSED_DIR="recordings/processed-m4a"
VOICE_DIR="assets/audio/central-igbo/native-v1"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required. Install it first (macOS: brew install ffmpeg)."
  exit 1
fi

webm_count=$(ls -1 "$RAW_DIR"/*.webm 2>/dev/null | wc -l | tr -d ' ')
if [ "$webm_count" = "0" ]; then
  echo "No .webm files found in $RAW_DIR. Record in the studio and move the files there first."
  exit 1
fi

echo "Step 1/3: processing $webm_count raw recording(s) -> .m4a"
sh scripts/process_voice_recordings.sh "$RAW_DIR" "$PROCESSED_DIR"

echo "Step 2/3: installing .m4a files into $VOICE_DIR"
mkdir -p "$VOICE_DIR"
cp "$PROCESSED_DIR"/*.m4a "$VOICE_DIR"/
installed=$(ls -1 "$VOICE_DIR"/*.m4a 2>/dev/null | wc -l | tr -d ' ')
echo "  $VOICE_DIR now has $installed file(s)."

echo "Step 3/3: regenerating audio registry"
node scripts/generate_audio_registry.js

echo ""
echo "Done. Rebuild the app to hear the new recordings."
