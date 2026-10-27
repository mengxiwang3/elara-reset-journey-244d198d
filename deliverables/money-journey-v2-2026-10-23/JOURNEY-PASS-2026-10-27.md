# Photo journeys: flow and interest pass (27 Oct 2026)

This pass covers the five curriculum journeys: North America, Europe, South America, Africa and Oceania (weeks 6–10). Asia (Money, weeks 1–5) is unchanged.

All new copy below is prototype copy (borrador). It has not been reviewed by María and Alejandra. The curriculum questions themselves did not change.

## What the walk found

1. **The arrival screen ignored the place.** It showed the same week title on all seven days, with no line about where she is. The photo did all the work.
2. **Elara was silent after most answers.** Only multiple-choice days with written replies answered, so most days felt like a form.
3. **Days did not connect.** Nothing carried yesterday's answer into today.
4. **Day 7 had no week close.** «Semana completa» was the whole ending. She never saw her week together.
5. **Love days' safety line was buried.** It sat inside the bold step title, so it read as a wall of text.
6. **The location line was noise.** For example: «SEMANA 1 · DÍA 1 DE 7 · ULURU-KATA TJUTA, TERRITORIO DEL NORTE, AUSTRALIA».

## What changed (`app.js`, `places.js`, journey CSS)

**Arrival screen:**
- Region, week and day (for example «Oceanía · Semana 1 · Día 1 de 7»).
- The place name as the title.
- One concrete line about the place (`places.js`, 31 lines). Oceania's lines also name the time of day, dawn to night.
- «Esta semana: …» with the week's theme.

**Elara remembers:**
- Day 1 greets her and says what she takes away from the week.
- Days 2–7 open with «Ayer dijiste: «…». Hoy seguimos desde ahí.»
- When she skipped the day before, the arrival shows only the day's own hint, with no reminder.

**Elara always answers:**
- When a main question has no written reply, Elara names what was kept and never judges it. For example: «Anotado: «al salir». Mañana lo retomamos.» or «Lo guardé con tus palabras.»
- Written replies always win.

**Safety line:** shown as its own calm note under the step, next to «Buscar ayuda ahora». It's dropped from the day summary.

**Shorter location line:** «Día 1 de 7 · Uluru».

**Tomorrow teaser:** the day summary ends with «Mañana te espera Bahía de Sídney.» and a thumbnail of that photo.

**Day 7 week card:** «Tu semana en Oceanía» shows:
- «Te llevas: …» with the week's takeaway.
- Seven rows, each with the day's photo, the place and her answer.
- A skipped day reads «Lo pasaste. Está bien.»

## Checks (`tools/`)

- `jweek.cjs <journey> <week>`: answers days 1–6 on one page, with day 4 skipped. It checks:
  - the arrival recall
  - that Elara answers every main question
  - the tomorrow teaser
  - the seven-row week card
  All five journeys pass.
- `blank.cjs`, `rhythm3.cjs`, `recall.cjs`, `mv4.cjs` and `walk.cjs`: rerun after the change.

## Still open

- Europe and South America days 6–7 reuse day 5's photo until the four missing photos arrive. Their week card shows that place twice.
- Some week titles read clinical as arrival themes (for example «Notar sin diagnosticar»). They come from the curriculum, so they are for the Spanish review.
- Each area reuses its seven photos for all five weeks (accepted for the beta).
