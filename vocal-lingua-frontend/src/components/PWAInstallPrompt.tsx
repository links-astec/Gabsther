'use client';

/**
 * PWAInstallPrompt.tsx
 * Shows an iOS "Add to Home Screen" instruction banner
 * and an Android/Chrome native install prompt.
 *
 * Usage: Drop <PWAInstallPrompt /> anywhere in your layout,
 * e.g. inside DashboardContent or the landing page.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, X, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed (running as standalone PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Don't show if user already dismissed it this session
    const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) return;

    // Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari) {
      // Delay slightly so it doesn't interrupt page load
      const timer = setTimeout(() => setShowIOSBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome — intercept the native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const timer = setTimeout(() => setShowAndroidPrompt(true), 3000);
      return () => clearTimeout(timer);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setShowIOSBanner(false);
    setShowAndroidPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', '1');
  };

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowAndroidPrompt(false);
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* ── iOS Banner ── */}
      <AnimatePresence>
        {showIOSBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8"
            style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.1] p-5 max-w-sm mx-auto">
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/[0.1] text-gray-500"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-3 mb-3">
                {/* App icon */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-xl">🎙️</span>
                </div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white">Install Gabsther</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add to your Home Screen</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">1</span>
                  </div>
                  <p>
                    Tap the{' '}
                    <Share size={13} className="inline text-blue-500 mb-0.5" />{' '}
                    <strong>Share</strong> button in Safari
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">2</span>
                  </div>
                  <p>
                    Scroll down and tap{' '}
                    <strong>
                      <Plus size={11} className="inline mb-0.5" /> Add to Home Screen
                    </strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">3</span>
                  </div>
                  <p>Tap <strong>Add</strong> — done! 🎉</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Android / Chrome Banner ── */}
      <AnimatePresence>
        {showAndroidPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.1] p-5 max-w-sm mx-auto flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white text-xl">🎙️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 dark:text-white text-sm">Install Gabsther</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add to your home screen for the best experience</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAndroidInstall}
                  className="px-4 py-2 bg-brand-blue text-white font-bold text-sm rounded-xl"
                >
                  Install
                </button>
                <button
                  onClick={dismiss}
                  className="px-4 py-1 text-gray-400 text-xs"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}