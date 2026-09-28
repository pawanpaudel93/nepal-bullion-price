import { memo, useState } from 'react';
import { Sparkline } from './Sparkline';
import { generateNarratives, formatNarrative } from '../utils/narrative';
import { useLocale } from '../i18n';

interface TrendSectionProps {
  history: { date: string; price: number }[];
  color: 'gold' | 'silver';
}

const RANGES = [7, 30] as const;
type Range = typeof RANGES[number];

/** Pick label positions: first, last, and evenly spaced ones in between. */
function sparseLabels(dates: string[], format: (d: string) => string, count: number): string[] {
  const n = dates.length;
  if (n <= count) return dates.map(format);
  const keep = new Set(Array.from({ length: count }, (_, i) => Math.round((i * (n - 1)) / (count - 1))));
  return dates.map((d, i) => (keep.has(i) ? format(d) : ''));
}

export const TrendSection = memo(function TrendSection({ history, color }: TrendSectionProps) {
  const { t, numberLocale, localizeNum, formatDate } = useLocale();
  const [range, setRange] = useState<Range>(7);

  if (history.length < 2) return null;

  const hasLongRange = history.length > 7;
  const visible = history.slice(-(hasLongRange ? range : 7));
  const prices = visible.map(h => h.price);
  const fmtRs = (p: number) => `Rs ${localizeNum(p.toLocaleString(numberLocale))}`;

  // Narratives describe the recent week regardless of the selected range
  const narrativeText = generateNarratives(history.slice(-7))
    .map(n => formatNarrative(n, t as Record<string, string>, localizeNum))
    .join(' · ');

  const first = prices[0];
  const last = prices[prices.length - 1];
  const change = last - first;
  const pct = first ? (change / first) * 100 : 0;
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const days = visible.length;

  const labels = sparseLabels(visible.map(h => h.date), formatDate, 4);
  const tooltips = visible.map((h, i) => `${formatDate(h.date)} · ${fmtRs(prices[i])}`);

  const isGold = color === 'gold';
  const bgColor = isGold ? 'bg-gold-400/5 border-gold-400/10' : 'bg-silver-400/5 border-silver-400/15';
  const labelColor = isGold ? 'text-gold-700 dark:text-gold-200' : 'text-silver-500 dark:text-silver-300';
  const activePill = isGold
    ? 'bg-gold-500 text-white dark:bg-gold-400 dark:text-ink'
    : 'bg-silver-500 text-white dark:bg-silver-300 dark:text-ink';
  const changeColor = change > 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : change < 0 ? 'text-red-500 dark:text-red-400' : 'text-ink-muted dark:text-ink-faint';
  const changeStr = `${change > 0 ? '+' : change < 0 ? '−' : ''}${fmtRs(Math.abs(change))} (${change > 0 ? '+' : ''}${localizeNum(pct.toFixed(1))}%)`;

  return (
    <div className={`mt-4 mb-2 px-4 pt-3 pb-2 rounded-xl border ${bgColor}`} role="region" aria-label={t.trend}>
      <div className="flex justify-between items-center gap-3 mb-1.5">
        <span className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${labelColor}`}>
          {t.trend}
        </span>
        {hasLongRange ? (
          <div className="flex rounded-full bg-ink/5 dark:bg-white/5 p-0.5" role="group" aria-label={t.trend}>
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`px-2.5 py-1 min-w-9 rounded-full text-[11px] font-semibold cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                  range === r ? activePill : 'text-ink-muted dark:text-ink-faint hover:text-ink dark:hover:text-white'
                }`}
              >
                {r === 7 ? t.range7 : t.range30}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className={`text-[12px] font-mono ${changeColor}`}>
        {t.trendChange.replace('{change}', changeStr).replace('{date}', formatDate(visible[0].date))}
      </p>

      <Sparkline data={prices} color={color} labels={labels} formattedPrices={tooltips} />

      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 mt-2 text-[11px] text-ink-muted dark:text-ink-faint">
        <span>
          {t.rangeHigh} <span className="font-mono text-ink dark:text-white/90">{fmtRs(high)}</span>
          <span className="mx-2 opacity-40">·</span>
          {t.rangeLow} <span className="font-mono text-ink dark:text-white/90">{fmtRs(low)}</span>
        </span>
        {narrativeText ? <span className={labelColor}>{narrativeText}</span> : null}
      </div>
    </div>
  );
});
