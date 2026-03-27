import { useState } from 'react';
import type { TaxBreakdown as TaxBreakdownType, TaxRates } from 'nepal-bullion-price';
import NumberFlow from '@number-flow/react';
import { ChevronDownIcon } from './Icons';
import { useLocale } from '../i18n';

interface TaxBreakdownProps {
  breakdown: TaxBreakdownType;
  rates: TaxRates;
}

export function TaxBreakdown({ breakdown, rates }: TaxBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, numberLocale } = useLocale();

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-200 cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
      >
        {isOpen ? t.hideBreakdown : t.showBreakdown}
        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 text-[13px] bg-paper-warm/80 dark:bg-ink/40 rounded-2xl p-5 border border-ink/[0.03] dark:border-white/[0.03] backdrop-blur-sm">
            <div className="space-y-2.5 text-ink-muted dark:text-ink-faint">
              <Row label={t.internationalBase} value={breakdown.basePrice} numberLocale={numberLocale} />
              <Row label={`${t.customsDuty} ${(rates.customsDuty * 100).toFixed(0)}%`} value={breakdown.customsDuty} prefix="+" numberLocale={numberLocale} />
              <Row label={`${t.bankMargin} ${(rates.bankMargin * 100).toFixed(1)}%`} value={breakdown.bankMargin} prefix="+" numberLocale={numberLocale} />
              <Row label={`${t.dealerMargin} ${(rates.dealerMargin * 100).toFixed(1)}%`} value={breakdown.dealerMargin} prefix="+" numberLocale={numberLocale} />
              <Row label={`${t.marketPremium} ${(rates.marketPremium * 100).toFixed(1)}%`} value={breakdown.marketPremium} prefix="+" numberLocale={numberLocale} />
            </div>
            <div className="h-px bg-ink/[0.04] dark:bg-white/[0.04] my-3" />
            <div className="flex justify-between font-semibold text-ink dark:text-white">
              <span>{t.estimatedRate}</span>
              <span className="font-mono tabular-nums">Rs <NumberFlow value={breakdown.estimatedPrice} locales={numberLocale} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, prefix, numberLocale }: { label: string; value: number; prefix?: string; numberLocale: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-light">{prefix ? <span className="text-ink-faint mr-1">{prefix}</span> : null}{label}</span>
      <span className="font-mono tabular-nums">Rs <NumberFlow value={value} locales={numberLocale} /></span>
    </div>
  );
}
