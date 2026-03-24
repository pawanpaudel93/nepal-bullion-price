import { useBullionPrices } from './hooks/useBullionPrices';
import { Header } from './components/Header';
import { PriceCard } from './components/PriceCard';
import { LastUpdated } from './components/LastUpdated';
import { GoldIcon, SilverIcon } from './components/Icons';

export default function App() {
  const { data, isLoading, error, lastFetched, refresh } = useBullionPrices();

  return (
    <div className="min-h-screen bg-paper dark:bg-ink bg-noise transition-colors duration-300">
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <Header lastFetched={lastFetched} onRefresh={refresh} isLoading={isLoading} />

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/30 rounded-xl text-red-700 dark:text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        {isLoading && !data ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold-200 dark:border-gold-700 border-t-gold-500" />
            <p className="text-sm text-ink-muted dark:text-ink-faint">Fetching latest prices</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriceCard
              title="Gold"
              icon={<GoldIcon className="w-8 h-8" />}
              symbol="XAU"
              nepalPrice={data?.gold.nepal ?? null}
              livePrice={data?.gold.live ?? null}
              shimmerClass="text-gold-shimmer"
            />
            <PriceCard
              title="Silver"
              icon={<SilverIcon className="w-8 h-8" />}
              symbol="XAG"
              nepalPrice={data?.silver.nepal ?? null}
              livePrice={data?.silver.live ?? null}
              shimmerClass="text-silver-shimmer"
            />
          </div>
        )}

        {data && (
          <LastUpdated
            sources={[
              ...(data.gold.nepal ? [{ label: 'Nepal Gold', source: data.gold.nepal.source, updatedAt: data.gold.nepal.updatedAt, isStale: data.gold.nepal.isStale }] : []),
              ...(data.gold.live ? [{ label: 'Live Gold', source: data.gold.live.source, updatedAt: data.gold.live.updatedAt, isStale: data.gold.live.isStale }] : []),
              ...(data.silver.nepal ? [{ label: 'Nepal Silver', source: data.silver.nepal.source, updatedAt: data.silver.nepal.updatedAt, isStale: data.silver.nepal.isStale }] : []),
              ...(data.silver.live ? [{ label: 'Live Silver', source: data.silver.live.source, updatedAt: data.silver.live.updatedAt, isStale: data.silver.live.isStale }] : []),
            ]}
          />
        )}

        <footer className="mt-16 text-center">
          <p className="text-[11px] text-ink-faint dark:text-ink-faint tracking-wide">
            Data from FENEGOSIDA &middot; gold-api.com &middot; Nepal Rastra Bank
          </p>
          <p className="text-[11px] text-ink-faint/60 dark:text-ink-faint/40 mt-1">
            Prices are approximate. Actual prices may vary.
          </p>
        </footer>
      </div>
    </div>
  );
}
