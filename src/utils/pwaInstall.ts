import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * "Install to this device" for the web app (a PWA). No app store involved.
 *
 * - Chrome, Edge and Android browsers fire `beforeinstallprompt`. scripts/pwa-postbuild.js injects a
 *   listener into index.html that keeps the event on window.__mutaInstallEvent, so it is not lost if
 *   it fires before React mounts. We use it to show our own Install button.
 * - iPhone and iPad Safari never fire it. People must use Share > Add to Home Screen, so we show steps.
 * - Desktop Safari and Firefox have no install prompt for web apps; we show a short generic hint.
 */

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

declare global {
  interface Window {
    __mutaInstallEvent?: InstallEvent | null;
  }
}

const IS_WEB = Platform.OS === 'web' && typeof window !== 'undefined';

function detectStandalone(): boolean {
  if (!IS_WEB) return false;
  try {
    const mq = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    return !!mq || (navigator as any).standalone === true;
  } catch {
    return false;
  }
}

function detectIOS(): boolean {
  if (!IS_WEB) return false;
  const ua = navigator.userAgent || '';
  const iPadOS = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
  return /iPad|iPhone|iPod/.test(ua) || iPadOS;
}

export type InstallState = {
  /** Running in a browser (not already installed) where install help is relevant. */
  show: boolean;
  /** One tap install is available (Chrome, Edge, Android). */
  canPrompt: boolean;
  /** iPhone or iPad Safari: needs manual Add to Home Screen. */
  isIOS: boolean;
  installed: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
};

export function useInstallApp(): InstallState {
  const [event, setEvent] = useState<InstallEvent | null>(IS_WEB ? window.__mutaInstallEvent ?? null : null);
  const [installed, setInstalled] = useState<boolean>(detectStandalone());

  useEffect(() => {
    if (!IS_WEB) return;
    const onAvail = () => setEvent(window.__mutaInstallEvent ?? null);
    const onInstalled = () => {
      setInstalled(true);
      setEvent(null);
    };
    window.addEventListener('muta-install-available', onAvail);
    window.addEventListener('muta-installed', onInstalled);
    onAvail();
    return () => {
      window.removeEventListener('muta-install-available', onAvail);
      window.removeEventListener('muta-installed', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const ev = event ?? (IS_WEB ? window.__mutaInstallEvent ?? null : null);
    if (!ev) return 'unavailable' as const;
    try {
      await ev.prompt();
      const choice = await ev.userChoice;
      window.__mutaInstallEvent = null;
      setEvent(null);
      return choice.outcome;
    } catch {
      return 'unavailable' as const;
    }
  }, [event]);

  return {
    show: IS_WEB && !installed,
    canPrompt: !!event,
    isIOS: detectIOS(),
    installed,
    promptInstall,
  };
}
