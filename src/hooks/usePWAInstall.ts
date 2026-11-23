import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaSnapshot {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isInIframe: boolean;
  swRegistered: boolean;
  offlineReady: boolean;
  needRefresh: boolean;
}

const listeners = new Set<() => void>();
let initialized = false;
let updateSWFn: ((reloadPage?: boolean) => Promise<void>) | null = null;

const detectStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
};

const snapshot: PwaSnapshot = {
  deferredPrompt: null,
  isInstalled: false,
  isIOS: false,
  isAndroid: false,
  isInIframe: false,
  swRegistered: false,
  offlineReady: false,
  needRefresh: false
};

function emitChange() {
  listeners.forEach((cb) => cb());
}

export function initPwaManager() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const ua = window.navigator.userAgent.toLowerCase();
  snapshot.isInstalled = detectStandalone();
  snapshot.isIOS = /iphone|ipad|ipod/.test(ua);
  snapshot.isAndroid = /android/.test(ua);
  try {
    snapshot.isInIframe = window.self !== window.top;
  } catch {
    snapshot.isInIframe = true;
  }

  if ('serviceWorker' in navigator) {
    if (navigator.serviceWorker.controller) {
      snapshot.swRegistered = true;
      snapshot.offlineReady = true;
    }
    void navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        snapshot.swRegistered = true;
        if (reg.active) {
          snapshot.offlineReady = true;
        }
        emitChange();
      }
    });
  }

  const standaloneMq = window.matchMedia('(display-mode: standalone)');
  const onDisplayModeChange = () => {
    snapshot.isInstalled = detectStandalone();
    emitChange();
  };
  if (typeof standaloneMq.addEventListener === 'function') {
    standaloneMq.addEventListener('change', onDisplayModeChange);
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    snapshot.deferredPrompt = e as BeforeInstallPromptEvent;
    emitChange();
  });

  window.addEventListener('appinstalled', () => {
    snapshot.isInstalled = true;
    snapshot.deferredPrompt = null;
    emitChange();
  });

  updateSWFn = registerSW({
    immediate: true,
    onOfflineReady() {
      snapshot.swRegistered = true;
      snapshot.offlineReady = true;
      emitChange();
    },
    onNeedRefresh() {
      snapshot.needRefresh = true;
      emitChange();
      if (updateSWFn) {
        void updateSWFn(true);
      }
    },
    onRegisteredSW(_swUrl, registration) {
      snapshot.swRegistered = Boolean(registration);
      if (registration?.active) {
        snapshot.offlineReady = true;
      }
      emitChange();
    }
  });
}

// Initialize immediately on module load so early beforeinstallprompt events are never missed
initPwaManager();

export function usePWAInstall() {
  const [, setTick] = useState(0);

  useEffect(() => {
    initPwaManager();
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptEvent = snapshot.deferredPrompt;
    if (!promptEvent) return 'unavailable';
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      snapshot.isInstalled = true;
      snapshot.deferredPrompt = null;
      emitChange();
      return 'accepted';
    }
    return 'dismissed';
  };

  return {
    isInstallable: Boolean(snapshot.deferredPrompt),
    isInstalled: snapshot.isInstalled,
    isIOS: snapshot.isIOS,
    isAndroid: snapshot.isAndroid,
    isInIframe: snapshot.isInIframe,
    swRegistered: snapshot.swRegistered,
    offlineReady: snapshot.offlineReady,
    needRefresh: snapshot.needRefresh,
    install
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return isOnline;
}
