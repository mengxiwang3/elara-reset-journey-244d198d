# Elara beta hardening: entry, coming back, session and errors (3 Nov 2026)

Worktree `/home/user/elara-hardening`, branch `beta-hardening`, base `f24224d` (origin/main plus the approved UI polish). There are 7 local commits, `8e7d820`…`9ff8d44`. Nothing was pushed, merged, deployed or migrated against anything remote. No model or paid API was called and no email was sent. (The hardening agent wrote this; the session lead saved it because the agent's file tool refuses report files.)

## Summary

**Fixed, each checked in the browser at 393×852 and 360×780 with a regression test:**

1. **Lost work (H-01).** After sign-in on a new phone, or after a session expired, Hoy offered «Semana 1 · Día 1 · Empezar el día 1» until her progress loaded, and forever if the load failed. Answering it rewrote her real Day 1 answer on the server.
2. **Lost work (H-02).** Log out deleted answers that hadn't synced, while the dialog promised «Tu avance y tus reflexiones se quedan aquí, guardados».
3. **Dead end (H-03).** For a free account at the week-2 gate:
   - Hoy promised «La semana 2 … se abre mañana»;
   - the membership screen said «Tu camino gratis está listo… Continúa…»;
   - «Continuar» led back to the same Hoy, in a loop.
4. **Misleading (H-04).** «Vas en el paso 1 de 2. Guardamos lo que escribiste.» showed over a day she had only opened.
5. **Stale state (H-05).** After an offline launch, the reads that had failed were never retried once the connection returned: content, «Para hoy», streak, assessments and config.

**Still blocking:**
- testers without an active beta grant can't get past week 2 (needs the owner and the production database);
- nothing reaches testers until it's merged and shipped;
- several day-screen problems (H-06, H-07, H-12).

## How it was run (harness only, nothing committed)

- **App:** a web export of the worktree on :8101, with `/api` proxied to `wrangler dev --local` on :8807.
- **Data:** a local D1 migrated with 0001–0066 and seeded from the repo, reset to a snapshot before every capture.
- **Accounts:** fictional, @example.com: Lucía Prueba (new), Ana, Bea (beta grant, days 1–8, which is the testers' state), Carla, Dora, Eva, Gala, Flora and Hana. Answers were written with `replyless:true`.
- **No model:** authored lines only, and any step reply in the driver is labelled «[Simulado]».
- **Emulated conditions:**
  - offline: aborted `/api` requests and `navigator.onLine=false`;
  - session expiry: `revoke-sessions` from a second client;
  - midnight: Playwright's clock;
  - keyboard: approximated by shrinking the viewport.
- **Scripts:** the session scratchpad under `bh/`.

## Journey map: what was checked

- **First launch to Day 1:**
  - onboarding begin → area → feeling → «Cuánto espacio» → «En tus palabras» → «Si el dinero pesara menos» → processing → «Tu Claridad» → create account → membership → «Continuar» → Day 1 → Hoy. All worked.
  - «Mirada» isn't in the code; it maps to «Tu Claridad» and «Tu imagen de claridad», both local templates with no model.
  - Errors gave clear Spanish messages: wrong password, email taken, short password, offline, 500, and a failed onboarding save («Pendiente de sincronizar» + «Reintentar», then syncs).
- **Coming back:**
  - cold start online and offline;
  - midnight with the app open: Hoy moves to «Empezar el día 3»;
  - missed days: «Tu día 3 te espera. No se pierde nada.»;
  - the week transition with a grant is fine;
  - the free-account gate is H-03;
  - reopening is H-06 and H-07, and Tu colección works;
  - week 1 is H-08.
- **Auth and session:**
  - session expiry: the answer is held and sent after signing in again (both sizes);
  - Log out is H-02; fresh sign-in is H-01;
  - switching accounts is correct, with nothing carried over;
  - `/api/me` failing is H-11.
- **Network outside the day:** onboarding offline is fine; Hoy with progress slow or failing is H-01; after reconnecting is H-05; the offline line is H-10.
- **Keyboard (approximated):** on begin, sign-in and create-account, the field and the button stay visible. Needs a device.

## Findings

| ID | Symptom | Status | Verified | Severity | Outcome |
|---|---|---|---|---|---|
| H-01 | Week 1 Day 1 offered after sign-in until progress loads; answering overwrote her real Day 1 («Lo que gano» → «Lo que necesito pagar») | confirmed | browser ×2, server read, unit | Lost work | **Fixed (FX1)** |
| H-02 | Log out deleted unsynced answers despite «se quedan aquí, guardados» | confirmed | browser ×2 × offline/online, unit | Lost work | **Fixed (FX2)** |
| H-03 | Free account, week 2: a loop with no way forward | confirmed | browser ×2, unit | Dead end | **Fixed in the app (FX3)**; access needs a grant |
| H-04 | «Guardamos lo que escribiste» over a day only opened (an empty draft is saved on open) | confirmed | browser ×2, unit | Misleading | **Fixed (FX4)** |
| H-05 | Failed reads not retried after reconnecting | confirmed | browser ×2, unit | Stale | **Fixed (FX5)** |
| H-06 | Reopening yesterday's finished day says «Listo por hoy» / «Mañana, hacia la vuelta.» though that day is already open today | confirmed | browser | Wrong state | Not fixed (day screen) |
| H-07 | «Ver lo que respondiste» and «Abre ese día» open the completion card without her answers | confirmed | browser | Misleading | Not fixed (the redesign covers it) |
| H-08 | The way back to week 1 works (Atlas → «Ver lista» → «Bahía de Lan Hạ» → «Ver lo que guardaste» / «Rehacer esta semana»; Perfil → «Frases que guardaste»), but it's 3–4 taps and Hoy doesn't link to it | confirmed | browser | Navigation | Reported; nothing built |
| H-09 | After an expired session, the welcome screen shows only «Pendiente de sincronizar» under «Empezar». Signing in recovers the answers; creating a new account deletes them (by design) | confirmed | browser, code | Unclear / risk | Owner decision (REVIEW-02 §4) |
| H-10 | The two-line «Sin conexión…» banner covers the top controls; taps still work | confirmed | browser | Obstruction | Needs design |
| H-11 | Sign-in while `/api/me` returns 5xx: she lands on the welcome screen, and `/api/me` is requested about twice a second until it recovers | confirmed (cause not isolated) | browser | Wrong state for a while | Not fixed |
| H-12 | Day 1 from the end of onboarding skipped the week-1 opening (with its safety note); from Hoy it showed | hypothesis | browser | Missing instructions | Not fixed (day screen) |
| H-13 | The membership screen with no products says the same thing twice; «Aviso de privacidad» is disabled (Gate 1) | confirmed | browser | Minor / owner | Not fixed |

## Fixes

**FX1: Hoy waits for her own progress** (`8e7d820`, `deceec0`). Fixes H-01.
- **Change:**
  - a new store field, `progressSyncedFor`, records whose progress the store holds;
  - Hoy and the Atlas offer no day until it's ready: a placeholder while loading, and «No pudimos cargar esto ahora…» with «Reintentar» if it failed;
  - SessionSync applies a progress read only for the account it was made for;
  - stores saved by older builds count as the last account's, so an offline first launch after the update still works.
- **Tests:** `progressSync.test.ts` (7), `accountState.test.ts`, `query.test.ts`.

**FX2: Log out tries to send first, then warns** (`c72c2bb`). Fixes H-02.
- **Change:** the queues are flushed when the dialog opens and again before the session ends (at most 4 s). While anything is unsent, the dialog shows a warning.
- **Test:** `sessionEnd.test.ts` (5).

**FX3: an honest week-2 gate** (`55d5c43`). Fixes H-03.
- **Change:**
  - no «se abre mañana» for a week she doesn't have;
  - « · Premium» on a locked week;
  - the membership screen, reached from a locked week with nothing to buy, uses existing strings and «Contactar a soporte».
- **Test:** `todayEntry.test.ts` (3).

**FX4: «Guardamos lo que escribiste» only when something is kept** (`98bcf3f`, `9ff8d44`). Fixes H-04.
- **Change:** the hint shows only when an answer is kept or a draft has words.
- **Tests:** 3.

**FX5: retry failed reads when back online** (`f248a9b`). Fixes H-05.
- **Change:** on offline → online, every on-screen query whose last read failed is refetched.
- **Tests:** 2.

**Merge notes:**
- FX1 and FX3 edit `app/(tabs)/index.tsx`, which the redesign also changes.
- `qk.myPaths` data is now `{ owner, list }`.
- No file overlaps with `beta-session-fixes`.

## Checks (HEAD `9ff8d44`)

| Command | Result |
|---|---|
| mobile typecheck | pass |
| mobile test | 123 files, **1345 pass** (base 1313) |
| mobile lint | exit 1, the **same 12 pre-existing errors** (Atlas globe files) and 377 warnings as the base; files touched keep their warning counts |
| api typecheck | pass |
| api test | 112 files, **1369 pass** |

## Remaining beta blockers, ranked

1. **Week-2 access for testers.** The only way past week 2 is a hand-given `beta_grant` row (90 days; the admin button or `scripts/grant-beta-all.sql`, which covers only existing accounts). New testers, and anyone whose grant lapses, are stuck. Check every tester's row and re-run the grant after each sign-up, or grant automatically while BETA is on (an API change plus a deploy). Note: `wrangler.toml` says the beta runs on the production backend, which contradicts `docs/BETA-BACKEND.md`; invites and email verification are off there.
2. **Ship.** Merge `beta-hardening` and `beta-session-fixes`; build or OTA on the beta channel. Which commit TestFlight runs is unknown (Gate 0).
3. **Content drift.** Regenerate and redeploy the server seed.
4. **Day screen:** H-06, H-07, H-12.
5. **Expired-session copy (H-09):** owner decision. Also: should Log out keep unsent answers for her account the way an expired session does?
6. **Offline banner over the top controls (H-10):** needs design.
7. **`/api/me` failing at sign-in (H-11):** a code fix, not done.
8. **Week-1 discoverability (H-08):** owner decision.
9. **Legal URLs (Gate 1):** owner.
10. **Círculos stuck on «Cargando…»** (outside this slice).

**Needs a device:**
- the iOS keyboard on auth and onboarding fields;
- the Android back button on the membership screen and the Log out dialog;
- AppState foreground triggers;
- an offline cold start with SecureStore, including FX1;
- FX5 driven by expo-network, including captive portals;
- the processing screen auto-advancing without VoiceOver;
- which build TestFlight is running.

## New Spanish strings (pending María and Alejandra)

**New (FX2):**
- «¿Cerrar sesión sin sincronizar?»
- «Algunas de tus respuestas todavía no llegaron a tu cuenta. Si cierras sesión ahora, se borrarán de este teléfono.»
- «Cerrar sesión igualmente»

English is included.

**Existing strings in new places:**
- On Hoy, the load-failure line «No pudimos cargar esto ahora. Revisa tu conexión y vuelve a intentarlo.» with «Reintentar».
- « · Premium» on a locked week.
- On the locked-week membership screen:
  - «Las membresías no están a la venta en este momento.»
  - the free-plan note
  - «Contactar a soporte»

**No longer shown in some cases:**
- «La semana 2 … se abre mañana…» (to a free account)
- «Tu camino gratis está listo…» (on a locked week)
- «Guardamos lo que escribiste» (when nothing is kept)

## Evidence

`hardening.patch` (`git diff f24224d..HEAD`); `evidence/before/`, `evidence/after/` and `evidence/findings/`, with logs and screenshots per fix and finding, and check logs.
