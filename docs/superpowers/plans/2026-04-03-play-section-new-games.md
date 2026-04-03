# Play Section New Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 new games (Gold Quiz, Gold Stack Tower, Gold Trader) to the Play tab following existing game architecture patterns.

**Architecture:** Each game is a hook (localStorage persistence) + card component (Play tab entry point) + game component (full-screen overlay). All follow the existing phase-based state machine pattern with `canvas-confetti` celebrations and i18n support.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, localStorage, canvas-confetti

**Spec:** `docs/superpowers/specs/2026-04-03-play-section-new-games-design.md`

---

## File Structure

```
apps/web/src/
├── components/
│   ├── GoldQuizCard.tsx          # Play tab card for quiz
│   ├── GoldQuizGame.tsx          # Full-screen quiz game
│   ├── GoldStackCard.tsx         # Play tab card for stacking
│   ├── GoldStackGame.tsx         # Full-screen stacking game
│   ├── GoldTraderCard.tsx        # Play tab card for trader
│   └── GoldTraderGame.tsx        # Full-screen trading view
├── hooks/
│   ├── useGoldQuiz.ts            # Quiz state + localStorage
│   ├── useGoldStack.ts           # Stack state + localStorage
│   └── useGoldTrader.ts          # Trader state + localStorage
└── data/
    └── quizQuestions.ts           # Static question bank (50+ questions)
```

**Existing files modified:**
- `apps/web/src/i18n.tsx` — add strings for all 3 games (both `en` and `ne`)
- `apps/web/src/App.tsx` — import and render 3 new card components in Play tab
- `apps/web/src/index.css` — add animations for quiz timer, stack slide, etc.

---

## Task 1: Add i18n Strings for All 3 Games

**Files:**
- Modify: `apps/web/src/i18n.tsx:139-150` (after Price Crash strings in `en`), and `apps/web/src/i18n.tsx:284-295` (after Price Crash strings in `ne`)

- [ ] **Step 1: Add English strings for all 3 games**

In `apps/web/src/i18n.tsx`, add after the Price Crash `newBest` line (line 140) in the `en` object:

```typescript
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
```

- [ ] **Step 2: Add Nepali strings for all 3 games**

In `apps/web/src/i18n.tsx`, add after the Price Crash `newBest` line (line 285) in the `ne` object:

```typescript
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
```

- [ ] **Step 3: Verify TypeScript types are satisfied**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -20`

Expected: No errors related to i18n (or no output = clean).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/i18n.tsx
git commit -m "feat: add i18n strings for Gold Quiz, Gold Stack, and Gold Trader games"
```

---

## Task 2: Create Quiz Question Bank

**Files:**
- Create: `apps/web/src/data/quizQuestions.ts`

- [ ] **Step 1: Create the data directory and question bank file**

Create `apps/web/src/data/quizQuestions.ts`:

```typescript
export interface QuizQuestion {
  id: string;
  category: 'history' | 'nepal' | 'purity' | 'weights' | 'world' | 'funfact';
  question: string;
  questionNP?: string;
  options: [string, string, string, string];
  optionsNP?: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;
  explanationNP?: string;
}

export const quizQuestions: QuizQuestion[] = [
  // === WEIGHTS & MEASURES ===
  {
    id: 'w1',
    category: 'weights',
    question: 'How many grams is 1 tola?',
    questionNP: '१ तोलामा कति ग्राम हुन्छ?',
    options: ['10.00g', '11.66g', '12.50g', '15.00g'],
    optionsNP: ['१०.०० ग्राम', '११.६६ ग्राम', '१२.५० ग्राम', '१५.०० ग्राम'],
    correctIndex: 1,
    explanation: '1 tola = 11.6638 grams, commonly rounded to 11.66g.',
    explanationNP: '१ तोला = ११.६६३८ ग्राम, सामान्यतया ११.६६ ग्राम भनिन्छ।',
  },
  {
    id: 'w2',
    category: 'weights',
    question: 'How many tola make 1 kilogram of gold?',
    questionNP: '१ किलोग्राम सुनमा कति तोला हुन्छ?',
    options: ['75.5 tola', '85.7 tola', '100 tola', '64.8 tola'],
    optionsNP: ['७५.५ तोला', '८५.७ तोला', '१०० तोला', '६४.८ तोला'],
    correctIndex: 1,
    explanation: '1 kg = 85.735 tola (1000g / 11.6638g per tola).',
    explanationNP: '१ किलो = ८५.७३५ तोला (१००० ग्राम / ११.६६३८ ग्राम प्रति तोला)।',
  },
  {
    id: 'w3',
    category: 'weights',
    question: 'What is 1 troy ounce in grams?',
    options: ['28.35g', '31.10g', '30.00g', '32.15g'],
    correctIndex: 1,
    explanation: '1 troy ounce = 31.1035 grams. This is the standard unit for precious metals internationally.',
  },
  {
    id: 'w4',
    category: 'weights',
    question: 'How many tola is 1 troy ounce?',
    options: ['2.00 tola', '2.67 tola', '3.00 tola', '3.50 tola'],
    correctIndex: 1,
    explanation: '1 troy ounce = 31.1035g / 11.6638g = 2.667 tola.',
  },
  {
    id: 'w5',
    category: 'weights',
    question: '10 grams of gold equals how many tola?',
    questionNP: '१० ग्राम सुन कति तोला हुन्छ?',
    options: ['0.72 tola', '0.86 tola', '1.00 tola', '1.16 tola'],
    optionsNP: ['०.७२ तोला', '०.८६ तोला', '१.०० तोला', '१.१६ तोला'],
    correctIndex: 1,
    explanation: '10g / 11.6638g per tola = 0.857 tola.',
  },

  // === PURITY & HALLMARKS ===
  {
    id: 'p1',
    category: 'purity',
    question: 'What karat is 99.9% pure gold?',
    questionNP: '९९.९% शुद्ध सुन कति क्यारेटको हुन्छ?',
    options: ['18K', '22K', '23K', '24K'],
    optionsNP: ['१८ क्यारेट', '२२ क्यारेट', '२३ क्यारेट', '२४ क्यारेट'],
    correctIndex: 3,
    explanation: '24 karat = 99.9% pure gold. Each karat represents 1/24th purity.',
    explanationNP: '२४ क्यारेट = ९९.९% शुद्ध सुन। प्रत्येक क्यारेट १/२४ शुद्धता हो।',
  },
  {
    id: 'p2',
    category: 'purity',
    question: 'What does the hallmark "916" mean?',
    options: ['91.6% pure (22K)', '9.16% pure', '916 grams', 'Made in 916 AD'],
    correctIndex: 0,
    explanation: '916 means 91.6% pure gold, which is 22 karat. Used in most jewelry.',
  },
  {
    id: 'p3',
    category: 'purity',
    question: 'What is the purity of 18K gold?',
    options: ['58.3%', '65.0%', '75.0%', '83.3%'],
    correctIndex: 2,
    explanation: '18K = 18/24 = 75% pure gold, alloyed with other metals for durability.',
  },
  {
    id: 'p4',
    category: 'purity',
    question: 'What does "Chhapawaal" (छापावाल) gold mean in Nepal?',
    questionNP: '"छापावाल" सुन भनेको के हो?',
    options: ['18K gold', 'Gold with stamp/hallmark', 'Fake gold', 'Gold coins only'],
    optionsNP: ['१८ क्यारेट सुन', 'छाप लगाइएको शुद्ध सुन', 'नक्कली सुन', 'सुनका सिक्का मात्र'],
    correctIndex: 1,
    explanation: 'Chhapawaal means stamped/hallmarked fine gold (99.5%+), the purest form sold in Nepal.',
    explanationNP: 'छापावाल भनेको छाप लगाइएको शुद्ध सुन (९९.५%+), नेपालमा बिक्ने सबैभन्दा शुद्ध सुन हो।',
  },
  {
    id: 'p5',
    category: 'purity',
    question: 'What is "Tejabi" (तेजाबी) gold?',
    questionNP: '"तेजाबी" सुन भनेको के हो?',
    options: ['Pure 24K gold', 'Acid-refined gold (~99.5%)', 'Gold-plated jewelry', '14K gold'],
    optionsNP: ['शुद्ध २४ क्यारेट', 'तेजाबले शुद्ध गरिएको (~९९.५%)', 'सुन लेपित गहना', '१४ क्यारेट सुन'],
    correctIndex: 1,
    explanation: 'Tejabi gold is acid-refined and slightly less pure than Chhapawaal.',
    explanationNP: 'तेजाबी सुन तेजाबले शुद्ध गरिएको हो र छापावालभन्दा अलि कम शुद्ध हुन्छ।',
  },
  {
    id: 'p6',
    category: 'purity',
    question: 'How many karats is pure silver?',
    options: ['Silver doesn\'t use karats', '24K', '18K', '999K'],
    correctIndex: 0,
    explanation: 'Silver uses millesimal fineness (e.g., 925 for sterling silver), not karats. Karats are only for gold.',
  },

  // === NEPAL MARKET ===
  {
    id: 'n1',
    category: 'nepal',
    question: 'What is the Nepali word for gold?',
    questionNP: 'सुनलाई अंग्रेजीमा के भनिन्छ?',
    options: ['Chandi', 'Sun', 'Heera', 'Tamba'],
    optionsNP: ['Silver', 'Gold', 'Diamond', 'Copper'],
    correctIndex: 1,
    explanation: 'Gold is called "Sun" (सुन) in Nepali.',
    explanationNP: 'सुन (Sun) लाई अंग्रेजीमा Gold भनिन्छ।',
  },
  {
    id: 'n2',
    category: 'nepal',
    question: 'Which organization sets daily gold prices in Nepal?',
    questionNP: 'नेपालमा दैनिक सुनको मूल्य कसले तोक्छ?',
    options: ['Nepal Rastra Bank', 'FENEGOSIDA', 'Ministry of Finance', 'World Gold Council'],
    optionsNP: ['नेपाल राष्ट्र बैंक', 'फेनेगोसिडा', 'अर्थ मन्त्रालय', 'विश्व सुन परिषद'],
    correctIndex: 1,
    explanation: 'FENEGOSIDA (Federation of Nepal Gold and Silver Dealers Association) sets daily prices.',
    explanationNP: 'फेनेगोसिडा (नेपाल सुनचाँदी व्यवसायी महासंघ) ले दैनिक मूल्य तोक्छ।',
  },
  {
    id: 'n3',
    category: 'nepal',
    question: 'What unit is gold primarily sold in Nepal?',
    questionNP: 'नेपालमा सुन कुन एकाइमा बिक्री हुन्छ?',
    options: ['Gram', 'Ounce', 'Tola', 'Kilogram'],
    optionsNP: ['ग्राम', 'आउन्स', 'तोला', 'किलोग्राम'],
    correctIndex: 2,
    explanation: 'Gold is primarily traded in tola in Nepal, though gram pricing is also shown.',
    explanationNP: 'नेपालमा सुन मुख्यतया तोलामा किनबेच हुन्छ, ग्राम मूल्य पनि देखाइन्छ।',
  },
  {
    id: 'n4',
    category: 'nepal',
    question: 'What does FENEGOSIDA stand for?',
    options: [
      'Federation of Nepal Gold and Silver Dealers Association',
      'Federal Nepal Gold Standard Authority',
      'Finance Nepal Gold Silver Department',
      'Federation of Nepalese Gem and Stone Dealers',
    ],
    correctIndex: 0,
    explanation: 'FENEGOSIDA is the Federation of Nepal Gold and Silver Dealers Association.',
  },
  {
    id: 'n5',
    category: 'nepal',
    question: 'What is the Nepali word for silver?',
    questionNP: 'चाँदीलाई अंग्रेजीमा के भनिन्छ?',
    options: ['Gold', 'Bronze', 'Silver', 'Platinum'],
    optionsNP: ['Gold', 'Bronze', 'Silver', 'Platinum'],
    correctIndex: 2,
    explanation: 'Silver is called "Chandi" (चाँदी) in Nepali.',
    explanationNP: 'चाँदी (Chandi) लाई अंग्रेजीमा Silver भनिन्छ।',
  },
  {
    id: 'n6',
    category: 'nepal',
    question: 'In Nepal, gold prices are higher than international prices mainly because of:',
    options: ['Higher purity standards', 'Customs duty and taxes', 'Limited gold mines', 'Currency strength'],
    correctIndex: 1,
    explanation: 'Nepal imports all gold. Customs duty, bank margins, and dealer margins increase the final price.',
  },

  // === WORLD GOLD ===
  {
    id: 'g1',
    category: 'world',
    question: 'Which country has the largest gold reserves?',
    options: ['China', 'Germany', 'USA', 'India'],
    correctIndex: 2,
    explanation: 'The USA holds over 8,000 tonnes of gold at Fort Knox and other facilities.',
  },
  {
    id: 'g2',
    category: 'world',
    question: 'Which country is the largest gold producer?',
    options: ['South Africa', 'Australia', 'China', 'Russia'],
    correctIndex: 2,
    explanation: 'China has been the world\'s largest gold producer since 2007.',
  },
  {
    id: 'g3',
    category: 'world',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctIndex: 2,
    explanation: 'Au comes from the Latin word "aurum" meaning gold.',
  },
  {
    id: 'g4',
    category: 'world',
    question: 'What is the chemical symbol for silver?',
    options: ['Si', 'Sv', 'Au', 'Ag'],
    correctIndex: 3,
    explanation: 'Ag comes from the Latin word "argentum" meaning silver.',
  },
  {
    id: 'g5',
    category: 'world',
    question: 'Where is the world\'s largest gold bar stored?',
    options: ['Fort Knox, USA', 'Bank of England', 'Toi Gold Museum, Japan', 'Swiss National Bank'],
    correctIndex: 2,
    explanation: 'The Toi Gold Museum in Japan houses a 250 kg gold bar, the world\'s largest.',
  },
  {
    id: 'g6',
    category: 'world',
    question: 'Which country consumes the most gold jewelry annually?',
    options: ['USA', 'India', 'China', 'Saudi Arabia'],
    correctIndex: 1,
    explanation: 'India is the world\'s largest consumer of gold jewelry, driven by cultural significance.',
  },

  // === HISTORY ===
  {
    id: 'h1',
    category: 'history',
    question: 'When was gold first used as currency?',
    options: ['Around 700 BC', 'Around 3000 BC', 'Around 100 AD', 'Around 1500 AD'],
    correctIndex: 0,
    explanation: 'King Croesus of Lydia created the first gold coins around 700 BC.',
  },
  {
    id: 'h2',
    category: 'history',
    question: 'What was the gold standard?',
    options: [
      'A purity measurement system',
      'Currency value backed by gold reserves',
      'The minimum gold price set by UN',
      'A gold quality certification',
    ],
    correctIndex: 1,
    explanation: 'The gold standard tied a country\'s currency value directly to a fixed amount of gold.',
  },
  {
    id: 'h3',
    category: 'history',
    question: 'When did the USA abandon the gold standard?',
    options: ['1933', '1945', '1971', '1999'],
    correctIndex: 2,
    explanation: 'President Nixon ended dollar-to-gold convertibility in 1971 ("Nixon Shock").',
  },
  {
    id: 'h4',
    category: 'history',
    question: 'Which ancient civilization was known for its gold death masks?',
    options: ['Roman', 'Egyptian', 'Greek', 'Chinese'],
    correctIndex: 1,
    explanation: 'Ancient Egyptians crafted gold death masks, most famously King Tutankhamun\'s mask.',
  },
  {
    id: 'h5',
    category: 'history',
    question: 'Which metal is more dense: gold or silver?',
    options: ['Silver', 'They are the same', 'Gold', 'Depends on purity'],
    correctIndex: 2,
    explanation: 'Gold is about 19.3 g/cm3 vs silver at 10.5 g/cm3 — nearly twice as dense.',
  },
  {
    id: 'h6',
    category: 'history',
    question: 'What was the California Gold Rush?',
    options: [
      'A gold mining boom starting in 1848',
      'A gold-themed video game',
      'A brand of gold jewelry',
      'A stock market event in California',
    ],
    correctIndex: 0,
    explanation: 'The California Gold Rush (1848-1855) brought 300,000+ people to California seeking gold.',
  },

  // === FUN FACTS ===
  {
    id: 'f1',
    category: 'funfact',
    question: 'Approximately how much gold has been mined in all of human history?',
    options: ['50,000 tonnes', '100,000 tonnes', '210,000 tonnes', '500,000 tonnes'],
    correctIndex: 2,
    explanation: 'About 210,000 tonnes — it would fit in a cube roughly 22 meters on each side.',
  },
  {
    id: 'f2',
    category: 'funfact',
    question: 'Can gold be found in the ocean?',
    options: ['No, never', 'Yes, about 20 million tonnes dissolved', 'Only near volcanoes', 'Only in the Arctic'],
    correctIndex: 1,
    explanation: 'The ocean contains about 20 million tonnes of dissolved gold, but it\'s too dilute to extract profitably.',
  },
  {
    id: 'f3',
    category: 'funfact',
    question: 'How thin can gold be hammered?',
    options: ['1mm thick', '0.1mm thick', 'Thin enough to see light through it', 'It cannot be hammered'],
    correctIndex: 2,
    explanation: 'Gold leaf can be beaten to 0.0001mm — thin enough for light to pass through, appearing greenish.',
  },
  {
    id: 'f4',
    category: 'funfact',
    question: 'What color does pure gold turn when made into nanoparticles?',
    options: ['Yellow', 'White', 'Red/purple', 'Green'],
    correctIndex: 2,
    explanation: 'Gold nanoparticles appear red or purple. This is used in some stained glass and medical tests.',
  },
  {
    id: 'f5',
    category: 'funfact',
    question: 'Is gold edible?',
    options: ['No, it is toxic', 'Yes, pure gold is non-toxic', 'Only silver is edible', 'Only below 18K'],
    correctIndex: 1,
    explanation: 'Pure gold (24K) is non-toxic and biologically inert. Edible gold leaf is used in luxury foods.',
  },
  {
    id: 'f6',
    category: 'funfact',
    question: 'Where does most of Earth\'s gold actually reside?',
    options: ['In mountains', 'In rivers', 'In the Earth\'s core', 'On the surface'],
    correctIndex: 2,
    explanation: 'Most gold sank to Earth\'s core during formation. Surface gold came from asteroid impacts.',
  },
  {
    id: 'f7',
    category: 'funfact',
    question: 'Which Olympic medal contains the most gold?',
    options: ['The gold medal (100% gold)', 'The gold medal (6g gold plating)', 'None — they\'re all alloys', 'Silver medal has trace gold'],
    correctIndex: 1,
    explanation: 'Olympic gold medals are 92.5% silver with about 6g of gold plating.',
  },
  {
    id: 'f8',
    category: 'funfact',
    question: 'Gold is found on every continent. True or false?',
    options: ['True — including Antarctica', 'False — not in Europe', 'False — not in Antarctica', 'False — only in Africa and Americas'],
    correctIndex: 0,
    explanation: 'Gold has been found on every continent, including Antarctica (though mining there is banned).',
  },
];

/** Get `count` random questions, no repeats */
export function getRandomQuestions(count: number): QuizQuestion[] {
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -10`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/data/quizQuestions.ts
git commit -m "feat: add quiz question bank with 40+ bullion trivia questions"
```

---

## Task 3: Create useGoldQuiz Hook

**Files:**
- Create: `apps/web/src/hooks/useGoldQuiz.ts`

- [ ] **Step 1: Create the hook**

Create `apps/web/src/hooks/useGoldQuiz.ts`:

```typescript
import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'bullion-gold-quiz';

interface GoldQuizState {
  highScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalAnswered: number;
}

function loadState(): GoldQuizState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { highScore: 0, gamesPlayed: 0, totalCorrect: 0, totalAnswered: 0 };
}

function saveState(state: GoldQuizState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function useGoldQuiz() {
  const [state, setState] = useState<GoldQuizState>(loadState);
  const isNewHighRef = useRef(false);

  const submitScore = useCallback((score: number, correct: number, answered: number) => {
    setState(prev => {
      const isNew = score > prev.highScore;
      isNewHighRef.current = isNew;
      const next: GoldQuizState = {
        highScore: Math.max(prev.highScore, score),
        gamesPlayed: prev.gamesPlayed + 1,
        totalCorrect: prev.totalCorrect + correct,
        totalAnswered: prev.totalAnswered + answered,
      };
      saveState(next);
      return next;
    });
    return isNewHighRef.current;
  }, []);

  return {
    highScore: state.highScore,
    gamesPlayed: state.gamesPlayed,
    totalCorrect: state.totalCorrect,
    totalAnswered: state.totalAnswered,
    submitScore,
  };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -10`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/hooks/useGoldQuiz.ts
git commit -m "feat: add useGoldQuiz hook with localStorage persistence"
```

---

## Task 4: Create GoldQuizGame Component

**Files:**
- Create: `apps/web/src/components/GoldQuizGame.tsx`

- [ ] **Step 1: Create the game component**

Create `apps/web/src/components/GoldQuizGame.tsx`:

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useLocale } from '../i18n';
import { getRandomQuestions, type QuizQuestion } from '../data/quizQuestions';

interface Props {
  highScore: number;
  onGameEnd: (score: number, correct: number, answered: number) => boolean;
  onClose: () => void;
}

type Phase = 'start' | 'playing' | 'feedback' | 'over';

const QUESTIONS_PER_ROUND = 10;
const TIME_PER_QUESTION = 15; // seconds
const MAX_LIVES = 3;

export function GoldQuizGame({ highScore, onGameEnd, onClose }: Props) {
  const { t, lang } = useLocale();
  const [phase, setPhase] = useState<Phase>('start');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const answeredRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[questionIndex] ?? null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endGame = useCallback(() => {
    clearTimer();
    const isNew = onGameEnd(scoreRef.current, correctRef.current, answeredRef.current);
    if (isNew) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
    setPhase('over');
  }, [clearTimer, onGameEnd]);

  const startGame = useCallback(() => {
    const q = getRandomQuestions(QUESTIONS_PER_ROUND);
    setQuestions(q);
    setQuestionIndex(0);
    setScore(0);
    setLives(MAX_LIVES);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(TIME_PER_QUESTION);
    scoreRef.current = 0;
    correctRef.current = 0;
    answeredRef.current = 0;
    livesRef.current = MAX_LIVES;
    setPhase('playing');
  }, []);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    clearTimer();
    setTimeLeft(TIME_PER_QUESTION);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up — treat as wrong
          clearTimer();
          answeredRef.current += 1;
          livesRef.current -= 1;
          setLives(livesRef.current);
          setIsCorrect(false);
          setSelectedAnswer(-1); // no selection
          setPhase('feedback');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [phase, questionIndex, clearTimer]);

  const handleAnswer = useCallback((index: number) => {
    if (phase !== 'playing' || selectedAnswer !== null) return;
    clearTimer();

    const correct = index === currentQuestion!.correctIndex;
    answeredRef.current += 1;
    setSelectedAnswer(index);
    setIsCorrect(correct);

    if (correct) {
      const timeBonus = Math.ceil(timeLeft / 3); // 1-5 bonus based on speed
      const points = 10 + timeBonus;
      scoreRef.current += points;
      correctRef.current += 1;
      setScore(scoreRef.current);
      setCorrectCount(correctRef.current);
    } else {
      livesRef.current -= 1;
      setLives(livesRef.current);
    }

    setPhase('feedback');
  }, [phase, selectedAnswer, currentQuestion, timeLeft, clearTimer]);

  // Auto-advance after feedback
  useEffect(() => {
    if (phase !== 'feedback') return;

    const timeout = setTimeout(() => {
      if (livesRef.current <= 0 || questionIndex >= questions.length - 1) {
        endGame();
      } else {
        setQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setPhase('playing');
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [phase, questionIndex, questions.length, endGame]);

  const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerColor = timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500';

  const categoryLabels: Record<string, string> = {
    history: 'History',
    nepal: 'Nepal Market',
    purity: 'Purity & Hallmarks',
    weights: 'Weights & Measures',
    world: 'World Gold',
    funfact: 'Fun Facts',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1a1207] to-[#0d0a04]"
      role="dialog"
      aria-label={t.goldQuiz}
    >
      {/* Start screen */}
      {phase === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <p className="text-5xl">🧠</p>
          <h2 className="text-2xl font-bold text-gold-200">{t.goldQuiz}</h2>
          <p className="text-ink-faint text-sm text-center">{t.testYourKnowledge}</p>
          {highScore > 0 && (
            <p className="text-xs text-ink-faint">{t.highScore}: <strong className="text-white">{highScore}</strong></p>
          )}
          <button
            onClick={startGame}
            className="mt-4 px-10 py-4 rounded-full bg-gold-500 text-ink font-bold text-lg cursor-pointer hover:bg-gold-400 transition-colors"
            aria-label={t.play}
          >
            {t.play}
          </button>
          <button
            onClick={onClose}
            className="text-ink-faint text-sm underline cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>
      )}

      {/* Playing / Feedback */}
      {(phase === 'playing' || phase === 'feedback') && currentQuestion && (
        <div className="flex-1 flex flex-col">
          {/* Timer bar */}
          <div className="h-1.5 bg-ink/30">
            <div
              className={`h-full ${timerColor} transition-all duration-1000 ease-linear`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          {/* HUD */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex gap-1">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} className={`text-lg ${i < lives ? 'opacity-100' : 'opacity-20'}`}>
                  {i < lives ? '❤️' : '🖤'}
                </span>
              ))}
            </div>
            <p className="text-sm text-ink-faint">
              {t.question} {questionIndex + 1}/{questions.length}
            </p>
            <p className="text-sm font-bold text-gold-200">{score}</p>
          </div>

          {/* Category badge */}
          <div className="px-6 mb-2">
            <span className="inline-block px-3 py-1 rounded-full bg-gold-500/20 text-gold-200 text-xs font-medium">
              {categoryLabels[currentQuestion.category] ?? currentQuestion.category}
            </span>
          </div>

          {/* Question */}
          <div className="flex-1 flex flex-col justify-center px-6 gap-6">
            <h3 className="text-xl font-semibold text-white text-center leading-relaxed">
              {(lang === 'ne' && currentQuestion.questionNP) ? currentQuestion.questionNP : currentQuestion.question}
            </h3>

            {/* Options 2x2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, i) => {
                const npOption = lang === 'ne' && currentQuestion.optionsNP?.[i];
                const displayOption = npOption || option;

                let btnClass = 'p-4 rounded-xl text-sm font-medium text-center transition-all duration-200 border ';
                if (phase === 'feedback') {
                  if (i === currentQuestion.correctIndex) {
                    btnClass += 'bg-emerald-500/30 border-emerald-500 text-emerald-200';
                  } else if (i === selectedAnswer && !isCorrect) {
                    btnClass += 'bg-red-500/30 border-red-500 text-red-200 animate-shake';
                  } else {
                    btnClass += 'bg-white/5 border-white/10 text-ink-faint opacity-50';
                  }
                } else {
                  btnClass += 'bg-white/10 border-white/10 text-white cursor-pointer active:scale-95 hover:bg-white/20';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={phase === 'feedback'}
                    className={btnClass}
                    aria-label={displayOption}
                  >
                    {displayOption}
                  </button>
                );
              })}
            </div>

            {/* Feedback explanation */}
            {phase === 'feedback' && (
              <div className={`text-center text-sm px-4 py-3 rounded-lg ${isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                <p className="font-bold mb-1">{isCorrect ? t.correct : selectedAnswer === -1 ? t.timeUp : t.wrong}</p>
                {currentQuestion.explanation && (
                  <p className="text-xs opacity-80">
                    {(lang === 'ne' && currentQuestion.explanationNP) ? currentQuestion.explanationNP : currentQuestion.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Over */}
      {phase === 'over' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-5xl">📊</p>
          <h2 className="text-2xl font-bold text-gold-200">{t.quizOver}</h2>
          <p className="text-4xl font-bold text-white">{score}</p>
          {score > highScore && score > 0 && (
            <p className="text-emerald-400 font-bold text-sm animate-pulse">{t.newHighScore}</p>
          )}
          <p className="text-ink-faint text-sm">
            {t.questionsRight.replace('{n}', String(correctCount)).replace('{total}', String(answeredRef.current))}
          </p>
          <p className="text-ink-faint text-xs">
            {t.accuracy}: {answeredRef.current > 0 ? Math.round((correctCount / answeredRef.current) * 100) : 0}%
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-full bg-gold-500 text-ink font-bold cursor-pointer hover:bg-gold-400 transition-colors"
            >
              {t.playAgain}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-white/10 text-white font-bold cursor-pointer hover:bg-white/20 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -20`

Expected: No errors (assuming i18n strings from Task 1 are already added).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/GoldQuizGame.tsx
git commit -m "feat: add GoldQuizGame full-screen quiz component"
```

---

## Task 5: Create GoldQuizCard and Wire Into Play Tab

**Files:**
- Create: `apps/web/src/components/GoldQuizCard.tsx`
- Modify: `apps/web/src/App.tsx:21` (add import) and `apps/web/src/App.tsx:134-135` (add card)

- [ ] **Step 1: Create the card component**

Create `apps/web/src/components/GoldQuizCard.tsx`:

```typescript
import { useState } from 'react';
import { useLocale } from '../i18n';
import { useGoldQuiz } from '../hooks/useGoldQuiz';
import { GoldQuizGame } from './GoldQuizGame';

export function GoldQuizCard() {
  const { t, localizeNum } = useLocale();
  const { highScore, submitScore } = useGoldQuiz();
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <div className="glass-card rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-1">{t.goldQuiz}</p>
            <p className="text-[13px] text-ink-muted dark:text-ink-faint">{t.testYourKnowledge}</p>
            {highScore > 0 && (
              <p className="text-[12px] text-ink-faint mt-1">{t.highScore}: <strong className="text-ink dark:text-white">{localizeNum(highScore)}</strong></p>
            )}
          </div>
          <button
            onClick={() => setPlaying(true)}
            className="px-6 py-3 rounded-full bg-purple-500 text-white font-bold text-[14px] cursor-pointer hover:bg-purple-400 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          >
            {t.play}
          </button>
        </div>
      </div>

      {playing && (
        <GoldQuizGame
          highScore={highScore}
          onGameEnd={submitScore}
          onClose={() => setPlaying(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Add import to App.tsx**

In `apps/web/src/App.tsx`, add after line 21 (`import { PriceCrashCard }`):

```typescript
import { GoldQuizCard } from './components/GoldQuizCard';
```

- [ ] **Step 3: Add GoldQuizCard to Play tab**

In `apps/web/src/App.tsx`, inside the `<div className="max-w-lg mx-auto w-full mt-4 flex flex-col gap-4">` block (around line 134-135), add after `<PriceCrashCard />`:

```typescript
              <GoldQuizCard />
```

- [ ] **Step 4: Verify it compiles and renders**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -10`

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/GoldQuizCard.tsx apps/web/src/App.tsx
git commit -m "feat: add Gold Quiz card to Play tab"
```

---

## Task 6: Create useGoldStack Hook

**Files:**
- Create: `apps/web/src/hooks/useGoldStack.ts`

- [ ] **Step 1: Create the hook**

Create `apps/web/src/hooks/useGoldStack.ts`:

```typescript
import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'bullion-gold-stack';

interface GoldStackState {
  highScore: number;
  bestHeight: number;
  gamesPlayed: number;
}

function loadState(): GoldStackState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { highScore: 0, bestHeight: 0, gamesPlayed: 0 };
}

function saveState(state: GoldStackState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function useGoldStack() {
  const [state, setState] = useState<GoldStackState>(loadState);
  const isNewHighRef = useRef(false);

  const submitScore = useCallback((score: number, height: number) => {
    setState(prev => {
      const isNew = score > prev.highScore;
      isNewHighRef.current = isNew;
      const next: GoldStackState = {
        highScore: Math.max(prev.highScore, score),
        bestHeight: Math.max(prev.bestHeight, height),
        gamesPlayed: prev.gamesPlayed + 1,
      };
      saveState(next);
      return next;
    });
    return isNewHighRef.current;
  }, []);

  return {
    highScore: state.highScore,
    bestHeight: state.bestHeight,
    gamesPlayed: state.gamesPlayed,
    submitScore,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/hooks/useGoldStack.ts
git commit -m "feat: add useGoldStack hook with localStorage persistence"
```

---

## Task 7: Create GoldStackGame Component

**Files:**
- Create: `apps/web/src/components/GoldStackGame.tsx`
- Modify: `apps/web/src/index.css` (add stack-slide animation)

- [ ] **Step 1: Add CSS animations for stacking game**

In `apps/web/src/index.css`, add after the existing game animations (after the `@keyframes shake` block):

```css
@keyframes stack-perfect {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes overhang-fall {
  from { transform: translateY(0) rotate(0deg); opacity: 1; }
  to { transform: translateY(200px) rotate(15deg); opacity: 0; }
}
```

- [ ] **Step 2: Create the game component**

Create `apps/web/src/components/GoldStackGame.tsx`:

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useLocale } from '../i18n';

interface Props {
  highScore: number;
  onGameEnd: (score: number, height: number) => boolean;
  onClose: () => void;
}

type Phase = 'start' | 'playing' | 'over';

interface StackedBar {
  x: number;
  width: number;
  shade: number; // 0 or 1 for alternating color
}

interface FallingPiece {
  id: number;
  x: number;
  width: number;
  y: number;
  side: 'left' | 'right';
}

const BAR_HEIGHT = 24;
const PERFECT_TOLERANCE = 3;
const GAME_WIDTH = 320;
const INITIAL_SPEED = 2; // pixels per frame
const SPEED_INCREMENT = 0.3; // every 5 bars

export function GoldStackGame({ highScore, onGameEnd, onClose }: Props) {
  const { t, localizeNum } = useLocale();
  const [phase, setPhase] = useState<Phase>('start');
  const [stack, setStack] = useState<StackedBar[]>([]);
  const [score, setScore] = useState(0);
  const [height, setHeight] = useState(0);
  const [perfectText, setPerfectText] = useState(false);
  const [fallingPieces, setFallingPieces] = useState<FallingPiece[]>([]);
  const [slidingBar, setSlidingBar] = useState<{ x: number; width: number } | null>(null);

  const rafRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const heightRef = useRef(0);
  const stackRef = useRef<StackedBar[]>([]);
  const directionRef = useRef<1 | -1>(1);
  const slidingRef = useRef<{ x: number; width: number }>({ x: 0, width: GAME_WIDTH });
  const fallingIdRef = useRef(0);
  const gameActiveRef = useRef(false);

  const getSpeed = useCallback(() => {
    return INITIAL_SPEED + Math.floor(heightRef.current / 5) * SPEED_INCREMENT;
  }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    gameActiveRef.current = false;
  }, []);

  const startGame = useCallback(() => {
    cleanup();
    const firstBar: StackedBar = { x: 0, width: GAME_WIDTH, shade: 0 };
    setStack([firstBar]);
    stackRef.current = [firstBar];
    setScore(0);
    setHeight(0);
    scoreRef.current = 0;
    heightRef.current = 0;
    directionRef.current = 1;
    slidingRef.current = { x: 0, width: GAME_WIDTH };
    setFallingPieces([]);
    setPerfectText(false);
    gameActiveRef.current = true;
    setPhase('playing');
  }, [cleanup]);

  // Animation loop for sliding bar
  useEffect(() => {
    if (phase !== 'playing') return;

    const animate = () => {
      if (!gameActiveRef.current) return;

      const speed = getSpeed();
      const bar = slidingRef.current;
      let newX = bar.x + speed * directionRef.current;

      // Bounce off edges
      if (newX + bar.width > GAME_WIDTH) {
        newX = GAME_WIDTH - bar.width;
        directionRef.current = -1;
      } else if (newX < 0) {
        newX = 0;
        directionRef.current = 1;
      }

      slidingRef.current = { ...bar, x: newX };
      setSlidingBar({ ...slidingRef.current });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return cleanup;
  }, [phase, height, cleanup, getSpeed]); // height in deps to restart loop after drop

  const handleDrop = useCallback(() => {
    if (phase !== 'playing' || !gameActiveRef.current) return;

    const sliding = slidingRef.current;
    const topBar = stackRef.current[stackRef.current.length - 1];

    // Calculate overlap
    const overlapLeft = Math.max(sliding.x, topBar.x);
    const overlapRight = Math.min(sliding.x + sliding.width, topBar.x + topBar.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      // Complete miss — game over
      cleanup();
      const isNew = onGameEnd(scoreRef.current, heightRef.current);
      if (isNew) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
      setPhase('over');
      return;
    }

    // Check for perfect drop
    const isPerfect = Math.abs(sliding.x - topBar.x) <= PERFECT_TOLERANCE && Math.abs(sliding.width - topBar.width) <= PERFECT_TOLERANCE;

    const newBar: StackedBar = {
      x: isPerfect ? topBar.x : overlapLeft,
      width: isPerfect ? topBar.width : overlapWidth,
      shade: (stackRef.current.length) % 2,
    };

    const points = isPerfect ? 6 : 1;
    scoreRef.current += points;
    heightRef.current += 1;
    setScore(scoreRef.current);
    setHeight(heightRef.current);

    if (isPerfect) {
      setPerfectText(true);
      setTimeout(() => setPerfectText(false), 600);
    }

    // Add falling overhang piece
    if (!isPerfect) {
      const id = ++fallingIdRef.current;
      const isLeftOverhang = sliding.x < topBar.x;
      const piece: FallingPiece = {
        id,
        x: isLeftOverhang ? sliding.x : overlapRight,
        width: sliding.width - overlapWidth,
        y: 0,
        side: isLeftOverhang ? 'left' : 'right',
      };
      setFallingPieces(prev => [...prev, piece]);
      setTimeout(() => {
        setFallingPieces(prev => prev.filter(p => p.id !== id));
      }, 600);
    }

    const newStack = [...stackRef.current, newBar];
    stackRef.current = newStack;
    setStack(newStack);

    // Set up next sliding bar
    slidingRef.current = { x: directionRef.current === 1 ? 0 : GAME_WIDTH - newBar.width, width: newBar.width };
    directionRef.current = 1;
  }, [phase, cleanup, onGameEnd]);

  // Visible portion of the stack (camera pan)
  const visibleBars = 12;
  const cameraOffset = Math.max(0, stack.length - visibleBars) * BAR_HEIGHT;

  const goldGradient = (shade: number) =>
    shade === 0
      ? 'linear-gradient(90deg, #F0D68A 0%, #D4A843 40%, #CA8A04 100%)'
      : 'linear-gradient(90deg, #D4A843 0%, #CA8A04 40%, #A37E24 100%)';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1a1207] to-[#0d0a04]"
      role="dialog"
      aria-label={t.goldStack}
      onPointerDown={phase === 'playing' ? handleDrop : undefined}
    >
      {/* Start screen */}
      {phase === 'start' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <p className="text-5xl">🏗️</p>
          <h2 className="text-2xl font-bold text-gold-200">{t.goldStack}</h2>
          <p className="text-ink-faint text-sm text-center">{t.stackGoldBars}</p>
          {highScore > 0 && (
            <p className="text-xs text-ink-faint">{t.highScore}: <strong className="text-white">{localizeNum(highScore)}</strong></p>
          )}
          <button
            onClick={startGame}
            className="mt-4 px-10 py-4 rounded-full bg-gold-500 text-ink font-bold text-lg cursor-pointer hover:bg-gold-400 transition-colors"
            aria-label={t.tapToStart}
          >
            {t.tapToStart}
          </button>
          <button
            onClick={onClose}
            className="text-ink-faint text-sm underline cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && (
        <>
          {/* HUD */}
          <div className="flex items-center justify-between px-4 py-3 pointer-events-none">
            <p className="text-sm font-bold text-gold-200">{t.score}: {localizeNum(score)}</p>
            <p className="text-sm text-ink-faint">{t.height}: {localizeNum(height)}</p>
          </div>

          {/* Perfect text */}
          {perfectText && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <p className="text-2xl font-black text-gold-200" style={{ animation: 'stack-perfect 0.6s ease-out forwards' }}>
                {t.perfect} +6
              </p>
            </div>
          )}

          {/* Game area */}
          <div className="flex-1 flex items-end justify-center overflow-hidden">
            <div className="relative" style={{ width: GAME_WIDTH, height: '100%' }}>
              {/* Stacked bars */}
              <div
                className="absolute bottom-0 left-0 right-0 transition-transform duration-200"
                style={{ transform: `translateY(-${cameraOffset}px)` }}
              >
                {stack.map((bar, i) => (
                  <div
                    key={i}
                    className="absolute border border-gold-700/50"
                    style={{
                      left: bar.x,
                      bottom: i * BAR_HEIGHT,
                      width: bar.width,
                      height: BAR_HEIGHT,
                      background: goldGradient(bar.shade),
                      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.15)',
                    }}
                  />
                ))}

                {/* Falling overhang pieces */}
                {fallingPieces.map(piece => (
                  <div
                    key={piece.id}
                    className="absolute border border-gold-700/50"
                    style={{
                      left: piece.x,
                      bottom: stack.length * BAR_HEIGHT,
                      width: piece.width,
                      height: BAR_HEIGHT,
                      background: goldGradient(stack.length % 2),
                      animation: 'overhang-fall 0.6s ease-in forwards',
                    }}
                  />
                ))}

                {/* Sliding bar */}
                {slidingBar && (
                  <div
                    className="absolute border-2 border-gold-200/60"
                    style={{
                      left: slidingBar.x,
                      bottom: stack.length * BAR_HEIGHT,
                      width: slidingBar.width,
                      height: BAR_HEIGHT,
                      background: goldGradient(stack.length % 2),
                      boxShadow: '0 0 12px rgba(212,168,67,0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
                    }}
                  />
                )}
              </div>

              {/* Tap instruction */}
              <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
                <p className="text-xs text-ink-faint/50">{t.tapToDrop}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Game Over */}
      {phase === 'over' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-5xl">🏗️</p>
          <h2 className="text-2xl font-bold text-gold-200">{t.gameOver}</h2>
          <p className="text-4xl font-bold text-white">{localizeNum(score)}</p>
          {score > highScore && score > 0 && (
            <p className="text-emerald-400 font-bold text-sm animate-pulse">{t.newHighScore}</p>
          )}
          <p className="text-ink-faint text-sm">{t.height}: {localizeNum(height)} {t.bars}</p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-full bg-gold-500 text-ink font-bold cursor-pointer hover:bg-gold-400 transition-colors"
            >
              {t.playAgain}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-white/10 text-white font-bold cursor-pointer hover:bg-white/20 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -20`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/GoldStackGame.tsx apps/web/src/index.css
git commit -m "feat: add GoldStackGame stacking arcade with sliding bars and camera pan"
```

---

## Task 8: Create GoldStackCard and Wire Into Play Tab

**Files:**
- Create: `apps/web/src/components/GoldStackCard.tsx`
- Modify: `apps/web/src/App.tsx` (add import + card)

- [ ] **Step 1: Create the card component**

Create `apps/web/src/components/GoldStackCard.tsx`:

```typescript
import { useState } from 'react';
import { useLocale } from '../i18n';
import { useGoldStack } from '../hooks/useGoldStack';
import { GoldStackGame } from './GoldStackGame';

export function GoldStackCard() {
  const { t, localizeNum } = useLocale();
  const { highScore, bestHeight, submitScore } = useGoldStack();
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <div className="glass-card rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-1">{t.goldStack}</p>
            <p className="text-[13px] text-ink-muted dark:text-ink-faint">{t.stackGoldBars}</p>
            {highScore > 0 && (
              <p className="text-[12px] text-ink-faint mt-1">
                {t.highScore}: <strong className="text-ink dark:text-white">{localizeNum(highScore)}</strong>
                {' · '}{t.bestHeight}: <strong className="text-ink dark:text-white">{localizeNum(bestHeight)}</strong>
              </p>
            )}
          </div>
          <button
            onClick={() => setPlaying(true)}
            className="px-6 py-3 rounded-full bg-amber-500 text-ink font-bold text-[14px] cursor-pointer hover:bg-amber-400 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            {t.play}
          </button>
        </div>
      </div>

      {playing && (
        <GoldStackGame
          highScore={highScore}
          onGameEnd={submitScore}
          onClose={() => setPlaying(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Add import to App.tsx**

In `apps/web/src/App.tsx`, add after the `GoldQuizCard` import:

```typescript
import { GoldStackCard } from './components/GoldStackCard';
```

- [ ] **Step 3: Add GoldStackCard to Play tab**

In `apps/web/src/App.tsx`, add after `<GoldQuizCard />` in the Play tab section:

```typescript
              <GoldStackCard />
```

- [ ] **Step 4: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -10`

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/GoldStackCard.tsx apps/web/src/App.tsx
git commit -m "feat: add Gold Stack card to Play tab"
```

---

## Task 9: Create useGoldTrader Hook

**Files:**
- Create: `apps/web/src/hooks/useGoldTrader.ts`

- [ ] **Step 1: Create the hook**

Create `apps/web/src/hooks/useGoldTrader.ts`:

```typescript
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'bullion-gold-trader';
const INITIAL_CASH = 500_000;

export interface Trade {
  date: string;
  action: 'buy' | 'sell';
  tola: number;
  pricePerTola: number;
  total: number;
}

interface GoldTraderState {
  cash: number;
  goldTola: number;
  trades: Trade[];
  portfolioHistory: { date: string; value: number }[];
  startDate: string;
  lastTradeDate: string;
}

/** Get current Nepal date string (UTC+5:45) as YYYY-MM-DD */
function getNepalDate(): string {
  const now = new Date();
  const nepalOffset = 5 * 60 + 45; // minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const nepalMinutes = utcMinutes + nepalOffset;
  const nepalDate = new Date(now);
  nepalDate.setUTCMinutes(nepalDate.getUTCMinutes() + nepalOffset);
  return nepalDate.toISOString().slice(0, 10);
}

function defaultState(): GoldTraderState {
  return {
    cash: INITIAL_CASH,
    goldTola: 0,
    trades: [],
    portfolioHistory: [],
    startDate: getNepalDate(),
    lastTradeDate: '',
  };
}

function loadState(): GoldTraderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return defaultState();
}

function saveState(state: GoldTraderState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function useGoldTrader() {
  const [state, setState] = useState<GoldTraderState>(loadState);

  const hasTradedToday = state.lastTradeDate === getNepalDate();

  const executeTrade = useCallback((action: 'buy' | 'sell', tola: number, pricePerTola: number) => {
    setState(prev => {
      const today = getNepalDate();
      if (prev.lastTradeDate === today) return prev; // already traded

      const total = tola * pricePerTola;

      if (action === 'buy' && total > prev.cash) return prev; // can't afford
      if (action === 'sell' && tola > prev.goldTola) return prev; // don't have enough

      const trade: Trade = { date: today, action, tola, pricePerTola, total };

      const newCash = action === 'buy' ? prev.cash - total : prev.cash + total;
      const newGold = action === 'buy' ? prev.goldTola + tola : prev.goldTola - tola;
      const portfolioValue = newCash + newGold * pricePerTola;

      const next: GoldTraderState = {
        ...prev,
        cash: Math.round(newCash * 100) / 100,
        goldTola: Math.round(newGold * 10000) / 10000,
        trades: [trade, ...prev.trades].slice(0, 30), // keep last 30
        portfolioHistory: [
          ...prev.portfolioHistory,
          { date: today, value: Math.round(portfolioValue) },
        ].slice(-30), // keep last 30
        lastTradeDate: today,
      };
      saveState(next);
      return next;
    });
  }, []);

  const resetPortfolio = useCallback(() => {
    const fresh = defaultState();
    saveState(fresh);
    setState(fresh);
  }, []);

  const getPortfolioValue = useCallback((currentPrice: number) => {
    return state.cash + state.goldTola * currentPrice;
  }, [state.cash, state.goldTola]);

  const getPnL = useCallback((currentPrice: number) => {
    const currentValue = state.cash + state.goldTola * currentPrice;
    const pnl = currentValue - INITIAL_CASH;
    const pnlPercent = (pnl / INITIAL_CASH) * 100;
    return { pnl, pnlPercent };
  }, [state.cash, state.goldTola]);

  return {
    cash: state.cash,
    goldTola: state.goldTola,
    trades: state.trades,
    portfolioHistory: state.portfolioHistory,
    startDate: state.startDate,
    hasTradedToday,
    executeTrade,
    resetPortfolio,
    getPortfolioValue,
    getPnL,
  };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -10`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/hooks/useGoldTrader.ts
git commit -m "feat: add useGoldTrader hook with daily trade limit and portfolio tracking"
```

---

## Task 10: Create GoldTraderGame Component

**Files:**
- Create: `apps/web/src/components/GoldTraderGame.tsx`

- [ ] **Step 1: Create the trading view component**

Create `apps/web/src/components/GoldTraderGame.tsx`:

```typescript
import { useState, useMemo } from 'react';
import { useLocale } from '../i18n';
import type { Trade } from '../hooks/useGoldTrader';

interface Props {
  cash: number;
  goldTola: number;
  trades: Trade[];
  portfolioHistory: { date: string; value: number }[];
  hasTradedToday: boolean;
  currentPrice: number;
  getPortfolioValue: (price: number) => number;
  getPnL: (price: number) => { pnl: number; pnlPercent: number };
  onTrade: (action: 'buy' | 'sell', tola: number, pricePerTola: number) => void;
  onReset: () => void;
  onClose: () => void;
}

const QUICK_AMOUNTS = [0.5, 1, 2, 5];

export function GoldTraderGame({
  cash, goldTola, trades, portfolioHistory, hasTradedToday,
  currentPrice, getPortfolioValue, getPnL, onTrade, onReset, onClose,
}: Props) {
  const { t, localizeNum } = useLocale();
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [showReset, setShowReset] = useState(false);

  const portfolioValue = getPortfolioValue(currentPrice);
  const { pnl, pnlPercent } = getPnL(currentPrice);
  const pnlColor = pnl >= 0 ? 'text-emerald-400' : 'text-red-400';
  const pnlSign = pnl >= 0 ? '+' : '';

  const parsedAmount = parseFloat(amount) || 0;
  const tradeTotal = parsedAmount * currentPrice;
  const canTrade = !hasTradedToday && parsedAmount > 0 && (
    action === 'buy' ? tradeTotal <= cash : parsedAmount <= goldTola
  );

  const maxBuyable = currentPrice > 0 ? Math.floor((cash / currentPrice) * 10000) / 10000 : 0;
  const maxSellable = goldTola;

  const handleTrade = () => {
    if (!canTrade) return;
    onTrade(action, parsedAmount, currentPrice);
    setAmount('');
  };

  // Simple sparkline SVG
  const sparkline = useMemo(() => {
    if (portfolioHistory.length < 2) return null;
    const values = portfolioHistory.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 280;
    const h = 60;
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    }).join(' ');
    const lastValue = values[values.length - 1];
    const color = lastValue >= 500_000 ? '#10B981' : '#EF4444';
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 mt-2" preserveAspectRatio="none">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  }, [portfolioHistory]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1a1207] to-[#0d0a04] overflow-y-auto"
      role="dialog"
      aria-label={t.goldTrader}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-bold text-gold-200">{t.goldTrader}</h2>
        <button
          onClick={onClose}
          className="text-ink-faint text-sm underline cursor-pointer"
        >
          {t.cancel}
        </button>
      </div>

      <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Portfolio summary */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">{t.portfolio}</p>
          <p className="text-3xl font-bold text-white">
            Rs {localizeNum(Math.round(portfolioValue).toLocaleString('en-IN'))}
          </p>
          <p className={`text-sm font-semibold ${pnlColor}`}>
            {pnlSign}Rs {localizeNum(Math.abs(Math.round(pnl)).toLocaleString('en-IN'))} ({pnlSign}{pnlPercent.toFixed(1)}%)
          </p>
          {sparkline}
        </div>

        {/* Holdings breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">{t.cash}</p>
            <p className="text-lg font-bold text-white">Rs {localizeNum(Math.round(cash).toLocaleString('en-IN'))}</p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">{t.holdings}</p>
            <p className="text-lg font-bold text-gold-200">{localizeNum(goldTola.toFixed(2))} {t.tola}</p>
          </div>
        </div>

        {/* Current price */}
        <div className="text-center py-2">
          <p className="text-xs text-ink-faint">{t.gold} {t.perTola}</p>
          <p className="text-xl font-bold text-white">Rs {localizeNum(currentPrice.toLocaleString('en-IN'))}</p>
        </div>

        {/* Trade form */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          {hasTradedToday ? (
            <div className="text-center py-4">
              <p className="text-ink-faint text-sm">{t.tradeToday}</p>
              <p className="text-xs text-ink-faint/60 mt-1">Come back tomorrow!</p>
            </div>
          ) : (
            <>
              {/* Buy/Sell toggle */}
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                  onClick={() => setAction('buy')}
                  className={`flex-1 py-2 text-sm font-bold cursor-pointer transition-colors ${
                    action === 'buy' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-ink-faint'
                  }`}
                >
                  {t.buy}
                </button>
                <button
                  onClick={() => setAction('sell')}
                  className={`flex-1 py-2 text-sm font-bold cursor-pointer transition-colors ${
                    action === 'sell' ? 'bg-red-500 text-white' : 'bg-white/5 text-ink-faint'
                  }`}
                >
                  {t.sell}
                </button>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-xs text-ink-faint block mb-1">
                  Amount ({t.tola}) — max: {localizeNum((action === 'buy' ? maxBuyable : maxSellable).toFixed(2))}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  max={action === 'buy' ? maxBuyable : maxSellable}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 text-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2">
                {QUICK_AMOUNTS.map(qa => (
                  <button
                    key={qa}
                    onClick={() => setAmount(String(qa))}
                    className="flex-1 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    {localizeNum(qa)}
                  </button>
                ))}
                <button
                  onClick={() => setAmount(String(action === 'buy' ? maxBuyable : maxSellable))}
                  className="flex-1 py-1.5 rounded-lg bg-white/10 text-gold-200 text-xs font-medium cursor-pointer hover:bg-white/20 transition-colors"
                >
                  All
                </button>
              </div>

              {/* Trade summary + button */}
              {parsedAmount > 0 && (
                <p className="text-xs text-ink-faint text-center">
                  {action === 'buy' ? 'Cost' : 'Proceeds'}: Rs {localizeNum(Math.round(tradeTotal).toLocaleString('en-IN'))}
                </p>
              )}
              <button
                onClick={handleTrade}
                disabled={!canTrade}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  canTrade
                    ? action === 'buy'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                      : 'bg-red-500 text-white hover:bg-red-400'
                    : 'bg-white/10 text-ink-faint cursor-not-allowed'
                }`}
              >
                {action === 'buy' ? t.buy : t.sell} {parsedAmount > 0 ? `${localizeNum(parsedAmount)} ${t.tola}` : ''}
              </button>
            </>
          )}
        </div>

        {/* Trade history */}
        <div className="glass-card rounded-xl p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-2">Recent Trades</p>
          {trades.length === 0 ? (
            <p className="text-sm text-ink-faint text-center py-2">{t.noTradesYet}</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trades.slice(0, 10).map((trade, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${trade.action === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.action === 'buy' ? t.buy : t.sell}
                    </span>
                    <span className="text-white">{localizeNum(trade.tola)} {t.tola}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-faint">Rs {localizeNum(Math.round(trade.total).toLocaleString('en-IN'))}</span>
                    <span className="text-ink-faint/50 ml-2">{trade.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset button */}
        <div className="text-center pt-2 pb-8">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-xs text-ink-faint/50 underline cursor-pointer"
            >
              {t.resetPortfolio}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-ink-faint">{t.confirmReset}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => { onReset(); setShowReset(false); }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold cursor-pointer hover:bg-red-500/30"
                >
                  {t.confirm}
                </button>
                <button
                  onClick={() => setShowReset(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-ink-faint text-xs cursor-pointer hover:bg-white/20"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -20`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/GoldTraderGame.tsx
git commit -m "feat: add GoldTraderGame trading view with portfolio, sparkline, and trade history"
```

---

## Task 11: Create GoldTraderCard and Wire Into Play Tab

**Files:**
- Create: `apps/web/src/components/GoldTraderCard.tsx`
- Modify: `apps/web/src/App.tsx` (add import + card + pass price data)

- [ ] **Step 1: Create the card component**

Create `apps/web/src/components/GoldTraderCard.tsx`:

```typescript
import { useState } from 'react';
import { useLocale } from '../i18n';
import { useGoldTrader } from '../hooks/useGoldTrader';
import { GoldTraderGame } from './GoldTraderGame';

interface Props {
  goldPricePerTola: number | null;
}

export function GoldTraderCard({ goldPricePerTola }: Props) {
  const { t, localizeNum } = useLocale();
  const {
    cash, goldTola, trades, portfolioHistory, hasTradedToday,
    executeTrade, resetPortfolio, getPortfolioValue, getPnL,
  } = useGoldTrader();
  const [trading, setTrading] = useState(false);

  const currentPrice = goldPricePerTola ?? 0;
  const portfolioValue = getPortfolioValue(currentPrice);
  const { pnl } = getPnL(currentPrice);
  const pnlColor = pnl >= 0 ? 'text-emerald-500' : 'text-red-500';
  const pnlSign = pnl >= 0 ? '+' : '';

  return (
    <>
      <div className="glass-card rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint mb-1">{t.goldTrader}</p>
            <p className="text-[13px] text-ink-muted dark:text-ink-faint">{t.virtualTrading}</p>
            {currentPrice > 0 && (
              <div className="mt-1 space-y-0.5">
                <p className="text-[12px] text-ink-faint">
                  {t.portfolio}: <strong className="text-ink dark:text-white">Rs {localizeNum(Math.round(portfolioValue).toLocaleString('en-IN'))}</strong>
                </p>
                <p className={`text-[11px] font-semibold ${pnlColor}`}>
                  {pnlSign}{pnl >= 0 ? '' : ''}Rs {localizeNum(Math.abs(Math.round(pnl)).toLocaleString('en-IN'))}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setTrading(true)}
            disabled={!currentPrice}
            className="px-6 py-3 rounded-full bg-blue-500 text-white font-bold text-[14px] cursor-pointer hover:bg-blue-400 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.trade}
          </button>
        </div>
      </div>

      {trading && currentPrice > 0 && (
        <GoldTraderGame
          cash={cash}
          goldTola={goldTola}
          trades={trades}
          portfolioHistory={portfolioHistory}
          hasTradedToday={hasTradedToday}
          currentPrice={currentPrice}
          getPortfolioValue={getPortfolioValue}
          getPnL={getPnL}
          onTrade={executeTrade}
          onReset={resetPortfolio}
          onClose={() => setTrading(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Add import to App.tsx**

In `apps/web/src/App.tsx`, add after the `GoldStackCard` import:

```typescript
import { GoldTraderCard } from './components/GoldTraderCard';
```

- [ ] **Step 3: Add GoldTraderCard to Play tab with price prop**

In `apps/web/src/App.tsx`, add after `<GoldStackCard />` in the Play tab section:

```typescript
              <GoldTraderCard goldPricePerTola={goldNepalPrice} />
```

Note: `goldNepalPrice` is already computed in App.tsx (used by PredictionCard and CalculatorPage). Verify the variable name by checking the existing code — it should be something like:
```typescript
const goldNepalPrice = data?.gold?.nepal?.hallmark ?? null;
```

- [ ] **Step 4: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm --filter web exec tsc --noEmit 2>&1 | head -10`

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/GoldTraderCard.tsx apps/web/src/App.tsx
git commit -m "feat: add Gold Trader card to Play tab with live price integration"
```

---

## Task 12: Manual Testing and Polish

**Files:**
- Possibly modify any of the above files for fixes

- [ ] **Step 1: Start the dev server**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/nepal-bullion-price && pnpm dev`

Open the app in a browser and navigate to the Play tab.

- [ ] **Step 2: Test Gold Quiz**

- Tap "Play" on the Gold Quiz card
- Verify: start screen shows, tap Play starts the round
- Answer a few questions correctly — verify score increases with speed bonus
- Answer wrong — verify life decreases, correct answer highlights green
- Let timer run out — verify it counts as wrong
- Lose all lives — verify game over screen
- Get a new high score — verify confetti fires
- Close and reopen — verify high score persists
- Switch to Nepali language — verify translated questions appear

- [ ] **Step 3: Test Gold Stack Tower**

- Tap "Play" on the Gold Stack card → "Tap to start"
- Verify: bar slides back and forth
- Tap to drop — verify overlap is kept, overhang falls away
- Get a perfect drop — verify "Perfect! +6" text appears
- Miss completely — verify game over
- Verify bars get narrower with misalignment
- Verify speed increases every 5 bars
- Verify camera pans upward as stack grows
- Verify high score and best height persist

- [ ] **Step 4: Test Gold Trader**

- Tap "Trade" on the Gold Trader card
- Verify: portfolio shows Rs 500,000 initial cash
- Buy some gold — verify cash decreases, holdings increase
- Close and reopen — verify state persists
- Try to trade again same day — verify "Already traded today" message
- Check P&L calculation makes sense
- Test quick amount buttons (0.5, 1, 2, 5, All)
- Test reset portfolio — verify confirmation dialog, then fresh state
- Verify sparkline appears after 2+ trades on different days

- [ ] **Step 5: Test accessibility**

- Verify all game overlays have `role="dialog"`
- Tab through quiz answer buttons — verify focus is visible
- Check `prefers-reduced-motion` — quiz timer should still work, stack animations can be instant
- Verify ARIA labels on all buttons

- [ ] **Step 6: Fix any issues found and commit**

```bash
git add -A
git commit -m "fix: polish new games after manual testing"
```
