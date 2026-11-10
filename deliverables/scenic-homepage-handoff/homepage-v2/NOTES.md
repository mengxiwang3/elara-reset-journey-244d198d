# Homepage prototype v2

Local prototype only. Not deployed. `crossing-five/`, `crossing-prototype/`, `product-preview/` and the app prototype are unchanged.

Run: `python3 -m http.server 4192 --bind 127.0.0.1` in this folder, then open http://localhost:4192/

Files: `index.html`, `page.css` (whole page), `crossing.mjs` (traveler animation), `story.mjs` (example practice, six-area chooser).

## What moves and what is static
- The traveler is a 2D sprite animation: 3 side-walk poses + 1 standing pose. Not video, not a rigged character.
- Everything drawn is a function of one timeline. Phones are windows onto one world; she walks one straight ground line.
- App screens in the lower sections are static captures from `product-preview/assets/`.

## Changes from crossing-five
- One outfit for the whole walk. No cut-out in any plate sits at her ground line: the Kyoto fence post and Venice mooring poles are about a third of her height, and the Kyoto tree, Venice wall, Andes rock and Mexico tree all meet the ground behind her path, so her feet would show below them. `?outfit=change` restores the old per-phone outfits (with the visible cut).
- Hand-over between phones is a short dissolve of the overlap strip instead of a z-order swap. No pop.
- Resting phones fade back; she does not, so she is never tinted differently on two sides of a phone edge.
- Animation stops drawing while scrolled out of view.
- Palette: white, blue, restrained purple (kickers, selected states, focus ring, scrubber). Amber and beige removed.
- Lower sections rebuilt on one pattern: practice example, six areas, Atlas/collection/kit, Explore, Circles, close.
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
