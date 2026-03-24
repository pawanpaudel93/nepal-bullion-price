import type { NepalGoldPrice, NepalSilverPrice, LiveMetalPrice } from 'nepal-bullion-price';
import { TaxBreakdown } from './TaxBreakdown';
import { formatNpr } from '../utils/format';

interface PriceCardProps {
  title: string;
  icon: React.ReactNode;
  symbol: 'XAU' | 'XAG';
  nepalPrice: NepalGoldPrice | NepalSilverPrice | null;
  livePrice: LiveMetalPrice | null;
  shimmerClass: string;
}

function getNepalPriceTola(price: NepalGoldPrice | NepalSilverPrice): number {
  return 'hallmark' in price ? price.hallmark : price.price;
}

export function PriceCard({ title, icon, symbol, nepalPrice, livePrice, shimmerClass }: PriceCardProps) {
  const nepalTola = nepalPrice ? getNepalPriceTola(nepalPrice) : null;
  const liveTola = livePrice?.perTola.consumerPrice ?? null;

  const premium =
    nepalTola && livePrice
      ? (((nepalTola - livePrice.perTola.basePrice) / livePrice.perTola.basePrice) * 100).toFixed(1)
      : null;

  return (
    <div className="bg-white dark:bg-ink-light/80 rounded-2xl card-glow border border-black/[0.04] dark:border-white/[0.06] p-7 transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="font-display text-xl font-bold text-ink dark:text-white">{title}</h2>
        </div>
        {premium !== null && (
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-gold-50 dark:bg-gold-700/20 text-gold-600 dark:text-gold-400 border border-gold-200/60 dark:border-gold-700/30">
            +{premium}%
          </span>
        )}
      </div>

      {/* Nepal FENEGOSIDA Price — The Hero */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint dark:text-ink-faint mb-2">
          Nepal Price &middot; FENEGOSIDA
        </p>
        {nepalPrice ? (
          <>
            <p className={`font-mono text-4xl font-bold tracking-tight ${shimmerClass}`}>
              {nepalTola !== null ? formatNpr(nepalTola) : '\u2014'}
            </p>
            <p className="text-xs text-ink-muted dark:text-ink-faint mt-2 flex items-center gap-2">
              <span>per tola</span>
              <span className="w-1 h-1 rounded-full bg-ink-faint/40" />
              <span>{nepalPrice.source}</span>
              {nepalPrice.isStale && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  stale
                </span>
              )}
            </p>
          </>
        ) : (
          <p className="text-xl text-ink-faint">Unavailable</p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-black/[0.06] dark:via-white/[0.06] to-transparent mb-6" />

      {/* Live International Price */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint dark:text-ink-faint mb-2">
          Live Est. Consumer Price
        </p>
        {livePrice ? (
          <>
            <p className="font-mono text-2xl font-semibold text-ink dark:text-white tracking-tight">
              {liveTola !== null ? formatNpr(liveTola) : '\u2014'}
            </p>
            <div className="flex items-center gap-2 text-xs text-ink-muted dark:text-ink-faint mt-2">
              <span className="font-mono">{symbol}/USD ${livePrice.raw.usdPerOz.toFixed(2)}</span>
              <span className="w-1 h-1 rounded-full bg-ink-faint/40" />
              <span className="font-mono">NPR {livePrice.raw.usdToNpr.toFixed(2)}</span>
              {livePrice.isStale && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  stale
                </span>
              )}
            </div>
            <TaxBreakdown breakdown={livePrice.perTola} rates={livePrice.rates} />
          </>
        ) : (
          <p className="text-lg text-ink-faint">Unavailable</p>
        )}
      </div>
    </div>
  );
}
