# Daily session: design decisions (3 Nov 2026)

Scope: one Elara daily session (two questions: a choice, then «Para llevarte»), from Hoy to the next day. Worked example: Money path, Wuzhen, week 2 day 1 (curriculum `MONEY-W2-D1`, app day 8). All new Spanish below is a **proposal pending María and Alejandra**.

## What the session is for

From the product brief (29 Oct) and the curriculum strategy (30 Oct):

- She should leave with "something she understands more clearly or something concrete she can try". The takeaway "should follow from what she actually answered".
- **Success question:** after today, can she explain what it helped her understand or what she plans to try? If the only answer is "I finished two questions", it failed.
- **The daily loop:** clear purpose → one purposeful activity → grounded mentor feedback → a feasible next move or a stop → a visible result. Next day should feel connected without requiring her to catch up or disclose.
- **Rules that constrain design:**
  - No generic praise.
  - No invented facts or motives.
  - A skip ends the exercise.
  - Never assume she can contact someone safely, spend money, or choose her time.

## Evidence: what is observed and what is only a hypothesis

**Observed** (small n, but real):

| # | Observation | Source |
|---|---|---|
| O1 | After choosing «Mejorar mi trabajo actual», the instruction «Elige una vía para investigar, sin tener que aceptar trabajo ni pagar nada» was unclear and didn't connect to her choice | María, TestFlight screenshot, 2 Nov |
| O2 | She finished week 1 and "didn't connect" with the two daily questions | María, 29 Oct |
| O3 | Daily questions felt too open, with little guidance, no new insight and an unclear purpose | One tester relayed by María, 29 Oct |
| O4 | She asked how to go back to week 1 | María, 2 Nov |
| O5 | The app shows a different Q2 text from the server than the one in its own built-in copy (the seed is stale) | Code |
| O6 | There is no per-day purpose; only the first day of a week shows an intro; days 2–7 open straight on Q1 | Code |
| O7 | Elara's reply to Q1 sits at the top of Q2, above the field; in María's screenshot it's cut off and the field starts mid-screen | Code and screenshot |
| O8 | «Ninguna por ahora» is a plain option. Q2 still says «la parte que elegiste», and if she skips Q2, Hoy quotes «Ninguna por ahora» as «Hoy dijiste» | Code |
| O9 | The server asks the model to reply to skipped steps, and the client throws the reply away | Code |
| O10 | Failed replies have no error UI, and answers given offline never get a reply | Code |
| O11 | Drafts are saved on the phone, a day resumes on the remembered step, and going back keeps answers | Code, to verify at runtime |

**Directional, simulated:** on 56 test answers scored blind by Claude reviewers, the current reply prompt added a useful move in 18 of 112 scores and generic praise in 64. The proposed prompt (V2) added a useful move in 106 of 112.

**Hypotheses** (untested):

- H1: Stating why today matters before the first question improves understanding of the day's purpose.
- H2: Seeing the empty takeaway before starting makes the purpose concrete.
- H3: A conversation format makes her feel more understood.
- H4: A visible takeaway on Hoy gives a reason to return.
- H5: Extra screens lower completion.
- H6: A chat format raises free-chat expectations.
- H7: A pinned card feels like homework.

## Pass 1: A, B and C compared independently

| | A · step by step | B · conversation | C · card to keep |
|---|---|---|---|
| **Comprehension** | Strongest on why: a whole screen states the purpose before effort (H1). Q2 echoes the choice, which addresses O1. | Purpose is in Elara's voice inside a long thread and may be skimmed. Q1→Q2 continuity is the most visible. | Strongest on what she'll get (H2). Purpose in words is weaker. Putting the choice and the takeaway on one card shows the link from O1. |
| **Effort** | 7 screens for a 3-minute day; the current app has 4 (H5). Separate reply screens add 2 taps. | Few taps, long scroll. The input tray takes about 40% of the screen at 360 px. | 5 screens; the payoff is visible throughout. |
| **Emotional tone** | Calm, a bit formal. A generic reply on its own screen looks emptier. | Potentially the warmest (H3), but the most damaged by weak replies, which the current prompt produces (bench). Offline answers never get a reply (O10), so a conversation would show holes. Overlaps with the Pregunta chat tab (H6). | Feels like work you keep. Risk of homework feel (H7) and a thin card after skips. |
| **Takeaway usefulness** | Shown once at the end, then hard to find. | Shown at the end of the thread. | Persists, and she can reopen it. Same content as A/B. |
| **Reason to return** | A «Mañana» card. Its copy promised «los próximos días parten de esa elección», which day 9's content doesn't support. | Same unsupported promise. | The card on Hoy all week (H4/H7). No content-level continuity. |
| **Fit with the app** | High: the app is already a step pager. | Low: a new thread layout, plus resume, edit and accessibility of a live thread. | Medium: one card component, a slot on Hoy, reusing the collection. |

**Conclusion of pass 1.** None of the three is supported by user evidence over the others. The observed problems are purpose (O2, O3), the Q1→Q2 link (O1), a crowded Q2 (O7) and an unclear payoff. They point to:

- A's purpose-first guidance (H1);
- an explicit Q1→Q2 link (A's echo or C's card);
- a takeaway she can find again (C).

B is not ruled out by evidence. It is deferred, because it depends most on the weakest, unvalidated part (reply quality) and costs the most. C's "pinned all week" is replaced by "the latest takeaway on Hoy". The skeleton preview is kept small.

## Pass 2: the resolved session

One flow, built on the app's existing step pager. Structure is A's; payoff is C's.

**0. Hoy** (unchanged entry). After the day is done, a compact takeaway card sits at the top of Hoy (see 4).

**1. Opening screen.** Shown only when the day has content for it: a `purpose`, or it's the first day of a world (as today). Skipped when resuming mid-day.
- Eyebrow «Wuzhen · Día 1 · Unos 3 minutos» and the day's stop title (existing).
- **«Por qué hoy»** with one sentence of `purpose` (new day field).
- **«Hoy te llevas»**: the takeaway card in its empty state, with one slot per step: `card.label`, plus `card.hint` as placeholder text.
- On the first day of a week, the week note (existing).
- On later days, **«La última vez anotaste»** with her previous takeaway, verbatim, and the day number, only when one exists.
- «Empezar».

**2. Q1** (content of record, unchanged): question, six options, «Prefiero pasar».

**3. Q2.**
- At the top, a compact row: «Tu elección · Mejorar mi trabajo actual» with **«Cambiar»** (goes back to Q1 with the choice selected; the draft is kept).
- Then «Para llevarte» and the instruction, then the field, which has visual priority.
- Elara's note to Q1 sits **below** the field, smaller. It's hidden while the keyboard is open.
- If she changed her choice while a draft exists, a one-line note says so.

**4. Closing screen.**
- «Hoy te llevas» with the filled card: her choice and her exact words. **«Editar»** reopens Q2 with her text.
- Elara's closing note sits below the card, secondary.
- The existing honest saved/offline line.
- **«Mañana: {first question of the next day}»** instead of an unsupported promise.
- The existing «¿Te sirvió…?» and «Volver a Hoy».

**5. Next day.**
- Hoy shows the new day first, then «La última vez anotaste» right under the hero card, above the week tracker.
- When today is done, the takeaway card comes first.
- The day's opening screen repeats her last takeaway only if that day has an opening.

### Copy (all proposals)

| Where | Spanish |
|---|---|
| Day 8 purpose | Hoy eliges por dónde empezar a mirar tus ingresos y lo conviertes en algo concreto para averiguar. |
| Day 8 card slots | «Tu elección» · «Para llevarte» (hint: «Una pregunta o un pequeño paso») |
| Day 8 Q2 instruction (your wording) | ¿Qué podrías averiguar sobre esta opción? Escribe una pregunta o un pequeño paso. |
| Day 8 Q2 when Q1 is «Ninguna por ahora» or skipped | ¿Hay algo sobre tus ingresos que te gustaría entender mejor? Si quieres, escríbelo como una pregunta o un pequeño paso. |
| Changed choice with a draft | Cambiaste tu elección. Revisa si lo que escribiste sigue encajando. |
| Day 9 purpose | Hoy buscas en lo que ya sabes hacer un ejemplo concreto y lo conviertes en una frase que podrías usar. |
| Day 9 card slots | «Lo que sabes hacer» · «Para llevarte» (hint: «Una frase sobre tu experiencia») |
| Skipped slot | Pasaste esta pregunta |
| «Ninguna» and no note | Sin nota por hoy |
| Continuity | La última vez anotaste |
| Tomorrow | Mañana: {pregunta} |

Removed:
- «Los próximos días parten de esa elección»: day 9 doesn't use the choice.
- «esta semana» from the instruction: it assumed when she can act.

### Mentor feedback rules (server prompt, V2 plus your constraints)

- **One move only**, under 280 characters: a distinction, a tighter version of her own words, the missing fact and who could confirm it, or a smaller option.
- **Ground it in her exact words.** Never add people, places, employers or facts she didn't mention.
- **No praise or grading** («buena idea», «muy bien»). No question back to her.
- **Don't say an action is safe, free or without consequences.** Don't assume when or whether she can act («esta semana», «hoy mismo») unless she said so. Leave the decision with her.
- **Skipped step: no model call and no Elara note.** «Ninguna por ahora»: accept it plainly, with no task.
- **Long answer:** offer a one-line version in her words. **Vague answer:** offer one way to narrow it, as an option, not an order.
- **Failure or offline:** show the step's authored line, labelled «De Elara» (authored), never «Elara notó» (generated).

Illustrative simulated replies (for tests and screenshots only, always labelled):
- **Q1:** «Mejorar tu trabajo actual puede tocar tus condiciones o lo que haces cada día. En el siguiente paso puedes anotar qué te gustaría averiguar sobre eso.»
- **Q2:** «Anotaste una pregunta concreta: si hay formación gratuita para subir de puesto. Su respuesta te diría si ese camino existe donde trabajas. Tú decides si preguntarlo y cuándo.»

## Pass 3: pressure tests

| Situation | Behaviour | Status |
|---|---|---|
| Unsure («No sé») | Accepted as her words; the reply accepts plainly with no task; the card shows «No sé» | Prompt rule; verify the card |
| Q1 skipped | No model call; no note on Q2; Q2 uses the option-free instruction; the card says «Pasaste esta pregunta» | Server + client |
| «Ninguna por ahora» | Recorded as her choice, but never quoted as «Hoy dijiste». Q2 uses the option-free instruction; she can write, or pass and still finish. The card shows her choice and «Sin nota por hoy» if empty | New `noneOption`, a pure helper, tests |
| Q2 skipped / both skipped | The day completes. No closing reply. The closing screen says «Listo por hoy» with what she did answer; nothing is invented on Hoy or in the collection | Client + server |
| Vague answer («algo») | Non-answers already get a retry line. Vague but real answers get one narrowing move | Existing + prompt |
| Long answer | The full text on the closing card (wraps, scrolls); 3 lines plus ellipsis on Hoy; the reply offers a one-line version | Client + prompt |
| Changes Q1 after writing | «Cambiar» → Q1 pre-selected → new choice → the draft stays, with the changed-choice note; the Q1 reply is regenerated | Client |
| Edits after finishing | «Editar» on the card → Q2 with her text → «Terminar» → the closing screen updates; the changed answer gets a new reply | Client (existing `?step=`) |
| Leaves halfway | The draft is saved on the phone (existing). Hoy says «Seguir con el día 1»; resume lands on the step with the draft and skips the opening | Verify at runtime |
| Keyboard open on Q2 | Compact band, choice row, heading, instruction and field all visible; the CTA stays above the keyboard; Elara's note hides | Client |
| Larger text | No text below 14 px in the session screens; layouts hold at about 130% and 160% | Client, checked on web |
| Offline | Answers save on the phone (existing banner and copy). No generated note offline; the authored line «De Elara» shows, with the honest offline line. «Volver a Hoy» continues | Existing; verify |
| Reply fails online | Authored line, plus «Pedir la nota de Elara» (re-sends the saved answer once) if the store supports it cleanly | P1 |

## What is out of scope

- B's conversation layout.
- Per-option examples (content work for María).
- Copy for days other than 8 and 9; other days keep today's behaviour unless they get a `purpose`.
- Navigating back to earlier weeks (O4) beyond reopening takeaways from Hoy and Tu colección.
- Deploying anything, migrations, or calling a real model.

## Open uncertainties

- Whether purpose-first and the card preview improve understanding is H1/H2, not evidence.
- Reply quality on the production model is unknown; the V2 prompt is only simulated.
- Whether a takeaway on Hoy brings her back, or feels like homework, is H4/H7.
- The proposed Spanish needs María and Alejandra.
- Adding an opening screen to days 2–7 costs a tap each day; here it appears only where the content has a `purpose`.
