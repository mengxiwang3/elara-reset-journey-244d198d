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
