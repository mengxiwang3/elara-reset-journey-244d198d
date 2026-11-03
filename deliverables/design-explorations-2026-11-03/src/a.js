/* ---------- Concept A · guided step-by-step ---------- */
(() => {
  const S = () => P.S;
  const SEG = { intro: 0, ask: 1, askReply: 1, take: 2, takeReply: 2, close: 3 };
  const SEG_LABEL = ["Por qué hoy", "Paso 1 de 2 · Elegir", "Paso 2 de 2 · Para llevarte", "Cierre"];

  const topbar = (back = true) => {
    const seg = SEG[S().screen];
    const segs = [0, 1, 2, 3].map((i) => `<i class="${i < seg ? "done" : i === seg ? "now" : ""}"></i>`).join("");
    return `<div class="topbar">
      ${back ? `<button class="icon-btn" data-act="back" aria-label="Volver un paso">${I.back}</button>` : '<span style="width:44px"></span>'}
      <div class="prog" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${seg + 1}" aria-label="${SEG_LABEL[seg]}">
        <div class="segs">${segs}</div><div class="lbl">${SEG_LABEL[seg]}</div></div>
      <button class="icon-btn" data-act="leave" aria-label="Salir y volver a Hoy">${I.close}</button></div>`;
  };

  const replyCard = (step) => {
    const r = P.reply(step);
    if (r.status === "loading" || r.status === "none")
      return `<div class="rep-orb orb pulse" aria-hidden="true"></div>
        <div class="rep loading" role="status">${C.ui.thinking}<span class="dots"><span></span><span></span><span></span></span></div>`;
    if (r.status === "error")
      return `<div class="rep-orb orb" aria-hidden="true" style="opacity:.55"></div>
        <div class="rep err" role="status"><span style="color:var(--muted)">${I.cloud}</span>
          <h3>${C.ui.offlineTitle}</h3><p>${C.ui.offlineBody}</p>
          <div class="row2"><button class="btn line" data-act="retry" data-arg="${step}">${C.ui.retry}</button>
          <button class="btn ghost" data-act="skipWait" data-arg="${step}">${C.ui.continueWithout}</button></div></div>`;
    return `<div class="rep-orb orb" aria-hidden="true"></div>
      <div class="rep"><div class="hd"><b>${C.ui.noticed}</b>${P.label(r.kind)}</div><q>${esc(r.text)}</q></div>`;
  };

  const screens = {
    hoy() {
      const s = S();
      if (s.done) return P.hoy({ state: "done", extra: `
        <div class="hoy-sec"><h3>Para retomar</h3><div class="hoy-retake"><b>Hoy dijiste · Día 1</b><span>«${esc(s.takeSkipped ? s.choice || "Lo dejaste para otro día" : s.take)}»</span></div></div>
        <div class="hoy-sec"><h3>Mañana</h3><div class="tom"><div class="k" style="background-image:url(assets/keepsake-d2.webp)"></div><div><b>Día 2 · unos ${C.tomorrow.minutes} minutos</b><span>${C.tomorrow.title}</span></div></div></div>` });
      return P.hoy({ state: s.inProgress ? "resume" : "fresh", resumeLabel: s.resumeAt === "take" || s.resumeAt === "askReply" ? "Paso 2 de 2" : "Paso 1 de 2" });
    },
    intro() {
      const m = C.meta;
      return `<div class="scr">${P.sbar(true)}
        <div class="scroll">
          <div class="band tall" role="img" aria-label="Canal de Wuzhen"><div class="nav">
            <button class="icon-btn" data-act="back" aria-label="Volver a Hoy">${I.back}</button></div></div>
          <div class="pad" style="padding-top:6px">
            <div class="eyebrow">${m.place} · Semana ${m.week} · Día 1 · unos ${m.minutes} min</div>
            <h1 class="h-display" style="margin-top:6px">${m.title}</h1>
            <div class="why"><div class="eyebrow">Por qué hoy</div>
              <p>${C.purposeLine}</p>
              <div class="payoff">${C.weekPayoff}</div></div>
            <ol class="plan">
              <li><span class="n">1</span><div><b>Elegir · una opción</b><span>${C.ask.title}</span></div></li>
              <li><span class="n">2</span><div><b>${C.take.title} · unas palabras</b><span>${C.take.body}</span></div></li>
            </ol>
            <div class="note"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/></svg><span>${C.introNote}</span></div>
            <p style="margin:16px 0 8px"><span class="rtag">${C.status}</span></p>
          </div></div>
        <div class="foot"><button class="btn" data-act="toAsk">Empezar ${I.arrow}</button></div></div>`;
    },
    ask() {
      const s = S();
      const opts = C.ask.options.map((o) => `<button class="opt" role="radio" aria-checked="${s.choice === o}" data-act="pick" data-arg="${esc(o)}">${esc(o)}<span class="rad"></span></button>`).join("");
      return `<div class="scr">${P.sbar()}${topbar()}
        <div class="scroll"><div class="pad" style="padding-top:12px">
          <h1 class="h-q">${C.ask.title}</h1><p class="sub">${C.ask.body}</p>
          <div class="opts" role="radiogroup" aria-label="${C.ask.title}" style="margin-top:18px">${opts}</div>
          <div style="height:16px"></div></div></div>
        <div class="foot"><button class="btn" data-act="askNext" ${s.choice ? "" : "disabled"}>${C.ui.next} ${I.arrow}</button>
          <button class="btn ghost" data-act="askSkip">${C.ask.skip}</button></div></div>`;
    },
    askReply() {
      const s = S();
      return `<div class="scr">${P.sbar()}${topbar()}
        <div class="scroll"><div class="rep-wrap">
          ${replyCard("ask")}
          <p class="youchose">Elegiste: <b>${esc(s.choice)}</b></p>
        </div></div>
        <div class="foot"><button class="btn" data-act="toTake">${C.ui.next} ${I.arrow}</button></div></div>`;
    },
    take() {
      const s = S();
      const echo = s.choice
        ? `<div class="echo"><div><small>Tu elección de hoy</small><span>${esc(s.choice)}</span></div><button data-act="changeChoice" aria-label="Cambiar tu elección">${I.edit}Cambiar</button></div>`
        : "";
      return `<div class="scr">${P.sbar()}${topbar()}
        <div class="scroll"><div class="pad" style="padding-top:12px">
          ${echo}
          <h1 class="h-q">${C.take.title}</h1><p class="sub">${C.take.body}</p>
          <textarea class="write" style="margin-top:16px" placeholder="${C.take.placeholder}" aria-label="${C.take.title}">${esc(s.take)}</textarea>
          <button class="sample-btn" data-act="useSample">Usar respuesta de ejemplo (sintética)</button>
          <div style="height:16px"></div></div></div>
        <div class="foot"><button class="btn" id="finish" data-act="finish" ${s.take.trim() ? "" : "disabled"}>${C.ui.finish} ${I.check}</button>
          <button class="btn ghost" data-act="takeSkip">${C.take.skip}</button></div></div>`;
    },
    takeReply() {
      return `<div class="scr">${P.sbar()}${topbar()}
        <div class="scroll"><div class="rep-wrap">${replyCard("take")}
          <p class="youchose">Para llevarte: <b>«${esc(S().take)}»</b></p></div></div>
        <div class="foot"><button class="btn" data-act="toClose">Ver lo que te llevas ${I.arrow}</button></div></div>`;
    },
    close() {
      const s = S();
      const keepText = s.takeSkipped ? "Hoy lo dejaste aquí. También cuenta." : `«${esc(s.take)}»`;
      return `<div class="scr">${P.sbar(true)}
        <div class="scroll">
          <div class="done-band" role="img" aria-label="Canal de Wuzhen"><div class="stamp"><div></div>Día 1</div></div>
          <div class="pad" style="padding-top:18px">
            <div class="eyebrow">Semana 2 · Día 1 completado</div>
            <h1 class="h-display" style="margin-top:4px">Hoy te llevas esto</h1>
            <div class="keep"><div class="eyebrow">${C.take.title}</div><blockquote>${keepText}</blockquote>
              ${s.choice ? `<div class="from">Elegiste: ${esc(s.choice)}</div>` : ""}</div>
            <div class="saved">${I.check}<span>Tus respuestas están guardadas. Puedes volver a ellas en tu Atlas.</span></div>
            <p class="weekline"><b>1 de 7 días en ${C.meta.place}.</b> ${C.weekPayoff}</p>
            <div class="tomorrow"><div class="ph" role="img" aria-label="Wuzhen, día 2"></div><div class="in">
              <div class="eyebrow">Mañana · Día 2 · unos ${C.tomorrow.minutes} min</div>
              <p>${C.tomorrow.title}</p><small>${C.tomorrow.bridge}</small></div></div>
            <div style="height:16px"></div></div></div>
        <div class="foot"><button class="btn" data-act="toHoy">${C.ui.backToday}</button></div></div>`;
    },
  };

  const go = (screen) => P.set({ screen });
  const ACT = {
    start: () => { const s = S(); go(s.inProgress ? s.resumeAt || "ask" : "intro"); },
    review: () => go("close"),
    toAsk: () => go("ask"),
    pick: (o) => P.set({ choice: o, askSkipped: false }),
    askNext: () => { P.requestReply("ask"); go("askReply"); },
    askSkip: () => P.set({ choice: null, askSkipped: true, screen: "take" }),
    toTake: () => go("take"),
    changeChoice: () => go("ask"),
    input: (e) => { if (e.target.matches("textarea.write")) { S().take = e.target.value; S().takeSkipped = false; P.save(); const f = $("#finish"); if (f) f.disabled = !e.target.value.trim(); } },
    finish: () => { P.requestReply("take"); go("takeReply"); },
    takeSkip: () => P.set({ take: "", takeSkipped: true, screen: "close", done: true, inProgress: false }),
    toClose: () => P.set({ screen: "close", done: true, inProgress: false }),
    toHoy: () => P.set({ screen: "hoy" }),
    leave: () => P.leaveSheet(),
    leaveConfirm: () => { P.sheet(); P.set({ resumeAt: S().screen, inProgress: true, screen: "hoy" }); P.toast(C.ui.saving + " · guardado"); },
    back: () => {
      const s = S();
      const prev = { intro: "hoy", ask: "intro", askReply: "ask", take: s.askSkipped ? "ask" : "askReply", takeReply: "take", close: "hoy" }[s.screen];
      go(prev || "hoy");
    },
  };

  const full = (extra) => Object.assign(P.fresh(), { choice: C.sample.choice, reply: { ask: { status: "ok" } } }, extra);
  P.boot("a", () => screens[P.S.screen](), ACT, {
    presets: [
      ["Desde el principio", () => { P.S = P.fresh(); }],
      ["Cargando", () => { P.mode = "loading"; P.syncModeButtons(); P.S = full({ screen: "askReply", reply: { ask: { status: "loading" } } }); }],
      ["Sin conexión", () => { P.S = full({ screen: "askReply", reply: { ask: { status: "error" } } }); }],
      ["Reanudar (salió a mitad)", () => { P.S = full({ screen: "hoy", inProgress: true, resumeAt: "take" }); }],
      ["Terminada", () => { P.S = full({ screen: "hoy", done: true, take: C.sample.take, reply: { ask: { status: "ok" }, take: { status: "ok" } } }); }],
    ],
    screens: [
      ["Hoy", () => { P.S = P.fresh(); }],
      ["Por qué hoy", () => { P.S = Object.assign(P.fresh(), { screen: "intro" }); }],
      ["Paso 1", () => { P.S = full({ screen: "ask", reply: {} }); }],
      ["Elara notó 1", () => { P.S = full({ screen: "askReply" }); }],
      ["Paso 2", () => { P.S = full({ screen: "take" }); }],
      ["Paso 2 escrito", () => { P.S = full({ screen: "take", take: C.sample.take }); }],
      ["Elara notó 2", () => { P.S = full({ screen: "takeReply", take: C.sample.take, reply: { ask: { status: "ok" }, take: { status: "ok" } } }); }],
      ["Cierre", () => { P.S = full({ screen: "close", done: true, take: C.sample.take, reply: { ask: { status: "ok" }, take: { status: "ok" } } }); }],
      ["Hoy después", () => { P.S = full({ screen: "hoy", done: true, take: C.sample.take, reply: { ask: { status: "ok" }, take: { status: "ok" } } }); }],
    ],
  });
})();
