# Homepage v4: one connected practice

Local preview only. Not deployed. `homepage-v2/` and `homepage-v3/` are the preserved earlier versions.

Run: open `index.html`, or `python3 -m http.server 4194 --bind 127.0.0.1` in this folder.
Files: `index.html`, `nosotras.html`, `page.css`, `stage.js` (traveler and phones), `globe.js` (Atlas globe), `app.js` (state, copy in es/en, every other interaction), `assets/`.

## Palette (corrected)
Reference: the app's Explore header and tab bar, `#263E56`.

| Token | Value | Use |
|---|---|---|
| `--blue` | `#263E56` | primary buttons, selected states, links, focus ring |
| `--blue-deep` | `#1C3045` | hover and pressed |
| `--head` | `#1B2B3C` | headings |
| `--ink` | `#1F2B38` | body text |
| `--muted` | `#56626F` | secondary text, small labels |
| `--line` / `--edge` | `#DCE3EC` / `#AAB7C6` | dividers / control borders |
| `--sky` | `#EDF3FA` | pale blue surfaces |
| `--purple` / `--lilac` | `#6A5F92` / `#F1EFF7` | quiet accent: stamp, kept souvenirs, sample avatars, paper notes |
| `--frame` | `#172433` | drawn phone frames |

Selected states also carry a tick, a weight change or a bar, not colour alone. One focus ring: 3 px `--blue` with a 3 px gap. The orb, photographs, souvenirs and app captures are not recoloured; the Explore capture keeps its own darker navy header and teal accents because those are in the screenshot.

## The loop
Choose a destination (buttons, tap a phone, swipe, or the globe) -> she walks there -> the practice appears inside the active phone -> pick one of two answers -> feedback, a phrase, and a souvenir to keep -> the collection strip, postcard, weekly example and signup recap all read from the same state.

One state object in `app.js` (`state.dest`, `state.answers`, `state.collected`). Nothing is stored or sent; it resets on reload. Language choice is the only thing kept, per tab.

## Traveler: what is real and what is not
- 2D sprite: 3 side-walk poses and 1 standing pose per outfit; mirrored when she walks back. Not video, not a rig. It reads as stepping, not a fluid walk; that needs an 8-frame cycle per outfit.
- Planted foot stays on its spot; one ground line; constant size; position is continuous in both directions and across several phones.
- Each phone sits in front of the previous one; she passes behind the next phone's 7 px frame and her outfit changes there. The frame hides the cut line, not her whole body.
- Red Sea: she is the diver (existing art), hovering with a gentle bob. There is no kick cycle, so the swim is a held pose.
- She walks on by herself (9 s per stop, one pass) until the visitor's first tap or key press, which ends the tour for good; the button can restart it. No scrubber or player controls.
- Walking eases in and out; the shadow widens at foot contact. The camel rider (Giza) and the boat (Great Barrier Reef) are the app's own art; the camel uses a 3-pose cycle without planted feet, so it can slide slightly.
- The Atlas globe needs WebGL and a web address. Opened straight from a folder, browsers refuse the texture, so the still artwork stays with markers placed for that view.

## Destinations and areas
Kioto = Claridad financiera, Venecia = Ritmo diario, Machu Picchu = Encontrar tu propósito, Ciudad de México = Amor y límites, Mar Rojo = Confianza en ti. These come from the earlier prototype screens.
Recuperar tu energía has no destination, plate or souvenir: shown as "Destino en preparación", not mapped to another place.

## Alejandra's video
The public "video próximamente" block is removed. Proposed placement when the recording exists: in the `#para-ti` section, directly above the founders line (`.usline`), as a `<figure>` with a real `<video controls poster>`; the founders page is the second candidate.

## Needs approval or is unverified
- Practice copy: only the Kioto family-money example follows the supplied wording. The Venecia, Machu Picchu, Ciudad de México and Mar Rojo situations, answers, feedback and phrases are drafts written here from each area's one-line description.
- Souvenirs: cup and boat as before; flask, bracelet and the silver camel (Mar Rojo) were picked here from the souvenir sheet.
- English: every English line outside the lines taken from the live site's English copy is a draft translation.
- "Cómo se conecta una semana" is labelled illustrative. The curriculum is not in this repository, so the five steps and the Money Clarity outcome were not checked against it.
- Survey line (4600+, almost 1 in 3 chose money) is copied from the live site source and attributed to the survey; the underlying data was not checked here.
- FAQ answers marked "Por confirmar": browser access, what the beta includes, pricing. The marker is for review and must go before launch.
- Signup: buttons open `holaelara.com/#lista` (`/en#waitlist` in English), the form anchor in the site source. The live site was not reachable from this environment. No inline form: the live form posts to `/api/subscribe` on its own origin, which this standalone preview cannot use or test. An inline form belongs in the site codebase.
- Founders page: uses only the published note, names, roles and the two photos already on the site. Missing: personal stories, approved portraits, any recording.
- Circles uses the topics-and-conversations design; the live site still describes small private circles. No privacy or size claim is made.
- Left out: path length (7 days vs 21 vs five weeks), AI claims, the 80 000+ and 1,8 M+ figures, "las primeras de la lista".

## Other limits
- Explore capture is 303 px wide and soft; its thumbnails are crops of it.
- Atlas globe: ported from the app prototype (its WebGL shader, `paper-earth.jpg` texture, marker markup and CSS, rotation speed 0.055 rad/s, drag factors, keyboard keys). Marker photos are the app's scene images. Its marker colours (green selected ring and visited badge) are the app's and are deliberately not recoloured to the homepage palette. The homepage shows its five destinations plus the app's six locked "Por descubrir" markers; it adds a pause while off-screen. Touching the globe does not scroll the page, as in the app.
- The app prototype (reachable at its chatgpt.site URL) shows three destinations per area, including energy (Arrecife, Puerto de Sídney, Milford Sound) and rhythm starting in Lisboa. The homepage mapping and practice copy were not re-aligned to it in this pass.
- Tested in headless Chromium at 390, 768 and 1280. Not tested on a real iPhone or Safari.
