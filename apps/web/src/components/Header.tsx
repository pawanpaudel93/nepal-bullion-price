import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, RefreshIcon } from './Icons';

interface HeaderProps {
  lastFetched: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export function Header({ lastFetched, onRefresh, isLoading }: HeaderProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <header className="flex items-end justify-between mb-12">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500 dark:text-gold-400 mb-2">
          Live Rates
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink dark:text-white leading-none">
          Nepal Bullion
        </h1>
        {lastFetched && (
          <p className="text-sm text-ink-muted dark:text-ink-faint mt-2">
            Updated {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-ink dark:bg-white text-white dark:text-ink hover:bg-ink-light dark:hover:bg-paper-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink disabled:opacity-40 cursor-pointer transition-all duration-200"
        >
          <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading' : 'Refresh'}
        </button>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 rounded-xl border border-ink/10 dark:border-white/10 text-ink-muted dark:text-ink-faint hover:bg-ink/5 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 cursor-pointer transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
