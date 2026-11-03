import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useWeekWorld } from "@/components/journey/useWeekWorld";
import { worldForWeek } from "@/components/world/worlds";
import type { WorldId } from "@/components/world/types";
import { placeOfWorld, type PlaceId } from "@/content/places";
import type { AreaKey } from "@/content/types";
import { useT, type Strings } from "@/i18n";
import { qk, queryClient } from "@/lib/query";
import { progressReady, progressStatus, type ProgressStatus } from "@/store/accountState";
import { useAppStore } from "@/store/useAppStore";
import { useDayPlace } from "@/store/useDayPlace";
import { draftHasWords, entryWords, todayEntryWhenReady, type EntrySource, type ResolvedEntry } from "./todayEntry";

/**
 * Today's entry: the ONE function behind Hoy's main button, the Pregunta tab
 * (the orb) and the Atlas "Continue" (Final Pass FX 1). It reads the day
 * state and opens today's practice at the saved step, today's review, or the
 * week. The rule itself is `resolveTodayEntry` (pure, tested); this adds the
 * store reads, the words and the navigation.
 *
 * ```ts
 * const entry = useTodayEntry({ source: "atlas", area });
 * entry?.label;  // "Seguir con el día 3"
 * entry?.hint;   // "Vas en el paso 2 de 3. Guardamos lo que escribiste."
 * entry?.kind;   // "practice" | "review" | "week"
 * entry?.go();   // opens it
 * ```
 *
 * `null` only while the path's content has not loaded. Pregunta is marked as
 * the current tab whenever the screen this opens is up (`isEntryRoute`, read
 * by `TabBar`), whichever door was used.
 */
export interface TodayEntry extends ResolvedEntry {
  /** The button's words: «Empezar el día 3», «Seguir con el día 3», «Ver lo que respondiste», «Ver tu semana en Wuzhen». */
  label: string;
  /** «Vas en el paso 2 de 3. Guardamos lo que escribiste.», only while a day is in progress. */
  hint?: string;
  /** The week's place: its world, its photographed place (if any) and its names. */
  place: PlaceWords;
  /** Opens the entry (`router.push(href)`). */
  go: () => void;
}

export interface PlaceWords {
  worldId: WorldId | null;
  placeId: PlaceId | null;
  /** "Wuzhen". */
  name: string;
  /** "Wuzhen, China" (the name alone for a place with no country). */
  full: string;
}

/** The place a week of an Area is walked in, in her language. */
export function placeWordsFor(t: Strings, area: string, week: number): PlaceWords {
  const worldId = worldForWeek(week, area);
  const place = worldId ? placeOfWorld(worldId) : null;
  const named = place ? (t.globe.places as Record<string, { name: string; country: string } | undefined>)[place.id] : undefined;
  const name = named?.name ?? (worldId ? t.world.worlds[worldId].name : "");
  return {
    worldId,
    placeId: place?.id ?? null,
    name,
    full: named ? t.home.hoy.placeName(named.name, named.country) : name,
  };
}

export function useTodayEntry({ area, source = "today" }: { area?: AreaKey; source?: EntrySource } = {}): TodayEntry | null {
  const t = useT();
  const router = useRouter();
  const { area: key, path, progress, gate, started } = useWeekWorld(area);
  const rule = useAppStore((s) => s.dayUnlock);
  // `null` until the entitlement has loaded: a member must never be sent to
  // the paywall for that second on a cold start (as `path/day` waits too).
  const premium = useAppStore((s) => (s.subscription === null ? null : s.isPremium));
  // Moves at midnight and on return to the app (SessionSync): "missed" is a
  // calendar fact, so the entry is re-read when the day turns.
  const todayKey = useAppStore((s) => s.todayKey);
  const userId = useAppStore((s) => s.user?.id ?? null);
  // No door into a day until the progress in the store is hers: before her
  // own progress is read, the store says "Week 1 · Day 1" (`progressReady`).
  const ready = useAppStore((s) => progressReady(s.progressSyncedFor, s.user?.id));
  // Where she was inside an unfinished day, on this phone. Only her own.
  const place = useDayPlace((s) => (s.owner != null && s.owner === userId ? s.places[key] : undefined));
  // The steps of this Area holding a draft with something of hers in it
  // (`draftHasWords`: opening a step saves an empty one), as one string so
  // typing (a new draft every 300 ms) does not re-render every door.
  const draftKeys = useAppStore((s) => {
    const prefix = `${key}:`;
    return Object.keys(s.drafts)
      .filter((k) => k.startsWith(prefix) && draftHasWords(s.drafts[k]))
      .sort()
      .join("\n");
  });

  const resolved = useMemo(() => {
    if (!path) return null;
    const drafts = new Set(draftKeys ? draftKeys.split("\n") : []);
    return todayEntryWhenReady(ready, {
      area: key,
      days: path.days,
      progress: started ? progress : undefined,
      gate,
      rule,
      now: Date.now(),
      premium,
      remembered: place && place.day === progress.currentDay ? place.stepId : null,
      drafted: (day, stepId) => drafts.has(`${key}:${day}:${stepId}`),
      source,
    });
    // `todayKey` is not read inside: it is what re-reads the clock at midnight.
    // The gate is a fresh object every render; its three fields are what count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, path, ready, progress, started, gate?.finishedDay, gate?.nextDay, gate?.opensAt, rule, premium, place, draftKeys, source, todayKey]);

  const href = resolved?.href;
  const go = useCallback(() => {
    if (href) router.push(href);
  }, [href, router]);

  return useMemo(() => {
    if (!resolved) return null;
    const words = placeWordsFor(t, key, resolved.week);
    return { ...resolved, ...entryWords(resolved, t.home.hoy.entry, words.name), place: words, go };
  }, [resolved, t, key, go]);
}

/**
 * Whether her progress is ready for today's entry, and, while it is not,
 * whether the read is still on its way or failed (`accountState.progressStatus`).
 * Hoy shows a placeholder or a retry where the day would be, instead of a
 * Day 1 that is not hers. Observes the progress read SessionSync makes; it
 * never fetches on its own.
 */
export function useProgressStatus(): { status: ProgressStatus; retry: () => void } {
  const ready = useAppStore((s) => progressReady(s.progressSyncedFor, s.user?.id));
  const read = useQuery({ queryKey: qk.myPaths, enabled: false });
  const status = progressStatus({ ready, query: read.status, fetching: read.fetchStatus === "fetching" });
  const retry = useCallback(() => {
    void queryClient.refetchQueries({ queryKey: qk.myPaths });
  }, []);
  return { status, retry };
}
