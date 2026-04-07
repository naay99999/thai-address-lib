import type { ThaiAddressRecord, ResolvedThaiAddress } from '../types'

export function resolveThaiAddress(record: ThaiAddressRecord): ResolvedThaiAddress {
  return {
    tambon: record.tambonNameTh,
    amphure: record.amphureNameTh,
    province: record.provinceNameTh,
    zipCode: record.zipCode,
    subdistrict: record.tambonNameTh,
    district: record.amphureNameTh,
    postalCode: record.zipCode,
  }
}
