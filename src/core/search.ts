import { normalizeThaiAddressText } from './normalizer'
import { extractTrigrams } from './trigrams'
import type { SearchOptions, ThaiAddressRecord, TrigramIndex } from '../types'

const ZIP_CODE_RE = /^\d+$/

export function searchThaiAddress(
  index: TrigramIndex,
  query: string,
  options?: SearchOptions,
): ThaiAddressRecord[] {
  const limit = options?.limit ?? 10
  const threshold = options?.threshold ?? 0.4

  if (!query) return []
  const normalized = normalizeThaiAddressText(query)
  if (normalized.length === 0) return []

  // Special case: zip code query (require at least 2 digits to avoid overly broad matches)
  if (ZIP_CODE_RE.test(normalized)) {
    if (normalized.length < 2) return []
    return index.records
      .filter(r => r.zipCode.startsWith(normalized))
      .slice(0, limit)
  }

  const queryTrigrams = extractTrigrams(normalized)
  if (queryTrigrams.size === 0) return []

  // Accumulate hit counts per record index
  const hits = new Map<number, number>()
  for (const trigram of queryTrigrams) {
    const candidates = index.map.get(trigram)
    if (!candidates) continue
    for (const idx of candidates) {
      hits.set(idx, (hits.get(idx) ?? 0) + 1)
    }
  }

  const scored: { idx: number; score: number }[] = []
  for (const [idx, count] of hits) {
    const score = count / queryTrigrams.size
    if (score >= threshold) {
      scored.push({ idx, score })
    }
  }

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ idx }) => index.records[idx])
}
