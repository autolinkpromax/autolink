const AlGateController = (function () {
  const GATE_ANIM_MS = 1600;
  let phase = 'closed';
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

  function setPhase(next) {
    phase = next;
    const gate = el();
    if (!gate) return;
    gate.classList.remove('open', 'closed', 'moving', 'stopped');
    gate.classList.add(next);
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
      setPhase('moving');
      setStatusText('กำลังเปิดประตู…');
      afterMoving('open', 'ประตูเปิด');
      return;
    }
    if (action === 'close') {
      setPhase('moving');
      setStatusText('กำลังปิดประตู…');
      afterMoving('closed', 'ประตูปิด');
      return;
    }
    if (action === 'stop') {
      clearAnimTimer();
      setPhase('stopped');
      setStatusText('หยุดแล้ว');
      return;
    }
  }

  function init() {
    setPhase('closed');
    setStatusText('ประตูปิด');
    setFeedback('', null);
  }

  function setButtonsDisabled(disabled) {
    ['open', 'stop', 'close'].forEach(function (slot) {
      const btn = typeof AlSkinEngine !== 'undefined' ? AlSkinEngine.actionBtn(slot) : null;
      if (btn) btn.disabled = !!disabled;
    });
  }

  function snapshot() {
    return {
      phase: phase,
      statusText: statusEl() ? statusEl().textContent : ''
    };
  }

  function restore(snap) {
    if (!snap) return;
    clearAnimTimer();
    setPhase(snap.phase || 'closed');
    if (snap.statusText) setStatusText(snap.statusText);
  }

  return {
    GATE_ANIM_MS,
    init,
    onAction,
    setFeedback,
    setButtonsDisabled,
    getPhase: function () { return phase; },
    snapshot,
    restore
  };
})();
