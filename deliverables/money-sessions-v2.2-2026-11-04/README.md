# Money sessions V2.2 (4 Nov 2026)

A review of the seven V2.1 money sessions, and a V2.2 draft that applies the fixes. The Spanish is a proposal until María and Alejandra approve it.

| File | For | What it is |
|---|---|---|
| `Elara_Money_V2.1_Review.pdf` | team, developers | V2.1 scored 7/10: a score per session, the problems, what V2.2 changes and what it takes to build (2 pages) |
| `Elara_Dinero_V2.2_ES.pdf` | María, Alejandra | The seven sessions in Spanish, the review sheet, the word choices to decide and the test plan (19 pages) |
| `Elara_Money_V2.2_EN.pdf` | team, developers | The same in English, plus page 20: what the app already supports (20 pages) |
| `sources/` | reference | The V2.1 PDFs as received (read-only) |
| `src/` | regenerating | `content-es.mjs` is the source copy and `content-en.mjs` its translation. `node src/build.mjs` rebuilds all three PDFs. The build fails if the two editions differ in shape or a page overflows. |
| `html/` | regenerating | The rendered HTML behind each PDF |

## Main changes from V2.1

- Each session closes with one rule, stated clearly, and has at most one caveat per screen.
- Five screens per session; audio of 35-45 s with at most three ideas.
- Amounts are in dollars and payments have names: rent, card, pay. María decides on dollars versus units.
- Session 2: the harder case now has a real trap. If pay slips to day 14, she is $50 short on day 12.
- Session 5: the example now runs 20 and 30 years. It adds rising prices and a debt, the cases where compounding works against her.
- Session 6 is new: «Cuando una inversión promete demasiado» (warning signs of investment fraud). «Dos fondos» moves to a later week, unchanged.
- Session 7 starts with a rule she picks, so it is never empty.
- Every reply Elara gives is written in advance, including the reply to «Otra». The sessions make no model calls.

## Checks

- **Numbers:** every number in V2.1 and V2.2 was recalculated in code.
- **App support:** the day-engine claims on page 20 were checked against the app code, on `ux-fixes-2026-11-03`, built on `main` `1363407`. Which build TestFlight runs is still unknown.
- **Sources not verified:** session 6's sources are SEC Investor.gov's «Red Flags of Fraud», «Affinity Fraud» and «Ponzi Schemes». They could not be opened from this session because `investor.gov` is outside the session's allowed network. Verify them before publication.
- **Still to do:** a list of financial regulators by country, verified.
