import { useState } from 'react';
import { useLocale } from '../i18n';
import { useGoldQuiz } from '../hooks/useGoldQuiz';
import { GoldQuizGame } from './GoldQuizGame';

export function GoldQuizCard() {
  const { t, localizeNum } = useLocale();
  const { highScore, submitScore } = useGoldQuiz();
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <div className="glass-card rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-1">{t.goldQuiz}</p>
            <p className="text-[13px] text-ink-muted dark:text-ink-faint">{t.testYourKnowledge}</p>
            {highScore > 0 && (
              <p className="text-[12px] text-ink-faint mt-1">{t.highScore}: <strong className="text-ink dark:text-white">{localizeNum(highScore)}</strong></p>
            )}
          </div>
          <button
            onClick={() => setPlaying(true)}
            className="px-6 py-3 rounded-full bg-purple-500 text-white font-bold text-[14px] cursor-pointer hover:bg-purple-400 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          >
            {t.play}
          </button>
        </div>
      </div>

      {playing && (
        <GoldQuizGame
          highScore={highScore}
          onGameEnd={submitScore}
          onClose={() => setPlaying(false)}
        />
      )}
    </>
  );
}
