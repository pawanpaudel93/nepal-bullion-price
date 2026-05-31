import { describe, it, expect } from 'vitest';
import { calculateEstimateBreakdown } from '../calculator.js';

describe('calculateEstimateBreakdown', () => {
  const rates = {
    customsDuty: 0.20,
    importerMargin: 0.005,
    dealerMargin: 0.005,
    estimatedAdjustment: 0.008,
  };

  it('matches the expected calculation', () => {
    const result = calculateEstimateBreakdown(4508.90, 150.49, rates);
    expect(result.basePrice).toBe(254454);
    expect(result.customsDuty).toBe(50891);
    expect(result.importerMargin).toBe(1527);
    expect(result.dealerMargin).toBe(1534);
    expect(result.estimatedAdjustment).toBe(2467);
    expect(result.estimatedPrice).toBe(310873);
  });

  it('works with different rates', () => {
    const customRates = { ...rates, customsDuty: 0.06 };
    const result = calculateEstimateBreakdown(2000, 130, customRates);
    expect(result.basePrice).toBeGreaterThan(0);
    expect(result.estimatedPrice).toBeGreaterThan(result.basePrice);
  });

  it('handles zero price', () => {
    const result = calculateEstimateBreakdown(0, 150, rates);
    expect(result.basePrice).toBe(0);
    expect(result.estimatedPrice).toBe(0);
  });
});
