import { useCallback, useState } from 'react';
import { generateShareImage } from '../utils/shareCard';
import { generateNarratives, formatNarrative } from '../utils/narrative';
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
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
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
        .map(n => formatNarrative(n, t as Record<string, string>))
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

      // Mobile: use native share sheet (WhatsApp, Facebook, etc.)
      if (isMobile() && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        // Desktop: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    } finally {
      setSharing(false);
    }
  }, [metal, metalName, price, previousPrice, history, date, t, numberLocale, sharing]);

  // Only show on mobile where native share sheet (WhatsApp, Facebook, etc.) works
  if (!isMobile()) return null;

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted dark:text-ink-faint hover:text-ink dark:hover:text-white transition-colors font-light cursor-pointer"
      aria-label={t.share}
      title={t.share}
    >
      <ShareIcon className="w-4 h-4" />
      <span>{t.share}</span>
    </button>
  );
}
