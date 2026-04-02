import { useEffect } from 'react';
import type { MilestoneEvent } from '../hooks/useMilestones';
import { useLocale } from '../i18n';

interface MilestoneBannerProps {
  event: MilestoneEvent;
  onDismiss: () => void;
}

export function MilestoneBanner({ event, onDismiss }: MilestoneBannerProps) {
  const { t, numberLocale, localizeNum } = useLocale();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 30_000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const emoji = event.type === 'ath' ? '🏆' : '🎉';
  const metalName = event.metal === 'gold' ? t.gold : t.silver;

  const title = event.type === 'ath'
    ? t.milestoneATH
    : (t.milestoneCrossed as string)
        .replace('{metal}', metalName)
        .replace('{price}', localizeNum(event.threshold.toLocaleString(numberLocale)));

  const subtitle = (t.milestoneContext as string)
    .replace('{previous}', localizeNum(event.previous.toLocaleString(numberLocale)));

  const bgClass = event.metal === 'gold'
    ? 'from-gold-400/12 to-gold-400/4 border-gold-400/20'
    : 'from-silver-400/12 to-silver-400/4 border-silver-400/20';

  return (
    <div
      className={`mb-6 flex items-center gap-3 rounded-2xl border bg-gradient-to-r ${bgClass} p-4 animate-fade-up`}
      role="status"
      aria-live="polite"
    >
      <span className="text-3xl shrink-0">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-ink dark:text-white">{title}</p>
        <p className="text-xs text-ink-muted dark:text-ink-faint mt-0.5">{subtitle}</p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 text-ink-faint hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}
