#!/usr/bin/env python3
"""
Mụta Igbo voice recording mastering pipeline (v3, "premium" pass)

Goal: cleaner room, consistent clip edges, a warmer and clearer voice.
Reads the RAW webm takes (never the already-processed m4a, to avoid double lossy encoding)
and writes to a NEW folder, so the v2 output is never overwritten.

Chain per clip:
  1. highpass 80 Hz + adeclick              remove rumble, keyboard taps and clicks
  2. afftdn (noise tracking) + light anlmdn broadband hiss and room noise
  3. agate (soft downward expander)         lowers room tone and reverb tail between sounds
  4. trim silence both ends                 then add CONSISTENT padding (80 ms lead, 160 ms tail)
  5. EQ: -2.5 dB @ 220 Hz (boxiness), +2 dB @ 3 kHz (clarity), lowpass 15 kHz
  6. de-esser                               tame sharp 's' and 'sh'
  7. gentle compressor                      evens out soft and loud syllables
  8. flat gain to -16 LUFS + true-peak limiter   every clip the same loudness
  9. 12 ms fade in, 120 ms fade out         no clicks, no abrupt cut-off

Usage: python3 scripts/process_voice_recordings_v3.py [RAW_DIR] [OUT_DIR] [--only name1,name2]
Requires ffmpeg and ffprobe.
"""
import os
import re
import subprocess
import sys
import tempfile

args = [a for a in sys.argv[1:] if not a.startswith("--")]
only = None
for a in sys.argv[1:]:
    if a.startswith("--only="):
        only = set(a.split("=", 1)[1].split(","))
RAW_DIR = args[0] if len(args) > 0 else "recordings/raw-webm"
OUT_DIR = args[1] if len(args) > 1 else "recordings/processed-v3"

TARGET_I = -16.0
TARGET_TP = -1.5
LEAD_PAD_MS = 80
TAIL_PAD_MS = 160
FADE_IN = 0.012
FADE_OUT = 0.12

CLEAN = (
    "highpass=f=80,"
    "adeclick,"
    "afftdn=nr=14:nf=-45:tn=1,"
    "anlmdn=s=3:p=0.002:r=0.002,"
    "agate=threshold=0.018:ratio=2.5:attack=3:release=90:range=0.25"
)
TRIM = (
    "silenceremove=start_periods=1:start_silence=0.02:start_threshold=-48dB:detection=peak,"
    "areverse,"
    "silenceremove=start_periods=1:start_silence=0.02:start_threshold=-48dB:detection=peak,"
    "areverse"
)
VOICE = (
    "equalizer=f=220:t=q:w=1.2:g=-2.5,"
    "equalizer=f=3000:t=q:w=1.0:g=2,"
    "lowpass=f=15000,"
    "deesser=i=0.5:m=0.5:f=0.5,"
    "acompressor=threshold=0.08:ratio=3:attack=6:release=90:makeup=2"
)


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nk=1:nw=1", path])
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


def process(infile, outfile):
    name = os.path.basename(infile)
    with tempfile.TemporaryDirectory() as tmp:
        a = os.path.join(tmp, "a.wav")
        r = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", infile,
                 "-af", f"{CLEAN},{TRIM},{VOICE}", "-ac", "1", "-ar", "48000", a])
        if r.returncode != 0 or duration(a) <= 0:
            print(f"  [FAIL clean] {name}: {r.stderr.strip()[:200] or 'empty after trim'}")
            return False

        # Find the gain that lands the voiced part on TARGET_I AFTER the limiter.
        # (Measuring before the limiter leaves clips with sharp peaks too quiet.)
        limit = 10 ** (TARGET_TP / 20.0)

        def measure(path):
            m = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "apad=whole_dur=1,ebur128", "-f", "null", "-"])
            return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", m.stderr)[-1])

        gain = TARGET_I - measure(a)
        for _ in range(3):
            b = os.path.join(tmp, "b.wav")
            run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", a, "-af",
                 f"volume={gain:.2f}dB,alimiter=limit={limit:.4f}:level=disabled", b])
            err = TARGET_I - measure(b)
            if abs(err) < 0.15:
                break
            gain += err

        dur = duration(a)
        total = dur + (LEAD_PAD_MS + TAIL_PAD_MS) / 1000.0
        chain = (
            f"volume={gain:.2f}dB,"
            f"alimiter=limit={limit:.4f}:level=disabled,"
            f"afade=t=in:st=0:d={FADE_IN},"
            f"afade=t=out:st={max(0.0, dur - FADE_OUT):.3f}:d={FADE_OUT},"
            f"adelay={LEAD_PAD_MS}|{LEAD_PAD_MS},"
            f"apad=pad_dur={TAIL_PAD_MS / 1000.0}"
        )
        r = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", a, "-af", chain,
                 "-t", f"{total:.3f}", "-ac", "1", "-ar", "48000", "-c:a", "aac", "-b:a", "160k", outfile])
        if r.returncode != 0:
            print(f"  [FAIL master] {name}: {r.stderr.strip()[:200]}")
            return False
        print(f"  ok  {name:28s} -> {duration(outfile):.2f}s  (gain {gain:+.1f} dB)")
        return True


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    files = sorted(f for f in os.listdir(RAW_DIR) if f.lower().endswith(".webm"))
    if only:
        files = [f for f in files if os.path.splitext(f)[0] in only]
    if not files:
        print(f"No matching .webm files in {RAW_DIR}")
        sys.exit(1)
    print(f"Mastering {len(files)} file(s): {RAW_DIR} -> {OUT_DIR}")
    ok = sum(process(os.path.join(RAW_DIR, f), os.path.join(OUT_DIR, os.path.splitext(f)[0] + ".m4a")) for f in files)
    print(f"Done: {ok}/{len(files)} succeeded")
    sys.exit(0 if ok == len(files) else 2)


if __name__ == "__main__":
    main()
