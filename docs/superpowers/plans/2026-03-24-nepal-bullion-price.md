# nepal-bullion-price Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an npm package (`nepal-bullion-price`) that fetches Nepal's gold/silver prices from multiple sources with fallbacks, plus a React dashboard UI.

**Architecture:** Turborepo monorepo with two workspaces — `packages/nepal-bullion-price` (server-side Node.js library with scraping + API providers, fallback engine, caching, tax calculator) and `apps/web` (Vite React SPA + Hono API server that wraps the package). The package is server-side only due to CORS restrictions on scraped sources.

**Tech Stack:** TypeScript, tsup (build), cheerio (HTML parsing), Hono (API server), React 18, Tailwind CSS v4, Vite, Turborepo

**Spec:** `docs/superpowers/specs/2026-03-24-nepal-bullion-price-design.md`

---

## File Structure

```
packages/nepal-bullion-price/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── index.ts              # public API: re-exports all functions + types
│   ├── types.ts              # all TypeScript interfaces
│   ├── config.ts             # configure() singleton + default rates
│   ├── cache.ts              # in-memory TTL cache
│   ├── fallback.ts           # tryProviders() fallback engine
│   ├── calculator.ts         # tax breakdown math
│   ├── constants.ts          # GRAMS_PER_TROY_OZ, GRAMS_PER_TOLA
│   ├── providers/
│   │   ├── nepal-price/
│   │   │   ├── fenegosida.ts     # primary: scrape fenegosida.org
│   │   │   ├── ashesh.ts         # fallback 1: scrape ashesh.com.np widget
│   │   │   └── hamropatro.ts     # fallback 2: scrape hamropatro.com/gold
│   │   ├── live-price/
│   │   │   ├── gold-api.ts       # primary: api.gold-api.com (free, no auth)
│   │   │   ├── swissquote.ts     # fallback 1: swissquote forex feed
│   │   │   └── goldapi-io.ts     # fallback 2: goldapi.io (needs key)
│   │   └── forex/
│   │       ├── nrb.ts            # primary: Nepal Rastra Bank API
│   │       ├── fawazahmed0.ts    # fallback 1: currency-api (jsDelivr + CF Pages)
│   │       └── exchangerate-api.ts # fallback 2: open.er-api.com
│   └── __tests__/
│       ├── calculator.test.ts
│       ├── cache.test.ts
│       ├── fallback.test.ts
│       └── config.test.ts

apps/web/
├── package.json
├── vite.config.ts
├── server.ts                 # Hono API server
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── PriceCard.tsx
│   │   ├── TaxBreakdown.tsx
│   │   ├── LastUpdated.tsx
│   │   └── Header.tsx
│   ├── hooks/
│   │   └── useBullionPrices.ts
│   └── index.css             # Tailwind imports
```

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `package.json` (workspace root)
- Create: `turbo.json`
- Create: `packages/nepal-bullion-price/package.json`
- Create: `packages/nepal-bullion-price/tsconfig.json`
- Create: `packages/nepal-bullion-price/tsup.config.ts`
- [ ] **Step 1: Create root `package.json` with workspaces**

Note: `apps/*` workspace is NOT included yet — it will be added in Task 11 when the web app is created. This avoids npm install failures.

```json
{
  "name": "nepal-bullion-price-monorepo",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "^2"
  }
}
```

- [ ] **Step 2: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 3: Create `packages/nepal-bullion-price/package.json`**

```json
{
  "name": "nepal-bullion-price",
  "version": "0.1.0",
  "description": "Nepal gold and silver prices — FENEGOSIDA daily rates + live international prices with tax breakdown",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "keywords": ["nepal", "gold", "silver", "bullion", "price", "fenegosida", "nepal-gold-price"],
  "license": "MIT",
  "dependencies": {
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "tsup": "^8",
    "typescript": "^5",
    "vitest": "^3"
  }
}
```

- [ ] **Step 4: Create `packages/nepal-bullion-price/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create `packages/nepal-bullion-price/tsup.config.ts`**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
});
```

- [ ] **Step 6: Create placeholder `packages/nepal-bullion-price/src/index.ts`**

```typescript
export const VERSION = '0.1.0';
```

- [ ] **Step 7: Install dependencies and verify build**

Run: `npm install && npx turbo build`
Expected: Build succeeds, `packages/nepal-bullion-price/dist/` contains `index.js`, `index.cjs`, `index.d.ts`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "scaffold monorepo with turborepo and nepal-bullion-price package"
```

---

## Task 2: Types & Constants

**Files:**
- Create: `packages/nepal-bullion-price/src/types.ts`
- Create: `packages/nepal-bullion-price/src/constants.ts`

- [ ] **Step 1: Create `types.ts`**

```typescript
export interface NepalGoldPrice {
  hallmark: number;
  tajabi: number;
  unit: 'tola';
  perGram10: number;
  source: string;
  date: string;
  updatedAt: string;
  isStale: boolean;
}

export interface NepalSilverPrice {
  price: number;
  unit: 'tola';
  perGram10: number;
  source: string;
  date: string;
  updatedAt: string;
  isStale: boolean;
}

export interface TaxBreakdown {
  basePrice: number;
  customDuty: number;
  bankMargin: number;
  dealerMargin: number;
  estimatedPrice: number;
  luxuryTax: number;
  consumerPrice: number;
}

export interface LiveMetalPrice {
  raw: {
    usdPerOz: number;
    usdToNpr: number;
  };
  perTola: TaxBreakdown;
  rates: TaxRates;
  source: string;
  updatedAt: string;
  isStale: boolean;
}

export interface TaxRates {
  customDuty: number;
  bankMargin: number;
  dealerMargin: number;
  luxuryTax: number;
}

export interface Config {
  rates: TaxRates;
  apiKeys: {
    goldApiIo?: string;
  };
  cacheTtl: number;
}

export interface AllPrices {
  gold: {
    nepal: NepalGoldPrice | null;
    live: LiveMetalPrice | null;
  };
  silver: {
    nepal: NepalSilverPrice | null;
    live: LiveMetalPrice | null;
  };
}

export interface NepalPriceData {
  goldHallmark: number;
  goldTajabi: number;
  silver: number;
  goldHallmarkPerGram10: number;
  goldTajabiPerGram10: number;
  silverPerGram10: number;
  date: string;
}

export interface LivePriceData {
  priceUsd: number;
  symbol: string;
  updatedAt: string;
}

export interface ForexData {
  usdToNpr: number;
  updatedAt: string;
}

export interface Provider<T> {
  name: string;
  fetch: () => Promise<T>;
}
```

- [ ] **Step 2: Create `constants.ts`**

```typescript
export const GRAMS_PER_TROY_OZ = 31.1035;
export const GRAMS_PER_TOLA = 11.6638;
export const DEFAULT_TIMEOUT_MS = 10_000;
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
```

- [ ] **Step 3: Commit**

```bash
git add packages/nepal-bullion-price/src/types.ts packages/nepal-bullion-price/src/constants.ts
git commit -m "add TypeScript types and constants for nepal-bullion-price"
```

---

## Task 3: Config Module

**Files:**
- Create: `packages/nepal-bullion-price/src/config.ts`
- Create: `packages/nepal-bullion-price/src/__tests__/config.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getConfig, configure, resetConfig } from '../config.js';

describe('config', () => {
  beforeEach(() => resetConfig());

  it('returns default config', () => {
    const config = getConfig();
    expect(config.rates.customDuty).toBe(0.10);
    expect(config.rates.bankMargin).toBe(0.005);
    expect(config.rates.dealerMargin).toBe(0.005);
    expect(config.rates.luxuryTax).toBe(0.02);
    expect(config.cacheTtl).toBe(300_000);
    expect(config.apiKeys).toEqual({});
  });

  it('merges partial config', () => {
    configure({ rates: { customDuty: 0.06 } });
    const config = getConfig();
    expect(config.rates.customDuty).toBe(0.06);
    expect(config.rates.bankMargin).toBe(0.005); // unchanged
  });

  it('sets API keys', () => {
    configure({ apiKeys: { goldApiIo: 'test-key' } });
    expect(getConfig().apiKeys.goldApiIo).toBe('test-key');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/nepal-bullion-price && npx vitest run src/__tests__/config.test.ts`
Expected: FAIL — cannot find module `../config.js`

- [ ] **Step 3: Implement `config.ts`**

```typescript
import type { Config, TaxRates } from './types.js';
import { DEFAULT_CACHE_TTL_MS } from './constants.js';

const DEFAULT_RATES: TaxRates = {
  customDuty: 0.10,
  bankMargin: 0.005,
  dealerMargin: 0.005,
  luxuryTax: 0.02,
};

const DEFAULT_CONFIG: Config = {
  rates: { ...DEFAULT_RATES },
  apiKeys: {},
  cacheTtl: DEFAULT_CACHE_TTL_MS,
};

let currentConfig: Config = structuredClone(DEFAULT_CONFIG);

export function getConfig(): Readonly<Config> {
  return currentConfig;
}

export function configure(partial: {
  rates?: Partial<TaxRates>;
  apiKeys?: Config['apiKeys'];
  cacheTtl?: number;
}): void {
  if (partial.rates) {
    currentConfig.rates = { ...currentConfig.rates, ...partial.rates };
  }
  if (partial.apiKeys) {
    currentConfig.apiKeys = { ...currentConfig.apiKeys, ...partial.apiKeys };
  }
  if (partial.cacheTtl !== undefined) {
    currentConfig.cacheTtl = partial.cacheTtl;
  }
}

export function resetConfig(): void {
  currentConfig = structuredClone(DEFAULT_CONFIG);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/nepal-bullion-price && npx vitest run src/__tests__/config.test.ts`
Expected: PASS — all 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/nepal-bullion-price/src/config.ts packages/nepal-bullion-price/src/__tests__/config.test.ts
git commit -m "add config module with defaults and partial override support"
```

---

## Task 4: Cache Module

**Files:**
- Create: `packages/nepal-bullion-price/src/cache.ts`
- Create: `packages/nepal-bullion-price/src/__tests__/cache.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Cache } from '../cache.js';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>(1000); // 1s TTL
  });

  it('returns undefined for missing key', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('stores and retrieves values', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('returns undefined for expired entries', () => {
    vi.useFakeTimers();
    cache.set('key', 'value');
    vi.advanceTimersByTime(1001);
    expect(cache.get('key')).toBeUndefined();
    vi.useRealTimers();
  });

  it('getStale returns expired entries', () => {
    vi.useFakeTimers();
    cache.set('key', 'value');
    vi.advanceTimersByTime(1001);
    expect(cache.get('key')).toBeUndefined();
    expect(cache.getStale('key')).toBe('value');
    vi.useRealTimers();
  });

  it('getStale returns undefined if never set', () => {
    expect(cache.getStale('never')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/nepal-bullion-price && npx vitest run src/__tests__/cache.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `cache.ts`**

```typescript
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) return undefined;
    return entry.value;
  }

  getStale(key: string): T | undefined {
    return this.store.get(key)?.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/nepal-bullion-price && npx vitest run src/__tests__/cache.test.ts`
Expected: PASS — all 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/nepal-bullion-price/src/cache.ts packages/nepal-bullion-price/src/__tests__/cache.test.ts
git commit -m "add in-memory TTL cache with stale-read support"
```

---

## Task 5: Fallback Engine

**Files:**
- Create: `packages/nepal-bullion-price/src/fallback.ts`
- Create: `packages/nepal-bullion-price/src/__tests__/fallback.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { tryProviders } from '../fallback.js';
import type { Provider } from '../types.js';

describe('tryProviders', () => {
  it('returns first successful provider result', async () => {
    const providers: Provider<number>[] = [
      { name: 'first', fetch: async () => 42 },
      { name: 'second', fetch: async () => 99 },
    ];
    const result = await tryProviders(providers);
    expect(result).toEqual({ data: 42, source: 'first' });
  });

  it('skips failed providers and returns next success', async () => {
    const providers: Provider<number>[] = [
      { name: 'fail', fetch: async () => { throw new Error('down'); } },
      { name: 'ok', fetch: async () => 42 },
    ];
    const result = await tryProviders(providers);
    expect(result).toEqual({ data: 42, source: 'ok' });
  });

  it('returns null when all providers fail', async () => {
    const providers: Provider<number>[] = [
      { name: 'a', fetch: async () => { throw new Error('a'); } },
      { name: 'b', fetch: async () => { throw new Error('b'); } },
    ];
    const result = await tryProviders(providers);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/nepal-bullion-price && npx vitest run src/__tests__/fallback.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `fallback.ts`**

```typescript
import type { Provider } from './types.js';

export interface ProviderResult<T> {
  data: T;
  source: string;
}

export async function tryProviders<T>(
  providers: Provider<T>[],
): Promise<ProviderResult<T> | null> {
  for (const provider of providers) {
    try {
      const data = await provider.fetch();
      return { data, source: provider.name };
    } catch {
      // Provider failed, try next
    }
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/nepal-bullion-price && npx vitest run src/__tests__/fallback.test.ts`
Expected: PASS — all 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/nepal-bullion-price/src/fallback.ts packages/nepal-bullion-price/src/__tests__/fallback.test.ts
git commit -m "add fallback engine that tries providers sequentially"
```

---

## Task 6: Tax Calculator

**Files:**
- Create: `packages/nepal-bullion-price/src/calculator.ts`
- Create: `packages/nepal-bullion-price/src/__tests__/calculator.test.ts`

- [ ] **Step 1: Write failing test using the spec's worked example**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTaxBreakdown } from '../calculator.js';

describe('calculateTaxBreakdown', () => {
  const rates = {
    customDuty: 0.10,
    bankMargin: 0.005,
    dealerMargin: 0.005,
    luxuryTax: 0.02,
  };

  it('matches the spec worked example', () => {
    // xauUsd=4333.40, usdToNpr=150.07
    const result = calculateTaxBreakdown(4333.40, 150.07, rates);
    expect(result.basePrice).toBe(243867);
    expect(result.customDuty).toBe(24387);
    expect(result.bankMargin).toBe(1341);
    expect(result.dealerMargin).toBe(1348);
    expect(result.estimatedPrice).toBe(270943);
    expect(result.luxuryTax).toBe(5419);
    expect(result.consumerPrice).toBe(276362);
  });

  it('works with different rates', () => {
    const customRates = { ...rates, customDuty: 0.06 };
    const result = calculateTaxBreakdown(2000, 130, customRates);
    expect(result.basePrice).toBeGreaterThan(0);
    expect(result.consumerPrice).toBeGreaterThan(result.estimatedPrice);
  });

  it('handles zero price', () => {
    const result = calculateTaxBreakdown(0, 150, rates);
    expect(result.basePrice).toBe(0);
    expect(result.consumerPrice).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/nepal-bullion-price && npx vitest run src/__tests__/calculator.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `calculator.ts`**

```typescript
import type { TaxBreakdown, TaxRates } from './types.js';
import { GRAMS_PER_TROY_OZ, GRAMS_PER_TOLA } from './constants.js';

export function calculateTaxBreakdown(
  usdPerOz: number,
  usdToNpr: number,
  rates: TaxRates,
): TaxBreakdown {
  const basePrice = Math.round(
    (usdPerOz / GRAMS_PER_TROY_OZ) * GRAMS_PER_TOLA * usdToNpr,
  );

  const customDuty = Math.round(basePrice * rates.customDuty);
  const afterCustoms = basePrice + customDuty;

  const bankMargin = Math.round(afterCustoms * rates.bankMargin);
  const afterBank = afterCustoms + bankMargin;

  const dealerMargin = Math.round(afterBank * rates.dealerMargin);
  const estimatedPrice = afterBank + dealerMargin;

  const luxuryTax = Math.round(estimatedPrice * rates.luxuryTax);
  const consumerPrice = estimatedPrice + luxuryTax;

  return {
    basePrice,
    customDuty,
    bankMargin,
    dealerMargin,
    estimatedPrice,
    luxuryTax,
    consumerPrice,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/nepal-bullion-price && npx vitest run src/__tests__/calculator.test.ts`
Expected: PASS — all 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/nepal-bullion-price/src/calculator.ts packages/nepal-bullion-price/src/__tests__/calculator.test.ts
git commit -m "add tax breakdown calculator matching Nepal duty structure"
```

---

## Task 7: Nepal Price Providers (fenegosida, ashesh, hamropatro)

**Files:**
- Create: `packages/nepal-bullion-price/src/providers/nepal-price/fenegosida.ts`
- Create: `packages/nepal-bullion-price/src/providers/nepal-price/ashesh.ts`
- Create: `packages/nepal-bullion-price/src/providers/nepal-price/hamropatro.ts`

- [ ] **Step 1: Create `fenegosida.ts`**

```typescript
import * as cheerio from 'cheerio';
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

export async function fetchFenegosida(): Promise<NepalPriceData> {
  const res = await fetch('https://fenegosida.org/', {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`fenegosida.org returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // Page has two #header-rate blocks: first=per-tola, second=per-10g
  const headerRates = $('#header-rate');
  const tolaBlock = headerRates.first();
  const gramBlock = headerRates.last();

  const tolaValues = tolaBlock.find('.rate-gold.post b, .rate-silver.post b')
    .map((_, el) => parseInt($(el).text().replace(/,/g, ''), 10))
    .get();

  const gramValues = gramBlock.find('.rate-gold.post b, .rate-silver.post b')
    .map((_, el) => parseInt($(el).text().replace(/,/g, ''), 10))
    .get();

  if (tolaValues.length < 3) {
    throw new Error('Failed to parse fenegosida.org prices');
  }

  return {
    goldHallmark: tolaValues[0],
    goldTajabi: tolaValues[1],
    silver: tolaValues[2],
    goldHallmarkPerGram10: gramValues[0] ?? 0,
    goldTajabiPerGram10: gramValues[1] ?? 0,
    silverPerGram10: gramValues[2] ?? 0,
    date: new Date().toISOString().split('T')[0],
  };
}
```

- [ ] **Step 2: Create `ashesh.ts`**

```typescript
import * as cheerio from 'cheerio';
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

export async function fetchAshesh(): Promise<NepalPriceData> {
  const res = await fetch(
    'https://www.ashesh.com.np/gold/widget.php?api=402137q239&header_color=0077e5',
    { signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS) },
  );
  if (!res.ok) throw new Error(`ashesh.com.np returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const prices: number[] = [];
  $('.country').each((_, el) => {
    const price = parseInt(
      $(el).find('.rate_buying').text().replace(/,/g, '').trim(),
      10,
    );
    prices.push(isNaN(price) ? 0 : price);
  });

  // Order: Gold Hallmark Tola, Tajabi Tola, Silver Tola,
  //        Gold Hallmark 10g, Tajabi 10g, Silver 10g
  if (prices.length < 6) {
    throw new Error('Failed to parse ashesh.com.np widget');
  }

  const dateMatch = $('.header_date').text().match(/\d{4}-\d{2}-\d{2}/);
  const date = dateMatch?.[0] ?? new Date().toISOString().split('T')[0];

  return {
    goldHallmark: prices[0],
    goldTajabi: prices[1],
    silver: prices[2],
    goldHallmarkPerGram10: prices[3],
    goldTajabiPerGram10: prices[4],
    silverPerGram10: prices[5],
    date,
  };
}
```

- [ ] **Step 3: Create `hamropatro.ts`**

```typescript
import * as cheerio from 'cheerio';
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { NepalPriceData } from '../../types.js';

export async function fetchHamropatro(): Promise<NepalPriceData> {
  const res = await fetch('https://www.hamropatro.com/gold', {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`hamropatro.com returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const items = $('ul.gold-silver li')
    .map((_, el) => $(el).text().trim())
    .get();

  // Odd indices are prices: "Nrs. 275,500.00"
  const parsePrice = (text: string): number => {
    const match = text.match(/[\d,]+(?:\.\d+)?/);
    return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
  };

  if (items.length < 12) {
    throw new Error('Failed to parse hamropatro.com gold page');
  }

  // items[1]=Gold Hallmark tola, items[3]=Tajabi tola, items[5]=Silver tola
  // items[7]=Gold Hallmark 10g, items[9]=Tajabi 10g, items[11]=Silver 10g
  return {
    goldHallmark: parsePrice(items[1]),
    goldTajabi: parsePrice(items[3]),
    silver: parsePrice(items[5]),
    goldHallmarkPerGram10: parsePrice(items[7]),
    goldTajabiPerGram10: parsePrice(items[9]),
    silverPerGram10: parsePrice(items[11]),
    date: new Date().toISOString().split('T')[0],
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/nepal-bullion-price/src/providers/nepal-price/
git commit -m "add Nepal price providers: fenegosida, ashesh, hamropatro scrapers"
```

---

## Task 8: Live Price Providers (gold-api, swissquote, goldapi-io)

**Files:**
- Create: `packages/nepal-bullion-price/src/providers/live-price/gold-api.ts`
- Create: `packages/nepal-bullion-price/src/providers/live-price/swissquote.ts`
- Create: `packages/nepal-bullion-price/src/providers/live-price/goldapi-io.ts`

- [ ] **Step 1: Create `gold-api.ts`**

```typescript
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { LivePriceData } from '../../types.js';

export async function fetchGoldApi(symbol: 'XAU' | 'XAG'): Promise<LivePriceData> {
  const res = await fetch(`https://api.gold-api.com/price/${symbol}`, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`gold-api.com returned ${res.status}`);

  const data = await res.json();
  if (!data.price || typeof data.price !== 'number') {
    throw new Error('Invalid response from gold-api.com');
  }

  return {
    priceUsd: data.price,
    symbol,
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  };
}
```

- [ ] **Step 2: Create `swissquote.ts`**

```typescript
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { LivePriceData } from '../../types.js';

export async function fetchSwissquote(symbol: 'XAU' | 'XAG'): Promise<LivePriceData> {
  const res = await fetch(
    `https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${symbol}/USD`,
    { signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS) },
  );
  if (!res.ok) throw new Error(`swissquote returned ${res.status}`);

  const data = await res.json();
  const profiles = data?.[0]?.spreadProfilePrices;
  if (!Array.isArray(profiles) || profiles.length === 0) {
    throw new Error('Invalid response from swissquote');
  }

  // Use the first spread profile's mid price
  const first = profiles[0];
  const midPrice = (first.bid + first.ask) / 2;

  return {
    priceUsd: midPrice,
    symbol,
    updatedAt: new Date(data[0].ts).toISOString(),
  };
}
```

- [ ] **Step 3: Create `goldapi-io.ts`**

```typescript
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { LivePriceData } from '../../types.js';

export async function fetchGoldApiIo(
  symbol: 'XAU' | 'XAG',
  apiKey: string,
): Promise<LivePriceData> {
  const res = await fetch(`https://www.goldapi.io/api/${symbol}/USD`, {
    headers: { 'x-access-token': apiKey },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`goldapi.io returned ${res.status}`);

  const data = await res.json();
  if (!data.price || typeof data.price !== 'number') {
    throw new Error('Invalid response from goldapi.io');
  }

  return {
    priceUsd: data.price,
    symbol,
    updatedAt: data.timestamp
      ? new Date(data.timestamp * 1000).toISOString()
      : new Date().toISOString(),
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/nepal-bullion-price/src/providers/live-price/
git commit -m "add live price providers: gold-api, swissquote, goldapi-io"
```

---

## Task 9: Forex Providers (nrb, fawazahmed0, exchangerate-api)

**Files:**
- Create: `packages/nepal-bullion-price/src/providers/forex/nrb.ts`
- Create: `packages/nepal-bullion-price/src/providers/forex/fawazahmed0.ts`
- Create: `packages/nepal-bullion-price/src/providers/forex/exchangerate-api.ts`

- [ ] **Step 1: Create `nrb.ts`**

```typescript
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { ForexData } from '../../types.js';

export async function fetchNrb(): Promise<ForexData> {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1&from=${today}&to=${today}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`NRB API returned ${res.status}`);

  const json = await res.json();
  const payload = json?.data?.payload;
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('No NRB forex data for today');
  }

  const rates = payload[0].rates;
  const usd = rates?.find(
    (r: { currency: { iso3: string } }) => r.currency.iso3 === 'USD',
  );
  if (!usd) throw new Error('USD rate not found in NRB response');

  return {
    usdToNpr: parseFloat(usd.buy),
    updatedAt: payload[0].published_on ?? today,
  };
}
```

- [ ] **Step 2: Create `fawazahmed0.ts`**

```typescript
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { ForexData } from '../../types.js';

const URLS = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
  'https://latest.currency-api.pages.dev/v1/currencies/usd.json',
];

export async function fetchFawazahmed0(): Promise<ForexData> {
  let lastError: Error | undefined;

  for (const url of URLS) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });
      if (!res.ok) continue;

      const data = await res.json();
      const npr = data?.usd?.npr;
      if (typeof npr !== 'number') continue;

      return {
        usdToNpr: npr,
        updatedAt: data.date ?? new Date().toISOString().split('T')[0],
      };
    } catch (e) {
      lastError = e as Error;
    }
  }

  throw lastError ?? new Error('fawazahmed0 currency API failed');
}
```

- [ ] **Step 3: Create `exchangerate-api.ts`**

```typescript
import { DEFAULT_TIMEOUT_MS } from '../../constants.js';
import type { ForexData } from '../../types.js';

export async function fetchExchangeRateApi(): Promise<ForexData> {
  const res = await fetch('https://open.er-api.com/v6/latest/USD', {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`exchangerate-api returned ${res.status}`);

  const data = await res.json();
  const npr = data?.rates?.NPR;
  if (typeof npr !== 'number') {
    throw new Error('NPR rate not found in exchangerate-api response');
  }

  return {
    usdToNpr: npr,
    updatedAt: data.time_last_update_unix
      ? new Date(data.time_last_update_unix * 1000).toISOString()
      : new Date().toISOString(),
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/nepal-bullion-price/src/providers/forex/
git commit -m "add forex providers: NRB, fawazahmed0, exchangerate-api"
```

---

## Task 10: Public API — Wire Everything Together

**Files:**
- Create: `packages/nepal-bullion-price/src/index.ts` (overwrite placeholder)

- [ ] **Step 1: Implement `index.ts`**

```typescript
import { Cache } from './cache.js';
import { getConfig, configure, resetConfig } from './config.js';
import { tryProviders } from './fallback.js';
import { calculateTaxBreakdown } from './calculator.js';
import { fetchFenegosida } from './providers/nepal-price/fenegosida.js';
import { fetchAshesh } from './providers/nepal-price/ashesh.js';
import { fetchHamropatro } from './providers/nepal-price/hamropatro.js';
import { fetchGoldApi } from './providers/live-price/gold-api.js';
import { fetchSwissquote } from './providers/live-price/swissquote.js';
import { fetchGoldApiIo } from './providers/live-price/goldapi-io.js';
import { fetchNrb } from './providers/forex/nrb.js';
import { fetchFawazahmed0 } from './providers/forex/fawazahmed0.js';
import { fetchExchangeRateApi } from './providers/forex/exchangerate-api.js';
import type {
  NepalGoldPrice, NepalSilverPrice, LiveMetalPrice,
  AllPrices, NepalPriceData, LivePriceData, ForexData,
} from './types.js';

// Caches — use lazy getter so configure() changes are respected
function createCaches() {
  const ttl = getConfig().cacheTtl;
  return {
    nepal: new Cache<NepalPriceData>(ttl),
    live: new Cache<{ data: LivePriceData; source: string }>(ttl),
    forex: new Cache<{ data: ForexData; source: string }>(ttl),
  };
}
let caches = createCaches();

// Call after configure() to pick up new TTL
export function refreshCaches(): void {
  caches = createCaches();
}

function getNepalProviders() {
  return [
    { name: 'fenegosida.org', fetch: fetchFenegosida },
    { name: 'ashesh.com.np', fetch: fetchAshesh },
    { name: 'hamropatro.com', fetch: fetchHamropatro },
  ];
}

function getLiveProviders(symbol: 'XAU' | 'XAG') {
  const config = getConfig();
  const providers = [
    { name: 'gold-api.com', fetch: () => fetchGoldApi(symbol) },
    { name: 'swissquote', fetch: () => fetchSwissquote(symbol) },
  ];
  if (config.apiKeys.goldApiIo) {
    providers.push({
      name: 'goldapi.io',
      fetch: () => fetchGoldApiIo(symbol, config.apiKeys.goldApiIo!),
    });
  }
  return providers;
}

function getForexProviders() {
  return [
    { name: 'nrb.org.np', fetch: fetchNrb },
    { name: 'fawazahmed0', fetch: fetchFawazahmed0 },
    { name: 'exchangerate-api', fetch: fetchExchangeRateApi },
  ];
}

async function fetchNepalPrices(): Promise<{ data: NepalPriceData; source: string; isStale: boolean }> {
  const cached = caches.nepal.get('nepal');
  if (cached) return { data: cached, source: 'cache', isStale: false };

  const result = await tryProviders(getNepalProviders());
  if (result) {
    caches.nepal.set('nepal', result.data);
    return { data: result.data, source: result.source, isStale: false };
  }

  const stale = caches.nepal.getStale('nepal');
  if (stale) return { data: stale, source: 'cache', isStale: true };

  throw new Error('All Nepal price providers failed and no cached data available');
}

async function fetchLivePrice(symbol: 'XAU' | 'XAG'): Promise<{ data: LivePriceData; source: string; isStale: boolean }> {
  const cacheKey = `live-${symbol}`;
  const cached = caches.live.get(cacheKey);
  if (cached) return { ...cached, isStale: false };

  const result = await tryProviders(getLiveProviders(symbol));
  if (result) {
    caches.live.set(cacheKey, result);
    return { data: result.data, source: result.source, isStale: false };
  }

  const stale = caches.live.getStale(cacheKey);
  if (stale) return { ...stale, isStale: true };

  throw new Error(`All live price providers failed for ${symbol} and no cached data available`);
}

async function fetchForex(): Promise<{ data: ForexData; source: string; isStale: boolean }> {
  const cached = caches.forex.get('forex');
  if (cached) return { ...cached, isStale: false };

  const result = await tryProviders(getForexProviders());
  if (result) {
    caches.forex.set('forex', result);
    return { data: result.data, source: result.source, isStale: false };
  }

  const stale = caches.forex.getStale('forex');
  if (stale) return { ...stale, isStale: true };

  throw new Error('All forex providers failed and no cached data available');
}

export async function getNepalGoldPrice(): Promise<NepalGoldPrice> {
  const { data, source, isStale } = await fetchNepalPrices();
  return {
    hallmark: data.goldHallmark,
    tajabi: data.goldTajabi,
    unit: 'tola',
    perGram10: data.goldHallmarkPerGram10,
    source,
    date: data.date,
    updatedAt: new Date().toISOString(),
    isStale,
  };
}

export async function getNepalSilverPrice(): Promise<NepalSilverPrice> {
  const { data, source, isStale } = await fetchNepalPrices();
  return {
    price: data.silver,
    unit: 'tola',
    perGram10: data.silverPerGram10,
    source,
    date: data.date,
    updatedAt: new Date().toISOString(),
    isStale,
  };
}

async function buildLivePrice(symbol: 'XAU' | 'XAG'): Promise<LiveMetalPrice> {
  const [live, forex] = await Promise.all([
    fetchLivePrice(symbol),
    fetchForex(),
  ]);

  const config = getConfig();
  const breakdown = calculateTaxBreakdown(
    live.data.priceUsd,
    forex.data.usdToNpr,
    config.rates,
  );

  return {
    raw: {
      usdPerOz: live.data.priceUsd,
      usdToNpr: forex.data.usdToNpr,
    },
    perTola: breakdown,
    rates: { ...config.rates },
    source: live.source,
    updatedAt: live.data.updatedAt,
    isStale: live.isStale || forex.isStale,
  };
}

export async function getLiveGoldPrice(): Promise<LiveMetalPrice> {
  return buildLivePrice('XAU');
}

export async function getLiveSilverPrice(): Promise<LiveMetalPrice> {
  return buildLivePrice('XAG');
}

export async function getAllPrices(): Promise<AllPrices> {
  const [nepalGold, nepalSilver, liveGold, liveSilver] = await Promise.allSettled([
    getNepalGoldPrice(),
    getNepalSilverPrice(),
    getLiveGoldPrice(),
    getLiveSilverPrice(),
  ]);

  return {
    gold: {
      nepal: nepalGold.status === 'fulfilled' ? nepalGold.value : null,
      live: liveGold.status === 'fulfilled' ? liveGold.value : null,
    },
    silver: {
      nepal: nepalSilver.status === 'fulfilled' ? nepalSilver.value : null,
      live: liveSilver.status === 'fulfilled' ? liveSilver.value : null,
    },
  };
}

// Re-exports
export { configure, resetConfig } from './config.js';
export type {
  NepalGoldPrice, NepalSilverPrice, LiveMetalPrice,
  TaxBreakdown, TaxRates, AllPrices, Config,
} from './types.js';
```

- [ ] **Step 2: Verify build**

Run: `cd packages/nepal-bullion-price && npx tsup`
Expected: Build succeeds, output in `dist/`

- [ ] **Step 3: Commit**

```bash
git add packages/nepal-bullion-price/src/index.ts
git commit -m "wire up public API with all providers, caching, and fallbacks"
```

---

## Task 11: Web App Scaffold (Vite + React + Tailwind + Hono)

**Files:**
- Modify: `package.json` (root — add `apps/*` to workspaces)
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/index.css`
- Create: `apps/web/src/App.tsx` (placeholder)
- Create: `apps/web/server.ts`

- [ ] **Step 0: Add `apps/*` workspace to root `package.json`**

Update root `package.json` workspaces from `["packages/*"]` to `["packages/*", "apps/*"]`.

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "nepal-bullion-web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "vite build",
    "preview": "tsx server.ts"
  },
  "dependencies": {
    "@hono/node-server": "^1",
    "hono": "^4",
    "nepal-bullion-price": "workspace:*",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^4",
    "@tailwindcss/vite": "^4",
    "tsx": "^4",
    "typescript": "^5",
    "vite": "^6"
  }
}
```

- [ ] **Step 2: Create `apps/web/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src", "server.ts"]
}
```

- [ ] **Step 3: Create `apps/web/vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
```

- [ ] **Step 3: Create `apps/web/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nepal Bullion Price</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 4: Create `apps/web/src/index.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 5: Create `apps/web/src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Create `apps/web/src/App.tsx` (placeholder)**

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900">Nepal Bullion Price</h1>
    </div>
  );
}
```

- [ ] **Step 7: Create `apps/web/server.ts`**

```typescript
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getAllPrices,
  getNepalGoldPrice,
  getNepalSilverPrice,
  getLiveGoldPrice,
  getLiveSilverPrice,
} from 'nepal-bullion-price';

const app = new Hono();

app.use('/api/*', cors());

app.get('/api/prices', async (c) => {
  const prices = await getAllPrices();
  return c.json(prices);
});

app.get('/api/gold', async (c) => {
  const [nepal, live] = await Promise.allSettled([
    getNepalGoldPrice(),
    getLiveGoldPrice(),
  ]);
  return c.json({
    nepal: nepal.status === 'fulfilled' ? nepal.value : null,
    live: live.status === 'fulfilled' ? live.value : null,
  });
});

app.get('/api/silver', async (c) => {
  const [nepal, live] = await Promise.allSettled([
    getNepalSilverPrice(),
    getLiveSilverPrice(),
  ]);
  return c.json({
    nepal: nepal.status === 'fulfilled' ? nepal.value : null,
    live: live.status === 'fulfilled' ? live.value : null,
  });
});

// Serve static files in production
app.use('/*', serveStatic({ root: './dist' }));

const port = parseInt(process.env.PORT ?? '3000', 10);
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
```

- [ ] **Step 8: Install all dependencies and verify**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npm install`
Expected: All workspaces install successfully

- [ ] **Step 9: Commit**

```bash
git add apps/web/
git commit -m "scaffold web app with Vite, React, Tailwind, and Hono API server"
```

---

## Task 12: React Hook — `useBullionPrices`

**Files:**
- Create: `apps/web/src/hooks/useBullionPrices.ts`

- [ ] **Step 1: Create `useBullionPrices.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { AllPrices } from 'nepal-bullion-price';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface UseBullionPricesReturn {
  data: AllPrices | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
}

export function useBullionPrices(): UseBullionPricesReturn {
  const [data, setData] = useState<AllPrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const prices: AllPrices = await res.json();
      setData(prices);
      setLastFetched(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { data, isLoading, error, lastFetched, refresh: fetchPrices };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/hooks/useBullionPrices.ts
git commit -m "add useBullionPrices hook with polling and error handling"
```

---

## Task 13: React UI Components

**Files:**
- Create: `apps/web/src/components/Header.tsx`
- Create: `apps/web/src/components/PriceCard.tsx`
- Create: `apps/web/src/components/TaxBreakdown.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Create `Header.tsx`**

```tsx
import { useState, useEffect } from 'react';

interface HeaderProps {
  lastFetched: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export function Header({ lastFetched, onRefresh, isLoading }: HeaderProps) {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nepal Bullion Price
        </h1>
        {lastFetched && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {lastFetched.toLocaleTimeString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `TaxBreakdown.tsx`**

```tsx
import { useState } from 'react';
import type { TaxBreakdown as TaxBreakdownType } from 'nepal-bullion-price';

interface TaxBreakdownProps {
  breakdown: TaxBreakdownType;
}

function formatNpr(value: number): string {
  return `Rs ${value.toLocaleString('en-IN')}`;
}

export function TaxBreakdown({ breakdown }: TaxBreakdownProps) {
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
            <span>+ Custom duty (10%)</span>
            <span>{formatNpr(breakdown.customDuty)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Bank margin (0.5%)</span>
            <span>{formatNpr(breakdown.bankMargin)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Dealer margin (0.5%)</span>
            <span>{formatNpr(breakdown.dealerMargin)}</span>
          </div>
          <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-700 pt-1">
            <span>Estimated FENEGOSIDA</span>
            <span>{formatNpr(breakdown.estimatedPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Luxury tax (2%)</span>
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
```

- [ ] **Step 3: Create `LastUpdated.tsx`**

```tsx
interface SourceTimestamp {
  label: string;
  source: string;
  updatedAt: string;
  isStale: boolean;
}

interface LastUpdatedProps {
  sources: SourceTimestamp[];
}

export function LastUpdated({ sources }: LastUpdatedProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Data Sources
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
            <span className="flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-500 text-xs">{s.source}</span>
              {s.isStale && (
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" title="Stale data" />
              )}
              {!s.isStale && (
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" title="Fresh" />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `PriceCard.tsx`**

```tsx
import type { NepalGoldPrice, NepalSilverPrice, LiveMetalPrice } from 'nepal-bullion-price';
import { TaxBreakdown } from './TaxBreakdown';

interface PriceCardProps {
  title: string;
  icon: string;
  symbol: 'XAU' | 'XAG';
  nepalPrice: NepalGoldPrice | NepalSilverPrice | null;
  livePrice: LiveMetalPrice | null;
  accentColor: string;
}

function formatNpr(value: number): string {
  return `Rs ${value.toLocaleString('en-IN')}`;
}

function getNepalPriceTola(price: NepalGoldPrice | NepalSilverPrice): number {
  return 'hallmark' in price ? price.hallmark : price.price;
}

export function PriceCard({ title, icon, symbol, nepalPrice, livePrice, accentColor }: PriceCardProps) {
  const nepalTola = nepalPrice ? getNepalPriceTola(nepalPrice) : null;
  const liveTola = livePrice?.perTola.consumerPrice ?? null;

  const premium =
    nepalTola && livePrice
      ? (((nepalTola - livePrice.perTola.basePrice) / livePrice.perTola.basePrice) * 100).toFixed(1)
      : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>

      {/* Nepal FENEGOSIDA Price */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          Nepal Price (FENEGOSIDA)
        </p>
        {nepalPrice ? (
          <>
            <p className={`text-3xl font-bold ${accentColor}`}>
              {nepalTola !== null ? formatNpr(nepalTola) : '—'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              per tola · {nepalPrice.source}
              {nepalPrice.isStale && (
                <span className="ml-1 text-amber-500">(stale)</span>
              )}
            </p>
          </>
        ) : (
          <p className="text-xl text-gray-400">Unavailable</p>
        )}
      </div>

      {/* Live International Price */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          Live Est. Consumer Price
        </p>
        {livePrice ? (
          <>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {liveTola !== null ? formatNpr(liveTola) : '—'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {symbol}/USD: ${livePrice.raw.usdPerOz.toFixed(2)} · Rate: {livePrice.raw.usdToNpr.toFixed(2)}
              {livePrice.isStale && (
                <span className="ml-1 text-amber-500">(stale)</span>
              )}
            </p>
            <TaxBreakdown breakdown={livePrice.perTola} />
          </>
        ) : (
          <p className="text-lg text-gray-400">Unavailable</p>
        )}
      </div>

      {/* Premium Indicator */}
      {premium !== null && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Nepal premium over international</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{premium}%</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Update `App.tsx`**

```tsx
import { useBullionPrices } from './hooks/useBullionPrices';
import { Header } from './components/Header';
import { PriceCard } from './components/PriceCard';
import { LastUpdated } from './components/LastUpdated';

export default function App() {
  const { data, isLoading, error, lastFetched, refresh } = useBullionPrices();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header lastFetched={lastFetched} onRefresh={refresh} isLoading={isLoading} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {isLoading && !data ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriceCard
              title="Gold"
              icon="🥇"
              symbol="XAU"
              nepalPrice={data?.gold.nepal ?? null}
              livePrice={data?.gold.live ?? null}
              accentColor="text-amber-600 dark:text-amber-400"
            />
            <PriceCard
              title="Silver"
              icon="🥈"
              symbol="XAG"
              nepalPrice={data?.silver.nepal ?? null}
              livePrice={data?.silver.live ?? null}
              accentColor="text-gray-600 dark:text-gray-300"
            />
          </div>
        )}

        {data && (
          <LastUpdated
            sources={[
              ...(data.gold.nepal ? [{ label: 'Nepal Gold', source: data.gold.nepal.source, updatedAt: data.gold.nepal.updatedAt, isStale: data.gold.nepal.isStale }] : []),
              ...(data.gold.live ? [{ label: 'Live Gold', source: data.gold.live.source, updatedAt: data.gold.live.updatedAt, isStale: data.gold.live.isStale }] : []),
              ...(data.silver.nepal ? [{ label: 'Nepal Silver', source: data.silver.nepal.source, updatedAt: data.silver.nepal.updatedAt, isStale: data.silver.nepal.isStale }] : []),
              ...(data.silver.live ? [{ label: 'Live Silver', source: data.silver.live.source, updatedAt: data.silver.live.updatedAt, isStale: data.silver.live.isStale }] : []),
            ]}
          />
        )}

        <footer className="mt-12 text-center text-xs text-gray-400 dark:text-gray-600">
          <p>Data from FENEGOSIDA, gold-api.com, Nepal Rastra Bank</p>
          <p className="mt-1">Prices are approximate. Actual prices may vary.</p>
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/
git commit -m "add React UI with price cards, tax breakdown, source status, and dark mode"
```

---

## Task 14: Integration Test — Full E2E Verification

- [ ] **Step 1: Build the package**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npx turbo build`
Expected: Both `packages/nepal-bullion-price` and `apps/web` build successfully

- [ ] **Step 2: Run all unit tests**

Run: `cd packages/nepal-bullion-price && npx vitest run`
Expected: All tests pass (config, cache, fallback, calculator)

- [ ] **Step 3: Start the API server and verify endpoints**

Run: `cd apps/web && npx tsx server.ts &` then `curl http://localhost:3000/api/prices | head -c 200`
Expected: JSON response with gold/silver nepal and live prices

- [ ] **Step 4: Verify the React app loads**

Open `http://localhost:5173` in browser (run `cd apps/web && npx vite` for dev mode).
Expected: Dashboard shows gold and silver cards with FENEGOSIDA prices and live estimated prices.

- [ ] **Step 5: Kill background server and commit any fixes**

```bash
git add -A
git commit -m "integration test fixes and final adjustments"
```

---

## Task 15: Package Publishing Prep

**Files:**
- Create: `packages/nepal-bullion-price/README.md`

- [ ] **Step 1: Create README.md**

Write a concise README with:
- Package name, description, install command
- Quick start code example (the API section from the spec)
- Configuration section
- Data sources listed
- Tax breakdown explanation
- License (MIT)

- [ ] **Step 2: Verify `package.json` fields**

Ensure `name`, `version`, `description`, `keywords`, `license`, `main`, `module`, `types`, `exports`, `files` are all correct.

- [ ] **Step 3: Dry-run publish**

Run: `cd packages/nepal-bullion-price && npm pack --dry-run`
Expected: Lists files that would be published (dist/, package.json, README.md)

- [ ] **Step 4: Commit**

```bash
git add packages/nepal-bullion-price/README.md
git commit -m "add README and finalize package for publishing"
```
