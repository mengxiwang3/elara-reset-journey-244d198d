// Elara · Dinero · Hacia el 10 (español, para María)
// Kit de prueba, tarjeta de la semana y semana 2. Propuesta: el español
// necesita la aprobación de María y Alejandra. build.mjs comprueba que tenga
// la misma forma que content-en.mjs.
//
// Página: { eye, title, sub?, parts: [...] }
// Partes: {h?, p} · {h?, ul} · {h?, table:{head, rows}, blank?} · {h?, msg, label}
//         · {phones:[{label, blocks}]} · {day7:true} (pantalla 4 del día 7 de la V3.2)
// Bloques de teléfono: los de la V3.2 y wcard {head, items:[[etiqueta, texto, grande?]], foot}

export const ui = {
  lang: "es",
  brand: "ELARA / CLARIDAD FINANCIERA",
  footer: "4 NOV 2026 / HACIA EL 10 / PARA MARÍA",
  note: "Nota",
  rule: "La regla de hoy",
  ruleMine: "Te llevas",
  elara: "Elara",
  tryLab: "Si quieres probarlo",
  tap: "Al tocar",
  supported: "(respuesta respaldada)",
  copy: "Para copiar",
  day7: "Día 7 · pantalla 4 (V3.2 actualizada)",
};

const rules = [
  "Antes de contar un dinero futuro, confirma cuándo llega.",
  "El dinero para un pago cercano no debería depender de que una inversión suba.",
  "Puedes querer ayudar y tomarte tiempo para ver lo que puedes asumir.",
  "Mira por separado el saldo, los cargos y el pago.",
  "La misma cantidad puede comprar menos si suben los precios.",
  "Ganancias altas, “sin riesgo” y prisa: para y comprueba antes de enviar dinero.",
];

export const pages = [
  {
    eye: "HACIA EL 10 / DINERO / PARA MARÍA",
    title: "Lo que falta para el 10 no está en el papel",
    sub: "La V3.2 está lista para probar. Lo que la llevaría a un 10 lo deciden ellas: si una regla les sirve fuera de la app y si vuelven el día 8. Aquí van tres piezas para llegar ahí.",
    parts: [
      {
        table: {
          head: ["Pieza", "Para qué", "Páginas"],
          rows: [
            ["Las inscripciones", "Qué dicen los formularios de la beta y qué cambia para la prueba.", "2"],
            ["Kit de prueba", "Probar la semana con 5-6 mujeres, en la app o por WhatsApp, empezando esta semana.", "3-6"],
            ["Tarjeta de la semana", "Que se lleve algo concreto fuera de la app.", "7"],
            ["Semana 2", "Que el día 7 lleve a algo y no termine en seco.", "8-10"],
          ],
        },
      },
      {
        h: "Lo que solo pueden hacer personas",
        ul: [
          "Probar y corregir. Una ronda con mujeres reales vale más que otra versión del documento.",
          "Que el español sea de María y Ale, y que Ale grabe los audios.",
          "Que alguien responda las preguntas que ellas escriben. Propuesta: Ale, sin nombres y con permiso, en un audio semanal.",
          "Montos, moneda y autoridad financiera de cada país.",
        ],
      },
      {
        h: "Archivo aparte",
        p: "«Mensajes_WhatsApp_Semana1_ES.txt»: los siete días de la V3.2 listos para copiar y pegar en WhatsApp, con la respuesta que corresponde a cada opción.",
      },
    ],
  },
  {
    eye: "LO QUE DICEN LAS INSCRIPCIONES",
    title: "162 inscritas, y la mayoría no eligió dinero",
    sub: "Datos de los dos formularios de la beta (ola 1: 147; ola 2: 15). Solo totales: este documento no copia nombres, correos, teléfonos ni respuestas personales.",
    parts: [
      {
        table: {
          head: ["Dato", "Ola 1", "Ola 2", "Total"],
          rows: [
            ["Eligieron «Claridad con dinero» primero", "31", "2", "33 (20 %)"],
            ["Mencionan dinero, también junto a otras áreas", "38", "2", "40 (25 %)"],
            ["Usan Android", "62", "6", "68 (42 %)"],
            ["Viven en Colombia (el grupo más grande)", "53", "5", "58 (36 %)"],
            ["Sí al grupo de WhatsApp", "121", "9", "130"],
            ["Sí a probar 7 días", "142", "14", "156"],
          ],
        },
      },
      {
        h: "Qué cambia para la prueba",
        ul: [
          "Elegir a las 5-6 entre las 40 que mencionaron dinero. En la ola 2 solo hay 2.",
          "La beta solo abre Dinero, pero 4 de cada 5 inscritas eligieron otra área primero (sobre todo propósito, rutina y confianza). Coincide con lo que ya oímos: hubo quien lo dejó porque solo había Dinero. Hay que decirlo en la invitación, o abrir su área.",
          "El 42 % usa Android. Si la app de prueba solo está para iPhone, la forma B (WhatsApp) es la manera de incluirlas.",
          "Colombia es el grupo más grande. Allí se dice «arriendo», no «alquiler», y los recibos son «los servicios». María decide si el español va con palabras de Colombia o neutras.",
        ],
      },
      {
        h: "Lo que buscan las que eligieron dinero (temas, sin citas)",
        ul: [
          "Su relación con el dinero y el merecimiento.",
          "Que no alcanza, y cómo ahorrar sin desperdiciar.",
          "Constancia para seguir sus gastos.",
          "Cambios de trabajo o de país, empezar de nuevo, más ingresos.",
          "Unir propósito y dinero; algunas, invertir.",
        ],
      },
      { p: "La semana 1 cubre «no alcanza», ahorrar e invertir. Faltan «relación con el dinero y merecimiento» y «más ingresos o cambio de trabajo»: candidatas para la semana 2, con la voz de Alejandra." },
    ],
  },
  {
    eye: "KIT DE PRUEBA / 1 DE 4",
    title: "Con quién y cómo",
    parts: [
      {
        h: "Quiénes",
        p: "5-6 mujeres de las 40 que mencionaron dinero al inscribirse, distintas entre sí: con ingresos fijos y variables, alguna sin ingresos ahora, con y sin deudas, que envían o no dinero a su familia, con iPhone y con Android. Mejor si no todas son cercanas a María: las amigas tienden a ser amables.",
      },
      {
        h: "Dos formas de hacerla",
        table: {
          head: ["Forma", "Cuándo", "Qué hace María"],
          rows: [
            ["A. En la app", "Cuando los devs carguen la V3.2.", "Envía tres mensajes de seguimiento y hace dos conversaciones."],
            ["B. Por WhatsApp", "Desde esta semana.", "Cada mañana envía el texto del día y responde con el texto preparado según lo que ella elija (archivo aparte)."],
          ],
        },
      },
      {
        p: "Ojo con la forma B: ellas hablan con María, y eso cambia la experiencia. Sirve para probar el contenido, no la app. Si con María gusta mucho más, eso también dice algo: la presencia de una persona importa.",
      },
      {
        h: "La semana",
        table: {
          head: ["Cuándo", "Qué pasa", "Tiempo de María"],
          rows: [
            ["Día 0", "Invitación, consentimiento y una conversación corta (2 preguntas).", "10 min por persona"],
            ["Días 1-7", "Ella hace un día por día, 3-4 minutos.", "Forma B: unos minutos al día"],
            ["Día 2, mañana", "«¿Recuerdas la regla de ayer?»", "1 mensaje"],
            ["Día 4, tarde", "«¿Hubo algo que te hiciera querer dejarlo?»", "1 mensaje"],
            ["Día 5, mañana", "«¿Recuerdas la regla de ayer?»", "1 mensaje"],
            ["Día 8", "Conversación de cierre (6 preguntas).", "15 min por persona"],
            ["Después", "Llenar la hoja de registro y decidir qué cambiar.", "1 hora"],
          ],
        },
      },
    ],
  },
  {
    eye: "KIT DE PRUEBA / 2 DE 4",
    title: "Mensajes listos para copiar",
    parts: [
      {
        label: "Invitación",
        msg: "Hola, [nombre]. Estamos probando en Elara unas prácticas cortas sobre dinero: 3-4 minutos al día durante una semana. Queremos saber qué te sirve y qué no, y tu opinión cambia lo que construimos. No necesitamos montos, capturas ni datos personales, y puedes dejarlo cuando quieras. ¿Te animas?",
      },
      {
        label: "Consentimiento",
        msg: "Antes de empezar: te haremos unas preguntas cortas por mensaje y dos conversaciones breves. No te pediremos montos, capturas ni datos de tus cuentas. Lo que nos cuentes se resume sin tu nombre. Nadie del equipo leerá lo que escribas dentro de la app para esta prueba. Puedes dejarlo cuando quieras, sin explicar por qué. ¿Estás de acuerdo?",
      },
      { p: "El equipo tiene que poder cumplir la frase «Nadie del equipo leerá lo que escribas dentro de la app». Si no puede, hay que quitarla antes de enviar." },
      { label: "Días 2 y 5, por la mañana", msg: "Buenos días, [nombre]. Antes de abrir Elara: ¿recuerdas la regla de ayer? Dímela con tus palabras. «No me acuerdo» también nos sirve." },
      { label: "Día 4, por la tarde", msg: "¿Cómo vas? ¿Hubo algo en estos días que te hiciera querer dejarlo? Cualquier respuesta nos ayuda." },
      { label: "Si deja de responder", msg: "Gracias por lo que hiciste. Si quieres contarnos en qué momento lo dejaste y qué estaba pasando, nos ayuda mucho. Si no, no pasa nada." },
    ],
  },
  {
    eye: "KIT DE PRUEBA / 3 DE 4",
    title: "Las preguntas exactas",
    parts: [
      {
        h: "Día 0: conversación corta (elegir 2)",
        ul: [
          "«Piensa en la última vez que tomaste o pospusiste una decisión de dinero. ¿Qué querías resolver y qué hiciste?»",
          "«Cuando abriste Elara, ¿qué esperabas que hiciera por ti?»",
          "«¿Qué palabra o idea sobre dinero te gustaría que alguien te explicara con un ejemplo?»",
        ],
      },
      {
        h: "Día 8: conversación de cierre",
        ul: [
          "«Sin mirar la app: ¿qué regla te llevas? Explícamela como se la explicarías a una amiga.»",
          "«¿Qué parte te aportó algo que no tenías claro antes? Si ninguna, ¿qué faltó?»",
          "«¿Probaste alguna idea fuera de la app? También vale que no.»",
          "«¿Sentiste que la app tomaba en cuenta lo que respondías? ¿En qué momento?»",
          "«¿Qué día volverías a abrir y cuál quitarías?»",
          "«Si hubiera una semana 2, ¿sobre qué te gustaría que fuera?»",
        ],
      },
      {
        h: "Cómo escuchar",
        p: "Pedir un ejemplo reciente. Aceptar «no sé». No completar la respuesta por ella ni corregirla. Si ya sabe algo, no es falta de interés: anotarlo y pensar en un nivel más alto.",
      },
      {
        h: "Cuidados",
        ul: [
          "María no da consejos financieros durante la prueba.",
          "Si alguien cuenta una deuda grave o una posible estafa: escuchar, no aconsejar, y sugerir su banco o la autoridad financiera de su país, como en el día 6.",
          "No copiar respuestas privadas en grupos ni documentos: resumir lo que se repite, sin nombres.",
        ],
      },
    ],
  },
  {
    eye: "KIT DE PRUEBA / 4 DE 4",
    title: "Hoja de registro y cómo decidir",
    sub: "Una fila por participante, sin nombre. «Recordó la regla»: sí, a medias o no.",
    parts: [
      {
        table: {
          head: ["", "Recordó la regla (día 2 / 5 / 8)", "¿Probó algo fuera?", "Se detuvo en", "Le sirvió", "Cambiaría", "Semana 2 sobre"],
          rows: [["P1"], ["P2"], ["P3"], ["P4"], ["P5"], ["P6"]],
        },
        blank: true,
      },
      {
        h: "Cómo decidir después",
        ul: [
          "Si 4 de 6 dicen la regla con sus palabras el día 8, la regla funciona. Si son 2 o menos, reescribir las reglas antes que nada.",
          "Si 2 o más se detienen el mismo día, revisar ese día primero.",
          "Si nadie probó nada fuera de la app, cambiar los «Si quieres probarlo».",
          "Si varias piden el mismo tema, la semana 2 empieza por ahí.",
          "Con 6 personas no hay estadística: esto sirve para encontrar problemas, no para demostrar resultados.",
        ],
      },
    ],
  },
  {
    eye: "TARJETA DE LA SEMANA",
    title: "Algo que llevarse fuera de la app",
    sub: "Después de guardar su regla en el día 7, puede ver una tarjeta con lo que eligió y guardarla como imagen en su teléfono.",
    parts: [
      {
        phones: [
          {
            label: "Si guardó cosas durante la semana",
            blocks: [
              {
                t: "wcard",
                head: "ELARA · DINERO · SEMANA 1",
                items: [
                  ["Mi regla", rules[0], true],
                  ["Mi frase", "Necesito revisar mis pagos antes de decirte una cantidad."],
                  ["También guardé", rules[3]],
                ],
                foot: "Mi semana con Elara",
              },
              { t: "buttons", x: ["Guardar imagen", "Compartir"] },
              { t: "chips", x: ["Elegir qué aparece"] },
            ],
          },
          {
            label: "Si no guardó nada",
            blocks: [
              {
                t: "wcard",
                head: "ELARA · DINERO · SEMANA 1",
                items: [
                  ["Mi regla", rules[1], true],
                  ["Las reglas de la semana", rules.filter((_, i) => i !== 1).join(" · ")],
                ],
                foot: "Mi semana con Elara",
              },
              { t: "buttons", x: ["Guardar imagen", "Compartir"] },
            ],
          },
        ],
      },
      {
        h: "Reglas de la tarjeta",
        ul: [
          "Ella elige qué aparece: cada línea se puede quitar antes de guardar.",
          "Nunca aparecen montos, nombres ni su pregunta pendiente.",
          "La imagen se crea en su teléfono. «Compartir» abre las opciones del teléfono; Elara no publica nada.",
          "Si no guardó nada, la tarjeta muestra la regla que eligió hoy y las demás reglas de la semana. Nunca queda vacía.",
          "Para los devs: la app ya tiene una tarjeta que se guarda en fotos y se comparte; esta puede usar la misma.",
        ],
      },
    ],
  },
  {
    eye: "SEMANA 2 / 1 DE 3",
    title: "El día 7 ya no termina en seco",
    sub: "La V3.2 está actualizada: al cerrar el día 7, ella elige qué quiere aprender, Elara le dice qué día llega su tema y le ofrece su tarjeta.",
    parts: [
      { day7: true },
      {
        h: "Por qué así",
        ul: [
          "La semana 2 tiene un orden fijo, como la 1: la app de hoy no cambia el orden según la persona.",
          "Su elección no reordena nada: le dice cuándo llega su tema. Es honesto y se puede construir hoy.",
          "Si elige invertir, Elara le recuerda que primero va el colchón: es la regla del día 2 de la semana 1.",
        ],
      },
    ],
  },
  {
    eye: "SEMANA 2 / 2 DE 3",
    title: "Siete días, siete reglas",
    sub: "Mismo formato que la semana 1: cuatro pantallas, una regla, un ejemplo con números comprobados y una idea opcional para probar. Esquema para que María elija temas y orden.",
    parts: [
      {
        table: {
          head: ["Día", "Tema", "La regla de hoy", "El ejemplo"],
          rows: [
            ["1", "Un colchón para imprevistos", "Un colchón empieza pequeño, con un para qué y un lugar aparte.", "Apartar US$10 por semana: en 18 semanas son US$180, un mes de alquiler de Ana."],
            ["2", "Más de una deuda: ¿cuál primero?", "Antes de decidir qué deuda pagar primero, compara cuánto interés cobra cada una.", "US$50 extra a una deuda al 40 % anual evitan unos US$20 de interés en un año; a una al 15 %, unos US$7,50."],
            ["3", "Una deuda que crece sobre lo que creció", "Una deuda sin pagar puede crecer sobre lo que ya creció.", "US$100 al 30 % anual sin pagar: US$130 en un año y US$169 en dos."],
            ["4", "Los cobros que se repiten solos", "Revisa los cobros que se repiten solos: lo pequeño, repetido, pesa.", "Tres cobros de US$8, US$10 y US$12 al mes son US$30 al mes: US$360 al año."],
            ["5", "De comprarle a una empresa a tener una parte", "Conocer el producto no es lo mismo que entender la acción.", "Una empresa ficticia: ¿qué parte compro y a qué precio? (texto de la V3)"],
            ["6", "Lo que una ganancia hace con el tiempo", "Si una ganancia se queda, el siguiente cálculo se hace sobre más.", "US$100 al 5 % anual durante 20 años: US$265 si la ganancia se queda; US$200 si no."],
            ["7", "Repaso y tarjeta de la semana 2", "La que ella elija.", "Dos preguntas de repaso (días 2 y 4) y su tarjeta."],
          ],
        },
      },
      { p: "Los porcentajes son ejemplos, no tasas reales de ningún país. Las cuentas de deuda usan interés anual simplificado; cada contrato calcula a su manera." },
    ],
  },
  {
    eye: "SEMANA 2 / 3 DE 3",
    title: "La pregunta de cada día y qué falta",
    parts: [
      {
        table: {
          head: ["Día", "Pregunta de la pantalla 2", "Respuesta respaldada", "Si quieres probarlo"],
          rows: [
            ["1", "Apartas US$10 por semana. ¿Cuántas semanas hasta US$180?", "18 semanas (10 × 18 = 180).", "Elige un lugar aparte para tu colchón, aunque empiece con poco."],
            ["2", "Tienes US$50 extra. Una deuda cobra 40 % al año y otra 15 %. ¿Dónde evitas más interés en un año?", "En la del 40 %: unos US$20, frente a US$7,50.", "Si tienes deudas, mira qué interés cobra cada una."],
            ["3", "US$100 al 30 % anual, sin pagar. ¿Cuánto al final del segundo año?", "US$169 (130 × 1,30).", "Busca en tu estado de cuenta si los intereses se suman al saldo."],
            ["4", "Tres cobros de US$8, US$10 y US$12 al mes. ¿Cuánto al año?", "US$360 (30 × 12).", "Mira el último mes y marca los cobros que se repiten solos."],
            ["5", "¿Qué pregunta mira la empresa como inversión?", "¿Qué parte compro y a qué precio?", "Piensa en una empresa que usas y escribe cómo crees que gana dinero."],
            ["6", "US$100 al 5 % durante 20 años. ¿Cuánto si la ganancia se queda?", "US$265 (frente a US$200 si no se queda).", "Ante una cifra de ganancias, pregunta: ¿en cuánto tiempo y con qué riesgo?"],
          ],
        },
      },
      {
        h: "Una respuesta importante del día 2",
        p: "Si toca «Prefiero pagar primero la más pequeña»: «También es una decisión válida: cerrar una deuda da ánimo. La de más interés suele costar menos con el tiempo; tú eliges.»",
      },
      {
        h: "Antes de construirla",
        ul: [
          "Hoy la semana 2 está cerrada para quien no tiene acceso de beta: es el bloqueo de la semana 2 que ya conocemos. Hay que resolverlo antes de que el día 7 la anuncie.",
          "María decide los temas y el orden. Si en la prueba piden otro tema, se cambia aquí.",
          "Todas las respuestas, escritas de antemano, como en la semana 1.",
        ],
      },
    ],
  },
];
