import {
  answerRecord,
  betaPermitsArea,
  holdsHerAnswer,
  type AnswerState,
  type BetaOpenAreas,
  type DayFeedbackInput,
  type DayStep,
  type DayStepAnswers,
  type DayUnlockRule,
  type Locale,
  type PushPrefKind,
  type SafetyCardDTO,
  type SaveStepInput,
  type SubscriptionDTO,
} from "@elara/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PATH_STRUCTURE } from "@/content/paths";
import type { AreaKey, DayValue } from "@/content/types";
import { useMemo } from "react";
import { LAUNCH_LOCALE, setActiveLocale, strings } from "@/i18n";
import { api, ApiError } from "@/lib/api";
import { dayKey } from "@/lib/dates";
import { qk, queryClient } from "@/lib/query";
import { areaAvailability, type AreaAvailability } from "@/lib/areaAvailability";
import type { NotificationPermission } from "@/lib/notifications";
import { localizeStepAnswers, type PathCopyByLocale } from "@/content/answerLocale";
import { en } from "@/i18n/locales/en";
import { es } from "@/i18n/locales/es";
import { reconcileAnchors } from "@/lib/dayGate";
import { clearDeliberateEnd } from "@/lib/sessionEnd";
import {
  accountSettings,
  endSession,
  expireHeld,
  freshOnboarding,
  progressSyncedOnLaunch,
  startSession,
  type SessionEnd,
} from "./accountState";
import { makePersistStorage } from "./persistStorage";
import {
  markSeen,
  noteUnseen,
  PERSIST_UNSEEN_SAFETY_CARD,
  pruneUnseen,
  restoredCard,
  unseenFor,
  type UnseenSafetyCard,
} from "./safetyAck";
import { flushCheckInQueue, moodFor, sameCheckIn, type CheckInEntry } from "./checkIns";
import { createLocaleSync, refreshForLanguage } from "@/lib/languageSwitch";
import { progressAfterAnswer } from "./stepAnswer";
import { holdsWords, keptAnswer, stepDraftKey } from "@/components/practice/draft";
import {
  belongsTo,
  decideFailure,
  entryKey,
  flushQueueOnce,
  safetyCardOf,
  sameEntry,
  singleFlight,
} from "./stepQueue";

export interface User {
  /** The server's user id — how a screen tells its own content from everyone else's. */
  id: string;
  name: string;
  email: string;
  /** Uploaded avatar URL, or null — screens fall back to initials. */
  avatar: string | null;
  /**
   * A "Skip for now" guest: a real server account with no email or password
   * yet. Everything works; she is asked to save her progress, and signing out
   * would lose it. `name` and `email` are empty.
   */
  isAnonymous: boolean;
}

/** The store's user, from the server's `/api/me`. The one place that mapping lives. */
export function sessionUserFrom(me: {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  isAnonymous: boolean;
}): User {
  return {
    id: me.id,
    name: me.displayName || me.name,
    email: me.email,
    avatar: me.avatarUrl,
    // `=== true`: a server older than guest accounts omits the field.
    isAnonymous: me.isAnonymous === true,
  };
}

export interface PendingStep {
  area: AreaKey;
  day: number;
  body: SaveStepInput;
  /**
   * "I'd rather not do this today": replayed as `declineDay` on the flush, not
   * as a step. `body.stepId` is `DECLINE_ENTRY` and everything else in `body`
   * is ignored; absent on every entry written before declining existed.
   */
  decline?: boolean;
  /**
   * The day's step ids when she declined it, so a refetch before the flush can
   * still show the day as she left it (`overlayPending`). Decline entries only.
   */
  stepIds?: string[];
  /** Identifies this write, so a slow success cannot drop a newer edit of the same step. */
  queuedAt: number;
  /**
   * The account that wrote it. A flush sends only the signed-in account's
   * entries (`stepQueue.belongsTo`). Absent on entries queued by builds
   * before it existed: those belong to the account the store belongs to,
   * because the store is reset whenever the account changes.
   */
  owner?: string;
}

/**
 * Unsent work held for an account whose session ended without her asking
 * (`accountState.endSession`, reason `expired`): the step queue, unsent
 * check-ins and day feedback, and her drafts. Only `owner` can get it back,
 * by signing in again within `HELD_FOR_SIGN_IN_MS`; another account signing
 * in, Log out, deletion or the window passing purges it. Never shown, sent or
 * read by anyone else: nothing renders from it except a count.
 */
export interface HeldForSignIn {
  owner: string;
  heldAt: number;
  pendingSteps: PendingStep[];
  pendingCheckIns: { date: string; mood: string }[];
  pendingFeedback: DayFeedbackInput[];
  drafts: Record<string, unknown>;
  /** Unseen support cards (only ever recorded behind the review gate in `safetyAck.ts`). */
  unseenSafetyCards?: UnseenSafetyCard[];
}

/** One path's progress as the server sends it (`GET /api/me/paths`, and a decline's answer). */
type ServerProgress = {
  area: AreaKey;
  currentDay: number;
  completedDays: number[];
  responses: Record<number, DayValue>;
  stepAnswers?: Record<number, DayStepAnswers>;
  dayCompletedAt?: Record<number, number>;
  startedAt: number;
};

/** The server's copy of one path, keeping a close time only this phone has heard of. */
function fromServer(p: ServerProgress, prev: PathProgress | undefined): PathProgress {
  return {
    currentDay: p.currentDay,
    completedDays: p.completedDays,
    responses: p.responses,
    // Absent from an older API build, and from any day answered before steps
    // existed — an empty map is the correct reading of both, and
    // `stepAnswerFor()` falls back to `responses` for the one-step case.
    stepAnswers: p.stepAnswers ?? {},
    // The server's first completion wins; a day closed here and not yet heard
    // about there keeps the local one; a day an older server closed without
    // one is frozen now (`reconcileAnchors`).
    dayCompletedAt: reconcileAnchors(prev?.dayCompletedAt, p.dayCompletedAt, p.completedDays, p.stepAnswers ?? {}),
    startedAt: p.startedAt,
  };
}

/**
 * Lay what the queue holds over the server's copy (`progress` is fresh and is
 * changed in place). The server is authoritative for everything it has heard
 * about; what it has not:
 *
 * - **an answer**: laid back on top, so a relaunch before the queue drains
 *   still reopens the day on the step after it, with her words in place.
 *   Completion is left to the server: the flush refetches once the queue lands.
 * - **a decline**: the day as she left it, declined and complete, so a refetch
 *   before the flush does not reopen it (and offer its decline again, or let
 *   her half-answer it). Not when the server's copy already holds something of
 *   hers for that day (`holdsHerAnswer`): that decline will be refused, and
 *   the server's copy is the truth.
 */
function overlayPending(progress: Partial<Record<AreaKey, PathProgress>>, pending: readonly PendingStep[]): void {
  for (const q of pending) {
    const p = progress[q.area];
    if (!p) continue;
    const forDay = p.stepAnswers[q.day] ?? {};
    if (q.decline) {
      if (p.completedDays.includes(q.day) || Object.values(forDay).some((a) => holdsHerAnswer(a))) continue;
      const marks: DayStepAnswers = {};
      for (const id of q.stepIds ?? []) marks[id] = { ...answerRecord("declined", null), answeredAt: q.queuedAt };
      const completedDays = [...p.completedDays, q.day].sort((a, b) => a - b);
      p.stepAnswers = { ...p.stepAnswers, [q.day]: { ...forDay, ...marks } };
      p.responses = { ...p.responses, [q.day]: null };
      p.completedDays = completedDays;
      p.dayCompletedAt = { ...(p.dayCompletedAt ?? {}), [q.day]: p.dayCompletedAt?.[q.day] ?? q.queuedAt };
      p.currentDay = Math.max(
        p.currentDay,
        Math.min(Math.max(...completedDays) + 1, PATH_STRUCTURE[q.area].days.length + 1),
      );
      continue;
    }
    if (forDay[q.body.stepId]) continue;
    p.stepAnswers = {
      ...p.stepAnswers,
      [q.day]: { ...forDay, [q.body.stepId]: answerRecord(q.body.state ?? "answered", (q.body.value ?? null) as DayValue) },
    };
  }
}

/** The queue key of a declined day: one per `(area, day)`, never a real step id. */
export const DECLINE_ENTRY = "*";

export interface PathProgress {
  currentDay: number; // next incomplete day (1..7); 8 = complete
  completedDays: number[]; // days finished
  responses: Record<number, DayValue>; // day -> the day's headline answer
  /**
   * day -> every step's answer and Elara's reply to it.
   *
   * The day screen's source of truth. `responses` above is the one-value
   * summary the rest of the app reads, derived from this on every write by
   * `headlineValue()` — the same function the server uses, so the local and
   * remote copies of a day can never disagree about what it says.
   */
  stepAnswers: Record<number, DayStepAnswers>;
  /**
   * day -> when it closed (epoch ms), set once. The next day's unlock counts
   * from here (`useDayGate`): a finished day re-read or re-answered restamps
   * its answers, which must not push tomorrow further away.
   */
  dayCompletedAt?: Record<number, number>;
  startedAt: number;
}

export interface OnboardingState {
  concern: string; // free text from the onboarding question
  answers: Record<string, string>; // clarity audit answers by area
  /**
   * What she typed into Welcome's optional "Your first name", so the letter
   * and the account screen can address her. Local to the phone until she makes
   * an account: it is not part of the draft pushed to the server. Optional so
   * an onboarding persisted before this existed still loads.
   */
  firstName?: string;
  recommendedArea: AreaKey;
  /**
   * The Area she tapped as what takes up the most space, as she said it, even
   * when the closed beta has not opened it and she starts in another (then it
   * differs from `recommendedArea`). A record of her statement, kept apart from
   * where she starts and from what her words suggested; it opens nothing.
   * Optional so an onboarding persisted before this existed still loads.
   */
  statedArea?: AreaKey | null;
  /**
   * The user confirmed the area in step 2, rather than it being guessed from
   * keywords. `processing` checks this before re-deriving, so a deliberate
   * choice is never overwritten by a keyword guess (`recommendArea()`).
   */
  areaConfirmed: boolean;
  /** When the draft last reached the server, or null if it never has. */
  syncedAt: number | null;
  /**
   * The member finished onboarding but the write didn't land — offline, a flaky
   * connection, a 500. Persisted, because the retry has to survive a relaunch:
   * without it the app marked onboarding complete locally, then `/api/me` came
   * back saying otherwise and dropped the member back into the flow they had
   * just finished, with nothing on the server to show for it.
   */
  pendingSync: boolean;
}

export interface Settings {
  eveningCheckIn: boolean;
  showCity: boolean;
  showSeason: boolean;
  allowMessages: boolean;
  pushEnabled: boolean;
  reminderTime: string; // "HH:MM" (24h) for the daily reminder
  guidePersonality: string; // sage | coach | friend | scholar
  /** Which voice she speaks in aloud (see GUIDE_VOICES). */
  guideVoice: string;
  /**
   * Physical feedback on taps. Device-local on purpose — like Reduce Motion,
   * it describes this phone, not this account, so it is deliberately absent
   * from `MeDTO.prefs` and never synced. `partialize` below persists it.
   */
  hapticsEnabled: boolean;
  /**
   * Per-kind push toggles. The global `pushEnabled` still wins when off —
   * these are for the member who wants DMs but not circle activity, who
   * previously could only mute everything (F-29).
   */
  push: Record<PushPrefKind, boolean>;
}

export interface AppState {
  // auth
  user: User | null;
  hasOnboarded: boolean;
  authLoaded: boolean; // has the initial session check resolved?
  /**
   * Which account the persisted slice belongs to. Persisted, and compared on
   * every sign-in so one person's onboarding answers can never greet the next.
   */
  lastUserId: string | null;
  /**
   * End the session on purpose: Log out (`signedOut`, the default) or account
   * deletion (`deleted`). Everything account-derived goes, held work included.
   */
  signOut: (reason?: "signedOut" | "deleted") => void;
  // server sync (populated from the API by SessionSync)
  /** A session for `user`; `null` is a session that ended without her asking (`endSession("expired")`). */
  setSessionUser: (user: User | null) => void;
  /** There is no session, for `reason` (`accountState.classifySessionEnd`). */
  endSession: (reason: SessionEnd) => void;
  /** See `HeldForSignIn`. Persisted; purged on launch once its window has passed. */
  heldForSignIn: HeldForSignIn | null;
  setHasOnboarded: (value: boolean) => void;
  setAuthLoaded: (value: boolean) => void;
  setActiveArea: (area: AreaKey) => void;
  /**
   * Her progress as the server read it. `owner` is the account the read was
   * made for: it marks the progress as hers (`progressSyncedFor`), and a read
   * made for another account than the one signed in here is not applied.
   */
  hydrateProgress: (list: ServerProgress[], owner?: string | null) => void;
  /**
   * The account whose path progress the store holds from a server read, or
   * from her own brand-new account's start. Until it names the signed-in
   * account, no door into a day is offered from the store's progress
   * (`accountState.progressReady`). `undefined` only in a store persisted
   * before it existed (`progressSyncedOnLaunch`).
   */
  progressSyncedFor: string | null | undefined;
  /** A brand-new account's progress is what this phone started (`finalizeOnboarding`). */
  markProgressSynced: (owner: string) => void;

  // entitlement / subscription
  subscription: SubscriptionDTO | null;
  isPremium: boolean;
  setSubscription: (sub: SubscriptionDTO | null) => void;
  /** The one area a free account may walk (server-owned; see MeDTO.freeArea). */
  freeArea: AreaKey;
  setFreeArea: (area: AreaKey) => void;
  /**
   * The closed beta's Money-only rule for this account (server-owned; see
   * `MeDTO.betaOpenAreas`). `undefined` until `/api/me` lands, and then the
   * rule the app always drew applies. Not persisted: it belongs to the account,
   * and a launch without signal fails closed.
   */
  betaOpenAreas: BetaOpenAreas | undefined;
  setBetaOpenAreas: (areas: BetaOpenAreas | undefined) => void;

  // onboarding
  onboarding: OnboardingState;
  setConcern: (text: string) => void;
  setFirstName: (name: string) => void;
  setAuditAnswer: (area: string, answer: string) => void;
  /** `confirmed` marks it as the user's own pick, not a keyword guess. */
  setRecommendedArea: (area: AreaKey, confirmed?: boolean) => void;
  /** What she said matters most (`OnboardingState.statedArea`); a record, never a door. */
  setStatedArea: (area: AreaKey | null) => void;
  /** Record the outcome of a flush attempt (see `lib/onboarding.ts`). */
  setOnboardingSync: (state: { pendingSync: boolean; syncedAt?: number | null }) => void;
  /**
   * Onboarding just finished and Today hasn't greeted her yet (Interaction
   * States spec §3, "First Today visit after onboarding opens with one line
   * from her summary"). Set by `finalizeOnboarding`, cleared by Today the
   * first time it is focused. A flag raised at the end of the flow, rather
   * than "never welcomed", so members who onboarded before it existed are
   * not greeted with a months-old summary. Persisted; account-scoped.
   */
  todayWelcomePending: boolean;
  setTodayWelcomePending: (pending: boolean) => void;

  // paths
  activeArea: AreaKey;
  progress: Record<AreaKey, PathProgress | undefined>;
  startPath: (area: AreaKey) => void;
  saveDayResponse: (area: AreaKey, day: number, value: DayValue) => void;
  completeDay: (area: AreaKey, day: number) => void;
  /** Record one step's answer. `steps` is the day's authored step list. */
  saveStepAnswer: (
    area: AreaKey,
    day: number,
    steps: DayStep[],
    stepId: string,
    value: DayValue,
    /** Absent means `answered`; anything else is the answer and stores no value. */
    state?: AnswerState,
  ) => void;
  /**
   * End a day that allows it at its first screen: every step `declined`, the
   * day complete, locally at once, and queued for the server like a step.
   */
  declineDay: (area: AreaKey, day: number, steps: DayStep[]) => ReturnType<typeof api.declineDay>;
  saveStepReply: (
    area: AreaKey,
    day: number,
    stepId: string,
    reply: string,
    generated: boolean,
    /** The reply invites her to try again (`StepAnswer.retry`). */
    retry?: boolean,
  ) => void;

  // check-ins
  /**
   * Today's check-in, with the day it was made. Read it through
   * `useTodayMood()` (or `moodFor`), never directly: after midnight the stored
   * one is yesterday's. Persisted; builds before the date stored a bare mood,
   * which `moodFor` reads as nothing.
   */
  todayCheckIn: CheckInEntry | null;
  setTodayCheckIn: (mood: string) => void;
  /** The server's mood for `date` (her local day), unless one queued here has not reached it yet. */
  hydrateTodayCheckIn: (date: string, mood: string | null) => void;
  /**
   * Her local day (`dayKey`), as of the last foreground or midnight. Not
   * persisted. SessionSync moves it; anything that shows "today" keys off it
   * so a phone left open overnight does not keep showing yesterday.
   */
  todayKey: string;
  setTodayKey: (key: string) => void;
  /**
   * Check-ins written on this phone that have not reached the server.
   *
   * A check-in used to be `api.addCheckIn().catch(() => {})` — fire and forget,
   * which on a train meant forget. That was survivable while the check-in only
   * coloured a cell in the rhythm strip; it is not survivable now that the
   * streak, the milestones and the moment that celebrates them are all derived
   * from these rows. A day she checked in has to still be a day she checked in
   * after the tunnel.
   *
   * One entry per date (a mood changed twice in an evening replaces itself,
   * exactly as the server's `onConflictDoUpdate` does), persisted, flushed on
   * launch and on every foreground.
   */
  pendingCheckIns: { date: string; mood: string }[];
  /**
   * Unsent input, saved as she types or taps (Interaction States spec: "save
   * every answer and every draft locally … leaving mid-step resumes at the
   * same step with her input kept"). Keyed `area:day:stepId` for a practice
   * step, `chat` for the Ask composer. Opaque to the store: each screen owns
   * the shape of its own draft. Persisted; cleared on sign-out.
   */
  drafts: Record<string, unknown>;
  setDraft: (key: string, draft: unknown | null) => void;
  /** Most recently opened library pieces, newest first. Account-scoped. */
  recentResourceIds: string[];
  recordResourceOpen: (id: string) => void;
  /** Retry the queue. Safe to call concurrently; a failure leaves the queue. */
  flushCheckIns: () => Promise<void>;
  /**
   * The end-of-day "Was today's session useful?" prompt: which days have been
   * asked on this phone (`area:day`, answered or skipped, so walking a day
   * again does not ask twice), and answers that have not reached the server.
   * One entry per prompt `key`: the follow-up replaces the tap. Account-scoped.
   */
  feedbackAsked: string[];
  markFeedbackAsked: (area: AreaKey, day: number) => void;
  pendingFeedback: DayFeedbackInput[];
  sendDayFeedback: (input: DayFeedbackInput) => void;
  flushFeedback: () => Promise<void>;
  /**
   * Step answers written on this phone that have not reached the server.
   *
   * The day screen used to send each answer fire-and-forget, and relaunch
   * replaced local progress with the server's copy wholesale — so a step
   * answered in a tunnel was gone the next time she opened the app. Same shape
   * as `pendingCheckIns`: queued *before* the request, dropped when it lands,
   * persisted, flushed on launch and on every foreground. One entry per step;
   * an edit replaces the entry it supersedes.
   */
  pendingSteps: PendingStep[];
  /**
   * Whether Circle is part of the app, as the server last said
   * (`GET /api/app-config`). Persisted so the tab doesn't flash in and out on
   * launch, and phone-wide rather than account-scoped. False until the first
   * answer: a switch that is off must never show Circle on a fresh install.
   */
  circleEnabled: boolean;
  setCircleEnabled: (value: boolean) => void;
  /**
   * Whether Explore is part of the app (`features.explore`; see
   * `lib/exploreSwitch.ts`). Persisted like `circleEnabled`, but true until the
   * first answer: production shows Explore, and only a server that says
   * otherwise (the beta's core-journey round) hides it.
   */
  exploreEnabled: boolean;
  setExploreEnabled: (value: boolean) => void;
  /** The closed beta is on (`/api/app-config` `features.beta`). Persisted like `circleEnabled`. */
  beta: boolean;
  setBeta: (value: boolean) => void;
  /** The connected Circles feed is on (`features.circleFeed`). Persisted like `beta`. */
  circleFeed: boolean;
  setCircleFeed: (value: boolean) => void;
  /** Public circles, Circles v6.2 (`features.circleTopics`). Persisted like `circleFeed`. */
  circleTopics: boolean;
  setCircleTopics: (value: boolean) => void;
  /** Money weeks 1 and 2 are the 2.5D worlds (`features.world25d`). Persisted like `circleTopics`. */
  world25d: boolean;
  setWorld25d: (value: boolean) => void;
  /**
   * When the next path day opens (`/api/app-config` `practice.dayUnlock`).
   * Persisted, so "Day 3 opens tomorrow at 8:00" holds on an offline launch.
   */
  dayUnlock: DayUnlockRule;
  /** Help's email and the beta feedback form (`/api/app-config` `links`). */
  links: { supportEmail: string | null; betaFeedbackUrl: string | null };
  /** `features.workshopRecording`: recording arrangements are confirmed, so the app may describe them. */
  workshopRecording: boolean;
  setRemoteConfig: (c: {
    dayUnlock: DayUnlockRule;
    links: { supportEmail: string | null; betaFeedbackUrl: string | null };
    workshopRecording?: boolean;
  }) => void;
  /**
   * Send one step answer, through the queue. Resolves with the server's
   * response exactly as `api.saveStep` does; the entry leaves the queue only
   * when this exact write has landed.
   */
  sendStep: (area: AreaKey, day: number, body: SaveStepInput) => ReturnType<typeof api.saveStep>;
  /** Retry the step queue. Replays are `replyless`: the moment for a reply has passed. */
  flushSteps: () => Promise<void>;

  // celebration ledgers
  /**
   * Streak thresholds whose moment has already been spent.
   *
   * This is what makes a celebration exactly-once across every path that can
   * reach it: a check-in written offline fires the beat from local state and
   * writes the threshold here, so when the row finally lands and the
   * authoritative streak comes back the crossing is already spoken for.
   *
   * Persisted, and account-scoped via `milestonesSeededFor`.
   */
  milestonesCelebrated: number[];
  /**
   * The account `milestonesCelebrated` describes, or null if it has never been
   * seeded.
   *
   * Null is not the same as "nothing celebrated yet", and conflating them is
   * the bug this field exists to prevent: a member who reinstalls at 31 days
   * would be handed her 30-day moment for changing phones, which would make the
   * moment mean "this app was reinstalled". So the first streak the app ever
   * sees for an account seeds the ledger with everything already behind her and
   * celebrates none of it. We only mark a crossing we actually witnessed.
   */
  milestonesSeededFor: string | null;
  seedMilestones: (userId: string, behind: number[]) => void;
  markMilestonesCelebrated: (values: number[]) => void;
  /**
   * Days whose completion beat has already played, keyed by area.
   *
   * The spec's "same-day second completion" state: walking back through a
   * finished day and pressing through it moves progress and must not replay the
   * beat. The day's *work* is not awarded twice either — the server sees the day
   * already complete and the step already answered — though today does count
   * toward her rhythm, because she did sit down and do it today.
   *
   * Persisted deliberately, unlike `progress` itself: progress is rehydrated
   * from the server on launch, so a ledger that reset with the process would
   * let a relaunch replay a beat.
   */
  daysCelebrated: Record<string, number[]>;
  markDayCelebrated: (area: AreaKey, day: number) => void;
  /**
   * The last local date on which this phone saw her do something meaningful.
   *
   * The client half of the rhythm. The server decides what her streak *is* — it
   * holds `eligible_day` and derives the number — but the beat that marks a
   * threshold has to fire on the tap, offline, before any request (see
   * docs/CELEBRATION.md §5). So this is the local answer to the one question
   * that beat needs: "is this the first meaningful thing she has done today?"
   *
   * One date rather than a list, because that is the whole question. A member who
   * practised on Monday and comes back on Thursday has a `lastEligibleDay` of
   * Monday, which is not today, which is all `markEligibleDay` needs to know.
   *
   * Persisted and account-scoped. Carried across a sign-out it would suppress the
   * next member's first beat of the day.
   */
  lastEligibleDay: string | null;
  /**
   * Record that she did something meaningful on `date`. True when it is the
   * first of that day — the caller raises the rhythm beat only then.
   */
  markEligibleDay: (date: string) => boolean;

  /**
   * A path stopped by the safety screen, keyed by area: the fixed card that
   * stopped it, and when (Interaction States spec §8, "the Path does not
   * continue that session").
   *
   * "That session" is this run of the app, capped at `SAFETY_PAUSE_MS`: never
   * persisted, so a relaunch is a new session, and a phone left with the app
   * in memory overnight is not stopped for days. While it holds, the day
   * screen shows the card again instead of continuing, whichever door she
   * comes back through (Today's Continue, a notification, the Paths list).
   */
  safetyPauses: Partial<Record<string, { card: SafetyCardDTO; at: number }>>;
  pauseForSafety: (area: AreaKey, card: SafetyCardDTO) => void;
  /**
   * Cards that arrived and have not been shown yet, kept across a restart:
   * account, Area, tier and time only. Recorded only while the review gate
   * `PERSIST_UNSEEN_SAFETY_CARD` is on (it is off; see `safetyAck.ts`), so
   * the rule above, never persisted, still holds on this branch.
   */
  unseenSafetyCards: UnseenSafetyCard[];
  /** The day screen showed the stop for `area`: it is seen, and the in-memory pause carries it. */
  acknowledgeSafetyCard: (area: AreaKey) => void;

  // settings
  settings: Settings;
  setSetting: (key: keyof Settings, value: boolean) => void;
  setSettings: (settings: Partial<Settings>) => void;

  /**
   * What the OS says about notifications for this app, as of the last read.
   *
   * Never persisted, and deliberately separate from `settings.pushEnabled` and
   * `settings.eveningCheckIn`: those are what the member *wants*, this is what
   * the phone will actually allow. Conflating the two is how the app came to
   * tell someone who had just tapped "Don't Allow" that they'd be reminded
   * every day. It starts as "undetermined" and is corrected by the first read.
   */
  notificationPermission: NotificationPermission;
  setNotificationPermission: (value: NotificationPermission) => void;
  /**
   * When the in-app "shall we remind you?" primer was last shown, or null.
   *
   * Device-local and deliberately *not* cleared by `accountReset`: the OS
   * permission it leads to belongs to the phone, not the account, and asking a
   * second person on the same handset to grant something already granted is
   * noise. Persisted, because the whole point is to ask exactly once.
   */
  pushPrimerShownAt: number | null;
  /**
   * Captions on Ale's videos ("Subtítulos"). On until she turns them off, and
   * remembered — per phone, like `hapticsEnabled`, so not cleared on sign-out.
   */
  subtitlesOn: boolean;
  setSubtitlesOn: (on: boolean) => void;
  /**
   * Voice-note speed (1, 1.5 or 2), remembered like a messaging app does:
   * pick 1.5× once and every voice note after plays at 1.5×. Per phone, like
   * `subtitlesOn`.
   */
  voiceNoteRate: number;
  setVoiceNoteRate: (rate: number) => void;
  /**
   * The ambient bed under the daily path (`lib/ambientPlayer`): `unset` until
   * she has answered the one-time prompt, then `on` or `off`. Per phone, like
   * `subtitlesOn`, so not cleared on sign-out and not sent to the server.
   */
  ambientSound: "unset" | "on" | "off";
  setAmbientSound: (pref: "unset" | "on" | "off") => void;
  markPushPrimerShown: () => void;

  /**
   * The language the app is rendered in.
   *
   * Device-local *and* account-synced, which no other preference is, because it
   * is the only one that has to be answerable before there is an account: the
   * picker sits on the welcome screen, and someone who switches to Spanish
   * there has to still be reading Spanish three screens later when they create
   * the account. So it is persisted like `hapticsEnabled`, survives sign-out
   * like `hapticsEnabled`, and is *also* pushed to the profile so the 8pm
   * reminder and the guide's replies agree with it.
   */
  locale: Locale;
  /**
   * Whether `locale` is a choice or a guess.
   *
   * `locale` is `LAUNCH_LOCALE` until she toggles. Only a toggled value is
   * trusted from storage: anything stored without a choice (builds that seeded
   * it from the phone's language) is a guess and is reset to Spanish.
   */
  localeChosen: boolean;
  /** Record a deliberate pick. Persists it, and tells the server if signed in. */
  setLocale: (locale: Locale) => void;
}

/**
 * Initials for the avatar fallback. There is deliberately no default avatar
 * image: the previous one hotlinked a real person's Google profile photo.
 */
export function initialsFor(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PATH_COPY: PathCopyByLocale = { en: en.pathContent.byArea, es: es.pathContent.byArea };

/**
 * Every area's stored picks, in `locale`'s option labels. The same object when
 * nothing moved, so a language change that touches no answer re-renders nothing.
 */
function localizeProgress(progress: AppState["progress"], locale: Locale): AppState["progress"] {
  let changed = false;
  const out = { ...progress };
  for (const area of Object.keys(progress) as AreaKey[]) {
    const p = progress[area];
    if (!p?.stepAnswers) continue;
    const stepAnswers = localizeStepAnswers(area, p.stepAnswers, locale, PATH_COPY);
    if (stepAnswers !== p.stepAnswers) {
      out[area] = { ...p, stepAnswers };
      changed = true;
    }
  }
  return changed ? out : progress;
}

function freshProgress(): PathProgress {
  return {
    currentDay: 1,
    completedDays: [],
    responses: {},
    stepAnswers: {},
    startedAt: Date.now(),
  };
}

/**
 * Step answers whose own live request has not settled yet (`sendStep`). A
 * flush leaves these to that request rather than sending them a second time.
 */
const stepsInFlight = new Set<string>();

/**
 * One flush of the step queue at a time (`stepQueue.ts`): SessionSync and
 * `useSavingPlace` both call it, and before this two overlapping passes sent
 * every queued answer twice.
 *
 * Oldest first. A `day_locked` entry holds back that day and the later days
 * of the same path only; an earlier day of it, and every other path, still
 * go. The network, a 5xx or a rate limit ends the pass; a refusal is dropped
 * (a refused decline included: the refetch below restores the server's copy
 * of that day). See `stepQueue.decideFailure`.
 */
const flushStepsOnce = singleFlight(async () => {
  const get = useAppStore.getState;
  if (!get().pendingSteps.length) return;
  await flushQueueOnce<PendingStep>({
    read: () => get().pendingSteps,
    inFlight: (entry) => stepsInFlight.has(entryKey(entry)),
    // Only the signed-in account's answers, under its own session.
    sendable: (entry) => belongsTo(entry.owner, get().lastUserId, get().user?.id ?? null),
    // A declined day is replayed as the decline it was, never as a step.
    // `queued`: these words may never have reached the server, so its
    // safety screen records and alerts as for a live answer
    // (`replyless` alone is a replay of something already screened).
    send: (entry) =>
      entry.decline
        ? api.declineDay(entry.area, entry.day, { localDate: entry.body.localDate })
        : api.saveStep(entry.area, entry.day, { ...entry.body, replyless: true, queued: true }),
    // Words written offline that match the safety list get the same fixed
    // card as a live answer, and the Path stops there as it would have
    // (spec §04): the card shows the next time she opens that Path.
    onLanded: (entry, result) => {
      const card = safetyCardOf<SafetyCardDTO>(result);
      if (card) get().pauseForSafety(entry.area, card);
    },
    // Refused for good (a week that locked under her, a step the content no
    // longer has, a shape it no longer takes): her words go back to the step
    // as its draft, marked refused, instead of leaving with the entry. Not
    // over a newer draft (she has typed since), and not for a decline or an
    // empty skip, which carry no words.
    onDropped: (entry, err) => {
      if (entry.decline || !holdsWords(entry.body.value)) return;
      const key = stepDraftKey(entry.area, entry.day, entry.body.stepId);
      if (get().drafts[key]) return;
      const e = (err && typeof err === "object" ? err : {}) as { code?: unknown; status?: unknown };
      const code = typeof e.code === "string" ? e.code : String(e.status ?? "refused");
      get().setDraft(key, keptAnswer(entry.body.value ?? null, code));
    },
    // Exactly this write. Two entries queued in the same tick share a
    // `queuedAt` (a lead card and the step under it), and removing by
    // `queuedAt` alone took the second one out unsent (`stepQueue.ts`).
    remove: (entry) =>
      useAppStore.setState((s) => ({ pendingSteps: s.pendingSteps.filter((q) => !sameEntry(q, entry)) })),
  });
  // Completion is computed server-side; re-read it now the answers are there
  // (and a refused decline's day as the server has it).
  queryClient.invalidateQueries({ queryKey: qk.myPaths });
});

/**
 * One flush of the check-in queue at a time: SessionSync's foreground flush,
 * a sign-in's restore and every mood tap all call it. Each pass re-reads the
 * queue, so a mood tapped during a pass goes in it, and removes exactly what
 * landed (`checkIns.ts`). The date goes on the wire: replaying yesterday's
 * check-in must not file it under today.
 */
const flushCheckInsOnce = singleFlight(async () => {
  const get = useAppStore.getState;
  if (!get().pendingCheckIns.length) return;
  const landed = await flushCheckInQueue({
    read: () => get().pendingCheckIns,
    send: (entry) => api.addCheckIn({ mood: entry.mood, date: entry.date }),
    remove: (entry) =>
      useAppStore.setState((s) => ({ pendingCheckIns: s.pendingCheckIns.filter((c) => !sameCheckIn(c, entry)) })),
  });
  if (!landed) return;
  // The streak is derived from these rows, so it is stale the moment one
  // lands — including the `current` the milestone check reads.
  queryClient.invalidateQueries({ queryKey: qk.streak });
  queryClient.invalidateQueries({ queryKey: qk.checkins });
});

/** How long a language switch waits for the server to hear about it before re-asking anyway. */
const LOCALE_PATCH_TIMEOUT_MS = 6_000;

const localeSync = createLocaleSync({
  send: (locale) => api.updateMe({ locale }),
  refresh: (locale) => refreshForLanguage(queryClient, locale),
  timeoutMs: LOCALE_PATCH_TIMEOUT_MS,
});

/** Send a language switch the server never heard about, and refresh once it has (SessionSync, on foreground). */
export const retryLocaleSync = () => localeSync.retry();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      hasOnboarded: false,
      authLoaded: false,

      lastUserId: null,

      signOut: (reason = "signedOut") => {
        set((s) => endSession(s, reason, Date.now()));
        clearDeliberateEnd();
      },

      heldForSignIn: null,
      endSession: (reason) => set((s) => endSession(s, reason, Date.now())),

      setSessionUser: (user) => {
        // No session, and nobody said why: the server ended it (expired,
        // revoked). Her unsent work is held for her account rather than
        // wiped (R2-L3). Someone who has never signed in on this phone is
        // mid-onboarding, and nothing is reset for her (`endSession`).
        if (!user) {
          get().endSession("expired");
          return;
        }
        // A different account on the same phone. Sign-out clears state on the
        // way out, but it is not the only way a session ends — an expired or
        // revoked session, a reinstall over existing storage, or a crash mid
        // sign-out all leave the previous person's persisted slice behind.
        // Clearing on the way *in* is the half that cannot be skipped. Work
        // held for an account comes back only to that account (`startSession`).
        let restored = 0;
        set((s) => {
          const next = startSession(s, user, Date.now());
          restored = next.restored;
          return next.patch;
        });
        // Her answers are back in the queue: send them now, under her session.
        if (restored > 0) {
          void get().flushSteps();
          void get().flushCheckIns();
          void get().flushFeedback();
        }
      },
      setHasOnboarded: (value) => set({ hasOnboarded: value }),
      setAuthLoaded: (value) => set({ authLoaded: value }),
      setActiveArea: (area) => set({ activeArea: area }),
      progressSyncedFor: undefined,
      markProgressSynced: (owner) => set({ progressSyncedFor: owner }),
      hydrateProgress: (list, owner) =>
        set((s) => {
          // A read made for another account (a session that changed while it
          // was in flight) is not hers: the read for her is on its way.
          if (owner && s.user && s.user.id !== owner) return {};
          const progress = {} as AppState["progress"];
          for (const p of list) progress[p.area] = fromServer(p, s.progress[p.area]);
          // What the queue holds and the server has not heard about, laid back
          // on top (`overlayPending`): an answer, so a relaunch before the
          // queue drains still reopens the day on the step after it, with her
          // words in place; a decline, so the day stays as she left it.
          // Completion is left to the server: the flush invalidates this query
          // once the queue lands.
          overlayPending(progress, s.pendingSteps);
          return {
            progress: localizeProgress(progress, s.locale),
            ...(owner ? { progressSyncedFor: owner } : {}),
          };
        }),

      subscription: null,
      isPremium: false,
      setSubscription: (sub) => set({ subscription: sub, isPremium: !!sub?.isPremium }),
      freeArea: "money",
      setFreeArea: (area) => set({ freeArea: area }),
      betaOpenAreas: undefined,
      setBetaOpenAreas: (areas) => set({ betaOpenAreas: areas }),

      onboarding: freshOnboarding(),
      todayWelcomePending: false,
      setTodayWelcomePending: (pending) => set({ todayWelcomePending: pending }),
      setConcern: (text) =>
        set((s) => ({ onboarding: { ...s.onboarding, concern: text } })),
      setFirstName: (name) =>
        set((s) => ({ onboarding: { ...s.onboarding, firstName: name } })),
      setAuditAnswer: (area, answer) =>
        set((s) => ({
          onboarding: {
            ...s.onboarding,
            answers: { ...s.onboarding.answers, [area]: answer },
          },
        })),
      setOnboardingSync: ({ pendingSync, syncedAt }) =>
        set((s) => ({
          onboarding: {
            ...s.onboarding,
            pendingSync,
            syncedAt: syncedAt !== undefined ? syncedAt : s.onboarding.syncedAt,
          },
        })),
      setStatedArea: (area) =>
        set((s) => ({ onboarding: { ...s.onboarding, statedArea: area } })),
      setRecommendedArea: (area, confirmed = false) =>
        set((s) => ({
          onboarding: {
            ...s.onboarding,
            recommendedArea: area,
            areaConfirmed: s.onboarding.areaConfirmed || confirmed,
          },
        })),

      activeArea: "money",
      progress: { money: freshProgress() } as AppState["progress"],
      startPath: (area) => {
        // An Area the beta has not opened is never started from here, whichever
        // screen asked: the server would refuse it (`area_closed_beta`), and a
        // refused start must not leave her "in" an Area she cannot answer.
        const open = get();
        if (!betaPermitsArea(open.beta, open.betaOpenAreas, area)) return;
        set((s) => ({
          activeArea: area,
          progress: { ...s.progress, [area]: s.progress[area] ?? freshProgress() },
        }));
        // durability: ensure the server has this path row
        api.startPath(area).catch(() => {});
      },
      /**
       * Record one step's answer locally, and re-derive everything that hangs
       * off it.
       *
       * Optimistic and offline-safe: the screen moves on the instant this
       * returns, and the network write is the caller's problem. The completion
       * rule is `allStepsAnswered` — the same function the server applies to
       * the same authored steps — so a member who answers two of three steps on
       * a plane comes back to a day that is genuinely still open, here and on
       * the server, rather than to two views that disagree.
       */
      saveStepAnswer: (area, day, steps, stepId, value, state = "answered") =>
        set((s) => ({
          progress: {
            ...s.progress,
            [area]: progressAfterAnswer(s.progress[area] ?? freshProgress(), {
              day,
              steps,
              stepId,
              value,
              state,
              now: Date.now(),
              totalDays: PATH_STRUCTURE[area].days.length,
            }),
          },
        })),

      declineDay: (area, day, steps) => {
        const queuedAt = Date.now();
        set((s) => {
          const p = s.progress[area] ?? freshProgress();
          const marks: DayStepAnswers = {};
          for (const step of steps) marks[step.id] = { ...answerRecord("declined", null), answeredAt: queuedAt };
          // Complete at once, as a finished day is: the path moves on and the
          // next day's gate counts from now. The server holds the same rule.
          const completedDays = p.completedDays.includes(day)
            ? p.completedDays
            : [...p.completedDays, day].sort((a, b) => a - b);
          return {
            progress: {
              ...s.progress,
              [area]: {
                ...p,
                stepAnswers: { ...p.stepAnswers, [day]: { ...(p.stepAnswers[day] ?? {}), ...marks } },
                responses: { ...p.responses, [day]: null },
                completedDays,
                dayCompletedAt: p.dayCompletedAt?.[day]
                  ? p.dayCompletedAt
                  : { ...(p.dayCompletedAt ?? {}), [day]: queuedAt },
                currentDay: Math.min(Math.max(...completedDays) + 1, PATH_STRUCTURE[area].days.length + 1),
              },
            },
          };
        });
        // The same offline guarantee a step has: kept until the server has it,
        // sent by this account only, and left by a flush to this request while
        // it is in flight (`sendStep`).
        const localDate = dayKey(new Date());
        const same = (q: PendingStep) => q.area === area && q.day === day && !!q.decline;
        const owner = get().user?.id;
        const entry: PendingStep = {
          area,
          day,
          body: { stepId: DECLINE_ENTRY, localDate },
          decline: true,
          stepIds: steps.map((st) => st.id),
          queuedAt,
          ...(owner ? { owner } : {}),
        };
        set((s) => ({ pendingSteps: [...s.pendingSteps.filter((q) => !same(q)), entry] }));
        const mine = (q: PendingStep) => sameEntry(q, entry);
        const key = entryKey(entry);
        stepsInFlight.add(key);
        const request = api.declineDay(area, day, { localDate });
        void request.catch(() => {}).finally(() => stepsInFlight.delete(key));
        request
          .then((res) => {
            // The server's copy of the path, with anything else still queued
            // laid over it, replaces the optimistic one.
            set((s) => {
              const pendingSteps = s.pendingSteps.filter((q) => !mine(q));
              const progress = { ...s.progress, [area]: fromServer(res.progress, s.progress[area]) };
              overlayPending(progress, pendingSteps);
              return {
                pendingSteps,
                progress: localizeProgress(progress, s.locale),
                // Landed after the session ended and the entry was held: not
                // hers to send again on sign-in.
                ...(s.heldForSignIn?.pendingSteps.some(mine)
                  ? { heldForSignIn: { ...s.heldForSignIn, pendingSteps: s.heldForSignIn.pendingSteps.filter((q) => !mine(q)) } }
                  : {}),
              };
            });
            queryClient.invalidateQueries({ queryKey: qk.myPaths });
          })
          .catch((err: unknown) => {
            // Refused (she had answered on another device, the day does not
            // allow it): it never will succeed. Dropped, and the server's copy
            // of the day is fetched again, which replaces the optimistic close.
            // Anything else stays queued for the flush.
            if (decideFailure(err) !== "drop") return;
            set((s) => ({ pendingSteps: s.pendingSteps.filter((q) => !mine(q)) }));
            queryClient.invalidateQueries({ queryKey: qk.myPaths });
          });
        return request;
      },

      /** Attach Elara's reply to a step already answered. */
      saveStepReply: (area, day, stepId, reply, generated, retry) =>
        set((s) => {
          const p = s.progress[area];
          const held = p?.stepAnswers[day]?.[stepId];
          if (!p || !held) return {};
          return {
            progress: {
              ...s.progress,
              [area]: {
                ...p,
                stepAnswers: {
                  ...p.stepAnswers,
                  [day]: {
                    ...p.stepAnswers[day],
                    [stepId]: { ...held, reply, generated, repliedAt: Date.now(), retry: retry || undefined },
                  },
                },
              },
            },
          };
        }),

      saveDayResponse: (area, day, value) =>
        set((s) => {
          const p = s.progress[area] ?? freshProgress();
          return {
            progress: {
              ...s.progress,
              [area]: { ...p, responses: { ...p.responses, [day]: value } },
            },
          };
        }),
      completeDay: (area, day) => {
        const value = get().progress[area]?.responses[day];
        set((s) => {
          const p = s.progress[area] ?? freshProgress();
          if (p.completedDays.includes(day)) return {};
          const completedDays = [...p.completedDays, day].sort((a, b) => a - b);
          // The bundled structure, not the fetched content: this is a bound on a
          // day number, and the two always have the same seven days.
          const currentDay = Math.min(day + 1, PATH_STRUCTURE[area].days.length + 1);
          return {
            progress: { ...s.progress, [area]: { ...p, completedDays, currentDay } },
          };
        });
        // durability: write-through to the server (best-effort)
        //
        // The same request is what tells the server the member has moved on, so
        // it is also what starts the next day's personalised question. Re-fetch
        // the overlay once it lands — but only the overlay, and only on success:
        // a failed save leaves the member on authored copy, which is exactly
        // what they are already looking at.
        api
          .saveDay(area, day, { value: value ?? undefined, complete: true })
          // Prefix-only, so both languages' overlays refresh — a member who
          // switched language mid-path has a cached entry under each.
          .then(() => queryClient.invalidateQueries({ queryKey: ["pathQuestions"] }))
          .catch(() => {});
      },

      todayCheckIn: null,
      setTodayCheckIn: (mood) => {
        // The member's own local date, not the server's idea of today: an
        // evening check-in in IST belongs to that evening, which is the same
        // trap `services/checkins.ts` documents on the other side of the wire.
        const date = dayKey(new Date());
        set((s) => ({
          todayCheckIn: { date, mood },
          todayKey: date,
          // Queued before the request, not after it fails. A request that never
          // settles — the plane, not the 500 — has no failure callback to hook.
          pendingCheckIns: [
            ...s.pendingCheckIns.filter((c) => c.date !== date),
            { date, mood },
          ],
        }));
        void get().flushCheckIns();
      },
      hydrateTodayCheckIn: (date, mood) =>
        set((s) => {
          // A mood tapped here that the server has not heard about yet is the
          // newer one: a refetch that lands first must not undo it.
          const queued = s.pendingCheckIns.find((c) => c.date === date);
          const next = queued?.mood ?? mood;
          return { todayCheckIn: next ? { date, mood: next } : null };
        }),
      todayKey: dayKey(new Date()),
      setTodayKey: (key) => set((s) => (s.todayKey === key ? {} : { todayKey: key })),

      drafts: {},
      setDraft: (key, draft) =>
        set((s) => {
          if (draft == null) {
            if (!(key in s.drafts)) return {};
            const { [key]: _gone, ...rest } = s.drafts;
            return { drafts: rest };
          }
          return { drafts: { ...s.drafts, [key]: draft } };
        }),
      recentResourceIds: [],
      recordResourceOpen: (id) =>
        set((s) => ({
          recentResourceIds: [id, ...s.recentResourceIds.filter((item) => item !== id)].slice(0, 6),
        })),

      pendingCheckIns: [],
      flushCheckIns: () => flushCheckInsOnce(),

      feedbackAsked: [],
      markFeedbackAsked: (area, day) =>
        set((s) => {
          const key = `${area}:${day}`;
          return s.feedbackAsked.includes(key) ? {} : { feedbackAsked: [...s.feedbackAsked, key] };
        }),
      pendingFeedback: [],
      sendDayFeedback: (input) => {
        // Queued before the request, like a check-in: a request that never
        // settles has no failure to hook.
        set((s) => ({ pendingFeedback: [...s.pendingFeedback.filter((f) => f.key !== input.key), input] }));
        void get().flushFeedback();
      },
      flushFeedback: async () => {
        for (const entry of get().pendingFeedback) {
          try {
            await api.sendDayFeedback(entry);
          } catch (e) {
            // Only a body the server rejected as invalid is dropped; anything
            // else (offline, signed out, a 404 from an API not yet deployed)
            // waits for the next flush.
            if (!(e instanceof ApiError && (e.status === 400 || e.status === 413 || e.status === 422))) return;
          }
          // Only the version that was sent: a follow-up queued meanwhile stays.
          set((s) => ({ pendingFeedback: s.pendingFeedback.filter((f) => f !== entry) }));
        }
      },

      circleEnabled: false,
      setCircleEnabled: (value) => set({ circleEnabled: value }),
      exploreEnabled: true,
      setExploreEnabled: (value) => set({ exploreEnabled: value }),
      beta: false,
      setBeta: (value) => set({ beta: value }),
      circleFeed: false,
      setCircleFeed: (value) => set({ circleFeed: value }),
      circleTopics: false,
      setCircleTopics: (value) => set({ circleTopics: value }),
      world25d: false,
      setWorld25d: (value) => set({ world25d: value }),
      dayUnlock: { kind: "open" },
      links: { supportEmail: null, betaFeedbackUrl: null },
      workshopRecording: false,
      setRemoteConfig: ({ dayUnlock, links, workshopRecording = false }) => set({ dayUnlock, links, workshopRecording }),

      pendingSteps: [],
      sendStep: (area, day, body) => {
        const queuedAt = Date.now();
        // Stamped here, once, at the moment she answered — not by the caller and
        // not on the flush. A step written in a tunnel on Tuesday is Tuesday's
        // practice, and `flushSteps` replays this body unchanged on Thursday.
        body = { localDate: dayKey(new Date()), ...body };
        const same = (q: PendingStep) =>
          q.area === area && q.day === day && q.body.stepId === body.stepId;
        const owner = get().user?.id;
        set((s) => ({
          pendingSteps: [
            ...s.pendingSteps.filter((q) => !same(q)),
            { area, day, body, queuedAt, ...(owner ? { owner } : {}) },
          ],
        }));
        const key = entryKey({ area, day, body, queuedAt });
        stepsInFlight.add(key);
        const request = api.saveStep(area, day, body);
        void request.catch(() => {}).finally(() => stepsInFlight.delete(key));
        request
          .then((res) => {
            const landed = (q: PendingStep) => same(q) && q.queuedAt === queuedAt;
            set((s) => ({
              pendingSteps: s.pendingSteps.filter((q) => !landed(q)),
              // Landed after the session ended and the entry was held: it is
              // not hers to send again on sign-in.
              ...(s.heldForSignIn?.pendingSteps.some(landed)
                ? { heldForSignIn: { ...s.heldForSignIn, pendingSteps: s.heldForSignIn.pendingSteps.filter((q) => !landed(q)) } }
                : {}),
            }));
            // The day screen waits STEP_REPLY_TIMEOUT_MS (6 s) for this answer
            // and moves on without it. On a slow connection the support card
            // arrived after that and was dropped: the server had recorded the
            // flag, she never saw the helpline, and the Path went on. The card
            // is applied here, whenever it arrives (same as a live one).
            const card = safetyCardOf<SafetyCardDTO>(res);
            if (card) get().pauseForSafety(area, card);
          })
          // A failure leaves the entry for the next flush; the caller has its own handling.
          .catch(() => {});
        return request;
      },
      flushSteps: () => flushStepsOnce(),

      milestonesCelebrated: [],
      milestonesSeededFor: null,
      seedMilestones: (userId, behind) =>
        set((s) =>
          // Once per account. A second call would re-seed from a streak that has
          // since grown and silently retire a milestone nobody has been shown.
          s.milestonesSeededFor === userId
            ? {}
            : { milestonesSeededFor: userId, milestonesCelebrated: [...behind] },
        ),
      markMilestonesCelebrated: (values) =>
        set((s) => ({
          milestonesCelebrated: [...new Set([...s.milestonesCelebrated, ...values])].sort(
            (a, b) => a - b,
          ),
        })),

      safetyPauses: {},
      pauseForSafety: (area, card) =>
        set((s) => {
          const now = Date.now();
          const owner = s.user?.id;
          return {
            safetyPauses: { ...s.safetyPauses, [area]: { card, at: now } },
            ...(PERSIST_UNSEEN_SAFETY_CARD && owner
              ? { unseenSafetyCards: noteUnseen(s.unseenSafetyCards, owner, area, card, now) }
              : {}),
          };
        }),
      unseenSafetyCards: [],
      acknowledgeSafetyCard: (area) =>
        set((s) => {
          const owner = s.user?.id;
          const unseen = unseenFor(s.unseenSafetyCards, owner, area, Date.now(), SAFETY_PAUSE_MS);
          if (!owner || !unseen) return {};
          const held = s.safetyPauses[area];
          return {
            unseenSafetyCards: markSeen(s.unseenSafetyCards, owner, area),
            // A restored stop keeps holding for the rest of this run, from when the card arrived.
            safetyPauses: held
              ? s.safetyPauses
              : { ...s.safetyPauses, [area]: { card: restoredSafetyCard(unseen.tier), at: unseen.at } },
          };
        }),

      lastEligibleDay: null,
      markEligibleDay: (date) => {
        if (get().lastEligibleDay === date) return false;
        set({ lastEligibleDay: date });
        return true;
      },

      daysCelebrated: {},
      markDayCelebrated: (area, day) =>
        set((s) => {
          const seen = s.daysCelebrated[area] ?? [];
          if (seen.includes(day)) return {};
          return {
            daysCelebrated: { ...s.daysCelebrated, [area]: [...seen, day].sort((a, b) => a - b) },
          };
        }),

      // Server defaults; SessionSync overwrites all but `hapticsEnabled` with
      // what the account actually has as soon as /api/me lands.
      settings: { ...accountSettings(), hapticsEnabled: true },
      setSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),
      setSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),

      notificationPermission: "undetermined",
      setNotificationPermission: (value) => set({ notificationPermission: value }),

      pushPrimerShownAt: null,
      subtitlesOn: true,
      setSubtitlesOn: (on) => set({ subtitlesOn: on }),
      voiceNoteRate: 1,
      setVoiceNoteRate: (rate) => set({ voiceNoteRate: rate }),
      ambientSound: "unset",
      setAmbientSound: (pref) => set({ ambientSound: pref }),
      markPushPrimerShown: () => set({ pushPrimerShownAt: Date.now() }),

      // Spanish until she picks otherwise; the persisted value replaces this on
      // rehydrate only if there ever was a choice (see `onRehydrateStorage`).
      locale: LAUNCH_LOCALE,
      localeChosen: false,
      setLocale: (locale) => {
        if (get().locale === locale && get().localeChosen) return;
        // Her earlier picks follow the language (`content/answerLocale.ts`).
        set((s) => ({ locale, localeChosen: true, progress: localizeProgress(s.progress, locale) }));
        // Move the live copy every non-component caller reads. Doing it here
        // rather than only in the `_layout` subscription means the language
        // changes on the same frame as the tap, not a tick later.
        setActiveLocale(locale);
        // Tell the server first, then re-ask for what it wrote in the old
        // language (`createLocaleSync`). A signed-out member has no profile
        // to write to yet; one whose PATCH fails still gets the language they
        // asked for, and the next foreground sends it again.
        void localeSync.change(locale, !!get().user);
      },
    }),
    {
      name: "elara-app",
      storage: createJSONStorage(makePersistStorage),
      // Durable UI state, plus the last copy of path progress (see below) —
      // never the session user.
      partialize: (s) => ({
        settings: s.settings,
        onboarding: s.onboarding,
        todayWelcomePending: s.todayWelcomePending,
        todayCheckIn: s.todayCheckIn,
        // A queued check-in and the moments derived from it both have to
        // survive a relaunch, or an app killed in a tunnel loses the day and
        // then celebrates it twice when the row is written by hand.
        pendingCheckIns: s.pendingCheckIns,
        drafts: s.drafts,
        recentResourceIds: s.recentResourceIds,
        // Path progress is refreshed from the server on every launch, but a
        // launch without signal has nothing else to show: without this an
        // offline relaunch opened on Day 1. Kept with the queue that feeds it,
        // so an answer given offline is still on screen after a restart.
        progress: s.progress,
        // Whose that progress is, so an offline relaunch can still offer her day.
        progressSyncedFor: s.progressSyncedFor,
        activeArea: s.activeArea,
        pendingSteps: s.pendingSteps,
        // Only behind the review gate (off): see `safetyAck.ts`.
        ...(PERSIST_UNSEEN_SAFETY_CARD ? { unseenSafetyCards: s.unseenSafetyCards } : {}),
        // Held for a signed-out account, so a relaunch before she signs back in
        // keeps it (within its window; purged on rehydrate once it has passed).
        heldForSignIn: s.heldForSignIn,
        pendingFeedback: s.pendingFeedback,
        feedbackAsked: s.feedbackAsked,
        circleEnabled: s.circleEnabled,
        exploreEnabled: s.exploreEnabled,
        // The last known answer, so a cold launch can fetch Ask Elara and
        // Circles at once instead of waiting on `/me/subscription` first. The
        // server still decides (a lapsed member gets `premium_required` and the
        // gate), the launch refresh corrects it, and `accountReset` clears it
        // on sign-out or a different account.
        isPremium: s.isPremium,
        beta: s.beta,
        circleFeed: s.circleFeed,
        circleTopics: s.circleTopics,
        world25d: s.world25d,
        dayUnlock: s.dayUnlock,
        links: s.links,
        workshopRecording: s.workshopRecording,
        milestonesCelebrated: s.milestonesCelebrated,
        milestonesSeededFor: s.milestonesSeededFor,
        daysCelebrated: s.daysCelebrated,
        lastEligibleDay: s.lastEligibleDay,
        // Persisted alongside the data it guards — a `lastUserId` that reset on
        // relaunch would let the stalest case through, which is the one that
        // matters: phone put down, picked up tomorrow by someone else.
        lastUserId: s.lastUserId,
        // The last profile `/api/me` returned, so a launch with no connection
        // still knows who is signed in and whether she finished onboarding.
        // Without them an offline launch sent a member back to the welcome
        // screen, where "Skip for now" could replace her session with a guest.
        user: s.user,
        hasOnboarded: s.hasOnboarded,
        pushPrimerShownAt: s.pushPrimerShownAt,
        subtitlesOn: s.subtitlesOn,
        voiceNoteRate: s.voiceNoteRate,
        ambientSound: s.ambientSound,
        // Deliberately outside `accountReset`, like `hapticsEnabled`: signing
        // out must not drop the phone back into English mid-sentence.
        locale: s.locale,
        localeChosen: s.localeChosen,
      }),
      /**
       * Rehydration is the one moment the store knows a language the rest of
       * the app doesn't: `src/i18n` seeded itself from the handset at import
       * time, before any storage had been read. Pushing it here rather than
       * from `_layout` means the catalogue is correct before the first screen
       * mounts, so a member who chose Spanish on an English phone never sees a
       * frame of English.
       */
      onRehydrateStorage: () => (state) => {
        if (state && !state.localeChosen && state.locale !== LAUNCH_LOCALE) {
          // A phone-language guess stored by an earlier build. Not a choice.
          queueMicrotask(() => useAppStore.setState({ locale: LAUNCH_LOCALE }));
          setActiveLocale(LAUNCH_LOCALE);
        } else if (state?.locale) setActiveLocale(state.locale);
        // Progress persisted by a build before `progressSyncedFor` existed is
        // the last account's (`progressSyncedOnLaunch`).
        if (state && state.progressSyncedFor === undefined) {
          const syncedFor = progressSyncedOnLaunch(state.progressSyncedFor, state.lastUserId);
          queueMicrotask(() => useAppStore.setState({ progressSyncedFor: syncedFor }));
        }
        // Held work is kept for a bounded window, never indefinitely.
        if (state?.heldForSignIn && !expireHeld(state.heldForSignIn, Date.now())) {
          queueMicrotask(() => useAppStore.setState({ heldForSignIn: null }));
        }
        // An unseen card outlives its stop by nothing; and with the gate off,
        // nothing a build with it on wrote is kept.
        if (state?.unseenSafetyCards?.length) {
          const kept = PERSIST_UNSEEN_SAFETY_CARD ? pruneUnseen(state.unseenSafetyCards, Date.now(), SAFETY_PAUSE_MS) : [];
          queueMicrotask(() => useAppStore.setState({ unseenSafetyCards: kept }));
        }
      },
    },
  ),
);

/** How long a safety stop holds at most, even with the app never relaunched. */
export const SAFETY_PAUSE_MS = 12 * 3_600_000;

/**
 * A restored stop's card: the configured text is not stored, so the app's
 * own approved crisis lines (`safetyAck.restoredCard`). Read at call time, in
 * the current language.
 */
function restoredSafetyCard(tier: 2 | 3): SafetyCardDTO {
  const t = strings();
  return restoredCard(tier, { body: t.guide.crisis.helpNowEmergency, helplineLabel: t.common.safety.helplineLabel });
}

/**
 * The fixed card that stopped this path this session, or null when the path
 * may continue. See `safetyPauses`. Behind the review gate (off), also a card
 * that arrived before a restart and has not been shown (`unseenSafetyCards`).
 */
export const useSafetyPause = (area: AreaKey | null | undefined): SafetyCardDTO | null => {
  const card = useAppStore((s) => {
    const pause = area ? s.safetyPauses[area] : undefined;
    return pause && Date.now() - pause.at <= SAFETY_PAUSE_MS ? pause.card : null;
  });
  // The entry itself (a stable reference), not a card built in the selector.
  const unseen = useAppStore((s) =>
    PERSIST_UNSEEN_SAFETY_CARD ? unseenFor(s.unseenSafetyCards, s.user?.id, area, Date.now(), SAFETY_PAUSE_MS) : null,
  );
  return useMemo(() => card ?? (unseen ? restoredSafetyCard(unseen.tier) : null), [card, unseen]);
};

/** Selectors */
export const useUser = () => useAppStore((s) => s.user);
/** Today's check-in mood, or null: never yesterday's (`moodFor`). */
export const useTodayMood = () => useAppStore((s) => moodFor(s.todayCheckIn, s.todayKey));
export const useIsPremium = () => useAppStore((s) => s.isPremium);
export const useCircleEnabled = () => useAppStore((s) => s.circleEnabled);
export const useBeta = () => useAppStore((s) => s.beta);
export const useExploreEnabled = () => useAppStore((s) => s.exploreEnabled);

/**
 * Whether the user may open a given path. Premium unlocks all six; a free
 * account keeps the one area onboarding recommended. Mirrors the server gate in
 * `services/progress.ts` — the client only decides what to *show* as locked.
 */
export const useIsAreaUnlocked = () => {
  const isPremium = useAppStore((s) => s.isPremium);
  const freeArea = useAppStore((s) => s.freeArea);
  return (area: AreaKey) => isPremium || area === freeArea;
};

/**
 * Whether an Area is open to her, and if not, why (`areaAvailability`): the
 * closed beta's rule from the server first, then membership. Use this where a
 * write follows (starting a path, a day, a step). `useIsAreaUnlocked` stays the
 * membership question alone, for the screens that only ask about that.
 */
export const useAreaAvailability = () => {
  const isPremium = useAppStore((s) => s.isPremium);
  const freeArea = useAppStore((s) => s.freeArea);
  const beta = useAppStore((s) => s.beta);
  const betaOpenAreas = useAppStore((s) => s.betaOpenAreas);
  return (area: AreaKey): AreaAvailability =>
    areaAvailability({ isPremium, freeArea, beta, betaOpenAreas }, area);
};
// useActivePath now lives in `@/hooks/usePaths` (composes fetched content +
// store progress) so screens read CMS content from the API.
