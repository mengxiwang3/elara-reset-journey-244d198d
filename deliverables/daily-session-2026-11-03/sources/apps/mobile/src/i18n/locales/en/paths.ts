import type { AreaKey } from "@/content/types";
import { money } from "./pathCopy/money";
import { self } from "./pathCopy/self";
import { energy } from "./pathCopy/energy";
import { purpose } from "./pathCopy/purpose";
import { love } from "./pathCopy/love";
import { everyday } from "./pathCopy/everyday";

/**
 * The words of the bundled 7-day path content.
 *
 * A **fallback** — the CMS is the source of truth and serves paths per
 * language (`GET /api/paths`, with a per-area fallback to English), and `usePathsMap` merges that over this. What this covers is the
 * gap the CMS structurally cannot: the very first launch, before any fetch has
 * landed, and every launch after that without a connection.
 *
 * That gap is not a corner case for onboarding. A member arrives, answers two
 * questions and is shown a path — often on a phone that has not finished
 * fetching anything. Leaving this English would mean a Spanish member meeting
 * their own path in English at the exact moment the app is trying to earn their
 * trust.
 *
 * Everything with no language in it — the area key, the icon, the accent, the
 * day `kind`, the scale bounds — stays in `content/paths.ts`. This is only the
 * copy, and `PATH_COPY` is keyed so the two line up day by day.
 */
export interface PathDayCopy {
  level: string;
  title: string;
  body?: string;
  elara?: string;
  /** For `choose` and `multi` days — in the same order as the English list. */
  options?: readonly string[];
  placeholder?: string;
  actionLabel?: string;
  minLabel?: string;
  maxLabel?: string;
  linkLabel?: string;

  // The practice redesign. Day-level copy — see the same keys on `DayConfig`.
  completeTitle?: string;
  completeElara?: string;
  /** Day 1: one line under the opening on where the week is going. See `DayConfig.payoff`. */
  payoff?: string;
  teaser?: string;
  weekTitle?: string;
  nextWeekTitle?: string;
  intro?: {
    title?: string;
    guide?: string;
    duration?: string;
    length?: string;
    captions?: string;
    note?: string;
  };
  letter?: string;
  letterFallback?: string;
  /** The daily session: one sentence on why today matters («Por qué hoy»). See `DayConfig.purpose`. */
  purpose?: string;
  /**
   * The words of each step, keyed by the step id in `content/paths.ts`. Keyed
   * rather than positional because steps are referenced by id from other days
   * ("{d3.pause}") — a positional list would make a translation able to point
   * a quote at the wrong answer.
   */
  steps?: Readonly<Record<string, PathStepCopy>>;
}

/**
 * The words of one step. Lists are parallel to each other and to the English
 * ones (`sublines[i]` belongs to `options[i]`), and a stored answer *is* the
 * option's text — so a translation keeps every list the same length, in the
 * same order. `i18n.test.ts` checks the counts against the structure.
 *
 * Text fields documented as templates on `DayConfig` may quote earlier answers
 * with `{d3.pause}`; keep the braces untranslated.
 */
export interface PathStepCopy {
  title: string;
  titleFallback?: string;
  body?: string;
  /** Used when a templated `body` cannot be filled (her answer was skipped, hidden or too long to quote). */
  bodyFallback?: string;
  elara?: string;
  prompt?: string;
  cta?: string;
  note?: string;
  options?: readonly string[];
  sublines?: readonly string[];
  otherLabel?: string;
  otherPlaceholder?: string;
  otherSubline?: string;
  placeholder?: string;
  ideas?: readonly string[];
  bullets?: readonly string[];
  items?: readonly string[];
  columns?: readonly string[];
  stops?: readonly string[];
  replies?: readonly string[];
  recallLabels?: readonly string[];
  eyebrow?: string;
  noticed?: string;
  noticedQuote?: string;
  noticedFallback?: string;
  remember?: string;
  rememberFallback?: string;
  minLabel?: string;
  maxLabel?: string;
  actionLabel?: string;
  /** Week 2 workflows — see the same keys on `DayConfig`. */
  rankLabels?: readonly string[];
  detailLabel?: string;
  detailPlaceholder?: string;
  prefill?: string;
  prefillFallback?: string;
  skipLabel?: string;
  fields?: readonly string[];
  placeholders?: readonly string[];
  examples?: readonly (readonly string[])[];
  /** The daily session: this step's slot on the takeaway card. See `DayConfig.card`. */
  card?: { label: string; hint?: string };
  /**
   * What Elara says back when a later step names this one in `echoFrom`: one
   * phrase (or whole sentence) per option, parallel to `options`. Never the
   * option's label lower-cased. See `EchoCopy`.
   */
  echo?: {
    sentence: string;
    phrases?: readonly string[];
    whole?: readonly string[];
    other?: string;
  };
}

export interface PathCopy {
  label: string;
  name: string;
  areaName: string;
  tagline: string;
  /**
   * Seven entries, in day order. Positional, not keyed by day number: the
   * structure lives in `content/paths.ts` and this list is zipped onto it, so
   * a translation cannot accidentally renumber a member's week.
   */
  days: readonly PathDayCopy[];
}

/**
 * Annotated rather than inferred, for the same reason the explainer copy is:
 * every area has one shape, and indexing by a variable `AreaKey` should not
 * produce a union of six differently-shaped objects.
 */
const byArea: Record<AreaKey, PathCopy> = {
    money,
    self,
    energy,
    purpose,
    love,
    everyday,
};

export const pathContent = { byArea } as const;
