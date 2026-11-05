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
