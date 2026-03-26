import type { NepalGoldPrice, NepalSilverPrice, LiveMetalPrice } from 'nepal-bullion-price';
import NumberFlow from '@number-flow/react';
import { TaxBreakdown } from './TaxBreakdown';
import { getSourceUrl } from '../utils/sourceUrls';

interface PriceCardProps {
  title: string;
  icon: React.ReactNode;
  symbol: 'XAU' | 'XAG';
  nepalPrice: NepalGoldPrice | NepalSilverPrice | null;
  livePrice: LiveMetalPrice | null;
  shimmerClass: string;
  delay?: string;
}

function getNepalPriceTola(price: NepalGoldPrice | NepalSilverPrice): number {
  return 'hallmark' in price ? price.hallmark : price.price;
}

export function PriceCard({ title, icon, symbol, nepalPrice, livePrice, shimmerClass, delay = '0ms' }: PriceCardProps) {
  const nepalTola = nepalPrice ? getNepalPriceTola(nepalPrice) : null;
  const liveTola = livePrice?.perTola.estimatedPrice ?? null;

  return (
    <div
      className="glass-card rounded-3xl p-8 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: delay }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        {icon}
        <h2 className="font-display text-2xl font-bold text-ink dark:text-white tracking-tight">{title}</h2>
      </div>

      {/* Nepal FENEGOSIDA Price — The Hero */}
      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-3">
          Nepal Price &middot; FENEGOSIDA
        </p>
        {nepalPrice ? (
          <>
            <p className={`font-mono text-[42px] font-bold leading-none tracking-tighter ${shimmerClass}`}>
              {nepalTola !== null ? (
                <>Rs <NumberFlow value={nepalTola} locales="en-IN" /></>
              ) : '\u2014'}
            </p>
            <p className="text-[13px] text-ink-muted dark:text-ink-faint mt-3 flex items-center gap-2.5 font-light">
              <span>per tola</span>
              <span className="w-[3px] h-[3px] rounded-full bg-ink-faint/30" />
              <SourceLink name={nepalPrice.source} />
              {nepalPrice.isStale ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  stale
                </span>
              ) : null}
            </p>
          </>
        ) : (
          <p className="text-xl text-ink-faint font-light">Unavailable</p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-ink/6 dark:via-white/6 to-transparent mb-8" />

      {/* Live International Price */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-3">
          Live Est. Price
        </p>
        {livePrice ? (
          <>
            <p className="font-mono text-2xl font-semibold text-ink dark:text-white tracking-tight">
              {liveTola !== null ? (
                <>Rs <NumberFlow value={liveTola} locales="en-IN" /></>
              ) : '\u2014'}
            </p>
            <div className="flex items-center gap-2.5 text-[12px] text-ink-muted dark:text-ink-faint mt-2.5 font-light">
              <span className="font-mono font-normal">{symbol}/USD ${livePrice.raw.usdPerOz.toFixed(2)}</span>
              <span className="w-[3px] h-[3px] rounded-full bg-ink-faint/30" />
              <span className="font-mono font-normal">NPR {livePrice.raw.usdToNpr.toFixed(2)}</span>
              {livePrice.isStale ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  stale
                </span>
              ) : null}
            </div>
            <TaxBreakdown breakdown={livePrice.perTola} rates={livePrice.rates} />
          </>
        ) : (
          <p className="text-lg text-ink-faint font-light">Unavailable</p>
        )}
      </div>
    </div>
  );
}

function SourceLink({ name }: { name: string }) {
  const url = getSourceUrl(name);
  if (!url) return <span>{name}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-ink-faint/30 underline-offset-2 hover:text-ink dark:hover:text-white transition-colors duration-200"
    >
      {name}
    </a>
  );
}
