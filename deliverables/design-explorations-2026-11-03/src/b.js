/* ---------- Concept B · mentor conversation with structured inputs ---------- */
(() => {
  const S = () => P.S;
  const settled = (step) => { const r = P.reply(step); return r.status === "ok"; };
  const orb = (ghost) => `<span class="orb${ghost ? " ghost" : ""}" aria-hidden="true"></span>`;
  const elara = (inner, cls = "", ghost = false) => `<div class="msg">${orb(ghost)}<div class="bub ${cls}">${inner}</div></div>`;

  const replyMsg = (step) => {
    const r = P.reply(step);
    if (r.status === "loading" || r.status === "none")
      return elara(`<span class="typing" role="status">${C.ui.thinking}<span class="dots"><span></span><span></span><span></span></span></span>`);
    if (r.status === "error")
      return elara(`<span style="color:var(--muted)">${I.cloud}</span><b>${C.ui.offlineTitle}</b><p>${C.ui.offlineBody}</p>
        <div class="row2"><button class="p" data-act="retry" data-arg="${step}">${C.ui.retry}</button><button class="s" data-act="skipWait" data-arg="${step}">${C.ui.continueWithout}</button></div>`, "err");
    return elara(`<div class="hd"><b>${C.ui.noticed}</b>${P.label(r.kind)}</div>${esc(r.text)}`, "voice");
  };

  const phase = () => {
    const s = S();
    if (!s.askAnswered) return "ask";
    if (!s.askSkipped && !settled("ask")) return "waitAsk";
    if (!s.takeSubmitted) return "take";
    if (!s.takeSkipped && !settled("take")) return "waitTake";
    return "end";
  };

  const thread = () => {
    const s = S(), m = C.meta, ph = phase();
    const out = [];
    out.push(`<div class="mini-post"><div class="ph" role="img" aria-label="Canal de Wuzhen"></div><div><small>${m.place} · Semana ${m.week} · Día 1 · unos ${m.minutes} min</small><b>${m.title}</b></div></div>`);
    out.push(`<div class="divider"><span class="rtag">${C.status}</span></div>`);
    out.push(elara(C.purposeLine, "voice"));
    out.push(elara(C.weekPayoff, "", true));
    out.push(elara(C.introNote, "small", true));
    out.push(elara(`<div class="eyebrow">Paso 1 de 2</div><div class="t">${C.ask.title}</div>`, "q"));
    const resumeDivider = `<div class="divider ember" role="status">${C.ui.resumeEyebrow}</div>`;
    if (s.resumed && ph === "ask") out.push(resumeDivider);
    if (s.askAnswered) {
      out.push(`<div class="mine"><div class="bub${s.askSkipped ? " skip" : ""}">${esc(s.askSkipped ? C.ask.skip : s.choice)}</div>
        ${!s.takeSubmitted ? `<button data-act="change" aria-label="Cambiar tu elección">${I.edit}Cambiar</button>` : ""}</div>`);
      if (!s.askSkipped) out.push(replyMsg("ask"));
      if (ph !== "ask" && ph !== "waitAsk") {
        if (s.resumed && ph === "take") out.push(resumeDivider);
        out.push(elara(`<div class="eyebrow">Paso 2 de 2</div><div class="t">${C.take.title}</div><div class="d">${C.take.body}</div>`, "q"));
      }
    }
    if (s.takeSubmitted) {
      out.push(`<div class="mine"><div class="bub${s.takeSkipped ? " skip" : ""}">${esc(s.takeSkipped ? C.take.skip : s.take)}</div></div>`);
      if (!s.takeSkipped) out.push(replyMsg("take"));
    }
    if (ph === "end") {
      out.push(`<div class="divider">Día 1 completado · 1 de 7 en ${m.place}</div>`);
      out.push(elara(`<div class="keepcard"><div class="k" role="img" aria-label="${m.keepsake}"></div><div>
        <div class="eyebrow">${C.take.title}</div><q>${s.takeSkipped ? "Hoy lo dejaste aquí. También cuenta." : "«" + esc(s.take) + "»"}</q>
        <small>${s.choice ? "Elegiste: " + esc(s.choice) + " · " : ""}Guardado en tu Atlas</small></div></div>`, "small"));
      out.push(elara(`<div class="tomcard"><div class="ph" role="img" aria-label="Wuzhen, día 2"></div><div class="in">
        <div class="eyebrow">Mañana · Día 2 · unos ${C.tomorrow.minutes} min</div><p>${C.tomorrow.title}</p></div></div>
        <div style="margin-top:6px">${C.tomorrow.bridge} ${C.weekPayoff}</div>`, "small", true));
    }
    return out.join("");
  };

  const dock = () => {
    const s = S(), ph = phase();
    if (ph === "ask") {
      const opts = C.ask.options.map((o) => `<button class="opt" role="radio" aria-checked="${s.choice === o}" data-act="pick" data-arg="${esc(o)}">${esc(o)}<span class="rad"></span></button>`).join("");
      return `<div class="dock"><div class="lbl"><span>${C.ask.body}</span><span>Paso 1 de 2</span></div>
        <div class="opts" role="radiogroup" aria-label="${C.ask.title}">${opts}</div>
        <div class="acts"><button class="btn ghost" data-act="askSkip">${C.ask.skip}</button>
          <button class="btn" data-act="askNext" ${s.choice ? "" : "disabled"}>Enviar ${I.arrow}</button></div></div>`;
    }
    if (ph === "take")
      return `<div class="dock"><div class="lbl"><span>${C.take.title}</span><span>Paso 2 de 2</span></div>
        <textarea class="write" placeholder="${C.take.placeholder}" aria-label="${C.take.title}">${esc(s.take)}</textarea>
        <button class="sample-btn" data-act="useSample">Usar respuesta de ejemplo (sintética)</button>
        <div class="acts"><button class="btn ghost" data-act="takeSkip">${C.take.skip}</button>
          <button class="btn" id="finish" data-act="finish" ${s.take.trim() ? "" : "disabled"}>${C.ui.finish} ${I.check}</button></div></div>`;
    if (ph === "end") return `<div class="dock end"><button class="btn" data-act="toHoy">${C.ui.backToday}</button></div>`;
    return ""; // waiting on Elara: nothing to answer yet
  };

  const screens = {
    hoy() {
      const s = S();
      if (s.done) return P.hoy({ state: "done", extra: `
        <div class="hoy-sec"><h3>Para retomar</h3><div class="hoy-retake" style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:14px 16px">
          <b style="display:block;color:var(--forest);font-size:14px;margin-bottom:4px">Hoy dijiste · Día 1</b>
          <span class="serif" style="font-size:17px;line-height:1.35">«${esc(s.takeSkipped ? s.choice || "Lo dejaste para otro día" : s.take)}»</span></div></div>
        <div class="hoy-sec"><h3>Mañana</h3><div class="tom"><div class="k" style="background-image:url(assets/keepsake-d2.webp)"></div><div><b>Día 2 · unos ${C.tomorrow.minutes} minutos</b><span>${C.tomorrow.title}</span></div></div></div>` });
      return P.hoy({ state: s.inProgress ? "resume" : "fresh", resumeLabel: s.askAnswered ? "Paso 2 de 2" : "Paso 1 de 2" });
    },
    chat() {
      const s = S(), ph = phase();
      const st = ph === "end" ? 2 : ph === "take" || ph === "waitTake" ? 1 : 0;
      const segs = [0, 1].map((i) => `<i class="${i < st ? "done" : i === st ? "now" : ""}"></i>`).join("");
      const sub = ph === "end" ? "Día 1 hecho" : `${C.meta.place} · Día 1 · Paso ${st + 1} de 2`;
      return `<div class="scr chat">${P.sbar()}
        <div class="chat-hd"><button class="icon-btn" data-act="back" aria-label="Volver a Hoy">${I.back}</button>
          <div class="who"><span class="orb" aria-hidden="true"></span><div><b>Elara</b><small>${sub}</small></div></div>
          <div class="steps" role="progressbar" aria-valuemin="0" aria-valuemax="2" aria-valuenow="${st}" aria-label="${sub}">${segs}</div></div>
        <div class="scroll" aria-live="polite"><div class="thread">${thread()}</div></div>
        ${dock()}</div>`;
    },
  };

  const ACT = {
    start: () => P.set({ screen: "chat" }),
    review: () => P.set({ screen: "chat" }),
    pick: (o) => P.set({ choice: o }),
    askNext: () => { P.requestReply("ask"); P.set({ askAnswered: true, askSkipped: false, resumed: false, inProgress: true }); },
    askSkip: () => P.set({ askAnswered: true, askSkipped: true, choice: null, resumed: false, inProgress: true }),
    change: () => { delete S().reply.ask; P.set({ askAnswered: false, askSkipped: false, resumed: false }); },
    input: (e) => { if (e.target.matches("textarea.write")) { S().take = e.target.value; P.save(); const f = $("#finish"); if (f) f.disabled = !e.target.value.trim(); } },
    finish: () => { P.requestReply("take"); P.set({ takeSubmitted: true, takeSkipped: false, resumed: false }); },
    takeSkip: () => P.set({ takeSubmitted: true, takeSkipped: true, take: "", resumed: false }),
    toHoy: () => P.set({ screen: "hoy", inProgress: false }),
    back: () => { const s = S(); if (s.askAnswered && !s.done) P.leaveSheet(); else P.set({ screen: "hoy" }); },
    leaveConfirm: () => { P.sheet(); P.set({ screen: "hoy", inProgress: true, resumed: true }); P.toast(C.ui.saving + " · guardado"); },
  };

  P.afterPaint = () => {
    const s = S();
    if (s.screen === "chat" && phase() === "end" && !s.done) { s.done = true; s.inProgress = false; P.save(); }
    const sc = $("#app .scroll");
    if (s.screen === "chat" && sc) { sc.scrollTop = sc.scrollHeight; setTimeout(() => { sc.scrollTop = sc.scrollHeight; }, 120); }
  };

  const base = (extra) => Object.assign(P.fresh(), { screen: "chat", choice: C.sample.choice, askAnswered: true, reply: { ask: { status: "ok" } } }, extra);
  const end = (extra) => base(Object.assign({ take: C.sample.take, takeSubmitted: true, done: true, reply: { ask: { status: "ok" }, take: { status: "ok" } } }, extra));
  P.boot("b", () => screens[P.S.screen](), ACT, {
    presets: [
      ["Desde el principio", () => { P.S = P.fresh(); }],
      ["Cargando", () => { P.mode = "loading"; P.syncModeButtons(); P.S = base({ reply: { ask: { status: "loading" } } }); }],
      ["Sin conexión", () => { P.S = base({ reply: { ask: { status: "error" } } }); }],
      ["Reanudar (salió a mitad)", () => { P.S = base({ screen: "hoy", inProgress: true, resumed: true }); }],
      ["Terminada", () => { P.S = end({ screen: "hoy" }); }],
    ],
    screens: [
      ["Hoy", () => { P.S = P.fresh(); }],
      ["Inicio", () => { P.S = Object.assign(P.fresh(), { screen: "chat" }); }],
      ["Elección marcada", () => { P.S = Object.assign(P.fresh(), { screen: "chat", choice: C.sample.choice }); }],
      ["Elara responde 1", () => { P.S = base(); }],
      ["Para llevarte escrito", () => { P.S = base({ take: C.sample.take }); }],
      ["Elara piensa 2", () => { P.S = base({ take: C.sample.take, takeSubmitted: true, reply: { ask: { status: "ok" }, take: { status: "loading" } } }); }],
      ["Cierre", () => { P.S = end(); }],
      ["Reanudada", () => { P.S = base({ resumed: true, inProgress: true }); }],
      ["Hoy después", () => { P.S = end({ screen: "hoy" }); }],
    ],
  });
})();
