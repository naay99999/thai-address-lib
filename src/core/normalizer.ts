const TONE_MARKS = /[\u0E48-\u0E4B\u0E47\u0E4C]/g
const ADDRESS_PREFIXES = /^(จังหวัด|อำเภอ|ตำบล|แขวง|เขต)/

export function normalizeThaiAddressText(input: string): string {
  if (!input) return ''
  let text = input.trim()
  text = text.replace(ADDRESS_PREFIXES, '')
  text = text.replace(TONE_MARKS, '')
  text = text.toLowerCase()
  return text
}
