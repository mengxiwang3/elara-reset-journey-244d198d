// End-to-end walk of the artifact version («Tu mes, fecha por fecha»), v2: real photos + «Tu turno».
// Usage (from the deliverable folder): node e2e/run-artifact.cjs
// Wraps artifact/el-mes-de-ana.html in the same document skeleton the Artifact host adds,
// clicks every path at 360×780, asserts visible text and the arithmetic, captures artifact/shots/
// and writes artifact/e2e-log.txt.
const { chromium } = require("playwright");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "artifact", "el-mes-de-ana.html");
const SHOTS = path.join(ROOT, "artifact", "shots");
const LOG = path.join(ROOT, "artifact", "e2e-log.txt");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "elara-artifact-"));
fs.cpSync(path.join(ROOT, "artifact", "photos"), path.join(TMP, "photos"), { recursive: true });
fs.writeFileSync(path.join(TMP, "index.html"),
  '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' +
  fs.readFileSync(SRC, "utf8") + "</body></html>");
const URL = "file://" + path.join(TMP, "index.html");
fs.rmSync(SHOTS, { recursive: true, force: true });
fs.mkdirSync(SHOTS, { recursive: true });

const log = [];
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { if (cond) { pass++; log.push(`PASS ${name}`); } else { fail++; log.push(`FAIL ${name} ${extra}`); } };
const shot = async (page, name) => {
  await page.evaluate(() => document.body.classList.add("capture"));
  await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true });
  await page.evaluate(() => document.body.classList.remove("capture"));
};
const view = (page, name) => page.screenshot({ path: path.join(SHOTS, name + ".png") });
const text = (page, sel) => page.locator(sel).first().innerText().catch(() => "");
const has = async (page, sel) => (await page.locator(sel).count()) > 0 && (await page.locator(sel).first().isVisible());
const bodyHas = async (page, s) => (await page.locator("main").innerText()).includes(s);
const tap = (page, sel) => page.locator(sel).first().click();
async function fillAmt(page, sel, v) { await page.fill(sel, v); await page.locator(sel).blur(); }
async function review(page, fn) {
  await tap(page, "#reviewBtn"); await fn(); await tap(page, "#rvClose");
}
const setErr = (page, on) => review(page, async () => { const c = page.locator("#simErr"); if ((await c.isChecked()) !== on) await c.click(); });
const setLang = (page, l) => review(page, () => tap(page, l === "en" ? "#langEn" : "#langEs"));
const restart = async (page) => { await review(page, () => tap(page, "#restart")); };

async function layout(page, where) {
  const r = await page.evaluate(() => {
    const over = document.documentElement.scrollWidth > window.innerWidth + 1;
    const small = [];
    for (const el of document.querySelectorAll("main button, main select, main input, main textarea, .bar button, .top button")) {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      if (el.type === "checkbox") { const l = el.closest("label").getBoundingClientRect(); if (l.height < 44) small.push("checkbox " + Math.round(l.height)); continue; }
      if (b.height < 44 || b.width < 44) small.push((el.id || el.className || el.tagName) + " " + Math.round(b.width) + "×" + Math.round(b.height));
    }
    return { over, small };
  });
  ok(`${where}: no horizontal scroll at 360px`, !r.over);
  ok(`${where}: every touch target is at least 44px`, r.small.length === 0, r.small.join(", "));
}

async function fillMonth(page, { payday, pending, inc, pays = [], bal }) {
  if (pending) await tap(page, "#incPending");
  else if (payday) await page.selectOption("#incDay", String(payday));
  if (inc) await fillAmt(page, "#incAmt", inc);
  for (let i = 0; i < pays.length; i++) {
    if (i > 0) await tap(page, "#addPay");
    const p = pays[i];
    if (p.name !== undefined) await tap(page, `[data-pay="${i}"][data-name="${p.name}"]`);
    if (p.other) await page.fill(`#payOther${i}`, p.other);
    if (p.day) await page.selectOption(`#payDay${i}`, String(p.day));
    if (p.amt) await fillAmt(page, `#payAmt${i}`, p.amt);
  }
  if (bal) await fillAmt(page, "#bal", bal);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text()) && errors.push(m.text()));
  await page.goto(URL);
  await page.waitForTimeout(500);

  // ── Opening ──
  const imgs = await page.evaluate(() => [...document.querySelectorAll("main img")].map((i) => ({ src: i.getAttribute("src"), w: i.naturalWidth })));
  ok("opening: Lan Hạ photo loads", imgs.length === 1 && imgs[0].w === 680, JSON.stringify(imgs));
  ok("opening: title", await bodyHas(page, "Un pago, una fecha, una respuesta más clara"));
  ok("opening: rule", await bodyHas(page, "Antes de contar un dinero futuro, confirma cuándo llega."));
  ok("opening: start with my month is the main button", (await text(page, ".bar .btn.fwd")) === "Empezar con mi mes");
  ok("opening: Ana's example is offered", (await text(page, ".bar .btn.second")) === "Ver primero el ejemplo de Ana");
  ok("opening: no audio controls", (await page.locator("audio, [data-audio]").count()) === 0 && !(await page.locator("body").innerText()).match(/Escuchar|Audio/i));
  ok("opening: no cartoon faces left (no eyes/legs in the SVG)", !(await page.content()).match(/class="(eye|eyes|leg|legs|face|mouth)["\s]/));
  await layout(page, "opening");
  await shot(page, "01-opening");
  await view(page, "01a-opening-phone-view");

  // ── Direct path: her month ──
  await tap(page, "#bar-startMine");
  ok("my month: «Tu turno» screen", await bodyHas(page, "Ahora, tu mes"));
  ok("my month: Ana's example still reachable", await has(page, "#toAna"));
  ok("my month: privacy line", await bodyHas(page, "no se comparte con nadie"));
  ok("my month: continue waits for her", (await page.getAttribute("#bar-cont", "aria-disabled")) === "true");
  await layout(page, "my month form");
  await shot(page, "02-my-month-form");
  await tap(page, "#seeMine");
  ok("validation: asks for a payday and one payment date", await bodyHas(page, "elige el día de tu cobro"));
  await shot(page, "03-validation");

  // gap: same numbers as Ana's lesson, in pesos
  await fillMonth(page, { payday: 15, inc: "200000", bal: "300000", pays: [{ name: 0, day: 5, amt: "180000" }, { name: 1, day: 12, amt: "170000" }] });
  ok("amounts: formatted as she types them (es-CO)", (await page.inputValue("#payAmt0")) === "180.000" && (await page.inputValue("#bal")) === "300.000");
  await tap(page, "#seeMine");
  await page.waitForTimeout(400);
  let res = await text(page, "#myResult");
  ok("gap: day 12 is $50.000 short for the electricity", res.includes("El día 12 te faltarían $50.000 para la luz o los servicios."), res);
  ok("gap: names when her money arrives", res.includes("Tu dinero llega el día 15: tarde para ese pago."), res);
  ok("gap: no false shortfall (300 + 200 − 350 ≥ 0)", !res.includes("Aunque cuentes"), res);
  ok("gap: running balance after rent shows $120.000", (await text(page, "#my-0")).includes("Te quedan $120.000"));
  ok("gap: the timeline marks the gap", (await text(page, "#my-1")).includes("Faltan $50.000"));
  ok("gap: payday sits after the payments", (await text(page, "#my-pay")).includes("Llega el día 15"));
  ok("gap: result is a warning", (await page.getAttribute("#myResult", "class")).includes("warn"));
  await layout(page, "my month result");
  await shot(page, "04-my-month-gap");
  await view(page, "04a-my-month-gap-phone-view");

  // edit keeps her details
  await tap(page, "#editMine");
  ok("edit: her details are still there", (await page.inputValue("#payAmt1")) === "170.000" && (await page.inputValue("#incDay")) === "15");
  await tap(page, "#seeMine");

  // EN review toggle keeps her inputs and recomputes in English
  await setLang(page, "en");
  res = await text(page, "#myResult");
  ok("EN: same result in English", res.includes("On day 12 you’d be $50,000 short for electricity or utilities."), res);
  await shot(page, "05-en-my-month");
  await setLang(page, "es");

  // takeaway with her dates
  await tap(page, "#bar-cont");
  await page.waitForFunction(() => [...document.querySelectorAll("main img")].every((i) => i.complete));
  const pc = await page.evaluate(() => { const i = document.querySelector("#postcard img"); return i ? i.naturalWidth : 0; });
  ok("takeaway: postcard photo loads", pc === 680);
  const mine = await text(page, "#mineLine");
  ok("takeaway: postcard carries her dates", mine.includes("Tu cobro: día 15") && mine.includes("arriendo o alquiler (5), luz o servicios (12)"), mine);
  ok("takeaway: no amounts on the postcard", !mine.includes("$"));
  ok("takeaway: says amounts are not saved", await bodyHas(page, "Las cantidades no se guardan."));
  ok("takeaway: save names what is saved", (await text(page, "#bar-saveRule")) === "Guardar mi regla y mis fechas");
  ok("takeaway: nothing claims «guardado» before the tap", !(await bodyHas(page, "Guardado")));
  await layout(page, "takeaway");
  await shot(page, "06-takeaway-mine");

  // save fails, then succeeds
  await setErr(page, true);
  await tap(page, "#bar-saveRule");
  ok("rule save: shows «Guardando…» while saving", (await text(page, "#bar-saveRule")) === "Guardando…");
  await page.waitForTimeout(800);
  ok("rule save error: honest message", await bodyHas(page, "No se pudo guardar."));
  ok("rule save error: offers retry", (await text(page, "#bar-saveRule")) === "Reintentar");
  ok("rule save error: no success claim", !(await bodyHas(page, "Guardado en Tu colección")));
  await shot(page, "07-rule-error");
  await setErr(page, false);
  await tap(page, "#bar-saveRule");
  await page.waitForTimeout(800);
  ok("rule save: confirmed only after it succeeds", await bodyHas(page, "Guardado en Tu colección."));
  await shot(page, "08-rule-saved");
  await tap(page, "#bar-finish");
  await page.waitForFunction(() => [...document.querySelectorAll("main img")].every((i) => i.complete));
  ok("end: saved message", await bodyHas(page, "Lo guardaste en Tu colección."));
  const endImgs = await page.evaluate(() => [...document.querySelectorAll("main img")].map((i) => i.naturalWidth));
  ok("end: bay photo band and postcard load", endImgs.length === 2 && endImgs.every((w) => w > 0), JSON.stringify(endImgs));
  await layout(page, "end");
  await shot(page, "09-end-saved");

  // ── Other outcomes of her month ──
  async function scenario(name, input, expect, opts = {}) {
    await restart(page);
    await tap(page, "#bar-startMine");
    if (opts.before) await opts.before();
    await fillMonth(page, input);
    await tap(page, "#seeMine");
    await page.waitForTimeout(300);
    const r = await text(page, "#myResult");
    for (const e of expect) ok(`${name}: «${e}»`, r.includes(e), r);
    if (opts.not) for (const e of opts.not) ok(`${name}: not «${e}»`, !r.includes(e), r);
    if (opts.tone) ok(`${name}: tone ${opts.tone}`, (await page.getAttribute("#myResult", "class")).includes(opts.tone));
    if (opts.shot) await shot(page, opts.shot);
  }
  await scenario("covered", { payday: 15, bal: "500000", pays: [{ name: 0, day: 5, amt: "180000" }] },
    ["Con estas cifras te alcanza hasta el día 15."], { tone: "good", shot: "10-my-month-covered" });
  await scenario("shortfall", { payday: 15, inc: "50000", bal: "100000", pays: [{ name: 0, day: 5, amt: "180000" }] },
    ["El día 5 te faltarían $80.000 para el arriendo o alquiler.", "Aunque cuentes tu cobro, faltarían $30.000. Eso ya no es solo un tema de fechas."], { tone: "warn", shot: "11-my-month-shortfall" });
  await scenario("order only (no amounts)", { payday: 15, pays: [{ name: 0, day: 5 }, { name: 3, other: "Colegio", day: 10 }] },
    ["Arriendo o alquiler (día 5) sale antes de tu cobro (día 15).", "Colegio (día 10) sale antes de tu cobro (día 15)."], { tone: "plain", shot: "12-my-month-order" });
  await scenario("amounts without today's balance", { payday: 15, pays: [{ name: 1, day: 12, amt: "170000" }] },
    ["Luz o servicios (día 12) sale antes de tu cobro (día 15).", "Si añades lo que tienes hoy"]);
  await scenario("pay to confirm", { pending: true, pays: [{ name: 2, day: 20 }] },
    ["Tu cobro está por confirmar. Hasta saber la fecha, no lo cuentes para estos pagos."], { shot: "13-my-month-pending" });
  ok("pay to confirm: timeline says «Por confirmar»", (await text(page, "#my-pay")).includes("Por confirmar"));
  await scenario("pay to confirm, covered", { pending: true, bal: "400000", pays: [{ name: 0, day: 5, amt: "180000" }] },
    ["Con lo que tienes hoy cubres estos pagos sin contar el cobro."], { tone: "good" });
  await scenario("payments after payday", { payday: 1, pays: [{ name: 0, day: 20 }] },
    ["Tus pagos salen después de tu cobro: ese dinero sí llega antes."], { tone: "good" });
  await scenario("same day", { payday: 15, pays: [{ name: 2, day: 15 }] },
    ["Tarjeta sale el mismo día que tu cobro"]);

  // remove a payment
  await restart(page);
  await tap(page, "#bar-startMine");
  await tap(page, "#addPay");
  ok("payments: a second payment can be added", await has(page, "#payDay1"));
  await tap(page, "[data-remove='1']");
  ok("payments: and removed", !(await has(page, "#payDay1")));

  // ── Branches, each by an explicit tap ──
  ok("branches: no reply before a tap", !(await has(page, "#reply")));
  await tap(page, "[data-helper='date']");
  ok("branch «no sé cuándo me pagan»: authored reply", await bodyHas(page, "“¿Qué día tendré el dinero en mi cuenta?”"));
  ok("branch «no sé cuándo me pagan»: marks the payday as to confirm", await page.isChecked("#incPending") && await page.isDisabled("#incDay"));
  await shot(page, "14-branch-date");
  await tap(page, "[data-helper='short']");
  ok("branch «no me alcanza»: authored reply", await bodyHas(page, "Mirar fechas no crea dinero."));
  ok("branch: changing branch replaces the reply", !(await bodyHas(page, "¿Qué día tendré el dinero")));
  await shot(page, "15-branch-short");
  await tap(page, "[data-helper='ana']");
  ok("branch «quedarme con Ana»: reply", await bodyHas(page, "Quédate con Ana."));
  ok("branch «quedarme con Ana»: her form is put away", !(await has(page, "#form")));
  ok("branch «quedarme con Ana»: Ana's month in brief (she hasn't seen it)", await has(page, "#anaMini"));
  ok("branch «quedarme con Ana»: can continue", (await page.getAttribute("#bar-cont", "aria-disabled")) === null);
  await layout(page, "branch ana");
  await shot(page, "16-branch-ana");
  await tap(page, "#bar-cont");
  ok("takeaway (Ana branch): no personal line", !(await has(page, "#mineLine")));
  ok("takeaway (Ana branch): plain save label", (await text(page, "#bar-saveRule")) === "Guardar mi regla");
  await tap(page, "#back");

  await tap(page, "[data-helper='other']");
  ok("branch «otra pregunta»: field is optional", await bodyHas(page, "Tu pregunta (opcional)"));
  await tap(page, "#saveQ");
  ok("question: empty save asks for text", await bodyHas(page, "Escribe algo antes de guardar."));
  await page.fill("#otherText", "¿Y si me pagan por quincenas?");
  await setErr(page, true);
  await tap(page, "#saveQ");
  await page.waitForTimeout(800);
  ok("question save error: honest message", await bodyHas(page, "No se pudo guardar."));
  ok("question save error: text is kept", (await page.inputValue("#otherText")) === "¿Y si me pagan por quincenas?");
  ok("question save error: retry", (await text(page, "#saveQ")) === "Reintentar");
  await shot(page, "17-question-error");
  await setErr(page, false);
  await tap(page, "#saveQ");
  await page.waitForTimeout(800);
  ok("question: saved as open only after success", await bodyHas(page, "Pregunta guardada como pendiente"));
  await shot(page, "18-question-saved");
  await tap(page, "#bar-cont");
  await tap(page, "#bar-finishNoSave");
  ok("finish without saving: honest end", await bodyHas(page, "No guardaste nada."));
  ok("finish without saving: question still noted", await bodyHas(page, "Tu pregunta quedó guardada como pendiente."));
  await shot(page, "19-end-not-saved");

  // ── Example path: Ana's month first ──
  await restart(page);
  await tap(page, "#bar-startExample");
  ok("example: Ana's month", await bodyHas(page, "Fecha por fecha"));
  ok("example: day 10 promised, not confirmed", (await text(page, "#row-d10")).includes("Sin confirmar"));
  await layout(page, "example start");
  await shot(page, "20-example-start");
  await tap(page, "#bar-reveal");
  ok("example: day 5 rent leaves US$120", (await text(page, "#row-d5")).includes("Le quedan US$120"));
  await tap(page, "#bar-reveal");
  await page.waitForTimeout(900);
  ok("example: the payment moves to day 14", await bodyHas(page, "paga el día 14, no el 10"));
  await tap(page, "[data-opt='b']");
  ok("wrong answer B: specific feedback", (await text(page, "#fb")).includes("Eso cuenta los US$200 antes de que lleguen."));
  await page.waitForTimeout(900);
  await shot(page, "21-example-wrong-b");
  await tap(page, "[data-opt='c']");
  ok("changed answer C: its own feedback", (await text(page, "#fb")).includes("US$120 es lo que queda antes de pagarla."));
  ok("changed answer: only one choice pressed", (await page.locator(".opt[aria-pressed='true']").count()) === 1);
  await tap(page, "[data-opt='a']");
  ok("right answer A: feedback", (await text(page, "#fb")).includes("faltan US$50 hasta que llegue el cobro"));
  ok("right answer A: gap on day 12", (await text(page, "#row-d12")).includes("Falta US$50"));
  await page.waitForTimeout(600);
  await shot(page, "22-example-right-a");
  await view(page, "22a-example-right-a-phone-view");
  await tap(page, "#showMe");
  await page.waitForTimeout(2200);
  ok("show me: three steps, separate from skipping", (await page.locator("#steps li:not(.later)").count()) === 3);
  await shot(page, "23-example-show-me");
  await tap(page, "#bar-cont");
  ok("example → my month: no «see Ana» link after seeing her", !(await has(page, "#toAna")));
  await tap(page, "#back");
  ok("back: the example keeps her answer", (await page.locator(".opt[aria-pressed='true']").getAttribute("data-opt")) === "a");

  // skip the example
  await restart(page);
  await tap(page, "#bar-startExample");
  await tap(page, "#bar-skip");
  ok("skip: lands on her month with a way back to the explanation", await bodyHas(page, "Pasaste el ejemplo."));
  await tap(page, "#explainBtn");
  ok("skip: explanation opens on tap", (await text(page, "#explainBox")).includes("faltan US$50"));
  await shot(page, "24-skip-explanation");
  await tap(page, "#bar-skip");
  ok("skip her month: takeaway still offered", await bodyHas(page, "Una regla para hoy"));
  await tap(page, "#bar-finishNoSave");
  ok("skip everything: honest end", await bodyHas(page, "No guardaste nada."));

  // «see Ana first» from her month, then back to her month
  await restart(page);
  await tap(page, "#bar-startMine");
  await page.selectOption("#incDay", "15");
  await tap(page, "#toAna");
  ok("see Ana from her month: example opens", await bodyHas(page, "Fecha por fecha"));
  await tap(page, "#bar-skip");
  ok("back to her month: her payday is kept", (await page.inputValue("#incDay")) === "15");

  // ── English review pass on the opening ──
  await restart(page);
  await setLang(page, "en");
  ok("EN: opening", await bodyHas(page, "One bill, one date, one clearer answer"));
  ok("EN: main button", (await text(page, ".bar .btn.fwd")) === "Start with my month");
  await shot(page, "25-en-opening");
  await setLang(page, "es");

  // ── Dark mode ──
  const dark = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, colorScheme: "dark" });
  const dp = await dark.newPage();
  await dp.goto(URL);
  await dp.waitForTimeout(500);
  await shot(dp, "26-dark-opening");
  await dp.locator("#bar-startMine").click();
  await fillMonth(dp, { payday: 15, inc: "200000", bal: "300000", pays: [{ name: 0, day: 5, amt: "180000" }, { name: 1, day: 12, amt: "170000" }] });
  await dp.locator("#seeMine").click();
  await dp.waitForTimeout(400);
  await shot(dp, "27-dark-my-month");
  await dp.locator("#bar-cont").click();
  await shot(dp, "28-dark-takeaway");
  await dark.close();

  ok("no page errors", errors.length === 0, errors.join(" | "));
  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
  log.unshift(`${pass} passed, ${fail} failed (360×780, ${new Date().toISOString().slice(0, 10)})`);
  fs.writeFileSync(LOG, log.join("\n") + "\n");
  console.log(log.filter((l) => !l.startsWith("PASS")).join("\n"));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
