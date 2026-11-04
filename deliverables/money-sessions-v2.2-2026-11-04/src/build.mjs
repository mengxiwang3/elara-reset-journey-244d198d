// Builds the V2.2 PDFs (Spanish, English) and the V2.1 review PDF.
// Usage: node src/build.mjs   (from the deliverable folder)
// Every page is a fixed A4 box; the build fails if any page overflows.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import * as es from "./content-es.mjs";
import * as en from "./content-en.mjs";
import { review } from "./review.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..");
const htmlDir = join(out, "html");
mkdirSync(htmlDir, { recursive: true });

// ── parity: the two editions must have the same shape ─────────────────────
function shape(v, path = "") {
  if (Array.isArray(v)) return `[${v.length}:${v.map((x, i) => shape(x, `${path}[${i}]`)).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).sort().map((k) => `${k}:${shape(v[k], `${path}.${k}`)}`).join(",")}}`;
  return v === null ? "null" : typeof v;
}
for (const key of ["cover", "common", "sessions", "reviewPage", "testPage", "sourcesPage"]) {
  if (shape(es[key]) !== shape(en[key])) throw new Error(`ES and EN differ in shape: ${key}`);
}
if (shape(es.labels) !== shape(en.labels)) throw new Error("ES and EN labels differ in shape");

// ── html ──────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const L = (i) => String.fromCharCode(65 + i);

const css = `
@page{size:A4;margin:0}
*{box-sizing:border-box}
:root{--paper:#faf7f2;--ink:#24211e;--green:#1d3d33;--rust:#b4552a;--muted:#6d6761;--card:#eceee6;--line:#dcd7cc}
html,body{margin:0;background:var(--paper);color:var(--ink);font-family:"DejaVu Sans",sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;background:var(--paper);break-after:page;page-break-after:always}
.page:last-child{break-after:auto;page-break-after:auto}
.brand{position:absolute;top:8mm;left:14.5mm;font-weight:700;font-size:6.8pt;letter-spacing:.06em;color:var(--green)}
.foot{position:absolute;bottom:7mm;left:14.5mm;right:14.5mm;border-top:.6pt solid var(--line);padding-top:1.8mm;font-size:6.4pt;color:var(--muted);display:flex;justify-content:space-between;letter-spacing:.02em}
.inner{position:absolute;top:17mm;left:16.5mm;right:16.5mm;bottom:17mm;overflow:hidden}
.eye{font-weight:700;font-size:7.6pt;letter-spacing:.05em;color:var(--rust);margin:0 0 2.2mm}
h1{font-family:"DejaVu Serif",Georgia,serif;font-weight:400;color:var(--green);font-size:23pt;line-height:1.18;margin:0 0 2mm}
h1.cover{font-size:25pt}
.goal{color:var(--muted);font-size:10.6pt;line-height:1.38;margin:0 0 1.6mm}
.meta{color:var(--muted);font-size:7pt;margin:0 0 3mm}
h3{font-size:9pt;color:var(--green);margin:3.4mm 0 1.1mm;font-weight:700}
p{margin:0 0 1.4mm;font-size:8.5pt;line-height:1.42}
.q{font-family:"DejaVu Serif",Georgia,serif;color:var(--green);font-size:12pt;line-height:1.35;margin:0 0 1.6mm}
.chips{display:flex;flex-wrap:wrap;gap:1.2mm;margin:0 0 1.4mm}
.chip{border:.6pt solid var(--line);border-radius:3mm;padding:.6mm 2.2mm;font-size:7.4pt;background:#fff8}
.small{font-size:7.3pt;color:var(--muted);line-height:1.38}
.otherline{font-size:7.6pt;line-height:1.38;margin:0 0 1mm}
.otherline b{color:var(--green)}
.cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:3mm;margin:2.2mm 0 1mm}
.card{background:var(--card);border-radius:2.4mm;padding:3mm 3.2mm;min-height:19mm}
.card .h{color:var(--rust);font-weight:700;font-size:7.6pt;margin-bottom:1.6mm}
.card .t{font-size:7.6pt;line-height:1.38}
.opt{margin:0 0 1.5mm}
.opt .o{font-weight:700;font-size:8.2pt;line-height:1.35}
.opt .ok{font-weight:400;color:var(--rust);font-size:7.4pt}
.opt .r{font-size:7.9pt;line-height:1.38}
.branch{font-size:7.9pt;line-height:1.4;margin:0 0 1.2mm}
.branch b{color:var(--ink)}
.rule{border-left:1.4mm solid var(--rust);background:#f3ece2;padding:2.6mm 3.4mm;margin:1.4mm 0 1.8mm;border-radius:0 2mm 2mm 0}
.rule .lab{font-weight:700;font-size:7.2pt;letter-spacing:.05em;color:var(--rust);text-transform:uppercase;margin-bottom:1mm}
.rule .txt{font-family:"DejaVu Serif",Georgia,serif;color:var(--green);font-size:11.2pt;line-height:1.35}
.kv{font-size:8pt;line-height:1.4;margin:0 0 1mm}
.kv b{color:var(--green)}
ul.ch{margin:0 0 1mm;padding-left:4.4mm}
ul.ch li{font-size:7.8pt;line-height:1.38;margin:0 0 .6mm}
.adv{border:.6pt solid var(--line);border-radius:2.4mm;padding:2.6mm 3.2mm;margin:1mm 0 1.6mm;background:#fff6}
.adv .t{font-weight:700;color:var(--green);font-size:8.4pt;margin-bottom:1mm}
table{border-collapse:collapse;width:100%;margin:2mm 0 2.5mm}
th{background:#ecefe6;text-align:left;font-weight:400;font-size:7.6pt;padding:2mm 2.4mm;color:var(--ink)}
td{border-bottom:.6pt solid var(--line);font-size:7.6pt;padding:1.9mm 2.4mm;vertical-align:top;line-height:1.36}
td.blank{color:var(--muted)}
.lede{font-size:9.6pt;line-height:1.45;margin:0 0 2mm}
.hook{font-family:"DejaVu Serif",Georgia,serif;color:var(--green);font-size:13pt;line-height:1.35;margin:3mm 0 2mm}
.src{margin:0 0 2.2mm}
.src .h{font-weight:700;font-size:7.8pt;color:var(--green)}
.src .t{font-size:7.6pt;line-height:1.38}
.src a{font-size:6.8pt;color:var(--green)}
.score{font-family:"DejaVu Serif",Georgia,serif;font-size:11pt;color:var(--green)}
`;

const page = (brand, footer, n, body) =>
  `<section class="page"><div class="brand">${esc(brand)}</div><div class="inner">${body}</div><div class="foot"><span>${esc(footer)}</span><span>${n}</span></div></section>`;

function coverPage(c, l) {
  const rows = c.rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("");
  const secs = c.sections
    .map(([h, t]) => `<h3>${esc(h)}</h3>` + (Array.isArray(t) ? `<ul class="ch">${t.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p>${esc(t)}</p>`))
    .join("");
  return `<div class="eye">${esc(c.eyebrow)}</div><h1 class="cover">${c.title.map(esc).join("<br>")}</h1><p class="goal">${esc(c.sub)}</p>
  <div class="hook">${esc(c.hook)}</div><p>${esc(c.length)}</p>
  <table><tr>${c.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows}</table>${secs}`;
}

function commonPage(c) {
  return `<div class="eye">${esc(c.eyebrow)}</div><h1>${esc(c.title)}</h1><p class="goal">${esc(c.sub)}</p>
  ${c.sections.map(([h, t]) => `<h3>${esc(h)}</h3><p>${esc(t)}</p>`).join("")}<p class="small" style="margin-top:2mm">${esc(c.foot)}</p>`;
}

function sessionA(s, l) {
  const e = s.entry;
  const label = s.check.kind === "check" ? l.check : s.check.kind === "explore" ? l.explore : l.steps;
  const opts = s.check.options
    .map(([o, r, ok], i) =>
      s.check.kind === "steps"
        ? `<div class="opt"><div class="o">${esc(o)}</div><div class="r">${esc(r)}</div></div>`
        : `<div class="opt"><div class="o">${L(i)}. ${esc(o)}${ok ? ` <span class="ok">[${esc(l.supported)}]</span>` : ""}</div><div class="r">${esc(r)}</div></div>`,
    )
    .join("");
  const note = s.check.kind === "check" ? l.checkNote : s.check.kind === "explore" ? l.exploreNote : "";
  return `<div class="eye">MONEY-PILOT-${s.n} / V2.2 / ${esc(s.tag)}</div><h1>${s.n}. ${esc(s.title)}</h1>
  <p class="goal">${esc(s.goal)}</p><p class="meta">${esc(s.meta)}</p>
  <h3>${esc(l.entry)}</h3><div class="q">${esc(e.q)}</div>
  <div class="chips">${e.options.map((o) => `<span class="chip">${esc(o)}</span>`).join("")}</div>
  <p class="small">${esc(e.extra)}</p>
  ${e.other ? `<p class="otherline"><b>${esc(l.other)}</b> ${esc(e.other)}</p>` : ""}
  <h3>${esc(l.listen)}</h3><p>${esc(s.script)}</p>
  <div class="cards">${s.cards.map(([h, t]) => `<div class="card"><div class="h">${esc(h)}</div><div class="t">${esc(t)}</div></div>`).join("")}</div>
  <h3>${esc(label)}</h3><p>${esc(s.check.prompt)}</p>${opts}${note ? `<p class="small">${esc(note)}</p>` : ""}`;
}

function sessionB(s, l) {
  const adv = s.advanced
    ? `<div class="adv"><div class="t">${esc(s.advanced.title)}</div><p class="r" style="font-size:7.9pt">${esc(s.advanced.text)}</p>${s.advanced.options
        .map(([o, r]) => `<div class="branch"><b>${esc(o)}.</b> ${esc(r)}</div>`)
        .join("")}</div>`
    : "";
  return `<div class="eye">MONEY-PILOT-${s.n} / V2.2 / ${esc(l.connEyebrow)}</div><h1>${esc(l.connTitle)}</h1>
  <h3>${esc(l.apply)}</h3><p>${esc(s.apply)}</p>${adv}
  <h3>${esc(l.deeper)}</h3>${s.branches.map(([b, t]) => `<div class="branch"><b>${esc(b)}.</b> ${esc(t)}</div>`).join("")}
  <h3>${esc(l.close)}</h3>
  <div class="rule"><div class="lab">${esc(l.rule)}</div><div class="txt">${esc(s.rule)}</div></div>
  <p class="kv"><b>${esc(l.keep)}:</b> ${esc(s.keep)}</p>
  <p class="kv"><b>${esc(l.tomorrow)}:</b> ${esc(s.tomorrow)}</p>
  <h3>${esc(l.ifBack)}</h3><p>${esc(s.ifBack)}</p>
  <h3>${esc(l.media)}</h3><p>${esc(s.media)}</p>
  <h3>${esc(l.changed)}</h3><ul class="ch">${s.changed.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
  <h3>${esc(l.review)}</h3><p>${esc(s.review)}</p><p class="small">${esc(s.sources)}</p>`;
}

function reviewPageHtml(r) {
  const rows = r.rows.map(([n, q]) => `<tr><td>${esc(n)}</td><td>${esc(q)}</td><td class="blank">____________</td></tr>`).join("");
  const words = r.words.map((w) => `<tr>${w.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`).join("");
  return `<div class="eye">${esc(r.eyebrow)}</div><h1>${esc(r.title)}</h1><p class="goal">${esc(r.sub)}</p>
  <table><tr>${r.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows}</table>
  <h3>${esc(r.wordsTitle)}</h3><table><tr>${r.wordsHead.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${words}</table>
  <h3>${esc(r.lang[0])}</h3><p>${esc(r.lang[1])}</p>`;
}

function testPageHtml(t) {
  return `<div class="eye">${esc(t.eyebrow)}</div><h1>${esc(t.title)}</h1>${t.sections.map(([h, x]) => `<h3>${esc(h)}</h3><p>${esc(x)}</p>`).join("")}`;
}

function sourcesPageHtml(s) {
  return `<div class="eye">${esc(s.eyebrow)}</div><h1>${esc(s.title)}</h1><p class="goal" style="font-size:9.4pt">${esc(s.sub)}</p>
  ${s.items.map(([h, t, u]) => `<div class="src"><div class="h">${esc(h)}</div><div class="t">${esc(t)}</div>${u ? `<a href="${esc(u)}">${esc(u)}</a>` : ""}</div>`).join("")}
  <h3>${esc(s.numbersTitle)}</h3><p style="font-size:7.8pt">${esc(s.numbers)}</p>
  <h3>${esc(s.missingTitle)}</h3><p style="font-size:7.8pt">${esc(s.missing)}</p>`;
}

function buildPageHtml(b) {
  const rows = b.rows.map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`).join("");
  return `<div class="eye">${esc(b.eyebrow)}</div><h1>${esc(b.title)}</h1><p class="goal" style="font-size:9.4pt">${esc(b.sub)}</p>
  <table><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows}</table>
  <ul class="ch">${b.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`;
}

function edition(c, withBuild) {
  const l = c.labels;
  const bodies = [coverPage(c.cover, l), commonPage(c.common)];
  for (const s of c.sessions) bodies.push(sessionA(s, l), sessionB(s, l));
  bodies.push(reviewPageHtml(c.reviewPage), testPageHtml(c.testPage), sourcesPageHtml(c.sourcesPage));
  if (withBuild) bodies.push(buildPageHtml(c.buildPage));
  const pages = bodies.map((b, i) => page(l.brand, l.footer, i + 1, b)).join("\n");
  const title = l.lang === "es" ? "Elara · Dinero · V2.2" : "Elara · Money · V2.2";
  return `<!doctype html><html lang="${l.lang}"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${pages}</body></html>`;
}

function reviewDoc(r) {
  const rows = r.rows
    .map(([n, s, sc, p, f]) => `<tr><td>${esc(n)}</td><td>${esc(s)}</td><td class="score">${esc(sc)}</td><td>${esc(p)}</td><td>${esc(f)}</td></tr>`)
    .join("");
  const p1 = `<div class="eye">${esc(r.eyebrow)}</div><h1 class="cover">${esc(r.title)}</h1><p class="lede">${esc(r.lede)}</p>
  <table><tr>${r.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows}</table>
  <h3>${esc(r.crossTitle)}</h3><table><tr>${r.crossHead.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${r.cross
    .map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`)
    .join("")}</table>`;
  const p2 = `<div class="eye">${esc(r.eyebrow)}</div><h1>What to do with it</h1>
  <h3>${esc(r.buildTitle)}</h3><p>${esc(r.build)}</p>
  <h3>${esc(r.mariaTitle)}</h3><ul class="ch">${r.maria.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
  <h3>${esc(r.testTitle)}</h3><p>${esc(r.test)}</p>
  <h3>${esc(r.limitsTitle)}</h3><ul class="ch">${r.limits.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const pages = [p1, p2].map((b, i) => page(r.brand, r.footer, i + 1, b)).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Elara · Money V2.1 review</title><style>${css}</style></head><body>${pages}</body></html>`;
}

const docs = [
  ["Elara_Dinero_V2.2_ES", edition(es, false)],
  ["Elara_Money_V2.2_EN", edition(en, true)],
  ["Elara_Money_V2.1_Review", reviewDoc(review)],
];

// ── render, check overflow, print ─────────────────────────────────────────
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 } });
let bad = 0;
for (const [name, html] of docs) {
  const file = join(htmlDir, `${name}.html`);
  writeFileSync(file, html);
  const pg = await ctx.newPage();
  await pg.goto("file://" + file);
  await pg.emulateMedia({ media: "print" });
  const over = await pg.$$eval(".inner", (els) =>
    els.map((e, i) => ({ page: i + 1, over: e.scrollHeight - e.clientHeight, room: e.clientHeight - [...e.children].reduce((m, c) => Math.max(m, c.offsetTop + c.offsetHeight), 0) })),
  );
  for (const o of over) {
    if (o.over > 0) {
      bad++;
      console.log(`OVERFLOW ${name} p${o.page}: ${o.over}px`);
    }
  }
  console.log(name, "pages:", over.length, "tightest room(px):", Math.min(...over.map((o) => o.room)));
  await pg.pdf({ path: join(out, `${name}.pdf`), format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
  await pg.close();
}
await browser.close();
if (bad) {
  console.log(`${bad} page(s) overflow`);
  process.exit(1);
}
