import { MEADOW_DEPTH } from "./meadowLayout";

/**
 * The scroll timeline of the Mist Meadow chapter. Pure, so it can be tested.
 *
 * The chapter teaches how a 7-day path works, one beat at a time, and the
 * meadow shows it in the engine's own terms (haze, mist, glow, sun, the hedge's
 * sketch -> paper reveal, the way ahead):
 *
 *   0  Day 1       you begin where you are        mist at its heaviest
 *   1  Days 2-3    one small practice each day    the way ahead starts to show
 *   2  Days 4-5    Elara keeps what you notice    mist thins, more of the path
 *   3  Days 6-7    the path becomes clearer       the hedge resolves, light warms
 *   4  Completion  your Atlas keeps what you walked   the week is set down
 *
 * p runs 0 -> 1 over the pinned span; each beat owns a fifth of it.
 */
export const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const span = (p: number, a: number, b: number) => smooth((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const BEATS = 5;
const CAMERA_Z = 0.1;
const SUN_RISE = 8; // art units
/** Her marker walks a short way up the drawn path (art units): about a fifth of
 *  the way to Day 2's stop and a half to Day 3's. Minimal on purpose. */
const WALK_Y = 26;
const WALK_X = 2.6;

/** When each day's stop arrives (Day 1 is the marker the art already draws). */
const STOP_AT: Record<number, [number, number]> = {
  2: [0.22, 0.28],
  3: [0.3, 0.36],
  4: [0.42, 0.48],
  5: [0.5, 0.56],
  6: [0.62, 0.68],
  7: [0.7, 0.76],
};

/** A caption hand-off at boundary b: the old line is fully gone before the next arrives. */
const out = (p: number, b: number) => span(p, b - 0.03, b - 0.005);
const into = (p: number, b: number) => span(p, b + 0.005, b + 0.03);

export function look(p: number, camera: boolean) {
  const a = (lo: number, hi: number) => span(p, lo, hi);
  const z = camera ? CAMERA_Z * a(0.2, 0.9) : 0;
  const scale = (D: number) => D / (D - z); // engine: s(z) / s(0)
  const ahead = lerp(0.15, 1, a(0.2, 0.5));
  const haze = 0.7 - 0.12 * a(0.2, 0.4) - 0.16 * a(0.4, 0.6) - 0.3 * a(0.6, 0.8) - 0.08 * a(0.8, 0.95);
  const mist = 1 - 0.2 * a(0.2, 0.4) - 0.3 * a(0.4, 0.6) - 0.3 * a(0.6, 0.8) - 0.1 * a(0.8, 0.95);
  const stops = [2, 3, 4, 5, 6, 7].map((d) => a(STOP_AT[d][0], STOP_AT[d][1]));
  const walk = a(0.3, 0.86);
  // A stop she has walked past is behind her: it fades as the marker reaches it.
  const shown = stops.map((v, i) => (i === 0 ? v * (1 - span(walk, 0.5, 0.68)) : v));
  return {
    haze, // 0.70 -> 0.04: the engine's haze range
    mist,
    glow: lerp(0.15, 0.85, a(0.55, 0.92)), // the engine's glow range
    sunY: -SUN_RISE * a(0.55, 0.92),
    ahead,
    sketch: 1 - a(0.64, 0.8),
    paper: a(0.64, 0.8),
    stops: shown,
    walk,
    mkY: -WALK_Y * walk,
    mkX: WALK_X * walk,
    // Day dashes: Day 1 is lit from the start; each later day as its stop lands.
    days: [1, ...stops],
    atlas: a(0.86, 0.94),
    s: {
      hills: scale(MEADOW_DEPTH.hills),
      hedge: scale(MEADOW_DEPTH["hedge-paper"]),
      hillsNear: scale(MEADOW_DEPTH["hills-near"]),
      mist: scale(MEADOW_DEPTH.mist),
    },
    c: [
      1 - out(p, 0.2),
      into(p, 0.2) * (1 - out(p, 0.4)),
      into(p, 0.4) * (1 - out(p, 0.6)),
      into(p, 0.6) * (1 - out(p, 0.8)),
      into(p, 0.8),
    ],
  };
}
