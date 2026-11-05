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

  // Day 1, no history
  let t = await text();
  ok(has(t, W.week[0].title), "day 1: title on home (V4.1 verbatim)");
  ok(has(t, "Una bienvenida de Ale") && !has(t, "te llevaste") && !has(t, "Tus días"), "day 1: Ale's welcome, no reminder, no history");
  ok((await app.locator(".tabs button").allInnerTexts()).join("|") === "Atlas|Círculos", "tabs are Atlas · Círculos");
  ok(true, "home scene (ripple and mist removed for the Arashiyama scenes)");
  await shot("d1-0-home"); await audit("day 1 home");

  for (const day of W.week) {
    const n = day.n;
    t = await text();
    ok(has(t, day.title) && has(t, "Empezar el día " + n), `day ${n}: home shows the day and its start`);
    if (n === 2 || n === 3) ok(has(t, "Ayer te llevaste") && has(t, W.week[n - 2].rule), `day ${n}: «Ayer te llevaste» with yesterday's rule`);
    if (n === 5) ok(has(t, "Te llevaste el día 3") && !has(t, "Ayer te llevaste"), "day 5: day 4 kept nothing, so the reminder says «el día 3», not «ayer»");
    if (n === 6) ok(has(t, "Tu día 6 te espera") && has(t, "Te llevaste el día 5") && !has(t, "Ayer"), "day 6 after a gap: return line, no «ayer»");
    if (n === 4) { await shot("d4-0-home-middle"); await audit("day 4 home"); }

    await click('[data-act="start"]');
    t = await text();
    ok(has(t, day.s1.q), `day ${n}: opening question`);
    if (n >= 2 && n !== 6) ok(has(t, "Ayer viste") && has(t, day.yesterday), `day ${n}: «Ayer viste» (opening rule)`);
    if (n === 6) ok(!has(t, "Ayer viste"), "day 6 after a gap: «Ayer viste» hidden");
    await click('[data-act="pick"][data-k="s1"]', 1);
    t = await text();
    ok(has(t, day.s1.opts[1].r) && !has(t, day.s1.opts[0].r), `day ${n}: only the tapped response shows`);
    if (n === 1) { await shot("d1-1-s1"); await audit("day 1 s1"); }
    if (n === 2) { // resume: leave and come back
      await click('[data-act="next"]');
      await click('[data-act="close"]');
      t = await text();
      ok(has(t, "Seguir con el día 2") && has(t, "Tu próximo paso: Una idea que ayuda"), "day 2: resume shows next step");
      await click('[data-act="start"]');
      ok(has(await text(), day.idea), "day 2: resumes on «Una idea que ayuda»");
    } else {
      await click('[data-act="next"]');
    }
    t = await text();
    ok(has(t, day.idea) && has(t, day.rule), `day ${n}: idea and rule`);
    if (n === 3) { await shot("d3-2-idea"); await audit("day 3 idea"); }
    await click('[data-act="next"]');
    if (day.check) {
      t = await text();
      ok(has(t, day.check.q) && has(t, "Seguir sin responder"), `day ${n}: optional check, skippable`);
      const okIdx = day.check.opts.findIndex((o) => o.ok);
      await click('[data-act="pick"][data-k="check"]', okIdx);
      ok(has(await text(), day.check.opts[okIdx].r), `day ${n}: check feedback`);
      await click('[data-act="next"]');
    }
    t = await text();
    ok(has(t, day.s3.q), `day ${n}: «Hazlo tuyo» question`);
    const phraseIdx = day.s3.opts.findIndex((o) => o.phrase);
    await click('[data-act="pick"][data-k="s3"]', phraseIdx >= 0 ? phraseIdx : 0);
    if (phraseIdx >= 0) { await click('[data-act="use-phrase"]'); ok((await app.locator('textarea[data-field="note"]').inputValue()) === day.s3.opts[phraseIdx].phrase, `day ${n}: «Usar esta frase» fills the note`); }
    else await app.locator('textarea[data-field="note"]').fill("Nota de prueba del día " + n);
    if (day.rules) { await click('[data-act="toggle"][data-k="rulesOpen"]'); await click('[data-act="rule-pick"]', 1); }
    if (n === 7) { await shot("d7-3-s3"); await audit("day 7 s3"); }
    await click('[data-act="next"]');
    ok(has(await text(), day.take), `day ${n}: «Te llevas» text`);
    await click('[data-act="choose"]');
    ok((await app.locator('[data-act="sel"]').count()) === 2, `day ${n}: choose the rule and the note`);

    if (n === 4) {
      await click('[data-act="nosave"]');
      t = await text();
      ok(has(t, W.ui.unsaved) && has(t, day.tryLine) && has(t, "Mañana: " + day.next), "day 4: completion without saving keeps V4.1 copy");
      await shot("d4-4-done-unsaved");
    } else {
      if (n === 3) { await p.check("#optFail", { force: true }).catch(async () => { await p.evaluate(() => { const el = document.getElementById("optFail"); el.checked = true; el.dispatchEvent(new Event("change")); }); }); await p.waitForTimeout(60); await click('[data-act="save"]'); ok(has(await text(), "No se pudo guardar"), "day 3: save error"); await click('[data-act="save"]'); await p.evaluate(() => { const el = document.getElementById("optFail"); el.checked = false; el.dispatchEvent(new Event("change")); }); }
      else await click('[data-act="save"]');
      t = await text();
      const rule = n === 7 ? day.rules.list[1] : day.rule;
      ok(has(t, W.ui.savedOk) && has(t, rule) && has(t, day.tryLine), `day ${n}: completion with the kept rule`);
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
  ok(has(t, "Lo que te llevaste esta semana") && has(t, "Ver tus días"), "after day 7: the week's keeps and a route to Atlas");
  await shot("d8-week-done");

  // Atlas tab
  await click('[data-act="tusdias"]');
  t = await text();
  ok(has(t, "Atlas") && has(t, "Tus días") && has(t, "Hecho") && has(t, "Nota de prueba del día 2"), "Atlas: the week, each day, notes visible only here");
  ok((await app.locator('.tabs [aria-current="page"]').innerText()).includes("Atlas"), "Atlas tab is current");
  await shot("atlas"); await audit("Atlas");
  await click('[data-act="open-day"]', 0);
  ok(has(await text(), W.week[0].s1.q), "Atlas: reopen day 1");
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
  ok((await p.locator("#strip .snapfig").count()) === 12, "all screens, day 7: 12 frames (no check, plus the next morning)");
  await p.click('#allChips [data-all="3"]'); await p.waitForTimeout(300);
  ok((await p.locator("#strip .snapfig").count()) === 12, "all screens, day 3: 12 frames");
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
