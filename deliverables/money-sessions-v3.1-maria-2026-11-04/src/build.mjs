// Builds Elara_Dinero_V3.1_Lo_que_ve_ella.pdf from content.mjs.
// Usage: node src/build.mjs   (from the deliverable folder)
// Every page is a fixed A4 box; the build fails if any page overflows.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { meta, cover, visits, reviewSheet } from "./content.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..");
mkdirSync(join(out, "html"), { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const css = `
@page{size:A4;margin:0}
*{box-sizing:border-box}
:root{--paper:#faf7f2;--ink:#24211e;--green:#1d3d33;--rust:#b4552a;--muted:#6d6761;--card:#eceee6;--line:#dcd7cc;--screen:#fffdf9;--mint:#e7efe9}
html,body{margin:0;background:var(--paper);color:var(--ink);font-family:"DejaVu Sans",sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;background:var(--paper);break-after:page;page-break-after:always}
.page:last-child{break-after:auto;page-break-after:auto}
.brand{position:absolute;top:8mm;left:14.5mm;font-weight:700;font-size:6.8pt;letter-spacing:.06em;color:var(--green)}
.foot{position:absolute;bottom:7mm;left:14.5mm;right:14.5mm;border-top:.6pt solid var(--line);padding-top:1.8mm;font-size:6.4pt;color:var(--muted);display:flex;justify-content:space-between;letter-spacing:.02em}
.inner{position:absolute;top:15mm;left:14.5mm;right:14.5mm;bottom:15mm;overflow:hidden}
.eye{font-weight:700;font-size:7.4pt;letter-spacing:.05em;color:var(--rust);margin:0 0 1.6mm}
h1{font-family:"DejaVu Serif",Georgia,serif;font-weight:400;color:var(--green);font-size:20pt;line-height:1.18;margin:0 0 1.4mm}
h1.cover{font-size:25pt}
.purpose{color:var(--muted);font-size:9.4pt;line-height:1.38;margin:0 0 3mm}
h3{font-size:9pt;color:var(--green);margin:3.2mm 0 1.1mm;font-weight:700}
p{margin:0 0 1.4mm;font-size:8.5pt;line-height:1.42}
ul.ch{margin:0 0 1mm;padding-left:4.4mm}
ul.ch li{font-size:7.9pt;line-height:1.4;margin:0 0 .7mm}
table{border-collapse:collapse;width:100%;margin:2mm 0 2.5mm}
th{background:#ecefe6;text-align:left;font-weight:400;font-size:7.6pt;padding:2mm 2.4mm}
td{border-bottom:.6pt solid var(--line);font-size:7.6pt;padding:1.8mm 2.4mm;vertical-align:top;line-height:1.36}
td.blank{color:var(--muted)}
/* phone screens */
.pair{display:grid;grid-template-columns:1fr 1fr;gap:6mm;align-items:start}
.slab{font-weight:700;font-size:6.6pt;letter-spacing:.06em;color:var(--muted);margin:0 0 1.2mm;text-transform:uppercase}
.screen{background:var(--screen);border:.8pt solid #cdc6b8;border-radius:5mm;padding:4.4mm 4.2mm 4mm;box-shadow:0 .6mm 0 #e7e1d6}
.s-label{font-size:6.3pt;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:2.2mm 0 1mm;font-weight:700}
.s-label:first-child{margin-top:0}
.s-title{font-family:"DejaVu Serif",Georgia,serif;color:var(--green);font-size:13.2pt;line-height:1.22;margin:0 0 2mm}
.s-q{font-family:"DejaVu Serif",Georgia,serif;color:var(--green);font-size:10.2pt;line-height:1.34;margin:1.6mm 0 1.4mm}
.chips{display:flex;flex-wrap:wrap;gap:1.1mm;margin:0 0 1.2mm}
.chip{border:.6pt solid #c9c2b4;border-radius:3mm;padding:.7mm 2mm;font-size:7.5pt;background:#fff;line-height:1.3}
.chips.stack{flex-direction:column}
.chips.stack .chip{border-radius:2mm}
.s-p{font-size:8pt;line-height:1.44;margin:0 0 1.4mm}
.s-note{font-size:6.8pt;color:var(--muted);line-height:1.36;margin:.6mm 0 1mm;font-style:italic}
.s-rule{border-left:1.2mm solid var(--rust);background:#f3ece2;padding:1.8mm 2.4mm;margin:1.6mm 0 1.6mm;border-radius:0 1.6mm 1.6mm 0}
.s-rule .lab{font-weight:700;font-size:6pt;letter-spacing:.06em;color:var(--rust);text-transform:uppercase;margin-bottom:.6mm}
.s-rule .txt{font-family:"DejaVu Serif",Georgia,serif;color:var(--green);font-size:9.5pt;line-height:1.32}
.s-cards{display:flex;flex-direction:column;gap:1mm;margin:1mm 0 .6mm}
.s-card{background:var(--card);border-radius:1.6mm;padding:1.3mm 2mm;font-size:7.5pt;line-height:1.34}
.s-card b{color:var(--rust);margin-right:1.2mm}
.s-opt{border:.6pt solid #c9c2b4;border-radius:2mm;background:#fff;padding:1.4mm 2mm;margin:1.3mm 0 .5mm;font-size:8pt;font-weight:700;line-height:1.32}
.s-opt .ok{font-weight:400;color:var(--rust);font-size:6.3pt}
.s-reply{font-size:7.5pt;line-height:1.38;margin:0 0 .4mm 1.6mm;padding-left:2mm;border-left:.6pt solid var(--line)}
.s-reply i{color:var(--muted);font-style:normal;font-size:6.2pt;text-transform:uppercase;letter-spacing:.04em;margin-right:1mm}
.s-elara{background:var(--mint);border-radius:1.8mm;padding:1.5mm 2.2mm;margin:.9mm 0 1.2mm;font-size:7.9pt;line-height:1.4}
.s-elara .who{display:block;font-size:5.9pt;font-weight:700;letter-spacing:.06em;color:var(--green);text-transform:uppercase;margin-bottom:.4mm}
.s-when{border-left:.9pt dashed var(--rust);padding:.4mm 0 .2mm 2.2mm;margin:1.3mm 0 1.2mm}
.s-when .if{font-size:6.8pt;font-weight:700;color:var(--rust);margin-bottom:.6mm;line-height:1.3}
.s-buttons{display:flex;gap:1.4mm;flex-wrap:wrap;margin:1.6mm 0 1.2mm}
.s-btn{border-radius:3mm;padding:1mm 2.6mm;font-size:7.5pt;border:.6pt solid var(--green);color:var(--green)}
.s-btn:first-child{background:var(--green);color:#fff}
.s-next{font-size:7.6pt;font-weight:700;color:var(--green);margin-top:1.6mm}
.below{margin-top:4mm;display:grid;grid-template-columns:1fr 1fr;gap:6mm}
.below h3{margin-top:0}
.below p,.below li{font-size:7.6pt}
`;

const page = (n, body) =>
  `<section class="page"><div class="brand">${esc(meta.brand)}</div><div class="inner">${body}</div><div class="foot"><span>${esc(meta.footer)}</span><span>${n}</span></div></section>`;

function block(b) {
  switch (b.t) {
    case "label":
      return `<div class="s-label">${esc(b.x)}</div>`;
    case "title":
      return `<div class="s-title">${esc(b.x)}</div>`;
    case "q":
      return `<div class="s-q">${esc(b.x)}</div>`;
    case "chips":
      return `<div class="chips${b.stack ? " stack" : ""}">${b.x.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>`;
    case "p":
      return `<p class="s-p">${esc(b.x)}</p>`;
    case "note":
      return `<div class="s-note">Nota: ${esc(b.x)}</div>`;
    case "rule":
      return `<div class="s-rule"><div class="lab">${b.mine ? "Tu regla" : "La regla de hoy"}</div><div class="txt">${esc(b.x)}</div></div>`;
    case "cards":
      return `<div class="s-cards">${b.x.map(([h, t]) => `<div class="s-card"><b>${esc(h)}</b>${esc(t)}</div>`).join("")}</div>`;
    case "opt":
      return `<div class="s-opt">${esc(b.x)}${b.ok ? ` <span class="ok">(respuesta respaldada)</span>` : ""}</div><div class="s-reply"><i>Al tocar</i>${esc(b.r)}</div>`;
    case "elara":
      return `<div class="s-elara"><span class="who">Elara</span>${esc(b.x)}</div>`;
    case "buttons":
      return `<div class="s-buttons">${b.x.map((x) => `<span class="s-btn">${esc(x)}</span>`).join("")}</div>`;
    case "when":
      return `<div class="s-when"><div class="if">${esc(b.when)}</div>${b.b.map(block).join("")}</div>`;
    case "next":
      return `<div class="s-next">${esc(b.x)}</div>`;
    default:
      throw new Error(`unknown block ${b.t}`);
  }
}

const screen = (i, blocks) => `<div><div class="slab">Pantalla ${i} de 4</div><div class="screen">${blocks.map(block).join("")}</div></div>`;

function coverHtml() {
  const rows = cover.rows.map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`).join("");
  const secs = cover.sections
    .map(([h, t]) => `<h3>${esc(h)}</h3>` + (Array.isArray(t) ? `<ul class="ch">${t.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p style="font-size:7.9pt">${esc(t)}</p>`))
    .join("");
  return `<div class="eye">${esc(cover.eyebrow)}</div><h1 class="cover">${cover.title.map(esc).join("<br>")}</h1><p class="purpose">${esc(cover.sub)}</p>
  <table><tr>${cover.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows}</table>${secs}`;
}

function visitPages(v) {
  const head = `<div class="eye">VISITA ${v.n} DE 7 / MÓDULO ${esc(v.code)} DE V3</div><h1>${esc(v.title)}</h1><p class="purpose">${esc(v.purpose)}</p>`;
  const p1 = `${head}<div class="pair">${screen(1, v.s[0])}${screen(2, v.s[1])}</div>`;
  const p2 = `<div class="eye">VISITA ${v.n} DE 7 / PANTALLAS 3 Y 4</div><div class="pair" style="margin-top:2mm">${screen(3, v.s[2])}${screen(4, v.s[3])}</div>
  <div class="below"><div><h3>María: qué revisar</h3><p>${esc(v.review)}</p></div><div><h3>Qué cambió respecto a V3</h3><ul class="ch">${v.changes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div></div>`;
  return [p1, p2];
}

function reviewHtml() {
  const r = reviewSheet;
  const rows = r.rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td><td class="blank">______________________</td></tr>`).join("");
  return `<div class="eye">${esc(r.eyebrow)}</div><h1>${esc(r.title)}</h1><p class="purpose">${esc(r.sub)}</p>
  <table><tr>${r.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows}</table>
  <h3>${esc(r.decisionsTitle)}</h3><ul class="ch">${r.decisions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
  <h3>${esc(r.testTitle)}</h3><p>${esc(r.test)}</p>
  <h3>${esc(r.laterTitle)}</h3><p>${esc(r.later)}</p>`;
}

const bodies = [coverHtml(), ...visits.flatMap(visitPages), reviewHtml()];
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Elara · Dinero · V3.1 · Lo que ve ella</title><style>${css}</style></head><body>${bodies
  .map((b, i) => page(i + 1, b))
  .join("\n")}</body></html>`;

const name = "Elara_Dinero_V3.1_Lo_que_ve_ella";
const file = join(out, "html", `${name}.html`);
writeFileSync(file, html);

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await pg.goto("file://" + file);
await pg.emulateMedia({ media: "print" });
const fit = await pg.$$eval(".inner", (els) =>
  els.map((e, i) => ({
    page: i + 1,
    over: e.scrollHeight - e.clientHeight,
    room: e.clientHeight - [...e.children].reduce((m, c) => Math.max(m, c.offsetTop + c.offsetHeight), 0),
  })),
);
const bad = fit.filter((f) => f.over > 0);
for (const b of bad) console.log(`OVERFLOW p${b.page}: ${b.over}px`);
console.log(name, "pages:", fit.length, "room per page(px):", fit.map((f) => f.room).join(" "));
await pg.pdf({ path: join(out, `${name}.pdf`), format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
await browser.close();
if (bad.length) process.exit(1);
