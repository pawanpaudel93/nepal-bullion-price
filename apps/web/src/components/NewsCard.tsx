import { useLocale } from '../i18n';
import type { NewsItem } from 'nepal-bullion-price';

function timeAgo(
  dateStr: string,
  labels: { justNow: string; minutesAgo: string; hoursAgo: string },
  localizeNum: (v: string | number) => string,
): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / 60_000);
  if (diffMin < 1) return labels.justNow;
  if (diffMin < 60) return labels.minutesAgo.replace('{n}', localizeNum(diffMin));
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return labels.hoursAgo.replace('{n}', localizeNum(diffHr));
  return new Date(dateStr).toLocaleDateString();
}

const CATEGORY_COLORS: Record<string, string> = {
  gold: 'bg-gold-100 text-gold-700 dark:bg-gold-700/20 dark:text-gold-400',
  silver: 'bg-silver-300/30 text-silver-500 dark:bg-silver-500/20 dark:text-silver-300',
  market: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
};

export function NewsCard({ item }: { item: NewsItem }) {
  const { t, localizeNum } = useLocale();

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block glass-card rounded-2xl p-5 cursor-pointer transition-shadow duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {/* Source + time */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-medium text-ink-muted dark:text-ink-faint tracking-wide">
              {item.source}
            </span>
            <span className="text-[11px] text-ink-faint">·</span>
            <span className="text-[11px] text-ink-faint">
              {timeAgo(item.publishedAt, t, localizeNum)}
            </span>
            {item.category && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] ?? ''}`}>
                {item.category === 'gold' ? t.gold : item.category === 'silver' ? t.silver : 'Market'}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-ink dark:text-white line-clamp-2 leading-snug">
            {item.title}
          </h3>

          {/* Summary */}
          {item.summary && (
            <p className="mt-1.5 text-[12px] text-ink-muted dark:text-ink-faint line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
          )}
        </div>

        {/* Thumbnail */}
        {item.imageUrl && (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-ink/5 dark:bg-white/5">
            <img
              src={item.imageUrl}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>
    </a>
  );
}
