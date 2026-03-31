import { useState, useMemo } from 'react';
import { useLocale } from '../i18n';
import { useNews } from '../hooks/useNews';
import { NewsCard } from './NewsCard';
import type { NewsItem } from 'nepal-bullion-price';

type CategoryFilter = 'all' | 'gold' | 'silver';
type LangFilter = 'all' | 'en' | 'np';

const PAGE_SIZE = 20;

export function NewsPage() {
  const { t } = useLocale();
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Pass server-side lang filter only when not "all"
  const serverLang = langFilter !== 'all' ? langFilter : undefined;
  const { data, isLoading, error } = useNews(serverLang, true);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    let items: NewsItem[] = data.items;
    if (categoryFilter !== 'all') {
      items = items.filter(item => item.category === categoryFilter);
    }
    return items;
  }, [data, categoryFilter]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  return (
    <div className="animate-fade-up">
      {/* Filter bar */}
      <div className="flex items-center gap-2.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {/* Language filters */}
        {(['all', 'en', 'np'] as const).map(f => (
          <button
            key={`lang-${f}`}
            onClick={() => { setLangFilter(f); setVisibleCount(PAGE_SIZE); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none ${
              langFilter === f
                ? 'bg-gold-500 text-white'
                : 'bg-ink/5 dark:bg-white/8 text-ink-muted dark:text-ink-faint hover:bg-ink/10 dark:hover:bg-white/12'
            }`}
          >
            {f === 'all' ? t.allLanguages : f === 'en' ? t.english : t.nepali}
          </button>
        ))}

        <div className="shrink-0 w-px h-4 bg-ink/10 dark:bg-white/10" />

        {/* Category filters */}
        {(['all', 'gold', 'silver'] as const).map(f => (
          <button
            key={`cat-${f}`}
            onClick={() => { setCategoryFilter(f); setVisibleCount(PAGE_SIZE); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none ${
              categoryFilter === f
                ? 'bg-gold-500 text-white'
                : 'bg-ink/5 dark:bg-white/8 text-ink-muted dark:text-ink-faint hover:bg-ink/10 dark:hover:bg-white/12'
            }`}
          >
            {f === 'all' ? t.allCategories : f === 'gold' ? t.gold : t.silver}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 gap-5">
          <div className="animate-spin rounded-full h-7 w-7 border-[1.5px] border-gold-200 dark:border-gold-700 border-t-gold-500" />
          <p className="text-[13px] text-ink-faint font-light tracking-wide">{t.fetchingPrices}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 glass-card rounded-2xl text-red-700 dark:text-red-400 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* News list */}
      {!isLoading && !error && (
        <div className="flex flex-col gap-3">
          {visibleItems.length === 0 ? (
            <div className="text-center py-16 text-ink-faint text-sm">
              {t.noNews}
            </div>
          ) : (
            <>
              {visibleItems.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
              {hasMore && (
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="mx-auto mt-2 px-6 py-2.5 rounded-full text-[12px] font-medium tracking-wide cursor-pointer bg-ink/5 dark:bg-white/8 text-ink-muted dark:text-ink-faint hover:bg-ink/10 dark:hover:bg-white/12 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
                >
                  {t.loadMore}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
