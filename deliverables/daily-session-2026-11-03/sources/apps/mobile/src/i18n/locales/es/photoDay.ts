import type { Strings } from "../../types";

/**
 * El día que se camina en un lugar (prototipo «Money Journey», oct. 2026): las
 * palabras que la franja de la foto suma alrededor de las preguntas. Los
 * nombres de los lugares y sus paradas son del globo (`t.globe`).
 */
export const photoDay: Strings["photoDay"] = {
  start: "Empezar",
  done: "Listo por hoy",
  seeWhere: "Ver por dónde caminé",
  tomorrow: (toward: string) => `Mañana, ${toward.charAt(0).toLowerCase()}${toward.slice(1)}.`,
  whereA11yOpen: "Ocultar dónde es esto",
  placeCountry: (place: string, country: string) => `${place}, ${country}`,
  sceneA11y: (place: string, stop: string) => `Fotografía de ${place}: ${stop.charAt(0).toLowerCase()}${stop.slice(1)}`,
  weekLine: (area: string, week: number, title: string | null) => (title ? `${area} · Semana ${week} · ${title}` : `${area} · Semana ${week}`),
  kept: "Seguiste cuidando, y se sostuvo.",
  shifted: "Lo que cambió",
  shiftedNone: "Nada escrito esta semana. Está bien.",
  nextWeek: "Próxima semana",
  opensTomorrow: (place: string) => `${place} se abre mañana.`,
  open: (place: string) => `${place} ya te espera.`,
  /**
   * La sesión diaria (3 nov 2026): la apertura con su propósito, la tarjeta
   * de lo que se lleva y el cierre. Propuesta, pendiente de María y Alejandra.
   */
  session: {
    minutes: (n: number) => `Unos ${n} minutos`,
    whyToday: "Por qué hoy",
    takeAway: "Hoy te llevas",
    weekNote: (week: number, title: string) => `Semana ${week} · ${title}`,
    lastTime: "La última vez anotaste",
    lastDay: (day: number) => `Día ${day}`,
    lastWeekDay: (week: number, day: number) => `Semana ${week} · Día ${day}`,
    change: "Cambiar",
    changeA11y: (label: string, value: string) => `${label}: ${value}. Cambiar`,
    changedChoice: "Cambiaste tu elección. Revisa si lo que escribiste sigue encajando.",
    // Propuesta (3 nov 2026), pendiente de aprobación (María, Alejandra).
    calmDone: "Hoy queda hecho, tal como lo dejaste.",
    skipped: "Pasaste esta pregunta",
    noNote: "Sin nota por hoy",
    edit: "Editar",
    editA11y: (label: string) => `Editar ${label.toLowerCase()}`,
    tomorrow: (question: string) => `Mañana: ${question}`,
    askNote: "Pedir la nota de Elara",
    askNoteFailed: "La nota de Elara no llegó. Lo que escribiste sigue guardado.",
    emptySlotA11y: (label: string, hint: string) => `${label}: todavía vacío. ${hint}`,
  },
};
