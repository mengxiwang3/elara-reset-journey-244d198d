/* Money journey v2: panel shell, upgraded days (W1 D4, W2 D11) and the generic renderer for every other day. */
(function () {
  'use strict';
  var MJ = window.MJ, X = window.MJ2, C = X.COMMON, D = X.D;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function PX(id, why, es, en) { if (!X.PROPOSED.some(function (p) { return p.id === id; })) X.PROPOSED.push({ id: id, why: why, es: es, en: en }); return { es: es, en: en }; }

  var KEY = 'mj2.v1';
  var S = { lang: 'es', w: 1, d: 4, view: 'arrive', i: 0, panel: 'answer', small: false, fs: false, tip: false, help: false, fromSummary: false, voice: { state: 'idle', interim: '' }, saved: null, confirmRestart: false, sceneUrl: '' };
  var A = {}, STATUS = {};
  try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); A = o.A || {}; STATUS = o.S || {}; } } catch (e) {}

  /* ───────── helpers ───────── */
  function L(o) { return o == null ? '' : (typeof o === 'string' ? o : (o[S.lang] || o.es || '')); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tpl(s, m) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return m[k] != null ? m[k] : ''; }); }
  function lc(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  /* Weeks 6-9 read their questions from the 210-day curriculum (cur.js) when it is loaded: five weeks per area,
     picked with S.cw. `?copy=draft` brings back the earlier North America draft (na.js) for week 6. */
  function curWeek() { return (window.CUR_FOR && !window.CUR_OFF) ? window.CUR_FOR(S.w, S.cw || 1) : null; }
  function QW() { return curWeek() || (S.w === 6 ? window.NA : null); }
  function isCur() { return !!curWeek(); }
  function isNA() { return S.w >= 6 && !!QW(); }
  function dayNo() { return isCur() ? S.w * 1000 + (S.cw || 1) * 10 + S.d : isNA() ? 600 + S.d : S.w >= 6 ? 28 + S.d : (S.w - 1) * 7 + S.d; } // week 6 (North America) borrows week 5 copy until it has its own
  function key(n, id) { return n + '.' + id; }
  function get(n, id) { return A[key(n, id)] || (A[key(n, id)] = {}); }
  function peek(n, id) { return A[key(n, id)] || {}; }
  var ES = function () { return S.lang === 'es'; };
  function fmtN(n) { return new Intl.NumberFormat(ES() ? 'es' : 'en', { maximumFractionDigits: 2 }).format(n); }
  function plural(n, es1, esN, en1, enN) { return ES() ? (n === 1 ? es1 : esN) : (n === 1 ? en1 : enN); }
  var ORB = '<img src="img/orb.webp" alt="" width="24" height="24">';

  /* amounts: locale aware, no currency assumed */
  function parseAmt(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) return { empty: true };
    s = s.replace(/[\s ]/g, '').replace(/^[^\d]+/, '').replace(/[^\d]+$/, '');
    if (!/^\d[\d.,]*$/.test(s)) return { bad: true };
    var dots = (s.match(/\./g) || []).length, commas = (s.match(/,/g) || []).length, dec = null;
    if (dots && commas) { dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ','; }
    else if (dots || commas) {
      var sep = dots ? '.' : ',', cnt = dots || commas, parts = s.split(sep);
      if (cnt > 1) { dec = null; if (!parts.slice(1).every(function (p) { return p.length === 3; })) return { bad: true }; }
      else if (parts[1].length === 3) { var th = ES() ? '.' : ','; dec = sep === th ? null : sep; }
      else dec = sep;
    }
    var t;
    if (dec) { var other = dec === '.' ? ',' : '\\.'; t = s.replace(new RegExp(other, 'g'), '').replace(dec, '.'); }
    else t = s.replace(/[.,]/g, '');
    var v = parseFloat(t);
    if (!isFinite(v) || v < 0 || v > 1e9) return { bad: true };
    return { ok: true, v: v };
  }
  /* dates: only real calendar dates; estimated and unknown stay what they are */
  function parseISO(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); if (!m) return null; var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); return (d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]) ? d : null; }
  function today() { var n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); }
  function validateDate(v) { var d = parseISO(v); if (!d) return { bad: true }; var diff = (d - today()) / 864e5; if (diff < -366 || diff > 800) return { far: true }; return { ok: true, d: d }; }
  function fmtDate(d) { return d.toLocaleDateString(ES() ? 'es' : 'en', { day: 'numeric', month: 'long', timeZone: 'UTC' }); }
  function dateErr(dw) {
    if (!dw || dw.mode !== 'confirmed') return null;
    var r = validateDate(dw.value);
    if (r.bad) return L(X.DATE.bad); if (r.far) return L(X.DATE.far); return null;
  }
  function dateKind(dw) {
    if (!dw || !dw.mode) return { k: 'none' };
    if (dw.mode === 'unknown') return { k: 'u' };
    if (dw.mode === 'approx') return dw.window ? { k: 'a', win: dw.window } : { k: 'none' };
    var r = validateDate(dw.value); return r.ok ? { k: 'c', d: r.d } : { k: 'none' };
  }
  function winLabel(id) { var w = X.DATE.windows.filter(function (x) { return x.id === id; })[0]; return w ? lc(L(w.label)) : ''; }
  function describeDate(dw) {
    var k = dateKind(dw);
    if (k.k === 'c') return fmtDate(k.d);
    if (k.k === 'a') return (ES() ? 'aproximadamente ' : 'approximately ') + winLabel(k.win);
    if (k.k === 'u') return ES() ? 'no se sabe' : 'unknown';
    return '';
  }

  /* ───────── persistence (shows "saved" only when read-back matches) ───────── */
  var saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { var j = JSON.stringify({ A: A, S: STATUS }); localStorage.setItem(KEY, j); S.saved = (localStorage.getItem(KEY) === j); }
      catch (e) { S.saved = false; }
      var el = $('#savedline'); if (el) el.textContent = savedText();
    }, 250);
  }
  function savedText() { return S.saved === true ? (ES() ? 'Guardado en este navegador.' : 'Saved in this browser.') : (S.saved === false ? (ES() ? 'No se pudo guardar en este navegador.' : 'Could not save in this browser.') : ''); }

  /* ───────── scene ───────── */
  MJ.worlds.push({ es: 'Norteamérica · Propósito y crecimiento', en: 'North America · Purpose & growth', stops: [{ es: 'El lago', en: 'The lake' }, { es: 'El valle', en: 'The valley' }, { es: 'El puente', en: 'The bridge' }, { es: 'El cañón', en: 'The canyon' }, { es: 'Las azoteas', en: 'The rooftops' }, { es: 'La costa', en: 'The coast' }, { es: 'La ciudad alta', en: 'The upper town' }] });
  var LEGS = { 1: 'd1-muelle', 2: 'd2-niebla', 3: 'd3-balsas', 4: 'd4-cueva', 5: 'd5-laguna', 6: 'd6-pueblo' };
  var ASP = { 'd2-niebla': 2.668 };
  function sceneKey() {
    if (S.w === 1 && LEGS[S.d]) return LEGS[S.d];
    var order = ['d1-muelle', 'd3-balsas', 'd4-cueva', 'd5-laguna', 'd2-niebla']; // provisional landscapes for days without their own art yet
    return order[(dayNo() - 1) % 5];
  }
  var WKP = {
    2: { es: 'Wuzhen, Zhejiang, China', en: 'Wuzhen, Zhejiang, China' },
    3: { es: 'Terrazas de Yuanyang, Yunnan, China', en: 'Yuanyang rice terraces, Yunnan, China' },
    4: { es: 'Arashiyama, Kioto, Japón', en: 'Arashiyama, Kyoto, Japan' },
    5: { es: 'Zhangjiajie, Hunan, China', en: 'Zhangjiajie, Hunan, China' }
  };
  var WKD = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 7]]; // six scenes per week, one per day (days 6-7 share the last)
  var WKD7 = { 2: 1, 3: 1, 4: 1, 5: 1 }; // weeks whose day 7 has its own scene (w?-7)
  var WK = {};
  [2, 3, 4, 5].forEach(function (w) { WK[w] = WKD.map(function (d, i) { return { img: 'w' + w + '-' + (i + 1), fy: 0.5, ar: 2.4, days: (WKD7[w] && i === 5) ? [6, 6] : d, place: WKP[w] }; }); if (WKD7[w]) WK[w].push({ img: 'w' + w + '-7', fy: 0.5, ar: 2.4, days: [7, 7], place: w === 4 ? { es: 'Kioto, Japón', en: 'Kyoto, Japan' } : WKP[w] }); });
  MJ.worlds.push({ es: 'Europa · Valor propio y placer', en: 'Europe · Self-worth & pleasure', stops: [{ es: 'Los tejados', en: 'The rooftops' }, { es: 'El valle', en: 'The valley' }, { es: 'El canal', en: 'The canal' }, { es: 'El puente', en: 'The bridge' }, { es: 'La escalera', en: 'The stairs' }] });
  MJ.worlds.push({ es: 'Sudamérica · Amor y conexión', en: 'South America · Love & connection', stops: [{ es: 'Las ruinas', en: 'The ruins' }, { es: 'La bahía', en: 'The bay' }, { es: 'Las lagunas', en: 'The lagoons' }, { es: 'El lago', en: 'The lake' }, { es: 'La calle', en: 'The street' }] });
  MJ.worlds.push({ es: 'África · Bienestar y calma', en: 'Africa · Wellbeing & grounding', stops: [{ es: 'Las pirámides', en: 'The pyramids' }, { es: 'Las cataratas', en: 'The falls' }, { es: 'La calle antigua', en: 'The old street' }, { es: 'El delta', en: 'The delta' }, { es: 'La sabana', en: 'The savanna' }, { es: 'La costa', en: 'The coast' }, { es: 'La medina', en: 'The medina' }] });
  MJ.worlds.push({ es: 'Oceanía · Ritmo diario', en: 'Oceania · Daily rhythm', stops: [{ es: 'El amanecer', en: 'Dawn' }, { es: 'La mañana', en: 'Morning' }, { es: 'Media mañana', en: 'Late morning' }, { es: 'El mediodía', en: 'Midday' }, { es: 'La hora dorada', en: 'Golden hour' }, { es: 'El atardecer', en: 'Dusk' }, { es: 'La noche', en: 'Night' }] });
  // Oceania (Daily Rhythm): one time of day per day, dawn to night. Spares not used: sp-oc-koala, sp-oc-gulls, sp-oc-apostles.
  WK[10] = [
    { img: 'w10-1', ar: 2.4, days: [1, 1], place: { es: 'Uluru-Kata Tjuta, Territorio del Norte, Australia', en: 'Uluru-Kata Tjuta, Northern Territory, Australia' } },
    { img: 'w10-2', v: 1, ar: 809 / 1942, days: [2, 2], place: { es: 'Bahía de Sídney, Australia', en: 'Sydney Harbour, Australia' } },
    { img: 'w10-3', v: 1, ar: 809 / 1942, days: [3, 3], place: { es: 'Gran Barrera de Coral, Queensland, Australia', en: 'Great Barrier Reef, Queensland, Australia' } },
    { img: 'w10-4', ar: 1918 / 820, days: [4, 4], place: { es: 'Las Tres Hermanas, Montañas Azules, Australia', en: 'The Three Sisters, Blue Mountains, Australia' } },
    { img: 'w10-5', ar: 2.4, days: [5, 5], place: { es: 'Cordillera Flinders, Australia Meridional', en: 'Flinders Ranges, South Australia' } },
    { img: 'w10-6', v: 1, ar: 809 / 1942, days: [6, 6], place: { es: 'Milford Sound, Nueva Zelanda', en: 'Milford Sound, New Zealand' } },
    { img: 'w10-7', v: 1, ar: 809 / 1942, days: [7, 7], place: { es: 'Bay of Fires, Tasmania, Australia', en: 'Bay of Fires, Tasmania, Australia' } }];
  WK[9] = [
    { img: 'w9-1', v: 1, ar: 809 / 1942, days: [1, 1], place: { es: 'Giza, Egipto', en: 'Giza, Egypt' } },
    { img: 'w9-2', ar: 2.4, days: [2, 2], place: { es: 'Cataratas Victoria, Zambia y Zimbabue', en: 'Victoria Falls, Zambia and Zimbabwe' } },
    { img: 'w9-3', v: 1, ar: 809 / 1942, days: [3, 3], place: { es: 'Stone Town, Zanzíbar, Tanzania', en: 'Stone Town, Zanzibar, Tanzania' } },
    { img: 'w9-4', v: 1, ar: 809 / 1942, days: [4, 4], place: { es: 'Delta del Okavango, Botsuana', en: 'Okavango Delta, Botswana' } },
    { img: 'w9-5', ar: 2.4, days: [5, 5], place: { es: 'Kilimanjaro, Tanzania', en: 'Kilimanjaro, Tanzania' } },
    { img: 'w9-6', v: 1, ar: 809 / 1942, days: [6, 6], place: { es: 'Costa de las Seychelles', en: 'Seychelles coast' } },
    { img: 'w9-7', v: 1, ar: 809 / 1942, days: [7, 7], place: { es: 'Marrakech, Marruecos', en: 'Marrakesh, Morocco' } }];
  WK[8] = [
    { img: 'w8-1', v: 1, ar: 809 / 1942, days: [1, 1], place: { es: 'Machu Picchu, Perú', en: 'Machu Picchu, Peru' } },
    { img: 'w8-2', ar: 2.4, days: [2, 2], place: { es: 'Bahía de Río de Janeiro, Brasil', en: 'Rio de Janeiro bay, Brazil' } },
    { img: 'w8-3', v: 1, ar: 809 / 1942, days: [3, 3], place: { es: 'Lençóis Maranhenses, Brasil', en: 'Lençóis Maranhenses, Brazil' } },
    { img: 'w8-4', ar: 2.4, days: [4, 4], place: { es: 'Torres del Paine, Chile', en: 'Torres del Paine, Chile' } },
    { img: 'w8-5', v: 1, ar: 809 / 1942, days: [5, 5], place: { es: 'Cartagena de Indias, Colombia', en: 'Cartagena, Colombia' } },
    { img: 'w8-6', v: 1, ar: 809 / 1942, days: [6, 6], place: { es: 'Cataratas del Iguazú, Argentina y Brasil', en: 'Iguazú Falls, Argentina and Brazil' } },
    { img: 'w8-7', v: 1, ar: 809 / 1942, days: [7, 7], place: { es: 'Buenos Aires, Argentina', en: 'Buenos Aires, Argentina' } }];
  WK[7] = [
    { img: 'w7-1', v: 1, ar: 809 / 1942, days: [1, 1], place: { es: 'París, Francia', en: 'Paris, France' } },
    { img: 'w7-2', ar: 2.4, days: [2, 2], place: { es: 'Lauterbrunnen, Suiza', en: 'Lauterbrunnen, Switzerland' } },
    { img: 'w7-3', v: 1, ar: 809 / 1942, days: [3, 3], place: { es: 'Venecia, Italia', en: 'Venice, Italy' } },
    { img: 'w7-4', v: 1, ar: 809 / 1942, days: [4, 4], place: { es: 'Ámsterdam, Países Bajos', en: 'Amsterdam, Netherlands' } },
    { img: 'w7-5', v: 1, ar: 809 / 1942, days: [5, 5], place: { es: 'Santorini, Grecia', en: 'Santorini, Greece' } },
    { img: 'w7-6', ar: 1942 / 809, days: [6, 6], place: { es: 'Castillo de Edimburgo, Escocia', en: 'Edinburgh Castle, Scotland' } },
    { img: 'w7-7', v: 1, ar: 809 / 1942, days: [7, 7], place: { es: 'Geirangerfjord, Noruega', en: 'Geirangerfjord, Norway' } }];
  WK[6] = [
    { img: 'w6-1', v: 1, ar: 809 / 1942, days: [1, 1], place: { es: 'Lago Moraine, Banff, Canadá', en: 'Moraine Lake, Banff, Canada' } },
    { img: 'w6-2', ar: 2.4, days: [2, 2], place: { es: 'Valle de Yosemite, California, EE. UU.', en: 'Yosemite Valley, California, USA' } },
    { img: 'w6-3', v: 1, ar: 809 / 1942, days: [3, 3], place: { es: 'Puente Golden Gate, San Francisco, EE. UU.', en: 'Golden Gate Bridge, San Francisco, USA' } },
    { img: 'w6-4', ar: 2.4, days: [4, 4], place: { es: 'Gran Cañón, Arizona, EE. UU.', en: 'Grand Canyon, Arizona, USA' } },
    { img: 'w6-5', v: 1, ar: 809 / 1942, days: [5, 5], place: { es: 'Azoteas de Manhattan, Nueva York, EE. UU.', en: 'Manhattan rooftops, New York, USA' } },
    { img: 'w6-6', ar: 2.4, days: [6, 6], place: { es: 'Puente Bixby, Big Sur, California, EE. UU.', en: 'Bixby Bridge, Big Sur, California, USA' } },
    { img: 'w6-7', v: 1, ar: 809 / 1942, days: [7, 7], place: { es: 'Ciudad de Quebec, Canadá', en: 'Quebec City, Canada' } }]; // alternates portrait (slides up) and landscape (slides sideways)
  function seg() { if (S.w === 1) return null; return (WK[S.w] || []).filter(function (x) { return S.d >= x.days[0] && S.d <= x.days[1]; })[0] || null; }
  function placeName() { var g = seg(); return g ? L(g.place) : worldName() + (S.w === 1 ? ', Vietnam' : ''); }
  function stopName() { var w = MJ.worlds[S.w - 1], s = w.stops[S.d - 1]; return s ? (s[S.lang] || s.en) : ''; }
  function worldName() { var w = MJ.worlds[S.w - 1]; return w[S.lang] || w.en; }

  /* ───────── steps registry ───────── */
  function ctxSel() { return peek(4, 'ctx').sel || []; }
  function d4Personal() { return ctxSel().indexOf('none') < 0; }
  function stepsFor(n) {
    if (n === 4) {
      var s = [D[4].ctx, D[4].sort];
      if (d4Personal()) s.push(D[4].closest, D[4].fact, D[4].kind);
      return s;
    }
    if (isNA() && n > 600) return QW()[S.d - 1].steps.map(function (x) { return { id: x.id, type: 'na', raw: x, optional: true }; });
    if (n === 11) return [D[11].before, D[11].matters, D[11].teach, D[11].ask, D[11].carry];
    var day = MJ[S.lang][n - 1];
    return Object.keys(day.steps || {}).map(function (k) { var st = day.steps[k]; return { id: k, type: 'gen', raw: st, optional: true }; });
  }
  function isUp(n) { return n === 4 || n === 11; }
  function curSteps() { return stepsFor(dayNo()); }

  /* ───────── layout, panel, scene ───────── */
  function isFull() { return window.innerWidth <= 430; }
  function layout() {
    var ph = $('#ph');
    ph.className = 'phone' + (S.small && !isFull() ? ' s320' : '') + (isFull() ? ' full' : '') + (document.documentElement.classList.contains('nomo') ? '' : '');
    if (isFull() && window.visualViewport) ph.style.setProperty('--vvh', window.visualViewport.height + 'px');
    S.W = ph.clientWidth; S.H = ph.clientHeight;
    if (!S.H0 || S.W !== S.W0) { S.H0 = S.H; S.W0 = S.W; }
    var strip = S.small ? 100 : 124;
    S.sceneH = S.H0; /* the scene runs the full height of the phone and the panel sits over it */
    S.stripH = strip;
    ph.style.setProperty('--sceneH', S.sceneH + 'px');
  }
  function expandedMax() { return Math.round(Math.min(S.H * 0.92, S.H - 64)); }
  /* The panel is as tall as its content, so the scene gets every spare pixel (no empty cream). */
  function naturalH() {
    var dz = $('.dragzone'), body = $('.pbody'), foot = $('.pfoot'); if (!body) return 0;
    var keep = [body.style.flex, body.style.height, body.style.overflow];
    body.style.flex = 'none'; body.style.height = 'auto'; body.style.overflow = 'visible';
    var h = (dz ? dz.offsetHeight : 60) + body.offsetHeight + (foot ? foot.offsetHeight : 70) + 6;
    body.style.flex = keep[0]; body.style.height = keep[1]; body.style.overflow = keep[2];
    return h;
  }
  function answerH() { var nat = naturalH(); return Math.round(Math.max(Math.min(nat, S.H * ((S.small || S.fs) ? 0.8 : 0.6)), Math.min(S.H * 0.16, expandedMax()))); }
  function expandedH() { return Math.round(Math.min(Math.max(naturalH(), answerH()), expandedMax())); }
  function targetH() { return S.panel === 'landscape' ? S.stripH : (S.panel === 'expanded' ? expandedH() : answerH()); }
  function applyH(anim) {
    var w = $('.panelwrap'); if (!w) return;
    if (anim === false) w.classList.remove('anim'); else w.classList.add('anim');
    w.style.setProperty('--ph', targetH() + 'px');
  }
  function setPanel(mode) { S.panel = mode; render(true); }
  function drawScene(animate) {
    var sc = $('.scene'); if (!sc) return;
    var g = seg(), k = sceneKey(), url = g ? 'img/rt/' + g.img + '.jpg' : 'img/lh/' + k + '.jpg', asp = g ? (g.ar || 4) : (ASP[k] || 4.03);
    var ih = g ? Math.round(S.sceneH * 1.1) : S.sceneH, shiftY = g ? Math.round((ih - S.sceneH) * (g.fy == null ? 1 : g.fy)) : 0;
    if (g && g.v) {
      var vz = 1.55, vw = Math.round(S.W * vz), vh = Math.round(vw / g.ar), vx = -Math.round((vw - S.W) / 2), vn = Math.max(1, curSteps().length), vsf = S.view === 'arrive' ? 0 : (S.view === 'step' ? (S.i + 1) / (vn + 1) : 1);
      var vy = -Math.max(0, vh - S.sceneH) * vsf, vp = $('.pan', sc);
      if (!vp || S.sceneUrl !== url) { sc.innerHTML = '<div class="pan" style="left:' + vx + 'px;width:' + vw + 'px;height:' + vh + 'px;top:0;bottom:auto;background-size:cover;background-image:url(' + url + ')"></div>'; vp = $('.pan', sc); S.sceneUrl = url; vp.style.transform = 'translateY(' + vy + 'px)'; return; }
      vp.style.width = vw + 'px'; vp.style.height = vh + 'px'; vp.style.left = vx + 'px'; vp.style.top = '0'; vp.style.bottom = 'auto';
      if (animate) vp.classList.add('slide'); else vp.classList.remove('slide');
      vp.style.transform = 'translateY(' + vy.toFixed(0) + 'px)'; return;
    }
    var pw = Math.round(ih * asp);
    var n = dayNo(), N = Math.max(1, curSteps().length);
    var sf = S.view === 'arrive' ? 0 : (S.view === 'step' ? (S.i + 1) / (N + 1) : 1);
    var frac = g ? Math.min(1, ((S.d - g.days[0]) + sf) / (g.days[1] - g.days[0] + 1)) : sf;
    var dx = -Math.max(0, pw - S.W) * frac;
    var pan = $('.pan', sc);
    if (!pan || S.sceneUrl !== url) { sc.innerHTML = '<div class="pan" style="width:' + pw + 'px;height:' + ih + 'px;top:-' + shiftY + 'px;bottom:auto;background-image:url(' + url + ')"></div>'; pan = $('.pan', sc); S.sceneUrl = url; pan.style.transform = 'translateX(' + dx + 'px)'; return; }
    pan.style.width = pw + 'px'; pan.style.height = ih + 'px'; pan.style.top = '-' + shiftY + 'px'; pan.style.bottom = 'auto';
    if (animate) pan.classList.add('slide'); else pan.classList.remove('slide');
    pan.style.transform = 'translateX(' + dx.toFixed(0) + 'px)';
  }

  function shell() {
    var ph = $('#ph');
    ph.innerHTML =
      '<div class="scene" aria-hidden="true"></div>' +
      '<div class="topbar"><button class="rnd" data-a="back" aria-label="' + esc(ES() ? 'Atrás' : 'Back') + '"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 6 10l6 6"/></svg></button>' +
      '<button class="rnd" data-a="pin" aria-expanded="false" aria-label="' + esc(ES() ? '¿Dónde es?' : 'Where is this?') + '"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 5 7 3l6 2 4.5-2v12L13 17l-6-2-4.5 2z"/><path d="M7 3v12M13 5v12"/></svg></button>' +
      '<button class="seebtn" data-a="see"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M1.5 10S5 4.5 10 4.5 18.5 10 18.5 10 15 15.5 10 15.5 1.5 10 1.5 10z"/><circle cx="10" cy="10" r="2.5"/></svg><span>' + esc(L(C.seeLandscape)) + '</span></button></div>' +
      '<div class="tipslot"></div>' +
      '<div class="panelwrap"><div class="tear"></div><div class="panel" role="region" aria-label="' + esc(ES() ? 'Pregunta' : 'Question') + '"></div></div>';
    $('.tear').style.clipPath = torn(5, 9);
    layout(); S.sceneUrl = '';
  }
  function torn(seed, amp) { var p = ['0% 100%'], n = 36; for (var i = 0; i <= n; i++) { var r = Math.sin(i * 12.9898 + seed) * 43758.5453; r -= Math.floor(r); p.push((i / n * 100).toFixed(1) + '% ' + (100 - r * 70).toFixed(1) + '%'); } p.push('100% 100%'); return 'polygon(' + p.join(',') + ')'; }

  /* ───────── components ───────── */
  function fb(html) { return '<div id="fb" role="status" aria-live="polite">' + (html || '') + '</div>'; }
  function elara(text, extra) { if (!text) return ''; return '<div class="elara">' + ORB + '<div><p>' + esc(text) + '</p>' + (extra || '') + '</div></div>'; }
  function helpBlock(h) {
    if (!h) return '';
    if (!S.help) return '<button class="lnk" data-a="help" aria-expanded="false">' + esc(L(C.help)) + '</button>';
    var b = '<div class="help"><h4>' + esc(L(C.helpExplain)) + '</h4><p>' + esc(L(h.explain)) + '</p>';
    if (h.example) b += '<h4>' + esc(L(C.helpExample)) + '</h4><p>' + esc(L(h.example)) + '</p>';
    if (h.smaller) { b += '<h4>' + esc(L(C.helpSmaller)) + '</h4><p>' + esc(L(h.smaller.label)) + '</p><div class="chips" style="margin-top:6px">' + h.smaller.buttons.map(function (bt, i) { return '<button class="chip" data-a="helpset" data-i="' + i + '">' + esc(L(bt.label)) + '</button>'; }).join('') + '</div>'; }
    b += '<button class="lnk" data-a="help" aria-expanded="true">' + esc(L(C.helpClose)) + '</button></div>';
    return b;
  }
  function optionList(opts, sel, multi) {
    return '<div class="opts" role="' + (multi ? 'group' : 'radiogroup') + '">' + opts.map(function (o) {
      var on = sel.indexOf(o.id) > -1;
      return '<button class="opt' + (multi ? ' multi' : '') + '" role="' + (multi ? 'checkbox' : 'radio') + '" aria-checked="' + on + '" aria-pressed="' + on + '" data-a="opt" data-id="' + esc(o.id) + '"><span class="tick" aria-hidden="true">' + (on ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.4 5 8.8 9.5 3.6"/></svg>' : '') + '</span><span>' + esc(L(o.label)) + '</span></button>';
    }).join('') + '</div>';
  }
  function micBtn() {
    var sup = !!(window.__fakeSR || window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!sup) return '';
    var rec = S.voice.state === 'rec';
    return '<button class="mic" data-a="mic" aria-pressed="' + rec + '" aria-label="' + esc(rec ? (ES() ? 'Detener dictado' : 'Stop dictation') : (ES() ? 'Dictar con la voz' : 'Dictate with your voice')) + '"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="7.5" y="2.5" width="5" height="9" rx="2.5"/><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5"/></svg></button>';
  }
  function voiceStat() {
    var v = S.voice;
    if (v.state === 'rec') return ES() ? 'Escuchando… toca el micrófono para terminar.' : 'Listening… tap the microphone to finish.';
    if (v.state === 'review') return ES() ? 'Transcripción lista. Revísala y edítala; se envía cuando pulses Continuar.' : 'Transcript ready. Review and edit it; it is sent when you press Continue.';
    if (v.state === 'edited') return ES() ? 'Editado. Se envía cuando pulses Continuar.' : 'Edited. It is sent when you press Continue.';
    if (v.state === 'error') return ES() ? 'No se pudo usar el micrófono. Puedes escribir.' : 'Could not use the microphone. You can type.';
    return '';
  }
  function textField(id, value, placeholder, withMic) {
    var cls = 'ta' + (S.voice.state === 'rec' ? ' listening' : (S.voice.state === 'review' ? ' transcript' : ''));
    return '<div class="tawrap"><textarea class="' + cls + '" rows="1" data-a="ta" data-field="' + id + '" placeholder="' + esc(placeholder || '') + '" aria-describedby="vstat">' + esc(value || '') + '</textarea>' + (withMic ? micBtn() : '') + '</div><p class="vstat" id="vstat" aria-live="polite">' + esc(voiceStat() + (S.voice.state === 'rec' && S.voice.interim ? ' ' + S.voice.interim : '')) + '</p>';
  }
  function dateWidget(id, dw, label) {
    dw = dw || {};
    var seg = ['confirmed', 'approx', 'unknown'].map(function (m) { return '<button data-a="dmode" data-w="' + id + '" data-m="' + m + '" aria-pressed="' + (dw.mode === m) + '">' + esc(L(X.DATE[m])) + '</button>'; }).join('');
    var sub = '';
    if (dw.mode === 'confirmed') { var er = dateErr(dw); sub = '<div class="fld" style="margin-top:6px"><label for="dv-' + id + '">' + esc(L(X.DATE.pick)) + '</label><input class="inp" type="date" id="dv-' + id + '" data-a="dval" data-w="' + id + '" value="' + esc(dw.value || '') + '"' + (er && dw.value ? ' aria-invalid="true" aria-describedby="de-' + id + '"' : '') + '><p class="err" id="de-' + id + '" role="alert">' + esc(dw.value || dw.touched ? (er || '') : '') + '</p></div>'; }
    else if (dw.mode === 'approx') sub = '<div class="chips" style="margin-top:6px">' + X.DATE.windows.map(function (w) { return '<button class="chip" data-a="dwin" data-w="' + id + '" data-id="' + w.id + '" aria-pressed="' + (dw.window === w.id) + '">' + esc(L(w.label)) + '</button>'; }).join('') + '</div><p class="note" style="margin-top:0">' + esc(L(X.DATE.approxNote)) + '</p>';
    else if (dw.mode === 'unknown') sub = '<p class="note">' + esc(L(X.DATE.unknownNote)) + '</p>';
    return '<div class="fld">' + (label ? '<label>' + esc(label) + '</label>' : '') + '<div class="seg" role="group">' + seg + '</div>' + sub + '</div>';
  }
  function amountField(id, label, obj, showCur) {
    obj = obj || {}; var p = parseAmt(obj.raw);
    var err = p.bad ? L(X.AMT.bad) : '';
    return '<div class="fld"><label for="am-' + id + '">' + esc(label) + '</label><input class="inp" id="am-' + id + '" data-a="amt" data-w="' + id + '" inputmode="decimal" autocomplete="off" value="' + esc(obj.raw || '') + '"' + (err ? ' aria-invalid="true" aria-describedby="ae-' + id + '"' : '') + '><p class="err" id="ae-' + id + '" role="alert">' + esc(err) + '</p></div>';
  }

  /* ═════════════ W1 · D4 renderers ═════════════ */
  function d4ctxLines() {
    var a = peek(4, 'ctx'), sel = a.sel || [], out = [];
    var pay = a.pay || {}, inc = a.inc || {};
    if (sel.indexOf('pay') > -1 && sel.indexOf('inc') > -1) {
      var pk = dateKind(pay.date), ik = dateKind(inc.date);
      if (pk.k === 'c' && ik.k === 'c') {
        var gap = Math.round((ik.d - pk.d) / 864e5);
        if (gap > 0) out.push(ES() ? 'El dinero llega ' + gap + ' ' + plural(gap, 'día', 'días', 'day', 'days') + ' después de que vence el pago.' : 'The money arrives ' + gap + ' ' + plural(gap, 'day', 'days', 'day', 'days') + ' after the payment is due.');
        else if (gap === 0) out.push(ES() ? 'El dinero llega el mismo día en que vence el pago.' : 'The money arrives on the day the payment is due.');
        else out.push(ES() ? 'El dinero llega ' + (-gap) + ' ' + plural(-gap, 'día', 'días', 'day', 'days') + ' antes de que venza el pago.' : 'The money arrives ' + (-gap) + ' ' + plural(-gap, 'day', 'days', 'day', 'days') + ' before the payment is due.');
      } else if (pk.k === 'u' || ik.k === 'u') out.push(ES() ? 'Falta una de las dos fechas, así que todavía no se pueden comparar.' : 'One of the two dates is missing, so they cannot be compared yet.');
      else if (pk.k === 'a' || ik.k === 'a') out.push(ES() ? 'Una de las fechas es aproximada, así que la comparación también lo es.' : 'One of the dates is approximate, so the comparison is too.');
      var pa = parseAmt((pay.amount || {}).raw), ia = parseAmt((inc.amount || {}).raw);
      if (pa.ok && ia.ok) {
        var cur = ((pay.amount || {}).cur || '').trim(); var same = cur && cur === ((inc.amount || {}).cur || '').trim() ? ' ' + cur : '';
        if (ia.v >= pa.v) out.push(ES() ? 'Con esas cantidades, ' + fmtN(ia.v) + same + ' cubre un pago de ' + fmtN(pa.v) + same + '. Eso no dice si te alcanza para todo lo demás.' : 'With those amounts, ' + fmtN(ia.v) + same + ' covers a payment of ' + fmtN(pa.v) + same + '. That does not say whether it is enough for everything else.');
        else out.push(ES() ? 'Con esas cantidades, ' + fmtN(ia.v) + same + ' no cubre un pago de ' + fmtN(pa.v) + same + ': faltarían ' + fmtN(pa.v - ia.v) + same + ' solo para ese pago.' : 'With those amounts, ' + fmtN(ia.v) + same + ' does not cover a payment of ' + fmtN(pa.v) + same + ': ' + fmtN(pa.v - ia.v) + same + ' would be missing for that payment alone.');
      } else if ((pay.amount || {}).raw || (inc.amount || {}).raw) {
        if (!pa.empty && !ia.empty) {} else out.push(ES() ? 'Falta una cantidad, así que todavía no se puede comparar. Una cantidad en blanco no cuenta como cero.' : 'One amount is missing, so it cannot be compared yet. A blank amount does not count as zero.');
      }
    }
    return out;
  }
  function ctxReply() {
    var sel = ctxSel(); if (!sel.length) return '';
    var key2 = sel.indexOf('none') > -1 ? 'none' : sel.indexOf('unsure') > -1 ? 'unsure' : (sel.indexOf('pay') > -1 && sel.indexOf('inc') > -1) ? 'both' : sel.indexOf('pay') > -1 ? 'pay' : 'inc';
    return L(D[4].ctxReply[key2]);
  }
  function R_ctx() {
    var st = D[4].ctx, a = get(4, 'ctx'), sel = a.sel || [];
    var h = '<h2 class="q">' + esc(L(st.title)) + '</h2><p class="sub">' + esc(L(st.body)) + '</p>' + optionList(st.options, sel, true);
    var rep = ctxReply(); if (rep) h += elara(rep);
    ['pay', 'inc'].forEach(function (k) {
      if (sel.indexOf(k) < 0) return; var dt = st.detail[k]; a[k] = a[k] || {};
      h += '<div class="dtl"><h4>' + esc(L(dt.q)) + '</h4>' + dateWidget(k, a[k].date, '') + '<div class="amtrow">' + amountField(k, L(dt.amountLabel), a[k].amount) + '<div class="fld cur"><label for="cu-' + k + '">' + esc(L(X.AMT.cur)) + '</label><input class="inp" id="cu-' + k + '" data-a="cur" data-w="' + k + '" value="' + esc((a[k].amount || {}).cur || '') + '" maxlength="12"></div></div></div>';
    });
    return h + fb(FB_ctx()) + helpBlock(st.help);
  }
  function FB_ctx() { var lines = d4ctxLines(); if (!lines.length) return ''; return '<div class="elara">' + ORB + '<div>' + lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div></div>'; }
  function R_sort() {
    var st = D[4].sort, a = get(4, 'sort'); a.as = a.as || {};
    var h = '<h2 class="q">' + esc(L(st.title)) + '</h2><p class="sub">' + esc(L(st.body)) + '</p>';
    h += st.items.map(function (it) {
      var chosen = a.as[it.id];
      var seg = st.cats.map(function (c) { return '<button data-a="sort" data-it="' + it.id + '" data-c="' + c.id + '" aria-pressed="' + (chosen === c.id) + '">' + esc(L(c.label)) + '</button>'; }).join('');
      var res = '';
      if (a.checked) {
        var ok = chosen === it.answer;
        res = '<p class="res" role="status"><b>' + (chosen ? (ok ? (ES() ? 'Correcto. ' : 'Correct. ') : (ES() ? 'No del todo. ' : 'Not quite. ')) : '') + '</b>' + esc(chosen ? (ok ? L(st.right[it.id]) : L(st.wrong[it.id + ':' + chosen])) : L(st.unchosen)) + (chosen && !ok ? ' ' + esc(L(st.right[it.id]).replace(/^[A-C]: sí\.\s*/, '').replace(/^[A-C]: yes\.\s*/, '')) : '') + '</p>';
      }
      return '<div class="sortrow"><p><b>' + it.id + '.</b> ' + esc(L(it.text)) + '</p><div class="seg" role="group" aria-label="' + esc(L(it.text)) + '">' + seg + '</div>' + res + '</div>';
    }).join('');
    if (a.checked) h += elara(sortScoreText(), '<p>' + esc(L(st.close)) + '</p>');
    return h + fb('') + helpBlock(st.help);
  }
  function sortScore() { var a = peek(4, 'sort'), n = 0, t = 0; D[4].sort.items.forEach(function (it) { if (a.as && a.as[it.id]) { t++; if (a.as[it.id] === it.answer) n++; } }); return { n: n, t: t }; }
  function sortScoreText() { var s = sortScore(); if (!s.t) return ES() ? 'No elegiste ninguno; los ejemplos siguen aquí.' : 'You did not choose any; the examples stay here.'; return ES() ? 'Acertaste ' + s.n + ' de ' + s.t + '.' : 'You got ' + s.n + ' of ' + s.t + '.'; }
  function closestReply() {
    var c = peek(4, 'closest').sel; if (!c) return '';
    var pay = ctxSel().indexOf('pay') > -1;
    var m = {
      A: pay ? PX('d4.cr.A1', 'Reply', 'Entonces tu pregunta es de fechas: cuándo llega el dinero y cuándo vence tu pago.', 'Then your question is about dates: when the money arrives and when your payment is due.') : PX('d4.cr.A2', 'Reply when A is chosen but she did not mark a payment coming due', 'A habla de un pago que vence, y no marcaste un pago por vencer. Puedes dejarlo como práctica o cambiar tu respuesta anterior.', 'A is about a payment coming due, and you did not mark one. You can keep it as practice or change your earlier answer.'),
      B: PX('d4.cr.B', 'Reply', 'Entonces tu pregunta es de cantidades: cuánto necesitas y cuánto tienes o esperas.', 'Then your question is about amounts: how much you need and how much you have or expect.'),
      C: PX('d4.cr.C', 'Reply', 'Entonces lo primero es el dato que falta: la fecha o la cantidad.', 'Then the first thing is the missing fact: the date or the amount.'),
      several: PX('d4.cr.S', 'Reply', 'Pueden ser varias a la vez. En el paso siguiente elige solo una para aclarar primero.', 'It can be several at once. In the next step pick just one to clear up first.'),
      noneof: PX('d4.cr.N', 'Reply', 'Si ninguno se parece, está bien: puede ser otra cosa. Más adelante puedes anotar el dato que te falta.', 'If none looks like you, that is fine: it may be something else. Later you can note the fact you are missing.'),
      unsure: PX('d4.cr.U', 'Reply', 'No estar segura también es información: falta un dato. El paso siguiente te ayuda a elegir cuál.', 'Not being sure is also information: a fact is missing. The next step helps you choose which one.')
    };
    return L(m[c]);
  }
  var CHANGE = PX('d4.cr.change', 'Link', 'Cambiar mi respuesta anterior', 'Change my earlier answer');
  function R_closest() {
    var st = D[4].closest, a = get(4, 'closest');
    var extra = (a.sel === 'A' && ctxSel().indexOf('pay') < 0) ? '<button class="lnk" data-a="goto" data-id="ctx">' + esc(L(CHANGE)) + '</button>' : '';
    return '<h2 class="q">' + esc(L(st.title)) + '</h2><p class="sub">' + esc(L(st.body)) + '</p>' + optionList(st.options, a.sel ? [a.sel] : [], false) + fb(a.sel ? elara(closestReply(), extra) : '') + helpBlock(st.help);
  }
  function R_fact() {
    var st = D[4].fact, a = get(4, 'fact');
    var h = '<h2 class="q">' + esc(L(st.title)) + '</h2><p class="sub">' + esc(L(st.body)) + '</p><div class="chips">' + st.chips.map(function (c) { return '<button class="chip" data-a="chip" data-id="' + c.id + '" aria-pressed="' + (a.chip === c.id) + '">' + esc(L(c.label)) + '</button>'; }).join('') + '</div>' + textField('text', a.text, L(st.placeholder), true);
    return h + fb(FB_fact()) + helpBlock(st.help);
  }
  function FB_fact() {
    var st = D[4].fact, a = peek(4, 'fact'), h = '';
    if (a.retry) return elara(L(st.retry));
    if (a.chip) h += '<p>' + esc(L(st.chipReply[a.chip])) + '</p>';
    if (a.sent && a.text) h += '<p>' + esc(L(st.textSaved)) + '</p>';
    return h ? '<div class="elara">' + ORB + '<div>' + h + '</div></div>' : '';
  }
  function R_kind() {
    var st = D[4].kind, a = get(4, 'kind'), fa = peek(4, 'fact');
    var pre = (a.next == null && fa.chip) ? L(D[4].fact.chips.filter(function (c) { return c.id === fa.chip; })[0].label) : (a.next || '');
    return '<h2 class="q">' + esc(L(st.title)) + '</h2><p class="sub">' + esc(L(st.fields1)) + '</p>' + optionList(st.options, a.sel ? [a.sel] : [], false) + '<div class="fld"><label for="kn">' + esc(L(st.nextLabel)) + '</label><input class="inp" id="kn" data-a="knext" value="' + esc(pre) + '"></div>' + fb(a.sel ? elara(L(st.replies[a.sel])) : '') + helpBlock(st.help);
  }

  /* ═════════════ W2 · D11 renderers ═════════════ */
  function offerCalc(o) {
    var recv = parseAmt(o.recv), cost = parseAmt(o.cost), hrs = parseAmt(o.hours);
    var r = { recv: recv.ok ? recv.v : null, cost: cost.ok ? cost.v : null, hours: hrs.ok ? hrs.v : null, bad: recv.bad || cost.bad || hrs.bad };
    r.net = (r.recv != null && r.cost != null) ? r.recv - r.cost : null;
    r.per = (r.net != null && r.hours && r.hours > 0) ? r.net / r.hours : null;
    r.pay = describeDate(o.pay);
    r.payKind = dateKind(o.pay).k;
    return r;
  }
  function mineLines(b) {
    var out = [], names = ['A', 'B'];
    names.forEach(function (n) {
      var c = offerCalc((b.offers || {})[n] || {}), l = [];
      if (c.net != null) l.push(ES() ? 'te deja ' + fmtN(c.net) : 'leaves ' + fmtN(c.net)); else l.push(ES() ? 'lo que queda no se puede calcular todavía (falta recibes o costos)' : 'what is left cannot be worked out yet (missing what you receive or the costs)');
      if (c.hours != null) l.push(ES() ? 'usa ' + fmtN(c.hours) + ' h' : 'uses ' + fmtN(c.hours) + ' h'); else l.push(ES() ? 'tiempo total sin dato' : 'total time unknown');
      if (c.per != null) l.push(ES() ? 'unas ' + fmtN(c.per) + ' por hora' : 'about ' + fmtN(c.per) + ' an hour');
      l.push(c.payKind === 'c' || c.payKind === 'a' ? (ES() ? 'paga ' + c.pay : 'pays ' + c.pay) : (ES() ? 'día de pago: sin dato (no cuenta como ya pagado)' : 'payday: unknown (not the same as already paid)'));
      out.push(n + ': ' + l.join('; ') + '.');
    });
    return out;
  }
  function cell(row, who, b) {
    var rev = row.shown || (b.revealed || {})[row.id];
    if (!rev) return '<button class="rv" data-a="reveal" data-id="' + row.id + '" aria-label="' + esc((ES() ? 'Ver ' : 'Show ') + lc(L(row.label)) + ' ' + who) + '">' + esc(ES() ? 'Ver' : 'Show') + '</button>';
    var v = who === 'A' ? row.a : row.b;
    if (row.kind === 'money') return fmtN(v);
    if (row.kind === 'hours') return fmtN(v) + ' h';
    return v == null ? '<b>' + esc(L(D[11].before.payB)) + '</b>' : esc(L(D[11].before.payA));
  }
  function R_compare() {
    var st = D[11].before, a = get(11, 'before'); a.revealed = a.revealed || {}; a.offers = a.offers || { A: {}, B: {} };
    var h = '<h2 class="q">' + esc(L(st.title)) + '</h2><p class="sub">' + esc(L(st.body)) + '</p>';
    if (!a.mine) {
      h += '<table class="tbl"><thead><tr><th></th><th>A</th><th>B</th></tr></thead><tbody>' + st.rows.map(function (r) { return '<tr><th scope="row">' + esc(L(r.label)) + '</th><td>' + cell(r, 'A', a) + '</td><td>' + cell(r, 'B', a) + '</td></tr>'; }).join('') + '</tbody></table>';
      h += fb(FB_compare()) ;
      h += '<p class="sub" style="margin:10px 0 4px">' + esc(ES() ? '¿Qué revisarías antes de elegir?' : 'What would you check before choosing?') + '</p>';
      h += optionList(st.options, a.choice ? [a.choice] : [], false);
    } else {
      h += '<p class="note" style="margin:0 0 6px">' + esc(L(st.mineNote)) + '</p>';
      ['A', 'B'].forEach(function (n) {
        var o = a.offers[n];
        h += '<div class="dtl"><h4>' + (ES() ? 'Oferta ' : 'Offer ') + n + '</h4>' + amountField('r' + n, L(st.rows[0].label), { raw: o.recv }) + amountField('c' + n, L(st.rows[1].label), { raw: o.cost }) + amountField('h' + n, (ES() ? 'Horas en total' : 'Total hours'), { raw: o.hours }) + dateWidget('p' + n, o.pay, L(st.rows[3].label)) + '</div>';
      });
      h += fb(elara(ES() ? 'Con tus números:' : 'With your numbers:', mineLines(a).map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('')));
    }
    h += '<button class="lnk" data-a="mine">' + esc(L(a.mine ? st.mineBack : st.mineToggle)) + '</button>';
    return h + helpBlock(st.help);
  }
  function FB_compare() {
    var st = D[11].before, a = peek(11, 'before'), rv = a.revealed || {}, parts = [];
    ['cost', 'time', 'pay'].forEach(function (k) { if (rv[k]) parts.push('<p>' + esc(L(st.revealed[k])) + '</p>'); });
    var ch = (st.options.filter(function (o) { return o.id === a.choice; })[0]);
    if (ch) parts.push('<p>' + esc(L(ch.reply)) + '</p>');
    if (!parts.length) return elara(L(st.revealRows));
    return '<div class="elara">' + ORB + '<div>' + parts.join('') + '</div></div>';
  }
  function R_matters() {
    var st = D[11].matters, a = get(11, 'matters'), op = st.options.filter(function (o) { return o.id === a.sel; })[0];
    var h = '<h2 class="q">' + esc(L(st.title)) + '</h2><p class="sub">' + esc(L(st.body)) + '</p>' + optionList(st.options, a.sel ? [a.sel] : [], false);
    if (a.sel === 'other') h += '<input class="inp" data-a="mother" aria-label="' + esc(L(st.otherPlaceholder)) + '" placeholder="' + esc(L(st.otherPlaceholder)) + '" value="' + esc(a.other || '') + '">';
    return h + fb(op ? elara(L(op.reply)) : '') + helpBlock(st.help);
  }
  function R_read(st) { return '<h2 class="q">' + esc(L(st.title)) + '</h2><p>' + esc(L(st.body)) + '</p>'; }
  function askMsg(a) {
    var st = D[11].ask; var qs = (a.qs || []).map(function (id) { return st.qs.filter(function (q) { return q.id === id; })[0]; }).filter(Boolean);
    if (!qs.length) return '';
    return L(st.greet) + '\n' + qs.map(function (q, i) { return (i + 1) + ') ' + L(q.line); }).join('\n') + '\n' + L(st.bye);
  }
  function R_ask() {
    var st = D[11].ask, a = get(11, 'ask'); a.qs = a.qs || [];
    if (!a.edited) a.msg = askMsg(a);
    var h = '<h2 class="q">' + esc(L(st.title)) + '</h2><p class="sub">' + esc(L(st.body)) + '</p><div class="chips">' + st.qs.map(function (q) { return '<button class="chip" data-a="askq" data-id="' + q.id + '" aria-pressed="' + (a.qs.indexOf(q.id) > -1) + '">' + esc(L(q.label)) + '</button>'; }).join('') + '</div>';
    h += '<div class="fld"><label for="msg">' + esc(L(st.msgLabel)) + '</label><textarea class="ta" id="msg" rows="3" data-a="msg" placeholder="' + esc(L(st.empty)) + '">' + esc(a.msg || '') + '</textarea></div>';
    h += '<button class="lnk" data-a="copy"' + (a.msg ? '' : ' disabled') + '>' + esc(L(st.copy)) + '</button>' + (a.edited ? '<button class="lnk" data-a="remsg">' + esc(ES() ? 'Rehacer desde mis preguntas' : 'Rebuild from my questions') + '</button>' : '');
    return h + fb(a.copied ? '<p class="note" role="status">' + esc(L(st.copied)) + '</p>' : (a.qs.length ? elara(L(st.reply)) : '')) + helpBlock(st.help);
  }
  function feelingLike(t) {
    var s = String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    var words = s.match(/[a-z0-9']+/g) || [];
    if (words.length > 6) return false;
    return /\b(i feel|i'm feeling|im feeling|feels? (weird|off|strange|odd|bad|wrong)|me siento|siento|se siente|raro|rara|extrano|extrana)\b/.test(s);
  }
  function nonAnswerLite(t) {
    var s = String(t || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!s) return false;
    if (/^(hi|hello|hey|hola|test|testing|prueba|ok|okay|asdf+|qwer\w*|[a-z])\W*$/.test(s)) return true;
    var w = s.match(/[a-z0-9]+/g) || [];
    if (w.length && w.every(function (x) { return /^(.)\1{2,}$/.test(x) || (x.length >= 5 && !/[aeiouy]/.test(x)); })) return true;
    return false;
  }
  function R_carry() {
    var st = D[11].carry, a = get(11, 'carry'), cl = st.clar;
    var h = '<h2 class="q">' + esc(L(st.title)) + '</h2><p class="sub">' + esc(L(st.body)) + '</p><div class="chips">' + st.chips.map(function (c) { return '<button class="chip" data-a="cchip" data-id="' + c.id + '" aria-pressed="' + (a.chip === c.id) + '">' + esc(L(c.label)) + '</button>'; }).join('') + '</div>' + textField('text', a.text, L(st.placeholder), true);
    var fbh = '';
    if (a.retry) fbh = elara(L(st.retry));
    else if (a.clar && a.clar.shown && !a.clar.choice) fbh = elara(L(cl.q), '<div class="opts" style="margin-top:8px" role="radiogroup">' + cl.options.map(function (o) { return '<button class="opt" role="radio" aria-checked="false" data-a="clar" data-id="' + o.id + '"><span class="tick" aria-hidden="true"></span><span>' + esc(L(o.label)) + '</span></button>'; }).join('') + '</div>');
    else if (a.clar && a.clar.choice) {
      var ch = a.clar.choice, txt = ch === 'question' ? cl.rQuestion : ch === 'money' ? cl.rMoney : ch === 'else' ? cl.rElse : cl.rMove, ex = '';
      if (ch === 'money') ex = '<div class="chips" style="margin-top:8px"><button class="chip" data-a="cpause">' + esc(L(cl.pause)) + '</button></div>';
      fbh = elara(L(txt), ex);
    } else if (a.chip) fbh = elara(L(st.chipReply));
    return h + fb(fbh) + helpBlock(st.help);
  }

  /* ═════════════ generic renderer (every other day) ═════════════ */
  function multiHint(s) { return /up to|hasta|pick up|elige hasta|escoge hasta/i.test(s.body || ''); }
  function tokenSub(str, fb) {
    if (!str) return str; var miss = false;
    var out = str.replace(/\{d(\d+)\.(\w+)(?:#(\d+))?(\|lower)?\}/g, function (m, n, k, fi, lw) {
      var a = A[n + '.' + k]; var v = null; if (a) { if (a.f && fi) v = a.f[+fi - 1]; else if (a.f) v = a.f.filter(Boolean).join(' / '); else if (a.o && a.o.length) v = a.o.join(', '); else if (a.text) v = a.text; }
      if (!v) { miss = true; return ''; } return lw ? lc(v) : v; });
    return miss ? (fb || (ES() ? 'tu respuesta' : 'your answer')) : out;
  }
  function R_gen(st) {
    var n = dayNo(), s = st.raw, a = get(n, st.id), h = '';
    if (s.eyebrow) h += '<p class="eyebrow">' + esc(s.eyebrow) + '</p>';
    h += '<h2 class="q">' + esc(tokenSub(s.title, tokenSub(s.titleFallback, ''))) + '</h2>';
    if (s.body) h += '<p class="sub">' + esc(tokenSub(s.body, '')) + '</p>';
    if (s.noticedQuote) h += '<p class="sub" style="font-family:Fraunces,serif;font-size:1.1em">' + esc(tokenSub(s.noticedQuote, '')) + '</p>';
    if (s.bullets) h += '<div class="opts">' + s.bullets.map(function (b) { return '<div class="opt" style="cursor:default">' + esc(tokenSub(b, '')) + '</div>'; }).join('') + '</div>';
    if (s.recallLabels) h += '<div class="opts">' + s.recallLabels.map(function (l, i) { var got = weekAnswer(i + 1); return '<div class="opt" style="cursor:default"><span><small>' + esc(l) + '</small>' + esc(got || (ES() ? 'Aún sin escribir. Está bien.' : 'Not written yet. That is fine.')) + '</span></div>'; }).join('') + '</div>';
    if (s.options) {
      var m = multiHint(s);
      h += '<div class="opts" role="' + (m ? 'group' : 'radiogroup') + '">' + s.options.map(function (o, i) { var on = (a.o || []).indexOf(o) > -1; var sl = s.sublines && s.sublines[i] ? '<small>' + esc(tokenSub(s.sublines[i], '')) + '</small>' : ''; return '<button class="opt' + (m ? ' multi' : '') + '" role="' + (m ? 'checkbox' : 'radio') + '" aria-checked="' + on + '" aria-pressed="' + on + '" data-a="gopt" data-i="' + i + '"><span class="tick" aria-hidden="true">' + (on ? '✓' : '') + '</span><span>' + esc(tokenSub(o, '')) + sl + '</span></button>'; }).join('') + '</div>';
      if (s.otherLabel && a.o && a.o.indexOf(s.otherLabel) > -1) h += '<input class="inp" data-a="gother" placeholder="' + esc(s.otherPlaceholder || '') + '" aria-label="' + esc(s.otherLabel) + '" value="' + esc(a.other || '') + '">';
    }
    if (s.items) h += s.items.map(function (it, i) { return '<div class="sortrow"><p>' + esc(it) + '</p><div class="seg" role="group">' + s.columns.map(function (c, ci) { return '<button data-a="gcol" data-i="' + i + '" data-c="' + ci + '" aria-pressed="' + ((a.c || {})[i] === ci) + '">' + esc(c) + '</button>'; }).join('') + '</div></div>'; }).join('');
    if (s.stops) h += '<div class="opts" role="radiogroup">' + s.stops.map(function (o, i) { var on = (a.o || []).indexOf(o) > -1; return '<button class="opt" role="radio" aria-checked="' + on + '" aria-pressed="' + on + '" data-a="gopt" data-i="' + i + '" data-stop="1"><span class="tick" aria-hidden="true">' + (on ? '✓' : '') + '</span><span>' + esc(o) + '</span></button>'; }).join('') + '</div>';
    if (s.fields) h += s.fields.map(function (f, i) { return '<div class="fld"><label for="gf' + i + '">' + esc(f) + '</label><input class="inp" id="gf' + i + '" data-a="gfield" data-i="' + i + '" placeholder="' + esc((s.placeholders || [])[i] || s.placeholder || '') + '" value="' + esc((a.f || [])[i] || '') + '"></div>'; }).join('');
    else if (s.placeholder || s.prefill || s.ideas) {
      if (s.ideas) h += '<div class="chips">' + s.ideas.map(function (x, i) { return '<button class="chip" data-a="gidea" data-i="' + i + '">' + esc(x) + '</button>'; }).join('') + '</div>';
      h += textField('gtext', a.text != null ? a.text : (s.prefill ? tokenSub(s.prefill, tokenSub(s.prefillFallback, '')) : ''), s.placeholder || '', true);
    }
    if (s.note) h += '<p class="note">' + esc(s.note) + '</p>';
    var er = null;
    if (s.replies && a.o && a.o.length && s.options) er = s.replies[s.options.indexOf(a.o[0])];
    else if (s.elara && ((a.o && a.o.length) || a.text || a.f)) er = s.elara;
    return h + fb(er ? elara(tokenSub(er, '')) : '');
  }
  function R_na(st) {
    var s = st.raw, a = get(dayNo(), st.id), h = '', N = QW()[S.d - 1];
    var pl0 = isCur() && placeOf(S.d);
    h += '<p class="where">' + esc(pl0 ? (ES() ? 'Día ' : 'Day ') + S.d + (ES() ? ' de 7 · ' : ' of 7 · ') + pl0.n : (isCur() ? (ES() ? 'Semana ' : 'Week ') + (S.cw || 1) + ' · ' : '') + (ES() ? 'Día ' : 'Day ') + S.d + (ES() ? ' de 7 · ' : ' of 7 · ') + L(N.place || (seg() || {}).place)) + '</p>';
    if (s.kicker) h += '<p class="kicker">' + esc(L(s.kicker)) + '</p>';
    var tt = isCur() ? splitSafe(L(s.title)) : [L(s.title), ''];
    h += '<h2 class="q ' + (s.small ? '' : 'big') + '">' + esc(tt[0]) + '</h2>';
    if (tt[1]) h += '<p class="safenote">' + esc(tt[1]) + '</p>';
    if (s.dep) h += depLine(s.dep);
    if (s.hint) h += '<p class="hint">' + esc(L(s.hint)) + '</p>';
    if (s.recall) { var r = peek(600 + s.recall.d, s.recall.id); h += '<blockquote class="recall">' + esc(r.text ? '«' + r.text + '»' : (ES() ? 'Ese día no escribiste nada. Está bien.' : 'You didn’t write anything that day. That’s fine.')) + '</blockquote>'; return h + fb(''); }
    var reply = '';
    if (s.options && s.multi) {
      var m = a.m || [];
      h += '<div class="opts" role="group">' + s.options.map(function (o, i) { var on = m.indexOf(i) >= 0; return '<button class="opt" role="checkbox" aria-checked="' + on + '" data-a="nmulti" data-i="' + i + '"><span class="tick" aria-hidden="true">' + (on ? '✓' : '') + '</span><span>' + esc(L(o)) + '</span></button>'; }).join('') + '</div>';
      if (a.i != null && a.i < 0 && s.softReply) reply = L(s.softReply);
      h += '<div class="softrow">' + [s.soft, s.soft2].map(function (x, k) { return x ? '<button class="softopt" aria-pressed="' + (a.i === -1 - k) + '" data-a="nopt" data-i="' + (-1 - k) + '">' + esc(L(x)) + '</button>' : ''; }).join('') + '</div>';
    } else if (s.options) {
      h += '<div class="opts" role="radiogroup">' + s.options.map(function (o, i) { var on = a.i === i; return '<button class="opt" role="radio" aria-checked="' + on + '" data-a="nopt" data-i="' + i + '"><span class="tick" aria-hidden="true">' + (on ? '✓' : '') + '</span><span>' + esc(L(o)) + '</span></button>'; }).join('') + '</div>';
      if (s.soft) h += '<div class="softrow"><button class="softopt" aria-pressed="' + (a.i === -1) + '" data-a="nopt" data-i="-1">' + esc(L(s.soft)) + '</button>' + (s.soft2 ? '<button class="softopt" aria-pressed="' + (a.i === -2) + '" data-a="nopt" data-i="-2">' + esc(L(s.soft2)) + '</button>' : '') + '</div>';
      if (a.i != null && a.i < 0) reply = s.softReply ? L(s.softReply) : ''; else if (a.i != null && a.i >= 0 && s.replies) reply = L(s.replies[a.i]);
    }
    if (s.text) {
      if (s.ideas) h += '<div class="chips">' + s.ideas.map(function (x, i) { return '<button class="chip" data-a="nidea" data-i="' + i + '">' + esc(L(x)) + '</button>'; }).join('') + '</div>';
      h += textField('gtext', a.text || '', L(s.placeholder), true);
      if ((a.text || '').trim() && s.elara) reply = L(s.elara);
      if (s.fmtNote) h += '<p class="fmtnote">' + esc(L(s.fmtNote)) + '</p>';
    }
    if (s.help) {
      h += '<div class="helprow"><button class="helpbtn" data-a="helpnow" aria-expanded="' + !!S.helpOpen + '">' + esc(ES() ? 'Buscar ayuda ahora' : 'Find help now') + '</button></div>';
      if (S.helpOpen) h += '<p class="helpnote" role="note">' + esc(ES() ? 'En la app esto abre «Pedir ayuda ahora» (/crisis-help): emergencias primero, líneas de ayuda de tu país y un recordatorio de que Elara es una IA y no un servicio de crisis.' : 'In the app this opens “Get help now” (/crisis-help): emergency services first, helplines for your country, and a reminder that Elara is an AI, not a crisis service.') + '</p>';
    }
    if (!reply && isCur()) reply = ack(st, a);
    return h + fb(reply ? elara(reply) : '');
  }
  /* A day that builds on earlier ones: recall what she answered (one day, or several when `on` is a list), else this day's own fallback line. */
  function depLine(dep) {
    var area = window.CUR_AREA && window.CUR_AREA[S.w], ons = [].concat(dep.on || []), prev = [];
    ons.forEach(function (on) {
      var m = /^([A-Z]+)-W(\d)-D(\d)$/.exec(on);
      if (!(m && area && window.CUR[area] && m[1] === window.CUR[area][0][0].code.split('-')[0])) return;
      var dd = window.CUR[area][+m[2] - 1][+m[3] - 1], st0 = dd && dd.steps[0], t = st0 && naAnswer({ raw: st0 }, peek(S.w * 1000 + (+m[2]) * 10 + (+m[3]), st0.id));
      if (t) prev.push(t);
    });
    if (prev.length) return '<blockquote class="recall">' + esc((ES() ? 'Antes dijiste: ' : 'Earlier you said: ') + prev.map(function (t) { return ES() ? '«' + t + '»' : '“' + t + '”'; }).join(' · ')) + '</blockquote>';
    return '<p class="depnote">' + esc(L(dep)) + '</p>';
  }
  function naAnswer(st, a) { var s = st.raw; if (!a) return ''; if (a.i != null && a.i < 0) return ''; if (s.multi && a.m && a.m.length) return a.m.map(function (i) { return L(s.options[i]); }).join(', '); if (a.i != null && s.options) return lc(L(s.options[a.i])); if ((a.text || '').trim()) return a.text.trim(); return ''; }
  /* ── Curriculum journeys (weeks 6-10): place, memory and week close ── */
  function segFor(d) { var a = WK[S.w] || []; for (var i = 0; i < a.length; i++) if (d >= a[i].days[0] && d <= a[i].days[1]) return { i: i, g: a[i] }; return null; }
  function placeOf(d) { var x = segFor(d); if (!x) return null; var p = (window.PLACES && window.PLACES[S.w] || [])[x.i]; return { img: x.g.img, n: p ? p.n : L(x.g.place).split(',')[0], note: p ? L(p) : '' }; }
  function region() { return worldName().split(' · ')[0]; }
  function curDay(d) { var a = window.CUR_AREA && window.CUR_AREA[S.w]; return a && window.CUR[a] ? window.CUR[a][(S.cw || 1) - 1][d - 1] : null; }
  function mainAnswer(d) { var dd = curDay(d), st0 = dd && dd.steps[0]; return st0 ? naAnswer({ raw: st0 }, peek(S.w * 1000 + (S.cw || 1) * 10 + d, st0.id)) : ''; }
  function takeaway() { var d1 = curDay(1), t = d1 ? L(d1.intro) : ''; return t.replace(/^(Para llevarte esta semana|To take with you this week):\s*/, ''); }
  function greet() {
    var d = S.d, prev = d > 1 ? mainAnswer(d - 1) : '', t = takeaway();
    if (d === 1) return ES() ? 'Bienvenida a ' + region() + '. Al final de esta semana te llevas: ' + lc(t) : 'Welcome to ' + region() + '. By the end of this week you take with you: ' + lc(t);
    var last = d === 7 ? (ES() ? ' Hoy cerramos la semana; al terminar la verás completa.' : ' Today we close the week; at the end you will see all of it.') : '';
    if (prev) return (ES() ? 'Ayer dijiste: «' + prev + '». Hoy seguimos desde ahí.' : 'Yesterday you said: “' + prev + '”. Today we pick up from there.') + last;
    return last.trim();
  }
  /* Elara answers every main question, even when the day has no written reply: she names what was kept, never judges it. */
  function ack(st, a) {
    if (st.id !== 'q') return ''; var t = naAnswer(st, a), k = (S.cw * 7 + S.d) % 3, more = S.d < 7 ? (ES() ? ' Mañana lo retomamos.' : ' We pick it up tomorrow.') : '';
    if (!t) return '';
    if (st.raw.text) return (ES() ? ['Lo guardé con tus palabras.', 'Gracias por ponerlo en palabras.', 'Queda guardado tal como lo escribiste.'] : ['Saved in your own words.', 'Thank you for putting it into words.', 'Kept exactly as you wrote it.'])[k] + more;
    return (ES() ? ['Anotado: «', 'Lo guardo: «', 'Queda anotado: «'][k] + t + '».' : ['Noted: “', 'Kept: “', 'Noted down: “'][k] + t + '”.') + more;
  }
  /* A Love day's safety sentence sits inside its optional step: show it as its own calm note, not in the bold title. */
  function splitSafe(txt) { var m = /(Si no te sientes segura|If you (do not|don't) feel safe)/.exec(txt); return m ? [txt.slice(0, m.index).trim(), txt.slice(m.index).trim()] : [txt, '']; }
  function weekCard() {
    var rows = [], any = 0;
    for (var d = 1; d <= 7; d++) { var pl = placeOf(d), t = mainAnswer(d); if (t) any++; rows.push('<li><img src="img/rt/' + pl.img + '.jpg" alt=""><span><b>' + esc((ES() ? 'Día ' : 'Day ') + d + ' · ' + pl.n) + '</b><small>' + esc(t || (ES() ? 'Lo pasaste. Está bien.' : 'You skipped it. That is fine.')) + '</small></span></li>'); }
    return '<div class="weekcard"><h3>' + esc(ES() ? 'Tu semana en ' + region() : 'Your week in ' + region()) + '</h3><p class="sub">' + esc((ES() ? 'Te llevas: ' : 'You take with you: ') + lc(takeaway())) + '</p><ul>' + rows.join('') + '</ul>' + (any ? '' : '<p class="sub">' + esc(ES() ? 'Esta semana no anotaste nada, y está bien. Los siete lugares siguen aquí.' : 'You did not note anything this week, and that is fine. The seven places are still here.') + '</p>') + '</div>';
  }
  function nextLine() {
    if (S.d < 7) { var pl = placeOf(S.d + 1); return '<div class="nextday"><img src="img/rt/' + pl.img + '.jpg" alt=""><p>' + esc(ES() ? 'Mañana te espera ' + pl.n + '.' : 'Tomorrow: ' + pl.n + '.') + '</p></div>'; }
    var f = placeOf(1);
    return '<p class="tomorrow">' + esc((S.cw || 1) < 5 ? (ES() ? 'Semana completa. La semana ' + ((S.cw || 1) + 1) + ' empieza otra vez en ' + f.n + '.' : 'Week complete. Week ' + ((S.cw || 1) + 1) + ' starts again at ' + f.n + '.') : (ES() ? 'Terminaste las cinco semanas de esta área.' : 'You finished the five weeks of this area.')) + '</p>';
  }
  function sumNA() {
    var n = dayNo(), N = QW()[S.d - 1], parts = [];
    if (N.cur) {
      var lines = [];
      curSteps().forEach(function (st) { var t = naAnswer(st, peek(n, st.id)); if (t) lines.push({ id: st.id, t: splitSafe(L(st.raw.title))[0], s: t }); });
      return { head: L(N.title), note: '', lines: lines, unknown: [], next: L(N.tomorrow), empty: !lines.length, emptyText: ES() ? 'Hoy no anotaste nada, y está bien. El lugar sigue aquí.' : 'You didn’t note anything today, and that’s fine. The place is still here.' };
    }
    curSteps().forEach(function (st) { var t = naAnswer(st, peek(n, st.id)); if (t && st.raw.note) parts.push(tpl(L(st.raw.note), { a: t })); });
    var note = parts.length ? (ES() ? 'Hoy dijiste que ' : 'Today you said that ') + parts.join(ES() ? '; ' : '; ') + '.' : '';
    return { head: L(N.title), note: note, lines: [], unknown: [], next: L(N.tomorrow), empty: !parts.length, emptyText: ES() ? 'Hoy no anotaste nada, y está bien. El lugar sigue aquí.' : 'You didn’t note anything today, and that’s fine. The place is still here.' };
  }
  /* Everything she wrote or chose on day d of this week, in one line (day 7's recall). Empty when she skipped it. */
  function weekAnswer(d) {
    var n = (S.w - 1) * 7 + d, parts = [];
    Object.keys(A).forEach(function (k) {
      if (k.indexOf(n + '.') !== 0) return; var a = A[k] || {};
      if (a.f) a.f.filter(Boolean).forEach(function (x) { parts.push(x); });
      if (a.o && a.o.length) parts.push(a.o.join(', '));
      if (a.sel && typeof a.sel === 'string') parts.push(a.sel);
      if (a.sel && a.sel.length && typeof a.sel !== 'string') parts.push(a.sel.join(', '));
      if (a.chip) parts.push(a.chip);
      if ((a.text || '').trim()) parts.push(a.text.trim());
    });
    return parts.join(' · ').slice(0, 220);
  }
  function genAnswerText(st, a) {
    if (!a) return ''; if (a.f && a.f.filter(Boolean).length) return a.f.filter(Boolean).join(' · ');
    if (a.o && a.o.length) return a.o.join(', ') + (a.other ? ' (' + a.other + ')' : '');
    if (a.text) return a.text; if (a.c) { var s = st.raw; return Object.keys(a.c).map(function (i) { return s.items[i] + ': ' + s.columns[a.c[i]]; }).join('; '); } return '';
  }

  /* ───────── dispatch: render step, primary label, submit ───────── */
  function renderStepBody(st) {
    switch (st.type) {
      case 'ctx': return R_ctx(); case 'sort': return R_sort(); case 'choice': return st === D[4].closest ? R_closest() : R_matters();
      case 'fact': return R_fact(); case 'kind': return R_kind(); case 'compare': return R_compare(); case 'read': return R_read(st);
      case 'ask': return R_ask(); case 'carry': return R_carry(); case 'na': return R_na(st); default: return R_gen(st);
    }
  }
  function stepAnswered(st) {
    var n = dayNo(), a = peek(n, st.id);
    switch (st.type) {
      case 'ctx': return (a.sel || []).length > 0;
      case 'sort': return !!(a.as && Object.keys(a.as).length);
      case 'choice': return !!a.sel;
      case 'fact': return !!(a.chip || (a.text || '').trim());
      case 'kind': return !!a.sel;
      case 'compare': return !!a.choice || (a.mine && a.offers && JSON.stringify(a.offers).length > 40);
      case 'read': return true;
      case 'ask': return (a.qs || []).length > 0;
      case 'carry': return !!(a.chip || (a.text || '').trim());
      case 'na': return st.raw.recall ? true : (a.i != null || !!(a.m && a.m.length) || !!(a.text || '').trim());
      default: var s = st.raw; return !!((a.o && a.o.length) || (a.f && a.f.filter(Boolean).length) || a.text || a.c);
    }
  }
  function primary(st) {
    var n = dayNo(), a = peek(n, st.id), last = S.i === curSteps().length - 1;
    var label = last ? L(C.summary) : L(C.cont), dis = false;
    if (st.type === 'read') label = last ? L(C.summary) : L(C.understood);
    if (st.type === 'sort') { if (!a.checked) { label = L(C.check); dis = !(a.as && Object.keys(a.as).length); } }
    else if (st.type === 'na') { if (st.raw.cta && !last) label = L(st.raw.cta); dis = !stepAnswered(st); }
    else if (st.type === 'gen') { if (st.raw.cta && !last) label = st.raw.cta; dis = false; }
    else if (st.type !== 'read') dis = !stepAnswered(st);
    if (S.fromSummary) label = L(C.summary);
    return { label: label, dis: dis };
  }
  function validateStep(st) {
    var n = dayNo(), a = get(n, st.id);
    if (st.type === 'ctx') {
      var bad = null;
      ['pay', 'inc'].forEach(function (k) { if ((a.sel || []).indexOf(k) < 0 || !a[k]) return; var dw = a[k].date; if (dw && dw.mode === 'confirmed') { dw.touched = true; if (dateErr(dw)) bad = bad || ('dv-' + k); } var p = parseAmt((a[k].amount || {}).raw); if (p.bad) bad = bad || ('am-' + k); });
      if (bad) return { stay: true, focus: bad };
    }
    if (st.type === 'compare' && a.mine) {
      var b2 = null; ['A', 'B'].forEach(function (nn) { var o = (a.offers || {})[nn] || {}; ['recv', 'cost', 'hours'].forEach(function (f) { if (parseAmt(o[f]).bad) b2 = b2 || 1; }); if (o.pay && o.pay.mode === 'confirmed') { o.pay.touched = true; if (dateErr(o.pay)) b2 = b2 || 1; } });
      if (b2) return { stay: true };
    }
    return null;
  }
  function submit(st) {
    var n = dayNo(), a = get(n, st.id), v = validateStep(st); if (v) return v;
    if (st.type === 'sort' && !a.checked) { a.checked = true; return { stay: true }; }
    if (st.type === 'fact') {
      var t = (a.text || '').trim();
      if (t && nonAnswerLite(t) && !a.retried) { a.retry = true; a.retried = true; return { stay: true }; }
      a.retry = false; a.sent = !!t; S.voice = { state: 'idle', interim: '' };
    }
    if (st.type === 'carry') {
      var t2 = (a.text || '').trim(); a.clar = a.clar || {};
      if (t2 && nonAnswerLite(t2) && !a.retried) { a.retry = true; a.retried = true; return { stay: true }; }
      a.retry = false;
      if (t2 && !a.chip && feelingLike(t2) && !a.clar.shown) { a.clar.shown = true; a.feeling = true; return { stay: true }; }
      if (t2 && !a.chip && feelingLike(t2)) a.feeling = true; else a.feeling = false;
      if (a.clar.shown && !a.clar.choice) { a.clar.choice = 'move'; }
      a.sent = !!t2; S.voice = { state: 'idle', interim: '' };
    }
    if (st.type === 'gen') { var s = st.raw; if (a.text != null || a.o || a.f) {} }
    return null;
  }

  /* ───────── summaries (only what she supplied) ───────── */
  function optLabel(list, id) { var o = list.filter(function (x) { return x.id === id; })[0]; return o ? L(o.label) : ''; }
  function sumD4() {
    var lines = [], unknown = [], next = '', ctx = peek(4, 'ctx'), sel = ctx.sel || [], sc = sortScore(), a = peek(4, 'sort');
    var any = false;
    if (a.checked && sc.t) { any = true; lines.push({ id: 'sort', t: ES() ? 'Practicaste separar tres casos: acertaste ' + sc.n + ' de ' + sc.t + '.' : 'You practised telling three cases apart: you got ' + sc.n + ' of ' + sc.t + '.', s: ES() ? 'Llega tarde es de fechas, no alcanza es de cantidades, y un dato que falta no es cero.' : 'Late is about dates, not enough is about amounts, and a missing fact is not zero.' }); }
    if (sel.length) {
      any = true;
      var parts = [];
      if (sel.indexOf('none') > -1) parts.push(ES() ? 'esta semana no tienes un pago por vencer ni dinero esperado' : 'this week you have no payment coming due and no money expected');
      else if (sel.indexOf('unsure') > -1) parts.push(ES() ? 'no estabas segura de si hay un pago o dinero por llegar' : 'you were not sure whether there is a payment or money coming');
      else {
        if (sel.indexOf('pay') > -1) { var pd = describeDate((ctx.pay || {}).date); parts.push(ES() ? 'tienes un pago por vencer' + (pd ? ' (' + pd + ')' : '') : 'a payment is coming due' + (pd ? ' (' + pd + ')' : '')); if (dateKind((ctx.pay || {}).date).k !== 'c') unknown.push(ES() ? 'Cuándo vence el pago' : 'When the payment is due'); }
        if (sel.indexOf('inc') > -1) { var idd = describeDate((ctx.inc || {}).date); parts.push(ES() ? 'esperas dinero' + (idd ? ' (' + idd + ')' : '') : 'you are expecting money' + (idd ? ' (' + idd + ')' : '')); if (dateKind((ctx.inc || {}).date).k !== 'c') unknown.push(ES() ? 'Cuándo llega el dinero' : 'When the money arrives'); }
      }
      lines.push({ id: 'ctx', t: (ES() ? 'Dijiste que ' : 'You said ') + parts.join(ES() ? ' y ' : ' and ') + '.', s: d4ctxLines().join(' ') });
    }
    var cl = peek(4, 'closest'); if (cl.sel && d4Personal()) { any = true; lines.push({ id: 'closest', t: (ES() ? 'Se parece más a: ' : 'Closest to: ') + optLabel(D[4].closest.options, cl.sel) + '.' }); }
    var kd = peek(4, 'kind'); if (kd.sel && d4Personal()) { any = true; lines.push({ id: 'kind', t: (ES() ? 'Por ahora lo ves así: ' : 'For now you see it as: ') + lc(optLabel(D[4].kind.options, kd.sel)) + '.', s: (kd.next ? (ES() ? 'Siguiente dato: ' : 'Next fact: ') + kd.next : '') }); if (kd.sel === 'unknown') unknown.push(ES() ? 'Qué dato falta' : 'Which fact is missing'); }
    var fa = peek(4, 'fact');
    if (d4Personal() && (fa.chip || (fa.text || '').trim())) {
      any = true; var lab = fa.chip ? lc(optLabel(D[4].fact.chips, fa.chip)) : '';
      lines.push({ id: 'fact', t: (ES() ? 'Dato que te ayudaría: ' : 'A fact that would help: ') + (lab || '') + '.', s: (fa.text && fa.text.trim() ? (ES() ? 'Escribiste: «' : 'You wrote: “') + fa.text.trim() + (ES() ? '»' : '”') : '') });
      if (fa.chip === 'date') next = ES() ? 'Si te sirve, el siguiente paso es confirmar esa fecha con quien te paga o a quien le pagas.' : 'If useful, your next step is to confirm that date with whoever pays you or whoever you pay.';
      else if (fa.chip === 'amount') next = ES() ? 'Si te sirve, el siguiente paso es confirmar la cantidad; mientras tanto, márcala como aproximada.' : 'If useful, your next step is to confirm the amount; until then, mark it as approximate.';
      else if (fa.chip === 'covers') next = ES() ? 'Si te sirve, el siguiente paso es reunir tres datos: cuánto hay, cuándo llega y cuándo vence el pago.' : 'If useful, your next step is to gather three facts: how much there is, when it arrives, and when the payment is due.';
    }
    var head = ES() ? 'Lo que anotaste hoy' : 'What you noted today';
    if (!any) head = ES() ? 'Hoy no anotaste nada' : 'You did not note anything today';
    return { head: head, lines: lines, unknown: unknown, next: next, empty: !any, emptyText: ES() ? 'Los ejemplos siguen aquí cuando quieras volver a ellos.' : 'The examples stay here whenever you want to come back to them.' };
  }
  function sumD11() {
    var lines = [], unknown = [], next = '', b = peek(11, 'before'), any = false, rv = b.revealed || {};
    var seen = rv.cost || rv.time || rv.pay || b.choice;
    if (seen && !b.mine) { any = true; lines.push({ id: 'before', t: ES() ? 'En los ejemplos, los dos dejan 40. A usa 10 horas (4 por hora); B usa 6 (unos ' + fmtN(40 / 6) + ' por hora).' : 'In the examples, both leave 40. A uses 10 hours (4 an hour); B uses 6 (about ' + fmtN(40 / 6) + ' an hour).', s: ES() ? 'Del día de pago de B no se sabe nada. Un dato desconocido no es cero.' : 'Nothing is known about B\'s payday. An unknown fact is not zero.' }); unknown.push(ES() ? 'El día de pago de B' : 'B\'s payday'); }
    if (b.mine) { var ml = mineLines(b); any = true; lines.push({ id: 'before', t: ES() ? 'Con tus números:' : 'With your numbers:', s: ml.join(' ') }); ['A', 'B'].forEach(function (n) { var c = offerCalc((b.offers || {})[n] || {}); if (c.net == null) unknown.push((ES() ? 'Lo que queda en ' : 'What is left in ') + n); if (c.payKind !== 'c' && c.payKind !== 'a') unknown.push((ES() ? 'Día de pago de ' : 'Payday of ') + n); }); }
    var m = peek(11, 'matters'); if (m.sel) { any = true; var lab = optLabel(D[11].matters.options, m.sel); lines.push({ id: 'matters', t: (ES() ? 'Lo que más pesa para ti: ' : 'What matters most to you: ') + lc(lab) + (m.sel === 'other' && m.other ? ' (' + m.other + ')' : '') + '.' }); }
    var ak = peek(11, 'ask'); if ((ak.qs || []).length) { any = true; lines.push({ id: 'ask', t: (ES() ? 'Preguntarías: ' : 'You would ask: ') + ak.qs.map(function (id) { return lc(L(D[11].ask.qs.filter(function (q) { return q.id === id; })[0].label)); }).join(' · '), s: ES() ? 'Mensaje preparado; no se envió a nadie.' : 'Message prepared; it was not sent to anyone.' }); next = ES() ? 'Si te sirve, el siguiente paso es enviar ese mensaje o dejarlo listo. El Día 12 te ayuda a prepararlo.' : 'If useful, your next step is to send that message or leave it ready. Day 12 helps you prepare it.'; }
    var cr = peek(11, 'carry'); var ct = (cr.text || '').trim();
    if (cr.chip || ct) {
      any = true;
      if (cr.feeling && !cr.chip) lines.push({ id: 'carry', t: (ES() ? 'Escribiste: «' : 'You wrote: “') + ct + (ES() ? '». ' : '”. ') + (ES() ? 'No lo contamos como algo por revisar.' : 'We do not count it as something to check.') });
      else lines.push({ id: 'carry', t: (ES() ? 'Antes de tu próxima decisión de dinero revisarás: ' : 'Before your next money decision you will check: ') + [cr.chip ? lc(optLabel(D[11].carry.chips, cr.chip)) : '', ct ? '«' + ct + '»' : ''].filter(Boolean).join(' · ') + '.' });
    }
    var head = any ? (ES() ? 'Lo que anotaste hoy' : 'What you noted today') : (ES() ? 'Hoy no anotaste nada' : 'You did not note anything today');
    return { head: head, lines: lines, unknown: unknown, next: next, empty: !any, emptyText: ES() ? 'Los ejemplos siguen aquí cuando quieras volver a ellos.' : 'The examples stay here whenever you want to come back to them.' };
  }
  function sumGen() {
    var n = dayNo(), lines = [];
    curSteps().forEach(function (st) { var a = peek(n, st.id); var t = genAnswerText(st, a); if (t) lines.push({ id: st.id, t: t, s: tokenSub(st.raw.title, tokenSub(st.raw.titleFallback, '')) }); });
    return { head: lines.length ? (ES() ? 'Lo que anotaste hoy' : 'What you noted today') : (ES() ? 'Hoy no anotaste nada' : 'You did not note anything today'), lines: lines, unknown: [], next: '', empty: !lines.length, emptyText: ES() ? 'Puedes volver a este día cuando quieras.' : 'You can come back to this day whenever you like.' };
  }
  function summaryFor(n) { return n > 600 ? sumNA() : n === 4 ? sumD4() : (n === 11 ? sumD11() : sumGen()); }
  function R_summary() {
    var n = dayNo(), sm = summaryFor(n), paused = STATUS[n] === 'paused';
    var h = '<div class="sum"><h2>' + esc(sm.head) + '</h2>';
    if (paused) h += '<p class="sub">' + esc(ES() ? 'Dejaste el día a medias. Tus respuestas siguen guardadas.' : 'You left the day halfway. Your answers are kept.') + '</p>';
    if (sm.empty) h += '<p class="sub">' + esc(sm.emptyText) + '</p>';
    else if (sm.note) h += '<p class="daynote">' + esc(sm.note) + '</p>';
    else h += '<ul>' + sm.lines.map(function (l) { return '<li>' + (isUp(n) ? '<button class="ed" data-a="goto" data-id="' + l.id + '" aria-label="' + esc((ES() ? 'Editar: ' : 'Edit: ') + l.t) + '">' + esc(ES() ? 'Editar' : 'Edit') + '</button>' : '') + esc(l.t) + (l.s ? '<small>' + esc(l.s) + '</small>' : '') + '</li>'; }).join('') + '</ul>';
    if (sm.unknown.length) h += '<p class="sub" style="margin-bottom:2px"><b>' + esc(ES() ? 'Sigue sin saberse' : 'Still unknown') + '</b></p><ul>' + sm.unknown.map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul>';
    if (isCur() && placeOf(S.d)) { if (S.d === 7) h += weekCard(); h += nextLine(); }
    else if (sm.next) h += n > 600 ? '<p class="tomorrow">' + esc(sm.next) + '</p>' : elara(sm.next);
    h += '<p class="sav" id="savedline">' + esc(savedText()) + '</p></div>';
    return h;
  }
  function R_atlas() {
    var w = S.w, lines = [], n0 = (w - 1) * 7 + 1, cnt = 0;
    for (var n = n0; n < n0 + 7; n++) { var sm = summaryFor2(n); cnt += sm; }
    var any = cnt > 0;
    var h = '<div class="sum"><h2>' + esc(worldName()) + '</h2><p class="sub">' + esc('Money Clarity · ' + (ES() ? 'Semana ' : 'Week ') + w) + '</p>';
    h += '<p>' + esc(any ? (ES() ? 'Esta semana anotaste respuestas en ' + cnt + ' ' + plural(cnt, 'paso', 'pasos', 'step', 'steps') + '.' : 'This week you noted answers in ' + cnt + ' ' + plural(cnt, 'step', 'steps', 'step', 'steps') + '.') : (ES() ? 'Esta semana no anotaste respuestas. Los días siguen disponibles.' : 'You did not note any answers this week. The days are still available.')) + '</p>';
    h += '<p class="sav" id="savedline">' + esc(savedText()) + '</p></div>';
    return h;
  }
  function summaryFor2(n) { var c = 0; var keys = Object.keys(A); keys.forEach(function (k) { if (k.indexOf(n + '.') === 0) { var a = A[k]; if ((a.o && a.o.length) || (a.f && a.f.filter(Boolean).length) || a.text || a.sel || a.chip || (a.qs && a.qs.length) || (a.as && Object.keys(a.as).length)) c++; } }); return c; }

  /* ───────── panel content ───────── */
  function render(animate) {
    layout();
    var panel = $('.panel'); if (!panel) return;
    var n = dayNo(), steps = curSteps(), N = steps.length, body = '', foot = '', prog = '', title = '';
    var scrollTop = $('.pbody') ? $('.pbody').scrollTop : 0;
    var fullKeep = S._keepScroll; S._keepScroll = false;
    if (S.panel === 'landscape') {
      panel.innerHTML = '<div class="dragzone">' + grabHTML() + '</div><div class="strip"><button class="go" data-a="backq">' + esc(L(C.backToQ)) + '</button></div>';
      afterRender(animate, 0); return;
    }
    if (S.view === 'arrive') {
      var d = isUp(n) ? D[n] : null, day = MJ[S.lang][n - 1], done = STATUS[n] === 'done', paused = STATUS[n] === 'paused';
      if (n > 600) { var NN = QW()[S.d - 1]; day = { title: L(NN.title), body: L(NN.intro) }; }
      var ttl = d ? L(d.title) : (day.title || ''), intro = d ? L(d.intro) : ((day.intro && day.intro.note) || day.body || '');
      var pla = isCur() && placeOf(S.d);
      if (pla) body = '<div class="arr"><p class="dayn">' + esc(region() + ' · ' + (ES() ? 'Semana ' : 'Week ') + (S.cw || 1) + ' · ' + (ES() ? 'Día ' : 'Day ') + S.d + (ES() ? ' de 7' : ' of 7')) + '</p><h1>' + esc(pla.n) + '</h1>' + (pla.note ? '<p class="placenote">' + esc(pla.note) + '</p>' : '') + '<p class="weektheme">' + esc((ES() ? 'Esta semana: ' : 'This week: ') + ttl) + '</p><div class="elara" style="margin-top:6px">' + ORB + '<div><p>' + esc(greet() || intro) + '</p></div></div>' + (S.d > 1 && greet() ? '<p class="fmtmeta">' + esc(intro) + '</p>' : '') + '</div>';
      else body = '<div class="arr"><p class="dayn">' + esc(worldName() + ' · ' + (isCur() ? (ES() ? 'Semana ' : 'Week ') + (S.cw || 1) + ' · ' : '') + (ES() ? 'Día ' : 'Day ') + dayNoInWeek()) + '</p><h1>' + esc(ttl) + '</h1><div class="elara" style="margin-top:6px">' + ORB + '<div><p>' + esc(intro) + '</p></div></div></div>';
      if (done) foot = '<button class="skip" data-a="restart">' + esc(S.confirmRestart ? (ES() ? 'Sí, borrar y empezar' : 'Yes, clear and start') : (ES() ? 'Empezar de nuevo' : 'Start again')) + '</button><span class="spacer"></span><button class="go" data-a="summary">' + esc(ES() ? 'Ver resumen' : 'See summary') + '</button>' + '<button class="skip" data-a="review">' + esc(ES() ? 'Repasar' : 'Review') + '</button>';
      else foot = '<span class="spacer"></span><button class="go wide" data-a="start">' + esc(paused ? (ES() ? 'Retomar' : 'Resume') : (ES() ? 'Empezar' : 'Start')) + '</button>';
      prog = ''; if (done) body += '<p class="note">' + esc(ES() ? 'Ya terminaste este día. Repasarlo no lo reinicia; empezar de nuevo borra tus respuestas de este día.' : 'You finished this day. Reviewing does not restart it; starting again clears this day\'s answers.') + '</p>';
    } else if (S.view === 'summary') {
      body = R_summary(); prog = ES() ? 'Resumen' : 'Summary';
      foot = '<button class="skip" data-a="again">' + esc(ES() ? 'Volver a recorrer' : 'Go through again') + '</button><span class="spacer"></span>' + (S.w < 5 && S.d === 7 ? '<button class="go" data-a="atlas">' + esc(ES() ? 'Ver mi semana' : 'See my week') + '</button>' : '<button class="go" data-a="home">' + esc(ES() ? 'Volver a Hoy' : 'Back to Today') + '</button>');
    } else if (S.view === 'atlas') {
      body = R_atlas(); prog = ES() ? 'Tu semana' : 'Your week'; foot = '<span class="spacer"></span><button class="go wide" data-a="home">' + esc(ES() ? 'Volver a Hoy' : 'Back to Today') + '</button>';
    } else {
      var st = steps[S.i]; if (!st) { S.view = 'summary'; return render(animate); }
      body = renderStepBody(st); prog = tpl(L(C.stepOf), { i: S.i + 1, n: N });
      var pr = primary(st);
      foot = ((st.optional || st.type === 'gen') && st.type !== 'read' && !(st.type === 'na' && (st.raw.soft || st.raw.recall)) ? '<button class="skip" data-a="skip">' + esc(st.type === 'gen' && st.raw.skipLabel ? st.raw.skipLabel : L(C.skip)) + '</button>' : '') + '<span class="spacer"></span><button class="go" data-a="primary"' + (pr.dis ? ' disabled' : '') + '>' + esc(pr.label) + '</button>';
    }
    var exp = S.panel === 'expanded';
    panel.innerHTML = '<div class="dragzone">' + grabHTML() + '<div class="phead"><span class="prog">' + esc(prog) + '</span><span class="tools"><button data-a="toggleexp" aria-label="' + esc(exp ? L(C.shrink) : L(C.expand)) + '" aria-expanded="' + exp + '"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (exp ? '<path d="M5 8l5 5 5-5"/>' : '<path d="M5 12l5-5 5 5"/>') + '</svg></button></span></div></div><div class="pbody" tabindex="-1">' + body + '</div><div class="pfoot">' + foot + '</div>';
    var pb = $('.pbody'); if (pb && (fullKeep || S._same)) pb.scrollTop = scrollTop;
    afterRender(animate, 1);
    $$('textarea.ta[data-a="ta"], textarea.ta[data-a="msg"]').forEach(grow);
  }
  function dayNoInWeek() { return S.d; }
  function grabHTML() { return '<button class="grab" data-a="grab" aria-label="' + esc(ES() ? 'Ajustar la altura del panel' : 'Adjust the panel height') + '"><i></i></button>'; }
  function afterRender(animate, mode) {
    applyH(animate === false ? false : true);
    drawScene(S._sceneAnim);
    S._sceneAnim = false;
    var se = $('.seebtn'); if (se) se.style.visibility = S.panel === 'landscape' ? 'hidden' : 'visible';
    var tip = $('.tipslot'); if (tip) tip.innerHTML = S.tip ? '<div class="tip"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#2a2620" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="15" cy="15" r="12.5" fill="#f4c986"/><circle cx="10.5" cy="12.5" r="1.3" fill="#2a2620" stroke="none"/><circle cx="19.5" cy="12.5" r="1.3" fill="#2a2620" stroke="none"/><path d="M9.5 18c1.4 2.6 9.6 2.6 11 0"/></svg><div><b>' + esc(placeName()) + '</b>' + esc(stopName()) + '</div></div>' : '';
    var pn = $('[data-a="pin"]'); if (pn) pn.setAttribute('aria-expanded', String(S.tip));
    side();
  }
  function showReply() { var f = $('#fb .elara'), pb = $('.pbody'); if (!f || !pb) return; var fr = f.getBoundingClientRect(), pr = pb.getBoundingClientRect(); if (fr.bottom > pr.bottom - 4) pb.scrollTop += fr.bottom - pr.bottom + 12; }
  function grow(t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight + 2, 180) + 'px'; }
  function rerenderKeep() { S._keepScroll = true; S._same = true; var ae = document.activeElement, id = ae && ae.id; render(false); S._same = false; if (id) { var e = document.getElementById(id); if (e) e.focus(); } }
  function updateFb() { var f = $('#fb'); if (!f) return; var st = curSteps()[S.i]; if (!st) return; var tmp = document.createElement('div'); tmp.innerHTML = renderStepBody(st); var nf = $('#fb', tmp); if (nf) f.innerHTML = nf.innerHTML; var pf = $('[data-a="primary"]'); if (pf) { var pr = primary(st); pf.disabled = pr.dis; pf.textContent = pr.label; } if (S.panel === 'answer') applyH(true); }

  /* ───────── side panel (outside the member-facing flow) ───────── */
  function side() {
    var n = dayNo();
    var up = isUp(n);
    var rows = X.PROPOSED.map(function (p) { return '<tr><td>' + esc(p.id) + '</td><td>' + esc(p.why) + '</td></tr>'; }).join('');
    $('#side').innerHTML =
      '<span class="tag">' + (up ? 'Día actualizado · W' + S.w + ' D' + S.d : 'Día sin actualizar (contenido V4 sin cambios)') + '</span>' +
      '<p><b>Qué es esto.</b> Prototipo privado, no la app. Dos días rehechos con el mismo panel: <b>Semana 1 · Día 4</b> y <b>Semana 2 · Día 4 (día 11)</b>. Los demás días se abren con el mismo panel y su contenido V4 tal como está.</p>' +
      '<p><b>Contenido.</b> Money Clarity V4 (build del 19 oct 2026) tal como está en <code>ux/circles-clarity-2026-10-21</code> (cb7f602). Textos nuevos o reescritos: ' + X.PROPOSED.length + ', marcados como propuesta para Alejandra.</p>' +
      '<p><b>Guardado.</b> Solo en este navegador (localStorage). No sincroniza con ninguna cuenta ni con la app.</p>' +
      '<p><b>Texto libre.</b> No hay conexión a la IA de la app. Las respuestas de Elara son escritas a mano y se eligen según lo que ella marca; el texto libre se guarda tal cual y no se interpreta. La clarificación de «me siento raro» se activa con una regla simple de longitud y frases en primera persona, solo en este prototipo.</p>' +
      '<p><b>Paisaje.</b> Imágenes generadas por IA (Imagen generada por IA). Semana 1 días 1 a 5: bahía de Lan Hạ. Semanas 2 a 5: paisajes hechos con Codex (Taj Mahal, Yuanyang, Jaipur y Kioto, Katmandú), recorridos lentamente a lo largo de la semana. Faltan días de la semana 1 (6 y 7) y más paisajes para variar cada día.</p>' +
      '<details><summary>Textos propuestos (' + X.PROPOSED.length + ')</summary><table><tr><th>id</th><th>por qué</th></tr>' + rows + '</table></details>';
  }

  /* ───────── navigation ───────── */
  function go(w, d, view) { S.w = w; S.d = d; S.view = view || 'arrive'; S.i = 0; S.help = false; S.tip = false; S.confirmRestart = false; S.fromSummary = false; S.panel = 'answer'; S.voice = { state: 'idle', interim: '' }; labels(); render(true); }
  function nextStep() {
    var steps = curSteps(), st = steps[S.i];
    S._sceneAnim = true; S.help = false; S.voice = { state: 'idle', interim: '' };
    if (S.fromSummary) { S.fromSummary = false; S.view = 'summary'; STATUS[dayNo()] = 'done'; persist(); render(true); return; }
    if (S.i < steps.length - 1) { S.i++; } else { S.view = 'summary'; STATUS[dayNo()] = 'done'; }
    persist(); render(true);
    var pb = $('.pbody'); if (pb) pb.scrollTop = 0;
  }
  function prevStep() {
    S._sceneAnim = true; S.help = false;
    if (S.view === 'atlas') { S.view = 'summary'; } else if (S.view === 'summary') { S.view = 'step'; S.i = Math.max(0, curSteps().length - 1); S.fromSummary = false; } else if (S.view === 'step') { if (S.i > 0) S.i--; else S.view = 'arrive'; }
    render(true);
  }
  function labels() {
    $('#gw').innerHTML = '<span class="lbl">' + (ES() ? 'Semana' : 'Week') + '</span>' + (window.MJ_WEEKS || [1, 2, 3, 4, 5, 6, 7, 8, 9]).map(function (w) { return '<button data-w="' + w + '" aria-pressed="' + (S.w === w) + '">' + w + '</button>'; }).join('');
    $('#gd').innerHTML = '<span class="lbl">' + (ES() ? 'Día' : 'Day') + '</span>' + [1, 2, 3, 4, 5, 6, 7].slice(0, (S.w === 7 || S.w === 8) && !isCur() ? 5 : 7).map(function (d) { var up = (S.w === 1 && d === 4) || (S.w === 2 && d === 4); return '<button data-d="' + d + '"' + (up ? ' class="up" title="' + (ES() ? 'Día actualizado' : 'Updated day') + '"' : '') + ' aria-pressed="' + (S.d === d) + '" aria-label="' + (ES() ? 'Día ' : 'Day ') + d + (up ? (ES() ? ', actualizado' : ', updated') : '') + '">' + d + '</button>'; }).join('');
    var gc = $('#gc'); if (!gc) { gc = document.createElement('div'); gc.className = 'grp'; gc.id = 'gc'; $('#gd').parentNode.insertBefore(gc, $('#gd').nextSibling); }
    gc.hidden = !isCur(); gc.innerHTML = isCur() ? '<span class="lbl">' + (ES() ? 'Semana del área' : 'Area week') + '</span>' + [1, 2, 3, 4, 5].map(function (c) { return '<button data-c="' + c + '" aria-pressed="' + ((S.cw || 1) === c) + '">' + c + '</button>'; }).join('') : '';
    $$('#gl button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.l === S.lang)); });
    $('#b320').setAttribute('aria-pressed', String(S.small)); $('#bfs').setAttribute('aria-pressed', String(S.fs));
  }

  /* ───────── voice ───────── */
  var recog = null;
  function voiceToggle() {
    var SR = window.__fakeSR || window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (S.voice.state === 'rec') { try { recog.stop(); } catch (e) {} return; }
    var st = curSteps()[S.i], field = $('textarea[data-field]'); if (!field) return;
    S.voice = { state: 'rec', interim: '' }; updateVoiceUI();
    try {
      recog = new SR(); recog.lang = ES() ? 'es-ES' : 'en-US'; recog.interimResults = true; recog.continuous = false;
      var finalT = '';
      recog.onresult = function (ev) { var interim = ''; for (var i = ev.resultIndex; i < ev.results.length; i++) { var r = ev.results[i]; if (r.isFinal) finalT += r[0].transcript; else interim += r[0].transcript; } S.voice.interim = interim; var vs = $('#vstat'); if (vs) vs.textContent = voiceStat() + ' ' + interim; };
      recog.onerror = function () { S.voice = { state: 'error', interim: '' }; updateVoiceUI(); };
      recog.onend = function () { if (S.voice.state === 'error') return; voiceDone(finalT); };
      recog.start();
    } catch (e) { S.voice = { state: 'error', interim: '' }; updateVoiceUI(); }
  }
  function voiceDone(txt) {
    var f = $('textarea[data-field]');
    txt = (txt || '').trim();
    if (f && txt) { f.value = (f.value ? f.value.replace(/\s+$/, '') + ' ' : '') + txt; applyText(f); S.voice = { state: 'review', interim: '' }; }
    else S.voice = { state: 'idle', interim: '' };
    updateVoiceUI(); if (f) { grow(f); f.focus(); }
  }
  function updateVoiceUI() { var f = $('textarea[data-field]'), vs = $('#vstat'), m = $('.mic'); if (vs) vs.textContent = voiceStat(); if (m) { m.setAttribute('aria-pressed', String(S.voice.state === 'rec')); } if (f) { f.classList.toggle('listening', S.voice.state === 'rec'); f.classList.toggle('transcript', S.voice.state === 'review'); } }
  function applyText(el) {
    var n = dayNo(), st = curSteps()[S.i]; if (!st) return;
    var a = get(n, st.id);
    if (el.dataset.field === 'gtext') a.text = el.value; else { a.text = el.value; if (st.type === 'fact' || st.type === 'carry') { a.retry = false; } }
    persist();
  }

  /* ───────── events ───────── */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.w && b.closest('#gw')) { go(+b.dataset.w, S.d); return; }
    if (b.dataset.d && b.closest('#gd')) { go(S.w, +b.dataset.d); return; }
    if (b.dataset.c && b.closest('#gc')) { S.cw = +b.dataset.c; go(S.w, 1); return; }
    if (b.dataset.l) { S.lang = b.dataset.l; document.documentElement.lang = S.lang; labels(); S.sceneUrl = ''; render(false); return; }
    if (b.id === 'b320') { S.small = !S.small; S.H0 = 0; labels(); shell(); render(false); return; }
    if (b.id === 'bfs') { S.fs = !S.fs; document.documentElement.style.setProperty('--fs', S.fs ? '1.4' : '1'); labels(); render(false); return; }
    if (b.id === 'bmo') { var on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); document.documentElement.classList.toggle('nomo', on); return; }
    if (b.id === 'brs') { A = {}; STATUS = {}; try { localStorage.removeItem(KEY); } catch (er) {} S.saved = null; go(S.w, S.d); return; }
    var act = b.dataset.a; if (!act) return;
    var n = dayNo(), steps = curSteps(), st = S.view === 'step' ? steps[S.i] : null, a = st ? get(n, st.id) : null;
    switch (act) {
      case 'back': prevStep(); return;
      case 'pin': S.tip = !S.tip; render(false); return;
      case 'see': S.panel = 'landscape'; S.help = false; render(); return;
      case 'backq': S.panel = 'answer'; render(); return;
      case 'toggleexp': S.panel = S.panel === 'expanded' ? 'answer' : 'expanded'; render(); return;
      case 'grab': if (!S._dragged) { S.panel = S.panel === 'expanded' ? 'answer' : (S.panel === 'landscape' ? 'answer' : 'expanded'); render(); } S._dragged = false; return;
      case 'start': S.view = 'step'; S.i = 0; S._sceneAnim = true; render(); return;
      case 'summary': S.view = 'summary'; S._sceneAnim = true; render(); return;
      case 'review': S.view = 'step'; S.i = 0; S._sceneAnim = true; render(); return;
      case 'restart': if (!S.confirmRestart) { S.confirmRestart = true; render(false); return; } Object.keys(A).forEach(function (k) { if (k.indexOf(n + '.') === 0) delete A[k]; }); delete STATUS[n]; S.confirmRestart = false; persist(); S.view = 'step'; S.i = 0; render(); return;
      case 'again': S.view = 'step'; S.i = 0; S._sceneAnim = true; render(); return;
      case 'home': S.view = 'arrive'; S.i = 0; S._sceneAnim = true; render(); return;
      case 'atlas': S.view = 'atlas'; render(); return;
      case 'help': S.help = !S.help; rerenderKeep(); return;
      case 'helpset': var h = st && (st.help || {}).smaller; if (!h) return; var bt = h.buttons[+b.dataset.i]; applyHelpSet(st, bt); S.help = false; rerenderKeep(); persist(); return;
      case 'goto': var steps2 = curSteps(), gi = -1; for (var q = 0; q < steps2.length; q++) if (steps2[q].id === b.dataset.id) { gi = q; break; } if (gi > -1) { S.fromSummary = S.view === 'summary'; S.i = gi; S.view = 'step'; S._sceneAnim = true; render(); } return;
      case 'skip': if (st) { /* skipping leaves the step unanswered; nothing is invented */ } nextStep(); return;
      case 'primary': if (!st) return; var r = submit(st); persist(); if (r && r.stay) { rerenderKeep(); if (r.focus) { var f = document.getElementById(r.focus); if (f) f.focus(); } return; } nextStep(); return;
    }
    if (!st) return;
    /* step-specific actions */
    if (act === 'opt') {
      var id = b.dataset.id;
      if (st.type === 'ctx') { a.sel = a.sel || []; var o = st.options.filter(function (x) { return x.id === id; })[0]; var ix = a.sel.indexOf(id); if (ix > -1) a.sel.splice(ix, 1); else { if (o.excl) a.sel = [id]; else { a.sel = a.sel.filter(function (x) { return x !== 'none' && x !== 'unsure'; }); a.sel.push(id); } } a.sel.forEach(function (k) { if (k === 'pay' || k === 'inc') a[k] = a[k] || {}; }); S._same = true; }
      else if (st.type === 'choice') { if (st === D[11].matters) a.sel = id; else a.sel = id; }
      else if (st.type === 'compare') { a.choice = id; ['cost', 'time', 'pay'].forEach(function (k) { a.revealed = a.revealed || {}; a.revealed[k] = true; }); }
      else if (st.type === 'kind') a.sel = id;
      persist(); rerenderKeep(); return;
    }
    if (act === 'sort') { a.as = a.as || {}; a.as[b.dataset.it] = b.dataset.c; a.checked = false; persist(); rerenderKeep(); return; }
    if (act === 'chip') { a.chip = a.chip === b.dataset.id ? null : b.dataset.id; a.retry = false; persist(); rerenderKeep(); return; }
    if (act === 'cchip') { a.chip = a.chip === b.dataset.id ? null : b.dataset.id; a.retry = false; persist(); rerenderKeep(); return; }
    if (act === 'dmode') { var id2 = b.dataset.w, m = b.dataset.m; var tgt = dateTarget(a, st, id2); tgt.mode = tgt.mode === m ? null : m; persist(); rerenderKeep(); return; }
    if (act === 'dwin') { var tg = dateTarget(a, st, b.dataset.w); tg.window = b.dataset.id; persist(); rerenderKeep(); return; }
    if (act === 'reveal') { a.revealed = a.revealed || {}; a.revealed[b.dataset.id] = true; persist(); rerenderKeep(); return; }
    if (act === 'mine') { a.mine = !a.mine; a.offers = a.offers || { A: {}, B: {} }; persist(); render(false); return; }
    if (act === 'askq') { a.qs = a.qs || []; var i2 = a.qs.indexOf(b.dataset.id); if (i2 > -1) a.qs.splice(i2, 1); else if (a.qs.length < 3) a.qs.push(b.dataset.id); a.copied = false; persist(); rerenderKeep(); return; }
    if (act === 'remsg') { a.edited = false; persist(); rerenderKeep(); return; }
    if (act === 'copy') { copyText(a.msg || ''); a.copied = true; rerenderKeep(); return; }
    if (act === 'clar') { a.clar = a.clar || {}; a.clar.choice = b.dataset.id; a.clar.shown = true; persist(); rerenderKeep(); return; }
    if (act === 'cpause') { STATUS[n] = 'paused'; persist(); S.view = 'summary'; render(true); return; }
    if (act === 'mic') { voiceToggle(); return; }
    if (act === 'gopt') { var s = st.raw, o2 = (s.options || s.stops)[+b.dataset.i]; a.o = a.o || []; var m2 = s.options && multiHint(s), ix2 = a.o.indexOf(o2); if (m2) { if (ix2 > -1) a.o.splice(ix2, 1); else if (a.o.length < 3) a.o.push(o2); } else a.o = [o2]; persist(); rerenderKeep(); return; }
    if (act === 'gcol') { a.c = a.c || {}; a.c[+b.dataset.i] = +b.dataset.c; persist(); rerenderKeep(); return; }
    if (act === 'helpnow') { S.helpOpen = !S.helpOpen; rerenderKeep(); return; }
    if (act === 'nopt') { var ni = +b.dataset.i; a.i = a.i === ni ? null : ni; if (ni < 0) a.m = []; persist(); rerenderKeep(); showReply(); return; }
    if (act === 'nmulti') { var mi = +b.dataset.i; a.m = (a.m || []).slice(); var at = a.m.indexOf(mi); if (at >= 0) a.m.splice(at, 1); else a.m.push(mi); a.m.sort(); if (a.i != null && a.i < 0) a.i = null; if (st.raw.exclusive && st.raw.exclusive.indexOf(mi) >= 0 && at < 0) a.m = [mi]; else if (st.raw.exclusive) a.m = a.m.filter(function (x) { return x === mi || st.raw.exclusive.indexOf(x) < 0; }); persist(); rerenderKeep(); return; }
    if (act === 'nidea') { a.text = L(st.raw.ideas[+b.dataset.i]); persist(); rerenderKeep(); showReply(); return; }
    if (act === 'gidea') { a.text = st.raw.ideas[+b.dataset.i]; persist(); rerenderKeep(); return; }
  });
  function dateTarget(a, st, id) {
    if (st.type === 'ctx') { a[id] = a[id] || {}; a[id].date = a[id].date || {}; return a[id].date; }
    a.offers = a.offers || { A: {}, B: {} }; var who = id.slice(1); a.offers[who].pay = a.offers[who].pay || {}; return a.offers[who].pay;
  }
  function applyHelpSet(st, bt) {
    var n = dayNo(), a = get(n, st.id);
    if (bt.set) { a.sel = bt.set.slice(); a.sel.forEach(function (k) { if (k === 'pay' || k === 'inc') a[k] = a[k] || {}; }); }
    if (bt.pick) { if (st.type === 'compare') { a.choice = bt.pick; a.revealed = { cost: true, time: true, pay: true }; } }
    if (bt.setq) { a.qs = bt.setq.slice(); a.edited = false; }
  }
  function copyText(t) { try { if (navigator.clipboard) navigator.clipboard.writeText(t); else { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } } catch (e) {} }

  document.addEventListener('input', function (e) {
    var el = e.target, act = el.dataset.a; if (!act) return;
    var n = dayNo(), st = curSteps()[S.i]; if (!st) return; var a = get(n, st.id);
    if (act === 'ta') { a.text = el.value; a.retry = false; if (S.voice.state === 'review') { S.voice.state = 'edited'; updateVoiceUI(); } grow(el); persist(); updateFb(); return; }
    if (act === 'gfield') { a.f = a.f || []; a.f[+el.dataset.i] = el.value; persist(); return; }
    if (act === 'gother') { a.other = el.value; persist(); return; }
    if (act === 'mother') { a.other = el.value; persist(); return; }
    if (act === 'knext') { a.next = el.value; persist(); return; }
    if (act === 'msg') { a.msg = el.value; a.edited = true; a.copied = false; grow(el); persist(); return; }
    if (act === 'amt') { var w = el.dataset.w; setAmount(a, st, w, 'raw', el.value); persist(); softErr(el, parseAmt(el.value).bad ? L(X.AMT.bad) : ''); updateFb(); return; }
    if (act === 'cur') { var w2 = el.dataset.w; a[w2] = a[w2] || {}; a[w2].amount = a[w2].amount || {}; a[w2].amount.cur = el.value; persist(); updateFb(); return; }
    if (act === 'dval') { var tg = dateTarget(a, st, el.dataset.w); tg.value = el.value; tg.touched = true; persist(); var er = dateErr(tg); softErr(el, er && el.value ? er : ''); updateFb(); return; }
  });
  function softErr(el, msg) { var p = el.parentNode.querySelector('.err'); if (p) p.textContent = msg; if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
  function setAmount(a, st, w, field, v) {
    if (st.type === 'ctx') { a[w] = a[w] || {}; a[w].amount = a[w].amount || {}; a[w].amount[field] = v; return; }
    a.offers = a.offers || { A: {}, B: {} }; var who = w.slice(1), f = w.charAt(0) === 'r' ? 'recv' : (w.charAt(0) === 'c' ? 'cost' : 'hours'); a.offers[who][f] = v;
  }
  document.addEventListener('change', function (e) { var el = e.target; if (el.dataset && el.dataset.a === 'dval') { var n = dayNo(), st = curSteps()[S.i], a = get(n, st.id); var tg = dateTarget(a, st, el.dataset.w); tg.value = el.value; tg.touched = true; persist(); rerenderKeep(); } });
  document.addEventListener('focusin', function (e) { var t = e.target; if (/^(INPUT|TEXTAREA)$/.test(t.tagName) && S.panel === 'landscape') { S.panel = 'answer'; render(); } if (/^(INPUT|TEXTAREA)$/.test(t.tagName)) setTimeout(function () { try { t.scrollIntoView({ block: 'nearest' }); } catch (er) {} }, 60); });
  document.addEventListener('keydown', function (e) {
    var g = e.target.closest && e.target.closest('.grab'); if (!g) return;
    if (e.key === 'ArrowUp') { e.preventDefault(); S.panel = S.panel === 'landscape' ? 'answer' : 'expanded'; render(); var g2 = $('.grab'); if (g2) g2.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); S.panel = S.panel === 'expanded' ? 'answer' : 'landscape'; render(); var g3 = $('.grab'); if (g3) g3.focus(); }
  });

  /* drag the panel by its handle; the content keeps its own scroll */
  (function () {
    var drag = null;
    document.addEventListener('pointerdown', function (e) {
      var z = e.target.closest('.dragzone'); if (!z) return; if (e.target.closest('.tools')) return;
      var w = $('.panelwrap'); if (!w) return;
      drag = { y: e.clientY, h: w.getBoundingClientRect().height, t: Date.now(), moved: false, lastY: e.clientY, lastT: Date.now(), v: 0 };
      try { z.setPointerCapture(e.pointerId); } catch (er) {}
    });
    document.addEventListener('pointermove', function (e) {
      if (!drag) return; var dy = drag.y - e.clientY; if (Math.abs(dy) > 5) drag.moved = true; if (!drag.moved) return;
      var w = $('.panelwrap'); w.classList.remove('anim');
      var h = Math.max(S.stripH, Math.min(expandedMax(), drag.h + dy)); w.style.setProperty('--ph', h + 'px');
      var now = Date.now(); drag.v = (drag.lastY - e.clientY) / Math.max(1, now - drag.lastT); drag.lastY = e.clientY; drag.lastT = now; drag.cur = h;
    });
    function end() {
      if (!drag) return; var d = drag; drag = null;
      if (!d.moved) return;
      S._dragged = true; setTimeout(function () { S._dragged = false; }, 50);
      var proj = d.cur + d.v * 140, snaps = [{ m: 'landscape', h: S.stripH }, { m: 'answer', h: answerH() }, { m: 'expanded', h: expandedH() }];
      snaps.sort(function (a, b) { return Math.abs(a.h - proj) - Math.abs(b.h - proj); });
      S.panel = snaps[0].m; render();
    }
    document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
  })();

  window.addEventListener('resize', function () { S.H0 = 0; shell(); render(false); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', function () { if (!isFull()) return; var ph = $('#ph'); ph.style.setProperty('--vvh', window.visualViewport.height + 'px'); S.H = ph.clientHeight; applyH(false); });

  /* test + review hooks */
  window.__mj2 = {
    go: function (w, d, view, i) { go(w, d, view); if (i != null) { S.i = i; S.view = view || 'step'; render(false); } },
    set: function (k, v) { A[k] = v; persist(); render(false); },
    get: function () { return { S: S, A: A, STATUS: STATUS }; },
    panel: function (m) { S.panel = m; render(); },
    lang: function (l) { S.lang = l; labels(); S.sceneUrl = ''; render(false); },
    parseAmt: parseAmt, validateDate: validateDate, feelingLike: feelingLike, nonAnswerLite: nonAnswerLite,
    fakeVoice: function (text) { window.__fakeSR = function () { var s = this; s.start = function () { setTimeout(function () { s.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: true })] }); s.onend(); }, 30); }; s.stop = function () { s.onend(); }; }; render(false); },
    render: function () { render(false); }
  };
  document.documentElement.lang = 'es';
  labels(); shell(); render(false);
  var q = new URLSearchParams(location.search); if (q.get('l')) S.lang = q.get('l'); if (window.MJ_START && !q.get('w')) { S.w = window.MJ_START.w; S.d = 1; } if (q.get('w')) { S.w = +q.get('w'); S.d = +(q.get('d') || 1); } if (window.MJ_WEEKS && window.MJ_WEEKS.indexOf(S.w) < 0) { S.w = window.MJ_WEEKS[0]; S.d = 1; } if (q.get('c')) S.cw = +q.get('c'); if (q.get('copy') === 'draft') window.CUR_OFF = true;
  labels(); render(false);
})();
