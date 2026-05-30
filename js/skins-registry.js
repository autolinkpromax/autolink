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

const AL_SKIN_CYBERPUNK = {
  schema: 1,
  id: 'cyberpunk',
  name: 'Cyberpunk',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'NEURAL GATE' },
    actions: {
      placement: { mode: 'row' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'OPEN', iconLead: '▶', variant: 'open' },
        stop: { label: 'HALT', iconLead: '■', variant: 'stop' },
        close: { label: 'SHUT', iconLead: '◼', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': 'transparent',
    '--al-act-stop-bg': 'transparent',
    '--al-act-close-bg': 'transparent',
    '--al-act-open-color': '#f4f7ff',
    '--al-act-stop-color': '#f4f7ff',
    '--al-act-close-color': '#e8ecf4',
    '--al-hero-bg': '#12151e',
    '--al-line': 'rgba(255,255,255,0.12)',
    '--al-muted': 'rgba(180,198,220,0.85)'
  }
};

const AL_SKIN_LUXURY = {
  schema: 1,
  id: 'luxury',
  name: 'Luxury',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'Private Access' },
    actions: {
      placement: { mode: 'stack' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'เปิดประตู', iconLead: '◆', variant: 'open' },
        stop: { label: 'หยุด', iconLead: '◇', variant: 'stop' },
        close: { label: 'ปิดประตู', iconLead: '◆', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': 'linear-gradient(180deg,#c9a227,#8b6914)',
    '--al-act-stop-bg': 'linear-gradient(180deg,#5c4d3a,#3d3228)',
    '--al-act-close-bg': 'linear-gradient(180deg,#2a2520,#1a1612)',
    '--al-hero-bg': '#1f1a14',
    '--al-radius': '4px',
    '--al-radius-sm': '4px'
  }
};

const AL_SKIN_SCIFI = {
  schema: 1,
  id: 'scifi',
  name: 'Sci-Fi',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'HULL STATUS' },
    actions: {
      placement: {
        mode: 'grid',
        columns: '1fr 1fr 1fr'
      },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'OPEN', variant: 'open' },
        stop: { label: 'STOP', variant: 'stop' },
        close: { label: 'CLOSE', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': 'linear-gradient(180deg,#0ea5e9,#0369a1)',
    '--al-act-stop-bg': 'linear-gradient(180deg,#8b5cf6,#6d28d9)',
    '--al-act-close-bg': 'linear-gradient(180deg,#334155,#1e293b)',
    '--al-hero-bg': '#0f172a'
  }
};

const AL_SKIN_AVIATION = {
  schema: 1,
  id: 'aviation',
  name: 'Aviation',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'COCKPIT / BARRIER' },
    actions: {
      placement: { mode: 'magic' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'DEPLOY OPEN', iconLead: '✈', variant: 'open' },
        stop: { label: 'HOLD', iconLead: '⏸', variant: 'stop' },
        close: { label: 'SECURE', iconLead: '🔒', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': 'linear-gradient(180deg,#f59e0b,#b45309)',
    '--al-act-stop-bg': 'linear-gradient(180deg,#ef4444,#b91c1c)',
    '--al-act-close-bg': 'linear-gradient(180deg,#475569,#334155)',
    '--al-hero-bg': '#0f2744'
  }
};

const AL_SKIN_MATRIX = {
  schema: 1,
  id: 'matrix',
  name: 'Matrix',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: false },
    actions: {
      placement: { mode: 'stack' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'เปิด', iconLead: '>', variant: 'open' },
        stop: { label: 'หยุด', iconLead: '#', variant: 'stop' },
        close: { label: 'ปิด', iconLead: '<', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': 'rgba(0, 40, 0, 0.95)',
    '--al-act-stop-bg': 'rgba(0, 30, 0, 0.95)',
    '--al-act-close-bg': 'rgba(0, 20, 0, 0.95)',
    '--al-hero-bg': '#001100',
    '--al-muted': '#00cc33'
  }
};

const AL_SKIN_MECHANICAL = {
  schema: 1,
  id: 'mechanical',
  name: 'Mechanical',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'HYDRAULIC GATE' },
    actions: {
      placement: { mode: 'row' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'RAISE', iconLead: '⬆', variant: 'open' },
        stop: { label: 'LOCK', iconLead: '⏹', variant: 'stop' },
        close: { label: 'LOWER', iconLead: '⬇', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': 'linear-gradient(180deg,#ea580c,#c2410c)',
    '--al-act-stop-bg': 'linear-gradient(180deg,#eab308,#ca8a04)',
    '--al-act-close-bg': 'linear-gradient(180deg,#57534e,#44403c)',
    '--al-hero-bg': '#292524'
  }
};

const AL_SKIN_NASA = {
  schema: 1,
  id: 'nasa',
  name: 'NASA',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'MISSION STATUS' },
    actions: {
      placement: { mode: 'stack' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'GO / OPEN', variant: 'open' },
        stop: { label: 'ABORT', variant: 'stop' },
        close: { label: 'CLOSE', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': '#fc3d21',
    '--al-act-stop-bg': '#0b3d91',
    '--al-act-close-bg': '#64748b',
    '--al-hero-bg': '#1e293b',
    '--al-radius': '0',
    '--al-radius-sm': '0'
  }
};

const AL_SKIN_GAMING = {
  schema: 1,
  id: 'gaming',
  name: 'Gaming RGB',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'PLAYER 1' },
    actions: {
      placement: { mode: 'magic' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'เปิดประตู', iconLead: '🎮', variant: 'open' },
        stop: { label: 'หยุด', iconLead: '⏸', variant: 'stop' },
        close: { label: 'ปิด', iconLead: '🚪', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': 'linear-gradient(135deg,#7c3aed,#db2777)',
    '--al-act-stop-bg': 'linear-gradient(135deg,#2563eb,#06b6d4)',
    '--al-act-close-bg': 'linear-gradient(135deg,#374151,#111827)',
    '--al-hero-bg': '#18181b'
  }
};

const AL_SKIN_RETRO = {
  schema: 1,
  id: 'retro',
  name: 'Retro',
  layout: { mode: 'stack', order: ['hero', 'actions', 'feedback'] },
  regions: {
    hero: { type: 'gateBars', showStatusLabel: true, statusLabel: 'SYSTEM' },
    actions: {
      placement: { mode: 'row' },
      order: ['open', 'stop', 'close'],
      buttons: {
        open: { label: 'OPEN', iconLead: '[', iconTrail: ']', variant: 'open' },
        stop: { label: 'STOP', iconLead: '[', iconTrail: ']', variant: 'stop' },
        close: { label: 'CLOSE', iconLead: '[', iconTrail: ']', variant: 'close' }
      }
    },
    feedback: { visible: true }
  },
  tokens: {
    '--al-act-open-bg': '#0d260d',
    '--al-act-stop-bg': '#0d260d',
    '--al-act-close-bg': '#0d260d',
    '--al-act-open-color': '#33ff33',
    '--al-act-stop-color': '#33ff33',
    '--al-act-close-color': '#33ff33',
    '--al-hero-bg': '#0a1f0a',
    '--al-radius': '0',
    '--al-radius-sm': '0'
  }
};

const AlSkinsRegistry = (function () {
  const builtins = {
    classic: AL_SKIN_CLASSIC,
    row3: AL_SKIN_ROW3,
    magic: AL_SKIN_MAGIC,
    cyberpunk: AL_SKIN_CYBERPUNK,
    luxury: AL_SKIN_LUXURY,
    scifi: AL_SKIN_SCIFI,
    aviation: AL_SKIN_AVIATION,
    matrix: AL_SKIN_MATRIX,
    mechanical: AL_SKIN_MECHANICAL,
    nasa: AL_SKIN_NASA,
    gaming: AL_SKIN_GAMING,
    retro: AL_SKIN_RETRO
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
    return resolveById(AlConfigStore.loadSkinPrefs().activeId);
  }

  function resolveById(id) {
    if (id === 'custom') {
      const prefs = AlConfigStore.loadSkinPrefs();
      if (prefs.customManifest) {
        const v = validateManifest(prefs.customManifest);
        if (v.ok) return prefs.customManifest;
      }
      return AL_SKIN_CLASSIC;
    }
    return get(id) || AL_SKIN_CLASSIC;
  }

  return {
    list,
    get,
    validateManifest,
    resolveActive,
    resolveById,
    builtins
  };
})();
