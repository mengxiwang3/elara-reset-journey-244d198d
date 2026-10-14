# Circles topic communities: design prototype

Design exploration only. Nothing here touches production Circles code; nothing is committed, pushed or deployed.

## Open the prototype

    previews/circles-topic-communities/index.html

Double-click the file, or open it in any browser. It is one self-contained page (it loads Fraunces and Instrument Sans
from Google Fonts, and falls back to Georgia and the system font offline). No install or server is needed.

- Click through the phone: home, a topic, a question, ask, reply, report, start a room.
- "Jump to" chips load each key screen. "Reset" returns to home.
- Switch between 390 × 844 and 320 × 568, and Default or Larger (130 %) text, at the top.
- Direct links: `index.html?scene=thread&dev=320&ts=1.3` (scenes: home, home-ret, topic, topic-un, thread, reply,
  ask-empty, ask, return, menu, room-start, room-new, room-quiet; dev: 390 or 320; ts: 1 or 1.3).
  Add `&chrome=0` to see only the phone, and `&full=1` for the full-length scroll.

## Screenshots (PNG, 2x)

    previews/circles-topic-communities/screenshots/
      00-contact-sheet-390x844.png
      00-contact-sheet-320x568.png
      00-contact-sheet-320x568-larger-text.png
      390x844/                 13 screens
      320x568/                 the same 13 screens
      320x568-larger-text/     the same 13 screens at 130 % text
      full-length-390/         six scrollable screens drawn in full

Screens: 01 Circles home · 02 Home after a reply · 03 Topic (Money Clarity, new) · 04 Topic (unanswered) ·
05 Question thread · 06 Replying · 07 Ask a question · 08 Ask, filled, with similar questions ·
09 Return to replies · 10 Report / hide / block · 11 Start a private room · 12 New private room · 13 Quiet room.

`source/` holds the pieces `index.html` was assembled from (styles, notes, script).

## Read before using

- `circle1.pdf` could not be opened from the cloud session that built this (the Mac path is not reachable), so the private
  room follows the earlier ten-woman room prototypes from this project.
- Names, questions and replies are fictional. "Hosted by the Elara team", the one-a-day notification, the 60-day rest and
  the three-woman minimum for a room are proposals to test, not things the app does today.
