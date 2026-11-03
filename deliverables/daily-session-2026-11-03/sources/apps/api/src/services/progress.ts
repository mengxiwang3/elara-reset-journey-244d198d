import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import {
  allStepsAnswered,
  ANSWER_STATES,
  answerRecord,
  DEFAULT_LOCALE,
  hasStateAnswer,
  headlineValue,
  holdsHerAnswer,
  isBreathe,
  isInstant,
  isDrawn,
  isPhoto,
  offersState,
  OPTIONAL_ANSWER_STATES,
  resonanceOf,
  stateOf,
  stepsOf,
  unofferedSteps,
  validateStepValue,
  weekIsFree,
  weekOf,
  type AnswerState,
  type AreaKey,
  type DayUnlockRule,
  type DayKind,
  type DayStep,
  type DayStepAnswers,
  type DayValue,
  type EligibleSource,
  type Locale,
  type PathDayDTO,
  type ProgressDTO,
  type ReflectMode,
} from "@elara/shared";
import type { Db } from "../db";
import { analyticsEvent, dayResponse, onboarding, user, userPath } from "../db/schema";
import { authoredPath } from "./content";
import { getContentVersion } from "./contentVersion";
import { newId } from "../lib/ids";
import { assertBetaAreaOpen } from "../lib/betaAccess";
import { badRequest, forbidden, notFound } from "../lib/errors";
import { isPremium } from "../middleware/entitlement";
import type { RecordEventInput } from "./analytics";
import {
  completionEvents,
  earnedSource,
  eventInsert,
  signalInsert,
  stepEvent,
  stepEventKey,
  type DayProgressFacts,
} from "./gamification";
import { recordSignal, type RecordSignalInput } from "./signals";
import { afterCredit, claimedLocalDate, creditEligibleDay, creditStatement } from "./eligibleDays";
import { recordEvent } from "./analytics";
import { localStamp, localToday, zoneFor } from "./time";

type UserPathRow = typeof userPath.$inferSelect;
type Stmt = BatchItem<"sqlite">;
type Defer = (work: Promise<unknown>) => void;

/** Options of the write paths beyond their inputs. */
export interface ProgressWriteOptions {
  /**
   * Where analytics-only follow-up work goes (the route's `waitUntil`): the
   * day/path completion events, the path's `completed` signal and a first
   * action's streak event. Absent, it is awaited before returning.
   */
  defer?: Defer;
}

async function toProgressDTO(db: Db, up: UserPathRow): Promise<ProgressDTO> {
  const rows = await db
    .select()
    .from(dayResponse)
    .where(eq(dayResponse.userPathId, up.id))
    .orderBy(asc(dayResponse.day))
    .all();
  return progressFrom(up, rows);
}

type DayResponseRow = typeof dayResponse.$inferSelect;

/** The DTO from rows already read (ordered by day). */
function progressFrom(up: UserPathRow, rows: DayResponseRow[]): ProgressDTO {
  const completedDays = rows.filter((r) => r.completedAt).map((r) => r.day);
  const responses: Record<number, DayValue> = {};
  const stepAnswers: Record<number, DayStepAnswers> = {};
  const dayCompletedAt: Record<number, number> = {};
  for (const r of rows) {
    if (r.value != null) responses[r.day] = r.value;
    if (r.stepAnswers) stepAnswers[r.day] = r.stepAnswers;
    // Only a real instant: an unreadable stored time would reach JSON as
    // `null`, and an older reader takes a present key at its word.
    const closedAt = r.completedAt?.getTime();
    if (isInstant(closedAt)) dayCompletedAt[r.day] = closedAt;
  }
  return {
    area: up.area as AreaKey,
    currentDay: up.currentDay,
    completedDays,
    responses,
    stepAnswers,
    dayCompletedAt,
    startedAt: up.startedAt.getTime(),
    completedAt: up.completedAt ? up.completedAt.getTime() : null,
  };
}

/**
 * Get-or-create the user's path row for an area.
 *
 * `knownAbsent`: the caller has just read that there is no row
 * (`loadDayState`), so the insert goes first and returns the row; a path a
 * concurrent request created in between is then read as before.
 */
export async function ensurePath(
  db: Db,
  userId: string,
  area: AreaKey,
  knownAbsent = false,
): Promise<UserPathRow> {
  const read = () =>
    db
      .select()
      .from(userPath)
      .where(and(eq(userPath.userId, userId), eq(userPath.area, area)))
      .get();
  if (!knownAbsent) {
    const existing = await read();
    if (existing) return existing;
  }
  const [created] = await db
    .insert(userPath)
    .values({ id: newId(), userId, area, currentDay: 1 })
    .onConflictDoNothing()
    .returning();
  const row = created ?? (await read());
  if (!row) throw notFound("Path could not be created", "path_create_failed");
  // Logged here rather than in `startPath` so the signal marks the moment the
  // path actually came into existence, whichever door the member came through
  // — the Journeys screen, finishing onboarding, or answering day 1 directly.
  // Logged by whichever request did come through: a concurrent one that found
  // the row already there logs it too, as the read-first version did.
  await recordSignal(db, { userId, source: "path_day", kind: "started", payload: { area } });
  return row;
}

/**
 * Every path she has, with every stored answer: ONE joined read (it was one
 * read per path). Ordered by area, the order the unique `(user_id, area)`
 * index already returned them in.
 */
export async function listMyPaths(db: Db, userId: string): Promise<ProgressDTO[]> {
  const rows = await db
    .select({ p: userPath, d: dayResponse })
    .from(userPath)
    .leftJoin(dayResponse, eq(dayResponse.userPathId, userPath.id))
    .where(eq(userPath.userId, userId))
    .orderBy(asc(userPath.area), asc(dayResponse.day))
    .all();
  const byPath = new Map<string, { up: UserPathRow; days: DayResponseRow[] }>();
  for (const r of rows) {
    const held = byPath.get(r.p.id) ?? { up: r.p, days: [] };
    if (r.d) held.days.push(r.d);
    byPath.set(r.p.id, held);
  }
  return [...byPath.values()].map(({ up, days }) => progressFrom(up, days));
}

export async function startPath(db: Db, userId: string, area: AreaKey): Promise<ProgressDTO> {
  const up = await ensurePath(db, userId, area);
  return toProgressDTO(db, up);
}

export async function saveDay(
  db: Db,
  userId: string,
  area: AreaKey,
  day: number,
  input: { value?: DayValue; complete?: boolean },
  locale: Locale = DEFAULT_LOCALE,
  /** T2/T3 from the safety screen: the words are not stored and become no signal. */
  safetyTier?: 2 | 3,
  /** Already read by the caller (`loadDayState`); read here when absent. */
  pre?: DayState,
  opts: ProgressWriteOptions = {},
): Promise<ProgressDTO> {
  const state = pre ?? (await loadDayState(db, userId, area, day));
  // One wave: the authored path (usually this isolate's copy at the version
  // just read) and, for a first answer, her path row.
  const [authoredFull, up] = await Promise.all([
    authoredPath(db, area, locale, state.contentVersion),
    state.path ?? ensurePath(db, userId, area, true),
  ]);
  const zone = await zoneOf(db, userId, state);
  // The legacy whole-day route (builds before steps). The client's `complete`
  // is a request, not the rule: a day with authored steps closes only when
  // every step has its answer (`allStepsAnswered`), exactly as in `saveStep`.
  // Only a day with no steps of its own (one synthetic step, `LEGACY_STEP_ID`)
  // is answered whole by this route, so there the client still decides.
  const authored = authoredFull.days.find((d) => d.day === day);
  if (!authored) throw notFound("Day not found", "day_not_found");
  const steps = stepsOf(authored);
  const wholeDay = !authored.steps?.length;
  // A flagged answer is never kept where the guide's context reads it, and never
  // becomes a signal (safety spec §03). The flag holds her words.
  const value = safetyTier ? null : (input.value ?? null);

  // Insert or keep: a value is written only when one was sent, so an older
  // build's bare "complete" never wipes the headline the step route wrote.
  // RETURNING is the row as it now stands: no read-back.
  const [row] = await db
    .insert(dayResponse)
    .values({ id: newId(), userPathId: up.id, day, value })
    .onConflictDoUpdate({
      target: [dayResponse.userPathId, dayResponse.day],
      set: { value: input.value !== undefined && !safetyTier ? value : sql`${dayResponse.value}` },
    })
    .returning({ stepAnswers: dayResponse.stepAnswers, completedAt: dayResponse.completedAt });
  const complete =
    (input.complete ?? true) && (wholeDay || allStepsAnswered(steps, row?.stepAnswers ?? {}));

  // `completedAt` is sticky (re-saving a finished day keeps the moment it first
  // closed), and closing is one conditional UPDATE, as in `saveStep`: of two
  // concurrent saves exactly one closes the day and earns its rhythm.
  const willClose = complete && !row?.completedAt;
  const dayWrites: Stmt[] = [];
  if (willClose) {
    const at = new Date();
    dayWrites.push(
      db
        .update(dayResponse)
        .set({ completedAt: at, completedOn: localToday(zone, at) })
        .where(and(eq(dayResponse.userPathId, up.id), eq(dayResponse.day, day), isNull(dayResponse.completedAt)))
        .returning({ id: dayResponse.id }),
    );
  }

  // `day_response` is upserted, so re-answering a day destroys what was there
  // before — and on a reflection day that is exactly the change worth seeing.
  // The signal carries the answer itself, plus the day's authored title and
  // kind (in the language she is served), which are CMS-mutable and so are
  // captured as they read *today*.
  const signals: RecordSignalInput[] = safetyTier
    ? []
    : [
        {
          userId,
          source: "path_day",
          // A day with no value that is nonetheless complete is an `info` or `action`
          // day being acknowledged. An incomplete save is a draft — the member wrote
          // something and did not submit it, which is still them answering.
          kind: value == null && complete ? "completed" : "answered",
          refId: up.id,
          payload: { area, day, value, title: authored.title, kind: authored.kind as DayKind | undefined },
        },
      ];

  const facts = { userId, area, day, pathId: up.id, timezone: zone, pathTotal: authoredFull.total };
  const committed = await commitDay(db, {
    ...facts,
    up,
    dayWrites,
    closeAt: willClose ? 0 : undefined,
    signals,
    // No step: only a close (or the path's) earns the day.
    credit: willClose ? { source: "day", localDate: claimedLocalDate(undefined, localToday(zone)) } : undefined,
  });
  await followUp(db, {
    ...facts,
    up,
    committed,
    credited: willClose,
    pathSignal: true,
    defer: opts.defer,
  });
  return committed.progress;
}

/**
 * Recompute `currentDay` and whole-path completion from the response rows, as
 * ONE statement for the write batch (RETURNING the path as written).
 *
 * Shared by `saveDay`, `saveStep` and `declineDay` rather than duplicated: they
 * write different things but must agree exactly on what "where are they now"
 * means. Reads only `day` and `completed_at`, inside SQLite.
 *
 * `currentDay` = min(last completed day + 1, total + 1); the path is complete
 * when at least `total` days are; `completed_at` keeps the moment it first
 * completed (whole seconds, as the column stores it) and is cleared otherwise.
 */
function recomputeStatement(db: Db, pathId: string, total: number) {
  const nowSec = Math.floor(Date.now() / 1000);
  return db
    .update(userPath)
    .set({
      currentDay: sql`min(coalesce((select max(dr.day) from day_response dr where dr.user_path_id = ${pathId} and dr.completed_at is not null), 0) + 1, ${total + 1})`,
      completedAt: sql`case when (select count(*) from day_response dr where dr.user_path_id = ${pathId} and dr.completed_at is not null) >= ${total} then coalesce(completed_at, ${nowSec}) else null end`,
    })
    .where(eq(userPath.id, pathId))
    .returning();
}

interface DayCommit {
  userId: string;
  area: AreaKey;
  day: number;
  pathId: string;
  up: UserPathRow;
  timezone: string | null;
  pathTotal: number;
  /** Writes to this day's row, in order, before the path is recomputed. */
  dayWrites: Stmt[];
  /** Index in `dayWrites` of the conditional close (RETURNING id), if any. */
  closeAt?: number;
  signals?: RecordSignalInput[];
  /** The rhythm credit, decided before the batch (see `followUp` for the rest). */
  credit?: { source: EligibleSource; localDate: string };
  /** `gamification_step_completed`, keyed (`stepEventKey`). */
  stepEvent?: RecordEventInput | null;
}

interface DayCommitted {
  closedNow: boolean;
  allDone: boolean;
  pathCompleted: boolean;
  progress: ProgressDTO;
  rows: DayResponseRow[];
  /** The credit statement's result, when it ran in the batch. */
  credit?: { at: Date; date: string; actions: number | undefined; source: string };
}

/**
 * Everything one write does after its answer has landed, in ONE `db.batch`
 * (one round trip, all or nothing, in order): the day's own writes (marks,
 * the conditional close, the headline), the path recompute, the signals, the
 * rhythm credit, the step event, and a final read of the path's rows for the
 * progress DTO.
 *
 * The signals, the credit and the event never failed a write before the batch
 * (`recordSignal` / `recordEvent` / `creditEligibleDay` swallow their errors).
 * So if the batch fails, the day's writes and the recompute are run again on
 * their own (and that failure is the write's), and the rest follows one at a
 * time, best effort, as it did before.
 */
async function commitDay(db: Db, c: DayCommit): Promise<DayCommitted> {
  const zone = c.timezone;
  const recompute = recomputeStatement(db, c.up.id, c.pathTotal);
  const finalRead = db
    .select()
    .from(dayResponse)
    .where(eq(dayResponse.userPathId, c.up.id))
    .orderBy(asc(dayResponse.day));
  const credit = c.credit
    ? creditStatement(db, {
        userId: c.userId,
        // The path is completed by this write exactly when the recompute
        // (earlier in the same batch) has just set `completed_at`.
        source: c.up.completedAt
          ? c.credit.source
          : sql`case when (select up.completed_at from user_path up where up.id = ${c.up.id}) is not null then 'path' else ${c.credit.source} end`,
        timezone: zone,
        surface: "practice",
        localDate: c.credit.localDate,
      })
    : null;
  const signals = c.signals ?? [];
  const critical: Stmt[] = [...c.dayWrites, recompute];
  const extras: Stmt[] = [
    ...signals.map((s) => signalInsert(db, { ...s, timezone: zone })),
    ...(credit ? [credit.query] : []),
    ...(c.stepEvent ? [eventInsert(db, { ...c.stepEvent, timezone: zone })] : []),
  ];

  let out: unknown[];
  let extrasLanded = true;
  try {
    out = (await db.batch([...critical, ...extras, finalRead as Stmt] as unknown as [Stmt, ...Stmt[]])) as unknown[];
  } catch (err) {
    console.error(JSON.stringify({ event: "progress_batch_failed", error: String(err).slice(0, 200) }));
    out = (await db.batch([...critical, finalRead as Stmt] as unknown as [Stmt, ...Stmt[]])) as unknown[];
    extrasLanded = false;
  }

  const closedNow = c.closeAt !== undefined && (out[c.closeAt] as unknown[]).length > 0;
  const upAfter = (out[c.dayWrites.length] as UserPathRow[])[0] ?? c.up;
  const rows = out[out.length - 1] as DayResponseRow[];
  const allDone = upAfter.completedAt != null;
  const pathCompleted = allDone && !c.up.completedAt;

  let credited: DayCommitted["credit"];
  if (extrasLanded && credit) {
    const r = (out[critical.length + signals.length] as { actions: number; source: string }[])[0];
    credited = { at: credit.at, date: credit.date, actions: r?.actions, source: r?.source ?? c.credit!.source };
  } else if (!extrasLanded) {
    for (const s of signals) await recordSignal(db, { ...s, timezone: zone });
    if (c.credit) {
      await creditEligibleDay(db, {
        userId: c.userId,
        source: pathCompleted ? "path" : c.credit.source,
        timezone: zone,
        surface: "practice",
        localDate: c.credit.localDate,
      });
    }
    if (c.stepEvent) await recordEvent(db, { ...c.stepEvent, timezone: zone });
  }

  return {
    closedNow,
    allDone,
    pathCompleted,
    rows,
    progress: progressFrom(upAfter, rows),
    credit: credited,
  };
}

/**
 * What a write learns only from its batch: did it close the day, did it
 * complete the path, was it the day's first action. The day/path completion
 * events, the path's `completed` signal and a first action's streak event are
 * analytics and the memory log, which nothing in the response reads, so they
 * go to `defer` (the route's `waitUntil`) when given.
 *
 * A credit the batch did not carry because it was not predictable (an auto
 * step that turned out to close the day, a path completed by a re-save) is
 * made here, awaited.
 */
async function followUp(
  db: Db,
  f: Omit<DayProgressFacts, "dayCompleted" | "pathCompleted"> & {
    up: UserPathRow;
    committed: DayCommitted;
    /** A credit was in the batch. */
    credited: boolean;
    /** Record the path's `completed` signal (not for a declined day). */
    pathSignal: boolean;
    defer?: Defer;
  },
): Promise<void> {
  const { committed } = f;
  const facts: DayProgressFacts = { ...f, dayCompleted: committed.closedNow, pathCompleted: committed.pathCompleted };
  const zone = f.timezone ?? null;

  const earned = earnedSource(facts);
  if (earned && !f.credited) {
    await creditEligibleDay(db, {
      userId: f.userId,
      source: earned,
      timezone: zone,
      surface: "practice",
      localDate: claimedLocalDate(f.claimedLocalDate, localToday(zone)),
      defer: f.defer,
    });
  }

  const later: Promise<unknown>[] = [];
  if (committed.credit) {
    later.push(
      afterCredit(
        db,
        { userId: f.userId, source: committed.credit.source, timezone: zone, surface: "practice" },
        committed.credit,
        f.defer,
      ),
    );
  }
  const inserts: Stmt[] = [];
  if (committed.pathCompleted && f.pathSignal) {
    inserts.push(
      signalInsert(db, {
        userId: f.userId,
        source: "path_day",
        kind: "completed",
        refId: f.pathId,
        payload: { area: f.area },
        timezone: zone,
      }),
    );
  }
  for (const e of completionEvents(facts)) inserts.push(eventInsert(db, { ...e, timezone: zone }));
  if (inserts.length) {
    const work = db.batch(inserts as [Stmt, ...Stmt[]]).catch((err) => {
      console.error(JSON.stringify({ event: "progress_followup_failed", error: String(err).slice(0, 200) }));
    });
    if (f.defer) f.defer(work);
    else later.push(work);
  }
  await Promise.all(later);
}

/** Her zone: read with the day state when it was, else looked up. */
async function zoneOf(db: Db, userId: string, state: DayState): Promise<string | null> {
  return state.zone !== undefined ? state.zone : zoneFor(db, userId);
}

/** The authored step being answered, and the rest of its day. */
function stepContext(
  days: PathDayDTO[],
  day: number,
  stepId: string,
): { steps: DayStep[]; step: DayStep; dayTitle: string; purpose?: string } {
  const authored = days.find((d) => d.day === day);
  if (!authored) throw notFound("Day not found", "day_not_found");
  const steps = stepsOf(authored);
  const step = steps.find((s) => s.id === stepId);
  // An id the day does not have is a client that is out of date with the CMS —
  // an answer written against a question that no longer exists. Refused rather
  // than stored under an orphan key nothing will ever read.
  //
  // Contract: `404 step_not_found` is stable. The app's offline queue keeps an
  // answer refused with it (rather than dropping her words), so neither the
  // status nor the code may change without the client changing with it.
  if (!step) throw notFound("Step not found", "step_not_found");
  const purpose = authored.config?.purpose?.trim();
  return { steps, step, dayTitle: authored.title, ...(purpose ? { purpose } : {}) };
}

export interface SaveStepResult {
  progress: ProgressDTO;
  /**
   * Nothing was written: an empty answer made for her (`auto`) reached a step
   * of a day she declined. There is nothing to reply to and nothing to keep.
   */
  ignored?: boolean;
  /** The step as authored — what Elara is about to be asked to respond to. */
  step: DayStep;
  answers: DayStepAnswers;
  /** True when this answer was the one that finished the day. */
  dayCompleted: boolean;
  /** Every step of the day, as authored: where this one sits, for the reply. */
  steps: DayStep[];
  /** The day's authored title. */
  dayTitle: string;
  /** Why today matters (`DayConfig.purpose`), when the day says: the step reply is told it. */
  purpose?: string;
  /** Her `user_path` id, so the reply can be stored without looking it up again. */
  pathId: string;
}

/**
 * Her path row and the day's (and the day before's) answers, in one read:
 * what the step route's gates and `saveStep` would otherwise each look up.
 * In the same wave: her zone and the `'paths'` content version, so the
 * authored path validating the answer comes from this isolate's copy when
 * nothing has been published since (`authoredPath`).
 */
export interface DayState {
  path: UserPathRow | null;
  rows: DayResponseRow[];
  /** Her zone (`zoneFor`), when read with the state. */
  zone?: string | null;
  /** The `'paths'` content version, when read with the state. */
  contentVersion?: number;
}

export async function loadDayState(db: Db, userId: string, area: AreaKey, day: number): Promise<DayState> {
  const [rows, zone, contentVersion] = await Promise.all([
    db
      .select({ p: userPath, d: dayResponse })
      .from(userPath)
      .leftJoin(
        dayResponse,
        and(eq(dayResponse.userPathId, userPath.id), inArray(dayResponse.day, [day - 1, day])),
      )
      .where(and(eq(userPath.userId, userId), eq(userPath.area, area)))
      .all(),
    zoneFor(db, userId),
    getContentVersion(db, "paths"),
  ]);
  if (!rows.length) return { path: null, rows: [], zone, contentVersion };
  return { path: rows[0]!.p, rows: rows.flatMap((r) => (r.d ? [r.d] : [])), zone, contentVersion };
}

/**
 * These exact words are already stored for this step, i.e. they came through
 * the step route once and were screened (and, for T1 to T3, recorded) then.
 * Used to keep a replay of an answer that did land from flagging it twice,
 * while words the server has never stored are screened and recorded in full.
 *
 * Any stored copy counts, marked or not: unmarked words were T0 or T1 when
 * they landed, and a T1 was logged then.
 */
export async function alreadyScreened(
  db: Db,
  userId: string,
  area: AreaKey,
  day: number,
  stepId: string,
  value: DayValue | undefined,
  state?: DayState,
): Promise<boolean> {
  const { rows } = state ?? (await loadDayState(db, userId, area, day));
  const row = rows.find((r) => r.day === day);
  const stored = row?.stepAnswers?.[stepId];
  return !!stored && JSON.stringify(stored.value ?? null) === JSON.stringify(value ?? null);
}

/**
 * Answer one step of a day.
 *
 * The day is marked complete when **every** step has an answer — computed here
 * from the authored steps, never taken from the client. A client that miscounts
 * the steps, or an older build that does not know about them, must not be able
 * to close a three-step day having answered one; slowing that rush down is the
 * entire point of steps existing.
 *
 * `value` is also folded into `day_response.value` as the day's headline answer
 * so the guide's context block, the signal log and the memory tiers keep
 * reading one column and never learn what a step is. See `headlineValue()`.
 *
 * Round trips, given the caller's `loadDayState`: the answer's upsert
 * (RETURNING the merged row), then one batch (`commitDay`). The authored path
 * is this isolate's copy unless something was published since.
 */
export async function saveStep(
  db: Db,
  userId: string,
  area: AreaKey,
  day: number,
  input: {
    stepId: string;
    value?: DayValue;
    /** Absent means `answered`. Anything else is the answer and carries no value. */
    state?: AnswerState;
    mode?: ReflectMode;
    auto?: boolean;
    /** Her local date when she answered — see `saveStepInput.localDate`. */
    localDate?: string;
  },
  locale: Locale = DEFAULT_LOCALE,
  /** T2/T3 from the safety screen: store the answer marked, record no signal. */
  safetyTier?: 2 | 3,
  /** Already read by the caller (`loadDayState`); read here when absent. */
  pre?: DayState,
  opts: ProgressWriteOptions = {},
): Promise<SaveStepResult> {
  const dayState = pre ?? (await loadDayState(db, userId, area, day));
  // One wave: the authored path (usually cached) and her zone, both usually
  // already in hand, and (for a first answer) her path row.
  const [authoredFull, zone] = await Promise.all([
    authoredPath(db, area, locale, dayState.contentVersion),
    zoneOf(db, userId, dayState),
  ]);
  const { steps, step, dayTitle, purpose } = stepContext(authoredFull.days, day, input.stepId);
  const up = dayState.path ?? (await ensurePath(db, userId, area, true));
  // A state other than `answered` IS the answer, so it is only accepted where
  // the step offered it: otherwise "skipped" would close any day. The value is
  // dropped, not refused — a build that sent both meant the state.
  const state: AnswerState = input.state ?? "answered";
  if (!offersState(step, state)) {
    throw badRequest("This step does not offer that answer", "step_state_not_offered");
  }
  const stated = state !== "answered";
  const value: DayValue = stated ? null : (input.value ?? null);
  // The shape has to be one this step could have produced — a drawing on a
  // reflection, a sort on a sort step. Lenient for the original kinds (see
  // `validateStepValue`); this only refuses what no build of the app writes.
  if (!validateStepValue(step, value)) {
    throw badRequest("That answer doesn't fit this step", "step_value_mismatch");
  }

  const existing = dayState.path ? dayState.rows.find((r) => r.day === day) : undefined;

  // An empty answer the app made for her (`auto`: a lead card passed by, a
  // follow-up with nothing to ask) is not hers to set against a decline. One
  // that lands after the day was declined (the queue flushing late) changes
  // nothing: the step stays `declined`, and there is no signal and no reply.
  const filler = !!input.auto && !stated && value == null;
  const ignored = (): Promise<SaveStepResult> =>
    toProgressDTO(db, up).then((progress) => ({
      progress,
      step,
      answers: existing?.stepAnswers ?? {},
      dayCompleted: false,
      ignored: true,
      steps,
      dayTitle,
      pathId: up.id,
    }));
  if (filler && stateOf(existing?.stepAnswers?.[input.stepId]) === "declined") return ignored();

  // Her own calendar day for this answer: the date she sent (an answer written
  // offline on Tuesday and flushed on Thursday is Tuesday's), clamped the way
  // the rhythm clamps it, and otherwise today in her zone. Stored with the
  // answer so a record prints the date she wrote it, whatever her stored
  // zone says later.
  const answeredOn = claimedLocalDate(input.localDate, localToday(zone));
  const answers: DayStepAnswers = { ...(existing?.stepAnswers ?? {}) };
  // Elara's previous reply to this step is deliberately dropped when the answer
  // changes: a reply to words the member has since rewritten is worse than no
  // reply at all, and the caller regenerates one immediately.
  answers[input.stepId] = {
    ...answerRecord(state, value),
    answeredAt: Date.now(),
    answeredOn,
    ...(input.mode ? { mode: input.mode } : {}),
    ...(safetyTier ? { safety: safetyTier } : {}),
  };
  // A resonance check rates the line quoted above it: her pick is kept as
  // feedback on *that* reply (Interaction States spec §2), where whoever
  // reads replies later finds it, rather than only as an answer of its own.
  const resonance = stated ? null : resonanceOf(step, value);
  const rated = resonance ? step.config?.noticedFrom : undefined;
  if (resonance && rated && answers[rated]) {
    answers[rated] = { ...answers[rated], resonance };
  }

  // A step is credited once. A state stored where an answer was (she moved
  // between "Yes" and "I'm not sure") is not a fresh step: only the answer
  // that replaces a state no answer of hers ever preceded is a first one.
  // Whether it already was is read in the same wave as the upsert.
  const prior = existing?.stepAnswers?.[input.stepId];
  const credits = !input.auto && !stated;
  const askCredited = !!prior && credits && hasStateAnswer(prior);

  // Only the keys this request changed are merged in, inside SQLite, so two
  // saves for the same day (a skipped lead card saved beside the step she
  // answered, a quiet step saving in the background) cannot overwrite each
  // other. Writing the whole map back lost the first answer, the day never
  // closed, and the next day stayed `day_locked` for good.
  const changed: DayStepAnswers = { [input.stepId]: answers[input.stepId]! };
  if (resonance && rated && answers[rated]) changed[rated] = answers[rated];
  const rowId = existing?.id ?? newId();
  const [upserted, alreadyCredited] = await Promise.all([
    db
      .insert(dayResponse)
      .values({ id: rowId, userPathId: up.id, day, stepAnswers: changed })
      .onConflictDoUpdate({
        target: [dayResponse.userPathId, dayResponse.day],
        set: { stepAnswers: mergeStepAnswers(changed) },
        // The same rule as above, inside the write: a decline that landed since
        // the read keeps its step.
        ...(filler
          ? { setWhere: sql`coalesce(json_extract(${dayResponse.stepAnswers}, ${`${jsonKey(input.stepId)}.state`}), '') != 'declined'` }
          : {}),
      })
      // The row as it now stands, including any answer a concurrent request
      // merged in: completion and the headline are derived from it.
      .returning(),
    askCredited ? stepCredited(db, userId, up.id, day, input.stepId) : Promise.resolve(false),
  ]);
  const row = upserted[0];
  // The filler's guard refused the write (a decline landed since the read):
  // nothing was written, exactly as when the read-back found it declined.
  if (!row) return ignored();
  const merged: DayStepAnswers = row.stepAnswers ?? answers;
  if (filler && stateOf(merged[input.stepId]) === "declined") return ignored();
  const complete = allStepsAnswered(steps, merged);

  const dayWrites: Stmt[] = [];
  // A step the day never asked (its `when` was false) and that holds nothing
  // is recorded as such when the day is complete, so a later recall reads
  // "not asked". Worked out here from what is stored, never from a list the
  // client says it saw. A step that already holds something is left exactly
  // as it is: an answer to a question she is no longer asked (she said "No",
  // explained why, then changed it to "Yes") is hers, and changing her mind
  // back must find it again. While its step is not offered it neither counts
  // nor shows (`offeredSteps`, `offeredAnswers`); it is never overwritten.
  if (complete) {
    const marks: DayStepAnswers = {};
    for (const s of unofferedSteps(steps, merged)) {
      if (merged[s.id]) continue;
      marks[s.id] = { ...answerRecord("notOffered", null), answeredAt: Date.now(), answeredOn };
    }
    if (Object.keys(marks).length) {
      // `json_insert`: a mark lands only on a key that is still empty, so an
      // answer a concurrent save wrote to that step since the read survives.
      dayWrites.push(
        db
          .update(dayResponse)
          .set({ stepAnswers: mergeStepAnswers(marks, "json_insert") })
          .where(eq(dayResponse.id, row.id)),
      );
      for (const [id, mark] of Object.entries(marks)) merged[id] ??= mark;
    }
  }
  const headline = headlineValue(steps, merged);
  // `completedAt` is sticky: re-answering a step of a finished day must not
  // re-open it and send the member backwards through their own week. Closing
  // is conditional on it still being open, so exactly one request closes the
  // day (and its date is the calendar day of the answer that closed it). The
  // headline is written either way (the close writes it too).
  let closeAt: number | undefined;
  if (complete) {
    closeAt = dayWrites.length;
    dayWrites.push(
      db
        .update(dayResponse)
        .set({ value: headline, completedAt: new Date(), completedOn: answeredOn })
        .where(and(eq(dayResponse.userPathId, up.id), eq(dayResponse.day, day), isNull(dayResponse.completedAt)))
        .returning({ id: dayResponse.id }),
    );
  }
  dayWrites.push(
    db
      .update(dayResponse)
      .set({ value: headline })
      .where(and(eq(dayResponse.userPathId, up.id), eq(dayResponse.day, day))),
  );

  // One signal per step, not one per day. A step carries its own question and
  // its own answer, which is strictly more than the day-level signal could say
  // — and the annotator only pays for the ones that actually carry text.
  // A flagged answer never becomes a signal: signals feed the annotator and
  // the memory tiers, i.e. the model (safety spec §03). A breathing moment
  // says nothing about her, so it is not one either.
  // A state is not something she said, and a `hidden` step's answer is the one
  // thing that must not travel to the annotator and the memory tiers.
  const signals: RecordSignalInput[] = [];
  if (!safetyTier && !isBreathe(step) && !stated && !step.config?.hidden) {
    signals.push({
      userId,
      source: "path_day",
      kind: value == null && complete ? "completed" : "answered",
      refId: up.id,
      payload: {
        area,
        day,
        // A drawing reaches the signal log as its caption. The annotator and the
        // memory tiers read text, and the ink itself is kilobytes of path data
        // that would sit in every signal row saying nothing a model can use.
        value: isDrawn(value) || isPhoto(value) ? value.caption : value,
        title: step.title,
        kind: step.kind as DayKind,
        // Which step: what lets a deleted reflection take its words out of the
        // log too (`forgetStepAnswer`).
        step: input.stepId,
      },
    });
  }
  // The rating as its own fact about Elara's line — how often "Not really"
  // follows a live reply versus the authored one is the number worth having.
  // Logged even without a stored reply: then she rated the authored quote.
  if (resonance && rated) {
    signals.push({
      userId,
      source: "path_day",
      kind: "reply_resonance",
      refId: up.id,
      payload: {
        area,
        day,
        step: rated,
        resonance,
        generated: !!answers[rated]?.reply && !!answers[rated]?.generated,
      },
    });
  }

  /**
   * The rhythm, and the analytics over it.
   *
   * After the signals rather than before, and unconditionally — including for a
   * flagged answer. A member in distress who wrote something down has shown up,
   * and withholding her day because the safety screen caught the words would be
   * the product punishing her for being honest. The signal log is the thing that
   * stays quiet there (it feeds the model); the rhythm is hers.
   *
   * The credit is decided before the batch: a close is predicted from the row
   * the upsert returned (still open, and now complete), and a path completion
   * is decided inside the batch (`commitDay`). Only a request that loses a
   * race to close the same day can be credited as `day` where it would have
   * been `step` (the label of a day already earned by the winner).
   */
  const firstAnswer = !prior || (askCredited && !alreadyCredited);
  // A state is moving past a question, like a skip: no step credit, no rhythm.
  // The day it helps close still earns its day when it closes.
  const auto = input.auto || stated;
  const facts = {
    userId,
    area,
    day,
    pathId: up.id,
    timezone: zone,
    stepId: input.stepId,
    stepKind: step.kind,
    auto,
    firstAnswer,
    claimedLocalDate: input.localDate,
    pathTotal: authoredFull.total,
  };
  const willClose = complete && !row.completedAt;
  const predicted = earnedSource({ ...facts, dayCompleted: willClose, pathCompleted: false });
  const committed = await commitDay(db, {
    ...facts,
    up,
    dayWrites,
    closeAt,
    signals,
    credit: predicted ? { source: predicted, localDate: answeredOn } : undefined,
    stepEvent: stepEvent({ ...facts, dayCompleted: false, pathCompleted: false }),
  });
  await followUp(db, { ...facts, up, committed, credited: !!predicted, pathSignal: true, defer: opts.defer });

  return {
    progress: committed.progress,
    step,
    answers: merged,
    dayCompleted: committed.closedNow,
    steps,
    dayTitle,
    ...(purpose ? { purpose } : {}),
    pathId: up.id,
  };
}

/**
 * Has this step of this day already earned its `gamification_step_completed`?
 *
 * One indexed lookup: by the event's deterministic key (`stepEventKey`,
 * unique per member), or, for events recorded before the key existed (no
 * `client_key`), by their old shape within this path's step events (the
 * `(user_id, name, ref_id)` index of migration 0065 bounds that to one path).
 * Asked only when a state is being replaced by an answer.
 */
async function stepCredited(db: Db, userId: string, pathId: string, day: number, stepId: string): Promise<boolean> {
  const hit = await db
    .select({ id: analyticsEvent.id })
    .from(analyticsEvent)
    .where(
      and(
        eq(analyticsEvent.userId, userId),
        eq(analyticsEvent.name, "gamification_step_completed"),
        eq(analyticsEvent.refId, pathId),
        sql`(${analyticsEvent.clientKey} = ${stepEventKey(pathId, day, stepId)} or (${analyticsEvent.clientKey} is null and json_extract(${analyticsEvent.props}, '$.day') = ${day} and json_extract(${analyticsEvent.props}, '$.stepId') = ${stepId}))`,
      ),
    )
    .limit(1)
    .get();
  return !!hit;
}

export interface DeclineDayResult {
  progress: ProgressDTO;
  /** True when this call closed the day; false for a repeat on a day already complete. */
  dayCompleted: boolean;
}

/**
 * "I'd rather not do this today" (`DayConfig.allowDecline`).
 *
 * Every step of the day is recorded `declined` in ONE write and the day
 * completes, so the path moves on exactly as it does for a finished day — and
 * then it stops. A declined day is not something she did:
 *
 * - no reply (no model is ever asked), no signal, no memory annotation;
 * - **no rhythm credit, no `gamification_*` event, no celebration**. The streak
 *   is read from `eligible_day` rows alone, so a declined day neither extends
 *   it nor, by itself, breaks it;
 * - not even the path's own `completed` signal or `gamification_path_completed`
 *   when it was the last day — `user_path.completed_at` is still set, because
 *   the path really is over.
 *
 * Refused on a day that did not opt in, and on a day she has already put
 * something of hers in (`holdsHerAnswer`): words, a pick, or a non-answer she
 * chose herself ("I'm not sure"). Declining ends a day at its first screen; it
 * never overwrites what she did. That rule is part of the write itself (a
 * conditional UPDATE), so a step save landing between the read and the write
 * survives and the decline is refused. Repeating it on a complete day changes
 * nothing (`completedAt` is sticky).
 *
 * Round trips, given the caller's `loadDayState`: one batch.
 */
export async function declineDay(
  db: Db,
  userId: string,
  area: AreaKey,
  day: number,
  input: { localDate?: string } = {},
  locale: Locale = DEFAULT_LOCALE,
  /** Already read by the caller (`loadDayState`); read here when absent. */
  pre?: DayState,
): Promise<DeclineDayResult> {
  const state = pre ?? (await loadDayState(db, userId, area, day));
  const [authoredFull, up, zone] = await Promise.all([
    authoredPath(db, area, locale, state.contentVersion),
    state.path ?? ensurePath(db, userId, area, true),
    zoneOf(db, userId, state),
  ]);
  const authored = authoredFull.days.find((d) => d.day === day);
  if (!authored) throw notFound("Day not found", "day_not_found");
  if (authored.config?.allowDecline !== true) {
    throw badRequest("This day cannot be declined", "decline_not_allowed");
  }
  const steps = stepsOf(authored);

  const existing = state.path ? state.rows.find((r) => r.day === day) : undefined;
  if (existing?.completedAt) return { progress: await toProgressDTO(db, up), dayCompleted: false };
  // The early answer for the common case. It is not the guard: a step save can
  // land after this read, so the write below carries the same rule itself.
  const started = () => badRequest("This day has already been started", "decline_after_answers");
  if (Object.values(existing?.stepAnswers ?? {}).some((a) => holdsHerAnswer(a))) throw started();

  const on = claimedLocalDate(input.localDate, localToday(zone));
  const at = Date.now();
  const marks: DayStepAnswers = {};
  for (const s of steps) marks[s.id] = { ...answerRecord("declined", null), answeredAt: at, answeredOn: on };

  const dayWrites: Stmt[] = [];
  // The row exists before the one write that decides, so that write can be a
  // conditional UPDATE. Inserting nothing over a row a step save just created
  // is a no-op.
  if (!existing) {
    dayWrites.push(
      db
        .insert(dayResponse)
        .values({ id: newId(), userPathId: up.id, day, stepAnswers: {} })
        .onConflictDoNothing({ target: [dayResponse.userPathId, dayResponse.day] }),
    );
  }
  // One statement: the answers and the close land together, or not at all,
  // and only while the day is open and holds nothing of hers. A step save
  // that landed after the read above is seen here, and the decline refuses
  // rather than overwrite it. What it does overwrite: nothing, a step passed
  // with nothing (`value: null`, no state), a `notOffered` mark.
  const closeAt = dayWrites.length;
  dayWrites.push(
    db
      .update(dayResponse)
      .set({
        value: null,
        stepAnswers: mergeStepAnswers(marks),
        completedAt: new Date(at),
        completedOn: on,
      })
      .where(
        and(
          eq(dayResponse.userPathId, up.id),
          eq(dayResponse.day, day),
          isNull(dayResponse.completedAt),
          sql`not ${HOLDS_HER_ANSWER}`,
        ),
      )
      .returning({ id: dayResponse.id }),
  );
  // No signals, no credit, no events: see above. The recompute in the batch
  // is a pure function of the rows, so it is harmless when the close refused.
  const committed = await commitDay(db, {
    userId,
    area,
    day,
    pathId: up.id,
    up,
    timezone: zone,
    pathTotal: authoredFull.total,
    dayWrites,
    closeAt,
  });
  if (!committed.closedNow) {
    // Closed in between (a second decline, or her last answer): nothing to do.
    if (committed.rows.find((r) => r.day === day)?.completedAt) {
      return { progress: committed.progress, dayCompleted: false };
    }
    throw started();
  }
  return { progress: committed.progress, dayCompleted: true };
}

/**
 * Store what Elara said back to a step.
 *
 * Written separately from the answer, and never allowed to fail the answer:
 * the reply arrives a second or two later and is a decoration on a record that
 * is already safe. A read-modify-write is acceptable here because a member
 * answers one step at a time, on one device, by hand.
 */
export async function saveStepReply(
  db: Db,
  userId: string,
  area: AreaKey,
  day: number,
  stepId: string,
  reply: { text: string; generated: boolean; retry?: boolean },
  /** Her `user_path` id when the caller has it (`SaveStepResult.pathId`). */
  pathId?: string,
): Promise<void> {
  // One statement. The path is named by id when known, else looked up inside
  // it; a step with no answer stored is left alone by the `json_type` guard,
  // which is the same rule the read that used to come first applied.
  const path = pathId
    ? eq(dayResponse.userPathId, pathId)
    : inArray(
        dayResponse.userPathId,
        db
          .select({ id: userPath.id })
          .from(userPath)
          .where(and(eq(userPath.userId, userId), eq(userPath.area, area))),
      );

  // Set on the one step, inside SQLite: the reply lands seconds after the
  // answer, and writing back the map read above dropped any step answered in
  // between.
  const at = jsonKey(stepId);
  await db
    .update(dayResponse)
    .set({
      stepAnswers: sql`json_set(${dayResponse.stepAnswers},
        ${`${at}.reply`}, ${reply.text},
        ${`${at}.generated`}, json(${reply.generated ? "true" : "false"}),
        ${`${at}.repliedAt`}, ${Date.now()}
        ${reply.retry ? sql`, ${`${at}.retry`}, json('true')` : sql``})`,
    })
    .where(and(path, eq(dayResponse.day, day), sql`json_type(${dayResponse.stepAnswers}, ${at}) IS NOT NULL`));
}

/** A JSON path to one top-level key, quoted so any step id is a single key. */
function jsonKey(key: string): string {
  return `$."${key.replace(/"/g, '\\"')}"`;
}

/**
 * Merge whole step entries into `step_answers` without reading it first: each
 * changed step replaces its own key and every other key is left as it is.
 * `json_insert` writes only the keys that are not there yet.
 */
function mergeStepAnswers(changed: DayStepAnswers, fn: "json_set" | "json_insert" = "json_set") {
  const parts = Object.entries(changed).map(
    ([key, value]) => sql`, ${jsonKey(key)}, json(${JSON.stringify(value)})`,
  );
  return sql`${sql.raw(fn)}(coalesce(${dayResponse.stepAnswers}, '{}')${sql.join(parts, sql``)})`;
}

/**
 * SQL for "this day's `step_answers` holds something of hers": the same rule
 * as `holdsHerAnswer` in `@elara/shared`, evaluated inside the statement that
 * writes, so nothing can land between the check and the write. Something of
 * hers is a value under no state (or `answered`, or a state this build does
 * not know, which `stateOf` reads as `answered`), or a state she chose.
 */
const HOLDS_HER_ANSWER = (() => {
  const list = (xs: readonly string[]) => sql.raw(xs.map((x) => `'${x}'`).join(", "));
  const others = ANSWER_STATES.filter((x) => x !== "answered");
  return sql`exists (
    select 1 from json_each(coalesce(${dayResponse.stepAnswers}, '{}')) as held
    where (
      (json_extract(held.value, '$.state') is null or json_extract(held.value, '$.state') not in (${list(others)}))
      and json_type(held.value, '$.value') is not null and json_type(held.value, '$.value') != 'null'
    ) or json_extract(held.value, '$.state') in (${list(OPTIONAL_ANSWER_STATES)})
  )`;
})();

/**
 * The single path a free account may walk: the area onboarding recommended,
 * falling back to the first path they ever started (so an existing free user
 * never loses the path they're mid-way through) and finally to "money".
 */
export async function freeAreaFor(db: Db, userId: string): Promise<AreaKey> {
  // One query: the three fallbacks in order, inside SQLite. An empty
  // recommendation falls through, as the falsy check it replaces did. Read
  // through her `user` row, which every signed-in member has (no row: no
  // onboarding and no path either, so "money" as before).
  const row = await db
    .select({
      area: sql<string>`coalesce(
        (select nullif(${onboarding.recommendedArea}, '') from ${onboarding} where ${onboarding.userId} = ${userId}),
        (select ${userPath.area} from ${userPath} where ${userPath.userId} = ${userId} order by ${userPath.startedAt} asc limit 1),
        'money')`,
    })
    .from(user)
    .where(eq(user.id, userId))
    .get();
  return (row?.area as AreaKey | undefined) ?? "money";
}

/**
 * Entitlement gate for path content. Premium unlocks all six areas; a free
 * account may only start and answer days in its one free area. This is the
 * server half of the promise the paywall makes ("Unlock all six life areas") —
 * the client mirrors it with locked cards.
 *
 * Entitlement only. The closed beta's rule is not here and is not bypassed by
 * anything here: the routes call `assertPathAccess`, which checks it first.
 */
export async function assertAreaUnlocked(db: Db, userId: string, area: AreaKey): Promise<void> {
  // One wave: the free area is read alongside the entitlement rather than
  // after it (a wasted read for a member, one round trip less for a free one).
  const [premium, free] = await Promise.all([isPremium(db, userId), freeAreaFor(db, userId)]);
  if (premium) return;
  if (area !== free) {
    throw forbidden("This path is part of Premium", "premium_required");
  }
}

/**
 * Every door into a path's writes (start, day, step): the closed beta's
 * availability rule first, then entitlement.
 *
 * The order is the point. `assertAreaUnlocked` returns early for any premium
 * account and a beta grant is a premium account, so on its own it let a tester
 * into every Area the beta has not opened (round-2 audit R2-M5). The beta
 * rule (`assertBetaAreaOpen`) sees no entitlement at all, so nothing premium
 * can bypass it, and with the beta off it is a no-op: entitlement is exactly
 * what it was.
 */
export async function assertPathAccess(
  env: Parameters<typeof assertBetaAreaOpen>[0],
  db: Db,
  user: Parameters<typeof assertBetaAreaOpen>[1],
  area: AreaKey,
  route: string,
): Promise<void> {
  assertBetaAreaOpen(env, user, area, route);
  await assertAreaUnlocked(db, user.id, area);
}

/**
 * Entitlement gate for a *week* of a path. The first week of the free area is
 * the free practice; the weeks after it are membership (`FREE_WEEKS`). A day
 * number is enough to know its week — `weekOf` is seven days a week unless a
 * day says otherwise, and no authored day does.
 */
export async function assertDayUnlocked(db: Db, userId: string, day: number): Promise<void> {
  if (weekIsFree(weekOf(day))) return;
  if (await isPremium(db, userId)) return;
  throw forbidden("This week is part of Premium", "premium_required");
}

/**
 * Slack for a device and a stored zone that disagree: travel, or a zone that
 * last synced before the phone crossed a border. Two hours still rules out
 * finishing a week in a sitting, which is all this gate is for.
 */
const DAY_OPEN_GRACE_MS = 2 * 3_600_000;

/**
 * Pacing gate: one guided day at a time (`DAY_UNLOCK`, client fix list #1).
 *
 * The app already waits (`useDayGate`); this is the same rule where a changed
 * device clock, or a build from before the gate, cannot skip it. Day N opens
 * once day N-1 is finished and the rule's moment has passed in the member's
 * stored zone. A day she has already started is never taken back, which is
 * what the day screen promises too.
 *
 * `403 day_locked`, not `premium_required`: the offline step queue keeps these
 * for a later flush rather than dropping them, because they will succeed.
 */
export async function assertDayOpen(
  db: Db,
  userId: string,
  area: AreaKey,
  day: number,
  rule: DayUnlockRule,
  now = new Date(),
  /** Already read by the caller (`loadDayState`); read here when absent. */
  state?: DayState,
): Promise<void> {
  if (rule.kind === "open" || day <= 1) return;
  const locked = () => forbidden("This day opens later", "day_locked");

  const { path: up, rows } = state ?? (await loadDayState(db, userId, area, day));
  if (!up) throw locked();
  if (rows.some((r) => r.day === day)) return;
  const finishedAt = rows.find((r) => r.day === day - 1)?.completedAt;
  if (!finishedAt) throw locked();

  const zone =
    rule.kind === "nextDay" ? (state?.zone !== undefined ? state.zone : await zoneFor(db, userId)) : null;
  if (!nextDayIsOpen(finishedAt, rule, zone, now)) throw locked();
}

/**
 * Has the day after one finished at `finishedAt` opened by `now`? The pacing
 * rule's arithmetic alone, shared by the gate above and the Atlas (which shows
 * "Its first night opens tomorrow" for exactly the days this refuses).
 */
export function nextDayIsOpen(
  finishedAt: Date,
  rule: DayUnlockRule,
  zone: string | null,
  now = new Date(),
): boolean {
  if (rule.kind === "open") return true;
  // A stored completion that is not a time (unreachable through the write
  // paths, which stamp `new Date()`) is a day she did finish with no moment
  // to count from. It opens rather than locking her path for good, and rather
  // than throwing: `formatToParts` raises a RangeError on an invalid Date,
  // which turned every step write and Atlas read on this path into a 500.
  if (!isInstant(finishedAt.getTime())) {
    console.error(JSON.stringify({ event: "day_completed_at_unreadable" }));
    return true;
  }
  const at = new Date(now.getTime() + DAY_OPEN_GRACE_MS);
  if (rule.kind === "after") {
    return at.getTime() >= finishedAt.getTime() + rule.hours * 3_600_000;
  }
  // `nextDay`: a later local date than the one she finished on, and on the very
  // next date not before the rule's time. YYYY-MM-DD compares as a string.
  const next = new Date(`${localStamp(finishedAt, zone).localDate}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const nextDate = next.toISOString().slice(0, 10);
  const here = localStamp(at, zone);
  if (here.localDate < nextDate) return false;
  const minutes = here.localHour * 60 + here.localMinute;
  return !(here.localDate === nextDate && minutes < rule.hour * 60 + rule.minute);
}
