// Elara · Dinero · V2.2 · español (propuesta; pendiente de María y Alejandra)
// Fuente única del PDF en español. build.mjs comprueba que tenga la misma
// forma que content-en.mjs.

export const labels = {
  lang: "es",
  brand: "ELARA / CLARIDAD FINANCIERA",
  footer: "4 NOV 2026 / BORRADOR EDITORIAL PARA MARÍA / V2.2",
  entry: "1 / La entrada",
  listen: "2 / Escucha o lee (guion completo)",
  check: "3 / Comprueba una idea",
  explore: "3 / Explora y mira qué cambia",
  steps: "3 / Tu nota y un siguiente paso",
  apply: "4 / Hazlo tuyo",
  deeper: "«Quiero pensarlo un poco más»: una rama según lo que eligió",
  close: "5 / El cierre",
  rule: "La regla de hoy",
  keep: "Te llevas",
  tomorrow: "Mañana",
  ifBack: "Si vuelve o saltó algo",
  media: "Medio y entrega",
  changed: "Qué cambió desde V2.1",
  review: "María: qué revisar aquí",
  connEyebrow: "CONEXIÓN Y CIERRE",
  connTitle: "Lo que hace suyo",
  other: "Si elige «Otra» y escribe, Elara responde:",
  supported: "Idea respaldada",
  checkNote:
    "Solo en el documento: «Idea respaldada» orienta la revisión. No mostrarla antes de que responda. «Prefiero pasar» permite leer la explicación o seguir.",
  exploreNote:
    "No hay opción ganadora: cada elección muestra su consecuencia. «Prefiero pasar» permite leer la explicación o seguir.",
};

export const cover = {
  eyebrow: "PILOTO / VERSIÓN 2.2 / PARA REVISIÓN",
  title: ["Tu dinero.", "Algo que entiendes y puedes usar."],
  sub: "7 sesiones con guiones, respuestas escritas y una regla clara por sesión. Propuesta para revisar: el español necesita la aprobación de María y Alejandra.",
  hook: "Desde la primera visita: aprender algo sobre el dinero y quedarte con una regla que puedes usar.",
  length:
    "Duración propuesta: 3-4 minutos y cinco pantallas por sesión, por comprobar en beta. Los audios están escritos para revisar; aún no se han grabado.",
  head: ["Sesión", "Experiencia", "La regla de hoy"],
  rows: [
    ["1", "Audio + dos escenas", "Si lo vas a necesitar pronto, que esté disponible."],
    ["2", "Calendario y dos niveles", "Antes de contar un dinero como libre, mira qué pagos salen primero."],
    ["3", "Audio + ensayo privado", "Primero mira lo que puedes asumir; después decide qué ofrecer."],
    ["4", "Clip de dos perspectivas", "Que una marca te guste no dice si su acción es buena compra."],
    ["5", "Cambiar un supuesto", "Con tiempo, una ganancia o una deuda que se queda pesa mucho."],
    ["6", "Mensaje ficticio · nueva", "Si te garantizan, te apuran o te piden traer gente, no envíes dinero sin comprobar."],
    ["7", "Nota + una elección", "Su regla de la semana, con sus palabras."],
  ],
  sections: [
    [
      "Qué cambió en V2.2",
      [
        "Cada sesión cierra con una regla dicha con claridad. Como máximo, una advertencia por pantalla.",
        "Cinco pantallas por sesión y audios de 35-45 s con tres ideas como máximo.",
        "Ejemplos en dólares ($) y pagos con nombre: alquiler, tarjeta, cobro (propuesta; decide María).",
        "Sesión 5: 20 y 30 años, y además precios que suben y una deuda.",
        "Sesión 6 nueva: cuando una inversión promete demasiado. «Dos fondos» pasa a una semana posterior.",
        "Todas las respuestas de Elara están escritas, también la de «Otra».",
      ],
    ],
    [
      "Dónde revisar",
      "Comportamiento común: página 2. Sesiones: páginas 3-16. Revisión de María: páginas 17-18. Fuentes y cifras: página 19. La edición en inglés incluye además qué partes ya existen en la app.",
    ],
    [
      "Qué sigue abierto",
      "La relevancia emocional y el uso diario son hipótesis. María revisa lenguaje y situaciones; Alejandra, la voz. Las fuentes de la sesión 6 están por verificar. Nada se publica sin su revisión.",
    ],
  ],
};

export const common = {
  eyebrow: "COMPORTAMIENTO COMÚN",
  title: "Un aprendizaje, una regla y una conexión",
  sub: "Propuesta editorial. La edición en inglés indica qué ya existe en la app y qué es nuevo.",
  sections: [
    [
      "Cinco pantallas por visita",
      "1. La entrada: una pregunta, hasta cinco opciones, «Otra» y «Prefiero pasar». 2. Escucha o lee: audio de 35-45 s con tres ideas como máximo, tres tarjetas y «Leer en su lugar». 3. Comprueba o explora: tres o cuatro opciones, cada una con su explicación escrita, que aparece al elegir. 4. Hazlo tuyo: una frase para guardar, si quiere. 5. El cierre: la regla de hoy, lo que guarda y de qué trata mañana. Mostrar a la usuaria solo su ruta.",
    ],
    [
      "La regla de hoy",
      "Cada sesión deja una regla corta, dicha con claridad. Las advertencias se mantienen, pero como máximo una por pantalla: varias seguidas hacen sentir que no se aprendió nada.",
    ],
    [
      "Cuándo profundizar",
      "Botón opcional: «Quiero pensarlo un poco más». Abre como máximo una pregunta de la rama que corresponde a lo que eligió. Su respuesta cambia el borrador o el dato guardado. Si ninguna rama encaja, ofrecer seguir o usar el ejemplo, sin asignarle una emoción.",
    ],
    [
      "Lo que dice Elara",
      "Todas las respuestas están escritas de antemano; no las genera una IA. Si elige «Otra» y escribe, Elara no interpreta sus palabras: usa la línea escrita para «Otra» en esa sesión y sigue. Así no vuelve la nota genérica.",
    ],
    [
      "Aprender a su ritmo",
      "«Prefiero pasar» y «Usar un ejemplo» siempre disponibles. Si pasa una actividad, ofrecer su explicación o seguir. Ninguna omisión se convierte en respuesta o error.",
    ],
    [
      "Memoria que ella puede corregir",
      "«Guardar» es opcional. Recuperar solo lo que guardó, con «Editar» y «Quitar». En la sesión 7, omitir campos ausentes. Nunca inventar una transformación.",
    ],
    [
      "Privacidad y estados honestos",
      "No compartir respuestas con María ni con Círculos por defecto. No grabar audio personal: los audios son de enseñanza. El cierre reconoce lo que hizo; no certifica dominio.",
    ],
    [
      "Casos y cifras",
      "Ejemplos ficticios en dólares ($), como propuesta. Las fórmulas van en código, con fechas, tasas y supuestos visibles. No recomendar productos ni asignaciones, no conectar cuentas, no enviar borradores ni mover dinero como parte de la sesión.",
    ],
  ],
  foot: "Para cerrar sin actividad: «La explicación queda disponible si quieres volver». Para cerrar con una tarjeta: mostrar solo lo que eligió conservar. Ninguna opción crea por sí sola un recordatorio.",
};

export const sessions = [
  {
    n: "01",
    tag: "EMOCIÓN + PRIMER DESCUBRIMIENTO",
    title: "¿Ahorrar o invertir? Empieza por lo que quieres",
    goal: "Distinguir ahorrar de invertir y relacionarlo con cuándo necesitas el dinero.",
    meta: "3-4 min propuestos / Audio breve + dos escenas / voz estimada: 35-45 s",
    entry: {
      q: "¿Qué decisión te gustaría poder tomar con más libertad si tuvieras un colchón económico?",
      options: ["Cambiar de trabajo", "Mudarme o elegir dónde vivir", "Decir que no a algo", "Tener tiempo para algo mío", "Empezar a invertir"],
      extra: "«Otra» con texto libre · «Solo quiero explorar»",
      other: "«Esa es tu razón, con tus palabras. Ahora veamos cuándo necesitarías ese dinero, porque eso cambia dónde conviene tenerlo».",
    },
    script:
      "Imagina dos dineros: uno para una mudanza el mes que viene y otro que no vas a tocar en años. Ahorrar es guardar dinero para tenerlo disponible. Invertir es ponerlo a trabajar para que pueda crecer, aceptando que también puede bajar, incluso justo cuando lo necesitas. Por eso la primera pregunta no es cuánto podría ganar, sino para qué es y cuándo lo vas a necesitar. No necesitas tener dinero hoy para aprender esto.",
    cards: [
      ["Lo necesito pronto", "Una mudanza el mes que viene: importa que el dinero esté ahí."],
      ["Puedo esperar años", "Hay tiempo para subidas y bajadas."],
      ["La primera pregunta", "¿Para qué es y cuándo lo necesito?"],
    ],
    check: {
      kind: "check",
      prompt: "Paula tiene que pagar una mudanza en cuatro semanas. Le ofrecen una inversión que puede subir o bajar. ¿Qué revisarías primero?",
      options: [
        ["Cuánto podría ganar si todo sale bien.", "Es lo primero que suelen mostrar, pero no dice si en cuatro semanas tendrá lo que necesita. Si baja justo antes, le falta para la mudanza."],
        ["Si tendrá el dinero a tiempo, aunque baje.", "Sí. Paula ya sabe cuándo lo necesita: en cuatro semanas. Con un plazo tan corto, lo que más importa es que el dinero esté ahí.", true],
        ["Si a otras personas les fue bien con ella.", "Lo que les pasó a otras no dice qué pasará en las próximas cuatro semanas, ni cambia la fecha de Paula."],
      ],
    },
    apply:
      "Completa una sola frase: «Quiero un colchón para ___». Añade «Lo necesitaría pronto», «Podría esperar años» o «Aún no sé cuándo». Elara no elige por ella ahorrar o invertir: falta conocer su situación. Puede usar el ejemplo de Paula.",
    branches: [
      ["Elige cambiar de trabajo o dónde vivir", "«¿Qué opción te abriría ese colchón que hoy sientes limitada?». Después: «Guardamos esa razón junto al plazo que elegiste»."],
      ["Elige empezar a invertir", "«Empezamos por una distinción útil: guardar dinero y asumir riesgo para que crezca cumplen funciones distintas. Lo siguiente es saber cuándo lo necesitarías»."],
      ["No tiene ingresos o solo quiere explorar", "«Puedes aprender con el ejemplo de Paula. No necesitas ahorrar ni tener dinero para seguir»."],
    ],
    rule: "Si vas a necesitar el dinero pronto, normalmente conviene tenerlo disponible y no donde pueda bajar.",
    keep: "Si la guarda: su frase, su razón opcional y su plazo, incluso «por confirmar». Acciones: «Guardar», «Editar» y «Terminar sin guardar».",
    tomorrow: "Por qué el saldo de tu cuenta no siempre es dinero libre.",
    ifBack: "Recuperar la frase solo si la guardó y decide verla. Si no, usar a Paula. No afirmar que eligió un producto o que empezó a ahorrar.",
    media: "Audio de Ale. Dos escenas sobrias, sin imágenes de riqueza aspiracional. Transcripción completa con «Leer en su lugar».",
    changed: [
      "La regla se dice claramente en el cierre.",
      "El audio ya no usa «activos», «bonos» ni «rendimiento».",
      "La opción C de Paula ahora es claramente distinta (en V2.1 se parecía a B) y las tres tienen un largo parecido.",
      "«Colchón» en lugar de «respaldo» (decide María).",
    ],
    review: "¿«Colchón» suena natural para esta audiencia? ¿La regla suena a algo útil o a una orden?",
    sources: "Conceptos: S1, S8.",
  },
  {
    n: "02",
    tag: "UTILIDAD + ELECCIÓN DE NIVEL",
    title: "Lo que tienes y lo que ya tiene dueño",
    goal: "Ver un hueco de fechas y reconocer que un saldo positivo no siempre es dinero libre.",
    meta: "3-4 min propuestos / Calendario (v1: tres tarjetas) + dos niveles / voz estimada: 35-45 s",
    entry: {
      q: "Cuando ves el saldo de tu cuenta, ¿sabes qué parte ya tiene dueño antes de que vuelva a entrar dinero?",
      options: ["No siempre", "Sí, quiero un caso más difícil", "Mis ingresos cambian mucho", "Ahora no tengo ingresos", "Prefiero un ejemplo"],
      extra: "«Otra» con texto libre",
      other: "«Gracias. Veamos el calendario de Ana; después decides si quieres usar tus propias fechas».",
    },
    script:
      "Ana tiene $100 en su cuenta. El día 5 paga $150 de alquiler. El día 10 cobra $200. Ese cobro llega tarde para el alquiler: el día 5 le faltan $50. Mirar tu dinero es mirar cuánto entra, cuánto sale y en qué fecha. Y un saldo positivo no siempre es dinero libre: parte puede tener dueño ya. El calendario es un ejemplo; no cambia ningún pago real.",
    cards: [
      ["Hoy", "$100 en la cuenta."],
      ["Día 5", "Alquiler: $150. Faltan $50."],
      ["Día 10", "Cobro: $200. Llega después."],
    ],
    check: {
      kind: "explore",
      prompt: "Elige un cambio en el calendario de Ana y mira la consecuencia.",
      options: [
        ["El cobro llega el día 4.", "$100 + $200 = $300 antes del alquiler. Después de pagar $150 quedan $150. Esa fecha hay que confirmarla, y esos $150 no son automáticamente dinero libre."],
        ["El cobro se retrasa al día 12.", "El día 5 siguen faltando $50. Que el dinero llegue después no cubre el hueco de antes."],
        ["El alquiler pasa al día 11.", "Si ese cambio se acuerda y no hay otros pagos, el cobro llegaría antes. Mover la tarjeta aquí no cambia ninguna fecha real."],
      ],
    },
    advanced: {
      title: "Ruta «Sí, quiero un caso más difícil»",
      text: "Salta la narración y la actividad básicas. «Tienes $300. El día 5 pagas $180 de alquiler. El día 10 deberías cobrar $200, pero la fecha está por confirmar. El día 12 pagas $170 de la tarjeta». Pregunta: «Si el cobro se retrasa al día 14, ¿cómo quedas el día 12, después de pagar la tarjeta?».",
      options: [
        ["Me sobran $150", "«Eso pasaría si cobras el día 10: 300 − 180 + 200 − 170 = 150. Con el retraso, el día 12 el cobro todavía no llegó»."],
        ["Me quedo en $0", "«Casi. Después del alquiler te quedan $120 (300 − 180). El día 12 pagas $170 y el cobro aún no llegó: faltan $50»."],
        ["Me faltan $50", "«Sí. 300 − 180 = 120, y el día 12 salen 170 antes de que llegue el cobro: faltan $50. El día 14 vuelves a $150. Con ingresos que cambian, la fecha importa tanto como la cantidad»."],
      ],
    },
    apply: "Ruta normal: elegir un pago y un cobro propios, con fechas o «por confirmar», o quedarse con Ana. No se piden importes.",
    branches: [
      ["Elige «Mis ingresos cambian mucho»", "«¿Qué fecha necesitas confirmar primero para que este calendario te sirva?». Una respuesta basta. Guardar el dato pendiente, sin contar como recibido un ingreso incierto."],
      ["No quiere usar datos propios", "«El calendario de Ana basta para practicar. Puedes quedarte con la pregunta: ¿qué tiene que salir antes de que vuelva a entrar dinero?»."],
    ],
    rule: "Antes de contar un dinero como libre, mira qué pagos salen primero.",
    keep: "Una fecha por confirmar o la regla. En el caso difícil, su comprobación pendiente.",
    tomorrow: "Cuando quieres ayudar a alguien y también cuidar lo tuyo.",
    ifBack: "Reabrir su fecha o el caso ficticio, como ella elija. No pedir pruebas de ingresos, capturas ni documentos.",
    media: "v1 en texto: tres tarjetas que se revelan al elegir. Calendario arrastrable solo si la prueba muestra que hace falta. Siempre marcado «ejemplo».",
    changed: [
      "Los pagos tienen nombre (alquiler, tarjeta, cobro) e importes en $.",
      "El caso difícil tiene una trampa real: si el cobro se retrasa, faltan $50 el día 12. En V2.1 el saldo nunca quedaba en negativo, así que solo era más aritmética.",
      "«Ya tiene dueño» en lugar de «tiene destino» (decide María).",
    ],
    review: "¿«Ya tiene dueño» suena natural? ¿El caso difícil se siente como un reto de verdad y no infantil?",
    sources: "Conceptos: S2.",
  },
  {
    n: "03",
    tag: "EMOCIÓN + PALABRAS PARA USAR",
    title: "¿Y si piensan que soy egoísta?",
    goal: "Distinguir lo que quiere ofrecer, lo que puede asumir y la respuesta que elige ensayar.",
    meta: "3-5 min propuestos / Audio cercano + ensayo privado / voz estimada: 35-45 s",
    entry: {
      q: "Si alguien que quieres te pidiera dinero, ¿qué podría hacerte decir que sí aunque aún no sepas si puedes?",
      options: ["No quiero que piense que soy egoísta", "Quiero ayudar de verdad", "Ya ayudo cada mes", "Me preocupa su reacción", "Puedo decidir con tranquilidad"],
      extra: "«Otra» con texto libre · «No aplica»",
      other: "«Gracias por contarlo así. Lo que sientes cuenta. Vamos a separar la parte que sí se puede mirar con números».",
    },
    script:
      "Ayudar puede ser algo que eliges con cariño. También puede mezclarse con culpa, con acuerdos o con miedo a decepcionar. Hoy separamos tres cosas: qué quieres ofrecer, qué puedes asumir ahora y qué quieres decir. Los números ayudan con la segunda; no deciden por ti. La frase que escribas se queda aquí si quieres; no tienes que enviarla.",
    cards: [
      ["Lo que quiero", "Qué ofrecería por elección."],
      ["Lo que puedo", "Qué quedaría sin cubrir."],
      ["Lo que digo", "Una frase que me represente."],
    ],
    check: {
      kind: "explore",
      prompt: "Marta tiene $200 y necesita $150 para el alquiler antes de cobrar. Le piden $100. Elige qué respuesta quieres explorar.",
      options: [
        ["«Necesito revisar mis pagos antes de decirte una cantidad».", "Gana tiempo sin prometer dinero. Queda pendiente decidir, pero ya no decide con prisa."],
        ["«Esta vez puedo ofrecer $50».", "Le quedan $150, justo lo del alquiler. Cuadra en números; si es lo adecuado depende de otros pagos y de lo que Marta quiera."],
        ["«Esta vez no voy a dar dinero».", "Conserva los $200. La cuenta no dice cómo se sentirá ella ni cómo responderá la otra persona; eso también cuenta."],
      ],
    },
    apply:
      "Elegir una frase del ejemplo, editarla o escribir una propia. Después releer: «¿Esto expresa lo que quiero ofrecer sin prometer algo que no puedo asumir?». Puede quedarse con el ejemplo.",
    branches: [
      ["Le preocupa parecer egoísta", "«Si supieras que no se va a decepcionar, ¿qué querrías ofrecer?». Usar su respuesta en el borrador, sin llamarla una cantidad viable. Si menciona a su mamá, decir «tu mamá» solo porque ella lo dijo."],
      ["Ya ayuda cada mes", "«¿Qué te gustaría cuidar de esa ayuda y qué necesitas que siga cubierto para ti?». Un borrador que refleje ambas cosas. No suponer que el acuerdo se puede cambiar."],
      ["Le preocupa su reacción", "No profundizar en la decepción. «Podemos dejarlo en privado y pensar primero en qué apoyo te haría sentir más segura». Si no aplica, usar a Marta sin buscar un conflicto oculto."],
    ],
    rule: "Lo que quieres ofrecer y lo que puedes asumir son dos preguntas distintas. Puedes responder la segunda antes de contestar.",
    keep: "Su frase exacta, si decide conservarla. Elara puede decir: «Puedes volver a estas palabras antes de responder». No afirmar que puso un límite, envió un mensaje o resolvió la culpa.",
    tomorrow: "La diferencia entre que te guste una empresa y tener una parte de ella.",
    ifBack: "Ofrecer «Releer», «Editar» o «Dejarlo aquí». Nunca preguntar si lo envió. Ayudar a la familia puede ser una elección libre y valiosa.",
    media: "Ale puede grabar el audio como una conversación. La pregunta emocional adicional aparece solo si ella la elige; Elara la usa para ajustar el borrador, no para diagnosticar.",
    changed: [
      "«Hay un compromiso previo» pasa a «Ya ayudo cada mes»: más concreto, e incluye los envíos a la familia.",
      "Importes en $ y el pago de Marta tiene nombre (alquiler).",
      "Regla explícita en el cierre. El resto se mantiene: era la sesión más fuerte.",
    ],
    review: "¿La pregunta produce reconocimiento sin culpar a la familia? ¿La frase suena a algo que de verdad diría? ¿«Ya ayudo cada mes» describe bien los envíos?",
    sources: "Conceptos: S2; reflexión y ensayo originales.",
  },
  {
    n: "04",
    tag: "CURIOSIDAD + CAMBIO DE PERSPECTIVA",
    title: "De comprarle a una empresa a tener una parte",
    goal: "Explicar qué representa una acción y separar que te guste una marca de una decisión de inversión.",
    meta: "3-4 min propuestos / Clip de dos perspectivas / voz estimada: 35-45 s",
    entry: {
      q: "¿Hay alguna empresa que uses mucho y de la que alguna vez hayas pensado «me habría gustado invertir ahí»?",
      options: ["Sí, tengo una en mente", "Me pasa al ver lo que ganaron otras personas", "Nunca lo había pensado", "Ya invierto", "Prefiero una empresa ficticia"],
      extra: "«Otra» con texto libre",
      other: "«Gracias. Usemos una empresa ficticia para mirar las dos perspectivas sin presión».",
    },
    script:
      "Como compradora te preguntas si un producto te sirve. Como accionista tienes una pequeña parte de la empresa, y el precio de esa parte sube o baja según lo que otras personas estén dispuestas a pagar. Por eso, que una marca te guste no dice si su acción, al precio de hoy, es una buena compra. Hoy cambiamos de mirada: del producto que usas a la empresa de la que tendrías una parte.",
    cards: [
      ["Compradora", "¿El producto me sirve?"],
      ["Accionista", "¿Qué parte tengo y qué puede pasar con su valor?"],
      ["Precio de mercado", "Sube o baja. No todas las empresas venden acciones en bolsa."],
    ],
    check: {
      kind: "check",
      prompt: "Una empresa ficticia tiene muchos clientes. ¿Qué pregunta añade la mirada de una accionista?",
      options: [
        ["¿Cómo gana dinero y qué podría hacer que valga menos?", "Sí. Miras el negocio y sus riesgos, no solo el producto. Aún faltaría saber el precio, pero ya piensas como dueña de una parte.", true],
        ["¿Me gusta más su producto que el de otra marca?", "Es una buena pregunta de compradora. Por sí sola no dice nada de lo que tendrías ni de su riesgo."],
        ["¿Cuánto habría ganado si hubiera comprado hace años?", "Despierta curiosidad, pero el pasado no dice qué pasará con el precio desde hoy."],
      ],
    },
    apply:
      "Elegir una empresa ficticia o una que conoce. Completar solo: «Como clienta sé ___; como posible accionista me falta entender ___». Si no sabe por dónde empezar, ofrecer «cómo gana dinero», «qué podría afectar su valor» o «qué precio estaría pagando». Elara no investiga ni recomienda empresas.",
    branches: [
      ["Piensa en lo que ganaron otras", "«¿Te atrae entender cómo funciona, lo que otras ganaron, o ambas cosas?». Usar la respuesta para elegir la explicación, sin crear urgencia por comprar."],
      ["Nunca lo había pensado", "Dar la explicación, no prometerla: «No necesitas saberlo todo. Una acción es una parte pequeña de la empresa, y su precio cambia según lo que otras personas pagan por ella. Con eso ya puedes hacer tu primera pregunta»."],
      ["Ya invierte", "Saltar la definición si lo elige. «¿Qué parte de tu decisión se apoya en conocer el producto y cuál en entender la inversión?»."],
    ],
    rule: "Que una marca te guste no dice si su acción, al precio de hoy, es una buena compra.",
    keep: "Una pregunta que quiera entender antes de considerar una acción, solo si decide guardarla.",
    tomorrow: "Cambia una cifra y mira cómo crece, o se encoge, el dinero con el tiempo.",
    ifBack: "Si pide una compra concreta, mantener la sesión educativa y señalar qué información falta.",
    media: "Dos perspectivas de una misma empresa ficticia. Sin logos, testimonios de ganancias ni pantalla de compra. Transcripción exacta como alternativa.",
    changed: [
      "Sin dividendos: era una idea más que la sesión no usaba.",
      "Las tres respuestas tienen un largo parecido (en V2.1 la correcta era la más larga y se notaba).",
      "La rama «Le preocupa no saber suficiente» no tenía opción de entrada y prometía una explicación sin darla. Ahora responde a «Nunca lo había pensado» y da la explicación.",
    ],
    review: "¿El cambio de compradora a accionista despierta curiosidad? ¿Se entiende «tener una parte» sin sentirse examinada?",
    sources: "Conceptos: S3, S9.",
  },
  {
    n: "05",
    tag: "DESCUBRIMIENTO + A FAVOR Y EN CONTRA",
    title: "No es magia: cambia una cifra y mira",
    goal: "Ver cómo una ganancia, una deuda o la subida de precios entra en el siguiente cálculo, y por qué el tiempo lo cambia todo.",
    meta: "3-5 min propuestos / Demostración (v1: tarjetas que se revelan) + voz / voz estimada: 40-50 s",
    entry: {
      q: "Cuando ves que otras personas hablan de invertir, ¿qué te pasa?",
      options: ["Curiosidad", "Siento que voy tarde", "Desconfío de lo que muestran", "Nada en particular"],
      extra: "«Otra» con texto libre · «Prefiero pasar»",
      other: "«Gracias. Veamos un cálculo sencillo; tú eliges qué cambiar».",
    },
    script:
      "$100 al 5 % al año son $105 después de un año. Si esa ganancia se queda, el año siguiente el 5 % se calcula sobre $105, no sobre $100. Al principio casi no se nota; con tiempo, sí: en 20 años serían unos $265, frente a $200 si la ganancia no se quedara. Y funciona igual en contra, con una deuda o con precios que suben. El 5 % es un supuesto, no una promesa: una inversión real también puede bajar.",
    cards: [
      ["Base hipotética", "$100 al 5 % anual, 20 años: $265. Si la ganancia no se quedara: $200."],
      ["Más tiempo", "30 años: $432."],
      ["En contra", "Precios que suben 10 % al año: lo que hoy cuesta $100, en 2 años cuesta $121."],
    ],
    check: {
      kind: "explore",
      prompt: "Elige qué supuesto quieres cambiar. Se muestra el cálculo y una explicación; no hay que acertar antes.",
      options: [
        ["Diez años más (30 en total).", "100 × 1,05³⁰ ≈ $432. Los últimos diez años suman más que los primeros veinte juntos, porque la ganancia crece sobre ganancias anteriores. Sigue suponiendo un 5 % cada año, sin añadir dinero."],
        ["Dos años con una caída del 10 %.", "100 × 0,90² = $81. El valor también puede bajar. El ejemplo no predice una pérdida concreta."],
        ["Precios que suben un 10 % al año.", "100 × 1,10² = $121. Lo que hoy cuesta $100 costaría $121 en dos años. Si tu dinero no crece, alcanza para menos. Es el mismo cálculo, en contra."],
        ["Una deuda de $100 al 30 % anual, sin pagar.", "100 × 1,30² = $169. Si los intereses se suman a la deuda, el año siguiente se cobran intereses sobre intereses. Ejemplo simplificado: las tarjetas y los préstamos reales calculan de otras formas."],
      ],
    },
    apply:
      "Elegir una idea para conservar: «Con tiempo, una ganancia que se queda pesa mucho», «Funciona igual con deudas y precios», «Un supuesto no es una promesa» o una frase propia. Comprobación opcional: «En el segundo año, ¿el 5 % se calcula sobre 100 o sobre 105?». Para 105: «Sí, incluye la primera ganancia». Para 100: «Mira el primer paso: ahora hay 105; sobre eso se calcula el segundo 5 %».",
    branches: [
      ["Siente que va tarde", "«¿Qué te pesa más: no entenderlo todavía, compararte con otras, o ambas cosas?». Después: «El tiempo cuenta, y también cuenta empezar por entender. No hay nada que recuperar hoy». No prometer que recuperará tiempo ni crear urgencia."],
      ["Desconfía de lo que muestran", "«Una cifra de ganancias deja preguntas: cuánto se puso, cuánto tiempo pasó, qué costos hubo y qué riesgo se asumió». Puede guardar una pregunta. Mañana sigue el tema."],
      ["Nada en particular o prefiere pasar", "Abrir directamente los cambios: «Puedes aprender mirando qué cambia cuando cambias un supuesto». No interpretar el silencio ni la falta de ahorro."],
    ],
    rule: "Cuando una ganancia o una deuda se queda, el siguiente cálculo se hace sobre más. Con tiempo, eso pesa mucho, a favor o en contra.",
    keep: "La idea que eligió y el supuesto que exploró, con la etiqueta «Ejemplo hipotético; sin aportaciones, retiros, costos ni impuestos». No aplicar la tasa a sus finanzas.",
    tomorrow: "Cómo reconocer una inversión que promete demasiado.",
    ifBack: "Retomar el supuesto que eligió si lo guardó; si no, mostrar la base. Mover un control no demuestra que ya entendió.",
    media: "Estados fijos y comprobados, no cálculos hechos por IA. En la beta de texto, tarjetas que se revelan al elegir. Mostrar siempre EJEMPLO HIPOTÉTICO.",
    changed: [
      "De 2 a 20 años. En V2.1 la diferencia era de $0,25 (110,25 frente a 110): la lección no se veía.",
      "Dos casos en contra que esta audiencia vive: precios que suben y una deuda. Se quita «Empezar con 200».",
      "La rama «Siente que va tarde» cuida que el ejemplo de 30 años no aumente esa sensación.",
    ],
    review: "¿Los casos en contra (precios, deuda) se sienten cercanos o pesados? ¿El ejemplo de 30 años aumenta la sensación de «voy tarde»?",
    sources: "Conceptos: S4, S5; ejemplos numéricos propios.",
  },
  {
    n: "06",
    tag: "PROTECCIÓN + CRITERIO · SESIÓN NUEVA",
    title: "Cuando una inversión promete demasiado",
    goal: "Reconocer tres señales de alerta antes de enviar dinero, sin desconfiar de todo ni culpar a nadie.",
    meta: "3-4 min propuestos / Audio + mensaje ficticio / voz estimada: 35-45 s",
    entry: {
      q: "¿Alguna vez te han ofrecido algo para «hacer crecer tu dinero» rápido?",
      options: ["Sí, por WhatsApp o redes", "Sí, alguien que conozco", "Lo he visto pasarle a otras", "Nunca", "Ya puse dinero en algo así"],
      extra: "«Otra» con texto libre · «Prefiero pasar»",
      other: "«Gracias. Veamos tres señales que sirven para cualquier oferta».",
    },
    script:
      "Toda inversión real puede bajar. Por eso, si alguien te garantiza ganancias altas, te está prometiendo algo que no puede saber. La prisa también es una señal: «solo hoy», «quedan pocos cupos». Y que la oferta llegue de alguien de confianza o de tu comunidad no la hace segura: muchas estafas llegan así, y quien te la pasa puede creer en ella de verdad.",
    cards: [
      ["Ganancia garantizada", "Ninguna inversión real puede garantizarla."],
      ["Decide ya", "La prisa te quita tiempo para comprobar."],
      ["Trae a más personas", "Si ganas por sumar gente, pregunta de dónde sale el dinero."],
    ],
    check: {
      kind: "check",
      prompt: "Lucía recibe este mensaje (ejemplo ficticio): «Invierte $100 hoy y en un mes tienes $150. Garantizado. Quedan 3 cupos. Si traes a dos amigas, ganas más». ¿Qué debería hacer primero?",
      options: [
        ["Poner solo un poco para probar.", "Probar con poco no protege: muchos de estos esquemas pagan la primera vez para que confíes y pongas más."],
        ["Preguntar si a quien se lo mandó le pagaron.", "Que a alguien le hayan pagado no prueba que sea seguro: en estos esquemas, los primeros pagos suelen salir del dinero de quienes entran después."],
        ["No enviar nada hasta comprobar quién lo ofrece.", "Sí. El mensaje tiene las tres señales: ganancia garantizada, prisa y traer a más personas. Antes de enviar dinero, se puede comprobar si quien lo ofrece está autorizado por el regulador financiero de su país.", true],
      ],
    },
    apply:
      "Guardar las tres preguntas: «Antes de enviar dinero, me pregunto: ¿me garantizan ganancias? ¿me apuran? ¿me piden traer a más personas?». O completar: «Si me ofrecen algo así, voy a responder: ___». Ejemplo: «Gracias, lo voy a revisar con calma antes de decidir».",
    branches: [
      ["Se lo ofreció alguien que conoce", "«No tienes que pensar mal de esa persona: puede que ella también lo crea. Puedes decir: “Gracias, lo reviso con calma antes de decidir”»."],
      ["Ya puso dinero en algo así", "«Gracias por contarlo. Estas ofertas están hechas para parecer seguras; no tienes nada de qué avergonzarte. No sabemos si la tuya fue legítima: estas señales te ayudan a revisarla. Si te preocupa, puedes consultar al regulador financiero de tu país». No pedir detalles ni montos. No prometer recuperar dinero."],
      ["Nunca, o lo vio en otras", "«Estas señales también te sirven para acompañar a otras sin acusar a nadie»."],
    ],
    rule: "Si te garantizan ganancias, te apuran o te piden traer a más personas, no envíes dinero hasta comprobar.",
    keep: "Las tres preguntas o su frase, si decide guardarlas.",
    tomorrow: "Reunir lo que guardaste esta semana y elegir tu regla.",
    ifBack: "Ofrecer «Releer las señales». Nunca preguntar si invirtió ni cuánto.",
    media: "Mensaje con aspecto de chat, marcado «Ejemplo ficticio». Sin logos, empresas reales, criptomonedas concretas ni capturas reales. Sin asesoría legal. Nombrar «el regulador financiero de tu país» sin elegir uno: la audiencia vive en varios países (pendiente: lista verificada por país).",
    changed: [
      "Sesión nueva. Sustituye a «Dos fondos», que pasa sin cambios a una semana posterior (texto en V2.1).",
      "Motivo: para esta audiencia, protegerse de ofertas engañosas es más urgente que comparar fondos, y sigue siendo aprender sobre inversión.",
    ],
    review: "¿Se puede hablar de estafas sin que dé vergüenza? ¿«Ya puse dinero en algo así» se siente seguro de elegir? ¿Por qué canales llegan estas ofertas en su comunidad?",
    sources: "Conceptos: S10, S11, S12 (por verificar).",
  },
  {
    n: "07",
    tag: "RECONOCIMIENTO + CONTINUIDAD",
    title: "Lo que ahora puedes llevar contigo",
    goal: "Reunir lo que guardó y elegir la regla de la semana que quiere llevarse.",
    meta: "2-3 min propuestos / Nota + una elección / voz estimada: 25-35 s",
    entry: {
      q: "Esta semana viste seis reglas. ¿Cuál te gustaría llevarte?",
      options: [
        "Si lo voy a necesitar pronto, que esté disponible.",
        "Antes de contar un dinero como libre, miro qué pagos salen primero.",
        "Primero miro lo que puedo asumir; después decido qué ofrecer.",
        "Que una marca me guste no dice si su acción es buena compra.",
        "Con tiempo, una ganancia o una deuda que se queda pesa mucho.",
        "Si me garantizan, me apuran o me piden traer gente, no envío dinero sin comprobar.",
      ],
      extra: "«Ninguna todavía» · Mostrar las reglas de las sesiones que abrió; si no abrió ninguna, todas.",
      other: null,
    },
    script:
      "Una semana puede dejarte una regla, una frase que quieres usar o una pregunta mejor. Hoy reunimos solo lo que tú elegiste guardar. Puedes corregirlo o quitarlo. No hay que llenar nada más para terminar.",
    cards: [
      ["Tu regla", "La que elegiste hoy."],
      ["Tus palabras", "Tu frase o tu propósito, si los guardaste."],
      ["Tu pregunta", "La que quieres resolver, si la guardaste."],
    ],
    check: {
      kind: "steps",
      prompt: "Mostrar la nota construida con lo guardado, con «Editar» y «Quitar» en cada línea. Después, un siguiente paso opcional.",
      options: [
        ["La nota", "Arriba, la regla elegida. Debajo, solo lo guardado y confirmado: propósito (sesión 1), frase (sesión 3), pregunta (sesión 4), señales (sesión 6). Si falta un campo, omitirlo. Nunca queda vacía: la regla es contenido, no un dato suyo."],
        ["«¿Qué te serviría aprender después?»", "Deudas e intereses / Un colchón para imprevistos / Costos de invertir / Más ejemplos de acciones y fondos / Todavía no quiero elegir. Guardar solo si lo confirma."],
        ["Un ejemplo, solo si lo pide", "Ficticio, no de una usuaria: «Tu regla: antes de contar un dinero como libre, miro qué pagos salen primero. Elegiste: un colchón para cambiar de trabajo. Ensayaste: “Necesito revisar mis pagos antes de decirte una cantidad”»."],
      ],
    },
    apply:
      "Con tarjetas guardadas: «Esto es lo que decidiste conservar. ¿Hay algo que ya no te represente?». Editar antes de cerrar. Sin nada guardado: «Te llevas la regla que elegiste. Aprender no exige guardar nada personal». No decir «ahora tienes confianza» ni atribuirle acciones fuera de la app.",
    branches: [
      ["Quiere explicar una idea", "Apoyos según su elección: acción = una parte pequeña de la empresa, con un valor que cambia; compuesto = una ganancia o una deuda que se queda entra en el siguiente cálculo; señales = garantía, prisa, traer gente. Si confunde algo, corregir solo esa parte con su ejemplo."],
      ["Elige «Ninguna todavía»", "«Está bien. Puedes volver a cualquier sesión cuando quieras». Sin insistir."],
      ["No guardó nada", "No reconstruir recuerdos a partir de una omisión ni mostrar datos de otra usuaria."],
    ],
    rule: "La que ella eligió, con sus palabras si la editó: «Tu regla de la semana: …».",
    keep: "Una nota revisada por ella y, solo si lo eligió, el siguiente tema. Cierre: «Puedes volver a esta nota para seguir desde donde tú elegiste».",
    tomorrow: "El tema que eligió, o nada: ningún recordatorio se programa solo.",
    ifBack: "La nota puede cambiar. Ninguna respuesta implica cuenta abierta, inversión, ahorro o recordatorio programado.",
    media: "Nota con sus frases exactas, no una carta generada con elogios. Sin porcentajes de transformación ni certificados de preparación financiera.",
    changed: [
      "La nota nunca queda vacía: empieza con la regla que elige, que es contenido y no un dato suyo.",
      "Más corta: se quita la elección A/B/C de V2.1.",
      "«Diversificación» se sustituye por las señales de alerta de la nueva sesión 6.",
    ],
    review: "¿Elegir una regla se siente propio? ¿Se siente reconocida sin que Elara invente una historia?",
    sources: "Conceptos: S1-S12; síntesis editorial propia.",
  },
];

export const reviewPage = {
  eyebrow: "REVISIÓN / MARÍA + ALEJANDRA",
  title: "Probar la experiencia completa",
  sub: "Para cada sesión: «Lista para prueba» o «Necesita ajuste». Citar la frase o el momento exacto y proponer una alternativa.",
  head: ["Sesión", "Comprobar", "Cambio o decisión"],
  rows: [
    ["1", "¿Aprende algo en la primera visita y lo conecta con una decisión suya?"],
    ["2", "¿El caso difícil se siente como un reto real, no infantil?"],
    ["3", "¿La frase suena a algo que de verdad diría?"],
    ["4", "¿El cambio de compradora a accionista despierta curiosidad?"],
    ["5", "¿Los casos en contra se sienten cercanos? ¿El ejemplo de 30 años aumenta el «voy tarde»?"],
    ["6", "¿Se puede hablar de estafas sin vergüenza? ¿Es seguro elegir «Ya puse dinero en algo así»?"],
    ["7", "¿Elegir una regla se siente propio y reduce esfuerzo?"],
  ],
  wordsTitle: "Palabras que decide María",
  wordsHead: ["En V2.1", "Propuesta V2.2", "Dónde"],
  words: [
    ["«respaldo económico»", "«colchón económico»", "Sesión 1 y 7"],
    ["«tiene destino»", "«ya tiene dueño»", "Sesión 2"],
    ["«unidades»", "dólares ($)", "Todas"],
    ["«Hay un compromiso previo»", "«Ya ayudo cada mes»", "Sesión 3"],
    ["—", "la sesión 6 completa (nueva)", "Sesión 6"],
    ["—", "las seis reglas, en «tú» y en «yo»", "Todas"],
  ],
  lang: [
    "Lenguaje y emoción",
    "Señalar traducciones literales, tono infantil o suposiciones sobre pareja, familia, ingresos o vergüenza. Verificar que «Otra», «No aplica» y el ejemplo permiten seguir sin defenderse. Una pregunta intensa debe dejar más claridad o una herramienta.",
  ],
};

export const testPage = {
  eyebrow: "REVISIÓN / PRUEBA PEQUEÑA",
  title: "Antes de grabar nada",
  sections: [
    [
      "Prueba en texto con cinco mujeres",
      "Probar primero las sesiones 1-3 en texto, antes de producir audio o vídeo. Después de cada visita: «¿Qué entendiste o descubriste?», «¿Qué usarías fuera de Elara?» y «¿Hubo algo que te hiciera querer salir?». No pedir que publiquen respuestas privadas.",
    ],
    [
      "La pregunta que más dice",
      "Al día siguiente, antes de abrir la app: «¿Recuerdas la regla de ayer? Dila con tus palabras». Si la mayoría no puede decirla, la regla no está funcionando, aunque haya completado todas las pantallas.",
    ],
    [
      "Al terminar la semana",
      "Preguntar qué sesión volvería a abrir y por qué, qué sintió repetitivo y qué esperaba aprender que faltó. Observar si elige volver por su cuenta. Registrar respuestas reales; completar pantallas no demuestra éxito.",
    ],
    [
      "Antes de grabar",
      "Cerrar el concepto y la redacción. Después probar si el audio ayuda a entender lo mismo mejor o con menos esfuerzo. Mantener siempre el texto equivalente; el audio no debe añadir una tarea obligatoria.",
    ],
  ],
};

export const sourcesPage = {
  eyebrow: "FUENTES / ALCANCE",
  title: "Qué respalda el contenido",
  sub: "Fuentes de V2.1 (S1-S9), con su uso en V2.2. Las fuentes de la sesión 6 (S10-S12) no se pudieron abrir desde esta sesión de trabajo: hay que verificarlas antes de publicar.",
  items: [
    ["S1 / SEC Investor.gov / Introduction to Investing", "Ahorrar, invertir, plazo y riesgo: sesión 1. No se trasladan cuentas, garantías ni reglas fiscales de EE. UU. a otros países.", "https://www.investor.gov/introduction-investing"],
    ["S2 / CFPB / Creating a cash flow budget", "Fechas, entradas, salidas y saldo: sesiones 2-3. La dimensión relacional de la sesión 3 es una propuesta editorial.", "https://www.consumerfinance.gov/documents/10038/cfpb_creating-cash-flow-budget_tool_2021-08.pdf"],
    ["S3 / SEC Investor.gov / Stocks", "Acciones, propiedad y riesgo: sesión 4.", "https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks"],
    ["S4 / SEC Investor.gov / Introduction to Investing", "Crecimiento compuesto y posibilidad de pérdidas: sesión 5.", "https://www.investor.gov/introduction-investing"],
    ["S5 / SEC Investor.gov / Compound Interest Calculator", "Supuestos explícitos: capital, tiempo, tasa y frecuencia: sesión 5.", "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator"],
    ["S6, S7 / SEC Investor.gov / Asset Allocation; Mutual Funds and ETFs", "«Dos fondos»: pasa a una semana posterior.", "https://www.investor.gov/introduction-investing/getting-started/asset-allocation"],
    ["S8 / SEC Investor.gov / Asset Allocation", "Plazo, tolerancia y posibilidad de pérdida: sesiones 1 y 7.", "https://www.investor.gov/introduction-investing/getting-started/asset-allocation"],
    ["S9 / SEC Investor.gov / Public Companies", "Una empresa conocida puede no tener acciones en bolsa: sesión 4.", "https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/public-companies"],
    ["S10-S12 / SEC Investor.gov / Red Flags of Fraud; Affinity Fraud; Ponzi Schemes · POR VERIFICAR", "Ganancias garantizadas, presión para decidir, ofertas dentro de comunidades de confianza y pagos a los primeros con dinero de los nuevos: sesión 6. Además falta una lista verificada de reguladores por país.", null],
  ],
  numbersTitle: "Alcance de las cifras",
  numbers:
    "Sesión 2: 100 + 200 − 150 = 150; caso difícil: 300 − 180 = 120; 120 − 170 = −50 (faltan 50 el día 12); 300 − 180 + 200 − 170 = 150. Sesión 3: 200 − 50 = 150. Sesión 5, compuesto anual: 100 × 1,05² = 110,25; 100 × 1,05²⁰ = 265,33 (sin que la ganancia se quede: 100 + 20 × 5 = 200); 100 × 1,05³⁰ = 432,19 (años 21-30: +166,86; años 1-20: +165,33); 100 × 0,90² = 81; 100 × 1,10² = 121; 100 × 1,30² = 169. Tasas hipotéticas y constantes; sin aportaciones, retiros, costos, impuestos ni ajuste por inflación. La deuda es un ejemplo simplificado con capitalización anual.",
  missingTitle: "Lo que falta antes de publicar",
  missing:
    "No es un curso completo: deudas, colchón para imprevistos, bonos y evaluación de proveedores requieren desarrollo posterior. Verificar S10-S12 y preparar la lista de reguladores por país. María revisa voz y audiencia; el equipo verifica formatos, guardado, rutas y fórmulas.",
};
