import { Sparkline } from './Sparkline';
import { generateNarratives, formatNarrative } from '../utils/narrative';
import { useLocale } from '../i18n';

interface TrendSectionProps {
  history: { date: string; price: number }[];
  color: 'gold' | 'silver';
}

export function TrendSection({ history, color }: TrendSectionProps) {
  const { t, numberLocale } = useLocale();

  if (history.length < 2) return null;

  const narratives = generateNarratives(history);
  const prices = history.map(h => h.price);
  const dayLabels = history.map(h => h.date);
  const formattedPrices = prices.map(p => `Rs ${p.toLocaleString(numberLocale)}`);

  const narrativeText = narratives
    .map(n => formatNarrative(n, t as Record<string, string>))
    .join(' · ');

  const bgColor = color === 'gold'
    ? 'bg-gold-400/5 border-gold-400/10'
    : 'bg-silver-400/5 border-silver-400/10';

  const labelColor = color === 'gold'
    ? 'text-gold-700 dark:text-gold-200'
    : 'text-silver-500 dark:text-silver-300';

  return (
    <div className={`mt-4 mb-2 px-4 pt-3 pb-2 rounded-xl border ${bgColor}`} role="region" aria-label={t.weeklyTrend}>
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[10px] font-medium uppercase tracking-[0.15em] ${labelColor}`}>
          {t.weeklyTrend}
        </span>
        {narrativeText ? (
          <span className={`text-[10px] ${labelColor}`}>
            {narrativeText}
          </span>
        ) : null}
      </div>

      <Sparkline data={prices} color={color} labels={dayLabels} formattedPrices={formattedPrices} />
    </div>
  );
}
