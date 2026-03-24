import { useBullionPrices } from './hooks/useBullionPrices';
import { Header } from './components/Header';
import { PriceCard } from './components/PriceCard';
import { LastUpdated } from './components/LastUpdated';
import { GoldIcon, SilverIcon } from './components/Icons';

export default function App() {
  const { data, isLoading, error, lastFetched, refresh } = useBullionPrices();

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Header lastFetched={lastFetched} onRefresh={refresh} isLoading={isLoading} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        {isLoading && !data ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-secondary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriceCard
              title="Gold"
              icon={<GoldIcon className="w-7 h-7" />}
              symbol="XAU"
              nepalPrice={data?.gold.nepal ?? null}
              livePrice={data?.gold.live ?? null}
              accentColor="text-accent dark:text-yellow-400"
            />
            <PriceCard
              title="Silver"
              icon={<SilverIcon className="w-7 h-7" />}
              symbol="XAG"
              nepalPrice={data?.silver.nepal ?? null}
              livePrice={data?.silver.live ?? null}
              accentColor="text-slate-700 dark:text-slate-300"
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

        <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-600">
          <p>Data from FENEGOSIDA, gold-api.com, Nepal Rastra Bank</p>
          <p className="mt-1">Prices are approximate. Actual prices may vary.</p>
        </footer>
      </div>
    </div>
  );
}
