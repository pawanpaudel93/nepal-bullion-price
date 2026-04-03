import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useLocale } from '../i18n';
import { getRandomQuestions, type QuizQuestion } from '../data/quizQuestions';

interface Props {
  highScore: number;
  onGameEnd: (score: number, correct: number, answered: number) => boolean;
  onClose: () => void;
}

type Phase = 'start' | 'playing' | 'feedback' | 'over';

const QUESTIONS_PER_ROUND = 10;
const TIME_PER_QUESTION = 15;
const MAX_LIVES = 3;

export function GoldQuizGame({ highScore, onGameEnd, onClose }: Props) {
  const { t, lang } = useLocale();
  const [phase, setPhase] = useState<Phase>('start');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const answeredRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[questionIndex] ?? null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endGame = useCallback(() => {
    clearTimer();
    const isNew = onGameEnd(scoreRef.current, correctRef.current, answeredRef.current);
    if (isNew) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
    setPhase('over');
  }, [clearTimer, onGameEnd]);

  const startGame = useCallback(() => {
    const q = getRandomQuestions(QUESTIONS_PER_ROUND);
    setQuestions(q);
    setQuestionIndex(0);
    setScore(0);
    setLives(MAX_LIVES);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(TIME_PER_QUESTION);
    scoreRef.current = 0;
    correctRef.current = 0;
    answeredRef.current = 0;
    livesRef.current = MAX_LIVES;
    setPhase('playing');
  }, []);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    clearTimer();
    setTimeLeft(TIME_PER_QUESTION);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          answeredRef.current += 1;
          livesRef.current -= 1;
          setLives(livesRef.current);
          setIsCorrect(false);
          setSelectedAnswer(-1);
          setPhase('feedback');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [phase, questionIndex, clearTimer]);

  const handleAnswer = useCallback((index: number) => {
    if (phase !== 'playing' || selectedAnswer !== null) return;
    clearTimer();

    const correct = index === currentQuestion!.correctIndex;
    answeredRef.current += 1;
    setSelectedAnswer(index);
    setIsCorrect(correct);

    if (correct) {
      const timeBonus = Math.ceil(timeLeft / 3);
      const points = 10 + timeBonus;
      scoreRef.current += points;
      correctRef.current += 1;
      setScore(scoreRef.current);
      setCorrectCount(correctRef.current);
    } else {
      livesRef.current -= 1;
      setLives(livesRef.current);
    }

    setPhase('feedback');
  }, [phase, selectedAnswer, currentQuestion, timeLeft, clearTimer]);

  // Auto-advance after feedback
  useEffect(() => {
    if (phase !== 'feedback') return;

    const timeout = setTimeout(() => {
      if (livesRef.current <= 0 || questionIndex >= questions.length - 1) {
        endGame();
      } else {
        setQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setPhase('playing');
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [phase, questionIndex, questions.length, endGame]);

  const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerColor = timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500';

  const categoryLabels: Record<string, string> = {
    history: 'History', nepal: 'Nepal Market', purity: 'Purity & Hallmarks',
    weights: 'Weights & Measures', world: 'World Gold', funfact: 'Fun Facts',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1a1207] to-[#0d0a04]" role="dialog" aria-label={t.goldQuiz}>
      {phase === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <p className="text-5xl">🧠</p>
          <h2 className="text-2xl font-bold text-gold-200">{t.goldQuiz}</h2>
          <p className="text-ink-faint text-sm text-center">{t.testYourKnowledge}</p>
          {highScore > 0 && (
            <p className="text-xs text-ink-faint">{t.highScore}: <strong className="text-white">{highScore}</strong></p>
          )}
          <button onClick={startGame} className="mt-4 px-10 py-4 rounded-full bg-gold-500 text-ink font-bold text-lg cursor-pointer hover:bg-gold-400 transition-colors" aria-label={t.play}>{t.play}</button>
          <button onClick={onClose} className="text-ink-faint text-sm underline cursor-pointer">{t.cancel}</button>
        </div>
      )}

      {(phase === 'playing' || phase === 'feedback') && currentQuestion && (
        <div className="flex-1 flex flex-col">
          <div className="h-1.5 bg-ink/30">
            <div className={`h-full ${timerColor} transition-all duration-1000 ease-linear`} style={{ width: `${timerPercent}%` }} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex gap-1">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} className={`text-lg ${i < lives ? 'opacity-100' : 'opacity-20'}`}>{i < lives ? '❤️' : '🖤'}</span>
              ))}
            </div>
            <p className="text-sm text-ink-faint">{t.question} {questionIndex + 1}/{questions.length}</p>
            <p className="text-sm font-bold text-gold-200">{score}</p>
          </div>
          <div className="px-6 mb-2">
            <span className="inline-block px-3 py-1 rounded-full bg-gold-500/20 text-gold-200 text-xs font-medium">
              {categoryLabels[currentQuestion.category] ?? currentQuestion.category}
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center px-6 gap-6">
            <h3 className="text-xl font-semibold text-white text-center leading-relaxed">
              {(lang === 'ne' && currentQuestion.questionNP) ? currentQuestion.questionNP : currentQuestion.question}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, i) => {
                const npOption = lang === 'ne' && currentQuestion.optionsNP?.[i];
                const displayOption = npOption || option;
                let btnClass = 'p-4 rounded-xl text-sm font-medium text-center transition-all duration-200 border ';
                if (phase === 'feedback') {
                  if (i === currentQuestion.correctIndex) {
                    btnClass += 'bg-emerald-500/30 border-emerald-500 text-emerald-200';
                  } else if (i === selectedAnswer && !isCorrect) {
                    btnClass += 'bg-red-500/30 border-red-500 text-red-200 animate-shake';
                  } else {
                    btnClass += 'bg-white/5 border-white/10 text-ink-faint opacity-50';
                  }
                } else {
                  btnClass += 'bg-white/10 border-white/10 text-white cursor-pointer active:scale-95 hover:bg-white/20';
                }
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={phase === 'feedback'} className={btnClass} aria-label={displayOption}>
                    {displayOption}
                  </button>
                );
              })}
            </div>
            {phase === 'feedback' && (
              <div className={`text-center text-sm px-4 py-3 rounded-lg ${isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                <p className="font-bold mb-1">{isCorrect ? t.correct : selectedAnswer === -1 ? t.timeUp : t.wrong}</p>
                {currentQuestion.explanation && (
                  <p className="text-xs opacity-80">
                    {(lang === 'ne' && currentQuestion.explanationNP) ? currentQuestion.explanationNP : currentQuestion.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'over' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-5xl">📊</p>
          <h2 className="text-2xl font-bold text-gold-200">{t.quizOver}</h2>
          <p className="text-4xl font-bold text-white">{score}</p>
          {score > highScore && score > 0 && (
            <p className="text-emerald-400 font-bold text-sm animate-pulse">{t.newHighScore}</p>
          )}
          <p className="text-ink-faint text-sm">
            {t.questionsRight.replace('{n}', String(correctCount)).replace('{total}', String(answeredRef.current))}
          </p>
          <p className="text-ink-faint text-xs">
            {t.accuracy}: {answeredRef.current > 0 ? Math.round((correctCount / answeredRef.current) * 100) : 0}%
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={startGame} className="px-8 py-3 rounded-full bg-gold-500 text-ink font-bold cursor-pointer hover:bg-gold-400 transition-colors">{t.playAgain}</button>
            <button onClick={onClose} className="px-8 py-3 rounded-full bg-white/10 text-white font-bold cursor-pointer hover:bg-white/20 transition-colors">{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
