// Elara · Money · Toward 10 (English, for the team)
// Translates content-es.mjs (the Spanish is the source copy).

export const ui = {
  lang: "en",
  brand: "ELARA / MONEY CLARITY",
  footer: "4 NOV 2026 / TOWARD 10 / ENGLISH",
  note: "Note",
  rule: "Today’s rule",
  ruleMine: "You take away",
  elara: "Elara",
  tryLab: "If you want to try it",
  tap: "On tap",
  supported: "(supported answer)",
  copy: "To copy",
  day7: "Day 7 · screen 4 (V3.2 updated)",
};

const rules = [
  "Before counting future income, confirm when it arrives.",
  "Money for a payment due soon shouldn’t depend on an investment going up.",
  "You can want to help and take time to check what you can manage.",
  "Look separately at the balance, the charges and the payment.",
  "The same amount can buy less when prices rise.",
  "High gains, “no risk” and pressure: pause and check before sending money.",
];

export const pages = [
  {
    eye: "TOWARD 10 / MONEY / ENGLISH",
    title: "What’s missing for a 10 isn’t on paper",
    sub: "V3.2 is ready to test. What would take it to a 10 is up to the women: whether a rule helps them outside the app, and whether they come back on day 8. Here are three pieces to get there.",
    parts: [
      {
        table: {
          head: ["Piece", "What for", "Pages"],
          rows: [
            ["The sign-ups", "What the beta forms say and what it changes for the test.", "2"],
            ["Test kit", "Test the week with 5-6 women, in the app or over WhatsApp, starting this week.", "3-6"],
            ["Week card", "Something concrete she takes outside the app.", "7"],
            ["Week 2", "So day 7 leads somewhere instead of just ending.", "8-10"],
          ],
        },
      },
      {
        h: "What only people can do",
        ul: [
          "Test and fix. One round with real women is worth more than another version of the document.",
          "Make the Spanish María’s and Ale’s, and have Ale record the audio.",
          "Have someone answer the questions the women write. Proposal: Ale, anonymously and with permission, in a weekly audio.",
          "Amounts, currency and the financial regulator for each country.",
        ],
      },
      {
        h: "Separate file",
        p: "“Mensajes_WhatsApp_Semana1_ES.txt”: all seven V3.2 days ready to copy and paste into WhatsApp, with the reply that matches each option.",
      },
    ],
  },
  {
    eye: "WHAT THE SIGN-UPS SAY",
    title: "162 sign-ups, and most didn’t choose money",
    sub: "Data from the two beta forms (wave 1: 147; wave 2: 15). Totals only: this document copies no names, emails, phone numbers or personal answers.",
    parts: [
      {
        table: {
          head: ["Data", "Wave 1", "Wave 2", "Total"],
          rows: [
            ["Chose “Claridad con dinero” first", "31", "2", "33 (20%)"],
            ["Mention money, including alongside other areas", "38", "2", "40 (25%)"],
            ["Use Android", "62", "6", "68 (42%)"],
            ["Live in Colombia (the largest group)", "53", "5", "58 (36%)"],
            ["Yes to the WhatsApp group", "121", "9", "130"],
            ["Yes to a 7-day test", "142", "14", "156"],
          ],
        },
      },
      {
        h: "What it changes for the test",
        ul: [
          "Pick the 5-6 from the 40 who mentioned money. Wave 2 has only 2.",
          "The beta only opens Money, but 4 in 5 sign-ups chose another area first (mainly purpose, routine and confidence). That matches what we already heard: some people stopped because only Money was available. Say so in the invitation, or open their area.",
          "42% use Android. If the test app is iPhone-only, way B (WhatsApp) is how to include them.",
          "Colombia is the largest group. There it’s «arriendo», not «alquiler», and bills are «los servicios». María decides whether the Spanish uses Colombian words or neutral ones.",
        ],
      },
      {
        h: "What the money group is looking for (themes, no quotes)",
        ul: [
          "Their relationship with money, and feeling deserving.",
          "Money not stretching far enough, and how to save without wasting.",
          "Consistency in tracking their spending.",
          "Changing jobs or countries, starting over, more income.",
          "Connecting purpose and money; for some, investing.",
        ],
      },
      { p: "Week 1 covers money not stretching, saving and investing. Missing: “relationship with money and deserving” and “more income or a job change”, both candidates for week 2, in Alejandra’s voice." },
    ],
  },
  {
    eye: "TEST KIT / 1 OF 4",
    title: "Who and how",
    parts: [
      {
        h: "Who",
        p: "5-6 women from the 40 who mentioned money when signing up, who differ from each other: fixed and variable income, someone with no income right now, with and without debt, sending money to family or not, on iPhone and on Android. Better if not all are close to María: friends tend to be polite.",
      },
      {
        h: "Two ways to run it",
        table: {
          head: ["Way", "When", "What María does"],
          rows: [
            ["A. In the app", "Once the devs load V3.2.", "Sends three follow-up messages and holds two conversations."],
            ["B. Over WhatsApp", "From this week.", "Each morning sends the day’s text, then replies with the prepared text for whatever she picks (separate file)."],
          ],
        },
      },
      {
        p: "A caution about way B: the women are talking to María, which changes the experience. It tests the content, not the app. If it lands much better with María, that tells you something too: a person’s presence matters.",
      },
      {
        h: "The week",
        table: {
          head: ["When", "What happens", "María’s time"],
          rows: [
            ["Day 0", "Invitation, consent and a short conversation (2 questions).", "10 min per person"],
            ["Days 1-7", "She does one day per day, 3-4 minutes.", "Way B: a few minutes a day"],
            ["Day 2, morning", "“Do you remember yesterday’s rule?”", "1 message"],
            ["Day 4, afternoon", "“Was there anything that made you want to stop?”", "1 message"],
            ["Day 5, morning", "“Do you remember yesterday’s rule?”", "1 message"],
            ["Day 8", "Closing conversation (6 questions).", "15 min per person"],
            ["After", "Fill in the record sheet and decide what to change.", "1 hour"],
          ],
        },
      },
    ],
  },
  {
    eye: "TEST KIT / 2 OF 4",
    title: "Messages ready to copy",
    parts: [
      {
        label: "Invitation",
        msg: "Hi, [name]. We’re testing some short money practices in Elara: 3-4 minutes a day for one week. We want to know what helps you and what doesn’t, and your opinion changes what we build. We don’t need amounts, screenshots or personal details, and you can stop whenever you like. Would you like to join?",
      },
      {
        label: "Consent",
        msg: "Before we start: we’ll ask you a few short questions by message and have two brief conversations. We won’t ask for amounts, screenshots or account details. What you tell us is summarised without your name. Nobody on the team will read what you write inside the app for this test. You can stop whenever you like, without explaining why. Do you agree?",
      },
      { p: "The team must be able to keep the line “Nobody on the team will read what you write inside the app”. If it can’t, remove it before sending." },
      { label: "Days 2 and 5, morning", msg: "Good morning, [name]. Before you open Elara: do you remember yesterday’s rule? Tell me in your own words. “I don’t remember” helps us too." },
      { label: "Day 4, afternoon", msg: "How’s it going? Was there anything these days that made you want to stop? Any answer helps." },
      { label: "If she stops replying", msg: "Thank you for what you did. If you’d like to tell us when you stopped and what was going on, it helps a lot. If not, that’s completely fine." },
    ],
  },
  {
    eye: "TEST KIT / 3 OF 4",
    title: "The exact questions",
    parts: [
      {
        h: "Day 0: short conversation (choose 2)",
        ul: [
          "“Think of the last time you made or put off a money decision. What were you trying to solve, and what did you do?”",
          "“When you opened Elara, what did you hope it would do for you?”",
          "“What money word or idea would you like someone to explain with an example?”",
        ],
      },
      {
        h: "Day 8: closing conversation",
        ul: [
          "“Without looking at the app: which rule are you taking with you? Explain it as you would to a friend.”",
          "“Which part gave you something you weren’t clear on before? If none, what was missing?”",
          "“Did you try any idea outside the app? No is a fine answer too.”",
          "“Did you feel the app took your answers into account? When?”",
          "“Which day would you open again, and which would you remove?”",
          "“If there were a week 2, what would you like it to be about?”",
        ],
      },
      {
        h: "How to listen",
        p: "Ask for a recent example. Accept “I don’t know”. Don’t finish her answer for her or correct it. If she already knows something, that isn’t a lack of interest: note it and think about a higher level.",
      },
      {
        h: "Care",
        ul: [
          "María doesn’t give financial advice during the test.",
          "If someone mentions serious debt or a possible scam: listen, don’t advise, and suggest her bank or her country’s financial regulator, as on day 6.",
          "Don’t copy private answers into groups or documents: summarise what repeats, without names.",
        ],
      },
    ],
  },
  {
    eye: "TEST KIT / 4 OF 4",
    title: "Record sheet and how to decide",
    sub: "One row per participant, no names. “Remembered the rule”: yes, partly or no.",
    parts: [
      {
        table: {
          head: ["", "Remembered the rule (day 2 / 5 / 8)", "Tried something outside?", "Stopped at", "What helped", "Would change", "Week 2 about"],
          rows: [["P1"], ["P2"], ["P3"], ["P4"], ["P5"], ["P6"]],
        },
        blank: true,
      },
      {
        h: "How to decide afterwards",
        ul: [
          "If 4 of 6 can say the rule in their own words on day 8, the rule works. If 2 or fewer can, rewrite the rules before anything else.",
          "If 2 or more stop on the same day, look at that day first.",
          "If nobody tried anything outside the app, change the “If you want to try it” lines.",
          "If several ask for the same topic, week 2 starts there.",
          "Six people aren’t statistics: this finds problems; it doesn’t prove results.",
        ],
      },
    ],
  },
  {
    eye: "WEEK CARD",
    title: "Something to take outside the app",
    sub: "After saving her rule on day 7, she can see a card with what she chose and save it as an image on her phone.",
    parts: [
      {
        phones: [
          {
            label: "If she saved things during the week",
            blocks: [
              {
                t: "wcard",
                head: "ELARA · MONEY · WEEK 1",
                items: [
                  ["My rule", rules[0], true],
                  ["My phrase", "I need to check my payments before naming an amount."],
                  ["I also saved", rules[3]],
                ],
                foot: "My week with Elara",
              },
              { t: "buttons", x: ["Save image", "Share"] },
              { t: "chips", x: ["Choose what appears"] },
            ],
          },
          {
            label: "If she saved nothing",
            blocks: [
              {
                t: "wcard",
                head: "ELARA · MONEY · WEEK 1",
                items: [
                  ["My rule", rules[1], true],
                  ["This week’s rules", rules.filter((_, i) => i !== 1).join(" · ")],
                ],
                foot: "My week with Elara",
              },
              { t: "buttons", x: ["Save image", "Share"] },
            ],
          },
        ],
      },
      {
        h: "Card rules",
        ul: [
          "She chooses what appears: each line can be removed before saving.",
          "Amounts, names and her open question never appear.",
          "The image is created on her phone. “Share” opens the phone’s options; Elara publishes nothing.",
          "If she saved nothing, the card shows the rule she chose today and the week’s other rules. It’s never empty.",
          "For the devs: the app already has a card that saves to photos and shares; this one can reuse it.",
        ],
      },
    ],
  },
  {
    eye: "WEEK 2 / 1 OF 3",
    title: "Day 7 no longer just ends",
    sub: "V3.2 is updated: at the close of day 7, she picks what she wants to learn, Elara tells her which day covers it and offers her week card.",
    parts: [
      { day7: true },
      {
        h: "Why this way",
        ul: [
          "Week 2 has a fixed order, like week 1: today’s app doesn’t change the order per person.",
          "Her choice doesn’t reorder anything: it tells her when her topic arrives. That’s honest, and it can be built today.",
          "If she picks investing, Elara reminds her the cushion comes first: that’s the rule from week 1, day 2.",
        ],
      },
    ],
  },
  {
    eye: "WEEK 2 / 2 OF 3",
    title: "Seven days, seven rules",
    sub: "Same format as week 1: four screens, one rule, an example with checked numbers and one optional idea to try. An outline for María to choose topics and order.",
    parts: [
      {
        table: {
          head: ["Day", "Topic", "Today’s rule", "The example"],
          rows: [
            ["1", "A cushion for emergencies", "A cushion starts small, with a purpose and a separate place.", "Setting aside US$10 a week: in 18 weeks that’s US$180, one month of Ana’s rent."],
            ["2", "More than one debt: which first?", "Before deciding which debt to pay first, compare how much interest each one charges.", "An extra US$50 on a debt at 40% a year avoids about US$20 of interest in a year; on one at 15%, about US$7.50."],
            ["3", "A debt that grows on what it already grew", "An unpaid debt can grow on what it has already grown.", "US$100 at 30% a year, unpaid: US$130 after one year and US$169 after two."],
            ["4", "Charges that repeat on their own", "Check the charges that repeat on their own: small, repeated amounts add up.", "Three monthly charges of US$8, US$10 and US$12 are US$30 a month: US$360 a year."],
            ["5", "From buying from a company to owning a part", "Knowing the product isn’t the same as understanding the share.", "A fictional company: what part am I buying, and at what price? (V3 text)"],
            ["6", "What a gain does over time", "If a gain stays, the next calculation is made on more.", "US$100 at 5% a year for 20 years: US$265 if the gain stays; US$200 if not."],
            ["7", "Review and week-2 card", "The one she chooses.", "Two recall questions (days 2 and 4) and her card."],
          ],
        },
      },
      { p: "The percentages are examples, not real rates in any country. The debt calculations use simplified annual interest; every contract calculates its own way." },
    ],
  },
  {
    eye: "WEEK 2 / 3 OF 3",
    title: "Each day’s question and what’s missing",
    parts: [
      {
        table: {
          head: ["Day", "Screen-2 question", "Supported answer", "If you want to try it"],
          rows: [
            ["1", "You set aside US$10 a week. How many weeks to reach US$180?", "18 weeks (10 × 18 = 180).", "Choose a separate place for your cushion, even if it starts small."],
            ["2", "You have an extra US$50. One debt charges 40% a year, another 15%. Where do you avoid more interest in a year?", "The 40% one: about US$20, against US$7.50.", "If you have debts, check what interest each one charges."],
            ["3", "US$100 at 30% a year, unpaid. How much at the end of year two?", "US$169 (130 × 1.30).", "Check your statement to see whether interest is added to the balance."],
            ["4", "Three monthly charges of US$8, US$10 and US$12. How much a year?", "US$360 (30 × 12).", "Look at last month and mark the charges that repeat on their own."],
            ["5", "Which question looks at the company as an investment?", "What part am I buying, and at what price?", "Think of a company you use and write how you think it makes money."],
            ["6", "US$100 at 5% for 20 years. How much if the gain stays?", "US$265 (against US$200 if it doesn’t).", "When you see a gains figure, ask: over how long, and with what risk?"],
          ],
        },
      },
      {
        h: "An important day-2 reply",
        p: "If she taps “I’d rather pay off the smallest first”: “That’s a valid decision too: closing a debt gives you momentum. The one with the most interest usually costs less over time; it’s your choice.”",
      },
      {
        h: "Before building it",
        ul: [
          "Today week 2 is closed to anyone without beta access: the known week-2 blocker. It must be fixed before day 7 announces week 2.",
          "María decides the topics and the order. If the test asks for another topic, change it here.",
          "Every reply is written in advance, as in week 1.",
        ],
      },
    ],
  },
];
