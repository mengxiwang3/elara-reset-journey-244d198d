# UI/UX handoff fixes 01–08 (3 Nov 2026)

- **Branch:** `ux-fixes-2026-11-03`, cut from `daily-session` 5387605, which is origin/main + UI polish + beta fixes + the session redesign. Local commits only.
- **Not done:** nothing was pushed, deployed or sent to a remote database, and no real AI was called.
- **No new app build was made.** For developers:
  - `combined.mbox` holds 27 patches (the 20 from `daily-session`, then these 7); apply it with `git am` on main.
  - `ux-fixes.patch` holds only this work: 60 files, +1500/−160.
- **Screenshots:** `before/` (38, at 5387605) and `after/` (40, at HEAD), at 393×852 and 360×780.

| ID | Commit | Change |
|---|---|---|
| 01 | `2492aed` | One rule maps a day to its stop; every surface names the day by where she stands |
| 02 | `1b5f270` | A short last answer is accepted and the day closes; quotes are stripped only as a wrapping pair |
| 03 | — | Traced and documented; no defect shown, no change |
| 04 | `2c7b571` | Weekly metrics as counts, with the comparison week named and missing data shown apart from zero |
| 05 | `13dcab4` | Saving a phrase is her explicit choice; Hoy shows her words with their question |
| 06 | `5ab3e66` | Hoy says the day once; there is no Atlas banner in this code |
| 07 | `e85513a` | The circle and how she appears stay beside «Publicar» |
| 08 | `7f9a913` | Loading buttons keep their words; an empty Explore tab is hidden only after a successful load |

## Step 0: build reconciliation

### The three recorded strings: not found in inspected refs

**Search:** `git grep -F` over all 47 refs, then `git log --all -S` and `-i -G` over all 426 commits (which covers deleted files), plus the three dangling commits. The observations from the recording are kept exactly as recorded.

- **«Tu camino por Asia»:** no hit. The nearest strings are «El camino de {continent}: …» in the Atlas globe sheet and «El camino por delante».
- **«Empleos»:** no hit in any case. The nearest are the circle «Primer empleo» and some recommendation keywords.
- **«Te llevas»:** no hit as a standalone string. Lowercase «te llevas» appears only inside longer strings: «Hoy te llevas · Día N» (Hoy label, `daily-session`), «Hoy te llevas» (session close), and «Lo que te llevas» (workshop agendas in `seed-explore.sql`). This is not treated as a paraphrase of any of them.

### Could they come from server content?
- **Explore tabs:** no. They are a fixed client list: all, workshop, listen, watch, guide.
- **Hoy:** no server-driven banner exists. `/api/app-config` carries only feature switches and safety strings.
- **Day and step copy:** comes from D1 (`path_content` / `path_day`, versioned in `content_version`, migration 0066). The repo seeds contain none of the three strings, and production or beta D1 could not be inspected.

### OTA and build-number configuration
- **Self-hosted updates:** served by the `apps/updates` Worker from `https://elara-updates.vasantakmr6.workers.dev/api/manifest` (`app.config.ts`).
- **Channel:** taken from `EXPO_UPDATE_CHANNEL`. The beta and preview profiles use `beta`; production and apk use `production`.
- **Runtime version:** policy `appVersion`, which is 0.1.0.
- **Update records don't name a commit:** `publish.mjs` stores `metadata: {}`.
- **Build numbers live in EAS:** `appVersionSource: remote`, with `autoIncrement`.

### What someone with access must read
1. **The EAS build page for the TestFlight build:**
   - its Git commit and profile;
   - the `EXPO_UPDATE_CHANNEL` and `EXPO_PUBLIC_API_URL` it was built with;
   - its runtime version, 0.1.0.
2. **The OTA update the device is running:**
   - `pnpm --filter @elara/updates publish:ota --channel beta --list` (needs `ELARA_PUBLISH_TOKEN`) lists releases, upload times and which one is live.
   - `Updates.updateId` on the device names the running update.
   - Because no commit is recorded, match it by publish time, or by comparing launch-asset hashes against `expo export` builds of candidate commits.
3. **The backend the build used:** its `content_version`, the `path_day` rows for Money day 25, the kinds returned by `/api/explore/all`, and its `/api/app-config`.

### Could the recorded build differ, per issue?

| Issue | Could the recording differ from this code? | Why |
|---|---|---|
| 01 | Yes | Its Atlas labels follow a different naming rule |
| 02 | Possibly | Only in the model's wording |
| 03 | Unknown | No device capture |
| 04 | No | Same code |
| 05 | Yes | «Te llevas» not found |
| 06 | Yes | «Tu camino por Asia» not found |
| 07 | No | Same code |
| 08a | No | Same code |
| 08b | Yes | «Empleos» not found |

## 01 · The day is named by where she stands

**Change**
- `placeDay.ts` now has one rule: `dayStopIndex(day) = day − 1`, plus `dayStopName`. The duplicate rules `stopIndexFor` and `hereIndexFor` are removed.
- `stopLandmarks` builds two names:
  - `at` («En …»), the day's identity, from that one rule;
  - `toward` («Hacia …»), now only transition copy. It names the next day's stop; on day 7, its own.

**Surfaces that now read `at`**
- the session pill and opening title;
- the «Mañana, …» line, the arrival announcement and the return line;
- Hoy's day title;
- the Atlas `WorldCard` and the record strip;
- `path/[area]`, `TodayPreview` and `PathPreview`;
- the world-art accessibility labels and `WorldScene`.

The photo line uses `dayStopName`.

**Arashiyama (Money week 4):**

| Day | Pill and Atlas | Tomorrow line |
|---|---|---|
| 1 | La primera vista | Mañana, en el camino adelante. |
| 2 | El camino adelante | Mañana, en la vuelta. |
| 3 | La vuelta | Mañana, en el lugar de descanso. |
| 4 | El lugar de descanso | Mañana, en la subida. |
| 5 | La subida | Mañana, en el mirador. |
| 6 | El mirador | Mañana, en el horizonte. |
| 7 | El horizonte | — |

Lan Hạ Bay follows the same rule; its days 6 and 7 are no longer both «En el horizonte».

**Files:** `placeDay.ts` (+test), `useWorldDay.ts`, `day.tsx`, `(tabs)/index.tsx`, `path/[area].tsx`, `atlas/world/[worldId].tsx`, `WorldCard`, `TodayPreview`, `PathPreview`, `WorldArt`, `WorldScene`, `world/copy.ts`, `world25d/copy.ts` (+test), `engine.test.ts`.

**Tests** (`placeDay.test.ts` replaces the test that pinned `at == toward`):
- there is one rule;
- `at ≠ toward` on days 1–6;
- `toward(N) == at(N+1)`;
- Arashiyama days 1–7 across the Atlas, the pill, the photo line and «Mañana»;
- Lan Hạ Bay.

**Screenshots:** `01-session-pill-q1`, `01-atlas-week` and `05-done-screen`.
- Pill: «Hacia la subida» → «En el lugar de descanso».
- Tomorrow line: «Mañana, hacia el mirador.» → «Mañana, en la subida.»
- Atlas day 4: «En la subida» → «En el lugar de descanso».

## 02 · Short answers and the closing reply

**Prompt (`stepReply.ts`):** a new `readingRule(position, total)` is used by both prompt paths, the old one (days without a purpose, e.g. W4D4) and V2.
- **Every step:** a short answer is a real answer (e.g. "todo bien"); acknowledge it plainly.
- **Mid-day:** a retry may be invited only for off-topic answers, greetings, tests, or words that don't answer the question.
- **Last step:** acknowledge in one sentence without interpreting, close, never ask for another answer or invite a retry, and don't ask a question. This removes the old contradiction. V2's "narrow it" becomes "take it as it is".
- Nothing was added to `NON_ANSWER_PHRASES`, and nothing is rejected for being short.

**Quotes:** `sanitize` → `unwrapQuotes`. Quotes are stripped only when a matching pair ("…", “…”, «…», '…', ‘…’) wraps the whole reply and no other quote mark is inside it.

**Tests (API):**
- Prompt assertions for both paths: last step, mid-day, and a one-step day.
- Through the real route, «Todo bien» on the last step of both day types reaches the model with `retry` falsy.
- `sanitize`: embedded quotes are kept; balanced outer «», "" and “” are stripped; unquoted text and a single unmatched quote are left as they are.

**Not visible in screenshots:** the local API has no model, so the authored line shows.

## 03 · Pregunta keyboard: traced, no change

**Path traced**
- `app/(tabs)/ask.tsx` renders `ScreenShell`, then the shared `KeyboardAvoider` (not the `toScreenBottom` variant).
- `KeyboardAvoider` passes `measureInWindow` as the `keyboardVerticalOffset` to React Native's `KeyboardAvoidingView` (padding).
- `KeyboardAvoidingView` (RN 0.86) listens to `keyboardWillShow` on iOS and `keyboardDidShow` on Android, and animates the padding with `LayoutAnimation`.
- `useKeyboard()` changes the composer's bottom inset in a separate render.
- 50 ms after the keyboard opens, `scrollToEnd` runs (`ask.tsx:178–184`).
- BandDay and the step screen's two-pass reveal are not on this path.

**Hypothesis:**
- iOS: the composer rises with the keyboard, while the last bubble returns only with the delayed `scrollToEnd`.
- Android: everything waits for `keyboardDidShow`, so the composer is briefly covered, then jumps.

No defect was shown without a device; the shared components are untouched.

**Device retest (a small iPhone and one Android phone)**
1. Use a long conversation and record at 60 fps.
2. Tap the composer, then step through the frames: is the composer or the last bubble covered, and for how long?
3. Repeat with QuickType on and off, and with dictation.
4. Type multiple lines, up to the 120 pt limit.
5. Repeat at the largest Dynamic Type size.
6. Check the VoiceOver order: field, send, mic.
7. Send a message with the keyboard open.

If only the bubble lags, move `scrollToEnd` to `keyboardDidShow`.

## 04 · Weekly metrics («Cómo has estado»)

**Historical snapshots** (documented before any change):
- **Stored:** one frozen row per member per week in `wellbeing_snapshot` (`memory.ts:175`).
- **Written:** by the weekly cron (`rollup.ts`), only for the last complete week, as an idempotent upsert. Older weeks are never recomputed.
- **Read:** `listSnapshots` returns 12 weeks, with gaps filled as confidence 0.
- **This change rewrites nothing:**
  - `score()`, the rollup and stored rows are unchanged.
  - Presencia uses the stored active-day count.
  - `sessionsCompleted` is computed on read (`sessionsByWeek`) from `day_response.completed_on`, falling back to `completed_at` in her time zone for rows written before 0054. Past weeks get it with no rewrite and no migration.

**Screen** (`progress.tsx`, through `lib/weekMetrics.ts`):
- **Presencia:** «2 de 7 días», with a change shown in days.
- **«Acción»** → **«Sesiones completadas»**: completed daily sessions.
- **Footer:** the confidence percentage is removed. It now reads «2 días activos · 0 registros · lectura con pocos datos»; «pocos datos» shows when confidence is below 0.5.
- **Comparison week:** any change shown names its week, «Los cambios se comparan con la semana del {semana}.». When that isn't the calendar week before, it adds «…la última con datos antes de esta (no la semana inmediatamente anterior)».
- **Missing data:** shows «—» (VoiceOver «Sin datos»). A measured 0 stays 0. An older API without the new field shows «—».

**Files:** `wellbeing.ts`, `shared/types.ts`, `progress.tsx`, `lib/weekMetrics.ts`, es/en `account.ts`.

**Tests:**
- `weekMetrics.test.ts`: zero data; a sparse week with the recording's numbers; zero vs missing; a complete week; a non-adjacent comparison.
- API `wellbeing-sessions.test.ts`.

**Screenshots** (fictional snapshots), `04-progress`:
- «29 −42» → «2 de 7 días −3 días».
- «Acción 80» → «Sesiones completadas 2 −3».
- «…basado en el 24%» → «…lectura con pocos datos», plus the comparison-week line.

## 05 · Saving phrases

Answers are still saved in the day's history automatically. What changed is how a phrase gets into «Frases que guardaste».

**Change**
- **Flag:** `saved?: number | false` on the answer record, with `isSavedPhrase` and `savedAfterEdit`. The server (`saveStep`) and the phone (`progressAfterAnswer`) record `saved: false` on every new keep answer, which stops the automatic promotion. Editing saved words keeps them saved.
- **Endpoint:** `PUT /api/me/paths/:area/days/:day/steps/:stepId/saved` sets only that flag (`json_set`). It returns 400 for a step that keeps nothing and 404 when there is no answer.
- **Phone:** `setPhraseSaved` updates at once, rolls back if the server fails, then refreshes.
- **Completion screen** (also on a reopened day):
  - her phrase verbatim, with its question or task;
  - one control, «Guardar esta frase» ↔ «Guardada en tus frases» (tap again to remove);
  - repeat taps are ignored;
  - a failure line if saving fails;
  - hidden while Elara's reply is pending.
- **Shelf:** `collection.ts` shows only saved phrases.
- **Hoy:** `TakeawayRow` puts the question or task above her verbatim words. Nothing is filtered by length, so «Todo bien» shows with its question.

**Existing users:** phrases promoted automatically before this change stay saved, because an absent flag reads as saved. There is no migration, and she can remove any of them with the same control. This is reversible later with a one-off migration.

**Files:** `shared/steps.ts`, `api/services/progress.ts`, `api/routes/me.ts`, `mobile/lib/api.ts`, `store/stepAnswer.ts`, `store/useAppStore.ts`, `practice/collection.ts`, `BandDay.tsx`, `WorldDay.tsx`, `path/day.tsx`, `lib/phrase.ts`, `hoy/HoyRows.tsx`, `(tabs)/index.tsx`, es/en `practice.ts`.

**Tests:** `lib/phrase.test.ts`, `collection.test.ts`, and API tests for the flag, save, edit, unsave, 400 and 404.

**Screenshots:** `05-done-screen`, `05-done-saved`, `05-shelf`, `06-hoy-day-done`.

## 06 · Hoy

- **No Atlas banner:** «Tu camino por Asia», or any equivalent, isn't in this code, so nothing changed there.
- **Kept:** today's card and the weekly tracker.
- **Repetition removed:**
  - When the day is done, the place line drops «· Día N» (`placeLineDone`).
  - «Tu semana en …» drops its «N de 7». The discs show it, and each keeps its VoiceOver label.
- **Files:** `(tabs)/index.tsx`, es/en `home.ts`.
- **Screenshots:** `06-hoy-day-done`, `06-hoy-week-tracker`, `06-hoy-before-day`.

## 07 · Posting identity in the composer

- `CompartirSheet`'s pinned footer shows «Primer empleo · Anónima» (or her name, or «Sin círculo elegido · …») with «Cambiar», just above «Publicar».
- **Cambiar** switches between her name and «Anónima»; its VoiceOver hint is «Publicar como …».
- The body keeps the full choice. The anonymous flag sent is unchanged.
- **Test:** `identityLine.test.ts`.
- **Screenshots:** `07-composer-open-kbheight` and `07-composer-typing`, at the height left above a keyboard. On web the field doesn't grow, so the "before" shot understates the problem.

## 08 · Loading labels and empty Explore tabs

**08a: loading labels**
- `PrimaryPill`, the `Button.tsx` variants and Explore's `PrimaryButton` show a small spinner next to words.
- The words come from `loadingLabel`, defaulting to the button's label; VoiceOver reads the same words.
- Duplicate taps stay blocked.
- Call sites use existing strings: «Uniéndote…», «Publicando…» (twice) and «Guardando…» (twice).

**08b: empty Explore tabs**
- `visibleCategories` hides a tab only when its read succeeded with zero items.
- While loading or after a failed read, every tab stays. «Todo» always stays.
- If the selected tab disappears, the screen falls back to «Todo».
- `hasAny('workshop')` now counts `upcoming`.

**Tests:** the Explore catalogue tests, and `loadingLabel.test.ts`, a source-level check.

**Screenshots:** `08-publish-loading`, `08-explore-empty-watch`, `08-explore-all-failed`.

## Checks: HEAD vs 5387605 (same commands, clean worktrees)

| Check | 5387605 | HEAD |
|---|---|---|
| Mobile typecheck | pass | pass |
| Mobile tests | 1385 / 126 files, all pass | **1412 / 130 files, all pass** |
| Mobile lint | 12 errors, 377 warnings | the same 12 pre-existing Atlas errors, 376 warnings |
| API typecheck | pass | pass |
| API tests | 1396 / 113, all pass | **1410 / 114, all pass** |
| Shared typecheck, admin typecheck | pass | pass |
| Content parity | 78 problems | 78, identical (the seed vs bundled-copy drift that predates this work) |

## How the screenshots were made

- **Builds:** web exports of each tree against its own local `wrangler dev` and local D1 (repo migrations and seeds).
- **Account:** one fictional account, «Lucía» (qa24@example.com), with Money days 1–24 answered through the API and a local premium row.
- **Fictional harness data:** weekly snapshots and back-dated completions for 04; flags removed on days 1–20 to stand in for older answers in 05.
- **Flow:** day 25 (W4D4) walked from Hoy with «Aún no», then «Todo bien».
- **No mocked replies.** The local API has no model, so the authored line shows.
- **Harness-only shims, not in any commit:** react-native-web, react-dom 19.2.3, CanvasKit, an asset shim and `.dev.vars`.
- **Caveats:**
  - The browser clock was pinned while the API used real time, so Hoy shows «La última vez anotaste» in both builds.
  - The seed's Money copy differs from the bundled copy.
  - Web has no keyboard and no Dynamic Type.

## Spanish strings for review (proposals for María and Alejandra)

**04**
- «{n} días activos · {n} registros · lectura con pocos datos»
- «{n} de 7 días»
- «Los cambios se comparan con la semana del {semana}.»
- the non-adjacent variant: «Los cambios se comparan con la semana del {semana}, la última con datos antes de esta (no la semana inmediatamente anterior).»
- «+{n} días» / «-1 día»
- «{cambio} frente a la semana del {semana}» (VoiceOver)
- «Sin datos»
- «Sesiones completadas» (hint: «Días en los que terminaste la sesión del día.»)

**05**
- «Guardar esta frase» / «Guardada en tus frases»
- the VoiceOver labels for both states
- «No se pudo guardar. Inténtalo de nuevo.»

**06**
- «{lugar} · Semana {n}»

**07**
- «{círculo} · {identidad}»
- «Sin círculo elegido · {identidad}»
- «Con tu nombre»
- «Cambiar»
- «Publicar como {identidad}»

**01** (existing templates now given the day's own stop)
- «Mañana, en la subida.»
- the pill «En el lugar de descanso»

08 reuses existing strings. English counterparts were added for all.

## Remaining device tests (no device was available)

1. **Pregunta keyboard** on a small iPhone and on Android (the steps under 03).
2. **Multiline:** the composer field growing while the identity line and «Publicar» stay visible; the reflection field.
3. **Mic and dictation** with the keyboard open.
4. **Largest Dynamic Type:** the save control, the identity line, the metrics rows, and loading buttons with words.
5. **VoiceOver order:** completion screen; composer footer; metrics rows (value or «Sin datos»); a loading button announced as busy.
6. **Relaunch persistence:**
   - a saved phrase survives a relaunch;
   - unsaving offline rolls back;
   - edited words stay saved.
7. **An old build against the new server:** it ignores the flag and shelves every answer. Expected; check nothing breaks.

## Decisions still open

- **01:** a copy pass on «Mañana, en …»; day 7's transition text.
- **02:** the default 2-word minimum still blocks a bare «Bien» on steps without their own minimum. «Todo bien» passes. Not changed.
- **04:**
  - the «pocos datos» threshold (0.5);
  - whether Acercamiento becomes a count;
  - whether to show a change of 0.
- **05:**
  - keeping older auto-saved phrases as saved;
  - whether the shelf should show each phrase's question;
  - whether drawings and photos become opt-in.
- **06:** any further reduction, once the recorded build is identified.
- **08b:** whether «Todo» should mention a hidden kind.

## Still uncertain

- The recorded build may not be any commit inspected here: three of its strings are not found in inspected refs.
- 03 rests on a code trace, not a device.
