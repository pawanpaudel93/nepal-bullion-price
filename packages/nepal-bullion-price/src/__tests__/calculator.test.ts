import { describe, it, expect } from 'vitest';
import { calculateTaxBreakdown } from '../calculator.js';

describe('calculateTaxBreakdown', () => {
  const rates = {
    customsDuty: 0.10,
    bankMargin: 0.005,
    dealerMargin: 0.015,
  };

  it('matches the expected calculation', () => {
    const result = calculateTaxBreakdown(4508.90, 150.49, rates);
    expect(result.basePrice).toBe(254454);
    expect(result.customsDuty).toBe(25445);
    expect(result.bankMargin).toBe(1399);
    expect(result.dealerMargin).toBe(4219);
    expect(result.estimatedPrice).toBe(285517);
  });

  it('works with different rates', () => {
    const customRates = { ...rates, customsDuty: 0.06 };
    const result = calculateTaxBreakdown(2000, 130, customRates);
    expect(result.basePrice).toBeGreaterThan(0);
    expect(result.estimatedPrice).toBeGreaterThan(result.basePrice);
  });

  it('handles zero price', () => {
    const result = calculateTaxBreakdown(0, 150, rates);
    expect(result.basePrice).toBe(0);
    expect(result.estimatedPrice).toBe(0);
  });
});
