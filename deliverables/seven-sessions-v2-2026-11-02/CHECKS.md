# Checks · seven sessions v2 · 2 Nov 2026

**Automated:** 480 run, **480 passed, 0 failed, 0 blocked.** Ran in headless Chromium with `node source/test-v2.cjs .`. Per-check detail is in `check-results.json`.

| Group | Checks | What it covers |
| --- | --- | --- |
| Full journeys | 296 | Every combination of 3 paths (empleo / apoyo / negocio) and the 8 variant combos (2³), sessions 1–7 answered through the real controls, one day apart. Each run checks: all 7 completed; path kept; nav hidden in session and back after; ≤1 primary action per screen; session 2 folds only for B + «Cubrir algo básico»; recap present only in B and only on sessions 2–7; replies after steps (A) or exactly one at the end (B); S4 support chooses where to ask and gets no evidence-line question; S5 takeaway label per path; S6 support takeaway is the message |
| Content and states | 16 | S5 question per path; S7 «Probar algo pequeño» reply per path (support and business never mention a job offer); no address, phone number or URL anywhere on the support path; changing path swaps the question; «Ninguno» skips; full skip gives a calm takeaway with no reply; «Hoy no puedo»; stop and resume at the same step; gap → «La última vez te llevaste»; correction; reply B correction returns to the question; «Copiar mi mensaje» present |
| Layout | 144 | 4 phones (iPhone 15, iPhone SE, Pixel 8, Android 360) × text at 100 % and 160 % × 6 states (S1, S2 folded, S4 support, S5 support, S6 support end, S7 support end). Checks no horizontal overflow, every button in the phone ≥ 44 × 44 px, and all text in the body and dock ≥ 14 px |
| Keyboard | 8 | On each phone, with the keyboard open on S6: the input and the main action stay above the keyboard, and Back closes the keyboard first |
| Tester page | 15 | T1–T8 each get their assigned variants and reviewer controls are hidden; no network requests; notes kept per code across reloads; «Copiar notas» and the «Prototipo» label present; with no code, the picker shows and «al azar» writes a code to the URL; no horizontal scroll at 390 and 360 px; T1–T4 balance each variant 2/2 |
| Errors | 1 | No page errors on either page |

## Issues the checks found, now fixed

- **Support path, session 4.** It also asked the empleo «experiencia verdadera» question after «¿Dónde podrías preguntar?». It is now limited to empleo/negocio.
- **Tester page on a phone.** The phone frame was 43–73 px wider than the screen. It now fits the viewport below 440 px.
- **Switching code on an open tester page.** Changing the code in the URL didn't switch the code. It now reloads.
- **«Copiar notas».** It also copied the variant letters. It now copies only the code and the notes, so the participant isn't told her variant.

## Screens I looked at

Screenshots were reviewed by eye. 108 screenshots are in `screens/`:
- iOS and Android for each path × session (question and end);
- the variant states;
- the keyboard;
- iPhone SE at 160 %;
- the tester page.

Reviewed in contact sheets:
- Support S3, S4, S5 and S6 end; S7 end on each path.
- Business S5 and S7.
- Employment S5.
- S2 folded, recap B (yesterday and gap), reply B at the end.
- Keyboard; SE at 160 %; Android ends.
- Tester page at 390 and 360 px.

Things I noticed:
- **Focus outline.** The orange outline around the heading or reply in screenshots is the programmatic focus ring, the same as in v1. Not a bug.
- **SE at 160 %.** The S4 support question fills the first screen; the options scroll below it. The test still passes (no overflow, targets ≥ 44).
- **Tester page at 360 px.** The phone frame is about 332 px wide, so the status-bar icons sit close to the island. This is cosmetic.

## Not covered, or blocked

- **Blocked:**
  - The `day_feedback` SQL has not been run; there is no database access here. It is written as a request in `kit/day_feedback-sql.md`.
  - The tester page has not been published to a link; that is your call.
- **Not tested:**
  - real phones or mobile browsers;
  - VoiceOver / TalkBack;
  - the real clipboard on phones (only the button and the toast fallback are in place);
  - private-browsing storage (wrapped in try/catch but not run).
- **Layout scope.** The layout checks cover 6 representative states, not every screen. The ≥ 14 px check covers the session body and dock, not the reviewer chrome or the status bar.
- **Concept cards.** They render with 0 broken images. Each card prints to one A4 page; checked via a PDF render, in `kit/pdf/`.
