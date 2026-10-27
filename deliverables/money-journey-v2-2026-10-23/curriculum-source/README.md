# Curriculum source (210 days)

How `../cur.js` is made. Saved with the work; this is not approval of the copy for release. María and Alejandra's Spanish review is still the release gate.

- `days2.json`: the 210 days parsed from *Elara_Curriculum_210_Days_ES_EN.pdf* (21 Oct 2026), with the reviewer's red Spanish edits applied (`edits.jsonl`).
- `review-1.json`, `review-2.json`: the editorial review flags.
- `overlay-*.json`: the per-day changes (format in `OVERLAY-SPEC.md`). A `dep.on` value may be one day or a list of days.
- `gen.py`: applies the overlays and writes `../cur.js` (journey weeks 6–10). It expects to run from a folder holding these files; its output path is absolute.
- `build_review.py`: builds the Spanish review page in `explorations/curriculum-spanish-review-2026-10-26/`.
- `money-v4*.{md,json}`: the Money v4 corrections already applied to `../data.js` and `../content.js`.
- `purpose-compare.md`: the Purpose comparison and recommendation.

Checks are in `../tools/`. Run them against `python3 -m http.server 8160` in the journey folder:
- `walk.cjs <journey-file>`: walks all 35 days and checks the skipped-day fallbacks. Its "recall" line reloads the page, which drops answers kept in memory, so it fails by design. Use `recall*.cjs` for that check.
- `blank.cjs`: checks the arrival screen and first question of all 210 days for a missing photo or an empty panel.
- `rhythm3.cjs`: checks the three Daily Rhythm fixes (W1-D6 multi-choice, multi-day recall on W4-D7 and W5-D1).
- `mv4.cjs`: checks the Money v4 display fixes.
