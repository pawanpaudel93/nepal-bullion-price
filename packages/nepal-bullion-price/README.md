# nepal-bullion-price

[![npm version](https://img.shields.io/npm/v/nepal-bullion-price)](https://www.npmjs.com/package/nepal-bullion-price)
[![license](https://img.shields.io/npm/l/nepal-bullion-price)](https://github.com/pawanpaudel93/nepal-bullion-price/blob/main/LICENSE)

Nepal gold and silver prices — FENEGOSIDA daily rates + live international prices with full tax breakdown.

## Features

- **Nepal daily rates** from FENEGOSIDA (3 fallback sources)
- **Live international prices** (XAU/XAG → NPR per tola)
- **Full tax breakdown** — customs duty, bank margin, dealer margin (separate rates for gold & silver)
- **USD/NPR forex** from Nepal Rastra Bank (2 fallbacks)
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
  configure,
} from 'nepal-bullion-price';

// Nepal daily FENEGOSIDA rate
const gold = await getNepalGoldPrice();
// {
//   hallmark: 273900,
//   tajabi: 0,
//   unit: 'tola',
//   perGram10: 234825,
//   source: 'fenegosida.org',
//   date: '2026-03-24',
//   updatedAt: '2026-03-24T04:15:00.000Z',
//   isStale: false
// }

// Nepal daily silver rate
const silver = await getNepalSilverPrice();
// { price: 4505, unit: 'tola', perGram10: 3862, ... }

// Live international price with Nepal duty breakdown
const live = await getLiveGoldPrice();
// {
//   raw: { usdPerOz: 4569.40, usdToNpr: 150.67 },
//   perTola: {
//     basePrice: 258140,
//     customsDuty: 25814,
//     bankMargin: 1420,
//     dealerMargin: 1427,
//     estimatedPrice: 286801
//   },
//   rates: { customsDuty: 0.1, bankMargin: 0.005, dealerMargin: 0.015 },
//   source: 'gold-api.com',
//   updatedAt: '2026-03-25T04:26:12Z',
//   isStale: false
// }

// Live silver
const liveSilver = await getLiveSilverPrice();

// All prices at once (partial failures return null, not throw)
const all = await getAllPrices();
// { gold: { nepal, live }, silver: { nepal, live } }

// Override tax rates per metal or add API keys
configure({
  rates: {
    gold: { customsDuty: 0.06 },
    silver: { customsDuty: 0.10 },
  },
  apiKeys: { goldApiIo: 'your-key' },
  cacheTtl: 10 * 60 * 1000, // 10 minutes
});
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `getNepalGoldPrice()` | `Promise<NepalGoldPrice>` | FENEGOSIDA daily gold rate (hallmark + tajabi) |
| `getNepalSilverPrice()` | `Promise<NepalSilverPrice>` | FENEGOSIDA daily silver rate |
| `getLiveGoldPrice()` | `Promise<LiveMetalPrice>` | Live XAU/USD → NPR with duty breakdown |
| `getLiveSilverPrice()` | `Promise<LiveMetalPrice>` | Live XAG/USD → NPR with duty breakdown |
| `getAllPrices()` | `Promise<AllPrices>` | All four in parallel (null on failure) |
| `configure(opts)` | `void` | Override rates, API keys, or cache TTL |
| `resetConfig()` | `void` | Restore all settings to defaults |
| `resetCaches()` | `void` | Clear caches (call after changing TTL) |

### `configure(options)`

Rates are configured **per metal** via `rates.gold` and `rates.silver`:

| Option | Type | Gold Default | Silver Default | Description |
|--------|------|-------------|----------------|-------------|
| `rates.{metal}.customsDuty` | `number` | `0.10` (10%) | `0.15` (15%) | Customs duty rate |
| `rates.{metal}.bankMargin` | `number` | `0.005` (0.5%) | `0.005` (0.5%) | Bank margin |
| `rates.{metal}.dealerMargin` | `number` | `0.015` (1.5%) | `0.035` (3.5%) | Dealer/market premium |
| `apiKeys.goldApiIo` | `string` | — | — | goldapi.io API key (enables fallback) |
| `apiKeys.asheshApiKey` | `string` | — | — | Ashesh widget API key (has public default) |
| `cacheTtl` | `number` | `300000` | `300000` | Cache TTL in ms (5 minutes) |

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

## Duty Breakdown

Live prices are converted from USD/oz to NPR/tola (1 tola = 11.6638 g, 1 troy oz = 31.1035 g) using the **NRB sell rate** (the rate importers pay when buying USD), then Nepal import charges are applied sequentially:

```
basePrice      = round((usdPerOz / 31.1035) × 11.6638 × usdToNpr)
customsDuty     = round(basePrice × customsDutyRate)
afterCustoms   = basePrice + customsDuty
bankMargin     = round(afterCustoms × bankMarginRate)
afterBank      = afterCustoms + bankMargin
dealerMargin   = round(afterBank × dealerMarginRate)
estimatedPrice = afterBank + dealerMargin        ← approx. FENEGOSIDA rate
```

### Default rates

| Charge | Gold | Silver |
|--------|------|--------|
| Customs duty | 10% | 15% |
| Bank margin (NRB cap) | 0.5% | 0.5% |
| Dealer/market premium | 1.5% | 3.5% |

The `estimatedPrice` approximates what FENEGOSIDA publishes as the daily rate. A separate 2% luxury tax is charged at the point of sale but is not part of the published rate.

All rates are configurable per metal via `configure({ rates: { gold: { ... }, silver: { ... } } })`.

## MCP Server

This package includes an MCP (Model Context Protocol) server so AI assistants like Claude, Cursor, and Codex can query Nepal bullion prices.

### Tools

| Tool | Description |
|------|-------------|
| `get_nepal_gold_price` | FENEGOSIDA daily gold rate + yesterday's price |
| `get_nepal_silver_price` | FENEGOSIDA daily silver rate + yesterday's price |
| `get_live_gold_price` | Live XAU/USD → NPR with duty breakdown |
| `get_live_silver_price` | Live XAG/USD → NPR with duty breakdown |
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
