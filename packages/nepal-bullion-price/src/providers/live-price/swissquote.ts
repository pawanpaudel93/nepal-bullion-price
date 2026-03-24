import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { LivePriceData } from '../../types.js';

export async function fetchSwissquote(symbol: 'XAU' | 'XAG'): Promise<LivePriceData> {
  const res = await fetch(
    `https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${symbol}/USD`,
    { signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS) },
  );
  if (!res.ok) throw new Error(`swissquote returned ${res.status}`);

  const data = await res.json();
  const profiles = data?.[0]?.spreadProfilePrices;
  if (!Array.isArray(profiles) || profiles.length === 0) {
    throw new Error('Invalid response from swissquote');
  }

  const first = profiles[0];
  const midPrice = (first.bid + first.ask) / 2;

  return {
    priceUsd: midPrice,
    symbol,
    updatedAt: new Date(data[0].ts).toISOString(),
  };
}
