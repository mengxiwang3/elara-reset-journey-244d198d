# Overlay format (shared by every reviewer)

Input files (read-only):
- days2.json — the 210 days as they stand now (reviewer's red Spanish edits applied). Fields: code, area, week, dow, fmt, es_q/en_q, es_o/en_o (options separated by " • ", or an instruction for text formats), es_s/en_s (optional step, prefixed "Paso opcional / Para llevarte:" / "Optional step / Takeaway:"), es_q_orig/es_o_orig (Spanish before the red edits), edits[].
- review-1.json, review-2.json — the editorial review: per code {verdict, flags[{sev,type,note_es,note_en,suggestion_es?}], en_q_new?, en_o_new?}. en_q_new/en_o_new is the English for the reviewer's new Spanish and is the CURRENT English for those days.

Write a JSON array, one object per day you change (omit untouched days):
{
  "code": "LOVE-W4-D3",
  "fields": { "es_q": "...", "en_q": "...", "es_o": "...", "en_o": "...", "es_s": "Paso opcional / Para llevarte: ...", "en_s": "Optional step / Takeaway: ..." },   // only the fields you change; keep the " • " separator and the step prefixes
  "replies": [ {"es":"...","en":"..."} ],      // optional: Elara's reply per option, SAME ORDER and COUNT as the final options; max 2 short sentences; never diagnose, praise or push
  "softReply": {"es":"...","en":"..."},       // optional: reply when she taps "Prefiero pasar" / "No aplica"
  "help": true,                               // optional: show the app's existing help route ("Buscar ayuda ahora" → /crisis-help, "Pedir ayuda ahora") on this day
  "dep": {                                    // only when the day refers to an earlier answer
     "on": "LOVE-W2-D2",                      // the exact earlier day it relies on
     "strategy": "restate" | "new_example" | "own_situation" | "skip",
     "es": "...", "en": "..."                 // the line shown ONLY when that earlier day has no answer; specific to this day, not generic
  },
  "reasons": [ {"es":"...","en":"..."} ],     // one line per change: why
  "resolves": ["edit-review","options",...]   // which review flag types this resolves
}

Rules:
- Change only what a flag, a rule below, or the reviewer's intent requires. Keep the reviewer's Spanish rewrite unless a flag shows it breaks the day; when you revert or rework it, say so in reasons.
- A question must fit its format and options (one choice / multiple / text). Fix leading, blaming, guilt-assuming or diagnosing language. Fix Spain-centric wording for Latin American women (e.g. "prestaciones" → "apoyos o programas", "importe" → "monto"). Use feminine agreement where the curriculum already does.
- Every one-choice and multiple-choice day already gets "Prefiero pasar" and "No aplica" from the app; don't add them as options. An option like "Ninguna", "No sé", "Aún no lo sé" stays as an option when it is a real answer.
- Skipped-day dependencies: find EVERY day whose wording relies on an earlier answer ("ese/esa/esos…", "tu tarea", "lo que elegiste", "tu nota", "esa persona", recalls of earlier days). Decide per day: restate the needed context in one line, offer a fresh example, invite her to use a different situation, or make the day skippable. The dep line must make sense on its own for someone who skipped.
- Spanish first; English mirrors it. Keep questions ≤ 90 characters and options ≤ 42 where you can.
- Validate your file with python json.load before finishing.
