# Money Week 1: one connected day (real app, for review)

**App repo:** vasantakmr/Elara. Base `main` at `1363407`. Branch `claude/money-w1-connected-day`, local commit `8209939`. **Not pushed.**

**Patch:** `money-w1-connected-day.patch` (24 files, +832 / −88). Apply with `git am` on `1363407`.

Not deployed, nothing written to production, no homepage changes. New copy is marked **BORRADOR / DRAFT** for María and Alejandra.

## What the day does now

The slice is Day 3, Lan Hạ, «Las balsas». It keeps the existing `ask,take` structure and step IDs.

1. **Question.** The question carries an eyebrow saying what she learns today: which payment comes first, and whether its date is known.
2. **Answer → teaching reply.** Elara replies with an authored line that quotes her items, names the method (date before amount) and says how to use it in the next step. No model is involved. The server stores the line with `generated: false` and makes no AI call.
3. **Takeaway.** The takeaway is prefilled as «Renta: por confirmar. Luz: por confirmar.» with Editar. Nothing is saved until she confirms.
4. **Close.** The close screen quotes her note and offers the souvenir. Tapping it collects it once; a second tap, a redo or a replay changes nothing. Reduced motion is respected.
5. **Atlas.** The Atlas landmark sheet shows the souvenir, collected, and her current note.
6. **Week close.** «Lo que cambió» on the week close now includes the taught takeaway in its latest wording.
7. **Next day.** Day 4 opens with «Tu nota del día 3: «…»». After she edits the note on a redo, Day 4 shows the edit, never the first version.

**Behavior kept as it was:**
- The server owns completion, and `completed_at` stays sticky after a redo or an edit.
- A skipped step gets no teaching line and no invented takeaway.
- Nothing she writes is sent anywhere beyond the existing step save.
- ES/EN, back, skip and resume all still work.

## Checks

| | `main` 1363407 | this branch |
|---|---|---|
| typecheck | pass | pass |
| mobile tests | 1312/1312 | 1330/1330 |
| API tests | 1367/1369 | 1374/1376 |
| lint | 12 errors, 377 warnings | 12 errors, 377 warnings (unchanged) |
| content parity | OK | OK |

- **API test failures.** The 2 failing API tests (`explore.test.ts`, `explore-detail.test.ts`, premium locking) fail on `main` too.
- **New tests:**
  - `teaching-reply.test.ts` (API route, no model call, edits, skips);
  - `moneyDayThreeSlice.test.ts` (ES + EN copy, recall of the edited note, souvenir rules);
  - a ranking test in `photoDay.test.ts`.

**UI check.** The real app ran as a web build against a local API and a local database, at 390×844 with reduced motion. Days 1–7 were driven end to end in Spanish, and Day 3, Day 4 and the Atlas again in English. The `screens/` folder holds the captures. The server writes were confirmed in the local database: the Day 3 replies stored as `generated: false`, `completed_at` unchanged after the edit.

**Not run:** iOS or Android devices or simulators, so this is not proof of production readiness. The ChatGPT reference prototype could not be reached from this environment, so this is **not** a visual-parity claim against it.

## Decisions needed (María, Alejandra, engineering)

1. **Copy.** Approve or rewrite the Day 3 eyebrow, the 4 teaching templates, the «por confirmar» prefill and the Day 4 recall line, in ES and EN. Draft text lives in `i18n/locales/{es,en}/pathCopy/money.ts`.
2. **Week 1 souvenir art.** Lan Hạ has no drawn keepsakes; only Wuzhen (Week 2) does. The day's photograph stands in and is labelled «fotografía». Commission 7 Lan Hạ keepsakes, or accept photos.
3. **Souvenir naming.** The souvenir is named for what its photo shows, «Las balsas». The Atlas heads the same day by the stop it walks toward, «En la cueva». The two names were already different in the app; the souvenir makes it visible. Pick one rule.
4. **Souvenirs on skipped days.** A day passed with every step skipped still closes (existing rule), so its souvenir is offered. Only a day declined outright gets none. Keep this, or require at least one answer.
5. **Day 7 souvenir.** The week-close screen replaces the day's close screen, so the Day 7 souvenir can only be collected from the Atlas. Add it to the week close, or leave it.
6. **Where collected souvenirs live.** They're stored on the phone only (persisted, cleared on account reset). Should they sync to the server, which needs a new column and endpoint?
7. **Skipped steps on non-teaching days.** These still go through the existing reply path, which may call the model as before. Unchanged here; flagged in case it should be authored-only.

## Preview notes (for whoever re-runs it)

The web build sends the session cookie only from the same origin. On web, `getSessionCookie()` returns `""` and the app relies on the browser's own cookies. To preview against a local API:
1. Put a one-port proxy in front: `/api/*` to wrangler, everything else to expo.
2. Set `EXPO_PUBLIC_API_URL` to the proxy origin.
3. Pass `APP_URL` and `BETTER_AUTH_URL` to `wrangler dev`.
4. Temporarily add `react-native-web` and `react-dom`.

None of the preview setup is in the commit.
