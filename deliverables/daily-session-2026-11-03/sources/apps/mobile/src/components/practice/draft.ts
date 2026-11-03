import {
  isDrawn,
  isNoneAnswer,
  isPhoto,
  isSorted,
  OTHER_KEY,
  prefillFor,
  readChoice,
  readPicks,
  withDetail,
  type DayStep,
  type DayStepAnswers,
  type DayValue,
  type Drawing,
  type PhotoValue,
  type ReflectMode,
  type TemplateContext,
} from "@elara/shared";

/**
 * What a step's input is holding before it is submitted — and the rule for
 * turning that into the `DayValue` that gets stored.
 *
 * Pure, and free of React Native, so the rule that decides what a member's
 * answer *is* can be tested in Node: a choice of "Something else" with nothing
 * typed is not an answer, a sort with one item unplaced is not finished, and a
 * drawing is kept as ink plus the words she gave it.
 */

export interface ReflectDraft {
  mode: ReflectMode;
  text: string;
  drawing: Drawing | null;
  caption: string;
}

export interface PhotoDraft {
  /** The uploaded photo, once the upload has landed. */
  photo: PhotoValue["photo"];
  /** The local file, for the preview before and after the upload. */
  uri: string | null;
  caption: string;
  /** "Describe it instead" — words, no photo. */
  describe: boolean;
}

export interface StepDraft {
  /**
   * The server refused this answer for good (its error code), and it was put
   * back here so it is not lost (`keptAnswer`). Shown as a line on the step
   * until she sends it again or moves on.
   */
  refused?: string;
  choice: string | null;
  picks: string[];
  other: string;
  /** A choice's optional detail ("Add a quick detail"). */
  detail: string;
  sorted: Record<string, string>;
  scale: number | null;
  reflect: ReflectDraft;
  done: boolean;
  /** One entry per blank, parallel to `config.fields`. */
  blanks: string[];
  photo: PhotoDraft;
  /**
   * The daily session: what the question before this one said when this draft
   * was last kept (her choice, «Mejorar mi trabajo actual»). When she goes back
   * and changes it, the draft she left here is kept, and this is how the step
   * knows to say so (`choiceChangedUnder`).
   */
  basis?: string;
}

/**
 * Does a kept draft hold anything of hers: a pick, words, a drawing, a photo?
 * A draft is written as soon as a step is open, so its presence alone says
 * nothing; this is what "she started writing here" means.
 */
export function draftHasContent(draft: unknown): boolean {
  if (!draft || typeof draft !== "object") return false;
  // An answer the server refused, kept for her under the same key: her words.
  if (isKeptAnswer(draft)) return holdsWords(draft.kept);
  const d = draft as Partial<StepDraft>;
  return (
    !!d.choice ||
    (d.picks?.length ?? 0) > 0 ||
    !!d.other?.trim() ||
    !!d.detail?.trim() ||
    Object.keys(d.sorted ?? {}).length > 0 ||
    (d.scale !== null && d.scale !== undefined) ||
    !!d.reflect?.text?.trim() ||
    !!d.reflect?.drawing?.paths?.length ||
    !!d.reflect?.caption?.trim() ||
    !!d.done ||
    (d.blanks ?? []).some((b) => !!b?.trim()) ||
    !!d.photo?.photo ||
    !!d.photo?.uri ||
    !!d.photo?.caption?.trim()
  );
}

/**
 * Did she change the answer this draft was written under? True when a kept
 * draft with words in it was written while the question before said something
 * else: «Cambiaste tu elección. Revisa si lo que escribiste sigue encajando.»
 */
export function choiceChangedUnder(draft: unknown, current: string | null | undefined): boolean {
  if (!current || !draftHasContent(draft)) return false;
  const basis = (draft as Partial<StepDraft>).basis;
  return typeof basis === "string" && basis !== current;
}

/** Kinds answered by picking one option. */
export function isSingleChoice(step: DayStep): boolean {
  return step.kind === "choose" || step.kind === "resonance" || step.kind === "followUp";
}

/** The ways a reflection may be answered, in authored order. `write` when unsaid. */
export function modesOf(step: DayStep): ReflectMode[] {
  return step.config?.modes?.length ? step.config.modes : ["write"];
}

/**
 * A draft seeded from what was stored — so a revisited day opens on the answer
 * she gave — or, for "Make it yours", from the earlier step it names.
 */
export function initialDraft(
  step: DayStep,
  saved: DayValue | undefined,
  options: string[],
  dayAnswers: DayStepAnswers | undefined,
  ctx?: TemplateContext,
): StepDraft {
  const choice = readChoice(saved, options);
  const picks = readPicks(saved, options);
  const modes = modesOf(step);
  const drawn = isDrawn(saved) ? saved : null;
  const photo = isPhoto(saved) ? saved : null;
  const fields = step.config?.fields ?? [];
  return {
    choice: isSingleChoice(step) ? choice.choice : null,
    picks: step.kind === "multi" ? picks.picks : [],
    other: isSingleChoice(step) ? choice.other : step.kind === "multi" ? picks.other : "",
    detail: isSingleChoice(step) ? choice.detail : "",
    sorted: isSorted(saved) ? { ...saved.sorted } : {},
    scale: typeof saved === "number" ? saved : null,
    reflect: {
      // A saved drawing reopens on the pad; otherwise the first authored mode.
      // Write is the default wherever it's offered (Interaction States spec).
      mode: drawn && modes.includes("draw") ? "draw" : modes.includes("write") ? "write" : modes[0],
      text:
        typeof saved === "string" ? saved : saved === undefined ? prefillFor(step, dayAnswers, ctx) : "",
      drawing: drawn?.drawing ?? null,
      caption: drawn?.caption ?? "",
    },
    done: typeof saved === "object" && saved !== null && "done" in saved && !!saved.done,
    blanks: fields.map((_, i) =>
      step.kind === "blanks" && Array.isArray(saved) ? (saved[i] ?? "") : "",
    ),
    photo: {
      photo: photo?.photo ?? null,
      uri: null,
      caption: photo?.caption ?? "",
      describe: !!photo && !photo.photo,
    },
  };
}

/**
 * The value this draft would store, and whether it is a complete answer yet.
 *
 * `answered` is what enables the footer button. It is deliberately stricter
 * than "something is selected": "Something else" needs its words, a
 * multi-pick with "Something else" ticked needs them too, and a sort needs
 * every item placed — each of those would otherwise store half an answer.
 */
export function draftValue(step: DayStep, draft: StepDraft): { value: DayValue; answered: boolean } {
  if (isSingleChoice(step)) {
    const picked = draft.choice === OTHER_KEY ? draft.other.trim() : draft.choice;
    // A detail rides on a picked option only — "Something else" is already words.
    const value =
      picked && draft.choice !== OTHER_KEY && step.config?.detailLabel
        ? withDetail(picked, draft.detail)
        : picked;
    return { value: value || null, answered: !!value };
  }
  switch (step.kind) {
    case "multi": {
      const other = draft.other.trim();
      const value = draft.picks
        .map((p) => (p === OTHER_KEY ? other : p))
        .filter((p) => p.length > 0);
      const otherMissing = draft.picks.includes(OTHER_KEY) && !other;
      // "Pick three, in order" is answered by three: an order of one is not
      // an order, and the next step quotes the first *and* the second.
      const cap = step.config?.maxSelections ?? 0;
      const short = !!step.config?.ranked && cap > 0 && value.length < cap;
      return { value, answered: value.length > 0 && !otherMissing && !short };
    }
    case "blanks": {
      const value = draft.blanks.map((b) => b.trim());
      // "Any blank can be left empty" (Interaction States spec) — all of them
      // included; the server tells Elara she left them empty.
      return { value, answered: true };
    }
    case "photo": {
      const p = draft.photo;
      const caption = p.caption.trim();
      // The words are what Elara can read, so a photo needs them too.
      if (p.describe) return { value: { photo: null, caption }, answered: caption.length > 0 };
      return { value: { photo: p.photo, caption }, answered: !!p.photo && caption.length > 0 };
    }
    case "sort": {
      const items = step.config?.items ?? [];
      const sorted = Object.fromEntries(
        Object.entries(draft.sorted).filter(([item]) => items.includes(item)),
      );
      return { value: { sorted }, answered: items.length > 0 && items.every((i) => !!sorted[i]) };
    }
    case "scale":
      // `SCALE_ESCAPE` (0, "I'm not sure yet") is an answer like any stop:
      // hence `!== null`, never a truthiness check.
      return { value: draft.scale, answered: draft.scale !== null };
    case "action":
      return { value: { done: true }, answered: draft.done };
    case "info":
    case "read":
    case "recall":
      return { value: null, answered: true };
    default: {
      // `reflect`, and — failing soft — any kind this build does not know,
      // which renders as a text field.
      const r = draft.reflect;
      if (r.mode === "draw") {
        const drawing = r.drawing;
        const answered = !!drawing?.paths.length;
        return {
          value: answered ? { drawing: drawing!, caption: r.caption.trim() } : null,
          answered,
        };
      }
      const text = r.text.trim();
      return { value: text || null, answered: !!text && !tooShort(step, text) };
    }
  }
}

/**
 * "Next enables after 2 or more words" — one word is rarely a reflection, and
 * a stray letter never is. A suggestion chip tapped as it stands is the
 * exception: "a chip counts as the answer" (Interaction States spec), however
 * short it is. So is one word that honestly says nobody or nothing
 * ("Ninguna", "Nadie", `isNoneAnswer`): asked which relationships restore her,
 * that can be the true answer, and the minimum made her invent another
 * (personalization review, Oct 2026, P1-3). True only for words that are there
 * but not yet enough, which is exactly when the field says why Next is
 * waiting (review v2, O3).
 */
export function tooShort(step: DayStep, raw: string): boolean {
  const text = raw.trim();
  if (!text) return false;
  if ((step.config?.ideas ?? []).some((idea) => idea.trim() === text)) return false;
  if (isNoneAnswer(text)) return false;
  return wordCount(text) < minWordsOf(step);
}

/** The words a written answer needs before Next enables. */
export function minWordsOf(step: DayStep): number {
  return step.config?.minWords ?? 2;
}

/** Words, not characters: runs of letters or digits, in any script. */
export function wordCount(text: string): number {
  return (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) ?? []).length;
}

/** Where a practice step's unsent input is kept (`useAppStore.drafts`). */
export function stepDraftKey(area: string, day: number, stepId: string): string {
  return `${area}:${day}:${stepId}`;
}

/**
 * Whether a draft holds anything she put in it: words, a pick, a mark. Not the
 * same as `draftValue(...).answered`, which asks whether it is a *complete*
 * answer: two words under the minimum, or a "Something else" with its words
 * still to come, are not answers yet but are still hers.
 */
export function draftHoldsInput(step: DayStep, draft: StepDraft): boolean {
  if (draft.choice || draft.picks.length || draft.other.trim() || draft.detail.trim()) return true;
  if (draft.reflect.text.trim() || draft.reflect.caption.trim() || draft.reflect.drawing?.paths.length) return true;
  if (draft.blanks.some((b) => b.trim())) return true;
  if (draft.photo.photo || draft.photo.uri || draft.photo.caption.trim()) return true;
  if (Object.keys(draft.sorted).length) return true;
  return step.kind === "scale" ? draft.scale !== null : false;
}

/**
 * An answer the server refused for good (a week that locked under her, a step
 * the content no longer has, a shape it no longer takes), kept on the phone
 * as the step's draft instead of being dropped with the queue entry. The step
 * screen turns it back into a draft for that step (`draftFromStored`), with
 * her words in the field and a line saying what happened.
 */
export interface KeptAnswer {
  kept: DayValue;
  /** The server's error code (or status). */
  refused: string;
}

export function keptAnswer(value: DayValue, refused: string): KeptAnswer {
  return { kept: value, refused };
}

export function isKeptAnswer(x: unknown): x is KeptAnswer {
  return !!x && typeof x === "object" && "kept" in x && typeof (x as KeptAnswer).refused === "string";
}

/** Something worth keeping for her: words, a pick, a mark. Nothing, or only blanks left empty, is not. */
export function holdsWords(value: DayValue | undefined): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((v) => typeof v === "string" && v.trim().length > 0);
  return true;
}

/** Whether what is stored under a step's draft key is a refused answer kept for her. */
export function isRefusedDraft(x: unknown): boolean {
  return isKeptAnswer(x) || (!!x && typeof x === "object" && typeof (x as StepDraft).refused === "string");
}

/**
 * The draft a step opens with, from what is stored under its key: a draft she
 * left, a refused answer kept for her (`KeptAnswer`, rebuilt for this step,
 * carrying its `refused` line), or nothing (`null`: start from her saved
 * answer).
 */
export function draftFromStored(
  stored: unknown,
  step: DayStep,
  options: string[],
  dayAnswers: DayStepAnswers | undefined,
  ctx?: TemplateContext,
): StepDraft | null {
  if (isKeptAnswer(stored)) return { ...initialDraft(step, stored.kept, options, dayAnswers, ctx), refused: stored.refused };
  return (stored as StepDraft | undefined) ?? null;
}
