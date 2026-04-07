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

const rawData: RawData = {
  geographies: readJson('thai_geographies.json'),
  provinces: readJson('thai_provinces.json'),
  amphures: readJson('thai_amphures.json'),
  tambons: readJson('thai_tambons.json'),
}

console.time('buildThaiAddressIndex')
const index = buildThaiAddressIndex(rawData)
console.timeEnd('buildThaiAddressIndex')

console.log(`Built index: ${index.records.length} records, ${index.map.size} trigrams`)

// Serialize Map<string, Set<number>> as [string, number[]][]
const serializedMap: [string, number[]][] = []
for (const [key, set] of index.map) {
  serializedMap.push([key, Array.from(set)])
}

const output = `// AUTO-GENERATED — do not edit manually
// Run: npm run generate-data
import type { TrigramIndex } from '../types'

const records = ${JSON.stringify(index.records, null, 2)} as const

const mapEntries: [string, number[]][] = ${JSON.stringify(serializedMap)}

const map = new Map<string, Set<number>>(
  mapEntries.map(([k, v]) => [k, new Set(v)])
)

export const defaultIndex: TrigramIndex = { map, records: records as unknown as import('../types').ThaiAddressRecord[] }
`

writeFileSync(outFile, output, 'utf-8')
console.log(`Written to ${outFile}`)
