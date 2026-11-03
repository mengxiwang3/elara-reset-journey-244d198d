import { DEFAULT_GUIDE_VOICE, isInstant } from "@elara/shared";
import type { AppState, HeldForSignIn, OnboardingState, PendingStep, Settings, User } from "./useAppStore";

/**
 * The shape of everything in the store that belongs to *whoever is signed in*,
 * and how to clear it.
 *
 * This lives apart from `useAppStore` for two reasons. It is the security-
 * relevant half — get it wrong and one person's onboarding answers greet the
 * next person to hold the phone — and it is pure, so it can be unit-tested
 * without dragging in AsyncStorage, expo-secure-store or the API client.
 */

export function freshOnboarding(): OnboardingState {
  return {
    concern: "",
    answers: {},
    firstName: "",
    recommendedArea: "money",
    statedArea: null,
    areaConfirmed: false,
    syncedAt: null,
    pendingSync: false,
  };
}

/**
 * Every setting that belongs to the *account* rather than the phone. SessionSync
 * overwrites all of these from `/api/me` the moment a session lands, so these
 * values are only ever what a signed-out app shows.
 */
export function accountSettings(): Omit<Settings, "hapticsEnabled"> {
  return {
    eveningCheckIn: true,
    showCity: true,
    showSeason: true,
    allowMessages: false,
    pushEnabled: true,
    reminderTime: "20:00",
    guidePersonality: "sage",
    guideVoice: DEFAULT_GUIDE_VOICE,
    push: {
      direct_message: true,
      connection_request: true,
      circle_reflection: true,
      event_reminder: true,
    },
  };
}

/**
 * The account-derived slice, reset to empty.
 *
 * This exists because `onboarding`, `todayCheckIn` and the account settings are
 * all in the persisted slice, while sign-out only ever cleared the session and
 * path progress. On a shared phone the next account inherited the last person's
 * concern text, clarity-audit answers and mood — the most intimate
 * things the app holds.
 *
 * Anything account-derived belongs here. `hapticsEnabled` deliberately does not
 * (it describes this phone, like Reduce Motion), nor does `pushPrimerShownAt`
 * (the OS permission it leads to is the phone's, not the account's).
 */
export function accountReset(current: Settings): Partial<AppState> {
  return {
    user: null,
    hasOnboarded: false,
    subscription: null,
    isPremium: false,
    freeArea: "money",
    // Whether the beta narrows *this* account (the QA/research allowlist) is
    // hers alone; the next person on this phone starts from the stricter rule.
    betaOpenAreas: undefined,
    activeArea: "money",
    progress: {} as AppState["progress"],
    // The progress above is no one's yet: the next account's is read again
    // before any door into a day is offered (`progressReady`).
    progressSyncedFor: null,
    onboarding: freshOnboarding(),
    // Her summary's line belongs to her; the next person is never greeted with it.
    todayWelcomePending: false,
    todayCheckIn: null,
    // Cleared, not carried. An unsent check-in belongs to the account that is
    // leaving, and keeping it would file that person's evening under the next
    // person's account — the same class of leak as inheriting their concern.
    pendingCheckIns: [],
    pendingSteps: [],
    pendingFeedback: [],
    feedbackAsked: [],
    // Half-written answers are hers; the next person on this phone never sees them.
    drafts: {},
    recentResourceIds: [],
    // The celebration ledgers are a record of moments *this member* has been
    // shown. Carried across a sign-out they would silence the next member's
    // first milestone, which is the one that matters most.
    milestonesCelebrated: [],
    milestonesSeededFor: null,
    daysCelebrated: {},
    // Whether *she* has shown up today says nothing about whoever signs in next,
    // and carrying it would swallow their first beat of the day.
    lastEligibleDay: null,
    // A safety stop is about the person who wrote the words, not the phone.
    safetyPauses: {},
    unseenSafetyCards: [],
    settings: { ...accountSettings(), hapticsEnabled: current.hapticsEnabled },
  };
}

// ── Whose progress this is ──────────────────────────────────────────────────

/**
 * Whether the path progress in the store is this account's, so a door into a
 * day may be offered from it (Hoy's postcard, the Atlas "Continue").
 *
 * The store starts every install with a fresh Day 1 for Money, and a session
 * change resets progress to nothing. Until her own progress is read, both
 * read as "Week 1 · Day 1, Start". A member in week 2 who signed in on a new
 * phone, or again after her session expired, was offered Day 1, and answering
 * it rewrote the Day 1 answers she gave weeks ago. So the doors wait for
 * `progressSyncedFor` to name her: set by a server read of her progress
 * (`hydrateProgress`) or by her own brand-new account's start
 * (`finalizeOnboarding`), persisted with the progress it vouches for, and
 * cleared by `accountReset`. Signed out, nothing is gated here.
 */
export function progressReady(syncedFor: string | null | undefined, userId: string | null | undefined): boolean {
  if (!userId) return true;
  return syncedFor === userId;
}

/**
 * `progressSyncedFor` as a launch should read it. A store persisted by a build
 * before the field existed has no value at all (`undefined`): its progress was
 * kept for the account in `lastUserId` (a different account always reset it),
 * so it counts as that account's rather than making every member wait for a
 * network read on the first launch of this build, offline included.
 */
export function progressSyncedOnLaunch(
  syncedFor: string | null | undefined,
  lastUserId: string | null | undefined,
): string | null {
  return syncedFor === undefined ? (lastUserId ?? null) : syncedFor;
}

/**
 * What Hoy shows in place of the day while her progress is not ready: the
 * read is still on its way (`loading`), or it failed and nothing is in flight
 * (`failed`, with a retry). `ready` once `progressReady` holds.
 */
export type ProgressStatus = "ready" | "loading" | "failed";

export function progressStatus(o: {
  ready: boolean;
  /** The progress query's status (`/api/me/paths`). */
  query: "pending" | "error" | "success";
  fetching: boolean;
}): ProgressStatus {
  if (o.ready) return "ready";
  return o.query === "error" && !o.fetching ? "failed" : "loading";
}

// ── When a session ends ─────────────────────────────────────────────────────

/**
 * Why the app has no session, which decides what happens to what she has not
 * sent yet (R2-L3: an expired session used to wipe the step queue).
 *
 * - `unreachable`: the session could not be read (offline, a 5xx). Nothing
 *   ended; she stays signed in on the persisted profile and nothing is reset.
 *   This was a reset before: on web, every offline launch lost the queue.
 * - `expired`: the server answered that there is no session (expired,
 *   revoked, a 401) without her asking. Her visible data is cleared as on a
 *   sign-out, but her unsent work is held for her account (`holdForSignIn`)
 *   until she signs back in.
 * - `signedOut`: she chose Log out. The existing privacy rule: everything
 *   account-derived goes, held work included.
 * - `deleted`: her account is gone. Everything goes; nothing can be sent.
 */
export type SessionEnd = "unreachable" | "expired" | "signedOut" | "deleted";

/**
 * How long work held for a signed-out account is kept on the phone: one
 * default better-auth session lifetime (7 days). A bound, not a promise: the
 * held words are her answers and drafts, and keeping them indefinitely to
 * avoid a loss is the wrong trade on a phone someone else may pick up.
 * REVIEW-02 lists the number as an owner decision.
 */
export const HELD_FOR_SIGN_IN_MS = 7 * 86_400_000;

/** The session read's error, as better-auth reports it (duck-typed). */
interface SessionErrorLike {
  status?: unknown;
}

/**
 * Classify a missing session. `deliberate` is set by Log out and by account
 * deletion before they end the session (`lib/sessionEnd.ts`). Otherwise
 * better-auth's own report decides: a 401 or a clean "no session" is the
 * server saying it ended; any other error is a read that did not get through.
 */
export function classifySessionEnd(o: {
  error: unknown;
  deliberate: "signedOut" | "deleted" | null;
}): SessionEnd {
  if (o.deliberate) return o.deliberate;
  if (!o.error) return "expired";
  const status = typeof o.error === "object" ? (o.error as SessionErrorLike).status : undefined;
  return status === 401 ? "expired" : "unreachable";
}

/** The store fields a session change reads. */
export type SessionSlice = Pick<
  AppState,
  | "user"
  | "lastUserId"
  | "settings"
  | "pendingSteps"
  | "pendingCheckIns"
  | "pendingFeedback"
  | "drafts"
  | "heldForSignIn"
  | "unseenSafetyCards"
>;

/** A held bundle is usable for `userId` at `now`: hers, and inside its window. */
export function heldUsable(held: HeldForSignIn | null | undefined, userId: string | null, now: number): boolean {
  return (
    !!held &&
    !!userId &&
    held.owner === userId &&
    isInstant(held.heldAt) &&
    isInstant(now) &&
    now - held.heldAt <= HELD_FOR_SIGN_IN_MS
  );
}

/** How many unsent things are held (the recovery notice shows only when there are any). */
export function heldCount(held: HeldForSignIn | null | undefined): number {
  if (!held) return 0;
  return held.pendingSteps.length + held.pendingCheckIns.length + held.pendingFeedback.length;
}

/**
 * What she has sent from this phone that has not reached her account yet: her
 * queued answers (an entry with no owner is the store's account's, as for the
 * flush), check-ins and day feedback.
 *
 * Log out clears all of it (`endSession("signedOut")`), and the Log out dialog
 * used to promise «Tu avance y tus reflexiones se quedan aquí, guardados» over
 * it: an answer given offline was gone after logging out and back in. The
 * dialog now asks first while this is above zero (beta hardening, 3 Nov 2026).
 */
export function unsentCount(
  s: Pick<SessionSlice, "pendingSteps" | "pendingCheckIns" | "pendingFeedback" | "lastUserId">,
  userId: string | null | undefined,
): number {
  if (!userId) return 0;
  const steps = s.pendingSteps.filter((q) => (q.owner ?? s.lastUserId ?? userId) === userId).length;
  return steps + s.pendingCheckIns.length + s.pendingFeedback.length;
}

const sameStep = (a: PendingStep, b: PendingStep) =>
  a.area === b.area && a.day === b.day && a.body.stepId === b.body.stepId;

/** Later entries replace earlier ones for the same step, as `sendStep` does. */
function mergeSteps(older: PendingStep[], newer: PendingStep[]): PendingStep[] {
  return [...older.filter((o) => !newer.some((n) => sameStep(o, n))), ...newer];
}

/**
 * Seal what she has not sent, for her account only. Every held answer is
 * stamped with its owner (`PendingStep.owner`), so no flush under another
 * account can send it even if it ever reached a queue. Merged with anything
 * already held for her (two expiries in a row); anything held for someone
 * else is replaced, as a sign-in by someone else would have purged it.
 * `null` when there is nothing to hold.
 */
export function holdForSignIn(s: SessionSlice, owner: string, now: number): HeldForSignIn | null {
  const prior = s.heldForSignIn?.owner === owner ? s.heldForSignIn : null;
  const stamp = (q: PendingStep): PendingStep => ({ ...q, owner: q.owner ?? owner });
  const held: HeldForSignIn = {
    owner,
    // The window runs from the first hold: a second expiry does not extend it.
    heldAt: prior && isInstant(prior.heldAt) ? prior.heldAt : isInstant(now) ? now : Date.now(),
    pendingSteps: mergeSteps((prior?.pendingSteps ?? []).map(stamp), s.pendingSteps.filter((q) => !q.owner || q.owner === owner).map(stamp)),
    pendingCheckIns: [
      ...(prior?.pendingCheckIns ?? []).filter((c) => !s.pendingCheckIns.some((n) => n.date === c.date)),
      ...s.pendingCheckIns,
    ],
    pendingFeedback: [
      ...(prior?.pendingFeedback ?? []).filter((f) => !s.pendingFeedback.some((n) => n.key === f.key)),
      ...s.pendingFeedback,
    ],
    drafts: { ...(prior?.drafts ?? {}), ...s.drafts },
  };
  // A support card she has not seen yet, for her only (recorded only behind
  // the review gate in `safetyAck.ts`; empty otherwise).
  const cards = [
    ...(prior?.unseenSafetyCards ?? []),
    ...(s.unseenSafetyCards ?? []).filter((u) => u.owner === owner),
  ];
  if (cards.length) held.unseenSafetyCards = cards;
  const empty = heldCount(held) === 0 && Object.keys(held.drafts).length === 0 && !cards.length;
  return empty ? null : held;
}

/**
 * The store after the session ends for `reason`.
 *
 * Someone who has never signed in on this phone is mid-onboarding, and her
 * answers live in this store: nothing is reset for her (the session refetches
 * on every focus, and resetting here once wiped her onboarding).
 */
export function endSession(s: SessionSlice, reason: SessionEnd, now: number): Partial<AppState> {
  if (reason === "unreachable") return {};
  if (reason === "signedOut" || reason === "deleted") {
    return { ...accountReset(s.settings), lastUserId: null, heldForSignIn: null };
  }
  const owner = s.lastUserId ?? s.user?.id ?? null;
  if (!owner) return {};
  return { ...accountReset(s.settings), lastUserId: null, heldForSignIn: holdForSignIn(s, owner, now) };
}

/**
 * The store when `user` has a session.
 *
 * A different account on the same phone is reset on the way in, the half of
 * account isolation that cannot be skipped. Work held for an account comes
 * back only to that account, inside its window; anyone else signing in, or
 * the window passing, purges it (the existing switch rule: the previous
 * person's data does not outlive someone else's sign-in). `restored` is how
 * many queued items came back, so the caller can flush them.
 */
export function startSession(
  s: SessionSlice,
  user: User,
  now: number,
): { patch: Partial<AppState>; restored: number } {
  const base: Partial<AppState> =
    s.lastUserId && s.lastUserId !== user.id
      ? { ...accountReset(s.settings), user, lastUserId: user.id }
      : { user, lastUserId: user.id };
  const held = s.heldForSignIn;
  if (!held) return { patch: base, restored: 0 };
  if (!heldUsable(held, user.id, now)) return { patch: { ...base, heldForSignIn: null }, restored: 0 };
  const steps = base.pendingSteps ?? s.pendingSteps;
  const checkIns = base.pendingCheckIns ?? s.pendingCheckIns;
  const feedback = base.pendingFeedback ?? s.pendingFeedback;
  const drafts = base.drafts ?? s.drafts;
  return {
    patch: {
      ...base,
      heldForSignIn: null,
      pendingSteps: mergeSteps(held.pendingSteps, steps),
      pendingCheckIns: [...held.pendingCheckIns.filter((c) => !checkIns.some((n) => n.date === c.date)), ...checkIns],
      pendingFeedback: [...held.pendingFeedback.filter((f) => !feedback.some((n) => n.key === f.key)), ...feedback],
      drafts: { ...held.drafts, ...drafts },
      ...(held.unseenSafetyCards?.length
        ? { unseenSafetyCards: [...held.unseenSafetyCards, ...(base.unseenSafetyCards ?? s.unseenSafetyCards ?? [])] }
        : {}),
    },
    restored: heldCount(held),
  };
}

/** Purge a held bundle whose window has passed, whoever it belongs to. */
export function expireHeld(held: HeldForSignIn | null | undefined, now: number): HeldForSignIn | null {
  if (!held) return null;
  return isInstant(held.heldAt) && isInstant(now) && now - held.heldAt <= HELD_FOR_SIGN_IN_MS ? held : null;
}
