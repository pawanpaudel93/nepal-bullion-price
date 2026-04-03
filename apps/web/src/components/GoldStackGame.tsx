import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useLocale } from '../i18n';

interface Props {
  highScore: number;
  onGameEnd: (score: number, lines: number) => boolean;
  onClose: () => void;
}

type Phase = 'start' | 'playing' | 'paused' | 'over';
type Cell = string | null;

const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 28;

// Gold/silver themed colors for each piece
const PIECE_COLORS: Record<string, string> = {
  I: '#F0D68A', // bright gold
  O: '#CA8A04', // deep gold
  T: '#A8A29E', // silver
  S: '#D4A843', // warm gold
  Z: '#7C5F1B', // dark gold
  L: '#E8C974', // pale gold
  J: '#78716C', // dark silver
};

const PIECE_BORDERS: Record<string, string> = {
  I: '#CA8A04',
  O: '#7C5F1B',
  T: '#57534E',
  S: '#A37E24',
  Z: '#57534E',
  L: '#CA8A04',
  J: '#44403C',
};

// Tetromino shapes (each rotation is a 2D array, 1 = filled)
const TETROMINOES: Record<string, number[][][]> = {
  I: [
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  ],
  O: [
    [[1,1],[1,1]],
    [[1,1],[1,1]],
    [[1,1],[1,1]],
    [[1,1],[1,1]],
  ],
  T: [
    [[0,1,0],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,1],[0,1,0]],
    [[0,1,0],[1,1,0],[0,1,0]],
  ],
  S: [
    [[0,1,1],[1,1,0],[0,0,0]],
    [[0,1,0],[0,1,1],[0,0,1]],
    [[0,0,0],[0,1,1],[1,1,0]],
    [[1,0,0],[1,1,0],[0,1,0]],
  ],
  Z: [
    [[1,1,0],[0,1,1],[0,0,0]],
    [[0,0,1],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,0],[0,1,1]],
    [[0,1,0],[1,1,0],[1,0,0]],
  ],
  L: [
    [[0,0,1],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,0],[0,1,1]],
    [[0,0,0],[1,1,1],[1,0,0]],
    [[1,1,0],[0,1,0],[0,1,0]],
  ],
  J: [
    [[1,0,0],[1,1,1],[0,0,0]],
    [[0,1,1],[0,1,0],[0,1,0]],
    [[0,0,0],[1,1,1],[0,0,1]],
    [[0,1,0],[0,1,0],[1,1,0]],
  ],
};

const PIECE_NAMES = Object.keys(TETROMINOES);

interface ActivePiece {
  type: string;
  rotation: number;
  x: number;
  y: number;
}

function createGrid(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece(): string {
  return PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)];
}

function getShape(type: string, rotation: number): number[][] {
  return TETROMINOES[type][rotation % 4];
}

function isValid(grid: Cell[][], type: string, rotation: number, x: number, y: number): boolean {
  const shape = getShape(type, rotation);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const newX = x + c;
      const newY = y + r;
      if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
      if (newY < 0) continue; // allow above board
      if (grid[newY][newX]) return false;
    }
  }
  return true;
}

function placePiece(grid: Cell[][], piece: ActivePiece): Cell[][] {
  const newGrid = grid.map(row => [...row]);
  const shape = getShape(piece.type, piece.rotation);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const py = piece.y + r;
      const px = piece.x + c;
      if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
        newGrid[py][px] = piece.type;
      }
    }
  }
  return newGrid;
}

function clearLines(grid: Cell[][]): { grid: Cell[][]; cleared: number } {
  const remaining = grid.filter(row => row.some(cell => cell === null));
  const cleared = ROWS - remaining.length;
  const emptyRows: Cell[][] = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { grid: [...emptyRows, ...remaining], cleared };
}

const LINE_SCORES = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines

function getDropInterval(level: number): number {
  return Math.max(100, 800 - (level - 1) * 70);
}

export function GoldStackGame({ highScore, onGameEnd, onClose }: Props) {
  const { t, localizeNum } = useLocale();
  const [phase, setPhase] = useState<Phase>('start');
  const [grid, setGrid] = useState<Cell[][]>(createGrid);
  const [piece, setPiece] = useState<ActivePiece | null>(null);
  const [nextType, setNextType] = useState<string>(randomPiece);
  const [score, setScore] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [flashRows, setFlashRows] = useState<number[]>([]);

  const gridRef = useRef<Cell[][]>(createGrid());
  const pieceRef = useRef<ActivePiece | null>(null);
  const nextRef = useRef<string>(randomPiece());
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const dropTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameOverRef = useRef(false);

  const clearDropTimer = useCallback(() => {
    if (dropTimerRef.current) {
      clearInterval(dropTimerRef.current);
      dropTimerRef.current = null;
    }
  }, []);

  const spawnPiece = useCallback((): boolean => {
    const type = nextRef.current;
    const shape = getShape(type, 0);
    const x = Math.floor((COLS - shape[0].length) / 2);
    const y = -1;

    if (!isValid(gridRef.current, type, 0, x, 0)) {
      return false; // game over
    }

    const newPiece: ActivePiece = { type, rotation: 0, x, y };
    pieceRef.current = newPiece;
    setPiece(newPiece);

    const next = randomPiece();
    nextRef.current = next;
    setNextType(next);
    return true;
  }, []);

  const lockPiece = useCallback(() => {
    const p = pieceRef.current;
    if (!p) return;

    const newGrid = placePiece(gridRef.current, p);
    const { grid: clearedGrid, cleared } = clearLines(newGrid);

    if (cleared > 0) {
      // Find which rows were full before clearing
      const fullRows: number[] = [];
      newGrid.forEach((row, i) => {
        if (row.every(cell => cell !== null)) fullRows.push(i);
      });
      setFlashRows(fullRows);
      setTimeout(() => setFlashRows([]), 300);

      const points = LINE_SCORES[Math.min(cleared, 4)] * levelRef.current;
      scoreRef.current += points;
      linesRef.current += cleared;
      const newLevel = Math.floor(linesRef.current / 10) + 1;
      levelRef.current = newLevel;

      setScore(scoreRef.current);
      setTotalLines(linesRef.current);
      setLevel(newLevel);

      // Restart drop timer with new speed
      clearDropTimer();
      dropTimerRef.current = setInterval(() => dropOne(), getDropInterval(newLevel));
    }

    gridRef.current = clearedGrid;
    setGrid(clearedGrid);

    if (!spawnPiece()) {
      gameOverRef.current = true;
      clearDropTimer();
      const isNew = onGameEnd(scoreRef.current, linesRef.current);
      if (isNew) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setPhase('over');
    }
  }, [spawnPiece, clearDropTimer, onGameEnd]);

  const dropOne = useCallback(() => {
    const p = pieceRef.current;
    if (!p || gameOverRef.current) return;

    if (isValid(gridRef.current, p.type, p.rotation, p.x, p.y + 1)) {
      const moved = { ...p, y: p.y + 1 };
      pieceRef.current = moved;
      setPiece(moved);
    } else {
      lockPiece();
    }
  }, [lockPiece]);

  const hardDrop = useCallback(() => {
    const p = pieceRef.current;
    if (!p || gameOverRef.current) return;

    let y = p.y;
    while (isValid(gridRef.current, p.type, p.rotation, p.x, y + 1)) y++;
    const dropped = { ...p, y };
    pieceRef.current = dropped;
    setPiece(dropped);
    lockPiece();
  }, [lockPiece]);

  const moveLeft = useCallback(() => {
    const p = pieceRef.current;
    if (!p || gameOverRef.current) return;
    if (isValid(gridRef.current, p.type, p.rotation, p.x - 1, p.y)) {
      const moved = { ...p, x: p.x - 1 };
      pieceRef.current = moved;
      setPiece(moved);
    }
  }, []);

  const moveRight = useCallback(() => {
    const p = pieceRef.current;
    if (!p || gameOverRef.current) return;
    if (isValid(gridRef.current, p.type, p.rotation, p.x + 1, p.y)) {
      const moved = { ...p, x: p.x + 1 };
      pieceRef.current = moved;
      setPiece(moved);
    }
  }, []);

  const rotate = useCallback(() => {
    const p = pieceRef.current;
    if (!p || gameOverRef.current) return;
    const newRot = (p.rotation + 1) % 4;
    // Try normal, then wall kicks (-1, +1, -2, +2)
    for (const kick of [0, -1, 1, -2, 2]) {
      if (isValid(gridRef.current, p.type, newRot, p.x + kick, p.y)) {
        const rotated = { ...p, rotation: newRot, x: p.x + kick };
        pieceRef.current = rotated;
        setPiece(rotated);
        return;
      }
    }
  }, []);

  const startGame = useCallback(() => {
    clearDropTimer();
    const freshGrid = createGrid();
    gridRef.current = freshGrid;
    setGrid(freshGrid);
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    gameOverRef.current = false;
    setScore(0);
    setTotalLines(0);
    setLevel(1);
    setFlashRows([]);

    const first = randomPiece();
    nextRef.current = first;
    spawnPiece();

    dropTimerRef.current = setInterval(() => dropOne(), getDropInterval(1));
    setPhase('playing');
  }, [clearDropTimer, spawnPiece, dropOne]);

  // Keyboard controls
  useEffect(() => {
    if (phase !== 'playing') return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); moveLeft(); break;
        case 'ArrowRight': e.preventDefault(); moveRight(); break;
        case 'ArrowDown': e.preventDefault(); dropOne(); break;
        case 'ArrowUp': e.preventDefault(); rotate(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, moveLeft, moveRight, dropOne, rotate, hardDrop]);

  // Swipe gestures on the game board
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  useEffect(() => {
    if (phase !== 'playing') return;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    };
    const onEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;
      touchStartRef.current = null;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Minimum swipe distance 30px, max time 400ms
      if (Math.max(absDx, absDy) < 30 || dt > 400) {
        // Short tap = rotate
        if (absDx < 10 && absDy < 10 && dt < 200) rotate();
        return;
      }

      if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0) moveRight(); else moveLeft();
      } else {
        // Vertical swipe
        if (dy > 0) {
          // Swipe down — hard drop if fast, soft drop if slow
          if (dy > 80) hardDrop(); else dropOne();
        }
      }
    };

    const board = document.querySelector('[data-tetris-board]');
    if (board) {
      board.addEventListener('touchstart', onStart as EventListener, { passive: true });
      board.addEventListener('touchend', onEnd as EventListener, { passive: true });
    }
    return () => {
      if (board) {
        board.removeEventListener('touchstart', onStart as EventListener);
        board.removeEventListener('touchend', onEnd as EventListener);
      }
    };
  }, [phase, moveLeft, moveRight, dropOne, hardDrop, rotate]);

  // Cleanup on unmount
  useEffect(() => {
    return clearDropTimer;
  }, [clearDropTimer]);

  // Compute ghost piece position (where piece would land)
  let ghostY = piece?.y ?? 0;
  if (piece) {
    while (isValid(gridRef.current, piece.type, piece.rotation, piece.x, ghostY + 1)) ghostY++;
  }

  // Render grid with current piece overlaid
  const renderGrid = () => {
    const cells: React.ReactElement[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cellType = grid[r][c];
        const isFlashing = flashRows.includes(r);

        // Check if active piece occupies this cell
        let activePieceType: string | null = null;
        let isGhost = false;
        if (piece) {
          const shape = getShape(piece.type, piece.rotation);
          const pr = r - piece.y;
          const pc = c - piece.x;
          if (pr >= 0 && pr < shape.length && pc >= 0 && pc < shape[pr].length && shape[pr][pc]) {
            activePieceType = piece.type;
          }
          // Ghost
          const gr = r - ghostY;
          const gc = c - piece.x;
          if (!activePieceType && gr >= 0 && gr < shape.length && gc >= 0 && gc < shape[gr].length && shape[gr][gc]) {
            isGhost = true;
          }
        }

        const type = activePieceType || cellType;
        const bg = type ? PIECE_COLORS[type] : undefined;
        const border = type ? PIECE_BORDERS[type] : undefined;

        cells.push(
          <div
            key={`${r}-${c}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              background: isGhost ? `${PIECE_COLORS[piece!.type]}22` : bg || 'rgba(255,255,255,0.03)',
              borderWidth: type ? 1 : 0,
              borderStyle: 'solid',
              borderColor: isGhost ? `${PIECE_COLORS[piece!.type]}44` : border || 'transparent',
              boxShadow: type && !isGhost ? `inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2)` : undefined,
              opacity: isFlashing ? 0 : 1,
              transition: isFlashing ? 'opacity 0.15s' : undefined,
            }}
          />
        );
      }
    }
    return cells;
  };

  // Render next piece preview
  const renderNext = () => {
    const shape = getShape(nextType, 0);
    const size = 16;
    return (
      <div className="flex flex-col items-center">
        {shape.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <div
                key={c}
                style={{
                  width: size,
                  height: size,
                  background: cell ? PIECE_COLORS[nextType] : 'transparent',
                  borderWidth: cell ? 1 : 0,
                  borderStyle: 'solid',
                  borderColor: cell ? PIECE_BORDERS[nextType] : 'transparent',
                  boxShadow: cell ? 'inset 0 1px 1px rgba(255,255,255,0.2)' : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Touch control button
  const CtrlBtn = ({ label, onPress, className = '' }: { label: string; onPress: () => void; className?: string }) => (
    <button
      onPointerDown={(e) => { e.preventDefault(); onPress(); }}
      className={`flex-1 min-h-[52px] rounded-xl bg-white/10 text-white font-bold text-lg cursor-pointer active:bg-white/20 active:scale-95 transition-all select-none ${className}`}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col dark"
      style={{ background: 'linear-gradient(180deg, #0F0E0D 0%, #1C1917 40%, #292524 100%)' }}
      role="dialog"
      aria-label={t.goldBlocks}
    >
      {/* Start screen */}
      {phase === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <div className="grid grid-cols-4 gap-0.5 opacity-60">
            {['I','O','T','S'].map(type => (
              <div key={type} style={{ width: 20, height: 20, background: PIECE_COLORS[type], border: `1px solid ${PIECE_BORDERS[type]}` }} />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-gold-200">{t.goldBlocks}</h2>
          <p className="text-ink-faint text-sm text-center">{t.goldBlocksDesc}</p>
          {highScore > 0 && (
            <p className="text-xs text-ink-faint">{t.highScore}: <strong className="text-white">{localizeNum(highScore)}</strong></p>
          )}
          <button
            onClick={startGame}
            className="mt-4 px-10 py-4 rounded-full bg-gold-500 text-ink font-bold text-lg cursor-pointer hover:bg-gold-400 active:scale-95 transition-colors"
            aria-label={t.tapToStart}
          >
            {t.tapToStart}
          </button>
          <button onClick={onClose} className="text-ink-faint text-sm underline cursor-pointer">{t.cancel}</button>
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && (
        <div className="flex-1 flex flex-col">
          {/* HUD */}
          <div className="flex items-center justify-between px-4 py-2 safe-area-top">
            <button
              onClick={() => { clearDropTimer(); onClose(); }}
              className="p-2 -m-1 text-white/50 hover:text-white transition-colors cursor-pointer"
              aria-label="Close game"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-ink-faint">{t.level} {localizeNum(level)}</span>
              <span className="text-ink-faint">{t.lines}: {localizeNum(totalLines)}</span>
              <span className="font-bold text-gold-200">{localizeNum(score)}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-ink-faint uppercase">{t.next}</span>
              {renderNext()}
            </div>
          </div>

          {/* Game board */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="border border-white/10 rounded-lg overflow-hidden"
              data-tetris-board
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
                gap: 0,
                background: 'rgba(0,0,0,0.3)',
              }}
            >
              {renderGrid()}
            </div>
          </div>

          {/* Touch controls */}
          <div className="px-4 pb-4 pt-2 safe-area-bottom">
            <div className="flex gap-2 max-w-sm mx-auto">
              <CtrlBtn label="←" onPress={moveLeft} />
              <CtrlBtn label="↓" onPress={dropOne} />
              <CtrlBtn label="↻" onPress={rotate} className="text-gold-200" />
              <CtrlBtn label="⇓" onPress={hardDrop} className="bg-gold-500/20 text-gold-200" />
              <CtrlBtn label="→" onPress={moveRight} />
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {phase === 'over' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <div className="grid grid-cols-4 gap-0.5 opacity-40">
            {['Z','L','J','I'].map(type => (
              <div key={type} style={{ width: 16, height: 16, background: PIECE_COLORS[type], border: `1px solid ${PIECE_BORDERS[type]}` }} />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-gold-200">{t.gameOver}</h2>
          <p className="text-4xl font-bold text-white">{localizeNum(score)}</p>
          {score > highScore && score > 0 && (
            <p className="text-emerald-400 font-bold text-sm animate-pulse">{t.newHighScore}</p>
          )}
          <div className="flex gap-4 text-sm text-ink-faint">
            <span>{t.lines}: {localizeNum(totalLines)}</span>
            <span>{t.level} {localizeNum(level)}</span>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={startGame} className="px-8 py-3 rounded-full bg-gold-500 text-ink font-bold cursor-pointer hover:bg-gold-400 active:scale-95 transition-colors">{t.playAgain}</button>
            <button onClick={onClose} className="px-8 py-3 rounded-full bg-white/10 text-white font-bold cursor-pointer hover:bg-white/20 transition-colors">{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
