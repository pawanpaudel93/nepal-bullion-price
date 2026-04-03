import { useState } from 'react';
import { useLocale } from '../i18n';
import { useGoldStack } from '../hooks/useGoldStack';
import { GoldStackGame } from './GoldStackGame';

export function GoldStackCard() {
  const { t, localizeNum } = useLocale();
  const { highScore, bestLines, submitScore } = useGoldStack();
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <div className="glass-card rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-1">{t.goldBlocks}</p>
            <p className="text-[13px] text-ink-muted dark:text-ink-faint">{t.goldBlocksDesc}</p>
            {highScore > 0 && (
              <p className="text-[12px] text-ink-faint mt-1">
                {t.highScore}: <strong className="text-ink dark:text-white">{localizeNum(highScore)}</strong>
                {' · '}{t.bestLines}: <strong className="text-ink dark:text-white">{localizeNum(bestLines)}</strong>
              </p>
            )}
          </div>
          <button
            onClick={() => setPlaying(true)}
            className="px-6 py-3 rounded-full bg-amber-500 text-ink font-bold text-[14px] cursor-pointer hover:bg-amber-400 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            {t.play}
          </button>
        </div>
      </div>

      {playing && (
        <GoldStackGame
          highScore={highScore}
          onGameEnd={submitScore}
          onClose={() => setPlaying(false)}
        />
      )}
    </>
  );
}
