import type { DayStep, DayUnlockRule } from "@elara/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { progressAfterAnswer, type AnswerProgress } from "@/store/stepAnswer";
import { anchorsAfterAnswer, completionAnchor, dayGateFor, reconcileAnchors } from "./dayGate";

/**
 * R2-M4 on the phone: editing a finished day must never move the next day's
 * opening, and a day she has started is never taken back. Synthetic data;
 * the phone's clock is Mexico City (UTC-6, no DST) unless a case says so.
 */

const MIDNIGHT: DayUnlockRule = { kind: "nextDay", hour: 0, minute: 0 };
const ZONE = "America/Mexico_City";
const originalTz = process.env.TZ;
beforeAll(() => {
  process.env.TZ = ZONE;
});
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});
function inZone<T>(zone: string, fn: () => T): T {
  const before = process.env.TZ;
  process.env.TZ = zone;
  try {
    return fn();
  } finally {
    process.env.TZ = before;
  }
}

/** Thursday 15 Oct 2026 21:00, Friday 00:00, Friday 09:00 and Saturday 00:00 there. */
const THU_21 = Date.parse("2026-10-16T03:00:00Z");
const FRI_00 = Date.parse("2026-10-16T06:00:00Z");
const FRI_09 = Date.parse("2026-10-16T15:00:00Z");
const SAT_00 = Date.parse("2026-10-17T06:00:00Z");

const ONE_STEP: DayStep[] = [{ id: "note", kind: "reflect", title: "What stood out today?" }];
const TWO_STEPS: DayStep[] = [
  { id: "a", kind: "reflect", title: "First" },
  { id: "b", kind: "reflect", title: "Second" },
];

const fresh = (): AnswerProgress => ({ currentDay: 1, completedDays: [], responses: {}, stepAnswers: {} });
const answer = (p: AnswerProgress, day: number, now: number, value = "Synthetic words.", steps = ONE_STEP, stepId = steps[0]!.id) =>
  progressAfterAnswer(p, { day, steps, stepId, value, now, totalDays: 7 });

describe("an edit of a finished day on the phone", () => {
  it("after midnight: the first completion stays, and Day 2 stays open", () => {
    let p = answer(fresh(), 1, THU_21);
    expect(p.dayCompletedAt).toEqual({ 1: THU_21 });
    // Open from Friday 00:00 (Day 1 closed Thursday 21:00).
    expect(dayGateFor(p, 7, MIDNIGHT, FRI_00 - 1)).toEqual({ finishedDay: 1, nextDay: 2, opensAt: FRI_00 });
    p = answer(p, 1, FRI_09, "Synthetic words, edited.");
    expect(p.dayCompletedAt).toEqual({ 1: THU_21 });
    expect(p.stepAnswers[1]!.note!.answeredAt).toBe(FRI_09);
    // Was "Come back tomorrow" until Saturday 00:00.
    expect(dayGateFor(p, 7, MIDNIGHT, FRI_09 + 60_000)).toBeNull();
  });

  it("with the 24-hour rule, an edit moves nothing either", () => {
    const day: DayUnlockRule = { kind: "after", hours: 24 };
    let p = answer(fresh(), 1, THU_21);
    p = answer(p, 1, THU_21 + 3_600_000, "Synthetic, edited an hour later.");
    expect(dayGateFor(p, 7, day, THU_21 + 2 * 3_600_000)?.opensAt).toBe(THU_21 + 24 * 3_600_000);
  });

  it("a legacy day with no anchor is frozen from its answers before the edit, never stamped with the edit", () => {
    // Persisted by a build before the anchor existed: complete, no `dayCompletedAt`.
    const legacy: AnswerProgress = {
      currentDay: 2,
      completedDays: [1],
      responses: { 1: "x" },
      stepAnswers: { 1: { note: { value: "Synthetic.", answeredAt: THU_21 } } },
    };
    const p = answer(legacy, 1, FRI_09, "Synthetic, edited.");
    expect(p.dayCompletedAt).toEqual({ 1: THU_21 });
    expect(dayGateFor(p, 7, MIDNIGHT, FRI_09)).toBeNull();
  });

  it("a legacy day with no usable time shows no wait of its own (the server decides)", () => {
    const legacy: AnswerProgress = {
      currentDay: 2,
      completedDays: [1],
      responses: { 1: "x" },
      stepAnswers: { 1: { note: { value: "Synthetic, from before answeredAt existed." } } },
    };
    expect(completionAnchor(legacy, 1)).toBeNull();
    expect(dayGateFor(legacy, 7, MIDNIGHT, THU_21)).toBeNull();
    // An edit now does not invent a completion time for it either.
    expect(anchorsAfterAnswer(legacy, 1, true, FRI_09)).toEqual({});
  });
});

describe("a day she has already started", () => {
  it("is never behind a 'come back tomorrow', even before its opening", () => {
    let p = answer(fresh(), 1, THU_21);
    expect(dayGateFor(p, 7, MIDNIGHT, THU_21 + 60_000)).not.toBeNull();
    // Day 2 started (one of its two steps): e.g. let in by the server's grace,
    // or on another device.
    p = answer(p, 2, THU_21 + 120_000, "Synthetic, first step.", TWO_STEPS, "a");
    expect(p.completedDays).toEqual([1]);
    expect(dayGateFor(p, 7, MIDNIGHT, THU_21 + 180_000)).toBeNull();
    // And an edit of Day 1 after that does not bring the wait back.
    p = answer(p, 1, THU_21 + 240_000, "Synthetic, Day 1 edited.");
    expect(dayGateFor(p, 7, MIDNIGHT, THU_21 + 300_000)).toBeNull();
  });
});

describe("a finished day whose answers are still on this phone (beta-fixes 3 Nov)", () => {
  // Reproduced in the browser: Day 1 finished offline on Thursday evening; after
  // midnight the phone opened Day 2 and she walked it, still offline. On
  // reconnecting, the server stamped Day 1 when it landed and refused Day 2
  // (\`day_locked\`), so the phone had shown open a day the server would not take.
  it("counts from now while they are queued, so Day 2 is not shown open before Day 1 has landed", () => {
    const p = answer(fresh(), 1, THU_21);
    // Without the queue (Day 1 already on the server) Friday 09:00 is open, as before.
    expect(dayGateFor(p, 7, MIDNIGHT, FRI_09)).toBeNull();
    // Day 1 still queued: the server will stamp it no earlier than now, so Day 2 opens Saturday 00:00.
    expect(dayGateFor(p, 7, MIDNIGHT, FRI_09, [1])).toEqual({ finishedDay: 1, nextDay: 2, opensAt: SAT_00 });
  });

  it("before midnight it is the same wait as without the queue", () => {
    const p = answer(fresh(), 1, THU_21);
    expect(dayGateFor(p, 7, MIDNIGHT, THU_21 + 60_000, [1])?.opensAt).toBe(FRI_00);
  });

  it("only the finished day's own queue counts, and a started next day is still never taken back", () => {
    const p = answer(fresh(), 1, THU_21);
    expect(dayGateFor(p, 7, MIDNIGHT, FRI_09, [3])).toBeNull();
    const started = answer(p, 2, FRI_09, "Synthetic words.", TWO_STEPS, "a");
    expect(dayGateFor(started, 7, MIDNIGHT, FRI_09 + 60_000, [1])).toBeNull();
  });

  it("with the 24-hour rule it counts 24 hours from now", () => {
    const p = answer(fresh(), 1, THU_21);
    expect(dayGateFor(p, 7, { kind: "after", hours: 24 }, FRI_09, [1])?.opensAt).toBe(FRI_09 + 24 * 3_600_000);
  });
});

describe("the server's first completion and the phone's", () => {
  it("the server's wins, even when it is later (an offline finish dated by its upload)", () => {
    // Closed here offline at Thursday 21:00; landed Friday 09:00.
    const local = { 1: THU_21 };
    const server = { 1: FRI_09 };
    const anchors = reconcileAnchors(local, server, [1], {});
    expect(anchors).toEqual({ 1: FRI_09 });
    const p = { currentDay: 2, completedDays: [1], stepAnswers: {}, dayCompletedAt: anchors };
    // So the phone now agrees with the server: Day 2 opens Saturday, not Friday.
    // (That rule is a policy gap; see REVIEW-02 §6. This pins that the phone follows it.)
    expect(dayGateFor(p, 7, MIDNIGHT, FRI_09 + 60_000)?.opensAt).toBe(SAT_00);
  });

  it("a stale read keeps the local anchor, so completion after it is not restamped", () => {
    // Closed here; the next read predates the upload and says Day 1 is open.
    let p: AnswerProgress = answer(fresh(), 1, THU_21);
    const anchors = reconcileAnchors(p.dayCompletedAt, {}, [], {});
    expect(anchors).toEqual({ 1: THU_21 });
    // The day reads open again until the queue lands; she re-answers it.
    p = { ...p, completedDays: [], currentDay: 1, dayCompletedAt: anchors };
    p = answer(p, 1, FRI_09, "Synthetic, again.");
    expect(p.completedDays).toEqual([1]);
    expect(p.dayCompletedAt).toEqual({ 1: THU_21 });
  });

  it("an old server (no field) closes days without a time: frozen once, then an edit elsewhere cannot move it", () => {
    const first = reconcileAnchors({}, undefined, [1], { 1: { note: { value: "Synthetic.", answeredAt: THU_21 } } });
    expect(first).toEqual({ 1: THU_21 });
    // The next read carries the answer as edited on another device.
    const next = reconcileAnchors(first, undefined, [1], { 1: { note: { value: "Synthetic, edited.", answeredAt: FRI_09 } } });
    expect(next).toEqual({ 1: THU_21 });
  });

  it("values that are not instants count as absent, from either side", () => {
    // JSON writes Infinity and NaN as null; a persisted 1e999 parses to Infinity.
    const local = { 1: THU_21, 2: null, 3: Infinity } as unknown as Record<number, number>;
    const server = { 1: null, 2: NaN, 4: "1760000000000" } as unknown as Record<number, number>;
    expect(reconcileAnchors(local, server, [], {})).toEqual({ 1: THU_21 });
    // A garbled anchor falls back to the answers (and is frozen on the next read).
    const p = {
      currentDay: 2,
      completedDays: [1],
      stepAnswers: { 1: { note: { value: "Synthetic.", answeredAt: THU_21 } } },
      dayCompletedAt: { 1: null } as unknown as Record<number, number>,
    };
    expect(completionAnchor(p, 1)).toBe(THU_21);
  });
});

describe("time edge cases", () => {
  it("invalid clocks: no anchor is stamped from NaN, and a NaN 'now' shows no wait", () => {
    const p = answer(fresh(), 1, NaN);
    expect(p.completedDays).toEqual([1]);
    expect(p.dayCompletedAt).toEqual({});
    // No time to count from: the phone does not wait; the server decides.
    expect(dayGateFor(p, 7, MIDNIGHT, THU_21)).toBeNull();
    const q = answer(fresh(), 1, THU_21);
    expect(dayGateFor(q, 7, MIDNIGHT, NaN)).toBeNull();
    // An anchor that is not an instant used to give a NaN opening: a gate
    // that never passed and a 0 ms timer that re-armed itself forever.
    const bad = { ...q, dayCompletedAt: { 1: Infinity } };
    expect(dayGateFor(bad, 7, MIDNIGHT, THU_21)?.opensAt).toBe(FRI_00);
  });

  it("midnight: a finish at 23:59:59 opens at the next midnight, one at 00:00:00 a day later", () => {
    const beforeMidnight = Date.parse("2026-10-16T05:59:59Z"); // Thu 23:59:59 there
    expect(dayGateFor(answer(fresh(), 1, beforeMidnight), 7, MIDNIGHT, beforeMidnight)?.opensAt).toBe(FRI_00);
    expect(dayGateFor(answer(fresh(), 1, FRI_00), 7, MIDNIGHT, FRI_00)?.opensAt).toBe(SAT_00);
  });

  it("a night whose midnight does not exist (Chile's DST start) opens at its first moment", () => {
    inZone("America/Santiago", () => {
      const sat21 = new Date(2026, 8, 5, 21, 0).getTime();
      const opens = dayGateFor(answer(fresh(), 1, sat21), 7, MIDNIGHT, sat21)!.opensAt;
      expect(new Date(opens).toISOString()).toBe("2026-09-06T04:00:00.000Z"); // 01:00 -03
    });
  });

  it("the phone counts in the device zone: the same finish opens at different instants", () => {
    // Known drift against the server's stored zone (see the API's
    // `day-completed-at.test.ts`); the server's refusal is `day_locked`,
    // which the queue keeps.
    const mx = inZone(ZONE, () => dayGateFor(answer(fresh(), 1, THU_21), 7, MIDNIGHT, THU_21)!.opensAt);
    const madrid = inZone("Europe/Madrid", () => dayGateFor(answer(fresh(), 1, THU_21), 7, MIDNIGHT, THU_21)!.opensAt);
    expect(mx).toBe(FRI_00);
    expect(new Date(madrid).toISOString()).toBe("2026-10-16T22:00:00.000Z");
  });

  it("no gate when the rule is open, before any day is finished, or after the last day", () => {
    const p = answer(fresh(), 1, THU_21);
    expect(dayGateFor(p, 7, { kind: "open" }, THU_21)).toBeNull();
    expect(dayGateFor(fresh(), 7, MIDNIGHT, THU_21)).toBeNull();
    expect(dayGateFor(p, 1, MIDNIGHT, THU_21)).toBeNull();
    expect(dayGateFor(undefined, 7, MIDNIGHT, THU_21)).toBeNull();
  });
});
