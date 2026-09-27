import React, { useState } from 'react';
import { Message } from '../types/chat';
import { renderMarkdown } from '../utils/markdown';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Edit2,
  X,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isSpeaking: boolean;
  onSpeak: (text: string, id: string) => void;
  onRegenerate?: () => void;
  onEditSubmit?: (newContent: string) => void;
  isLastAssistantMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isSpeaking,
  onSpeak,
  onRegenerate,
  onEditSubmit,
  isLastAssistantMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.content);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editedText.trim() && onEditSubmit) {
      onEditSubmit(editedText.trim());
      setIsEditing(false);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`group py-5 px-4 sm:px-6 transition-colors duration-150 ${
        isUser
          ? 'bg-transparent'
          : 'bg-stone-100/70 dark:bg-stone-900/40 border-y border-stone-200/50 dark:border-stone-800/40'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center text-xs font-semibold">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          {/* Header Metadata (Unboxed text with separators per skill) */}
          <div className="flex items-center gap-2 mb-1.5 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {isUser ? 'You' : 'Echo AI'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatTime(message.timestamp)}</span>
            {message.isStreaming && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 animate-pulse font-medium">
                  Generating...
                </span>
              </>
            )}
          </div>

          {/* Attached Images */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((att) => (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => setPreviewImage(att.previewUrl)}
                  className="group/img relative rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 max-w-[200px] max-h-[140px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="object-cover w-full h-full group-hover/img:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                    Expand
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Message Body or Edit Mode */}
          {isEditing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full p-3 text-sm rounded-lg border border-amber-500/60 dark:border-amber-500/60 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-sans resize-y"
                rows={Math.min(8, Math.max(2, editedText.split('\n').length))}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  Save & Resubmit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(message.content);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : message.error ? (
            <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <p className="font-medium text-xs">Response failed</p>
                <p className="mt-0.5 text-xs opacity-90">{message.error}</p>
                {onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-stone-800 dark:text-stone-200">
              {isUser ? (
                <div className="whitespace-pre-wrap leading-relaxed text-[0.9375rem]">
                  {message.content}
                </div>
              ) : (
                <div
                  className="prose-chat select-text"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(message.content),
                  }}
                />
              )}
              {message.isStreaming && !message.content && (
                <div className="flex items-center gap-1 py-1 text-stone-400 text-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-xs">Thinking...</span>
                </div>
              )}
            </div>
          )}

          {/* Action Toolbar */}
          {!isEditing && !message.isStreaming && (
            <div className="flex items-center gap-1 mt-2.5 pt-1 text-stone-400 dark:text-stone-500 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy message"
                className="p-1.5 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {!isUser && (
                <button
                  type="button"
                  onClick={() => onSpeak(message.content, message.id)}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                  className={`p-1.5 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors ${
                    isSpeaking
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {!isUser && isLastAssistantMessage && onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  title="Regenerate response"
                  className="p-1.5 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {isUser && onEditSubmit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Edit message"
                  className="p-1.5 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal Lightbox */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Attachment preview"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 p-1.5 rounded-full bg-stone-900 text-stone-200 border border-stone-700 hover:bg-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
