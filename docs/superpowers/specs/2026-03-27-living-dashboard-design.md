# Living Dashboard: Sparklines, Narratives & Share Cards

**Date:** 2026-03-27
**Status:** Approved
**Goal:** Transform the goldprice dashboard from a static price display into a living, shareable experience that people want to check daily.

## Overview

Three features that make price data feel alive:

1. **7-Day Sparkline Charts** — tiny trend lines on each price card showing the week's price movement
2. **Contextual Narratives** — auto-generated one-liners like "🔥 Rising 3 days straight" that turn numbers into stories
3. **Social Share Cards** — beautiful dark-theme image cards shareable via WhatsApp/Facebook

All three are zero-dependency (pure SVG, Canvas API, Web Share API) and require no database or new backend infrastructure.

---

## 1. Data Layer: 7-Day Price History

### Source

FENEGOSIDA already serves 7-day chart data via embedded Google Charts variables (`data` for gold, `data2` for silver). The current scraper extracts only `[length-2]` (yesterday's price). The change: extract the full array.

### Type Changes

```typescript
// Add to NepalGoldPrice and NepalSilverPrice
history: { date: string; price: number }[] | null;
```

- `date` is an ISO date string (e.g., "2026-03-21") derived by the scraper from FENEGOSIDA's day labels (e.g., "Sun", "Mon") relative to today's date
- `price` is the per-tola price in NPR
- Array is ordered chronologically (oldest first, today last)
- `null` when history is unavailable (Ashesh/Hamropatro fallback providers)

### Provider Changes

| Provider | Change |
|----------|--------|
| **FENEGOSIDA** | Extract full `data`/`data2` arrays → map to `{ date, price }[]` |
| **Ashesh** | Return `history: null` (no chart data available) |
| **Hamropatro** | Return `history: null` (no chart data available) |

### API

No new endpoints. The `history` field is added to the existing `/api/prices`, `/api/gold`, `/api/silver` response objects. Cache behavior unchanged — history rides the existing adaptive TTL.

---

## 2. Sparkline Component

### `<Sparkline>`

Pure SVG component. No chart library.

**Props:**
```typescript
interface SparklineProps {
  data: number[];         // Array of prices (7 days)
  color: 'gold' | 'silver';
  className?: string;
}
```

**Rendering:**
- SVG `<polyline>` for the line
- SVG `<path>` with `<linearGradient>` fill underneath (gold or silver tint, fading to transparent)
- Circle dot on the last data point (today)
- Scales data to viewBox via min/max normalization with padding
- Uses theme colors: `--color-gold-400`/`--color-gold-500` for gold, `--color-silver-400`/`--color-silver-500` for silver

**Accessibility:**
- `aria-label` describing the trend: "Gold price trend over 7 days, currently rising"
- `role="img"` on the SVG
- Respects `prefers-reduced-motion` (no animated draw-in)

### `<TrendSection>`

Wrapper component — the "7-Day Trend" box from the approved mockup (Option C).

**Layout:**
```
┌──────────────────────────────────────────┐
│  7-Day Trend          🔥 Rising 3 days   │  ← Label + narrative
│  ┌──────────────────────────────────────┐│
│  │  ╱‾‾╲    ╱‾‾‾‾╲                     ││  ← Sparkline SVG
│  │ ╱    ╲__╱      ╲___╱‾‾‾             ││
│  └──────────────────────────────────────┘│
│  Fri  Sat  Sun  Mon  Tue  Wed  Thu       │  ← Day labels
└──────────────────────────────────────────┘
```

**Styling:**
- Subtle background tint: `rgba(gold/silver, 0.05)`
- Subtle border: `rgba(gold/silver, 0.1)`
- Rounded corners (12px)
- Day labels derived from `history[].date` — abbreviated weekday names
- Respects dark mode

**Placement in PriceCard:**
- Below the price change indicator
- Above the divider line
- Only renders when `history` has >= 2 data points

---

## 3. Narrative Engine

### `generateNarratives(history, metal) → Narrative[]`

Pure logic function in `apps/web/src/utils/narrative.ts`.

**Input:** `{ date: string, price: number }[]` (7-day history)
**Output:** Up to 2 narratives, ordered by priority.

**Return type:**
```typescript
interface Narrative {
  emoji: string;
  key: string;        // i18n translation key
  values?: Record<string, string | number>;  // interpolation values
}
```

### Priority Cascade (first match wins, max 2)

| Priority | Signal | Condition | Example |
|----------|--------|-----------|---------|
| 1 | **Big move** | Today's absolute daily change > all other daily changes in the window | "⚡ Biggest jump this week" / "⚡ Biggest drop this week" |
| 2 | **Weekly high** | Today's price = max of array | "📈 Weekly high" |
| 2 | **Weekly low** | Today's price = min of array | "📉 Lowest this week" |
| 3 | **Streak** | 3+ consecutive days same direction | "🔥 Rising {n} days straight" / "Falling {n} days" |

- Signals at the same priority level can co-occur (e.g., weekly high + streak)
- If nothing matches, return empty array — TrendSection shows sparkline only, no narrative text

### i18n

Each narrative key gets English and Nepali translations:

```typescript
// English
biggest_jump: "Biggest jump this week",
biggest_drop: "Biggest drop this week",
weekly_high: "Weekly high",
weekly_low: "Lowest this week",
streak_rising: "Rising {n} days straight",
streak_falling: "Falling {n} days",

// Nepali
biggest_jump: "यस हप्ताको सबैभन्दा ठूलो वृद्धि",
biggest_drop: "यस हप्ताको सबैभन्दा ठूलो गिरावट",
weekly_high: "हप्ताको उच्च",
weekly_low: "हप्ताको न्यून",
streak_rising: "{n} दिनदेखि बढ्दो",
streak_falling: "{n} दिनदेखि घट्दो",
```

---

## 4. Social Share Card

### Trigger

Share icon button (↗ or share icon) on each PriceCard, positioned in the bottom area near the source link.

### Generation Flow

1. User taps share button on a card (gold or silver)
2. `generateShareImage(priceData, history, narratives, metal)` draws on a hidden `<canvas>`
3. Canvas converts to PNG blob via `canvas.toBlob()`
4. **Mobile (Web Share API supported):** `navigator.share({ files: [pngFile], text: shareText })` opens native share sheet
5. **Desktop fallback:** Downloads as `gold-price-2026-03-27.png` (or `silver-price-...`)

### Canvas Layout (1080x1080px, always dark theme)

```
┌──────────────────────────────────────┐
│                                      │
│  [Logo] Nepal Bullion    Mar 27, 2026│
│                                      │
│  GOLD PRICE                          │
│  Rs 1,61,200                         │
│  ▲ +800 (0.5%) from yesterday        │
│                                      │
│  ~~~~~~~~ sparkline ~~~~~~~~~~       │
│                                      │
│  🔥 Rising 3 days · Weekly high      │
│                                      │
│  ─────────────────────────────────   │
│  bullion.pawanpaudel.com.np  per tola│
└──────────────────────────────────────┘
```

**Colors:**
- Background: `#1C1917` → `#292524` gradient
- Gold price: `#D4A843`
- Silver price: `#D6D3D1`
- Up indicator: `#34D399` (emerald)
- Down indicator: `#F87171` (red)
- Muted text: `#A8A29E`

### Share Text (alongside image)

```
English: "Gold: Rs 1,61,200/tola (▲ +800) — Nepal Bullion Price\nbullion.pawanpaudel.com.np"
Nepali:  "सुन: रू १,६१,२०० प्रति तोला (▲ +८००) — नेपाल बुलियन मूल्य\nbullion.pawanpaudel.com.np"
```

### `apps/web/src/utils/shareCard.ts`

Canvas drawing utility. Draws text, sparkline path, and styled elements programmatically. No HTML-to-canvas library needed — the layout is simple enough to draw directly.

---

## 5. File Changes Summary

| Layer | File | Change |
|-------|------|--------|
| Types | `packages/nepal-bullion-price/src/types.ts` | Add `history` field to `NepalGoldPrice`, `NepalSilverPrice` |
| Scraper | `packages/.../providers/nepal-price/fenegosida.ts` | Extract full 7-day chart arrays |
| Scraper | `packages/.../providers/nepal-price/ashesh.ts` | Add `history: null` to return |
| Scraper | `packages/.../providers/nepal-price/hamropatro.ts` | Add `history: null` to return |
| Component | `apps/web/src/components/Sparkline.tsx` | **New** — pure SVG sparkline |
| Component | `apps/web/src/components/TrendSection.tsx` | **New** — trend box with sparkline + narrative |
| Component | `apps/web/src/components/ShareButton.tsx` | **New** — share icon + Web Share API |
| Utility | `apps/web/src/utils/narrative.ts` | **New** — narrative generation logic |
| Utility | `apps/web/src/utils/shareCard.ts` | **New** — canvas drawing for share image |
| Integration | `apps/web/src/components/PriceCard.tsx` | Add TrendSection + ShareButton |
| i18n | `apps/web/src/i18n.tsx` | Add narrative + share translation keys |

**New dependencies:** None.

---

## 6. Edge Cases

- **History unavailable** (Ashesh/Hamropatro fallback): TrendSection doesn't render, share card omits sparkline and narrative — still shows price + change
- **Only 1 data point**: TrendSection doesn't render (need >= 2 for a line)
- **All prices identical**: Sparkline renders as flat line, no narrative triggers
- **Web Share API unsupported**: Falls back to image download
- **Canvas not available** (rare): Share button hidden via feature detection
- **prefers-reduced-motion**: Sparkline renders statically (no draw-in animation)
