import type { Config, TaxRates } from './types.js';
import { DEFAULT_CACHE_TTL_MS } from './constants.js';

const DEFAULT_RATES: TaxRates = {
  customDuty: 0.10,
  bankMargin: 0.005,
  dealerMargin: 0.005,
  luxuryTax: 0.02,
};

const DEFAULT_CONFIG: Config = {
  rates: { ...DEFAULT_RATES },
  apiKeys: {},
  cacheTtl: DEFAULT_CACHE_TTL_MS,
};

let currentConfig: Config = structuredClone(DEFAULT_CONFIG);

export function getConfig(): Config {
  return structuredClone(currentConfig);
}

/**
 * Configure module-level singleton state.
 *
 * NOTE: This mutates shared module state. All callers in the same process
 * see the updated config immediately. For isolated configs (e.g. tests or
 * multi-tenant use), call `resetConfig()` between uses or use `refreshCaches()`
 * after changing `cacheTtl` to pick up the new TTL.
 *
 * @limitation Singleton — not suitable for concurrent multi-tenant use without
 *   explicit reset/refresh calls between tenants.
 */
export function configure(partial: {
  rates?: Partial<TaxRates>;
  apiKeys?: Config['apiKeys'];
  cacheTtl?: number;
}): void {
  if (partial.rates) {
    currentConfig.rates = { ...currentConfig.rates, ...partial.rates };
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
