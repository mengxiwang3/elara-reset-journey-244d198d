import { OTHER_KEY, SCALE_ESCAPE, togglePick, validateStepValue, type DayStep } from "@elara/shared";
import { describe, expect, it } from "vitest";
import {
  draftFromStored,
  draftHoldsInput,
  draftValue,
  holdsWords,
  initialDraft,
  isRefusedDraft,
  keptAnswer,
  minWordsOf,
  stepDraftKey,
  tooShort,
} from "./draft";

const CHOOSE: DayStep = {
  id: "when",
  kind: "choose",
  title: "When does yours usually happen?",
  config: { options: ["At checkout", "Right after payday"], otherLabel: "Something else" },
};
const MULTI: DayStep = {
  id: "slips",
  kind: "multi",
  title: "Where does money slip away?",
  config: { options: ["Takeout", "Online shopping"], maxSelections: 3 },
};
const SORT: DayStep = {
  id: "keep",
  kind: "sort",
  title: "Keep or let go?",
  config: { items: ["My pause", "My boundary"], columns: ["Keep", "Not now"] },
};
const DRAW: DayStep = {
  id: "why",
  kind: "reflect",
  title: "What surprised you?",
  config: { modes: ["write", "say", "draw"] },
};
const MINE: DayStep = {
  id: "mine",
  kind: "reflect",
  title: "Make it yours.",
  config: { prefillFrom: "rule" },
};

describe("a step's draft, and when it is an answer", () => {
  it("stores 'Something else' as the words typed, and only once there are some", () => {
    const d = initialDraft(CHOOSE, undefined, CHOOSE.config!.options!, {});
    expect(draftValue(CHOOSE, { ...d, choice: OTHER_KEY }).answered).toBe(false);
    expect(draftValue(CHOOSE, { ...d, choice: OTHER_KEY, other: "  On the bus  " })).toEqual({
      value: "On the bus",
      answered: true,
    });
  });

  it("reopens a saved free-text choice as 'Something else' with its words", () => {
    const d = initialDraft(CHOOSE, "On the bus", CHOOSE.config!.options!, {});
    expect(d.choice).toBe(OTHER_KEY);
    expect(d.other).toBe("On the bus");
  });

  it("does not let a ticked 'Something else' with no words through a multi", () => {
    const d = initialDraft(MULTI, undefined, MULTI.config!.options!, {});
    expect(draftValue(MULTI, { ...d, picks: ["Takeout", OTHER_KEY] }).answered).toBe(false);
    expect(draftValue(MULTI, { ...d, picks: ["Takeout", OTHER_KEY], other: "Gym" }).value).toEqual([
      "Takeout",
      "Gym",
    ]);
  });

  it("needs every item placed before a sort is an answer", () => {
    const d = initialDraft(SORT, undefined, [], {});
    expect(draftValue(SORT, { ...d, sorted: { "My pause": "Keep" } }).answered).toBe(false);
    expect(draftValue(SORT, { ...d, sorted: { "My pause": "Keep", "My boundary": "Not now" } })).toEqual({
      value: { sorted: { "My pause": "Keep", "My boundary": "Not now" } },
      answered: true,
    });
  });

  it("keeps a drawing as ink plus its caption, and reopens it on the pad", () => {
    const d = initialDraft(DRAW, undefined, [], {});
    const drawing = { w: 300, h: 200, paths: ["M1 1 L5 5"] };
    const out = draftValue(DRAW, { ...d, reflect: { ...d.reflect, mode: "draw", drawing, caption: " fast " } });
    expect(out).toEqual({ value: { drawing, caption: "fast" }, answered: true });
    expect(initialDraft(DRAW, out.value!, [], {}).reflect.mode).toBe("draw");
  });

  it("starts 'Make it yours' from the chosen rule, but never over her own saved words", () => {
    const day = { rule: { value: "“I pause before I spend.”" } };
    expect(initialDraft(MINE, undefined, [], day).reflect.text).toBe("I pause before I spend.");
    expect(initialDraft(MINE, "My own version.", [], day).reflect.text).toBe("My own version.");
  });
});

describe("togglePick (exclusive option)", () => {
  const step = {
    id: "happened",
    kind: "multi",
    title: "t",
    config: { options: ["A", "B", "Nothing stands out"], exclusiveOption: 2 },
  } as unknown as DayStep;

  it("clears the others when the exclusive option is chosen", () => {
    expect(togglePick(step, ["A", "B"], "Nothing stands out")).toEqual(["Nothing stands out"]);
  });
  it("clears the exclusive option when anything else is chosen", () => {
    expect(togglePick(step, ["Nothing stands out"], "A")).toEqual(["A"]);
  });
  it("toggles an ordinary pick off", () => {
    expect(togglePick(step, ["A", "B"], "A")).toEqual(["B"]);
  });
});

describe("reflection minimum", () => {
  const REFLECT = { id: "r", kind: "reflect", title: "t", config: { modes: ["say", "write"] } } as unknown as DayStep;
  const withText = (step: DayStep, text: string) => {
    const d = initialDraft(step, null, [], undefined);
    return draftValue(step, { ...d, reflect: { ...d.reflect, text } });
  };
  it("opens on Write when it's offered", () => {
    expect(initialDraft(REFLECT, null, [], undefined).reflect.mode).toBe("write");
  });
  it("needs two words by default", () => {
    expect(withText(REFLECT, "a").answered).toBe(false);
    expect(withText(REFLECT, "me siento").answered).toBe(true);
  });
  it("lets a title stand on one word", () => {
    const TITLE = { ...REFLECT, config: { modes: ["write"], minWords: 1 } } as DayStep;
    expect(withText(TITLE, "Hogar").answered).toBe(true);
  });
});

describe("suggestion chips under the recorder", () => {
  const SAY = {
    id: "s",
    kind: "reflect",
    title: "t",
    config: { modes: ["say", "write"], ideas: ["Tired", "Hopeful"] },
  } as unknown as DayStep;
  it("counts a chip as the answer, even at one word", () => {
    const d = initialDraft(SAY, null, [], undefined);
    expect(draftValue(SAY, { ...d, reflect: { ...d.reflect, mode: "say", text: "Tired" } })).toEqual({
      value: "Tired",
      answered: true,
    });
  });
  it("still asks for two words of her own", () => {
    const d = initialDraft(SAY, null, [], undefined);
    expect(draftValue(SAY, { ...d, reflect: { ...d.reflect, mode: "say", text: "Sleepy" } }).answered).toBe(false);
  });
});

describe("a scale's escape", () => {
  const SCALE = {
    id: "share",
    kind: "scale",
    title: "t",
    config: { stops: ["Very little", "Some", "About half", "Most of it"], escape: true },
  } as unknown as DayStep;
  it("is an answer, and reopens as itself", () => {
    const d = initialDraft(SCALE, undefined, [], {});
    const out = draftValue(SCALE, { ...d, scale: SCALE_ESCAPE });
    expect(out).toEqual({ value: SCALE_ESCAPE, answered: true });
    expect(initialDraft(SCALE, out.value!, [], {}).scale).toBe(SCALE_ESCAPE);
  });
  it("is accepted by the server only where the step offers it", () => {
    expect(validateStepValue(SCALE, SCALE_ESCAPE)).toBe(true);
    const plain = { ...SCALE, config: { stops: SCALE.config!.stops } } as DayStep;
    expect(validateStepValue(plain, SCALE_ESCAPE)).toBe(false);
  });
});

describe("short reflections (O3)", () => {
  const NOTE: DayStep = { id: "note", kind: "reflect", title: "What stood out?", config: { ideas: ["Rent"] } };

  it("one word is too short and says so; two words are enough", () => {
    expect(tooShort(NOTE, "Hey")).toBe(true);
    expect(tooShort(NOTE, "Hey there")).toBe(false);
    expect(minWordsOf(NOTE)).toBe(2);
  });

  it("an empty box is not 'too short', and a tapped idea counts as it stands", () => {
    expect(tooShort(NOTE, "   ")).toBe(false);
    expect(tooShort(NOTE, "Rent")).toBe(false);
  });

  it("follows a step's own minimum", () => {
    const long: DayStep = { ...NOTE, config: { minWords: 4 } };
    expect(minWordsOf(long)).toBe(4);
    expect(tooShort(long, "Three words here")).toBe(true);
  });

  it("the CTA's answered flag follows the same rule", () => {
    const d = initialDraft(NOTE, undefined, [], undefined);
    expect(draftValue(NOTE, { ...d, reflect: { ...d.reflect, text: "Hey" } })).toMatchObject({ value: "Hey", answered: false });
    expect(draftValue(NOTE, { ...d, reflect: { ...d.reflect, text: "Hey there" } })).toMatchObject({ answered: true });
  });

  it("lets one honest word for nobody or nothing through (review P1-3, Love day 1)", () => {
    // "¿Qué relaciones de verdad te reponen?" — "Ninguna" can be the true answer.
    for (const text of ["Ninguna", "Nadie", "nada", "Ningún", "Nobody", "Nothing."]) {
      expect(tooShort(NOTE, text), text).toBe(false);
    }
    const d = initialDraft(NOTE, undefined, [], undefined);
    expect(draftValue(NOTE, { ...d, reflect: { ...d.reflect, text: "Ninguna" } })).toMatchObject({
      value: "Ninguna",
      answered: true,
    });
    // Any other single word still waits for a second one.
    expect(tooShort(NOTE, "Hola")).toBe(true);
    expect(tooShort(NOTE, "No")).toBe(true);
  });

  it("'No sé' is two words, so it is never held back here", () => {
    expect(tooShort(NOTE, "No sé")).toBe(false);
  });
});

describe("her words are kept when she skips a step or the server refuses it (beta-fixes 3 Nov)", () => {
  const TAKE: DayStep = { id: "take", kind: "reflect", title: "Para llevarte", config: { minWords: 1 } };
  const ASK: DayStep = { id: "ask", kind: "choose", title: "¿Qué parte?", config: { options: ["Encontrar trabajo", "Mejorar mi trabajo actual"] } };

  it("a draft holds input as soon as she has typed or picked anything, complete or not", () => {
    const empty = initialDraft(TAKE, undefined, [], {});
    expect(draftHoldsInput(TAKE, empty)).toBe(false);
    expect(draftHoldsInput(TAKE, { ...empty, reflect: { ...empty.reflect, text: "  " } })).toBe(false);
    // One word under a two-word minimum is not an answer yet, but it is hers.
    const two: DayStep = { ...TAKE, config: { minWords: 2 } };
    expect(draftValue(two, { ...empty, reflect: { ...empty.reflect, text: "Horario" } }).answered).toBe(false);
    expect(draftHoldsInput(two, { ...empty, reflect: { ...empty.reflect, text: "Horario" } })).toBe(true);
    const choice = initialDraft(ASK, undefined, ASK.config!.options!, {});
    expect(draftHoldsInput(ASK, choice)).toBe(false);
    expect(draftHoldsInput(ASK, { ...choice, choice: "Mejorar mi trabajo actual" })).toBe(true);
  });

  it("a refused answer comes back as its step's draft: her words in the field, and the refusal", () => {
    const stored = keptAnswer("Palabras que el servidor rechazó.", "premium_required");
    expect(isRefusedDraft(stored)).toBe(true);
    const d = draftFromStored(stored, TAKE, [], {});
    expect(d?.reflect.text).toBe("Palabras que el servidor rechazó.");
    expect(d?.refused).toBe("premium_required");
    // Saved back as a draft by the step screen, it is still marked refused until she sends it again.
    expect(isRefusedDraft(d)).toBe(true);
    const picked = draftFromStored(keptAnswer("Mejorar mi trabajo actual", "step_value_mismatch"), ASK, ASK.config!.options!, {});
    expect(picked?.choice).toBe("Mejorar mi trabajo actual");
  });

  it("an ordinary draft comes back as it was, and nothing stored means start from her saved answer", () => {
    const own = initialDraft(TAKE, "Mis palabras.", [], {});
    expect(draftFromStored(own, TAKE, [], {})).toBe(own);
    expect(isRefusedDraft(own)).toBe(false);
    expect(draftFromStored(undefined, TAKE, [], {})).toBeNull();
  });

  it("only something worth keeping is kept: not an empty skip, not blanks left empty", () => {
    expect(holdsWords(null)).toBe(false);
    expect(holdsWords("   ")).toBe(false);
    expect(holdsWords(["", " "])).toBe(false);
    expect(holdsWords(["Renta", ""])).toBe(true);
    expect(holdsWords("Una frase.")).toBe(true);
    expect(stepDraftKey("money", 8, "take")).toBe("money:8:take");
  });
});
