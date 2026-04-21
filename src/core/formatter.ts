import type { ThaiAddressRecord, ThaiAddressSuggestion } from '../types'

export function formatThaiAddressSuggestion(record: ThaiAddressRecord): ThaiAddressSuggestion {
  return {
    id: String(record.tambonId),
    label: `${record.tambonNameTh} > ${record.amphureNameTh} > ${record.provinceNameTh} ${record.zipCode}`,
    tambon: record.tambonNameTh,
    tambonEn: record.tambonNameEn,
    amphure: record.amphureNameTh,
    amphureEn: record.amphureNameEn,
    province: record.provinceNameTh,
    provinceEn: record.provinceNameEn,
    zipCode: record.zipCode,
  }
}
