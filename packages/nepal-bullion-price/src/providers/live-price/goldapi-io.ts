import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { LivePriceData } from '../../types.js';

export async function fetchGoldApiIo(
  symbol: 'XAU' | 'XAG',
  apiKey: string,
): Promise<LivePriceData> {
  const res = await fetch(`https://www.goldapi.io/api/${symbol}/USD`, {
    headers: { 'x-access-token': apiKey },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`goldapi.io returned ${res.status}`);

  const data = await res.json();
  if (!data.price || typeof data.price !== 'number') {
    throw new Error('Invalid response from goldapi.io');
  }

  return {
    priceUsd: data.price,
    symbol,
    updatedAt: data.timestamp
      ? new Date(data.timestamp * 1000).toISOString()
      : new Date().toISOString(),
  };
}
