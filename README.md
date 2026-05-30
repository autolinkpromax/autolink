# AutoLink — ควบคุมประตูผ่าน Blynk Webhook

หน้าเว็บสแตติก (HTML / CSS / JS) สำหรับกด **เปิด · หยุด · ปิด** ประตูผ่าน Blynk Cloud โดยไม่ต้องเปิดแอป Blynk — เก็บการตั้งค่าใน **localStorage** บนเครื่องผู้ใช้

## วิธีเปิด

- เปิด `index.html` ผ่านเว็บเซิร์ฟเวอร์ (แนะนำ) เช่น `npx serve .` ในโฟลเดอร์นี้
- หรือโฮสต์บน GitHub Pages / ไฟล์ในเครือข่าย
- การเปิดแบบ `file://` อาจส่ง webhook ไม่ได้ในบางเบราว์เซอร์ — ใช้ localhost แทน

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

จาก WebUI เครื่อง AutoDoor-RF2: **ตั้งค่า → Blynk IoT → เปิด AutoLink** (สร้างลิงก์อัตโนมัติ)

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

## โครงไฟล์

```
index.html
css/   tokens, base, gate, components
js/    app, config-store, webhook, gate-controller, skin-engine, skins-registry
skins/ schema + ตัวอย่าง JSON
```
