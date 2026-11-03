import { useMemo } from "react";
import type { AreaKey } from "@/content/types";
import { useDayGate } from "@/hooks/useDayGate";
import { usePathsMap } from "@/hooks/usePaths";
import { useAppStore, type PathProgress } from "@/store/useAppStore";
import { weekWorld } from "./weekWorld";

const EMPTY: PathProgress = { currentDay: 1, completedDays: [], responses: {}, stepAnswers: {}, startedAt: 0 };

/**
 * Today's and Paths' one reading of where she is. Both screens call this and
 * nothing else for her position: the path's days (`usePathsMap`, the same
 * content the day screen walks), her progress from the store (written the
 * moment a day completes, synced behind it), and the day gate.
 *
 * `area` defaults to the path she is on; Paths passes its route's area.
 */
export function useWeekWorld(area?: AreaKey) {
  const activeArea = useAppStore((s) => s.activeArea);
  const key = area ?? activeArea;
  const path = usePathsMap()[key];
  const stored = useAppStore((s) => s.progress[key]);
  const progress = stored ?? EMPTY;
  const gate = useDayGate(stored, path?.days.length ?? 0, key);
  const model = useMemo(
    () => weekWorld({ area: key, days: path?.days ?? [], progress, gate }),
    [key, path?.days, progress, gate?.finishedDay, gate?.nextDay], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return { area: key, path, progress, gate, model, started: !!stored };
}
