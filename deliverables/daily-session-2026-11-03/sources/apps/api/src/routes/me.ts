import { zValidator } from "@hono/zod-validator";
import {
  analyticsReportInput,
  areaKeySchema,
  checkInInput,
  dayFeedbackInput,
  declineDayInput,
  isSkippedAnswer,
  milestoneClaimInput,
  parseDayUnlock,
  recordExplainersInput,
  registerPushTokenInput,
  saveDayInput,
  saveStepInput,
  updateProfileInput,
  uploadImageInput,
  type MeDTO,
} from "@elara/shared";
import { Hono, type Context } from "hono";
import { z } from "zod";
import { createDb } from "../db";
import type { AppEnv } from "../env";
import { betaOpenAreasOf } from "../lib/betaAccess";
import { ApiError, badRequest } from "../lib/errors";
import { enforceRateLimit } from "../middleware/ratelimit";
import { requireAuth } from "../middleware/session";
import { addCheckIn, listCheckIns } from "../services/checkins";
import { clientEventTime, recordEvents } from "../services/analytics";
import { awardedMilestones, claimMilestone, seedAwarded } from "../services/milestoneAwards";
import { deleteNote } from "../services/memoryNotes";
import { getStreak } from "../services/streak";
import { zoneFor } from "../services/time";
import { listExplainers, recordExplainers, resetExplainers } from "../services/explainers";
import { createAuth } from "../auth";
import { answerTextForSafety } from "../services/safety/answerText";
import { screen, screenMessage } from "../services/safety";
import { INVALID_BODY_MAX_BYTES, recordInvalidAnswerWords } from "../services/safety/invalidBody";
import { upgradeAnonymous } from "../services/anonymous";
import { saveDayFeedback } from "../services/dayFeedback";
import { deleteAccount, getMe, rememberLocaleIfUnset, updateProfile, uploadAvatar } from "../services/profile";
import { readPhoto, uploadPhoto } from "../services/photos";
import {
  ensurePersonalized,
  ensurePersonalizedAll,
  listPersonalizedDays,
} from "../services/personalizedQuestions";
import {
  alreadyScreened,
  assertPathAccess,
  loadDayState,
  assertDayOpen,
  assertDayUnlocked,
  declineDay,
  listMyPaths,
  saveDay,
  saveStep,
  saveStepReply,
  startPath,
} from "../services/progress";
import { fallbackFor, replyToStep } from "../services/stepReply";
import { usageFrom } from "../lib/aiUsage";
import { registerToken, unregisterToken } from "../services/push";
import { getSubscription, syncFromRevenueCat } from "../services/subscription";
import { getMemoryOverview } from "../services/memoryOverview";
import { listSnapshots } from "../services/wellbeing";

/** Live step replies per member per minute; past it the authored line is returned. */
const STEP_REPLY_LIMIT = { name: "path:step-reply", limit: 30, windowMs: 60_000 } as const;

/**
 * Await gates that read independently, all at once, and throw the refusal of
 * the first one in the list that refused: the same error the member got when
 * they ran one after another.
 */
async function firstRefusal(gates: Promise<unknown>[]): Promise<void> {
  const settled = await Promise.allSettled(gates);
  const refused = settled.find((r): r is PromiseRejectedResult => r.status === "rejected");
  if (refused) throw refused.reason;
}

/**
 * An answer refused before anything was saved, by any of the rules the step
 * route applies (400, 403, 404, 422). The offline queue retries `day_locked`
 * (`flushSteps` in the app), and keeps rather than drops an answer refused
 * with `404 step_not_found` (a step the CMS no longer has: the status and code
 * are a stable contract, see `stepContext`); her words are recorded and routed
 * either way.
 */
function refusedBeforeSave(err: unknown): err is ApiError {
  return err instanceof ApiError && [400, 403, 404, 422].includes(err.status);
}

/**
 * Validation hook for the step route. A body (or an Area key) the schema does
 * not take is still a 400 with the answer unsaved; this only makes sure words
 * in it that match the safety list are recorded and routed first, narrowly
 * (`recordInvalidAnswerWords`). It returns nothing, so the validator's own 400
 * is exactly what the client already got. Never throws.
 */
async function screenRefusedShape(result: { success: boolean }, ctx: unknown): Promise<void> {
  if (result.success) return;
  const c = ctx as Context<AppEnv>;
  try {
    if (Number(c.req.header("content-length") ?? 0) > INVALID_BODY_MAX_BYTES) return;
    const raw = await c.req.json().catch(() => null);
    const user = c.get("user");
    if (!user || !raw) return;
    await recordInvalidAnswerWords(
      {
        env: c.env,
        db: createDb(c.env.DB),
        userId: user.id,
        surface: "ai_practice",
        waitUntil: (p) => c.executionCtx.waitUntil(p),
      },
      raw,
      { area: c.req.param("area"), day: c.req.param("day") },
    );
  } catch (err) {
    console.error(JSON.stringify({ event: "safety_invalid_body_failed", error: String(err).slice(0, 200) }));
  }
}

/**
 * The profile as the phone reads it, plus the closed beta's availability rule
 * for this account (`betaOpenAreas`): the very answer `assertPathAccess` gives
 * on a write, so the app can show its locked state before a write is refused.
 * Added at the route because the profile service holds no Worker env, and on
 * every route that returns a `MeDTO` because the app stores all of them under
 * one cache key.
 */
function withBetaAreas(c: Context<AppEnv>, dto: MeDTO): MeDTO {
  const open = betaOpenAreasOf(c.env, c.get("user")!);
  return { ...dto, betaOpenAreas: open ? [...open] : null };
}

/** Everything scoped to the current user: profile, progress, check-ins. */
const me = new Hono<AppEnv>();
me.use("*", requireAuth);

// --- Profile ---
me.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  // The saved preference, else what this app asked for (`attachLocale`).
  const locale = c.get("locale");
  // Not from the admin preview's `?locale=` override: that is not her app.
  // Only while the column is unset (`savedLocale` is what the session read):
  // after her first launch this was a no-op UPDATE on the primary every call.
  // Off the response path: the DTO reads the same language either way (the
  // column, or this request's language that the write would store).
  if (!c.req.query("locale") && c.get("savedLocale") == null) {
    c.executionCtx.waitUntil(rememberLocaleIfUnset(db, user.id, locale).catch(() => {}));
  }
  return c.json(withBetaAreas(c, await getMe(db, user, c.env.BETTER_AUTH_URL, locale)));
});

me.patch("/", zValidator("json", updateProfileInput), async (c) => {
  const db = createDb(c.env.DB);
  return c.json(
    withBetaAreas(
      c,
      await updateProfile(db, c.get("user")!, c.req.valid("json"), c.env.BETTER_AUTH_URL, c.get("locale")),
    ),
  );
});

/**
 * "Save your progress": a "Skip for now" guest adds an email and password to
 * the account she is already in. Same id, same session — nothing moves.
 */
const upgradeInput = z.object({
  name: z.string().max(120).optional(),
  email: z.string().min(3).max(320),
  password: z.string().min(1).max(256),
});
me.post("/upgrade", zValidator("json", upgradeInput), async (c) => {
  const db = createDb(c.env.DB);
  const authUser = c.get("user")!;
  const input = c.req.valid("json");
  await upgradeAnonymous(db, createAuth(c.env, c.executionCtx), authUser.id, input);
  const name = input.name?.trim().slice(0, 60) || input.email.trim().toLowerCase().split("@")[0]!;
  return c.json(
    withBetaAreas(
      c,
      await getMe(
        db,
        { ...authUser, email: input.email.trim().toLowerCase(), name, isAnonymous: false },
        c.env.BETTER_AUTH_URL,
        c.get("locale"),
      ),
    ),
  );
});

me.post("/avatar", zValidator("json", uploadImageInput), async (c) => {
  const db = createDb(c.env.DB);
  return c.json(withBetaAreas(c, await uploadAvatar(c.env, db, c.get("user")!, c.req.valid("json"))));
});

// --- Practice photos (private — see services/photos.ts) ---
me.post("/photos", zValidator("json", uploadImageInput), async (c) => {
  return c.json(await uploadPhoto(c.env, c.get("user")!.id, c.req.valid("json")), 201);
});

me.get("/photos/:id", async (c) => {
  const { body, contentType } = await readPhoto(c.env, c.get("user")!.id, c.req.param("id"));
  return new Response(body, {
    headers: {
      "content-type": contentType,
      // Her photo, behind her session: never in a shared cache on the way back.
      "cache-control": "private, max-age=31536000, immutable",
    },
  });
});

// --- Account deletion (App Store / Play Store requirement) ---
me.delete("/", async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await deleteAccount(db, c.get("user")!.id, c.env));
});

// --- Subscription ---
me.get("/subscription", async (c) => {
  // Answered from the session's snapshot of the row: no query (see `getSubscription`).
  const db = createDb(c.env.DB);
  return c.json(await getSubscription(db, c.get("user")!.id));
});

/**
 * Ask RevenueCat directly, then answer as `GET /subscription` does. Called by
 * "Restore purchases" and after a purchase, so a membership the store has
 * confirmed never waits on (or is lost with) a webhook. Grant-only — see
 * `syncFromRevenueCat`. Without a secret key it is just the read.
 */
me.post("/subscription/sync", async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get("user")!.id;
  await syncFromRevenueCat(db, c.env, userId);
  return c.json(await getSubscription(db, userId));
});

// --- Push notification tokens (one row per device) ---
me.post("/push-tokens", zValidator("json", registerPushTokenInput), async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await registerToken(db, c.get("user")!.id, c.req.valid("json")));
});

me.delete(
  "/push-tokens/:token",
  async (c) => {
    const db = createDb(c.env.DB);
    return c.json(
      await unregisterToken(db, c.get("user")!.id, decodeURIComponent(c.req.param("token"))),
    );
  },
);

// --- Check-ins ---
me.get("/checkins", async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await listCheckIns(db, c.get("user")!.id));
});

/**
 * The check-in rhythm, over the member's whole history.
 *
 * Its own endpoint rather than a field on `/api/me`: it scans every check-in
 * row, and the profile is read on every launch. This is read by one screen
 * and one small module.
 */
me.get("/streak", async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await getStreak(db, c.get("user")!.id));
});

me.post("/checkins", zValidator("json", checkInInput), async (c) => {
  const db = createDb(c.env.DB);
  const { mood, date } = c.req.valid("json");
  return c.json(await addCheckIn(db, c.get("user")!.id, mood, date, (p) => c.executionCtx.waitUntil(p)));
});

// --- Milestones ---

/**
 * Record a milestone moment: one that was just shown, or a set already behind her.
 *
 * The phone has *already* celebrated by the time this arrives, and that ordering
 * is deliberate — the beat fires from local state so it works on a train (see
 * docs/CELEBRATION.md §5). This endpoint is not permission; it is the shared
 * record that stops a **second device** replaying the same moment, which the
 * local ledger alone could not do.
 *
 * `awarded` on the response is the full ledger, so a client that has drifted (a
 * reinstall, a sign-in on a tablet) can reconcile in one round trip.
 */
me.post("/milestones", zValidator("json", milestoneClaimInput), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get("user")!.id;
  const { threshold, seed } = c.req.valid("json");
  const timezone = await zoneFor(db, userId);
  /**
   * Claim before seed, not after.
   *
   * Both write the same rows and only the claim records a moment as *shown*. A
   * request carrying both — a crossing, plus the thresholds crossed alongside it —
   * must therefore claim first, or the seed takes the row and the real crossing
   * comes back as "already awarded" with no `milestone_awarded` event behind it.
   * The client already keeps `threshold` out of `seed`; this makes the order of
   * operations not depend on it doing so.
   */
  const awarded =
    threshold === undefined
      ? false
      : await claimMilestone(db, userId, threshold, { timezone, source: "practice" });
  if (seed?.length) await seedAwarded(db, userId, seed);
  return c.json({ awarded, ledger: await awardedMilestones(db, userId) });
});

// --- Analytics ---

/**
 * The events only the phone can know about (`CLIENT_REPORTED_EVENTS`).
 *
 * Everything else in the stream is written by the service that did the work, so
 * it cannot be lost to a dropped request. This endpoint exists for one event —
 * `celebration_shown` — because whether a beat actually played is a fact about a
 * screen, and the server has no way to observe it.
 *
 * Always 200, even when nothing was stored. A phone must never retry forever
 * because its telemetry was rejected, and `recordEvent` swallows its own
 * failures; the `client_key` unique index makes a retry harmless anyway.
 */
me.post("/analytics", zValidator("json", analyticsReportInput), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get("user")!.id;
  // From the session's snapshot: no query.
  const timezone = await zoneFor(db, userId);
  const now = Date.now();
  await recordEvents(
    db,
    c.req.valid("json").events.map((e) => ({
      userId,
      name: e.name,
      source: e.source,
      props: e.props,
      clientKey: e.key,
      timezone,
      // A client clock can be wrong or hostile; see `clientEventTime`.
      at: clientEventTime(e.at, now),
    })),
  );
  return c.json({ ok: true });
});

// --- End-of-day feedback ---

/**
 * "Was today's session useful to you?" The tap sends `answer`; the follow-up,
 * when there is one, sends the same `key` again with its reasons.
 */
me.post("/day-feedback", zValidator("json", dayFeedbackInput), async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await saveDayFeedback(db, c.get("user")!.id, c.req.valid("json")));
});

// --- Progress ---
me.get("/paths", async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await listMyPaths(db, c.get("user")!.id));
});

me.post(
  "/paths/:area/start",
  zValidator("param", z.object({ area: areaKeySchema })),
  async (c) => {
    const db = createDb(c.env.DB);
    const { area } = c.req.valid("param");
    const userId = c.get("user")!.id;
    await assertPathAccess(c.env, db, c.get("user")!, area, "start");
    const progress = await startPath(db, userId, area);
    // Day 1's personalised question is written while the member is still on the
    // screen that started the path — detached, so the response does not wait for
    // it, and unawaited failure means day 1 simply reads as it was authored.
    c.executionCtx.waitUntil(ensurePersonalized(c.env, db, userId, area, c.get("locale")));
    return c.json(progress);
  },
);

me.post(
  "/paths/:area/days/:day",
  zValidator("param", z.object({ area: areaKeySchema, day: z.coerce.number().int().min(1) })),
  zValidator("json", saveDayInput),
  async (c) => {
    const db = createDb(c.env.DB);
    const { area, day } = c.req.valid("param");
    const body = c.req.valid("json");
    if (body.value == null && !body.complete) {
      throw badRequest("Nothing to save");
    }
    const userId = c.get("user")!.id;
    const locale = c.get("locale");
    // The same safety screen the step route runs, before anything is saved: a
    // T2/T3 answer is not stored where the guide reads it and never becomes a
    // signal (safety spec §03). Current builds send this after the day's steps
    // (the words were screened there), so it is recorded once per distinct
    // words on this day, never as a second flag and alert.
    const words = answerTextForSafety(body.value ?? null);
    const screened = words
      ? await screenMessage(
          { env: c.env, db, userId, surface: "ai_practice", waitUntil: (p) => c.executionCtx.waitUntil(p) },
          words,
        )
      : null;
    const refId = `${area}:${day}`;
    let progress: Awaited<ReturnType<typeof saveDay>>;
    try {
      // As on the step route: her path, the day's rows, her zone and the
      // content version in one wave, then the gates in one wave (the refusal
      // is still the first gate's in this order), then the save.
      const state = await loadDayState(db, userId, area, day);
      await firstRefusal([
        assertPathAccess(c.env, db, c.get("user")!, area, "day"),
        assertDayUnlocked(db, userId, day),
        assertDayOpen(db, userId, area, day, parseDayUnlock(c.env.DAY_UNLOCK), new Date(), state),
      ]);
      progress = await saveDay(db, userId, area, day, body, locale, screened?.card?.tier, state, {
        defer: (p) => c.executionCtx.waitUntil(p),
      });
    } catch (err) {
      // Refused: her words are still recorded and routed, as on the step route.
      if (screened && refusedBeforeSave(err)) await screened.recordRefused(refId, err.code ?? String(err.status));
      throw err;
    }
    await screened?.recordOnce(refId);
    // Answering a day is the moment the app learns the most about someone, and
    // the moment the next day becomes the one to write. Same detached call.
    c.executionCtx.waitUntil(ensurePersonalized(c.env, db, userId, area, locale));
    return c.json(progress);
  },
);

/**
 * Answer one step of a day, and get Elara's response to it.
 *
 * ## What is awaited and what is not
 *
 * The answer is saved and the progress recomputed *before* a model is touched,
 * and the response carries the fresh progress either way. So the member's
 * record of their own week never waits on, or depends on, a generated reply.
 *
 * The reply itself IS awaited — the screen is showing three dots while the
 * member looks at it, and a reply that arrived after they had moved on would be
 * worse than none. What makes that safe is that `replyToStep` cannot fail: it
 * returns the authored line on any error, so the worst case is the response
 * this endpoint always used to give. The client puts its own timeout around the
 * request (`STEP_REPLY_TIMEOUT_MS`) and falls back to the same line, so a
 * request that hangs at the network layer degrades to exactly the same place.
 *
 * `replyless` skips the model entirely. The client sets it when replaying a
 * step the member already answered, so revisiting a finished day costs nothing
 * and shows the exchange they actually had rather than a fresh reply to the
 * same words.
 */
me.post(
  "/paths/:area/days/:day/steps",
  zValidator("param", z.object({ area: areaKeySchema, day: z.coerce.number().int().min(1) }), screenRefusedShape),
  zValidator("json", saveStepInput, screenRefusedShape),
  async (c) => {
    const db = createDb(c.env.DB);
    const { area, day } = c.req.valid("param");
    const body = c.req.valid("json");
    const userId = c.get("user")!.id;
    const locale = c.get("locale");
    const refId = `${area}:${day}:${body.stepId}`;

    // Safety first, before the entitlement and pacing gates, before anything
    // is saved and before any model is asked: words she wrote are screened
    // even when this answer is refused (see the catch below). A replay
    // (`replyless`) re-sends words that were already screened, so it is
    // checked but never flagged or alerted twice.
    // A state ("I'm not sure") is the answer: no words to screen, no model to ask.
    const stated = !!body.state && body.state !== "answered";
    const words = stated ? null : answerTextForSafety(body.value ?? null);
    // Whether these words are a replay is decided by what is stored, not by
    // what the client says: the offline queue of every build sends `replyless`
    // for words the server may never have seen, and only builds with this fix
    // also send `queued`. Words that are not already stored for this step are
    // recorded and alerted like a live answer; identical stored words were
    // screened when they landed (the live request did land and only its
    // response was lost, or she is replaying a finished day).
    // Her path row and this day's (and the day before's) answers, read once
    // for the replay check, the pacing gate and the save (X8: one read where
    // there were four of `user_path` and five of `day_response`).
    const state = await loadDayState(db, userId, area, day);
    const replay =
      body.replyless && (await alreadyScreened(db, userId, area, day, body.stepId, body.value, state));
    const screened = words
      ? replay
        ? { ...(await screen(db, words, locale)), record: async () => null, recordRefused: async () => null, recordOnce: async () => null }
        : await screenMessage(
            { env: c.env, db, userId, surface: "ai_practice", waitUntil: (p) => c.executionCtx.waitUntil(p) },
            words,
          )
      : null;
    const card = screened?.card ?? null;

    let saved: Awaited<ReturnType<typeof saveStep>>;
    try {
      // The three gates read independently, so in one wave; the refusal is
      // still the first gate's in this order, as when they ran in turn.
      await firstRefusal([
        assertPathAccess(c.env, db, c.get("user")!, area, "step"),
        assertDayUnlocked(db, userId, day),
        assertDayOpen(db, userId, area, day, parseDayUnlock(c.env.DAY_UNLOCK), new Date(), state),
      ]);
      saved = await saveStep(db, userId, area, day, body, locale, card?.tier, state, {
        defer: (p) => c.executionCtx.waitUntil(p),
      });
    } catch (err) {
      // Refused for good: an area or week that has locked since she wrote,
      // a step an older build knows and the CMS no longer has, a shape the
      // step does not take. The offline queue drops these (they can never
      // succeed), so before this a disclosure in one was never recorded and
      // no moderator heard of it. Her words are kept in the flag; the answer
      // itself is still refused. `day_locked` is not final (the queue keeps it
      // and it lands once the day opens), but her words are recorded and
      // routed now, not a day later: the flag is one per distinct words, so
      // every retry of the same submission is a no-op and the landing adds a
      // line to it instead of a second alert. Different words are a new flag.
      if (screened && refusedBeforeSave(err)) await screened.recordRefused(refId, err.code ?? String(err.status));
      throw err;
    }

    // An empty answer made for her that reached a declined step: nothing was
    // written, so there is nothing to reply to or keep.
    if (saved.ignored) {
      return c.json({
        progress: saved.progress,
        dayCompleted: false,
        reply: { stepId: body.stepId, reply: null, generated: false },
      });
    }

    if (card) {
      // The fixed response replaces Elara's card, and the Path does not
      // continue this session (spec §04). No reply, no personalisation.
      await screened!.record(refId, true, { afterRefusal: true });
      return c.json({
        progress: saved.progress,
        dayCompleted: saved.dayCompleted,
        reply: { stepId: body.stepId, reply: null, generated: false },
        safety: card,
      });
    }
    // T1, or detection failed — logged (and alerted, if it failed), then on as usual.
    await screened?.record(refId, false, { afterRefusal: true });

    // Where this step sits in its day, which changes what the reply is for —
    // a bridge to the next question, or the close of the day. `saveStep`
    // already read the authored day.
    const steps = saved.steps.length ? saved.steps : [saved.step];
    const position = Math.max(1, steps.findIndex((s) => s.id === body.stepId) + 1);

    // A `hidden` step's answer never reaches a model, in any prompt: she keeps
    // it out of sight, and a reply built from it would carry it back onto the
    // screen, into a replay and into the day's summary. The authored line is
    // returned for the screen and, like a state's, not kept as a reply.
    const hidden = saved.step.config?.hidden === true;
    // A skip ends the exercise (daily session rules, Nov 2026): Skip, or the
    // state `skipped`, is not something to answer. No model is asked, no reply
    // is kept (an older one went with the answer it belonged to), and nothing
    // is returned for a screen to show: never an Elara note under a skip.
    const skipped = isSkippedAnswer(saved.step, stated ? null : (body.value ?? null), body.state);
    // The same words sent again (a retry whose response was lost, a double
    // tap) already have Elara's reply: hand that back instead of paying for a
    // second one, and do not rewrite the next day's question over nothing new.
    const prior = state.rows.find((r) => r.day === day)?.stepAnswers?.[body.stepId];
    const unchanged =
      !stated &&
      !skipped &&
      !!prior?.reply &&
      (prior.generated === true || prior.retry === true) &&
      (prior.state ?? "answered") === "answered" &&
      (prior.mode ?? null) === (body.mode ?? null) &&
      JSON.stringify(prior.value ?? null) === JSON.stringify(body.value ?? null);
    // Every live reply runs the guide's context build and a model call, so it
    // is capped per member (as chat is). Over the cap the answer still saves
    // and she gets the authored line: a burst from the offline queue must
    // never cost her an answer, only the model's words.
    const live = !(body.replyless || stated || hidden || unchanged || skipped);
    const withinCap = live ? await enforceRateLimit(c, STEP_REPLY_LIMIT) : true;
    const reply = unchanged
      ? { text: prior!.reply!, generated: prior!.generated === true, ...(prior!.retry ? { retry: true } : {}) }
      : skipped
        ? { text: "", generated: false }
        : !live || !withinCap
          ? fallbackFor(saved.step)
          : await replyToStep(c.env, db, userId, {
              step: saved.step,
              value: body.value ?? null,
              position,
              total: steps.length,
              dayTitle: saved.dayTitle || saved.step.title,
              dayNumber: day,
              mode: body.mode,
              usage: usageFrom(c),
              locale,
              purpose: saved.purpose,
              steps,
              answers: saved.answers,
            });

    // Persisted after the response shape is settled and never allowed to fail
    // the request: the reply is a decoration on a record that is already safe.
    // A state is not a thing Elara answered, so the authored line is returned
    // for the screen but not kept: a revisit must not show "Good. Carry that."
    // under "I'm not sure". Nor is anything kept for a hidden step (above).
    // The response is built from `reply` itself, never from the stored copy,
    // so the write runs after the response (`waitUntil`): one round trip off
    // the step's latency.
    const replySaved =
      reply.text && !stated && !hidden && !skipped
        ? saveStepReply(db, userId, area, day, body.stepId, reply, saved.pathId).catch((err) =>
            console.error("saveStepReply failed", err),
          )
        : Promise.resolve();
    c.executionCtx.waitUntil(replySaved);
    // The member just told the app something; the next day's question is worth
    // rewriting in light of it. Not when she told it nothing new, and not past
    // the cap: personalising is a model call too. Started once the reply is
    // stored, as it was when the reply was awaited first.
    // A skip told it nothing new either.
    if (!unchanged && !skipped && withinCap) {
      c.executionCtx.waitUntil(replySaved.then(() => ensurePersonalized(c.env, db, userId, area, locale)));
    }

    return c.json({
      progress: saved.progress,
      dayCompleted: saved.dayCompleted,
      reply: {
        stepId: body.stepId,
        reply: reply.text,
        generated: reply.generated,
        ...(reply.retry ? { retry: true } : {}),
      },
    });
  },
);

/**
 * "I'd rather not do this today": end a day that opted in (`allowDecline`) at
 * its first screen. Every step is recorded `declined` in one write and the day
 * completes; nothing else happens — no reply, no signal, no memory, no rhythm
 * credit, no personalisation (`declineDay` says why). Same gates as the steps
 * route, and it answers with the fresh progress so the screen can move on.
 */
me.post(
  "/paths/:area/days/:day/decline",
  zValidator("param", z.object({ area: areaKeySchema, day: z.coerce.number().int().min(1) })),
  zValidator("json", declineDayInput),
  async (c) => {
    const db = createDb(c.env.DB);
    const { area, day } = c.req.valid("param");
    const userId = c.get("user")!.id;
    // The same gate as the steps route: a closed Area, week or day refuses a decline too.
    // One read of the day's state, then the gates in one wave (refusal order kept).
    const state = await loadDayState(db, userId, area, day);
    await firstRefusal([
      assertPathAccess(c.env, db, c.get("user")!, area, "step"),
      assertDayUnlocked(db, userId, day),
      assertDayOpen(db, userId, area, day, parseDayUnlock(c.env.DAY_UNLOCK), new Date(), state),
    ]);
    const result = await declineDay(db, userId, area, day, c.req.valid("json"), c.get("locale"), state);
    return c.json(result);
  },
);

/**
 * The personalised questions this member should currently see, across every
 * path they have open.
 *
 * An overlay, not a replacement: each entry names an (area, day) the client
 * already has authored copy for, and the client swaps in whatever is here.
 * Days that are absent — never generated, rejected, switched off — keep the
 * authored question, which is why this endpoint has no error contract and the
 * client has no failure branch. An empty array is a completely normal answer.
 *
 * The lookahead is kicked off from here too, so a member who reinstalls or
 * switches language repairs their own cache by opening the app.
 */
me.get("/path-questions", async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get("user")!.id;
  const locale = c.get("locale");
  const days = await listPersonalizedDays(c.env, db, userId, locale);
  c.executionCtx.waitUntil(ensurePersonalizedAll(c.env, db, userId, locale));
  return c.json(days);
});

// --- Memory: what Elara has recorded, and the member's control over it ---
// Deliberately NOT premium-gated, unlike the guide chat it feeds. The chat is a
// feature someone can decline to buy; this is the record the app keeps about
// them, and a free account generates it too — onboarding answers, path
// reflections, check-ins. Putting a paywall in front of someone's own data
// would make the privacy story conditional on a subscription.
me.get("/memory", async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await getMemoryOverview(db, c.get("user")!.id));
});

/** Disown one memory. Tombstoned, so distillation can never write it back. */
me.delete("/memory/:id", async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await deleteNote(db, c.get("user")!.id, c.req.param("id")));
});

// --- Wellbeing: the last twelve weeks, gaps included ---
me.get("/wellbeing", async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await listSnapshots(db, c.get("user")!.id));
});

// --- In-app explainers ---
// Deliberately not folded into MeDTO: /api/me sits on the launch critical path
// and is re-fetched on every preference write, while explainer state changes
// far more often and independently. Sharing a query key would make every
// dismissed hint re-fetch the profile and every toggled push pref re-fetch the
// hint list.
me.get("/explainers", async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await listExplainers(db, c.get("user")!.id));
});

me.post("/explainers", zValidator("json", recordExplainersInput), async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await recordExplainers(db, c.get("user")!.id, c.req.valid("json")));
});

/** "Show all hints again" — the client clears its own device/session tiers. */
me.delete("/explainers", async (c) => {
  const db = createDb(c.env.DB);
  return c.json(await resetExplainers(db, c.get("user")!.id));
});

export default me;
