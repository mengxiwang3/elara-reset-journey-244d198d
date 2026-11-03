# Elara mobile: UI polish, 2 Nov 2026

The changes are uncommitted edits in `/home/user/elara` (HEAD 1363407). There is no commit, branch or push. The full diff is in `ui-polish.patch`, and `compare.html` shows the before and after screenshots side by side.

**New Spanish copy: none.** Every visible string comes from the existing locale files. The short Hoy title reuses the session header's "Hacia …" landmark line. The interests summary reuses `circleTopics.explore.yourInterests`. The globe's place name reuses `t.globe.places[id].name`. Nothing needs María and Alejandra's approval.

## 1. Photo step: compact preview with the required caption (done)
- **File:** `apps/mobile/src/components/practice/PhotoInput.tsx`
- **Preview size:** the chosen photo was a square preview up to 340pt tall. It is now a 112pt thumbnail (`spacing[24] + spacing[4]`, radius `content`, no border). This change and the others below keep the caption field in the first screen.
- **Links:** "Tomar otra" and "Elegir de la galería" now sit next to the thumbnail instead of below the caption.
- **Caption:** the required caption ("¿Qué es? (obligatorio)") sits directly under the thumbnail. The label already said it was required. Now it is visible, so the disabled Siguiente always has a visible reason.
- **"Foto guardada. Toca Siguiente para continuar.":** this line used to show while Next was still disabled, which was misleading. It now appears only once a caption has been entered.
- **Upload and retry:** the upload spinner, the failure message and the retry link moved into the column next to the thumbnail.
- **Cleanup:** the `useKeyboard`-driven preview resize was removed because it is no longer needed.

## 2. Typing: smaller header, short question kept above the field (done, with one caveat)
- **Files:** `landscape/BandDay.tsx`, `landscape/WorldDay.tsx` (header type), `app/path/day.tsx`
- **What changed:** while the keyboard is open and the page has scrolled the question out of view, a line of up to two lines is pinned under the folded header strip. It holds the step's question, with templates resolved the same way the step renders it.
- **Where the short version comes from:** the data has no short form of the question, so the line is the full question truncated to two lines.
- **Header shrinking:** the band already drops to the controls strip (`KEYBOARD_BAND`) when the keyboard opens on native. I left that geometry as it is, so its tests are unchanged. Before this change, the folded header only showed "Pregunta N de M".

## 3. Elara's reply ("De Elara" / "Elara notó") clears the footer (done)
- **Files:** `landscape/photoDay.ts` (`bandHeight({ reply })`, plus a test in `photoDay.test.ts`), `BandDay.tsx`, `app/path/day.tsx`, `StepScreen.tsx`
- **Smaller band when a step opens on a reply:** in the photo band, a step that opens on Elara's reply to the previous step now uses the compact band (170pt instead of 290pt). The reply starts about 120pt higher, so more of it sits above the fixed Continue/Terminar footer. Typing still wins and gives the controls strip.
- **More bottom space:** the step scroll's bottom padding went from 112 to the `layout.scrollPadBottom` token (128). This gives the last line of a long reply room above the footer at any text size.
- **Bringing a new reply into view:** when a reply lands under the field (non-band days and retry beats), the step scrolls to the end so the whole card is visible instead of starting below the fold.

## 4. Hoy card (done)
- **Files:** `app/(tabs)/index.tsx`, `src/components/hoy/HoyPostcard.tsx`
- **Print height:** the print is now a landscape strip, about 52% of its width with a 200pt cap (42% on screens under 700pt). It used to be 78% of its width, up to 262pt.
- **Title:** the title is now a short day title, chosen by `shortDayTitle()`:
  - the shorter of the day's own title and its first question, if one of them is 48 characters or fewer;
  - otherwise the session header's "Hacia …" line for that day;
  - otherwise the question, as before.
- **Full question:** it stays inside the session.
- **Metadata:** the place/week/day line is one line and uses the short place name (for example "Arashiyama, Kioto · Semana 4 · Día 3"). The minutes line uses `bodySmall`.
- **CTA:** unchanged ("Empezar el día N").

## 5. Círculos, Descubrir view (done)
- **File:** `src/components/circles/topics/CirclesTopicsScreen.tsx`
- **Order:** "Sugeridos para ti" now leads.
- **Interests:** they appear as one muted, single-line summary under the heading.
- **Editar:** it is a quiet link in the secondary text colour beside the summary. It used to be a forest-coloured action on its own line.
- **Members-only note:** "Solo las mujeres que se unen…" moved under the suggestions.
- **Unchanged:** the main tabs and the band.

## 6. Atlas globe labels (done)
- **Files:** `src/components/atlas/globe/paintGlobe.ts`, `GlobeScreen.tsx`
- **Drawing order:** labels are now drawn after the medallions. They used to be drawn underneath, which is why "DINERO Y SEGURIDAD" was cut by the markers.
- **Placement:** each continent label tries its anchor first, then positions above and below it. It only takes a spot that is clear of every medallion and every label already placed.
- **Priority:** the selected place's continent goes first, then continents that have been started, then the rest.
- **Labels that don't fit:** a label with no clear spot is dropped. A continent label close to the selected place is also dropped.
- **Selected place:** its name (catalogue copy) is printed first on a small paper tag beside its medallion, including in zone view, so it wins every overlap. The tag goes on the first side (below, above, right, left) that is clear of the other markers.
- **List view ("Ver lista"):** untouched.

## 7. Spacing and card treatments (partial: targeted, not app-wide)
- **Screen gutters:**
  - Circles `GUT` changed from 16 to `layout.screenMargin` (24), the same as Hoy and the day screens. This applies to every Círculos screen.
  - The photo band page side changed from 22 to `layout.screenMargin`, matching the step content's `spacing[6]`.
- **Section gaps:** Hoy went from `spacing[6] + 2` to `spacing[6]`. The postcard gap and bottom padding went from `spacing[5] + 2` / `spacing[6]` to `spacing[5]`.
- **Fixed-footer padding:** now uses `layout.scrollPadBottom`.
- **Borders:** the photo preview's border was removed. The image doesn't need a frame inside the page.
- **Not done:** I did not do a sweep of every screen's paddings, borders and pill buttons. This pass covers only the screens touched for items 1–6.

## Checks
- `pnpm --filter @elara/mobile typecheck` (tsc --noEmit): **pass**
- `pnpm --filter @elara/mobile test` (vitest): **122 files, 1313 tests, all pass**, including the new photoDay test
- `pnpm --filter @elara/mobile lint` (expo lint): **exit 1, 12 errors and 377 warnings, none introduced by this change.**
  - All 12 errors are in `src/components/atlas/globe/{GlobeScreen,Sheets,Postcard}.tsx`.
  - Linting HEAD's `GlobeScreen.tsx` gives the same 5 errors as the edited file. `Sheets.tsx` and `Postcard.tsx` are untouched.
  - An error introduced in `app/(tabs)/index.tsx` (preserve-manual-memoization) was fixed before delivery.

## How the screenshots were made (caveats)
- **Build:** a web export of the real app (`expo export -p web`), served with `/api` proxied to a local `wrangler dev` API. The local D1 was migrated and seeded with the repo's seed files. Test accounts were created through the API:
  - qa24: days 1–23 done, so today is the day 24 photo step;
  - qa28: days 1–27 done.
- **Database reset:** the database was reset to the same snapshot before every capture, and before and after used the same flows and viewports: 393×852 and 360×780.
- **Harness-only shims (not in the patch):**
  - `react-native-web`, `react-dom@19.2.3` and their dependencies were copied into `node_modules`, because the app does not declare a web dependency.
  - CanvasKit was injected so the Skia globe renders.
  - The bundle was given an `Image.resolveAssetSource` so the globe's font and thumbnails load.
  - All of these apply to both builds equally.
- **Keyboard (item 2):** web has no keyboard events. For both the before and after typing captures, a temporary `useKeyboard` shim treated a focused field as an open keyboard, and the viewport height was reduced to the space above a keyboard (393×516 and 360×470). The shim was reverted afterwards. `2-typing-scrolled` also scrolls the page, the way the native keyboard-aware scroll does.
- **Larger text (item 3):** RN-web has no font scale. Larger text was emulated with CSS `zoom: 1.3` on text nodes, so the band's native large-text compact mode (fontScale ≥ 1.35) does not kick in on web.
- **Reply text (item 3):** the local API has no AI binding. The step reply is intercepted and replaced with a long text labelled "[MOCK reply for QA]" so a long generated reply can be shown.
- **Days used:** item 3 uses day 28 (a non-quiet first step whose reply is carried onto step 2), because that is where "Elara notó/De Elara" with the footer appears in the current content.
- **Day-screen navigation:** captures go through Hoy's CTA. Opening `/path/day` by deep link on a cold load renders the bundled copy before `/api/paths` arrives, and the step ids then don't match the server (404 on save). See the notes below.

## Noticed, not changed (out of scope)
- **Cold deep link to a day:** opening `/path/day` cold builds the day's screens from the bundled content before the server content loads. If the two differ (as with seed-money-v4 locally), step saves 404 and the "will sync" note appears.
- **Mis círculos stuck on "Cargando…":** after choosing interests without joining a circle, Mis círculos shows "Cargando…" forever. `useTopicFeed` is disabled, so `isPending` stays true.
- **Lint:** the existing errors in the Atlas globe files are listed in the Checks section.

## Other caveats
- **Globe position:** the globe drifts slowly while idle, so its rotation differs by a few degrees between the before and after captures.
- **"6-atlas-selected-globe":** this is the selected place after its sheet is closed. With the sheet open (`6-atlas-selected`), the sheet covers the globe in both versions.
- **Greeting:** the Hoy greeting follows the real clock. Before and after were captured in the same evening, so it matches.
- **Left in place for re-running captures (all outside the git diff):**
  - `apps/api/.dev.vars` (gitignored, local-only dev secret, not a real credential);
  - extra packages under `apps/mobile/node_modules` and nested `react-dom` copies in `node_modules`, which `pnpm install` restores;
  - the harness scripts in the session scratchpad.
