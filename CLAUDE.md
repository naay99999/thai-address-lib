# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # Build ESM + CJS bundles with type declarations (tsup)
npm run generate-data  # Regenerate src/data/defaultIndex.ts from raw JSON data
npm test               # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

To run a single test file:
```bash
npx vitest run src/__tests__/search.test.ts
```

## Architecture

This is a headless Thai address autocomplete library published as `thai-address`. It ships both a vanilla-JS API and an optional React hook.

**Package exports:**
- `thai-address` — core functions + React hook
- `thai-address/data` — pre-built `defaultIndex` (heavy, ~1 MB serialised; kept in a separate export so tree-shakers can isolate it)

**Data pipeline:**
- Raw JSON files in `data/` (thai_geographies, thai_provinces, thai_amphures, thai_tambons) are the source of truth
- `npm run generate-data` (`src/data/generate.ts`) joins these four tables into flat `ThaiAddressRecord` objects and writes a pre-built `TrigramIndex` to `src/data/defaultIndex.ts`
- The pre-built index is exported as `defaultIndex` so consumers pay zero build cost at runtime

**Search engine (`src/core/`):**
- `normalizer.ts` — strips Thai address prefixes (จังหวัด/อำเภอ/ตำบล/แขวง/เขต) and Thai tone marks, then lowercases; applied to both index and query
- `indexer.ts` — `buildThaiAddressIndex(RawData)` joins the four tables, skips soft-deleted rows, and builds a trigram inverted index (`Map<trigram, Set<recordIndex>>`)
- `search.ts` — `searchThaiAddress(index, query, options?)` extracts trigrams from the normalised query, counts hits per record, scores as `hits/queryTrigrams`, filters by threshold (default 0.4), returns top-N. Zip code queries bypass trigrams and do a prefix match instead.
- `formatter.ts` — converts a `ThaiAddressRecord` into a `ThaiAddressSuggestion` (display label + structured fields)
- `resolver.ts` — converts a `ThaiAddressRecord` into a `ResolvedThaiAddress` with both Thai-conventional aliases (tambon/amphure/province) and English-conventional aliases (subdistrict/district/postalCode)

**React integration (`src/react/`):**
- `useThaiAddressAutocomplete` wraps `searchThaiAddress` with debounce (default 200 ms) and manages query/suggestions state
- `selectSuggestion` looks up the full record by `tambonId`, calls `resolveThaiAddress`, and clears suggestions

**Build output (`tsup`):**
- Dual ESM + CJS, `react` and `react-dom` are external peers (optional peer dependency)
- Entry: `src/index.ts` re-exports everything consumers need

**Tests:** Vitest with jsdom environment, test files live in `src/__tests__/`.
