# Persistent Cache + NumberFlow Animated Prices

## Problem

The web app shows a loading spinner until the first API call completes (~1-3s). Returning visitors see this spinner every time. Price updates swap numbers instantly with no visual feedback.

## Solution

1. **Persist cached prices in localStorage** via TanStack Query persist client — returning visitors see prices instantly
2. **Animate price transitions** with @number-flow/react — numbers roll smoothly when values change

## Data Layer

Replace the custom `useBullionPrices` hook with TanStack Query + persist client.

### Dependencies

- `@tanstack/react-query` — data fetching, caching, background refetch
- `@tanstack/react-query-persist-client` — localStorage persistence
- `@number-flow/react` — animated number transitions

### Query Configuration

```typescript
useQuery({
  queryKey: ['bullion-prices'],
  queryFn: () => fetch('/api/prices').then(r => r.json()),
  staleTime: 60_000,         // 1 min fresh
  refetchInterval: 5 * 60_000, // poll every 5 min
})
```

### Persist Configuration

```typescript
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'bullion-cache',
})
```

Wrap app with `PersistQueryClientProvider` in `main.tsx`.

### `useBullionPrices` hook (rewritten)

Thin wrapper around `useQuery` that returns the same shape:

```typescript
interface UseBullionPricesReturn {
  data: AllPrices | null;
  isLoading: boolean;    // no cache, first fetch
  isFetching: boolean;   // background refresh in progress
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
}
```

Key distinction: `isLoading` means no data at all (show spinner). `isFetching` means data exists but a refresh is in progress (show updating indicator).

## Loading States

| State | Cache? | Fetching? | UI |
|-------|--------|-----------|-----|
| Initial load (first visit) | No | Yes | Spinner |
| Returning visit | Yes | Yes | Cached prices + updating indicator |
| Fresh data arrived | Yes | No | Normal display, numbers animate via NumberFlow |
| Error (no cache) | No | No | Error message |
| Error (has cache) | Yes | No | Cached prices shown normally |

### Updating Indicator

When `isFetching && data` (cache exists, refresh in progress), show a subtle pulse or indicator. Reuse the existing stale badge pattern — a small pulsing dot near the refresh button or header.

## NumberFlow Integration

### PriceCard.tsx

Replace static formatted numbers with `<NumberFlow>`:

```tsx
// Before
<p className="font-mono text-[42px] ...">
  {formatNpr(nepalTola)}
</p>

// After
<p className="font-mono text-[42px] ...">
  Rs <NumberFlow value={nepalTola} locales="en-IN" />
</p>
```

Apply to both the FENEGOSIDA price and the Live Est. Price.

### TaxBreakdown.tsx

Apply NumberFlow to the breakdown row values (basePrice, customsDuty, bankMargin, dealerMargin, estimatedPrice).

### Format

- `Rs` prefix remains static text
- NumberFlow handles the number formatting with `locales="en-IN"` (Indian/Nepali lakh system)
- All transitions animate — cached-to-fresh, poll updates

## Files Changed

| File | Change |
|------|--------|
| `apps/web/package.json` | Add 3 dependencies |
| `apps/web/src/main.tsx` | Wrap with `PersistQueryClientProvider` |
| `apps/web/src/hooks/useBullionPrices.ts` | Rewrite: `useQuery` wrapper |
| `apps/web/src/App.tsx` | Use `isFetching` for updating indicator |
| `apps/web/src/components/PriceCard.tsx` | NumberFlow for price display |
| `apps/web/src/components/TaxBreakdown.tsx` | NumberFlow for breakdown values |

## Not In Scope

- Cache expiry/invalidation strategy beyond TanStack Query defaults
- Service worker / offline support
- IndexedDB (localStorage is sufficient for a single JSON blob)
