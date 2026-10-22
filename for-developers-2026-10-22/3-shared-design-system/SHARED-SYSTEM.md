# Elara shared system for tab-level screens (Explorar and Círculos)

Current state: the unify pass (v1), which is what the live review pages and the developer handoff show. The later refinement (v2) is in ../4-pending-your-review/ and has not been approved.



22 Oct 2026. Prototype work only: nothing in `/home/user/elara` or `/home/user/elara-circles-ux` changed, nothing was committed, pushed or published.

The owner said: "make sure circles and explore have some coherence, they seem both way too off." This pass makes the two review prototypes draw the same frame:
- `explore-refined-2026-10-21/artifact/`
- `circles-review-2026-10-22/artifact/`

Each prototype keeps its own content, flows and identity.

**Where it lives**
- `_shared/elara-shared.css` is the single source of the shared block. The same bytes are pasted into both `index.html` files, between `/* ==== ELARA SHARED SYSTEM v1` and `end ELARA SHARED SYSTEM v1 ==== */`.
- Both prototypes use the same `--el-*` token names. Their old token names (`--ivory`, `--forest-ink`, `--page`, `--card`, `--meta`…) are now aliases of the shared ones, so no colour is defined twice.
- Each prototype supplies only two things to the shared block:
  - its font stacks (`--el-serif`, `--el-sans`);
  - its text-size mapping (`--el-fs-*`, `--el-lh-*`). Explorar uses rem (html 140 % for large text). Círculos uses per-role multipliers with the app's caps.
- Before snapshots: `explore-refined-2026-10-21/v2b-before-unify/artifact/` and `circles-review-2026-10-22/v2-before-unify/artifact/`.
- Before/after PDF: `_shared/explore-circles-coherence.pdf`. Its captures are in `_shared/captures/`. These are browser renders (headless Chromium), not phone screenshots.

## Decisions where a choice was left

| Choice | Decision | Why |
|---|---|---|
| Band colour | **#1F3A2E** (`buttonForest`) in both | This is the forest the owner named for primary actions, and production's `buttonForest` / `bubbleMine`. With one forest, the band, the primary buttons, the selected chips and the links all read as one colour. Explore's photo does not need the darker #0E261D: no text sits on the photo, the «Próximo taller en vivo» label is on its own opaque chip, and the photo's bottom shade was re-tinted to the new band. Every band text pair passes AA: cream 10.98, muted 8.09, mint 8.57. |
| Title style | **Fraunces 600, 28/34**, 8 px top padding, 48 px title row | 600 at 28/34 is production's `typeScale.title`. `scale.ts` also says "Fraunces sets every editorial page title… It is semibold." Círculos' cut was already 600. Explore's light 360 at 30 px was the outlier. For the same reason, all of Explore's UI serif (feature and detail titles, date numerals, guide titles, price) moved to 600. The cover art keeps its own lettering. |
| Primary on the band | **Inverse: cream #F7F1E8 fill with forest text** (10.98:1) | A forest button would vanish on a forest band. Production's `buttonOnDark` is terracotta (#B8441A, 4.82:1 with cream). The owner asked for terracotta to be used sparingly, so the band primary is the forest primary inverted. This affects only «Ver el taller» and the mini player's play button. |
| Page ground | **#F9F5EF** (`colors.background`) | Production's canvas. It sits between Explore's #FCF9F3 and Círculos' #F5EFE4. |
| Metadata | **#635A54** (`textSecondary`), **13/18, Instrument Sans 400** | One production colour (6.20:1 on page, 6.62:1 on card, 5.2:1 or more on every circle tint). 13 px is one step above production's 12 px `detail`, because these lines carry lengths, times and hosts she acts on. 12 px stays for the tab labels and captions. |
| Card | fill #FFFDF9 (`bubbleMember`), border 1 px #D6CBBC (`rule`), radius 8 (`radius.content`), padding 16 (`padding.content`) | These are production's semantic aliases. Explore's 4 to 6 px and Círculos' 14 px both move to them. |
| Sheets | radius 32 (`radius.sheet`) | This is production's own value ("the one arbitrary radius in the export"). |

## Tokens

### Colour (AA ratios are WCAG 2.1, computed)

| Token | Hex | Role | Ratio |
|---|---|---|---|
| `--el-band` | #1F3A2E | Header band, status-bar fill | – |
| `--el-forest` | #1F3A2E | Primary fill, links, selected chip, progress | 11.35 on page, 12.14 on card |
| `--el-on-forest` | #F7F1E8 | Text on forest (`cream`) | 10.98 |
| `--el-on-band-mut` | #C9D4CD | Secondary text and resting sub-tabs on the band | 8.09 |
| `--el-on-band-sel` | #FFFFFF | Selected sub-tab | 12.33 |
| `--el-on-band-line` | cream at 45 % | Edge of a control on the band | 3.52 (non-text) |
| `--el-on-band-rule` | cream at 18 % | Rule under the sub-tabs | decorative |
| `--el-page` | #F9F5EF | The page ground | – |
| `--el-card` | #FFFDF9 | Card, field and light icon-button fill | – |
| `--el-paper-2` | #F1EBE2 | Muted paper tiles («Los 12 audios», the guide glyph, placeholders) | meta on it 5.68 |
| `--el-rule` | #D6CBBC | Row rules and card borders | decorative |
| `--el-control` | #8E8174 | Edge of a chip, field or light icon button | 3.49 page, 3.73 card |
| `--el-ink` | #1A1615 | Titles and item names | 16.53 page, 17.67 card |
| `--el-body` | #3B342F | Running text in Círculos posts | 12.03 card |
| `--el-meta` | #635A54 | Every metadata line, resting tab label | 6.20 page, 6.62 card |
| `--el-ember` | #E65A28 | Accent only, never text: sub-tab underline, live dot, focus ring | 3.44 on band, 3.30 on page (3:1 non-text) |
| `--el-terra` | #C94A1C | Activity dots (non-text) | – |
| `--el-terra-text` | #A13A12 | Terracotta as text: active tab label, «1 nueva» | 6.18 page, 5.70 on its peach chip |
| `--el-danger` | #B3261E | Destructive only | 6.02 page; white on it 6.54 |
| `--el-mint` | #A3E5C7 | Ink on the band only («Gratis», counts, eyebrows) | 8.57 |

Kept per prototype on purpose (see "What each keeps"): the circle accents and tints, Explore's amber guide rule (#E5A93C, decorative), the cover palette, and Círculos' `--forestSoft` #E1EAE3 note ground.

### Type roles

| Role | Face | Size / line | Where |
|---|---|---|---|
| Band title | Fraunces 600 | 28/34 | «Explorar», «Círculos» |
| Display headings | Fraunces 600 | Explore 28–32; Círculos 19–22 | Feature, detail and circle names |
| Section heading | Instrument Sans 600 | 18/24 | «Para escuchar», «Tus círculos», «Conversaciones recientes» |
| Label, sub-tab, link, button | Instrument Sans 600 | 15/20 | «Mis círculos», «Ver todos», «Unirme», «Ver el taller» |
| Body | Instrument Sans 400 | 15–16 | Unchanged in each |
| Metadata, chip label | Instrument Sans 400 (chip selected 600) | 13/18 | «Audio · 1 min 39 s», «Agotamiento · hace 35 min» |
| Tab label | Instrument Sans 400 (active 600) | 12/16, scaled at most 1.15× | Tab bar |

Instrument Sans stops at 600 in both, as `scale.ts` asks. Explore's 700s became 600, and the 700 file is used only by the reviewer chrome.

### Spacing and radius
- Gutter 16.
- Card padding 16.
- Band: 8 top, 48 title row, 4 above the sub-tabs, 44 sub-tab row. Then either the band's own content or a 14 px foot, then the 14 px torn edge.
- Targets at least 44 × 44.
- Radius:
  - card 8: cards, photos, notes, toasts, the mini player;
  - row 4: thumbnails, date tiles, labels on photos;
  - sheet 32;
  - pill: buttons, chips, fields on one line.
  - Covers keep 3 (art).

## Components

| Component | Spec | Explorar markup | Círculos markup |
|---|---|---|---|
| **Header band** | `.el-band` #1F3A2E; `.el-band-hd` top 8; `.el-band-row` 48 high: `.el-title` left, `.el-band-acts` right | `.band.el-band` > `header.hd.el-band-hd` | `.fhead.el-band` > `.el-band-hd` |
| **Band button** | `.el-bbtn`: 44 high, pill, 1 px cream 45 % edge, cream 15/600 text, optional label (`.lbl`). `.el-lbtn` is the same on light: card fill, #8E8174 edge, ink | search, «Guardados» (on band); back and save (light) | «Ayuda» on the band (`.el-bbtn`), on the circle and post bars (`.el-lbtn`) |
| **Sub-tabs** | `.el-subtabs`: one scrolling line, 1 px rule; `.el-subtab`: 44 high, 15/600, resting #C9D4CD; selected white with a 3 px ember underline | `.cats` Todo / Talleres / Audios / Videos / Guías (`aria-pressed`) | «Mis círculos / Descubrir» (`role=tab`, `aria-selected`) |
| **Torn edge** | `.el-tear`: 14 px band strip with a page-coloured paper edge. Same seeded path (seed 7, 400 × 14) in both | after the band (scrolls with the page) | after the band (the band is fixed; the page scrolls under the edge) |
| **Section heading** | `.el-sech` 18/24 600 ink; link `.el-more` 15/600 forest, underlined, 44 high, no icon | `.sec-h h2`, «Ver todos» | `.sh .t-sectionTitle`, «Descubrir más círculos», «Editar» |
| **Card** | `.el-card` values: #FFFDF9, 1 px #D6CBBC, radius 8, padding 16 | «Continuar escuchando», price box | post cards, circle cards, shortcuts, composer place card |
| **Row** | 12 px vertical padding, 1 px #D6CBBC rule between rows, no fill | workshop, video, audio, guide and search rows | management, settings, rules and reason rows |
| **Filter chip** | `.el-chip-hit` 44 high around `.el-chip`: 32 high, pill, 1 px #8E8174, card fill, 13/18 ink. Selected: forest fill, cream 600 text, check | search format filters (new: they were underline tabs) | section filters, Descubrir filters, the composer section picker |
| **Primary button** | `.el-btn-p`: 48 high pill, forest #1F3A2E, cream 15/600. On the band: cream fill, forest text | «Reservar mi lugar», «Escuchar», «Ver el próximo taller»; on the band «Ver el taller» | «Unirme», «Publicar», «Escribir en este círculo» |
| **Secondary button** | `.el-btn-s`: card fill, 1.5 px forest edge, forest text (cream outline on the band) | «Ver los audios», «Cancelar mi lugar», sheet «Ahora no» | «Entrar» |
| **Destructive** | `.el-btn-d` #B3261E with white text (6.54:1). Only for leaving, blocking or deleting | none | the confirm button of the leave and block sheets; red text for «Quitar foto», report and retract |
| **Tab bar** | `.el-tabbar`: production `TabBar.tsx` metrics. Pad top 10, 44 targets, glyph 24, gap 3, label 12, bottom pad max(inset, 8). Canvas at 95 % with blur and a #E8E0D5 hairline. Rest #635A54 400. Active #A13A12 600 with a filled glyph. Labels and order from production: Hoy, Atlas, Pregunta, Explorar, Círculos. The paper orb for Pregunta. Same stand-in glyphs (`EL_TAB`) in both | `#tb.tb.el-tabbar` | `.tabbar.el-tabbar` |

## What each prototype keeps as its own
- **Explorar:**
  - the featured workshop inside the band (on Todo and Talleres), and the one-line lead under the title;
  - the audio cover family (paper grounds, live Fraunces titles, cue-drawn subjects) and the real photos and film stills;
  - the amber rule on guide rows, and the rule-separated rows for workshops, videos, audios and guides;
  - the forest date tiles.
- **Círculos:**
  - the 11 circle accents and paper-cut symbols, on the Descubrir cards (top edge), the shortcuts (left edge), the circle header (tint ground and large faint symbol) and the post tag;
  - post cards stay cards, since conversations are the content;
  - avatars, the reply bar, the composer, the sheets and the simulated keyboard and device insets.
- Both sit inside the shared band, page, card, chip and tab bar. Accents never colour a primary button or a selected state, which stay forest.

## Change table

### Explorar (`explore-refined-2026-10-21/artifact/index.html`; standalone rebuilt)

| # | Change | Before | After |
|---|---|---|---|
| E1 | Band colour | #0E261D | #1F3A2E (also the live label, the duration chips, the date tiles, the mini player and the photo shade) |
| E2 | Title | Fraunces 360, 30/33, opsz 72 | Fraunces 600, 28/34 (`.el-title`) |
| E3 | Every UI serif | 360 / 400 / 420 | 600. The cover art keeps its own lettering |
| E4 | Primary buttons | ember #E65A28 with ink text | forest with cream text. On the band: cream with forest text |
| E5 | Secondary buttons | 1.5 px ink outline | 1.5 px forest outline, forest text, card fill |
| E6 | Button size | 16 px text, radius 24 | 15/20 text, pill (48 high unchanged) |
| E7 | Page ground | #FCF9F3 | #F9F5EF |
| E8 | Rules and card borders | #E4DACB | #D6CBBC |
| E9 | Card fill | #FFFFFF | #FFFDF9 (also the light icon buttons and the search field) |
| E10 | Radii | photo, card and price box 6; mini player 10; sheet 16 | 8, 8 and 32 |
| E11 | Metadata | #5A524C, 14 px | #635A54, 13/18 |
| E12 | Section heading | 20/24, 700 | 18/24, 600 |
| E13 | Bold | 700 in labels, eyebrows, facts, rows | 600 |
| E14 | Search format filters | underline tabs | filter chips (`.el-chip`), with a check when selected |
| E15 | Tab bar | own bar: 54 high items, 600 labels, ember-deep active, ember dot for Pregunta | shared `.el-tabbar`: production metrics and orb, active #A13A12 |
| E16 | Band buttons | search border at 18 % cream | 45 % cream edge (`.el-bbtn`, 3.52:1) |
| E17 | Focus ring | 3 px ember | unchanged value, now `--el-ember` |
| E18 | Muted tiles | #F3ECE1 | #F1EBE2 |
| E19 | Valeria's monogram | #16382A | #1F3A2E |
| E20 | Torn edge | fill #FCF9F3 | `.el-tear`, filled with the page token (same path) |

Markup changes:
- `.el-*` classes were added next to the old ones; the old ones are kept for the checks.
- The search format buttons now wrap a `.el-chip` span. They keep `data-act=fmt` and `aria-pressed`.
- The tab bar items now have `.el-tab` and `.el-tab-l`. They keep `data-act=navtab` and `data-t`.
- No copy, flow or data changed.

### Círculos (`circles-review-2026-10-22/artifact/index.html`, `app.js`)

| # | Change | Before | After |
|---|---|---|---|
| C1 | Title | Fraunces 600, 24/30 | Fraunces 600, 28/34 (`.el-title`) |
| C2 | Header mark | paper-cut sun over hills beside the title | removed (see below) |
| C3 | «Mis círculos / Descubrir» | ivory pill segmented switch with a check | underline sub-tabs in the band (`.el-subtabs`): white text and a 3 px ember underline when selected, 44 px targets; `role=tab` / `aria-selected` kept |
| C4 | Band end | straight edge | 14 px band foot, then Explore's torn edge (same seeded path) |
| C5 | Band padding | 4 top, 12 bottom | 8 top, the shared rows |
| C6 | «Ayuda» pill | own pill, cream 55 % edge on the band; forest text on light | `.el-bbtn` on the band; `.el-lbtn` on the circle and post bars (ink, card fill, #8E8174 edge) |
| C7 | Page ground | #F5EFE4 | #F9F5EF |
| C8 | Card | #FFFCF6, #DCD1C1, radius 14, padding 14 | #FFFDF9, #D6CBBC, radius 8, padding 16 (post, circle and composer cards; photo margins) |
| C9 | Other radii | photos 12, notes and errors 10, crisis card 14, danger card 12, toast 14, multi-line field 12, sheet 24, lightbox 6 | 8 for all of these; sheet 32 |
| C10 | Metadata | #5C534C, 13/18, 500 | #635A54, 13/18, 400 (also chevrons and icon strokes) |
| C11 | Section heading | 17/23 | 18/24 |
| C12 | Section links | «+ Descubrir más círculos», «Editar» as plain forest labels | `.el-more` (underlined forest 15/600, no icon), as «Ver todos» |
| C13 | Filter chips | own `.fchip` | the shared `.el-chip` (same 32/44 geometry); unselected label 400 instead of 500 |
| C14 | Buttons | 50 high | 48 high |
| C15 | Secondary text on the band | #D9E3DC | #C9D4CD |
| C16 | Tab bar | own bar: 11 px 500 labels, pad top 6, items 48 high | shared `.el-tabbar`: 12 px labels, pad 10, 44 targets, filled active glyph |
| C17 | Focus ring | 2 px blue #2A6BD6 | 3 px ember, as Explorar |
| C18 | Post bar «Ayuda» | – | 6 px narrower at the post screen, so the circle name keeps two full lines at 320 px with text 1.6 |

No flow, copy, rule or data changed. The checks needed no selector changes: the flows click `[data-act]`, which is unchanged.

**Why the sun-and-hills mark went.** Placed in both, it would sit beside «Explorar» as a second logo on a screen that already has a photo. In Círculos it was the only decoration in the band, and it competed with the circle symbols. The torn edge now does the paper-cut job in both.

## Checks after this pass
- **Explorar** (`tools/checks.cjs` and `analyze.py`, 52 screen runs):
  - no horizontal scroll 52/52, no clipping 52/52, targets 52/52, bottom clear 52/52;
  - AA 2 860/2 860 (lowest over a cover 4.73, lowest flat 4.82);
  - flows 164/164, time zones 6/6;
  - first viewport unchanged: 98 px of covers at 390 × 844;
  - the standalone loads from `file://`.
- **Explorar: two check steps updated.** Before this pass the suite failed 8 runs (156/164). Two steps still assumed the old default copy mode. The artifact has opened in proposed copy since its 22 Oct 00:51 final-review change, and those two steps were never updated. The fixed steps are:
  - «copy toggle», which now starts from proposed copy;
  - «search Audios + dinero», which expects one match in proposed copy (the title is retitled in COPY-PROPOSALS #7) and two in actual copy.
  - Nothing else in the suite changed.
- **Círculos** (`tools/checks.cjs`, 6 configurations, 330 audits):
  - flows 390/390;
  - 0 horizontal scroll, 0 clipped, 0 targets under 44, 0 contrast failures;
  - «Publicar» 60/60, reply with the keyboard 6/6, «Ocultar teclado» 24/24, 0 page errors;
  - 29 designed truncations, the same as before.

## What could not be unified, and why
1. **Device insets.**
   - Círculos simulates the iPhone's status area and home indicator (47 and 34 px at 390 × 844). Explorar has no device simulation and uses the browser's real `env()` insets, which are 0 on a desktop.
   - The band is identical below the inset.
   - The "same app" board in the PDF shows Círculos with its insets set to 0 (its own `topOverride` / `bottomOverride` review hooks) so the two compare like for like. The per-screen pages show Círculos with its normal insets.
2. **Large text mechanism.** Explorar scales everything by 140 %. Círculos scales each role by 1.6 with production's per-role caps (title 1.35, tab 1.15). The base sizes match, and the tab label is now capped at 1.15 in both. Large-text renders still differ in the other roles.
3. **Font files.** The family names differ («Fraunces E» / «Instrument E» versus «Elara Fraunces» / «Elara Sans»). Explorar's cover SVGs and its standalone check reference its names. Both render the same cuts: Fraunces 600, Instrument 400 and 600.
4. **Band content.** Explorar's band carries the featured workshop on Todo and Talleres, plus a one-line lead. Círculos' band ends after the sub-tabs. This is content, not style, and copy was out of scope.
5. **Body text colour.** Círculos' running text is #3B342F; Explorar's is ink. Both pass. Changing either was outside "one metadata colour", so this is left as an open item.
6. **Choice chips in Círculos** («Cómo apareces», interests) stay 44 px choice controls with a radio or check, because they are choices, not filters. Their edges, fills and selected forest match the filter chip.
7. **Blur.** Production's tab bar is a `BlurView`. The prototypes use CSS `backdrop-filter`, which is close but not the same.
8. **Primary versus production's "forward = ember".** `colors.ts` `ctaSemantics.forward` is still ember. This pass follows the owner's rule and production's own `buttonForest` ("Primary button on LIGHT screens: forest pill, cream text"). The ember rule in `colors.ts` is now out of step with both prototypes. Updating it is for the design-system owner.

## Logo-removed test
I looked at the after screens side by side (PDF page 2) and asked: if I removed the logo, would these two clearly be the same app, and still feel like Elara?
- **Same app: yes.** They share the band, the title, the pill buttons, the underline sub-tabs with the ember mark, the torn paper edge, the page, the section headings and links, the metadata line, the cards and the tab bar.
- **Before: no.** Two greens, two title weights, an ember button against a forest one, a pill switch against tabs, a straight edge against a torn one, and two tab bars.
- **Elara: yes.** Forest with cream, Fraunces 600, the torn paper, Explorar's paper covers and real photo, Círculos' paper-cut symbols, and Spanish-first copy.
- **Fixed after the first look:**
  - The tab bar let shelf text show through. It now has the blur.
  - The «Ayuda» pill was wider at 320 px with large text and truncated the circle name on the post screen. It is now trimmed by 6 px there.
- **Still the most generic part:** the post card layout (avatar, lead, body, footer). It is plain on purpose so the conversations read first, as Círculos v2 already noted.

## Out of date in the Explore developer handoff (`explore-refined-2026-10-21/handoff/index.html`, not edited)
- **Tokens table:**
  - `--forest-ink #0E261D` (band) is now #1F3A2E.
  - `--forest #16382A` is now #1F3A2E.
  - `--ember` is listed as "Primary button, selected tab, focus". It is now the selected-tab underline, live dot and focus ring only.
  - `--ivory #FCF9F3` is now #F9F5EF.
  - `--ivory-2 #F3ECE1` is now #F1EBE2.
  - `--paper-line #E4DACB` is now #D6CBBC.
  - `--mut #5A524C` is now #635A54.
  - `--on-band #F6EFE6` is now #F7F1E8.
  - The note "Primary buttons use ink text on ember" is replaced by: forest with cream text, and cream with forest text on the band.
- **Type table:**
  - Page title is Fraunces 600, 28/34 (was 360, opsz 72, 30/33).
  - Section heading is 600, 18/24 (was 700, 20/24).
  - Metadata is 13/18 #635A54 (was 14/19).
  - The guide title and the feature title are now Fraunces 600.
- **Components:** the video duration chip is #1F3A2E. The search format filter is now chips, not tabs. The tab bar now follows the shared spec.
- **Screens:** all 11 images in `handoff/img/` show the old colours and buttons.
- **Acceptance:** the lowest flat contrast is now 4.82 (was 4.74). Flows are 164/164 after the two updated steps.
- **New:** a reference to this file and to `_shared/elara-shared.css` as the shared frame.
