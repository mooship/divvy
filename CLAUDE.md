# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev       # dev server
bun run build     # tsc -b && vite build
bun run test      # vitest watch
bun run test:run  # vitest run (CI)
bun run check     # biome check --write . (lint + format, auto-fix)
bunx tsc --noEmit # type-check only
```

Run a single test file:
```bash
bunx vitest run src/lib/calc.test.ts
```

## Architecture

**Flow:** Home → Setup → Items → Extras → Summary (linear, guarded by `ProtectedRoute`)

`ProtectedRoute` redirects to `/` if `useBillStore(s => s.id)` is falsy. `/bill` (read-only summary via shared URL) bypasses the guard.

**Stores** (`src/store/`):
- `useBillStore` — persisted to `localStorage` (`divvy-bill`). Holds the active bill: people, items, tip/serviceFee/deliveryFee, currency.
- `usePrefsStore` — persisted (`divvy-prefs`). User preferences.
- `useOcrStore` — transient (not persisted). OCR state machine: `idle → processing → done | error`, plus `candidates: OcrCandidate[]`.

**All prices are integer cents.** Never use floats for money. `formatCents(cents, currency)` in `src/lib/calc.ts` handles display.

**Shared costs** (tip, serviceFee, deliveryFee) are each a `SharedCost` — either `{ type: 'percentage', value: 15 }` (15%) or `{ type: 'fixed', value: 500 }` (500 cents). Distributed proportionally to each person's item subtotal; if subtotal is zero, split evenly.

**URL sharing:** `encodeBill`/`decodeBill` in `src/lib/sharing.ts` use lz-string compression. The encoded string goes in `?d=`. `Summary` in readOnly mode decodes it; a bad param returns `null` and shows an empty state.

**OCR pipeline:** `preprocessImage` (greyscale + threshold via Canvas) → `runOcr` (Tesseract.js lazy singleton) → `parseReceiptLines` (currency-aware regex, structural keyword filter, quantity prefix stripping). All in `src/lib/ocr.ts`.

**Styling:** UnoCSS with `@unocss/preset-wind4`. Theme key is `font` (not `fontFamily`), value is a plain string. Custom shortcuts: `card`, `btn-primary`, `btn-ghost`, `input-text`, `focus-ring`. Colours: `bg`, `surface`, `coral`, `teal`, `ink`, `muted`, `danger`.

**Linting:** Biome (no ESLint). Single quotes, no semicolons. Run `bun run check` to auto-fix before committing.

## Code conventions

- **No single-line `if` statements** — always use block form `{ }`.
- Emoji spans use `aria-hidden="true"` (not `role="img"`).
- `PersonChip` has a `decorative` prop — pass it when the chip appears alongside visible name text to suppress the aria-label.
- `CurrencyInput` is controlled via integer cents; it manages its own local decimal string state.
