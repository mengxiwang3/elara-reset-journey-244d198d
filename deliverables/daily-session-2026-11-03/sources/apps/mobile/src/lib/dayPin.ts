/**
 * Which copy of a day the day screen keeps on screen (`app/path/day.tsx`).
 *
 * The day's content is pinned for the life of the screen so a refetch cannot
 * rebuild the day under her. But the first copy available on a cold open (a
 * direct link, a notification, Onboarding's "start Day 1", a slow network) is
 * the bundled fallback, not the CMS copy the server checks answers against.
 * Pinned for good, that showed different words from the ones everyone else
 * saw, and where the two copies name a step differently every answer was
 * refused (`step_not_found`, 404) and sat on the phone as "Guardando tu lugar".
 *
 * So the bundled pin is provisional: it gives way to the server copy once,
 * when that arrives — at once while she has not sent an answer from this
 * screen, and after that only when the server's day has exactly the same steps
 * (ids and kinds), so only the words change and no screen, cursor or answer
 * moves under her. A server day shaped differently after she has answered is
 * left as it was, as before. Pure, so it runs in Node (`dayPin.test.ts`).
 */
export interface DayPin<P> {
  locale: string;
  path: P;
  /** The CMS copy (as opposed to the bundled fallback). */
  fromServer: boolean;
}

export interface LiveDay<P> {
  locale: string;
  path: P | undefined;
  /** The live path has this day at all. */
  hasDay: boolean;
  /** The live path is the CMS copy for this area. */
  fromServer: boolean;
  /** The live day has the same steps (ids and kinds, in order) as the pinned one. */
  sameSteps: boolean;
}

/** The same steps, in order, by id and kind: what screens, answers and the cursor are keyed by. */
export function sameSteps(a: readonly { id: string; kind: string }[], b: readonly { id: string; kind: string }[]): boolean {
  return a.length === b.length && a.every((s, i) => s.id === b[i]!.id && s.kind === b[i]!.kind);
}

/**
 * The pin to set now, or `null` to keep the current one.
 *
 * `answered`: she has sent an answer (or a skip) from this screen.
 */
export function nextDayPin<P>(pinned: DayPin<P> | null, live: LiveDay<P>, answered: boolean): DayPin<P> | null {
  if (!live.path || !live.hasDay) return null;
  const take = { locale: live.locale, path: live.path, fromServer: live.fromServer };
  if (!pinned || pinned.locale !== live.locale) return take;
  if (!pinned.fromServer && live.fromServer && pinned.path !== live.path && (!answered || live.sameSteps)) return take;
  return null;
}
