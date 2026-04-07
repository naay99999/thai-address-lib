import type { ThaiAddressRecord, ThaiAddressSuggestion } from '../types'

export function formatThaiAddressSuggestion(record: ThaiAddressRecord): ThaiAddressSuggestion {
  return {
    id: String(record.tambonId),
    label: `${record.tambonNameTh} > ${record.amphureNameTh} > ${record.provinceNameTh} ${record.zipCode}`,
    tambon: record.tambonNameTh,
    amphure: record.amphureNameTh,
    province: record.provinceNameTh,
    zipCode: record.zipCode,
  }
}
