/**
 * Everything behind the Profile tab: the profile itself, Settings and all of
 * its detail screens, membership and the paywall, and the two screens that
 * report back what Elara has noticed.
 */
export const account = {
  profile: {
    /** Profile as "Your Letter Drawer": a private place where Elara keeps what mattered. */
    drawer: {
      greeting: (name: string) => `Dear ${name},`,
      greetingNoName: "Dear you,",
      line: "What you share with me, I keep here.",
      /** Day one, nothing kept yet: the same promise, in the future. */
      lineEmpty: "What you share with me, I'll keep here.",
      privateNote: "Private to you",
      noteEyebrow: "A note Elara kept",
      noticed: (when: string) => `Noticed ${when}`,
      noteA11y: (note: string, when: string) => `A note Elara kept: ${note}. Noticed ${when}. Opens what Elara remembers.`,
      noteEmptyTitle: "No notes kept yet.",
      noteEmptyBody: "When Elara notices something important on your path, it will appear here.",
      remembers: "What Elara remembers",
      notes: "Kept notes",
      notesCount: (n: number) => (n === 1 ? "1 note" : `${n} notes`),
      pictures: "Clarity pictures",
      picturesCount: (n: number) => (n === 1 ? "1 picture" : `${n} pictures`),
      picturesNone: "Take the first",
      phrases: "Sentences you kept",
      openedPaths: "Opened paths",
      weekWord: "Week",
      pathWeek: (week: number) => `Week ${week}`,
      pathA11y: (name: string, week: number) => `${name}, week ${week}. Opens it in your Atlas.`,
      more: "More in your drawer",
      settingsTab: "Settings",
      membershipTab: "Membership",
    },
    /** Your Clarity (spec §11): the latest picture as six areas. */
    clarityTitle: "Your Clarity",
    seePicture: "See my Clarity picture",
    /** Your path: where she is, and one tap back into it. */
    yourPath: "Your path",
    pathDay: (week: number, day: number) => `Week ${week} · Day ${day}`,
    yourCollection: "Your collection",
    /** The avatar row: who you are, and that tapping it edits you. */
    /** Stands in for the name on a profile that has not been given one. */
    youFallback: "You",
    editA11yNamed: (name: string) => `${name}, edit your profile`,
    editA11y: "Edit your profile",
    settingsA11y: "Settings",
    changePhoto: "Change photo",
    uploading: "Uploading…",
    daysInPractice: (n: number) => `${n} ${n === 1 ? "day" : "days"} in practice`,
    rhythm: "Your rhythm",
    checkInsLogged: (n: number) => `${n} ${n === 1 ? "check-in" : "check-ins"} logged`,
    rhythmEmpty: "Check in each day and your rhythm will take shape here.",
    rhythmQuote: "Every check-in is a small act of showing up for yourself.",
    /**
     * Split, because the streak count is styled in brand colour mid-sentence.
     * Spanish moves the number, so the two halves are what each language needs
     * rather than a prefix/suffix that only works in English word order.
     * States what happened, never what it means (client fix list #18): a
     * streak is attendance, not an outcome.
     */
    streakToday: "You checked in today.",
    streakYesterday: "You checked in yesterday.",
    streakBefore: "You've checked in ",
    streakCount: (days: number) => `${days} days in a row`,
    streakAfter: ".",
    deltaThisWeek: (delta: number) => `${delta > 0 ? "+" : ""}${delta} this wk`,
    chartA11y: "Your last seven days.",
    chartDayA11y: (day: string, mood: string) => `${day}, ${mood.toLowerCase()}`,
    checkedIn: "Checked in",
    noCheckIn: "No check-in",
    moods: {
      good: "Good",
      okay: "Okay",
      stressed: "Stressed",
      heavy: "Heavy",
    },
    /**
     * Both arrays are indexed by `Date.getDay()` — Sunday at 0 — so the column
     * a member sees and the day a screen reader announces can never disagree.
     * Not sorted for reading order; sorted for the lookup that uses them.
     */
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    weekdayInitials: ["S", "M", "T", "W", "T", "F", "S"],
    sections: {
      practice: "Your practice",
      circle: "Your circle",
      settings: "Settings",
    },
    rows: {
      howYouveBeen: "How you've been",
      clarity: "Clarity Assessment",
      myPaths: "My Paths",
      messages: "Messages",
      requests: "Connection requests",
      circles: "Circles",
      dailyReminder: "Daily reminder",
      notifications: "Notifications",
      privacy: "Privacy",
      membership: "Membership",
      allSettings: "All settings",
    },
    /** The journey card — where she is, in three numbers and a line. */
    journeyStatus: "Your journey",
    /** The card's badge: days in practice. */
    pathsCompleted: "Paths completed",
    reflections: "Reflections",
    percent: (n: number) => `${n}%`,
    accountSections: {
      accountMembership: "Account & Membership",
    },
    clarity: {
      title: "Clarity Assessment",
      lastTaken: (date: string) => `Last taken ${date}`,
      notTaken: "Not taken yet",
      retake: "Retake",
      take: "Take it",
      retakeA11y: "Retake the Clarity Assessment",
      takeA11y: "Take the Clarity Assessment",
      historyA11y: (date: string) =>
        `Clarity Assessment, last taken ${date}. Opens your past results.`,
    },
    membershipRow: {
      title: "Membership",
      /** "Active · Yearly plan" — the status, then which plan. */
      sub: (status: string, plan: string) => `${status} · ${plan}`,
      plan: (interval: string) => `${interval} plan`,
    },
  },

  editProfile: {
    title: "Edit Profile",
    identity: "Identity",
    displayName: "First name",
    bio: "Short bio (optional, shown in Circles)",
    bioPlaceholder: "A line about you, for the people in your Circles",
    city: "City (optional)",
    cityPlaceholder: "Hyderabad",
    saving: "Saving…",
    saveError: "Couldn't save changes.",
    saved: "Saved",
    discardTitle: "Discard changes?",
    discardBody: "What you changed here hasn't been saved.",
    discardConfirm: "Discard",
    photoError: "Couldn't update photo.",
    photoDenied: "Photo access is off. Enable it in Settings to change your picture.",
    /**
     * The reassurance under the form: what a profile never carries. "Path
     * answers", not the mock's "reflections" — in Elara a reflection is also
     * what she posts to a circle, which *is* shared, and this line is a promise.
     */
    neverShared: "Your Clarity, your path answers, and your chats with Elara are never shared.",
  },

  /**
   * Create Account, as the Sep redesign draws it. Here rather than beside the
   * rest of `auth` because this pass owns the account namespace; the older
   * `auth.createAccount` keys still carry the legal line and the errors.
   */
  signUp: {
    eyebrow: "Save your progress",
    title: "Create your account",
    body: "Save your Clarity and keep your daily practices synced.",
    name: "Your name",
    /** The tag on a field that can be left empty. */
    optional: "Optional",
    namePlaceholder: "What should Elara call you?",
    email: "Email address",
    password: "Password",
    passwordHint: "At least 8 characters.",
    apple: "Continue with Apple",
    google: "Continue with Google",
    submit: "Create account & continue",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    /** Header action: start as a guest, save later. */
    skip: "Skip for now",
    skipFailed: "Couldn't continue without an account. Check your connection and try again.",
    emailTaken: "That email already has an account. Sign in instead.",
    /** Under the email field, once she leaves it. */
    emailInvalid: "That doesn't look like an email address. Check it and try again.",
    socialTaken: (provider: string) =>
      `That ${provider} account already has an Elara account. Sign in with it instead.`,
    /** Read out while the button shows its check. */
    saved: "Saved",
    // Beta invites (round 2). Spanish is a draft: docs/COPY-DRAFT-ROUND2-AUTH.md.
    invite: "Invite code",
    invitePlaceholder: "The code in your invitation",
    inviteHelp: "Elara is invite-only for now. Use the code we sent you.",
    inviteRequired: "You need an invite code to create an account.",
    inviteInvalid: "That code doesn't work. Check it, or ask whoever invited you for a new one.",
    emailUnavailable: "We can't send emails right now, so we can't create accounts yet. Try again later.",
  },

  /** A "Skip for now" guest: everything works, nothing is saved to an email yet. */
  guest: {
    rowLabel: "Save your progress",
    rowTrailing: "Not saved yet",
    logoutTitle: "Sign out without saving?",
    logoutBody:
      "You haven't created an account yet, so what you've done in Elara can't come back after you sign out.",
    logoutConfirm: "Sign out anyway",
    logoutSave: "Save my progress",
    dayOne: {
      title: "Save your progress",
      body: "Day 1 lives only on this phone for now. Create an account and it stays with you.",
      cta: "Create account",
      later: "Not now",
    },
    signInNote: "Signing in to an existing account replaces what you've done on this phone.",
  },

  settings: {
    title: "Settings",
    /** A preference whose write failed: it is shown as the server still has it. */
    prefSaveError: "Couldn't save that, so it's back the way it was.",
    /**
     * The three groups of the Sep 2026 export. What the member controls, what
     * Elara keeps about her, and the account itself.
     */
    sections: {
      preferences: "Preferences",
      dataPrivacy: "Data & privacy",
      accountSupport: "Account & support",
    },
    subscription: "Membership",
    email: "Email",
    changePassword: "Change password",
    passwordSending: "Sending…",
    passwordSent: "Link sent",
    passwordError: "Try again",
    passwordSendFailed: "Couldn't send the reset link.",
    resetNotice: (email: string) => `We sent a password reset link to ${email}.`,
    resetNoticeFallback: "We sent a password reset link to your email.",
    dailyReminder: "Daily reminder",
    notifications: "Notifications",
    haptics: "Haptic feedback",
    guidePersonality: "Guide Personality",
    elarasVoice: "Elara's Voice",
    privacy: "Privacy",
    howThisWorks: "Help",
    contactSupport: "Contact support",
    /** The reminder row when she wants one but the phone has notifications off. */
    notificationsOff: "Notifications are off",
    notificationsOffA11y: "Opens your phone's settings",
    /** The reminder row before the phone has ever been asked: tapping asks, here. */
    turnOnA11y: "Asks your phone to allow Elara's notifications",
    /** Membership, for a tester whose access we granted rather than sold. */
    betaAccess: "Beta access",
    /** Help's email. */
    mailSubject: "Elara help",
    mailFailed: (email: string) => `Couldn't open your email app. Write to us at ${email}.`,
    supportUnread: (n: number) => `${n} new`,
    terms: "Terms of Use",
    privacyPolicy: "Privacy Policy",
    deleteAccount: "Delete account",
    logOut: "Sign out",
    version: (version: string) => `Elara Neural Guide · v${version}`,
    voiceSheet: {
      title: "Elara's voice",
      body: "How she sounds when she speaks aloud. Press play to hear each one.",
      footer: "This is the voice she uses in Audio mode.",
      playA11y: (label: string) => `Hear the ${label} voice`,
      stopA11y: (label: string) => `Stop the ${label} sample`,
    },
    personalitySheet: {
      title: "Guide personality",
      body: "How Elara speaks with you in the guide chat.",
    },
    /** Must match the keys the API's chat service knows (`GUIDE_PERSONALITIES`). */
    personalities: {
      sage: {
        label: "The Sage",
        blurb: "Calm and unhurried. Sits with you before suggesting anything.",
      },
      coach: {
        label: "The Coach",
        blurb: "Direct and encouraging. Always lands on one next step.",
      },
      friend: {
        label: "The Friend",
        blurb: "Warm and informal. Validates first, advises lightly.",
      },
      scholar: {
        label: "The Scholar",
        blurb: "Curious and precise. Explains the why in a sentence.",
      },
    },
    /**
     * The voice names in `GUIDE_VOICES` are proper nouns and stay as they are;
     * only the one-line description of each is translated.
     */
    /** The audition button on a voice row — it names which voice. */
    hearVoice: (name: string) => `Hear the ${name} voice`,
    stopSample: (name: string) => `Stop the ${name} sample`,
    voices: {
      luna: "Warm, unhurried",
      asteria: "Brighter, quicker",
      athena: "Lower, steady",
    },
    languageSheet: {
      title: "Language",
      body: "Elara's screens, her replies, and your daily reminder all follow this.",
    },
  },

  reminders: {
    title: "Daily reminder",
    body: "One nudge a day to check in with yourself. It's scheduled on this phone, so it doesn't need a connection.",
    eveningCheckIn: "Evening check-in",
    summaryOff: "No reminder is scheduled.",
    summaryOn: "You'll be reminded every day.",
    summaryBlocked: "Your phone is blocking Elara's notifications, so this can't arrive.",
    summaryAsk: "Not scheduled yet. Your phone hasn't allowed Elara's notifications.",
    allow: "Allow notifications",
    openSettings: "Open phone settings",
    allowHint: "One tap, then the reminder starts arriving.",
    blockedHint: "Elara can't ask again, so turn notifications on for Elara there.",
    reminderTime: "Reminder time",
    reminderTimeHint: "When the nudge arrives.",
    everythingElse: "Everything else",
    notifications: "Notifications",
    notificationsHint: "Messages, connection requests, and circle activity.",
    footnote:
      "If reminders never arrive, your phone may be blocking Elara's notifications in the Settings app.",
    timeSheetTitle: "Reminder time",
    timeSheetBody: "When the evening check-in nudge arrives.",
    saveError: "Couldn't save that, so your reminder is back the way it was.",
  },

  notifications: {
    title: "Notifications",
    master: "Push notifications",
    masterHintBlocked: "Your phone is blocking Elara's notifications, so none of these can arrive.",
    masterHintAsk: "Your phone hasn't allowed Elara's notifications yet, so none of these can arrive.",
    masterHint: "The master switch. Off means nothing reaches this phone.",
    whatReaches: "What reaches you",
    turnOnToChoose: "Turn push notifications back on to choose between these.",
    digestNote:
      "Reactions to your reflections arrive as one quiet summary a day, never one at a time.",
    allow: "Allow notifications",
    openSettings: "Open phone settings",
    allowHint: "One tap, and these start arriving.",
    blockedHint: "Elara can't ask again, so turn notifications on for Elara there.",
    saveError: "Couldn't save that just now.",
    /**
     * Mirrors `PUSH_PREF_LABELS` in @elara/shared, which stays where it is for
     * the admin panel and the server's own fallbacks. Mobile reads these
     * instead: the shared package has no notion of which language this phone
     * is in, and a member who chose Spanish was getting four English rows in
     * the middle of a Spanish screen.
     */
    kinds: {
      direct_message: { label: "Messages", hint: "When a connection sends you a message." },
      connection_request: {
        label: "Connections",
        hint: "Requests to connect, and when one is accepted.",
      },
      circle_reflection: {
        label: "Circle activity",
        hint: "New reflections in your circles, and reactions to yours.",
      },
      event_reminder: {
        label: "Workshop reminders",
        hint: "A day before, an hour before, and when the room opens, for workshops you have a place at.",
      },
    },
  },

  privacy: {
    title: "Privacy",
    body: "Your reflections are always yours. These control what the rest of your circle sees alongside them.",
    sections: {
      visible: "What others can see",
      reach: "Who can reach you",
      data: "Your data",
    },
    showCity: "Show my city",
    showCityHint: "Appears on your member profile.",
    showPath: "Show the path I'm walking",
    showPathHint: "Other members see which path you're on. Turn it off to keep it to yourself.",
    allowMessages: "Allow direct messages",
    allowMessagesHint: "Off means no one can start a new conversation with you.",
    blocked: "Blocked members",
    blockedHint: "People whose reflections you won't see.",
    memory: "What Elara remembers",
    memoryHint: "The notes she keeps about you, and how to delete any of them.",
    policy: "Privacy Policy",
    policyHint: "How your data is stored and used.",
    saveError: "Couldn't save that just now.",
    /** The one-word row summaries on Settings and Profile. */
    summary: {
      open: "Open",
      private: "Private",
      dmsOn: "DMs on",
      dmsOff: "DMs off",
    },
  },

  membership: {
    /** The access letter (Premium): membership said as a letter, not a billing form. */
    letter: {
      eyebrow: "Elara · membership",
      open: "Your membership is open: every path and every Circle.",
      renews: (date: string) => `It renews on ${date}.`,
      until: (date: string) => `Your access lasts until ${date}.`,
      granted: "Everything in Premium, on us while Elara is in beta.",
    },
    title: "Membership",
    currentPlan: "Current Plan",
    active: "Active",
    /**
     * The subscription status, said in words.
     *
     * The screen used to print `sub.status` straight out of the DTO with a
     * `textTransform: capitalize` on it, which renders the raw enum — so a
     * Spanish member read "Active" under "ESTADO". A status is a fact about
     * their account, not an identifier, and it has to be translated like one.
     */
    statusLabels: {
      active: "Active",
      grace: "Payment pending",
      expired: "Expired",
      revoked: "Cancelled",
      none: "Free",
    },
    /** The one-word tier, for a badge too small to hold the full name. */
    premiumBadge: "Premium",
    premiumName: "Elara Premium",
    premiumBlurb: "Unlimited access to all paths & Circles.",
    /** The plan card for a tester whose access we granted (`source: "granted"`). */
    betaBlurb: "Everything in Premium, on us while Elara is in beta.",
    /** The same line with the billing interval in front of it. */
    premiumBlurbWithInterval: (interval: string) =>
      `${interval} · unlimited access to all paths & Circles.`,
    freeName: "Free Plan",
    freeBlurb:
      "The first week of your path is included. Upgrade for all areas, the Circle, and live sessions.",
    unlock: "Unlock Premium",
    updatePayment: "Update Payment Method",
    nextRenewal: "Next Renewal",
    accessUntil: "Access Until",
    status: "Status",
    accountSettings: "Account Settings",
    restore: "Restore Purchases",
    restoring: "Restoring…",
    restored: "Your membership was restored.",
    noPurchase: "No purchase found.",
    restoreFailed: "Couldn't restore purchases.",
    manage: "Manage subscription",
    manageFailed: "Couldn't open your store subscriptions.",
    help: "Help & Support",
    terms: "Terms of Use",
    privacyPolicy: "Privacy Policy",
    notOnSale: "Memberships aren't on sale right now.",
    /** Billing intervals, derived from store metadata (`lib/planLabels.ts`). */
    intervals: {
      yearly: "Yearly",
      monthly: "Monthly",
      weekly: "Weekly",
      lifetime: "Lifetime",
      fallback: "Membership",
    },
  },

  paywall: {
    /** The tracked label over the orb, in mint on forest. */
    eyebrow: "Membership",
    closeA11y: "Close",
    title: "Continue your daily clarity practice.",
    body: "Daily practices, voice reflection, and personalized guidance attuned to what is unfolding for you.",
    /**
     * What the membership actually is, before the prices. The design puts
     * these above the plans for a reason: the old screen asked for money
     * before it said what the money was for.
     *
     * Kept to what a membership really unlocks — workshops are open to
     * everyone and membership only discounts them, so this says "member
     * pricing", never "included".
     */
    included: {
      eyebrow: "What's included",
      items: [
        "The full Money Clarity path, week by week",
        "Voice reflections and replies from Elara",
        "Your collection, saved",
      ],
    },
    /** A plan's name, by billing interval (`packageLabel`'s key). */
    planNames: {
      yearly: "Annual",
      monthly: "Monthly",
      weekly: "Weekly Membership",
      lifetime: "Lifetime Membership",
      fallback: "Membership",
    },
    /**
     * A store introductory period, said as a length: "7 days", "1 month".
     * Keyed by the store's own unit (RevenueCat `periodUnit`).
     */
    periods: {
      DAY: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
      WEEK: (n: number) => `${n} ${n === 1 ? "week" : "weeks"}`,
      MONTH: (n: number) => `${n} ${n === 1 ? "month" : "months"}`,
      YEAR: (n: number) => `${n} ${n === 1 ? "year" : "years"}`,
    },
    /** The small line under an introductory price on the right of a plan. */
    firstPeriod: {
      DAY: (n: number) => (n === 1 ? "first day" : `first ${n} days`),
      WEEK: (n: number) => (n === 1 ? "first week" : `first ${n} weeks`),
      MONTH: (n: number) => (n === 1 ? "first month" : `first ${n} months`),
      YEAR: (n: number) => (n === 1 ? "first year" : `first ${n} years`),
    },
    introBadge: "Intro offer",
    trialBadge: (period: string) => `${period} free`,
    /** "$8.99 first month, then $14.99 / month". */
    introLine: (introPrice: string, first: string, price: string, unit: string) =>
      `${introPrice} ${first}, then ${price} ${unit}`.trim(),
    trialLine: (period: string, price: string, unit: string) =>
      `${period} free, then ${price} ${unit}`.trim(),
    free: "free",
    saveBadge: (pct: number) => `Save ${pct}%`,
    percentOff: (pct: number) => `${pct}% off`,
    /** "$125.90 billed annually ($10.49/mo)". */
    annualLine: (price: string, perMonth: string) => `${price} billed annually (${perMonth} / month)`,
    billedYearly: "billed yearly",
    billed: {
      perYear: "Billed yearly",
      perMonth: "Billed monthly",
      perWeek: "Billed weekly",
      once: "One payment",
    },
    startIntro: "Start with intro offer",
    startTrial: (period: string) => `Start my ${period} free`,
    cancelAnytime: "Cancel anytime. No lock-in commitment.",
    perYear: "/ year",
    perMonth: "/ month",
    perWeek: "/ week",
    start: "Start my Membership",
    continue: "Continue",
    working: "Working…",
    restore: "Restore Purchases",
    continueFree: "Continue with the free path",
    freeTitle: "Your free path is ready.",
    freeBody: "Memberships aren't on sale right now. Continue with the path we picked for you.",
    freeNote:
      "Free includes Week 1 of the one path we picked for you. Weeks 2+, Circle, live sessions and your guide stay locked.",
    freeNoteWithArea: (area: string) =>
      `Free includes Week 1 of your ${area} path. Weeks 2+, Circle, live sessions and your guide stay locked.`,
    noPlansToBuy: "No plans are available right now. Please try again later.",
    purchaseFailed: "Purchase failed.",
    /**
     * App Store guideline 3.1.2: length, auto-renew terms and both policy links
     * must appear *with* the purchase. Translated, because a disclosure nobody
     * can read is not a disclosure.
     */
    autoRenewDisclosure:
      "Payment is charged to your store account at confirmation of purchase. " +
      "Your membership renews automatically at the same price unless you turn off " +
      "auto-renew at least 24 hours before the period ends. Manage or cancel in " +
      "your account settings any time.",
    noPlans: "No membership plans are available right now. Please try again later.",
    loadFailed: "Couldn't load the membership plans. Check your connection and try again.",
    continueFailed: "Couldn't continue just now. Please try again.",
    activeButStuck: "Your membership is active, but we couldn't open the app. Please try again.",
    nothingToRestore: "No purchase found.",
    terms: "Terms of Use",
    privacyPolicy: "Privacy Policy",
  },

  memory: {
    title: "What Elara remembers",
    body: "A few things Elara keeps in mind so you don't have to repeat yourself. You can forget any of them, and she'll stop using it.",
    /** Group headings, from the kinds a note already has. Empty groups are never shown. */
    groups: { told: "What you've told Elara", patterns: "Patterns you've noticed", toward: "What you're working toward" },
    notesEmpty:
      "Nothing yet. She adds something only when it looks like it will still be true next month, and you'll see it here the first time she does.",
    /** Only dates the app has: when a note was first noticed. */
    noLongerCurrent: "No longer current · ",
    noticed: (when: string) => `Noticed ${when}`,
    said: (when: string) => `You said this ${when}`,
    when: {
      today: "today",
      yesterday: "yesterday",
      daysAgo: (n: number) => `${n} days ago`,
      monthsAgo: (n: number) => `about ${n} month${n === 1 ? "" : "s"} ago`,
    },
    forget: "Forget",
    forgetA11y: (note: string) => `Forget this: ${note}`,
    forgetTitle: "Forget this?",
    forgetStops: "Elara will stop using this in your conversations.",
    forgetFootnote:
      "She won't write it down again, even if you mention it later. Changing what a note says isn't available yet; if it's close but wrong, forget it and tell Elara in chat.",
    forgetConfirm: "Forget it",
    forgetKeep: "Keep it",
    forgetError: "Couldn't forget that just now.",
  },

  progress: {
    title: "How you've been",
    body: "A read on the last twelve weeks, drawn from your check-ins and what you've written. It's a mirror, not a measurement, and it only knows the weeks you were here.",
    /** The week's own line: how much showing up the numbers above rest on. */
    weekBasis: (activeDays: number, checkIns: number, percent: number) =>
      `${activeDays} active day${activeDays === 1 ? "" : "s"} · ${checkIns} check-in${
        checkIns === 1 ? "" : "s"
      } · based on ${percent}% of a full week`,
    trailA11y: (weeks: number) => `Mood over ${weeks} weeks.`,
    weekNoData: (week: string) => `Week of ${week}, no data`,
    weekScore: (week: string, score: number) => `Week of ${week}, ${score} out of 100`,
    empty:
      "Nothing to show yet. This fills in after your first full week, so check in on a few days and come back.",
    weekOf: (week: string) => `Week of ${week}`,
    weekAbout: "What that week was about",
    /**
     * The week's themes (`THEME_KEYS` in @elara/shared), as chips. A key the
     * app does not know yet is shown humanised rather than hidden.
     */
    themes: {
      money_pressure: "money pressure",
      debt: "debt",
      spending_shame: "spending guilt",
      income_worry: "income worries",
      self_criticism: "self-criticism",
      confidence: "confidence",
      identity: "identity",
      body_image: "body image",
      sleep: "sleep",
      fatigue: "tiredness",
      health: "health",
      overwhelm: "overwhelm",
      work_pressure: "work pressure",
      career_direction: "career direction",
      meaning: "meaning",
      feeling_stuck: "feeling stuck",
      relationship_strain: "relationship strain",
      loneliness: "loneliness",
      family: "family",
      boundaries: "boundaries",
      routine: "routine",
      time_pressure: "time pressure",
      home: "home",
      admin_backlog: "admin backlog",
      grief: "grief",
      change_transition: "change",
      comparison: "comparison",
    },
    loadFailed: "Couldn't load how you've been just now. Check your connection, then try again.",
    moodTwelve: "Mood, twelve weeks",
    /** The six wellbeing dimensions, named for a member rather than a model. */
    dimensions: {
      mood: { label: "Mood", hint: "How you said you felt." },
      stability: { label: "Steadiness", hint: "How much your days swung." },
      engagement: { label: "Showing up", hint: "Days you were here at all." },
      agency: { label: "Doing", hint: "Days and actions you finished." },
      connection: { label: "Reaching out", hint: "Times you spoke to someone." },
      outlook: { label: "Outlook", hint: "The tone of your own writing." },
    },
    /** Distinct from a zero — "we couldn't tell" and "it was bad" differ. */
    noReading: "—",
  },

  deleteAccount: {
    title: "Delete your account?",
    body: "This deletes your answers, your photos, your Clarity picture and everything Elara remembers, including her spoken replies. It can't be undone.",
    confirm: "Delete account",
    deleting: "Deleting…",
    cancel: "Keep my account",
    errorTitle: "Couldn't delete account",
    errorBody: "Your account is still here. Please try again in a moment.",
    /** Shown to everyone who isn't a store member. */
    storeNoteAnyone: (store: string) =>
      `If you ever bought a membership through ${store}, it's cancelled separately in your ${store} subscriptions.`,
    /** Shown to a member only. The store is "App Store" or "Google Play". */
    storeNote: (store: string) =>
      `Deleting your account doesn't cancel your membership. Cancel it in your ${store} subscriptions so you're not charged again.`,
    doneTitle: "Your account is deleted.",
    /**
     * What deletion actually does (docs/DATA-DELETION.md): names what is
     * removed and says what may remain. Never "everything".
     */
    doneBody:
      "Your account and your data in Elara, like your answers, photos, conversations, notes and read-aloud recordings, have been deleted. Some safety records and backups may be kept.",
    doneCta: "Close",
  },

  logout: {
    title: "Log out?",
    body: "Your progress and reflections will be safely stored here whenever you return.",
    confirm: "Log out",
    cancel: "Stay logged in",
    // DRAFT (beta hardening, 3 Nov 2026): when answers given on this phone have not reached her account yet.
    unsentTitle: "Log out without syncing?",
    unsentBody: "Some of your answers haven't reached your account yet. If you log out now, they'll be deleted from this phone.",
    unsentConfirm: "Log out anyway",
  },

  requestSent: {
    title: "Connection request sent",
    body: "You'll be able to chat if they accept. Until then, keep supporting each other through Circle reflections.",
    cta: "Return to Circle",
    /** The same body, naming who has to accept. */
    bodyNamed: (name: string) =>
      `You'll be able to chat if ${name} accepts your request. Until then, you can keep supporting each other through Circle reflections.`,
    viewProfile: "View Profile",
  },
} as const;
