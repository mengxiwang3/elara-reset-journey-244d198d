import type { DayStepAnswers, DayUnlockRule, PathDayDTO } from "@elara/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { en } from "@/i18n/locales/en";
import { es } from "@/i18n/locales/es";
import { keptAnswer } from "@/components/practice/draft";
import { dayGateFor } from "@/lib/dayGate";
import {
  entryWords,
  draftHasWords,
  isEntryRoute,
  openedAt,
  promisesNextWeek,
  resolveTodayEntry,
  todayEntryWhenReady,
  type EntryProgress,
  type ResolveInput,
} from "./todayEntry";

/**
 * The one entry rule (Final Pass FX 1), against the client's four account
 * states: «Día en curso», «Día completado», «Día sin hacer» and «Semana
 * completada». Lucía, Money, week 2 (Wuzhen): days 8 to 14. The phone's clock
 * is Mexico City (UTC-6, no DST); the unlock rule is the server's
 * `next-day@00:00`.
 */

const ZONE = "America/Mexico_City";
const originalTz = process.env.TZ;
beforeAll(() => {
  process.env.TZ = ZONE;
});
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

const MIDNIGHT: DayUnlockRule = { kind: "nextDay", hour: 0, minute: 0 };
const OPEN: DayUnlockRule = { kind: "open" };

/** Local Mexico City wall time to epoch ms (UTC-6). */
const at = (iso: string) => Date.parse(`${iso}-06:00`);

/** 21 days (three weeks), two steps each: the question (`ask`) and the small step (`take`). */
const DAYS: PathDayDTO[] = Array.from({ length: 21 }, (_, i) => ({
  day: i + 1,
  level: "",
  title: `Day ${i + 1}`,
  kind: "reflect",
  config: { minutes: 4 },
  steps: [
    { id: "ask", kind: "reflect", title: `Question ${i + 1}` },
    { id: "take", kind: "reflect", title: `Step ${i + 1}` },
  ],
}));

const answered = (text: string, answeredAt: number): DayStepAnswers => ({
  ask: { value: text, answeredAt },
  take: { value: "ok", answeredAt },
});

/** Week 1 walked, then `n` days of week 2, each closed at 21:00 on consecutive days ending `lastClosed`. */
function progressThrough(lastDone: number, lastClosed: number): EntryProgress {
  const completedDays = Array.from({ length: lastDone }, (_, i) => i + 1);
  const stepAnswers: Record<number, DayStepAnswers> = {};
  const dayCompletedAt: Record<number, number> = {};
  for (const d of completedDays) {
    const closed = lastClosed - (lastDone - d) * 86_400_000;
    stepAnswers[d] = answered(d === 9 ? "Pago tarde porque no quiero ver el saldo." : `Answer ${d}`, closed);
    dayCompletedAt[d] = closed;
  }
  return { currentDay: lastDone + 1, completedDays, stepAnswers, dayCompletedAt, startedAt: at("2026-10-12T09:00") };
}

function resolve(over: Partial<ResolveInput> & { progress: EntryProgress; now: number }) {
  const rule = over.rule ?? MIDNIGHT;
  const gate = over.gate !== undefined ? over.gate : dayGateFor(over.progress, DAYS.length, rule, over.now);
  return resolveTodayEntry({ area: "money", days: DAYS, rule, premium: true, source: "today", ...over, gate });
}

describe("resolveTodayEntry, the four account states", () => {
  // Day 2 of week 2 (path day 9) closed Monday 26 Oct at 21:00.
  const MON_21 = at("2026-10-26T21:00");

  it("Día en curso: day 3 ready, nothing typed, opens the practice", () => {
    const e = resolve({ progress: progressThrough(9, MON_21), now: at("2026-10-27T21:00") })!;
    expect(e.kind).toBe("practice");
    expect(e.state).toBe("ready");
    expect([e.week, e.dayInWeek, e.day]).toEqual([2, 3, 10]);
    expect(e.doneInWeek).toBe(2);
    expect(e.weekDays).toEqual([8, 9, 10, 11, 12, 13, 14]);
    expect(e.href).toEqual({ pathname: "/path/day", params: { area: "money", day: "10", from: "today" } });
    expect(entryWords(e, es.home.hoy.entry, "Wuzhen").label).toBe("Empezar el día 3");
  });

  it("in progress: a draft on step 1 is «Seguir con el día 3», step 1 of 2", () => {
    const e = resolve({
      progress: progressThrough(9, MON_21),
      now: at("2026-10-27T21:00"),
      drafted: (day, id) => day === 10 && id === "ask",
    })!;
    expect(e.state).toBe("inProgress");
    expect(e.step).toEqual({ id: "ask", index: 1, total: 2 });
    const w = entryWords(e, es.home.hoy.entry, "Wuzhen");
    expect(w.label).toBe("Seguir con el día 3");
    expect(w.hint).toContain("paso 1 de 2");
    expect(e.href.params.step).toBe("ask");
  });

  it("a day she only opened resumes without claiming her words were kept (beta hardening, 3 Nov 2026)", () => {
    // Before: opening Day 1 and going back to Hoy read «Vas en el paso 1 de 2.
    // Guardamos lo que escribiste.» over a day with nothing written.
    const e = resolve({ progress: progressThrough(9, MON_21), now: at("2026-10-27T21:00"), remembered: "ask" })!;
    expect(e.state).toBe("inProgress");
    expect(e.saved).toBe(false);
    const w = entryWords(e, es.home.hoy.entry, "Wuzhen");
    expect(w.label).toBe("Seguir con el día 3");
    expect(w.hint).toBeUndefined();
  });

  it("an answer kept for the day still says so", () => {
    const p = progressThrough(9, MON_21);
    p.stepAnswers[10] = { ask: { value: "La tarjeta.", answeredAt: at("2026-10-27T20:00") } };
    const e = resolve({ progress: p, now: at("2026-10-27T21:00"), remembered: "take" })!;
    expect(e.saved).toBe(true);
    expect(entryWords(e, es.home.hoy.entry, "Wuzhen").hint).toBe("Vas en el paso 2 de 2. Guardamos lo que escribiste.");
  });

  it("in progress: an answered first step resumes on the second, and the remembered step wins", () => {
    const p = progressThrough(9, MON_21);
    p.stepAnswers[10] = { ask: { value: "La tarjeta.", answeredAt: at("2026-10-27T20:00") } };
    const now = at("2026-10-27T21:00");
    expect(resolve({ progress: p, now })!.step).toEqual({ id: "take", index: 2, total: 2 });
    expect(resolve({ progress: p, now, remembered: "ask" })!.step).toEqual({ id: "ask", index: 1, total: 2 });
    // A remembered id from another day's shape is ignored.
    expect(resolve({ progress: p, now, remembered: "nope" })!.step?.id).toBe("take");
  });

  it("Día completado: the review, and the next day waits for local midnight", () => {
    const p = progressThrough(10, at("2026-10-27T20:30"));
    const e = resolve({ progress: p, now: at("2026-10-27T21:00") })!;
    expect(e.kind).toBe("review");
    expect(e.state).toBe("done");
    expect([e.day, e.dayInWeek, e.nextDay]).toEqual([10, 3, 11]);
    expect(e.opensAt).toBe(at("2026-10-28T00:00"));
    expect(e.href).toEqual({ pathname: "/path/day", params: { area: "money", day: "10", from: "today" } });
    expect(entryWords(e, es.home.hoy.entry, "Wuzhen").label).toBe("Ver lo que respondiste");
  });

  it("after midnight the next day is simply today's practice", () => {
    const p = progressThrough(10, at("2026-10-27T20:30"));
    const e = resolve({ progress: p, now: at("2026-10-28T00:01") })!;
    expect(e.kind).toBe("practice");
    expect(e.state).toBe("ready");
    expect(e.dayInWeek).toBe(4);
  });

  it("Día sin hacer: two days later day 3 is still the day, marked missed, no penalty", () => {
    const e = resolve({ progress: progressThrough(9, MON_21), now: at("2026-10-29T09:00") })!;
    expect(e.kind).toBe("practice");
    expect(e.state).toBe("missed");
    expect(e.missed).toBe(true);
    expect([e.day, e.dayInWeek, e.week]).toEqual([10, 3, 2]);
    expect(entryWords(e, en.home.hoy.entry, "Wuzhen").label).toBe("Start day 3");
  });

  it("a day is not missed on the day it opens, only from the next", () => {
    // Opened Tuesday 00:00: Tuesday is not missed, Wednesday is.
    const p = progressThrough(9, MON_21);
    expect(resolve({ progress: p, now: at("2026-10-27T23:59") })!.missed).toBe(false);
    expect(resolve({ progress: p, now: at("2026-10-28T08:00") })!.missed).toBe(true);
  });

  it("under an open rule, a day finished last night is not missed this morning", () => {
    const p = progressThrough(9, MON_21);
    expect(openedAt(p, 10, OPEN)).toBe(at("2026-10-27T00:00"));
    expect(resolve({ progress: p, now: at("2026-10-27T08:00"), rule: OPEN })!.missed).toBe(false);
    expect(resolve({ progress: p, now: at("2026-10-28T08:00"), rule: OPEN })!.missed).toBe(true);
  });

  it("Semana completada: the week, seven of seven, next week opens tomorrow", () => {
    const p = progressThrough(14, at("2026-10-31T20:00"));
    const e = resolve({ progress: p, now: at("2026-10-31T20:30") })!;
    expect(e.kind).toBe("week");
    expect(e.state).toBe("weekDone");
    expect([e.day, e.dayInWeek, e.doneInWeek, e.daysInWeek]).toEqual([14, 7, 7, 7]);
    expect(e.href.params.day).toBe("14");
    expect(entryWords(e, es.home.hoy.entry, "Wuzhen").label).toBe("Ver tu semana en Wuzhen");
  });

  it("a path walked to its end is the week, with nothing to wait for", () => {
    const p = progressThrough(21, at("2026-11-07T20:00"));
    const e = resolve({ progress: p, now: at("2026-11-09T10:00") })!;
    expect(e.day).toBe(21);
    expect(e.state).toBe("pathDone");
    expect(e.kind).toBe("week");
    expect(e.nextDay).toBeNull();
  });
});

describe("resolveTodayEntry, doors and gates", () => {
  const p = progressThrough(9, at("2026-10-26T21:00"));
  const now = at("2026-10-27T21:00");

  it("all three doors open the same day; only the way back differs", () => {
    const hoy = resolve({ progress: p, now, source: "today" })!;
    const pregunta = resolve({ progress: p, now, source: "pregunta" })!;
    const atlas = resolve({ progress: p, now, source: "atlas" })!;
    expect(pregunta.href).toEqual(hoy.href);
    expect({ ...atlas.href.params, from: "today" }).toEqual(hoy.href.params);
    expect(atlas.href.params.from).toBe("paths");
  });

  it("a week her membership does not cover goes through the paywall and back to the same day", () => {
    const e = resolve({ progress: p, now, premium: false })!;
    expect(e.membershipRequired).toBe(true);
    expect(e.href).toEqual({ pathname: "/paywall", params: { returnTo: "/path/day?area=money&day=10" } });
  });

  it("never paywalls while the entitlement is still loading", () => {
    expect(resolve({ progress: p, now, premium: null })!.href.pathname).toBe("/path/day");
  });

  it("week 1 is free for everyone", () => {
    const e = resolve({ progress: progressThrough(2, at("2026-10-14T21:00")), now: at("2026-10-15T10:00"), premium: false })!;
    expect(e.href.pathname).toBe("/path/day");
  });

  it("a brand new member starts day 1", () => {
    const e = resolve({ progress: { currentDay: 1, completedDays: [], stepAnswers: {}, startedAt: now - 60_000 }, now })!;
    expect([e.kind, e.state, e.day, e.dayInWeek]).toEqual(["practice", "ready", 1, 1]);
  });

  it("no content yet is no entry", () => {
    expect(resolveTodayEntry({ area: "money", days: [], progress: undefined, gate: null, rule: MIDNIGHT, now, premium: true, source: "today" })).toBeNull();
  });
});

describe("isEntryRoute (Pregunta marked as the current tab)", () => {
  it("is the practice, review and week screens, not the path's own page", () => {
    expect(isEntryRoute(["path", "day"])).toBe(true);
    expect(isEntryRoute(["path", "complete"])).toBe(true);
    expect(isEntryRoute(["path", "[area]"])).toBe(false);
    expect(isEntryRoute(["(tabs)", "atlas"])).toBe(false);
  });
});

describe("promisesNextWeek: the week card for a free account (beta hardening, 3 Nov 2026)", () => {
  // Before: a free account that closed week 1 read «La semana 2, Wuzhen, se abre
  // mañana», and the next morning «Empezar el día 1» opened a membership screen
  // with nothing on sale, whose «Continuar» led back to the same Hoy.
  const closedWeekOne = progressThrough(7, at("2026-10-18T20:00"));
  const now = at("2026-10-18T20:30");

  it("does not promise a membership week to an account without one", () => {
    const e = resolve({ progress: closedWeekOne, now, premium: false })!;
    expect(e.kind).toBe("week");
    expect(e.opensAt).not.toBeNull();
    expect(promisesNextWeek(e, false)).toBe(false);
  });

  it("promises it to a member, and while the entitlement is still loading", () => {
    const e = resolve({ progress: closedWeekOne, now, premium: true })!;
    expect(promisesNextWeek(e, true)).toBe(true);
    expect(promisesNextWeek(e, null)).toBe(true);
  });

  it("only speaks to the week card", () => {
    const e = resolve({ progress: progressThrough(9, at("2026-10-26T21:00")), now: at("2026-10-27T21:00"), premium: false })!;
    expect(e.kind).toBe("practice");
    expect(promisesNextWeek(e, false)).toBe(true);
    // The practice behind it goes through the membership screen, which Hoy marks.
    expect(e.membershipRequired).toBe(true);
  });
});

describe("draftHasWords: an opened step is not a kept answer (beta hardening, 3 Nov 2026)", () => {
  // The step screen saves its draft a moment after it opens, untouched or not:
  // this is what that untouched draft looks like for a choice and a reflection.
  const empty = {
    choice: null,
    picks: [],
    other: "",
    detail: "",
    sorted: {},
    scale: null,
    reflect: { mode: "write", text: "", drawing: null, caption: "" },
    done: false,
    blanks: ["", ""],
    photo: { photo: null, uri: null, caption: "", describe: false },
  };

  it("an untouched draft holds nothing of hers", () => {
    expect(draftHasWords(empty)).toBe(false);
    expect(draftHasWords({ ...empty, reflect: { ...empty.reflect, text: "   " } })).toBe(false);
    expect(draftHasWords(undefined)).toBe(false);
    expect(draftHasWords(null)).toBe(false);
  });

  it("anything she gave counts", () => {
    expect(draftHasWords({ ...empty, choice: "Lo que gano" })).toBe(true);
    expect(draftHasWords({ ...empty, picks: ["Trabajo"] })).toBe(true);
    expect(draftHasWords({ ...empty, reflect: { ...empty.reflect, text: "Pago tarde." } })).toBe(true);
    expect(draftHasWords({ ...empty, blanks: ["", "alquiler"] })).toBe(true);
    expect(draftHasWords({ ...empty, scale: 0 })).toBe(true);
    expect(draftHasWords({ ...empty, photo: { ...empty.photo, uri: "file:///x.jpg" } })).toBe(true);
  });

  it("an answer the server refused, kept under the step's key, is hers too", () => {
    // `onDropped` (beta session fixes) stores `{ kept, refused }`, not a StepDraft.
    expect(draftHasWords(keptAnswer("Pago tarde porque no quiero ver el saldo.", "premium_required"))).toBe(true);
    expect(draftHasWords(keptAnswer(["", "alquiler"], "invalid_value"))).toBe(true);
    expect(draftHasWords(keptAnswer("  ", "invalid_value"))).toBe(false);
  });

  it("a day she only opened (an empty draft, the step remembered) reads «Seguir» without the claim", () => {
    const drafts: Record<string, unknown> = { "money:10:ask": empty };
    const e = resolve({
      progress: progressThrough(9, at("2026-10-26T21:00")),
      now: at("2026-10-27T21:00"),
      remembered: "ask",
      drafted: (day, id) => draftHasWords(drafts[`money:${day}:${id}`]),
    })!;
    const w = entryWords(e, es.home.hoy.entry, "Wuzhen");
    expect(w.label).toBe("Seguir con el día 3");
    expect(w.hint).toBeUndefined();
  });
});

describe("todayEntryWhenReady: her own progress first, then the gate (beta hardening x beta session fixes)", () => {
  // Day 9 closed on this phone last night at 23:50, offline: its answers are
  // still queued. Ten past midnight, the phone's own close would open day 10;
  // the server, which has not heard of day 9 yet, would refuse it.
  const p = progressThrough(9, at("2026-10-26T23:50"));
  const now = at("2026-10-27T00:10");
  const base: ResolveInput = { area: "money", days: DAYS, progress: p, gate: null, rule: MIDNIGHT, now, premium: true, source: "today" };
  // Read inside each test: the gate counts in the phone's zone, set in `beforeAll`.
  let queued: ReturnType<typeof dayGateFor>;
  let unqueued: ReturnType<typeof dayGateFor>;
  beforeAll(() => {
    queued = dayGateFor(p, DAYS.length, MIDNIGHT, now, [9]);
    unqueued = dayGateFor(p, DAYS.length, MIDNIGHT, now);
  });

  it("a day still queued waits counted from now (the gate both rules see)", () => {
    expect(queued).toEqual({ finishedDay: 9, nextDay: 10, opensAt: at("2026-10-28T00:00") });
    expect(unqueued).toBeNull();
  });

  it("before her progress is read there is no door, whatever the gate says", () => {
    // The store's empty progress would read as Day 1.
    expect(resolveTodayEntry({ ...base, progress: undefined })!.day).toBe(1);
    expect(todayEntryWhenReady(false, { ...base, progress: undefined })).toBeNull();
    expect(todayEntryWhenReady(false, { ...base, gate: queued })).toBeNull();
    expect(todayEntryWhenReady(false, { ...base, gate: unqueued })).toBeNull();
  });

  it("once it is hers, the queued day still holds the next one", () => {
    const e = todayEntryWhenReady(true, { ...base, gate: queued })!;
    expect([e.kind, e.state, e.day, e.nextDay, e.opensAt]).toEqual(["review", "done", 9, 10, at("2026-10-28T00:00")]);
    // Without the queue counted, the day the server would refuse (`day_locked`).
    const early = todayEntryWhenReady(true, { ...base, gate: unqueued })!;
    expect([early.kind, early.day]).toEqual(["practice", 10]);
  });

  it("when the queue lands, the server's own stamp keeps the same wait", () => {
    const landed: EntryProgress = { ...p, dayCompletedAt: { ...p.dayCompletedAt, 9: at("2026-10-27T00:15") } };
    const later = at("2026-10-27T00:20");
    const gate = dayGateFor(landed, DAYS.length, MIDNIGHT, later);
    const e = todayEntryWhenReady(true, { ...base, progress: landed, now: later, gate })!;
    expect([e.kind, e.day, e.opensAt]).toEqual(["review", 9, at("2026-10-28T00:00")]);
  });
});
