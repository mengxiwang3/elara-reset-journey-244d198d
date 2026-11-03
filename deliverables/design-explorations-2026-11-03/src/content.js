/* ------------------------------------------------------------------
 * ONE content object, inlined identically into a.html, b.html and c.html
 * by build.mjs. Concepts may only change structure and presentation.
 *
 * Provenance keys:
 *   record   = verbatim content of record (apps/api/drizzle/seed-content.sql,
 *              path_day money/es day 8; same text in tools/curriculum/
 *              curriculum-210.json MONEY-W2-D1 and in María's 2 Nov capture)
 *   app      = verbatim existing app UI string (apps/mobile/src/i18n/locales/es)
 *   proto    = new prototype copy, NOT content of record (listed in NOTES.md)
 *   sim      = synthetic sample answer / simulated mentor reply
 * ------------------------------------------------------------------ */
const CONTENT = {
  status: "Contenido actual de la app (aprobación por confirmar)", // proto label
  meta: {
    area: "Claridad financiera",             // record (areas.json)
    week: 2,
    weekTitle: "Ingresos y posibilidades",    // record
    place: "Wuzhen",                          // app
    placeFull: "Wuzhen, China",               // app
    dayInWeek: 1,
    pathDay: 8,
    code: "MONEY-W2-D1",
    title: "Hacia el camino adelante",        // app (as shown on María's device)
    minutes: 3,                               // record (config.minutes)
    keepsake: "farol de papel",               // app (home.hoy.keepsakes.wz[0])
  },
  // record: week intro note (seed config.intro.note)
  introNote:
    "Semana 2: Ingresos y posibilidades. Cada pregunta es opcional: puedes omitir una, usar un ejemplo en lugar de tu situación y mantener en privado lo que quieras. Nada de aquí te pide contactar a nadie, gastar dinero ni compartir lo que escribes.",
  // record: day payoff (seed config.payoff) = the week's takeaway in the curriculum
  weekPayoff: "Para llevarte esta semana: un criterio de oportunidad y una pregunta verificable.",
  // record: curriculum principle (PDF p.1, «Una pregunta principal al día»)
  dayPrinciple:
    "Cada día deja algo concreto: una distinción útil, una frase, un dato pendiente, una decisión pequeña o una nota que se puede recuperar.",
  // proto: one framing line for «why today» (not in the content of record)
  purposeLine: "Hoy eliges por dónde empezar a mirar tus ingresos. Los próximos días parten de esa elección.",

  ask: {                                       // record (step "ask", kind choose)
    title: "¿Qué parte de tus ingresos te gustaría explorar primero?",
    body: "Elige una.",
    options: [
      "Encontrar trabajo",
      "Mejorar mi trabajo actual",
      "Cobrar un pago pendiente",
      "Explorar un servicio o venta",
      "Conocer apoyos disponibles",
      "Ninguna por ahora",
    ],
    skip: "Prefiero pasar",
    fallback: "Eso ayuda. Puedes cambiarlo cuando quieras.", // record (authored elara line)
  },
  take: {                                      // record (step "take", kind reflect, keep sentence)
    title: "Para llevarte",
    body: "Elige una vía para investigar, sin tener que aceptar trabajo ni pagar nada.",
    placeholder: "Con tus propias palabras…",  // app
    skip: "Prefiero pasar",
    fallback: "Algo pequeño y claro es suficiente. Se queda contigo.", // record
  },

  sample: {                                    // sim
    name: "Lucía",
    choice: "Mejorar mi trabajo actual",
    take: "Preguntar a mi encargada si hay formación gratuita para subir de puesto.",
  },
  // sim: written to the app's reply rules (apps/api/src/services/stepReply.ts):
  // < 280 chars, 2–3 sentences, reflect what she said, tentative, no em dash,
  // step 1 of 2 = bridge with NO question, last step = close the day with NO question.
  replies: {
    ask: "Elegiste mejorar tu trabajo actual. Empezar por algo que ya conoces puede ser un buen punto de partida: quizá ya sabes a quién preguntar. Ahora lo llevamos a una sola cosa que puedas averiguar.",
    take: "Preguntar a tu encargada por formación gratuita es concreto y no te compromete a nada. Es algo que puedes hacer esta semana, y la respuesta ya te dirá algo. Queda guardado para mañana.",
  },
  simLabel: "Respuesta simulada",              // required label
  fallbackLabel: "Línea escrita de respaldo",  // proto (what the app shows with no model reply)

  tomorrow: {                                  // record (day 9, MONEY-W2-D2)
    dayInWeek: 2,
    title: "¿Qué sabes hacer que podría servir en una oportunidad que te interesa?",
    body: "Menciona un ejemplo concreto, también de experiencia informal.",
    minutes: 4,
    keepsake: "puente de piedra",              // app
    bridge: "Mañana partimos de lo que elegiste hoy.", // proto
  },

  ui: {
    thinking: "Elara está pensando…",          // app
    noticed: "Elara notó",                     // app
    offlineTitle: "Ahora no hay conexión",     // proto
    offlineBody: "Tus respuestas están guardadas en este teléfono. Se sincronizarán cuando vuelvas a tener conexión.", // app
    retry: "Intentar de nuevo",                // app
    continueWithout: "Seguir sin esperar",     // proto
    saving: "Guardando tu lugar",              // app
    resumeEyebrow: "Sigue donde lo dejaste",   // app
    resumeGo: "Seguir",                        // app
    next: "Siguiente",                         // app
    finish: "Terminar por hoy",                // app
    backToday: "Volver a Hoy",                 // app
    start: "Empezar el día 1",                 // app pattern («Empezar el día 3»)
    continueDay: "Seguir con el día 1",        // app pattern («Seguir con el día 3»)
    leaveTitle: "¿Lo dejas por ahora?",         // proto
    leaveBody: "Tu lugar queda guardado. Puedes seguir desde Hoy cuando quieras.", // proto
    leaveYes: "Salir y guardar",               // proto
    leaveNo: "Seguir aquí",                    // proto
  },
};
