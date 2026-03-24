import { describe, it, expect, beforeEach } from 'vitest';
import { getConfig, configure, resetConfig } from '../config.js';

describe('config', () => {
  beforeEach(() => resetConfig());

  it('returns default config', () => {
    const config = getConfig();
    expect(config.rates.customDuty).toBe(0.10);
    expect(config.rates.bankMargin).toBe(0.005);
    expect(config.rates.dealerMargin).toBe(0.005);
    expect(config.rates.luxuryTax).toBe(0.02);
    expect(config.cacheTtl).toBe(300_000);
    expect(config.apiKeys).toEqual({});
  });

  it('merges partial config', () => {
    configure({ rates: { customDuty: 0.06 } });
    const config = getConfig();
    expect(config.rates.customDuty).toBe(0.06);
    expect(config.rates.bankMargin).toBe(0.005);
  });

  it('sets API keys', () => {
    configure({ apiKeys: { goldApiIo: 'test-key' } });
    expect(getConfig().apiKeys.goldApiIo).toBe('test-key');
  });
});
