# Beta hardening inside the day: round 2 (3 Nov 2026)

- **Branch:** `beta-session-fixes` in `/home/user/elara-beta-fixes`, rebased onto f24224d (origin/main plus the approved UI polish). The rebase was clean.
- **Commits:** `7115dcc` (round-1 fix A) and `2c22c4a` (this round). Nothing was pushed, merged, deployed or migrated, and no AI was called.
- **Verification tags:** **code**, **unit** (vitest) or **browser** (Playwright on the web export against a local API with synthetic accounts). Nothing here is claimed as device behaviour.

## Ranked findings

| # | Finding | Kind | Status | Verified |
|---|---|---|---|---|
| 1 | «Prefiero pasar» discarded the text she had typed. Going back, or reopening from Hoy, showed an empty field, and her words were gone from storage. | Lost work | **Fixed** | browser (both sizes) + unit |
| 2 | An answer the server refuses for good (400/403/404/422, or `step_not_found` after 14 days) was dropped together with her words, while the screens said «guardadas». Reproduced with a real 403 `premium_required` mid-day. | Lost work + dishonest message | **Fixed** | browser (real refusal, both sizes) + unit |
| 3 | After a day finished offline late in the evening and synced after midnight, the phone offered the next day. The server, which stamps completion at upload, refused it (403 `day_locked`), while the screen talked about syncing. Her words stayed queued. | Incorrect state | **Fixed on the client**; the root cause is server policy (below) | browser (`timezoneId` + clock) + unit |
| 4 | Reply labels when the model fails or is late: the authored line shows under «De Elara»; a generated reply shows under «Elara notó»; a late reply doesn't flip the label. The round-1 «[MOCK…]» under «De Elara» was a harness artefact. | — | Not a bug | browser |
| 5 | The «Con tus propias palabras…» placeholder measured 3.4:1 (1.05:1 on web, where the paper art covered the field). | Readability | **Fixed: 5.9:1** | browser (rendered pixels) |
| 6 | Money Día 1 drew the old feelings check-in art beside the income options. It is a leftover from the week-1 rewrite (the art keyed on money + day 1). | Visual | **Fixed** | browser + git history |
| 7 | «De vuelta en la vuelta.» at the generic stop «La vuelta» | Wording | **Fixed** (proposed string) | browser + unit |
| 8 | Map button "missing label" (round 1): retracted. It is labelled «¿Dónde es?». | — | Not a bug | browser (DOM) |

**Time zone.** Her stored zone syncs from the device on each `me` load. The server's lock uses that zone plus 2 h of grace. The mismatch in #3 comes from completion being stamped at upload, not from the zone. (code + browser)

## Fixes

1. **Skip keeps her input.** It is saved at once as the step's draft. The draft is cleared only when she already holds an answer for that step. (`StepScreen.tsx`, `day.tsx`, `draft.ts`)
2. **Refused answers are kept and the app says so.**
   - The queue flush now calls `onDropped` before removing an entry refused for good.
   - The store puts her words back as that step's draft, marked as refused, unless she has typed a newer draft, or the entry is a decline or an empty skip.
   - The step reopens with her words and a line saying they weren't saved, and the closing line switches to "not saved". Resending them lands.
   - Files: `stepQueue.ts`, `useAppStore.ts`, `draft.ts`, `StepScreen.tsx`, `day.tsx`.
3. **The day gate counts a queued day from now,** applying the server's own rule before upload. (`dayGate.ts`, `useDayGate.ts` and 4 callers)
4. **The weather art shows only on the feelings step.** (`StepScreen.tsx`)
5. **Return line:** «De nuevo …» when the place contains «vuelta». (`es/day.ts`, proposed)
6. **The placeholder uses the solid readable secondary ink,** and the field sits above the paper art on web. (`ReflectInput.tsx`)

**Tests:** new tests in `dayGate.test.ts`, `stepQueue.test.ts`, `draft.test.ts` and `i18n/returnLine.test.ts`. 9 of the new tests fail against the pre-fix source (`round2/unit/`); the other 3 guard behaviour that shouldn't change.

## Checks (apps/mobile)

| Command | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm test` | 124 files, **1332 tests pass** |
| `pnpm lint` | exits 1 with the **same 12 pre-existing errors** (Atlas globe files) and 377 warnings as the baseline; nothing new |
| API | not run (untouched) |

**Final browser run** (`round2/final/`), all passed:
- the day-pin check, 4 of 4;
- the full daily flow at 393 and 360;
- skip and back;
- direct link, leave, resume and reload;
- offline finish, then sync;
- reply labels against the real server;
- a UI walk of days 1–8.

## Needs a decision or deploy (flagged, not done)

- **Server pacing.** Completion is stamped when the answers land, so finishing a day offline in the evening still costs her the next day's practice. Proposed: base `assertDayOpen` on her claimed local completion date (`completedOn`, already stored and bounded by `CLAIM_WINDOW_DAYS`). This needs a product decision and an API deploy.
- **Shipping** these fixes needs a merge and a new app build.

## Keyboard (code only, no change)

`app.json` has no `softwareKeyboardLayoutMode` (on purpose, because of edge-to-edge). The band day wraps its page in `KeyboardAvoider toScreenBottom`, and `StepScreen` uses `useKeyboardAwareScroll(88)`. I found nothing I could show is wrong.

**Device checks to run:**
1. Android 360-wide: «Terminar por hoy» and «Prefiero pasar» stay above the keys.
2. The field and the mic row stay visible while typing, including the tall Día 1 paper field.
3. The photo caption field is revealed when focused.
4. A long multiline answer keeps its last line visible.
5. The band folds while typing.

## Remaining in-day blockers, ranked

1. Server pacing gap: needs a product/API decision and a deploy.
2. Keyboard on a device: the checks above.
3. Voice answers (days 9 and 26) are untested; needs a device.
4. For 4–7 s after finishing with a refused answer, the closing screen still says «guardadas».
5. `step_not_found` answers are retried for 14 days, then kept under a step id the served copy may no longer have. The cure is keeping the bundle and the seed in step (reseed).
6. A `day_locked` from a wrong device clock or an unsynced zone still shows «Guardando tu lugar». Her words are kept. Rare.
7. Reconnecting while she stays on Hoy doesn't flush the queue. This is harmless now that the gate counts a queued day from now.
8. Other placeholders at 60–70% alpha (photo caption, «other» option text) are about 2.6:1 by calculation, not measured. Left to the redesign.
9. Left to the redesign: «Ver lo que respondiste» opens the completion card; the «Ninguna por ahora» and skip outcomes.

## New Spanish strings (proposals for María)

1. `practice.dayComplete.notSaved`: «Una de tus respuestas no se pudo guardar en tu cuenta. Tus palabras siguen en ese paso, en este teléfono.»
2. `practice.refused.step`: «Esta respuesta no se pudo guardar en tu cuenta. Tus palabras siguen aquí para que puedas enviarlas de nuevo.»
3. `day.return.back` at «La vuelta»: «De nuevo en la vuelta.»

## Evidence

- `beta-fixes.patch` = `git diff f24224d..HEAD` (21 files, +515/−31).
- `round2/` holds `skip/`, `refuse/`, `daylock/`, `small/`, `contrast/` (before and after), `reply/`, `rebase/`, `unit/`, `final/` and `checks/`.
