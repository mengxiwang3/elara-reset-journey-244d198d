/**
 * The offline step queue's flush, as a pure function of its inputs.
 *
 * `useAppStore.flushSteps` used to own this loop inline, where no test could
 * reach it (the store imports React Native), and it had holes:
 *
 * - **Two flushes at once sent every answer twice.** SessionSync flushes on
 *   launch and on every return to the foreground, and `useSavingPlace` flushes
 *   when an entry goes stale; nothing stopped them overlapping. A flush also
 *   re-sent an answer whose own live request was still in flight.
 * - **One landed answer could take another with it.** An entry was removed by
 *   `queuedAt` alone, and `queuedAt` is `Date.now()`: a lead card answered with
 *   nothing and the step under it are queued in the same tick, as are a day's
 *   hidden follow-ups, so they share it. The first to land removed both, and
 *   the second answer was never sent.
 *
 * Takes the queue and the side effects as parameters so it runs in Node
 * (`stepQueue.test.ts`). Nothing here imports the app.
 */

export interface QueueEntry {
  area: string;
  day: number;
  body: { stepId: string };
  queuedAt: number;
  /** The account that wrote it; absent on entries from older builds. */
  owner?: string;
}

/**
 * Whether the signed-in account may send an entry. Its own entries, and
 * entries with no owner (queued by an older build) when they sit in a store
 * that belongs to her (`fallbackOwner`: the store's account, or the Atlas
 * cache's). Nobody signed in sends nothing. Another account's entries are
 * never sent and never removed by this account's flush: they are not hers to
 * drop either.
 */
export function belongsTo(owner: string | undefined, fallbackOwner: string | null, userId: string | null): boolean {
  if (!userId) return false;
  return (owner ?? fallbackOwner) === userId;
}

/** The parts of `ApiError` the decision reads (duck-typed: `lib/api` imports React Native). */
interface ErrorLike {
  status?: unknown;
  code?: unknown;
}

/**
 * What a failed send means for the entry and for the rest of the pass.
 *
 * - `stop`: the network, a 5xx, a rate limit, an expired session. Keep it and
 *   end the pass; the next flush tries again.
 * - `keep`: a day that has not opened on the server's clock yet (`day_locked`).
 *   It will, so it stays, and so do the later days of that Area behind it.
 *   The rest of the queue goes on: an earlier day's answer queued after it
 *   (an edit re-queues at the end) may be exactly what that day is waiting
 *   for, and stopping here held it back for good.
 * - `retry`: a step the server does not know yet (`step_not_found`). The
 *   paths ship in the app and are also edited in the CMS, so the phone can be
 *   a release ahead of the server's content (or the other way round) for a
 *   while. Her answer is kept and the rest of the queue goes on; nothing is
 *   held back behind it. Only once it has waited `STEP_NOT_FOUND_GRACE_MS`
 *   is it given up, so a step that really was removed cannot sit in the
 *   queue for ever.
 * - `drop`: refused for good (a week that has since locked, a day that no
 *   longer exists, a shape the step does not take). Retrying would block the
 *   queue behind it forever.
 */
export type FlushDecision = "stop" | "keep" | "retry" | "drop";

/** How long an answer to a step the server does not know is kept and retried. */
export const STEP_NOT_FOUND_GRACE_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * `entry` and `now` only matter for `step_not_found`: without an entry it is
 * always retried (the live request's own failure, whose entry stays queued).
 */
export function decideFailure(err: unknown, entry?: Pick<QueueEntry, "queuedAt">, now = Date.now()): FlushDecision {
  const e = (err && typeof err === "object" ? err : {}) as ErrorLike;
  if (e.code === "day_locked") return "keep";
  if (e.code === "step_not_found") {
    return entry && now - entry.queuedAt > STEP_NOT_FOUND_GRACE_MS ? "drop" : "retry";
  }
  const status = typeof e.status === "number" ? e.status : 0;
  return [400, 403, 404, 422].includes(status) ? "drop" : "stop";
}

/** The same write: same step, same moment. `queuedAt` alone is not unique. */
export function sameEntry(a: QueueEntry, b: QueueEntry): boolean {
  return a.queuedAt === b.queuedAt && a.area === b.area && a.day === b.day && a.body.stepId === b.body.stepId;
}

export interface FlushDeps<E extends QueueEntry> {
  /** The queue as it is now. */
  read: () => E[];
  /** Send one entry (as a replay); rejects on failure. */
  send: (entry: E) => Promise<unknown>;
  /** Take exactly this entry out of the queue. */
  remove: (entry: E) => void;
  /** True while this entry's own live request has not settled: that request owns it. */
  inFlight?: (entry: E) => boolean;
  /**
   * False for an entry the signed-in account must not send (`belongsTo`).
   * Asked at the moment of sending, not when the pass began: a session can
   * change during a pass, and the entries read at its start are a snapshot.
   */
  sendable?: (entry: E) => boolean;
  /** What the server answered for an entry that landed (before it is removed). */
  onLanded?: (entry: E, result: unknown) => void;
  /**
   * An entry the server refused for good (`drop`), before it is removed: the
   * last moment her words for it exist anywhere but this call. Dropping it
   * used to lose them silently; the store keeps them (`keptAnswer`).
   */
  onDropped?: (entry: E, err: unknown) => void;
}

/**
 * The fixed support card in a step response, if the server returned one.
 *
 * A queued answer is screened when it lands. When its words match the safety
 * list the response carries the same card a live answer gets, and the flush
 * used to discard it: she never saw the helpline and the Path went on.
 */
export function safetyCardOf<C = unknown>(result: unknown): C | null {
  if (!result || typeof result !== "object") return null;
  const card = (result as { safety?: unknown }).safety;
  return card && typeof card === "object" ? (card as C) : null;
}

/** One pass over the queue, oldest first. */
export async function flushQueueOnce<E extends QueueEntry>(deps: FlushDeps<E>): Promise<void> {
  // Area -> the first day the server said has not opened. Later days of the
  // same Area cannot have opened either, so they are not sent this pass.
  const lockedFrom = new Map<string, number>();
  for (const entry of deps.read()) {
    // The pass walks a snapshot. An entry a newer edit of the same step has
    // replaced since (`sendStep` swaps it out) must not be sent after that
    // edit: it would land last and put her old answer back.
    if (!deps.read().some((q) => sameEntry(q, entry))) continue;
    if (deps.inFlight?.(entry)) continue;
    if (deps.sendable && !deps.sendable(entry)) continue;
    const locked = lockedFrom.get(entry.area);
    if (locked !== undefined && entry.day >= locked) continue;
    try {
      const result = await deps.send(entry);
      deps.onLanded?.(entry, result);
    } catch (err) {
      const decision = decideFailure(err, entry);
      if (decision === "stop") return;
      if (decision === "retry") continue;
      if (decision === "keep") {
        lockedFrom.set(entry.area, Math.min(locked ?? entry.day, entry.day));
        continue;
      }
      deps.onDropped?.(entry, err);
    }
    deps.remove(entry);
  }
}

/** The key `inFlight` is tracked by: one write of one step. */
export function entryKey(e: QueueEntry): string {
  return `${e.area}:${e.day}:${e.body.stepId}:${e.queuedAt}`;
}

/**
 * A flush that never runs twice at once: a caller that arrives while a pass is
 * running shares that pass instead of sending every answer a second time.
 */
export function singleFlight(run: () => Promise<void>): () => Promise<void> {
  let current: Promise<void> | null = null;
  return () => {
    if (current) return current;
    current = run().finally(() => {
      current = null;
    });
    return current;
  };
}
