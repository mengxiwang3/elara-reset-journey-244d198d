// Generated from V4.1 content-es.mjs by make-data.mjs. Do not edit by hand.
window.ELARA_WEEK = {
 "version": "V4.1",
 "ui": {
  "notePass": "Puedes terminar con la idea de hoy sin escribir nada",
  "checkHint": "Opcional y sin puntuación. Puedes cambiar de opción o seguir sin responder.",
  "savedOk": "Guardado en Tus días",
  "saveFail": "No se pudo guardar. Reintentar",
  "unsaved": "Terminaste por hoy sin guardar nada. Puedes volver a la explicación.",
  "otherQ": "Puedes dejarla como pendiente. Esta sesión no la da por respondida."
 },
 "week": [
  {
   "n": 1,
   "title": "¿Llega antes de que tengas que pagar?",
   "purpose": "Separar un problema de fechas de un dinero que no alcanza.",
   "learn": "A separar un problema de fechas de un dinero que no alcanza.",
   "yesterday": null,
   "photo": {
    "src": "photos/d1.webp",
    "pos": "16% 50%",
    "water": 0.56,
    "alt": "Bahía de Lan Hạ: un muelle de madera y barcas sobre el agua, con montañas entre la niebla"
   },
   "m": {
    "title": null,
    "pass": null,
    "idea": null,
    "s3q": "changed",
    "note": "changed",
    "example": "changed",
    "take": "changed",
    "tryLine": null,
    "next": "changed"
   },
   "s1": {
    "q": "¿Te ha pasado que sabes que te van a pagar, pero igual te preocupa una cuenta que vence antes?",
    "opts": [
     {
      "t": "Sí, no sé cuándo me pagan",
      "r": "La fecha todavía está por confirmar. Hoy puedes preparar una pregunta sin abrir tus cuentas.",
      "m": null
     },
     {
      "t": "Cobro después de que vence un pago",
      "r": "Ese desfase merece atención. Vamos a mirar qué llega primero, sin asumir que puedes mover las fechas.",
      "m": null
     },
     {
      "t": "Aunque cobre, no me alcanza",
      "r": "Entonces no es solo un problema de fechas. Mirarlas puede aclarar el faltante, pero no crea dinero. En el paso 3 puedes anotar cuánto falta, sin resolverlo hoy.",
      "m": "changed"
     },
     {
      "t": "Hoy prefiero no mirar mi dinero",
      "r": "Puedes quedarte con la idea general y el ejemplo opcional. No necesitas compartir cifras.",
      "m": null
     }
    ],
    "pass": "Puedes seguir con la idea de hoy sin elegir una situación"
   },
   "idea": "Un ingreso esperado y un ingreso disponible son cosas distintas. Para un pago cercano importa qué dinero estará disponible antes del vencimiento. Si aun sumando todo lo que entra sigue faltando, hay un faltante total; si el dinero llega después, también hay un desfase de fechas. Pueden pasar las dos cosas a la vez.",
   "rule": "Antes de contar un dinero futuro, confirma cuándo llega.",
   "check": {
    "q": "Te pagan el día 20 y el alquiler vence el día 15. ¿Puedes contar con ese pago para el alquiler?",
    "m": "new",
    "opts": [
     {
      "t": "No: llega después del vencimiento.",
      "r": "Exacto. El día 15 ese dinero todavía no está en tu cuenta, así que no cubre ese pago.",
      "ok": true
     },
     {
      "t": "Sí, porque sé que me van a pagar.",
      "r": "Saber que llegará no lo hace disponible el día 15. Lo que cuenta es el día en que está en tu cuenta.",
      "ok": false
     },
     {
      "t": "No estoy segura, muéstrame.",
      "r": "Pon las fechas en orden: alquiler el 15, cobro el 20. El cobro llega después, así que no cubre ese pago.",
      "ok": false
     }
    ]
   },
   "s3": {
    "q": "¿Qué te ayudaría hoy?",
    "opts": [
     {
      "t": "Preparar una pregunta sobre mi cobro",
      "r": "Puedes usar: “¿Qué día estará el dinero disponible en mi cuenta?”. No tienes que enviarla ahora.",
      "m": null,
      "phrase": "¿Qué día estará el dinero disponible en mi cuenta?"
     },
     {
      "t": "Identificar el pago que vence primero",
      "r": "Piensa solo en el próximo vencimiento. Después compáralo con la fecha confirmada del cobro; si falta una fecha, esa es la información pendiente.",
      "m": null,
      "phrase": null
     },
     {
      "t": "Anotar cuánto falta, sin resolverlo hoy",
      "r": "Puedes escribir solo el pago y la diferencia. Saber cuánto falta es información, no un fracaso. No tienes que resolverlo hoy.",
      "m": "new",
      "phrase": null
     },
     {
      "t": "Entenderlo con un ejemplo",
      "r": "Abre el ejemplo de abajo. No hace falta hacer una cuenta tú sola.",
      "m": null,
      "phrase": null
     }
    ]
   },
   "note": "La fecha que quiero confirmar es…",
   "noteAlt": {
    "opt": 2,
    "text": "Me faltan… para…"
   },
   "example": "hay US$300 disponibles. Sale un alquiler de US$180 y luego vence la luz por US$170. El cobro de US$200 llega dos días después de la luz. Quedan US$120 antes de la luz: ese día faltan US$50. El cobro posterior no cubre un vencimiento anterior.",
   "rules": null,
   "take": "Una pregunta para confirmar una fecha, lo que falta anotado, o la regla de hoy.",
   "tryLine": "Si te sirve, confirma una fecha antes de comprometer ese dinero.",
   "next": "¿Qué te gustaría que tu dinero te permitiera?"
  },
  {
   "n": 2,
   "title": "¿Qué te gustaría que tu dinero te permitiera?",
   "purpose": "Darle al dinero un propósito y una fecha antes de elegir qué hacer con él.",
   "learn": "A darle al dinero un propósito y una fecha antes de elegir qué hacer con él.",
   "yesterday": "Antes de contar un dinero futuro, confirma cuándo llega.",
   "photo": {
    "src": "photos/d2.webp",
    "pos": "20% 50%",
    "water": 0.72,
    "alt": "Bahía de Lan Hạ: un acantilado verde junto al agua y montañas entre la niebla"
   },
   "m": {
    "title": "changed",
    "pass": null,
    "idea": null,
    "s3q": null,
    "note": null,
    "example": null,
    "take": null,
    "tryLine": null,
    "next": null
   },
   "s1": {
    "q": "Cuando piensas en ahorrar o invertir, ¿qué te importa más hoy?",
    "opts": [
     {
      "t": "Sentirme menos expuesta ante un imprevisto",
      "r": "Un respaldo puede darte margen. Empecemos por para qué lo querrías, sin pedirte una cantidad.",
      "m": null
     },
     {
      "t": "Aprender a invertir, aunque todavía no empiece",
      "r": "Puedes aprender desde ahora. Primero separaremos el dinero que necesitarías pronto del que podrías dejar más tiempo.",
      "m": null
     },
     {
      "t": "Tengo un pago cercano que me preocupa",
      "r": "La fecha de ese pago cambia la decisión. Necesitas pensar en disponibilidad y en qué pasaría si el valor bajara.",
      "m": null
     },
     {
      "t": "Ahora no puedo apartar dinero",
      "r": "No hace falta ahorrar hoy para aprender esta diferencia. No te vamos a pedir una meta de ahorro.",
      "m": null
     }
    ],
    "pass": "Puedes seguir con la idea de hoy sin elegir una situación"
   },
   "idea": "Ahorrar es apartar dinero para usarlo después. Invertir es poner dinero en algo buscando una ganancia y aceptando riesgos, incluida una pérdida. Para un pago cercano, importa poder acceder al dinero y que no dependa de una subida. Tener más tiempo no elimina el riesgo. Antes de comparar opciones, pregunta: ¿para qué es y cuándo lo necesito?",
   "rule": "El dinero para un pago cercano no debería depender de que una inversión suba.",
   "check": {
    "q": "Tienes un dinero para un pago dentro de un mes. Una opción promete más, pero su valor puede bajar. ¿Qué miras primero?",
    "m": "new",
    "opts": [
     {
      "t": "Si el dinero estará completo y disponible en esa fecha.",
      "r": "Sí. Para un pago cercano, lo primero es tener el dinero ese día. La ganancia posible va después.",
      "ok": true
     },
     {
      "t": "Cuánto ha subido últimamente.",
      "r": "Una subida pasada no asegura cuánto valdrá dentro de un mes.",
      "ok": false
     },
     {
      "t": "No estoy segura, muéstrame.",
      "r": "Primero: ¿para qué es y cuándo lo necesitas? Si es para un pago cercano, importa que esté ahí ese día, aunque algo baje.",
      "ok": false
     }
    ]
   },
   "s3": {
    "q": "Elige una pregunta para llevarte.",
    "opts": [
     {
      "t": "¿Para qué y para cuándo quiero este dinero?",
      "r": "Puedes pensar en un pago, un imprevisto o una meta de varios años. Si aún no sabes la fecha, déjala por confirmar.",
      "m": null,
      "phrase": null
     },
     {
      "t": "¿Puedo retirarlo cuando lo necesite?",
      "r": "Antes de elegir una opción, revisa cuándo puedes sacar el dinero y qué restricciones o costos tiene.",
      "m": null,
      "phrase": null
     },
     {
      "t": "Hoy solo quiero aprender la diferencia",
      "r": "Quédate con esto: apartar dinero y aceptar riesgo para buscar una ganancia son decisiones distintas.",
      "m": null,
      "phrase": null
     }
    ]
   },
   "note": "Querría este dinero para… Lo necesitaría…",
   "noteAlt": null,
   "example": "necesitas US$300 para mudarte en cuatro semanas. Si una inversión baja, podrías no tener los US$300 ese día. Una ganancia anterior no asegura el dinero de tu mudanza.",
   "rules": null,
   "take": "Una pregunta sobre propósito, plazo o acceso al dinero.",
   "tryLine": "Si te sirve, ponle un para qué y un para cuándo a una cantidad, sin elegir todavía un producto.",
   "next": "Antes de decir que sí"
  },
  {
   "n": 3,
   "title": "Antes de decir que sí",
   "purpose": "Preparar una respuesta que te dé tiempo para decidir.",
   "learn": "A preparar una respuesta que te dé tiempo para decidir.",
   "yesterday": "El dinero para un pago cercano no debería depender de que una inversión suba.",
   "photo": {
    "src": "photos/d3.webp",
    "pos": "42% 50%",
    "water": 0.6,
    "alt": "Bahía de Lan Hạ: balsas de madera sobre agua tranquila, entre montañas verdes"
   },
   "m": {
    "title": null,
    "pass": null,
    "idea": null,
    "s3q": null,
    "note": null,
    "example": null,
    "take": null,
    "tryLine": null,
    "next": null
   },
   "s1": {
    "q": "¿Qué podría hacerte decir que sí a dar dinero antes de saber si puedes?",
    "opts": [
     {
      "t": "Me preocupa parecer egoísta",
      "r": "Puedes querer a alguien y revisar lo que puedes asumir. Hoy puedes practicar una respuesta sin enviarla.",
      "m": null
     },
     {
      "t": "Ya ayudo cada mes y me cuesta cambiarlo",
      "r": "Un compromiso habitual también se puede revisar. No vamos a decidir por ti cuánto dar.",
      "m": null
     },
     {
      "t": "Me preocupa cómo reaccionaría la otra persona",
      "r": "No necesitas ensayar ni poner un límite si eso te haría sentir insegura. Puedes pasar y pensar qué apoyo necesitas. Si alguien te presiona o controla tu dinero y te sientes en riesgo, busca apoyo en alguien de confianza o en una línea de ayuda de tu país.",
      "m": "changed"
     },
     {
      "t": "Esto no me pasa; quiero aprender una frase",
      "r": "Puedes practicar una respuesta general y adaptarla solo si algún día te sirve.",
      "m": null
     }
    ],
    "pass": "Puedes seguir con la idea de hoy sin elegir una situación"
   },
   "idea": "Querer ayudar, poder dar una cantidad y decidir darla son preguntas distintas. Mira qué pagos necesitas cubrir antes de volver a cobrar. Esa información muestra consecuencias; no mide cuánto quieres a alguien. Pedir tiempo puede mantener la decisión abierta sin prometer dinero.",
   "rule": "Puedes querer ayudar y tomarte tiempo para ver lo que puedes asumir.",
   "check": {
    "q": "Te piden US$100 para mañana y tienes pagos esta semana. ¿Qué respuesta te da tiempo sin prometer dinero?",
    "m": "new",
    "opts": [
     {
      "t": "«Necesito revisar mis pagos antes de decirte una cantidad.»",
      "r": "Sí. Es una respuesta completa: no dice que no ni promete una cantidad todavía.",
      "ok": true
     },
     {
      "t": "«Sí, mañana te lo paso.»",
      "r": "Puede ser tu decisión. Si todavía no revisaste tus pagos, comprometes el dinero antes de saber si puedes.",
      "ok": false
     },
     {
      "t": "No estoy segura, muéstrame.",
      "r": "Busca la respuesta que todavía no promete una cantidad: «Necesito revisar mis pagos antes de decirte una cantidad.»",
      "ok": false
     }
    ]
   },
   "s3": {
    "q": "¿Qué respuesta te gustaría ensayar?",
    "opts": [
     {
      "t": "Necesito tiempo para revisar mis pagos",
      "r": "Frase para editar: “Necesito revisar mis pagos antes de decirte una cantidad”.",
      "m": null,
      "phrase": "Necesito revisar mis pagos antes de decirte una cantidad"
     },
     {
      "t": "Quiero revisar la ayuda que doy cada mes",
      "r": "Frase para editar: “Quiero revisar qué cantidad puedo sostener antes de comprometerme para el próximo mes”.",
      "m": null,
      "phrase": "Quiero revisar qué cantidad puedo sostener antes de comprometerme para el próximo mes"
     },
     {
      "t": "No quiero preparar una respuesta hoy",
      "r": "Puedes terminar con la regla. No tienes que tener una conversación ni explicar por qué pasas.",
      "m": null,
      "phrase": null
     }
    ]
   },
   "note": "Mi frase para ensayar…",
   "noteAlt": null,
   "example": "tienes US$200 y pagos de US$150 antes de cobrar. Dar US$100 dejaría US$100 para esos pagos: faltarían US$50. Esto muestra una consecuencia, no decide cuánto debes ofrecer.",
   "rules": null,
   "take": "Una frase que hayas confirmado, o solo la regla.",
   "tryLine": "Si te sirve y te sientes segura, guarda tu frase a mano. No tienes que enviarla.",
   "next": "Pago, pero ¿qué está bajando?"
  },
  {
   "n": 4,
   "title": "Pago, pero ¿qué está bajando?",
   "purpose": "Entender qué parte de un pago reduce lo que debes.",
   "learn": "A entender qué parte de un pago reduce lo que debes.",
   "yesterday": "Puedes querer ayudar y tomarte tiempo para ver lo que puedes asumir.",
   "photo": {
    "src": "photos/d4.webp",
    "pos": "30% 50%",
    "water": 0.72,
    "alt": "Bahía de Lan Hạ: la entrada de una cueva de roca sobre agua verde"
   },
   "m": {
    "title": null,
    "pass": null,
    "idea": null,
    "s3q": null,
    "note": null,
    "example": "changed",
    "take": null,
    "tryLine": null,
    "next": null
   },
   "s1": {
    "q": "Si alguna vez pagaste una deuda y sentiste que casi no bajó, ¿qué te gustaría entender?",
    "opts": [
     {
      "t": "Por qué baja menos de lo que pago",
      "r": "Un cargo de interés puede explicar parte de la diferencia. Vamos a separar los movimientos sin suponer qué ocurrió en tu cuenta.",
      "m": null
     },
     {
      "t": "Qué significa que me cobren interés",
      "r": "Es el costo de usar dinero prestado. Veremos cómo un cargo se suma al saldo.",
      "m": null
     },
     {
      "t": "Qué mirar en mi estado de cuenta",
      "r": "Puedes buscar saldo anterior, cargos, pagos y saldo nuevo. No necesitas subir el documento.",
      "m": null
     },
     {
      "t": "No tengo deuda o prefiero no usar la mía",
      "r": "Puedes aprender con una explicación breve. El ejemplo numérico es opcional.",
      "m": null
     }
    ],
    "pass": "Puedes seguir con la idea de hoy sin elegir una situación"
   },
   "idea": "El saldo es lo que debes en una fecha. Los intereses y otros cargos pueden aumentarlo; los pagos lo reducen. Por eso, pagar una cantidad no siempre reduce la deuda en esa misma cantidad. Para entender el cambio, mira los movimientos por separado. Cada contrato tiene sus propias reglas de cálculo y aplicación de pagos.",
   "rule": "Mira por separado el saldo, los cargos y el pago.",
   "check": {
    "q": "Debías US$200. Este mes se sumaron US$15 de interés y pagaste US$40. ¿Cuánto bajó la deuda?",
    "m": "new",
    "opts": [
     {
      "t": "US$25.",
      "r": "Sí. US$200 + US$15 − US$40 = US$175. Pagaste US$40, pero la deuda bajó US$25.",
      "ok": true
     },
     {
      "t": "US$40.",
      "r": "Eso es lo que pagaste. Antes se sumaron US$15 de interés, así que la deuda bajó US$25.",
      "ok": false
     },
     {
      "t": "No estoy segura, muéstrame.",
      "r": "Primero suma el cargo: 200 + 15 = 215. Luego resta el pago: 215 − 40 = 175. Antes eran 200: bajó 25.",
      "ok": false
     }
    ]
   },
   "s3": {
    "q": "¿Qué pregunta te serviría más?",
    "opts": [
     {
      "t": "¿Qué cargos se añadieron?",
      "r": "Busca los cargos del período y cómo están descritos. Si alguno no se entiende, esa es una pregunta para quien emite la cuenta.",
      "m": null,
      "phrase": null
     },
     {
      "t": "¿Cuánto bajó realmente el saldo?",
      "r": "Compara saldo anterior y saldo nuevo, teniendo en cuenta compras, cargos y pagos del mismo período.",
      "m": null,
      "phrase": null
     },
     {
      "t": "Quiero ver una cuenta sencilla",
      "r": "Abre el ejemplo opcional: muestra solo un interés y un pago, sin otros movimientos.",
      "m": null,
      "phrase": null
     }
    ]
   },
   "note": "La línea o pregunta que quiero aclarar es…",
   "noteAlt": null,
   "example": "saldo US$100 + interés US$10 − pago US$20 = US$90. Pagaste US$20, pero el saldo bajó US$10. Es una cuenta simplificada; no calcula la tasa ni las condiciones de tu deuda.",
   "rules": null,
   "take": "Una pregunta concreta para entender un movimiento.",
   "tryLine": "Si te sirve, localiza una línea en tu próximo estado de cuenta. No necesitas resolver toda la deuda hoy.",
   "next": "¿Cambió tu gasto o cambió el precio?"
  },
  {
   "n": 5,
   "title": "¿Cambió tu gasto o cambió el precio?",
   "purpose": "Distinguir una subida de precio de un cambio en lo que compras.",
   "learn": "A distinguir una subida de precio de un cambio en lo que compras.",
   "yesterday": "Mira por separado el saldo, los cargos y el pago.",
   "photo": {
    "src": "photos/d5.webp",
    "pos": "50% 50%",
    "water": 0.6,
    "alt": "Bahía de Lan Hạ: un canal de agua quieta entre dos laderas verdes"
   },
   "m": {
    "title": null,
    "pass": null,
    "idea": null,
    "s3q": null,
    "note": null,
    "example": null,
    "take": null,
    "tryLine": null,
    "next": null
   },
   "s1": {
    "q": "Cuando sientes que el dinero rinde menos, ¿qué te gustaría poder distinguir?",
    "opts": [
     {
      "t": "Compro lo mismo, pero pago más",
      "r": "Comparar el mismo producto y cantidad ayuda a ver el cambio de precio, sin culparte de entrada.",
      "m": null
     },
     {
      "t": "No sé si subió el precio o compré más",
      "r": "Separar precio por unidad y cantidad puede aclararlo. No necesitas revisar todas tus compras.",
      "m": null
     },
     {
      "t": "Los precios cambian muy rápido donde vivo",
      "r": "Puedes usar una fecha de comparación que tenga sentido donde vives. No usaremos una tasa como si fuera la de tu país.",
      "m": null
     },
     {
      "t": "Hoy solo quiero entender la idea",
      "r": "La idea principal es poder de compra: cuánto puedes comprar con la misma cantidad de dinero.",
      "m": null
     }
    ],
    "pass": "Puedes seguir con la idea de hoy sin elegir una situación"
   },
   "idea": "Si el mismo producto y cantidad cuestan más, el mismo dinero compra menos. La inflación es una subida general de precios; un solo producto no mide la inflación de tu país. Para comparar una compra, mira el precio por la misma cantidad y las fechas. Un envase más pequeño también puede cambiar lo que recibes por tu dinero.",
   "rule": "Para comparar precios, compara también la cantidad.",
   "check": {
    "q": "Antes, 1 kg de arroz costaba US$2. Ahora el paquete trae 800 g y sigue costando US$2. ¿Qué cambió?",
    "m": "new",
    "opts": [
     {
      "t": "Pagas lo mismo por menos: en la práctica, subió.",
      "r": "Sí. Por kilo, ahora pagas US$2,50.",
      "ok": true
     },
     {
      "t": "Nada, porque cuesta lo mismo.",
      "r": "El paquete cuesta igual, pero trae 200 g menos. Por kilo, el precio pasó de US$2 a US$2,50.",
      "ok": false
     },
     {
      "t": "No estoy segura, muéstrame.",
      "r": "Compara la misma cantidad: 1 kg costaba US$2. Ahora 800 g cuestan US$2, así que 1 kg costaría US$2,50.",
      "ok": false
     }
    ]
   },
   "s3": {
    "q": "¿Qué comparación te serviría?",
    "opts": [
     {
      "t": "Elegir algo que compro seguido",
      "r": "Piensa en un producto. Para compararlo, usa la misma cantidad, presentación y moneda en dos fechas.",
      "m": null,
      "phrase": null
     },
     {
      "t": "Revisar si cambió el tamaño del envase",
      "r": "Mira cuánto trae. Dos precios iguales pueden dar cantidades distintas; el precio por unidad ayuda a verlo.",
      "m": null,
      "phrase": null
     },
     {
      "t": "Entender cómo se acumulan las subidas",
      "r": "Abre el ejemplo opcional. Cada nueva subida se calcula sobre el precio que ya cambió.",
      "m": null,
      "phrase": null
     }
    ]
   },
   "note": "Quiero comparar… La cantidad y las fechas serían…",
   "noteAlt": null,
   "example": "una canasta cuesta US$100. Sube 10 % y llega a US$110. Otra subida de 10 % suma US$11: llega a US$121. No es la inflación de ningún país; solo muestra cómo se acumulan porcentajes.",
   "rules": null,
   "take": "Una comparación concreta, o la regla de hoy.",
   "tryLine": "Si te sirve, compara un producto y su cantidad. Ver una subida no significa que tengas que comprar menos ni invertir hoy.",
   "next": "Cuando una promesa toca una necesidad"
  },
  {
   "n": 6,
   "title": "Cuando una promesa toca una necesidad",
   "purpose": "Preparar una pausa y una comprobación antes de enviar dinero.",
   "learn": "A preparar una pausa y una comprobación antes de enviar dinero.",
   "yesterday": "Para comparar precios, compara también la cantidad.",
   "photo": {
    "src": "photos/d6.webp",
    "pos": "42% 50%",
    "water": 0.74,
    "alt": "Bahía de Lan Hạ: un pueblo flotante con casas de colores sobre el agua"
   },
   "m": {
    "title": null,
    "pass": "changed",
    "idea": "changed",
    "s3q": null,
    "note": null,
    "example": null,
    "take": null,
    "tryLine": null,
    "next": null
   },
   "s1": {
    "q": "¿Qué podría hacerte confiar en una oferta de dinero antes de comprobarla?",
    "opts": [
     {
      "t": "Me la recomienda alguien cercano",
      "r": "Puedes confiar en esa persona y comprobar la oferta por separado. La recomendación no verifica quién recibe el dinero.",
      "m": null
     },
     {
      "t": "Necesito que el dinero me rinda rápido",
      "r": "Esa necesidad puede hacer atractiva una promesa. No te obliga a decidir hoy ni a arriesgar dinero para probarla.",
      "m": null
     },
     {
      "t": "Me dicen que la oportunidad se acaba hoy",
      "r": "La presión reduce el tiempo para comprobar. Puedes preparar una respuesta que no comprometa dinero.",
      "m": null
     },
     {
      "t": "Ya envié dinero y estoy preocupada",
      "r": "Puedes dejar el ejercicio. Contacta pronto al banco o servicio de pago y busca ayuda oficial de tu país. No necesitas contar detalles aquí.",
      "m": null
     }
    ],
    "pass": "Puedes seguir con la idea de hoy y ver qué señales mirar, sin tener una oferta"
   },
   "idea": "Hay tres señales para detenerte: te prometen ganancias altas con poco o ningún riesgo, te presionan para pagar ya o te premian por traer gente. No envíes dinero como prueba de seguridad. Busca tú misma la autoridad financiera de tu país. Comprueba quién es, si tiene permiso para esa actividad y cómo contactarla por otro medio. Una empresa registrada también puede ser suplantada, y el registro no garantiza ganancias.",
   "rule": "Ganancias altas, “sin riesgo” y prisa: para y comprueba antes de enviar dinero.",
   "check": {
    "q": "Te escriben: «Gana 15 % cada semana, garantizado. Quedan pocos cupos.» ¿Qué haces primero?",
    "m": "new",
    "opts": [
     {
      "t": "Paro y compruebo por mi cuenta antes de enviar dinero.",
      "r": "Sí. Una ganancia alta, «garantizado» y prisa, juntas, son una señal para detenerse.",
      "ok": true
     },
     {
      "t": "Envío poco para probar.",
      "r": "Enviar poco no comprueba nada. Al principio pueden devolverte algo para que confíes y envíes más.",
      "ok": false
     },
     {
      "t": "No estoy segura, muéstrame.",
      "r": "Busca las tres señales: ganancia alta, «garantizado» y «quedan pocos cupos». Con eso basta para parar y comprobar antes de enviar dinero.",
      "ok": false
     }
    ]
   },
   "s3": {
    "q": "¿Qué te gustaría tener a mano?",
    "opts": [
     {
      "t": "Una frase para ganar tiempo",
      "r": "Puedes usar: “No voy a enviar dinero antes de revisar quién lo recibe y cómo funciona”.",
      "m": null,
      "phrase": "No voy a enviar dinero antes de revisar quién lo recibe y cómo funciona"
     },
     {
      "t": "Una lista breve para comprobar",
      "r": "Busca por tu cuenta la autoridad oficial; revisa identidad y autorización para la actividad; usa datos de contacto obtenidos fuera del mensaje.",
      "m": null,
      "phrase": null
     },
     {
      "t": "Orientación porque ya envié dinero",
      "r": "Contacta al banco o servicio que usaste para pagar y pregunta qué opciones hay. Busca ayuda oficial local; no envíes más dinero para supuestamente liberar lo anterior.",
      "m": null,
      "phrase": null
     }
    ]
   },
   "note": "La frase o comprobación que quiero recordar es…",
   "noteAlt": null,
   "example": "“20 % al mes, sin riesgo; envía hoy y gana más si traes amigas”. No necesitas calcular una rentabilidad: identifica la promesa, la prisa y el reclutamiento. WhatsApp o cripto, por sí solos, no prueban una estafa.",
   "rules": null,
   "take": "Una frase de pausa o una comprobación independiente.",
   "tryLine": "Si vuelve a aparecer una oferta, usa tu pausa antes de responder. No hace falta buscar una para practicar.",
   "next": "¿Qué te serviría volver a encontrar?"
  },
  {
   "n": 7,
   "title": "¿Qué te serviría volver a encontrar?",
   "purpose": "Recuperar una idea útil y dejarla a mano, sin demostrar que cambiaste.",
   "learn": "A recuperar una idea útil y dejarla a mano, sin demostrar que cambiaste.",
   "yesterday": "Ganancias altas, “sin riesgo” y prisa: para y comprueba antes de enviar dinero.",
   "photo": {
    "src": "photos/lh-hero.jpg",
    "pos": "18% 50%",
    "water": 0.62,
    "alt": "Bahía de Lan Hạ: barcas de madera en el agua, con montañas entre la niebla"
   },
   "m": {
    "title": null,
    "pass": null,
    "idea": "changed",
    "s3q": null,
    "note": null,
    "example": null,
    "take": null,
    "tryLine": "changed",
    "next": null
   },
   "s1": {
    "q": "Al pensar en esta semana, ¿qué se parece más a lo que te pasó?",
    "opts": [
     {
      "t": "Hay una idea que quiero conservar",
      "r": "Puedes elegirla de la lista. No hace falta que la hayas puesto en práctica.",
      "m": null
     },
     {
      "t": "Entendí algo, pero no lo usé",
      "r": "Entender una idea y usarla son cosas distintas. Puedes quedarte con ella sin contar un resultado.",
      "m": null
     },
     {
      "t": "Todavía tengo una duda",
      "r": "Puedes anotar qué falta entender. Guardarla no significa que Elara ya la respondió.",
      "m": null
     },
     {
      "t": "No encontré algo que me sirviera",
      "r": "No tienes que elegir una regla para terminar. Si quieres, puedes decir qué esperabas encontrar.",
      "m": null
     }
    ],
    "pass": "Puedes seguir con la idea de hoy sin elegir una situación"
   },
   "idea": "Esta semana vimos seis ideas: fechas, propósito, ayuda, deudas, precios y ofertas. No hace falta que hayas ahorrado o cambiado algo. Puedes quedarte con una idea, dejar una duda o terminar sin guardar nada.",
   "rule": "Elige una idea que te sirva, o termina sin guardar.",
   "check": null,
   "s3": {
    "q": "Sin abrir la lista, ¿qué te viene a la mente?",
    "opts": [
     {
      "t": "Una fecha o una pregunta que quiero confirmar",
      "r": "Si el pago vence antes del cobro, ese ingreso todavía no está disponible para ese vencimiento. Puedes recuperar la pregunta del día 1.",
      "m": null,
      "phrase": null
     },
     {
      "t": "Una frase que podría darme tiempo",
      "r": "Puedes querer ayudar y revisar tus pagos antes de comprometer una cantidad. Puedes recuperar o escribir una frase del día 3.",
      "m": null,
      "phrase": null
     },
     {
      "t": "Prefiero ver las reglas de la semana",
      "r": "Abre la lista de abajo. Puedes elegir una, escribir la tuya o no elegir ninguna.",
      "m": null,
      "phrase": null
     }
    ]
   },
   "note": "Mi idea, mi frase o lo que todavía quiero entender…",
   "noteAlt": null,
   "example": null,
   "rules": {
    "intro": "Después de intentar recordar, puedes elegir una regla de la lista, escribir la tuya o terminar sin elegir.",
    "list": [
     "Antes de contar un dinero futuro, confirma cuándo llega.",
     "El dinero para un pago cercano no debería depender de que una inversión suba.",
     "Puedes querer ayudar y tomarte tiempo para ver lo que puedes asumir.",
     "Mira por separado el saldo, los cargos y el pago.",
     "Para comparar precios, compara también la cantidad.",
     "Ganancias altas, “sin riesgo” y prisa: para y comprueba antes de enviar dinero."
    ]
   },
   "take": "Una sola regla, una frase confirmada o una duda pendiente. También puedes no guardar nada.",
   "tryLine": "Si te sirve, deja lo que elegiste donde puedas volver a encontrarlo. Gracias por darte este tiempo esta semana. No hay otra tarea que completar.",
   "next": null
  }
 ],
 "changes": [
  {
   "t": "Comprobación opcional en los días 1 a 6",
   "d": "Después de la idea, una pregunta corta con tres opciones y respuesta fija; una de ellas es «No estoy segura, muéstrame». Sin puntuación ni bloqueo. En V4 nada le mostraba si había entendido la idea."
  },
  {
   "t": "Día 1: un camino para «no me alcanza»",
   "d": "La respuesta anuncia el paso 3; el paso 3 pregunta «¿Qué te ayudaría hoy?» y añade «Anotar cuánto falta, sin resolverlo hoy»; la nota acepta «Me faltan… para…»; «Te llevas» lo incluye. En V4, todas las opciones del paso 3 eran sobre fechas."
  },
  {
   "t": "Día 2: el título tiene referente",
   "d": "«¿Qué te gustaría que tu dinero te permitiera?» en vez de «…ese dinero…», que en el inicio de Atlas aparece solo, sin una frase anterior."
  },
  {
   "t": "Día 7: sin suponer y sin lenguaje de prueba",
   "d": "«Esta semana vimos seis ideas…» en vez de «Esta semana separaste…», que da por hecho que hizo todos los días. «Gracias por darte este tiempo esta semana» en vez de «Gracias por probar esta semana»."
  },
  {
   "t": "Texto más claro",
   "d": "Día 1: «dos días después de la luz». Día 3: «poner un límite». Día 4: signo menos (−). Día 6: cinco opciones en vez de seis («reconocer señales» pasa a «Prefiero pasar») y una idea en frases más cortas. Día 7: idea más corta."
  },
  {
   "t": "Apoyo en momentos sensibles",
   "d": "Día 3: una línea para quien siente presión o control sobre su dinero. Día 6: «ayuda oficial de tu país» sigue genérica hasta verificar organismos por país."
  }
 ],
 "decide": [
  "La línea de apoyo del día 3: ¿se queda, cambia o sale?",
  "¿Qué organismos nombrar en el día 6 para Colombia, México y los demás países del grupo? Hay que verificarlos con fuentes oficiales antes de escribirlos.",
  "Día 1: la comprobación usa «alquiler», como el ejemplo de V4. ¿«Alquiler» o «arriendo» para el grupo?",
  "Las seis comprobaciones son texto nuevo: ¿ayudan o se sienten como examen?"
 ],
 "look": "En cualquier día: “Tengo otra pregunta” abre un campo opcional separado. Respuesta fija: “Puedes dejarla como pendiente. Esta sesión no la da por respondida”. Solo decir “guardada” tras confirmar una nota no vacía y completar el guardado. Si pasa una actividad, permitir seguir a la enseñanza o al cierre sin atribuirle una elección."
};
