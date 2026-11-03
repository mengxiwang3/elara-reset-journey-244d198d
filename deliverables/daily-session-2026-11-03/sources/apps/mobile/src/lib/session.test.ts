import { stepBody, stepsOf, type DayStep, type PathDayDTO } from "@elara/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { choiceChangedUnder, draftHasContent, initialDraft } from "@/components/practice/draft";
import { composeDay, PATH_STRUCTURE } from "@/content/paths";
import { es } from "@/i18n/locales/es";
import { hoyTakeaway, nextQuestion, opensOnSession } from "./session";

/**
 * The daily session around the day screen (3 Nov 2026): when a day opens on
 * its purpose, what the close's «Mañana» says, where Hoy keeps what she took
 * away, and how a draft knows her choice changed under it.
 */

const ZONE = "Europe/Madrid";
const originalTz = process.env.TZ;
beforeAll(() => {
  process.env.TZ = ZONE;
});
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

/** Money, in Spanish, as the app renders it offline. */
const MONEY: PathDayDTO[] = PATH_STRUCTURE.money.days.map((d, i) => composeDay(d, es.pathContent.byArea.money.days[i]));

const fresh = {
  purpose: "Hoy eliges…",
  complete: false,
  answered: false,
  drafted: false,
  remembered: false,
  stepParam: false,
  again: false,
};

describe("the session's opening (P0-2)", () => {
  it("opens a day with a purpose on it, on the way in", () => {
    expect(opensOnSession(fresh)).toBe(true);
  });

  it("never opens on it when she is resuming: an answer, a draft, a remembered step, a step link", () => {
    expect(opensOnSession({ ...fresh, answered: true })).toBe(false);
    expect(opensOnSession({ ...fresh, drafted: true })).toBe(false);
    expect(opensOnSession({ ...fresh, remembered: true })).toBe(false);
    expect(opensOnSession({ ...fresh, stepParam: true })).toBe(false);
    expect(opensOnSession({ ...fresh, again: true })).toBe(false);
    expect(opensOnSession({ ...fresh, complete: true })).toBe(false);
  });

  it("leaves a day without a purpose as it was", () => {
    expect(opensOnSession({ ...fresh, purpose: undefined })).toBe(false);
    expect(opensOnSession({ ...fresh, purpose: "  " })).toBe(false);
  });

  it("is authored for Money days 8 and 9 only, with their card slots", () => {
    const withPurpose = MONEY.filter((d) => d.config?.purpose).map((d) => d.day);
    expect(withPurpose).toEqual([8, 9]);
    const slots = (day: number) => (MONEY[day - 1].steps ?? []).map((s) => s.config?.card);
    expect(slots(8)).toEqual([{ label: "Tu elección" }, { label: "Para llevarte", hint: "Una pregunta o un pequeño paso" }]);
    expect(slots(9)).toEqual([{ label: "Lo que sabes hacer" }, { label: "Para llevarte", hint: "Una frase sobre tu experiencia" }]);
    expect(MONEY[7].steps?.[0].config?.noneOption).toBe(5);
    expect(MONEY[7].steps?.[0].config?.options?.[5]).toBe("Ninguna por ahora");
  });
});

describe("day 9's second question when there is no example to build on", () => {
  const day9 = MONEY[8];
  const steps = stepsOf(day9);
  const take = steps.find((s) => s.id === "take")!;
  const body = (answers: Record<string, { value: unknown; state?: never }>) =>
    stepBody(take, steps, { day: 9, book: { 9: answers as never } })?.text;
  const FALLBACK =
    "Piensa en algo que sabes hacer, también en casa o en un trabajo informal, y escríbelo en una frase sobre tu experiencia.";

  it("is authored, and refers to no earlier example", () => {
    expect(take.config?.bodyFallback).toBe(FALLBACK);
    expect(FALLBACK).not.toMatch(/ejemplo/i);
  });

  it("stands when Q1 was skipped or answered with nothing usable", () => {
    expect(body({ ask: { value: null } })).toBe(FALLBACK);
    expect(body({ ask: { value: "No sé" } })).toBe(FALLBACK);
    expect(body({ ask: { value: "hola" } })).toBe(FALLBACK);
  });

  it("gives way to the line about her example when she wrote one", () => {
    expect(body({ ask: { value: "Coordino los horarios de mis tres hijos." } })).toBe(
      "Convierte tu ejemplo en una línea que podrías usar para describir tu experiencia.",
    );
  });
});

describe("«Mañana: …» on the close", () => {
  it("names the next day's first question", () => {
    expect(nextQuestion(MONEY, 8)).toBe("¿Qué sabes hacer que podría servir en una oportunidad que te interesa?");
  });

  it("says nothing past the last day", () => {
    expect(nextQuestion(MONEY, MONEY.length)).toBeNull();
  });

  it("never prints a reference it cannot fill", () => {
    const days: PathDayDTO[] = [
      { day: 1, level: "", title: "a", kind: "reflect" },
      { day: 2, level: "", title: "You said {d1.ask}. Then?", kind: "reflect" },
    ];
    expect(nextQuestion(days, 1)).toBeNull();
    expect(nextQuestion(days, 1, { book: { 1: { ask: { value: "Rent" } } }, stepAt: () => ({ id: "ask", kind: "reflect", title: "q" }) })).toBe(
      "You said Rent. Then?",
    );
  });
});

describe("what Hoy keeps of her takeaway (P0-7)", () => {
  const at = (iso: string) => Date.parse(iso);
  const NOW = at("2026-11-03T20:30:00+01:00");
  const TODAY = at("2026-11-03T19:00:00+01:00");
  const YESTERDAY = at("2026-11-02T20:00:00+01:00");
  const base = {
    completedDays: [1, 2, 3, 4, 5, 6, 7],
    stepAnswers: {
      7: { ask: { value: "Entra menos de lo que sale" }, take: { value: "Me falta la fecha de la luz.", answeredAt: YESTERDAY } },
    } as Record<number, Record<string, { value: unknown; answeredAt?: number; state?: never }>>,
    dayCompletedAt: { 7: YESTERDAY } as Record<number, number>,
  };

  it("leads Hoy with today's takeaway once today is done", () => {
    const progress = {
      ...base,
      completedDays: [...base.completedDays, 8],
      stepAnswers: {
        ...base.stepAnswers,
        8: { ask: { value: "Mejorar mi trabajo actual" }, take: { value: "¿Hay formación gratuita?", answeredAt: TODAY } },
      },
      dayCompletedAt: { ...base.dayCompletedAt, 8: TODAY },
    };
    const kept = hoyTakeaway({ kind: "review", day: 8 }, MONEY, progress as never, NOW);
    expect(kept).toEqual({ placement: "top", day: 8, week: 2, dayInWeek: 1, text: "¿Hay formación gratuita?", today: true });
  });

  it("puts the last one she noted under a new day", () => {
    const kept = hoyTakeaway({ kind: "practice", day: 8 }, MONEY, base as never, NOW);
    expect(kept).toEqual({ placement: "underHero", day: 7, week: 1, dayInWeek: 7, text: "Me falta la fecha de la luz.", today: false });
  });

  it("never quotes «Ninguna por ahora» or a skip: nothing of hers, no card", () => {
    const progress = {
      ...base,
      completedDays: [...base.completedDays, 8],
      stepAnswers: { ...base.stepAnswers, 8: { ask: { value: "Ninguna por ahora" }, take: { value: null } } },
      dayCompletedAt: { ...base.dayCompletedAt, 8: TODAY },
    };
    expect(hoyTakeaway({ kind: "review", day: 8 }, MONEY, progress as never, NOW)).toBeNull();
    // The next day passes over day 8 to the last thing she did write.
    expect(hoyTakeaway({ kind: "practice", day: 9 }, MONEY, progress as never, NOW)?.day).toBe(7);
  });

  it("never quotes an answer the server refused, kept for her in its step", () => {
    const progress = {
      ...base,
      completedDays: [...base.completedDays, 8],
      stepAnswers: { ...base.stepAnswers, 8: { ask: { value: "Mejorar mi trabajo actual" }, take: { value: "¿Hay formación?" } } },
      dayCompletedAt: { ...base.dayCompletedAt, 8: TODAY },
    };
    const refused = (day: number, stepId: string) => day === 8 && stepId === "take";
    expect(hoyTakeaway({ kind: "review", day: 8 }, MONEY, progress as never, NOW, refused)).toBeNull();
    expect(hoyTakeaway({ kind: "practice", day: 9 }, MONEY, progress as never, NOW, refused)?.day).toBe(7);
  });

  it("has nothing to show before any takeaway, or with no entry", () => {
    expect(hoyTakeaway({ kind: "practice", day: 1 }, MONEY, { completedDays: [], stepAnswers: {} }, NOW)).toBeNull();
    expect(hoyTakeaway(null, MONEY, base as never, NOW)).toBeNull();
  });
});

describe("a draft kept across «Cambiar» (P0-3)", () => {
  const TAKE: DayStep = { id: "take", kind: "reflect", title: "Para llevarte", config: { modes: ["write"] } };
  const empty = initialDraft(TAKE, undefined, [], undefined);
  const written = { ...empty, reflect: { ...empty.reflect, text: "¿Hay formación gratuita?" }, basis: "Mejorar mi trabajo actual" };

  it("knows a draft with words in it from one that is only open", () => {
    expect(draftHasContent(empty)).toBe(false);
    expect(draftHasContent(written)).toBe(true);
    expect(draftHasContent(undefined)).toBe(false);
  });

  it("says her choice changed only when words were written under another one", () => {
    expect(choiceChangedUnder(written, "Mejorar mi trabajo actual")).toBe(false);
    expect(choiceChangedUnder(written, "Cobrar un pago pendiente")).toBe(true);
    // Nothing written: nothing to check.
    expect(choiceChangedUnder({ ...empty, basis: "Mejorar mi trabajo actual" }, "Cobrar un pago pendiente")).toBe(false);
    // A draft from before this existed has no basis: never a false alarm.
    expect(choiceChangedUnder({ ...written, basis: undefined }, "Cobrar un pago pendiente")).toBe(false);
  });
});
