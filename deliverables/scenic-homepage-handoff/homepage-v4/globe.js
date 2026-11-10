// A small Atlas globe: real coastlines, orthographic projection, slow spin, drag to turn, tap a pin to travel.
window.ElaraGlobe = (() => {
  const canvas = document.querySelector('#globe'); if (!canvas) return { set() {}, onPick() {} };
  const ctx = canvas.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)'), RAD = Math.PI / 180;
  const PINS = [[135.7, 35.0], [12.3, 45.4], [-72.5, -13.2], [-99.1, 19.4], [38.0, 22.0]];   // Kyoto, Venice, Machu Picchu, Mexico City, Red Sea
  let lon0 = 135.7, lat0 = 18, want = null, current = 0, collected = [], labels = [], pick = () => {};
  let visible = false, last = 0, drag = null, hold = 0, size = 260, hit = [];
  const project = (lon, lat) => {                        // -> [x, y, z] on a unit sphere facing the viewer
    const l = (lon - lon0) * RAD, p = lat * RAD, p0 = lat0 * RAD, cp = Math.cos(p);
    const x = cp * Math.sin(l), y0 = Math.sin(p), z0 = cp * Math.cos(l);
    return [x, y0 * Math.cos(p0) - z0 * Math.sin(p0), y0 * Math.sin(p0) + z0 * Math.cos(p0)];
  };
  function draw() {
    const dpr = Math.min(2, devicePixelRatio || 1), px = Math.round(size * dpr);
    if (canvas.width !== px) { canvas.width = canvas.height = px; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
    const R = size * .43, cx = size / 2, cy = size / 2;
    ctx.save(); ctx.shadowColor = 'rgba(14,22,48,.22)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 10;
    const sea = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R); sea.addColorStop(0, '#dfeafb'); sea.addColorStop(1, '#a9c1ea');
    ctx.fillStyle = sea; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
    ctx.fillStyle = '#f6f8fc'; ctx.strokeStyle = 'rgba(70,96,150,.55)'; ctx.lineWidth = .8; ctx.lineJoin = 'round';
    for (const ring of window.ELARA_LAND || []) {
      let any = false; ctx.beginPath();
      ring.forEach(([lo, la], i) => { let [x, y, z] = project(lo, la); if (z > 0) any = true; else { const n = Math.hypot(x, y) || 1; x /= n; y /= n; }   // points on the far side slide to the rim
        const X = cx + x * R, Y = cy - y * R; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
      if (any) { ctx.closePath(); ctx.fill(); ctx.stroke(); }
    }
    const shade = ctx.createRadialGradient(cx - R * .4, cy - R * .45, R * .2, cx, cy, R * 1.02); shade.addColorStop(0, 'rgba(255,255,255,.25)'); shade.addColorStop(.6, 'rgba(255,255,255,0)'); shade.addColorStop(1, 'rgba(20,34,80,.28)');
    ctx.fillStyle = shade; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.restore();
    hit = [];
    PINS.forEach(([lo, la], i) => {
      const [x, y, z] = project(lo, la); if (z < .08) return;
      const X = cx + x * R, Y = cy - y * R, got = collected.includes(i), cur = i === current, r = cur ? 8 : 6.5;
      ctx.beginPath(); ctx.arc(X, Y, r + 2.5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fillStyle = got ? '#6f4fc0' : cur ? '#2343d6' : '#fff'; ctx.fill();
      if (!got && !cur) { ctx.lineWidth = 2; ctx.strokeStyle = '#2343d6'; ctx.stroke(); }
      if (got) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(X - 3.2, Y + .2); ctx.lineTo(X - .8, Y + 2.6); ctx.lineTo(X + 3.4, Y - 2.4); ctx.stroke(); }
      if (labels[i] && (cur || got)) { ctx.font = '600 11.5px "Instrument Sans",sans-serif'; const w = ctx.measureText(labels[i]).width + 12, lx = Math.min(size - w - 2, Math.max(2, X - w / 2)), ly = Y - r - 24;
        ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.roundRect(lx, ly, w, 18, 9); ctx.fill(); ctx.fillStyle = '#1f3b42'; ctx.fillText(labels[i], lx + 6, ly + 13); }
      hit.push({ i, X, Y });
    });
  }
  const norm = d => ((d + 540) % 360) - 180;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!visible || document.hidden || drag) return;
    if (want !== null) { const d = norm(want - lon0); lon0 += d * Math.min(1, dt * 3); if (Math.abs(d) < .3) { lon0 = want; want = null; hold = 3; } draw(); return; }
    if (reduced.matches) return;
    if (hold > 0) { hold -= dt; return; }
    lon0 = norm(lon0 + dt * 7); draw();                  // slow idle spin
  }
  const local = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * size / r.width, (e.clientY - r.top) * size / r.height]; };
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, lon: lon0, moved: false }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; if (drag.moved) { lon0 = norm(drag.lon - dx * .5); want = null; draw(); } });
  canvas.addEventListener('pointerup', e => { const was = drag; drag = null; hold = 4; if (was && !was.moved) { const [x, y] = local(e), h = hit.find(p => Math.hypot(p.X - x, p.Y - y) < 18); if (h) pick(h.i); } });
  canvas.addEventListener('pointercancel', () => { drag = null; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; last = performance.now(); if (visible) draw(); }).observe(canvas);
  new ResizeObserver(() => { size = canvas.clientWidth || 260; draw(); }).observe(canvas);
  requestAnimationFrame(frame);
  return {
    set(o) { if ('labels' in o) labels = o.labels; if ('collected' in o) collected = o.collected;
      if ('current' in o && o.current !== current) { current = o.current; want = PINS[current][0]; if (reduced.matches) { lon0 = want; want = null; } }
      draw(); },
    onPick(f) { pick = f; }, get lon() { return lon0; }, get spinning() { return visible && !document.hidden && !reduced.matches; },
  };
})();
