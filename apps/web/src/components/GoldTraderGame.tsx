import { useState, useMemo } from 'react';
import { useLocale } from '../i18n';
import type { Trade } from '../hooks/useGoldTrader';

interface Props {
  cash: number;
  goldTola: number;
  trades: Trade[];
  portfolioHistory: { date: string; value: number }[];
  hasTradedToday: boolean;
  currentPrice: number;
  getPortfolioValue: (price: number) => number;
  getPnL: (price: number) => { pnl: number; pnlPercent: number };
  onTrade: (action: 'buy' | 'sell', tola: number, pricePerTola: number) => void;
  onReset: () => void;
  onClose: () => void;
}

const QUICK_AMOUNTS = [0.5, 1, 2, 5];

export function GoldTraderGame({
  cash, goldTola, trades, portfolioHistory, hasTradedToday,
  currentPrice, getPortfolioValue, getPnL, onTrade, onReset, onClose,
}: Props) {
  const { t, localizeNum } = useLocale();
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [showReset, setShowReset] = useState(false);

  const portfolioValue = getPortfolioValue(currentPrice);
  const { pnl, pnlPercent } = getPnL(currentPrice);
  const pnlColor = pnl >= 0 ? 'text-emerald-400' : 'text-red-400';
  const pnlSign = pnl >= 0 ? '+' : '';

  const parsedAmount = parseFloat(amount) || 0;
  const tradeTotal = parsedAmount * currentPrice;
  const canTrade = !hasTradedToday && parsedAmount > 0 && (
    action === 'buy' ? tradeTotal <= cash : parsedAmount <= goldTola
  );

  const maxBuyable = currentPrice > 0 ? Math.floor((cash / currentPrice) * 10000) / 10000 : 0;
  const maxSellable = goldTola;

  const handleTrade = () => {
    if (!canTrade) return;
    onTrade(action, parsedAmount, currentPrice);
    setAmount('');
  };

  // Simple sparkline SVG
  const sparkline = useMemo(() => {
    if (portfolioHistory.length < 2) return null;
    const values = portfolioHistory.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 280;
    const h = 60;
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    }).join(' ');
    const lastValue = values[values.length - 1];
    const color = lastValue >= 500_000 ? '#10B981' : '#EF4444';
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 mt-2" preserveAspectRatio="none">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  }, [portfolioHistory]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto dark"
      style={{ background: 'linear-gradient(180deg, #0F0E0D 0%, #1C1917 40%, #292524 100%)' }}
      role="dialog"
      aria-label={t.goldTrader}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-bold text-gold-200">{t.goldTrader}</h2>
        <button onClick={onClose} className="text-ink-faint text-sm underline cursor-pointer">{t.cancel}</button>
      </div>

      <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Portfolio summary */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">{t.portfolio}</p>
          <p className="text-3xl font-bold text-white">
            Rs {localizeNum(Math.round(portfolioValue).toLocaleString('en-IN'))}
          </p>
          <p className={`text-sm font-semibold ${pnlColor}`}>
            {pnlSign}Rs {localizeNum(Math.abs(Math.round(pnl)).toLocaleString('en-IN'))} ({pnlSign}{pnlPercent.toFixed(1)}%)
          </p>
          {sparkline}
        </div>

        {/* Holdings breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">{t.cash}</p>
            <p className="text-lg font-bold text-white">Rs {localizeNum(Math.round(cash).toLocaleString('en-IN'))}</p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">{t.holdings}</p>
            <p className="text-lg font-bold text-gold-200">{localizeNum(goldTola.toFixed(4))} {t.tola}</p>
          </div>
        </div>

        {/* Current price */}
        <div className="text-center py-2">
          <p className="text-xs text-ink-faint">{t.gold} {t.perTola}</p>
          <p className="text-xl font-bold text-white">Rs {localizeNum(currentPrice.toLocaleString('en-IN'))}</p>
        </div>

        {/* Trade form */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          {hasTradedToday ? (
            <div className="text-center py-4">
              <p className="text-ink-faint text-sm">{t.tradeToday}</p>
              <p className="text-xs text-ink-faint/60 mt-1">{t.comeBackTomorrow}</p>
            </div>
          ) : (
            <>
              {/* Buy/Sell toggle */}
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                  onClick={() => setAction('buy')}
                  className={`flex-1 py-2 text-sm font-bold cursor-pointer transition-colors ${
                    action === 'buy' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-ink-faint'
                  }`}
                >{t.buy}</button>
                <button
                  onClick={() => setAction('sell')}
                  className={`flex-1 py-2 text-sm font-bold cursor-pointer transition-colors ${
                    action === 'sell' ? 'bg-red-500 text-white' : 'bg-white/5 text-ink-faint'
                  }`}
                >{t.sell}</button>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-xs text-ink-faint block mb-1">
                  Amount ({t.tola}) — max: {localizeNum((action === 'buy' ? maxBuyable : maxSellable).toFixed(2))}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  max={action === 'buy' ? maxBuyable : maxSellable}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 text-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2">
                {QUICK_AMOUNTS.map(qa => (
                  <button
                    key={qa}
                    onClick={() => setAmount(String(qa))}
                    className="flex-1 py-2.5 rounded-lg bg-white/10 text-white text-xs font-medium cursor-pointer hover:bg-white/20 transition-colors"
                  >{localizeNum(qa)}</button>
                ))}
                <button
                  onClick={() => setAmount(String(action === 'buy' ? maxBuyable : maxSellable))}
                  className="flex-1 py-2.5 rounded-lg bg-white/10 text-gold-200 text-xs font-medium cursor-pointer hover:bg-white/20 transition-colors"
                >{t.all}</button>
              </div>

              {/* Trade summary + button */}
              {parsedAmount > 0 && (
                <p className="text-xs text-ink-faint text-center">
                  {action === 'buy' ? t.cost : t.proceeds}: Rs {localizeNum(Math.round(tradeTotal).toLocaleString('en-IN'))}
                </p>
              )}
              <button
                onClick={handleTrade}
                disabled={!canTrade}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  canTrade
                    ? action === 'buy'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                      : 'bg-red-500 text-white hover:bg-red-400'
                    : 'bg-white/10 text-ink-faint cursor-not-allowed'
                }`}
              >{action === 'buy' ? t.buy : t.sell} {parsedAmount > 0 ? `${localizeNum(parsedAmount)} ${t.tola}` : ''}</button>
            </>
          )}
        </div>

        {/* Trade history */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-2">{t.recentTrades}</p>
          {trades.length === 0 ? (
            <p className="text-sm text-ink-faint text-center py-2">{t.noTradesYet}</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trades.slice(0, 10).map((trade, i) => (
                <div key={`${trade.date}-${trade.action}-${i}`} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${trade.action === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.action === 'buy' ? t.buy : t.sell}
                    </span>
                    <span className="text-white">{localizeNum(trade.tola)} {t.tola}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-faint">Rs {localizeNum(Math.round(trade.total).toLocaleString('en-IN'))}</span>
                    <span className="text-ink-faint/50 ml-2">{trade.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset button */}
        <div className="text-center pt-2 pb-8">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-xs text-ink-faint/50 underline cursor-pointer"
            >{t.resetPortfolio}</button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-ink-faint">{t.confirmReset}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => { onReset(); setShowReset(false); }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold cursor-pointer hover:bg-red-500/30"
                >{t.confirm}</button>
                <button
                  onClick={() => setShowReset(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-ink-faint text-xs cursor-pointer hover:bg-white/20"
                >{t.cancel}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
