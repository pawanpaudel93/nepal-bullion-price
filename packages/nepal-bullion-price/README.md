# nepal-bullion-price

Nepal gold & silver prices with FENEGOSIDA daily rates + live international prices with full tax breakdown.

- Daily Nepal rates from FENEGOSIDA with multiple fallback sources
- Live international spot prices (XAU/XAG) converted to NPR per tola
- Full tax breakdown: custom duty, bank margin, dealer margin, luxury tax
- In-memory caching with stale fallback
- TypeScript types included

## Install

```
npm install nepal-bullion-price
pnpm add nepal-bullion-price
```

Requires Node.js. Not for browser use.

## Quick Start

```typescript
import {
  getNepalGoldPrice,
  getNepalSilverPrice,
  getLiveGoldPrice,
  getLiveSilverPrice,
  getAllPrices,
  configure,
} from 'nepal-bullion-price';

// Nepal daily FENEGOSIDA rate
const gold = await getNepalGoldPrice();
// {
//   hallmark: 275500,   // NPR per tola (hallmark)
//   tajabi: 0,          // NPR per tola (tajabi)
//   unit: 'tola',
//   perGram10: 236195,  // NPR per 10 grams
//   source: 'fenegosida.org',
//   date: '2025-01-15',
//   updatedAt: '2025-01-15T10:30:00.000Z',
//   isStale: false
// }

// Nepal daily silver rate
const silver = await getNepalSilverPrice();

// Live international price with Nepal tax breakdown
const live = await getLiveGoldPrice();
// {
//   raw: { usdPerOz: 4333.40, usdToNpr: 150.07 },
//   perTola: {
//     basePrice: 20270,
//     customDuty: 2027,
//     bankMargin: 111,
//     dealerMargin: 111,
//     estimatedPrice: 22519,
//     luxuryTax: 450,
//     consumerPrice: 22969
//   },
//   rates: { customDuty: 0.1, bankMargin: 0.005, dealerMargin: 0.005, luxuryTax: 0.02 },
//   source: 'gold-api.com',
//   updatedAt: '2025-01-15T10:30:00.000Z',
//   isStale: false
// }

// Live silver equivalent
const liveSilver = await getLiveSilverPrice();

// All four prices at once (partial failures return null, not throw)
const all = await getAllPrices();
// { gold: { nepal: ..., live: ... }, silver: { nepal: ..., live: ... } }

// Override tax rates or set a goldapi.io API key
configure({
  rates: { customDuty: 0.06 },
  apiKeys: { goldApiIo: 'your-key' },
  cacheTtl: 10 * 60 * 1000, // 10 minutes
});
```

## API Reference

### `getNepalGoldPrice(): Promise<NepalGoldPrice>`

Returns the official Nepal gold rate published by FENEGOSIDA. Includes hallmark and tajabi prices in NPR per tola, plus per-10-gram equivalent.

### `getNepalSilverPrice(): Promise<NepalSilverPrice>`

Returns the official Nepal silver rate in NPR per tola and per 10 grams.

### `getLiveGoldPrice(): Promise<LiveMetalPrice>`

Fetches the live international XAU spot price (USD/oz), fetches the current USD→NPR forex rate, and computes a full Nepal tax breakdown per tola.

### `getLiveSilverPrice(): Promise<LiveMetalPrice>`

Same as `getLiveGoldPrice` but for XAG (silver).

### `getAllPrices(): Promise<AllPrices>`

Runs all four fetches in parallel via `Promise.allSettled`. Any failed source returns `null` rather than throwing.

### `configure(options)`

Override defaults at runtime. Options:

| Field | Type | Description |
|-------|------|-------------|
| `rates` | `Partial<TaxRates>` | Override any tax rate |
| `apiKeys.goldApiIo` | `string` | goldapi.io key (enables that provider) |
| `cacheTtl` | `number` | Cache TTL in ms (default: 5 minutes) |

### `resetConfig()`

Restores all settings to defaults.

### `refreshCaches()`

Clears in-memory caches (useful after calling `configure()` with a new TTL).

## Data Sources

### Nepal daily prices (gold & silver)

| Priority | Source |
|----------|--------|
| 1 (primary) | fenegosida.org |
| 2 (fallback) | ashesh.com.np |
| 3 (fallback) | hamropatro.com |

### Live international spot price (XAU/XAG)

| Priority | Source | Notes |
|----------|--------|-------|
| 1 (primary) | gold-api.com | Free, no key required |
| 2 (fallback) | Swissquote | Free, no key required |
| 3 (optional) | goldapi.io | Requires API key via `configure()` |

### USD → NPR forex rate

| Priority | Source |
|----------|--------|
| 1 (primary) | Nepal Rastra Bank (nrb.org.np) |
| 2 (fallback) | fawazahmed0 exchange rate API |
| 3 (fallback) | exchangerate-api.com |

Each category tries providers in order and falls back to cached (stale) data if all fail.

## Tax Breakdown

Live prices are converted from USD/oz to NPR/tola, then the following Nepal import charges are applied sequentially:

| Component | Default Rate | Applied To |
|-----------|-------------|------------|
| Custom duty | 10% | Base price |
| Bank margin | 0.5% | Base price |
| Dealer margin | 0.5% | Base price |
| Luxury tax | 2% | Sum of above |

```
basePrice      = (usdPerOz / GRAMS_PER_TROY_OZ) * GRAMS_PER_TOLA * usdToNpr
customDuty     = basePrice * 0.10
bankMargin     = basePrice * 0.005
dealerMargin   = basePrice * 0.005
estimatedPrice = basePrice + customDuty + bankMargin + dealerMargin
luxuryTax      = estimatedPrice * 0.02
consumerPrice  = estimatedPrice + luxuryTax
```

All rates are configurable via `configure({ rates: { ... } })`.

## License

MIT
