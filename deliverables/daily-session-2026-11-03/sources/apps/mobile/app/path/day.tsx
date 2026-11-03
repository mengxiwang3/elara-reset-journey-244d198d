import {
  answerText,
  authoredReply,
  cardHasAnswers,
  dayPosition,
  echoLines,
  fillTemplate,
  followUpSource,
  hasStateAnswer,
  hasTakeawayCard,
  heldAnswer,
  isSkippedAnswer,
  lastTakeaway,
  offeredBook,
  holdsHerAnswer,
  isAside,
  isBreathe,
  isQuiet,
  offeredSteps,
  resolveTemplate,
  stateOf,
  stepBody,
  stepOutcome,
  stepsOf,
  STEP_REPLY_TIMEOUT_MS,
  takeawayCard,
  takeawayStepOf,
  weekIsFree,
  weekOf,
  type AnswerState,
  type ClientAnswerState,
  type DayStep,
  type ReflectMode,
  type TemplateContext,
} from "@elara/shared";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenStatusBar } from "@/components/system/ScreenStatusBar";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Image, Keyboard, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText, CrisisCard, KeyboardAvoider } from "@/components";
import {
  AmbientControl,
  AmbientPrompt,
  BreatheStep,
  CenteredDayHeader,
  DayHeader,
  PracticeCta,
  PracticeThemeContext,
  StepScreen,
  replyKey,
  stepDraftKey,
  themeForWeek,
  replyStillFits,
  usePendingReplies,
  useReplyPending,
  type LeadCard,
} from "@/components/practice";
import { celebrateDay, celebrateRhythm, celebrateStep } from "@/celebration";
import { setAmbientOnDay } from "@/lib/ambientPlayer";
import {
  reportCompletionShown,
  reportHandoffChoice,
  useWorldDay,
  useWorldLedger,
  WorldArt,
  WorldDay,
  landmark,
  type CloseContent,
  type WorldDayHandle,
} from "@/components/practice/landscape";
import type { BandPlace, SessionOpening } from "@/components/practice/landscape/BandDay";
import type { SessionClose } from "@/components/practice/landscape/WorldDay";
import type { TakeawaySlotView } from "@/components/practice/TakeawayCard";
import { draftHasContent, isRefusedDraft } from "@/components/practice/draft";
import { nextQuestion, opensOnSession } from "@/lib/session";
import { shiftedRows } from "@/components/practice/landscape/photoDay";
import { dayPhoto } from "@/content/dayImages";
import { bandLayoutFor, dayPlaceWords, hereIndexFor, photoPlaceFor, stopsKeyFor } from "@/content/placeDay";
import { PLACE_HERO } from "@/content/placeImages";
import { CompletionAsks } from "@/components/practice/CompletionAsks";
import { initialSceneState } from "@/components/world/scene";
import { worldForWeek } from "@/components/world/worlds";
import { dayKey } from "@/lib/dates";
import { useAppStatus } from "@/lib/appStatus";
import { useScreenExplainer } from "@/explainers/useExplainer";
import type { AreaKey, DayValue, Path } from "@/content/types";
import { opensWhen, useDayGate } from "@/hooks/useDayGate";
import { closeWayOn, isAheadOfGate, opensOnWeekIntro } from "@/lib/dayEntry";
import { buildScreens, cursorIndex, mayHaveMoreAfter, nextScreenId, questionProgress, type Screen } from "@/lib/offeredScreens";
import { completionAsks, daySummary, finishAction, isDeclinedDay, type CompletionAsk } from "@/lib/dayFinish";
import { useHasServerPath, usePathsMap } from "@/hooks/usePaths";
import { nextDayPin, sameSteps, type DayPin } from "@/lib/dayPin";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useLocale, useT } from "@/i18n";
import { haptics, PressableScale } from "@/motion";
import { resolveAnswer } from "@/lib/onboardingAnswers";
import { useAppStore, useAreaAvailability, useIsPremium, useSafetyPause } from "@/store/useAppStore";
import { placeFor } from "@/store/dayPlace";
import { useDayPlace } from "@/store/useDayPlace";
import { isReplay } from "@/components/atlas/redo";
import { nextRedoDay, redoFor } from "@/store/redoWeek";
import { claimRedoWeek, useRedoWeek } from "@/store/useRedoWeek";
import { spacing } from "@/theme";
import { PAPER_WEEK_ONE } from "@/components/practice/theme";

/**
 * One day of a path, walked one screen at a time.
 *
 * ## The shape of a step
 *
 * Every step ends one of three ways — a reply beat, quietly, or with its reply
 * deferred to the next surface (see `StepScreen`). The beat keeps its original
 * rule: the first press submits, the second moves on, so her reply never
 * flashes past on the way to the next question.
 *
 * ## Nothing here waits on a model
 *
 * Every answer is written to the local store before any request is made, so the
 * member's record of her own day is never contingent on a reply. A beat races
 * its request against `STEP_REPLY_TIMEOUT_MS` and falls back to the authored
 * `step.elara`; a quiet or deferred step does not wait at all. There is no
 * error state and no retry: from her side there is no failure.
 *
 * ## Screens are not steps
 *
 * A follow-up authored as a card is drawn on top of the step after it, and a
 * follow-up with nothing to follow up (yesterday's commitment was skipped, or
 * there was no yesterday) is not drawn at all — it is recorded as answered with
 * nothing, so it can never hold the day open. So the screens are built from the
 * steps once, on arrival, and the progress bar counts screens.
 *
 * ## A finished day is replayable
 *
 * Re-opening a completed day replays it with the answers and replies that were
 * actually given. An unchanged answer costs nothing; an edited one is written
 * through and earns a new reply. Inside a world a finished day opens on its
 * arrival instead, with "Do this day again" under it; `redo=1` (Today's "Do
 * today again", a day re-opened from Paths or the Atlas) skips straight to its
 * first question.
 *
 * A redo of a day that was already complete (`replaying`) never adds to her
 * progress: no feedback ask, no celebration, no week's close, and the rhythm
 * is owed only for an answer she actually changed (the server credits exactly
 * that: one rhythm day for today, nothing for the work already done). With
 * `redoWeek` it is one day of a week's redo (`store/redoWeek`): finishing it
 * offers the next day of the redo, and after the seventh, the week.
 */
function DayScreenInner() {
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const { area, day, introSeen, step: stepParam, from, redo, redoWeek } = useLocalSearchParams<{
    area: AreaKey;
    day: string;
    introSeen?: string;
    /** Open on this step — the collection's "edit" on a drawing or sentence. */
    step?: string;
    /**
     * The surface that started this practice, for a context-preserving exit:
     * `area` is the path's own screen (`/path/[area]`), `paths` the Atlas,
     * `atlas` the Atlas screen right under this one (a week, a record, the
     * globe: a redo started there goes back to it).
     */
    from?: "paths" | "today" | "area" | "atlas";
    /** "1": walk this finished day again from its first question. */
    redo?: string;
    /** The world whose week is being redone, day by day (`store/redoWeek`). */
    redoWeek?: string;
  }>();
  // The ambient bed plays only while this screen has focus: a route pushed over
  // the day (chat, paywall, crisis help) takes it with it, and leaving takes it
  // for good. Nothing starts it here; she has to have chosen it.
  useFocusEffect(
    useCallback(() => {
      setAmbientOnDay(true);
      return () => setAmbientOnDay(false);
    }, []),
  );

  const livePaths = usePathsMap();
  const dayNum = Number(day);
  const locale = useLocale();
  // The day's content is pinned for the life of this screen. The bundled copy
  // is replaced by the CMS copy when the fetch lands (`usePathsMap`), and a
  // swap mid-day rebuilt the open day under her: new steps, a cursor that
  // moved, a StepScreen remounted with her half-typed words. Taken again only
  // for a new language — and once, from the bundled copy to the CMS copy when
  // that arrives (`lib/dayPin`): before she has sent anything from here, or
  // later when only the words differ. A day opened cold otherwise kept the
  // bundled words for good, and its answers were refused wherever the two
  // copies name a step differently.
  const [pinned, setPinned] = useState<DayPin<Path> | null>(null);
  const livePath = livePaths[area];
  const liveFromServer = useHasServerPath(area);
  /** She has sent an answer or a skip from this screen: from here the pin moves only for the same steps. */
  const [answeredHere, setAnsweredHere] = useState(false);
  const liveDay = livePath?.days[dayNum - 1];
  const pinnedDay = pinned?.path.days[dayNum - 1];
  const repin = nextDayPin(
    pinned,
    {
      locale,
      path: livePath,
      hasDay: !!liveDay,
      fromServer: liveFromServer,
      sameSteps: !!liveDay && !!pinnedDay && sameSteps(stepsOf(liveDay), stepsOf(pinnedDay)),
    },
    answeredHere,
  );
  if (repin) setPinned(repin);
  const path = pinned && pinned.locale === locale ? pinned.path : livePath;
  const content = path?.days[dayNum - 1];

  const saveStepAnswer = useAppStore((s) => s.saveStepAnswer);
  const saveStepReply = useAppStore((s) => s.saveStepReply);
  const declineDay = useAppStore((s) => s.declineDay);
  const sendStep = useAppStore((s) => s.sendStep);
  const progress = useAppStore((s) => s.progress[area]);
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();

  const book = useMemo(() => progress?.stepAnswers ?? {}, [progress?.stepAnswers]);
  const dayAnswers = book[dayNum];
  const steps = useMemo(() => (content ? stepsOf(content) : []), [content]);
  const stepAt = useCallback(
    (d: number, id: string) => {
      const other = path?.days[d - 1];
      return other ? stepsOf(other).find((s) => s.id === id) : undefined;
    },
    [path],
  );
  // Templates and recalls quote only what was asked (`offeredBook`): an answer
  // kept for a question she is no longer asked stays stored, unquoted.
  const ctx: TemplateContext = useMemo(
    () => ({
      book: offeredBook(book, (d) => {
        const other = path?.days[d - 1];
        return other ? stepsOf(other) : undefined;
      }),
      day: dayNum,
      stepAt,
    }),
    [book, dayNum, path, stepAt],
  );

  // The steps asked now. Without a `when` anywhere this is `steps` itself; with
  // one it follows the answers, so it changes as she answers (see
  // `lib/offeredScreens`). The key keeps `screens` from being rebuilt by every
  // reply that is saved.
  const offered = useMemo(() => offeredSteps(steps, dayAnswers), [steps, dayAnswers]);
  const offeredKey = offered.map((s) => s.id).join("\u0000");
  // What each follow-up is following up. Answers from earlier days only, so
  // stable for the life of this screen — which is what keeps the screen list
  // from reshaping while she walks it.
  const sources = offered
    .filter((s) => s.kind === "followUp")
    .map((s) => followUpSource(s, ctx) ?? "")
    .join("\u0000");
  const { screens, hidden } = useMemo(() => {
    const built = buildScreens(offered, (followUp) => !!followUpSource(followUp, ctx));
    return { screens: built.screens, hidden: built.skipped };
    // `offeredKey` and `sources` stand in for `offered` and `ctx` here — see above.
    // `steps` changes only when the pinned copy does (the CMS copy replacing the
    // bundled one, a new language): the screens carry the steps' words.
  }, [offeredKey, sources, steps]); // eslint-disable-line react-hooks/exhaustive-deps
  const authoredIds = useMemo(() => steps.map((s) => s.id), [steps]);

  // Where she is, as a step id: a list that changes with her answers never
  // leaves an index pointing at a different question (`cursorIndex`).
  const [cursor, setCursor] = useState<string | null>(null);
  const index = Math.max(0, cursorIndex(screens.map((s) => s.step.id), authoredIds, cursor));
  /** Walking a finished day again (see the file comment). */
  const [again, setAgain] = useState(redo === "1");
  // Coming back to a day she left partway opens on the step she was on, not
  // on step 1 — relaunching the app mid-day must not make her tap back through
  // everything she already answered. Once, on arrival: `screens` is empty until
  // the day's content has loaded, so this can't be the `useState` initialiser.
  // A finished day has no unanswered step and still replays from the start.
  // Adjusted during render rather than in an effect, so the first frame with
  // content is already the right step.
  // Taken again if the day's copy is replaced before she has answered
  // (`lib/dayPin`): the bundled copy's step ids may not be the server's.
  const [resumedFor, setResumedFor] = useState<Path | null>(null);
  const resumed = resumedFor !== null;
  // Whether the day was already complete when she opened it, taken once with
  // the resume: a redo is a replay only of a finished day (`isReplay`), and a
  // day that becomes complete under her is closed like any other.
  const [doneOnArrival, setDoneOnArrival] = useState(false);
  if (path && resumedFor !== path && screens.length && !answeredHere) {
    setResumedFor(path);
    setDoneOnArrival(!!progress?.completedDays.includes(dayNum));
    // The exact step (Atlas A5): a step named by the link, else the one this
    // phone remembers her on in this unfinished day (she may have stepped
    // back), else her first unanswered step, below.
    const places = useDayPlace.getState();
    const signedIn = useAppStore.getState().user?.id ?? null;
    const remembered =
      !stepParam && !again && places.owner != null && places.owner === signedIn && !progress?.completedDays.includes(dayNum)
        ? placeFor(places.places, area, dayNum)
        : null;
    const target = stepParam ?? remembered;
    const asked = target
      ? screens.findIndex((s) => s.step.id === target && !(target === remembered && isAside(s.step)))
      : -1;
    // The breathing moment opens a fresh day only. A day she has already
    // started (including one she was partway through when the moment was
    // added to it) resumes on her question, and a finished one replays from
    // its first question.
    // A redo starts at the top whatever is unanswered.
    // A `notOffered` left on a step that is asked now is a question not yet put
    // (`heldAnswer`: the one reading of it, shared with the server).
    const unanswered = (id: string) => !heldAnswer(dayAnswers?.[id]);
    const first =
      asked >= 0
        ? asked
        : again
          ? -1
          : screens.findIndex((s) => unanswered(s.step.id) && !(dayAnswers && isAside(s.step)));
    const at = first >= 0 ? first : Math.max(0, screens.findIndex((s) => !isAside(s.step)));
    setCursor(at > 0 ? (screens[at]?.step.id ?? null) : null);
  }
  const screen: Screen | undefined = screens[index];
  const step = screen?.step;
  // The step she is on in an unfinished day, remembered on this phone so the
  // Atlas and every "continue" bring her back to it (Atlas A5). Ids only,
  // never her words. A finished day forgets it.
  const dayDone = !!progress?.completedDays.includes(dayNum);
  /** A redo of a day already complete: see the file comment. */
  const replaying = isReplay(again, doneOnArrival);
  const replayingRef = useRef(replaying);
  replayingRef.current = replaying;
  const saved = step ? dayAnswers?.[step.id] : undefined;
  // A day answered before steps existed has its one answer in `responses`.
  // Only honoured for a genuinely single-step day.
  const legacyValue =
    steps.length === 1 && saved === undefined ? progress?.responses?.[dayNum] : undefined;
  // Day 1 opens on the feeling she already named in onboarding, when Day 1
  // can translate into the four shared weather moods; anything else asks.
  const onboardingAnswers = useAppStore((s) => s.onboarding.answers);
  const carried =
    dayNum === 1 && step?.id === "feeling" && saved === undefined
      ? carryFeeling(t, area, onboardingAnswers, step)
      : undefined;
  const savedValue = saved?.value ?? legacyValue ?? carried;
  // An explicit non-answer to this step (`unsure`, `declined`…), said back on a revisit.
  const savedState = saved && hasStateAnswer(saved) ? stateOf(saved) : undefined;

  const [reply, setReply] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // A wait past a second says what it is for (review v2, O2): her words are
  // being kept, and Elara's line may come with them.
  const [slowSave, setSlowSave] = useState(false);
  useEffect(() => {
    if (!pending) {
      setSlowSave(false);
      return;
    }
    const id = setTimeout(() => setSlowSave(true), SLOW_SAVE_MS);
    return () => clearTimeout(id);
  }, [pending]);
  /**
   * An answer matched the safety list. The fixed card replaces Elara's, and
   * the Path does not continue this session (safety spec §04, Interaction
   * States §8): the day stops here with one way out, back to Today. Kept in
   * the store, not here, so coming back through Today's Continue (or any
   * other door) shows the card again rather than the next question.
   */
  const safetyStop = useSafetyPause(area);
  const pauseForSafety = useAppStore((s) => s.pauseForSafety);
  // The stop is on screen: the card has been shown (`unseenSafetyCards`).
  const acknowledgeSafetyCard = useAppStore((s) => s.acknowledgeSafetyCard);
  useEffect(() => {
    if (safetyStop) acknowledgeSafetyCard(area);
  }, [safetyStop, area, acknowledgeSafetyCard]);
  const [submitted, setSubmitted] = useState(false);
  /** «Pedir la nota de Elara» on the close (P1-10): offered once per visit. */
  const [noteAsk, setNoteAsk] = useState<"idle" | "pending" | "failed" | "done">("idle");
  /**
   * Her answer read as no answer, and Elara's reply invites her to try again:
   * the input reopens under it. Pressing on without changing a word moves on.
   */
  const [retry, setRetry] = useState(false);
  /** The step's current draft. */
  const draft = useRef<DayValue>(null);
  /**
   * A rhythm beat is owed, raised as she leaves the day: inside a world (no
   * streak beat over the scene), and on a redo, where it is owed only once an
   * answer she changed has been sent (`persist`). The server credits a redo
   * exactly then; pressing through unchanged answers sends nothing and earns
   * nothing, so the phone must not project a day the server will not have.
   */
  const rhythmOwed = useRef(false);
  /** Guards against a late reply landing on a step the member has left. */
  const liveStep = useRef<string | null>(null);
  const sending = useRef<symbol | null>(null);
  useEffect(() => () => { liveStep.current = null; sending.current = null; }, []);
  const startPending = usePendingReplies((s) => s.start);
  const endPending = usePendingReplies((s) => s.end);

  const week = content ? weekOf(dayNum, content.config) : 1;
  // A day walked in the photo band is on the plain cream page every week (Money Journey prototype).
  const weekWorld = worldForWeek(week, area);
  const bandDay = !!weekWorld && bandLayoutFor(weekWorld);
  const theme = bandDay || (dayNum >= 1 && dayNum <= 7 && worldForWeek(1, area))
    ? PAPER_WEEK_ONE
    : themeForWeek(week, area);
  const total = path?.days.length ?? 0;
  const gate = useDayGate(progress, total, area);

  // One day of a week's redo: only for this day's own world, and only when
  // the day is a replay. The redo is kept here too (a resume, a return from
  // the paywall), from the week's days as authored.
  const redoWeekId = replaying && redoWeek && weekWorld === redoWeek ? redoWeek : null;
  const weekDayNums = useMemo(
    () => (path?.days ?? []).filter((d) => weekOf(d.day, d.config) === week).map((d) => d.day),
    [path, week],
  );
  useEffect(() => {
    if (!redoWeekId || !area || !weekDayNums.length) return;
    claimRedoWeek();
    useRedoWeek.getState().ensure(area, redoWeekId, weekDayNums);
  }, [area, redoWeekId, weekDayNums]);
  const redoWeekState = useRedoWeek((s) => (redoWeekId && area ? redoFor(s.weeks, area, redoWeekId) : null));
  const redoNext = redoWeekId ? nextRedoDay(redoWeekState) : null;

  // A Money Clarity week with a world: the day is walked inside its live
  // scene (Oct 2026 Mist Meadow day + Motion system). Every other Area and
  // week keeps the screens as they were.
  const userId = useAppStore((s) => s.user?.id ?? null);
  useEffect(() => {
    useWorldLedger.getState().claim(userId);
    useDayPlace.getState().claim(userId);
  }, [userId]);
  const position0 = path ? dayPosition(dayNum, path.days) : { week: 1, dayInWeek: 1 };
  // The daily session (Nov 2026). A day with a `purpose` opens on it on the
  // way in, and never on a resume: a saved answer, a draft with something of
  // hers in it, the step this phone remembers her on, or a link to a step all
  // take her straight back to her step. Read once, as the world day freezes
  // its way in; the store is read directly because it is not this render's.
  const purpose = content?.config?.purpose?.trim() || null;
  const sessionDay = hasTakeawayCard(steps);
  const placesNow = useDayPlace.getState();
  const ownerNow = useAppStore.getState().user?.id ?? null;
  const rememberedNow =
    placesNow.owner != null && placesNow.owner === ownerNow ? placeFor(placesNow.places, area, dayNum) : null;
  const draftsNow = useAppStore.getState().drafts;
  const sessionOpening = opensOnSession({
    purpose,
    complete: !!progress?.completedDays.includes(dayNum),
    answered: !!dayAnswers && Object.keys(dayAnswers).length > 0,
    drafted: steps.some((s) => draftHasContent(draftsNow[stepDraftKey(area, dayNum, s.id)])),
    remembered: !!rememberedNow,
    stepParam: !!stepParam,
    again,
  });
  const wd = useWorldDay({
    area,
    areaName: path?.name ?? "",
    days: path?.days ?? [],
    dayNum,
    week,
    dayInWeek: position0.dayInWeek,
    steps,
    screenIds: screens.map((s) => s.step.id),
    dayAnswers,
    progress,
    introSeen: !!introSeen,
    hasStepParam: !!stepParam,
    again,
    session: !!purpose,
    sessionOpening,
  });
  const walk = useRef<WorldDayHandle>(null);
  // On the session's opening she has not started: the phone remembers her on
  // a step only once she is past it ("Empezar"), so leaving from the opening
  // never turns Hoy's «Empezar» into «Seguir».
  const [openingDone, setOpeningDone] = useState(false);
  const openingUp = !!purpose && wd?.frozen?.opening?.kind === "poster" && !openingDone;
  const rememberStep = resumed && !again && !dayDone && !openingUp && step && !isAside(step) ? step.id : null;
  useEffect(() => {
    if (!area || !Number.isFinite(dayNum)) return;
    if (dayDone) useDayPlace.getState().forget(area, dayNum);
    else if (rememberStep) useDayPlace.getState().remember(area, dayNum, rememberStep);
  }, [area, dayNum, dayDone, rememberStep]);
  const landscape = !!wd;
  // Elara's line to the step before, carried onto this sheet.
  const prevScreen = index > 0 ? screens[index - 1] : undefined;
  const prevPending = useReplyPending(area, dayNum, prevScreen?.step.id);
  // Her line to the day's last step, for the arrival.
  const lastStep = steps[steps.length - 1];
  const liveFrom = landscape && lastStep && !isQuiet(lastStep) ? lastStep.id : undefined;
  const lastPending = useReplyPending(area, dayNum, liveFrom);
  // "Saving your place": only while an answer is genuinely stuck on this phone
  // (offline, or a write that has not landed for a few seconds), never for
  // the ordinary moment a request is in flight.
  // The age is checked on a timer, not only in a selector: a selector re-runs
  // when the store changes, and a write that is simply slow changes nothing,
  // so the chip never came up at 4 s.
  const networkOffline = useAppStatus((s) => s.networkOffline);
  const oldestQueued = useAppStore((s) => {
    let oldest: number | null = null;
    for (const q of s.pendingSteps) {
      if (q.area === area && q.day === dayNum && (oldest === null || q.queuedAt < oldest)) oldest = q.queuedAt;
    }
    return oldest;
  });
  const [, recheck] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    if (oldestQueued === null) return;
    const wait = oldestQueued + SAVING_AFTER_MS - Date.now();
    if (wait < 0) return;
    const id = setTimeout(recheck, wait + 1);
    return () => clearTimeout(id);
  }, [oldestQueued]);
  const stuck = oldestQueued !== null && Date.now() - oldestQueued > SAVING_AFTER_MS;
  // An answer of this day the server refused for good, put back in its step
  // for her (`keptAnswer`, by the step queue's flush).
  const refusedToday = useAppStore((s) => steps.some((st) => isRefusedDraft(s.drafts[stepDraftKey(area, dayNum, st.id)])));
  const saving = oldestQueued !== null && (networkOffline || stuck);
  // An answer of this day left queued by a failed write is sent again while
  // she is here and online, as `useSavingPlace` does on the Atlas: nothing on
  // this screen used to retry it. A live request still in flight is left to
  // itself (the flush skips it).
  useEffect(() => {
    if (!stuck || networkOffline) return;
    void useAppStore.getState().flushSteps().catch(() => {});
  }, [stuck, networkOffline, oldestQueued]);

  // Not over the breathing moment: the hint waits for the first question.
  useScreenExplainer("path.day1", !!content && dayNum === 1 && !!step && !isAside(step));
  useScreenExplainer("path.lock", !!content && !!path && dayNum >= total);

  // The weeks after the free one are membership. The server refuses the
  // answers anyway; arriving here from a stale link goes to the gate instead,
  // with this very day as the way back.
  const premium = useIsPremium();
  // Only once the entitlement is known: `isPremium` reads false until the
  // subscription has loaded, and a member opening a day from a notification
  // on a cold start must not be bounced to the paywall for that second.
  const entitlementKnown = useAppStore((s) => s.subscription !== null);
  const weekLocked = !!content && entitlementKnown && !premium && !weekIsFree(week);
  useEffect(() => {
    if (!weekLocked) return;
    // A redo comes back as a redo (and as the same week's redo).
    const redoQuery = redo === "1" ? `&redo=1${redoWeek ? `&redoWeek=${redoWeek}` : ""}${from ? `&from=${from}` : ""}` : "";
    router.replace({ pathname: "/paywall", params: { returnTo: `/path/day?area=${area}&day=${dayNum}${redoQuery}` } });
  }, [weekLocked, router, area, dayNum, redo, redoWeek, from]);

  // A week with a note from a guide opens on it, once: until she has answered
  // anything that day. "Skip for now" comes back here with `introSeen`.
  // Not Week 1: its video sits first in Today's From Alejandra row instead of
  // standing between her and Day 1 (Interaction States spec §6).
  const intro = content?.config?.intro;
  // The day opens on its own arrival in the photo band (the week's title, one
  // line, Start): the separate note screen would only say the same thing first.
  const opensInPlace = bandDay && !intro?.videoUrl && wd?.frozen?.opening?.kind === "poster";
  // Not ahead of the unlock rule either: a day that has not opened says when it
  // opens (below), so its week's note never plays early or offers "Begin".
  const aheadOfGate = isAheadOfGate(gate, dayNum, !!dayAnswers);
  useEffect(() => {
    const show = opensOnWeekIntro({
      week,
      weekLocked,
      aheadOfGate,
      hasIntro: !!intro,
      introSeen: !!introSeen,
      started: !!dayAnswers,
      safetyStop: !!safetyStop,
      inPlace: opensInPlace,
    });
    if (!show) return;
    router.replace({ pathname: "/path/week-intro", params: { area, week: String(week), day: String(dayNum), ...(from ? { from } : {}) } });
  }, [weekLocked, aheadOfGate, intro, introSeen, dayAnswers, safetyStop, router, area, week, dayNum, from, opensInPlace]);

  /**
   * Write an answer through: locally first, always, then to the server.
   *
   * Returns the request, or null when there is nothing new to send — an
   * unchanged answer she is pressing through on a revisit.
   */
  const persist = useCallback(
    (
      target: DayStep,
      value: DayValue,
      {
        force = false,
        mode,
        replyless = false,
        auto = false,
        state,
      }: {
        force?: boolean;
        mode?: ReflectMode;
        replyless?: boolean;
        auto?: boolean;
        /** A non-answer (`config.stateOptions`): the state is the answer and `value` is dropped. */
        state?: ClientAnswerState;
      } = {},
    ) => {
      const held = dayAnswers?.[target.id];
      const unchanged =
        held !== undefined && sameValue(held.value, value) && stateOf(held) === (state ?? "answered");
      // Pressing Next through an answer she left as it was is not a new
      // answer: restamping it moved the day's finish time and locked the next.
      if (!unchanged || force) saveStepAnswer(area, dayNum, steps, target.id, value, state);
      // A reply written for this exact option is shown at once and kept, so a
      // replay shows the same line.
      const written = authoredReply(target, value);
      if (written) saveStepReply(area, dayNum, target.id, written, false);
      if (unchanged && !force) return null;
      // A redo earns the rhythm only here, for words she changed (see `rhythmOwed`).
      // The server's own rule (`earnedSource`): any write by her that is not a state.
      if (replayingRef.current && !auto && !state) rhythmOwed.current = true;
      return sendStep(area, dayNum, {
        stepId: target.id,
        value: state ? undefined : (value ?? undefined),
        ...(state ? { state } : {}),
        ...(mode ? { mode } : {}),
        ...(unchanged || replyless ? { replyless: true } : {}),
        // Written for her, not by her: the server gives it no rhythm credit, so
        // that merely *opening* a day with a dangling follow-up cannot earn a
        // streak day. See `saveStepInput.auto`.
        ...(auto ? { auto: true } : {}),
      });
    },
    [area, dayAnswers, dayNum, saveStepAnswer, saveStepReply, sendStep, steps],
  );

  // Follow-ups with nothing to ask about are answered with nothing, once, so
  // the day can close. Fire-and-forget: the local write is what counts.
  // Not on a day that has not opened: an automatic answer there made the day
  // "started" (any answer is), which lifted the gate on this screen and on
  // Today without her doing anything.
  useEffect(() => {
    if (aheadOfGate) return;
    for (const s of hidden) {
      if (dayAnswers?.[s.id]) continue;
      persist(s, null, { auto: true })?.catch(() => {});
    }
  }, [hidden, aheadOfGate]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Back to where she came from, with nothing in between (a declined day, the
   * back on a first step). A day opened from the path's own screen goes back
   * to it: dismissing to the Atlas popped that screen too, skipping it. A redo
   * started on an Atlas screen (`atlas`: a week, a record, the globe) goes
   * back to that very screen; the days of a week's redo replace one another,
   * so it is still the one under this.
   */
  const leaveQuietly = useCallback(() => {
    if (from === "area") router.dismissTo({ pathname: "/path/[area]", params: { area } });
    else if (from === "atlas") {
      if (router.canGoBack()) router.back();
      else router.dismissTo("/(tabs)/atlas");
    } else router.dismissTo(from === "paths" ? "/(tabs)/atlas" : "/(tabs)");
  }, [area, from, router]);

  /**
   * On from a redone day: the next day of the week's redo (never the live
   * "today"), the week itself after its seventh day, or, for one day on its
   * own, back to where she came from. Read from the store, which `closeDay`
   * has just moved on.
   */
  const afterRedo = useCallback(() => {
    if (!redoWeekId) {
      leaveQuietly();
      return;
    }
    const next = nextRedoDay(redoFor(useRedoWeek.getState().weeks, area, redoWeekId));
    if (next != null) {
      router.replace({
        pathname: "/path/day",
        params: { area, day: String(next), redo: "1", redoWeek: redoWeekId, ...(from ? { from } : {}) },
      });
      return;
    }
    router.dismissTo({ pathname: "/(tabs)/atlas/week/[worldId]", params: { worldId: redoWeekId } });
  }, [area, from, leaveQuietly, redoWeekId, router]);
  /** Stop a week's redo partway: back to the week, the redo kept to resume. */
  const backToWeek = useCallback(() => {
    if (redoWeekId) router.dismissTo({ pathname: "/(tabs)/atlas/week/[worldId]", params: { worldId: redoWeekId } });
  }, [redoWeekId, router]);

  /**
   * The quiet asks the completion screen carries (`completionAsks`), decided
   * once as the day closes: inline on that screen, never a sheet before it.
   */
  const [asks, setAsks] = useState<CompletionAsk[]>([]);
  const closeDay = useCallback(() => {
    const nextWeek = dayNum < total ? weekOf(dayNum + 1, path?.days[dayNum]?.config) : week;
    if (replayingRef.current) {
      // A redone day: nothing new to celebrate and no week to reveal again.
      // Its place in a week's redo is kept first, so leaving from here on
      // loses nothing. Inside a world she still arrives (quietly) at the
      // landmark, and the arrival offers what comes next; elsewhere she goes
      // straight on.
      if (redoWeekId) useRedoWeek.getState().redone(area, redoWeekId, dayNum);
      if (wd && walk.current) walk.current.arrive({ replay: true });
      else afterRedo();
      return;
    }
    if (wd && walk.current) {
      // Inside a world the arrival replaces the medium overlay (and the
      // week's close replaces the synthesis screen). Her answers are saved
      // already; a day completed twice opens straight at its landmark.
      const s = useAppStore.getState();
      const replay = !!s.daysCelebrated[area]?.includes(dayNum);
      if (!replay) s.markDayCelebrated(area, dayNum);
      // The arrival is felt once, like the overlay it replaces.
      if (!replay) haptics.completeOnce();
      if (dayNum >= total || nextWeek !== week) {
        const ledger = useWorldLedger.getState();
        const revealed = ledger.revealed.includes(wd.world);
        // Written at the commit, before anything moves: leaving mid-sequence
        // lands on the resolved card next time, with no replay.
        ledger.markRevealed(wd.world);
        walk.current.closeWorld({ replay: revealed });
      } else {
        walk.current.arrive({ replay });
      }
      return;
    }
    if (dayNum >= total || nextWeek !== week) {
      // The end of a week (or the path) has its own full screen — the week's
      // synthesis — so a medium beat would only stand between her and it.
      router.replace({ pathname: "/path/complete", params: { area, week: String(week) } });
      return;
    }
    // A day closing is a seam in the practice. The beat holds it; the beat does
    // not own it — the navigation to the day-complete screen is handed over as
    // `onDone`, which runs on every exit path, including a tap to skip and a
    // day completed a second time (which skips the beat and navigates at once).
    celebrateDay({
      area,
      day: dayNum,
      total,
      onContinue: () =>
        router.replace({ pathname: "/path/day-complete", params: { area, day: String(dayNum) } }),
    });
  }, [afterRedo, area, dayNum, path, redoWeekId, router, total, week, wd]);

  /**
   * The Finish tap. Straight to the one completion screen: the day's arrival
   * inside a world, or the day-complete screen. "Was today's session useful?"
   * and a guest's save-your-progress ask are carried on that screen, inline
   * and skippable (`completionAsks`); the reminder primer waits for Today.
   */
  const finishDay = useCallback(() => {
    const s = useAppStore.getState();
    // A day she declined, walked again: no feedback ask, no celebration, no
    // day-complete screen (`lib/dayFinish`). Read from the store, not the
    // render, like `freshScreens`.
    const action = finishAction({
      declined: isDeclinedDay(steps, s.progress[area]?.stepAnswers?.[dayNum]),
      replay: replayingRef.current,
    });
    if (action === "exit") {
      leaveQuietly();
      return;
    }
    setAsks(
      completionAsks({
        action,
        feedbackAsked: s.feedbackAsked.includes(`${area}:${dayNum}`),
        safetyStop: !!safetyStop,
        guest: !!s.user?.isAnonymous,
        day: dayNum,
      }),
    );
    closeDay();
  }, [area, closeDay, dayNum, leaveQuietly, safetyStop, steps]);

  /**
   * The screens as the answers stand right now, read from the store and not
   * from this render: the answer that decides whether a follow-up exists was
   * written a moment ago, and the render that knows about it has not run yet.
   */
  const freshScreens = useCallback(() => {
    const latest = useAppStore.getState().progress[area]?.stepAnswers?.[dayNum];
    return buildScreens(offeredSteps(steps, latest), (followUp) => !!followUpSource(followUp, ctx)).screens;
  }, [area, ctx, dayNum, steps]);

  /**
   * The step a move on has started from. Inside a world the beat plays for a
   * second or more before the next sheet rises, with this step still mounted:
   * a submit for it arriving then (an option's auto-advance after Skip) is
   * ignored, or the answer overwrote the skip and the walk played twice.
   */
  const movingFrom = useRef<string | null>(null);

  const advance = useCallback(
    (to?: string | null) => {
      const next = to ?? nextScreenId(freshScreens().map((s) => s.step.id), authoredIds, step?.id);
      movingFrom.current = null;
      if (next) setCursor(next);
      setSubmitted(false);
      setRetry(false);
      setReply(null);
      setPending(false);
      liveStep.current = null;
    },
    [authoredIds, freshScreens, step?.id],
  );

  const goNext = useCallback(() => {
    movingFrom.current = step?.id ?? null;
    const next = nextScreenId(freshScreens().map((s) => s.step.id), authoredIds, step?.id);
    if (next) {
      // Inside a world every activity is a step deeper and one response,
      // then the next sheet rises. A finished day replays with no camera.
      if (wd && walk.current && !wd.complete) {
        const response = wd.plan[index] ?? "mist";
        walk.current.beat(response, { caption: wd.caption(response), beatMs: wd.beatMsAt(index), onRise: () => advance(next) });
        return;
      }
      advance(next);
      return;
    }
    finishDay();
  }, [advance, authoredIds, finishDay, freshScreens, index, step?.id, wd]);

  // The last screen — unless this is the question that decides whether a
  // follow-up exists and she has not answered it yet.
  const isLast = index + 1 >= screens.length && !(step && mayHaveMoreAfter(steps, dayAnswers, step.id));

  /** Her answer to a step of this day as stored right now (not as this render saw it). */
  const storedAnswer = useCallback(
    (id: string) => useAppStore.getState().progress[area]?.stepAnswers?.[dayNum]?.[id],
    [area, dayNum],
  );

  useEffect(
    () => () => {
      if (rhythmOwed.current) celebrateRhythm();
    },
    [],
  );

  const onSubmit = useCallback(
    /** `auto`: sent for her on arrival (the carried Day 1 feeling), so no step beat. */
    async (value: DayValue, mode?: ReflectMode, auto = false) => {
      if (!step || sending.current || movingFrom.current === step.id) return;
      // What she does fixes the day's copy from here (`lib/dayPin`).
      if (!auto) setAnsweredHere(true);
      const attempt = Symbol("step submission");
      sending.current = attempt;
      try {
        const stepId = step.id;
        // Sent: the draft has done its job.
        useAppStore.getState().setDraft(stepDraftKey(area, dayNum, stepId), null);
        liveStep.current = stepId;
        // A redo never celebrates a step it already had; its rhythm is owed by `persist`.
        if (!auto && !replayingRef.current) {
          /**
           * The rhythm first, the step check only if the rhythm had nothing to
           * say.
           *
           * Order matters because the arbiter drops a quieter beat arriving
           * behind a louder one: raising the step check first would have it
           * immediately replaced by a milestone, which is one wasted haptic and
           * one flash of a capsule nobody asked for. `celebrateRhythm` is also
           * silent on every action but the day's first, so on an ordinary third
           * step of an ordinary Tuesday this is exactly what it was before.
           */
          // Inside a world the response is the acknowledgement: no capsule
          // and no streak beat over the meadow (Motion system G2; "no points,
          // badges or streaks" on this surface). The rhythm is owed instead
          // and raised as she leaves the day, so a threshold crossed here
          // lands on the surface she returns to, once.
          if (landscape) rhythmOwed.current = true;
          else if (!celebrateRhythm()) celebrateStep({ isLastStep: isLast });
        }

        // Quiet or deferred: on in one press. The request runs behind her —
        // except when she wrote something. Then the safety screen's answer is
        // waited for first, because moving on would carry her past the one
        // response that must not be missed. Offline or slow, she goes on.
        // Inside a world every reply is carried to the next sheet (her line
        // arrives on the sheet that rises), so every step ends in one press.
        const carries = landscape && !isQuiet(step);
        // Only words she wrote wait on the safety read; a tapped authored
        // option cannot carry anything it has to catch, so it never holds
        // the beat (input is never blocked past 600 ms inside a world).
        const waits = hasWords(value) && !(landscape && isAuthoredChoice(step, value));
        if ((isQuiet(step) || step.config?.deferReply || landscape) && waits) {
          // The keyboard goes as soon as she presses on: nothing is left to type
          // here, and it hid the button's progress while the answer was kept.
          Keyboard.dismiss();
          setPending(true);
          const request = persist(step, value);
          const askedFor = storedAnswer(stepId)?.answeredAt;
          if (request) {
            const res = await withTimeout(request, STEP_REPLY_TIMEOUT_MS).catch(() => null);
            if (sending.current !== attempt || liveStep.current !== stepId) return;
            setPending(false);
            if (res?.safety) {
              pauseForSafety(area, res.safety);
              return;
            }
            if (res?.reply.retry && carries && replyStillFits(storedAnswer(stepId), askedFor)) {
              // Her answer read as no answer: the invitation shows here and
              // the input stays open under it, as it always has.
              saveStepReply(area, dayNum, stepId, res.reply.reply, res.reply.generated, true);
              setReply(res.reply.reply);
              setRetry(true);
              return;
            }
            if (res?.reply.reply && (step.config?.deferReply || carries) && replyStillFits(storedAnswer(stepId), askedFor)) {
              saveStepReply(area, dayNum, stepId, res.reply.reply, res.reply.generated);
            }
            if (res?.dayCompleted) qc.invalidateQueries({ queryKey: ["pathQuestions"] });
          }
          if (screen?.lead && !dayAnswers?.[screen.lead.id]) persist(screen.lead, null, { auto: true })?.catch(() => {});
          goNext();
          return;
        }
        if (isQuiet(step) || step.config?.deferReply || landscape) {
          // A lead card she never touched is answered with nothing on the way
          // past — moving on is how you skip it.
          if (screen?.lead && !dayAnswers?.[screen.lead.id]) persist(screen.lead, null, { auto: true })?.catch(() => {});
          const request = persist(step, value);
          if (request && (step.config?.deferReply || carries)) {
            const key = replyKey(area, dayNum, stepId);
            // The answer this reply is for. She can go back and change it
            // before the reply lands; a late reply to the replaced answer is
            // dropped rather than attached to the new one.
            const askedFor = storedAnswer(stepId)?.answeredAt;
            startPending(key);
            withTimeout(request, STEP_REPLY_TIMEOUT_MS)
              .then((res) => {
                if (res.reply.reply && replyStillFits(storedAnswer(stepId), askedFor)) {
                  // Kept with its flag: an invitation to try again («No sé»,
                  // a greeting) cannot be acted on from the next screen, so it
                  // is never shown there as her note; the authored line is.
                  saveStepReply(area, dayNum, stepId, res.reply.reply, res.reply.generated, res.reply.retry);
                }
                if (res.dayCompleted) qc.invalidateQueries({ queryKey: ["pathQuestions"] });
              })
              // Offline or slow: the next surface shows the authored line.
              .catch(() => {})
              .finally(() => endPending(key));
          } else {
            request
              ?.then((res) => {
                if (res.dayCompleted) qc.invalidateQueries({ queryKey: ["pathQuestions"] });
              })
              .catch(() => {});
          }
          goNext();
          return;
        }

        // The beat: submit, show her reply, then continue.
        if (screen?.lead && !dayAnswers?.[screen.lead.id]) persist(screen.lead, null, { auto: true })?.catch(() => {});
        setSubmitted(true);
        setRetry(false);
        const request = persist(step, value, { mode });
        if (!request) {
          // Pressed on past the invitation without changing a word: on she goes.
          if (retry) {
            goNext();
            return;
          }
          // A hidden step shows its authored line only: no reply to a hidden
          // answer is kept (an older build may still hold one on the phone).
          setReply((step.config?.hidden ? null : saved?.reply) ?? step.elara ?? null);
          return;
        }
        Keyboard.dismiss();
        setPending(true);
        const askedFor = storedAnswer(stepId)?.answeredAt;
        const fallback = step.elara ?? null;
        try {
          const res = await withTimeout(request, STEP_REPLY_TIMEOUT_MS);
          if (sending.current !== attempt || liveStep.current !== stepId) return;
          if (res.safety) {
            pauseForSafety(area, res.safety);
            return;
          }
          const text = res.reply.reply || fallback;
          setReply(text);
          if (text && replyStillFits(storedAnswer(stepId), askedFor)) {
            saveStepReply(area, dayNum, stepId, text, res.reply.generated, res.reply.retry);
          }
          if (res.reply.retry) {
            setRetry(true);
            setSubmitted(false);
          }
          if (res.dayCompleted) qc.invalidateQueries({ queryKey: ["pathQuestions"] });
        } catch {
          if (sending.current === attempt && liveStep.current === stepId) setReply(fallback);
      } finally {
        if (sending.current === attempt && liveStep.current === stepId) setPending(false);
      }
      } finally {
        if (sending.current === attempt) sending.current = null;
      }
    },
    [
      area,
      dayAnswers,
      dayNum,
      endPending,
      goNext,
      isLast,
      landscape,
      pauseForSafety,
      persist,
      qc,
      retry,
      saveStepReply,
      saved,
      screen,
      startPending,
      step,
      storedAnswer,
    ],
  );

  // Day 1 can carry the previous selection, but waits for her own tap before
  // submitting it and revealing Elara's response.

  const onSkip = useCallback(() => {
    if (!step) return;
    // What she had typed stays as this step's draft (the step screen has just
    // saved it), so going back to the step brings her words back: «Prefiero
    // pasar» moved on, it did not mean "throw this away". Cleared only over an
    // answer she already holds, where a left-behind draft came back on the next
    // visit over her saved answer.
    if (heldAnswer(storedAnswer(step.id))) useAppStore.getState().setDraft(stepDraftKey(area, dayNum, step.id), null);
    if (screen?.lead && !dayAnswers?.[screen.lead.id]) persist(screen.lead, null, { auto: true })?.catch(() => {});
    // A step she already answered (she came back to re-read it, a replay, an
    // edit from the collection) keeps her answer: Skip only moves on. Writing
    // the empty skip over it erased her words here and on the server.
    // Otherwise `auto`, so a skipped step is not recorded as a step completed
    // and does not earn the day on its own. The spec does not count moving
    // past something without answering it, and a day she skips her way
    // through still earns its day credit when it closes — which is the honest
    // reading: she walked it.
    if (!heldAnswer(storedAnswer(step.id))) persist(step, null, { auto: true })?.catch(() => {});
    // A skip is hers too (`lib/dayPin`).
    setAnsweredHere(true);
    goNext();
  }, [area, dayAnswers, dayNum, goNext, persist, screen, step, storedAnswer]);

  /**
   * A non-answer ("I'm not sure"): the step's `stateOptions`. The state is the
   * answer, so there is no value, no reply to wait for and no step beat — it is
   * written (locally, then queued like any step) and she moves on. It is not a
   * meaningful action either: no celebration, no rhythm.
   */
  const onStateAnswer = useCallback(
    (state: AnswerState) => {
      if (!step || state === "answered" || state === "declined" || state === "notOffered") return;
      setAnsweredHere(true);
      useAppStore.getState().setDraft(stepDraftKey(area, dayNum, step.id), null);
      if (screen?.lead && !dayAnswers?.[screen.lead.id]) persist(screen.lead, null, { auto: true })?.catch(() => {});
      persist(step, null, { state })
        ?.then((res) => {
          if (res.dayCompleted) qc.invalidateQueries({ queryKey: ["pathQuestions"] });
        })
        .catch(() => {});
      goNext();
    },
    [area, dayAnswers, dayNum, goNext, persist, qc, screen, step],
  );

  // "I'd rather not do this today" (`allowDecline`): on the day's first
  // question, while nothing of hers is in it and the day is still open. Ends
  // the day at once (every step declined, in one write) and leaves the way a
  // finished day does — without the celebration, the feedback ask or the
  // arrival, because nothing was done.
  const dayClosed = !!progress?.completedDays?.includes(dayNum);
  const firstQuestion = screens.findIndex((s) => !isAside(s.step));
  const canDecline =
    content?.config?.allowDecline === true &&
    !dayClosed &&
    index === firstQuestion &&
    // The server's rule (`holdsHerAnswer`): words, a pick, or a non-answer she chose.
    !steps.some((s) => holdsHerAnswer(dayAnswers?.[s.id]));
  const onDecline = useCallback(() => {
    declineDay(area, dayNum, steps).catch(() => {});
    qc.invalidateQueries({ queryKey: ["pathQuestions"] });
    leaveQuietly();
  }, [area, dayNum, declineDay, leaveQuietly, qc, steps]);

  const reviseAnswer = useCallback(() => {
    sending.current = null;
    liveStep.current = null;
    movingFrom.current = null;
    setSubmitted(false);
    setPending(false);
    setRetry(false);
    setReply(null);
  }, []);

  const walkAgain = useCallback(() => {
    sending.current = null;
    liveStep.current = null;
    movingFrom.current = null;
    setCursor(screens[Math.max(0, screens.findIndex((s) => !isAside(s.step)))]?.step.id ?? null);
    setSubmitted(false);
    setRetry(false);
    setReply(null);
    setPending(false);
    setAgain(true);
  }, [screens]);

  const back = useCallback(() => {
    sending.current = null;
    liveStep.current = null;
    movingFrom.current = null;
    // Back inside a day walks back through the day, not out of it, and not
    // back into the breathing moment: that was a way in, not a step.
    let prev = index - 1;
    while (prev >= 0 && isAside(screens[prev].step)) prev--;
    if (prev >= 0) {
      // Inside a world the scene steps back with the sheet: the next beat
      // moves it one step on from where it stands, so a scene left ahead
      // walked too far on the way forward again.
      if (wd && walk.current && !wd.complete) walk.current.settle(wd.stateAt(prev));
      setCursor(screens[prev].step.id);
      setSubmitted(false);
      setRetry(false);
      setReply(null);
      setPending(false);
      liveStep.current = null;
      return;
    }
    // Leave through the surface that started this practice. A Path card is a
    // commitment context, so dumping its reader onto Today is disorienting.
    // Her answers are already saved; drafts save as she types.
    leaveQuietly();
  }, [index, leaveQuietly, screens, wd]);

  /**
   * «Pedir la nota de Elara»: her takeaway was kept without a written note
   * (the reply failed or timed out, or she wrote it offline and the queue sent
   * it later without one). Her saved words are sent once more, live; the
   * server answers an unchanged answer whose kept reply is only the authored
   * line with a fresh reply (`unchanged` holds for a generated one only).
   */
  const askForNote = useCallback(
    (target: DayStep) => {
      const held = storedAnswer(target.id);
      if (!held || held.value == null) return;
      setNoteAsk("pending");
      withTimeout(
        sendStep(area, dayNum, { stepId: target.id, value: held.value, ...(held.mode ? { mode: held.mode } : {}) }),
        NOTE_ASK_TIMEOUT_MS,
      )
        .then((res) => {
          const fits = sameValue(storedAnswer(target.id)?.value ?? null, held.value);
          if (res.reply.reply && res.reply.generated && !res.reply.retry && fits) {
            saveStepReply(area, dayNum, target.id, res.reply.reply, true);
            setNoteAsk("done");
          } else setNoteAsk("failed");
        })
        .catch(() => setNoteAsk("failed"));
    },
    [area, dayNum, saveStepReply, sendStep, storedAnswer],
  );

  /** Through the breathing, or past it: on to the first question, no reply, no signal. */
  const onBreathed = useCallback(() => {
    if (!step) return;
    setAnsweredHere(true);
    persist(step, null, { replyless: true })?.catch(() => {});
    goNext();
  }, [goNext, persist, step]);

  // Inside a world the scene opens where her saved answers put it. A resume
  // on another step (the step she stepped back to, a step named by a link)
  // settles it on the step the sheet is on, once, before anything walks.
  const settledOnResume = useRef(false);
  useEffect(() => {
    if (settledOnResume.current || !resumed || !wd?.frozen || !walk.current) return;
    settledOnResume.current = true;
    const f = wd.frozen;
    if (wd.complete || f.opening || f.startArrived || f.startRevealed) return;
    if (f.initial.step !== index) walk.current.settle(wd.stateAt(index));
  });

  if (!content || !step || !path) {
    // A day that does not exist (a missing or broken number, a link past the
    // end of the path): say so, with a way back, rather than a blank screen.
    return (
      <PracticeThemeContext.Provider value={theme}>
        <ScreenStatusBar style={theme.dark ? "light" : "dark"} />
        <LinearGradient colors={theme.canvas} style={styles.root}>
          <SafeAreaView style={[styles.root, styles.stop]} edges={["top", "bottom"]}>
            <View style={styles.stopBody}>
              <AppText variant="editorialTitle" center color={theme.ink} accessibilityRole="header">
                {t.practice.missingDay.title}
              </AppText>
              <AppText variant="body" center color={theme.muted}>
                {t.practice.missingDay.body}
              </AppText>
            </View>
            <PracticeCta
              label={t.practice.missingDay.back}
              icon={null}
              onPress={() =>
                path ? router.dismissTo({ pathname: "/path/[area]", params: { area } }) : router.dismissTo("/(tabs)")
              }
            />
          </SafeAreaView>
        </LinearGradient>
      </PracticeThemeContext.Provider>
    );
  }

  if (safetyStop) {
    return (
      <PracticeThemeContext.Provider value={theme}>
        <ScreenStatusBar style={theme.dark ? "light" : "dark"} />
        <LinearGradient colors={theme.canvas} style={styles.root}>
          <SafeAreaView style={[styles.root, styles.stop]} edges={["top", "bottom"]}>
            <View style={styles.stopBody}>
              <CrisisCard card={safetyStop} />
            </View>
            <PracticeCta label={t.common.safety.backToToday} icon={null} onPress={() => router.replace("/(tabs)")} />
          </SafeAreaView>
        </LinearGradient>
      </PracticeThemeContext.Provider>
    );
  }

  // Opened ahead of the unlock rule (a notification, the Paths list, a deep
  // link): one guided day at a time, so it says when this one opens. A day
  // she already started is never taken back from her.
  if (gate && dayNum >= gate.nextDay && !dayAnswers) {
    const finished = dayPosition(gate.finishedDay, path.days);
    const opens = dayPosition(gate.nextDay, path.days);
    const nextUp = path.days[gate.nextDay - 1];
    return (
      <PracticeThemeContext.Provider value={theme}>
        <ScreenStatusBar style={theme.dark ? "light" : "dark"} />
        <LinearGradient colors={theme.canvas} style={styles.root}>
          <SafeAreaView style={[styles.root, styles.stop]} edges={["top", "bottom"]}>
            <View style={styles.stopBody}>
              <AppText variant="editorialTitle" center color={theme.ink} accessibilityRole="header">
                {t.home.today.dayDone(finished.week, finished.dayInWeek)}
              </AppText>
              <AppText variant="body" center color={theme.muted}>
                {opensWhen(opens, gate.opensAt, new Date(), t)}
              </AppText>
              {nextUp ? (
                <AppText variant="body" center color={theme.muted}>
                  {t.home.today.nextPractice(opens.week, opens.dayInWeek, nextUp.config?.teaser ?? nextUp.title)}
                </AppText>
              ) : null}
            </View>
            <PracticeCta label={t.common.safety.backToToday} icon={null} onPress={() => router.dismissTo("/(tabs)")} />
          </SafeAreaView>
        </LinearGradient>
      </PracticeThemeContext.Provider>
    );
  }

  const lead = screen.lead;
  const leadCard: LeadCard | undefined = lead
    ? {
        eyebrow: lead.config?.eyebrow ?? t.practice.followUp.eyebrow,
        question: (resolveTemplate(lead.title, lead.config?.titleFallback, ctx) ?? fillTemplate(lead.title, ctx)).parts,
        options: lead.config?.options ?? [],
        value: typeof dayAnswers?.[lead.id]?.value === "string" ? (dayAnswers[lead.id].value as string) : null,
        reply: dayAnswers?.[lead.id]?.reply ?? null,
        // An entry with no value is a skip. It used to leave the card exactly
        // as it was — Skip looked like it did nothing.
        skipped: !!dayAnswers?.[lead.id] && dayAnswers[lead.id].value == null,
        onAnswer: (option) => {
          setAnsweredHere(true);
          persist(lead, option)?.catch(() => {});
        },
        onSkip: () => {
          setAnsweredHere(true);
          persist(lead, null)?.catch(() => {});
        },
      }
    : undefined;

  // One numbering everywhere, week 1 included (fix list #7).
  const { dayInWeek } = dayPosition(dayNum, path.days);
  const eyebrow = t.practice.header.weekDayEyebrow(path.name, week, dayInWeek);
  const weekDays = path.days.filter((d) => weekOf(d.day, d.config) === week);
  const beat = !isQuiet(step) && !step.config?.deferReply;
  const minutes = content.config?.minutes;
  // The breathing moment is not a question: the bar, "Question 2 of 5" and
  // the dot pager count questions only (`questionProgress`).
  const progressNow = questionProgress(screens, index);
  const position = Math.max(1, progressNow.on);

  // The footer's button stays on screen above the keyboard now, so the header
  // no longer needs a second commit button of its own while she types.
  const trailing = step.kind === "followUp" && !dayAnswers?.[step.id] ? (
    <PressableScale
      size="chip"
      dim={0.6}
      onPress={onSkip}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={t.practice.followUp.skipA11y}
    >
      <AppText variant="caption" color={theme.muted}>
        {t.practice.cta.skip}
      </AppText>
    </PressableScale>
  ) : isLast && progressNow.total > 1 ? (
    t.practice.header.finalStep
  ) : minutes ? (
    t.practice.header.minutes(minutes)
  ) : undefined;

  // The line under the question: the option-free fallback when the question
  // before was skipped or answered «Ninguna por ahora» (`stepBody`).
  const stepLine = stepBody(step, steps, ctx)?.parts ?? null;

  // Elara saying back earlier answers from fixed phrases (`echoFrom`): it
  // stands where her line to the step before would, and is never generated.
  const echo = echoLines(step, steps, dayAnswers);
  const echoCard = echo.length ? { reply: echo.join(" "), pending: false } : null;

  if (wd && wd.frozen) {
    const w = wd.world;
    const nextWorld = worldForWeek(week + 1, area);
    const prevStep = prevScreen?.step;
    const prevAnswer = prevStep ? dayAnswers?.[prevStep.id] : undefined;
    const carried = echoCard ?? (
      prevStep &&
      !isQuiet(prevStep) &&
      !isBreathe(prevStep) &&
      prevStep.kind !== "followUp" &&
      step.config?.noticedFrom !== prevStep.id &&
      // Skipped (answered with nothing): there is nothing for her to answer.
      prevAnswer?.value != null &&
      // Elara's line to a hidden answer stays with the step it answered.
      !prevStep.config?.hidden &&
      !prevAnswer.retry
        ? {
            reply: prevAnswer?.reply ?? (prevPending ? null : prevStep.elara ?? null),
            pending: prevPending,
            // Her stored reply keeps its flag; the step's own line is authored.
            generated: prevAnswer?.reply ? prevAnswer.generated !== false : false,
          }
        : null);
    // A skip is never answered: no line from Elara closes a day whose last
    // step was skipped, not a kept reply and not the authored one.
    const lastAnswer = lastStep ? dayAnswers?.[lastStep.id] : undefined;
    const lastSkipped = !!lastStep && !!lastAnswer && isSkippedAnswer(lastStep, lastAnswer.value, stateOf(lastAnswer));
    const live = liveFrom && !lastSkipped ? dayAnswers?.[liveFrom]?.reply : undefined;
    const elaraLine =
      live ??
      resolveTemplate(content.config?.completeElara, t.practice.dayComplete.fallbackElara, ctx)?.text ??
      t.practice.dayComplete.fallbackElara;
    const S = t.photoDay.session;
    // The question before, as it stands on her card, with «Cambiar» (Q2 of a
    // session day). Nothing to link when she passed it.
    const cardStep = sessionDay && step.config?.card && prevStep?.config?.card ? prevStep : undefined;
    const cardOutcome = cardStep ? stepOutcome(cardStep, prevAnswer) : null;
    const hasLinked = !!cardStep && !!prevAnswer && (cardOutcome === "answered" || cardOutcome === "none");
    const linked =
      hasLinked && cardStep && prevAnswer
        ? { label: cardStep.config!.card!.label, value: answerText(prevAnswer.value, cardStep), onChange: back }
        : null;
    // ── The session's close: «Hoy te llevas», her card, Elara's note under it.
    // An answer the server refused for good is not hers on the card: its words
    // wait in its step (`keptAnswer`), never shown as kept.
    const refusedStep = (id: string) => isRefusedDraft(draftsNow[stepDraftKey(area, dayNum, id)]);
    const slots = (sessionDay ? takeawayCard(steps, dayAnswers) : []).map((x) =>
      x.text && refusedStep(x.stepId) ? { ...x, text: null, outcome: "skipped" as const } : x,
    );
    const anyAnswered = cardHasAnswers(slots);
    const takeStep = sessionDay ? takeawayStepOf(steps) : undefined;
    const takeAnswer = takeStep ? dayAnswers?.[takeStep.id] : undefined;
    const takeSlot = slots.find((x) => x.stepId === takeStep?.id);
    const refusedTake = !!takeStep && refusedStep(takeStep.id);
    // She wrote her takeaway. Without one the close is «Listo por hoy»: a calm
    // line, her choice if she made one, and no empty slot standing for words.
    const written = !!takeSlot?.text;
    const takeOutcome = takeStep ? stepOutcome(takeStep, takeAnswer) : "open";
    const noteReply = takeAnswer?.reply && !takeAnswer.retry ? takeAnswer.reply : null;
    // Only `false` means authored: answers kept before the flag existed were live.
    const noteGenerated = !!noteReply && takeAnswer?.generated !== false;
    const notePending = !!takeStep && takeStep.id === liveFrom && lastPending && !noteReply;
    const noteText = noteReply ?? takeStep?.elara?.trim() ?? null;
    const slotViews: TakeawaySlotView[] = !anyAnswered
      ? []
      : !written
        ? slots.filter((x) => !!x.text).map((x) => ({ key: x.stepId, label: x.label, text: x.text }))
        : slots.map((x) => ({
          key: x.stepId,
          label: x.label,
          text: x.text,
          stand: x.text
            ? null
            : x.noNote
              ? S.noNote
              : x.outcome === "stated" && x.state && x.state !== "answered" && x.state !== "notOffered" && x.state !== "declined"
                ? t.day.engine.states[x.state]
                : x.outcome === "open"
                  ? null
                  : S.skipped,
        }));
    const nextQ = path ? nextQuestion(path.days, dayNum, ctx) : null;
    const sessionClose: SessionClose | null = sessionDay
      ? {
          slots: slotViews,
          // «Editar» over her words, or to send again words that were refused.
          edit:
            (written || refusedTake) && takeStep && takeSlot && !replaying
              ? {
                  label: S.edit,
                  a11y: S.editA11y(takeSlot.label),
                  // The existing step link: the day opens on that step with her words in it.
                  onPress: () =>
                    router.replace({
                      pathname: "/path/day",
                      params: { area, day: String(dayNum), step: takeStep.id, ...(from ? { from } : {}) },
                    }),
                }
              : null,
          // Her takeaway's note, set second. A skip gets none; an answer with
          // no written note gets the step's authored line, labelled as such.
          note:
            written && takeOutcome === "answered" && (notePending || noteText)
              ? {
                  label: notePending || noteGenerated ? t.practice.elara.noticed : t.practice.elara.fromElara,
                  text: notePending ? null : noteText,
                  pending: notePending,
                }
              : null,
          askNote:
            takeStep &&
            !replaying &&
            written &&
            takeOutcome === "answered" &&
            !takeAnswer?.safety &&
            !takeAnswer?.retry &&
            !noteGenerated &&
            !notePending &&
            !networkOffline &&
            (noteAsk === "idle" || noteAsk === "pending")
              ? { label: S.askNote, busy: noteAsk === "pending", onPress: () => askForNote(takeStep) }
              : null,
          askNoteFailed: noteAsk === "failed" ? S.askNoteFailed : null,
        }
      : null;
    const ruleStep = steps.find((s) => s.config?.keep === "rule");
    const ruleAnswer = ruleStep ? dayAnswers?.[ruleStep.id] : undefined;
    // A hidden step's words are never carried onto the week's close.
    const ruleText =
      ruleStep && ruleAnswer && !ruleStep.config?.hidden ? answerText(ruleAnswer.value, ruleStep, stateOf(ruleAnswer)) : "";
    // The step she committed to after the rule (the week's last `commit`), when she chose one.
    const nextStepStep = [...steps].reverse().find((s) => s.config?.commit);
    const nextStepAnswer = nextStepStep ? dayAnswers?.[nextStepStep.id] : undefined;
    const nextStepText =
      nextStepStep && !nextStepStep.config?.hidden ? answerText(nextStepAnswer?.value, nextStepStep, stateOf(nextStepAnswer)) : "";
    const lastLandmark = landmark(t, w, 7);
    // The photo band (Money Journey prototype): every world while the photo day is on.
    const band = bandLayoutFor(w);
    const place = photoPlaceFor(w);
    const nextPlace = nextWorld ? photoPlaceFor(nextWorld) : null;
    const placeWords = (id: string) => (t.globe.places as Record<string, { name: string; country: string; blurb: string }>)[id];
    const nextPlacePhoto = nextPlace ? PLACE_HERO[nextPlace.id] : undefined;
    const weekTitle = weekDays.find((d) => d.config?.weekTitle)?.config?.weekTitle ?? null;
    const close: CloseContent = {
      line: wd.names.completion,
      lineSmall: wd.names.name,
      title: t.day.week.revealed(wd.names.name),
      rule: ruleText ? t.common.format.quote(ruleText.replace(/^[“"]|[”"]$/g, "")) : null,
      ruleWhere: ruleText && ruleAnswer ? t.day.week.ruleWhere(lastLandmark.at, longDate(ruleAnswer.answeredAt, locale)) : null,
      nextStep: nextStepText ? t.day.week.nextStep(nextStepText) : null,
      seeAtlas: t.day.week.seeAtlas,
      // The path's last world has no next one: the second way on goes home
      // instead of turning the page onto nothing.
      nextWorld:
        closeWayOn(!!nextWorld) === "nextWorld" ? (band ? t.photoDay.nextWeek : t.day.week.nextWorld) : t.day.horizon.done,
      announce: t.day.week.announce(wd.names.name, wd.names.completion),
      resolvedArt: (width, height) => <WorldArt worldId={w} variant="resolved" width={width} height={height} />,
      onShown: () => reportCompletionShown(w, userId ?? undefined),
      onSeeAtlas: () => {
        reportHandoffChoice(w, "atlas", userId ?? undefined);
        // The Atlas's Area view takes it from here (ATLAS stream): the card
        // settles, the thread is drawn on to the next world.
        router.replace({ pathname: "/(tabs)/atlas/[area]", params: { area, entry: "completion", world: w } });
      },
      onNextWorld: () => {
        reportHandoffChoice(w, "next_world", userId ?? undefined);
        if (closeWayOn(!!nextWorld) === "home") router.replace("/(tabs)");
      },
      horizon: nextWorld
        ? {
            // In the photo band the next place is its photograph, veiled, then clear.
            distant: (width, height) =>
              band && nextPlacePhoto ? (
                <View style={{ width, height }}>
                  <Image source={nextPlacePhoto} style={{ width, height }} resizeMode="cover" />
                  <View style={[StyleSheet.absoluteFill, styles.veil]} />
                </View>
              ) : (
                <WorldArt worldId={nextWorld} variant="distant" width={width} height={height} />
              ),
            near: (width, height) =>
              band && nextPlacePhoto ? (
                <Image source={nextPlacePhoto} style={{ width, height }} resizeMode="cover" />
              ) : (
                <WorldArt worldId={nextWorld} variant="active" state={initialSceneState(nextWorld, 1)} width={width} height={height} />
              ),
            ahead: t.day.horizon.ahead(t.world.worlds[nextWorld].name),
            // The paper worlds' lines describe their art; a photographed place says its own line.
            line:
              band && nextPlace
                ? placeWords(nextPlace.id)?.blurb ?? null
                : (t.day.horizon.lines as Record<string, string | undefined>)[nextWorld] ?? t.world.worlds[nextWorld].line,
            carried: band && nextPlace ? null : t.day.horizon.carried[nextWorld]?.(t.world.worlds[w].name) ?? null,
            // Pacing: with the default rule the next world's first day opens
            // tomorrow, so this is text, never a button (Motion system,
            // moment 8). Without pacing it simply says it is open.
            opens:
              gate && gate.nextDay === dayNum + 1
                ? band && nextPlace
                  ? t.photoDay.opensTomorrow(t.world.worlds[nextWorld].name)
                  : t.atlas.worlds[nextWorld].opensTomorrow
                : band && nextPlace
                  ? t.photoDay.open(t.world.worlds[nextWorld].name)
                  : t.day.horizon.open(t.world.worlds[nextWorld].name),
            done: t.day.horizon.done,
            onDone: () => router.replace("/(tabs)"),
          }
        : null,
      // The reveal in the photo band: the week's line, Elara's, and up to three of her own answers.
      week: band
        ? {
            line: t.photoDay.weekLine(path.name, week, weekTitle),
            elara: t.photoDay.kept,
            shifted: shiftedRows({
              days: weekDays.map((d) => ({ day: d.day, steps: stepsOf(d) })),
              book: ctx.book,
              question: (s, d) => {
                const at = { ...ctx, day: d };
                return resolveTemplate(s.title, s.config?.titleFallback, at)?.text ?? fillTemplate(s.title, at).text;
              },
              answer: (value, s) => answerText(value, s),
            }),
          }
        : null,
    };
    const leave = leaveQuietly;
    const summary = daySummary(steps, dayAnswers);
    // The place the day's own photograph shows: a different named place each day outside Money, else the week's.
    const dayPlace = place ? dayPlaceWords(t.dayPlaces, place.area, position0.dayInWeek) : null;
    const weekPlaceName = place ? placeWords(place.id)?.name ?? wd.names.name : wd.names.name;
    const bandPlace: BandPlace | null = place
      ? {
          id: place.id,
          name: dayPlace?.name ?? weekPlaceName,
          where: dayPlace?.where ?? t.photoDay.placeCountry(weekPlaceName, placeWords(place.id)?.country ?? ""),
          line: dayPlace?.line ?? t.globe.stops[stopsKeyFor(place)][hereIndexFor(position0.dayInWeek)] ?? "",
          photo: dayPhoto(place.area, place.week, position0.dayInWeek),
        }
      : null;
    // "Moraine Lake · Day 1": the pill and the eyebrows name the place in the picture.
    const placeDay = band && dayPlace ? t.day.placeDay(dayPlace.name, position0.dayInWeek) : wd.placeDay;
    // ── The session's opening: why today, the empty card, the week's note on
    // its first day, «La última vez anotaste» after it.
    const lastNoted =
      purpose && position0.dayInWeek > 1 && path && progress ? lastTakeaway(path.days, progress, dayNum) : null;
    const sessionOpen: SessionOpening | null =
      purpose && band
        ? {
            eyebrow: t.common.format.join(placeDay, minutes ? S.minutes(minutes) : null),
            title: wd.here.toward,
            whyLabel: S.whyToday,
            purpose,
            cardLabel: S.takeAway,
            slots: takeawayCard(steps, undefined).map((x) => ({
              key: x.stepId,
              label: x.label,
              text: null,
              stand: x.hint ?? null,
              empty: true,
              a11y: S.emptySlotA11y(x.label, x.hint ?? ""),
            })),
            weekNote:
              position0.dayInWeek === 1 && (weekTitle || intro?.note)
                ? { title: weekTitle ? S.weekNote(week, weekTitle) : intro?.title ?? "", body: intro?.note ?? null }
                : null,
            last: lastNoted
              ? {
                  label: S.lastTime,
                  text: lastNoted.text,
                  where:
                    lastNoted.week === week
                      ? S.lastDay(lastNoted.dayInWeek)
                      : S.lastWeekDay(lastNoted.week, lastNoted.dayInWeek),
                }
              : null,
          }
        : null;
    return (
      <PracticeThemeContext.Provider value={theme}>
        <ScreenStatusBar style={(band ? !place && wd.meta.dark : wd.meta.dark) ? "light" : "dark"} />
        <WorldDay
          // One mount per world and day: a new day on the same screen starts its own scene.
          key={wd.frozen.key}
          ref={walk}
          world={w}
          dark={wd.meta.dark}
          initial={wd.frozen.initial}
          opening={wd.frozen.opening}
          onOpened={() => {
            const opening = wd.frozen?.opening;
            if (opening?.kind === "poster" || opening?.kind === "name") useWorldLedger.getState().markEntered(w);
            if (opening?.kind === "return") useWorldLedger.getState().markReturnShown(dayKey(new Date()));
            setOpeningDone(true);
          }}
          header={{
            toward: wd.here.toward,
            placeDay,
            steps: progressNow.total,
            on: progressNow.on,
            // The question in short, for the line kept above the field while she
            // types. On a session's second question the question is its line
            // («¿Qué podrías averiguar…?»), not its heading («Para llevarte»).
            title:
              (hasLinked && stepLine ? stepLine.map((p) => p.text).join("").trim() : "") ||
              (resolveTemplate(step.title, step.config?.titleFallback, ctx)?.text ?? fillTemplate(step.title, ctx).text),
            // The compact band: her reply to read, or (a session's second
            // question) her choice, the line and the field to fit.
            reply: (!!carried && (carried.pending || !!carried.reply)) || hasLinked,
          }}
          backLabel={index > 0 ? t.practice.header.backA11y : t.practice.header.leaveA11y}
          onBack={back}
          trailing={
            <View style={styles.soundRow}>
              <AmbientControl />
              {step.kind === "followUp" && !dayAnswers?.[step.id] ? trailing : null}
            </View>
          }
          arrival={{
            eyebrow: placeDay,
            // The photo band's day done (prototype): the day's own headline, else "Done for today", and Continue.
            title: band
              ? sessionClose
                ? takeSlot?.text
                  ? S.takeAway
                  : t.photoDay.done
                : resolveTemplate(content.config?.completeTitle, undefined, ctx)?.text ?? t.photoDay.done
              : t.day.arrival.line(wd.here.at),
            elara: lastPending && !live && !lastSkipped ? null : elaraLine,
            elaraHidden: lastSkipped,
            session: band ? sessionClose : null,
            // A redone day has no "tomorrow": it is not the day her path is on.
            // A session day names tomorrow's first question when it can.
            tomorrow:
              wd.next && !replaying
                ? band
                  ? sessionDay && nextQ
                    ? S.tomorrow(nextQ)
                    : t.photoDay.tomorrow(wd.next.toward)
                  : t.day.arrival.tomorrow(wd.next.toward)
                : null,
            cta: replaying
              ? redoWeekId
                ? redoNext != null
                  ? t.day.arrival.redoNext(dayPosition(redoNext, path.days).dayInWeek)
                  : t.day.arrival.redoBackToWeek
                : t.day.arrival.redoDone
              : // One obvious way on from the completion screen: back to Today.
                band
                ? t.practice.dayComplete.backToday
                : t.day.arrival.done,
            announce: t.day.arrival.announce(wd.here.at, position0.dayInWeek, 7, replaying ? null : (wd.next?.toward ?? null)),
            line: t.day.arrival.line(wd.here.at),
            lineSmall: placeDay,
            onDone: replaying ? afterRedo : () => router.replace("/(tabs)"),
            // What she did and what is kept, on the one completion screen. A
            // redone day says only that it is kept: it is not new work. On a
            // session day her card says it, so the count is only for a day
            // where nothing was answered.
            // A session day without written words says it calmly, never grading
            // what she skipped.
            summary: replaying
              ? null
              : sessionClose
                ? written
                  ? null
                  : S.calmDone
                : t.practice.dayComplete.summary(summary.answered, summary.total),
            // An answer the server refused for good is said so (its words are
            // back in its step, `keptAnswer`), not covered by "saved".
            notSaved: refusedToday,
            saved: refusedToday
              ? t.practice.dayComplete.notSaved
              : saving
                ? t.practice.dayComplete.savedOffline
                : t.practice.dayComplete.saved,
            asks: replaying || !asks.length ? null : <CompletionAsks area={area} day={dayNum} asks={asks} />,
            // Partway through a week's redo she can stop here; it resumes from the week.
            again: wd.frozen.startArrived
              ? { label: t.day.arrival.again, onPress: walkAgain }
              : replaying && redoWeekId && redoNext != null
                ? { label: t.day.arrival.redoBackToWeek, onPress: backToWeek }
                : null,
          }}
          close={close}
          saving={saving}
          startArrived={wd.frozen.startArrived}
          startRevealed={wd.frozen.startRevealed}
          band={
            band
              ? {
                  place: bandPlace,
                  arriveScreen: {
                    eyebrow: placeDay,
                    // The week's note in words (Money Journey arrive screen), else the line of the place in the picture.
                    title: intro?.title ?? weekTitle ?? wd.names.name,
                    body: intro?.note ?? dayPlace?.line ?? (place ? placeWords(place.id)?.blurb ?? null : wd.names.line),
                    payoff: content.config?.payoff ?? null,
                    start: t.photoDay.start,
                    session: sessionOpen,
                  },
                  seeWhere: t.photoDay.seeWhere,
                  onLeave: leaveQuietly,
                }
              : null
          }
        >
          {() =>
            isBreathe(step) ? (
              <BreatheStep
                key={`${dayNum}:${step.id}`}
                step={step}
                eyebrow={eyebrow}
                bottomInset={insets.bottom}
                onDone={onBreathed}
                onBack={leave}
                compact
              />
            ) : (
              <StepScreen
                key={`${dayNum}:${step.id}`}
                area={area}
                dayNum={dayNum}
                step={step}
                lead={leadCard}
                savedValue={savedValue}
                dayAnswers={dayAnswers}
                ctx={ctx}
                beat={retry}
                locked={submitted}
                reply={reply}
                retry={retry}
                pending={pending}
                pendingNote={slowSave ? t.practice.cta.keepingWords : null}
                isLast={isLast}
                insets={insets}
                keyboardVisible={keyboard.visible}
                draftRef={draft}
                onSubmit={onSubmit}
                onAdvance={goNext}
                onRevise={reviseAnswer}
                onSkip={step.config?.optional ? onSkip : undefined}
                landscape
                carried={carried}
                savedState={savedState}
                onState={step.config?.stateOptions?.length ? onStateAnswer : undefined}
                onDecline={canDecline ? onDecline : undefined}
                linked={linked}
                carriedBelow={sessionDay}
                bodyParts={stepLine}
              />
            )
          }
        </WorldDay>
      </PracticeThemeContext.Provider>
    );
  }

  // "Respira conmigo": its own quiet screen, with no step bar and no reply.
  if (isBreathe(step)) {
    return (
      <PracticeThemeContext.Provider value={theme}>
        <ScreenStatusBar style={theme.dark ? "light" : "dark"} />
        <LinearGradient colors={theme.canvas} style={styles.root}>
          <SafeAreaView style={styles.root} edges={["top"]}>
            <BreatheStep
              key={`${dayNum}:${step.id}`}
              step={step}
              eyebrow={eyebrow}
              bottomInset={insets.bottom}
              onDone={onBreathed}
              onBack={back}
              sound={<AmbientControl />}
            />
          </SafeAreaView>
        </LinearGradient>
      </PracticeThemeContext.Provider>
    );
  }

  return (
    <PracticeThemeContext.Provider value={theme}>
      <ScreenStatusBar style={theme.dark ? "light" : "dark"} />
      <LinearGradient colors={theme.canvas} style={styles.root}>
        {/* Top-only: the footer applies the bottom inset itself. */}
        <SafeAreaView style={styles.root} edges={["top"]}>
          <KeyboardAvoider>
            {content.config?.header === "centered" || step.config?.pager === "dots" ? (
              <CenteredDayHeader
                eyebrow={eyebrow}
                minutes={minutes ? t.practice.header.minutes(minutes) : undefined}
                progress={position / Math.max(1, progressNow.total)}
                step={position}
                steps={progressNow.total}
                pager={step.config?.pager}
                sound={<AmbientControl />}
                onBack={back}
                // The X keeps her place like back on a first step: answers are
                // saved, drafts save as she types.
                onClose={() => router.dismissTo("/(tabs)")}
              />
            ) : (
              <DayHeader
                eyebrow={eyebrow}
                trailing={trailing}
                sound={<AmbientControl />}
                progress={position / Math.max(1, progressNow.total)}
                step={position}
                steps={progressNow.total}
                week={
                  week >= 2
                    ? {
                        done: (progress?.completedDays ?? [])
                          .filter((d) => weekDays.some((w) => w.day === d))
                          .map((d) => dayPosition(d, path.days).dayInWeek),
                        day: dayInWeek,
                        total: weekDays.length,
                      }
                    : undefined
                }
                onBack={back}
              />
            )}
            <View style={styles.body}>
              <StepScreen
                key={`${dayNum}:${step.id}`}
                area={area}
                dayNum={dayNum}
                step={step}
                lead={leadCard}
                savedValue={savedValue}
                dayAnswers={dayAnswers}
                ctx={ctx}
                beat={beat}
                locked={submitted}
                reply={reply}
                retry={retry}
                pending={pending}
                pendingNote={slowSave ? t.practice.cta.keepingWords : null}
                isLast={isLast}
                insets={insets}
                keyboardVisible={keyboard.visible}
                draftRef={draft}
                onSubmit={onSubmit}
                onAdvance={goNext}
                onRevise={reviseAnswer}
                onSkip={step.config?.optional ? onSkip : undefined}
                carried={echoCard}
                savedState={savedState}
                onState={step.config?.stateOptions?.length ? onStateAnswer : undefined}
                onDecline={canDecline ? onDecline : undefined}
                bodyParts={stepLine}
              />
            </View>
          </KeyboardAvoider>
        </SafeAreaView>
      </LinearGradient>
      {/* Asked once, after the breathing moment. */}
      <AmbientPrompt ready />
    </PracticeThemeContext.Provider>
  );
}

/**
 * The day screen, behind the closed beta's rule.
 *
 * A link (`elara://path/day?area=love&day=2`), a notification or an old
 * screen can name any Area. When the beta has not opened it, the day is never
 * mounted: nothing is drawn that could be answered, nothing is auto-saved, and
 * she lands on the Area's own screen, which says what the beta permits
 * (`BetaClosedNotice`) before any write is attempted. The server refuses the
 * same writes (`area_closed_beta`) whatever this screen does.
 */
export default function DayScreen() {
  const router = useRouter();
  const { area, day } = useLocalSearchParams<{ area: AreaKey; day?: string }>();
  const availability = useAreaAvailability();
  const closed = !!area && availability(area) === "beta";
  useEffect(() => {
    if (closed) router.replace({ pathname: "/path/[area]", params: { area } });
  }, [closed, router, area]);
  if (closed) return null;
  // One mount per area and day. A link or notification that names another day
  // while one is open changes the params on this same screen, and everything
  // inside (the step she is on, the replies, a resume) belongs to one day: the
  // paths give every day the same step ids (`ask`, `take`), so nothing else
  // would tell the two days apart.
  return <DayScreenInner key={`${area}:${day}`} />;
}

/**
 * Is this the same answer as the one already stored?
 *
 * Structural, because several `DayValue` shapes are objects that are never
 * compared by reference across a remount. Too permissive sends a request on
 * every revisit; too strict silently drops an edit, which is worse.
 */
function sameValue(a: DayValue, b: DayValue): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Race a promise against the clock. The server already answers with the
 * authored line when a model fails; this covers the request itself never
 * coming back. Both land in the same `catch`.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

const styles = StyleSheet.create({
  soundRow: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  stop: { paddingHorizontal: spacing[6], paddingBottom: spacing[4], gap: spacing[4] },
  stopBody: { flex: 1, justifyContent: "center", gap: spacing[3] },
  root: { flex: 1 },
  body: { flex: 1, minHeight: 0, marginTop: spacing[1] },
  /** The next place, still far off: its photograph under a cream veil. */
  veil: { backgroundColor: "rgba(247, 241, 232, 0.55)" },
});

/** An answer stuck on the phone longer than this shows "Saving your place". */
const SAVING_AFTER_MS = 4000;
/** «Pedir la nota de Elara» waits this long for her line before saying it did not come. */
const NOTE_ASK_TIMEOUT_MS = 12000;
/** How long a press may wait before the button says why. */
const SLOW_SAVE_MS = 1000;

/** Every part of the answer is one of the step's own authored options. */
function isAuthoredChoice(step: DayStep, value: DayValue | null | undefined): boolean {
  const options = step.config?.options ?? [];
  if (typeof value === "string") return options.includes(value);
  if (Array.isArray(value)) return value.length > 0 && value.every((v) => typeof v === "string" && options.includes(v));
  // A sort: every item placed in one of the step's own columns.
  if (step.kind === "sort" && value && typeof value === "object") {
    const columns = (step.config?.columns ?? []) as string[];
    return Object.values(value as Record<string, unknown>).every((v) => typeof v === "string" && columns.includes(v));
  }
  return false;
}

/** Whether an answer carries any words — the only answers the safety screen reads. */
function hasWords(value: DayValue | null | undefined): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((v) => typeof v === "string" && v.trim());
  if (typeof value === "object") {
    const caption = (value as { caption?: unknown }).caption;
    if (typeof caption === "string" && caption.trim()) return true;
    return Object.entries(value as Record<string, unknown>).some(
      ([k, v]) => k !== "drawing" && (typeof v === "string" ? !!v.trim() : false),
    );
  }
  return false;
}

/**
 * Onboarding's money feelings → Day 1's shared weather-mood options, by
 * position: [Calm, Okay, Heavy, Not sure]. By key and index rather than by
 * label, because the two screens are translated independently.
 */
const DAY1_FEELING_INDEX: Record<string, number> = { pressure: 2, avoidance: 3, uncertainty: 3 };

/** Her onboarding feeling as a Day 1 option — or nothing when Day 1 doesn't offer it. */
function carryFeeling(
  t: ReturnType<typeof useT>,
  area: AreaKey,
  answers: Record<string, string>,
  step: DayStep,
): string | undefined {
  if (area !== "money") return undefined;
  const said = resolveAnswer(t, area, "feeling", answers);
  if (!said) return undefined;
  const index = said.kind === "own" ? undefined : DAY1_FEELING_INDEX[said.key];
  return index === undefined ? undefined : step.config?.options?.[index];
}

/** "Saturday 10 October", in her language: where in time she made her rule. */
function longDate(at: number | undefined, locale: string): string {
  const d = new Date(at ?? Date.now());
  try {
    return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d);
  } catch {
    return d.toDateString();
  }
}
