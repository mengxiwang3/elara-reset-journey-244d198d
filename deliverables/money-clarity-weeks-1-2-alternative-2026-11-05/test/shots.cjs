// Device-only screenshots of the key learning moments.
const { chromium } = require("playwright"); const path = require("path"); const fs = require("fs");
const out = path.resolve(process.argv[2] || "shots"); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 1100 } })).newPage();
  const url = "file://" + path.resolve("app/_test.html");
  async function go(lang) { await p.goto(url + "#" + lang); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300); }
  async function shot(name) { await p.waitForTimeout(250); await (await p.$("#device")).screenshot({ path: path.join(out, name + ".png") }); }
  async function day(n) { await p.click('#panel [data-pa="day"][data-n="' + n + '"]'); }
  async function start() { await p.click('#app [data-act="start"]'); }
  async function next() { await p.click('#app [data-act="next"]'); }
  async function toStep(id) { for (let i = 0; i < 12; i++) { const k = await p.$eval("#panel .nowlabel", (e) => e.textContent); if (k.endsWith("." + id)) return; const nb = await p.$('#app [data-act="next"]'); if (await nb.isDisabled()) { const sk = await p.$('#app [data-act="skip"]'); if (sk) { await sk.click(); continue; } } await next(); } }
  await go("es");
  await shot("01-home-d1");
  await start(); await next(); await p.click('#app [data-act="pick"]'); await next(); await p.click('#app [data-act="pick"]'); await next();
  for (const [r, c] of [[0, 0], [1, 0], [2, 0], [3, 1]]) { const rows = await p.$$("#app .sortrow"); await (await rows[r].$$("button"))[c].click(); }
  await next(); await p.evaluate(() => { const s = document.querySelector("#app .scroll"); s.scrollTop = s.scrollHeight; }); await shot("02-d1-hands-feedback");
  await day(3); await start(); await next(); await p.click('#app [data-act="pick"][data-k="1"]'); await next(); await p.click('#app [data-act="scale"][data-k="0"]'); await next();
  await p.evaluate(() => { const s = document.querySelector("#app .scroll"); s.scrollTop = 200; }); await shot("03-d3-pause-fit");
  await day(4); await start(); await toStep("boundary"); await p.click('#app [data-act="idea"]'); await next(); await p.click('#app [data-act="chk"][data-k="0"]');
  await p.evaluate(() => { const s = document.querySelector("#app .scroll"); s.scrollTop = s.scrollHeight; }); await shot("04-d4-boundary-check");
  await day(5); await start(); await shot("05-d5-opening"); await toStep("instead"); await p.click('#app [data-act="pick"]'); await p.evaluate(() => { const s = document.querySelector("#app .scroll"); s.scrollTop = s.scrollHeight; }); await shot("06-d5-pair");
  await day(7); await start(); await next(); await shot("07-d7-rule");
  await p.click('#app [data-act="pick"][data-x="0"]'); await next(); await next(); await next(); await shot("08-d7-close");
  await p.evaluate(() => { const s = document.querySelector("#app .scroll"); s.scrollTop = s.scrollHeight; }); await shot("09-d7-close-thread");
  await p.click('#app [data-act="finish"][data-s="1"]'); await shot("10-home-d7-done");
  await day(13); await start(); await shot("11-d13-opening");
  await day(14); await p.click('#app [data-act="tab"][data-i="1"]'); await shot("12-hilo");
  await go("en"); await day(9); await start(); await shot("13-en-d9-followup");
  await day(8); await shot("14-en-home-d8");
  await b.close();
})();
