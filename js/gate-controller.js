const AlGateController = (function () {
  const GATE_ANIM_MS = 1600;
  let phase = 'closed';
  let systemLocked = false;
  let animTimer = null;

  function el() {
    return typeof AlSkinEngine !== 'undefined' ? AlSkinEngine.bind('gateVisual') : null;
  }

  function statusEl() {
    return typeof AlSkinEngine !== 'undefined' ? AlSkinEngine.bind('statusText') : null;
  }

  function feedbackEl() {
    return typeof AlSkinEngine !== 'undefined' ? AlSkinEngine.bind('feedback') : null;
  }

  function lockBtn() {
    return typeof AlSkinEngine !== 'undefined' ? AlSkinEngine.actionBtn('lock') : null;
  }

  function setPhase(next) {
    phase = next;
    const gate = el();
    if (!gate) return;
    gate.classList.remove('open', 'closed', 'moving', 'stopped', 'opening', 'closing');
    gate.classList.add(next);
    if (next === 'opening' || next === 'closing') {
      gate.classList.add('moving');
    }
  }

  function setStatusText(text) {
    const s = statusEl();
    if (s) s.textContent = text;
  }

  function setFeedback(text, kind) {
    const f = feedbackEl();
    if (!f) return;
    f.textContent = text || '';
    f.classList.remove('ok', 'err');
    if (kind) f.classList.add(kind);
  }

  function applySystemLockUi() {
    const gate = el();
    if (gate) gate.classList.toggle('system-locked', systemLocked);
    document.body.classList.toggle('al-system-locked', systemLocked);

    const btn = lockBtn();
    if (!btn) return;
    btn.classList.toggle('is-active', systemLocked);
    btn.setAttribute('aria-pressed', systemLocked ? 'true' : 'false');
    const label = btn.querySelector('.al-act-btn__label');
    if (label) {
      const unlocked = btn.getAttribute('data-al-lock-label') || 'ล็อกระบบ';
      label.textContent = systemLocked ? 'ปลดล็อก' : unlocked;
    }
  }

  function clearAnimTimer() {
    if (animTimer) {
      clearTimeout(animTimer);
      animTimer = null;
    }
  }

  function afterMoving(targetPhase, statusLabel) {
    clearAnimTimer();
    animTimer = setTimeout(function () {
      animTimer = null;
      setPhase(targetPhase);
      setStatusText(statusLabel);
    }, GATE_ANIM_MS);
  }

  function onAction(action) {
    if (action === 'open') {
      setPhase('opening');
      setStatusText('กำลังเปิดประตู…');
      afterMoving('open', systemLocked ? 'ประตูเปิด (ระบบล็อก)' : 'ประตูเปิด');
      return;
    }
    if (action === 'close') {
      setPhase('closing');
      setStatusText('กำลังปิดประตู…');
      afterMoving('closed', systemLocked ? 'ประตูปิด (ระบบล็อก)' : 'ประตูปิด');
      return;
    }
    if (action === 'stop') {
      clearAnimTimer();
      setPhase('stopped');
      setStatusText(systemLocked ? 'หยุดแล้ว (ระบบล็อก)' : 'หยุดแล้ว');
      return;
    }
    if (action === 'lock') {
      systemLocked = !systemLocked;
      applySystemLockUi();
      setStatusText(systemLocked ? 'ระบบล็อก — รีโมท/แท็กปิด' : 'ระบบปลดล็อก');
      return;
    }
  }

  function revertLockToggle() {
    systemLocked = !systemLocked;
    applySystemLockUi();
    setStatusText(systemLocked ? 'ระบบล็อก — รีโมท/แท็กปิด' : 'ระบบปลดล็อก');
  }

  function init() {
    systemLocked = false;
    setPhase('closed');
    setStatusText('ประตูปิด');
    setFeedback('', null);
    applySystemLockUi();
  }

  function setButtonsDisabled(disabled) {
    ['open', 'stop', 'close', 'lock'].forEach(function (slot) {
      const btn = typeof AlSkinEngine !== 'undefined' ? AlSkinEngine.actionBtn(slot) : null;
      if (btn) btn.disabled = !!disabled;
    });
  }

  function getSystemLockValue() {
    return systemLocked ? 1 : 0;
  }

  function isSystemLocked() {
    return systemLocked;
  }

  function snapshot() {
    return {
      phase: phase,
      systemLocked: systemLocked,
      statusText: statusEl() ? statusEl().textContent : ''
    };
  }

  function restore(snap) {
    if (!snap) return;
    clearAnimTimer();
    systemLocked = !!snap.systemLocked;
    setPhase(snap.phase || 'closed');
    if (snap.statusText) setStatusText(snap.statusText);
    applySystemLockUi();
  }

  return {
    GATE_ANIM_MS,
    init,
    onAction,
    revertLockToggle,
    setFeedback,
    setButtonsDisabled,
    getSystemLockValue,
    isSystemLocked,
    getPhase: function () { return phase; },
    snapshot,
    restore
  };
})();
