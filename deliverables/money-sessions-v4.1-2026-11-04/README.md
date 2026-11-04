# Money sessions V4.1 (4 Nov 2026)

V4.1 corrects the V4 review draft (`sources/Elara_Dinero_V4_ES.pdf`). It keeps V4's approach and rhythm: recognise your situation, learn one idea, choose something useful, take it with you. It fixes what a test of the text found. The Spanish is the source. Everything is a proposal until María and Alejandra approve it.

| File | For | What it is |
|---|---|---|
| `Elara_Dinero_V4.1_ES.pdf` (17 pages) | María and Alejandra | The seven sessions, with every new or changed line tagged NUEVO or CAMBIADO, plus a «Qué cambió» page |
| `Elara_Money_V4.1_EN.pdf` (17 pages) | team and developers | The same in English, tagged NEW or CHANGED |
| `src/content-es.mjs`, `src/content-en.mjs` | editing | The copy, as data |
| `src/build.mjs` | rebuilding | Builds both PDFs and runs the checks below |

## What changed from V4

1. **An optional check on days 1 to 6.** After the idea, one short question with three fixed-reply options, one of them «No estoy segura, muéstrame». It has no score and doesn't block her. In V4 nothing showed her whether she had understood the idea.
2. **Day 1 has a path for «no me alcanza».** That reply now points to step 3. Step 3 asks «¿Qué te ayudaría hoy?» and adds «Anotar cuánto falta, sin resolverlo hoy». The note accepts «Me faltan… para…», and «Te llevas» includes it.
3. **Day 2's title has a referent:** «¿Qué te gustaría que *tu* dinero te permitiera?». On the Atlas home the title appears alone, so «ese dinero» pointed to nothing.
4. **Day 7 makes no assumptions and drops pilot language:**
   - «Esta semana vimos…» replaces «Esta semana separaste…», which assumed she did every day.
   - «Gracias por darte este tiempo esta semana» replaces «Gracias por probar esta semana».
5. **Clearer text:**
   - Day 1: «dos días después de la luz».
   - Day 3: «poner un límite» replaces «enviar un límite».
   - Day 4: a true minus sign.
   - Day 6: five options instead of six (the «reconocer señales» option moves into «Prefiero pasar»), and the idea is in shorter sentences.
   - Day 7: a shorter idea.
6. **Support at sensitive moments:**
   - Day 3: one line for anyone who feels pressure or control over her money.
   - Day 6: «ayuda oficial de tu país» stays generic until organisations are verified for each country.

Unchanged: the six rules, the examples, «Ayer viste», «Si te sirve…», and the save and error states.

## Checks run by `node src/build.mjs`

- **Edition parity:** the ES and EN files have the same shape.
- **No overflow:** no page overflows. Every day's check fits on its first page, right after the idea.
- **Cross-references:** every «Mañana» names the next day's title, every «Ayer viste» repeats the previous day's rule, and day 7's list equals the six rules.
- **Expected answers:** each check has exactly one.
- **Example sums:** every number used in an example or check was recalculated:
  - Day 1: 300 − 180 = 120, then 50 short.
  - Day 3: giving 100 leaves 100, so 50 short.
  - Day 4 check: 200 + 15 − 40 = 175, so it went down 25.
  - Day 4 example: 100 + 10 − 20 = 90.
  - Day 5 check: 2 ÷ 0.8 = 2.50 per kg.
  - Day 5 example: 100 → 110 → 121.

**Readability of each idea text (INFLESZ, Spanish; 55–65 is normal, under 55 is fairly hard):**

| Day | V4 | V4.1 |
|---|---|---|
| 1–5 | 62.8–78.5 | unchanged |
| 6 | 53.6 | 64.8 |
| 7 | 46.5 | 63.6 |

## To decide with María

- Day 3's support line: keep, change or remove?
- Which organisations to name on day 6 for Colombia, Mexico and the group's other countries? They need verifying against official sources first. No names are written in yet.
- Day 1's check uses «alquiler», like V4's example. «Alquiler» or «arriendo» for this group?
- The six checks are new text. Do they help, or do they feel like a test?

The concept sources are V4's, reviewed on 4 Nov 2026. They were not reopened for V4.1.

## Rebuilding

Run `node src/build.mjs` from this folder. It rebuilds both PDFs and fails if any check above fails.
