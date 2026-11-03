/**
 * The day walked in a place (Oct 2026 "Money Journey" prototype): the words
 * the photo band adds around the questions. The place names and stops are
 * the globe's (`t.globe`); the world's own words are `t.world.worlds[id]`.
 */
export const photoDay = {
  /** The arrival's way in. */
  start: "Start",
  /** The day done: the title when the day has none of its own, and the way on. */
  done: "Done for today",
  /** The week's last day, done: on to the reveal. */
  seeWhere: "See where I walked",
  /** Under Elara's line on the day done: tomorrow's stop. "Toward the cave" in, "Tomorrow, toward the cave." out. */
  tomorrow: (toward: string) => `Tomorrow, ${toward.charAt(0).toLowerCase()}${toward.slice(1)}.`,
  /** "Where is this?" on the scene, and its card. */
  whereA11yOpen: "Hide where this is",
  placeCountry: (place: string, country: string) => `${place}, ${country}`,
  /** The picture, for a screen reader. */
  sceneA11y: (place: string, stop: string) => `Photograph of ${place}: ${stop.charAt(0).toLowerCase()}${stop.slice(1)}`,
  /** The week revealed. */
  weekLine: (area: string, week: number, title: string | null) => (title ? `${area} · Week ${week} · ${title}` : `${area} · Week ${week}`),
  kept: "You kept tending, and it held.",
  shifted: "What shifted",
  shiftedNone: "Nothing written this week. That is fine.",
  nextWeek: "Next week",
  /** The next place, after the reveal. */
  opensTomorrow: (place: string) => `${place} opens tomorrow.`,
  open: (place: string) => `${place} is open.`,
  /** The daily session (3 Nov 2026): the opening with its purpose, the takeaway card, the close. */
  session: {
    minutes: (n: number) => `About ${n} minutes`,
    whyToday: "Why today",
    takeAway: "Today you take away",
    weekNote: (week: number, title: string) => `Week ${week} · ${title}`,
    lastTime: "Last time you noted",
    lastDay: (day: number) => `Day ${day}`,
    lastWeekDay: (week: number, day: number) => `Week ${week} · Day ${day}`,
    change: "Change",
    changeA11y: (label: string, value: string) => `${label}: ${value}. Change`,
    changedChoice: "You changed your choice. Check whether what you wrote still fits.",
    calmDone: "Today is done, just as you left it.",
    skipped: "You passed on this question",
    noNote: "No note for today",
    edit: "Edit",
    editA11y: (label: string) => `Edit ${label.toLowerCase()}`,
    tomorrow: (question: string) => `Tomorrow: ${question}`,
    askNote: "Ask for Elara's note",
    askNoteFailed: "Elara's note did not arrive. What you wrote is still saved.",
    emptySlotA11y: (label: string, hint: string) => `${label}: still empty. ${hint}`,
  },
} as const;
