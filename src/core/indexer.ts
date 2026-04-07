import { extractTrigrams } from './trigrams'
import type { RawData, ThaiAddressRecord, TrigramIndex } from '../types'

export function buildThaiAddressIndex(data: RawData): TrigramIndex {
  const { geographies, provinces, amphures, tambons } = data

  // Build lookup maps (filter deleted)
  const geoMap = new Map(
    geographies.filter(g => !g.deleted_at).map(g => [g.id, g])
  )
  const provMap = new Map(
    provinces.filter(p => !p.deleted_at).map(p => [p.id, p])
  )
  const ampMap = new Map(
    amphures.filter(a => !a.deleted_at).map(a => [a.id, a])
  )

  const records: ThaiAddressRecord[] = []
  const map = new Map<string, Set<number>>()

  for (const tambon of tambons) {
    if (tambon.deleted_at) continue

    const amphure = ampMap.get(tambon.amphure_id)
    if (!amphure) continue

    const province = provMap.get(amphure.province_id)
    if (!province) continue

    const geography = geoMap.get(province.geography_id)
    if (!geography) continue

    const record: ThaiAddressRecord = {
      geographyId: geography.id,
      geographyNameTh: geography.name,
      provinceId: province.id,
      provinceNameTh: province.name_th,
      provinceNameEn: province.name_en,
      amphureId: amphure.id,
      amphureNameTh: amphure.name_th,
      amphureNameEn: amphure.name_en,
      tambonId: tambon.id,
      tambonNameTh: tambon.name_th,
      tambonNameEn: tambon.name_en,
      zipCode: String(tambon.zip_code),
    }

    const idx = records.length
    records.push(record)

    const fields = [
      record.tambonNameTh,
      record.tambonNameEn,
      record.amphureNameTh,
      record.amphureNameEn,
      record.provinceNameTh,
      record.provinceNameEn,
      record.zipCode,
    ]

    for (const field of fields) {
      for (const trigram of extractTrigrams(field)) {
        let set = map.get(trigram)
        if (!set) {
          set = new Set()
          map.set(trigram, set)
        }
        set.add(idx)
      }
    }
  }

  return { map, records }
}
