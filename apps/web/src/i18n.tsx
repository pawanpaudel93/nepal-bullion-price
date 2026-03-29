import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';

export type Lang = 'en' | 'ne';

const translations = {
  en: {
    liveRates: 'Live Rates',
    nepalBullion: 'Nepal Bullion',
    refresh: 'Refresh',
    updating: 'Updating',
    nepalPrice: 'Today\'s Price',
    fenegosida: 'FENEGOSIDA',
    perTola: 'per tola',
    yesterday: 'yesterday',
    liveEstimatedPrice: 'Live Estimated Price',
    showBreakdown: 'Show breakdown',
    hideBreakdown: 'Hide breakdown',
    internationalBase: 'International base',
    customsDuty: 'Customs duty',
    bankMargin: 'Bank margin',
    dealerMargin: 'Dealer margin',
    marketPremium: 'Market premium',
    estimatedRate: 'Estimated Rate',
    sources: 'Sources',
    nepalGold: 'Nepal Gold',
    liveGold: 'Live Gold',
    nepalSilver: 'Nepal Silver',
    liveSilver: 'Live Silver',
    gold: 'Gold',
    silver: 'Silver',
    unavailable: 'Unavailable',
    fetchingPrices: 'Fetching latest prices',
    somethingWrong: 'Something went wrong',
    tryRefreshing: 'Try refreshing the page',
    reload: 'Reload',
    clearCacheReload: 'Clear cache & reload',
    stale: 'stale',
    updated: 'Updated',
    priceUp: 'Price increased by',
    priceDown: 'Price decreased by',
    from: 'from',
    // Narratives
    weeklyTrend: '7-Day Trend',
    biggest_jump: 'Biggest jump this week',
    biggest_drop: 'Biggest drop this week',
    weekly_high: 'Weekly high',
    weekly_low: 'Lowest this week',
    streak_rising: 'Rising {n} days straight',
    streak_falling: 'Falling {n} days',
    // Share
    share: 'Share',
    save: 'Save',
    shareText: '{metal}: Rs {price}/tola ({change}) — Nepal Bullion Price',
  },
  ne: {
    liveRates: 'प्रत्यक्ष दरहरू',
    nepalBullion: 'नेपाल बुलियन',
    refresh: 'रिफ्रेस',
    updating: 'अपडेट हुँदैछ',
    nepalPrice: 'आजको मूल्य',
    fenegosida: 'फेनेगोसिडा',
    perTola: 'प्रति तोला',
    yesterday: 'हिजो',
    liveEstimatedPrice: 'प्रत्यक्ष अनुमानित मूल्य',
    showBreakdown: 'विवरण देखाउनुहोस्',
    hideBreakdown: 'विवरण लुकाउनुहोस्',
    internationalBase: 'अन्तर्राष्ट्रिय आधार',
    customsDuty: 'भन्सार शुल्क',
    bankMargin: 'बैंक मार्जिन',
    dealerMargin: 'डिलर मार्जिन',
    marketPremium: 'बजार प्रिमियम',
    estimatedRate: 'अनुमानित दर',
    sources: 'स्रोतहरू',
    nepalGold: 'नेपाल सुन',
    liveGold: 'प्रत्यक्ष सुन',
    nepalSilver: 'नेपाल चाँदी',
    liveSilver: 'प्रत्यक्ष चाँदी',
    gold: 'सुन',
    silver: 'चाँदी',
    unavailable: 'उपलब्ध छैन',
    fetchingPrices: 'नवीनतम मूल्यहरू ल्याउँदैछ',
    somethingWrong: 'केहि गलत भयो',
    tryRefreshing: 'पृष्ठ रिफ्रेस गर्नुहोस्',
    reload: 'पुन: लोड',
    clearCacheReload: 'क्यास खाली गरी पुन: लोड',
    stale: 'पुरानो',
    updated: 'अपडेट',
    priceUp: 'मूल्य बढ्यो',
    priceDown: 'मूल्य घट्यो',
    from: 'बाट',
    // Narratives
    weeklyTrend: '७-दिने प्रवृत्ति',
    biggest_jump: 'यस हप्ताको सबैभन्दा ठूलो वृद्धि',
    biggest_drop: 'यस हप्ताको सबैभन्दा ठूलो गिरावट',
    weekly_high: 'हप्ताको उच्च',
    weekly_low: 'हप्ताको न्यून',
    streak_rising: '{n} दिनदेखि बढ्दो',
    streak_falling: '{n} दिनदेखि घट्दो',
    // Share
    share: 'सेयर',
    save: 'सेभ',
    shareText: '{metal}: रू {price} प्रति तोला ({change}) — नेपाल बुलियन मूल्य',
  },
} as const;

export type Translations = typeof translations.en;

interface LocaleContextValue {
  lang: Lang;
  t: Translations;
  numberLocale: string;
  toggleLang: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getStoredLang(): Lang {
  try {
    const stored = localStorage.getItem('lang');
    if (stored === 'ne') return 'ne';
  } catch { /* unavailable */ }
  return 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'ne' : 'en';
      try { localStorage.setItem('lang', next); } catch { /* quota */ }
      return next;
    });
  }, []);

  const value = useMemo<LocaleContextValue>(() => ({
    lang,
    t: translations[lang],
    numberLocale: 'en-IN', // always use Indian/Nepali lakh grouping (2,85,600)
    toggleLang,
  }), [lang, toggleLang]);

  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
