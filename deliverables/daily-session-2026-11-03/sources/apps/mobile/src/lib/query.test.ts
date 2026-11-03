import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { clearAccountQueries, profileFor, qk, readFor, reconnected, reconnectRefetch } from "./query";

describe("a session that ends without Log out", () => {
  it("drops every account's cache but the phone's app-config", async () => {
    const client = new QueryClient();
    for (const key of [qk.me, qk.myPaths, qk.checkins, qk.explainersFor("a"), qk.paths("es"), qk.appConfig]) {
      await client.fetchQuery({ queryKey: key, queryFn: async () => ({ id: "a" }) });
    }
    clearAccountQueries(client);
    expect(client.getQueryData(qk.me)).toBeUndefined();
    expect(client.getQueryData(qk.myPaths)).toBeUndefined();
    expect(client.getQueryData(qk.checkins)).toBeUndefined();
    expect(client.getQueryData(qk.explainersFor("a"))).toBeUndefined();
    expect(client.getQueryData(qk.paths("es"))).toBeUndefined();
    expect(client.getQueryData(qk.appConfig)).toEqual({ id: "a" });
  });
});

describe("the cached profile", () => {
  it("is used only for the account the session is for", () => {
    const a = { id: "a", name: "Ana" };
    expect(profileFor(a, "a")).toBe(a);
    // Account A's profile, still cached when B signs in: not B's.
    expect(profileFor(a, "b")).toBeUndefined();
    expect(profileFor(a, null)).toBeUndefined();
    expect(profileFor(undefined, "a")).toBeUndefined();
  });
});

describe("back online after a launch without signal (beta hardening, 3 Nov 2026)", () => {
  // Before: the CMS paths, Hoy's guide and the app's switches that failed on
  // an offline launch stayed failed once the phone was back online; only the
  // session and /api/me were asked for again.
  it("is the moment the phone goes from offline to online, and no other", () => {
    expect(reconnected(true, false)).toBe(true);
    expect(reconnected(false, false)).toBe(false);
    expect(reconnected(false, true)).toBe(false);
    expect(reconnected(true, true)).toBe(false);
  });

  it("asks again for what is on screen and failed, and nothing else", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const calls: Record<string, number> = { paths: 0, resources: 0, offScreen: 0 };
    let online = false;
    const read = (key: string) => async () => {
      calls[key]++;
      if (!online) throw new TypeError("Network request failed");
      return key;
    };
    const ok = async () => {
      calls.streak = (calls.streak ?? 0) + 1;
      return 3;
    };
    // On screen: two reads that failed offline, one that had landed.
    const watch = [
      new QueryObserver(client, { queryKey: ["paths", "es"], queryFn: read("paths") }),
      new QueryObserver(client, { queryKey: ["resources", "es"], queryFn: read("resources") }),
      new QueryObserver(client, { queryKey: ["streak"], queryFn: ok }),
    ];
    const subs = watch.map((o) => o.subscribe(() => {}));
    // Off screen: failed too, but no one is looking at it.
    await client.prefetchQuery({ queryKey: ["offScreen"], queryFn: read("offScreen") });
    await new Promise((r) => setTimeout(r, 0));
    expect(client.getQueryState(["paths", "es"])?.status).toBe("error");

    online = true;
    await client.refetchQueries(reconnectRefetch);
    expect(client.getQueryData(["paths", "es"])).toBe("paths");
    expect(client.getQueryData(["resources", "es"])).toBe("resources");
    expect(calls.streak).toBe(1);
    expect(calls.offScreen).toBe(1);
    subs.forEach((u) => u());
  });
});

describe("a progress read, applied only for the account signed in now (beta hardening, 3 Nov 2026)", () => {
  const read = { owner: "a", list: [] };
  it("is hers while her session is the one signed in", () => {
    expect(readFor(read, "a")).toBe(read);
  });
  it("is no one's after a Log out, or once another account signed in", () => {
    expect(readFor(read, null)).toBeNull();
    expect(readFor(read, undefined)).toBeNull();
    expect(readFor(read, "b")).toBeNull();
    expect(readFor({ owner: null, list: [] }, "a")).toBeNull();
    expect(readFor(undefined, "a")).toBeNull();
  });
});
