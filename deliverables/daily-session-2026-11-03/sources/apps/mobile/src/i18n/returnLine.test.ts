import { describe, expect, it } from "vitest";
import { stopLandmarks } from "@/content/placeDay";
import { en } from "./locales/en";
import { es } from "./locales/es";

/**
 * The line a day opens on when she comes back to a place (\`useWorldDay\`):
 * "De vuelta" + the previous stop's "En …" form. With the generic stop «La
 * vuelta» it read «De vuelta en la vuelta.» (beta-fixes 3 Nov, day 24).
 */
describe("the return line", () => {
  it("does not say «De vuelta en la vuelta.» at any generic stop", () => {
    const lines = stopLandmarks(es.globe.stops.generic, "es").map((l) => es.day.return.back(l.at));
    expect(lines).not.toContain("De vuelta en la vuelta.");
    expect(lines.filter((l) => (l.match(/vuelta/g) ?? []).length > 1)).toEqual([]);
    expect(es.day.return.back("En la vuelta")).toBe("De nuevo en la vuelta.");
  });

  it("is unchanged everywhere else", () => {
    expect(es.day.return.back("En el seto")).toBe("De vuelta en el seto.");
    expect(es.day.return.back("En la puerta")).toBe("De vuelta en la puerta.");
    expect(en.day.return.back("At the turn")).toBe("Back at the turn.");
  });
});
