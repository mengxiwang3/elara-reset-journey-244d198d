/* ------------------------------------------------------------------
 * Concept C v2 copy, layered on top of CONTENT (src/content.js stays the
 * single source for A, B and C v1, and is not changed).
 *
 * Provenance keys, as in content.js, plus:
 *   c1   = prototype copy already used in C v1 (still pending approval)
 *   new  = NEW in C v2: «propuesta, pendiente de María y Alejandra»
 *   user = wording the user asked for; applied in c2, still listed for approval
 *   sim  = simulated mentor reply (wording also a proposal)
 * ------------------------------------------------------------------ */
const C2 = {
  // item 2 · «Para llevarte» instruction (heading stays «Para llevarte», record)
  takeBody: "¿Qué podrías averiguar sobre esta opción? Escribe una pregunta o un pequeño paso.", // user
  // item 7 · option-free variant, for «Ninguna por ahora» and for a skipped question 1
  takeBodyFree: "¿Hay algo sobre tus ingresos que te gustaría averiguar? Si quieres, escribe una pregunta o un pequeño paso.", // new

  // item 5 · Elara's note after question 1, one per option (sim). App reply rules
  // (apps/api/src/services/stepReply.ts): under 280 characters, step 1 of 2 is a
  // bridge with no question, tentative, reflect what she chose, no em dash.
  askNotes: {
    "Encontrar trabajo":
      "Elegiste encontrar trabajo. Es un tema amplio, y quizá ayude empezar por una sola parte. En el siguiente paso puedes anotar algo concreto que te gustaría averiguar.",
    "Mejorar mi trabajo actual":
      "Elegiste mejorar tu trabajo actual. Partir de algo que ya conoces puede darte pistas útiles. En el siguiente paso puedes anotar algo concreto que te gustaría averiguar.",
    "Cobrar un pago pendiente":
      "Elegiste cobrar un pago pendiente. A veces aclarar un solo dato ya ordena el resto. En el siguiente paso puedes anotar qué te gustaría averiguar.",
    "Explorar un servicio o venta":
      "Elegiste explorar un servicio o venta. Por ahora se trata de mirar, no de decidir. En el siguiente paso puedes anotar algo concreto que te gustaría averiguar.",
    "Conocer apoyos disponibles":
      "Elegiste conocer apoyos disponibles. Saber qué existe puede ayudarte a ver tus opciones. En el siguiente paso puedes anotar algo concreto que te gustaría averiguar.",
    "Ninguna por ahora":
      "Elegiste «Ninguna por ahora». El siguiente paso es opcional: puedes escribir algo o terminar sin escribir.",
  },
  // item 5 · Elara's note after «Para llevarte» (sim; last step: closes the day, no question)
  // Tailored: only when her text is the synthetic sample answer.
  takeTailored:
    "Anotaste preguntar a tu encargada si hay formación gratuita para subir de puesto. Saber si existe podría aclararte qué opciones hay en tu trabajo. Tú decides si preguntas y cuándo; queda en tu tarjeta.",
  // Any other text: her words quoted verbatim (one trailing full stop dropped, longer
  // than 180 characters cut at a word with «…»), neutral, assumes nothing.
  takeTemplate: (words) => `Escribiste: «${words}». Queda en tu tarjeta, y tú decides si lo usas y cuándo.`,

  // item 7 · what a slot says when nothing was given (never filler, never a reply)
  slotSkipped: "Pasaste esta pregunta", // new
  slotEmpty: "Sin nota hoy",            // new
  finishEmpty: "Terminar sin escribir", // new (replaces «Prefiero pasar» on the «Ninguna por ahora» path)

  // item 3/4 · step 2
  yourChoice: "Tu elección",            // c1
  change: "Cambiar",                    // new in C (A uses it too)
  changeA11y: "Cambiar tu elección",    // new
  draftKept: "Tu borrador de «Para llevarte» se mantiene.", // new
  changedNotice: "Cambiaste tu respuesta a la pregunta 1. Revisa si lo que escribiste sigue encajando.", // new
  showNote: "Ver nota",                 // new
  hideNote: "Ocultar",                  // new

  // item 8 · offline: exactly one retry and one continue
  offlineTitle: "Ahora no hay conexión",          // c1 (A/B/C v1 prototype copy)
  retry: "Reintentar",                            // new (the app's photo step says «Intentar de nuevo»)
  continueWithout: "Seguir sin la nota de Elara", // new

  // item 1 · opening + guidance borrowed from A
  // «Por qué hoy» (revised 3 Nov): C v2 only, so it now differs from A on purpose. A's line
  // promised «Los próximos días parten de esa elección.», but day 9 does not use her choice.
  purposeLine: "Hoy eliges por dónde empezar a mirar tus ingresos y lo conviertes en algo concreto para averiguar.", // new
  progress: ["Por qué hoy", "Paso 1 de 2 · Elegir", "Paso 2 de 2 · Para llevarte", "Tu tarjeta"], // A's labels (c1) + «Tu tarjeta» (new)
  youTake: "Lo que te llevas hoy",      // c1
  ghostHint1: "Elige una opción",       // new
  ghostHint2: "Una pregunta o un pequeño paso", // new (from the item-2 wording)
  startCard: "Empezar mi tarjeta",      // c1
  addToCard: "Añadir a mi tarjeta",     // c1

  // completion, Hoy, collection
  cardToday: "Tu tarjeta de hoy",       // new
  seeCard: "Ver tarjeta",               // new
  doneEyebrow: "Semana 2 · Día 1 completado", // app pattern (practice.dayComplete.weekEyebrow)
  staysOnHoy: "Queda en Hoy durante toda la semana.", // c1
  savedColl: "Guardada en Tu colección · Semana 2",   // c1
  seeInColl: "Ver en Tu colección",     // c1
  draftLabel: "Tu borrador:",           // new
  closeA11y: "Cerrar y volver a Hoy",   // app (practice.day.closeA11y)
  leaveBodyDraft: "Tu lugar y lo que escribiste quedan guardados. Puedes seguir desde Hoy cuando quieras.", // new
  // fixed UI line on the completion screen (app strings, practice.dayComplete.summary). The app's
  // answered-0 line goes on «Saltarlas también está bien.»; that sentence grades her, so C v2 keeps
  // only the first, factual sentence.
  summary: (answered) =>
    answered === 0 ? "Recorriste las preguntas de hoy." : `Respondiste ${answered} de 2 preguntas.`,

  // brief 3 (3 Nov) · editing after completion, and the close when she wrote nothing
  edit: "Editar",                                   // new
  editA11y: "Editar tu tarjeta de hoy",             // new
  editingBanner: "Estás editando tu tarjeta de hoy.", // new
  saveChanges: "Guardar cambios",                   // new
  cancelEditA11y: "Descartar los cambios y volver a tu tarjeta", // new
  updated: "Tarjeta actualizada.",                  // new
  restTitle: "Listo por hoy",                       // app (day.arrival.done), the app's close with no takeaway
  restKeepsake: "Tu recuerdo de hoy",               // new
  dayDone: "Día 1 hecho",                           // app pattern («Día 1 hecho» on Hoy)

  // reviewer-only tags (not product copy)
  tags: { saved: "Guardado simulado", offline: "Sin conexión simulada · guardado simulado" },
  sampleBtn: "Usar respuesta de ejemplo (sintética)",
};
