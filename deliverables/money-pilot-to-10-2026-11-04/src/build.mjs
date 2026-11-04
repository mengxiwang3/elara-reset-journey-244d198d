// Builds «Hacia el 10» (Spanish) and «Toward 10» (English) PDFs, and the
// WhatsApp copy-paste scripts for week 1 (generated from the V3.2 content).
// Usage: node src/build.mjs   (from the deliverable folder)
// Fails if the two editions differ in shape or any page overflows.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import * as es from "./content-es.mjs";
import * as en from "./content-en.mjs";
import * as v32es from "../../money-sessions-v3.2-2026-11-04/src/content-es.mjs";
import * as v32en from "../../money-sessions-v3.2-2026-11-04/src/content-en.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..");
mkdirSync(join(out, "html"), { recursive: true });

function shape(v) {
  if (Array.isArray(v)) return `[${v.length}:${v.map(shape).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).sort().map((k) => `${k}:${k === "t" ? v[k] : shape(v[k])}`).join(",")}}`;
  return v === null ? "null" : typeof v;
}
for (const key of ["ui", "pages"]) if (shape(es[key]) !== shape(en[key])) throw new Error(`ES and EN differ in shape: ${key}`);

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
.inner{position:absolute;top:15mm;left:16mm;right:16mm;bottom:15mm;overflow:hidden}
.eye{font-weight:700;font-size:7.4pt;letter-spacing:.05em;color:var(--rust);margin:0 0 1.6mm}
h1{font-family:"DejaVu Serif",Georgia,serif;font-weight:400;color:var(--green);font-size:21pt;line-height:1.18;margin:0 0 1.6mm}
.sub{color:var(--muted);font-size:9.6pt;line-height:1.4;margin:0 0 3mm}
h3{font-size:9.2pt;color:var(--green);margin:3.6mm 0 1.2mm;font-weight:700}
p{margin:0 0 1.6mm;font-size:8.6pt;line-height:1.45}
ul.ch{margin:0 0 1mm;padding-left:4.6mm}
ul.ch li{font-size:8.3pt;line-height:1.42;margin:0 0 .9mm}
table{border-collapse:collapse;width:100%;margin:1.6mm 0 2.4mm}
th{background:#ecefe6;text-align:left;font-weight:400;font-size:7.5pt;padding:1.8mm 2.2mm;vertical-align:bottom}
td{border-bottom:.6pt solid var(--line);font-size:7.7pt;padding:1.8mm 2.2mm;vertical-align:top;line-height:1.38}
table.blank td{height:14mm}
.msg{border:.7pt solid #c9c2b4;background:#fff;border-radius:2.4mm;padding:2.6mm 3mm;margin:1mm 0 2.6mm;font-size:8.5pt;line-height:1.48}
.msg .lab{display:block;font-size:6.4pt;font-weight:700;letter-spacing:.06em;color:var(--rust);text-transform:uppercase;margin-bottom:1mm}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:6mm;align-items:start;margin:1mm 0 2mm}
.slab{font-weight:700;font-size:6.6pt;letter-spacing:.06em;color:var(--muted);margin:0 0 1.2mm;text-transform:uppercase}
.screen{background:var(--screen);border:.8pt solid #cdc6b8;border-radius:5mm;padding:4.4mm 4.2mm 4mm;box-shadow:0 .6mm 0 #e7e1d6}
.s-label{font-size:6.3pt;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:2.2mm 0 1mm;font-weight:700}
.s-label:first-child{margin-top:0}
.s-q{font-family:"DejaVu Serif",Georgia,serif;color:var(--green);font-size:10pt;line-height:1.34;margin:1.6mm 0 1.4mm}
.chips{display:flex;flex-wrap:wrap;gap:1.1mm;margin:0 0 1.2mm}
.chip{border:.6pt solid #c9c2b4;border-radius:3mm;padding:.7mm 2mm;font-size:7.4pt;background:#fff;line-height:1.3}
.s-note{font-size:6.8pt;color:var(--muted);line-height:1.36;margin:.6mm 0 1mm;font-style:italic}
.s-rule{border-left:1.2mm solid var(--rust);background:#f3ece2;padding:1.8mm 2.4mm;margin:1.4mm 0 1.4mm;border-radius:0 1.6mm 1.6mm 0}
.s-rule .lab{font-weight:700;font-size:6pt;letter-spacing:.06em;color:var(--rust);text-transform:uppercase;margin-bottom:.6mm}
.s-rule .txt{font-family:"DejaVu Serif",Georgia,serif;color:var(--green);font-size:9.3pt;line-height:1.32}
.s-elara{background:var(--mint);border-radius:1.8mm;padding:1.4mm 2.2mm;margin:.8mm 0 1.1mm;font-size:7.6pt;line-height:1.38}
.s-elara .who{display:block;font-size:5.9pt;font-weight:700;letter-spacing:.06em;color:var(--green);text-transform:uppercase;margin-bottom:.4mm}
.s-when{border-left:.9pt dashed var(--rust);padding:.3mm 0 .1mm 2.2mm;margin:1mm 0 1mm}
.s-when .if{font-size:6.6pt;font-weight:700;color:var(--rust);margin-bottom:.5mm;line-height:1.3}
.s-buttons{display:flex;gap:1.4mm;flex-wrap:wrap;margin:1.4mm 0 1.1mm}
.s-btn{border-radius:3mm;padding:1mm 2.6mm;font-size:7.4pt;border:.6pt solid var(--green);color:var(--green)}
.s-btn:first-child{background:var(--green);color:#fff}
.s-next{font-size:7.5pt;font-weight:700;color:var(--green);margin-top:1.4mm}
.s-try{background:var(--sun);border-radius:1.8mm;padding:1.4mm 2.2mm;margin:1mm 0 1.1mm;font-size:7.6pt;line-height:1.38}
.s-try .who{display:block;font-size:5.9pt;font-weight:700;letter-spacing:.06em;color:#8a5a12;text-transform:uppercase;margin-bottom:.4mm}
.wcard{background:linear-gradient(170deg,#1f4436 0%,#163428 100%);color:#f6f1e7;border-radius:4mm;padding:5mm 4.6mm 4.4mm;margin:0 0 2mm}
.wcard .hd{font-size:6.2pt;letter-spacing:.12em;font-weight:700;color:#d9c9a7;margin-bottom:3.4mm}
.wcard .it{margin:0 0 3mm}
.wcard .lab{font-size:6pt;letter-spacing:.08em;text-transform:uppercase;color:#cdbf9f;margin-bottom:.8mm}
.wcard .tx{font-size:7.6pt;line-height:1.4}
.wcard .tx.big{font-family:"DejaVu Serif",Georgia,serif;font-size:11.2pt;line-height:1.32;color:#fffaf0}
.wcard .ft{border-top:.6pt solid rgba(246,241,231,.25);padding-top:2mm;font-size:6.4pt;color:#d9c9a7;letter-spacing:.04em}
`;

function render(c) {
  const ui = c.ui;
  const block = (b) => {
    switch (b.t) {
      case "label": return `<div class="s-label">${esc(b.x)}</div>`;
      case "q": return `<div class="s-q">${esc(b.x)}</div>`;
      case "chips": return `<div class="chips">${b.x.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>`;
      case "note": return `<div class="s-note">${esc(ui.note)}: ${esc(b.x)}</div>`;
      case "rule": return `<div class="s-rule"><div class="lab">${esc(b.mine ? ui.ruleMine : ui.rule)}</div><div class="txt">${esc(b.x)}</div></div>`;
      case "elara": return `<div class="s-elara"><span class="who">${esc(ui.elara)}</span>${esc(b.x)}</div>`;
      case "buttons": return `<div class="s-buttons">${b.x.map((x) => `<span class="s-btn">${esc(x)}</span>`).join("")}</div>`;
      case "when": return `<div class="s-when"><div class="if">${esc(b.when)}</div>${b.b.map(block).join("")}</div>`;
      case "next": return `<div class="s-next">${esc(b.x)}</div>`;
      case "try": return `<div class="s-try"><span class="who">${esc(ui.tryLab)}</span>${esc(b.x)}</div>`;
      case "wcard":
        return `<div class="wcard"><div class="hd">${esc(b.head)}</div>${b.items
          .map(([l, t, big]) => `<div class="it"><div class="lab">${esc(l)}</div><div class="tx${big ? " big" : ""}">${esc(t)}</div></div>`)
          .join("")}<div class="ft">${esc(b.foot)}</div></div>`;
      default: throw new Error(`unknown block ${b.t}`);
    }
  };
  const phone = (label, blocks) => `<div><div class="slab">${esc(label)}</div><div class="screen">${blocks.map(block).join("")}</div></div>`;
  const v32 = ui.lang === "es" ? v32es : v32en;
  const day7s4 = v32.days[6].s[3];

  const part = (p) => {
    let h = p.h ? `<h3>${esc(p.h)}</h3>` : "";
    if (p.p) h += `<p>${esc(p.p)}</p>`;
    if (p.ul) h += `<ul class="ch">${p.ul.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    if (p.table) {
      const n = p.table.head.length;
      h += `<table${p.blank ? ' class="blank"' : ""}><tr>${p.table.head.map((x) => `<th>${esc(x)}</th>`).join("")}</tr>${p.table.rows
        .map((r) => `<tr>${Array.from({ length: n }, (_, i) => `<td>${esc(r[i] ?? "")}</td>`).join("")}</tr>`)
        .join("")}</table>`;
    }
    if (p.msg) h += `<div class="msg"><span class="lab">${esc(p.label)} · ${esc(ui.copy)}</span>${esc(p.msg)}</div>`;
    if (p.phones) h += `<div class="pair">${p.phones.map((ph) => phone(ph.label, ph.blocks)).join("")}</div>`;
    if (p.day7) h += `<div class="pair">${phone(ui.day7, day7s4)}<div></div></div>`;
    return h;
  };
  const page = (n, pg) =>
    `<section class="page"><div class="brand">${esc(ui.brand)}</div><div class="inner"><div class="eye">${esc(pg.eye)}</div><h1>${esc(pg.title)}</h1>${pg.sub ? `<p class="sub">${esc(pg.sub)}</p>` : ""}${pg.parts.map(part).join("")}</div><div class="foot"><span>${esc(ui.footer)}</span><span>${n}</span></div></section>`;
  const title = ui.lang === "es" ? "Elara · Dinero · Hacia el 10" : "Elara · Money · Toward 10";
  return `<!doctype html><html lang="${ui.lang}"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${c.pages.map((pg, i) => page(i + 1, pg)).join("\n")}</body></html>`;
}

// ── WhatsApp scripts from the V3.2 Spanish content ────────────────────────
function whatsapp(days) {
  const L = [];
  L.push("ELARA · DINERO · SEMANA 1 · MENSAJES PARA WHATSAPP (forma B de la prueba)");
  L.push("Generado de la V3.2. Propuesta: revisar el español antes de enviar.");
  L.push("");
  L.push("Cómo usarlo: cada mañana, copia el MENSAJE 1 del día. Cuando ella responda con una letra, copia la respuesta de esa letra.");
  L.push("Después envía el MENSAJE 2; cuando responda con un número, copia la respuesta de ese número. Al final, el MENSAJE 3.");
  L.push("Si no responde, no insistas el mismo día. Si escribe algo que no encaja, no improvises consejos: usa la respuesta de «Tengo otra pregunta».");
  L.push("Si escribe una pregunta propia, anótala sin su nombre en la hoja de registro: así «queda guardada» de verdad.");
  L.push("En el día 7, la semana 2 todavía no existe: el mensaje 3 de ese día ya está adaptado para no prometerla.");
  L.push("");
  const letters = "ABCDEFG";
  const strip = (s) => s.replace(/\s+/g, " ").trim();
  for (const d of days) {
    L.push("=".repeat(64));
    L.push(`DÍA ${d.n} · ${d.title}`);
    L.push("=".repeat(64));
    // Screen 1 + screen 2 → message 1
    L.push("");
    L.push("── MENSAJE 1 (mañana) ──");
    for (const b of d.s[0]) {
      if (b.t === "elara" || b.t === "p") L.push(strip(b.x));
      if (b.t === "rule") L.push(`La regla de hoy: ${b.x}`);
      if (b.t === "cards") L.push(b.x.map(([h, t]) => `• ${h}: ${t}`).join("\n"));
    }
    const replies = [];
    let qn = 0;
    let opts = [];
    const flushQ = () => {
      if (!opts.length) return;
      replies.push(...opts);
      opts = [];
    };
    L.push("");
    for (const b of d.s[1]) {
      if (b.t === "q") {
        flushQ();
        qn++;
        L.push(strip(b.x));
      }
      if (b.t === "opt") {
        const letter = letters[opts.length];
        opts.push({ q: qn, letter, x: b.x, r: b.r });
        L.push(`${letter}) ${b.x}`);
      }
    }
    flushQ();
    const multi = new Set(replies.map((r) => r.q)).size > 1;
    L.push(multi ? "Responde con el número de la pregunta y la letra (por ejemplo: 1B, 2A)." : "Responde con la letra.");
    L.push("");
    L.push("── SEGÚN SU RESPUESTA, COPIA ──");
    for (const r of replies) L.push(`${multi ? r.q : ""}${r.letter} → ${strip(r.r)}`);
    // Screen 3 → message 2
    L.push("");
    L.push("── MENSAJE 2 ──");
    const chips = [];
    const whens = [];
    let field = null;
    for (const b of d.s[2]) {
      if (b.t === "q") L.push(strip(b.x));
      if (b.t === "chips") b.x.forEach((c) => { chips.push(c); L.push(`${chips.length}) ${c.replace(/ · Día \d$/, "")}`); });
      if (b.t === "when") whens.push(b);
      if (b.t === "field") field = b;
    }
    if (chips.length) L.push(d.n === 7 ? "Responde con el número de la regla que más te sirve, o escríbela con tus palabras." : "Responde con el número. «Prefiero pasar» también vale.");
    if (field && field.prefill) L.push(`${field.label}: «${field.x}» Puedes dejarla así, cambiarla o escribir la tuya.`);
    if (whens.length) {
      L.push("");
      L.push("── SEGÚN SU RESPUESTA, COPIA ──");
      for (const w of whens) {
        const m = w.when.match(/«(.+?)»/);
        const i = m ? chips.indexOf(m[1]) : -1;
        const tag = i >= 0 ? `${i + 1}` : w.when;
        const text = w.b
          .map((x) => (x.t === "elara" ? strip(x.x) : x.t === "field" ? "(Pídele que escriba su pregunta. Cuando la mande, copia:)" : ""))
          .filter(Boolean)
          .join(" ");
        L.push(`${tag} → ${text}`);
      }
    }
    // Screen 4 → message 3
    L.push("");
    L.push("── MENSAJE 3 (cierre) ──");
    for (const b of d.s[3]) {
      if (b.t === "elara") L.push(strip(b.x));
      if (b.t === "rule") L.push(b.x.startsWith("Tu regla") ? b.x.replace("[la que eligió o escribió]", "[escribe aquí la que eligió]") : `Te llevas: ${b.x}`);
      if (b.t === "try") L.push(`Si quieres probarlo: ${b.x}`);
      if (b.t === "q") L.push(strip(b.x));
      if (b.t === "chips") L.push(b.x.map((c, i) => `${i + 1}) ${c}`).join("\n"));
      if (b.t === "when") L.push(d.n === 7 && /«(Deudas|Un colchón|Empezar|Todavía)/.test(b.when) ? `   ${b.when} → Gracias, lo anoto: nos ayuda a decidir la semana 2.` : `   ${b.when} → ${b.b.filter((x) => x.t === "elara").map((x) => strip(x.x)).join(" ")}`);
      if (b.t === "next") L.push(d.n === 7 ? "Gracias por esta semana. Mañana te escribo para una conversación corta de cierre." : b.x);
    }
    L.push("Si quieres guardar la regla, puedes copiarla en tus notas o hacer una captura.");
    L.push("");
  }
  return L.join("\n");
}

writeFileSync(join(out, "Mensajes_WhatsApp_Semana1_ES.txt"), whatsapp(v32es.days));

const docs = [
  ["Elara_Dinero_Hacia_el_10_ES", render(es)],
  ["Elara_Money_Toward_10_EN", render(en)],
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
