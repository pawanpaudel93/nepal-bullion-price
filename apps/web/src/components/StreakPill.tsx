import { useState, useRef, useEffect } from 'react';
import { ALL_BADGES } from '../hooks/useStreak';
import { useLocale } from '../i18n';

interface StreakPillProps {
  streak: number;
  bestStreak: number;
  badges: string[];
  emoji: string;
}

export function StreakPill({ streak, bestStreak, badges, emoji }: StreakPillProps) {
  const { t, numberLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (streak === 0) return null;

  const streakText = (t.dayStreak as string).replace('{n}', streak.toLocaleString(numberLocale));
  const bestText = (t.bestStreak as string).replace('{n}', bestStreak.toLocaleString(numberLocale));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gold-400/10 dark:bg-gold-400/15 text-sm font-medium text-ink dark:text-white cursor-pointer hover:bg-gold-400/15 dark:hover:bg-gold-400/20 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
        aria-label={streakText}
        aria-expanded={open}
      >
        <span>{emoji}</span>
        <span className="font-mono text-[13px]">{streak}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={streakText}
          className="absolute right-0 top-full mt-2 w-64 glass-card rounded-2xl p-5 z-50 animate-fade-up"
        >
          <div className="text-center mb-4">
            <div className="text-4xl mb-1">{emoji}</div>
            <div className="font-bold text-lg text-ink dark:text-white">{streakText}</div>
            <div className="text-xs text-ink-faint">{bestText}</div>
          </div>

          <div className="border-t border-ink/6 dark:border-white/6 pt-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-faint mb-2">
              {t.badgesEarned}
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_BADGES.map(badge => {
                const earned = badges.includes(badge.id);
                const label = earned
                  ? (t[badge.labelKey as keyof typeof t] as string)
                  : t.badgeLocked;
                return (
                  <span
                    key={badge.id}
                    className={`text-2xl transition-opacity ${earned ? 'opacity-100' : 'opacity-20'}`}
                    title={label}
                    aria-label={label}
                  >
                    {badge.emoji}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
