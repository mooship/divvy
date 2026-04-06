# Divvy

A PWA for splitting restaurant bills fairly. Scan a receipt, assign items to people, and get an instant breakdown of who owes what.

## Features

- **Receipt scanning** — OCR via Tesseract.js with image pre-processing for accuracy
- **Manual entry** — Add items by name and price if scanning isn't practical
- **Flexible splitting** — Assign each item to one or more people; remainders distributed by cent
- **Extras** — Tip, service fee, and delivery fee split proportionally or as fixed amounts
- **Shareable summary** — Bill encoded as a compressed URL param; share via native share sheet or clipboard
- **Recent bills** — Last 5 completed bills saved locally for reference
- **Multi-currency** — ZAR, USD, EUR, GBP, and more
- **PWA** — Installable, works offline after first load

## Tech stack

- React 19 + Vite 8 with React Compiler
- React Router v6
- Zustand (persisted bill + prefs stores, transient OCR store)
- UnoCSS + `@unocss/preset-wind4`
- Radix UI Dialog
- Tesseract.js (lazy-loaded)
- lz-string (URL sharing)
- Biome (lint + format)
- Vitest + Testing Library

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm check` | Biome lint + format (auto-fix) |

## Project structure

```
src/
  lib/          # Pure functions — calc, sharing, OCR parsing
  store/        # Zustand stores (bill, prefs, ocr)
  components/   # Shared UI (PersonChip, CurrencyInput, BottomAction)
  screens/      # One folder per route (Home, Setup, Items, Extras, Summary)
  router.tsx
  types.ts
```
