import React from 'react';
import { STARTER_PROMPTS } from '../utils/constants';
import { Terminal, Cpu, Mail, Layers, Sparkles, Zap, ShieldCheck, Monitor, GraduationCap } from 'lucide-react';
import { Persona } from '../types/chat';

interface EmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
  activePersona: Persona;
  onOpenPersonaSelector?: () => void;
  onOpenInstallDesktop?: () => void;
  onOpenQuiz?: () => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Terminal: <Terminal className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
  Cpu: <Cpu className="w-4 h-4 text-sky-500 dark:text-sky-400" />,
  Mail: <Mail className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
  Layers: <Layers className="w-4 h-4 text-violet-500 dark:text-violet-400" />,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  activePersona,
  onOpenInstallDesktop,
  onOpenQuiz,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-3xl mx-auto px-4 py-8 text-center animate-in fade-in duration-300">
      {/* Brand Icon & Heading */}
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-inner">
          <Sparkles className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
        What would you like to explore today?
      </h1>

      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 max-w-md">
        Echo is your free, intelligent AI workspace powered by Google Gemini. Fast responses, code generation, multimodal vision, and deep reasoning.
      </p>

      {/* Unboxed Feature Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" /> Real-time Streaming
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Free & Private
        </span>
        <span aria-hidden="true">·</span>
        {onOpenQuiz && (
          <>
            <button
              type="button"
              onClick={onOpenQuiz}
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold transition-colors"
            >
              <GraduationCap className="w-4 h-4" /> MBBS Quiz (100 Qs)
            </button>
            <span aria-hidden="true">·</span>
          </>
        )}
        {onOpenInstallDesktop && (
          <>
            <button
              type="button"
              onClick={onOpenInstallDesktop}
              className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors"
            >
              <Monitor className="w-3.5 h-3.5" /> Add to Windows Desktop
            </button>
            <span aria-hidden="true">·</span>
          </>
        )}
        <span className="text-stone-600 dark:text-stone-300">Mode: {activePersona.name}</span>
      </div>

      {/* Starter Prompts Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left">
        {STARTER_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col p-4 rounded-xl border border-stone-200 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/60 hover:border-amber-500/50 hover:bg-stone-50 dark:hover:bg-stone-900/90 hover:shadow-md transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-[11px] font-medium tracking-wide uppercase text-stone-400 dark:text-stone-500">
                {item.category}
              </span>
              <div className="p-1 rounded-md bg-stone-100 dark:bg-stone-800 group-hover:bg-amber-500/10 dark:group-hover:bg-amber-500/20 transition-colors">
                {ICONS_MAP[item.icon] || <Sparkles className="w-4 h-4 text-amber-500" />}
              </div>
            </div>
            <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {item.title}
            </h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
