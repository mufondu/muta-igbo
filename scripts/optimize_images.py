#!/usr/bin/env python3
"""Shrink the app's illustration images for web (and faster native loads).

The web build downloads ~56 MB of 0.8-2.3 MB PNGs. Two modes:

  --format png   (default) Resize + lossless recompress. Same filenames, NO code
                 changes. Saves roughly 50-75% depending on --max.
  --format webp  Convert to lossy WebP (q85) and rewrite the literal
                 `...illustrations/.../x.png` paths in src/ to `.webp`.
                 Saves ~95%. Reversible via --restore. Works on iOS, Android, web.

Palette quantization is OFF by default because it smears gradients and turns soft
alpha shadows into gray blobs on this art. Enable with --quantize only if you
accept that.

Usage (from the project root):
  python3 scripts/optimize_images.py                       # dry run, png mode
  python3 scripts/optimize_images.py --format webp         # dry run, webp mode
  python3 scripts/optimize_images.py --format webp --write # apply
  python3 scripts/optimize_images.py --write --max 640     # png mode, smaller
  python3 scripts/optimize_images.py --restore .repair-backups/image-opt-YYYYMMDD-HHMMSS

Requires Pillow with WebP support:  pip install pillow
Backups (images and edited source files) go to .repair-backups/ (gitignored).
Note: scripts/generate_illustration_manifest.py still emits .png paths; rerunning
it after a webp conversion will reintroduce them.
"""
from __future__ import annotations

import argparse
import io
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DIRS = ["assets/illustrations"]
SRC_DIRS = ["src"]
SRC_EXTS = {".ts", ".tsx", ".js", ".jsx"}
CREATED_LIST = "created_files.txt"
# Store icons/splash must keep their exact formats and sizes.
SKIP_NAMES = {"icon.png", "adaptive-icon.png", "splash-icon.png", "favicon.png"}


def human(n: float) -> str:
    for unit in ("B", "kB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} GB"


def encode(src: Path, fmt: str, max_dim: int, quantize: bool, colors: int, quality: int) -> bytes:
    """Return encoded bytes for src in the target format (does not touch disk)."""
    with Image.open(src) as im:
        im.load()
        has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
        im = im.convert("RGBA" if has_alpha else "RGB")

        if max(im.size) > max_dim:
            scale = max_dim / max(im.size)
            im = im.resize(
                (max(1, round(im.width * scale)), max(1, round(im.height * scale))),
                Image.LANCZOS,
            )

        buf = io.BytesIO()
        if fmt == "webp":
            im.save(buf, format="WEBP", quality=quality, method=6)
        else:
            if quantize:
                method = Image.Quantize.FASTOCTREE if has_alpha else Image.Quantize.MEDIANCUT
                im = im.quantize(colors=colors, method=method, dither=Image.Dither.NONE)
            im.save(buf, format="PNG", optimize=True)
        return buf.getvalue()


def collect(dirs: list[str], min_bytes: int) -> list[Path]:
    files: list[Path] = []
    for d in dirs:
        base = ROOT / d
        if not base.exists():
            print(f"skip (missing): {d}")
            continue
        for p in sorted(base.rglob("*.png")):
            if p.name not in SKIP_NAMES and p.stat().st_size >= min_bytes:
                files.append(p)
    return files


def rewrite_refs(converted: set[str], write: bool, backup_root: Path) -> int:
    """Replace `<path>.png` with `<path>.webp` in source files for converted images.

    `converted` holds POSIX paths relative to the project root, e.g.
    'assets/illustrations/custom/family/mother.png'. Source refs are relative
    (../../assets/...), so we match on the 'assets/...' suffix.
    """
    pattern = re.compile(r"""(['"`])((?:\.\./|\./)*)(assets/[^'"`\n]+?\.png)\1""")
    edited = 0
    for d in SRC_DIRS:
        for p in sorted((ROOT / d).rglob("*")):
            if p.suffix not in SRC_EXTS or not p.is_file():
                continue
            text = p.read_text(encoding="utf-8")
            hits = 0

            def sub(m: re.Match) -> str:
                nonlocal hits
                if m.group(3) in converted:
                    hits += 1
                    return f"{m.group(1)}{m.group(2)}{m.group(3)[:-4]}.webp{m.group(1)}"
                return m.group(0)

            new = pattern.sub(sub, text)
            if hits:
                edited += 1
                print(f"  refs   {p.relative_to(ROOT)}: {hits} path(s) -> .webp")
                if write:
                    b = backup_root / p.relative_to(ROOT)
                    b.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(p, b)
                    p.write_text(new, encoding="utf-8")
    return edited


def restore(backup_dir: Path) -> None:
    backup_dir = backup_dir if backup_dir.is_absolute() else ROOT / backup_dir
    if not backup_dir.is_dir():
        sys.exit(f"Backup folder not found: {backup_dir}")
    created = backup_dir / CREATED_LIST
    if created.exists():
        for line in created.read_text().splitlines():
            f = ROOT / line
            if f.exists():
                f.unlink()
    n = 0
    for p in backup_dir.rglob("*"):
        if p.is_file() and p.name != CREATED_LIST:
            dest = ROOT / p.relative_to(backup_dir)
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, dest)
            n += 1
    print(f"Restored {n} files from {backup_dir}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dirs", nargs="*", default=DEFAULT_DIRS, help="folders to scan, relative to project root")
    ap.add_argument("--format", choices=["png", "webp"], default="png")
    ap.add_argument("--write", action="store_true", help="apply changes (default is dry run)")
    ap.add_argument("--max", type=int, default=768, dest="max_dim", help="max width/height in px (default 768)")
    ap.add_argument("--quality", type=int, default=85, help="WebP quality (default 85)")
    ap.add_argument("--quantize", action="store_true", help="PNG mode only: palette-quantize (lossy, see docstring)")
    ap.add_argument("--colors", type=int, default=256, help="palette size with --quantize")
    ap.add_argument("--min-kb", type=int, default=150, help="ignore files smaller than this (default 150)")
    ap.add_argument("--restore", metavar="BACKUP_DIR", help="restore from a backup folder and exit")
    args = ap.parse_args()

    if args.restore:
        restore(Path(args.restore))
        return

    files = collect(args.dirs, args.min_kb * 1024)
    if not files:
        sys.exit("No matching PNG files found.")

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_root = ROOT / ".repair-backups" / f"image-opt-{stamp}"
    webp = args.format == "webp"

    print(f"{'WRITING' if args.write else 'DRY RUN'}: {len(files)} files, format={args.format}, max {args.max_dim}px\n")

    before_total = after_total = changed = 0
    converted: set[str] = set()
    created: list[str] = []

    for src in files:
        rel = src.relative_to(ROOT)
        before = src.stat().st_size
        try:
            data = encode(src, args.format, args.max_dim, args.quantize, args.colors, args.quality)
        except Exception as e:
            print(f"  ERROR  {rel}: {e}")
            continue
        before_total += before

        if not webp and len(data) >= before:  # never grow a PNG
            after_total += before
            print(f"  keep   {rel}  {human(before)} (no gain)")
            continue

        after_total += len(data)
        changed += 1
        out = src.with_suffix(".webp") if webp else src
        print(f"  {'write' if args.write else 'would'}  {rel}{' -> .webp' if webp else ''}  {human(before)} -> {human(len(data))}")

        if args.write:
            b = backup_root / rel
            b.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, b)
            out.write_bytes(data)
            if webp:
                src.unlink()  # so the bundle no longer ships the PNG
                created.append(out.relative_to(ROOT).as_posix())
        if webp:
            converted.add(rel.as_posix())

    edited = 0
    if webp and converted:
        print()
        edited = rewrite_refs(converted, args.write, backup_root)

    if args.write and created:
        (backup_root / CREATED_LIST).write_text("\n".join(created) + "\n")

    saved = before_total - after_total
    pct = saved / before_total * 100 if before_total else 0
    print(f"\n{changed}/{len(files)} images {'changed' if args.write else 'would change'}"
          f"{f', {edited} source files updated' if webp else ''}. "
          f"{human(before_total)} -> {human(after_total)} (saves {human(saved)}, {pct:.0f}%)")
    if args.write and changed:
        print(f"Backups: {backup_root.relative_to(ROOT)}  (undo: --restore {backup_root.relative_to(ROOT)})")
        print("Next: npm run typecheck, then npx expo start --web and eyeball the art before committing.")
    elif not args.write:
        print("Dry run only. Re-run with --write to apply.")


if __name__ == "__main__":
    main()
