import type { Strings } from "../../types";

/**
 * Español — el motor de la práctica diaria: los pasos, el día completado, la
 * síntesis de la semana y la colección. Las palabras de cada día son contenido
 * (`pathContent`); esto es solo lo que rodea al día. Ver `en/practice.ts`.
 *
 * Mismas reglas que el resto del catálogo: la app se dirige a mujeres, así que
 * las concordancias van en femenino donde hablan de ella.
 */
export const practice: Strings["practice"] = {
  title: "Práctica",

  header: {
    weekDayEyebrow: (path: string, week: number, day: number) => `${path} · Semana ${week} · Día ${day}`,
    minutes: (n: number) => `~${n} min.`,
    finalStep: "Último paso",
    questionOf: (n: number, total: number) => `Pregunta ${n} de ${total}`,
    dayOf: (day: number, total: number) => `Día ${day} de ${total}`,
    progressA11y: (step: number, total: number) => `Pregunta ${step} de ${total} de hoy`,
    starsA11y: (done: number, total: number) => `${done} de ${total} días hechos esta semana`,
    back: "Atrás",
    backA11y: "Volver un paso",
    leaveA11y: "Salir de la práctica de hoy",
    closeA11y: "Cerrar y volver a Hoy",
    pagerA11y: (step: number, total: number) => `Página ${step} de ${total}`,
  },

  missingDay: {
    title: "Este día no está aquí",
    body: "Puede que el enlace sea antiguo o que el día haya cambiado de lugar. Todo lo que respondiste está a salvo.",
    back: "Volver",
  },

  cta: {
    continue: "Continuar",
    next: "Siguiente",
    finishToday: "Terminar por hoy",
    doneSpeaking: "Terminé de hablar",
    skipForNow: "Saltar por ahora",
    skip: "Saltar",
    /** Bajo un botón que lleva un segundo esperando: para qué es la espera. */
    keepingWords: "Guardando tus palabras. Un momento.",
  },

  saidOn: (weekday: string) => `El ${weekday} dijiste`,

  elara: {
    says: "Elara dice",
    moneyFeltReplies: [
      "Puedes reconocer ese peso sin resolverlo esta noche.",
      "Incluso un poco más de peso merece atención.",
      "Notar lo que no ha cambiado también puede ser útil.",
      "Un poco más de espacio merece ser reconocido.",
      "Tómate un momento para notar qué te ayudó.",
    ],
    noticed: "Elara notó",
    fromElara: "De Elara",
    /** The eyebrow over the one moment she picked, when a follow-up has a single option. */
    youNoticed: "Lo que notaste",
    remembers: "Elara recuerda",
    thinking: "Elara está pensando…",
  },

  weekComplete: "Semana 1 completada",
  weekCompleteA11y: "Semana 1 completada, siete de siete días",

  choice: {
    otherPlaceholder: "Escribe aquí…",
    otherA11y: (label: string) => `${label}: escribe la tuya`,
    pickUpTo: (n: number, picked: number) => picked >= n ? `${picked} de ${n} elegidas · desmarca una para cambiar` : `${picked} de ${n} elegidas`,
    limit: (n: number) => `Elige hasta ${n}`,
    blockedHint: "Quita una primero para elegir esta",
    exclusive: "O elige solo esta",
    moreBelow: "Hay más opciones abajo",
    singleFollowOn: "Esto es lo que elegiste.",
  },

  sort: {
    placeA11y: (item: string, column: string) => `${item}: ${column}`,
    left: (n: number) => (n === 1 ? "Falta 1 por ubicar" : `Faltan ${n} por ubicar`),
    moveA11y: (item: string, column: string) => `Mover "${item}" a ${column}`,
  },

  scale: {
    selected: "Elegiste:",
    a11y: "Arrastra o toca una opción",
    escape: "Todavía no lo sé",
  },

  reflect: {
    modesA11y: "¿Cómo quieres responder?",
    write: "Escribir",
    say: "Decir",
    draw: "Dibujar",
    ideas: "Ideas para empezar",
    sayIdeas: "O toca la que más se acerque",
    ideaA11y: (idea: string) => `Empezar con: ${idea}`,
    /** Bajo el campo mientras sus palabras están pero Siguiente aún espera más. */
    tooShort: (n: number) => `${n === 2 ? "Dos palabras o más" : `${n} palabras o más`}.`,
    /** The same, when there are suggested lines she can tap instead. */
    tooShortIdeas: (n: number) => `${n === 2 ? "Dos palabras o más" : `${n} palabras o más`}, o toca una de las frases de arriba.`,
    sentences: (n: number) => (n === 1 ? "1 frase" : `${n} frases`),
    typeInstead: "Mejor escribir",
    tapToSpeak: "Toca la esfera para hablar",
    listening: "Elara te está escuchando…",
    transcribing: "Anotando lo que dijiste…",
    heard: "Lo que Elara escuchó",
    orbA11y: "Grabar tu respuesta",
    orbStopA11y: "Detener la grabación",
    pad: {
      canvasA11y: "Espacio para dibujar. Dibuja con un dedo.",
      hint: "Dibuja con el dedo",
      undo: "Deshacer el último trazo",
      clear: "Borrar el dibujo",
      caption: "Ponle unas palabras para que Elara pueda responder",
      tones: { ink: "Tinta", peach: "Durazno", ember: "Brasa" },
      toneA11y: (name: string) => `Dibujar en ${name}`,
      fine: "Trazo fino",
      bold: "Trazo grueso",
      chooseShape: "Mejor elige una forma",
      drawInstead: "Mejor dibujar",
      shapeNames: {
        knot: "Un nudo",
        block: "Un bloque pesado",
        circle: "Un círculo abierto",
        wave: "Una ola",
        spark: "Una chispa",
      },
    },
  },

  rank: {
    places: ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto"],
    progress: (n: number, picked: number) =>
      picked >= n
        ? `Los ${n} en orden · toca uno para quitarlo`
        : `Elige ${n}, en orden · ${picked} de ${n}`,
  },

  cards: {
    of: (i: number, n: number) => `${i} de ${n}`,
    undo: "Deshacer",
    undoA11y: (item: string) => `Deshacer "${item}"`,
  },

  photo: {
    take: "Tomar foto",
    add: "Agrega tu foto",
    hint: "Las fotos cuadradas o verticales funcionan mejor",
    library: "Elegir de la galería",
    describe: "Mejor descríbelo",
    addInstead: "Mejor agregar una foto",
    describeLabel: "Descríbelo",
    describePlaceholder: "¿Qué era y por qué se sintió bien?",
    captionLabel: "¿Qué es? (obligatorio)",
    captionPlaceholder: "Unas palabras, como «El café de la mañana»",
    retake: "Tomar otra",
    use: "Usar foto",
    retry: "Intentar de nuevo",
    uploading: "Guardando tu foto…",
    failed: "Esa foto no se guardó.",
    denied: "Elara no puede acceder a tu cámara ni a tus fotos. Puedes permitirlo en Ajustes.",
    openSettings: "Abrir Ajustes",
    yourPhoto: "Tu foto",
  },

  blanks: {
    eg: "p. ej.",
  },

  rehearse: {
    script: "Tu guion",
    start: "Toca y dilo en voz alta",
    saying: "Dilo en voz alta… toca cuando termines",
    orbA11y: "Dilo en voz alta. No se graba nada.",
    orbOnA11y: "Diciéndolo en voz alta. Toca cuando termines.",
  },

  breathe: {
    in: "Inhala…",
    out: "Exhala…",
    count: (n: number, total: number) => `Respiración ${n} de ${total}`,
    still: (total: number) => `Toma ${total} respiraciones lentas, inhala por la nariz y exhala por la boca. Continúa cuando estés lista.`,
    skip: "Saltar",
    skipA11y: "Saltar la respiración y empezar",
    orbA11y: "Un círculo que crece cuando inhalas y se asienta cuando exhalas",
  },

  shown: {
    drawing: "Tu dibujo",
    photo: "Tu foto",
    reflection: (week: number, day: number) => `Reflexión de Semana ${week} · Día ${day}`,
  },

  followUp: {
    eyebrow: "Ayer",
    selectToContinue: "Elige cómo te fue para continuar",
    skipA11y: "Saltar la pregunta de ayer",
  },

  dayComplete: {
    /** Under her line on the dawn close. */
    signature: "Elara",
    weekEyebrow: (week: number, day: number) => `Semana ${week} · Día ${day} completado`,
    progress: (done: number, total: number) => `${done} de ${total} días completados`,
    experiment: "Tu experimento",
    tomorrow: "Mañana",
    experimentTitle: (what: string) => `Mañana: ${what}`,
    tomorrowA11y: (title: string) => `Mañana: ${title}`,
    backToday: "Volver a Hoy",
    summary: (answered: number, total: number) =>
      answered === 0
        ? "Recorriste las preguntas de hoy. Saltarlas también está bien."
        : total === 1
          ? "Respondiste la pregunta de hoy."
          : `Respondiste ${answered} de ${total} preguntas.`,
    saved: "Tus respuestas están guardadas. Puedes volver a ellas en tu Atlas.",
    savedOffline: "Tus respuestas están guardadas en este teléfono. Se sincronizarán cuando vuelvas a tener conexión.",
    // PROPUESTA (beta-fixes 3 nov, pendiente de revisión nativa).
    notSaved: "Una de tus respuestas no se pudo guardar en tu cuenta. Tus palabras siguen en ese paso, en este teléfono.",
    fallbackTitle: "Hoy te presentaste.",
    fallbackElara: "Lo que miraste hoy queda contigo para lo que sigue.",
  },

  refused: {
    // PROPUESTA (beta-fixes 3 nov, pendiente de revisión nativa).
    step: "Esta respuesta no se pudo guardar en tu cuenta. Tus palabras siguen aquí para que puedas enviarlas de nuevo.",
  },

  synthesis: {
    weekComplete: (week: number) => `Semana ${week} completada`,
    title: "Empieza a aparecer un patrón.",
    newInCollection: "Nuevo en tu colección",
    yourRule: "Tu regla",
    seeCollection: "Ver mi colección",
    continueWeek: (week: number) => `Continuar a la semana ${week}`,
    backToday: "Volver a Hoy",
  },

  collection: {
    title: "Tu colección",
    subtitle: "Lo que has ido creando en el camino.",
    week: (week: number) => `Semana ${week}`,
    weekTitled: (week: number, title: string) => `Semana ${week} · ${title}`,
    sentence: "Frase",
    scribble: "Garabato",
    drawing: "Dibujo",
    photo: "Foto",
    compass: "Brújula",
    words: "Palabras",
    letter: "Carta",
    fromElara: "De Elara",
    day: (day: number) => `Día ${day}`,
    unlocksNext: "Se abre después",
    comingInWeek: (week: number) => `Llega en la semana ${week}`,
    edit: "Editar",
    editA11y: (what: string) => `Editar: ${what.toLowerCase()}`,
    openA11y: "Lo abre en pantalla completa",
    lockedA11y: (week: number) => `Semana ${week}: se abre después de esta`,
    empty: "Lo que creas en tu práctica se guarda aquí: una frase que escribiste, un garabato, la carta al final de la semana.",
    noCaption: "Sin título",
    openPath: "Abrir tu camino",
  },

  weekIntro: {
    week: (week: number) => `Semana ${week}`,
    noteFrom: (guide: string, duration: string) => `Una nota de ${guide} · ${duration}`,
    noteFromShort: (guide: string) => `Una nota de ${guide}`,
    play: "Reproducir la nota",
    playA11y: (guide: string) => `Reproducir la nota de ${guide}`,
    subtitles: "Subtítulos",
    begin: (week: number, day: number) => `Empezar Semana ${week} · Día ${day}`,
    skip: "Saltar por ahora",
  },

  ambient: {
    promptTitle: "¿Quieres acompañar tu camino con sonido ambiental?",
    promptBody:
      "Una música instrumental suave y muy baja de fondo. Baja cuando habla Elara y se detiene cuando sales. Puedes apagarla cuando quieras.",
    promptYes: "Sí, con sonido",
    promptNo: "Ahora no",
    onA11y: "El sonido ambiental está activado. Apagarlo",
    offA11y: "El sonido ambiental está apagado. Encenderlo",
  },

  letter: {
    eyebrow: "Una carta de Elara",
  },

  feedback: {
    question: "¿Te sirvió la sesión de hoy?",
    answers: ["Sí", "Un poco", "No"],
    followUp: "¿Qué hizo que te sirviera menos? Elige todas las que apliquen.",
    reasons: [
      "No entendí el objetivo",
      "Se sintió muy general",
      "Fue demasiado larga",
      "La redacción era confusa",
      "No estaba en mi idioma",
      "Otra cosa",
    ],
    placeholder: "Cuéntanos más (opcional)",
    thanks: "Gracias, esto nos ayuda a mejorar Elara.",
    send: "Enviar",
    skip: "Ahora no",
    skipA11y: "Saltar esta pregunta",
  },
};
