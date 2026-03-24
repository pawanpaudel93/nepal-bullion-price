# nepal-bullion-price — Design Spec

## Overview

An npm package (`nepal-bullion-price`) and React UI for fetching and displaying Nepal's gold and silver prices. Two price perspectives:

1. **Nepal daily price** — FENEGOSIDA's official rate (set daily ~10 AM NPT), scraped from multiple sources with fallbacks
2. **Live international price** — real-time XAU/XAG converted to NPR per tola with full Nepal tax/duty breakdown

## Package Name

`nepal-bullion-price` — covers gold, silver, and extensible to platinum/palladium later.

## Data Sources & Fallback Strategy

### Nepal Daily Price (FENEGOSIDA) — Gold + Silver

| Priority | Source | Method | Parsing |
|----------|--------|--------|---------|
| Primary | `fenegosida.org` | Scrape HTML | `#header-rate .rate-gold b` / `.rate-silver b` |
| Fallback 1 | `ashesh.com.np/gold/widget.php` | Scrape widget HTML (~5KB) | `.rate_buying` elements |
| Fallback 2 | `hamropatro.com/gold` | Scrape HTML | `ul.gold-silver li` (odd-indexed = prices) |
| Fallback 3 | Return cached last-known | In-memory cache | `isStale: true` flag |

All three sources are free, require no authentication, and update daily after FENEGOSIDA publishes.

### Live International Price (XAU/USD, XAG/USD)

| Priority | Source | Auth | CORS | Update Freq |
|----------|--------|------|------|-------------|
| Primary | `api.gold-api.com/price/XAU` & `/price/XAG` | None | Yes | ~60s |
| Fallback 1 | Swissquote forex feed | None | No (server only) | Real-time |
| Fallback 2 | `goldapi.io` (optional API key via config) | Key | Yes | Real-time |
| Fallback 3 | Return cached + `isStale: true` | — | — | — |

### USD/NPR Exchange Rate

| Priority | Source | Auth | Rate Type |
|----------|--------|------|-----------|
| Primary | Nepal Rastra Bank API (`nrb.org.np/api/forex/v1/rates`) | None | Official (buy/sell) |
| Fallback 1 | `fawazahmed0/currency-api` (jsDelivr + CF Pages) | None | Market |
| Fallback 2 | `open.er-api.com/v6/latest/USD` | None | Market |
| Fallback 3 | Return cached + `isStale: true` | — | — |

### Fallback Engine

The fallback engine tries each provider sequentially. On success, the result is cached (default TTL: 5 minutes). On failure, the error is logged and the next provider is tried. If all providers fail, the engine returns the last cached result with `isStale: true`.

## Tax & Duty Calculation

Nepal's FENEGOSIDA price includes duties and margins over the raw international price. When calculating the estimated Nepal price from live international data, we apply:

| Component | Rate | Applied On |
|-----------|------|------------|
| Custom duty | 10% | Base price (CIF value) |
| Bank margin | 0.5% | After customs |
| Dealer margin | 0.5% | After bank margin |
| **Subtotal** | — | **Estimated FENEGOSIDA-equivalent** |
| Luxury tax | 2% | Consumer purchase price |
| **Total** | — | **Estimated consumer price** |

**Notes:**
- 13% VAT applies only to jewelry with precious stones, NOT to plain bullion — excluded from calculation.
- The actual FENEGOSIDA price uses a 75/25 blend of international and Indian market prices. Our calculation uses 100% international price and notes this as an approximation.
- All rates are configurable via `configure()`.

**Rounding:** All intermediate and final NPR values are rounded to the nearest integer using `Math.round()`. Each component (customDuty, bankMargin, etc.) is computed and rounded independently before being summed.

**Formula:**
```
basePrice      = round((xauUsd / 31.1035) × 11.6638 × usdToNpr)
customDuty     = round(basePrice × 0.10)
afterCustoms   = basePrice + customDuty
bankMargin     = round(afterCustoms × 0.005)
afterBank      = afterCustoms + bankMargin
dealerMargin   = round(afterBank × 0.005)
estimatedPrice = afterBank + dealerMargin
luxuryTax      = round(estimatedPrice × 0.02)
consumerPrice  = estimatedPrice + luxuryTax
```

**Worked example** (xauUsd = 4333.40, usdToNpr = 150.07):
```
basePrice      = round((4333.40 / 31.1035) × 11.6638 × 150.07) = 243867
customDuty     = round(243867 × 0.10)   = 24387
afterCustoms   = 243867 + 24387         = 268254
bankMargin     = round(268254 × 0.005)  = 1341
afterBank      = 268254 + 1341          = 269595
dealerMargin   = round(269595 × 0.005)  = 1348
estimatedPrice = 269595 + 1348          = 270943
luxuryTax      = round(270943 × 0.02)   = 5419
consumerPrice  = 270943 + 5419          = 276362
```

Same formula applies for silver using XAG/USD.

## Package API

```typescript
import {
  getNepalGoldPrice, getNepalSilverPrice,
  getLiveGoldPrice, getLiveSilverPrice,
  getAllPrices, configure
} from 'nepal-bullion-price';

// Nepal daily FENEGOSIDA rates
const gold = await getNepalGoldPrice();
// {
//   hallmark: 275500,
//   tajabi: 0,
//   unit: 'tola',
//   perGram10: 236195,
//   source: 'fenegosida.org',
//   date: '2026-03-24',
//   updatedAt: '2026-03-24T04:15:00Z',
//   isStale: false
// }

const silver = await getNepalSilverPrice();
// {
//   price: 4425,
//   unit: 'tola',
//   perGram10: 3794,
//   source: 'fenegosida.org',
//   date: '2026-03-24',
//   updatedAt: '2026-03-24T04:15:00Z',
//   isStale: false
// }

// Live international with Nepal tax breakdown
const liveGold = await getLiveGoldPrice();
// {
//   raw: { usdPerOz: 4333.40, usdToNpr: 150.07 },
//   perTola: {
//     basePrice: 243867,
//     customDuty: 24387,
//     bankMargin: 1341,
//     dealerMargin: 1348,
//     estimatedPrice: 270943,
//     luxuryTax: 5419,
//     consumerPrice: 276362
//   },
//   rates: { customDuty: 0.10, bankMargin: 0.005, dealerMargin: 0.005, luxuryTax: 0.02 },
//   source: 'gold-api.com',
//   updatedAt: '2026-03-24T04:26:12Z',
//   isStale: false
// }

const liveSilver = await getLiveSilverPrice();
// Same structure as liveGold but for silver (XAG)

// Everything in one call
const all = await getAllPrices();
// { gold: { nepal: {...}, live: {...} }, silver: { nepal: {...}, live: {...} } }

// Override defaults
configure({
  rates: { customDuty: 0.10, bankMargin: 0.005, dealerMargin: 0.005, luxuryTax: 0.02 },
  apiKeys: { goldApiIo: '...' },
  cacheTtl: 300_000,
});
```

## Monorepo Structure

Turborepo with npm workspaces:

```
nepal-bullion-price/
├── package.json              # workspace root
├── turbo.json
├── packages/
│   └── nepal-bullion-price/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts    # build ESM + CJS
│       └── src/
│           ├── index.ts      # public API exports
│           ├── types.ts      # TypeScript interfaces
│           ├── config.ts     # configure() + defaults
│           ├── cache.ts      # in-memory TTL cache
│           ├── fallback.ts   # fallback engine
│           ├── providers/
│           │   ├── nepal-price/
│           │   │   ├── fenegosida.ts
│           │   │   ├── ashesh.ts
│           │   │   └── hamropatro.ts
│           │   ├── live-price/
│           │   │   ├── gold-api.ts
│           │   │   ├── swissquote.ts
│           │   │   └── goldapi-io.ts
│           │   └── forex/
│           │       ├── nrb.ts
│           │       ├── fawazahmed0.ts
│           │       └── exchangerate-api.ts
│           └── calculator.ts  # tax breakdown math
└── apps/
    └── web/
        ├── package.json
        ├── vite.config.ts
        ├── tailwind.config.ts
        ├── server.ts             # Hono API server wrapping the package
        └── src/
            ├── App.tsx
            ├── main.tsx
            ├── components/
            │   ├── PriceCard.tsx
            │   ├── TaxBreakdown.tsx
            │   └── LastUpdated.tsx
            └── hooks/
                └── useBullionPrices.ts  # fetches /api/prices
```

## Architecture: Server vs Browser

The npm package (`nepal-bullion-price`) is **server-side only** (Node.js). It scrapes HTML from Nepal websites which would be blocked by CORS in browsers. Additionally, Swissquote's forex feed has no CORS headers.

The React web app uses a **lightweight API server** (Hono) that wraps the package:

```
Browser (React SPA) → /api/prices → Hono server → nepal-bullion-price → external sources
```

The `apps/web` project runs Hono as a server with the React SPA served as static files. In production, this deploys as a single Node.js process (or serverless via Vercel/Netlify adapter).

Updated file tree for `apps/web`:
```
apps/web/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── server.ts              # Hono API server
├── src/                   # React SPA
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── PriceCard.tsx
│   │   ├── TaxBreakdown.tsx
│   │   └── LastUpdated.tsx
│   └── hooks/
│       └── useBullionPrices.ts  # fetches from /api/prices
```

API endpoints:
- `GET /api/prices` — returns `getAllPrices()` result
- `GET /api/gold` — returns `{ nepal, live }` for gold only
- `GET /api/silver` — returns `{ nepal, live }` for silver only

## React UI

Minimal dashboard built with Vite + React + Tailwind CSS.

### Layout
- **Gold card** — FENEGOSIDA hallmark price displayed prominently, live estimated consumer price below, expandable tax breakdown showing each component
- **Silver card** — same layout as gold card
- **Comparison bar** — shows Nepal premium % over raw international price for each metal
- **Last updated** — individual timestamps per data source with stale indicators
- **Light/dark mode** toggle
- **Auto-refresh** — polls every 5 minutes

### Tech Stack
- Vite (build tool)
- React 18+
- Tailwind CSS (styling)
- Custom `useBullionPrices` hook wrapping the npm package

### Responsive
- Desktop: two cards side by side
- Mobile: stacked cards

## Caching Strategy

- In-memory cache with configurable TTL (default 5 minutes)
- Cache keys per provider type: `nepal-price`, `live-gold`, `live-silver`, `forex`
- Stale cache is returned with `isStale: true` when all providers fail
- Cache is not persisted across process restarts

## Error Handling

- Individual provider failures are logged but don't throw
- `getAllPrices()` never throws — worst case returns all-stale cached data
- Individual functions (`getNepalGoldPrice()`, etc.) throw only if no cached data exists and all providers fail
- Network timeouts: 10s per provider request

## Build & Publish

- Package built with `tsup` producing ESM + CJS bundles
- TypeScript declarations included
- `exports` field in package.json for proper dual-module support
- Web app built with Vite, deployable to Vercel/Netlify
