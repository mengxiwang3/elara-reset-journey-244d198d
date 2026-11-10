# Crossing prototype, five phones

Local only. Not deployed. Nothing in `product-preview/`, `crossing-prototype/` or the public app prototype was changed.

Run: `python3 -m http.server 4191 --bind 127.0.0.1` in this folder, then open http://localhost:4191/ (launch config `crossing-five` in the Elara repo).

## How it works
- The traveler is a 2D sprite (3 side-walk poses + 1 standing pose per outfit). Not video, not a rigged character.
- One timeline `T`; everything drawn is a pure function of `T`. One traveler, one straight ground line (`Y0`).
- Five phones are windows of different sizes onto that one world. The phone she is in grows, the one she left shrinks; scenery is fixed in the world, so a smaller phone just shows less of it. Bottom edges are staggered.
- Phone centres are exactly 5 steps apart, so the planted foot never slides.
- She walks Kyoto → Venice → Machu Picchu → Mexico City. Outfit changes at each phone edge (`?outfit=same` or the checkbox keeps one outfit).
- Switches: `?t=<sec>`, `?motion=0`, `?outfit=same`, `?shot=1`.

## Known limits
- Red Sea only peeks in as "Próximo destino". She cannot walk into water. Missing assets: a diver swim (kick) cycle and a shore or entry plate.
- Bezels are 2.5px, so the outfit change at a phone edge is no longer hidden by a frame. Missing asset for a hidden change: a foreground obstruction per crossing (pillar, tree, doorway mask).
- Stand ↔ walk is a short crossfade. Missing: turn frames and an 8-frame walk cycle per outfit.
- Venice question and lesson are drafts. Flask and bracelet souvenirs were picked by me from `souvenirs.png`.
- The waitlist button points at the holaelara.com homepage, not a confirmed signup anchor.
