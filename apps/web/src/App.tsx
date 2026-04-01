import { useState } from 'react';
import { useBullionPrices } from './hooks/useBullionPrices';
import { useLocale } from './i18n';
import { Header, type Tab } from './components/Header';
import { PriceCard } from './components/PriceCard';
import { GoldIcon, SilverIcon } from './components/Icons';
import { NewsPage } from './components/NewsPage';
import { useMilestones } from './hooks/useMilestones';
import { useStreak } from './hooks/useStreak';
import { MilestoneBanner } from './components/MilestoneBanner';

export default function App() {
  const { data, isLoading, isFetching, error, lastFetched, refresh } = useBullionPrices();
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('prices');

  const { streak, bestStreak, badges, streakEmoji, awardBadge } = useStreak();

  const goldNepalPrice = data?.gold.nepal ? ('hallmark' in data.gold.nepal ? data.gold.nepal.hallmark : 0) : null;
  const silverNepalPrice = data?.silver.nepal?.price ?? null;
  const goldPrevPrice = data?.gold.nepal?.previousPrice ?? null;
  const silverPrevPrice = data?.silver.nepal?.previousPrice ?? null;

  const { activeMilestone, dismiss } = useMilestones(
    goldNepalPrice,
    silverNepalPrice,
    goldPrevPrice,
    silverPrevPrice,
    awardBadge,
  );

  return (
    <div className="min-h-screen bg-paper dark:bg-ink bg-mesh transition-colors duration-500">
      <div className="relative max-w-5xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
        <Header
          lastFetched={lastFetched}
          onRefresh={refresh}
          isFetching={isFetching}
          streak={streak}
          bestStreak={bestStreak}
          badges={badges}
          streakEmoji={streakEmoji}
        />

        <div className="flex rounded-full border border-ink/8 dark:border-white/8 overflow-hidden w-fit mb-6 animate-fade-up">
          {(['prices', 'news'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-[12px] font-medium tracking-wide cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none ${
                activeTab === tab
                  ? 'bg-ink dark:bg-white text-white dark:text-ink'
                  : 'text-ink-muted dark:text-ink-faint hover:bg-ink/5 dark:hover:bg-white/5'
              }`}
            >
              {tab === 'prices' ? t.prices : t.news}
            </button>
          ))}
        </div>

        {activeTab === 'prices' ? (
          <>
            {activeMilestone ? (
              <MilestoneBanner event={activeMilestone} onDismiss={dismiss} />
            ) : null}

            {error ? (
              <div className="mb-8 p-4 glass-card rounded-2xl text-red-700 dark:text-red-400 text-sm animate-fade-up" role="alert">
                {error}
              </div>
            ) : null}

            {isLoading && !data ? (
              <div className="flex flex-col items-center justify-center py-32 gap-5 animate-fade-up">
                <div className="animate-spin rounded-full h-7 w-7 border-[1.5px] border-gold-200 dark:border-gold-700 border-t-gold-500" />
                <p className="text-[13px] text-ink-faint font-light tracking-wide">{t.fetchingPrices}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                <PriceCard
                  title={t.gold}
                  icon={<GoldIcon className="w-10 h-10" />}
                  symbol="XAU"
                  nepalPrice={data?.gold.nepal ?? null}
                  livePrice={data?.gold.live ?? null}
                  delay="50ms"
                />
                <PriceCard
                  title={t.silver}
                  icon={<SilverIcon className="w-10 h-10" />}
                  symbol="XAG"
                  nepalPrice={data?.silver.nepal ?? null}
                  livePrice={data?.silver.live ?? null}
                  delay="150ms"
                />
              </div>
            )}
          </>
        ) : (
          <NewsPage />
        )}
      </div>
    </div>
  );
}
