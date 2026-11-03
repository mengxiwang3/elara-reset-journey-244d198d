import { useEffect, useMemo, useState } from "react";
import type { AreaKey } from "@/content/types";
import { AppState } from "react-native";
import { formatLocale, type Strings } from "@/i18n";
import { dayGateFor } from "@/lib/dayGate";
import type { PathProgress } from "@/store/useAppStore";
import { useAppStore } from "@/store/useAppStore";

/** setTimeout's ceiling; a longer wait is re-armed when it fires. */
const MAX_TIMER_MS = 2_147_483_647;

/**
 * "Week 1 · Day 2 done · Come back tomorrow": whether her next day is still
 * waiting to open, and when it does.
 *
 * `null` when there is nothing to wait for (`dayGateFor`): the rule is `open`,
 * she hasn't finished a day yet, the path is done, the moment has passed, or
 * she has already started the next day. The rule comes from the server
 * (`/api/app-config` `practice.dayUnlock`), and the moment from the day's
 * first completion (`ProgressDTO.dayCompletedAt`, or this phone's frozen
 * anchor until the server's arrives), never from its latest answer: editing a
 * finished day after midnight must not move tomorrow (R2-M4).
 *
 * The screen updates at the unlock time without a restart (spec §5): a timer
 * for the moment itself, and a re-check on return to the foreground, where a
 * timer may not have run.
 */
export function useDayGate(
  progress: PathProgress | undefined,
  totalDays: number,
  /** The path's area: its days still queued on this phone count from now (`dayGateFor`). */
  area?: AreaKey,
): { finishedDay: number; nextDay: number; opensAt: number } | null {
  const rule = useAppStore((s) => s.dayUnlock);
  const [now, setNow] = useState(() => Date.now());
  // As a string, so a queue that changes elsewhere does not re-render this.
  const unsyncedKey = useAppStore((s) =>
    area
      ? [...new Set(s.pendingSteps.filter((q) => q.area === area).map((q) => q.day))].sort((a, b) => a - b).join(",")
      : "",
  );
  const unsynced = useMemo(() => (unsyncedKey ? unsyncedKey.split(",").map(Number) : []), [unsyncedKey]);

  const gate = dayGateFor(progress, totalDays, rule, now, unsynced);
  const opensAt = gate?.opensAt ?? null;

  useEffect(() => {
    if (opensAt === null) return;
    const id = setTimeout(() => setNow(Date.now()), Math.min(MAX_TIMER_MS, Math.max(0, opensAt - Date.now()) + 250));
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") setNow(Date.now());
    });
    return () => {
      clearTimeout(id);
      sub.remove();
    };
  }, [opensAt, now]);

  return gate;
}

/**
 * "Week 1 · Day 3 opens tomorrow at 8:00": today, tomorrow, or the weekday.
 * A day that opens at her midnight is "Come back tomorrow" instead (fix list
 * #1): "opens tomorrow at 12:00 AM" reads like a system notice.
 */
export function opensWhen(
  { week, dayInWeek }: { week: number; dayInWeek: number },
  at: number,
  now: Date,
  t: Strings,
): string {
  const when = new Date(at);
  const time = when.toLocaleTimeString(formatLocale(), { hour: "numeric", minute: "2-digit" });
  const midnight = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((midnight(when) - midnight(now)) / 86_400_000);
  if (days === 1 && when.getHours() === 0 && when.getMinutes() === 0) return t.home.today.comeBackTomorrow;
  if (days <= 0) return t.home.today.opensToday(week, dayInWeek, time);
  if (days === 1) return t.home.today.opensTomorrow(week, dayInWeek, time);
  return t.home.today.opensOn(week, dayInWeek, when.toLocaleDateString(formatLocale(), { weekday: "long" }), time);
}
