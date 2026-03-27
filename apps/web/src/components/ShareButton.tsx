import { useCallback, useState } from 'react';
import { generateShareImage } from '../utils/shareCard';
import { generateNarratives } from '../utils/narrative';
import { useLocale } from '../i18n';

interface ShareButtonProps {
  metal: 'gold' | 'silver';
  metalName: string;
  price: number;
  previousPrice: number | null;
  history: { date: string; price: number }[] | null;
  date: string;
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path d="M5 10V15C5 15.55 5.45 16 6 16H14C14.55 16 15 15.55 15 15V10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 4V12" strokeLinecap="round" />
      <path d="M7 7L10 4L13 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShareButton({ metal, metalName, price, previousPrice, history, date }: ShareButtonProps) {
  const { t, numberLocale } = useLocale();
  const [sharing, setSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);

    try {
      const narratives = history && history.length >= 2 ? generateNarratives(history) : [];
      const narrativeText = narratives
        .map(n => {
          let text = (t as unknown as Record<string, string>)[n.key] ?? n.key;
          if (n.values) {
            for (const [k, v] of Object.entries(n.values)) {
              text = text.replace(`{${k}}`, String(v));
            }
          }
          return `${n.emoji} ${text}`;
        })
        .join(' · ');

      const blob = await generateShareImage({
        metal,
        metalName,
        price,
        previousPrice,
        history,
        narrativeText,
        numberLocale,
        date,
      });

      const file = new File([blob], `${metal}-price-${date}.png`, { type: 'image/png' });

      // Build share text
      const diff = previousPrice != null ? price - previousPrice : 0;
      const changeStr = diff !== 0
        ? `(${diff > 0 ? '▲' : '▼'} ${diff > 0 ? '+' : ''}${diff.toLocaleString(numberLocale)})`
        : '';
      const shareText = `${metalName}: Rs ${price.toLocaleString(numberLocale)}/tola ${changeStr} — Nepal Bullion Price\nbullion.pawanpaudel.com.np`;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // User cancelled share — ignore AbortError
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    } finally {
      setSharing(false);
    }
  }, [metal, metalName, price, previousPrice, history, date, t, numberLocale, sharing]);

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="inline-flex items-center gap-1 text-[11px] text-ink-muted dark:text-ink-faint hover:text-ink dark:hover:text-white transition-colors font-light"
      aria-label={t.share}
      title={t.share}
    >
      <ShareIcon className="w-3.5 h-3.5" />
      <span>{t.share}</span>
    </button>
  );
}
