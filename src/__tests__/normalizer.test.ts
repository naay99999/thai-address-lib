import { describe, it, expect } from 'vitest'
import { normalizeThaiAddressText } from '../core/normalizer'

describe('normalizeThaiAddressText', () => {
  it('strips Thai tone marks', () => {
    expect(normalizeThaiAddressText('ลาดพร้าว')).toBe('ลาดพราว')
  })

  it('strips จังหวัด prefix', () => {
    expect(normalizeThaiAddressText('จังหวัดกรุงเทพมหานคร')).toBe('กรุงเทพมหานคร')
  })

  it('strips อำเภอ prefix', () => {
    expect(normalizeThaiAddressText('อำเภอเมือง')).toBe('เมือง')
  })

  it('strips ตำบล prefix', () => {
    expect(normalizeThaiAddressText('ตำบลลาดพร้าว')).toBe('ลาดพราว')
  })

  it('strips แขวง prefix', () => {
    expect(normalizeThaiAddressText('แขวงลาดพร้าว')).toBe('ลาดพราว')
  })

  it('strips เขต prefix', () => {
    expect(normalizeThaiAddressText('เขตจตุจักร')).toBe('จตุจักร')
  })

  it('lowercases English characters', () => {
    expect(normalizeThaiAddressText('Bangkok')).toBe('bangkok')
  })

  it('trims whitespace', () => {
    expect(normalizeThaiAddressText('  ลาดพร้าว  ')).toBe('ลาดพราว')
  })

  it('handles combined: prefix + tone marks + spaces', () => {
    expect(normalizeThaiAddressText(' จังหวัดลาดพราว ')).toBe('ลาดพราว')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeThaiAddressText('')).toBe('')
  })

  it('strips all Thai tone mark variants', () => {
    // ่ ้ ๊ ๋ ็ ์
    expect(normalizeThaiAddressText('ก่า')).toBe('กา')
    expect(normalizeThaiAddressText('ก้า')).toBe('กา')
    expect(normalizeThaiAddressText('ก๊า')).toBe('กา')
    expect(normalizeThaiAddressText('ก๋า')).toBe('กา')
    expect(normalizeThaiAddressText('ก็า')).toBe('กา')
    expect(normalizeThaiAddressText('กา์')).toBe('กา')
  })
})
