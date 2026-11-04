# Money sessions V3.1: what she sees (4 Nov 2026)

`Elara_Dinero_V3.1_Lo_que_ve_ella.pdf` (16 pages, Spanish) is for María. It shows the seven pilot visits screen by screen, as the woman would see them. It is based on the V3 draft (`sources/Elara_Dinero_V3_borrador.pdf`). All the Spanish is a proposal until María and Alejandra approve it.

## Changes from V3

- **One order for the pilot.** All visits follow the «Cuentas» route: A → C → B → D·deuda → E·precios → F → G. The shares module and the growth variant wait until routes exist; their text is unchanged in V3.
- **A one-tap question opens every visit.** Its options are the branches V3 had already written, so Elara's reply on screen 3 is chosen by a tap. In V3, nothing selected those branches.
- **No more answer before the question.** In visits 1, 4 and 5, the screen-1 script used to state the answer to the screen-2 question. It no longer does.
- **The same rule opens and closes each visit.** In V3, visit 1 closed with a different sentence.
- **Plainer wording** for the phrases flagged in the review.
- **Visit 7 opens by picking one of the week's six rules**, so it is never empty.

## For the developers (not in María's PDF)

These claims were checked against the app code on `ux-fixes-2026-11-03`, built on `main` `1363407`. Which build TestFlight runs is still unknown.

Works on today's day engine (content only):
- **The seven visits as Money days 1-7, in a fixed order.** Which days they replace is an owner decision.
- **The one-tap opening:** a `choose` step.
- **The branch replies on screen 3:** conditional steps, `when: { step, valueIn }`, or written `replies` on the opening step.
- **Screen 2's explanation per option:** `choose` with written `replies` on a quiet step.
- **«La última vez guardaste: […]»:** a `{dN.step}` template. This works because the order is fixed.
- **The visit-7 rule picker:** a `choose` with six fixed options.

New work:
- **Quoting her welcome words in visit 1.** Day templates can only quote answers from days of the same path, not the onboarding. A version without the quote is written.
- **Replies to free text.** These are a model call. Adapt the V2 reply prompt (`apps/api/src/services/stepReply.ts`) to the V3 «contrato de respuesta» and rerun the reply bench before testers see it.
- **Membership after the first visit.** This is an onboarding routing change, and an owner decision.

Content also has to go into both the bundled app copy and the server seed.

## Rebuilding

`node src/build.mjs` rebuilds the PDF and the HTML from `src/content.mjs`. The build fails if any page overflows.

## Checked

- **Arithmetic:** visit 1 (300 − 180 = 120; 50 short), visit 3 (200 − 100 = 100; 200 − 50 = 150), visit 4 (100 + 10 − 20 = 90) and visit 5 (100 × 1.10² = 121) all hold.
- **Layout:** every page was rendered and looked at.
- **Not verified:** the Spanish (María and Alejandra decide) and V3's sources.
