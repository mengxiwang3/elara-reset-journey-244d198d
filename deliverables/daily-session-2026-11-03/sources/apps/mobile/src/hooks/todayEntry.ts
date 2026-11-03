import {
  dayPosition,
  heldAnswer,
  isAside,
  nextDayOpensAt,
  stepsOf,
  weekIsFree,
  weekOf,
  type DayStepAnswers,
  type DayUnlockRule,
  type PathDayDTO,
} from "@elara/shared";
import { holdsWords, isKeptAnswer, type StepDraft } from "@/components/practice/draft";
import { completionAnchor, hasStarted, type DayGateState, type GateProgress } from "@/lib/dayGate";

/**
 * Whether a step's draft on this phone holds anything she gave: words, a
 * choice, a mark, a photo. The step screen saves its draft a moment after it
 * opens, untouched or not, so a draft's existence only says she was on the
 * step (beta hardening, 3 Nov 2026: Hoy read that as «Guardamos lo que
 * escribiste» over a day she had only opened).
 *
 * An answer the server refused for good is kept under the same key, as
 * `{ kept, refused }` (`keptAnswer`): its words are hers, and kept.
 */
export function draftHasWords(draft: unknown): boolean {
  if (!draft || typeof draft !== "object") return false;
  if (isKeptAnswer(draft)) return holdsWords(draft.kept);
  const d = draft as Partial<StepDraft>;
  const said = (s: unknown) => typeof s === "string" && s.trim().length > 0;
  return (
    said(d.choice) ||
    (Array.isArray(d.picks) && d.picks.length > 0) ||
    said(d.other) ||
    said(d.detail) ||
    (!!d.sorted && Object.keys(d.sorted).length > 0) ||
    typeof d.scale === "number" ||
    d.done === true ||
    (Array.isArray(d.blanks) && d.blanks.some(said)) ||
    (!!d.reflect && (said(d.reflect.text) || d.reflect.drawing != null || said(d.reflect.caption))) ||
    (!!d.photo && (d.photo.photo != null || d.photo.uri != null || said(d.photo.caption)))
  );
}

/**
 * "Today's entry": the one rule behind every door into today's practice
 * (Final Pass FX 1). Hoy's main button, the Pregunta tab (the orb) and the
 * Atlas "Continue" all read the same day state through this module and open
 * the same screen: today's practice at the step she was on, today's review
 * once the day is done, or the week once its last day is done.
 *
 * Pure: no React, no React Native, no router, so the rule is tested in Node
 * (`todayEntry.test.ts`). `useTodayEntry` adds the store reads, the words and
 * the navigation.
 *
 * Every input is the server's day state as the store mirrors it (completed
 * days, step answers, the first-completion anchors and the unlock rule from
 * `/api/app-config`). The only phone-only inputs are where she was inside an
 * unfinished day (`useDayPlace`) and whether a step holds an unsent draft:
 * both only ever move "Start" to "Continue", never which day opens.
 */

export type TodayEntryKind = "practice" | "review" | "week";

/**
 * - `ready`: today's day is open and untouched.
 * - `inProgress`: started (an answer, a draft, or a step she was on).
 * - `missed`: open since before today and untouched. Nothing is lost: the
 *   same day waits, the week does not move on.
 * - `done`: today's day is finished; the next opens on the unlock rule.
 * - `weekDone`: the day just finished was the last of its week.
 * - `pathDone`: every day of the path is finished.
 */
export type TodayState = "ready" | "inProgress" | "missed" | "done" | "weekDone" | "pathDone";

/** Which door was used. Only changes where closing the day returns to. */
export type EntrySource = "today" | "pregunta" | "atlas";

export interface EntryProgress extends GateProgress {
  /** When the path was started (epoch ms; 0 when unknown). Day 1's "open since". */
  startedAt?: number;
}

export interface EntryHref {
  pathname: "/path/day" | "/paywall";
  params: Record<string, string>;
}

export interface ResolvedEntry {
  kind: TodayEntryKind;
  state: TodayState;
  area: string;
  /** The path day the entry opens (1-based across the path). */
  day: number;
  week: number;
  /** 1..7: the number the member reads ("Day 3"). */
  dayInWeek: number;
  daysInWeek: number;
  /** The path day numbers of this week, in order. */
  weekDays: number[];
  doneInWeek: number;
  /** Open since before her today and not started. Also true for a started day she left before today. */
  missed: boolean;
  /** Where an unfinished day resumes: the step and its place among the day's steps. */
  step: { id: string; index: number; total: number } | null;
  /**
   * Something of hers is kept for this day: an answer the server or this phone
   * holds, or an unsent draft. Only then may the entry say «Guardamos lo que
   * escribiste»; a day she only opened is resumed without that claim.
   */
  saved: boolean;
  /** The day that opens next, and when (only while it waits). */
  nextDay: number | null;
  opensAt: number | null;
  /** This week needs a membership she does not have: the practice goes through the paywall. */
  membershipRequired: boolean;
  href: EntryHref;
}

export interface ResolveInput {
  area: string;
  days: readonly PathDayDTO[];
  progress: EntryProgress | undefined;
  /** `useDayGate`: non-null while the next day waits to open. */
  gate: DayGateState | null;
  rule: DayUnlockRule;
  now: number;
  /** Membership. `null` while the entitlement is still loading: never paywall on a guess. */
  premium: boolean | null;
  /** The step this phone remembers her on in the current day (already checked to be her own). */
  remembered?: string | null;
  /** Whether a step of `day` holds an unsent draft on this phone. */
  drafted?: (day: number, stepId: string) => boolean;
  source: EntrySource;
}

/** The routes that ARE today's entry: while one is on screen, Pregunta is the current tab. */
const ENTRY_SCREENS = new Set(["day", "day-complete", "complete", "week-intro"]);

/** True when the focused route is a practice, review or week screen (`useSegments()`). */
export function isEntryRoute(segments: readonly string[]): boolean {
  return segments[0] === "path" && ENTRY_SCREENS.has(segments[1] ?? "");
}

/** Local midnight at the start of `at`'s calendar day. */
export function startOfLocalDay(at: number): number {
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function nextLocalMidnight(at: number): number {
  const d = new Date(at);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

/**
 * When `day` became hers to do: day 1 when the path started, any other day
 * when the rule opened it after the day before closed. Under an `open` rule a
 * day finished at night is "for tomorrow", so it counts from the next
 * midnight; otherwise a member who stops after day 2 would read day 3 as
 * missed the very next morning. Null when there is nothing to count from.
 */
export function openedAt(progress: EntryProgress, day: number, rule: DayUnlockRule): number | null {
  if (day <= 1) return progress.startedAt && progress.startedAt > 0 ? progress.startedAt : null;
  if (!progress.completedDays.includes(day - 1)) return null;
  const anchor = completionAnchor(progress, day - 1);
  if (anchor === null) return null;
  if (rule.kind === "open") return nextLocalMidnight(anchor);
  return nextDayOpensAt(rule, anchor);
}

function weekDaysOf(days: readonly PathDayDTO[], week: number): number[] {
  return days
    .filter((d) => weekOf(d.day, d.config) === week)
    .map((d) => d.day)
    .sort((a, b) => a - b);
}

function stepOf(
  content: PathDayDTO | undefined,
  answers: DayStepAnswers | undefined,
  remembered: string | null | undefined,
): { id: string; index: number; total: number } | null {
  if (!content) return null;
  const steps = stepsOf(content).filter((s) => !isAside(s));
  if (!steps.length) return null;
  const at =
    (remembered ? steps.findIndex((s) => s.id === remembered) : -1) >= 0
      ? steps.findIndex((s) => s.id === remembered)
      : steps.findIndex((s) => !heldAnswer(answers?.[s.id]));
  const index = at >= 0 ? at : steps.length - 1;
  return { id: steps[index]!.id, index: index + 1, total: steps.length };
}

/**
 * The rule. Null while the path has no days yet (content still loading).
 *
 * The order is the Final Pass `entry()`:
 * 1. the path is finished, or today closed its week: the week;
 * 2. today's day is finished and the next waits: today's review;
 * 3. otherwise today's practice, resumed where she was.
 */
export function resolveTodayEntry(input: ResolveInput): ResolvedEntry | null {
  const { area, days, gate, rule, now, premium, source } = input;
  const total = days.length;
  if (!total) return null;
  const progress: EntryProgress = input.progress ?? { currentDay: 1, completedDays: [], stepAnswers: {} };
  const completed = new Set(progress.completedDays);
  const from = source === "atlas" ? "paths" : "today";
  const pathDone = days.every((d) => completed.has(d.day));

  const position = (day: number) => {
    const { week, dayInWeek } = dayPosition(day, days);
    const weekDays = weekDaysOf(days, week);
    return {
      week,
      dayInWeek: Math.max(1, dayInWeek),
      weekDays,
      daysInWeek: weekDays.length || 7,
      doneInWeek: weekDays.filter((d) => completed.has(d)).length,
    };
  };

  // 1-2. A finished day: the review, or the week when it closed the week.
  const finished = pathDone ? Math.max(...days.map((d) => d.day)) : gate?.finishedDay ?? null;
  if (finished !== null) {
    const pos = position(finished);
    const closesWeek = pathDone || pos.dayInWeek >= pos.daysInWeek;
    return {
      kind: closesWeek ? "week" : "review",
      state: pathDone ? "pathDone" : closesWeek ? "weekDone" : "done",
      area,
      day: finished,
      ...pos,
      missed: false,
      step: null,
      saved: false,
      nextDay: pathDone ? null : gate?.nextDay ?? null,
      opensAt: pathDone ? null : gate?.opensAt ?? null,
      membershipRequired: false,
      // No `redo`: a finished day opens on what she did (its arrival, or the
      // world's resolved card for the week's last day), with "Do this day
      // again" there.
      href: { pathname: "/path/day", params: { area, day: String(finished), from } },
    };
  }

  // 3. Today's practice.
  const day = Math.max(1, Math.min(progress.currentDay || 1, total));
  const pos = position(day);
  const content = days.find((d) => d.day === day);
  const answers = progress.stepAnswers[day];
  const dayDone = completed.has(day);
  const ids = content ? stepsOf(content).map((s) => s.id) : [];
  const drafted = !!input.drafted && ids.some((id) => input.drafted!(day, id));
  const remembered = input.remembered && ids.includes(input.remembered) ? input.remembered : null;
  // Kept for her: an answer, or an unsent draft. A step this phone remembers
  // her on means she was in the day, not that anything of hers was kept.
  const saved = !dayDone && (hasStarted(progress, day) || drafted);
  const started = saved || (!dayDone && !!remembered);
  const opened = openedAt(progress, day, rule);
  const missed = !dayDone && opened !== null && opened < startOfLocalDay(now);
  const membershipRequired = premium === false && !weekIsFree(pos.week);
  const step = started ? stepOf(content, answers, remembered) : null;
  const href: EntryHref = membershipRequired
    ? { pathname: "/paywall", params: { returnTo: `/path/day?area=${area}&day=${day}` } }
    : {
        pathname: "/path/day",
        params: {
          area,
          day: String(day),
          from,
          // The exact step, as the Atlas resume does (A5): the one this phone
          // remembers, else her first unanswered one.
          ...(step ? { step: step.id } : {}),
          // An odd day already closed with no gate (an `open` rule raced a
          // refetch): walk it from the top rather than show a dead arrival.
          ...(dayDone ? { redo: "1" } : {}),
        },
      };
  return {
    kind: "practice",
    state: started ? "inProgress" : missed ? "missed" : "ready",
    area,
    day,
    ...pos,
    missed,
    step,
    saved,
    nextDay: null,
    opensAt: null,
    membershipRequired,
    href,
  };
}

/**
 * The entry once the progress in the store is hers (`progressReady`), and
 * none before: until her own progress is read, the store's empty progress
 * reads as "Day 1" (beta hardening, 3 Nov 2026). Once it is ready the gate
 * decides as always, including a day whose answers are still queued on this
 * phone, which waits counted from now (`dayGateFor`'s `unsynced`). Neither
 * rule opens a day the other holds.
 */
export function todayEntryWhenReady(ready: boolean, input: ResolveInput): ResolvedEntry | null {
  return ready ? resolveTodayEntry(input) : null;
}

/** The strings the entry is told in (`t.home.hoy.entry`). Structural, so tests can pass the catalogue. */
export interface EntryWords {
  start: (day: number) => string;
  continue: (day: number) => string;
  stepHint: (step: number, total: number) => string;
  review: string;
  week: (place: string) => string;
}

/** The button's words, and the hint under it while a day is in progress. */
export function entryWords(entry: ResolvedEntry, words: EntryWords, place: string): { label: string; hint?: string } {
  if (entry.kind === "week") return { label: words.week(place) };
  if (entry.kind === "review") return { label: words.review };
  if (entry.state === "inProgress") {
    return {
      label: words.continue(entry.dayInWeek),
      // «Guardamos lo que escribiste» only over something kept: after a day she
      // only opened, it promised words that were never written (beta hardening).
      hint: entry.step && entry.saved ? words.stepHint(entry.step.index, entry.step.total) : undefined,
    };
  }
  return { label: words.start(entry.dayInWeek) };
}

/**
 * Whether the week card may say when the next week opens («La semana 2,
 * Wuzhen, se abre mañana»). Not when that week is membership and she has
 * none: it does not open for her, and the next morning's «Empezar el día 1»
 * went to a membership screen with nothing on sale (beta hardening, 3 Nov
 * 2026). `premium` is null while the entitlement loads: the line stays, as
 * every other door waits for the entitlement rather than guessing.
 */
export function promisesNextWeek(entry: Pick<ResolvedEntry, "kind" | "week">, premium: boolean | null): boolean {
  if (entry.kind !== "week") return true;
  return !(premium === false && !weekIsFree(entry.week + 1));
}

/** How many calendar days from `now`'s day to `at`'s day, in local time. */
export function calendarDaysBetween(now: number, at: number): number {
  return Math.round((startOfLocalDay(at) - startOfLocalDay(now)) / 86_400_000);
}
