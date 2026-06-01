/**
 * คัดลอกเป็น deploy-config.js แล้วใส่ Token ก่อนอัปโหลด GitHub Pages
 * (Token ใน repo สาธารณะ = ใครก็สั่งประตูได้ — ใช้ repo ส่วนตัวหรือพึ่ง deep link จาก ESP)
 */
window.AL_DEPLOY_CONFIG = {
  host: 'sgp1.blynk.cloud',
  token: '',
  pins: { open: 0, stop: 1, close: 2, lock: 3 }
};
