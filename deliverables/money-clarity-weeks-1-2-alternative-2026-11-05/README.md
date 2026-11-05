# Money Clarity weeks 1 and 2: one alternative (2026-11-05)

Artifact: https://claude.ai/artifact/WAywhaBB6ubV72bhUwDn32 (private until shared). Ventana look, ES/EN toggle.

## Source of truth
The 14 approved days and the step structure come unchanged from `vasantakmr/elara` at commit `64c54d6` (6 Oct 2026):
- `apps/mobile/src/i18n/locales/{es,en}/pathCopy/money.ts`
- `apps/mobile/src/content/pathDays/money.ts`

That copy came from the client's 115-screen Sleek export (`af2ead2`). Later commits on the app's branches replaced week 1. `source/extract.mjs` turns the copy into `source/approved.json` and `src/data.js` without editing it.

## What the alternative adds
Each layer is marked as a proposal. Turn off "Capas nuevas" to see only the approved days.
1. **Understand:** "La idea de hoy" at each day's close. Eight days reuse an approved Elara line; six (1, 3, 8, 11, 12, 14) are new.
2. **Practise:**
   - an optional "¿Cuándo?" on days 1 and 5;
   - day 3 marks the pause that fits her moment and the time she has;
   - day 4 offers an optional boundary check;
   - day 7 adds a rule built from her day 3 and one from her day 4 boundary.
3. **Useful feedback:**
   - day 1 explains a mis-sorted "Puedo / No puedo" item kindly;
   - days 6, 8, 9 and 10 reply according to her choice;
   - day 5 shows "Tu par".
4. **Continue:**
   - "Tu hilo": one piece per day, gathered on days 7 and 14;
   - openings that link back on days 5, 10 and 13;
   - save or finish without saving. Unsaved days are never quoted later; the approved fallback line is used instead.

## Limits of the prototype
- Say and draw modes on write steps are shown as text; day 12's drawing is a real canvas.
- The day 11 photo is never stored.
- Alejandra's video doesn't play.
- Week 2 reuses the seven AI-generated Arashiyama places in reverse.

## Checks
`node test/e2e.cjs src out`: 56/56. It walks all 14 days in ES and EN, a skip-everything run, the day 7, 9 and 14 callbacks, and layers off.

## Needs approval (María and Alejandra)
- All marked lines.
- Whether "Tu hilo" replaces or sits beside "Tu colección".
- The AI images.

## v2: usefulness fixes (2026-11-05)
After an audit of all 14 days:
1. **Day 14:** the draft says «Estoy soltando la frase anterior» only if on day 10 she marked her sentence «Ya no es mía».
2. **Day 7:** with the new layers on, the three fixed rules no longer say «Hecha con tu día…», because they're the same for everyone.
3. **Day 10:** her own sentence joins the «Todavía es mía / Ya no es mía» sort.
4. **Days 5 and 6:** day 5's alternatives fit the need she named, and day 6 brings her alternative back.
5. **Follow-ups:** day 12 asks how the spend planned on day 11 went, and day 14 asks about the day 13 conversation. «No pasó» is a full answer.
6. **«La idea de hoy»:** only on days 1, 3, 8, 11, 12 and 14. On the other eight days it would repeat a line she had already read.
7. **Day 13:** «Me siento presionada o amenazada por dinero» opens Help and lets her end the day. Nothing is stored. The Help route is a placeholder until Codedale wires it.
8. **Day 2:** «Esta vez nada me sorprendió» skips «¿Qué te sorprendió de eso?».

Still for María and Ale: should any week look at a real amount? None of the 14 days does.

e2e: 69/69.
