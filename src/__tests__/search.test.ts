import { describe, it, expect, beforeAll } from 'vitest'
import { buildThaiAddressIndex } from '../core/indexer'
import { searchThaiAddress } from '../core/search'
import type { RawData, TrigramIndex } from '../types'

const mockData: RawData = {
  geographies: [
    { id: 1, name: 'ภาคกลาง', deleted_at: null },
    { id: 2, name: 'ภาคเหนือ', deleted_at: null },
  ],
  provinces: [
    { id: 1, name_th: 'กรุงเทพมหานคร', name_en: 'Bangkok', geography_id: 1, deleted_at: null },
    { id: 2, name_th: 'เชียงใหม่', name_en: 'Chiang Mai', geography_id: 2, deleted_at: null },
  ],
  amphures: [
    { id: 1001, name_th: 'จตุจักร', name_en: 'Chatuchak', province_id: 1, deleted_at: null },
    { id: 1002, name_th: 'ลาดพร้าว', name_en: 'Lat Phrao', province_id: 1, deleted_at: null },
    { id: 2001, name_th: 'เมืองเชียงใหม่', name_en: 'Mueang Chiang Mai', province_id: 2, deleted_at: null },
  ],
  tambons: [
    { id: 100101, zip_code: 10900, name_th: 'ลาดพร้าว', name_en: 'Lat Phrao', amphure_id: 1001, deleted_at: null },
    { id: 100201, zip_code: 10230, name_th: 'จรเข้บัว', name_en: 'Chorakhe Bua', amphure_id: 1002, deleted_at: null },
    { id: 200101, zip_code: 50000, name_th: 'ศรีภูมิ', name_en: 'Si Phum', amphure_id: 2001, deleted_at: null },
    { id: 200102, zip_code: 50200, name_th: 'ช้างเผือก', name_en: 'Chang Phueak', amphure_id: 2001, deleted_at: null },
  ],
}

let index: TrigramIndex

beforeAll(() => {
  index = buildThaiAddressIndex(mockData)
})

describe('searchThaiAddress', () => {
  it('finds exact Thai tambon name match', () => {
    const results = searchThaiAddress(index, 'ลาดพร้าว')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.tambonNameTh === 'ลาดพร้าว')).toBe(true)
  })

  it('finds match with tone marks missing (fuzzy)', () => {
    const results = searchThaiAddress(index, 'ลาดพราว')
    expect(results.some(r => r.tambonNameTh === 'ลาดพร้าว')).toBe(true)
  })

  it('finds match by province name', () => {
    const results = searchThaiAddress(index, 'กรุงเทพ')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every(r => r.provinceNameTh === 'กรุงเทพมหานคร')).toBe(true)
  })

  it('finds match by English amphure name', () => {
    const results = searchThaiAddress(index, 'chatuchak')
    expect(results.some(r => r.amphureNameEn === 'Chatuchak')).toBe(true)
  })

  it('finds match by zip code', () => {
    const results = searchThaiAddress(index, '10900')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every(r => r.zipCode === '10900')).toBe(true)
  })

  it('zip code partial prefix match returns results', () => {
    const results = searchThaiAddress(index, '500')
    expect(results.some(r => r.zipCode.startsWith('500'))).toBe(true)
  })

  it('returns empty array for query with no matches', () => {
    const results = searchThaiAddress(index, 'xyzxyzxyz')
    expect(results).toHaveLength(0)
  })

  it('respects limit option', () => {
    // all records match กรุงเทพ province (2 records)
    const results = searchThaiAddress(index, 'กรุงเทพ', { limit: 1 })
    expect(results).toHaveLength(1)
  })

  it('returns empty array for empty query', () => {
    const results = searchThaiAddress(index, '')
    expect(results).toHaveLength(0)
  })

  it('is case-insensitive for English', () => {
    const lower = searchThaiAddress(index, 'bangkok')
    const upper = searchThaiAddress(index, 'BANGKOK')
    expect(lower.length).toBe(upper.length)
  })

  // A-4: threshold boundary
  it('returns empty when threshold is 1.0 and query has no perfect match', () => {
    const results = searchThaiAddress(index, 'xyzabc', { threshold: 1.0 })
    expect(results).toHaveLength(0)
  })

  it('returns results when threshold is 0', () => {
    const results = searchThaiAddress(index, 'กรุง', { threshold: 0 })
    expect(results.length).toBeGreaterThan(0)
  })

  // A-5: single-digit zip
  it('returns empty for single-digit zip code', () => {
    expect(searchThaiAddress(index, '1')).toHaveLength(0)
  })

  // A-6: whitespace-only query
  it('returns empty for whitespace-only query', () => {
    expect(searchThaiAddress(index, '   ')).toHaveLength(0)
  })
})
