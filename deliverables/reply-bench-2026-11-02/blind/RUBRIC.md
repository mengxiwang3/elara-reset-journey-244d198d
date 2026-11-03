# Blind scoring rubric (Elara daily reply)

Context: Elara is a Spanish-language app for women. After she answers one step of a daily practice, Elara writes a short reply (2–3 sentences). Each item gives you the day's purpose, the intended takeaway, her path (empleo / negocio / apoyo = essentials or support / - = none), the step position, exactly what she was shown and what she answered, and Elara's reply. Judge ONLY the reply, against that context. You do not know which system produced it; do not guess.

Score each reply with true/false for:
- useful_move: the reply adds ONE concrete useful thing that serves the day's purpose: a clear distinction, an improved/tightened draft of her words, a clarified fact (and who can confirm it), or a feasible next step. Merely restating or paraphrasing her answer is NOT a useful move. Gracefully accepting a skip, "no puedo", or a stop counts as useful_move only if the answer was such a case.
- generic_praise: praise or approval not tied to content ("¡Qué bien!", "Es un buen punto de partida", "buena decisión", "valiente").
- unsupported_interpretation: states or implies her feelings, motives, needs or progress as fact beyond what she wrote (e.g. "te preocupa…", "eso te da tranquilidad", "estás avanzando") without hedging.
- new_task: assigns homework or a task beyond the next step already in the app (inviting her to write in "el siguiente paso" of the same day is NOT a new task).
- uses_her_words: refers specifically to something she actually wrote or chose.
- ends_with_question: the reply ends with a question addressed to her.
- natural_spanish: reads as natural, warm, plain Spanish (not translated-sounding, not clinical).
- fits_path: the reply fits her path (e.g. does not treat a support/essentials woman as job hunting). If path is "-", true unless clearly misfit.
Also give quality: 1–5 (5 = I would want this reply as the user) and a short note (max 15 words) for any false useful_move or any true praise/interpretation/new_task/misfit.

Output: a JSON array, one object per item: {"rid":"R001","useful_move":true,"generic_praise":false,"unsupported_interpretation":false,"new_task":false,"uses_her_words":true,"ends_with_question":false,"natural_spanish":true,"fits_path":true,"quality":4,"note":""}
