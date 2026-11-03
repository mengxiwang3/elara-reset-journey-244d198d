/* ---------- Direction 2 · Paseo por el canal ----------
 * Signature: the canal line. Progress is an inked canal with four stops; an ink "boat" moves
 * one stop per step while the full-bleed Wuzhen photograph pans to the next view. At the
 * last stop she receives the lantern. On Hoy the week is the same canal with seven stops and
 * her note is pinned at today's.
 * Same logic as C v2 (c2.js); only the screens below change. Writing is still: no pan there
 * once she starts typing, and the photo shrinks to a thin strip.
 */
const VARIANT = (() => {
  const T = { // new copy, proposal pending María and Alejandra
    stops: ["El muelle", "El puente", "La casa de té", "El farol"],
    stopOf: (i) => `Parada ${i + 1} de 4`,
    atEnd: "Al final del paseo",
    atEndBody: "Tu farol de hoy y, si quieres, una nota tuya.",
    arrived: "Última parada · Wuzhen",
    weekCanal: "Tu canal esta semana",
    pinned: "Clavada en Wuzhen · Día 1",
    tomorrow: "Mañana, la siguiente parada",
  };
  const PH = { open: "wuzhen-d1.webp", ask: "wuzhen-d4.webp", take: "wuzhen-d5.webp", done: "wuzhen-d7.webp" };
  const POS = { open: "20% 60%", ask: "55% 50%", take: "70% 55%", done: "40% 50%" };
  const IDX = { open: 0, ask: 1, take: 2, done: 3 };
  return {
    key: "d2",
    copy: T,
    screens: (A) => {
      const { S, m, X, C, NONE, I, tag, esc, clip, fx, wrote, realChoice, parts, tabs, base } = A;
      // the canal: one wavy inked path; stops at fixed x; the boat sits on the current stop
      const XS = [8, 36, 64, 92];
      const canal = (i, { from = null, compact = false } = {}) => {
        const dots = XS.map((x, k) => `<circle cx="${x}" cy="${k % 2 ? 9 : 13}" r="${k === 3 ? 3.4 : 2.6}" class="${k < i ? "past" : k === i ? "now" : ""}"/>`).join("");
        const move = from !== null && from !== i && fx("enter");
        return `<div class="canal${compact ? " compact" : ""}" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${i + 1}" aria-valuetext="${T.stopOf(i)}: ${T.stops[i]}">
          <svg viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true"><path d="M0 12 C10 4, 22 18, 36 9 S 56 2, 64 13 S 84 20, 100 8" class="water"/>${dots}</svg>
          <span class="boat${move ? " fx-sail" : ""}" style="--to:${XS[i]}%;--from:${XS[from ?? i]}%" aria-hidden="true"></span>
          ${compact ? "" : `<p class="stopname"><span>${T.stopOf(i)}</span> ${T.stops[i]}</p>`}</div>`;
      };
      const band = (sc, cls = "") => {
        const pan = fx("enter") ? " fx-pan" : "";
        return `<div class="band2 ${cls}${pan}" role="img" aria-label="Wuzhen, ${T.stops[IDX[sc]].toLowerCase()}" style="background-image:url(assets/${PH[sc]});--pos:${POS[sc]}"></div>`;
      };
      const nav = (backAct = "back", right = "leave") => `<div class="nav2">
          ${backAct ? `<button class="icon-btn" data-act="${backAct}" aria-label="Volver un paso">${I.back}</button>` : '<span class="sp44"></span>'}
          ${right === "leave" ? (S().redo ? `<button class="icon-btn" data-act="cancelEdit" aria-label="${X.cancelEditA11y}">${I.close}</button>` : `<button class="icon-btn" data-act="leave" aria-label="Salir y volver a Hoy">${I.close}</button>`)
            : right === "home" ? `<button class="icon-btn" data-act="toHoy" aria-label="${X.closeA11y}">${I.close}</button>` : '<span class="sp44"></span>'}</div>`;
      const from = () => (P.fx.from && IDX[P.fx.from] !== undefined ? IDX[P.fx.from] : null);
      const words = (t) => `<p class="words2"><span class="hang" aria-hidden="true">«</span>${esc(t)}<span aria-hidden="true">»</span></p>`;

      return {
        open() {
          return `<div class="scr d2">${P.sbar()}
            <div class="scroll">${band("open", "tall")}${nav("back", "none")}
              <div class="slab"><p class="kicker2">${m.place} · Semana ${m.week} · Día 1 · unos ${m.minutes} min</p>
                <h1 class="d2-title">${m.title}</h1>
                ${canal(0, { from: from() })}
                <section class="why2" aria-labelledby="why-h"><h2 id="why-h">Por qué hoy</h2><p class="why-line">${X.purposeLine}</p><p class="why-pay">${C.weekPayoff}</p></section>
                <section class="end2" aria-label="${X.youTake}"><div class="lk" role="img" aria-label="${m.keepsake}"></div>
                  <div><h2>${T.atEnd}</h2><p>${T.atEndBody}</p></div></section>
                <p class="note">${C.introNote}</p><p class="tagline">${tag(C.status)}</p><div style="height:12px"></div></div></div>
            <div class="foot"><button class="btn" data-act="toAsk">${X.startCard} ${I.arrow}</button></div></div>`;
        },
        ask() {
          const s = S();
          const opts = C.ask.options.map((o) => `<button class="opt" role="radio" aria-checked="${s.sel === o}" data-act="pick" data-arg="${esc(o)}">${esc(o)}<span class="rad" aria-hidden="true"></span></button>`).join("");
          const banner = s.resumed ? `<p class="banner" role="status">${C.ui.resumeEyebrow} ${tag(X.tags.saved)}</p>`
            : s.editing && s.take.trim() ? `<p class="banner" role="status">${X.draftKept}</p>` : "";
          return `<div class="scr d2">${P.sbar()}
            <div class="scroll">${band("ask", "mid")}${nav()}
              <div class="slab">${canal(1, { from: from() })}${banner}
                <h1 class="h-q qhead" id="ask-h">${C.ask.title}</h1><p class="sub">${C.ask.body}</p>
                <div class="opts" role="radiogroup" aria-labelledby="ask-h">${opts}</div><div style="height:12px"></div></div></div>
            <div class="foot"><button class="btn" data-act="askNext" ${s.sel ? "" : "disabled"}>${X.addToCard} ${I.arrow}</button>
              <button class="btn ghost" data-act="askSkip">${C.ask.skip}</button></div></div>`;
        },
        take() {
          const s = S(), p = parts();
          return `<div class="${p.takeClass} d2">${P.sbar()}
            <div class="scroll">${band("take", "thin")}${nav()}
              <div class="slab">${canal(2, { from: from(), compact: true })}${p.banner}
                <div class="chosen"><p><span class="l">${X.yourChoice}</span><span class="v${s.askSkipped ? " skipped" : ""}">${esc(p.choiceText)}</span></p>${p.change}</div>
                ${p.heading}${p.instr}${p.notice}${p.field}${p.sample}${p.noteAsk}<div style="height:12px"></div></div></div>
            ${p.takeFoot}${A.kbd()}</div>`;
        },
        done() {
          const s = S(), p = parts(), w = wrote();
          return `<div class="scr d2${fx("finish") ? " fx-finish" : ""}">${P.sbar()}
            <div class="scroll">${band("done", "tall end")}${nav(null, "home")}
              <div class="slab">${canal(3, { from: from() })}
                <p class="kicker2 ember">${T.arrived}</p>
                <h1 class="d2-title">${w ? X.cardToday : X.restTitle}</h1>${p.updated}
                <div class="arrive"><div class="lk big" role="img" aria-label="${m.keepsake}"></div>
                  <p class="kname"><span>${X.restKeepsake}</span>${m.keepsake}</p></div>
                ${realChoice() ? `<p class="chosen-line"><span class="l">${X.yourChoice}</span> ${esc(s.choice)}</p>` : ""}
                ${w ? `<div class="pinnote"><p class="stub2">${C.take.title}</p>${words(s.take.trim())}</div>${p.noteTake}` : ""}
                ${p.editBtn}${p.summary}${p.where}
                <section class="next2"><p class="t1">${T.tomorrow} · Día 2 · unos ${C.tomorrow.minutes} min</p><p class="t2">${C.tomorrow.title}</p></section>
                <div style="height:12px"></div></div></div>${p.doneFoot}</div>`;
        },
        hoy() {
          const s = S();
          if (!s.done) return base.hoy();
          const w = wrote();
          const xs = [6, 20, 34, 49, 63, 78, 93];
          const stops = xs.map((x, k) => `<circle cx="${x}" cy="${k % 2 ? 8 : 14}" r="${k ? 2.2 : 3.2}" class="${k ? "" : "past"}"/>`).join("");
          return `<div class="scr hoy d2">${P.sbar()}<div class="scroll">
            <p class="hoy-date">Martes · 3 nov</p><h1 class="hoy-hi">Buenos días, ${C.sample.name}</h1>
            <section class="pc" aria-labelledby="pc-h">
              <div class="pc-ph" role="img" aria-label="Canal de Wuzhen"></div>
              <div class="pc-map"><div class="pc-hd"><h2 id="pc-h">${T.weekCanal}</h2><span>1 de 7</span></div>
                <div class="wk-canal" aria-label="1 de 7 paradas"><svg viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true"><path class="water" d="M0 12 C12 2, 24 20, 38 10 S 60 2, 70 14 S 88 20, 100 8"/>${stops}</svg>
                  <span class="pin" aria-hidden="true"></span></div>
                <div class="pinned2"><p class="where2">${T.pinned}</p>
                  ${w ? `<p class="stub2">${C.take.title}</p>${words(clip(s.take, 120))}` : `<p class="restline"><strong>${X.restTitle}</strong> · ${X.restKeepsake}: ${m.keepsake}</p>`}
                  ${realChoice() ? `<p class="chosen-line"><span class="l">${X.yourChoice}</span> ${esc(s.choice)}</p>` : ""}
                  <div class="two"><button class="btn line sm" data-act="review">${X.seeCard}</button><button class="btn line sm" data-act="edit" aria-label="${X.editA11y}">${I.edit} ${X.edit}</button></div>
                  <p class="tagline">${tag(X.tags.saved)}</p></div></div>
            </section>
            <section class="next2 hoy-next2"><p class="t1">${T.tomorrow} · Día 2 · unos ${C.tomorrow.minutes} min</p><p class="t2">${C.tomorrow.title}</p></section>
            <div style="height:24px"></div></div>${tabs}</div>`;
        },
      };
    },
  };
})();
