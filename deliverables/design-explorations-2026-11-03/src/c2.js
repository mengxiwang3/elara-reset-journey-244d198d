/* ---------- Concept C v2 · the takeaway card, with A's step-by-step guidance ----------
 * Reuses the shared shell (state, simulated replies, sheet, toast, reviewer panel) and
 * overrides what C v2 changes. Outcome rules (item 7):
 *  - «Ninguna por ahora» is an answer: kept on the card, Elara notes it without pushing,
 *    step 2 shows the option-free instruction and can end with «Terminar sin escribir»
 *    (slot: «Sin nota hoy»).
 *  - «Prefiero pasar» on step 1: nothing recorded, no reply, slot «Pasaste esta pregunta»,
 *    step 2 shows the option-free instruction with its own «Prefiero pasar».
 *  - «Prefiero pasar» on step 2: the day completes, slot «Pasaste esta pregunta», no reply.
 *  - Closing lines on skipped paths are fixed UI copy (the app's own summary strings).
 */
(() => {
  const S = () => P.S;
  const m = C.meta;
  const X = C2;
  const NONE = "Ninguna por ahora";
  const touch = (() => { try { return matchMedia("(pointer: coarse)").matches; } catch (e) { return false; } })();

  const ICON = {
    checkSm: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    dash: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 12h10"/></svg>',
    chevDown: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    chevUp: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
    shift: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 4l8 8h-4.5v7h-7v-7H4z"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>',
    smile: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.8 2 5.2 2 7 0"/><circle cx="9" cy="10" r=".8" fill="currentColor"/><circle cx="15" cy="10" r=".8" fill="currentColor"/></svg>',
    globe: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>',
    mic: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></svg>',
  };
  const tag = (t) => `<span class="rtag">${t}</span>`;

  /* ---- state ---- */
  const fresh0 = P.fresh;
  P.fresh = () => Object.assign(fresh0(), {
    sel: null,          // highlighted option on step 1, not yet added to the card
    takeOutcome: null,  // written | empty («Terminar sin escribir») | skipped («Prefiero pasar»)
    editing: false,     // step 1 reached from step 2 («Cambiar» or back)
    changed: false,     // show «Cambiaste tu respuesta…» above the field
    noteOpen: true, resumed: false, resumeAt: null, collFrom: null,
  });
  P.kb = false;         // simulated keyboard (memory only, never persisted)
  const set0 = P.set;
  P.set = (patch) => { if (patch.screen && patch.screen !== P.S.screen) P.kb = false; set0(patch); };

  /* ---- simulated replies (item 5) ---- */
  const clip = (s, n) => {
    s = String(s || "").trim().replace(/\s+/g, " ");
    if (s.length <= n) return s;
    const cut = s.slice(0, n), sp = cut.lastIndexOf(" ");
    return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:]+$/, "") + "…";
  };
  const quoted = (s) => clip(String(s || "").trim().replace(/\.+$/, ""), 180);
  P.reply = (step) => {
    const s = S();
    if (step === "ask" && (s.askSkipped || !s.choice)) return { status: "none" };   // nothing invented for a skip
    if (step === "take" && s.takeOutcome !== "written") return { status: "none" };
    const r = s.reply[step] || { status: "none" };
    if (r.status === "fallback") return { status: "dismissed" };                  // «Seguir sin la nota de Elara»
    if (r.status !== "ok") return r;
    if (step === "ask") return { status: "ok", kind: "sim", text: X.askNotes[s.choice] || "" };
    const text = norm(s.take) === norm(C.sample.take) ? X.takeTailored : X.takeTemplate(quoted(s.take));
    return { status: "ok", kind: "sim", text };
  };
  P.label = () => `<span class="rtag sim">${C.simLabel}</span>`;
  const answered = () => (S().choice && !S().askSkipped ? 1 : 0) + (S().takeOutcome === "written" ? 1 : 0);

  /* ---- pieces ---- */
  const SEG = { open: 0, ask: 1, take: 2, done: 3 };
  const top = ({ back = true, close = "leave" } = {}) => {
    const sc = S().screen, seg = SEG[sc] ?? 3, fin = sc === "done";
    const segs = [0, 1, 2, 3].map((i) => `<i class="${fin || i < seg ? "done" : i === seg ? "now" : ""}"></i>`).join("");
    const right = close === "leave" ? `<button class="icon-btn" data-act="leave" aria-label="Salir y volver a Hoy">${I.close}</button>`
      : close === "home" ? `<button class="icon-btn" data-act="toHoy" aria-label="${X.closeA11y}">${I.close}</button>` : '<span class="sp44"></span>';
    return `<div class="topbar">${back ? `<button class="icon-btn" data-act="back" aria-label="Volver un paso">${I.back}</button>` : '<span class="sp44"></span>'}
      <div class="prog" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${seg + 1}" aria-valuetext="${X.progress[seg]}">
        <div class="segs" aria-hidden="true">${segs}</div><div class="lbl">${X.progress[seg]}</div></div>${right}</div>`;
  };

  const note = (step, { main = false } = {}) => {
    const r = P.reply(step);
    if (r.status === "none" || r.status === "dismissed") return "";
    if (r.status === "loading")
      return `<div class="enote2 load" role="status"><span class="orb" aria-hidden="true"></span><span>${C.ui.thinking}</span><span class="dots" aria-hidden="true"><span></span><span></span><span></span></span></div>`;
    if (r.status === "error")
      return `<section class="enote2 err" role="status" aria-label="${X.offlineTitle}">
        <div class="en-hd"><span class="ic" aria-hidden="true">${I.cloud}</span><span class="who">${X.offlineTitle}</span></div>
        <div class="body"><p>${C.ui.offlineBody}</p><p class="simrow">${tag(X.tags.offline)}</p><div class="acts">
          <button class="btn line sm" data-act="retry" data-arg="${step}">${X.retry}</button>
          <button class="btn ghost sm" data-act="skipWait" data-arg="${step}">${X.continueWithout}</button></div></div></section>`;
    const open = main || S().noteOpen;
    const hd = main
      ? `<div class="en-hd"><span class="orb" aria-hidden="true"></span><span class="who">${C.ui.noticed}</span></div>`
      : `<button class="en-hd" data-act="toggleNote" aria-expanded="${open}" aria-controls="note-${step}"><span class="orb" aria-hidden="true"></span><span class="who">${C.ui.noticed}</span><span class="tg">${open ? X.hideNote + ICON.chevUp : X.showNote + ICON.chevDown}</span></button>`;
    // the «Respuesta simulada» tag travels with the text it labels
    return `<section class="enote2${main ? " main" : ""}${open ? "" : " closed"}">${hd}<div class="txt" id="note-${step}"><p>${esc(r.text)}</p><p class="simrow">${P.label()}</p></div></section>`;
  };

  const num = (st, n) => `<span class="n n-${st}" aria-hidden="true">${st === "filled" ? ICON.checkSm : st === "skipped" ? ICON.dash : n}</span>`;
  const slot1 = () => {
    const s = S();
    if (s.askSkipped) return { st: "skipped", html: `<p class="skipped">${X.slotSkipped}</p>` };
    if (s.choice) return { st: "filled", html: `<p class="val">${esc(s.choice)}</p>` };
    return { st: "empty", html: '<div class="empty"></div>' };
  };
  const slot2 = () => {
    const s = S(), o = s.takeOutcome;
    if (o === "written") return { st: "filled", html: `<p class="val serif">«${esc(s.take.trim())}»</p>` };
    if (o === "empty") return { st: "skipped", html: `<p class="skipped">${X.slotEmpty}</p>` };
    if (o === "skipped") return { st: "skipped", html: `<p class="skipped">${X.slotSkipped}</p>` };
    return { st: "empty", html: '<div class="empty w2"></div><div class="empty" style="width:50%"></div>' };
  };
  /** mode: ghost (opening preview) | done (with Elara's closing note) | compact (collection) */
  const card = (mode) => {
    const ghost = mode === "ghost";
    const a = ghost ? { st: "empty", html: `<p class="hint">${X.ghostHint1}</p><div class="empty"></div>` } : slot1();
    const b = ghost ? { st: "empty", html: `<p class="hint">${X.ghostHint2}</p><div class="empty w2"></div>` } : slot2();
    return `<article class="tcard${ghost ? " ghost" : ""}" aria-label="${X.cardToday}">
      <div class="ph" role="img" aria-label="Canal de Wuzhen"></div><div class="k${ghost ? " off" : ""}" role="img" aria-label="${m.keepsake}"></div>
      <div class="in"><p class="meta">Martes 3 nov · ${m.place} · Semana ${m.week} · Día 1</p>
        <div class="slot first"><p class="lab">${num(a.st, 1)}${X.yourChoice}</p>${a.html}</div>
        <div class="slot"><p class="lab">${num(b.st, 2)}${C.take.title}</p>${b.html}${mode === "done" ? note("take", { main: true }) : ""}</div>
      </div></article>`;
  };

  const tom = () => `<section class="tom2" aria-label="Mañana"><div class="k" role="img" aria-label="${C.tomorrow.keepsake}"></div><div>
      <p class="t1">Mañana · Día 2 · unos ${C.tomorrow.minutes} min</p><p class="t2">${C.tomorrow.title}</p></div></section>`;
  // No «Mañana partimos de lo que elegiste hoy.»: day 9 does not use her choice, so it would be a promise.

  const kbd = () => {
    const row = (keys) => keys.split(" ").map((k) => `<span class="key">${k}</span>`).join("");
    return `<div class="kbd" aria-hidden="true">
      <div class="kb-sug"><span>“hay”</span><span>haya</span><span>hayas</span></div>
      <div class="kb-row">${row("q w e r t y u i o p")}</div>
      <div class="kb-row r2">${row("a s d f g h j k l ñ")}</div>
      <div class="kb-row r3"><span class="key mod">${ICON.shift}</span>${row("z x c v b n m")}<span class="key mod">${ICON.del}</span></div>
      <div class="kb-row r4"><span class="key mod">123</span><span class="key mod">${ICON.smile}</span><span class="key sp">espacio</span><span class="key mod w2">intro</span></div>
      <div class="kb-bot"><span>${ICON.globe}</span><span>${ICON.mic}</span></div></div>`;
  };

  const tabs = `<nav class="tabs" aria-label="Pestañas">
      <button class="on" aria-current="page">${I.home}Hoy</button>
      <button data-act="oos">${I.map}Atlas</button>
      <button data-act="oos"><span class="orb" aria-hidden="true"></span>Pregunta</button>
      <button data-act="oos">${I.compass}Explorar</button>
      <button data-act="oos">${I.people}Círculos</button></nav>`;

  /* ---- screens ---- */
  const screens = {
    hoy() {
      const s = S();
      const discs = [1, 2, 3, 4, 5, 6, 7].map((d) =>
        d === 1 && s.done ? `<div class="disc done"><div class="c" style="background-image:url(assets/keepsake-d1.webp)" role="img" aria-label="Día 1: hecho, ${m.keepsake}"></div>1</div>`
        : d === 1 ? '<div class="disc today"><div class="c"></div>Hoy</div>' : `<div class="disc"><div class="c"></div>${d}</div>`).join("");
      const week = `<section class="week"><h3>Tu semana en ${m.place} <small>${s.done ? 1 : 0} de 7</small></h3>
        <div class="discs">${discs}</div><p class="wk-theme">Esta semana: ingresos y posibilidades.</p></section>`;
      let body;
      if (s.done) {
        // item 6: her card first, right under the greeting
        const t = s.takeOutcome === "written" ? `<span class="q">«${esc(clip(s.take, 140))}»</span>`
          : `<span class="skipped">${s.takeOutcome === "empty" ? X.slotEmpty : X.slotSkipped}</span>`;
        body = `<section class="today-card" aria-labelledby="tc-h">
            <div class="hd"><h2 id="tc-h">${X.cardToday}</h2>${tag(X.tags.saved)}</div>
            <div class="row"><div class="k" role="img" aria-label="${m.keepsake}"></div><div class="tx">
              <p class="tline"><span class="l">${X.yourChoice}</span>${s.askSkipped ? `<span class="skipped">${X.slotSkipped}</span>` : `<strong>${esc(s.choice)}</strong>`}</p>
              <p class="tline"><span class="l">${C.take.title}</span>${t}</p></div></div>
            <button class="btn line sm" data-act="review">${X.seeCard}</button></section>
          <div class="post compact"><div class="ph" role="img" aria-label="Canal de Wuzhen"></div><div class="in">
            <p class="where">${m.placeFull} · Semana ${m.week} · Día 1 hecho</p><h2>${m.title}</h2>
            <p class="min">Mañana, el día 2. Unos ${C.tomorrow.minutes} minutos.</p></div></div>
          ${week}<div class="hoy-sec">${tom()}</div>`;
      } else {
        const resume = s.inProgress;
        const draft = resume && s.take.trim() ? `<p class="draft"><span class="l">${X.draftLabel}</span> «${esc(clip(s.take, 60))}»</p>` : "";
        body = `<div class="post"><div class="ph" role="img" aria-label="Canal de Wuzhen"></div><div class="in">
            <p class="where">${m.placeFull} · Semana ${m.week} · Día 1</p><h2>${m.title}</h2><p class="min">Unos ${m.minutes} minutos.</p>
            ${resume ? `<p class="resume">${C.ui.resumeEyebrow} · ${s.resumeAt === "take" ? "Paso 2 de 2" : "Paso 1 de 2"}</p>${draft}<p class="tagline">${tag(X.tags.saved)}</p>` : ""}
            <button class="btn" data-act="start">${resume ? C.ui.continueDay : C.ui.start} ${I.arrow}</button></div></div>${week}`;
      }
      return `<div class="scr hoy">${P.sbar()}<div class="scroll">
        <p class="hoy-date">Martes · 3 nov</p><h1 class="hoy-hi">Buenos días, ${C.sample.name}</h1>${body}<div style="height:24px"></div></div>${tabs}</div>`;
    },

    open() { // item 1: A's «Por qué hoy» + C's empty card
      return `<div class="scr">${P.sbar()}${top({ close: "none" })}
        <div class="scroll"><div class="pad">
          <p class="eyebrow">${m.place} · Semana ${m.week} · Día 1 · unos ${m.minutes} min</p>
          <h1 class="h-display">${m.title}</h1>
          <section class="why" aria-labelledby="why-h"><h2 id="why-h">Por qué hoy</h2><p>${X.purposeLine}</p><p class="payoff">${C.weekPayoff}</p></section>
          <h2 class="sec-h">${X.youTake}</h2>
          ${card("ghost")}
          <p class="note">${C.introNote}</p>
          <p class="tagline" style="margin-bottom:12px">${tag(C.status)}</p>
        </div></div>
        <div class="foot"><button class="btn" data-act="toAsk">${X.startCard} ${I.arrow}</button></div></div>`;
    },

    ask() {
      const s = S();
      const opts = C.ask.options.map((o) => `<button class="opt" role="radio" aria-checked="${s.sel === o}" data-act="pick" data-arg="${esc(o)}">${esc(o)}<span class="rad" aria-hidden="true"></span></button>`).join("");
      const banner = s.resumed ? `<p class="banner" role="status">${C.ui.resumeEyebrow} ${tag(X.tags.saved)}</p>`
        : s.editing && s.take.trim() ? `<p class="banner" role="status">${X.draftKept}</p>` : "";
      return `<div class="scr">${P.sbar()}${top()}
        <div class="scroll"><div class="pad">
          ${banner}
          <div class="minicard" aria-hidden="true"><div class="k"></div><div class="s">
            <div class="${s.sel ? "on" : ""}">${num(s.sel ? "filled" : "empty", 1)}<span>${esc(s.sel || X.yourChoice)}</span></div>
            <div>${num("empty", 2)}<span>${C.take.title}</span></div></div></div>
          <h1 class="h-q qhead" id="ask-h">${C.ask.title}</h1><p class="sub">${C.ask.body}</p>
          <div class="opts" role="radiogroup" aria-labelledby="ask-h">${opts}</div>
          <div style="height:12px"></div></div></div>
        <div class="foot"><button class="btn" data-act="askNext" ${s.sel ? "" : "disabled"}>${X.addToCard} ${I.arrow}</button>
          <button class="btn ghost" data-act="askSkip">${C.ask.skip}</button></div></div>`;
    },

    take() { // items 2, 3, 4, 7, 8
      const s = S();
      const free = s.askSkipped || s.choice === NONE;
      const banner = s.resumed ? `<p class="banner" role="status">${C.ui.resumeEyebrow} ${tag(X.tags.saved)}</p>` : "";
      const secondary = !s.askSkipped && s.choice === NONE
        ? `<button class="btn ghost" data-act="finishEmpty">${X.finishEmpty}</button>`
        : `<button class="btn ghost" data-act="takeSkip">${C.take.skip}</button>`;
      return `<div class="scr take${P.kb ? " kb" : ""}">${P.sbar()}${top()}
        <div class="scroll"><div class="pad">
          ${banner}
          <article class="tcard slim" aria-label="${X.cardToday}"><div class="in">
            <div class="choice-row"><p class="cv"><small>${X.yourChoice}</small>${s.askSkipped ? `<span class="skipped">${X.slotSkipped}</span>` : `<span>${esc(s.choice)}</span>`}</p>
              <button data-act="change" aria-label="${X.changeA11y}">${I.edit}${X.change}</button></div>
            <h1 class="take-h" id="take-h">${C.take.title}</h1>
            <p class="take-i" id="take-i">${free ? X.takeBodyFree : X.takeBody}</p>
            ${s.changed ? `<p class="notice" id="changed" role="status">${X.changedNotice}</p>` : ""}
            <textarea class="write" placeholder="${C.take.placeholder}" aria-labelledby="take-h take-i">${esc(s.take)}</textarea>
            <button class="sample-btn" data-act="useSample">${X.sampleBtn}</button>
            ${note("ask")}
          </div></article><div style="height:12px"></div></div></div>
        <div class="foot"><button class="btn" id="finish" data-act="finish" ${s.take.trim() ? "" : "disabled"}>${C.ui.finish} ${I.check}</button>${secondary}</div>
        ${kbd()}</div>`;
    },

    done() {
      return `<div class="scr">${P.sbar()}${top({ back: false, close: "home" })}
        <div class="scroll"><div class="pad">
          <p class="eyebrow ember">${X.doneEyebrow}</p>
          <h1 class="h-display sm">${X.cardToday}</h1>
          <div style="height:14px"></div>${card("done")}
          <p class="summary">${X.summary(answered())}</p>
          <ul class="where-list"><li>${I.check}<span>${X.staysOnHoy}</span></li><li>${I.bookmark}<span>${X.savedColl}</span></li></ul>
          <p class="tagline">${tag(X.tags.saved)}</p>
          ${tom()}
          <div style="height:12px"></div></div></div>
        <div class="foot"><button class="btn" data-act="toHoy">${C.ui.backToday}</button>
          <button class="btn ghost" data-act="toColl">${X.seeInColl}</button></div></div>`;
    },

    coll() {
      const s = S();
      return `<div class="scr">${P.sbar()}<div class="topbar"><button class="icon-btn" data-act="back" aria-label="Volver">${I.back}</button><span class="flex1"></span></div>
        <div class="scroll"><div class="pad coll">
          <h1>Tu colección</h1><p class="sub">Lo que has ido creando en el camino.</p>
          <p class="tagline">${tag(X.tags.saved)}</p>
          <h2 class="wk">Semana ${m.week} · ${m.weekTitle}</h2>
          ${s.takeOutcome === "written" ? '<span class="chip">Frase</span>' : ""}
          ${card("compact")}
          <div style="height:20px"></div></div></div></div>`;
    },
  };

  /* ---- simulated keyboard (item 8) ---- */
  const fitField = () => {
    const scr = $("#app .scr.kb"); if (!scr) return;
    const sc = scr.querySelector(".scroll"), h = scr.querySelector("#take-h"), f = scr.querySelector("textarea.write");
    if (!sc || !h || !f) return;
    const base = sc.getBoundingClientRect().top - sc.scrollTop;
    const topY = h.getBoundingClientRect().top - base - 8, bottomY = f.getBoundingClientRect().bottom - base + 8;
    sc.scrollTop = bottomY - topY <= sc.clientHeight ? topY : bottomY - sc.clientHeight;
  };
  const setKb = (on) => {
    P.kb = on && S().screen === "take";
    const scr = $("#app .scr"); if (scr) scr.classList.toggle("kb", P.kb);
    if (P.kb) requestAnimationFrame(fitField);
  };
  const isField = (el) => el && el.matches && el.matches("#app textarea.write");
  // A note that lands while she is typing re-renders the screen: keep her focus, caret and scroll.
  const paint0 = P.paint;
  P.paint = () => {
    const a = document.activeElement;
    const had = isField(a) ? { s: a.selectionStart, e: a.selectionEnd, top: a.scrollTop } : null;
    paint0();
    const t = had && S().screen === "take" ? $("#app textarea.write") : null;
    if (t) { t.focus({ preventScroll: true }); t.setSelectionRange(had.s, had.e); t.scrollTop = had.top; }
  };
  document.addEventListener("focusin", (e) => { if (!touch && isField(e.target)) setKb(true); });
  document.addEventListener("focusout", (e) => {
    if (!isField(e.target)) return;
    const rt = e.relatedTarget;
    // a tap on a button inside the phone: keep the layout still until the tap lands
    if (rt && rt.closest && rt.closest(".phone")) setTimeout(() => { if (!isField(document.activeElement)) setKb(false); }, 250);
    else setKb(false);
  });

  P.afterPaint = () => {
    if (S().screen !== "take") P.kb = false;
    if (P._focusAfter) {
      P._focusAfter = false;
      const t = $("#app textarea.write");
      if (t && !touch) { t.focus({ preventScroll: true }); const L = t.value.length; t.setSelectionRange(L, L); }
    }
    if (P.kb) requestAnimationFrame(fitField);
  };

  /* ---- larger text (item 9) ---- */
  P.textScale = 1;
  const setScale = (k) => {
    P.textScale = k;
    document.documentElement.style.fontSize = 16 * k + "px";
    document.querySelectorAll("[data-scale]").forEach((b) => { const on = +b.dataset.scale === k; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    if (P.kb) requestAnimationFrame(fitField);
  };
  const rev0 = P.reviewer;
  P.reviewer = (cfg) => {
    rev0(cfg);
    const r = $("#rev-controls");
    r.insertAdjacentHTML("afterbegin", `<h2>Tamaño de texto</h2><div class="row">${[1, 1.3, 1.6].map((k) => `<button data-scale="${k}" aria-pressed="false">${Math.round(k * 100)} %</button>`).join("")}</div>`);
    r.addEventListener("click", (e) => { const b = e.target.closest("[data-scale]"); if (b) setScale(+b.dataset.scale); });
    setScale(1);
  };

  P.leaveSheet = () => {
    const d = S().screen === "take" && S().take.trim();
    P.sheet(`<h3>${C.ui.leaveTitle}</h3><p>${d ? X.leaveBodyDraft : C.ui.leaveBody}</p><p class="tagline">${tag(X.tags.saved)}</p>
      <button class="btn" data-act="leaveConfirm">${C.ui.leaveYes}</button><button class="btn ghost" data-act="sheetClose">${C.ui.leaveNo}</button>`);
  };

  /* ---- actions ---- */
  const go = (screen, extra = {}) => P.set(Object.assign({ screen }, extra));
  const finishDay = (patch) => go("done", Object.assign({ done: true, inProgress: false, resumed: false, changed: false, editing: false }, patch));
  const ACT = {
    start: () => { const s = S(); if (s.inProgress) go(s.resumeAt || "ask", { resumed: true, sel: s.choice, editing: false }); else go("open"); },
    review: () => go("done"),
    toAsk: () => go("ask", { sel: S().choice, editing: false, resumed: false, inProgress: true, resumeAt: "ask" }),
    pick: (o) => P.set({ sel: o }),
    askNext: () => {
      const s = S(); if (!s.sel) return;
      const same = !s.askSkipped && s.choice === s.sel;
      if (!same) P.requestReply("ask");                       // item 4: the note re-runs for a new option
      const changed = (s.editing && !same && !!s.take.trim()) || (s.changed && same);
      go("take", { choice: s.sel, askSkipped: false, editing: false, resumed: false, inProgress: true, resumeAt: "take", changed, noteOpen: same ? s.noteOpen : true });
    },
    askSkip: () => {
      const s = S(); clearTimeout(P.timers.ask); delete s.reply.ask;   // no answer, no reply
      const changed = s.editing && !s.askSkipped && !!s.take.trim();
      go("take", { choice: null, sel: null, askSkipped: true, editing: false, resumed: false, inProgress: true, resumeAt: "take", changed });
    },
    change: () => go("ask", { sel: S().askSkipped ? null : S().choice, editing: true, resumed: false }),
    toggleNote: () => P.set({ noteOpen: !S().noteOpen }),
    input: (e) => {
      if (!e.target.matches("textarea.write")) return;
      const s = S(); s.take = e.target.value;
      if (s.changed) { s.changed = false; const n = $("#changed"); if (n) n.remove(); }
      P.save(); const f = $("#finish"); if (f) f.disabled = !e.target.value.trim();
    },
    finish: () => { if (!S().take.trim()) return; P.requestReply("take"); finishDay({ takeOutcome: "written" }); },
    finishEmpty: () => finishDay({ take: "", takeOutcome: "empty" }),
    takeSkip: () => { clearTimeout(P.timers.take); delete S().reply.take; finishDay({ take: "", takeOutcome: "skipped" }); },
    toHoy: () => go("hoy"),
    toColl: () => go("coll", { collFrom: S().screen }),
    leave: () => P.leaveSheet(),
    leaveConfirm: () => { P.sheet(); go("hoy", { resumeAt: S().screen, inProgress: true, editing: false, resumed: false }); P.toast(`${C.ui.saving} · ${X.tags.saved.toLowerCase()}`); },
    back: () => {
      const s = S();
      if (s.screen === "ask") return s.editing ? go("take", { editing: false, sel: s.choice }) : go("open");
      if (s.screen === "take") return go("ask", { sel: s.askSkipped ? null : s.choice, editing: true, resumed: false }); // the draft stays
      if (s.screen === "coll") return go(s.collFrom || "hoy");
      go("hoy");
    },
  };

  /* ---- reviewer states ---- */
  const reset = () => { P.kb = false; P._focusAfter = false; };
  const clean = (extra) => { reset(); return Object.assign(P.fresh(), extra); };
  const mid = (extra) => clean(Object.assign({ choice: C.sample.choice, sel: C.sample.choice, inProgress: true, resumeAt: "take", reply: { ask: { status: "ok" } } }, extra));
  const fin = (extra) => mid(Object.assign({ take: C.sample.take, takeOutcome: "written", done: true, inProgress: false, reply: { ask: { status: "ok" }, take: { status: "ok" } } }, extra));
  const bothSkipped = { choice: null, sel: null, askSkipped: true, take: "", takeOutcome: "skipped", reply: {} };
  P.boot("c2", () => screens[P.S.screen](), ACT, {
    presets: [
      ["Desde el principio", () => { P.S = clean(); }],
      ["Teclado abierto", () => { P.S = mid({ screen: "take", take: "Preguntar a mi encargada si hay" }); P.kb = true; P._focusAfter = true; }],
      ["Borrador sin terminar (Hoy)", () => { P.S = mid({ screen: "hoy", take: C.sample.take }); }],
      ["Reanudar con borrador", () => { P.S = mid({ screen: "take", take: C.sample.take, resumed: true }); }],
      ["Cambiar respuesta", () => { P.S = mid({ screen: "ask", take: C.sample.take, editing: true }); }],
      ["Opción cambiada", () => { P.S = mid({ screen: "take", choice: "Cobrar un pago pendiente", sel: "Cobrar un pago pendiente", take: C.sample.take, changed: true, reply: { ask: { status: "loading" } } }); }],
      ["Cargando", () => { P.mode = "loading"; P.syncModeButtons(); P.S = mid({ screen: "take", reply: { ask: { status: "loading" } } }); }],
      ["Sin conexión", () => { P.S = mid({ screen: "take", reply: { ask: { status: "error" } } }); }],
      ["«Ninguna por ahora»", () => { P.S = mid({ screen: "take", choice: NONE, sel: NONE }); }],
      ["Pasó la pregunta 1", () => { P.S = mid({ screen: "take", choice: null, sel: null, askSkipped: true, reply: {} }); }],
      ["Pasó la pregunta 2", () => { P.S = fin({ screen: "done", take: "", takeOutcome: "skipped", reply: { ask: { status: "ok" } } }); }],
      ["Pasó las dos", () => { P.S = fin(Object.assign({ screen: "done" }, bothSkipped)); }],
      ["Pasó las dos (Hoy)", () => { P.S = fin(Object.assign({ screen: "hoy" }, bothSkipped)); }],
      ["Terminada (Hoy)", () => { P.S = fin({ screen: "hoy" }); }],
    ],
    screens: [
      ["Hoy", () => { P.S = clean(); }],
      ["Por qué hoy", () => { P.S = clean({ screen: "open" }); }],
      ["Paso 1", () => { P.S = clean({ screen: "ask", inProgress: true }); }],
      ["Paso 1 elegido", () => { P.S = clean({ screen: "ask", sel: C.sample.choice, inProgress: true }); }],
      ["Paso 2", () => { P.S = mid({ screen: "take" }); }],
      ["Paso 2 escrito", () => { P.S = mid({ screen: "take", take: C.sample.take }); }],
      ["Paso 2, nota oculta", () => { P.S = mid({ screen: "take", take: C.sample.take, noteOpen: false }); }],
      ["Tarjeta (pensando)", () => { P.S = fin({ screen: "done", reply: { ask: { status: "ok" }, take: { status: "loading" } } }); }],
      ["Tarjeta lista", () => { P.S = fin({ screen: "done" }); }],
      ["Tu colección", () => { P.S = fin({ screen: "coll", collFrom: "done" }); }],
      ["Hoy después", () => { P.S = fin({ screen: "hoy" }); }],
    ],
  });
  window.proto.text = setScale;
})();
