import type { ThaiAddressRecord, ResolvedThaiAddress } from '../types'

export function resolveThaiAddress(record: ThaiAddressRecord): ResolvedThaiAddress {
  return {
    tambon: record.tambonNameTh,
    tambonEn: record.tambonNameEn,
    amphure: record.amphureNameTh,
    amphureEn: record.amphureNameEn,
    province: record.provinceNameTh,
    provinceEn: record.provinceNameEn,
    zipCode: record.zipCode,
    subdistrict: record.tambonNameTh,
    subdistrictEn: record.tambonNameEn,
    district: record.amphureNameTh,
    districtEn: record.amphureNameEn,
    postalCode: record.zipCode,
  }
}
