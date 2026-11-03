import { describe, expect, it } from "vitest";
import type { DayStep, DayValue } from "@elara/shared";
import {
  BAND_HEIGHTS,
  CIRCLE,
  KEYBOARD_BAND,
  bandHeight,
  bandMax,
  bandSize,
  panFraction,
  sessionBand,
  photoFit,
  shiftedRows,
  stripFor,
  stripOffset,
  TALL_PAN,
  tallFrame,
  tallOffset,
  tornDepths,
  tornOverlay,
} from "./photoDay";

const phone = { height: 844, fontScale: 1, topInset: 47 };
const small = { height: 568, fontScale: 1, topInset: 20 };

describe("the band's height (prototype index.html)", () => {
  it("is the prototype's on its 390 x 844 phone", () => {
    expect(bandHeight("arrive", phone)).toBe(430);
    expect(bandHeight("step", phone)).toBe(290);
    expect(bandHeight("done", phone)).toBe(290);
    expect(bandHeight("atlas", phone)).toBe(430);
  });

  it("is the prototype's compact one on a small window or at a large text size", () => {
    expect(bandSize(small)).toBe("compact");
    expect(bandSize({ height: 844, fontScale: 1.4 })).toBe("compact");
    expect(bandSize({ height: 667 })).toBe("compact");
    expect(bandSize({ height: 812 })).toBe("regular");
    expect(bandHeight("arrive", small)).toBe(330);
    expect(bandHeight("step", small)).toBe(170);
    expect(bandHeight("done", small)).toBe(200);
    expect(bandHeight("atlas", small)).toBe(300);
  });

  it("steps down to a strip for the controls while she types, never under them", () => {
    // The pill is folded into the header row then, so only the controls need room.
    expect(bandHeight("step", { ...phone, keyboard: true })).toBe(KEYBOARD_BAND);
    expect(bandHeight("step", { ...phone, keyboard: true })).toBeLessThan(BAND_HEIGHTS.compact.step);
    // A deep status bar: the back circle still fits under it.
    expect(bandHeight("step", { ...phone, topInset: 90, keyboard: true })).toBeGreaterThanOrEqual(90 + CIRCLE);
    // The keyboard only matters on a step.
    expect(bandHeight("arrive", { ...phone, keyboard: true })).toBe(430);
  });

  it("gives a step that opens on Elara's reply the compact band, so the reply clears the footer", () => {
    expect(bandHeight("step", { ...phone, reply: true })).toBe(BAND_HEIGHTS.compact.step);
    expect(bandHeight("step", { ...small, reply: true })).toBe(BAND_HEIGHTS.compact.step);
    // Typing still wins: the strip for the controls.
    expect(bandHeight("step", { ...phone, reply: true, keyboard: true })).toBe(KEYBOARD_BAND);
    // Only a step: the arrival and the done screen keep theirs.
    expect(bandHeight("done", { ...phone, reply: true })).toBe(290);
  });

  it("keeps the phone's proportions on a taller window", () => {
    expect(bandHeight("step", { height: 1180 })).toBe(Math.round(290 * (1180 / 844)));
  });

  it("steps down to the compact day-done height over a daily session's opening and close, on every phone", () => {
    expect(sessionBand(phone)).toBe(BAND_HEIGHTS.compact.done);
    expect(sessionBand(small)).toBe(BAND_HEIGHTS.compact.done);
    expect(sessionBand({ height: 1180 })).toBe(Math.round(200 * (1180 / 844)));
    // A deep status bar: the controls still fit above the page.
    expect(sessionBand({ height: 844, topInset: 120 })).toBeGreaterThanOrEqual(120 + CIRCLE);
    expect(sessionBand(phone)).toBeLessThanOrEqual(bandMax(phone));
  });

  it("is laid out once at its tallest", () => {
    expect(bandMax(phone)).toBe(430);
    expect(bandMax(small)).toBe(330);
  });
});

describe("the pan", () => {
  it("is 0 on the arrival, one step of steps + 1 per question, 1 when done", () => {
    expect(panFraction("arrive")).toBe(0);
    expect(panFraction("step", 0, 2)).toBeCloseTo(1 / 3);
    expect(panFraction("step", 1, 2)).toBeCloseTo(2 / 3);
    expect(panFraction("step", 2, 5)).toBeCloseTo(3 / 6);
    expect(panFraction("done")).toBe(1);
    expect(panFraction("atlas")).toBe(1);
  });

  it("never walks past the day's last question", () => {
    expect(panFraction("step", 9, 2)).toBeCloseTo(2 / 3);
    expect(panFraction("step", -1, 2)).toBeCloseTo(1 / 3);
    expect(panFraction("step", 0, 0)).toBeCloseTo(1 / 2);
  });

  it("slides the strip by -(strip - window) along it", () => {
    expect(stripOffset(4, 290, 390, 0)).toBe(-0);
    expect(stripOffset(4, 290, 390, 1)).toBe(-(4 * 290 - 390));
    expect(stripOffset(4, 290, 390, 0.5)).toBe(-(4 * 290 - 390) / 2);
    // A strip narrower than the window never slides the wrong way.
    expect(stripOffset(1, 100, 390, 1)).toBe(-0);
  });
});

describe("the strip the picture is laid on", () => {
  it("pans a picture wider than the window across, and lays a tall one at the window's width", () => {
    expect(photoFit(1280 / 318, 390, 430)).toBe("wide");
    expect(photoFit(1280 / 533, 390, 430)).toBe("wide");
    expect(photoFit(533 / 1280, 390, 430)).toBe("tall");
    // A landscape photo on a window wider than it stands at the band's tallest.
    expect(photoFit(1280 / 533, 1194, 430)).toBe("tall");
  });

  it("is the wide picture itself, at the band's tallest", () => {
    const s = stripFor({ width: 390, hMax: 430, aspect: 4 });
    expect(s.aspect).toBe(4);
    expect(s.width).toBe(1720);
    expect(s.image).toEqual({ width: 1720, height: 430, left: 0, top: 0 });
  });

  it("is never narrower than the window", () => {
    const s = stripFor({ width: 390, hMax: 430, aspect: 0.5 });
    expect(s.width).toBe(390);
    expect(s.image.width).toBeGreaterThanOrEqual(390);
    expect(s.image.height).toBeGreaterThanOrEqual(430);
  });

  it("frames a tall picture at the window's width, never shorter than the band", () => {
    const f = tallFrame({ width: 390, hMax: 430, aspect: 533 / 1280 });
    expect(f.width).toBeCloseTo(390);
    expect(f.height).toBeCloseTo(390 / (533 / 1280));
    expect(f.left).toBeCloseTo(0);
    // Wide enough a window that the window's width would leave it short: as tall as the band, centred.
    const g = tallFrame({ width: 1194, hMax: 430, aspect: 2.4 });
    expect(g.height).toBe(497.5);
    const h = tallFrame({ width: 1194, hMax: 600, aspect: 1.5 });
    expect(h.height).toBe(796);
    expect(h.width).toBeCloseTo(1194);
  });

  it("pans a tall picture down its middle half as the day goes on", () => {
    const H = 937;
    expect(tallOffset(H, 430, 0)).toBeCloseTo(-(H - 430) * TALL_PAN.from);
    expect(tallOffset(H, 290, 1)).toBeCloseTo(-(H - 290) * TALL_PAN.to);
    // Its foot never rises above the band's foot.
    for (const band of [170, 290, 430]) for (const along of [0, 0.5, 1]) expect(H + tallOffset(H, band, along)).toBeGreaterThanOrEqual(band);
  });
});

describe("the torn edge (prototype torn())", () => {
  it("is the prototype's 27 points, each a share of amp per cent", () => {
    const d = tornDepths(7, 4);
    expect(d).toHaveLength(27);
    for (const v of d) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(0.04);
    }
    const r = Math.sin(7) * 43758.5453;
    expect(d[0]).toBeCloseTo(((r - Math.floor(r)) * 4) / 100);
    expect(tornDepths(7, 4)).toEqual(d);
    expect(tornDepths(3, 3.5)).not.toEqual(d);
  });

  it("draws the sheet under the scene's tear and the page under the sheet's, the scene in front", () => {
    const o = tornOverlay(390, 290);
    expect(o.height).toBe(Math.ceil(290 * 0.04) + 1 + 7);
    expect(o.top).toBe(290 - (o.height - 7));
    const ys = (path: string) => [...path.matchAll(/L[\d.]+ ([\d.]+)/g)].map((m) => Number(m[1]));
    const sheet = ys(o.sheet).slice(0, 27);
    const page = ys(o.page).slice(0, 27);
    page.forEach((y, i) => expect(y).toBeGreaterThanOrEqual(sheet[i]! - 0.1));
    for (const y of [...sheet, ...page]) expect(y).toBeLessThanOrEqual(o.height);
  });
});

describe("What shifted", () => {
  const step = (id: string, config: DayStep["config"] = {}, kind: DayStep["kind"] = "reflect"): DayStep =>
    ({ id, kind, title: `Q ${id}`, config }) as DayStep;
  const a = (value: DayValue, extra: Record<string, unknown> = {}) => ({ value, answeredAt: 1, ...extra });
  const days = [
    { day: 1, steps: [step("ask"), step("take", { keep: "sentence" })] },
    { day: 2, steps: [step("ask"), step("take", { keep: "sentence" }), step("secret", { hidden: true })] },
    { day: 7, steps: [step("ask", { keep: "rule" }), step("take")] },
  ];
  const run = (book: Parameters<typeof shiftedRows>[0]["book"], max?: number) =>
    shiftedRows({
      days,
      book,
      max,
      question: (s, d) => `${s.title} (${d})`,
      answer: (v) => (typeof v === "string" ? v : ""),
    });

  it("leads with the week's rule, then the lines she kept, listed in the order she walked them", () => {
    const rows = run({
      1: { ask: a("one"), take: a("kept one") },
      2: { ask: a("two"), take: a("kept two"), secret: a("hidden words") },
      7: { ask: a("my rule"), take: a("last") },
    });
    expect(rows.map((r) => r.answer)).toEqual(["kept one", "kept two", "my rule"]);
    expect(rows[0]).toEqual({ day: 1, stepId: "take", question: "Q take (1)", answer: "kept one" });
  });

  it("never shows a hidden step, a skip or a non-answer, and fills with anything else she said", () => {
    const rows = run({
      1: { ask: a(null), take: a(null, { state: "unsure" }) },
      2: { ask: a("two"), secret: a("hidden words") },
      7: { take: a("last") },
    });
    expect(rows.map((r) => r.answer)).toEqual(["two", "last"]);
  });

  it("shows nothing when she wrote nothing, and at most the asked number", () => {
    expect(run({})).toEqual([]);
    expect(run({ 1: { ask: a("one"), take: a("t") }, 2: { ask: a("two") } }, 1)).toHaveLength(1);
  });

  it("never lists «Ninguna por ahora» as something that shifted (`noneOption`)", () => {
    const choose = step("ask", { options: ["Mejorar mi trabajo actual", "Ninguna por ahora"], noneOption: 1 }, "choose");
    const rows = shiftedRows({
      days: [{ day: 8, steps: [choose, step("take", { keep: "sentence" })] }],
      book: { 8: { ask: a("Ninguna por ahora"), take: a(null) } },
      question: (s) => s.title,
      answer: (v) => (typeof v === "string" ? v : ""),
    });
    expect(rows).toEqual([]);
  });
});
