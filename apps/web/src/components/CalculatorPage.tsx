import { useState, useMemo } from 'react';
import { useLocale } from '../i18n';
import { FunComparison } from './FunComparison';

interface CalculatorPageProps {
  goldPricePerTola: number | null;
  silverPricePerTola: number | null;
}

type Metal = 'gold' | 'silver';
type Unit = 'tola' | 'gram';

const GRAMS_PER_TOLA = 11.6638;

export function CalculatorPage({ goldPricePerTola, silverPricePerTola }: CalculatorPageProps) {
  const { t, numberLocale } = useLocale();
  const [metal, setMetal] = useState<Metal>('gold');
  const [unit, setUnit] = useState<Unit>('tola');
  const [weightInput, setWeightInput] = useState('1');
  const [mode, setMode] = useState<'weight' | 'value'>('weight');
  const [valueInput, setValueInput] = useState('');

  const pricePerTola = metal === 'gold' ? goldPricePerTola : silverPricePerTola;
  const pricePerUnit = pricePerTola
    ? unit === 'tola' ? pricePerTola : Math.round(pricePerTola / GRAMS_PER_TOLA)
    : null;

  const result = useMemo(() => {
    if (!pricePerUnit) return null;
    if (mode === 'weight') {
      const w = parseFloat(weightInput);
      if (isNaN(w) || w <= 0) return null;
      return { weight: w, value: Math.round(w * pricePerUnit) };
    } else {
      const v = parseFloat(valueInput);
      if (isNaN(v) || v <= 0) return null;
      const w = v / pricePerUnit;
      return { weight: Math.round(w * 100) / 100, value: Math.round(v) };
    }
  }, [mode, weightInput, valueInput, pricePerUnit]);

  function handleWeightChange(val: string) {
    setWeightInput(val);
    setMode('weight');
  }

  function handleValueChange(val: string) {
    setValueInput(val);
    setMode('value');
  }

  if (!goldPricePerTola && !silverPricePerTola) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-ink-faint">{t.unavailable}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        {/* Metal toggle */}
        <div className="flex rounded-full border border-ink/8 dark:border-white/8 overflow-hidden w-fit mb-6">
          {(['gold', 'silver'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetal(m)}
              className={`px-4 py-1.5 text-[12px] font-medium tracking-wide cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none ${
                metal === m
                  ? 'bg-ink dark:bg-white text-white dark:text-ink'
                  : 'text-ink-muted dark:text-ink-faint hover:bg-ink/5 dark:hover:bg-white/5'
              }`}
            >
              {m === 'gold' ? t.gold : t.silver}
            </button>
          ))}
        </div>

        {/* Input fields */}
        <div className="flex items-end gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-faint mb-1.5 block">
              {t.weight}
            </label>
            <div className="flex rounded-xl border border-ink/10 dark:border-white/10 overflow-hidden">
              <input
                type="text"
                inputMode="decimal"
                value={mode === 'weight' ? weightInput : (result ? String(result.weight) : '')}
                onChange={e => handleWeightChange(e.target.value)}
                placeholder={t.enterWeight}
                className="flex-1 px-3 py-3 text-[16px] bg-transparent text-ink dark:text-white outline-none"
              />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as Unit)}
                className="px-3 py-3 bg-ink/3 dark:bg-white/5 border-l border-ink/10 dark:border-white/10 text-[13px] text-ink-muted dark:text-ink-faint outline-none cursor-pointer"
              >
                <option value="tola">{t.tola}</option>
                <option value="gram">{t.gram}</option>
              </select>
            </div>
          </div>

          <div className="text-xl text-ink-faint pb-3">⇄</div>

          <div className="flex-1">
            <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink-faint mb-1.5 block">
              {t.value}
            </label>
            <div className="flex rounded-xl border border-ink/10 dark:border-white/10 overflow-hidden">
              <span className="px-3 py-3 bg-ink/3 dark:bg-white/5 border-r border-ink/10 dark:border-white/10 text-[13px] text-ink-muted dark:text-ink-faint">Rs</span>
              <input
                type="text"
                inputMode="decimal"
                value={mode === 'value' ? valueInput : (result ? result.value.toLocaleString(numberLocale) : '')}
                onChange={e => handleValueChange(e.target.value.replace(/,/g, ''))}
                placeholder={t.enterValue}
                className="flex-1 px-3 py-3 text-[16px] bg-transparent text-ink dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rate info */}
        {pricePerUnit ? (
          <p className="text-[12px] text-ink-faint mb-4">
            {(t.basedOnRate as string)
              .replace('{price}', pricePerUnit.toLocaleString(numberLocale))
              .replace('{unit}', unit === 'tola' ? t.tola : t.gram)}
          </p>
        ) : null}

        {/* Fun comparison for calculated value */}
        {result && result.value > 0 ? (
          <FunComparison price={result.value} metal={metal} />
        ) : null}
      </div>
    </div>
  );
}
