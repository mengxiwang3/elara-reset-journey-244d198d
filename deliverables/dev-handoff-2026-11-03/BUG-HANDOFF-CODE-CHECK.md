# Bug handoff: code check (3 Nov 2026)

What was checked: the eight issues from the 6-minute TestFlight recording, traced through the code. All reads were read-only.

- **Main:** `origin/main` 1363407, read with `git show`.
- **Combined branch:** `daily-session` 5387605 in `/home/user/elara-session`.
- **What was run:** nothing was edited, committed or pushed. The only code run was:
  - two `tsx` scratch scripts that call the real `stopLandmarks`/`hereIndexFor` (issue 01) and the real `score()` from `wellbeing.ts` (issue 04);
  - a small node check of the `sanitize` quote regex (issue 02);
  - `vitest` on `placeDay.test.ts` and `atlas/week.test.ts` on the branch (23/23 pass).
- **Nothing was tested on a device.**

**About the build.** Several strings quoted in the handoff do not exist verbatim in `origin/main`, in `daily-session`, or in any local or remote ref:
- «El lugar del descanso»
- «Tu reflexión · Día 4»
- «Te llevas»
- «Una frase que guardaste»
- «Tu camino por Asia»
- «Empleos»

The nearest real strings are named under each issue. Either the TestFlight build is not one of these commits, or the handoff paraphrased the screens. Verdicts below are about the code, not about one specific build.

Legend:
- **CONFIRMED-IN-CODE:** the code produces the behaviour.
- **PLAUSIBLE:** the code allows it, but runtime or data is needed to confirm.
- **NOT REPRODUCIBLE FROM CODE:** the code as described does not exist.
- **NEEDS DECISION:** the fix depends on a product choice.

## Summary

| # | Pri | Issue | Verdict | Smallest fix (where) | Combined branch |
|---|-----|-------|---------|----------------------|-----------------|
| 01 | P1 | Day/stop names shifted between Atlas and session | **CONFIRMED-IN-CODE** (two index rules on one list) + **NEEDS DECISION** (which stop names a day) | `apps/mobile/src/content/placeDay.ts:57-61`: `at` from `hereIndexFor`, `toward` from `stopIndexFor`; update `placeDay.test.ts:31-39` | Not touched |
| 02 | P1 | Closing reply to «Todo bien» asks for another answer on a closed day; broken quote | **CONFIRMED-IN-CODE** (prompt contradiction + quote-stripping regex); exact wording PLAUSIBLE (model output) | `apps/api/src/services/stepReply.ts`: last-step variant of the "invite to try again" rule; balanced-only quote strip in `sanitize` | Partly: V2 prompt only on 2 Money days; W4D4 keeps the legacy prompt; the contradiction and `sanitize` are unchanged |
| 03 | P2 | Composer briefly under keyboard, settles ~1 s later | **PLAUSIBLE** (timing pattern in code) | Classify only: BandDay band collapse 500 ms vs keyboard; two-pass reveal (`keyboardWillShow` then `keyboardDidShow`) | Not touched (BandDay changed nearby, same timing) |
| 04 | P1 | Weekly metrics: Presencia 29, Acción 80, 24%, deltas without period | **CONFIRMED-IN-CODE** (reproduced exactly by running `score()`) | `apps/mobile/app/progress.tsx` (labels/units, delta baseline); `apps/api/src/services/wellbeing.ts:192-199` (agency counts steps, connection 0) | Not touched |
| 05 | P2 | Her «Todo bien» shown on Hoy and in «Frases que guardaste» without the question | **CONFIRMED-IN-CODE**: every `keep:"sentence"` answer is shelved automatically; Hoy quotes it with no question | `collection.ts:90`, `todayEntry.ts:295` (main) / `lib/session.ts:hoyTakeaway` (branch): skip non-answers, carry the question | Changes it: Hoy becomes «Hoy te llevas · Día N»; still no question; «Todo bien» still promoted; shelf unchanged |
| 06 | P2 | Hoy repeats progress | **PARTLY CONFIRMED**: day/week shown on the postcard and again in «Tu semana en …» (+ Atlas tab). The «Tu camino por Asia» banner is **NOT REPRODUCIBLE FROM CODE** | `app/(tabs)/index.tsx`: drop the disc-section count or the postcard's week/day | Order changed (takeaway added), repetition kept |
| 07 | P2 | Circle composer: «Anónima» scrolls away while typing | **CONFIRMED-IN-CODE** (layout); the identity is sent and displayed correctly | `CompartirSheet.tsx:149-152`: move `NameChoice`/`who` above the text field or into the pinned footer | Not touched |
| 08a | P2 | Buttons spinner-only while loading | **CONFIRMED-IN-CODE**: label replaced by spinner; repeat taps blocked | `components/system/PrimaryPill.tsx:108-111`: keep the label next to a small spinner | Not touched |
| 08b | P3 | Explore «Empleos» tab empty | **Mechanism CONFIRMED** (static tabs show «Todavía no hay nada aquí. Vuelve pronto.»). There is **no «Empleos» category** in code | `CategoryTabs` (`components/explore/Catalogue.tsx:149`): filter `CATEGORIES` with existing `hasAny()` | Not touched |

---

## 01 · P1 · Day identity mismatch (Money week 4, Arashiyama)

**Verdict:** CONFIRMED-IN-CODE (inconsistent index rules) + NEEDS DECISION.

**World.** Money week 4 is Arashiyama:
- `places.ts:68-73` (`ky` is Money's 4th row).
- `stopsKeyFor` (`placeDay.ts:46-48`) gives every place except Lan Hạ the `generic` list.
- That list is `es/globe.ts:53`: `["La primera vista", "El camino adelante", "La vuelta", "El lugar de descanso", "La subida", "El mirador", "El horizonte"]`.

**Evidence.**
- `placeDay.ts:36-38`: `stopIndexFor(day) = min(day, 6)`. The doc comment says this is the stop the day **heads toward**.
- `placeDay.ts:41-43`: `hereIndexFor(day) = day - 1`. This is the stop the day's **picture shows**, where she stands.
- `placeDay.ts:57-61`: `stopLandmarks` builds **both** `at` («En …») and `toward` («Hacia …») from `stopIndexFor(i+1)`:
  ```ts
  const stop = lowerFirst(stops[Math.min(stopIndexFor(i + 1), stops.length - 1)] ?? "");
  return lang === "es" ? { at: `En ${stop}`, toward: `Hacia ${stop}` } : …
  ```
- Who reads what:

  | Surface | Code | Reads |
  |---|---|---|
  | Atlas week list | `app/(tabs)/atlas/week/[worldId].tsx:106` → `components/atlas/week.ts:81` | `landmarks.map(l => l.at)` |
  | Atlas world record strip | `atlas/world/[worldId].tsx:270,282,287` | `copy.at(index)` |
  | Session pill | `app/path/day.tsx:1370` | `wd.here.toward` |
  | Done screen «Mañana, …» | `day.tsx:1388` + `es/photoDay.ts` `tomorrow` | `wd.next.toward` |
  | «¿Dónde es?» photo line | `day.tsx:1348` | `globe.stops[…][hereIndexFor(day)]` (bare stop, no «En») |
  | Hoy week discs (a11y) | `(tabs)/index.tsx:436` | `landmark(…).at` |

**Computed with the real functions** (tsx, branch checkout; `placeDay.ts` is identical on main):

| Day | Atlas «at» | Pill «toward» | Done «Mañana» | Photo line (here) |
|---|---|---|---|---|
| 3 | En el lugar de descanso | Hacia el lugar de descanso | Mañana, hacia la subida | La vuelta |
| 4 | **En la subida** | **Hacia la subida** | **Mañana, hacia el mirador** | **El lugar de descanso** |
| 5 | En el mirador | Hacia el mirador | Mañana, hacia el horizonte | La subida |
| 6 | En el horizonte | Hacia el horizonte | Mañana, hacia el horizonte | El mirador |
| 7 | En el horizonte | Hacia el horizonte | n/a | El horizonte |

**Mechanism.** One list is read with two index rules:
- The session's «Hacia la subida / Día 4» and «Mañana, hacia el mirador» match the code exactly.
- The labels the tester reports for the Atlas (Day 4 «El lugar de(l) descanso», Day 5 «En la subida», Day 6 «En el mirador») follow the `hereIndexFor` rule, which on main is used only by the photo line.
- On main, the Atlas week list would say «Día 4 · En la subida». It names as "where she is" (`at`, «En …») the stop she is still heading toward. So on one day, three surfaces name the same day three ways:
  - the photo says «El lugar de descanso»;
  - the pill says «Hacia la subida»;
  - the Atlas says «En la subida».

There is no list off by one. `at` uses the toward index instead of the here index. Side effect: days 6 and 7 are both «En el horizonte» and «Hacia el horizonte».

**Pinned by tests.** `placeDay.test.ts:31-39` pins `at == toward` on purpose (`enL[0] = { at: "At the mist pass", toward: "Toward the mist pass" }`). The same test documents the prototype model: Day 3 = "the rafts in the picture, 'Toward the cave' in the pill". So this is a design-level inconsistency, not an accident nobody saw.

**Smallest fix:** `apps/mobile/src/content/placeDay.ts:57-61` builds `at` from `stops[hereIndexFor(i+1)]` and keeps `toward` on `stopIndexFor(i+1)`; update `placeDay.test.ts:31-39`. Result:
- Day 4: Atlas «En el lugar de descanso», photo «El lugar de descanso», pill «Hacia la subida», «Mañana, hacia el mirador».
- The Atlas then matches what the tester describes, and «En» and «Hacia» never name the same stop on one day.
- This also repairs the day 6/7 duplicate.

**Open decision:** which single name the day carries in the Atlas list and on the done screen's eyebrow: where she stands («En el lugar de descanso») or where she heads («Hacia la subida»).
- Even after the fix, the done screen says «Hacia la subida · Día 4» while the Atlas says «En el lugar de descanso · Día 4». That is correct under the prototype model, but it is exactly the "shifted by one" perception.
- If the Atlas should name the day by its pill, then change the Atlas to read `toward` (`week/[worldId].tsx:106`, `world/[worldId].tsx:270-287`) instead of changing `at`.

**Combined branch:** not touched (`placeDay.ts`, `es/globe.ts` and the Atlas week/world screens are unchanged). The branch also feeds `wd.here.toward` to the new session opening title (`day.tsx:1576`), so the decision applies there too.

---

## 02 · P1 · Closing reply after «Todo bien»

**Verdict:**
- The prompt contradiction and the broken quote are CONFIRMED-IN-CODE.
- The exact wording of the reply is model output (PLAUSIBLE, but it fits the prompt and the step text precisely).

**Data path.**
- Money W4D4 is path day 25 (`content/pathDays/money.ts:389-401`). It has two steps: `ask` (choose) and `take` (reflect, `keep:"sentence"`).
- The `take` copy (`es/pathCopy/money.ts:582-587`): «Dijiste «{ask|lower}». ¿Qué es lo siguiente que necesitarías saber? También puedes escribir que lo dejas aquí por ahora.» The model's "doesn't say whether she'll add the missing info or stop" is that question read back.
- The route passes `position` and `total: steps.length` (`routes/me.ts:590-594`). So `take` is step 2 of 2, the last step.

**Evidence (main, `apps/api/src/services/stepReply.ts`).**
- `:95` last step: «Close the day … Do not ask a question.»
- `:195` (a general rule in the same instructions): «If the answer is very short, off-topic, … or does not answer the question, … **invite them to try the question again** in their own words.» The two rules contradict each other on the last step, and the model follows `:195`.
- `:165-171`: only `isNonAnswer` words skip the model and get `retry: true`. «Todo bien» is not in `NON_ANSWER_PHRASES` (`packages/shared/src/practice.ts:221-236`). So it reaches the model, and the reply comes back `generated: true` with **no `retry` flag**.
- On the client, `app/path/day.tsx:1233` takes `live = dayAnswers[liveFrom].reply`, and `:1385` shows it as the done screen's Elara line (`BandDay` renders it raw). So the invitation lands on a screen with no input.
- **Quote bug:** `sanitize`, `stepReply.ts:264`: `text.replace(/^["“”']+|["“”']+$/g, "")` strips any leading or trailing quote even when it opens or closes a quoted phrase **inside** the reply. Checked with node:
  - `"Todo bien" no deja claro…` → `Todo bien" no deja claro…`
  - `Dijiste "todo bien"` → `Dijiste "todo bien`
  - `«»` are not touched.

  This is the malformed quote. No client-side wrapper adds quotes on the band done screen; `day-complete.tsx:401` wraps in “ ” only on the legacy screen.

**Smallest fix.**
1. `stepReply.ts`: make the "invite them to try again" bullet depend on position.
   - When `position >= total`, replace it with: «If the answer is very short or does not answer the question, acknowledge it plainly in one sentence without interpreting it and close. Never ask for another answer.»
   - On the branch, apply this in both `legacyStepInstructions` (`:134`) and `stepInstructions` (`:186`).
2. `stepReply.ts` `sanitize`: strip only a **balanced** wrapping pair. Example: `const m = /^(["“])([^"“”]*)(["”])$/.exec(text); if (m) text = m[2];`. Never strip one side alone.
3. Optional belt-and-braces: add «todo bien», «bien», «nada más» to `NON_ANSWER_PHRASES`. This is a product call, since «Todo bien» may be an honest answer, so not recommended blind.

**Combined branch.**
- The V2 prompt (`stepInstructions`) is used only when the day has a `purpose`. In Spanish Money that is only W2D1 and W2D2 (`es/pathCopy/money.ts:183,215`). W4D4 goes through `legacyStepInstructions`, which is byte-for-byte main's text. **Not fixed for this day.**
- V2 itself still carries the same "invite them to try again" bullet (`:186`) next to «Do not ask her a question», so the contradiction survives there too.
- `sanitize` is unchanged (`:368`).
- On the client, the branch keeps `retry` replies off the session close (`day.tsx:1385,1442`). That only covers `retry: true` (server-detected non-answers). A model-written invitation like this one has no flag, so "the retry invitation never carried to a later screen" does **not** cover this case.
- **Status: partly** (structure improved, this bug not fixed).

**Open decision:** whether a short-but-real last answer («Todo bien») should be accepted as-is (recommended) or treated as a non-answer.

---

## 03 · P2 · Transient keyboard overlap

**Verdict:** PLAUSIBLE (classify only). The code has two timing paths that produce "covered, then settles".

**Evidence.**
- `hooks/useKeyboard.ts:38-46`: iOS state updates on `keyboardWillShow`, which is fine.
- `useKeyboardAwareScroll` (`useKeyboard.ts:157-172`) reveals the focused field twice. The first pass runs on `keyboardWillShow`, before the avoider has shrunk the scroller, and its scroll is clamped to 0 (the file says so at `:161-164`). The second pass runs on `keyboardDidShow` and does an animated `scrollTo`. Until that second pass the field can sit under the keys. This is used by the step screen (`StepScreen.tsx:242`, 88 pt gap) and the circle composer.
- The daily step in the photo band:
  - `BandDay.tsx:188-200` shrinks the band when `keyboard.visible`, with an `Animated.timing` of `BAND_MS = 500` ms (`photoDay.ts:70`). That is not tied to the keyboard's own ~250 ms curve.
  - The composer padding (`KeyboardAvoider toScreenBottom`, `KeyboardAvoider.tsx:73-75`) jumps to the full keyboard height instantly, with no animation.
  - So content above it moves in three different rhythms (instant, 250 ms, 500 ms) and then the didShow scroll. That adds up to roughly 0.5-1 s of settling.
- Pregunta (`(tabs)/ask.tsx:178-184,361`): `KeyboardAvoidingView` padding, plus `scrollToEnd` 50 ms after `visible`. Less likely to overlap.

**Fix direction (not requested):**
- In `BandDay`, drive the band collapse with `keyboard.duration` and start it on `keyboardWillShow`.
- Or move to `react-native-keyboard-controller`, which is a bigger change.

**Needs:** a screen recording at 60 fps on device, to tell which composer it was.

**Combined branch:** not touched. `BandDay` gained a folded question line on `keyboard.visible && scrolled`, with the same timing.

---

## 04 · P1 · Weekly metrics («Cómo has estado»)

**Verdict:** CONFIRMED-IN-CODE. Reproduced exactly by running the real `score()` with 2 active days, 4 answered-step signals, 0 check-ins:
`engagement 29, agency 80, connection 0, mood/stability/outlook null, confidence 0.24, checkIns 0, daysActive 2`.

**Screen:** `apps/mobile/app/progress.tsx`. Labels are in `es/account.ts:563-566`; the footer is `:519-522`.

**Computation:** `apps/api/src/services/wellbeing.ts`.
- **Presencia 29** = `round(days/7*100)` = 2/7 → 28.6 → **29** (`:189`). It is a percentage shown as a bare number under the hint «Días en los que estuviste aquí». Yes, 29 = 2/7 as a %.
- **Acción 80** = `round(min(completions/5,1)*100)` where `completions` counts **every** `path_day` signal of kind `completed` **or `answered`** (`:192-195`). `saveStep` writes one `answered` signal per step (`services/progress.ts:~815`). So 2 days × 2 steps = 4 → 4/5 = **80**. It counts steps, not "días y acciones que terminaste".
- **24 %** = `confidence = days/5*0.6 + checkIns/5*0.4` = 0.4×0.6 + 0 = **0.24** (`:223-224`). The footer calls it «basado en el 24% de una semana completa» (`account.ts:521`), but it is a confidence blend, not a share of the week.
- **0 registros** = mood check-ins (`checkIns: moods.length`).
- **Missing data:**
  - mood, stability and outlook become `null` and show «—» (correct).
  - **connection becomes 0** whenever any signal exists and there were no social actions (`:198-200`). Engagement and agency likewise show 0 rather than «—» on a week with signals but no path answers. So "no data" partly becomes zero.
- **Deltas without a period:** `progress.tsx:37-41` picks `previous` = the latest earlier week with `confidence > 0`, which may be many weeks back. `:189-197` prints `-12` with no «vs. semana del …». A delta of 0 is hidden (`delta ?`).

**Smallest fix.**
- `progress.tsx`:
  - For `engagement`, show «2 de 7 días» (from `latest.daysActive`) instead of the % number.
  - Under deltas, add «vs. semana del {formatWeek(previous.periodStart)}».
  - Reword `weekBasis` to «2 días activos · 0 registros · lectura con pocos datos» (no %), or drop the %.
- `wellbeing.ts:192-195`: count distinct `localDate`s with a `path_day` signal (days, not steps), or only `completed`.
  - `:198-200`: leave `connection` `null` when `socialActions === 0`.
  - Snapshots are frozen rows (`snapshotWrite`), so already-written weeks keep their old numbers. Only new weeks change, or a one-off recompute is needed.

**Combined branch:** not touched.

**Open decision:** whether Acción measures days, steps or completed actions; whether to show % values at all on a 2-day week.

---

## 05 · P2 · «Todo bien» promoted to Hoy and to «Frases que guardaste»

**Verdict:** CONFIRMED-IN-CODE: automatic promotion of `keep:"sentence"` answers.

**Evidence (main).**
- Every Money `take` step is `keep: "sentence"` (`content/pathDays/money.ts`, e.g. W4D4 at `:397`).
- `components/practice/collection.ts:90-101`: any answered step with `keep` becomes a `kind:"sentence"` item. There is no save action by her, and no filter for non-answers.
- That list is the profile drawer's «Frases que guardaste» (`profile.tsx:192`, `es/account.ts:31`). That is the handoff's «Una frase que guardaste».
- Hoy «Para retomar» (`app/(tabs)/index.tsx:289-304`) uses `recallFor` (`hooks/todayEntry.ts:295-330`).
  - `recallFor` → `headlineValue` picks the day's prose (reflect wins). For W4D4 that is the `take` answer «Todo bien».
  - The label is «Hoy dijiste · Día 4» / «Ayer dijiste · Día 4» (`es/home.ts:349-357`); the handoff wrote «Tu reflexión · Día 4».
  - Shown as «Todo bien», with **no question**.
- Hoy's `recall.quoted` uses «…» while the rest of the app's `common.format.quote` uses “…” (`es/common.ts:12`), so quote styles differ.

**Smallest fix.**
- Filter `isNonAnswer` in `collection.ts:91` (as the branch's `takeawayText` already does), and skip very short answers if desired.
- Show the question as context: on Hoy, a `detail` line with the step title; on the shelf, the day's question (it is already in `days`).

**Combined branch: changes it, partly.**
- `recallFor` is removed. Hoy now shows `TakeawayRow` from `hoyTakeaway`/`takeawayText` (`lib/session.ts`, `packages/shared/src/session.ts:185-206`), labelled «Hoy te llevas · Día 4» / «La última vez anotaste · Día 4» (branch `es/home.ts:355-361`). This is the handoff's «Te llevas».
- On non-session days `takeawayStepOf` falls back to the last `keep` step, so W4D4's «Todo bien» is **still promoted**. `isNonAnswer` does not catch it.
- The card has **no question** (label + quote + hint).
- The shelf in `collection.ts` is unchanged.

**Open decision:** should `keep:"sentence"` be explicit (she taps «Guardar») or stay automatic, and should Hoy show the question?

---

## 06 · P2 · Hoy repeats progress

**Verdict:**
- Repetition: CONFIRMED-IN-CODE.
- The «Tu camino por Asia» Atlas banner: NOT REPRODUCIBLE FROM CODE. No such string or component exists on main or the branch. `globe.ts` has `sheet.path` «El camino de {continent}: …» only inside the Atlas globe sheet.
- The design choice: NEEDS DECISION.

**Order on main** (`app/(tabs)/index.tsx`):

| Lines | Section | Shows |
|---|---|---|
| `:214` | Masthead | |
| `:236-268` | `HoyPostcard` | `placeLine` «Arashiyama, Kioto, Japón · Semana 4 · Día 4» (`:383`) + «Día 4 hecho» + title + button |
| `:270-287` | «Tu semana en Arashiyama» | aside «4 de 7» + `WeekDiscs` + «Esta semana: …» |
| `:289-304` | «Para retomar» | |
| `:306-342` | «Para hoy» | guide, «Ver dónde estás» (six areas, not the Atlas), Elara |

Week and day appear on the postcard, again as the disc count, and again in the Atlas tab.

**Minimal reduction (pick one).**
- (a) Drop the aside count «4 de 7» (`:275-276`): the discs already show it.
- (b) Drop «· Semana 4 · Día 4» from `placeLine` (`es/home.ts` `hoy.placeLine`) and let the discs carry the position.
- (c) Fold the discs into the postcard and remove the section.

(a) is a two-line change.

**Combined branch:** order changed (Masthead → takeaway at the top when today is done → postcard → takeaway under it → week discs → «Para hoy»; «Para retomar» is removed). The repetition is unchanged.

---

## 07 · P2 · Circle post composer: identity scrolls away

**Verdict:**
- The layout problem: CONFIRMED-IN-CODE.
- The identity itself: correct in code.

**Evidence.**
- `components/circles/circulos/CompartirSheet.tsx:131-152`: order is circle chips → multiline `TextField` (min 120 pt, grows, `maxLength 4000`) → `NameChoice` → «who sees it» line.
- All of that is the sheet's scrolling body. «Publicar» is in `footer` (`:99-112`), which `Sheet.tsx:308-324` pins outside the `ScrollView`. As she types, the field grows and the keyboard shrinks the sheet, so `NameChoice` falls below the fold while «Publicar» stays visible.

**Identity sent and shown correctly.**
- Client: `anonymous` state goes to `api.createTopicPost(..., { anonymous })` (`:53,70`).
- Schema: `anonymous: z.boolean()` (`packages/shared/src/circleTopics.ts:87,100`).
- Insert: `services/circleTopics.ts:534` stores it.
- `authorOf` (`:170-173`) returns `{ anonymous:true, id:null, name:null }` to everyone. Names are not even fetched for anonymous rows (`:294,452-454`).
- Byline: «Anónima» to others, «Tú (Anónima)» to her (`components/circles/topics/ui.tsx:55-58`).
- Not audited: push and digest copy.

**Smallest fix:** in `CompartirSheet.tsx`, move `<NameChoice …/>` and the `who` line above the `TextField`. Or render `<NameChoice compact …/>` inside the pinned `footer` above «Publicar». `NameChoice` already supports `compact`.

**Combined branch:** not touched (it changes only `circulos/parts.tsx` and `CirclesTopicsScreen.tsx`).

---

## 08 · P2-P3 · Spinner-only buttons; empty Explore tab

**08a verdict:** CONFIRMED-IN-CODE.

**Evidence.**
- `components/system/PrimaryPill.tsx:108-111`: `loading` cross-fades the whole label to a bare `ActivityIndicator`.
- `:127` `disabled={off || loading}` blocks repeat taps, and `:131-133` keeps the label for VoiceOver plus `busy`.
- Callers:
  - Join: `CircleScreen.tsx:151`, `circle-preview.tsx:138`.
  - Publish: `CompartirSheet.tsx:107`, `topic-compose.tsx:166`.
  - Save: `resource/[id].tsx:436`, `event-detail/[id].tsx:350`.
  - `CompartirSheet` also guards in `onPress` (`ready` includes `busy`), so it is double-protected.
- `circle-compose.tsx:95` already does it the other way, with the label «Publicando…».

**Smallest fix:** in `PrimaryPill`, render the spinner (size small) next to the label instead of replacing it, or accept an optional `loadingLabel`. One component, no caller changes.

**08b verdict:**
- The behaviour: CONFIRMED-IN-CODE.
- The «Empleos» name: NOT REPRODUCIBLE FROM CODE.

**Evidence.**
- Explore tabs are a static list: `lib/exploreCatalogue.ts:23` `CATEGORIES = ["all","workshop","listen","watch","guide"]`, labelled «Todo, Talleres, Audios, Videos, Guías» (`es/explore.ts:40`).
- There is no jobs or «Empleos» category anywhere in code or CMS kinds. The tab in the recording was most likely «Talleres» or another kind with no items.
- `CategoryTabs` (`components/explore/Catalogue.tsx:149-185`) always renders every tab. An empty one shows `catalogue.empty` «Todavía no hay nada aquí. Vuelve pronto.» (`(tabs)/explore/index.tsx:94-102,242-244`; `es/explore.ts:91`).
- A `hasAny(c, category)` helper already exists (`exploreCatalogue.ts:83-97`) and is not used by the tabs.
- `hasAny("workshop")` checks `featured || recordings`, while the empty check uses `upcoming || recordings`. Align them when wiring.

**Smallest fix:** pass the catalogue to `CategoryTabs` and render `CATEGORIES.filter(c => c === "all" || hasAny(catalogue, c))`. If the current tab disappears, reset it to `"all"`.

**Combined branch:** not touched.

**Open decision:** whether to hide empty kinds, or keep them with a better empty state.

---

## Recommended fix order

1. **02**: P1, copy users see on the done screen, and a broken quote. Two small edits in `stepReply.ts` (prompt bullet on the last step in both prompt builders; balanced quote strip). Ship with the combined branch, since it already edits this file.
2. **04**: P1, numbers that mislead.
   - Client-only first: `progress.tsx` units («2 de 7 días»), the delta baseline label, the footer wording.
   - Then `wellbeing.ts` agency/connection, which affects only new weeks.
3. **01**: P1, needs the naming decision first. Then a 2-line change in `placeDay.ts` + its test (or the Atlas screens read `toward`).
4. **05**: filter non-answers from the shelf and the Hoy takeaway (`collection.ts`, `session.ts`); add the question as context.
5. **07**: move `NameChoice` above the field in `CompartirSheet.tsx`.
6. **08a**: `PrimaryPill` keeps the label while loading.
7. **06**: drop the «4 de 7» count (after design sign-off).
8. **08b**: hide empty Explore tabs with `hasAny`.
9. **03**: device capture first; then tie BandDay's band collapse to the keyboard's duration.
