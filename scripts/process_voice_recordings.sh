#!/bin/sh
# Mụta Igbo voice post-processing
# Author: Michael Ufondu
#
# Converts browser .webm captures into app-ready .m4a files.
# Requires ffmpeg.

set -eu

RAW_DIR="${1:-recordings/raw-webm}"
OUT_DIR="${2:-recordings/processed-m4a}"

mkdir -p "$OUT_DIR"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required. Install it first."
  exit 1
fi

count=0

for input in "$RAW_DIR"/*.webm; do
  [ -e "$input" ] || continue

  base=$(basename "$input" .webm)
  output="$OUT_DIR/$base.m4a"

  ffmpeg -y \
    -i "$input" \
    -af "silenceremove=start_periods=1:start_duration=0.08:start_threshold=-45dB:stop_periods=1:stop_duration=0.18:stop_threshold=-45dB,loudnorm=I=-16:TP=-1.5:LRA=11" \
    -c:a aac \
    -b:a 128k \
    "$output"

  count=$((count + 1))
  echo "processed: $output"
done

echo "Processed $count file(s)."
