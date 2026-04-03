import { useState } from 'react';
import { useLocale } from '../i18n';
import { useGoldTrader } from '../hooks/useGoldTrader';
import { GoldTraderGame } from './GoldTraderGame';

interface Props {
  goldPricePerTola: number | null;
}

export function GoldTraderCard({ goldPricePerTola }: Props) {
  const { t, localizeNum } = useLocale();
  const {
    cash, goldTola, trades, portfolioHistory, hasTradedToday,
    executeTrade, resetPortfolio, getPortfolioValue, getPnL,
  } = useGoldTrader();
  const [trading, setTrading] = useState(false);

  const currentPrice = goldPricePerTola ?? 0;
  const portfolioValue = getPortfolioValue(currentPrice);
  const { pnl } = getPnL(currentPrice);
  const pnlColor = pnl >= 0 ? 'text-emerald-500' : 'text-red-500';
  const pnlSign = pnl >= 0 ? '+' : '';

  return (
    <>
      <div className="glass-card rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-1">{t.goldTrader}</p>
            <p className="text-[13px] text-ink-muted dark:text-ink-faint">{t.virtualTrading}</p>
            {currentPrice > 0 && (
              <div className="mt-1 space-y-0.5">
                <p className="text-[12px] text-ink-faint">
                  {t.portfolio}: <strong className="text-ink dark:text-white">Rs {localizeNum(Math.round(portfolioValue).toLocaleString('en-IN'))}</strong>
                </p>
                <p className={`text-[11px] font-semibold ${pnlColor}`}>
                  {pnlSign}Rs {localizeNum(Math.abs(Math.round(pnl)).toLocaleString('en-IN'))}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setTrading(true)}
            disabled={!currentPrice}
            className="px-6 py-3 rounded-full bg-blue-500 text-white font-bold text-[14px] cursor-pointer hover:bg-blue-400 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.trade}
          </button>
        </div>
      </div>

      {trading && currentPrice > 0 && (
        <GoldTraderGame
          cash={cash}
          goldTola={goldTola}
          trades={trades}
          portfolioHistory={portfolioHistory}
          hasTradedToday={hasTradedToday}
          currentPrice={currentPrice}
          getPortfolioValue={getPortfolioValue}
          getPnL={getPnL}
          onTrade={executeTrade}
          onReset={resetPortfolio}
          onClose={() => setTrading(false)}
        />
      )}
    </>
  );
}
