import { useState, useEffect, useCallback } from 'react';
import { useBullionPrices } from './hooks/useBullionPrices';
import { useLocale } from './i18n';
import { Header, type Tab } from './components/Header';

const VALID_TABS: Tab[] = ['prices', 'news', 'play', 'calculator'];

function getTabFromHash(): Tab {
  const hash = window.location.hash.slice(1);
  return VALID_TABS.includes(hash as Tab) ? (hash as Tab) : 'prices';
}
import { PriceCard } from './components/PriceCard';
import { GoldIcon, SilverIcon } from './components/Icons';
import { NewsPage } from './components/NewsPage';
import { useMilestones } from './hooks/useMilestones';
import { useStreak } from './hooks/useStreak';
import { MilestoneBanner } from './components/MilestoneBanner';
import { usePrediction } from './hooks/usePrediction';
import { PredictionCard } from './components/PredictionCard';
import { GoldRushCard } from './components/GoldRushCard';
import { PriceCrashCard } from './components/PriceCrashCard';
import { GoldQuizCard } from './components/GoldQuizCard';
import { GoldStackCard } from './components/GoldStackCard';
import { GoldTraderCard } from './components/GoldTraderCard';
import { CalculatorPage } from './components/CalculatorPage';

function PriceCardSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-8 animate-pulse" aria-hidden="true">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-ink/8 dark:bg-white/8" />
        <div className="h-6 w-24 rounded bg-ink/8 dark:bg-white/8" />
      </div>
      <div className="h-3 w-32 rounded bg-ink/6 dark:bg-white/6 mb-4" />
      <div className="h-10 w-56 rounded-lg bg-ink/10 dark:bg-white/10 mb-4" />
      <div className="h-3 w-40 rounded bg-ink/6 dark:bg-white/6 mb-8" />
      <div className="h-28 rounded-xl bg-ink/5 dark:bg-white/5 mb-8" />
      <div className="h-3 w-36 rounded bg-ink/6 dark:bg-white/6 mb-4" />
      <div className="h-7 w-40 rounded-lg bg-ink/8 dark:bg-white/8" />
    </div>
  );
}

export default function App() {
  const { data, isLoading, isFetching, error, lastFetched, refresh } = useBullionPrices();
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'prices') {
      history.replaceState(null, '', window.location.pathname);
    } else {
      window.location.hash = tab;
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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

  const {
    currentPrediction, lastResult, hasPredictedToday, hasResult,
    predictionStreak, accuracy, predict, dismissResult,
  } = usePrediction(goldNepalPrice, goldPrevPrice);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink bg-mesh transition-colors duration-500">
      <div className="relative max-w-5xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
        <Header
          lastFetched={lastFetched}
          onRefresh={refresh}
          isFetching={isFetching}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          streak={streak}
          bestStreak={bestStreak}
          badges={badges}
          streakEmoji={streakEmoji}
        />

        {activeTab === 'prices' ? (
          <>
            {activeMilestone ? (
              <MilestoneBanner event={activeMilestone} onDismiss={dismiss} />
            ) : null}

            {error ? (
              <div className="mb-6 p-4 glass-card rounded-2xl text-sm animate-fade-up flex flex-wrap items-center justify-between gap-3" role="alert">
                <p className="text-red-700 dark:text-red-400">
                  {t.loadError}{data ? <span className="text-ink-muted dark:text-ink-faint"> {t.showingSaved}</span> : null}
                </p>
                <button
                  onClick={refresh}
                  disabled={isFetching}
                  className="px-3 py-1.5 rounded-full border border-ink/10 dark:border-white/10 text-[12px] font-medium text-ink dark:text-white hover:bg-ink/5 dark:hover:bg-white/5 disabled:opacity-40 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  {t.tryAgain}
                </button>
              </div>
            ) : null}

            {isLoading && !data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7" role="status" aria-label={t.fetchingPrices}>
                <PriceCardSkeleton />
                <PriceCardSkeleton />
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
        ) : activeTab === 'news' ? (
          <NewsPage />
        ) : activeTab === 'play' ? (
          <>
            <PredictionCard
              goldPrice={goldNepalPrice}
              goldPrev={goldPrevPrice}
              currentPrediction={currentPrediction}
              lastResult={lastResult}
              hasPredictedToday={hasPredictedToday}
              hasResult={hasResult}
              predictionStreak={predictionStreak}
              accuracy={accuracy}
              onPredict={predict}
              onDismissResult={dismissResult}
            />
            <div className="max-w-lg mx-auto w-full mt-4 flex flex-col gap-4">
              <GoldRushCard />
              <PriceCrashCard />
              <GoldQuizCard />
              <GoldStackCard />
              <GoldTraderCard goldPricePerTola={goldNepalPrice} />
            </div>
          </>
        ) : (
          <CalculatorPage
            goldPricePerTola={goldNepalPrice}
            silverPricePerTola={silverNepalPrice}
          />
        )}
      </div>
    </div>
  );
}
