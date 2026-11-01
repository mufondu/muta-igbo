// Web-only polish: hover/focus feedback, pointer cursors, calmer scrollbars.
// Injected once as a <style> tag. No-op on iOS/Android.
import { Platform } from 'react-native';

const CSS = `
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
::selection { background: #FFE08A; color: #1B2A6B; }

/* Everything tappable behaves like a real web control. */
[role="button"], [role="checkbox"], [role="link"] { cursor: pointer; }
[role="button"][aria-disabled="true"] { cursor: not-allowed; }

/* Hover lift. Uses the standalone 'translate' property so it never fights the
   inline 'transform: rotate(...)' some cards use. */
[role="button"] { transition: translate .16s ease, filter .16s ease, box-shadow .16s ease; }
/* Leaf buttons only: full-screen modal backdrops are also role=button and contain
   other buttons, so they are skipped (:has) and never shift. */
@media (hover: hover) and (pointer: fine) {
  [role="button"]:not(:has([role="button"])):hover { translate: 0 -2px; filter: brightness(1.03) saturate(1.04); }
  [role="button"]:not(:has([role="button"])):active { translate: 0 0; filter: brightness(.98); }
}

/* Visible keyboard focus (mouse clicks do not show it). */
[role="button"]:focus-visible, [role="checkbox"]:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 3px solid #5B33C9; outline-offset: 3px; border-radius: 18px;
}
input:focus, textarea:focus { outline: none; }
input:focus-visible, textarea:focus-visible { outline: 3px solid #5B33C9; }

/* Slim, quiet scrollbars. */
* { scrollbar-width: thin; scrollbar-color: rgba(27,42,107,.28) transparent; }
*::-webkit-scrollbar { width: 10px; height: 10px; }
*::-webkit-scrollbar-thumb { background: rgba(27,42,107,.22); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
*::-webkit-scrollbar-thumb:hover { background: rgba(27,42,107,.4); background-clip: content-box; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  [role="button"] { transition: none; }
  [role="button"]:not(:has([role="button"])):hover { translate: 0 0; }
}
`;

let injected = false;

export function injectWebStyles() {
  if (Platform.OS !== 'web' || injected) return;
  const doc = (globalThis as unknown as { document?: Document }).document;
  if (!doc) return;
  injected = true;
  const el = doc.createElement('style');
  el.setAttribute('data-muta-web-styles', '');
  el.textContent = CSS;
  doc.head.appendChild(el);
}
