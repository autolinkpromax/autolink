# AutoLink

[https://autolinkpromax.github.io/autolink/index.html](https://autolinkpromax.github.io/autolink/index.html)

เปิดหน้าแล้ว **กดปุ่มได้เลย** — ไม่มีฟอร์มให้กรอก

## วิธีให้หน้าเว็บพร้อม (เลือกอย่างใดอย่างหนึ่ง)

### A — ใส่ Token ในไฟล์ก่อนอัปโหลด GitHub (แนะนำถ้าไม่ใช้ ESP)

แก้ [`js/deploy-config.js`](js/deploy-config.js):

```javascript
window.AL_DEPLOY_CONFIG = {
  host: 'sgp1.blynk.cloud',
  token: 'รหัสจาก blynk.cloud',
  pins: { open: 0, stop: 1, close: 2, lock: 3 },
  skin: 'classic'
};
```

อัปโหลด GitHub Pages → ทุกคนที่เปิดลิงก์สั่งได้ (ใช้ repo ส่วนตัว)

### B — เปิดจากเครื่อง AutoLink ครั้งแรก (แนะนำ)

ตั้งค่า → **AutoLink** → **เปิด AutoLink** — ส่งลิงก์ WebHook LAN (เปิด/หยุด/ปิด/ล็อก) อัตโนมัติ บันทึกในเบราว์เซอร์นั้น

ปุ่ม **ล็อกระบบ** ส่ง WebHook ล็อก Auto Link (`value=1` = ล็อก, `0` = ปลด)

### C — Blynk Cloud (ทางเลือก)

ใส่ Token ใน `deploy-config.js` หรือเปิดด้วย `postMessage` แบบ `autolink-blynk` — สั่งผ่าน Blynk API ได้จากทุกที่

ครั้งหลังเปิด [index.html](https://autolinkpromax.github.io/autolink/index.html) ตรงๆ → ใช้ค่าที่บันทึกไว้ ไม่ต้องกรอก

คนอื่นที่มีแค่ลิงก์ (ไม่เคยเปิดจาก ESP / ไม่มี deploy-config) → **สั่งไม่ได้**

## Skin / ธีม (12 แบบ)

| Skin | จุดเด่น |
|------|---------|
| คลาสสิก · แถว 3 ปุ่ม · เปิดเต็มแถว | ธีมเดิม |
| Cyberpunk | Premium Industrial · โลหะ+แก้ว · Neural Gate |
| Luxury | ทอง-ดำ · แนวตั้ง · shimmer |
| Sci-Fi | กริด 3 คอลัมน์ · hologram |
| Aviation | คอกพิต · เปิดเต็มแถว |
| Matrix | เขียว · ฝน code |
| Mechanical | อุตสาหกรรม · แถวปุ่ม |
| NASA | แดง-น้ำเงิน-ขาว |
| Gaming RGB | ขอบ RGB วน |
| Retro | CRT เขียว · 8-bit |

เลือกที่ ⚙ → พรีวิวทันทีเมื่อเปลี่ยน

## โหมดผู้ดูแล

`?setup=1` — แก้ Skin
