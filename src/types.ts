export type ThaiAddressRecord = {
  provinceId: number
  provinceNameTh: string
  provinceNameEn: string

  amphureId: number
  amphureNameTh: string
  amphureNameEn: string

  tambonId: number
  tambonNameTh: string
  tambonNameEn: string

  zipCode: string
}

export type TrigramIndex = {
  map: Map<string, Set<number>>
  records: ThaiAddressRecord[]
  zipIndex: Map<string, number[]>
}

export type ThaiAddressSuggestion = {
  id: string
  label: string
  tambon: string
  amphure: string
  province: string
  zipCode: string
}

export type ResolvedThaiAddress = {
  tambon: string
  amphure: string
  province: string
  zipCode: string
  subdistrict: string
  district: string
  postalCode: string
}

export type SearchOptions = {
  limit?: number
  threshold?: number
}

export type UseThaiAddressAutocompleteOptions = {
  index: TrigramIndex
  limit?: number
  debounce?: number
  threshold?: number
}

// Raw input types
export type RawGeography = {
  id: number
  name: string
  deleted_at: string | null
}

export type RawProvince = {
  id: number
  name_th: string
  name_en: string
  geography_id: number
  deleted_at: string | null
}

export type RawAmphure = {
  id: number
  name_th: string
  name_en: string
  province_id: number
  deleted_at: string | null
}

export type RawTambon = {
  id: number
  zip_code: number
  name_th: string
  name_en: string
  amphure_id: number
  deleted_at: string | null
}

export type RawData = {
  geographies: RawGeography[]
  provinces: RawProvince[]
  amphures: RawAmphure[]
  tambons: RawTambon[]
}
