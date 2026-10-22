# Circles review prototype: v1 to v2 (22 Oct 2026)

v1 = replica of branch `ux/circles-clarity-2026-10-21` at `1d96cff` (kept in `v1/`). v2 = proposals on top, same
rules. Before/after pairs: `captures/compare/`. All new Spanish copy is BORRADOR (STRINGS-v2.md).

## Look

- Compact forest header (`#1F3A2E`) with an ivory serif «Círculos» and a small paper-cut sun-over-hills mark; the
  peach wash and the large top gap are gone.
- «Mis círculos» / «Descubrir»: ivory pill with a check for the selected view, ivory-dim text for the other.
- Warm ivory page (`#F5EFE4`), cards a step lighter (`#FFFCF6`) with a 1 px border, no heavy shadows, no nested cards.
- Type: serif only for the page title, circle names and the circle header; posts are sans: lead sentence 17 px
  semibold (20 px in a conversation), body 15 to 16 px in `#3B342F`, metadata 13 px in `#5C534C`.
- Each circle has one accent and a paper-cut symbol drawn for the prototype (coins, folded heart, steps, star, leaf,
  house, open book, key, moon, fork, cup). Carried through the Descubrir card (top edge and medallion), the
  Mis círculos shortcut (left edge and medallion), the circle header (tint ground, medallion, a large faint symbol)
  and a small tag on post cards. The name is always shown.
- Forest for primary actions and selected states; terracotta only for new-reply markers, the active tab and the
  header mark; a dark red (`#B3261E`) only for destructive actions.
- Section and Descubrir filters: outlined chips with ink text; selected is forest with ivory text and a check.
- The blank white card under the Discover search and the faded filters are gone.
- A tab bar drawn from the branch's `TabBar.tsx` labels (stand-in icons).

## Choosing circles

- No memberships: opens on Descubrir with «Encuentra tus círculos» and one line of explanation; browsing first.
- Single-column circle cards: medallion, serif name, the catalogue one-line, number of sections, «Unirme» (forest),
  or «Ya eres parte» plus «Entrar» when joined. Tapping the card opens the preview.
- Filters Todos / Áreas de la vida / Etapas de la vida. Interests are optional and secondary; suggested circles are
  not repeated in the full list.
- Preview before joining: name, one-line, the section names («De qué se habla aquí»), «Unirme», «Normas».
- «Unirme» opens a short rules sheet (four points, «Ver las normas completas», «Unirme», «Ahora no»); confirming lands
  inside the joined circle with «Te uniste a …».

## Returning members

- Mis círculos: compact shortcuts (one row per circle), then «Conversaciones recientes» at once.
- New replies are a terracotta marker on the conversation card («1 nueva»); the separate «Respuestas nuevas» list is
  removed, so nothing is shown twice. «Tu actividad» and «Gestionar mis círculos» move to the end.

## Inside a circle

- Accent header: symbol, name, one-line, «Normas» and «Ajustes» (notification status as it exists, rules, leave).
- Compact section filters; conversations right below; one «Escribir en este círculo» (or «Escribir en «sección»»,
  or «Seguir con tu borrador») fixed above the tab bar. The pre-join «Escribir» outline button is removed.

## Posts and replies

- One card per post: avatar initial (or a neutral dashed mark for «Anónima»), name, lead sentence (title if the post
  has one, else the first sentence), body preview, optional photo (136 px, cropped, rounded), section and time,
  «Responder» with the reply count, new-reply marker.
- Conversation: author and time, lead, body, photo (up to 220 px, opens in a lightbox), then «Publicada en …» as a
  small line; replies with avatars in 16 px text; bottom safe area added.
- Reply bar: «Respondes como Sofia · Cambiar» in one line (the name chips open only on «Cambiar»); «Ocultar teclado»
  next to the field while the keyboard is up; the field stops growing sooner with the keyboard up.

## Posting

- Composer: «Se publica en» card with the circle symbol and «Cambiar» (circle sheet), section chips inline, the prompt
  «¿Qué te está pasando o qué estás intentando resolver?», no title or type, «Cómo apareces» with accurate notes.
- Optional photo: «Añadir foto (opcional)», preview, «Cambiar foto», «Quitar foto», uploading, failed, «Reintentar»;
  the post waits for the photo. Reviewer toggle «Make next photo upload fail». Simulated (BACKEND.md).
- Drafts: back keeps the draft («Guardamos tu borrador.») and opening the composer again, from any circle, restores
  it to its own circle and section with a notice; «Descartar» asks first. Failed posts keep everything.
- Kept from the branch: submit guard (one request per double tap), client key reused on an unchanged retry (now also
  requires the same photo), «Unirme y publicar» (now after the rules sheet).
- Keyboard bar: place, «como Sofia · Cambiar» (wraps instead of being cut), «Ocultar teclado», «Publicar».

## Carried-forward fixes

- Rules reachable from the circle header, the join sheet, the circle settings and the post menu; rewritten for public
  circles (no «reflexiones» or «recuentos», the per-circle notification promise removed, the anonymity limit stated).
- Anonymity wording states the real team access, without claiming a restriction that is not built: composer, reply bar, help sheet and rules (ANONYMITY.md). Owner decision: it fails the branch test `circleTopics.test.ts:35`, which was not edited.
- Block confirmation says posts and replies, both ways.
- Contrast: every text and control passes AA in the checks (darker red, darker terracotta text, `#5C534C` metadata,
  InfoNote in `#5C534C`, chip borders `#8E8174` at 3:1 or more).
- 320 px, text 1.6, keyboard: reply field, send and «Ocultar teclado» reachable; «Publicar» reachable in the composer.

## Files

- `artifact/index.html` (CSS rewritten for the phone; reviewer bar adds «Tab bar in a circle», «Make next photo upload
  fail», «Attach sample photo to composer»), `artifact/app.js` (screens rewritten), `artifact/strings.js` (v2 block
  added), `artifact/data.js` (sample photos on three sample posts), `artifact/assets/photos/*.webp` (new).
- `tools/checks.cjs` (rewritten), `tools/compare.cjs` (new).

## Unify pass with Explorar (22 Oct 2026)

Círculos and Explorar now share one frame (`../_shared/SHARED-SYSTEM.md`, `../_shared/elara-shared.css`). The snapshot before the pass is `v2-before-unify/artifact/`.

- **Band:** title 24 → 28/34. The sun-and-hills mark is removed. The pill switch is now underline sub-tabs in the band (white text with a 3 px ember underline). The band ends in Explorar's torn edge. «Ayuda» uses the shared band and light pill.
- **Page and cards:** page #F5EFE4 → #F9F5EF. Cards #FFFCF6 / #DCD1C1 / radius 14 / padding 14 → #FFFDF9 / #D6CBBC / 8 / 16. Other radii are 8, sheets 32.
- **Type:** metadata #5C534C 500 → #635A54 400. Section headings 17 → 18. Section links («Descubrir más círculos», «Editar») are underlined like «Ver todos».
- **Controls:** filter chips are the shared chip. Buttons 50 → 48. Focus ring 2 px blue → 3 px ember.
- **Tab bar:** the shared one (production metrics, 12 px labels).

Flows, copy and rules are unchanged. Checks: 390/390, 0 contrast, 0 clipping, 0 small targets, 29 designed truncations (as before). `captures/v2-*.webp` and `checks.json` were regenerated.
