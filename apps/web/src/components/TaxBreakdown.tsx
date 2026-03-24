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
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-200 cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
      >
        {isOpen ? 'Hide' : 'Show'} breakdown
        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-3 text-sm bg-paper-warm dark:bg-ink/50 rounded-xl p-4 border border-black/[0.04] dark:border-white/[0.04]">
          <div className="space-y-2 text-ink-muted dark:text-ink-faint">
            <Row label="International base" value={breakdown.basePrice} />
            <Row label={`Custom duty ${(rates.customDuty * 100).toFixed(0)}%`} value={breakdown.customDuty} prefix="+" />
            <Row label={`Bank margin ${(rates.bankMargin * 100).toFixed(1)}%`} value={breakdown.bankMargin} prefix="+" />
            <Row label={`Dealer margin ${(rates.dealerMargin * 100).toFixed(1)}%`} value={breakdown.dealerMargin} prefix="+" />
          </div>
          <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] my-2.5" />
          <div className="flex justify-between font-medium text-sm text-ink dark:text-white">
            <span>Est. FENEGOSIDA</span>
            <span className="font-mono">{formatNpr(breakdown.estimatedPrice)}</span>
          </div>
          <div className="mt-2 text-ink-muted dark:text-ink-faint">
            <Row label={`Luxury tax ${(rates.luxuryTax * 100).toFixed(0)}%`} value={breakdown.luxuryTax} prefix="+" />
          </div>
          <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] my-2.5" />
          <div className="flex justify-between font-bold text-sm text-ink dark:text-white">
            <span>Consumer price</span>
            <span className="font-mono">{formatNpr(breakdown.consumerPrice)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, prefix }: { label: string; value: number; prefix?: string }) {
  return (
    <div className="flex justify-between text-[13px]">
      <span>{prefix && <span className="text-ink-faint mr-0.5">{prefix}</span>}{label}</span>
      <span className="font-mono tabular-nums">{formatNpr(value)}</span>
    </div>
  );
}
