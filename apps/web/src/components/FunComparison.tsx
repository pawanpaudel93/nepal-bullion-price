import { useState, useEffect, useCallback } from 'react';
import { getComparisons } from '../utils/comparisons';
import { useLocale } from '../i18n';

interface FunComparisonProps {
  price: number;
  metal: 'gold' | 'silver';
}

export function FunComparison({ price, metal }: FunComparisonProps) {
  const { t, numberLocale, localizeNum } = useLocale();
  const comparisons = getComparisons(price, metal);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const advance = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIndex(prev => (prev + 1) % comparisons.length);
      setFading(false);
    }, 300);
  }, [comparisons.length]);

  useEffect(() => {
    if (comparisons.length <= 1) return;
    const timer = setInterval(advance, 8000);
    return () => clearInterval(timer);
  }, [advance, comparisons.length]);

  if (comparisons.length === 0) return null;

  const current = comparisons[index % comparisons.length];

  return (
    <button
      type="button"
      onClick={advance}
      className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-400/5 dark:bg-gold-400/8 text-[13px] text-ink-muted dark:text-ink-faint cursor-pointer hover:bg-gold-400/10 dark:hover:bg-gold-400/12 transition-colors duration-200"
      aria-live="polite"
    >
      <span
        className={`inline transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        <span>{current.emoji}</span>
        {' '}
        <span className="text-[11px] opacity-60">{t.thatsRoughly}</span>
        {' '}
        <strong className="font-medium text-ink dark:text-white">
          {localizeNum(current.count.toLocaleString(numberLocale))} {t[current.labelKey as keyof typeof t]}
        </strong>
      </span>
    </button>
  );
}
