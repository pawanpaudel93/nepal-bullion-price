import { describe, it, expect } from 'vitest';
import { calculateTaxBreakdown } from '../calculator.js';

describe('calculateTaxBreakdown', () => {
  const rates = {
    customsDuty: 0.10,
    bankMargin: 0.005,
    dealerMargin: 0.005,
  };

  it('matches the expected calculation', () => {
    const result = calculateTaxBreakdown(4333.40, 150.07, rates);
    expect(result.basePrice).toBe(243867);
    expect(result.customsDuty).toBe(24387);
    expect(result.bankMargin).toBe(1341);
    expect(result.dealerMargin).toBe(1348);
    expect(result.estimatedPrice).toBe(270943);
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
