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
    <header className="flex items-center justify-between mb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary dark:text-white">
          Nepal Bullion Price
        </h1>
        {lastFetched && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Updated {lastFetched.toLocaleTimeString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-white hover:bg-secondary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 cursor-pointer transition-colors duration-200"
        >
          <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing' : 'Refresh'}
        </button>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 cursor-pointer transition-colors duration-200"
          aria-label="Toggle dark mode"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
