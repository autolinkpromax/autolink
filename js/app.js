const AlApp = (function () {
  const ERROR_TH = {
    no_config: 'ยังไม่ได้เชื่อมเครื่อง — เปิดจาก AutoDoor-RF2 ครั้งแรก',
    debounce: 'กรุณารอสักครู่',
    network: 'ส่งไม่สำเร็จ — ตรวจเครือข่าย',
    bad_action: 'คำสั่งไม่ถูกต้อง'
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

    if (app) {
      app.classList.toggle('al-ready', ready);
      app.classList.toggle('al-admin', admin);
    }

    const hint = $('alReadyHint');
    if (hint) {
      if (ready) {
        hint.textContent = 'พร้อมใช้งาน';
      } else {
        hint.textContent = 'รอเชื่อมจากเครื่อง';
      }
    }

    const pairing = $('alPairing');
    if (pairing) pairing.hidden = ready;

    const toggle = $('alSetupToggle');
    if (toggle) {
      toggle.hidden = !admin && ready;
    }

    const setup = $('alSetup');
    if (setup) {
      if (admin) {
        setup.hidden = false;
      } else {
        setup.hidden = true;
      }
    }

    const skinHost = $('alSkinHost');
    if (skinHost) skinHost.hidden = !ready;
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
        ? 'บันทึกแล้ว ' + AlConfigStore.maskToken(cfg.token)
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
      customOpt.textContent = 'กำหนดเอง (นำเข้า JSON)';
      sel.appendChild(customOpt);
      sel.value = prefs.activeId === 'custom' ? 'custom' : (prefs.activeId || 'classic');
    }
  }

  function setSetupOpen(open) {
    if (!AlConfigStore.isSetupMode()) return;
    const panel = $('alSetup');
    const toggle = $('alSetupToggle');
    if (!panel || !toggle) return;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
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
      AlGateController.setFeedback(ERROR_TH.no_config, 'err');
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

  function onSetupSubmit(ev) {
    ev.preventDefault();
    const cfg = {
      host: $('alHost') ? $('alHost').value : AlConfigStore.AL_DEFAULT_HOST,
      token: $('alToken') ? $('alToken').value.trim() : '',
      pins: {
        open: $('alVOpen') ? $('alVOpen').value : 0,
        stop: $('alVStop') ? $('alVStop').value : 1,
        close: $('alVClose') ? $('alVClose').value : 2
      }
    };

    if (!AlConfigStore.saveBlynk(cfg)) {
      setSetupMsg('บันทึกไม่สำเร็จ', 'err');
      return;
    }

    const skinId = $('alSkinSelect') ? $('alSkinSelect').value : 'classic';
    const prefs = AlConfigStore.loadSkinPrefs();
    prefs.activeId = skinId;
    AlConfigStore.saveSkinPrefs(prefs);

    setSetupMsg('บันทึกแล้ว', 'ok');
    AlWebhook.rebuildCache();
    syncChrome();
    remountSkin();
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
        if (!AlConfigStore.isSetupMode()) return;
        const panel = $('alSetup');
        setSetupOpen(panel && panel.hidden);
      });
    }

    const testBtn = $('alTestWebhook');
    if (testBtn) {
      testBtn.addEventListener('click', function () {
        const cfg = AlConfigStore.normalizeBlynk({
          host: $('alHost') ? $('alHost').value : '',
          token: $('alToken') ? $('alToken').value.trim() : '',
          pins: {
            open: $('alVOpen') ? $('alVOpen').value : 0,
            stop: $('alVStop') ? $('alVStop').value : 1,
            close: $('alVClose') ? $('alVClose').value : 2
          }
        });
        if (!AlConfigStore.isReady(cfg)) {
          setSetupMsg('ใส่ Token ก่อน', 'err');
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
  }

  function init() {
    AlConfigStore.bootstrap();
    bindUi();
    syncSetupForm();
    AlWebhook.rebuildCache();
    syncChrome();
    if (AlConfigStore.isSetupMode()) {
      setSetupOpen(true);
    }
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
