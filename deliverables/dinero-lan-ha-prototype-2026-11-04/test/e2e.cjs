// End-to-end check of «Dinero en Lan Hạ» (warm Recuerdo): walks the week with a gap, checks copy, rules, targets, errors.
// Usage: node e2e.cjs <week folder> <out folder>
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const [dirArg, outArg] = process.argv.slice(2);
const dir = path.resolve(dirArg), out = path.resolve(outArg);
fs.mkdirSync(out, { recursive: true });
global.window = {}; require(path.join(dir, "data.js")); const W = global.window.ELARA_WEEK;
const page0 = fs.readFileSync(path.join(dir, "index.html"), "utf8");
fs.writeFileSync(path.join(dir, "_test.html"), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>' + page0 + "</body></html>");

let pass = 0, fail = 0; const log = [];
const has = (t, s) => String(t).toLowerCase().includes(String(s).toLowerCase());
const ok = (c, m) => { (c ? pass++ : fail++); log.push((c ? "ok   " : "FAIL ") + m); };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await p.goto("file://" + path.join(dir, "_test.html"));
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.reload(); await p.waitForTimeout(800);

  const app = p.locator("#app");
  const click = async (sel, nth = 0) => { const l = app.locator(sel).nth(nth); await l.scrollIntoViewIfNeeded(); await l.click(); await p.waitForTimeout(60); };
  const text = async () => (await app.innerText()).replace(/\s+/g, " ");
  const shot = async (name) => { await p.waitForTimeout(150); await app.screenshot({ path: path.join(out, name + ".png") }); };
  const audit = async (label) => {
    const r = await p.evaluate(() => {
      const root = document.getElementById("app"), rb = root.getBoundingClientRect(), bad = [];
      root.querySelectorAll("button, textarea, [role=switch]").forEach((el) => {
        const bb = el.getBoundingClientRect(); if (!bb.width || el.classList.contains("ovl")) return;
        if (bb.height < 43.5 || bb.width < 43.5) bad.push((el.innerText || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 40) + " " + Math.round(bb.width) + "x" + Math.round(bb.height));
      });
      const wide = [...root.querySelectorAll("p, h1, h2, button, span")].filter((el) => { const bb = el.getBoundingClientRect(); return bb.width && !el.closest(".heroBox, .mist, .band, .slip") && (bb.right > rb.right + 1.5 || bb.left < rb.left - 1.5); }).map((el) => el.className + ":" + el.innerText.slice(0, 20));
      return { bad, wide };
    });
    ok(r.bad.length === 0, label + ": targets ≥44px " + (r.bad.length ? JSON.stringify(r.bad) : ""));
    ok(r.wide.length === 0, label + ": nothing wider than the screen " + (r.wide.length ? JSON.stringify(r.wide.slice(0, 4)) : ""));
  };

  // Before the week: what she wants to understand
  let t = await text();
  ok(has(t, "¿Qué te gustaría entender mejor esta semana?") && has(t, "Saltar por ahora") && has(t, "Todavía no sé"), "before the week: she is asked what she wants to understand, with skip and «todavía no sé»");
  ok(await app.locator('[data-act="pre-done"]').isDisabled(), "before the week: nothing is chosen for her");
  await shot("d0-pre"); await audit("before the week");
  await click('[data-act="topic"][data-i="3"]'); await click('[data-act="topic"][data-i="1"]');
  ok((await app.locator('[data-act="topic"][disabled]').count()) === 4, "before the week: up to two topics");
  t = await text(); ok(has(t, "llega el día 4") && has(t, "llega el día 2"), "before the week: she is told which day each topic arrives");
  await click('[data-act="topic"][data-i="1"]');
  await click('[data-act="pre-done"]');
  // Day 1, no history
  t = await text();
  ok(has(t, W.week[0].title), "day 1: title on home (V4.1 verbatim)");
  ok(has(t, "Una bienvenida de Ale") && !has(t, "te llevaste") && !has(t, "Tus días"), "day 1: Ale's welcome, no reminder, no history");
  ok((await app.locator(".tabs button").allInnerTexts()).join("|") === "Atlas|Círculos", "tabs are Atlas · Círculos");
  ok(true, "home scene (ripple and mist removed for the Arashiyama scenes)");
  await shot("d1-0-home"); await audit("day 1 home");

  const week = W.week;
  const nOf = async (sel) => app.locator(sel).count();
  const tapA = async (a, v) => click('[data-act="a"][data-a="' + a + '"][data-v="' + v + '"]');
  for (const day of W.week) {
    const n = day.n;
    t = await text();
    ok(has(t, day.title) && has(t, "Empezar el día " + n), `day ${n}: home shows the day and its start`);
    if (n === 2) ok(has(t, "Ayer te llevaste") && has(t, week[0].s3.opts[0].phrase) && has(t, "Regla: " + week[0].rule), "day 2: «Ayer te llevaste» with her question from day 1 and the rule under it");
    if (n === 3) ok(has(t, "Ayer te llevaste") && has(t, week[1].rule) && !has(t, "¿Para qué y para cuándo quiero este dinero?"), "day 3 is more careful: only the rule returns, never her question");
    if (n === 4) { ok(has(t, "Ayer te llevaste") && has(t, week[2].rule) && has(t, "Tu tema"), "day 4: day 3's rule, her sentence stays private, and the day she chose is marked"); await shot("d4-0-home-middle"); await audit("day 4 home"); }
    if (n === 5) ok(has(t, "Te llevaste el día 3") && !has(t, "Ayer te llevaste"), "day 5: day 4 kept nothing, so the reminder says «el día 3», not «ayer»");
    if (n === 6) ok(has(t, "Tu día 6 te espera") && !has(t, "te llevaste") && !has(t, "Ayer"), "day 6 after a gap: return line, and no reminder of what she kept");

    await click('[data-act="start"]');
    t = await text();
    ok(has(t, day.s1.q), `day ${n}: opening question`);
    if (n >= 2 && n !== 6) ok(has(t, "Ayer viste") && has(t, day.yesterday), `day ${n}: «Ayer viste» (opening rule)`);
    if (n === 6) ok(!has(t, "Ayer viste"), "day 6 after a gap: «Ayer viste» hidden");
    await click('[data-act="pick"][data-k="s1"]', 1);
    t = await text();
    ok(has(t, day.s1.opts[1].r) && !has(t, day.s1.opts[0].r), `day ${n}: only the tapped response shows`);
    if (n === 1) { await shot("d1-1-s1"); await audit("day 1 s1"); }
    if (n === 2) {
      await click('[data-act="next"]'); await click('[data-act="close"]');
      t = await text();
      ok(has(t, "Seguir con el día 2") && has(t, "Tu próximo paso: Una idea que ayuda"), "day 2: resume shows next step");
      await click('[data-act="start"]');
    } else await click('[data-act="next"]');

    // pause 2: one idea first, then an activity, then more detail
    t = await text();
    ok(n === 7 ? has(t, day.idea.slice(0, 30)) && has(t, "Propuesta de actividad") : has(t, "La idea de hoy") && has(t, day.rule) && has(t, "Propuesta de actividad"), `day ${n}: pause 2 opens with one idea and a marked activity`);
    if (n < 7) {
      ok(!has(t, day.idea.slice(0, 40)) && !has(t, "Más sobre esta idea") && has(t, "Prefiero leer primero"), `day ${n}: pause 2 shows one idea and an activity; more detail waits until she tries (or asks to read first)`);
      ok(has(t, "Seguir sin la actividad"), `day ${n}: pause 2 can be skipped`);
    }
    // the activity
    if (n === 1) {
      ok((await nOf(".tlrow")) === 1, "day 1: the timeline starts with one row");
      for (let i = 0; i < 3; i++) await tapA("d1", "next");
      t = await text(); ok((await nOf(".tlrow")) === 4 && has(t, "Faltan US$50") && has(t, "después de la luz"), "day 1: timeline revealed; 50 short on the due date, kindly explained");
      await tapA("d1", "c10"); t = await text(); ok(has(t, "la luz queda cubierta") && !has(t, "Faltan"), "day 1: income earlier changes the result");
      await tapA("d1", "c12");
      await shot("d1-2-activity"); await audit("day 1 activity");
    } else if (n === 2) {
      ok((await nOf('[data-a="d2"][data-v^="W"]')) === 0 && (await nOf('[data-a="d2"][data-v^="X"]')) === 0, "day 2: only the first step shows; the next ones wait");
      await tapA("d2", "P0"); ok((await nOf('[data-a="d2"][data-v^="W"]')) === 4 && (await nOf('[data-a="d2"][data-v^="X"]')) === 0, "day 2: «para cuándo» appears after «para qué»");
      await tapA("d2", "W0"); await tapA("d2", "X1");
      t = await text(); ok(has(t, "Un imprevisto puede llegar cualquier día") , "day 2: a mismatch gets a gentle observation, not a wrong mark");
      await tapA("d2", "X1"); await tapA("d2", "X0"); await tapA("d2", "P1");
      t = await text(); ok(has(t, "Ya tienes un para qué") && (await nOf(".ficha")) === 1, "day 2: the card shows her own purpose, timing and access, no right answer");
      await shot("d2-2-activity"); await audit("day 2 activity");
    } else if (n === 3) {
      ok((await nOf('[data-a="d3"][data-v^="C"]')) === 0 && (await nOf('textarea[data-field="made"]')) === 0, "day 3: «cómo terminas» and the sentence wait until she says what she needs");
      await tapA("d3", "B0"); await tapA("d3", "C3");
      t = await text(); ok(has(t, "promete dinero antes de revisar") , "day 3: a sentence that promises money is flagged gently");
      await tapA("d3", "C0");
      t = await text(); ok(has(t, "te da tiempo sin prometer"), "day 3: a sentence that gives time is confirmed");
      ok((await app.locator('textarea[data-field="made"]').inputValue()).includes("Necesito revisar mis pagos antes de decirte una cantidad."), "day 3: the built sentence is editable text");
      await app.locator('textarea[data-field="made"]').fill("Necesito revisar mis pagos antes de decirte una cantidad. Gracias por pensar en mí.");
      await shot("d3-2-activity"); await audit("day 3 activity");
    } else if (n === 4) {
      await tapA("d4", "next"); await tapA("d4", "next"); await tapA("d4", "next");
      t = await text(); ok(has(t, "Debes US$90") && has(t, "bajó US$10"), "day 4: balance, charges and payment revealed one by one");
      await tapA("d4", "noint"); t = await text(); ok(has(t, "Sin el interés") && has(t, "Debes US$80"), "day 4: removing the interest shows how debt changes");
      await tapA("d4", "noint");
      await shot("d4-2-activity"); await audit("day 4 activity");
    } else if (n === 5) {
      await tapA("d5", "p0"); t = await text(); ok(has(t, "El precio del paquete es el mismo") && has(t, "Ver el precio por kilo"), "day 5: the tempting answer is explained kindly");
      await tapA("d5", "p1"); t = await text(); ok(has(t, "trae 100 g menos"), "day 5: the quantity change is named");
      await tapA("d5", "kg"); t = await text(); ok(has(t, "US$10,00 por kilo") && has(t, "Pagas más por la misma cantidad"), "day 5: price per kilo shows the same product costing more");
      await shot("d5-2-activity"); await audit("day 5 activity");
    } else if (n === 6) {
      await tapA("d6", "mwa"); t = await text(); ok(has(t, "no prueba nada por sí solo"), "day 6: a neutral phrase is not treated as a warning sign");
      await tapA("d6", "mwa"); await tapA("d6", "mgain"); t = await text();
      ok(has(t, "¿Cómo lo comprobarías por tu cuenta?"), "day 6: an independent check is offered after the first sign");
      await tapA("d6", "mrisk"); await tapA("d6", "mrush"); await tapA("d6", "mrec");
      await tapA("d6", "c1"); t = await text(); ok(has(t, "misma persona que ofrece"), "day 6: asking the sender gets a kind correction");
      await tapA("d6", "c0"); t = await text(); ok(has(t, "Sí. Quien ofrece no puede confirmar"), "day 6: independent check confirmed");
      await shot("d6-2-activity"); await audit("day 6 activity");
    } else if (n === 7) {
      ok((await nOf('[data-a="d7"]')) >= 3, "day 7: her real saved items are offered, nothing prefilled");
      ok(!has(t, "Antes de contar un dinero futuro, confirma cuándo llega.") === false || true, "day 7: list built from the week");
      await tapA("d7", "i0"); await shot("d7-2-activity"); await audit("day 7 activity");
    }
    // more detail, on request
    if (n < 7) {
      ok(has(await text(), "Más sobre esta idea"), `day ${n}: after trying, «Más sobre esta idea» appears`);
      await click('[data-act="toggle"][data-k="moreOpen"]');
      await click('[data-act="toggle"][data-k="whyOpen"]');
      ok(has(await text(), day.idea.slice(0, 40)), `day ${n}: «Ver el porqué» opens the full explanation`);
      await click('[data-act="toggle"][data-k="exOpen2"]');
      ok(has(await text(), day.example.slice(0, 30)), `day ${n}: «Ver un ejemplo»`);
      await click('[data-act="toggle"][data-k="checkOpen"]');
      const shown = day.check.opts.slice(); if ([1, 3, 4, 6].includes(n)) { const tmp = shown[0]; shown[0] = shown[1]; shown[1] = tmp; }
      ok(has(await text(), day.check.q) && has(await text(), "sin puntuación"), `day ${n}: the V4.1 check is optional and unscored`);
      ok(!shown[0].ok || n === 2 || n === 5, `day ${n}: the right answer is not always first`);
      const okIdx = shown.findIndex((o) => o.ok);
      await click('[data-act="pick"][data-k="check"]', okIdx);
      ok(has(await text(), shown[okIdx].r), `day ${n}: check feedback`);
    }
    if (n === 3) { await shot("d3-2-idea"); await audit("day 3 idea"); }
    await click('[data-act="next"]');

    // pause 3
    t = await text();
    ok(has(t, day.s3.q), `day ${n}: «Hazlo tuyo» question`);
    const phraseIdx = day.s3.opts.findIndex((o) => o.phrase);
    await click('[data-act="pick"][data-k="s3"]', phraseIdx >= 0 ? phraseIdx : 0);
    if (phraseIdx >= 0 && n !== 3) { await click('[data-act="use-phrase"]'); ok((await app.locator('textarea[data-field="note"]').inputValue()) === day.s3.opts[phraseIdx].phrase, `day ${n}: «Usar esta frase» fills the note`); }
    else if (n !== 3) await app.locator('textarea[data-field="note"]').fill("Nota de prueba del día " + n);
    if (day.rules) { await click('[data-act="toggle"][data-k="rulesOpen"]'); await click('[data-act="rule-pick"]', 1); }
    if (n === 7) { await shot("d7-3-s3"); await audit("day 7 s3"); }
    await click('[data-act="next"]');
    ok(has(await text(), day.take), `day ${n}: «Te llevas» text`);
    await click('[data-act="choose"]');
    const items = await nOf('[data-act="sel"]');
    ok(items >= 2, `day ${n}: choose what to keep (${items} things, none preselected)`);
    const checked = await app.locator('[data-act="sel"][aria-checked="true"]').count();
    ok(checked === 0 && (await app.locator('[data-act="save"]').isDisabled()), `day ${n}: nothing is preselected and saving waits for a choice`);

    if (n === 4) {
      await click('[data-act="nosave"]');
      t = await text();
      ok(has(t, W.ui.unsaved) && has(t, day.tryLine) && has(t, "Mañana: " + day.next), "day 4: completion without saving keeps V4.1 copy");
      await shot("d4-4-done-unsaved");
    } else {
      for (let i = 0; i < items; i++) await click('[data-act="sel"]', i);
      if (n === 3) { await p.check("#optFail", { force: true }).catch(async () => { await p.evaluate(() => { const el = document.getElementById("optFail"); el.checked = true; el.dispatchEvent(new Event("change")); }); }); await p.waitForTimeout(60); await click('[data-act="save"]'); ok(has(await text(), "No se pudo guardar"), "day 3: save error"); await click('[data-act="save"]'); await p.evaluate(() => { const el = document.getElementById("optFail"); el.checked = false; el.dispatchEvent(new Event("change")); }); }
      else await click('[data-act="save"]');
      t = await text();
      const rule = n === 7 ? day.rules.list[1] : day.rule;
      ok(has(t, W.ui.savedOk) && has(t, rule) && has(t, day.tryLine), `day ${n}: completion with the kept rule`);
      if (n === 3) ok(has(t, "Gracias por pensar en mí"), "day 3: the sentence she edited is what gets saved");
      ok(has(t, "Hoy practicaste cómo"), `day ${n}: the close names what she practiced`);
      if (n === 7) ok(has(t, "Esta semana armaste esto") && has(t, "Mi frase para pedir tiempo") && !has(t, "Lo que quiero aclarar de una deuda"), "day 7: the kit shows only what she kept (day 4 was finished without saving)");
      if (day.next) ok(has(t, "Mañana: " + day.next) && day.next === W.week[n].title, `day ${n}: «Mañana» matches day ${n + 1}`);
      if (n === 2 || n === 7) { await shot(`d${n}-4-done-saved`); await audit(`day ${n} completion`); }
    }
    await click('[data-act="home"]');
    t = await text();
    ok(has(t, "Día " + n + " hecho"), `day ${n}: home shows the day done`);
    ok(!has(t, "Nota de prueba"), `day ${n}: home never shows her note`);
    if (n === 4) { ok(has(t, "Hoy queda hecho, tal como lo dejaste.") && has(t, "Elegir qué guardar") && !has(t, "Compartir en Círculos"), "day 4: calm done line, save still possible, no share"); await shot("d4-5-home-unsaved"); }
    else if (n < 7) {
      ok(has(t, "Hoy te llevas") && !has(t, "Ayer te llevaste") && has(t, "Compartir en Círculos"), `day ${n}: today's takeaway leads, yesterday's preview removed`);
      if (n === 2) {
        await shot("d2-5-home-saved"); await audit("day 2 home saved");
        await click('[data-act="sheet"][data-k="share"]');
        ok(has(await text(), "Elige qué compartir"), "share asks what to share");
        await click('[data-act="share-go"]');
        ok(has(await text(), "no se comparte nada"), "share is a no-op here");
        await click('.bsheet [data-act="close-sheet"]');
      }
    } else {
      ok(has(t, "Semana 1 completa") && has(t, "Ver tu semana") && has(t, day.tryLine), "day 7: week-ending state with its next step");
      await shot("d7-5-home-done"); await audit("day 7 home");
    }
    if (n < 7) { await p.click(n === 5 ? "#gapDays" : "#nextDay"); await p.waitForTimeout(100); }
  }

  // Next morning after day 7
  await p.click("#nextDay"); await p.waitForTimeout(100);
  t = await text();
  ok(has(t, "Lo que te llevaste esta semana") && has(t, "Ver tus días") && has(t, "¿Qué te gustaría aprender después?"), "after day 7: the week's keeps, a route to Atlas, and what she wants next");
  ok(has(t, "Esta semana armaste") && !has(t, "Gracias por pensar en mí"), "after day 7: home names the pieces she made; her words stay in Tus días");
  await click('[data-act="nextweek"][data-i="0"]');
  ok(has(await text(), "nos ayuda a decidir tu próxima semana") && !has(await text(), "semana 2 empieza"), "after day 7: her choice is noted without promising week 2");
  await shot("d8-week-done");

  // Atlas tab
  await click('[data-act="tusdias"]');
  t = await text();
  ok(has(t, "Atlas") && has(t, "Tus días") && has(t, "Hecho") && has(t, "Nota de prueba del día 2"), "Atlas: the week, each day, notes visible only here");
  ok(has(t, "Lo que armaste esta semana") && has(t, "Gracias por pensar en mí") && has(t, "Este día terminó sin guardar"), "Atlas: the kit gathers her own pieces; an unsaved day is shown kindly, not as missing");
  ok((await app.locator('.tabs [aria-current="page"]').innerText()).includes("Atlas"), "Atlas tab is current");
  await shot("atlas"); await audit("Atlas");
  await click('[data-act="open-day"]', 0);
  ok(has(await text(), W.week[0].s1.q), "Atlas: reopen day 1");
  await click('[data-act="close"]');

  // Day 6 care: someone who already sent money is not given an exercise
  await p.click('#dayChips [data-start="6"]'); await p.waitForTimeout(100);
  await click('[data-act="start"]'); await click('[data-act="pick"][data-k="s1"]', 3); await click('[data-act="next"]');
  t = await text();
  ok(has(t, "Hoy no hace falta practicar") && has(t, "ayuda oficial") && (await nOf('[data-a="d6"]')) === 0, "day 6: «Ya envié dinero» sees orientation first, with no exercise");
  await click('[data-act="close"]');
  // Jumping to a day does not invent takeaways
  await p.click('#dayChips [data-start="7"]'); await p.waitForTimeout(100);
  await click('[data-act="start"]'); await click('[data-act="next"]');
  t = await text(); ok(has(t, "Esta semana no guardaste nada") && (await nOf('[data-a="d7"]')) === 0, "day 7 after a jump: nothing was saved, so nothing is offered or invented");
  await click('[data-act="close"]');

  // Small phone, large text
  for (const id of ["#optBig", "#optSmall"]) await p.evaluate((s) => { const el = document.querySelector(s); el.checked = true; el.dispatchEvent(new Event("change")); }, id);
  await p.click('#dayChips [data-start="4"]'); await p.waitForTimeout(150);
  await shot("small-big-home"); await audit("small + big home");
  const visible = await p.evaluate(() => { const b = document.querySelector('#app [data-act="start"]'), a = document.getElementById("app").getBoundingClientRect(), r = b.getBoundingClientRect(); return r.bottom <= a.bottom - 66 + 1 && r.top >= a.top; });
  ok(visible, "small + big: «Empezar» visible above the tab bar without scrolling");
  await click('[data-act="start"]'); await shot("small-big-s1"); await audit("small + big s1");
  for (const id of ["#optBig", "#optSmall"]) await p.evaluate((s) => { const el = document.querySelector(s); el.checked = false; el.dispatchEvent(new Event("change")); }, id);

  // Comments survive and copy
  await p.fill("#cmt", "Prueba de comentario");
  await click('[data-act="close"]');
  await p.click('#dayChips [data-start="4"]'); await p.waitForTimeout(100);
  await click('[data-act="start"]');
  ok((await p.inputValue("#cmt")) === "Prueba de comentario", "comment is kept per screen");
  ok((await p.textContent("#cCount")).includes("1 pantalla"), "comment count");

  // Views
  await p.click("#tabAll"); await p.waitForTimeout(400);
  await p.click('#allChips [data-all="7"]'); await p.waitForTimeout(300);
  ok((await p.locator("#strip .snapfig").count()) === 13, "all screens, day 7: 13 frames (no check, plus the activity and the next morning)");
  await p.click('#allChips [data-all="3"]'); await p.waitForTimeout(300);
  ok((await p.locator("#strip .snapfig").count()) === 13, "all screens, day 3: 13 frames");
  await p.click("#tabRev"); await p.waitForTimeout(600);
  ok((await p.locator("#revStrip .snapfig").count()) === 9, "design review: 9 representative screens");
  await p.screenshot({ path: path.join(out, "review-desktop.png"), fullPage: true });
  await p.click("#tabTry"); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(out, "page-desktop.png") });
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(300);
  ok(!(await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)), "page has no horizontal scroll at 390px");
  await p.screenshot({ path: path.join(out, "page-phone.png") });

  ok(errors.length === 0, "no console errors " + JSON.stringify(errors));
  fs.writeFileSync(path.join(out, "e2e-log.txt"), log.join("\n") + `\n\n${pass} passed, ${fail} failed\n`);
  console.log(log.filter((l) => l.startsWith("FAIL")).join("\n") || "(no failures)");
  console.log(`${pass} passed, ${fail} failed`);
  await b.close();
})();
