const AlWebhook = (function () {
  const DEBOUNCE_MS = 400;
  let lastFireMs = 0;
  let busy = false;
  /** @type {{ open: string, stop: string, close: string } | null} */
  let cachedUrls = null;

  function buildUrl(host, token, pin) {
    return (
      'https://' +
      host +
      '/external/api/update?token=' +
      encodeURIComponent(token) +
      '&V' +
      pin +
      '=1'
    );
  }

  function pinForAction(cfg, action) {
    const pins = cfg.pins;
    if (action === 'open') return pins.open;
    if (action === 'stop') return pins.stop;
    if (action === 'close') return pins.close;
    return null;
  }

  /** สร้าง URL webhook ทั้ง 3 ปุ่ม — เรียกหลัง bootstrap */
  function rebuildCache() {
    const cfg = AlConfigStore.loadBlynk();
    if (!AlConfigStore.isReady(cfg)) {
      cachedUrls = null;
      return null;
    }
    cachedUrls = {
      open: buildUrl(cfg.host, cfg.token, cfg.pins.open),
      stop: buildUrl(cfg.host, cfg.token, cfg.pins.stop),
      close: buildUrl(cfg.host, cfg.token, cfg.pins.close)
    };
    return cachedUrls;
  }

  function getCachedUrls() {
    if (!cachedUrls) rebuildCache();
    return cachedUrls;
  }

  function applyUrlsToButtons() {
    const urls = getCachedUrls();
    if (!urls) return;
    ['open', 'stop', 'close'].forEach(function (action) {
      const btn = typeof AlSkinEngine !== 'undefined' ? AlSkinEngine.actionBtn(action) : null;
      if (btn && urls[action]) btn.setAttribute('data-al-webhook-url', urls[action]);
    });
  }

  function fireGet(url) {
    return fetch(url, { mode: 'no-cors', cache: 'no-store', method: 'GET' }).catch(function () {
      return new Promise(function (resolve) {
        const img = new Image();
        img.onload = img.onerror = function () { resolve(); };
        img.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_t=' + Date.now();
      });
    });
  }

  /**
   * @param {'open'|'stop'|'close'} action
   * @returns {Promise<{ ok: boolean, error?: string }>}
   */
  async function trigger(action) {
    const now = Date.now();
    if (busy || now - lastFireMs < DEBOUNCE_MS) {
      return { ok: false, error: 'debounce' };
    }

    const cfg = AlConfigStore.loadBlynk();
    if (!AlConfigStore.isReady(cfg)) {
      return { ok: false, error: 'no_config' };
    }

    const pin = pinForAction(cfg, action);
    if (pin == null) return { ok: false, error: 'bad_action' };

    const urls = getCachedUrls();
    const url = (urls && urls[action]) || buildUrl(cfg.host, cfg.token, pin);
    busy = true;
    lastFireMs = now;

    try {
      await fireGet(url);
      return { ok: true };
    } catch (_) {
      return { ok: false, error: 'network' };
    } finally {
      busy = false;
    }
  }

  function isBusy() {
    return busy;
  }

  return {
    buildUrl,
    trigger,
    isBusy,
    pinForAction,
    rebuildCache,
    getCachedUrls,
    applyUrlsToButtons
  };
})();
