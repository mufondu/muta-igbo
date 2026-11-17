#!/usr/bin/env node
/**
 * Mụta Igbo PWA post-build step. Run after `expo export --platform web`.
 *  - copies pwa/* (manifest, service worker, icons) into dist/
 *  - stamps the service worker with a build id
 *  - injects the manifest link, theme colour, iOS tags, install-prompt capture and
 *    service worker registration into dist/index.html
 * Safe to run twice (it skips injection if already present).
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dist = path.join(root, 'dist');
const pwa = path.join(root, 'pwa');
const indexPath = path.join(dist, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found. Run "npx expo export --platform web" first.');
  process.exit(1);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const a = path.join(from, name);
    const b = path.join(to, name);
    if (fs.statSync(a).isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}
copyDir(pwa, dist);

const swPath = path.join(dist, 'sw.js');
fs.writeFileSync(swPath, fs.readFileSync(swPath, 'utf8').replace('__BUILD__', Date.now().toString(36)));

let html = fs.readFileSync(indexPath, 'utf8');
if (html.includes('rel="manifest"')) {
  console.log('index.html already has PWA tags; skipping injection.');
} else {
  const head = `
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#7A45D8">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Mụta Igbo">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<script>
// Keep Chrome/Edge/Android's install prompt so the app can show its own Install button later.
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  window.__mutaInstallEvent = e;
  window.dispatchEvent(new Event('muta-install-available'));
});
window.addEventListener('appinstalled', function () {
  window.__mutaInstallEvent = null;
  window.dispatchEvent(new Event('muta-installed'));
});
</script>
`;
  const reg = `
<script>
if ('serviceWorker' in navigator) {
  // Tell the app when a NEW version has taken over, so it can offer a refresh.
  // We never reload by ourselves, so a child in the middle of a lesson is not interrupted.
  var hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (hadController) {
      window.__mutaUpdateReady = true;
      window.dispatchEvent(new Event('muta-update-ready'));
    }
    hadController = true;
  });
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      // Look for a new version when the app comes back to the foreground, and every 30 minutes.
      document.addEventListener('visibilitychange', function () { if (!document.hidden) reg.update().catch(function () {}); });
      setInterval(function () { reg.update().catch(function () {}); }, 30 * 60 * 1000);
    }).catch(function () {});
  });
}
</script>
`;
  if (!html.includes('</head>') || !html.includes('</body>')) {
    console.error('Unexpected index.html (no </head> or </body>).');
    process.exit(1);
  }
  html = html.replace('</head>', head + '</head>').replace('</body>', reg + '</body>');
  fs.writeFileSync(indexPath, html);
}
console.log('PWA files added to dist/');
