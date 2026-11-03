# Elara beta: fixes for the daily session (3 Nov 2026)

Worktree `/home/user/elara-beta-fixes`, branch `beta-session-fixes`, from origin/main `1363407`. One local commit, `2d280e0`. Nothing was pushed, merged, deployed or migrated. (This report was written by the fixing agent; the session lead saved it here because the agent's file tool refused report files.)

## 1. Sources

**Read:**
- the repo at origin/main (mobile day flow, stores, `@elara/shared`, the API's progress and day-lock code);
- the content: the curriculum JSON, the bundled copy and the server seeds;
- María's chat for 2 Nov only, with emails redacted while reading. Nothing personal is copied here;
- María's screenshots 00000193, 194, 197, 201 and 204;
- the earlier UI-polish harness notes.

**Not read:**
- the voice notes (untranscribed). Anything said only by voice is not covered;
- the PDFs and spreadsheets in the chat export;
- TestFlight, the production API and the production database.

## 2. How the app was run

- **Web build:** `expo export -p web` of the real app, once from origin/main ("before") and once with the fix ("after"). It was served on :8081, with `/api` proxied to `wrangler dev --local` on :8787.
- **Harness-only shims,** none of them in the patch: react-native-web and react-dom 19.2.3, CanvasKit for the globe, and the asset-loading patch.
- **Database:** a throwaway local D1 (Miniflare) built from the repo's own migrations and seeds. A copy also got the Money v4 seed, to test a server serving older content. No remote database was touched and no new migrations were written.
- **Accounts:** synthetic only (qa1, qa8, qa15, qa24, and qanew through onboarding), each with a local premium row. The data was reset before each comparison.
- **Day lock:** `.dev.vars` sets it open. The lock checks were re-run with production's `DAY_UNLOCK=next-day@00:00`, moving completion times back 25 h in the local database.
- **No AI:** the local AI binding cannot run, so no model calls were made. Live replies are labelled **"[MOCK reply for QA]"**. A reply re-shown from storage is the authored line from the content, not AI output.
- **Viewports:** 393×852 and 360×780, locale es-ES.
- **Harness crashes:** the local `workerd` crashed twice during the long walk and was restarted on the same data by a watchdog. That is the local tool, not the app.

## 3. Findings

### Confirmed

- **A. Code bug, fixed.** A day opened before the server copy arrives keeps the bundled copy for the whole visit.
  - It happens on a direct link, on onboarding's "start Día 1", on a notification, or on a slow network.
  - She sees different wording: 11 Money «Para llevarte» bodies differ in each language.
  - Where the two copies name a step differently, answers get **404** (`step_not_found`). «Guardando tu lugar» stays, and the server records no progress.
- **B. María's point 1 is content, not code.** See below.
- **C. María's point 2: a route back to week 1 exists but is hard to find.** Atlas → «Ver lista» or the globe → «Bahía de Lan Hạ» (week 1) → «Ver lo que guardaste» or «Rehacer esta semana». It is 3–4 taps deep and nothing says "Semana 1". Nothing was built.
- **D. The bundled copy and the server seed have drifted.** `check-content-parity.mjs` fails on origin/main with 82 differences. Commit `75694f6` (30 Oct) changed the app copy without regenerating `seed-content.sql`. Step ids and kinds still match today.
- **E. Círculos (outside the session, not fixed).** «Mis círculos» stays on «Cargando…» forever after she picks an interest and taps «Ver sugerencias» without joining a circle.
- **F.** On Hoy, «Ver lo que respondiste» opens the completion card, not her answers.
- **G.** Money Día 1 still shows the old weather tiles next to «Lo que gano» and the other options (`StepScreen.tsx:677`, which checks `area === "money" && dayNum === 1`).
- **H. Copy.** The photo step says «¿Qué es? (obligatorio)» on an optional step, and the header briefly reads «De vuelta en la vuelta.».
- **I. Accessibility.** The map button in the day header has no accessible label.

### Checked and working

- All 35 Money days finished through the UI. Step types covered: choose, multi, blanks, reflect, photo; the draw and voice days were completed by writing.
- «Prefiero pasar» on the last step finishes the day.
- In-app back keeps the answer.
- Leaving mid-day: Hoy shows «Seguir con el día N», the draft is kept, and a reload resumes on the right step.
- Offline finish, then sync when the connection returns.
- 20 s saves: the client times out at 6 s, she moves on, and it syncs later.
- Photo upload, caption and finish.
- The production next-day lock.
- Redo of a finished day.
- A new member through onboarding → Día 1 → finish.

### Hypotheses (not reproduced)

- **H1.** María's Q2 screenshot shows Elara's card cut off. On web the whole card shows, so this may be native scroll or keyboard behaviour.
- **H2.** Voice input cannot be tested on web.
- **H3.** The server's day lock uses her stored time zone; the phone uses the device clock. A member far from her stored zone could see a day offered but refused (403 `day_locked`). This was only produced with a faked clock.
- **H4.** It is unknown what content production serves. María's screenshots match `seed-content.sql`, so the 404 form of bug A probably does not hit production today; it will once step ids diverge.

### María's point 1 in detail

- The served entry is Money es day 8 (= `MONEY-W2-D1`).
- `take` (reflect, optional): «Elige una vía para investigar, sin tener que aceptar trabajo ni pagar nada.» It has no condition, template or option-specific text.
- The app supports text that follows her choice (`when.valueIn` conditions and `«{ask}»` templates); the content just doesn't use it. «Elige» is shown as a free-text field.
- The pending bundle version: «Nombra una cosa sobre la parte que elegiste…».

## 4. The fix (bug A)

**Root cause:**
- `day.tsx` pins the day's content at first render.
- `usePathsMap()` always has the bundled copy straight away, so a cold open pinned the bundle permanently.
- The `screens` memo was keyed only by step ids, so even a replaced copy would have kept the old words.

**Fix:**
- **New `src/lib/dayPin.ts`** (pure `nextDayPin`). A bundled pin gives way once to the server copy: immediately if she hasn't answered on this screen yet, or later only if the server day has identical steps (ids and kinds).
- **`usePaths.ts`:** adds `useHasServerPath(area)`.
- **`day.tsx`:** uses `nextDayPin`; sets `answeredHere` only from her own actions; recomputes the resume position when the copy is replaced; adds `steps` to the `screens` memo.

**Tests and evidence:**
- **Unit test:** `dayPin.test.ts` (7 tests).
  - Before: fails, because the module doesn't exist (`before/A-unit-before.log`).
  - After: passes (`after/A-unit-after.log`).
- **Playwright `reg-a.js`:** a direct link to day 1, and day 8 with `/api/paths` delayed 9 s, each at both viewports.
  - Before: **fails ×4**.
  - After: **passes ×4** (`before|after/A-regression-*.log`, `A-*.png`).
- **Stale-id check** (`reg-a2.js`, local server on Money v4):
  - Before: saves get 404, «Guardando tu lugar» stays, `completedDays: []`.
  - After: every save returns 200, «Listo por hoy» shows, and `completedDays: [1]` (`before|after/A2-*`).
- **Full daily flow after the fix** (`after/flow/`): finishing at both viewports, skip and back, leave/resume/reload, offline finish and sync, and days 1–8 walked through the UI.

## 5. Checks (apps/mobile, Node 22, pnpm 11.18)

| Command | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm test` | 123 files, **1319 passed** (1312 + 7 new) |
| `pnpm lint` | exits 1 with the **same 12 errors and 377 warnings as origin/main**. The errors are all pre-existing, in the Atlas globe files `GlobeScreen.tsx`, `Sheets.tsx` and `Postcard.tsx`. |
| content parity | fails before and after (finding D, not touched) |
| API | not run (the API was not changed) |

## 6. Remaining risks

- A personalised-question overlay that arrives later doesn't re-pin (unchanged behaviour).
- Answers given on the bundled copy, when the server then arrives with different steps, can still 404 and wait in the queue for up to 14 days. The cure is keeping the bundle and the seed in step.
- Auto-answered hidden follow-ups and lead cards use the bundled ids if they fire before the server copy arrives.
- Tested on web only; the native keyboard, voice and haptics were not exercised.

## 7. Needs a push, deploy or content redeploy (flagged, not done)

1. Merge `beta-session-fixes` and ship a build (TestFlight or OTA).
2. Regenerate the server seed (`pnpm --filter @elara/api db:seed:gen`) and re-apply it (`db:seed:beta` / `db:seed:remote`), deploying the API first. The 30 Oct copy is marked as still needing native review.
3. Confirm which content production serves.

## 8. For María to review (exact Spanish, no rewrites)

1. **d8 `take`, as served:** «Elige una vía para investigar, sin tener que aceptar trabajo ni pagar nada.» Pending bundle: «Nombra una cosa sobre la parte que elegiste que podrías averiguar esta semana. No hace falta aceptar trabajo ni pagar nada.»
2. **The same generic pattern in other served `take` steps:**
   - d1: «Escribe una pregunta concreta sobre el tema elegido.»
   - d4: «Anota si necesitas entender un déficit, una variación o una falta de información.»
   - d5: «Deja preparada una pregunta para la persona o fuente que pueda confirmarlo.»
   - d13: «Escribe «Pauso y verifico» junto a la señal elegida. Una señal no demuestra por sí sola un fraude.»
   - d16: «Anota si esa necesidad seguirá presente la próxima vez.»
   - d22: «Escribe qué resultado observable tendría la tarea: un dato, una respuesta o una nota.»
   - d23: «Define el primer paso; si faltan recursos, deja nombrada esa condición.»
   - d25: «Anota el siguiente dato que falta, o marca que por ahora no continuarás.»
   - d26: «Separa el resultado del obstáculo: no recibir respuesta no significa haber hecho mal la tarea.»
   - d27: «Elige solo un ajuste; si paras, registra qué queda pendiente.»

   Pending bundle versions are in `findings/content-parity-check.log`.
3. **Pending bundle, d1 `take`:** «Elegiste «{ask}». Escribe una pregunta sobre eso que te gustaría poder responder.» With «Otra cosa» chosen it reads «Elegiste «Otra cosa»…».
4. **Onboarding chip:** «Voy con el tanque vacío».
5. **Assessment, Propósito:** «Algo te atrae, y lo estás siguiendo.» / «A veces sientes esa atracción, y casi siempre le haces caso.»
6. **Photo step:** «¿Qué es? (obligatorio)» on Money d24 `ask`, whose body begins «Opcional: foto de una nota…».
7. **Day header:** «De vuelta en la vuelta.».
8. **Out of scope:** the Explore audios sound robotic.

## Deliverables

- `beta-fixes.patch` (`git -C /home/user/elara-beta-fixes diff origin/main`)
- `before/`, `after/` (including `after/flow/`): logs and screenshots for fix A
- `findings/`: the other findings, the 35-day walk logs, the parity output, the step-id comparison
- Harness scripts in the session scratchpad under `bf/`
