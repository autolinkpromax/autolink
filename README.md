# AutoLink — ควบคุมประตูผ่าน Blynk Webhook

หน้าเว็บสแตติกสำหรับกด **เปิด · หยุด · ปิด** ผ่าน Blynk Cloud — **ไม่มีแผงตั้งค่าให้ผู้ใช้ทั่วไป** ระบบสร้าง webhook ให้แต่ละปุ่มอัตโนมัติ

โฮสต์สาธารณะ: [https://autolinkpromax.github.io/autolink/index.html](https://autolinkpromax.github.io/autolink/index.html)

## การใช้งาน (ผู้ใช้ทั่วไป)

1. **ครั้งแรกบนมือถือ/คอมเครื่องนี้:** จาก WebUI เครื่อง AutoDoor-RF2 → ตั้งค่า → Blynk IoT → **เปิด AutoLink** (ส่ง Token + V pin ทาง URL แล้วบันทึกลง localStorage)
2. **ครั้งถัดไป:** เปิด [index.html](https://autolinkpromax.github.io/autolink/index.html) ตรงๆ → เห็นแค่ 3 ปุ่ม + ประตู → กดสั่งได้ทันที

ไม่ต้องกรอกอะไรบนหน้าเว็บ — ไม่มีปุ่ม ⚙ ยกเว้นโหมดผู้ดูแล (`?setup=1`)

## วิธี deploy GitHub Pages

1. อัปโหลดทั้งโฟลเดอร์ `autolink` ขึ้น repo `autolinkpromax.github.io` (path `/autolink/`)
2. **ทางเลือก A — Token ในเว็บ (ไม่ต้องเปิดจาก ESP):** แก้ [`js/deploy-config.js`](js/deploy-config.js) ใส่ `token` แล้ว push (Token จะเห็นใน repo สาธารณะ)
3. **ทางเลือก B — ปลอดภัยกว่า:** ปล่อย `token` ว่างใน `deploy-config.js` ให้ผู้ใช้เปิดจาก ESP ครั้งแรกเท่านั้น

## Deep link (กรอกอัตโนมัติ)

ส่งค่าผ่าน query หรือ hash แล้วหน้าจะบันทึกลง localStorage และลบ `token` ออกจาก URL:

```
index.html?host=sgp1.blynk.cloud&token=YOUR_TOKEN&vOpen=0&vStop=1&vClose=2&skin=classic
```

| พารามิเตอร์ | ความหมาย |
|-------------|----------|
| `host` | โฮสต์ Blynk (ค่าเริ่มต้น `sgp1.blynk.cloud`) |
| `token` | Auth token จาก Device |
| `vOpen`, `vStop`, `vClose` | หมายเลข Virtual Pin |
| `skin` | `classic`, `row3`, `magic` |

จาก WebUI เครื่อง AutoDoor-RF2: **ตั้งค่า → Blynk IoT → เปิด AutoLink** (ลิงก์ไป `autolinkpromax.github.io` พร้อม query)

## รูปแบบ Webhook

ตรงกับเฟิร์มแวร์ AutoDoor-RF2:

```
https://{host}/external/api/update?token={token}&V{pin}=1
```

ค่าเริ่มต้น: V0 เปิด · V1 หยุด · V2 ปิด

## Skin

- Built-in: `classic` (เรียงแนวตั้ง), `row3` (แถวเดียว), `magic` (เปิดเต็มแถว)
- สคีมา: [`skins/schema-v1.json`](skins/schema-v1.json)
- สัญญา DOM: `data-al-bind` (`gateVisual`, `statusText`, `action-open|stop|close`, `feedback`)
- ปุ่มใช้ `data-al-action` — ไม่ใส่ `onclick` ใน manifest
- นำเข้า skin กำหนดเอง: ส่งออก/นำเข้า JSON ในแผงตั้งค่า (`skin.customManifest`)

### การวางปุ่ม (`regions.actions.placement.mode`)

| mode | คำอธิบาย |
|------|----------|
| `stack` | แนวตั้งเต็มความกว้าง |
| `row` | แถวเดียว |
| `grid` | กำหนด `columns` + `slots.*.gridColumn/Row` |
| `magic` | เปิดเต็มแถว · หยุด/ปิดแถวล่าง |
| `absolute` | `slots.*.{top,left,width,height}` เป็น % ใน `#alActionsHost` |

## localStorage

| คีย์ | เนื้อหา |
|------|---------|
| `autolink.blynk.v1` | host, token, pins |
| `autolink.skin.v1` | activeId, customManifest, customCss |

## ข้อจำกัด

- **Token อยู่ใน URL** ที่ส่งไป Blynk — อย่าแชร์ deep link หรือสกรีนช็อตที่มี token
- ไม่มี CORS อ่านสถานะ V3 จาก cloud — เอนิเมชันประตูสะท้อนการกด (optimistic UI)
- ไม่ฝังใน firmware ในเวอร์ชันนี้ — อัปเดตเฟิร์มแวร์ไม่จำเป็นสำหรับ AutoLink อย่างเดียว

## โหมดผู้ดูแล

เปิด `index.html?setup=1` เพื่อแก้ host / token / pin / skin ด้วยมือ

## โครงไฟล์

```
index.html
css/   tokens, base, gate, components
js/    deploy-config.js, app, config-store, webhook, gate-controller, skin-engine, skins-registry
skins/ schema + ตัวอย่าง JSON
```
