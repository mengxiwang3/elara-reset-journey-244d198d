/* ---------- C3 · C v2's functional session, the app's own Hoy, a postcard only at the end ----------
 * Plugs into c2.js through VARIANT (c2.js is unchanged): same logic, these screens.
 *  - Hoy follows the app's real Hoy (sky, torn-paper hero with a perforated stamp, globe card,
 *    persistent start button, seven-day tracker, «Para retomar», optional «Para hoy», tab bar).
 *  - Session: short opening, compact writing screen, option-specific Q2, no card while answering.
 *  - Completion: her words on a torn-paper postcard with a stamp, a faint postmark and the lantern.
 *    Nothing written: no card, ever.
 */
const VARIANT = (() => {
  const LONG = "Preguntar a mi encargada si hay formación gratuita para subir de puesto, en qué horario se hace, si cuenta como horas de trabajo y qué requisitos piden. También quiero saber si alguien del equipo ya la hizo y cómo le fue, y si hay plazas este año o hay que esperar al siguiente. Si no hay, preguntar si existe otra forma de mejorar mi categoría con la experiencia que ya tengo en el puesto, y con quién se habla de eso.";
  // synthetic names, to test the greeting rule: preferred name, else the first word of the full name
  const NAMES = {
    short: { pref: "Lucía", full: "Lucía Soto" },
    first: { pref: "", full: "María de los Ángeles Fernández-Quintero" },
    long: { pref: "María de los Ángeles Fernández-Quintero", full: "María de los Ángeles Fernández-Quintero" },
  };
  let NM = "short";
  const initials = (full) => { const w = full.split(/\s+/).filter(Boolean); return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase(); };
  const lowContent = (t) => {
    const x = String(t || "").trim(); const n = x.split(/\s+/).filter(Boolean).length;
    return n < 3 || /^(hola|hi|hello|hey|buen[oa]s?)([\s,.!¡]+\p{L}+)?[\s.!]*$/iu.test(x);
  };
  const shortQ = (q, n) => "¿" + q.replace(/^¿/, "").replace(/\?$/, "").split(/\s+/).slice(0, n).join(" ") + "…?";

  return {
    key: "c3",
    LONG,
    init: (A) => {
      const boot0 = P.boot;
      P.boot = (key, render, ACT, cfg) => {
        const clean = (x) => { P.kb = false; P._focusAfter = false; return Object.assign(P.fresh(), x); };
        const mid = (x) => clean(Object.assign({ choice: C.sample.choice, sel: C.sample.choice, inProgress: true, resumeAt: "take", reply: { ask: { status: "ok" } } }, x));
        const fin = (x) => mid(Object.assign({ take: C.sample.take, takeOutcome: "written", done: true, inProgress: false, reply: { ask: { status: "ok" }, take: { status: "ok" } } }, x));
        const NONE = A.NONE;
        const both = { choice: null, sel: null, askSkipped: true, take: "", takeOutcome: "skipped", reply: {} };
        const ninguna = { choice: NONE, sel: NONE, take: "", takeOutcome: "empty", reply: { ask: { status: "ok" } } };
        cfg.presets.length = 0;
        cfg.presets.push(
          ["Desde el principio", () => { P.S = clean(); }],
          ["Teclado abierto (simulado)", () => { P.S = mid({ screen: "take", take: "Preguntar a mi encargada si hay" }); P.kb = true; P._focusAfter = true; }],
          ["Borrador sin terminar (Hoy)", () => { P.S = mid({ screen: "hoy", take: C.sample.take }); }],
          ["Reanudar con borrador", () => { P.S = mid({ screen: "take", take: C.sample.take, resumed: true }); }],
          ["Cambiar respuesta", () => { P.S = mid({ screen: "ask", take: C.sample.take, editing: true }); }],
          ["Opción cambiada con borrador", () => { P.S = mid({ screen: "take", choice: "Cobrar un pago pendiente", sel: "Cobrar un pago pendiente", take: C.sample.take, changed: true, reply: { ask: { status: "loading" } } }); }],
          ["Cargando", () => { P.mode = "loading"; P.syncModeButtons(); P.S = mid({ screen: "take", reply: { ask: { status: "loading" } } }); }],
          ["Sin conexión", () => { P.S = mid({ screen: "take", reply: { ask: { status: "error" } } }); }],
          ["Elige «Ninguna por ahora»", () => { P.S = mid({ screen: "take", choice: NONE, sel: NONE }); }],
          ["Pasa la pregunta 1", () => { P.S = mid({ screen: "take", choice: null, sel: null, askSkipped: true, reply: {} }); }],
          ["Cierre normal", () => { P.S = fin({ screen: "done" }); }],
          ["Cierre: pasó la 2", () => { P.S = fin({ screen: "done", take: "", takeOutcome: "skipped" }); }],
          ["Cierre: Ninguna sin nota", () => { P.S = fin(Object.assign({ screen: "done" }, ninguna)); }],
          ["Cierre: Ninguna con nota", () => { P.S = fin({ screen: "done", choice: NONE, sel: NONE, take: "Si tuviera más tiempo libre por las tardes." }); }],
          ["Cierre: pasó las dos", () => { P.S = fin(Object.assign({ screen: "done" }, both)); }],
          ["Cierre: pasó la 1 y escribió", () => { P.S = fin({ screen: "done", choice: null, sel: null, askSkipped: true, take: "Qué gastos fijos tengo cada mes.", reply: { take: { status: "ok" } } }); }],
          ["Cierre: respuesta larga", () => { P.S = fin({ screen: "done", take: LONG }); }],
          ["Escribiendo: respuesta larga", () => { P.S = mid({ screen: "take", take: LONG }); }],
          ["Editando la respuesta", () => { const f = fin({}); P.S = Object.assign(f, { screen: "take", redo: true, noteOpen: false, before: { choice: f.choice, sel: f.sel, askSkipped: false, take: f.take, takeOutcome: "written", reply: f.reply } }); }],
          ["Respuesta actualizada", () => { P.S = fin({ screen: "done", updated: true, take: "Preguntar a mi encargada si hay formación gratuita y en qué horario." }); }],
          ["Hoy: respuesta normal", () => { P.S = fin({ screen: "hoy" }); }],
          ["Hoy: «Hi»", () => { P.S = fin({ screen: "hoy", choice: null, sel: null, askSkipped: true, take: "Hi", reply: { take: { status: "ok" } } }); }],
          ["Hoy: pasó las dos", () => { P.S = fin(Object.assign({ screen: "hoy" }, both)); }],
          ["Hoy: solo «Ninguna»", () => { P.S = fin(Object.assign({ screen: "hoy" }, ninguna)); }],
          ["Hoy: respuesta larga", () => { P.S = fin({ screen: "hoy", take: LONG }); }],
        );
        cfg.screens.length = 0;
        cfg.screens.push(
          ["Hoy antes", () => { P.S = clean(); }],
          ["Apertura", () => { P.S = clean({ screen: "open" }); }],
          ["Pregunta 1", () => { P.S = clean({ screen: "ask", inProgress: true }); }],
          ["Pregunta 1 elegida", () => { P.S = clean({ screen: "ask", sel: C.sample.choice, inProgress: true }); }],
          ["Pregunta 2", () => { P.S = mid({ screen: "take" }); }],
          ["Pregunta 2 escrita", () => { P.S = mid({ screen: "take", take: C.sample.take }); }],
          ["Pregunta 2, nota oculta", () => { P.S = mid({ screen: "take", take: C.sample.take, noteOpen: false }); }],
          ["Cierre pensando", () => { P.S = fin({ screen: "done", reply: { ask: { status: "ok" }, take: { status: "loading" } } }); }],
          ["Cierre", () => { P.S = fin({ screen: "done" }); }],
          ["Hoy después", () => { P.S = fin({ screen: "hoy" }); }],
          ["Seguimiento con tarea (ilustrativo)", () => { P.S = clean({ screen: "followup", fu: "task" }); }],
          ["Seguimiento sin tarea (ilustrativo)", () => { P.S = clean({ screen: "followup", fu: "none" }); }],
        );
        boot0(key, render, ACT, cfg);
      };

      // reviewer panel: name toggle and honest notes about what is real and what is not
      const rev0 = P.reviewer;
      P.reviewer = (cfg) => {
        rev0(cfg);
        const r = $("#rev-controls");
        r.insertAdjacentHTML("afterbegin", `<h2>Nombre en Hoy (sintético)</h2><div class="row">
          <button data-nm="short" aria-pressed="true">Preferido corto</button><button data-nm="first" aria-pressed="false">Sin preferido</button><button data-nm="long" aria-pressed="false">Preferido largo</button></div>`);
        r.insertAdjacentHTML("beforeend", `<h2>Qué es de la app y qué no</h2>
          <p class="fine">Hoy imita las dos capturas de la app (Arashiyama, día 4) con contenido de Wuzhen. Son ilustrativos y están etiquetados: «Tu camino por Asia», las tres filas de «Para hoy» y la barra de cinco pestañas (${C3.tNav}).</p>
          <p class="fine">${C3.tProgress}.</p>
          <p class="fine">Las respuestas de Elara son pre-escritas y no validan la calidad de la IA de producción. Guardar y sin conexión son simulados. El teclado es un dibujo, no un dispositivo.</p>`);
        r.addEventListener("click", (e) => {
          const b = e.target.closest("[data-nm]"); if (!b) return;
          NM = b.dataset.nm;
          r.querySelectorAll("[data-nm]").forEach((x) => { const on = x.dataset.nm === NM; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
          P.paint();
        });
        r.querySelector('[data-nm="short"]').classList.add("on");
      };
    },
    afterPaint: () => {
      const k = document.querySelector("#app .kbd");
      if (k && !k.querySelector(".kbtag")) k.insertAdjacentHTML("beforeend", `<span class="kbtag">${C3.tKb}</span>`);
    },

    screens: (A) => {
      const { S, m, X, C, NONE, I, tag, esc, clip, fx, wrote, top, parts, tabs } = A;
      const hasChoice = () => !!S().choice && !S().askSkipped;
      const q2 = () => (hasChoice() ? C3.q2[S().choice] || C3.q2Free : C3.q2Free);
      const words = (t, cls = "") => `<p class="words3 ${cls}${t.length > 160 ? " long" : ""}"><span class="hang" aria-hidden="true">«</span>${esc(t)}<span aria-hidden="true">»</span></p>`;
      const stamp = (cls = "") => `<div class="stp3 ${cls}"><div class="pic" role="img" aria-label="Sello de ${C3.stampName}"></div><p class="cap">${C3.stampName}</p></div>`;
      // decorative cancellation mark: place and date, low contrast, hidden from assistive technology
      const postmark = () => `<svg class="pm3" viewBox="0 0 132 80" aria-hidden="true" focusable="false">
          <g fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="40" cy="40" r="31"/><circle cx="40" cy="40" r="22"/>
          <path d="M74 30c8-5 13 5 21 0s13 5 21 0M74 42c8-5 13 5 21 0s13 5 21 0M74 54c8-5 13 5 21 0s13 5 21 0"/></g>
          <defs><path id="pm3p" d="M40 40m-26.5 0a26.5 26.5 0 1 1 53 0a26.5 26.5 0 1 1 -53 0"/></defs>
          <text font-family="Instrument Sans, sans-serif" font-size="7.4" font-weight="600" letter-spacing="1.3" fill="currentColor"><textPath href="#pm3p">WUZHEN · 3 NOV · SEMANA 2 ·</textPath></text>
          <text x="40" y="44" text-anchor="middle" font-family="Fraunces, serif" font-size="12" font-weight="600" fill="currentColor">DÍA 1</text></svg>`;
      const rings = () => `<svg class="rings3" viewBox="0 0 60 30" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="16" cy="15" r="12"/><circle cx="16" cy="15" r="8"/><path d="M32 9h26M32 15h26M32 21h26"/></g></svg>`;
      const keepsake = () => `<div class="keep3"><div class="lk" role="img" aria-label="${m.keepsake}"></div><p><span>${C3.keep}</span>${m.keepsake}</p></div>`;
      const tomorrow = () => `<section class="tom3" aria-label="${C3.tomorrow}"><div class="k" role="img" aria-label="${C.tomorrow.keepsake}"></div><div>
          <p class="t1">${C3.tomorrow} · unos ${C.tomorrow.minutes} min</p><p class="t2">${C.tomorrow.title}</p></div></section>`;
      const torn = (cls, inner) => `<div class="torn ${cls}"><div class="paper">${inner}</div></div>`;
      const greetName = () => { const n = NAMES[NM]; return n.pref || n.full.split(/\s+/)[0]; };

      /** the postcard: only ever with her words */
      const postcard = () => {
        const s = S();
        return torn("pcard", `<article class="pc3" aria-label="${X.cardToday}">
          <div class="pc-head"><div class="pc-id"><p class="pc-meta">${m.place} · Semana ${m.week} · Día 1 · 3 nov</p><p class="pc-lab">${C.take.title}</p></div>
            <div class="stwrap">${stamp()}${postmark()}</div></div>
          ${words(s.take.trim())}
          ${hasChoice() ? `<p class="about">${C3.about} ${esc(s.choice)}</p>` : ""}
          ${A.note("take", { main: true })}
          <div class="pc-foot"><div class="lnt3" role="img" aria-label="${m.keepsake}"></div></div></article>`);
      };

      /** «Para retomar»: the one existing card holds the saved answer; none when there is nothing to retake */
      const retakeCard = () => {
        const s = S();
        if (!s.done) return "";
        const w = wrote();
        if (!w && !hasChoice()) return ""; // both skipped: no card at all
        const low = !w || lowContent(s.take);
        const v = hasChoice() ? q2() : C3.q2Free;
        const ctx = w ? `${C3.about} ${hasChoice() ? s.choice + " · " : ""}${shortQ(v.q, 4)}` : `${C3.about} ${shortQ(C.ask.title, 5)}`;
        const body = w ? `<p class="rc-words clamp">«${esc(s.take.trim())}»</p>` : `<p class="rc-plain">${esc(s.choice)}</p>`;
        return `<section class="resume3" aria-labelledby="rt-h"><h2 id="rt-h" class="sec">${C3.retake}</h2>
          <article class="rcard"><p class="rc-t">${low ? C3.retakeAnswer : C3.retakeReflection}</p>
            <p class="rc-ctx">${ctx}</p>${body}
            <div class="rc-act"><button class="lnk" data-act="review" aria-label="${low ? "Ver tu respuesta del día 1" : "Ver tu reflexión del día 1"}">${low ? C3.backAnswer : C3.backReflection}</button>
              <button class="lnk" data-act="edit" aria-label="${X.editA11y}">${C3.edit}</button></div></article></section>`;
      };

      return {
        open() {
          return `<div class="scr c3">${P.sbar()}${top({ close: "none" })}
            <div class="scroll"><div class="pad">
              <p class="meta3">${C3.meta}</p>
              <h1 class="title3">${m.title}</h1>
              <p class="purpose3">${C3.purpose}</p>
              <p class="opt3">${C3.optional}</p>
              <div class="hint3"><span class="stp3 mini" aria-hidden="true"></span><p>${C3.hint}</p></div>
              <p class="tagline">${tag(C.status)}</p>
            </div></div>
            <div class="foot"><button class="btn" data-act="toAsk">${C3.begin} ${I.arrow}</button></div></div>`;
        },
        ask() {
          const s = S();
          const opts = C.ask.options.map((o) => `<button class="opt" role="radio" aria-checked="${s.sel === o}" data-act="pick" data-arg="${esc(o)}">${esc(o)}<span class="rad" aria-hidden="true"></span></button>`).join("");
          const banner = s.resumed ? `<p class="banner" role="status">${C.ui.resumeEyebrow} ${tag(X.tags.saved)}</p>`
            : s.editing && s.take.trim() ? `<p class="banner" role="status">${X.draftKept}</p>` : "";
          return `<div class="scr c3">${P.sbar()}${top()}
            <div class="scroll"><div class="pad">${banner}
              <h1 class="h-q qhead" id="ask-h">${C.ask.title}</h1><p class="sub">${C.ask.body}</p>
              <div class="opts" role="radiogroup" aria-labelledby="ask-h">${opts}</div><div style="height:12px"></div></div></div>
            <div class="foot"><button class="btn" data-act="askNext" ${s.sel ? "" : "disabled"}>${C3.next} ${I.arrow}</button>
              <button class="btn ghost" data-act="askSkip">${C.ask.skip}</button></div></div>`;
        },
        take() { // compact: the selected option, then the question and the field. Nothing decorative.
          const s = S(), p = parts(), v = q2();
          return `<div class="${p.takeClass} c3">${P.sbar()}${top()}
            <div class="scroll"><div class="pad">${p.banner}
              <div class="choice-row"><p class="cv"><small>${C3.choiceLabel}</small>${s.askSkipped ? `<span class="skipped">${C.ask.skip}</span>` : `<span>${esc(s.choice)}</span>`}</p>
                <button data-act="change" aria-label="${X.changeA11y}">${I.edit}${X.change}</button></div>
              <p class="lab3" id="take-h">${C.take.title}</p>
              <h1 class="q3" id="take-i">${v.q}</h1>
              <p class="ex3">${C3.exLabel} ${v.ex}</p>
              ${p.notice}${p.field}${p.sample}${p.noteAsk}<div style="height:12px"></div></div></div>
            ${p.takeFoot}${A.kbd()}</div>`;
        },
        done() {
          const s = S(), p = parts(), w = wrote();
          const choiceOnly = !w && hasChoice() ? `<p class="choice3"><span>${C3.choiceLabel}</span>${esc(s.choice)}</p>` : "";
          const body = w ? postcard()
            : `${choiceOnly}${keepsake()}<p class="calm3">${C3.calm}</p><p class="tagline">${tag(C3.tProgress)}</p>`;
          return `<div class="scr c3${fx("finish") ? " fx-finish" : ""}">${P.sbar()}${top({ back: false, close: "home" })}
            <div class="scroll"><div class="pad">
              <p class="eyebrow ember">${X.doneEyebrow}</p>
              <h1 class="h-display sm">${C3.doneTitle}</h1>${p.updated}
              ${body}
              ${tomorrow()}
              <p class="tagline">${tag(X.tags.saved)}</p>
              <div style="height:12px"></div></div></div>
            <div class="foot"><button class="btn" data-act="toHoy">${C.ui.backToday}</button>
              <button class="btn ghost" data-act="edit" aria-label="${w ? X.editA11y : C3.toQuestions}">${w ? C3.edit : C3.toQuestions}</button></div></div>`;
        },
        followup() { // illustration only: a follow-up day, as the app's Hoy of another day implies
          const s = S(), task = s.fu === "task";
          return `<div class="scr c3">${P.sbar()}
            <div class="topbar"><button class="icon-btn" data-act="toHoy" aria-label="Volver a Hoy">${I.back}</button><p class="fu-t">${C3.tFu}</p><span class="sp44"></span></div>
            <div class="scroll"><div class="pad">
              <p class="tagline" style="margin-top:0">${tag(C3.tFu)}</p>
              ${task ? `<p class="ctx3"><span>Tu tarea:</span> ${C3.fuTask} ${tag(C3.tExample)}</p>`
                     : `<p class="ctx3 none">${C3.fuNone} ${tag(C3.tProposed)}</p>`}
              <h1 class="h-q qhead">${C3.fuQuestion}</h1>
              <div class="ph3" role="note">${C3.fuOptions}</div>
              <div style="height:12px"></div></div></div>
            <div class="foot"><button class="btn" disabled>${C3.next} ${I.arrow}</button><button class="btn ghost" data-act="toHoy">${C.ask.skip}</button></div></div>`;
        },
        hoy() {
          const s = S(), done = !!s.done, resume = !done && !!s.inProgress;
          const n = NAMES[NM], name = greetName();
          const draft = resume && s.take.trim() ? `<p class="draft3"><span>${X.draftLabel}</span> «${esc(clip(s.take, 80))}»</p>` : "";
          const heroTail = done
            ? `<p class="next3"><b>${C3.tomorrow} · unos ${C.tomorrow.minutes} min</b><span>${C.tomorrow.title}</span></p>`
            : `<p class="min3">Unos ${m.minutes} minutos.</p>${resume ? `<p class="resume3t">${C.ui.resumeEyebrow} · ${s.resumeAt === "take" ? "Pregunta 2 de 2" : "Pregunta 1 de 2"}</p>${draft}<p class="tagline">${tag(X.tags.saved)}</p>` : ""}`;
          const days = [1, 2, 3, 4, 5, 6, 7].map((d) => {
            if (d === 1 && done) return `<li><span class="dc dn" role="img" aria-label="Día 1, hecho"><i class="th"></i><b class="ck"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></b></span><span class="dl">1</span></li>`;
            if (d === 1) return `<li><span class="dc td" role="img" aria-label="Hoy, día 1"></span><span class="dl today">Hoy</span></li>`;
            return `<li><span class="dc" role="img" aria-label="Día ${d}, pendiente"></span><span class="dl">${d}</span></li>`;
          }).join("");
          const cta = done ? C3.ctaDone : resume ? C3.ctaResume : C3.ctaStart;
          const act = done ? "review" : "start";
          const rows = [
            [`<span class="rt">${C3.guide}</span><span class="rs">${C3.guideSub}</span>`, ""],
            [`<span class="rt">${C3.assess}</span><span class="rs">${C3.assessSub}</span>`, '<span class="dots6" aria-hidden="true"><i style="background:#E8742A"></i><i style="background:#3F6FB5"></i><i style="background:#D9487E"></i><i style="background:#2E9C84"></i><i style="background:#D9A21B"></i><i style="background:#7A52B0"></i></span>'],
            [`<span class="rt">${C3.talk}</span><span class="rs">${C3.talkSub}</span>`, ""],
          ].map(([t, lead]) => `<li><button class="row3" data-act="oos">${lead}<span class="rtx">${t}</span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></li>`).join("");
          return `<div class="scr hoy c3">${P.sbar()}<div class="scroll">
            <div class="hoytop"><p class="hoy-date">Martes · 3 nov</p>
              <div class="greet${(C3.hello + name).length > 24 ? " sm" : ""}"><h1>${C3.hello}, ${esc(name)}</h1><span class="avatar" aria-hidden="true">${initials(n.full)}</span></div></div>
            ${torn("hero3", `<div class="hero-in"><div class="photo" role="img" aria-label="Canal de Wuzhen"></div>
                ${stamp("hero")}${rings()}
                <p class="where3">${m.placeFull} · Semana ${m.week} · Día 1${done ? " hecho" : ""}</p>
                <h2 class="title-q">${C.ask.title}</h2>${heroTail}</div>`)}
            <section class="asia" aria-labelledby="asia-h"><div class="asia-tx"><h2 id="asia-h">${C3.asiaTitle}</h2>
                <p>${done ? 8 : 7} días completados</p><p>2 lugares recorridos</p>
                <button class="lnk" data-act="oos">${C3.asiaMore} ›</button><p class="tagline">${tag(C3.tIllus)}</p></div>
              <svg class="globe" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle cx="60" cy="60" r="58" fill="#A9D3E4"/><path d="M18 40c10-14 26-10 34-4 6-10 20-12 30-4 8 6 4 16 14 20-4 12-16 8-22 14-6 8-4 18-14 20-8-8-6-16-14-18-8 0-16-4-22-10-4-6-8-10-6-18z" fill="#F2B88C"/><circle cx="70" cy="48" r="13" fill="none" stroke="#C94A1C" stroke-width="3"/></svg></section>
            <section class="week3" aria-labelledby="wk-h"><div class="wk-hd"><h2 id="wk-h">${C3.weekOf}</h2><span class="cnt">${done ? 1 : 0} de 7</span></div>
              <ol class="days">${days}</ol><p class="wkline">${C3.greetMore}</p></section>
            ${retakeCard()}
            <section class="forday" aria-labelledby="fh-h"><div class="fh"><h2 id="fh-h" class="sec quiet">${C3.forToday}</h2><span class="opt-tag">${C3.optionalTag}</span></div>
              <ul class="rows">${rows}</ul><p class="tagline">${tag(C3.tRows)}</p>
              <button class="helpb" data-act="oos"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>${C3.help}</button></section>
            <div style="height:16px"></div></div>
            <div class="cta3"><button class="btn" data-act="${act}">${cta} ${I.arrow}</button></div>
            ${tabs.replace("</nav>", `<span class="navtag rtag">${C3.tNav}</span></nav>`)}</div>`;
        },
      };
    },
  };
})();
