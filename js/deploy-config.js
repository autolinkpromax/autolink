/**
 * ใส่ Token ก่อนอัปโหลด GitHub Pages — หน้าเว็บจะส่งค่าให้อัตโนมัติ ไม่ต้องกรอกฟอร์ม
 * (repo สาธารณะ = ใครเปิดหน้านี้ก็สั่งได้ — ใช้ repo ส่วนตัว หรือเปิดจาก ESP แทน)
 */
window.AL_DEPLOY_CONFIG = {
  host: 'sgp1.blynk.cloud',
  token: '',
  pins: { open: 0, stop: 1, close: 2 },
  skin: 'classic'
};
