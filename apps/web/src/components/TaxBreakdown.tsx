import { useState } from 'react';
import type { TaxBreakdown as TaxBreakdownType, TaxRates } from 'nepal-bullion-price';
import { formatNpr } from '../utils/format';

interface TaxBreakdownProps {
  breakdown: TaxBreakdownType;
  rates: TaxRates;
}

export function TaxBreakdown({ breakdown, rates }: TaxBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        {isOpen ? 'Hide' : 'Show'} tax breakdown
      </button>
      {isOpen && (
        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between">
            <span>Base (international)</span>
            <span>{formatNpr(breakdown.basePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Custom duty ({(rates.customDuty * 100).toFixed(1)}%)</span>
            <span>{formatNpr(breakdown.customDuty)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Bank margin ({(rates.bankMargin * 100).toFixed(1)}%)</span>
            <span>{formatNpr(breakdown.bankMargin)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Dealer margin ({(rates.dealerMargin * 100).toFixed(1)}%)</span>
            <span>{formatNpr(breakdown.dealerMargin)}</span>
          </div>
          <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1">
            <span>Estimated FENEGOSIDA</span>
            <span>{formatNpr(breakdown.estimatedPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Luxury tax ({(rates.luxuryTax * 100).toFixed(1)}%)</span>
            <span>{formatNpr(breakdown.luxuryTax)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-700 pt-1">
            <span>Consumer price</span>
            <span>{formatNpr(breakdown.consumerPrice)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
