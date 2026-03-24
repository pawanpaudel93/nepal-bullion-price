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
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-200 cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
      >
        {isOpen ? 'Hide' : 'Show'} breakdown
        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 text-[13px] bg-paper-warm/80 dark:bg-ink/40 rounded-2xl p-5 border border-ink/[0.03] dark:border-white/[0.03] backdrop-blur-sm">
            <div className="space-y-2.5 text-ink-muted dark:text-ink-faint">
              <Row label="International base" value={breakdown.basePrice} />
              <Row label={`Custom duty ${(rates.customDuty * 100).toFixed(0)}%`} value={breakdown.customDuty} prefix="+" />
              <Row label={`Bank margin ${(rates.bankMargin * 100).toFixed(1)}%`} value={breakdown.bankMargin} prefix="+" />
              <Row label={`Dealer margin ${(rates.dealerMargin * 100).toFixed(1)}%`} value={breakdown.dealerMargin} prefix="+" />
            </div>
            <div className="h-px bg-ink/[0.04] dark:bg-white/[0.04] my-3" />
            <div className="flex justify-between font-semibold text-ink dark:text-white">
              <span>Est. Shop Price</span>
              <span className="font-mono tabular-nums">{formatNpr(breakdown.estimatedPrice)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-dashed border-ink/[0.06] dark:border-white/[0.06] text-ink-faint dark:text-ink-faint">
              <Row label={`+ Luxury tax ${(rates.luxuryTax * 100).toFixed(0)}% (on billing)`} value={breakdown.luxuryTax} />
              <div className="flex justify-between mt-1">
                <span className="text-[11px]">With tax</span>
                <span className="font-mono tabular-nums text-[11px]">{formatNpr(breakdown.consumerPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, prefix }: { label: string; value: number; prefix?: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-light">{prefix ? <span className="text-ink-faint mr-1">{prefix}</span> : null}{label}</span>
      <span className="font-mono tabular-nums">{formatNpr(value)}</span>
    </div>
  );
}
