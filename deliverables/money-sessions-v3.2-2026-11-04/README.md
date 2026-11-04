# Money sessions V3.2: screens (4 Nov 2026)

V3.2 is the seven-day Money pilot shown screen by screen. It is built on the English V3.1 screens draft (`sources/Elara_Money_V3_1_Screens_EN.pdf`). The Spanish edition is the source copy. It is a proposal until María and Alejandra approve it.

| File | For |
|---|---|
| `Elara_Dinero_V3.2_Pantallas_ES.pdf` (16 pages) | María and Alejandra |
| `Elara_Money_V3.2_Screens_EN.pdf` (16 pages) | the team and developers |

## Changes from V3.1

**Fixes**
- **No script gives away its answer.** On days 1, 2, 4 and 5, the screen-1 script no longer states the answer to the screen-2 question.
- **One rule per day.** It is the same on screen 1, on screen 4 and in day 7's list.
- **Day 3:**
  - The rule is V3.1's warmer wording.
  - «No hay una respuesta correcta» replaces «moralmente correcta».
  - Amounts are in US$.
  - The rehearsal phrase is the main action, prefilled with the example.
- **Day 4:** the rule is a general rule, not the story of the example.
- **Day 7:**
  - «Día 1» replaces «This rule returns to day 1».
  - The finishing screen is replaced by two recall questions.

**Changes aimed at 9/10**
- **«No estoy segura, muéstrame» / «Not sure, show me»** is an option on every check question, so she learns without guessing. It replaces a Skip that showed the answer, which today's engine can't do.
- **Every day opens with yesterday's rule** in one line.
- **«Si quieres probarlo» / «If you want to try it»** offers one optional real-life action at the close. It is not stored as a task, and nobody asks about it later.
- **«Tengo otra pregunta» opens the only text field.** Previously there were two ways to write.
- **Day 3 has a new option, «Sí, te doy los US$100».** Saying yes is respected as a choice, and the calculation shows the gap.
- **Day 7 starts with two recall questions** (days 1 and 4). Then she picks her rule, and can write it in her own words.

## For the developers

These claims were checked against the app code on `ux-fixes-2026-11-03`, built on `main` `1363407`.

**Runs on today's day engine (content only)**
- **The fixed order:** Money days 1-7. Which days these replace is an owner decision.
- **Screen 2:** a quiet `choose` step with written `replies` per option. «No estoy segura, muéstrame» is an ordinary option with its own reply.
- **Screen 3:** a `choose` step. The branch replies are either written `replies` or conditional steps (`when: { step, valueIn }`). «Tengo otra pregunta» is `otherLabel`, which gives her a text field.
- **Day 3's prefilled phrase:** a separate `reflect` step with a prefill.
- **Day 7:** two quiet `choose` steps for the recall questions, plus a `choose` with six fixed options for the rule. «Escríbela con tus palabras» is the `detail` field.
- **Saving a rule:** `keep: "rule"`.

**No AI**
- Every reply is written in advance.
- Questions she writes are stored, not answered.

## Open decisions (on the last page of each PDF)

- **Word choices:** «la luz», «respaldo» and «estado de cuenta».
- **Currency** and realistic amounts.
- **Which financial regulator to name** in each country.
- **A proposal:** written questions reach Ale anonymously, with her permission, for a weekly audio answer.

## Checks

- **Arithmetic:** every number was recalculated in code (days 1, 3, 4, 5 and 7).
- **Build:** `node src/build.mjs` fails if the Spanish and English editions differ in shape, or if any page overflows.
- **Visual:** every page was rendered and looked at.
