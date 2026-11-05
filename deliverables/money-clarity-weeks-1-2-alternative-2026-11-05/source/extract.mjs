import fs from "fs";
function load(f, name) {
  let s = fs.readFileSync(f, "utf8");
  s = s.replace(/^import[^\n]*\n/gm, "").replace(new RegExp("export const " + name + "\\s*:\\s*\\w+\\s*="), "module.exports =");
  const m = { exports: {} }; new Function("module", s)(m); return m.exports;
}
const es = load("src/apps_mobile_src_i18n_locales_es_pathCopy_money.ts", "money");
const en = load("src/apps_mobile_src_i18n_locales_en_pathCopy_money.ts", "money");
const st = load("src/apps_mobile_src_content_pathDays_money.ts", "money");
const out = { es: { meta: { name: es.name, tagline: es.tagline }, days: es.days.slice(0, 14) }, en: { meta: { name: en.name, tagline: en.tagline }, days: en.days.slice(0, 14) }, structure: st.days.slice(0, 14) };
fs.writeFileSync("approved.json", JSON.stringify(out, null, 1));
const keys = {}; out.es.days.forEach((d, i) => Object.entries(d.steps).forEach(([k, v]) => { const kind = out.structure[i].steps.find(x => x.id === k)?.kind; Object.keys(v).forEach(f => { keys[kind + "." + f] = (keys[kind + "." + f] || 0) + 1; }); }));
console.log(JSON.stringify(keys));
console.log(out.structure.map(d => d.day + ":" + d.steps.map(s => s.id).join(",") ).join("\n"));
// check en/es same step ids
out.es.days.forEach((d,i)=>{ const a=Object.keys(d.steps).join(), b=Object.keys(out.en.days[i].steps).join(), c=out.structure[i].steps.map(s=>s.id).join(); if(a!==b||a!==c) console.log("MISMATCH",i+1,a,b,c); });
console.log(Object.keys(out.es.days[0]), Object.keys(out.es.days[6]));
