# Crossing prototype: Kyoto → Venice

Local only. Not deployed, and nothing in `product-preview/` or the public app prototype was changed.

Run: `python3 -m http.server 4190 --bind 127.0.0.1` in this folder, then open http://localhost:4190/

## How it works

- One timeline `T` (seconds). Everything drawn is a pure function of `T`, so pause, scrub and jump cannot duplicate or teleport the traveler.
- One traveler (step count → ground position). Each screen is a clipped window onto her. The two phones share one frame, which is drawn above her: she passes behind it like a door post and is wider than it, so part of her is always visible.
- Kyoto's stone path and Venice's pavement share one foot line, horizon and body height, so the ground continues behind the frame.
- Feet: the planted foot stays at its ground spot while the hips travel; the legs are sheared between the three walk poses. Step length is measured from the sprite (0.218 × body height), cadence is constant at 1.9 steps/s.
- Outfit: the Kyoto screen draws her Kyoto sprite, the Venice screen her Venice sprite, so the change happens at the frame. `?outfit=same` (or the checkbox) keeps one outfit for comparison.

## URL switches

| Query | Effect |
|---|---|
| `?t=10.1` | Set the timeline to that second and pause |
| `?motion=0` | Reduced-motion version (also follows the OS setting) |
| `?outfit=same` | Keep the Kyoto outfit in both screens |
| `?shot=1` | Stage only, used for the poster and recording frames |

## Known limits

- She is a 2D sprite, not a 3D character. There are 3 side-walk poses and 3 walking-away poses per outfit.
- The turn from side view to walking away (step 8) and stand ↔ walk are short crossfades. Missing asset: 2 to 3 turn frames per outfit.
- A smoother gait needs an 8-frame walk cycle per outfit, same framing as the current sheets.
- Red Sea is not built. It needs a railing mask for the Venice bridge and a real diver kick cycle (the diver sheet holds view angles only).
- Venice card copy is a draft adapted from the Red Sea lesson. Needs Spanish approval.
- The waitlist button points at the holaelara.com homepage, not a confirmed signup anchor.
