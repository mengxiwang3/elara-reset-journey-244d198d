import { describe, expect, it } from "vitest";
import { nextDayPin, sameSteps, type DayPin, type LiveDay } from "./dayPin";

const bundled = { name: "bundled" };
const server = { name: "server" };
const serverAgain = { name: "server, refetched" };

const live = (path: object, fromServer: boolean, locale = "es", same = false): LiveDay<object> => ({
  locale,
  path,
  hasDay: true,
  fromServer,
  sameSteps: same,
});
const pin = (path: object, fromServer: boolean, locale = "es"): DayPin<object> => ({ locale, path, fromServer });

describe("the day screen's pinned copy", () => {
  it("pins the first copy it gets", () => {
    expect(nextDayPin(null, live(bundled, false), false)).toEqual(pin(bundled, false));
    expect(nextDayPin(null, live(server, true), false)).toEqual(pin(server, true));
  });

  // The regression: a day opened cold (direct link, notification, Onboarding's
  // Day 1, a slow network) pinned the bundled copy and never let go, so she
  // saw other words than the server's, and answers to steps the server names
  // differently were refused (404) and stuck on the phone.
  it("lets the server copy replace the bundled one when it arrives, before she has answered", () => {
    expect(nextDayPin(pin(bundled, false), live(server, true), false)).toEqual(pin(server, true));
  });

  it("after she has answered, takes the server copy only when its steps are the same (only the words change)", () => {
    expect(nextDayPin(pin(bundled, false), live(server, true, "es", true), true)).toEqual(pin(server, true));
    expect(nextDayPin(pin(bundled, false), live(server, true, "es", false), true)).toBeNull();
  });

  it("compares steps by id and kind, in order", () => {
    const a = [{ id: "ask", kind: "choose" }, { id: "take", kind: "reflect" }];
    expect(sameSteps(a, [{ id: "ask", kind: "choose" }, { id: "take", kind: "reflect" }])).toBe(true);
    expect(sameSteps(a, [{ id: "hardest", kind: "choose" }, { id: "take", kind: "reflect" }])).toBe(false);
    expect(sameSteps(a, [{ id: "ask", kind: "multi" }, { id: "take", kind: "reflect" }])).toBe(false);
    expect(sameSteps(a, [...a, { id: "more", kind: "reflect" }])).toBe(false);
  });

  it("keeps the server copy against later refetches, as before", () => {
    expect(nextDayPin(pin(server, true), live(serverAgain, true), false)).toBeNull();
    expect(nextDayPin(pin(server, true), live(bundled, false), false)).toBeNull();
  });

  it("takes a new copy for a new language, as before", () => {
    expect(nextDayPin(pin(server, true, "es"), live(bundled, false, "en"), true)).toEqual(pin(bundled, false, "en"));
  });

  it("waits while the live path has no such day", () => {
    expect(nextDayPin(null, { locale: "es", path: bundled, hasDay: false, fromServer: false, sameSteps: false }, false)).toBeNull();
    expect(
      nextDayPin(pin(bundled, false), { locale: "es", path: undefined, hasDay: false, fromServer: true, sameSteps: false }, false),
    ).toBeNull();
  });
});
