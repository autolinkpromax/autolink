/** @typedef {{ host: string, token: string, pins: { open: number, stop: number, close: number, lock: number } }} AlBlynkConfig */
/** @typedef {{ host: string, hooks: { open: string, stop: string, close: string, lockOn: string, lockOff: string } }} AlWebhookConfig */
/** @typedef {{ activeId: string, customManifest?: object, customCss?: string }} AlSkinPrefs */

const AL_BLYNK_KEY = 'autolink.blynk.v1';
const AL_WEBHOOK_KEY = 'autolink.webhook.v1';
const AL_SKIN_KEY = 'autolink.skin.v1';
const AL_DEFAULT_HOST = 'sgp1.blynk.cloud';
const AL_PUBLIC_PAGE = 'https://autolinkpromax.github.io/autolink';

const AlConfigStore = (function () {
  function defaultBlynk() {
    return {
      host: AL_DEFAULT_HOST,
      token: '',
      pins: { open: 0, stop: 1, close: 2, lock: 3 }
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
        close: clampPin(pins.close, d.pins.close),
        lock: clampPin(pins.lock, d.pins.lock)
      }
    };
  }

  function defaultWebhook() {
    return {
      host: '',
      hooks: { open: '', stop: '', close: '', lockOn: '', lockOff: '' }
    };
  }

  function normalizeWebhook(raw) {
    const d = defaultWebhook();
    const src = raw || {};
    const hooks = src.hooks || {};
    return {
      host: String(src.host || '').trim(),
      hooks: {
        open: String(hooks.open || '').trim(),
        stop: String(hooks.stop || '').trim(),
        close: String(hooks.close || '').trim(),
        lockOn: String(hooks.lockOn || '').trim(),
        lockOff: String(hooks.lockOff || '').trim()
      }
    };
  }

  function isWebhookReady(cfg) {
    const h = cfg && cfg.hooks;
    return !!(h && h.open && h.stop && h.close);
  }

  function isBlynkReady(cfg) {
    return !!(cfg && cfg.token && cfg.token.length >= 8 && cfg.host);
  }

  function isReady(cfg) {
    return isBlynkReady(cfg);
  }

  function isConfigured() {
    return isWebhookReady(loadWebhook()) || isBlynkReady(loadBlynk());
  }

  function activeMode() {
    if (isWebhookReady(loadWebhook())) return 'webhook';
    if (isBlynkReady(loadBlynk())) return 'blynk';
    return 'none';
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

  /** ล้าง query/hash — แถบที่อยู่เหลือแค่ /autolink/ */
  function scrubUrlClean() {
    try {
      const u = new URL(window.location.href);
      let path = u.pathname || '/autolink/';
      if (path.endsWith('/index.html')) {
        path = path.slice(0, -'/index.html'.length) + '/';
      } else if (!path.endsWith('/')) {
        path += '/';
      }
      window.history.replaceState({}, document.title, path);
    } catch (_) {
      window.history.replaceState({}, document.title, '/autolink/');
    }
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
    if (p.vLock != null) {
      cur.pins.lock = clampPin(p.vLock, cur.pins.lock);
      changed = true;
    }

    if (changed) saveBlynk(cur);

    if (p.skin) {
      const skin = loadSkinPrefs();
      skin.activeId = String(p.skin).trim() || skin.activeId;
      saveSkinPrefs(skin);
    }

    scrubUrlClean();
    return { merged: changed, hadToken: hadToken };
  }

  /** รับ config จากหน้า AutoDoor (postMessage) — ไม่ต้องใส่ใน URL */
  function ingestOpenerMessage(data) {
    if (!data || !data.type) return false;

    if (data.type === 'autolink-webhook') {
      const wh = normalizeWebhook(data);
      if (!isWebhookReady(wh)) return false;
      saveWebhook(wh);
      if (data.skin) {
        const skin = loadSkinPrefs();
        skin.activeId = String(data.skin).trim() || skin.activeId;
        saveSkinPrefs(skin);
      }
      scrubUrlClean();
      return true;
    }

    if (data.type !== 'autolink-blynk') return false;
    const cur = loadBlynk();
    if (data.host) cur.host = normalizeHost(data.host);
    if (data.token) cur.token = String(data.token).trim();
    const pins = data.pins || {};
    if (pins.open != null) cur.pins.open = clampPin(pins.open, cur.pins.open);
    if (pins.stop != null) cur.pins.stop = clampPin(pins.stop, cur.pins.stop);
    if (pins.close != null) cur.pins.close = clampPin(pins.close, cur.pins.close);
    if (pins.lock != null) cur.pins.lock = clampPin(pins.lock, cur.pins.lock);
    saveBlynk(cur);
    if (data.skin) {
      const skin = loadSkinPrefs();
      skin.activeId = String(data.skin).trim() || skin.activeId;
      saveSkinPrefs(skin);
    }
    scrubUrlClean();
    return isBlynkReady(cur);
  }

  function listenOpenerHandshake() {
    if (!window.opener) return;
    let readyFired = false;
    const onMsg = function (ev) {
      if (!ingestOpenerMessage(ev.data)) return;
      if (!readyFired && isConfigured()) {
        readyFired = true;
        window.dispatchEvent(new CustomEvent('autolink:config-ready'));
      }
    };
    window.addEventListener('message', onMsg);
    try {
      window.opener.postMessage({ type: 'autolink:need-token' }, '*');
    } catch (_) { /* ignore */ }
    setTimeout(function () {
      window.removeEventListener('message', onMsg);
      if (!readyFired && isConfigured()) {
        readyFired = true;
        window.dispatchEvent(new CustomEvent('autolink:config-ready'));
      }
    }, 15000);
  }

  function applyDeployConfig() {
    try {
      const d = window.AL_DEPLOY_CONFIG;
      if (!d || typeof d !== 'object') return false;
      const cfg = normalizeBlynk(d);
      if (!isReady(cfg)) return false;
      saveBlynk(cfg);
      if (d.skin) {
        const skin = loadSkinPrefs();
        skin.activeId = String(d.skin).trim() || skin.activeId;
        saveSkinPrefs(skin);
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function bootstrap() {
    let wh = loadWebhook();
    let cfg = loadBlynk();

    if (window.opener) {
      scrubUrlClean();
      listenOpenerHandshake();
    } else if (!isConfigured()) {
      ingestUrlParams();
      wh = loadWebhook();
      cfg = loadBlynk();
    } else {
      scrubUrlClean();
    }

    if (!isConfigured()) {
      applyDeployConfig();
      wh = loadWebhook();
      cfg = loadBlynk();
    }

    if (!isConfigured() && !window.opener) {
      listenOpenerHandshake();
    }

    if (!window.opener) {
      scrubUrlClean();
    }

    const mode = activeMode();
    return {
      ready: mode !== 'none',
      mode: mode,
      cfg: mode === 'webhook' ? wh : cfg,
      source: mode !== 'none' ? mode : 'missing'
    };
  }

  function loadBlynk() {
    return normalizeBlynk(loadJson(AL_BLYNK_KEY, defaultBlynk));
  }

  function loadWebhook() {
    return normalizeWebhook(loadJson(AL_WEBHOOK_KEY, defaultWebhook));
  }

  function saveWebhook(cfg) {
    return saveJson(AL_WEBHOOK_KEY, normalizeWebhook(cfg));
  }

  function clearWebhook() {
    try {
      localStorage.removeItem(AL_WEBHOOK_KEY);
      return true;
    } catch (_) {
      return false;
    }
  }

  function clearBlynk() {
    try {
      localStorage.removeItem(AL_BLYNK_KEY);
      return true;
    } catch (_) {
      return false;
    }
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

  function isSetupMode() {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get('setup') === '1' || p.get('admin') === '1';
    } catch (_) {
      return false;
    }
  }

  return {
    AL_DEFAULT_HOST,
    AL_PUBLIC_PAGE,
    loadBlynk,
    saveBlynk,
    loadWebhook,
    saveWebhook,
    loadSkinPrefs,
    saveSkinPrefs,
    isReady,
    isBlynkReady,
    isWebhookReady,
    isConfigured,
    activeMode,
    maskToken,
    ingestUrlParams,
    ingestOpenerMessage,
    bootstrap,
    applyDeployConfig,
    clearBlynk,
    clearWebhook,
    isSetupMode,
    exportBundle,
    importBundle,
    normalizeBlynk,
    normalizeWebhook
  };
})();
