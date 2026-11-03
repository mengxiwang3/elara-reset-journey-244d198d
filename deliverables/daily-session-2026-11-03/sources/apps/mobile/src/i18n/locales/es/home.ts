/**
 * Español — Hoy, Caminos y el camino en sí.
 *
 * Regla de traducción de este dominio: nada de esta copia cuenta lo que la
 * persona *no* hizo. "Te registraste 3 de los últimos 7 días" es un registro de
 * presencia, no una calificación sobre siete — "solo 3 de 7" rompería la regla
 * sobre la que está construida toda la pantalla.
 */
import type { Strings } from "../../types";

export const home: Strings["home"] = {
  today: {
    /**
     * Sin nombre, el saludo se cierra solo: "Buenos días." en vez de
     * "Buenos días, ahí." — el inglés puede decir "there", el español no tiene
     * equivalente que no suene raro, así que aquí va vacío a propósito y la
     * plantilla se encarga del punto.
     */
    friend: "",
    greeting: {
      morning: "Buenos días",
      afternoon: "Buenas tardes",
      evening: "Buenas noches",
      night: "Qué tarde",
    },
    opening: {
      morning: "Una página en blanco, y ninguna prisa por llenarla.",
      afternoon: "Como sea que haya ido el día hasta ahora, aquí estás.",
      evening: "El día va cerrando. Vamos a mirarlo.",
      night: "Sea lo que sea que te trajo tan tarde, es bienvenido.",
    },
    reply: {
      calm: "La calma vale la pena notarla. Vamos a cuidarla.",
      unsure: "No saber es honesto. Podemos empezar ahí.",
      good: "Lo bueno vale la pena notarlo. Vamos a cuidarlo.",
      okay: "Normal es un buen punto de partida.",
      stressed: "Quitemos una cosa del montón.",
      heavy: "Los días pesados también cuentan. Ve con calma.",
    },
    /**
     * La señal de la mañana: la frase con la que Elara abre el día, ahora lo
     * primero de la pantalla y no lo último. Es el único texto de la app que
     * alguien puede exportar, así que se escribe para sostenerse sola.
     */
    cueEyebrow: "Elara hoy",
    cueLabel: "Señal de hoy",

    clarityEyebrow: "Tu Claridad",
    clarityAreas: (n: number) => `${n} áreas de vida`,
    clarityFocus: (area: string) => `Foco actual: ${area}`,
    clarityA11y: (n: number, areas: string) => `Tu Claridad en ${n} áreas de vida: ${areas}`,
    clarityBlurb: ({ active, hasProgress }: { active: string; quiet?: string; hasProgress: boolean }) =>
      hasProgress
        ? `Lo que has registrado hasta ahora está sobre todo en ${active}.`
        : `${active} es donde empiezas. El resto se irá llenando mientras sigas caminando.`,
    viewClarity: "Ver Claridad",
    minutes: (n: number) => `~${n} min`,
    practiceKind: "Práctica",
    optional: "Opcional",
    profileA11y: "Tu perfil",
    checkedIn: "Ya te registraste",
    howArriving: "¿Cómo llegas hoy?",
    moods: {
      good: "Bien",
      okay: "Normal",
      stressed: "Con estrés",
      heavy: "Pesado",
    },
    checkInAs: (mood: string) => `Registrarte como ${mood}`,
    checkInHelp: "Un toque guarda el registro de hoy. Puedes cambiarlo cuando quieras.",
    arrivalMoods: { calm: "En calma", okay: "Bien", heavy: "Con peso", unsure: "No sé" },
    arrivalHelp: "Opcional · toca para guardar y cambia cuando quieras.",
    noCheckIn: "Sin registro",
    afterPracticeMood: "¿Cómo te sientes ahora?",
    checkInOptional: "Opcional · guarda cómo terminas la práctica de hoy.",
    allDaysWalked: "Recorriste los siete días.",
    chooseWhereNext: "Elige a dónde ir ahora.",
    allDone: "Todo hecho",
    allDaysA11y: "Todos los días de este camino están completos",
    weeksWalked: (weeks: number) =>
      weeks === 2 ? "Terminaste las dos primeras semanas." : `Terminaste las primeras ${weeks} semanas.`,
    moreWeeksComing: "Las próximas semanas ya vienen en camino. Te avisaremos cuando la siguiente esté lista.",
    seeCollection: "Ver mi colección",
    weekDayA11y: (week: number, day: number, total: number, done: number) =>
      `Semana ${week}, día ${day} de ${total}, ${done} completados`,
    chooseNextPath: "Elegir el siguiente camino",
    startDay: (week: number, day: number) => `Empezar Semana ${week} · Día ${day}`,
    startPractice: "Empezar la práctica de hoy",
    continuePractice: "Continuar la práctica de hoy",
    practiceWhy: (teaser: string) => `Hoy: ${teaser}`,
    weekLabel: (week: number) => `Semana ${week}`,
    weekDayLabel: (week: number, day: number) => `Semana ${week} · Día ${day}`,
    weekCompleteCount: (done: number, total: number) => `${done} de ${total} completados`,
    compass: "Tu brújula diaria",
    weekCount: (done: number, total: number) => `${done} de ${total} esta semana`,
    compassA11y: (done: number, total: number) =>
      `Tu brújula diaria. ${done} de ${total} días completados esta semana.`,
    todayMarker: "Hoy",
    doors: {
      talkTitle: "Hablarlo",
      talkCaption: "Elara está aquí.",
      circleTitle: "Tu círculo",
      circleCaption: "Mira quién anda por aquí.",
      circleSharedToday: (n: number) =>
        n === 1 ? "1 persona compartió hoy" : `${n} personas compartieron hoy`,
      circleLocked: "Reflexiona junto a mujeres que caminan el mismo camino.",
    },
    lastSeven: "Tus últimos siete días",
    progressEyebrow: "Tu progreso",
    streakDays: (n: number) => `${n} ${n === 1 ? "día" : "días"}`,
    weekA11y: (logged: number) => `Te registraste ${logged} de los últimos 7 días`,
    rhythmEmpty: "Tu ritmo empieza la primera vez que te registras.",
    rhythmCount: (logged: number) => `Te registraste ${logged} de los últimos 7 días.`,
    howYouveBeen: "Cómo has estado",
    closingLine: "Como sea que haya ido hoy, lo trajiste aquí. Eso cuenta.",
    cues: [
      "Como sea que haya ido hoy, lo trajiste aquí. Eso cuenta.",
      "No tienes que resolverlo hoy. Darte cuenta ya es empezar.",
      "Algo pequeño y honesto vale más que algo grande y algún día.",
      "Lo que evitas pesa más. Lo que miras se hace más pequeño.",
      "Tu ritmo es el ritmo correcto.",
      "El dinero es una historia que puedes editar, una línea a la vez.",
      "Puedes querer más y estar orgullosa de lo que tienes.",
    ],
    dayDone: (week: number, day: number) => `Semana ${week} · Día ${day} hecho`,
    opensToday: (week: number, day: number, time: string) =>
      `Semana ${week} · Día ${day} se abre hoy a las ${time}`,
    opensTomorrow: (week: number, day: number, time: string) =>
      `Semana ${week} · Día ${day} se abre mañana a las ${time}`,
    opensOn: (week: number, day: number, weekday: string, time: string) =>
      `Semana ${week} · Día ${day} se abre el ${weekday} a las ${time}`,
    comeBackTomorrow: "Vuelve mañana",
    nextPractice: (week: number, day: number, title: string) => `Semana ${week} · Día ${day}: ${title}`,
    talkToElara: "Hablar con Elara",
    redoToday: "Volver a hacer el día de hoy",
    redoNote: "Tus respuestas se quedan. Lo que cambies reemplaza lo que escribiste.",
    shareHowItWent: "Cuéntanos cómo te fue",
    seeWhereNow: "Mira dónde estás ahora",
    weekVideo: (week: number) => `Intro de la semana ${week}`,
    weekVideoA11y: (week: number) => `Video de introducción de la semana ${week}. Abre el reproductor.`,
    wordmark: "Elara",
    mastheadDate: (weekday: string, day: number, month: string) => `${weekday} · ${day} ${month}`,

    shareToday: "Compartir la frase de hoy",
    cueQuoted: (line: string) => `\u201C${line}\u201D`,
    /** Cross-day memory: one sentence she wrote on an earlier day, in her own words. */
    memoryEyebrow: { yesterday: "Ayer dijiste", days: "Hace unos días dijiste", earlier: "Elara recuerda" },
    memoryA11y: (day: number, line: string) => `Elara recuerda, del día ${day}: ${line}`,
    /** Welcome back after two or more days away. One sentence; nothing is reset or counted. */
    reentry: { soft: "Qué bueno verte de nuevo.", full: "Volviste. No perdiste nada. Seguimos desde aquí." },
    yourPath: "Esta semana",
    clarityFocusLead: "Foco actual:",
    clarityActive: "Activo",
    audioFrom: (name: string) => `De ${name}`,
    audioEyebrow: "Guías",
    audioCount: (n: number) => `${n} ${n === 1 ? "guía" : "guías"}`,
    audioLength: (n: number) => `${n} min`,
    listenGuide: "Escuchar",
    watchNote: "Ver la nota en video",
    weekProgress: (week: number, day: number, total: number) => `Semana ${week} · ${day} de ${total}`,
    welcomeEyebrow: "Tu punto de partida",
    welcomeDismiss: "Cerrar la bienvenida",
    guideSheetA11y: (title: string) => `${title}, guía de audio`,
    guideOpenDetail: "Sobre esta guía",
    guideLoadFailed: "Esta guía no cargó. Inténtalo de nuevo en un momento.",
    streakOpenA11y: (days: string) => `Tu ritmo, ${days}. Abre tus hitos.`,
  },

  /**
   * «Pedir ayuda ahora» al final de Hoy: abre la misma pantalla de ayuda que las
   * notas de seguridad de los círculos. BORRADOR, pendiente de Alejandra.
   */
  helpNow: {
    title: "Pedir ayuda ahora",
    detail: "Líneas de apoyo gratuitas y qué hacer en una emergencia.",
    a11y: "Pedir ayuda ahora. Abre las líneas de apoyo y qué hacer en una emergencia.",
  },

  /** «Para retomar»: hasta tres caminos de vuelta. BORRADOR, pendiente de Alejandra. */
  resume: {
    title: "Para retomar",
    nextStep: "Tu próximo paso",
    chose: (when: string) => `lo elegiste ${when}`,
    when: {
      today: "hoy",
      yesterday: "ayer",
      on: (day: string) => `el ${day}`,
    },
    talkItThrough: "Hablarlo con Elara",
    conversation: "Conversación con Elara",
    pickUp: "Seguir donde la dejaste",
    seeNote: "Ver la nota",
    keptWeek: (week: number) => `Guardado · Semana ${week}`,
    keptOpen: "Verlo en tu camino",
    drawer: "Todo lo que guardaste, en tu cajón",
  },

  journey: {
    eyebrow: (area: string, week: number) => `${area} · Semana ${week}`,
    walkedTitle: (world: string) => `Recorriste ${world}`,
    /** Over the next world's preview on a walked card. */
    nextEyebrow: "Lo siguiente",
    nextWorld: (world: string) => `Después: ${world}`,
    seePath: "Ver tu camino",
    seeWhereBeen: "Ver dónde has estado",
    hereA11y: (world: string, where: string, day: number, total: number) =>
      `${world}. Estás aquí: ${where}, día ${day} de ${total}.`,
    walkedA11y: (world: string) => `Recorriste ${world} hasta el final.`,
    alsoToday: "También hoy",
    pathsTitle: "Tu camino",
    shelf: "Tu recorrido",
    shelfNote: "Cada semana es un lugar. Los que ya recorriste se quedan aquí.",
    weekStatus: (week: number, status: string) => `Semana ${week} · ${status}`,
    beingWritten: "En preparación. Se abre cuando llegues.",
    opensNext: "Su primer día se abre a continuación.",
    allDays: (total: number) => `Ver los ${total} días`,
    hideAllDays: "Ocultar los días",
    weekWorld: (week: number, world: string) => `Semana ${week} · ${world}`,
    otherPaths: "Otros caminos",
    otherOpen: "Cuando quieras",
    otherLocked: "Con membresía",
    piecesPencilled: "La pieza de mañana ya está esbozada.",
    legendDone: "Hecho",
    legendToday: "Hoy",
    legendAhead: "Por venir",
    piecesToday: "La pieza de hoy te espera.",
    piecesLaid: "La pieza de hoy ya está puesta.",
    piecesAll: "Todas las piezas de este mundo están puestas.",
    piecesA11y: (laid: number, total: number) => `${laid} de ${total} piezas de este mundo puestas`,
    skyLine: "Tu respuesta le da color al cielo de hoy.",
    kept: "Guardado",
    keptWeek: (week: number, title: string) => `Semana ${week} · ${title}`,
    yourRule: (text: string) => `Tu regla: \u201C${text}\u201D`,
    yourWords: (text: string) => `Tus palabras: \u201C${text}\u201D`,
    landsHere: (world: string, day: number) => `${world} se guarda aquí después del día ${day}`,
    beingBuilt: (day: number, total: number) => `Estás aquí · Día ${day} de ${total}`,
    freeInBeta: "Gratis en la beta",
    todayIs: (title: string) => `Hoy: ${title}`,
  },

  paths: {
    /** (Beta) Other life areas, locked until after the Money Clarity beta. */
    opensSoon: "Muy pronto",
    opensSoonToast: (area: string, path: string) => `${area} se abre muy pronto. Por ahora, es ${path}.`,
    continueToday: "Continúa la práctica de hoy",
  },

  day: {
    inYourWords: "En tus palabras",
    placeholder: "Con tus propias palabras…",
    onlyYou: "Esto solo lo ves tú.",
    lockIn: "Dejarlo así",
    gotIt: "Entendido",
    acceptContinue: "Aceptar y continuar",
    markDone: "Marcar como hecho",
    done: "Hecho ✓",
    needAMoment: "Necesito un momento",
    unpickFirst: "Primero quita otra",
    scaleLow: "Para nada",
    scaleHigh: "Por completo",
    saveMicro: "GUARDAR",
    lockMicro: "CERRAR",
    almostThere: (name: string) => `Ya casi, ${name}`,
    buildingThis: (name: string) => `Estás construyendo esto, ${name}`,
    open: "Abrir",
    atCap: (max: number) => `Con eso son ${max}. Quita una para elegir otra.`,
    pickUpTo: (max: number, chosen: number) =>
      `Elige hasta ${max} · ${chosen} ${chosen === 1 ? "elegida" : "elegidas"}`,
    /* ── Un día es una secuencia de pasos ─────────────────────────────────── */
    stepOf: (step: number, total: number) => `Paso ${step} de ${total}`,
    nextStep: "Siguiente",
    finishDay: "Terminar hoy",
    /** "Leyendo", no "pensando": describe lo que pasa del lado de la persona. */
    elaraThinking: "Elara está leyendo…",
  },

  complete: {
    shine: (name: string) => `Brilla, ${name}`,
    eyebrow: "Lo lograste",
    title: "Primer ciclo completo",
    quote:
      '"Tu claridad es una práctica, no un destino. Hoy construiste una base más firme."',
    seeClarity: "Ver tu mapa de claridad",
    choosePath: "Elegir otro camino",
    returnToday: "Volver a Hoy",
  },

  area: {
    eyebrow: "Tu camino personalizado",
    shapedPlan: {
      before: "Tu conversación con Elara dio forma a este ",
      highlight: "plan",
      after: ".",
    },
    step: (week: number, day: number, level: string) => `Semana ${week} · Día ${day} · ${level}`,
    dayStep: (day: number, level: string) => `Día ${day} · ${level}`,
    /** Un día ya recorrido. Al tocarlo se vuelve a abrir. */
    revisit: "Volver a hacer",
    doneA11y: (week: number, day: number) => `Semana ${week}, día ${day}, completo. Toca para volver a hacerlo.`,
    openA11y: (week: number, day: number) => `Semana ${week}, día ${day}. Toca para abrirlo.`,
    aheadA11y: (week: number, day: number) => `Semana ${week}, día ${day}, aún no disponible.`,
    lockedTitle: "Este camino es parte de Premium",
    lockedBody: "Tu membresía gratis incluye un camino. Premium abre los seis.",
    unlock: "Activar con Premium",
    startPath: "Empezar mi camino",
    continueDay: (week: number, day: number) => `Continuar · Semana ${week} · Día ${day}`,
  },

  /* Hoy (Opción B "Hoy" y el Final Pass, oct 2026). Copia propuesta por la
     clienta, pendiente de aprobación por María y Alejandra. */
  hoy: {
    intro: (minutes: number) => `Unos ${minutes} minutos.`,
    missed: (day: number) => `Tu día ${day} te espera. No se pierde nada.`,
    placeName: (name: string, country: string) => `${name}, ${country}`,
    placeLine: (place: string, week: number, day: number) => `${place} · Semana ${week} · Día ${day}`,
    placeWeek: (place: string, week: number, weeks: number) => `${place} · Semana ${week} de ${weeks}`,
    photoA11y: (place: string) => `Fotografía de ${place}.`,
    dayDone: (day: number) => `Día ${day} hecho`,
    weekDoneTitle: (place: string) => `Terminaste tu semana en ${place}.`,
    pathDoneTitle: "Recorriste todas las semanas de este camino.",
    opens: {
      dayTomorrow: (day: number, weekday: string) => `El día ${day} se abre mañana, ${weekday}.`,
      dayToday: (day: number, time: string) => `El día ${day} se abre hoy a las ${time}.`,
      dayOn: (day: number, weekday: string) => `El día ${day} se abre el ${weekday}.`,
      weekTomorrow: (week: number, place: string, weekday: string) => `La semana ${week}, ${place}, se abre mañana, ${weekday}.`,
      weekToday: (week: number, place: string, time: string) => `La semana ${week}, ${place}, se abre hoy a las ${time}.`,
      weekOn: (week: number, place: string, weekday: string) => `La semana ${week}, ${place}, se abre el ${weekday}.`,
    },
    entry: {
      start: (day: number) => `Empezar el día ${day}`,
      continue: (day: number) => `Seguir con el día ${day}`,
      stepHint: (step: number, total: number) => `Vas en el paso ${step} de ${total}. Guardamos lo que escribiste.`,
      review: "Ver lo que respondiste",
      week: (place: string) => `Ver tu semana en ${place}`,
    },
    week: {
      title: (place: string) => `Tu semana en ${place}`,
      count: (done: number, total: number) => `${done} de ${total}`,
      countA11y: (done: number, total: number) => `${done} de ${total} días hechos`,
      today: "Hoy",
      discDone: (day: number, keepsake: string) => `Día ${day}: hecho, ${keepsake}`,
      discToday: (day: number) => `Día ${day}: hoy`,
      discAhead: (day: number) => `Día ${day}: todavía no`,
      theme: (title: string) => `Esta semana: ${title}.`,
    },
    keepsakes: {
      wz: ["farol de papel", "puente de piedra", "barca de Wuzhen", "taza de té", "sombrilla de papel", "carpa koi", "rama de sauce"],
    },
    /**
     * Lo que se llevó (la sesión diaria, 3 nov 2026): arriba de Hoy cuando el
     * día está hecho, y bajo el día nuevo cuando hay uno. Solo sus palabras;
     * nunca un «Ninguna por ahora» ni una pregunta que pasó. Propuesta,
     * pendiente de María y Alejandra.
     */
    takeaway: {
      today: (day: number) => `Hoy te llevas · Día ${day}`,
      last: (day: number) => `La última vez anotaste · Día ${day}`,
      lastWeek: (week: number, day: number) => `La última vez anotaste · Semana ${week} · Día ${day}`,
      quoted: (text: string) => `«${text}»`,
      openHint: "Abre el cierre de ese día",
    },
    forToday: {
      title: "Para hoy",
      kinds: { video: "Película corta", article: "Guía", audio: "Nota de voz", worksheet: "Ejercicio", link: "Enlace" },
      whereTitle: "Ver dónde estás",
      whereMeta: "Tus seis áreas · 5 min",
      talkTitle: "Háblalo con Elara",
      talkMeta: "Pregúntale lo que quieras sobre hoy",
    },
  },
};

/**
 * Rachas e hitos. Todo se escribe como registro de lo que pasó, nunca como
 * puntuación ni como meta: no hay "sigue así", no hay "no la rompas", y un
 * reinicio nunca se cuenta como pérdida.
 */
export const milestones: Strings["milestones"] = {
  title: "Tu ritmo",
  subtitle: "Días en que apareciste. No es una nota: es un registro.",

  currentLabel: "Seguidos ahora",
  days: (n: number) => `${n} ${n === 1 ? "día" : "días"}`,
  noneYet: "Tu ritmo empieza la primera vez que te registras.",
  restarted: "Una racha nueva. Los días de antes siguen contando.",

  bestLabel: "Más días seguidos",
  totalLabel: "Días en total",

  ladder: "Hitos · días seguidos",
  reached: "Alcanzado",
  reachedAt: (n: number) => `${n} días seguidos`,
  next: "Siguiente",
  ahead: "Por delante",
  allReached: "Ya pasaste por todos.",

  cue: (n: number) => `Has vuelto ${n} ${n === 1 ? "día" : "días seguidos"}. Tu ritmo está aquí.`,
  cueA11y: (n: number) => `Has vuelto ${n} ${n === 1 ? "día" : "días seguidos"}. Abre tu ritmo.`,
  open: "Ver tu ritmo",
  loadError: "No se pudo cargar tu ritmo ahora mismo.",

  detailTitle: "Hito",
  headline: {
    3: "Tres días, tres momentos para ti.",
    7: "Siete días, siete momentos para ti.",
    14: "Catorce días, catorce momentos para ti.",
    30: "Treinta días, treinta momentos para ti.",
    60: "Sesenta días, sesenta momentos para ti.",
    100: "Cien días, cien momentos para ti.",
  },
  headlineFallback: (n: number) => `${n} días, ${n} momentos para ti.`,
  headlineNone: "Todo ritmo empieza con un solo día.",
  care: "Cada día que apareciste fue un acto deliberado de cuidado.",
  careNone: "Los días en que te registras se reúnen aquí, cuando lleguen.",
  progressLabel: "Progreso del hito",
  progressOf: (n: number) => `${n} de ${n} completados`,
  backToJourney: "Volver al recorrido",
};
