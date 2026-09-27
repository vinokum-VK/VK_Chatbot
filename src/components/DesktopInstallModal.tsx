import React, { useState } from 'react';
import {
  X,
  Monitor,
  Download,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DesktopInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstall: () => Promise<boolean>;
  onDownloadShortcut: () => void;
}

export const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  onInstall,
  onDownloadShortcut,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    onDownloadShortcut();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  const handleNativeInstall = async () => {
    setInstalling(true);
    await onInstall();
    setInstalling(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Add to Windows Desktop
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Launch Echo AI Chatbot directly from your desktop
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chatbot Icon Preview */}
        <div className="py-4 my-2 flex items-center gap-4 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800/80">
          <div className="relative shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="Echo Chatbot Icon"
              className="w-14 h-14 rounded-2xl shadow-md border border-amber-500/30 object-cover"
            />
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-600 text-white shadow-xs">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>Echo AI Chatbot</span>
              {isInstalled && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Installed
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Desktop shortcut with standalone window, quick search, and voice chat
            </p>
          </div>
        </div>

        {/* Option 1: Native Windows App Installation */}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                Option A: Native Desktop App (Recommended)
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                Chrome & Edge
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
              Installs Echo as a dedicated Windows application with an icon on your desktop and taskbar.
            </p>

            {isInstallable ? (
              <button
                type="button"
                onClick={handleNativeInstall}
                disabled={installing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs transition-colors"
              >
                <Monitor className="w-4 h-4" />
                <span>{installing ? 'Opening Install Prompt...' : 'Install App to Windows Desktop'}</span>
              </button>
            ) : isInstalled ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Echo is already installed on your system!</span>
              </div>
            ) : (
              <div className="space-y-2 bg-white/70 dark:bg-stone-900/80 p-2.5 rounded-lg border border-amber-500/20 text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                <div className="flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Look at your browser’s address bar (top right) and click the <strong>Install App icon (computer with arrow)</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Or click <strong>⋮ (Three dots)</strong> &rarr; <strong>Save and share</strong> / <strong>Apps</strong> &rarr; <strong>Install Echo AI</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Check <strong>"Desktop shortcut"</strong> in the dialog.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: 1-Click Desktop Shortcut File (.url) */}
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] flex items-center justify-center font-bold">
                  2
                </span>
                Option B: Download Windows Shortcut File
              </span>
              <span className="text-[11px] text-stone-500">1-Click File</span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
              Download an official Windows desktop shortcut file (<code className="bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded">.url</code>). Move it to your desktop and double-click to launch!
            </p>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold transition-colors"
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Downloaded "Echo AI Chatbot.url"!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-stone-500" />
                  <span>Download Windows Desktop Shortcut (.url)</span>
                </>
              )}
            </button>
            {downloaded && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 text-center">
                Check your Downloads folder and drag the file directly onto your Windows Desktop!
              </p>
            )}
          </div>

          {/* Quick Drag & Drop Browser Tip */}
          <div className="flex items-start gap-2 text-[11px] text-stone-500 dark:text-stone-400 px-1">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Quick Tip:</strong> You can also drag the padlock/tune icon to the left of the URL in your browser directly onto your Windows Desktop to make a shortcut instantly.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
