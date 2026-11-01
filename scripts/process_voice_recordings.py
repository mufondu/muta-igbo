#!/usr/bin/env python3
"""
Mụta Igbo — voice recording cleanup pipeline (v2)

Improvements over the single-pass shell version:
  * highpass (85 Hz)  -> removes low-frequency spacebar/key "thud"
  * adeclick          -> removes impulsive keyboard-tap clicks
  * afftdn            -> gentle broadband noise reduction (room hiss)
  * silenceremove x2  -> trims leading AND trailing silence/space
  * TWO-PASS loudnorm -> every clip lands at the SAME perceived loudness
                         (single-pass drifts clip-to-clip -> uneven volume)
  * afade in/out      -> 20 ms fades so trimmed edges have no click

Usage: python3 scripts/process_voice_recordings.py [RAW_DIR] [OUT_DIR]
"""
import json
import subprocess
import sys
import os
import tempfile

RAW_DIR = sys.argv[1] if len(sys.argv) > 1 else "recordings/raw-webm"
OUT_DIR = sys.argv[2] if len(sys.argv) > 2 else "recordings/processed-m4a"

# Loudness target (EBU R128). -16 LUFS integrated is the mobile/podcast standard.
TARGET_I = -16.0
TARGET_TP = -1.5
TARGET_LRA = 11.0

# Cleanup + trim chain applied before loudness measurement.
CLEAN_CHAIN = (
    "highpass=f=85,"
    "adeclick,"
    "afftdn=nf=-25,"
    # trim leading silence, keep a 30 ms lead-in pad
    "silenceremove=start_periods=1:start_silence=0.03:start_threshold=-45dB:detection=peak,"
    # reverse -> trim what was the trailing silence, keep 60 ms pad -> reverse back
    "areverse,"
    "silenceremove=start_periods=1:start_silence=0.06:start_threshold=-45dB:detection=peak,"
    "areverse"
)

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def ffprobe_duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nk=1:nw=1", path])
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0

def process(infile, outfile):
    name = os.path.basename(infile)
    with tempfile.TemporaryDirectory() as tmp:
        clean = os.path.join(tmp, "clean.wav")

        # --- Stage A: clean + trim to temp WAV (mono, 48 kHz) ---
        r = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                 "-i", infile, "-af", CLEAN_CHAIN,
                 "-ac", "1", "-ar", "48000", clean])
        if r.returncode != 0:
            print(f"  [FAIL clean] {name}: {r.stderr.strip()[:200]}")
            return False

        dur = ffprobe_duration(clean)
        if dur <= 0:
            print(f"  [FAIL empty] {name}: nothing left after trim")
            return False

        # --- Stage B: measure integrated loudness (loudnorm pass 1) ---
        r = run(["ffmpeg", "-hide_banner", "-y", "-i", clean, "-af",
                 f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json",
                 "-f", "null", "-"])
        stderr = r.stderr
        start = stderr.rfind("{")
        end = stderr.rfind("}")
        measured = json.loads(stderr[start:end + 1])
        input_i = float(measured["input_i"])

        # --- Stage C: flat-gain to target + true-peak limiter + fades -> m4a ---
        # For one-word clips loudnorm's linear apply gets capped by the peak
        # limiter (sharp plosives) and lands too quiet. Applying a single flat
        # gain (target - measured) then a brickwall limiter guarantees uniform
        # perceived loudness while keeping peaks under the ceiling.
        gain_db = TARGET_I - input_i
        limit = 10 ** (TARGET_TP / 20.0)  # -1.5 dB -> ~0.841 linear
        fade_out_st = max(0.0, dur - 0.02)
        chain = (
            f"volume={gain_db:.2f}dB,"
            f"alimiter=limit={limit:.4f}:level=disabled,"
            f"afade=t=in:st=0:d=0.02,"
            f"afade=t=out:st={fade_out_st:.3f}:d=0.02"
        )
        r = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                 "-i", clean, "-af", chain,
                 "-ac", "1", "-ar", "48000", "-c:a", "aac", "-b:a", "128k", outfile])
        if r.returncode != 0:
            print(f"  [FAIL norm] {name}: {r.stderr.strip()[:200]}")
            return False

        print(f"  ok  {name:24s} -> {ffprobe_duration(outfile):.2f}s")
        return True

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    files = sorted(f for f in os.listdir(RAW_DIR) if f.lower().endswith(".webm"))
    if not files:
        print(f"No .webm files in {RAW_DIR}")
        sys.exit(1)
    print(f"Processing {len(files)} file(s) from {RAW_DIR} -> {OUT_DIR}")
    ok = 0
    for f in files:
        base = os.path.splitext(f)[0]
        if process(os.path.join(RAW_DIR, f), os.path.join(OUT_DIR, base + ".m4a")):
            ok += 1
    print(f"Done: {ok}/{len(files)} succeeded")
    sys.exit(0 if ok == len(files) else 2)

if __name__ == "__main__":
    main()
