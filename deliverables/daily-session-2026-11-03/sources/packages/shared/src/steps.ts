import type { DayKind } from "./enums";
import { hasStateAnswer, heldAnswer, stateOf, type AnswerState } from "./answerStates";
import { offeredSteps } from "./offered";
import {
  acceptsEmpty,
  answerText,
  isAside,
  isDrawn,
  isNonAnswer,
  isNoneChoice,
  isPhoto,
  isSorted,
  OTHER_KEY,
  readChoice,
  SCALE_ESCAPE,
  type ReplyResonance,
} from "./practice";
import type { DayConfig, DayValue, PathDayDTO, ReflectMode } from "./types";

// The practice engine's rules live beside this contract and travel with it.
export * from "./practice";
// So do the answer states and the conditional-step rules (Oct 2026).
export * from "./answerStates";
export * from "./offered";

/**
 * A day is a sequence of steps.
 *
 * Until now a day was one question: open it, answer, continue — around ten
 * seconds of work for something the product calls a daily practice. A day is
 * now a short sequence instead, so moving through it takes the shape of sitting
 * with something rather than clearing it.
 *
 * ## Legacy days are not a special case
 *
 * Every day in the CMS today has no `steps` array, and none of them need one.
 * `stepsOf()` turns a day without steps into a one-step day built from the day's
 * own question, and **every reader in the system goes through it** — the
 * renderer, the personalisation engine, the answer store, the admin preview.
 * There is no "does this day have steps?" branch anywhere, which is the only
 * reason a 126-step content migration can happen path by path, in the CMS, with
 * the app already shipping.
 *
 * ## Step ids are the contract, not step order
 *
 * An answer is stored against `step.id`, never against its index. Re-ordering
 * the steps of a day, or inserting one in the middle, must not silently
 * reassign what somebody already wrote to a different question — which is
 * exactly what an index-keyed map does, quietly, with no error anywhere.
 */
export interface DayStep {
  /**
   * Stable key for this step's answer. Generated once when the step is
   * authored and never reused, so an answer can always be traced to the exact
   * question that produced it.
   */
  id: string;
  kind: DayKind;
  /** The question. */
  title: string;
  /** Supporting copy under the question. */
  body?: string;
  config?: DayConfig;
  /**
   * Elara's authored line for this step.
   *
   * Load-bearing: it is what the member is shown when the live reply cannot be
   * generated. A step with no `elara` line simply shows nothing in that case —
   * quieter than it should be, but never an error, and never a blocked step.
   */
  elara?: string;
}

/** What the CMS aims for per day. The client asked for three. */
export const DAY_STEPS_TARGET = 3;

/**
 * Hard ceiling. Not a product opinion so much as a bound on the day screen:
 * past five, a "day" is a form, and the progress dots stop being countable at a
 * glance.
 */
export const DAY_STEPS_MAX = 5;

/**
 * The id given to the synthetic step of a day that has none authored.
 *
 * Deliberately a fixed, readable string rather than a generated id: it appears
 * in stored answers for every legacy day, and a value that changed between
 * reads would orphan every one of them.
 */
export const LEGACY_STEP_ID = "main";

/**
 * The steps of a day — authored, or the single synthetic one.
 *
 * The one function that decides what "the questions of this day" means. Call it
 * everywhere rather than reading `day.steps` directly; reading the field
 * directly is how a legacy day becomes a day with zero questions.
 */
export function stepsOf(day: PathDayDTO): DayStep[] {
  if (day.steps?.length) return day.steps;
  return [
    {
      id: LEGACY_STEP_ID,
      kind: day.kind,
      title: day.title,
      ...(day.body ? { body: day.body } : {}),
      ...(day.config ? { config: day.config } : {}),
      ...(day.elara ? { elara: day.elara } : {}),
    },
  ];
}

/** One step's answer, and what Elara said back to it. */
export interface StepAnswer {
  value: DayValue;
  /**
   * What kind of answer this is. Absent means `answered` — every answer stored
   * before states existed. Any other state stores `value: null`: the state IS
   * the answer, and nothing downstream may quote it as her words
   * (`answerRecord`, `isAnswered`).
   */
  state?: AnswerState;
  /**
   * Elara's response to this answer.
   *
   * Stored rather than re-generated, because a member re-opening a finished day
   * must see the conversation they actually had. Re-running the model would
   * hand them a different reply to the same words, which reads as the app
   * having forgotten.
   */
  reply?: string;
  /** False when `reply` is the authored fallback rather than a live one. */
  generated?: boolean;
  repliedAt?: number;
  /** When she answered (epoch ms) — what lets Elara say "On Tuesday you said…". */
  answeredAt?: number;
  /**
   * Her own calendar day when she answered, `YYYY-MM-DD`, fixed at write time
   * (the date she sent, clamped). `answeredAt` is the instant; this is the
   * date-only fact a record prints ("At the old star · Thu 24 Sep"), so it
   * never moves when her stored zone does. Absent on answers written before
   * it existed.
   */
  answeredOn?: string;
  /**
   * The answer matched the safety list (T2/T3). Kept — it is hers — but never
   * the day's headline, never a signal, never quoted to a model.
   */
  safety?: 2 | 3;
  /** How a reflection was given — written, said aloud (transcribed), drawn. Absent from older builds. */
  mode?: ReflectMode;
  /**
   * `reply` is the invitation to try again, not a response to what she said:
   * the answer read as no answer at all (`isNonAnswer`). Never quoted as
   * something Elara noticed.
   */
  retry?: boolean;
  /**
   * How her reply to this step landed, from the resonance check that quoted it
   * (`ratesReply`): feedback on Elara's line, never a request for another one
   * (spec §2). Written by the server when the check is answered.
   */
  resonance?: ReplyResonance;
}


/** Every step answer for one day, keyed by step id. */
export type DayStepAnswers = Record<string, StepAnswer>;

/**
 * The answer that represents the whole day to everything outside this module.
 *
 * `day_response.value` is read by the guide's context block, the signal log and
 * the memory tiers, all of which want *what the member wrote* and none of which
 * should have to learn about steps. So a multi-step day still stores one
 * headline value alongside its step map.
 *
 * The order of preference is the point:
 *
 * 1. a **reflect** step's prose — the only kind where the member composes a
 *    sentence, and the only kind the memory system can do anything with. A
 *    *drawn* reflection counts by its caption: the ink is for her, the words
 *    are what she wrote "so Elara can respond", and a model cannot read ink;
 * 2. any other non-empty string, e.g. a chosen option's label;
 * 3. whatever was answered first, of any kind.
 *
 * Rule 1 sits above rule 2 because a `choose` answer is a *string* without
 * being *prose*. "A pause" is seven characters of label, and letting it win
 * over the paragraph someone wrote two steps later — purely because it was
 * answered first — would quietly starve the memory tiers on exactly the days a
 * member said the most.
 */
export function headlineValue(steps: DayStep[], answers: DayStepAnswers): DayValue {
  let firstString: string | null = null;
  let firstAny: DayValue = null;
  let seenAny = false;

  // Only the steps asked now: an answer kept for a question she is no longer
  // asked (`offeredAnswers`) does not speak for the day. Without a `when`
  // anywhere this is `steps` itself.
  for (const step of offeredSteps(steps, answers)) {
    if (answers[step.id]?.safety) continue;
    // A state is not her words, and a hidden step's answer never stands in for
    // the day anywhere outside the day screen (`DayConfig.hidden`).
    if (hasStateAnswer(answers[step.id]) || step.config?.hidden) continue;
    const value = answers[step.id]?.value;
    if (value == null) continue;
    // Nor is "none right now" (`noneOption`): it is never quoted back as
    // «Hoy dijiste», and the memory tiers have nothing to keep from it.
    if (isNoneChoice(step, value)) continue;
    if (step.kind === "reflect" && isDrawn(value) && value.caption.trim()) {
      return value.caption.trim();
    }
    // A photo is the words she gave it — nothing outside this module can see it.
    if (step.kind === "photo" && isPhoto(value) && value.caption.trim()) {
      if (firstString === null) firstString = value.caption.trim();
      continue;
    }
    if (typeof value === "string" && value.trim()) {
      if (step.kind === "reflect") return value;
      if (firstString === null) firstString = value;
    }
    if (!seenAny) {
      firstAny = value;
      seenAny = true;
    }
  }
  return firstString ?? firstAny;
}

/**
 * Has every step of this day been answered?
 *
 * Only the steps that are **offered** (`offeredSteps`) are waited for: a
 * follow-up whose condition is false never holds the day open. A step with an
 * explicit state (`unsure`, `none`, `notNow`, `skipped`, `declined`) counts as
 * answered — the state IS the answer, the same way `acceptsEmpty` works. A
 * stored `notOffered` on a step that is offered now does not: the question has
 * since become one she has not been asked.
 */
export function allStepsAnswered(steps: DayStep[], answers: DayStepAnswers): boolean {
  return offeredSteps(steps, answers).every((step) => {
    // A breathing moment or an aside is an offer, not a question: skipped, or walked past
    // by a member who was already mid-day when it was added, it never holds
    // the day open.
    if (isAside(step)) return true;
    // A stored `notOffered` on a step asked now is no answer (`heldAnswer`).
    const answer = heldAnswer(answers[step.id]);
    if (!answer) return false;
    if (stateOf(answer) !== "answered") return true;
    // `info`/`read`/`recall` store nothing — acknowledging them IS the answer,
    // and the presence of the row is what records it. A skippable step
    // (a follow-up, anything marked optional) is the same once skipped.
    if (acceptsEmpty(step)) return true;
    return answer.value != null;
  });
}

/**
 * Elara answers every step, including the ones with nothing to read.
 *
 * A step where the member only tapped a number still gets a response — the
 * product decision is that the day reads as a conversation throughout, not as a
 * form with a conversation at the end. What changes by kind is what the model is
 * given to respond *to*: prose for a reflection, the chosen label for a choice,
 * the position on the scale for a rating.
 *
 * How the words arrived is said plainly, because the model cannot tell: a
 * transcript of "Hey, what's up? It's Kara" is somebody testing the microphone,
 * not a sentence about a Kara; typed words are not a drawing. `mode` is what
 * the member actually used (absent from older builds, when it is left unsaid).
 */
export function describeAnswer(step: DayStep, value: DayValue, mode?: ReflectMode, state?: AnswerState): string {
  // A state is said as a state, never as words: "(they said they are not sure)"
  // cannot be mistaken for an answer the reply should build on.
  if (state && state !== "answered") return `(${STATE_DESCRIPTIONS[state]})`;
  // "None right now" picked from the options (`noneOption`) is said exactly as
  // the state is: the reply accepts it plainly and builds nothing on the label.
  if (isNoneChoice(step, value)) return `(${STATE_DESCRIPTIONS.none})`;
  if (value == null) {
    if (step.kind === "info" || step.kind === "read" || step.kind === "recall") {
      return "(they read it and moved on)";
    }
    return step.config?.optional || step.kind === "followUp" ? "(they skipped this one)" : "(no answer)";
  }
  if (typeof value === "string") {
    const options = step.config?.options ?? [];
    // "Something else" is her words, not one of ours — the model should know
    // it is not reading a label.
    if (options.length && readChoice(value, options).choice === OTHER_KEY) {
      return `(none of the options; in their own words) ${value}`;
    }
    if (options.length) return value;
    if (mode === "say") return `(they said this aloud; it was transcribed, so expect speech and transcription slips) ${value}`;
    if (mode === "write") return `(they wrote) ${value}`;
    return value;
  }
  if (Array.isArray(value)) {
    if (step.kind === "blanks") return answerText(value, step) || "(they left every blank empty)";
    if (step.config?.ranked) return `In order: ${value.map((v, i) => `${i + 1}. ${v}`).join(", ")}`;
    return value.join(", ");
  }
  if (isPhoto(value)) {
    const caption = value.caption.trim();
    if (!value.photo) return caption ? `(they described it instead of a photo) ${caption}` : "(no answer)";
    return caption ? `(they took a photo of it, and called it) ${caption}` : "(they shared a photo, without words)";
  }
  if (isDrawn(value)) {
    // A caption of "hi" is not words about the drawing.
    const caption = value.caption.trim();
    return caption && !isNonAnswer(caption)
      ? `(they drew it, and captioned it) ${caption}`
      : "(they drew it, without words; you cannot see the drawing)";
  }
  if (isSorted(value)) {
    const [a, b] = step.config?.columns ?? [];
    const inA = Object.entries(value.sorted).filter(([, c]) => c === a).map(([i]) => i);
    const inB = Object.entries(value.sorted).filter(([, c]) => c === b).map(([i]) => i);
    if (a && b) return `${a}: ${inA.join(", ") || "nothing"}. ${b}: ${inB.join(", ") || "nothing"}.`;
    return Object.entries(value.sorted).map(([i, c]) => `${i} → ${c}`).join("; ");
  }
  if (typeof value === "number" && step.config?.stops?.length) {
    if (value === SCALE_ESCAPE) {
      return `(they chose "not sure yet" rather than a point on the scale of: ${step.config.stops.join(" / ")})`;
    }
    return `${answerText(value, step)} (on a scale of: ${step.config.stops.join(" / ")})`;
  }
  if (typeof value === "number") {
    const min = step.config?.min ?? 1;
    const max = step.config?.max ?? 5;
    const low = step.config?.minLabel ? ` (${min} = ${step.config.minLabel})` : "";
    const high = step.config?.maxLabel ? ` (${max} = ${step.config.maxLabel})` : "";
    return `${value} out of ${max}${low}${high}`;
  }
  if (typeof value === "object" && "done" in value) {
    return value.done ? "(they did it)" : "(not done yet)";
  }
  return "(no answer)";
}

const STATE_DESCRIPTIONS: Record<Exclude<AnswerState, "answered">, string> = {
  unsure: "they said they are not sure",
  none: "they said there is none right now",
  notNow: "they left this one for later",
  skipped: "they chose not to answer this one",
  notOffered: "they were not asked this one",
  declined: "they chose not to do today's practice",
};

/**
 * Bounds on Elara's step reply.
 *
 * Two to three sentences. It sits between the question they just answered and
 * the next one, so anything longer stops being a response and becomes another
 * thing to read before they are allowed to continue.
 */
export const STEP_REPLY_MAX = 320;
export const STEP_REPLY_MIN = 12;

/**
 * How long the day screen waits for a live reply before showing the authored
 * line instead.
 *
 * Short on purpose. The alternative to a fast fallback is not a better reply —
 * it is a member watching three dots at the exact moment they have finished
 * saying something difficult. Six seconds is the client's number
 * (Interaction States spec: "takes more than 6 seconds, show the approved
 * fixed fallback line").
 */
export const STEP_REPLY_TIMEOUT_MS = 6000;
