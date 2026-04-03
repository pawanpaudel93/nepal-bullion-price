import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useLocale } from '../i18n';

interface Props {
  highScore: number;
  onGameEnd: (score: number, height: number) => boolean;
  onClose: () => void;
}

type Phase = 'start' | 'playing' | 'over';

interface StackedBar {
  x: number;
  width: number;
  shade: number;
}

interface FallingPiece {
  id: number;
  x: number;
  width: number;
  y: number;
  side: 'left' | 'right';
}

const BAR_HEIGHT = 24;
const PERFECT_TOLERANCE = 3;
const GAME_WIDTH = 320;
const INITIAL_SPEED = 2;
const SPEED_INCREMENT = 0.3;

export function GoldStackGame({ highScore, onGameEnd, onClose }: Props) {
  const { t, localizeNum } = useLocale();
  const [phase, setPhase] = useState<Phase>('start');
  const [stack, setStack] = useState<StackedBar[]>([]);
  const [score, setScore] = useState(0);
  const [height, setHeight] = useState(0);
  const [perfectText, setPerfectText] = useState(false);
  const [fallingPieces, setFallingPieces] = useState<FallingPiece[]>([]);
  const [slidingBar, setSlidingBar] = useState<{ x: number; width: number } | null>(null);

  const rafRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const heightRef = useRef(0);
  const stackRef = useRef<StackedBar[]>([]);
  const directionRef = useRef<1 | -1>(1);
  const slidingRef = useRef<{ x: number; width: number }>({ x: 0, width: GAME_WIDTH });
  const fallingIdRef = useRef(0);
  const gameActiveRef = useRef(false);

  const getSpeed = useCallback(() => {
    return INITIAL_SPEED + Math.floor(heightRef.current / 5) * SPEED_INCREMENT;
  }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    gameActiveRef.current = false;
  }, []);

  const startGame = useCallback(() => {
    cleanup();
    const firstBar: StackedBar = { x: 0, width: GAME_WIDTH, shade: 0 };
    setStack([firstBar]);
    stackRef.current = [firstBar];
    setScore(0);
    setHeight(0);
    scoreRef.current = 0;
    heightRef.current = 0;
    directionRef.current = 1;
    slidingRef.current = { x: 0, width: GAME_WIDTH };
    setFallingPieces([]);
    setPerfectText(false);
    gameActiveRef.current = true;
    setPhase('playing');
  }, [cleanup]);

  // Animation loop for sliding bar
  useEffect(() => {
    if (phase !== 'playing') return;

    const animate = () => {
      if (!gameActiveRef.current) return;

      const speed = getSpeed();
      const bar = slidingRef.current;
      let newX = bar.x + speed * directionRef.current;

      if (newX + bar.width > GAME_WIDTH) {
        newX = GAME_WIDTH - bar.width;
        directionRef.current = -1;
      } else if (newX < 0) {
        newX = 0;
        directionRef.current = 1;
      }

      slidingRef.current = { ...bar, x: newX };
      setSlidingBar({ ...slidingRef.current });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return cleanup;
  }, [phase, height, cleanup, getSpeed]);

  const handleDrop = useCallback(() => {
    if (phase !== 'playing' || !gameActiveRef.current) return;

    const sliding = slidingRef.current;
    const topBar = stackRef.current[stackRef.current.length - 1];

    const overlapLeft = Math.max(sliding.x, topBar.x);
    const overlapRight = Math.min(sliding.x + sliding.width, topBar.x + topBar.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      cleanup();
      const isNew = onGameEnd(scoreRef.current, heightRef.current);
      if (isNew) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
      setPhase('over');
      return;
    }

    const isPerfect = Math.abs(sliding.x - topBar.x) <= PERFECT_TOLERANCE && Math.abs(sliding.width - topBar.width) <= PERFECT_TOLERANCE;

    const newBar: StackedBar = {
      x: isPerfect ? topBar.x : overlapLeft,
      width: isPerfect ? topBar.width : overlapWidth,
      shade: (stackRef.current.length) % 2,
    };

    const points = isPerfect ? 6 : 1;
    scoreRef.current += points;
    heightRef.current += 1;
    setScore(scoreRef.current);
    setHeight(heightRef.current);

    if (isPerfect) {
      setPerfectText(true);
      setTimeout(() => setPerfectText(false), 600);
    }

    if (!isPerfect) {
      const id = ++fallingIdRef.current;
      const isLeftOverhang = sliding.x < topBar.x;
      const piece: FallingPiece = {
        id,
        x: isLeftOverhang ? sliding.x : overlapRight,
        width: sliding.width - overlapWidth,
        y: 0,
        side: isLeftOverhang ? 'left' : 'right',
      };
      setFallingPieces(prev => [...prev, piece]);
      setTimeout(() => {
        setFallingPieces(prev => prev.filter(p => p.id !== id));
      }, 600);
    }

    const newStack = [...stackRef.current, newBar];
    stackRef.current = newStack;
    setStack(newStack);

    slidingRef.current = { x: directionRef.current === 1 ? 0 : GAME_WIDTH - newBar.width, width: newBar.width };
    directionRef.current = 1;
  }, [phase, cleanup, onGameEnd]);

  const visibleBars = 12;
  const cameraOffset = Math.max(0, stack.length - visibleBars) * BAR_HEIGHT;

  const goldGradient = (shade: number) =>
    shade === 0
      ? 'linear-gradient(90deg, #F0D68A 0%, #D4A843 40%, #CA8A04 100%)'
      : 'linear-gradient(90deg, #D4A843 0%, #CA8A04 40%, #A37E24 100%)';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1a1207] to-[#0d0a04]"
      role="dialog"
      aria-label={t.goldStack}
      onPointerDown={phase === 'playing' ? handleDrop : undefined}
    >
      {phase === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <p className="text-5xl">🏗️</p>
          <h2 className="text-2xl font-bold text-gold-200">{t.goldStack}</h2>
          <p className="text-ink-faint text-sm text-center">{t.stackGoldBars}</p>
          {highScore > 0 && (
            <p className="text-xs text-ink-faint">{t.highScore}: <strong className="text-white">{localizeNum(highScore)}</strong></p>
          )}
          <button
            onClick={startGame}
            className="mt-4 px-10 py-4 rounded-full bg-gold-500 text-ink font-bold text-lg cursor-pointer hover:bg-gold-400 transition-colors"
            aria-label={t.tapToStart}
          >
            {t.tapToStart}
          </button>
          <button onClick={onClose} className="text-ink-faint text-sm underline cursor-pointer">{t.cancel}</button>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <div className="flex items-center justify-between px-4 py-3 pointer-events-none">
            <p className="text-sm font-bold text-gold-200">{t.score}: {localizeNum(score)}</p>
            <p className="text-sm text-ink-faint">{t.height}: {localizeNum(height)}</p>
          </div>

          {perfectText && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <p className="text-2xl font-black text-gold-200" style={{ animation: 'stack-perfect 0.6s ease-out forwards' }}>
                {t.perfect} +6
              </p>
            </div>
          )}

          <div className="flex-1 flex items-end justify-center overflow-hidden">
            <div className="relative" style={{ width: GAME_WIDTH, height: '100%' }}>
              <div
                className="absolute bottom-0 left-0 right-0 transition-transform duration-200"
                style={{ transform: `translateY(-${cameraOffset}px)` }}
              >
                {stack.map((bar, i) => (
                  <div
                    key={i}
                    className="absolute border border-gold-700/50"
                    style={{
                      left: bar.x,
                      bottom: i * BAR_HEIGHT,
                      width: bar.width,
                      height: BAR_HEIGHT,
                      background: goldGradient(bar.shade),
                      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.15)',
                    }}
                  />
                ))}

                {fallingPieces.map(piece => (
                  <div
                    key={piece.id}
                    className="absolute border border-gold-700/50"
                    style={{
                      left: piece.x,
                      bottom: stack.length * BAR_HEIGHT,
                      width: piece.width,
                      height: BAR_HEIGHT,
                      background: goldGradient(stack.length % 2),
                      animation: 'overhang-fall 0.6s ease-in forwards',
                    }}
                  />
                ))}

                {slidingBar && (
                  <div
                    className="absolute border-2 border-gold-200/60"
                    style={{
                      left: slidingBar.x,
                      bottom: stack.length * BAR_HEIGHT,
                      width: slidingBar.width,
                      height: BAR_HEIGHT,
                      background: goldGradient(stack.length % 2),
                      boxShadow: '0 0 12px rgba(212,168,67,0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
                    }}
                  />
                )}
              </div>

              <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
                <p className="text-xs text-ink-faint/50">{t.tapToDrop}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {phase === 'over' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-5xl">🏗️</p>
          <h2 className="text-2xl font-bold text-gold-200">{t.gameOver}</h2>
          <p className="text-4xl font-bold text-white">{localizeNum(score)}</p>
          {score > highScore && score > 0 && (
            <p className="text-emerald-400 font-bold text-sm animate-pulse">{t.newHighScore}</p>
          )}
          <p className="text-ink-faint text-sm">{t.height}: {localizeNum(height)} {t.bars}</p>
          <div className="flex gap-3 mt-4">
            <button onClick={startGame} className="px-8 py-3 rounded-full bg-gold-500 text-ink font-bold cursor-pointer hover:bg-gold-400 transition-colors">{t.playAgain}</button>
            <button onClick={onClose} className="px-8 py-3 rounded-full bg-white/10 text-white font-bold cursor-pointer hover:bg-white/20 transition-colors">{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
