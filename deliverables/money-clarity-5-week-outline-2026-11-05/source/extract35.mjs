import fs from "fs";
function load(f, name) { let s = fs.readFileSync(f, "utf8"); s = s.replace(/^import[^\n]*\n/gm, "").replace(new RegExp("export const " + name + "\\s*:\\s*\\w+\\s*="), "module.exports ="); const m = { exports: {} }; new Function("module", s)(m); return m.exports; }
const es = load("src/apps_mobile_src_i18n_locales_es_pathCopy_money.ts", "money"), en = load("src/apps_mobile_src_i18n_locales_en_pathCopy_money.ts", "money"), st = load("src/apps_mobile_src_content_pathDays_money.ts", "money");
console.log(es.days.length, en.days.length, st.days.length);
const out = es.days.map((d, i) => {
  const s = st.days[i], e = en.days[i];
  const refs = [...new Set((JSON.stringify(d).match(/\{d\d+\.[a-zA-Z]+/g) || []).map(x => x.slice(1)))];
  return { n: i + 1, level: d.level, title: d.title, body: d.body, weekTitle: d.weekTitle, intro: d.intro && d.intro.note, completeTitle: d.completeTitle, completeElara: d.completeElara, nextWeekTitle: d.nextWeekTitle, letter: d.letter, letterFallback: d.letterFallback,
    en: { level: e.level, title: e.title, body: e.body, weekTitle: e.weekTitle, intro: e.intro && e.intro.note, nextWeekTitle: e.nextWeekTitle },
    minutes: (s.config || {}).minutes, steps: s.steps.map(x => ({ id: x.id, kind: x.kind, cfg: x.config || {}, es: d.steps[x.id] && (d.steps[x.id].title || d.steps[x.id].prompt), en: e.steps[x.id] && (e.steps[x.id].title || e.steps[x.id].prompt), opts: d.steps[x.id] && (d.steps[x.id].options || d.steps[x.id].items || d.steps[x.id].stops || d.steps[x.id].fields) })), refs };
});
fs.writeFileSync("series35.json", JSON.stringify(out, null, 1));
out.forEach(d => console.log(d.n, "|", d.weekTitle || "", "|", d.level, "|", d.title, "|", d.steps.map(s => s.kind).join(","), "|", d.refs.join(" ")));
