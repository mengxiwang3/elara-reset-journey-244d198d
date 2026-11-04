// The V2.1 review, for the team and the developers (English).

export const review = {
  eyebrow: "REVIEW / MONEY SESSIONS V2.1 / 4 NOV 2026",
  title: "7 out of 10",
  lede:
    "V2.1 is the first version that teaches her something in every session, which was the biggest complaint from testers (“no aprendo nada nuevo”). Sessions 2 and 3 are nearly ready to test. Three things hold it back: it is too careful to say anything plainly; four of the seven sessions are about investing, for women whose main money problem is often “no alcanza”; and session 5’s numbers hide its own lesson. V2.2 (separate PDFs, Spanish and English) applies the fixes below.",
  head: ["#", "Session", "Score", "Problem in V2.1", "What V2.2 does"],
  rows: [
    ["1", "Save or invest?", "7", "Good hook, but never states the rule. Jargon in the audio (assets, bonds, return). Option C overlaps with B.", "States the rule. Plain audio. C is now “whether it went well for others”."],
    ["2", "What’s already spoken for", "8", "The most useful day to day, but payments have no names, and the “harder case” has no trap: the balance never runs short.", "Rent, card and pay in $. Harder case: pay slips to day 14, so she’s $50 short on day 12."],
    ["3", "What if they think I’m selfish?", "9", "The best one: her real life, and she leaves with a sentence she can say.", "Kept. “I already help every month” replaces “a prior commitment”."],
    ["4", "Customer to shareholder", "6", "Clear but distant. Dividends unused. The right answer is the longest. A branch promises an explanation it never gives and has no opening option.", "Dividends cut. Answers of equal length. The branch now gives the explanation."],
    ["5", "Change a number", "5", "2 years at 5%: 110.25 against 110 without compounding. A 25-cent difference hides the lesson.", "20 and 30 years ($265, $432), plus rising prices ($121) and a debt ($169)."],
    ["6", "Two funds", "4", "The furthest from her life right now.", "Replaced by “When an investment promises too much” (scam signs). Funds move to a later week."],
    ["7", "What you take with you", "7", "Good continuity, but empty if she saved little.", "Starts with a rule she picks, so it is never empty. Shorter."],
  ],
  crossTitle: "Fixes across all sessions",
  crossHead: ["Problem in V2.1", "V2.2 change"],
  cross: [
    ["Almost every feedback line ends with a hedge (“no garantiza”, “todavía no basta”). Right for the team; on screen it feels like nothing was learned.", "One rule per session, stated clearly in the close. At most one caveat per screen."],
    ["Money is abstract (“100 unidades”, “pago 150”).", "Dollars and named payments: rent, card, pay. María decides on $ versus units."],
    ["Four of seven sessions are investing; debt, inflation and an emergency cushion are missing.", "Inflation and debt enter session 5; scams replace funds in session 6."],
    ["7-8 screens per session; dense audio.", "Five screens; 35-45 s audio with at most three ideas."],
    ["Every opening allows free text, but no reply is written for it: that is where the generic AI note comes back.", "A written reply for “Other” in every session. No model call."],
  ],
  buildTitle: "What it takes to build",
  build:
    "Mostly content work. Checked against the app code: the opening choice with “Other”, Ale’s audio player, cards, a written reply per option shown at once (no AI), branches by option, fill-in sentences, and keeping a rule for the week’s synthesis all exist in the day engine. Truly new: session 2’s draggable calendar, session 5’s number controls and session 7’s editable note (plus, optionally, showing only the rules from sessions she opened). Ship sessions 2 and 5 first as choices with explanations. Full table: page 20 of the English V2.2.",
  mariaTitle: "For María to decide",
  maria: [
    "“colchón” instead of “respaldo”; “ya tiene dueño” instead of “tiene destino”; dollars instead of “unidades”; “Ya ayudo cada mes”.",
    "The whole new session 6, especially whether “I’ve put money into something like that” is safe to choose.",
    "Whether the 30-year example in session 5 deepens the “I’m late” feeling.",
  ],
  testTitle: "How to find out if it helps",
  test:
    "Test sessions 1-3 as text with five women before recording any audio. After each visit ask “What would you use beyond Elara?”. The next day, before she opens the app: “Do you remember yesterday’s rule?”. If most can’t say it, the session didn’t land, however many screens were completed.",
  limitsTitle: "Limits of this review",
  limits: [
    "My read of the audience is a hypothesis, not research. I’m not a native Spanish speaker: whether the Spanish sounds natural is María’s call.",
    "Every number in V2.1 and V2.2 was recalculated in code.",
    "Session 6’s sources (SEC Investor.gov fraud pages) could not be opened from this session, because investor.gov is outside its allowed network. They must be checked before publication.",
    "The day engine was checked against the code; which build TestFlight runs is still unknown.",
  ],
  footer: "4 NOV 2026 / REVIEW OF V2.1 / FOR THE TEAM AND DEVELOPERS",
  brand: "ELARA / MONEY CLARITY",
};
