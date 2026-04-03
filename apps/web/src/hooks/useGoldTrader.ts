import { useState, useCallback } from 'react';

const STORAGE_KEY = 'bullion-gold-trader';
const INITIAL_CASH = 500_000;

export interface Trade {
  date: string;
  action: 'buy' | 'sell';
  tola: number;
  pricePerTola: number;
  total: number;
}

interface GoldTraderState {
  cash: number;
  goldTola: number;
  trades: Trade[];
  portfolioHistory: { date: string; value: number }[];
  startDate: string;
  lastTradeDate: string;
}

/** Get current Nepal date string (UTC+5:45) as YYYY-MM-DD */
function getNepalDate(): string {
  const now = new Date();
  const nepalOffset = 5 * 60 + 45; // minutes
  const nepalDate = new Date(now.getTime() + (nepalOffset + now.getTimezoneOffset()) * 60000);
  return nepalDate.toISOString().slice(0, 10);
}

function defaultState(): GoldTraderState {
  return {
    cash: INITIAL_CASH,
    goldTola: 0,
    trades: [],
    portfolioHistory: [],
    startDate: getNepalDate(),
    lastTradeDate: '',
  };
}

function loadState(): GoldTraderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return defaultState();
}

function saveState(state: GoldTraderState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function useGoldTrader() {
  const [state, setState] = useState<GoldTraderState>(loadState);

  const hasTradedToday = state.lastTradeDate === getNepalDate();

  const executeTrade = useCallback((action: 'buy' | 'sell', tola: number, pricePerTola: number) => {
    setState(prev => {
      const today = getNepalDate();
      if (prev.lastTradeDate === today) return prev;

      const total = tola * pricePerTola;

      if (action === 'buy' && total > prev.cash) return prev;
      if (action === 'sell' && tola > prev.goldTola) return prev;

      const trade: Trade = { date: today, action, tola, pricePerTola, total };

      const newCash = action === 'buy' ? prev.cash - total : prev.cash + total;
      const newGold = action === 'buy' ? prev.goldTola + tola : prev.goldTola - tola;
      const portfolioValue = newCash + newGold * pricePerTola;

      const next: GoldTraderState = {
        ...prev,
        cash: Math.round(newCash * 100) / 100,
        goldTola: Math.round(newGold * 10000) / 10000,
        trades: [trade, ...prev.trades].slice(0, 30),
        portfolioHistory: [
          ...prev.portfolioHistory,
          { date: today, value: Math.round(portfolioValue) },
        ].slice(-30),
        lastTradeDate: today,
      };
      saveState(next);
      return next;
    });
  }, []);

  const resetPortfolio = useCallback(() => {
    const fresh = defaultState();
    saveState(fresh);
    setState(fresh);
  }, []);

  const getPortfolioValue = useCallback((currentPrice: number) => {
    return state.cash + state.goldTola * currentPrice;
  }, [state.cash, state.goldTola]);

  const getPnL = useCallback((currentPrice: number) => {
    const currentValue = state.cash + state.goldTola * currentPrice;
    const pnl = currentValue - INITIAL_CASH;
    const pnlPercent = (pnl / INITIAL_CASH) * 100;
    return { pnl, pnlPercent };
  }, [state.cash, state.goldTola]);

  return {
    cash: state.cash,
    goldTola: state.goldTola,
    trades: state.trades,
    portfolioHistory: state.portfolioHistory,
    startDate: state.startDate,
    hasTradedToday,
    executeTrade,
    resetPortfolio,
    getPortfolioValue,
    getPnL,
  };
}
