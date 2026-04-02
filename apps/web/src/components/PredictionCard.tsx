import { useLocale } from '../i18n';
import type { Direction } from '../hooks/usePrediction';

interface PredictionCardProps {
  goldPrice: number | null;
  goldPrev: number | null;
  currentPrediction: Direction | null;
  lastResult: { direction: Direction; actual: Direction; correct: boolean; priceChange: number; pctChange: number } | null;
  hasPredictedToday: boolean;
  hasResult: boolean;
  predictionStreak: number;
  accuracy: number;
  onPredict: (direction: Direction) => void;
  onDismissResult: () => void;
}

export function PredictionCard({
  goldPrice, goldPrev,
  currentPrediction, lastResult, hasPredictedToday, hasResult,
  predictionStreak, accuracy, onPredict, onDismissResult,
}: PredictionCardProps) {
  const { t, numberLocale, localizeNum } = useLocale();

  const goldDiff = goldPrice && goldPrev ? goldPrice - goldPrev : null;
  const goldPct = goldDiff && goldPrev ? ((goldDiff / goldPrev) * 100).toFixed(1) : null;

  return (
    <div className="animate-fade-up max-w-lg mx-auto w-full">
      {/* Gold price context card */}
      {goldPrice ? (
        <div className="glass-card rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-2">{t.gold} — {t.nepalPrice}</p>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-2xl font-bold text-gold-500">
              Rs {localizeNum(goldPrice.toLocaleString(numberLocale))}
            </span>
            {goldDiff !== null && goldPct !== null ? (
              <span className={`text-[13px] font-medium ${goldDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {goldDiff >= 0 ? '▲' : '▼'} {localizeNum(goldPct)}%
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Result from yesterday */}
      {hasResult && lastResult ? (
        <div className="glass-card rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint">
              {t.yesterdayPrediction}
            </p>
            <button
              type="button"
              onClick={onDismissResult}
              className="shrink-0 p-1 text-ink-faint hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${lastResult.correct ? 'bg-emerald-500/8 dark:bg-emerald-500/10' : 'bg-red-500/8 dark:bg-red-500/10'}`}>
            <span className="text-2xl">{lastResult.correct ? '✅' : '❌'}</span>
            <div>
              <span className={`font-semibold text-[15px] ${lastResult.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {lastResult.correct ? t.youWereRight : t.notThisTime}
              </span>
              {lastResult.priceChange > 0 ? (
                <p className="text-[12px] text-ink-muted dark:text-ink-faint mt-0.5">
                  {(lastResult.actual === 'up' ? t.goldWentUp : t.goldWentDown)
                    .replace('{amount}', localizeNum(lastResult.priceChange.toLocaleString(numberLocale)))
                    .replace('{pct}', localizeNum(lastResult.pctChange))}
                </p>
              ) : (
                <p className="text-[12px] text-ink-muted dark:text-ink-faint mt-0.5">{t.goldFlat}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Main prediction card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        {hasPredictedToday && currentPrediction ? (
          /* Locked state */
          <div className="text-center py-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${currentPrediction === 'up' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 ${currentPrediction === 'up' ? 'text-emerald-500' : 'text-red-500 rotate-180'}`}>
                <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
              </svg>
            </div>
            <p className={`text-lg font-semibold ${currentPrediction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {currentPrediction === 'up' ? t.goldWillGoUp : t.goldWillGoDown}
            </p>
            <p className="text-[13px] text-ink-faint mt-2">{t.checkBackTomorrow}</p>
          </div>
        ) : (
          /* Input state */
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-2">
              {t.predictTomorrow}
            </p>
            <p className="text-[15px] text-ink-muted dark:text-ink-faint mb-6">{t.willGoldGoUpOrDown}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onPredict('up')}
                className="flex flex-col items-center gap-2 py-6 rounded-2xl bg-emerald-500/8 border border-emerald-500/15 hover:bg-emerald-500/15 hover:border-emerald-500/25 active:scale-[0.98] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-emerald-500">
                  <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
                </svg>
                <span className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400">{t.up}</span>
              </button>
              <button
                type="button"
                onClick={() => onPredict('down')}
                className="flex flex-col items-center gap-2 py-6 rounded-2xl bg-red-500/8 border border-red-500/15 hover:bg-red-500/15 hover:border-red-500/25 active:scale-[0.98] transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500 rotate-180">
                  <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
                </svg>
                <span className="text-[14px] font-semibold text-red-500 dark:text-red-400">{t.down}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-4 mt-4 px-4 py-3 rounded-2xl bg-ink/[0.02] dark:bg-white/[0.03] text-[12px] text-ink-muted dark:text-ink-faint">
        <span>🎯 {t.predictionStreak}: <strong className="text-ink dark:text-white">{localizeNum(predictionStreak)}</strong></span>
        <span className="w-[3px] h-[3px] rounded-full bg-ink-faint/30" />
        <span>{t.accuracy}: <strong className="text-ink dark:text-white">{localizeNum(accuracy)}%</strong></span>
      </div>
    </div>
  );
}
