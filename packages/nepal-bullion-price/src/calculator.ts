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

  const customDuty = Math.round(basePrice * rates.customDuty);
  const afterCustoms = basePrice + customDuty;

  const bankMargin = Math.round(afterCustoms * rates.bankMargin);
  const afterBank = afterCustoms + bankMargin;

  const dealerMargin = Math.round(afterBank * rates.dealerMargin);
  const estimatedPrice = afterBank + dealerMargin;

  const luxuryTax = Math.round(estimatedPrice * rates.luxuryTax);
  const consumerPrice = estimatedPrice + luxuryTax;

  return {
    basePrice,
    customDuty,
    bankMargin,
    dealerMargin,
    estimatedPrice,
    luxuryTax,
    consumerPrice,
  };
}
