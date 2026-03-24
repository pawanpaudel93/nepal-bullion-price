import type { NepalGoldPrice, NepalSilverPrice, LiveMetalPrice } from 'nepal-bullion-price';
import { TaxBreakdown } from './TaxBreakdown';
import { formatNpr } from '../utils/format';

interface PriceCardProps {
  title: string;
  icon: React.ReactNode;
  symbol: 'XAU' | 'XAG';
  nepalPrice: NepalGoldPrice | NepalSilverPrice | null;
  livePrice: LiveMetalPrice | null;
  accentColor: string;
}

function getNepalPriceTola(price: NepalGoldPrice | NepalSilverPrice): number {
  return 'hallmark' in price ? price.hallmark : price.price;
}

export function PriceCard({ title, icon, symbol, nepalPrice, livePrice, accentColor }: PriceCardProps) {
  const nepalTola = nepalPrice ? getNepalPriceTola(nepalPrice) : null;
  const liveTola = livePrice?.perTola.consumerPrice ?? null;

  const premium =
    nepalTola && livePrice
      ? (((nepalTola - livePrice.perTola.basePrice) / livePrice.perTola.basePrice) * 100).toFixed(1)
      : null;

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3 mb-5">
        {icon}
        <h2 className="text-lg font-semibold text-primary dark:text-white">{title}</h2>
      </div>

      {/* Nepal FENEGOSIDA Price */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
          Nepal Price (FENEGOSIDA)
        </p>
        {nepalPrice ? (
          <>
            <p className={`text-3xl font-bold tracking-tight ${accentColor}`}>
              {nepalTola !== null ? formatNpr(nepalTola) : '\u2014'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              per tola &middot; {nepalPrice.source}
              {nepalPrice.isStale && (
                <span className="ml-1.5 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                  stale
                </span>
              )}
            </p>
          </>
        ) : (
          <p className="text-xl text-slate-400">Unavailable</p>
        )}
      </div>

      {/* Live International Price */}
      <div className="border-t border-slate-100 dark:border-slate-700/60 pt-5">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
          Live Est. Consumer Price
        </p>
        {livePrice ? (
          <>
            <p className="text-xl font-semibold text-primary dark:text-white">
              {liveTola !== null ? formatNpr(liveTola) : '\u2014'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              {symbol}/USD: ${livePrice.raw.usdPerOz.toFixed(2)} &middot; NPR: {livePrice.raw.usdToNpr.toFixed(2)}
              {livePrice.isStale && (
                <span className="ml-1.5 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                  stale
                </span>
              )}
            </p>
            <TaxBreakdown breakdown={livePrice.perTola} rates={livePrice.rates} />
          </>
        ) : (
          <p className="text-lg text-slate-400">Unavailable</p>
        )}
      </div>

      {/* Premium Indicator */}
      {premium !== null && (
        <div className="mt-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700/40">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nepal premium</p>
          <p className="text-xl font-bold text-primary dark:text-white mt-0.5">{premium}%</p>
        </div>
      )}
    </div>
  );
}
