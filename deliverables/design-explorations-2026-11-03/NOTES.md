# Daily session: three clickable prototypes (3 Nov 2026)

One Elara daily session (Money, Wuzhen, «Hacia el camino adelante») built three ways, so testers can compare structure and pacing on the same content. Open `index.html`. Each prototype has a reviewer panel ("Ver estado") beside the phone, or below it on a phone screen.

These are prototypes, not production. Every Elara reply is pre-written and synthetic, and is labelled «Respuesta simulada». No real journal, network AI call or production service is used. State is kept only in the viewer's browser (`localStorage`).

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Entry page, one card per concept |
| `a.html`, `b.html`, `c.html` | Self-contained prototypes (inline CSS and JS, relative asset paths) |
| `assets/` | Copied from `/home/user/elara/apps/mobile/assets` (Wuzhen day 1 and 2 photos, keepsakes day 1 and 2, `elara-orb-new.png`) and fonts from `node_modules/@expo-google-fonts` (Fraunces, Instrument Sans, OFL). No new imagery. |
| `shots/` | Playwright captures at 393×852 (every screen and state, plus `-scrolled` for long screens) and at 360×780 (every screen) |
| `src/` | Sources: `content.js` (the single content object), `shared.css`/`shared.js`, one `.css`/`.js` per concept, `build.mjs` (inlines them into the HTML), `shoot.mjs` (captures, and checks for horizontal overflow and touch targets under 44 px), `e2e.mjs` (click-through test: answer, leave mid-session, reload, resume, finish, offline path) |

To rebuild: `node src/build.mjs`, then `node src/shoot.mjs` and `node src/e2e.mjs`, run from this folder.

## Sources

**Used**

- Current screens: `deliverables/ui-polish-2026-11-02/after/` (1 photo step, 2 typing, 3 reply, 7 Hoy) and `before/` (same set, for the earlier look).
- María's TestFlight screenshots 00000193 and 00000194 (this exact day: question 1 with «Mejorar mi trabajo actual» selected, then «Para llevarte»), 00000197 and 00000201 (onboarding and assessment styling), and 00000204 (Explorar and the tab bar). I did not read anything else in that chat folder.
- Visual identity: `packages/tokens/src/colors.ts` (the palette, the forest/ember roles, and the rule that Elara speaks in italic serif on peach). Fonts and assets as listed above.
- **Content of record:** `apps/api/drizzle/seed-content.sql`, `path_day` money/es day 8 (steps `ask` and `take`, the authored `elara` lines, `config.minutes`, `config.payoff`, `config.intro.note`). The question, options and takeaway text are identical in `tools/curriculum/curriculum-210.json` (`MONEY-W2-D1`) and on María's 2 Nov screenshot.
- Purpose and learning objective: there is no per-day objective field. The closest content of record is the week takeaway (`weeks-30.json` and the PDF: «Un criterio de oportunidad y una pregunta verificable.»), the seed's day `payoff` («Para llevarte esta semana: un criterio de oportunidad y una pregunta verificable.») and the curriculum's principle (PDF p.1: «Cada día deja algo concreto: una distinción útil, una frase, un dato pendiente, una decisión pequeña o una nota que se puede recuperar.»).
- Reply guidance: there is none specific to this day. I used the generic rules in `apps/api/src/services/stepReply.ts`: under ~280 characters and two or three sentences; reflect something she actually said; offer anything beyond that tentatively; no em dashes; a mid-day reply bridges to the next step **without a question**, and the last step closes the day **without a question**. Both simulated replies follow these rules (193 and 184 characters). When there is no model reply, the app shows the authored fallback lines, and the prototypes do too.
- App UI strings, reused verbatim where they exist: `apps/mobile/src/i18n/locales/es/practice.ts` («Elara notó», «Elara está pensando…», «Terminar por hoy», «Intentar de nuevo», the offline-saved line, «Tu colección», «Frase»), `day.ts` («Guardando tu lugar»), `globe.ts` («Sigue donde lo dejaste»), `home.ts` (Wuzhen keepsake names), and the `useTodayEntry.ts` button pattern («Empezar el día N» / «Seguir con el día N»).
- Architecture, for build-cost estimates: `apps/mobile/app/path/day.tsx`, `StepScreen.tsx`, `day-complete.tsx`, `collection.tsx`, and `components/practice/{draft,pendingReplies,collection}.ts`.

**Not available, or ambiguous**

- **Approval status of this day:** unknown. It is labelled «Contenido actual de la app (aprobación por confirmar)» everywhere. The curriculum PDF calls itself a «propuesta nueva, no copia de producción».
- **Week numbering:** the brief says "Week 1 Day 1". In the repo this is **path week 2** («Ingresos y posibilidades»), path day 8. The app shows it as «Wuzhen · Día 1» because Wuzhen is the week-2 place. The prototypes say «Semana 2 · Día 1».
- **Two versions of the takeaway text exist.** The server seed, the PDF and María's device say «Elige una vía para investigar, sin tener que aceptar trabajo ni pagar nada.» The bundled mobile copy (`apps/mobile/src/i18n/locales/es/pathCopy/money.ts`, commit 75694f6 on 30 Oct, marked "new Spanish copy still needs native review") says «Nombra una cosa sobre la parte que elegiste que podrías averiguar esta semana. No hace falta aceptar trabajo ni pagar nada.», and it also has a shorter week note. María saw the seed text, so **the prototypes use the seed text**. The bundled variant appears below only as an existing proposal.
- The day title «Hacia el camino adelante» is generated from the place's stop names (`placeDay.ts`), not authored per day.
- No real user data, no Google Fonts request (fonts are local copies), no new imagery.

## Identical across A, B and C

All three files inline the same `src/content.js`, so the following cannot drift between them:

- The question, its «Elige una.» line, the six options and «Prefiero pasar». «Para llevarte» with its body and the «Con tus propias palabras…» placeholder.
- Purpose: the week payoff line, the week intro note, and one framing line (see "Prototype copy").
- Synthetic answers: she picks **«Mejorar mi trabajo actual»** and writes **«Preguntar a mi encargada si hay formación gratuita para subir de puesto.»** (a "use the sample answer" button fills it in).
- Simulated mentor replies, same text in all three:
  - after the choice: «Elegiste mejorar tu trabajo actual. Empezar por algo que ya conoces puede ser un buen punto de partida: quizá ya sabes a quién preguntar. Ahora lo llevamos a una sola cosa que puedas averiguar.»
  - after the takeaway: «Preguntar a tu encargada por formación gratuita es concreto y no te compromete a nada. Es algo que puedes hacer esta semana, y la respuesta ya te dirá algo. Queda guardado para mañana.»
  - If the reviewer picks another option, types something else, or taps «Seguir sin esperar» when offline, the authored fallback appears instead («Eso ayuda. Puedes cambiarlo cuando quieras.» / «Algo pequeño y claro es suficiente. Se queda contigo.»), labelled «Línea escrita de respaldo». This is what the app already does when there is no model reply.
- Payoff: her sentence, kept, with the Wuzhen day-1 keepsake («farol de papel»).
- Reason to return: the real day-2 question («¿Qué sabes hacer que podría servir en una oportunidad que te interesa?», ~4 min) and its keepsake («puente de piedra»).
- Edge states: loading («Elara está pensando…»); offline («Ahora no hay conexión» plus the app's saved-on-this-phone line, «Intentar de nuevo», «Seguir sin esperar»); leave mid-session (sheet «¿Lo dejas por ahora?», then Hoy shows «Sigue donde lo dejaste · Paso N» and «Seguir con el día 1», and this survives a reload); finished (Hoy shows the keepsake on day 1 and «Ver lo que respondiste»).
- Hoy entry and exit, the minimal shared version. Other tabs show a "fuera del alcance" toast.

**Prototype copy (new, not content of record, needs Alejandra/María):** «Hoy eliges por dónde empezar a mirar tus ingresos. Los próximos días parten de esa elección.» (why today) · «Mañana partimos de lo que elegiste hoy.» · «Ahora no hay conexión» · «Seguir sin esperar» · the leave sheet («¿Lo dejas por ahora?», «Tu lugar queda guardado…», «Salir y guardar», «Seguir aquí») · «Hoy lo dejaste aquí. También cuenta.» (when the takeaway is skipped) · per-concept labels (A «Por qué hoy», «Hoy te llevas esto»; B «Enviar»; C «Lo que te llevas hoy», «Tu elección», «Añadir a mi tarjeta», «Lista para esta semana», «Queda en Hoy durante toda la semana.»).

## A · Guided step-by-step (`a.html`)

**Flow:** Hoy → **Por qué hoy** (photo band, title, forest «Por qué hoy» card with the framing line and week payoff, the two steps previewed, the week note) → **Paso 1 de 2** (choice) → **Elara notó** (its own screen: orb, then loading, reply or offline) → **Paso 2 de 2** (her choice echoed at the top with «Cambiar», then «Para llevarte») → **Elara notó** → **Cierre** («Hoy te llevas esto»: her sentence on a card, stamp keepsake, «guardado», 1 of 7 plus the week payoff, a «Mañana» card with the day-2 photo) → Hoy («Para retomar · Hoy dijiste» and «Mañana»). A four-segment progress bar (Por qué hoy · Elegir · Para llevarte · Cierre). Back steps back one screen; × leaves with the sheet.

- **Clarity:** highest. Every screen does one thing, and purpose comes before effort. The «Por qué hoy» screen is the direct answer to "unclear purpose".
- **Feeling understood:** moderate. The reply gets a whole screen, which gives it weight. If the reply is generic, though, an empty-looking screen makes that more visible.
- **Effort:** the most taps (7 screens for a 3-minute day), so it can feel slow for returning users. One option is to skip «Por qué hoy» after the first day of a week.
- **Build cost:** low. The current `day.tsx`/`StepScreen` is already a step pager with a reply card and a completion screen. The main changes would be an intro screen, the reply as its own step, echoing the choice on step 2, and adding «Mañana» to `day-complete.tsx`.
- **Risk:** it may still feel like a form. It fixes clarity more than the "no new insight" feedback.

## B · Conversation with Elara (`b.html`)

**Flow:** Hoy → **one thread**: mini postcard and status tag; Elara says why today (italic serif), then the week payoff and week note; Elara asks Paso 1 → the **docked tray** at the bottom holds the six options with «Enviar» / «Prefiero pasar» (still a structured single choice) → her answer becomes a forest bubble with «Cambiar» → typing bubble («Elara está pensando…»), then the reply, or an inline offline bubble with retry → Elara asks «Para llevarte» → the tray becomes a short text box with «Terminar por hoy» → reply → divider «Día 1 completado» → Elara hands over the keepsake card with her sentence, and the «Mañana» card → «Volver a Hoy». The header shows Elara, the step and a two-segment progress bar. After a resume, the thread is restored with an ember divider, «Sigue donde lo dejaste».

- **Clarity:** good inside the session, because the conversation explains itself. Purpose arrives as Elara's words rather than as a label, which may read warmer, or may be skimmed.
- **Feeling understood:** potentially the highest. Her answer and Elara's reflection sit next to each other, and the next question visibly follows from them. This is also where weak replies hurt most: a generic line in a conversation feels like being ignored.
- **Effort:** low per step. The thread grows long (the week note is a dense block), and the six-option tray takes about 40% of the screen at 360 px.
- **Build cost:** medium to high. It needs a new day layout (a thread with a docked input) on top of the existing step data. Bubbles could come from Ask Elara, but replay, resume, «Cambiar» (which truncates the thread) and accessibility of a live thread are new work. It also blurs the line with the Pregunta tab, which is already a chat.
- **Risk:** expectation mismatch. Testers may try to chat freely, and the day is not free chat. It also depends most heavily on reply quality, which is not validated.

## C · Action-first, a takeaway card (`c.html`)

**Flow:** Hoy → **Lo que te llevas hoy** (title and an empty «tarjeta» showing two slots, «Tu elección» and «Para llevarte», with a greyed keepsake, then the framing line, week payoff and week note) → **paso 1 de 2** (a mini card at the top fills live as she picks, «Añadir a mi tarjeta») → **paso 2 de 2** (the card itself: her choice filled, Elara's note on the card with loading/reply/offline, and the «Para llevarte» text box *inside* the card) → **Lista para esta semana** (the full card with keepsake, both slots and Elara's closing note; «Queda en Hoy durante toda la semana», «Guardada en Tu colección», the «Mañana» card) → **Tu colección** (Semana 2, «Frase») → Hoy with **«Tu tarjeta de esta semana»** pinned under the week, plus «Mañana».

- **Clarity:** high on *what she leaves with*. The empty card answers "what is this for?" before she starts. Purpose in words is less prominent than in A.
- **Feeling understood:** moderate. Elara's note sits on her own card, so feedback reads as something added to her work rather than a verdict. Placing her choice and her sentence on the same card shows how they connect (the gap María noticed) without changing any copy.
- **Effort:** low, and the payoff is visible all the way through. It is the only concept where the takeaway survives the session (on Hoy all week), which also gives her the clearest reason to come back.
- **Build cost:** medium. It reuses the step pager for the inputs. It needs a card component, a pinned slot on Hoy, and a link to the existing `collection.tsx` (takes are already `keep: "sentence"`). The "fills as you go" effect is cheap.
- **Risk:** on days where the takeaway is weak or skipped, the card looks thin, and a pinned empty-ish card on Hoy could feel like homework. At 360 px the «Para llevarte» box starts near the fold under Elara's note (I removed the photo on that step to keep it visible).

## Recommendation (a hypothesis, not a finding)

**Hypothesis to test:** C's structure, with A's explicit «Por qué hoy» line on the first screen, will best address the tester feedback (unclear purpose, no new insight, too open). The reasoning: showing the tangible thing she leaves with *before* she answers makes the purpose concrete, and keeping it on Hoy gives a reason to return that does not depend on reply quality. It also costs less than B on the current step-screen architecture.

This rests on design reasoning and a handful of comments, **not on research**. Nothing here has been validated with users. Suggested test: 5–6 testers, each doing the same day in two of the three concepts (rotate the order), then asking: "¿Para qué era hoy?", "¿Qué te llevas?", "¿Sentiste que Elara te escuchó?", and "¿Volverías mañana? ¿Por qué?". Keep B in the test: if testers rate "feeling understood" far higher in B, that outweighs its build cost. Copy problems (below) will confound all three concepts unless they are fixed, or held constant as they are here.

## Cambios de contenido sugeridos (propuestas; nada aplicado en los prototipos)

1. **«Para llevarte» (propuesta de Kara, pendiente de revisión):** «¿Qué podrías hacer esta semana para mejorar tu situación en tu trabajo actual?». It ties the takeaway to her choice. It only fits «Mejorar mi trabajo actual», so it needs a variant per option, or a template that quotes the chosen option.
2. **Variant already in the repo (bundled copy, not on the server, pending native review):** «Nombra una cosa sobre la parte que elegiste que podrías averiguar esta semana. No hace falta aceptar trabajo ni pagar nada.» It is generic but connects to her choice. Suggest checking whether this was meant to be deployed.
3. **Template with her choice:** for example, «Sobre “{opción}”: escribe una cosa que podrías averiguar esta semana, sin aceptar trabajo ni pagar nada.» The app already has template plus `bodyFallback` support for this.
4. **One example under the box** to make it less open-ended, for example «Por ejemplo: preguntar si hay formación gratuita.» It would need one example per option.
5. **Shorter week note** for the first screen. The seed version is 4 sentences, and the bundled version is already shorter.
6. «Ninguna por ahora» and «Prefiero pasar» currently both lead to the same takeaway, which then makes no sense. Suggest skipping or adapting «Para llevarte» when she picks «Ninguna por ahora».
7. Approve or replace the framing line «Hoy eliges por dónde empezar a mirar tus ingresos. Los próximos días parten de esa elección.» (prototype copy), and «Mañana partimos de lo que elegiste hoy.»

## Preguntas para María

1. ¿Con cuál de las tres entendiste mejor para qué era el día de hoy?
2. En la C, ¿te ayuda ver la tarjeta vacía al principio, o te parece una tarea más?
3. En la B, ¿esperarías poder escribirle a Elara libremente? ¿Te molestaría no poder?
4. ¿Te gustaría ver tu tarjeta en Hoy toda la semana, o prefieres que se guarde sin estar a la vista?
5. Las dos respuestas simuladas de Elara, ¿suenan a ella? ¿Hay alguna palabra que no dirías?
6. Con la frase actual de «Para llevarte», ¿qué habrías escrito tú después de elegir «Mejorar mi trabajo actual»?
7. ¿La propuesta de Kara te parece más clara? ¿Funcionaría también para «Cobrar un pago pendiente» o «Conocer apoyos disponibles»?
8. ¿Qué te haría volver mañana: ver la pregunta de mañana, tu tarjeta, o ninguna de las dos?

## Caveats

- The fonts are the app's own files, but the layout is HTML and CSS, so spacing, the tab bar and the status bar only approximate the React Native app.
- Simulated replies are written to the app's rules but are not model output. Real replies may be weaker or stronger, so judge structure, not wording.
- The reviewer panel's "Sin conexión" simulates only the reply failing. Saving her answers offline is described by the copy, not implemented.
- Accessibility was only partly checked: touch targets of 44 px or more were checked automatically, and roles and labels were added. There was no screen-reader pass and no large-text pass.
