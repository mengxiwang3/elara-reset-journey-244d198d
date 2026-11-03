// Deliberately imports nothing from `./types`: that module reaches the theme,
// and the theme reaches react-native, which would make this file unloadable
// in the Node test that checks it against the string catalogue. The two
// types it needs come straight from the contract package.
import type { AreaKey, DayConfig, DayKind, DayStep, PathDayDTO, ReflectMode } from "@elara/shared";
import type { PathDayCopy, PathStepCopy } from "@/i18n/locales/en/paths";
import { money } from "./pathDays/money";
import { self } from "./pathDays/self";
import { energy } from "./pathDays/energy";
import { purpose } from "./pathDays/purpose";
import { love } from "./pathDays/love";
import { everyday } from "./pathDays/everyday";

/**
 * The 7-day path content — the half of it that has no language.
 *
 * Each area's glyph, its accent, and the shape of its seven days: which day is
 * a reflection and which is a choice, and how many options a choice has. The
 * words — the area's name, every day's title and body, every option — live in
 * the string catalogue at `i18n/locales/<lang>/paths.ts`, and `usePathsMap`
 * zips the two together.
 *
 * ## Why they are apart
 *
 * The same reason as the explainers: this is a module-level
 * constant, evaluated when the bundle loads, which is before the persisted
 * language has been read off disk. Copy that lived here would be English for
 * the whole run no matter what the member chose.
 *
 * `optionCount` is the load-bearing part of this file. It is what lets a
 * translation be checked: the Spanish day 3 of the money path must offer
 * exactly four options, because the English one does and because the answer a
 * member saved is stored as its text. A translation that drops an option would
 * otherwise silently shorten someone's week.
 */
export interface PathDayStructure {
  day: number;
  kind: DayKind;
  config?: {
    /** How many options this day offers. The catalogue must match, exactly. */
    optionCount?: number;
    min?: number;
    max?: number;
    maxPicks?: number;
    link?: string;
    /** "~4 min" in the day header. A number, so it cannot be mistranslated. */
    minutes?: number;
    week?: number;
    /** The week intro's media. Links, not words — the words are in the catalogue. */
    intro?: { videoUrl?: string; posterUrl?: string; captionsUrl?: string };
    /** The day's own header, centred with the time under it (Day 7, spec §6). */
    header?: "centered";
  };
  /**
   * The day as a sequence of steps. Absent on a day that is still its own
   * single question — see `stepsOf()`. The copy for each step is keyed by the
   * same id in the catalogue, so ids here are the contract: an answer is stored
   * under one, and renaming it orphans every answer given to it.
   */
  steps?: readonly PathStepStructure[];
}

/**
 * One step's shape: its kind and every config key that carries no language.
 * Counts are checks against the catalogue, exactly like `optionCount` on a day.
 */
export interface PathStepStructure {
  id: string;
  kind: DayKind;
  config?: {
    optionCount?: number;
    itemCount?: number;
    stopCount?: number;
    /** blanks: how many fields. Placeholders and examples must match. */
    fieldCount?: number;
    maxPicks?: number;
    ranked?: boolean;
    sortLayout?: "rows" | "cards" | "columns";
    askCaption?: boolean;
    shapes?: boolean;
    showFrom?: string;
    rehearse?: boolean;
    optionsFrom?: string;
    prefillFrom?: string;
    modes?: readonly ReflectMode[];
    layout?: "list" | "grid" | "chips";
    commit?: boolean;
    exclusiveOption?: number;
    minWords?: number;
    quiet?: boolean;
    optional?: boolean;
    deferReply?: boolean;
    noticedFrom?: string;
    keep?: "sentence" | "rule";
    fromDay?: number;
    fromStep?: string;
    presentation?: "card" | "full";
    /** scale (stops): offer "I'm not sure yet" under the scale. The words are the app's. */
    escape?: boolean;
    /** resonance: the pick rates the noticed line (yes / partly / no). */
    ratesReply?: boolean;
    /** read: a breathing moment this many breaths long, not a card. */
    breaths?: number;
    /** An optional side route: not counted, never holds the day open. */
    aside?: boolean;
    /** The look-back's own chrome: a dot pager, an X, a dark Continue. */
    pager?: "dots";
    /** Which answers a recall step quotes. The labels are copy. */
    recall?: readonly { day: number; step: string }[];
    /** Before the question, Elara says back these steps' answers (their `echo` copy). */
    echoFrom?: readonly string[];
    /** choose: the index of the "none right now" option (`DayConfig.noneOption`). */
    noneOption?: number;
  };
}

export interface PathStructure {
  icon: string;
  /**
   * No `accent` here on purpose. It is a pure function of the area
   * (`AREA_ACCENT[area]`), and a second copy is a second thing to keep in step.
   */
  days: readonly PathDayStructure[];
}

export const PATH_STRUCTURE: Record<AreaKey, PathStructure> = { money, self, energy, purpose, love, everyday };

/**
 * One day, as the app renders it and the CMS stores it: the structure above
 * zipped with one language's words.
 *
 * Pure and dependency-free on purpose — `usePathsMap` builds the offline copy
 * with it and `apps/api/scripts/gen-seed.mjs` builds the seed with it, so the
 * bundled day and the seeded day are the same object by construction rather
 * than by two hand-kept mappings agreeing.
 *
 * Only keys with a value are emitted. A step whose copy has no `sublines` gets
 * no `sublines` key, rather than an `undefined` one that would survive into
 * the seed's JSON as noise.
 */
export function composeDay(structure: PathDayStructure, words: PathDayCopy): PathDayDTO {
  const { optionCount: _count, intro: introMedia, ...structural } = structure.config ?? {};
  const intro =
    words.intro || introMedia ? compact({ ...words.intro, ...introMedia }) : undefined;
  const config = compact<DayConfig>({
    ...structural,
    options: list(words.options),
    placeholder: words.placeholder,
    actionLabel: words.actionLabel,
    minLabel: words.minLabel,
    maxLabel: words.maxLabel,
    completeTitle: words.completeTitle,
    completeElara: words.completeElara,
    payoff: words.payoff,
    teaser: words.teaser,
    weekTitle: words.weekTitle,
    nextWeekTitle: words.nextWeekTitle,
    letter: words.letter,
    letterFallback: words.letterFallback,
    purpose: words.purpose,
    intro: intro && Object.keys(intro).length ? intro : undefined,
  });
  const steps = structure.steps?.map((step) => composeStep(step, words.steps?.[step.id]));
  return compact<PathDayDTO>({
    day: structure.day,
    level: words.level,
    title: words.title,
    body: words.body,
    kind: structure.kind,
    config: Object.keys(config).length ? config : undefined,
    elara: words.elara,
    steps: steps?.length ? steps : undefined,
  });
}

function composeStep(structure: PathStepStructure, words: PathStepCopy | undefined): DayStep {
  const {
    optionCount: _o,
    itemCount: _i,
    stopCount: _s,
    fieldCount: _f,
    maxPicks,
    modes,
    recall,
    echoFrom,
    ...structural
  } = structure.config ?? {};
  const labels = words?.recallLabels ?? [];
  const config = compact<DayConfig>({
    ...structural,
    maxSelections: maxPicks,
    modes: modes ? [...modes] : undefined,
    recall: recall?.map((r, i) => ({ day: r.day, step: r.step, label: labels[i] ?? "" })),
    echoFrom: echoFrom ? [...echoFrom] : undefined,
    echo: words?.echo
      ? compact({
          sentence: words.echo.sentence,
          phrases: words.echo.phrases ? [...words.echo.phrases] : undefined,
          whole: words.echo.whole ? [...words.echo.whole] : undefined,
          other: words.echo.other,
        })
      : undefined,
    prompt: words?.prompt,
    cta: words?.cta,
    note: words?.note,
    options: list(words?.options),
    sublines: list(words?.sublines),
    otherLabel: words?.otherLabel,
    otherPlaceholder: words?.otherPlaceholder,
    otherSubline: words?.otherSubline,
    placeholder: words?.placeholder,
    ideas: list(words?.ideas),
    bullets: list(words?.bullets),
    items: list(words?.items),
    columns: list(words?.columns),
    stops: list(words?.stops),
    replies: list(words?.replies),
    eyebrow: words?.eyebrow,
    noticed: words?.noticed,
    noticedQuote: words?.noticedQuote,
    noticedFallback: words?.noticedFallback,
    remember: words?.remember,
    rememberFallback: words?.rememberFallback,
    titleFallback: words?.titleFallback,
    bodyFallback: words?.bodyFallback,
    minLabel: words?.minLabel,
    maxLabel: words?.maxLabel,
    actionLabel: words?.actionLabel,
    rankLabels: list(words?.rankLabels),
    detailLabel: words?.detailLabel,
    detailPlaceholder: words?.detailPlaceholder,
    prefill: words?.prefill,
    prefillFallback: words?.prefillFallback,
    skipLabel: words?.skipLabel,
    fields: list(words?.fields),
    placeholders: list(words?.placeholders),
    examples: words?.examples?.length ? words.examples.map((e) => [...e]) : undefined,
    card: words?.card?.label ? compact({ label: words.card.label, hint: words.card.hint }) : undefined,
  });
  return compact<DayStep>({
    id: structure.id,
    kind: structure.kind,
    // A step with no copy still renders — as a titled blank rather than a
    // crash — and the catalogue test is what stops it shipping that way.
    title: words?.title ?? "",
    body: words?.body,
    elara: words?.elara,
    config: Object.keys(config).length ? config : undefined,
  });
}

function list(values: readonly string[] | undefined): string[] | undefined {
  return values?.length ? [...values] : undefined;
}

/** Drop `undefined` keys, so JSON and deep equality see only what was authored. */
function compact<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}
