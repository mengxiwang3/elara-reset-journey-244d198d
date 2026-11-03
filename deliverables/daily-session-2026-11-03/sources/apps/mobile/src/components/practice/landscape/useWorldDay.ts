import { stepsOf, type DayStep, type DayStepAnswers, type PathDayDTO } from "@elara/shared";
import { useRef } from "react";
import { initialSceneState, sceneForDay } from "@/components/world/scene";
import type { SceneState, WorldId, WorldResponse } from "@/components/world/types";
import { worldForWeek, WORLDS } from "@/components/world/worlds";
import { getLocale, useLocale, useT } from "@/i18n";
import { copy25dFor } from "@/components/world25d/copy";
import { photoPlaceFor } from "@/content/placeDay";
import { dayKey } from "@/lib/dates";
import { world as worldMotion } from "@/motion";
import type { PathProgress } from "@/store/useAppStore";
import { activityOrdinal, authoredPlan, beatMs, planFor, returnLineFor, walkStateFor, type ResponseKind } from "./journey";
import { useWorldLedger } from "./ledger";
import type { Opening } from "./WorldDay";

type T = ReturnType<typeof useT>;

/**
 * A 2.5D scene's own words, unless the world is walked in its photographed
 * place: there the place's name and stops (the catalogue) are what she sees.
 */
function words25d(world: WorldId, locale: ReturnType<typeof getLocale>) {
  return photoPlaceFor(world) ? null : copy25dFor(world, locale);
}

/** The line a response leaves: the landmark's caption for `lay`, else the world's response line. */
export function responseCaption(t: T, world: WorldId, day: number, response: WorldResponse): string {
  const w = words25d(world, getLocale()) ?? t.world.worlds[world];
  return response === "lay" ? (w.captions[day - 1] ?? "") : w.responses[response];
}

/** A world's landmark copy for a day (1..7). */
export function landmark(t: T, world: WorldId, day: number): { at: string; toward: string } {
  const list = (words25d(world, getLocale()) ?? t.world.worlds[world]).landmarks;
  return list[Math.max(0, Math.min(list.length - 1, day - 1))];
}

/**
 * Where she stands in a Money Clarity world, derived from her saved answers:
 * the input the Atlas, Today and the day screens can all read. Never stored on
 * its own, so it cannot drift from what she actually answered.
 */
export function sceneStateFor(
  area: string,
  pathDay: number,
  days: readonly PathDayDTO[],
  progress: Pick<PathProgress, "stepAnswers" | "completedDays"> | undefined,
): SceneState | null {
  const week = Math.ceil(pathDay / 7);
  const world = worldForWeek(week, area);
  const content = days[pathDay - 1];
  if (!world || !content) return null;
  const day = pathDay - (week - 1) * 7;
  const steps = stepsOf(content);
  const answers = progress?.stepAnswers?.[pathDay];
  const plan = planFor(
    steps.map((s) => s.id),
    authoredPlan(steps.map((s) => s.id), WORLDS[world].plan?.[day]),
  );
  const walked = steps.filter((s) => answers?.[s.id]).length;
  const complete = !!progress?.completedDays?.includes(pathDay);
  return { worldId: world, ...walkStateFor({ day, plan, step: walked, complete }) };
}

/**
 * Everything a day screen needs to walk a day inside a world, computed once
 * the day's screens are known. `opening` and `initial` are frozen on first
 * use: they describe how she came in, and must not change under her.
 */
export function useWorldDay({
  area,
  areaName,
  days,
  dayNum,
  week,
  dayInWeek,
  steps,
  screenIds,
  dayAnswers,
  progress,
  introSeen,
  hasStepParam,
  again = false,
  session = false,
  sessionOpening = false,
}: {
  area: string;
  /** "Money Clarity": the poster's eyebrow. */
  areaName: string;
  days: readonly PathDayDTO[];
  dayNum: number;
  week: number;
  dayInWeek: number;
  steps: readonly DayStep[];
  screenIds: readonly string[];
  dayAnswers: DayStepAnswers | undefined;
  progress: PathProgress | undefined;
  introSeen: boolean;
  hasStepParam: boolean;
  /**
   * Walking a finished day again: open on its steps, as an edit does, never
   * on its arrival or the world's close. Part of the frozen key, so turning it
   * on from the arrival card starts the scene over.
   */
  again?: boolean;
  /**
   * The day has a `purpose` (the daily session, Nov 2026): its way in is the
   * session's opening, whatever day of the week it is, and nothing else.
   */
  session?: boolean;
  /** …and this is the way in, not a resume (`opensOnSession`): open on it. */
  sessionOpening?: boolean;
}) {
  const t = useT();
  // A hook, so it is read before the early return below, never after it.
  const locale = useLocale();
  const ledger = useWorldLedger();
  const world = worldForWeek(week, area);
  const plan: ResponseKind[] = world
    ? planFor(screenIds, authoredPlan(steps.map((s) => s.id), WORLDS[world].plan?.[dayInWeek]))
    : [];
  const frozen = useRef<{ key: string; initial: SceneState; opening: Opening; startArrived: boolean; startRevealed: boolean } | null>(null);

  if (!world) return null;
  const meta = WORLDS[world];
  const copy25d = words25d(world, locale);
  const names = copy25d ?? t.world.worlds[world];
  const here = landmark(t, world, dayInWeek);
  const next = dayInWeek < 7 ? landmark(t, world, dayInWeek + 1) : null;
  const placeDay = t.day.placeDay(names.name, dayInWeek);
  const complete = !!progress?.completedDays.includes(dayNum);

  // The screen can stay mounted while its params change (a deep link or a
  // "next day" replace onto the same route): a frozen start belongs to one
  // world and one day, never to the next.
  const frozenKey = `${world}|${dayNum}${again ? "|again" : ""}`;
  if (frozen.current && frozen.current.key !== frozenKey) frozen.current = null;
  if (!frozen.current && screenIds.length) {
    const revealed = ledger.revealed.includes(world);
    const lastOfWorld = dayInWeek >= 7;
    const onSteps = hasStepParam || again;
    const startRevealed = complete && lastOfWorld && revealed && !onSteps;
    const startArrived = complete && !startRevealed && !onSteps;
    let opening: Opening = null;
    // Mid-day resume: the scene opens at the step she reached, with no camera
    // move and no line. Counted from her saved answers, not the screen index,
    // which is still settling on the first render.
    const walked = screenIds.filter((id) => dayAnswers?.[id]).length;
    let initial: SceneState = { worldId: world, ...walkStateFor({ day: dayInWeek, plan, step: walked, complete }) };
    // The ledger reads from disk; until it has, a one-time moment cannot know
    // whether it is spent, so it stays quiet rather than risk playing twice.
    const hydrated = useWorldLedger.persist?.hasHydrated?.() ?? true;
    if (session) {
      // A day with a purpose opens on it, every time it is begun, and never on
      // a resume: then she goes straight back to her step, with no poster and
      // no line in the pill. Nothing here waits on the ledger.
      if (sessionOpening && !complete && !dayAnswers) {
        const poster = copy25d ? undefined : (t.day.worlds as Record<string, { poster: string; enter: string } | undefined>)[world];
        opening = {
          kind: "poster",
          eyebrow: t.day.areaWeek(areaName, week),
          title: names.name,
          body: poster?.poster ?? names.line,
          payoff: days.find((d) => d.day === dayNum)?.config?.payoff ?? null,
          begin: t.day.enter.begin,
          beginA11y: t.day.enter.beginA11y(names.name),
          name: names.name,
          line: poster?.enter ?? names.line,
        };
      }
    } else if (hydrated && !complete && !dayAnswers) {
      if (dayInWeek === 1 && !ledger.entered.includes(world)) {
        // The poster prose describes the paper meadow and night sky; the 2.5D worlds use the world's own line.
        const poster = copy25d ? undefined : (t.day.worlds as Record<string, { poster: string; enter: string } | undefined>)[world];
        opening = introSeen
          ? { kind: "name", name: names.name, line: poster?.enter ?? names.line }
          : {
              kind: "poster",
              eyebrow: t.day.areaWeek(areaName, week),
              title: names.name,
              body: poster?.poster ?? names.line,
              payoff: days.find((d) => d.day === dayNum)?.config?.payoff ?? null,
              begin: t.day.enter.begin,
              beginA11y: t.day.enter.beginA11y(names.name),
              name: names.name,
              line: poster?.enter ?? names.line,
            };
      } else if (dayInWeek > 1) {
        const prevDay = dayNum - 1;
        const kind = returnLineFor({
          dayInWorld: dayInWeek,
          answeredToday: false,
          previousComplete: !!progress?.completedDays.includes(prevDay),
          today: dayKey(new Date()),
          lastShownOn: ledger.returnShownOn,
          lastWalkedOn: lastWalked(progress),
        });
        if (kind) {
          const back = landmark(t, world, dayInWeek - 1);
          const text = kind === "away" ? t.day.return.away : t.day.return.back(back.at);
          const prevSteps = days[prevDay - 1] ? stepsOf(days[prevDay - 1]).length : 1;
          initial = sceneForDay(world, dayInWeek - 1, { complete: true, n: prevSteps });
          opening = {
            kind: "return",
            line: text,
            small: placeDay,
            reducedLine: t.day.return.reduced(text, here.toward),
            today: initialSceneState(world, dayInWeek, Math.max(1, plan.length)),
          };
        }
      }
    }
    frozen.current = { key: frozenKey, initial, opening, startArrived, startRevealed };
  }

  const dayLengths = days.slice((week - 1) * 7, week * 7).map((d) => stepsOf(d).length);
  return {
    world,
    meta,
    names,
    plan,
    here,
    next,
    placeDay,
    complete,
    frozen: frozen.current,
    caption: (response: WorldResponse) => responseCaption(t, world, dayInWeek, response),
    /**
     * The scene with the sheet on screen `index` of an unfinished day: as many
     * responses fired as screens before it. Back and a resume settle here, so
     * the next beat (always one step on from where the scene stands) lands on
     * the step the sheet is on.
     */
    stateAt: (index: number): SceneState => ({ worldId: world, ...walkStateFor({ day: dayInWeek, plan, step: index, complete: false }) }),
    beatMsAt: (i: number) => beatMs(activityOrdinal(dayInWeek, i, dayLengths), worldMotion),
  };
}

/** Her latest answer anywhere on the path, as a local calendar day. */
function lastWalked(progress: PathProgress | undefined): string | null {
  let latest = 0;
  for (const day of Object.values(progress?.stepAnswers ?? {})) {
    for (const a of Object.values(day ?? {})) latest = Math.max(latest, a?.answeredAt ?? 0);
  }
  return latest ? dayKey(new Date(latest)) : null;
}
