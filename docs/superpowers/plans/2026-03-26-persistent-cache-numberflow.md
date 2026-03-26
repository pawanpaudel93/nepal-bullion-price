# Persistent Cache + NumberFlow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show cached prices instantly on revisit and animate number transitions when values change.

**Architecture:** Replace custom polling hook with TanStack Query + sync storage persister for automatic localStorage caching and background refetch. Use @number-flow/react to animate all price numbers.

**Tech Stack:** @tanstack/react-query, @tanstack/react-query-persist-client, @tanstack/query-sync-storage-persister, @number-flow/react

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/web/package.json` | Modify | Add dependencies |
| `apps/web/src/main.tsx` | Modify | Query client + persist provider setup |
| `apps/web/src/hooks/useBullionPrices.ts` | Rewrite | Thin useQuery wrapper |
| `apps/web/src/App.tsx` | Modify | Use `isFetching` for updating indicator |
| `apps/web/src/components/Header.tsx` | Modify | Accept `isFetching` prop for updating state |
| `apps/web/src/components/PriceCard.tsx` | Modify | Use NumberFlow for prices |
| `apps/web/src/components/TaxBreakdown.tsx` | Modify | Use NumberFlow for breakdown values |

---

### Task 1: Install dependencies

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install packages**

```bash
cd apps/web && pnpm add @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister @number-flow/react
```

- [ ] **Step 2: Verify installation**

Run: `cd apps/web && cat package.json | grep -E "tanstack|number-flow"`
Expected: All 4 packages listed in dependencies

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json apps/web/pnpm-lock.yaml pnpm-lock.yaml
git commit -m "add tanstack query, persist client, and numberflow dependencies"
```

---

### Task 2: Set up QueryClient and PersistQueryClientProvider

**Files:**
- Modify: `apps/web/src/main.tsx`

- [ ] **Step 1: Rewrite main.tsx with query client and persist provider**

Replace the entire contents of `apps/web/src/main.tsx` with:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import './index.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 60_000, // 1 minute
      refetchInterval: 5 * 60_000, // 5 minutes
      retry: 2,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'bullion-cache',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
);
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/main.tsx
git commit -m "set up TanStack Query with localStorage persist provider"
```

---

### Task 3: Rewrite useBullionPrices hook

**Files:**
- Rewrite: `apps/web/src/hooks/useBullionPrices.ts`

- [ ] **Step 1: Rewrite the hook as a thin useQuery wrapper**

Replace the entire contents of `apps/web/src/hooks/useBullionPrices.ts` with:

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AllPrices } from 'nepal-bullion-price';

async function fetchPrices(): Promise<AllPrices> {
  const res = await fetch('/api/prices');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

interface UseBullionPricesReturn {
  data: AllPrices | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
}

export function useBullionPrices(): UseBullionPricesReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, dataUpdatedAt } = useQuery({
    queryKey: ['bullion-prices'],
    queryFn: fetchPrices,
  });

  return {
    data: data ?? null,
    isLoading,
    isFetching,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch prices') : null,
    lastFetched: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['bullion-prices'] }),
  };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/hooks/useBullionPrices.ts
git commit -m "rewrite useBullionPrices as thin useQuery wrapper"
```

---

### Task 4: Update App.tsx and Header.tsx for isFetching state

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/Header.tsx`

- [ ] **Step 1: Update App.tsx to pass isFetching to Header**

In `apps/web/src/App.tsx`, change the `useBullionPrices` destructuring on line 9 from:

```typescript
const { data, isLoading, error, lastFetched, refresh } = useBullionPrices();
```

to:

```typescript
const { data, isLoading, isFetching, error, lastFetched, refresh } = useBullionPrices();
```

Then update the Header component call from:

```tsx
<Header lastFetched={lastFetched} onRefresh={refresh} isLoading={isLoading} />
```

to:

```tsx
<Header lastFetched={lastFetched} onRefresh={refresh} isLoading={isLoading} isFetching={isFetching} />
```

- [ ] **Step 2: Update Header.tsx to show updating indicator**

In `apps/web/src/components/Header.tsx`, update the `HeaderProps` interface from:

```typescript
interface HeaderProps {
  lastFetched: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
}
```

to:

```typescript
interface HeaderProps {
  lastFetched: Date | null;
  onRefresh: () => void;
  isLoading: boolean;
  isFetching: boolean;
}
```

Update the component signature from:

```typescript
export function Header({ lastFetched, onRefresh, isLoading }: HeaderProps) {
```

to:

```typescript
export function Header({ lastFetched, onRefresh, isLoading, isFetching }: HeaderProps) {
```

Update the refresh button — change the `disabled` and animation logic from:

```tsx
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-full bg-ink dark:bg-white text-white dark:text-ink hover:bg-ink-light dark:hover:bg-paper-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink disabled:opacity-40 cursor-pointer transition-all duration-300"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading' : 'Refresh'}
        </button>
```

to:

```tsx
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-full bg-ink dark:bg-white text-white dark:text-ink hover:bg-ink-light dark:hover:bg-paper-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink disabled:opacity-40 cursor-pointer transition-all duration-300"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Updating' : 'Refresh'}
        </button>
```

- [ ] **Step 3: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/components/Header.tsx
git commit -m "show updating indicator when fetching with cached data"
```

---

### Task 5: Add NumberFlow to PriceCard

**Files:**
- Modify: `apps/web/src/components/PriceCard.tsx`

- [ ] **Step 1: Add NumberFlow import and replace static price rendering**

In `apps/web/src/components/PriceCard.tsx`, add the import at the top:

```typescript
import NumberFlow from '@number-flow/react';
```

Replace the FENEGOSIDA price display (the `<p>` tag with `formatNpr`) from:

```tsx
            <p className={`font-mono text-[42px] font-bold leading-none tracking-tighter ${shimmerClass}`}>
              {nepalTola !== null ? formatNpr(nepalTola) : '\u2014'}
            </p>
```

to:

```tsx
            <p className={`font-mono text-[42px] font-bold leading-none tracking-tighter ${shimmerClass}`}>
              {nepalTola !== null ? (
                <>Rs <NumberFlow value={nepalTola} locales="en-IN" /></>
              ) : '\u2014'}
            </p>
```

Replace the Live Est. Price display from:

```tsx
            <p className="font-mono text-2xl font-semibold text-ink dark:text-white tracking-tight">
              {liveTola !== null ? formatNpr(liveTola) : '\u2014'}
            </p>
```

to:

```tsx
            <p className="font-mono text-2xl font-semibold text-ink dark:text-white tracking-tight">
              {liveTola !== null ? (
                <>Rs <NumberFlow value={liveTola} locales="en-IN" /></>
              ) : '\u2014'}
            </p>
```

Remove the `formatNpr` import if it's no longer used in this file (check if the import `{ formatNpr }` is still referenced — it won't be after this change).

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/PriceCard.tsx
git commit -m "use NumberFlow for animated price transitions in PriceCard"
```

---

### Task 6: Add NumberFlow to TaxBreakdown

**Files:**
- Modify: `apps/web/src/components/TaxBreakdown.tsx`

- [ ] **Step 1: Add NumberFlow to the breakdown row values**

In `apps/web/src/components/TaxBreakdown.tsx`, add the import at the top:

```typescript
import NumberFlow from '@number-flow/react';
```

Update the `Row` component at the bottom of the file from:

```tsx
function Row({ label, value, prefix }: { label: string; value: number; prefix?: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-light">{prefix ? <span className="text-ink-faint mr-1">{prefix}</span> : null}{label}</span>
      <span className="font-mono tabular-nums">{formatNpr(value)}</span>
    </div>
  );
}
```

to:

```tsx
function Row({ label, value, prefix }: { label: string; value: number; prefix?: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-light">{prefix ? <span className="text-ink-faint mr-1">{prefix}</span> : null}{label}</span>
      <span className="font-mono tabular-nums">Rs <NumberFlow value={value} locales="en-IN" /></span>
    </div>
  );
}
```

Update the estimated price total row from:

```tsx
              <span className="font-mono tabular-nums">{formatNpr(breakdown.estimatedPrice)}</span>
```

to:

```tsx
              <span className="font-mono tabular-nums">Rs <NumberFlow value={breakdown.estimatedPrice} locales="en-IN" /></span>
```

Remove the `formatNpr` import since it's no longer used in this file.

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/TaxBreakdown.tsx
git commit -m "use NumberFlow for animated transitions in TaxBreakdown"
```

---

### Task 7: Clean up unused formatNpr references

**Files:**
- Potentially: `apps/web/src/utils/format.ts`

- [ ] **Step 1: Check if formatNpr is still used anywhere**

Run: `grep -r "formatNpr" apps/web/src/`

If no results, the function is unused.

- [ ] **Step 2: If unused, keep the file but leave it (YAGNI — don't delete utility files proactively)**

If `formatNpr` is still imported somewhere, leave it. If it's fully unused, leave the file anyway — it's a 3-line utility that may be useful later.

- [ ] **Step 3: Final build and verification**

Run: `cd /Users/blokchainaholic/Desktop/MyProjects/goldprice && npm run build`
Expected: Build succeeds with no errors or warnings

- [ ] **Step 4: Commit if any cleanup was done**

```bash
git add -A
git commit -m "clean up unused imports after NumberFlow migration"
```
