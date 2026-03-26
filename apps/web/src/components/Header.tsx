import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, RefreshIcon } from './Icons';
import { useLocale } from '../i18n';

interface HeaderProps {
  lastFetched: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
  isFetching: boolean;
}

export function Header({ lastFetched, onRefresh, isLoading, isFetching }: HeaderProps) {
  const { lang, t, toggleLang } = useLocale();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
    } catch { /* corrupted localStorage */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch { /* quota exceeded */ }
  }, [isDark]);

  return (
    <header className="flex items-end justify-between mb-14 animate-fade-up">
      <div>
        <p className="text-[10px] ne-text-boost font-medium uppercase tracking-[0.25em] text-gold-500 dark:text-gold-400 mb-3 font-body">
          {t.liveRates}
        </p>
        <h1 className="font-display text-4xl sm:text-3xl md:text-4xl font-bold text-ink dark:text-white leading-[0.95] sm:leading-none tracking-tight">
          {lang === 'ne' ? (
            <span className="text-gold-shimmer">{t.nepalBullion}</span>
          ) : (
            <>Nepal<br className="sm:hidden" /> <span className="text-gold-shimmer">Bullion</span></>
          )}
        </h1>
        {lastFetched ? (
          <p className="text-[13px] text-ink-faint dark:text-ink-faint mt-3 font-light">
            {t.updated} {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-full bg-ink dark:bg-white text-white dark:text-ink hover:bg-ink-light dark:hover:bg-paper-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink disabled:opacity-40 cursor-pointer transition-all duration-300"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? t.updating : t.refresh}
        </button>
        <button
          onClick={toggleLang}
          className="px-3 py-2.5 rounded-full border border-ink/8 dark:border-white/8 text-[13px] font-medium text-ink-muted dark:text-ink-faint hover:bg-ink/5 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 cursor-pointer transition-all duration-300"
          aria-label={`Switch to ${lang === 'en' ? 'Nepali' : 'English'}`}
        >
          {lang === 'en' ? 'NP' : 'EN'}
        </button>
        <button
          onClick={() => setIsDark(prev => !prev)}
          className="p-2.5 rounded-full border border-ink/8 dark:border-white/8 text-ink-muted dark:text-ink-faint hover:bg-ink/5 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 cursor-pointer transition-all duration-300"
          aria-label="Toggle dark mode"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
