import React, { useState } from 'react';
import { AppSettings, Conversation } from '../types/chat';
import { X, Sliders, Trash2, Download, Check } from 'lucide-react';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClearAllConversations: () => void;
  conversations: Conversation[];
}

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllConversations,
  conversations,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [confirmClear, setConfirmClear] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleExportAll = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `echo_ai_chat_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Chat & Model Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 text-xs text-stone-700 dark:text-stone-300">
          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-stone-900 dark:text-stone-100">
                Creativity & Temperature: {localSettings.temperature}
              </label>
              <span className="text-[11px] text-stone-400">
                {localSettings.temperature <= 0.3
                  ? 'Precise & Deterministic'
                  : localSettings.temperature <= 0.8
                  ? 'Balanced & Standard'
                  : 'Creative & Adventurous'}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.1"
              value={localSettings.temperature}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>0.0 (Precise)</span>
              <span>0.7 (Standard)</span>
              <span>1.5 (Creative)</span>
            </div>
          </div>

          {/* Custom System Instruction */}
          <div>
            <label className="block font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
              Custom System Instructions (Optional)
            </label>
            <textarea
              value={localSettings.customSystemPrompt}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  customSystemPrompt: e.target.value,
                })
              }
              placeholder="e.g. You are a senior Python architect. Always provide type annotations and docstrings..."
              rows={3}
              className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 text-xs"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Override the baseline persona prompt with your own custom rules and instructions.
            </p>
          </div>

          {/* Preferences checkboxes */}
          <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.sendOnEnter}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    sendOnEnter: e.target.checked,
                  })
                }
                className="rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <div>
                <span className="font-semibold block text-stone-900 dark:text-stone-100">
                  Send message with Enter key
                </span>
                <span className="text-[11px] text-stone-400">
                  When enabled, Shift+Enter adds a newline; Enter sends directly.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoSpeak}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    autoSpeak: e.target.checked,
                  })
                }
                className="rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <div>
                <span className="font-semibold block text-stone-900 dark:text-stone-100">
                  Auto-speak responses
                </span>
                <span className="text-[11px] text-stone-400">
                  Automatically read newly generated responses out loud.
                </span>
              </div>
            </label>
          </div>

          {/* Data management: Export & Clear */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold block text-stone-900 dark:text-stone-100">
                  Export All Conversations
                </span>
                <span className="text-[11px] text-stone-400">
                  Download your full chat history as a JSON archive.
                </span>
              </div>
              <button
                type="button"
                onClick={handleExportAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-semibold block text-rose-600 dark:text-rose-400">
                  Clear All History
                </span>
                <span className="text-[11px] text-stone-400">
                  Permanently delete all stored chats from this browser.
                </span>
              </div>
              {confirmClear ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllConversations();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-rose-600 text-white font-medium hover:bg-rose-700"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 rounded border border-stone-200 dark:border-stone-700 text-stone-400 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
