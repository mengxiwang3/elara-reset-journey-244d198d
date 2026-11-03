import type { DayFeedbackInput } from "@elara/shared";
import { describe, expect, it } from "vitest";
import {
  accountSettings,
  classifySessionEnd,
  endSession,
  expireHeld,
  HELD_FOR_SIGN_IN_MS,
  heldCount,
  heldUsable,
  startSession,
  unsentCount,
  type SessionSlice,
} from "./accountState";
import { belongsTo, flushQueueOnce, sameEntry } from "./stepQueue";
import type { AppState, PendingStep, User } from "./useAppStore";

/**
 * R2-L3: a session that ends without her asking must not silently destroy
 * what she wrote offline, and nobody else may ever see, send or adopt it.
 * Synthetic accounts and words only.
 */

const NOW = 1_760_000_000_000;
const A: User = { id: "acct-a", name: "Synthetic A", email: "a@example.test", avatar: null, isAnonymous: false };
const B: User = { id: "acct-b", name: "Synthetic B", email: "b@example.test", avatar: null, isAnonymous: false };

const step = (stepId: string, queuedAt = NOW - 60_000, owner?: string, day = 2): PendingStep => ({
  area: "money",
  day,
  body: { stepId, value: `Synthetic words for ${stepId}.` },
  queuedAt,
  ...(owner ? { owner } : {}),
});
const feedback = (key: string): DayFeedbackInput => ({
  key,
  area: "money",
  day: 2,
  answer: "yes",
  locale: "es",
  platform: "ios",
});

/** A signed-in phone with unsent work for A. Entries from an older build carry no owner. */
function signedInAsA(): SessionSlice {
  return {
    user: A,
    lastUserId: A.id,
    settings: { ...accountSettings(), hapticsEnabled: false },
    pendingSteps: [step("why", NOW - 90_000), step("followup", NOW - 60_000, A.id)],
    pendingCheckIns: [{ date: "2026-10-15", mood: "calm" }],
    pendingFeedback: [feedback("synthetic-money-2")],
    drafts: { "money:3:note": { text: "Synthetic half-written answer." } },
    heldForSignIn: null,
    unseenSafetyCards: [],
  };
}
const apply = (s: SessionSlice, patch: Partial<AppState>): SessionSlice => ({ ...s, ...patch }) as SessionSlice;

describe("why there is no session", () => {
  it("offline or a 5xx is a read that did not get through; a 401 or a clean answer is an ended session", () => {
    expect(classifySessionEnd({ error: new TypeError("Network request failed"), deliberate: null })).toBe("unreachable");
    expect(classifySessionEnd({ error: { status: 503 }, deliberate: null })).toBe("unreachable");
    expect(classifySessionEnd({ error: { status: 401 }, deliberate: null })).toBe("expired");
    expect(classifySessionEnd({ error: null, deliberate: null })).toBe("expired");
    // Log out and deletion say so before they end it, whatever the read said.
    expect(classifySessionEnd({ error: { status: 401 }, deliberate: "signedOut" })).toBe("signedOut");
    expect(classifySessionEnd({ error: null, deliberate: "deleted" })).toBe("deleted");
  });
});

describe("401, then the same account signs in again", () => {
  it("holds her unsent work for her account, then gives it back and nothing else changes hands", () => {
    const before = signedInAsA();
    const ended = apply(before, endSession(before, classifySessionEnd({ error: { status: 401 }, deliberate: null }), NOW));
    // Her visible data is cleared as on a sign-out: the next person sees nothing.
    expect(ended.user).toBeNull();
    expect(ended.lastUserId).toBeNull();
    expect(ended.pendingSteps).toEqual([]);
    expect(ended.pendingCheckIns).toEqual([]);
    expect(ended.pendingFeedback).toEqual([]);
    expect(ended.drafts).toEqual({});
    // ...and held for her, every answer stamped as hers.
    expect(ended.heldForSignIn?.owner).toBe(A.id);
    expect(ended.heldForSignIn?.pendingSteps.map((q) => [q.body.stepId, q.owner])).toEqual([
      ["why", A.id],
      ["followup", A.id],
    ]);
    expect(heldCount(ended.heldForSignIn)).toBe(4);

    // A second read of "no session" (focus refetch) changes nothing.
    expect(endSession(ended, "expired", NOW + 1)).toEqual({});

    const { patch, restored } = startSession(ended, A, NOW + 3_600_000);
    const back = apply(ended, patch);
    expect(restored).toBe(4);
    expect(back.heldForSignIn).toBeNull();
    expect(back.pendingSteps.map((q) => q.body.stepId)).toEqual(["why", "followup"]);
    expect(back.pendingCheckIns).toEqual(before.pendingCheckIns);
    expect(back.pendingFeedback).toEqual(before.pendingFeedback);
    expect(back.drafts).toEqual(before.drafts);
    // The exact entries, so the queue's exact-entry removal still matches them.
    expect(sameEntry(back.pendingSteps[0]!, before.pendingSteps[0]!)).toBe(true);
  });

  it("an answer written after she is back replaces the held one for the same step", () => {
    const ended = apply(signedInAsA(), endSession(signedInAsA(), "expired", NOW));
    const withNew = { ...ended, pendingSteps: [step("why", NOW + 10, A.id)] };
    const back = apply(withNew, startSession(withNew, A, NOW + 20).patch);
    expect(back.pendingSteps.map((q) => [q.body.stepId, q.queuedAt])).toEqual([
      ["followup", NOW - 60_000],
      ["why", NOW + 10],
    ]);
  });

  it("two expiries in a row keep both sets, and the window runs from the first", () => {
    const first = apply(signedInAsA(), endSession(signedInAsA(), "expired", NOW));
    const again = apply(first, startSession(first, A, NOW + 1000).patch);
    const more = { ...again, pendingSteps: [...again.pendingSteps, step("later", NOW + 2000, A.id, 3)] };
    // A second hold before the first was given back (e.g. the restore's
    // flush failed and the session ended again).
    const second = apply(more, endSession({ ...more, heldForSignIn: first.heldForSignIn }, "expired", NOW + 5000));
    expect(second.heldForSignIn?.heldAt).toBe(NOW);
    expect(second.heldForSignIn?.pendingSteps.map((q) => q.body.stepId)).toEqual(["why", "followup", "later"]);
  });
});

describe("a different account", () => {
  it("never sees, sends or adopts what was held for the first (and its sign-in purges it)", () => {
    const ended = apply(signedInAsA(), endSession(signedInAsA(), "expired", NOW));
    const { patch, restored } = startSession(ended, B, NOW + 60_000);
    const asB = apply(ended, patch);
    expect(restored).toBe(0);
    expect(asB.user?.id).toBe(B.id);
    expect(asB.pendingSteps).toEqual([]);
    expect(asB.pendingCheckIns).toEqual([]);
    expect(asB.drafts).toEqual({});
    expect(asB.heldForSignIn).toBeNull();
    // A coming back later finds nothing to restore.
    expect(startSession(asB, A, NOW + 120_000).restored).toBe(0);
  });

  it("switching accounts directly (no expiry in between) resets the first's queue on the way in", () => {
    const s = signedInAsA();
    const asB = apply(s, startSession(s, B, NOW).patch);
    expect(asB.pendingSteps).toEqual([]);
    expect(asB.lastUserId).toBe(B.id);
  });

  it("the flush never sends another account's entry, even one already in the queue", async () => {
    // However an entry of A's reached a queue B is flushing (a pass that
    // began before the session changed), B's flush skips it and leaves it.
    let queue: PendingStep[] = [step("mine", NOW, B.id), step("hers", NOW, A.id), step("legacy", NOW)];
    const sent: string[] = [];
    await flushQueueOnce<PendingStep>({
      read: () => queue,
      send: async (e) => {
        sent.push(e.body.stepId);
      },
      remove: (e) => {
        queue = queue.filter((q) => !sameEntry(q, e));
      },
      sendable: (e) => belongsTo(e.owner, B.id, B.id),
    });
    expect(sent).toEqual(["mine", "legacy"]);
    expect(queue.map((q) => q.body.stepId)).toEqual(["hers"]);
    // Nobody signed in sends nothing at all.
    expect(belongsTo(undefined, A.id, null)).toBe(false);
    expect(belongsTo(A.id, A.id, null)).toBe(false);
  });
});

describe("deliberate endings keep the existing privacy rule", () => {
  it("Log out clears unsent work, held work included", () => {
    const ended = apply(signedInAsA(), endSession(signedInAsA(), "expired", NOW));
    const back = apply(ended, startSession(ended, A, NOW + 1).patch);
    const heldAgain = { ...back, heldForSignIn: ended.heldForSignIn };
    const out = apply(heldAgain, endSession(heldAgain, "signedOut", NOW + 2));
    expect(out.pendingSteps).toEqual([]);
    expect(out.drafts).toEqual({});
    expect(out.heldForSignIn).toBeNull();
    expect(out.lastUserId).toBeNull();
  });

  it("deletion clears everything, held work included, and nothing comes back on a later sign-in", () => {
    const ended = apply(signedInAsA(), endSession(signedInAsA(), "expired", NOW));
    const deleted = apply(ended, endSession(ended, "deleted", NOW + 1));
    expect(deleted.heldForSignIn).toBeNull();
    expect(startSession(deleted, A, NOW + 2).restored).toBe(0);
  });
});

describe("an offline restart", () => {
  it("is not an ended session: nothing is reset, nothing is held", () => {
    const s = signedInAsA();
    const reason = classifySessionEnd({ error: new TypeError("Network request failed"), deliberate: null });
    expect(endSession(s, reason, NOW)).toEqual({});
  });

  it("held work survives a relaunch inside its window and is purged after it", () => {
    const ended = apply(signedInAsA(), endSession(signedInAsA(), "expired", NOW));
    // Persisted as JSON and read back, as AsyncStorage does.
    const relaunched = JSON.parse(JSON.stringify(ended.heldForSignIn));
    expect(expireHeld(relaunched, NOW + HELD_FOR_SIGN_IN_MS)).toEqual(relaunched);
    expect(expireHeld(relaunched, NOW + HELD_FOR_SIGN_IN_MS + 1)).toBeNull();
    // And after the window, even her own sign-in does not bring it back.
    const late = { ...ended, heldForSignIn: relaunched };
    const back = apply(late, startSession(late, A, NOW + HELD_FOR_SIGN_IN_MS + 1).patch);
    expect(back.pendingSteps).toEqual([]);
    expect(back.heldForSignIn).toBeNull();
  });

  it("a held time that is not an instant is not usable (nothing is kept on a broken clock)", () => {
    const ended = apply(signedInAsA(), endSession(signedInAsA(), "expired", NOW));
    const broken = { ...ended.heldForSignIn!, heldAt: null as unknown as number };
    expect(heldUsable(broken, A.id, NOW)).toBe(false);
    expect(expireHeld(broken, NOW)).toBeNull();
    expect(heldUsable(ended.heldForSignIn, A.id, NaN)).toBe(false);
  });

  it("someone mid-onboarding who never signed in loses nothing", () => {
    const fresh: SessionSlice = { ...signedInAsA(), user: null, lastUserId: null };
    expect(endSession(fresh, "expired", NOW)).toEqual({});
  });

  it("an ended session with nothing unsent holds nothing", () => {
    const empty: SessionSlice = { ...signedInAsA(), pendingSteps: [], pendingCheckIns: [], pendingFeedback: [], drafts: {} };
    expect(apply(empty, endSession(empty, "expired", NOW)).heldForSignIn).toBeNull();
  });
});

describe("unsentCount: what Log out would delete (beta hardening, 3 Nov 2026)", () => {
  // Before: an answer given offline, then Log out under «Tu avance y tus
  // reflexiones se quedan aquí, guardados»: after signing back in it was gone.
  it("is what she sent from this phone that has not reached her account", () => {
    // Two queued answers (one from an older build, with no owner), a check-in, a day's feedback.
    expect(unsentCount(signedInAsA(), A.id)).toBe(4);
  });

  it("is exactly what a deliberate Log out clears", () => {
    const out = apply(signedInAsA(), endSession(signedInAsA(), "signedOut", NOW));
    expect(out.pendingSteps).toEqual([]);
    expect(out.pendingCheckIns).toEqual([]);
    expect(out.pendingFeedback).toEqual([]);
    expect(out.heldForSignIn).toBeNull();
    expect(unsentCount(out, A.id)).toBe(0);
  });

  it("does not count an answer queued for another account", () => {
    const mixed: SessionSlice = { ...signedInAsA(), pendingSteps: [step("hers", NOW, B.id)], pendingCheckIns: [], pendingFeedback: [] };
    expect(unsentCount(mixed, A.id)).toBe(0);
    expect(unsentCount(mixed, B.id)).toBe(1);
  });

  it("is nothing while signed out", () => {
    expect(unsentCount(signedInAsA(), null)).toBe(0);
  });

  it("is nothing once the queue has drained", () => {
    const sent: SessionSlice = { ...signedInAsA(), pendingSteps: [], pendingCheckIns: [], pendingFeedback: [] };
    expect(unsentCount(sent, A.id)).toBe(0);
  });
});
