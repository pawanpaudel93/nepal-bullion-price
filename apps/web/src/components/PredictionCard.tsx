import { useLocale } from '../i18n';
import type { Direction } from '../hooks/usePrediction';

interface PredictionCardProps {
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
  currentPrediction, lastResult, hasPredictedToday, hasResult,
  predictionStreak, accuracy, onPredict, onDismissResult,
}: PredictionCardProps) {
  const { t, numberLocale } = useLocale();

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 mt-7 animate-fade-up">
      {/* Result from yesterday */}
      {hasResult && lastResult ? (
        <div className="mb-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-3">
            {t.yesterdayPrediction}
          </p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{lastResult.correct ? '✅' : '❌'}</span>
            <span className={`font-semibold text-lg ${lastResult.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {lastResult.correct ? t.youWereRight : t.notThisTime}
            </span>
          </div>
          {lastResult.priceChange > 0 ? (
            <p className="text-[13px] text-ink-muted dark:text-ink-faint mb-4">
              {(lastResult.actual === 'up' ? t.goldWentUp : t.goldWentDown)
                .replace('{amount}', lastResult.priceChange.toLocaleString(numberLocale))
                .replace('{pct}', String(lastResult.pctChange))}
            </p>
          ) : (
            <p className="text-[13px] text-ink-muted dark:text-ink-faint mb-4">{t.goldFlat}</p>
          )}
          {hasPredictedToday ? null : (
            <div className="h-px bg-gradient-to-r from-transparent via-ink/6 dark:via-white/6 to-transparent mb-6" />
          )}
        </div>
      ) : null}

      {/* Prediction input or locked state */}
      {hasPredictedToday && currentPrediction ? (
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-3">
            {t.predictTomorrow}
          </p>
          <p className={`text-lg font-semibold ${currentPrediction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {currentPrediction === 'up' ? `▲ ${t.goldWillGoUp}` : `▼ ${t.goldWillGoDown}`}
          </p>
          <p className="text-[12px] text-ink-faint mt-2">{t.checkBackTomorrow}</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-2">
            {t.predictTomorrow}
          </p>
          <p className="text-[14px] text-ink-muted dark:text-ink-faint mb-4">{t.willGoldGoUpOrDown}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => onPredict('up')}
              className="flex flex-col items-center gap-1 px-8 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <span className="text-xl">▲</span>
              <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">{t.up}</span>
            </button>
            <button
              onClick={() => onPredict('down')}
              className="flex flex-col items-center gap-1 px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
            >
              <span className="text-xl">▼</span>
              <span className="text-[13px] font-semibold text-red-500 dark:text-red-400">{t.down}</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-center gap-4 mt-5 text-[12px] text-ink-muted dark:text-ink-faint">
        <span>🎯 {t.predictionStreak}: <strong className="text-ink dark:text-white">{predictionStreak}</strong></span>
        <span className="w-[3px] h-[3px] rounded-full bg-ink-faint/30" />
        <span>{t.accuracy}: <strong className="text-ink dark:text-white">{accuracy}%</strong></span>
      </div>
    </div>
  );
}
