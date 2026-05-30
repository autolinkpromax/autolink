const AlApp = (function () {
  const ERROR_TH = {
    no_config: 'บันทึกการตั้งค่าก่อน',
    debounce: 'กรุณารอสักครู่',
    network: 'ส่งไม่สำเร็จ — ตรวจเครือข่าย',
    bad_action: 'คำสั่งไม่ถูกต้อง',
    bad_token: 'Token ต้องยาวอย่างน้อย 8 ตัวอักษร'
  };

  let setupCollapsed = false;

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
    const setup = $('alSetup');
    const toggle = $('alSetupToggle');
    const skinHost = $('alSkinHost');
    const clearBtn = $('alClearConfig');

    if (app) app.classList.toggle('al-ready', ready);

    const hint = $('alReadyHint');
    if (hint) {
      hint.textContent = ready ? 'พร้อมใช้งาน' : 'ตั้งค่าครั้งแรก (เก็บในเครื่องนี้)';
    }

    if (!ready) {
      setupCollapsed = false;
      if (setup) {
        setup.hidden = false;
        setup.classList.remove('al-setup--collapsed');
      }
      if (toggle) toggle.hidden = true;
      if (skinHost) skinHost.hidden = true;
      if (clearBtn) clearBtn.hidden = true;
      return;
    }

    if (toggle) toggle.hidden = false;
    if (clearBtn) clearBtn.hidden = false;
    if (skinHost) skinHost.hidden = false;

    if (setup) {
      if (setupCollapsed) {
        setup.classList.add('al-setup--collapsed');
        setup.hidden = false;
      } else {
        setup.classList.remove('al-setup--collapsed');
        setup.hidden = AlConfigStore.isSetupMode() ? false : true;
      }
    }

    if (toggle) {
      toggle.setAttribute('aria-expanded', setup && !setup.hidden && !setupCollapsed ? 'true' : 'false');
    }
  }

  function syncSetupForm() {
    const cfg = AlConfigStore.loadBlynk();
    const prefs = AlConfigStore.loadSkinPrefs();

    if ($('alHost')) $('alHost').value = cfg.host;
    if ($('alToken')) {
      $('alToken').value = cfg.token;
      $('alToken').placeholder = cfg.token ? '••••••••' : 'รหัสจาก Device บน blynk.cloud';
    }
    if ($('alVOpen')) $('alVOpen').value = String(cfg.pins.open);
    if ($('alVStop')) $('alVStop').value = String(cfg.pins.stop);
    if ($('alVClose')) $('alVClose').value = String(cfg.pins.close);

    const mask = $('alTokenMask');
    if (mask) {
      mask.textContent = cfg.token
        ? 'บันทึกในเครื่องนี้แล้ว ' + AlConfigStore.maskToken(cfg.token)
        : 'ยังไม่ได้บันทึกในเครื่องนี้';
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
      customOpt.textContent = 'กำหนดเอง (นำเข้า JSON)';
      sel.appendChild(customOpt);
      sel.value = prefs.activeId === 'custom' ? 'custom' : (prefs.activeId || 'classic');
    }
  }

  function setSetupOpen(open) {
    const panel = $('alSetup');
    const toggle = $('alSetupToggle');
    if (!panel) return;

    if (!isReady()) {
      panel.hidden = false;
      panel.classList.remove('al-setup--collapsed');
      setupCollapsed = false;
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      return;
    }

    setupCollapsed = !open;
    syncChrome();
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
    if (!isReady()) {
      syncChrome();
      return;
    }

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

    if (!AlConfigStore.saveBlynk(cfg)) {
      setSetupMsg('บันทึกไม่สำเร็จ', 'err');
      return;
    }

    const skinId = $('alSkinSelect') ? $('alSkinSelect').value : 'classic';
    const prefs = AlConfigStore.loadSkinPrefs();
    prefs.activeId = skinId;
    AlConfigStore.saveSkinPrefs(prefs);

    setSetupMsg('บันทึกแล้ว — กดปุ่มด้านล่างได้เลย', 'ok');
    AlWebhook.rebuildCache();
    setupCollapsed = true;
    syncChrome();
    remountSkin();
  }

  function onClearConfig() {
    if (!confirm('ลบ Token และ Webhook ที่เก็บในเครื่องนี้?')) return;
    AlConfigStore.clearBlynk();
    if ($('alToken')) $('alToken').value = '';
    setupCollapsed = false;
    setSetupMsg('ลบแล้ว', 'ok');
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
        if (data.skin && data.skin.customManifest) {
          const v = AlSkinsRegistry.validateManifest(data.skin.customManifest);
          if (v.ok) {
            const prefs = AlConfigStore.loadSkinPrefs();
            prefs.activeId = 'custom';
            prefs.customManifest = data.skin.customManifest;
            prefs.customCss = data.skin.customCss || '';
            AlConfigStore.saveSkinPrefs(prefs);
          }
        }
        syncSetupForm();
        AlWebhook.rebuildCache();
        setupCollapsed = AlConfigStore.isReady(AlConfigStore.loadBlynk());
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
        if (!isReady()) return;
        setSetupOpen(setupCollapsed);
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
          setSetupMsg(res.ok ? 'ทดสอบส่งเปิดแล้ว' : (ERROR_TH[res.error] || 'ล้มเหลว'), res.ok ? 'ok' : 'err');
        });
      });
    }

    const exp = $('alExportConfig');
    if (exp) exp.addEventListener('click', onExport);

    const imp = $('alImportConfig');
    if (imp) {
      imp.addEventListener('change', function () {
        if (imp.files && imp.files[0]) onImport(imp.files[0]);
        imp.value = '';
      });
    }

    const clr = $('alClearConfig');
    if (clr) clr.addEventListener('click', onClearConfig);
  }

  function init() {
    AlConfigStore.bootstrap();
    bindUi();
    syncSetupForm();
    AlWebhook.rebuildCache();
    if (isReady()) setupCollapsed = true;
    syncChrome();
    remountSkin();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    handleAction,
    remountSkin,
    setSetupOpen,
    syncChrome
  };
})();
