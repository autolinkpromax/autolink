const AlApp = (function () {
  const ERROR_TH = {
    debounce: 'กรุณารอสักครู่',
    network: 'ส่งไม่สำเร็จ — ตรวจเครือข่าย',
    bad_action: 'คำสั่งไม่ถูกต้อง'
  };

  let setupOpen = false;

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

  function setSetupPanelOpen(open) {
    setupOpen = !!open;
    const setup = $('alSetup');
    const toggle = $('alSetupToggle');
    if (setup) setup.hidden = !setupOpen;
    if (toggle) toggle.setAttribute('aria-expanded', setupOpen ? 'true' : 'false');
  }

  function syncChrome() {
    const app = $('alApp');
    const ready = isReady();

    if (app) app.classList.toggle('al-ready', ready);

    const hint = $('alReadyHint');
    if (hint) {
      hint.textContent = ready ? 'พร้อมใช้งาน' : 'กำลังโหลด…';
    }

    const need = $('alNeedConfig');
    if (need) need.hidden = ready;

    const toggle = $('alSetupToggle');
    if (toggle) toggle.hidden = !ready;

    if (!ready) {
      setSetupPanelOpen(false);
    } else if (!setupOpen) {
      const setup = $('alSetup');
      if (setup) setup.hidden = true;
    }

    const skinHost = $('alSkinHost');
    if (skinHost) skinHost.hidden = !ready;
  }

  function syncSkinSelect() {
    const prefs = AlConfigStore.loadSkinPrefs();
    const sel = $('alSkinSelect');
    if (!sel) return;

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

  function onSetupSubmit(ev) {
    ev.preventDefault();
    const skinId = $('alSkinSelect') ? $('alSkinSelect').value : 'classic';
    const prefs = AlConfigStore.loadSkinPrefs();
    prefs.activeId = skinId;
    AlConfigStore.saveSkinPrefs(prefs);

    setSetupMsg('บันทึก Skin แล้ว', 'ok');
    setSetupPanelOpen(false);
    syncChrome();
    remountSkin();
  }

  function bindUi() {
    const form = $('alSetupForm');
    if (form) form.addEventListener('submit', onSetupSubmit);

    const toggle = $('alSetupToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        if (!isReady()) return;
        setSetupPanelOpen(!setupOpen);
        if (setupOpen) syncSkinSelect();
      });
    }
  }

  function init() {
    AlConfigStore.bootstrap();
    bindUi();
    syncSkinSelect();
    AlWebhook.rebuildCache();
    if (AlConfigStore.isSetupMode()) {
      setupOpen = true;
    }
    syncChrome();
    if (setupOpen) {
      setSetupPanelOpen(true);
      syncSkinSelect();
    }
    remountSkin();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { handleAction, remountSkin, syncChrome };
})();
