// Aplos Data — Operate as One sphere
// Fibonacci-distributed points on a sphere, rotated around Y (slight X tilt),
// projected to 2D with perspective. DOM nodes for crisp logo tiles,
// canvas overlay for connection lines + pulses.

(function () {
  'use strict';

  // ----- Catalog of placeholder SaaS systems (original monograms, not real brand marks) -----
  // Categories mapped to colors that harmonize with the brand palette.
  const CATS = {
    crm:     { label: 'CRM & Sales',       color: '#7fcaa5' },
    fin:     { label: 'Finance & ERP',     color: '#a8dcc2' },
    data:    { label: 'Data & Warehouse',  color: '#6bb894' },
    ops:     { label: 'Ops & Workflow',    color: '#4f9b7a' },
    mktg:    { label: 'Marketing',         color: '#c9ead9' },
    hr:      { label: 'HR & People',       color: '#8fd4b0' },
    comms:   { label: 'Comms & Support',   color: '#b5e1c9' },
    dev:     { label: 'Eng & DevOps',      color: '#5ea585' },
  };

  // Top SaaS products keyed to Simple Icons slugs (cdn.jsdelivr.net).
  // `s` is the slug on simpleicons.org. Logos load as SVG and are recolored black.
  const POOL = [
    // CRM & Sales
    { n: 'Salesforce',       s: 'salesforce',       c: 'crm'  },
    { n: 'HubSpot',          s: 'hubspot',          c: 'crm'  },
    { n: 'Pipedrive',        s: 'pipedrive',        c: 'crm'  },
    { n: 'Zoho',             s: 'zoho',             c: 'crm'  },
    { n: 'Intercom',         s: 'intercom',         c: 'crm'  },
    { n: 'Mailchimp',        s: 'mailchimp',        c: 'crm'  },
    // Finance & ERP
    { n: 'QuickBooks',       s: 'quickbooks',       c: 'fin'  },
    { n: 'Xero',             s: 'xero',             c: 'fin'  },
    { n: 'Stripe',           s: 'stripe',           c: 'fin'  },
    { n: 'PayPal',           s: 'paypal',           c: 'fin'  },
    { n: 'Square',           s: 'square',           c: 'fin'  },
    { n: 'SAP',              s: 'sap',              c: 'fin'  },
    { n: 'Oracle',           s: 'oracle',           c: 'fin'  },
    { n: 'NetSuite',         s: 'oracle',           c: 'fin'  },
    { n: 'Workday',          s: 'workday',          c: 'fin'  },
    { n: 'Expensify',        s: 'expensify',        c: 'fin'  },
    // Data & Warehouse
    { n: 'Snowflake',        s: 'snowflake',        c: 'data' },
    { n: 'Databricks',       s: 'databricks',       c: 'data' },
    { n: 'MongoDB',          s: 'mongodb',          c: 'data' },
    { n: 'PostgreSQL',       s: 'postgresql',       c: 'data' },
    { n: 'BigQuery',         s: 'googlebigquery',   c: 'data' },
    { n: 'Looker',           s: 'looker',           c: 'data' },
    { n: 'Tableau',          s: 'tableau',          c: 'data' },
    { n: 'Power BI',         s: 'powerbi',          c: 'data' },
    { n: 'Airtable',         s: 'airtable',         c: 'data' },
    { n: 'Segment',          s: 'segment',          c: 'data' },
    // Ops & Workflow
    { n: 'Asana',            s: 'asana',            c: 'ops'  },
    { n: 'Monday',           s: 'mondaydotcom',     c: 'ops'  },
    { n: 'Trello',           s: 'trello',           c: 'ops'  },
    { n: 'ClickUp',          s: 'clickup',          c: 'ops'  },
    { n: 'Notion',           s: 'notion',           c: 'ops'  },
    { n: 'Zapier',           s: 'zapier',           c: 'ops'  },
    { n: 'Smartsheet',       s: 'smartsheet',       c: 'ops'  },
    { n: 'Basecamp',         s: 'basecamp',         c: 'ops'  },
    // Marketing
    { n: 'Marketo',          s: 'adobe',            c: 'mktg' },
    { n: 'Klaviyo',          s: 'klaviyo',          c: 'mktg' },
    { n: 'SendGrid',         s: 'sendgrid',         c: 'mktg' },
    { n: 'Hootsuite',        s: 'hootsuite',        c: 'mktg' },
    { n: 'Canva',            s: 'canva',            c: 'mktg' },
    { n: 'Figma',            s: 'figma',            c: 'mktg' },
    { n: 'Webflow',          s: 'webflow',          c: 'mktg' },
    { n: 'WordPress',        s: 'wordpress',        c: 'mktg' },
    // HR & People
    { n: 'BambooHR',         s: 'bamboohr',         c: 'hr'   },
    { n: 'Gusto',            s: 'gusto',            c: 'hr'   },
    { n: 'ADP',              s: 'adp',              c: 'hr'   },
    { n: 'Greenhouse',       s: 'greenhouse',       c: 'hr'   },
    { n: 'Lever',            s: 'lever',            c: 'hr'   },
    { n: 'LinkedIn',         s: 'linkedin',         c: 'hr'   },
    // Comms & Support
    { n: 'Slack',            s: 'slack',            c: 'comms'},
    { n: 'Microsoft Teams',  s: 'microsoftteams',   c: 'comms'},
    { n: 'Zoom',             s: 'zoom',             c: 'comms'},
    { n: 'Gmail',            s: 'gmail',            c: 'comms'},
    { n: 'Outlook',          s: 'microsoftoutlook', c: 'comms'},
    { n: 'Zendesk',          s: 'zendesk',          c: 'comms'},
    { n: 'Freshdesk',        s: 'freshworks',       c: 'comms'},
    { n: 'Twilio',           s: 'twilio',           c: 'comms'},
    { n: 'Calendly',         s: 'calendly',         c: 'comms'},
    // Eng & DevOps
    { n: 'GitHub',           s: 'github',           c: 'dev'  },
    { n: 'GitLab',           s: 'gitlab',           c: 'dev'  },
    { n: 'Bitbucket',        s: 'bitbucket',        c: 'dev'  },
    { n: 'Jira',             s: 'jira',             c: 'dev'  },
    { n: 'Confluence',       s: 'confluence',       c: 'dev'  },
    { n: 'Jenkins',          s: 'jenkins',          c: 'dev'  },
    { n: 'Datadog',          s: 'datadog',          c: 'dev'  },
    { n: 'PagerDuty',        s: 'pagerduty',        c: 'dev'  },
    { n: 'New Relic',        s: 'newrelic',         c: 'dev'  },
    { n: 'Sentry',           s: 'sentry',           c: 'dev'  },
    { n: 'AWS',              s: 'amazonwebservices',c: 'dev'  },
    { n: 'Google Cloud',     s: 'googlecloud',      c: 'dev'  },
    { n: 'Azure',            s: 'microsoftazure',   c: 'dev'  },
    { n: 'Docker',           s: 'docker',           c: 'dev'  },
    { n: 'Kubernetes',       s: 'kubernetes',       c: 'dev'  },
    { n: 'Terraform',        s: 'terraform',        c: 'dev'  },
    { n: 'Cloudflare',       s: 'cloudflare',       c: 'dev'  },
    { n: 'Vercel',           s: 'vercel',           c: 'dev'  },
    { n: 'Netlify',          s: 'netlify',          c: 'dev'  },
    { n: 'Auth0',            s: 'auth0',            c: 'dev'  },
    { n: 'Okta',             s: 'okta',             c: 'dev'  },
    { n: 'Supabase',         s: 'supabase',         c: 'dev'  },
    { n: 'Elastic',          s: 'elasticsearch',    c: 'data' },
    { n: 'Redis',            s: 'redis',            c: 'data' },
    { n: 'Dropbox',          s: 'dropbox',          c: 'ops'  },
    { n: 'Box',              s: 'box',              c: 'ops'  },
    { n: 'Shopify',          s: 'shopify',          c: 'crm'  },
    { n: 'DocuSign',         s: 'docusign',         c: 'ops'  },
    { n: 'Asana',            s: 'asana',            c: 'ops'  },
  ];

  // Each tile has a white/tinted background; we give each category a subtle base tint.
  function tileBg(cat) {
    const map = {
      crm:   '#ffffff',
      fin:   '#f3faf6',
      data:  '#eef8f2',
      ops:   '#ffffff',
      mktg:  '#ffffff',
      hr:    '#f6fbf8',
      comms: '#ffffff',
      dev:   '#f0f6f3',
    };
    return map[cat] || '#ffffff';
  }

  // ---- 3D math helpers ----
  function rotY(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
  }
  function rotX(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
  }
  function fibSphere(n, radius) {
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      pts.push({
        x: Math.cos(theta) * r * radius,
        y: y * radius,
        z: Math.sin(theta) * r * radius,
      });
    }
    return pts;
  }

  // ---- State ----
  const state = {
    count: 60,
    speed: 1.0,
    lineOpacity: 0.5,
    autoRotate: true,
    rotY: 0,
    rotX: -0.22,
    targetRotX: -0.22,
    dragging: false,
    lastX: 0, lastY: 0,
    velY: 0.003, // auto-rotate velocity
    velX: 0,
    systems: [],   // {name, mark, cat, basePos, connections[]}
    active: null,  // index of clicked node
    pulses: [],    // active pulses {from, to, start, duration}
    hoverIdx: -1,
    lastT: performance.now(),
  };

  // ---- DOM refs ----
  const sphereEl = document.getElementById('sphere');
  const nodesEl = document.getElementById('nodes');
  const canvas = document.getElementById('lines');
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('tooltip');
  const legendEl = document.getElementById('legend');
  const statCount = document.getElementById('stat-count'); // may be null

  // ---- Build systems + nodes ----
  function buildSystems(n) {
    // sample pool (no duplicates until we exhaust it)
    const pool = POOL.slice();
    const chosen = [];
    for (let i = 0; i < n; i++) {
      if (pool.length === 0) break;
      const idx = Math.floor(Math.random() * pool.length);
      chosen.push(pool.splice(idx, 1)[0]);
    }
    const positions = fibSphere(chosen.length, 1); // unit sphere
    const systems = chosen.map((s, i) => ({
      name: s.n,
      slug: s.s,
      cat: s.c,
      basePos: positions[i],
      el: null,
    }));
    // For each system pick 2-3 "connections" (nearest neighbors) — these are the
    // lines drawn + paths pulses travel along. Computed once.
    for (let i = 0; i < systems.length; i++) {
      const a = systems[i].basePos;
      const ranked = [];
      for (let j = 0; j < systems.length; j++) {
        if (i === j) continue;
        const b = systems[j].basePos;
        const d2 = (a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2;
        ranked.push({ j, d2 });
      }
      ranked.sort((u, v) => u.d2 - v.d2);
      // 5–6 nearest neighbors → every logo visibly connects to the ones
      // around it, creating a true mesh rather than sparse spokes.
      const k = 5 + (i % 2);
      systems[i].connections = ranked.slice(0, k).map(r => r.j);
    }
    return systems;
  }

  function renderNodes() {
    nodesEl.innerHTML = '';
    state.systems.forEach((sys, i) => {
      const el = document.createElement('div');
      el.className = 'node';
      el.dataset.idx = i;
      const iconUrl = `https://cdn.jsdelivr.net/npm/simple-icons@11/icons/${sys.slug}.svg`;
      el.innerHTML = `
        <div class="node-inner" style="--tile-bg:${tileBg(sys.cat)};--cat-color:${CATS[sys.cat].color}">
          <img class="node-logo" src="${iconUrl}" alt="${sys.name}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
          <span class="node-mark" style="display:none">${(sys.name[0] || '?').toUpperCase()}</span>
        </div>`;
      // events
      el.addEventListener('mouseenter', () => {
        state.hoverIdx = i;
        showTooltip(i);
      });
      el.addEventListener('mouseleave', () => {
        state.hoverIdx = -1;
        hideTooltip();
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        activate(i);
      });
      nodesEl.appendChild(el);
      sys.el = el;
    });
  }

  function renderLegend() {
    const used = new Set(state.systems.map(s => s.cat));
    legendEl.innerHTML = '';
    Object.entries(CATS).forEach(([key, cat]) => {
      if (!used.has(key)) return;
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-dot" style="--c:${cat.color}"></span> ${cat.label}`;
      legendEl.appendChild(item);
    });
  }

  function showTooltip(i) {
    const sys = state.systems[i];
    tooltip.querySelector('.tooltip-name').textContent = sys.name;
    tooltip.querySelector('.tooltip-cat').textContent = CATS[sys.cat].label;
    tooltip.classList.add('show');
    positionTooltip(i);
  }
  function hideTooltip() { tooltip.classList.remove('show'); }
  function positionTooltip(i) {
    // position relative to sphere container
    const sys = state.systems[i];
    if (!sys.screen) return;
    const rect = sphereEl.getBoundingClientRect();
    const sectionRect = sphereEl.closest('.section').getBoundingClientRect();
    tooltip.style.left = (rect.left - sectionRect.left + sys.screen.x) + 'px';
    tooltip.style.top  = (rect.top  - sectionRect.top  + sys.screen.y) + 'px';
  }

  function activate(i) {
    state.active = (state.active === i) ? null : i;
    // reset classes
    state.systems.forEach(s => s.el && s.el.classList.remove('active'));
    state.pulses = [];
    if (state.active !== null) {
      state.systems[i].el.classList.add('active');
      // emit pulses along connections
      const now = performance.now();
      state.systems[i].connections.forEach((j, k) => {
        state.pulses.push({ from: i, to: j, start: now + k * 80, duration: 900, color: '#c9ead9' });
        // second-order (ripples)
        state.systems[j].connections.forEach((kj, kk) => {
          if (kj === i) return;
          state.pulses.push({ from: j, to: kj, start: now + 500 + kk * 80, duration: 1000, color: '#7fcaa5' });
        });
      });
    }
  }

  // ---- Sizing ----
  function resize() {
    const rect = sphereEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---- Render loop ----
  function tick(t) {
    const dt = Math.min(64, t - state.lastT);
    state.lastT = t;

    if (state.autoRotate && !state.dragging) {
      state.rotY += state.velY * state.speed * (dt / 16.67);
    } else if (!state.dragging) {
      // decelerate
      state.rotY += state.velY * (dt / 16.67);
      state.velY *= 0.96;
      state.velX *= 0.96;
      state.rotX += state.velX * (dt / 16.67);
    }
    // ease back to slight tilt when not interacting
    if (!state.dragging) {
      state.rotX += (state.targetRotX - state.rotX) * 0.02;
    }

    draw();
    requestAnimationFrame(tick);
  }

  function draw() {
    const rect = sphereEl.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.42; // sphere radius on screen
    const camDist = 2.6;             // perspective depth (units of R)

    // project every system
    const projected = state.systems.map((sys, i) => {
      let p = sys.basePos;
      p = rotY(p, state.rotY);
      p = rotX(p, state.rotX);
      const depth = (p.z + camDist) / (camDist + 1);   // 0..~1
      const persp = camDist / (camDist - p.z);          // >1 front, <1 back
      const sx = cx + p.x * R * persp;
      const sy = cy + p.y * R * persp;
      sys.screen = { x: sx, y: sy, z: p.z, persp, depth };
      return { i, sx, sy, z: p.z, persp };
    });

    // ---- lines ----
    ctx.clearRect(0, 0, W, H);
    const lineAlpha = state.lineOpacity;
    ctx.lineWidth = 1;
    for (let i = 0; i < state.systems.length; i++) {
      const a = projected[i];
      const conns = state.systems[i].connections;
      for (let k = 0; k < conns.length; k++) {
        const j = conns[k];
        if (j < i) continue; // avoid duplicate undirected edges
        const b = projected[j];
        // front-facing fade: average z, map to alpha
        const avgZ = (a.z + b.z) / 2;
        const depthAlpha = Math.max(0, (avgZ + 1) / 2); // 0 back .. 1 front
        // Sharper depth falloff so the back hemisphere's denser mesh doesn't
        // compete with the front-facing connections the eye is tracking.
        const baseA = lineAlpha * (0.06 + Math.pow(depthAlpha, 1.6) * 0.7);
        const isActive = state.active !== null && (i === state.active || j === state.active);
        const hot = isActive ? 1.0 : 0;
        ctx.strokeStyle = isActive
          ? `rgba(201, 234, 217, ${0.85})`
          : `rgba(127, 202, 165, ${baseA.toFixed(3)})`;
        ctx.lineWidth = isActive ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }
    }

    // ---- pulses ----
    const now = performance.now();
    state.pulses = state.pulses.filter(p => now - p.start < p.duration + 100);
    for (const p of state.pulses) {
      const u = (now - p.start) / p.duration;
      if (u < 0 || u > 1) continue;
      const a = projected[p.from], b = projected[p.to];
      const x = a.sx + (b.sx - a.sx) * u;
      const y = a.sy + (b.sy - a.sy) * u;
      const avgZ = (a.z + b.z) / 2;
      const depth = Math.max(0, (avgZ + 1) / 2);
      ctx.save();
      ctx.globalAlpha = (1 - Math.abs(u - 0.5) * 2) * (0.5 + 0.5 * depth);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x, y, 3 + depth * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ---- nodes: sort by z so front draws on top, apply scale + opacity ----
    const sorted = projected.slice().sort((u, v) => u.z - v.z);
    const R2 = Math.min(W, H);
    for (const pp of sorted) {
      const sys = state.systems[pp.i];
      if (!sys.el) continue;
      // size: base * perspective scale
      // size scales with the sphere radius so tiles stay visually balanced
      // no matter how big the sphere is. At 60 systems -> ~5.2% of radius.
      const densityK = Math.max(0.65, 1 - (state.systems.length - 40) * 0.0035);
      const base = R2 * 0.052 * densityK;
      const size = base * pp.persp * 0.9;
      const depth = Math.max(0, (pp.z + 1) / 2);
      const opacity = 0.35 + depth * 0.65;
      sys.el.style.width = size + 'px';
      sys.el.style.height = size + 'px';
      sys.el.style.left = pp.sx + 'px';
      sys.el.style.top = pp.sy + 'px';
      sys.el.style.opacity = opacity.toFixed(3);
      sys.el.style.filter = `saturate(${(0.6 + depth * 0.6).toFixed(2)})`;
      sys.el.style.zIndex = Math.round((pp.z + 2) * 500);
      sys.el.style.setProperty('--tile-size', size + 'px');
      // hide very back tiles a touch to reduce visual noise
      sys.el.style.pointerEvents = depth < 0.25 ? 'none' : 'auto';
    }

    // tooltip position follow (if hovering)
    if (state.hoverIdx >= 0) positionTooltip(state.hoverIdx);
  }

  // ---- Interactions ----
  function onDown(e) {
    state.dragging = true;
    sphereEl.classList.add('dragging');
    const pt = ('touches' in e) ? e.touches[0] : e;
    state.lastX = pt.clientX;
    state.lastY = pt.clientY;
    e.preventDefault();
  }
  function onMove(e) {
    if (!state.dragging) return;
    const pt = ('touches' in e) ? e.touches[0] : e;
    const dx = pt.clientX - state.lastX;
    const dy = pt.clientY - state.lastY;
    state.lastX = pt.clientX;
    state.lastY = pt.clientY;
    state.velY = dx * 0.005;
    state.velX = dy * 0.005;
    state.rotY += state.velY;
    state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX + state.velX));
  }
  function onUp() {
    if (!state.dragging) return;
    state.dragging = false;
    sphereEl.classList.remove('dragging');
    // restore subtle auto-rotation velocity
    if (state.autoRotate) {
      state.velY = 0.003;
    }
  }
  sphereEl.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  sphereEl.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);

  // background click clears activation
  document.getElementById('section').addEventListener('click', () => {
    if (state.active !== null) activate(state.active);
  });

  // ---- Public API (for tweaks) ----
  window.AplosSphere = {
    setCount(n) {
      if (n === state.systems.length) return;
      state.count = n;
      state.systems = buildSystems(n);
      renderNodes();
      renderLegend();
      statCount && (statCount.textContent = n);
    },
    setSpeed(s) { state.speed = s; state.velY = 0.003 * (state.autoRotate ? 1 : 0); },
    setLineOpacity(a) { state.lineOpacity = a; },
    setAutoRotate(b) {
      state.autoRotate = b;
      if (!b) { state.velY *= 0.5; }
      else state.velY = 0.003;
    },
    setTheme(t) { document.body.classList.toggle('theme-light', t === 'light'); },
  };

  // ---- Init ----
  function init() {
    state.systems = buildSystems(state.count);
    renderNodes();
    renderLegend();
    resize();
    requestAnimationFrame((t) => { state.lastT = t; tick(t); });
  }
  window.addEventListener('resize', resize);
  init();
})();
