/**
 * Today, Paths, and the path itself — the work the app is actually for.
 *
 * The one thing to keep in mind when translating this domain: none of this copy
 * counts what someone *didn't* do. "Checked in 3 of the last 7 days" is a
 * record of showing up, not a score out of seven, and a translation that turns
 * it into one ("solo 3 de 7") breaks the rule the whole screen is built on.
 */
export const home = {
  today: {
    /** Falls back into the greeting when there's no name yet. */
    friend: "there",
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
      night: "Late night",
    },
    /** The line before a check-in — it greets you. */
    opening: {
      morning: "A fresh page, and no rush to fill it.",
      afternoon: "However the day has gone so far, you're here.",
      evening: "The day is winding down. Let's look at it.",
      night: "Whatever brought you here this late, it's welcome.",
    },
    /** Once you've checked in, the line answers you instead. */
    reply: {
      calm: "Calm is worth noticing. Let's keep it.",
      unsure: "Not sure is honest. We can start there.",
      good: "Good is worth noticing. Let's keep it.",
      okay: "Okay is a fine place to start.",
      stressed: "Let's take one thing off the pile.",
      heavy: "Heavy days count too. Go gently.",
    },
    /**
     * The morning cue — the line Elara opens the day with, now the first thing
     * on the screen rather than the last. It is the only text in the app a
     * member can export, so it is written to stand alone out of context.
     */
    cueEyebrow: "Elara today",
    cueLabel: "Today's cue",

    /** The Clarity card — the six-area web, in miniature. */
    clarityEyebrow: "Your Clarity",
    clarityAreas: (n: number) => `${n} life areas`,
    clarityFocus: (area: string) => `Current focus: ${area}`,
    /** The radar is a picture; this is what it says out loud. */
    clarityA11y: (n: number, areas: string) => `Your Clarity across ${n} life areas: ${areas}`,
    /** What was recorded, never a suggestion: less activity somewhere is not a reason to go there. */
    clarityBlurb: ({ active, hasProgress }: { active: string; quiet?: string; hasProgress: boolean }) =>
      hasProgress
        ? `Most of what you've recorded so far is in ${active}.`
        : `${active} is where you're starting. The rest fills in as you keep walking.`,
    viewClarity: "View Clarity",
    /** Roughly how long today's practice takes. Approximate on purpose. */
    minutes: (n: number) => `~${n} min`,
    /** What the card's thing is, before "Day 2 of 7". No minutes: a practice's length is an estimate. */
    practiceKind: "Practice",
    /** Beside "How are you arriving?": the check-in can always be left. */
    optional: "Optional",
    profileA11y: "Your profile",
    checkedIn: "You checked in",
    howArriving: "How are you arriving?",
    /**
     * Weather, not verdicts. A storm isn't a worse day than sun — it's a
     * different one — which is the only framing that lets someone tap "Heavy"
     * honestly. Translate them as conditions, never as grades.
     */
    moods: {
      good: "Good",
      okay: "Okay",
      stressed: "Stressed",
      heavy: "Heavy",
    },
    checkInAs: (mood: string) => `Check in as ${mood}`,
    checkInHelp: "One tap saves today's check-in. You can change it anytime.",
    arrivalMoods: { calm: "Calm", okay: "Okay", heavy: "Heavy", unsure: "Not sure" },
    arrivalHelp: "Optional · tap to save, change anytime.",
    afterPracticeMood: "How do you feel now?",
    checkInOptional: "Optional · save how you're leaving today's practice.",
    allDaysWalked: "You've walked all seven days.",
    chooseWhereNext: "Choose where to go next.",
    /** Every authored day walked. No count: a member never sees a path total (fix list #7). */
    allDone: "All done",
    allDaysA11y: "Every day of this path is complete",
    chooseNextPath: "Choose next path",
    /** A path of several weeks, once every authored week is walked. */
    weeksWalked: (weeks: number) =>
      weeks === 2 ? "You've finished the first two weeks." : `You've finished the first ${weeks} weeks.`,
    moreWeeksComing: "The next weeks are on their way. We'll let you know when the next one is ready.",
    seeCollection: "See my collection",
    weekDayA11y: (week: number, day: number, total: number, done: number) =>
      `Week ${week}, day ${day} of ${total}, ${done} complete`,
    startDay: (week: number, day: number) => `Start Week ${week} · Day ${day}`,
    startPractice: "Start today's practice",
    continuePractice: "Continue today's practice",
    practiceWhy: (teaser: string) => `Today: ${teaser}`,
    weekLabel: (week: number) => `Week ${week}`,
    weekDayLabel: (week: number, day: number) => `Week ${week} · Day ${day}`,
    weekCompleteCount: (done: number, total: number) => `${done} of ${total} complete`,
    compass: "Your daily compass",
    /** Counted within the week she is in, never across the path. */
    weekCount: (done: number, total: number) => `${done} of ${total} this week`,
    compassA11y: (done: number, total: number) =>
      `Your daily compass. ${done} of ${total} days complete this week.`,
    todayMarker: "Today",
    doors: {
      talkTitle: "Talk it out",
      talkCaption: "Elara is here.",
      circleTitle: "Your circle",
      circleCaption: "See who's around.",
      circleSharedToday: (n: number) => `${n} shared today`,
      /** The gate's body when there is no count to show. Names what is behind
       *  the door rather than what is missing from the account. */
      circleLocked: "Reflect alongside women walking the same path.",
    },
    lastSeven: "Your last seven days",
    /** The quieter group under the day: Kept, Your Clarity, the last seven days. */
    progressEyebrow: "Your progress",
    noCheckIn: "No check-in",
    streakDays: (n: number) => `${n} day${n === 1 ? "" : "s"}`,
    weekA11y: (logged: number) => `Checked in ${logged} of the last 7 days`,
    rhythmEmpty: "Your rhythm starts the first time you check in.",
    rhythmCount: (logged: number) => `Checked in ${logged} of the last 7 days.`,
    howYouveBeen: "How you've been",
    closingLine: "However today went, you brought it here. That counts.",
    /**
     * "Elara today" — one line per day, picked by the date, so the cue changes
     * daily and is the same all day. DRAFT lines, for Ale to approve.
     */
    cues: [
      "However today went, you brought it here. That counts.",
      "You don't have to solve it today. Noticing it is a start.",
      "Small and honest beats big and someday.",
      "What you avoid gets heavier. What you look at gets smaller.",
      "Your pace is the right pace.",
      "Money is a story you can edit, one line at a time.",
      "You're allowed to want more and to be proud of what you have.",
    ],
    /** Done for today (spec §5): the path card after today's practice. */
    dayDone: (week: number, day: number) => `Week ${week} · Day ${day} done`,
    opensToday: (week: number, day: number, time: string) => `Week ${week} · Day ${day} opens today at ${time}`,
    opensTomorrow: (week: number, day: number, time: string) =>
      `Week ${week} · Day ${day} opens tomorrow at ${time}`,
    opensOn: (week: number, day: number, weekday: string, time: string) =>
      `Week ${week} · Day ${day} opens ${weekday} at ${time}`,
    /**
     * The next day opens at her midnight (fix list #1), where "opens tomorrow
     * at 12:00 AM" reads like a system notice. Said as an invitation instead,
     * with the next practice's title as the reason to come back.
     */
    comeBackTomorrow: "Come back tomorrow",
    nextPractice: (week: number, day: number, title: string) => `Week ${week} · Day ${day}: ${title}`,
    talkToElara: "Talk to Elara",
    /** On a finished day: walk it again from its first question, her answers kept to edit. */
    redoToday: "Do today again",
    /** Under it: what happens to her words when she does. */
    redoNote: "Your answers stay. Anything you change replaces what you wrote.",
    /** Path finished (beta). */
    shareHowItWent: "Share how it went",
    seeWhereNow: "See where you are now",
    /** The Week 1 intro video, first in the From Alejandra row. */
    weekVideo: (week: number) => `Week ${week} intro`,
    weekVideoA11y: (week: number) => `Week ${week} intro video. Opens the player.`,
    /** The wordmark. A proper noun — the same in every language. */
    wordmark: "Elara",
    /**
     * The masthead date on every tab: "Monday · Oct 5" (set in capitals by the
     * eyebrow). The names come from `Intl` (`mastheadParts`); the order is the
     * language's, fixed here rather than left to the phone's region.
     */
    mastheadDate: (weekday: string, day: number, month: string) => `${weekday} · ${month} ${day}`,

    /* ── Sep export fidelity pass ─────────────────────────────────────────── */
    /** The masthead's share control. It shares the morning cue — the one
     *  thing on this screen written to leave it. */
    shareToday: "Share today's line",
    /** The cue in quotation marks: Elara is speaking. */
    cueQuoted: (line: string) => `\u201C${line}\u201D`,
    /** Cross-day memory: one sentence she wrote on an earlier day, in her own words. */
    memoryEyebrow: { yesterday: "Yesterday you said", days: "A few days ago you said", earlier: "Elara remembers" },
    memoryA11y: (day: number, line: string) => `Elara remembers, from day ${day}: ${line}`,
    /** Welcome back after two or more days away. One sentence; nothing is reset or counted. */
    reentry: { soft: "Good to see you again.", full: "You’re back. You haven’t lost anything. We pick up from here." },
    /** The row above the hero's seven segments. */
    yourPath: "This week",
    /** "Current focus: Money" — the area word is set in ember, so the lead is
     *  its own string rather than a template around it. */
    clarityFocusLead: "Current focus:",
    /** Beside the path's name inside the Clarity card. */
    clarityActive: "Active",
    /** The audio row. Headed with the guides' author when they share one. */
    audioFrom: (name: string) => `From ${name}`,
    // Voice notes and videos share the row, so the label names neither.
    audioEyebrow: "Guides",
    audioCount: (n: number) => `${n} ${n === 1 ? "guide" : "guides"}`,
    /** The length badge on an audio card's cover. */
    audioLength: (n: number) => `${n} min`,
    listenGuide: "Listen",
    watchNote: "Watch video note",
    /** Today's progress label: "Week 1 · 2 of 7" (spec §5). */
    weekProgress: (week: number, day: number, total: number) => `Week ${week} · ${day} of ${total}`,
    /** The first Today after onboarding: one line from her summary, headed by this. */
    welcomeEyebrow: "Where you're starting",
    welcomeDismiss: "Close the welcome",
    /** The audio guide sheet opened from the From Alejandra row. */
    guideSheetA11y: (title: string) => `${title}, audio guide`,
    guideOpenDetail: "About this guide",
    guideLoadFailed: "This guide didn't load. Try again in a moment.",
    /** The streak pill is a door to the rhythm screen. */
    streakOpenA11y: (days: string) => `Your rhythm, ${days}. Opens your milestones.`,
  },

  /**
   * Today's world and Paths' shelf (Oct 7 2026, "The Week World" + "Shelf of
   * Worlds"). The landscape carries the progress; these words only name it.
   * Never a count of what she has not done, never a score.
   */
  /**
   * "Get help now" at the close of Today: opens the same help screen as every
   * Circle safety note, so it is there with Circle off too.
   */
  helpNow: {
    title: "Get help now",
    detail: "Free support lines and what to do in an emergency.",
    /** The row's spoken label: what it is, then what it opens. */
    a11y: "Get help now. Opens support lines and what to do in an emergency.",
  },
  /**
   * "To pick back up": up to three ways back to what she already started.
   * Never a backlog: a step she chose reads as her choice, never as pending
   * or overdue, and nothing she wrote or said is quoted here.
   */
  resume: {
    title: "To pick back up",
    nextStep: "Your next step",
    /** "you chose it yesterday", "you chose it on Monday". */
    chose: (when: string) => `you chose it ${when}`,
    when: {
      today: "today",
      yesterday: "yesterday",
      /** "on Monday", "on Oct 3". */
      on: (day: string) => `on ${day}`,
    },
    talkItThrough: "Talk it through with Elara",
    conversation: "Conversation with Elara",
    pickUp: "Pick up where you left off",
    seeNote: "See the note",
    keptWeek: (week: number) => `Kept · Week ${week}`,
    keptOpen: "See it on your path",
    drawer: "Everything you kept, in your drawer",
  },

  journey: {
    /** "Money Clarity · Week 2", over the world's name. */
    eyebrow: (area: string, week: number) => `${area} · Week ${week}`,
    /** The world, walked to its end (Today, after its last day). */
    walkedTitle: (world: string) => `You walked ${world}`,
    /** Under a walked world on Today: where she goes next. */
    /** Over the next world's preview on a walked card. */
    nextEyebrow: "Up next",
    nextWorld: (world: string) => `Next: ${world}`,
    seePath: "See your path",
    seeWhereBeen: "See where you've been",
    /** The landscape, said aloud: what the orb on it means. */
    hereA11y: (world: string, where: string, day: number, total: number) =>
      `${world}. You are here: ${where}, day ${day} of ${total}.`,
    walkedA11y: (world: string) => `${world}, walked to the end.`,
    /** Everything on Today under the world. */
    alsoToday: "Also today",
    /* Paths */
    pathsTitle: "Your path",
    /** The shelf of worlds, in walking order. */
    shelf: "Your journey",
    shelfNote: "Each week is a place. The ones you've walked stay here.",
    /** A shelf row: "Week 1 · Walked". */
    weekStatus: (week: number, status: string) => `Week ${week} · ${status}`,
    /** A week whose days are not written yet. */
    beingWritten: "Being written. It opens when you get there.",
    /** The current world before its first day opens. */
    opensNext: "Its first day opens next.",
    /** Opens every day of the path, week by week: walked, today, and ahead. */
    allDays: (total: number) => `See all ${total} days`,
    hideAllDays: "Hide the days",
    /** A week's heading in that list: "Week 2 · Lantern Lake". */
    weekWorld: (week: number, world: string) => `Week ${week} · ${world}`,
    otherPaths: "Other paths",
    /** Under another path's picture: open to her now, or with membership. */
    otherOpen: "Ready when you are",
    otherLocked: "With membership",
    /* The week as seven pieces under the world (option C). */
    piecesPencilled: "Tomorrow's piece is pencilled in.",
    /** The key under the seven day markers. */
    legendDone: "Done",
    legendToday: "Today",
    legendAhead: "Ahead",
    piecesToday: "Today's piece is waiting for you.",
    piecesLaid: "Today's piece is laid.",
    piecesAll: "Every piece of this world is laid.",
    piecesA11y: (laid: number, total: number) => `${laid} of ${total} pieces of this world laid`,
    /** Under "How are you arriving?": the check-in colours the world's sky. */
    skyLine: "Your check-in paints today's sky.",
    /** Last week's world, kept on Today with her words. */
    kept: "Kept",
    keptWeek: (week: number, title: string) => `Week ${week} · ${title}`,
    yourRule: (text: string) => `Your rule: \u201C${text}\u201D`,
    yourWords: (text: string) => `Your words: \u201C${text}\u201D`,
    /** Paths' shelf: the current week's empty place. */
    landsHere: (world: string, day: number) => `${world} is kept here after Day ${day}`,
    beingBuilt: (day: number, total: number) => `You are here · Day ${day} of ${total}`,
    /** The badge on a members' week while the beta gives it away. */
    freeInBeta: "Free in beta",
    todayIs: (title: string) => `Today: ${title}`,
  },

  paths: {
    /** (Beta) Other life areas, locked until after the Money Clarity beta. */
    opensSoon: "Opens soon",
    opensSoonToast: (area: string, path: string) => `${area} opens soon. For now, it's ${path}.`,
    continueToday: "Continue today's practice",
  },

  day: {
    inYourWords: "In your words",
    placeholder: "In your own words…",
    onlyYou: "Only you can see this.",
    lockIn: "Lock this in",
    gotIt: "Got it",
    acceptContinue: "Accept and continue",
    markDone: "Mark as done",
    done: "Done ✓",
    needAMoment: "I need a moment",
    unpickFirst: "Unpick another first",
    /** The 1..N rating scale's own labels when the CMS gives none. */
    scaleLow: "Not at all",
    scaleHigh: "Completely",
    saveMicro: "SAVE",
    lockMicro: "LOCK",
    almostThere: (name: string) => `Almost there, ${name}`,
    buildingThis: (name: string) => `You're building this, ${name}`,
    open: "Open",
    atCap: (max: number) => `That's ${max}. Unpick one to choose another.`,
    pickUpTo: (max: number, chosen: number) => `Pick up to ${max} · ${chosen} chosen`,
    /* ── A day is a sequence of steps ─────────────────────────────────────── */
    /** The pill above the question, when the day has more than one step. */
    stepOf: (step: number, total: number) => `Step ${step} of ${total}`,
    /** Moves to the next question, once Elara has answered this one. */
    nextStep: "Next",
    /** The last step of a day that isn't the last day of the path. */
    finishDay: "Finish today",
    /**
     * Shown beside the typing dots while her reply is being written.
     *
     * "Reading", not "thinking" or "generating": it describes what is happening
     * from the member's side — somebody is taking in what they just wrote.
     */
    elaraThinking: "Elara is reading…",
  },

  complete: {
    /**
     * The eyebrow over the completion headline, addressed to the member.
     *
     * Was a hardcoded English template literal on the screen itself
     * (`Shine, ${name}`), so a Spanish member finishing a path was
     * congratulated in English.
     */
    shine: (name: string) => `Shine, ${name}`,
    eyebrow: "You did it",
    title: "First cycle complete",
    quote:
      '"Your clarity is a practice, not a destination. Today you built a stronger foundation."',
    seeClarity: "See your Clarity Assessment",
    choosePath: "Choose another path",
    returnToday: "Return to Today",
  },

  area: {
    /** The full path screen: seven days, one per row. */
    eyebrow: "Your personalized path",
    /**
     * The line under the path's name. Split in three because the middle part
     * is set in the brand colour. It no longer counts the plan's steps: a
     * member never sees a path total (fix list #7). Never rebuild this by
     * concatenating a translated noun onto a translated verb.
     */
    shapedPlan: {
      before: "Your check-in with Elara shaped this ",
      highlight: "plan",
      after: ".",
    },
    step: (week: number, day: number, level: string) => `Week ${week} · Day ${day} · ${level}`,
    /** The same, under its week's heading on Paths (the week is already said). */
    dayStep: (day: number, level: string) => `Day ${day} · ${level}`,
    /** A day already walked. Tapping it opens it again from its first question. */
    revisit: "Do again",
    doneA11y: (week: number, day: number) => `Week ${week}, day ${day}, complete. Tap to do it again.`,
    openA11y: (week: number, day: number) => `Week ${week}, day ${day}. Tap to open.`,
    aheadA11y: (week: number, day: number) => `Week ${week}, day ${day}, not open yet.`,
    lockedTitle: "This path is part of Premium",
    lockedBody: "Your free membership includes one path. Premium opens all six.",
    unlock: "Unlock with Premium",
    startPath: "Start my path",
    continueDay: (week: number, day: number) => `Continue · Week ${week} · Day ${day}`,
  },

  /* ── Hoy (Option B "Hoy" + the Final Pass, Oct 2026) ────────────────────
     The postcard of today's place, the week as seven discs, her words from
     the day before, and what else today holds. The Spanish is the client's
     proposal, pending approval by María and Alejandra; this English is ours. */
  hoy: {
    /** «Unos 4 minutos.»: the whole intro (Final Pass FX 9). From the day's authored minutes. */
    intro: (minutes: number) => `About ${minutes} minutes.`,
    /** A day open since before today and not started. Never a penalty. */
    missed: (day: number) => `Your day ${day} is waiting. Nothing is lost.`,
    /** "Wuzhen, China". */
    placeName: (name: string, country: string) => `${name}, ${country}`,
    placeLine: (place: string, week: number, day: number) => `${place} · Week ${week} · Day ${day}`,
    placeWeek: (place: string, week: number, weeks: number) => `${place} · Week ${week} of ${weeks}`,
    photoA11y: (place: string) => `A photograph of ${place}.`,
    dayDone: (day: number) => `Day ${day} done`,
    weekDoneTitle: (place: string) => `You finished your week in ${place}.`,
    pathDoneTitle: "You walked every week of this path.",
    /** When the next day or week opens, in her clock. */
    opens: {
      dayTomorrow: (day: number, weekday: string) => `Day ${day} opens tomorrow, ${weekday}.`,
      dayToday: (day: number, time: string) => `Day ${day} opens today at ${time}.`,
      dayOn: (day: number, weekday: string) => `Day ${day} opens on ${weekday}.`,
      weekTomorrow: (week: number, place: string, weekday: string) => `Week ${week}, ${place}, opens tomorrow, ${weekday}.`,
      weekToday: (week: number, place: string, time: string) => `Week ${week}, ${place}, opens today at ${time}.`,
      weekOn: (week: number, place: string, weekday: string) => `Week ${week}, ${place}, opens on ${weekday}.`,
    },
    /** The one entry's words (`useTodayEntry`): Hoy's button, and the same words wherever the entry is offered. */
    entry: {
      start: (day: number) => `Start day ${day}`,
      continue: (day: number) => `Continue day ${day}`,
      stepHint: (step: number, total: number) => `You're on step ${step} of ${total}. What you wrote is saved.`,
      review: "See what you answered",
      week: (place: string) => `See your week in ${place}`,
    },
    week: {
      title: (place: string) => `Your week in ${place}`,
      count: (done: number, total: number) => `${done} of ${total}`,
      countA11y: (done: number, total: number) => `${done} of ${total} days done`,
      today: "Today",
      discDone: (day: number, keepsake: string) => `Day ${day}: done, ${keepsake}`,
      discToday: (day: number) => `Day ${day}: today`,
      discAhead: (day: number) => `Day ${day}: not yet`,
      /** The week's name, as a sentence: "This week: look without judging." */
      theme: (title: string) => `This week: ${title}.`,
    },
    /**
     * What each day of a week keeps, by place, in day order. Only places with
     * their own keepsake art are listed; any other place names the day's stop.
     */
    keepsakes: {
      wz: ["paper lantern", "stone bridge", "Wuzhen boat", "cup of tea", "paper umbrella", "koi carp", "willow branch"],
    },
    /**
     * What she took away (the daily session, 3 Nov 2026): at the top of Today
     * when the day is done, under the new day when there is one. Her words
     * only; never a "None for now" or a question she passed.
     */
    takeaway: {
      today: (day: number) => `Today you take away · Day ${day}`,
      last: (day: number) => `Last time you noted · Day ${day}`,
      lastWeek: (week: number, day: number) => `Last time you noted · Week ${week} · Day ${day}`,
      quoted: (text: string) => `“${text}”`,
      openHint: "Opens that day's close",
    },
    forToday: {
      title: "For today",
      /** What a resource is, before its length: "Guide · 3 min read". */
      kinds: { video: "Short film", article: "Guide", audio: "Voice note", worksheet: "Exercise", link: "Link" },
      whereTitle: "See where you are",
      whereMeta: "Your six areas · 5 min",
      talkTitle: "Talk it through with Elara",
      talkMeta: "Ask her anything about today",
    },
  },
} as const;

/**
 * Streaks and milestones.
 *
 * Every line here is written as a *record of what happened*, never as a
 * score or a target. There is no "keep it up", no "don't break it", and
 * nothing that treats a reset as a loss — the spec rules out loss language
 * explicitly, and a wellbeing product that makes someone anxious about a
 * number has done the opposite of its job.
 */
export const milestones = {
  title: "Your rhythm",
  subtitle: "Days you showed up. A record, not a score.",

  /** The big number. */
  /** Milestones count days in a row, so the record says which number is which (O14). */
  currentLabel: "In a row now",
  days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
  /** Said instead of a number when the count is zero. No zero on screen. */
  noneYet: "Your rhythm starts the first time you check in.",
  /** After a gap. Warm, and never about what was lost. */
  restarted: "A new stretch. The days before it still count.",

  bestLabel: "Longest in a row",
  totalLabel: "Days in total",

  /** The ladder. */
  ladder: "Milestones · days in a row",
  reached: "Reached",
  reachedAt: (n: number) => `${n} days in a row`,
  next: "Next",
  ahead: "Ahead",
  /** Once every threshold is behind her. */
  allReached: "You've passed every one of them.",

  /** The cue on Today, shown only in the last few days before a threshold. */
  /** A record of coming back, never a countdown to a target. */
  /** Counts what the milestones count: days in a row. */
  cue: (n: number) => `You've come back ${n} ${n === 1 ? "day" : "days in a row"}. Your rhythm is here.`,
  cueA11y: (n: number) => `You've come back ${n} ${n === 1 ? "day" : "days in a row"}. Opens your rhythm.`,
  open: "See your rhythm",
  loadError: "Couldn't load your rhythm just now.",

  /* ── The milestone detail (Sep export) ──────────────────────────────────
     The most recent threshold she has reached, on full-bleed forest. Still a
     record: the bar under it is always full, because it only ever shows a
     milestone that already happened — never the distance to the next one. */
  detailTitle: "Milestone",
  /** Keyed by threshold (`STREAK_MILESTONES`). Words, not digits: this is the
   *  one line in the app written to be read slowly. */
  headline: {
    3: "Three days, three moments for yourself.",
    7: "Seven days, seven moments for yourself.",
    14: "Fourteen days, fourteen moments for yourself.",
    30: "Thirty days, thirty moments for yourself.",
    60: "Sixty days, sixty moments for yourself.",
    100: "A hundred days, a hundred moments for yourself.",
  },
  /** For a threshold added later without a line of its own. */
  headlineFallback: (n: number) => `${n} days, ${n} moments for yourself.`,
  /** Before any threshold is reached. No countdown, no target. */
  headlineNone: "Every rhythm begins with a single day.",
  care: "Each day you showed up was a deliberate act of care.",
  careNone: "The days you check in gather here, whenever they come.",
  progressLabel: "Milestone progress",
  progressOf: (n: number) => `${n} of ${n} completed`,
  backToJourney: "Back to journey",
} as const;
