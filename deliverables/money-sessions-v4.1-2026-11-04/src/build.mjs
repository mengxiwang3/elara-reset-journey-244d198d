// Builds the V4.1 PDFs (Spanish source for María, English for the team).
// Usage: node src/build.mjs   (from the deliverable folder)
// Fails if: the editions differ in shape, a page overflows, an example sum is wrong,
// or a day's «Mañana» / «Ayer viste» / day-7 list doesn't match the neighbouring days.

import { writeFileSync, mkdtempSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import * as es from "./content-es.mjs";
import * as en from "./content-en.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..");
const tmp = mkdtempSync(join(tmpdir(), "elara-v41-"));

// ── checks before rendering ───────────────────────────────────────────────
function shape(v) {
  if (Array.isArray(v)) return `[${v.length}:${v.map(shape).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).sort().map((k) => `${k}:${k === "mark" || (k === "ok" && typeof v[k] === "boolean") ? v[k] : shape(v[k])}`).join(",")}}`;
  return v === null ? "null" : typeof v;
}
for (const key of ["ui", "cover", "changes", "days", "notes"]) {
  if (shape(es[key]) !== shape(en[key])) throw new Error(`ES and EN differ in shape: ${key}`);
}
const T = (v) => (v == null ? null : typeof v === "string" ? { x: v } : v);
for (const ed of [es, en]) {
  const d = ed.days;
  for (let i = 0; i < 6; i++) {
    if (T(d[i].next).x !== T(d[i + 1].title).x) throw new Error(`${ed.ui.lang} day ${i + 1}: «next» doesn't match day ${i + 2}'s title`);
    if (d[i + 1].yesterday !== d[i].rule) throw new Error(`${ed.ui.lang} day ${i + 2}: «yesterday» doesn't repeat day ${i + 1}'s rule`);
    if (d[6].rules.list[i] !== d[i].rule) throw new Error(`${ed.ui.lang} day 7 list: rule ${i + 1} differs from day ${i + 1}`);
    if (d[i].check.opts.filter((o) => o.ok).length !== 1) throw new Error(`${ed.ui.lang} day ${i + 1}: check needs exactly one expected answer`);
  }
}
// sums used in the examples and checks (same numbers in both editions)
const sums = [
  [300 - 180, 120], [120 - 170, -50],                // day 1 example
  [200 - 100, 100], [150 - 100, 50],                 // day 3 example
  [200 + 15 - 40, 175], [200 - 175, 25],             // day 4 check
  [100 + 10 - 20, 90], [100 - 90, 10],               // day 4 example
  [2 / 0.8, 2.5], [1000 - 800, 200],                 // day 5 check (per kg, grams)
  [Math.round(100 * 1.1), 110], [Math.round(110 * 0.1), 11], [110 + 11, 121], // day 5 example
];
sums.forEach(([got, want], i) => { if (Math.abs(got - want) > 1e-9) throw new Error(`sum ${i} is wrong: ${got} ≠ ${want}`); });

// ── rendering ─────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const css = `
@page{size:A4;margin:0}
*{box-sizing:border-box}
:root{--ink:#26302f;--teal:#1d4650;--muted:#66706f;--box:#e9efee;--line:#cfd6d5;--new:#1f6f5c;--chg:#9a5a12}
html,body{margin:0;background:#fff;color:var(--ink);font-family:"DejaVu Sans",sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;break-after:page;page-break-after:always}
.page:last-child{break-after:auto;page-break-after:auto}
.inner{position:absolute;top:15mm;left:17mm;right:17mm;bottom:17mm;overflow:hidden}
.foot{position:absolute;bottom:8mm;left:15mm;right:15mm;border-top:.6pt solid var(--line);padding-top:1.8mm;font-size:6.6pt;color:var(--muted);display:flex;justify-content:space-between;letter-spacing:.03em}
.eye{font-weight:700;font-size:7.2pt;letter-spacing:.05em;color:var(--muted);margin:0 0 2mm}
h1{font-size:21pt;line-height:1.15;color:var(--teal);margin:0 0 2.4mm;font-weight:700}
h1.cover{font-size:24pt}
.purpose{font-weight:700;font-size:10.4pt;color:var(--teal);margin:0 0 1.6mm;line-height:1.35}
.yest{font-size:7.6pt;color:var(--muted);margin:0 0 2.6mm}
.lab{font-weight:700;font-size:7.2pt;letter-spacing:.05em;color:var(--muted);margin:3.4mm 0 1.4mm;text-transform:uppercase}
p{margin:0 0 1.6mm;font-size:9.3pt;line-height:1.42}
.q{font-size:9.3pt;margin:0 0 2mm}
h3{font-size:10.2pt;color:var(--teal);margin:2.6mm 0 .9mm;font-weight:700;line-height:1.3}
.small{font-size:7.6pt;color:var(--muted);line-height:1.4}
.rule{background:var(--box);margin:1.6mm -3.4mm 2mm;padding:3mm 3.4mm;font-weight:700;color:var(--teal);font-size:10.4pt;line-height:1.35}
.check{border:.8pt solid var(--line);border-radius:2mm;padding:2.6mm 3.4mm 1.6mm;margin:3mm 0 1mm}
.check .lab{margin-top:0}
.check h3{font-size:9.4pt;margin-top:1.8mm}
.ok{font-weight:400;font-size:7pt;color:var(--muted);letter-spacing:.02em}
.tag{display:inline-block;font-size:6.2pt;font-weight:700;letter-spacing:.06em;border-radius:1mm;padding:.3mm 1.2mm;margin:0 0 0 1.4mm;vertical-align:.25em;color:#fff}
.tag.new{background:var(--new)}
.tag.changed{background:var(--chg)}
ol.route{margin:0 0 2mm;padding-left:5mm}
ol.route li{font-size:9.6pt;line-height:1.5;margin:0 0 1.4mm}
ol.rules{margin:0 0 2mm;padding-left:5mm}
ol.rules li{font-size:8.2pt;line-height:1.45;color:var(--ink);margin:0 0 .6mm}
.chg{margin:0 0 3mm}
.chg h3{margin:2.8mm 0 .8mm}
ul.dec{margin:0;padding-left:5mm}
ul.dec li{font-size:9pt;line-height:1.45;margin:0 0 1.2mm}
.src{font-size:7pt;color:var(--muted);margin:0 0 1mm;line-height:1.35;word-break:break-all}
.src b{color:var(--ink);font-weight:400}
`;

const tag = (ed, m) => (m ? `<span class="tag ${m}">${esc(ed.ui.tags[m])}</span>` : "");
const txt = (ed, v) => { const o = T(v); return o ? esc(o.x) + tag(ed, o.mark) : ""; };
const opts = (ed, list, check = false) =>
  list.map((o) => `<h3>${esc(o.t)}${o.ok ? ` <span class="ok">· ${esc(ed.ui.ok)}</span>` : ""}${tag(ed, o.mark)}</h3><p>${esc(ed.ui.ifTap)} ${esc(o.r)}</p>`).join("");
const foot = (ed, n) => `<div class="foot"><span>${esc(ed.ui.footer)}</span><span>${n}</span></div>`;
const page = (ed, n, body) => `<section class="page"><div class="inner">${body}</div>${foot(ed, n)}</section>`;

function checkBlock(ed, d) {
  if (!d.check) return `<p class="small">${esc(ed.ui.noCheck)}</p>`;
  return `<div class="check"><div class="lab">${esc(ed.ui.check)}${tag(ed, "new")}</div><p class="q">${esc(d.check.q)}</p>${opts(ed, d.check.opts, true)}<p class="small">${esc(ed.ui.checkHint)}</p></div>`;
}

function dayPages(ed, d, nA, checkOnA) {
  const a = `
    <div class="eye">${esc(ed.ui.dayEye(d.n, "1-2"))}</div>
    <h1>${txt(ed, d.title)}</h1>
    <div class="purpose">${esc(d.purpose)}</div>
    ${d.yesterday ? `<div class="yest">${esc(ed.ui.yesterday)} ${esc(d.yesterday)}</div>` : ""}
    <div class="lab">${esc(ed.ui.s1)}</div>
    <p class="q">${esc(d.s1.q)}</p>
    ${opts(ed, d.s1.opts)}
    <p class="small">${d.s1.pass ? txt(ed, d.s1.pass) : esc(ed.ui.pass)}</p>
    <div class="lab">${esc(ed.ui.s2)}</div>
    <p>${txt(ed, d.idea)}</p>
    <div class="rule">${esc(d.rule)}</div>
    ${checkOnA ? checkBlock(ed, d) : ""}`;
  const b = `
    <div class="eye">${esc(ed.ui.dayEye(d.n, "3-4"))}</div>
    <h1>${txt(ed, d.title)}</h1>
    ${checkOnA ? "" : checkBlock(ed, d)}
    <div class="lab">${esc(ed.ui.s3)}</div>
    <p class="q">${txt(ed, d.s3.q)}</p>
    ${opts(ed, d.s3.opts)}
    <div class="lab">${esc(ed.ui.note)}</div>
    <p>${txt(ed, d.note)}</p>
    <p class="small">${esc(ed.ui.noteHint)}</p>
    ${d.example ? `<div class="lab">${esc(ed.ui.example)}</div><p>${txt(ed, d.example)}</p>` : ""}
    ${d.rules ? `<div class="lab">${esc(ed.ui.rulesList)}</div><p>${esc(d.rules.intro)}</p><ol class="rules">${d.rules.list.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>` : ""}
    <div class="lab">${esc(ed.ui.s4)}</div>
    <p>${txt(ed, d.take)}</p>
    <div class="rule">${esc(d.rule)}</div>
    <p>${txt(ed, d.tryLine)}</p>
    <p class="small">${esc(ed.ui.actions)}</p>
    ${d.next ? `<p class="small">${esc(ed.ui.tomorrow)} ${txt(ed, d.next)}</p>` : ""}`;
  return [page(ed, nA, a), page(ed, nA + 1, b)];
}

function html(ed, placement) {
  const c = ed.cover, ch = ed.changes, nt = ed.notes;
  const pages = [];
  pages.push(page(ed, 1, `
    <div class="eye">${esc(c.eyebrow)}</div>
    <h1 class="cover">${esc(c.title)}</h1>
    <div class="purpose" style="font-size:12pt;margin-bottom:2.4mm">${esc(c.sub)}</div>
    <p>${esc(c.intro)}</p>
    <div class="lab">${esc(c.rhythmLabel)}</div><p>${esc(c.rhythm)}</p>
    <h3 style="font-size:12pt;margin-top:4mm">${esc(c.routeLabel)}</h3>
    <ol class="route">${ed.days.map((d) => `<li>${txt(ed, d.title)}</li>`).join("")}</ol>
    <h3 style="font-size:12pt;margin-top:4mm">${esc(c.howLabel)}</h3>
    <p>${esc(c.how)}</p>
    <p class="small" style="margin-top:3mm">${esc(c.small)}</p>`));
  pages.push(page(ed, 2, `
    <h1>${esc(ch.title)}</h1>
    <p>${esc(ch.intro)}</p>
    ${ch.items.map(([h, p], i) => `<div class="chg"><h3>${i + 1}. ${esc(h)}</h3><p>${esc(p)}</p></div>`).join("")}
    <h3 style="font-size:12pt;margin-top:4mm">${esc(ch.decideLabel)}</h3>
    <ul class="dec">${ch.decide.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`));
  ed.days.forEach((d, i) => pages.push(...dayPages(ed, d, 3 + i * 2, placement[i])));
  pages.push(page(ed, 3 + ed.days.length * 2, `
    <h1>${esc(nt.title)}</h1>
    ${nt.sections.map(([h, p]) => `<div class="lab">${esc(h)}</div><p>${esc(p)}</p>`).join("")}
    <div class="lab" style="margin-top:4mm">${esc(nt.sourcesLabel)}</div>
    ${nt.sources.map(([n, u]) => `<div class="src"><b>${esc(n)}</b> · ${esc(u)}</div>`).join("")}`));
  return `<!doctype html><html lang="${ed.ui.lang}"><head><meta charset="utf-8"><style>${css}</style></head><body>${pages.join("")}</body></html>`;
}

async function measure(pg, file) {
  await pg.goto("file://" + file);
  await pg.evaluate(() => document.fonts.ready);
  return pg.$$eval(".page .inner", (els) => els.map((e, i) => ({ page: i + 1, over: e.scrollHeight - e.clientHeight })));
}

const browser = await chromium.launch();
const pg = await browser.newPage();
for (const [ed, name] of [[es, "Elara_Dinero_V4.1_ES"], [en, "Elara_Money_V4.1_EN"]]) {
  // put each day's check on page A (after the idea) when it fits, otherwise at the top of page B
  const placement = ed.days.map(() => true);
  let file = join(tmp, `${name}.html`);
  writeFileSync(file, html(ed, placement));
  let m = await measure(pg, file);
  ed.days.forEach((d, i) => { if (m[2 + i * 2].over > 0) placement[i] = false; });
  writeFileSync(file, html(ed, placement));
  m = await measure(pg, file);
  const over = m.filter((p) => p.over > 0);
  if (over.length) throw new Error(`${name}: overflow on page(s) ${over.map((p) => `${p.page} (+${p.over}px)`).join(", ")}`);
  await pg.pdf({ path: join(out, `${name}.pdf`), format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
  console.log(`${name}.pdf · ${m.length} pages · check after the idea on days ${placement.map((p, i) => (p ? i + 1 : null)).filter(Boolean).join(", ") || "none"}; at the top of page B on days ${placement.map((p, i) => (p ? null : i + 1)).filter(Boolean).join(", ") || "none"}`);
}
await browser.close();
