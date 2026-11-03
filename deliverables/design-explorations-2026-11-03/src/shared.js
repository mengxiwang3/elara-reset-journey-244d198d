/* Shared prototype shell: state, simulated mentor, Hoy, sheet, toast, reviewer panel.
 * Nothing here calls a network or a model. Every mentor line is pre-written. */
const C = CONTENT;
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const norm = (s) => String(s || "").trim().replace(/\s+/g, " ").replace(/[.。]+$/, "").toLowerCase();

const I = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2L2.8 11h2.7v9h5v-6h3v6h5v-9h2.7z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z M9 4v13.5 M15 6.5V20"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" stroke-linejoin="round"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c.6-3.4 3-5 6-5s5.4 1.6 6 5M15 14.3c2.6-.4 5 1 5.6 4.2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M7 18h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 9 4.5 4.5 0 0 0 7 18z"/><path d="M4 4l16 16"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3.5h12v17l-6-4-6 4z"/></svg>',
};

const P = {
  concept: "x",
  S: null,
  mode: "ok", // simulated mentor: ok | loading | error
  ACT: {},
  render: () => {},
  fresh() {
    return { screen: "hoy", choice: null, askSkipped: false, take: "", takeSkipped: false, reply: {}, done: false, inProgress: false };
  },
  load() {
    try {
      const raw = localStorage.getItem("elara-proto-" + P.concept);
      if (raw) return Object.assign(P.fresh(), JSON.parse(raw));
    } catch (e) {}
    return P.fresh();
  },
  save() {
    try { localStorage.setItem("elara-proto-" + P.concept, JSON.stringify(P.S)); } catch (e) {}
  },
  set(patch) { Object.assign(P.S, patch); P.save(); P.paint(); },

  /* ---- simulated mentor ---- */
  timers: {},
  requestReply(step) {
    clearTimeout(P.timers[step]);
    P.S.reply[step] = { status: "loading" };
    P.save();
    if (P.mode === "loading") return;
    P.timers[step] = setTimeout(() => {
      P.S.reply[step] = { status: P.mode === "error" ? "error" : "ok" };
      P.save(); P.paint();
    }, 1600);
  },
  retry(step) { P.mode = "ok"; P.syncModeButtons(); P.requestReply(step); P.paint(); },
  skipWait(step) { clearTimeout(P.timers[step]); P.S.reply[step] = { status: "fallback" }; P.save(); P.paint(); },
  /** {status, text, kind:'sim'|'fallback'} for a step */
  reply(step) {
    const r = P.S.reply[step] || { status: "none" };
    if (r.status !== "ok" && r.status !== "fallback") return r;
    const matches = step === "ask" ? P.S.choice === C.sample.choice : norm(P.S.take) === norm(C.sample.take);
    if (r.status === "ok" && matches) return { status: "ok", kind: "sim", text: C.replies[step] };
    return { status: "ok", kind: "fallback", text: C[step].fallback };
  },
  label(kind, dark) {
    return kind === "sim"
      ? `<span class="rtag sim${dark ? " dark" : ""}">${C.simLabel}</span>`
      : `<span class="rtag${dark ? " dark" : ""}" title="La app muestra esta línea cuando no hay respuesta generada">${C.fallbackLabel}</span>`;
  },

  /* ---- chrome ---- */
  sbar(light) {
    return `<div class="sbar${light ? " light" : ""}" aria-hidden="true"><span>9:41</span><span><b><s style="height:4px"></s><s style="height:6px"></s><s style="height:8px"></s><s style="height:11px"></s></b><i></i></span></div>`;
  },
  toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(P._tt); P._tt = setTimeout(() => t.classList.remove("on"), 2200);
  },
  sheet(html) {
    const s = $("#sheet");
    if (!html) { s.classList.remove("on"); s.innerHTML = ""; return; }
    s.innerHTML = `<div class="scrim" data-act="sheetClose"></div><div class="panel" role="dialog" aria-modal="true">${html}</div>`;
    s.classList.add("on");
  },
  leaveSheet() {
    P.sheet(`<h3>${C.ui.leaveTitle}</h3><p>${C.ui.leaveBody}</p>
      <button class="btn" data-act="leaveConfirm">${C.ui.leaveYes}</button>
      <button class="btn ghost" data-act="sheetClose">${C.ui.leaveNo}</button>`);
  },

  /* ---- Hoy (shared minimal entry / exit) ---- */
  hoy({ state = "fresh", resumeLabel = "", extra = "" } = {}) {
    const m = C.meta;
    let card;
    if (state === "done") {
      card = `<div class="where">${m.placeFull} · Semana ${m.week} · Día 1 hecho</div>
        <h2>${m.title}</h2><div class="min">Mañana, el día 2. Unos ${C.tomorrow.minutes} minutos.</div>
        <button class="btn line" data-act="review">Ver lo que respondiste</button>`;
    } else {
      card = `<div class="where">${m.placeFull} · Semana ${m.week} · Día 1</div>
        <h2>${m.title}</h2><div class="min">Unos ${m.minutes} minutos.</div>
        ${state === "resume" ? `<div class="resume">${C.ui.resumeEyebrow}${resumeLabel ? " · " + esc(resumeLabel) : ""}</div>` : ""}
        <button class="btn" data-act="start">${state === "resume" ? C.ui.continueDay : C.ui.start} ${I.arrow}</button>`;
    }
    const discs = [1, 2, 3, 4, 5, 6, 7].map((d) => {
      if (d === 1 && state === "done") return `<div class="disc done"><div class="c" style="background-image:url(assets/keepsake-d1.webp)" aria-label="Día 1: hecho, ${m.keepsake}"></div>1</div>`;
      if (d === 1) return `<div class="disc today"><div class="c"></div>Hoy</div>`;
      return `<div class="disc"><div class="c"></div>${d}</div>`;
    }).join("");
    return `<div class="scr hoy">${P.sbar()}
      <div class="scroll">
        <div class="hoy-date">Martes · 3 nov</div>
        <div class="hoy-hi">Buenos días, ${C.sample.name}</div>
        <div class="post"><div class="ph" role="img" aria-label="Canal de Wuzhen"></div><div class="in">${card}</div></div>
        <div class="week"><h3>Tu semana en ${m.place} <small>${state === "done" ? 1 : 0} de 7</small></h3>
          <div class="discs">${discs}</div>
          <p class="sub" style="font-size:15px">Esta semana: ingresos y posibilidades.</p></div>
        ${extra}
        <div style="height:24px"></div>
      </div>
      <nav class="tabs" aria-label="Pestañas">
        <button class="on" aria-current="page">${I.home}Hoy</button>
        <button data-act="oos">${I.map}Atlas</button>
        <button data-act="oos"><span class="orb"></span>Pregunta</button>
        <button data-act="oos">${I.compass}Explorar</button>
        <button data-act="oos">${I.people}Círculos</button>
      </nav></div>`;
  },

  /* ---- paint with scroll memory ---- */
  _last: null,
  paint() {
    const app = $("#app");
    const sc = app.querySelector(".scroll");
    const keep = sc && P._last === P.S.screen ? sc.scrollTop : null;
    app.innerHTML = P.render();
    const nsc = app.querySelector(".scroll");
    if (nsc && keep !== null) nsc.scrollTop = keep;
    P._last = P.S.screen;
    if (P.afterPaint) P.afterPaint(keep !== null);
  },

  /* ---- reviewer panel ---- */
  syncModeButtons() {
    document.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("on", b.dataset.mode === P.mode));
  },
  reviewer({ presets, screens }) {
    const r = $("#rev-controls");
    r.innerHTML = `
      <h2>Ver estado</h2><div class="row">${presets.map((p, i) => `<button data-preset="${i}">${p[0]}</button>`).join("")}</div>
      <h2>Respuesta de Elara (simulada)</h2><div class="row">
        <button data-mode="ok">Normal</button><button data-mode="loading">Siempre cargando</button><button data-mode="error">Sin conexión</button></div>
      <h2>Ir a pantalla</h2><div class="row">${screens.map((s, i) => `<button data-screen="${i}">${s[0]}</button>`).join("")}</div>`;
    r.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.preset) { P.sheet(); P.mode = "ok"; P.syncModeButtons(); presets[+b.dataset.preset][1](); P.kick(); P.save(); P._last = null; P.paint(); }
      if (b.dataset.mode) { P.mode = b.dataset.mode; P.syncModeButtons(); }
      if (b.dataset.screen) { P.sheet(); P.mode = "ok"; P.syncModeButtons(); screens[+b.dataset.screen][1](); P.kick(); P.save(); P._last = null; P.paint(); }
    });
    P.syncModeButtons();
  },

  /** restart the simulated timer of any reply a preset left "loading" */
  kick() { Object.keys(P.S.reply).forEach((k) => { if (P.S.reply[k].status === "loading") P.requestReply(k); }); },
  boot(concept, render, ACT, cfg) {
    P.concept = concept; P.render = render; P.S = P.load();
    // timers do not survive a reload: a reply that was loading starts again
    P.kick();
    P.ACT = Object.assign({
      oos: () => P.toast("Fuera del alcance de este prototipo: solo la sesión diaria."),
      sheetClose: () => P.sheet(),
      retry: (step) => P.retry(step),
      skipWait: (step) => P.skipWait(step),
      useSample: () => {
        const t = $("textarea.write"); if (!t) return;
        t.value = C.sample.take; t.dispatchEvent(new Event("input", { bubbles: true }));
      },
    }, ACT);
    const root = $(".phone");
    root.addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (a && P.ACT[a.dataset.act]) { e.preventDefault(); P.ACT[a.dataset.act](a.dataset.arg, a); }
    });
    root.addEventListener("input", (e) => { if (P.ACT.input) P.ACT.input(e); });
    P.reviewer(cfg);
    P.paint();
    window.proto = { P, go: (i) => { P.sheet(); P.mode = "ok"; cfg.screens[i][1](); P.kick(); P.save(); P._last = null; P.paint(); }, preset: (i) => { P.sheet(); P.mode = "ok"; cfg.presets[i][1](); P.kick(); P.save(); P._last = null; P.paint(); } };
  },
};
