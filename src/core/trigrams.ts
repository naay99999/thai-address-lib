import { normalizeThaiAddressText } from './normalizer'

export function extractTrigrams(text: string): Set<string> {
  const normalized = normalizeThaiAddressText(text)
  const result = new Set<string>()
  if (normalized.length === 0) return result
  if (normalized.length < 3) {
    result.add(normalized)
    return result
  }
  for (let i = 0; i <= normalized.length - 3; i++) {
    result.add(normalized.slice(i, i + 3))
  }
  return result
}
