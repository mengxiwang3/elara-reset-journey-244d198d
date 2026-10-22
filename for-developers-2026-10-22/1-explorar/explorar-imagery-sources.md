# Imagery (v2)

No image was downloaded or generated, and none is stock. No person was drawn or photographed for this pass. Each image below carries one of three labels:

- **Finished:** a real, existing asset, used as is or cropped.
- **Composed:** built here from existing assets; the sources are listed.
- **Placeholder:** the real asset does not exist.

| Slot | Asset in `artifact/assets/` | Label | Source and notes |
|---|---|---|---|
| Featured workshop photo | `ale-feature.webp` (1.9:1) | Finished | Recropped from the 1080 px original, `src/assets/founder-alejandra.jpg` (landing page). The hat is fully in frame with room above it, the eye line is near the upper third, and the crop runs to her shoulder. **Her approval for in-app use is still pending.** |
| Workshop detail, Alejandra's sessions | `ale-detail.webp` (16:10) | Finished | Same photo, same framing rules. |
| Host avatar | `ale-face.webp` | Finished | Same photo (carried from v1). |
| Workshop detail, Valeria and Daniela's sessions | `plate-*.webp` (7) | Finished (existing app art) | The cover each workshop already has in production: the `cover` field in `apps/api/scripts/gen-explore-seed.mjs`, mapped in `explore-placeholders.mjs` to `apps/mobile/assets/images/path-area-*-v1/v2.png` and `money-day7-rule-wide-v2.png`. Production labels these DEMO plates too. |
| Video thumbnails (4 short videos) | `film-arch`, `film-need`, `film-path`, `film-boundary` | Finished (the films' real picture) | Production's demo films are a slow pan over one app picture (`gen-explore-media.mjs` `film()`, covers in `explore-films.mjs`): `money-day3-pause-wide-v2.png`, `money-day5-need-wide-v2.png`, `path-journey-v1.png` and `money-day4-boundary-wide-v2.png`. The thumbnail is a 16:9 centre crop of that picture. |
| Video player preview | `frame0-*.webp` | Composed (reconstructed real frame) | The film's first frame, rebuilt with production's own ffmpeg filter at t = 0: `scale=-2:1568, crop=1440:1568:x=(iw-ow)/2, scale 360×392`. I did not extract it from the .mp4, because the files are in R2 and not in the repo. |
| «Dinero sin espiral» recording | none (CSS card) | **Placeholder** | It reads «Grabación de muestra · Sin video todavía». No recording exists. |
| Audio covers (12) | inline SVG plus `paper-*.webp` | Composed | The paper textures are cut from `apps/mobile/assets/images/daily-path-paper-{cream→reflection-sheet, stone, sage, peach, blue, mist}`. The subject, title and length are drawn in code from each piece's cues (table below). The title and the length are live text. |
| Monograms VC, DR | CSS | Placeholder | No photo exists. The profiles are seed «DEMO ONLY». |

## No real footage of anyone exists

I searched `/home/user/elara`, `src/`, `deliverables/` and `explorations/` for .mp4, .mov, .webm, .m4v, poster and still files. The only video files are prototype screen recordings in `explorations/*/evidence` and `spatial-canyon/out`. Production's films are synthetic-voice pans over paper art, and none of them shows Alejandra or any other person. So no human frame was used. «Tu próximo paso es más pequeño de lo que crees» is credited to Alejandra but shows only `path-journey-v1.png`, as the real film does.

## Cover family

**Shared rules for every cover:**
- A paper ground: one brand colour multiplied with the app's own paper texture.
- The title, in Fraunces at the top left.
- The length as a clock, at the bottom left.
- One subject cut from paper, taken from what the audio actually asks you to do.

No moon or star appears on any cover. v1 used the celestial card and the paper moon on three.

| Audio | Subject (from the cues) | Ground |
|---|---|---|
| Páginas de la noche | The back of an envelope, three names, one crossed out, a pen | Ink blue |
| Luces bajas, hombros abajo | A low lamp, a pool of light, shoulders that drop | Forest |
| Una pausa de dos minutos con el dinero | The bank phone covered by a slip: «primero, una pausa» | Peach |
| Voz firme, manos quietas | Two open hands | Rust |
| Tres respiraciones antes de responder | A reply bubble with three breaths; the third still waiting | Forest |
| Antes del número | Two feet on the floor; the number written on a slip | Cream |
| Reinicio tras una decisión difícil | The path taken, and the other one fading out | Amber |
| Vacía las pestañas | Open tabs, sorted into «hoy», «esta semana», «algún día» | Light peach |
| Si nadie estuviera mirando | Rows of empty seats, one small step | Blue paper |
| El sí en voz baja | Argument scribbles, with a small «sí» underneath | Pale amber |
| Suelta | A knot that loosens into a soft line | Ember |
| El dinero, dicho en voz alta | The number on paper, and its sound | Stone |

## Removed from v1

These were removed: the celestial night card, the paper moon and stars, the sun, the house, the generic topic objects (`cut-*`), and the faceless community photo crops (already dropped in v1). The full v1 set is preserved in `v1/artifact/assets/`.
