import { useState } from 'react';
import { useLocale } from '../i18n';
import { usePriceCrash } from '../hooks/usePriceCrash';
import { PriceCrashGame } from './PriceCrashGame';

export function PriceCrashCard() {
  const { t, localizeNum } = useLocale();
  const { bestMultiplier, submitResult } = usePriceCrash();
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <div className="glass-card rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-1">{t.priceCrash}</p>
            <p className="text-[13px] text-ink-muted dark:text-ink-faint">{t.tapCashOut}</p>
            {bestMultiplier > 0 && (
              <p className="text-[12px] text-ink-faint mt-1">{t.bestMultiplier}: <strong className="text-ink dark:text-white">{localizeNum(bestMultiplier.toFixed(2))}x</strong></p>
            )}
          </div>
          <button
            onClick={() => setPlaying(true)}
            className="px-6 py-3 rounded-full bg-emerald-500 text-white font-bold text-[14px] cursor-pointer hover:bg-emerald-400 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          >
            {t.play}
          </button>
        </div>
      </div>

      {playing && (
        <PriceCrashGame
          bestMultiplier={bestMultiplier}
          onResult={submitResult}
          onClose={() => setPlaying(false)}
        />
      )}
    </>
  );
}
