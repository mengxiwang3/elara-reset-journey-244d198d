import { QueryClient } from "@tanstack/react-query";
import type { Locale } from "@elara/shared";

/** Shared QueryClient. Conservative defaults tuned for a mobile session. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Drop everything cached for whoever was signed in, keeping only what belongs
 * to the phone (`appConfig`: switches and links, the same for everyone).
 *
 * Log out and deletion `clear()` the cache themselves; a session that ends
 * without either (expired, revoked) used to keep it. The next account to sign
 * in was then handed the last one's `/api/me` on its first render, which
 * restored and sent the previous person's held answers under the new session.
 */
export function clearAccountQueries(client: Pick<QueryClient, "removeQueries">): void {
  client.removeQueries({ predicate: (q) => q.queryKey[0] !== "appConfig" });
}

/** The phone came back online: it was offline on the last reading and is not now. */
export function reconnected(wasOffline: boolean, offline: boolean): boolean {
  return wasOffline && !offline;
}

/**
 * What to ask for again when the phone is back online (beta hardening, 3 Nov
 * 2026): every query on screen whose last read failed. React Query is not told
 * about the phone's connection (`onlineManager` has no listener on a phone),
 * so after a launch without signal the CMS paths, Hoy's guide and the app's
 * switches stayed failed until a screen remounted. Only failed ones: a working
 * cache is not re-read, and nothing off screen is fetched.
 */
export const reconnectRefetch = {
  type: "active" as const,
  predicate: (q: { state: { status: string } }) => q.state.status === "error",
};

/**
 * A read tagged with the account it was made for (her progress, `owner`),
 * only when that is the account signed in now: never one that outlived a
 * Log out or a change of account, which would hand the store someone else's
 * progress.
 */
export function readFor<T extends { owner: string | null }>(read: T | undefined, sessionUserId: string | null | undefined): T | null {
  return read && sessionUserId && read.owner === sessionUserId ? read : null;
}

/**
 * The cached profile, only when it is this session's account's. A cache that
 * outlived a sign-out holds someone else's, and must read as "not loaded yet".
 */
export function profileFor<T extends { id: string }>(me: T | undefined, sessionUserId: string | null | undefined): T | undefined {
  return me && sessionUserId && me.id === sessionUserId ? me : undefined;
}

/** Centralized query keys so invalidation stays consistent. */
export const qk = {
  me: ["me"] as const,
  appConfig: ["appConfig"] as const,
  /**
   * CMS content, keyed by the language it was fetched in.
   *
   * Without the language in the key, switching to Spanish would keep serving
   * the cached English paths until the 30-second stale time expired — and on a
   * screen the member is looking at while they switch. Keying by language also
   * means switching back is instant, because the English copy is still there.
   */
  paths: (locale: Locale) => ["paths", locale] as const,
  myPaths: ["myPaths"] as const,
  /**
   * Personalised day questions, keyed by language for the same reason `paths`
   * is: the server resolves which language's path a member is served, and the
   * overlay has to follow it rather than sit on top of the wrong week.
   */
  pathQuestions: (locale: Locale) => ["pathQuestions", locale] as const,
  onboarding: ["onboarding"] as const,
  subscription: ["subscription"] as const,
  checkins: ["checkins"] as const,
  /** Streak + milestones. Separate from `checkins`: it reads the whole history. */
  streak: ["streak"] as const,
  /** Account-scoped explainer seen-state. Deliberately separate from `me`:
   *  hints change far more often than the profile, and sharing a key would make
   *  every dismissed hint re-fetch the profile and vice versa. */
  explainers: ["explainers"] as const,
  /** `explainers` for one account: a cache left by the last one never reads as hers. */
  explainersFor: (userId: string) => ["explainers", userId] as const,
  chat: ["chat"] as const,
  circles: ["circles"] as const,
  /**
   * The rooms (Oct 2026). Every key starts with `circles`, so invalidating
   * `qk.circles` refreshes all of them at once, and carries the language: the
   * server localises the question, the house line and the context line.
   */
  hall: (locale: Locale) => ["circles", "hall", locale] as const,
  room: (id: string, locale: Locale) => ["circles", "room", id, locale] as const,
  /** The tables members started in a circle. Under "circles", so a new post refreshes it. */
  tables: (id: string, locale: Locale) => ["circles", "tables", id, locale] as const,
  roomSince: (id: string, locale: Locale) => ["circles", "since", id, locale] as const,
  doorway: (id: string, locale: Locale) => ["circles", "doorway", id, locale] as const,
  browse: (area: string, open: boolean, locale: Locale) => ["circles", "browse", area, open, locale] as const,
  /** Path echoes for one area. Under "circles", so a new post or a join refreshes it. */
  circleEchoes: (area: string, locale: Locale) => ["circles", "echoes", area, locale] as const,
  /** The answers to one question. Not `reflections(...)`: those are the old feed's keys. */
  answers: (circleId: string, questionId: string, locale: Locale) =>
    ["circles", "answers", circleId, questionId, locale] as const,
  question: (circleId: string, questionId: string, locale: Locale) =>
    ["circles", "question", circleId, questionId, locale] as const,
  reflections: (circleId?: string) => ["reflections", circleId ?? "all"] as const,
  /** One post and its thread. Separate keys: a new reply must not refetch the post. */
  reflection: (id: string) => ["reflection", id] as const,
  comments: (reflectionId: string) => ["comments", reflectionId] as const,
  connections: ["connections"] as const,
  member: (id: string) => ["member", id] as const,
  doorwayConsent: (reflectionId: string) => ["doorwayConsent", reflectionId] as const,
  events: ["events"] as const,
  event: (id: string) => ["event", id] as const,
  /**
   * The library, keyed by language for the same reason `paths` is: the server
   * resolves each piece's language per request, so a switch has to re-fetch
   * rather than keep serving the cards the member was just reading.
   */
  resources: (locale: Locale) => ["resources", locale] as const,
  resource: (idOrKey: string, locale: Locale) => ["resource", idOrKey, locale] as const,
  /**
   * Explore, keyed by language like the library it draws on: every title, line
   * and reason is resolved per request.
   */
  exploreHome: (locale: Locale) => ["explore", "home", locale] as const,
  exploreAll: (locale: Locale, q: Record<string, unknown>) =>
    ["explore", "all", locale, q] as const,
  programme: (locale: Locale) => ["explore", "programme", locale] as const,
  exploreArea: (locale: Locale, key: string) => ["explore", "area", locale, key] as const,
  exploreListen: (locale: Locale) => ["explore", "listen", locale] as const,
  exploreVoices: (locale: Locale) => ["explore", "voices", locale] as const,
  exploreSaved: (locale: Locale) => ["explore", "saved", locale] as const,
  exploreCreator: (locale: Locale, id: string) => ["explore", "creator", locale, id] as const,
  exploreEdition: (locale: Locale, slug: string) => ["explore", "edition", locale, slug] as const,
  exploreRoundtable: (locale: Locale, slug: string) =>
    ["explore", "roundtable", locale, slug] as const,
  explorePiece: (locale: Locale, id: string) => ["explore", "pieceDetail", locale, id] as const,
  exploreWorkshop: (locale: Locale, id: string) => ["explore", "workshop", locale, id] as const,
  conversations: ["conversations"] as const,
  messages: (id: string) => ["messages", id] as const,
  blocked: ["blocked"] as const,
  supportTickets: ["supportTickets"] as const,
  supportTicket: (id: string) => ["supportTicket", id] as const,
  supportUnread: ["supportUnread"] as const,
  /** What Elara remembers. Its own key: the rollup that changes it runs on the
   *  server's schedule, not in response to anything the app does. */
  memory: ["memory"] as const,
  wellbeing: ["wellbeing"] as const,
  /** Clarity Pictures. Not keyed by language: each row carries its own. */
  assessments: ["assessments"] as const,
};
