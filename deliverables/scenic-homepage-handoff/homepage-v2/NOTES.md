# Homepage prototype v2

Local prototype only. Not deployed. `crossing-five/`, `crossing-prototype/`, `product-preview/` and the app prototype are unchanged.

Run: `python3 -m http.server 4192 --bind 127.0.0.1` in this folder, then open http://localhost:4192/

Files: `index.html`, `page.css` (whole page), `crossing.js` (traveler animation), `story.js` (guided practice, six-area chooser). Plain scripts, no modules, so `index.html` also runs opened straight from the folder.

## What moves and what is static
- The traveler is a 2D sprite animation: 3 side-walk poses + 1 standing pose. Not video, not a rigged character.
- Everything drawn is a function of one timeline. Phones are windows onto one world; she walks one straight ground line.
- App screens in the lower sections are static captures from `product-preview/assets/`.

## Revision 2 (brief of 10 Nov)
- Hero: new headline and supporting copy; "Unirme a la lista de espera" primary, "Prueba una pregunta" secondary, which jumps to the practice.
- First frame shows destination, question and souvenir. The tool line slides in after 1.5 s.
- Controls are labelled: Pausar / Anterior / Siguiente, plus the scrubber. At the end Pausar becomes Repetir.
- Order: hero, guided practice, what you keep (Mi colección, Mi kit personal, Atlas), six areas, compact Explorar and Círculos previews, waitlist close.
- Practice: each response shows what it gives and a phrase to use. No scoring; both can be tried.
- Style follows the live site tokens: cream paper, forest, navy, terracotta orange, Fraunces + Instrument Sans (Google Fonts). This replaces the white/blue/purple palette of revision 1.
- Draft copy to approve: everything in the practice feedback, the "Lo que te llevas" lines, section headings, the Venice question and lesson.

## Hero background review (A/B)
- A is the default: white hero. B adds only `.hero{background:#faf8f4}`; open with `?hero=warm` (or `#hero-warm` on the hosted copy). Nothing else differs.
- Comparison sheets: screens/hero-ab-desktop.jpg and screens/hero-ab-mobile.jpg, same paused Kyoto frame (t=0), with the app "Hoy" capture from product-preview beside each.
- Undecided. Remove the switch once one is chosen.

## Revision 5 (layout and launch cleanup)
- Wide desktop: the animation block (phones, controls, scrubber, caption) sits 24 px closer to the headline; the shift tapers to 0 by 1000 px. The copy column has a fixed width from 1100 px up, so the gap is the same at 1280, 1440 and 1920: 35 px from the text to the animation area, and the leftmost phone's shadow clears the text at every point of the timeline.
- Tablet and phone: the traveler is centred, with the headline and both buttons above.
- Added a Repetir button. Controls: Pausar, Repetir, Anterior, Siguiente, scrubber (arrow keys, Home, End).
- Launch cleanup: removed the "Prototipo" hero label, the "Prototipo local" footer note, the six-area link to the ChatGPT-hosted demo, and the noindex tag. Footer links to the live Términos and Soporte pages. Page title and description are real.
- Not deployed. The folder is self-contained apart from Google Fonts.

## Revision 4 (no beige)
- Cream, grain, Fraunces, orange tabs, rounded shadowed cards and the dark green close are gone.
- White page, hard edges, large tight Instrument Sans headings with one Instrument Serif italic phrase each. Cobalt blue (from the Mexico City wall) for actions, purple for selection and labels.
- "Lo que te llevas" is three flat blocks; the six areas are a large type list; the close sits on the Red Sea photo, the next destination.
- This supersedes the palette and type lines in Revision 2.

## Revision 3 (handoff timing and scrubber)
- Each stop runs in a fixed order after she arrives: settle 0.45 s, question, tool, souvenir, 2.3 s hold on the finished card, card fades out, then she leaves. A card is never visible while its phone is shrinking or the next one is growing.
- The sequence opens on Kyoto with its card already complete, so the first frame still shows destination, question and souvenir.
- Card and teaser state are computed from the timeline (CSS variables, no transitions). The same scrubber position always gives the same pose, phones, cards and caption; checked by jumping back from the Red Sea teaser to Venice and comparing against a forward scrub.
- Full sequence is now about 31 s.
- Sequence sheets: screens/venice-to-machu-picchu.jpg and screens/machu-picchu-to-mexico-city.jpg.

## Changes from crossing-five
- One outfit for the whole walk. No cut-out in any plate sits at her ground line: the Kyoto fence post and Venice mooring poles are about a third of her height, and the Kyoto tree, Venice wall, Andes rock and Mexico tree all meet the ground behind her path, so her feet would show below them. `?outfit=change` restores the old per-phone outfits (with the visible cut).
- Hand-over between phones is a short dissolve of the overlap strip instead of a z-order swap. No pop.
- Resting phones fade back; she does not, so she is never tinted differently on two sides of a phone edge.
- Animation stops drawing while scrolled out of view.
- Works without JavaScript: poster, both example tools and all six areas are readable.

## Switches
`?t=<sec>`, `?motion=0`, `?outfit=change`, `?shot=1`

## Known limits
- Red Sea only peeks in as "Próximo destino". Missing: swim cycle and a shore plate.
- Stand to walk is a short crossfade. Missing: turn frames and an 8-frame walk cycle.
- App captures are 303 px wide, so they are soft on high-density screens. Sharper captures needed.
- Drafts, not approved copy: Venice question and lesson, "Pruébalo aquí con un ejemplo", "Un recuerdo pequeño por cada parada", the shortened Explore paragraph, footer line.
- Waitlist buttons point at the holaelara.com homepage, not a confirmed signup anchor.
- Tested in headless Chromium at 320, 390, 768 and 1280. Not tested on a real iPhone or in Safari.
