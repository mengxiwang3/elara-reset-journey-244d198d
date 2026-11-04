// End-to-end walk of the Day 1 «Alternativa 3» prototype.
// Usage (from the deliverable folder): node e2e/run.cjs
// Clicks every path, asserts visible text, captures shots/ and writes e2e/e2e-log.txt.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const URL = process.env.E2E_URL || "file://" + path.join(ROOT, "prototype", "index.html");
const SHOTS = process.env.E2E_SHOTS || path.join(ROOT, "shots");
const LOG = process.env.E2E_LOG || path.join(ROOT, "e2e", "e2e-log.txt");
fs.mkdirSync(SHOTS, { recursive: true });
const log = [];
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; log.push(`PASS ${name}`); } else { fail++; log.push(`FAIL ${name} ${extra}`); }
};

async function visible(page, text) {
  const loc = page.getByText(text, { exact: false });
  const n = await loc.count();
  for (let i = 0; i < n; i++) if (await loc.nth(i).isVisible()) return true;
  return false;
}
const shot = async (page, name) => {
  // Full-page captures render sticky bars mid-page; un-stick them only while capturing.
  await page.evaluate(() => document.body.classList.add("capture"));
  await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true });
  await page.evaluate(() => document.body.classList.remove("capture"));
};
const view = (page, name) => page.screenshot({ path: path.join(SHOTS, name + ".png") });
async function inView(page, sel) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel); if (!el) return null;
    const r = el.getBoundingClientRect(); const bar = document.getElementById("bar").getBoundingClientRect();
    const head = document.getElementById("top").getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, barTop: bar.top, headBottom: head.bottom, h: innerHeight };
  }, sel);
}
const click = (page, text) => page.getByRole("button", { name: text, exact: true }).first().click();
const pressed = (page, sel) => page.locator(sel).getAttribute("aria-pressed");
const disabled = (page, id) => page.locator("#bar-" + id).getAttribute("aria-disabled");

async function toActivityDay12(page) {
  await click(page, "Ver el mes de Ana");
  await click(page, "Ver el día 5");
  await click(page, "Ver el día 12");
}
async function review(page, fn) {
  await page.locator("#reviewBtn").click();
  await fn();
  await page.locator("#rvClose").click();
}

(async () => {
  const browser = await chromium.launch();

  // ── Main path at 390×844, 2× for the shots people will look at ─────────
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.waitForTimeout(400);

  ok("opening: title", await visible(page, "Un pago, una fecha, una respuesta más clara"));
  ok("opening: Elara line", await visible(page, "Hoy empezamos por algo concreto"));
  ok("opening: rule", await visible(page, "Antes de contar un dinero futuro, confirma cuándo llega."));
  ok("opening: explanation does not give the answer", !(await visible(page, "US$50")) && !(await visible(page, "120")));
  ok("opening: no audio controls", (await page.locator("audio, video, [aria-label*='audio' i], [aria-label*='Escuchar' i]").count()) === 0 && !(await visible(page, "Escuchar")));
  await shot(page, "01-opening");

  await click(page, "Ver el mes de Ana");
  ok("activity: promised payment shown at day 10", await visible(page, "Prometido para el día 10"));
  ok("activity: marked unconfirmed", await visible(page, "Sin confirmar"));
  ok("activity: question not shown yet", !(await visible(page, "¿Qué pasa el día 12")));
  await shot(page, "02-activity-start");

  await click(page, "Ver el día 5");
  ok("day 5: rent and balance US$120", (await visible(page, "Alquiler")) && (await visible(page, "Le quedan US$120")));
  await shot(page, "03-day5");

  await click(page, "Ver el día 12");
  await page.waitForTimeout(800);
  ok("day 12: payment moved to day 14", (await visible(page, "Llega el día 14")) && (await visible(page, "Antes: prometido para el día 10")));
  ok("day 12: promise no longer at day 10", !(await visible(page, "Sin confirmar")));
  ok("day 12: question shown", await visible(page, "¿Qué pasa el día 12, después del alquiler y antes del cobro?"));
  ok("day 12: balance unknown before a choice", await visible(page, "Le quedan ¿?"));
  ok("day 12: Continue disabled before a choice", (await disabled(page, "cont")) === "true");
  await shot(page, "04-day12-question");

  // Wrong B
  await page.locator('[data-opt="b"]').click();
  await page.waitForTimeout(950);
  ok("pick B: own feedback", await visible(page, "Eso cuenta los US$200 antes de que lleguen. El día 12 todavía no están."));
  ok("pick B: verdict label", await visible(page, "Mira la línea"));
  ok("pick B: ghost US$200 on day 12", await visible(page, "no está: llega el 14"));
  ok("pick B: Continue enabled", (await disabled(page, "cont")) === null);
  { const f = await inView(page, "#fb"); ok("pick B (phone view): the whole feedback is on screen", f.top >= f.headBottom - 2 && f.bottom <= f.barTop + 2, JSON.stringify(f)); }
  await view(page, "05a-pick-b-phone-view");
  await shot(page, "05-pick-b-wrong");

  // Change to C
  await page.locator('[data-opt="c"]').click();
  ok("pick C: own feedback", await visible(page, "US$120 es lo que queda antes de pagarla. Para los US$170 de la luz faltan US$50."));
  ok("pick C: bill shown as not subtracted", await visible(page, "Sin restar todavía"));
  ok("pick C: B no longer pressed", (await pressed(page, '[data-opt="b"]')) === "false" && (await pressed(page, '[data-opt="c"]')) === "true");
  ok("pick C: B feedback gone", !(await visible(page, "El día 12 todavía no están.")));
  await page.waitForTimeout(900);
  { const f = await inView(page, "#fb"); ok("pick C (phone view): the whole feedback is on screen", f.top >= f.headBottom - 2 && f.bottom <= f.barTop + 2, JSON.stringify(f)); }
  await view(page, "06a-pick-c-phone-view");
  await shot(page, "06-pick-c-wrong");

  // Change to A (correct)
  await page.locator('[data-opt="a"]').click();
  ok("pick A: own feedback", await visible(page, "Sí. US$300 − US$180 = US$120. La luz cuesta US$170: faltan US$50 hasta que llegue el cobro."));
  ok("pick A: verdict label", await visible(page, "Así es"));
  ok("pick A: gap marker on day 12", await visible(page, "Falta US$50"));
  ok("pick A: payment late for the bill", await visible(page, "Llega el día 14: tarde para la luz"));
  ok("pick A: only A pressed", (await page.locator('.opt[aria-pressed="true"]').count()) === 1);
  await page.waitForTimeout(900);
  const d12 = await inView(page, "#row-d12"); const fb = await inView(page, "#fb");
  ok("pick A (phone view): the whole feedback is on screen", fb.top >= fb.headBottom - 2 && fb.bottom <= fb.barTop + 2, JSON.stringify(fb));
  ok("pick A (phone view): the day-14 card is on screen too", (await inView(page, "#row-d14")).bottom <= fb.top, "");
  await view(page, "07a-pick-a-phone-view");
  await shot(page, "07-pick-a-right");

  // Show me (separate from skip) after a pick
  await click(page, "No estoy segura, muéstrame");
  await page.waitForTimeout(2100);
  ok("show me: step-by-step text", (await visible(page, "Después del alquiler quedan US$120 (300 − 180).")) && (await visible(page, "El cobro del día 14 llega tarde para ese pago.")));
  ok("show me: calc on timeline", (await visible(page, "300 − 180 = 120")) && (await visible(page, "120 − 170 = −50")));
  ok("show me: did not move on", await visible(page, "¿Qué pasa el día 12"));
  const st = await inView(page, "#steps"); const d5 = await inView(page, "#row-d5");
  ok("show me (phone view): timeline and the steps on screen together", d5.top >= d5.headBottom - 2 && st.top < st.barTop, JSON.stringify({ d5, st }));
  await view(page, "08a-show-me-phone-view");
  await shot(page, "08-show-me");

  // EN toggle mid-flow keeps state
  await review(page, async () => { await page.locator("#langEn").click(); });
  ok("EN: same choice kept, English copy", (await pressed(page, '[data-opt="a"]')) === "true" && (await visible(page, "She’s US$50 short for electricity.")));
  ok("EN: feedback in English", await visible(page, "she’s US$50 short until the client pays"));
  ok("EN: rule label and timeline in English", (await visible(page, "Arrives on day 14")) && (await visible(page, "US$50 short")));
  await shot(page, "09-en-toggle-activity");
  await review(page, async () => { await page.locator("#langEs").click(); });
  ok("ES again: Spanish copy back", await visible(page, "Faltan US$50 para la luz."));

  // Continue → Hazlo útil
  await page.locator("#bar-cont").click();
  ok("useful: question", await visible(page, "¿Qué se parece más a tu situación hoy?"));
  ok("useful: no skip note when she did the activity", !(await visible(page, "Pasaste la actividad")));
  ok("useful: Continue disabled before a chip", (await disabled(page, "cont")) === "true");
  const chips = [
    ["date", "Entonces esa fecha está sin confirmar."],
    ["noopen", "Quédate con Ana. Sus US$200 llegan después del pago de la luz"],
    ["short", "Mirar fechas no crea dinero."],
    ["other", "Si quieres, escribe tu pregunta y guárdala como pendiente."],
  ];
  for (const [id, text] of chips) {
    await page.locator(`[data-chip="${id}"]`).click();
    ok(`branch ${id}: own reply`, await visible(page, text));
    ok(`branch ${id}: only it pressed`, (await page.locator('.chip[aria-pressed="true"]').count()) === 1 && (await pressed(page, `[data-chip="${id}"]`)) === "true");
    await shot(page, `10-branch-${id}`);
  }
  // switching back swaps the reply
  await page.locator('[data-chip="short"]').click();
  ok("branch switch: reply swapped", (await visible(page, "Mirar fechas no crea dinero.")) && !(await visible(page, "Si quieres, escribe tu pregunta")));
  await page.locator('[data-chip="other"]').click();

  // Other question: empty save, success
  await click(page, "Guardar mi pregunta");
  ok("other: empty is not saved", (await visible(page, "Escribe algo antes de guardar.")) && !(await visible(page, "Pregunta guardada")));
  await page.locator("#otherText").fill("¿Y si el cliente nunca paga?");
  await click(page, "Guardar mi pregunta");
  ok("other: saving state, not yet saved", (await visible(page, "Guardando…")) && !(await visible(page, "Pregunta guardada")));
  await page.waitForTimeout(800);
  ok("other: saved only after success", await visible(page, "Pregunta guardada como pendiente, sin darla por respondida."));
  await shot(page, "11-other-saved");

  // Other question: failure then retry
  await click(page, "Editar mi pregunta");
  await page.locator("#otherText").fill("¿Y si el cliente paga solo una parte?");
  await review(page, async () => { await page.locator("#simErr").check(); });
  await click(page, "Guardar mi pregunta");
  await page.waitForTimeout(800);
  ok("other error: honest message", await visible(page, "No se pudo guardar. Revisa tu conexión y vuelve a intentarlo."));
  ok("other error: never shows saved", !(await visible(page, "Pregunta guardada")));
  ok("other error: text kept", (await page.locator("#otherText").inputValue()) === "¿Y si el cliente paga solo una parte?");
  await shot(page, "12-other-error");
  await review(page, async () => { await page.locator("#simErr").uncheck(); });
  await click(page, "Reintentar");
  await page.waitForTimeout(800);
  ok("other retry: saved", await visible(page, "Pregunta guardada como pendiente"));

  // Back keeps the activity state
  await page.locator("#back").click();
  ok("back: activity choice kept", (await pressed(page, '[data-opt="a"]')) === "true");
  await page.locator("#bar-cont").click();
  ok("forward again: branch kept", (await pressed(page, '[data-chip="other"]')) === "true");

  // Takeaway: rule save failure then success
  await page.locator("#bar-cont").click();
  ok("takeaway: rule", await visible(page, "Antes de contar un dinero futuro, confirma cuándo llega."));
  ok("takeaway: try line", await visible(page, "Mira tu próximo cobro y fíjate qué pagos salen antes de esa fecha."));
  await review(page, async () => { await page.locator("#simErr").check(); });
  await click(page, "Guardar mi regla");
  ok("rule: saving state", await visible(page, "Guardando…"));
  await page.waitForTimeout(800);
  ok("rule error: honest message", await visible(page, "No se pudo guardar."));
  ok("rule error: never shows saved", !(await visible(page, "Guardada en Tu colección")));
  ok("rule error: can still finish without saving", await visible(page, "Terminar sin guardar"));
  await shot(page, "13-rule-error");
  await review(page, async () => { await page.locator("#simErr").uncheck(); });
  await click(page, "Reintentar");
  await page.waitForTimeout(800);
  ok("rule: saved only after success", await visible(page, "Guardada en Tu colección."));
  await shot(page, "14-rule-saved");
  await click(page, "Terminar");
  ok("end (saved): says the rule is saved", await visible(page, "Tu regla está en Tu colección."));
  ok("end (saved): mentions saved question", await visible(page, "Tu pregunta quedó guardada como pendiente."));
  await shot(page, "15-end-saved");

  // ── Skip path, then «Ver la explicación», finish without saving ───────
  await click(page, "Volver al inicio (revisión)");
  await click(page, "Ver el mes de Ana");
  await click(page, "Prefiero pasar");
  ok("skip: moves on without revealing", (await visible(page, "¿Qué se parece más a tu situación hoy?")) && !(await visible(page, "faltan US$50")));
  ok("skip: offers the explanation", (await visible(page, "Pasaste la actividad.")) && (await visible(page, "Ver la explicación")));
  await shot(page, "16-skip-offer");
  await click(page, "Ver la explicación");
  ok("skip: explanation on request", (await visible(page, "La luz cuesta US$170, así que el día 12 faltan US$50 (120 − 170).")) && (await visible(page, "+US$200, tarde para la luz")));
  await shot(page, "17-skip-explanation");
  await click(page, "Prefiero pasar");
  ok("takeaway reached after skipping branches", await visible(page, "Una regla para hoy"));
  await click(page, "Terminar sin guardar");
  await page.waitForTimeout(200);
  ok("end (not saved): says nothing was saved", await visible(page, "No guardaste nada."));
  ok("end (not saved): no saved-rule claim", !(await visible(page, "Tu regla está en Tu colección")));
  ok("end (not saved): no saved-question claim", !(await visible(page, "Tu pregunta quedó guardada")));
  await shot(page, "18-end-not-saved");

  // ── Show-me only path: Continue enabled without a pick ────────────────
  await click(page, "Volver al inicio (revisión)");
  await toActivityDay12(page);
  await click(page, "No estoy segura, muéstrame");
  ok("show-me only: Continue enabled", (await disabled(page, "cont")) === null);
  await page.waitForTimeout(2100);
  ok("show-me only: gap shown on timeline", await visible(page, "Falta US$50"));
  await page.locator("#bar-cont").click();
  ok("show-me only: not treated as a skip", !(await visible(page, "Pasaste la actividad")));

  // ── Wrong answer kept as final (no forced correction) ────────────────
  await click(page, "Volver al inicio (revisión)").catch(() => {});
  await page.goto(URL);
  await toActivityDay12(page);
  await page.locator('[data-opt="c"]').click();
  await page.locator("#bar-cont").click();
  ok("wrong answer can continue", await visible(page, "¿Qué se parece más a tu situación hoy?"));
  await page.locator("#back").click();
  ok("wrong answer still shown on return", (await pressed(page, '[data-opt="c"]')) === "true" && (await visible(page, "Sin restar todavía")));

  // EN screenshots of the end of the flow for the review toggle
  await review(page, async () => { await page.locator("#langEn").click(); });
  await page.locator('[data-opt="a"]').click();
  await page.locator("#bar-cont").click();
  await page.locator('[data-chip="date"]').click();
  ok("EN branch reply", await visible(page, "Then that date is unconfirmed."));
  await shot(page, "19-en-branch");
  await page.locator("#bar-cont").click();
  ok("EN takeaway", await visible(page, "Before counting future income, confirm when it arrives."));
  await shot(page, "20-en-takeaway");
  await ctx.close();

  // ── 360×780: no horizontal scroll, primary button visible on every screen
  const small = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 1 });
  const p2 = await small.newPage();
  await p2.goto(URL);
  const check = async (label) => {
    const { sw, cw } = await p2.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    ok(`360×780 ${label}: no horizontal scroll`, sw <= cw, `${sw}>${cw}`);
    const box = await p2.locator("#barInner button").first().boundingBox();
    ok(`360×780 ${label}: primary button in view`, !!box && box.y >= 0 && box.y + box.height <= 780 && box.height >= 44, JSON.stringify(box));
  };
  await check("opening");
  await p2.getByRole("button", { name: "Ver el mes de Ana" }).click(); await check("activity start");
  await p2.getByRole("button", { name: "Ver el día 5" }).click(); await check("day 5");
  await p2.getByRole("button", { name: "Ver el día 12" }).click(); await p2.waitForTimeout(800); await check("day 12 question");
  await p2.locator('[data-opt="a"]').click(); await check("after pick");
  await p2.screenshot({ path: path.join(SHOTS, "21-360-pick-a-viewport.png") });
  await p2.locator("#bar-cont").click(); await check("useful");
  await p2.locator('[data-chip="other"]').click(); await check("other question");
  await p2.locator("#bar-cont").click(); await check("takeaway");
  await p2.screenshot({ path: path.join(SHOTS, "22-360-takeaway-viewport.png") });
  // Touch targets: every visible button at least 44px tall
  const small44 = await p2.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.offsetParent && b.getBoundingClientRect().height < 44).map((b) => b.textContent.trim()));
  ok("360×780 takeaway: all visible buttons ≥ 44px tall", small44.length === 0, small44.join(" | "));
  await small.close();

  // ── Reduced motion still completes show-me immediately ───────────────
  const rm = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const p3 = await rm.newPage();
  await p3.goto(URL);
  await toActivityDay12(p3);
  await p3.getByRole("button", { name: "No estoy segura, muéstrame" }).click();
  await p3.waitForTimeout(100);
  ok("reduced motion: show-me completes without waiting", await visible(p3, "120 − 170 = −50"));
  await rm.close();

  await browser.close();
  log.push(`\n${pass} passed, ${fail} failed`);
  fs.writeFileSync(LOG, log.join("\n") + "\n");
  console.log(log.join("\n"));
  process.exit(fail ? 1 : 0);
})();
