/**
 * Build script: reads raw JSON data → generates src/data/defaultIndex.ts
 * Run: npm run generate-data
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { buildThaiAddressIndex } from '../core/indexer'
import type { RawData } from '../types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../../data')
const outFile = resolve(__dirname, 'defaultIndex.ts')

function readJson<T>(filename: string): T {
  return JSON.parse(readFileSync(resolve(dataDir, filename), 'utf-8')) as T
}

function validateRawData(data: RawData): void {
  if (!Array.isArray(data.geographies)) throw new Error('geographies must be an array')
  if (!Array.isArray(data.provinces)) throw new Error('provinces must be an array')
  if (!Array.isArray(data.amphures)) throw new Error('amphures must be an array')
  if (!Array.isArray(data.tambons)) throw new Error('tambons must be an array')
  for (const p of data.provinces) {
    if (typeof p.id !== 'number') throw new Error(`province missing id: ${JSON.stringify(p)}`)
    if (typeof p.name_th !== 'string') throw new Error(`province missing name_th: ${JSON.stringify(p)}`)
    if (typeof p.name_en !== 'string') throw new Error(`province missing name_en: ${JSON.stringify(p)}`)
  }
  for (const a of data.amphures) {
    if (typeof a.id !== 'number') throw new Error(`amphure missing id: ${JSON.stringify(a)}`)
    if (typeof a.province_id !== 'number') throw new Error(`amphure missing province_id: ${JSON.stringify(a)}`)
  }
  for (const t of data.tambons) {
    if (typeof t.id !== 'number') throw new Error(`tambon missing id: ${JSON.stringify(t)}`)
    if (typeof t.zip_code !== 'number') throw new Error(`tambon missing zip_code: ${JSON.stringify(t)}`)
    if (typeof t.amphure_id !== 'number') throw new Error(`tambon missing amphure_id: ${JSON.stringify(t)}`)
  }
}

const rawData: RawData = {
  geographies: readJson('thai_geographies.json'),
  provinces: readJson('thai_provinces.json'),
  amphures: readJson('thai_amphures.json'),
  tambons: readJson('thai_tambons.json'),
}

validateRawData(rawData)

console.time('buildThaiAddressIndex')
const index = buildThaiAddressIndex(rawData)
console.timeEnd('buildThaiAddressIndex')

console.log(`Built index: ${index.records.length} records, ${index.map.size} trigrams, ${index.zipIndex.size} zip codes`)

// Serialize Map<string, Set<number>> as [string, number[]][]
const serializedMap: [string, number[]][] = []
for (const [key, set] of index.map) {
  serializedMap.push([key, Array.from(set)])
}

// Serialize zipIndex
const serializedZip: [string, number[]][] = Array.from(index.zipIndex.entries())

const output = `// AUTO-GENERATED — do not edit manually
// Run: npm run generate-data
import type { TrigramIndex } from '../types'

const records = ${JSON.stringify(index.records)}

const mapEntries: [string, number[]][] = ${JSON.stringify(serializedMap)}

const map = new Map<string, Set<number>>(
  mapEntries.map(([k, v]) => [k, new Set(v)])
)

const zipEntries: [string, number[]][] = ${JSON.stringify(serializedZip)}

const zipIndex = new Map<string, number[]>(zipEntries)

export const defaultIndex: TrigramIndex = { map, records: records as unknown as import('../types').ThaiAddressRecord[], zipIndex }
`

writeFileSync(outFile, output, 'utf-8')
console.log(`Written to ${outFile}`)
