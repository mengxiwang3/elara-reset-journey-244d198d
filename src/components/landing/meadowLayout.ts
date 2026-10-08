/**
 * GENERATED — do not edit by hand.
 *
 * Mist Meadow, Day 1 start (camera z = 0), drawn by the Elara app's own world
 * engine: apps/mobile/src/components/world/engine/meadow.ts, upstream/main
 * @ 5032e03 (github.com/vasantakmr/Elara). Each band is the engine's layers
 * composed exactly as `meadowInner` composes a still, rasterised at 2.4 px per
 * art unit (1920 x 684) and cropped to its content. Boxes are % of the frame.
 *
 * Fidelity: recomposited at the engine's Day 1 values these bands match the
 * engine's own frame to 0.07% of pixels (>8/255). The one simplification: the
 * mist bands are one band, so they can lift together.
 */
/** Art-space window: x, y, w, h. */
export const MEADOW_VIEW = [-250, 85, 800, 285] as const;
/** The engine's vanishing point, art space. */
export const MEADOW_VP = [150, 196] as const;

export type Box = { x: number; y: number; w: number; h: number };
export const MEADOW_LAYOUT: Record<string, Box> = {
  "back": { x: 0.0000, y: 0.0000, w: 100.0000, h: 100.0000 },
  "sun": { x: 53.4375, y: 4.6784, w: 7.1875, h: 20.9064 },
  "glow": { x: 49.6354, y: 0.0000, w: 14.7396, h: 35.8187 },
  "hills": { x: 26.6667, y: 38.4503, w: 46.6667, h: 61.5497 },
  "hedge-sketch": { x: 33.0729, y: 31.5789, w: 33.1771, h: 22.0760 },
  "hedge-paper": { x: 33.0208, y: 32.1637, w: 32.6042, h: 23.3918 },
  "hills-near": { x: 18.3333, y: 52.4854, w: 63.3854, h: 47.5146 },
  "mist": { x: 22.3958, y: 26.3158, w: 55.1562, h: 37.8655 },
  "haze": { x: 0.0000, y: 19.7368, w: 100.0000, h: 41.0819 },
  "trail": { x: 45.9896, y: 40.6433, w: 6.0417, h: 59.3567 },
  "ahead": { x: 49.2188, y: 41.8129, w: 1.5625, h: 46.3450 },
  "marker": { x: 48.6979, y: 85.0877, w: 2.1354, h: 14.9123 },
  "near": { x: 32.1354, y: 85.9649, w: 37.7604, h: 12.4269 },
  "stop2": { x: 49.7917, y: 80.5556, w: 0.9375, h: 2.6316 },
  "stop3": { x: 50.0521, y: 71.9298, w: 0.9375, h: 2.6316 },
  "stop4": { x: 49.6354, y: 64.3275, w: 0.9375, h: 2.6316 },
  "stop5": { x: 49.0625, y: 57.0175, w: 0.9375, h: 2.6316 },
  "stop6": { x: 49.1667, y: 48.9766, w: 0.9375, h: 2.6316 },
  "stop7": { x: 49.5312, y: 41.8129, w: 0.8854, h: 2.6316 },
};

/** Depth distance of each band that moves with the camera (engine D values;
 *  multi-layer bands use their most visible layer). */
export const MEADOW_DEPTH: Record<string, number> = {
  hills: 3.7, // hill0, the nearest sage range
  "hedge-sketch": 1.7, // dest1
  "hedge-paper": 1.7,
  "hills-near": 1.4, // strip0.5
  mist: 1.8, // mist0 1.2 / mist1 2.2
};
