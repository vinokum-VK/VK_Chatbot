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
  Copy,
  MousePointerClick,
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
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    onDownloadShortcut();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 5000);
  };

  const handleNativeInstall = async () => {
    setInstalling(true);
    await onInstall();
    setInstalling(false);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto"
    >
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200 dark:border-stone-800 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Add Chatbot to Windows Desktop
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Follow these simple steps to place the icon on your desktop
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs pr-1">
          {/* Chatbot Icon Preview Banner */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800/80">
            <div className="relative shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Echo Chatbot Icon"
                className="w-12 h-12 rounded-xl shadow-md border border-amber-500/30 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-600 text-white shadow-xs">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Echo AI Chatbot</span>
                {isInstalled && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Installed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Web browsers do not place files on Windows desktop automatically without user confirmation. Choose one of the 3 quick options below:
              </p>
            </div>
          </div>

          {/* Option 1: Chrome / Edge 2-Click Native Desktop Shortcut */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                Option 1: Chrome / Edge Browser Menu (Fastest)
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-semibold">
                Recommended
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-300 text-[11px] mb-2.5">
              Creates a genuine standalone Windows app icon directly on your Desktop & Taskbar:
            </p>

            <div className="space-y-1.5 bg-white/80 dark:bg-stone-900/90 p-3 rounded-lg border border-amber-500/20 text-stone-800 dark:text-stone-200 text-[11.5px] leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">Step 1:</span>
                <span>Click the <strong>three dots (⋮)</strong> at the top-right corner of your browser.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">Step 2:</span>
                <span>
                  Select <strong>Save and share</strong> &rarr; <strong>Create shortcut...</strong> (or in Edge: <strong>Apps</strong> &rarr; <strong>Install Echo AI</strong>).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">Step 3:</span>
                <span>
                  Check <strong>"Open as window"</strong> and click <strong>Create</strong>.
                </span>
              </div>
            </div>

            {isInstallable && (
              <button
                type="button"
                onClick={handleNativeInstall}
                disabled={installing}
                className="w-full mt-2.5 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs transition-colors"
              >
                <Monitor className="w-4 h-4" />
                <span>{installing ? 'Opening dialog...' : 'Trigger Browser Install Prompt'}</span>
              </button>
            )}
          </div>

          {/* Option 2: 1-Second Drag and Drop from Address Bar */}
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] flex items-center justify-center font-bold">
                  2
                </span>
                Option 2: Drag & Drop (Takes 2 Seconds)
              </span>
              <span className="text-[10px] text-stone-500 font-medium">Instant</span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] mb-2 leading-relaxed">
              Resize your browser window so you can see a small piece of your Windows Desktop behind it.
            </p>
            <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-[11.5px] text-stone-700 dark:text-stone-300 flex items-start gap-2">
              <MousePointerClick className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Click and hold the <strong>lock icon (🔒)</strong> or <strong>tune icon</strong> immediately to the left of the URL in your browser address bar, and <strong>drag it straight onto your Desktop</strong>.
              </span>
            </div>
          </div>

          {/* Option 3: Download .url shortcut file */}
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] flex items-center justify-center font-bold">
                  3
                </span>
                Option 3: Download Desktop Shortcut File (.url)
              </span>
              <span className="text-[10px] text-stone-500 font-medium">Downloads Folder</span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] mb-2.5">
              Click below to download the pre-configured Windows shortcut. Once downloaded, drag it from your Downloads folder to your Desktop:
            </p>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold transition-colors"
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Downloaded! Drag it from Downloads to Desktop
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-stone-500" />
                  <span>Download "Echo AI Chatbot.url"</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedUrl ? 'Copied URL!' : 'Copy App URL'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
