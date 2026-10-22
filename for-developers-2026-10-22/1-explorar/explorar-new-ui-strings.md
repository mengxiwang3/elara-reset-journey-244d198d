# New Spanish UI strings

The interface copy is Spanish; these notes are English. Every string below is new in this direction (or the earlier prototypes) and is marked **BORRADOR · pendiente de Alejandra**. No em dashes are used. No quote or bio by Alejandra was written; her seed bio is not shown.

## New in this direction (BORRADOR · pendiente de Alejandra)

| String | Where |
|---|---|
| Talleres, audios e ideas para acompañarte. | Header (owner-supplied wording) |
| Todo · Talleres · Audios · Videos | Category row |
| Próximo taller en vivo | Label on the feature photo |
| Con {nombre} · {n} min · Gratis | Feature metadata |
| {jue 22 oct} · {17:00} ({hora de Ciudad de México}) | Feature time; also «hora de Madrid», «hora de Bogotá», «hora de Nueva York», «hora UTC» |
| {17:00} ({CDMX}) | Workshop row time; also «Madrid», «Bogotá», «Nueva York» |
| {19:00} en Nueva York | Workshop detail, source time |
| Para escuchar | Section heading |
| Los 12 audios / Ver todos | Last tile on the shelf |
| Audio · {n} min | Format and length on cards and rows |
| Continuar escuchando | Appears only after something has been played |
| Sonando · {0:24} de {1:39} | Continue row while playing |
| Seguir escuchando {título} / Pausar {título} | Accessible names |
| Gratis · hasta 16 mujeres / Reservado · Gratis | Workshop row availability |
| {11} fechas más, en vivo por video. | Talleres category |
| Grabaciones | Talleres category |
| Todos los audios | Audios category |
| 12 prácticas guiadas de uno a dos minutos. Tocas una y ves de qué trata antes de escuchar. | Audios category |
| 4 videos breves y una grabación de taller. | Videos category |
| Ideas para leer / Ver todas | Guides section |
| 14 guías breves, para leer en un minuto. | Guides page |
| Guía para leer · {nombre} · {acceso} | Guide rows and sheet |
| Quién lo guía | Workshop detail |
| Autoría / Voz / Acceso / Duración | Audio detail facts |
| Escuchar / Seguir en {0:24} / Pausar | Audio detail button |
| Lo que dice el audio | Transcript (the catalogue cues, verbatim) |
| Reproducción simulada: no hay sonido y nada empieza solo. Un contador avanza cuando tocas Escuchar. | Audio detail |
| Sin imagen ni sonido: un contador avanza para mostrar el progreso. Nada empieza solo. | Video sheet |
| Buscar / Título, persona o formato / Buscar por título, persona o formato | Search |
| Guías | Search format tab |
| Elara todavía no tiene audiolibros. Lo que hay para escuchar son audios guiados de uno a dos minutos. | Search for «audiolibro» or «libro» |
| Ver el próximo taller / Ver los audios | Guardados empty state |
| Prototipo reiniciado: sin guardados, reservas ni escuchas. | Reviewer reset toast |
| Guardados, {n} | Accessible name of the header button |

## Carried from the earlier prototypes (still BORRADOR · pendiente de Alejandra)

«Ver el taller», «Ver todos», «Guardados», «Buscar en Explorar», «Videos y clases», «Próximos talleres», «Video breve», «Grabación de taller», «Contenido de muestra», «Taller en vivo por video», «Cuándo», «Duración», «Grupo», «Hasta 16 mujeres», «Sin tarjeta.», «Con la membresía de Elara.», «Precio de referencia; con membresía 21,99 USD. Lo ves antes de confirmar.», «Reservar mi lugar», «Ver la grabación», «Reserva simulada», «Reservar tu lugar», «Esto es un prototipo: no se reserva un lugar real y no se procesa ningún pago. Solo cambia lo que ves aquí.», «Confirmar reserva simulada», «Ahora no», «Reserva simulada: tu lugar aparece en Guardados.», «Devolviste tu lugar (simulado).», «Reproductor simulado», «Reproducir (simulado)», «Pausar (simulado)», «Capítulos», «{0:24} / {1:39} · simulado», «N resultados», «Prueba con otra palabra, como «dinero» o «noche», o mira todo lo que hay.», «Quitar búsqueda y filtros», «Tus lugares», «Guardado. Lo encuentras en Guardados.», «Quitado de Guardados.», «Solo Explorar funciona en este prototipo.», «Perfil de muestra: nombre, rol y biografía sin verificar.».

## Reused from production (`apps/mobile/src/i18n/locales/es/explore.ts`)

«Explorar», «Gratis», «Incluido con Elara», «Voz sintética», «Antes de dormir», «Esta noche», «A cualquier hora», «Guardado para después», «Aún no hay nada aquí», «Guarda una pieza y esperará aquí. Si dejas una escucha a la mitad, sigue donde la dejaste. Tu lugar en un taller también aparece aquí.», «Seguir en {time}», «Tu lugar está guardado.», «La anfitriona agrega el enlace antes de la noche. Aparece aquí.», «¿No puedes ir? Devuelve tu lugar», «¿Es para ti?», «Los N minutos», «Nada coincide con «x» todavía.».

All catalogue text (titles, takeaways, «¿Es para ti?» lines, agendas, cues, chapters, names and roles) is verbatim from DATA.

## New in v2 (BORRADOR · pendiente de Alejandra)

| String | Where |
|---|---|
| Guías | Category row |
| Grabación de muestra / Sin video todavía | Recording placeholder card |
| Primer fotograma del video de muestra. Aquí no suena ni se mueve: un contador avanza para mostrar el progreso. Nada empieza solo. | Video sheet |
| No hay grabación de esta sesión todavía. Un contador avanza para mostrar el progreso. | Recording sheet |
| primero, una pausa / hoy · esta semana · algún día / sí | Decorative lettering drawn on three covers (aria-hidden) |
| {n} min {s} s (e.g. «1 min 39 s», «54 s») | Audio length in all metadata (production's format) |
| Texto: actual / Texto: propuesto; Texto propuesto: lo subrayado con puntos es un cambio (BORRADOR). | Reviewer chrome only |
| Portadas / Vista de revisión: las 12 portadas de audio. | Reviewer-only gallery (`?screen=covers`) |

The proposed catalogue copy (23 items) is listed with its current text and sources in `COPY-PROPOSALS.md`.
