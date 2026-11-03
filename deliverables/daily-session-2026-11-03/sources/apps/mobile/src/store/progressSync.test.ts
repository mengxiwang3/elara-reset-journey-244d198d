import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Whose progress the store holds (beta hardening, 3 Nov 2026), through the
 * real store: a new phone starts on a Day 1 that is no one's, a sign-in or an
 * ended session makes the progress no one's again, and only a read made for
 * the signed-in account (or her brand-new account's own start) makes it hers.
 * Hoy offers a day only then (`progressReady`); before, a week-2 member who
 * signed in on a new phone was offered Day 1 and answering it rewrote her
 * Day 1 answers.
 *
 * The network, the string catalogue and storage are stubbed; nothing else is.
 */

vi.mock("@/lib/api", () => ({ api: {}, ApiError: class extends Error {} }));
vi.mock("@/i18n", () => ({ LAUNCH_LOCALE: "es", setActiveLocale: () => {} }));
vi.mock("@/lib/query", () => ({ qk: { myPaths: ["myPaths"] }, queryClient: { invalidateQueries: vi.fn() } }));
vi.mock("./persistStorage", () => {
  const m = new Map<string, string>();
  return {
    makePersistStorage: () => ({
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
      removeItem: (k: string) => void m.delete(k),
    }),
  };
});

const { useAppStore } = await import("./useAppStore");
const { progressReady } = await import("./accountState");

const store = () => useAppStore.getState();
const ready = () => progressReady(store().progressSyncedFor, store().user?.id);
const member = (id: string) => ({ id, name: "Lucía Prueba", email: `${id}@example.com`, avatar: null, isAnonymous: false });

/** Week 1 walked: today is week 2, day 1 (path day 8). */
const weekOneDone = {
  area: "money" as const,
  currentDay: 8,
  completedDays: [1, 2, 3, 4, 5, 6, 7],
  responses: {},
  stepAnswers: { 1: { ask: { value: "Lo que gano", answeredAt: 1_793_127_540_000 } } },
  dayCompletedAt: { 7: 1_793_646_000_000 },
  startedAt: 1_793_124_000_000,
};

beforeEach(() => {
  // A fresh install: the store's own Day 1 for Money, and no account.
  useAppStore.setState({
    user: null,
    lastUserId: null,
    progressSyncedFor: null,
    pendingSteps: [],
    progress: { money: { currentDay: 1, completedDays: [], responses: {}, stepAnswers: {}, startedAt: 1 } } as never,
  });
});

describe("progress the store can vouch for", () => {
  it("a new phone's Day 1 is no one's: a member who signs in waits for her own", () => {
    store().setSessionUser(member("u1"));
    // The store still says Day 1, and it is not hers.
    expect(store().progress.money?.currentDay).toBe(1);
    expect(ready()).toBe(false);

    store().hydrateProgress([weekOneDone], "u1");
    expect(ready()).toBe(true);
    expect(store().progress.money?.currentDay).toBe(8);
  });

  it("a read made for another account is not applied", () => {
    store().setSessionUser(member("u1"));
    store().hydrateProgress([weekOneDone], "u2");
    expect(ready()).toBe(false);
    expect(store().progress.money?.currentDay).toBe(1);
  });

  it("a read that lands before the profile is still hers once the profile says so", () => {
    // SessionSync can read her progress before `/api/me` names her.
    store().hydrateProgress([weekOneDone], "u1");
    store().setSessionUser(member("u1"));
    expect(ready()).toBe(true);
    expect(store().progress.money?.currentDay).toBe(8);
  });

  it("an expired session makes it no one's again", () => {
    store().setSessionUser(member("u1"));
    store().hydrateProgress([weekOneDone], "u1");
    store().endSession("expired");
    store().setSessionUser(member("u1"));
    expect(ready()).toBe(false);
  });

  it("another account signing in on this phone waits for its own", () => {
    store().setSessionUser(member("u1"));
    store().hydrateProgress([weekOneDone], "u1");
    store().setSessionUser(member("u2"));
    expect(ready()).toBe(false);
    expect(store().progress.money).toBeUndefined();
  });

  it("an offline relaunch keeps her progress hers (the flag is persisted with it)", () => {
    store().setSessionUser(member("u1"));
    store().hydrateProgress([weekOneDone], "u1");
    // Same account, same store: nothing resets it.
    store().setSessionUser(member("u1"));
    expect(ready()).toBe(true);
    expect(store().progressSyncedFor).toBe("u1");
  });

  it("a brand-new account's own start is hers without a read", () => {
    store().setSessionUser(member("u3"));
    expect(ready()).toBe(false);
    store().markProgressSynced("u3");
    expect(ready()).toBe(true);
  });
});
