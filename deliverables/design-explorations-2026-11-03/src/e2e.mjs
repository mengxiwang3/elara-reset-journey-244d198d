// Click-through tests with real taps. Run from the workspace folder: node src/e2e.mjs [a b c c2]
//  a, b, c: answer, loading, simulated reply, leave mid-session, reload, resume, finish, offline path.
//  c2:      happy path; «Cambiar» keeping the draft (same and changed option); «Ninguna por ahora»
//           (with and without writing); «Prefiero pasar» on step 1, step 2 and both; leave mid-draft
//           and resume; offline then continue; offline then retry; keyboard layout; focus kept while
//           a note arrives; reply-copy rules.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const which = process.argv.slice(2).length ? process.argv.slice(2) : ["a", "b", "c", "c2"];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 393, height: 852 } });
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
let fails = 0;
const ok = (cond, label) => { console.log((cond ? "ok   " : "FAIL ") + label); if (!cond) fails++; };
const tap = async (sel) => { await p.locator("#app " + sel).first().click(); await p.waitForTimeout(120); };
const txt = async () => (await p.locator("#app").innerText()).replace(/\s+/g, " ");
const expect = async (s, label) => ok((await txt()).includes(s), label + " ⇒ " + s);
const url = (k) => pathToFileURL(join(root, k + ".html")).href;

for (const k of which.filter((x) => x !== "c2")) {
  console.log("--", k);
  await p.goto(url(k)); await p.evaluate(() => localStorage.clear()); await p.reload();
  await tap('[data-act="start"]');
  if (k !== "b") await tap('[data-act="toAsk"]');
  await tap('[data-arg="Mejorar mi trabajo actual"]');
  await tap('[data-act="askNext"]');
  await expect("Elara está pensando", "loading shown");
  await p.waitForTimeout(1800);
  await expect("Respuesta simulada", "sim reply");
  if (k === "a") await tap('[data-act="toTake"]');
  await tap(k === "b" ? '[data-act="back"]' : '[data-act="leave"]');
  await p.locator('#sheet [data-act="leaveConfirm"]').click(); await p.waitForTimeout(150);
  await expect("Seguir con el día 1", "Hoy shows resume");
  await p.reload(); await p.waitForTimeout(200);
  await expect("Sigue donde lo dejaste", "resume survives reload");
  await tap('[data-act="start"]');
  await expect("Para llevarte", "resumed at take");
  await p.locator("#app textarea").fill("Preguntar a mi encargada si hay formación gratuita para subir de puesto.");
  await tap('[data-act="finish"]');
  await p.waitForTimeout(1800);
  await expect("formación gratuita es concreto", "take reply");
  if (k === "a") await tap('[data-act="toClose"]');
  await expect("¿Qué sabes hacer", "tomorrow shown");
  await tap('[data-act="toHoy"]');
  await expect("Día 1 hecho", "Hoy done");
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.locator('[data-mode="error"]').click();
  await tap('[data-act="start"]'); if (k !== "b") await tap('[data-act="toAsk"]');
  await tap('[data-arg="Encontrar trabajo"]'); await tap('[data-act="askNext"]'); await p.waitForTimeout(1800);
  await expect("Ahora no hay conexión", "offline state");
  await tap('[data-act="skipWait"]');
  await expect("Eso ayuda. Puedes cambiarlo cuando quieras.", "authored fallback for other option");
  await p.locator('[data-mode="ok"]').click();
}

if (which.includes("c2")) {
  console.log("-- c2");
  const SAMPLE = "Preguntar a mi encargada si hay formación gratuita para subir de puesto.";
  const MEJ = "Mejorar mi trabajo actual", NONE = "Ninguna por ahora";
  const fresh = async () => { await p.goto(url("c2")); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(150); };
  await fresh();
  const T = await p.evaluate(() => ({ notes: C2.askNotes, tailored: C2.takeTailored, tpl: C2.takeTemplate("§"), free: C2.takeBodyFree, body: C2.takeBody,
    skipped: C2.slotSkipped, empty: C2.slotEmpty, changed: C2.changedNotice, kept: C2.draftKept, retry: C2.retry, cont: C2.continueWithout,
    sum0: C2.summary(0), sum1: C2.summary(1), sum2: C2.summary(2), saved: C2.tags.saved }));
  const has = async (sel) => (await p.locator("#app " + sel).count()) > 0;
  const count = async (sel) => p.locator("#app " + sel).count();
  const value = async () => p.locator("#app textarea").inputValue();
  const notes = async () => p.$$eval("#app .enote2 .txt p:first-child", (els) => els.map((e) => e.textContent));
  const simOk = async () => (await count(".enote2 .txt p:first-child")) === (await count(".enote2 .rtag.sim"));
  const instr = async () => (await p.locator("#app #take-i").textContent()).trim();
  const think = () => p.waitForTimeout(1800);
  const toStep1 = async () => { await tap('[data-act="start"]'); await tap('[data-act="toAsk"]'); };
  const choose = async (o) => { await tap(`[data-act="pick"][data-arg="${o}"]`); await tap('[data-act="askNext"]'); };
  const slotTexts = async () => p.$$eval("#app .tcard .slot", (els) => els.map((e) => e.innerText.replace(/\s+/g, " ")));

  // 1 · happy path
  await tap('[data-act="start"]');
  ok((await has(".why")) && (await txt()).includes("Por qué hoy"), "opening shows A's «Por qué hoy» card");
  ok((await p.locator("#app .why p").first().textContent()) === "Hoy eliges por dónde empezar a mirar tus ingresos y lo conviertes en algo concreto para averiguar.", "«Por qué hoy» uses the revised line (no promise about the next days)");
  ok(await has(".tcard.ghost"), "opening keeps the empty card preview");
  await tap('[data-act="toAsk"]');
  await choose(MEJ);
  ok(await has(".enote2.load"), "step 2: Elara's note loads (secondary, below the field)");
  ok((await instr()) === T.body, "step 2: new instruction (item 2)");
  await think();
  ok((await notes())[0] === T.notes[MEJ] && (await simOk()), "step 1 note for the chosen option, labelled «Respuesta simulada»");
  await p.locator("#app textarea").fill(SAMPLE);
  await tap('[data-act="finish"]'); await think();
  ok((await notes())[0] === T.tailored && (await simOk()), "closing note quotes her sample answer, labelled");
  ok((await txt()).includes(T.sum2), "fixed summary: «Respondiste 2 de 2 preguntas.»");
  await tap('[data-act="toHoy"]');
  const pos = await p.evaluate(() => ({ card: document.querySelector("#app .today-card").getBoundingClientRect(), post: document.querySelector("#app .post").getBoundingClientRect(), H: innerHeight }));
  ok(pos.card.top < pos.post.top && pos.card.bottom < pos.H - 60, "Hoy: her card sits under the greeting, above the hero, visible without scrolling");

  // 2 · «Cambiar», same option: draft kept, no notice, note not re-run
  await fresh(); await toStep1(); await choose(MEJ); await think();
  await p.locator("#app textarea").fill("Mi borrador de prueba");
  await tap('[data-act="change"]');
  ok((await txt()).includes(T.kept), "Cambiar: step 1 says the draft is kept");
  ok((await p.locator(`#app [data-arg="${MEJ}"]`).getAttribute("aria-checked")) === "true", "Cambiar: current option pre-selected");
  await tap('[data-act="askNext"]');
  ok((await value()) === "Mi borrador de prueba", "same option: draft preserved");
  ok(!(await has("#changed")) && !(await has(".enote2.load")) && (await notes())[0] === T.notes[MEJ], "same option: no notice, note not re-run");

  // 3 · «Cambiar», changed option: draft kept, notice, note re-runs
  await tap('[data-act="change"]'); await choose("Cobrar un pago pendiente");
  ok((await value()) === "Mi borrador de prueba", "changed option: draft preserved");
  ok(await has("#changed"), "changed option: «Cambiaste tu respuesta…» notice");
  ok(await has(".enote2.load"), "changed option: Elara's note re-runs (loading)");
  await think();
  ok((await notes())[0] === T.notes["Cobrar un pago pendiente"], "changed option: note for the new option");
  await p.locator("#app textarea").press("End"); await p.locator("#app textarea").pressSequentially(" más");
  ok(!(await has("#changed")), "notice goes once she edits the draft");
  // back arrow from step 2 also keeps the draft
  await tap('[data-act="back"]'); await tap('[data-act="back"]');
  ok((await value()) === "Mi borrador de prueba más", "back to step 1 and back again: draft preserved");

  // 4 · «Ninguna por ahora», finishing without writing
  await fresh(); await toStep1(); await choose(NONE); await think();
  ok((await notes())[0] === T.notes[NONE] && (await simOk()), "«Ninguna por ahora»: acknowledged without pushing, labelled");
  ok(T.notes[NONE] === "Elegiste «Ninguna por ahora». El siguiente paso es opcional: puedes escribir algo o terminar sin escribir.", "«Ninguna por ahora» note does not evaluate her answer");
  ok((await instr()) === T.free, "«Ninguna por ahora»: option-free instruction");
  ok((await has('[data-act="finishEmpty"]')) && !(await has('[data-act="takeSkip"]')), "«Ninguna por ahora»: «Terminar sin escribir» instead of a second skip");
  await tap('[data-act="finishEmpty"]');
  let slots = await slotTexts();
  ok(slots[0].includes(NONE) && slots[1].includes(T.empty), "card: «Ninguna por ahora» + «Sin nota hoy»");
  ok(!(await has(".enote2")), "no Elara reply for the empty step");
  ok((await txt()).includes(T.sum1), "fixed summary: 1 de 2");
  ok(!(await txt()).includes("Mañana partimos de lo que elegiste hoy"), "no bridge line that would assume a choice");
  await tap('[data-act="toHoy"]');
  ok((await p.locator("#app .today-card").innerText()).includes(T.empty), "Hoy card: «Sin nota hoy»");

  // 4b · «Ninguna por ahora», then writing: template quotes her words verbatim
  await fresh(); await toStep1(); await choose(NONE); await think();
  await p.locator("#app textarea").fill("Ver si en mi barrio hay cursos gratis");
  await tap('[data-act="finish"]'); await think();
  ok((await notes())[0] === T.tpl.replace("§", "Ver si en mi barrio hay cursos gratis"), "other text: neutral template quoting her words");
  ok((await txt()).includes(T.sum2), "summary: 2 de 2");

  // 5 · «Prefiero pasar» on step 1
  await fresh(); await toStep1(); await tap('[data-act="askSkip"]');
  ok(!(await has(".enote2")), "step 1 skipped: no Elara note generated");
  ok((await p.locator("#app .choice-row").innerText()).includes(T.skipped), "step 1 skipped: «Pasaste esta pregunta»");
  ok((await instr()) === T.free && (await has('[data-act="takeSkip"]')), "step 1 skipped: option-free instruction with its own «Prefiero pasar»");
  await p.locator("#app textarea").fill("Averiguar qué ayudas hay en mi municipio.");
  await tap('[data-act="finish"]'); await think();
  ok((await notes())[0] === T.tpl.replace("§", "Averiguar qué ayudas hay en mi municipio"), "reply quotes her words (final full stop moved outside the quote)");
  slots = await slotTexts();
  ok(slots[0].includes(T.skipped), "card: step 1 shows it was skipped");
  ok((await txt()).includes(T.sum1), "summary: 1 de 2");

  // 6 · «Prefiero pasar» on step 2
  await fresh(); await toStep1(); await choose(MEJ); await think();
  await p.locator("#app textarea").fill("algo que luego decido no guardar");
  await tap('[data-act="takeSkip"]');
  slots = await slotTexts();
  ok(slots[0].includes(MEJ) && slots[1].includes(T.skipped), "step 2 skipped: day completes, slot says she skipped");
  ok(!(await has(".enote2")), "step 2 skipped: no Elara reply");
  ok(!(await txt()).includes("luego decido"), "step 2 skipped: the discarded draft is not kept");

  // 7 · both skipped
  await fresh(); await toStep1(); await tap('[data-act="askSkip"]'); await tap('[data-act="takeSkip"]');
  ok((await count(".tcard .skipped")) === 2, "both skipped: both slots say so");
  ok(!(await has(".rtag.sim")) && !(await has(".enote2")), "both skipped: no simulated reply anywhere");
  ok((await txt()).includes(T.sum0), "both skipped: the app's own line «Recorriste las preguntas de hoy…»");
  await tap('[data-act="toColl"]');
  ok(!(await has(".chip")) && (await count(".tcard .skipped")) === 2, "Tu colección: no «Frase», both slots skipped");
  await tap('[data-act="back"]'); await tap('[data-act="toHoy"]');
  ok((await has(".disc.done")) && (await txt()).includes("1 de 7"), "both skipped: keepsake and progress still count");
  ok((await count(".today-card .skipped")) === 2, "Hoy card: both skipped, nothing invented");

  // 8 · leave mid-draft, reload, resume
  await fresh(); await toStep1(); await choose(MEJ); await think();
  await p.locator("#app textarea").fill("Borrador a medias");
  await tap('[data-act="leave"]');
  ok((await p.locator("#sheet").innerText()).includes(T.saved), "leave sheet marks saving as simulated");
  await p.locator('#sheet [data-act="leaveConfirm"]').click(); await p.waitForTimeout(150);
  let t = await txt();
  ok(t.includes("Seguir con el día 1") && t.includes("Borrador a medias") && t.includes(T.saved), "Hoy: resume entry with the draft, tagged «Guardado simulado»");
  await p.reload(); await p.waitForTimeout(200);
  ok((await txt()).includes("Borrador a medias"), "draft survives a reload");
  await tap('[data-act="start"]');
  ok((await value()) === "Borrador a medias" && (await txt()).includes("Sigue donde lo dejaste"), "resume restores the draft on step 2");

  // 9 · offline, then continue
  await fresh(); await p.locator('[data-mode="error"]').click();
  await toStep1(); await choose(MEJ); await think();
  ok(await has(".enote2.err"), "offline state shown");
  ok((await count('[data-act="retry"]')) === 1 && (await count('[data-act="skipWait"]')) === 1, "offline: exactly one retry and one continue");
  ok((await p.locator('#app [data-act="retry"]').innerText()).trim() === T.retry && (await p.locator('#app [data-act="skipWait"]').innerText()).trim() === T.cont, "offline: «Reintentar» / «Seguir sin la nota de Elara»");
  ok((await p.locator("#app .enote2.err").innerText()).includes("simulad"), "offline: tagged as simulated");
  await tap('[data-act="skipWait"]');
  ok(!(await has(".enote2")), "continue: no note, nothing invented");
  await p.locator("#app textarea").fill(SAMPLE); await tap('[data-act="finish"]'); await think();
  ok(await has(".enote2.err"), "closing note offline too");
  await tap('[data-act="skipWait"]');
  ok(!(await has(".enote2")) && (await txt()).includes(T.sum2), "day completes without the note");

  // 10 · offline, then retry
  await fresh(); await p.locator('[data-mode="error"]').click();
  await toStep1(); await choose(MEJ); await think();
  await tap('[data-act="retry"]');
  ok(await has(".enote2.load"), "retry: loading again");
  await think();
  ok((await notes())[0] === T.notes[MEJ], "retry: the note arrives");
  await p.locator('[data-mode="ok"]').click();

  // 11 · typing is not interrupted when the note lands
  await fresh(); await toStep1(); await choose(MEJ);
  await p.locator("#app textarea").click();
  await p.locator("#app textarea").pressSequentially("Quiero saber si hay cursos gratis", { delay: 70 });
  const typing = await p.evaluate(() => ({ v: document.querySelector("#app textarea").value, f: document.activeElement === document.querySelector("#app textarea"), n: !!document.querySelector("#app .enote2 .txt") }));
  ok(typing.n && typing.f && typing.v === "Quiero saber si hay cursos gratis", "note arrived mid-typing: focus and every keystroke kept");

  // 12 · keyboard layout at 393 (100 %) and at 360 (160 %)
  const kbCheck = async (label) => {
    const k = await p.evaluate(() => {
      const q = (s) => document.querySelector(s), r = (s) => q(s).getBoundingClientRect();
      const kb = r("#app .kbd"), f = r("#app textarea.write"), btn = r("#finish"), sc = r("#app .scroll"), n = q("#app .enote2 .txt");
      return { open: !!q("#app .scr.kb"), kbTop: kb.top, f, btn, sc, noteHidden: !n || getComputedStyle(n).display === "none" };
    });
    ok(k.open && k.f.top >= k.sc.top - 1 && k.f.bottom <= k.sc.bottom + 1, `${label}: field fully visible above the keyboard`);
    ok(k.btn.bottom <= k.kbTop + 0.5 && k.btn.top >= 0, `${label}: primary button above the keyboard`);
    ok(k.noteHidden, `${label}: Elara's note folds`);
  };
  const KB = await p.evaluate(() => [...document.querySelectorAll("[data-preset]")].findIndex((x) => x.textContent === "Teclado abierto"));
  await p.evaluate((i) => window.proto.preset(i), KB); await p.waitForTimeout(300);
  await kbCheck("393 · 100 %");
  await p.setViewportSize({ width: 360, height: 780 });
  await p.evaluate((i) => { window.proto.text(1.6); window.proto.preset(i); }, KB); await p.waitForTimeout(300);
  await kbCheck("360 · 160 %");
  await p.evaluate(() => window.proto.text(1)); await p.setViewportSize({ width: 393, height: 852 });

  // 13 · reply copy rules (stepReply.ts): < 280 characters, no question, no em dash, no assumptions
  const rules = await p.evaluate(() => {
    const out = [...Object.values(C2.askNotes), C2.takeTailored];
    P.S = Object.assign(P.fresh(), { take: "palabra ".repeat(90), takeOutcome: "written", reply: { take: { status: "ok" } } });
    out.push(P.reply("take").text);
    return out.map((x) => ({ x: x.slice(0, 40), n: x.length, bad: /[—?]|no te compromete|esta semana/.test(x) }));
  });
  ok(rules.every((r) => r.n < 280 && !r.bad), `reply rules hold for all ${rules.length} variants (longest ${Math.max(...rules.map((r) => r.n))} characters)`);

  // 14 · nothing on any C v2 screen or state grades her answer, or promises day 9 builds on her choice
  const GRADE = /(^|[^a-záéíóúñü])(bien|válid[ao]s?|perfect[ao]s?|genial|excelente|estupend[ao]s?|fantástic[ao]s?|correct[ao]s?|buen[ao]?s?(?! días)|muy útil)(?=$|[^a-záéíóúñü])/i; // «Buenos días» is the greeting, not a grade
  const PROMISE = /parten de esa elección|partimos de lo que elegiste/;
  await fresh();
  const views = await p.evaluate(() => ({ s: document.querySelectorAll("[data-screen]").length, p: document.querySelectorAll("[data-preset]").length }));
  const hits = [];
  for (const [kind, n] of [["go", views.s], ["preset", views.p]]) for (let i = 0; i < n; i++) {
    await p.evaluate(([kind, i]) => window.proto[kind](i), [kind, i]); await p.waitForTimeout(kind === "preset" ? 1900 : 1900);
    const all = (await p.locator("#app").innerText()) + " " + ((await p.locator("#sheet").innerText().catch(() => "")) || "");
    const g = all.match(GRADE), pr = all.match(PROMISE);
    if (g) hits.push(`${kind} ${i}: «${g[2]}»`); if (pr) hits.push(`${kind} ${i}: «${pr[0]}»`);
  }
  const allNotes = await p.evaluate(() => [...Object.values(C2.askNotes), C2.takeTailored, C2.takeTemplate("x"), C2.summary(0), C2.summary(1), C2.summary(2), C2.purposeLine]);
  allNotes.forEach((x) => { if (GRADE.test(x) || PROMISE.test(x)) hits.push("copy: " + x.slice(0, 50)); });
  ok(hits.length === 0, `no grading words or day-9 promises on ${views.s} screens + ${views.p} states (after replies land) or in the reply copy` + (hits.length ? " ⇒ " + hits.join(" | ") : ""));
}

console.log(errs.length ? "JS errors: " + errs.join(" | ") : "no JS errors");
console.log(fails ? `${fails} check(s) FAILED` : "all checks passed");
await b.close();
