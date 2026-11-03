# Daily-reply bench: results

**Simulated with Claude, not the production model (`openai/gpt-5.6-luna`) or its settings. Directional evidence only.** One Claude instance wrote and scored every reply, so the scoring was not blind (see README).

## Headline

| Variant | Useful move | Generic praise | Unsupported interpretation | Ends on a question to her | Uses her words | Length OK | Contrast pairs differ |
|---|---|---|---|---|---|---|---|
| V0 · Current prompt | 9/56 (16%) | 33/56 (59%) | 12/56 (21%) | 0/56 (0%) | 49/51 (96%) | 56/56 (100%) | 0/8 |
| V1 · Handoff proposal | 55/56 (98%) | 0/56 (0%) | 0/56 (0%) | 0/56 (0%) | 42/51 (82%) | 56/56 (100%) | 8/8 |
| V2 · Proposal + chosen move (recommended) | 56/56 (100%) | 0/56 (0%) | 0/56 (0%) | 0/56 (0%) | 42/51 (82%) | 56/56 (100%) | 8/8 |
| V3 · Proposal + last-step question | 55/56 (98%) | 0/56 (0%) | 0/56 (0%) | 16/56 (29%) | 41/51 (80%) | 56/56 (100%) | 8/8 |

- **Useful move** means one distinction, a tighter draft, the fact and who confirms it, or a feasible next step. A plain, correct acceptance of a skip, «no puedo» or stop also counts.
- **New task / homework:** 0 for every variant in the manual scoring. Every reply was natural Spanish.
- **Agreement:** the manual and rule-based judges agreed on praise in 53–55 of 56 replies per variant (95–98%).
- **V1 and V3** produce the same text on mid-day steps; they differ only on the last step.

## Useful move by session

| Session | V0 | V1 | V2 | V3 |
|---|---|---|---|---|
| S1 | 1/8 | 8/8 | 8/8 | 8/8 |
| S2 | 1/8 | 8/8 | 8/8 | 8/8 |
| S3 | 2/8 | 8/8 | 8/8 | 8/8 |
| S4 | 1/8 | 8/8 | 8/8 | 8/8 |
| S5 | 1/8 | 7/8 | 8/8 | 7/8 |
| S6 | 0/8 | 8/8 | 8/8 | 8/8 |
| S7 | 3/8 | 8/8 | 8/8 | 8/8 |

## Useful move by path

| Path | V0 | V1 | V2 | V3 |
|---|---|---|---|---|
| empleo | 5/26 | 26/26 | 26/26 | 26/26 |
| negocio | 0/7 | 7/7 | 7/7 | 7/7 |
| apoyo | 2/10 | 9/10 | 10/10 | 9/10 |
| before a path is chosen | 2/13 | 13/13 | 13/13 | 13/13 |

## Failure patterns

1. **V0 mirrors instead of helping.** 47 of 56 replies restate the answer and add warmth («Gracias por compartirlo», «buen cierre») but nothing she can use. Its only useful replies are acceptances of a skip or «no puedo». Contrasting answers get replies that differ only in the words they repeat (0 of 8 groups differ in substance).
2. **V0 states feelings and progress as facts** in 12 of 56 replies («Eso suena muy pesado», «has avanzado mucho»), even though its own rules say this should be tentative.
3. **The current prompt contradicts itself.** `BASE_PROMPT` says «Ask one gentle question at a time», the Sage persona «often end[s] on a question», and `jobFor` says «Do NOT ask a question». In this simulation V0 obeyed `jobFor`. A low-effort production model may not, and every proposed variant adds an explicit override line.
4. **V1 gets the path wrong once.** A support-path woman's «Cuidados» on session 5 got a job-offer reply. V2's move list, which ties the move to her situation, avoided it.
5. **V3 adds homework at the close.** 16 of 32 last-step replies end on a question («¿A quién se lo podrías preguntar?»). That reopens the day she was closing, which is the burden testers complained about.
6. **Every proposed variant uses her exact words a little less** (41–42 of 51, against 49 of 51 for V0), because they spend the reply on the move rather than on repeating her. This is acceptable, but `guidance` should keep asking for her words.

## Examples (V0 compared with V2)

**S1 · Essentials, in her own words** · answer: «no me alcanza para la comida de esta semana»

- V0: Dices que no te alcanza para la comida de esta semana. Eso suena muy pesado, y tiene sentido empezar por ahí.
- V2: Esto es cubrir lo básico esta semana. La pregunta útil es dónde puedes pedir apoyo para comida en tu zona; en el siguiente paso puedes escribirla así, sin dar tu dirección.

**S2 · «Cambia cada vez»** · answer: «Cambia cada vez»

- V0: Dices que cambia cada vez. Esa incertidumbre puede ser cansada de llevar.
- V2: Cuando cambia, el dinero confirmado para después no es dinero de hoy. Compara solo un periodo: lo confirmado y los pagos de ese periodo.

**S2 · Depends on another person** · answer: «depende de si mi pareja me pasa dinero ese mes»

- V0: Depende de si tu pareja te pasa dinero ese mes. Eso hace que todo sea menos predecible.
- V2: La distinción útil es entre lo seguro y lo que depende de otra persona. Para planear, cuenta solo lo seguro; lo de tu pareja queda «por confirmar».

**S3 · Contrast A: limited hours** · answer: «Tengo experiencia en atención al cliente, pero solo puedo de 9 a 2 por los niños»

- V0: Tienes experiencia en atención al cliente y solo puedes de 9 a 2 por los niños. Hoy pusiste en palabras algo importante para ti; buen cierre.
- V2: Te llevas un filtro claro: solo de 9 a 2. Y una ventaja concreta, la atención al cliente, para buscar puestos que respeten ese horario.

**S3 · Contrast B: time but no direction** · answer: «Tengo tiempo de sobra y computadora, me falta saber qué buscar»

- V0: Tienes tiempo y computadora, y te falta saber qué buscar. Hoy cerraste con algo claro sobre dónde estás.
- V2: Tu caso es distinto al de quien tiene poco tiempo: aquí lo que falta es el rumbo. Te llevas eso: tiempo y computadora a favor, falta elegir qué tipo de tarea.

**S4 · Contrast A: real task** · answer: «Llevaba el inventario de la tienda y detectaba cuando faltaba algo»

- V0: Llevabas el inventario de la tienda y detectabas cuando faltaba algo. Es una experiencia valiosa.
- V2: Tu frase ya está casi lista: «Llevé el inventario de una tienda y detecté faltantes». Es evidencia de control y orden, justo lo que piden muchos puestos.

**S4 · Contrast B: no formal job** · answer: «Nunca tuve empleo formal»

- V0: Nunca tuviste empleo formal. Gracias por compartirlo; no define todo lo que sabes hacer.
- V2: No tener empleo formal no dice qué sabes hacer. Una tarea real sin pago sirve igual, por ejemplo organizar algo en casa o en la escuela de tus hijos.

**S4 · Vague self-description** · answer: «soy responsable y trabajadora»

- V0: Te describes como responsable y trabajadora. Son cualidades importantes.
- V2: Una cualidad necesita un ejemplo. Prueba con la forma «Hice ___ y el resultado fue ___», con algo que muestre que eres responsable.

**S5 · Scam-like offer** · answer: «Otra condición: me ofrecieron un trabajo por WhatsApp que pide pagar el registro»

- V0: Te ofrecieron un trabajo por WhatsApp que pide pagar el registro. Es bueno que lo hayas notado.
- V2: Esa oferta ya choca con un filtro clave: pagar para empezar. Antes de nada, búscala en la web oficial de la empresa, no en el enlace, y no envíes dinero ni datos.

**S5 · Support path, job-shaped question** · answer: «Cuidados»

- V0: Elegiste cuidados. Cuidar de otros es una gran parte de tu vida.
- V2: Si tu camino es aclarar un apoyo, la condición de cuidados se traduce en una pregunta para el trámite: ¿puedo hacerlo sin dejar sola a la persona que cuido?

**S6 · Over-long draft** · answer: «Puedo ayudar con atención a clientes, ventas, inventario, caja, limpieza, organizar eventos, cuidar niños y hacer pedidos, lo demostré en varios trabajos durante muchos años»

- V0: Puedes ayudar con muchas cosas y lo demostraste durante muchos años. Tienes mucha experiencia; buen cierre.
- V2: Tu frase tiene ocho tareas; una frase útil tiene una. Te llevas la que más se repita en las ofertas que miras, con un ejemplo concreto.

**S6 · Correction** · answer: «no, quise decir que puedo atender clientes por teléfono, no en persona»

- V0: Puedes atender clientes por teléfono, no en persona. Gracias por aclararlo; buen cierre.
- V2: Entendido, por teléfono y no en persona. Te llevas la frase corregida: «Puedo atender clientes por teléfono».

**S7 · Last step: what she can do now** · answer: «Ahora puedo explicar lo que sé hacer con un ejemplo»

- V0: Ahora puedes explicar lo que sabes hacer con un ejemplo. Qué bonito cierre para esta semana; has avanzado mucho.
- V2: Te llevas una frase con ejemplo, lista para usar. Lo que venga después puede esperar a la próxima semana.

**S7 · Decides to stop** · answer: «Decido no seguir por ahora, no tengo tiempo»

- V0: Decides no seguir por ahora porque no tienes tiempo. Está bien cuidar tus tiempos; cierras con calma.
- V2: Es una decisión con información. Te llevas lo que preparaste, por si lo necesitas más adelante.

## Recommendation

Ship **V2**, with the exact text in `recommended-prompt.md`. Then rerun `run-inputs.json` against the production model, scored by blind human judges, before the tester round. If V2 still mirrors on the production model, the cause is the model or its effort setting, not the instructions.
