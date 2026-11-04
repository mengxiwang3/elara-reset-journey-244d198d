# Money pilot: toward 10 (4 Nov 2026)

These files take the V3.2 week toward a 10. A document alone can't get it there: that needs the women, María and Ale. These files make the test possible this week.

| File | For | What it is |
|---|---|---|
| `Elara_Dinero_Hacia_el_10_ES.pdf` (10 pages) | María | The sign-ups in numbers, the test kit, the week card and the week-2 outline |
| `Elara_Money_Toward_10_EN.pdf` (10 pages) | team | The same, in English |
| `Mensajes_WhatsApp_Semana1_ES.txt` | María | All seven V3.2 days ready to paste into WhatsApp (test option B), with the reply for each option |

**What changed in V3.2:** day 7's close now asks what she wants to learn next, tells her which week-2 day covers it and offers her week card. The decisions page now includes «alquiler» or «arriendo».

## Beta sign-up data

The two beta sign-up CSVs (wave 1: 147 rows, wave 2: 15) were read in a scratch folder outside the repo. Only totals and paraphrased themes appear here. The CSVs themselves are not in the repo, and no name, email, phone number or quote is.

| | Count |
|---|---|
| Chose money first | 33 of 162 (20%) |
| Mentioned money at all | 40 (25%) |
| Use Android | 68 (42%) |
| Live in Colombia | 58 (36%) |

## Before running the test

- **Recruit from money sign-ups.** Choose the 5-6 testers from the 40 who mentioned money.
- **Set expectations about Money-only.** 4 in 5 sign-ups chose another area first, and the beta opens only Money. Say this in the invitation, or open their area.
- **Include Android users.** If the test build is iPhone-only (TestFlight), option B (WhatsApp) is how Android users take part.
- **Check the consent promise.** The team must confirm it can keep «Nadie del equipo leerá lo que escribas dentro de la app». If it can't, remove that line.
- **Unblock week 2 first.** Week 2 is closed to anyone without beta access, the known week-2 blocker. Fix that before day 7 announces week 2 in the app. The WhatsApp version doesn't promise week 2.

## For the developers

- **Week card:** reuse the existing share card (`apps/mobile/src/components/system/ShareCardSheet.tsx`, which already saves to photos and shares). The new work is choosing which lines appear.
- **Day 7 next-week question:** a `choose` step with written `replies`. It doesn't reorder anything, because week 2 has a fixed order.
- **Week 2:** same format as week 1. The arithmetic was checked in code: 10 × 18 = 180; 50 × 0.40 = 20; 50 × 0.15 = 7.50; 100 × 1.3² = 169; (8 + 10 + 12) × 12 = 360; 100 × 1.05²⁰ = 265.33.

## Rebuilding

`node src/build.mjs` rebuilds both PDFs and the WhatsApp file. It reads the V3.2 content directly, so the two stay in sync. The build fails if the two editions differ in shape or a page overflows.
