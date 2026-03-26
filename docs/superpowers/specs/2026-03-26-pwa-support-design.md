# PWA Support

## Problem

Users check gold prices daily on mobile but have to open the browser and navigate to the URL each time. No offline access — if the network is down, the app shows nothing.

## Solution

Make the app installable as a PWA with offline support via a service worker.

## Web App Manifest

File: `apps/web/public/manifest.json`

```json
{
  "name": "Nepal Bullion Price",
  "short_name": "Bullion",
  "description": "Nepal gold and silver prices — FENEGOSIDA daily rates + live international prices",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1C1917",
  "theme_color": "#CA8A04",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## Service Worker

Use `vite-plugin-pwa` to generate the service worker from config — no manual SW file.

### Caching Strategy

- **Precache**: App shell (HTML, CSS, JS) — generated at build time
- **Runtime `/api/prices`**: NetworkFirst — try network, fall back to cached response when offline
- **Static assets**: CacheFirst — images, fonts cached on first load

### Auto-Update

The plugin handles SW registration and update prompts. On new deploy, the SW updates automatically on next visit.

## Icons

Generate 192x192 and 512x512 PNG icons with a gold bullion/bar motif on dark background, matching the app's brand.

## HTML Meta Tags

Add to `apps/web/index.html`:
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#CA8A04">`
- `<link rel="apple-touch-icon" href="/icon-192.png">`

## Files Changed

| File | Action |
|------|--------|
| `apps/web/package.json` | Add `vite-plugin-pwa` dev dependency |
| `apps/web/vite.config.ts` | Configure VitePWA plugin with caching strategies |
| `apps/web/public/manifest.json` | Web app manifest |
| `apps/web/public/icon-192.png` | App icon 192x192 |
| `apps/web/public/icon-512.png` | App icon 512x512 |
| `apps/web/index.html` | Add manifest link, theme-color, apple-touch-icon |

## Not In Scope

- Push notifications
- Background sync
- Custom offline page (just shows cached data)
- Install prompt UI (browser handles natively)
