// Elara · Dinero · V3.1 · lo que ve ella (para María)
// Basado en el borrador V3 (4 nov 2026). Cambios: un solo orden para el piloto,
// una pregunta de un toque al empezar cada visita (elige la rama), guiones que
// ya no revelan la respuesta de la pantalla 2, la misma regla al empezar y al
// cerrar, y palabras más simples donde V3 sonaba técnico. Propuesta: el
// español necesita la aprobación de María y Alejandra.
//
// Bloques de una pantalla:
//   label  texto pequeño de sección          title  título de la visita
//   q      pregunta (serif)                  chips  opciones de un toque
//   rule   «La regla de hoy»                 p      texto que lee o escucha
//   cards  tres tarjetas                     opt    opción + explicación al tocar
//   elara  línea de Elara                    buttons botones
//   when   condición: { when, b: [bloques] } note   nota pequeña (no la ve ella)

export const meta = {
  brand: "ELARA / CLARIDAD FINANCIERA",
  footer: "4 NOV 2026 / V3.1 / LO QUE VE ELLA / PARA MARÍA",
};

export const cover = {
  eyebrow: "V3.1 / PILOTO DE SIETE VISITAS / PARA MARÍA",
  title: ["Vienes con una duda.", "Te llevas una pequeña respuesta."],
  sub: "Las siete visitas tal como las vería ella, pantalla por pantalla. Basado en el borrador V3. Todo el español es una propuesta hasta que María y Alejandra lo aprueben.",
  head: ["Visita", "Tema", "La regla de hoy"],
  rows: [
    ["1", "Una cuenta, una fecha", "Antes de contar un dinero como libre, mira qué pagos salen primero."],
    ["2", "¿Para qué ahorrar y para qué invertir?", "El dinero para un pago cercano no debería depender de que una inversión suba."],
    ["3", "Antes de decir que sí", "Querer ayudar y poder asumir una cantidad son preguntas distintas."],
    ["4", "Por qué pagar 20 no siempre baja la deuda en 20", "Mira cuánto de tu pago reduce el saldo y qué cargos se añadieron."],
    ["5", "Lo que un porcentaje cambia con el tiempo", "La misma cantidad puede comprar menos si suben los precios."],
    ["6", "Cuando una oferta promete demasiado", "Si prometen ganancias altas sin riesgo y te apuran, pausa y verifica."],
    ["7", "Una cosa que sí te llevas", "La regla de la semana que ella elige."],
  ],
  sections: [
    [
      "Cómo leer este documento",
      [
        "Cada visita tiene cuatro pantallas. Lo que está dentro del marco es lo que ella ve o escucha.",
        "Las líneas «Si toca…» o «Si guardó…» solo aparecen en ese caso.",
        "«(respuesta respaldada)» es solo para revisar: en la app no se marca antes de que ella elija.",
        "Debajo de cada visita: qué revisar y qué cambió respecto a V3.",
      ],
    ],
    [
      "Qué cambió respecto a V3",
      [
        "Un solo orden para el piloto: el de «Cuentas». Con 5-6 participantes, tres rutas dejarían dos mujeres por ruta. Acciones y crecimiento esperan; su texto sigue en V3.",
        "Cada visita empieza con una pregunta de un toque. Lo que toca decide qué le responde Elara en la pantalla 3. En V3, nada elegía esa respuesta.",
        "En las visitas 1, 4 y 5 el guion ya no dice la respuesta antes de la pregunta de la pantalla 2.",
        "La regla de hoy es la misma al empezar y al cerrar, para que sea fácil recordarla.",
        "Palabras más simples donde V3 sonaba técnico, y la visita 7 empieza eligiendo una regla.",
      ],
    ],
    [
      "Qué depende de la app",
      "Citar sus palabras de la bienvenida en la visita 1 es una función nueva; si no está lista, se usa la versión sin cita. Las respuestas a lo que ella escribe con sus palabras las genera Elara con reglas y hay que probarlas antes. La guía de investigación de V3 (páginas 21-22) sigue igual.",
    ],
  ],
};

const rest = { t: "note", x: "«Prefiero pasar» siempre visible." };
const tapNote = { t: "note", x: "Al tocar, la explicación aparece en la misma pantalla. «Pasar» deja leerla o seguir." };
const prev = (when = "Si guardó algo en la visita anterior") => ({
  t: "when",
  when,
  b: [{ t: "elara", x: "La última vez guardaste: «[su frase]»." }],
});

export const visits = [
  {
    n: 1,
    code: "A",
    title: "Una cuenta, una fecha, algo más claro",
    purpose: "Distinguir un problema de fechas de lo que muestra un saldo, sin pedirle que organice todo el mes.",
    s: [
      [
        { t: "label", x: "Visita 1 de 7" },
        { t: "title", x: "Una cuenta, una fecha, algo más claro" },
        {
          t: "when",
          when: "Si la app puede citar la bienvenida",
          b: [{ t: "elara", x: "Dijiste: «[sus palabras de la bienvenida]». Hoy empezamos por algo concreto: un solo pago y qué dinero llega antes." }],
        },
        { t: "when", when: "Sin cita", b: [{ t: "elara", x: "Hoy empezamos por algo concreto: un solo pago y qué dinero llega antes." }] },
        { t: "q", x: "¿Qué te pasa más con las fechas del dinero?" },
        { t: "chips", x: ["No sé bien cuándo me pagan", "No quiero abrir mis cuentas hoy", "Lo que pasa es que no me alcanza", "Quiero ver el ejemplo"] },
        rest,
        { t: "rule", x: "Antes de contar un dinero como libre, mira qué pagos salen primero." },
        { t: "label", x: "Leer o escuchar · audio de Ale opcional" },
        {
          t: "p",
          x: "Miremos un ejemplo. Ana tiene US$300 hoy. Debe pagar US$180 de alquiler el día 5 y US$170 de electricidad el día 12. Un cliente le debe US$200 y dice que pagará el día 10, pero todavía no está confirmado. Ese cobro futuro no es dinero disponible hoy. Mirar las fechas permite ver un hueco antes de comprometer otra cantidad. Hoy lo haces con el ejemplo, sin abrir todas tus cuentas.",
        },
        { t: "cards", x: [["Hoy", "US$300 disponibles."], ["Día 5", "Alquiler: US$180."], ["Día 12", "Electricidad: US$170. El cobro de US$200 aún no llegó."]] },
      ],
      [
        { t: "label", x: "Ejemplo" },
        { t: "q", x: "El cliente paga el día 14. ¿Qué pasa el día 12, después de pagar el alquiler y antes del cobro?" },
        { t: "opt", x: "Faltan US$50 para la electricidad.", r: "Sí: US$300 − US$180 = US$120. La electricidad cuesta US$170: faltan US$50.", ok: true },
        { t: "opt", x: "Quedan US$150 después de la electricidad.", r: "Eso cuenta los US$200 antes de que lleguen. El día 12 todavía no han llegado." },
        { t: "opt", x: "Quedan US$120 después de la electricidad.", r: "US$120 es lo que queda antes de pagarla. Para los US$170 de electricidad faltan US$50." },
        tapNote,
      ],
      [
        { t: "label", x: "Hazlo tuyo" },
        { t: "q", x: "Elige una cosa para llevarte:" },
        { t: "chips", x: ["Confirmar una fecha", "Entender un pago o un cobro", "Usar el ejemplo"] },
        { t: "note", x: "Si elige algo propio: un campo corto. No se piden importes ni documentos." },
        { t: "when", when: "Si al empezar tocó «No sé bien cuándo me pagan»", b: [{ t: "elara", x: "Entonces esa fecha sigue pendiente: no la contemos como si ya hubiera llegado. Lo útil es confirmar cuándo estará disponible y compararla con el pago. ¿Guardamos esa pregunta?" }] },
        { t: "when", when: "Si tocó «No quiero abrir mis cuentas hoy»", b: [{ t: "elara", x: "Podemos quedarnos con Ana. La idea para llevarte es mirar un pago y lo que llega antes de su fecha, sin empezar por todo el mes." }] },
        { t: "when", when: "Si tocó «Lo que pasa es que no me alcanza»", b: [{ t: "elara", x: "Las fechas explican una parte, pero no crean dinero. Mirar un pago y su fecha te ayuda a ver si es un problema de fechas o si falta dinero aunque las fechas cuadren. Saber cuál de las dos es ya es información útil." }] },
        { t: "when", when: "Si escribe con sus palabras", b: [{ t: "note", x: "Elara responde a lo que escribió, con reglas: explica lo que puede con el ejemplo y, si su duda es otra, lo dice y ofrece guardarla. Nunca solo «Gracias»." }] },
      ],
      [
        { t: "label", x: "Lo que te llevas" },
        { t: "elara", x: "Hoy vimos por qué el dinero que llega después no cubre automáticamente un pago anterior." },
        { t: "rule", x: "Antes de contar un dinero como libre, miro qué pagos salen primero.", mine: true },
        { t: "buttons", x: ["Guardar", "Terminar sin guardar"] },
        { t: "when", when: "Si guardó una fecha, al volver", b: [{ t: "elara", x: "Dejaste esta fecha por confirmar: «[su fecha]». ¿Quieres seguir con ella, corregirla o usar un ejemplo?" }] },
        { t: "next", x: "Próxima visita: ¿Para qué ahorrar y para qué invertir?" },
      ],
    ],
    review: "¿Puede explicar qué aprendió, sin limitarse a decir que la pregunta la hizo pensar? ¿US$170 de electricidad suena verosímil para el grupo?",
    changes: [
      "Pregunta de un toque al empezar; sus opciones eligen la respuesta de la pantalla 3.",
      "El guion ya no dice «quedan 120 y faltan 50» antes de la pregunta de la pantalla 2.",
      "La regla del cierre es la misma que la de hoy (V3 cerraba con otra frase).",
      "Respuesta a «no me alcanza» más simple; «Entender un importe» pasa a «Entender un pago o un cobro».",
    ],
  },
  {
    n: 2,
    code: "C",
    title: "¿Para qué ahorrar y para qué invertir?",
    purpose: "Aprender una distinción financiera y usar el propósito y el plazo para formular una pregunta mejor.",
    s: [
      [
        { t: "label", x: "Visita 2 de 7" },
        { t: "title", x: "¿Para qué ahorrar y para qué invertir?" },
        prev(),
        { t: "q", x: "¿Qué te trae a esta pregunta?" },
        { t: "chips", x: ["Quiero aprender a invertir", "Necesito un respaldo para poder elegir", "Ahora no puedo ahorrar", "Solo quiero entender la diferencia"] },
        rest,
        { t: "rule", x: "El dinero para un pago cercano no debería depender de que una inversión suba." },
        { t: "label", x: "Leer o escuchar · audio de Ale opcional" },
        {
          t: "p",
          x: "Ahorrar es apartar dinero. Invertir busca una ganancia y acepta que el valor pueda cambiar. Si necesitas pagar algo pronto, ese dinero no debería depender de que una inversión suba. Paula necesita US$300 para una mudanza dentro de cuatro semanas. Para un propósito de varios años hay más tiempo para considerar otras opciones y aprender sus riesgos. La primera decisión es sencilla: ponerle un propósito y un plazo al dinero, antes de elegir dónde tenerlo.",
        },
        { t: "cards", x: [["Pronto", "Mudanza en cuatro semanas."], ["En varios años", "Un plazo distinto."], ["Primero", "¿Para qué y para cuándo?"]] },
      ],
      [
        { t: "label", x: "Ejemplo" },
        { t: "q", x: "Paula necesita US$300 para una mudanza dentro de cuatro semanas. Una opción puede bajar de valor. ¿Qué necesita comprobar?" },
        { t: "opt", x: "Si tendrá la cantidad necesaria en la fecha del pago.", r: "Sí. Para ese propósito importan poder sacar el dinero a tiempo, la posible pérdida y el plazo.", ok: true },
        { t: "opt", x: "Si una ganancia pasada asegura que tendrá los US$300.", r: "Un resultado pasado no asegura el valor que tendrá en esa fecha." },
        { t: "opt", x: "Solo cuánto podría ganar si todo sale bien.", r: "La ganancia posible no responde qué pasaría con su pago si el valor baja." },
        tapNote,
      ],
      [
        { t: "label", x: "Hazlo tuyo" },
        { t: "q", x: "Completa: «Quiero que mi dinero me ayude a ___»." },
        { t: "chips", x: ["Pronto", "En varios años", "Por confirmar"] },
        { t: "note", x: "O usar el ejemplo de Paula. Elara no asigna un producto a partir del plazo." },
        { t: "when", when: "Si al empezar tocó «Quiero aprender a invertir»", b: [{ t: "elara", x: "Antes de elegir una inversión viene esta pregunta: ¿para qué es ese dinero y cuándo lo necesitarías? Con esa respuesta, aprender a invertir tiene un punto de partida." }] },
        { t: "when", when: "Si tocó «Necesito un respaldo para poder elegir»", b: [{ t: "elara", x: "Si quieres pensarlo un poco más: ¿qué decisión te gustaría poder tomar con ese respaldo?" }, { t: "note", x: "Guardar su respuesta sin prometer un ahorro ni independencia económica." }] },
        { t: "when", when: "Si tocó «Ahora no puedo ahorrar»", b: [{ t: "elara", x: "Puedes aprender con Paula aunque hoy no tengas dinero para apartar. Lo que puedes apartar y lo que quieres entender son cosas distintas." }] },
        { t: "when", when: "Si escribe con sus palabras", b: [{ t: "note", x: "Base: Paula necesita US$300 en cuatro semanas; la pregunta útil es si tendrá esa cantidad en esa fecha, no solo cuánto podría ganar. Si su duda es otra, decirlo y ofrecer guardarla." }] },
      ],
      [
        { t: "label", x: "Lo que te llevas" },
        { t: "elara", x: "Ahorrar e invertir son distintos. Para tu propósito, guardaste: «[propósito y plazo]»." },
        { t: "when", when: "Sin nota propia", b: [{ t: "elara", x: "Ahorrar e invertir son distintos. Primero: para qué y para cuándo." }] },
        { t: "rule", x: "El dinero para un pago cercano no debería depender de que una inversión suba.", mine: true },
        { t: "buttons", x: ["Guardar", "Terminar sin guardar"] },
        { t: "next", x: "Próxima visita: Antes de decir que sí." },
      ],
    ],
    review: "¿Puede explicar la diferencia y por qué el plazo cambia las preguntas? ¿«Respaldo», «colchón» o «guardadito»?",
    changes: [
      "Pregunta de un toque al empezar.",
      "La respuesta a «Quiero aprender a invertir» se reescribió: en V3 sonaba rara y enviaba a la lección de acciones, que no está en este orden.",
      "«Acceso» pasa a «poder sacar el dinero a tiempo».",
    ],
  },
  {
    n: 3,
    code: "B",
    title: "Antes de decir que sí",
    purpose: "Separar el deseo de ayudar o un compromiso de lo que puede asumir hoy.",
    s: [
      [
        { t: "label", x: "Visita 3 de 7" },
        { t: "title", x: "Antes de decir que sí" },
        prev(),
        { t: "q", x: "Si alguien que quieres te pidiera dinero, ¿qué podría hacerte decir que sí aunque aún no sepas si puedes?" },
        { t: "chips", x: ["No quiero parecer egoísta", "Quiero ayudar o ya tengo un acuerdo", "Me preocupa su reacción", "Puedo decidir con tranquilidad"] },
        { t: "note", x: "«No aplica» siempre visible." },
        { t: "rule", x: "Querer ayudar y poder asumir una cantidad son preguntas distintas." },
        { t: "label", x: "Leer o escuchar · audio de Ale opcional" },
        {
          t: "p",
          x: "Querer ayudar y poder dar una cantidad son preguntas distintas. Para revisar la segunda, mira el dinero disponible y los pagos que necesitas cubrir antes de cobrar otra vez. Marta tiene US$200 y necesita US$150 para esos pagos. La cuenta muestra una consecuencia; no decide cuánto quiere a la otra persona ni qué debe responder. Hoy puedes ensayar una respuesta para pedir tiempo, ofrecer algo o decir que no. Puede quedarse como un borrador privado.",
        },
        { t: "cards", x: [["Quiero", "Lo que elegiría ofrecer."], ["Puedo", "Lo que quedaría cubierto."], ["Respondo", "Mis palabras."]] },
      ],
      [
        { t: "label", x: "Ejemplo" },
        { t: "q", x: "Le piden US$100 a Marta. Explora una respuesta: cada una muestra una consecuencia. No hay una respuesta correcta." },
        { t: "opt", x: "«Necesito revisar mis pagos antes de decirte una cantidad.»", r: "Gana tiempo sin prometer una cantidad. La decisión sigue abierta." },
        { t: "opt", x: "«Esta vez puedo ofrecer US$50.»", r: "Le quedan US$150 para los pagos. Eso no prueba que sea la cantidad adecuada: puede haber otros compromisos." },
        { t: "opt", x: "«Esta vez no voy a dar dinero.»", r: "Conserva los US$200. La cuenta no dice cómo se sentirá ella ni cómo responderá la otra persona." },
        tapNote,
      ],
      [
        { t: "label", x: "Hazlo tuyo" },
        { t: "q", x: "Elige una frase del ejemplo, edítala o escribe la tuya." },
        { t: "note", x: "Después: «¿Esto dice lo que quiero ofrecer sin prometer lo que no puedo asumir?». Botón opcional: «Quiero pensarlo un poco más»." },
        { t: "when", when: "Si al empezar tocó «No quiero parecer egoísta» y pide pensarlo más", b: [{ t: "elara", x: "Si supieras que no se va a decepcionar, ¿qué querrías ofrecer?" }, { t: "elara", x: "Podemos escribir eso y dejar pendiente comprobar lo que puedes asumir." }] },
        { t: "when", when: "Si tocó «Quiero ayudar o ya tengo un acuerdo»", b: [{ t: "elara", x: "¿Qué quieres cuidar de ese apoyo y qué necesitas que siga cubierto para ti?" }, { t: "note", x: "El borrador refleja las dos cosas. No suponer que un acuerdo se puede cancelar." }] },
        { t: "when", when: "Si tocó «Me preocupa su reacción»", b: [{ t: "elara", x: "Podemos dejarlo en privado y pensar primero en qué apoyo te haría sentir más segura." }] },
        { t: "when", when: "Si escribe con sus palabras", b: [{ t: "note", x: "Base: dar US$100 le deja US$100 para pagos de US$150; pedir tiempo permite revisar esa diferencia antes de prometer. Si menciona a su mamá u otra persona, nombrarla solo porque ella lo dijo." }] },
      ],
      [
        { t: "label", x: "Lo que te llevas" },
        { t: "elara", x: "Estas son las palabras que elegiste ensayar: «[su frase]»." },
        { t: "when", when: "Si no escribió una frase", b: [{ t: "elara", x: "Querer ofrecer una cantidad y poder asumirla son cosas distintas." }] },
        { t: "rule", x: "Querer ayudar y poder asumir una cantidad son preguntas distintas.", mine: true },
        { t: "buttons", x: ["Conservar", "Editar", "Dejarlo aquí"] },
        { t: "note", x: "Al volver, nunca preguntar si la envió ni decir que puso un límite." },
        { t: "next", x: "Próxima visita: Por qué pagar 20 no siempre baja la deuda en 20." },
      ],
    ],
    review: "¿La pregunta produce reconocimiento sin culpar a la familia? ¿La frase suena a algo que de verdad diría?",
    changes: [
      "Vuelve la pregunta de V2.1 («¿qué podría hacerte decir que sí…?»), que además elige la respuesta de la pantalla 3.",
      "«Ninguna es la respuesta moralmente correcta» pasa a «No hay una respuesta correcta».",
      "Importes en US$ también en las opciones.",
    ],
  },
  {
    n: 4,
    code: "D · deuda",
    title: "Por qué pagar 20 no siempre baja la deuda en 20",
    purpose: "Distinguir el pago realizado de la reducción del saldo cuando hay intereses.",
    s: [
      [
        { t: "label", x: "Visita 4 de 7" },
        { t: "title", x: "Por qué pagar 20 no siempre baja la deuda en 20" },
        prev(),
        { t: "q", x: "¿Te ha pasado que pagas y la deuda casi no baja?" },
        { t: "chips", x: ["Sí, pago y siento que no baja", "No sé bien qué es el interés", "No tengo deuda o es otro tipo de crédito", "Quiero ver el ejemplo"] },
        rest,
        { t: "rule", x: "Mira cuánto de tu pago reduce el saldo y qué cargos se añadieron." },
        { t: "label", x: "Leer o escuchar · audio de Ale opcional" },
        {
          t: "p",
          x: "En este estado de cuenta ficticio, el saldo empieza en US$100. Aparece un cargo de interés de US$10 y después se aplica un pago de US$20. El interés es lo que cuesta usar dinero prestado. Por eso conviene mirar el saldo, los intereses y el pago por separado. Hoy no necesitas calcular la tasa de tu tarjeta: primero vamos a ver qué cambió en la cuenta.",
        },
        { t: "cards", x: [["Saldo inicial", "US$100"], ["Interés", "+ US$10"], ["Pago", "− US$20"]] },
      ],
      [
        { t: "label", x: "Ejemplo" },
        { t: "q", x: "Con esos únicos movimientos, ¿cuánto queda por pagar?" },
        { t: "opt", x: "US$80", r: "Eso resta el pago, pero deja fuera el interés. La cuenta completa da US$90." },
        { t: "opt", x: "US$90", r: "Sí: US$100 + US$10 − US$20 = US$90. Pagaste veinte, pero la deuda bajó diez.", ok: true },
        { t: "opt", x: "US$110", r: "Ese es el saldo con el interés, antes de aplicar el pago de US$20." },
        tapNote,
      ],
      [
        { t: "label", x: "Hazlo tuyo" },
        { t: "q", x: "En un estado de cuenta, ¿qué mirarías primero?" },
        { t: "chips", x: ["Qué saldo tenía antes", "Qué intereses o cargos aparecen", "Cómo se aplicó mi pago"] },
        { t: "note", x: "Puede escribir una pregunta para su banco o tienda. No envía nada ni sube el estado de cuenta." },
        { t: "when", when: "Si al empezar tocó «Sí, pago y siento que no baja»", b: [{ t: "elara", x: "El ejemplo muestra una razón posible: parte del pago cubre un interés añadido. En tu caso habría que mirar los cargos y cómo se aplicó el pago. ¿Guardamos esta pregunta: «¿Cuánto de este pago redujo el saldo y qué cargos se añadieron?»?" }] },
        { t: "when", when: "Si tocó «No sé bien qué es el interés»", b: [{ t: "elara", x: "Es lo que cuesta usar dinero prestado. En el ejemplo se añadieron US$10 al saldo antes de aplicar el pago." }] },
        { t: "when", when: "Si tocó «No tengo deuda o es otro tipo de crédito»", b: [{ t: "elara", x: "Puedes aprender con el estado ficticio. Cómo se calcula el interés depende del contrato y del país." }] },
        { t: "when", when: "Si escribe con sus palabras", b: [{ t: "note", x: "Base: US$100 de saldo más US$10 de interés menos US$20 pagados deja US$90. No dar diagnóstico de su deuda ni una fórmula para toda tarjeta." }] },
      ],
      [
        { t: "label", x: "Lo que te llevas" },
        { t: "elara", x: "Un pago puede cubrir intereses además de reducir lo que debes." },
        { t: "rule", x: "Miro cuánto de mi pago reduce el saldo y qué cargos se añadieron.", mine: true },
        { t: "buttons", x: ["Guardar mi pregunta", "Terminar sin guardar"] },
        { t: "note", x: "Al volver, no suponer que pagó más, llamó a la entidad o bajó su deuda." },
        { t: "next", x: "Próxima visita: Lo que un porcentaje cambia con el tiempo." },
      ],
    ],
    review: "¿La diferencia entre pagar y bajar la deuda responde una duda que reconoce? ¿«Banco o tienda» nombra bien a quién le debe?",
    changes: [
      "El guion y las tarjetas ya no muestran el saldo final (US$90) antes de la pregunta; «Pagaste veinte, pero la deuda bajó diez» pasa a la explicación de la respuesta.",
      "Pregunta de un toque al empezar.",
      "«Entidad» pasa a «banco o tienda».",
    ],
  },
  {
    n: 5,
    code: "E · precios",
    title: "Lo que un porcentaje cambia con el tiempo",
    purpose: "Entender un porcentaje aplicado sobre un precio que ya subió.",
    s: [
      [
        { t: "label", x: "Visita 5 de 7" },
        { t: "title", x: "Lo que un porcentaje cambia con el tiempo" },
        prev(),
        { t: "q", x: "Cuando suben los precios, ¿qué notas más?" },
        { t: "chips", x: ["Mi dinero no me rinde", "Los precios cambian muy rápido donde vivo", "Quiero ver el ejemplo"] },
        rest,
        { t: "rule", x: "La misma cantidad puede comprar menos si suben los precios." },
        { t: "label", x: "Leer o escuchar · audio de Ale opcional" },
        {
          t: "p",
          x: "La inflación es un aumento general de precios. Si tu dinero sigue igual y los precios suben, compras menos. Mira una canasta ficticia que hoy cuesta US$100. Si su precio sube un 10 %, el año siguiente cuesta US$110: tus mismos US$100 ya no alcanzan para la canasta completa. ¿Y si al año siguiente vuelve a subir un 10 %? Lo vemos en la siguiente pantalla.",
        },
        { t: "cards", x: [["Hoy", "Canasta: US$100."], ["Año 1", "+10 %: US$110."], ["Año 2", "+10 % otra vez: ¿?"]] },
      ],
      [
        { t: "label", x: "Ejemplo" },
        { t: "q", x: "¿Cuánto necesitarías al final del segundo año para la misma canasta?" },
        { t: "opt", x: "US$110", r: "Eso corresponde al primer año. El segundo aumento se calcula sobre US$110." },
        { t: "opt", x: "US$120", r: "Eso sumaría US$10 cada año. Aquí el segundo 10 % es US$11." },
        { t: "opt", x: "US$121", r: "Sí: US$100 × 1,10 × 1,10 = US$121. El mismo porcentaje se aplica sobre un precio que ya subió.", ok: true },
        tapNote,
      ],
      [
        { t: "label", x: "Hazlo tuyo" },
        { t: "q", x: "Guarda una idea con tus palabras o la regla de hoy." },
        { t: "note", x: "No se pide calcular su presupuesto ni una proyección personal." },
        { t: "when", when: "Si al empezar tocó «Mi dinero no me rinde»", b: [{ t: "elara", x: "En el ejemplo, la cantidad quedó igual y la canasta costó más. Eso ayuda a explicar por qué un saldo igual puede comprar menos." }] },
        { t: "when", when: "Si tocó «Los precios cambian muy rápido donde vivo»", b: [{ t: "elara", x: "El 10 % es un ejemplo, no el dato de tu país. La idea sirve con cualquier porcentaje: cada subida se calcula sobre el precio que ya subió." }] },
        { t: "when", when: "Si escribe con sus palabras", b: [{ t: "note", x: "Base: US$100 pasan a US$110 y después a US$121 con dos subidas hipotéticas del 10 %. No atribuir una tasa real a su país ni diagnosticar su presupuesto." }] },
      ],
      [
        { t: "label", x: "Lo que te llevas" },
        { t: "elara", x: "Una subida se calcula sobre el precio que ya subió. Por eso, con el tiempo, la misma cantidad compra menos." },
        { t: "rule", x: "La misma cantidad puede comprar menos si suben los precios.", mine: true },
        { t: "buttons", x: ["Guardar", "Terminar sin guardar"] },
        { t: "note", x: "Siempre marcado «EJEMPLO HIPOTÉTICO»." },
        { t: "next", x: "Próxima visita: Cuando una oferta promete demasiado." },
      ],
    ],
    review: "¿Aclara una idea que le importa? ¿Recuerda el mecanismo o solo un número? ¿Un 10 % al año se siente bajo o alto para el grupo?",
    changes: [
      "Solo la variante de precios. La de crecimiento (5 % durante 20 años) espera a que haya rutas; su texto sigue en V3.",
      "El guion ya no dice US$121 antes de la pregunta.",
      "Opción nueva: «Los precios cambian muy rápido donde vivo», con su respuesta (texto nuevo, por revisar).",
    ],
  },
  {
    n: 6,
    code: "F",
    title: "Cuando una oferta promete demasiado",
    purpose: "Reconocer señales para detenerse y comprobar una oferta en otra fuente, por su cuenta.",
    s: [
      [
        { t: "label", x: "Visita 6 de 7" },
        { t: "title", x: "Cuando una oferta promete demasiado" },
        prev(),
        { t: "q", x: "¿Qué se parece más a lo que has vivido con ofertas para hacer crecer tu dinero?" },
        { t: "chips", x: ["Me lo mandó alguien de confianza", "Me llegó por WhatsApp o redes, o era con cripto", "Necesito dinero rápido y me tienta", "No me ha pasado"] },
        rest,
        { t: "rule", x: "Si prometen ganancias altas sin riesgo y te apuran, pausa y verifica." },
        { t: "label", x: "Leer o escuchar · audio de Ale opcional" },
        {
          t: "p",
          x: "Imagina que alguien te ofrece un 20 % al mes, dice que no puedes perder y pide que envíes dinero hoy. Son señales para parar y comprobar. Que te lo mande una persona de confianza o un grupo con muchos mensajes no comprueba la oferta. Busca por tu cuenta quién recibe el dinero, cómo funciona y qué publica la autoridad financiera de tu país. Una dirección o una captura enviada por quien vende no basta: la comprobación tiene que venir de otra fuente.",
        },
        { t: "cards", x: [["Promesa", "«20 % al mes, sin riesgo». Ejemplo ficticio."], ["Presión", "«Solo hoy; trae amigas»."], ["Comprobar", "Quién recibe el dinero, en otra fuente."]] },
      ],
      [
        { t: "label", x: "Ejemplo" },
        { t: "q", x: "Ante ese mensaje, ¿qué te ayuda a comprobarlo por tu cuenta?" },
        { t: "opt", x: "Leer más capturas del mismo grupo.", r: "Las capturas del grupo repiten lo que la oferta muestra; no la comprueban." },
        { t: "opt", x: "Enviar poco dinero para ver qué pasa.", r: "Probar con dinero no dice quién está detrás ni quita el riesgo. Algunas ofertas pagan al principio para ganar confianza." },
        { t: "opt", x: "Buscar por mi cuenta la empresa y la información oficial.", r: "Sí. Así comparas quién es y lo que promete, sin depender solo de quien vende.", ok: true },
        tapNote,
      ],
      [
        { t: "label", x: "Hazlo tuyo" },
        { t: "q", x: "Elige una pregunta para guardar:" },
        { t: "chips", x: ["¿Quién recibe mi dinero?", "¿Cómo produce lo que promete?", "¿Qué puedo comprobar en una fuente oficial?"] },
        { t: "note", x: "No se piden enlaces, contactos ni mensajes del grupo." },
        { t: "when", when: "Si al empezar tocó «Me lo mandó alguien de confianza»", b: [{ t: "elara", x: "Puedes confiar en esa persona y comprobar la oferta por separado. Que la haya compartido no demuestra que ella haya comprobado quién recibe el dinero." }] },
        { t: "when", when: "Si tocó «Me llegó por WhatsApp o redes, o era con cripto»", b: [{ t: "elara", x: "El canal, o que sea cripto, no prueba por sí solo un fraude. Lo que miramos es la promesa sin riesgo, la presión y quién recibe el dinero. Si ya enviaste dinero, puedes dejar el ejercicio aquí y buscar orientación oficial de tu país." }] },
        { t: "when", when: "Si tocó «Necesito dinero rápido y me tienta»", b: [{ t: "elara", x: "Esa necesidad es real. Una promesa de ganancias altas y sin riesgo no la resuelve por sí sola. Podemos guardar una comprobación antes de responder." }] },
        { t: "when", when: "Si escribe con sus palabras", b: [{ t: "note", x: "Base: la oferta promete ganancias altas sin riesgo y exige decidir hoy; lo útil es buscar quién recibe el dinero y una fuente oficial. No ofrecer otra inversión ni acusar a una persona concreta." }] },
      ],
      [
        { t: "label", x: "Lo que te llevas" },
        { t: "elara", x: "Si te prometen ganancias altas sin riesgo y te apuran, pausa y verifica en otra fuente." },
        { t: "rule", x: "Si prometen ganancias altas sin riesgo y me apuran, pauso y verifico.", mine: true },
        { t: "buttons", x: ["Guardar mi pregunta", "Terminar sin guardar"] },
        { t: "note", x: "Al volver, no suponer que recibió, aceptó o rechazó una oferta real." },
        { t: "next", x: "Próxima visita: Una cosa que sí te llevas." },
      ],
    ],
    review: "¿Puede nombrar una señal y una comprobación sin pensar que todo grupo o toda cripto es fraude? Pendiente: qué autoridad nombrar en cada país.",
    changes: [
      "Pregunta de un toque al empezar.",
      "«Comprobación independiente», «contrastar la identidad» y «tipo de activo» pasan a palabras más simples.",
      "«Autoridad financiera correspondiente a tu país» pasa a «de tu país».",
    ],
  },
  {
    n: 7,
    code: "G",
    title: "Una cosa que sí te llevas",
    purpose: "Elegir una regla de la semana y, si quiere, seguir con una duda concreta.",
    s: [
      [
        { t: "label", x: "Visita 7 de 7" },
        { t: "title", x: "Una cosa que sí te llevas" },
        { t: "q", x: "Esta semana viste seis reglas. ¿Cuál te sirve más?" },
        {
          t: "chips",
          x: [
            "Antes de contar un dinero como libre, miro qué pagos salen primero.",
            "El dinero para un pago cercano no debería depender de que una inversión suba.",
            "Querer ayudar y poder asumir una cantidad son preguntas distintas.",
            "Miro cuánto de mi pago reduce el saldo y qué cargos se añadieron.",
            "La misma cantidad puede comprar menos si suben los precios.",
            "Si prometen ganancias altas sin riesgo y me apuran, pauso y verifico.",
          ],
          stack: true,
        },
        { t: "note", x: "«Ninguna todavía» siempre visible." },
        { t: "label", x: "Leer o escuchar · audio de Ale opcional" },
        {
          t: "p",
          x: "Una regla, una pregunta más clara o unas palabras que quieras usar pueden ser lo que te lleves de estas visitas. Mira lo que decidiste conservar y elige una sola cosa que te sirva. Si prefieres, puedes terminar aquí. Si quieres seguir, el siguiente paso puede ser responder una duda concreta, no empezar de cero.",
        },
        { t: "cards", x: [["Tu regla", "La que elegiste hoy."], ["Tus palabras", "Lo que guardaste, si guardaste algo."], ["Sigue abierto", "Una duda real, si la hay."]] },
      ],
      [
        { t: "label", x: "Elige cómo cerrar" },
        { t: "q", x: "¿Cómo quieres cerrar esta semana?" },
        { t: "opt", x: "Quiero conservar una idea.", r: "Se muestran hasta dos de sus notas o reglas para elegir una. Ejemplos: «Confirmo cuándo llega el dinero» o «Puedo pedir tiempo antes de responder»." },
        { t: "opt", x: "Quiero seguir con una duda.", r: "Recupera una pregunta guardada o escribe una. Si lo que Elara ya tiene la responde, lo dice; si no, queda abierta sin prometer una lección que no existe." },
        { t: "opt", x: "Quiero terminar aquí.", r: "Se cierra sin pedir otra respuesta, guardar ni programar nada." },
      ],
      [
        { t: "label", x: "Hazlo tuyo" },
        { t: "when", when: "Si tiene una nota propia", b: [{ t: "elara", x: "«[su nota]». ¿Todavía te representa o quieres cambiarla?" }, { t: "note", x: "Un campo con su frase para reemplazarla. Sin editor por líneas." }] },
        { t: "when", when: "Si no guardó nada", b: [{ t: "elara", x: "Puedes llevarte la regla que elegiste, sin contar nada personal." }] },
        { t: "when", when: "Si quiere aprender más", b: [{ t: "elara", x: "¿Qué duda te serviría resolver ahora?" }, { t: "chips", x: ["Intereses", "Imprevistos", "Invertir", "Otra"] }, { t: "note", x: "Ofrecer solo contenido que exista, o anotarlo como tema pendiente." }] },
        { t: "when", when: "Si escribe con sus palabras", b: [{ t: "note", x: "Base: puede conservar una regla o terminar aquí. Si su duda necesita otro contenido, queda escrita sin fingir que ya está resuelta." }] },
      ],
      [
        { t: "label", x: "Lo que te llevas" },
        { t: "rule", x: "Tu regla de la semana: «[la que eligió]».", mine: true },
        { t: "elara", x: "Puedes volver a «[la tarjeta o pregunta que confirmó]»." },
        { t: "when", when: "Sin tarjeta", b: [{ t: "elara", x: "La explicación queda disponible si quieres volver." }] },
        { t: "buttons", x: ["Terminar"] },
        { t: "note", x: "No decir que ahora sabe invertir, que ahorró o que ganó confianza. No crear tareas ni recordatorios." },
      ],
    ],
    review: "¿Elegir una regla se siente propio? ¿Puede señalar algo que se lleva y terminar sin esfuerzo extra?",
    changes: [
      "Empieza eligiendo una de las seis reglas de la semana. La regla de V3 («Un siguiente paso útil responde una duda concreta») era abstracta.",
      "Así nunca queda vacía, aunque no haya guardado nada.",
    ],
  },
];

export const reviewSheet = {
  eyebrow: "MARÍA / REVISIÓN",
  title: "Revisar una visita completa",
  sub: "Para cada visita: «Lista para probar» o «Necesita ajuste». Citar la frase exacta y proponer otra.",
  head: ["Parte", "Comprobar", "Visita y frase"],
  rows: [
    ["Entrada", "¿La pregunta de un toque se siente como una pregunta suya, no como un formulario?"],
    ["Regla", "¿Puede decirla con sus propias palabras al día siguiente?"],
    ["Enseñanza", "¿Aprende una idea nueva o aclara una duda real?"],
    ["Respuesta", "¿Lo que dice Elara después del toque ayuda, en vez de solo agradecer?"],
    ["Cierre", "¿Deja una regla, una frase o una pregunta concreta?"],
    ["Ritmo", "¿Puede terminar la visita en 3-4 minutos?"],
  ],
  decisionsTitle: "Lo que decide María",
  decisions: [
    "«Respaldo», «colchón» o «guardadito» (visita 2), según cómo habla el grupo.",
    "Moneda: en este borrador «US$» siempre son dólares estadounidenses y los montos son ficticios. ¿Dólares para todas, o la moneda de cada una?",
    "Montos verosímiles: alquiler US$180, electricidad US$170, canasta US$100.",
    "Las frases nuevas de esta versión: las respuestas a «no me alcanza» y «Quiero aprender a invertir», la opción «Los precios cambian muy rápido donde vivo» y la pregunta de la visita 7.",
    "Qué autoridad financiera nombrar en cada país (visita 6).",
  ],
  testTitle: "La prueba",
  test: "Probar en texto con 5-6 mujeres antes de grabar audios. La guía de preguntas de V3 (páginas 21-22) sigue igual. La pregunta que más dice: al día siguiente, antes de abrir la app, «¿Recuerdas la regla de ayer?».",
  laterTitle: "Para más adelante",
  later: "La lección de acciones y la variante de crecimiento esperan a que la app pueda ofrecer rutas distintas. Su texto está en V3 sin cambios.",
};
