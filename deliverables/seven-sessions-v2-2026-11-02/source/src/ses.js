/* ---------- Seven-session Money test (prototype) · v2, 2 Nov 2026: S2 fold, branched S4–S7 for apoyo/negocio, three A/B pairs ----------
   Content: deliverables/handoff-complete-2026-10-30-seven-sessions/DEV-HANDOFF.md §2–3 (from the 210-day curriculum, A/B picks).
   Scripted replies are PROTOTYPE EXAMPLES: one per choice option; free text gets a scripted reply only when it equals a prepared
   example answer, otherwise an honest acknowledgement. In the app the reply is generated from purpose + takeaway + guidance.
   Persistence is this page's memory only. */
var SES_PATHS={empleo:'Empleo',negocio:'Negocio',apoyo:'Aclarar o apoyo',ninguno:'Ninguno por ahora'};
var SES_CAMINO_OPTS=[['empleo','Empleo'],['negocio','Negocio'],['apoyo','Aclarar o apoyo'],['ninguno','Ninguno por ahora']];
var SES_GENERIC='Guardé tu frase.';
var SES_LOW='Está bien. No se pierde nada: lo que respondiste queda guardado y puedes volver cuando quieras.';
var SES=[
 {n:1,src:'MONEY-W1-D1 (pregunta B) + respuesta de W1-D5',title:'Una pregunta que puedas averiguar',
  purpose:'Hoy conviertes una preocupación de dinero en una pregunta que puedas averiguar.',
  next:'Mañana, en dos minutos, sabrás si te toca cubrir lo básico, ordenar fechas o buscar ingresos.',
  steps:[
   {id:'tema',kind:'choose',q:'Si hoy aclararas un solo tema de dinero, ¿cuál te sería más útil?',
    opts:['Cubrir algo básico ahora','Conseguir ingresos','Aclarar un cobro o un pago','Entender una deuda','Preparar una decisión','Otro','No sé hoy'],
    path:['apoyo','empleo','apoyo','apoyo',null,null,null],
    replies:['Entonces hoy empezamos por lo básico, no por buscar ingresos. En el siguiente paso escribe qué necesitas cubrir y lo convertimos en una pregunta para un apoyo de tu zona; basta el país o la región.',
     'Hoy no hace falta elegir un trabajo. Basta una pregunta concreta, como qué tipo de tarea podrías ofrecer o cuánto tiempo real tienes a la semana.',
     'Con un cobro o un pago casi siempre falta un dato: la fecha, el importe o quién lo confirma. En el siguiente paso puedes escribir cuál te falta.',
     'Con una deuda, lo útil hoy es una sola pregunta: cuánto queda, qué fecha importa o qué pasa si te atrasas. No hace falta revisarla entera.',
     'Una decisión se aclara con el dato que te falta para elegir. En el siguiente paso puedes escribir cuál es.',
     'Vale. En el siguiente paso, escríbelo como una pregunta que alguien pueda responder: quién, qué o cuándo.',
     'Está bien no saberlo. Un buen comienzo es la pregunta que más vueltas te da, aunque sea pequeña.'],
    suggest:['¿Dónde puedo pedir apoyo para cubrir lo básico en mi zona?','¿Cuánto tiempo real tengo a la semana para un ingreso?','¿En qué fecha se hará este pago y quién me lo confirma?','¿Cuánto queda por pagar y qué fecha importa?','¿Qué dato me falta para decidir?','¿Qué es lo que más vueltas me da con el dinero?','¿Qué es lo que más vueltas me da con el dinero?'],
    guidance:'Di qué significa trabajar hoy en lo que eligió. Si eligió «Cubrir algo básico», pasa a apoyo: ofrece formular una pregunta para una fuente de apoyo de su zona (solo país o región). Sin tareas de ingresos.'},
   {id:'pregunta',kind:'reflect',optional:true,q:'La primera pregunta que necesito resolver es…',ph:'Ej.: ¿qué día me pagan?',
    examples:[{t:'¿Qué día me pagan?',r:'Esa pregunta se responde con una fecha. Te la puede confirmar quien te paga: tu empleador, la clienta o la oficina de pagos.',who:'Quien te paga (empleador, clienta u oficina de pagos).'},
     {t:'No sé si me alcanza para la renta',r:'Para responderla hace falta un dato: cuánto entra confirmado antes del día de la renta. La pregunta concreta sería: ¿cuánto tendré confirmado antes de esa fecha?',who:'Tú misma, con las fechas de cobro que ya conoces.',q:'¿Cuánto tendré confirmado antes del día de la renta?'},
     {t:'¿Cuándo me pagan?',r:'Esa pregunta se responde con una fecha. Te la puede confirmar quien te paga.',who:'Quien te paga.'},
     {t:'Es por mi hermana: ¿cuándo le pagan a ella?',r:'Entendido, es sobre tu hermana. La pregunta útil es qué día le pagan a ella, y quien mejor la responde es ella misma o quien le paga.',who:'Tu hermana o quien le paga.'}],
    guidance:'Convierte su frase en una pregunta verificable (quién, qué o cuándo) y di quién podría responderla. Si saltó este paso, la conclusión propone una pregunta desde su elección del paso 1.'}],
  take:function(r){var t=r.a.pregunta,c=r.a.tema,st=SES[0].steps;
   if(t){var ex=sesExample(st[1],t);return [['Tu pregunta','«'+t+'»'+(ex&&ex.q?' Más concreta: «'+ex.q+'»':'')]].concat(ex&&ex.who?[['Quién puede responderla',ex.who]]:[])}
   if(c!=null)return [['Una pregunta para empezar','«'+st[0].suggest[c]+'» (sugerida a partir de lo que elegiste)']];
   return [['Hoy','No elegiste un tema, y está bien. Puedes volver cuando quieras.']]}},
 {n:2,src:'MONEY-W1-D4 (pregunta A)',title:'Dónde estás hoy',
  purpose:'Hoy ves si lo urgente es cubrir lo básico, ordenar fechas o buscar ingresos.',
  next:'Mañana eliges por dónde empezar y la condición que no vas a negociar.',
  steps:[
   {id:'situacion',kind:'choose',q:'Pensando en lo básico que necesitas cubrir, ¿cómo está tu situación hoy?',
    opts:['Alcanza y sobra algo','Justo','No alcanza','Varía mucho','Sin ingresos ahora','No sé todavía'],
    route:['explorar un ingreso o preparar una decisión, sin prisa','explorar algo que no te pida gastar','cubrir lo básico y buscar apoyo','ordenar fechas, un periodo a la vez','cubrir lo básico y buscar apoyo','ordenar fechas, un periodo a la vez'],
    path:[null,null,'apoyo',null,'apoyo',null],
    replies:['Si lo básico está cubierto, puedes usar estas sesiones para explorar un ingreso o preparar una decisión, sin prisa.',
     'Justo quiere decir que cualquier imprevisto pesa. Mañana puedes elegir un camino que no te pida gastar.',
     'Lo urgente es cubrir esta semana, no un presupuesto. Si quieres, preparamos una pregunta para un apoyo de tu zona; basta el país o la región.',
     'La duda está en las fechas. Compara solo un periodo: lo confirmado que entra y los pagos de ese periodo; lo que no sepas queda «por confirmar».',
     'Sin ingresos ahora, lo primero es cubrir lo básico, no hacer cuentas. Podemos preparar una pregunta para un apoyo de tu zona; basta el país o la región.',
     'Para saberlo basta un dato: cuánto entra confirmado antes del próximo pago básico. Lo demás puede quedar «por confirmar».'],
    guidance:'«No alcanza» o «Sin ingresos»: primero lo básico y rutas de apoyo; nunca insinuar mala gestión. «Varía mucho»: lo confirmado para después no es dinero de hoy; comparar un periodo a la vez. «Alcanza» o «Justo»: explorar un ingreso o una decisión sin presión.'}],
  take:function(r){if(r.fold)return [['Tu situación hoy','Lo básico primero: lo elegiste en la sesión 1'],['Lo que encaja','cubrir lo básico y buscar apoyo']];var c=r.a.situacion,st=SES[1].steps[0];if(c==null)return [['Hoy','Saltaste esta pregunta. Mañana puedes elegir camino igual.']];return [['Tu situación hoy',st.opts[c]],['Lo que encaja',st.route[c]]]}},
 {n:3,src:'MONEY-W1-D7 (pregunta A) + rama de W1-D6 (v2: rama de apoyo nombra la necesidad y una condición)',title:'Por dónde empezar',
  purpose:'Hoy eliges por dónde empezar y qué tiene que respetar cualquier opción.',
  next:'Mañana conviertes algo que ya hiciste en una frase que puedes usar.',
  nextBy:{apoyo:'Mañana eliges dónde preguntar: una oficina, una persona, una página o una línea.'},
  steps:[
   {id:'camino',kind:'camino',q:'Con lo que sabes hoy, ¿qué camino te serviría explorar primero?',
    labels:{empleo:'Empleo',negocio:'Probar una idea de servicio o venta',apoyo:'Aclarar un cobro, pago o apoyo',ninguno:'Ninguno por ahora'},
    replies:{empleo:'Para empleo, lo que filtra primero suele ser una condición tuya: horario, cuidados o equipo. En el siguiente paso la nombras.',
     negocio:'Para probar una idea no hace falta gastar: primero se prueba si alguien la necesita. En el siguiente paso miras con qué cuentas.',
     apoyo:'Para un cobro o un apoyo, ayuda nombrar qué necesitas y qué tiene que respetar. En el siguiente paso lo escribes.',
     ninguno:'Pausar también es una decisión. Hoy no hay paso siguiente; puedes elegir un camino cuando quieras.'},
    guidance:'Una sola vía o pausa; puede cambiarla sin repetir sesiones. «Ninguno» se respeta sin insistir.'},
   {id:'condicion',kind:'branch',
    v:{empleo:{q:'¿Qué tienes a favor para explorar empleo y qué condición necesitas resolver antes?',ph:'Ej.: sé atender clientes; solo puedo de 9 a 2',
       examples:[{t:'Tengo experiencia en atención al cliente, pero solo puedo de 9 a 2',r:'Tu condición es el horario de 9 a 2: será tu primer filtro. Lo que tienes a favor, la atención al cliente, ya sirve para buscar puestos con ese horario.'}]},
     negocio:{q:'¿Con qué cuentas para explorar una idea sin gastar y qué te falta?',ph:'Ej.: tengo horno; me falta saber si alguien compraría',
       examples:[{t:'Sé hacer pan y tengo horno; me falta saber si alguien lo compraría',r:'Tienes lo necesario para una prueba pequeña sin gastar: el horno y la receta. Lo que falta es un dato, si alguien lo compraría, y eso se averigua preguntando, no invirtiendo.'}]},
     apoyo:{q:'¿Qué necesidad, cobro o apoyo quieres aclarar, y qué condición tiene que respetar?',fmt:'Quiero aclarar ___; tiene que ___',ph:'Ej.: una ayuda para la renta; tiene que poder hacerse por la mañana',nuevo:true,
       examples:[{t:'Quiero aclarar una ayuda para la renta; tiene que poder hacerse por la mañana',r:'Ya está nombrado: la ayuda para la renta, y por la mañana. Mañana eliges dónde preguntar por ella.'},
        {t:'Sé que existe una ayuda, pero no sé si me corresponde',r:'Lo que falta es un requisito, no tu mérito. Para avanzar, nómbrala en una línea, por ejemplo «una ayuda para la renta», y la condición que tiene que respetar.'}]}},
    guidance:'Empleo o negocio: separa lo que tiene de lo que falta y convierte lo que falta en un filtro. Apoyo: nombra la necesidad y una condición; no preguntes otra vez qué sabe o qué le falta. Nunca supongas dinero, tiempo o ayudas que no mencionó.'}],
  take:function(r){var p=sesPathOf(r);if(p==='ninguno')return [['Hoy','Decidiste pausar por ahora. Puedes elegir un camino cuando quieras.']];
   var out=[];if(p)out.push(['Tu camino',SES[2].steps[0].labels[p]]);var t=r.a.condicion;if(t)out.push([p==='apoyo'?'Lo que quieres aclarar y su condición':'Lo que tienes y la condición, con tus palabras','«'+t+'»'])
   if(!out.length)out.push(['Hoy','Saltaste las preguntas. Puedes elegir camino cuando quieras.']);return out}},
 {n:4,src:'MONEY-W2-D2, por rama (v2: apoyo elige dónde preguntar)',title:'Una frase verdadera',titleBy:{apoyo:'Dónde preguntar'},
  purpose:'Hoy escribes una frase verdadera sobre lo que sabes hacer o lo que ya sabes de tu trámite.',
  purposeBy:{apoyo:'Hoy eliges dónde preguntar por lo que quieres aclarar.'},
  next:'Mañana armas un filtro para descartar rápido lo que no cabe en tu vida.',
  nextBy:{apoyo:'Mañana armas un filtro: lo que ese trámite o apoyo tiene que respetar.'},
  steps:[
   {id:'camino',kind:'camino',quiet:true,q:'Sigues por:',labels:{empleo:'Empleo',negocio:'Negocio',apoyo:'Aclarar o apoyo',ninguno:'Ninguno por ahora'},
    guidance:'Paso de un toque para confirmar o cambiar el camino. Sin respuesta de Elara.'},
   {id:'linea',kind:'branch',notPath:['apoyo'],
    v:{empleo:{q:'¿Qué experiencia verdadera muestra una habilidad útil para ese puesto?',fmt:'Hice ___ y el resultado fue ___',ph:'Hice ___ y el resultado fue ___',
       examples:[{t:'Llevaba el inventario y detectaba faltantes',r:'Eso ya es evidencia: llevar inventario y detectar faltantes. Úsala cuando una oferta pida control u organización.'},
        {t:'Nunca tuve empleo formal',r:'Las tareas sin pago cuentan: organizar turnos de cuidado, por ejemplo. Si hoy no sale ninguna, vale un ejemplo inventado para ver el formato.',take:'Un formato para tu frase, «Hice ___ y el resultado fue ___», y que las tareas sin pago también cuentan.'}]},
     negocio:{q:'¿Qué has hecho que pueda servir para atender esa necesidad?',fmt:'Hice ___ y el resultado fue ___',ph:'Hice ___ y el resultado fue ___',
       examples:[{t:'Hago pasteles para los cumpleaños de mi familia desde hace años',r:'Eso cuenta como experiencia con encargos y fechas. Para la frase solo falta el resultado, en tus palabras: qué pasó con esos pasteles.'}]}},
    guidance:'Empleo o negocio: convierte la tarea que nombró en una línea de evidencia; nunca inventes una habilidad. Si no tiene empleo formal: las tareas sin pago cuentan; si no sale ninguna, ofrece un ejemplo ficticio del formato.'},
   {id:'donde',kind:'choose',onlyPath:'apoyo',nuevo:true,q:'¿Dónde podrías preguntar por lo que quieres aclarar?',
    opts:['Una oficina pública','Una persona que sabe del tema','Una página web oficial','Una línea de teléfono','Una organización o asociación','No sé todavía'],
    note:'Elara no puede confirmar qué servicios hay en tu zona. Elige el tipo de lugar; el nombre exacto lo compruebas tú.',
    replies:['Una oficina sirve si puedes ir en su horario. Lleva una sola pregunta escrita: la preparas en la sesión 6.',
     'Alguien que ya pasó por el trámite suele saber el primer paso. Pregúntale solo eso: por dónde se empieza.',
     'En una página oficial, busca la sección de requisitos y un contacto. Entra escribiendo la dirección tú misma, no desde un enlace que te enviaron.',
     'Una línea de teléfono sirve si tienes un momento tranquilo para llamar. Ten tu pregunta escrita antes de marcar.',
     'Una organización o asociación puede orientarte sin costo. Confirma que no te piden pagar para ayudarte.',
     'Está bien no saberlo todavía. Una forma de averiguarlo es preguntar en un lugar que ya conoces, como la escuela o el centro de salud, quién lleva ese trámite. Desde aquí no podemos confirmar qué hay en tu zona.'],
    guidance:'Apoyo: devuelve un consejo práctico para el tipo de lugar elegido. Nunca nombres un servicio, dirección o teléfono concreto: no se pueden verificar. «No sé todavía» es una respuesta válida: ofrece cómo averiguarlo.'}],
  take:function(r){var p=sesPathOf(r);if(p==='ninguno')return [['Hoy','Decidiste pausar por ahora. Tu frase puede esperar.']];
   if(p==='apoyo'){var d=r.a.donde,st=sesStepIn(4,'donde');if(d==null)return [['Hoy','Saltaste dónde preguntar. Puedes elegirlo otro día; nada se pierde.']];
    return [['Dónde preguntar',st.opts[d]],['','Elara no puede confirmar los servicios de tu zona; el nombre exacto lo compruebas tú.']]}
   var t=r.a.linea;if(!t)return [['Hoy','Saltaste la frase. Puedes escribirla otro día; nada se pierde.']];
   var ex=sesExample((sesStepIn(4,'linea').v[p]||{}),t);return [['Tu frase',ex&&ex.take?ex.take:'«'+t+'»']]}},
 {n:5,src:'MONEY-W2-D3 (pregunta A), por rama (v2)',title:'Tu filtro',
  purpose:'Hoy armas un filtro para descartar rápido lo que no encaja en tu vida.',
  purposeBy:{apoyo:'Hoy armas un filtro: lo que ese trámite o apoyo tiene que respetar.',negocio:'Hoy decides cómo sería una primera prueba de tu idea.'},
  next:'Mañana juntas tu frase y tu filtro en una primera versión.',
  nextBy:{apoyo:'Mañana escribes la pregunta o el mensaje que llevarías.',negocio:'Mañana escribes a quién ayudaría tu idea y con qué.'},
  steps:[
   {id:'camino',kind:'camino',quiet:true,nuevo:true,q:'Sigues por:',labels:{empleo:'Empleo',negocio:'Negocio',apoyo:'Aclarar o apoyo',ninguno:'Ninguno por ahora'},
    guidance:'Paso de un toque para confirmar o cambiar el camino. Sin respuesta de Elara.'},
   {id:'condiciones',kind:'multi',max:2,notPath:['apoyo','negocio'],q:'¿Qué tendría que respetar una oportunidad para que cupiera de verdad en tu vida?',
    opts:['Horario','Cuidados','Lugar','Equipo','Conexión','Idioma','Accesibilidad','Otra'],
    check:['qué horario pide','si el horario deja espacio para tus cuidados','desde dónde se puede trabajar','qué equipo pide','qué conexión necesita','en qué idioma se trabaja','si es accesible para ti','tu otra condición'],
    note:'Remoto dice dónde se trabaja, no cuándo. Revisa horario, lugar permitido, equipo e idioma.',
    tpl:['Tu filtro: ','. Antes de leer una oferta entera, mira ','; si no lo dice, pregúntalo antes de seguir.'],askLabel:'Pregunta para cualquier oferta',
    guidance:'Convierte sus condiciones en una regla para descartar y una pregunta para cualquier oferta real.'},
   {id:'condiciones',kind:'multi',max:2,onlyPath:'apoyo',nuevo:true,q:'¿Qué tendría que respetar este trámite o apoyo para que puedas hacerlo de verdad?',
    opts:['Horario de atención','Documentos','Transporte','Internet','Cuidados','Idioma','Otra'],
    check:['qué horario de atención tiene','qué documentos piden','cómo se llega y cuánto cuesta llegar','si se puede hacer por internet','si puedes ir con quien cuidas o en otro horario','en qué idioma atienden','tu otra condición'],
    note:'Elara no puede confirmar los requisitos de un trámite concreto: compruébalos en la fuente oficial.',
    tpl:['Tu filtro: ','. Antes de ir o llamar, confirma ','; si no lo sabes, esa es tu primera pregunta.'],askLabel:'Pregunta antes de ir o llamar',
    guidance:'Apoyo: convierte sus condiciones en lo que hay que confirmar antes de ir o llamar. No supongas requisitos concretos.'},
   {id:'condiciones',kind:'multi',max:2,onlyPath:'negocio',nuevo:true,q:'Para una primera prueba de tu idea, ¿qué tendría que cumplir?',
    opts:['Que no cueste dinero','Que quepa en mi tiempo','Saber a quién preguntar primero','Saber qué contaría como un sí','Otra'],
    check:['si te cuesta algo','cuánto tiempo te pide','a quién le preguntarías primero','qué respuesta contaría como un sí','tu otra condición'],
    note:'Una primera prueba no es vender: es preguntar a pocas personas si tu idea les resuelve algo.',
    tpl:['Tu prueba: ','. Antes de empezar, decide ','; con eso la prueba cabe en tu semana.'],askLabel:'Pregunta para tu primera prueba',
    guidance:'Negocio: convierte sus condiciones en una prueba pequeña y sin costo. Nunca prometas ventas ni ingresos.'},
   {id:'imprescindible',kind:'reflect',notPath:['negocio'],q:'De lo que elegiste, ¿qué es imprescindible para ti?',ph:'Ej.: solo puedo con el móvil',
    examples:[{t:'Solo tengo el móvil y 20 minutos por la noche; necesito dinero pronto',r:'Tres filtros: solo móvil, 20 minutos y pago pronto. Revisa en cada oferta qué equipo pide y cuándo paga; nunca pagues por empezar.'},
     {t:'Tengo ordenador y dos tardes libres; no tengo prisa, pero no quiero pagar un curso sin saber si me sirve',r:'Puedes explorar sin comprar formación todavía. Toma una oferta que te interese y busca un requisito que se repita; eso te dice qué conviene aprender.'},
     {t:'Me ofrecieron un trabajo por WhatsApp que pide pagar el registro',r:'Si piden pagar para empezar o tus datos muy pronto, compruébala en la web oficial, no en el enlace. Pagar para poder trabajar es una señal de alerta.'},
     {t:'Que atiendan por la mañana y que no me pidan documentos que no tengo',r:'Dos cosas que confirmar antes de ir: el horario de la mañana y la lista de documentos. Si no la encuentras, pedir la lista es tu primera pregunta.'}],
    guidance:'Una regla para descartar y una pregunta de verificación. Si menciona una oferta concreta, añade la comprobación de W2-D6: «Si piden pagar para empezar o datos muy pronto, compruébala en la web oficial, no en el enlace».'},
   {id:'imprescindible',kind:'reflect',onlyPath:'negocio',nuevo:true,q:'¿Qué contaría como un sí para seguir con tu idea?',ph:'Ej.: que dos personas digan que lo pagarían',
    examples:[{t:'Que dos vecinas me digan que comprarían pan los sábados',r:'Es un sí que se puede comprobar: dos respuestas concretas. Pregunta sin vender nada todavía y anota lo que digan.'}],
    guidance:'Negocio: ayuda a que el «sí» sea observable (cuántas personas, qué respuesta). Sin promesas de ingresos.'}],
  take:function(r){var p=sesPathOf(r),ss=sesStepsOf(r),st=ss.find(function(z){return z.id==='condiciones'}),sel=r.a.condiciones||[],out=[];
   if(st&&sel.length)out.push([p==='negocio'?'Tu prueba':'Tu filtro',sel.map(function(i){return st.opts[i]}).join(' y ')],[st.askLabel,'¿'+sel.map(function(i){return st.check[i]}).join(' y ').replace(/^./,function(c){return c.toUpperCase()})+'?']);
   if(r.a.imprescindible)out.push([p==='negocio'?'Lo que contaría como un sí':'Lo imprescindible','«'+r.a.imprescindible+'»']);if(!out.length)out.push(['Hoy','Saltaste el filtro. Puedes armarlo otro día.']);return out}},
 {n:6,src:'MONEY-W3-D1, por rama (v2: apoyo redacta el mensaje que llevaría)',title:'Tu primera frase',titleBy:{apoyo:'Tu mensaje'},
  purpose:'Hoy escribes la primera frase que podrías usar de verdad.',
  purposeBy:{apoyo:'Hoy escribes la pregunta o el mensaje que llevarías, listo para copiar.'},
  next:'Mañana decides si probar algo pequeño, esperar o parar, y guardas tu kit.',
  steps:[
   {id:'camino',kind:'camino',quiet:true,q:'Sigues por:',labels:{empleo:'Empleo',negocio:'Negocio',apoyo:'Aclarar o apoyo',ninguno:'Ninguno por ahora'},guidance:'Paso de un toque para confirmar o cambiar el camino. Sin respuesta de Elara.'},
   {id:'frase',kind:'branch',quote:true,
    v:{empleo:{q:'¿Cómo explicarías lo que puedes aportar al puesto sin exagerar?',fmt:'Puedo ayudar con ___; lo demostré cuando ___',ph:'Puedo ayudar con ___; lo demostré cuando ___',
       examples:[{t:'Soy responsable y trabajadora',r:'«Responsable» se entiende mejor con una tarea que lo muestre, por ejemplo una vez que organizaste algo sin que te lo pidieran. Con eso, la frase se sostiene sola.'},
        {t:'Puedo ayudar con el inventario; lo demostré cuando detectaba faltantes en la tienda',r:'Esa frase ya sirve: dice qué haces y cuándo lo mostraste, en menos de 25 palabras. Puedes usarla tal cual.'}]},
     negocio:{q:'¿A quién ayudaría tu idea y con qué problema concreto?',fmt:'Ayudaría a ___ a resolver ___',ph:'Ayudaría a ___ a resolver ___',
       examples:[{t:'Ayudaría a familias del barrio a resolver los pasteles de cumpleaños sin salir de casa',r:'Ya dice a quién ayudas y qué resuelves. Para probarla basta preguntar a dos familias si la pagarían, sin cobrar nada todavía.'}]},
     apoyo:{q:'¿Qué pregunta o mensaje llevarías, en dos frases?',fmt:'Hola, quería saber si ___. Mi situación es ___.',ph:'Hola, quería saber si ___. Mi situación es ___.',nuevo:true,
       examples:[{t:'Hola, quería saber si la ayuda para la renta aplica en mi ciudad. Mi situación es que crío sola a dos hijos.',r:'El mensaje ya dice qué quieres saber y tu situación, sin justificar nada más. Puedes copiarlo y llevarlo tal cual.'},
        {t:'Necesito ayuda',r:'Para que te puedan responder, di qué ayuda: por ejemplo «quería saber si la ayuda para la renta aplica en mi caso». Una línea basta.'}]}},
    guidance:'Frase vaga («soy responsable»): sugiere una tarea que lo muestre, como sugerencia, no como pregunta obligatoria. Frase concreta: déjala en 25 palabras o menos y di que se puede reutilizar. Apoyo: el mensaje debe decir qué quiere saber; nunca pedir justificación; nada se envía.'}],
  take:function(r){var p=sesPathOf(r);if(p==='ninguno')return [['Hoy','Decidiste pausar por ahora.']];var t=r.a.frase;if(!t)return [['Hoy','Saltaste la frase. Puedes escribirla otro día.']];
   if(p==='apoyo')return [['Tu mensaje','«'+t+'»'],['','Listo para copiar. No se envía a ningún sitio.']];
   return [['Tu frase','«'+t+'»'],['','No se envía a ningún sitio.']]}},
 {n:7,src:'MONEY-W3-D7 (pregunta B) + respuesta de W5-D1 (v2: respuestas por camino)',title:'Probar, esperar o parar',
  purpose:'Hoy decides con calma: probar algo pequeño, esperar o parar.',
  next:'Si sigues, la próxima semana comparas tu kit con una oportunidad real.',
  nextBy:{apoyo:'Si sigues, la próxima semana usas tu mensaje y vemos qué respondieron.',negocio:'Si sigues, la próxima semana haces tu primera prueba y miras qué te dijeron.'},
  steps:[
   {id:'decision',kind:'choose',q:'¿Qué parte de lo que preparaste podrías probar ya y qué falta, si decides seguir?',
    opts:['Probar algo pequeño','Preparar lo que falta','Decido no seguir por ahora'],
    replies:['Una prueba sin costo ni exposición: compara tu frase con una oferta real sin enviarla y anota qué coincide.',
     'Elige solo la pieza que falta, por ejemplo el resultado de tu frase o la condición de tu filtro. Lo demás puede esperar.',
     'Es una decisión con información. Te quedas con lo que preparaste, por si lo necesitas más adelante.'],
    repliesBy:{apoyo:['Una prueba pequeña: lleva tu mensaje al lugar que elegiste, o pregunta solo el primer dato. Si hoy no puedes ir, guardarlo para cuando puedas también cuenta.',
      'Elige solo la pieza que falta: el lugar donde preguntar o una línea de tu mensaje. Lo demás puede esperar.',
      'Es una decisión con información. Tu mensaje queda guardado, por si lo necesitas más adelante.'],
     negocio:['Una prueba sin gastar: pregunta a dos personas si les serviría tu idea y anota qué dicen. No hace falta vender todavía.',
      'Elige solo la pieza que falta, por ejemplo a quién preguntar o qué contaría como un sí. Lo demás puede esperar.',
      'Es una decisión con información. Te quedas con lo que preparaste, por si lo necesitas más adelante.'],
     ninguno:['Una prueba pequeña: elige una sola pieza de lo que preparaste y úsala una vez, sin costo ni exposición.',
      'Elige solo la pieza que falta. Lo demás puede esperar.',
      'Es una decisión con información. Lo que preparaste queda guardado.']},
    guidance:'Probar: una prueba sin costo ni exposición que encaje con su camino (empleo: comparar con una oferta; negocio: preguntar a dos personas; apoyo: llevar el mensaje o pedir el primer dato). Preparar: nombra la única pieza que falta. No seguir: confirma que es una decisión informada; sin persuadir.'},
   {id:'ahora',kind:'reflect',q:'Ahora puedo… / Aún necesito…',ph:'Ahora puedo ___ / Aún necesito ___',
    examples:[{t:'Ahora puedo explicar lo que sé hacer con un ejemplo',r:'Eso es lo que te llevas: una frase con ejemplo. Lo que necesites después puede esperar a la próxima semana.'},
     {t:'Aún necesito saber si la beca aplica en mi ciudad',r:'Entonces la pieza que falta es una sola respuesta. Tu mensaje de la sesión 6 ya sirve para pedirla.'}],
    guidance:'Nombra lo que puede hacer ahora o lo único que le falta, con sus palabras. Sin tareas nuevas.'}],
  take:function(r){var st=SES[6].steps[0],out=[];if(r.a.decision!=null)out.push(['Tu decisión',st.opts[r.a.decision]]);if(r.a.ahora)out.push(['Con tus palabras','«'+r.a.ahora+'»']);if(!out.length)out.push(['Hoy','Saltaste las preguntas. Lo que preparaste sigue aquí.']);return out}}
];
/* ---- v2: A/B variants (reviewer- or tester-assigned; identical except for the variable) ----
   s2:    A = session 2 asks its question; B = folded when session 1 already chose «Cubrir algo básico ahora».
   recap: A = no recap;  B = one line «Ayer te llevaste: …» (or «La última vez…» after a gap) on sessions 2–7.
   reply: A = Elara replies after every step;  B = one reply only, at the end of the session. */
var SES_VAR_DEF={s2:'A',recap:'A',reply:'A'};
var SES_FOLD={id:'confirma',kind:'info',quiet:true,nuevo:true,q:'Ya sabemos por dónde empezar',
  body:'En la sesión 1 elegiste cubrir algo básico ahora. Hoy no hace falta volver a contarlo.',
  note:'Lo que es tuyo hoy es lo que ya entró. Lo confirmado para después todavía no es dinero de hoy.',
  guidance:'Variante B: no repetir la pregunta de la sesión 2 si la sesión 1 ya eligió «Cubrir algo básico ahora». Confirmar en una línea y enseñar la distinción entre dinero disponible y confirmado para después.'};
/* scenarios for the reviewer panel: pre-filled answers per session (prototype examples, not real answers) */
var SES_SCEN={
 1:[['a','«Aclarar un cobro» + «¿Qué día me pagan?»',{tema:2,pregunta:'¿Qué día me pagan?'}],['b','«Cubrir algo básico» + «No sé si me alcanza para la renta»',{tema:0,pregunta:'No sé si me alcanza para la renta'}],['c','Corrección: «¿Cuándo me pagan?» → «Es por mi hermana…»',{tema:2,pregunta:'¿Cuándo me pagan?'},{corr:'Es por mi hermana: ¿cuándo le pagan a ella?'}],['free','Texto libre propio (sin guion)',{tema:5,pregunta:'Quiero entender por qué siempre me quedo corta a fin de mes'}]],
 2:[['a','«No alcanza»',{situacion:2}],['b','«Varía mucho»',{situacion:3}],['c','«Alcanza y sobra algo»',{situacion:0}],['fold','Sesión 1 eligió «Cubrir algo básico» (se pliega en la variante B)',{},{fold1:0}]],
 3:[['a','Empleo · «solo de 9 a 2»',{camino:'empleo',condicion:'Tengo experiencia en atención al cliente, pero solo puedo de 9 a 2'}],['b','Apoyo · ayuda para la renta, por la mañana',{camino:'apoyo',condicion:'Quiero aclarar una ayuda para la renta; tiene que poder hacerse por la mañana'}],['c','Negocio · pan y horno',{camino:'negocio',condicion:'Sé hacer pan y tengo horno; me falta saber si alguien lo compraría'}],['d','«Ninguno por ahora»',{camino:'ninguno'}]],
 4:[['a','Empleo · «inventario»',{camino:'empleo',linea:'Llevaba el inventario y detectaba faltantes'}],['b','Empleo · «sin empleo formal»',{camino:'empleo',linea:'Nunca tuve empleo formal'}],['c','Apoyo · una oficina pública',{camino:'apoyo',donde:0}],['e','Apoyo · «No sé todavía»',{camino:'apoyo',donde:5}],['d','Negocio · pasteles',{camino:'negocio',linea:'Hago pasteles para los cumpleaños de mi familia desde hace años'}]],
 5:[['a','Empleo · «Solo móvil, 20 min, pronto»',{camino:'empleo',condiciones:[0,3],imprescindible:'Solo tengo el móvil y 20 minutos por la noche; necesito dinero pronto'}],['b','Empleo · «Ordenador, sin prisa»',{camino:'empleo',condiciones:[0,4],imprescindible:'Tengo ordenador y dos tardes libres; no tengo prisa, pero no quiero pagar un curso sin saber si me sirve'}],['c','Empleo · menciona una oferta (control de estafa)',{camino:'empleo',condiciones:[0,2],imprescindible:'Me ofrecieron un trabajo por WhatsApp que pide pagar el registro'}],['d','Apoyo · horario y documentos',{camino:'apoyo',condiciones:[0,1],imprescindible:'Que atiendan por la mañana y que no me pidan documentos que no tengo'}],['e','Negocio · sin costo, qué sería un sí',{camino:'negocio',condiciones:[0,3],imprescindible:'Que dos vecinas me digan que comprarían pan los sábados'}]],
 6:[['a','Empleo · frase vaga',{camino:'empleo',frase:'Soy responsable y trabajadora'},{dep4:{linea:'Llevaba el inventario y detectaba faltantes'}}],['b','Empleo · frase concreta',{camino:'empleo',frase:'Puedo ayudar con el inventario; lo demostré cuando detectaba faltantes en la tienda'},{dep4:{linea:'Llevaba el inventario y detectaba faltantes'}}],['c','Apoyo · mensaje listo (con la oficina de la sesión 4)',{camino:'apoyo',frase:'Hola, quería saber si la ayuda para la renta aplica en mi ciudad. Mi situación es que crío sola a dos hijos.'},{dep4:{donde:0}}],['f','Apoyo · mensaje vago, sin sesión 4',{camino:'apoyo',frase:'Necesito ayuda'},{dep4:null}],['d','Negocio · a quién ayudaría',{camino:'negocio',frase:'Ayudaría a familias del barrio a resolver los pasteles de cumpleaños sin salir de casa'},{dep4:{linea:'Hago pasteles para los cumpleaños de mi familia desde hace años'}}]],
 7:[['a','Empleo · «Probar algo pequeño»',{decision:0,ahora:'Ahora puedo explicar lo que sé hacer con un ejemplo'},{path:'empleo'}],['c','Apoyo · «Probar algo pequeño»',{decision:0,ahora:'Aún necesito saber si la beca aplica en mi ciudad'},{path:'apoyo'}],['d','Negocio · «Probar algo pequeño»',{decision:0},{path:'negocio'}],['b','«Decido no seguir por ahora»',{decision:2,ahora:'Aún necesito saber si la beca aplica en mi ciudad'},{path:'apoyo'}]]
};
/* the scenario used per session when the reviewer advances along one path */
var SES_PATH_SCN={empleo:{1:'a',2:'b',3:'a',4:'a',5:'a',6:'b'},apoyo:{1:'b',2:'a',3:'b',4:'c',5:'d',6:'c'},negocio:{1:'free',2:'c',3:'c',4:'d',5:'e',6:'d'}};
function sesNorm(t){return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[¿?¡!.,;:«»"“”]/g,'').replace(/\s+/g,' ').trim()}
function sesExample(v,t){var n=sesNorm(t);return (v.examples||[]).find(function(e){return sesNorm(e.t)===n})||null}
function sesDef(n){return SES[n-1]}
function sesFresh(vr){return{cur:1,done:0,path:null,ans:{},drafts:{},gap:false,pv:null,pvDraft:null,pvPath:undefined,pvDeps:{},last:null,kit:false,justDone:false,doneDate:{},vr:Object.assign({},SES_VAR_DEF,vr||{})}}
function sesV(s,k){var T=s.test;return (T&&T.vr&&T.vr[k])||SES_VAR_DEF[k]}
function sesRun(s){var T=s.test;return T.pv?T.pvDraft:T.drafts[T.cur]}
function sesPathOf(r){return r.a.camino||r.basePath||null}
/* the steps of a run: path-specific steps (onlyPath / notPath) and the session 2 fold (variant B) */
function sesStepsOf(r){if(r.n===2&&r.fold)return [SES_FOLD];var p=sesPathOf(r);
  return sesDef(r.n).steps.filter(function(st){if(st.onlyPath)return p===st.onlyPath;if(st.notPath)return st.notPath.indexOf(p)<0;return true})}
function sesStepIn(n,id){return sesDef(n).steps.find(function(x){return x.id===id})}
function sesStepR(r,id){return sesStepsOf(r).find(function(x){return x.id===id})}
function sesBy(def,key,r){var p=sesPathOf(r),by=def[key+'By'];return by&&by[p]||def[key]}
function sesNewRun(s,n,pv){var T=s.test,p=pv&&T.pvPath!==undefined?T.pvPath:T.path;var r={n:n,i:0,a:{},sk:[],rep:{},corr:{},low:false,basePath:p,pv:!!pv,fold:false};
  if(p&&sesDef(n).steps.some(function(z){return z.kind==='camino'})){r.a.camino=p;r.lastPath=p}
  if(n===2&&sesV(s,'s2')==='B'){var a1=pv&&T.pvDeps.hasOwnProperty(1)?T.pvDeps[1]:T.ans[1];r.fold=!!(a1&&a1.tema===0)}
  return r}
function sesHasBranchHole(r,st){return st.kind==='branch'&&(!sesPathOf(r)||sesPathOf(r)==='ninguno')}
/* screens: q:<step>, r:<step> (variant A only; none for skipped/quiet), end */
function sesScreens(r){var out=[],every=r.mode!=='B';
  sesStepsOf(r).forEach(function(st){if(sesHasBranchHole(r,st))return;
    out.push('q:'+st.id);if(every&&r.sk.indexOf(st.id)<0&&!st.quiet&&r.rep[st.id])out.push('r:'+st.id)});
  out.push('end');return out}
function sesPlan(r){var out=[],every=r.mode!=='B';sesStepsOf(r).forEach(function(st){if(sesHasBranchHole(r,st))return;out.push('q:'+st.id);if(every&&r.sk.indexOf(st.id)<0&&!st.quiet)out.push('r:'+st.id)});out.push('end');return out}
function sesVar(r,st){if(st.kind!=='branch')return st;var p=sesPathOf(r);return st.v[p]||st.v.empleo}
function sesAnswered(r,st){var v=r.a[st.id];if(st.kind==='info')return true;if(st.kind==='multi')return !!(v&&v.length);if(st.kind==='reflect'||st.kind==='branch')return !!(v&&v.trim());return v!=null}
function sesReply(r,st){var v=r.a[st.id],x=sesVar(r,st),pre=r.corr[st.id]?'Entendido. ':'',p=sesPathOf(r);
  if(st.kind==='choose'){var reps=st.repliesBy&&st.repliesBy[p]||st.replies;return{text:pre+reps[v],rule:'Opción «'+st.opts[v]+'»'+(st.repliesBy&&st.repliesBy[p]?' en el camino «'+(SES_PATHS[p]||p)+'»':'')+': respuesta escrita para esta opción',scripted:true}}
  if(st.kind==='camino')return{text:pre+st.replies[v],rule:'Camino «'+st.labels[v]+'»: respuesta escrita para esta opción',scripted:true};
  if(st.kind==='multi'){var ps=v.map(function(i){return st.opts[i].toLowerCase()}),cs=v.map(function(i){return st.check[i]}),t=st.tpl;
    return{text:pre+t[0]+ps.join(' y ')+t[1]+cs.join(' y ')+t[2],rule:'Plantilla con las opciones elegidas ('+ps.join(', ')+')',scripted:true}}
  var ex=sesExample(x,v);if(ex){var tx=ex.r;if(r.corr[st.id]&&!/^Entendido/.test(tx))tx='Entendido. '+tx;return{text:tx,rule:'Coincide con un ejemplo preparado: «'+ex.t+'»',scripted:true}}
  return{text:SES_GENERIC,rule:'Respuesta libre: en la app la generaría Elara con la guía de este día (no simulada aquí)',scripted:false}}
/* the earlier answer a step may quote (session 6 quotes session 4: her line, or where she will ask) */
function sesQuote(s,r,st){if(!st.quote)return null;var T=s.test,a4=null;
  if(r.pv&&T.pvDeps.hasOwnProperty(4))a4=T.pvDeps[4];else a4=T.ans[4]||null;if(!a4)return null;var p=sesPathOf(r);
  if(p==='apoyo'){if(a4.donde==null||a4.donde===5)return null;return{pre:'Lo llevarías a',text:sesStepIn(4,'donde').opts[a4.donde]}}
  var q=a4.linea;return q&&String(q).trim()?{pre:'En la sesión 4 escribiste',text:q}:null}
/* variant B «recap»: the first takeaway of the previous session; nothing after a skip-only session or a fresh preview */
function sesRecapLine(s,r){if(sesV(s,'recap')!=='B'||r.n<2)return null;var T=s.test,k=r.n-1;
  var rec=r.pv?(T.pvDeps.hasOwnProperty('take')?T.pvDeps.take:null):(T.ans['r'+k]?sesDef(k).take(T.ans['r'+k]):null);
  if(!rec||!rec.length)return null;var first=rec.find(function(t){return t[0]&&t[0]!=='Hoy'});if(!first)return null;
  var gap=r.pv?!!T.pvDeps.gap:!!(T.gapSince===r.n)||(T.doneDate[k]&&daysBetween(T.doneDate[k],s.date)>1);
  return (gap?'La última vez te llevaste':'Ayer te llevaste')+' · '+first[0]+': '+first[1]}
function daysBetween(a,b){var x=new Date(a+'T00:00:00'),y=new Date(b+'T00:00:00');return Math.round((y-x)/86400000)}

/* ---- Hoy: the session card, the entry, and «Para retomar» ---- */
function sesEntry(s){var T=s.test;
  if(T.done>=7&&!T.drafts[T.cur])return{kind:'sesdone',label:'Ver lo que te llevas'};
  if(T.justDone)return{kind:'sesdone',label:'Ver lo que te llevas'};
  var r=T.drafts[T.cur];
  if(r){var sc=sesScreens(r),pl=sesPlan(r),pi=pl.indexOf(sc[Math.min(r.i,sc.length-1)]);return{kind:'ses',label:'Seguir con la sesión '+T.cur,hint:T.gap?'Puedes seguir donde ibas. No hace falta repasar nada.':'Vas en el paso '+((pi<0?0:pi)+1)+' de '+pl.length+'. Guardamos lo que elegiste y escribiste.'}}
  return{kind:'ses',label:'Empezar la sesión '+T.cur}}
function sesTitle(s,n){var d=sesDef(n),p=s.test.path;return d.titleBy&&d.titleBy[p]||d.title}
function sesCard(s,stamp){var T=s.test,n=T.justDone||T.done>=7?T.done:T.cur,def=sesDef(Math.max(1,n));
  var pur=def.purposeBy&&def.purposeBy[T.path]||def.purpose;
  var meta=T.done>=7?'Terminaste las siete sesiones de prueba.':T.justDone?'Sesión '+T.done+' hecha. La sesión '+(T.done+1)+' se abre mañana, '+tomorrowName(s)+'.':T.gap?'Tu sesión '+T.cur+' te espera. No hace falta repasar nada.':pur;
  return '<div class="warm" style="transform:rotate(-.4deg)"><article class="postcard torn-a" aria-labelledby="hq"><span class="grain"></span>'+
    '<img class="photo" src="'+IMG.wuzhen+'" alt="Canal de Wuzhen al anochecer, con casas de madera reflejadas en el agua">'+stamp+
    '<div class="pc-body"><p class="pc-place">Claridad financiera · Sesión '+Math.max(1,n)+' de 7</p>'+(T.justDone||T.done>=7?'<p class="doneline">'+ic('check',20)+'Sesión '+T.done+' hecha</p>':'')+
    '<h2 id="hq" class="pc-q">'+sesTitle(s,Math.max(1,n))+'</h2><p class="meta">'+meta+'</p></div></article></div>'}
function sesRecall(s){var T=s.test,k=T.done;if(!k)return '<div class="card recall"><p class="small">Aquí verás lo que te llevas de cada sesión.</p></div>';
  var tk=sesDef(k).take(T.ans['r'+k]||{n:k,a:T.ans[k]||{},basePath:T.path});var first=tk[0];
  return '<div class="card recall"><p class="small"><b style="color:var(--forest)">Te llevaste · Sesión '+k+'</b></p><p class="q">'+(first[0]?esc(first[0])+': ':'')+esc(first[1])+'</p></div>'}

/* ---- the session screen ---- */
function sesScene(s,r,sc){var sh=Math.round((s.w<360?150:s.h&&s.h<700?160:188)/(s.k>1.25?1.6:1));
  var top='<div class="pr-top"><div class="pr-l"><button class="iconbtn round" data-a="ssleave" aria-label="Parar por hoy. Tus respuestas se quedan">'+ic('x',22)+'</button>'+
    (r.i>0||r.low?'<button class="iconbtn round" data-a="ssback" aria-label="Paso anterior">'+ic('back',22)+'</button>':'')+'</div></div>';
  return '<div class="pr-scene torn-foot" style="--sh:'+sh+'px"><img class="pr-photo" src="'+IMG.wzpan+'" alt="Canal de Wuzhen por la mañana: casas de madera y sauces junto al agua verde" data-px="'+(10+(r.n-1)*13)+'" style="object-position:'+(10+(r.n-1)*13)+'% 42%">'+top+'</div>'}
function sesControls(r,st){var x=sesVar(r,st),v=r.a[st.id];
  if(st.kind==='info')return '<p class="ss-next">'+st.body+'</p>'+(st.note?'<p class="notice ss-note" role="note">'+st.note+'</p>':'');
  if(st.kind==='choose')return '<div class="chips ss-opts" role="radiogroup" aria-labelledby="pq">'+st.opts.map(function(o,i){return'<button class="chip" role="radio" aria-checked="'+(v===i)+'" data-a="sspick" data-v="'+i+'">'+o+'</button>'}).join('')+'</div>'+(st.note?'<p class="notice ss-note" role="note">'+st.note+'</p>':'');
  if(st.kind==='camino'){var order=SES_CAMINO_OPTS.map(function(o){return o[0]}),pre=r.basePath;if(pre&&pre!=='ninguno')order=[pre].concat(order.filter(function(k){return k!==pre}));
    return '<div class="chips ss-opts" role="radiogroup" aria-labelledby="pq">'+order.map(function(k){return'<button class="chip" role="radio" aria-checked="'+(v===k)+'" data-a="sspick" data-v="'+k+'">'+st.labels[k]+'</button>'}).join('')+'</div>'+
      (pre&&pre!=='ninguno'?'<p class="small ss-pre">'+(r.n===3?'Marcado según lo que elegiste antes. Puedes cambiarlo.':'Es el camino que elegiste. Puedes cambiarlo.')+'</p>':'')}
  if(st.kind==='multi'){var sel=v||[];return '<div class="chips ss-opts" role="group" aria-labelledby="pq" aria-describedby="ssmax">'+st.opts.map(function(o,i){var on=sel.indexOf(i)>-1,dis=!on&&sel.length>=st.max;return'<button class="chip" role="checkbox" aria-checked="'+on+'" data-a="ssmulti" data-v="'+i+'"'+(dis?' aria-disabled="true"':'')+'>'+o+'</button>'}).join('')+'</div><p class="small" id="ssmax">Elige hasta '+st.max+'.</p>'+(st.note?'<p class="notice ss-note" role="note">'+st.note+'</p>':'')}
  return '<label class="sr" for="ssin">'+esc(x.q)+'</label><textarea id="ssin" data-in="ssin" placeholder="'+esc(x.ph||'')+'" style="min-height:96px">'+esc(v||'')+'</textarea>'+(x.fmt?'<p class="small">Puedes usar: «'+x.fmt+'»</p>':'')}
function sesBranchable(r){return sesStepsOf(r).some(function(st){return st.kind==='branch'||st.onlyPath||st.notPath})&&sesStepsOf(r).some(function(st){return st.kind==='camino'})}
/* variant B «reply»: the one reply at the end is the reply to the last answered step */
function sesEndReply(r){var ids=sesStepsOf(r).filter(function(st){return !st.quiet&&r.rep[st.id]}).map(function(st){return st.id});return ids.length?ids[ids.length-1]:null}
function vSes(s){var T=s.test,r=sesRun(s);if(!r)return vHoy(s);var def=sesDef(r.n);r.mode=sesV(s,'reply');var sc=sesScreens(r);if(r.i>=sc.length)r.i=sc.length-1;var cur=sc[r.i],body,dk,ttl=def.titleBy&&def.titleBy[sesPathOf(r)]||def.title;
  if(r.low){body='<div class="eres reply" role="status"><img src="'+IMG.orb+'" alt=""><p id="pq" tabindex="-1">'+SES_LOW+'</p></div>';
    dk='<button class="btn" data-a="ssstop">Parar por hoy</button><button class="btn quiet" data-a="sslowback">Seguir igual</button>'}
  else if(cur==='end'){var tk=def.take(r),er=r.mode==='B'?sesEndReply(r):null,ers=er?sesStepR(r,er):null;
    body='<p class="lbl" style="color:var(--forest)">Sesión '+r.n+' de 7 · '+ttl+'</p>'+
      (er?'<p class="ss-ans"><span class="small">Tu respuesta</span><br>«'+esc(sesAnsText(r,ers))+'»</p><div class="eres reply" role="status"><img src="'+IMG.orb+'" alt=""><p>'+esc(r.rep[er].text)+'</p></div><button class="ss-link" data-a="sscorrect" data-v="'+er+'">No quise decir eso</button>':'')+
      '<h2 id="pq" tabindex="-1">Te llevas</h2><div class="card recall ss-take">'+tk.map(function(t){return (t[0]?'<p class="small"><b style="color:var(--forest)">'+esc(t[0])+'</b></p>':'')+'<p class="q">'+esc(t[1])+'</p>'}).join('')+'</div>'+
      (r.n===6&&sesPathOf(r)==='apoyo'&&r.a.frase?'<button class="ss-link" data-a="sscopy">Copiar mi mensaje</button>':'')+
      '<p class="small" style="margin-bottom:-8px"><b>Próxima sesión</b></p><p class="ss-next">'+sesBy(def,'next',r)+'</p>'+
      (r.n===7?sesKit(s,r):'');
    dk='<button class="btn" data-a="ssfinish">Terminar la sesión '+r.n+'</button>'+(r.n===7?'<button class="btn sec" data-a="sskit" aria-expanded="'+!!T.kit+'">'+(T.kit?'Ocultar mi kit':'Ver mi kit')+'</button>':'')}
  else{var kind=cur.slice(0,1),id=cur.slice(2),st=sesStepR(r,id),x=sesVar(r,st);
    if(kind==='q'){var first=r.i===0,quote=sesQuote(s,r,st),rc=first?sesRecapLine(s,r):null;
      body=(rc?'<p class="small ss-recap">'+esc(rc)+'</p>':'')+(first?'<p class="ss-purpose">'+sesBy(def,'purpose',r)+'</p>':'<p class="lbl" style="color:var(--forest)">Sesión '+r.n+' de 7 · '+ttl+'</p>')+
        '<h2 id="pq" tabindex="-1">'+esc(x.q)+'</h2>'+(quote?'<p class="ss-quote">'+quote.pre+': «'+esc(quote.text)+'»</p>':'')+sesControls(r,st)+
        ((st.kind==='branch'||st.onlyPath||st.notPath)&&sesBranchable(r)?'<button class="ss-link" data-a="sschange">Cambiar camino · '+esc(SES_PATHS[sesPathOf(r)]||'')+'</button>':'')+
        '<button class="ss-link" data-a="sslow">Hoy no puedo</button>';
      dk='<button class="btn" data-a="ssnext"'+(sesAnswered(r,st)?'':' disabled')+'>Seguir</button>'+(st.kind==='info'?'':'<button class="btn quiet" data-a="ssskip">Saltar</button>')}
    else{var rep=r.rep[id];
      body='<p class="lbl" style="color:var(--forest)">Sesión '+r.n+' de 7 · '+ttl+'</p><p class="ss-ans"><span class="small">Tu respuesta</span><br>«'+esc(sesAnsText(r,st))+'»</p>'+
        '<div class="eres reply" role="status"><img src="'+IMG.orb+'" alt=""><p id="pq" tabindex="-1">'+esc(rep.text)+'</p></div>'+
        '<button class="ss-link" data-a="sscorrect">No quise decir eso</button>';
      dk='<button class="btn" data-a="ssnext">'+(sc[r.i+1]==='end'?'Ver lo que te llevas':'Seguir')+'</button>'}}
  var plan=sesPlan(r),total=plan.length,pi=plan.indexOf(cur);if(pi<0)pi=Math.min(r.i,total-1);var segs='';for(var i=0;i<total;i++)segs+='<i class="'+(i<pi?'on':i===pi?'cur':'')+'"></i>';
  var meta='<div class="pr-meta"><img src="'+IMG.orb+'" alt=""><b>Elara</b><span class="pr-step">Paso '+(pi+1)+' de '+total+'</span></div><div class="pr-steps" role="img" aria-label="Paso '+(pi+1)+' de '+total+'">'+segs+'</div>';
  return '<div class="pr ses">'+sesScene(s,r,sc)+'<section class="pr-panel" aria-labelledby="pq"><span class="pr-gap" aria-hidden="true"></span>'+meta+'<div class="pr-body">'+body+'</div>'+dock(dk)+'</section></div>'}
function sesAnsText(r,st){var v=r.a[st.id];if(st.kind==='info')return st.q;if(st.kind==='choose')return st.opts[v];if(st.kind==='camino')return st.labels[v];if(st.kind==='multi')return v.map(function(i){return st.opts[i]}).join(', ');return v}
function sesKit(s,r){if(!s.test.kit)return '';var A=function(n,id){var a=s.test.ans[n];return a&&a[id]};var d4=A(4,'donde');
  var items=[['Tu pregunta (sesión 1)',A(1,'pregunta')],['Tu condición (sesión 3)',A(3,'condicion')],['Tu frase (sesión 4)',A(4,'linea')],['Dónde preguntar (sesión 4)',d4!=null&&d4!==5?sesStepIn(4,'donde').opts[d4]:null],[s.test.path==='apoyo'?'Tu mensaje (sesión 6)':'Tu primera frase (sesión 6)',A(6,'frase')]].filter(function(x){return x[1]&&String(x[1]).trim()});
  return '<section class="card recall ss-kit" aria-labelledby="kitH"><p class="small"><b id="kitH" style="color:var(--forest)">Mi kit</b> · solo tú lo ves</p>'+(items.length?items.map(function(x){return'<p class="small" style="margin-top:6px">'+x[0]+'</p><p class="q">«'+esc(x[1])+'»</p>'}).join(''):'<p class="q">Todavía no hay piezas: lo que escribas en las sesiones aparecerá aquí.</p>')+'</section>'}
function vSesDone(s){var T=s.test,k=T.done,def=sesDef(Math.max(1,k)),r=T.ans['r'+k]||{n:k,a:T.ans[k]||{},basePath:T.path};var tk=k?def.take(r):[];
  return '<div class="sub"><button class="iconbtn round" data-a="home" aria-label="Volver a Hoy">'+ic('back',22)+'</button><h1>Sesión '+k+' · '+sesTitle(s,Math.max(1,k))+'</h1></div>'+
   '<div class="pr-body"><p class="doneline">'+ic('check',20)+'Sesión '+k+' hecha</p><h2 id="pq" tabindex="-1" style="font-size:var(--t22)">Te llevas</h2><div class="card recall ss-take">'+tk.map(function(t){return (t[0]?'<p class="small"><b style="color:var(--forest)">'+esc(t[0])+'</b></p>':'')+'<p class="q">'+esc(t[1])+'</p>'}).join('')+'</div>'+
   (k<7?'<p class="notice">La sesión '+(k+1)+' se abre mañana, '+tomorrowName(s)+'. '+sesBy(def,'next',r)+'</p>':'<p class="notice">Terminaste las siete sesiones de prueba.</p>')+'</div>'+dock('<button class="btn sec" data-a="home">Volver a Hoy</button>')}

/* ---- actions ---- */
App.prototype.sesOpen=function(n,pv){var s=this.s,T=s.test;
  if(pv){T.pv=n;T.pvDraft=sesNewRun(s,n,true)}
  else{T.pv=null;if(!T.drafts[T.cur])T.drafts[T.cur]=sesNewRun(s,T.cur,false);var r=T.drafts[T.cur];if(T.gap){r.i=0;r.low=false;T.gapSince=T.cur;T.gap=false}}
  this.go({view:{k:'ses'},sheet:null,land:false},'#pq')};
App.prototype.sesLog=function(r,st){var rep=r.rep[st.id],x=sesVar(r,st);this.s.test.last={n:r.n,step:st.id,q:x.q,rule:rep.rule+(r.mode==='B'?' · variante «una respuesta al final»: se mostrará en la pantalla final':''),scripted:rep.scripted,text:rep.text,guidance:st.guidance}};
App.prototype.sesAct=function(a,d){var s=this.s,T=s.test,r=sesRun(s),me=this;if(!r&&a!=='ssopen')return;r.mode=sesV(s,'reply');
  var def=r?sesDef(r.n):null,sc=r?sesScreens(r):null,cur=sc?sc[r.i]:null,st=cur&&cur.length>2?sesStepR(r,cur.slice(2)):null;
  switch(a){
  case'sspick':if(!st)break;r.a[st.id]=st.kind==='camino'?d.v:+d.v;r.sk=r.sk.filter(function(x){return x!==st.id});
    if(st.kind==='camino'&&r.lastPath!==d.v){/* changing path drops the path-specific answers so the right questions show */
      Object.keys(r.a).forEach(function(k){if(k!=='camino')delete r.a[k]});Object.keys(r.rep).forEach(function(k){if(k!=='camino')delete r.rep[k]});r.sk=[];r.lastPath=d.v}
    this.go({},'[data-a="sspick"][data-v="'+d.v+'"]');break;
  case'ssmulti':if(!st)break;var cur2=r.a[st.id]||[],i=+d.v,k=cur2.indexOf(i);if(k>-1)cur2.splice(k,1);else if(cur2.length<st.max)cur2.push(i);else{this.say('Puedes elegir hasta '+st.max+'. Quita una para cambiarla.');break}r.a[st.id]=cur2;this.go({},'[data-a="ssmulti"][data-v="'+d.v+'"]');break;
  case'ssnext':if(cur==='end')break;
    if(cur[0]==='q'){if(!sesAnswered(r,st))break;r.sk=r.sk.filter(function(x){return x!==st.id});
      if(!st.quiet){r.rep[st.id]=sesReply(r,st);this.sesLog(r,st)}else{delete r.rep[st.id];T.last={n:r.n,step:st.id,q:st.q,rule:st.kind==='info'?'Variante B de la sesión 2: pregunta plegada porque la sesión 1 ya eligió «Cubrir algo básico ahora»':'Paso de un toque: sin respuesta de Elara (quiet)',scripted:true,text:st.kind==='info'?st.body:'',guidance:st.guidance}}
      if(st.kind==='camino'&&!r.pv)T.path=r.a.camino;
      if(st.path&&!r.pv){var pp=st.path[r.a[st.id]];if(pp&&(r.n===1||!T.path))T.path=pp}
      var sc2=sesScreens(r),tgt=(st.quiet||r.mode==='B')?nextQ(sc2,st.id):'r:'+st.id;r.i=sc2.indexOf(tgt);if(r.i<0)r.i=sc2.length-1}
    else{r.i=Math.min(sesScreens(r).length-1,r.i+1)}
    this.go({},'#pq');break;
  case'ssskip':if(!st)break;if(r.sk.indexOf(st.id)<0)r.sk.push(st.id);delete r.rep[st.id];delete r.a[st.id];if(st.kind==='camino'){delete r.a.camino}
    T.last={n:r.n,step:st.id,q:sesVar(r,st).q,rule:'Saltado: no se genera respuesta; la sesión sigue',scripted:true,text:'',guidance:st.guidance};
    var sc3=sesScreens(r);r.i=sc3.indexOf(nextQ(sc3,st.id));if(r.i<0)r.i=sc3.length-1;this.go({},'#pq');break;
  case'ssback':this.sesBack();break;
  case'sscorrect':var id=d&&d.v?d.v:cur.slice(2);r.corr[id]=true;delete r.rep[id];if(r.scenCorr&&typeof r.a[id]==='string'){r.a[id]=r.scenCorr;r.scenCorr=null}r.i=sesScreens(r).indexOf('q:'+id);var st2=sesStepR(r,id);this.go({},st2.kind==='reflect'||st2.kind==='branch'?'#ssin':'#pq');break;
  case'sschange':var cs=sesScreens(r),ci=cs.indexOf('q:camino');if(ci>-1){r.i=ci;this.go({},'[data-a="sspick"][aria-checked="true"],#pq')}break;
  case'sslow':r.low=true;T.last={n:r.n,step:'(capacidad baja)',q:'Hoy no puedo',rule:'Capacidad baja: se acepta, se ofrece parar, sin tarea',scripted:true,text:SES_LOW,guidance:'Aceptar. Ofrecer «Parar por hoy» y decir que no se pierde nada. Sin tarea.'};this.go({},'#pq');break;
  case'sslowback':r.low=false;this.go({},'#pq');break;
  case'ssstop':case'ssleave':r.low=false;this.sesLeave();break;
  case'sscopy':var txt=r.a.frase||'';try{navigator.clipboard.writeText(txt).then(function(){me.toast('Copiado.')},function(){me.toast('No se pudo copiar aquí. Mantén pulsado el mensaje para copiarlo.')})}catch(e){this.toast('No se pudo copiar aquí. Mantén pulsado el mensaje para copiarlo.')}break;
  case'sskit':T.kit=!T.kit;this.go({},'[data-a="sskit"]');if(T.kit){var kt=this.root.querySelector('.ss-kit');if(kt&&kt.scrollIntoView)kt.scrollIntoView({block:'nearest'})}break;
  case'ssfinish':
    if(r.pv){T.pv=null;T.pvDraft=null;T.lastPreview=r.n;s.hist=[];this.go({view:null,tab:'hoy'},null,{replace:true});break}
    T.ans[r.n]=JSON.parse(JSON.stringify(r.a));T.ans['r'+r.n]={n:r.n,a:T.ans[r.n],basePath:r.basePath,sk:r.sk.slice(),fold:r.fold};T.done=r.n;T.doneDate[r.n]=s.date;delete T.drafts[r.n];T.cur=Math.min(7,r.n+1);T.justDone=true;T.gapSince=null;
    s.done[2]=Math.min(7,T.done);s.hist=[];this.go({view:null,tab:'hoy'},null,{replace:true});this.toast('Sesión '+r.n+' hecha.');break;
  }};
function nextQ(sc,id){var i=sc.indexOf('q:'+id);for(var j=i+1;j<sc.length;j++)if(sc[j][0]==='q'||sc[j]==='end')return sc[j];return 'end'}
App.prototype.sesBack=function(){var s=this.s,r=sesRun(s);if(!r){this.pop();return 'pop'}
  if(r.low){r.low=false;this.go({},'#pq');return 'low'}
  if(r.i>0){r.i--;this.go({},'#pq');return 'step'}
  this.sesLeave();return 'leave'};
App.prototype.sesLeave=function(){var s=this.s,T=s.test,r=sesRun(s);
  if(r&&r.pv){T.pv=null;T.pvDraft=null;s.hist=[];this.go({view:null,tab:'hoy'},null,{replace:true});return}
  var any=r&&(Object.keys(r.a).length||r.sk.length||r.i>0);s.hist=[];this.go({view:null,tab:'hoy'},null,{replace:true});if(any)this.toast('Guardamos tus respuestas. Puedes seguir cuando quieras.')};
App.prototype.sesInput=function(v){var s=this.s,r=sesRun(s);if(!r)return;r.mode=sesV(s,'reply');var sc=sesScreens(r),cur=sc[r.i];if(!cur||cur[0]!=='q')return;var id=cur.slice(2);r.a[id]=v;var b=this.root.querySelector('[data-a="ssnext"]');if(b)b.disabled=!v.trim()};
/* reviewer hooks (outside the phone) */
App.prototype.sesScenario=function(n,key){var s=this.s,T=s.test,sc=(SES_SCEN[n]||[]).find(function(x){return x[0]===key});if(!sc)return;
  T.pv=n;T.pvDeps={};var extra=sc[3]||{};if(extra.hasOwnProperty('dep4'))T.pvDeps[4]=extra.dep4;if(extra.hasOwnProperty('fold1'))T.pvDeps[1]={tema:extra.fold1};
  var a=JSON.parse(JSON.stringify(sc[2]));T.pvPath=a.camino||extra.path||undefined;
  if(n>1){var pk=SES_PATH_SCN[T.pvPath||'empleo']||SES_PATH_SCN.empleo,ps=(SES_SCEN[n-1]||[]).find(function(x){return x[0]===pk[n-1]})||(SES_SCEN[n-1]||[])[0];
    if(ps){var pa=JSON.parse(JSON.stringify(ps[2]));T.pvDeps.take=sesDef(n-1).take({n:n-1,a:pa,basePath:pa.camino||T.pvPath||null,fold:false})}}
  var r=sesNewRun(s,n,true);if(T.pvPath)r.basePath=T.pvPath;r.a=a;if(T.pvPath&&sesDef(n).steps.some(function(z){return z.kind==='camino'}))r.a.camino=a.camino||T.pvPath;r.lastPath=r.a.camino;r.i=0;r.scenCorr=extra.corr||null;T.pvDraft=r;T.kit=false;
  this.go({view:{k:'ses'},sheet:null,land:false},'#pq')};
App.prototype.sesPreview=function(n){var T=this.s.test;T.pvDeps={};T.pvPath=undefined;T.kit=false;this.sesOpen(n,true)};
/* reviewer: complete sessions 1..n-1 along one path with that path's examples, so session n opens from Hoy with real earlier answers */
App.prototype.sesAdvance=function(n,path){var s=this.s,vr=s.test&&s.test.vr,T=sesFresh(vr);s.test=T;path=path||'empleo';var pick=SES_PATH_SCN[path]||SES_PATH_SCN.empleo;
  for(var k=1;k<n;k++){var sc=(SES_SCEN[k]||[]).find(function(x){return x[0]===pick[k]})||SES_SCEN[k][0],a=JSON.parse(JSON.stringify(sc[2]));if(a.camino)T.path=a.camino;var st0=sesDef(k).steps[0];if(st0.path){var pp=st0.path[a[st0.id]];if(pp&&(k===1||!T.path))T.path=pp}
    if(k>=3&&!a.camino&&sesDef(k).steps.some(function(z){return z.kind==='camino'}))a.camino=T.path;
    var fold=k===2&&sesV(s,'s2')==='B'&&T.ans[1]&&T.ans[1].tema===0;if(fold)a={};
    T.ans[k]=a;T.ans['r'+k]={n:k,a:a,basePath:T.path,sk:[],fold:fold};T.doneDate[k]=s.date}
  T.done=n-1;T.cur=n;s.done[2]=T.done;s.hist=[];this.go({view:null,tab:'hoy',sheet:null,kb:false},null,{replace:true})};
App.prototype.sesNextDay=function(){var T=this.s.test;T.justDone=false;var d=D(this.s.date);d.setDate(d.getDate()+1);this.s.date=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');this.s.hist=[];this.go({view:null,tab:'hoy'},null,{replace:true})};
App.prototype.sesGap=function(){var T=this.s.test;T.justDone=false;T.gap=true;var d=D(this.s.date);d.setDate(d.getDate()+9);this.s.date=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');this.s.hist=[];this.go({view:null,tab:'hoy'},null,{replace:true})};
App.prototype.sesSetVar=function(k,v){var T=this.s.test;T.vr[k]=v;/* a variant change restarts the open session so the variable is the only difference */
  var r=sesRun(this.s);if(r){if(r.pv){T.pvDraft=sesNewRun(this.s,r.n,true);if(r.basePath)T.pvDraft.basePath=r.basePath;if(r.a.camino)T.pvDraft.a.camino=r.a.camino}else{T.drafts[T.cur]=sesNewRun(this.s,T.cur,false)}}
  this.go({},'#pq')};

/*SES-END*/

window.Elara={SES_FOLD_TEXT:SES_FOLD.q+'. '+SES_FOLD.body+' '+SES_FOLD.note,SES:SES,SES_VAR_DEF:SES_VAR_DEF,SES_PATH_SCN:SES_PATH_SCN,sesStepsOf:sesStepsOf,sesRecapLine:sesRecapLine,sesV:sesV,SES_SCEN:SES_SCEN,SES_PATHS:SES_PATHS,sesFresh:sesFresh,sesScreens:sesScreens,sesRun:sesRun,CIRCLES:CIRCLES,ccSuggested:ccSuggested,cxPreset:cxPreset,cxPublic:cxPublic,CXP:CXP,cxStarter:cxStarter,cxDeck:cxDeck,DEV:DEV,App:App,fresh:fresh,PRESETS:PRESETS,entry:entry,daysCompleted:daysCompleted,placesWalked:placesWalked,totalPlaces:totalPlaces,totalDaysArea:totalDaysArea};
})();
