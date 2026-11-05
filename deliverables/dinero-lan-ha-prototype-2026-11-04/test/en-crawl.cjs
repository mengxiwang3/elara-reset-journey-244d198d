// English crawl: opens #en, visits every screen and clicks around at random, lists text that still looks Spanish.
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const dir = path.resolve(process.argv[2]), out = path.resolve(process.argv[3]); const N = +(process.argv[4] || 1500);
const page0 = fs.readFileSync(path.join(dir, "index.html"), "utf8");
fs.writeFileSync(path.join(dir, "_test.html"), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + page0 + "</body></html>");
const SP = /[áéíóúñ¿¡]|\b(de|la|el|que|es|tu|tus|para|con|los|las|una|del|por|sin|qué|cómo|día|hoy|mañana|ver|ya|lo|se|te|mi|antes|después|semana|dinero|pago|cuenta|deuda)\b/i;
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto("file://" + path.join(dir, "_test.html") + "#en");
  await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem("elara-lang", "en"); } catch (e) {} });
  await p.reload(); await p.waitForTimeout(600);
  const seen = new Map();
  async function grab(where) {
    const t = await p.evaluate(() => { const r = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let n; while ((n = w.nextNode())) { if (n.nodeType === 3) { const pn = n.parentNode; if (pn.closest && pn.closest("script,style,[data-noi18n]")) continue; const v = n.nodeValue.trim(); if (v) r.push(v); } else ["aria-label", "placeholder", "title", "alt"].forEach((a) => { const v = n.getAttribute(a); if (v && !n.closest("[data-noi18n]")) r.push(v.trim()); }); } return r; });
    t.forEach((s) => { if (SP.test(s) && !seen.has(s)) seen.set(s, where); });
  }
  await grab("home");
  await p.click("#tabAll"); for (let d = 1; d <= 7; d++) { await p.click('[data-all="' + d + '"]'); await p.waitForTimeout(150); await grab("all:" + d); }
  await p.click("#tabRev"); await p.waitForTimeout(300); await grab("rev");
  await p.click("#tabTry"); await p.waitForTimeout(200);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < N; i++) {
    const els = await p.$$("#app button:visible, #app summary:visible, #app [data-act]:visible");
    if (!els.length) break;
    const e = els[Math.floor(rnd() * els.length)];
    const txt = ((await e.textContent()) || "").trim();
    if (/Restart|Reiniciar/.test(txt)) continue;
    try { await e.click({ timeout: 800 }); } catch (x) {}
    if (i % 3 === 0) await grab("try:" + i);
    if (i % 400 === 399) { await p.evaluate(() => { try { Object.keys(localStorage).filter((k) => /arashiyama/.test(k)).forEach((k) => localStorage.setItem(k, "")); } catch (e) {} }); await p.reload(); await p.waitForTimeout(400); }
  }
  await grab("end");
  const list = [...seen.entries()].map(([s, w]) => ({ s, w }));
  fs.writeFileSync(path.join(out, "en-left.json"), JSON.stringify(list, null, 1));
  console.log("errors:", errs.length, errs.slice(0, 3)); console.log("leftover:", list.length);
  await b.close();
})();
