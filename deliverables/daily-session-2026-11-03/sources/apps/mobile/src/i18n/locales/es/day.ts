import type { Strings } from "../../types";

/** Un día de práctica dentro de un mundo. Borrador en español para revisión nativa. */
export const day: Strings["day"] = {
  placeDay: (world: string, day: number) => `${world} · Día ${day}`,
  todayLead: (toward: string, day: number) => `${toward} · Día ${day}`,
  areaWeek: (area: string, week: number) => `${area} · Semana ${week}`,

  worlds: {
    "mist-meadow": {
      poster: "Siete días de mirar sin juzgar. En algún lugar, más adelante, un claro.",
      enter: "Siete días. Un claro, en algún lugar más adelante.",
    },
  },

  sceneA11y: "El prado. Toca para pasar a la siguiente pregunta.",
  nextA11y: "Pasar a la siguiente pregunta",

  enter: {
    begin: "Empezar",
    beginA11y: (world: string) => `Empezar ${world}`,
  },

  arrival: {
    line: (at: string) => `${at}.`,
    tomorrow: (toward: string) => `Mañana, ${toward.toLowerCase()}. Ya está dibujado a lápiz, más adelante.`,
    done: "Listo por hoy",
    again: "Volver a hacer este día",
    redoDone: "Listo",
    redoNext: (index: number) => `Seguir con el Día ${index}`,
    redoBackToWeek: "Volver a la semana",
    announce: (at: string, day: number, total: number, toward: string | null) =>
      toward
        ? `${at}. Día ${day} de ${total} completo. Mañana, ${toward.toLowerCase()}.`
        : `${at}. Día ${day} de ${total} completo.`,
  },

  return: {
    back: (at: string) => {
      const place = `${at.charAt(0).toLowerCase()}${at.slice(1)}`;
      // PROPUESTA (beta-fixes 3 nov, pendiente de revisión nativa): con la parada
      // genérica «La vuelta» la línea decía «De vuelta en la vuelta.».
      return /\bvuelta\b/.test(place) ? `De nuevo ${place}.` : `De vuelta ${place}.`;
    },
    away: "Tu camino sigue aquí.",
    reduced: (line: string, toward: string) => `${line} ${toward}.`,
  },

  week: {
    found: "Encontraste el claro.",
    revealed: (world: string) => `Revelaste ${world}.`,
    ruleWhere: (at: string, date: string) => `Tu regla, guardada ${at.charAt(0).toLowerCase()}${at.slice(1)} · ${date}`,
    nextStep: (step: string) => `Tu próximo paso: “${step}”`,
    seeAtlas: "Verlo en tu Atlas",
    nextWorld: "Conocer el siguiente mundo",
    announce: (world: string, completion: string) => `Revelaste ${world}. ${completion} Ahora está en tu Atlas.`,
  },

  horizon: {
    ahead: (world: string) => `Más adelante: ${world}.`,
    open: (world: string) => `${world} ya se abrió.`,
    done: "Listo por hoy",
    lines: {
      "celestial-night": "Elegir es navegar. Cada noche, una estrella para orientarte.",
    },
    carried: {
      "reed-island": (from: string) => `La estrella dorada de ${from} viene contigo, atada junto a la pasarela.`,
      "guadua-roots": (from: string) => `La barca de juncos de ${from} viene también, varada en la orilla.`,
      "the-overlook": (from: string) => `De ${from} te llevas un trozo de guadua como bastón.`,
    } as Record<string, ((from: string) => string) | undefined>,
  },

  saving: "Guardando tu lugar",

  engine: {
    states: {
      unsure: "No estoy segura",
      none: "Ninguna por ahora",
      notNow: "Ahora no",
      skipped: "Prefiero no responder",
    },
    stateA11y: (label: string) => `Responder «${label}» a esta pregunta`,
    saved: {
      unsure: "Dijiste que no estabas segura.",
      none: "Dijiste que por ahora no hay ninguna.",
      notNow: "Lo dejaste para más tarde.",
      skipped: "Elegiste no responder esto.",
      declined: "Elegiste no hacer esto hoy.",
    },
    decline: "Prefiero no hacerlo hoy",
    declineA11y: "Terminar la práctica de hoy sin responder. El día contará como terminado.",
    hidden: {
      yourAnswer: "Tu respuesta",
      showWrote: "Mostrar lo que escribiste",
      showChose: "Mostrar lo que elegiste",
      hide: "Ocultar",
      hideA11y: "Volver a ocultar tu respuesta",
      revealed: "Tu respuesta está visible",
      concealed: "Tu respuesta está oculta",
      useAsStart: "Empezar desde aquí",
      held: "Tu respuesta anterior está oculta. Tú eliges cuándo verla.",
    },
  },
};
