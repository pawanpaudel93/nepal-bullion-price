import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { ForexData } from '../../types.js';

export async function fetchNrb(): Promise<ForexData> {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 7);
  const url = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=10&from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`NRB API returned ${res.status}`);

  const json = await res.json();
  const payload = json?.data?.payload;
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('No NRB forex data available for the last 7 days');
  }

  const entry = payload[payload.length - 1];
  const rates = entry.rates;
  if (!Array.isArray(rates)) throw new Error('Invalid rates data from NRB response');
  const usd = rates?.find(
    (r: { currency: { iso3: string } }) => r.currency.iso3 === 'USD',
  );
  if (!usd) throw new Error('USD rate not found in NRB response');

  const usdToNpr = parseFloat(usd.sell);
  if (isNaN(usdToNpr) || usdToNpr <= 0) {
    throw new Error(`Invalid USD/NPR rate from NRB: ${usd.sell}`);
  }

  return {
    usdToNpr,
    updatedAt: entry.published_on ?? to.toISOString().split('T')[0],
  };
}
