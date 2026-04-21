import { describe, it, expect } from 'vitest'
import { formatThaiAddressSuggestion } from '../core/formatter'
import { resolveThaiAddress } from '../core/resolver'
import type { ThaiAddressRecord } from '../types'

const record: ThaiAddressRecord = {
  provinceId: 1,
  provinceNameTh: 'กรุงเทพมหานคร',
  provinceNameEn: 'Bangkok',
  amphureId: 1001,
  amphureNameTh: 'จตุจักร',
  amphureNameEn: 'Chatuchak',
  tambonId: 100101,
  tambonNameTh: 'ลาดพร้าว',
  tambonNameEn: 'Lat Phrao',
  zipCode: '10900',
}

describe('formatThaiAddressSuggestion', () => {
  it('sets id from tambonId', () => {
    const s = formatThaiAddressSuggestion(record)
    expect(s.id).toBe('100101')
  })

  it('formats label as "tambon > amphure > province zipCode"', () => {
    const s = formatThaiAddressSuggestion(record)
    expect(s.label).toBe('ลาดพร้าว > จตุจักร > กรุงเทพมหานคร 10900')
  })

  it('sets tambon, amphure, province, zipCode fields', () => {
    const s = formatThaiAddressSuggestion(record)
    expect(s.tambon).toBe('ลาดพร้าว')
    expect(s.tambonEn).toBe('Lat Phrao')
    expect(s.amphure).toBe('จตุจักร')
    expect(s.amphureEn).toBe('Chatuchak')
    expect(s.province).toBe('กรุงเทพมหานคร')
    expect(s.provinceEn).toBe('Bangkok')
    expect(s.zipCode).toBe('10900')
  })
})

describe('resolveThaiAddress', () => {
  it('sets primary fields', () => {
    const r = resolveThaiAddress(record)
    expect(r.tambon).toBe('ลาดพร้าว')
    expect(r.tambonEn).toBe('Lat Phrao')
    expect(r.amphure).toBe('จตุจักร')
    expect(r.amphureEn).toBe('Chatuchak')
    expect(r.province).toBe('กรุงเทพมหานคร')
    expect(r.provinceEn).toBe('Bangkok')
    expect(r.zipCode).toBe('10900')
  })

  it('sets alias fields', () => {
    const r = resolveThaiAddress(record)
    expect(r.subdistrict).toBe('ลาดพร้าว')
    expect(r.subdistrictEn).toBe('Lat Phrao')
    expect(r.district).toBe('จตุจักร')
    expect(r.districtEn).toBe('Chatuchak')
    expect(r.postalCode).toBe('10900')
  })
})
