# Changelog

## [0.2.0](https://github.com/naay99999/thai-address-lib/compare/v0.1.0...v0.2.0) (2026-04-07)

### ⚠ BREAKING CHANGES

* `geographyId` and `geographyNameTh` fields removed from `ThaiAddressRecord`

### Features

* add `zipIndex` to `TrigramIndex` for O(1) zip code prefix lookup ([#audit](https://github.com/naay99999/thai-address-lib))
* sort zip code results by exact match first, then ascending ([#audit](https://github.com/naay99999/thai-address-lib))

### Bug Fixes

* eliminate double normalisation on every search call ([#audit](https://github.com/naay99999/thai-address-lib))
* replace O(n) `findIndex` in React hook with O(1) Map lookup ([#audit](https://github.com/naay99999/thai-address-lib))

### Performance Improvements

* compact JSON in generated index — data bundle reduced by ~900 KB ([#audit](https://github.com/naay99999/thai-address-lib))
* remove `as const` on generated records array to avoid ~96k TS literal-type inferences ([#audit](https://github.com/naay99999/thai-address-lib))
* remove unused `geographyId`/`geographyNameTh` fields — saves ~8.6% from data bundle ([#audit](https://github.com/naay99999/thai-address-lib))

### Miscellaneous

* add raw JSON shape validation in build pipeline ([#audit](https://github.com/naay99999/thai-address-lib))
* remove raw `data/` directory from published npm package ([#audit](https://github.com/naay99999/thai-address-lib))

## 0.1.0 (2026-04-07)

### Features

* initial release — trigram-based Thai address autocomplete library (`thaizip`)
* headless vanilla-JS API: `buildThaiAddressIndex`, `searchThaiAddress`, `formatThaiAddressSuggestion`, `resolveThaiAddress`
* optional React hook: `useThaiAddressAutocomplete` with debounce support
* pre-built `defaultIndex` exported from `thaizip/data` for zero build-cost at runtime
* dual ESM + CJS build output via tsup
