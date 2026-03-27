import { describe, it, expect, beforeEach } from 'vitest';
import { getConfig, configure, resetConfig } from '../config.js';

describe('config', () => {
  beforeEach(() => resetConfig());

  it('returns default config', () => {
    const config = getConfig();
    expect(config.rates.gold.customsDuty).toBe(0.10);
    expect(config.rates.gold.bankMargin).toBe(0.005);
    expect(config.rates.gold.dealerMargin).toBe(0.005);
    expect(config.rates.gold.marketPremium).toBe(0.008);
    expect(config.rates.silver.customsDuty).toBe(0.10);
    expect(config.rates.silver.bankMargin).toBe(0.005);
    expect(config.rates.silver.dealerMargin).toBe(0.005);
    expect(config.rates.silver.marketPremium).toBe(0.030);
    expect(config.cacheTtl).toBe(300_000);
    expect(config.apiKeys).toEqual({});
  });

  it('merges partial config', () => {
    configure({ rates: { gold: { customsDuty: 0.06 } } });
    const config = getConfig();
    expect(config.rates.gold.customsDuty).toBe(0.06);
    expect(config.rates.gold.bankMargin).toBe(0.005);
    expect(config.rates.silver.customsDuty).toBe(0.10);
  });

  it('sets API keys', () => {
    configure({ apiKeys: { goldApiIo: 'test-key' } });
    expect(getConfig().apiKeys.goldApiIo).toBe('test-key');
  });
});
