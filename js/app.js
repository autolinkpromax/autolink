const AlApp = (function () {
  const ERROR_TH = {
    no_config: 'ยังไม่พร้อม — เปิดจากเครื่อง AutoDoor-RF2',
    debounce: 'กรุณารอสักครู่',
    network: 'ส่งไม่สำเร็จ — ตรวจเครือข่าย',
    bad_action: 'คำสั่งไม่ถูกต้อง',
    bad_token: 'Token ต้องยาวอย่างน้อย 8 ตัวอักษร'
  };

  function $(id) {
    return document.getElementById(id);
  }

  function setSetupMsg(text, kind) {
    const el = $('alSetupMsg');
    if (!el) return;
    el.textContent = text || '';
    el.classList.remove('ok', 'err');
    if (kind) el.classList.add(kind);
  }

  function isReady() {
    return AlConfigStore.isReady(AlConfigStore.loadBlynk());
  }

  function syncChrome() {
    const app = $('alApp');
    const ready = isReady();
    const admin = AlConfigStore.isSetupMode();

    if (app) app.classList.toggle('al-ready', ready);

    const hint = $('alReadyHint');
    if (hint) {
      hint.textContent = ready ? 'พร้อมใช้งาน' : 'กำลังโหลด…';
    }

    const need = $('alNeedConfig');
    if (need) need.hidden = ready || admin;

    const setup = $('alSetup');
    if (setup) setup.hidden = !admin;

    const toggle = $('alSetupToggle');
    if (toggle) toggle.hidden = !ready && !admin;

    const skinHost = $('alSkinHost');
    if (skinHost) skinHost.hidden = !ready;

    const clearBtn = $('alClearConfig');
    if (clearBtn) clearBtn.hidden = !admin;
  }

  function syncSetupForm() {
    const cfg = AlConfigStore.loadBlynk();
    const prefs = AlConfigStore.loadSkinPrefs();

    if ($('alHost')) $('alHost').value = cfg.host;
    if ($('alToken')) $('alToken').value = cfg.token;
    if ($('alVOpen')) $('alVOpen').value = String(cfg.pins.open);
    if ($('alVStop')) $('alVStop').value = String(cfg.pins.stop);
    if ($('alVClose')) $('alVClose').value = String(cfg.pins.close);

    const mask = $('alTokenMask');
    if (mask) {
      mask.textContent = cfg.token
        ? AlConfigStore.maskToken(cfg.token)
        : '';
    }

    const sel = $('alSkinSelect');
    if (sel) {
      sel.innerHTML = '';
      AlSkinsRegistry.list().forEach(function (item) {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item.name;
        sel.appendChild(opt);
      });
      const customOpt = document.createElement('option');
      customOpt.value = 'custom';
      customOpt.textContent = 'กำหนดเอง';
      sel.appendChild(customOpt);
      sel.value = prefs.activeId === 'custom' ? 'custom' : (prefs.activeId || 'classic');
    }
  }

  function remountSkin() {
    if (!isReady()) return;
    const manifest = AlSkinsRegistry.resolveActive();
    AlSkinEngine.mount(manifest);
    AlGateController.init();
    AlWebhook.rebuildCache();
    AlWebhook.applyUrlsToButtons();
  }

  async function handleAction(action) {
    if (!isReady()) return;

    AlGateController.setButtonsDisabled(true);
    AlGateController.setFeedback('กำลังส่ง…', null);
    AlGateController.onAction(action);

    const res = await AlWebhook.trigger(action);
    AlGateController.setButtonsDisabled(false);

    if (res.ok) {
      const labels = { open: 'ส่งคำสั่งเปิดแล้ว', stop: 'ส่งคำสั่งหยุดแล้ว', close: 'ส่งคำสั่งปิดแล้ว' };
      AlGateController.setFeedback(labels[action] || 'ส่งแล้ว', 'ok');
    } else {
      AlGateController.setFeedback(ERROR_TH[res.error] || 'ส่งไม่สำเร็จ', 'err');
    }
  }

  function tokenFromForm() {
    const typed = $('alToken') ? $('alToken').value.trim() : '';
    if (typed.length >= 8) return typed;
    if (!typed.length) return AlConfigStore.loadBlynk().token || '';
    return typed;
  }

  function onSetupSubmit(ev) {
    ev.preventDefault();
    const cfg = {
      host: $('alHost') ? $('alHost').value : AlConfigStore.AL_DEFAULT_HOST,
      token: tokenFromForm(),
      pins: {
        open: $('alVOpen') ? $('alVOpen').value : 0,
        stop: $('alVStop') ? $('alVStop').value : 1,
        close: $('alVClose') ? $('alVClose').value : 2
      }
    };

    if (!AlConfigStore.isReady(cfg)) {
      setSetupMsg(ERROR_TH.bad_token, 'err');
      return;
    }

    AlConfigStore.saveBlynk(cfg);
    const skinId = $('alSkinSelect') ? $('alSkinSelect').value : 'classic';
    const prefs = AlConfigStore.loadSkinPrefs();
    prefs.activeId = skinId;
    AlConfigStore.saveSkinPrefs(prefs);

    setSetupMsg('บันทึกแล้ว', 'ok');
    AlWebhook.rebuildCache();
    syncChrome();
    remountSkin();
  }

  function onClearConfig() {
    if (!confirm('ลบการตั้งค่าในเครื่องนี้?')) return;
    AlConfigStore.clearBlynk();
    AlWebhook.rebuildCache();
    syncSetupForm();
    syncChrome();
  }

  function onExport() {
    const json = JSON.stringify(AlConfigStore.exportBundle(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'autolink-config.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setSetupMsg('ส่งออกแล้ว', 'ok');
  }

  function onImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(String(reader.result || ''));
        const res = AlConfigStore.importBundle(data);
        if (!res.ok) {
          setSetupMsg('ไฟล์ไม่ถูกต้อง', 'err');
          return;
        }
        syncSetupForm();
        AlWebhook.rebuildCache();
        syncChrome();
        remountSkin();
        setSetupMsg('นำเข้าแล้ว', 'ok');
      } catch (_) {
        setSetupMsg('อ่าน JSON ไม่ได้', 'err');
      }
    };
    reader.readAsText(file);
  }

  function bindUi() {
    const form = $('alSetupForm');
    if (form) form.addEventListener('submit', onSetupSubmit);

    const toggle = $('alSetupToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        window.location.search = '?setup=1';
        syncChrome();
        syncSetupForm();
      });
    }

    const testBtn = $('alTestWebhook');
    if (testBtn) {
      testBtn.addEventListener('click', function () {
        const cfg = AlConfigStore.normalizeBlynk({
          host: $('alHost') ? $('alHost').value : '',
          token: tokenFromForm(),
          pins: {
            open: $('alVOpen') ? $('alVOpen').value : 0,
            stop: $('alVStop') ? $('alVStop').value : 1,
            close: $('alVClose') ? $('alVClose').value : 2
          }
        });
        if (!AlConfigStore.isReady(cfg)) {
          setSetupMsg(ERROR_TH.bad_token, 'err');
          return;
        }
        AlConfigStore.saveBlynk(cfg);
        AlWebhook.rebuildCache();
        AlWebhook.trigger('open').then(function (res) {
          setSetupMsg(res.ok ? 'ทดสอบแล้ว' : (ERROR_TH[res.error] || 'ล้มเหลว'), res.ok ? 'ok' : 'err');
        });
      });
    }

    $('alExportConfig') && $('alExportConfig').addEventListener('click', onExport);
    const imp = $('alImportConfig');
    if (imp) {
      imp.addEventListener('change', function () {
        if (imp.files && imp.files[0]) onImport(imp.files[0]);
        imp.value = '';
      });
    }
    $('alClearConfig') && $('alClearConfig').addEventListener('click', onClearConfig);
  }

  function init() {
    AlConfigStore.bootstrap();
    bindUi();
    syncSetupForm();
    AlWebhook.rebuildCache();
    syncChrome();
    remountSkin();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { handleAction, remountSkin, syncChrome };
})();
