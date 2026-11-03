# Seven sessions v2 · changes from v1

**Base.** The v1 local sources were lost when the container was replaced. v1 was rebuilt from the published «Finales integrados» artifact (`sesiones.html` and `dev-handoff.html`, read-only), and v2 is built on top of it. All v1 behaviour is kept:
- Paths, preview per session, skip, «Hoy no puedo», stop and resume, «No quise decir eso».
- The kit, keyboard, platforms, text size and reduced motion.

All new Spanish is **proposed**; see `COPY-FOR-APPROVAL.md`.

## By session and path

| Session | Employment (`empleo`) | Support (`apoyo`) | Business (`negocio`) |
| --- | --- | --- | --- |
| 1 | Unchanged | Unchanged | Unchanged |
| 2 | Unchanged (A). In B, folds only if S1 = «Cubrir algo básico ahora» | Same rule | Same rule |
| 3 | Unchanged: what she has + the condition | **New:** names the need and one condition («Quiero aclarar ___; tiene que ___»), with its own reply, takeaway and «next» line | Unchanged |
| 4 | Quiet path step + a true experience line (v1) | **New:** «¿Dónde podrías preguntar…?» Six categories: office, person, official site, phone line, organisation, «No sé todavía». Honest note: Elara can't confirm local services. Per-option practical reply that **never names a service, address or number**. The evidence-line question no longer shows on this path (bug found by the suite) | Quiet path step + what she has done that serves the need |
| 5 | Quiet path step + a filter for an opportunity (v1 options) | **New** filter for the procedure or support: opening hours, documents, transport, internet, care, language, other. Note that requirements can't be confirmed. Example «Que atiendan por la mañana y que no me pidan documentos que no tengo» | **New** first-test filter: no cost, fits my time, who to ask first, what counts as a yes. Then «¿Qué contaría como un sí para seguir con tu idea?» |
| 6 | First sentence (v1), takeaway shown as a quote | **New:** «¿Qué pregunta o mensaje llevarías, en dos frases?» with the format «Hola, quería saber si ___. Mi situación es ___.». Shows «Lo llevarías a: …» from S4, takeaway «Tu mensaje · Listo para copiar. No se envía a ningún sitio.», and **«Copiar mi mensaje»**, which falls back to a toast if the clipboard is refused | Offer sentence (v1), takeaway as a quote |
| 7 | «Probar algo pequeño»: compare your sentence with a real offer without sending it | **New:** take your message to the place you chose, or ask only for the first fact; keeping it for later also counts | **New:** ask two people, without spending, whether the idea would help |

- **Changing path** mid-session clears that session's other answers, so a stale branch answer never carries over. Picking «Ninguno por ahora» skips the path question.
- **S7 «Ninguno».** It has its own replies and does not assume a job offer.

## The three A/B pairs

Each pair is switched from **reviewer controls outside the phone** («Variantes A/B»). On the tester page the code sets them (T1–T8).

1. **Session 2.**
   - A: as v1.
   - B: if session 1 chose «Cubrir algo básico ahora», session 2 becomes one info step: «Ya sabemos por dónde empezar · En la sesión 1 elegiste cubrir algo básico ahora. Hoy no hace falta volver a contarlo.» It keeps the «Lo que es tuyo hoy…» note, and its takeaway is filled from session 1.
   - For any other session 1 choice, B behaves like A.
2. **Recap.**
   - A: no line.
   - B: sessions 2–7 open with «Ayer te llevaste · {label}: {text}».
   - After a gap of more than one day, or a «regreso tras 9 días», it reads «La última vez te llevaste…».
   - It uses the first line of the previous session's takeaway and skips «Hoy» labels.
   - If the previous session left no takeaway line, no recap shows; it never invents one.
3. **Replies.**
   - A: a reply after each step (v1).
   - B: no mid-session replies; one reply on the final screen, with «No quise decir eso» that returns to that question.

Changing a variant restarts the open session, so the variant is the only thing that differs.

## Tester page (`tester.html`)

- **Assignment.** Variants are set by code T1–T8 or at random, and stay fixed with `#t3`. Codes are also remembered in the browser, and a hash change reloads the page.
- **Balance.** T1–T4 is a balanced half-fraction (2/2 for each pair); T1–T8 is the full 2³.
- **Privacy.** No network after load. Notes are kept per code in the browser. «Copiar notas» copies the code and notes, not the variants.
- **Labelling.** The page is labelled «Prototipo».
- **Facilitator panel.** Next day, return after 9 days, iOS/Android.
- **Narrow screens.** Fits phone widths of 360 and 390 px.

## Kit

`kit/` holds:
- the facilitator script;
- the observation sheet (CSV + printable);
- one-page concept cards with real prototype screenshots;
- the day_feedback SQL request;
- the schedule.

See `kit/README.md`.

## Files and build

`source/` holds:
- `src/` (split app, the v2 engine `ses.js`, v1 engine `ses-v1.js` for reference, `boot.js`, templates);
- `s3s7.js` and `engine.js` (authoring pieces already merged into `ses.js`);
- `build.py`, `kit-build.py`, `test-v2.cjs`, `shots.cjs`.

`python3 source/build.py` writes the two pages into `source/`. Copy them up a level to replace the delivered ones.
