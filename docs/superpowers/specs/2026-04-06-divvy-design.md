# Divvy — Design Document

**Date:** 2026-04-06  
**Status:** Approved

## Overview

A PWA that lets a group split a restaurant bill fairly. Enter items, assign them to people, handle shared items and tip, get each person's total. No account required. Shareable via link. Warm, playful design — not a finance app.

## Stack

| Package | Purpose |
|---|---|
| React 19 + Vite | SPA framework |
| `react-router-dom` | Screen routing + `/bill?d=` share URL |
| `zustand` | State management (sliced store) |
| `@radix-ui/react-dialog` | Accessible item assignment modal |
| `@radix-ui/react-toggle-group` | Tip/fee type toggle (percentage vs fixed) |
| `@radix-ui/react-visually-hidden` | Screen reader helpers |
| `clsx` | Conditional class composition |
| `unocss` + `@unocss/preset-wind4` | Utility-first CSS |
| `lz-string` | Compress bill state for URL sharing |
| `vite-plugin-pwa` | Service worker + manifest |
| `tesseract.js` | Client-side OCR (lazy-loaded) |
| `@fontsource-variable/nunito` | Self-hosted variable Nunito font |

## Project Structure

```
src/
  store/
    billSlice.ts       # people, items, shared costs
    ocrSlice.ts        # Tesseract worker, progress, parsed candidates
    prefsSlice.ts      # default currency (persisted)
    index.ts           # combined store
  screens/
    Home/
    Setup/
    Items/
    Extras/
    Summary/
  components/          # shared: PersonChip, CurrencyInput, etc.
  lib/
    calc.ts            # calculation logic (pure functions)
    sharing.ts         # encode/decode bill URL
    ocr.ts             # Tesseract wrapper + receipt parser
  router.tsx           # route definitions
  main.tsx
  App.tsx
```

## State & Data Model

### billSlice (persisted via Zustand `persist`)

```ts
interface BillState {
  id: string
  currency: Currency
  people: Person[]
  items: Item[]
  tip: SharedCost
  serviceFee: SharedCost
  deliveryFee: SharedCost
}
```

Actions: `addPerson`, `removePerson`, `addItem`, `updateItem`, `removeItem`, `assignItem`, `setSharedCost`, `setCurrency`, `reset`

### ocrSlice (never persisted — transient)

```ts
interface OcrState {
  status: 'idle' | 'processing' | 'done' | 'error'
  progress: number
  candidates: OcrCandidate[]
  worker: Worker | null
}

interface OcrCandidate {
  name: string
  price: number    // cents
  confidence: number
  selected: boolean
}
```

Actions: `startScan`, `setProgress`, `setCandidates`, `toggleCandidate`, `clearOcr`

### prefsSlice (persisted)

```ts
interface PrefsState {
  defaultCurrency: Currency
}
```

### Data types (from SPEC)

```ts
type Currency = "ZAR" | "USD" | "EUR" | "GBP"

interface Person { id: string; name: string }

interface Item {
  id: string
  name: string
  price: number        // cents (integer — never float)
  assignedTo: string[] // Person IDs; >1 = split equally
}

interface SharedCost {
  type: "percentage" | "fixed"
  value: number        // percentage as integer or cents
}
```

### Calculation logic (`lib/calc.ts`)

Pure functions, no store dependency. Takes a `Bill`, returns `PersonTotal[]`:
1. Sum items assigned solely to each person + fractional share of multi-assigned items
2. Compute each person's proportion of the bill subtotal
3. Distribute shared costs (tip, fees) by that proportion
4. All arithmetic in integer cents; remainder (1–2¢) distributed round-robin

## Routing & Screen Flow

```
/                    →  Home (recent bills, start new)
/setup               →  Setup (currency, people)
/items               →  Items (add/scan/assign)
/extras              →  Extras (tip, service fee, delivery fee)
/summary             →  Summary (totals, share)
/bill?d=<encoded>    →  Summary in read-only mode (shared link)
```

Navigation is linear. Each screen has a bottom-anchored primary action button. Browser back works naturally via React Router history.

**Guard:** landing on `/items`, `/extras`, or `/summary` with no bill in progress redirects to `/`.

**Shared link:** `/bill?d=` hydrates state from URL, renders Summary read-only — no store write.

## OCR Pipeline

### Capture
`<input type="file" accept="image/*" capture="environment">` — rear camera on mobile, file picker on desktop. Image previewed before processing.

### Pre-processing (canvas)
1. Greyscale conversion
2. High-contrast threshold filter (simple pixel manipulation)
3. Deskew — deferred
4. Crop UI — deferred

### OCR execution
Tesseract.js worker lazy-loaded on first scan, cached in `ocrSlice` for the session. `PSM.SINGLE_BLOCK`. Progress callbacks → `ocrSlice.progress` → progress bar with `aria-live="polite"`.

### Parsing (`lib/ocr.ts`)
- Split output into lines
- Price regex: `/[R$€£]?\s*(\d+[.,]\d{2})\s*$/`
- Keyword filter removes structural lines (total, subtotal, VAT, tax, cash, card, etc.)
- Quantity prefix: `2x Item` → single item, name cleaned
- Lines with avg confidence <40% filtered out
- Currency-aware decimal/thousands parsing via `CURRENCY_CONFIG`

### Confirmation UI
Editable list of parsed candidates (name + price per row). Low-confidence rows flagged visually. User can edit, delete, or add rows. "Add all to bill" commits selected items.

## URL Sharing & PWA

### URL sharing
- Bill JSON → `lz-string` compress → base64 → `?d=` param
- Share button: Web Share API first, clipboard fallback
- Typical payload: ~1–2KB compressed

### PWA
- `vite-plugin-pwa` (Workbox) generates service worker + manifest
- App shell cached for offline use
- Manifest: name "Divvy", theme `#FF6B6B`, 192 + 512px icons, `display: standalone`
- Safe area insets on bottom-anchored action buttons

### localStorage
- `billSlice` + `prefsSlice` persisted via Zustand `persist` middleware
- Home screen shows last 5 bills (lightweight summaries: id, date, people count, total)
- `ocrSlice` never persisted

## Design Language (from SPEC)

- **Font:** Nunito variable (`@fontsource-variable/nunito`), 500 body / 700 totals
- **Palette:** off-white `#FFF8F0` background, coral `#FF6B6B` primary, teal `#4ECDC4` secondary, warm brown `#2D2016` text
- **Radius:** 12px cards, 8px inputs/buttons, full-round avatars
- **Mobile first:** single column to 640px, bottom-anchored CTAs, min 44×44px tap targets
- **Emoji only** — no icon library
- **Dark mode:** not for v1

## Accessibility (WCAG 2.2 AA)

- All text 4.5:1 contrast minimum
- Colour never the only distinguisher — always paired with label/shape
- Keyboard-completable entire flow; visible focus ring (3px offset, coral)
- Radix UI handles focus trap in modals; Escape closes
- `aria-live="polite"` on assignment changes, OCR progress, summary totals
- Semantic HTML throughout: `<main>`, `<section>`, `<h1>`–`<h3>` per screen
- `inputmode="decimal"` on price fields; `autocomplete="off"` on item names
- `prefers-reduced-motion` disables all animations

## Deferred (v2+)

- Crop UI for receipt pre-processing
- Real-time collaborative editing
- Payment links (SnapScan, Zapper)
- User accounts / cloud sync
- Dark mode
