# nepal-bullion-price

[![npm version](https://img.shields.io/npm/v/nepal-bullion-price)](https://www.npmjs.com/package/nepal-bullion-price)
[![license](https://img.shields.io/npm/l/nepal-bullion-price)](https://github.com/pawanpaudel93/nepal-bullion-price/blob/main/LICENSE)

Nepal gold and silver prices — FENEGOSIDA daily rates + live international prices with estimate breakdown.

## Features

- **Nepal daily rates** from FENEGOSIDA (3 fallback sources)
- **Live international prices** (XAU/XAG → NPR per tola)
- **Estimate breakdown** — customs duty, importer margin, dealer margin, estimated adjustment (separate rates for gold & silver)
- **USD/NPR forex** from Nepal Rastra Bank (2 fallbacks)
- **News aggregation** — gold/silver news from Google News RSS, OnlineKhabar, and GNews API
- **In-memory caching** with configurable TTL and stale fallback
- **TypeScript** — full type definitions included

## Requirements

- Node.js 18+
- Server-side only (uses `fetch` and HTML scraping — not for browsers)

## Installation

```bash
npm install nepal-bullion-price
```

```bash
pnpm add nepal-bullion-price
```

## Quick Start

```typescript
import {
  getNepalGoldPrice,
  getNepalSilverPrice,
  getLiveGoldPrice,
  getLiveSilverPrice,
  getAllPrices,
  getNews,
  configure,
} from 'nepal-bullion-price';

// Nepal daily FENEGOSIDA rate
const gold = await getNepalGoldPrice();
// {
//   hallmark: 273900,
//   tajabi: null,               // no longer published by FENEGOSIDA (ashesh fallback only)
//   unit: 'tola',
//   perGram10: 234825,
//   previousPrice: 275000,       // yesterday's hallmark (null if unavailable)
//   history: [                   // ~30 trading days, oldest → newest (null for ashesh)
//     { date: '2026-03-23', price: 275000 },
//     { date: '2026-03-24', price: 273900 }
//   ],
//   priceDate: '2026-03-24',    // date the rate was published (Nepal time)
//   source: 'fenegosida.org',
//   date: '2026-03-24',
//   updatedAt: '2026-03-24T04:15:00.000Z',
//   isStale: false
// }

// Nepal daily silver rate
const silver = await getNepalSilverPrice();
// { price: 4505, unit: 'tola', perGram10: 3862, ... }

// Live international price with Nepal estimate breakdown
const live = await getLiveGoldPrice();
// {
//   raw: { usdPerOz: 4569.40, usdToNpr: 150.67 },
//   perTola: {
//     basePrice: 258140,
//     customsDuty: 51628,
//     importerMargin: 1549,
//     dealerMargin: 1557,
//     estimatedAdjustment: 2503,
//     estimatedPrice: 315377
//   },
//   rates: { customsDuty: 0.2, importerMargin: 0.005, dealerMargin: 0.005, estimatedAdjustment: 0.008 },
//   source: 'gold-api.com',
//   updatedAt: '2026-03-25T04:26:12Z',
//   isStale: false
// }

// Live silver
const liveSilver = await getLiveSilverPrice();

// All prices at once (partial failures return null, not throw)
const all = await getAllPrices();
// { gold: { nepal, live }, silver: { nepal, live } }

// Aggregated gold/silver news
const news = await getNews();       // all languages
const npNews = await getNews('np');  // Nepali only
// { items: [{ id, title, summary, url, source, language, publishedAt, category }], fetchedAt }

// Override estimate rates per metal or add API keys
configure({
  rates: {
    gold: { customsDuty: 0.06 },
    silver: { customsDuty: 0.20 },
  },
  apiKeys: { goldApiIo: 'your-key' },
  cacheTtl: 10 * 60 * 1000, // 10 minutes
});
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `getNepalGoldPrice()` | `Promise<NepalGoldPrice>` | FENEGOSIDA daily gold rate (hallmark; tajabi when available) |
| `getNepalSilverPrice()` | `Promise<NepalSilverPrice>` | FENEGOSIDA daily silver rate |
| `getLiveGoldPrice()` | `Promise<LiveMetalPrice>` | Live XAU/USD → NPR with estimate breakdown |
| `getLiveSilverPrice()` | `Promise<LiveMetalPrice>` | Live XAG/USD → NPR with estimate breakdown |
| `getAllPrices()` | `Promise<AllPrices>` | All four in parallel (null on failure) |
| `getNews(lang?)` | `Promise<NewsData>` | Aggregated gold/silver news (optional `'en'` or `'np'` filter) |
| `configure(opts)` | `void` | Override rates, API keys, or cache TTL |
| `resetConfig()` | `void` | Restore all settings to defaults |
| `resetCaches()` | `void` | Clear caches (call after changing TTL) |

### `configure(options)`

Rates are configured **per metal** via `rates.gold` and `rates.silver`:

| Option | Type | Gold Default | Silver Default | Description |
|--------|------|-------------|----------------|-------------|
| `rates.{metal}.customsDuty` | `number` | `0.20` (20%) | `0.20` (20%) | Customs duty rate |
| `rates.{metal}.importerMargin` | `number` | `0.005` (0.5%) | `0.005` (0.5%) | Importer margin used in the estimate |
| `rates.{metal}.dealerMargin` | `number` | `0.005` (0.5%) | `0.005` (0.5%) | Dealer margin used in the estimate |
| `rates.{metal}.estimatedAdjustment` | `number` | `0.008` (0.8%) | `0.030` (3.0%) | Calibration for freight, insurance, local premium, and FENEGOSIDA-vs-spot gaps |
| `apiKeys.goldApiIo` | `string` | — | — | goldapi.io API key (enables fallback) |
| `apiKeys.asheshApiKey` | `string` | — | — | Ashesh widget API key (has public default) |
| `apiKeys.gnewsApiKey` | `string` | — | — | GNews API key (enables news fallback) |
| `cacheTtl` | `number` | `300000` | `300000` | Cache TTL in ms for live & forex prices |

> **Note:** `cacheTtl` applies to live spot prices and forex rates only. Nepal daily prices use an adaptive TTL — 5 minutes during the FENEGOSIDA update window (10 AM–12 PM NPT) and 1 hour otherwise. This is not affected by `configure()`.

## Data Sources

Each category tries providers in order. If all fail, cached (stale) data is returned with `isStale: true`.

### Nepal daily prices

| Priority | Source | Auth |
|----------|--------|------|
| Primary | fenegosida.org | None |
| Fallback | ashesh.com.np | None |
| Fallback | hamropatro.com | None |

### Live spot price (XAU/XAG)

| Priority | Source | Auth |
|----------|--------|------|
| Primary | gold-api.com | None |
| Fallback | Swissquote forex feed | None |
| Fallback | goldapi.io | API key via `configure()` |

### USD/NPR forex rate

| Priority | Source | Auth |
|----------|--------|------|
| Primary | Nepal Rastra Bank | None |
| Fallback | fawazahmed0/currency-api | None |
| Fallback | open.er-api.com | None |

### News

| Priority | Source | Auth |
|----------|--------|------|
| Primary | Google News RSS (gold, silver, Nepal) | None |
| Primary | OnlineKhabar RSS | None |
| Fallback | GNews API | API key via `configure()` |

News items are keyword-filtered for gold/silver relevance, deduplicated, categorized (gold/silver/market), and cached for 1 hour.

## Estimate Breakdown

Live prices are converted from USD/oz to NPR/tola (1 tola = 11.6638 g, 1 troy oz = 31.1035 g) using the **NRB sell rate** (the rate importers pay when buying USD), then Nepal import costs and estimate adjustments are applied sequentially:

```
basePrice      = round((usdPerOz / 31.1035) × 11.6638 × usdToNpr)
customsDuty    = round(basePrice × customsDutyRate)
afterCustoms   = basePrice + customsDuty
importerMargin      = round(afterCustoms × importerMarginRate)
afterImporter       = afterCustoms + importerMargin
dealerMargin        = round(afterImporter × dealerMarginRate)
afterDealer         = afterImporter + dealerMargin
estimatedAdjustment = round(afterDealer × estimatedAdjustmentRate)
estimatedPrice      = afterDealer + estimatedAdjustment     ← approx. FENEGOSIDA rate
```

### Default rates

| Charge | Gold | Silver | Source |
|--------|------|--------|--------|
| Customs duty | 20% | 20% | Nepal Budget 2083/84 |
| Importer margin | 0.5% | 0.5% | Industry pricing practice |
| Dealer margin | 0.5% | 0.5% | Industry pricing practice |
| Estimated adjustment | 0.8% | 3.0% | Freight, insurance, local premium, and FENEGOSIDA-vs-spot calibration |

The `estimatedPrice` approximates what FENEGOSIDA publishes as the daily rate. The estimated adjustment covers freight & insurance costs, local premiums, CIF-based customs amplification, and FENEGOSIDA-vs-spot calibration. **The estimated adjustment rates (0.8% for gold, 3.0% for silver) are derived from market back-testing and are not officially published or confirmed figures.** The former 2% luxury tax on gold and silver jewellery has been scrapped. A separate 0.5% skill promotion fee may apply at final consumer sale, but it is not included in the published bullion rate estimate.

All rates are configurable per metal via `configure({ rates: { gold: { ... }, silver: { ... } } })`.

> **Note:** `priceDate` in Nepal price responses uses the Nepali Bikram Sambat (BS) calendar (e.g. "Chaitra 19"), not Gregorian. The Gregorian date is in the `date` field. `previousPrice` and `history` are only available from the FENEGOSIDA primary source — fallback providers (ashesh, hamropatro) return `null` for these fields.

## MCP Server

This package includes an MCP (Model Context Protocol) server so AI assistants like Claude, Cursor, and Codex can query Nepal bullion prices.

### Tools

| Tool | Description |
|------|-------------|
| `get_nepal_gold_price` | FENEGOSIDA daily gold rate + yesterday's price |
| `get_nepal_silver_price` | FENEGOSIDA daily silver rate + yesterday's price |
| `get_live_gold_price` | Live XAU/USD → NPR with customs, importer margin, dealer margin, estimated adjustment |
| `get_live_silver_price` | Live XAG/USD → NPR with customs, importer margin, dealer margin, estimated adjustment |
| `get_all_prices` | All prices at once |

### Setup

**Claude Code:**
```bash
claude mcp add nepal-bullion -- npx nepal-bullion-price
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "nepal-bullion": {
      "command": "npx",
      "args": ["nepal-bullion-price"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "nepal-bullion": {
      "command": "npx",
      "args": ["nepal-bullion-price"]
    }
  }
}
```

## License

MIT
