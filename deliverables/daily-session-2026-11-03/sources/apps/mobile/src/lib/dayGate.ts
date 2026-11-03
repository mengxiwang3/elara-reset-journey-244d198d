import { dayFinishedAt, isInstant, nextDayOpensAt, type DayStepAnswers, type DayUnlockRule } from "@elara/shared";

/**
 * "Day 2 done · Come back tomorrow": when the next day opens on this phone,
 * and the first-completion time it counts from. Pure, so the rules that went
 * wrong (R2-M4: an edit after midnight pushed the next day back) are pinned by
 * `dayGate.test.ts`; `useDayGate` adds only the clock and the re-render.
 *
 * The phone only decides what to *show*. The server's gate (`assertDayOpen`)
 * is the authority: a day the phone opens early is refused there as
 * `day_locked`, which the offline queue keeps rather than drops. So nothing
 * here can let a device clock past the server; it can only make the phone
 * wait when the server would not, which is the bug this module exists to
 * stop.
 *
 * Completion itself is never decided here or by any scene or takeaway: they
 * all read `completedDays` and `stepAnswers` from the store. This module only
 * says *when* a finished day finished.
 */

/** The parts of `PathProgress` the gate reads (structural: the store imports React Native). */
export interface GateProgress {
  currentDay: number;
  completedDays: number[];
  stepAnswers: Record<number, DayStepAnswers>;
  dayCompletedAt?: Record<number, number>;
}

export interface DayGateState {
  finishedDay: number;
  nextDay: number;
  opensAt: number;
}

/**
 * When `day` first closed. In order:
 *
 * 1. `dayCompletedAt[day]`: the server's sticky `completed_at` once a read has
 *    landed (it always wins, `reconcileAnchors`), or this phone's own first
 *    completion, frozen when the day closed here (`anchorsAfterAnswer`).
 * 2. Legacy: a day with neither, from a store persisted before the field
 *    existed and not yet reconciled. Its last answer, the old rule.
 *    `reconcileAnchors` freezes this on the next read, so a later edit cannot
 *    move it.
 * 3. A day with no usable time at all (answers from before `answeredAt`, or
 *    only times that are not instants): `null`, no wait on the phone. The
 *    conservative choice for a display gate: the server still holds the day
 *    if it should be held, and the phone never invents a lock it cannot date.
 */
export function completionAnchor(progress: GateProgress, day: number): number | null {
  const fixed = progress.dayCompletedAt?.[day];
  if (isInstant(fixed)) return fixed;
  return dayFinishedAt(progress.stepAnswers[day]);
}

/** She has answered at least one step of `day` (the day screen's `!!dayAnswers`). */
export function hasStarted(progress: GateProgress, day: number): boolean {
  return Object.keys(progress.stepAnswers[day] ?? {}).length > 0;
}

/**
 * Whether her next day is still waiting to open, and when. `null` when there
 * is nothing to wait for: the rule is `open`, she hasn't finished a day, the
 * path is done, the moment has passed, there is no time to count from, or she
 * has already started the next day (a started day is never taken back: the
 * day screen and the server promise it, and Today must not say "come back
 * tomorrow" over a day she is in the middle of).
 */
export function dayGateFor(
  progress: GateProgress | undefined,
  totalDays: number,
  rule: DayUnlockRule,
  now: number,
  /** Days of this path with answers still queued on this phone (`pendingSteps`), not yet on the server. */
  unsynced: readonly number[] = [],
): DayGateState | null {
  if (!progress || rule.kind === "open") return null;
  const finishedDay = (progress.currentDay ?? 1) - 1;
  const nextDay = finishedDay + 1;
  if (finishedDay < 1 || nextDay > totalDays || !progress.completedDays.includes(finishedDay)) return null;
  if (hasStarted(progress, nextDay)) return null;
  let finishedAt = completionAnchor(progress, finishedDay);
  // A day finished here whose answers are still queued has not finished on the
  // server: it finishes there when they land, and its first completion is
  // stamped then. So the next day cannot open there before the moment counted
  // from *now*. Counting from this phone's own close instead opened a day the
  // server then refused (`day_locked`): a day finished offline last night,
  // synced after midnight, and the next one walked in between. The moment
  // re-counts as long as they stay queued, and the server's own time replaces
  // it once they land (`reconcileAnchors`).
  if (unsynced.includes(finishedDay)) finishedAt = Math.max(finishedAt ?? now, now);
  if (finishedAt === null) return null;
  const opensAt = nextDayOpensAt(rule, finishedAt);
  if (opensAt === null || !isInstant(now) || opensAt <= now) return null;
  return { finishedDay, nextDay, opensAt };
}

/** Only the entries that are instants: a `null` (JSON's Infinity/NaN) is no time. */
function instants(map: Record<number, unknown> | undefined): Record<number, number> {
  const out: Record<number, number> = {};
  for (const [day, at] of Object.entries(map ?? {})) {
    if (isInstant(at)) out[Number(day)] = at;
  }
  return out;
}

/**
 * The anchors after she answers a step of `day` on this phone. Applied before
 * the answer itself, against the progress as it stood.
 *
 * - An anchor that exists never moves: an edit is not a completion.
 * - A day that was already complete with no anchor (legacy) is frozen from
 *   its answers *before* this edit, not stamped now. Stamping now was the
 *   R2-M4 bug in a new place: the edit time became the first completion.
 * - A day this answer closes is stamped `now`, once.
 */
export function anchorsAfterAnswer(
  progress: Pick<GateProgress, "completedDays" | "stepAnswers" | "dayCompletedAt">,
  day: number,
  closesNow: boolean,
  now: number,
): Record<number, number> {
  const current = instants(progress.dayCompletedAt);
  if (isInstant(current[day])) return current;
  if (progress.completedDays.includes(day)) {
    const legacy = dayFinishedAt(progress.stepAnswers[day]);
    return legacy !== null ? { ...current, [day]: legacy } : current;
  }
  if (closesNow && isInstant(now)) return { ...current, [day]: now };
  return current;
}

/**
 * The anchors after a server read (`hydrateProgress`).
 *
 * - The server's first completion wins for every day it sends one: it is the
 *   time the server paces by, and the same on every device and reinstall. A
 *   local time for a day closed offline (stamped when she closed it, before
 *   the upload) yields to it; see REVIEW-02 §6 for why the two can differ.
 * - A local anchor the server does not contradict is kept: a day closed here
 *   and not yet heard about there, or a stale read from before it landed.
 * - A day the server says is complete, from a server too old to send the
 *   field, with no local anchor: frozen now from its answers, once, so that
 *   no later edit can move it.
 * - Anything that is not an instant (`null` in JSON) counts as absent.
 */
export function reconcileAnchors(
  local: Record<number, unknown> | undefined,
  server: Record<number, unknown> | undefined,
  completedDays: number[],
  stepAnswers: Record<number, DayStepAnswers>,
): Record<number, number> {
  const out = { ...instants(local), ...instants(server) };
  for (const day of completedDays) {
    if (isInstant(out[day])) continue;
    const legacy = dayFinishedAt(stepAnswers[day]);
    if (legacy !== null) out[day] = legacy;
  }
  return out;
}
