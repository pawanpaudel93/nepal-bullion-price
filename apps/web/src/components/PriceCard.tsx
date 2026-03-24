import type { NepalGoldPrice, NepalSilverPrice, LiveMetalPrice } from 'nepal-bullion-price';
import { TaxBreakdown } from './TaxBreakdown';
import { formatNpr } from '../utils/format';

interface PriceCardProps {
  title: string;
  icon: string;
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>

      {/* Nepal FENEGOSIDA Price */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          Nepal Price (FENEGOSIDA)
        </p>
        {nepalPrice ? (
          <>
            <p className={`text-3xl font-bold ${accentColor}`}>
              {nepalTola !== null ? formatNpr(nepalTola) : '\u2014'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              per tola &middot; {nepalPrice.source}
              {nepalPrice.isStale && (
                <span className="ml-1 text-amber-500">(stale)</span>
              )}
            </p>
          </>
        ) : (
          <p className="text-xl text-gray-400">Unavailable</p>
        )}
      </div>

      {/* Live International Price */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          Live Est. Consumer Price
        </p>
        {livePrice ? (
          <>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {liveTola !== null ? formatNpr(liveTola) : '\u2014'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {symbol}/USD: ${livePrice.raw.usdPerOz.toFixed(2)} &middot; Rate: {livePrice.raw.usdToNpr.toFixed(2)}
              {livePrice.isStale && (
                <span className="ml-1 text-amber-500">(stale)</span>
              )}
            </p>
            <TaxBreakdown breakdown={livePrice.perTola} rates={livePrice.rates} />
          </>
        ) : (
          <p className="text-lg text-gray-400">Unavailable</p>
        )}
      </div>

      {/* Premium Indicator */}
      {premium !== null && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Nepal premium over international</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{premium}%</p>
        </div>
      )}
    </div>
  );
}
