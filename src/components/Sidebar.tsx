import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Conversation, Message, Persona } from '../types/chat';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Sun,
  Moon,
  Sparkles,
  Download,
  Image as ImageIcon,
  SlidersHorizontal,
  CornerDownLeft,
  Monitor,
  GraduationCap,
} from 'lucide-react';
import { PERSONAS } from '../utils/constants';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onExportConversation: (conv: Conversation) => void;
  activePersona: Persona;
  onSelectPersona: (p: Persona) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenInstallDesktop: () => void;
  onOpenQuiz?: () => void;
  isInstalled?: boolean;
  isOpen: boolean;
  onCloseMobile: () => void;
}

type SearchScope = 'all' | 'titles' | 'messages' | 'images';

// Helper to find relevant excerpt containing match keywords
function getMatchSnippet(messages: Message[], query: string): { text: string; role: string; count: number } | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return null;

  let totalMatches = 0;
  let firstSnippet: { text: string; role: string } | null = null;

  for (const m of messages) {
    const content = m.content || '';
    const lower = content.toLowerCase();
    
    // Count matches in this message
    for (const term of terms) {
      let idx = lower.indexOf(term);
      while (idx !== -1) {
        totalMatches++;
        idx = lower.indexOf(term, idx + term.length);
      }
    }

    if (!firstSnippet) {
      let firstIndex = -1;
      let matchedTermLen = 0;
      for (const t of terms) {
        const idx = lower.indexOf(t);
        if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
          firstIndex = idx;
          matchedTermLen = t.length;
        }
      }

      if (firstIndex !== -1) {
        const start = Math.max(0, firstIndex - 30);
        const end = Math.min(content.length, firstIndex + matchedTermLen + 45);
        let excerpt = content.slice(start, end).replace(/\n+/g, ' ');
        if (start > 0) excerpt = '…' + excerpt;
        if (end < content.length) excerpt = excerpt + '…';
        firstSnippet = { text: excerpt, role: m.role };
      }
    }
  }

  if (firstSnippet) {
    return { ...firstSnippet, count: totalMatches };
  }
  return null;
}

// Highlight keyword occurrences in text
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;

  try {
    const escapedTerms = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escapedTerms})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-amber-500/25 text-amber-950 dark:text-amber-200 font-semibold px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch (e) {
    return text;
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onExportConversation,
  activePersona,
  onSelectPersona,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenInstallDesktop,
  onOpenQuiz,
  isInstalled,
  isOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [showScopeFilters, setShowScopeFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect Mac vs Windows/Linux for keyboard shortcut badge
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const shortcutDisplay = isMac ? '⌘K' : 'Ctrl+K';

  // Desktop Global Shortcuts: Cmd+K / Ctrl+K and '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter conversations based on query and scope
  const filteredConversations = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed && searchScope === 'all') {
      return conversations;
    }

    const terms = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];

    return conversations.filter((c) => {
      // Check images filter
      if (searchScope === 'images') {
        const hasImages = c.messages.some((m) => m.attachments && m.attachments.length > 0);
        if (!hasImages) return false;
        if (terms.length === 0) return true;
      }

      const titleLower = c.title.toLowerCase();

      // Check titles scope
      if (searchScope === 'titles') {
        return terms.every((t) => titleLower.includes(t));
      }

      // Check messages scope
      if (searchScope === 'messages') {
        return terms.every((t) =>
          c.messages.some((m) => m.content.toLowerCase().includes(t))
        );
      }

      // 'all' scope: matches if all search terms appear in either title or any message
      if (terms.length === 0) return true;
      return terms.every(
        (t) =>
          titleLower.includes(t) ||
          c.messages.some((m) => m.content.toLowerCase().includes(t))
      );
    });
  }, [conversations, searchQuery, searchScope]);

  // Handle keyboard navigation inside search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (searchQuery) {
        setSearchQuery('');
      } else {
        searchInputRef.current?.blur();
      }
      setSelectedResultIndex(-1);
      return;
    }

    if (filteredConversations.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex((prev) =>
        prev < filteredConversations.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex((prev) =>
        prev > 0 ? prev - 1 : filteredConversations.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetIndex = selectedResultIndex >= 0 ? selectedResultIndex : 0;
      const targetConv = filteredConversations[targetIndex];
      if (targetConv) {
        onSelectConversation(targetConv.id);
        onCloseMobile();
      }
    }
  };

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  // Group by relative time
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * oneDay;

  const todayChats = filteredConversations.filter(
    (c) => now - c.updatedAt < oneDay
  );
  const weekChats = filteredConversations.filter(
    (c) => now - c.updatedAt >= oneDay && now - c.updatedAt < sevenDays
  );
  const olderChats = filteredConversations.filter(
    (c) => now - c.updatedAt >= sevenDays
  );

  const isSearchActive = searchQuery.trim().length > 0 || searchScope !== 'all';

  const renderConversationItem = (conv: Conversation, index: number) => {
    const isActive = conv.id === activeId;
    const isEditing = editingId === conv.id;
    const isKeyboardSelected = isSearchActive && index === selectedResultIndex;
    const matchSnippet = isSearchActive && searchQuery.trim() ? getMatchSnippet(conv.messages, searchQuery) : null;
    const hasAttachments = conv.messages.some((m) => m.attachments && m.attachments.length > 0);

    return (
      <div
        key={conv.id}
        onClick={() => {
          onSelectConversation(conv.id);
          onCloseMobile();
        }}
        className={`group relative flex flex-col p-2.5 rounded-xl text-xs cursor-pointer transition-all duration-150 border ${
          isKeyboardSelected
            ? 'border-amber-500 bg-amber-500/15 shadow-xs'
            : isActive
            ? 'bg-amber-500/10 text-amber-950 dark:text-amber-200 font-semibold border-amber-500/20'
            : 'border-transparent text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/60'
        }`}
      >
        {isEditing ? (
          <form
            onSubmit={(e) => handleSaveRename(conv.id, e)}
            className="flex items-center gap-1 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              autoFocus
              className="w-full px-2 py-0.5 text-xs bg-white dark:bg-stone-800 border border-amber-500 rounded focus:outline-none"
            />
            <button
              type="submit"
              className="p-1 text-emerald-500 hover:bg-stone-200 dark:hover:bg-stone-700 rounded"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="p-1 text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <>
            {/* Top row: icon + title + actions */}
            <div className="flex items-center justify-between gap-1.5 w-full">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MessageSquare
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-stone-400'
                  }`}
                />
                <span className="truncate text-stone-800 dark:text-stone-200 font-medium">
                  {isSearchActive ? highlightMatch(conv.title, searchQuery) : conv.title}
                </span>
                {hasAttachments && (
                  <span title="Contains image attachments" className="inline-flex">
                    <ImageIcon className="w-3 h-3 text-stone-400 shrink-0" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExportConversation(conv);
                  }}
                  title="Export thread"
                  className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleStartRename(conv, e)}
                  title="Rename"
                  className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  title="Delete"
                  className="p-1 rounded text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* If searching and snippet found in message body, display snippet with keyword highlighted */}
            {matchSnippet && (
              <div className="mt-1 pl-5 text-[11px] text-stone-500 dark:text-stone-400 leading-snug font-normal">
                <span className="text-[10px] uppercase font-semibold text-stone-400 dark:text-stone-500 mr-1">
                  {matchSnippet.role === 'user' ? 'You:' : 'AI:'}
                </span>
                <span>{highlightMatch(matchSnippet.text, searchQuery)}</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderGroup = (title: string, list: Conversation[]) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5 text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {title}
        </div>
        <div className="space-y-1">
          {list.map((conv, idx) => renderConversationItem(conv, idx))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-stone-100/90 dark:bg-stone-900/95 border-r border-stone-200/80 dark:border-stone-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                Echo AI
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Free Gemini Assistant
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 space-y-2">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            onClick={onOpenInstallDesktop}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/25 transition-colors font-medium shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Add to Windows Desktop</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-semibold">
              Icon
            </span>
          </button>

          {onOpenQuiz && (
            <button
              type="button"
              onClick={() => {
                onOpenQuiz();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 border border-emerald-500/25 transition-colors font-medium shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">MBBS QUIZ</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                100 Qs
              </span>
            </button>
          )}
        </div>

        {/* Local Search Input Area */}
        <div className="px-3 mb-2 space-y-1.5">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedResultIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-16 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-950/70 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedResultIndex(-1);
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search"
                  className="p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded shadow-2xs">
                  {shortcutDisplay}
                </kbd>
              )}

              <button
                type="button"
                onClick={() => setShowScopeFilters(!showScopeFilters)}
                title="Filter options"
                className={`p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors ${
                  showScopeFilters || searchScope !== 'all'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                    : ''
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Search Scope Filter Chips */}
          {showScopeFilters && (
            <div className="flex flex-wrap items-center gap-1 pt-1 pb-0.5 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => setSearchScope('all')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  searchScope === 'all'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300/60'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('titles')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  searchScope === 'titles'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300/60'
                }`}
              >
                Titles
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('messages')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  searchScope === 'messages'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300/60'
                }`}
              >
                Messages
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('images')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                  searchScope === 'images'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300/60'
                }`}
              >
                <ImageIcon className="w-2.5 h-2.5" />
                Images
              </button>
            </div>
          )}

          {/* Search Result Summary and Keyboard Hint */}
          {isSearchActive && (
            <div className="flex items-center justify-between px-1 text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
              <span>
                {filteredConversations.length === 0
                  ? 'No matches'
                  : `${filteredConversations.length} conversation${
                      filteredConversations.length === 1 ? '' : 's'
                    }`}
              </span>
              {filteredConversations.length > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-stone-400">
                  <span>Enter to select</span>
                  <CornerDownLeft className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Conversations List Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-400 dark:text-stone-500 space-y-2">
              <p>
                {searchQuery
                  ? `No conversations match "${searchQuery}"`
                  : 'No conversations found in selected filter'}
              </p>
              {isSearchActive && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchScope('all');
                    searchInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 text-[11px] rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                >
                  Clear search filters
                </button>
              )}
            </div>
          ) : isSearchActive ? (
            /* Flattened search results view */
            <div className="space-y-1.5">
              {filteredConversations.map((conv, idx) =>
                renderConversationItem(conv, idx)
              )}
            </div>
          ) : (
            /* Time-grouped standard view */
            <>
              {renderGroup('Today', todayChats)}
              {renderGroup('Previous 7 Days', weekChats)}
              {renderGroup('Older', olderChats)}
            </>
          )}
        </div>

        {/* Personas Quick Selector Bar */}
        <div className="p-3 border-t border-stone-200/70 dark:border-stone-800/70">
          <div className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
            AI Persona
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {PERSONAS.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPersona(p)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium text-left truncate transition-colors ${
                  activePersona.id === p.id
                    ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Footer controls: Theme, Settings */}
        <div className="p-3 border-t border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
            <span className="capitalize">{theme}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Chat settings & system prompt"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
