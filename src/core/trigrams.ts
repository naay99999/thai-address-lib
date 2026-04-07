import { normalizeThaiAddressText } from './normalizer'

// Public: for callers who start from raw (un-normalised) text — e.g. indexer
export function extractTrigrams(text: string): Set<string> {
  return extractTrigramsNormalized(normalizeThaiAddressText(text))
}

// Internal: for callers who already hold a normalised string — e.g. search.ts
export function extractTrigramsNormalized(text: string): Set<string> {
  const result = new Set<string>()
  if (text.length === 0) return result
  if (text.length < 3) {
    result.add(text)
    return result
  }
  for (let i = 0; i <= text.length - 3; i++) {
    result.add(text.slice(i, i + 3))
  }
  return result
}
