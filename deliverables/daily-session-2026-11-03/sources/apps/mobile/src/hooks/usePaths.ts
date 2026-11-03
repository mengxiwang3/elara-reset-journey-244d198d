import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { isAside, stepsOf, type PathContentDTO, type PersonalizedDayDTO } from "@elara/shared";
import { composeDay, PATH_STRUCTURE } from "@/content/paths";
import { AREA_ACCENT, AREA_ORDER, type AreaKey, type Path } from "@/content/types";
import { useLocale, useT } from "@/i18n";
import type { Strings } from "@/i18n/types";
import { api } from "@/lib/api";
import { qk } from "@/lib/query";
import { useAppStore } from "@/store/useAppStore";
import { useSession } from "@/lib/authClient";

/** Map an API PathContentDTO to the local `Path` shape screens already use. */
function dtoToPath(dto: PathContentDTO): Path {
  return {
    key: dto.area,
    label: dto.label,
    name: dto.name,
    areaName: dto.areaName,
    icon: dto.icon,
    accent: dto.accent,
    tagline: dto.tagline,
    days: dto.days.map((d) => ({
      day: d.day,
      level: d.level,
      title: d.title,
      body: d.body,
      kind: d.kind,
      config: d.config,
      elara: d.elara,
      steps: d.steps,
    })),
  };
}

/**
 * The bundled path for one area: its structure (`content/paths.ts`) zipped with
 * its words (the string catalogue), in the member's language.
 *
 * Positional zip, deliberately. The day list in both halves is seven entries in
 * day order, and pairing them by index rather than by a repeated day number
 * means a translation has no way to renumber someone's week — the worst it can
 * do is be checked and fail (`i18n.test.ts` asserts the counts line up).
 */
function bundledPath(area: AreaKey, t: Strings): Path {
  const structure = PATH_STRUCTURE[area];
  const copy = t.pathContent.byArea[area];
  return {
    key: area,
    label: copy.label,
    name: copy.name,
    areaName: copy.areaName,
    icon: structure.icon,
    accent: AREA_ACCENT[area],
    tagline: copy.tagline,
    // `composeDay` is the same function the seed generator uses, so the day a
    // member sees offline and the day the CMS was seeded with are one object.
    days: structure.days.map((d, i) => composeDay(d, copy.days[i])),
  };
}

/**
 * Overlay the member's personalised questions onto a path.
 *
 * Applied per **step**, and only to the three fields that are the question
 * itself: the heading, its supporting line, and the text-field hint. `id`,
 * `kind`, `elara` and — crucially — `config.options` stay exactly as authored,
 * because those are what the renderer branches on, what a saved answer is
 * stored as, and what a stored answer is keyed by. A generated step cannot
 * change what kind of thing a step is, what answers it accepts, or which
 * question an answer belongs to.
 *
 * Sparse in both directions: a day with no overlay keeps all its authored
 * steps, and a day where one step of three was personalised keeps the other two
 * as written. `body` and `placeholder` are only overridden when present, so a
 * generation that returned a question and nothing else keeps the authored
 * supporting copy rather than blanking it.
 */
function personalize(path: Path, forArea: PersonalizedDayDTO[]): Path {
  if (!forArea.length) return path;
  const byDay = new Map(forArea.map((d) => [d.day, d.steps]));
  return {
    ...path,
    days: path.days.map((day) => {
      const overrides = byDay.get(day.day);
      if (!overrides) return day;
      const steps = stepsOf(day).map((step) => {
        const custom = overrides[step.id];
        if (!custom) return step;
        return {
          ...step,
          title: custom.title,
          body: custom.body ?? step.body,
          config: custom.placeholder
            ? { ...step.config, placeholder: custom.placeholder }
            : step.config,
        };
      });
      // The day's own headline follows its first step, so the path overview and
      // the Circle prompt say the same thing the member is about to be asked.
      // Its first *question*: a breathing moment ahead of it is not what the
      // day asks.
      return { ...day, steps, title: steps.find((s) => !isAside(s))?.title ?? day.title };
    }),
  };
}

/**
 * Path content keyed by area, sourced from the D1 CMS (`GET /api/paths`) with
 * the bundled local content as an instant, offline-safe fallback. The local
 * copy guarantees all six areas always resolve while the fetch is in flight —
 * and now resolves them in the member's own language rather than in English.
 *
 * ## Three layers, each one a fallback for the one above it
 *
 * 1. the member's personalised question, when one has been generated, approved
 *    and validated for that exact day;
 * 2. the CMS copy for their language, falling back per area to English;
 * 3. the bundled copy, which ships in the app and needs no network at all.
 *
 * The layers are applied in that order and every one of them is optional, so
 * there is no state — offline, signed out, mid-fetch, model down, feature off —
 * in which a day fails to render. That is why this is the only place the
 * personalised copy is applied: every screen that reads a day (the day screen,
 * the path overview, the Circle prompt) goes through here, so they cannot
 * disagree about what today's question is.
 */
export function usePathsMap(): Record<AreaKey, Path> {
  const locale = useLocale();
  const t = useT();
  const { data: session } = useSession();
  // Keyed by language: switching to Spanish must not keep serving the English
  // paths already in the cache, and switching back must not re-fetch them.
  const { data } = useQuery({ queryKey: qk.paths(locale), queryFn: api.getPaths });
  // Signed-out screens (onboarding, the marketing-ish Explore preview) have no
  // member to personalise for, and asking would 401 on every mount.
  const { data: custom } = useQuery({
    queryKey: qk.pathQuestions(locale),
    queryFn: api.getPathQuestions,
    enabled: !!session?.user,
  });

  return useMemo(() => {
    const bundled = Object.fromEntries(
      AREA_ORDER.map((area) => [area, bundledPath(area, t)]),
    ) as Record<AreaKey, Path>;
    if (data?.length) {
      for (const dto of data) bundled[dto.area] = dtoToPath(dto);
    }
    if (custom?.length) {
      const byArea = new Map<AreaKey, PersonalizedDayDTO[]>();
      for (const day of custom) {
        const list = byArea.get(day.area) ?? [];
        list.push(day);
        byArea.set(day.area, list);
      }
      for (const [area, days] of byArea) {
        if (bundled[area]) bundled[area] = personalize(bundled[area], days);
      }
    }
    return bundled;
  }, [data, custom, t]);
}

/**
 * Whether `usePathsMap()[area]` is the CMS copy yet, rather than the bundled
 * fallback. Same query as `usePathsMap` (one request, one cache entry).
 */
export function useHasServerPath(area: AreaKey): boolean {
  const locale = useLocale();
  const { data } = useQuery({ queryKey: qk.paths(locale), queryFn: api.getPaths });
  return !!data?.some((dto) => dto.area === area);
}

/** Ordered list of paths for the Journeys / Explore / Clarity Assessment screens. */
export function usePathList(): Path[] {
  const map = usePathsMap();
  return useMemo(() => AREA_ORDER.map((k) => map[k]), [map]);
}

/** The active path composed from fetched content + store progress. */
export function useActivePath() {
  const area = useAppStore((s) => s.activeArea);
  const progress = useAppStore((s) => s.progress[area]);
  const map = usePathsMap();
  return {
    area,
    path: map[area],
    progress:
      progress ?? {
        currentDay: 1,
        completedDays: [] as number[],
        responses: {},
        stepAnswers: {},
        startedAt: 0,
      },
  };
}

/**
 * The prompt shown on the Circle tab and in the composer. It follows the day
 * the user is actually on, so both screens say the same true thing instead of
 * repeating a hardcoded line with no data behind it.
 */
export function useDailyPrompt(): string {
  const t = useT();
  const { path, progress } = useActivePath();
  const day = path?.days[Math.min(progress.currentDay, path.days.length) - 1];
  return day?.title ?? t.circle.feed.fallbackPrompt;
}
