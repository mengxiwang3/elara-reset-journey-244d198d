// Click-through test: real taps, leave mid-session, reload, resume, finish. node src/e2e.mjs
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 393, height: 852 } });
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
const tap = async (sel) => { await p.locator("#app " + sel).first().click(); await p.waitForTimeout(120); };
const txt = async () => (await p.locator("#app").innerText()).replace(/\s+/g, " ");
const expect = async (s, label) => { const t = await txt(); console.log((t.includes(s) ? "ok   " : "FAIL ") + label + " ⇒ " + s); };
for (const k of ["a", "b", "c"]) {
  console.log("--", k);
  await p.goto(pathToFileURL(join(root, k + ".html")).href); await p.evaluate(() => localStorage.clear()); await p.reload();
  await tap('[data-act="start"]');
  if (k !== "b") await tap('[data-act="toAsk"]');
  await tap('[data-arg="Mejorar mi trabajo actual"]');
  await tap('[data-act="askNext"]');
  await expect("Elara está pensando", "loading shown");
  await p.waitForTimeout(1800);
  await expect("Respuesta simulada", "sim reply");
  if (k === "a") await tap('[data-act="toTake"]');
  // leave mid-session
  await tap(k === "b" ? '[data-act="back"]' : '[data-act="leave"]');
  await p.locator('#sheet [data-act="leaveConfirm"]').click(); await p.waitForTimeout(150);
  await expect("Seguir con el día 1", "Hoy shows resume");
  await p.reload(); await p.waitForTimeout(200);
  await expect("Sigue donde lo dejaste", "resume survives reload");
  await tap('[data-act="start"]');
  await expect("Para llevarte", "resumed at take");
  await p.locator("#app textarea").fill("Preguntar a mi encargada si hay formación gratuita para subir de puesto.");
  await tap('[data-act="finish"]');
  await p.waitForTimeout(1800);
  await expect("formación gratuita es concreto", "take reply");
  if (k === "a") await tap('[data-act="toClose"]');
  await expect("¿Qué sabes hacer", "tomorrow shown");
  await tap('[data-act="toHoy"]');
  await expect("Día 1 hecho", "Hoy done");
  // error path with a fresh session
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.locator('[data-mode="error"]').click();
  await tap('[data-act="start"]'); if (k !== "b") await tap('[data-act="toAsk"]');
  await tap('[data-arg="Encontrar trabajo"]'); await tap('[data-act="askNext"]'); await p.waitForTimeout(1800);
  await expect("Ahora no hay conexión", "offline state");
  await tap('[data-act="skipWait"]');
  await expect("Eso ayuda. Puedes cambiarlo cuando quieras.", "authored fallback for other option");
  await p.locator('[data-mode="ok"]').click();
}
console.log(errs.length ? "JS errors: " + errs.join(" | ") : "no JS errors");
await b.close();
