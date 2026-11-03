/* ---------- Concept C · action-first, building a takeaway card ---------- */
(() => {
  const S = () => P.S;
  const m = C.meta;
  const SLOT1 = "Tu elección"; // proto label on the card

  const note = (step) => {
    const r = P.reply(step);
    if (r.status === "none") return "";
    if (r.status === "loading")
      return `<div class="enote load" role="status"><span class="orb" aria-hidden="true"></span>${C.ui.thinking}<span class="dots"><span></span><span></span><span></span></span></div>`;
    if (r.status === "error")
      return `<div class="enote err" role="status"><div class="hd"><span class="w">${I.cloud} ${C.ui.offlineTitle}</span></div><p>${C.ui.offlineBody}</p>
        <div class="row2"><button class="p" data-act="retry" data-arg="${step}">${C.ui.retry}</button><button class="s" data-act="skipWait" data-arg="${step}">${C.ui.continueWithout}</button></div></div>`;
    return `<div class="enote"><div class="hd"><span class="w"><span class="orb" aria-hidden="true"></span>${C.ui.noticed}</span>${P.label(r.kind)}</div><q>${esc(r.text)}</q></div>`;
  };

  /** mode: ghost | take | done | compact */
  const card = (mode) => {
    const s = S();
    const ghost = mode === "ghost";
    const choiceVal = s.askSkipped ? `<div class="hint">${C.ask.skip}</div>` : s.choice ? `<div class="val">${esc(s.choice)}</div>` : `<div class="empty"></div>`;
    let slot2;
    if (mode === "take") {
      slot2 = `<div class="hint">${C.take.body}</div>
        <textarea class="write" placeholder="${C.take.placeholder}" aria-label="${C.take.title}">${esc(s.take)}</textarea>
        <button class="sample-btn" data-act="useSample">Usar respuesta de ejemplo (sintética)</button>`;
    } else if (ghost) {
      slot2 = `<div class="empty w2"></div><div class="empty" style="width:50%"></div>`;
    } else {
      slot2 = s.takeSkipped ? `<div class="hint">Hoy lo dejaste aquí. También cuenta.</div>` : `<div class="val serif">«${esc(s.take)}»</div>`;
    }
    const filled1 = !ghost && (s.choice || s.askSkipped);
    const filled2 = mode === "done" || mode === "compact";
    return `<article class="tcard${ghost ? " ghostcard" : ""}${mode === "take" ? " slim" : ""}" aria-label="Tu tarjeta de hoy">
      ${mode === "take" ? "" : `<div class="ph" role="img" aria-label="Canal de Wuzhen"></div><div class="k${filled2 ? "" : " ghost"}" role="img" aria-label="${m.keepsake}"></div>`}
      <div class="in"><div class="meta">Martes 3 nov · ${m.place} · Semana ${m.week} · Día 1</div>
        <div class="slot${filled1 ? " filled" : ""}"><div class="lab"><span class="n">${filled1 ? "✓" : "1"}</span>${SLOT1}</div>${choiceVal}
          ${mode === "take" && !s.askSkipped ? note("ask") : ""}</div>
        <div class="slot${filled2 ? " filled" : ""}"><div class="lab"><span class="n">${filled2 ? "✓" : "2"}</span>${C.take.title}</div>${slot2}
          ${mode === "done" && !s.takeSkipped ? note("take") : ""}</div>
      </div></article>`;
  };

  const top = (title, { back = true, close = true } = {}) => `<div class="c-top">
    ${back ? `<button class="icon-btn" data-act="back" aria-label="Volver">${I.back}</button>` : '<span style="width:44px"></span>'}
    <div class="t">${title}</div>
    ${close ? `<button class="icon-btn" data-act="leave" aria-label="Salir y volver a Hoy">${I.close}</button>` : '<span style="width:44px"></span>'}</div>`;

  const screens = {
    hoy() {
      const s = S();
      if (s.done) return P.hoy({ state: "done", extra: `
        <div class="pinned"><h3>Tu tarjeta de esta semana <button data-act="toColl">Tu colección</button></h3>${card("compact")}</div>
        <div class="hoy-sec"><div class="tom2"><div class="k" role="img" aria-label="${C.tomorrow.keepsake}"></div><div>
          <b>Mañana · Día 2 · unos ${C.tomorrow.minutes} min</b><span>${C.tomorrow.title}</span><small>${C.tomorrow.bridge}</small></div></div></div>` });
      return P.hoy({ state: s.inProgress ? "resume" : "fresh", resumeLabel: s.choice || s.askSkipped ? "Tarjeta 1 de 2" : "Tarjeta 0 de 2" });
    },
    preview() {
      return `<div class="scr">${P.sbar()}${top(`${m.place} · Día 1 · unos ${m.minutes} min`, { close: false })}
        <div class="scroll"><div class="pad pv" style="padding-top:8px">
          <div class="eyebrow" style="color:var(--ember)">Lo que te llevas hoy</div>
          <h1>${m.title}</h1>
          ${card("ghost")}
          <p class="why"><b>${C.purposeLine}</b> ${C.weekPayoff}</p>
          <p class="note">${C.introNote}</p>
          <p style="margin:14px 0 8px"><span class="rtag">${C.status}</span></p>
        </div></div>
        <div class="foot"><button class="btn" data-act="toAsk">Empezar mi tarjeta ${I.arrow}</button></div></div>`;
    },
    ask() {
      const s = S();
      const opts = C.ask.options.map((o) => `<button class="opt" role="radio" aria-checked="${s.choice === o}" data-act="pick" data-arg="${esc(o)}">${esc(o)}<span class="rad"></span></button>`).join("");
      return `<div class="scr">${P.sbar()}${top("Tu tarjeta · paso 1 de 2")}
        <div class="scroll"><div class="pad" style="padding-top:8px">
          <div class="minicard" aria-label="Tu tarjeta"><div class="k"></div><div class="s">
            <div class="${s.choice ? "on" : ""}"><span class="n">${s.choice ? "✓" : "1"}</span><span class="v">${esc(s.choice || SLOT1)}</span></div>
            <div><span class="n">2</span><span class="v">${C.take.title}</span></div></div></div>
          <div class="qhead"><h1 class="h-q">${C.ask.title}</h1><p class="sub">${C.ask.body}</p></div>
          <div class="opts" role="radiogroup" aria-label="${C.ask.title}" style="margin-top:16px">${opts}</div>
          <div style="height:16px"></div></div></div>
        <div class="foot"><button class="btn" data-act="askNext" ${s.choice ? "" : "disabled"}>Añadir a mi tarjeta ${I.arrow}</button>
          <button class="btn ghost" data-act="askSkip">${C.ask.skip}</button></div></div>`;
    },
    take() {
      const s = S();
      return `<div class="scr">${P.sbar()}${top("Tu tarjeta · paso 2 de 2")}
        <div class="scroll"><div class="pad" style="padding-top:8px">${card("take")}<div style="height:16px"></div></div></div>
        <div class="foot"><button class="btn" id="finish" data-act="finish" ${s.take.trim() ? "" : "disabled"}>${C.ui.finish} ${I.check}</button>
          <button class="btn ghost" data-act="takeSkip">${C.take.skip}</button></div></div>`;
    },
    done() {
      return `<div class="scr">${P.sbar()}${top("Día 1 completado", { close: false })}
        <div class="scroll"><div class="pad" style="padding-top:8px">
          <div class="eyebrow" style="color:var(--ember)">Tu tarjeta de hoy</div>
          <h1 class="h-display" style="font-size:27px;margin:4px 0 14px">Lista para esta semana</h1>
          ${card("done")}
          <div class="where-list">
            <div>${I.check}<span>Queda en Hoy durante toda la semana.</span></div>
            <div>${I.bookmark}<span>Guardada en Tu colección · Semana ${m.week}</span></div></div>
          <div class="tom2"><div class="k" role="img" aria-label="${C.tomorrow.keepsake}"></div><div>
            <b>Mañana · Día 2 · unos ${C.tomorrow.minutes} min</b><span>${C.tomorrow.title}</span><small>${C.tomorrow.bridge}</small></div></div>
          <div style="height:12px"></div></div></div>
        <div class="foot"><button class="btn" data-act="toHoy">${C.ui.backToday}</button>
          <button class="btn ghost" data-act="toColl">Ver en Tu colección</button></div></div>`;
    },
    coll() {
      return `<div class="scr">${P.sbar()}${top("", { close: false })}
        <div class="scroll"><div class="pad coll">
          <h1>Tu colección</h1><p class="sub">Lo que has ido creando en el camino.</p>
          <div class="wk">Semana ${m.week} · ${m.weekTitle}</div><span class="chip">Frase</span>
          ${card("compact")}
          <div style="height:20px"></div></div></div></div>`;
    },
  };

  const go = (screen) => P.set({ screen });
  const ACT = {
    start: () => { const s = S(); go(s.inProgress ? s.resumeAt || "ask" : "preview"); },
    review: () => go("done"),
    toAsk: () => go("ask"),
    pick: (o) => P.set({ choice: o, askSkipped: false }),
    askNext: () => { P.requestReply("ask"); go("take"); },
    askSkip: () => P.set({ choice: null, askSkipped: true, screen: "take" }),
    input: (e) => { if (e.target.matches("textarea.write")) { S().take = e.target.value; S().takeSkipped = false; P.save(); const f = $("#finish"); if (f) f.disabled = !e.target.value.trim(); } },
    finish: () => { P.requestReply("take"); P.set({ screen: "done", done: true, inProgress: false }); },
    takeSkip: () => P.set({ take: "", takeSkipped: true, screen: "done", done: true, inProgress: false }),
    toHoy: () => go("hoy"),
    toColl: () => P.set({ collFrom: S().screen, screen: "coll" }),
    leave: () => P.leaveSheet(),
    leaveConfirm: () => { P.sheet(); P.set({ resumeAt: S().screen, inProgress: true, screen: "hoy" }); P.toast(C.ui.saving + " · guardado"); },
    back: () => {
      const s = S();
      const prev = { preview: "hoy", ask: "preview", take: "ask", done: "hoy", coll: s.collFrom || "hoy" }[s.screen];
      go(prev || "hoy");
    },
  };

  const base = (extra) => Object.assign(P.fresh(), { choice: C.sample.choice, reply: { ask: { status: "ok" } } }, extra);
  const end = (extra) => base(Object.assign({ take: C.sample.take, done: true, reply: { ask: { status: "ok" }, take: { status: "ok" } } }, extra));
  P.boot("c", () => screens[P.S.screen](), ACT, {
    presets: [
      ["Desde el principio", () => { P.S = P.fresh(); }],
      ["Cargando", () => { P.mode = "loading"; P.syncModeButtons(); P.S = base({ screen: "take", reply: { ask: { status: "loading" } } }); }],
      ["Sin conexión", () => { P.S = base({ screen: "take", reply: { ask: { status: "error" } } }); }],
      ["Reanudar (salió a mitad)", () => { P.S = base({ screen: "hoy", inProgress: true, resumeAt: "take" }); }],
      ["Terminada", () => { P.S = end({ screen: "hoy" }); }],
    ],
    screens: [
      ["Hoy", () => { P.S = P.fresh(); }],
      ["Lo que te llevas", () => { P.S = Object.assign(P.fresh(), { screen: "preview" }); }],
      ["Paso 1", () => { P.S = Object.assign(P.fresh(), { screen: "ask" }); }],
      ["Paso 1 elegido", () => { P.S = Object.assign(P.fresh(), { screen: "ask", choice: C.sample.choice }); }],
      ["Paso 2 + nota", () => { P.S = base({ screen: "take" }); }],
      ["Paso 2 escrito", () => { P.S = base({ screen: "take", take: C.sample.take }); }],
      ["Tarjeta (pensando)", () => { P.S = end({ screen: "done", reply: { ask: { status: "ok" }, take: { status: "loading" } } }); }],
      ["Tarjeta lista", () => { P.S = end({ screen: "done" }); }],
      ["Tu colección", () => { P.S = end({ screen: "coll" }); }],
      ["Hoy después", () => { P.S = end({ screen: "hoy" }); }],
    ],
  });
})();
