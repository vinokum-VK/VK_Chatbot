import { marked } from 'marked';

// Configure marked renderer for clean output
const renderer = new marked.Renderer();

// Custom code block rendering with language badge and copy hook
renderer.code = function ({ text, lang }: { text: string; lang?: string }): string {
  const language = lang || 'text';
  const encodedCode = encodeURIComponent(text);
  
  return `
    <div class="code-block my-3 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-900 text-stone-100 text-xs">
      <div class="flex items-center justify-between px-3.5 py-1.5 bg-stone-950/80 border-b border-stone-800/80 font-mono text-[11px] text-stone-400 select-none">
        <span class="tracking-wide lowercase">${language}</span>
        <button 
          type="button" 
          onclick="window.__copyCodeBlock(this, decodeURIComponent('${encodedCode}'))"
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] hover:text-stone-200 hover:bg-stone-800 transition-colors"
          title="Copy code"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span>Copy</span>
        </button>
      </div>
      <div class="p-3.5 overflow-x-auto">
        <pre><code class="font-mono leading-relaxed text-stone-200">${escapeHtml(text)}</code></pre>
      </div>
    </div>
  `;
};

// Safe link rendering with new tab & rel
renderer.link = function ({ href, title, text }: { href: string; title?: string | null; text: string }): string {
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="text-amber-600 dark:text-amber-400 underline decoration-amber-500/30 hover:decoration-amber-500 font-medium transition-colors"${titleAttr}>${text}</a>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMarkdown(content: string): string {
  if (!content) return '';
  try {
    return marked.parse(content) as string;
  } catch (e) {
    console.error('Markdown parse error:', e);
    return escapeHtml(content);
  }
}

// Global copy helper for inline onclick in rendered HTML
if (typeof window !== 'undefined') {
  (window as any).__copyCodeBlock = (btn: HTMLElement, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      const span = btn.querySelector('span');
      if (span) {
        const originalText = span.textContent;
        span.textContent = 'Copied!';
        btn.classList.add('text-emerald-400');
        setTimeout(() => {
          span.textContent = originalText;
          btn.classList.remove('text-emerald-400');
        }, 2000);
      }
    });
  };
}
