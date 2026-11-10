// Elara crossing prototype: ONE traveler, one timeline, two screens.
// Everything on screen is a pure function of T (seconds), so pausing, scrubbing and
// jumping can never create a second traveler or teleport her.

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const mq = matchMedia('(prefers-reduced-motion: reduce)');
const still = () => mq.matches || params.get('motion') === '0';
if (params.has('shot')) document.documentElement.classList.add('shot');

// ---- Geometry (world px). Two phones side by side sharing a frame. ----
const SW = 348, SH = 600, BZ = 10, GAP = 0, W = 736, HT = 620, R = 28;
const SX = [BZ, BZ + SW + BZ + GAP + BZ], SY = BZ;      // screen origins
// Shared ground plane: the stone path of Kyoto and the pavement of Venice meet at the same
// foot line (Y0), with one horizon (YH) and one body height (H0) at that line.
const Y0 = SY + 558, YH = SY + 276, H0 = 214, DEPTH = 373, VX = SX[1] + SW * .5;
const STEP = .218 * H0;                                  // half a stride, measured from the sprite's feet
const CADENCE = 1.9;                                     // steps per second, constant for the whole walk
const STEPS_A = 8, STEPS_B = 8, STEPS = STEPS_A + STEPS_B;
const U_A = SX[0] + 104 - VX;                            // start, lateral px relative to Venice's vanishing x
const U_B = U_A + STEPS_A * STEP;
const dirB = (() => { const u = 13.7 - U_B, z = 358, n = Math.hypot(u, z); return [u / n, z / n]; })();

// ---- Timeline ----
const T_WALK = 7, T_ARRIVE = T_WALK + STEPS / CADENCE, T_END = T_ARRIVE + 9;
const BEATS = [
  { t: 0, step: 0, say: 'Kioto. Llegas y Elara te hace una pregunta.' },
  { t: 2.6, step: 1, say: 'Kioto. Tu respuesta trae una herramienta concreta.' },
  { t: 4.8, step: 2, say: 'Kioto. Te llevas un recuerdo del lugar.' },
  { t: T_WALK, step: 3, say: 'Ella sigue por el mismo camino y entra en Venecia.' },
  { t: T_ARRIVE, step: 0, say: 'Venecia. Al llegar, una pregunta nueva.' },
  { t: T_ARRIVE + 2.8, step: 1, say: 'Venecia. Otra herramienta para usar hoy.' },
  { t: T_ARRIVE + 5.4, step: 2, say: 'Venecia. Otro recuerdo para tu colección.' },
];
const beatAt = t => { let i = 0; BEATS.forEach((b, j) => { if (t >= b.t - 1e-6) i = j; }); return i; };

// ---- Sprite metrics, measured from the sheets (3x3 grid of 418px cells) ----
// anchor = x of the planted-foot reference in each cell; base = y of the sole.
const CELL = 418;
const META = {
  kyoto:  { h: 391, anchor: [216, 211, 222, 212, 208, 211, 225, 196, 208], base: [408, 406, 407, 405, 402, 406, 410, 410, 410] },
  venice: { h: 404, anchor: [207, 195, 225, 207, 188, 223, 204, 200, 214], base: [416, 415, 416, 412, 411, 412, 415, 415, 415] },
};
const WALK_SIDE = [0, 1, 2, 1], WALK_AWAY = [3, 4, 5, 4], STAND = 6;

// ---- Copy (Kyoto from the existing reference; Venice adapted from its Red Sea lesson: draft) ----
const CARDS = [
  { place: 'Kioto', area: 'Claridad financiera', q: '¿Qué quieres mirar hoy sobre tu dinero?', choices: ['Una compra que hice', 'Algo que quiero planear'],
    lessons: ['Empieza por lo que pasó. Una compra concreta te da algo que observar; todavía no demuestra un patrón.', 'Nombra una decisión y el momento para revisarla. Es más útil que una intención general.'],
    keep: ['Taza de Kioto', 'assets/souvenir-cup.png'] },
  { place: 'Venecia', area: 'Confianza en ti', q: '¿Qué cambió desde que elegiste?', choices: ['Cambió la situación', 'Cambié yo'],
    lessons: ['Revisa la condición, no toda la decisión. Si elegiste algo por su horario y el horario cambia, ajusta eso y conserva lo que buscabas.', 'Cambiar una elección no es empezar de cero. Mira qué sigue siendo importante para ti.'],
    keep: ['Velero de Venecia', 'assets/souvenir-boat.png'] },
];

// ---- State ----
let T = 0, paused = false, autoHeld = false, last = 0, loaded = false, sameOutfit = params.get('outfit') === 'same';
const user = [null, null];                 // the visitor's own choice per card (demo only, never stored)
let scale = 1, cam = 0, viewW = W, lastBeat = -1;
const img = {};
const canvas = $('#scene'), ctx = canvas.getContext('2d');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ---- Traveler model ----
const phaseAt = t => clamp((t - T_WALK) * CADENCE, 0, STEPS);
function ground(steps) {                    // steps walked -> ground position (u lateral, z depth)
  const d = steps * STEP;
  if (steps <= STEPS_A) return [U_A + d, 0];
  const e = d - STEPS_A * STEP; return [U_B + dirB[0] * e, dirB[1] * e];
}
function project([u, z]) { const k = DEPTH / (DEPTH + z); return { x: VX + u * k, y: YH + (Y0 - YH) * k, h: H0 * k }; }
function traveler(t) {
  const p = phaseAt(t), n = Math.round(p);
  return { p, n, body: project(ground(p)), foot: project(ground(n)),      // foot = where the planted foot stays
    away: smooth(STEPS_A - .2, STEPS_A + .2, p),                           // side view -> walking-away view
    stand: Math.max(1 - smooth(0, .35, p), smooth(STEPS - .35, STEPS, p)) };
}

// ---- Drawing ----
function cover(image, i) {
  const s = Math.max(SW / image.width, SH / image.height), w = image.width * s, h = image.height * s;
  return { x: SX[i] + (SW - w) / 2, y: SY + (SH - h) * (i === 0 ? .9 : .5), w, h };
}
function drawPose(sheet, meta, cell, foot, body, alpha) {
  if (alpha <= 0) return;
  const sc = body.h / meta.h, hip = body.h * .5, dx = body.x - foot.x, dy = body.y - foot.y;
  const sx = (cell % 3) * CELL, sy = Math.floor(cell / 3) * CELL, ox = -meta.anchor[cell] * sc, oy = -meta.base[cell] * sc, size = CELL * sc;
  ctx.globalAlpha = alpha;
  // Legs: the sole stays on the planted spot while the hips travel (no foot slide between poses).
  ctx.save(); ctx.transform(1, 0, -dx / hip, 1 - dy / hip, foot.x, foot.y);
  ctx.beginPath(); ctx.rect(-body.h, -hip, body.h * 2, hip + body.h * .06); ctx.clip();
  ctx.drawImage(sheet, sx, sy, CELL, CELL, ox, oy, size, size); ctx.restore();
  // Torso and head: travel continuously.
  ctx.save(); ctx.translate(body.x, body.y);
  ctx.beginPath(); ctx.rect(-body.h, -body.h * 1.1, body.h * 2, body.h * 1.1 - hip + .6); ctx.clip();
  ctx.drawImage(sheet, sx, sy, CELL, CELL, ox, oy, size, size); ctx.restore();
  ctx.globalAlpha = 1;
}
function drawTraveler(tr, key) {
  const sheet = img[key + '-sprite'], meta = META[key], { n, foot, body } = tr;
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, 'rgba(10,26,28,.36)'); g.addColorStop(1, 'rgba(10,26,28,0)');
  ctx.save(); ctx.translate(body.x, body.y + body.h * .004); ctx.scale(body.h * .3, body.h * .055); ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fill(); ctx.restore();
  if (tr.stand >= 1) return drawPose(sheet, meta, STAND, body, body, 1);
  if (tr.away < 1) drawPose(sheet, meta, WALK_SIDE[n % 4], foot, body, 1);
  if (tr.away > 0) drawPose(sheet, meta, WALK_AWAY[n % 4], foot, body, tr.away);
  drawPose(sheet, meta, STAND, body, body, tr.stand);
}
const dapples = [[.3, .78, 46], [.62, .86, 58], [.44, .7, 34], [.8, .95, 50], [.18, .93, 40]];
const glints = Array.from({ length: 16 }, (_, i) => { const a = (i * 0.618) % 1, b = (i * 0.381 + .2) % 1; return [.66 + a * .36, .63 + b * .2, i]; });
function ambient(i, t) {
  if (still()) return;
  ctx.save();
  if (i === 0) {                             // Kyoto: leaf light drifting on the path
    ctx.globalCompositeOperation = 'soft-light';
    for (const [fx, fy, r] of dapples) {
      const x = SX[0] + fx * SW + Math.sin(t * .5 + r) * 7, y = SY + fy * SH + Math.cos(t * .37 + r) * 3;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,235,.3)'); g.addColorStop(1, 'rgba(255,255,235,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  } else {                                   // Venice: small glints on the canal only
    ctx.globalCompositeOperation = 'screen';
    for (const [fx, fy, k] of glints) {
      if (fy > .6 + (fx - .52) * .54 - .02) continue;       // keep them on the water, off the pavement
      const a = .5 + .5 * Math.sin(t * 1.3 + k * 2.1); ctx.fillStyle = `rgba(255,248,226,${(.3 * a).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(SX[1] - 26 + fx * 400 + Math.sin(t * .6 + k) * 2, SY + fy * 600, 7, 1.2, 0, 0, 7); ctx.fill();
    }
  }
  ctx.restore();
}
function draw() {
  const dpr = Math.min(2, devicePixelRatio || 1);
  if (canvas.width !== W * dpr) { canvas.width = W * dpr; canvas.height = HT * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, HT);
  const tr = traveler(T);
  ['kyoto', 'venice'].forEach((key, i) => {  // each screen is a window onto the same traveler
    ctx.save(); ctx.beginPath(); ctx.roundRect(SX[i], SY, SW, SH, R); ctx.clip();
    const c = cover(img[key], i); ctx.drawImage(img[key], c.x, c.y, c.w, c.h);
    ambient(i, T);
    drawTraveler(tr, sameOutfit ? 'kyoto' : key);
    ctx.restore();
  });
  return tr;
}

// ---- UI ----
function buildCards() {
  document.querySelectorAll('.card').forEach((el, i) => {
    const c = CARDS[i];
    el.innerHTML = `<p class="where"><span>${c.area}</span><i>${c.place}</i></p><h2>${c.q}</h2>
      <div class="choices">${c.choices.map((x, n) => `<button type="button" data-n="${n}" aria-pressed="false">${x}</button>`).join('')}</div>
      <p class="lesson"><img src="assets/orb.png" alt=""><span></span></p>
      <p class="keep"><img src="${c.keep[1]}" alt=""><span><b>${c.keep[0]}</b>Guardado solo en esta demostración</span></p>`;
    el.querySelectorAll('button').forEach(b => b.onclick = () => { user[i] = +b.dataset.n; paused = true; autoHeld = false; sync(); });
    const hold = () => { if (!paused && !still()) { paused = true; autoHeld = true; sync(); } };
    const release = () => { if (autoHeld && !el.matches(':hover') && !el.contains(document.activeElement)) { autoHeld = false; paused = false; last = performance.now(); sync(); } };
    el.addEventListener('pointerenter', hold); el.addEventListener('focusin', hold);
    el.addEventListener('pointerleave', release); el.addEventListener('focusout', () => setTimeout(release));
  });
}
function cardStage(i) {
  const auto = i === 0 ? (T < 2.6 ? 1 : T < 4.8 ? 2 : 3) : (phaseAt(T) < STEPS - 2 ? 0 : T < T_ARRIVE + 2.8 ? 1 : T < T_ARRIVE + 5.4 ? 2 : 3);
  return user[i] !== null && auto > 0 ? 3 : auto;
}
function sync() {
  const tr = draw(), beat = beatAt(T), ended = T >= T_END - 1e-3;
  document.querySelectorAll('.card').forEach((el, i) => {
    const st = cardStage(i), pick = user[i] ?? (st >= 2 ? 0 : null);
    if (el.dataset.stage !== String(st)) el.dataset.stage = st;
    el.inert = st === 0;
    el.classList.toggle('dim', i === 0 && T > T_WALK + .4);
    el.querySelectorAll('button').forEach((b, n) => b.setAttribute('aria-pressed', n === pick));
    const span = el.querySelector('.lesson span'), text = pick === null ? '' : CARDS[i].lessons[pick];
    if (span.textContent !== text && (text || st < 2)) span.textContent = text;   // lesson text is only ever replaced by the visitor's own choice
  });
  // camera: only pans when both phones do not fit (mobile); it follows her, nothing spins
  cam = viewW >= W ? -(viewW - W) / 2 : clamp(tr.body.x - viewW / 2, 0, W - viewW);
  $('#world').style.transform = `scale(${scale}) translateX(${-cam}px)`;
  const s = still();
  $('#play').textContent = s ? 'Sin animación' : ended ? 'Repetir' : paused ? 'Reproducir' : 'Pausar';
  $('#play').disabled = s; $('#scrub').hidden = s;
  $('#prev').disabled = beat === 0 && T < .05; $('#next').disabled = beat === BEATS.length - 1;
  if (document.activeElement !== $('#scrub')) $('#scrub').value = Math.round(T / T_END * 1000);
  if (beat !== lastBeat) {
    lastBeat = beat; $('#status').textContent = BEATS[beat].say;
    document.querySelectorAll('#steps li').forEach(li => li.classList.toggle('on', +li.dataset.step === BEATS[beat].step));
  }
  canvas.dataset.t = T.toFixed(2);
}
function jump(dir) {                          // manual navigation always wins over autoplay
  const list = still() ? BEATS.filter(b => b.step !== 3) : BEATS, now = beatAt(T);
  const cur = list.reduce((a, b, j) => (BEATS[now].t >= b.t ? j : a), 0);
  const target = dir < 0 && T - list[cur].t > .6 ? cur : clamp(cur + dir, 0, list.length - 1);
  T = list[target].t + .001; paused = true; autoHeld = false; sync();
}
function layout() {
  const stage = $('#stage'), w = stage.clientWidth;
  scale = w >= W ? 1 : clamp(w / (SW + BZ * 2), .6, 1);          // on phones one screen fills the width; it is not a shrunken desktop
  viewW = w / scale; stage.style.height = HT * scale + 'px';
  if (loaded) sync();
}
function frame(now) {
  requestAnimationFrame(frame);
  if (!loaded) return;
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  if (paused || still()) { if (!still() && !document.hidden) draw(); return; }  // paused: scenery keeps breathing, she does not move
  T = Math.min(T_END, T + dt); if (T >= T_END) paused = true;
  sync();
}

// ---- Boot ----
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(src)); i.src = src; });
try {
  const names = ['kyoto', 'venice', 'kyoto-sprite', 'venice-sprite'];
  (await Promise.all(names.map(n => load(`assets/${n}.webp`)))).forEach((im, i) => img[names[i]] = im);
  buildCards();
  document.documentElement.dataset.motion = still() ? 'off' : 'on';
  if (params.has('t')) { T = clamp(+params.get('t') || 0, 0, T_END); paused = true; }
  if (still()) paused = true;
  $('#world').hidden = false; $('#controls').hidden = false; $('#proto').hidden = false; $('#outfit').checked = !sameOutfit;
  document.documentElement.classList.add('ready'); loaded = true;
  $('#play').onclick = () => { if (T >= T_END - 1e-3) { T = 0; user[0] = user[1] = null; } paused = !paused; autoHeld = false; last = performance.now(); sync(); };
  $('#replay').onclick = () => { T = 0; user[0] = user[1] = null; paused = still(); autoHeld = false; last = performance.now(); sync(); };
  $('#prev').onclick = () => jump(-1); $('#next').onclick = () => jump(1);
  $('#scrub').oninput = e => { T = e.target.value / 1000 * T_END; paused = true; autoHeld = false; sync(); };
  $('#outfit').onchange = e => { sameOutfit = !e.target.checked; sync(); };
  $('#stage').addEventListener('keydown', e => { if (e.target.closest('.card')) return; if (e.key === 'ArrowRight') jump(1); if (e.key === 'ArrowLeft') jump(-1); });
  mq.addEventListener('change', () => { document.documentElement.dataset.motion = still() ? 'off' : 'on'; paused = true; if (still()) T = BEATS[beatAt(T)].step === 3 ? T_ARRIVE : T; sync(); });
  new ResizeObserver(layout).observe($('#stage'));
  layout(); sync(); last = performance.now(); requestAnimationFrame(frame);
  window.__crossing = { get T() { return T; }, set T(v) { T = v; paused = true; sync(); }, traveler: () => traveler(T), get paused() { return paused; }, T_WALK, T_ARRIVE, T_END, SX, SW, STEP };
} catch (err) {
  $('#status').textContent = 'La animación no pudo cargarse. La imagen resume la escena y los enlaces de arriba siguen funcionando.';
  console.error(err);
}
