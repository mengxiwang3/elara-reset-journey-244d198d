import {
  authoredReply,
  describeAnswer,
  isNonAnswer,
  isQuiet,
  isUnsureAnswer,
  isSkippedAnswer,
  ownWords,
  resolveLocale,
  STEP_REPLY_MAX,
  STEP_REPLY_MIN,
  usesBodyFallback,
  type DayStep,
  type DayStepAnswers,
  type DayValue,
  type Locale,
  type ReflectMode,
} from "@elara/shared";
import type { Db } from "../db";
import type { Bindings } from "../env";
import { askModel } from "../lib/ai";
import type { UsageContext } from "../lib/aiUsage";
import { practice } from "../lib/messages";
import {
  BASE_PROMPT,
  DEFAULT_PERSONALITY,
  GUIDE_PERSONALITIES,
  LANGUAGE_PROMPT,
  loadGuideProfile,
} from "./chat";
import { buildGuideContextWithProfile } from "./context";

/**
 * Elara's answer to one step of a path day.
 *
 * ## Why this exists
 *
 * A day used to end with a line somebody wrote months ago, printed under
 * whatever the member had just typed. It was the same line for everyone, every
 * time, and it read as one — which is what "there's no AI integration, the AI
 * doesn't actually come out with a chat answer" meant. This is the answer.
 *
 * ## The authored line is still the product
 *
 * Exactly the same discipline as personalised questions: `step.elara` is not an
 * error state that appears when the model fails, it is the floor. Every exit
 * from this module returns something showable, and the caller has no error
 * branch to write. A member never learns that a model was involved, in either
 * direction.
 *
 * ## Every step gets a reply, including the ones with nothing to read
 *
 * A step where they only tapped a number still gets a response. What changes by
 * kind is what the model is handed — prose for a reflection, the chosen label
 * for a choice, the position on the scale for a rating — which is what
 * `describeAnswer()` is for. The alternative, replying only to prose, makes the
 * day lurch between conversation and form.
 *
 * ## An answer that is not one is not built on
 *
 * "Hey, what's up? It's Kara" said into the microphone once came back as a
 * reply about a family member called Kara. A model handed words will find
 * meaning in them, so words that answer nothing (`isNonAnswer`: a greeting, a
 * test, a key mash) never reach it: she is invited to try again instead, in a
 * line written here, and the reply is marked `retry` so nothing later quotes it
 * as something Elara noticed. The step still counts as answered — completion is
 * the authored steps' call, not this module's.
 */

export interface StepReply {
  text: string;
  /** False when this is the authored line rather than something just written. */
  generated: boolean;
  /** The answer read as no answer, and `text` invites her to try again. */
  retry?: boolean;
}

/**
 * Signs the model narrated the task instead of doing it. Smaller than the
 * personalisation set on purpose: this reply is conversational, so phrases that
 * are chatter in a *question* ("here's the thing") are perfectly natural here.
 * Only the tells that mean the model has stepped outside the persona are caught.
 */
const TELLS = [/\bas an ai\b/i, /\bas your ai\b/i, /\blanguage model\b/i, /\{\{|\}\}/, /```/];

/**
 * What the reply is for, which differs on the last step of a day (the "V2"
 * job lines, reply bench of 2 Nov 2026).
 *
 * Mid-day it is one move and a bridge: a question of its own there would
 * compete with the step that follows it, and the member would answer the wrong
 * one. On the last step it names her takeaway in her own words, because there
 * is nothing after it to hand over to.
 */
export function jobFor(position: number, total: number): string {
  if (total <= 1) {
    return "This was today's only step. Name her takeaway in her own words (one sentence at most). Do not ask a question.";
  }
  if (position >= total) {
    return `This was the last of ${total} steps today. Name her takeaway in her own words (one sentence at most). Do not ask a question.`;
  }
  return `This was step ${position} of ${total} today, and another question follows immediately. Make your one move in one or two sentences. Do NOT ask a question of your own; it would compete with the step that comes next.`;
}

/**
 * The reply's instructions on a day without a `purpose`, exactly as they were
 * before the daily session: DESIGN-DECISIONS keeps every other day's
 * behaviour until it is given a purpose ("What is out of scope").
 */
function legacyJobFor(position: number, total: number): string {
  if (total === 1) {
    return "This is the whole of today's practice. Acknowledge what they said and close the day warmly. Do not ask a question.";
  }
  if (position >= total) {
    return `This was the last of ${total} steps today. Close the day in a sentence or two, touching on what they actually shared today, and close warmly. Do not ask a question.`;
  }
  return `This was step ${position} of ${total} today, and another question follows immediately. Acknowledge what they said in one or two sentences and leave them ready for the next one. Do NOT ask a question of your own; it would compete with the step that comes next.`;
}

/** The previous instructions, for a day with no `purpose` (see `legacyJobFor`). */
export function legacyStepInstructions(o: { dayNumber: number; dayTitle: string; position: number; total: number }): string {
  return `You are responding to one step of day ${o.dayNumber} of their path ("${o.dayTitle}").
${legacyJobFor(o.position, o.total)}

Answer with the reply text only: no greeting, no sign-off, no quotation marks around it, no markdown.
Keep it under ${STEP_REPLY_MAX - 40} characters. Two or three short sentences at most.
Reflect back something specific they actually said rather than praising them for answering.

Respond only to what they actually said in this answer, to this question.
- The answer is labelled with how it was given (written, said aloud and transcribed, drawn). Believe the label: never talk about a drawing unless they drew, and treat a transcript as speech that may contain slips.
- Never infer people, names or relationships that are not stated as such. A name on its own is not a family member, a partner or a friend.
- Never state their feelings, needs, motives or progress as facts. Reflect back what they chose or wrote; anything beyond it is offered tentatively ("maybe", "it sounds like") and easy for them to correct.
- The background notes above help you understand them. Do not bring people, events or details from them into this reply unless this answer raised them.
- If the answer is very short, off-topic, a greeting, a test, or does not answer the question, do not build meaning from it. Gently acknowledge it and invite them to try the question again in their own words.
- Never use em dashes (\u2014). Use a comma or a full stop instead.`;
}

/**
 * The reply's own instructions on a daily-session day (one with a `purpose`):
 * where the step sits, then the one move and the
 * mentor rules (the bench's recommended "V2" block plus the daily session's
 * rules of 3 Nov 2026), then the rules about reading her answer, unchanged.
 *
 * Exported for the tests, which pin the rules that are product decisions: no
 * praise, no question, nothing she did not say, never "safe" or "free", never
 * her timing for her.
 */
export function stepInstructions(o: {
  dayNumber: number;
  dayTitle: string;
  position: number;
  total: number;
  /** Why today matters, as she was shown it (`DayConfig.purpose`). */
  purpose?: string;
  /** What this step's slot on her takeaway card is for (`DayConfig.card.hint`). */
  cardHint?: string;
}): string {
  const lines = [`You are responding to one step of day ${o.dayNumber} of their path ("${o.dayTitle}").`];
  if (o.purpose?.trim()) lines.push(`Purpose of today (shown to her before the first question): ${o.purpose.trim()}`);
  if (o.cardHint?.trim()) {
    lines.push(`What this step should leave her with (the empty line of her takeaway card said): ${o.cardHint.trim()}`);
  }
  lines.push(jobFor(o.position, o.total));
  return `${lines.join("\n")}

Answer with the reply text only: no greeting, no sign-off, no quotation marks around it, no markdown.
Keep it under ${STEP_REPLY_MAX - 40} characters. Two or three short sentences at most.
Before writing, decide silently which ONE move fits her answer best:
(a) a distinction she can use, (b) a tighter version of her own words, (c) the missing fact that would answer her question, and who could confirm it when her own words point to them, (d) a smaller option that fits what she said about her time, money and situation.
If she skipped, said she cannot today, or is unsure, the move is to accept it plainly and close: no task, no persuasion.
If she said there is none right now, accept it plainly: no task and no suggestion of one.
If her answer is long, the move is a one-line version of it, in her own words.
If her answer is vague, offer one way to narrow it, as an option she can take or leave, never as an order.
If she corrects an earlier reading, take the correction as true and update without arguing.
Write only that move, grounded in her exact words. No praise and no grading of what she wrote ("buena idea", "muy bien", "great idea", "well done"). No interpretation of her feelings or motives. No new task. Do not ask her a question.
Never add people, places, employers, institutions or facts she did not mention.
Never say that an action is safe, free, easy, guaranteed or without consequences.
Do not assume when or whether she can act ("this week", "today", "esta semana", "hoy mismo") unless she said so. Leave the decision, and its timing, with her.
These instructions override the voice note above about ending on a question.

Respond only to what they actually said in this answer, to this question.
- The answer is labelled with how it was given (written, said aloud and transcribed, drawn). Believe the label: never talk about a drawing unless they drew, and treat a transcript as speech that may contain slips.
- Never infer people, names or relationships that are not stated as such. A name on its own is not a family member, a partner or a friend.
- Never state their feelings, needs, motives or progress as facts. Reflect back what they chose or wrote; anything beyond it is offered tentatively ("maybe", "it sounds like") and easy for them to correct.
- The background notes above help you understand them. Do not bring people, events or details from them into this reply unless this answer raised them.
- If the answer is very short, off-topic, a greeting, a test, or does not answer the question, do not build meaning from it. Gently acknowledge it and invite them to try the question again in their own words.
- Never use em dashes (\u2014). Use a comma or a full stop instead.`;
}

/**
 * Generate Elara's response to one step. Never throws, always returns something
 * showable.
 *
 * The model is given the member's background block — the same one the guide
 * chat uses, so a reply on the path and a reply in the conversation are
 * informed by the same picture of them — plus the question, their answer, and
 * where in the day this sits.
 */
export async function replyToStep(
  env: Bindings,
  db: Db,
  userId: string,
  opts: {
    step: DayStep;
    value: DayValue;
    /** 1-based position of this step within its day. */
    position: number;
    total: number;
    /** What the day is called, for a little orientation. */
    dayTitle: string;
    dayNumber: number;
    /** How a reflection was given, when the app said (older builds do not). */
    mode?: ReflectMode;
    /** Metering context (session + `waitUntil`), so the usage row stays off the reply's path. */
    usage?: UsageContext;
    /**
     * The request's language (`c.get("locale")`): her saved preference, else
     * what the app asked in. The route already serves the day in it; without
     * this the reply read only the column, and an unset column is English, so
     * a Spanish day could be answered in English. Omitted, the column decides.
     */
    locale?: Locale;
    /** Why today matters (`DayConfig.purpose`), when the day says. */
    purpose?: string;
    /** The day's steps and her answers so far: what she was actually shown under the question. */
    steps?: readonly DayStep[];
    answers?: DayStepAnswers;
  },
): Promise<StepReply> {
  const fallback = fallbackFor(opts.step);
  // A `hidden` step's answer is never put in a prompt (the route does not call
  // this for one; this is the second lock on the same door).
  if (opts.step.config?.hidden) return fallback;
  // Nor is a skip ever answered: a skip ends the exercise. The route does not
  // call this for one either; nothing is shown and nothing is kept.
  if (isSkippedAnswer(opts.step, opts.value)) return { text: "", generated: false };
  // A reply written for this exact option ("Did it" → "You did what you said
  // you would") is not a fallback, it is the answer. The screen showed it the
  // moment she tapped; storing the same line keeps the replay honest.
  const written = authoredReply(opts.step, opts.value);
  if (written) return { text: written, generated: false };
  // Quiet steps — Elara has just spoken, or there is nothing to answer — get
  // the authored line and never a model call. The screen does not wait for a
  // reply on these, so generating one would be paying for words nobody sees.
  if (isQuiet(opts.step)) return fallback;
  try {
    // Her guide settings ride in the background block's one wave (this was the
    // profile read, then the block's own three round trips). A failed block
    // costs personalisation, never the reply — same rule the guide chat
    // applies to the same block — so then the settings are read on their own.
    const built = await buildGuideContextWithProfile(db, userId, {
      text: typeof opts.value === "string" ? opts.value : undefined,
    }).catch(() => null);
    const profile = built
      ? {
          personality: built.profile.guidePersonality ?? DEFAULT_PERSONALITY,
          locale: resolveLocale(built.profile.locale),
        }
      : await loadGuideProfile(db, userId);
    const locale: Locale = opts.locale ?? resolveLocale(profile.locale);
    // A daily-session day (one with a purpose) is answered under the session's
    // mentor rules; every other day keeps the reply it had.
    const session = !!opts.purpose?.trim();
    // Words that answer nothing are not handed to a model to find meaning in.
    // A deferred reply is read on a later screen, where "try again" cannot be
    // acted on, so it gets the authored line instead. On a session day an
    // honest "No sé" is an answer (DESIGN-DECISIONS, pressure tests): it goes
    // to the model, whose rules accept it plainly, with no task.
    const own = ownWords(opts.step, opts.value);
    if (own !== null && isNonAnswer(own) && !(session && isUnsureAnswer(own))) {
      return opts.step.config?.deferReply
        ? fallback
        : { text: practice.retryInvite(locale), generated: false, retry: true };
    }
    const answer = describeAnswer(opts.step, opts.value, opts.mode);
    const context = built?.context ?? "";

    const persona =
      GUIDE_PERSONALITIES[(profile.personality ?? DEFAULT_PERSONALITY).toLowerCase()] ??
      GUIDE_PERSONALITIES[DEFAULT_PERSONALITY];

    const instructions = [
      BASE_PROMPT,
      persona.prompt,
      context,
      session
        ? stepInstructions({
            dayNumber: opts.dayNumber,
            dayTitle: opts.dayTitle,
            position: opts.position,
            total: opts.total,
            purpose: opts.purpose,
            cardHint: opts.step.config?.card?.hint,
          })
        : legacyStepInstructions({ dayNumber: opts.dayNumber, dayTitle: opts.dayTitle, position: opts.position, total: opts.total }),
      // Last, deliberately — see LANGUAGE_PROMPT in services/chat.ts.
      LANGUAGE_PROMPT[locale],
    ]
      .filter(Boolean)
      .join("\n\n");

    // The line under the question as she saw it: the option-free fallback when
    // the step before it was skipped or answered "none right now".
    const shownBody =
      opts.steps && usesBodyFallback(opts.step, opts.steps, opts.answers) ? opts.step.config?.bodyFallback : undefined;
    const raw = await askModel(env, {
      instructions,
      input: [
        {
          role: "user",
          content: questionFor(opts.step, shownBody) + `\nWhat they answered: ${answer}`,
        },
      ],
      feature: "path-step-reply",
      userId,
      sessionId: opts.usage?.sessionId,
      waitUntil: opts.usage?.waitUntil,
      maxTokens: 400,
      effort: "low",
    });

    const clean = sanitize(raw);
    return clean ? { text: clean, generated: true } : fallback;
  } catch (err) {
    // Detached from nothing — the caller is a live request — so this must not
    // propagate. The member has already been told their answer was saved.
    console.error("stepReply: failed", err);
    return fallback;
  }
}

/**
 * What they were asked, as they saw it: the heading, the supporting copy and
 * the prompt line under it. The heading alone ("Look at it") is often not the
 * question; the body is ("What did you notice about how you spend?").
 *
 * A heading may quote an earlier answer by reference ("{d1.feeling}"). The
 * model is not the place to resolve those; an ellipsis reads as a question
 * with a gap, the raw token reads as a bug.
 */
export function questionFor(step: DayStep, shownBody?: string): string {
  const gap = (text: string) => text.replace(/\{[^}]*\}/g, "…").trim();
  const lines = [`The question they were asked: ${gap(step.title)}`];
  const body = shownBody?.trim() || step.body?.trim();
  if (body) lines.push(`Under it: ${gap(body)}`);
  if (step.config?.prompt?.trim()) lines.push(`Prompt: ${gap(step.config.prompt)}`);
  return lines.join("\n");
}

/** The authored line, or nothing. Never an error, never an apology. */
export function fallbackFor(step: DayStep): StepReply {
  return { text: (step.elara ?? "").trim(), generated: false };
}

/**
 * Trim a reply to something that fits between two questions, or reject it.
 *
 * Rejection here is cheap and safe — it costs the authored line — so the bar is
 * "would this read as Elara speaking", not "is this the best possible reply".
 * A reply that is merely mediocre is still shown; one that is empty, enormous,
 * or visibly a model talking about itself is not.
 */
function sanitize(raw: string): string | null {
  let text = raw.trim();
  if (!text) return null;
  // Models like to wrap a "quote" in quotes. The screen already presents it as
  // her speaking, so the marks read as a second layer of quotation.
  text = text.replace(/^["“”']+|["“”']+$/g, "").trim();
  text = text.replace(/```[\s\S]*?```/g, "").trim();
  if (text.length < STEP_REPLY_MIN) return null;
  if (TELLS.some((t) => t.test(text))) return null;
  if (text.length <= STEP_REPLY_MAX) return text;

  // Over-long: keep whole sentences rather than cutting mid-word. A reply that
  // stops at "and then you could—" is worse than a shorter complete one.
  const kept: string[] = [];
  let used = 0;
  for (const sentence of text.split(/(?<=[.!?…])\s+/)) {
    if (used + sentence.length > STEP_REPLY_MAX) break;
    kept.push(sentence);
    used += sentence.length + 1;
  }
  const trimmed = kept.join(" ").trim();
  return trimmed.length >= STEP_REPLY_MIN ? trimmed : null;
}
