// Screenshots every reviewer "screen" and "state" of each concept at 393x852
// (and a few at 360x780) into ../shots/. Run: node src/shoot.mjs [a b c]
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const which = process.argv.slice(2).length ? process.argv.slice(2) : ["a", "b", "c"];
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const browser = await chromium.launch();
const problems = [];
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
    for (const [t, i, n] of jobs) {
      if (w === 360 && t === "p") continue;
      await page.evaluate(([t, i]) => (t === "s" ? window.proto.go(i) : window.proto.preset(i)), [t, i]);
      await page.waitForTimeout(t === "p" && /error|conexi/i.test(n) ? 200 : 250);
      // horizontal overflow and clipped text check
      const issues = await page.evaluate(() => {
        const out = [];
        const app = document.querySelector("#app");
        const W = app.getBoundingClientRect().right + 0.5;
        app.querySelectorAll("*").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width && r.right > W && getComputedStyle(el).position !== "absolute") out.push("overflow-x: " + el.className + " " + (el.textContent || "").slice(0, 30));
        });
        app.querySelectorAll("button,[data-act]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width && r.height && (r.height < 44 || r.width < 44) && !el.classList.contains("scrim")) out.push(`small target ${Math.round(r.width)}x${Math.round(r.height)}: ${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}`);
        });
        return out;
      });
      issues.forEach((x) => problems.push(`${k} ${w} ${n}: ${x}`));
      const file = `${k}-${w}-${t === "s" ? String(i + 1).padStart(2, "0") : "state-" + (i + 1)}-${slug(n)}.png`;
      if (w === 393 || i < 99) await page.screenshot({ path: join(root, "shots", file) });
      // scrolled view of long screens
      const tall = await page.evaluate(() => { const s = document.querySelector("#app .scroll"); return s && s.scrollHeight > s.clientHeight + 40 ? (s.scrollTop = s.scrollHeight, true) : false; });
      if (tall && w === 393) { await page.waitForTimeout(80); await page.screenshot({ path: join(root, "shots", file.replace(".png", "-scrolled.png")) }); }
    }
    await page.close();
  }
}
await browser.close();
console.log(problems.length ? [...new Set(problems)].join("\n") : "no problems found");
