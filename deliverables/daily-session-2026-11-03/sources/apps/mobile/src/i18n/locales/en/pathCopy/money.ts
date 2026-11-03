import type { PathCopy } from "../paths";

export const money: PathCopy = {
  label: "MONEY",
  name: "Money Clarity",
  areaName: "Money Clarity",
  tagline: "Untangle the pressure and mental load around your money.",
  days: [
    // ── Week 1 · Look without judging ──────────────────────────────────────
    {
      level: "Look without judging",
      title: "What would you like to understand about your money right now?",
      weekTitle: "Look without judging",
      intro: {
        title: "Look without judging",
        note: "Every question is optional, and nothing here asks you to contact anyone, spend money or share.",
      },
      payoff: "This week's takeaway: a picture of the situation and missing facts.",
      steps: {
        ask: {
          title: "What would you like to understand about your money right now?",
          body: "Choose one.",
          options: [
            "My income",
            "When it arrives",
            "What I need to pay",
            "My debts",
            "My independence",
            "Something else",
          ],
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "You chose “{ask}”. Write one question about it that you would like answered.",
          bodyFallback: "Write one question about your money that you would like answered.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Look without judging",
      title: "How does money currently come into your life?",
      steps: {
        ask: {
          title: "How does money currently come into your life?",
          body: "Choose any that fit. You can also pick none.",
          options: [
            "Employment",
            "Clients or sales",
            "Support from others",
            "Benefits",
            "Another source",
            "None right now",
          ],
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Mark confirmed versus uncertain income; do not count promises as received money.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Look without judging",
      title: "Which payments need your attention before money next arrives?",
      steps: {
        ask: {
          title: "Which payments need your attention before money next arrives?",
          body: "List up to three items; amounts are optional.",
          fields: ["Item 1", "Item 2", "Item 3"],
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Add a known date or “to confirm” beside each payment.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Look without judging",
      title: "What best describes the gap between income and essentials?",
      steps: {
        ask: {
          title: "What best describes the gap between income and essentials?",
          body: "Choose one.",
          options: [
            "Enough with some left",
            "Just enough",
            "Not enough",
            "It varies",
            "No income now",
            "Not sure yet",
          ],
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "You said “{ask|lower}”. Which part of that would you like to understand better?",
          bodyFallback: "Which part of the gap between your income and your essentials would you like to understand better?",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Look without judging",
      title: "What information would clarify a payment or income source?",
      steps: {
        ask: {
          title: "What information would clarify a payment or income source?",
          body: "A date, amount, frequency or contact; do not upload documents.",
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Who could tell you that for sure? Write the question you would ask them.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Look without judging",
      title: "How would you sketch the flow of money coming in and going out?",
      steps: {
        ask: {
          title: "How would you sketch the flow of money coming in and going out?",
          body: "Use arrows and categories, without account details. You can write a list instead.",
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Circle one point with missing information as a possible next step.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Look without judging",
      title: "What do you now know about your money that you want to keep handy?",
      nextWeekTitle: "Income and possibilities",
      letter: "This week was about “Look without judging”. What you wrote to keep: “{d7.ask}”. It is yours to reuse, change or leave. Next week: Income and possibilities.",
      letterFallback: "This week was about “Look without judging”. Whatever you answered, skipped or left for later is still yours: nothing here is a score. Next week: Income and possibilities.",
      steps: {
        ask: {
          title: "What do you now know about your money that you want to keep handy?",
          body: "One factual sentence, without judging yourself or promising change.",
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Keep your sentence beside one unresolved fact, without turning it into a promise.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    // ── Week 2 · Income and possibilities ──────────────────────────────────
    {
      level: "Income and possibilities",
      title: "Which part of your income would you like to explore first?",
      weekTitle: "Income and possibilities",
      intro: {
        title: "Income and possibilities",
        note: "Every question is optional, and nothing here asks you to contact anyone, spend money or share.",
      },
      payoff: "This week's takeaway: an opportunity criterion and a checkable question.",
      // The daily session (3 Nov 2026): English for the Spanish proposal, pending review.
      purpose: "Today you choose where to start looking at your income and turn it into something concrete to find out.",
      steps: {
        ask: {
          title: "Which part of your income would you like to explore first?",
          body: "Choose one.",
          options: [
            "Finding work",
            "Improving current work",
            "Following up a payment",
            "Exploring a service or sale",
            "Learning about support",
            "None for now",
          ],
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
          card: { label: "Your choice" },
        },
        take: {
          title: "To take with you",
          body: "What could you find out about this option? Write a question or a small step.",
          bodyFallback:
            "Is there something about your income you would like to understand better? If you want, write it as a question or a small step.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
          card: { label: "To take with you", hint: "A question or a small step" },
        },
      },
    },
    {
      level: "Income and possibilities",
      title: "What can you do that might be useful in an opportunity you are considering?",
      // The daily session (3 Nov 2026): English for the Spanish proposal, pending review.
      purpose: "Today you look for a concrete example in what you already know how to do and turn it into a sentence you could use.",
      steps: {
        ask: {
          title: "What can you do that might be useful in an opportunity you are considering?",
          body: "Give one concrete example, including informal experience.",
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
          card: { label: "What you know how to do" },
        },
        take: {
          title: "To take with you",
          body: "Turn your example into a line you could use to describe your experience.",
          bodyFallback:
            "Think of something you know how to do, at home or in informal work too, and write it as one sentence about your experience.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
          card: { label: "To take with you", hint: "A sentence about your experience" },
        },
      },
    },
    {
      level: "Income and possibilities",
      title: "What conditions would make an opportunity workable for you?",
      steps: {
        ask: {
          title: "What conditions would make an opportunity workable for you?",
          body: "Choose any that fit. You can also pick none.",
          options: [
            "Hours",
            "Caring responsibilities",
            "Transport",
            "Internet access",
            "No upfront payment",
            "Another condition",
          ],
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Mark one essential condition before spending time on an offer.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Income and possibilities",
      title: "What fact could you check before spending time on an opportunity?",
      steps: {
        ask: {
          title: "What fact could you check before spending time on an opportunity?",
          body: "For example: duties, hours, requirements or advertised pay. Checking is optional.",
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Note where you would check the fact and what remains unverified.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Income and possibilities",
      title: "What sentence could you use to ask about work, a price or an outstanding payment?",
      steps: {
        ask: {
          title: "What sentence could you use to ask about work, a price or an outstanding payment?",
          body: "Private draft: “I would like to confirm ___.” No need to send it.",
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Keep the draft; check that it asks for a specific fact without sensitive information.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Income and possibilities",
      title: "What would make you pause and check an offer more carefully?",
      steps: {
        ask: {
          title: "What would make you pause and check an offer more carefully?",
          body: "Choose one.",
          options: [
            "Pay first",
            "Guaranteed earnings",
            "Unclear duties",
            "Sensitive data too early",
            "Pressure to decide",
            "Another signal",
          ],
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "When you notice “{ask|lower}”, what would you check before going on? One signal alone does not prove fraud.",
          bodyFallback: "When an offer gives you pause, what would you check before going on? One signal alone does not prove fraud.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Income and possibilities",
      title: "Which income option, if any, deserves one more small check?",
      nextWeekTitle: "Decide with information",
      letter: "This week was about “Income and possibilities”. What you wrote to keep: “{d14.ask}”. It is yours to reuse, change or leave. Next week: Decide with information.",
      letterFallback: "This week was about “Income and possibilities”. Whatever you answered, skipped or left for later is still yours: nothing here is a score. Next week: Decide with information.",
      steps: {
        ask: {
          title: "Which income option, if any, deserves one more small check?",
          body: "Name an option and one missing fact. “None for now” is valid.",
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Define one check that requires no payment or sensitive information.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    // ── Week 3 · Decide with information ───────────────────────────────────
    {
      level: "Decide with information",
      title: "Which recent expense would you like to understand before deciding whether to change it?",
      weekTitle: "Decide with information",
      intro: {
        title: "Decide with information",
        note: "Every question is optional, and nothing here asks you to contact anyone, spend money or share.",
      },
      payoff: "This week's takeaway: a question about obligations and a decision criterion.",
      steps: {
        ask: {
          title: "Which recent expense would you like to understand before deciding whether to change it?",
          body: "Describe what it was for without giving the amount.",
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Name the need the expense met before judging it.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Decide with information",
      title: "What purpose did that expense, or another you remember, serve?",
      steps: {
        ask: {
          title: "What purpose did that expense, or another you remember, serve?",
          body: "Choose one.",
          options: [
            "An essential",
            "Work or care",
            "Enjoyment",
            "An unexpected need",
            "A commitment to someone",
            "Another purpose",
          ],
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "You said it was “{ask|lower}”. Will that need still be there next time?",
          bodyFallback: "Will the need behind that expense still be there next time?",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Decide with information",
      title: "Which recurring payment would you like to review to understand what it includes?",
      steps: {
        ask: {
          title: "Which recurring payment would you like to review to understand what it includes?",
          body: "Name the payment and what is unclear. This does not mean cancelling it.",
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Find or note where to see the item and terms; do not cancel on impulse.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Decide with information",
      title: "What would you like clarified about a debt or obligation, if you have one?",
      steps: {
        ask: {
          title: "What would you like clarified about a debt or obligation, if you have one?",
          body: "Choose one.",
          options: [
            "Balance",
            "Due date",
            "Instalment",
            "Interest or fees",
            "Terms",
            "Not applicable",
          ],
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Prepare a question about the chosen fact; if irrelevant, mark “no debt to review.”",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Decide with information",
      title: "What weighs most when you consider helping someone financially?",
      steps: {
        ask: {
          title: "What weighs most when you consider helping someone financially?",
          body: "Choose one.",
          options: [
            "My essentials",
            "An existing agreement",
            "Wanting to help",
            "Pressure I feel",
            "Limited freedom to decide",
            "Other or not applicable",
          ],
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Write what you would need to know before committing money; no confrontation required.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Decide with information",
      title: "What sentence could give you time before accepting a financial commitment?",
      steps: {
        ask: {
          title: "What sentence could give you time before accepting a financial commitment?",
          body: "For example: “I need to check what I can take on.” Only if safe to say.",
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Keep the sentence as a private draft.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Decide with information",
      title: "What consideration would you like to remember for your next money decision?",
      nextWeekTitle: "One concrete attempt",
      letter: "This week was about “Decide with information”. What you wrote to keep: “{d21.ask}”. It is yours to reuse, change or leave. Next week: One concrete attempt.",
      letterFallback: "This week was about “Decide with information”. Whatever you answered, skipped or left for later is still yours: nothing here is a score. Next week: One concrete attempt.",
      steps: {
        ask: {
          title: "What consideration would you like to remember for your next money decision?",
          body: "Something specific: check a date, total cost or essentials.",
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Reduce your criterion to a short check you can remember.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    // ── Week 4 · One concrete attempt ──────────────────────────────────────
    {
      level: "One concrete attempt",
      title: "Which small task could give you more clarity this week?",
      weekTitle: "One concrete attempt",
      intro: {
        title: "One concrete attempt",
        note: "Every question is optional, and nothing here asks you to contact anyone, spend money or share.",
      },
      payoff: "This week's takeaway: a bounded task, its result, or the actual barrier.",
      steps: {
        ask: {
          title: "Which small task could give you more clarity this week?",
          body: "Choose one.",
          options: [
            "Confirm income",
            "Clarify a payment",
            "Check an opportunity",
            "Organize notes",
            "Ask for information",
            "Leave it for now",
          ],
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "You chose “{ask}”. Afterwards, what would you write down about it? A fact, a reply or a short note is enough.",
          bodyFallback: "After a small task, what would you write down about it? A fact, a reply or a short note is enough.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "One concrete attempt",
      title: "What version of that task fits your available time and resources?",
      steps: {
        ask: {
          title: "What version of that task fits your available time and resources?",
          body: "If no task was chosen, name what you would need before choosing.",
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "What is the very first step? If something you need is missing, name it instead.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "One concrete attempt",
      title: "What reminder would help you return to your task without having to think it through from scratch?",
      steps: {
        ask: {
          title: "What reminder would help you return to your task without having to think it through from scratch?",
          body: "Optional: photograph a plain note; no names, amounts or account/card documents.",
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Create a reminder without financial information, as a photo or text.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "One concrete attempt",
      title: "What best describes the status of your task?",
      steps: {
        ask: {
          title: "What best describes the status of your task?",
          body: "Choose one.",
          options: [
            "Done",
            "Partly done",
            "Not yet",
            "Needs changing",
            "Set aside",
            "Did not choose one",
          ],
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "You said “{ask|lower}”. What is the next thing you would need to know? You can also write that you are stopping here for now.",
          bodyFallback: "What is the next thing you would need to know about your task? You can also write that you are stopping here for now.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "One concrete attempt",
      title: "What did you learn from the attempt, or what made it unworkable?",
      steps: {
        ask: {
          title: "What did you learn from the attempt, or what made it unworkable?",
          body: "Describe a fact, without judging your discipline.",
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Write what happened and, separately, what got in the way. No reply does not mean you did it badly.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "One concrete attempt",
      title: "What would you adjust for another attempt, if you want one?",
      steps: {
        ask: {
          title: "What would you adjust for another attempt, if you want one?",
          body: "Choose one.",
          options: [
            "Make it smaller",
            "Another source",
            "Another time",
            "Ask for support",
            "Change the task",
            "Stop for now",
          ],
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "You chose “{ask|lower}”. What would that look like next time? If you are stopping, write what is still open.",
          bodyFallback: "What one change would you make next time? If you are stopping, write what is still open.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "One concrete attempt",
      title: "What information or tool from this week is useful to keep?",
      nextWeekTitle: "Clarity that continues",
      letter: "This week was about “One concrete attempt”. What you wrote to keep: “{d28.ask}”. It is yours to reuse, change or leave. Next week: Clarity that continues.",
      letterFallback: "This week was about “One concrete attempt”. Whatever you answered, skipped or left for later is still yours: nothing here is a score. Next week: Clarity that continues.",
      steps: {
        ask: {
          title: "What information or tool from this week is useful to keep?",
          body: "A confirmed date, question or phrase; completion is not required.",
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Give what you keep a clear title so you can find it later.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    // ── Week 5 · Clarity that continues ────────────────────────────────────
    {
      level: "Clarity that continues",
      title: "What has changed in your understanding of money, even if your income is unchanged?",
      weekTitle: "Clarity that continues",
      intro: {
        title: "Clarity that continues",
        note: "Every question is optional, and nothing here asks you to contact anyone, spend money or share.",
      },
      payoff: "This week's takeaway: a situation note and an optional review.",
      steps: {
        ask: {
          title: "What has changed in your understanding of money, even if your income is unchanged?",
          body: "“Nothing yet” is also valid.",
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Compare an initial question with what you know now; “still open” counts.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Clarity that continues",
      title: "What would help you understand your options in a lower-income week?",
      steps: {
        ask: {
          title: "What would help you understand your options in a lower-income week?",
          body: "Choose any that fit. You can also pick none.",
          options: [
            "See dates and payments",
            "Confirm expected income",
            "Learn about support",
            "Ask for clarification",
            "Review an agreement",
            "Something else",
          ],
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Leave a list of two facts to review first, without imposing cuts.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Clarity that continues",
      title: "What would you like to decide with more information or independence?",
      steps: {
        ask: {
          title: "What would you like to decide with more information or independence?",
          body: "No need to change agreements or speak with anyone today.",
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Note one piece of information that could increase your room to decide.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Clarity that continues",
      title: "What support or information could help with an unresolved issue?",
      steps: {
        ask: {
          title: "What support or information could help with an unresolved issue?",
          body: "Name the kind of help; no contact details or search required.",
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Write a question for a support source appropriate to your situation.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Clarity that continues",
      title: "Which brief money check would be useful to repeat?",
      steps: {
        ask: {
          title: "Which brief money check would be useful to repeat?",
          body: "Choose one.",
          options: [
            "Income dates",
            "Upcoming payments",
            "One obligation",
            "Opportunities or payments owed",
            "My agreements",
            "None for now",
          ],
          elara: "Noted. Nothing here has to be perfect.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Define what you would check and when the check would be finished.",
          elara: "Whatever you wrote, you can come back to it.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Clarity that continues",
      title: "When would it be useful to review your situation again?",
      steps: {
        ask: {
          title: "When would it be useful to review your situation again?",
          body: "Name a time or event. This does not schedule a reminder.",
          elara: "Thank you. That is enough to work with.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "If useful, note it in your own calendar; the app will not schedule it here.",
          elara: "That is yours to keep, change or leave.",
          skipLabel: "Prefer to skip",
        },
      },
    },
    {
      level: "Clarity that continues",
      title: "What would you like in your financial clarity note?",
      letter: "This week was about “Clarity that continues”. What you wrote to keep: “{d35.ask}”. It is yours to reuse, change or leave. That is the whole path. Any day is there if you want to come back to it.",
      letterFallback: "This week was about “Clarity that continues”. Whatever you answered, skipped or left for later is still yours: nothing here is a score. That is the whole path. Any day is there if you want to come back to it.",
      steps: {
        ask: {
          title: "What would you like in your financial clarity note?",
          body: "Complete only the lines you want.",
          fields: ["I now know…", "Still unresolved…", "My next step, if any…"],
          elara: "That helps. You can change it any time.",
          skipLabel: "Prefer to skip",
        },
        take: {
          title: "To take with you",
          body: "Check that your note separates facts, open questions, and an optional next step.",
          elara: "Small and clear is plenty. It stays with you.",
          skipLabel: "Prefer to skip",
        },
      },
    },
  ],
};
