// C3 click-through and layout checks. Run from the workspace folder: node src/e2e-c3.mjs
// Real taps in Chromium on c3.html. Scope: browser behaviour and layout only (no device, no screen reader).
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 393, height: 852 } });
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
let fails = 0, passes = 0;
const ok = (c, label) => { console.log((c ? "ok   " : "FAIL ") + label); c ? passes++ : fails++; };
const url = pathToFileURL(join(root, "c3.html")).href;
const tap = async (sel) => { await p.locator("#app " + sel).first().click(); await p.waitForTimeout(120); };
const txt = async () => (await p.locator("#app").innerText()).replace(/\s+/g, " ");
const has = async (sel) => (await p.locator("#app " + sel).count()) > 0;
const value = async () => p.locator("#app textarea").inputValue();
const think = () => p.waitForTimeout(1800);
const fresh = async (w = 393, h = 852) => { await p.setViewportSize({ width: w, height: h }); await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(150); await p.evaluate(() => window.proto.text(1)); };
const go = async (name) => { await p.evaluate((n) => { const s = [...document.querySelectorAll("[data-screen]")].findIndex((x) => x.textContent === n); if (s >= 0) return window.proto.go(s); const q = [...document.querySelectorAll("[data-preset]")].findIndex((x) => x.textContent === n); if (q < 0) throw new Error("no state " + n); window.proto.preset(q); }, name); await p.waitForTimeout(250); };
const T = await (async () => { await fresh(); return p.evaluate(() => ({ q2: C3.q2, q2Free: C3.q2Free, notes: C2.askNotes, tailored: C2.takeTailored, tpl: C2.takeTemplate("§"), purpose: C3.purpose, optional: C3.optional, calm: C3.calm, changed: C2.changedNotice, editing: C2.editingBanner, updated: C2.updated, LONG: window.proto.P ? null : null })); })();
const LONG = await p.evaluate(() => { const i = [...document.querySelectorAll("[data-preset]")].findIndex((x) => x.textContent === "Hoy: respuesta larga"); window.proto.preset(i); return P.S.take; });
const rect = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { t: r.top, b: r.bottom, l: r.left, r: r.right, h: r.height }; }, sel);
const phoneRect = () => p.evaluate(() => { const r = document.querySelector(".phone").getBoundingClientRect(); return { t: r.top, b: r.bottom, l: r.left, r: r.right }; });
const SAMPLE = "Preguntar a mi encargada si hay formación gratuita para subir de puesto.";
const MEJ = "Mejorar mi trabajo actual", NONE = "Ninguna por ahora";
const toStep1 = async () => { if (await has('[data-act="start"]')) await tap('[data-act="start"]'); await tap('[data-act="toAsk"]'); };
const choose = async (o) => { await tap(`[data-act="pick"][data-arg="${o}"]`); await tap('[data-act="askNext"]'); };

// ---- opening ----
for (const [w, h] of [[393, 852], [360, 780]]) {
  await fresh(w, h); await go("Apertura");
  const t = await txt(); const cta = await rect('#app .foot .btn'); const ph = await phoneRect();
  ok(cta && cta.b <= ph.b + 0.5 && cta.t >= ph.t, `opening ${w}×${h}: the primary button is visible without scrolling`);
  ok(t.includes(T.purpose), "opening: the purpose line, verbatim");
  ok(t.includes(T.optional), "opening: «Puedes saltar cualquier pregunta.» as real text");
  ok(!t.includes("criterio de oportunidad") && !t.includes("Por qué hoy"), "opening: no week-payoff paragraph, no repeated explanation");
  const sc = await p.evaluate(() => { const s = document.querySelector("#app .scroll"); return s.scrollHeight - s.clientHeight; });
  ok(sc <= 1, `opening ${w}×${h}: all of it fits at 100 % text (no scrolling needed)`);
}
await fresh(360, 780); await go("Apertura"); await p.evaluate(() => window.proto.text(1.6));
{ const cta = await rect('#app .foot .btn'), ph = await phoneRect(); ok(cta.b <= ph.b + 0.5 && cta.t >= ph.t, "opening at 160 %: the button stays reachable (fixed foot)"); }

// ---- Q2 per option ----
await fresh();
for (const o of [MEJ, "Encontrar trabajo", "Cobrar un pago pendiente", "Explorar un servicio o venta", "Conocer apoyos disponibles", NONE]) {
  await go("Pregunta 1"); await choose(o); await think();
  const t = await txt();
  ok(t.includes(T.q2[o].q) && t.includes("Ejemplo: " + T.q2[o].ex), `Q2 for «${o}»: its own question and one example`);
  ok(!/siguiente paso/i.test(t), `Q2 for «${o}»: no reference to a next step on the writing screen`);
  if (o === NONE) ok((await has('[data-act="finishEmpty"]')) && !(await has('[data-act="takeSkip"]')), "«Ninguna»: «Terminar sin escribir», no «Prefiero pasar»");
}
await go("Pregunta 1"); await tap('[data-act="askSkip"]');
{ const t = await txt(); ok(t.includes(T.q2Free.q) && t.includes("Ejemplo: " + T.q2Free.ex) && (await has('[data-act="takeSkip"]')), "«Prefiero pasar» on Q1: the option-free Q2 with its own «Prefiero pasar»"); }
{ const bad = await p.evaluate(() => [...Object.values(C2.askNotes), C2.takeTailored, C2.takeTemplate("x".repeat(300))].map((x) => ({ n: x.length, bad: /[—?]|siguiente paso|esta semana|no te compromete/i.test(x) })));
  ok(bad.every((x) => x.n < 220 && !x.bad), `Elara's notes: all ${bad.length} variants under 220 characters, no question, no em dash, no next step (longest ${Math.max(...bad.map((x) => x.n))})`); }

// ---- writing: compact row, draft kept, labels ----
await fresh(); await toStep1(); await choose(MEJ); await think();
{ const r = await p.evaluate(() => { const q = (s) => document.querySelector(s).getBoundingClientRect(); return { row: q("#app .choice-row"), qn: q("#app .q3"), f: q("#app textarea.write") }; });
  ok(r.row.top < r.qn.top && r.qn.top < r.f.top && r.f.top - r.qn.bottom < 80, "writing: option row, then the question, then the field immediately below"); }
ok(!(await has(".stp3")) && !(await has(".torn")) && !(await has(".pc3")), "writing: no postcard, no stamp, nothing decorative");
await expectNote();
async function expectNote() { ok((await txt()).includes(T.notes[MEJ]) && (await p.locator("#app .rtag.sim").count()) >= 1, "step 1 note for the option, labelled «Respuesta simulada»"); }
await p.locator("#app textarea").fill("Mi borrador");
await tap('[data-act="change"]'); await choose("Cobrar un pago pendiente");
ok((await value()) === "Mi borrador" && (await txt()).includes(T.changed), "changing the choice keeps the draft and shows the non-destructive note");
const running = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && !(a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest(".dots"))).length);
ok(running === 0, "writing: nothing animates");

// ---- completion: the postcard ----
await fresh(); await toStep1(); await choose(MEJ); await think();
await p.locator("#app textarea").fill(SAMPLE); await p.locator('#app [data-act="finish"]').click(); await p.waitForTimeout(40);
ok(await p.locator('#app .foot [data-act="toHoy"]').isEnabled(), "completion: «Volver a Hoy» usable at once");
await think();
{ const t = await txt();
  ok(t.includes("Listo por hoy") && t.includes(SAMPLE), "completion: «Listo por hoy» and her exact words");
  ok(t.includes(T.tailored), "completion: Elara's tailored note, labelled");
  const g = await p.evaluate(() => { const w = document.querySelector("#app .pc3 .words3").getBoundingClientRect(), n = document.querySelector("#app .pc3 .enote2").getBoundingClientRect(), fs = parseFloat(getComputedStyle(document.querySelector("#app .pc3 .words3")).fontSize);
    return { below: n.top >= w.bottom - 1, fs, pm: document.querySelector("#app .pm3").getAttribute("aria-hidden"), op: +getComputedStyle(document.querySelector("#app .pm3")).opacity, stamp: !!document.querySelector("#app .pc3 .stp3 .cap"), lantern: !!document.querySelector("#app .pc3 .lnt3") }; });
  ok(g.below && g.fs >= 24, "completion: her words are the focal point (large), Elara's note sits below them");
  ok(g.pm === "true" && g.op <= 0.4, "completion: the postmark is decorative (aria-hidden) and low contrast");
  ok(g.stamp && g.lantern, "completion: destination stamp and lantern keepsake present"); }
await tap('[data-act="toHoy"]');

// ---- Hoy: structure ----
{ const t = await txt();
  ok(t.includes("Para retomar") && t.includes("Tu reflexión · Día 1") && t.includes("Volver a esta reflexión ›") && t.includes("Editar"), "Hoy: «Para retomar» with «Tu reflexión · Día 1», the link and «Editar»");
  ok(t.includes("Sobre: Mejorar mi trabajo actual · ¿Qué te gustaría averiguar…?"), "Hoy: the context line above her words");
  ok((await p.locator("#app .rcard").count()) === 1 && !(await has(".hoycard3")) && !(await has(".album")), "Hoy: one card only, no album, no second takeaway card");
  ok(t.includes("Opcional") && t.includes("Navegación existente (provisional)") && t.includes("Valores ilustrativos"), "Hoy: «Opcional», the navigation tag and the illustrative tag are visible");
  ok((await p.locator("#app .tabs button").count()) === 5, "Hoy: the five-tab bar is untouched");
  const lab = await p.$$eval("#app .days [role=img]", (els) => els.map((e) => e.getAttribute("aria-label")));
  ok(lab.length === 7 && lab[0] === "Día 1, hecho" && lab[1] === "Día 2, pendiente" && t.includes("1 de 7"), "tracker: seven days, «Día 1, hecho», «Día 2, pendiente», the count line");
  await go("Hoy antes");
  const lab2 = await p.$$eval("#app .days [role=img]", (els) => els.map((e) => e.getAttribute("aria-label")));
  ok(lab2[0] === "Hoy, día 1" && (await txt()).includes("0 de 7"), "tracker before: «Hoy, día 1», «0 de 7»"); }
ok(!/Mañana partimos|parten de esa elección|se adapta|personaliza/i.test(await txt()), "no claim that later days build on this choice");

// ---- Hoy: Para retomar variants ----
await fresh();
await go("Hoy: respuesta normal"); ok((await txt()).includes("Tu reflexión · Día 1"), "Para retomar, normal answer: «Tu reflexión · Día 1»");
await go("Hoy: «Hi»"); { const t = await txt(); ok(t.includes("Tu respuesta · Día 1") && !t.includes("Tu reflexión") && t.includes("«Hi»") && t.includes("Volver a esta respuesta ›"), "Para retomar, «Hi»: neutral «Tu respuesta · Día 1», no reframing"); }
await go("Hoy: pasó las dos"); { const t = await txt(); ok(!t.includes("Para retomar") && !(await has(".rcard")) && t.includes("1 de 7"), "Para retomar, both skipped: no card at all; the day still counts"); }
await go("Hoy: solo «Ninguna»"); { const t = await txt(); ok(t.includes("Tu respuesta · Día 1") && (await p.locator("#app .rc-plain").innerText()) === NONE && !(await has(".rc-words")), "Para retomar, only «Ninguna»: her choice as the answer, no takeaway claim"); }

// ---- long answers ----
await go("Hoy: respuesta larga");
{ const c = await p.evaluate(() => { const e = document.querySelector("#app .rc-words"), lh = parseFloat(getComputedStyle(e).lineHeight); return { lines: Math.round(e.clientHeight / lh), clamp: getComputedStyle(e).webkitLineClamp, over: e.scrollHeight > e.clientHeight }; });
  ok(c.clamp === "2" && c.lines <= 2 && c.over, `Para retomar: the 419-character answer is clamped to two lines (${c.lines})`); }
await go("Cierre: respuesta larga");
{ const c = await p.evaluate(() => { const w = document.querySelector("#app .pc3 .words3"), ph = document.querySelector(".phone").getBoundingClientRect(), r = w.getBoundingClientRect(); const sc = document.querySelector("#app .scroll"); return { fit: w.scrollWidth <= w.clientWidth + 1 && r.right <= ph.right, full: w.textContent.length >= 419, scr: sc.scrollHeight > sc.clientHeight }; });
  ok(c.fit && c.full, "completion: the 419-character answer is shown in full, inside the card"); }
await go("Escribiendo: respuesta larga");
ok((await value()).length === LONG.length, "editor: the long answer is intact in the field");

// ---- skips ----
await fresh(); await toStep1(); await choose(NONE); await think(); await tap('[data-act="finishEmpty"]');
{ const t = await txt(); ok(t.includes("Listo por hoy") && t.includes(NONE) && !(await has(".pc3")) && !t.includes("Para llevarte") && !/Pasaste/.test(t), "«Ninguna» without a note: her choice, the keepsake, no postcard, no takeaway claim");
  ok(t.includes("farol de papel"), "«Ninguna» without a note: the keepsake is given"); }
await fresh(); await toStep1(); await choose(MEJ); await think(); await tap('[data-act="takeSkip"]');
{ const t = await txt(); ok(t.includes(MEJ) && !(await has(".pc3")) && !/Pasaste/.test(t), "«Prefiero pasar» on Q2: her choice only, no card, nothing invented"); }
await fresh(); await toStep1(); await tap('[data-act="askSkip"]'); await tap('[data-act="takeSkip"]');
{ const t = await txt(); ok(t.includes("Listo por hoy") && t.includes(T.calm) && t.includes("farol de papel") && !(await has(".pc3")) && !(await has(".choice3")) && !/Pasaste/.test(t), "both skipped: «Listo por hoy», a calm line, the keepsake, no reflection card, no «Pasaste esta pregunta»");
  ok(t.includes("Propuesta de prototipo") , "both skipped: the progress behaviour is labelled as a prototype proposal"); }
await fresh(); await toStep1(); await tap('[data-act="askSkip"]');
await p.locator("#app textarea").fill("Qué gastos fijos tengo cada mes."); await tap('[data-act="finish"]'); await think();
ok((await has(".pc3")) && !(await has(".about")) && (await txt()).includes(T.tpl.replace("§", "Qué gastos fijos tengo cada mes")), "«Prefiero pasar» on Q1 then writing: postcard with her words, no «Sobre:» invented, template quoting her words");

// ---- edit ----
await fresh(); await go("Hoy: respuesta normal"); await tap('.rcard [data-act="edit"]');
{ ok((await value()) === SAMPLE && (await txt()).includes(T.editing), "«Editar» from Hoy: step 2 with her words and the editing banner");
  await p.locator("#app textarea").fill("Preguntar a mi encargada si hay formación gratuita y en qué horario."); await tap('[data-act="finish"]'); await think();
  ok((await txt()).includes(T.updated) && (await txt()).includes("en qué horario"), "saving: «Respuesta actualizada.» and the new words on the postcard");
  await tap('[data-act="toHoy"]'); ok((await txt()).includes("en qué horario") && !(await txt()).includes("para subir de puesto"), "Hoy shows the edited answer");
  await tap('.rcard [data-act="edit"]'); await p.locator("#app textarea").fill("no se guarda"); await tap('[data-act="cancelEdit"]');
  ok((await txt()).includes("en qué horario") && !(await txt()).includes("no se guarda"), "discarding an edit restores the answer"); }
await go("Cierre"); await tap('.foot [data-act="edit"]'); ok((await value()) === SAMPLE, "«Editar» from the completion screen: step 2 with her words");

// ---- Hoy: reachability, names, persistent button ----
const reach = async (label) => {
  await p.evaluate(() => { const s = document.querySelector("#app .scroll"); s.scrollTop = s.scrollHeight; }); await p.waitForTimeout(80);
  const g = await p.evaluate(() => { const q = (s) => document.querySelector(s).getBoundingClientRect(); const h = q("#app .helpb"), c = q("#app .cta3"), t = q("#app .tabs"), sc = q("#app .scroll"); return { h: h.bottom, c: c.top, ct: c.bottom, t: t.top, sc: sc.bottom, ht: h.top, sct: sc.top }; });
  ok(g.h <= g.c + 0.5 && g.ht >= g.sct && g.ct <= g.t + 0.5, `${label}: «Pedir ayuda ahora» scrolls fully above the start button and the tab bar`);
};
for (const [w, h, sc] of [[393, 852, 1], [360, 780, 1], [360, 780, 1.6]]) {
  await fresh(w, h); await p.evaluate((s) => window.proto.text(s), sc);
  for (const st of ["Hoy antes", "Hoy después", "Hoy: respuesta larga"]) { await go(st); await reach(`${w}×${h} ${sc * 100} % ${st}`); }
  await p.evaluate(() => { document.querySelector('[data-nm="long"]').click(); }); await go("Hoy después"); await reach(`${w}×${h} ${sc * 100} % long name`);
  const col = await p.evaluate(() => { const g = document.querySelector("#app .greet h1").getBoundingClientRect(), a = document.querySelector("#app .avatar").getBoundingClientRect(); return { sep: g.right <= a.left + 0.5, gl: g.left >= 0, txt: document.querySelector("#app .greet h1").textContent }; });
  ok(col.sep && col.gl && col.txt.includes("María de los Ángeles Fernández-Quintero"), `${w}×${h} ${sc * 100} %: a long preferred name wraps and never meets the avatar`);
  await p.evaluate(() => { document.querySelector('[data-nm="short"]').click(); });
}
await fresh(); await go("Hoy antes");
{ const g = await p.evaluate(() => { const c = document.querySelector("#app .cta3 .btn").getBoundingClientRect(), t = document.querySelector("#app .tabs").getBoundingClientRect(); return { above: c.bottom <= t.top + 0.5, label: document.querySelector("#app .cta3 .btn").textContent.trim() }; });
  ok(g.above && g.label.startsWith("Empezar el día 1"), "Hoy: the persistent dark-green button sits above the tab bar («Empezar el día 1»)"); }
await p.evaluate(() => document.querySelector('[data-nm="first"]').click()); await go("Hoy antes");
ok((await p.locator("#app .greet h1").innerText()).includes("Buenos días, María") && !(await p.locator("#app .greet h1").innerText()).includes("de los"), "greeting rule: no preferred name → the first word of the full name");
await p.evaluate(() => document.querySelector('[data-nm="short"]').click());

// ---- follow-up illustration ----
await go("Seguimiento con tarea (ilustrativo)");
{ const t = await txt(); ok(t.includes("Tu tarea:") && t.includes("¿Qué describe mejor cómo va tu tarea?") && t.includes("Ejemplo sintético") && t.includes("Opciones: las define el contenido de la app") && (await p.locator("#app .opt").count()) === 0, "follow-up with a task: context row, the question, a placeholder block, no invented options"); }
await go("Seguimiento sin tarea (ilustrativo)");
ok((await txt()).includes("Todavía no elegiste una tarea. Responde pensando en lo que tengas entre manos.") && !(await txt()).includes("Tu tarea:"), "follow-up without a task: the honest fallback line, labelled as proposed");

// ---- offline, keyboard, motion, saved tags ----
await fresh(); await p.locator('[data-mode="error"]').click(); await toStep1(); await choose(MEJ); await think();
ok((await p.locator('#app [data-act="retry"]').count()) === 1 && (await p.locator('#app [data-act="skipWait"]').count()) === 1, "offline: one «Reintentar», one «Seguir sin la nota de Elara»");
await tap('[data-act="retry"]'); await think(); ok((await txt()).includes(T.notes[MEJ]), "offline then retry: the note arrives"); await p.locator('[data-mode="ok"]').click();
await go("Teclado abierto (simulado)");
ok((await p.locator("#app .kbtag").innerText()) === "Teclado simulado", "keyboard preview is labelled «Teclado simulado»");
for (const [w, h, sc] of [[393, 852, 1], [360, 780, 1.6]]) {
  await p.setViewportSize({ width: w, height: h }); await p.evaluate((s) => window.proto.text(s), sc); await go("Teclado abierto (simulado)"); await p.evaluate(() => window.scrollTo(0, 0));
  const k = await p.evaluate(() => { const r = (s) => document.querySelector(s).getBoundingClientRect(); const kb = r("#app .kbd"), f = r("#app textarea.write"), bt = r("#finish"), c = r("#app .scroll"); return { f: f.top >= c.top - 1 && f.bottom <= c.bottom + 1, b: bt.bottom <= kb.top + .5 }; });
  ok(k.f && k.b, `keyboard ${w}/${sc * 100} %: field and primary button above it`);
  await p.evaluate(() => window.proto.text(1));
}
await fresh(); await p.click('[data-motion="rm"]'); await p.evaluate(() => { P.fx.finish = true; }); await go("Cierre"); await p.waitForTimeout(30);
{ const props = await p.evaluate(() => document.getAnimations().flatMap((a) => a.effect.getKeyframes().flatMap((f) => Object.keys(f))).filter((x) => !["offset", "easing", "composite", "computedOffset", "opacity"].includes(x)));
  ok(props.length === 0, "reduced motion: only opacity animates at the finish"); }
await p.click('[data-motion="full"]');
await fresh(); await toStep1(); await choose(MEJ); await think(); await p.locator("#app textarea").fill("Mi borrador"); await tap('[data-act="leave"]');
ok((await p.locator("#sheet").innerText()).includes("Guardado simulado"), "leave sheet: saving is tagged as simulated");
await p.locator('#sheet [data-act="leaveConfirm"]').click(); await p.waitForTimeout(150);
ok((await txt()).includes("Guardado simulado") && (await txt()).includes("Seguir con el día 1") && (await txt()).includes("Mi borrador"), "Hoy resume: draft, «Seguir con el día 1», «Guardado simulado»");

// ---- sweep: grading words, forbidden strings, on every screen and state ----
const GRADE = /(^|[^a-záéíóúñü])(bien|válid[ao]s?|perfect[ao]s?|genial|excelente|estupend[ao]s?|fantástic[ao]s?|correct[ao]s?|buen[ao]?s?(?! días)|muy útil)(?=$|[^a-záéíóúñü])/i;
const BAD = /Pasaste esta pregunta|Sin nota hoy|Mañana partimos|parten de esa elección|En el siguiente paso|Tu álbum|canal|Tu colección/;
await fresh();
const n = await p.evaluate(() => ({ s: document.querySelectorAll("[data-screen]").length, q: document.querySelectorAll("[data-preset]").length }));
const hits = [];
for (const [kind, c] of [["go", n.s], ["preset", n.q]]) for (let i = 0; i < c; i++) {
  await p.evaluate(([kind, i]) => window.proto[kind](i), [kind, i]); await p.waitForTimeout(1750);
  const all = (await txt()) + " " + (await p.locator("#sheet").innerText().catch(() => ""));
  const g = all.match(GRADE), bd = all.match(BAD); if (g) hits.push(`${kind} ${i}: ${g[2]}`); if (bd) hits.push(`${kind} ${i}: ${bd[0]}`);
}
ok(hits.length === 0, `sweep of ${n.s} screens + ${n.q} states: no grading words, no «Pasaste esta pregunta», no album or promise strings` + (hits.length ? " ⇒ " + hits.join(" | ") : ""));

console.log(errs.length ? "JS errors: " + errs.join(" | ") : "no JS errors");
console.log(`${passes} passed, ${fails} failed`);
await b.close();
process.exit(fails ? 1 : 0);
