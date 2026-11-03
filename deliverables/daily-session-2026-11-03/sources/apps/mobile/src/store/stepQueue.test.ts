import { describe, expect, it } from "vitest";
import {
  belongsTo,
  decideFailure,
  entryKey,
  flushQueueOnce,
  safetyCardOf,
  sameEntry,
  singleFlight,
  STEP_NOT_FOUND_GRACE_MS,
  type QueueEntry,
} from "./stepQueue";

/** A queue held in a plain array, with the store's removal rule. */
function harness(entries: QueueEntry[], fail: (e: QueueEntry) => unknown = () => null) {
  let queue = [...entries];
  const sent: string[] = [];
  return {
    sent,
    queue: () => queue,
    deps: {
      read: () => queue,
      send: async (e: QueueEntry) => {
        sent.push(e.body.stepId);
        const err = fail(e);
        if (err) throw err;
        return {};
      },
      remove: (e: QueueEntry) => {
        queue = queue.filter((q) => !sameEntry(q, e));
      },
    },
  };
}

const at = 1_760_000_000_000;
const entry = (stepId: string, queuedAt = at, day = 2, area = "money"): QueueEntry => ({
  area,
  day,
  body: { stepId },
  queuedAt,
});

describe("flushQueueOnce: an answer refused for good (beta-fixes 3 Nov)", () => {
  // Reproduced in the browser with a real 403 premium_required: the entry was
  // dropped and her words went with it. The flush now hands it over first.
  it("hands an entry refused for good to onDropped before removing it, and nothing else", async () => {
    const dropped: string[] = [];
    const now = Date.now();
    const h = harness(
      [entry("refused", now), entry("locked", now, 3), entry("missing", now), entry("fine", now)],
      (e) =>
        e.body.stepId === "refused"
          ? { status: 403, code: "premium_required" }
          : e.body.stepId === "locked"
            ? { status: 403, code: "day_locked" }
            : e.body.stepId === "missing"
              ? { status: 404, code: "step_not_found" }
              : null,
    );
    await flushQueueOnce({ ...h.deps, onDropped: (e) => dropped.push(e.body.stepId) });
    expect(dropped).toEqual(["refused"]);
    // Kept (day_locked) and retried (step_not_found) entries stay for a later pass.
    expect(h.queue().map((e) => e.body.stepId)).toEqual(["locked", "missing"]);
  });

  it("a step the content no longer has, past its grace, is handed over too", async () => {
    const dropped: string[] = [];
    const h = harness([entry("gone", Date.now() - STEP_NOT_FOUND_GRACE_MS - 60_000)], () => ({ status: 404, code: "step_not_found" }));
    await flushQueueOnce({ ...h.deps, onDropped: (e) => dropped.push(e.body.stepId) });
    expect(dropped).toEqual(["gone"]);
    expect(h.queue()).toEqual([]);
  });
});

describe("flushQueueOnce", () => {
  it("sends both answers queued in the same tick (a lead card and the step under it)", async () => {
    // Money Clarity Day 2: the follow-up card answered with nothing and the
    // question under it, written offline, are queued by two calls in one tick.
    const h = harness([entry("followup"), entry("happened")]);
    await flushQueueOnce(h.deps);
    expect(h.sent).toEqual(["followup", "happened"]);
    expect(h.queue()).toEqual([]);
  });

  it("removes only the entry that landed", async () => {
    const h = harness([entry("pausewent"), entry("boundwent")], (e) =>
      e.body.stepId === "boundwent" ? { status: 503 } : null,
    );
    await flushQueueOnce(h.deps);
    expect(h.queue().map((e) => e.body.stepId)).toEqual(["boundwent"]);
  });

  it("stops on the network and keeps what is left, in order", async () => {
    const h = harness([entry("a", at), entry("b", at + 1), entry("c", at + 2)], (e) =>
      e.body.stepId === "b" ? { status: 0, code: "network" } : null,
    );
    await flushQueueOnce(h.deps);
    expect(h.sent).toEqual(["a", "b"]);
    expect(h.queue().map((e) => e.body.stepId)).toEqual(["b", "c"]);
  });

  it("drops a refusal that can never succeed and goes on", async () => {
    const h = harness([entry("gone", at), entry("next", at + 1)], (e) =>
      e.body.stepId === "gone" ? { status: 404, code: "day_not_found" } : null,
    );
    await flushQueueOnce(h.deps);
    expect(h.sent).toEqual(["gone", "next"]);
    expect(h.queue()).toEqual([]);
  });

  it("keeps an answer to a step the server does not know yet, and goes on", async () => {
    // The phone is on newer content than the server: her answer to `take` must
    // not be thrown away, and nothing behind it (same day included) waits.
    const fresh = Date.now();
    const h = harness([entry("take", fresh, 2), entry("ask", fresh + 1, 2), entry("ask", fresh + 2, 3)], (e) =>
      e.body.stepId === "take" ? { status: 404, code: "step_not_found" } : null,
    );
    await flushQueueOnce(h.deps);
    expect(h.sent).toEqual(["take", "ask", "ask"]);
    expect(h.queue().map((e) => e.body.stepId)).toEqual(["take"]);
  });

  it("does not send an entry a newer edit replaced during the pass", async () => {
    // E1 (her first answer to `ask`) is in the snapshot; while `take` is being
    // sent she edits `ask`, which replaces E1 with E2. E1 must not land after E2.
    const e1 = entry("ask", at + 1);
    const e2 = entry("ask", at + 9);
    const h = harness([entry("take", at), e1]);
    const deps = {
      ...h.deps,
      send: async (e: QueueEntry) => {
        const r = await h.deps.send(e);
        if (e.body.stepId === "take") {
          const q = h.queue();
          q.splice(q.indexOf(e1), 1, e2);
        }
        return r;
      },
      inFlight: (e: QueueEntry) => e === e2,
    };
    await flushQueueOnce(deps);
    expect(h.sent).toEqual(["take"]);
    expect(h.queue()).toEqual([e2]);
  });
});

describe("decideFailure", () => {
  it("keeps a day that has not opened, drops a final refusal, stops on everything else", () => {
    expect(decideFailure({ status: 403, code: "day_locked" })).toBe("keep");
    expect(decideFailure({ status: 403, code: "premium_required" })).toBe("drop");
    expect(decideFailure({ status: 400 })).toBe("drop");
    expect(decideFailure({ status: 422 })).toBe("drop");
    expect(decideFailure({ status: 401 })).toBe("stop");
    expect(decideFailure({ status: 429 })).toBe("stop");
    expect(decideFailure({ status: 500 })).toBe("stop");
    expect(decideFailure(new TypeError("Failed to fetch"))).toBe("stop");
    expect(decideFailure(undefined)).toBe("stop");
  });

  it("retries a step the server does not know, until it has waited too long", () => {
    const now = at + 1000;
    const notFound = { status: 404, code: "step_not_found" };
    expect(decideFailure(notFound)).toBe("retry");
    expect(decideFailure(notFound, { queuedAt: at }, now)).toBe("retry");
    expect(decideFailure(notFound, { queuedAt: now - STEP_NOT_FOUND_GRACE_MS - 1 }, now)).toBe("drop");
    expect(decideFailure({ status: 404, code: "day_not_found" })).toBe("drop");
  });
});

describe("one flush at a time", () => {
  it("sends each queued answer once when two callers flush together", async () => {
    // SessionSync flushes on launch while useSavingPlace flushes a stale entry.
    const h = harness([entry("a", at), entry("b", at + 1)]);
    const slow = { ...h.deps, send: async (e: QueueEntry) => {
      await new Promise((r) => setTimeout(r, 5));
      return h.deps.send(e);
    } };
    const flush = singleFlight(() => flushQueueOnce(slow));
    await Promise.all([flush(), flush(), flush()]);
    expect(h.sent).toEqual(["a", "b"]);
    expect(h.queue()).toEqual([]);
  });

  it("runs again once the previous pass has finished", async () => {
    const h = harness([entry("a")]);
    const flush = singleFlight(() => flushQueueOnce(h.deps));
    await flush();
    h.queue().push(entry("b", at + 5));
    await flush();
    expect(h.sent).toEqual(["a", "b"]);
  });

  it("leaves an answer whose live request is still in flight to that request", async () => {
    const live = entry("happened", at + 1);
    const h = harness([entry("followup", at), live]);
    const pending = new Set([entryKey(live)]);
    await flushQueueOnce({ ...h.deps, inFlight: (e) => pending.has(entryKey(e)) });
    expect(h.sent).toEqual(["followup"]);
    expect(h.queue()).toEqual([live]);
  });
});

describe("a session that changes during a pass", () => {
  it("stops sending the first account's answers the moment it is no longer signed in", async () => {
    // Two callers share one pass (single flight); partway through, A's session
    // expires and B signs in. The pass read A's queue at its start, so the
    // check has to be made per entry, at the moment of sending.
    let current: string | null = "acct-a";
    const h = harness([entry("one", at, 2, "money"), entry("two", at + 1, 2, "money"), entry("three", at + 2, 2, "love")]);
    for (const e of h.queue()) e.owner = "acct-a";
    const deps = {
      ...h.deps,
      send: async (e: QueueEntry) => {
        const r = await h.deps.send(e);
        if (e.body.stepId === "one") current = "acct-b";
        return r;
      },
      sendable: (e: QueueEntry) => belongsTo(e.owner, "acct-a", current),
    };
    const flush = singleFlight(() => flushQueueOnce(deps));
    await Promise.all([flush(), flush()]);
    expect(h.sent).toEqual(["one"]);
    // Left for A, in order, for when she signs back in (and the store holds them).
    expect(h.queue().map((e) => e.body.stepId)).toEqual(["two", "three"]);
  });

  it("keeps each Area's progress independent while skipping another account's entries", async () => {
    const h = harness([
      entry("a-money", at, 3, "money"),
      entry("b-money", at + 1, 2, "money"),
      entry("b-love", at + 2, 4, "love"),
    ]);
    h.queue()[0]!.owner = "acct-a";
    h.queue()[1]!.owner = "acct-b";
    // B's Love Day 4 has not opened: kept, and only Love waits behind it.
    const locked = { status: 403, code: "day_locked" };
    const deps = { ...h.deps, send: async (e: QueueEntry) => {
      if (e.body.stepId === "b-love") throw locked;
      return h.deps.send(e);
    }, sendable: (e: QueueEntry) => belongsTo(e.owner, "acct-b", "acct-b") };
    await flushQueueOnce(deps);
    expect(h.sent).toEqual(["b-money"]);
    expect(h.queue().map((e) => e.body.stepId)).toEqual(["a-money", "b-love"]);
  });
});

describe("a day that has not opened yet", () => {
  it("no longer holds back the earlier day's answer queued behind it", async () => {
    // Offline for two days: Day 1 answered, Day 2 answered, then a Day 1 answer
    // changed (an edit re-queues at the end). The server keeps Day 2 locked
    // until Day 1 has every answer; stopping at Day 2 held Day 1 back for good.
    const day1Done = new Set<string>(["a", "b"]);
    const h = harness(
      [entry("a", at, 1), entry("b", at + 1, 1), entry("x", at + 2, 2), entry("y", at + 3, 2), entry("c", at + 4, 1)],
      (e) => (e.day === 2 && !day1Done.has("c") ? { status: 403, code: "day_locked" } : null),
    );
    const deps = {
      ...h.deps,
      send: async (e: QueueEntry) => {
        await h.deps.send(e);
        if (e.day === 1) day1Done.add(e.body.stepId);
      },
    };
    await flushQueueOnce(deps);
    // Day 2's first entry asked once, its second not at all; Day 1's last sent.
    expect(h.sent).toEqual(["a", "b", "x", "c"]);
    expect(h.queue().map((e) => e.body.stepId)).toEqual(["x", "y"]);
    // The next flush (the next foreground) lands Day 2.
    await flushQueueOnce(deps);
    expect(h.queue()).toEqual([]);
  });

  it("does not hold back another Area", async () => {
    const h = harness([entry("x", at, 3, "money"), entry("s", at + 1, 1, "self")], (e) =>
      e.area === "money" ? { status: 403, code: "day_locked" } : null,
    );
    await flushQueueOnce(h.deps);
    expect(h.queue().map((e) => e.body.stepId)).toEqual(["x"]);
  });
});

describe("a support card returned for a queued answer", () => {
  it("is handed to the store with the entry it belongs to", async () => {
    const card = { tier: 3, body: "Estamos contigo", helplineUrl: "https://findahelpline.com", helplineLabel: "Línea" };
    const h = harness([entry("why", at, 2)]);
    const landed: [string, unknown][] = [];
    await flushQueueOnce({
      ...h.deps,
      send: async (e: QueueEntry) => {
        await h.deps.send(e);
        return { progress: {}, dayCompleted: false, reply: { stepId: e.body.stepId, reply: null }, safety: card };
      },
      onLanded: (e, result) => landed.push([e.body.stepId, safetyCardOf(result)]),
    });
    expect(landed).toEqual([["why", card]]);
  });

  it("is absent from an ordinary answer", () => {
    expect(safetyCardOf({ progress: {}, reply: { reply: "ok" } })).toBeNull();
    expect(safetyCardOf(undefined)).toBeNull();
    expect(safetyCardOf({ safety: null })).toBeNull();
  });
});
