import { useState } from 'react';
import { useLocale } from '../i18n';

interface DigestProps {
  goldPrice: number | null;
  goldPrev: number | null;
  silverPrice: number | null;
  silverPrev: number | null;
  predictionResult: { correct: boolean } | null;
  streak: number;
}

function getNepalHour(): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const nepal = new Date(utc + 5.75 * 60 * 60_000);
  return nepal.getHours();
}

function getNepalDate(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const nepal = new Date(utc + 5.75 * 60 * 60_000);
  return nepal.toISOString().slice(0, 10);
}

const DIGEST_KEY = 'bullion-digest-date';

export function MorningDigest({ goldPrice, goldPrev, silverPrice, silverPrev, predictionResult, streak }: DigestProps) {
  const { t, numberLocale } = useLocale();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DIGEST_KEY) === getNepalDate();
    } catch { return false; }
  });

  if (dismissed) return null;
  if (!goldPrice || !goldPrev) return null;

  const hour = getNepalHour();
  const greeting = hour >= 5 && hour < 12 ? t.goodMorning
    : hour >= 12 && hour < 17 ? t.goodAfternoon
    : t.goodEvening;
  const greetingEmoji = hour >= 5 && hour < 12 ? '☀️' : hour >= 12 && hour < 17 ? '🌤️' : '🌙';

  const goldDiff = goldPrice - goldPrev;
  const goldPct = ((goldDiff / goldPrev) * 100).toFixed(1);
  const silverDiff = silverPrice && silverPrev ? silverPrice - silverPrev : 0;
  const silverPct = silverPrev ? ((silverDiff / silverPrev) * 100).toFixed(1) : '0';

  function handleDismiss() {
    setDismissed(true);
    try { localStorage.setItem(DIGEST_KEY, getNepalDate()); } catch { /* quota */ }
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-gold-400/8 to-silver-400/4 dark:from-gold-400/10 dark:to-silver-400/6 border border-gold-400/10 dark:border-gold-400/15 p-5 animate-fade-up">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[14px] font-medium text-ink dark:text-white">
          {greetingEmoji} {greeting}
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 text-ink-faint hover:text-ink dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/40 dark:bg-white/5 rounded-xl px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-faint">{t.gold}</p>
          <p className="font-mono text-[16px] font-semibold text-ink dark:text-white mt-0.5">
            Rs {goldPrice.toLocaleString(numberLocale)}
          </p>
          <p className={`text-[12px] mt-0.5 ${goldDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {goldDiff >= 0 ? '▲' : '▼'} Rs {Math.abs(goldDiff).toLocaleString(numberLocale)} ({goldDiff >= 0 ? '+' : ''}{goldPct}%)
          </p>
        </div>
        {silverPrice ? (
          <div className="bg-white/40 dark:bg-white/5 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-faint">{t.silver}</p>
            <p className="font-mono text-[16px] font-semibold text-ink dark:text-white mt-0.5">
              Rs {silverPrice.toLocaleString(numberLocale)}
            </p>
            <p className={`text-[12px] mt-0.5 ${silverDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {silverDiff >= 0 ? '▲' : '▼'} Rs {Math.abs(silverDiff).toLocaleString(numberLocale)} ({silverDiff >= 0 ? '+' : ''}{silverPct}%)
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-4 text-[12px] text-ink-muted dark:text-ink-faint flex-wrap">
        {predictionResult ? (
          <span>🎯 {t.yesterdayPrediction}: <strong className={predictionResult.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
            {predictionResult.correct ? `✅ ${t.correct}` : `❌ ${t.wrong}`}
          </strong></span>
        ) : null}
        {streak > 0 ? (
          <span>🔥 {(t.dayStreak as string).replace('{n}', String(streak))}</span>
        ) : null}
      </div>
    </div>
  );
}
