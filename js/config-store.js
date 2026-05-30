/** @typedef {{ host: string, token: string, pins: { open: number, stop: number, close: number } }} AlBlynkConfig */
/** @typedef {{ activeId: string, customManifest?: object, customCss?: string }} AlSkinPrefs */

const AL_BLYNK_KEY = 'autolink.blynk.v1';
const AL_SKIN_KEY = 'autolink.skin.v1';
const AL_DEFAULT_HOST = 'sgp1.blynk.cloud';

const AlConfigStore = (function () {
  function defaultBlynk() {
    return {
      host: AL_DEFAULT_HOST,
      token: '',
      pins: { open: 0, stop: 1, close: 2 }
    };
  }

  function defaultSkinPrefs() {
    return { activeId: 'classic', customManifest: null, customCss: '' };
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback();
      const o = JSON.parse(raw);
      return o && typeof o === 'object' ? o : fallback();
    } catch (_) {
      return fallback();
    }
  }

  function saveJson(key, obj) {
    try {
      localStorage.setItem(key, JSON.stringify(obj));
      return true;
    } catch (_) {
      return false;
    }
  }

  function normalizeHost(h) {
    let s = String(h || AL_DEFAULT_HOST).trim();
    s = s.replace(/^https?:\/\//i, '');
    s = s.replace(/\/+$/, '');
    return s || AL_DEFAULT_HOST;
  }

  function clampPin(v, fallback) {
    const n = parseInt(String(v), 10);
    if (!Number.isFinite(n) || n < 0 || n > 255) return fallback;
    return n;
  }

  function normalizeBlynk(raw) {
    const d = defaultBlynk();
    const src = raw || {};
    const pins = src.pins || {};
    return {
      host: normalizeHost(src.host),
      token: String(src.token || '').trim(),
      pins: {
        open: clampPin(pins.open, d.pins.open),
        stop: clampPin(pins.stop, d.pins.stop),
        close: clampPin(pins.close, d.pins.close)
      }
    };
  }

  function isReady(cfg) {
    return !!(cfg && cfg.token && cfg.token.length >= 8 && cfg.host);
  }

  function maskToken(token) {
    if (!token || token.length < 4) return '';
    return '…' + token.slice(-4);
  }

  function parseParams(search, hash) {
    const out = {};
    const tryParse = function (qs) {
      if (!qs) return;
      const s = qs.charAt(0) === '?' || qs.charAt(0) === '#' ? qs.slice(1) : qs;
      if (!s) return;
      const p = new URLSearchParams(s);
      p.forEach(function (v, k) {
        out[k] = v;
      });
    };
    tryParse(search);
    if (hash) tryParse(hash);
    return out;
  }

  function ingestUrlParams() {
    const p = parseParams(window.location.search, window.location.hash);
    if (!Object.keys(p).length) return { merged: false, hadToken: false };

    const cur = loadBlynk();
    let changed = false;
    let hadToken = false;

    if (p.host) {
      cur.host = normalizeHost(p.host);
      changed = true;
    }
    if (p.token) {
      cur.token = String(p.token).trim();
      hadToken = true;
      changed = true;
    }
    if (p.vOpen != null) {
      cur.pins.open = clampPin(p.vOpen, cur.pins.open);
      changed = true;
    }
    if (p.vStop != null) {
      cur.pins.stop = clampPin(p.vStop, cur.pins.stop);
      changed = true;
    }
    if (p.vClose != null) {
      cur.pins.close = clampPin(p.vClose, cur.pins.close);
      changed = true;
    }

    if (changed) saveBlynk(cur);

    if (p.skin) {
      const skin = loadSkinPrefs();
      skin.activeId = String(p.skin).trim() || skin.activeId;
      saveSkinPrefs(skin);
    }

    scrubUrlSensitive(hadToken);
    return { merged: changed, hadToken: hadToken };
  }

  function scrubUrlSensitive(hadToken) {
    try {
      const u = new URL(window.location.href);
      u.searchParams.delete('token');
      const hash = u.hash.replace(/^#/, '');
      if (hash) {
        const hp = new URLSearchParams(hash);
        hp.delete('token');
        const rest = hp.toString();
        u.hash = rest ? '#' + rest : '';
      }
      window.history.replaceState({}, document.title, u.pathname + u.search + u.hash);
    } catch (_) {
      if (hadToken) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }

  function loadBlynk() {
    return normalizeBlynk(loadJson(AL_BLYNK_KEY, defaultBlynk));
  }

  function saveBlynk(cfg) {
    return saveJson(AL_BLYNK_KEY, normalizeBlynk(cfg));
  }

  function loadSkinPrefs() {
    const d = defaultSkinPrefs();
    const o = loadJson(AL_SKIN_KEY, defaultSkinPrefs);
    return {
      activeId: typeof o.activeId === 'string' && o.activeId ? o.activeId : d.activeId,
      customManifest: o.customManifest || null,
      customCss: typeof o.customCss === 'string' ? o.customCss : ''
    };
  }

  function saveSkinPrefs(prefs) {
    const d = defaultSkinPrefs();
    return saveJson(AL_SKIN_KEY, {
      activeId: prefs.activeId || d.activeId,
      customManifest: prefs.customManifest || null,
      customCss: prefs.customCss || ''
    });
  }

  function exportBundle() {
    return {
      version: 1,
      blynk: loadBlynk(),
      skin: loadSkinPrefs()
    };
  }

  function importBundle(data) {
    if (!data || typeof data !== 'object') return { ok: false, error: 'invalid_json' };
    if (data.blynk) saveBlynk(data.blynk);
    if (data.skin) saveSkinPrefs(data.skin);
    return { ok: true };
  }

  return {
    AL_DEFAULT_HOST,
    loadBlynk,
    saveBlynk,
    loadSkinPrefs,
    saveSkinPrefs,
    isReady,
    maskToken,
    ingestUrlParams,
    exportBundle,
    importBundle,
    normalizeBlynk
  };
})();
