/* ---------- Seven-session Money test (prototype) ----------
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
  take:function(r){var c=r.a.situacion,st=SES[1].steps[0];if(c==null)return [['Hoy','Saltaste esta pregunta. Mañana puedes elegir camino igual.']];return [['Tu situación hoy',st.opts[c]],['Lo que encaja',st.route[c]]]}},
 {n:3,src:'MONEY-W1-D7 (pregunta A) + rama de W1-D6',title:'Por dónde empezar',
  purpose:'Hoy eliges por dónde empezar y qué tiene que respetar cualquier opción.',
  next:'Mañana conviertes algo que ya hiciste en una frase que puedes usar.',
  steps:[
   {id:'camino',kind:'camino',q:'Con lo que sabes hoy, ¿qué camino te serviría explorar primero?',
    labels:{empleo:'Empleo',negocio:'Probar una idea de servicio o venta',apoyo:'Aclarar un cobro, pago o apoyo',ninguno:'Ninguno por ahora'},
    replies:{empleo:'Para empleo, lo que filtra primero suele ser una condición tuya: horario, cuidados o equipo. En el siguiente paso la nombras.',
     negocio:'Para probar una idea no hace falta gastar: primero se prueba si alguien la necesita. En el siguiente paso miras con qué cuentas.',
     apoyo:'Para un cobro o un apoyo, lo que falta suele ser un requisito o un acceso, no tu mérito. En el siguiente paso lo separas.',
     ninguno:'Pausar también es una decisión. Hoy no hay paso siguiente; puedes elegir un camino cuando quieras.'},
    guidance:'Una sola vía o pausa; puede cambiarla sin repetir sesiones. «Ninguno» se respeta sin insistir.'},
   {id:'condicion',kind:'branch',
    v:{empleo:{q:'¿Qué tienes a favor para explorar empleo y qué condición necesitas resolver antes?',ph:'Ej.: sé atender clientes; solo puedo de 9 a 2',
       examples:[{t:'Tengo experiencia en atención al cliente, pero solo puedo de 9 a 2',r:'Tu condición es el horario de 9 a 2: será tu primer filtro. Lo que tienes a favor, la atención al cliente, ya sirve para buscar puestos con ese horario.',cond:'solo de 9 a 2'}]},
     negocio:{q:'¿Con qué cuentas para explorar una idea sin gastar y qué te falta?',ph:'Ej.: tengo horno; me falta saber si alguien compraría',
       examples:[{t:'Sé hacer pan y tengo horno; me falta saber si alguien lo compraría',r:'Tienes lo necesario para una prueba pequeña sin gastar: el horno y la receta. Lo que falta es un dato, si alguien lo compraría, y eso se averigua preguntando, no invirtiendo.',cond:'probarlo sin gastar'}]},
     apoyo:{q:'Para aclarar esta necesidad, cobro o apoyo, ¿qué información o acceso tienes y qué te falta?',ph:'Ej.: sé que existe una ayuda; no sé si me corresponde',
       examples:[{t:'Sé que existe una ayuda, pero no sé si me corresponde',r:'Lo que falta es un requisito, no tu mérito. La pregunta concreta es qué condiciones pide esa ayuda.',cond:'saber qué condiciones pide la ayuda'}]}},
    guidance:'Separa lo que tiene de lo que falta. Convierte lo que falta en un filtro, no en un defecto. Nunca supongas dinero, tiempo o ayudas que no mencionó.'}],
  take:function(r){var p=sesPathOf(r);if(p==='ninguno')return [['Hoy','Decidiste pausar por ahora. Puedes elegir un camino cuando quieras.']];
   var out=[];if(p)out.push(['Tu camino',SES[2].steps[0].labels[p]]);var t=r.a.condicion;if(t)out.push(['Lo que tienes y la condición, con tus palabras','«'+t+'»'])
   if(!out.length)out.push(['Hoy','Saltaste las preguntas. Puedes elegir camino cuando quieras.']);return out}},
 {n:4,src:'MONEY-W2-D2, por rama',title:'Una frase verdadera',
  purpose:'Hoy escribes una frase verdadera sobre lo que sabes hacer o lo que ya sabes de tu trámite.',
  next:'Mañana armas un filtro para descartar rápido lo que no cabe en tu vida.',
  steps:[
   {id:'camino',kind:'camino',quiet:true,q:'Sigues por:',labels:{empleo:'Empleo',negocio:'Negocio',apoyo:'Aclarar o apoyo',ninguno:'Ninguno por ahora'},
    guidance:'Paso de un toque para confirmar o cambiar el camino. Sin respuesta de Elara.'},
   {id:'linea',kind:'branch',
    v:{empleo:{q:'¿Qué experiencia verdadera muestra una habilidad útil para ese puesto?',fmt:'Hice ___ y el resultado fue ___',ph:'Hice ___ y el resultado fue ___',
       examples:[{t:'Llevaba el inventario y detectaba faltantes',r:'Eso ya es evidencia: llevar inventario y detectar faltantes. Úsala cuando una oferta pida control u organización.'},
        {t:'Nunca tuve empleo formal',r:'Las tareas sin pago cuentan: organizar turnos de cuidado, por ejemplo. Si hoy no sale ninguna, vale un ejemplo inventado para ver el formato.',take:'Un formato para tu frase, «Hice ___ y el resultado fue ___», y que las tareas sin pago también cuentan.'}]},
     negocio:{q:'¿Qué has hecho que pueda servir para atender esa necesidad?',fmt:'Hice ___ y el resultado fue ___',ph:'Hice ___ y el resultado fue ___',
       examples:[{t:'Hago pasteles para los cumpleaños de mi familia desde hace años',r:'Eso cuenta como experiencia con encargos y fechas. Para la frase solo falta el resultado, en tus palabras: qué pasó con esos pasteles.'}]},
     apoyo:{q:'¿Qué sabes ya sobre esta necesidad, cobro o apoyo y qué necesitas aclarar?',fmt:'Ya sé ___; necesito aclarar ___',ph:'Ya sé ___; necesito aclarar ___',
       examples:[{t:'Ya sé que hay una beca para madres; necesito aclarar si aplica en mi ciudad',r:'Ya tienes separado lo que sabes de lo que falta. La pregunta para la oficina de esa beca sería: «¿Esta beca aplica en mi ciudad?».'}]}},
    guidance:'Empleo o negocio: convierte la tarea que nombró en una línea de evidencia; nunca inventes una habilidad. Si no tiene empleo formal: las tareas sin pago cuentan; si no sale ninguna, ofrece un ejemplo ficticio del formato. Apoyo: separa lo que sabe de la pregunta abierta; nunca pidas demostrar que merece ayuda.'}],
  take:function(r){var p=sesPathOf(r);if(p==='ninguno')return [['Hoy','Decidiste pausar por ahora. Tu frase puede esperar.']];var t=r.a.linea;if(!t)return [['Hoy','Saltaste la frase. Puedes escribirla otro día; nada se pierde.']];
   var ex=sesExample((SES[3].steps[1].v[p]||{}),t);return [['Tu frase',ex&&ex.take?ex.take:'«'+t+'»']]}},
 {n:5,src:'MONEY-W2-D3 (pregunta A)',title:'Tu filtro',
  purpose:'Hoy armas un filtro para descartar rápido lo que no encaja en tu vida.',
  next:'Mañana juntas tu frase y tu filtro en una primera versión.',
  steps:[
   {id:'condiciones',kind:'multi',max:2,q:'¿Qué tendría que respetar una oportunidad para que cupiera de verdad en tu vida?',
    opts:['Horario','Cuidados','Lugar','Equipo','Conexión','Idioma','Accesibilidad','Otra'],
    check:['qué horario pide','si el horario deja espacio para tus cuidados','desde dónde se puede trabajar','qué equipo pide','qué conexión necesita','en qué idioma se trabaja','si es accesible para ti','tu otra condición'],
    note:'Remoto dice dónde se trabaja, no cuándo. Revisa horario, lugar permitido, equipo e idioma.',
    guidance:'Convierte sus condiciones en una regla para descartar y una pregunta para cualquier oferta real.'},
   {id:'imprescindible',kind:'reflect',q:'De lo que elegiste, ¿qué es imprescindible para ti?',ph:'Ej.: solo puedo con el móvil',
    examples:[{t:'Solo tengo el móvil y 20 minutos por la noche; necesito dinero pronto',r:'Tres filtros: solo móvil, 20 minutos y pago pronto. Revisa en cada oferta qué equipo pide y cuándo paga; nunca pagues por empezar.'},
     {t:'Tengo ordenador y dos tardes libres; no tengo prisa, pero no quiero pagar un curso sin saber si me sirve',r:'Puedes explorar sin comprar formación todavía. Toma una oferta que te interese y busca un requisito que se repita; eso te dice qué conviene aprender.'},
     {t:'Me ofrecieron un trabajo por WhatsApp que pide pagar el registro',r:'Si piden pagar para empezar o tus datos muy pronto, compruébala en la web oficial, no en el enlace. Pagar para poder trabajar es una señal de alerta.',offer:true}],
    guidance:'Una regla para descartar y una pregunta de verificación. Si menciona una oferta concreta, añade la comprobación de W2-D6: «Si piden pagar para empezar o datos muy pronto, compruébala en la web oficial, no en el enlace».'}],
  take:function(r){var st=SES[4].steps[0],p=r.a.condiciones||[],out=[];if(p.length)out.push(['Tu filtro',p.map(function(i){return st.opts[i]}).join(' y ')],['Pregunta para cualquier oferta','¿'+p.map(function(i){return st.check[i]}).join(' y ').replace(/^./,function(c){return c.toUpperCase()})+'?']);
   if(r.a.imprescindible)out.push(['Lo imprescindible','«'+r.a.imprescindible+'»']);if(!out.length)out.push(['Hoy','Saltaste el filtro. Puedes armarlo otro día.']);return out}},
 {n:6,src:'MONEY-W3-D1, por rama',title:'Tu primera frase',
  purpose:'Hoy escribes la primera frase que podrías usar de verdad.',
  next:'Mañana decides si probar algo pequeño, esperar o parar, y guardas tu kit.',
  steps:[
   {id:'camino',kind:'camino',quiet:true,q:'Sigues por:',labels:{empleo:'Empleo',negocio:'Negocio',apoyo:'Aclarar o apoyo',ninguno:'Ninguno por ahora'},guidance:'Paso de un toque para confirmar o cambiar el camino. Sin respuesta de Elara.'},
   {id:'frase',kind:'branch',quote:{n:4,id:'linea'},
    v:{empleo:{q:'¿Cómo explicarías lo que puedes aportar al puesto sin exagerar?',fmt:'Puedo ayudar con ___; lo demostré cuando ___',ph:'Puedo ayudar con ___; lo demostré cuando ___',
       examples:[{t:'Soy responsable y trabajadora',r:'«Responsable» se entiende mejor con una tarea que lo muestre, por ejemplo una vez que organizaste algo sin que te lo pidieran. Con eso, la frase se sostiene sola.'},
        {t:'Puedo ayudar con el inventario; lo demostré cuando detectaba faltantes en la tienda',r:'Esa frase ya sirve: dice qué haces y cuándo lo mostraste, en menos de 25 palabras. Puedes usarla tal cual.'}]},
     negocio:{q:'¿A quién ayudaría tu idea y con qué problema concreto?',fmt:'Ayudaría a ___ a resolver ___',ph:'Ayudaría a ___ a resolver ___',
       examples:[{t:'Ayudaría a familias del barrio a resolver los pasteles de cumpleaños sin salir de casa',r:'Ya dice a quién ayudas y qué resuelves. Para probarla basta preguntar a dos familias si la pagarían, sin cobrar nada todavía.'}]},
     apoyo:{q:'¿Cómo explicarías qué necesitas saber para aclarar tu necesidad, cobro o apoyo?',fmt:'Necesito saber ___; la situación es ___',ph:'Necesito saber ___; la situación es ___',
       examples:[{t:'Necesito saber si la beca aplica en mi ciudad; la situación es que crío sola a dos hijos',r:'La frase dice lo que necesitas saber y tu situación, sin justificar nada más. Puedes llevarla tal cual.'}]}},
    guidance:'Frase vaga («soy responsable»): sugiere una tarea que lo muestre, como sugerencia, no como pregunta obligatoria. Frase concreta: déjala en 25 palabras o menos y di que se puede reutilizar. Apoyo: nunca pedir justificación.'}],
  take:function(r){var p=sesPathOf(r);if(p==='ninguno')return [['Hoy','Decidiste pausar por ahora.']];var t=r.a.frase;if(!t)return [['Hoy','Saltaste la frase. Puedes escribirla otro día.']];return [['Tu frase','«'+t+'»'],['','No se envía a ningún sitio.']]}},
 {n:7,src:'MONEY-W3-D7 (pregunta B) + respuesta de W5-D1',title:'Probar, esperar o parar',
  purpose:'Hoy decides con calma: probar algo pequeño, esperar o parar.',
  next:'Si sigues, la próxima semana comparas tu kit con una oportunidad real.',
  steps:[
   {id:'decision',kind:'choose',q:'¿Qué parte de tu borrador podrías probar ya y qué falta preparar, si decides seguir?',
    opts:['Probar algo pequeño','Preparar lo que falta','Decido no seguir por ahora'],
    replies:['Una prueba sin costo ni exposición: compara tu frase con una oferta real sin enviarla y anota qué coincide.',
     'Elige solo la pieza que falta, por ejemplo el resultado de tu frase o la condición de tu filtro. Lo demás puede esperar.',
     'Es una decisión con información. Te quedas con lo que preparaste, por si lo necesitas más adelante.'],
    guidance:'Probar: una prueba sin costo ni exposición. Preparar: nombra la única pieza que falta. No seguir: confirma que es una decisión informada y lo que se queda; sin persuadir.'},
   {id:'ahora',kind:'reflect',q:'Ahora puedo… / Aún necesito…',ph:'Ahora puedo ___ / Aún necesito ___',
    examples:[{t:'Ahora puedo explicar lo que sé hacer con un ejemplo',r:'Eso es lo que te llevas: una frase con ejemplo. Lo que necesites después puede esperar a la próxima semana.'},
     {t:'Aún necesito saber si la beca aplica en mi ciudad',r:'Entonces la pieza que falta es una sola respuesta. Tu frase de la sesión 6 ya sirve para pedirla.'}],
    guidance:'Nombra lo que puede hacer ahora o lo único que le falta, con sus palabras. Sin tareas nuevas.'}],
  take:function(r){var st=SES[6].steps[0],out=[];if(r.a.decision!=null)out.push(['Tu decisión',st.opts[r.a.decision]]);if(r.a.ahora)out.push(['Con tus palabras','«'+r.a.ahora+'»']);if(!out.length)out.push(['Hoy','Saltaste las preguntas. Lo que preparaste sigue aquí.']);return out}}
];
/* scenarios for the reviewer panel: pre-filled answers per session (prototype examples, not real answers) */
var SES_SCEN={
 1:[['a','«Aclarar un cobro» + «¿Qué día me pagan?»',{tema:2,pregunta:'¿Qué día me pagan?'}],['b','«Cubrir algo básico» + «No sé si me alcanza para la renta»',{tema:0,pregunta:'No sé si me alcanza para la renta'}],['c','Corrección: «¿Cuándo me pagan?» → «Es por mi hermana…»',{tema:2,pregunta:'¿Cuándo me pagan?'},{corr:'Es por mi hermana: ¿cuándo le pagan a ella?'}],['free','Texto libre propio (sin guion)',{tema:5,pregunta:'Quiero entender por qué siempre me quedo corta a fin de mes'}]],
 2:[['a','«No alcanza»',{situacion:2}],['b','«Varía mucho»',{situacion:3}],['c','«Alcanza y sobra algo»',{situacion:0}]],
 3:[['a','Empleo · «solo de 9 a 2»',{camino:'empleo',condicion:'Tengo experiencia en atención al cliente, pero solo puedo de 9 a 2'}],['b','Apoyo · «no sé si me corresponde»',{camino:'apoyo',condicion:'Sé que existe una ayuda, pero no sé si me corresponde'}],['c','Negocio · pan y horno',{camino:'negocio',condicion:'Sé hacer pan y tengo horno; me falta saber si alguien lo compraría'}],['d','«Ninguno por ahora»',{camino:'ninguno'}]],
 4:[['a','Empleo · «inventario»',{camino:'empleo',linea:'Llevaba el inventario y detectaba faltantes'}],['b','Empleo · «sin empleo formal»',{camino:'empleo',linea:'Nunca tuve empleo formal'}],['c','Apoyo · beca',{camino:'apoyo',linea:'Ya sé que hay una beca para madres; necesito aclarar si aplica en mi ciudad'}]],
 5:[['a','«Solo móvil, 20 min, pronto»',{condiciones:[0,3],imprescindible:'Solo tengo el móvil y 20 minutos por la noche; necesito dinero pronto'}],['b','«Ordenador, sin prisa»',{condiciones:[0,4],imprescindible:'Tengo ordenador y dos tardes libres; no tengo prisa, pero no quiero pagar un curso sin saber si me sirve'}],['c','Menciona una oferta (control de estafa)',{condiciones:[0,2],imprescindible:'Me ofrecieron un trabajo por WhatsApp que pide pagar el registro'}]],
 6:[['a','Empleo · frase vaga',{camino:'empleo',frase:'Soy responsable y trabajadora'},{dep4:'Llevaba el inventario y detectaba faltantes'}],['b','Empleo · frase concreta',{camino:'empleo',frase:'Puedo ayudar con el inventario; lo demostré cuando detectaba faltantes en la tienda'},{dep4:'Llevaba el inventario y detectaba faltantes'}],['c','Sin frase de la sesión 4 (saltada o tras una pausa)',{camino:'apoyo',frase:'Necesito saber si la beca aplica en mi ciudad; la situación es que crío sola a dos hijos'},{dep4:null}]],
 7:[['a','«Probar algo pequeño»',{decision:0,ahora:'Ahora puedo explicar lo que sé hacer con un ejemplo'}],['b','«Decido no seguir por ahora»',{decision:2,ahora:'Aún necesito saber si la beca aplica en mi ciudad'}]]
};
function sesNorm(t){return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[¿?¡!.,;:«»"“”]/g,'').replace(/\s+/g,' ').trim()}
function sesExample(v,t){var n=sesNorm(t);return (v.examples||[]).find(function(e){return sesNorm(e.t)===n})||null}
function sesDef(n){return SES[n-1]}
function sesFresh(){return{cur:1,done:0,path:null,ans:{},drafts:{},gap:false,pv:null,pvDraft:null,pvPath:undefined,pvDeps:{},last:null,kit:false,justDone:false}}
function sesRun(s){var T=s.test;return T.pv?T.pvDraft:T.drafts[T.cur]}
function sesPathOf(r){return r.a.camino||r.basePath||null}
function sesNewRun(s,n,pv){var T=s.test,p=pv&&T.pvPath!==undefined?T.pvPath:T.path;var r={n:n,i:0,a:{},sk:[],rep:{},corr:{},low:false,basePath:p,pv:!!pv};if(p&&sesDef(n).steps.some(function(z){return z.kind==='camino'})){r.a.camino=p;r.lastPath=p}return r}
/* the screens of a run: q:<step>, r:<step> (no reply for skipped or quiet steps), end */
function sesScreens(r){var def=sesDef(r.n),out=[];
  def.steps.forEach(function(st){if(st.kind==='branch'){var p=sesPathOf(r);if(!p||p==='ninguno')return}
    out.push('q:'+st.id);if(r.sk.indexOf(st.id)<0&&!st.quiet&&r.rep[st.id])out.push('r:'+st.id)});
  out.push('end');return out}
/* the planned screens, for the progress bar: every offered question and the reply it will get (skipped and quiet steps have none) */
function sesPlan(r){var def=sesDef(r.n),out=[];def.steps.forEach(function(st){if(st.kind==='branch'){var p=sesPathOf(r);if(!p||p==='ninguno')return}out.push('q:'+st.id);if(r.sk.indexOf(st.id)<0&&!st.quiet)out.push('r:'+st.id)});out.push('end');return out}
function sesStep(def,id){return def.steps.find(function(x){return x.id===id})}
function sesVar(r,st){if(st.kind!=='branch')return st;var p=sesPathOf(r);return st.v[p]||st.v.empleo}
function sesAnswered(r,st){var v=r.a[st.id];if(st.kind==='multi')return !!(v&&v.length);if(st.kind==='reflect'||st.kind==='branch')return !!(v&&v.trim());return v!=null}
function sesReply(r,st){var v=r.a[st.id],x=sesVar(r,st),pre=r.corr[st.id]?'Entendido. ':'';
  if(st.kind==='choose')return{text:pre+st.replies[v],rule:'Opción «'+st.opts[v]+'»: respuesta escrita para esta opción',scripted:true};
  if(st.kind==='camino')return{text:pre+st.replies[v],rule:'Camino «'+st.labels[v]+'»: respuesta escrita para esta opción',scripted:true};
  if(st.kind==='multi'){var ps=v.map(function(i){return st.opts[i].toLowerCase()}),cs=v.map(function(i){return st.check[i]});
    return{text:pre+'Tu filtro: '+ps.join(' y ')+'. Antes de leer una oferta entera, mira '+cs.join(' y ')+'; si no lo dice, pregúntalo antes de seguir.',rule:'Plantilla con las opciones elegidas ('+ps.join(', ')+')',scripted:true}}
  var ex=sesExample(x,v);if(ex){var t=ex.r;if(r.corr[st.id]&&!/^Entendido/.test(t))t='Entendido. '+t;return{text:t,rule:'Coincide con un ejemplo preparado: «'+ex.t+'»',scripted:true}}
  return{text:SES_GENERIC,rule:'Respuesta libre: en la app la generaría Elara con la guía de este día (no simulada aquí)',scripted:false}}
function sesQuote(s,r,st){if(!st.quote)return null;var T=s.test,q=null;
  if(r.pv&&T.pvDeps.hasOwnProperty(st.quote.n))q=T.pvDeps[st.quote.n];else{var a=T.ans[st.quote.n];q=a&&a[st.quote.id]||null}
  return q&&String(q).trim()?q:null}

/* ---- Hoy: the session card, the entry, and «Para retomar» ---- */
function sesEntry(s){var T=s.test;
  if(T.done>=7&&!T.drafts[T.cur])return{kind:'sesdone',label:'Ver lo que te llevas'};
  if(T.justDone)return{kind:'sesdone',label:'Ver lo que te llevas'};
  var r=T.drafts[T.cur];
  if(r){var sc=sesScreens(r),pl=sesPlan(r),pi=pl.indexOf(sc[Math.min(r.i,sc.length-1)]);return{kind:'ses',label:'Seguir con la sesión '+T.cur,hint:T.gap?'Puedes seguir donde ibas. No hace falta repasar nada.':'Vas en el paso '+((pi<0?0:pi)+1)+' de '+pl.length+'. Guardamos lo que elegiste y escribiste.'}}
  return{kind:'ses',label:'Empezar la sesión '+T.cur}}
function sesCard(s,stamp){var T=s.test,n=T.justDone||T.done>=7?T.done:T.cur,def=sesDef(Math.max(1,n));
  var meta=T.done>=7?'Terminaste las siete sesiones de prueba.':T.justDone?'Sesión '+T.done+' hecha. La sesión '+(T.done+1)+' se abre mañana, '+tomorrowName(s)+'.':T.gap?'Tu sesión '+T.cur+' te espera. No hace falta repasar nada.':def.purpose;
  return '<div class="warm" style="transform:rotate(-.4deg)"><article class="postcard torn-a" aria-labelledby="hq"><span class="grain"></span>'+
    '<img class="photo" src="'+IMG.wuzhen+'" alt="Canal de Wuzhen al anochecer, con casas de madera reflejadas en el agua">'+stamp+
    '<div class="pc-body"><p class="pc-place">Claridad financiera · Sesión '+Math.max(1,n)+' de 7</p>'+(T.justDone||T.done>=7?'<p class="doneline">'+ic('check',20)+'Sesión '+T.done+' hecha</p>':'')+
    '<h2 id="hq" class="pc-q">'+def.title+'</h2><p class="meta">'+meta+'</p></div></article></div>'}
function sesRecall(s){var T=s.test,k=T.done;if(!k)return '<div class="card recall"><p class="small">Aquí verás lo que te llevas de cada sesión.</p></div>';
  var tk=sesDef(k).take(T.ans['r'+k]||{a:T.ans[k]||{},basePath:T.path});var first=tk[0];
  return '<div class="card recall"><p class="small"><b style="color:var(--forest)">Te llevaste · Sesión '+k+'</b></p><p class="q">'+(first[0]?esc(first[0])+': ':'')+esc(first[1])+'</p></div>'}

/* ---- the session screen ---- */
function sesScene(s,r,sc){var sh=Math.round((s.w<360?150:s.h&&s.h<700?160:188)/(s.k>1.25?1.6:1));
  var top='<div class="pr-top"><div class="pr-l"><button class="iconbtn round" data-a="ssleave" aria-label="Parar por hoy. Tus respuestas se quedan">'+ic('x',22)+'</button>'+
    (r.i>0||r.low?'<button class="iconbtn round" data-a="ssback" aria-label="Paso anterior">'+ic('back',22)+'</button>':'')+'</div></div>';
  return '<div class="pr-scene torn-foot" style="--sh:'+sh+'px"><img class="pr-photo" src="'+IMG.wzpan+'" alt="Canal de Wuzhen por la mañana: casas de madera y sauces junto al agua verde" data-px="'+(10+(r.n-1)*13)+'" style="object-position:'+(10+(r.n-1)*13)+'% 42%">'+top+'</div>'}
function sesControls(r,st){var x=sesVar(r,st),v=r.a[st.id];
  if(st.kind==='choose')return '<div class="chips ss-opts" role="radiogroup" aria-labelledby="pq">'+st.opts.map(function(o,i){return'<button class="chip" role="radio" aria-checked="'+(v===i)+'" data-a="sspick" data-v="'+i+'">'+o+'</button>'}).join('')+'</div>';
  if(st.kind==='camino'){var order=SES_CAMINO_OPTS.map(function(o){return o[0]}),pre=r.basePath;if(pre&&pre!=='ninguno')order=[pre].concat(order.filter(function(k){return k!==pre}));
    return '<div class="chips ss-opts" role="radiogroup" aria-labelledby="pq">'+order.map(function(k){return'<button class="chip" role="radio" aria-checked="'+(v===k)+'" data-a="sspick" data-v="'+k+'">'+st.labels[k]+'</button>'}).join('')+'</div>'+
      (pre&&pre!=='ninguno'?'<p class="small ss-pre">'+(r.n===3?'Marcado según lo que elegiste antes. Puedes cambiarlo.':'Es el camino que elegiste. Puedes cambiarlo.')+'</p>':'')}
  if(st.kind==='multi'){var sel=v||[];return '<div class="chips ss-opts" role="group" aria-labelledby="pq" aria-describedby="ssmax">'+st.opts.map(function(o,i){var on=sel.indexOf(i)>-1,dis=!on&&sel.length>=st.max;return'<button class="chip" role="checkbox" aria-checked="'+on+'" data-a="ssmulti" data-v="'+i+'"'+(dis?' aria-disabled="true"':'')+'>'+o+'</button>'}).join('')+'</div><p class="small" id="ssmax">Elige hasta '+st.max+'.</p>'+(st.note?'<p class="notice ss-note" role="note">'+st.note+'</p>':'')}
  return '<label class="sr" for="ssin">'+esc(x.q)+'</label><textarea id="ssin" data-in="ssin" placeholder="'+esc(x.ph||'')+'" style="min-height:96px">'+esc(v||'')+'</textarea>'+(x.fmt?'<p class="small">Puedes usar: «'+x.fmt+'»</p>':'')}
function vSes(s){var T=s.test,r=sesRun(s);if(!r)return vHoy(s);var def=sesDef(r.n),sc=sesScreens(r);if(r.i>=sc.length)r.i=sc.length-1;var cur=sc[r.i],body,dk;
  var qn=def.steps.filter(function(st){return !(st.kind==='branch'&&(!sesPathOf(r)||sesPathOf(r)==='ninguno'))}).length, qi=0;
  if(r.low){body='<div class="eres reply" role="status"><img src="'+IMG.orb+'" alt=""><p id="pq" tabindex="-1">'+SES_LOW+'</p></div>';
    dk='<button class="btn" data-a="ssstop">Parar por hoy</button><button class="btn quiet" data-a="sslowback">Seguir igual</button>'}
  else if(cur==='end'){var tk=def.take(r);
    body='<p class="lbl" style="color:var(--forest)">Sesión '+r.n+' de 7 · '+def.title+'</p><h2 id="pq" tabindex="-1">Te llevas</h2><div class="card recall ss-take">'+tk.map(function(t){return (t[0]?'<p class="small"><b style="color:var(--forest)">'+esc(t[0])+'</b></p>':'')+'<p class="q">'+esc(t[1])+'</p>'}).join('')+'</div>'+
      '<p class="small" style="margin-bottom:-8px"><b>Próxima sesión</b></p><p class="ss-next">'+def.next+'</p>'+
      (r.n===7?sesKit(s,r):'');
    dk='<button class="btn" data-a="ssfinish">Terminar la sesión '+r.n+'</button>'+(r.n===7?'<button class="btn sec" data-a="sskit" aria-expanded="'+!!T.kit+'">'+(T.kit?'Ocultar mi kit':'Ver mi kit')+'</button>':'')}
  else{var kind=cur.slice(0,1),id=cur.slice(2),st=sesStep(def,id),x=sesVar(r,st);
    def.steps.forEach(function(z,j){if(z.id===id)qi=j});
    if(kind==='q'){var first=r.i===0,quote=sesQuote(s,r,st);
      body=(first?'<p class="ss-purpose">'+def.purpose+'</p>':'<p class="lbl" style="color:var(--forest)">Sesión '+r.n+' de 7 · '+def.title+'</p>')+
        '<h2 id="pq" tabindex="-1">'+esc(x.q)+'</h2>'+(quote?'<p class="ss-quote">En la sesión 4 escribiste: «'+esc(quote)+'»</p>':'')+sesControls(r,st)+
        (st.kind==='branch'?'<button class="ss-link" data-a="sschange">Cambiar camino · '+esc(SES_PATHS[sesPathOf(r)]||'')+'</button>':'')+
        '<button class="ss-link" data-a="sslow">Hoy no puedo</button>';
      dk='<button class="btn" data-a="ssnext"'+(sesAnswered(r,st)?'':' disabled')+'>Seguir</button><button class="btn quiet" data-a="ssskip">Saltar</button>'}
    else{var rep=r.rep[id];
      body='<p class="lbl" style="color:var(--forest)">Sesión '+r.n+' de 7 · '+def.title+'</p><p class="ss-ans"><span class="small">Tu respuesta</span><br>«'+esc(sesAnsText(r,st))+'»</p>'+
        '<div class="eres reply" role="status"><img src="'+IMG.orb+'" alt=""><p id="pq" tabindex="-1">'+esc(rep.text)+'</p></div>'+
        '<button class="ss-link" data-a="sscorrect">No quise decir eso</button>';
      dk='<button class="btn" data-a="ssnext">'+(sc[r.i+1]==='end'?'Ver lo que te llevas':'Seguir')+'</button>'}}
  var plan=sesPlan(r),total=plan.length,pi=r.low?plan.indexOf(cur):plan.indexOf(cur);if(pi<0)pi=Math.min(r.i,total-1);var segs='';for(var i=0;i<total;i++)segs+='<i class="'+(i<pi?'on':i===pi?'cur':'')+'"></i>';
  var meta='<div class="pr-meta"><img src="'+IMG.orb+'" alt=""><b>Elara</b><span class="pr-step">Paso '+(pi+1)+' de '+total+'</span></div><div class="pr-steps" role="img" aria-label="Paso '+(pi+1)+' de '+total+'">'+segs+'</div>';
  return '<div class="pr ses">'+sesScene(s,r,sc)+'<section class="pr-panel" aria-labelledby="pq"><span class="pr-gap" aria-hidden="true"></span>'+meta+'<div class="pr-body">'+body+'</div>'+dock(dk)+'</section></div>'}
function sesAnsText(r,st){var v=r.a[st.id];if(st.kind==='choose')return st.opts[v];if(st.kind==='camino')return st.labels[v];if(st.kind==='multi')return v.map(function(i){return st.opts[i]}).join(', ');return v}
function sesKit(s,r){if(!s.test.kit)return '';var A=function(n,id){var a=s.test.ans[n];return a&&a[id]};
  var items=[['Tu pregunta (sesión 1)',A(1,'pregunta')],['Tu condición (sesión 3)',A(3,'condicion')],['Tu frase (sesión 4)',A(4,'linea')],['Tu primera frase (sesión 6)',A(6,'frase')]].filter(function(x){return x[1]&&String(x[1]).trim()});
  return '<section class="card recall ss-kit" aria-labelledby="kitH"><p class="small"><b id="kitH" style="color:var(--forest)">Mi kit</b> · solo tú lo ves</p>'+(items.length?items.map(function(x){return'<p class="small" style="margin-top:6px">'+x[0]+'</p><p class="q">«'+esc(x[1])+'»</p>'}).join(''):'<p class="q">Todavía no hay piezas: lo que escribas en las sesiones aparecerá aquí.</p>')+'</section>'}
function vSesDone(s){var T=s.test,k=T.done,def=sesDef(Math.max(1,k)),r=T.ans['r'+k]||{n:k,a:T.ans[k]||{},basePath:T.path};var tk=k?def.take(r):[];
  return '<div class="sub"><button class="iconbtn round" data-a="home" aria-label="Volver a Hoy">'+ic('back',22)+'</button><h1>Sesión '+k+' · '+def.title+'</h1></div>'+
   '<div class="pr-body"><p class="doneline">'+ic('check',20)+'Sesión '+k+' hecha</p><h2 id="pq" tabindex="-1" style="font-size:var(--t22)">Te llevas</h2><div class="card recall ss-take">'+tk.map(function(t){return (t[0]?'<p class="small"><b style="color:var(--forest)">'+esc(t[0])+'</b></p>':'')+'<p class="q">'+esc(t[1])+'</p>'}).join('')+'</div>'+
   (k<7?'<p class="notice">La sesión '+(k+1)+' se abre mañana, '+tomorrowName(s)+'. '+def.next+'</p>':'<p class="notice">Terminaste las siete sesiones de prueba.</p>')+'</div>'+dock('<button class="btn sec" data-a="home">Volver a Hoy</button>')}

/* ---- actions ---- */
App.prototype.sesOpen=function(n,pv){var s=this.s,T=s.test;
  if(pv){T.pv=n;T.pvDraft=sesNewRun(s,n,true)}
  else{T.pv=null;if(!T.drafts[T.cur])T.drafts[T.cur]=sesNewRun(s,T.cur,false);var r=T.drafts[T.cur];if(T.gap){r.i=0;r.low=false;T.gap=false}}
  this.go({view:{k:'ses'},sheet:null,land:false},'#pq')};
App.prototype.sesLog=function(r,st){var rep=r.rep[st.id],x=sesVar(r,st);this.s.test.last={n:r.n,step:st.id,q:x.q,rule:rep.rule,scripted:rep.scripted,text:rep.text,guidance:st.guidance}};
App.prototype.sesAct=function(a,d){var s=this.s,T=s.test,r=sesRun(s),me=this;if(!r&&a!=='ssopen')return;
  var def=r?sesDef(r.n):null,sc=r?sesScreens(r):null,cur=sc?sc[r.i]:null,st=cur&&cur.length>2?sesStep(def,cur.slice(2)):null;
  switch(a){
  case'sspick':if(!st)break;r.a[st.id]=st.kind==='camino'?d.v:+d.v;r.sk=r.sk.filter(function(x){return x!==st.id});
    if(st.kind==='camino'){/* changing path drops the old branch answer so the right question shows */var br=def.steps.find(function(z){return z.kind==='branch'});if(br&&r.lastPath!==d.v){if(r.lastPath)delete r.a[br.id];delete r.rep[br.id];r.lastPath=d.v}}
    this.go({},'[data-a="sspick"][data-v="'+d.v+'"]');break;
  case'ssmulti':if(!st)break;var cur2=r.a[st.id]||[],i=+d.v,k=cur2.indexOf(i);if(k>-1)cur2.splice(k,1);else if(cur2.length<st.max)cur2.push(i);else{this.say('Puedes elegir hasta '+st.max+'. Quita una para cambiarla.');break}r.a[st.id]=cur2;this.go({},'[data-a="ssmulti"][data-v="'+d.v+'"]');break;
  case'ssnext':if(cur==='end')break;
    if(cur[0]==='q'){if(!sesAnswered(r,st))break;r.sk=r.sk.filter(function(x){return x!==st.id});
      if(!st.quiet){r.rep[st.id]=sesReply(r,st);this.sesLog(r,st)}else{delete r.rep[st.id];T.last={n:r.n,step:st.id,q:st.q,rule:'Paso de un toque: sin respuesta de Elara (quiet)',scripted:true,text:'',guidance:st.guidance}}
      if(st.kind==='camino'&&!r.pv)T.path=r.a.camino;
      if(st.path&&!r.pv){var pp=st.path[r.a[st.id]];if(pp&&(r.n===1||!T.path))T.path=pp}
      var sc2=sesScreens(r);r.i=sc2.indexOf(st.quiet?nextQ(sc2,st.id):'r:'+st.id);if(r.i<0)r.i=sc2.length-1}
    else{r.i=Math.min(sesScreens(r).length-1,r.i+1)}
    this.go({},'#pq');break;
  case'ssskip':if(!st)break;if(r.sk.indexOf(st.id)<0)r.sk.push(st.id);delete r.rep[st.id];delete r.a[st.id];if(st.kind==='camino'){delete r.a.camino}
    T.last={n:r.n,step:st.id,q:sesVar(r,st).q,rule:'Saltado: no se genera respuesta; la sesión sigue',scripted:true,text:'',guidance:st.guidance};
    var sc3=sesScreens(r);r.i=sc3.indexOf(nextQ(sc3,st.id));if(r.i<0)r.i=sc3.length-1;this.go({},'#pq');break;
  case'ssback':this.sesBack();break;
  case'sscorrect':var id=cur.slice(2);r.corr[id]=true;delete r.rep[id];if(r.scenCorr&&typeof r.a[id]==='string'){r.a[id]=r.scenCorr;r.scenCorr=null}r.i=sesScreens(r).indexOf('q:'+id);var st2=sesStep(def,id);this.go({},st2.kind==='reflect'||st2.kind==='branch'?'#ssin':'#pq');break;
  case'sschange':var cs=sesScreens(r),ci=cs.indexOf('q:camino');if(ci>-1){r.i=ci;this.go({},'[data-a="sspick"][aria-checked="true"],#pq')}break;
  case'sslow':r.low=true;T.last={n:r.n,step:'(capacidad baja)',q:'Hoy no puedo',rule:'Capacidad baja: se acepta, se ofrece parar, sin tarea',scripted:true,text:SES_LOW,guidance:'Aceptar. Ofrecer «Parar por hoy» y decir que no se pierde nada. Sin tarea.'};this.go({},'#pq');break;
  case'sslowback':r.low=false;this.go({},'#pq');break;
  case'ssstop':case'ssleave':r.low=false;this.sesLeave();break;
  case'sskit':T.kit=!T.kit;this.go({},'[data-a="sskit"]');if(T.kit){var kt=this.root.querySelector('.ss-kit');if(kt&&kt.scrollIntoView)kt.scrollIntoView({block:'nearest'})}break;
  case'ssfinish':
    if(r.pv){T.pv=null;T.pvDraft=null;T.lastPreview=r.n;s.hist=[];this.go({view:null,tab:'hoy'},null,{replace:true});break}
    T.ans[r.n]=JSON.parse(JSON.stringify(r.a));T.ans['r'+r.n]={n:r.n,a:T.ans[r.n],basePath:r.basePath,sk:r.sk.slice()};T.done=r.n;delete T.drafts[r.n];T.cur=Math.min(7,r.n+1);T.justDone=true;
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
App.prototype.sesInput=function(v){var s=this.s,r=sesRun(s);if(!r)return;var sc=sesScreens(r),cur=sc[r.i];if(!cur||cur[0]!=='q')return;var id=cur.slice(2);r.a[id]=v;var b=this.root.querySelector('[data-a="ssnext"]');if(b)b.disabled=!v.trim()};
/* reviewer hooks (outside the phone) */
App.prototype.sesScenario=function(n,key){var s=this.s,T=s.test,sc=(SES_SCEN[n]||[]).find(function(x){return x[0]===key});if(!sc)return;
  T.pv=n;T.pvDeps={};var extra=sc[3]||{};if(extra.hasOwnProperty('dep4'))T.pvDeps[4]=extra.dep4;
  var a=JSON.parse(JSON.stringify(sc[2]));T.pvPath=a.camino||undefined;var r=sesNewRun(s,n,true);if(a.camino)r.basePath=a.camino;r.a=a;r.lastPath=a.camino;r.i=0;r.scenCorr=extra.corr||null;T.pvDraft=r;T.kit=false;
  this.go({view:{k:'ses'},sheet:null,land:false},'#pq')};
App.prototype.sesPreview=function(n){var T=this.s.test;T.pvDeps={};T.pvPath=undefined;T.kit=false;this.sesOpen(n,true)};
/* reviewer: complete sessions 1..n-1 with each session's first example, so session n opens from Hoy with real earlier answers */
App.prototype.sesAdvance=function(n){var s=this.s,T=sesFresh();s.test=T;
  for(var k=1;k<n;k++){var sc=SES_SCEN[k][0],a=JSON.parse(JSON.stringify(sc[2]));if(a.camino)T.path=a.camino;var st0=sesDef(k).steps[0];if(st0.path){var pp=st0.path[a[st0.id]];if(pp&&(k===1||!T.path))T.path=pp}
    T.ans[k]=a;T.ans['r'+k]={n:k,a:a,basePath:T.path,sk:[]}}
  T.done=n-1;T.cur=n;s.done[2]=T.done;s.hist=[];this.go({view:null,tab:'hoy',sheet:null,kb:false},null,{replace:true})};
App.prototype.sesNextDay=function(){var T=this.s.test;T.justDone=false;var d=D(this.s.date);d.setDate(d.getDate()+1);this.s.date=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');this.s.hist=[];this.go({view:null,tab:'hoy'},null,{replace:true})};
App.prototype.sesGap=function(){var T=this.s.test;T.justDone=false;T.gap=true;var d=D(this.s.date);d.setDate(d.getDate()+9);this.s.date=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');this.s.hist=[];this.go({view:null,tab:'hoy'},null,{replace:true})};

/*SES-END*/
window.Elara={SES:SES,SES_SCEN:SES_SCEN,SES_PATHS:SES_PATHS,sesFresh:sesFresh,sesScreens:sesScreens,sesRun:sesRun,CIRCLES:CIRCLES,ccSuggested:ccSuggested,cxPreset:cxPreset,cxPublic:cxPublic,CXP:CXP,cxStarter:cxStarter,cxDeck:cxDeck,DEV:DEV,App:App,fresh:fresh,PRESETS:PRESETS,entry:entry,daysCompleted:daysCompleted,placesWalked:placesWalked,totalPlaces:totalPlaces,totalDaysArea:totalDaysArea};
})();
