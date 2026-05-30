const AlSkinEngine = (function () {
  let mountedId = '';
  let actionBound = false;

  function host() {
    return document.getElementById('alSkinHost');
  }

  function bind(name) {
    const h = host();
    if (!h) return null;
    return h.querySelector('[data-al-bind="' + name + '"]');
  }

  function actionBtn(slot) {
    return bind('action-' + slot);
  }

  function sanitizeCss(css) {
    if (!css || typeof css !== 'string') return '';
    let s = css.slice(0, 4096);
    s = s.replace(/@import\b/gi, '');
    s = s.replace(/expression\s*\(/gi, '');
    s = s.replace(/javascript\s*:/gi, '');
    return s;
  }

  function applyTokens(tokens) {
    const h = host();
    if (!h || !tokens) return;
    Object.keys(tokens).forEach(function (key) {
      h.style.setProperty(key, tokens[key]);
    });
  }

  function applyBodyTheme(themeId) {
    document.body.setAttribute('data-al-theme', themeId || 'classic');
  }

  function buildGateHero(region) {
    const wrap = document.createElement('div');
    wrap.className = 'al-region al-region--hero';

    if (region.showStatusLabel !== false) {
      const lbl = document.createElement('p');
      lbl.className = 'al-status-label';
      lbl.setAttribute('data-al-bind', 'statusLabel');
      lbl.textContent = region.statusLabel || 'สถานะปัจจุบัน';
      wrap.appendChild(lbl);
    }

    const gate = document.createElement('div');
    gate.className = 'gate-visual closed';
    gate.setAttribute('data-al-bind', 'gateVisual');
    gate.innerHTML =
      '<div class="gate-track"></div>' +
      '<div class="gate-pillar left"></div>' +
      '<div class="gate-pillar right"></div>' +
      '<div class="gate-frame">' +
      '<div class="gate-bars">' +
      '<span class="gate-led"></span>' +
      '<span class="gate-bar"></span><span class="gate-bar"></span><span class="gate-bar"></span>' +
      '<span class="gate-bar"></span><span class="gate-bar"></span><span class="gate-bar"></span>' +
      '</div></div>';

    wrap.appendChild(gate);

    const st = document.createElement('p');
    st.className = 'al-status-text';
    st.setAttribute('data-al-bind', 'statusText');
    st.textContent = '—';
    wrap.appendChild(st);

    return wrap;
  }

  function buildActions(region) {
    const wrap = document.createElement('div');
    wrap.className = 'al-region al-region--actions';

    const placement = region.placement || { mode: 'stack' };
    const mode = placement.mode === 'magic' ? 'magic' : (placement.mode || 'stack');

    const actionsHost = document.createElement('div');
    actionsHost.className = 'al-actions-host';
    actionsHost.id = 'alActionsHost';
    actionsHost.setAttribute('data-placement', mode);

    if (mode === 'grid' && placement.columns) {
      actionsHost.style.gridTemplateColumns = placement.columns;
    }

    const order = region.order || ['open', 'stop', 'close'];
    const buttons = region.buttons || {};

    order.forEach(function (slot) {
      const meta = buttons[slot];
      if (!meta) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'al-act-btn al-act-btn--' + (meta.variant || slot);
      btn.setAttribute('data-al-bind', 'action-' + slot);
      btn.setAttribute('data-al-action', slot);

      const slotPlacement = placement.slots && placement.slots[slot];
      if (mode === 'absolute' && slotPlacement) {
        if (slotPlacement.top != null) btn.style.top = slotPlacement.top;
        if (slotPlacement.left != null) btn.style.left = slotPlacement.left;
        if (slotPlacement.width != null) btn.style.width = slotPlacement.width;
        if (slotPlacement.height != null) btn.style.height = slotPlacement.height;
      }
      if (mode === 'grid' && slotPlacement) {
        if (slotPlacement.gridColumn) btn.style.gridColumn = slotPlacement.gridColumn;
        if (slotPlacement.gridRow) btn.style.gridRow = slotPlacement.gridRow;
      }

      if (meta.iconLead) {
        const lead = document.createElement('span');
        lead.className = 'al-act-btn__lead';
        lead.textContent = meta.iconLead;
        btn.appendChild(lead);
      }

      const label = document.createElement('span');
      label.className = 'al-act-btn__label';
      label.textContent = meta.label || slot;
      btn.appendChild(label);

      if (meta.iconTrail) {
        const trail = document.createElement('span');
        trail.className = 'al-act-btn__trail';
        trail.textContent = meta.iconTrail;
        btn.appendChild(trail);
      }

      actionsHost.appendChild(btn);
    });

    wrap.appendChild(actionsHost);
    return wrap;
  }

  function buildFeedback() {
    const wrap = document.createElement('div');
    wrap.className = 'al-region al-region--feedback';
    const p = document.createElement('p');
    p.className = 'al-feedback';
    p.setAttribute('data-al-bind', 'feedback');
    wrap.appendChild(p);
    return wrap;
  }

  function mount(manifest) {
    const h = host();
    if (!h || !manifest) return;

    h.innerHTML = '';
    h.setAttribute('data-al-skin-active', manifest.id || 'classic');
    applyBodyTheme(manifest.id);
    applyTokens(manifest.tokens);

    let extraCss = '';
    if (manifest.assets && manifest.assets.cssInline) {
      extraCss += sanitizeCss(manifest.assets.cssInline);
    }
    const prefs = AlConfigStore.loadSkinPrefs();
    if (prefs.customCss) {
      extraCss += sanitizeCss(prefs.customCss);
    }
    let styleEl = document.getElementById('alCustomSkinCss');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'alCustomSkinCss';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = extraCss;

    const layout = document.createElement('div');
    layout.className = manifest.layout.mode === 'grid' ? 'al-layout-grid' : 'al-layout-stack';

    if (manifest.layout.mode === 'grid' && manifest.layout.grid) {
      const g = manifest.layout.grid;
      if (g.columns) layout.style.gridTemplateColumns = g.columns;
      if (g.rows) layout.style.gridTemplateRows = g.rows;
      if (g.areas) layout.style.gridTemplateAreas = g.areas;
    }

    const order = manifest.layout.order || ['hero', 'actions', 'feedback'];
    const regions = manifest.regions || {};

    order.forEach(function (key) {
      let node = null;
      if (key === 'hero' && regions.hero) {
        if (regions.hero.type === 'gateBars' || regions.hero.type === 'gateCss') {
          node = buildGateHero(regions.hero);
        }
      } else if (key === 'actions' && regions.actions) {
        node = buildActions(regions.actions);
      } else if (key === 'feedback') {
        if (regions.feedback && regions.feedback.visible === false) return;
        node = buildFeedback();
      }
      if (node) layout.appendChild(node);
    });

    h.appendChild(layout);
    mountedId = manifest.id;

    if (!actionBound) {
      h.addEventListener('click', onHostClick);
      actionBound = true;
    }
  }

  function onHostClick(ev) {
    const btn = ev.target.closest('[data-al-action]');
    if (!btn || btn.disabled) return;
    const action = btn.getAttribute('data-al-action');
    if (!action) return;
    if (typeof AlApp !== 'undefined' && AlApp.handleAction) {
      AlApp.handleAction(action);
    }
  }

  return {
    host,
    bind,
    actionBtn,
    mount,
    getMountedId: function () { return mountedId; }
  };
})();
