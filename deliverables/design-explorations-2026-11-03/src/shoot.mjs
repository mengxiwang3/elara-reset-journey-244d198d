// Screenshots every reviewer "screen" and "state" of each concept into ../shots/.
// Run from the workspace folder: node src/shoot.mjs [a b c c2]   (no argument: all)
//
// For c2 it also captures large text (130 % and 160 %) on the key screens, and audits
// every capture: contrast of all visible text against its real (composited) background,
// smallest font size, touch targets under 44 x 44, horizontal overflow, text wider or
// taller than its box, and text that overlaps other text.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const which = process.argv.slice(2).length ? process.argv.slice(2) : ["a", "b", "c", "c2"];
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const LARGE = ["Por qué hoy", "Paso 1 elegido", "Paso 2 escrito", "Teclado abierto", "Sin conexión", "Opción cambiada", "Tarjeta lista", "Pasó las dos", "Borrador sin terminar (Hoy)", "Hoy después"];

/* ---- runs inside the page ---- */
function audit() {
  const parse = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (x, y) => { const a = lum(x), b = lum(y); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
  const phone = document.querySelector(".phone"), PR = phone.getBoundingClientRect();
  const bgOf = (el) => {
    const chain = []; for (let e = el; e; e = e.parentElement) chain.unshift(e);
    let col = { r: 255, g: 255, b: 255, a: 1 }, img = null, op = 1;
    for (const e of chain) {
      const cs = getComputedStyle(e), bc = parse(cs.backgroundColor);
      if (bc && bc.a > 0) { col = over(bc, col); if (bc.a >= 1) img = null; }
      if (cs.backgroundImage && cs.backgroundImage !== "none") img = cs.backgroundImage.slice(0, 48);
      op *= +cs.opacity;
    }
    return { col, img, op };
  };
  const shown = (el) => { const cs = getComputedStyle(el), r = el.getBoundingClientRect(); return cs.visibility !== "hidden" && cs.display !== "none" && r.width > 0 && r.height > 0; };
  const label = (el) => (el.getAttribute("aria-label") || el.textContent || el.placeholder || "").replace(/\s+/g, " ").trim().slice(0, 48);
  const out = { texts: [], minFont: null, minProduct: null, small: [], overflow: [], clipped: [], overlaps: [] };
  const scope = [...phone.querySelectorAll("#app *, #sheet *, #toast")];
  for (const el of scope) {
    if (!shown(el)) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const cs = getComputedStyle(el);
    if (own) {
      const { col, img, op } = bgOf(el);
      if (op > 0.01) {
        const fg = parse(cs.color); fg.a *= op;
        const size = parseFloat(cs.fontSize), weight = +cs.fontWeight;
        const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
        out.texts.push({ t: label(el), r: +ratio(over(fg, col), col).toFixed(2), need, size, img });
        if (!out.minFont || size < out.minFont.size) out.minFont = { size, t: label(el) };
        if (!el.closest(".rtag") && (!out.minProduct || size < out.minProduct.size)) out.minProduct = { size, t: label(el) };
        if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1 && !/(auto|scroll)/.test(cs.overflowX)) out.clipped.push(`wider than its box: ${label(el)}`);
        if (el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 2 && !/(auto|scroll)/.test(cs.overflowY)) out.clipped.push(`taller than its box: ${label(el)}`);
      }
    }
    if (el.matches("textarea") && !el.value) {
      const ph = parse(getComputedStyle(el, "::placeholder").color), { col } = bgOf(el);
      if (ph) out.texts.push({ t: "placeholder: " + el.placeholder, r: +ratio(over(ph, col), col).toFixed(2), need: 4.5, size: parseFloat(cs.fontSize) });
    }
    if (el.matches("button, a[href], textarea, input, [role=radio], [data-act]") && !el.classList.contains("scrim")) {
      const r = el.getBoundingClientRect();
      if (r.width < 44 || r.height < 44) out.small.push(`${Math.round(r.width)}x${Math.round(r.height)} ${label(el)}`);
    }
    if (el.closest("#app")) {
      const r = el.getBoundingClientRect();
      if (r.right > PR.right + 0.5 || r.left < PR.left - 0.5) out.overflow.push(`${el.className || el.tagName} ${label(el)}`);
    }
  }
  // overlapping text: compare the boxes of text runs; within one scroll container raw boxes,
  // across containers only the part each container actually shows
  const scroller = (n) => { for (let e = n.parentElement; e; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if (o === "auto" || o === "scroll") return e; } return null; };
  const runs = [];
  const walker = document.createTreeWalker(document.querySelector("#app"), NodeFilter.SHOW_TEXT);
  let node, id = 0;
  while ((node = walker.nextNode())) {
    if (!node.textContent.trim() || !shown(node.parentElement)) continue;
    const range = document.createRange(); range.selectNodeContents(node);
    const sc = scroller(node), clip = sc ? sc.getBoundingClientRect() : PR;
    id++;
    for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) runs.push({ id, sc, r, clip, t: node.textContent.trim().slice(0, 30) });
  }
  const inter = (a, b) => ({ l: Math.max(a.left, b.left), t: Math.max(a.top, b.top), r: Math.min(a.right, b.right), b: Math.min(a.bottom, b.bottom) });
  for (let i = 0; i < runs.length; i++) for (let j = i + 1; j < runs.length; j++) {
    const A = runs[i], B = runs[j]; if (A.id === B.id) continue;
    let ra = A.r, rb = B.r;
    if (A.sc !== B.sc) { ra = inter(A.r, A.clip); rb = inter(B.r, B.clip); ra = { left: ra.l, top: ra.t, right: ra.r, bottom: ra.b }; rb = { left: rb.l, top: rb.t, right: rb.r, bottom: rb.b }; }
    const x = inter(ra, rb);
    if (x.r - x.l > 3 && x.b - x.t > 4) out.overlaps.push(`"${A.t}" / "${B.t}"`);
  }
  return out;
}

const browser = await chromium.launch();
const problems = [];
const report = { shots: 0, texts: 0, fails: [], lowest: [], images: 0, minFont: null, minProduct: null, small: new Set(), overflow: new Set(), clipped: new Set(), overlaps: new Set() };
const record = (a, where) => {
  report.shots++; report.texts += a.texts.length;
  for (const x of a.texts) {
    if (x.img) report.images++;
    if (x.r < x.need) report.fails.push(`${where}: ${x.r}:1 < ${x.need} (${x.size}px) "${x.t}"`);
    report.lowest.push({ ...x, where });
  }
  if (a.minFont && (!report.minFont || a.minFont.size < report.minFont.size)) report.minFont = { ...a.minFont, where };
  if (a.minProduct && (!report.minProduct || a.minProduct.size < report.minProduct.size)) report.minProduct = { ...a.minProduct, where };
  a.small.forEach((s) => report.small.add(`${where}: ${s}`));
  a.overflow.forEach((s) => report.overflow.add(`${where}: ${s}`));
  a.clipped.forEach((s) => report.clipped.add(`${where}: ${s}`));
  a.overlaps.forEach((s) => report.overlaps.add(`${where}: ${s}`));
};

for (const k of which) {
  for (const [w, h] of [[393, 852], [360, 780]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    page.on("pageerror", (e) => problems.push(`${k} ${w}: JS error ${e.message}`));
    await page.goto(pathToFileURL(join(root, k + ".html")).href);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(300);
    const list = await page.evaluate(() => [...document.querySelectorAll("[data-screen]")].map((b) => b.textContent));
    const presets = await page.evaluate(() => [...document.querySelectorAll("[data-preset]")].map((b) => b.textContent));
    const jobs = [...list.map((n, i) => ["s", i, n]), ...presets.map((n, i) => ["p", i, n])];
    const v2 = k === "c2";
    const shoot = async (t, i, n, file) => {
      await page.evaluate(([t, i]) => (t === "s" ? window.proto.go(i) : window.proto.preset(i)), [t, i]);
      await page.waitForTimeout(260);
      if (v2) record(await page.evaluate(audit), `${w} ${file.replace(/^c2-\d+-/, "").replace(".png", "")}`);
      else {
        const issues = await page.evaluate(() => {
          const out = []; const app = document.querySelector("#app"); const W = app.getBoundingClientRect().right + 0.5;
          app.querySelectorAll("*").forEach((el) => { const r = el.getBoundingClientRect(); if (r.width && r.right > W && getComputedStyle(el).position !== "absolute") out.push("overflow-x: " + el.className); });
          app.querySelectorAll("button,[data-act]").forEach((el) => { const r = el.getBoundingClientRect(); if (r.width && r.height && (r.height < 44 || r.width < 44) && !el.classList.contains("scrim")) out.push(`small target ${Math.round(r.width)}x${Math.round(r.height)}`); });
          return out;
        });
        issues.forEach((x) => problems.push(`${k} ${w} ${n}: ${x}`));
      }
      await page.screenshot({ path: join(root, "shots", file) });
      const tall = await page.evaluate(() => { const s = document.querySelector("#app .scroll"); return s && s.scrollHeight > s.clientHeight + 40 ? (s.scrollTop = s.scrollHeight, true) : false; });
      if (tall && (w === 393 || /-t1[36]0-/.test(file))) { await page.waitForTimeout(80); await page.screenshot({ path: join(root, "shots", file.replace(".png", "-scrolled.png")) }); }
    };
    for (const [t, i, n] of jobs) {
      if (w === 360 && t === "p" && !v2) continue;
      const idx = t === "s" ? String(i + 1).padStart(2, "0") : "state-" + (v2 ? String(i + 1).padStart(2, "0") : i + 1);
      await shoot(t, i, n, `${k}-${w}-${idx}-${slug(n)}.png`);
    }
    if (v2) {
      for (const scale of [1.3, 1.6]) {
        await page.evaluate((s) => window.proto.text(s), scale);
        for (const n of LARGE) {
          const si = list.indexOf(n), pi = presets.indexOf(n);
          if (si < 0 && pi < 0) { problems.push(`missing large-text target ${n}`); continue; }
          await shoot(si >= 0 ? "s" : "p", si >= 0 ? si : pi, n, `${k}-${w}-t${Math.round(scale * 100)}-${slug(n)}.png`);
        }
      }
      await page.evaluate(() => window.proto.text(1));
    }
    await page.close();
  }
}

// the reviewer panel (outside the phone) is checked once, at desktop width
if (which.includes("c2")) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(pathToFileURL(join(root, "c2.html")).href);
  await page.waitForTimeout(300);
  const panel = await page.evaluate(() => {
    const out = { minFont: 99, small: [] };
    document.querySelectorAll(".rev *").forEach((el) => {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (own) out.minFont = Math.min(out.minFont, parseFloat(getComputedStyle(el).fontSize));
      if (el.matches("button")) { const r = el.getBoundingClientRect(); if (r.height < 44 || r.width < 44) out.small.push(el.textContent); }
    });
    return out;
  });
  report.panel = panel;
  await page.screenshot({ path: join(root, "shots", "c2-desktop-1280.png") });
  await page.close();
}
await browser.close();

if (which.includes("c2")) {
  const uniq = new Map();
  for (const x of report.lowest.sort((a, b) => a.r - b.r)) if (!uniq.has(x.t)) uniq.set(x.t, x);
  console.log(`c2 audit: ${report.shots} captures, ${report.texts} text checks, ${report.images} over an image`);
  console.log(`contrast failures: ${report.fails.length}`); report.fails.slice(0, 20).forEach((f) => console.log("  " + f));
  console.log("lowest contrast (unique texts):"); [...uniq.values()].slice(0, 8).forEach((x) => console.log(`  ${x.r}:1 (needs ${x.need}, ${x.size}px) "${x.t}" [${x.where}]`));
  console.log(`smallest text: ${report.minFont.size}px "${report.minFont.t}" [${report.minFont.where}]`);
  console.log(`smallest product-UI text (reviewer tags excluded): ${report.minProduct.size}px "${report.minProduct.t}" [${report.minProduct.where}]`);
  console.log(`targets under 44px: ${report.small.size}`); [...report.small].slice(0, 20).forEach((s) => console.log("  " + s));
  console.log(`horizontal overflow: ${report.overflow.size}`); [...report.overflow].slice(0, 20).forEach((s) => console.log("  " + s));
  console.log(`text wider/taller than its box: ${report.clipped.size}`); [...report.clipped].slice(0, 30).forEach((s) => console.log("  " + s));
  console.log(`overlapping text: ${report.overlaps.size}`); [...report.overlaps].slice(0, 30).forEach((s) => console.log("  " + s));
  console.log(`reviewer panel: smallest text ${report.panel.minFont}px, buttons under 44px: ${report.panel.small.length}`);
}
console.log(problems.length ? [...new Set(problems)].join("\n") : "no other problems found");
