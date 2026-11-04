// Builds data.js for the «Dinero en Lan Hạ» prototype from the V4.1 Spanish source,
// so every screen uses the exact V4.1 copy. Usage: node make-data.mjs <content-es.mjs> <out data.js>
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const [src, out] = process.argv.slice(2);
const { ui, days, changes, notes } = await import(pathToFileURL(path.resolve(src)).href);

const x = (v) => (v == null ? null : typeof v === "string" ? v : v.x);
const mk = (v) => (v && typeof v === "object" && v.mark) || null; // "new" | "changed" | null, relative to V4
const quoted = (s) => { const m = /Respuesta: “([^”]+)”/.exec(s) || /“Prefiero pasar”: “([^”]+)”/.exec(s); if (!m) throw new Error("no quoted reply in: " + s); return m[1]; };
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const phrase = (r) => { const m = /(?:Frase para editar|Puedes usar): “([^”]+)”/.exec(r); return m ? m[1] : null; };

// water: where the water starts in each photo (fraction of its height), for the ripple on the home screen.
const PHOTOS = [
  { src: "photos/d1.webp", pos: "16% 50%", water: 0.56, alt: "Bahía de Lan Hạ: un muelle de madera y barcas sobre el agua, con montañas entre la niebla" },
  { src: "photos/d2.webp", pos: "20% 50%", water: 0.72, alt: "Bahía de Lan Hạ: un acantilado verde junto al agua y montañas entre la niebla" },
  { src: "photos/d3.webp", pos: "42% 50%", water: 0.6, alt: "Bahía de Lan Hạ: balsas de madera sobre agua tranquila, entre montañas verdes" },
  { src: "photos/d4.webp", pos: "30% 50%", water: 0.72, alt: "Bahía de Lan Hạ: la entrada de una cueva de roca sobre agua verde" },
  { src: "photos/d5.webp", pos: "50% 50%", water: 0.6, alt: "Bahía de Lan Hạ: un canal de agua quieta entre dos laderas verdes" },
  { src: "photos/d6.webp", pos: "42% 50%", water: 0.74, alt: "Bahía de Lan Hạ: un pueblo flotante con casas de colores sobre el agua" },
  { src: "photos/lh-hero.jpg", pos: "18% 50%", water: 0.62, alt: "Bahía de Lan Hạ: barcas de madera en el agua, con montañas entre la niebla" },
];

const passDefault = quoted(ui.pass);
const notePass = quoted(ui.noteHint);

const week = days.map((d, i) => {
  // Day 1's note has two prompts: one by default, one if she picked «Anotar cuánto falta».
  let note = x(d.note), noteAlt = null;
  const split = note.split(" · Si eligió «Anotar cuánto falta»: ");
  if (split.length === 2) { note = split[0]; noteAlt = { opt: d.s3.opts.findIndex((o) => o.t.startsWith("Anotar cuánto falta")), text: split[1] }; }
  const purpose = d.purpose;
  return {
    n: d.n,
    title: x(d.title),
    purpose,
    learn: "A " + lowerFirst(purpose),
    yesterday: d.yesterday,
    photo: PHOTOS[i],
    m: { title: mk(d.title), pass: mk(d.s1.pass), idea: mk(d.idea), s3q: mk(d.s3.q), note: mk(d.note), example: mk(d.example), take: mk(d.take), tryLine: mk(d.tryLine), next: mk(d.next) },
    s1: { q: d.s1.q, opts: d.s1.opts.map((o) => ({ t: o.t, r: o.r, m: o.mark || null })), pass: d.s1.pass ? quoted(x(d.s1.pass)) : passDefault },
    idea: x(d.idea),
    rule: d.rule,
    check: d.check ? { q: d.check.q, m: "new", opts: d.check.opts.map((o) => ({ t: o.t, r: o.r, ok: !!o.ok })) } : null,
    s3: { q: x(d.s3.q), opts: d.s3.opts.map((o) => ({ t: o.t, r: o.r, m: o.mark || null, phrase: phrase(o.r) })) },
    note, noteAlt,
    example: d.example ? x(d.example).replace(/^Ejemplo opcional: /, "") : null,
    rules: d.rules,
    take: x(d.take),
    tryLine: x(d.tryLine),
    next: x(d.next),
  };
});

const data = {
  version: "V4.1",
  ui: {
    notePass,
    checkHint: "Opcional y sin puntuación. Puedes cambiar de opción o seguir sin responder.",
    savedOk: "Guardado en Tus días",
    saveFail: "No se pudo guardar. Reintentar",
    unsaved: "Terminaste por hoy sin guardar nada. Puedes volver a la explicación.",
    otherQ: "Puedes dejarla como pendiente. Esta sesión no la da por respondida.",
  },
  week,
  // For María's review: what changed since V4, what she still has to decide, and what to look for.
  changes: changes.items.map(([t, d]) => ({ t, d })),
  decide: changes.decide,
  look: (notes.sections.find(([h]) => h.startsWith("PREGUNTAS")) || [null, ""])[1],
};
writeFileSync(out, "// Generated from V4.1 content-es.mjs by make-data.mjs. Do not edit by hand.\nwindow.ELARA_WEEK = " + JSON.stringify(data, null, 1) + ";\n");
console.log("wrote", out, week.length, "days");
