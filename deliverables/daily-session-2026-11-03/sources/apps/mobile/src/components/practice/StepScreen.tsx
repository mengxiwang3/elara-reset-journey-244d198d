import {
  answerText,
  authoredReply,
  dayPosition,
  fillTemplate,
  hiddenPrefill,
  isChosen,
  isDrawn,
  isPhoto,
  OPTIONAL_ANSWER_STATES,
  isQuiet,
  optionsFor,
  recallEntries,
  resolveTemplate,
  sublineFor,
  type AnswerState,
  type DayStep,
  type DayStepAnswers,
  type DayValue,
  type ReflectMode,
  type TemplateContext,
  type TemplatePart,
  togglePick,
} from "@elara/shared";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject, ReactNode } from "react";
import { useKeyboardAwareScroll } from "@/hooks/useKeyboard";
import { Animated, Easing, Image, Platform, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from "react-native";
import { AppText } from "../AppText";
import { HiddenRecall } from "../HiddenRecall";
import { Icon } from "../Icon";
import { useLocale, useT } from "@/i18n";
import { useAppStore } from "@/store/useAppStore";
import { openLink } from "@/lib/legal";
import { duration, FadeIn, PressableScale, Reveal, stagger, interaction, useReducedMotion } from "@/motion";
import { useScreenReader } from "@/hooks/useScreenReader";
import { photoSource } from "@/lib/api";
import { colors, fontFamily, layout, radius, spacing, type, withAlpha } from "@/theme";
import { BlanksInput } from "./BlanksInput";
import { PracticeCta } from "./DayChrome";
import { CtaTone } from "./CenteredDayHeader";
import { DayScrollContext } from "./dayScroll";
import { DrawingView } from "./DrawPad";
import {
  choiceChangedUnder,
  draftFromStored,
  draftHoldsInput,
  draftValue,
  initialDraft,
  minWordsOf,
  modesOf,
  stepDraftKey,
  tooShort,
  type StepDraft,
} from "./draft";
import { ElaraCard, Parts } from "./ElaraCard";
import { ElaraNote } from "./ElaraNote";
import { elaraNoticed } from "./elaraLabel";
import { FollowUpCard } from "./FollowUpCard";
import { OptionList } from "./OptionList";
import { PhotoInput, usePracticePhoto } from "./PhotoInput";
import { Rehearse } from "./Rehearse";
import { SortCards } from "./SortCards";
import { SortColumns } from "./SortColumns";
import { useReplyPending } from "./pendingReplies";
import { ReflectInput } from "./ReflectInput";
import { SortRows } from "./SortRows";
import { StepVoiceNote } from "./StepVoiceNote";
import { StopScale } from "./StopScale";
import { usePracticeTheme } from "./theme";

const COMMIT_HORIZON = require("../../../assets/images/daily-path-commit-horizon-v1.png");
const MIDNIGHT_CELESTIAL = require("../../../assets/images/week-two-paper-moon-stars-v1.png");
const NIGHT_ART: Record<number, number> = {
  8: MIDNIGHT_CELESTIAL,
  9: require("../../../assets/images/week-two-day-9-paper-v1.png"),
  10: require("../../../assets/images/week-two-day-10-paper-v1.png"),
  11: require("../../../assets/images/week-two-day-11-paper-v1.png"),
  12: require("../../../assets/images/week-two-day-12-paper-v1.png"),
  13: require("../../../assets/images/week-two-day-13-paper-v1.png"),
  14: require("../../../assets/images/week-two-day-14-paper-v1.png"),
};
const DAY_TWO_RECEIPT = require("../../../assets/images/money-day2-followup-wide-v2.png");
const DAY_TWO_HAPPENED = require("../../../assets/images/money-day2-happened-wide-v2.png");
const DAY_TWO_SURPRISED = require("../../../assets/images/money-day2-surprised-wide-v2.png");
const DAY_TWO_WHY = require("../../../assets/images/money-day2-why-wide-v2.png");
const DAY_TWO_FEELS = require("../../../assets/images/money-day2-feels-wide-v2.png");
const WEEK_ONE_OPENING_ART: Record<number, number> = {
  1: require("../../../assets/images/daily-path-sort-landscape-v1.png"),
  2: DAY_TWO_RECEIPT,
  3: require("../../../assets/images/money-day3-pause-wide-v2.png"),
  4: require("../../../assets/images/money-day4-boundary-wide-v2.png"),
  5: require("../../../assets/images/money-day5-need-wide-v2.png"),
  6: require("../../../assets/images/money-day6-carry-wide-v2.png"),
  7: require("../../../assets/images/money-day7-rule-wide-v2.png"),
};

/** A follow-up drawn as a card at the top of the step that follows it. */
export interface LeadCard {
  eyebrow: string;
  question: TemplatePart[];
  options: string[];
  value: string | null;
  reply: string | null;
  /** She skipped it: the card collapses (it never blocks the day's first question). */
  skipped: boolean;
  onAnswer: (option: string) => void;
  onSkip: () => void;
}

/**
 * One screen of a practice day: its question, its input, and whatever Elara
 * says around it.
 *
 * Remounted per step (the caller keys it by step id), so every draft resets
 * without a reset effect and each question gets its own entrance.
 *
 * ## Three ways a step ends
 *
 * - **A reply beat** — the original shape: submit, Elara answers in her card,
 *   then continue. The button does two different things on purpose.
 * - **Quiet** (`isQuiet`) — one press and on to the next step. For quick picks,
 *   and wherever Elara has just spoken.
 * - **Deferred** (`deferReply`) — one press and on; her reply is requested now
 *   and appears on the next surface. See `DayConfig.deferReply`.
 *
 * The caller decides which, and passes `locked` / `reply` / `pending` for the
 * beat; this component only has to draw them.
 */
export function StepScreen({
  area,
  dayNum,
  step,
  lead,
  savedValue,
  dayAnswers,
  ctx,
  beat,
  locked,
  reply,
  retry,
  pending,
  pendingNote = null,
  isLast,
  insets,
  keyboardVisible,
  draftRef,
  onCanCommitChange,
  onSubmit,
  onAdvance,
  onRevise,
  onSkip,
  landscape = false,
  carried,
  savedState,
  onState,
  onDecline,
  linked = null,
  carriedBelow = false,
  bodyParts,
}: {
  area: string;
  dayNum: number;
  step: DayStep;
  lead?: LeadCard;
  savedValue: DayValue | undefined;
  dayAnswers: DayStepAnswers | undefined;
  ctx: TemplateContext;
  /** This step ends in a reply beat (neither quiet nor deferred). */
  beat: boolean;
  locked: boolean;
  reply: string | null;
  /** `reply` invites her to try again: it shows, and the input stays open under it. */
  retry?: boolean;
  pending: boolean;
  isLast: boolean;
  insets: { bottom: number };
  keyboardVisible: boolean;
  draftRef: MutableRefObject<DayValue>;
  onCanCommitChange?: (can: boolean) => void;
  /** `mode` is how a reflection was actually given — so Elara knows a transcript from typing. */
  /** Said under the button once a press has waited past a second. */
  pendingNote?: string | null;
  onSubmit: (value: DayValue, mode?: ReflectMode) => void;
  onAdvance: () => void;
  /** Reopen a just-submitted answer before moving to the next step. */
  onRevise?: () => void;
  /** Present when the step is skippable. */
  onSkip?: () => void;
  /**
   * The day is walked inside a world (Motion system, moment 1): this screen
   * sits on the paper sheet over the live scene. The scene is the art, so the
   * step's own illustration strip and the week badge stay off, and a single
   * choice moves on by itself 400 ms after the tap. Every step, the last one
   * included, moves on with an ordinary tap.
   */
  landscape?: boolean;
  /**
   * Elara's line to the step before, carried onto this sheet: her orb
   * shimmers, the line arrives whole, then this question follows.
   */
  carried?: { reply: string | null; pending: boolean; generated?: boolean } | null;
  /**
   * Her explicit non-answer to this step on an earlier visit (`StepAnswer.state`):
   * said back in words, and pressing on keeps it. Absent for an answered step.
   */
  savedState?: AnswerState;
  /**
   * Answer with a state instead of a value — the quiet actions under the
   * button, one per `config.stateOptions`. Absent when the step offers none.
   */
  onState?: (state: AnswerState) => void;
  /**
   * "I'd rather not do this today" — present only on the first question of a
   * day that allows it (`allowDecline`). Ends the day; see the day screen.
   */
  onDecline?: () => void;
  /**
   * The daily session (Nov 2026): the question before this one, as it stands
   * on her takeaway card («Tu elección · Mejorar mi trabajo actual»), with
   * «Cambiar», which goes back to it. Absent when there is nothing to link
   * (no card, or she passed the question before).
   */
  linked?: { label: string; value: string; onChange: () => void } | null;
  /**
   * The daily session: Elara's note to the step before (`carried`) sits under
   * the field, set second, and is hidden while the keyboard is up. The field
   * leads.
   */
  carriedBelow?: boolean;
  /**
   * The line under the question as the day screen resolved it (`stepBody`:
   * the option-free fallback after a skip or «Ninguna por ahora»). Undefined
   * resolves it here, from the step alone.
   */
  bodyParts?: TemplatePart[] | null;
}) {
  const t = useT();
  const router = useRouter();
  const theme = usePracticeTheme();
  const c = step.config ?? {};
  // Inside a world the sheet's own choreography sets the pace (Elara's line,
  // then the question), so the per-day editorial entrances stay off.
  const progressiveEntrance = !landscape && area === "money" && dayNum >= 1 && dayNum <= 14;
  const weekTwoEntrance = !landscape && area === "money" && dayNum >= 8 && dayNum <= 14;
  const feelingEntrance = !landscape && area === "money" && dayNum === 1 && step.id === "feeling";
  const dayTwoEditorial = area === "money" && dayNum === 2;
  const openingArt = area === "money" ? WEEK_ONE_OPENING_ART[dayNum] : undefined;
  const editorialBackgroundArt = landscape
    ? undefined
    : weekTwoEntrance
    ? NIGHT_ART[dayNum]
    : dayTwoEditorial ? dayTwoSource(step.id) : openingArt;
  const daySixRecap = area === "money" && dayNum === 6 && step.id === "tried";
  // A row of seven checks is a count; inside a world the place carries the week.
  const weekOnePayoff = !landscape && area === "money" && dayNum === 7 && step.id === "look";
  const contentDuration = feelingEntrance ? 600 : weekTwoEntrance ? 350 : progressiveEntrance ? 400 : undefined;
  // Elara's carried line leads: shimmer, then her words, then the question.
  const reducedLead = useReducedMotion();
  const carriedCard = !!carried && (carried.pending || !!carried.reply);
  // Her note leads only when it sits above the question; under the field it waits its turn.
  const carriedLead = carriedCard && !carriedBelow ? (reducedLead ? 0 : interaction.elaraShimmer + duration.base) : 0;
  const bodyDelay = feelingEntrance ? 550 : weekTwoEntrance ? 200 : progressiveEntrance ? 250 : 0;
  const promptDelay = feelingEntrance ? 1050 : weekTwoEntrance ? 400 : progressiveEntrance ? 500 : 0;
  const inputDelay = carriedLead + (feelingEntrance ? 1450 : weekTwoEntrance ? 600 : progressiveEntrance ? 750 : stagger.group * 2);
  const optionStaggerMs = feelingEntrance ? 450 : weekTwoEntrance ? 275 : progressiveEntrance ? 325 : undefined;
  const reducedMotion = reducedLead;
  const screenReader = useScreenReader();
  const { height: viewportHeight } = useWindowDimensions();
  const leadReady = !lead || lead.skipped || !!lead.value;
  const sparseEntrance = (!!lead && !leadReady) || step.kind === "recall";
  // With the keyboard up, the field she is writing in stays in view above the
  // footer, with the rest of its card (the divider and the mic row, ~88pt)
  // under it rather than cut off by the button.
  //
  // A session's second question types compact instead (`typingCompact`): her
  // choice, the heading, the line and a shorter field all held in view, with
  // nothing under the field to make room for and only the button below it.
  const typingCompact = keyboardVisible && !!linked;
  const keyboardScroll = useKeyboardAwareScroll(linked ? spacing[4] : 88);
  // The band's pill folds away while the page is scrolled; a new step starts at the top.
  const reportScroll = useContext(DayScrollContext);
  useEffect(() => {
    reportScroll?.(0);
  }, [reportScroll]);
  // Her reply lands under the field: bring the whole card up above the fixed
  // footer instead of leaving it to start below the fold.
  const replyLanded = beat && locked && !pending && !!reply;
  useEffect(() => {
    if (!replyLanded) return;
    const id = setTimeout(() => keyboardScroll.props.ref.current?.scrollToEnd({ animated: !reducedLead }), REPLY_SCROLL_MS);
    return () => clearTimeout(id);
  }, [replyLanded]); // eslint-disable-line react-hooks/exhaustive-deps
  const [noticeReady, setNoticeReady] = useState(false);
  useEffect(() => {
    setNoticeReady(false);
    if (!progressiveEntrance || !beat || !locked || pending) return;
    // The card arrives first, then its words, then the next action.
    const timer = setTimeout(
      () => setNoticeReady(true),
      reducedMotion ? 120 : interaction.elaraShimmer + (feelingEntrance ? 900 : 500),
    );
    return () => clearTimeout(timer);
  }, [beat, feelingEntrance, locked, pending, progressiveEntrance, reply, reducedMotion]);
  // Options are resolved once per mount: `optionsFrom` reads a step she has
  // already answered, and it must not reshuffle under her while she chooses.
  const options = useMemo(() => optionsFor(step, dayAnswers, ctx), [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const singleFollowOnChoice = !!step.config?.optionsFrom && options.length === 1;
  // A draft she left mid-step comes back exactly as she left it; otherwise the
  // step starts from what she saved (or nothing).
  const draftKey = stepDraftKey(area, dayNum, step.id);
  const [draft, setDraft] = useState<StepDraft>(
    () =>
      // Or an answer the server refused for good, kept for her (`keptAnswer`).
      draftFromStored(useAppStore.getState().drafts[draftKey], step, options, dayAnswers, ctx) ??
      // A hidden step's saved answer is not put back in the field on a revisit:
      // it waits behind the control below until she asks for it.
      initialDraft(step, c.hidden ? undefined : savedValue, options, dayAnswers, ctx),
  );
  // Her saved answer to a hidden step, or her saved non-answer: pressing on
  // without changing anything keeps it and moves on (nothing is re-sent).
  // Read once, on arrival: the screen is remounted per step, and what she types
  // or taps here is not something to hide from her while she is still on it.
  const [heldHidden] = useState(() => !!c.hidden && savedValue != null);
  // She went back and changed the answer this draft was written under (the
  // daily session's «Cambiar»): said once, on arrival, while she checks it.
  const [choiceChanged] = useState(
    () => !!linked && choiceChangedUnder(useAppStore.getState().drafts[draftKey], linked.value),
  );
  // What the question before said when this draft was kept (`StepDraft.basis`).
  const basis = linked?.value;
  const [heldState] = useState(() => !!savedState && savedState !== "notOffered");
  // A prefill that quotes a hidden step opens empty; the words wait behind a control.
  const heldPrefill = useMemo(
    () => (step.kind === "reflect" ? hiddenPrefill(step, dayAnswers, ctx) : null),
    [step], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // Asking her to pick the only thing she just named adds an empty tap. Carry
  // that one answer forward and let this screen become a short recognition
  // beat instead.
  useEffect(() => {
    if (!singleFollowOnChoice || locked || draft.choice === options[0]) return;
    setDraft((current) => ({ ...current, choice: options[0] }));
  }, [draft.choice, locked, options, singleFollowOnChoice]);
  // Nothing she does reaches the answer while it is being kept: the safety
  // wait after pressing on (up to 6 s) leaves the step unlocked, and edits
  // made then were never sent.
  const inert = locked || pending;
  // Saved as she types or taps — debounced, and never once the step is
  // submitted (the day screen clears it on submit). A press inside the
  // 300 ms window cancels the save still waiting, and no later one is made
  // until she changes something again (`sent`): it re-saved her words as a
  // draft after the day screen had cleared it, and next visit the stale
  // draft won over her saved answer.
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sent = useRef(false);
  useEffect(() => {
    if (inert || sent.current) return;
    const id = setTimeout(() => {
      draftTimer.current = null;
      useAppStore.getState().setDraft(draftKey, basis ? { ...draft, basis } : draft);
    }, 300);
    draftTimer.current = id;
    return () => clearTimeout(id);
  }, [draft, draftKey, inert, basis]);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const { value, answered } = draftValue(step, draft);
  const choiceCount = options.length + (c.otherLabel ? 1 : 0);
  const longChoiceList =
    (step.kind === "choose" || step.kind === "multi" || step.kind === "resonance") &&
    choiceCount > (c.layout === "grid" ? 6 : 3);
  const showMoreChoicesHint =
    progressiveEntrance && viewportHeight < 760 && longChoiceList && !locked && !answered;

  // After render, never during it: the draft is read on the header's commit
  // press, and the flag is pushed up only when it actually changes.
  const held = (heldHidden || heldState) && !answered;
  const committable = answered && !locked;
  useEffect(() => {
    draftRef.current = value;
  });
  useEffect(() => {
    onCanCommitChange?.(committable);
  }, [committable, onCanCommitChange]);

  const title = singleFollowOnChoice
    ? [{ text: t.practice.choice.singleFollowOn, quoted: false }]
    : resolveTemplate(step.title, c.titleFallback, ctx)?.parts ?? [{ text: step.title, quoted: false }];
  const noticedFrom = c.noticedFrom;
  const fromPending = useReplyPending(area, dayNum, noticedFrom);
  // An invitation to try again is not something she noticed.
  const fromAnswer = noticedFrom ? dayAnswers?.[noticedFrom] : undefined;
  // Elara's line to a hidden answer is not shown beside the next question either.
  const fromHidden = !!noticedFrom && !!ctx.stepAt?.(dayNum, noticedFrom)?.config?.hidden;
  const fromReply = fromAnswer?.retry || fromHidden ? undefined : fromAnswer?.reply;
  const noticedHeadline = resolveTemplate(c.noticed, c.noticedFallback, ctx)?.parts ?? null;
  const noticedQuote = fromReply ?? resolveTemplate(c.noticedQuote, undefined, ctx)?.parts ?? null;
  const showNoticed = !!(noticedHeadline || noticedQuote || fromPending);
  // "Elara noticed" only over words drawn from hers; a static or fallback line is "From Elara".
  const noticedEyebrow = elaraNoticed({
    reply: fromReply,
    generated: fromAnswer?.generated,
    pending: fromPending && !fromReply,
    parts: [noticedHeadline, typeof noticedQuote === "string" ? null : noticedQuote],
  })
    ? t.practice.elara.noticed
    : t.practice.elara.fromElara;
  // The beat's line: the stored reply carries its flag; the authored line is authored.
  const ownAnswer = dayAnswers?.[step.id];
  const replyEyebrow = elaraNoticed({
    reply,
    generated: reply != null && reply === ownAnswer?.reply ? ownAnswer.generated : reply === step.elara ? false : undefined,
    pending,
  })
    ? t.practice.elara.noticed
    : t.practice.elara.fromElara;
  const remember = resolveTemplate(c.remember, c.rememberFallback, ctx)?.parts ?? null;
  // The line under the question may quote her answer to an earlier step
  // ("You chose “Confirm income”..."), with a plain fallback when it cannot be
  // filled. A body with no reference is itself, whole.
  const body =
    bodyParts !== undefined
      ? bodyParts
      : step.body
        ? resolveTemplate(step.body, c.bodyFallback, ctx)?.parts ?? null
        : null;

  // A resonance step *is* Elara's observation and a question about it, so its
  // card leads and its title reads as the question under it.
  const questionUnderCard = step.kind === "resonance";
  const isFollowUpFull = step.kind === "followUp";
  // A quiet choice with replies written per option (Money Clarity v4: Days 6,
  // 7, 8, 10 and 11) answers the way a follow-up does: the authored line under
  // the options the moment she picks, no model and no wait. Quiet steps never
  // show a reply beat, so without this the authored teaching would be stored
  // and never seen. An option with no authored line shows nothing.
  const showsAuthoredReply =
    isFollowUpFull || (step.kind === "choose" && isQuiet(step) && !!c.replies?.some((r) => r.trim()));
  const mode = step.kind === "reflect" || !KNOWN.has(step.kind) ? draft.reflect.mode : null;

  const set = (patch: Partial<StepDraft>) => {
    sent.current = false;
    setDraft((d) => ({ ...d, ...patch }));
  };
  // A single choice inside a world moves on by itself 400 ms after the tap
  // (interaction.autoAdvanceMs). A change of mind inside the window restarts
  // it; with a screen reader nothing is timed and she moves on with the CTA.
  const autoAdvance =
    landscape &&
    !isLast &&
    step.kind === "choose" &&
    !c.otherLabel &&
    !c.detailLabel &&
    !singleFollowOnChoice &&
    !screenReader &&
    // Her authored reply needs time to be read: she moves on with the CTA.
    !showsAuthoredReply;
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);
  /**
   * Every way off this step goes through here first: the option's auto-advance
   * still waiting and the draft save still waiting are both cancelled. Left
   * running, the timer submitted her tap after she had pressed Skip, a state
   * or the decline (the answer overwrote the skip and the walk played twice).
   */
  const leaving = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (draftTimer.current) {
      clearTimeout(draftTimer.current);
      draftTimer.current = null;
    }
    sent.current = true;
  };
  const submit = (answer: DayValue, how?: ReflectMode) => {
    leaving();
    onSubmit(answer, how);
  };
  const changeLinked = () => {
    if (!linked) return;
    leaving();
    // Kept now, not in 300 ms: the step is about to unmount, and her last
    // words must survive the trip back to the question before.
    useAppStore.getState().setDraft(draftKey, { ...draft, basis: linked.value });
    linked.onChange();
  };
  const onChosen = (choice: string) => {
    if (feelingEntrance) {
      submit(choice);
      return;
    }
    if (!autoAdvance || inert) return;
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      submit(choice);
    }, interaction.autoAdvanceMs);
  };
  // Held here, not in the input, so the footer's one button can be "Take
  // photo" until there is a photo to move on with.
  const photo = usePracticePhoto(draft.photo, (next) => setDraft((d) => ({ ...d, photo: next })));
  const needsPhoto =
    step.kind === "photo" && !draft.photo.describe && !draft.photo.uri && !draft.photo.photo && !locked;

  const previewing = step.kind === "photo" && photo.status === "preview" && !locked;
  const ctaLabel = feelingEntrance ? t.practice.cta.continue : needsPhoto
    ? t.practice.photo.take
    : previewing
      ? t.practice.photo.use
      : c.cta && !(beat && locked && !isLast)
      ? c.cta
      : mode === "say" && draft.reflect.text.trim()
        ? t.practice.cta.doneSpeaking
        : beat && !locked
          ? t.practice.cta.continue
          : isLast
            ? t.practice.cta.finishToday
            : t.practice.cta.next;

  return (
    <View style={styles.root}>
      <ScrollView
        {...keyboardScroll.props}
        onScroll={(e) => {
          keyboardScroll.props.onScroll?.(e);
          reportScroll?.(e.nativeEvent.contentOffset.y);
        }}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scroll,
          (daySixRecap || sparseEntrance) && styles.recapScroll,
          // Room to lift the field's card clear of the footer while she types:
          // without it a step that just fits has nothing to scroll by.
          keyboardVisible && { paddingBottom: typingCompact ? spacing[4] : 88 },
          typingCompact && styles.typingScroll,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        {lead ? (
          <Reveal visible={!lead.skipped}>
            <FollowUpCard {...lead} editorial={dayTwoEditorial} />
          </Reveal>
        ) : null}

        <Reveal visible={leadReady}>
          <View style={[styles.stepContent, typingCompact && styles.typingContent]}>
        {editorialBackgroundArt ? (
          <Image
            source={editorialBackgroundArt}
            resizeMode={weekTwoEntrance ? "contain" : "cover"}
            style={[styles.editorialBackdrop, weekTwoEntrance && styles.midnightCelestial,
              weekTwoEntrance && (dayNum === 9 || dayNum === 12) && styles.nightArtRight,
              weekTwoEntrance && (dayNum === 10 || dayNum === 13) && styles.nightArtLeft,
              weekTwoEntrance && (dayNum === 11 || dayNum === 14) && styles.nightArtCenter,
            ]}
            accessible={false}
          />
        ) : null}

        {linked ? (
          <View style={[styles.linked, { borderColor: theme.cardBorder }]}>
            {/* The label over her words, as on her card: at a large text size
                her choice keeps its two lines instead of sharing them with
                the label. The padding sits outside the clamped text (inside
                it, a third line showed through on web). */}
            <View style={styles.linkedTextWrap} accessible accessibilityLabel={`${linked.label}: ${linked.value}`}>
              <AppText style={styles.linkedLabel}>{linked.label}</AppText>
              <AppText style={styles.linkedText} numberOfLines={2}>
                {linked.value}
              </AppText>
            </View>
            <PressableScale
              size="chip"
              onPress={changeLinked}
              disabled={inert}
              style={styles.change}
              accessibilityRole="button"
              accessibilityLabel={t.photoDay.session.changeA11y(linked.label, linked.value)}
            >
              <AppText style={styles.changeLabel}>{t.photoDay.session.change}</AppText>
            </PressableScale>
          </View>
        ) : null}

        {carriedCard && carried && !carriedBelow ? (
          <ElaraCard
            eyebrow={
              elaraNoticed({ reply: carried.reply, generated: carried.generated, pending: carried.pending && !carried.reply })
                ? t.practice.elara.noticed
                : t.practice.elara.fromElara
            }
            quote={carried.reply}
            pending={carried.pending && !carried.reply}
          />
        ) : null}

        {showNoticed && questionUnderCard ? (
          <FadeIn>
            <ElaraCard
              eyebrow={noticedEyebrow}
              headline={noticedHeadline}
              quote={noticedQuote}
              pending={fromPending && !fromReply}
            />
          </FadeIn>
        ) : null}

        {c.showFrom && !ctx.stepAt?.(dayNum, c.showFrom)?.config?.hidden ? (
          <FadeIn>
            <ShownAnswer value={dayAnswers?.[c.showFrom]?.value} day={dayNum} />
          </FadeIn>
        ) : null}

        {/* Her own earlier words come first, then the question under them
            (Interaction States spec: the recall card "fades in before the
            question below it"). */}
        {step.kind === "recall" ? (
          <FadeIn>
            <RecallBody step={step} ctx={ctx} />
          </FadeIn>
        ) : null}

        {/* A guide's voice note, when the step carries one: above the
            question it speaks to (mc-d5-2). */}
        {c.voiceNote?.audioUrl ? (
          <FadeIn>
            <StepVoiceNote noteId={`${area}-${dayNum}-${step.id}`} note={c.voiceNote} />
          </FadeIn>
        ) : null}

        {weekOnePayoff ? (
          <FadeIn>
            <LinearGradient
              colors={[withAlpha(theme.accent, 0.16), withAlpha(colors.secondary, 0.12), theme.card]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.weekComplete, { borderColor: theme.cardBorder }]}
            >
              <View style={[styles.weekCompleteIcon, { backgroundColor: withAlpha(theme.accent, 0.14) }]}>
                <Icon name="solar:medal-star-bold" size={24} color={theme.accent} />
              </View>
              <View style={styles.flex}>
                <AppText variant="label" color={theme.accent}>{t.practice.weekComplete}</AppText>
                <View style={styles.weekDots} accessible accessibilityLabel={t.practice.weekCompleteA11y}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <Icon key={i} name="solar:check-circle-bold" size={17} color={theme.accent} />
                  ))}
                </View>
              </View>
            </LinearGradient>
          </FadeIn>
        ) : null}

        {/* The question. A recall or a follow-up carries its own eyebrow. */}
        <FadeIn delay={carriedLead + stagger.group} duration={contentDuration} style={styles.head}>
          {c.eyebrow || isFollowUpFull ? (
            <AppText variant="label" color={theme.accent}>
              {c.eyebrow ?? t.practice.followUp.eyebrow}
            </AppText>
          ) : null}
          {questionUnderCard ? (
            <View style={styles.promptRow}>
              <View style={[styles.promptDot, { backgroundColor: theme.accent }]} />
              <AppText variant="sectionTitle" color={theme.ink} style={styles.flex} accessibilityRole="header">
                <Parts parts={title} color={theme.ink} />
              </AppText>
            </View>
          ) : step.title.trim() ? (
            <AppText
              variant="sectionTitle"
              color={theme.ink}
              accessibilityRole="header"
            >
              <Parts parts={title} color={theme.ink} />
            </AppText>
          ) : null}
          {body && !feelingEntrance && !singleFollowOnChoice ? (
            <FadeIn delay={bodyDelay} duration={contentDuration ?? 0}>
              <AppText variant="body" color={theme.muted} style={styles.bodyText}>
                <Parts parts={body} color={theme.ink} />
              </AppText>
            </FadeIn>
          ) : null}
          {choiceChanged && !locked ? (
            <View style={styles.changed} accessible accessibilityLiveRegion="polite">
              <Icon name="solar:info-circle-linear" size={18} color={colors.secondary} />
              <AppText style={styles.changedText}>{t.photoDay.session.changedChoice}</AppText>
            </View>
          ) : null}
          {c.prompt ? (
            <FadeIn delay={promptDelay} duration={contentDuration ?? 0}>
            <View style={[styles.promptRow, styles.promptGap, feelingEntrance && styles.editorialPromptRow]}>
              {feelingEntrance ? null : <View style={[styles.promptDot, { backgroundColor: theme.accent }]} />}
              <AppText
                variant={feelingEntrance ? "sectionTitle" : "cardTitle"}
                color={theme.ink}
                style={styles.flex}
              >
                {c.prompt}
              </AppText>
            </View>
            </FadeIn>
          ) : null}
        </FadeIn>

        {/* The Day 2 opener already owns its receipt illustration inside the
            follow-up card. A second full-width image beneath it read like a
            duplicated block, not a new chapter. */}
        {/* What she answered on an earlier visit, when it is hidden or a state:
            the words wait behind a control, a state is said in words. */}
        {heldHidden && !locked ? (
          <FadeIn>
            <HiddenRecall
              label={c.hiddenLabel}
              chosen={isChosen(step, savedValue)}
              reveal={() => answerText(savedValue, step)}
              resetKey={`${dayNum}:${step.id}`}
            />
          </FadeIn>
        ) : null}
        {heldPrefill && !locked ? (
          <FadeIn>
            <HiddenRecall
              label={heldPrefill.label}
              chosen={heldPrefill.chosen}
              reveal={() => {
                const text = heldPrefill.reveal();
                return (
                  <View style={styles.stack}>
                    <AppText variant="body" color={theme.ink}>
                      {text}
                    </AppText>
                    <PressableScale
                      size="chip"
                      onPress={() => set({ reflect: { ...draft.reflect, text } })}
                      style={styles.useAsStart}
                      accessibilityRole="button"
                      accessibilityLabel={t.day.engine.hidden.useAsStart}
                    >
                      <AppText variant="control" color={theme.accent}>
                        {t.day.engine.hidden.useAsStart}
                      </AppText>
                    </PressableScale>
                  </View>
                );
              }}
              resetKey={`${dayNum}:${step.id}`}
            />
          </FadeIn>
        ) : null}
        {heldState && savedState && !locked ? (
          <AppText variant="body" color={theme.muted} accessibilityLiveRegion="polite">
            {t.day.engine.saved[savedState as Exclude<AnswerState, "answered" | "notOffered">]}
          </AppText>
        ) : null}
        {/* Her answer to this step was refused by the server for good and put
            back in the field (`keptAnswer`): say so, rather than show it as new. */}
        {draft.refused && !locked ? (
          <AppText variant="body" color={theme.muted} accessibilityLiveRegion="polite">
            {t.practice.refused.step}
          </AppText>
        ) : null}

        {/* The input. Dimmed and inert once submitted — the answer is in, and
            the eye belongs on what she said back. */}
        <FadeIn delay={inputDelay} duration={contentDuration} style={[styles.input, inert && styles.answered]}>
          <View pointerEvents={inert ? "none" : "auto"} style={styles.inputInner}>
            <Input
              step={step}
              options={options}
              draft={draft}
              set={set}
              ctx={ctx}
              onVoiceError={setVoiceError}
              photo={photo}
              optionStaggerMs={optionStaggerMs}
              editorial={area === "money" && dayNum === 1}
              insightCards={area === "money" && step.id === "look"}
              singleFollowOnChoice={singleFollowOnChoice}
              onChoiceSelected={feelingEntrance || autoAdvance ? onChosen : undefined}
              compact={typingCompact}
            />
          </View>
        </FadeIn>

        {/* Under the field, her note to the question before gives way to this
            step's own reply when there is one (an invitation to try again),
            so that reply is read right under her words, not below the fold. */}
        {carriedBelow && carriedCard && carried && !keyboardVisible && !(beat && (locked || !!retry) && (pending || !!reply)) ? (
          <FadeIn delay={inputDelay + stagger.group}>
            <ElaraNote
              label={
                elaraNoticed({ reply: carried.reply, generated: carried.generated, pending: carried.pending && !carried.reply })
                  ? t.practice.elara.noticed
                  : t.practice.elara.fromElara
              }
              text={carried.reply}
              pending={carried.pending && !carried.reply}
            />
          </FadeIn>
        ) : null}

        {area === "money" && dayNum === 8 && step.id === "felt" &&
          draft.scale !== null && draft.scale >= 1 && draft.scale <= 5 ? (
          <View accessibilityLiveRegion="polite" style={styles.scaleAcknowledgment}>
            <AppText variant="label" color={theme.accent}>{t.practice.elara.says}</AppText>
            <AppText variant="body" color={theme.ink}>
              {t.practice.elara.moneyFeltReplies[draft.scale - 1]}
            </AppText>
          </View>
        ) : null}

        {/* A follow-up answers with its own authored line, the moment she
            picks — no model, no wait, and the same line the server keeps. */}
        {showsAuthoredReply ? (
          <Reveal visible={!!authoredReply(step, value)}>
            <ElaraCard eyebrow={t.common.guide.name} quote={authoredReply(step, value)} />
          </Reveal>
        ) : null}

        <Reveal visible={!!voiceError}>
          <AppText variant="caption" color={colors.destructive}>
            {voiceError}
          </AppText>
        </Reveal>

        {remember && (step.kind === "read" || locked || answered) ? (
          <FadeIn delay={stagger.group * 3}>
            <ElaraCard eyebrow={t.practice.elara.remembers} quote={remember} speak />
            <PressableScale size="chip" onPress={() => router.push("/memory")} accessibilityRole="button" style={{ paddingVertical: 12 }}>
              <AppText variant="control" color={theme.accent}>{t.ux.inspectMemory}</AppText>
            </PressableScale>
          </FadeIn>
        ) : null}

        {showNoticed && !questionUnderCard ? (
          <FadeIn delay={stagger.group * 3}>
            <ElaraCard
              eyebrow={noticedEyebrow}
              headline={noticedHeadline}
              quote={noticedQuote}
              pending={fromPending && !fromReply}
            />
          </FadeIn>
        ) : null}

        {c.note ? (
          <FadeIn delay={stagger.group * 3}>
            <View style={[styles.note, { borderColor: theme.cardBorder, backgroundColor: withAlpha(theme.card, theme.dark ? 1 : 0.7) }]}>
              <AppText variant="body" color={theme.muted} center>
                {c.note}
              </AppText>
            </View>
          </FadeIn>
        ) : null}

        {/* Elara's reply beat. Three dots while she is thinking, her words when
            they land, nothing at all if there was neither — never an error. */}
        {beat ? (
          <Reveal visible={locked || !!retry} duration={feelingEntrance ? 900 : progressiveEntrance ? 600 : undefined}>
            {pending || reply ? (
              <ElaraCard eyebrow={replyEyebrow} quote={reply} pending={pending} />
            ) : null}
          </Reveal>
        ) : null}

        {feelingEntrance && locked && noticeReady && onRevise ? (
          <FadeIn>
            <PressableScale
              size="chip"
              onPress={onRevise}
              style={styles.changeAnswer}
              accessibilityRole="button"
              accessibilityLabel={t.common.action.edit}
            >
              <Icon name="solar:restart-bold" size={17} color={theme.accent} />
              <AppText variant="control" color={theme.accent}>{t.common.action.edit}</AppText>
            </PressableScale>
          </FadeIn>
        ) : null}
          </View>
        </Reveal>
      </ScrollView>

      {/* Always on screen — above the keyboard too (the day is wrapped in a
          KeyboardAvoider), because the client asked for the orange button to
          stay in the same place and in view "no matter what". */}
      {leadReady && (!progressiveEntrance || !beat || (feelingEntrance ? noticeReady : !locked || noticeReady)) && (
        <FadeIn duration={progressiveEntrance && beat && locked ? 450 : 0}>
        <View style={[styles.footer, { paddingBottom: keyboardVisible ? spacing[2] : insets.bottom + spacing[4] }]}>
          {showMoreChoicesHint ? (
            <View style={styles.moreChoices} accessible accessibilityLabel={t.practice.choice.moreBelow}>
              <AppText variant="caption" color={theme.muted}>{t.practice.choice.moreBelow}</AppText>
              <Icon name="solar:alt-arrow-down-linear" size={16} color={theme.muted} />
            </View>
          ) : null}
          {isFollowUpFull && !answered ? (
            <AppText variant="body" color={theme.muted} center style={styles.hint}>
              {t.practice.followUp.selectToContinue}
            </AppText>
          ) : (
            // The look-back (mc-d7-1) continues on a dark button, as designed.
            <CtaTone dark={c.pager === "dots"}>
              <PracticeCta
                label={ctaLabel}
                icon={
                  needsPhoto
                    ? "solar:camera-minimalistic-bold"
                    : isLast && (locked || !beat)
                      ? "solar:check-circle-bold"
                      : "solar:arrow-right-linear"
                }
                disabled={pending || photo.status === "uploading" || photo.status === "preparing" || (!needsPhoto && !previewing && !locked && !answered && !held)}
                loading={pending}
                background={area === "money" && dayNum === 1 ? theme.button : undefined}
                onPress={() => {
                  // A tap on the CTA inside the auto-advance window is the
                  // move on: left running, the timer submitted the same answer
                  // a second time and the day skipped the next step.
                  if (advanceTimer.current) {
                    clearTimeout(advanceTimer.current);
                    advanceTimer.current = null;
                  }
                  if (needsPhoto) photo.pick("camera");
                  else if (previewing) void photo.use();
                  else if (locked || held) {
                    leaving();
                    onAdvance();
                  } else submit(value, mode ?? undefined);
                }}
              />
              {pending && pendingNote ? (
                <AppText variant="caption" color={theme.muted} center accessibilityLiveRegion="polite" style={styles.pendingNote}>
                  {pendingNote}
                </AppText>
              ) : null}
            </CtaTone>
          )}
          {/* Typing a session's second question, the button alone stays over the
              keyboard; «Pasar por ahora» is back the moment the keyboard goes. */}
          {onState && !locked && !pending && !typingCompact ? (
            <View style={styles.states}>
              {OPTIONAL_ANSWER_STATES.filter((s) => c.stateOptions?.includes(s)).map((s) => (
                <PressableScale
                  key={s}
                  size="chip"
                  dim={0.6}
                  onPress={() => {
                    leaving();
                    onState(s);
                  }}
                  style={styles.skip}
                  accessibilityRole="button"
                  accessibilityLabel={t.day.engine.stateA11y(t.day.engine.states[s])}
                  accessibilityState={{ selected: savedState === s }}
                >
                  <AppText variant="control" color={theme.muted}>
                    {t.day.engine.states[s]}
                  </AppText>
                </PressableScale>
              ))}
            </View>
          ) : null}
          {onDecline && !locked && !pending && !typingCompact ? (
            <PressableScale
              size="chip"
              dim={0.6}
              onPress={() => {
                leaving();
                onDecline();
              }}
              style={styles.skip}
              accessibilityRole="button"
              accessibilityLabel={t.day.engine.declineA11y}
            >
              <AppText variant="control" color={theme.muted}>
                {t.day.engine.decline}
              </AppText>
            </PressableScale>
          ) : null}
          {onSkip && !locked && !pending && !typingCompact ? (
            <PressableScale
              size="chip"
              dim={0.6}
              onPress={() => {
                // What she typed or picked is kept as this step's draft, at once
                // (the debounced save may still be waiting): «Prefiero pasar»
                // moves on, it does not throw her words away. The day screen
                // clears it only over an answer she already holds (`onSkip`).
                if (!inert && draftHoldsInput(step, draft)) {
                  useAppStore.getState().setDraft(draftKey, { ...draft, refused: undefined });
                }
                leaving();
                onSkip();
              }}
              style={styles.skip}
              accessibilityRole="button"
              accessibilityLabel={c.skipLabel ?? t.practice.cta.skipForNow}
            >
              <AppText variant="control" color={theme.muted}>
                {c.skipLabel ?? t.practice.cta.skipForNow}
              </AppText>
            </PressableScale>
          ) : null}
        </View>
        </FadeIn>
      )}
    </View>
  );
}

function dayTwoSource(stepId: string): number {
  return (
    stepId === "happened" ? DAY_TWO_HAPPENED :
    stepId === "surprised" ? DAY_TWO_SURPRISED :
    stepId === "why" ? DAY_TWO_WHY :
    stepId === "feels" ? DAY_TWO_FEELS :
    DAY_TWO_RECEIPT
  );
}

/** After the reply card's fade starts, so the scroll measures its full height. */
const REPLY_SCROLL_MS = 450;

const KNOWN = new Set([
  "reflect",
  "choose",
  "info",
  "action",
  "scale",
  "multi",
  "read",
  "sort",
  "recall",
  "followUp",
  "resonance",
  "photo",
  "blanks",
]);

/**
 * An option's second line. A subline may quote an earlier answer ("My money
 * rule" over her rule); one whose quote cannot be filled is left off rather
 * than shown with a hole in it.
 */
function resolvedSubline(step: DayStep, option: string, ctx: TemplateContext): string | undefined {
  const raw = sublineFor(step, option);
  if (!raw || !raw.includes("{")) return raw;
  const filled = fillTemplate(raw, ctx);
  return filled.complete ? filled.text : undefined;
}

/**
 * An earlier answer of the day, shown small above the question — the drawing
 * she is about to title, the photo she is explaining.
 */
function ShownAnswer({ value, day }: { value: DayValue | undefined; day: number }) {
  const t = useT();
  const theme = usePracticeTheme();
  const drawn = isDrawn(value) ? value : null;
  const shot = isPhoto(value) ? value : null;
  if (!drawn && !shot) return null;
  return (
    <View style={[styles.shown, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={[styles.shownThumb, { backgroundColor: drawn ? theme.paper : theme.card }]}>
        {drawn ? (
          <DrawingView drawing={drawn.drawing} ink={theme.paperInk} strokeWidth={4} style={styles.fill} />
        ) : shot?.photo ? (
          <Image source={photoSource(shot.photo.id)} style={styles.fill} resizeMode="cover" />
        ) : null}
      </View>
      <View style={styles.flex}>
        <AppText variant="label" color={theme.accent}>
          {drawn ? t.practice.shown.drawing : t.practice.shown.photo}
        </AppText>
        <AppText variant="body" color={theme.ink} numberOfLines={2}>
          {shot?.caption.trim() || t.practice.shown.reflection(dayPosition(day).week, dayPosition(day).dayInWeek)}
        </AppText>
      </View>
    </View>
  );
}

/** The input for a step's kind. An unknown kind fails soft to a text field. */
function Input({
  step,
  options,
  draft,
  set,
  ctx,
  onVoiceError,
  photo,
  optionStaggerMs,
  editorial = false,
  insightCards = false,
  singleFollowOnChoice = false,
  onChoiceSelected,
  compact = false,
}: {
  step: DayStep;
  options: string[];
  draft: StepDraft;
  set: (patch: Partial<StepDraft>) => void;
  ctx: TemplateContext;
  onVoiceError: (message: string | null) => void;
  photo: ReturnType<typeof usePracticePhoto>;
  optionStaggerMs?: number;
  editorial?: boolean;
  /** Money's week look-back: each bullet a card with its own icon (wallet, pause, boundary, heart). */
  insightCards?: boolean;
  singleFollowOnChoice?: boolean;
  onChoiceSelected?: (choice: string) => void;
  /** Typing compact (see `typingCompact`): a shorter field, its foot set aside. */
  compact?: boolean;
}) {
  const t = useT();
  const theme = usePracticeTheme();
  const c = step.config ?? {};
  // A tap past a multi-select's limit: counts up to re-trigger the shake, and
  // clears itself after two seconds so the notice goes away.
  const [limitHit, setLimitHit] = useState(0);
  useEffect(() => {
    if (!limitHit) return;
    const id = setTimeout(() => setLimitHit(0), 2000);
    return () => clearTimeout(id);
  }, [limitHit]);
  const onLimit = () => setLimitHit((n) => n + 1);
  const other = c.otherLabel
    ? {
        label: c.otherLabel,
        placeholder: c.otherPlaceholder ?? t.practice.choice.otherPlaceholder,
        subline: c.otherSubline,
        text: draft.other,
        onText: (text: string) => set({ other: text }),
      }
    : undefined;
  const isDayOneCommitment = editorial && step.id === "commit";
  // The paper weather beside each option (`EMOTION_ART`: stressed, calm,
  // unsure…) was drawn for the Day 1 feelings check-in, `feeling`, and its
  // four moods. Day 1 has asked about her income since the curriculum (23 Oct,
  // step `ask`), and a storm beside «Lo que gano» reads as a verdict on it, so
  // every other editorial list is bare (its paper treatment stays).
  const weatherArt = editorial && step.id === "feeling";

  switch (step.kind) {
    case "choose":
    case "resonance":
    case "followUp": {
      if (singleFollowOnChoice) {
        return (
          <View style={[styles.singleFollowOn, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
            <AppText variant="label" color={theme.accent}>{t.practice.elara.youNoticed}</AppText>
            <AppText variant="control" color={theme.ink}>{options[0]}</AppText>
          </View>
        );
      }
      const list = (
        <OptionList
          options={options}
          sublines={options.map((o) => resolvedSubline(step, o, ctx))}
          selected={draft.choice ? [draft.choice] : []}
          onToggle={(key) => { set({ choice: key }); onChoiceSelected?.(key); }}
          staggerMs={optionStaggerMs}
          startDelay={0}
          layout={c.layout}
          editorial={editorial}
          editorialBare={isDayOneCommitment || !weatherArt}
          other={other}
        />
      );
      if (!c.detailLabel) {
        return isDayOneCommitment ? (
          <View style={styles.commitmentBlock}>
            {list}
            <Image source={COMMIT_HORIZON} resizeMode="cover" style={styles.commitmentHorizon} />
          </View>
        ) : list;
      }
      return (
        <View style={styles.stack}>
          {list}
          <View style={styles.detail}>
            <AppText variant="caption" color={theme.accent}>
              {c.detailLabel}
            </AppText>
            <TextInput
              value={draft.detail}
              onChangeText={(detail) => set({ detail })}
              placeholder={c.detailPlaceholder}
              placeholderTextColor={withAlpha(theme.muted, 0.6)}
              maxLength={200}
              style={[styles.detailInput, { color: theme.ink, borderColor: theme.cardBorder, backgroundColor: theme.card }]}
              accessibilityLabel={c.detailLabel}
            />
          </View>
        </View>
      );
    }
    case "blanks":
      return (
        <BlanksInput
          fields={c.fields ?? []}
          placeholders={c.placeholders}
          examples={c.examples}
          values={draft.blanks}
          onChange={(blanks) => set({ blanks })}
        />
      );
    case "photo":
      return (
        <PhotoInput
          draft={draft.photo}
          onChange={(next) => set({ photo: next })}
          status={photo.status}
          onPick={photo.pick}
          onRetake={photo.retake}
          onRetry={photo.retry}
          captionPlaceholder={c.placeholder}
        />
      );
    case "multi": {
      const cap = c.maxSelections ?? 0;
      const atCap = cap > 0 && draft.picks.length >= cap;
      return (
        <View style={styles.stack}>
          {cap > 0 && cap < options.length + (other ? 1 : 0) ? (
            <AppText variant="caption" color={theme.muted}>
              {c.ranked
                ? t.practice.rank.progress(cap, draft.picks.length)
                : t.practice.choice.pickUpTo(cap, draft.picks.length)}
            </AppText>
          ) : null}
          {/* A tap past the limit: the list shakes gently and says so for two
              seconds (Interaction States spec). */}
          <Reveal visible={limitHit > 0}>
            <AppText variant="control" color={theme.accent}>
              {t.practice.choice.limit(cap)}
            </AppText>
          </Reveal>
          <Shake trigger={limitHit}>
            <OptionList
              multi
              ranks={c.ranked ? (c.rankLabels ?? [...t.practice.rank.places]) : undefined}
              options={options}
              sublines={options.map((o) => resolvedSubline(step, o, ctx))}
              selected={draft.picks}
              blocked={atCap}
              onToggle={(key) => {
                const next = togglePick(step, draft.picks, key);
                if (cap > 0 && next.length > cap) {
                  onLimit();
                  return;
                }
                set({ picks: next });
              }}
              layout={c.layout}
              other={other}
              staggerMs={optionStaggerMs}
              exclusiveKey={c.exclusiveOption === undefined ? undefined : options[c.exclusiveOption]}
            />
          </Shake>
        </View>
      );
    }
    case "sort": {
      const columns = (c.columns ?? []) as string[];
      if (columns.length !== 2) return null;
      if (c.sortLayout === "columns") {
        return (
          <SortColumns
            items={c.items ?? []}
            columns={[columns[0], columns[1]]}
            sorted={draft.sorted}
            onPlace={(item, column) => set({ sorted: { ...draft.sorted, [item]: column } })}
          />
        );
      }
      if (c.sortLayout === "cards") {
        return (
          <SortCards
            items={c.items ?? []}
            columns={[columns[0], columns[1]]}
            sorted={draft.sorted}
            onPlace={(item, column) => set({ sorted: { ...draft.sorted, [item]: column } })}
            onUndo={(item) => {
              const { [item]: _undone, ...rest } = draft.sorted;
              set({ sorted: rest });
            }}
            editorial={editorial}
          />
        );
      }
      return (
        <SortRows
          items={c.items ?? []}
          columns={[columns[0], columns[1]]}
          sorted={draft.sorted}
          onPlace={(item, column) => set({ sorted: { ...draft.sorted, [item]: column } })}
          editorial={editorial}
        />
      );
    }
    case "scale": {
      if (c.stops?.length) {
        return (
          <StopScale
            stops={c.stops}
            value={draft.scale}
            onChange={(scale) => set({ scale })}
            escapeLabel={c.escape ? (c.escapeLabel ?? t.practice.scale.escape) : undefined}
          />
        );
      }
      // A numbered scale, as the original kind was authored.
      const min = c.min ?? 1;
      const max = c.max ?? 5;
      const numbers = Array.from({ length: Math.max(2, max - min + 1) }, (_, i) => String(min + i));
      return (
        <View style={styles.stack}>
          <OptionList
            layout="chips"
            options={numbers}
            selected={draft.scale === null ? [] : [String(draft.scale)]}
            onToggle={(key) => set({ scale: Number(key) })}
            staggerMs={optionStaggerMs}
          />
          <View style={styles.scaleEnds}>
            <AppText variant="caption" color={theme.muted}>
              {c.minLabel ?? t.home.day.scaleLow}
            </AppText>
            <AppText variant="caption" color={theme.muted}>
              {c.maxLabel ?? t.home.day.scaleHigh}
            </AppText>
          </View>
        </View>
      );
    }
    case "action": {
      const label = c.actionLabel ?? step.title;
      const doneLabel = draft.done ? t.home.day.done : c.link ? t.home.day.markDone : label;
      return (
        <View style={styles.stack}>
          {c.link ? (
            <PressableScale
              size="card"
              onPress={() => openLink(c.link!)}
              style={[styles.link, { borderColor: withAlpha(theme.accent, 0.3) }]}
              accessibilityRole="link"
              accessibilityLabel={label}
            >
              <AppText variant="control" color={theme.accent} style={styles.flex}>
                {label}
              </AppText>
              <AppText variant="label" color={theme.accent}>
                {t.home.day.open}
              </AppText>
            </PressableScale>
          ) : null}
          <OptionList
            multi
            options={[doneLabel]}
            selected={draft.done ? [doneLabel] : []}
            onToggle={() => set({ done: !draft.done })}
            staggerMs={optionStaggerMs}
          />
        </View>
      );
    }
    case "read":
      if (c.rehearse) {
        const lines = (c.bullets ?? [])
          .map((b) => resolveTemplate(b, undefined, ctx))
          .filter((b): b is NonNullable<typeof b> => !!b && b.complete)
          .map((b) => b.parts);
        return <Rehearse lines={lines} />;
      }
      return <ReadBody step={step} ctx={ctx} insightCards={insightCards} />;
    case "recall":
      // Drawn above the question instead (see StepScreen).
      return null;
    case "info":
      return null;
    default:
      return (
        <ReflectInput
          modes={modesOf(step)}
          draft={draft.reflect}
          onChange={(reflect) => set({ reflect })}
          placeholder={c.placeholder ?? t.home.day.placeholder}
          ideas={c.ideas}
          onError={onVoiceError}
          // Three colours and two line sizes on every pad (Interaction States spec).
          palette
          askCaption={c.askCaption !== false}
          shapes={!!c.shapes}
          editInPlace={!!(c.prefill || c.prefillFrom)}
          editorial={editorial}
          compact={compact}
          shortHint={
            draft.reflect.mode !== "draw" && tooShort(step, draft.reflect.text)
              ? (c.ideas?.length ? t.practice.reflect.tooShortIdeas : t.practice.reflect.tooShort)(minWordsOf(step))
              : null
          }
        />
      );
  }
}

/**
 * A read step's cards. A bullet may quote an earlier answer; one that cannot
 * be filled is left out rather than printed with a hole in it.
 */
function ReadBody({ step, ctx, insightCards }: { step: DayStep; ctx: TemplateContext; insightCards: boolean }) {
  const theme = usePracticeTheme();
  const bullets = (step.config?.bullets ?? [])
    .map((b) => resolveTemplate(b, undefined, ctx))
    .filter((b): b is NonNullable<typeof b> => !!b && b.complete);
  if (!bullets.length) return null;
  return (
    <View style={styles.stack}>
      {bullets.map((b, i) => {
        const content = (
          <>
            {insightCards ? (
              <View style={[styles.insightIcon, { backgroundColor: withAlpha(theme.accent, 0.12) }]}>
                <Icon
                  name={[
                    "solar:wallet-money-bold-duotone",
                    "solar:pause-bold",
                    "solar:shield-check-bold",
                    "solar:heart-bold-duotone",
                  ][i] ?? "solar:check-circle-bold"}
                  size={19}
                  color={theme.accent}
                />
              </View>
            ) : (
              <View style={[styles.promptDot, { backgroundColor: theme.accent }]} />
            )}
            <AppText variant="body" color={theme.ink} style={styles.flex}>
              <Parts parts={b.parts} color={theme.ink} />
            </AppText>
          </>
        );
        return insightCards ? (
          <FadeIn key={i} delay={i * 180}>
            <LinearGradient
              colors={[withAlpha(theme.accent, 0.09), withAlpha(colors.secondary, 0.07), theme.card]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bullet, { borderColor: theme.cardBorder }]}
            >
              {content}
            </LinearGradient>
          </FadeIn>
        ) : (
          <View key={i} style={[styles.bullet, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

/** Her earlier answers, quoted back with what each one was. */
function RecallBody({ step, ctx }: { step: DayStep; ctx: TemplateContext }) {
  const t = useT();
  const locale = useLocale();
  const theme = usePracticeTheme();
  const entries = recallEntries(step, ctx);
  if (!entries.length) return null;
  const dayName = (day: number) => {
    const { week, dayInWeek } = dayPosition(day);
    return t.common.time.weekDay(week, dayInWeek);
  };
  return (
    <View style={[styles.recall, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
      {entries.map((e, i) => (
        <View
          key={`${e.day}-${e.label}`}
          style={[styles.recallRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.cardBorder }]}
        >
          <View style={styles.recallHead}>
            {step.id === "tried" ? (
              <Icon
                name={i === 0 ? "solar:pause-bold" : "solar:shield-check-bold"}
                size={18}
                color={i % 2 ? colors.secondary : theme.accent}
              />
            ) : (
              <View style={[styles.promptDot, { backgroundColor: i % 2 ? colors.secondary : theme.accent }]} />
            )}
            <AppText variant="label" color={theme.muted}>
              {/* The day she said it, by name when we know it — "El martes
                  dijiste…" (Interaction States spec); older answers carry no
                  time, so they keep the path day. */}
              {e.answeredAt
                ? t.common.format.join(t.practice.saidOn(weekdayName(e.answeredAt, locale)), e.label)
                : t.common.format.join(dayName(e.day), e.label)}
            </AppText>
          </View>
          {e.hidden && e.reveal ? (
            // A hidden answer is a label and a control; her words are built
            // only when she asks, and gone again when she looks away.
            <HiddenRecall label={e.label} chosen={e.chosen} reveal={e.reveal} resetKey={`${e.day}-${e.label}`} />
          ) : (
            // Her words, quoted back, set apart by their quote marks and indent.
            <AppText variant="body" color={theme.ink} style={styles.recallQuote}>
              “{e.text}”
            </AppText>
          )}
        </View>
      ))}
    </View>
  );
}

/** "martes", "Tuesday" — the weekday of a moment, in her language. */
function weekdayName(at: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(new Date(at));
  } catch {
    return new Date(at).toDateString().slice(0, 3);
  }
}

/**
 * A gentle side-to-side shake each time `trigger` goes up — "the list shakes
 * gently" at a multi-select's limit. Still under Reduce Motion (the notice
 * beside it says the same thing in words).
 */
function Shake({ trigger, children }: { trigger: number; children: ReactNode }) {
  const reduced = useReducedMotion();
  const [x] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!trigger || reduced) return;
    const step = (toValue: number) =>
      Animated.timing(x, { toValue, duration: 55, easing: Easing.linear, useNativeDriver: true });
    Animated.sequence([step(-6), step(6), step(-4), step(4), step(0)]).start();
  }, [trigger, reduced, x]);
  return <Animated.View style={{ transform: [{ translateX: x }] }}>{children}</Animated.View>;
}

/** Where a practice step's unsent input is kept (`useAppStore.drafts`); lives in `./draft` so the store can use it. */
export { stepDraftKey };

const styles = StyleSheet.create({
  pendingNote: { marginTop: spacing[2] },
  root: { flex: 1, minHeight: 0 },
  // The footer is the day's one forward action. Let longer prompts and the
  // editorial choice cards scroll beneath it rather than pushing it off the
  // bottom of smaller phones.
  scrollView: { flex: 1, minHeight: 0 },
  scroll: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    // Clears the fixed action area so the final option, and the last line of
    // Elara's reply, remain fully readable and tappable on shorter phones.
    paddingBottom: layout.scrollPadBottom,
    gap: spacing[5],
  },
  recapScroll: { flexGrow: 1, justifyContent: "center", paddingBottom: spacing[6] },
  head: { gap: spacing[2] },
  // The line under the question: the session's reading size (P1-9).
  bodyText: { fontSize: 16, lineHeight: 23 },
  // «Tu elección» over «Mejorar mi trabajo actual», and «Cambiar»: one compact row.
  linked: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingLeft: spacing[3.5],
    paddingRight: spacing[1],
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.content * 1.5,
    backgroundColor: "#FFFEFB",
  },
  linkedTextWrap: { flex: 1, minWidth: 0, paddingVertical: spacing[2], gap: 2 },
  linkedText: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 22, color: colors.foreground },
  linkedLabel: { fontFamily: fontFamily.sansSemibold, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  change: { minHeight: 44, minWidth: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing[3] },
  changeLabel: { fontFamily: fontFamily.sansSemibold, fontSize: 15, lineHeight: 20, color: colors.secondary },
  changed: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[2],
    marginTop: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    borderRadius: radius.content,
    backgroundColor: "#E8EDE3",
  },
  changedText: { flex: 1, minWidth: 0, fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 21, color: colors.foreground },
  editorialPromptRow: { marginTop: spacing[5] },
  stepContent: { gap: spacing[5], width: "100%", position: "relative", overflow: "hidden" },
  // Typing compact: the same order, closer together.
  typingScroll: { paddingTop: spacing[3], gap: spacing[3] },
  typingContent: { gap: spacing[3] },
  editorialBackdrop: {
    width: "100%",
    height: 88,
    borderRadius: radius.content,
    opacity: 0.9,
  },
  midnightCelestial: { height: 84, opacity: 0.85, borderRadius: 0 },
  scaleAcknowledgment: { gap: spacing[2], paddingVertical: spacing[2] },
  nightArtRight: { width: "72%", alignSelf: "flex-end", height: 76, marginTop: spacing[2] },
  nightArtLeft: { width: "80%", alignSelf: "flex-start", height: 92 },
  nightArtCenter: { width: "94%", alignSelf: "center", height: 108, marginBottom: spacing[2] },
  singleFollowOn: { borderWidth: 1, borderRadius: radius.feature, padding: spacing[5], gap: spacing[2] },
  commitmentBlock: { gap: spacing[4] },
  commitmentHorizon: { width: "100%", height: 138, borderRadius: radius.feature },
  flex: { flex: 1 },
  promptRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing[3] },
  promptGap: { marginTop: spacing[4] },
  promptDot: { width: 7, height: 7, borderRadius: radius.full, marginTop: 8 },
  weekComplete: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    borderWidth: 1,
    borderRadius: radius.feature,
    padding: spacing[4],
  },
  weekCompleteIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  weekDots: { flexDirection: "row", gap: spacing[1], marginTop: spacing[1] },
  insightIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.row,
    alignItems: "center",
    justifyContent: "center",
  },
  changeAnswer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    minHeight: 44,
    paddingHorizontal: spacing[4],
  },
  input: { width: "100%" },
  inputInner: { width: "100%" },
  // Submitted, not disabled: the answer stays legible, it just stops being
  // the thing on the screen asking for attention.
  answered: { opacity: 0.55 },
  stack: { gap: spacing[3], width: "100%" },
  scaleEnds: { flexDirection: "row", justifyContent: "space-between" },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    borderWidth: 1,
    borderRadius: radius.row,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  bullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
    borderWidth: 1,
    borderRadius: radius.content,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  recall: { borderWidth: 1, borderRadius: radius.feature, paddingHorizontal: spacing[5] },
  recallRow: { paddingVertical: spacing[4], gap: spacing[2] },
  recallHead: { flexDirection: "row", alignItems: "center", gap: spacing[2.5] },
  recallQuote: { paddingLeft: spacing[5] },
  note: {
    borderWidth: 1,
    borderRadius: radius.content,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  footer: { paddingHorizontal: spacing[6], paddingTop: spacing[3], gap: spacing[2] },
  moreChoices: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing[1] },
  hint: { paddingVertical: spacing[4] },
  skip: { alignSelf: "center", minHeight: 44, justifyContent: "center", paddingHorizontal: spacing[4] },
  states: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  useAsStart: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  fill: { width: "100%", height: "100%" },
  shown: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    borderWidth: 1,
    borderRadius: radius.content,
    padding: spacing[3],
  },
  shownThumb: { width: 56, height: 56, borderRadius: radius.row, overflow: "hidden", padding: spacing[1] },
  detail: { gap: spacing[2], marginTop: spacing[2] },
  detailInput: {
    ...type.body,
    borderWidth: 1,
    borderRadius: radius.content,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3.5],
    minHeight: 52,
  },
});
