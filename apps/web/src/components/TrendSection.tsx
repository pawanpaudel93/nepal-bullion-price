import { Sparkline } from './Sparkline';
import { generateNarratives, type Narrative } from '../utils/narrative';
import { useLocale } from '../i18n';

interface TrendSectionProps {
  history: { date: string; price: number }[];
  color: 'gold' | 'silver';
}

function formatNarrative(
  narrative: Narrative,
  t: Record<string, string>,
): string {
  let text = t[narrative.key] ?? narrative.key;
  if (narrative.values) {
    for (const [k, v] of Object.entries(narrative.values)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return `${narrative.emoji} ${text}`;
}

function getDayLabels(history: { date: string }[]): string[] {
  return history.map(h => {
    const d = new Date(h.date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });
}

export function TrendSection({ history, color }: TrendSectionProps) {
  const { t } = useLocale();

  if (history.length < 2) return null;

  const narratives = generateNarratives(history);
  const prices = history.map(h => h.price);
  const dayLabels = getDayLabels(history);

  const narrativeText = narratives
    .map(n => formatNarrative(n, t as unknown as Record<string, string>))
    .join(' · ');

  const bgColor = color === 'gold'
    ? 'bg-gold-400/5 border-gold-400/10'
    : 'bg-silver-400/5 border-silver-400/10';

  const labelColor = color === 'gold'
    ? 'text-gold-700 dark:text-gold-200'
    : 'text-silver-500 dark:text-silver-300';

  return (
    <div className={`mt-4 mb-2 p-3 rounded-xl border ${bgColor}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[10px] font-medium uppercase tracking-[0.15em] ${labelColor}`}>
          {t.weeklyTrend}
        </span>
        {narrativeText ? (
          <span className={`text-[10px] ${labelColor}`}>
            {narrativeText}
          </span>
        ) : null}
      </div>

      <Sparkline data={prices} color={color} />

      <div className="flex justify-between mt-1.5">
        {dayLabels.map((label, i) => (
          <span key={i} className="text-[8px] text-ink-faint dark:text-ink-faint">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
