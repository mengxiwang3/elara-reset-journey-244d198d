import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { en } from "@/i18n/locales/en";
import { es } from "@/i18n/locales/es";
import { COHORT_LINES } from "./crisisSources";
import { HELP_NOW_ROUTE } from "./helpNow";

const extra: { crisisLines?: unknown } = {};
vi.mock("expo-constants", () => ({ default: { expoConfig: { get extra() { return extra; } } } }));
vi.mock("@/i18n", () => ({ strings: () => es }));

const SHIPPED = ["8009112000", "106", "024", "112", "14416", "988", "116123"];
const root = join(__dirname, "..", "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

describe("Get help now: destination", () => {
  it("goes to the crisis screen, not the explainer list", () => {
    expect(HELP_NOW_ROUTE).toBe("/crisis-help");
  });

  it("is what every Circle safety link opens", () => {
    for (const file of [
      "src/components/circles/RoomMenuSheet.tsx",
      "app/circle-detail.tsx",
      "app/(tabs)/circle.tsx",
      "src/components/ReportSheet.tsx",
    ]) {
      const src = read(file);
      expect(src, file).toContain("HELP_NOW_ROUTE");
      expect(src, file).not.toMatch(/router\.push\("\/help"\)/);
    }
  });

  it("is what Today and Ask (text and voice) open too", () => {
    for (const file of ["app/(tabs)/index.tsx", "app/(tabs)/ask.tsx", "app/chat/audio.tsx"]) {
      const src = read(file);
      expect(src, file).toContain("router.push(HELP_NOW_ROUTE)");
      expect(src, file).not.toMatch(/router\.push\("\/help"\)/);
    }
  });

  it("is a real route that lists the resources and never claims to be a crisis service", () => {
    const screen = read("app/crisis-help.tsx");
    expect(screen).toContain("CrisisResourceList");
    for (const t of [en, es]) {
      expect(t.guide.crisis.helpNowNotService).toMatch(/\bAI\b|\bIA\b/);
      expect(t.guide.crisis.helpNowEmergency.length).toBeGreaterThan(20);
    }
  });
});

/** [start, end] of every parenthesised branch after `?`, `:` or `&&`: what renders only on a condition. */
function conditionalRanges(src: string): [number, number][] {
  const out: [number, number][] = [];
  const re = /(\?|:|&&)\s*\(/g;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    const open = m.index + m[0].length - 1;
    let depth = 0;
    for (let i = open; i < src.length; i++) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")" && --depth === 0) {
        out.push([open, i]);
        break;
      }
    }
  }
  return out;
}

describe("Get help now: reachable from Today and Ask with Circle off", () => {
  const entries = [
    { file: "app/(tabs)/index.tsx", at: "<HelpNowLink" },
    { file: "app/(tabs)/ask.tsx", at: "label={t.guide.chat.helpNowA11y}" },
  ];

  it("draws the entry on every render: no condition (Circle, Premium, data) wraps it", () => {
    for (const { file, at } of entries) {
      const src = read(file);
      const index = src.indexOf(at);
      expect(index, file).toBeGreaterThan(0);
      const inside = conditionalRanges(src).filter(([a, b]) => a < index && index < b);
      expect(inside, file).toEqual([]);
    }
  });

  it("(the check above does see a condition: «Hoy te llevas» and the voice-mode door are conditional)", () => {
    const home = read("app/(tabs)/index.tsx");
    const ask = read("app/(tabs)/ask.tsx");
    const within = (src: string, at: string) =>
      conditionalRanges(src).some(([a, b]) => a < src.indexOf(at) && src.indexOf(at) < b);
    expect(within(home, "<TakeawayRow")).toBe(true);
    expect(within(ask, "label={t.guide.chat.voiceModeA11y}")).toBe(true);
  });

  it("reads no Circle switch on the way: the entries, the row and the help screen", () => {
    for (const file of [
      "app/(tabs)/index.tsx",
      "app/(tabs)/ask.tsx",
      "app/chat/audio.tsx",
      "src/components/journey/HelpNowRow.tsx",
      "app/crisis-help.tsx",
      "src/components/CrisisResources.tsx",
    ]) {
      expect(read(file), file).not.toMatch(/useCircleEnabled|circleEnabled|circleTopics|features\.circle/);
    }
  });

  it("keeps Today and Ask as tabs when Circle is off: only the Circle tab hides, and it sends her to Today", () => {
    const bar = read("src/components/TabBar.tsx");
    const hides = bar.match(/if \(route\.name === "(\w+)" && !circleEnabled\) return null;/g) ?? [];
    expect(hides).toEqual(['if (route.name === "circle" && !circleEnabled) return null;']);
    expect(read("app/(tabs)/circle.tsx")).toMatch(/if \(!circleEnabled\) return <Redirect href="\/\(tabs\)" \/>/);
  });

  it("names itself to a screen reader in both languages, and opens a link, not an action", () => {
    for (const t of [en, es]) {
      expect(t.home.helpNow.a11y).toContain(t.home.helpNow.title);
      expect(t.guide.chat.helpNowA11y).toContain(t.guide.crisis.helpNowTitle);
    }
    expect(read("src/components/journey/HelpNowRow.tsx")).toContain('accessibilityRole="link"');
    expect(read("src/components/journey/HelpNowRow.tsx")).toMatch(/minHeight: (4[4-9]|[5-9]\d)/);
  });
});

describe("Get help now: resources and the unknown-country fallback", () => {
  beforeEach(() => {
    delete extra.crisisLines;
  });

  it("always offers the country-resolving directory, so an unknown country is covered", async () => {
    const { helplineFinder } = await import("./crisis");
    expect(helplineFinder().url).toBe("https://findahelpline.com");
  });

  it("lists the cohort's lines first (Mexico, Colombia, Spain with 112), then the lines already shipped", async () => {
    const { crisisLines } = await import("./crisis");
    const lines = crisisLines();
    expect(lines.map((l) => l.phone)).toEqual(SHIPPED);
    expect(lines.map((l) => l.phoneLabel ?? l.phone).slice(0, 4)).toEqual(["800 911 2000", "106", "024", "112"]);
    for (const l of lines) expect(l.label).toMatch(/México|Colombia|España|India|EE\. UU\.|Reino Unido/);
  });

  it("falls back to the shipped lines when a build's override is malformed or empty", async () => {
    const { crisisLines } = await import("./crisis");
    for (const bad of [[], [{ nope: 1 }], "x", null]) {
      extra.crisisLines = bad;
      expect(crisisLines().map((l) => l.phone)).toEqual(SHIPPED);
    }
  });

  it("uses a build's own lines when they are well formed", async () => {
    const { crisisLines } = await import("./crisis");
    extra.crisisLines = [{ label: "Línea de prueba", detail: "d", phone: "000" }];
    expect(crisisLines()).toEqual([{ label: "Línea de prueba", detail: "d", phone: "000" }]);
  });

  it("states the emergency-services note in plain words", async () => {
    const { emergencyNote } = await import("./crisis");
    expect(emergencyNote()).toMatch(/emergencia/);
  });
});

describe("cohort lines: sources and review state", () => {
  it("has the four lines the owner supplied, and nothing else, with their numbers exactly", () => {
    expect(COHORT_LINES.map((l) => [l.country, l.phone, l.phoneLabel])).toEqual([
      ["MX", "8009112000", "800 911 2000"],
      ["CO", "106", "106"],
      ["ES", "024", "024"],
      ["ES", "112", "112"],
    ]);
  });

  it("gives every line an https source and a review date", () => {
    for (const l of COHORT_LINES) {
      expect(l.sourceUrl, l.id).toMatch(/^https:\/\//);
      expect(l.reviewedOn, l.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("marks none verified: that needs someone to open the source and call from the country", () => {
    // Flip a line only after a person has checked it (docs/BETA-GATES.md, Gate 1b),
    // and update this test in the same change.
    expect(COHORT_LINES.filter((l) => l.verified)).toEqual([]);
  });

  it("shows no line without Spanish wording", () => {
    for (const k of ["mexico", "colombia", "spain", "spain112"] as const) {
      expect((es.guide.crisis.lines as Record<string, string>)[`${k}Label`]).toBeTruthy();
      expect((es.guide.crisis.lines as Record<string, string>)[`${k}Detail`]).toBeTruthy();
    }
  });
});
