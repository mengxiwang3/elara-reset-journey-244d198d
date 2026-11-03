/**
 * Daily practice engine: step kinds, day complete, synthesis, collection.
 *
 * The chrome around a practice day, not the day's words — those are content
 * (`pathContent`), authored per path and served by the CMS. Everything here is
 * the same on every path: the header, the kinds' controls, the day-complete
 * screen, the week's synthesis and the collection.
 */
export const practice = {
  title: "Practice",

  header: {
    /** Every week, week 1 included: "MONEY CLARITY · WEEK 1 · DAY 1" (fix list #7). */
    weekDayEyebrow: (path: string, week: number, day: number) => `${path} · Week ${week} · Day ${day}`,
    minutes: (n: number) => `~${n} min`,
    finalStep: "Final step",
    /** The day's question progress, in words: the pill and the header. Days are counted elsewhere, as seven. */
    questionOf: (n: number, total: number) => `Question ${n} of ${total}`,
    dayOf: (day: number, total: number) => `Day ${day} of ${total}`,
    progressA11y: (step: number, total: number) => `Question ${step} of ${total} today`,
    starsA11y: (done: number, total: number) => `${done} of ${total} days done this week`,
    back: "Back",
    backA11y: "Go back a step",
    leaveA11y: "Leave today's practice",
    /** The look-back's X (mc-d7-1): her place is kept, she can come back. */
    closeA11y: "Close and go back to Today",
    pagerA11y: (step: number, total: number) => `Page ${step} of ${total}`,
  },

  /** A day screen opened for a day the path does not have (an old or broken link). */
  missingDay: {
    title: "This day isn't here",
    body: "The link may be old, or the day may have moved. Everything you've answered is safe.",
    back: "Go back",
  },

  cta: {
    continue: "Continue",
    next: "Next",
    finishToday: "Finish today",
    doneSpeaking: "Done speaking",
    skipForNow: "Skip for now",
    skip: "Skip",
    /** Under a button that has been waiting a second: what the wait is for (review v2, O2). */
    keepingWords: "Keeping your words. One moment.",
  },

  /** Elara quoting her back, with the day she said it. `weekday` is already localised. */
  saidOn: (weekday: string) => `On ${weekday} you said`,

  elara: {
    says: "Elara says",
    moneyFeltReplies: [
      "You can name the weight without fixing it tonight.",
      "Even a little extra weight is worth noticing.",
      "Noticing what hasn’t shifted can be useful, too.",
      "A little more space is worth noticing.",
      "Take a moment to notice what helped.",
    ],
    noticed: "Elara noticed",
    /** Over a static or fallback line: words of hers, not about her answers. */
    fromElara: "From Elara",
    /** The eyebrow over the one moment she picked, when a follow-up has a single option. */
    youNoticed: "You noticed",
    remembers: "Elara remembers",
    thinking: "Elara is thinking…",
  },

  weekComplete: "Week 1 complete",
  weekCompleteA11y: "Week 1 complete, seven of seven days",

  choice: {
    otherPlaceholder: "Type here…",
    otherA11y: (label: string) => `${label}, type your own`,
    pickUpTo: (n: number, picked: number) => picked >= n ? `${picked} of ${n} selected · deselect one to change` : `${picked} of ${n} selected`,
    /** Shown for two seconds when she taps past the limit. */
    limit: (n: number) => `Pick up to ${n}`,
    blockedHint: "Unpick one first to choose this",
    exclusive: "Or choose only this",
    moreBelow: "More choices below",
    /** The heading when a follow-on choice is left with her one pick ("which surprised you most?" after one). */
    singleFollowOn: "This is the one you chose.",
  },

  sort: {
    placeA11y: (item: string, column: string) => `${item}: ${column}`,
    left: (n: number) => (n === 1 ? "1 left to place" : `${n} left to place`),
    /** Columns layout: the arrow on a chip, read aloud. */
    moveA11y: (item: string, column: string) => `Move "${item}" to ${column}`,
  },

  scale: {
    selected: "Selected:",
    a11y: "Drag or tap a stop",
    /** The scale's escape: choosing it is an answer, not a skip. */
    escape: "I'm not sure yet",
  },

  reflect: {
    modesA11y: "How would you like to answer?",
    write: "Write",
    say: "Say",
    draw: "Draw",
    ideas: "Ideas to start from",
    /** Under the recorder in Say: a chip is the answer. */
    sayIdeas: "Or tap one that fits",
    ideaA11y: (idea: string) => `Start from: ${idea}`,
    /**
     * Under the field while her words are there but Next still waits for more
     * (review v2, O3): the rule, said where it applies.
     */
    tooShort: (n: number) => `${n === 2 ? "Two words or more" : `${n} words or more`}.`,
    /** The same, when there are suggested lines she can tap instead. */
    tooShortIdeas: (n: number) => `${n === 2 ? "Two words or more" : `${n} words or more`}, or tap one of the lines above.`,
    sentences: (n: number) => (n === 1 ? "1 sentence" : `${n} sentences`),
    typeInstead: "Type instead",
    tapToSpeak: "Tap the orb to speak",
    listening: "Elara is listening…",
    transcribing: "Writing down what you said…",
    heard: "What Elara heard",
    orbA11y: "Record your answer",
    orbStopA11y: "Stop recording",
    pad: {
      canvasA11y: "Drawing space. Draw with one finger.",
      hint: "Draw with your finger",
      undo: "Undo the last line",
      clear: "Clear the drawing",
      caption: "Give it a few words so Elara can respond",
      tones: { ink: "Ink", peach: "Peach", ember: "Ember" },
      toneA11y: (name: string) => `Draw in ${name}`,
      fine: "Fine line",
      bold: "Bold line",
      chooseShape: "Choose a shape instead",
      drawInstead: "Draw instead",
      shapeNames: {
        knot: "A knot",
        block: "A heavy block",
        circle: "An open circle",
        wave: "A wave",
        spark: "A spark",
      },
    },
  },

  rank: {
    /** The badge a pick wears, by its place. */
    places: ["First", "Second", "Third", "Fourth", "Fifth"],
    progress: (n: number, picked: number) =>
      picked >= n ? `All ${n} in order · tap one to take it out` : `Pick ${n}, in order · ${picked} of ${n}`,
  },

  cards: {
    of: (i: number, n: number) => `${i} of ${n}`,
    /** For three seconds after each card. */
    undo: "Undo",
    undoA11y: (item: string) => `Undo "${item}"`,
  },

  photo: {
    take: "Take photo",
    add: "Add your photo",
    hint: "Square or portrait photos work best",
    library: "Choose from library",
    describe: "Describe it instead",
    addInstead: "Add a photo instead",
    describeLabel: "Describe it",
    describePlaceholder: "What was it, and why did it feel right?",
    captionLabel: "What is it? (required)",
    captionPlaceholder: "A few words, like “Morning coffee”",
    retake: "Retake",
    /** The preview's confirm, before anything is uploaded. */
    use: "Use photo",
    retry: "Try again",
    uploading: "Saving your photo…",
    failed: "That photo didn't save.",
    denied: "Elara can't reach your camera or photos. You can allow it in Settings.",
    openSettings: "Open Settings",
    yourPhoto: "Your photo",
  },

  blanks: {
    eg: "e.g.",
  },

  rehearse: {
    script: "Your script",
    /** A tap starts the moment and a tap ends it: nothing has to be held. */
    start: "Tap, then say it out loud",
    saying: "Say it out loud… tap when you're done",
    orbA11y: "Say it out loud. Nothing is recorded.",
    orbOnA11y: "Saying it out loud. Tap when you're done.",
  },

  /** "Breathe with me": three slow breaths before Day 1's first question (spec §14 #4). */
  breathe: {
    in: "Breathe in…",
    out: "Breathe out…",
    count: (n: number, total: number) => `Breath ${n} of ${total}`,
    /** Screen reader or Reduce Motion: nothing moves, so she sets the pace. */
    still: (total: number) => `Take ${total} slow breaths, in through your nose and out through your mouth. Continue when you're ready.`,
    skip: "Skip",
    skipA11y: "Skip the breathing and start",
    orbA11y: "A circle that grows as you breathe in and settles as you breathe out",
  },

  shown: {
    drawing: "Your drawing",
    photo: "Your photo",
    reflection: (week: number, day: number) => `Week ${week} · Day ${day} reflection`,
  },

  followUp: {
    eyebrow: "Yesterday",
    selectToContinue: "Choose how it went to continue",
    skipA11y: "Skip yesterday's check-in",
  },

  dayComplete: {
    /** Under her line on the dawn close. */
    signature: "Elara",
    weekEyebrow: (week: number, day: number) => `Week ${week} · Day ${day} complete`,
    progress: (done: number, total: number) => `${done} of ${total} days complete`,
    experiment: "Your experiment",
    tomorrow: "Tomorrow",
    experimentTitle: (what: string) => `Tomorrow: ${what}`,
    tomorrowA11y: (title: string) => `Tomorrow: ${title}`,
    backToday: "Back to Today",
    /** What she did today, on the one completion screen. */
    summary: (answered: number, total: number) =>
      answered === 0
        ? "You went through today's questions. Skipping is fine."
        : total === 1
          ? "You answered today's question."
          : `You answered ${answered} of ${total} questions.`,
    /** What is saved, said plainly. */
    saved: "Your answers are saved. You can come back to them in your Atlas.",
    savedOffline: "Your answers are saved on this phone. They will sync when you are back online.",
    /** An answer of the day was refused by the server for good; its words are back in its step on this phone. */
    notSaved: "One of your answers couldn't be saved to your account. Your words are still in that step, on this phone.",
    fallbackTitle: "You showed up for today.",
    fallbackElara: "What you looked at today stays with you for what comes next.",
  },

  /** An answer the server refused for good, put back in its step (`keptAnswer`). */
  refused: {
    step: "This answer couldn't be saved to your account. Your words are still here, so you can send them again.",
  },

  synthesis: {
    weekComplete: (week: number) => `Week ${week} complete`,
    title: "A pattern is starting to emerge.",
    newInCollection: "New in your collection",
    yourRule: "Your rule",
    seeCollection: "See my collection",
    continueWeek: (week: number) => `Continue to Week ${week}`,
    backToday: "Back to Today",
  },

  collection: {
    title: "Your collection",
    subtitle: "What you've made along the way.",
    week: (week: number) => `Week ${week}`,
    weekTitled: (week: number, title: string) => `Week ${week} · ${title}`,
    sentence: "Sentence",
    scribble: "Scribble",
    drawing: "Drawing",
    photo: "Photo",
    compass: "Compass",
    words: "Words",
    letter: "Letter",
    fromElara: "From Elara",
    day: (day: number) => `Day ${day}`,
    unlocksNext: "Unlocks next",
    /** A week not reached yet: one quiet placeholder (spec §7). */
    comingInWeek: (week: number) => `Coming in Week ${week}`,
    lockedA11y: (week: number) => `Week ${week}, unlocks after this one`,
    /** The full-screen view of one piece. */
    edit: "Edit",
    editA11y: (what: string) => `Edit this ${what.toLowerCase()}`,
    openA11y: "Opens it full screen",
    empty: "What you make in your practice collects here: a sentence you wrote, a scribble, the letter at the end of the week.",
    noCaption: "Untitled",
    openPath: "Open your path",
  },

  weekIntro: {
    week: (week: number) => `Week ${week}`,
    noteFrom: (guide: string, duration: string) => `A note from ${guide} · ${duration}`,
    noteFromShort: (guide: string) => `A note from ${guide}`,
    play: "Play the note",
    playA11y: (guide: string) => `Play ${guide}'s note`,
    subtitles: "Subtitles",
    begin: (week: number, day: number) => `Begin Week ${week} · Day ${day}`,
    skip: "Skip for now",
  },

  /**
   * The ambient bed under the day (`lib/ambientPlayer`). The prompt is asked
   * once, never plays anything by itself, and the control is always on screen.
   */
  ambient: {
    promptTitle: "Would you like ambient sound to keep you company on your path?",
    promptBody:
      "A soft, quiet instrumental under your day. It lowers whenever Elara speaks and stops when you leave. You can turn it off whenever you like.",
    promptYes: "Yes, add sound",
    promptNo: "Not now",
    onA11y: "Ambient sound is on. Turn it off",
    offA11y: "Ambient sound is off. Turn it on",
  },

  letter: {
    eyebrow: "A letter from Elara",
  },

  /**
   * The end-of-day prompt (client brief, Oct 15 2026, Step 5). Options and
   * reasons are parallel to `DAY_FEEDBACK_ANSWERS` / `DAY_FEEDBACK_REASONS`:
   * the ids are stored, never these words.
   */
  feedback: {
    question: "Was today's session useful to you?",
    answers: ["Yes", "A little", "No"],
    followUp: "What made it less useful? Choose any that apply.",
    reasons: [
      "I didn't get the point",
      "It felt generic",
      "It was too long",
      "The wording was confusing",
      "It wasn't in my language",
      "Something else",
    ],
    placeholder: "Tell us more (optional)",
    thanks: "Thank you, this helps us improve Elara.",
    send: "Send",
    skip: "Not now",
    skipA11y: "Skip this question",
  },
} as const;
