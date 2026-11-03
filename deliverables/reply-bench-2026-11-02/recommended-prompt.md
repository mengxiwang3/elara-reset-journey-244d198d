# Recommended daily-reply prompt (variant V2)

**Simulated with Claude, not the production model (`openai/gpt-5.6-luna`) or its settings; directional evidence only.** One Claude instance wrote and scored every reply, so the scoring was not blind. See README.md.

This replaces the third block of `instructions` in `apps/api/src/services/stepReply.ts` (`replyToStep`, the template literal that starts «You are responding to one step of day…», currently about lines 182–198 at commit 1363407). `BASE_PROMPT`, the persona, the context block and `LANGUAGE_PROMPT` stay as they are. Every safety rule is unchanged.

## New inputs `replyToStep` needs

| Field | Level | Shown to her? | Example (session 4) |
|---|---|---|---|
| `purpose` | Day (`path_day.config.purpose`) | Yes, above the question | Hoy escribes una frase verdadera sobre lo que sabes hacer o lo que ya sabes de tu trámite. |
| `takeaway` | Day (`path_day.config.takeaway`) | No (the reply names it) | Una línea de evidencia reutilizable, o un dato conocido y una pregunta abierta. |
| `guidance` | Step (`DayConfig.guidance`) | Never | Convierte la tarea que nombró en una línea de evidencia; nunca inventes una habilidad… |

If `purpose`/`takeaway`/`guidance` are missing (any day outside the test), fall back to today's block unchanged.

## Block text

```
You are responding to one step of day ${dayNumber} of their path ("${dayTitle}").
Purpose of today (shown to her): ${purpose}
What she should leave with: ${takeaway}
How to reply to this step: ${guidance}
${job}

Answer with the reply text only: no greeting, no sign-off, no quotation marks around it, no markdown.
Keep it under ${STEP_REPLY_MAX - 40} characters. Two or three short sentences at most.
Before writing, decide silently which ONE move fits her answer best:
(a) a distinction she can use, (b) a tighter version of her own draft, (c) the one fact that would answer her question and who can confirm it, (d) one feasible next step that fits what she said about her time, money and situation.
If she skipped, said she cannot today, or is unsure, the move is to accept it plainly and close: no task, no persuasion.
If she corrects an earlier reading, take the correction as true and update without arguing.
Write only that move, grounded in her exact words. No praise. No interpretation of her feelings or motives. No new task.
These instructions override the voice note above about ending on a question.

<the existing «Respond only to what they actually said…» rules, unchanged>
```

## `job` (replaces `jobFor`)

- Mid-day step: `This was step ${position} of ${total} today, and another question follows immediately. Make your one move in one or two sentences. Do NOT ask a question of your own; it would compete with the step that comes next.`
- Last step (and `total === 1`): `This was the last of ${total} steps today. Name her takeaway in her own words (one sentence at most). Do not ask a question.`

## Why not the others

- **V0 (current).** Useful move in 9 of 56 replies, all of them correct acceptances of a skip or «no puedo». Praise in 33 of 56. It also carries a built-in conflict: `BASE_PROMPT` says «Ask one gentle question at a time» and the Sage persona «often end[s] on a question», while `jobFor` forbids questions.
- **V1 (handoff proposal).** Close to V2, at 55 of 56. It answered a support-path woman's «Cuidados» as if she were job hunting, because nothing told it to adapt the move to her situation.
- **V3 (V1 plus one optional question on the last step).** 16 of 32 last-step replies ended on a question. That turns the close into new homework, which is what the testers complained about.
