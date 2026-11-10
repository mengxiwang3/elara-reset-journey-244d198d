# Homepage v4: one connected practice

Local preview only. Not deployed. `homepage-v2/` and `homepage-v3/` are the preserved earlier versions.

Run: open `index.html`, or `python3 -m http.server 4194 --bind 127.0.0.1` in this folder.
Files: `index.html`, `nosotras.html`, `page.css`, `stage.js` (traveler and phones), `globe.js` + `land.js` (Atlas globe), `app.js` (state, copy in es/en, every other interaction), `assets/`.

## The loop
Choose a destination (buttons, tap a phone, swipe, or the globe) -> she walks there -> the practice appears inside the active phone -> pick one of two answers -> feedback, a phrase, and a souvenir to keep -> the collection strip, postcard, weekly example and signup recap all read from the same state.

One state object in `app.js` (`state.dest`, `state.answers`, `state.collected`). Nothing is stored or sent; it resets on reload. Language choice is the only thing kept, per tab.

## Traveler: what is real and what is not
- 2D sprite: 3 side-walk poses and 1 standing pose per outfit; mirrored when she walks back. Not video, not a rig. It reads as stepping, not a fluid walk; that needs an 8-frame cycle per outfit.
- Planted foot stays on its spot; one ground line; constant size; position is continuous in both directions and across several phones.
- Each phone sits in front of the previous one; she passes behind the next phone's 7 px frame and her outfit changes there. The frame hides the cut line, not her whole body.
- Red Sea: she is the diver (existing art), hovering with a gentle bob. There is no kick cycle, so the swim is a held pose.
- A short automatic tour (6 s per stop, one pass) runs until the visitor does anything; one Pause control. No scrubber or player controls.

## Destinations and areas
Kioto = Claridad financiera, Venecia = Ritmo diario, Machu Picchu = Encontrar tu propósito, Ciudad de México = Amor y límites, Mar Rojo = Confianza en ti. These come from the earlier prototype screens.
Recuperar tu energía has no destination, plate or souvenir: shown as "Destino en preparación", not mapped to another place.

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
- Coastlines on the globe are Natural Earth 1:110m (public domain), simplified.
- Tested in headless Chromium at 390, 768 and 1280. Not tested on a real iPhone or Safari.
