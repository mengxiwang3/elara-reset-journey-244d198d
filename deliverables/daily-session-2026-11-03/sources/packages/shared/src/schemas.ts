/**
 * Zod schemas — the single source of request/response validation. The API
 * validates with these (`@hono/zod-validator`); mobile and admin infer their
 * payload types from the same objects, so contracts never drift.
 */
import { z } from "zod";
import {
  AREA_KEYS,
  CLIENT_REPORTED_EVENTS,
  COMMENT_MAX,
  DAY_KINDS,
  EXPLAINER_KEY_MAX_LENGTH,
  EXPLAINER_KEY_PATTERN,
  EXPLAINER_MAX_BATCH,
  PUSH_PLATFORMS,
  PUSH_PREF_KINDS,
  REACTION_TYPES,
  REFLECTION_VISIBILITY,
  REPORT_REASONS,
  REPORT_STATUSES,
  SUPPORT_CATEGORIES,
  SUPPORT_STATUSES,
  EVENT_ACCESS_KINDS,
  EVENT_STATUSES,
  RESOURCE_ACCESS_KINDS,
  RESOURCE_BODY_MAX,
  RESOURCE_FORMATS,
  RESOURCE_STATUSES,
  WORKSHOP_TIERS,
} from "./enums";
import { LOCALES } from "./locale";
import { parseVideoLink } from "./resources";
import { DRAWING_TONES, REFLECT_MODES } from "./types";
import {
  EXTRA_CONTEXT_MAX,
  MASTER_PROMPT_MAX,
  PERSONALIZATION_STATUSES,
} from "./personalization";
import { ANSWER_STATES, CLIENT_ANSWER_STATES, OPTIONAL_ANSWER_STATES } from "./answerStates";
import { stepConditionError } from "./offered";
import { DAY_STEPS_MAX } from "./steps";
import {
  ASSESSMENT_ENTRY_MAX,
  ASSESSMENT_FOCUS_MAX,
  ASSESSMENT_MAX_SCORE,
  DEEP_DIVE_FOCUS_COUNT,
  DEEP_DIVE_PATTERN_COUNT,
  DEEP_DIVE_PATTERN_MAX,
} from "./assessment";

export const areaKeySchema = z.enum(AREA_KEYS);

/**
 * A language Elara ships. Base tags only — a client that has "es-MX" is
 * expected to narrow it with `resolveLocale` before sending, so the server
 * never has to decide whether two spellings of Spanish are the same row.
 */
export const localeSchema = z.enum(LOCALES);
export const dayKindSchema = z.enum(DAY_KINDS);

/** Per-kind authoring config (see `DayConfig`). Flat + all-optional on purpose. */
export const dayConfigSchema = z.object({
  options: z.array(z.string()).optional(),
  placeholder: z.string().max(280).optional(),
  actionLabel: z.string().max(280).optional(),
  link: z.string().max(2000).optional(),
  // scale
  min: z.number().int().min(0).max(100).optional(),
  max: z.number().int().min(1).max(100).optional(),
  minLabel: z.string().max(80).optional(),
  maxLabel: z.string().max(80).optional(),
  // multi
  maxSelections: z.number().int().min(1).max(50).optional(),

  // Practice redesign — see the same keys on `DayConfig`.
  prompt: z.string().max(400).optional(),
  cta: z.string().max(60).optional(),
  note: z.string().max(400).optional(),
  quiet: z.boolean().optional(),
  optional: z.boolean().optional(),
  noticed: z.string().max(600).optional(),
  noticedQuote: z.string().max(600).optional(),
  noticedFallback: z.string().max(600).optional(),
  remember: z.string().max(600).optional(),
  rememberFallback: z.string().max(600).optional(),
  keep: z.enum(["sentence", "rule"]).optional(),
  sublines: z.array(z.string().max(200)).max(20).optional(),
  otherLabel: z.string().max(80).optional(),
  otherPlaceholder: z.string().max(120).optional(),
  otherSubline: z.string().max(200).optional(),
  optionsFrom: z.string().max(64).optional(),
  layout: z.enum(["list", "grid", "chips"]).optional(),
  commit: z.boolean().optional(),
  exclusiveOption: z.number().int().min(0).max(20).optional(),
  minWords: z.number().int().min(1).max(20).optional(),
  voiceNote: z
    .object({
      audioUrl: z.string().url().max(2048),
      guide: z.string().max(60).optional(),
      seconds: z.number().int().min(1).max(600).optional(),
    })
    .optional(),
  fromDay: z.number().int().min(1).max(120).optional(),
  fromStep: z.string().max(64).optional(),
  // 600: Money v4 Day 8 "Give me a simple example" is its own line, then the work example.
  replies: z.array(z.string().max(600)).max(20).optional(),
  presentation: z.enum(["card", "full"]).optional(),
  stops: z.array(z.string().max(80)).min(2).max(7).optional(),
  escape: z.boolean().optional(),
  escapeLabel: z.string().max(80).optional(),
  modes: z.array(z.enum(REFLECT_MODES)).min(1).max(3).optional(),
  ideas: z.array(z.string().max(120)).max(8).optional(),
  prefillFrom: z.string().max(64).optional(),
  bullets: z.array(z.string().max(280)).max(8).optional(),
  items: z.array(z.string().max(120)).max(10).optional(),
  columns: z.array(z.string().max(40)).length(2).optional(),
  eyebrow: z.string().max(80).optional(),
  recall: z
    .array(
      z.object({
        day: z.number().int().min(1).max(120),
        step: z.string().min(1).max(64),
        label: z.string().max(80),
      }),
    )
    // Six: Money Clarity v4 Day 7 quotes the six week-1 takeaways it builds the map from.
    .max(6)
    .optional(),
  echo: z
    .object({
      sentence: z.string().max(300),
      phrases: z.array(z.string().max(200)).max(20).optional(),
      whole: z.array(z.string().max(300)).max(20).optional(),
      other: z.string().max(300).optional(),
    })
    .optional(),
  echoFrom: z.array(z.string().min(1).max(64)).max(4).optional(),
  // Day-level
  minutes: z.number().int().min(1).max(60).optional(),
  payoff: z.string().max(300).optional(),
  completeTitle: z.string().max(200).optional(),
  completeElara: z.string().max(400).optional(),
  teaser: z.string().max(200).optional(),
  // A path is planned as twelve weeks; the bound leaves room past that.
  week: z.number().int().min(1).max(26).optional(),
  weekTitle: z.string().max(120).optional(),
  intro: z
    .object({
      title: z.string().max(120).optional(),
      guide: z.string().max(80).optional(),
      duration: z.string().max(20).optional(),
      length: z.string().max(10).optional(),
      videoUrl: z.string().url().max(2000).optional(),
      posterUrl: z.string().url().max(2000).optional(),
      captions: z.string().max(40).optional(),
      captionsUrl: z.string().url().max(2000).optional(),
      note: z.string().max(600).optional(),
    })
    .optional(),
  letter: z.string().max(1200).optional(),
  letterFallback: z.string().max(1200).optional(),
  nextWeekTitle: z.string().max(120).optional(),
  deferReply: z.boolean().optional(),
  noticedFrom: z.string().max(64).optional(),
  titleFallback: z.string().max(400).optional(),
  bodyFallback: z.string().max(600).optional(),
  // Week 2 workflows — see the same keys on `DayConfig`.
  ranked: z.boolean().optional(),
  rankLabels: z.array(z.string().max(40)).max(10).optional(),
  sortLayout: z.enum(["rows", "cards", "columns"]).optional(),
  detailLabel: z.string().max(120).optional(),
  detailPlaceholder: z.string().max(200).optional(),
  askCaption: z.boolean().optional(),
  shapes: z.boolean().optional(),
  showFrom: z.string().max(64).optional(),
  prefill: z.string().max(600).optional(),
  prefillFallback: z.string().max(600).optional(),
  rehearse: z.boolean().optional(),
  skipLabel: z.string().max(60).optional(),
  fields: z.array(z.string().max(80)).max(6).optional(),
  placeholders: z.array(z.string().max(200)).max(6).optional(),
  examples: z.array(z.array(z.string().max(80)).max(6)).max(6).optional(),
  archetype: z.string().max(40).optional(),
  // Interaction States spec gaps — see the same keys on `DayConfig`.
  ratesReply: z.boolean().optional(),
  breaths: z.number().int().min(1).max(10).optional(),
  aside: z.boolean().optional(),
  pager: z.literal("dots").optional(),
  header: z.literal("centered").optional(),
  // Engine capabilities (Oct 2026) — see the same keys on `DayConfig`. All
  // opt-in: a step or day without them is exactly what it was.
  stateOptions: z.array(z.enum(OPTIONAL_ANSWER_STATES)).max(OPTIONAL_ANSWER_STATES.length).optional(),
  when: z
    .object({
      step: z.string().min(1).max(64),
      is: z.union([z.enum(ANSWER_STATES), z.array(z.enum(ANSWER_STATES)).min(1).max(ANSWER_STATES.length)]).optional(),
      answered: z.boolean().optional(),
      valueIn: z.array(z.string().max(200)).min(1).max(20).optional(),
    })
    .optional(),
  hidden: z.boolean().optional(),
  hiddenLabel: z.string().max(80).optional(),
  allowDecline: z.boolean().optional(),
  // The daily session (Nov 2026) — see the same keys on `DayConfig`.
  purpose: z.string().max(300).optional(),
  card: z
    .object({
      label: z.string().min(1).max(60),
      hint: z.string().max(120).optional(),
    })
    .optional(),
  noneOption: z.number().int().min(0).max(20).optional(),
});

/**
 * A drawn reflection (see `DrawnValue`).
 *
 * Bounded hard, because it is the one answer shape whose size the member
 * controls with a finger rather than a keyboard: 60 strokes of up to 6k
 * characters of path data is far past any drawing someone makes on a phone to
 * say how a day felt, and well under the row size D1 is comfortable with.
 */
export const drawnValueSchema = z.object({
  drawing: z.object({
    w: z.number().int().min(1).max(4000),
    h: z.number().int().min(1).max(4000),
    // Path data only: move/line/quadratic commands and numbers. Anything else
    // is not something the draw pad produces.
    paths: z
      .array(z.string().max(6000).regex(/^[MLQCZ0-9 .,-]*$/))
      .max(60),
    inks: z
      .array(z.object({ tone: z.enum(DRAWING_TONES), size: z.union([z.literal(1), z.literal(2)]) }))
      .max(60)
      .optional(),
    shape: z.string().max(40).optional(),
  }),
  caption: z.string().max(1000),
});

/** A `sort` answer — item label → column label. */
export const sortedValueSchema = z.object({
  sorted: z.record(z.string().max(120), z.string().max(40)),
});

/** A `photo` answer (see `PhotoValue`). The id is one `POST /api/me/photos` returned. */
export const photoValueSchema = z.object({
  photo: z
    .object({
      id: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/),
      w: z.number().int().min(1).max(20000).optional(),
      h: z.number().int().min(1).max(20000).optional(),
    })
    .nullable(),
  caption: z.string().max(1000),
});

/** A day answer (see `DayValue`) — one union for every kind. */
export const dayValueSchema = z.union([
  z.string().max(4000),
  z.number(),
  z.array(z.string().max(400)).max(50),
  z.object({ done: z.boolean() }),
  drawnValueSchema,
  sortedValueSchema,
  photoValueSchema,
  z.null(),
]);

// --- Onboarding ---
/** Most keys `onboardingInput.answers` takes: 6 areas x 2 follow-ups + `room`, with room to grow. */
export const ONBOARDING_ANSWERS_MAX = 30;
// All fields optional so the mobile flow can save progressively (concern first,
// the chosen area later) without resubmitting everything.
export const onboardingInput = z.object({
  concern: z.string().min(1).max(2000).optional(),
  /**
   * Bounded: every changed value becomes a signal the annotator sends to a
   * model, and the guide's context quotes the column into prompts. The app
   * sends a handful of keys (`<area>.feeling`, `<area>.want`, `room`) whose
   * values are option keys or her own words, the same 2000 cap as `concern`.
   */
  answers: z
    .record(z.string().min(1).max(40), z.string().max(2000))
    .refine((a) => Object.keys(a).length <= ONBOARDING_ANSWERS_MAX, {
      message: `At most ${ONBOARDING_ANSWERS_MAX} onboarding answers`,
    })
    .optional(),
  /**
   * The area the member picked for themselves in onboarding step 2. Optional
   * because step 1 saves before that screen exists; once sent it is sticky, and
   * it outranks the server's keyword guess for good.
   */
  chosenArea: areaKeySchema.optional(),
  /**
   * The Area she said matters most to her, as she said it. Kept apart from
   * `chosenArea` (where she starts) because during the closed beta she can say
   * Love while the beta places her in Money Clarity, and the server must not
   * overwrite what she said with where it put her. Sticky once sent. Never an
   * access decision: nothing that decides what she may open reads it.
   */
  statedArea: areaKeySchema.optional(),
});
export type OnboardingInput = z.infer<typeof onboardingInput>;

// --- Paths / progress ---
export const startPathInput = z.object({ area: areaKeySchema });

export const saveDayInput = z.object({
  value: dayValueSchema.optional(),
  complete: z.boolean().default(true),
});
export type SaveDayInput = z.infer<typeof saveDayInput>;

/**
 * Answer one step of a day, and ask Elara to respond to it.
 *
 * `complete` marks the *day* finished, and the client does not decide it — the
 * server recomputes it from whether every step now has an answer. Sending it
 * would let a client that miscounted the steps close a day with two of three
 * answered, which is precisely the rushing-through this change exists to stop.
 */
export const saveStepInput = z.object({
  stepId: z.string().min(1).max(64),
  value: dayValueSchema.optional(),
  /**
   * Skip the model and return the authored line.
   *
   * Set by the client when it is replaying a step the member has already
   * answered, so revisiting a finished day is free and shows the reply they
   * were actually given rather than a fresh one.
   */
  replyless: z.boolean().optional(),
  /**
   * Sent from the offline queue: written while the request could not get
   * through, so the server may never have seen these words. With `replyless`
   * the model is still skipped, but the safety screen records and alerts as for
   * a live answer. Without this, a disclosure written offline reached the
   * moderators' queue never: a replay is screened but not recorded. Optional,
   * so older servers simply ignore it.
   *
   * Informational only on current servers: whether `replyless` words are a
   * replay is decided from what the server has stored, so builds that never
   * send this flag are covered too (`alreadyScreened` in the API).
   */
  queued: z.boolean().optional(),
  /**
   * How a reflection was actually given — typed, said aloud (and transcribed),
   * or drawn. Told to Elara so she replies to a transcript as speech and to
   * typed words as typed. Optional: builds before it simply do not send it.
   */
  mode: z.enum(REFLECT_MODES).optional(),
  /**
   * This answer was written *for* her, not by her.
   *
   * Two cases, both real: a dangling follow-up the day screen answers with
   * nothing on mount so the day can still close, and the Day 1 reflection
   * carried over from onboarding and submitted on arrival.
   *
   * It exists because of the rhythm. The gamification spec is explicit that
   * opening a screen is not a meaningful action, and without this flag a day
   * containing a dangling follow-up would credit a streak day the moment she
   * *opened* it. The server therefore gives an `auto` answer no streak credit
   * and no `gamification_step_completed` — though it still counts toward
   * closing the day, because a day it finishes is a day she did the rest of.
   *
   * Optional: builds that predate it simply do not send it, and an auto answer
   * from one of those credits a day it should not. One day, on one member, on
   * a bundle that is about to update.
   */
  auto: z.boolean().optional(),
  /**
   * The member's own local date when she answered, `YYYY-MM-DD`.
   *
   * For the rhythm, and only for the rhythm. A step answered in a tunnel on
   * Tuesday and flushed on Thursday is Tuesday's practice: crediting the day it
   * synced would leave a hole in a run she actually had, which is the same bug
   * `pendingCheckIns` already carries its date to avoid.
   *
   * Clamped server-side (see `claimedLocalDate`) — a client may say "this was
   * yesterday", not "this was any date I choose".
   */
  localDate: z.string().date().optional(),
  /**
   * What kind of answer this is. Absent means `answered`. A state other than
   * `answered` is the answer: `value` is dropped on the server, no reply is
   * generated, no signal is logged, and the step must have listed the state in
   * `config.stateOptions` (the server refuses one it did not offer, so a client
   * cannot use a state to close a day). `notOffered` and `declined` cannot be
   * sent: the server writes those.
   */
  state: z.enum(CLIENT_ANSWER_STATES).optional(),
});
export type SaveStepInput = z.infer<typeof saveStepInput>;

/**
 * "I'd rather not do this today" (`DayConfig.allowDecline`). No answers travel:
 * the server writes `declined` for every step of the day, in one write.
 * `localDate` is the same fact it is on a step (the day she chose it, for a
 * decline that reaches the server late); the rhythm never reads it, because a
 * declined day earns none.
 */
export const declineDayInput = z.object({
  localDate: z.string().date().optional(),
});
export type DeclineDayInput = z.infer<typeof declineDayInput>;

// --- Gamification ---

/**
 * Claim a streak milestone, or declare a set of them already behind her.
 *
 * `seed` is what a fresh install sends: thresholds it is treating as spent
 * *without* having shown any of them, so the next device agrees (see
 * `services/milestoneAwards.ts`). `threshold` is a real crossing, just shown.
 * The two are one endpoint because they write the same row and differ only in
 * whether anything was celebrated.
 */
export const milestoneClaimInput = z
  .object({
    threshold: z.number().int().positive().optional(),
    seed: z.array(z.number().int().positive()).max(16).optional(),
  })
  .refine((v) => v.threshold !== undefined || v.seed !== undefined, {
    message: "threshold or seed is required",
  });
export type MilestoneClaimInput = z.infer<typeof milestoneClaimInput>;

/**
 * Events the client reports, batched.
 *
 * Only the names on `CLIENT_REPORTED_EVENTS` are accepted: an analytics table a
 * phone can write any name into stops being a record of what happened. Each
 * carries a `key` the server stores as `client_key`, so the retry after a
 * timeout records the celebration once rather than twice.
 */
export const analyticsReportInput = z.object({
  events: z
    .array(
      z.object({
        name: z.enum(CLIENT_REPORTED_EVENTS),
        /** Idempotency key, unique per member. The client generates it. */
        key: z.string().min(1).max(80),
        /** The surface it happened on: `practice`, `today`. */
        source: z.string().min(1).max(40),
        /** Identifiers and counts only; free text is dropped server-side. */
        props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
        /** When it happened, epoch ms. Clamped server-side; defaults to now. */
        at: z.number().int().positive().optional(),
      }),
    )
    .min(1)
    .max(20),
});
export type AnalyticsReportInput = z.infer<typeof analyticsReportInput>;

// --- Check-ins ---
export const checkInInput = z.object({
  mood: z.string().min(1).max(80),
  // ISO date (YYYY-MM-DD); defaults to today server-side when omitted.
  date: z.string().date().optional(),
});
export type CheckInInput = z.infer<typeof checkInInput>;

// --- Circle ---
/**
 * Per-circle notifications. One field, and deliberately not merged into the
 * profile's `pushPrefs` patch: this is scoped to a membership row, and folding
 * it in would mean a preferences endpoint that has to know which circle the
 * caller meant.
 */
export const circleNotifyInput = z.object({ notify: z.boolean() });
export type CircleNotifyInput = z.infer<typeof circleNotifyInput>;

export const TABLE_TITLE_MAX = 120;
export const TABLE_TAG_MAX = 32;

export const createReflectionInput = z
  .object({
    body: z.string().min(1).max(4000),
    circleId: z.string().optional(),
    /** The question this answers (an open question in `circleId`). Omitted for a free reflection. */
    questionId: z.string().optional(),
    visibility: z.enum(REFLECTION_VISIBILITY).default("circle"),
    /** A table she starts: "How do you handle family guilt around money?" */
    title: z.string().trim().min(1).max(TABLE_TITLE_MAX).optional(),
    /** One short tag of her own for a table: "Family". */
    tag: z.string().trim().min(1).max(TABLE_TAG_MAX).optional(),
    /**
     * The path she is walking as she writes (the app's active area). The server
     * stamps the post with her point in that path (Path echoes); omitted, it
     * falls back to her onboarding area. Never shown as-is.
     */
    pathArea: areaKeySchema.optional(),
  })
  // A table is its own thread in her circle, never an answer to Elara's question.
  .refine((v) => !(v.title && v.questionId), { message: "A table does not answer a question", path: ["title"] })
  .refine((v) => !v.tag || !!v.title, { message: "Only a table has a tag", path: ["tag"] })
  .refine((v) => !v.title || (v.visibility === "circle" && !!v.circleId), {
    message: "A table is started inside a circle",
    path: ["circleId"],
  });
export type CreateReflectionInput = z.infer<typeof createReflectionInput>;

export const reactionInput = z.object({ type: z.enum(REACTION_TYPES) });

/**
 * Author-side retraction. `hidden` pulls a reflection out of every feed and
 * count; `active` puts it back. Admin removal is a separate, non-author state.
 */
export const updateReflectionInput = z.object({ status: z.enum(["active", "hidden"]) });
export type UpdateReflectionInput = z.infer<typeof updateReflectionInput>;

export const connectionInput = z.object({ toUserId: z.string().min(1) });

export const reportInput = z.object({
  /** `topic_post` / `topic_reply`: a public circle's post or reply (Circles v6.2). */
  targetType: z.enum(["reflection", "user", "topic_post", "topic_reply"]),
  targetId: z.string().min(1),
  /** One of REPORT_REASONS; free text is still accepted for legacy callers. */
  reason: z.string().min(1).max(1000),
  details: z.string().max(1000).optional(),
});
export type ReportInput = z.infer<typeof reportInput>;

/** Reason picker value, when the client uses the canonical list. */
export const reportReasonSchema = z.enum(REPORT_REASONS);

// --- Blocking (App Store Guideline 1.2) ---
export const blockInput = z.object({ userId: z.string().min(1) });
export type BlockInput = z.infer<typeof blockInput>;

// --- Direct messages ---
export const sendMessageInput = z.object({ body: z.string().min(1).max(4000) });
export type SendMessageInput = z.infer<typeof sendMessageInput>;

// --- Guide chat (AI) ---
export const chatInput = z.object({
  body: z.string().min(1).max(4000),
  /**
   * Where she opened the chat from — "Talk to Elara" on a finished day, or a
   * practice. Tells the guide which day she has in mind. Optional: most
   * turns come from the tab.
   */
  from: z.object({ area: areaKeySchema, day: z.number().int().min(1).max(400) }).optional(),
});
export type ChatInput = z.infer<typeof chatInput>;

// --- Profile ---
/** Per-kind push toggles, all optional so a screen can PATCH just one. */
export const pushPrefsInput = z.object(
  Object.fromEntries(PUSH_PREF_KINDS.map((k) => [k, z.boolean().optional()])) as Record<
    (typeof PUSH_PREF_KINDS)[number],
    z.ZodOptional<z.ZodBoolean>
  >,
);
export type PushPrefsInput = z.infer<typeof pushPrefsInput>;

export const updateProfileInput = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(600).optional(),
  city: z.string().max(120).optional(),
  title: z.string().max(120).optional(),
  showCity: z.boolean().optional(),
  showSeason: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
  eveningCheckIn: z.boolean().optional(),
  reminderTime: z.string().max(20).optional(),
  /**
   * IANA zone from the device. Validated for shape only — the canonical list
   * lives in the runtime's ICU data, so `services/time.ts` is what decides
   * whether a zone actually resolves, and falls back to UTC when it doesn't.
   */
  timezone: z.string().max(64).regex(/^[A-Za-z][A-Za-z0-9+_\-]*(?:\/[A-Za-z0-9+_\-]+)*$/).optional(),
  guidePersonality: z.string().max(60).optional(),
  guideVoice: z.string().max(60).optional(),
  /**
   * The language the member reads Elara in. Stored on the profile rather than
   * inferred per request, because the cron that builds an 8pm reminder has no
   * device to ask and no `Accept-Language` to read.
   */
  locale: localeSchema.optional(),
  pushEnabled: z.boolean().optional(),
  /** Per-kind push preferences; the global `pushEnabled` still wins when off. */
  pushPrefs: pushPrefsInput.optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileInput>;

// --- Image upload (avatars, event covers) ---
// `image` is base64 (no data: prefix); ~7MB base64 ≈ ~5MB decoded.
export const uploadImageInput = z.object({
  image: z.string().min(1).max(7_000_000),
  mimeType: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
});
export type UploadImageInput = z.infer<typeof uploadImageInput>;

// --- Events ---
export const rsvpInput = z.object({}).strict();

// --- Admin: content CMS ---
/**
 * One step of a day.
 *
 * `id` is required and is the caller's responsibility to keep stable — the
 * admin editor mints one per new step and never rewrites an existing one,
 * because the id is what every stored answer points at. A save that renumbered
 * ids would silently reattach members' answers to different questions.
 */
export const dayStepInput = z.object({
  id: z.string().min(1).max(64),
  kind: dayKindSchema,
  title: z.string().min(1).max(400),
  body: z.string().max(2000).optional(),
  config: dayConfigSchema.optional(),
  elara: z.string().max(1000).optional(),
});
export type DayStepInput = z.infer<typeof dayStepInput>;

/**
 * The highest day number a path may carry.
 *
 * Every path is five weeks of seven today (35 days), and `config.week` already
 * allows a path planned well past that, so this is a sanity bound rather than
 * the product's length: it has to stay clear of any real path, because a cap
 * below the last authored day makes the whole path unsaveable in the CMS (the
 * old cap of 31 rejected days 32-35 of every five-week path). It matches the
 * 120 already used by the day references in `dayConfigSchema` (`fromDay`,
 * `recall[].day`), which are declared above this and so cannot use it.
 */
export const PATH_DAY_MAX = 120;

export const pathDayInput = z.object({
  day: z.number().int().min(1).max(PATH_DAY_MAX),
  level: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  kind: dayKindSchema,
  config: dayConfigSchema.optional(),
  elara: z.string().optional(),
  /**
   * The day's questions. Omitted or empty means the day is its own single
   * question — see `stepsOf()`. Every existing CMS payload is therefore still
   * valid, which is what lets the content migration happen one path at a time.
   */
  // A breathing moment (`breaths`) and an optional side route (`aside`) are
  // not questions of the day, so they do not count against the ceiling: Money
  // Day 1 is five questions, one breath and one "is something urgent?".
  steps: z
    .array(dayStepInput)
    .max(DAY_STEPS_MAX + 2)
    .refine((steps) => steps.filter((s) => !s.config?.breaths && !s.config?.aside).length <= DAY_STEPS_MAX, {
      message: `At most ${DAY_STEPS_MAX} steps`,
    })
    // A conditional step reads an EARLIER step of its own day (`config.when`).
    .refine((steps) => stepConditionError(steps) === null, {
      message: "A conditional step must name an earlier, answered step of the same day, and only options it offers",
    })
    .optional(),
});

export const pathContentInput = z.object({
  area: areaKeySchema,
  /**
   * Which language this row is written in. Defaults to English so every
   * existing admin call keeps working unchanged; content is keyed by
   * `(area, locale)`, so this is half of a path's identity, not a flag on it.
   */
  locale: localeSchema.default("en"),
  label: z.string().min(1),
  name: z.string().min(1),
  areaName: z.string().min(1),
  icon: z.string().min(1),
  accent: z.string().min(1),
  tagline: z.string().min(1),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(false),
  days: z.array(pathDayInput).min(1),
});
export type PathContentInput = z.infer<typeof pathContentInput>;

/**
 * A path's personalisation settings.
 *
 * `status` is required on every save rather than optional, and is accepted from
 * the client because approving is a deliberate act the reviewer performs on
 * text they are looking at. Requiring it is what makes the default safe: a
 * caller cannot omit the field and silently inherit the previous approval.
 *
 * Keeping it here rather than behind a separate /approve endpoint is what lets
 * "edit and approve" be one button press and one row write — the save route
 * then re-stamps or clears the approval record to match. See
 * `routes/admin/content.ts`.
 */
export const pathPersonalizationInput = z.object({
  enabled: z.boolean(),
  /**
   * The master prompt. Trimmed but otherwise taken verbatim — it is the one
   * piece of this system a human is expected to be able to say anything in.
   * Empty is allowed and means "use the shipped default".
   */
  prompt: z.string().max(MASTER_PROMPT_MAX),
  extraContext: z.string().max(EXTRA_CONTEXT_MAX),
  status: z.enum(PERSONALIZATION_STATUSES),
});
export type PathPersonalizationInput = z.infer<typeof pathPersonalizationInput>;

/**
 * A preview run. Everything is optional: the panel previews whatever is
 * currently in the editor, including unsaved edits, which is the only way to
 * see what a prompt does *before* committing it.
 */
export const personalizationPreviewInput = z.object({
  prompt: z.string().max(MASTER_PROMPT_MAX).optional(),
  extraContext: z.string().max(EXTRA_CONTEXT_MAX).optional(),
  /** Which authored days to run. Defaults to the first three. */
  days: z.array(z.number().int().min(1).max(PATH_DAY_MAX)).max(7).optional(),
});
export type PersonalizationPreviewInput = z.infer<typeof personalizationPreviewInput>;

/**
 * Ask the model to draft the steps for one day, for a human to edit.
 *
 * Separate from the personalisation prompt: that one rewrites a question for a
 * member, this one writes the authored question in the first place. Same
 * discipline though — it returns text into the editor and approves nothing.
 */
export const draftDayStepsInput = z.object({
  day: z.number().int().min(1).max(PATH_DAY_MAX),
  count: z.number().int().min(1).max(DAY_STEPS_MAX).optional(),
  /** A steer from the editor, e.g. "make step 2 a scale". */
  note: z.string().max(500).optional(),
});
export type DraftDayStepsInput = z.infer<typeof draftDayStepsInput>;

/** Ask the model to draft a master prompt for this path, for a human to edit. */
export const personalizationDraftInput = z.object({
  extraContext: z.string().max(EXTRA_CONTEXT_MAX).optional(),
});

/** One line of an event's agenda ("10 min · Welcome"). */
export const eventAgendaItemInput = z.object({
  label: z.string().min(1).max(200),
  detail: z.string().max(300).optional(),
  /** How long this part runs; the workshop page draws the parts as a bar of minutes. */
  minutes: z.number().int().min(1).max(600).optional(),
});

/**
 * A workshop's words in one more language. The base columns are English; this
 * carries another language's version of the member-facing words, every field
 * optional, and the app falls back to the English field by field, so a
 * half-translated workshop serves as much Spanish as exists. The agenda is
 * matched to the English agenda by position and carries words only: each
 * part's length stays the English row's.
 */
export const eventCopyInput = z.object({
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  standfirst: z.string().trim().max(300).optional(),
  pullQuote: z.string().trim().max(300).optional(),
  fit: z.array(z.string().trim().max(200)).max(3).optional(),
  agenda: z
    .array(z.object({ label: z.string().trim().max(200), detail: z.string().trim().max(300).optional() }))
    .max(20)
    .optional(),
  guideLabel: z.string().trim().max(120).optional(),
  hostTitle: z.string().trim().max(120).optional(),
});
export type EventCopy = z.infer<typeof eventCopyInput>;

/** Locale → that language's words. The default locale's key is ignored: English is the base columns. */
export const eventTranslationsInput = z.record(localeSchema, eventCopyInput);
export type EventTranslations = z.infer<typeof eventTranslationsInput>;

/**
 * The event fields, before the access/tier coherence rule is layered on.
 * Split out because a refinement makes a schema un-`partial()`-able, and the
 * PATCH route needs the partial. The rule is applied to both below.
 */
const eventInputBase = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  startsAt: z.number().int(), // unix seconds
  /** Session length in minutes (drives the "45 min" the app used to hardcode). */
  durationMins: z.number().int().min(5).max(1440).optional(),
  /** IANA zone the event is run in, e.g. "Asia/Kolkata". */
  timezone: z.string().max(60).optional(),
  capacity: z.number().int().min(0),
  guideLabel: z.string().optional(),
  /** Host shown on the detail screen (was a hardcoded fallback). */
  hostName: z.string().max(120).optional(),
  hostTitle: z.string().max(120).optional(),
  /** Where attendees actually join (Zoom/Meet link), revealed after RSVP. */
  joinUrl: z.string().max(2000).optional(),
  agenda: z.array(eventAgendaItemInput).max(20).optional(),
  coverKey: z.string().optional(),
  /** One sentence for Explore's featured ticket and the Programme row. */
  standfirst: z.string().trim().max(300).nullish(),
  /** The host's one line about the evening, set as a pull quote. */
  pullQuote: z.string().trim().max(300).nullish(),
  /** "Is this for you?": up to three statements. */
  fit: z.array(z.string().trim().min(1).max(200)).max(3).nullish(),
  /** The same words in other languages; see `eventCopyInput`. */
  translations: eventTranslationsInput.nullish(),
  status: z.enum(EVENT_STATUSES).default("draft"),
  /** Free to every signed-in account, or a one-off purchase. */
  access: z.enum(EVENT_ACCESS_KINDS).default("free"),
  /**
   * Which rung of the price ladder — required when `access` is "paid", and
   * meaningless otherwise. Refined below rather than left to the route, so the
   * CMS can't create a paid workshop with no price and the app can't be asked
   * to render one.
   */
  tier: z.enum(WORKSHOP_TIERS).nullish(),
});

/** A paid workshop with no tier is unsellable, so it can't be created. */
export const eventInput = eventInputBase.superRefine((value, ctx) => {
  if (value.access === "paid" && !value.tier) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tier"],
      message: "A paid workshop needs a price tier.",
    });
  }
});

/**
 * The PATCH body. Same coherence rule, but it can only be judged on what the
 * request actually sends: an edit that turns a workshop paid has to name the
 * tier in the same request, rather than relying on whatever tier the row
 * happens to be carrying from a previous life.
 */
export const eventPatchInput = eventInputBase.partial().superRefine((value, ctx) => {
  if (value.access === "paid" && !value.tier) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tier"],
      message: "A paid workshop needs a price tier.",
    });
  }
});

/**
 * A reply under a post. `body` only: which post it belongs to is in the path,
 * and there is deliberately no `parentId` — see `COMMENT_MAX_DEPTH`.
 */
export const createCommentInput = z.object({
  body: z.string().trim().min(1).max(COMMENT_MAX),
});
export type CreateCommentInput = z.infer<typeof createCommentInput>;

export const banUserInput = z.object({
  banned: z.boolean(),
  banReason: z.string().max(500).optional(),
  banExpires: z.number().int().nullable().optional(),
});

export const updateReportInput = z.object({
  status: z.enum(REPORT_STATUSES),
});

export const paginationQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Voice transcription request. `audio` is the recorded clip base64-encoded
 * (no data: URI prefix); `mimeType` is the container the client recorded
 * (e.g. "audio/m4a"). Capped so a stray/huge upload is rejected before it ever
 * reaches Workers AI — ~15MB of base64 ≈ a few minutes of AAC audio.
 */
export const transcribeInput = z.object({
  audio: z.string().min(1).max(20_000_000),
  mimeType: z.string().max(100).optional(),
  language: z.string().max(10).optional(),
});
export type TranscribeInput = z.infer<typeof transcribeInput>;

/**
 * One turn of the audio conversation: a recorded clip in, a streamed
 * transcript + reply + speech out. Same payload shape as `transcribeInput` —
 * the difference is entirely in what the server does with it.
 */
export const voiceTurnInput = z.object({
  audio: z.string().min(1).max(12_000_000),
  mimeType: z.string().max(60).optional(),
  language: z.string().max(10).optional(),
});
export type VoiceTurnInput = z.infer<typeof voiceTurnInput>;

// --- Push notifications ---
/** Register (or refresh) an Expo push token for the current device. */
export const registerPushTokenInput = z.object({
  token: z.string().min(1).max(400),
  platform: z.enum(PUSH_PLATFORMS),
  deviceId: z.string().max(200).optional(),
  /** The build schedules workshop reminders on the phone; the server then sends none to this device. */
  localEventReminders: z.boolean().optional(),
});
export type RegisterPushTokenInput = z.infer<typeof registerPushTokenInput>;

/** Send a direct message over REST (the DO socket is the realtime path). */
export const sendDirectMessageInput = sendMessageInput;


// --- Support tickets ---
/**
 * Opening a ticket. The subject is what the member sees in their list, so it
 * is required rather than derived from the first line of the body — a list of
 * truncated first lines is not a list anyone can scan.
 */
export const createSupportTicketInput = z.object({
  subject: z.string().trim().min(3).max(120),
  category: z.enum(SUPPORT_CATEGORIES),
  body: z.string().trim().min(1).max(4000),
});
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketInput>;

/** A reply from either side. Same shape both ways; the author is the session. */
export const supportReplyInput = z.object({ body: z.string().trim().min(1).max(4000) });
export type SupportReplyInput = z.infer<typeof supportReplyInput>;

/** Admin-only status change, separate from replying so either can happen alone. */
export const supportStatusInput = z.object({ status: z.enum(SUPPORT_STATUSES) });
export type SupportStatusInput = z.infer<typeof supportStatusInput>;

/**
 * An explainer key. Validated by shape only — see the note on
 * `EXPLAINER_KEY_PATTERN`; the server never needs to know what a key means.
 */
export const explainerKeySchema = z
  .string()
  .min(1)
  .max(EXPLAINER_KEY_MAX_LENGTH)
  .regex(EXPLAINER_KEY_PATTERN);

/**
 * Recording is a batch because the client flushes a pending queue: a hint
 * dismissed offline is written locally and pushed when the network returns.
 * `count` is the absolute number the client observed, not a delta, so the
 * server can merge with `max()` and a retried flush is idempotent.
 */
export const recordExplainersInput = z.object({
  entries: z
    .array(
      z.object({
        key: explainerKeySchema,
        version: z.number().int().min(1).max(9999),
        count: z.number().int().min(1).max(999).default(1),
        done: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(EXPLAINER_MAX_BATCH),
});
export type RecordExplainersInput = z.infer<typeof recordExplainersInput>;

// --- Admin: the resource library ---

/**
 * The resource fields, before the format/payload coherence rule.
 *
 * Split base-then-refine for the same reason `eventInputBase` is: a refinement
 * makes a schema un-`partial()`-able, and the PATCH route needs the partial.
 */
const resourceInputBase = z.object({
  title: z.string().min(1).max(200),
  /** The preview line — public on a locked resource, so it has to stand alone. */
  summary: z.string().min(1).max(500),
  format: z.enum(RESOURCE_FORMATS),
  /** The article text. Required when `format` is "article". */
  body: z.string().max(RESOURCE_BODY_MAX).optional(),
  /**
   * Where a link goes, the YouTube/Vimeo page of a video, or an externally
   * hosted audio file or PDF.
   */
  url: z.string().url().max(2000).optional(),
  /**
   * An audio file or PDF uploaded to R2. Either this or `url` satisfies
   * "audio" and "worksheet".
   */
  mediaKey: z.string().max(300).optional(),
  coverKey: z.string().max(300).optional(),
  authorName: z.string().max(120).optional(),
  authorTitle: z.string().max(120).optional(),
  /**
   * Reading time for a guide. For audio and video it is not shown: the length
   * members see is `durationSec`, measured from the file.
   */
  minutes: z.number().int().min(1).max(600).optional(),
  /** Audio and video: the length measured from the uploaded file (the CMS reads it from the media). */
  durationSec: z.number().int().min(1).max(60 * 60 * 12).nullish(),
  /** How it is narrated. Never folded into the byline. */
  narration: z.enum(["synthetic", "human"]).nullish(),
  /** The voice credit ("Deepgram Aura-2, voz Estrella"). */
  narrationCredit: z.string().trim().max(160).nullish(),
  /** The editorial reviewer's name. Recorded only when a review actually happened. */
  reviewedBy: z.string().trim().max(120).nullish(),
  /** When that review happened (epoch ms). Required with `reviewedBy`. */
  reviewedAt: z.number().int().positive().nullish(),
  /** Which of the six areas this belongs to; omitted for a general resource. */
  area: areaKeySchema.nullish(),
  /** The language this row is written in. Part of the row's identity. */
  locale: localeSchema.default("en"),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  status: z.enum(RESOURCE_STATUSES).default("draft"),
  access: z.enum(RESOURCE_ACCESS_KINDS).default("free"),
});

/**
 * What each format needs in order to be openable at all.
 *
 * This is the CMS half of "a format with no built viewer must not appear": the
 * closed `RESOURCE_FORMATS` list stops an author picking a format the app
 * can't render, and this stops them saving one the app *can* render but that
 * carries nothing to render. Between the two, a published resource always
 * opens.
 */
function checkPayload(
  value: { format?: string; body?: string; url?: string; mediaKey?: string },
  ctx: z.RefinementCtx,
) {
  if (value.format === "article" && !value.body?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["body"],
      message: "An article needs body text.",
    });
  }
  if (value.format === "link" && !value.url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["url"],
      message: "A link resource needs a URL.",
    });
  }
  if (value.format === "audio" && !value.url && !value.mediaKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["mediaKey"],
      message: "An audio resource needs an uploaded file or a URL.",
    });
  }
  // A video the app can't name the host of is a video it can't be honest
  // about, so anything but YouTube or Vimeo is authored as a link instead.
  if (value.format === "video" && !parseVideoLink(value.url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["url"],
      message: "A video needs a YouTube or Vimeo link. Anything else can be a link resource.",
    });
  }
  if (value.format === "worksheet" && !value.url && !value.mediaKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["mediaKey"],
      message: "A worksheet needs an uploaded PDF or a URL.",
    });
  }
}

/**
 * An editorial review is a name and a date together, or neither: a date with
 * no reviewer would print a review nobody can be asked about (owner decision H2).
 */
function checkReview(value: { reviewedBy?: string | null; reviewedAt?: number | null }, ctx: z.RefinementCtx) {
  const by = !!value.reviewedBy?.trim();
  const at = value.reviewedAt != null;
  if (by !== at && (value.reviewedBy !== undefined || value.reviewedAt !== undefined)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [by ? "reviewedAt" : "reviewedBy"],
      message: "An editorial review needs both who reviewed it and when.",
    });
  }
}

export const resourceInput = resourceInputBase.superRefine((value, ctx) => {
  checkPayload(value, ctx);
  checkReview(value, ctx);
});
export type ResourceInput = z.infer<typeof resourceInput>;

/**
 * The PATCH body. Judged only on what the request sends, like
 * `eventPatchInput`: changing a resource's format means naming its new payload
 * in the same request, rather than inheriting whatever the row was carrying
 * from the format it used to be.
 */
export const resourcePatchInput = resourceInputBase.partial().superRefine((value, ctx) => {
  checkReview(value, ctx);
  if (value.format === undefined) return;
  checkPayload(value, ctx);
});
export type ResourcePatchInput = z.infer<typeof resourcePatchInput>;

// --- Clarity Assessment ---
/** One area's answer: the option index, which is also its score (see `assessment.ts`). */
const assessmentAnswerSchema = z.number().int().min(0).max(ASSESSMENT_MAX_SCORE);

/**
 * A finished assessment, as the phone reports it.
 *
 * Carries the *raw* answers and her own choices, never a verdict: the server
 * re-scores `answers` with the same shared functions and derives
 * `recommendedArea` itself, so a stale or tampered client cannot write a
 * picture the answers do not support. `chosenArea` is hers to set — that is
 * what "Not quite right?" is for — and is stored beside the recommendation
 * rather than over it.
 */
export const createAssessmentInput = z.object({
  entryText: z.string().trim().max(ASSESSMENT_ENTRY_MAX).nullable().optional(),
  entryChip: areaKeySchema.nullable().optional(),
  answers: z.object({
    self: assessmentAnswerSchema,
    energy: assessmentAnswerSchema,
    money: assessmentAnswerSchema,
    purpose: assessmentAnswerSchema,
    love: assessmentAnswerSchema,
    everyday: assessmentAnswerSchema,
  }),
  /** Her CA-10 answer, when the tie-break was asked. */
  tieBreak: areaKeySchema.nullable().optional(),
  chosenArea: areaKeySchema,
  deepDive: z
    .object({
      patterns: z
        .array(z.number().int().min(0).max(DEEP_DIVE_PATTERN_COUNT - 1))
        .max(DEEP_DIVE_PATTERN_MAX),
      focus: z.number().int().min(0).max(DEEP_DIVE_FOCUS_COUNT - 1).nullable(),
      own: z.string().trim().max(ASSESSMENT_FOCUS_MAX).nullable(),
    })
    .nullable()
    .optional(),
  /** The sentence shown under "Your focus this week", already in her language. */
  focusLine: z.string().trim().max(ASSESSMENT_FOCUS_MAX).nullable().optional(),
  locale: localeSchema.optional(),
});
export type CreateAssessmentInput = z.infer<typeof createAssessmentInput>;
