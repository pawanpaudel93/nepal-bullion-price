import type { NepalGoldPrice, NepalSilverPrice, LiveMetalPrice } from 'nepal-bullion-price';
import NumberFlow from '@number-flow/react';
import { EstimateBreakdown } from './EstimateBreakdown';
import { SourceLink } from './SourceLink';
import { useLocale, type Translations } from '../i18n';
import { TrendSection } from './TrendSection';
import { ShareButton } from './ShareButton';
import { getMarketMood } from '../utils/marketMood';
import { FunComparison } from './FunComparison';
import { getRateFreshness } from '../utils/dates';

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

function RateDateLabel({ priceDate }: { priceDate: string | null }) {
  const { t, formatDate } = useLocale();
  const freshness = getRateFreshness(priceDate);
  const label = freshness === 'pending' || freshness === 'holiday' ? t.latestRate : t.todayRate;
  return (
    <>
      <p className="text-[11px] ne-text-boost font-semibold uppercase tracking-[0.18em] text-ink-muted dark:text-ink-faint mb-3 flex items-center gap-2">
        {freshness === 'today' ? (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        ) : null}
        <span>{label}{priceDate ? ` · ${formatDate(priceDate)}` : null}</span>
      </p>
      {freshness === 'pending' || freshness === 'holiday' ? (
        <p className="-mt-1.5 mb-3 text-[12px] text-amber-700 dark:text-amber-300/90 font-light">
          {freshness === 'pending' ? t.ratePending : t.rateHoliday}
        </p>
      ) : null}
    </>
  );
}

function StaleBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-normal">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      {label}
    </span>
  );
}

export function PriceCard({ title, icon, symbol, nepalPrice, livePrice, delay = '0ms' }: PriceCardProps) {
  const { lang, t, numberLocale, localizeNum } = useLocale();
  const nepalTola = nepalPrice ? getNepalPriceTola(nepalPrice) : null;
  const liveTola = livePrice?.perTola.estimatedPrice ?? null;
  const isNe = lang === 'ne';

  const displayPrice = nepalTola;
  const displayPrev = nepalPrice?.previousPrice ?? null;
  const tajabi = nepalPrice && 'tajabi' in nepalPrice ? nepalPrice.tajabi : null;
  const premiumPct = nepalTola && liveTola ? ((nepalTola - liveTola) / liveTola) * 100 : null;
  const fmt = (v: number) => localizeNum(v.toLocaleString(numberLocale));

  return (
    <div
      className="glass-card rounded-3xl p-8 transition-shadow duration-300 animate-fade-up"
      style={{ animationDelay: delay }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="font-display text-2xl font-bold text-ink dark:text-white tracking-tight">{title}</h2>
          {nepalPrice && nepalPrice.previousPrice != null && nepalTola !== null ? (() => {
            const mood = getMarketMood(nepalTola, nepalPrice.previousPrice);
            return mood ? (
              <span
                className="text-xl animate-fade-up"
                title={t[mood.labelKey as keyof typeof t] as string}
                aria-label={t[mood.labelKey as keyof typeof t] as string}
              >
                {mood.emoji}
              </span>
            ) : null;
          })() : null}
        </div>
        {nepalPrice && nepalTola !== null ? (
          <ShareButton
            metal={symbol === 'XAU' ? 'gold' : 'silver'}
            metalName={title}
            price={nepalTola}
            previousPrice={nepalPrice.previousPrice}
            history={nepalPrice.history ?? null}
            date={nepalPrice.date}
            priceDate={nepalPrice.priceDate}
          />
        ) : null}
      </div>

      {/* Nepal FENEGOSIDA Price — The Hero */}
      <div className="mb-8">
        <RateDateLabel priceDate={nepalPrice?.priceDate ?? null} />
        {nepalPrice ? (
          <>
            <p className={`font-mono text-[40px] sm:text-[42px] font-bold leading-none tracking-tighter ${symbol === 'XAU' ? 'text-gold-color-shimmer' : 'text-silver-color-shimmer'}`}>
              {displayPrice !== null ? (
                <>Rs {isNe ? fmt(displayPrice) : <NumberFlow value={displayPrice} locales={numberLocale} />}</>
              ) : '\u2014'}
            </p>
            {displayPrev != null && displayPrice !== null ? (
              <PriceChange current={displayPrice} previous={displayPrev} t={t} numberLocale={numberLocale} localizeNum={localizeNum} />
            ) : null}
            <p className="text-[13px] text-ink-muted dark:text-ink-faint mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-light">
              <span>{t.perTola}</span>
              <span className="w-[3px] h-[3px] rounded-full bg-ink-faint/40" aria-hidden="true" />
              <SourceLink name={nepalPrice.source} />
              {nepalPrice.isStale ? <StaleBadge label={t.stale} /> : null}
            </p>
            {tajabi ? (
              <p className="text-[13px] text-ink-muted dark:text-ink-faint mt-1.5 font-light">
                {t.tajabi} <span className="font-mono font-normal text-ink dark:text-white/90">Rs {fmt(tajabi)}</span>
              </p>
            ) : null}
            {nepalTola !== null ? (
              <FunComparison price={nepalTola} metal={symbol === 'XAU' ? 'gold' : 'silver'} />
            ) : null}
            {nepalPrice.history && nepalPrice.history.length >= 2 ? (
              <TrendSection history={nepalPrice.history} color={symbol === 'XAU' ? 'gold' : 'silver'} />
            ) : null}
          </>
        ) : (
          <p className="text-xl text-ink-faint font-light">{t.unavailable}</p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-ink/6 dark:via-white/6 to-transparent mb-8" />

      {/* Live International Price */}
      <div>
        <p className="text-[11px] ne-text-boost font-semibold uppercase tracking-[0.18em] text-ink-muted dark:text-ink-faint mb-3">
          {t.liveEstimatedPrice} <span className="normal-case tracking-normal font-light">· {t.perTola}</span>
        </p>
        {livePrice ? (
          <>
            <p className="font-mono text-2xl font-semibold text-ink dark:text-white tracking-tight">
              {liveTola !== null ? (
                <>Rs {isNe ? localizeNum(liveTola.toLocaleString(numberLocale)) : <NumberFlow value={liveTola} locales={numberLocale} />}</>
              ) : '\u2014'}
            </p>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-muted dark:text-ink-faint mt-2.5 font-light">
              <span className="font-mono font-normal">{symbol}/USD ${localizeNum(livePrice.raw.usdPerOz.toFixed(2))}</span>
              <span className="w-[3px] h-[3px] rounded-full bg-ink-faint/30" />
              <span className="font-mono font-normal">NPR {localizeNum(livePrice.raw.usdToNpr.toFixed(2))}</span>
              {livePrice.isStale ? <StaleBadge label={t.stale} /> : null}
            </div>
            {premiumPct !== null && Math.abs(premiumPct) >= 0.05 ? (
              <p className="text-[12px] text-ink-muted dark:text-ink-faint mt-2 font-light">
                {(premiumPct > 0 ? t.premiumAbove : t.premiumBelow).replace('{pct}', localizeNum(Math.abs(premiumPct).toFixed(1)))}
              </p>
            ) : null}
            <EstimateBreakdown breakdown={livePrice.perTola} rates={livePrice.rates} />
          </>
        ) : (
          <p className="text-lg text-ink-faint font-light">{t.unavailable}</p>
        )}
      </div>
    </div>
  );
}

function PriceChange({ current, previous, t, numberLocale, localizeNum }: { current: number; previous: number; t: Translations; numberLocale: string; localizeNum: (v: string | number) => string }) {
  const diff = current - previous;
  if (diff === 0) return null;

  const pct = ((diff / previous) * 100).toFixed(1);
  const isUp = diff > 0;

  return (
    <p
      className={`flex items-center gap-1.5 mt-2 text-[12px] font-light ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}
      aria-label={`${isUp ? t.priceUp : t.priceDown} Rs ${previous.toLocaleString(numberLocale)} to Rs ${current.toLocaleString(numberLocale)}, ${isUp ? '+' : ''}${pct}%`}
    >
      <svg viewBox="0 0 12 12" fill="currentColor" className={`w-3 h-3 shrink-0 ${isUp ? '' : 'rotate-180'}`} aria-hidden="true">
        <path d="M6 2l4 5H2l4-5z" />
      </svg>
      <span className="text-ink-muted dark:text-ink-faint font-mono font-normal">Rs {localizeNum(previous.toLocaleString(numberLocale))}</span>
      <span className="text-ink-muted dark:text-ink-faint">→</span>
      <span className="font-mono font-normal">Rs {localizeNum(current.toLocaleString(numberLocale))}</span>
      <span>({isUp ? '+' : ''}{localizeNum(pct)}%)</span>
    </p>
  );
}

