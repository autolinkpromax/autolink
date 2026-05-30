const AL_SKIN_CLASSIC = {
  schema: 1,
  id: 'classic',
  name: 'คลาสสิก',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'สถานะปัจจุบัน' },
    actions: {
      placement: { mode: 'stack' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'เปิดประตู', iconLead: '🚪', iconTrail: '›', variant: 'open' },
        stop: { label: 'หยุด', iconLead: '✋', iconTrail: '⚠', variant: 'stop' },
        close: { label: 'ปิดประตู', iconLead: '🚪', iconTrail: '›', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': 'linear-gradient(180deg,#4d8ee8,#3a6fc9)',
    '--al-act-stop-bg': 'linear-gradient(180deg,#d94a58,#b83240)',
    '--al-act-close-bg': 'linear-gradient(180deg,#64748b,#475569)'
  }
};

const AL_SKIN_ROW3 = {
  schema: 1,
  id: 'row3',
  name: 'แถว 3 ปุ่ม',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'สถานะ' },
    actions: {
      placement: { mode: 'row' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'เปิด', iconLead: '🚪', variant: 'open' },
        stop: { label: 'หยุด', iconLead: '✋', variant: 'stop' },
        close: { label: 'ปิด', iconLead: '🚪', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-hero-max-width': '100%',
    '--al-act-open-bg': 'linear-gradient(180deg,#22c55e,#16a34a)',
    '--al-act-stop-bg': 'linear-gradient(180deg,#f59e0b,#d97706)',
    '--al-act-close-bg': 'linear-gradient(180deg,#64748b,#334155)'
  }
};

const AL_SKIN_MAGIC = {
  schema: 1,
  id: 'magic',
  name: 'เปิดเต็มแถว',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: false },
    actions: {
      placement: { mode: 'magic' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'เปิดประตู', iconLead: '✨', iconTrail: '🚪', variant: 'open' },
        stop: { label: 'หยุด', iconLead: '✋', variant: 'stop' },
        close: { label: 'ปิดประตู', iconLead: '🚪', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    '--al-act-stop-bg': 'linear-gradient(180deg,#f43f5e,#e11d48)',
    '--al-act-close-bg': 'linear-gradient(180deg,#475569,#1e293b)',
    '--al-hero-bg': '#1a1033'
  }
};

const AlSkinsRegistry = (function () {
  const builtins = {
    classic: AL_SKIN_CLASSIC,
    row3: AL_SKIN_ROW3,
    magic: AL_SKIN_MAGIC
  };

  function list() {
    return Object.keys(builtins).map(function (id) {
      const m = builtins[id];
      return { id: m.id, name: m.name };
    });
  }

  function get(id) {
    return builtins[id] || builtins.classic;
  }

  function validateManifest(m) {
    if (!m || typeof m !== 'object') return { ok: false, error: 'invalid_manifest' };
    if (m.schema !== 1) return { ok: false, error: 'schema' };
    if (!m.id || !/^[a-z][a-z0-9_-]{0,31}$/.test(m.id)) return { ok: false, error: 'id' };
    if (!m.layout || !Array.isArray(m.layout.order)) return { ok: false, error: 'layout' };
    if (!m.regions || !m.regions.actions) return { ok: false, error: 'regions' };
    return { ok: true };
  }

  function resolveActive() {
    const prefs = AlConfigStore.loadSkinPrefs();
    if (prefs.activeId === 'custom' && prefs.customManifest) {
      const v = validateManifest(prefs.customManifest);
      if (v.ok) return prefs.customManifest;
    }
    return get(prefs.activeId) || AL_SKIN_CLASSIC;
  }

  return {
    list,
    get,
    validateManifest,
    resolveActive,
    builtins
  };
})();
