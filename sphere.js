// Aplos Data — Operate as One sphere
// Drop-in widget. Mount target: any element matching `[data-aplos-sphere]`
// (or the legacy id="sphere"). Scales to its container.
//
// Renders a Fibonacci-distributed point cloud on a sphere. DOM nodes carry
// crisp logo tiles; a canvas overlay handles connection lines and pulses.

(function () {
  'use strict';

  // ----- Catalog: 50 systems -----
  // `s` is a Simple Icons slug (https://simpleicons.org). When empty, the
  // tile renders the system's monogram (first 1-2 letters) as a fallback.
  // `u` overrides `s` with a direct URL/path to a local SVG.
  const SYSTEMS = [
    { n: 'Salesforce',           s: 'salesforce'        },
    { n: 'Power BI',             s: 'powerbi'           },
    { n: 'Databricks',           s: 'databricks'        },
    { n: 'Snowflake',            s: 'snowflake'         },
    { n: 'MuleSoft',             s: 'mulesoft'          },
    { n: 'Tableau',              s: 'tableau'           },
    { n: 'Amazon Redshift',      s: 'amazonredshift'    },
    { n: 'BigCommerce',          s: 'bigcommerce'       },
    { n: 'Oracle ERP Cloud',     s: 'oracle'            },
    { n: 'ServiceNow',           u: 'logos/servicenow.svg' },
    { n: 'HubSpot',              s: 'hubspot'           },
    { n: 'SAP',                  s: 'sap'               },
    { n: 'Google Analytics',     s: 'googleanalytics'   },
    { n: 'Magento',              s: 'magento'           },
    { n: 'Informatica',          s: 'informatica'       },
    { n: 'Workday',              u: 'logos/workday.svg' },
    { n: 'Collibra',             u: 'logos/collibra.svg' },
    { n: 'QuickBooks',           s: 'quickbooks'        },
    { n: 'Sage',                 s: 'sage'              },
    { n: 'Monday.com',           u: 'logos/monday.svg' },
    { n: 'Trello',               s: 'trello'            },
    { n: 'ServiceNow ITSM',      u: 'logos/servicenow.svg' },
    { n: 'Zendesk',              s: 'zendesk'           },
    { n: 'Asana',                s: 'asana'             },
    { n: 'Jira',                 s: 'jira'              },
    { n: 'Workato',              u: 'logos/workato.svg' },
    { n: 'Boomi',                u: 'logos/boomi.svg'  },
    { n: 'Zapier',               s: 'zapier'            },
    { n: 'Treasure AI',          u: 'logos/treasureai.svg' },
    { n: 'Microsoft Azure',      s: 'microsoftazure'    },
    { n: 'PostgreSQL',           s: 'postgresql'        },
    { n: 'MongoDB',              s: 'mongodb'           },
    { n: 'Microsoft Fabric',     u: 'logos/fabric.svg' },
    { n: 'Dynamics 365',         s: 'dynamics365'       },
    { n: 'NetSuite',             s: 'oracle'            },
    { n: 'Smartsheet',           u: 'logos/smartsheet.svg' },
    { n: 'ADP',                  s: 'adp'               },
    { n: 'Qlik',                 s: 'qlik'              },
    { n: 'Alteryx',              s: 'alteryx'           },
    { n: 'Datadog',              s: 'datadog'           },
    { n: 'Amazon S3',            s: 'amazons3'          },
    { n: 'GitHub',               s: 'github'            },
    { n: 'Bitbucket',            s: 'bitbucket'         },
    { n: 'Talend',               u: 'logos/talend.svg'  },
    { n: 'ZoomInfo',             u: 'logos/zoominfo.svg' },
    { n: 'Marketo',              u: 'logos/marketo.svg' },
    { n: 'BigQuery',             s: 'googlebigquery'    },
    { n: 'Looker',               s: 'looker'            },
    { n: 'Teradata',             u: 'logos/teradata.svg'},
    { n: 'IBM i-Series',         s: 'ibm'               },
  ];

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
    speed: 1.0,
    lineOpacity: 0.5,
    autoRotate: true,
    rotY: 0,
    rotX: -0.18,
    targetRotX: -0.18,
    dragging: false,
    lastX: 0, lastY: 0,
    velY: 0.0015,
    velX: 0,
    systems: [],
    active: null,
    pulses: [],
    hoverIdx: -1,
    lastT: performance.now(),
  };

  // ---- DOM refs ----
  const sphereEl =
    document.querySelector('[data-aplos-sphere]') ||
    document.getElementById('sphere');
  if (!sphereEl) return;

  // Build the inner shell if the host only provided an outer mount.
  let nodesEl = sphereEl.querySelector('.aplos-nodes');
  let canvas = sphereEl.querySelector('canvas.aplos-lines');
  if (!nodesEl) {
    canvas = document.createElement('canvas');
    canvas.className = 'aplos-lines';
    sphereEl.appendChild(canvas);
    nodesEl = document.createElement('div');
    nodesEl.className = 'aplos-nodes';
    sphereEl.appendChild(nodesEl);
  }
  const ctx = canvas.getContext('2d');

  // tooltip lives inside the sphere mount so positioning stays local
  let tooltip = sphereEl.querySelector('.aplos-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'aplos-tooltip';
    tooltip.innerHTML = '<div class="aplos-tooltip-name"></div>';
    sphereEl.appendChild(tooltip);
  }

  // ---- Build systems + nodes ----
  function buildSystems() {
    const positions = fibSphere(SYSTEMS.length, 1);
    const systems = SYSTEMS.map((s, i) => ({
      name: s.n,
      slug: s.s || '',
      url: s.u || '',
      basePos: positions[i],
      el: null,
    }));
    // 5–6 nearest neighbors per node → mesh, not spokes.
    for (let i = 0; i < systems.length; i++) {
      const a = systems[i].basePos;
      const ranked = [];
      for (let j = 0; j < systems.length; j++) {
        if (i === j) continue;
        const b = systems[j].basePos;
        const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
        ranked.push({ j, d2 });
      }
      ranked.sort((u, v) => u.d2 - v.d2);
      const k = 5 + (i % 2);
      systems[i].connections = ranked.slice(0, k).map((r) => r.j);
    }
    return systems;
  }

  function monogram(name) {
    const parts = name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0] || '?').slice(0, 2).toUpperCase();
  }

  function renderNodes() {
    nodesEl.innerHTML = '';
    state.systems.forEach((sys, i) => {
      const el = document.createElement('div');
      el.className = 'aplos-node';
      el.dataset.idx = i;
      const iconUrl = sys.url
        ? sys.url
        : (sys.slug ? `https://cdn.jsdelivr.net/npm/simple-icons@11/icons/${sys.slug}.svg` : '');
      const hasIcon = !!iconUrl;
      el.innerHTML = `
        <div class="aplos-node-inner">
          ${hasIcon
            ? `<img class="aplos-node-logo" src="${iconUrl}" alt="${sys.name}" loading="lazy"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>`
            : ''}
          <span class="aplos-node-mark"${hasIcon ? ' style="display:none"' : ''}>${monogram(sys.name)}</span>
        </div>`;
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

  function showTooltip(i) {
    const sys = state.systems[i];
    tooltip.querySelector('.aplos-tooltip-name').textContent = sys.name;
    tooltip.classList.add('show');
    positionTooltip(i);
  }
  function hideTooltip() { tooltip.classList.remove('show'); }
  function positionTooltip(i) {
    const sys = state.systems[i];
    if (!sys.screen) return;
    tooltip.style.left = sys.screen.x + 'px';
    tooltip.style.top  = sys.screen.y + 'px';
  }

  function activate(i) {
    state.active = (state.active === i) ? null : i;
    state.systems.forEach((s) => s.el && s.el.classList.remove('active'));
    state.pulses = [];
    if (state.active !== null) {
      state.systems[i].el.classList.add('active');
      const now = performance.now();
      state.systems[i].connections.forEach((j, k) => {
        state.pulses.push({ from: i, to: j, start: now + k * 80, duration: 900, color: '#c9ead9' });
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
      state.rotY += state.velY * (dt / 16.67);
      state.velY *= 0.96;
      state.velX *= 0.96;
      state.rotX += state.velX * (dt / 16.67);
    }
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
    const R = Math.min(W, H) * 0.42;
    const camDist = 2.6;

    const projected = state.systems.map((sys, i) => {
      let p = sys.basePos;
      p = rotY(p, state.rotY);
      p = rotX(p, state.rotX);
      const persp = camDist / (camDist - p.z);
      const sx = cx + p.x * R * persp;
      const sy = cy + p.y * R * persp;
      sys.screen = { x: sx, y: sy, z: p.z, persp };
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
        if (j < i) continue;
        const b = projected[j];
        const avgZ = (a.z + b.z) / 2;
        const depthAlpha = Math.max(0, (avgZ + 1) / 2);
        const baseA = lineAlpha * (0.06 + Math.pow(depthAlpha, 1.6) * 0.7);
        const isActive = state.active !== null && (i === state.active || j === state.active);
        ctx.strokeStyle = isActive
          ? `rgba(201, 234, 217, 0.85)`
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
    state.pulses = state.pulses.filter((p) => now - p.start < p.duration + 100);
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

    // ---- nodes ----
    const sorted = projected.slice().sort((u, v) => u.z - v.z);
    const R2 = Math.min(W, H);
    const densityK = Math.max(0.65, 1 - (state.systems.length - 40) * 0.0035);
    const base = R2 * 0.052 * densityK;
    for (const pp of sorted) {
      const sys = state.systems[pp.i];
      if (!sys.el) continue;
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
      sys.el.style.setProperty('--aplos-tile-size', size + 'px');
      sys.el.style.pointerEvents = depth < 0.25 ? 'none' : 'auto';
    }

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
    state.velX = -dy * 0.005;
    state.rotY += state.velY;
    state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX + state.velX));
  }
  function onUp() {
    if (!state.dragging) return;
    state.dragging = false;
    sphereEl.classList.remove('dragging');
    if (state.autoRotate) state.velY = 0.0015;
  }
  sphereEl.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  sphereEl.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);

  // background click clears activation
  sphereEl.addEventListener('click', (e) => {
    if (e.target === sphereEl || e.target === canvas) {
      if (state.active !== null) activate(state.active);
    }
  });

  // ---- Public API ----
  window.AplosSphere = {
    setSpeed(s) { state.speed = s; state.velY = 0.0015 * (state.autoRotate ? 1 : 0); },
    setLineOpacity(a) { state.lineOpacity = a; },
    setAutoRotate(b) {
      state.autoRotate = b;
      if (!b) { state.velY *= 0.5; }
      else state.velY = 0.0015;
    },
  };

  // ---- Init ----
  function init() {
    state.systems = buildSystems();
    renderNodes();
    resize();
    requestAnimationFrame((t) => { state.lastT = t; tick(t); });
  }
  window.addEventListener('resize', resize);
  init();
})();
