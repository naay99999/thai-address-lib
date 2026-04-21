# thaizip

ไลบรารี autocomplete ที่อยู่ไทยแบบ fuzzy search รวดเร็ว รองรับทั้ง Vanilla JS และ React

- ค้นหาได้ทั้งภาษาไทย ภาษาอังกฤษ และรหัสไปรษณีย์
- Fuzzy search — ไม่ต้องใส่วรรณยุกต์ก็ค้นหาได้ เช่น "ลาดพราว" เจอ "ลาดพร้าว"
- ไม่มี dependency นอกจาก React (optional)
- โหลดข้อมูลแบบ async — ไม่บล็อก initial bundle (~132 KB gzip)
- รองรับ ESM และ CJS

---

## ติดตั้ง

```bash
npm install thaizip
```

ถ้าใช้กับ React ต้องมี React >= 18 เป็น peer dependency อยู่แล้ว ไม่ต้องติดตั้งเพิ่ม

---

## การใช้งานพื้นฐาน (Vanilla JS / TypeScript)

### โหลด index และค้นหาที่อยู่

```ts
import { loadDefaultIndex } from 'thaizip/data'
import { searchThaiAddress } from 'thaizip'

// โหลด index ครั้งแรก ~200ms (cached หลังจากนั้น)
const index = await loadDefaultIndex()

// ค้นหาด้วยชื่อตำบล/อำเภอ/จังหวัด
const results = searchThaiAddress(index, 'ลาดพร้าว')

// ค้นหาด้วยรหัสไปรษณีย์
const results2 = searchThaiAddress(index, '10900')

// ค้นหาด้วยภาษาอังกฤษ
const results3 = searchThaiAddress(index, 'chiang mai')

console.log(results)
// [{ tambonId, tambonNameTh, tambonNameEn, amphureId, amphureNameTh, ... zipCode }, ...]
```

### ตัวเลือก (options)

```ts
const results = searchThaiAddress(index, 'ลาดพร้าว', {
  limit: 5,       // จำนวนผลลัพธ์สูงสุด (default: 10)
  threshold: 0.4, // ความแม่นยำขั้นต่ำ 0–1 (default: 0.4)
})
```

### แปลงผลลัพธ์เป็นรูปแบบต่าง ๆ

**`formatThaiAddressSuggestion`** — ใช้แสดงใน dropdown

```ts
import { formatThaiAddressSuggestion } from 'thaizip'

const suggestion = formatThaiAddressSuggestion(results[0])
// {
//   id: '100101',
//   label: 'ลาดพร้าว > ลาดพร้าว > กรุงเทพมหานคร 10230',
//   tambon: 'ลาดพร้าว',     tambonEn: 'Lat Phrao',
//   amphure: 'ลาดพร้าว',    amphureEn: 'Lat Phrao',
//   province: 'กรุงเทพมหานคร', provinceEn: 'Bangkok',
//   zipCode: '10230',
// }
```

**`resolveThaiAddress`** — ใช้บันทึกข้อมูลหลังผู้ใช้เลือก

```ts
import { resolveThaiAddress } from 'thaizip'

const resolved = resolveThaiAddress(results[0])
// {
//   tambon: 'ลาดพร้าว',        tambonEn: 'Lat Phrao',
//   amphure: 'ลาดพร้าว',       amphureEn: 'Lat Phrao',
//   province: 'กรุงเทพมหานคร', provinceEn: 'Bangkok',
//   zipCode: '10230',
//   subdistrict: 'ลาดพร้าว',   subdistrictEn: 'Lat Phrao',
//   district: 'ลาดพร้าว',      districtEn: 'Lat Phrao',
//   postalCode: '10230',
// }
```

---

## การใช้งานกับ React

### `useThaiAddressAutocomplete`

Hook นี้จัดการ state ของ query, suggestions, debounce ให้ทั้งหมด

```tsx
import { useState, useEffect } from 'react'
import { loadDefaultIndex } from 'thaizip/data'
import { useThaiAddressAutocomplete } from 'thaizip'
import type { TrigramIndex } from 'thaizip'

function AddressForm() {
  const [index, setIndex] = useState<TrigramIndex | null>(null)

  useEffect(() => {
    loadDefaultIndex().then(setIndex)
  }, [])

  const { query, setQuery, suggestions, isOpen, selectSuggestion, clear } =
    useThaiAddressAutocomplete({
      index: index!,
      limit: 10,       // default: 10
      debounce: 200,   // default: 200ms
      threshold: 0.4,  // default: 0.4
    })

  const [address, setAddress] = useState(null)

  if (!index) return <p>กำลังโหลด...</p>

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="พิมพ์ตำบล อำเภอ จังหวัด หรือรหัสไปรษณีย์"
      />

      {isOpen && (
        <ul>
          {suggestions.map((s) => (
            <li key={s.id} onClick={() => {
              const resolved = selectSuggestion(s)
              setAddress(resolved)
            }}>
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {address && (
        <div>
          <p>ตำบล: {address.tambon} ({address.tambonEn})</p>
          <p>อำเภอ: {address.amphure} ({address.amphureEn})</p>
          <p>จังหวัด: {address.province} ({address.provinceEn})</p>
          <p>รหัสไปรษณีย์: {address.zipCode}</p>
        </div>
      )}
    </div>
  )
}
```

### Return ของ hook

| ค่า | ประเภท | คำอธิบาย |
|---|---|---|
| `query` | `string` | ข้อความที่ผู้ใช้พิมพ์อยู่ |
| `setQuery` | `(value: string) => void` | อัปเดต query |
| `suggestions` | `ThaiAddressSuggestion[]` | รายการผลลัพธ์ที่แสดงใน dropdown |
| `isOpen` | `boolean` | `true` เมื่อมี query และมี suggestions |
| `selectSuggestion` | `(item) => ResolvedThaiAddress` | เลือก suggestion แล้วได้ข้อมูลที่อยู่ครบ |
| `clear` | `() => void` | ล้าง query และ suggestions ทั้งหมด |

---

## การใช้งานกับ Node.js / Express

```ts
import express from 'express'
import { loadDefaultIndex } from 'thaizip/data'
import { searchThaiAddress, formatThaiAddressSuggestion } from 'thaizip'

const app = express()

// โหลด index ครั้งเดียวตอน startup
const index = await loadDefaultIndex()

app.get('/address/search', (req, res) => {
  const query = String(req.query.q ?? '')
  if (!query) return res.json([])

  const results = searchThaiAddress(index, query, { limit: 10 })
  res.json(results.map(formatThaiAddressSuggestion))
})

app.listen(3000)
```

เรียกใช้งาน:
```
GET /address/search?q=ลาดพร้าว
GET /address/search?q=10900
```

---

## ใช้ข้อมูล Index ของตัวเอง

หากต้องการสร้าง index จากข้อมูลที่กำหนดเอง

```ts
import { buildThaiAddressIndex } from 'thaizip'

const index = buildThaiAddressIndex({
  geographies: [...],
  provinces: [...],
  amphures: [...],
  tambons: [...],
})
```

รูปแบบข้อมูล raw ดูได้จาก type `RawData`, `RawProvince`, `RawAmphure`, `RawTambon` ที่ export มาจาก library

---

## Types หลัก

```ts
type ThaiAddressSuggestion = {
  id: string
  label: string        // "ตำบล > อำเภอ > จังหวัด XXXXX"
  tambon: string
  tambonEn: string
  amphure: string
  amphureEn: string
  province: string
  provinceEn: string
  zipCode: string
}

type ResolvedThaiAddress = {
  tambon: string        // alias: subdistrict
  tambonEn: string      // alias: subdistrictEn
  amphure: string       // alias: district
  amphureEn: string     // alias: districtEn
  province: string
  provinceEn: string
  zipCode: string       // alias: postalCode
  subdistrict: string
  subdistrictEn: string
  district: string
  districtEn: string
  postalCode: string
}
```

---

## Migration จาก v0.x

```ts
// v0.x (sync)
import { defaultIndex } from 'thaizip/data'
const results = searchThaiAddress(defaultIndex, query)

// v1.0 (async)
import { loadDefaultIndex } from 'thaizip/data'
const index = await loadDefaultIndex()  // cache อัตโนมัติ
const results = searchThaiAddress(index, query)
```

---

## License

MIT
