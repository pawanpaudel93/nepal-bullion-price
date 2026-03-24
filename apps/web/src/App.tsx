import { useBullionPrices } from './hooks/useBullionPrices';
import { Header } from './components/Header';
import { PriceCard } from './components/PriceCard';
import { LastUpdated } from './components/LastUpdated';

export default function App() {
  const { data, isLoading, error, lastFetched, refresh } = useBullionPrices();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header lastFetched={lastFetched} onRefresh={refresh} isLoading={isLoading} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {isLoading && !data ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriceCard
              title="Gold"
              icon="\uD83E\uDD47"
              symbol="XAU"
              nepalPrice={data?.gold.nepal ?? null}
              livePrice={data?.gold.live ?? null}
              accentColor="text-amber-600 dark:text-amber-400"
            />
            <PriceCard
              title="Silver"
              icon="\uD83E\uDD48"
              symbol="XAG"
              nepalPrice={data?.silver.nepal ?? null}
              livePrice={data?.silver.live ?? null}
              accentColor="text-gray-600 dark:text-gray-300"
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

        <footer className="mt-12 text-center text-xs text-gray-400 dark:text-gray-600">
          <p>Data from FENEGOSIDA, gold-api.com, Nepal Rastra Bank</p>
          <p className="mt-1">Prices are approximate. Actual prices may vary.</p>
        </footer>
      </div>
    </div>
  );
}
