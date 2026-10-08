/**
 * Export Mist Meadow as real depth layers for the website.
 *
 * Everything is drawn by the app's own engine (apps/mobile/src/components/
 * world/engine/meadow.ts, upstream/main @ 5032e03), composed exactly as
 * `meadowInner` composes a still at the start of Day 1 (camera z = 0):
 * same per-layer scale about the vanishing point, same per-layer opacity,
 * same paper/sketch element modes. Nothing is redrawn or invented.
 *
 * Three things are exported at full strength because the website drives them
 * from scroll, exactly as the app drives them from progress:
 *   · haze   (engine: hazeOp,  0.70 -> 0)
 *   · glow   (engine: glowOp,  0.15 -> 0.85)
 *   · sun    (engine: sunDy,   rises)
 */
import { writeFileSync } from "node:fs";
import { LAYERS, VP, meadowState, layerView, renderElement, type MeadowLayer, type MeadowElement } from "./engine/meadow";
import { svgDoc } from "./engine/paint";

const OUT = process.argv[2];
/** The website's window into the meadow, art space. x stays inside the haze
 *  band's own torn edges (-15..315) so no layer's edge can show as a seam. */
export const VIEW = [-10, 50, 320, 384] as const;

const st0 = meadowState({ day: 1, step: 0, n: 6, complete: false, laid: false, fired: [] });
const stDone = meadowState({ day: 1, step: 6, n: 6, complete: true, laid: true, fired: ["mist", "breeze", "lay", "birds", "mist", "light"] });
const z = 0;

const byId = (id: string) => {
  const l = LAYERS.find((x) => x.id === id);
  if (!l) throw new Error("no layer " + id);
  return l;
};

/** One layer group, positioned as the engine positions it at camera z. */
function group(l: MeadowLayer, els: string, opacity?: number): string {
  const v = layerView(l, z);
  const o = opacity ?? v.o;
  return `<g transform="translate(${VP[0]} ${VP[1]}) scale(${v.s.toFixed(4)}) translate(${-VP[0]} ${-VP[1]})" opacity="${o.toFixed(3)}">${els}</g>`;
}
function paint(el: MeadowElement, mode: "paper" | "sketch", ids = { next: 0 }) {
  return renderElement(el, mode, ids);
}
/** A layer's elements in the mode the engine would choose for `st`. */
function layerEls(l: MeadowLayer, st = st0, filter: (e: MeadowElement) => boolean = () => true) {
  const ids = { next: 0 };
  return l.els
    .filter((e) => e.flag !== "birds" && e.flag !== "seeds" && filter(e))
    .map((e) => (e.show(st) ? paint(e, "paper", ids) : e.sketch && e.sketch(st) ? paint(e, "sketch", ids) : ""))
    .join("");
}

const depth = LAYERS.filter((l) => Number.isFinite(l.D) && l.id !== "far");
const isMist = (l: MeadowLayer) => /^mist\d/.test(l.id);
const isDest = (l: MeadowLayer) => /^dest\d/.test(l.id);

const D1 = byId("dest1").D;
/** Depth layers in the engine's own paint order (far first). */
const ordered = depth.slice().sort((a, b) => b.D - a.D);

// Bands in the engine's paint order. The one simplification: the mist bands
// are gathered into one band (so they can recede together) above the hills
// and the hedge; in the engine the far ones sit between ranges.
const bands: Record<string, string> = {
  back:
    group(byId("sky"), layerEls(byId("sky")), 1) +
    group(byId("far"), layerEls(byId("far"))) +
    group(byId("ground"), layerEls(byId("ground")), 1),
  sun: group(byId("sun"), layerEls(byId("sun"), st0, (e) => e.flag === "sun"), 1),
  glow: group(byId("sun"), layerEls(byId("sun"), st0, (e) => e.flag === "glow"), 1),
  // Ranges and grass strips behind Day 1's destination.
  hills: ordered.filter((l) => !isMist(l) && !isDest(l) && l.D > D1).map((l) => group(l, layerEls(l))).join(""),
  "hedge-sketch": group(byId("dest1"), layerEls(byId("dest1"), st0)),
  "hedge-paper": group(byId("dest1"), layerEls(byId("dest1"), stDone)),
  // The grass strip nearer than the hedge.
  "hills-near": ordered.filter((l) => !isMist(l) && !isDest(l) && l.D < D1).map((l) => group(l, layerEls(l))).join(""),
  mist: ordered.filter(isMist).map((l) => group(l, layerEls(l))).join(""),
  haze: group(byId("haze"), layerEls(byId("haze")), 1),
  trail: group(byId("trail"), layerEls(byId("trail")), 1),
  // The engine draws the way ahead before her marker, so the dashes sit under it.
  ahead: group(byId("ahead"), layerEls(byId("ahead"), st0, (e) => e.s === 921), 1),
  marker: group(byId("ahead"), layerEls(byId("ahead"), st0, (e) => e.s === 920), 1),
  near: group(byId("near"), layerEls(byId("near")), 1),
  // The engine lays its paper tooth over everything, last.
  tooth: `<rect x="-40" y="-40" width="380" height="840" fill="url(#tooth)" opacity=".4"/>`,
};

const vb = VIEW.join(" ");
for (const [name, inner] of Object.entries(bands)) {
  if (!inner.replace(/<g[^>]*>|<\/g>/g, "").trim()) throw new Error("empty band " + name);
  writeFileSync(`${OUT}/${name}.svg`, svgDoc(inner, vb));
  console.log(name.padEnd(13), (svgDoc(inner, vb).length / 1024).toFixed(0).padStart(5), "KB svg");
}
writeFileSync(`${OUT}/view.json`, JSON.stringify({ view: VIEW, vp: VP }));
