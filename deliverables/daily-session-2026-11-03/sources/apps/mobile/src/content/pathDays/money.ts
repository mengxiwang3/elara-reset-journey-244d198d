import type { PathStructure } from "../paths";

/**
 * Money Clarity, five weeks of two steps a day.
 *
 * Imported from "Preguntas que llevan a algo" (review draft, 21 Oct 2026; see
 * `tools/curriculum`). Each day is the day's one question (`ask`, in the
 * response format the draft names) and its optional takeaway (`take`). Both are
 * optional: skipping is an answer of its own, so a day always closes.
 *
 * The week's last `ask` is the one the week's close leads with (`keep: "rule"`),
 * and every `take` is a line for her collection. The Atlas reads those two
 * (`WORLD_INSIGHT_SOURCES`). These step ids are new: an answer stored under an
 * older id is never handed to a different question, so they are never reused
 * for another one.
 */
export const money: PathStructure = {
  icon: "solar:wallet-money-bold-duotone",
  days: [
    // ── Week 1 · Look without judging
    {
      day: 1,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 2,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        {
          id: "ask",
          kind: "multi",
          config: { optionCount: 6, maxPicks: 6, exclusiveOption: 5, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 3,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        { id: "ask", kind: "blanks", config: { fieldCount: 3, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 4,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 5,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 6,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["draw", "write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 7,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "rule" },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    // ── Week 2 · Income and possibilities
    {
      day: 8,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        // Option 6, «Ninguna por ahora», is the honest "none right now" (`noneOption`).
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true, noneOption: 5 } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 9,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["say", "write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 10,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "multi", config: { optionCount: 6, maxPicks: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 11,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 12,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 13,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 14,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "rule" },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    // ── Week 3 · Decide with information
    {
      day: 15,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 16,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 17,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 18,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 19,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 20,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 21,
      kind: "reflect",
      config: { minutes: 4, header: "centered" },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "rule" },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    // ── Week 4 · One concrete attempt
    {
      day: 22,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 23,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 24,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        { id: "ask", kind: "photo", config: { quiet: true, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 25,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 26,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["say", "write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 27,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 28,
      kind: "reflect",
      config: { minutes: 4, header: "centered" },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "rule" },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    // ── Week 5 · Clarity that continues
    {
      day: 29,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 30,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "multi", config: { optionCount: 6, maxPicks: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 31,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 32,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 33,
      kind: "reflect",
      config: { minutes: 3 },
      steps: [
        { id: "ask", kind: "choose", config: { optionCount: 6, optional: true } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 34,
      kind: "reflect",
      config: { minutes: 4 },
      steps: [
        {
          id: "ask",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true },
        },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
    {
      day: 35,
      kind: "reflect",
      config: { minutes: 4, header: "centered" },
      steps: [
        { id: "ask", kind: "blanks", config: { fieldCount: 3, optional: true, keep: "rule" } },
        {
          id: "take",
          kind: "reflect",
          config: { modes: ["write"], minWords: 1, optional: true, keep: "sentence" },
        },
      ],
    },
  ],
};
