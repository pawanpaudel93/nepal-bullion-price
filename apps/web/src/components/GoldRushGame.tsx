import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useLocale } from '../i18n';

type CoinType = 'gold' | 'silver' | 'diamond';
type Phase = 'start' | 'countdown' | 'playing' | 'over';

interface Coin {
  id: number;
  x: number;
  type: CoinType;
  size: number;
  duration: number;
  spawnedAt: number;
}

interface GoldRushGameProps {
  highScore: number;
  onGameEnd: (score: number) => boolean;
  onClose: () => void;
}

const LEVEL_STEP = 10;

function getLevel(score: number) {
  return Math.floor(score / LEVEL_STEP) + 1;
}

function getSpawnInterval(level: number): number {
  return Math.max(250, 1000 - (level - 1) * 150);
}

function getCoinType(level: number): CoinType {
  const r = Math.random();
  const diamondChance = Math.min(0.05, 0.02 + level * 0.005);
  const goldChance = Math.max(0.55, 0.80 - (level - 1) * 0.05);
  if (r < diamondChance) return 'diamond';
  if (r < diamondChance + goldChance) return 'gold';
  return 'silver';
}

function getFallDuration(level: number): number {
  return Math.max(1.5, 4 - level * 0.3);
}

export function GoldRushGame({ highScore, onGameEnd, onClose }: GoldRushGameProps) {
  const { t, localizeNum } = useLocale();
  const [phase, setPhase] = useState<Phase>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [countdown, setCountdown] = useState(3);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [floats, setFloats] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [shaking, setShaking] = useState(false);

  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const gcTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const coinIdRef = useRef(0);
  const floatIdRef = useRef(0);
  const tappedRef = useRef(new Set<number>());
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const phaseRef = useRef<Phase>('start');
  const onGameEndRef = useRef(onGameEnd);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  const cleanup = useCallback(() => {
    clearTimeout(spawnTimerRef.current);
    clearInterval(gcTimerRef.current);
    clearTimeout(shakeTimerRef.current);
  }, []);

  // End game
  useEffect(() => {
    if (lives <= 0 && phase === 'playing') {
      cleanup();
      const newHigh = onGameEndRef.current(scoreRef.current);
      setIsNewHigh(newHigh);
      setPhase('over');
      if (newHigh) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }
    }
  }, [lives, phase, cleanup]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 800);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // Spawn loop — single recursive setTimeout (self-adjusting interval)
  useEffect(() => {
    if (phase !== 'playing') return;

    const spawn = () => {
      if (phaseRef.current !== 'playing' || livesRef.current <= 0) return;
      const level = getLevel(scoreRef.current);
      const w = containerRef.current?.clientWidth ?? 300;
      const type = getCoinType(level);
      const size = type === 'silver' ? 38 : type === 'diamond' ? 48 : 44;
      setCoins(prev => [...prev, {
        id: coinIdRef.current++,
        x: Math.random() * (w - size),
        type,
        size,
        duration: getFallDuration(level),
        spawnedAt: Date.now(),
      }]);
      // Schedule next spawn (interval adapts to level)
      spawnTimerRef.current = setTimeout(spawn, getSpawnInterval(level));
    };

    spawn();
    return () => clearTimeout(spawnTimerRef.current);
  }, [phase]);

  // Garbage collect fallen coins periodically instead of per-coin setTimeout
  useEffect(() => {
    if (phase !== 'playing') return;
    gcTimerRef.current = setInterval(() => {
      const now = Date.now();
      setCoins(prev => prev.filter(c => now - c.spawnedAt < c.duration * 1000 + 500));
    }, 1000);
    return () => clearInterval(gcTimerRef.current);
  }, [phase]);

  // Clean up floats
  useEffect(() => {
    if (floats.length === 0) return;
    const timer = setTimeout(() => setFloats(prev => prev.slice(1)), 600);
    return () => clearTimeout(timer);
  }, [floats.length]);

  const handleCoinTap = useCallback((e: React.PointerEvent, coin: Coin) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent double-tap scoring
    if (tappedRef.current.has(coin.id)) return;
    tappedRef.current.add(coin.id);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCoins(prev => prev.filter(c => c.id !== coin.id));

    if (coin.type === 'gold') {
      setScore(s => s + 1);
      setFloats(prev => [...prev, { id: floatIdRef.current++, x: rect.left, y: rect.top, text: '+1', color: 'text-gold-400' }]);
    } else if (coin.type === 'diamond') {
      setScore(s => s + 5);
      setFloats(prev => [...prev, { id: floatIdRef.current++, x: rect.left, y: rect.top, text: '+5', color: 'text-blue-400' }]);
    } else {
      setLives(l => l - 1);
      clearTimeout(shakeTimerRef.current);
      setShaking(true);
      shakeTimerRef.current = setTimeout(() => setShaking(false), 300);
    }
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setCoins([]);
    setFloats([]);
    setIsNewHigh(false);
    setCountdown(3);
    scoreRef.current = 0;
    livesRef.current = 3;
    tappedRef.current.clear();
    setPhase('countdown');
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const level = getLevel(score);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-label={t.goldRush}
      style={{ background: 'linear-gradient(180deg, #0F0E0D 0%, #1C1917 40%, #292524 100%)' }}>
      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-3 safe-area-top text-white">
        <button
          onClick={() => { cleanup(); onClose(); }}
          className="p-2 -m-1 text-white/50 hover:text-white transition-colors cursor-pointer"
          aria-label="Close game"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
        {phase === 'playing' ? (
          <>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <span key={i} className={`text-base transition-opacity duration-200 ${i < lives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
              ))}
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80 tracking-wide uppercase">{t.level} {localizeNum(level)}</span>
            <span className="font-mono text-xl font-bold text-gold-400 min-w-[3ch] text-right">{localizeNum(score)}</span>
          </>
        ) : (
          <>
            <span className="font-display text-lg font-bold text-gold-400">{t.goldRush}</span>
            <div className="w-8" />
          </>
        )}
      </div>

      {/* Game area */}
      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden select-none ${shaking ? 'animate-shake' : ''}`}
        style={{ touchAction: 'none' }}
      >
        {/* Start */}
        {phase === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 animate-fade-up">
            <div className="w-20 h-20 rounded-full coin-gold flex items-center justify-center">
              <span className="text-2xl font-bold text-gold-700 select-none">₹</span>
            </div>
            <h2 className="text-3xl font-bold text-gold-400 font-display tracking-tight">{t.goldRush}</h2>
            <p className="text-white/50 text-center text-[13px] max-w-[240px] leading-relaxed">{t.tapGoldCoins}</p>
            {highScore > 0 && (
              <p className="text-white/30 text-sm font-mono">{t.highScore}: {localizeNum(highScore)}</p>
            )}
            <button
              onClick={startGame}
              className="mt-2 px-12 py-4 rounded-full bg-gold-500 text-ink font-bold text-lg cursor-pointer hover:bg-gold-400 active:scale-95 transition-all duration-200 shadow-[0_0_30px_rgba(212,168,67,0.3)]"
            >
              {t.play}
            </button>
          </div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-bold text-gold-400" style={{ animation: 'fade-up 0.6s ease-out both' }}>
              {countdown > 0 ? localizeNum(countdown) : t.go}
            </span>
          </div>
        )}

        {/* Coins */}
        {(phase === 'playing' || phase === 'over') && coins.map(coin => (
          <button
            key={coin.id}
            onPointerDown={phase === 'playing' ? e => handleCoinTap(e, coin) : undefined}
            className={`absolute top-0 rounded-full flex items-center justify-center ${
              phase === 'playing' ? 'cursor-pointer active:scale-90' : 'pointer-events-none'
            } ${
              coin.type === 'gold'
                ? 'coin-gold'
                : coin.type === 'diamond'
                ? 'coin-diamond'
                : 'coin-silver'
            }`}
            style={{
              left: coin.x,
              width: coin.size,
              height: coin.size,
              animation: `coin-fall ${coin.duration}s linear forwards`,
            }}
            aria-label={coin.type === 'gold' ? 'Gold coin' : coin.type === 'diamond' ? 'Diamond coin' : 'Silver coin'}
          >
            <span className={`absolute rounded-full border ${
              coin.type === 'gold' ? 'border-gold-600/50' : coin.type === 'diamond' ? 'border-white/30' : 'border-silver-500/40'
            }`} style={{ width: '72%', height: '72%' }} />
            <span className={`relative text-[13px] font-bold select-none ${
              coin.type === 'gold' ? 'text-gold-700' : coin.type === 'diamond' ? 'text-white' : 'text-silver-500'
            }`}>
              {coin.type === 'gold' ? '₹' : coin.type === 'diamond' ? '◆' : 'S'}
            </span>
          </button>
        ))}

        {/* Floating score texts */}
        {floats.map(ft => (
          <span
            key={ft.id}
            className={`fixed font-bold text-lg pointer-events-none ${ft.color}`}
            style={{ left: ft.x, top: ft.y, animation: 'float-up 0.6s ease-out forwards' }}
          >
            {ft.text}
          </span>
        ))}

        {/* Game over */}
        {phase === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-fade-up bg-black/60">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/40">{t.gameOver}</p>
            <p className="text-6xl font-bold font-mono text-gold-400 leading-none">{localizeNum(score)}</p>
            <p className="text-[13px] text-white/40">{t.score}</p>
            {isNewHigh && (
              <p className="text-emerald-400 font-semibold text-sm animate-pulse mt-1">{t.newHighScore}</p>
            )}
            {!isNewHigh && highScore > 0 && (
              <p className="text-white/30 text-sm font-mono mt-1">{t.highScore}: {localizeNum(highScore)}</p>
            )}
            <button
              onClick={startGame}
              className="mt-4 px-10 py-3.5 rounded-full bg-gold-500 text-ink font-bold cursor-pointer hover:bg-gold-400 active:scale-95 transition-all duration-200 shadow-[0_0_30px_rgba(212,168,67,0.3)]"
            >
              {t.playAgain}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
