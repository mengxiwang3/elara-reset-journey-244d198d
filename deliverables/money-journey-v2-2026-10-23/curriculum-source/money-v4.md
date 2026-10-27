# Money v4, days 1–14: corrections and v5 priorities

Prototype as she meets it. Spanish is neutral Latin American; no blaming wording found. Patches: `money-v4-patches.json` (24, each unique).

## Corrections (10)

1. **D1 intro.note**: "Cada día tiene dos preguntas cortas" → "…unas pocas preguntas cortas"; "Each day has two short questions" → "…a few short questions". *Days 4, 11, 12 have 4–5.*
2. **D2 expected**: title "¿Qué dinero esperas en las próximas dos semanas?" → "¿Esperas dinero en las próximas dos semanas?"; "What money do you expect in the next two weeks?" → "Are you expecting money in the next two weeks?". Body "Para cada pago:" → "Si esperas más de un pago, piensa en el más importante. Elige una:"; "For each payment:" → "If you expect more than one, think of the one that matters most. Choose one:". *Title asks for an amount, options rate certainty; "each" doesn't fit one choice.*
3. **D5 harm** (free text): "Elige una cosa de tu lista, o usa un ejemplo." → "Escribe una cosa que necesites cubrir (puede ser de tu lista del día 3) o un ejemplo."; "Choose a listed need, or use an example." → "Write one thing you need to cover (it can be from your Day 3 list) or an example." *"Elige" implies a list; no list if Day 3 skipped.*
4. **D5 teach.body**: "Revisa la cuenta o el contrato, o pregúntale a la empresa que ya conoces." → "Revisa el recibo o el contrato, o pregúntale a quien te cobra, si es seguro para ti."; "Check the bill, agreement, or known provider." → "Check the bill or agreement, or ask whoever bills you, if that feels safe." *"cuenta" reads as bank account; creditor may not be a company.*
5. **D6 teach.title**: "Haz una sola pregunta y averigua si hay costos o condiciones." → "Si preguntas, haz una sola pregunta…"; "Ask one question and check any costs or conditions." → "If you do ask, keep it to one question and check any costs or conditions." *Directly follows the reply "no los contactes" and contradicts it.*
6. **D7 gathered** (read-only recall): "¿Qué vas a guardar en tu mapa?" → "Lo que anotaste esta semana"; "What will you keep in your map?" → "What you noted this week". Body "Usa las respuestas anteriores que quieras guardar." → "Al final de hoy puedes pasar a tu mapa lo que quieras de aquí."; "Use any earlier answers you want to keep." → "At the end of today you can copy into your map anything you want from here." *A question with no input.*
7. **D12 work.body/note**: "Elige una de las plantillas de abajo." → "Hoy hay tres plantillas, una por paso: trabajo, pago y gasto. Llena solo una y salta las demás."; "Choose one template below." → "Today has three templates, one per step: work, payment and cost. Fill in just one and skip the rest." Note "Elige una plantilla, no las tres. Si ahora no puedes trabajar, elige otra o haz una pausa." → "Si ahora no puedes trabajar, salta esta plantilla y usa otra, o haz una pausa."; "Choose one template, not all three. If work isn't possible now, choose another or pause." → "If work isn't possible now, skip this template and use another, or pause." *Templates are separate steps, not "below".*
8. **D13 timing.fields[0]**: "Después de" → "Después de…, voy a…"; "After" → "After…, I will…". *Body has two blanks; the action had no field.*
9. **D14 idea.options[2]** (es): "Lo que causa un atraso" → "Lo que pasa si algo se atrasa". *EN and Day 5 teach consequences, not causes.*
10. **content.js AMT.bad** (es): "por ejemplo 120 o 1.250,50." → "por ejemplo 120 o 85.50." *D11 copy uses "6.67"; one format, matching Mexico/US; parser accepts both.*

Rendering, not copy: D2 `now`/D5 `harm` show no input; D7 recall never shows answers.

## v5 priorities (days 1–7)

**Weakest relevance/specificity.** The Day 1 focus changes nothing: "Ahora no tengo ingresos" gets the same expected-pay question (D2), "pago por vencer" (D4) and "Cuándo me van a pagar" (D6) as a debt focus. Days 1–3 choices have no replies, so "una respuesta de Elara" is unkept until D4. D3 `coverage` packs two four-way choices per item into free text, the week's heaviest step. D7 `timing` repeats D4's invented drill instead of using her D3 line. Skips count as completions, so use proves nothing.

**Test.** Skips per step by D1 focus; D3 chips vs text; D7 map fill rate; read-aloud of D2/D3/D6 ("cobertura", "[opción]").

**Adopt from MONEY-W1.**
- **D2** "¿Cómo entra el dinero en tu vida actualmente?" (multi, incl. "No tengo ingresos", "Apoyo de otras personas"); write "apoyos o programas del gobierno", not "Ayudas o prestaciones".
- **D4 options** (Alcanza y queda algo / Alcanza justo / No alcanza / Cambia cada vez / No tengo ingresos ahora / Aún no lo sé) as her self-placement after the sort, keeping "¿Qué describe mejor…?" (the red edit assumes income).
- **D7** one sentence "sin juzgarte ni prometer cambios" beside one open fact; phrase "¿Qué descubriste…?" (more Latin American than "has descubierto").
- Skip D3/D5 (duplicate v4; D5 "importe"); D6 drawing only as an in/out list in the D7 map.

**Top 3.**
1. Route D2–D6 examples and replies by the D1 focus (no income / debt / uneven income); adopt W1-D2.
2. Replace D3 coverage free text with per-item chips; make D7 use her own needs line, not a second drill.
3. Write replies for every D1–D3 choice; close D7 with W1-D7's non-judging sentence plus one open fact.
