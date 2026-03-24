import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { ForexData } from '../../types.js';

export async function fetchExchangeRateApi(): Promise<ForexData> {
  const res = await fetch('https://open.er-api.com/v6/latest/USD', {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`exchangerate-api returned ${res.status}`);

  const data = await res.json();
  const npr = data?.rates?.NPR;
  if (typeof npr !== 'number' || isNaN(npr) || npr <= 0) {
    throw new Error('NPR rate not found or invalid in exchangerate-api response');
  }

  return {
    usdToNpr: npr,
    updatedAt: data.time_last_update_unix
      ? new Date(data.time_last_update_unix * 1000).toISOString()
      : new Date().toISOString(),
  };
}
