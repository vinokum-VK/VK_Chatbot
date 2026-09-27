import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already running as installed desktop or mobile app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect Windows OS
    const ua = window.navigator.userAgent.toLowerCase();
    const isWin = ua.includes('win');
    setIsWindows(isWin);

    // Detect iOS
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Install prompt error:', err);
      return false;
    }
  }, [deferredPrompt]);

  // Generate and download a standard Windows Desktop Shortcut (.url file)
  const downloadWindowsShortcut = useCallback(() => {
    const currentUrl = window.location.origin + window.location.pathname;
    const iconUrl = `${window.location.origin}/pwa-192x192.png`;

    const shortcutContent = [
      '[{000214A0-0000-0000-C000-000000000046}]',
      'Prop3=19,0',
      '[InternetShortcut]',
      'IDList=',
      `URL=${currentUrl}`,
      `IconFile=${iconUrl}`,
      'IconIndex=0',
      'HotKey=0',
      '',
    ].join('\r\n');

    const blob = new Blob([shortcutContent], { type: 'application/internet-shortcut' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'Echo AI Chatbot.url';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isWindows,
    isIOS,
    install,
    downloadWindowsShortcut,
  };
}
