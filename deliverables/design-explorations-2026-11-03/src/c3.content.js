/* ------------------------------------------------------------------
 * C3 copy. Loaded only into c3.html, after c2.content.js: it overrides C2's strings in
 * C3's build and leaves c2.html and d1–d3 untouched.
 * All of it is «propuesta, pendiente de María y Alejandra», except where marked:
 *   (app) = an existing app string, (record) = content of record, (user) = wording the user gave.
 * ------------------------------------------------------------------ */
const C3 = {
  // session opening
  meta: "Wuzhen · Semana 2 · Día 1 · unos 3 min",
  purpose: "Hoy elegirás qué aspecto de tus ingresos explorar y una pregunta para empezar.", // (user)
  optional: "Puedes saltar cualquier pregunta.",
  hint: "Al final te llevas una tarjeta con tu pregunta, si la escribes.",
  begin: "Empezar",

  // Q2, specific to the option she chose, with ONE short optional example (muted)
  q2: {
    "Mejorar mi trabajo actual": { // (user) for the question
      q: "¿Qué te gustaría averiguar para mejorar tus ingresos en tu trabajo actual?",
      ex: "si hay formación gratuita para subir de puesto" },
    "Encontrar trabajo": {
      q: "¿Qué te gustaría averiguar sobre el tipo de trabajo que buscas?",
      ex: "qué horarios suelen tener los trabajos que me interesan" },
    "Cobrar un pago pendiente": {
      q: "¿Qué te falta saber sobre ese pago pendiente?",
      ex: "qué fecha se acordó y si consta por escrito" },
    "Explorar un servicio o venta": {
      q: "¿Qué te gustaría averiguar sobre lo que podrías ofrecer o vender?",
      ex: "cuánto se suele cobrar por algo parecido" },
    "Conocer apoyos disponibles": {
      q: "¿Qué te gustaría averiguar sobre los apoyos que podrían corresponderte?",
      ex: "qué ayudas existen en mi municipio y quién puede pedirlas" },
    "Ninguna por ahora": {
      q: "Si quieres, anota qué tendría que cambiar para que alguna de estas opciones te importara. También puedes terminar sin escribir.",
      ex: "si tuviera más tiempo libre por las tardes" },
  },
  q2Free: { // «Prefiero pasar» on Q1: the option-free variant
    q: "¿Hay algo sobre tus ingresos que te gustaría averiguar?",
    ex: "qué gastos fijos tengo cada mes" },
  exLabel: "Ejemplo:",
  choiceLabel: "Tu elección",         // (c1)
  next: "Siguiente",                   // (app)
  note1Label: "Pregunta 1 de 2",

  // completion
  doneTitle: "Listo por hoy",          // (app) day.arrival.done
  calm: "Puedes volver a estas preguntas cuando quieras.",
  keep: "Tu recuerdo de hoy",
  stampName: "Wuzhen",
  toQuestions: "Volver a las preguntas",
  editingBanner: "Estás editando tu respuesta de hoy.",
  updated: "Respuesta actualizada.",
  changedNotice: "Cambiaste tu elección. Tu texto sigue aquí; revisa si aún encaja.",
  about: "Sobre:",
  tomorrow: "Mañana · Día 2",

  // Hoy
  hello: "Buenos días",
  greetMore: "Esta semana: ingresos y posibilidades.", // (record, week title)
  weekOf: "Tu semana en Wuzhen",
  retake: "Para retomar",              // (app)
  retakeReflection: "Tu reflexión · Día 1",   // (app pattern «Tu reflexión · Día 3»)
  retakeAnswer: "Tu respuesta · Día 1",       // for «Hi», a single option, «Ninguna»
  backReflection: "Volver a esta reflexión ›", // (app)
  backAnswer: "Volver a esta respuesta ›",
  edit: "Editar",
  forToday: "Para hoy",                // (app)
  optionalTag: "Opcional",
  guide: "Las historias que carga el dinero", guideSub: "Guía · 6 min de lectura",           // from the capture of another day
  assess: "Ver dónde estás", assessSub: "Tus seis áreas · 5 min",                             // from the capture
  talk: "Háblalo con Elara", talkSub: "Pregúntale lo que quieras sobre hoy",                  // from the capture
  help: "Pedir ayuda ahora",
  ctaStart: "Empezar el día 1",        // (app pattern)
  ctaResume: "Seguir con el día 1",    // (app pattern)
  ctaDone: "Ver lo que respondiste",   // (app, useTodayEntry)
  doneAt: "Día 1 hecho",
  asiaTitle: "Tu camino por Asia",     // (from the capture)
  asiaMore: "Explorar tu Atlas",

  // follow-up day illustration
  fuQuestion: "¿Qué describe mejor cómo va tu tarea?", // (borrowed from the capture, for this illustration only)
  fuTask: "Revisar las condiciones del curso gratuito", // synthetic example
  fuNone: "Todavía no elegiste una tarea. Responde pensando en lo que tengas entre manos.",
  fuOptions: "Opciones: las define el contenido de la app",

  // reviewer-only tags (not product copy)
  tNav: "Navegación existente (provisional)",
  tKb: "Teclado simulado",
  tIllus: "Valores ilustrativos",
  tRows: "Filas ilustrativas, tomadas de la captura de otro día",
  tProgress: "Propuesta de prototipo: el recuerdo y el «1 de 7» cuentan aunque no escribas",
  tFu: "Día de seguimiento (ilustrativo)",
  tExample: "Ejemplo sintético",
  tProposed: "Texto propuesto",
};

/* Overrides of C2 inside C3 only. Elara's notes: under 220 characters, grounded in what she
 * chose or wrote, one connection to the day's purpose (which aspect of income to look at, and a
 * question to start), nothing about a next step, no praise, no pressure, no question back. */
Object.assign(C2, {
  progress: ["Hoy", "Pregunta 1 de 2", "Pregunta 2 de 2", "Listo"],
  editingBanner: C3.editingBanner,
  updated: C3.updated,
  changedNotice: C3.changedNotice,
  askNotes: {
    "Encontrar trabajo":
      "Elegiste encontrar trabajo. Es un tema amplio; una sola pregunta concreta puede bastar para ver por dónde mirar primero.",
    "Mejorar mi trabajo actual":
      "Elegiste mejorar tu trabajo actual. Partir de lo que ya conoces puede mostrar qué parte de tus ingresos se puede aclarar con una pregunta.",
    "Cobrar un pago pendiente":
      "Elegiste cobrar un pago pendiente. Quizá lo que más aclare sea un dato concreto, como qué se acordó y cuándo, antes de decidir nada.",
    "Explorar un servicio o venta":
      "Elegiste explorar un servicio o venta. Por ahora se trata de mirar, no de decidir; una pregunta puede mostrar si esta vía merece más atención.",
    "Conocer apoyos disponibles":
      "Elegiste conocer apoyos disponibles. Saber qué existe y quién puede pedirlo puede ampliar las opciones de ingresos que tienes a la vista.",
    "Ninguna por ahora":
      "Elegiste «Ninguna por ahora». Puede que ahora no quieras mirar ninguno de estos aspectos de tus ingresos, y puedes dejarlo así.",
  },
  takeTailored:
    "Anotaste preguntar a tu encargada si hay formación gratuita para subir de puesto. La respuesta podría ayudarte a ver si mejorar tu trabajo actual es el aspecto que quieres explorar.",
  takeTemplate: (words) => {
    const w = words.length > 80 ? words.slice(0, 80).replace(/\s+\S*$/, "").replace(/[\s,.;:]+$/, "") + "…" : words;
    return `Escribiste: «${w}». Tenerlo por escrito puede ayudarte a decidir qué aspecto de tus ingresos mirar primero.`;
  },
});
