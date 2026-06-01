const AlWebhook = (function () {
  const DEBOUNCE_MS = 400;
  let lastFireMs = 0;
  let busy = false;
  /** @type {{ open: string, stop: string, close: string, lock: (pin: number) => string } | null} */
  let cachedUrls = null;

  function buildUrl(host, token, pin, value) {
    const v = value == null ? 1 : (value ? 1 : 0);
    return (
      'https://' +
      host +
      '/external/api/update?token=' +
      encodeURIComponent(token) +
      '&V' +
      pin +
      '=' +
      v
    );
  }

  function pinForAction(cfg, action) {
    const pins = cfg.pins;
    if (action === 'open') return pins.open;
    if (action === 'stop') return pins.stop;
    if (action === 'close') return pins.close;
    if (action === 'lock') return pins.lock;
    return null;
  }

  /** สร้าง URL webhook — lock ใช้ฟังก์ชันเพราะส่ง 0/1 */
  function rebuildCache() {
    const cfg = AlConfigStore.loadBlynk();
    if (!AlConfigStore.isReady(cfg)) {
      cachedUrls = null;
      return null;
    }
    const host = cfg.host;
    const token = cfg.token;
    cachedUrls = {
      open: buildUrl(host, token, cfg.pins.open, 1),
      stop: buildUrl(host, token, cfg.pins.stop, 1),
      close: buildUrl(host, token, cfg.pins.close, 1),
      lock: function (value) {
        return buildUrl(host, token, cfg.pins.lock, value);
      }
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
    const lockBtn = typeof AlSkinEngine !== 'undefined' ? AlSkinEngine.actionBtn('lock') : null;
    if (lockBtn) lockBtn.removeAttribute('data-al-webhook-url');
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
   * @param {'open'|'stop'|'close'|'lock'} action
   * @param {{ lockValue?: 0|1 }} [opts]
   * @returns {Promise<{ ok: boolean, error?: string }>}
   */
  async function trigger(action, opts) {
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

    let url;
    if (action === 'lock') {
      const lockVal = opts && opts.lockValue != null ? (opts.lockValue ? 1 : 0) : 1;
      const urls = getCachedUrls();
      url = (urls && urls.lock) ? urls.lock(lockVal) : buildUrl(cfg.host, cfg.token, pin, lockVal);
    } else {
      const urls = getCachedUrls();
      url = (urls && urls[action]) || buildUrl(cfg.host, cfg.token, pin, 1);
    }

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
