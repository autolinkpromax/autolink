const AlApp = (function () {
  const ERROR_TH = {
    debounce: 'กรุณารอสักครู่',
    network: 'ส่งไม่สำเร็จ — ตรวจเครือข่าย',
    bad_action: 'คำสั่งไม่ถูกต้อง'
  };

  let setupOpen = false;
  let savedSkinId = 'classic';

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

  function setConnectMsg(text, kind) {
    const el = $('alConnectMsg');
    if (!el) return;
    el.textContent = text || '';
    el.classList.remove('ok', 'err');
    if (kind) el.classList.add(kind);
  }

  function isReady() {
    return AlConfigStore.isConfigured();
  }

  function currentSavedSkinId() {
    const prefs = AlConfigStore.loadSkinPrefs();
    return prefs.activeId || 'classic';
  }

  function setSetupPanelOpen(open) {
    setupOpen = !!open;
    const setup = $('alSetup');
    const toggle = $('alSetupToggle');
    const app = $('alApp');
    if (setup) setup.hidden = !setupOpen;
    if (toggle) toggle.setAttribute('aria-expanded', setupOpen ? 'true' : 'false');
    if (app) app.classList.toggle('al-setup-open', setupOpen);
  }

  function goHome() {
    setSetupMsg('', null);
    setSetupPanelOpen(false);
    syncChrome();
    remountSkin();
  }

  function syncChrome() {
    const app = $('alApp');
    const ready = isReady();

    if (app) app.classList.toggle('al-ready', ready);

    const hint = $('alReadyHint');
    if (hint) {
      if (ready) {
        if (lastOnlineState !== null) {
          const statusStr = lastOnlineState ? 'Online' : 'Offline';
          const badgeClass = lastOnlineState ? 'is-online' : 'is-offline';
          hint.innerHTML = 'พร้อมใช้งาน <span class="al-online-badge ' + badgeClass + '"><span class="al-online-dot"></span>' + statusStr + '</span>';
        } else {
          hint.textContent = 'พร้อมใช้งาน';
        }
      } else {
        hint.textContent = 'กำลังโหลด…';
      }
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
      if (app) app.classList.remove('al-setup-open');
    }

    const skinHost = $('alSkinHost');
    if (skinHost) skinHost.hidden = !ready;

    // Sync device selector
    const selWrap = $('alDeviceSelectorWrap');
    const devSelect = $('alDeviceSelect');
    if (selWrap && devSelect) {
      const devList = AlConfigStore.listDevices();
      if (ready && devList.length > 0) {
        selWrap.hidden = false;
        devSelect.innerHTML = '';
        devList.forEach(function (d) {
          const opt = document.createElement('option');
          opt.value = d.id;
          opt.textContent = d.name;
          opt.selected = d.id === AlConfigStore.getActiveDeviceId();
          opt.style.color = '#000000';
          opt.style.backgroundColor = '#ffffff';
          devSelect.appendChild(opt);
        });
      } else {
        selWrap.hidden = true;
      }
    }
  }


  function syncSkinSelect(value) {
    const sel = $('alSkinSelect');
    if (!sel) return;

    const id = value != null ? value : currentSavedSkinId();
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
    sel.value = id;
  }

  function remountSkinPreview(skinId) {
    if (!isReady()) return;
    const snap = AlGateController.snapshot();
    const manifest = AlSkinsRegistry.resolveById(skinId);
    AlSkinEngine.mount(manifest);
    AlGateController.restore(snap);
    AlWebhook.applyUrlsToButtons();
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

    const lockOpts = action === 'lock' ? { lockValue: AlGateController.getSystemLockValue() } : undefined;
    const res = await AlWebhook.trigger(action, lockOpts);
    AlGateController.setButtonsDisabled(false);

    if (!res.ok && action === 'lock') {
      AlGateController.revertLockToggle();
    }

    if (res.ok) {
      const labels = {
        open: 'ส่งคำสั่งเปิดแล้ว',
        stop: 'ส่งคำสั่งหยุดแล้ว',
        close: 'ส่งคำสั่งปิดแล้ว',
        lock: AlGateController.isSystemLocked() ? 'ล็อกระบบแล้ว' : 'ปลดล็อกระบบแล้ว'
      };
      AlGateController.setFeedback(labels[action] || 'ส่งแล้ว', 'ok');
      setTimeout(fetchBlynkStateOnce, 1200);
    } else {
      AlGateController.setFeedback(ERROR_TH[res.error] || 'ส่งไม่สำเร็จ', 'err');
    }
  }

  function openSetupPanel() {
    savedSkinId = currentSavedSkinId();
    syncSkinSelect(savedSkinId);
    setSetupPanelOpen(true);
    syncChrome();
  }

  function onSetupCancel() {
    syncSkinSelect(savedSkinId);
    remountSkinPreview(savedSkinId);
    goHome();
  }

  function onSetupSubmit(ev) {
    ev.preventDefault();
    const skinId = $('alSkinSelect') ? $('alSkinSelect').value : 'classic';
    const prefs = AlConfigStore.loadSkinPrefs();
    prefs.activeId = skinId;
    AlConfigStore.saveSkinPrefs(prefs);
    savedSkinId = skinId;
    goHome();
  }

  function onSkinSelectChange() {
    const sel = $('alSkinSelect');
    if (!sel || !setupOpen) return;
    remountSkinPreview(sel.value);
  }

  function onConnectSubmit(ev) {
    ev.preventDefault();
    const tokenEl = $('alConnectToken');
    const hostEl = $('alConnectHost');
    const token = tokenEl ? String(tokenEl.value || '').trim() : '';
    const host = hostEl ? String(hostEl.value || '').trim() : '';
    if (token.length < 8) {
      setConnectMsg('Token สั้นเกินไป — ตรวจจาก blynk.cloud', 'err');
      return;
    }
    const cfg = AlConfigStore.loadBlynk();
    cfg.token = token;
    if (host) cfg.host = host;
    AlConfigStore.saveBlynk(cfg);
    setConnectMsg('เชื่อมต่อแล้ว — กำลังโหลด…', 'ok');
    onConfigReady();
  }

  function bindUi() {
    const connectForm = $('alConnectForm');
    if (connectForm) connectForm.addEventListener('submit', onConnectSubmit);

    const form = $('alSetupForm');
    if (form) form.addEventListener('submit', onSetupSubmit);

    const cancel = $('alSetupCancel');
    if (cancel) cancel.addEventListener('click', onSetupCancel);

    const sel = $('alSkinSelect');
    if (sel) sel.addEventListener('change', onSkinSelectChange);

    const toggle = $('alSetupToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        if (!isReady()) return;
        if (setupOpen) {
          onSetupCancel();
        } else {
          openSetupPanel();
        }
      });
    }

    const devSelect = $('alDeviceSelect');
    if (devSelect) {
      devSelect.addEventListener('change', function () {
        AlConfigStore.setActiveDeviceId(devSelect.value);
        onConfigReady();
      });
    }

    const hint = $('alReadyHint');
    if (hint) {
      hint.style.cursor = 'pointer';
      hint.title = 'กดเพื่ออัปเดตสถานะ';
      hint.addEventListener('click', function() {
        if (isReady()) {
          fetchBlynkStateOnce();
        }
      });
    }

    const delBtn = $('alDeleteDevice');
    if (delBtn) {
      delBtn.addEventListener('click', function () {
        const activeId = AlConfigStore.getActiveDeviceId();
        const activeDev = AlConfigStore.getActiveDevice();
        if (!activeDev) return;
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์ "' + activeDev.name + '" ออกจากหน้านี้?')) {
          const name = activeDev.name;
          AlConfigStore.deleteDevice(activeId);
          alert('ลบอุปกรณ์ "' + name + '" เรียบร้อยแล้ว');
          onConfigReady();
          goHome();
        }
      });
    }
  }

  let lastOnlineState = null;
  let isFetchingState = false;

  function updateOnlineStatus(isOnline) {
    lastOnlineState = isOnline;
    const statusLabel = typeof AlSkinEngine !== 'undefined' ? AlSkinEngine.bind('statusLabel') : null;
    if (statusLabel) {
      const baseText = statusLabel.getAttribute('data-base-label') || 'สถานะปัจจุบัน';
      const statusStr = isOnline ? 'Online' : 'Offline';
      const badgeClass = isOnline ? 'is-online' : 'is-offline';
      statusLabel.innerHTML = baseText + ' <span class="al-online-badge ' + badgeClass + '"><span class="al-online-dot"></span>' + statusStr + '</span>';
    }

    const hint = $('alReadyHint');
    if (hint && isReady()) {
      const statusStr = isOnline ? 'Online' : 'Offline';
      const badgeClass = isOnline ? 'is-online' : 'is-offline';
      hint.innerHTML = 'พร้อมใช้งาน <span class="al-online-badge ' + badgeClass + '"><span class="al-online-dot"></span>' + statusStr + '</span>';
    }
  }

  function getBlynkConfigFromUrls() {
    const blynkCfg = AlConfigStore.loadBlynk();
    if (AlConfigStore.isBlynkReady(blynkCfg)) {
      return { host: blynkCfg.host, token: blynkCfg.token };
    }
    
    const wh = AlConfigStore.loadWebhook();
    if (AlConfigStore.isWebhookReady(wh)) {
      const url = wh.hooks.open || '';
      if (url.includes('blynk.cloud')) {
        try {
          const u = new URL(url);
          const token = u.searchParams.get('token');
          if (token) {
            return { host: u.hostname, token: token };
          }
        } catch (_) {}
      }
    }
    return null;
  }

  async function fetchBlynkStateOnce() {
    if (isFetchingState) return;

    const blynk = getBlynkConfigFromUrls();
    if (!blynk) return;

    isFetchingState = true;

    try {
      const v4Url = 'https://' + blynk.host + '/external/api/get?token=' + encodeURIComponent(blynk.token) + '&V4';
      const onlineUrl = 'https://' + blynk.host + '/external/api/isHardwareConnected?token=' + encodeURIComponent(blynk.token);

      const [resOnline, resV4] = await Promise.all([
        fetch(onlineUrl).catch(function() { return null; }),
        fetch(v4Url).catch(function() { return null; })
      ]);

      if (resOnline && resOnline.ok) {
        const text = (await resOnline.text()).trim().toLowerCase();
        updateOnlineStatus(text === 'true');
      }

      if (resV4 && resV4.ok) {
        let rawState = (await resV4.text()).trim();
        rawState = rawState.replace(/^\[?"?|"\]?$/g, '').trim();

        if (rawState) {
          let phase = 'closed';
          if (rawState.includes('กำลังเปิด') || rawState.includes('opening')) {
            phase = 'opening';
          } else if (rawState.includes('กำลังปิด') || rawState.includes('closing')) {
            phase = 'closing';
          } else if (rawState.includes('เปิด') || rawState === 'open') {
            phase = 'open';
          } else if (rawState.includes('ปิด') || rawState === 'closed') {
            phase = 'closed';
          } else if (rawState.includes('หยุด') || rawState === 'stopped') {
            phase = 'stopped';
          }

          let displayStatus = rawState;
          if (AlGateController.isSystemLocked() && !displayStatus.includes('ระบบล็อก')) {
            displayStatus += ' (ระบบล็อก)';
          }

          AlGateController.restore({
            phase: phase,
            systemLocked: AlGateController.isSystemLocked(),
            statusText: displayStatus
          });
        }
      } else if (resV4 && !resV4.ok && resV4.status !== 0) {
        updateOnlineStatus(false);
      }
    } catch (_) {
      updateOnlineStatus(false);
    } finally {
      isFetchingState = false;
    }
  }

  function onConfigReady() {
    AlWebhook.rebuildCache();
    savedSkinId = currentSavedSkinId();
    remountSkin();
    syncChrome();
    fetchBlynkStateOnce();
  }

  function init() {
    AlConfigStore.bootstrap();
    bindUi();
    syncSkinSelect();
    AlWebhook.rebuildCache();
    savedSkinId = currentSavedSkinId();
    remountSkin();
    if (AlConfigStore.isSetupMode()) {
      openSetupPanel();
    } else {
      syncChrome();
    }
    fetchBlynkStateOnce();
    window.addEventListener('autolink:config-ready', onConfigReady);
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { handleAction, remountSkin, syncChrome };
})();
