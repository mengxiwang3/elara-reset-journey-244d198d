import {
  dayPosition,
  isAside,
  lastTakeaway,
  resolveTemplate,
  stepsOf,
  takeawayText,
  type AnswerBook,
  type PathDayDTO,
  type TemplateContext,
} from "@elara/shared";
import { calendarDaysBetween } from "@/hooks/todayEntry";

/**
 * The daily session around the day screen (Nov 2026), decided with no React
 * in it so the rules are tested in Node: when a day opens on its purpose,
 * what «Mañana» says, and where Hoy keeps what she took away.
 */

/**
 * Does the day open on its session opening («Por qué hoy», the empty card)?
 *
 * Only a day with a `purpose`, and only on the way in: never when she is
 * resuming it. A saved answer, a draft with something of hers in it, the step
 * this phone remembers her on, or a link that names a step all mean she is
 * partway, and she goes straight back to her step.
 */
export function opensOnSession(o: {
  purpose: string | null | undefined;
  /** The day is already finished. */
  complete: boolean;
  /** Any answer of hers is stored for the day. */
  answered: boolean;
  /** A step of the day holds a draft with something of hers in it. */
  drafted: boolean;
  /** This phone remembers her on a step of the day. */
  remembered: boolean;
  /** A link named the step to open on. */
  stepParam: boolean;
  /** Walking a finished day again. */
  again: boolean;
}): boolean {
  if (!o.purpose?.trim()) return false;
  return !(o.complete || o.answered || o.drafted || o.remembered || o.stepParam || o.again);
}

/**
 * The first question of the day after `day`, as she will be asked it, for the
 * close's «Mañana: …». Null when there is no next day, or when its question
 * quotes something that cannot be filled yet.
 */
export function nextQuestion(
  days: readonly PathDayDTO[],
  day: number,
  ctx?: Omit<TemplateContext, "day">,
): string | null {
  const next = days.find((d) => d.day === day + 1);
  if (!next) return null;
  const first = stepsOf(next).find((s) => !isAside(s));
  const title = first?.title?.trim();
  if (!first || !title) return null;
  const resolved = ctx ? resolveTemplate(first.title, first.config?.titleFallback, { ...ctx, day: day + 1 }) : null;
  const text = (resolved?.text ?? title).trim();
  // An unresolved reference is never printed as braces.
  return text && !/[{}]/.test(text) ? text : null;
}

/** Hoy's card of what she took away. */
export interface HoyTakeaway {
  /** `top`: today's day is done, so it leads Hoy. `underHero`: the last one, under today's new day. */
  placement: "top" | "underHero";
  day: number;
  week: number;
  dayInWeek: number;
  /** Her words, exactly as she wrote them. */
  text: string;
  /** She wrote it on today's calendar day. */
  today: boolean;
}

/**
 * What Hoy shows of her takeaway, and where (P0-7).
 *
 * - Today's day is done (`review`): today's takeaway, at the top.
 * - A new day is open (`practice`), or the week is done (`week`): the last
 *   takeaway she wrote, under the day's card.
 *
 * Her words only (`takeawayText`): a skip, «Ninguna por ahora», a state, a
 * hidden or flagged answer is never quoted. Nor is an answer the server
 * refused (`refused`): its words wait in its step, not kept. Null when there
 * is nothing of hers.
 */
export function hoyTakeaway(
  entry: { kind: "practice" | "review" | "week"; day: number } | null,
  days: readonly PathDayDTO[],
  progress: { completedDays: readonly number[]; stepAnswers: AnswerBook; dayCompletedAt?: Record<number, number> },
  now: number,
  refused?: (day: number, stepId: string) => boolean,
): HoyTakeaway | null {
  if (!entry || !days.length) return null;
  if (refused) {
    const stepAnswers: AnswerBook = {};
    for (const [day, answers] of Object.entries(progress.stepAnswers)) {
      stepAnswers[Number(day)] = Object.fromEntries(
        Object.entries(answers ?? {}).filter(([stepId]) => !refused(Number(day), stepId)),
      );
    }
    progress = { ...progress, stepAnswers };
  }
  const when = (day: number, at: number | null) => progress.dayCompletedAt?.[day] ?? at;
  const isToday = (at: number | null | undefined) => typeof at === "number" && calendarDaysBetween(now, at) === 0;
  if (entry.kind === "review") {
    const content = days.find((d) => d.day === entry.day);
    if (!content || !progress.completedDays.includes(entry.day)) return null;
    const text = takeawayText(stepsOf(content), progress.stepAnswers[entry.day]);
    if (!text) return null;
    const { week, dayInWeek } = dayPosition(entry.day, days);
    return { placement: "top", day: entry.day, week, dayInWeek, text, today: isToday(when(entry.day, null)) };
  }
  const last = lastTakeaway(days, progress, entry.kind === "week" ? entry.day + 1 : entry.day);
  if (!last) return null;
  return {
    placement: "underHero",
    day: last.day,
    week: last.week,
    dayInWeek: last.dayInWeek,
    text: last.text,
    today: isToday(when(last.day, last.at)),
  };
}
