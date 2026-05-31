import type { Config, EstimateRates, MetalRates } from './types.js';
import { DEFAULT_CACHE_TTL_MS } from './constants.js';

const DEFAULT_GOLD_RATES: EstimateRates = {
  customsDuty: 0.20,
  importerMargin: 0.005,
  dealerMargin: 0.005,
  estimatedAdjustment: 0.008,
};

const DEFAULT_SILVER_RATES: EstimateRates = {
  customsDuty: 0.20,
  importerMargin: 0.005,
  dealerMargin: 0.005,
  estimatedAdjustment: 0.030,
};

const DEFAULT_CONFIG: Config = {
  rates: { gold: { ...DEFAULT_GOLD_RATES }, silver: { ...DEFAULT_SILVER_RATES } },
  apiKeys: {},
  cacheTtl: DEFAULT_CACHE_TTL_MS,
};

let currentConfig: Config = structuredClone(DEFAULT_CONFIG);

export function getConfig(): Config {
  return currentConfig;
}

/**
 * Configure module-level singleton state.
 *
 * NOTE: This mutates shared module state. All callers in the same process
 * see the updated config immediately. For isolated configs (e.g. tests or
 * multi-tenant use), call `resetConfig()` between uses or use `resetCaches()`
 * after changing `cacheTtl` to pick up the new TTL.
 *
 * @limitation Singleton — not suitable for concurrent multi-tenant use without
 *   explicit reset/refresh calls between tenants.
 */
export function configure(partial: {
  rates?: { gold?: Partial<EstimateRates>; silver?: Partial<EstimateRates> };
  apiKeys?: Config['apiKeys'];
  cacheTtl?: number;
}): void {
  if (partial.rates) {
    if (partial.rates.gold) {
      currentConfig.rates.gold = { ...currentConfig.rates.gold, ...partial.rates.gold };
    }
    if (partial.rates.silver) {
      currentConfig.rates.silver = { ...currentConfig.rates.silver, ...partial.rates.silver };
    }
  }
  if (partial.apiKeys) {
    currentConfig.apiKeys = { ...currentConfig.apiKeys, ...partial.apiKeys };
  }
  if (partial.cacheTtl !== undefined) {
    currentConfig.cacheTtl = partial.cacheTtl;
  }
}

export function resetConfig(): void {
  currentConfig = structuredClone(DEFAULT_CONFIG);
}
