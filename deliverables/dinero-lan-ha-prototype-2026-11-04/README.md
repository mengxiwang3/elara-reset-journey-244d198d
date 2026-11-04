# Dinero en Lan Hạ: the Money week prototype (warm Recuerdo)

Live: https://claude.ai/artifact/M1UYt3mx6FLzvyDqXj2wnq (private until shared from its Share menu).

This is a clickable prototype of the seven Money days (V4.1, unchanged) for María to review wording and lessons. It is also the design review of the warmer Recuerdo direction. It is a prototype, not production code.

## What is in it

- **Probar:** a working phone with the tabs Hoy · Atlas · Círculos, plus a review panel.
  - **Per-screen comments:** kept in her browser, with «Copiar todos mis comentarios» to send to the team.
  - **Decisions:** the four V4.1 decisions, each with an answer box.
  - **Highlighting:** what is new or changed since V4.
  - **Proposals:** separate wording proposals, behind a toggle.
- **Todas las pantallas:** every screen of a chosen day, shown at full length.
- **Revisión de diseño:** the representative screens the brief asked for, with:
  - how the redesign brings back warmth;
  - the wording proposals, kept separate from V4.1;
  - what still awaits María's and Alejandra's approval.

## Rules it follows

- **Opening:** each day opens the day after the previous one is finished.
- **Opening line:** «Ayer viste» shows only when the previous day really was yesterday.
- **Reminder:**
  - The home reminder shows only something she saved.
  - It says «Ayer te llevaste» only when that is accurate, and «Te llevaste el día N» otherwise.
  - When there is no reminder, the link to «Tus días» remains.
- **After saving:** once she saves today's takeaway, it leads and yesterday's preview goes away.
- **Finishing:** the day ends on the forest screen whether or not she saved.
- **Privacy:** notes stay private. The home shows only rules, unless she turns on «Mostrar mis frases en el inicio».
- **Sharing:** «Compartir en Círculos» is always a separate choice; she picks what to share and confirms.
- **Explore:** stays out. Ale's welcome (from onboarding) appears on day 1. Her voice note has a place in «Una idea que ayuda», shown only when the audio exists; it is not recorded yet.

## Source

- `src/make-data.mjs` builds `src/data.js` from `../money-sessions-v4.1-2026-11-04/src/content-es.mjs`, so the copy is never retyped.
- `src/index.html` is the page.
- `src/photos/` holds the app's own Lan Hạ day photos: `assets/days/lh/d1–d6`, plus the place photo for day 7.
- `test/e2e.cjs` walks the whole week, including a three-day gap, saving, not saving, a save error, Atlas, sharing, comments, the small phone with large text, and the three views. The latest run is 152 passed, 0 failed (`test/e2e-log.txt`).

To rebuild and test:

```
node src/make-data.mjs ../money-sessions-v4.1-2026-11-04/src/content-es.mjs src/data.js
node test/e2e.cjs src /tmp/out
```

## Look (version 2, after review)

Version 1 used beige paper, taped notes and italic quotes, and read as vintage stationery. Version 2 changes that:

- **Panels:** clean white, 90–94 % opaque, over the blurred landscape. There is no paper texture and no beige.
- **Saved items:** shown as a light card (`#F1F5F2`) with a green bookmark. There is no tape and no rotation.
- **Italics:** only on two short companion lines, «Hoy queda hecho, tal como lo dejaste.» and «Tu día N te espera…». Feedback and quotes are upright.
- **Kept from version 1:**
  - the forest-green buttons;
  - the landscape and its slow motion (ripple, mist, zoom);
  - Fraunces titles;
  - terracotta for eyebrows and for the one button on the forest completion screen.
- **Tokens from `@elara/tokens`:**
  - ink `#1A1615` and `#635A54`;
  - forest `#1F3A2E` with cream text `#F7F1E8`;
  - forest `#16382A` and `#122E23` for day complete;
  - terracotta `#C94A1C`, and `#B8441A` on forest.
- **Thread:** forest where she has walked and light grey ahead.
- **Type:** Fraunces for titles; Instrument Sans for everything else.
