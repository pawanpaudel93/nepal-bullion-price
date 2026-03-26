import type { NepalGoldPrice, NepalSilverPrice, LiveMetalPrice } from 'nepal-bullion-price';
import NumberFlow from '@number-flow/react';
import { TaxBreakdown } from './TaxBreakdown';
import { getSourceUrl } from '../utils/sourceUrls';
import { useLocale, type Translations } from '../i18n';

interface PriceCardProps {
  title: string;
  icon: React.ReactNode;
  symbol: 'XAU' | 'XAG';
  nepalPrice: NepalGoldPrice | NepalSilverPrice | null;
  livePrice: LiveMetalPrice | null;
  delay?: string;
}

function getNepalPriceTola(price: NepalGoldPrice | NepalSilverPrice): number {
  return 'hallmark' in price ? price.hallmark : price.price;
}

export function PriceCard({ title, icon, symbol, nepalPrice, livePrice, delay = '0ms' }: PriceCardProps) {
  const { t, numberLocale } = useLocale();
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
        <p className="text-[10px] ne-text-boost font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-3">
          {t.nepalPrice} &middot; {t.fenegosida}
        </p>
        {nepalPrice ? (
          <>
            <p className={`font-mono text-[42px] font-bold leading-none tracking-tighter ${symbol === 'XAU' ? 'text-gold-color-shimmer' : 'text-silver-color-shimmer'}`}>
              {nepalTola !== null ? (
                <>Rs <NumberFlow value={nepalTola} locales={numberLocale} /></>
              ) : '\u2014'}
            </p>
            {nepalPrice.previousPrice != null && nepalTola !== null ? (
              <PriceChange current={nepalTola} previous={nepalPrice.previousPrice} t={t} numberLocale={numberLocale} />
            ) : null}
            <p className="text-[13px] text-ink-muted dark:text-ink-faint mt-3 flex items-center gap-2.5 font-light">
              <span>{t.perTola}</span>
              <span className="w-[3px] h-[3px] rounded-full bg-ink-faint/30" />
              <SourceLink name={nepalPrice.source} />
              {nepalPrice.isStale ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t.stale}
                </span>
              ) : null}
            </p>
          </>
        ) : (
          <p className="text-xl text-ink-faint font-light">{t.unavailable}</p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-ink/6 dark:via-white/6 to-transparent mb-8" />

      {/* Live International Price */}
      <div>
        <p className="text-[10px] ne-text-boost font-medium uppercase tracking-[0.2em] text-ink-faint dark:text-ink-faint mb-3">
          {t.liveEstimatedPrice}
        </p>
        {livePrice ? (
          <>
            <p className="font-mono text-2xl font-semibold text-ink dark:text-white tracking-tight">
              {liveTola !== null ? (
                <>Rs <NumberFlow value={liveTola} locales={numberLocale} /></>
              ) : '\u2014'}
            </p>
            <div className="flex items-center gap-2.5 text-[12px] text-ink-muted dark:text-ink-faint mt-2.5 font-light">
              <span className="font-mono font-normal">{symbol}/USD ${livePrice.raw.usdPerOz.toFixed(2)}</span>
              <span className="w-[3px] h-[3px] rounded-full bg-ink-faint/30" />
              <span className="font-mono font-normal">NPR {livePrice.raw.usdToNpr.toFixed(2)}</span>
              {livePrice.isStale ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t.stale}
                </span>
              ) : null}
            </div>
            <TaxBreakdown breakdown={livePrice.perTola} rates={livePrice.rates} />
          </>
        ) : (
          <p className="text-lg text-ink-faint font-light">{t.unavailable}</p>
        )}
      </div>
    </div>
  );
}

function PriceChange({ current, previous, t, numberLocale }: { current: number; previous: number; t: Translations; numberLocale: string }) {
  const diff = current - previous;
  if (diff === 0) return null;

  const pct = ((diff / previous) * 100).toFixed(1);
  const isUp = diff > 0;

  return (
    <p
      className={`flex items-center gap-1.5 mt-2 text-[12px] font-light ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}
      aria-label={`${isUp ? t.priceUp : t.priceDown} Rs ${Math.abs(diff).toLocaleString(numberLocale)}, ${pct}% ${t.from} Rs ${previous.toLocaleString(numberLocale)}`}
    >
      <svg viewBox="0 0 12 12" fill="currentColor" className={`w-3 h-3 shrink-0 ${isUp ? '' : 'rotate-180'}`} aria-hidden="true">
        <path d="M6 2l4 5H2l4-5z" />
      </svg>
      <span className="font-mono font-normal">{isUp ? '+' : ''}{diff.toLocaleString(numberLocale)}</span>
      <span>({pct}%)</span>
      <span className="text-ink-muted dark:text-ink-faint">{t.yesterday}</span>
      <span className="text-ink dark:text-white/70 font-mono font-normal">Rs {previous.toLocaleString(numberLocale)}</span>
    </p>
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
