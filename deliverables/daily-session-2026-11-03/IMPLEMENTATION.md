# Daily session: implementation notes

Branch `daily-session` in `/home/user/elara-session`, HEAD `5387605`. It sits on `origin/main` (`1363407`) plus the UI polish commit `f24224d`, and has `beta-hardening` (`eaa4ede`, which already holds `beta-session-fixes`) merged in.

Nothing was pushed, merged into main, deployed or migrated. No remote database was touched and no paid API was called. All the data is fictional.

| Commit | What it holds |
|---|---|
| `cd17894` | Contract and server: the `purpose`, `card` and `noneOption` fields; the «Ninguna» and skip helpers; the copy and seed rows for Money days 8–9; no reply for a skip; the V2 reply prompt; API tests |
| `7b4b3ce` | App: the opening, the linked Q2, the close, Hoy, and «Pedir la nota de Elara» |
| `9fcbe63` | App: Q2 while typing (compact) |
| `5150354` | App: the opening and the close fit the screen; a retry invitation is never shown on a later screen; non-answers are never carried to Hoy; P1-9 fixes |
| `be1a05e` | Server: the V2 prompt only on days with a `purpose`, and «No sé» accepted there. App: Q2's row is stacked, and a step's own reply sits right under its field |
| `5cecf47` | Merge of `beta-hardening` (see «Merge with the beta fixes») |
| `103df9c` | Day 9's Q2 `bodyFallback` (bundle, seed, test) |
| `73fdb0f` | An intentional close when nothing was written; refused words are never shown as kept |
| `5e8e802` | The close shows an info mark, not a check, beside «no se pudo guardar» |
| `5387605` | Q2: the field's sentence count at 14 px (found by the audit) |

## Files in this folder

| File | What it is |
|---|---|
| `before/` | PNGs at `f24224d`, at 393 × 852 and 360 × 780 |
| `after/` | PNGs at `5387605`, with the same names, plus the new states and larger text |
| `compare.html` | Before and after for each state, with a size switch. Self-contained, relative paths |
| `session.patch` | `git diff f24224d..HEAD`: everything after the polish commit, the merge included |
| `combined.mbox` | `git format-patch --stdout origin/main..HEAD`: the full series, merged commits included |
| `sources/` | Every file changed in `origin/main..HEAD`, as it stands at HEAD, at its repo-relative path |
| `DEVICE-CHECKS.md` | The test script for a real phone |

## The daily session

### P0-1: content fields. Done.
- **Contract.** `DayConfig.purpose`, `card { label, hint? }` and `noneOption`, in `packages/shared/src/types.ts` and `schemas.ts`.
- **Bundle.** The composition in `apps/mobile/src/content/paths.ts`, and the copy in `i18n/locales/{es,en}/pathCopy/money.ts` (Money days 8–9, exactly as in DESIGN-DECISIONS).
- **Seed.** `gen-seed.mjs` composes through `composeDay`, so it needed no change. Only the four Money day 8/9 rows of `seed-content.sql` were replaced with its output. They also carry the one-line week note of 30 Oct, the newer text, which had never been reseeded.
- **Server.** `progress.ts` gives the reply its `purpose`.

### P0-2: opening. Done.
- **What shows.** «Por qué hoy» and the purpose; «Hoy te llevas» with the card empty, as a small preview with the hints as placeholders; the week note on the week's first day; «La última vez anotaste» with «Día N» on later days; then «Empezar».
- **When it shows.** Never on a resume: not with a step link, a remembered step, a saved answer, a draft or kept words, or a finished day (`opensOnSession`, tested).
- **Fit.** On session screens the picture steps down to 200 pt (`sessionBand`). At 393 × 852 the whole opening fits; at 360 × 780 the last line needs a scroll.

### P0-3: Q2. Done.
- **Layout.** The row shows «Tu elección» over her choice, two lines at most, and «Cambiar», which goes back to Q1 with her choice selected and the draft kept. Then «Para llevarte», the instruction, and the field first.
- **Elara's note.** Under the field, smaller, and hidden while typing.
- **Changed choice.** «Cambiaste tu elección. Revisa si lo que escribiste sigue encajando.» shows under a draft written for another choice.
- **Keyboard up.** The row, heading, instruction and field stay visible, with the button above the keyboard. «Prefiero pasar» and the field's count and mic step aside until the keyboard goes. The pinned line is the instruction.

### P0-4: «Ninguna por ahora». Done.
Pure shared helpers handle it: `noneOptionOf`, `isNoneChoice`, `stepOutcome` and `usesBodyFallback`. It is never quoted. Q2 gets the option-free line, and the reply is told it means "none right now".

### P0-5: skips. Done.
- **Server.** A skip makes no model call, stores no reply and gets no personalisation.
- **App.** No Elara note follows a skip.
- **Both skipped.** The day closes with nothing invented.

### P0-6: close. Done.
- **What shows.** «Hoy te llevas» and her card; «Editar»; Elara's note under the card, labelled «Elara notó» (generated) or «De Elara» (authored); the saved or offline line; «Mañana: <next day's first question>»; the feedback ask; «Volver a Hoy».
- **No words written.** See «A close without written words».

### P0-7: Hoy. Done.
- **Day done.** Today's takeaway leads Hoy, at most three lines, and opens that day's close.
- **New day.** The day card first, then «La última vez anotaste · Día N».
- **«Para retomar».** Removed.
- **Never quoted.** A skip, «Ninguna», a state, a non-answer or a refused answer.

### P0-8: mentor prompt. Done, on days with a `purpose`.
- **Rules.** The V2 block, the job lines and the DESIGN-DECISIONS rules, with the purpose and `card.hint`.
- **Other days.** They keep their prompt word for word (`legacyStepInstructions`).
- **«No sé».** On a session day it is accepted under the rule; on other days it still gets the invitation to try again.
- **Tests.** 27 in `apps/api/test/daily-session.test.ts`, with a fake AI binding that records each call.

### P1-9: readability. Done for the session's screens.
- **Floor.** Labels at least 14 px, reading text at least 16 px, targets at least 44 pt.
- **Measured on web.** See «Readability audit». Hoy's app-wide chrome is below the floor and was left alone.

### P1-10: «Pedir la nota de Elara». Done.
Once, online, when her takeaway's note is not a generated one. It re-sends the saved answer. On failure, an honest line shows.

## The new requests (3 Nov, second round)

### 1. Day 9 fallback. Done.
- **Copy.** Day 9's Q2 has a `bodyFallback`:
  - es: «Piensa en algo que sabes hacer, también en casa o en un trabajo informal, y escríbelo en una frase sobre tu experiencia.»
  - en: "Think of something you know how to do, at home or in informal work too, and write it as one sentence about your experience."
  - It is a shorter version of the proposal, and ends on the card's hint («Una frase sobre tu experiencia»). The Spanish is marked as a proposal, pending approval.
- **When it shows.** When Q1 was skipped, answered with a state or none, or answered with words that answer nothing («No sé», a greeting). For the last case `usesBodyFallback` now reads non-answers as nothing to build on.
- **Bundle, seed, parity.** The bundle and the two seed rows (es, en) agree. Parity is clean for days 8–9.
- **Tests and checks.** Tests are in `apps/mobile/src/lib/session.test.ts`. Browser flow `day9skip`.

### 2a. Editing after completion. Done.
- **From the close.** «Editar» takes her to Q2 with her words.
- **From Hoy.** Hoy's «Hoy te llevas» card opens the close, then «Editar». That is the existing pattern: the card opens the close.
- **After resubmitting.** The card, the note (a new reply for changed words), Hoy and Tu colección all show the new words.
- **Checks.** Browser flows `editar` and `editar-hoy`.

### 2b. A close without written words. Done.
- **When.** Q2 skipped, «Ninguna» without a note, both skipped, or her words refused.
- **What shows.** The close is «Listo por hoy» with «Hoy queda hecho, tal como lo dejaste.» (new, pending approval) instead of «Saltarlas también está bien», and her choice if she made one.
- **What does not.** No slot for words she did not write («Pasaste esta pregunta» and «Sin nota por hoy» are gone from that card), no Elara note, and no ask.
- **«Editar».** It stays only to send refused words again.
- **On Hoy.** No takeaway card, just «Día 1 hecho».
- **Scope.** This applies to session days. Other days keep their close, as DESIGN-DECISIONS keeps other days' behaviour.
- **Checks.** Browser flows `ninguna`, `q2skip`, `bothskip`, `pasar-typed`.

### 3. Merge with the beta fixes. Done.
`git merge --no-ff beta-hardening` gave conflicts in four files. Each was resolved keeping both intents.

| File | Theirs | Mine | Resolution |
|---|---|---|---|
| `app/(tabs)/index.tsx` | FX1: a skeleton until her progress is read, a retry on failure; FX3: no «se abre» line for a locked week (`promisesNextWeek`); `recallFor` import | The takeaway card at the top or under the hero; «Para retomar» and `recallFor` removed | Their gate and line kept. The takeaway card renders only once `progressRead` is `ready`, so neither the card nor a day ever shows on the store's empty progress. `recallFor` stays removed |
| `app/path/day.tsx` | The close says «no se pudo guardar» over a refused answer | The answered count is hidden when her card says it | Both. Their refused line wins over «guardadas» |
| `StepScreen.tsx` | `draftFromStored` (kept refused answers), a refused line, «Prefiero pasar» keeps typed words, `stepDraftKey` moved to `draft.ts` | `choiceChangedUnder`, the linked row, the compact typing state | The imports unioned. Both behaviours live side by side |
| `hooks/todayEntry.test.ts` | Tests for `promisesNextWeek`, `todayEntryWhenReady` and `draftHasWords` | `recallFor` tests removed | Their tests kept, `recallFor` dropped |

Also checked, and needing no change:
- `dayGate`/`todayEntry`: Hoy's entry is theirs; my takeaway reads only the entry and her progress.
- `qk.myPaths` data is now `{ owner, list }`: nothing of mine reads that query's data.
- `dayPin`/`answeredHere` sit alongside the session's opening.

Composition rules, and where each is enforced:
- **A refused answer shows on Q2 and is never quoted as kept.** Their `draftFromStored` puts it back in the field with its line (browser flow `refused`). The close's card leaves it out and offers «Editar» to send it again (`day.tsx`, `refusedStep`). Hoy leaves it out (`hoyTakeaway(..., refused)`, tested). `draftHasContent` reads a kept `{ kept, refused }` as her words, so that day resumes on its step without the opening.
- **«Prefiero pasar» keeps typed words and records the skip.** Their StepScreen saves the draft and their `onSkip` keeps it. My `onSkip` path still persists the skip, so the server stores no reply and the card shows no words (browser flow `pasar-typed`).
- **Hoy shows nothing of hers before progress is ready.** The entry is null until then (their `todayEntryWhenReady`), and the takeaway card is gated on `progressRead.status === "ready"`.
- **The close after a refusal.** Their «no se pudo guardar» line now sits beside an info mark, not the check that means saved (`5e8e802`).

## Deviations, and why

1. **Skips are handled the same on every day.** No model call, no stored reply, no closing line. The rest of the session applies only to days with a purpose.
2. **The opening's title is the stop line.** The pill, which repeated the eyebrow, is hidden. The week payoff line is replaced by the card.
3. **The session's opening and close use a 200 pt picture**, so the purpose, the card and the note come before the button.
4. **While typing on Q2,** «Prefiero pasar» and the field's foot step aside. It is the only way everything fits at 360 × 470.
5. **No empty slots on a close without written words** (the second-round request). This replaces DESIGN-DECISIONS' «Pasaste esta pregunta» and «Sin nota por hoy» on that close. «Pasaste esta pregunta» still shows when Q1 was skipped but Q2 was written.
6. **Q2's row is stacked** («Tu elección» over the choice), as on her card. Inline, the row broke mid-phrase, and at 160 % text it cut her choice to «Mejorar mi …».
7. **A retry invitation is never shown on a later screen.** This was an existing bug on photo days.
8. **«No sé».** On session days it is accepted under the prompt rule. Other days keep the invitation, and an authored acceptance line is still held back on `origin/claude/review-01-draft-unsure`.

## What is simulated

- **Replies.** Every «Elara notó» line in the screenshots is a harness mock, visibly prefixed «[Simulado]». The local API has no model.
- **Reply failure.** It is simulated as the server's own fallback: the answer is stored and the reply is the authored line, as when the model fails. The 12 s timeout path was not driven.
- **Refusal.** It is a 403 on the steps route for Q2, so nothing is stored. In production that comes from a week that locked under her, for example.
- **Offline.** The harness aborts requests and sets the browser offline.
- **Keyboard.** A web shim treats a focused field as an open keyboard, in a reduced viewport (393 × 516, 360 × 470). The harness repeats the phone's keyboard-aware scroll. The field is focused without the browser's scroll, which RN-web would read as a drag and blur.
- **Larger text.** CSS `zoom` on the outermost text and on fields. The band's compact switch at font scale ≥ 1.35 cannot be shown on web.
- **Clock and days.** The clock is pinned to 3 Nov 2026 20:30, Madrid. "The next day" comes from back-dating completions in my local D1.
- **Screen reader.** RN-web reports one as on, so auto-advance is off and motion is instant.
- **Accounts.** `qa7`, `qa8` and `qa9@example.com`, in my own local D1.
- **No device.** Nothing was run on a phone, an emulator or a simulator. See DEVICE-CHECKS.md.

## Checks

Commands run from each checkout with `/opt/node22/bin/pnpm`. The `beta-hardening` base ran in a throwaway worktree of `eaa4ede` (removed afterwards); `daily-session` is the pre-merge HEAD `be1a05e`.

| Check | `beta-hardening` `eaa4ede` | `daily-session` `be1a05e` | Combined `5387605` |
|---|---|---|---|
| `--filter @elara/mobile typecheck` | pass | pass | pass |
| `--filter @elara/mobile test` | 125 files, 1369 passed | 123 files, 1325 passed | 126 files, 1385 passed |
| `--filter @elara/mobile lint` | 389 problems (12 errors, 377 warnings) | 389 (12, 377) | 389 (12, 377) |
| `--filter @elara/api typecheck` | pass | pass | pass |
| `--filter @elara/api test` | 112 files, 1369 passed | 113 files, 1396 passed | 113 files, 1396 passed |
| `--filter @elara/shared typecheck` | pass | pass | pass |
| `--filter @elara/admin typecheck` | pass | pass | pass |
| `node apps/api/scripts/check-content-parity.mjs` | exit 1, 82 problems | exit 1, 78 | exit 1, 78 |

- **Lint.** All 12 errors were already there, in `src/components/atlas/globe/` (GlobeScreen, Sheets, Postcard). Every warning in a file this stack changed sits on a line from before `f24224d`.
- **Parity.** The 78 that remain are the week intro notes of every area, and Money step copy, that were never reseeded. None is for Money days 8–9.

## Journey (browser)

Every flow ran on a web export of HEAD, against my local API and D1 on ports 8797 and 8091, from the same clean snapshot. Each check reads the page text, and the keyboard flow also hit-tests the elements it names. Screens are in `after/`; the script is `after.js`, with `drv.js` and `audit.js`, in my scratchpad.

| Flow | 393 × 852 | 360 × 780 |
|---|---|---|
| main | 5/5 pass | 5/5 pass |
| day9 | 2/2 pass | 2/2 pass |
| ninguna | 3/3 pass | 3/3 pass |
| q1skip | 2/2 pass | 2/2 pass |
| q2skip | 2/2 pass | 2/2 pass |
| bothskip | 3/3 pass | 3/3 pass |
| editar-hoy | 5/5 pass | 5/5 pass |
| offline | 3/3 pass | 3/3 pass |
| replyfail | 2/2 pass | 2/2 pass |
| nose | 2/2 pass | 2/2 pass |
| day7 | 3/3 pass | 3/3 pass |
| day9skip | 1/1 pass | 1/1 pass |
| cambiar-same | 2/2 pass | 2/2 pass |
| cambiar-changed | 1/1 pass | 1/1 pass |
| resume | 2/2 pass | 2/2 pass |
| editar | 2/2 pass | 2/2 pass |
| refused | 3/3 pass | 3/3 pass |
| pasar-typed | 2/2 pass | 2/2 pass |
| kb | 8/8 pass | 8/8 pass |

Total: 106 checks passed, 0 failed.

What each flow covers, and how it was checked:

| Flow | What it walks | Checked by |
|---|---|---|
| main | opening → Q1 → Q2 → close → Hoy, plus «Hoy, the next day» (07, from back-dated data) | browser |
| kb | Q2 with the keyboard open at 393 × 516 and 360 × 470 | browser (keyboard shim) |
| resume | leave mid-Q2 → Hoy «Seguir con el día 1» → Q2 with the draft, no opening | browser |
| cambiar-same, cambiar-changed | «Cambiar» → Q1 pre-selected → the same or another choice; the draft kept; the changed-choice note | browser |
| ninguna | «Ninguna por ahora» → the option-free Q2 → skip → the calm close; Hoy quotes nothing | browser + unit |
| q1skip, q2skip, bothskip | skipping each question, and both; nothing invented on the close, Hoy or the collection | browser + unit (server: no model call) |
| pasar-typed | «Prefiero pasar» with words typed → skip recorded, words back in Q2 | browser |
| editar, editar-hoy | editing from the close and from Hoy's card → new card, new note, Hoy and the collection updated | browser |
| offline | finish offline → «guardadas en este teléfono» + «De Elara» → online → synced + one «Pedir la nota de Elara» → note | browser (simulated offline) |
| replyfail | the model failing server-side → «De Elara» + one ask → note | browser (simulated failure) |
| refused | Q2 refused with 403 → not shown as kept, «no se pudo guardar» with an info mark, Hoy silent, words back in Q2 with their line | browser (simulated 403) |
| nose | «No sé» on Q2 → one press closes; the card keeps it; the reply accepts it; Hoy does not quote it | browser + unit (server) |
| day9, day9skip | «La última vez anotaste» on Hoy and on the day 9 opening; day 9 Q2's new fallback after Q1 is skipped | browser + unit |
| day7 | a day without a purpose keeps today's way in, card and close | browser |
| large ×1.3, ×1.6 | opening, Q2, close, Hoy at about 130 % and 160 % text | browser (CSS imitation, screenshots only) |

Not covered in the browser:
- the 6 s client timeout on a reply;
- the compact band at font scale ≥ 1.35;
- a real keyboard, a kill and relaunch, and screen readers.

All of these are in DEVICE-CHECKS.md.

## Readability audit (P1-9, web)

`audit.js` ran on 108 AFTER screens: every text run actually painted on screen, its contrast against what is painted under it, and every touch target. It found 1,355 text runs and 710 targets.

**Session screens** (opening, Q1, Q2 with and without the keyboard, close, Hoy's takeaway cards), after this round's fix to the field's count:
- no text under 14 px;
- no contrast under 4.5:1;
- no target under 44 × 44.

**Left as they were**, all outside the session and app-wide:
- Hoy's tab labels: 12 px.
- Hoy's masthead date: 13 px.
- The profile avatar: 38 × 38, with «LU» at 4.25:1.
- Tu colección's week and day labels: 12–13 px, the week label at 4.32:1.
- Day 7's «De Elara» eyebrow: 13 px. Day 7 has no purpose, so it keeps today's design.
- The Hoy postcard's stamp at 160 % text: 8 px.

The full list is in `audit-final.txt` in this folder, and the per-flow table in `journey-final.md`.

## Remaining issues

- **Copy is unapproved.** All the new Spanish is a proposal for María and Alejandra (list below). The English is mine.
- **No device results.** Keyboard behaviour, Dynamic Type at ≥ 1.35, a kill and relaunch, VoiceOver and TalkBack are all in DEVICE-CHECKS.md, unrun.
- **The reply-failure timeout** (more than 6 s, then the authored line) was not driven in the browser. The server-fallback case was.
- **«No sé» on other days** still gets the invitation to try again.
- **Q1's last two options**, «Ninguna por ahora» among them, are below the fold at 393 × 852 with no hint. That is unchanged from before.
- **Elara's Q1 note** sits under the field, so with the keyboard down it is often below the fold, as designed. Watch whether testers read it.
- **The admin CMS** has no fields for `purpose`, `card` or `noneOption`.
- **Order of release.** Deploy the API before applying the seed rows.
- **Hoy chrome** is below the readability floor: tab labels at 12 px, the masthead date at 13 px, the avatar at 38 pt and 4.25:1.
- **Harness note.** One early web build of mine wrote my API URL into Metro's shared cache. I restored it, and later builds used a private `TMPDIR`. The other agent's `bf/web-r0` build has 8091 inlined. My web host on 8091 forwards requests from `localhost:8081` to 8787 for it, and is still running (`pkill -f "ds/webhost[.]js"` stops it). My API is still on 8797.

## New Spanish strings (all proposals, pending approval)

| Where | Spanish |
|---|---|
| Day 8 purpose | Hoy eliges por dónde empezar a mirar tus ingresos y lo conviertes en algo concreto para averiguar. |
| Day 8 card | «Tu elección» · «Para llevarte» (hint «Una pregunta o un pequeño paso») |
| Day 8 Q2 | ¿Qué podrías averiguar sobre esta opción? Escribe una pregunta o un pequeño paso. |
| Day 8 Q2 fallback | ¿Hay algo sobre tus ingresos que te gustaría entender mejor? Si quieres, escríbelo como una pregunta o un pequeño paso. |
| Day 9 purpose | Hoy buscas en lo que ya sabes hacer un ejemplo concreto y lo conviertes en una frase que podrías usar. |
| Day 9 card | «Lo que sabes hacer» · «Para llevarte» (hint «Una frase sobre tu experiencia») |
| **Day 9 Q2 fallback (new)** | Piensa en algo que sabes hacer, también en casa o en un trabajo informal, y escríbelo en una frase sobre tu experiencia. |
| **Close without written words (new)** | Hoy queda hecho, tal como lo dejaste. |
| Session strings | Por qué hoy · Hoy te llevas · Unos {n} minutos · Semana {n} · {título} · La última vez anotaste · Día {n} · Semana {n} · Día {n} · Cambiar · Cambiaste tu elección. Revisa si lo que escribiste sigue encajando. · Pasaste esta pregunta · Sin nota por hoy · Editar · Mañana: {pregunta} · Pedir la nota de Elara · La nota de Elara no llegó. Lo que escribiste sigue guardado. |
| Hoy | Hoy te llevas · Día {n} · La última vez anotaste · Día {n} · Abre el cierre de ese día |
