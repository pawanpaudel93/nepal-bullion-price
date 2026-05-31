import type { EstimateBreakdown, EstimateRates } from './types.js';
import { GRAMS_PER_TROY_OZ, GRAMS_PER_TOLA } from './constants.js';

export function calculateEstimateBreakdown(
  usdPerOz: number,
  usdToNpr: number,
  rates: EstimateRates,
): EstimateBreakdown {
  const basePrice = Math.round(
    (usdPerOz / GRAMS_PER_TROY_OZ) * GRAMS_PER_TOLA * usdToNpr,
  );

  const customsDuty = Math.round(basePrice * rates.customsDuty);
  const afterCustoms = basePrice + customsDuty;

  const importerMargin = Math.round(afterCustoms * rates.importerMargin);
  const afterImporter = afterCustoms + importerMargin;

  const dealerMargin = Math.round(afterImporter * rates.dealerMargin);
  const afterDealer = afterImporter + dealerMargin;

  const estimatedAdjustment = Math.round(afterDealer * rates.estimatedAdjustment);
  const estimatedPrice = afterDealer + estimatedAdjustment;

  return {
    basePrice,
    customsDuty,
    importerMargin,
    dealerMargin,
    estimatedAdjustment,
    estimatedPrice,
  };
}
