import { drizzle } from "drizzle-orm/better-sqlite3";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  describeAnswer,
  fillTemplate,
  headlineValue,
  isNoneChoice,
  isSkippedAnswer,
  lastTakeaway,
  stepBody,
  stepOutcome,
  takeawayCard,
  takeawayText,
  usesBodyFallback,
  type DayStep,
  type DayStepAnswers,
  type PathDayDTO,
} from "@elara/shared";
import { and, eq } from "drizzle-orm";
import type { Db } from "../src/db";
import type { AppEnv, Bindings } from "../src/env";
import { renderError } from "../src/lib/errors";
import { attachLocale } from "../src/middleware/locale";
import me from "../src/routes/me";
import { jobFor, stepInstructions } from "../src/services/stepReply";
import { createSqlite, d1Over } from "./helpers/d1";
import { schema, seedUser } from "./helpers/db";

/**
 * The daily session (3 Nov 2026), on the server and in the shared rules every
 * screen reads: a skip is never answered, "none right now" is read as none,
 * and the reply is told why today matters and what the step is for.
 *
 * The route tests go through the real `/api/me/paths/:area/days/:day/steps`
 * handler with a fake AI binding that records every prompt, so "no model call"
 * is a count of zero, not an inference.
 */

const PURPOSE = "Hoy eliges por dónde empezar a mirar tus ingresos y lo conviertes en algo concreto para averiguar.";
const BODY = "¿Qué podrías averiguar sobre esta opción? Escribe una pregunta o un pequeño paso.";
const FALLBACK =
  "¿Hay algo sobre tus ingresos que te gustaría entender mejor? Si quieres, escríbelo como una pregunta o un pequeño paso.";
const HINT = "Una pregunta o un pequeño paso";

const ASK: DayStep = {
  id: "ask",
  kind: "choose",
  title: "¿Qué parte de tus ingresos te gustaría explorar primero?",
  body: "Elige una.",
  elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
  config: {
    optional: true,
    noneOption: 5,
    card: { label: "Tu elección" },
    options: [
      "Encontrar trabajo",
      "Mejorar mi trabajo actual",
      "Cobrar un pago pendiente",
      "Explorar un servicio o venta",
      "Conocer apoyos disponibles",
      "Ninguna por ahora",
    ],
  },
};
const TAKE: DayStep = {
  id: "take",
  kind: "reflect",
  title: "Para llevarte",
  body: BODY,
  elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
  config: {
    optional: true,
    keep: "sentence",
    modes: ["write"],
    minWords: 1,
    bodyFallback: FALLBACK,
    card: { label: "Para llevarte", hint: HINT },
  },
};
/** A step that offers "I'd rather not answer" as a state. */
const STATED: DayStep = {
  id: "why",
  kind: "reflect",
  title: "¿Por qué?",
  elara: "Gracias.",
  config: { stateOptions: ["skipped"] },
};

/** Records every prompt the route sends, and answers with a fixed line. */
class FakeAi {
  prompts: { system: string; user: string }[] = [];
  async run(_model: string, body: { messages?: { role: string; content: string }[] }) {
    const messages = body.messages ?? [];
    this.prompts.push({
      system: messages.find((m) => m.role === "system")?.content ?? "",
      user: messages.filter((m) => m.role === "user").map((m) => m.content).join("\n"),
    });
    return { choices: [{ message: { content: "Una respuesta escrita por el modelo, de prueba." } }] };
  }
  /** Only the step replies (personalisation may also run behind a request). */
  get replies() {
    return this.prompts.filter((p) => p.system.includes("You are responding to one step of day"));
  }
}

function harness() {
  const sqlite = createSqlite();
  const db = drizzle(sqlite, { schema }) as unknown as Db;
  const ai = new FakeAi();
  const app = new Hono<AppEnv>();
  app.onError(renderError);
  app.use("*", async (c, next) => {
    c.set("user", { id: "ana", email: "ana@example.com", name: "ana", role: "user", isAnonymous: false });
    await next();
  });
  app.use("*", attachLocale);
  app.route("/api/me", me);
  const env = { DB: d1Over(sqlite), AI: ai } as unknown as Bindings;
  const pending: Promise<unknown>[] = [];
  const step = async (day: number, body: Record<string, unknown>) => {
    const res = await app.request(
      `/api/me/paths/money/days/${day}/steps`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "accept-language": "es" },
        body: JSON.stringify(body),
      },
      env,
      { waitUntil: (p: Promise<unknown>) => void pending.push(p.catch(() => {})), passThroughOnException() {} } as never,
    );
    // The reply is stored after the response (`waitUntil`): wait for it, so "nothing stored" is a fact.
    await Promise.all(pending.splice(0));
    return res;
  };
  return { db, ai, step };
}

async function seedPath(db: Db) {
  await db.insert(schema.pathContent).values({
    id: "path-money-es",
    area: "money",
    locale: "es",
    label: "DINERO",
    name: "Claridad con el dinero",
    areaName: "Dinero",
    icon: "i",
    accent: "#000",
    tagline: "t",
    published: true,
  });
  await db.insert(schema.pathDay).values({
    id: "money-es-1",
    pathContentId: "path-money-es",
    day: 1,
    level: "Ingresos y posibilidades",
    title: ASK.title,
    kind: "reflect",
    config: { minutes: 3, purpose: PURPOSE },
    steps: [ASK, TAKE],
  });
  await db.insert(schema.pathDay).values({
    id: "money-es-2",
    pathContentId: "path-money-es",
    day: 2,
    level: "Ingresos y posibilidades",
    title: STATED.title,
    kind: "reflect",
    steps: [STATED],
  });
}

async function storedAnswers(db: Db, day: number): Promise<DayStepAnswers> {
  const up = await db.select().from(schema.userPath).where(eq(schema.userPath.userId, "ana")).get();
  const row = await db
    .select()
    .from(schema.dayResponse)
    .where(and(eq(schema.dayResponse.userPathId, up!.id), eq(schema.dayResponse.day, day)))
    .get();
  return (row?.stepAnswers ?? {}) as DayStepAnswers;
}

type StepResponse = { reply: { reply: string | null; generated: boolean; retry?: boolean }; dayCompleted: boolean };

describe("the steps route: a skip is never answered", () => {
  let h: ReturnType<typeof harness>;
  beforeEach(async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    h = harness();
    await seedUser(h.db, "ana");
    await seedPath(h.db);
  });

  it("asks no model and keeps no reply for a skipped question (Skip sends no value)", async () => {
    const res = await h.step(1, { stepId: "ask", auto: true });
    expect(res.status).toBe(200);
    const body = (await res.json()) as StepResponse;
    expect(body.reply.reply).toBe("");
    expect(body.reply.generated).toBe(false);
    expect(h.ai.prompts).toHaveLength(0);
    const stored = await storedAnswers(h.db, 1);
    expect(stored.ask).toBeDefined();
    expect(stored.ask.value).toBeNull();
    expect(stored.ask.reply).toBeUndefined();
  });

  it("closes a day skipped through with no reply, no model call and nothing stored as Elara's", async () => {
    await h.step(1, { stepId: "ask", auto: true });
    const res = await h.step(1, { stepId: "take", auto: true });
    const body = (await res.json()) as StepResponse;
    expect(body.dayCompleted).toBe(true);
    expect(body.reply.reply).toBe("");
    expect(h.ai.prompts).toHaveLength(0);
    const stored = await storedAnswers(h.db, 1);
    expect(stored.ask.reply).toBeUndefined();
    expect(stored.take.reply).toBeUndefined();
  });

  it("asks no model and keeps no reply for the state `skipped`", async () => {
    const res = await h.step(2, { stepId: "why", state: "skipped" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as StepResponse;
    expect(body.reply.reply).toBe("");
    expect(h.ai.prompts).toHaveLength(0);
    expect((await storedAnswers(h.db, 2)).why.reply).toBeUndefined();
  });

  it("drops a reply kept from before when the step is then skipped", async () => {
    await h.step(1, { stepId: "ask", value: "Mejorar mi trabajo actual" });
    expect((await storedAnswers(h.db, 1)).ask.reply).toBeTruthy();
    await h.step(1, { stepId: "ask", auto: true });
    expect((await storedAnswers(h.db, 1)).ask.reply).toBeUndefined();
  });
});

describe("the steps route: what the reply is told", () => {
  let h: ReturnType<typeof harness>;
  beforeEach(async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    h = harness();
    await seedUser(h.db, "ana");
    await seedPath(h.db);
  });

  it("asks the model once for a real answer, with the day's purpose and the mentor rules", async () => {
    const res = await h.step(1, { stepId: "ask", value: "Mejorar mi trabajo actual" });
    const body = (await res.json()) as StepResponse;
    expect(body.reply.generated).toBe(true);
    expect(h.ai.replies).toHaveLength(1);
    const [{ system, user }] = h.ai.replies;
    expect(system).toContain(`Purpose of today (shown to her before the first question): ${PURPOSE}`);
    // The V2 job line for a mid-day step, and the one move.
    expect(system).toContain(jobFor(1, 2));
    expect(system).toContain("decide silently which ONE move fits her answer best");
    // The daily session's rules.
    expect(system).toContain("grounded in her exact words");
    expect(system).toContain("Never add people, places, employers, institutions or facts she did not mention.");
    expect(system).toContain("No praise and no grading");
    expect(system).toContain("Do not ask her a question.");
    expect(system).toContain("Never say that an action is safe, free, easy, guaranteed or without consequences.");
    expect(system).toContain("Do not assume when or whether she can act");
    expect(system).toContain("If she said there is none right now, accept it plainly: no task");
    expect(system).toContain("If her answer is long, the move is a one-line version of it");
    expect(system).toContain("If her answer is vague, offer one way to narrow it, as an option");
    expect(system).toContain("These instructions override the voice note above about ending on a question.");
    // Q1 has no hint on its slot: nothing is said about one.
    expect(system).not.toContain("takeaway card said");
    expect(user).toContain("What they answered: Mejorar mi trabajo actual");
    expect(user).toContain(`Under it: Elige una.`);
  });

  it("keeps the previous prompt on a day without a purpose (other days keep today's behaviour)", async () => {
    await h.step(2, { stepId: "why", value: "Porque los lunes me cuesta más organizarme." });
    expect(h.ai.replies).toHaveLength(1);
    const [{ system }] = h.ai.replies;
    expect(system).toContain("Reflect back something specific they actually said rather than praising them for answering.");
    expect(system).not.toContain("decide silently which ONE move");
    expect(system).not.toContain("Purpose of today");
  });

  it("accepts «No sé» on a session day: the model is asked, under the rule to accept it plainly", async () => {
    const res = await h.step(1, { stepId: "take", value: "No sé" });
    const body = (await res.json()) as StepResponse;
    expect(body.reply.retry).toBeFalsy();
    expect(body.reply.generated).toBe(true);
    expect(h.ai.replies).toHaveLength(1);
    expect(h.ai.replies[0].system).toContain("is unsure, the move is to accept it plainly and close: no task");
    expect(h.ai.replies[0].user).toContain("No sé");
  });

  it("keeps the invitation to try again for «No sé» on a day without a purpose, with no model call", async () => {
    const res = await h.step(2, { stepId: "why", value: "No sé" });
    const body = (await res.json()) as StepResponse;
    expect(body.reply.retry).toBe(true);
    expect(h.ai.replies).toHaveLength(0);
  });

  it("still invites a greeting to try again on a session day: only not knowing is an answer", async () => {
    const res = await h.step(1, { stepId: "take", value: "hola" });
    const body = (await res.json()) as StepResponse;
    expect(body.reply.retry).toBe(true);
    expect(h.ai.replies).toHaveLength(0);
  });

  it("tells the model «Ninguna por ahora» as none right now, never as a label to build on", async () => {
    await h.step(1, { stepId: "ask", value: "Ninguna por ahora" });
    expect(h.ai.replies).toHaveLength(1);
    expect(h.ai.replies[0].user).toContain("What they answered: (they said there is none right now)");
    expect(h.ai.replies[0].user).not.toContain("What they answered: Ninguna por ahora");
  });

  it("tells the model the takeaway slot's hint, and the option-free line she saw after «Ninguna por ahora»", async () => {
    await h.step(1, { stepId: "ask", value: "Ninguna por ahora" });
    await h.step(1, { stepId: "take", value: "¿Cuánto cobro de verdad por hora?" });
    const last = h.ai.replies[h.ai.replies.length - 1];
    expect(last.system).toContain(`What this step should leave her with (the empty line of her takeaway card said): ${HINT}`);
    expect(last.system).toContain(jobFor(2, 2));
    expect(last.user).toContain(`Under it: ${FALLBACK}`);
    expect(last.user).not.toContain(BODY);
  });

  it("tells the model the line about her option when she chose one", async () => {
    await h.step(1, { stepId: "ask", value: "Mejorar mi trabajo actual" });
    await h.step(1, { stepId: "take", value: "¿Hay formación gratuita para subir de puesto?" });
    const last = h.ai.replies[h.ai.replies.length - 1];
    expect(last.user).toContain(`Under it: ${BODY}`);
  });

  it("uses the option-free line after a skipped first question too", async () => {
    await h.step(1, { stepId: "ask", auto: true });
    await h.step(1, { stepId: "take", value: "¿Cuánto entra cada mes?" });
    expect(h.ai.replies).toHaveLength(1);
    expect(h.ai.replies[0].user).toContain(`Under it: ${FALLBACK}`);
  });
});

describe("the reply's instructions", () => {
  it("say the purpose and the hint only when the day and the step have them", () => {
    const bare = stepInstructions({ dayNumber: 3, dayTitle: "T", position: 1, total: 2 });
    expect(bare).not.toContain("Purpose of today");
    expect(bare).not.toContain("takeaway card");
    const full = stepInstructions({ dayNumber: 8, dayTitle: "T", position: 2, total: 2, purpose: PURPOSE, cardHint: HINT });
    expect(full).toContain(PURPOSE);
    expect(full).toContain(HINT);
  });

  it("never ask for a question back, mid-day or at the close", () => {
    expect(jobFor(1, 2)).toMatch(/Do NOT ask a question of your own/);
    expect(jobFor(2, 2)).toMatch(/Name her takeaway in her own words.*Do not ask a question/);
    expect(jobFor(1, 1)).toMatch(/only step.*Do not ask a question/);
  });
});

describe("«Ninguna por ahora» (`noneOption`)", () => {
  it("is described to the model as the state `none` is", () => {
    expect(isNoneChoice(ASK, "Ninguna por ahora")).toBe(true);
    expect(describeAnswer(ASK, "Ninguna por ahora")).toBe("(they said there is none right now)");
    expect(describeAnswer(ASK, "Mejorar mi trabajo actual")).toBe("Mejorar mi trabajo actual");
    // The same option on a step that does not declare it is an ordinary label.
    const plain: DayStep = { ...ASK, config: { ...ASK.config, noneOption: undefined } };
    expect(isNoneChoice(plain, "Ninguna por ahora")).toBe(false);
  });

  it("is never the day's headline («Hoy dijiste»)", () => {
    expect(headlineValue([ASK, TAKE], { ask: { value: "Ninguna por ahora" }, take: { value: null } })).toBeNull();
    expect(headlineValue([ASK, TAKE], { ask: { value: "Ninguna por ahora" }, take: { value: "¿Cuánto cobro?" } })).toBe(
      "¿Cuánto cobro?",
    );
    expect(headlineValue([ASK, TAKE], { ask: { value: "Mejorar mi trabajo actual" }, take: { value: null } })).toBe(
      "Mejorar mi trabajo actual",
    );
  });

  it("is never set inside a sentence of ours: a template quoting it falls back", () => {
    const ctx = {
      book: { 1: { ask: { value: "Ninguna por ahora" } } },
      day: 1,
      stepAt: (_d: number, id: string) => (id === "ask" ? ASK : undefined),
    };
    expect(fillTemplate("Elegiste «{ask}».", ctx).complete).toBe(false);
  });

  it("turns the next step's line into its fallback", () => {
    const steps = [ASK, TAKE];
    expect(usesBodyFallback(TAKE, steps, { ask: { value: "Ninguna por ahora" } })).toBe(true);
    expect(usesBodyFallback(TAKE, steps, { ask: { value: null } })).toBe(true);
    expect(usesBodyFallback(TAKE, steps, { ask: { value: null, state: "skipped" } })).toBe(true);
    expect(usesBodyFallback(TAKE, steps, {})).toBe(true);
    expect(usesBodyFallback(TAKE, steps, { ask: { value: "Cobrar un pago pendiente" } })).toBe(false);
    // The first question has nothing before it.
    expect(usesBodyFallback(ASK, steps, {})).toBe(false);
    const ctx = (answers: DayStepAnswers) => ({ book: { 1: answers }, day: 1 });
    expect(stepBody(TAKE, steps, ctx({ ask: { value: "Ninguna por ahora" } }))?.text).toBe(FALLBACK);
    expect(stepBody(TAKE, steps, ctx({ ask: { value: "Encontrar trabajo" } }))?.text).toBe(BODY);
  });
});

describe("what an answer amounts to", () => {
  it("reads every outcome", () => {
    expect(stepOutcome(ASK, undefined)).toBe("open");
    expect(stepOutcome(ASK, { value: null, state: "notOffered" })).toBe("open");
    expect(stepOutcome(ASK, { value: null })).toBe("skipped");
    expect(stepOutcome(ASK, { value: null, state: "skipped" })).toBe("skipped");
    expect(stepOutcome(ASK, { value: null, state: "none" })).toBe("none");
    expect(stepOutcome(ASK, { value: null, state: "unsure" })).toBe("stated");
    expect(stepOutcome(ASK, { value: "Ninguna por ahora" })).toBe("none");
    expect(stepOutcome(TAKE, { value: "No sé" })).toBe("answered");
    // A card that was only read stores nothing, and that is its answer.
    expect(stepOutcome({ id: "r", kind: "read", title: "Lee" }, { value: null })).toBe("answered");
  });

  it("calls a step skipped only when nothing was given, never a read card", () => {
    expect(isSkippedAnswer(TAKE, null)).toBe(true);
    expect(isSkippedAnswer(TAKE, undefined)).toBe(true);
    expect(isSkippedAnswer(TAKE, "algo")).toBe(false);
    expect(isSkippedAnswer(STATED, null, "skipped")).toBe(true);
    expect(isSkippedAnswer(STATED, null, "unsure")).toBe(false);
    expect(isSkippedAnswer({ id: "r", kind: "read", title: "Lee" }, null)).toBe(false);
  });
});

describe("the takeaway card", () => {
  const steps = [ASK, TAKE];

  it("holds her choice and her exact words", () => {
    const card = takeawayCard(steps, {
      ask: { value: "Mejorar mi trabajo actual" },
      take: { value: "  ¿Hay formación gratuita para subir de puesto?" },
    });
    expect(card.map((s) => [s.label, s.outcome, s.text])).toEqual([
      ["Tu elección", "answered", "Mejorar mi trabajo actual"],
      ["Para llevarte", "answered", "¿Hay formación gratuita para subir de puesto?"],
    ]);
    expect(card[1].hint).toBe(HINT);
  });

  it("shows «Ninguna por ahora» as her choice, and no note under it as «Sin nota por hoy»", () => {
    const card = takeawayCard(steps, { ask: { value: "Ninguna por ahora" }, take: { value: null } });
    expect(card[0]).toMatchObject({ outcome: "none", text: "Ninguna por ahora" });
    expect(card[1]).toMatchObject({ outcome: "skipped", text: null, noNote: true });
  });

  it("says a skipped slot was passed, and invents nothing for it", () => {
    const card = takeawayCard(steps, { ask: { value: null }, take: { value: "¿Cuánto entra?" } });
    expect(card[0]).toMatchObject({ outcome: "skipped", text: null });
    expect(card[0].noNote).toBeUndefined();
    expect(card[1]).toMatchObject({ outcome: "answered", text: "¿Cuánto entra?" });
  });

  it("never quotes a skip, a none, a state or a flagged answer as her takeaway", () => {
    expect(takeawayText(steps, { ask: { value: "Mejorar mi trabajo actual" }, take: { value: "¿Formación?" } })).toBe("¿Formación?");
    expect(takeawayText(steps, { ask: { value: "Ninguna por ahora" }, take: { value: null } })).toBeNull();
    expect(takeawayText(steps, { take: { value: null, state: "skipped" } })).toBeNull();
    expect(takeawayText(steps, { take: { value: "algo", safety: 2 } })).toBeNull();
  });

  it("keeps «No sé» on the card as her words, but never carries it to Hoy as a takeaway", () => {
    const answers = { ask: { value: "Mejorar mi trabajo actual" }, take: { value: "No sé" } };
    expect(takeawayCard(steps, answers)[1]).toMatchObject({ outcome: "answered", text: "No sé" });
    expect(takeawayText(steps, answers)).toBeNull();
    expect(takeawayText(steps, { take: { value: "hola" } })).toBeNull();
    // "Ninguna" written in her own words is an answer, quotable as it stands.
    expect(takeawayText(steps, { take: { value: "Nada" } })).toBe("Nada");
  });

  it("finds the last takeaway she wrote before today, passing over days she skipped through", () => {
    const day = (n: number): PathDayDTO => ({ day: n, level: "L", title: `D${n}`, kind: "reflect", steps });
    const days = [7, 8, 9, 10].map(day);
    const progress = {
      completedDays: [7, 8, 9],
      stepAnswers: {
        7: { take: { value: "La fecha de la luz", answeredAt: 1 } },
        8: { ask: { value: "Mejorar mi trabajo actual" }, take: { value: "¿Formación gratuita?", answeredAt: 2 } },
        9: { ask: { value: "Ninguna por ahora" }, take: { value: null } },
      },
    };
    expect(lastTakeaway(days, progress, 10)).toMatchObject({ day: 8, dayInWeek: 1, week: 2, text: "¿Formación gratuita?", at: 2 });
    expect(lastTakeaway(days, progress, 8)).toMatchObject({ day: 7, text: "La fecha de la luz" });
    expect(lastTakeaway(days, progress, 7)).toBeNull();
  });
});
