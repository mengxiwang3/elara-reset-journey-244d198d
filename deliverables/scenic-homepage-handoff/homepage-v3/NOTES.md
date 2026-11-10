# Homepage v3: interactive introduction

Local preview only. Not deployed. `homepage-v2/` is the preserved previous version and is unchanged.

Run: `python3 -m http.server 4193 --bind 127.0.0.1` in this folder, or open `index.html` directly.
Files: `index.html`, `page.css`, `crossing.js` (travel animation), `story.js` (all other interactions), `assets/`.

## Interaction story
1. Travel: one traveler walks through four overlapping phones; each stop shows question, tool, souvenir.
2. Who it is for: three situations, quiet text.
3. Practice: choose a response, get a specific lesson; the second response offers an editable alternative.
4. Collection: tap a souvenir to read its phrase, move it into a demo kit; Atlas and the weekly postcard beside it.
5. Six areas: pick one, see what the first week works on.
6. Circles: topics appear, one is selected, a question becomes a post, a reply arrives, the thread opens. Plays once in view; other topics selectable.
7. Explore: three sample resources with what each helps with.
8. Spanish first, founders' note, practical facts, one action.

## Travel animation: what is real and what is not
- 2D sprite animation: 3 side-walk poses and 1 standing pose per outfit. Not video, not a rig.
- Feet: the planted foot stays on its ground spot while the hips travel; pose changes are hard cuts (two poses per step). It reads as stepping, not as a fluid walk. A fluid walk needs an 8-frame cycle per outfit.
- One ground line, constant size, continuous position (no teleport). She never walks on water; the Red Sea only peeks in.
- Phones have a fixed depth order (each sits in front of the previous one) and a 7 px frame. She walks behind the next phone's frame and her outfit changes there. The frame hides the cut line, not her whole body, so for about half a second one side of the frame shows the old outfit and the other the new one.
- Walk is about 40% faster than v2; stops are shorter. Full sequence about 24 s.
- Everything is a function of one timeline, so scrubbing is exact in both directions.

## Content sources
- From the live site source (`src/components/landing/`, main branch): the "Para la mujer que sostiene todo" line, the three situations, "No es inglés, traducido. Es español, entendido.", the founders' note, names and roles, founder photos, "Unos minutos al día…", "Sin spam…", "Elara no es terapia ni un servicio médico.", `/privacidad`, and the `#lista` signup anchor. holaelara.com itself was not reachable from this environment, so this was not compared against the deployed page.
- Drafts written here, to approve: the short mobile lead, practice hint lines, three of the four souvenir phrases, the three extra Circles examples, the three "Te sirve para" lines, "Elara parte de ahí", the facts headings.

## Left out on purpose (unresolved)
- Path length: live site says 7-day path; the app capture shows 1/21 and "3 semanas"; five-week paths were also mentioned. No number is used.
- Circles: live site describes a small private circle with one daily question; this page shows the newer topics-and-conversations design. No privacy or size claim is made.
- AI: "conversación con Elara", "Elara lee el tono" and the write-to-Elara demo are not carried over.
- Statistics (4600+, 80 000+, 1,8 M+, "1 de cada 3") and "las primeras de la lista entran al primer grupo": not verifiable here.
- Explore items "opening in beta": only shown as sample resources.
- Alejandra's introduction: a marked "próximamente" slot, no player.

## Known limits
- App captures are 303 px wide and soft. Explore thumbnails are crops of that capture.
- Tested in headless Chromium at 390, 768 and 1280. Not tested on a real iPhone or Safari.
