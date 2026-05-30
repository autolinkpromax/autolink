# AutoLink — ควบคุมประตูผ่าน Blynk Webhook

หน้าเว็บสำหรับกด **เปิด · หยุด · ปิด** ผ่าน Blynk Cloud

โฮสต์: [https://autolinkpromax.github.io/autolink/index.html](https://autolinkpromax.github.io/autolink/index.html)

## วิธีใช้

1. **ครั้งแรกบนเครื่องนี้:** เปิดลิงก์ → กรอกโฮสต์ Blynk, Auth Token, V pin → **บันทึก** (เก็บใน localStorage ของเบราว์เซอร์นี้เท่านั้น)
2. **ครั้งถัดไป:** เปิดลิงก์เดิม → เห็นแค่ปุ่มควบคุม + ประตู → กดสั่งได้ทันที

## ความปลอดภัย

- **ไม่มี Token ในลิงก์** และไม่อ่านค่าจาก URL — แชร์ลิงก์ให้คนอื่นเปิดได้ แต่**สั่งงานไม่ได้**เพราะไม่มี webhook ในเครื่องเขา
- Token อยู่แค่ใน localStorage ของเบราว์เซอร์ที่คุณบันทึก
- กด ⚙ เพื่อแก้ค่า · **ลบการตั้งค่าในเครื่อง** เมื่อต้องการล้าง

## Webhook (สร้างอัตโนมัติหลังบันทึก)

```
https://{host}/external/api/update?token={token}&V{pin}=1
```

ค่าเริ่มต้น: `sgp1.blynk.cloud` · V0 เปิด · V1 หยุด · V2 ปิด

## Deploy GitHub Pages

อัปโหลดทั้งโฟลเดอร์ `autolink` ขึ้น repo — **ไม่ต้อง**ใส่ Token ในไฟล์บน GitHub

## โหมดแอดมิน

`index.html?setup=1` — แสดงแผงตั้งค่าแม้บันทึกแล้ว
