# Blind scoring of the reply bench: 2 Nov 2026

## Method

- **Replies:** the 224 replies from the bench (56 cases × 4 prompt versions).
- **Blinding:** the replies were shuffled and given anonymous IDs (`R001`–`R224`).
- **Reviewers:** eight fresh, independent Claude reviewers, who never saw which version wrote which reply. Each reply was scored by two of them.
- **Rubric:** `RUBRIC.md`.
- **Contrast check:** a ninth reviewer judged, for each group of contrasting answers, whether the replies differ in substance. The groups were shuffled and anonymised as well.
- **Un-blinding:** `key.json` and `gkey.json`, applied with `unblind.py`. The raw scores are in `judge1–8.json` and `contrast.json`, and the totals are in `BLIND-RESULTS.json`.

## Results (each count is out of 112 judgements: 56 replies × 2 reviewers)

| | V0 current | V1 handoff | V2 handoff + chosen move | V3 handoff + closing question |
|---|---|---|---|---|
| Useful move | 18 | 104 | **106** | 101 |
| Generic praise | 64 | 0 | 1 | 0 |
| Unsupported interpretation | 22 | 2 | **0** | 2 |
| New task | 0 | 2 | 3 | 1 |
| Uses her words | 106 | 98 | 101 | 98 |
| Ends with a question to her | 0 | 4 | 2 | 36 |
| Mean quality (1–5) | 1.95 | 4.00 | **4.09** | 3.98 |
| Contrasting answers get different replies | 0/8 | 7/8 | **8/8** | 8/8 |

- **Reviewer agreement:** 96–100% depending on the criterion. That's high, partly because every reviewer is the same kind of model.

## Reading

- **The same pattern as the earlier, unblinded scoring.** The current prompt mostly praises and mirrors. The handoff versions add a useful move in more than 90% of replies.
- **V2 scores best overall.** It is still the recommendation.
- **V3's closing question** makes about a third of its replies end with a question, which fights the «no new homework» rule.
- **The current prompt's one strength:** it reuses her own words slightly more often (106 vs 98–101).

## Limits

- **Blind scoring fixes the scoring bias, not the generation bias.** The replies were written by one Claude agent imitating each prompt, not by the production model (`openai/gpt-5.6-luna`, effort low).
- **The real test:** run `../run-inputs.json` on the production model, then score it blind the same way.
- **Directional evidence only.**
