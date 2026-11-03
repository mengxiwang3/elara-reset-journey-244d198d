import { heldAnswer, stateOf, type AnswerState } from "./answerStates";
import { dayPosition } from "./dayPosition";
import {
  answerText,
  isAcknowledgement,
  isAside,
  isNoneChoice,
  isNonAnswer,
  ownWords,
  resolveTemplate,
  type AnswerBook,
  type ResolvedTemplate,
  type TemplateContext,
} from "./practice";
import { stepsOf, type DayStep, type DayStepAnswers, type StepAnswer } from "./steps";
import type { DayValue, PathDayDTO } from "./types";

/**
 * The daily session (Nov 2026): how a day reads to the screens around its
 * questions. Why today matters before she starts (`DayConfig.purpose`), the
 * takeaway card she leaves with (`DayConfig.card` on each step), and an honest
 * "none right now" (`DayConfig.noneOption`).
 *
 * Pure, so the same reading drives the day screen, Hoy, the step reply and the
 * tests, and a skip can never be shown one way on the phone and told another
 * way to the model.
 *
 * ## What a step's answer amounts to
 *
 * | Outcome | Stored | On her card | Told to the model |
 * | --- | --- | --- | --- |
 * | `answered` | words, a pick | her words, as written | the words |
 * | `none` | the `noneOption` pick, or state `none` | the option («Ninguna por ahora») | "there is none right now" |
 * | `stated` | another state she chose (`unsure`, `notNow`) | the state's own words | the state |
 * | `skipped` | nothing (`null`), or state `skipped` | «Pasaste esta pregunta» | nothing: no model call |
 * | `open` | no answer yet (or `notOffered`) | the slot's hint | — |
 */
export type StepOutcome = "answered" | "none" | "stated" | "skipped" | "open";

/** The part of a stored answer the outcome reads. Structural, so a wire answer passes as is. */
type OutcomeAnswer = Pick<StepAnswer, "value" | "state"> | null | undefined;

/** What a stored answer to `step` amounts to. See the table above. */
export function stepOutcome(step: DayStep, answer: OutcomeAnswer): StepOutcome {
  // A `notOffered` mark is a question not yet put, the same as no answer.
  const held = heldAnswer(answer ?? undefined);
  if (!held) return "open";
  const state = stateOf(held);
  if (state === "none") return "none";
  if (state === "skipped" || state === "declined") return "skipped";
  if (state !== "answered") return "stated";
  if (held.value == null) return isAcknowledgement(step) ? "answered" : "skipped";
  if (isNoneChoice(step, held.value)) return "none";
  return "answered";
}

/**
 * Was this step passed with nothing — Skip, or the state `skipped`?
 *
 * The one test behind "a skip ends the exercise": the server asks no model and
 * keeps no reply for it, and no screen shows an Elara note for it. A card that
 * was only read (`info`, `read`, `recall`) stores nothing either, and that is
 * not a skip.
 */
export function isSkippedAnswer(step: DayStep, value: DayValue | undefined, state?: AnswerState): boolean {
  if (state === "skipped") return true;
  if (state && state !== "answered") return false;
  return value == null && !isAcknowledgement(step);
}

/** The question asked just before `step` in its day (asides are not questions). */
export function previousStep(step: DayStep, steps: readonly DayStep[]): DayStep | undefined {
  const asked = steps.filter((s) => !isAside(s));
  const at = asked.findIndex((s) => s.id === step.id);
  return at > 0 ? asked[at - 1] : undefined;
}

/**
 * Should `step` say its `bodyFallback` instead of its `body`?
 *
 * Yes when the question before it has nothing to build on: it was skipped,
 * answered "none right now", answered with a state or with words that answer
 * nothing («No sé», a greeting), or not answered at all. A
 * line about "this option" would then point at nothing («¿Qué podrías
 * averiguar sobre esta opción?» after «Ninguna por ahora»), so the option-free
 * line stands instead. A step without a `bodyFallback` keeps its body.
 */
export function usesBodyFallback(
  step: DayStep,
  steps: readonly DayStep[],
  answers: DayStepAnswers | undefined,
): boolean {
  if (!step.config?.bodyFallback?.trim()) return false;
  const before = previousStep(step, steps);
  if (!before) return false;
  const answer = answers?.[before.id];
  if (stepOutcome(before, answer) !== "answered") return true;
  // Answered with nothing usable («No sé», a greeting): there is no example
  // or option for the line to point at either.
  const own = ownWords(before, answer?.value);
  return own !== null && isNonAnswer(own);
}

/**
 * The line under a step's question, as she is shown it: the fallback when the
 * step before has nothing to build on (`usesBodyFallback`), else the body with
 * its quotes filled (and its own fallback when a quote cannot be filled).
 */
export function stepBody(
  step: DayStep,
  steps: readonly DayStep[],
  ctx: TemplateContext,
): ResolvedTemplate | null {
  if (!step.body) return null;
  if (usesBodyFallback(step, steps, ctx.book[ctx.day])) {
    return resolveTemplate(step.config?.bodyFallback, undefined, ctx);
  }
  return resolveTemplate(step.body, step.config?.bodyFallback, ctx);
}

/** Does this day carry a takeaway card (a `card` on at least one of its steps)? */
export function hasTakeawayCard(steps: readonly DayStep[]): boolean {
  return steps.some((s) => !!s.config?.card?.label?.trim() && !s.config?.hidden);
}

/** One slot of the day's takeaway card. */
export interface CardSlot {
  stepId: string;
  /** «Tu elección», «Para llevarte». */
  label: string;
  /** What the empty slot says before she answers. */
  hint?: string;
  outcome: StepOutcome;
  /**
   * What the slot shows of hers: her words exactly as she wrote them, or the
   * option she picked (the "none right now" option included: it is her
   * choice). Null when there is nothing of hers to show.
   */
  text: string | null;
  /** The state she chose, when the outcome is `stated`. */
  state?: AnswerState;
  /**
   * Nothing to show because the slot before it was "none right now" and she
   * wrote nothing here: «Sin nota por hoy», rather than «Pasaste esta pregunta».
   */
  noNote?: boolean;
}

/**
 * The day's takeaway card: one slot per step with a `card`, in day order,
 * filled from her answers. Hidden steps never have a slot. Empty for a day
 * with no card.
 */
export function takeawayCard(steps: readonly DayStep[], answers: DayStepAnswers | undefined): CardSlot[] {
  const slots: CardSlot[] = [];
  for (const step of steps) {
    const card = step.config?.card;
    if (!card?.label?.trim() || step.config?.hidden) continue;
    const answer = answers?.[step.id];
    const outcome = stepOutcome(step, answer);
    const text = outcome === "answered" || outcome === "none" ? answerText(answer?.value, step) || null : null;
    const before = slots[slots.length - 1];
    slots.push({
      stepId: step.id,
      label: card.label,
      ...(card.hint ? { hint: card.hint } : {}),
      outcome,
      text,
      ...(outcome === "stated" && answer ? { state: stateOf(answer) } : {}),
      ...(!text && before?.outcome === "none" && outcome !== "open" ? { noNote: true } : {}),
    });
  }
  return slots;
}

/** Is there anything of hers on the card: an answer, a "none", a state she chose? */
export function cardHasAnswers(slots: readonly CardSlot[]): boolean {
  return slots.some((s) => s.outcome === "answered" || s.outcome === "none" || s.outcome === "stated");
}

/**
 * The step whose words are the day's takeaway: the last slot of its card, or,
 * on a day without one, its last step kept for her collection (`keep`).
 */
export function takeawayStepOf(steps: readonly DayStep[]): DayStep | undefined {
  const carded = steps.filter((s) => !!s.config?.card?.label?.trim() && !s.config?.hidden);
  if (carded.length) return carded[carded.length - 1];
  return [...steps].reverse().find((s) => !!s.config?.keep && !s.config?.hidden);
}

/**
 * Her takeaway from one day, exactly as she wrote it — or null. Never a skip,
 * a "none right now", a state, a hidden step, or an answer that matched the
 * safety list: nothing she did not write is ever quoted back as hers. Words
 * that answer nothing («No sé», a greeting) stay on that day's card but are
 * not carried to Hoy as a takeaway, as no template ever quotes them
 * (`isNonAnswer`).
 */
export function takeawayText(steps: readonly DayStep[], answers: DayStepAnswers | undefined): string | null {
  const step = takeawayStepOf(steps);
  if (!step) return null;
  const answer = answers?.[step.id];
  if (!answer || answer.safety || stepOutcome(step, answer) !== "answered") return null;
  const text = answerText(answer.value, step).trim();
  return text && !isNonAnswer(text) ? text : null;
}

/** A takeaway she wrote on an earlier day: «La última vez anotaste». */
export interface PastTakeaway {
  day: number;
  week: number;
  /** 1..7, as she reads it ("Día 1"). */
  dayInWeek: number;
  text: string;
  /** When she wrote it (epoch ms), when known. */
  at: number | null;
}

/**
 * The latest finished day before `before` whose takeaway she wrote, and what
 * it says. Days she skipped through, answered "none", or has not finished are
 * passed over; null when there is none.
 */
export function lastTakeaway(
  days: readonly PathDayDTO[],
  progress: { completedDays: readonly number[]; stepAnswers: AnswerBook },
  before: number,
): PastTakeaway | null {
  const done = [...progress.completedDays].filter((d) => d < before).sort((a, b) => b - a);
  for (const day of done) {
    const content = days.find((d) => d.day === day);
    if (!content) continue;
    const steps = stepsOf(content);
    const answers = progress.stepAnswers[day];
    const text = takeawayText(steps, answers);
    if (!text) continue;
    const step = takeawayStepOf(steps);
    const at = step ? answers?.[step.id]?.answeredAt : undefined;
    const { week, dayInWeek } = dayPosition(day, days);
    return { day, week, dayInWeek, text, at: typeof at === "number" && Number.isFinite(at) ? at : null };
  }
  return null;
}
