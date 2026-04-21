// Tweaks panel wiring: integrates with the host edit-mode protocol and the
// AplosSphere API.

(function () {
  const panel = document.getElementById('tweaks');
  const current = Object.assign({}, window.TWEAK_DEFAULTS || {}, {});
  // pull from the inline EDITMODE block
  const defaults = window.TWEAK_DEFAULTS || {
    speed: 1.0, density: 60, lineOpacity: 0.5, theme: 'dark', autoRotate: true,
  };
  Object.assign(current, defaults);

  // DOM
  const elSpeed = document.getElementById('t-speed');
  const elDensity = document.getElementById('t-density');
  const elLines = document.getElementById('t-lines');
  const elTheme = document.getElementById('t-theme');
  const elAuto = document.getElementById('t-auto');
  const vSpeed = document.getElementById('v-speed');
  const vDensity = document.getElementById('v-density');
  const vLines = document.getElementById('v-lines');

  function persist(edits) {
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    } catch (e) {}
  }

  function applySpeed(v, save) {
    current.speed = v;
    vSpeed.textContent = v.toFixed(1) + '×';
    window.AplosSphere.setSpeed(v);
    if (save) persist({ speed: v });
  }
  function applyDensity(v, save) {
    current.density = v;
    vDensity.textContent = v;
    window.AplosSphere.setCount(v);
    if (save) persist({ density: v });
  }
  function applyLines(v, save) {
    current.lineOpacity = v;
    vLines.textContent = Math.round(v * 100) + '%';
    window.AplosSphere.setLineOpacity(v);
    if (save) persist({ lineOpacity: v });
  }
  function applyTheme(v, save) {
    current.theme = v;
    window.AplosSphere.setTheme(v);
    [...elTheme.querySelectorAll('button')].forEach(b => {
      b.classList.toggle('on', b.dataset.v === v);
    });
    if (save) persist({ theme: v });
  }
  function applyAuto(v, save) {
    current.autoRotate = v;
    window.AplosSphere.setAutoRotate(v);
    [...elAuto.querySelectorAll('button')].forEach(b => {
      b.classList.toggle('on', b.dataset.v === (v ? 'on' : 'off'));
    });
    if (save) persist({ autoRotate: v });
  }

  elSpeed.addEventListener('input', e => applySpeed(parseFloat(e.target.value), true));
  elDensity.addEventListener('input', e => applyDensity(parseInt(e.target.value, 10), true));
  elLines.addEventListener('input', e => applyLines(parseInt(e.target.value, 10) / 100, true));
  elTheme.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    applyTheme(b.dataset.v, true);
  });
  elAuto.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    applyAuto(b.dataset.v === 'on', true);
  });

  // initial apply (no persist)
  elSpeed.value = defaults.speed;
  elDensity.value = defaults.density;
  elLines.value = Math.round(defaults.lineOpacity * 100);
  applySpeed(defaults.speed, false);
  applyDensity(defaults.density, false);
  applyLines(defaults.lineOpacity, false);
  applyTheme(defaults.theme, false);
  applyAuto(defaults.autoRotate, false);

  // Host edit-mode protocol — listener FIRST, then announce availability.
  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') panel.classList.add('on');
    else if (d.type === '__deactivate_edit_mode') panel.classList.remove('on');
  });
  try {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  } catch (e) {}
})();
