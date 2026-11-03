# Three visual directions for the daily session (3 Nov 2026)

The redesigned session (C v2) risks feeling a little boring. These are three distinct visual and interaction directions, built on C v2 as the baseline, to compare **before** any broad visual change is made to the app. All of this is a **hypothesis for user testing**, not a validated design.

Open `compare-directions.html` to see the four key screens of each direction side by side at 393 px, plus the two no-disclosure closes and editing after completion. The prototypes are `c2.html`, `d1.html`, `d2.html` and `d3.html`.

## What is held constant

- **Content:** the same day (Money, week 2 in Wuzhen, day 1), the same two questions, the same sample answers («Mejorar mi trabajo actual» / «Preguntar a mi encargada si hay formación gratuita para subir de puesto.») and the same simulated replies as C v2, each labelled «Respuesta simulada».
- **Logic:** all four run the same code (`src/c2.js`). A direction only replaces the screen markup (`src/d1.js` to `d3.js`) and the styles (`src/d.css` plus its own file). Outcome rules, skips, «Cambiar», drafts, resume, offline handling, editing and the keyboard therefore behave identically. The shared e2e suite checks this on all four.
- **Assets:** only existing app assets are used:
  - the Wuzhen day photographs (week 2, days 1–7);
  - the Wuzhen keepsakes (lantern, bridge, boat…);
  - `elara-orb-new.png`;
  - the app's deckle-edged paper (`daily-path-reflection-sheet-v1.png`, resized);
  - Fraunces and Instrument Sans.

  Stamps, postmarks, ticket stubs, the canal line and tape are drawn in CSS or SVG. No imagery was generated or fetched.
- **Motion and access:**
  - every animation is under 0.6 s and a tap ends it at once;
  - nothing blocks input or the call to action;
  - nothing moves on the writing screen;
  - `prefers-reduced-motion` is honoured, and the reviewer panel has a «Movimiento: Normal / Reducido» toggle; when reduced, only opacity changes;
  - text is 14 px or larger, contrast is at least 4.5:1, targets are at least 44 px, and layouts hold at 130 % and 160 % on 360 and 393.

## What changed in C v2 first (to bring the baseline up to the same bar)

- **Editing after completion.** «Editar» on the close and on Hoy reopens step 2 with her words. It shows «Estás editando tu tarjeta de hoy.», saves with «Guardar cambios», and the close then reads «Tarjeta actualizada.». The same card updates on the close, on Hoy and in Tu colección. The × while editing discards the change and restores the card.
- **An intentional no-disclosure close.** When no takeaway was written («Ninguna por ahora» without a note, or a skip), the close title is the app's own «Listo por hoy» and the keepsake is the payoff («Tu recuerdo de hoy · farol de papel»). Hoy shows «Listo por hoy» and the keepsake and **quotes nothing**: no «Ninguna», no «Sin nota hoy», no «Pasaste esta pregunta». The full card on the close still records the slots honestly.
- **Smaller fixes:** the toast no longer transitions every property, and under reduced motion it only fades.
- A, B and C v1 are untouched (byte-identical).

## The three directions

### D1 · Tarjeta de colección (`d1.html`)

**What it is.** Her words gradually become a personal keepsake, a postcard she keeps.

**Interaction model.**
1. **Opening:** a blank card on a paper desk shows an empty stamp slot («Tu sello»), two ruled lines, and «Para llevarte» set as a ticket stub.
2. **Step 1:** picking an option prints her option as the caption of a perforated stamp with a Wuzhen photograph, which drops into the corner.
3. **Step 2:** a still, ruled card with no motion.
4. **Close:** a «WUZHEN · 3 NOV · SEMANA 2 · DÍA 1» postmark cancels the stamp, and the lantern is taped onto the card. Her words are set large in Fraunces italic with a hanging «.
5. **Hoy:** an album page («Tu álbum de Wuzhen») with today's card mounted in photo corners and a strip of seven stamp slots for the week. Day 1 is filled with the lantern.

**Brand character.**
- *Signature move:* the perforated stamp of her choice, cancelled by the Wuzhen postmark at the close. You remember "my answer became a stamp."
- *Deliberately avoided:* rounded cards with soft shadows (a deckle-edged paper on a desk instead); pill buttons (squared); dashed "tags" (solid hairline labels); centred stacks (the stamp hangs off the corner, the card is turned a degree); a progress bar (four tiny perforated stamps).

### D2 · Paseo por el canal (`d2.html`)

**What it is.** The session is a short walk through Wuzhen.

**Interaction model.** Each step is a stop on the canal: «El muelle», «El puente», «La casa de té», «El farol». The full-bleed photograph changes and pans to the next view, and an inked canal line with a small boat replaces the progress bar; the boat sails to the next stop. A torn paper slab rises over the photo with the content.
- **Writing:** the photograph collapses to a thin strip and nothing moves. With the keyboard open, the strip disappears.
- **Close:** the last stop, «El farol». The lantern is handed over (a short drop) and her words are pinned below as a note.
- **Hoy:** a postcard with the week drawn as the same canal with seven stops, and her note pinned at today's stop («Clavada en Wuzhen · Día 1»).

**Brand character.**
- *Signature move:* the canal line, progress as a place you move through rather than a bar, with the photograph moving with you.
- *Deliberately avoided:* text over photographs (the paper slab carries all the text, so contrast never depends on the image); cards with shadows for content; a generic progress bar; decorative motion while writing.

### D3 · Con Elara (`d3.html`)

**What it is.** A companion-led session in which Elara's orb is present throughout.

**Interaction model.**
- **Opening:** deep forest («de noche»). The large orb and her line («Hoy eliges por dónde empezar a mirar tus ingresos…») set big in Fraunces italic, with a sliver of canal photograph cut into the corner.
- **Step 1:** the orb shrinks next to the question, as if she is asking.
- **Step 2:** the orb steps aside. It becomes a still dot at the corner of a plain writing sheet, with no animation.
- **Close:** back to the night. The orb returns large to receive her words. Her closing simulated reply is what Elara "says" (labelled), and the card is handed back below on paper with the lantern.
- **No-disclosure close:** she says only a fixed line, «Hoy no hace falta escribir nada.», which is never presented as a reply.
- **Hoy:** the orb sits beside the greeting, and today's words appear on a dark slip under a sliver of canal, with the week as seven circles.

**Brand character.**
- *Signature move:* one living mark that moves between moments: large when she speaks, a still dot while you write, back to receive.
- *Deliberately avoided:* chat bubbles (the B concept); a mascot or avatar face; ambient pulsing during writing; gradients (flat forest night and paper); putting Elara's voice on generated-looking UI. Only the labelled reply is "her words".

## Trade-offs

| | C v2 (baseline) | D1 Tarjeta de colección | D2 Paseo por el canal | D3 Con Elara |
| --- | --- | --- | --- | --- |
| **Clarity** | Highest: named steps, a plain bar | High: the card's slots name the steps; the stamp progress is less literal than a bar | Medium-high: stop names are evocative, not instructive («El puente» says nothing about choosing), so «Parada 2 de 4» carries it | High: Elara literally introduces each moment; the step labels remain |
| **Calm writing** | Calm | Calm: still card, ruled field | Calm: photo shrinks to a strip | Calmest: plain sheet, the orb a still dot |
| **Delight** | Low | High at the right moments: the stamp drops when she picks, the postmark and tape at the close | High on entry and between steps (pans, sailing); a gentle arrival | Medium-high: the orb's return at the close |
| **Warmth** | Neutral | Warm, tactile, personal | Warm through place | Warmest relationally, but depends on Elara's voice landing |
| **Takeaway desirability** | Functional | Highest: an object worth keeping, and the album makes the week collectible | Medium: the pinned note is tied to the place, less an object | Medium: the card is handed back; on Hoy it is a note |
| **Build cost (React Native)** | Low: the existing step pager, takeaway card component and Hoy card | Medium: a card component with a stamp (mask or image), a postmark SVG and an album on Hoy. The pager and BandDay are unchanged. Masks in RN need `MaskedView` or pre-rendered stamp frames. | Medium-high: BandDay becomes per-step and panning (Reanimated), plus a canal progress component and a Hoy postcard map. Image memory with 4 full-bleed photos per day. | Medium: a shared-element orb across the pager (Reanimated layout transitions) and a night palette for two screens. The rest reuses the C v2 screens. |
| **Motion and accessibility risk** | Minimal | Low: three short one-shots, all skippable | Highest: pans and parallax are the classic vestibular trigger, so reduced motion must be respected | Medium: scale and translate of the orb; dark screens need care with large text |
| **Degrades with reduced motion** | Same | Well: the stamp and postmark simply appear | OK: the photo just changes and the boat jumps a stop, but the "walk" feeling is mostly lost | Well: the orb appears in place; the meaning (big vs dot) survives |
| **Degrades at 160 % text** | Well | Well: the stamp drops into the flow below the meta line | OK: photographs shrink to keep the words on screen, less "place" | Well: the canal sliver hides, the orb shrinks |

## Recommendation (a hypothesis to test, not a finding)

**Lead with D1's card, add D3's orb at the edges, and borrow one detail from D2: the week as stops along the canal on Hoy.** Concretely:
- D1's stamp, postmark and album are the core: the most desirable takeaway and moderate cost.
- D3's orb receives her words at the close only. Writing stays as in D1, with no orb in the corner (a static stamp is already there).
- On Hoy, the week strip is drawn as D2's canal with stamps at the stops, instead of a plain row. The per-step panning photography is left out.

**Why.**
- The "boring" feedback is mostly about the *payoff*, and D1 makes the payoff an object worth returning to. That also gives the strongest reason to come back tomorrow: the next empty stamp.
- D2's walk delights on entry, but carries the most motion and build risk, and its step names are less clear.
- D3 is warm but leans on Elara's voice, and the replies are still unvalidated.

**What would disprove it.**
- Testers can't say what the day was for after D1, whereas they can after C v2 (the card hides the purpose).
- D1's card is described as "cute" but nobody would look at it again on Hoy, and the album gets no reopening in a week.
- Testers prefer D3 or D2 when asked which one they'd come back to tomorrow, and say why in terms of the person (D3) or the place (D2) rather than the object.
- Anyone reports motion discomfort, or finds the stamp or postmark distracting while writing (it shouldn't be visible then; check).

## Short test plan

- **Who:** 6–8 testers from the current beta audience (women, Spanish first), on their own phones. Two of them should use larger text, and one should use reduced motion if any tester has it on.
- **How:** each tester does the day twice: C v2 plus one direction (D1, D2 or D3, rotated so each direction gets 2–3 testers). Order is counterbalanced. One session uses «Ninguna por ahora», to judge the no-disclosure close. Then show `compare-directions.html` for a preference ranking.
- **Ask:**
  1. «¿Para qué era hoy?» (clarity; compare with C v2)
  2. «¿Qué te llevas?», and point at it on Hoy (findability)
  3. «¿Te gustaría volver a ver esto mañana o el domingo?» (desirability)
  4. «¿Hubo algo que te distrajera mientras escribías?» (calm)
  5. «¿Cuál te haría volver mañana, y por qué?»
- **Watch for:** time to start writing, hesitation at the stamp or canal, taps on «Editar», whether they find the card on Hoy without help, and comments about the motion.
- **Signal:** the directions should be at least as clear as C v2 (Q1), with a clear majority choosing them in Q3/Q5. If nothing beats C v2 on Q3/Q5, the issue isn't visual.

## New Spanish strings for approval (propuesta, pendiente de María y Alejandra)

**C v2 (now in all four):** «Editar» · «Editar tu tarjeta de hoy» (a11y) · «Estás editando tu tarjeta de hoy.» · «Guardar cambios» · «Descartar los cambios y volver a tu tarjeta» (a11y) · «Tarjeta actualizada.» · «Tu recuerdo de hoy». «Listo por hoy» is the app's existing `day.arrival.done`.

**D1:** «Tu sello» · «Tu álbum de Wuzhen» · the postmark «WUZHEN · 3 NOV · SEMANA 2 · DÍA 1» (decorative; date and place come from data).

**D2:** the stop names «El muelle» · «El puente» · «La casa de té» · «El farol» · «Parada {n} de 4» · «Al final del paseo» · «Tu farol de hoy y, si quieres, una nota tuya.» · «Última parada · Wuzhen» · «Tu canal esta semana» · «Clavada en Wuzhen · Día 1» · «Mañana, la siguiente parada». The stop names are new; the app has its own stop lists (`globe.stops`), and Wuzhen uses the generic set, which these would replace.

**D3:** «Elara · Wuzhen · Día 1» · «Tu tarjeta, de vuelta» · «Hoy no hace falta escribir nada.» (fixed UI line, never a reply) · «Para llevarte, de hoy» · «Elara se aparta mientras escribes» (a11y label of the corner dot).

## Checks

Run from this folder: `node src/build.mjs`, `node src/shoot.mjs c2 d1 d2 d3`, `node src/e2e.mjs`.

**Results (3 Nov):**
- **E2E:** 213/213 checks pass across a, b, c, c2 and the shared suite on c2/d1/d2/d3; no JS errors.
- **Audit:** 496 audited captures (791 files in `shots/` for c2/d1–d3), 8,044 text checks.
  - Contrast: 0 failures. The lowest is 4.95:1 («Tu sello», D1).
  - Product text: smallest 14px. Only the reviewer tags are 13px.
  - 0 targets under 44px, 0 horizontal overflow, 0 clipped text, 0 overlapping text.
  - All 72 reduced-motion captures animate opacity only.
- **Fixes made along the way:**
  - D1 got a deeper ember ink on the desk (4.37:1 → 5.6:1).
  - The toast's catch-all transition was limited to opacity and transform.
  - Fraunces lines with tight leading got descender padding.
  - At large text, D1's corner stamp drops into the flow and D2's photographs shrink.
  - D2 no longer puts the status bar on the photograph.
  - D2 and D3 show «1 de 7» on Hoy.

**Screenshots** go in `shots/{c2,d1,d2,d3}-*`:
- every screen and state at 393×852 and 360×780;
- `-t130-` and `-t160-` for 12 key screens;
- `-rm-` for 7 key screens with reduced motion, plus `-rm-t160-`;
- `-desktop-1280` for the reviewer panel.

**The audit** covers:
- contrast of every visible text against its composited background;
- smallest text;
- targets under 44 px;
- horizontal overflow, clipping and overlapping text;
- in the `-rm-` captures, that only opacity animates.

Decorative `aria-hidden` marks (the postmark, the keyboard drawing) are excluded from the text checks.

**E2E:** the shared behaviour suite runs on c2, d1, d2 and d3. It covers:
- the happy path;
- calm writing (no running animations while she types);
- a close usable at once;
- the takeaway visible on Hoy without scrolling;
- editing from Hoy and from the close, with update and discard;
- «Listo por hoy» for «Ninguna» without a note and for both skipped, with nothing quoted on the close or on Hoy;
- «Cambiar» keeping the draft;
- leaving mid-draft, reloading and resuming;
- offline with exactly one retry and one continue;
- the keyboard at 393/100 % and 360/160 %;
- reduced motion with only opacity animating;
- no grading words on any screen or state.

## Caveats

- These are HTML/CSS approximations. The perforation masks, the postmark SVG and the orb's travel would need native equivalents in React Native: `MaskedView` or pre-rendered frames, and Reanimated shared transitions.
- The simulated replies are pre-written. D3 presents the closing reply as Elara's voice, so its success depends on real reply quality more than the others.
- The keyboard is drawn. Saving uses browser storage only and is tagged «Guardado simulado».
- The D2 stop names, D1's album and D3's night palette are new brand decisions. They are listed for approval, not assumed.
