import { Image } from "react-native";
import type { SkCanvas, SkFont, SkImage, SkPaint, SkPath, SkPicture, SkShader, SkTypeface } from "@shopify/react-native-skia";
import type { AreaKey } from "@elara/shared";
import { CONTINENTS, placeById, type PlaceId } from "@/content/places";
import { PLACE_THUMB } from "@/content/placeImages";
import { color } from "@/components/world25d/paint";
import { loadSkia } from "@/components/world25d/skia";
import { DENSE, LAND_ORDER, RINGS, project, separate } from "./geo";
import type { GlobeArea, GlobePlace } from "./model";
import { paperTiles, type PaperTiles } from "./textures";
import type { LonLat } from "./polygons";

/**
 * Paints one frame of the paper globe into a Skia picture ("Atlas Sorpresa
 * final", "Maché natural" globe, Sorpresa places). A line-for-line port of the
 * prototype's canvas drawing: sea, graticule, paper lands with their contour
 * rings, grain, waves, rim and gloss, the continents' labels, and the
 * medallions with the Sorpresa rule (the next places blurred and marked "?",
 * the rest only a dot).
 *
 * Recorded on the JS thread and shown by `SkiaPictureView`, which needs no
 * Reanimated (the app stubs it out).
 */

const TWO = Math.PI * 2;

export interface GlobeView {
  l0: number;
  p0: number;
  cx: number;
  cy: number;
  R: number;
  /** The medallion's base radius. */
  r: number;
  /** Milliseconds, for the pulse of the place in progress. */
  t: number;
  sel: PlaceId | null;
  zone: AreaKey | null;
  /** False under Reduce Motion: the pulse holds still. */
  motion: boolean;
}

export interface Pin {
  id: PlaceId;
  x: number;
  y: number;
  r: number;
}

export interface GlobeAssets {
  tiles: PaperTiles;
  thumbs: Partial<Record<PlaceId, SkImage>>;
  typeface: SkTypeface | null;
}

const mixHex = (a: string, b: string, t: number) => {
  const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${A.map((v, i) => Math.round(v + (B[i]! - v) * t)).join(",")})`;
};
const hexA = (h: string, a: number) => `rgba(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",")},${a})`;

/** The land of an Area on the globe: `au` is the unclaimed land and keeps the design's lilac until it has a place. */
const UNSTARTED = { col: "#8d8576", tint: "#e1dbcc" };

export async function loadGlobeAssets(): Promise<GlobeAssets> {
  const { Skia } = loadSkia();
  const tiles = paperTiles();
  const thumbs: Partial<Record<PlaceId, SkImage>> = {};
  await Promise.all(
    (Object.keys(PLACE_THUMB) as PlaceId[]).map(async (id) => {
      try {
        const uri = Image.resolveAssetSource(PLACE_THUMB[id] as number).uri;
        const data = await Skia.Data.fromURI(uri);
        const img = Skia.Image.MakeImageFromEncoded(data);
        if (img) thumbs[id] = img;
      } catch {
        // A missing thumbnail leaves a plain medallion; the globe still turns.
      }
    }),
  );
  let typeface: SkTypeface | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { InstrumentSans_600SemiBold } = require("@expo-google-fonts/instrument-sans") as { InstrumentSans_600SemiBold: number };
    const data = await Skia.Data.fromURI(Image.resolveAssetSource(InstrumentSans_600SemiBold).uri);
    typeface = Skia.Typeface.MakeFreeTypeFaceFromData(data);
  } catch {
    typeface = null;
  }
  return { tiles, thumbs, typeface };
}

export class GlobePainter {
  private fonts = new Map<number, SkFont>();
  private lastWidth = 0;

  constructor(private readonly assets: GlobeAssets) {}

  private font(size: number): SkFont | null {
    if (!this.assets.typeface) return null;
    let f = this.fonts.get(size);
    if (!f) {
      f = loadSkia().Skia.Font(this.assets.typeface, size);
      this.fonts.set(size, f);
    }
    return f;
  }

  record(view: GlobeView, areas: readonly GlobeArea[], width: number, height: number): { picture: SkPicture; pins: Pin[] } {
    const { Skia } = loadSkia();
    this.lastWidth = width;
    const rec = Skia.PictureRecorder();
    const c = rec.beginRecording(Skia.XYWHRect(0, 0, width, height));
    const started = new Map<AreaKey, boolean>(areas.map((a) => [a.area, a.started]));
    this.globe(c, view, started);
    const pins = this.places(c, view, areas, started);
    // Labels go on last, placed around the medallions rather than under them.
    // In a zone only the selected place is named (the tray lists the rest).
    this.labels(c, view, started, pins);
    return { picture: rec.finishRecordingAsPicture(), pins };
  }

  /* ───── helpers ───── */

  private fill(rgba: string, alpha = 1): SkPaint {
    const { Skia, PaintStyle } = loadSkia();
    const p = Skia.Paint();
    p.setAntiAlias(true);
    p.setStyle(PaintStyle.Fill);
    p.setColor(color(rgba, alpha));
    return p;
  }

  private stroke(rgba: string, width: number, alpha = 1): SkPaint {
    const { Skia, PaintStyle, StrokeCap, StrokeJoin } = loadSkia();
    const p = Skia.Paint();
    p.setAntiAlias(true);
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeWidth(width);
    p.setStrokeCap(StrokeCap.Round);
    p.setStrokeJoin(StrokeJoin.Round);
    p.setColor(color(rgba, alpha));
    return p;
  }

  private shadowed(p: SkPaint, sigma: number): SkPaint {
    p.setMaskFilter(loadSkia().Skia.MaskFilter.MakeBlur(0 as never, sigma, true));
    return p;
  }

  /** A repeating tile as a shader, slid sideways with the globe's turning. */
  private tile(img: SkImage, dx: number): SkShader {
    const { Skia, TileMode, FilterMode, MipmapMode } = loadSkia();
    return img.makeShaderOptions(TileMode.Repeat, TileMode.Repeat, FilterMode.Linear, MipmapMode.None, Skia.Matrix().translate(dx, 0));
  }

  private paperFill(c: SkCanvas, img: SkImage, v: GlobeView, alpha: number) {
    const dx = -((v.l0 * 2.4) % 512);
    const p = this.fill("#000", alpha);
    p.setShader(this.tile(img, dx));
    c.drawRect(loadSkia().Skia.XYWHRect(v.cx - v.R, v.cy - v.R, 2 * v.R, 2 * v.R), p);
  }

  /** A closed outline on the sphere; points on the far side are pushed to the rim, as the prototype does. */
  private outline(pts: readonly LonLat[], v: GlobeView): { path: SkPath; visible: boolean } {
    const path = loadSkia().Skia.Path.Make();
    let visible = false;
    let first = true;
    for (const [lo, la] of pts) {
      const q = project(lo, la, v.l0, v.p0);
      let x = q[0];
      let y = q[1];
      if (q[2] > -0.02) visible = true;
      if (q[2] < 0) {
        const m = Math.hypot(x, y) || 1;
        x /= m;
        y /= m;
      }
      if (first) path.moveTo(v.cx + x * v.R, v.cy - y * v.R);
      else path.lineTo(v.cx + x * v.R, v.cy - y * v.R);
      first = false;
    }
    path.close();
    return { path, visible };
  }

  private area(land: string | null, started: Map<AreaKey, boolean>): { col: string; tint: string } | null {
    if (!land) return null;
    const a = (Object.keys(CONTINENTS) as AreaKey[]).find((k) => CONTINENTS[k].land === land);
    if (!a) return null;
    return started.get(a) ? { col: CONTINENTS[a].col, tint: CONTINENTS[a].tint } : UNSTARTED;
  }

  /* ───── the globe ───── */

  private globe(c: SkCanvas, v: GlobeView, started: Map<AreaKey, boolean>) {
    const { Skia, ClipOp, TileMode, BlendMode } = loadSkia();
    const { cx, cy, R } = v;
    const { tiles } = this.assets;

    // The shadow it stands on.
    const sh = this.fill("#000");
    sh.setShader(Skia.Shader.MakeRadialGradient({ x: cx, y: cy + R * 1.08 }, R * 0.9, [color("rgba(70,55,30,.25)"), color("rgba(70,55,30,0)")], null, TileMode.Clamp));
    c.drawOval(Skia.XYWHRect(cx - R * 0.9, cy + R * 1.06 - R * 0.17, R * 1.8, R * 0.34), sh);

    c.save();
    const disc = Skia.Path.Make();
    disc.addCircle(cx, cy, R);
    c.clipPath(disc, ClipOp.Intersect, true);

    // The sea, with the maché and cream paper over it.
    const sea = this.fill("#000");
    sea.setShader(
      Skia.Shader.MakeTwoPointConicalGradient({ x: cx - R * 0.35, y: cy - R * 0.4 }, R * 0.1, { x: cx, y: cy }, R, [color("#e4f8fa"), color("#8fd0e2")], null, TileMode.Clamp),
    );
    c.drawRect(Skia.XYWHRect(cx - R, cy - R, 2 * R, 2 * R), sea);
    this.paperFill(c, tiles.cream, v, 0.42);
    this.paperFill(c, tiles.mache, v, 0.5);

    // Graticule.
    const grat = this.stroke("rgba(255,255,255,.55)", 0.9);
    const line = (pts: [number, number, number][]) => {
      const p = Skia.Path.Make();
      let go = false;
      for (const q of pts) {
        if (q[2] > 0) {
          if (go) p.lineTo(cx + q[0] * R, cy - q[1] * R);
          else p.moveTo(cx + q[0] * R, cy - q[1] * R);
          go = true;
        } else go = false;
      }
      c.drawPath(p, grat);
    };
    for (let lo = -180; lo < 180; lo += 30) {
      const pts: [number, number, number][] = [];
      for (let la = -80; la <= 80; la += 4) pts.push(project(lo, la, v.l0, v.p0));
      line(pts);
    }
    for (let la = -60; la <= 60; la += 30) {
      const pts: [number, number, number][] = [];
      for (let lo = -180; lo <= 180; lo += 4) pts.push(project(lo, la, v.l0, v.p0));
      line(pts);
    }

    // The lands.
    for (const [k, land] of LAND_ORDER) {
      const a = this.area(land, started);
      // The unclaimed land (and Australia until it begins) is the design's lilac; the others grey until started.
      const tint = land === "au" || !land ? "#e7dcf5" : (a?.tint ?? "#e1dbcc");
      const { path, visible } = this.outline(DENSE[k], v);
      if (!visible) continue;
      // Its shadow, then the edge and the paper.
      c.save();
      c.translate(0, R * 0.014);
      c.drawPath(path, this.shadowed(this.fill("rgb(70,55,30)", 0.38), R * 0.018));
      c.restore();
      c.drawPath(path, this.stroke(mixHex(rgbHex(tint), "#6b4a2a", 0.38), R * 0.026));
      c.drawPath(path, this.fill(tint));
      c.save();
      c.clipPath(path, ClipOp.Intersect, true);
      this.paperFill(c, tiles.cream, v, 0.35);
      this.paperFill(c, tiles.mache, v, 0.5);
      c.restore();
      const edge = !land || land === "au" ? "rgba(120,90,160,.6)" : a === UNSTARTED ? "rgba(130,120,105,.6)" : hexA(a!.col, 0.8);
      c.drawPath(this.outline(DENSE[k], v).path, this.stroke(edge, 1.4));
      const ringCol = !land || land === "au" ? "rgba(140,110,180,.5)" : a === UNSTARTED ? "rgba(130,120,105,.5)" : hexA(a!.col, 0.5);
      const rp = this.stroke(ringCol, 0.9);
      for (const r of RINGS[k]) c.drawPath(this.outline(r, v).path, rp);
    }

    // Grain, waves, rim, gloss.
    const grain = this.fill("#000", 0.55);
    grain.setShader(tiles.grain.makeShaderOptions(TileMode.Repeat, TileMode.Repeat, loadSkia().FilterMode.Linear, loadSkia().MipmapMode.None));
    grain.setBlendMode(BlendMode.Multiply);
    c.drawRect(Skia.XYWHRect(cx - R, cy - R, 2 * R, 2 * R), grain);
    for (let wi = 0; wi < 9; wi++) {
      const wa = (wi * 0.7 + v.l0 * 0.01) % TWO;
      const wr = R * (0.2 + ((wi * 37) % 60) / 100);
      const sx = cx + Math.cos(wa) * R * 0.5;
      const sy = cy + Math.sin(wa) * R * 0.5;
      const start = ((wa + 1) * 180) / Math.PI;
      const sweep = (0.9 * 180) / Math.PI;
      c.drawArc(Skia.XYWHRect(sx - wr, sy - wr, 2 * wr, 2 * wr), start, sweep, false, this.stroke("rgba(255,255,255,.22)", 2.2));
      c.drawArc(Skia.XYWHRect(sx + 2 - wr, sy + 2 - wr, 2 * wr, 2 * wr), start, sweep, false, this.stroke("rgba(60,70,90,.10)", 1.2));
    }
    const rim = this.fill("#000");
    rim.setShader(Skia.Shader.MakeTwoPointConicalGradient({ x: cx, y: cy }, R * 0.62, { x: cx, y: cy }, R, [color("rgba(60,45,20,0)"), color("rgba(40,70,110,.28)")], null, TileMode.Clamp));
    c.drawRect(Skia.XYWHRect(cx - R, cy - R, 2 * R, 2 * R), rim);
    const gloss = this.fill("#000");
    gloss.setShader(Skia.Shader.MakeRadialGradient({ x: cx - R * 0.45, y: cy - R * 0.5 }, R * 0.7, [color("rgba(255,255,255,.38)"), color("rgba(255,255,255,0)")], null, TileMode.Clamp));
    c.drawRect(Skia.XYWHRect(cx - R, cy - R, 2 * R, 2 * R), gloss);
    c.restore();
    c.drawCircle(cx, cy, R, this.stroke("rgba(110,92,60,.5)", 1.2));
  }

  /* ───── continent labels ───── */

  /**
   * The continents' names, placed so they never sit on a medallion or on each
   * other. The selected place's continent goes first and always shows; a
   * label that cannot find a clear spot near its continent, or that would
   * crowd the selected place, is left out (the list view names every place).
   */
  private labels(c: SkCanvas, v: GlobeView, started: Map<AreaKey, boolean>, pins: readonly Pin[]) {
    const big = this.font(11);
    const small = this.font(10);
    if (!big || !small) return;
    const selPin = v.sel ? pins.find((p) => p.id === v.sel) ?? null : null;
    const selArea = v.sel ? placeById(v.sel)?.area ?? null : null;
    type Cand = { area: AreaKey; x: number; y: number; z: number; t1: string; name: string; w: number };
    const cands: Cand[] = [];
    for (const area of v.zone ? [] : (Object.keys(CONTINENTS) as AreaKey[])) {
      const def = CONTINENTS[area];
      const q = project(def.lon, def.lat, v.l0, v.p0);
      if (q[2] <= 0.4) continue;
      const label = LABELS.get(area);
      if (!label) continue;
      const x = v.cx + q[0] * v.R;
      const y = v.cy - q[1] * v.R + (area === "self" ? -40 : 0) + (area === "money" ? -34 : 0) + (area === "everyday" ? -46 : 0);
      const t1 = label.theme.toUpperCase();
      const w = Math.max(big.getTextWidth(t1), small.getTextWidth(label.name));
      cands.push({ area, x, y, z: q[2], t1, name: label.name, w });
    }
    const rank = (k: Cand) => (k.area === selArea ? 0 : started.get(k.area) ? 1 : 2);
    cands.sort((a, b) => rank(a) - rank(b) || b.z - a.z);
    const placed: { l: number; t: number; r: number; b: number }[] = [];
    const PADB = 3;
    const boxAt = (k: Cand, y: number) => ({ l: k.x - k.w / 2 - PADB, t: y - 11 - PADB, r: k.x + k.w / 2 + PADB, b: y + 14 + PADB });
    const hitsPin = (bx: { l: number; t: number; r: number; b: number }) =>
      pins.some((p) => {
        const nx = Math.max(bx.l, Math.min(p.x, bx.r));
        const ny = Math.max(bx.t, Math.min(p.y, bx.b));
        return Math.hypot(p.x - nx, p.y - ny) < p.r + 6;
      });
    const hitsLabel = (bx: { l: number; t: number; r: number; b: number }) =>
      placed.some((o) => bx.l < o.r && bx.r > o.l && bx.t < o.b && bx.b > o.t);
    const halo = this.stroke("rgb(255,255,255)", 4, 0.92);
    // The selected place names itself first, beside its medallion on a paper tag,
    // on the first side clear of the other medallions: it wins every overlap.
    const selName = v.sel ? PLACE_NAMES.get(v.sel) : undefined;
    if (selPin && selName) {
      const w = big.getTextWidth(selName);
      const off = selPin.r + 10;
      const others = pins.filter((p) => p.id !== selPin.id);
      const spots: [number, number][] = [
        [selPin.x, selPin.y + off + 8],
        [selPin.x, selPin.y - off],
        [selPin.x + off + w / 2, selPin.y + 4],
        [selPin.x - off - w / 2, selPin.y + 4],
      ];
      const tag = (x: number, y: number) => ({ l: x - w / 2 - 6, t: y - 13, r: x + w / 2 + 6, b: y + 5 });
      const clear = (bx: { l: number; t: number; r: number; b: number }) =>
        !others.some((p) => {
          const nx = Math.max(bx.l, Math.min(p.x, bx.r));
          const ny = Math.max(bx.t, Math.min(p.y, bx.b));
          return Math.hypot(p.x - nx, p.y - ny) < p.r + 4;
        });
      const clamp = (x: number) => Math.max(w / 2 + 8, Math.min(this.lastWidth - w / 2 - 8, x));
      const [sx, sy] = spots.map(([x, y]) => [clamp(x), y] as [number, number]).find(([x, y]) => clear(tag(x, y))) ?? [clamp(spots[0]![0]), spots[0]![1]];
      const bx = tag(sx, sy);
      const { Skia } = loadSkia();
      c.drawRRect(Skia.RRectXY(Skia.XYWHRect(bx.l, bx.t, bx.r - bx.l, bx.b - bx.t), 9, 9), this.fill("#fffdf8", 0.95));
      c.drawText(selName, sx - w / 2, sy, this.fill("#2b2622"), big);
      placed.push({ l: bx.l - PADB, t: bx.t - PADB, r: bx.r + PADB, b: bx.b + PADB });
    }
    for (const k of cands) {
      const selected = k.area === selArea;
      // Above the cluster first (the eye reads down to the places), then below, then further out.
      const tries = [k.y, k.y - 30, k.y + 30, k.y - 56, k.y + 56];
      let y: number | null = null;
      for (const ty of tries) {
        const bx = boxAt(k, ty);
        if (!hitsPin(bx) && !hitsLabel(bx)) {
          y = ty;
          break;
        }
      }
      if (y === null) {
        if (!selected) continue;
        y = tries.find((ty) => !hitsLabel(boxAt(k, ty))) ?? k.y;
      }
      // Another continent's name right beside the selected place competes with it: leave it out.
      if (!selected && selPin) {
        const bx = boxAt(k, y);
        const nx = Math.max(bx.l, Math.min(selPin.x, bx.r));
        const ny = Math.max(bx.t, Math.min(selPin.y, bx.b));
        if (Math.hypot(selPin.x - nx, selPin.y - ny) < selPin.r * 4) continue;
      }
      placed.push(boxAt(k, y));
      const col = started.get(k.area) ? CONTINENTS[k.area].col : UNSTARTED.col;
      const w1 = big.getTextWidth(k.t1);
      c.drawText(k.t1, k.x - w1 / 2, y, halo, big);
      c.drawText(k.t1, k.x - w1 / 2, y, this.fill(col), big);
      const w2 = small.getTextWidth(k.name);
      c.drawText(k.name, k.x - w2 / 2, y + 12, halo, small);
      c.drawText(k.name, k.x - w2 / 2, y + 12, this.fill("#5e5650"), small);
    }
  }

  /* ───── the places ───── */

  private places(c: SkCanvas, v: GlobeView, areas: readonly GlobeArea[], started: Map<AreaKey, boolean>): Pin[] {
    const dots: { p: GlobePlace; x: number; y: number }[] = [];
    const big: { p: GlobePlace; x: number; y: number; ox: number; oy: number; z: number }[] = [];
    for (const area of areas) {
      for (const p of area.places) {
        const q = project(p.def.lon, p.def.lat, v.l0, v.p0);
        if (q[2] <= 0.12) continue;
        const x = v.cx + q[0] * v.R;
        const y = v.cy - q[1] * v.R;
        const selected = p.def.id === v.sel;
        if ((v.zone && p.def.area !== v.zone) || (q[2] < 0.32 && !selected) || p.hidden) dots.push({ p, x, y });
        else big.push({ p, x, y, ox: x, oy: y, z: q[2] });
      }
    }
    separate(big, v.r * 2 + 3, 5);
    for (const e of big) {
      const dx = e.x - v.cx;
      const dy = e.y - v.cy;
      const m = Math.hypot(dx, dy);
      const L = v.R - v.r * 0.9;
      if (m > L) {
        e.x = v.cx + (dx / m) * L;
        e.y = v.cy + (dy / m) * L;
      }
    }
    for (const e of dots) c.drawCircle(e.x, e.y, 3.2, this.fill(CONTINENTS[e.p.def.area].col, 0.8));
    const lead = this.stroke("rgba(90,70,40,.5)", 1);
    for (const e of big) if (Math.hypot(e.x - e.ox, e.y - e.oy) > 3) c.drawLine(e.ox, e.oy, e.x, e.y, lead);
    const pins: Pin[] = [];
    big.sort((a, b) => a.z - b.z);
    for (const e of big) {
      const sel = e.p.def.id === v.sel;
      const r = v.r * (0.78 + 0.22 * e.z) * (sel && v.zone ? 1.35 : 1);
      if (e.p.state === "lock") this.surprise(c, e.x, e.y, r, e.p);
      else this.medallion(c, e.x, e.y, r, e.p, v, sel, !!started.get(e.p.def.area));
      pins.push({ id: e.p.def.id, x: e.x, y: e.y, r });
    }
    return pins;
  }

  private circle(r: number, x: number, y: number): SkPath {
    const p = loadSkia().Skia.Path.Make();
    p.addCircle(x, y, r);
    return p;
  }

  private numeral(c: SkCanvas, x: number, y: number, r: number, week: number) {
    const f = this.font(Math.round(r * 1.1));
    if (!f) return;
    const s = String(week);
    c.drawText(s, x - f.getTextWidth(s) / 2, y + r * 0.38, this.fill("#8d8576"), f);
  }

  /** A place she has walked or is walking: an area-coloured ring, the photograph, a check or a pulse. */
  private medallion(c: SkCanvas, x: number, y: number, r: number, p: GlobePlace, v: GlobeView, sel: boolean, started: boolean) {
    const { ClipOp, Skia } = loadSkia();
    const col = started ? CONTINENTS[p.def.area].col : UNSTARTED.col;
    c.save();
    c.translate(0, 2);
    c.drawCircle(x, y, r + 4, this.shadowed(this.fill("rgb(40,30,10)", 0.45), 3));
    c.restore();
    c.drawCircle(x, y, r + 4, this.fill(col));
    c.drawCircle(x, y, r + 1.6, this.fill("#fffdf8"));
    if (p.state === "cur") {
      const k = v.motion ? Math.sin(v.t / 380) * 0.5 + 0.5 : 0.4;
      c.drawCircle(x, y, r + 6 + k * 5, this.stroke(col, 2, 0.9 - k * 0.5));
    }
    c.save();
    c.clipPath(this.circle(r, x, y), ClipOp.Intersect, true);
    const img = this.assets.thumbs[p.def.id];
    if (img) c.drawImageRect(img, Skia.XYWHRect(0, 0, img.width(), img.height()), Skia.XYWHRect(x - r, y - r, 2 * r, 2 * r), this.fill("#000"));
    else c.drawRect(Skia.XYWHRect(x - r, y - r, 2 * r, 2 * r), this.fill("#e4dcc9"));
    c.restore();
    if (!img) this.numeral(c, x, y, r, p.def.week);
    if (p.state === "done") {
      const bx = x + r * 0.7;
      const by = y + r * 0.7;
      c.drawCircle(bx, by, r * 0.4, this.fill("#16a34a"));
      c.drawCircle(bx, by, r * 0.4, this.stroke("#fff", 1.6));
      const tick = Skia.Path.Make();
      tick.moveTo(bx - r * 0.18, by);
      tick.lineTo(bx - r * 0.03, by + r * 0.14);
      tick.lineTo(bx + r * 0.2, by - r * 0.12);
      c.drawPath(tick, this.stroke("#fff", 1.6));
    }
    if (sel) c.drawCircle(x, y, r + 5, this.stroke(col, 2.5));
  }

  /** A place still to come ("Sorpresa"): the picture blurred behind frosted paper, and a "?". */
  private surprise(c: SkCanvas, x: number, y: number, r: number, p: GlobePlace) {
    const { Skia, ClipOp, TileMode } = loadSkia();
    const col = CONTINENTS[p.def.area].col;
    c.save();
    c.translate(0, 1.5);
    c.drawCircle(x, y, r + 3.5, this.shadowed(this.fill("rgb(40,30,10)", 0.32), 2));
    c.restore();
    c.drawCircle(x, y, r + 3.5, this.fill(col));
    c.drawCircle(x, y, r + 1.4, this.fill("#fffdf8"));
    c.save();
    c.clipPath(this.circle(r, x, y), ClipOp.Intersect, true);
    const img = this.assets.thumbs[p.def.id];
    if (img) {
      const paint = this.fill("#000");
      paint.setImageFilter(Skia.ImageFilter.MakeBlur(2.6, 2.6, TileMode.Clamp));
      paint.setColorFilter(Skia.ColorFilter.MakeMatrix(saturation(0.75)));
      c.drawImageRect(img, Skia.XYWHRect(0, 0, img.width(), img.height()), Skia.XYWHRect(x - r * 1.2, y - r * 1.2, 2.4 * r, 2.4 * r), paint);
    }
    c.drawRect(Skia.XYWHRect(x - r, y - r, 2 * r, 2 * r), this.fill("rgb(255,250,240)", 0.28));
    c.restore();
    // The "?" badge.
    const bx = x + r * 0.68;
    const by = y - r * 0.68;
    const br = r * 0.42;
    c.drawCircle(bx, by, br, this.fill(col));
    c.drawCircle(bx, by, br, this.stroke("#fff", 1.4));
    const f = this.font(Math.round(br * 1.35));
    if (f) c.drawText("?", bx - f.getTextWidth("?") / 2, by + br * 0.46, this.fill("#fff"), f);
  }
}

/** The names printed on the globe, set by the screen from the catalogue (the painter holds no copy). */
const LABELS = new Map<AreaKey, { theme: string; name: string }>();
export function setGlobeLabels(labels: Record<AreaKey, { theme: string; name: string }>) {
  for (const k of Object.keys(labels) as AreaKey[]) LABELS.set(k, labels[k]);
}

/** The places' names (the catalogue's), set by the screen: the selected one is printed on the globe. */
const PLACE_NAMES = new Map<PlaceId, string>();
export function setGlobePlaceNames(names: Partial<Record<PlaceId, string>>) {
  for (const k of Object.keys(names) as PlaceId[]) {
    const n = names[k];
    if (n) PLACE_NAMES.set(k, n);
  }
}

/** `rgb(r,g,b)` back to `#rrggbb`: the land tints are hex, the mixes are rgb. */
function rgbHex(c: string): string {
  if (c.startsWith("#")) return c;
  const m = c.match(/(\d+)/g) ?? ["0", "0", "0"];
  return `#${m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
}

/** The CSS `saturate(s)` filter as a colour matrix. */
function saturation(s: number): number[] {
  const r = 0.2126;
  const g = 0.7152;
  const b = 0.0722;
  return [
    r + (1 - r) * s, g - g * s, b - b * s, 0, 0,
    r - r * s, g + (1 - g) * s, b - b * s, 0, 0,
    r - r * s, g - g * s, b + (1 - b) * s, 0, 0,
    0, 0, 0, 1, 0,
  ];
}
