import type { PathCopy } from "../../en/paths";

export const money: PathCopy = {
  label: "DINERO",
  name: "Claridad financiera",
  areaName: "Claridad financiera",
  tagline: "Desenreda la presión y el peso mental que traes con el dinero.",
  days: [
    // ── Semana 1 · Mirar sin juzgar ──────────────────────────────────────────
    {
      level: "Mirar sin juzgar",
      title: "¿Qué te gustaría entender mejor sobre tu dinero ahora?",
      weekTitle: "Mirar sin juzgar",
      intro: {
        title: "Mirar sin juzgar",
        note: "Cada pregunta es opcional, y nada aquí te pide contactar a nadie, gastar dinero ni compartir.",
      },
      payoff: "Para llevarte esta semana: una descripción de la situación y datos pendientes.",
      steps: {
        ask: {
          title: "¿Qué te gustaría entender mejor sobre tu dinero ahora?",
          body: "Elige una.",
          options: [
            "Lo que gano",
            "Cuándo llega",
            "Lo que necesito pagar",
            "Mis deudas",
            "Mi independencia",
            "Otra cosa",
          ],
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Elegiste «{ask}». Escribe una pregunta sobre eso que te gustaría poder responder.",
          bodyFallback: "Escribe una pregunta sobre tu dinero que te gustaría poder responder.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Mirar sin juzgar",
      title: "¿Cómo entra el dinero en tu vida actualmente?",
      steps: {
        ask: {
          title: "¿Cómo entra el dinero en tu vida actualmente?",
          body: "Elige las que encajen. También puedes no elegir ninguna.",
          options: [
            "Trabajo",
            "Clientes o ventas",
            "Apoyo de otras personas",
            "Ayudas o prestaciones",
            "Otra fuente",
            "Ahora no entra",
          ],
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Marca qué ingreso es confirmado y cuál es incierto; no sumes promesas como si ya hubieran llegado.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Mirar sin juzgar",
      title: "¿Qué pagos necesitas tener presentes antes de que vuelva a entrar dinero?",
      steps: {
        ask: {
          title: "¿Qué pagos necesitas tener presentes antes de que vuelva a entrar dinero?",
          body: "Anota hasta tres conceptos; las cantidades son opcionales.",
          fields: ["Concepto 1", "Concepto 2", "Concepto 3"],
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Añade una fecha conocida o «por confirmar» junto a cada pago.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Mirar sin juzgar",
      title: "¿Qué describe mejor lo que pasa entre tus ingresos y lo necesario?",
      steps: {
        ask: {
          title: "¿Qué describe mejor lo que pasa entre tus ingresos y lo necesario?",
          body: "Elige una.",
          options: [
            "Alcanza y queda algo",
            "Alcanza justo",
            "No alcanza",
            "Cambia cada vez",
            "No tengo ingresos ahora",
            "Aún no lo sé",
          ],
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Dijiste «{ask|lower}». ¿Qué parte de eso te gustaría entender mejor?",
          bodyFallback: "¿Qué parte de lo que pasa entre tus ingresos y lo necesario te gustaría entender mejor?",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Mirar sin juzgar",
      title: "¿Qué información te falta para entender un pago o un ingreso?",
      steps: {
        ask: {
          title: "¿Qué información te falta para entender un pago o un ingreso?",
          body: "Puede ser fecha, importe, frecuencia o quién lo confirma. No subas documentos.",
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "¿Quién podría confirmártelo? Escribe la pregunta que le harías.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Mirar sin juzgar",
      title: "¿Cómo dibujarías el recorrido del dinero que entra y sale?",
      steps: {
        ask: {
          title: "¿Cómo dibujarías el recorrido del dinero que entra y sale?",
          body: "Usa flechas y categorías, sin datos de cuentas. También puedes escribir una lista.",
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Rodea un punto donde falte información; ese será un posible siguiente paso.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Mirar sin juzgar",
      title: "¿Qué sabes ahora sobre tu dinero que quieres tener a mano?",
      nextWeekTitle: "Ingresos y posibilidades",
      letter: "Esta semana fue sobre «Mirar sin juzgar». Lo que escribiste para conservar: «{d7.ask}». Es tuyo para reutilizar, cambiar o dejar. La semana que viene: Ingresos y posibilidades.",
      letterFallback: "Esta semana fue sobre «Mirar sin juzgar». Lo que respondiste, omitiste o dejaste para después sigue siendo tuyo: nada de aquí es una calificación. La semana que viene: Ingresos y posibilidades.",
      steps: {
        ask: {
          title: "¿Qué sabes ahora sobre tu dinero que quieres tener a mano?",
          body: "Una frase sobre tu situación, sin juzgarte ni prometer cambios.",
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Conserva tu frase junto a un dato pendiente, sin convertirlo en una promesa.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    // ── Semana 2 · Ingresos y posibilidades ──────────────────────────────────
    {
      level: "Ingresos y posibilidades",
      title: "¿Qué parte de tus ingresos te gustaría explorar primero?",
      weekTitle: "Ingresos y posibilidades",
      intro: {
        title: "Ingresos y posibilidades",
        note: "Cada pregunta es opcional, y nada aquí te pide contactar a nadie, gastar dinero ni compartir.",
      },
      payoff: "Para llevarte esta semana: un criterio de oportunidad y una pregunta verificable.",
      // La sesión diaria (3 nov 2026): propuesta pendiente de María y Alejandra.
      purpose: "Hoy eliges por dónde empezar a mirar tus ingresos y lo conviertes en algo concreto para averiguar.",
      steps: {
        ask: {
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
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
          card: { label: "Tu elección" },
        },
        take: {
          title: "Para llevarte",
          body: "¿Qué podrías averiguar sobre esta opción? Escribe una pregunta o un pequeño paso.",
          bodyFallback:
            "¿Hay algo sobre tus ingresos que te gustaría entender mejor? Si quieres, escríbelo como una pregunta o un pequeño paso.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
          card: { label: "Para llevarte", hint: "Una pregunta o un pequeño paso" },
        },
      },
    },
    {
      level: "Ingresos y posibilidades",
      title: "¿Qué sabes hacer que podría servir en una oportunidad que te interesa?",
      // La sesión diaria (3 nov 2026): propuesta pendiente de María y Alejandra.
      purpose: "Hoy buscas en lo que ya sabes hacer un ejemplo concreto y lo conviertes en una frase que podrías usar.",
      steps: {
        ask: {
          title: "¿Qué sabes hacer que podría servir en una oportunidad que te interesa?",
          body: "Menciona un ejemplo concreto, también de experiencia informal.",
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
          card: { label: "Lo que sabes hacer" },
        },
        take: {
          title: "Para llevarte",
          body: "Convierte tu ejemplo en una línea que podrías usar para describir tu experiencia.",
          // Propuesta del 3 nov 2026, pendiente de aprobación (María, Alejandra):
          // cuando la primera pregunta se pasó o no dejó un ejemplo.
          bodyFallback:
            "Piensa en algo que sabes hacer, también en casa o en un trabajo informal, y escríbelo en una frase sobre tu experiencia.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
          card: { label: "Para llevarte", hint: "Una frase sobre tu experiencia" },
        },
      },
    },
    {
      level: "Ingresos y posibilidades",
      title: "¿Qué condiciones tendría que respetar una oportunidad para que fuera viable?",
      steps: {
        ask: {
          title: "¿Qué condiciones tendría que respetar una oportunidad para que fuera viable?",
          body: "Elige las que encajen. También puedes no elegir ninguna.",
          options: [
            "Horario",
            "Cuidados",
            "Transporte",
            "Acceso a internet",
            "No pagar por adelantado",
            "Otra condición",
          ],
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Señala una condición imprescindible antes de dedicar tiempo a una oferta.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Ingresos y posibilidades",
      title: "¿Qué dato real podrías comprobar sobre una oportunidad antes de dedicarle tiempo?",
      steps: {
        ask: {
          title: "¿Qué dato real podrías comprobar sobre una oportunidad antes de dedicarle tiempo?",
          body: "Por ejemplo: tareas, horario, requisitos o remuneración publicada. Comprobarlo es opcional.",
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Anota dónde comprobarías el dato y qué sigue sin verificarse.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Ingresos y posibilidades",
      title: "¿Qué frase podrías usar para pedir información sobre trabajo, precio o un pago pendiente?",
      steps: {
        ask: {
          title: "¿Qué frase podrías usar para pedir información sobre trabajo, precio o un pago pendiente?",
          body: "Borrador privado: «Quisiera confirmar ___». No hace falta enviarlo.",
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Guarda el borrador; revisa que pida un dato concreto y no incluya información sensible.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Ingresos y posibilidades",
      title: "¿Qué señal te haría detenerte y comprobar mejor una oferta?",
      steps: {
        ask: {
          title: "¿Qué señal te haría detenerte y comprobar mejor una oferta?",
          body: "Elige una.",
          options: [
            "Me piden pagar primero",
            "Prometen ganancias seguras",
            "No explican las tareas",
            "Piden datos sensibles muy pronto",
            "Me presionan para decidir",
            "Otra señal",
          ],
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Cuando notes «{ask|lower}», ¿qué comprobarías antes de seguir? Una señal sola no demuestra un fraude.",
          bodyFallback: "Cuando una oferta te haga dudar, ¿qué comprobarías antes de seguir? Una señal sola no demuestra un fraude.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Ingresos y posibilidades",
      title: "¿Qué opción de ingresos merece una pequeña comprobación más, si alguna?",
      nextWeekTitle: "Decidir con información",
      letter: "Esta semana fue sobre «Ingresos y posibilidades». Lo que escribiste para conservar: «{d14.ask}». Es tuyo para reutilizar, cambiar o dejar. La semana que viene: Decidir con información.",
      letterFallback: "Esta semana fue sobre «Ingresos y posibilidades». Lo que respondiste, omitiste o dejaste para después sigue siendo tuyo: nada de aquí es una calificación. La semana que viene: Decidir con información.",
      steps: {
        ask: {
          title: "¿Qué opción de ingresos merece una pequeña comprobación más, si alguna?",
          body: "Elige una opción y un dato pendiente. «Ninguna por ahora» también vale.",
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Define una comprobación que puedas hacer sin pagar ni compartir datos sensibles.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    // ── Semana 3 · Decidir con información ───────────────────────────────────
    {
      level: "Decidir con información",
      title: "¿Qué gasto reciente te gustaría comprender mejor, sin decidir todavía si cambiarlo?",
      weekTitle: "Decidir con información",
      intro: {
        title: "Decidir con información",
        note: "Cada pregunta es opcional, y nada aquí te pide contactar a nadie, gastar dinero ni compartir.",
      },
      payoff: "Para llevarte esta semana: una pregunta sobre obligaciones y un criterio de decisión.",
      steps: {
        ask: {
          title: "¿Qué gasto reciente te gustaría comprender mejor, sin decidir todavía si cambiarlo?",
          body: "Puedes describir para qué sirvió sin indicar el importe.",
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Pon nombre a la necesidad que cubrió el gasto antes de juzgarlo.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Decidir con información",
      title: "¿Qué función cumplió ese gasto, o uno que recuerdes?",
      steps: {
        ask: {
          title: "¿Qué función cumplió ese gasto, o uno que recuerdes?",
          body: "Elige una.",
          options: [
            "Algo básico",
            "Trabajo o cuidados",
            "Disfrute",
            "Un imprevisto",
            "Un compromiso con alguien",
            "Otra función",
          ],
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Dijiste que fue «{ask|lower}». ¿Esa necesidad seguirá ahí la próxima vez?",
          bodyFallback: "¿La necesidad detrás de ese gasto seguirá ahí la próxima vez?",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Decidir con información",
      title: "¿Qué pago repetido te gustaría revisar para entender qué incluye?",
      steps: {
        ask: {
          title: "¿Qué pago repetido te gustaría revisar para entender qué incluye?",
          body: "Anota el concepto y lo que no está claro. No implica cancelarlo.",
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Busca o deja anotado dónde ver el concepto y las condiciones; no canceles por impulso.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Decidir con información",
      title: "¿Qué dato necesitas aclarar sobre una deuda u obligación, si tienes alguna?",
      steps: {
        ask: {
          title: "¿Qué dato necesitas aclarar sobre una deuda u obligación, si tienes alguna?",
          body: "Elige una.",
          options: [
            "Saldo",
            "Fecha",
            "Cuota",
            "Intereses o cargos",
            "Condiciones",
            "No aplica",
          ],
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Prepara una pregunta sobre el dato elegido; si no aplica, marca «sin deuda que revisar».",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Decidir con información",
      title: "¿Qué pesa más cuando decides ayudar económicamente a alguien?",
      steps: {
        ask: {
          title: "¿Qué pesa más cuando decides ayudar económicamente a alguien?",
          body: "Elige una.",
          options: [
            "Lo básico que debo cubrir",
            "Un acuerdo previo",
            "El deseo de ayudar",
            "La presión que siento",
            "No poder decidir libremente",
            "No aplica u otra cosa",
          ],
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Escribe qué necesitarías saber antes de comprometer dinero; no hace falta confrontar a nadie.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Decidir con información",
      title: "¿Qué frase te ayudaría a ganar tiempo antes de aceptar un compromiso de dinero?",
      steps: {
        ask: {
          title: "¿Qué frase te ayudaría a ganar tiempo antes de aceptar un compromiso de dinero?",
          body: "Por ejemplo: «Necesito revisar lo que puedo asumir». Solo si es seguro decirlo.",
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Deja la frase disponible como borrador privado.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Decidir con información",
      title: "¿Qué criterio quieres recordar la próxima vez que tomes una decisión de dinero?",
      nextWeekTitle: "Un intento concreto",
      letter: "Esta semana fue sobre «Decidir con información». Lo que escribiste para conservar: «{d21.ask}». Es tuyo para reutilizar, cambiar o dejar. La semana que viene: Un intento concreto.",
      letterFallback: "Esta semana fue sobre «Decidir con información». Lo que respondiste, omitiste o dejaste para después sigue siendo tuyo: nada de aquí es una calificación. La semana que viene: Un intento concreto.",
      steps: {
        ask: {
          title: "¿Qué criterio quieres recordar la próxima vez que tomes una decisión de dinero?",
          body: "Algo específico: comprobar una fecha, preguntar el coste total o revisar lo básico.",
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Reduce tu criterio a una comprobación breve que puedas recordar.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    // ── Semana 4 · Un intento concreto ───────────────────────────────────────
    {
      level: "Un intento concreto",
      title: "¿Qué tarea pequeña te ayudaría a tener más claridad esta semana?",
      weekTitle: "Un intento concreto",
      intro: {
        title: "Un intento concreto",
        note: "Cada pregunta es opcional, y nada aquí te pide contactar a nadie, gastar dinero ni compartir.",
      },
      payoff: "Para llevarte esta semana: una tarea acotada, su resultado o la barrera real.",
      steps: {
        ask: {
          title: "¿Qué tarea pequeña te ayudaría a tener más claridad esta semana?",
          body: "Elige una.",
          options: [
            "Confirmar un ingreso",
            "Aclarar un pago",
            "Revisar una oportunidad",
            "Ordenar mis notas",
            "Pedir información",
            "Dejarlo por ahora",
          ],
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Elegiste «{ask}». Después, ¿qué anotarías sobre eso? Basta un dato, una respuesta o una nota corta.",
          bodyFallback: "Después de una tarea pequeña, ¿qué anotarías sobre ella? Basta un dato, una respuesta o una nota corta.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Un intento concreto",
      title: "¿Qué versión de esa tarea cabe en el tiempo y los recursos que tienes?",
      steps: {
        ask: {
          title: "¿Qué versión de esa tarea cabe en el tiempo y los recursos que tienes?",
          body: "Si no elegiste tarea, puedes nombrar qué necesitarías antes de elegir una.",
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "¿Cuál es el primer paso? Si te falta algo para darlo, nómbralo.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Un intento concreto",
      title: "¿Qué recordatorio te ayudaría a retomar tu tarea sin tener que empezar a pensarla de nuevo?",
      steps: {
        ask: {
          title: "¿Qué recordatorio te ayudaría a retomar tu tarea sin tener que empezar a pensarla de nuevo?",
          body: "Opcional: foto de una nota sin nombres, importes ni datos. Nunca cuentas, tarjetas o documentos.",
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Crea un recordatorio sin datos financieros, en foto o texto.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Un intento concreto",
      title: "¿Qué describe mejor cómo va tu tarea?",
      steps: {
        ask: {
          title: "¿Qué describe mejor cómo va tu tarea?",
          body: "Elige una.",
          options: [
            "La hice",
            "Hice una parte",
            "Aún no",
            "Necesito cambiarla",
            "La dejé por ahora",
            "No elegí una",
          ],
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Dijiste «{ask|lower}». ¿Qué es lo siguiente que necesitarías saber? También puedes escribir que lo dejas aquí por ahora.",
          bodyFallback: "¿Qué es lo siguiente que necesitarías saber sobre tu tarea? También puedes escribir que lo dejas aquí por ahora.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Un intento concreto",
      title: "¿Qué aprendiste al intentar la tarea, o qué impidió que fuera posible?",
      steps: {
        ask: {
          title: "¿Qué aprendiste al intentar la tarea, o qué impidió que fuera posible?",
          body: "Cuenta un hecho, sin evaluar tu disciplina.",
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Escribe qué pasó y, aparte, qué lo hizo difícil. Que no te respondieran no significa que lo hiciste mal.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Un intento concreto",
      title: "¿Qué conviene ajustar en el siguiente intento, si quieres hacer uno?",
      steps: {
        ask: {
          title: "¿Qué conviene ajustar en el siguiente intento, si quieres hacer uno?",
          body: "Elige una.",
          options: [
            "Hacerlo más pequeño",
            "Buscar otra fuente",
            "Elegir otro momento",
            "Pedir apoyo",
            "Cambiar de tarea",
            "No seguir por ahora",
          ],
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Elegiste «{ask|lower}». ¿Cómo se vería la próxima vez? Si lo dejas, escribe qué queda pendiente.",
          bodyFallback: "¿Qué cambio harías la próxima vez? Si lo dejas, escribe qué queda pendiente.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Un intento concreto",
      title: "¿Qué información o herramienta de esta semana te resulta útil conservar?",
      nextWeekTitle: "Una claridad que continúa",
      letter: "Esta semana fue sobre «Un intento concreto». Lo que escribiste para conservar: «{d28.ask}». Es tuyo para reutilizar, cambiar o dejar. La semana que viene: Una claridad que continúa.",
      letterFallback: "Esta semana fue sobre «Un intento concreto». Lo que respondiste, omitiste o dejaste para después sigue siendo tuyo: nada de aquí es una calificación. La semana que viene: Una claridad que continúa.",
      steps: {
        ask: {
          title: "¿Qué información o herramienta de esta semana te resulta útil conservar?",
          body: "Puede ser una fecha confirmada, una pregunta o una frase. No hace falta haber terminado la tarea.",
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Pon un título claro a lo que conservarás para encontrarlo después.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    // ── Semana 5 · Una claridad que continúa ─────────────────────────────────
    {
      level: "Una claridad que continúa",
      title: "¿Qué ha cambiado en tu comprensión del dinero, aunque los ingresos sigan igual?",
      weekTitle: "Una claridad que continúa",
      intro: {
        title: "Una claridad que continúa",
        note: "Cada pregunta es opcional, y nada aquí te pide contactar a nadie, gastar dinero ni compartir.",
      },
      payoff: "Para llevarte esta semana: una nota de situación y una revisión opcional.",
      steps: {
        ask: {
          title: "¿Qué ha cambiado en tu comprensión del dinero, aunque los ingresos sigan igual?",
          body: "También puedes escribir «Nada todavía».",
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Compara una duda inicial con lo que sabes ahora; «sigue abierta» cuenta.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Una claridad que continúa",
      title: "¿Qué te ayudaría a orientarte en una semana con menos ingresos de lo esperado?",
      steps: {
        ask: {
          title: "¿Qué te ayudaría a orientarte en una semana con menos ingresos de lo esperado?",
          body: "Elige las que encajen. También puedes no elegir ninguna.",
          options: [
            "Ver fechas y pagos",
            "Confirmar lo que entrará",
            "Conocer apoyos",
            "Pedir aclaraciones",
            "Revisar un acuerdo",
            "Otra cosa",
          ],
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Deja una lista de dos datos que revisarías primero, sin imponer recortes.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Una claridad que continúa",
      title: "¿Qué te gustaría poder decidir con más información o autonomía?",
      steps: {
        ask: {
          title: "¿Qué te gustaría poder decidir con más información o autonomía?",
          body: "No hace falta cambiar acuerdos ni hablar con nadie hoy.",
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Anota una información que aumentaría tu margen para esa decisión.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Una claridad que continúa",
      title: "¿Qué apoyo o información podría ayudarte con algo que sigue pendiente?",
      steps: {
        ask: {
          title: "¿Qué apoyo o información podría ayudarte con algo que sigue pendiente?",
          body: "Nombra el tipo de ayuda; no necesitas datos de contacto ni buscarla ahora.",
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Escribe una pregunta que llevarías a una fuente de apoyo adecuada a tu situación.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Una claridad que continúa",
      title: "¿Qué revisión breve de tu dinero sería útil repetir?",
      steps: {
        ask: {
          title: "¿Qué revisión breve de tu dinero sería útil repetir?",
          body: "Elige una.",
          options: [
            "Fechas de ingreso",
            "Próximos pagos",
            "Una deuda u obligación",
            "Oportunidades o cobros",
            "Mis acuerdos",
            "Ninguna por ahora",
          ],
          elara: "Anotado. Nada de esto tiene que ser perfecto.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Define qué mirarías en esa revisión y cuándo darla por terminada.",
          elara: "Sea lo que sea que escribiste, puedes volver a ello.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Una claridad que continúa",
      title: "¿Cuándo te serviría volver a mirar tu situación?",
      steps: {
        ask: {
          title: "¿Cuándo te serviría volver a mirar tu situación?",
          body: "Puedes nombrar un momento o evento. Esto no crea un recordatorio.",
          elara: "Gracias. Con eso basta para trabajar.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Si te sirve, anota ese momento en tu propio calendario; la app no lo programará aquí.",
          elara: "Es tuyo para conservar, cambiar o dejar.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
    {
      level: "Una claridad que continúa",
      title: "¿Qué quieres incluir en tu nota de claridad financiera?",
      letter: "Esta semana fue sobre «Una claridad que continúa». Lo que escribiste para conservar: «{d35.ask}». Es tuyo para reutilizar, cambiar o dejar. Ese es todo el camino. Cualquier día sigue ahí si quieres volver a él.",
      letterFallback: "Esta semana fue sobre «Una claridad que continúa». Lo que respondiste, omitiste o dejaste para después sigue siendo tuyo: nada de aquí es una calificación. Ese es todo el camino. Cualquier día sigue ahí si quieres volver a él.",
      steps: {
        ask: {
          title: "¿Qué quieres incluir en tu nota de claridad financiera?",
          body: "Completa solo las líneas que quieras.",
          fields: ["Ahora sé…", "Sigue pendiente…", "Mi próximo paso, si lo hay…"],
          elara: "Eso ayuda. Puedes cambiarlo cuando quieras.",
          skipLabel: "Prefiero pasar",
        },
        take: {
          title: "Para llevarte",
          body: "Revisa que tu nota distinga hechos, dudas y un paso opcional.",
          elara: "Algo pequeño y claro es suficiente. Se queda contigo.",
          skipLabel: "Prefiero pasar",
        },
      },
    },
  ],
};
