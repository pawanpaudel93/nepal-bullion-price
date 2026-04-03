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
    // News
    prices: 'Prices',
    news: 'News',
    allLanguages: 'All',
    english: 'EN',
    nepali: 'NP',
    allCategories: 'All',
    noNews: 'No news found',
    loadMore: 'Load more',
    hoursAgo: '{n}h ago',
    minutesAgo: '{n}m ago',
    justNow: 'Just now',
    // Market Mood
    moodOnFire: 'On Fire',
    moodActive: 'Active',
    moodCalm: 'Calm',
    moodQuiet: 'Quiet',
    // Fun Comparisons
    thatsRoughly: "That's roughly",
    compMomo: 'momo plates',
    compIphone: 'iPhone 16 Pros',
    compEnfield: 'Royal Enfields',
    compRent: 'months rent in KTM',
    compFlight: 'KTM→Delhi flights',
    compChiya: 'cups of chiya',
    compEBC: 'EBC treks',
    compMovie: 'movie tickets',
    compMicroBus: 'micro bus rides',
    // Milestones
    milestoneCrossed: '{metal} crossed Rs {price}!',
    milestoneATH: 'New all-time high!',
    milestoneContext: 'Up from Rs {previous} yesterday',
    // Streaks
    streakGettingStarted: 'Getting started',
    streakOnARoll: 'On a roll',
    streakDedicated: 'Dedicated',
    streakLegend: 'Legend',
    dayStreak: '{n} day streak',
    bestStreak: 'Best: {n} days',
    badgesEarned: 'Badges Earned',
    badgePriceChecker: 'Price Checker',
    badgeGoldWatcher: 'Gold Watcher',
    badgeSilverSentinel: 'Silver Sentinel',
    badgeBullionBaron: 'Bullion Baron',
    badgeDiamondHands: 'Diamond Hands',
    badgeMilestoneWitness: 'Milestone Witness',
    badgeATHHunter: 'ATH Hunter',
    badgeLocked: 'Locked',
    // Play tab
    play: 'Play',
    // Prediction Game
    predictTomorrow: 'Predict Tomorrow',
    willGoldGoUpOrDown: 'Will gold go up or down tomorrow?',
    up: 'Up',
    down: 'Down',
    goldWillGoUp: 'Gold will go UP',
    goldWillGoDown: 'Gold will go DOWN',
    checkBackTomorrow: 'Check back tomorrow to see if you were right!',
    youWereRight: 'You were right!',
    notThisTime: 'Not this time',
    goldWentUp: 'Gold went up Rs {amount} ({pct}%)',
    goldWentDown: 'Gold went down Rs {amount} ({pct}%)',
    goldFlat: 'Gold stayed flat — your prediction counts!',
    predictionStreak: 'Prediction streak',
    accuracy: 'Accuracy',
    yesterdayPrediction: "Yesterday's prediction",
    // Gold Rush
    goldRush: 'Gold Rush',
    tapGoldCoins: 'Tap gold coins! Avoid silver.',
    gameOver: 'Game Over',
    score: 'Score',
    highScore: 'High Score',
    newHighScore: 'New High Score!',
    playAgain: 'Play Again',
    level: 'Level',
    go: 'Go!',
    // Price Crash
    priceCrash: 'Price Crash',
    tapCashOut: 'Cash out before it crashes!',
    cashOut: 'Cash Out',
    launch: 'Launch',
    crashed: 'Crashed!',
    crashedAt: 'Crashed at',
    cashedOut: 'Cashed out!',
    youCashed: 'You cashed',
    bestMultiplier: 'Best',
    newBest: 'New best!',
    // Gold Quiz
    goldQuiz: 'Gold Quiz',
    testYourKnowledge: 'Test your bullion knowledge!',
    question: 'Question',
    correct: 'Correct!',
    wrong: 'Wrong!',
    timeUp: "Time's up!",
    quizOver: 'Quiz Over',
    questionsRight: '{n} of {total} correct',
    // Gold Stack
    goldStack: 'Gold Stack',
    stackGoldBars: 'Stack gold bars with precision!',
    perfect: 'Perfect!',
    height: 'Height',
    bestHeight: 'Best Height',
    bars: 'bars',
    tapToStart: 'Tap to start',
    tapToDrop: 'Tap to drop',
    // Gold Trader
    goldTrader: 'Gold Trader',
    virtualTrading: 'Buy & sell gold with virtual cash!',
    portfolio: 'Portfolio',
    cash: 'Cash',
    holdings: 'Holdings',
    buy: 'Buy',
    sell: 'Sell',
    trade: 'Trade',
    tradeToday: 'Already traded today',
    profitLoss: 'P&L',
    resetPortfolio: 'Reset Portfolio',
    confirmReset: 'Start fresh with Rs 500,000?',
    confirm: 'Confirm',
    cancel: 'Cancel',
    noTradesYet: 'No trades yet',
    // Calculator
    calculator: 'Calculator',
    weight: 'Weight',
    value: 'Value',
    tola: 'tola',
    gram: 'gram',
    basedOnRate: "Based on today's rate: Rs {price}/{unit}",
    enterWeight: 'Enter weight',
    enterValue: 'Enter value',
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
    // News
    prices: 'मूल्य',
    news: 'समाचार',
    allLanguages: 'सबै',
    english: 'EN',
    nepali: 'NP',
    allCategories: 'सबै',
    noNews: 'समाचार फेला परेन',
    loadMore: 'थप लोड',
    hoursAgo: '{n} घण्टा अघि',
    minutesAgo: '{n} मिनेट अघि',
    justNow: 'भर्खरै',
    // Market Mood
    moodOnFire: 'तातो',
    moodActive: 'सक्रिय',
    moodCalm: 'शान्त',
    moodQuiet: 'सुस्त',
    // Fun Comparisons
    thatsRoughly: 'लगभग',
    compMomo: 'मोमो प्लेट',
    compIphone: 'आइफोन १६ प्रो',
    compEnfield: 'रोयल एनफिल्ड',
    compRent: 'महिना भाडा (काठमाडौं)',
    compFlight: 'काठमाडौं→दिल्ली उडान',
    compChiya: 'कप चिया',
    compEBC: 'EBC ट्रेक',
    compMovie: 'सिनेमा टिकट',
    compMicroBus: 'माइक्रो बस यात्रा',
    // Milestones
    milestoneCrossed: '{metal} रू {price} पुग्यो!',
    milestoneATH: 'नयाँ सर्वकालिक उच्च!',
    milestoneContext: 'हिजो रू {previous} बाट बढ्यो',
    // Streaks
    streakGettingStarted: 'सुरुवात',
    streakOnARoll: 'जोशमा',
    streakDedicated: 'समर्पित',
    streakLegend: 'दिग्गज',
    dayStreak: '{n} दिनको स्ट्रिक',
    bestStreak: 'उत्कृष्ट: {n} दिन',
    badgesEarned: 'प्राप्त ब्याज',
    badgePriceChecker: 'मूल्य जाँचकर्ता',
    badgeGoldWatcher: 'सुन पर्यवेक्षक',
    badgeSilverSentinel: 'चाँदी प्रहरी',
    badgeBullionBaron: 'बुलियन बारन',
    badgeDiamondHands: 'हीरा हात',
    badgeMilestoneWitness: 'माइलस्टोन साक्षी',
    badgeATHHunter: 'ATH शिकारी',
    badgeLocked: 'लक गरिएको',
    // Play tab
    play: 'खेल',
    // Prediction Game
    predictTomorrow: 'भोलिको अनुमान',
    willGoldGoUpOrDown: 'भोलि सुन बढ्छ कि घट्छ?',
    up: 'बढ्छ',
    down: 'घट्छ',
    goldWillGoUp: 'सुन बढ्छ',
    goldWillGoDown: 'सुन घट्छ',
    checkBackTomorrow: 'भोलि आएर हेर्नुहोस्!',
    youWereRight: 'तपाईंको अनुमान सही थियो!',
    notThisTime: 'यो पटक होइन',
    goldWentUp: 'सुन रू {amount} ({pct}%) ले बढ्यो',
    goldWentDown: 'सुन रू {amount} ({pct}%) ले घट्यो',
    goldFlat: 'सुन स्थिर — तपाईंको अनुमान गनियो!',
    predictionStreak: 'अनुमान स्ट्रिक',
    accuracy: 'शुद्धता',
    yesterdayPrediction: 'हिजोको अनुमान',
    // Gold Rush
    goldRush: 'गोल्ड रश',
    tapGoldCoins: 'सुनका सिक्का थिच्नुहोस्! चाँदी नथिच्नुहोस्।',
    gameOver: 'खेल सकियो',
    score: 'स्कोर',
    highScore: 'उच्च स्कोर',
    newHighScore: 'नयाँ उच्च स्कोर!',
    playAgain: 'फेरि खेल्नुहोस्',
    level: 'तह',
    go: 'जाऊ!',
    // Price Crash
    priceCrash: 'प्राइस क्र्यास',
    tapCashOut: 'क्र्यास हुनु अघि क्यास आउट गर्नुहोस्!',
    cashOut: 'क्यास आउट',
    launch: 'सुरु',
    crashed: 'क्र्यास भयो!',
    crashedAt: 'क्र्यास भएको',
    cashedOut: 'क्यास आउट भयो!',
    youCashed: 'तपाईंले लिनुभयो',
    bestMultiplier: 'उत्कृष्ट',
    newBest: 'नयाँ उत्कृष्ट!',
    // Gold Quiz
    goldQuiz: 'गोल्ड क्विज',
    testYourKnowledge: 'आफ्नो बुलियन ज्ञान परीक्षण गर्नुहोस्!',
    question: 'प्रश्न',
    correct: 'सही!',
    wrong: 'गलत!',
    timeUp: 'समय सकियो!',
    quizOver: 'क्विज सकियो',
    questionsRight: '{total} मध्ये {n} सही',
    // Gold Stack
    goldStack: 'गोल्ड स्ट्याक',
    stackGoldBars: 'सुनका बार सटीक रूपमा थुपार्नुहोस्!',
    perfect: 'उत्तम!',
    height: 'उचाइ',
    bestHeight: 'उत्कृष्ट उचाइ',
    bars: 'बार',
    tapToStart: 'सुरु गर्न थिच्नुहोस्',
    tapToDrop: 'राख्न थिच्नुहोस्',
    // Gold Trader
    goldTrader: 'गोल्ड ट्रेडर',
    virtualTrading: 'भर्चुअल क्यासले सुन किनबेच गर्नुहोस्!',
    portfolio: 'पोर्टफोलियो',
    cash: 'नगद',
    holdings: 'होल्डिंग',
    buy: 'किन्नुहोस्',
    sell: 'बेच्नुहोस्',
    trade: 'ट्रेड',
    tradeToday: 'आज ट्रेड भइसक्यो',
    profitLoss: 'नाफा/नोक्सान',
    resetPortfolio: 'पोर्टफोलियो रिसेट',
    confirmReset: 'रू ५,००,००० बाट सुरु गर्ने?',
    confirm: 'पक्का',
    cancel: 'रद्द',
    noTradesYet: 'अहिलेसम्म ट्रेड छैन',
    // Calculator
    calculator: 'क्यालकुलेटर',
    weight: 'तौल',
    value: 'मूल्य',
    tola: 'तोला',
    gram: 'ग्राम',
    basedOnRate: 'आजको दर: रू {price}/{unit}',
    enterWeight: 'तौल राख्नुहोस्',
    enterValue: 'मूल्य राख्नुहोस्',
  },
} as const;

export type Translations = typeof translations.en;

/** Convert ASCII digits to Nepali Devanagari digits */
function toNepaliDigits(str: string): string {
  return str.replace(/[0-9]/g, d => '०१२३४५६७८९'[+d]);
}

/** Nepali BS month names: English → Devanagari */
const BS_MONTHS_NE: Record<string, string> = {
  Baisakh: 'बैशाख', Jestha: 'जेठ', Ashadh: 'असार', Shrawan: 'श्रावण',
  Bhadra: 'भदौ', Ashwin: 'असोज', Kartik: 'कार्तिक', Mangsir: 'मंसिर',
  Poush: 'पौष', Magh: 'माघ', Falgun: 'फागुन', Chaitra: 'चैत्र',
};

/** Convert a BS date string like "Chaitra 19, 2082" to Nepali */
function toNepaliDate(dateStr: string): string {
  let result = dateStr;
  for (const [en, ne] of Object.entries(BS_MONTHS_NE)) {
    result = result.replace(new RegExp(en, 'i'), ne);
  }
  return toNepaliDigits(result);
}

interface LocaleContextValue {
  lang: Lang;
  t: Translations;
  numberLocale: string;
  /** Localize a raw number/string — converts digits to Nepali in NP mode */
  localizeNum: (value: string | number) => string;
  /** Localize a BS date string — converts month names and digits to Nepali in NP mode */
  localizeDate: (value: string) => string;
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
    numberLocale: 'en-IN', // always lakh grouping (2,85,600); localizeNum handles digit conversion
    localizeNum: (v: string | number) => {
      const s = String(v);
      return lang === 'ne' ? toNepaliDigits(s) : s;
    },
    localizeDate: (v: string) => lang === 'ne' ? toNepaliDate(v) : v,
    toggleLang,
  }), [lang, toggleLang]);

  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
