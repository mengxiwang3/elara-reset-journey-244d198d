import { hasStateAnswer, type AnswerState } from "./answerStates";
import type { DayStep, DayStepAnswers } from "./steps";
import type { DayValue, DrawnValue, PhotoValue, SortedValue } from "./types";

/**
 * The practice engine's pure rules — what the new step kinds mean, decided once
 * here so the day screen, the answer store and the reply service cannot
 * disagree about them.
 *
 * ## Why a day can quote itself
 *
 * The redesigned week is written as a conversation that remembers: day 2 asks
 * "which one surprised you most?" of the things she picked a step earlier, day 3
 * opens with "On Day 1, money felt like pressure", day 6 hands her own pause and
 * boundary back to her. Every one of those is a *reference to a stored answer*,
 * resolved at render time — never a copy of it, so editing an earlier answer
 * changes every place that quotes it.
 *
 * References are by `(day, step id)`, the same stable key answers are stored
 * under (see `stepsOf()`), so re-ordering a day in the CMS never makes a quote
 * point at a different question.
 */

/** Every step answer the member has given in a path, keyed by day. `ProgressDTO.stepAnswers`. */
export type AnswerBook = Record<number, DayStepAnswers>;

/** The key a "Something else" pick is held under while it is being typed. */
export const OTHER_KEY = "__other__";

/**
 * A labelled scale's escape ("I'm not sure yet"), as a stored answer. Zero
 * because the stops are 1-based, so it can never collide with one.
 */
export const SCALE_ESCAPE = 0;

// ── Value shapes ────────────────────────────────────────────────────────────

export function isDrawn(value: DayValue | undefined): value is DrawnValue {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "drawing" in value;
}

export function isSorted(value: DayValue | undefined): value is SortedValue {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "sorted" in value;
}

export function isPhoto(value: DayValue | undefined): value is PhotoValue {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "photo" in value;
}

// ── What a kind records ─────────────────────────────────────────────────────

/**
 * Kinds whose answer is *having been there*. The row's presence is the answer
 * and its value is always null — reading the card is the whole of the step.
 */
const ACKNOWLEDGED = new Set<string>(["info", "read", "recall"]);

export function isAcknowledgement(step: DayStep): boolean {
  return ACKNOWLEDGED.has(step.kind);
}

/**
 * A breathing moment ("Respira conmigo", Interaction States spec §14 #4): an
 * optional pause before a heavy question, not a question. Recorded like a read
 * card when she goes through it, but never waited for by completion, never a
 * signal, and never counted as a step in the day's progress.
 */
export function isBreathe(step: DayStep): boolean {
  return step.kind === "read" && (step.config?.breaths ?? 0) > 0;
}

/**
 * Anything optional that is *around* the day rather than *in* it: a breathing
 * moment, or a step authored with `aside` (Money Day 1's "is something urgent
 * today?"). Asides open a fresh day only, are skipped when she steps back, are
 * not counted in the day's progress and never hold completion open.
 */
export function isAside(step: DayStep): boolean {
  return isBreathe(step) || step.config?.aside === true;
}

/** A resonance check's answer, by position: "Yes, exactly", "Partly", "Not really". */
export const REPLY_RESONANCE = ["yes", "partly", "no"] as const;
export type ReplyResonance = (typeof REPLY_RESONANCE)[number];

/**
 * What a resonance check's pick says about the line it rates, or null when
 * the step does not rate one (`ratesReply`) or the pick is not one of its
 * options. By position, so the Spanish "Más o menos" means what "Partly" does.
 */
export function resonanceOf(step: DayStep, value: DayValue | undefined): ReplyResonance | null {
  if (step.kind !== "resonance" || !step.config?.ratesReply || typeof value !== "string") return null;
  const index = (step.config.options ?? []).indexOf(value);
  return REPLY_RESONANCE[index] ?? null;
}

/**
 * Can this step be answered with nothing?
 *
 * Acknowledgements always; a follow-up always (she may not want to say how
 * yesterday went, and "Skip" must not strand the day open); anything the author
 * marked optional. A skipped step is *answered, with nothing* — which is what
 * lets the day close.
 */
export function acceptsEmpty(step: DayStep): boolean {
  return isAcknowledgement(step) || step.kind === "followUp" || !!step.config?.optional;
}

/**
 * Does Elara answer this step with a reply beat?
 *
 * No for the kinds where she has just spoken (`resonance` *is* her observation;
 * a `followUp` carries its own authored reply inline), where there is nothing to
 * respond to (`read`, `recall`), and wherever the author said so. Everywhere
 * else she replies, as she always has.
 */
export function isQuiet(step: DayStep): boolean {
  if (step.config?.quiet) return true;
  return (
    step.kind === "read" ||
    step.kind === "recall" ||
    step.kind === "followUp" ||
    step.kind === "resonance"
  );
}

/**
 * May a model rewrite this step's question for one member?
 *
 * Not the kinds whose words are not a question — a read card, a recall of her
 * own answers, a follow-up of yesterday, Elara's own observation — and not a
 * heading that quotes an earlier answer by reference: a rewrite would drop the
 * quote, or worse, invent one. The authored copy is the default everywhere
 * else too; this only decides where an override may even be attempted.
 */
export function isPersonalizable(step: DayStep): boolean {
  if (step.kind === "read" || step.kind === "recall" || step.kind === "followUp" || step.kind === "resonance") {
    return false;
  }
  return !/\{[^}]+\}/.test(`${step.title} ${step.body ?? ""}`);
}

/**
 * How many weeks of a path a free account walks. The first week is the whole
 * free practice — its synthesis ends on "Continue to Week 2", and that is the
 * membership gate (`returnTo` the week's first day). The server enforces it;
 * the app mirrors it with a lock on the card.
 */
export const FREE_WEEKS = 1;

/** May an account with this entitlement open this week? */
export function weekIsFree(week: number): boolean {
  return week <= FREE_WEEKS;
}

/** Which week a day belongs to. Seven days a week unless the day says otherwise. */
export function weekOf(day: number, config?: { week?: number }): number {
  return config?.week ?? Math.max(1, Math.ceil(day / 7));
}

// ── Reading an answer back as words ─────────────────────────────────────────

/**
 * An answer as the words it stands for — what a quote of it should say.
 *
 * A number on a labelled scale is its stop's label ("A few seconds"), a drawing
 * is its caption, a sort is the items she put in the first column. Empty when
 * there are no words to quote, which is what makes a template fall back rather
 * than print a blank.
 */
export function answerText(value: DayValue | undefined, step?: DayStep, state?: AnswerState): string {
  // A state is not words: "I'm not sure" has nothing to quote.
  if (state && state !== "answered") return "";
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") {
    const stops = step?.config?.stops;
    // The escape quotes as its own words when authored; otherwise "" so a
    // template falls back rather than quoting the app's default in one language.
    if (stops?.length && value === SCALE_ESCAPE) return (step?.config?.escapeLabel ?? "").trim();
    if (stops?.length) return (stops[value - 1] ?? "").trim();
    return String(value);
  }
  if (Array.isArray(value)) {
    // Blanks read as the sentences they complete: "I can help this month.
    // What I can offer is my time." — which is what a quote, a reply and the
    // memory tiers all want. Empty blanks are simply not said.
    const fields = step?.kind === "blanks" ? step.config?.fields : undefined;
    if (fields?.length) {
      return value
        .map((v, i) => (v?.trim() ? sentence(`${fields[i] ?? ""} ${v.trim()}`) : ""))
        .filter(Boolean)
        .join(" ");
    }
    return value.map((v) => v.trim()).filter(Boolean).join(", ");
  }
  if (isDrawn(value)) return value.caption.trim();
  if (isPhoto(value)) return value.caption.trim();
  if (isSorted(value)) {
    const first = step?.config?.columns?.[0];
    return Object.entries(value.sorted)
      .filter(([, column]) => (first ? column === first : true))
      .map(([item]) => item)
      .join(", ");
  }
  return "";
}

/** "I can help this month" → "I can help this month." — never doubling a stop. */
function sentence(text: string): string {
  const t = text.trim();
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

// ── Is this an answer? ──────────────────────────────────────────────────────

/**
 * Words that answer nothing on their own: greetings, fillers, test strings, in
 * both languages. Matched after accents are folded, so "qué tal" is "que tal".
 */
const NON_ANSWER_PHRASES = [
  // greetings
  "hi", "hii", "hiii", "hello", "helo", "hey", "heyy", "heya", "hiya", "yo", "sup", "wassup", "whassup",
  "wazzup", "what's up", "whats up", "howdy", "hi there", "hey there", "hello there", "good morning",
  "good afternoon", "good evening", "morning", "how are you", "how r u", "how's it going", "hows it going",
  "hola", "holi", "buenas", "buenos dias", "buenas tardes", "buenas noches", "que tal", "que onda",
  "como estas", "que pasa", "oye", "ey", "elara",
  // fillers
  "ok", "okay", "okey", "k", "kk", "yes", "yeah", "yep", "no", "nope", "si", "vale", "um", "umm", "uh",
  "uhh", "hmm", "hm", "mm", "eh", "ah", "oh", "lol", "xd", "haha", "hahaha", "jaja", "jajaja", "jeje",
  "hmmm", "shh", "idk", "i don't know", "i dont know", "dunno", "no idea", "not sure", "no se", "ni idea", "whatever",
  "thanks", "thank you", "gracias", "bye", "adios", "ciao",
  // test strings
  "test", "testing", "prueba", "probando", "asdf", "qwerty", "lorem", "ipsum", "blah", "bla", "abc",
  "123", "1234", "12345", "123456",
]
  .map((p) => p.split(" "))
  // Longest first, so "hi there" is consumed whole before "hi" is tried.
  .sort((a, b) => b.length - a.length);

/**
 * The phrases among those that say "I don't know". They answer nothing a
 * template could quote, so `isNonAnswer` still counts them, but on a
 * reflective question not knowing is a true answer: `isUnsureAnswer` tells
 * them apart so the reply can accept them instead of asking her to try again.
 */
const UNSURE_PHRASES = [
  "idk", "i don't know", "i dont know", "dunno", "no idea", "not sure", "no se", "ni idea",
].map((p) => p.split(" "));

/**
 * One word that honestly answers "who" or "what" with nobody or nothing.
 * Real answers, quotable as they stand, and allowed past the two-word
 * minimum on a written reflection (`tooShort` in the app).
 */
const NONE_WORDS = new Set([
  "ninguna", "ninguno", "ningun", "nadie", "nada", "none", "nobody", "nothing", "noone",
]);

/** "It's Kara", "I'm Kara", "Soy Kara" — a self-introduction, not an answer. */
const INTRO_LEADS = [["it's"], ["its"], ["this", "is"], ["i'm"], ["im"], ["i", "am"], ["my", "name", "is"], ["soy"], ["me", "llamo"], ["mi", "nombre", "es"]];

/** A key run somebody pressed to get past a field: no vowel, one letter held, a home-row run. */
function isMash(word: string): boolean {
  if (/^\d+$/.test(word)) return false;
  if (/^(.)\1{2,}$/.test(word)) return true;
  if (/asdf|sdfg|qwer|wert|zxcv|hjkl|jkl/.test(word)) return true;
  return word.length >= 5 && !/[aeiouy]/.test(word);
}

function startsWith(words: string[], at: number, phrase: string[]): boolean {
  return phrase.every((p, j) => words[at + j] === p);
}

/**
 * Does this text answer nothing — a greeting, a filler, a test string, a key
 * mash, a self-introduction?
 *
 * The one check behind two decisions that must agree: whether Elara builds a
 * reply on these words (the server skips the model and invites her to try
 * again), and whether a template may quote them back to her ("You said: try
 * your rule hi." is the bug this exists for).
 *
 * Deliberately narrow. It never judges whether an answer is *good*, only
 * whether there is one: a single real word ("Rent") passes, and so does
 * "I'm tired" — only a capitalised name after "it's" / "I'm" reads as an
 * introduction. Anything it lets through still meets a prompt that tells the
 * model to reply only to what was actually said.
 */
export function isNonAnswer(text: string): boolean {
  return readNonAnswer(text).nonAnswer;
}

/**
 * "No sé", "ni idea", "not sure" — perhaps with a greeting or a filler round
 * it, and nothing else. Still a non-answer for quoting (`isNonAnswer` is true),
 * but an honest one: the step reply accepts it rather than inviting her to
 * try again, because a reflective practice cannot treat not knowing as a test
 * string (personalization review, Oct 2026, P1-3).
 */
export function isUnsureAnswer(text: string): boolean {
  const read = readNonAnswer(text);
  return read.nonAnswer && read.unsure;
}

/**
 * One word that says "nobody" or "nothing" ("Ninguna", "Nadie", "Nothing").
 * A whole answer to "which relationships restore you?" on a hard week, so the
 * app lets it past the two-word minimum. Accents and case do not matter.
 */
export function isNoneAnswer(text: string): boolean {
  const words = foldedWords(text);
  return words.length === 1 && NONE_WORDS.has(words[0].toLowerCase());
}

function foldedWords(text: string): string[] {
  return (
    text
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[’‘`´]/g, "'")
      .match(/[\p{L}\p{N}]+(?:'\p{L}+)?/gu) ?? []
  );
}

function readNonAnswer(text: string): { nonAnswer: boolean; unsure: boolean } {
  const original = foldedWords(text);
  const words = original.map((w) => w.toLowerCase());
  let unsure = false;
  let i = 0;
  while (i < words.length) {
    const phrase = NON_ANSWER_PHRASES.find((p) => startsWith(words, i, p));
    if (phrase) {
      if (UNSURE_PHRASES.some((u) => u.length === phrase.length && u.every((w, j) => w === phrase[j]))) {
        unsure = true;
      }
      i += phrase.length;
      continue;
    }
    const lead = INTRO_LEADS.find((p) => startsWith(words, i, p));
    const name = lead ? original[i + lead.length] : undefined;
    if (lead && name && /^\p{Lu}/u.test(name) && name !== "I") {
      i += lead.length + 1;
      continue;
    }
    if (isMash(words[i])) {
      i += 1;
      continue;
    }
    return { nonAnswer: false, unsure: false };
  }
  return { nonAnswer: true, unsure };
}

/**
 * The longest free text a template will set inside one of its sentences. Past
 * this a quote stops being a quote and becomes her paragraph pasted into ours.
 */
export const QUOTE_MAX = 140;

/**
 * May a template set these words, which she typed, inside a sentence of ours?
 * Trimmed, not a non-answer, not a paragraph. Authored labels never come
 * through here — they were written to be quoted.
 */
export function isQuotable(text: string, state?: AnswerState): boolean {
  if (state && state !== "answered") return false;
  const t = text.trim();
  return t.length > 0 && t.length <= QUOTE_MAX && !isNonAnswer(t);
}

/**
 * The member's own words in an answer, when the answer is *only* her words —
 * or null when any of it is authored (a picked option, a stop on a scale, a
 * sort) or not words at all (a drawing, a photo). What the pre-model check
 * reads: an answer with a real pick in it is an answer, whatever she typed
 * beside it.
 */
export function ownWords(step: DayStep, value: DayValue | undefined): string | null {
  if (value == null) return null;
  const options = step.config?.options ?? [];
  if (typeof value === "string") {
    if (options.length && readChoice(value, options).choice !== OTHER_KEY) return null;
    return value;
  }
  if (Array.isArray(value)) {
    const free = step.kind === "blanks" ? value : value.filter((v) => !options.includes(v));
    if (free.length < value.length) return null;
    const words = free.map((v) => v.trim()).filter(Boolean);
    return words.length ? words.join(" ") : null;
  }
  if (isPhoto(value) && !value.photo) return value.caption;
  return null;
}

/**
 * An answer she typed, as a quote may set it: trimmed, a trailing full stop
 * dropped (the template brings its own), or "" when it does not pass
 * `isQuotable` — which is what makes the whole template fall back.
 */
function quotable(text: string): string {
  const t = text.trim().replace(/[\s.,;:]+$/, "");
  return isQuotable(t) ? t : "";
}

// ── Templates ───────────────────────────────────────────────────────────────

export interface TemplateContext {
  book: AnswerBook;
  /** The day being rendered — what a bare `{stepId}` refers to. */
  day: number;
  /**
   * The authored step behind a reference, so a scale quotes its stop label —
   * and so a reference to a `hidden` step is known to be one. A caller that
   * cannot say which steps are hidden must not render templates that quote
   * earlier days.
   */
  stepAt?: (day: number, stepId: string) => DayStep | undefined;
  /**
   * Quote hidden steps too. Only ever set inside a reveal she asked for
   * (`HiddenRecall`): everywhere else a reference to a `hidden` step is left
   * out, the template falls back whole, and `withheld` says so.
   */
  revealHidden?: boolean;
}

/** One run of a resolved template. `quoted` runs are the member's own words. */
export interface TemplatePart {
  text: string;
  quoted: boolean;
}

export interface ResolvedTemplate {
  parts: TemplatePart[];
  text: string;
  /** False when some reference had nothing to quote. */
  complete: boolean;
  /**
   * Some reference was left out because it names a `hidden` step she has
   * answered. The screen may offer a reveal; the text never carries the value.
   */
  withheld: boolean;
}

/**
 * `{step}`, `{d3.step}`, `{step#1}` (the first of a list answer — a ranked
 * pick, a blank), each optionally `|lower`.
 */
const TOKEN = /\{(?:d(\d{1,2})\.)?([A-Za-z0-9_-]{1,64})(?:#(\d{1,2}))?(\|lower)?\}/g;

/**
 * Fill a template's references from the member's answers.
 *
 * Returned as parts rather than a string so the screen can set her own words
 * apart (the mint "comfort" in "The spend was trying to give you comfort").
 */
export function fillTemplate(template: string, ctx: TemplateContext): ResolvedTemplate {
  const parts: TemplatePart[] = [];
  let complete = true;
  let withheld = false;
  let last = 0;
  for (const match of template.matchAll(TOKEN)) {
    const [whole, dayRaw, stepId, nth, lower] = match;
    const at = match.index ?? 0;
    if (at > last) parts.push({ text: template.slice(last, at), quoted: false });
    const day = dayRaw ? Number(dayRaw) : ctx.day;
    const answer = ctx.book[day]?.[stepId];
    const step = ctx.stepAt?.(day, stepId);
    // A state is not her words, and a hidden step's words stay hidden: both
    // leave the reference empty, so the template falls back whole.
    const hidden = !!step?.config?.hidden && !ctx.revealHidden;
    if (hidden && answer && !hasStateAnswer(answer) && answer.value != null) withheld = true;
    // "None right now" is a choice, not words to set inside a sentence of ours.
    const text =
      hidden || hasStateAnswer(answer) || isNoneChoice(step, answer?.value)
        ? ""
        : quoteOf(answer?.value, step, nth, !!lower);
    if (text) parts.push({ text, quoted: true });
    else complete = false;
    last = at + whole.length;
  }
  if (last < template.length) parts.push({ text: template.slice(last), quoted: false });
  return { parts, text: parts.map((p) => p.text).join(""), complete, withheld };
}

/**
 * One reference's words, as the template will set them.
 *
 * Authored words — a picked option, a stop's label, a sorted item — are quoted
 * as they are. Words she typed are quoted only when they pass `isQuotable`, so
 * "Something else: hi" makes the template fall back instead of printing "try
 * your rule hi". In a list, a free entry that is not an answer is left out and
 * the picks stand.
 */
function quoteOf(
  value: DayValue | undefined,
  step: DayStep | undefined,
  nth: string | undefined,
  lower: boolean,
): string {
  const options = step?.config?.options ?? [];
  const own = (v: string) => (options.includes(v.trim()) ? v.trim() : quotable(v));
  // `#n` quotes one entry of a list answer as itself — a blank's words
  // without its lead-in, a ranked pick without the others.
  if (nth) {
    const text = Array.isArray(value) ? own(value[Number(nth) - 1] ?? "") : "";
    return lower ? lowerFirst(text) : text;
  }
  if (Array.isArray(value)) {
    if (step?.kind === "blanks") {
      const text = answerText(value.map((v) => (isQuotable(v) ? v : "")), step);
      return lower ? lowerFirst(text) : text;
    }
    // A list is lowered entry by entry — "Security, Family, Rest" is three
    // labels, and a second capital there is not a name.
    const entries = value.map(own).filter(Boolean);
    return (lower ? entries.map(lowerFirst) : entries).join(", ");
  }
  let text: string;
  if (typeof value === "string") {
    const { choice, detail } = readChoice(value, options);
    text =
      choice && choice !== OTHER_KEY
        ? withDetail(choice, quotable(detail))
        : quotable(value);
  } else if (isDrawn(value) || isPhoto(value)) {
    text = quotable(value.caption);
  } else {
    text = answerText(value, step);
  }
  return lower ? lowerFirst(text) : text;
}

/**
 * A template, or its fallback when a reference cannot be filled.
 *
 * Never a half-filled sentence: "On Day 1, money felt like ." is worse than a
 * line that doesn't quote her at all. Null when there is nothing to show.
 */
export function resolveTemplate(
  template: string | undefined,
  fallback: string | undefined,
  ctx: TemplateContext,
): ResolvedTemplate | null {
  if (template) {
    const filled = fillTemplate(template, ctx);
    if (filled.complete) return filled;
  }
  if (fallback) return fillTemplate(fallback, ctx);
  return null;
}

/**
 * Lower-case only a label that is a label.
 *
 * "Pressure" → "pressure", "A few seconds" → "a few seconds", but "I forgot"
 * and "Uber Eats" keep their capitals: the pronoun, or a second capital, means
 * the capital belongs to the word rather than to the start of a label.
 */
function lowerFirst(text: string): string {
  if (text.length < 2) return text;
  const rest = text.slice(1);
  // A capital later in the text belongs to a name ("Uber Eats") — unless it is
  // the pronoun, which appears mid-label constantly ("before I pay").
  if (/(^|\s)(?!I\b|I['’])[A-ZÁÉÍÓÚÑ]/.test(rest) || /^I\b/.test(text)) return text;
  return text[0].toLowerCase() + rest;
}

// ── Choices ─────────────────────────────────────────────────────────────────

/**
 * The options a choice step offers this member.
 *
 * With `optionsFrom`, they are her own picks from an earlier step of the same
 * day — "which one surprised you most?" of the three things she just said
 * happened. When that step has no answer (skipped, or answered on another
 * device a moment ago) the authored options stand in, so the step is never
 * empty.
 */
export function optionsFor(
  step: DayStep,
  dayAnswers: DayStepAnswers | undefined,
  /** Says which earlier step is `hidden`: its picks are never offered back as buttons. */
  ctx?: Pick<TemplateContext, "day" | "stepAt">,
): string[] {
  const authored = (step.config?.options ?? []).filter((o) => o.trim());
  const from = step.config?.optionsFrom;
  if (!from) return authored;
  if (ctx?.stepAt?.(ctx.day, from)?.config?.hidden) return authored;
  const answer = dayAnswers?.[from];
  if (hasStateAnswer(answer)) return authored;
  const value = answer?.value;
  if (Array.isArray(value)) {
    const picks = value.filter((v) => v.trim());
    if (picks.length) return picks;
  }
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return authored;
}

/**
 * The next set of multi-select picks after tapping `option`. An exclusive
 * option ("Nothing stands out") stands alone: choosing it clears the others,
 * and choosing anything else clears it.
 */
export function togglePick(step: DayStep, picks: string[], option: string): string[] {
  if (picks.includes(option)) return picks.filter((p) => p !== option);
  const i = step.config?.exclusiveOption;
  const exclusive = i != null ? step.config?.options?.[i] : undefined;
  if (exclusive && option === exclusive) return [option];
  return [...picks.filter((p) => p !== exclusive), option];
}

/** The subline authored for an option, when there is one. */
export function sublineFor(step: DayStep, option: string): string | undefined {
  const i = step.config?.options?.indexOf(option) ?? -1;
  return i >= 0 ? step.config?.sublines?.[i] || undefined : undefined;
}

/**
 * A stored single choice, split back into the option and any free text.
 *
 * "Something else" is stored as the words she typed — so the memory tiers, the
 * reply and every later quote see her sentence, not a placeholder — and is
 * recognised on the way back in by not being one of the options.
 */
export function readChoice(
  value: DayValue | undefined,
  options: string[],
): { choice: string | null; other: string; detail: string } {
  if (typeof value !== "string" || !value.trim()) return { choice: null, other: "", detail: "" };
  const exact = asOption(value, options);
  if (exact) return { choice: exact, other: "", detail: "" };
  // A choice with a detail is stored as one sentence — "Groceries: the
  // Sunday list" — so every quote of it reads as she wrote it.
  for (const join of [DETAIL_JOIN, LEGACY_DETAIL_JOIN]) {
    const withDetail = options.find((o) => value.startsWith(`${o}${join}`));
    if (withDetail) {
      return { choice: withDetail, other: "", detail: value.slice(withDetail.length + join.length) };
    }
  }
  return { choice: OTHER_KEY, other: value, detail: "" };
}

/**
 * The option a stored answer names, or null when it is her own words.
 *
 * Exact first. Failing that, ignoring punctuation and case: an option whose
 * wording was re-punctuated after she picked it ("Morning — already tired"
 * became "Morning: already tired" when the em dashes came out in Sep 2026) is
 * still the option she picked, not something she typed.
 */
function asOption(value: string, options: string[]): string | null {
  if (options.includes(value)) return value;
  const key = optionKey(value);
  return options.find((o) => optionKey(o) === key) ?? null;
}

function optionKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\u2014\u2013:;,.]+/g, " ")
    .trim();
}

/**
 * The option that means "none right now" on a single-choice step
 * (`DayConfig.noneOption`), or null when the step has none.
 */
export function noneOptionOf(step: DayStep | undefined): string | null {
  const i = step?.config?.noneOption;
  if (i === undefined || step?.kind !== "choose") return null;
  const label = step.config?.options?.[i];
  return label?.trim() ? label : null;
}

/**
 * Did she pick the step's "none right now" option («Ninguna por ahora»)?
 *
 * It is her choice and is stored as one, but it is not words of hers: the
 * reply is told there is none right now, it is never the day's headline or a
 * template's quote, and the step after it uses its `bodyFallback`.
 */
export function isNoneChoice(step: DayStep | undefined, value: DayValue | undefined): boolean {
  const none = noneOptionOf(step);
  if (none === null || typeof value !== "string") return false;
  return readChoice(value, step?.config?.options ?? []).choice === none;
}

/** Between a choice and the detail she added to it. */
export const DETAIL_JOIN = ": ";

/**
 * What answers were stored with before Sep 2026 (an em dash, which the client
 * asked us to drop everywhere). Still read so those answers split correctly,
 * never written: `withDetail` re-joins them with `DETAIL_JOIN` when quoted.
 */
const LEGACY_DETAIL_JOIN = " \u2014 ";

/** A choice and its optional detail, as stored. */
export function withDetail(choice: string, detail: string): string {
  const d = detail.trim();
  return d ? `${choice}${DETAIL_JOIN}${d}` : choice;
}

/** A stored multi-pick, split the same way. At most one free-text entry. */
export function readPicks(
  value: DayValue | undefined,
  options: string[],
): { picks: string[]; other: string } {
  if (!Array.isArray(value)) return { picks: [], other: "" };
  const picks = value.map((v) => asOption(v, options)).filter((v): v is string => v !== null);
  const other = value.find((v) => !asOption(v, options) && v.trim()) ?? "";
  return { picks: other ? [...picks, OTHER_KEY] : picks, other };
}

/**
 * Elara's authored reply to an option, for the kinds that carry one inline.
 *
 * A follow-up's "Did it" gets its own line instantly and offline — waiting on a
 * model to say "you did what you said you would" would be absurd — and the
 * server stores the same line, so the replay matches.
 */
export function authoredReply(step: DayStep, value: DayValue | undefined): string | null {
  // A line written for one option says which option she chose: a `hidden`
  // step's pick must not come back that way, on the screen or in a replay.
  if (step.config?.hidden) return null;
  if (typeof value !== "string") return null;
  const option = readChoice(value, step.config?.options ?? []).choice ?? value;
  const i = step.config?.options?.indexOf(option) ?? -1;
  if (i < 0) return null;
  return step.config?.replies?.[i]?.trim() || null;
}

// ── Echo: Elara repeating back what she chose, from fixed phrases ─────────

/** Where an echo's phrase goes in its `sentence`. */
export const ECHO_SLOT = "{phrase}";

/**
 * The sentences a step's `echoFrom` says back, in order, from the day's answers.
 *
 * A source step that was skipped, has no echo copy, or whose answer maps to
 * no phrase says nothing. Nothing is ever guessed: a skipped focus is not
 * filled in from her other picks, and a sentence that would still hold a
 * placeholder is dropped whole. Both missing → no lines, and the screen shows
 * nothing.
 */
export function echoLines(step: DayStep, steps: DayStep[], dayAnswers: DayStepAnswers | undefined): string[] {
  const from = step.config?.echoFrom ?? [];
  const lines: string[] = [];
  for (const id of from) {
    const source = steps.find((s) => s.id === id);
    // A state, or a hidden step, says nothing back.
    const stated = hasStateAnswer(dayAnswers?.[id]) || !!source?.config?.hidden;
    const line = source && !stated ? echoOf(source, dayAnswers?.[id]?.value) : null;
    if (line) lines.push(line);
  }
  return lines;
}

function echoOf(source: DayStep, value: DayValue | undefined): string | null {
  const copy = source.config?.echo;
  if (!copy || typeof value !== "string" || !value.trim()) return null;
  const options = source.config?.options ?? [];
  const { choice } = readChoice(value, options);
  let line: string | null = null;
  if (choice === OTHER_KEY) {
    line = copy.other?.trim() || null;
  } else if (choice) {
    const i = options.indexOf(choice);
    const whole = copy.whole?.[i]?.trim();
    const phrase = copy.phrases?.[i]?.trim();
    line = whole || (phrase && copy.sentence.includes(ECHO_SLOT) ? copy.sentence.replace(ECHO_SLOT, phrase) : null);
  }
  return line && !/[{}]/.test(line) ? line : null;
}

// ── Follow-up, recall, prefill ──────────────────────────────────────────────

/**
 * What a follow-up is following up: the words of yesterday's commitment.
 *
 * Null when there is nothing to ask about — she skipped yesterday's
 * commitment, or this is the first day — in which case the step is not shown
 * and is recorded as answered-with-nothing, so it can never hold a day open.
 */
export function followUpSource(step: DayStep, ctx: TemplateContext): string | null {
  const from = step.config?.fromStep;
  if (step.kind !== "followUp" || !from) return null;
  const day = step.config?.fromDay ?? ctx.day - 1;
  if (day < 1) return null;
  const saved = ctx.book[day]?.[from];
  const source = ctx.stepAt?.(day, from);
  const text = hasStateAnswer(saved) ? "" : answerText(saved?.value, source);
  // A hidden commitment is still followed up; the words stay out of the return.
  if (text && source?.config?.hidden) return source.config.hiddenLabel?.trim() || "…";
  return text || null;
}

export interface RecalledAnswer {
  day: number;
  label: string;
  /** Her words. Empty for a `hidden` step: `reveal()` gives them, only when she asks. */
  text: string;
  /** When she said it, if known — for "On Tuesday you said". */
  answeredAt?: number;
  /** The answer is `hidden`: show `label` and a control, never `text`. */
  hidden?: boolean;
  /** What she wrote or chose, for the reveal only. Present only when `hidden`. */
  reveal?: () => string;
  /** The hidden answer is something she tapped (an option), not words she typed. */
  chosen?: boolean;
}

/**
 * The earlier answers a recall step quotes back, in authored order. Items with
 * nothing to quote are dropped rather than shown empty. An item whose source is
 * `hidden` comes back as a label and a `reveal()`, never as text.
 */
export function recallEntries(step: DayStep, ctx: TemplateContext): RecalledAnswer[] {
  return (step.config?.recall ?? []).flatMap((item) => {
    const saved = ctx.book[item.day]?.[item.step];
    const source = ctx.stepAt?.(item.day, item.step);
    const text = hasStateAnswer(saved) ? "" : answerText(saved?.value, source);
    if (!text) return [];
    const base = { day: item.day, label: item.label, ...(saved?.answeredAt ? { answeredAt: saved.answeredAt } : {}) };
    if (source?.config?.hidden && !ctx.revealHidden) {
      return [{ ...base, text: "", hidden: true, chosen: isChosen(source, saved?.value), reveal: () => text }];
    }
    return [{ ...base, text }];
  });
}

/** Was this answer a tap on one of the step's own options, rather than words she typed? */
export function isChosen(step: DayStep | undefined, value: DayValue | undefined): boolean {
  const options = step?.config?.options ?? [];
  if (!options.length || value == null) return false;
  if (typeof value === "string") return readChoice(value, options).choice !== OTHER_KEY;
  if (Array.isArray(value)) return value.length > 0 && value.every((v) => options.includes(v));
  return false;
}

/**
 * The words behind a prefill that is `hidden`, for a reveal she asked for — or
 * null when nothing of hers is being held back. `prefillFor` returns "" in that
 * case, so the field opens empty and the words are never in the tree.
 */
export function hiddenPrefill(
  step: DayStep,
  dayAnswers: DayStepAnswers | undefined,
  ctx?: TemplateContext,
): { label: string; chosen: boolean; reveal: () => string } | null {
  if (ctx && step.config?.prefill) {
    const held = [step.config.prefill, step.config.prefillFallback].some((tpl) => tpl && fillTemplate(tpl, ctx).withheld);
    if (!held) return null;
    return {
      label: "",
      chosen: false,
      reveal: () => {
        for (const tpl of [step.config?.prefill, step.config?.prefillFallback]) {
          if (!tpl) continue;
          const filled = fillTemplate(tpl, { ...ctx, revealHidden: true });
          if (filled.complete) return filled.text.trim();
        }
        return "";
      },
    };
  }
  const from = step.config?.prefillFrom;
  const source = from && ctx ? ctx.stepAt?.(ctx.day, from) : undefined;
  if (!from || !source?.config?.hidden) return null;
  const text = hasStateAnswer(dayAnswers?.[from]) ? "" : answerText(dayAnswers?.[from]?.value);
  if (!text) return null;
  return {
    label: source.config.hiddenLabel?.trim() || "",
    chosen: isChosen(source, dayAnswers?.[from]?.value),
    reveal: () => text.replace(/^[“"«]\s*|\s*[”"»]$/g, ""),
  };
}

/** Where "Make it yours" starts: the words of the step it names, or nothing. */
export function prefillFor(
  step: DayStep,
  dayAnswers: DayStepAnswers | undefined,
  ctx?: TemplateContext,
): string {
  // A draft built from the whole week, when the author wrote one. A quote of a
  // `hidden` step leaves the template incomplete (it falls back), so a draft
  // never opens with words she has not chosen to see.
  if (step.config?.prefill && ctx) {
    for (const template of [step.config.prefill, step.config.prefillFallback]) {
      if (!template) continue;
      const filled = fillTemplate(template, ctx);
      if (filled.complete) return filled.text.trim();
    }
    return "";
  }
  const from = step.config?.prefillFrom;
  if (!from) return "";
  if (ctx?.stepAt?.(ctx.day, from)?.config?.hidden && !ctx.revealHidden) return "";
  const answer = dayAnswers?.[from];
  if (hasStateAnswer(answer)) return "";
  // An option written as a quotation (“When I feel overwhelmed…”) arrives
  // without its marks: the field is her sentence now, not a quote of ours.
  return answerText(answer?.value).replace(/^[“"«]\s*|\s*[”"»]$/g, "");
}

// ── Validation ──────────────────────────────────────────────────────────────

/**
 * Is this a value the step could have produced?
 *
 * Deliberately lenient for the six original kinds — builds in the field send
 * whatever they always sent, and a stricter server would turn a harmless
 * mismatch into a member who cannot finish her day. Strict for the new shapes,
 * which only this version of the app writes: a drawing belongs on a reflection,
 * a sort on a sort step, and a sort names only the authored items and columns.
 *
 * `null` is always accepted here; whether it *completes* the step is
 * `acceptsEmpty`'s question, not this one.
 */
export function validateStepValue(step: DayStep, value: DayValue | undefined): boolean {
  if (value == null) return true;
  if (isDrawn(value)) return step.kind === "reflect";
  if (isPhoto(value)) return step.kind === "photo";
  if (isSorted(value)) {
    if (step.kind !== "sort") return false;
    const items = step.config?.items;
    const columns = step.config?.columns;
    return Object.entries(value.sorted).every(
      ([item, column]) =>
        (!items?.length || items.includes(item)) && (!columns?.length || columns.includes(column)),
    );
  }
  switch (step.kind) {
    case "sort":
      return false; // only a SortedValue (handled above) or null
    case "read":
    case "recall":
      return false; // nothing to record but presence
    case "followUp":
    case "resonance":
      return typeof value === "string";
    case "photo":
      return false; // only a PhotoValue (handled above) or null
    case "blanks": {
      const fields = step.config?.fields;
      return (
        Array.isArray(value) &&
        value.every((v) => typeof v === "string") &&
        (!fields?.length || value.length <= fields.length)
      );
    }
    case "scale": {
      if (typeof value !== "number" || !Number.isFinite(value)) return false;
      const stops = step.config?.stops;
      if (stops?.length && value === SCALE_ESCAPE) return !!step.config?.escape;
      return stops?.length ? Number.isInteger(value) && value >= 1 && value <= stops.length : true;
    }
    default:
      return true;
  }
}
