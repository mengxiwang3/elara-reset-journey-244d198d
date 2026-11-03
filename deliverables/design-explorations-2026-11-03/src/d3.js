/* ---------- Direction 3 · Con Elara ----------
 * Signature: the orb is the one moving mark. It is large while Elara speaks (the day's
 * line in her italic, on deep forest), it steps aside to a still dot in the paper's corner
 * while she writes, and it comes back large to receive her words and hand back the card.
 * Same logic as C v2 (c2.js); only the screens below change. Her closing reply (simulated,
 * labelled) is what Elara "says" at the close; everything else she says is fixed UI copy.
 */
const VARIANT = (() => {
  const T = { // new copy, proposal pending María and Alejandra
    elara: "Elara",
    aside: "Elara se aparta mientras escribes",
    handed: "Tu tarjeta, de vuelta",
    restLine: "Hoy no hace falta escribir nada.",
    kept: "Guardada contigo",
    eve: "Para llevarte, de hoy",
  };
  return {
    key: "d3",
    copy: T,
    screens: (A) => {
      const { S, m, X, C, NONE, I, tag, esc, clip, fx, wrote, realChoice, top, parts, tabs, base } = A;
      const orb = (pos) => `<span class="orb3 at-${pos}${fx("enter") ? " fx-orb from-" + (P.fx.from || "x") : ""}" aria-hidden="true"></span>`;
      const words = (t) => `<p class="words3"><span class="hang" aria-hidden="true">«</span>${esc(t)}<span aria-hidden="true">»</span></p>`;
      const stub = `<p class="stub3">${C.take.title}</p>`;
      return {
        open() {
          return `<div class="scr d3 night">${P.sbar()}${top({ close: "none" })}
            <div class="scroll"><div class="stage3">
              <div class="strip3" role="img" aria-label="Canal de Wuzhen"></div>
              ${orb("speak")}
              <p class="who3">${T.elara} · ${m.place} · Día 1</p>
              <h1 class="say3" id="why-h">${X.purposeLine}</h1>
              <p class="pay3">${C.weekPayoff}</p>
            </div>
            <div class="paper3"><p class="t3">${m.title} · unos ${m.minutes} min</p>
              <div class="mini3"><div class="lk3" role="img" aria-label="${m.keepsake}"></div>
                <p><span>${X.youTake}</span>${X.ghostHint1}. ${X.ghostHint2}.</p></div>
              <p class="note">${C.introNote}</p><p class="tagline">${tag(C.status)}</p><div style="height:12px"></div></div></div>
            <div class="foot"><button class="btn" data-act="toAsk">${X.startCard} ${I.arrow}</button></div></div>`;
        },
        ask() {
          const s = S();
          const opts = C.ask.options.map((o) => `<button class="opt" role="radio" aria-checked="${s.sel === o}" data-act="pick" data-arg="${esc(o)}">${esc(o)}<span class="rad" aria-hidden="true"></span></button>`).join("");
          const banner = s.resumed ? `<p class="banner" role="status">${C.ui.resumeEyebrow} ${tag(X.tags.saved)}</p>`
            : s.editing && s.take.trim() ? `<p class="banner" role="status">${X.draftKept}</p>` : "";
          return `<div class="scr d3">${P.sbar()}${top()}
            <div class="scroll"><div class="pad">${banner}
              <div class="asks">${orb("ask")}<h1 class="h-q" id="ask-h">${C.ask.title}</h1></div><p class="sub">${C.ask.body}</p>
              <div class="opts" role="radiogroup" aria-labelledby="ask-h">${opts}</div><div style="height:12px"></div></div></div>
            <div class="foot"><button class="btn" data-act="askNext" ${s.sel ? "" : "disabled"}>${X.addToCard} ${I.arrow}</button>
              <button class="btn ghost" data-act="askSkip">${C.ask.skip}</button></div></div>`;
        },
        take() { // the orb is a still dot in the corner: nothing moves while she writes
          const s = S(), p = parts();
          return `<div class="${p.takeClass} d3">${P.sbar()}${top()}
            <div class="scroll"><div class="pad">${p.banner}
              <div class="sheet3"><span class="orb3 at-corner" role="img" aria-label="${T.aside}"></span>
                <div class="chosen3"><p><span class="l">${X.yourChoice}</span><span class="v${s.askSkipped ? " skipped" : ""}">${esc(p.choiceText)}</span></p>${p.change}</div>
                ${p.heading}${p.instr}${p.notice}${p.field}${p.sample}</div>
              ${p.noteAsk}<div style="height:12px"></div></div></div>
            ${p.takeFoot}${A.kbd()}</div>`;
        },
        done() {
          const s = S(), p = parts(), w = wrote();
          const r = P.reply("take");
          // Elara speaks her (simulated) closing note; with nothing written she says nothing
          // generated: a fixed line, not presented as a reply.
          const say = w
            ? r.status === "ok" ? `<p class="say3 reply">${esc(r.text)}</p><p class="simrow">${P.label()}</p>` : p.noteTake
            : `<p class="say3">${T.restLine}</p>`;
          return `<div class="scr d3 night${fx("finish") ? " fx-finish" : ""}">${P.sbar()}${top({ back: false, close: "home" })}
            <div class="scroll"><div class="stage3 close">
              ${orb("receive")}
              <p class="who3">${X.doneEyebrow}</p>
              <h1 class="h3">${w ? T.handed : X.restTitle}</h1>${p.updated}
              <div class="say-wrap">${say}</div></div>
            <div class="paper3 handed">
              <article class="card3" aria-label="${w ? X.cardToday : X.restTitle}">
                <div class="lk3 big" role="img" aria-label="${m.keepsake}"></div>
                <p class="meta3">${m.place} · Semana ${m.week} · Día 1</p>
                ${realChoice() ? `<p class="ch3"><span>${X.yourChoice}</span>${esc(s.choice)}</p>` : ""}
                ${w ? `${stub}${words(s.take.trim())}` : `<p class="ch3"><span>${X.restKeepsake}</span>${m.keepsake}</p>`}
              </article>
              ${p.editBtn}${p.summary}${p.where}
              <section class="next3"><p class="t1">Mañana · Día 2 · unos ${C.tomorrow.minutes} min</p><p class="t2">${C.tomorrow.title}</p></section>
              <div style="height:12px"></div></div></div>${p.doneFoot}</div>`;
        },
        hoy() {
          const s = S();
          if (!s.done) return base.hoy();
          const w = wrote();
          return `<div class="scr hoy d3">${P.sbar()}<div class="scroll">
            <div class="hello3"><div><p class="hoy-date">Martes · 3 nov</p><h1 class="hoy-hi">Buenos días, ${C.sample.name}</h1></div><span class="orb3 at-hoy" aria-hidden="true"></span></div>
            <section class="eve3" aria-labelledby="eve-h">
              <div class="eve-ph" role="img" aria-label="Canal de Wuzhen"></div>
              <div class="eve-in"><h2 id="eve-h">${w ? T.eve : X.restTitle}</h2>
                ${w ? words(clip(s.take, 120)) : `<p class="restline3"><span class="lk3" role="img" aria-label="${m.keepsake}"></span>${X.restKeepsake}: ${m.keepsake}</p>`}
                ${realChoice() ? `<p class="ch3 dark"><span>${X.yourChoice}</span>${esc(s.choice)}</p>` : ""}
                <div class="two"><button class="btn sm inv" data-act="review">${X.seeCard}</button><button class="btn sm inv line" data-act="edit" aria-label="${X.editA11y}">${I.edit} ${X.edit}</button></div>
                <p class="tagline">${tag(X.tags.saved)}</p></div></section>
            <section class="wk3" aria-label="Tu semana en ${m.place}: 1 de 7"><p>Tu semana en ${m.place} <b>1 de 7</b></p>
              <ol>${[1, 2, 3, 4, 5, 6, 7].map((d) => d === 1 ? `<li class="got" role="img" aria-label="Día 1: hecho, ${m.keepsake}"></li>` : `<li>${d}</li>`).join("")}</ol></section>
            <div class="post compact"><div class="ph" role="img" aria-label="Canal de Wuzhen"></div><div class="in">
              <p class="where">${m.placeFull} · Semana ${m.week} · Día 1 hecho</p><h2>${m.title}</h2>
              <p class="min">Mañana, el día 2. Unos ${C.tomorrow.minutes} minutos.</p></div></div>
            <div style="height:24px"></div></div>${tabs}</div>`;
        },
      };
    },
  };
})();
