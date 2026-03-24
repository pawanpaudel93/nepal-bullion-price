import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { ForexData } from '../../types.js';

const URLS = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
  'https://latest.currency-api.pages.dev/v1/currencies/usd.json',
];

export async function fetchFawazahmed0(): Promise<ForexData> {
  let lastError: Error | undefined;

  for (const url of URLS) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });
      if (!res.ok) continue;

      const data = await res.json();
      const npr = data?.usd?.npr;
      if (typeof npr !== 'number' || isNaN(npr) || npr <= 0) continue;

      return {
        usdToNpr: npr,
        updatedAt: data.date ?? new Date().toISOString().split('T')[0],
      };
    } catch (e) {
      lastError = e as Error;
    }
  }

  throw lastError ?? new Error('fawazahmed0 currency API failed');
}
