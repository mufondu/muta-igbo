#!/usr/bin/env python3
"""Build docs/picture-review.html: a self-contained contact sheet of every picture-word pair.

Reads src/data/pictureRegistry.ts and the image files listed in
src/components/illustrations/customManifest.ts, writes one HTML file with small embedded
thumbnails (no external requests). A reviewer can mark Keep / Replace / Text only on each
card and copy the decisions as JSON.

Usage:  python3 scripts/build_picture_review.py
"""
import base64, html, io, json, re, sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Needs Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "src/data/pictureRegistry.ts"
MANIFEST = ROOT / "src/components/illustrations/customManifest.ts"
OUT = ROOT / "docs/picture-review.html"
THUMB = 200

ENTRY = re.compile(r"^\s*\{ igbo: (\".*?\"), english: (\".*?\"), status: (\".*?\")(.*)\},\s*$")


def parse_registry():
    rows = []
    for line in REGISTRY.read_text(encoding="utf-8").splitlines():
        m = ENTRY.match(line)
        if not m:
            continue
        rest = m.group(4)
        row = {
            "igbo": json.loads(m.group(1)),
            "english": json.loads(m.group(2)),
            "status": json.loads(m.group(3)),
            "asset": None,
            "game": "game: true" in rest,
            "note": "",
        }
        a = re.search(r"asset: (\".*?\")", rest)
        if a:
            row["asset"] = json.loads(a.group(1))
        n = re.search(r"note: (\".*\")\s*$", rest.strip())
        if n:
            row["note"] = json.loads(n.group(1))
        rows.append(row)
    return rows


def parse_manifest():
    paths = {}
    for m in re.finditer(r"'([a-z]+:[a-z-]+)': require\('([^']+)'\)", MANIFEST.read_text(encoding="utf-8")):
        paths[m.group(1)] = (MANIFEST.parent / m.group(2)).resolve()
    return paths


_cache = {}


def thumb(path: Path) -> str:
    if path in _cache:
        return _cache[path]
    img = Image.open(path).convert("RGBA")
    img.thumbnail((THUMB, THUMB))
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    uri = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    _cache[path] = uri
    return uri


LABEL = {"approved": "Keep", "replace": "Replace", "needs_art": "Needs art", "text_only": "Text only"}


def card(r, paths):
    e = html.escape
    img = ""
    if r["asset"] and r["asset"] in paths and paths[r["asset"]].exists():
        img = f'<img src="{thumb(paths[r["asset"]])}" alt="">'
    else:
        img = '<div class="noimg">no picture</div>'
    note = f'<p class="note">{e(r["note"])}</p>' if r["note"] else ""
    game = '<span class="game">Games</span>' if r["game"] else ""
    key = e(r["igbo"] + " | " + r["english"], quote=True)
    return f"""<div class="card {r['status']}" data-status="{r['status']}" data-key="{key}">
  <div class="pic">{img}</div>
  <div class="igbo">{e(r['igbo'])}</div>
  <div class="eng">{e(r['english'])}</div>
  <div class="tags"><span class="badge {r['status']}">{LABEL[r['status']]}</span>{game}</div>
  {note}
  <div class="decide">
    <button data-d="keep">Keep</button><button data-d="replace">Replace</button><button data-d="text_only">Text only</button>
  </div>
</div>"""


def main():
    rows = parse_registry()
    paths = parse_manifest()
    if not rows:
        sys.exit("No registry entries parsed")
    pics = [r for r in rows if r["status"] in ("approved", "replace")]
    needs = [r for r in rows if r["status"] == "needs_art"]
    text = [r for r in rows if r["status"] == "text_only"]
    used = {r["asset"] for r in rows if r["asset"]}
    unused = sorted(k for k in paths if k not in used and k.split(":")[0] in ("family", "body", "animals", "verbs", "home", "food"))

    counts = {s: sum(1 for r in rows if r["status"] == s) for s in LABEL}
    unused_html = "".join(
        f'<div class="card unused"><div class="pic"><img src="{thumb(paths[k])}" alt=""></div><div class="igbo">{html.escape(k)}</div>'
        f'<div class="eng">No word uses this picture yet</div></div>'
        for k in unused if paths[k].exists()
    )
    text_rows = "".join(
        f'<tr data-status="text_only" data-key="{html.escape(r["igbo"] + " | " + r["english"], quote=True)}"><td>{html.escape(r["igbo"])}</td><td>{html.escape(r["english"])}</td></tr>'
        for r in text
    )

    doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mụta Igbo picture review</title>
<style>
:root{{--bg:#faf8f3;--ink:#1b1a2e;--mut:#6b6880;--card:#fff;--line:#e6e1d6;--keep:#1f9d55;--rep:#d9822b;--need:#7a45d8;--txt:#6b6880}}
@media (prefers-color-scheme:dark){{:root{{--bg:#15141f;--ink:#f1eff8;--mut:#a29fb8;--card:#201f2e;--line:#34324a}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 system-ui,sans-serif}}
main{{max-width:1200px;margin:0 auto;padding:24px 16px 80px}}
h1{{margin:0 0 4px;font-size:28px}}h2{{margin:36px 0 8px;font-size:20px}}
.sub{{color:var(--mut);margin:0 0 16px}}
.bar{{display:flex;flex-wrap:wrap;gap:8px;align-items:center;position:sticky;top:0;background:var(--bg);padding:10px 0;z-index:5;border-bottom:1px solid var(--line)}}
.bar button,.decide button{{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:6px 12px;cursor:pointer;font:inherit;font-size:14px}}
.bar button.on{{background:var(--ink);color:var(--bg)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;margin-top:12px}}
.card{{background:var(--card);border:2px solid var(--line);border-radius:14px;padding:10px;text-align:center}}
.card.approved{{border-color:var(--keep)}}.card.replace{{border-color:var(--rep)}}.card.needs_art{{border-color:var(--need)}}
.card.dec-keep{{outline:3px solid var(--keep)}}.card.dec-replace{{outline:3px solid var(--rep)}}.card.dec-text_only{{outline:3px solid var(--txt)}}
.pic{{height:150px;display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(#0000000a 0 25%,#0000 0 50%) 0 0/16px 16px;border-radius:10px}}
.pic img{{max-width:100%;max-height:100%}}.noimg{{color:var(--mut);font-size:13px}}
.igbo{{font-weight:800;font-size:18px;margin-top:8px}}.eng{{color:var(--mut);font-size:14px}}
.tags{{display:flex;gap:6px;justify-content:center;margin-top:6px;flex-wrap:wrap}}
.badge,.game{{font-size:12px;font-weight:700;border-radius:999px;padding:2px 8px;color:#fff}}
.badge.approved{{background:var(--keep)}}.badge.replace{{background:var(--rep)}}.badge.needs_art{{background:var(--need)}}.badge.text_only{{background:var(--txt)}}.game{{background:#3b82f6}}
.note{{font-size:12.5px;color:var(--mut);margin:6px 0 0;text-align:left}}
.decide{{display:flex;gap:4px;justify-content:center;margin-top:8px;flex-wrap:wrap}}.decide button{{padding:3px 8px;font-size:12px}}
table{{border-collapse:collapse;width:100%;font-size:14px}}td{{padding:5px 8px;border-bottom:1px solid var(--line)}}
tr.dec-keep td{{background:#1f9d5522}}tr.dec-replace td{{background:#d9822b22}}
textarea{{width:100%;height:140px;margin-top:8px;font:12px monospace;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:8px}}
.hidden{{display:none!important}}
</style></head><body><main>
<h1>Mụta Igbo picture review</h1>
<p class="sub">Every picture paired with the exact Igbo and English word it will appear with. Only "Keep" pictures are shown in the app. Click a button on a card to record your decision, then copy the JSON at the bottom.</p>
<div class="bar" id="bar">
 <button data-f="all" class="on">All ({len(rows)})</button>
 <button data-f="approved">Keep ({counts['approved']})</button>
 <button data-f="replace">Replace ({counts['replace']})</button>
 <button data-f="needs_art">Needs art ({counts['needs_art']})</button>
 <button data-f="text_only">Text only ({counts['text_only']})</button>
</div>
<h2>Pictures in use or under review ({len(pics)})</h2>
<div class="grid">{''.join(card(r, paths) for r in pics)}</div>
<h2>Words that need a new picture ({len(needs)})</h2>
<div class="grid">{''.join(card(r, paths) for r in needs)}</div>
<h2>Pictures no word uses yet ({len(unused)})</h2>
<div class="grid">{unused_html}</div>
<h2>Text only ({len(text)})</h2>
<p class="sub">Letters, numbers, greetings, phrases and sentences. These show text or their own emoji, never a guessed picture. Click a row to flag it for a picture.</p>
<table id="tx">{text_rows}</table>
<h2>Your decisions</h2>
<button id="copy" class="bar" style="padding:8px 14px;border-radius:999px;border:1px solid var(--line);cursor:pointer">Copy decisions as JSON</button>
<textarea id="out" readonly placeholder="Decisions appear here"></textarea>
</main>
<script>
var dec={{}};
function render(){{var o=document.getElementById('out');o.value=JSON.stringify(dec,null,1)}}
document.getElementById('bar').addEventListener('click',function(e){{var f=e.target.getAttribute('data-f');if(!f)return;
 [].forEach.call(this.querySelectorAll('button'),function(b){{b.classList.toggle('on',b===e.target)}});
 [].forEach.call(document.querySelectorAll('.card[data-status],#tx tr'),function(c){{c.classList.toggle('hidden',f!=='all'&&c.getAttribute('data-status')!==f)}});}});
document.addEventListener('click',function(e){{
 var b=e.target.closest('.decide button');var row=e.target.closest('#tx tr');
 if(b){{var c=b.closest('.card');var d=b.getAttribute('data-d');dec[c.getAttribute('data-key')]=d;
  c.className=c.className.replace(/ dec-\\S+/g,'')+' dec-'+d;render();}}
 else if(row){{var k=row.getAttribute('data-key');if(dec[k]==='replace'){{delete dec[k];row.className=''}}else{{dec[k]='replace';row.className='dec-replace'}}render();}}
}});
document.getElementById('copy').onclick=function(){{var o=document.getElementById('out');o.select();try{{document.execCommand('copy')}}catch(x){{}}}};
</script></body></html>"""
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(doc, encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size/1024:.0f} KB): {counts}, unused pictures {len(unused)}")


if __name__ == "__main__":
    main()
