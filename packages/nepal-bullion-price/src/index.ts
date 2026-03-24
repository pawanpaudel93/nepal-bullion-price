import { Cache } from './cache.js';
import { getConfig, configure, resetConfig } from './config.js';
import { tryProviders } from './fallback.js';
import { calculateTaxBreakdown } from './calculator.js';
import { fetchFenegosida } from './providers/nepal-price/fenegosida.js';
import { fetchAshesh } from './providers/nepal-price/ashesh.js';
import { fetchHamropatro } from './providers/nepal-price/hamropatro.js';
import { fetchGoldApi } from './providers/live-price/gold-api.js';
import { fetchSwissquote } from './providers/live-price/swissquote.js';
import { fetchGoldApiIo } from './providers/live-price/goldapi-io.js';
import { fetchNrb } from './providers/forex/nrb.js';
import { fetchFawazahmed0 } from './providers/forex/fawazahmed0.js';
import { fetchExchangeRateApi } from './providers/forex/exchangerate-api.js';
import type {
  NepalGoldPrice, NepalSilverPrice, LiveMetalPrice,
  AllPrices, NepalPriceData, LivePriceData, ForexData,
} from './types.js';

// Caches — use lazy getter so configure() changes are respected
function createCaches() {
  const ttl = getConfig().cacheTtl;
  return {
    nepal: new Cache<{ data: NepalPriceData; source: string }>(ttl),
    live: new Cache<{ data: LivePriceData; source: string }>(ttl),
    forex: new Cache<{ data: ForexData; source: string }>(ttl),
  };
}
let caches = createCaches();

// Call after configure() to pick up new TTL
export function refreshCaches(): void {
  caches = createCaches();
}

function getNepalProviders() {
  return [
    { name: 'fenegosida.org', fetch: fetchFenegosida },
    { name: 'ashesh.com.np', fetch: fetchAshesh },
    { name: 'hamropatro.com', fetch: fetchHamropatro },
  ];
}

function getLiveProviders(symbol: 'XAU' | 'XAG') {
  const config = getConfig();
  const providers = [
    { name: 'gold-api.com', fetch: () => fetchGoldApi(symbol) },
    { name: 'swissquote', fetch: () => fetchSwissquote(symbol) },
  ];
  if (config.apiKeys.goldApiIo) {
    providers.push({
      name: 'goldapi.io',
      fetch: () => fetchGoldApiIo(symbol, config.apiKeys.goldApiIo!),
    });
  }
  return providers;
}

function getForexProviders() {
  return [
    { name: 'nrb.org.np', fetch: fetchNrb },
    { name: 'fawazahmed0', fetch: fetchFawazahmed0 },
    { name: 'exchangerate-api', fetch: fetchExchangeRateApi },
  ];
}

async function fetchNepalPrices(): Promise<{ data: NepalPriceData; source: string; isStale: boolean }> {
  const cached = caches.nepal.get('nepal');
  if (cached) return { ...cached, isStale: false };

  const result = await tryProviders(getNepalProviders());
  if (result) {
    caches.nepal.set('nepal', result);
    return { data: result.data, source: result.source, isStale: false };
  }

  const stale = caches.nepal.getStale('nepal');
  if (stale) return { ...stale, isStale: true };

  throw new Error('All Nepal price providers failed and no cached data available');
}

async function fetchLivePrice(symbol: 'XAU' | 'XAG'): Promise<{ data: LivePriceData; source: string; isStale: boolean }> {
  const cacheKey = `live-${symbol}`;
  const cached = caches.live.get(cacheKey);
  if (cached) return { ...cached, isStale: false };

  const result = await tryProviders(getLiveProviders(symbol));
  if (result) {
    caches.live.set(cacheKey, result);
    return { data: result.data, source: result.source, isStale: false };
  }

  const stale = caches.live.getStale(cacheKey);
  if (stale) return { ...stale, isStale: true };

  throw new Error(`All live price providers failed for ${symbol} and no cached data available`);
}

async function fetchForex(): Promise<{ data: ForexData; source: string; isStale: boolean }> {
  const cached = caches.forex.get('forex');
  if (cached) return { ...cached, isStale: false };

  const result = await tryProviders(getForexProviders());
  if (result) {
    caches.forex.set('forex', result);
    return { data: result.data, source: result.source, isStale: false };
  }

  const stale = caches.forex.getStale('forex');
  if (stale) return { ...stale, isStale: true };

  throw new Error('All forex providers failed and no cached data available');
}

export async function getNepalGoldPrice(): Promise<NepalGoldPrice> {
  const { data, source, isStale } = await fetchNepalPrices();
  return {
    hallmark: data.goldHallmark,
    tajabi: data.goldTajabi,
    unit: 'tola',
    perGram10: data.goldHallmarkPerGram10,
    source,
    date: data.date,
    updatedAt: new Date().toISOString(),
    isStale,
  };
}

export async function getNepalSilverPrice(): Promise<NepalSilverPrice> {
  const { data, source, isStale } = await fetchNepalPrices();
  return {
    price: data.silver,
    unit: 'tola',
    perGram10: data.silverPerGram10,
    source,
    date: data.date,
    updatedAt: new Date().toISOString(),
    isStale,
  };
}

async function buildLivePrice(symbol: 'XAU' | 'XAG'): Promise<LiveMetalPrice> {
  const [live, forex] = await Promise.all([
    fetchLivePrice(symbol),
    fetchForex(),
  ]);

  const config = getConfig();
  const breakdown = calculateTaxBreakdown(
    live.data.priceUsd,
    forex.data.usdToNpr,
    config.rates,
  );

  return {
    raw: {
      usdPerOz: live.data.priceUsd,
      usdToNpr: forex.data.usdToNpr,
    },
    perTola: breakdown,
    rates: { ...config.rates },
    source: live.source,
    updatedAt: live.data.updatedAt,
    isStale: live.isStale || forex.isStale,
  };
}

export async function getLiveGoldPrice(): Promise<LiveMetalPrice> {
  return buildLivePrice('XAU');
}

export async function getLiveSilverPrice(): Promise<LiveMetalPrice> {
  return buildLivePrice('XAG');
}

export async function getAllPrices(): Promise<AllPrices> {
  const [nepalData, liveGold, liveSilver] = await Promise.allSettled([
    fetchNepalPrices(),
    buildLivePrice('XAU'),
    buildLivePrice('XAG'),
  ]);

  const nepal = nepalData.status === 'fulfilled' ? nepalData.value : null;

  return {
    gold: {
      nepal: nepal ? {
        hallmark: nepal.data.goldHallmark,
        tajabi: nepal.data.goldTajabi,
        unit: 'tola' as const,
        perGram10: nepal.data.goldHallmarkPerGram10,
        source: nepal.source,
        date: nepal.data.date,
        updatedAt: new Date().toISOString(),
        isStale: nepal.isStale,
      } : null,
      live: liveGold.status === 'fulfilled' ? liveGold.value : null,
    },
    silver: {
      nepal: nepal ? {
        price: nepal.data.silver,
        unit: 'tola' as const,
        perGram10: nepal.data.silverPerGram10,
        source: nepal.source,
        date: nepal.data.date,
        updatedAt: new Date().toISOString(),
        isStale: nepal.isStale,
      } : null,
      live: liveSilver.status === 'fulfilled' ? liveSilver.value : null,
    },
  };
}

// Re-exports
export { configure, resetConfig } from './config.js';
export type {
  NepalGoldPrice, NepalSilverPrice, LiveMetalPrice,
  TaxBreakdown, TaxRates, AllPrices, Config,
} from './types.js';
