import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { LivePriceData } from '../../types.js';

export async function fetchGoldApiCom(symbol: 'XAU' | 'XAG'): Promise<LivePriceData> {
  const res = await fetch(`https://api.gold-api.com/price/${symbol}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`gold-api.com returned ${res.status}`);

  const data = await res.json();
  if (!data.price || typeof data.price !== 'number') {
    throw new Error('Invalid response from gold-api.com');
  }

  return {
    priceUsd: data.price,
    symbol,
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  };
}
