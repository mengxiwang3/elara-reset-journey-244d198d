/**
 * Response DTOs — the read-model shapes the API returns and the clients render.
 * Kept deliberately explicit (not inferred from Drizzle) so the wire contract
 * is stable and framework-neutral.
 */
import type { CirclePaper, MemberNoteDTO, SeatDTO, SharedAnswerDTO, WhereYouMetDTO } from "./circles";
import type { SafetyCardDTO } from "./safety";
import type {
  AreaKey,
  CircleState,
  ConnectionStatus,
  ContentStatus,
  DayKind,
  EventAccessKind,
  EventStatus,
  PriceKind,
  PurchaseStatus,
  PushPrefKind,
  ReactionType,
  ReflectionVisibility,
  ReportPriority,
  ResourceAccessKind,
  ResourceFormat,
  ResourceStatus,
  RiskFlag,
  SeasonKey,
  SubscriptionStatus,
  SupportAuthorRole,
  SupportCategory,
  SupportStatus,
  UserRole,
  WorkshopTier,
} from "./enums";
import type { AssessmentAnswers, AssessmentDeepDive, AssessmentScores } from "./assessment";
import type { Locale } from "./locale";
import type { EventTranslations } from "./schemas";
import type { GenerationStatus, PersonalizationStatus } from "./personalization";
import type { OptionalAnswerState } from "./answerStates";
import type { StepCondition } from "./offered";
import type { DayStep, DayStepAnswers } from "./steps";

/**
 * Per-kind authoring config for a day. A flat optional bag (not a strict union)
 * so the CMS can set only the fields a kind needs and new kinds add fields here
 * WITHOUT a schema migration. Persisted as JSON on `path_day.config`.
 */
export interface DayConfig {
  options?: string[]; // choose / multi: the selectable options
  placeholder?: string; // reflect: input hint
  actionLabel?: string; // action: the thing to do / CTA
  link?: string; // action: optional url or deep link
  min?: number; // scale: low end (default 1)
  max?: number; // scale: high end (default 5)
  minLabel?: string; // scale: caption under the low end
  maxLabel?: string; // scale: caption under the high end
  maxSelections?: number; // multi: cap on how many options may be picked
  // new kinds add their config keys here — no migration needed.

  // ── Practice redesign (Sep 2026) ─────────────────────────────────────────
  // Everything below is optional and additive, so a day authored before the
  // redesign is unchanged and an older app build simply ignores what it does
  // not know. See `docs/DAY-STEPS.md` § "Step kinds" for what each one is for.
  //
  // Text fields marked *template* may quote the member's own earlier answers:
  // `{stepId}` is a step of the same day, `{d3.stepId}` a step of day 3, and
  // `|lower` lower-cases the quote ("{d1.feeling|lower}" → "pressure"). A
  // template whose quote cannot be resolved shows its `…Fallback` instead —
  // never a half-filled sentence. See `resolveTemplate()`.

  /** Every kind: a second, smaller question under the headline (ember dot). */
  prompt?: string;
  /** Every kind: the footer button's label, when "Continue" is the wrong verb. */
  cta?: string;
  /** Every kind: a quiet bordered note under the input. */
  note?: string;
  /**
   * Every kind: no Elara reply beat after this step — the member moves on in
   * one press. For steps where Elara has just spoken (`resonance`) or where a
   * reply would interrupt a run of quick picks.
   */
  quiet?: boolean;
  /**
   * Every kind: the step may be skipped. Skipping records a `null` answer, so
   * the day can still close — a skipped step is answered, with nothing.
   */
  optional?: boolean;
  /** Every kind: an "Elara noticed" card above the input. *Template.* */
  noticed?: string;
  /** A pull-quote under `noticed`, set smaller. *Template.* */
  noticedQuote?: string;
  noticedFallback?: string;
  /** An "Elara remembers" card — usually quoting an earlier day. *Template.* */
  remember?: string;
  rememberFallback?: string;
  /**
   * This step's answer belongs in the member's collection. `rule` is the one
   * the week's synthesis leads with; `sentence` is any other line worth
   * keeping. Drawings are always collected and need no flag.
   */
  keep?: "sentence" | "rule";

  // choose / multi / resonance / followUp
  /** A second line per option, parallel to `options`. Never stored. */
  sublines?: string[];
  /** An extra "Something else" option with a text field. Stored as the typed text. */
  otherLabel?: string;
  otherPlaceholder?: string;
  otherSubline?: string;
  /**
   * Offer the member's own picks from an earlier step of the same day instead
   * of `options` ("which one surprised you most?"). Falls back to `options`
   * when that step has no answer.
   */
  optionsFrom?: string;
  /** How the options are laid out. Presentation only. */
  layout?: "list" | "grid" | "chips";
  /** choose: this answer is the day's experiment, followed up tomorrow. */
  commit?: boolean;
  /**
   * multi: the index (in `options`) of an answer that excludes the others —
   * "Nothing stands out". Picking it clears the rest; picking anything else
   * clears it.
   */
  exclusiveOption?: number;
  /** reflect: words needed before Next enables when writing. Default 2; a title takes 1. */
  minWords?: number;
  /**
   * A guide's voice note above the question — Ale's 0:34 on Money Day 5
   * (mc-d5-2). Played in the voice-note player. No URL, no note: the step
   * never shows a player with nothing in it.
   */
  voiceNote?: StepVoiceNote;

  // followUp
  /** Which earlier answer is being followed up. `fromDay` defaults to yesterday. */
  fromDay?: number;
  fromStep?: string;
  /** Elara's authored reply per option, parallel to `options`. */
  replies?: string[];
  /** A card at the top of the next step, or a step of its own. */
  presentation?: "card" | "full";

  // scale
  /** Discrete labelled stops. The answer is the 1-based position. */
  stops?: string[];
  /**
   * scale (stops): offer an escape under the scale ("I'm not sure yet").
   * Choosing it *is* an answer, stored as `SCALE_ESCAPE` (0), not a skip
   * (Interaction States spec, discrete slider).
   */
  escape?: boolean;
  /** The escape's words, when not the app's default "I'm not sure yet". */
  escapeLabel?: string;

  // reflect
  /** Which ways of answering are offered, first is the default. */
  modes?: ReflectMode[];
  /** Tappable starting points that fill the field. */
  ideas?: string[];
  /** Start the field from an earlier step's answer in the same day. */
  prefillFrom?: string;

  // read
  bullets?: string[];

  // sort
  items?: string[];
  /** Exactly two column labels. The stored value names the column by label. */
  columns?: string[];

  // recall
  eyebrow?: string;
  recall?: RecallItem[];

  // ── Week 2 workflows (Sep 2026, second export) ───────────────────────────
  /**
   * multi: the picks are an order, not a set — "Pick three, in order". Each
   * pick wears its place ("First", "Second"), and the stored array is in the
   * order she tapped. The step is answered only when all `maxSelections` are
   * placed.
   */
  ranked?: boolean;
  /** multi (ranked): the badge for each place, in order. */
  rankLabels?: string[];
  /**
   * sort: `cards` deals the items one at a time with the two columns as its
   * buttons ("Still mine" / "Not mine anymore"); `rows` (default) lists them.
   */
  sortLayout?: "rows" | "cards" | "columns";
  /** choose: an optional detail field under the options ("Add a quick detail"). */
  detailLabel?: string;
  detailPlaceholder?: string;
  /** reflect (draw): ask for the caption under the pad. Default true. */
  askCaption?: boolean;
  /** reflect (draw): offer "Choose a shape instead". */
  shapes?: boolean;
  /**
   * Show an earlier answer of the same day as a small card above the question
   * — the drawing she is naming, the photo she is explaining. A step that
   * shows a drawing and asks for words *titles* it: its answer is the name the
   * drawing carries in the collection.
   */
  showFrom?: string;
  /**
   * reflect: start the field from a sentence built out of earlier answers
   * ("Here's a first draft from your week"). *Template.* Unlike `prefillFrom`
   * it may quote any day; a draft that cannot be filled starts from
   * `prefillFallback`, and one that still cannot be filled starts empty.
   */
  prefill?: string;
  prefillFallback?: string;
  /** read: an orb to hold while saying the bullets aloud. Nothing is recorded. */
  rehearse?: boolean;
  /** The quiet link under the footer button when the step is optional. */
  skipLabel?: string;
  /** Sublines are *templates* when an option names an earlier answer. See `sublines`. */

  // blanks
  /** The fixed start of each blank ("I can", "What I can offer is"). */
  fields?: string[];
  /** A placeholder per field, parallel to `fields`. */
  placeholders?: string[];
  /** Tappable examples per field, parallel to `fields`. */
  examples?: string[][];

  /**
   * @deprecated Archetypes were retired in Oct 2026 (replaced by Your Atlas).
   * Inert: still accepted so CMS rows written before then validate; nothing
   * reads it.
   */
  archetype?: string;

  /**
   * choose: Elara can say this choice back, from a phrase written per option
   * (see `EchoCopy`). Shown by a later step's `echoFrom`, never on its own.
   */
  echo?: EchoCopy;
  /**
   * Every kind: before the question, Elara says back these earlier steps'
   * answers (their `echo`), in order. Read-only, no reply, no new question;
   * shows nothing when none of them has a phrase to say.
   */
  echoFrom?: string[];

  // ── Day-level keys (on `PathDayDTO.config`, not on a step) ───────────────
  /**
   * One line under the day's opening, before the first step: where the week
   * is going ("By the end of this week, you'll have..."). Day 1 only, by
   * authoring: a day without it shows nothing there.
   */
  payoff?: string;
  /** Estimated minutes, shown as "~4 min" in the header. */
  minutes?: number;
  /** The day-complete screen's headline ("You found your pause."). */
  completeTitle?: string;
  /** Elara's line on the day-complete screen. */
  completeElara?: string;
  /** How this day is introduced on the previous day's "Tomorrow" card. */
  teaser?: string;
  /** Which week this day belongs to. Defaults to `ceil(day / 7)`. */
  week?: number;
  /** The week's name ("Look without judging"), on the first day of a week. */
  weekTitle?: string;
  /** A note from a guide, shown before the first day of a week. */
  intro?: WeekIntro;
  /** Elara's letter, on the last day of a week. *Template.* */
  letter?: string;
  letterFallback?: string;
  /** What the next week is called, for its locked place in the collection. */
  nextWeekTitle?: string;

  // ── Late additions, both about where Elara's words appear ────────────────
  /**
   * Request Elara's reply to this step, but show it on the *next* surface —
   * the next step's "Elara noticed" card (`noticedFrom`) or the day-complete
   * card — rather than in a beat of its own. For the steps the designs follow
   * straight into "does that feel right?", where a reply screen in between
   * would make her speak twice.
   */
  deferReply?: boolean;
  /** Show this step's stored reply in the "Elara noticed" card. Same day. */
  noticedFrom?: string;
  /** Used when a *template* title cannot be filled. */
  titleFallback?: string;
  /** Used when a *template* body (the line under the question) cannot be filled. */
  bodyFallback?: string;

  // ── Interaction States spec gaps (Sep 28) ────────────────────────────────
  /**
   * resonance: her pick rates the line in the "Elara noticed" card above it
   * (`noticedFrom`), and is stored as feedback on that reply (spec §2, "Her
   * answer is stored as feedback on Elara's line"). Options are read by
   * position: yes, partly, no. Never a reason to ask the model again.
   */
  ratesReply?: boolean;
  /**
   * read: a breathing moment rather than a card to read, this many breaths
   * long ("Respira conmigo", spec §14 #4). Skippable, and never holds the day
   * open: `allStepsAnswered` does not wait for it (`isBreathe`).
   */
  breaths?: number;
  /**
   * Every kind: an optional side route, like the breathing moment but with a
   * question in it ("Is something urgent today?"). It does not count toward the
   * five steps of a day or the progress dots, is never waited for by
   * completion, and is skipped on a back-step (`isAside`). Authored replies
   * (`replies`) still answer it, so the help it offers is never model-written.
   */
  aside?: boolean;
  /**
   * The step's own chrome instead of the day header: `dots` is the look-back
   * (mc-d7-1) with a dot pager, an X that closes to Today, and a dark
   * Continue (spec §6, "Day steps").
   */
  pager?: "dots";
  /**
   * Day-level: `centered` draws the day header centred with the time estimate
   * under it, as Day 7 of Week 1 is designed (spec §6).
   */
  header?: "centered";

  // ── Engine capabilities (Oct 2026) ───────────────────────────────────────
  // Four opt-in behaviours of the day engine, none of them content. Every key
  // below is absent on every existing day, and absent means off. See
  // `docs/DAY-STEPS.md` § "Answer states, declining, conditional and hidden
  // steps".

  /**
   * A step: the quiet secondary actions offered under it, each of which
   * answers the step with a state instead of a value (`AnswerState`). Only
   * `unsure`, `none`, `notNow` and `skipped` can be offered. The server refuses
   * a state a step did not list, so a client cannot use one to close a day.
   */
  stateOptions?: OptionalAnswerState[];
  /**
   * A step: only asked when an earlier step of the same day says so
   * (`StepCondition`). A step never offered is recorded `notOffered` when the
   * day closes and never holds it open. Must name an EARLIER step.
   */
  when?: StepCondition;
  /**
   * A step: its answer is hidden wherever it comes back — recall, template
   * quotes, `prefillFrom`, `optionsFrom`, the day-complete summary, a revisit.
   * She sees a label and a control, and chooses when to reveal it. It never
   * reaches a notification, a card, the Atlas or an export, and is never the
   * day's headline. Typed answers never feed the signal log or memory tiers.
   */
  hidden?: boolean;
  /** A step with `hidden`: the neutral label shown in place of the answer ("Your anchor"). */
  hiddenLabel?: string;
  /**
   * Day-level: she may end the day at its first screen with "I'd rather not do
   * this today". Every step is recorded `declined` in one write, the day
   * completes and the path moves on — without a reply, a signal, a memory or
   * any rhythm credit.
   */
  allowDecline?: boolean;

  // ── The daily session (Nov 2026) ─────────────────────────────────────────
  // Three opt-in keys behind the redesigned session (purpose first, a takeaway
  // card she can keep, an honest "none right now"). A day without them is
  // walked exactly as before. See `session.ts`.

  /**
   * Day-level: one sentence on why today matters ("Hoy eliges por dónde
   * empezar…"). A day that has one opens on it («Por qué hoy») before the
   * first question, and the step reply is told it. Never shown on a resume.
   */
  purpose?: string;
  /**
   * A step: its slot on the day's takeaway card («Hoy te llevas»). `label`
   * names the slot («Tu elección», «Para llevarte»); `hint` is what the empty
   * slot says before she has answered («Una pregunta o un pequeño paso»), and
   * what the step reply is told she should leave with.
   */
  card?: StepCard;
  /**
   * choose: the index (in `options`) of the option that means "none right
   * now" («Ninguna por ahora»). Picking it is her choice and is kept as one,
   * but it is read as the `none` outcome everywhere else: the reply is told
   * there is none right now, it is never the day's headline or a quote, and a
   * later step's `bodyFallback` is used instead of a line about "this option".
   */
  noneOption?: number;
}

/** A step's slot on the day's takeaway card (`DayConfig.card`). */
export interface StepCard {
  label: string;
  hint?: string;
}

/** One quoted answer on a `recall` step. */
export interface RecallItem {
  day: number;
  step: string;
  /** "Your pause" — what the quote is called. */
  label: string;
}

/**
 * A short note from a human guide before a week begins, played in the app
 * (`VideoPlayer`, expo-video) with its captions drawn from `captionsUrl`.
 */
export interface StepVoiceNote {
  audioUrl: string;
  /** Whose voice, as the player names it ("Ale"). */
  guide?: string;
  /** Length in seconds, shown before the note has been played. */
  seconds?: number;
}

export interface WeekIntro {
  title?: string;
  guide?: string;
  /** "1 min" — shown beside the guide's name. */
  duration?: string;
  /** "1:04" — the badge on the poster. */
  length?: string;
  videoUrl?: string;
  posterUrl?: string;
  /** The subtitles chip's language label, when the video has captions. */
  captions?: string;
  /** WebVTT beside the MP4. The Subtítulos toggle shows it; no file, no toggle. */
  captionsUrl?: string;
  /**
   * The note in words. Shown on the card when there is no video yet, so the
   * screen is never a play button that plays nothing.
   */
  note?: string;
}

/** How a reflection may be answered. `say` is transcribed, `draw` is kept as ink. */
export const REFLECT_MODES = ["write", "say", "draw"] as const;
export type ReflectMode = (typeof REFLECT_MODES)[number];

/**
 * A drawing, kept as SVG path data rather than an image.
 *
 * A few kilobytes of `d` strings instead of a PNG upload means a drawing is an
 * ordinary answer — it lives in the step map, travels in the same request and
 * replays offline — and it redraws crisply at any size in the collection.
 * Coordinates are integers in a `w`×`h` box.
 */
export interface Drawing {
  w: number;
  h: number;
  paths: string[];
  /**
   * The ink of each stroke, parallel to `paths`: a palette key and a nib.
   * Absent on a drawing made before the pad had colours, which then draws in
   * the default ink. Keys, not hex, so the collection can redraw a drawing in
   * the colours of whatever surface it sits on.
   */
  inks?: DrawingInk[];
  /** Set when she chose a shape instead of drawing — the shape's id. */
  shape?: string;
}

export const DRAWING_TONES = ["ink", "peach", "ember"] as const;
export type DrawingTone = (typeof DRAWING_TONES)[number];

export interface DrawingInk {
  tone: DrawingTone;
  /** 1 = fine, 2 = bold. */
  size: 1 | 2;
}

/**
 * A drawn reflection. The caption is the part anything outside the day screen
 * reads — the memory tiers, Elara's reply, the headline — because a model
 * cannot see ink, and the member was asked for "a few words so Elara can
 * respond" for exactly that reason.
 */
export interface DrawnValue {
  drawing: Drawing;
  caption: string;
}

/**
 * A `photo` answer. The image lives in private storage, fetched only by its
 * owner (`GET /api/me/photos/:id`); the step keeps its id and the words she
 * gave it. "Describe it instead" is the same shape with no photo — which is
 * also what everything outside the day screen reads, because a model cannot
 * see the picture and the memory tiers read words.
 */
export interface PhotoValue {
  photo: { id: string; w?: number; h?: number } | null;
  caption: string;
}

/** A `sort` answer: each item's column, both keyed by their authored labels. */
export interface SortedValue {
  sorted: Record<string, string>;
}

/**
 * A user's answer to a day, persisted as JSON on `day_response.value`. One shape
 * covers every kind: string (reflect/choose/followUp/resonance), { done }
 * (action), number (scale), string[] (multi), a drawing (reflect in draw mode)
 * and a sort. `info`, `read` and `recall` store nothing.
 *
 * The two object shapes are discriminated by key (`drawing`, `sorted`) rather
 * than a `type` tag, the same way `{ done }` always has been — so an answer
 * stored before any of them existed is still exactly one of these.
 */
export type DayValue =
  | string
  | number
  | string[]
  | { done: boolean }
  | DrawnValue
  | SortedValue
  | PhotoValue
  | null;

export interface PathDayDTO {
  day: number;
  level: string;
  title: string;
  body?: string;
  kind: DayKind;
  config?: DayConfig;
  elara?: string;
  /**
   * The day's questions, in order.
   *
   * Absent on every day authored before steps existed, which is why nothing
   * reads this field directly — see `stepsOf()` in `./steps`, which turns a day
   * without steps into a one-step day built from `title`/`kind`/`config` above.
   * Those four fields remain the day's headline and are what the path overview
   * and the Circle prompt show; the steps are what the day screen walks.
   */
  steps?: DayStep[];
}

export interface PathContentDTO {
  /**
   * The language this path is actually written in.
   *
   * Not always what was asked for: content is translated a path at a time, so
   * a Spanish request can legitimately come back with an English path that has
   * no translation yet. Clients use it to avoid mixing a Spanish UI label with
   * an English path name in the same sentence.
   */
  locale: Locale;
  id: string;
  area: AreaKey;
  label: string;
  name: string;
  areaName: string;
  icon: string;
  accent: string;
  tagline: string;
  sortOrder: number;
  days: PathDayDTO[];
}

/**
 * Elara's answer to one step, as the day screen receives it.
 *
 * There is no error shape. A request that could not reach a model comes back
 * with the authored line and `generated: false`, because the screen's job at
 * that moment is to say something warm and move on, not to report an outage to
 * somebody who has just finished writing about their week.
 */
export interface StepReplyDTO {
  stepId: string;
  /** What to show. Empty only when the step had no authored line to fall back to. */
  reply: string;
  /** True when a model wrote it; false when this is the authored fallback. */
  generated: boolean;
  /**
   * The answer read as no answer (a greeting, a test, a key mash), and `reply`
   * invites her to try again rather than responding to it. The step stays
   * answered; the screen lets her answer it again.
   */
  retry?: boolean;
}

export interface ProgressDTO {
  area: AreaKey;
  currentDay: number;
  completedDays: number[];
  /**
   * The headline answer per day — the one sentence that represents the day.
   *
   * Kept beside `stepAnswers` rather than derived from it because everything
   * outside the day screen (the guide's context block, the signal log, the
   * memory tiers) wants "what did they write" and should not have to learn
   * about steps to get it. See `headlineValue()`.
   */
  responses: Record<number, DayValue>;
  /** Every step's answer and Elara's reply to it, per day. */
  stepAnswers: Record<number, DayStepAnswers>;
  /**
   * When each finished day closed (epoch ms), set once and never moved. The
   * next day's unlock counts from here, not from the latest answer: re-reading
   * a finished day restamps its answers, and counting from those locked the
   * day she had already earned. Absent from an older API build.
   */
  dayCompletedAt?: Record<number, number>;
  startedAt: number;
  completedAt: number | null;
}

export interface CheckInDTO {
  date: string; // YYYY-MM-DD
  mood: string;
}

export interface OnboardingStateDTO {
  concern: string | null;
  answers: Record<string, string>;
  /**
   * The area that governs this account: `chosenArea` when set, else a
   * confident `suggestedArea`, else `DEFAULT_AREA`. During the beta the server
   * sets `chosenArea` to the one open Area.
   */
  recommendedArea: AreaKey;
  /**
   * What the concern text pointed at with confidence (`recommendArea`).
   * Advisory only, and never a door: it opens nothing. Null when nothing
   * matched or several areas tied, which means "ask her", not "Money".
   */
  suggestedArea: AreaKey | null;
  /** The member's own pick, or null if they never confirmed one. */
  chosenArea: AreaKey | null;
  /**
   * The Area she said matters most, as she said it, or null. Three things are
   * kept apart on purpose: this (what she says matters), `suggestedArea` (what
   * her words suggested) and `recommendedArea` (where she starts, which during
   * the closed beta is the one open Area whatever she said). This one is a
   * record only: it opens nothing and sets no free Area.
   */
  statedArea: AreaKey | null;
  completedAt: number | null;
}

export interface AuthorDTO {
  id: string;
  name: string;
  avatarUrl: string | null;
  online?: boolean;
}

export interface ReflectionDTO {
  id: string;
  author: AuthorDTO;
  circleId: string | null;
  circleName: string | null;
  visibility: ReflectionVisibility;
  status: ContentStatus;
  body: string;
  reactions: Record<ReactionType, number>;
  myReactions: ReactionType[];
  /**
   * Everyone this post reached, across every reaction type there has ever
   * been. One number, because the app now offers one reaction — see
   * `REACTION_TYPES`. A post made under the old three-reaction model keeps the
   * count it earned rather than appearing to lose it.
   */
  resonanceCount: number;
  /** Whether this viewer is one of them, by any type. */
  resonated: boolean;
  /** Replies. Counted on the card so a conversation is visible before it's opened. */
  commentCount: number;
  createdAt: number;
  /** A table she started: its title. Null for an answer or a free reflection. */
  title?: string | null;
  /** The table's one short tag, in her own words. */
  tag?: string | null;
  /** The question this answers, or null for a reflection that answers none. */
  questionId?: string | null;
  /** The question's text (the viewer's language), for "Answering · {question}". */
  questionBody?: string | null;
  /** Who has written back, first three, oldest first: "Daniela, Camila and Mariana wrote back". */
  repliers?: SeatDTO[];
  /** "Here since September · Exploring Money Clarity" for the author. Never a count or a status. */
  authorNote?: MemberNoteDTO;
  /**
   * Path echoes: the week (1..) and day in that week (1..7) of the author's path
   * when she wrote this. Null when the post was not stamped, or when she keeps
   * her path to herself (`showSeason` off).
   */
  pathWeek?: number | null;
  pathDay?: number | null;
}

/**
 * One reply under a post. Flat by construction — there is no parent pointer,
 * because the conversation is one level deep (`COMMENT_MAX_DEPTH`).
 */
export interface CommentDTO {
  id: string;
  reflectionId: string;
  author: AuthorDTO;
  body: string;
  /** Whether the viewer wrote it, and may therefore delete it. */
  mine: boolean;
  /**
   * Held by the safety screen: only its author sees it, with the notice from
   * `appConfig.safety` that a person is reading it.
   */
  held?: true;
  createdAt: number;
}

export interface CircleDTO {
  id: string;
  name: string;
  category: string;
  description: string;
  accentIcon: string;
  memberCount: number;
  joined?: boolean;
  /** Lifecycle state — see `CIRCLE_STATES`. */
  state: CircleState;
  /**
   * Whether a member may still post here. False once the circle is unpublished
   * or archived: existing members keep their read access, but nothing new lands.
   */
  canPost: boolean;
  /**
   * Whether this member wants pushes from *this* circle.
   *
   * Undefined for a circle she has not joined — there is no membership row to
   * carry the preference, and the honest answer to "would you be notified about
   * a room you are not in" is that the question does not apply. It is stored on
   * the membership row precisely so that leaving takes the preference with it,
   * which the spec requires and which a separate preferences table would have
   * left behind to apply again on rejoining.
   *
   * The global `pushEnabled` and the per-kind `circle_reflection` toggle both
   * still win when off. This is a third, narrower filter, not a replacement.
   */
  notify?: boolean;
  /**
   * Someone else has posted here since she last opened it (`POST
   * /circles/:id/seen`), or since joining before the first visit. Drives the
   * unread dot on "Your circles". Undefined for a circle she has not joined,
   * for the same reason `notify` is; absent from older servers, read as false.
   */
  hasNew?: boolean;
  /** Seats in the room (default 10) and how many are taken. */
  capacity?: number;
  seatsTaken?: number;
  /** Pinned tab position 1..3, or null / absent. Only for a circle she has joined. */
  pinRank?: number | null;
  /** First-seat flag: null = the seat moment has not played. Only when joined. */
  seatIntroAt?: number | null;
  /** Her room cursor. Only when joined. */
  lastSeenAt?: number | null;
  /** The short tab label ("Mothers"); falls back to `name`. */
  shortName?: string;
  /** The circle's paper tint. */
  paper?: CirclePaper;
  /** The house sentence, localised. */
  houseLine?: string | null;
  /** The team-written one-line context shown on Browse, localised. */
  contextLine?: string | null;
}

/** Live, per-circle counts for a circle's own feed view. */
export interface CircleStatsDTO {
  circleId: string | null;
  /** Distinct members across the scope (deduped, never a sum of memberCounts). */
  memberCount: number;
  /** Reflections shared since the caller's local midnight, counted server-side. */
  reflectedToday: number;
  /** A real sample of members in scope, for the companion avatars. */
  members: AuthorDTO[];
}

export interface MemberProfileDTO {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  title: string | null;
  tags: string[];
  /** Circles the caller and this member both belong to. */
  sharedCircles: { id: string; name: string }[];
  online: boolean;
  connectionStatus: ConnectionStatus | null;
  /** True when the caller has blocked this member. */
  blocked: boolean;
  /** True when a conversation can be opened right now (connected + both allow DMs). */
  canMessage: boolean;
  /** Set once a conversation exists between the two members. */
  conversationId: string | null;
  /** When this member joined (epoch ms) — "Member since October". */
  memberSince: number;
  /** Live circle reflections they've shared (hidden/removed and private ones excluded). */
  reflectionCount: number;
  /**
   * The path they're walking, or null. Hidden from other members once they
   * turn off `showSeason` (the column kept its name when seasons were retired;
   * it now governs the path alone).
   */
  activePath: AreaKey | null;
  /** True when the caller is walking the same (visible) path. */
  samePath: boolean;
  /**
   * A circle you share in which you *both* posted this week, or null. The
   * strongest fact the DM thread's connection note can state about the pair.
   */
  reflectedThisWeekIn: { id: string; name: string } | null;
  /** "Here since September" and the path she walks, without a status or a count. */
  note?: MemberNoteDTO;
  /** The shared room that explains why you can talk: the most recent one you share. */
  whereYouMet?: WhereYouMetDTO | null;
  /** Up to two questions you both answered, with both answers. */
  sharedAnswers?: SharedAnswerDTO[];
}

/** A member the caller has blocked (Settings → Blocked members). */
export interface BlockedMemberDTO {
  id: string;
  name: string;
  avatarUrl: string | null;
  createdAt: number;
}

export interface ConnectionRequestDTO {
  id: string;
  from: AuthorDTO;
  status: ConnectionStatus;
  createdAt: number;
  /** A circle you share with the sender — where you most likely met. */
  sharedCircle: string | null;
  /** The sender's path, under the same `showSeason` rule as the profile. */
  activePath: AreaKey | null;
  /** "Where you met": the shared room, and a question you both answered there. */
  whereYouMet?: WhereYouMetDTO | null;
  note?: MemberNoteDTO;
}

export interface EventAgendaItem {
  label: string;
  detail?: string;
  /** How long this part runs, when the editor set it. */
  minutes?: number;
}

/**
 * What a workshop costs *this* account, and what it would cost them if they
 * were a member. Always both numbers: the saving is only meaningful next to the
 * price it is a saving on, and a non-member can't be shown a reason to join
 * without seeing the member price they'd get.
 *
 * `amountUsd` is the reference price from the shared catalogue, not what the
 * store will charge — see `pricing.ts`. Clients prefer the store's own
 * localized price string when the store is reachable and fall back to this.
 */
export interface EventPriceDTO {
  tier: WorkshopTier;
  /** Which product this account may buy, decided by the server. */
  kind: PriceKind;
  /** The store product id for `kind` — what the app asks the store to sell. */
  productId: string;
  /** Reference price for `kind`, USD. */
  amountUsd: number;
  /** Reference price without a membership, USD. */
  standardAmountUsd: number;
  /** Reference price with one, USD. */
  memberAmountUsd: number;
  /** Whole-percent saving a membership gives on this tier. */
  memberDiscountPercent: number;
}

/**
 * What the server hands back when an account starts a workshop purchase: the
 * one product it may buy, and the pending row that lets the webhook match the
 * eventual payment to this workshop.
 */
export interface PurchaseIntentDTO {
  eventId: string;
  productId: string;
  kind: PriceKind;
  amountUsd: number;
  purchase: EventPurchaseDTO;
}

/** A workshop purchase, as the buyer sees it. */
export interface EventPurchaseDTO {
  status: PurchaseStatus;
  /** What they actually paid at, once confirmed. */
  kind: PriceKind;
  productId: string;
  purchasedAt: number | null;
}

export interface EventDTO {
  id: string;
  title: string;
  description: string;
  startsAt: number;
  /** Session length in minutes (null when the admin left it blank). */
  durationMins: number | null;
  timezone: string | null;
  capacity: number;
  spotsLeft: number;
  guideLabel: string | null;
  hostName: string | null;
  hostTitle: string | null;
  agenda: EventAgendaItem[];
  /** Only present for attendees (after RSVP) and only once published. */
  joinUrl: string | null;
  coverUrl: string | null;
  status: EventStatus;
  rsvped: boolean;
  /** Free to anyone signed in, or a one-off purchase. */
  access: EventAccessKind;
  /** Null on a free workshop; otherwise what it costs this account. */
  price: EventPriceDTO | null;
  /**
   * Whether this account may take a seat — free workshop, or paid and bought.
   * The server decides it; the client only renders it. RSVP re-checks the same
   * rule, so a client that ignores this gets a 403 rather than a seat.
   */
  entitled: boolean;
  /** This account's purchase, when there is one (including pending/refunded). */
  purchase: EventPurchaseDTO | null;
  /** Whether the viewer holds a membership — what the member price hangs on. */
  isMember: boolean;
}

export interface SubscriptionDTO {
  status: SubscriptionStatus | null;
  entitlement: string | null;
  isPremium: boolean;
  currentPeriodEnd: number | null;
  productId: string | null;
  /**
   * Where the membership came from: bought through the App Store or Google
   * Play, or granted by us (a beta tester's free months, a RevenueCat
   * promotional, a hand-granted test account). Only a store membership has a
   * store page to manage; a granted one reads "Beta access". Absent from
   * servers older than the beta.
   */
  source?: "store" | "granted" | null;
}

export interface MeDTO {
  id: string;
  /** Empty for a guest. */
  email: string;
  /** Empty for a guest. */
  name: string;
  /** A "Skip for now" account: no email or password yet. Upgrade with `POST /api/me/upgrade`. */
  isAnonymous: boolean;
  role: UserRole;
  avatarUrl: string | null;
  displayName: string | null;
  bio: string | null;
  city: string | null;
  title: string | null;
  hasOnboarded: boolean;
  /**
   * The one path a free account may walk (their onboarding recommendation).
   * Premium unlocks all six; this is what the client locks the rest against.
   */
  freeArea: AreaKey;
  /**
   * The closed beta's Money-only rule, as the server will enforce it for this
   * account: the Areas it accepts path starts, days and steps for while
   * `features.beta` is on. `null` when the beta does not narrow her (it is
   * off, or she is on the QA/research allowlist). Absent from a server that
   * predates it; the phone then draws the rule it always drew (Money only).
   *
   * Availability, not entitlement: it is checked before and in addition to
   * `freeArea` and the subscription, and a beta grant does not bypass it.
   */
  betaOpenAreas?: AreaKey[] | null;
  prefs: {
    showCity: boolean;
    showSeason: boolean;
    allowMessages: boolean;
    eveningCheckIn: boolean;
    reminderTime: string | null;
    /**
     * IANA zone (e.g. "Asia/Kolkata"), reported by the device. Null until a
     * client sends one, and every reader falls back to UTC — but nothing that
     * reasons about *when* something happened is trustworthy until it is set:
     * an evening check-in in IST lands on tomorrow's UTC date.
     */
    timezone: string | null;
    guidePersonality: string | null;
    /** Which voice she speaks in (see GUIDE_VOICES). Null → the default. */
    guideVoice: string | null;
    /**
     * The language this account reads Elara in. Never null: the server
     * resolves an unset column against `Accept-Language` and falls back to
     * `DEFAULT_LOCALE`, so the client always gets a real answer to render.
     */
    locale: Locale;
    pushEnabled: boolean;
    /** Per-kind push toggles. The global `pushEnabled` still wins when off. */
    push: Record<PushPrefKind, boolean>;
  };
}

export interface DirectMessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: number;
  readAt: number | null;
  /**
   * The key the sender's app sent with it (REST `Idempotency-Key`, socket
   * frame `clientKey`), so her app can match the echo to the bubble it drew
   * before the send landed. Absent for a message sent without one.
   */
  clientKey?: string;
}

export interface ConversationDTO {
  id: string;
  member: AuthorDTO;
  /** How the connection began: who asked, when, and when it was accepted. Null for old threads. */
  connection?: { requestedAt: number; requestedByMe: boolean; acceptedAt: number } | null;
  lastMessage: DirectMessageDTO | null;
  unreadCount: number;
  updatedAt: number;
}

/** A turn in the AI guide chat. */
export interface ChatMessageDTO {
  /** Which mode this turn happened in, so the transcript can show the switch. */
  inputMode?: "text" | "voice";
  /**
   * Set on an assistant turn that is the fixed safety response, not a model
   * reply. The app renders it as the crisis card and hides the composer for
   * that turn.
   */
  safety?: SafetyCardDTO;
  id: string;
  role: "user" | "assistant";
  body: string;
  createdAt: number;
}

/** Uniform error envelope returned by the API on failure. */
export interface ApiError {
  error: { code: string; message: string };
}

// --- Admin DTOs ---

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  banned: boolean;
  createdAt: number;
  subscriptionStatus: SubscriptionStatus | null;
}

export interface AdminUserDetail extends AdminUserSummary {
  displayName: string | null;
  city: string | null;
  title: string | null;
  paths: ProgressDTO[];
  subscription: SubscriptionDTO;
}

export interface AdminPathSummary {
  id: string;
  area: AreaKey;
  /** The language this row is written in — the other half of its identity. */
  locale: Locale;
  name: string;
  label: string;
  published: boolean;
  sortOrder: number;
  dayCount: number;
  updatedAt: number;
}

/**
 * A path's personalisation settings, as the admin panel edits them.
 *
 * Absent from the database until someone opens the card — a path with no row is
 * a path where the feature was never switched on, which is also the default.
 * The API answers with a synthesised, disabled, draft row in that case so the
 * editor has something to render rather than a null to defend against.
 */
export interface PathPersonalizationDTO {
  pathContentId: string;
  /** The per-path switch. Off means every member sees the authored question. */
  enabled: boolean;
  /** The reviewed instructions sent to the model. Never contains member data. */
  prompt: string;
  /** The small extra note the client adds on top of the prompt. */
  extraContext: string;
  status: PersonalizationStatus;
  /**
   * Bumped whenever `prompt` or `extraContext` changes.
   *
   * Cached generations carry the version they were made under, so an edit
   * retires every question written against the old wording without deleting a
   * row — the member keeps seeing the last good question until a new one has
   * been generated and validated.
   */
  version: number;
  approvedAt: number | null;
  approvedByName: string | null;
  updatedAt: number | null;
  /** How the generations made under the CURRENT version have turned out. */
  stats: PersonalizationStatsDTO;
}

/**
 * Generation outcomes for one path, at its current prompt version.
 *
 * Scoped to the version on purpose: the question the panel answers is "is the
 * prompt I am looking at working?", and counting rejections from two edits ago
 * answers a question nobody asked.
 */
export interface PersonalizationStatsDTO {
  ready: number;
  rejected: number;
  failed: number;
  /** Why the most recent rejection was rejected, for the panel to show verbatim. */
  lastRejection: string | null;
  lastGeneratedAt: number | null;
}

/**
 * One day's personalised question, as the mobile app overlays it.
 *
 * Only `ready` generations are ever serialised into this shape, so every field
 * present here has already passed validation. A day that failed, was rejected,
 * or has not been generated yet is simply absent from the list — the client has
 * no "personalisation failed" branch to write.
 */
export interface PersonalizedDayDTO {
  area: AreaKey;
  day: number;
  /**
   * Per-step overrides, keyed by step id — never by position, so re-ordering a
   * day's steps in the CMS can never hand a member the wrong question.
   *
   * Sparse: a step that was rejected, failed, or has not been generated is
   * simply absent, and keeps its authored wording. A day where one step of
   * three generated well is served with one step personalised, not discarded.
   */
  steps: Record<string, PersonalizedStepDTO>;
}

/** One step's generated question. Only validated output is ever put in here. */
export interface PersonalizedStepDTO {
  title: string;
  body?: string;
  /** reflect: the input hint. Replaces `config.placeholder` when present. */
  placeholder?: string;
}

/** One step of an admin preview run — what the member would have been shown. */
export interface PersonalizationPreviewStepDTO {
  stepId: string;
  /** What the authored step says today. */
  manual: DayStep;
  /** What the model produced, when it produced anything usable. */
  generated: PersonalizedStepDTO | null;
  status: GenerationStatus;
  /** Why a `rejected` step was rejected, or why a `failed` one failed. */
  reason: string | null;
}

/** One day of an admin preview run, step by step. */
export interface PersonalizationPreviewDayDTO {
  day: number;
  level: string;
  steps: PersonalizationPreviewStepDTO[];
}

export interface PersonalizationPreviewDTO {
  /** The exact system prompt that was sent, prompt + extra context assembled. */
  instructions: string;
  /** The stand-in background block the preview was run against. */
  memberContext: string;
  days: PersonalizationPreviewDayDTO[];
}

export interface AdminReportDTO {
  id: string;
  targetType: string;
  targetId: string;
  /** The picked reason (one of REPORT_REASONS), stored on its own column. */
  reason: string;
  /** Whatever the reporter typed, kept separate from the reason. */
  details: string | null;
  priority: ReportPriority;
  status: string;
  createdAt: number;
  reporterName: string;
  reflectionBody: string | null;
  /** For reflection reports: the target's current status (active|removed|null). */
  reflectionStatus: string | null;
  /**
   * For a public circle's post or reply (`topic_post` / `topic_reply`): its
   * words, status and author. Admin only: this queue is the safety-review path,
   * the one place an anonymous author can be seen (C3).
   */
  targetBody?: string | null;
  targetStatus?: string | null;
  targetAuthorId?: string | null;
  targetAnonymous?: boolean | null;
}

/** Aggregate counts for the admin dashboard (exact, not capped). */
export interface AdminStatsDTO {
  totalUsers: number;
  premiumUsers: number;
  openReports: number;
  publishedPaths: number;
  upcomingEvents: number;
  /** Signups in the last 7 / 30 days. */
  newUsers7d: number;
  newUsers30d: number;
  /** Users who completed onboarding, over all users. */
  activatedUsers: number;
  /** Users with any activity (check-in, reflection, day completion) in 7 days. */
  active7d: number;
  active30d: number;
  /** Subscriptions that lapsed (expired|revoked) in the last 30 days. */
  churned30d: number;
  /** Daily signup counts for the last 30 days, oldest first. */
  signupTrend: { date: string; count: number }[];
  /** Daily active-user counts for the last 30 days, oldest first. */
  activeTrend: { date: string; count: number }[];
}

/**
 * Model usage and cost, from `ai_usage` (GET /api/admin/ai-usage?days=N).
 * Every money field is integer micro-dollars (1_000_000 = $1). See
 * docs/AI-USAGE.md for how to read these and which prices are estimates.
 */
export interface AiUsageTotalsDTO {
  /** Every model call, including each failed rung of a fallback ladder. */
  calls: number;
  failures: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cachedTokens: number;
  audioSeconds: number;
  chars: number;
  costUsdMicros: number;
}

export interface AiUsageBreakdownDTO {
  /** The surface (`guide-chat`, `transcribe`, …) or the model id. */
  key: string;
  /** For a model breakdown: `provider` or `workers-ai`. */
  route?: string;
  calls: number;
  failures: number;
  inputTokens: number;
  outputTokens: number;
  costUsdMicros: number;
}

/** Mean and nearest-rank percentiles of a per-unit cost, in micro-dollars. */
export interface AiCostDistributionDTO {
  /** How many units (members, sessions) the distribution is over. */
  count: number;
  meanUsdMicros: number;
  p50UsdMicros: number;
  p95UsdMicros: number;
}

export interface AiUsageStatsDTO {
  days: number;
  /** Start of the window, unix ms. */
  since: number;
  totals: AiUsageTotalsDTO;
  bySurface: AiUsageBreakdownDTO[];
  byModel: AiUsageBreakdownDTO[];
  /** Zero-filled, oldest first. */
  byDay: { date: string; calls: number; failures: number; costUsdMicros: number }[];
  /** Per member with at least one attributed AI call in the window (background work included). */
  perActiveUser: AiCostDistributionDTO;
  /**
   * Per usage session: one member's calls with no gap longer than
   * `sessionGapMinutes`. Background surfaces (memory work run by the cron)
   * neither start nor extend a session and are excluded here.
   */
  perAppSession: AiCostDistributionDTO & {
    sessionGapMinutes: number;
    meanCalls: number;
    /** Mean first-to-last-call span, in minutes. */
    meanMinutes: number;
  };
  /** Cost with no member attached: deleted accounts, admin tools, batch annotation. */
  unattributedCostUsdMicros: number;
  /** Cost of background surfaces (not part of any usage session). */
  backgroundCostUsdMicros: number;
  /** Models with calls in the window but no entry in the price table — their cost reads 0. */
  unpricedModels: string[];
  /** Priced models whose price is an estimate or placeholder, not a verified vendor number. */
  estimatedPriceModels: string[];
}

/** One RSVP on an event, for the admin attendee list / export. */
export interface AdminAttendeeDTO {
  userId: string;
  name: string;
  email: string;
  rsvpedAt: number;
  /**
   * When this seat was marked as taken up, or null while it is only booked.
   *
   * Marked by a human from the host's own list, never inferred from the clock —
   * see `event_rsvp.attended_at`. It is what earns the member's rhythm a day for
   * the session, which is why a guess would not do.
   */
  attendedAt: number | null;
}

/**
 * One member's rhythm as the admin panel reads it, plus the handles to correct it.
 *
 * The spec's §9 last line asks for manual corrections "without corrupting streak
 * history". They cannot: `current` and `best` are derived from the `days` below on
 * every read, so adding or removing one is the whole edit and the numbers follow.
 * There is no counter to get out of step and no repair script.
 */
export interface AdminGamificationDTO {
  streak: StreakDTO;
  /** Milestone thresholds already shown to her, so nothing shows them twice. */
  awarded: number[];
  /** The hidden engagement score (`INTERNAL_POINTS`). Analytics only. */
  internalPoints: number;
  /** Every local day she showed up, oldest first, and what earned it. */
  days: {
    localDate: string;
    source: string;
    /** Meaningful actions on that date — the spec's primary metric, per day. */
    actions: number;
    firstAt: number;
  }[];
  /** Her recent analytics events, newest first. */
  events: {
    name: string;
    at: number;
    localDate: string;
    source: string;
    points: number;
    props: Record<string, unknown> | null;
  }[];
}

/** A reflection row in the admin feed browser (proactive moderation). */
export interface AdminReflectionDTO {
  id: string;
  body: string;
  status: ContentStatus;
  createdAt: number;
  authorId: string;
  authorName: string;
  circleName: string | null;
  reportCount: number;
}

/**
 * A workshop's member-facing words as the admin edits them: the English base
 * and every other language's version (`EventCopy`, fields optional).
 */
export interface AdminEventWordsDTO {
  id: string;
  title: string;
  description: string;
  standfirst: string | null;
  pullQuote: string | null;
  fit: string[];
  agenda: { label: string; detail?: string; minutes?: number }[];
  guideLabel: string | null;
  hostTitle: string | null;
  translations: EventTranslations;
}

export interface AdminEventSummary {
  id: string;
  title: string;
  /** Epoch **milliseconds**, like every DTO time — the write side takes seconds. */
  startsAt: number;
  /**
   * IANA zone the session is run in. The admin's "Starts at" field is read and
   * written as a wall-clock time in this zone, not in the browser's.
   */
  timezone: string | null;
  /** The uploaded cover, for the edit form's preview. */
  coverUrl: string | null;
  capacity: number;
  rsvpCount: number;
  status: EventStatus;
  access: EventAccessKind;
  /** Null on a free workshop. */
  tier: WorkshopTier | null;
  /** Confirmed purchases — what was actually sold, not seats taken. */
  purchaseCount: number;
}

/** Realtime frames sent over the Durable Object WebSockets. */
export type CircleSocketEvent =
  | { type: "presence"; online: string[] }
  | { type: "reflection"; reflection: ReflectionDTO }
  | {
      type: "reaction";
      reflectionId: string;
      reactions: Record<ReactionType, number>;
      /** The rolled-up number the card actually shows. See `ReflectionDTO`. */
      resonanceCount: number;
    }
  /**
   * A reply landed. Carries the whole comment so an open thread can append it
   * without a refetch, and the new count so a card elsewhere in the feed can
   * update without knowing what was said.
   */
  | { type: "comment"; comment: CommentDTO; commentCount: number }
  /** A reply was retracted or taken down. */
  | { type: "comment_removed"; reflectionId: string; commentId: string; commentCount: number }
  /** An author retracted (or restored) their own reflection — see T8. */
  | { type: "reflection_status"; reflectionId: string; status: ContentStatus };

export type DirectSocketEvent =
  | { type: "message"; message: DirectMessageDTO }
  | { type: "read"; messageId: string; readAt: number }
  | { type: "presence"; online: boolean }
  /** The send was refused: "rate_limited", "messages_disabled" or "too_long". */
  | { type: "error"; code: string; message: string };

/**
 * The audio conversation's socket protocol (`/api/ws/voice`).
 *
 * Audio travels as *binary* frames — 16 kHz mono little-endian int16 PCM,
 * streamed while the member is still speaking — so that by the time the turn
 * ends the recording is already on the server and transcription can start
 * immediately. Only control and results travel as JSON, below.
 */
export type VoiceClientFrame =
  /** A turn is starting; the PCM frames that follow belong to it. */
  | { type: "start"; sampleRate: number; channels: number }
  /** The member stopped talking. Everything sent is the utterance. */
  | { type: "end" }
  /** Barge-in, or leaving: drop the turn in flight and any audio queued. */
  | { type: "cancel" };

/**
 * Server → client. The order is the point: `transcript` lands about a second
 * before `reply_delta` starts, and the first `audio` chunk is synthesised from
 * the opening sentence rather than the whole reply.
 */
export type VoiceSocketEvent =
  /** The room is warm — profile and voice are loaded, the mic may open. */
  | { type: "ready" }
  | { type: "transcript"; text: string }
  /** Her words as the model produces them, for live captions. */
  | { type: "reply_delta"; text: string }
  /** The saved reply. Arrives after the deltas, and carries the id for replay. */
  | { type: "reply"; id: string; body: string; userMessageId: string }
  /** T2/T3: the fixed response instead of a reply — shown, never spoken. */
  | { type: "safety"; id: string; card: SafetyCardDTO; userMessageId: string }
  | { type: "audio"; seq: number; base64: string }
  | { type: "done" }
  | { type: "error"; message: string; code: string };

/** Result of a voice transcription (Workers AI Whisper). */
export interface TranscriptionDTO {
  text: string;
  language?: string;
}

/** A page of rows plus the cursor to fetch the next one (null when exhausted). */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}


// --- Support tickets ---

/** One message in a ticket thread. `authorName` is "Elara Support" for us. */
export interface SupportMessageDTO {
  id: string;
  ticketId: string;
  authorRole: SupportAuthorRole;
  authorName: string;
  body: string;
  createdAt: number;
}

/** A ticket as it appears in the member's list. */
export interface SupportTicketDTO {
  id: string;
  subject: string;
  category: SupportCategory;
  status: SupportStatus;
  createdAt: number;
  lastMessageAt: number;
  /** First line of the newest message, for the list row. */
  lastMessagePreview: string;
  /** True when support has replied since the member last opened the thread. */
  unread: boolean;
}

/** A ticket plus its full thread, oldest message first. */
export interface SupportTicketDetailDTO extends SupportTicketDTO {
  messages: SupportMessageDTO[];
}

/** A ticket row in the admin queue, with the member attached. */
export interface AdminSupportTicketDTO extends SupportTicketDTO {
  userId: string;
  userName: string;
  userEmail: string;
  messageCount: number;
  /** True when the member has written since an admin last opened the thread. */
  needsReply: boolean;
}

export interface AdminSupportTicketDetailDTO extends AdminSupportTicketDTO {
  messages: SupportMessageDTO[];
}

/**
 * One explainer's account-scoped seen-state. Device- and session-scoped hints
 * never reach the server at all.
 */
export interface ExplainerStateDTO {
  key: string;
  /** Registry version at the last dismissal. */
  version: number;
  /** How many times it has been presented. */
  count: number;
  /** Epoch ms when the user did the thing this hint was nagging about. */
  doneAt: number | null;
  seenAt: number;
}

/**
 * What a signal carries, persisted as JSON on `signal.payload`. A flat optional
 * bag, the same shape discipline as `DayConfig`: new sources add keys here and
 * never a migration.
 *
 * The rule for what belongs in here: **a signal carries the value when its
 * source table is mutable, and only a `refId` pointer when that table is
 * append-only.** `day_response` and `onboarding` are upserted in place, so the
 * answer they held last week is gone unless the signal kept a copy;
 * `chat_message` only ever grows, so its signals point at it instead.
 */
export interface SignalPayload {
  /** Free text, truncated to `SIGNAL_TEXT_MAX`. */
  text?: string;
  /** A path day's answer, whatever kind it was (see `DayValue`). */
  value?: DayValue;
  mood?: string;
  /** Retired with seasons; still present on signals logged before Sep 2026. */
  season?: SeasonKey;
  area?: AreaKey;
  day?: number;
  /** The day's authored title, so a signal reads without joining content. */
  title?: string;
  kind?: DayKind;
  concern?: string;
  role?: "user" | "assistant";
  inputMode?: "text" | "voice";
  /**
   * The step this is about: on `reply_resonance`, the step whose reply was
   * rated; on a step answer (`answered`/`completed`), the step answered, so a
   * deleted reflection can take its words out of the log.
   */
  step?: string;
  resonance?: "yes" | "partly" | "no";
  /** `reply_resonance`: whether the rated line was a live reply or the authored one. */
  generated?: boolean;
  // new sources add their keys here — no migration needed.
}

/**
 * Model-derived annotation of a signal, persisted on `signal.derived` and
 * written by the Phase 2 annotator — never by the request that created the
 * signal. Kept in its own column so raw truth and interpretation never mix:
 * when the taxonomy changes, this is re-derived and `payload` is untouched.
 */
export interface SignalDerived {
  /** -1 (bleak) … 1 (bright). */
  sentiment?: number;
  /** -1 (depleted) … 1 (activated). */
  energy?: number;
  /** Closed-vocabulary theme labels. */
  themes?: string[];
  needs?: string[];
  /** Non-null when the text warrants a safety response. */
  riskFlag?: string | null;
}

/* ── Tier 1: rolling state ───────────────────────────────────────────────── */

export type MoodDirection = "lifting" | "sinking" | "level" | "unknown";

/**
 * Everything the guide is told about how a member has *been*, recomputed from
 * the signal log rather than accumulated. Fixed size by construction: the arrays
 * are all top-N, so this costs the same on year three as on day three.
 */
export interface UserState {
  /**
   * 0-1, how much of this was actually observed. It is the field that keeps the
   * whole system honest: everything below has a value at all times, including
   * for a member who has done nothing, so `confidence` is what separates "they
   * are level" from "we have no idea and are showing you the default".
   */
  confidence: number;
  mood: {
    mean7: number | null;
    mean30: number | null;
    direction: MoodDirection;
    /** Mean absolute change between consecutive check-ins. Null under 3. */
    volatility: number | null;
    checkIns14: number;
    /** Days since the last check-in. Null when there has never been one. */
    gapDays: number | null;
  };
  /** Recency-weighted, highest first. Empty until the annotator has run. */
  themes: Array<{ theme: string; weight: number }>;
  engagement: {
    /** Consecutive days ending today or yesterday with any signal. */
    streak: number;
    activeDays14: number;
    /** Local hours they most often show up in, commonest first. */
    peakHours: number[];
    lastActiveAt: number | null;
  };
  patterns: {
    /** Days re-opened without answering, paths abandoned mid-way. */
    avoiding: string[];
    /** Day kinds they reliably finish. */
    working: string[];
    /** Day kinds they reliably abandon. */
    notWorking: string[];
  };
  risk: { flag: RiskFlag | null; at: number | null };
  /** <=150 words, templated from the numbers above — never model-written. */
  summary: string;
}

/* ── Tier 2: memory notes ────────────────────────────────────────────────── */

export const MEMORY_NOTE_KINDS = [
  "fact",
  "pattern",
  "preference",
  "goal",
  "relationship",
] as const;
export type MemoryNoteKind = (typeof MEMORY_NOTE_KINDS)[number];

/**
 * Lifecycle. `superseded` and `deleted` are both tombstones and both matter:
 * a superseded note is history the guide may still reason about, a deleted one
 * is a member saying "that is not me" and must never come back — distillation
 * checks against it before writing anything new.
 */
export const MEMORY_NOTE_STATUS = ["active", "superseded", "deleted"] as const;
export type MemoryNoteStatus = (typeof MEMORY_NOTE_STATUS)[number];

/** One distilled fact, as the member sees it on "What Elara remembers". */
export interface MemoryNoteDTO {
  id: string;
  kind: MemoryNoteKind;
  text: string;
  themes: string[];
  confidence: number;
  firstSeenAt: number;
  lastConfirmedAt: number;
  /** True once it has been rewritten by a newer, contradicting note. */
  superseded: boolean;
}

/* ── Tier 3: weekly snapshots ────────────────────────────────────────────── */

/**
 * The dimensions a week is scored on. Six, not one — a single "wellbeing score"
 * invites exactly the comparison the product should never encourage, and hides
 * which part of someone's week actually moved.
 */
export const WELLBEING_DIMENSIONS = [
  "mood",
  "stability",
  "engagement",
  "agency",
  "connection",
  "outlook",
] as const;
export type WellbeingDimension = (typeof WELLBEING_DIMENSIONS)[number];

export interface WellbeingSnapshotDTO {
  /** Local Monday of the week, YYYY-MM-DD. */
  periodStart: string;
  periodEnd: string;
  /** 0-100 per dimension. Null where the week held too little to score. */
  scores: Record<WellbeingDimension, number | null>;
  /** 0-1 — how much data the week actually had. Shown, never hidden. */
  confidence: number;
  topThemes: string[];
  checkIns: number;
  daysActive: number;
}

/**
 * The "What Elara remembers" screen, in one payload: the distilled notes plus
 * the rolling state's own account of itself.
 *
 * `state` is included because a list of notes alone answers the wrong question.
 * A member asking what the app knows about them is owed an account of it — and
 * `confidence` is the honest part: it says out loud how much of that was
 * observed rather than defaulted.
 *
 * `summary` is the **member-facing** description (`describeToMember`), not the
 * third-person paragraph the guide reasons from (`UserState.summary`). Those
 * were once the same string, and the prompt text — "they checked in 1 time,
 * mostly middling", "tread carefully" — rendered verbatim on the screen.
 */
export interface MemoryOverviewDTO {
  notes: MemoryNoteDTO[];
  state: {
    confidence: number;
    /** Null when there is not yet enough observed to say anything true. */
    summary: string | null;
    themes: Array<{ theme: string; weight: number }>;
    /** Null until the nightly rollup has run for this member at least once. */
    computedAt: number | null;
  };
}

/* ── Resources (the library) ─────────────────────────────────────────────── */

/**
 * A resource as it appears in a list — on Explore, on Today, in search.
 *
 * Everything here is public on every resource, including a premium one. That
 * is the shape of the gate the spec asks for: a locked resource is *browsable*
 * and only stops being readable at the point of consumption, so `title`,
 * `summary` and `minutes` are on the card whether or not the viewer holds a
 * membership. What is missing from this shape is the resource itself.
 */
export interface ResourceSummaryDTO {
  id: string;
  title: string;
  /** The preview line. Always sent — see above. */
  summary: string;
  format: ResourceFormat;
  /** Reading/listening time in minutes; null when the author left it blank. */
  minutes: number | null;
  /** Which of the six areas this belongs to, or null for a general one. */
  area: AreaKey | null;
  coverUrl: string | null;
  access: ResourceAccessKind;
  /**
   * Whether this viewer may open it. `access === "premium" && !locked` is a
   * member; `locked` is what the card badges and what the detail screen gates
   * on. The server decides it — the client only renders it.
   */
  locked: boolean;
  /** Which language this row is actually written in. See `ResourceDTO`. */
  locale: Locale;
  publishedAt: number | null;
  /**
   * The byline, on the card as well as the page. Public for the same reason
   * the title is — it says who is speaking, not what they say — and Today's
   * audio row is headed with it ("From Alejandra"). Optional so an older API
   * that doesn't send it reads as "no byline", never as a type error.
   */
  authorName?: string | null;
  /** Audio and video: the length measured from the file, in seconds. Null when unknown. */
  durationSec?: number | null;
}

/**
 * One resource, opened.
 *
 * ## Why the payload fields are nullable
 *
 * `body`, `url` and `mediaUrl` are the resource. On a locked premium resource
 * the server omits all three, exactly as it omits an event's `joinUrl` from
 * someone who has not taken a seat — the gate is a fact about the response,
 * not a flag the client is trusted to honour. A client that ignores `locked`
 * therefore has nothing to render rather than a paywall it can skip.
 *
 * They are also nullable *by format*: an article has a `body` and no `url`, a
 * link or video has a `url` and no `body`. The format says which one to read, and the
 * CMS validator (`resourceInput`) is what guarantees the matching one is there.
 */
export interface ResourceDTO extends ResourceSummaryDTO {
  /** The article text, for `format: "article"`. Null when locked. */
  body: string | null;
  /**
   * Where an external link goes (`link`), or the YouTube/Vimeo page of a
   * `video`. Null when locked.
   */
  url: string | null;
  /** The audio file (`audio`) or the PDF (`worksheet`). Null when locked. */
  mediaUrl: string | null;
  /** Byline, when the piece has one that isn't Elara. */
  authorName: string | null;
  /** Short credit line under the byline ("Somatic therapist"). */
  authorTitle: string | null;
}

/** A resource row in the admin CMS list. */
export interface AdminResourceSummary {
  id: string;
  /**
   * The piece this row is a language of. Two rows sharing a key are the same
   * article in English and Spanish — the CMS groups on it, and "add a Spanish
   * version" is a create that reuses it.
   */
  key: string;
  title: string;
  format: ResourceFormat;
  access: ResourceAccessKind;
  status: ResourceStatus;
  area: AreaKey | null;
  locale: Locale;
  minutes: number | null;
  /** Measured from the uploaded file. Null when unknown. */
  durationSec: number | null;
  sortOrder: number;
  updatedAt: number;
}

/** One resource as the CMS edits it — every field, in one language, ungated. */
export interface AdminResourceDTO extends AdminResourceSummary {
  summary: string;
  body: string | null;
  url: string | null;
  mediaKey: string | null;
  mediaUrl: string | null;
  coverKey: string | null;
  coverUrl: string | null;
  authorName: string | null;
  authorTitle: string | null;
  /** "synthetic" | "human" | null. Kept apart from authorship. */
  narration: "synthetic" | "human" | null;
  /** The voice, e.g. "Deepgram Aura-2, voz Estrella (Cloudflare Workers AI)". */
  narrationCredit: string | null;
  /** Who reviewed it editorially, and when. Both null until a review is recorded. */
  reviewedBy: string | null;
  reviewedAt: number | null;
  publishedAt: number | null;
  createdAt: number;
}


/**
 * A member's rhythm of showing up, computed from their whole history.
 *
 * ## It counts meaningful actions, not mood taps
 *
 * It used to be derived from `check_in` rows alone, which made the mood tap the
 * only door into the rhythm: a member could answer every step of a day and earn
 * nothing, because she never picked a face. The gamification spec is explicit
 * that a streak advances on "at least one meaningful action" and equally
 * explicit about what does not count, so the input is now `eligible_day` — one
 * row per local date on which she did something real. See `ELIGIBLE_SOURCES`.
 *
 * ## Why the server computes this
 *
 * The client already counts the current streak from the last thirty
 * check-ins, which is enough for Today and wrong for anything else: the
 * hundred-day milestone cannot be answered from thirty rows, and paging a
 * year of check-ins onto a phone to draw one screen is the wrong shape. The
 * server holds the history and an indexed scan per member is cheap.
 *
 * ## `best` is what makes a milestone permanent
 *
 * The spec says a milestone fires "once per threshold, ever". That needs a
 * memory of having reached it — and rather than a `reached_milestones` table
 * that could drift from reality, it is derived: the longest run this member
 * has ever had. A streak that resets does not un-reach a milestone she
 * already earned, a reinstall does not lose it, and nothing can be gamed
 * because the check-in rows are the only input.
 */
export interface StreakDTO {
  /** Consecutive days up to today, or to yesterday if today is still open. */
  current: number;
  /** The longest run in this member's history. Never goes down. */
  best: number;
  /**
   * The most recent day she showed up, `YYYY-MM-DD` in her own timezone. The
   * spec's `last_eligible_local_date`.
   */
  lastEligibleDate: string | null;
  /**
   * The same value under its old name.
   *
   * Kept because updates ship over the air (docs/OTA.md): a bundle built before
   * the rhythm counted practice is still running on somebody's phone, and
   * `projectStreak` in that bundle reads this field. Dropping it would silently
   * cap those installs' streak projection at "today is never counted".
   *
   * @deprecated Read `lastEligibleDate`.
   */
  lastCheckIn: string | null;
  /** Total days she showed up, ever. A record, not a score. */
  totalDays: number;
  /** Thresholds the member has reached at least once, ascending. */
  reached: number[];
  /**
   * Thresholds the server has a record of having *celebrated*, ascending.
   *
   * Distinct from `reached`, and the difference is the whole cross-device story.
   * `reached` is arithmetic over her history; this is the ledger of moments
   * actually spent, written when a client claims one. A second phone seeds its
   * local ledger from this rather than guessing from `best`, so it cannot replay
   * a milestone the first phone already showed her.
   *
   * Empty for an account that predates the ledger, which is why the client still
   * falls back to seeding from `best`: an existing member must not be handed six
   * old milestones the first time she updates.
   */
  awarded: number[];
  /** The next threshold above `current`, or null once they are all behind her. */
  nextMilestone: number | null;
  /** How many more consecutive days that would take. Null with no next. */
  daysToNext: number | null;
  /**
   * Meaningful actions in the last seven local days — the spec's primary metric.
   *
   * On the DTO rather than in an admin query because it is the one number the
   * rhythm screen could honestly grow into, and because computing it needs the
   * member's zone, which the server already has here and the client does not.
   * Nothing renders it today.
   */
  actionsLast7: number;
}

/**
 * One Clarity Picture, as the history (R04) and the guide read it back.
 *
 * `recommendedArea` is what the answers pointed at; `chosenArea` is where she
 * decided to begin. They differ exactly when she used "Not quite right?", and
 * both are kept so the history can say what the picture was without rewriting
 * it to match the choice.
 */
export interface ClarityAssessmentDTO {
  id: string;
  createdAt: number;
  entryText: string | null;
  entryChip: AreaKey | null;
  answers: AssessmentAnswers;
  scores: AssessmentScores;
  recommendedArea: AreaKey;
  chosenArea: AreaKey;
  deepDive: AssessmentDeepDive | null;
  focusLine: string | null;
  locale: Locale;
}

/**
 * Elara saying back one of her choices, in words written for each option.
 *
 * Never the option's label dropped into a sentence: "A debt or my card" has to
 * become "your debt or your card", which no lower-casing produces, so every
 * option carries its own phrase, keyed by its position in the authored
 * options (the option's id), not by its label.
 */
export interface EchoCopy {
  /** The sentence, with `{phrase}` where the option's phrase goes. */
  sentence: string;
  /** One phrase per option, parallel to `options`. Empty = no phrase. */
  phrases?: string[];
  /** A whole sentence instead, per option ("I don't know yet"). Wins over `phrases`. */
  whole?: string[];
  /** The whole sentence when the answer is her own words ("Something else"). */
  other?: string;
}
