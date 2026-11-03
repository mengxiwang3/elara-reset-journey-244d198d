/* ---------- Direction 1 · Tarjeta de colección ----------
 * Signature: her choice becomes a perforated postage stamp on a deckle-edged card; at the
 * close a «WUZHEN · DÍA 1» postmark cancels it and the day's lantern is taped on. On Hoy the
 * card lives on an album page whose seven stamp slots are the week.
 * Same logic as C v2 (c2.js); only the screens below change.
 */
const VARIANT = (() => {
  const T = { // new copy, proposal pending María and Alejandra
    stampGhost: "Tu sello",
    album: "Tu álbum de Wuzhen",
    tomorrow: "Mañana",
  };
  return {
    key: "d1",
    copy: T,
    screens: (A) => {
      const { S, m, X, C, NONE, I, tag, esc, clip, fx, wrote, realChoice, top, parts, tabs, base } = A;
      const meta = `Martes 3 nov · ${m.place} · Semana ${m.week} · Día 1`;
      let pmId = 0;
      // the cancellation mark: decorative (aria-hidden); the same facts are in the meta line
      const postmark = (cls = "") => {
        const id = "pm" + ++pmId;
        return `<svg class="pm ${cls}" viewBox="0 0 132 80" aria-hidden="true" focusable="false">
          <g fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="40" cy="40" r="31"/><circle cx="40" cy="40" r="22"/>
          <path d="M74 30c8-5 13 5 21 0s13 5 21 0M74 42c8-5 13 5 21 0s13 5 21 0M74 54c8-5 13 5 21 0s13 5 21 0"/></g>
          <defs><path id="${id}" d="M40 40m-26.5 0a26.5 26.5 0 1 1 53 0a26.5 26.5 0 1 1 -53 0"/></defs>
          <text font-family="Instrument Sans, sans-serif" font-size="7.4" font-weight="600" letter-spacing="1.3" fill="currentColor"><textPath href="#${id}">WUZHEN · 3 NOV · SEMANA 2 ·</textPath></text>
          <text x="40" y="44" text-anchor="middle" font-family="Fraunces, serif" font-size="12" font-weight="600" fill="currentColor">DÍA 1</text></svg>`;
      };
      // perforated stamp; caption is her option, or the place when there is no option to show
      const stamp = (cap, { ghost = false, cls = "" } = {}) => `<div class="stp-wrap ${cls}"><div class="stp${ghost ? " ghost" : ""}">
        ${ghost ? `<span class="g">${T.stampGhost}</span>` : `<div class="pic" role="img" aria-label="Sello de Wuzhen"></div><p class="cap">${esc(cap)}</p>`}</div></div>`;
      const stub = (h = "p", id = "") => `<${h} class="stub"${id ? ` id="${id}"` : ""}>${C.take.title}</${h}>`;
      const words = (t) => `<p class="words"><span class="hang" aria-hidden="true">«</span>${esc(t)}<span aria-hidden="true">»</span></p>`;
      const capFor = () => (realChoice() ? S().choice : `${m.place} · Día 1`);

      /** the finished card: done screen (big) and album (mini) */
      const keepCard = (mini) => {
        const s = S(), w = wrote();
        return `<article class="cc ${mini ? "mini" : "big"}${w ? "" : " restcard"}" aria-label="${w ? X.cardToday : X.restTitle}">
          <p class="cc-meta">${meta}</p>
          ${stamp(capFor(), { cls: "corner" })}${postmark("strike")}
          ${w ? `${stub()}${words(mini ? clip(s.take, 120) : s.take.trim())}<div class="lnt" role="img" aria-label="${m.keepsake}"></div>`
              : `${mini ? `<p class="rest-t">${X.restTitle}</p>` : ""}<div class="rest-k" role="img" aria-label="${m.keepsake}"></div><p class="rest-cap"><span>${X.restKeepsake}</span>${m.keepsake}</p>`}
        </article>`;
      };

      return {
        open() {
          return `<div class="scr d1">${P.sbar()}${top({ close: "none" })}
            <div class="scroll"><div class="pad">
              <p class="kicker">${m.place} · Semana ${m.week} · Día 1 · unos ${m.minutes} min</p>
              <h1 class="d1-title">${m.title}</h1>
              <section class="why1" aria-labelledby="why-h"><h2 id="why-h" class="label">Por qué hoy</h2>
                <p class="why-line">${X.purposeLine}</p><p class="why-pay">${C.weekPayoff}</p></section>
              <h2 class="sec1">${X.youTake}</h2>
              <article class="cc blank" aria-label="${X.cardToday}">
                <p class="cc-meta">${meta}</p>${stamp("", { ghost: true, cls: "corner" })}
                <p class="slot-l"><span class="nn">1</span>${X.ghostHint1}</p>
                ${stub()}<p class="slot-l"><span class="nn">2</span>${X.ghostHint2}</p>
                <div class="lines" aria-hidden="true"></div>
              </article>
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
          return `<div class="scr d1">${P.sbar()}${top()}
            <div class="scroll"><div class="pad">${banner}
              <div class="cc strip" aria-hidden="true"><p class="cc-meta">${meta}</p>
                ${s.sel ? stamp(s.sel, { cls: "corner" + (fx("pick") ? " fx-stamp" : "") }) : stamp("", { ghost: true, cls: "corner" })}
                <p class="slot-l"><span class="nn">1</span>${s.sel ? esc(s.sel) : X.ghostHint1}</p></div>
              <h1 class="h-q qhead" id="ask-h">${C.ask.title}</h1><p class="sub">${C.ask.body}</p>
              <div class="opts" role="radiogroup" aria-labelledby="ask-h">${opts}</div><div style="height:12px"></div></div></div>
            <div class="foot"><button class="btn" data-act="askNext" ${s.sel ? "" : "disabled"}>${X.addToCard} ${I.arrow}</button>
              <button class="btn ghost" data-act="askSkip">${C.ask.skip}</button></div></div>`;
        },
        take() { // calm: no motion here at all
          const s = S(), p = parts();
          return `<div class="${p.takeClass} d1">${P.sbar()}${top()}
            <div class="scroll"><div class="pad">${p.banner}
              <article class="cc write" aria-label="${X.cardToday}">
                ${realChoice() || (s.choice === NONE && !s.askSkipped) ? stamp(s.choice, { cls: "corner" }) : stamp("", { ghost: true, cls: "corner" })}
                <div class="cc-choice"><p><span class="l">${X.yourChoice}</span><span class="v${s.askSkipped ? " skipped" : ""}">${esc(p.choiceText)}</span></p>${p.change}</div>
                <h1 class="take-h stub" id="take-h">${C.take.title}</h1>
                ${p.instr}${p.notice}${p.field}${p.sample}
              </article>${p.noteAsk}<div style="height:12px"></div></div></div>
            ${p.takeFoot}${A.kbd()}</div>`;
        },
        done() {
          const p = parts();
          return `<div class="scr d1${fx("finish") ? " fx-finish" : ""}${fx("updated") ? " fx-updated" : ""}">${P.sbar()}${top({ back: false, close: "home" })}
            <div class="scroll"><div class="pad">
              <p class="kicker ember">${X.doneEyebrow}</p>
              <h1 class="d1-title">${wrote() ? X.cardToday : X.restTitle}</h1>${p.updated}
              ${keepCard(false)}
              ${p.noteTake}
              ${p.editBtn}${p.summary}${p.where}
              <section class="next1" aria-label="${T.tomorrow}"><div class="stp-wrap"><div class="stp ghost tomorrow"><span class="nk" role="img" aria-label="${C.tomorrow.keepsake}"></span></div></div>
                <div><p class="t1">${T.tomorrow} · Día 2 · unos ${C.tomorrow.minutes} min</p><p class="t2">${C.tomorrow.title}</p></div></section>
              <div style="height:12px"></div></div></div>${p.doneFoot}</div>`;
        },
        hoy() {
          const s = S();
          if (!s.done) return base.hoy();
          const slots = [1, 2, 3, 4, 5, 6, 7].map((d) => d === 1
            ? `<li class="got"><div class="stp-wrap"><div class="stp"><span class="nk" role="img" aria-label="Día 1: ${m.keepsake}"></span></div></div><span>1</span></li>`
            : `<li><div class="stp-wrap"><div class="stp ghost"></div></div><span>${d}</span></li>`).join("");
          return `<div class="scr hoy d1">${P.sbar()}<div class="scroll">
            <p class="hoy-date">Martes · 3 nov</p><h1 class="hoy-hi">Buenos días, ${C.sample.name}</h1>
            <section class="album" aria-labelledby="al-h">
              <div class="al-hd"><h2 id="al-h">${T.album}</h2><span class="cnt">1 de 7</span></div>
              <div class="al-page">${keepCard(true)}</div>
              <ol class="al-strip" aria-label="Tu semana en ${m.place}: 1 de 7">${slots}</ol>
              <div class="two"><button class="btn line sm" data-act="review">${X.seeCard}</button><button class="btn line sm" data-act="edit" aria-label="${X.editA11y}">${I.edit} ${X.edit}</button></div>
              <p class="tagline">${tag(X.tags.saved)}</p>
            </section>
            <section class="next1 hoy-next" aria-label="${T.tomorrow}"><div class="stp-wrap"><div class="stp ghost tomorrow"><span class="nk" role="img" aria-label="${C.tomorrow.keepsake}"></span></div></div>
              <div><p class="t1">${T.tomorrow} · Día 2 · unos ${C.tomorrow.minutes} min</p><p class="t2">${C.tomorrow.title}</p></div></section>
            <div style="height:24px"></div></div>${tabs}</div>`;
        },
      };
    },
  };
})();
