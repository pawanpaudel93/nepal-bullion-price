import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useLocale } from '../i18n';

type Phase = 'waiting' | 'rising' | 'crashed' | 'cashed';

interface PriceCrashGameProps {
  bestMultiplier: number;
  onResult: (multiplier: number) => boolean;
  onClose: () => void;
}

function generateCrashPoint(): number {
  // Exponential distribution — most crashes happen early, rare high multipliers
  // Mean crash ~2.5x, can go up to 20x+
  const r = Math.random();
  return 1 + (-Math.log(1 - r) * 1.5);
}

export function PriceCrashGame({ bestMultiplier, onResult, onClose }: PriceCrashGameProps) {
  const { t, localizeNum } = useLocale();
  const [phase, setPhase] = useState<Phase>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashedAt, setCashedAt] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [round, setRound] = useState(0);

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const crashPointRef = useRef(0);
  const phaseRef = useRef<Phase>('waiting');

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  // Rising animation
  useEffect(() => {
    if (phase !== 'rising') return;

    startTimeRef.current = Date.now();
    const tick = () => {
      if (phaseRef.current !== 'rising') return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Multiplier grows: 1 + (elapsed * acceleration)^1.3
      const current = 1 + Math.pow(elapsed * 0.4, 1.3);

      if (current >= crashPointRef.current) {
        setMultiplier(crashPointRef.current);
        setPhase('crashed');
        onResult(0);
        return;
      }

      setMultiplier(current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, onResult]);

  const startRound = useCallback(() => {
    const cp = generateCrashPoint();
    setCrashPoint(cp);
    crashPointRef.current = cp;
    setMultiplier(1.0);
    setCashedAt(0);
    setIsNewBest(false);
    setRound(r => r + 1);
    setPhase('rising');
  }, []);

  const cashOut = useCallback(() => {
    if (phaseRef.current !== 'rising') return;
    cancelAnimationFrame(rafRef.current);
    const m = Math.round(multiplier * 100) / 100;
    setCashedAt(m);
    const newBest = onResult(m);
    setIsNewBest(newBest);
    setPhase('cashed');
    if (newBest) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    }
  }, [multiplier, onResult]);

  useEffect(() => cleanup, [cleanup]);

  // Bar height as percentage (log scale for visual)
  const barPct = phase === 'waiting' ? 0 : Math.min(95, Math.log(multiplier) * 30 + 5);

  // Color transitions: green → yellow → red as multiplier grows
  const getBarColor = (m: number) => {
    if (phase === 'crashed') return '#EF4444';
    if (m < 2) return '#10B981';
    if (m < 4) return '#F59E0B';
    return '#EF4444';
  };

  const formatMultiplier = (m: number) => localizeNum(m.toFixed(2)) + 'x';

  return (
    <div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-label={t.priceCrash}
      style={{ background: 'linear-gradient(180deg, #0F0E0D 0%, #1C1917 40%, #292524 100%)' }}>
      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <button
          onClick={() => { cleanup(); onClose(); }}
          className="p-2 -m-1 text-white/50 hover:text-white transition-colors cursor-pointer"
          aria-label="Close game"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
        <span className="font-display text-lg font-bold text-gold-400">{t.priceCrash}</span>
        <div className="w-8" />
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-end px-6 pb-8 relative overflow-hidden">

        {/* Multiplier display */}
        <div className="absolute top-1/4 left-0 right-0 text-center z-10">
          <p className={`font-mono font-bold leading-none transition-all duration-100 ${
            phase === 'crashed'
              ? 'text-red-500 text-5xl'
              : phase === 'cashed'
              ? 'text-emerald-400 text-5xl'
              : multiplier >= 4
              ? 'text-red-400 text-6xl'
              : multiplier >= 2
              ? 'text-amber-400 text-6xl'
              : 'text-emerald-400 text-5xl'
          }`}>
            {formatMultiplier(multiplier)}
          </p>
          {phase === 'crashed' && (
            <p className="text-red-400/80 text-sm mt-2 font-medium uppercase tracking-wider animate-fade-up">{t.crashed}</p>
          )}
          {phase === 'cashed' && (
            <p className="text-emerald-400/80 text-sm mt-2 font-medium animate-fade-up">
              {isNewBest ? t.newBest : t.cashedOut}
            </p>
          )}
        </div>

        {/* Rising bar */}
        <div className="w-16 rounded-t-xl overflow-hidden relative" style={{ height: '60%' }}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-xl transition-all duration-75"
            style={{
              height: `${barPct}%`,
              background: `linear-gradient(180deg, ${getBarColor(multiplier)} 0%, ${getBarColor(multiplier)}88 100%)`,
              boxShadow: `0 0 20px ${getBarColor(multiplier)}40`,
            }}
          />
          {/* Gold bar icon at top of rising bar */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-10 h-6 rounded-sm bg-gradient-to-b from-gold-200 to-gold-500 border border-gold-600"
            style={{ bottom: `${barPct}%`, transition: 'bottom 75ms linear' }}
          />
        </div>

        {/* Action button */}
        <div className="mt-8 w-full max-w-xs">
          {phase === 'waiting' && (
            <div className="text-center animate-fade-up">
              <p className="text-white/40 text-[13px] mb-4">{t.tapCashOut}</p>
              {bestMultiplier > 0 && (
                <p className="text-white/25 text-sm font-mono mb-4">{t.bestMultiplier}: {formatMultiplier(bestMultiplier)}</p>
              )}
              <button
                onClick={startRound}
                className="w-full py-4 rounded-full bg-gold-500 text-ink font-bold text-lg cursor-pointer hover:bg-gold-400 active:scale-95 transition-all duration-200 shadow-[0_0_30px_rgba(212,168,67,0.3)]"
              >
                {t.launch}
              </button>
            </div>
          )}

          {phase === 'rising' && (
            <button
              onClick={cashOut}
              className="w-full py-5 rounded-full bg-emerald-500 text-white font-bold text-xl cursor-pointer hover:bg-emerald-400 active:scale-95 transition-all duration-200 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse"
            >
              {t.cashOut}
            </button>
          )}

          {(phase === 'crashed' || phase === 'cashed') && (
            <div className="text-center animate-fade-up">
              {phase === 'crashed' && (
                <p className="text-white/40 text-sm mb-3">{t.crashedAt} {formatMultiplier(crashPoint)}</p>
              )}
              {phase === 'cashed' && (
                <p className="text-emerald-400 text-sm font-semibold mb-3">{t.youCashed} {formatMultiplier(cashedAt)}</p>
              )}
              <button
                onClick={startRound}
                className="w-full py-4 rounded-full bg-gold-500 text-ink font-bold text-lg cursor-pointer hover:bg-gold-400 active:scale-95 transition-all duration-200 shadow-[0_0_30px_rgba(212,168,67,0.3)]"
              >
                {round > 0 ? t.playAgain : t.launch}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
