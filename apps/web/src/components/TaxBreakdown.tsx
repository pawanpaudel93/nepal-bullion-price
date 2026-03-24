import { useState } from 'react';
import type { TaxBreakdown as TaxBreakdownType, TaxRates } from 'nepal-bullion-price';
import { formatNpr } from '../utils/format';
import { ChevronDownIcon } from './Icons';

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
        className="inline-flex items-center gap-1 text-xs font-medium text-secondary dark:text-blue-400 hover:text-secondary/80 dark:hover:text-blue-300 cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
      >
        {isOpen ? 'Hide' : 'Show'} tax breakdown
        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-2.5 space-y-1.5 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/40">
          <Row label="Base (international)" value={breakdown.basePrice} />
          <Row label={`+ Custom duty (${(rates.customDuty * 100).toFixed(1)}%)`} value={breakdown.customDuty} />
          <Row label={`+ Bank margin (${(rates.bankMargin * 100).toFixed(1)}%)`} value={breakdown.bankMargin} />
          <Row label={`+ Dealer margin (${(rates.dealerMargin * 100).toFixed(1)}%)`} value={breakdown.dealerMargin} />
          <div className="flex justify-between font-medium border-t border-slate-200 dark:border-slate-700 pt-1.5">
            <span>Est. FENEGOSIDA</span>
            <span className="tabular-nums">{formatNpr(breakdown.estimatedPrice)}</span>
          </div>
          <Row label={`+ Luxury tax (${(rates.luxuryTax * 100).toFixed(1)}%)`} value={breakdown.luxuryTax} />
          <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1.5 text-primary dark:text-white">
            <span>Consumer price</span>
            <span className="tabular-nums">{formatNpr(breakdown.consumerPrice)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="tabular-nums">{formatNpr(value)}</span>
    </div>
  );
}
