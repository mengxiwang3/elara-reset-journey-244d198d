# Daily session: implementation notes

Branch `daily-session` in `/home/user/elara-session`. It is based on `origin/main` (`1363407`) plus the UI polish commit `f24224d`. Nothing was pushed, merged, deployed or migrated, and no paid API was called.

| Commit | What it holds |
|---|---|
| `cd17894` | Contract and server: the `purpose`, `card` and `noneOption` fields; the «Ninguna» and skip helpers; the copy and seed rows for Money days 8–9; no reply for a skip; the V2 reply prompt; API tests |
| `7b4b3ce` | App: the opening, the linked Q2, the close, Hoy, and «Pedir la nota de Elara» |
| `9fcbe63` | App: Q2 while typing (compact), plus small polish |
| `5150354` | App: the opening and the close fit the screen, a retry invitation is never shown on a later screen, «No sé» is never carried to Hoy, and the P1-9 fixes |
| `be1a05e` | Server: the V2 prompt only on days with a `purpose` (other days keep their prompt verbatim), and «No sé» accepted on those days. App: Q2's row puts the label over her words, and this step's own reply sits right under the field |

`session.patch` is `git diff f24224d..HEAD` and `full-stack.patch` is `git diff origin/main..HEAD`.

## Per item

### P0-1: content fields. Done.
- **Contract.** `DayConfig` gains `purpose?`, `card?: { label, hint? }` and `noneOption?` (`packages/shared/src/types.ts`), validated in `dayConfigSchema` (`schemas.ts`).
- **Bundle.** `PathDayCopy.purpose` and `PathStepCopy.card` (`i18n/locales/en/paths.ts`). `composeDay`/`composeStep` carry them (`content/paths.ts`). Day 8 ask has `noneOption: 5` (`content/pathDays/money.ts`).
- **Copy.** `es`/`en` `pathCopy/money.ts` hold the day 8 and 9 purpose and card slots, and the day 8 take body and `bodyFallback`, all exactly as written in DESIGN-DECISIONS.
- **Seed.** `gen-seed.mjs` already composes through `composeDay`, so it needed no change. I ran it in full and copied in only the four `money` day 8/9 rows (en, es) of `apps/api/drizzle/seed-content.sql`.
  - Side effect: those rows also pick up the bundle's 30 Oct one-line week note («Cada pregunta es opcional, y nada aquí te pide…»), because the seed had not been regenerated since `75694f6` changed it. That text is the newer one.
- **Server content path.** `toDayDTO` serves config as stored. `progress.ts` reads `purpose` into the step context for the reply prompt.
- **Parity.** 82 problems before, 78 after, and none is for Money days 8–9. All 78 predate this branch (see Checks).

### P0-2: opening screen. Done.
- **What shows.** On a day with a `purpose`: the eyebrow «Wuzhen · Día 1 · Unos 3 minutos», the stop title, «Por qué hoy» with the purpose, and «Hoy te llevas» with the card empty. The card has one slot per carded step, with the hint as placeholder text.
  - On the first day of a week, the week note follows.
  - On later days, «La última vez anotaste» follows, with her previous takeaway verbatim and «Día N».
  - Then «Empezar».
- **When it shows.** `opensOnSession` (`apps/mobile/src/lib/session.ts`, tested) shows it only on the way in. It never shows when there is a step param, a remembered step, a saved answer, a draft with content, a finished day or a replay.
- **Files.** `app/path/day.tsx` builds the content. `landscape/BandDay.tsx` (`SessionOpeningScreen`) renders it. `landscape/useWorldDay.ts` freezes the poster opening for session days. `TakeawayCard.tsx` (`preview`) draws the card.
- **Fitting the screen.** The picture steps down to 200 pt on session screens (`sessionBand` in `photoDay.ts`, tested). The empty card is a compact preview, which the design asks for («The skeleton preview is kept small»).
  - At 393 × 852, everything is on the first screen on day 8 and day 9.
  - At 360 × 780, the last line of the week note (day 8), or «Día 1» under the last takeaway (day 9), needs a scroll. The text cut at the bottom shows that there is more.

### P0-3: Q2 layout. Done.
- **Layout.** The compact row has «Tu elección» over her choice (two lines at most), with «Cambiar» beside it. «Cambiar» goes back to Q1 with her choice selected, and the Q2 draft is kept with the choice it was written under (`draft.basis`). Then «Para llevarte», the instruction, and the field, which comes first.
- **Elara's note.** It sits under the field, smaller (`ElaraNote.tsx`), and is hidden while the keyboard is up.
- **Changed choice.** If the choice changed under a draft that has words in it, the note «Cambiaste tu elección. Revisa si lo que escribiste sigue encajando.» shows (`choiceChangedUnder`, tested).
- **Keyboard up** (`typingCompact` in `StepScreen.tsx`, `compact` in `ReflectInput.tsx`). The band is the keyboard strip. The choice row, heading, instruction and a shorter field all stay visible, with the button above the keyboard. The harness checks each of these with a hit-test at 393 and 360 wide.
- **Pinned line.** If she scrolls while typing, the pinned question line is the instruction, not the heading.

### P0-4: «Ninguna por ahora». Done.
- **Helpers** (`packages/shared`, tested): `noneOptionOf`, `isNoneChoice` and `stepOutcome` → `"none"`.
- **Where it changes behaviour.**
  - `fillTemplate` and `headlineValue` never quote it.
  - `describeAnswer` tells the model "(they said there is none right now)".
  - `usesBodyFallback`/`stepBody` give Q2 the option-free instruction.
  - `shiftedRows` leaves it out.
  - The card shows the choice, and «Sin nota por hoy» when Q2 is empty.
  - Hoy never quotes it.

### P0-5: skips. Done.
- **Server.** `routes/me.ts` uses `isSkippedAnswer` (shared). A skip, auto or explicit, makes no model call, stores no reply, gets no personalisation pass, and never reuses an older reply. `replyToStep` has the same lock as a second line of defence.
- **App.** No Elara note follows a skipped step. A day whose last step was skipped has no closing line from Elara, on every photo day (`elaraHidden`).
- **Both skipped.** The day completes with «Listo por hoy», no card and nothing invented. The harness checks Hoy and Tu colección.
- **Tests.** `apps/api/test/daily-session.test.ts` has 27 tests and a fake AI binding that records calls.

### P0-6: closing screen. Done.
- **What shows.** «Hoy te llevas» with the filled card: her choice and her exact words, wrapping in full. «Editar» opens the existing `?step=` link onto Q2 with her text.
- **Elara's note.** It sits under the card, labelled «Elara notó» (generated) or «De Elara» (authored).
- **Then:** the honest saved or offline line; «Mañana: <first question of the next day>» (`nextQuestion`, which never prints unresolved braces); «¿Te sirvió…?»; «Volver a Hoy».
- **When nothing was written.** If she wrote no takeaway (Q2 skipped, «Ninguna» without a note, or both skipped), the title is «Listo por hoy». With both skipped there is no card.
- **Band.** The close uses the same 200 pt band as the opening, and the pill that repeated the eyebrow is gone.

### P0-7: Hoy. Done.
- **Day done.** «Hoy te llevas · Día N» with her words at the top, clamped to three lines. Tapping it opens that day's close.
- **New day.** The day card first, then «La última vez anotaste · Día N» above the week tracker.
- **«Para retomar».** Removed, together with `recallFor`.
- **What is never quoted.** A skip, «Ninguna», a state, a hidden or flagged answer, or a non-answer («No sé», a greeting) is never quoted (`takeawayText`, `lastTakeaway`, `hoyTakeaway`, all tested).

### P0-8: mentor prompt. Done.
- **Which days.** It is used on days with a `purpose`. Every other day keeps the prompt it had, word for word (`legacyStepInstructions`).
- **Prompt.** `stepInstructions` in `services/stepReply.ts` holds:
  - the V2 block: one move of four, under 280 characters;
  - the job lines;
  - the DESIGN-DECISIONS rules: none or unsure means accept plainly with no task; a long answer gets a one-line version; a vague answer gets one narrowing option; no praise; no question; no added people or facts; no "safe or free"; no assumed timing.
- **Inputs.** It is given `purpose` and the step's `card.hint`. The question is quoted as she saw it, including the fallback.
- **«No sé».** On those days it goes to the model under the accept-plainly rule, instead of the invitation to try again. A greeting or a test string is still invited to try again.
- **Tests.** No model call on a skip; the rules and the purpose are in the prompt; other days keep the old prompt; «No sé» on a session day versus another day; `describeAnswer` for none; the fallback after a none or a skip.

### P1-9: readability. Done for the session's screens.
- **Floor.**
  - Labels and meta are at least 14 px. This covers the pill's stop line, which was 13.
  - Body text and the input are at least 16 px.
  - Touch targets are at least 44 pt. This covers the field's mic, which was 40.
- **Audit.** Run on web over every captured screen: text size, contrast against what is actually painted under the text, and target size. See Checks.
- **Larger text.** Layouts hold at about 130 % and 160 % (web imitation).
- **Left as they were** (app chrome on Hoy, not session screens): tab labels at 12 px, the masthead date at 13 px, and the profile avatar (38 × 38, «LU» at 4.25:1).

### P1-10: «Pedir la nota de Elara». Done.
- **When it shows.** On the close, once, when:
  - the takeaway was answered;
  - the stored note is not generated (offline or failed);
  - it is not a retry invitation and not flagged;
  - the phone is online.
- **What it does.** It re-sends the saved answer (`askForNote`, 12 s timeout). The server regenerates because the stored reply was authored.
- **Result.** If a generated note comes back for the same words, it replaces the authored line and the ask disappears. On failure, «La nota de Elara no llegó. Lo que escribiste sigue guardado.» shows.

## Deviations, and why

1. **Skips are handled the same on every day.** No model call, no stored reply, and no closing line after a skipped last step, on every day, not only session days. This follows the rule "skipped step: no model call and no Elara note". The rest of the new behaviour, the V2 prompt included, applies only to days with a `purpose`. DESIGN-DECISIONS says the other days keep today's behaviour.
2. **Opening title.** It is the stop line («Hacia el camino adelante»), and the band's pill is hidden there, because it repeated the eyebrow. The week's payoff line («Para llevarte esta semana: …») is not on the session opening, because the card is the day's payoff. The week note itself is kept.
3. **Session band.** The opening and the close use a 200 pt picture instead of 290, and the close drops its pill, so the purpose, the card and the note are read before the button. Questions keep their bands.
4. **While typing on Q2,** «Prefiero pasar» and the field's foot (sentence count and mic) step aside until the keyboard goes. The field starts shorter. This is the only way the row, heading, instruction, field and button all fit at 360 × 470. The keyboard has its own dictation key.
5. **«Listo por hoy»** is the close's title whenever no takeaway was written («Ninguna» without a note, Q2 skipped), not only when both questions were skipped. «Hoy te llevas» over an empty slot would promise something she did not write.
6. **Q2's row is stacked.** It shows «Tu elección» over «Mejorar mi trabajo actual» rather than the inline «Tu elección · Mejorar mi trabajo actual». That is the card's own layout. Inline, the row broke mid-phrase at 393 pt, and at 160 % text her choice was cut to «Mejorar mi …».
7. **A retry invitation is not shown on a later screen.** On photo days, a reply that invited her to try again («No sé», a greeting) was stored without its flag. It then showed as Elara's note on Q2 or on the close, where she cannot act on it. The flag is now kept, and the authored line shows instead. This was an existing bug.
8. **«No sé» (pressure test).** On a session day it is an answer.
   - The model is asked under the accept-plainly rule; offline, the authored line shows. The day closes in one press, the card shows «No sé», and Hoy does not quote it.
   - On other days, a bare «No sé» still gets the existing invitation to try again. An authored acceptance line for that is held back on `origin/claude/review-01-draft-unsure`, pending Alejandra.

## What is simulated (screenshots and journey only; none of it is in the commits)

- **Replies.** Every «Elara notó» line is a harness mock written into the API response, visibly prefixed «[Simulado]». The local API has no model; without the mocks, the screens show the authored «De Elara» line. The Q1 and Q2 mocks are the illustrative replies in DESIGN-DECISIONS. The others follow the same rules.
- **Keyboard.** A web shim, injected at build time and restored afterwards, treats a focused field as an open keyboard. The viewport is cut to 393 × 516 or 360 × 470. On web, the phone's keyboard-aware scroll (`useKeyboardAwareScroll.reveal`) does nothing, so the harness repeats its arithmetic. The field is focused without the browser's own scroll, because RN-web's ScrollView blurs on any scroll under `keyboardDismissMode="on-drag"`.
  - The BEFORE keyboard shots were retaken this way. The first ones had lost focus.
- **Larger text.** CSS `zoom` on text and fields imitates ~130 % and ~160 %. On a phone at 160 %, `fontScale ≥ 1.35` also switches the band to its compact sizes. The imitation does not exercise that.
- **Offline.** The harness aborts API calls and sets the context offline.
- **Time.** The clock is pinned to 3 Nov 2026 20:30 (Madrid). "The next day" is made by moving completion times back in my local D1.
- **Screen reader.** RN-web reports a screen reader as on, so auto-advance is off and motion is instant. The journey taps «Siguiente».
- **Accounts and data.** Synthetic accounts (`qa7`, `qa8`, `qa9@example.com`) in my own local D1. The BEFORE set ran on the `f24224d` web build with the old seed rows.

## Checks (HEAD `be1a05e`)

| Command (from `/home/user/elara-session`, pnpm = `/opt/node22/bin/pnpm`) | Result |
|---|---|
| `pnpm --filter @elara/mobile typecheck` | pass |
| `pnpm --filter @elara/mobile test` | 123 files, 1325 tests passed |
| `pnpm --filter @elara/mobile lint` | exit 1: 389 problems (12 errors, 377 warnings). This is the same count as at `f24224d`. All 12 errors were already there, in `src/components/atlas/globe/` (GlobeScreen, Sheets, Postcard). No finding is on a line this branch changed. |
| `pnpm --filter @elara/api typecheck` | pass |
| `pnpm --filter @elara/api test` | 113 files, 1396 tests passed (`test/daily-session.test.ts`: 27) |
| `pnpm --filter @elara/shared typecheck`, `pnpm --filter @elara/admin typecheck` | pass |
| `node apps/api/scripts/check-content-parity.mjs` | exit 1: 78 problems, all from before this branch (82 at `f24224d`). Every area's week intro notes, and Money's step copy from `75694f6`, were never reseeded. None is for Money days 8–9. |
| Journey (`after.js`, every flow at 393 × 852 and 360 × 780, plus the keyboard flow) | see «Journey» below |
| Readability audit (`audit.js` over every AFTER screen) | see «Readability audit» below |

JOURNEY_PLACEHOLDER

AUDIT_PLACEHOLDER

## Remaining issues

- **Copy is unapproved.** All the new Spanish (purpose, card labels, hints, instruction, fallback, session strings) is the proposal in DESIGN-DECISIONS, pending María and Alejandra. The English is mine.
- **Day 9 has no `bodyFallback`.** If she skips day 9's Q1, the Q2 instruction («Convierte tu ejemplo…») refers to an example she did not give. No copy was approved for it, so I did not write one.
- **«No sé» on other days** still gets the invitation to try again (deviation 8). The held-back authored line, or the session rule, would change that.
- **Q1's last two options**, «Ninguna por ahora» among them, are below the fold at 393 × 852 and nothing hints at them. That is unchanged from before. The existing «Hay más opciones abajo» hint only shows under 760 pt.
- **Elara's Q1 note** sits under the field, as designed, so with the keyboard down it is often below the fold. Whether she reads it at all is worth watching in testing.
- **The admin CMS** has no fields for `purpose`, `card` or `noneOption`. The keys pass through `cleanConfig`, and zod accepts them.
- **Order of release.** Deploy the API before applying the seed rows. The rows switch the session on in the app, because the content fields are served as stored. The skip rule, the V2 prompt and the «No sé» acceptance live in the API.
- **Small screens.** At 360 × 780 the session's opening and close need one scroll for their last lines.
- **Hoy chrome** is below the session's readability floor (tab labels at 12 px, the masthead date at 13 px, the avatar at 38 pt and 4.25:1). It is app-wide, so I left it.
- **Harness incident.** Early on, one of my web builds wrote my API URL (8091) into Metro's shared transform cache, which does not key on `EXPO_PUBLIC_*` values. I restored the cache with a clean 8081 build, and every later build used a private `TMPDIR`. A `bf/web-r0` build from the other agent (05:49) has 8091 inlined. My web host on 8091 forwards requests whose origin is `localhost:8081` to 8787 (their API), so that build keeps working. It is still running for that reason; stop it with `pkill -f "ds/webhost[.]js"`.
