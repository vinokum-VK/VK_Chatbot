import React, { useRef, useEffect, useState, DragEvent } from 'react';
import { Attachment, Persona } from '../types/chat';
import {
  Send,
  Square,
  Paperclip,
  Mic,
  MicOff,
  X,
  Sparkles,
  ChevronUp,
} from 'lucide-react';
import { PERSONAS } from '../utils/constants';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  activePersona: Persona;
  onSelectPersona: (persona: Persona) => void;
  isListening: boolean;
  toggleListening: () => void;
  isSpeechSupported: boolean;
  sendOnEnter?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  activePersona,
  onSelectPersona,
  isListening,
  toggleListening,
  isSpeechSupported,
  sendOnEnter = true,
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        220
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && sendOnEnter) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isStreaming) return;
    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;

    onSend(trimmed, attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fullDataUrl = e.target?.result as string;
      const base64Data = fullDataUrl.split(',')[1];

      const newAttachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type,
        data: base64Data,
        previewUrl: fullDataUrl,
        sizeBytes: file.size,
      };

      setAttachments((prev) => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      processFile(files[i]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        processFile(e.dataTransfer.files[i]);
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Persona Quick Selector Bar */}
      <div className="relative flex items-center justify-between mb-2 px-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 py-1 px-2 rounded-md hover:bg-stone-200/50 dark:hover:bg-stone-800/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Mode:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {activePersona.name}
            </span>
            <ChevronUp
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showPersonaMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Persona Dropdown Menu */}
          {showPersonaMenu && (
            <div
              className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setShowPersonaMenu(false)}
            >
              <div className="px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Select AI Persona
              </div>
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPersona(p)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                    activePersona.id === p.id
                      ? 'bg-amber-500/10 text-amber-900 dark:text-amber-200'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 line-clamp-1">
                    {p.tagline}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:inline">
          {sendOnEnter ? 'Shift+Enter for newline' : 'Press Enter to send'}
        </span>
      </div>

      {/* Main Input Box Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border transition-all duration-200 bg-white dark:bg-stone-900 shadow-sm ${
          isDraggingOver
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5'
            : 'border-stone-200 dark:border-stone-800 focus-within:border-amber-500/70 focus-within:ring-2 focus-within:ring-amber-500/20'
        }`}
      >
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 border-b border-stone-100 dark:border-stone-800/60">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group relative flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
              >
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="w-8 h-8 rounded object-cover"
                />
                <span className="max-w-[120px] truncate font-medium text-stone-700 dark:text-stone-300">
                  {att.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isStreaming
              ? 'Echo is responding...'
              : `Ask Echo anything or paste an image...`
          }
          disabled={isStreaming}
          rows={1}
          className="w-full pt-3.5 pb-2 px-4 bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none resize-none leading-relaxed min-h-[48px] max-h-[220px]"
        />

        {/* Footer controls: Attach file, Mic, Send/Stop */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-1">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image"
              disabled={isStreaming}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-40"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Dictation */}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Voice dictation'}
                disabled={isStreaming}
                className={`p-2 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                } disabled:opacity-40`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() && attachments.length === 0}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  input.trim() || attachments.length > 0
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
