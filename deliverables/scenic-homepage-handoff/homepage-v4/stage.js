// Elara homepage stage: ONE traveler on one straight path through five phones.
// The visitor chooses where she goes; she walks there. Classic script, no modules.
window.ElaraStage = (() => {
  const $ = s => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => mq.matches || params.get('motion') === '0';
  if (params.has('shot')) document.documentElement.classList.add('shot');

  // ---- Geometry (world px) ----
  const HT = 640, Y0 = 574, H0 = 214;                    // stage height, shared foot line, body height
  const STEP = .218 * H0, CADENCE = 2.7, LEG = 5;        // half a stride (from the sprite), half-steps per second, half-steps between phones
  const PITCH = LEG * STEP;
  const WL = 300, HL = 596, WS = 216, HS = 430;          // focused / resting phone glass
  const PHONES = window.ELARA_DEST.map((d, i) => ({ ...d, cx: i * PITCH, bottom: 620 + d.ob }));
  const LAST = PHONES.length - 1;

  // ---- Sprites: 3x3 sheets of 418px cells (walker), 3x3 of ~420x416 (diver) ----
  const CELL = 418;
  const META = {
    kyoto:  { h: 391, anchor: [216, 211, 222, 212, 208, 211, 225], base: [408, 406, 407, 405, 402, 406, 410] },
    venice: { h: 404, anchor: [207, 195, 225, 207, 188, 223, 204], base: [416, 415, 416, 412, 411, 412, 415] },
    andes:  { h: 387, anchor: [214, 202, 218, 219, 208, 212, 223], base: [402, 403, 405, 404, 400, 404, 410] },
    mexico: { h: 387, anchor: [213, 202, 218, 219, 207, 213, 222], base: [403, 405, 404, 403, 405, 405, 410] },
  };
  const WALK_SIDE = [0, 1, 2, 1], STAND = 6;

  // ---- State: where she is (in half-steps), where she is going ----
  let pos = 0, from = 0, target = 0, facing = 1, speed = 1, clock = 0;
  let loaded = false, visible = true, last = 0, scale = 1, viewW = 900;
  let sameOutfit = params.get('outfit') === 'same';
  const img = {}, listeners = { arrive: [], leave: [], frame: [] };
  const emit = (n, v) => listeners[n].forEach(f => f(v));
  const canvas = $('#scene'), ctx = canvas.getContext('2d');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const moving = () => pos !== target;
  const index = () => Math.round(target / LEG);

  function goTo(i, instant) {
    i = clamp(i, 0, LAST); const t = i * LEG;
    if (t === target && !instant) return;
    const dir = Math.sign(t - pos) || facing;
    if (!moving() || dir !== facing) from = pos;          // a fresh start or a turn-around begins from standing
    if (!moving()) emit('leave', index());
    target = t; facing = dir; speed = clamp(1 + .5 * (Math.abs(t - pos) / LEG - 1), 1, 2.2);
    if (instant || still()) { pos = from = target; draw(); emit('arrive', i); }
  }
  function traveler() {
    const n = Math.round(pos), x = pos * STEP;
    const stand = moving() ? Math.max(1 - smooth(0, .35, Math.abs(pos - from)), 1 - smooth(0, .35, Math.abs(target - pos))) : 1;
    return { p: pos, n, stand, facing, body: { x, y: Y0, h: H0 }, foot: { x: n * STEP, y: Y0, h: H0 } };
  }
  function windowOf(ph, hx) {                             // the phone's glass, for where she is now
    const f = clamp(1 - Math.abs(hx - ph.cx) / PITCH, 0, 1), w = ph.m * (WS + (WL - WS) * f), h = ph.m * (HS + (HL - HS) * f);
    return { f, x: ph.cx - w / 2, y: ph.bottom - h, w, h, r: w * .15 };
  }

  // ---- Drawing ----
  function drawPose(sheet, meta, cell, foot, body, alpha, lift, flip) {
    if (alpha <= 0) return;
    const sc = body.h / meta.h, hip = body.h * .5, dx = body.x - foot.x, fx = flip ? -1 : 1;
    const sx = (cell % 3) * CELL, sy = Math.floor(cell / 3) * CELL, ox = -meta.anchor[cell] * sc, oy = -meta.base[cell] * sc, size = CELL * sc;
    ctx.globalAlpha = alpha;
    // Legs: the sole stays on the planted spot while the hips travel (no foot slide between poses).
    ctx.save(); ctx.transform(1, 0, -dx / hip, 1, foot.x, foot.y);
    ctx.beginPath(); ctx.rect(-body.h, -hip - 5, body.h * 2, hip + 5 + body.h * .06); ctx.clip();
    ctx.scale(fx, 1); ctx.drawImage(sheet, sx, sy, CELL, CELL, ox, oy, size, size); ctx.restore();
    // Torso and head: travel continuously, rising a little over the planted leg.
    ctx.save(); ctx.translate(body.x, body.y - lift);
    ctx.beginPath(); ctx.rect(-body.h, -body.h * 1.1, body.h * 2, body.h * 1.1 - hip + .6); ctx.clip();
    ctx.scale(fx, 1); ctx.drawImage(sheet, sx, sy, CELL, CELL, ox, oy, size, size); ctx.restore();
    ctx.globalAlpha = 1;
  }
  function shadow(x, y, rx, ry, a) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(16,24,34,${a})`); g.addColorStop(.55, `rgba(16,24,34,${a * .55})`); g.addColorStop(1, 'rgba(16,24,34,0)');
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fill(); ctx.restore();
  }
  function drawWalker(tr, key) {
    const sheet = img[key + '-sprite'], meta = META[key], { p, n, foot, body } = tr, h = body.h, walk = 1 - tr.stand, flip = tr.facing < 0;
    const stride = Math.abs(Math.cos(Math.PI * p)) * walk;                           // 1 at foot contact (legs apart), 0 as they pass
    shadow(body.x, body.y + h * .004, h * (.2 + .1 * stride), h * .045, .3);         // soft shadow, widest when her feet are apart
    shadow(walk > 0 ? foot.x : body.x, body.y + h * .002, h * .1, h * .02, .5);    // tight contact under the planted foot
    if (tr.stand >= 1) return drawPose(sheet, meta, STAND, body, body, 1, 0, false);
    const lift = h * .012 * (.5 - .5 * Math.cos(Math.PI * p)) * walk;              // lowest at foot contact, highest as the legs pass
    drawPose(sheet, meta, WALK_SIDE[((n % 4) + 4) % 4], foot, body, 1, lift, flip);
    drawPose(sheet, meta, STAND, body, body, tr.stand, 0, false);
  }
  function drawCamel(tr) {                                // Giza: she rides (the app's own camel-rider sheet, 3x3; it faces left, so it is mirrored when she heads right)
    const sheet = img['camel-sprite'], c = sheet.width / 3, size = H0 * 1.16, x = tr.body.x, moving = tr.stand < 1;
    const cell = moving ? [0, 1, 2, 1][((tr.n % 4) + 4) % 4] : 6, flip = tr.facing > 0;
    shadow(x, Y0 + 1, H0 * .42, H0 * .05, .32);
    ctx.save(); ctx.translate(x, Y0 - (moving ? Math.abs(Math.sin(tr.p * Math.PI)) * 2 : 0)); ctx.scale(flip ? -1 : 1, 1);
    ctx.drawImage(sheet, (cell % 3) * c, Math.floor(cell / 3) * c, c, c, -size / 2, -size * .955, size, size); ctx.restore();
  }
  function drawBoat(tr) {                                 // Great Barrier Reef: she is in the boat, on the water (the app's own art)
    const sheet = img['boat-sprite'], w = H0 * 1.5, h = w * sheet.height / sheet.width, x = tr.body.x, y = Y0 + 6 + Math.sin(clock * 1.2) * 3;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(clock * .9) * .012); ctx.scale(tr.facing < 0 && tr.stand < 1 ? -1 : 1, 1);
    ctx.drawImage(sheet, -w / 2, -h, w, h); ctx.restore();
  }
  const stacked = matchMedia('(max-width: 900px)');
  const camX = () => pos * STEP - viewW * (stacked.matches ? .5 : .33);   // desktop: the active phone sits left of centre, next to the copy, with the journey ahead on the right
  function draw() {
    if (!loaded) return;
    const dpr = Math.min(2, devicePixelRatio || 1), cw = Math.round(viewW * scale * dpr), ch = Math.round(HT * scale * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    const tr = traveler(), cam = camX();
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0); ctx.clearRect(0, 0, viewW, HT); ctx.translate(-cam, 0);
    // Depth order never changes: each phone sits in front of the one before it, so the next phone's frame is the
    // edge she passes behind, and that frame hides the line where her outfit changes.
    const BODY = '#172433', B = 7;
    for (const ph of PHONES) {
      const w = windowOf(ph, tr.body.x);
      if (w.x + w.w < cam - 60 || w.x > cam + viewW + 60) continue;
      const plate = img[ph.key], PW = WL * ph.m, PH = HL * ph.m;
      ctx.save(); ctx.shadowColor = `rgba(22,36,54,${(.16 + .14 * w.f).toFixed(3)})`; ctx.shadowBlur = 16 + 16 * w.f; ctx.shadowOffsetY = 6 + 8 * w.f;
      ctx.fillStyle = BODY; ctx.beginPath(); ctx.roundRect(w.x - B, w.y - B, w.w + 2 * B, w.h + 2 * B, w.r + B); ctx.fill(); ctx.restore();
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.roundRect(w.x - B + .5, w.y - B + .5, w.w + 2 * B - 1, w.h + 2 * B - 1, w.r + B - .5); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.roundRect(w.x, w.y, w.w, w.h, w.r); ctx.clip();
      const s = Math.max(PW / plate.width, PH / plate.height), iw = plate.width * s, ih = plate.height * s;
      ctx.drawImage(plate, ph.cx - iw / 2, ph.bottom - ih, iw, ih);                // scenery is fixed in the world
      if (w.f < 1) { ctx.fillStyle = `rgba(255,255,255,${(.34 * (1 - w.f)).toFixed(3)})`; ctx.fillRect(w.x, w.y, w.w, w.h); }
      if (Math.abs(tr.body.x - ph.cx) < PITCH + H0) { const inside = tr.body.x > w.x - 16 && tr.body.x < w.x + w.w + 16;   // wide rides appear once she is in that phone, so they never poke into a neighbour
        if (ph.traveler === 'camel') { if (inside) drawCamel(tr); } else if (ph.traveler === 'boat') { if (inside) drawBoat(tr); } else drawWalker(tr, sameOutfit ? 'kyoto' : ph.traveler); }
      ctx.restore();
      ctx.fillStyle = BODY; ctx.beginPath(); ctx.roundRect(ph.cx - w.w * .15, w.y + w.w * .04, w.w * .3, w.w * .08, w.w * .04); ctx.fill();
    }
    $('#cards').style.transform = `scale(${scale}) translateX(${-cam}px)`;
    canvas.dataset.pos = pos.toFixed(2);
  }
  function layout() {
    const stage = $('#stage'), w = stage.clientWidth;
    scale = stacked.matches ? clamp(w / 390, .78, 1) : clamp(w / 400, .6, 1);     // the active phone stays full size on a phone, so its text stays readable
    viewW = w / scale; stage.style.height = HT * scale + 'px'; draw();
  }
  function frame(now) {
    if (!canvas.isConnected) return;                     // the page was replaced: stop
    requestAnimationFrame(frame);
    if (!loaded) return;
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    clock += dt;
    const was = moving();
    // She eases into and out of a walk (no instant full speed), so the first and last steps are shorter and slower.
    if (was) { const gap = target - pos, ease = Math.min(1, .4 + Math.abs(pos - from) * .75, .4 + Math.abs(gap) * .75), d = CADENCE * speed * ease * dt; pos = Math.abs(gap) <= d ? target : pos + Math.sign(gap) * d; if (!moving()) from = pos; }
    if (was || PHONES[index()].traveler === 'boat') draw();   // the boat keeps bobbing; everyone else is still when standing                 // the diver keeps gently moving; everyone else is still when standing
    if (was && !moving()) emit('arrive', index());
    emit('frame', dt);
  }
  // Which phone is under a point of the stage (for tap-to-travel)
  function phoneAt(clientX, clientY) {
    const r = canvas.getBoundingClientRect(), x = (clientX - r.left) / scale + camX(), y = (clientY - r.top) / scale, hx = pos * STEP;
    for (let i = LAST; i >= 0; i--) { const w = windowOf(PHONES[i], hx); if (x >= w.x - 7 && x <= w.x + w.w + 7 && y >= w.y - 7 && y <= w.y + w.h + 7) return i; }
    return -1;
  }
  const cardBox = i => { const ph = PHONES[i], PW = WL * ph.m; return { left: ph.cx - PW / 2 + 12, top: ph.bottom - HL * ph.m + PW * .145, width: PW - 58, room: Y0 - H0 - (ph.bottom - HL * ph.m + PW * .145) - 6 }; };

  const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(src)); i.src = src; });
  const ready = (async () => {
    const sprites = [...new Set(PHONES.map(p => p.traveler))].map(k => k + '-sprite');
    (await Promise.all(PHONES.map(p => load('assets/' + p.plate)))).forEach((im, i) => img[PHONES[i].key] = im);
    (await Promise.all(sprites.map(n => load(`assets/${n}.webp`)))).forEach((im, i) => img[sprites[i]] = im);
    document.documentElement.dataset.motion = still() ? 'off' : 'on';
    $('#world').hidden = false; document.documentElement.classList.add('ready'); loaded = true;
    new ResizeObserver(layout).observe($('#stage'));
    new IntersectionObserver(es => { visible = es[0].isIntersecting; last = performance.now(); }).observe($('#stage'));
    document.addEventListener('visibilitychange', () => { last = performance.now(); });
    layout(); last = performance.now(); requestAnimationFrame(frame);
  })();

  return { ready, goTo, on: (n, f) => listeners[n].push(f), phoneAt, cardBox, still, count: PHONES.length, keys: PHONES.map(p => p.key),
    get index() { return index(); }, get moving() { return moving(); }, get pos() { return pos; }, get scale() { return scale; }, LEG, STEP, Y0, H0,
    traveler, setOutfit: same => { sameOutfit = same; draw(); }, get visible() { return visible && !document.hidden; } };
})();
