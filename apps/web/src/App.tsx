import { useMemo } from 'react';
import { useBullionPrices } from './hooks/useBullionPrices';
import { Header } from './components/Header';
import { PriceCard } from './components/PriceCard';
import { LastUpdated } from './components/LastUpdated';
import { GoldIcon, SilverIcon } from './components/Icons';

export default function App() {
  const { data, isLoading, isFetching, error, lastFetched, refresh } = useBullionPrices();

  const sources = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.gold.nepal ? [{ label: 'Nepal Gold', source: data.gold.nepal.source, updatedAt: data.gold.nepal.updatedAt, isStale: data.gold.nepal.isStale }] : []),
      ...(data.gold.live ? [{ label: 'Live Gold', source: data.gold.live.source, updatedAt: data.gold.live.updatedAt, isStale: data.gold.live.isStale }] : []),
      ...(data.silver.nepal ? [{ label: 'Nepal Silver', source: data.silver.nepal.source, updatedAt: data.silver.nepal.updatedAt, isStale: data.silver.nepal.isStale }] : []),
      ...(data.silver.live ? [{ label: 'Live Silver', source: data.silver.live.source, updatedAt: data.silver.live.updatedAt, isStale: data.silver.live.isStale }] : []),
    ];
  }, [data]);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink bg-mesh transition-colors duration-500">
      <div className="relative max-w-5xl mx-auto px-6 sm:px-10 py-12 sm:py-20">
        <Header lastFetched={lastFetched} onRefresh={refresh} isLoading={isLoading} isFetching={isFetching} />

        {error ? (
          <div className="mb-8 p-4 glass-card rounded-2xl text-red-700 dark:text-red-400 text-sm animate-fade-up" role="alert">
            {error}
          </div>
        ) : null}

        {isLoading && !data ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5 animate-fade-up">
            <div className="animate-spin rounded-full h-7 w-7 border-[1.5px] border-gold-200 dark:border-gold-700 border-t-gold-500" />
            <p className="text-[13px] text-ink-faint font-light tracking-wide">Fetching latest prices</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <PriceCard
              title="Gold"
              icon={<GoldIcon className="w-8 h-8" />}
              symbol="XAU"
              nepalPrice={data?.gold.nepal ?? null}
              livePrice={data?.gold.live ?? null}
              delay="50ms"
            />
            <PriceCard
              title="Silver"
              icon={<SilverIcon className="w-8 h-8" />}
              symbol="XAG"
              nepalPrice={data?.silver.nepal ?? null}
              livePrice={data?.silver.live ?? null}
              delay="150ms"
            />
          </div>
        )}

        {sources.length > 0 ? <LastUpdated sources={sources} /> : null}

      </div>
    </div>
  );
}
