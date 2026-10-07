/**
 * Atlas Level 1, "D · Hybrid Physical Atlas": the layout engine.
 *
 * Pure and dependency-free (no React, no Skia, no @elara/shared) so it runs in
 * Node tests and is copied byte-for-byte into the holaelara.com site. Given a
 * canvas and the six areas' states it returns every shape the map draws: one
 * sand landform that runs off the viewport on three sides (bays are the only
 * coast), one quiet contour system, torn fragments, one stitched thread and the
 * labels in quiet paper space. Everything is seeded: the same account state
 * always gives the same map.
 *
 * Hard rules, enforced by `checkLayout` (dev warning + vitest):
 *  - scenic fragments cover at most 60% of the landform;
 *  - exactly one full-colour territory (the current one), never two;
 *  - map labels are never below 12 pt (the fit loop shrinks fragments instead);
 *  - the thread crosses no fragment but its own two ends, and no label;
 *  - labels touch no fragment, no other label, and stay inside the canvas;
 *  - every territory has a hit area of at least 88 x 88.
 */

export const AREAS = ["self", "purpose", "love", "money", "energy", "everyday"] as const;
export type MapArea = (typeof AREAS)[number];
export type MapState = "walked" | "now" | "ahead";
export type Pt = readonly [number, number];
export type Rect = { x: number; y: number; w: number; h: number };

export const MIN_LABEL_PT = 12;
export const MIN_HIT = 88;
export const MAX_COVERAGE = 0.6;

export interface LayoutInput {
  width: number;
  height: number;
  states: Record<MapArea, MapState>;
  /** The printed name of each area (its width sizes the label box). */
  names: Record<MapArea, string>;
  /** The state word printed under it ("Ahora", "Recorrido", "A lo lejos"). */
  words: Record<MapState, string>;
  /** Keep labels and fragments clear of the masthead / tab bar. */
  padTop?: number;
  padBottom?: number;
}

export interface Fragment {
  area: MapArea;
  state: MapState;
  poly: Pt[];
  bbox: Rect;
  center: Pt;
  /** The control's hit rectangle, at least 88 x 88. */
  hit: Rect;
}

export interface MapLabel {
  area: MapArea;
  rect: Rect;
  nameSize: number;
  subSize: number;
  /** Text anchors to the start of the rect. */
  align: "left" | "right";
}

export interface Thread {
  kind: "walked" | "ahead";
  from: MapArea;
  to: MapArea;
  pts: Pt[];
}

export interface Contour {
  pts: Pt[];
  index: boolean;
}

export interface MapLayout {
  width: number;
  height: number;
  /** Bays (paper-coloured sea) closed against the canvas corners. */
  bays: Pt[][];
  /** The coast lines of the bays, for the paper edge. */
  coast: Pt[][];
  contours: Contour[];
  fragments: Record<MapArea, Fragment>;
  labels: Record<MapArea, MapLabel>;
  threads: Thread[];
  /** Fixed reading order of the territories. */
  order: MapArea[];
  /** Scenic fragments' share of the visible landform, 0..1. */
  coverage: number;
  /** The scale the fit loop settled on (1 = the approved board). */
  scale: number;
  safe: Rect;
}

// ── seeded randomness ───────────────────────────────────────────────────────

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
const uni = (r: () => number, a: number, b: number) => a + (b - a) * r();

// ── geometry helpers ────────────────────────────────────────────────────────

function pointInPolyXY(x: number, y: number, poly: readonly Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]![0];
    const yi = poly[i]![1];
    const xj = poly[j]![0];
    const yj = poly[j]![1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const pointInPoly = (p: Pt, poly: readonly Pt[]) => pointInPolyXY(p[0], p[1], poly);

function bboxOf(pts: readonly Pt[]): Rect {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

const inflate = (r: Rect, m: number): Rect => ({ x: r.x - m, y: r.y - m, w: r.w + 2 * m, h: r.h + 2 * m });
const rectsTouch = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Liang-Barsky: does the segment a-b touch the rectangle? */
function segTouchesRect(a: Pt, b: Pt, r: Rect): boolean {
  let t0 = 0;
  let t1 = 1;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const p = [-dx, dx, -dy, dy];
  const q = [a[0] - r.x, r.x + r.w - a[0], a[1] - r.y, r.y + r.h - a[1]];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i]! < 0) return false;
    } else {
      const t = q[i]! / p[i]!;
      if (p[i]! < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

function polylineTouchesRect(pts: readonly Pt[], r: Rect): boolean {
  for (let i = 0; i < pts.length - 1; i++) if (segTouchesRect(pts[i]!, pts[i + 1]!, r)) return true;
  return false;
}

function rectTouchesPoly(r: Rect, poly: readonly Pt[]): boolean {
  if (!rectsTouch(r, bboxOf(poly))) return false;
  for (const p of poly) if (p[0] >= r.x && p[0] <= r.x + r.w && p[1] >= r.y && p[1] <= r.y + r.h) return true;
  if (pointInPoly([r.x, r.y], poly) || pointInPoly([r.x + r.w, r.y + r.h], poly)) return true;
  const closed = [...poly, poly[0]!];
  return polylineTouchesRect(closed, r);
}

/** Torn edge from p0 to p1: seeded jitter across the edge plus a slow wobble. */
function tear(p0: Pt, p1: Pt, seed: number, amp: number, step: number, wob = 0, wobf = 0.04): Pt[] {
  const r = rng(seed);
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const L = Math.hypot(dx, dy) || 1;
  const n = Math.max(2, Math.floor(L / step));
  const nx = -dy / L;
  const ny = dx / L;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const off = uni(r, -amp, amp) + wob * Math.sin(t * L * wobf + seed * 1.7);
    out.push([p0[0] + dx * t + nx * off, p0[1] + dy * t + ny * off]);
  }
  return out;
}

/** A torn-paper fragment: a rectangle with torn sides and (maybe) one clipped corner. */
function fragPoly(cx: number, cy: number, w: number, h: number, seed: number, cut: boolean, rot: number): Pt[] {
  const r = rng(seed);
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const x1 = cx + w / 2;
  const y1 = cy + h / 2;
  const k = cut ? Math.floor(r() * 4) : -1;
  const c: Pt[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
  const cutl = uni(r, 0.16, 0.26) * Math.min(w, h);
  const pts: Pt[] = [];
  const toward = (a: Pt, b: Pt, d: number): Pt => {
    const l = Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]));
    return [a[0] + ((b[0] - a[0]) * d) / l, a[1] + ((b[1] - a[1]) * d) / l];
  };
  for (let i = 0; i < 4; i++) {
    let a = c[i]!;
    const b = c[(i + 1) % 4]!;
    if (i === k) {
      const d1 = toward(a, b, cutl);
      const d0 = toward(a, c[(i + 3) % 4]!, cutl);
      pts.push(...tear(d0, d1, seed + i, 2, 6));
      a = d1;
    }
    pts.push(...tear(a, b, seed + 10 + i, 2.4, 6, 2.5, 0.05));
  }
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);
  return pts.map(([x, y]) => [cx + (x - cx) * cr - (y - cy) * sr, cy + (x - cx) * sr + (y - cy) * cr] as Pt);
}

// ── the landform: one height field, one coast ───────────────────────────────

const STEP = 6;
const COAST = 0.6;

const SEEDS: Record<"p" | "l", Record<MapArea, Pt>> = {
  p: {
    self: [0.29, 0.17],
    purpose: [0.77, 0.19],
    love: [0.23, 0.44],
    money: [0.66, 0.5],
    energy: [0.31, 0.745],
    everyday: [0.77, 0.77],
  },
  l: {
    self: [0.44, 0.29],
    purpose: [0.66, 0.2],
    love: [0.88, 0.3],
    energy: [0.46, 0.76],
    money: [0.67, 0.66],
    everyday: [0.89, 0.76],
  },
};
// The landscape seeds are for the website's wide canvas: current area first column.
SEEDS.l = {
  self: [0.18, 0.3],
  purpose: [0.5, 0.22],
  love: [0.82, 0.3],
  energy: [0.18, 0.74],
  money: [0.5, 0.72],
  everyday: [0.82, 0.74],
};

interface Field {
  nx: number;
  ny: number;
  x0: number;
  y0: number;
  z: Float32Array;
}

function heightField(W: number, H: number, centers: Pt[], bays: [number, number, number, number][], seed: number): Field {
  const margin = 24;
  const x0 = -margin;
  const y0 = -margin;
  const nx = Math.ceil((W + 2 * margin) / STEP) + 1;
  const ny = Math.ceil((H + 2 * margin) / STEP) + 1;
  const z = new Float32Array(nx * ny);
  const sig = Math.min(0.5 * W, 0.4 * H);
  const r = rng(seed);
  const waves = Array.from({ length: 6 }, () => ({
    fx: uni(r, 0.004, 0.017),
    fy: uni(r, 0.004, 0.017),
    px: uni(r, 0, 6.28),
    py: uni(r, 0, 6.28),
  }));
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = x0 + i * STEP;
      const y = y0 + j * STEP;
      let v = 0;
      for (const [cx, cy] of centers) v += Math.exp(-(((x - cx) / sig) ** 2 + ((y - cy) / (sig * 1.12)) ** 2));
      for (const w of waves) v += 0.035 * Math.sin(x * w.fx * 6.283 + w.px) * Math.sin(y * w.fy * 6.283 + w.py);
      for (const [bx, by, bs, ba] of bays) v -= ba * Math.exp(-(((x - bx) / bs) ** 2 + ((y - by) / bs) ** 2));
      z[j * nx + i] = v;
    }
  }
  return { nx, ny, x0, y0, z };
}

// Marching squares: edge ids are 2*(j*nx+i) for the edge (i,j)-(i+1,j), +1 for (i,j)-(i,j+1).
const CASES: number[][][] = [
  [],
  [[3, 2]],
  [[2, 1]],
  [[3, 1]],
  [[0, 1]],
  [[0, 3], [2, 1]],
  [[0, 2]],
  [[0, 3]],
  [[0, 3]],
  [[0, 2]],
  [[0, 1], [3, 2]],
  [[0, 1]],
  [[3, 1]],
  [[2, 1]],
  [[3, 2]],
  [],
];

function contourLines(f: Field, level: number): Pt[][] {
  const { nx, ny, x0, y0, z } = f;
  const adj = new Map<number, number[]>();
  const link = (a: number, b: number) => {
    (adj.get(a) ?? adj.set(a, []).get(a)!).push(b);
    (adj.get(b) ?? adj.set(b, []).get(b)!).push(a);
  };
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = z[j * nx + i]! > level ? 8 : 0;
      const b = z[j * nx + i + 1]! > level ? 4 : 0;
      const c = z[(j + 1) * nx + i + 1]! > level ? 2 : 0;
      const d = z[(j + 1) * nx + i]! > level ? 1 : 0;
      const idx = a | b | c | d;
      if (idx === 0 || idx === 15) continue;
      const e = [2 * (j * nx + i), 2 * (j * nx + i + 1) + 1, 2 * ((j + 1) * nx + i), 2 * (j * nx + i) + 1];
      for (const [p, q] of CASES[idx]!) link(e[p!]!, e[q!]!);
    }
  }
  const at = (id: number): Pt => {
    const vertical = id % 2 === 1;
    const cell = (id - (vertical ? 1 : 0)) / 2;
    const i = cell % nx;
    const j = (cell - i) / nx;
    const za = z[cell]!;
    const zb = vertical ? z[(j + 1) * nx + i]! : z[cell + 1]!;
    const t = (level - za) / (zb - za || 1);
    return vertical ? [x0 + i * STEP, y0 + (j + t) * STEP] : [x0 + (i + t) * STEP, y0 + j * STEP];
  };
  const seen = new Set<number>();
  const lines: Pt[][] = [];
  const walk = (start: number) => {
    const ids = [start];
    seen.add(start);
    let prev = -1;
    let cur = start;
    for (;;) {
      const next = (adj.get(cur) ?? []).find((n) => n !== prev && !seen.has(n));
      if (next === undefined) break;
      ids.push(next);
      seen.add(next);
      prev = cur;
      cur = next;
    }
    lines.push(ids.map(at));
  };
  for (const [id, ns] of adj) if (ns.length === 1 && !seen.has(id)) walk(id);
  for (const id of adj.keys()) if (!seen.has(id)) walk(id);
  return lines;
}

// ── layout ──────────────────────────────────────────────────────────────────

interface Attempt {
  fragments: Record<MapArea, Fragment>;
  threads: Thread[];
  labels: Partial<Record<MapArea, MapLabel>>;
  complete: boolean;
}

const nameW = (s: string, size: number) => s.length * size * 0.6 + 4;
const wordW = (s: string, size: number) => s.length * size * 0.6 + 4;

function labelSize(state: MapState, input: LayoutInput, area: MapArea): { w: number; h: number; nameSize: number } {
  const nameSize = state === "now" ? 17 : 15;
  const w = Math.max(nameW(input.names[area], nameSize), wordW(input.words[state], MIN_LABEL_PT)) + 6;
  return { w, h: nameSize + MIN_LABEL_PT + 8, nameSize };
}

/** Inside the polygon, or within `m` of its edge. */
function nearPoly(x: number, y: number, poly: readonly Pt[], bb: Rect, m: number): boolean {
  if (x < bb.x - m || x > bb.x + bb.w + m || y < bb.y - m || y > bb.y + bb.h + m) return false;
  if (pointInPolyXY(x, y, poly)) return true;
  const m2 = m * m;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const ax = poly[j]![0];
    const ay = poly[j]![1];
    const dx = poly[i]![0] - ax;
    const dy = poly[i]![1] - ay;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
    const ex = ax + t * dx - x;
    const ey = ay + t * dy - y;
    if (ex * ex + ey * ey < m2) return true;
  }
  return false;
}

function sampleQuad(a: Pt, b: Pt, bend: number, n = 18): Pt[] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const off = bend * l;
  const qx = mx - (dy / l) * off;
  const qy = my + (dx / l) * off;
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    out.push([(1 - s) ** 2 * a[0] + 2 * (1 - s) * s * qx + s * s * b[0], (1 - s) ** 2 * a[1] + 2 * (1 - s) * s * qy + s * s * b[1]]);
  }
  return out;
}

/** Densify a polyline so every sample can be tested against the obstacles. */
function densify(pts: readonly Pt[], step = 3): Pt[] {
  const out: Pt[] = [pts[0]!];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
}

function chaikin(pts: Pt[], rounds: number): Pt[] {
  let p = pts;
  for (let r = 0; r < rounds; r++) {
    const q: Pt[] = [p[0]!];
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i]!;
      const b = p[i + 1]!;
      q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    q.push(p[p.length - 1]!);
    p = q;
  }
  return p;
}

/**
 * A route for the thread between two centres that stays out of every obstacle:
 * a gentle hand-drawn curve when that is clear, otherwise A* on a coarse grid,
 * pulled straight where it can be and smoothed. Null when there is no way.
 */
function route(a: Pt, b: Pt, bend: number, blocked: (x: number, y: number) => boolean, W: number, H: number): Pt[] | null {
  const clear = (pts: readonly Pt[]) => densify(pts).every(([x, y]) => !blocked(x, y));
  for (const k of [1, -1, 1.8, -1.8, 0]) {
    const pts = sampleQuad(a, b, bend * k);
    if (clear(pts)) return pts;
  }
  const cell = 6;
  const gw = Math.ceil(W / cell);
  const gh = Math.ceil(H / cell);
  const cx = (i: number) => (i + 0.5) * cell;
  const idx = (x: number, y: number) => Math.min(gh - 1, Math.max(0, Math.floor(y / cell))) * gw + Math.min(gw - 1, Math.max(0, Math.floor(x / cell)));
  const start = idx(a[0], a[1]);
  const goal = idx(b[0], b[1]);
  const free = new Int8Array(gw * gh);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) free[j * gw + i] = blocked(cx(i), cx(j)) ? 0 : 1;
  free[start] = 1;
  free[goal] = 1;
  const g = new Float32Array(gw * gh).fill(Infinity);
  const from = new Int32Array(gw * gh).fill(-1);
  const open: [number, number][] = [[0, start]];
  g[start] = 0;
  const gx = goal % gw;
  const gy = (goal - gx) / gw;
  const h = (n: number) => {
    const x = n % gw;
    const y = (n - x) / gw;
    const dx = Math.abs(x - gx);
    const dy = Math.abs(y - gy);
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
  };
  const done = new Uint8Array(gw * gh);
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i]![0] < open[bi]![0]) bi = i;
    const [, n] = open.splice(bi, 1)[0]!;
    if (done[n]) continue;
    done[n] = 1;
    if (n === goal) break;
    const x = n % gw;
    const y = (n - x) / gw;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const m = ny * gw + nx;
        if (!free[m] || done[m]) continue;
        // No cutting a blocked corner.
        if (dx && dy && (!free[y * gw + nx] || !free[ny * gw + x])) continue;
        const cost = g[n]! + (dx && dy ? 1.414 : 1);
        if (cost < g[m]!) {
          g[m] = cost;
          from[m] = n;
          open.push([cost + h(m), m]);
        }
      }
    }
  }
  if (from[goal] === -1 && start !== goal) return null;
  const cells: Pt[] = [];
  for (let n = goal; n !== -1; n = from[n]!) cells.push([cx(n % gw), cx((n - (n % gw)) / gw)]);
  cells.reverse();
  cells[0] = a;
  cells[cells.length - 1] = b;
  // String pulling: jump to the farthest waypoint that can be reached in a straight line.
  const way: Pt[] = [cells[0]!];
  let at = 0;
  while (at < cells.length - 1) {
    let far = at + 1;
    for (let k = cells.length - 1; k > at + 1; k--) {
      if (clear([cells[at]!, cells[k]!])) {
        far = k;
        break;
      }
    }
    way.push(cells[far]!);
    at = far;
  }
  // Round the corners as far as the obstacles allow: a stitched thread bends, it does not fold.
  for (const rounds of [4, 3, 2, 1]) {
    const smooth = chaikin(way, rounds);
    if (clear(smooth)) return smooth;
  }
  return way;
}

/** Keep only the stretch of a polyline that is outside both end fragments. */
function trim(raw: Pt[], a: readonly Pt[], b: readonly Pt[]): Pt[] {
  const pts = densify(raw, 4);
  const out = pts.filter((p) => !pointInPoly(p, a) && !pointInPoly(p, b));
  return out.length < 2 ? pts : out;
}

function attempt(input: LayoutInput, scale: number, safe: Rect): Attempt {
  const { width: W, height: H, states } = input;
  const land = W > H * 1.15 ? "l" : "p";
  const seeds = SEEDS[land];
  const cellW = land === "p" ? Math.min(W / 2, (safe.h + 60) / 3) : Math.min(W / 3, (safe.h + 60) / 2);
  const dims: Record<MapState, [number, number]> = {
    walked: [0.68 * cellW * scale, 0.74 * cellW * scale],
    now: [1.0 * cellW * scale, 1.06 * cellW * scale],
    ahead: [0.6 * cellW * scale, 0.51 * cellW * scale],
  };
  const band = MIN_LABEL_PT + 15 + 8 + 8; // the label under a fragment
  const fragments = {} as Record<MapArea, Fragment>;
  for (const area of AREAS) {
    const st = states[area];
    const [fx, fy] = seeds[area];
    const [w, h] = dims[st];
    // Keep the fragment, and the label under it, inside the safe rect.
    const cx = Math.min(Math.max(fx * W, safe.x + w / 2 + 2), safe.x + safe.w - w / 2 - 2);
    const cy = Math.min(Math.max(fy * H, safe.y + h / 2 + 2), safe.y + safe.h - h / 2 - band);
    const r = rng(hashStr(area) + 5);
    const rot = ((r() - 0.5) * 3.2 * Math.PI) / 180;
    const poly = fragPoly(cx, cy, w, h, hashStr(area) % (st === "ahead" ? 61 : 77), st !== "ahead", st === "ahead" ? 0 : rot);
    const bbox = bboxOf(poly);
    const hw = Math.max(MIN_HIT, bbox.w);
    const hh = Math.max(MIN_HIT, bbox.h);
    fragments[area] = { area, state: st, poly, bbox, center: [cx, cy], hit: { x: cx - hw / 2, y: cy - hh / 2, w: hw, h: hh } };
  }
  let complete = true;
  for (const a of AREAS) for (const b of AREAS) if (a < b && rectsTouch(inflate(fragments[a].bbox, 3), fragments[b].bbox)) complete = false;

  // ── labels, in the paper around the fragments (before the thread: it routes around them)
  const labels: Partial<Record<MapArea, MapLabel>> = {};
  const placed: Rect[] = [];
  const order = [...AREAS].sort((p, q) => ({ now: 0, walked: 1, ahead: 2 })[states[p]] - ({ now: 0, walked: 1, ahead: 2 })[states[q]]);
  for (const area of order) {
    const f = fragments[area];
    const { w, h, nameSize } = labelSize(states[area], input, area);
    const bb = f.bbox;
    const cy = f.center[1];
    let found: { rect: Rect; align: "left" | "right" } | null = null;
    let best = Infinity;
    const gapTo = (r: Rect, o: Rect) => Math.max(0, Math.max(o.x - (r.x + r.w), r.x - (o.x + o.w), o.y - (r.y + r.h), r.y - (o.y + o.h)));
    for (const out of [6, 12, 20, 30, 42]) {
      const cands: { rect: Rect; align: "left" | "right" }[] = [
        { rect: { x: bb.x + 6, y: bb.y + bb.h + out, w, h }, align: "left" },
        { rect: { x: bb.x + bb.w - 6 - w, y: bb.y + bb.h + out, w, h }, align: "right" },
        { rect: { x: bb.x + bb.w + out + 2, y: cy - h / 2, w, h }, align: "left" },
        { rect: { x: bb.x - out - 2 - w, y: cy - h / 2, w, h }, align: "right" },
        { rect: { x: bb.x + 6, y: bb.y - out - h, w, h }, align: "left" },
        { rect: { x: bb.x + bb.w - 6 - w, y: bb.y - out - h, w, h }, align: "right" },
        { rect: { x: bb.x + (bb.w - w) / 2, y: bb.y + bb.h + out, w, h }, align: "left" },
        { rect: { x: bb.x + (bb.w - w) / 2, y: bb.y - out - h, w, h }, align: "left" },
      ];
      for (const c of cands) {
        const r = c.rect;
        if (r.x < safe.x || r.x + r.w > safe.x + safe.w || r.y < safe.y || r.y + r.h > safe.y + safe.h) continue;
        const pad = inflate(r, 3);
        if (AREAS.some((o) => rectTouchesPoly(pad, fragments[o].poly))) continue;
        if (placed.some((p) => rectsTouch(pad, p))) continue;
        // A label belongs to the nearest fragment: prefer places clearly nearer its own than any other,
        // and away from other labels, so two captions never read as one group.
        const own = gapTo(r, bb);
        let other = 60;
        for (const o of AREAS) if (o !== area) other = Math.min(other, gapTo(r, fragments[o].bbox));
        for (const p of placed) other = Math.min(other, gapTo(r, p) * 1.5);
        const cost = own * 1.2 - other * 0.8 + (r.y < bb.y ? 6 : 0);
        if (cost < best) {
          best = cost;
          found = c;
        }
      }
    }
    if (!found) {
      complete = false;
      continue;
    }
    placed.push(found.rect);
    labels[area] = { area, rect: found.rect, nameSize, subSize: MIN_LABEL_PT, align: found.align };
  }

  // ── the thread: oldest walked → ... → current, plus a pencil stitch toward what is ahead
  const now = AREAS.find((a) => states[a] === "now");
  const walked = AREAS.filter((a) => states[a] === "walked");
  const ahead = AREAS.filter((a) => states[a] === "ahead");
  const centerOf = (a: MapArea) => fragments[a].center;
  const dist = (p: Pt, q: Pt) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const seq: MapArea[] = [];
  const pool = [...walked];
  if (pool.length) {
    const first = now ? pool.reduce((m, a) => (dist(centerOf(a), centerOf(now)) > dist(centerOf(m), centerOf(now)) ? a : m)) : pool[0]!;
    seq.push(first);
    pool.splice(pool.indexOf(first), 1);
    while (pool.length) {
      const lp = centerOf(seq[seq.length - 1]!);
      const nx = pool.reduce((m, a) => (dist(centerOf(a), lp) < dist(centerOf(m), lp) ? a : m));
      seq.push(nx);
      pool.splice(pool.indexOf(nx), 1);
    }
  }
  if (now) seq.push(now);
  const links: [MapArea, MapArea, "walked" | "ahead"][] = [];
  for (let i = 0; i < seq.length - 1; i++) links.push([seq[i]!, seq[i + 1]!, "walked"]);
  const tail = seq[seq.length - 1];
  if (tail && ahead.length) {
    const nxt = ahead.reduce((m, a) => (dist(centerOf(a), centerOf(tail)) < dist(centerOf(m), centerOf(tail)) ? a : m));
    links.push([tail, nxt, "ahead"]);
  }
  const labelRects = Object.values(labels).map((l) => inflate(l!.rect, 5));
  const threads: Thread[] = [];
  links.forEach(([a, b, kind], k) => {
    const blocked = (x: number, y: number) => {
      for (const o of AREAS) {
        if (o === a || o === b) continue;
        if (nearPoly(x, y, fragments[o].poly, fragments[o].bbox, 4)) return true;
      }
      for (const r of labelRects) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true;
      return x < 4 || y < 4 || x > W - 4 || y > H - 4;
    };
    const path = route(centerOf(a), centerOf(b), 0.1 * (k % 2 === 0 ? 1 : -1), blocked, W, H);
    if (!path) {
      complete = false;
      threads.push({ kind, from: a, to: b, pts: sampleQuad(centerOf(a), centerOf(b), 0) });
      return;
    }
    threads.push({ kind, from: a, to: b, pts: trim(path, fragments[a].poly, fragments[b].poly) });
  });
  return { fragments, threads, labels, complete };
}

/** The tallest the Atlas map ever needs to be: below this, six territories fit at full size. */
export function fitHeight(input: Omit<LayoutInput, "height">, from: number, to: number): number {
  for (let h = from; h < to; h += 20) {
    const l = buildLayout({ ...input, height: h });
    if (l.scale >= 0.8 && checkLayout(l, input.states).length === 0) return h;
  }
  return to;
}

export function buildLayout(input: LayoutInput): MapLayout {
  const { width: W, height: H, states } = input;
  const land = W > H * 1.15 ? "l" : "p";
  const padTop = input.padTop ?? 12;
  const padBottom = input.padBottom ?? 12;
  const safe: Rect = { x: 10, y: padTop, w: W - 20, h: H - padTop - padBottom };

  // The fit loop: label type is never reduced; the fragments give way instead.
  let best: Attempt | null = null;
  let scale = 1;
  for (const s of [1, 0.94, 0.88, 0.82, 0.77, 0.72, 0.67, 0.62, 0.56, 0.5]) {
    const a = attempt(input, s, safe);
    scale = s;
    best = a;
    if (a.complete) break;
  }
  const att = best!;

  // The landform: six soft rises, two bays, nothing else.
  const centers = AREAS.map((a) => att.fragments[a].center);
  const bayDefs: [number, number, number, number][] =
    land === "p"
      ? [
          [W + 20, -20, 130, 1.3],
          [-25, H + 23, 135, 1.3],
        ]
      : [
          [W + 26, -20, 170, 1.3],
          [-30, H + 30, 190, 1.3],
        ];
  const field = heightField(W, H, centers, bayDefs, 8);

  const coastLines = contourLines(field, COAST);
  const ex0 = field.x0;
  const ey0 = field.y0;
  const ex1 = field.x0 + (field.nx - 1) * STEP;
  const ey1 = field.y0 + (field.ny - 1) * STEP;
  const corners: Pt[] = [
    [ex0, ey0],
    [ex1, ey0],
    [ex1, ey1],
    [ex0, ey1],
  ];
  const bays: Pt[][] = [];
  const coast: Pt[][] = [];
  for (const line of coastLines) {
    if (line.length < 4) continue;
    // A coast beyond the canvas (a grid-margin sliver) is not part of the picture.
    if (!line.some(([x, y]) => x > 0 && x < W && y > 0 && y < H)) continue;
    coast.push(line);
    const first = line[0]!;
    const last = line[line.length - 1]!;
    const closedLoop = Math.hypot(first[0] - last[0], first[1] - last[1]) < STEP;
    if (closedLoop) {
      bays.push(line);
      continue;
    }
    // Open arc across a corner: close it through the nearest canvas corner.
    const mx = line.reduce((s, p) => s + p[0], 0) / line.length;
    const my = line.reduce((s, p) => s + p[1], 0) / line.length;
    const corner = corners.reduce((m, c) => (Math.hypot(c[0] - mx, c[1] - my) < Math.hypot(m[0] - mx, m[1] - my) ? c : m));
    bays.push([...line, corner]);
  }

  // One quiet contour system.
  const zs = field.z;
  let zmax = -Infinity;
  for (let i = 0; i < zs.length; i++) if (zs[i]! > zmax) zmax = zs[i]!;
  const lo = COAST + 0.05;
  const hi = zmax - 0.02;
  const contours: Contour[] = [];
  for (let i = 0; i < 9; i++) {
    const lv = lo + (hi - lo) * (i / 8) ** 1.55;
    const jr = rng(Math.round(lv * 1000));
    for (const line of contourLines(field, lv)) {
      if (line.length < 6) continue;
      const thin = line.length > 40 ? line.filter((_, k) => k % 3 === 0 || k === line.length - 1) : line;
      contours.push({
        pts: thin.map(([x, y]) => [x + uni(jr, -0.7, 0.7), y + uni(jr, -0.7, 0.7)] as Pt),
        index: i === 3 || i === 6,
      });
    }
  }

  // Coverage: scenic fragments' share of the visible landform, sampled on a grid.
  let landCells = 0;
  let scenicCells = 0;
  const scenic = AREAS.filter((a) => states[a] !== "ahead").map((a) => att.fragments[a]);
  const cell = 5;
  for (let y = 2; y < H; y += cell) {
    for (let x = 2; x < W; x += cell) {
      const i = Math.round((x - field.x0) / STEP);
      const j = Math.round((y - field.y0) / STEP);
      if (field.z[j * field.nx + i]! <= COAST) continue;
      landCells++;
      for (const f of scenic) {
        const b = f.bbox;
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h && pointInPolyXY(x, y, f.poly)) {
          scenicCells++;
          break;
        }
      }
    }
  }
  const coverage = landCells ? scenicCells / landCells : 0;

  const labels = {} as Record<MapArea, MapLabel>;
  for (const a of AREAS) {
    labels[a] =
      att.labels[a] ??
      // Unplaced: park it under the fragment; `checkLayout` reports it.
      {
        area: a,
        rect: { x: att.fragments[a].bbox.x, y: att.fragments[a].bbox.y + att.fragments[a].bbox.h + 6, ...pick(labelSize(states[a], input, a)) },
        nameSize: states[a] === "now" ? 17 : 15,
        subSize: MIN_LABEL_PT,
        align: "left",
      };
  }
  return {
    width: W,
    height: H,
    bays,
    coast,
    contours,
    fragments: att.fragments,
    labels,
    threads: att.threads,
    order: [...AREAS],
    coverage,
    scale,
    safe,
  };
}

function pick(s: { w: number; h: number }) {
  return { w: s.w, h: s.h };
}

// ── the rules, as checks ────────────────────────────────────────────────────

/** Every violated rule, as a sentence. Empty = the layout keeps all of its promises. */
export function checkLayout(l: MapLayout, states: Record<MapArea, MapState>): string[] {
  const bad: string[] = [];
  if (l.coverage > MAX_COVERAGE) bad.push(`scenic fragments cover ${(l.coverage * 100).toFixed(0)}% of the landform (max 60%)`);
  const full = AREAS.filter((a) => states[a] === "now" && l.fragments[a].state === "now");
  if (full.length > 1) bad.push(`${full.length} full-colour territories (max 1)`);
  const nowCount = AREAS.filter((a) => l.fragments[a].state === "now").length;
  if (nowCount > 1) bad.push(`${nowCount} current territories`);
  for (const a of AREAS) {
    const lab = l.labels[a];
    const f = l.fragments[a];
    if (lab.nameSize < MIN_LABEL_PT || lab.subSize < MIN_LABEL_PT) bad.push(`${a}: label below ${MIN_LABEL_PT} pt`);
    const r = lab.rect;
    if (r.x < l.safe.x - 0.5 || r.y < l.safe.y - 0.5 || r.x + r.w > l.safe.x + l.safe.w + 0.5 || r.y + r.h > l.safe.y + l.safe.h + 0.5) bad.push(`${a}: label outside the canvas`);
    for (const o of AREAS) if (rectTouchesPoly(r, l.fragments[o].poly)) bad.push(`${a}: label touches the ${o} fragment`);
    if (f.hit.w < MIN_HIT || f.hit.h < MIN_HIT) bad.push(`${a}: hit area under ${MIN_HIT}`);
    for (const t of l.threads) if (polylineTouchesRect(t.pts, r)) bad.push(`${a}: label crosses the thread`);
    for (const o of AREAS) if (AREAS.indexOf(o) > AREAS.indexOf(a) && rectsTouch(r, l.labels[o].rect)) bad.push(`${a}/${o}: labels overlap`);
    const fb = f.bbox;
    if (fb.x < 0 || fb.y < 0 || fb.x + fb.w > l.width || fb.y + fb.h > l.height) bad.push(`${a}: fragment leaves the canvas`);
  }
  for (const a of AREAS) for (const b of AREAS) if (a < b && rectsTouch(l.fragments[a].bbox, l.fragments[b].bbox)) bad.push(`${a}/${b}: fragments overlap`);
  for (const t of l.threads) {
    for (const o of AREAS) {
      if (o === t.from || o === t.to) continue;
      if (t.pts.some((p) => pointInPoly(p, l.fragments[o].poly))) bad.push(`thread ${t.from}→${t.to} crosses the ${o} fragment`);
    }
  }
  return bad;
}
