# Concept C v2: the card, with A's step-by-step guidance (3 Nov 2026)

`c2.html` revises Concept C following the user's nine changes. `c.html` stays as v1 for comparison, and A and B are untouched. This is a **hypothesis for user testing, not a validated design**. Every Elara line is pre-written and synthetic, and each one carries the «Respuesta simulada» tag. There are no real data and no AI calls.

**C v2 no longer shares A and B's exact copy and replies.** It has a different «Por qué hoy» line, a new «Para llevarte» instruction, new simulated replies, new skip outcomes and a new type scale. A three-way comparison (A vs B vs C v2) would therefore be confounded: a difference could come from the copy rather than the structure. Either compare C v1 with C v2, or apply the same copy, reply and skip changes to A and B before testing all three. A, B and C v1 were left as they were, so they still contain the two "the next days build on your choice" lines that C v2 dropped (see Revisions after review).

## Files

| Path | What it is |
| --- | --- |
| `c2.html` | The prototype (self-contained, generated) |
| `src/c2.content.js` | C v2 copy, layered on `src/content.js` (which is unchanged) |
| `src/c2.css` | C v2's own complete stylesheet. Text is in rem, so the text-size toggle scales it. |
| `src/c2.js` | Screens, outcome rules, «Cambiar», keyboard, text size and reviewer states |
| `src/build.mjs` | Now takes per-concept file lists and `node src/build.mjs c2`. A, B and C v1 rebuild byte-for-byte identical (checked with md5). |
| `src/shoot.mjs` | C v2 captures plus an audit: contrast, text size, targets, overflow, clipping and overlap |
| `src/e2e.mjs` | 67 click-through checks for C v2 (A, B and C v1 keep their 30) |
| `shots/c2-*` | 143 captures (see Checks) |
| `index.html` | A separate «C v2» card was added. The A, B and C cards are unchanged. |

## The nine changes

1. **«Por qué hoy» on the opening screen.** This is A's forest card, but its line now differs from A's on purpose: «Hoy eliges por dónde empezar a mirar tus ingresos y lo conviertes en algo concreto para averiguar.» The week payoff underneath is unchanged. A's version ended with «Los próximos días parten de esa elección.», which was an unsupported promise, because day 9 doesn't use her choice. The card sits above «Lo que te llevas hoy» and the empty card. The empty card's two slots now name the steps («Elige una opción», «Una pregunta o un pequeño paso»). I also borrowed A's four-part progress bar with labels: Por qué hoy · Paso 1 de 2 · Elegir · Paso 2 de 2 · Para llevarte · Tu tarjeta.
2. **«Para llevarte» instruction.** The heading is kept. The instruction is now exactly «¿Qué podrías averiguar sobre esta opción? Escribe una pregunta o un pequeño paso.» It is applied as asked and is still listed for approval below.
3. **Less crowding on step 2.** The order is now:
   - a compact «Tu elección» row with «Cambiar»;
   - the «Para llevarte» heading (24px);
   - the instruction (17px);
   - the field (17px, with a stronger border);
   - Elara's step-1 note, last.

   The note is now smaller (16px), collapsible («Ocultar» / «Ver nota»), and folds automatically while the keyboard is open. The photo is gone from this step.
4. **«Cambiar», keeping the draft.** «Cambiar» sits next to the choice, and the back arrow does the same thing. On step 1 she sees «Tu borrador de «Para llevarte» se mantiene.» What happens next depends on her pick:
   - **Same option:** nothing changes, and the note is not re-run.
   - **Different option** (including «Ninguna por ahora» or «Prefiero pasar»): the draft is kept and a notice appears, «Cambiaste tu respuesta a la pregunta 1. Revisa si lo que escribiste sigue encajando.» It disappears once she edits. Elara's note re-runs, with a loading state. The instruction switches to the option-free version where that applies.
5. **Mentor feedback.**
   - **After question 1:** one note per option (six in total), each reflecting the chosen option, tentative, and asking nothing. None grades her answer. The «Ninguna por ahora» note is now just «Elegiste «Ninguna por ahora». El siguiente paso es opcional: puedes escribir algo o terminar sin escribir.» («y es una respuesta válida» was removed).
   - **After «Para llevarte», sample answer:** a tailored reply that refers to her words.
   - **After «Para llevarte», any other text:** a neutral template that quotes her words verbatim: «Escribiste: «…». Queda en tu tarjeta, y tú decides si lo usas y cuándo.»
   - **Removed:** «no te compromete a nada» and «Es algo que puedes hacer esta semana». The tailored reply now says «Tú decides si preguntas y cuándo».
   - **App reply rules** (`stepReply.ts`) still hold. Length is 106–201 characters; the template is at most 70 characters plus her quote, which is capped at 180, and the longest tested was 246. There are no questions and no em dashes.
   - «Respuesta simulada» is on every reply, now placed under the text.
6. **Hoy after completion.** «Tu tarjeta de hoy» sits directly under the greeting. It shows her choice, her sentence or what she skipped, the keepsake, and «Ver tarjeta». The hero postcard is shorter, and its duplicate «Ver lo que respondiste» button was removed because the card opens the same screen. The week tracker and «Mañana» come after.
7. **Distinct outcomes** for «Ninguna por ahora» and «Prefiero pasar», in the table below. She can complete the day without disclosing anything, and nothing is invented for a skipped question. C v2 no longer shows the tomorrow line «Mañana partimos de lo que elegiste hoy.» at all: day 9 doesn't use her choice, so it made the same unsupported promise as A's «Por qué hoy» line. The «Mañana» card now shows only day 2's real question.
8. **Realistic states.** All of these are in the reviewer panel under «Ver estado»:
   - keyboard open (a drawn iOS keyboard; the field and «Terminar por hoy» stay above it);
   - unfinished draft (Hoy shows the resume entry with the draft);
   - resuming (the draft is restored);
   - editing an earlier answer («Cambiar respuesta», «Opción cambiada»);
   - loading;
   - offline (exactly one «Reintentar» and one «Seguir sin la nota de Elara»);
   - «Ninguna por ahora»;
   - each skip path;
   - completion.

   Saving and offline behaviour carry visible reviewer tags: «Guardado simulado» and «Sin conexión simulada · guardado simulado».
9. **Readability.**
   - **Text size:** product text is at least 14px, and body text and inputs are at least 16px. Only the reviewer-only tags and panel small print are 13px.
   - **Contrast:** ember text now uses the token `primaryPressed` #B8441A (4.9:1 on the canvas), where ember #C94A1C was 4.3:1. The placeholder is now muted (6:1). The field border is #8C827A (3.7:1) and the radio ring 4.1:1.
   - **Targets:** every control is at least 44×44.
   - **Larger text:** a reviewer toggle offers 100 / 130 / 160 %. The status bar, tab bar (14px) and keyboard stay fixed, as on iOS.
   - **Widths:** layouts hold at 360 and 393.

## Revisions after review (3 Nov)

| Change | Asked by | Where |
| --- | --- | --- |
| «Por qué hoy» → «Hoy eliges por dónde empezar a mirar tus ingresos y lo conviertes en algo concreto para averiguar.» (week payoff kept under it). Now differs from A on purpose. | coordinator | opening screen |
| «Ninguna por ahora» note loses «y es una respuesta válida». | coordinator | step 2 note |
| «Mañana partimos de lo que elegiste hoy.» removed. Same unsupported promise as the old «Por qué hoy» line. | my follow-up, same reason; easy to restore | completion «Mañana» card, Hoy |
| Both-skipped closing line trimmed to «Recorriste las preguntas de hoy.»; dropped «Saltarlas también está bien.», which grades her. | my follow-up to the "nothing grades her answer" check | completion screen |

All other reply and UI lines were checked for grading words. The step-1 notes comment on the topic tentatively («puede darte pistas útiles», «quizá ayude empezar por una sola parte»). None of them judges her answer.

## Outcome rules (item 7)

| Path | Card slot 1 | Elara after Q1 | Step 2 instruction · actions | Card slot 2 | Elara after Q2 | Closing line (fixed UI) |
| --- | --- | --- | --- | --- | --- | --- |
| Option chosen, writes | the option | simulated, per option | item-2 instruction · «Terminar por hoy» / «Prefiero pasar» | her words | tailored (sample) or template quoting her | «Respondiste 2 de 2 preguntas.» |
| Option chosen, «Prefiero pasar» on Q2 | the option | yes | same | «Pasaste esta pregunta» | none | «Respondiste 1 de 2 preguntas.» |
| «Ninguna por ahora», writes | «Ninguna por ahora» | acknowledges, no push | option-free · «Terminar por hoy» / «Terminar sin escribir» | her words | template | «Respondiste 2 de 2 preguntas.» |
| «Ninguna por ahora», no text | «Ninguna por ahora» | yes | same | «Sin nota hoy» | none | «Respondiste 1 de 2 preguntas.» |
| «Prefiero pasar» on Q1, writes | «Pasaste esta pregunta» | none generated | option-free · «Terminar por hoy» / «Prefiero pasar» | her words | template | «Respondiste 1 de 2 preguntas.» |
| Both skipped | «Pasaste esta pregunta» | none | option-free | «Pasaste esta pregunta» | none | «Recorriste las preguntas de hoy.» |

On every path the day completes and the keepsake and «1 de 7» count. Hoy's card and Tu colección show the same slots: nothing filled in, and the «Frase» chip appears only when she wrote something. The closing lines are the app's own strings (`practice.dayComplete.summary`) and are shown as plain UI, never as a mentor reply. For the both-skipped case, C v2 keeps only the app's first sentence. The app's second sentence, «Saltarlas también está bien.», grades her, so it was dropped; the app should probably drop it too (a suggestion only, not applied to the app).

**One deliberate change to the proposed rules.** On the «Ninguna por ahora» path, step 2 offers «Terminar sin escribir» instead of «Prefiero pasar». Having both buttons would give two near-identical ways to say "no note today" with different card labels («Sin nota hoy» vs «Pasaste esta pregunta»), and the difference means nothing to her. Everywhere else the rules are as given. Separately, choosing «Prefiero pasar» on step 2 discards any text already typed, so no answer is recorded.

## What is simulated

- **Elara's notes:** pre-written. The loading state is a 1.6 s timer. «Sin conexión» in the reviewer panel only makes the note fail; the rest of the prototype keeps working.
- **Saving:** this browser's `localStorage` only. It is tagged «Guardado simulado» wherever it shows: the leave sheet, the toast, Hoy's resume entry, the resume banner, the completion list, Hoy's card and Tu colección.
- **Keyboard:** drawn, not real. It appears when the field gets focus on a desktop pointer device, or through «Teclado abierto». On a touch phone the real keyboard appears instead.
- **Not simulated:**
  - the app's "try again in your own words" handling for non-answers such as «hola»; the template quotes them as written;
  - a note that arrives after she has moved on (the app has `pendingReplies`).

## Checks (`node src/shoot.mjs c2`, `node src/e2e.mjs`)

- **Captures (143):**
  - every screen (11) and state (14) at 393×852 and at 360×780;
  - scrolled views of long screens;
  - 130 % and 160 % text on 10 key screens at both widths (80 files including their scrolled views);
  - the desktop panel.
- **Contrast:** 2,054 checks of visible text against its real composited background, over 90 audited captures. There are 0 failures and no text sits over a photo. The lowest ratio is 4.98:1, for ember text at 14–15px («Hoy» tab, «Lo que te llevas hoy», «Semana 2 · Día 1 completado»).
- **Text size:** product UI text is at least 14px; reviewer tags and panel small print are 13px.
- **Targets:** 0 controls under 44×44, in the phone, the sheet or the reviewer panel.
- **Large text:** 0 horizontal overflow, 0 text wider or taller than its box, and 0 overlapping text, at 100, 130 and 160 % on both widths. The e2e also confirms that at 360 px and 160 % with the keyboard open, the field and the primary button stay fully visible.
- **E2E: 67 checks for C v2, all passing.** They cover:
  - the happy path, including the exact revised «Por qué hoy» line;
  - «Cambiar» with the same option and with a changed option (the draft is kept both times);
  - «Ninguna por ahora» with and without text;
  - «Prefiero pasar» on Q1, on Q2, and on both;
  - leaving mid-draft, reloading, and resuming;
  - offline then continue, and offline then retry;
  - keyboard layout;
  - focus and every keystroke kept when the note lands mid-typing;
  - reply rules for all variants;
  - no grading words («bien», «válida», «perfecto», «buena», «genial», «correcto», «excelente»…) and no "the next days build on your choice" promise on any of the 11 screens or 14 states (checked after the replies land), in the sheet, or in any reply variant. The greeting «Buenos días» is excluded.

  A, B and C v1 still pass their 30. There are no JS errors.
- **Bugs found and fixed while reviewing the captures:**
  - Two CSS class collisions: `.empty` gave the slot numbers a grey bar (4.45:1, clipped), and `.k` drew a line under the lanterns and shrank them.
  - A re-render that would have stolen focus mid-typing.
  - A muted check icon on a filled circle.
  - A footer squeeze at 160 % with the keyboard open.

## New Spanish copy for approval («propuesta, pendiente de María y Alejandra»)

**New in C v2**

- «Hoy eliges por dónde empezar a mirar tus ingresos y lo conviertes en algo concreto para averiguar.» («Por qué hoy»; replaces the v1/A line in C v2 only)
- «¿Qué podrías averiguar sobre esta opción? Escribe una pregunta o un pequeño paso.» (the user's wording; applied)
- «¿Hay algo sobre tus ingresos que te gustaría averiguar? Si quieres, escribe una pregunta o un pequeño paso.» (option-free)
- Elara after Q1 (simulated, but the tone is part of the proposal):
  - «Elegiste encontrar trabajo. Es un tema amplio, y quizá ayude empezar por una sola parte. En el siguiente paso puedes anotar algo concreto que te gustaría averiguar.»
  - «Elegiste mejorar tu trabajo actual. Partir de algo que ya conoces puede darte pistas útiles. En el siguiente paso puedes anotar algo concreto que te gustaría averiguar.»
  - «Elegiste cobrar un pago pendiente. A veces aclarar un solo dato ya ordena el resto. En el siguiente paso puedes anotar qué te gustaría averiguar.»
  - «Elegiste explorar un servicio o venta. Por ahora se trata de mirar, no de decidir. En el siguiente paso puedes anotar algo concreto que te gustaría averiguar.»
  - «Elegiste conocer apoyos disponibles. Saber qué existe puede ayudarte a ver tus opciones. En el siguiente paso puedes anotar algo concreto que te gustaría averiguar.»
  - «Elegiste «Ninguna por ahora». El siguiente paso es opcional: puedes escribir algo o terminar sin escribir.»
- Elara after «Para llevarte»:
  - sample answer: «Anotaste preguntar a tu encargada si hay formación gratuita para subir de puesto. Saber si existe podría aclararte qué opciones hay en tu trabajo. Tú decides si preguntas y cuándo; queda en tu tarjeta.»
  - any other text: «Escribiste: «{sus palabras}». Queda en tu tarjeta, y tú decides si lo usas y cuándo.»
- «Pasaste esta pregunta» · «Sin nota hoy» · «Terminar sin escribir»
- «Cambiar» · «Cambiar tu elección» (a11y) · «Tu borrador de «Para llevarte» se mantiene.» · «Cambiaste tu respuesta a la pregunta 1. Revisa si lo que escribiste sigue encajando.»
- «Ver nota» · «Ocultar»
- «Reintentar» (the app's photo step says «Intentar de nuevo»; pick one) · «Seguir sin la nota de Elara»
- «Tu tarjeta» (progress) · «Elige una opción» · «Una pregunta o un pequeño paso» · «Tu tarjeta de hoy» · «Ver tarjeta» · «Tu borrador:»
- «Tu lugar y lo que escribiste quedan guardados. Puedes seguir desde Hoy cuando quieras.»

**Still pending from v1 and used here:** «Por qué hoy», «Paso 1 de 2 · Elegir», «Paso 2 de 2 · Para llevarte», «Lo que te llevas hoy», «Empezar mi tarjeta», «Tu elección», «Añadir a mi tarjeta», «Queda en Hoy durante toda la semana.», «Guardada en Tu colección · Semana 2», «Ver en Tu colección», «Ahora no hay conexión», and the leave sheet («¿Lo dejas por ahora?», «Tu lugar queda guardado…», «Salir y guardar», «Seguir aquí»).

**No longer used in C v2:** «Hoy eliges por dónde empezar a mirar tus ingresos. Los próximos días parten de esa elección.» and «Mañana partimos de lo que elegiste hoy.» (both promise that later days use her choice; day 9 doesn't). Also the app string «Saltarlas también está bien.» (it grades her); C v2 keeps only «Recorriste las preguntas de hoy.».

**Reviewer-only (not product copy):** «Respuesta simulada», «Guardado simulado», «Sin conexión simulada · guardado simulado», «Usar respuesta de ejemplo (sintética)».

The content of record is unchanged except for the instruction in item 2. That covers the question, the six options, «Elige una.», «Para llevarte», «Prefiero pasar», the week note and the payoff.

## Para decidir con María

1. Hoy muestra el inicio de tu borrador sin terminar. ¿Te parece bien que se vea en la pantalla principal, o preferirías ocultarlo?
2. Después de «Ninguna por ahora», ¿«Terminar sin escribir» se entiende mejor que «Prefiero pasar»?
3. Las notas de Elara para cada opción, ¿suenan a ella? ¿Alguna te parece que empuja demasiado?
4. ¿La tarjeta arriba en Hoy te ayuda a encontrar lo que te llevas, o te parece demasiado protagonista?
