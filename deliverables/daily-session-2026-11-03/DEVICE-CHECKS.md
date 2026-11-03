# Daily session: checks on a real phone

Nothing in this folder was run on a phone, an emulator or a simulator. None was available: no `/dev/kvm` and no attached device. The browser journey (`compare.html`, IMPLEMENTATION.md) covers layout and logic on React Native Web only.

This script is for a TestFlight build (iOS) and an internal-track build (Android) of the `daily-session` branch. Tick each box and add a note or screenshot on a fail.

## Before you start

- **Build:** the `daily-session` branch at the commit under test. The API must be deployed to staging before the Money day 8–9 seed rows are applied there.
- **Account:** a test account on Money with week 1 done and day 8 open (premium, because week 2 is membership). A second account on day 9 with day 8's takeaway written.
- **Language:** Spanish (es-ES).
- **Phones**, at least:
  - iPhone 15 or 14 (393 × 852);
  - iPhone SE 2nd/3rd gen (375 × 667, the small iOS case);
  - an Android phone 360 dp wide (Pixel 4a, Galaxy A-series, or similar, running Android 13 or later, edge-to-edge).
- **Between items:** reset the account to "day 8 open, nothing answered" (staging admin or a fresh test account). Each item says where it starts.
- **Simulated replies:** the browser screenshots used mock replies marked «[Simulado]». On staging the replies come from the real model, so judge them with the mentor rules in DESIGN-DECISIONS: one move, no praise, no question, nothing she did not say, never "safe" or "free", never her timing.

---

## 1. Keyboard on Q2

### 1.1 iPhone 15: everything stays in view while typing
- Steps:
  1. Hoy → «Empezar el día 1» → «Empezar».
  2. Q1: «Mejorar mi trabajo actual» → «Siguiente».
  3. Tap the field and type two lines.
- Expected:
  - The picture shrinks to a strip under the back and sound controls.
  - Visible without scrolling: «Tu elección» / «Mejorar mi trabajo actual» with «Cambiar», «Para llevarte», «¿Qué podrías averiguar sobre esta opción? Escribe una pregunta o un pequeño paso.», the field with its caret, and «Terminar por hoy» just above the keyboard.
  - Elara's note is hidden. «Prefiero pasar» and the field's sentence count and mic are hidden.
- [ ] Pass  [ ] Fail  Notes:

### 1.2 iPhone 15: the keyboard goes
- Steps: from 1.1, drag the page down to dismiss the keyboard.
- Expected: the band returns to its strip height, and Elara's note shows under the field. «Prefiero pasar», the sentence count and the mic come back. Her text is intact.
- [ ] Pass  [ ] Fail  Notes:

### 1.3 iPhone 15: a long answer
- Steps: from 1.1, keep typing until the field is 6 or more lines.
- Expected: the field grows, and the page scrolls so the caret stays above «Terminar por hoy». Once the page scrolls, a pinned line under the strip shows the instruction («¿Qué podrías averiguar…»), not «Para llevarte».
- [ ] Pass  [ ] Fail  Notes:

### 1.4 iPhone SE (375 × 667)
- Steps: as 1.1.
- Expected: as 1.1. If anything must give way, only the top of the choice row may scroll under the strip; the field and «Terminar por hoy» never do.
- [ ] Pass  [ ] Fail  Notes:

### 1.5 Android, 360 dp wide
- Steps: as 1.1, then press the system Back once while the keyboard is up.
- Expected:
  - While typing: as 1.1. «Terminar por hoy» sits right above the keyboard, not under it (edge-to-edge: the app reads the keyboard height itself).
  - After Back: the keyboard closes and the step stays. The day is not left.
- [ ] Pass  [ ] Fail  Notes:

### 1.6 Android, dictation
- Steps: with the keyboard up on Q2, use the keyboard's own mic key to dictate a sentence. Then close the keyboard and use the field's mic.
- Expected: both put the words in the field. The field's mic is a 44 dp target once the keyboard is down.
- [ ] Pass  [ ] Fail  Notes:

## 2. Text size: Dynamic Type and font scale

The band switches to its compact sizes at font scale ≥ 1.35 (`COMPACT_FONT_SCALE`). At 1.3 the regular band stays. At 1.6 the compact one shows. The browser imitation could not show this switch.

### 2.1 iOS at about 130 %
- Settings → Accessibility → Display & Text Size → Larger Text: the largest standard size (no accessibility sizes).
- Steps: open day 8. Check the opening, then Q1 → Q2, then finish and check the close, then Hoy.
- Expected:
  - **Opening:** no text cut mid-word, and «Empezar» is reachable.
  - **Q2:** «Tu elección» sits over the full choice, «Mejorar mi trabajo actual», wrapping onto at most two lines.
  - **Close:** the card shows her words in full.
  - **Hoy:** her words show in at most three lines with an ellipsis.
  - **Everywhere:** no label below the readable size, and no overlap with the band's controls.
- [ ] Pass  [ ] Fail  Notes:

### 2.2 iOS at about 160 %
- Larger Text: accessibility size 2 or 3.
- Steps: as 2.1.
- Expected:
  - As 2.1.
  - The band is the compact one on every screen, including the opening and the close (200 pt or less).
  - On Q2 with the keyboard up, the field and «Terminar por hoy» stay visible. The row may scroll.
- [ ] Pass  [ ] Fail  Notes:

### 2.3 Android at font scale 1.3
- Settings → Display → Font size, about 130 %.
- Steps and expected: as 2.1. The band stays regular.
- [ ] Pass  [ ] Fail  Notes:

### 2.4 Android at the largest font scale (about 1.6 or more, Android 14 or later)
- Steps and expected: as 2.2. Also check Hoy's tab bar and the day card's eyebrow, which are app-wide and outside this change: report them, but they are not session failures.
- [ ] Pass  [ ] Fail  Notes:

## 3. Saving and resuming after the app is killed

### 3.1 A draft survives a kill
- Steps:
  1. Day 8 → Q1 «Mejorar mi trabajo actual» → Q2.
  2. Type «Preguntar por los cursos».
  3. Wait 2 s, then force-quit the app (app switcher, swipe it away).
  4. Relaunch.
- Expected:
  - Hoy shows «Seguir con el día 1» with «Guardamos lo que escribiste».
  - Tapping it lands on Q2 with «Preguntar por los cursos» in the field and the choice row filled.
  - The opening («Por qué hoy») is not shown.
- [ ] Pass  [ ] Fail  Notes:

### 3.2 «Prefiero pasar» keeps typed words
- Steps:
  1. On Q2 type «Quizá preguntar a mi encargada», close the keyboard, and tap «Prefiero pasar».
  2. On the close, tap «Volver a Hoy».
  3. Open the day again from its card («Ver lo que respondiste»), or from the Atlas, and go to Q2.
- Expected:
  - The close shows «Listo por hoy» and «Hoy queda hecho, tal como lo dejaste.». The card shows only «Tu elección» / «Mejorar mi trabajo actual», with no empty slot and no Elara note. Hoy quotes nothing.
  - Back on Q2, the field still holds «Quizá preguntar a mi encargada».
- [ ] Pass  [ ] Fail  Notes:

### 3.3 A kill right after finishing offline
- Steps:
  1. Airplane mode on.
  2. Finish day 8 with a written Q2.
  3. Force-quit, then relaunch, still offline.
- Expected: Hoy shows «Hoy te llevas · Día 1» with her words. Nothing says the day was lost.
- Then: turn airplane mode off and wait 10 s.
- Expected: no duplicate answers. Reopening the close shows «Tus respuestas están guardadas…».
- [ ] Pass  [ ] Fail  Notes:

## 4. Airplane mode during the session

### 4.1 Finish offline
- Steps: Q1 online. Airplane mode on. Write Q2 and tap «Terminar por hoy».
- Expected:
  - The close shows her card.
  - Elara's note is the authored line, labelled «De Elara» (not «Elara notó»).
  - The saved line reads «Tus respuestas están guardadas en este teléfono. Se sincronizarán cuando vuelvas a tener conexión.».
  - There is no «Pedir la nota de Elara» while offline.
- [ ] Pass  [ ] Fail  Notes:

### 4.2 Back online
- Steps: from 4.1, airplane mode off, and stay on the close.
- Expected:
  - Within a few seconds the saved line changes to «Tus respuestas están guardadas…».
  - «Pedir la nota de Elara» appears once. Tapping it shows a note labelled «Elara notó», and the button goes.
- [ ] Pass  [ ] Fail  Notes:

## 5. Reply failure while online

Use one of these on staging:
- the step-reply model call failing (an invalid AI binding or key in a staging build); or
- a proxy (Charles or Proxyman) holding `POST /api/me/paths/money/days/8/steps` for more than 6 s, which is the app's wait, `STEP_REPLY_TIMEOUT_MS`.

### 5.1 The note falls back to the authored line
- Steps: finish day 8 with a written Q2 while the failure is on.
- Expected:
  - The close shows her words.
  - Elara's note is the authored «Algo pequeño y claro es suficiente. Se queda contigo.», labelled «De Elara». No error text is shown.
  - «Pedir la nota de Elara» shows once.
- [ ] Pass  [ ] Fail  Notes:

### 5.2 Asking again
- Steps: remove the failure, then tap «Pedir la nota de Elara».
- Expected:
  - A note labelled «Elara notó» replaces the authored line, and the button goes.
  - If the failure is still on, «La nota de Elara no llegó. Lo que escribiste sigue guardado.» shows instead, and her words stay.
- [ ] Pass  [ ] Fail  Notes:

## 6. Editing after the day is done

### 6.1 From the close
- Steps: finish day 8. On the close tap «Editar», change the words, then «Terminar por hoy».
- Expected:
  - «Editar» opens Q2 with her words in the field.
  - After «Terminar», the close shows the new words and a new note.
  - Hoy and Tu colección show the new words.
- [ ] Pass  [ ] Fail  Notes:

### 6.2 From Hoy
- Steps: after finishing, on Hoy tap the «Hoy te llevas · Día 1» card, then «Editar».
- Expected: as 6.1.
- [ ] Pass  [ ] Fail  Notes:

## 7. VoiceOver (iOS) and TalkBack (Android)

### 7.1 Opening
- Steps: VoiceOver on, open day 8, and swipe through.
- Expected order:
  1. Back.
  2. Map.
  3. Sound.
  4. «Wuzhen · Día 1 · Unos 3 minutos».
  5. The title (a heading).
  6. «Por qué hoy» (a heading), then the purpose.
  7. «Hoy te llevas» (a heading).
  8. «Tu elección: todavía vacío.»
  9. «Para llevarte: todavía vacío. Una pregunta o un pequeño paso».
  10. The week note.
  11. «Empezar» (a button).
- [ ] Pass  [ ] Fail  Notes:

### 7.2 Q2
- Expected:
  - The row reads as one element, «Tu elección: Mejorar mi trabajo actual», followed by the button «Tu elección: Mejorar mi trabajo actual. Cambiar».
  - Then the heading, the instruction, and the field (labelled with its placeholder).
  - Elara's note reads as «Elara notó. …», after the field, not before it.
  - With a screen reader on, choosing on Q1 does not move on by itself. «Siguiente» moves on.
- [ ] Pass  [ ] Fail  Notes:

### 7.3 Close and Hoy
- Expected:
  - Each card slot reads as «label: her words».
  - «Editar» reads as «Editar para llevarte».
  - The saved line is announced politely, once.
  - On Hoy the takeaway card reads its label and her words, as one button.
- [ ] Pass  [ ] Fail  Notes:

### 7.4 Ninguna and skips
- Steps: Q1 «Ninguna por ahora», then skip Q2. Repeat with both questions skipped.
- Expected:
  - Nothing reads as hers that she did not write.
  - No «Elara notó» is read.
  - The close reads «Listo por hoy», then «Hoy queda hecho, tal como lo dejaste.».
- [ ] Pass  [ ] Fail  Notes:

## 8. Day 9 the next day

### 8.1 «La última vez anotaste»
- Steps: the day after finishing day 8 with a written Q2, open Hoy, then day 9.
- Expected:
  - Hoy shows the day 9 card first, then «La última vez anotaste · Día 1» with her day 8 words.
  - The day 9 opening shows them too, under the card, with «Día 1».
- [ ] Pass  [ ] Fail  Notes:

### 8.2 Day 9 without an example
- Steps: on day 9, tap «Prefiero pasar» on Q1.
- Expected: Q2 reads «Piensa en algo que sabes hacer, también en casa o en un trabajo informal, y escríbelo en una frase sobre tu experiencia.», with no row and no Elara note.
- [ ] Pass  [ ] Fail  Notes:
