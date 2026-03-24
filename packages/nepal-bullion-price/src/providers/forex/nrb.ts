import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { ForexData } from '../../types.js';

export async function fetchNrb(): Promise<ForexData> {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1&from=${today}&to=${today}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`NRB API returned ${res.status}`);

  const json = await res.json();
  const payload = json?.data?.payload;
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('No NRB forex data for today');
  }

  const rates = payload[0].rates;
  const usd = rates?.find(
    (r: { currency: { iso3: string } }) => r.currency.iso3 === 'USD',
  );
  if (!usd) throw new Error('USD rate not found in NRB response');

  return {
    usdToNpr: parseFloat(usd.buy),
    updatedAt: payload[0].published_on ?? today,
  };
}
