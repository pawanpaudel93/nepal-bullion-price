# Nepal Bullion Price

Monorepo for **nepal-bullion-price** — an npm package and web dashboard for Nepal's gold and silver prices.

## What's Inside

| Package | Description |
|---------|-------------|
| [`packages/nepal-bullion-price`](packages/nepal-bullion-price) | npm package — FENEGOSIDA daily rates + live international prices with tax breakdown |
| [`apps/web`](apps/web) | React dashboard — Hono API server + Vite SPA with light/dark mode |

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
- **Dev server** on `http://localhost:5173` (Vite, proxies `/api` → `:3000`)

### Use the npm package

```bash
pnpm add nepal-bullion-price
```

```typescript
import { getNepalGoldPrice, getLiveGoldPrice } from 'nepal-bullion-price';

const gold = await getNepalGoldPrice();
console.log(gold.hallmark); // Rs per tola

const live = await getLiveGoldPrice();
console.log(live.perTola.estimatedPrice); // estimated FENEGOSIDA rate
```

See [`packages/nepal-bullion-price/README.md`](packages/nepal-bullion-price/README.md) for full API docs.

## Tech Stack

- **Monorepo** — Turborepo + pnpm workspaces
- **Package** — TypeScript, tsup (ESM + CJS), cheerio
- **Web** — React 19, Tailwind CSS v4, Hono, Vite
- **Deploy** — Vercel (serverless API + static SPA)

## Data Sources

| Data | Primary | Fallbacks |
|------|---------|-----------|
| Nepal daily price | fenegosida.org | ashesh.com.np, hamropatro.com |
| Live XAU/XAG | gold-api.com | Swissquote, goldapi.io |
| USD/NPR forex | Nepal Rastra Bank | fawazahmed0, exchangerate-api |

## Project Structure

```
├── packages/
│   └── nepal-bullion-price/    # npm package (server-side only)
│       ├── src/
│       │   ├── providers/      # 9 data providers with fallbacks
│       │   ├── calculator.ts   # tax breakdown math
│       │   ├── cache.ts        # in-memory TTL cache
│       │   ├── fallback.ts     # sequential fallback engine
│       │   └── index.ts        # public API
│       └── README.md           # package docs
├── apps/
│   └── web/                    # React dashboard
│       ├── app.ts              # Hono API routes
│       ├── server.ts           # local dev server
│       ├── api/index.ts        # Vercel serverless entry
│       └── src/                # React components
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
