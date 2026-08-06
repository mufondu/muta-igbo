# Mụta Igbo — Build & Deploy Guide

Pre-flight spot-check done **2026-08-05**. Result: **build-ready**, with one dependency
blocker fixed (see below). Follow the steps in order — Step 1 is mandatory.

---

## Spot-check summary

| Check | Result |
|---|---|
| `tsc --noEmit` (full project typecheck) | 0 errors |
| All 124 `require()` asset paths resolve | pass |
| Root assets (icon/adaptive-icon/splash/favicon) exist & sized | 1024^2 (favicon 512^2) |
| app.json: bundle IDs, versions, expo-router, EAS projectId | present |
| This session's fixes (scoring, streak, timers, quiz pool, gate, mic, icon) | all intact |
| **`expo-haptics` declared as a dependency** | was MISSING — now fixed |

**The one real blocker (fixed):** `src/utils/haptics.ts` does `require('expo-haptics')`,
but the package was installed locally without being saved to `package.json`/`package-lock.json`.
EAS builds do a **clean install on their servers**, so the module would have been absent and
Metro bundling would have failed. Added `expo-haptics ~15.0.8` (and `@expo/vector-icons ^15.0.3`)
to `package.json`. **You must sync the lockfile locally — that's Step 1.**

Minor notes (not blockers): `assets/icon.png` has an alpha channel; iOS icons must be opaque —
Expo's pipeline flattens it, but if the store flags it, export a flat (no-transparency) 1024^2.
`expo-av` is deprecated in SDK 54 but still functional.

---

## Step 1 — Sync dependencies + lockfile  (REQUIRED, run locally first)

I edited `package.json` but could not update `package-lock.json` from here. EAS runs
`npm ci`, which fails if the two are out of sync. Run this in the project folder:

```bash
npx expo install expo-haptics @expo/vector-icons
```

This pins the SDK-54-correct versions and updates `package-lock.json`. Then sanity-check:

```bash
npx expo-doctor
```

---

## Step 2 — Push to GitHub  (https://github.com/mufondu/muta-igbo)

No git remote is configured yet. From the project folder:

```bash
# one-time identity (skip if already set globally)
git config user.name  "Michael Ufondu"
git config user.email "you@example.com"

git remote add origin https://github.com/mufondu/muta-igbo.git

git add -A
git commit -m "Bug-bounty fixes, pronunciation feature, Phrasebook icon, EAS build prep"

# you are on branch feature/ui-rewrite — push it, or merge to main first
git push -u origin feature/ui-rewrite
```

> If the GitHub repo is empty, this first push creates the branch there. Open a PR to `main`
> when ready, or push straight to main with `git push -u origin feature/ui-rewrite:main`.

---

## Step 3 — Build with EAS

```bash
npm install -g eas-cli      # if not already installed
eas login                   # your Expo account (I can't log in for you)
```

The project is already linked (EAS `projectId` is in `app.json`), so no `eas init` needed.

### Android — installable APK (easiest, no dev account)

```bash
eas build --platform android --profile preview
```

Produces a downloadable **.apk**. Open the build link on the phone (or scan the QR), download,
and install — enable "Install unknown apps" for your browser when Android prompts.

### iOS — device build (requires a paid Apple Developer account)

You **cannot** install on a physical iPhone without the **Apple Developer Program ($99/yr)** —
iOS has no APK-style sideload. With the account:

```bash
eas device:create                                   # register the iPhone UDID (one time)
eas build --platform ios --profile preview          # ad-hoc build for that device
```

Install via the build link on the device. (Alternatively, `--profile production` + `eas submit`
to distribute through TestFlight — also needs the Apple account + App Store Connect.)

### Both at once

```bash
eas build --platform all --profile preview
```

---

## Version bumping for future builds

`app.json` is at `version 2.0.1` (Android `versionCode 2`, iOS `buildNumber 2.0.1`).
The `production` profile has `autoIncrement`, so store builds bump automatically. For repeated
`preview` installs Android reuses the same versionCode fine; bump `version` in `app.json` when
you ship a meaningful update.
