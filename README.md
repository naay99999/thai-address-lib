# thaizip

ไลบรารี autocomplete ที่อยู่ไทยแบบ fuzzy search รวดเร็ว รองรับทั้ง Vanilla JS และ React

- ค้นหาได้ทั้งภาษาไทย ภาษาอังกฤษ และรหัสไปรษณีย์
- Fuzzy search — ไม่ต้องใส่วรรณยุกต์ก็ค้นหาได้ เช่น "ลาดพราว" เจอ "ลาดพร้าว"
- ไม่มี dependency นอกจาก React (optional)
- Index สร้างไว้ล่วงหน้า ไม่มีต้นทุนตอน runtime
- รองรับ ESM และ CJS

---

## ติดตั้ง

```bash
npm install thaizip
```

ถ้าใช้กับ React ต้องมี React >= 18 เป็น peer dependency อยู่แล้ว ไม่ต้องติดตั้งเพิ่ม

---

## การใช้งานพื้นฐาน (Vanilla JS / TypeScript)

### ค้นหาที่อยู่

```ts
import { defaultIndex } from 'thaizip/data'
import { searchThaiAddress } from 'thaizip'

// ค้นหาด้วยชื่อตำบล/อำเภอ/จังหวัด
const results = searchThaiAddress(defaultIndex, 'ลาดพร้าว')

// ค้นหาด้วยรหัสไปรษณีย์
const results = searchThaiAddress(defaultIndex, '10900')

// ค้นหาด้วยภาษาอังกฤษ
const results = searchThaiAddress(defaultIndex, 'chiang mai')

console.log(results)
// [{ tambonId, tambonNameTh, tambonNameEn, amphureId, amphureNameTh, ... zipCode }, ...]
```

### ตัวเลือก (options)

```ts
const results = searchThaiAddress(defaultIndex, 'ลาดพร้าว', {
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
//   tambon: 'ลาดพร้าว',
//   amphure: 'ลาดพร้าว',
//   province: 'กรุงเทพมหานคร',
//   zipCode: '10230',
// }
```

**`resolveThaiAddress`** — ใช้บันทึกข้อมูลหลังผู้ใช้เลือก

```ts
import { resolveThaiAddress } from 'thaizip'

const resolved = resolveThaiAddress(results[0])
// {
//   tambon: 'ลาดพร้าว',        subdistrict: 'ลาดพร้าว',
//   amphure: 'ลาดพร้าว',       district: 'ลาดพร้าว',
//   province: 'กรุงเทพมหานคร',
//   zipCode: '10230',           postalCode: '10230',
// }
```

---

## การใช้งานกับ React

### `useThaiAddressAutocomplete`

Hook นี้จัดการ state ของ query, suggestions, debounce ให้ทั้งหมด

```tsx
import { defaultIndex } from 'thaizip/data'
import { useThaiAddressAutocomplete } from 'thaizip'

function AddressForm() {
  const { query, setQuery, suggestions, isOpen, selectSuggestion, clear } =
    useThaiAddressAutocomplete({
      index: defaultIndex,
      limit: 10,       // default: 10
      debounce: 200,   // default: 200ms
      threshold: 0.4,  // default: 0.4
    })

  const [address, setAddress] = useState(null)

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
          <p>ตำบล: {address.tambon}</p>
          <p>อำเภอ: {address.amphure}</p>
          <p>จังหวัด: {address.province}</p>
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
import { defaultIndex } from 'thaizip/data'
import { searchThaiAddress, formatThaiAddressSuggestion } from 'thaizip'

const app = express()

app.get('/address/search', (req, res) => {
  const query = String(req.query.q ?? '')
  if (!query) return res.json([])

  const results = searchThaiAddress(defaultIndex, query, { limit: 10 })
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
  label: string       // "ตำบล > อำเภอ > จังหวัด XXXXX"
  tambon: string
  amphure: string
  province: string
  zipCode: string
}

type ResolvedThaiAddress = {
  tambon: string      // alias: subdistrict
  amphure: string     // alias: district
  province: string
  zipCode: string     // alias: postalCode
  subdistrict: string
  district: string
  postalCode: string
}
```

---

## License

MIT
