import { describe, it, expect } from 'vitest'
import { defaultIndex } from '../data'
import { searchThaiAddress } from '../core/search'
import { formatThaiAddressSuggestion } from '../core/formatter'
import { resolveThaiAddress } from '../core/resolver'

describe('defaultIndex integration', () => {
  it('has expected number of records', () => {
    expect(defaultIndex.records.length).toBeGreaterThan(7000)
  })

  it('has non-empty trigram map', () => {
    expect(defaultIndex.map.size).toBeGreaterThan(5000)
  })

  it('finds ลาดพร้าว by exact name', () => {
    const results = searchThaiAddress(defaultIndex, 'ลาดพร้าว')
    expect(results.some(r => r.tambonNameTh === 'ลาดพร้าว')).toBe(true)
  })

  it('finds ลาดพร้าว with tone marks missing (fuzzy)', () => {
    const results = searchThaiAddress(defaultIndex, 'ลาดพราว')
    expect(results.some(r => r.tambonNameTh === 'ลาดพร้าว')).toBe(true)
  })

  it('finds records by province name', () => {
    const results = searchThaiAddress(defaultIndex, 'กรุงเทพ')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every(r => r.provinceNameTh === 'กรุงเทพมหานคร')).toBe(true)
  })

  it('finds records by zip code', () => {
    const results = searchThaiAddress(defaultIndex, '10900')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every(r => r.zipCode === '10900')).toBe(true)
  })

  it('finds records by English province name', () => {
    const results = searchThaiAddress(defaultIndex, 'chiang mai')
    expect(results.some(r => r.provinceNameEn === 'Chiang Mai')).toBe(true)
  })

  it('formatThaiAddressSuggestion produces correct label format', () => {
    const results = searchThaiAddress(defaultIndex, 'ลาดพร้าว')
    const suggestion = formatThaiAddressSuggestion(results[0])
    expect(suggestion.label).toMatch(/^.+ > .+ > .+ \d{5}$/)
    expect(suggestion.id).toBeTruthy()
  })

  it('resolveThaiAddress produces all expected fields', () => {
    const results = searchThaiAddress(defaultIndex, 'ลาดพร้าว')
    const resolved = resolveThaiAddress(results[0])
    expect(resolved.tambon).toBeTruthy()
    expect(resolved.subdistrict).toBe(resolved.tambon)
    expect(resolved.district).toBe(resolved.amphure)
    expect(resolved.postalCode).toBe(resolved.zipCode)
  })

  it('returns empty for nonsense query', () => {
    const results = searchThaiAddress(defaultIndex, 'zzzzzzzzzz')
    expect(results).toHaveLength(0)
  })
})
