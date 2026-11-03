# C3: the app's Hoy, C v2's short session, a postcard only at the end (3 Nov 2026)

`c3.html` is one revised, clickable version. It is a **prototype and a hypothesis for user testing**, not validated design. Every Elara reply is pre-written, labelled «Respuesta simulada», and does **not** validate the quality of production AI. All new Spanish below is **propuesta, pendiente de María y Alejandra**. `a`, `b`, `c`, `c2`, `d1`, `d2` and `d3` are byte-identical (md5 checked); `/home/user/elara*` was not touched.

**Sources for Hoy:** two captures of the app's Hoy (top, and scrolled), both for another day and destination (Arashiyama, day 4). I rebuilt what they show with Wuzhen content, and did not infer anything about the session behind them. The only borrowed content is the question «¿Qué describe mejor cómo va tu tarea?», used in the follow-up illustration.

Files: `c3.html`, `src/c3.js`, `src/c3.css`, `src/c3.content.js` (build via `node src/build.mjs c3`; reuses `shared.js` and `c2.js` through the variant hook), `src/e2e-c3.mjs`, `shots/c3-*`, a C3 row in `compare-directions.html`, a card in `pub/hub.html`, and the corrected claims in `index.html`.

## What changed, per item

1. **Hoy matches the app.**
   - **Layout:** sky gradient and date; a long greeting that wraps beside an initials avatar; a torn-paper hero with the destination photo, a perforated stamp at the lower right, the place and day line, the day's title as a big serif question and «Unos 3 minutos.»; a persistent dark-green start button above the five-tab bar.
   - **Removed:** C v2's and D1's «Tu tarjeta» and album blocks. There is no canal and no second progress system.
   - **«Tu camino por Asia»:** an existing component, with illustrative values tagged «Valores ilustrativos».
2. **Purpose.** The opening has the compact line «Wuzhen · Semana 2 · Día 1 · unos 3 min», the title, the exact purpose sentence, «Puedes saltar cualquier pregunta.» as real text, and a small hint with a mini stamp. The week-payoff paragraph is gone. The start button is visible without scrolling at 393×852 and 360×780 at 100% text (it sits in a fixed foot, so it also stays reachable at 160%).
   - **Follow-up illustration:** two reviewer states, «Seguimiento con tarea (ilustrativo)» and «Seguimiento sin tarea (ilustrativo)». The first shows «Tu tarea: …» (synthetic example, labelled) above the question. The second shows an honest fallback line (tagged as proposed). The answer options are a neutral placeholder block, not invented.
3. **Weekly tracker.** Seven days. Completed days have the destination thumbnail and a small check badge. «Hoy» has a stronger ember ring. Upcoming days are quiet dashed outlines. Labels: «Día 1, hecho», «Hoy, día 1», «Día 2, pendiente». The count line stays («0 de 7» / «1 de 7»). There are no per-day keepsakes.
4. **«Para retomar».** The one existing card holds the saved answer; there is no second card.
   - Context line above her words, her exact words clamped to two lines, and the links «Volver a esta reflexión ›» and «Editar».
   - Title «Tu reflexión · Día 1» for a real answer. Neutral «Tu respuesta · Día 1», with no reframing, for «Hi» (or fewer than three words, or a greeting) and when only an option was chosen.
   - If both questions were skipped, the card is not rendered at all.
5. **Session (C v2 structure).**
   - Writing screen: a small row with the option and «Cambiar», then the question and the field straight below; no card and nothing decorative.
   - The draft survives a change of choice, with a non-destructive note.
   - Q2 is adapted to the option, with one muted example each (list below).
   - Elara's notes are under 220 characters, grounded in her words, with one link to the day's purpose; they never mention a next step, praise, press or ask.
   - «Ninguna por ahora» has its own prompt and «Terminar sin escribir». «Prefiero pasar» on Q1 leads to the option-free Q2.
6. **Completion.** The title is the app's «Listo por hoy». Her exact words, large in Fraunces with hanging quote marks, sit on a torn-paper postcard (the same language as Hoy) with a «Wuzhen» stamp, a faint decorative postmark (aria-hidden) and the lantern; Elara's note is small below her words.
   - Nothing written: no card. «Ninguna» without a note shows her choice and the keepsake. Both skipped shows «Listo por hoy», a calm line and the keepsake. «Pasaste esta pregunta» is never shown.
7. **Hoy hierarchy.**
   - Today's session is primary.
   - Greeting rule: preferred name, else the first word of the full name; long names wrap and never meet the avatar. A reviewer toggle covers short / none / long.
   - «Para hoy» is quieter, with a visible «Opcional» label. I kept the existing header, so no header change is proposed.
   - **Reachability fix:** the scroll area ends above the start button and the tab bar (they are not overlaid), so the last row and «Pedir ayuda ahora» scroll fully clear.
   - The five-tab bar is unchanged and tagged «Navegación existente (provisional)».
8. **Accurate claims.** Nothing says later days build on her choice or are personalised. Saving, offline and sync are tagged as simulated. The keyboard is a drawn preview labelled «Teclado simulado». Overview text now states the real scope of the accessibility checks (see Checks).

## Proposed Spanish (propuesta, pendiente de María y Alejandra)

- **Opening:** «Hoy elegirás qué aspecto de tus ingresos explorar y una pregunta para empezar.» (given by the user) · «Puedes saltar cualquier pregunta.» · «Al final te llevas una tarjeta con tu pregunta, si la escribes.» · «Wuzhen · Semana 2 · Día 1 · unos 3 min» · button «Empezar» · progress labels «Hoy», «Pregunta 1 de 2», «Pregunta 2 de 2», «Listo».
- **Q2 per option** (question; example after «Ejemplo:»):
  - Mejorar mi trabajo actual: «¿Qué te gustaría averiguar para mejorar tus ingresos en tu trabajo actual?»; «si hay formación gratuita para subir de puesto».
  - Encontrar trabajo: «¿Qué te gustaría averiguar sobre el tipo de trabajo que buscas?»; «qué horarios suelen tener los trabajos que me interesan».
  - Cobrar un pago pendiente: «¿Qué te falta saber sobre ese pago pendiente?»; «qué fecha se acordó y si consta por escrito».
  - Explorar un servicio o venta: «¿Qué te gustaría averiguar sobre lo que podrías ofrecer o vender?»; «cuánto se suele cobrar por algo parecido».
  - Conocer apoyos disponibles: «¿Qué te gustaría averiguar sobre los apoyos que podrían corresponderte?»; «qué ayudas existen en mi municipio y quién puede pedirlas».
  - Ninguna por ahora: «Si quieres, anota qué tendría que cambiar para que alguna de estas opciones te importara. También puedes terminar sin escribir.»; «si tuviera más tiempo libre por las tardes».
  - Prefiero pasar en Q1: «¿Hay algo sobre tus ingresos que te gustaría averiguar?»; «qué gastos fijos tengo cada mes».
- **Elara after Q1** (simulated; under 220 characters):
  - «Elegiste encontrar trabajo. Es un tema amplio; una sola pregunta concreta puede bastar para ver por dónde mirar primero.»
  - «Elegiste mejorar tu trabajo actual. Partir de lo que ya conoces puede mostrar qué parte de tus ingresos se puede aclarar con una pregunta.»
  - «Elegiste cobrar un pago pendiente. Quizá lo que más aclare sea un dato concreto, como qué se acordó y cuándo, antes de decidir nada.»
  - «Elegiste explorar un servicio o venta. Por ahora se trata de mirar, no de decidir; una pregunta puede mostrar si esta vía merece más atención.»
  - «Elegiste conocer apoyos disponibles. Saber qué existe y quién puede pedirlo puede ampliar las opciones de ingresos que tienes a la vista.»
  - «Elegiste «Ninguna por ahora». Puede que ahora no quieras mirar ninguno de estos aspectos de tus ingresos, y puedes dejarlo así.»
- **Elara after Q2** (simulated): sample answer: «Anotaste preguntar a tu encargada si hay formación gratuita para subir de puesto. La respuesta podría ayudarte a ver si mejorar tu trabajo actual es el aspecto que quieres explorar.» Any other text: «Escribiste: «{sus palabras, hasta 80 caracteres}». Tenerlo por escrito puede ayudarte a decidir qué aspecto de tus ingresos mirar primero.»
- **Changed selection:** «Cambiaste tu elección. Tu texto sigue aquí; revisa si aún encaja.»
- **Completion:** «Listo por hoy» (the app's string) · «Puedes volver a estas preguntas cuando quieras.» · «Tu recuerdo de hoy» · «Volver a las preguntas» · «Estás editando tu respuesta de hoy.» · «Respuesta actualizada.» · «Sobre: {opción}».
- **Hoy:** «Para retomar» (app) · «Tu reflexión · Día 1» · «Tu respuesta · Día 1» · «Volver a esta reflexión ›» (app) · «Volver a esta respuesta ›» · «Sobre: {opción} · ¿Qué te gustaría averiguar…?» · «Opcional» · «Ver lo que respondiste» (app, `useTodayEntry`) · «Día 1 hecho» · «{n} días completados / 2 lugares recorridos» (illustrative).
- **Follow-up illustration:** «Tu tarea:» · «Todavía no elegiste una tarea. Responde pensando en lo que tengas entre manos.» · «Opciones: las define el contenido de la app».
- **Reviewer-only (not product copy):** «Respuesta simulada», «Guardado simulado», «Teclado simulado», «Navegación existente (provisional)», «Valores ilustrativos», «Filas ilustrativas, tomadas de la captura de otro día», «Día de seguimiento (ilustrativo)», «Ejemplo sintético», «Texto propuesto», «Propuesta de prototipo: el recuerdo y el «1 de 7» cuentan aunque no escribas».

## Checks run, and their scope

Scope: **browser checks only** (Chromium, headless, via Playwright). There was **no device testing and no screen-reader testing**. Large text is a CSS imitation (the root font size scaled to 130% and 160%), not the operating system's text-size setting.

- **End-to-end: 91 of 91 checks pass** (`node src/e2e-c3.mjs`), with no JS errors. They cover:
  - the opening: the purpose line verbatim, «Puedes saltar cualquier pregunta.», no week-payoff text, the start button visible without scrolling at 393×852 and 360×780 at 100% (and reachable at 160%);
  - Q2 for all six options plus the option-free variant, no «siguiente paso» on the writing screen, and every note under 220 characters with no question and no em dash;
  - the compact writing screen, the draft kept when the choice changes with the new note, and nothing animating while writing;
  - the postcard (her exact words, large; Elara's note below; stamp, lantern; the postmark aria-hidden and low contrast);
  - «Para retomar» for a normal answer, «Hi», both skipped (no card) and «Ninguna» only; the 419-character answer in the postcard, clamped to two lines in «Para retomar», and intact in the editor;
  - each skip path (Ninguna with and without a note, Prefiero pasar on Q1, on Q2, and on both);
  - editing from Hoy and from the close (update, discard);
  - Hoy reachability: «Pedir ayuda ahora» scrolls fully above the button and tab bar at 393×852, 360×780 and 360×780 at 160%, for before, after, long-answer and long-name states;
  - the greeting rule and a long name never meeting the avatar; the tracker labels and count;
  - the follow-up illustration with and without a task;
  - offline (one retry, one continue; retry works); the drawn keyboard at 393/100% and 360/160% (field and primary button above it, labelled «Teclado simulado»); reduced motion (opacity only);
  - the saving tags; and a sweep of every screen and state for grading words, «Pasaste esta pregunta», album strings and promise strings.
- **Audit and captures** (`node src/shoot.mjs c3`): 194 audited captures and 4,566 text checks, plus 304 files in `shots/c3-*`. The covered cases:
  - every screen and state at 393×852 and 360×780;
  - 130% and 160% text on 21 key screens at both widths;
  - reduced-motion captures of 8 key screens, plus Cierre and Hoy at 160%;
  - Hoy with each name variant at 100% and 160%.

  Results:
  - Contrast: 0 failures; the lowest ratio is 4.8:1 («Martes · 3 nov» on the sky, measured against its darkest stop). The only text over a gradient is Hoy's date and greeting; no text sits over a photograph.
  - Product text is at least 14px; only the reviewer tags are 13px.
  - 0 targets under 44px; 0 horizontal overflow; 0 text wider or taller than its box; 0 overlapping text.
  - The reduced-motion captures animate opacity only.
- **Bugs found and fixed while checking:** «Wuzhen» overflowed its stamp at 160% (the stamp now grows with its caption); the decorative postmark crossed the date line at 160%; the audit counted the clamped lines of the two-line preview as overlap, so it now clips text to the clamp box.
- **Remaining gaps:**
  - No real device, no screen reader, no OS text size, no real keyboard (it is a drawing).
  - Hoy's layout is my reconstruction from two captures; spacing, the torn edges and the sky are close, not exact.
  - Only the six options and the two sample answers were exercised; real replies were never generated.
  - No user testing.

## Open questions

**For developers**
- Hoy's title: the captures show the day's question as the hero title. Earlier prototypes (and María's 2 Nov device capture) used the arrival name «Hacia el camino adelante». C3 shows the question on Hoy and the arrival name as the heading of the session opening. Which is right?
- What the persistent button says once the day is done is unknown. C3 uses «Ver lo que respondiste» (from `useTodayEntry`).
- The scroll fix: in React Native, set the scroll content's bottom padding to the measured button height plus the tab bar height plus a margin (`useBottomTabBarHeight`, `onLayout`). The prototype uses a layout where the area simply ends above them.
- The «Para retomar» rule for a low-content answer (fewer than three words, or a greeting) is a heuristic here. It needs a real definition, and a decision on where it runs.
- Whether Q2 can vary by Q1's option in the content model: today Q2 has one fixed body.
- Stamp perforation and torn edges need `MaskedView` or pre-rendered frames in React Native.

**For María and Alejandra**
- The Q2 variants and examples, and Elara's per-option notes: do they sound like her, and does any push too much?
- «Ninguna por ahora» alone: should Hoy show it as her answer («Tu respuesta · Día 1»), or show no card?
- Completion and progress when she writes nothing: the prototype gives the keepsake and the «1 de 7». This is a prototype proposal and needs a product decision.
- Is «Listo por hoy» plus «Puedes volver a estas preguntas cuando quieras.» the right tone for a fully skipped day?
- «Para hoy» rows: is an «Opcional» label enough, or should the header change (for example «Si te queda tiempo»)? I did not change it.
