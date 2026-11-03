/**
 * The arithmetic of the photo band (Oct 2026 "Money Journey" prototype,
 * `index.html`): how tall the scene band is in each state, how far along the
 * picture the day stands, the torn paper edges, and the strip the picture is
 * laid on. Pure, so it is tested in Node; `BandDay` only turns it into views.
 */
import { isAnswered, isAside, isNoneChoice, type DayStep, type DayStepAnswers, type DayValue } from "@elara/shared";

/** The four layouts of the prototype: before the first step, a step, the day done, the week revealed. */
export type BandState = "arrive" | "step" | "done" | "atlas";

/** The prototype's band heights: the 390 x 844 phone, and its 320 x 568 large-text mode. */
export const BAND_HEIGHTS = {
  regular: { arrive: 430, step: 290, done: 290, atlas: 430 },
  compact: { arrive: 330, step: 170, done: 200, atlas: 300 },
} as const satisfies Record<string, Record<BandState, number>>;

/** Below this window height (or at a large text size) the compact heights are used. */
export const COMPACT_BELOW = 700;
export const COMPACT_FONT_SCALE = 1.35;

export function bandSize({ height, fontScale = 1 }: { height: number; fontScale?: number }): keyof typeof BAND_HEIGHTS {
  return height < COMPACT_BELOW || fontScale >= COMPACT_FONT_SCALE ? "compact" : "regular";
}

/**
 * How tall the scene band is. While she types, the place pill folds into the
 * header row (`BandDay`), so the band steps down to a strip just tall enough
 * for the top controls: the question, the field and Next all stand above the
 * keyboard, and nothing sits over the question.
 */
export function bandHeight(
  state: BandState,
  {
    height,
    fontScale = 1,
    keyboard = false,
    reply = false,
    topInset = 0,
  }: { height: number; fontScale?: number; keyboard?: boolean; reply?: boolean; topInset?: number },
): number {
  const table = BAND_HEIGHTS[bandSize({ height, fontScale })];
  // The back circle (44) and the pill above the band's foot (about 41) must both fit under the status bar.
  const floor = Math.round(topInset + CIRCLE + PILL_RISE + 8);
  if (keyboard && state === "step") return Math.max(KEYBOARD_BAND, Math.round(topInset + CIRCLE + KEYBOARD_GAP));
  // A step that opens on Elara's reply gives the page the compact band, so her
  // whole reply has room above the fixed footer (it can run to several lines).
  if (reply && state === "step") return Math.max(BAND_HEIGHTS.compact.step, floor);
  // A very tall window (an iPad) keeps the phone's proportions rather than a fixed height.
  const scaled = height > PHONE_H ? Math.round(table[state] * (height / PHONE_H)) : table[state];
  return Math.max(scaled, floor);
}

/**
 * The band over a daily session's opening and close (Nov 2026). Under it
 * stand the day's title, «Por qué hoy», the card she will fill and the week's
 * note or the last thing she noted, all to be read before «Empezar»; on the
 * close, her card with Elara's note under it. The picture keeps the compact
 * day-done height on every phone, scaled on a taller window like the rest, and
 * never under the controls.
 */
export function sessionBand({ height, topInset = 0 }: { height: number; topInset?: number }): number {
  const floor = Math.round(topInset + CIRCLE + PILL_RISE + 8);
  const base = BAND_HEIGHTS.compact.done;
  return Math.max(height > PHONE_H ? Math.round(base * (height / PHONE_H)) : base, floor);
}

/** The tallest band a layout can show: the scene is laid out once at this height and scaled down. */
export function bandMax(dims: { height: number; fontScale?: number; topInset?: number }): number {
  return Math.max(bandHeight("arrive", dims), bandHeight("atlas", dims), bandHeight("step", dims), bandHeight("done", dims));
}

/**
 * How far along the picture the day stands: 0 at the arrival, one step of
 * `steps + 1` per question, 1 when the day is done. The week's reveal drifts
 * the whole way (`BandDay`), so it has no one place.
 */
export function panFraction(state: BandState, stepIndex = 0, steps = 1): number {
  if (state === "arrive") return 0;
  if (state === "done" || state === "atlas") return 1;
  const n = Math.max(1, Math.floor(steps));
  const i = Math.max(0, Math.min(n - 1, Math.floor(stepIndex)));
  return (i + 1) / (n + 1);
}

/** The prototype's pan: 1.8 s on cubic-bezier(.4, .05, .25, 1). */
export const PAN_MS = 1800;
export const PAN_BEZIER = [0.4, 0.05, 0.25, 1] as const;
/** The slow "breathe" zoom (16 s each way) and the reveal's drift (26 s each way). */
export const BREATHE_MS = 16000;
export const DRIFT_MS = 26000;
/** The band's height change (the prototype's `.5s ease`). */
export const BAND_MS = 500;
/** The orb's glow (5 s). */
export const GLOW_MS = 5000;

/** The prototype's controls: 44 pt circles, the pill rising about 41 pt above the band's foot. */
export const CIRCLE = 44;
export const PILL_RISE = 41;
/** The band while she types: the controls row (with the folded pill) and a sliver of the picture under it. */
export const KEYBOARD_BAND = 112;
const KEYBOARD_GAP = 16;
const PHONE_H = 844;

/**
 * The prototype's torn edge (`torn(seed, amp)`): 27 points across the width,
 * each torn up from the foot by a pseudo-random share of `amp` per cent of the
 * box's height. Returned as depths in [0, amp / 100), left to right.
 */
export function tornDepths(seed: number, amp: number, n = 26): number[] {
  const out: number[] = [];
  for (let i = 0; i <= n; i++) {
    let r = Math.sin(i * 12.9898 + seed) * 43758.5453;
    r -= Math.floor(r);
    out.push((r * amp) / 100);
  }
  return out;
}

/** The scene's edge (seed 7, 4%) and the offset sheet's behind it (seed 3, 3.5%, 7 pt lower). */
export const SCENE_TORN = { seed: 7, amp: 4 } as const;
export const SHEET_TORN = { seed: 3, amp: 3.5, drop: 7 } as const;

/**
 * The paper drawn over the foot of the band: the darker sheet showing under
 * the scene's torn edge, and the page under the sheet's. Coordinates are the
 * overlay's own, with its top `depth` above the band's foot and its bottom
 * at the sheet's foot (`drop` below the band). Where the sheet's tear rises
 * above the scene's, the scene stays in front, as in the prototype.
 */
export function tornOverlay(width: number, band: number): { top: number; height: number; sheet: string; page: string } {
  const scene = tornDepths(SCENE_TORN.seed, SCENE_TORN.amp);
  const sheet = tornDepths(SHEET_TORN.seed, SHEET_TORN.amp);
  const sheetH = band + SHEET_TORN.drop;
  const depth = Math.ceil(band * (SCENE_TORN.amp / 100)) + 1;
  const height = depth + SHEET_TORN.drop;
  const n = scene.length - 1;
  const x = (i: number) => round((i / n) * width);
  // Overlay y of a band y: the overlay's top is `band - depth`.
  const sceneY = scene.map((d) => depth - d * band);
  const sheetY = sheet.map((d, i) => Math.max(sceneY[i]!, depth + SHEET_TORN.drop - d * sheetH));
  const path = (ys: number[]) =>
    `M0 ${height} ${ys.map((y, i) => `L${x(i)} ${round(y)}`).join(" ")} L${round(width)} ${height} Z`;
  return { top: band - depth, height, sheet: path(sceneY), page: path(sheetY) };
}

const round = (v: number) => Math.round(v * 10) / 10;

/**
 * How a day's photograph fills the band. A picture wider than the window at
 * the band's tallest (a panorama, a landscape photo) is a strip the day pans
 * across; a narrower one (a portrait photo, or any picture on a very wide
 * window) is laid at the window's width and pans down instead, so a tall
 * picture is never squeezed into a sliver.
 */
export function photoFit(aspect: number, width: number, hMax: number): "wide" | "tall" {
  return aspect * hMax > width ? "wide" : "tall";
}

/**
 * The strip a wide picture is laid on, at the band's tallest height `hMax`:
 * the picture itself. The band scales it down to the height it stands at (so
 * the whole height of the picture always shows, as `background-size: auto
 * 100%` does), and pans it by `-(stripWidth * scale - width) * along`.
 */
export function stripFor({
  width,
  hMax,
  aspect,
}: {
  width: number;
  hMax: number;
  /** The picture's width over its height. */
  aspect: number;
}): { aspect: number; width: number; height: number; image: { width: number; height: number; left: number; top: number } } {
  const w = hMax * aspect;
  // Never narrower than the window: a narrower picture is `tall` (`photoFit`), this only guards the arithmetic.
  const sw = Math.max(w, width);
  const scale = sw / w;
  const image = { width: w * scale, height: hMax * scale };
  return {
    aspect: sw / hMax,
    width: sw,
    height: hMax,
    image: { ...image, left: (sw - image.width) / 2, top: (hMax - image.height) / 2 },
  };
}

/**
 * Where a tall picture's day pans, as shares of how far it can travel down
 * (0 its top at the band's top, 1 its foot at the band's foot): the middle
 * half, so the arrival opens a little below the sky and the day never ends on
 * the very foot of the picture.
 */
export const TALL_PAN = { from: 0.25, to: 0.75 } as const;

/**
 * The frame a tall picture is laid in: the window's width (or wider, centred,
 * when even that would leave it shorter than the band), and as tall as that
 * makes it. `BandDay` slides it up by `(height - band) * along`, between
 * `TALL_PAN.from` and `TALL_PAN.to`.
 */
export function tallFrame({ width, hMax, aspect }: { width: number; hMax: number; aspect: number }): {
  width: number;
  height: number;
  left: number;
} {
  const a = Math.max(0.01, aspect);
  const height = Math.max(width / a, hMax);
  const w = height * a;
  return { width: w, height, left: (width - w) / 2 };
}

/** How far a tall picture stands up from its top for a band height and a place along the day (0 to 1). */
export function tallOffset(frameH: number, band: number, along: number): number {
  const share = TALL_PAN.from + (TALL_PAN.to - TALL_PAN.from) * Math.max(0, Math.min(1, along));
  return -Math.max(0, frameH - band) * share;
}

/** Where the strip's left edge sits for a band height and a place along it (0 left edge, 1 right edge). */
export function stripOffset(stripAspect: number, band: number, width: number, along: number): number {
  return -Math.max(0, stripAspect * band - width) * along;
}

/** One row of "What shifted": a question of the week, small, and her answer to it. */
export interface ShiftedRow {
  day: number;
  stepId: string;
  question: string;
  answer: string;
}

/**
 * "What shifted" on the week's reveal: up to `max` of her own answers from
 * the week, as a question and her answer. The week's rule comes first, then
 * the lines she kept, then anything else she said, and they are listed in the
 * order she walked them. A hidden step's words, a skipped step and a
 * non-answer ("not sure") never appear.
 */
export function shiftedRows({
  days,
  book,
  question,
  answer,
  max = 3,
}: {
  /** The week's days in order, each with its steps. */
  days: readonly { day: number; steps: readonly DayStep[] }[];
  book: Readonly<Record<number, DayStepAnswers | undefined>>;
  /** The question as she was asked it (templates filled). */
  question: (step: DayStep, day: number) => string;
  /** Her answer in words, or "" when there is nothing to say back. */
  answer: (value: DayValue, step: DayStep) => string;
  max?: number;
}): ShiftedRow[] {
  const found: (ShiftedRow & { rank: number; order: number })[] = [];
  let order = 0;
  for (const { day, steps } of days) {
    for (const step of steps) {
      order++;
      if (step.config?.hidden || step.kind === "followUp" || isAside(step)) continue;
      const held = book[day]?.[step.id];
      if (!held || !isAnswered(held)) continue;
      // «Ninguna por ahora» is a choice, not something that shifted (`noneOption`).
      if (isNoneChoice(step, held.value)) continue;
      const text = answer(held.value, step).trim();
      const q = question(step, day).trim();
      if (!text || !q) continue;
      const rank = step.config?.keep === "rule" ? 0 : step.config?.keep ? 1 : 2;
      found.push({ day, stepId: step.id, question: q, answer: text, rank, order });
    }
  }
  return found
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, Math.max(0, max))
    .sort((a, b) => a.order - b.order)
    .map(({ day, stepId, question: q, answer: a }) => ({ day, stepId, question: q, answer: a }));
}
