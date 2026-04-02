import { useState, useEffect, useCallback } from 'react';
import { useBullionPrices } from './hooks/useBullionPrices';
import { useLocale } from './i18n';
import { Header, type Tab } from './components/Header';

const VALID_TABS: Tab[] = ['prices', 'news', 'predict', 'calculator'];

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
import { CalculatorPage } from './components/CalculatorPage';

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
              <div className="mb-8 p-4 glass-card rounded-2xl text-red-700 dark:text-red-400 text-sm animate-fade-up" role="alert">
                {error}
              </div>
            ) : null}

            {isLoading && !data ? (
              <div className="flex flex-col items-center justify-center py-32 gap-5 animate-fade-up" role="status">
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
        ) : activeTab === 'news' ? (
          <NewsPage />
        ) : activeTab === 'predict' ? (
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
