# Primera semana para cinco caminos

2 nov 2026. Diseño editorial para probar la primera semana de Propósito, Confianza en ti, Amor y límites, Ritmo diario y Energía, con el mismo modelo que las siete sesiones de Dinero: frase de propósito, pregunta, guía para la respuesta de Elara, «Te llevas» y «Próxima vez».

**Fuente:** las preguntas vivas de la app (`vasantakmr/Elara`, `tools/curriculum/curriculum-210.json`, borrador del 21 oct). No se usaron las reescrituras A/B: esos archivos ya no están disponibles en este entorno.

**Estado:** todo el texto nuevo es propuesta. Nada se publicó ni se cambió en la app.

## Veredicto por camino

| Camino | Primer resultado útil | Veredicto |
|---|---|---|
| Encontrar propósito | Día 1 | Usable con cambios menores. El primer resultado útil llega el día 1 si el paso opcional pide una pregunta, no solo un título (propuesta). Los días 1 y 6 se solapan (los dos piden «qué te interesa»); el día 3 es el mejor: un experimento de cinco minutos. El día 4 es el más abstracto. |
| Confianza en ti | Día 1 | Buena semana. Resultado útil desde el día 1 (qué buscaba al pedir aprobación: dato, compañía o permiso). Riesgo principal: que las respuestas de Elara validen («buena decisión»), lo que convierte a la IA en la nueva fuente de aprobación. Los días 3 y 5 dependen de una situación anterior («esa preocupación», «esa situación»): necesitan una vía con ejemplo nuevo. |
| Amor y límites | Día 2 | Buena progresión hacia una petición concreta (día 5), pero el primer resultado útil llega el día 2. Los días 4 y 5 dependen del vínculo y la necesidad anteriores: hace falta vía con ejemplo nuevo. Seguridad: toda petición es un borrador privado; enviarla nunca se pide; si menciona miedo, amenazas o daño, la respuesta cambia a la vía privada o sin acción y la pantalla de seguridad actúa. |
| Ritmo diario | Día 1 | Bien orientada (menos exigencia, no más disciplina), pero lenta: los días 2, 3 y 4 describen el mismo momento y el primer cambio concreto llega el día 5. Propuesta: que la respuesta del día 1 ya nombre una fricción posible, y revisar con María si los días 2–4 pueden fusionarse en dos. El día 2 depende de «ese momento de ayer»: vía con un momento reciente cualquiera. |
| Reinicio de energía | Día 1 | Segura y respetuosa (evita diagnosticar), pero muy de observación: el primer resultado práctico llega el día 6. Propuesta: que cada respuesta deje una observación con nombre desde el día 1. El día 3 depende de «ese cansancio». El día 6 («una necesidad básica») debe derivar a apoyo si lo básico (comida, sueño, techo) no está cubierto, sin recetar descanso. |

## Preguntas cambiadas

- Ninguna pregunta del día cambia.
- Propósito día 1: paso opcional propuesto («Escribe una pregunta pequeña que ese tema te despierta») en lugar de «pon un título».
- LOVE-W2-D6 (semana 2): redacción propuesta «¿Qué opción cuida mejor lo que necesitas y tu seguridad en esta situación?», para recuperar la seguridad.

## Revisión de los ítems de Amor marcados antes

- LOVE-W1-D4 conserva «qué necesitas más»: sí.
- LOVE-W1-D6 debía admitir «los dos»: la pregunta viva es abierta (dibujo o texto), así que no excluye ninguna respuesta; la guía cubre el caso.
- LOVE-W2-D6 debía conservar «necesidad y seguridad»: la versión viva no nombra la seguridad (solo el paso opcional). Propuesta incluida.

## Para desarrollo

- `first-weeks.json`: un objeto por día con `config.purpose`, `config.takeaway`, `config.nextBenefit` y `guidance` por paso, como en el handoff del 30 oct.
- Estos campos solo sirven si la respuesta diaria los recibe (cambio propuesto en `stepReply.ts`, aún no hecho en la app).
- Dependencias entre días: cada día marcado con «Atención» necesita una vía con ejemplo nuevo tras una pausa.

## Archivos

- `first-weeks.html`: página de revisión (abrir en el navegador).
- `purpose-semana-1.md`, `self-semana-1.md`, `love-semana-1.md`, `rhythm-semana-1.md`, `energy-semana-1.md`.
- `first-weeks.json`, `COPY-FOR-APPROVAL.md`, `build/` (datos y generador).
