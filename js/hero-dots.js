/* =====================================================================
   PROFINITI HERO ANIMATION - "A dot: everything connected with a dot"
   A glowing red core dot in the hero. Small dots orbit and drift around
   it, link to nearby dots with thin lines, and link back to the core.
   Move the mouse over the hero: dots are pushed away from the cursor and
   lines connect to it. A soft pulse ripples out from the core.
   Plain script - works when index.html is opened directly as a file.
   ===================================================================== */

/* ---------- EASY SETTINGS (safe to change) ---------- */
const HERO_DOTS = {
  countDesktop: 120,       // number of dots on large screens
  countMobile: 60,         // number of dots on phones
  minDots: 60,             // never drop below this many on slow PCs
  red: '230,0,0',          // brand red (R,G,B)
  navy: '11,27,58',        // brand navy (R,G,B)
  speed: 1,                // overall motion speed (0.5 calm ... 2 lively)
  linkDistance: 130,       // max px between dots to draw a line
  coreLinkDistance: 240,   // dots closer than this link to the core dot
  mouseRadius: 190,        // how far the cursor affects dots (px)
  mousePush: 1,            // push strength (0 = off, 2 = strong)
  pulseEvery: 3000,        // ms between pulses from the core
  coreX: 0.70, coreY: 0.48 // core position (fraction of width/height); mobile uses centre
};

/* ---------- ENGINE (no need to edit below) ---------- */
(function () {
  const cv = document.getElementById('hero-dots');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const S = HERO_DOTS;
  // Note: we deliberately do NOT slow down or stop for "reduced motion"
  // (Windows "Animation effects: off" turns that on for many users).
  let W = 0, H = 0, dpr = 1, rx = 0, ry = 0, dots = [];
  const core = { x: 0, y: 0 }, mouse = { x: 0, y: 0, on: false };
  let raf = 0, running = false, lastT = 0, lastPulse = 0, pulses = [], slow = 0;

  function makeDot() {
    return {
      th: Math.random() * Math.PI * 2,                       // orbit angle
      rho: 0.15 + Math.sqrt(Math.random()) * 0.85,           // orbit size (0..1 of ellipse)
      w: (0.06 + Math.random() * 0.16) * (Math.random() < 0.8 ? 1 : -1), // rad/sec
      ph: Math.random() * 6.283, wf: 0.4 + Math.random() * 0.8, wa: 8 + Math.random() * 18, // wobble
      ox: 0, oy: 0, vx: 0, vy: 0,                             // mouse displacement
      x: 0, y: 0, r: Math.random() * 1.6 + 0.9, red: Math.random() < 0.55
    };
  }

  function resize() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = W < 768;
    core.x = W * (mobile ? 0.5 : S.coreX); core.y = H * (mobile ? 0.42 : S.coreY);
    rx = Math.min(W * (mobile ? 0.55 : 0.5), 680); ry = Math.min(H * 0.46, 400);
    const n = mobile ? S.countMobile : S.countDesktop;
    while (dots.length < n) dots.push(makeDot());
    dots.length = n;
  }

  function step(t, dt) {
    const sp = S.speed, R = S.mouseRadius, R2 = R * R, ts = t / 1000;
    for (const d of dots) {
      d.th += d.w * sp * dt;                                  // orbit (clearly visible drift)
      const wob = Math.sin(ts * d.wf * sp + d.ph) * d.wa;
      const hx = core.x + Math.cos(d.th) * rx * d.rho + Math.cos(d.ph + ts * 0.7) * wob;
      const hy = core.y + Math.sin(d.th) * ry * d.rho + Math.sin(d.ph + ts * 0.9) * wob;
      // mouse push: acts on a separate offset that springs back afterwards
      if (mouse.on) {
        const mx = hx + d.ox - mouse.x, my = hy + d.oy - mouse.y, q = mx * mx + my * my;
        if (q < R2 && q > 0.01) {
          const md = Math.sqrt(q), f = (1 - md / R) * 2600 * S.mousePush;
          d.vx += (mx / md) * f * dt; d.vy += (my / md) * f * dt;
        }
      }
      d.vx += -d.ox * 9 * dt; d.vy += -d.oy * 9 * dt;        // spring back home
      const damp = Math.pow(0.04, dt); d.vx *= damp; d.vy *= damp;
      d.ox += d.vx * dt; d.oy += d.vy * dt;
      d.x = hx + d.ox; d.y = hy + d.oy;
    }
    if (t - lastPulse > S.pulseEvery) { pulses.push({ r: 0, a: 0.55 }); lastPulse = t; }
    for (const p of pulses) { p.r += 130 * dt; p.a *= Math.pow(0.4, dt); }
    pulses = pulses.filter(p => p.a > 0.02 && p.r < Math.max(W, H));
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const L2 = S.linkDistance * S.linkDistance, C2 = S.coreLinkDistance * S.coreLinkDistance;
    const M2 = S.mouseRadius * S.mouseRadius * 1.2;
    // lines are grouped into opacity "buckets" and drawn in one go (fast)
    const B = 4, nb = [], cb = [], mb = [];
    for (let k = 0; k < B; k++) { nb.push(new Path2D()); cb.push(new Path2D()); mb.push(new Path2D()); }
    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j], dx = a.x - b.x, dy = a.y - b.y, q = dx * dx + dy * dy;
        if (q < L2) { const k = Math.min(B - 1, ((1 - q / L2) * B) | 0); nb[k].moveTo(a.x, a.y); nb[k].lineTo(b.x, b.y); }
      }
      const cx = a.x - core.x, cy = a.y - core.y, cq = cx * cx + cy * cy;
      if (cq < C2) { const k = Math.min(B - 1, ((1 - cq / C2) * B) | 0); cb[k].moveTo(a.x, a.y); cb[k].lineTo(core.x, core.y); }
      if (mouse.on) {
        const mx = a.x - mouse.x, my = a.y - mouse.y, mq = mx * mx + my * my;
        if (mq < M2) { const k = Math.min(B - 1, ((1 - mq / M2) * B) | 0); mb[k].moveTo(a.x, a.y); mb[k].lineTo(mouse.x, mouse.y); }
      }
    }
    for (let k = 0; k < B; k++) {
      const o = (k + 1) / B;
      ctx.lineWidth = 0.7; ctx.strokeStyle = `rgba(${S.navy},${o * 0.25})`; ctx.stroke(nb[k]);
      ctx.strokeStyle = `rgba(${S.red},${o * 0.35})`; ctx.stroke(cb[k]);
      ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${S.red},${o * 0.6})`; ctx.stroke(mb[k]);
    }
    // pulse rings
    ctx.lineWidth = 1.3;
    for (const p of pulses) { ctx.strokeStyle = `rgba(${S.red},${p.a})`; ctx.beginPath(); ctx.arc(core.x, core.y, p.r, 0, 6.283); ctx.stroke(); }
    // dots (brighten when a pulse passes)
    for (const d of dots) {
      let glow = 0;
      for (const p of pulses) { const dd = Math.abs(Math.hypot(d.x - core.x, d.y - core.y) - p.r); if (dd < 22) glow = Math.max(glow, (1 - dd / 22) * p.a * 2); }
      ctx.fillStyle = d.red ? `rgba(${S.red},${Math.min(1, 0.6 + glow)})` : `rgba(${S.navy},${Math.min(1, 0.5 + glow)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r + glow * 1.6, 0, 6.283); ctx.fill();
    }
    // cursor dot
    if (mouse.on) { ctx.fillStyle = `rgba(${S.red},.85)`; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 3.5, 0, 6.283); ctx.fill(); }
    // core dot with glow + breathing
    const br = 1 + Math.sin(t / 500) * 0.15;
    const g = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, 64 * br);
    g.addColorStop(0, `rgba(${S.red},.5)`); g.addColorStop(1, `rgba(${S.red},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(core.x, core.y, 64 * br, 0, 6.283); ctx.fill();
    ctx.fillStyle = `rgb(${S.red})`; ctx.beginPath(); ctx.arc(core.x, core.y, 9 * br, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(core.x, core.y, 3, 0, 6.283); ctx.fill();
  }

  function loop(t) {
    const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016; // seconds, capped
    // slow PC? drop some dots, but never below S.minDots
    if (lastT) { slow = (t - lastT) > 45 ? slow + 1 : Math.max(0, slow - 1); }
    if (slow > 30 && dots.length > S.minDots) { dots.length = Math.max(S.minDots, Math.floor(dots.length * 0.85)); slow = 0; }
    lastT = t;
    step(t, dt); draw(t);
    raf = requestAnimationFrame(loop);
  }
  function start() { if (running) return; running = true; lastT = 0; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  // Only pause when the browser tab is hidden.
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  // Mouse: listen on the whole window (text and overlays sit above the canvas)
  function onMove(e) {
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    mouse.on = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
    mouse.x = x; mouse.y = y;
  }
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', () => { mouse.on = false; });
  window.addEventListener('blur', () => { mouse.on = false; });

  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  window.addEventListener('load', resize);
  function boot() { resize(); if (W < 2 || H < 2) { setTimeout(boot, 100); return; } start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // for testing in the browser console: __heroDots()
  window.__heroDots = () => ({ running, n: dots.length, mouse: { ...mouse }, p: dots.slice(0, 2).map(d => [Math.round(d.x), Math.round(d.y)]) });
})();
