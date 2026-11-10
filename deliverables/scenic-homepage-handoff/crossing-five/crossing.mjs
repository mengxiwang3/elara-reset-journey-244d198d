// Elara crossing prototype, five phones: ONE traveler, one timeline, one straight path.
// Every phone is a window of a different size onto the same world. The phones vary; her
// ground line does not. Everything drawn is a pure function of T (seconds), so pausing,
// scrubbing and jumping can never create a second traveler or teleport her.

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const mq = matchMedia('(prefers-reduced-motion: reduce)');
const still = () => mq.matches || params.get('motion') === '0';
if (params.has('shot')) document.documentElement.classList.add('shot');

// ---- Geometry (world px) ----
const HT = 640, Y0 = 574, H0 = 214;                      // stage height, shared foot line, body height
const STEP = .218 * H0, CADENCE = 1.9, LEG = 5;          // half a stride (measured from the sprite), steps/s, steps between phones
const PITCH = LEG * STEP;                                // distance between phone centres = a whole number of steps
const WL = 300, HL = 596, WS = 216, HS = 430;            // focused / resting phone size, before each phone's own multiplier
const PHONES = [                                         // m = size multiplier, ob = how far its bottom edge sits off the common line
  { key: 'kyoto',  m: 1,    ob: 0 },
  { key: 'venice', m: .95,  ob: -12 },
  { key: 'andes',  m: 1.03, ob: 8 },
  { key: 'mexico', m: .96,  ob: -6 },
  { key: 'redsea', m: .92,  ob: 10 },
].map((p, i) => ({ ...p, cx: i * PITCH, bottom: 620 + p.ob }));
const STOPS = 4;                                         // she walks the first four; the Red Sea only peeks in (see NOTES.md)

// ---- Timeline ----
const DWELL = 4.6, WALKT = LEG / CADENCE, SEG = DWELL + WALKT, T_END = (STOPS - 1) * SEG + DWELL + 1;
const CARDS = [
  { place: 'Kioto, Japón', area: 'Claridad financiera', q: '¿Qué quieres mirar hoy sobre tu dinero?',
    lesson: 'Empieza por una compra concreta. Te da algo que observar; todavía no demuestra un patrón.', keep: ['Taza de Kioto', 'souvenir-cup'] },
  { place: 'Venecia, Italia', area: 'Ritmo diario', q: '¿Qué momento de tu día quieres cuidar?',
    lesson: 'Elige un momento que ya existe y ponle una sola acción pequeña. Se sostiene mejor que una rutina nueva.', keep: ['Velero de Venecia', 'souvenir-boat'] },
  { place: 'Machu Picchu, Perú', area: 'Encontrar tu propósito', q: '¿Qué te gustaría probar?',
    lesson: 'Una prueba, no una decisión para siempre. Prueba una parte pequeña antes de comprometerte con todo.', keep: ['Cantimplora de los Andes', 'souvenir-flask'] },
  { place: 'Ciudad de México', area: 'Amor y límites', q: '¿Qué te gustaría conversar?',
    lesson: 'Una pregunta puede abrir una conversación. Tú eliges qué compartir.', keep: ['Pulsera tejida', 'souvenir-bracelet'] },
];
const BEATS = [];
CARDS.forEach((c, i) => {
  const t0 = i * SEG, name = c.place.split(',')[0];
  BEATS.push({ t: t0, say: `${name}. Al llegar, una pregunta sobre ${c.area.toLowerCase()}.` },
    { t: t0 + 1.5, say: `${name}. Una herramienta que puedes usar hoy.` },
    { t: t0 + 3, say: `${name}. Un recuerdo para tu colección.` });
  if (i < STOPS - 1) BEATS.push({ t: t0 + DWELL, walk: true, say: `Sigue caminando: de ${name} a ${CARDS[i + 1].place.split(',')[0]}.` });
});
const beatAt = t => { let i = 0; BEATS.forEach((b, j) => { if (t >= b.t - 1e-6) i = j; }); return i; };

// ---- Sprite metrics, measured from the sheets (3x3 grid of 418px cells) ----
const CELL = 418;
const META = {
  kyoto:  { h: 391, anchor: [216, 211, 222, 212, 208, 211, 225], base: [408, 406, 407, 405, 402, 406, 410] },
  venice: { h: 404, anchor: [207, 195, 225, 207, 188, 223, 204], base: [416, 415, 416, 412, 411, 412, 415] },
  andes:  { h: 387, anchor: [214, 202, 218, 219, 208, 212, 223], base: [402, 403, 405, 404, 400, 404, 410] },
  mexico: { h: 387, anchor: [213, 202, 218, 219, 207, 213, 222], base: [403, 405, 404, 403, 405, 405, 410] },
};
const WALK_SIDE = [0, 1, 2, 1], STAND = 6;

// ---- State ----
let T = 0, paused = false, last = 0, loaded = false, sameOutfit = params.get('outfit') === 'same';
let scale = 1, viewW = 900, lastBeat = -1;
const img = {};
const canvas = $('#scene'), ctx = canvas.getContext('2d');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ---- Traveler model: time -> steps walked -> one ground position ----
function traveler(t) {
  const k = clamp(Math.floor(t / SEG), 0, STOPS - 1), pp = k === STOPS - 1 ? 0 : clamp((t - k * SEG - DWELL) * CADENCE, 0, LEG);
  const p = k * LEG + pp, n = Math.round(p);
  return { p, n, body: { x: p * STEP, y: Y0, h: H0 }, foot: { x: n * STEP, y: Y0, h: H0 },   // foot = where the planted foot stays
    stand: Math.max(1 - smooth(0, .35, pp), smooth(LEG - .35, LEG, pp)) };
}
function windowOf(ph, hx) {                              // the phone's glass, for where she is now
  const f = clamp(1 - Math.abs(hx - ph.cx) / PITCH, 0, 1), w = ph.m * (WS + (WL - WS) * f), h = ph.m * (HS + (HL - HS) * f);
  return { f, x: ph.cx - w / 2, y: ph.bottom - h, w, h, r: w * .15 };
}

// ---- Drawing ----
function drawPose(sheet, meta, cell, foot, body, alpha) {
  if (alpha <= 0) return;
  const sc = body.h / meta.h, hip = body.h * .5, dx = body.x - foot.x;
  const sx = (cell % 3) * CELL, sy = Math.floor(cell / 3) * CELL, ox = -meta.anchor[cell] * sc, oy = -meta.base[cell] * sc, size = CELL * sc;
  ctx.globalAlpha = alpha;
  // Legs: the sole stays on the planted spot while the hips travel (no foot slide between poses).
  ctx.save(); ctx.transform(1, 0, -dx / hip, 1, foot.x, foot.y);
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
  drawPose(sheet, meta, WALK_SIDE[n % 4], foot, body, 1);
  drawPose(sheet, meta, STAND, body, body, tr.stand);
}
function camera(tr) { return tr.body.x - viewW * (viewW > 700 ? .42 : .5); }   // the camera follows her; nothing spins
function draw() {
  const dpr = Math.min(2, devicePixelRatio || 1), cw = Math.round(viewW * scale * dpr), ch = Math.round(HT * scale * dpr);
  if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
  const tr = traveler(T), cam = camera(tr);
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0); ctx.clearRect(0, 0, viewW, HT); ctx.translate(-cam, 0);
  const wins = PHONES.map(ph => ({ ph, ...windowOf(ph, tr.body.x) })).sort((a, b) => a.f - b.f);   // nearest phone is drawn last, in front
  for (const w of wins) {
    if (w.x + w.w < cam - 40 || w.x > cam + viewW + 40) continue;
    const ph = w.ph, plate = img[ph.key], PW = WL * ph.m, PH = HL * ph.m;
    ctx.save(); ctx.shadowColor = `rgba(12,42,49,${(.16 + .16 * w.f).toFixed(3)})`; ctx.shadowBlur = 14 + 18 * w.f; ctx.shadowOffsetY = 6 + 8 * w.f;
    ctx.fillStyle = '#0c2a31'; ctx.beginPath(); ctx.roundRect(w.x, w.y, w.w, w.h, w.r); ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.roundRect(w.x, w.y, w.w, w.h, w.r); ctx.clip();
    // The scenery is fixed in the world; a smaller phone simply shows less of it.
    const s = Math.max(PW / plate.width, PH / plate.height), iw = plate.width * s, ih = plate.height * s;
    ctx.drawImage(plate, ph.cx - iw / 2, ph.bottom - ih, iw, ih);
    if (META[ph.key] && Math.abs(tr.body.x - ph.cx) < PITCH + H0) drawTraveler(tr, sameOutfit ? 'kyoto' : ph.key);
    if (w.f < 1) { ctx.fillStyle = `rgba(242,247,250,${(.3 * (1 - w.f)).toFixed(3)})`; ctx.fillRect(w.x, w.y, w.w, w.h); }
    ctx.restore();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#0c2a31'; ctx.beginPath(); ctx.roundRect(w.x + 1.25, w.y + 1.25, w.w - 2.5, w.h - 2.5, w.r - 1.25); ctx.stroke();
    ctx.fillStyle = '#0c2a31'; ctx.beginPath(); ctx.roundRect(ph.cx - w.w * .15, w.y + w.w * .045, w.w * .3, w.w * .085, w.w * .05); ctx.fill();
  }
  return { tr, cam };
}

// ---- UI ----
function buildCards() {
  $('#cards').innerHTML = CARDS.map((c, i) => {
    const ph = PHONES[i], w = WL * ph.m - 30;
    return `<article class="card" data-card="${i}" data-stage="0" style="left:${ph.cx - w / 2}px;top:${ph.bottom - HL * ph.m + WL * ph.m * .17}px;width:${w}px">
      <p class="where">${c.place}</p><h2>${c.area}</h2><p class="q">${c.q}</p>
      <p class="lesson"><img src="assets/orb.png" alt=""><span>${c.lesson}</span></p>
      <p class="keep"><img src="assets/${c.keep[1]}.png" alt=""><span><b>${c.keep[0]}</b>Un recuerdo de este lugar</span></p></article>`;
  }).join('') + (() => { const ph = PHONES[4]; return `<p class="next" id="nextchip" style="left:${ph.cx - 84}px;top:${ph.bottom - HS * ph.m + 44}px">Próximo destino<b>Mar Rojo</b><i>Confianza en ti</i></p>`; })();
}
function cardStage(i) {
  const local = T - i * SEG;
  if (local < -.25 || (i < STOPS - 1 && local > DWELL + .3)) return 0;
  return local < 1.5 ? 1 : local < 3 ? 2 : 3;
}
function sync() {
  const { cam } = draw(), beat = beatAt(T), ended = T >= T_END - 1e-3;
  $('#cards').style.transform = `scale(${scale}) translateX(${-cam}px)`;
  document.querySelectorAll('.card').forEach((el, i) => { const st = String(cardStage(i)); if (el.dataset.stage !== st) el.dataset.stage = st; });
  $('#nextchip').classList.toggle('on', T > (STOPS - 1) * SEG + .4);
  const s = still();
  $('#play').textContent = s ? 'Sin animación' : ended ? 'Repetir' : paused ? 'Reproducir' : 'Pausar';
  $('#play').disabled = s; $('#scrub').hidden = s;
  $('#prev').disabled = beat === 0 && T < .05; $('#next').disabled = beat === BEATS.length - 1;
  if (document.activeElement !== $('#scrub')) $('#scrub').value = Math.round(T / T_END * 1000);
  if (beat !== lastBeat) { lastBeat = beat; $('#status').textContent = BEATS[beat].say; }
  canvas.dataset.t = T.toFixed(2);
}
function jump(dir) {                          // manual navigation always wins over autoplay
  const list = still() ? BEATS.filter(b => !b.walk) : BEATS, now = beatAt(T);
  const cur = list.reduce((a, b, j) => (BEATS[now].t >= b.t ? j : a), 0);
  const target = dir < 0 && T - list[cur].t > .6 ? cur : clamp(cur + dir, 0, list.length - 1);
  T = list[target].t + .001; paused = true; sync();
}
function layout() {
  const stage = $('#stage'), w = stage.clientWidth;
  scale = clamp(w / 400, .6, 1);              // on a phone one screen fills most of the width and the next one peeks in
  viewW = w / scale; stage.style.height = HT * scale + 'px';
  if (loaded) sync();
}
function frame(now) {
  requestAnimationFrame(frame);
  if (!loaded) return;
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  if (paused || still()) return;
  T = Math.min(T_END, T + dt); if (T >= T_END) paused = true;
  sync();
}

// ---- Boot ----
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(src)); i.src = src; });
try {
  const names = [...PHONES.map(p => p.key), ...Object.keys(META).map(k => k + '-sprite')];
  (await Promise.all(names.map(n => load(`assets/${n}.webp`)))).forEach((im, i) => img[names[i]] = im);
  buildCards();
  document.documentElement.dataset.motion = still() ? 'off' : 'on';
  if (params.has('t')) { T = clamp(+params.get('t') || 0, 0, T_END); paused = true; }
  if (still()) paused = true;
  $('#world').hidden = false; $('#controls').hidden = false; $('#proto').hidden = false; $('#outfit').checked = !sameOutfit;
  document.documentElement.classList.add('ready'); loaded = true;
  $('#play').onclick = () => { if (T >= T_END - 1e-3) T = 0; paused = !paused; last = performance.now(); sync(); };
  $('#replay').onclick = () => { T = 0; paused = still(); last = performance.now(); sync(); };
  $('#prev').onclick = () => jump(-1); $('#next').onclick = () => jump(1);
  $('#scrub').oninput = e => { T = e.target.value / 1000 * T_END; paused = true; sync(); };
  $('#outfit').onchange = e => { sameOutfit = !e.target.checked; sync(); };
  $('#stage').addEventListener('keydown', e => { if (e.key === 'ArrowRight') jump(1); if (e.key === 'ArrowLeft') jump(-1); });
  mq.addEventListener('change', () => { document.documentElement.dataset.motion = still() ? 'off' : 'on'; paused = true; if (still() && BEATS[beatAt(T)].walk) T = BEATS[beatAt(T) + 1].t; sync(); });
  new ResizeObserver(layout).observe($('#stage'));
  layout(); sync(); last = performance.now(); requestAnimationFrame(frame);
  window.__crossing = { get T() { return T; }, set T(v) { T = v; paused = true; sync(); }, traveler: () => traveler(T), get paused() { return paused; }, T_END, SEG, DWELL, STEP, PHONES };
} catch (err) {
  $('#status').textContent = 'La animación no pudo cargarse. La imagen resume la escena y los enlaces siguen funcionando.';
  console.error(err);
}
