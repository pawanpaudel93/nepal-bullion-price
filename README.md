# Nepal Bullion Price

[![npm version](https://img.shields.io/npm/v/nepal-bullion-price)](https://www.npmjs.com/package/nepal-bullion-price)
[![license](https://img.shields.io/npm/l/nepal-bullion-price)](https://github.com/pawanpaudel93/nepal-bullion-price/blob/main/LICENSE)

Monorepo for **nepal-bullion-price** — an npm package and web dashboard for Nepal's gold and silver prices.

## What's Inside

| Package | Description |
|---------|-------------|
| [`packages/nepal-bullion-price`](packages/nepal-bullion-price) | npm package — FENEGOSIDA daily rates + live international prices with duty breakdown (customs, bank margin, dealer margin, market premium) |
| [`apps/web`](apps/web) | React dashboard — Hono API server + Vite SPA with light/dark mode, news aggregation, games, and calculator |

## Requirements

- Node.js 18+
- pnpm 8+
- The npm package is **server-side only** (uses `fetch` and HTML scraping — not for browsers)

## Quick Start

```bash
pnpm install
pnpm build
```

### Run the web app

```bash
cd apps/web
pnpm dev
```

This starts:
- **API server** on `http://localhost:3000` (Hono)
- **Dev server** on `http://localhost:5174` (Vite, proxies `/api` → `:3000`)

### Use the npm package

```bash
pnpm add nepal-bullion-price
```

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
//   tajabi: 0,
//   unit: 'tola',
//   perGram10: 234825,
//   previousPrice: 275000,       // yesterday's hallmark (null if unavailable)
//   history: [                   // 7-day chart data (null for fallback providers)
//     { date: '18', price: 275000 },
//     { date: '19', price: 273900 }
//   ],
//   priceDate: 'Chaitra 11',    // Nepali calendar date (BS), not Gregorian
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
//     marketPremium: 2293,
//     estimatedPrice: 289094
//   },
//   rates: { customsDuty: 0.1, bankMargin: 0.005, dealerMargin: 0.005, marketPremium: 0.008 },
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
| `getNews(lang?)` | `Promise<NewsData>` | Aggregated gold/silver news (optional `'en'` or `'np'` filter) |
| `configure(opts)` | `void` | Override rates, API keys, or cache TTL |
| `resetConfig()` | `void` | Restore all settings to defaults |
| `resetCaches()` | `void` | Clear caches (call after changing TTL) |

### `configure(options)`

Rates are configured **per metal** via `rates.gold` and `rates.silver`:

| Option | Type | Gold Default | Silver Default | Description |
|--------|------|-------------|----------------|-------------|
| `rates.{metal}.customsDuty` | `number` | `0.10` (10%) | `0.10` (10%) | Customs duty rate |
| `rates.{metal}.bankMargin` | `number` | `0.005` (0.5%) | `0.005` (0.5%) | Bank margin (NRB cap) |
| `rates.{metal}.dealerMargin` | `number` | `0.005` (0.5%) | `0.005` (0.5%) | Dealer margin (NRB cap) |
| `rates.{metal}.marketPremium` | `number` | `0.008` (0.8%) | `0.030` (3.0%) | Market premium (freight, insurance, Indian blend) *estimated, not officially confirmed* |
| `apiKeys.goldApiIo` | `string` | — | — | goldapi.io API key (enables fallback) |
| `apiKeys.asheshApiKey` | `string` | — | — | Ashesh widget API key (has public default) |
| `apiKeys.gnewsApiKey` | `string` | — | — | GNews API key (enables news fallback) |
| `cacheTtl` | `number` | `300000` | `300000` | Cache TTL in ms for live & forex prices |

> **Note:** `cacheTtl` applies to live spot prices and forex rates only. Nepal daily prices use an adaptive TTL — 5 minutes during the FENEGOSIDA update window (10 AM–12 PM NPT) and 1 hour otherwise. This is not affected by `configure()`.

## Web Dashboard

The web app (`apps/web`) is a React SPA with four tabs:

### Prices
- Live gold and silver price cards with FENEGOSIDA daily rate and live estimated price
- Tax breakdown (customs duty, bank margin, dealer margin, market premium)
- 7-day sparkline chart
- Price milestone banners (all-time highs, round numbers)
- Daily price prediction game

### News
- Aggregated gold/silver news from Google News RSS, OnlineKhabar, and GNews
- English and Nepali language support

### Play
Five bullion-themed games for engagement and education:
- **Gold Rush** — tap-to-collect gold coins arcade game
- **Price Crash** — catch falling gold bars while avoiding obstacles
- **Gold Quiz** — trivia game testing gold and silver knowledge
- **Gold Blocks** — Tetris-style game with gold-themed pieces and swipe gesture controls
- **Gold Trader** — virtual portfolio trading game using real gold prices

### Calculator
- Gold and silver weight/price calculator using current market rates

### Other Features
- **Light/dark mode** with system preference detection
- **English/Nepali** (EN/NE) language toggle
- **Daily streak tracking** with badges
- **Fun comparisons** (e.g., "your gold is worth X iPhones")
- **Pull-to-refresh** price updates
- **Responsive** — mobile-first design

## Duty Breakdown

Live prices are converted from USD/oz to NPR/tola (1 tola = 11.6638 g, 1 troy oz = 31.1035 g) using the **NRB sell rate** (the rate importers pay when buying USD), then Nepal import charges are applied sequentially:

```
basePrice      = round((usdPerOz / 31.1035) × 11.6638 × usdToNpr)
customsDuty    = round(basePrice × customsDutyRate)
afterCustoms   = basePrice + customsDuty
bankMargin     = round(afterCustoms × bankMarginRate)
afterBank      = afterCustoms + bankMargin
dealerMargin   = round(afterBank × dealerMarginRate)
afterDealer    = afterBank + dealerMargin
marketPremium  = round(afterDealer × marketPremiumRate)
estimatedPrice = afterDealer + marketPremium     ← approx. FENEGOSIDA rate
```

### Default rates

| Charge | Gold | Silver | Source |
|--------|------|--------|--------|
| Customs duty | 10% | 10% | Nepal Cabinet (Nov 2024) |
| Bank margin | 0.5% | 0.5% | NRB cap |
| Dealer margin | 0.5% | 0.5% | NRB cap |
| Market premium | 0.8% | 3.0% | Freight, insurance, Indian blend *(estimated, not officially confirmed)* |

The `estimatedPrice` approximates what FENEGOSIDA publishes as the daily rate. The market premium covers freight & insurance costs, CIF-based customs amplification, and the 75/25 Indian market price blend effect. **The market premium rates (0.8% for gold, 3.0% for silver) are estimated values derived from back-testing against FENEGOSIDA prices — they are not officially published or confirmed figures.** A separate 2% luxury tax is charged at the point of sale on jewellery but is not part of the published rate.

All rates are configurable per metal via `configure({ rates: { gold: { ... }, silver: { ... } } })`.

> **Note:** `priceDate` in Nepal price responses uses the Nepali Bikram Sambat (BS) calendar (e.g. "Chaitra 19"), not Gregorian. The Gregorian date is in the `date` field. `previousPrice` and `history` are only available from the FENEGOSIDA primary source — fallback providers (ashesh, hamropatro) return `null` for these fields.

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

## MCP Server

The npm package includes an MCP (Model Context Protocol) server so AI assistants can query Nepal bullion prices.

### Tools

| Tool | Description |
|------|-------------|
| `get_nepal_gold_price` | FENEGOSIDA daily gold rate + yesterday's price |
| `get_nepal_silver_price` | FENEGOSIDA daily silver rate + yesterday's price |
| `get_live_gold_price` | Live XAU/USD → NPR with customs, bank margin, dealer margin, market premium breakdown |
| `get_live_silver_price` | Live XAG/USD → NPR with customs, bank margin, dealer margin, market premium breakdown |
| `get_all_prices` | All prices at once |
| `get_news` | Aggregated gold/silver news from RSS + GNews |

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

## Tech Stack

- **Monorepo** — Turborepo + pnpm workspaces
- **Package** — TypeScript, tsup (ESM + CJS), cheerio, @modelcontextprotocol/sdk
- **Web** — React 19, Tailwind CSS v4, Hono, Vite
- **Testing** — Vitest
- **Deploy** — Vercel (serverless API + static SPA)

## Project Structure

```
├── packages/
│   └── nepal-bullion-price/    # npm package (server-side only)
│       ├── src/
│       │   ├── providers/      # 9 data providers with fallbacks + news aggregation
│       │   ├── calculator.ts   # duty breakdown (customs, bank, dealer, market premium)
│       │   ├── cache.ts        # in-memory TTL cache
│       │   ├── fallback.ts     # sequential fallback engine
│       │   ├── mcp.ts          # MCP server entry point
│       │   └── index.ts        # public API
│       └── README.md           # package docs
├── apps/
│   └── web/                    # React dashboard
│       ├── app.ts              # Hono API routes
│       ├── server.ts           # local dev server
│       ├── api/index.ts        # Vercel serverless entry
│       └── src/                # React components + hooks + i18n
├── turbo.json
└── pnpm-workspace.yaml
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Start all dev servers |
| `pnpm test` | Run all tests |
| `pnpm --filter nepal-bullion-price test` | Run package tests only |
| `pnpm --filter nepal-bullion-web dev` | Run web app only |

## License

MIT
