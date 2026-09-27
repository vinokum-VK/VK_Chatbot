import { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, Attachment, Persona, AppSettings } from './types/chat';
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  loadSettings,
  saveSettings,
  loadTheme,
  saveTheme,
} from './utils/storage';
import { PERSONAS } from './utils/constants';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { ChatSettingsModal } from './components/ChatSettingsModal';
import { DesktopInstallModal } from './components/DesktopInstallModal';
import { MBBSQuiz } from './components/MBBSQuiz';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  Menu,
  Download,
  Sparkles,
  RotateCcw,
  Sliders,
  Monitor,
  GraduationCap,
} from 'lucide-react';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveConversationId());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadTheme());
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Sync quiz URL routing on load and on browser back/forward
  useEffect(() => {
    const checkQuizRoute = () => {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (
        p.startsWith('/quiz') ||
        p.startsWith('/mbbs') ||
        s.includes('quiz') ||
        h.includes('quiz')
      ) {
        setIsQuizOpen(true);
      } else {
        setIsQuizOpen(false);
      }
    };

    checkQuizRoute();
    window.addEventListener('popstate', checkQuizRoute);
    return () => window.removeEventListener('popstate', checkQuizRoute);
  }, []);

  const handleOpenQuiz = () => {
    setIsQuizOpen(true);
    try {
      const url = new URL(window.location.href);
      if (!url.pathname.includes('/quiz')) {
        url.pathname = '/quiz';
        window.history.pushState({ quiz: true }, '', url.toString());
      }
    } catch {
      // ignore
    }
  };

  const handleCloseQuiz = () => {
    setIsQuizOpen(false);
    try {
      const url = new URL(window.location.href);
      if (url.pathname.includes('/quiz') || url.search.includes('quiz')) {
        url.pathname = '/';
        url.search = '';
        window.history.pushState({}, '', url.toString());
      }
    } catch {
      // ignore
    }
  };

  const {
    isInstallable,
    isInstalled,
    install,
    downloadWindowsShortcut,
  } = usePWAInstall();

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync theme class to html/document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Persist conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  // Find active conversation
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Determine active persona
  const activePersona: Persona =
    PERSONAS.find((p) => p.id === (activeConversation?.personaId || 'echo-general')) ||
    PERSONAS[0];

  // Speech hooks
  const { speak, stop: stopSpeaking, isSpeaking, currentSpeakingId } = useSpeechSynthesis();

  const handleTranscript = useCallback((text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  const { isListening, isSupported: isSpeechSupported, toggleListening } = useSpeechRecognition({
    onTranscriptChange: handleTranscript,
  });

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isStreaming]);

  // Create new chat
  const handleNewChat = (personaId?: string) => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      personaId: personaId || activePersona.id,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    stopSpeaking();
  };

  // Switch or set persona
  const handleSelectPersona = (persona: Persona) => {
    if (!activeConversation) {
      handleNewChat(persona.id);
      return;
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, personaId: persona.id } : c))
    );
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Export single conversation as Markdown
  const handleExportConversation = (conv: Conversation) => {
    let md = `# ${conv.title}\n\n`;
    md += `*Exported from Echo AI on ${new Date().toLocaleString()}*\n\n---\n\n`;

    conv.messages.forEach((msg) => {
      const roleLabel = msg.role === 'user' ? '### 👤 User' : '### ✨ Echo AI';
      md += `${roleLabel} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n`;
      if (msg.attachments && msg.attachments.length > 0) {
        md += `*Attached ${msg.attachments.length} image(s)*\n\n`;
      }
      md += `${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Clear all conversations
  const handleClearAll = () => {
    setConversations([]);
    setActiveId(null);
    stopSpeaking();
  };

  // Send message
  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    if (isStreaming) return;

    let targetConv = activeConversation;
    let isBrandNew = false;

    // If no active conversation, create one immediately
    if (!targetConv) {
      isBrandNew = true;
      const initialTitle = text.slice(0, 36) || 'New Image Query';
      targetConv = {
        id: crypto.randomUUID(),
        title: initialTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        personaId: activePersona.id,
        messages: [],
      };
      setConversations((prev) => [targetConv!, ...prev]);
      setActiveId(targetConv.id);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const assistantPlaceholderId = crypto.randomUUID();
    const assistantPlaceholder: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedMessages = [...targetConv.messages, userMessage, assistantPlaceholder];

    // Auto title if first message
    const newTitle =
      targetConv.messages.length === 0 && !isBrandNew
        ? text.slice(0, 36) || 'Chat'
        : targetConv.title;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConv!.id
          ? {
              ...c,
              title: newTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : c
      )
    );

    // Call server streaming API
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      // Build messages payload for server
      const messagesPayload = updatedMessages
        .filter((m) => m.id !== assistantPlaceholderId && !m.error)
        .map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments?.map((a) => ({
            mimeType: a.mimeType,
            data: a.data,
          })),
        }));

      const finalSystemInstruction =
        settings.customSystemPrompt?.trim() || activePersona.systemPrompt;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: messagesPayload,
          systemInstruction: finalSystemInstruction,
          temperature: settings.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.text) {
              accumulatedText += data.text;
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== targetConv!.id) return c;
                  return {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantPlaceholderId
                        ? { ...m, content: accumulatedText }
                        : m
                    ),
                  };
                })
              );
            }

            if (data.done) {
              // Completed stream
              break;
            }
          } catch (err: any) {
            if (err?.message && !err.message.includes('JSON')) {
              throw err;
            }
          }
        }
      }

      // Finish streaming successfully
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetConv!.id) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantPlaceholderId ? { ...m, isStreaming: false } : m
            ),
          };
        })
      );

      // Auto-speak if enabled
      if (settings.autoSpeak && accumulatedText) {
        speak(accumulatedText, assistantPlaceholderId);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User clicked stop
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConv!.id) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId ? { ...m, isStreaming: false } : m
              ),
            };
          })
        );
      } else {
        console.error('Chat error:', err);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConv!.id) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      isStreaming: false,
                      error:
                        err?.message ||
                        'Failed to receive complete response. Please check connection and retry.',
                    }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop active generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  // Retry / Regenerate last message
  const handleRegenerate = () => {
    if (!activeConversation || isStreaming) return;
    const msgs = activeConversation.messages;
    if (msgs.length < 2) return;

    // Find last user message
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const userMsg = msgs[lastUserIndex];
    // Remove messages after that user message
    const trimmedMessages = msgs.slice(0, lastUserIndex);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: trimmedMessages } : c
      )
    );

    // Resend
    handleSendMessage(userMsg.content, userMsg.attachments || []);
  };

  // Edit user message and resubmit
  const handleEditSubmit = (messageId: string, newContent: string) => {
    if (!activeConversation || isStreaming) return;
    const msgs = activeConversation.messages;
    const targetIndex = msgs.findIndex((m) => m.id === messageId);
    if (targetIndex === -1) return;

    const originalAttachments = msgs[targetIndex].attachments;
    // Trim conversation up to this message
    const trimmed = msgs.slice(0, targetIndex);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: trimmed } : c
      )
    );

    handleSendMessage(newContent, originalAttachments || []);
  };

  const currentMessages = activeConversation?.messages || [];

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => {
          setActiveId(id);
          stopSpeaking();
        }}
        onNewChat={() => handleNewChat()}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onExportConversation={handleExportConversation}
        activePersona={activePersona}
        onSelectPersona={handleSelectPersona}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstallDesktop={() => setIsDesktopModalOpen(true)}
        onOpenQuiz={handleOpenQuiz}
        isInstalled={isInstalled}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full lg:ml-72 relative">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-stone-200/80 dark:border-stone-800/80 bg-white/70 dark:bg-stone-950/70 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 lg:hidden"
              title="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex items-center gap-2">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                {activeConversation ? activeConversation.title : 'Echo AI'}
              </h2>
              <span className="hidden sm:inline text-stone-300 dark:text-stone-700">|</span>
              <span className="hidden sm:inline text-xs text-stone-500 dark:text-stone-400">
                {activePersona.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* MBBS Quiz Button */}
            <button
              type="button"
              onClick={handleOpenQuiz}
              title="Start MBBS 100-Question Quiz"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 border border-emerald-500/30 transition-colors shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">MBBS Quiz</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1 py-0.2 rounded font-bold">
                100 Qs
              </span>
            </button>

            {/* Add to Windows Desktop Button */}
            <button
              type="button"
              onClick={() => setIsDesktopModalOpen(true)}
              title="Add Chatbot Icon to Windows Desktop"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30 transition-colors shadow-2xs"
            >
              <Monitor className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Add to Desktop</span>
            </button>

            {activeConversation && activeConversation.messages.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => handleExportConversation(activeConversation)}
                  title="Export conversation as Markdown"
                  className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNewChat()}
                  title="New conversation"
                  className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              title="Model & System Settings"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {currentMessages.length === 0 ? (
            <EmptyState
              activePersona={activePersona}
              onSelectPrompt={(prompt) => {
                handleSendMessage(prompt);
              }}
              onOpenInstallDesktop={() => setIsDesktopModalOpen(true)}
              onOpenQuiz={handleOpenQuiz}
            />
          ) : (
            <div className="pb-8">
              {currentMessages.map((msg, index) => {
                const isLastAssistant =
                  msg.role === 'assistant' &&
                  index === currentMessages.length - 1;

                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isSpeaking={isSpeaking && currentSpeakingId === msg.id}
                    onSpeak={speak}
                    onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                    onEditSubmit={
                      msg.role === 'user'
                        ? (newText) => handleEditSubmit(msg.id, newText)
                        : undefined
                    }
                    isLastAssistantMessage={isLastAssistant}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="shrink-0 bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent dark:from-stone-950 dark:via-stone-950/95 dark:to-transparent pt-3 z-10">
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={(text, attachments) => handleSendMessage(text, attachments)}
            onStop={handleStopGeneration}
            isStreaming={isStreaming}
            activePersona={activePersona}
            onSelectPersona={handleSelectPersona}
            isListening={isListening}
            toggleListening={toggleListening}
            isSpeechSupported={isSpeechSupported}
            sendOnEnter={settings.sendOnEnter}
          />
        </div>
      </div>

      {/* Settings Modal */}
      <ChatSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        onClearAllConversations={handleClearAll}
        conversations={conversations}
      />

      {/* Windows Desktop Icon & Install Modal */}
      <DesktopInstallModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstall={install}
        onDownloadShortcut={downloadWindowsShortcut}
      />

      {/* MBBS 100-Question Quiz Modal */}
      <MBBSQuiz
        isOpen={isQuizOpen}
        onClose={handleCloseQuiz}
      />
    </div>
  );
}
