// Builds the V3.2 screens PDFs (Spanish for María, English for the team).
// Usage: node src/build.mjs   (from the deliverable folder)
// Fails if the two editions differ in shape or any page overflows.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import * as es from "./content-es.mjs";
import * as en from "./content-en.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..");
mkdirSync(join(out, "html"), { recursive: true });

// ── parity ────────────────────────────────────────────────────────────────
function shape(v) {
  if (Array.isArray(v)) return `[${v.length}:${v.map(shape).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).sort().map((k) => `${k}:${k === "t" ? v[k] : shape(v[k])}`).join(",")}}`;
  return v === null ? "null" : typeof v;
}
for (const key of ["ui", "cover", "days", "sheet"]) {
  if (shape(es[key]) !== shape(en[key])) throw new Error(`ES and EN differ in shape: ${key}`);
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const css = `
@page{size:A4;margin:0}
*{box-sizing:border-box}
:root{--paper:#faf7f2;--ink:#24211e;--green:#1d3d33;--rust:#b4552a;--muted:#6d6761;--card:#eceee6;--line:#dcd7cc;--screen:#fffdf9;--mint:#e7efe9;--sun:#f6efdc}
html,body{margin:0;background:var(--paper);color:var(--ink);font-family:"DejaVu Sans",sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;background:var(--paper);break-after:page;page-break-after:always}
.page:last-child{break-after:auto;page-break-after:auto}
.brand{position:absolute;top:8mm;left:14.5mm;font-weight:700;font-size:6.8pt;letter-spacing:.06em;color:var(--green)}
.foot{position:absolute;bottom:7mm;left:14.5mm;right:14.5mm;border-top:.6pt solid var(--line);padding-top:1.8mm;font-size:6.4pt;color:var(--muted);display:flex;justify-content:space-between;letter-spacing:.02em}
.inner{position:absolute;top:15mm;left:14.5mm;right:14.5mm;bottom:15mm;overflow:hidden}
.eye{font-weight:700;font-size:7.4pt;letter-spacing:.05em;color:var(--rust);margin:0 0 1.6mm}
h1{font-family:"DejaVu Serif",Georgia,serif;font-weight:400;color:var(--green);font-size:20pt;line-height:1.18;margin:0 0 1.4mm}
h1.cover{font-size:24pt}
.purpose{color:var(--muted);font-size:9.4pt;line-height:1.38;margin:0 0 3mm}
h3{font-size:9pt;color:var(--green);margin:3.2mm 0 1.1mm;font-weight:700}
p{margin:0 0 1.4mm;font-size:8.5pt;line-height:1.42}
ul.ch{margin:0 0 1mm;padding-left:4.4mm}
ul.ch li{font-size:7.9pt;line-height:1.4;margin:0 0 .7mm}
table{border-collapse:collapse;width:100%;margin:2mm 0 2.5mm}
th{background:#ecefe6;text-align:left;font-weight:400;font-size:7.6pt;padding:2mm 2.4mm}
td{border-bottom:.6pt solid var(--line);font-size:7.6pt;padding:1.8mm 2.4mm;vertical-align:top;line-height:1.36}
td.blank{color:var(--muted)}
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
.s-try{background:var(--sun);border-radius:1.8mm;padding:1.5mm 2.2mm;margin:1mm 0 1.2mm;font-size:7.7pt;line-height:1.4}
.s-try .who{display:block;font-size:5.9pt;font-weight:700;letter-spacing:.06em;color:#8a5a12;text-transform:uppercase;margin-bottom:.4mm}
.s-field{margin:1.2mm 0 1mm}
.s-field .fl{font-size:6.6pt;font-weight:700;color:var(--green);margin-bottom:.6mm}
.s-field .box{border:.6pt solid #b9b1a2;border-radius:1.6mm;background:#fff;padding:1.4mm 2mm;font-size:7.6pt;line-height:1.36;min-height:7mm}
.s-field .box.ph{color:#9a938b}
.below{margin-top:4mm;display:grid;grid-template-columns:1fr 1fr;gap:6mm}
.below h3{margin-top:0}
.below p,.below li{font-size:7.6pt}
`;

function render(c) {
  const ui = c.ui;
  const block = (b) => {
    switch (b.t) {
      case "label": return `<div class="s-label">${esc(b.x)}</div>`;
      case "title": return `<div class="s-title">${esc(b.x)}</div>`;
      case "q": return `<div class="s-q">${esc(b.x)}</div>`;
      case "chips": return `<div class="chips${b.stack ? " stack" : ""}">${b.x.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>`;
      case "p": return `<p class="s-p">${esc(b.x)}</p>`;
      case "note": return `<div class="s-note">${esc(ui.note)}: ${esc(b.x)}</div>`;
      case "rule": return `<div class="s-rule"><div class="lab">${esc(b.mine ? ui.ruleMine : ui.rule)}</div><div class="txt">${esc(b.x)}</div></div>`;
      case "cards": return `<div class="s-cards">${b.x.map(([h, t]) => `<div class="s-card"><b>${esc(h)}</b>${esc(t)}</div>`).join("")}</div>`;
      case "opt": return `<div class="s-opt">${esc(b.x)}${b.ok ? ` <span class="ok">${esc(ui.supported)}</span>` : ""}</div><div class="s-reply"><i>${esc(ui.tap)}</i>${esc(b.r)}</div>`;
      case "elara": return `<div class="s-elara"><span class="who">${esc(ui.elara)}</span>${esc(b.x)}</div>`;
      case "buttons": return `<div class="s-buttons">${b.x.map((x) => `<span class="s-btn">${esc(x)}</span>`).join("")}</div>`;
      case "when": return `<div class="s-when"><div class="if">${esc(b.when)}</div>${b.b.map(block).join("")}</div>`;
      case "next": return `<div class="s-next">${esc(b.x)}</div>`;
      case "try": return `<div class="s-try"><span class="who">${esc(ui.tryLab)}</span>${esc(b.x)}</div>`;
      case "field": return `<div class="s-field"><div class="fl">${esc(b.label)}</div><div class="box${b.prefill ? "" : " ph"}">${esc(b.x)}</div></div>`;
      default: throw new Error(`unknown block ${b.t}`);
    }
  };
  const screen = (i, blocks) => `<div><div class="slab">${esc(ui.screen(i))}</div><div class="screen">${blocks.map(block).join("")}</div></div>`;
  const page = (n, body) =>
    `<section class="page"><div class="brand">${esc(ui.brand)}</div><div class="inner">${body}</div><div class="foot"><span>${esc(ui.footer)}</span><span>${n}</span></div></section>`;

  const cv = c.cover;
  const coverHtml = `<div class="eye">${esc(cv.eyebrow)}</div><h1 class="cover">${cv.title.map(esc).join("<br>")}</h1><p class="purpose">${esc(cv.sub)}</p>
  <table><tr>${cv.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${cv.rows.map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</table>
  ${cv.sections.map(([h, t]) => `<h3>${esc(h)}</h3>` + (Array.isArray(t) ? `<ul class="ch">${t.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p style="font-size:7.9pt">${esc(t)}</p>`)).join("")}`;

  const dayPages = c.days.flatMap((d) => [
    `<div class="eye">${esc(ui.dayEye(d.n))}</div><h1>${esc(d.title)}</h1><p class="purpose">${esc(d.purpose)}</p><div class="pair">${screen(1, d.s[0])}${screen(2, d.s[1])}</div>`,
    `<div class="eye">${esc(ui.dayEye2(d.n))}</div><div class="pair" style="margin-top:2mm">${screen(3, d.s[2])}${screen(4, d.s[3])}</div>
     <div class="below"><div><h3>${esc(ui.review)}</h3><p>${esc(d.review)}</p></div><div><h3>${esc(ui.changed)}</h3><ul class="ch">${d.changes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>`,
  ]);

  const s = c.sheet;
  const sheetHtml = `<div class="eye">${esc(s.eyebrow)}</div><h1>${esc(s.title)}</h1><p class="purpose">${esc(s.sub)}</p>
  <table><tr>${s.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${s.rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td><td class="blank">______________________</td></tr>`).join("")}</table>
  <h3>${esc(s.decisionsTitle)}</h3><ul class="ch">${s.decisions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
  <h3>${esc(s.testTitle)}</h3><p>${esc(s.test)}</p>`;

  const bodies = [coverHtml, ...dayPages, sheetHtml];
  const title = ui.lang === "es" ? "Elara · Dinero · V3.2 · Pantallas" : "Elara · Money · V3.2 · Screens";
  return `<!doctype html><html lang="${ui.lang}"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${bodies.map((b, i) => page(i + 1, b)).join("\n")}</body></html>`;
}

const docs = [
  ["Elara_Dinero_V3.2_Pantallas_ES", render(es)],
  ["Elara_Money_V3.2_Screens_EN", render(en)],
];

const browser = await chromium.launch();
let bad = 0;
for (const [name, html] of docs) {
  const file = join(out, "html", `${name}.html`);
  writeFileSync(file, html);
  const pg = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await pg.goto("file://" + file);
  await pg.emulateMedia({ media: "print" });
  const fit = await pg.$$eval(".inner", (els) =>
    els.map((e, i) => ({ page: i + 1, over: e.scrollHeight - e.clientHeight, room: e.clientHeight - [...e.children].reduce((m, c) => Math.max(m, c.offsetTop + c.offsetHeight), 0) })),
  );
  for (const f of fit.filter((f) => f.over > 0)) { bad++; console.log(`OVERFLOW ${name} p${f.page}: ${f.over}px`); }
  console.log(name, "pages:", fit.length, "room(px):", fit.map((f) => f.room).join(" "));
  await pg.pdf({ path: join(out, `${name}.pdf`), format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
  await pg.close();
}
await browser.close();
if (bad) process.exit(1);
