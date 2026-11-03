import { describe, expect, it } from "vitest";
import {
  accountReset,
  accountSettings,
  freshOnboarding,
  progressReady,
  progressStatus,
  progressSyncedOnLaunch,
} from "./accountState";
import type { Settings } from "./useAppStore";

/**
 * The persisted slice holds `onboarding` (the member's concern text, their
 * clarity-audit answers) and `todayCheckIn` (their mood).
 * Sign-out used to clear neither, so on a shared phone the next person to sign
 * in inherited all of it.
 *
 * These are that promise pinned down. The thing to notice is that they are
 * written as "nothing personal survives", not as a list of fields — a new field
 * added to `onboarding` is caught by the deep-equality check below rather than
 * quietly slipping through.
 */
function settingsWith(overrides: Partial<Settings> = {}): Settings {
  return { ...accountSettings(), hapticsEnabled: true, ...overrides };
}

describe("accountReset", () => {
  it("clears every trace of the onboarding draft", () => {
    const reset = accountReset(settingsWith());
    // Deep-equal against a fresh draft, so any field added to `OnboardingState`
    // has to be cleared here too or this fails.
    expect(reset.onboarding).toEqual(freshOnboarding());
    expect(reset.onboarding?.concern).toBe("");
    expect(reset.onboarding?.answers).toEqual({});
  });

  it("clears today's mood", () => {
    expect(accountReset(settingsWith()).todayCheckIn).toBeNull();
  });

  it("clears the session, entitlement and path progress", () => {
    const reset = accountReset(settingsWith());
    expect(reset.user).toBeNull();
    expect(reset.hasOnboarded).toBe(false);
    expect(reset.subscription).toBeNull();
    expect(reset.isPremium).toBe(false);
    expect(reset.progress).toEqual({});
  });

  it("clears the unsent check-in queue", () => {
    // An unsent check-in belongs to the account that is leaving. Carried across,
    // it would file one person's evening under the next person's rhythm — and
    // the streak, the milestones and the moment that celebrates them are all
    // derived from those rows.
    expect(accountReset(settingsWith()).pendingCheckIns).toEqual([]);
  });

  it("clears the celebration ledgers", () => {
    // These record moments *this member* has been shown. Carried across a
    // sign-out they would silence the next member's first milestone.
    const reset = accountReset(settingsWith());
    expect(reset.milestonesCelebrated).toEqual([]);
    expect(reset.milestonesSeededFor).toBeNull();
    expect(reset.daysCelebrated).toEqual({});
  });

  it("clears the area the previous account was walking", () => {
    // Left behind, this leaks which life area the last person was working on —
    // and silently mis-gates the next account's one free path.
    const reset = accountReset(settingsWith());
    expect(reset.activeArea).toBe("money");
    expect(reset.freeArea).toBe("money");
  });

  it("resets account-owned preferences to their server defaults", () => {
    const previous = settingsWith({
      allowMessages: true,
      eveningCheckIn: false,
      reminderTime: "06:30",
      guidePersonality: "coach",
      showCity: false,
      push: {
        direct_message: false,
        connection_request: false,
        circle_reflection: false,
        event_reminder: false,
      },
    });

    const { hapticsEnabled: _ignored, ...rest } = accountReset(previous).settings as Settings;
    expect(rest).toEqual(accountSettings());
  });

  it("keeps haptics, which describes the phone and not the account", () => {
    // The one deliberate exception, like Reduce Motion: it is never synced to
    // the server and would be rude to silently re-enable on someone.
    expect(accountReset(settingsWith({ hapticsEnabled: false })).settings?.hapticsEnabled).toBe(
      false,
    );
    expect(accountReset(settingsWith({ hapticsEnabled: true })).settings?.hapticsEnabled).toBe(
      true,
    );
  });

  it("leaves nothing account-derived out of the reset", () => {
    // A guard against the failure mode that caused this bug: a field lands in
    // the persisted slice and nobody remembers to clear it. Every key the reset
    // does touch is listed here, so adding one is a deliberate act.
    expect(Object.keys(accountReset(settingsWith())).sort()).toEqual(
      [
        "activeArea",
        "betaOpenAreas",
        "daysCelebrated",
        "drafts",
        "feedbackAsked",
        "freeArea",
        "hasOnboarded",
        "isPremium",
        "lastEligibleDay",
        "milestonesCelebrated",
        "milestonesSeededFor",
        "onboarding",
        "pendingCheckIns",
        "pendingFeedback",
        "pendingSteps",
        "progress",
        "progressSyncedFor",
        "recentResourceIds",
        "safetyPauses",
        "settings",
        "subscription",
        "todayCheckIn",
        "todayWelcomePending",
        "unseenSafetyCards",
        "user",
      ].sort(),
    );
  });

  it("makes the progress no one's, so the next account's is read before a day is offered", () => {
    expect(accountReset(settingsWith()).progressSyncedFor).toBeNull();
  });
});

describe("progressReady (beta hardening, 3 Nov 2026)", () => {
  // Before: a member in week 2 who signed in on a new phone, or again after her
  // session expired, was offered «Semana 1 · Día 1 · Empezar el día 1» until her
  // progress arrived (forever if the read failed), and answering it rewrote the
  // Day 1 answers she gave weeks ago.
  it("is not ready until her own progress has been read", () => {
    expect(progressReady(null, "u1")).toBe(false);
    expect(progressReady(undefined, "u1")).toBe(false);
    expect(progressReady("u0", "u1")).toBe(false);
    expect(progressReady("u1", "u1")).toBe(true);
  });

  it("gates nothing while signed out", () => {
    expect(progressReady(null, null)).toBe(true);
    expect(progressReady(undefined, undefined)).toBe(true);
  });
});

describe("progressSyncedOnLaunch", () => {
  it("counts a store from a build before the field as the last account's", () => {
    expect(progressSyncedOnLaunch(undefined, "u1")).toBe("u1");
    expect(progressSyncedOnLaunch(undefined, null)).toBeNull();
  });

  it("keeps what this build wrote", () => {
    expect(progressSyncedOnLaunch(null, "u1")).toBeNull();
    expect(progressSyncedOnLaunch("u1", "u1")).toBe("u1");
  });
});

describe("progressStatus", () => {
  it("is ready once her progress is hers, whatever the read is doing", () => {
    expect(progressStatus({ ready: true, query: "error", fetching: false })).toBe("ready");
    expect(progressStatus({ ready: true, query: "pending", fetching: true })).toBe("ready");
  });

  it("is loading while the read is on its way", () => {
    expect(progressStatus({ ready: false, query: "pending", fetching: true })).toBe("loading");
    expect(progressStatus({ ready: false, query: "pending", fetching: false })).toBe("loading");
    // A retry after a failure is on its way again.
    expect(progressStatus({ ready: false, query: "error", fetching: true })).toBe("loading");
  });

  it("offers a retry once the read failed and nothing is in flight", () => {
    expect(progressStatus({ ready: false, query: "error", fetching: false })).toBe("failed");
  });
});
