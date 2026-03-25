import type { TaxBreakdown, TaxRates } from './types.js';
import { GRAMS_PER_TROY_OZ, GRAMS_PER_TOLA } from './constants.js';

export function calculateTaxBreakdown(
  usdPerOz: number,
  usdToNpr: number,
  rates: TaxRates,
): TaxBreakdown {
  const basePrice = Math.round(
    (usdPerOz / GRAMS_PER_TROY_OZ) * GRAMS_PER_TOLA * usdToNpr,
  );

  const customsDuty = Math.round(basePrice * rates.customsDuty);
  const afterCustoms = basePrice + customsDuty;

  const bankMargin = Math.round(afterCustoms * rates.bankMargin);
  const afterBank = afterCustoms + bankMargin;

  const dealerMargin = Math.round(afterBank * rates.dealerMargin);
  const estimatedPrice = afterBank + dealerMargin;

  return {
    basePrice,
    customsDuty,
    bankMargin,
    dealerMargin,
    estimatedPrice,
  };
}
