import { describe, it, expect } from 'vitest';
import { calculateTaxBreakdown } from '../calculator.js';

describe('calculateTaxBreakdown', () => {
  const rates = {
    customDuty: 0.10,
    bankMargin: 0.005,
    dealerMargin: 0.005,
    luxuryTax: 0.02,
  };

  it('matches the spec worked example', () => {
    const result = calculateTaxBreakdown(4333.40, 150.07, rates);
    expect(result.basePrice).toBe(243867);
    expect(result.customDuty).toBe(24387);
    expect(result.bankMargin).toBe(1341);
    expect(result.dealerMargin).toBe(1348);
    expect(result.estimatedPrice).toBe(270943);
    expect(result.luxuryTax).toBe(5419);
    expect(result.consumerPrice).toBe(276362);
  });

  it('works with different rates', () => {
    const customRates = { ...rates, customDuty: 0.06 };
    const result = calculateTaxBreakdown(2000, 130, customRates);
    expect(result.basePrice).toBeGreaterThan(0);
    expect(result.consumerPrice).toBeGreaterThan(result.estimatedPrice);
  });

  it('handles zero price', () => {
    const result = calculateTaxBreakdown(0, 150, rates);
    expect(result.basePrice).toBe(0);
    expect(result.consumerPrice).toBe(0);
  });
});
