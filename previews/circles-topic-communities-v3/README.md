# Circles: life areas and life stages (prototype v3)

Design work only. No production app code was changed. v2 is unchanged at `previews/circles-topic-communities-v2/`.

## What changed from v2

1. **Life stages are easy to find.** "Life areas" and "Life stages" are two sticky tabs at the top of Explore Circles. Home's
   find-your-Circles line links straight to each.
2. **A newcomer reads first.** Circles home leads with one useful question and its best reply. "Your Circles" for a woman with
   none is one quiet line, not a boxed empty state. Ask stays compact; no date, no large composer.
3. **At scale.** A busy Circle (38 new questions) with a "Waiting for a first reply" card, followed tags marked "For you",
   a three-at-a-time "Could use your reply" list on Home, and a first-reply state. Screens E1 to E3.
4. **Who may read, who must join.** One rule, worded the same on every screen: any woman in Elara can read a Circle; only members
   of that Circle can ask or reply; which Circles she joined stays private.

The surfacing rules (waiting list, followed tags, "For you", three at a time, first-question welcome, host review) are
**design proposals**. None is implemented in the app, and no screen promises a response time.

## Open the prototype

    previews/circles-topic-communities-v3/index.html

One self-contained file (fonts load from Google Fonts with system fallbacks). Use the A to E chips to jump to screens, or click
through the phone. Toggle 390 × 844 / 320 × 568 and Default / Larger (130 %) text.
Direct link: `index.html?scene=e1&dev=320&ts=1.3` (add `&chrome=0` for the phone only, `&full=1` for a full scroll).

## Exports

    Elara-Circles-Life-Areas-Stages-Screens-v3-2026-10-14.pdf   90 pages, one screen per page
    screenshots/390x844/                       23 screens
    screenshots/320x568/                       23 screens
    screenshots/320x568-larger-text/           23 screens
    screenshots/full-length-390/               10 full scrolls
    screenshots/full-length-320/               5 full scrolls
    screenshots/full-length-320-larger-text/   5 full scrolls

New screens: A2b Explore, Life stages · E1 busy Circle · E2 Home, waiting for a reply · E3 the first reply.

## Inputs

Reference: the v2 PDF in this repository (the Downloads copy on the designer's Mac was not reachable from this session).
`esf.pdf` and `circle1.pdf` were not accessible, so private-room screens are unchanged.
