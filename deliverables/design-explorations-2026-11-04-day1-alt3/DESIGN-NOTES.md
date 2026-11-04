# Money Day 1 · Alternative 3: the month on one line

This is an isolated, clickable prototype. Open `prototype/index.html` in any browser (it works from `file://`); the layout is built for a phone. It is not production code, and nothing was deployed. The content and arithmetic are V3.2 Day 1, unchanged. Spanish is the main language. «Revisión» (top right, review only) switches to the English V3.2 copy, simulates a save error, and restarts.

## The approach and why

**A tappable vertical timeline of Ana's month, revealed date by date, with what she has left shown under every date.**

The lesson is about order in time: money arriving later can't pay an earlier bill. A timeline makes that order physical. The client's US$200 starts on the line as a dashed card at day 10, marked «Prometido · Sin confirmar». When she reveals day 12, the card moves to day 14, below the electricity bill. The gap is something she sees happen, not just a sum.

Two approaches were rejected:

- **A calendar grid.** It's familiar, but a month grid hides the sequence: the eye reads across weeks, not down through payments, and 31 cells crowd a 360-px screen.
- **A balance bar that drains and refills.** It shows the amount well, but the dates disappear, which is the opposite of today's rule.

## Key decisions

1. **Two taps of progressive reveal** (`Ver el día 5`, then `Ver el día 12`), with no drag or swipe. Each tap adds one fact, so she meets the balance (US$120) before the question.
2. **The promised payment moves.** It goes from «Prometido para el día 10» to «Llega el día 14», and the old date stays struck through. This puts V3.2's script line «dice que pagará el día 10, pero no está confirmado» on the line itself, without stating the answer.
3. **Each option has its own V3.2 feedback and changes the timeline:**
   - **US$50 short (correct):** day 12 shows «! Falta US$50», and day 14 shows «Llega el día 14: tarde para la luz».
   - **US$150:** a struck-through «+US$200 el día 12» appears, with «no está: llega el 14», and the day-14 card nudges up and falls back.
   - **US$120:** the bill shows as «Sin restar todavía».
4. **She can change her choice at any time.** The feedback opens under the chosen option and is replaced when she changes. After a tap, the page scrolls so the whole feedback and the timeline above it are on one phone screen. This is checked in the tests.
5. **«No estoy segura, muéstrame» is not a skip.** It stays on the screen and walks the timeline step by step: 300 − 180 = 120, then 120 − 170 = −50, then the day-14 payment arrives late. The written steps sit right under the timeline. It enables «Continuar» without making her pick.
6. **«Prefiero pasar» is a real skip.** It moves on without revealing anything. The next screen offers «Ver la explicación», and nothing is hidden behind the skip.
7. **The four personal-context branches each need an explicit tap**, and changing the tap swaps the reply. «Tengo otra pregunta» opens an optional field. «Pregunta guardada» appears only after the save resolves; a failure keeps her text and offers «Reintentar». The same rule applies to «Guardar mi regla».
8. **Finishing without saving** ends on a screen that claims nothing was saved.
9. **No audio controls**, because no recording exists.
10. **Labels as well as colour.** Every state has a word beside its shape: filled disc for past dates, double ring for the date in question, dashed for pending. This is the same rule the Atlas timeline follows (`components/atlas/TimelineParts.tsx`).
11. **Style.** Colours and type are Elara tokens: background #F9F5EF, Fraunces and Instrument Sans. Ember means forward («Continuar»), forest means commit («Guardar»). Cards use the 8-px radius and buttons are pills. Body text is 16-17 px, and every button is at least 44 px tall.
12. **Reduced motion.** With reduced motion on, the walkthrough and the scrolling happen instantly.

**Small copy adaptations, flagged for María:**
- The opening explanation is V3.2's concept sentences plus «Hoy lo vemos en el mes de Ana, fecha por fecha». The amounts move onto the timeline.
- The «Tengo otra pregunta» reply is split into a before-save line and an after-save line, so «guardada» is never shown before it's true.
- «Así es» and «Mira la línea» label correct and wrong feedback.

## Reuse vs new work

These were checked against the app code (`/home/user/elara-uxfix`: `main` 1363407 plus the pending fix branches).

**Reuses what exists:**
- **Feedback written per option, shown instantly, no AI:** a quiet `choose` step with `replies` (`StepScreen.tsx`, `showsAuthoredReply`; `practice.ts`, `authoredReply`).
- **Branches selected by a tap:** a `choose` step plus written `replies`, or conditional steps (`when: { step, valueIn }`, `offered.ts`).
- **«Tengo otra pregunta» with text:** `otherLabel` on `choose` (`types.ts`).
- **«Prefiero pasar»:** `stateOptions: ["skipped"]`.
- **«No estoy segura»:** the answer state `unsure` exists (`answerStates.ts`).
- **Hiding audio unless a recording exists:** StepScreen renders the voice note only when `voiceNote.audioUrl` is set.
- **Keeping the rule:** `keep: "rule"`.
- **Explicit saving of a kept line:** the `saved` flag and `PUT …/steps/:stepId/saved` exist on the unmerged `ux-fixes-2026-11-03` branch (issue 05).
- **Brand tokens and reduced motion:** `packages/tokens`, `apps/mobile/src/motion/useReducedMotion.ts`.

**New work:**
1. **The timeline itself.** A money-timeline renderer, as a new step kind or a custom renderer for an `info` step, needs four things:
   - reveal stages;
   - a running balance;
   - a pending card that moves;
   - a visual state per option.

   The Atlas timeline's shape language can be reused; its component can't, because it lays out weeks.
2. **Showing the worked explanation after «No estoy segura».** Today a state carries no written reply; only options do.
3. **«Ver la explicación» after a skip.**
4. **An honest saved confirmation for her question.** Answers go through the offline-first `store/stepQueue.ts`. «Guardada» should either wait for the server to accept it, or say «Guardada en este teléfono» until it syncs. That's a product decision.
5. **Auto-scrolling** that keeps the feedback and the timeline on one screen.
6. **The English review toggle** is review-only. The app's i18n would show only one language to her.

## What was tested

`node e2e/run.cjs` (Playwright, Chromium) gives **101 passed, 0 failed** (`e2e/e2e-log.txt`). It covers:
- the opening (no answer given, no audio);
- the progressive reveal and the payment moving;
- each wrong option, then changing to the correct one, with exactly one option pressed;
- «No estoy segura» with no pick;
- skip, then «Ver la explicación»;
- all four branches, and switching between them;
- saving her question: empty, success, and failure then retry, with her text kept;
- saving the rule: failure then success;
- finishing without saving;
- the EN toggle mid-flow, keeping her choices;
- «Atrás», keeping her state;
- phone-view checks that the whole feedback (or the steps) is on screen with the timeline;
- 360×780: no horizontal scroll, the primary button visible on every screen, every visible button at least 44 px tall;
- reduced motion.

Screenshots of every state are in `shots/`: 390×844 at 2×, plus two 360×780 viewport shots and `contact-sheet.png`.

**Not verified:**
- a real phone (touch, VoiceOver/TalkBack, Dynamic Type);
- the copy with María;
- whether the women understand the moving card better than V3.2's static version. That needs the test with people.

## The artifact version, v2: her own month, real photos

`artifact/el-mes-de-ana.html` is the published page («Tu mes, fecha por fecha»). It keeps the same file name, so the link stays the same. v2 makes two changes, both from team feedback.

**1. The day is about her month, not only Ana's.** The opening offers «Empezar con mi mes» as the main button, with «Ver primero el ejemplo de Ana» beside it. Ana's timeline is unchanged and still has the per-choice feedback. Step 3, «Tu turno: ahora, tu mes», asks for:
- the day she gets paid, or «Todavía no sé la fecha seguro»;
- up to three payments (a name chip plus a day);
- optionally, the amounts and what she has today.

«Ver mi mes» draws her own timeline. **The code does the arithmetic. There is no AI.** Each outcome has an authored message:

| Her situation | What she sees |
|---|---|
| A payment leaves her short before payday | «El día 12 te faltarían $50.000 para la luz o los servicios. Tu dinero llega el día 15: tarde para ese pago.» |
| She is short even counting her pay | the line above, plus «Aunque cuentes tu cobro, faltarían $30.000. Eso ya no es solo un tema de fechas.» |
| Covered | «Con estas cifras te alcanza hasta el día 15.» |
| Dates only, no amounts | «Arriendo o alquiler (día 5) sale antes de tu cobro (día 15)…» |
| Payday not confirmed | «Tu cobro está por confirmar. Hasta saber la fecha, no lo cuentes para estos pagos.» |
| Payments after payday | «ese dinero sí llega antes» |
| Same day as payday | asks her to confirm which comes first |

Amounts are optional and whole numbers only, formatted as she types (es-CO: `180.000`). The V3.2 branches are now chips under her month, each opened by a tap. «No sé bien cuándo me pagan» also ticks «por confirmar». «Hoy prefiero quedarme con Ana» puts her form away and shows Ana's month in four lines.

**What is saved:** the postcard carries the rule and her dates («Tu cobro: día 15. Antes salen: arriendo o alquiler (5), luz o servicios (12).»), never amounts. The button says so: «Guardar mi regla y mis fechas». As before, «Guardado» appears only after the save succeeds.

**2. Real photos, no cartoon faces.** The team said the women like realistic photos. The page now uses the app's own Lan Hạ photos, not generated images:
- `apps/mobile/assets/places/h/lh.jpg` heads the opening and is the front of the postcard;
- `days/lh/d1.webp` is the band on the end screen.

The faces and legs are gone from the icons, which are now plain line icons. The warmth stays in the paper details: the taped rule, the stamp, the moving envelope in Ana's month.

**New copy for María and Alejandra to approve:**
- the opening line;
- «Tu turno» and its field labels;
- the privacy line;
- every message in the table above;
- «De Elara, desde Lan Hạ».

The privacy line («no se comparte con nadie») needs the same check as the consent promise in the test kit.

**Reuse vs new:**
- *Reuse:* the photos (already in `placeImages.ts` / `dayImages.ts`); `choose` with written `replies` for the branch chips; `keep: "rule"`; the share card (`ShareCardSheet.tsx`) for the postcard.
- *New:* a «my month» step: day pickers, optional amounts, a computed timeline and message templates. It is new because `blanks` collects text but doesn't calculate. Also new: saving her dates without amounts, and currency formatting by locale.

**Tested:** `node e2e/run-artifact.cjs` gives **108 passed, 0 failed** at 360×780 (`artifact/e2e-log.txt`). It covers:
- both starting paths;
- every message above, with the arithmetic checked;
- validation, editing, and adding and removing a payment;
- each branch, the question save (empty, then failure, then retry) and the rule save (failure, then success);
- finishing without saving, and skipping;
- the EN toggle keeping her inputs;
- dark mode;
- the photos loading;
- no horizontal scroll and every touch target at least 44 px.

Shots are in `artifact/shots/`.

**Not verified:**
- whether women will type real dates on day 1;
- whether «$» without a currency code reads right in every country;
- a real phone.
