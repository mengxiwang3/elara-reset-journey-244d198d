// Walks all 14 days in ES and EN, layers on and off; checks errors, raw tokens, callbacks and the thread.
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const dir = path.resolve(process.argv[2] || "app"), out = path.resolve(process.argv[3] || "out"); fs.mkdirSync(out, { recursive: true });
const page0 = fs.readFileSync(path.join(dir, "index.html"), "utf8");
fs.writeFileSync(path.join(dir, "_test.html"), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>' + page0 + "</body></html>");
let pass = 0, fail = 0; const log = [];
const ok = (c, m) => { c ? pass++ : fail++; log.push((c ? "ok   " : "FAIL ") + m); };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } }); const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  const url = "file://" + path.join(dir, "_test.html");
  async function appText() { return p.$eval("#app", (e) => e.innerText); }
  async function bad(where) { const t = await appText(); const raw = /\{[a-zA-Z0-9.#|]+\}|undefined|null|NaN/.test(t); if (raw) ok(false, where + ": raw token/undefined → " + (t.match(/.{0,40}(\{[a-zA-Z0-9.#|]+\}|undefined|null|NaN).{0,40}/) || [""])[0]); }
  async function walkDay(n, lang, mode) {
    await p.click('#app [data-act="start"]');
    for (let guard = 0; guard < 40; guard++) {
      const inEnd = await p.$("#app .dayend"); if (inEnd) break;
      await bad(lang + " d" + n);
      // answer the current step
      const has = async (s) => !!(await p.$("#app " + s));
      if (mode === "skip" && await has('[data-act="skip"]')) { await p.click('#app [data-act="skip"]'); continue; }
      if (await has('[data-act="sort"]')) { if (!(await has('[data-act="sort"][aria-pressed="true"]'))) { const cnt = (await p.$$("#app .sortrow")).length; for (let j = 0; j < cnt; j++) { const rows = await p.$$("#app .sortrow"); const bs = await rows[j].$$("button"); await bs[(n === 1 ? [0, 0, 0, 1] : [0, 1, 0, 1, 0])[j] % bs.length].click(); } } }
      else if (await has('[data-act="multi"]')) { if (!(await has('[data-act="multi"][aria-pressed="true"]'))) { const bs = await p.$$('#app [data-act="multi"]'); await bs[1].click(); await (await p.$$('#app [data-act="multi"]'))[2].click(); await (await p.$$('#app [data-act="multi"]'))[0].click(); } }
      else if (await has('[data-act="pick"]')) { const bs = await p.$$('#app [data-act="pick"]'); await bs[n === 1 && (await appText()).match(/presión|pressure/) ? 4 : n === 3 && (await appText()).match(/Cuándo suele|When does/) ? 1 : 0].click(); }
      else if (await has('[data-act="scale"]')) await p.click('#app [data-act="scale"]');
      else if (await has("canvas.pad")) { const bx = await (await p.$("canvas.pad")).boundingBox(); await p.mouse.move(bx.x + 20, bx.y + 20); await p.mouse.down(); await p.mouse.move(bx.x + 120, bx.y + 90, { steps: 5 }); await p.mouse.up(); }
      else if (await has('textarea.field')) { const v = await p.$eval("#app textarea.field", (e) => e.value); if (!v) await p.fill("#app textarea.field", lang === "es" ? "Algo pequeño de prueba" : "A small test answer"); }
      else if (await has('[data-in="f"]')) await p.fill('#app [data-in="f"]', lang === "es" ? "ayudar este mes" : "help this month");
      else if (await has('[data-in="cap"]')) await p.fill('#app [data-in="cap"]', lang === "es" ? "El café" : "Coffee");
      if (n === 4 && await has('[data-act="chk"]')) { await p.click('#app [data-act="chk"]'); }
      if ((n === 1 || n === 5) && await has('[data-act="when"]')) await p.click('#app [data-act="when"]');
      const nb = await p.$('#app [data-act="next"]'); if (!nb || await nb.isDisabled()) { ok(false, `${lang} d${n} next disabled at step ${guard}: ` + (await appText()).slice(0, 120)); break; }
      await nb.click();
      // reply tap
      const nb2 = await p.$('#app [data-act="next"]'); if (nb2 && (await appText()).length && await p.$("#app .reply") && guard < 39) { /* next loop handles */ }
    }
    ok(!!(await p.$("#app .dayend")), `${lang} ${mode} day ${n} reaches its close`);
    if (!(await p.$("#app .dayend"))) { console.log(log.filter((l) => l.startsWith("FAIL")).join("\n")); console.log(await p.$eval("#panel .nowlabel", (e) => e.textContent)); await p.screenshot({ path: path.join(out, "stuck.png") }); process.exit(1); }
    await bad(lang + " d" + n + " close");
    if (n === 7 || n === 14) ok(/(semana|week)/i.test(await appText()), `${lang} day ${n} close shows the week letter`);
    await p.screenshot({ path: path.join(out, `${lang}-${mode}-d${n}-close.png`) });
    await p.click('#app [data-act="finish"][data-s="1"]');
    await bad(lang + " home after d" + n);
    if (n < 14) await p.click('#panel [data-pa="next"]');
  }
  for (const [lang, mode] of [["es", "answer"], ["en", "answer"], ["es", "skip"]]) {
    await p.goto(url + "#" + lang); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
    for (let n = 1; n <= 14; n++) await walkDay(n, lang, mode);
    await p.click('#app [data-act="tab"][data-i="1"]');
    const t = await appText(); const on = (await p.$$("#app .hilo li.on")).length;
    ok(mode === "skip" ? on === 0 : on >= 12, `${lang} ${mode}: thread has ${on} pieces`);
    await p.screenshot({ path: path.join(out, `${lang}-${mode}-hilo.png`), fullPage: false });
  }
  // callbacks: in ES answered run, check day 7 rule from her and day 14 compass prefill
  await p.goto(url + "#es"); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.click('#panel [data-pa="day"][data-n="7"]'); await p.click('#app [data-act="start"]'); await p.click('#app [data-act="next"]');
  ok(/Hecha con tu día 3/.test(await appText()), "day 7 offers a rule built from day 3");
  await p.screenshot({ path: path.join(out, "es-d7-rule.png") });
  await p.click('#panel [data-pa="day"][data-n="14"]'); await p.click('#app [data-act="start"]');
  const v14 = await p.$eval("#app textarea.field", (e) => e.value); ok(/Mi dinero es para/.test(v14), "day 14 compass prefill: " + v14);
  await p.click('#panel [data-pa="day"][data-n="9"]'); await p.click('#app [data-act="start"]');
  ok(/Dijiste: probar tu regla/.test(await appText()), "day 9 follow-up quotes day 8");
  // the eight usefulness fixes
  ok(!/Estoy soltando/.test(v14), "day 14 doesn't claim she's letting go unless day 10 says so");
  await p.click('#panel [data-pa="day"][data-n="7"]'); await p.click('#app [data-act="start"]'); await p.click('#app [data-act="next"]');
  ok(!/Hecha con tu día 1 y tu día 6/.test(await appText()), "day 7: fixed rules no longer claim to be built from her days");
  await p.click('#panel [data-pa="day"][data-n="2"]'); await p.click('#app [data-act="start"]');
  await p.click('#app [data-act="pick"]'); await p.click('#app [data-act="next"]');
  await p.click('#app [data-act="multi"][data-k="5"]'); await p.click('#app [data-act="next"]');
  await p.click('#app [data-act="pick"]'); await p.click('#app [data-act="next"]');
  ok((await p.$eval("#panel .nowlabel", (e) => e.textContent)).endsWith("d2.feels"), "day 2: «nada me sorprendió» skips the why step");
  await p.click('#app [data-act="back"]'); ok((await p.$eval("#panel .nowlabel", (e) => e.textContent)).endsWith("d2.surprised"), "day 2: back returns over the skipped step");
  await p.click('#panel [data-pa="reset"]');
  await p.click('#panel [data-pa="day"][data-n="10"]'); await p.click('#app [data-act="start"]');
  await p.fill("#app textarea.field", "La familia es primero"); await p.click('#app [data-act="next"]'); await p.click('#app [data-act="next"]');
  ok(/«La familia es primero»/.test(await appText()), "day 10: her own sentence is in the sort");
  const cnt10 = (await p.$$("#app .sortrow")).length; for (let j = 0; j < cnt10; j++) { const rows = await p.$$("#app .sortrow"); await (await rows[j].$$("button"))[1].click(); }
  for (let j = 0; j < 6; j++) { const nb = await p.$('#app [data-act="next"]'); if (!nb || await nb.isDisabled()) { const sk = await p.$('#app [data-act="skip"]'); if (sk) await sk.click(); else break; } else await nb.click(); if (await p.$("#app .dayend")) break; }
  await p.click('#app [data-act="finish"][data-s="1"]');
  await p.click('#panel [data-pa="next"]'); await p.click('#panel [data-pa="day"][data-n="14"]'); await p.click('#app [data-act="start"]');
  const v14b = await p.$eval("#app textarea.field", (e) => e.value); ok(/soltando la frase anterior: La familia es primero/.test(v14b), "day 14: letting go only after day 10 says so → " + v14b);
  await p.click('#panel [data-pa="day"][data-n="12"]'); await p.click('#app [data-act="start"]');
  ok(/El día 11 planeaste/.test(await appText()), "day 12 asks about day 11's plan");
  await p.click('#app [data-act="fu"][data-k="2"]'); ok(/No llegó el momento/.test(await appText()), "day 12: «No pasó» gets its own reply");
  await p.click('#panel [data-pa="day"][data-n="5"]'); await p.click('#app [data-act="start"]');
  await p.click('#app [data-act="pick"][data-k="1"]'); for (let j = 0; j < 4; j++) { const t = await appText(); if (/cubrir esa necesidad|darte un poco/.test(t)) break; const nb = await p.$('#app [data-act="next"]'); if (await nb.isDisabled()) { const pk = await p.$('#app [data-act="pick"]'); if (pk) await pk.click(); else await p.fill("#app textarea.field", "x"); } await p.click('#app [data-act="next"]'); }
  ok(/Mirar mi saldo cinco minutos/.test(await appText()), "day 5: «Control» gets alternatives that fit it");
  await p.click('#panel [data-pa="day"][data-n="13"]'); await p.click('#app [data-act="start"]');
  await p.click('#app [data-act="safe"]'); ok(/abre Ayuda/.test(await appText()), "day 13: pressure leads to the help message");
  await p.click('#app [data-act="help"]'); ok(!!(await p.$("#app .bsheet")), "day 13: Help opens a sheet");
  await p.click('#app .bsheet [data-act="closehelp"]'); await p.click('#app [data-act="endnow"]');
  ok(!!(await p.$("#app .dayend")), "day 13: she can end the day without rehearsing");
  ok(!/_safe|presionada/.test(await p.evaluate(() => localStorage.getItem("elara-claridad-w12-alt-v1"))), "day 13: the disclosure isn't stored");
  // layers off: no proposal markup inside the app
  await p.click('#panel [data-pa="day"][data-n="7"]'); await p.click('#panel input[data-pa="layers"]');
  await p.click('#app [data-act="start"]'); await p.click('#app [data-act="next"]');
  ok(!(await p.$("#app ins.p, #app .tag2, #app .layer")), "layers off: no proposals in the day");
  await p.screenshot({ path: path.join(out, "es-d7-rule-approved.png") });
  ok(errs.length === 0, "no page errors " + errs.slice(0, 3).join(" | "));
  fs.writeFileSync(path.join(out, "e2e-log.txt"), log.join("\n") + `\n${pass} passed, ${fail} failed\n`);
  console.log(log.filter((l) => l.startsWith("FAIL")).slice(0, 30).join("\n") || "(no failures)"); console.log(pass + " passed, " + fail + " failed");
  await b.close();
})();
