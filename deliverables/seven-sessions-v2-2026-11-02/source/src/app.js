/* Elara final pass: one example account, four tabs, working flows.
   Every count on screen is derived from CONTENT and the account's completed days. */
(function(){
'use strict';
var IMG = window.ELARA_IMG || {};

/* ---------- content ---------- */
var WEEKS = 5, DAYS_PER_WEEK = 7;
var AREAS = [
  {id:'as', n:'Asia', t:'Claridad financiera', col:'#C2603E', open:true},
  {id:'na', n:'Norteamérica', t:'Encontrar propósito', col:'#3A6FC4'},
  {id:'eu', n:'Europa', t:'Confianza en ti', col:'#B4477F'},
  {id:'sa', n:'Sudamérica', t:'Amor y límites', col:'#3E8E6A'},
  {id:'af', n:'África', t:'Reinicio de energía', col:'#C99A2E'},
  {id:'oc', n:'Oceanía', t:'Ritmo diario', col:'#7A5BB8'}
];
// Money area, in week order (from the decided Atlas data). x,y are positions on the 340x372 globe render.
var PLACES = [
  {id:'lh', w:1, n:'Bahía de Lan Hạ', cty:'Vietnam', x:153, y:157.1, b:'Niebla, islas de caliza y un primer vistazo tranquilo a tu dinero.'},
  {id:'wz', w:2, n:'Wuzhen', cty:'China', x:184.6, y:131.9, b:'Canales y puentes: lo que ya está acordado frente a lo que esperas.'},
  {id:'yy', w:3, n:'Terrazas de Yuanyang', cty:'China', x:143.1, y:150.7, b:'Agua por niveles: ordenar lo que cubres primero y lo que va después.'},
  {id:'ky', w:4, n:'Arashiyama, Kioto', cty:'Japón', x:215.4, y:118.7, b:'Un bosque quieto para decidir qué te basta este mes.'},
  {id:'zj', w:5, n:'Zhangjiajie', cty:'China', x:161.9, y:135.4, b:'Pilares entre la niebla: ver lejos sin perder el paso de hoy.'}
];
var KEEPS = ['farol de papel','puente de piedra','barca de Wuzhen','taza de té','sombrilla de papel','carpa koi','rama de sauce'];
/* Week 2, day 3 = Money Clarity v4 concise, day 10 (owner decision M1). Spanish copied from the app repo
   apps/mobile/src/i18n/locales/es/pathCopy/money.ts (week 2: weekTitle «Una opción, una nota, un paso», day "Revisa antes de comprometerte").
   BORRADOR: still pending Alejandra. See CURRICULUM-CHECK.md. */
var WEEK2 = {theme:'Semana 2: una forma de comparar una opción, una nota o un mensaje útil, y un siguiente paso.', title:'Una opción, una nota, un paso'};
var DUR = 'Unos 4 minutos'; // source: day 10 config.minutes = 4; still not timed with testers.
var DAY10 = {title:'Revisa antes de comprometerte', skip:'Saltar por ahora',
  a:{q:'¿Qué harías con la oferta A?', body:'“Ganaste 120 haciendo tareas. Deposita 20 para retirarlo.”', opts:['Parar','Preguntar','Seguir adelante','No estoy segura'],
     reply:'No deposites dinero para liberar supuestas ganancias. Es una señal de estafa: las ganancias que ves en la pantalla no son dinero que puedas usar.'},
  b:{q:'¿Qué harías con la oferta B?', body:'Una tienda dice el horario y el pago, pero no qué día paga.', opts:['Parar','Preguntar qué día paga','Seguir adelante','No estoy segura'],
     reply:'Si falta el día de pago, hay que revisarlo; eso no prueba un fraude. Puedes preguntar antes de decidir, si contactarlos es seguro para ti. Eres libre de decir que no.'},
  teach:{t:'Revisa quién está detrás de una oferta y si hay costos o condiciones.', body:'Pagar para asegurar un trabajo prometido es una señal de alerta. Una promesa por escrito deja constancia de lo que se dijo; no prueba que sea de confianza. Usa datos de contacto que encuentres por tu cuenta, no los que vienen en una oferta que no pediste.'},
  check:{t:'Para guardar', fields:['Señal de alerta o dato que falta:','Lo reviso con:','Parar / preguntar / pensarlo después de revisar:']}};
var MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var MON3 = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
var WD = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
var WORKSHOPS = [
  {id:'w1', t:'Dinero sin espiral', d:'2026-10-22', h:'19:00', min:60, host:'Alejandra Ramírez', access:'beta', price:'Gratis',
   s:'Cómo mirar tus cuentas sin que el miedo decida por ti.'},
  {id:'w2', t:'Encontrar tu suficiente', d:'2026-10-29', h:'19:00', min:60, host:'Alejandra Ramírez', access:'beta', price:'Gratis',
   s:'Decidir cuánto es suficiente para ti este mes, con tus números.'},
  {id:'w3', t:'Conversaciones más valientes', d:'2026-11-12', h:'19:00', min:60, host:'María', access:'paid', price:'29,99 USD',
   s:'Practicar cómo decir que no, o pedir, cuando hay dinero de por medio.'}
];
var AUDIOS = [
  {id:'a1', t:'Páginas de la noche', dur:99, img:'au1'},
  {id:'a2', t:'Luces bajas, hombros abajo', dur:59, img:'au2'},
  {id:'a3', t:'Una pausa antes de abrir el banco', dur:65, img:'au3'}
];
var GUIDE = {t:DAY10.teach.t, min:1, pts:DAY10.teach.body.split(/(?<=\.)\s+/)}; // the day's own teaching card; a reading time is not in the source
var MEMBERS = {
  marina:{n:'Marina', img:'marina', since:'septiembre', circles:['Trabajo y propósito','Ritmo diario']},
  marisol:{n:'Marisol', img:'marisol', since:'agosto', circles:['Claridad financiera']},
  rosa:{n:'Rosa', img:'rosa', since:'octubre', circles:['Trabajo y propósito','Claridad financiera']}
};
var MY_CIRCLES = ['Claridad financiera','Trabajo y propósito']; // kept for reference; the live list is myNames(s)
function basePosts(){return [
  {id:'p1', by:'marina', c:'Trabajo y propósito', ago:'hace 35 min', t:'¿Alguien más sigue contestando mensajes del trabajo a las 10 de la noche?', b:'Cierro la compu a las 7 y a las 10 sigo ahí con el cel. No sé cómo cortar.',
   r:[{by:'rosa', t:'Yo dejé el correo fuera del celular. La primera semana fue rara, después fue alivio.'}]},
  {id:'p2', by:'marisol', c:'Claridad financiera', ago:'hace 2 h', t:'¿Cómo digo que no sin sentirme mala hermana?', b:'Mi hermana vuelve a pedirme dinero, pero este mes necesito cubrir mi renta. Ya le presté en agosto y todavía no me ha pagado.',
   r:[{by:'rosa', t:'A mí me ayudó decir el monto que sí puedo, en vez de un no seco.'},{by:'marina', t:'Pagar tu renta primero no te hace mala hermana.'}],
   photo:{src:IMG['ph-landscape'],w:960,h:720,alt:'Foto de ejemplo: colinas verdes y un sol pequeño en un paisaje sintético.'}},
  {id:'p3', by:'rosa', c:'Trabajo y propósito', ago:'hace 5 h', t:'Mi jefa me escribe los domingos.', b:'Esta vez le contesté el lunes y no pasó nada. Todavía no lo creo.', r:[],
   photo:{src:IMG['ph-portrait'],w:720,h:960,alt:''}}
,
  {id:'p4', by:'marina', c:'Claridad financiera', ago:'hace 1 día', t:'¿Cómo hablan de dinero con su pareja sin pelear?', b:'Llevamos meses evitando el tema y ya se siente en la casa. No sé por dónde empezar.',
   r:[{by:'rosa', t:'Nosotros empezamos con una sola pregunta: ¿qué te preocupa más este mes?'},{by:'marisol', t:'A mí me sirvió elegir un día y una hora, y no hablarlo en la cena.'}]},
  {id:'p5', by:'rosa', c:'Trabajo y propósito', ago:'hace 1 día', t:'Me ofrecieron un puesto nuevo y no sé si aceptar.', b:'Gano un poco más, pero perdería el horario flexible que tanto me costó conseguir.',
   r:[{by:'marina', t:'Yo escribiría qué no negociarías, antes de mirar el sueldo.'},{by:'marisol', t:'¿Puedes pedir probar el horario antes de decidir?'},{by:'marina', t:'Cuéntanos qué decides.'}]},
  {id:'p6', by:'marisol', c:'Claridad financiera', ago:'hace 2 días', t:'Primera vez que armo un presupuesto: ¿qué categorías usan?', b:'Tengo miedo de que me salga algo que no quiero ver.', r:[{by:'rosa', t:'Empieza con tres: lo fijo, lo variable y lo que quieres guardar.'}]},
  {id:'p7', by:'marina', c:'Trabajo y propósito', ago:'hace 3 días', t:'¿Alguien volvió a trabajar después de cuidar a un familiar durante un tiempo largo y cómo se sintió con el cambio?', b:'Estoy a punto de volver y siento que ya no sé hacer mi trabajo.',
   r:[{by:'rosa', t:'Me pasó. Las primeras dos semanas son las peores.'},{by:'marisol', t:'Pide que te vuelvan a presentar los procesos, no es debilidad.'},{by:'rosa', t:'Y escribe lo que sí recuerdas.'},{by:'marina', t:'Gracias, lo voy a hacer.'}]},
  {id:'p8', by:'rosa', c:'Claridad financiera', ago:'hace 4 días', t:'Hoy pagué una deuda pequeña.', b:'Me tomó cuatro minutos y llevaba meses sin hacerlo.', r:[]}];}
function baseThreads(){return [
  {with:'rosa', unread:true, m:[{me:false,t:'¿Cómo te fue con lo del lunes?'}]},
  {with:'marisol', unread:true, m:[{me:true,t:'Gracias por contar lo de tu hermana. Me pasa igual.'},{me:false,t:'Gracias a ti. Me sentí menos sola.'}]}
];}

/* ---------- account presets (one consistent example account: Lucía, Money, Asia) ---------- */
var PRESETS = {
  curso:{label:'Día en curso', date:'2026-10-27', hour:21, done:{1:7,2:2}, draft:null},
  hecho:{label:'Día completado', date:'2026-10-27', hour:21, done:{1:7,2:3}, draft:null, answer:{a:0,b:1,chk:['Piden depositar antes de cobrar','Con mi hermana','Parar'],skipped:[]}},
  perdido:{label:'Día sin hacer', date:'2026-10-29', hour:9, done:{1:7,2:2}, draft:null},
  semana:{label:'Semana completada', date:'2026-10-31', hour:20, done:{1:7,2:7}, draft:null, answer:{a:0,b:1,chk:['Piden depositar antes de cobrar','Con mi hermana','Parar'],skipped:[]}}
};
function fresh(key){
  var p = PRESETS[key];
  return {preset:key, date:p.date, hour:p.hour, done:JSON.parse(JSON.stringify(p.done)), draft:p.draft, answer:p.answer||null,
    tab:'hoy', view:null, sheet:null, toast:null, hv:'n', atlas:{open:false, sel:null, list:false},
    ex:{filter:'todo', q:'', saved:[], reserved:[], opp:{c:'',cat:'',h:'',a:''}, oppOpen:false, oppInfo:false, oppFrom:null, todoY:0}, audio:{id:null, st:'idle', t:0},
    posts:basePosts(), threads:baseThreads(), blocked:[], reported:[], ctab:'mis', upSim:'ok', photoReported:[], viewer:null, cfilter:'todos', dfilter:'todos', joined:['money','work'], cint:[], ccHid:false, cxStyle:'B', cx:cxFresh(), inbox:'conv', dmStarter:false, k:1, w:390, taps:false, kb:false, navmode:'gesture', land:false, copy:'aprobado', rule:'A', hist:[], nomo:false, dev:'ios15'};
}

/* ---------- derived values ---------- */
function curWeek(s){for(var w=1;w<=WEEKS;w++){if((s.done[w]||0)<DAYS_PER_WEEK)return w}return WEEKS}
function weekDone(s,w){return (s.done[w]||0)>=DAYS_PER_WEEK}
function curDay(s){var w=curWeek(s);return Math.min(DAYS_PER_WEEK,(s.done[w]||0)+1)}
// a day completed today unlocks the next one at local midnight (DAY_UNLOCK next-day@00:00)
function todayDone(s){return s.preset==='hecho'||s.preset==='semana'||s.justDone}
function shownDay(s){var w=curWeek(s),d=s.done[w]||0;return todayDone(s)?Math.max(1,d):d+1}
function shownWeek(s){if(s.preset==='semana')return 2;return curWeek(s)}
function daysCompleted(s){var n=0;for(var w in s.done)n+=s.done[w];return n}
function placeState(s,p){var d=s.done[p.w]||0;if(d>=DAYS_PER_WEEK)return'done';if(p.w!==curWeek(s))return'lock';
  // the week after a week finished today opens at midnight
  return(d===0&&s.preset==='semana')?'next':'cur'}
function placesWalked(s){return PLACES.filter(function(p){return (s.done[p.w]||0)>0}).length}
function totalPlaces(){return AREAS.length*WEEKS}
function totalDaysArea(){return WEEKS*DAYS_PER_WEEK}
function D(iso){var a=iso.split('-');return new Date(+a[0],+a[1]-1,+a[2])}
function fmtDate(iso){var d=D(iso);return WD[d.getDay()].charAt(0).toUpperCase()+WD[d.getDay()].slice(1)+', '+d.getDate()+' de '+MONTHS[d.getMonth()]}
function greet(s){return s.hour<12?'Buenos días':s.hour<19?'Buenas tardes':'Buenas noches'}
function wsStatus(s,w){var a=D(w.d),b=D(s.date);if(a<b)return'past';return'next'}
function tomorrowName(s){var d=D(s.date);return WD[(d.getDay()+1)%7]}
function mmss(n){n=Math.max(0,Math.round(n));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}

/* what Hoy's main button and the Pregunta tab both open */
function entry(s){
  if(s.test)return sesEntry(s);
  if(s.preset==='semana')return{kind:'week', label:'Ver tu semana en Wuzhen'};
  if(todayDone(s))return{kind:'review', label:'Ver lo que respondiste'};
  var d=shownDay(s);
  if(s.draft)return{kind:'practice', label:'Seguir con el día '+d, hint:'Vas en el paso '+(s.draft.step+1)+' de '+NSTEPS+'. Guardamos lo que elegiste y escribiste.'};
  return{kind:'practice', label:'Empezar el día '+d};
}

/* ---------- icons ---------- */
function statusBar(P){
  var bat=P==='ios'?'<svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.4" fill="currentColor"/><path d="M25 4.5v4c.9-.3 1.5-1.2 1.5-2s-.6-1.7-1.5-2z" fill="currentColor" opacity=".45"/></svg>':'<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect x="1" y="1" width="14" height="10" rx="2" fill="currentColor"/><rect x="15.5" y="4" width="1.8" height="4" rx=".8" fill="currentColor"/></svg>';
  var wifi='<svg width="'+(P==='ios'?17:15)+'" height="12" viewBox="0 0 17 12" aria-hidden="true"><path d="M8.5 11.2 6 8.6a3.6 3.6 0 0 1 5 0zM3.6 6.2a7 7 0 0 1 9.8 0M.8 3.4a11 11 0 0 1 15.4 0" fill="'+(P==='and'?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var sig=P==='ios'?'<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx=".8" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx=".8" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx=".8" fill="currentColor"/></svg>':'<svg width="13" height="12" viewBox="0 0 13 12" aria-hidden="true"><path d="M13 0v12H0z" fill="currentColor"/></svg>';
  return '<div class="sbar" aria-hidden="true"><span class="time">9:41</span>'+(P==='ios'?(CURD.island?'<i class="island"></i>':''):'<i class="punch"></i>')+'<span class="sicons">'+(P==='ios'?sig+wifi+bat:wifi+sig+bat)+'</span></div>';
}
function ic(n,sz,col){sz=sz||22;col=col||'currentColor';var p={
  home:'<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
  globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.5 3.8 5.4 3.8 8.5s-1.2 6-3.8 8.5c-2.6-2.5-3.8-5.4-3.8-8.5S9.4 6 12 3.5z"/>',
  compass:'<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  people:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9.5" r="2.5"/><path d="M15.5 14.2c2.4-.3 4.4 1.2 5 4.3"/>',
  chat:'<path d="M5 18.5 4 21l3.4-1.6A8.5 8.5 0 1 0 5 18.5z"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  mark:'<path d="M7 4h10v16l-5-3.6L7 20z"/>',
  markf:'<path d="M7 4h10v16l-5-3.6L7 20z" fill="'+col+'"/>',
  play:'<path d="M8.5 5.5v13l10-6.5z" fill="'+col+'" stroke="none"/>',
  pause:'<path d="M8 5.5h3v13H8zM13.5 5.5h3v13h-3z" fill="'+col+'" stroke="none"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  up:'<path d="M5 15l7-7 7 7"/>',
  pin:'<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  ext:'<path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  chev:'<path d="m9 6 6 6-6 6"/>',
  more:'<circle cx="5.5" cy="12" r="1.6" fill="'+col+'"/><circle cx="12" cy="12" r="1.6" fill="'+col+'"/><circle cx="18.5" cy="12" r="1.6" fill="'+col+'"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  image:'<rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m5 17 4.5-4.5 3 3 2.5-2.5L19 16"/>',
  heart:'<path d="M12 19s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 7.6a3.8 3.8 0 0 1 7 2.2C19 14.7 12 19 12 19z"/>',
  list:'<path d="M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01"/>',
  send:'<path d="M4 12 20 4l-5 16-3.5-6.5z"/>',
  lock:'<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>'
 }[n];if(n==='back'&&window.__plat==='and')p='<path d="M19 12H5M11 6l-6 6 6 6"/>';return '<svg aria-hidden="true" width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="'+col+'" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* ---------- views ---------- */
function vHoy(s){
  var w=shownWeek(s), d=shownDay(s), e=entry(s), place=PLACES[w-1], done=s.done[w]||0;
  var vib=s.hv==='n';
  var h='<header class="top"><div><p class="date">'+fmtDate(s.date)+'</p><h1>'+greet(s)+', Lucía</h1></div>'+
    '<button class="avatarL" data-a="profile" aria-label="Tu perfil">L</button></header>';
  if(vib)h=vibHeader(s);
  var stamp='<span class="stamp warm" aria-hidden="true"><svg width="62" height="76" viewBox="0 0 62 76"><defs><mask id="pf"><rect width="62" height="76" fill="#fff"/>'+perf()+'</mask></defs><rect width="62" height="76" fill="#FBF6EC" mask="url(#pf)"/><rect x="5" y="5" width="52" height="52" fill="#DCE6E4"/><text x="31" y="68" text-anchor="middle" style="font-family:var(--sans)" font-size="8" font-weight="700" letter-spacing="1.4" fill="#2C4A3A">WUZHEN</text></svg><img src="'+IMG.d3+'" alt=""></span>';
  var card;
  if(s.preset==='semana'){
    card='<div class="warm" style="transform:rotate(-.4deg)"><article class="postcard torn-a" aria-labelledby="hq"><span class="grain"></span>'+
      '<img class="photo" src="'+IMG.wuzhen+'" alt="Canal de Wuzhen al anochecer, con casas de madera reflejadas en el agua">'+stamp+
      '<div class="pc-body"><p class="pc-place">Wuzhen, China · Semana 2 de 5</p><h2 id="hq" class="pc-q">Terminaste tu semana en Wuzhen.</h2>'+
      '<p class="meta">La semana 3, Terrazas de Yuanyang, se abre mañana, '+tomorrowName(s)+'.</p>'+
      '</div></article></div>';
  } else if(todayDone(s)){
    card='<div class="warm" style="transform:rotate(-.4deg)"><article class="postcard torn-a" aria-labelledby="hq"><span class="grain"></span>'+
      '<img class="photo" src="'+IMG.wuzhen+'" alt="Canal de Wuzhen al anochecer, con casas de madera reflejadas en el agua">'+stamp+
      '<div class="pc-body"><p class="pc-place">Wuzhen, China · Semana 2 · Día '+d+'</p>'+
      '<p class="doneline">'+ic('check',20)+'Día '+d+' hecho</p><h2 id="hq" class="pc-q">'+DAY10.title+'</h2>'+
      '<p class="meta">El día '+(d+1)+' se abre mañana, '+tomorrowName(s)+'.</p>'+
      '</div></article></div>';
  } else {
    card='<div class="warm" style="transform:rotate(-.4deg)"><article class="postcard torn-a" aria-labelledby="hq"><span class="grain"></span>'+
      '<img class="photo" src="'+IMG.wuzhen+'" alt="Canal de Wuzhen al anochecer, con casas de madera reflejadas en el agua">'+stamp+
      '<div class="pc-body"><p class="pc-place">Wuzhen, China · Semana 2 · Día '+d+'</p><h2 id="hq" class="pc-q">'+DAY10.title+'</h2>'+
      (s.preset==='perdido'?'<p class="meta">Tu día '+d+' te espera. No se pierde nada.</p>':'<p class="meta">'+DUR+'.</p>')+
      '</div></article></div>';
  }
  var cells='';for(var i=1;i<=7;i++){var st=i<=done?'done':(i===done+1&&!todayDone(s)&&s.preset!=='semana')?'today':'fut';
    var lab=st==='today'?'Hoy':String(i), al='Día '+i+(st==='done'?': hecho, '+KEEPS[i-1]:st==='today'?': hoy':': todavía no');
    cells+='<li class="day '+st+'" aria-label="'+al+'"><span class="disc">'+(st==='done'?'<img src="'+IMG['d'+i]+'" alt="">':st==='today'?ring():'')+'</span><span aria-hidden="true">'+lab+'</span></li>'}
  if(s.test)card=sesCard(s,stamp);
  var recallDay=todayDone(s)&&s.answer?d:d-1, recall;
  if(todayDone(s)&&s.answer&&s.preset!=='semana')recall='<div class="card recall"><p class="small"><b style="color:var(--forest)">Hoy dijiste · Día '+d+'</b></p><p class="q">'+ansLine(s.answer)+'</p></div>';
  else if(s.preset==='semana')recall='<div class="card recall"><p class="small"><b style="color:var(--forest)">Esta semana dijiste · Día 3</b></p><p class="q">'+ansLine(s.answer)+'</p></div>';
  else recall='<div class="card recall"><p class="small"><b style="color:var(--forest)">'+(s.preset==='perdido'?'El lunes dijiste':'Ayer dijiste')+' · Día 2</b></p><p class="q">«Pago tarde porque no quiero ver el saldo.»</p></div>';
  if(vib)cells=vibWeek(s,done);
  if(vib)recall=vibRecall(s,s.answer?3:Math.max(0,s.done[w]||0));
  if(s.test)recall=sesRecall(s);
  var wkSec='<section class="stack" aria-labelledby="hw"><div class="sechead"><h2 id="hw">Tu semana en Wuzhen</h2><span class="n">'+done+' de 7</span></div><ol class="week" style="list-style:none;margin:0;padding:0">'+cells+'</ol><p class="meta" style="color:var(--ink)">'+(s.test?'Siete sesiones de prueba de Claridad financiera.':WEEK2.theme)+'</p></section>';
  var rcSec='<section class="stack" aria-labelledby="hr"><div class="sechead"><h2 id="hr">Para retomar</h2></div>'+recall+'</section>';
  var mid=(vib?hoyGlobe(s):'')+wkSec;   /* approved order: postcard, Atlas preview, week collection, Para retomar */
  return h+'<div class="pad gap18" style="padding-bottom:24px">'+card+mid+rcSec+
    '<section class="stack" aria-labelledby="hp"><div class="sechead"><h2 id="hp">Para hoy</h2></div><div class="rows">'+
      (s.test?'':'<button class="row" data-a="guide"><span><span class="rt">'+GUIDE.t+'</span><span class="rm">Guía · '+GUIDE.min+' min de lectura</span></span><span class="chev">'+ic('chev',20)+'</span></button>')+
      '<button class="row" data-a="mirada"><span><span class="rt">Ver dónde estás</span><span class="rm">Tus seis áreas</span></span><span class="chev">'+ic('chev',20)+'</span></button>'+'</div></section>'+
    '<button class="btn quiet" data-a="oos" data-k="help" style="justify-content:flex-start;padding-left:0">'+ic('heart',18)+'Buscar ayuda ahora</button></div>'+
    dock((e.hint?'<p class="saved-note">'+ic('check',16)+e.hint+'</p>':'')+'<button class="btn'+(e.kind==='review'?' sec':'')+'" data-a="entry">'+e.label+(e.kind==='practice'?' '+ic('chev',18):'')+'</button>');
}
// the one primary action of a screen lives in a bar above the tab bar, so it is never cut off or hidden by scrolling

/* ---- Hoy, art-direction pass. The existing Hoy (s.hv unset) is untouched. Order: greeting, postcard, Atlas preview, week. ---- */
var STAMP_COL=['#C2603E','#3A6FC4','#B4477F','#3E8E6A','#C99A2E','#7A5BB8','#C2603E'];
/* one restrained accent in the header: faint paper-mache clouds, tinted to the time of day the greeting names (no sun, no ribbon) */
function todOf(s){return s.hour<12?'morning':s.hour<19?'afternoon':'evening'}
function tornCloud(x,y,w,h,seed,fill,op){
  var r=seed,rnd=function(){r=(r*9301+49297)%233280;return r/233280},pts=[],n=13,i;
  pts.push([0,h]);
  for(i=0;i<=n;i++){var t=i/n,bump=Math.sin(t*Math.PI*2.6)*.18+Math.sin(t*Math.PI)*.62;pts.push([t*w,h*(1-Math.max(.12,bump))+(rnd()-.5)*h*.10])}
  pts.push([w,h]);for(i=6;i>=1;i--)pts.push([w*i/7,h+(rnd()-.5)*h*.07]);
  var d='M'+pts.map(function(q){return q[0].toFixed(1)+' '+q[1].toFixed(1)}).join('L')+'Z';
  return '<g transform="translate('+x+' '+y+')" opacity="'+op+'"><path d="'+d+'" transform="translate(3 4)" fill="#6C7F78" opacity=".16"/><path d="'+d+'" fill="'+fill+'" stroke="'+fill+'" stroke-width="1.4" stroke-linejoin="round" filter="url(#cgr)"/></g>'}
function skyClouds(s){var t=todOf(s),f=t==='evening'?'#C9C9E0':t==='afternoon'?'#FFF6E4':'#FFFCF6';
  return '<svg class="skyc" width="100%" height="120" viewBox="0 0 390 120" preserveAspectRatio="xMidYMin slice"><defs><filter id="cgr" x="-5%" y="-5%" width="110%" height="115%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .4  0 0 0 0 .45  0 0 0 0 .42  0 0 0 .55 -.18" result="g"/><feComposite in="g" in2="SourceAlpha" operator="in" result="gg"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gg"/></feMerge></filter></defs>'+
    tornCloud(14,70,104,34,7,f,.5)+tornCloud(214,22,128,40,3,f,.38)+tornCloud(300,78,70,24,11,f,.3)+'</svg>'}
function vibHeader(s){
  return '<header class="top vtop" data-tod="'+todOf(s)+'"><span class="sky" aria-hidden="true">'+skyClouds(s)+'</span><div><p class="date">'+fmtDate(s.date)+'</p><h1>'+greet(s)+', Lucía</h1></div>'+
    '<button class="avatarL av-photo'+(IMG.lucia?'':' nophoto')+'" data-a="profile" aria-label="Perfil de Lucía">'+(IMG.lucia?'<img class="av-img" src="'+IMG.lucia+'" alt="" width="40" height="40" onerror="this.parentNode.classList.add(\'nophoto\');this.remove()">':'')+'<span class="ini" aria-hidden="true">L</span></button></header>'}
function vibWeek(s,done){
  /* completed = filled stamp + check glyph; current = larger terracotta ring + the word «Hoy»; upcoming = dashed, muted. Never colour alone. */
  var ck='<svg class="ck" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#2C4A3A"/><path d="M4.4 8.2l2.4 2.4 4.6-5" fill="none" stroke="#FFFCF6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var cells='';for(var i=1;i<=7;i++){var st=i<=done?'done':(i===done+1&&!todayDone(s)&&s.preset!=='semana')?'today':'fut';
    var lab=st==='today'?'Hoy':String(i), al='Día '+i+(st==='done'?', completado, '+KEEPS[i-1]:st==='today'?', hoy':', próximo');
    cells+='<li class="day '+st+'" aria-label="'+al+'"><span class="disc">'+(st==='done'?'<img src="'+IMG['d'+i]+'" alt="">'+ck:st==='today'?ring():'')+'</span><span aria-hidden="true">'+lab+'</span></li>'}
  return cells}
/* Atlas preview: ONE button (the whole card) that opens the same Atlas the tab opens. Photo markers for visited places.
   Completed week: the newly finished place's marker settles onto the globe once (0.9 s), then the card is still. */
function hoyGlobe(s){
  var w=shownWeek(s), cur=PLACES[w-1], nx=PLACES[w]||null, days=daysCompleted(s), walked=placesWalked(s);
  var stats=days+(days===1?' día completado':' días completados'), stats2=walked+(walked===1?' lugar recorrido':' lugares recorridos');
  var pc=function(p){return 'left:'+(p.x/340*100).toFixed(2)+'%;top:'+(p.y/372*100).toFixed(2)+'%'};
  var settle=(s.preset==='semana'&&!s.settled&&!reducedMotion(s));
  var path=nx?'<svg class="gpath" viewBox="0 0 340 372" preserveAspectRatio="none" aria-hidden="true"><path d="M'+cur.x+' '+cur.y+' Q'+((cur.x+nx.x)/2-6)+' '+((cur.y+nx.y)/2-24)+' '+nx.x+' '+nx.y+'" fill="none" stroke="#5A4A32" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 5" vector-effect="non-scaling-stroke"/></svg>':'';
  var seen=PLACES.filter(function(p){return (s.done[p.w]||0)>0&&p.id!==cur.id});
  var mk=(nx?'<i class="gnx" style="'+pc(nx)+'"></i>':'')+seen.map(function(p){return '<i class="gface" style="'+pc(p)+';background-image:url('+IMG['t-'+p.id]+')"></i>'}).join('')+
    '<i class="gface cur'+(settle?' settle':'')+'" style="'+pc(cur)+';background-image:url('+IMG['t-'+cur.id]+')"></i>';
  var globe='<span class="gglobe" aria-hidden="true"><img src="'+IMG.globe+'" alt="">'+path+mk+'</span>';
  return '<button class="gcard" data-a="tab" data-v="atlas" aria-label="Abrir tu Atlas: tu camino por Asia, '+days+(days===1?' día completado':' días completados')+' y '+walked+(walked===1?' lugar recorrido':' lugares recorridos')+'.">'+
    '<span class="gtxt"><span class="gtt">Tu camino por Asia</span><span class="gbig">'+stats+'</span><span class="gbig g2">'+stats2+'</span><span class="glink">Explorar tu Atlas'+ic('chev',16)+'</span></span>'+globe+'</button>'}
var DAY2={q:'Trabajo por turnos en una tienda; me paga la tienda.', f:'Qué es, y quién paga o a quién le pagas:'}; // sample answer by the persona to day 9 (week 2 day 2), field 1 of the note
function reflText(s,day){return day===2?DAY2.q:(day===3&&s.answer?ansPlain(s.answer):null)}
function vibRecall(s,day){
  var txt=reflText(s,day),q=txt?'«'+txt+'»':'';
  if(!txt)return '<div class="card recall"><p class="q">Todavía no hay una reflexión guardada.</p></div>';
  return '<button class="card recall rbtn" data-a="refl" data-day="'+day+'" aria-label="Tu reflexión del día '+day+': '+q.replace(/"/g,'')+'. Volver a esta reflexión."><span class="small"><b style="color:var(--forest)">Tu reflexión · Día '+day+'</b></span><span class="q">'+q+'</span><span class="rcue">Volver a esta reflexión'+ic('chev',16)+'</span></button>'}
function vRefl(s){var d=s.view.day,t=reflText(s,d);
  return '<div class="sub"><button class="iconbtn round" data-a="closeview" aria-label="Volver a Hoy">'+ic('back',22)+'</button><h1>Día '+d+' · Tu reflexión</h1></div><div class="pr-body"><p class="small">Lo que escribiste. Solo lectura.</p><p class="q" style="font-family:var(--serif);font-weight:var(--serif-w);font-size:var(--t24);line-height:1.3">«'+(t||'')+'»</p><p class="meta">Wuzhen, China · Semana 2 · Día '+d+'</p></div>'}
function dock(inner){return '<div class="dock">'+inner+'</div>'}
function perf(){var o='<g fill="#000">';for(var x=4;x<62;x+=7)o+='<circle cx="'+x+'" cy="0" r="2.4"/><circle cx="'+x+'" cy="76" r="2.4"/>';for(var y=5;y<76;y+=7)o+='<circle cx="0" cy="'+y+'" r="2.4"/><circle cx="62" cy="'+y+'" r="2.4"/>';return o+'</g>'}
function ring(){return '<svg aria-hidden="true" width="44" height="44" viewBox="0 0 42 42"><circle cx="21" cy="21" r="19" fill="#FFFCF6"/><path d="M21 2.4c10.6-.2 18.9 8.4 18.6 18.8-.3 10.3-8.9 18.4-19.2 18.2C10 39.2 2.2 30.6 2.5 20.4 2.8 10.8 10.1 3.4 19.8 2.9" fill="none" stroke="#C2603E" stroke-width="2.4" stroke-linecap="round"/></svg>'}

/* ---- the daily practice: three steps, one rule ----
   Paso 1 Tu respuesta (written, can be skipped) -> Paso 2 Un paso pequeño (bill + due date, can be skipped)
   -> Paso 3 Elara responde (read-only: her reply and the keepsake). The primary button says «Seguir» until the last step
   and «Terminar el día N» only on step 3. Finishing opens the review screen (Día hecho). */
var PRSTEPS=['Oferta A','Oferta B','Lo que conviene revisar','Para guardar'], NSTEPS=4;
var PAN={n:[10,38,66,92], land:[14,36,58,80]};
var PXPREV=null;
function newDraft(){return{step:0,a:null,b:null,chk:['','',''],skipped:[]}}
function normDraft(d){d.skipped=d.skipped||[];d.chk=d.chk||['','',''];if(d.a===undefined)d.a=null;if(d.b===undefined)d.b=null;return d}
function stepReady(r){return r.step===0?r.a!==null:r.step===1?r.b!==null:true}
function reducedMotion(s){return !!(s&&s.nomo)||!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function panPos(s){var st=s.draft?s.draft.step:0;return (s.land?PAN.land:PAN.n)[Math.min(NSTEPS-1,st)]}
function chooseStep(r,key){var q=DAY10[key],pick=r[key];
  return '<h2 id="pq" tabindex="-1">'+q.q+'</h2><p class="offer" style="margin:0;font-size:var(--t17)">'+q.body+'</p>'+
   '<div class="chips" role="radiogroup" aria-label="'+q.q+'">'+q.opts.map(function(o,i){return'<button class="chip" role="radio" aria-checked="'+(pick===i)+'" data-a="pick" data-w="'+key+'" data-v="'+i+'">'+o+'</button>'}).join('')+'</div>'+
   (pick!==null?'<div class="eres reply" role="status"><img src="'+IMG.orb+'" alt=""><p>'+q.reply+'</p></div>':'')}
function vPractice(s){
  var r=normDraft(s.draft||newDraft()), step=r.step, d=shownDay(s), land=!!s.land, sh=Math.round((s.w<360?160:s.h&&s.h<700?176:208)/(s.k>1.25?1.6:1));
  var tgt=panPos(s), start=(PXPREV!=null&&!reducedMotion(s))?PXPREV:tgt;
  var alt='Canal de Wuzhen por la mañana: casas de madera y sauces junto al agua verde';
  var top='<div class="pr-top"><div class="pr-l"><button class="iconbtn round" data-a="leave" aria-label="Cerrar y guardar. Tus respuestas se quedan">'+ic('x',22)+'</button>'+
    (step>0?'<button class="iconbtn round" data-a="pback" aria-label="Paso anterior">'+ic('back',22)+'</button>':'')+'</div>'+
    '<button class="iconbtn pill" data-a="land" aria-pressed="'+land+'">'+ic('eye',20)+(land?'Ver la pregunta':'Ver paisaje')+'</button></div>';
  var scene='<div class="pr-scene torn-foot'+(land?' full':'')+'" style="--sh:'+sh+'px"><img class="pr-photo" src="'+IMG.wzpan+'" alt="'+alt+'" data-px="'+tgt+'" style="object-position:'+start+'% 42%">'+top+'</div>';
  if(land)return '<div class="pr">'+scene+'<button class="pr-bar" data-a="land"><span>Volver a mi reflexión</span>'+ic('up',20)+'</button></div>';
  var body,dk;
  if(step===0||step===1){
    body='<p class="lbl" style="color:var(--forest)">'+(step===0?'Día '+d+' · Wuzhen · '+DAY10.title:PRSTEPS[1])+'</p>'+chooseStep(r,step===0?'a':'b');
    dk='<button class="btn" data-a="pnext"'+(stepReady(r)?'':' disabled')+'>Seguir</button><button class="btn quiet" data-a="pskip">'+DAY10.skip+'</button>';
  } else if(step===2){
    body='<p class="lbl" style="color:var(--forest)">'+PRSTEPS[2]+'</p><div class="eres"><img src="'+IMG.orb+'" alt=""><h2 id="pq" tabindex="-1">'+DAY10.teach.t+'</h2></div><p style="margin:0;font-size:var(--t17)">'+DAY10.teach.body+'</p>';
    dk='<button class="btn" data-a="pnext">Seguir</button>';
  } else {
    body='<p class="lbl" style="color:var(--forest)">'+PRSTEPS[3]+'</p><h2 id="pq" tabindex="-1">'+DAY10.check.t+'</h2>'+
      DAY10.check.fields.map(function(f,i){return'<label class="lbl" for="chk'+i+'" style="font-weight:600;color:var(--ink)">'+f+'</label><input id="chk'+i+'" type="text" data-in="chk" data-i="'+i+'" value="'+esc(r.chk[i]||'')+'" autocomplete="off">'}).join('')+
      '<p class="saved-note" id="svn">'+(r.chk.some(Boolean)?ic('check',16)+'Guardado':'Se guarda mientras escribes. Solo tú lo ves.')+'</p>';
    dk='<button class="btn" data-a="pfinish">Terminar el día '+d+'</button><button class="btn quiet" data-a="pskip">'+DAY10.skip+'</button>';
  }
  var segs=[0,1,2,3].map(function(i){return'<i class="'+(i<step?'on':i===step?'cur':'')+'"></i>'}).join('');
  var meta='<div class="pr-meta"><img src="'+IMG.orb+'" alt=""><b>Elara</b><span class="pr-step">Paso '+(step+1)+' de '+NSTEPS+'</span></div><div class="pr-steps" role="img" aria-label="Paso '+(step+1)+' de '+NSTEPS+': '+PRSTEPS[step]+'">'+segs+'</div>';
  return '<div class="pr">'+scene+'<section class="pr-panel" aria-labelledby="pq"><span class="pr-gap" aria-hidden="true"></span>'+meta+'<div class="pr-body">'+body+'</div>'+dock(dk)+'</section></div>';
}
function normAns(a){a=a||{};a.skipped=a.skipped||[];a.chk=a.chk||['','',''];if(a.a===undefined)a.a=null;if(a.b===undefined)a.b=null;return a}
function ansPlain(a){a=normAns(a);var c=a.chk.filter(Boolean);if(c.length)return c[0];if(a.a!==null||a.b!==null)return (a.a!==null?'Oferta A: '+DAY10.a.opts[a.a]:'')+(a.a!==null&&a.b!==null?' · ':'')+(a.b!==null?'Oferta B: '+DAY10.b.opts[a.b]:'');return null}
function ansLine(a){var t=ansPlain(a);return t?'«'+esc(t)+'»':'<span class="skipd">Saltaste esta pregunta por ahora.</span>'}
function vReview(s){
  var a=normAns(s.answer), d=shownDay(s);
  var picks=function(k,lab){return'<p class="meta"><b style="color:var(--ink)">'+lab+':</b> '+(a[k]!==null?esc(DAY10[k].opts[a[k]]):'lo saltaste por ahora.')+'</p>'};
  var chk=a.chk.some(Boolean)?'<div class="card recall">'+DAY10.check.fields.map(function(f,i){return a.chk[i]?'<p class="small"><b>'+f+'</b></p><p class="q">'+esc(a.chk[i])+'</p>':''}).join('')+'</div>':'<p class="meta">Para guardar: lo saltaste por ahora.</p>';
  return '<div class="sub"><button class="iconbtn round" data-a="home" aria-label="Volver a Hoy">'+ic('back',22)+'</button><h1>Día '+d+' · Wuzhen</h1></div>'+
   '<div class="pr-body"><p class="doneline">'+ic('check',20)+'Día '+d+' hecho</p>'+
   '<div style="display:flex;gap:14px;align-items:center"><span class="day done"><span class="disc" style="width:64px;height:64px;border-radius:32px"><img src="'+IMG.d3+'" alt="" style="width:58px;height:58px"></span></span><p class="meta">Hoy guardas la '+KEEPS[2]+'.</p></div>'+
   '<h2 style="font-size:var(--t22)">'+DAY10.title+'</h2>'+picks('a','Oferta A')+picks('b','Oferta B')+chk+
   '<p class="notice">El día '+(d+1)+' se abre mañana, '+tomorrowName(s)+'.</p>'+
   '</div>'+dock('<button class="btn sec" data-a="home">Volver a Hoy</button>');
}
function vWeek(s){
  var cells='';for(var i=1;i<=7;i++)cells+='<li class="day done" aria-label="Día '+i+': '+KEEPS[i-1]+'"><span class="disc"><img src="'+IMG['d'+i]+'" alt=""></span><span aria-hidden="true">'+i+'</span></li>';
  return '<div class="sub"><button class="iconbtn round" data-a="home" aria-label="Volver a Hoy">'+ic('back',22)+'</button><h1>Tu semana en Wuzhen</h1></div>'+
   '<div class="pr-body"><p class="doneline">'+ic('check',20)+'7 de 7 días</p><ol class="week" style="list-style:none;margin:0;padding:0">'+cells+'</ol>'+
   '<h2 style="font-size:var(--t22)">Lo que guardaste</h2><div class="card recall"><p class="small"><b style="color:var(--forest)">Día 3</b></p><p class="q">'+ansLine(s.answer)+'</p></div>'+
   '<p class="notice">Semana 3 · Terrazas de Yuanyang se abre mañana, '+tomorrowName(s)+'.</p>'+
   '</div>'+dock('<button class="btn" data-a="goAtlas" data-sel="wz">Ver Wuzhen en tu Atlas</button>');
}
function vGuide(){return '<div class="sub"><button class="iconbtn round" data-a="closeview" aria-label="Volver">'+ic('back',22)+'</button><h1>Guía · '+GUIDE.min+' min</h1></div><div class="pr-body"><h2>'+GUIDE.t+'</h2><ol style="margin:0;padding-left:22px;display:flex;flex-direction:column;gap:12px;font-size:var(--t17)">'+GUIDE.pts.map(function(p){return'<li>'+p+'</li>'}).join('')+'</ol></div>'}

/* Atlas */
function vAtlas(s){
  var a=s.atlas, gw=Math.min(340,s.w-36), f=gw/340, pl=PLACES.map(function(p){return{p:p,st:placeState(s,p)}});
  var walked=placesWalked(s), days=daysCompleted(s);
  var head='<header class="top"><div>'+'<h1>Tu Atlas</h1><p class="stats"><b>'+days+'</b> días completados · <b>'+walked+'</b> '+(walked===1?'lugar recorrido':'lugares recorridos')+'</p></div>'+
    '<button class="iconbtn" data-a="alist" aria-pressed="'+a.list+'">'+ic(a.list?'globe':'list',18)+(a.list?'Ver mapa':'Ver lista')+'</button></header>';
  var body;
  if(a.list){
    body='<div class="pad list"><p class="lbl" style="margin-bottom:6px">Claridad financiera · Asia</p><div class="rows">'+pl.map(function(e){return'<button class="row" data-a="asel" data-id="'+e.p.id+'"><img src="'+IMG['t-'+e.p.id]+'" alt=""'+(e.st==='lock'?' style="filter:grayscale(1)"':'')+'><span><span class="rt">'+e.p.n+'</span><span class="rm">Semana '+e.p.w+' de '+WEEKS+' · '+stLabel(s,e)+'</span></span><span class="chev">'+ic('chev',20)+'</span></button>'}).join('')+'</div></div>';
  } else {
    // group markers whose 48px faces would overlap at this width
    var pts=pl.map(function(e){return{e:e,x:e.p.x*f,y:e.p.y*f}}), groups=[];
    pts.forEach(function(q){var g=groups.find(function(g){return g.m.some(function(m){return Math.hypot(m.x-q.x,m.y-q.y)<46})});if(g)g.m.push(q);else groups.push({m:[q]})});
    // merge groups that ended up touching
    for(var i=0;i<groups.length;i++)for(var j=groups.length-1;j>i;j--){if(groups[i].m.some(function(m){return groups[j].m.some(function(n){return Math.hypot(m.x-n.x,m.y-n.y)<46})})){groups[i].m=groups[i].m.concat(groups[j].m);groups.splice(j,1)}}
    var H=Math.round(372*f), marks='', lines='';
    groups.forEach(function(g,gi){
      var cx=g.m.reduce(function(t,m){return t+m.x},0)/g.m.length, cy=g.m.reduce(function(t,m){return t+m.y},0)/g.m.length;
      if(g.m.length>1&&!a.open){
        var top=g.m.find(function(m){return m.e.st==='cur'})||g.m[0], second=g.m.find(function(m){return m!==top});
        marks+='<button class="mk cluster" data-a="aopen" style="left:'+cx+'px;top:'+cy+'px;--c:#C2603E" aria-label="'+g.m.length+' lugares de Claridad financiera. Abrir el grupo"><span class="face2" style="background-image:url('+IMG['t-'+second.e.p.id]+')"></span><span class="face" style="background-image:url('+IMG['t-'+top.e.p.id]+')"></span>'+(top.e.st==='cur'?'<span class="pulse"></span>':'')+'<span class="cnt">'+g.m.length+'</span></button>';
        marks+='<span class="zlabel" style="left:'+cx+'px;top:'+(cy-38)+'px">Claridad financiera</span>';
        return}
      var n=g.m.length, R=n>1?Math.max(56,n*15):0;
      g.m.sort(function(x,y){return x.e.p.w-y.e.p.w}).forEach(function(m,k){
        var ang=-Math.PI/2+k*2*Math.PI/n, x=n>1?cx+Math.cos(ang)*R:m.x, y=n>1?cy+Math.sin(ang)*R:m.y;
        x=Math.max(26,Math.min(gw-26,x));y=Math.max(26,Math.min(H-60,y));
        if(n>1)lines+='<line x1="'+m.x+'" y1="'+m.y+'" x2="'+x+'" y2="'+y+'" stroke="#5A4A32" stroke-width="1.2" stroke-opacity=".7"/><circle cx="'+m.x+'" cy="'+m.y+'" r="3.2" fill="#C2603E" stroke="#FFFCF6" stroke-width="1.2"/>';
        var e=m.e, sel=a.sel===e.p.id;
        marks+='<button class="mk '+(e.st==='lock'?'lock ':'')+(sel?'sel':'')+'" data-a="asel" data-id="'+e.p.id+'" style="left:'+x+'px;top:'+y+'px;--c:#C2603E" aria-pressed="'+sel+'" aria-label="'+e.p.n+'. Semana '+e.p.w+' de '+WEEKS+'. '+stLabel(s,e)+'"><span class="face" style="background-image:url('+IMG['t-'+e.p.id]+')"></span>'+(e.st==='done'?'<span class="ok">'+ic('check',13,'#FFFCF6')+'</span>':'')+(e.st==='cur'&&!sel?'<span class="pulse"></span>':'')+'</button>';
      });
      if(n>1&&a.open)marks+='<span class="zlabel" style="left:'+cx+'px;top:'+Math.max(14,cy-R-28)+'px">Claridad financiera</span>';
    });
    body='<div class="globe" style="width:'+gw+'px"><img src="'+IMG.globe+'" alt="Globo con Asia resaltada, donde está tu camino de Claridad financiera">'+
      (a.open?'<button class="bgbtn" data-a="aclose" aria-label="Cerrar el grupo de lugares"></button>':'')+
      '<svg class="leader" width="'+gw+'" height="'+H+'" aria-hidden="true">'+lines+'</svg>'+marks+'</div>'+
      '<p class="small" style="text-align:center;margin-top:-6px">'+(a.open?'Toca un lugar para ver su avance':'Toca el grupo para ver tus cinco lugares')+'</p>';
  }
  var sel=a.sel?PLACES.find(function(p){return p.id===a.sel}):null, card='';
  var en=entry(s), dayN=shownDay(s);
  var cont=en.kind==='practice'?'Continuar · día '+dayN:en.label;
  var contBtn='<div class="act"><button class="btn" data-a="entry">'+cont+(en.kind==='practice'?ic('chev',18):'')+'</button>'+(en.hint?'<p class="small" style="margin-top:6px">'+en.hint+'</p>':'')+'</div>';
  if(sel){var e={p:sel,st:placeState(s,sel)};
    var act=e.st==='lock'?'<div class="act"><button class="btn" disabled aria-describedby="lk">'+ic('lock',18)+'Todavía no</button><p class="small" id="lk">Se abre al terminar '+PLACES[sel.w-2].n+'.</p></div>':
      e.st==='cur'?contBtn:
      e.st==='next'?'<div class="act"><button class="btn" disabled>Se abre mañana</button></div>':
      '<div class="act"><button class="btn sec" data-a="oos" data-k="revisit">Ver lo que guardaste aquí</button></div>';
    card='<section class="card selcard" aria-live="polite" aria-label="Lugar elegido"><img src="'+IMG['t-'+sel.id]+'" alt=""><div><p class="nm">'+sel.n+'</p><p class="meta">'+sel.cty+' · Semana '+sel.w+' de '+WEEKS+'</p><p class="small" style="color:var(--ink);margin-top:4px">'+stLabel(s,e)+'</p></div>'+act+'</section>';
  } else {
    var cw=shownWeek(s), cp=PLACES[cw-1];
    card='<section class="card selcard" aria-label="Tu camino actual"><img src="'+IMG['t-'+cp.id]+'" alt=""><div><p class="small"><b style="color:var(--forest)">Tu camino actual · Sigue donde lo dejaste</b></p><p class="nm">'+cp.n+'</p><p class="meta">Semana '+cw+' de '+WEEKS+' · '+(s.preset==='semana'?'7 de 7 días':'Día '+shownDay(s)+' de 7')+'</p></div>'+contBtn+'</section>';
  }
  var areas=AREAS.map(function(ar){var wk=ar.open?PLACES.filter(function(p){return weekDone(s,p.w)}).length:0;
    return'<li><button class="card arearow" data-a="area" data-id="'+ar.id+'" aria-label="'+ar.t+', '+ar.n+'. '+(ar.open?'Tu camino actual. '+wk+' de '+WEEKS+' semanas':'Se abre después de la beta')+'. Ver detalles"><span class="sw torn-a" style="background:'+ar.col+'" aria-hidden="true"></span><span class="arbody"><span class="an">'+ar.t+'</span><span class="small">'+ar.n+' · '+(ar.open?wk+' de '+WEEKS+' semanas':'Se abre después de la beta')+'</span>'+(ar.open?'<span class="bars" aria-hidden="true">'+Array.from({length:WEEKS},function(_,i){return'<i style="'+(i<wk?'background:'+ar.col:i===wk?'background:linear-gradient(90deg,'+ar.col+' '+Math.round(((s.done[i+1]||0)/7)*100)+'%,var(--hair) 0)':'')+'"></i>'}).join('')+'</span>':'')+'</span><span class="archev" aria-hidden="true">'+ic('chev',18)+'</span></button></li>'}).join('');
  return head+body+'<div class="pad" style="margin-top:12px">'+card+'</div><div class="pad" style="margin-top:16px"><h2 class="lbl" id="areasH" style="margin-bottom:8px">Tus seis áreas</h2><p class="small" style="margin:0 0 8px">Toca una para verla. Mirar no empieza nada ni cambia tu camino.</p><ul class="arealist" aria-labelledby="areasH">'+areas+'</ul></div><div style="height:20px"></div>';
}
/* Onboarding and Mirada: the existing designs (docs/onboarding-final-2026-10-29) run unchanged in an iframe that fills the screen.
   No tab bar (the design has none there), nothing is stored, nothing is read back by this app. */
var ONB_URL=null;
function onbURL(){if(ONB_URL)return ONB_URL;if(!window.ELARA_ONB)return null;var bin=atob(window.ELARA_ONB),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);ONB_URL=URL.createObjectURL(new Blob([u],{type:'text/html'}));return ONB_URL}
function vOnb(s,v){var dv=devVars(s),url=onbURL();
  if(!url)return '<div class="pad stack" style="padding-top:'+dv.sat+'px"><p class="notice" role="note">El onboarding no está incluido en esta versión del archivo.</p><button class="btn" data-a="home">Volver a Hoy</button></div>';
  var h='#mode='+(v.mode||'onboarding')+'|plat='+(s.plat||'ios')+'|w='+s.w+'|k='+s.k+'|sat='+dv.sat+(s.nomo?'|nomo=1':'')+(v.jump?'|jump='+v.jump:'');
  return '<iframe class="onbf" id="onbframe" title="'+(v.mode==='mirada'?'Mirada: tus seis áreas':'Onboarding')+'" src="'+url+h+'"></iframe>'}
function vArea(s,id){var ar=AREAS.find(function(x){return x.id===id})||AREAS[0],cur=!!ar.open;
  var wk=cur?PLACES.filter(function(p){return weekDone(s,p.w)}).length:0,en=entry(s);
  var places=cur?'<ul class="arealist" aria-label="Los cinco lugares">'+PLACES.map(function(p){var st=placeState(s,p),e={p:p,st:st};return'<li><button class="card arearow" data-a="goAtlas" data-sel="'+p.id+'"><img src="'+IMG['t-'+p.id]+'" alt="" width="44" height="44" style="width:44px;height:44px;border-radius:8px;object-fit:cover'+(st==='lock'?';filter:grayscale(1)':'')+'"><span class="arbody"><span class="an" style="font-size:var(--t17)">'+p.n+'</span><span class="small">Semana '+p.w+' de '+WEEKS+' · '+stLabel(s,e)+'</span></span><span class="archev" aria-hidden="true">'+ic('chev',18)+'</span></button></li>'}).join('')+'</ul>':'';
  var status=cur?'<p class="meta"><b style="color:var(--forest)">Tu camino actual</b> · '+wk+' de '+WEEKS+' semanas</p>':'<p class="meta"><b>Se abre después de la beta</b></p>';
  var info=cur?'':'<div class="notice" role="note"><b>Todavía no está abierta.</b> La beta incluye solo Claridad financiera. Puedes mirar esta área aquí: no empiezas nada y tu camino actual no cambia.</div>';
  var startBtn=(!cur&&s.demoOpen)?'<button class="btn" data-a="areastart" data-id="'+ar.id+'">Empezar este camino</button><p class="small" style="text-align:center;margin:0">Demostración: así se pediría la confirmación cuando haya más caminos abiertos.</p>':'';
  var contBtn=cur?'<button class="btn" data-a="entry">'+(en.kind==='practice'?'Continuar · día '+shownDay(s):en.label)+'</button>':'';
  return '<div class="sub"><button class="iconbtn round" data-a="closeview" aria-label="Volver al Atlas">'+ic('back',22)+'</button><h1>'+ar.t+'</h1></div><div class="pad stack"><section class="card" style="padding:16px;display:flex;flex-direction:column;gap:6px"><span class="sw torn-a" style="background:'+ar.col+';width:34px;height:9px;display:block" aria-hidden="true"></span><p class="meta">'+ar.n+'</p>'+status+'</section>'+info+places+contBtn+startBtn+'<button class="btn quiet" data-a="closeview">Volver al Atlas</button></div>'}
function stLabel(s,e){var d=s.done[e.p.w]||0;return e.st==='done'?'Recorrido · 7 de 7 días':e.st==='cur'?'Aquí vas · '+d+' de 7 días':e.st==='next'?'Se abre mañana':'Se abre al terminar '+(PLACES[e.p.w-2]||{}).n}

/* Explorar */
/* ---- Oportunidades remotas (v2): SAMPLE data only. Every company is fictional; nothing here comes from a verified source.
   `hours` (Tiempo completo / Medio tiempo) and `arr` (Empleo / Contrato independiente / Proyecto freelance) are two separate
   fields and either may be missing. `is_sample` is true for every listing in the prototype. SPEC.md has the real schema. ---- */
var OPP_COUNTRIES=[['MX','México'],['CO','Colombia'],['AR','Argentina'],['CL','Chile'],['PE','Perú'],['CR','Costa Rica']];
var OPP_CATS=['Atención al cliente','Contabilidad y finanzas','Contenido y traducción','Diseño','Operaciones y soporte'];
var OPP_HOURS=['Tiempo completo','Medio tiempo'];
var OPP_ARR=['Empleo','Contrato independiente','Proyecto freelance'];
var OPPS=[
 {id:'o1',role:'Atención al cliente en español',co:'Casa Lumbre Studio',cat:'Atención al cliente',hours:'Medio tiempo',arr:'Empleo',scope:'world',pay:{a:'9–11',c:'USD',p:'por hora'},lang:'Español nativo · inglés básico',posted:'2026-10-24',is_sample:true,feat:1},
 {id:'o2',role:'Asistente de contabilidad',co:'Lomas Contables',cat:'Contabilidad y finanzas',hours:'Tiempo completo',arr:'Empleo',scope:['MX','CO'],pay:{a:'14,000–17,000',c:'MXN',p:'al mes'},lang:'Español nativo',posted:'2026-10-22',is_sample:true,feat:1},
 {id:'o3',role:'Redactora de contenido en español',co:'Cuaderno Abierto',cat:'Contenido y traducción',hours:null,arr:'Proyecto freelance',scope:'world',pay:{a:'120',c:'USD',p:'por artículo'},lang:'Español nativo',posted:'2026-10-20',is_sample:true,feat:1},
 {id:'o4',role:'Traductora inglés–español',co:'Mapa Pequeño Co.',cat:'Contenido y traducción',hours:'Medio tiempo',arr:'Contrato independiente',scope:['AR','CL','PE'],pay:{a:'18–22',c:'USD',p:'por hora'},lang:'Inglés avanzado · español nativo',posted:'2026-10-19',is_sample:true},
 {id:'o5',role:'Soporte de operaciones',co:'Faro Logístico',cat:'Operaciones y soporte',hours:'Tiempo completo',arr:null,scope:'world',pay:null,lang:'Español nativo · inglés intermedio',posted:'2026-10-18',is_sample:true},
 {id:'o6',role:'Diseñadora de presentaciones',co:'Taller Pájaro Digital',cat:'Diseño',hours:null,arr:'Proyecto freelance',scope:['CO','PE'],pay:{a:'250–400',c:'USD',p:'por proyecto'},lang:'Español nativo · inglés básico',posted:'2026-10-16',is_sample:true},
 {id:'o7',role:'Asistente virtual',co:'Norte Sur Cuentas',cat:'Operaciones y soporte',hours:'Medio tiempo',arr:'Contrato independiente',scope:['MX'],pay:{a:'90',c:'MXN',p:'por hora'},lang:'Español nativo',posted:'2026-10-15',is_sample:true},
 {id:'o8',role:'Revisora de calidad de datos',co:'Río Claro Soluciones',cat:'Contabilidad y finanzas',hours:null,arr:'Proyecto freelance',scope:['CL','CR'],pay:null,lang:'Español nativo · inglés intermedio',posted:'2026-10-12',is_sample:true}
];
/* DESIGN DEMONSTRATION ONLY (switch in the prototype page): shows how a real, reviewed listing would look. Fictional data, ejemplo.invalid. */
var OPP_DEMO={id:'d1',role:'Coordinadora de soporte al cliente',co:'Estudio Ficticio',cat:'Atención al cliente',hours:'Tiempo completo',arr:'Empleo',scope:['MX','CO','PE'],pay:{a:'1,100–1,400',c:'USD',p:'al mes'},lang:'Español nativo · inglés intermedio',posted:'2026-10-26',is_sample:false,url:'https://ejemplo.invalid/demostracion'};
var OPP_LONG={id:'dl',role:'Coordinadora senior de atención al cliente y experiencia de usuario para equipos remotos en español e inglés',co:'Cooperativa de Servicios Digitales y Acompañamiento Comunitario de América Latina S. A. S.',cat:'Atención al cliente',hours:'Tiempo completo',arr:'Contrato independiente',scope:['MX','CO','AR','CL','PE','CR'],pay:{a:'1,100–1,400',c:'USD',p:'al mes más comisiones por desempeño'},lang:'Español nativo · inglés avanzado · portugués básico',posted:'2026-10-27',is_sample:true,feat:1};
function oppAll(s){var a=s.demoLong?[OPP_LONG].concat(OPPS):OPPS;return s.demoReal?[OPP_DEMO].concat(a):a}
function oppCountryName(c){var m=OPP_COUNTRIES.find(function(x){return x[0]===c});return m?m[1]:c}
function oppActive(s){var f=s.ex.opp||{};return (f.cat?1:0)+(f.h?1:0)+(f.a?1:0)}
function oppAny(s){var f=s.ex.opp||{};return !!(f.c||f.cat||f.h||f.a)}
function oppList(s){var f=s.ex.opp||{};return oppAll(s).filter(function(o){
  if(f.c&&!(o.scope==='world'||o.scope.indexOf(f.c)>-1))return false;
  if(f.cat&&o.cat!==f.cat)return false;if(f.h&&o.hours!==f.h)return false;if(f.a&&o.arr!==f.a)return false;return true})}
function oppPay(o){return o.pay?o.pay.c+' '+o.pay.a+' '+o.pay.p:'Pago no indicado'}
function oppDate(iso){var d=D(iso);return d.getDate()+' '+MONTHS[d.getMonth()].slice(0,3)+' '+d.getFullYear()}
function oppScope(o){return o.scope==='world'
  ?'<span class="scope w">'+ic('globe',16)+'Abierta a todo el mundo</span>'
  :'<span class="scope r">'+ic('pin',16)+'Solo en: '+o.scope.map(oppCountryName).join(', ')+'</span>'}
function oppCard(o){
  var sample=o.is_sample!==false;
  var tag=sample?'<span class="tagx">Ejemplo</span>':'<span class="tagx demo">Demostración de diseño: no es una oferta real</span>';
  var btn=sample
   ?'<button class="btn sec oppb" data-a="opp" data-id="'+o.id+'" aria-haspopup="dialog" aria-label="Ver ejemplo: '+o.role+', '+o.co+'. Oportunidad ficticia">Ver ejemplo</button>'
   :'<a class="btn sec oppb" href="'+o.url+'" target="_blank" rel="noopener noreferrer" data-a="oppdemo" data-id="'+o.id+'" aria-label="Ver oportunidad: '+o.role+', '+o.co+'. Se abre fuera de Elara">Ver oportunidad'+ic('ext',18)+'</a><p class="small oppx">Se abre fuera de Elara</p>';
  return '<article class="card opp" aria-labelledby="'+o.id+'-t"><div class="oppt">'+tag+oppScope(o)+'</div>'+
    '<h3 id="'+o.id+'-t">'+o.role+'</h3><p class="co">'+o.co+'</p>'+
    '<dl class="oppm"><dt>Pago</dt><dd>'+oppPay(o)+'</dd>'+(o.hours?'<dt>Horario</dt><dd>'+o.hours+'</dd>':'')+(o.arr?'<dt>Modalidad</dt><dd>'+o.arr+'</dd>':'')+'<dt>Idiomas</dt><dd>'+o.lang+'</dd><dt>Publicada</dt><dd>'+oppDate(o.posted)+'</dd></dl>'+btn+'</article>'}
function oppNotice(){return '<p class="oppnote" role="note"><b>Vista previa:</b> ofertas ficticias, sin postulaciones.</p>'}
function oppIntro(){return '<p class="oppi">Descubre oportunidades remotas para ampliar tus opciones de ingresos.</p>'}
function oppInfo(s){var on=!!s.ex.oppInfo;
  return '<div class="oppinfo"><button type="button" class="infob" id="opp-info-btn" data-a="oppinfo" aria-expanded="'+on+'" aria-controls="oppinfo"><span>Más información</span>'+ic('chev',20)+'</button>'+
   '<div id="oppinfo" class="card oppd" role="region" aria-labelledby="opp-info-btn"'+(on?'':' hidden')+'><ul>'+
   '<li>Estas oportunidades son ficticias. Todavía no hay una fuente verificada ni revisión editorial, y no se aceptan postulaciones.</li>'+
   '<li>Más adelante, una persona de Elara revisará cada oportunidad antes de publicarla, y quizá se use una búsqueda asistida por IA para preparar la lista. Nada de eso existe todavía.</li>'+
   '<li>Nunca pagues para postular ni para que te contraten.</li><li>Elara no es empleadora ni agencia de empleo.</li>'+
   '<li>Esto no es asesoría financiera ni laboral. Confirma las condiciones con la empresa.</li>'+
   '<li>Es parte de tu camino de claridad financiera: conocer qué opciones existen. No es una promesa de ingresos.</li></ul></div></div>'}
function oppHead(){return '<div class="sechead oppsh"><h2 id="oppH">Oportunidades remotas</h2></div>'}
function oppFeatured(s){var fs=oppAll(s).filter(function(o){return o.feat}).slice(0,3);
  return '<section class="pad oppsec" aria-labelledby="oppH">'+oppHead()+oppIntro()+oppNotice()+oppInfo(s)+'<div class="stack oppstack">'+fs.map(oppCard).join('')+'</div><button class="btn sec oppall" id="oppAll" data-a="exf" data-v="oportunidades" data-from="all">Ver todas ('+oppAll(s).length+')</button></section>'}
function oppFull(s){var f=s.ex.opp||{c:'',cat:'',h:'',a:''},list=oppList(s),any=oppAny(s),n=oppActive(s),open=!!s.ex.oppOpen;
  function sel(id,lab,all,opts,val){return '<label class="oppl" for="opp-'+id+'"><span class="lbl">'+lab+'</span><select id="opp-'+id+'" data-in="opp'+id+'"><option value="">'+all+'</option>'+opts.map(function(o){var v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return'<option value="'+v+'"'+(val===v?' selected':'')+'>'+l+'</option>'}).join('')+'</select></label>'}
  var cnt=list.length+(list.length===1?' oportunidad':' oportunidades');
  return '<section class="pad oppsec" aria-labelledby="oppH">'+oppHead()+oppIntro()+oppNotice()+oppInfo(s)+
   '<div class="card oppf" role="group" aria-label="Buscar y filtrar"><div class="oppfr">'+
   '<div class="oppsel"><label class="oppsel-l" for="opp-c">País</label><select id="opp-c" data-in="oppc"><option value="">Todos los países</option>'+OPP_COUNTRIES.map(function(o){return'<option value="'+o[0]+'"'+(f.c===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div>'+
   '<button type="button" class="btn sec oppfb" id="opp-filtros" data-a="oppfilt" aria-expanded="'+open+'" aria-controls="oppfp"><span aria-hidden="true">Filtros'+(n?' ('+n+')':'')+'</span><span class="sr">Filtros, '+n+(n===1?' activo':' activos')+'</span>'+ic('chev',20)+'</button></div>'+
   '<div id="oppfp" class="oppfp" role="group" aria-label="Filtros de categoría y tipo de empleo"'+(open?'':' hidden')+'>'+sel('cat','Categoría','Todas las categorías',OPP_CATS,f.cat)+
    '<fieldset class="oppfs2"><legend class="lbl">Tipo de empleo</legend>'+sel('h','Horario','Cualquier horario',OPP_HOURS,f.h)+sel('a','Modalidad','Cualquier modalidad',OPP_ARR,f.a)+'</fieldset>'+
    '<button type="button" class="btn oppdone" data-a="oppfdone">Listo</button></div>'+
   '<div class="oppsub"><p class="oppn" role="status" aria-live="polite">'+cnt+'</p>'+(any?'<button type="button" class="btn quiet oppclr" data-a="oppclear">Quitar filtros</button>':'')+'</div></div>'+
   (list.length?'<div class="stack oppstack">'+list.map(oppCard).join('')+'</div>':'<div class="empty" role="status"><h2>No hay ejemplos con esos filtros.</h2><p class="meta" style="color:var(--ink)">Prueba con otro país o categoría.</p><button class="btn sec" data-a="oppclear">Quitar filtros</button></div>')+'</section>'}
function vExplorar(s){
  if(s.rule==='B')return exOffHTML();
  var x=s.ex, live=WORKSHOPS.filter(function(w){return wsStatus(s,w)==='next'}), rec=WORKSHOPS.filter(function(w){return wsStatus(s,w)==='past'});
  var next=live[0];
  var head='<div class="warm"><header class="exhead torn-foot"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><h1>Explorar</h1><div style="display:flex;gap:8px"><button class="iconbtn" data-a="exsearch">'+ic('search',18)+'Buscar</button><button class="iconbtn round" data-a="exsaved" aria-label="Guardados, '+x.saved.length+'">'+ic('mark',20)+(x.saved.length?'<span class="badge">'+x.saved.length+'</span>':'')+'</button></div></div>'+
    '<nav class="extabs" aria-label="Tipo de contenido">'+[['todo','Todo'],['talleres','Talleres'],['audios','Audios'],['guias','Guías'],['oportunidades','Oportunidades']].map(function(t){return'<button data-a="exf" data-v="'+t[0]+'" aria-pressed="'+(x.filter===t[0])+'">'+t[1]+'</button>'}).join('')+'</nav></header></div>';
  var parts=[];
  if(x.filter==='todo'||x.filter==='talleres'){
    if(next)parts.push('<section class="pad"><article class="card ws"><div class="ws-top"><span class="print warm"><span class="grain"></span><img src="'+IMG.taller+'" alt="'+next.host+'"></span><div class="stack" style="gap:6px"><p class="live"><i></i>Próximo taller en vivo</p><h2 class="tt">'+next.t+'</h2><p class="meta">'+wsWhen(next)+'</p><p class="price">'+next.price+'</p></div></div><button class="btn" data-a="ws" data-id="'+next.id+'">Ver el taller</button></article></section>');
  }
  if(x.filter==='todo'||x.filter==='audios'){
    parts.push('<section><div class="pad sechead" style="margin-bottom:10px"><h2>Para escuchar</h2></div><div class="covers">'+AUDIOS.map(function(au){return audioCard(s,au)}).join('')+'</div></section>');
  }
  if(x.filter==='todo'||x.filter==='talleres'){
    var rest=live.slice(1);
    if(rest.length)parts.push('<section class="pad"><div class="sechead" style="margin-bottom:4px"><h2>Próximos talleres</h2></div>'+rest.map(function(w){return wsRow(s,w)}).join('')+'</section>');
    if(rec.length)parts.push('<section class="pad"><div class="sechead" style="margin-bottom:4px"><h2>Grabaciones</h2></div>'+rec.map(function(w){return wsRow(s,w)}).join('')+'</section>');
  }
  if(x.filter==='todo'||x.filter==='guias')parts.push('<section class="pad"><div class="sechead" style="margin-bottom:4px"><h2>Guías</h2></div><div class="rows"><button class="row" data-a="guide"><span><span class="rt">'+GUIDE.t+'</span><span class="rm">Guía · '+GUIDE.min+' min de lectura</span></span><span class="chev">'+ic('chev',20)+'</span></button></div></section>');
  if(x.filter==='todo')parts.push(oppFeatured(s));
  if(x.filter==='oportunidades')parts.push(oppFull(s));
  return head+'<div class="gap18" style="padding:'+(x.filter==='oportunidades'?'10':'14')+'px 0 '+(s.audio.id?'120px':'28px')+'">'+parts.join('')+'</div>';
}
function wsWhen(w){var d=D(w.d);return WD[d.getDay()].slice(0,3)+' '+d.getDate()+' '+MONTHS[d.getMonth()].slice(0,3)+' · '+w.h+' (tu hora) · '+w.min+' min'}
function wsRow(s,w){var d=D(w.d),past=wsStatus(s,w)==='past';
  return '<button class="wsrow" data-a="ws" data-id="'+w.id+'"><span class="dt" aria-hidden="true"><b>'+d.getDate()+'</b><span>'+MON3[d.getMonth()]+'</span></span><span class="stack" style="gap:2px;flex:1"><span class="rt" style="font-weight:700;font-size:var(--t16)">'+w.t+'</span><span class="'+(past?'small':'price')+'">'+(past?'Grabación · '+w.min+' min · incluida en tu beta':w.price+(w.access==='paid'?' · no incluido en tu beta':''))+'</span></span><span class="chev" style="color:var(--forest)">'+ic('chev',20)+'</span></button>'}
function audioCard(s,au){
  var on=s.audio.id===au.id, st=on?s.audio.st:'idle', lbl=st==='playing'?'Pausar':st==='loading'?'Cargando':'Reproducir';
  var icon=st==='loading'?'<span class="spin" aria-hidden="true"></span>':ic(st==='playing'?'pause':'play',22,'#FFFCF6');
  var stt=st==='playing'?'Reproduciendo · '+mmss(s.audio.t)+' de '+mmss(au.dur):st==='paused'?'En pausa · '+mmss(s.audio.t)+' de '+mmss(au.dur):st==='loading'?'Cargando…':'Audio · '+mmss(au.dur);
  return '<div class="cov"><span class="art warm"><img class="torn-foot" src="'+IMG[au.img]+'" alt=""><button class="play" data-a="play" data-id="'+au.id+'" aria-label="'+lbl+': '+au.t+'"'+(st==='loading'?' aria-busy="true"':'')+'>'+icon+'</button></span><span class="ti">'+au.t+'</span><span class="st'+(on&&st!=='idle'?' on':'')+'">'+stt+'</span></div>'}
function vSearch(s){
  var q=s.ex.q.trim().toLowerCase(), all=AUDIOS.map(function(a){return{t:a.t,k:'Audio · '+mmss(a.dur),a:'play',id:a.id}}).concat(WORKSHOPS.map(function(w){return{t:w.t,k:'Taller · '+w.min+' min',a:'ws',id:w.id}})).concat([{t:GUIDE.t,k:'Guía · 3 min',a:'guide'}]);
  var res=q?all.filter(function(r){return r.t.toLowerCase().indexOf(q)>-1||norm(r.t).indexOf(norm(q))>-1}):[];
  var out=!q?'<p class="pad small">Busca por tema, por ejemplo «dinero» o «noche».</p>':res.length?'<div class="pad rows">'+res.map(function(r){return'<button class="row" data-a="'+r.a+'" data-id="'+(r.id||'')+'"><span><span class="rt">'+r.t+'</span><span class="rm">'+r.k+'</span></span><span class="chev">'+ic('chev',20)+'</span></button>'}).join('')+'</div>':
    '<div class="empty" role="status"><h2>No encontramos «'+esc(s.ex.q)+'»</h2><p class="meta" style="color:var(--ink)">Prueba con otra palabra.</p><div class="chips">'+['dinero','noche','pausa'].map(function(t){return'<button class="chip" data-a="exq" data-v="'+t+'">'+t+'</button>'}).join('')+'</div><button class="btn sec" data-a="exhome">Ver todo Explorar</button></div>';
  return '<div class="search"><button class="iconbtn round" data-a="exhome" aria-label="Cerrar búsqueda">'+ic('back',22)+'</button><label class="sr" for="q">Buscar en Explorar</label><input id="q" type="search" data-in="q" value="'+esc(s.ex.q)+'" placeholder="Talleres, audios, guías" autocomplete="off"></div><div id="sres">'+out+'</div>';
}
function norm(t){return t.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()}
function vSaved(s){var items=s.ex.saved.map(function(id){return AUDIOS.find(function(a){return a.id===id})}).filter(Boolean);
  return '<div class="sub"><button class="iconbtn round" data-a="exhome" aria-label="Volver">'+ic('back',22)+'</button><h1>Guardados</h1></div>'+(items.length?'<div class="pad rows">'+items.map(function(a){return'<button class="row" data-a="play" data-id="'+a.id+'"><span><span class="rt">'+a.t+'</span><span class="rm">Audio · '+mmss(a.dur)+'</span></span><span class="chev">'+ic('play',20,'#2C4A3A')+'</span></button>'}).join('')+'</div>':'<div class="empty"><h2>Todavía no guardas nada</h2><p class="meta" style="color:var(--ink)">Toca '+'el marcador en un audio para tenerlo aquí.</p></div>')}
function vWorkshop(s,id){var w=WORKSHOPS.find(function(x){return x.id===id}), past=wsStatus(s,w)==='past', res=s.ex.reserved.indexOf(id)>-1;
  var act;
  if(past)act='<p class="notice">Grabación · '+w.min+' min · incluida en tu beta.</p><button class="btn" data-a="oos" data-k="recording">'+ic('play',20,'#FFFCF6')+'Ver la grabación</button>';
  else if(w.access==='paid')act='<div class="notice" role="note"><b>No está incluido en tu beta.</b> Este taller cuesta '+w.price+'. Tu acceso beta incluye los talleres gratis y sus grabaciones.</div><button class="btn sec" data-a="oos" data-k="pay">Ver cómo pagar</button>';
  else if(res)act='<p class="doneline">'+ic('check',20)+'Tienes tu lugar</p><p class="meta">Te avisamos una hora antes.</p><button class="btn quiet" data-a="unreserve" data-id="'+id+'">Cancelar mi lugar</button>';
  else act='<button class="btn" data-a="reserve" data-id="'+id+'">Reservar mi lugar · '+w.price+'</button>';
  return '<div class="sub"><button class="iconbtn round" data-a="exhome" aria-label="Volver">'+ic('back',22)+'</button><h1>'+(past?'Grabación':'Taller en vivo')+'</h1></div><div class="pr-body"><span class="print warm" style="align-self:flex-start"><span class="grain"></span><img src="'+IMG.taller+'" alt="'+w.host+'" style="width:140px;height:120px"></span><h2>'+w.t+'</h2><p style="font-size:var(--t17)">'+w.s+'</p>'+
   '<dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:var(--t16)"><dt class="meta">Cuándo</dt><dd style="margin:0">'+wsWhen(w)+'</dd><dt class="meta">Con</dt><dd style="margin:0">'+w.host+'</dd><dt class="meta">Incluye</dt><dd style="margin:0">25 min de práctica guiada y tiempo para preguntas</dd><dt class="meta">Acceso</dt><dd style="margin:0">'+(past?'Grabación incluida en tu beta':w.access==='paid'?w.price+' · no incluido en tu beta':'Gratis · incluido en tu beta')+'</dd></dl></div>'+dock(act)}
function vPlayer(s){var au=AUDIOS.find(function(a){return a.id===s.audio.id});if(!au)return'';var st=s.audio.st, sv=s.ex.saved.indexOf(au.id)>-1;
  return '<div class="player" role="region" aria-label="Reproductor"><div><p class="pt">'+au.t+'</p><p class="ps">'+(st==='loading'?'Cargando…':(st==='playing'?'Reproduciendo':'En pausa')+' · '+mmss(s.audio.t)+' de '+mmss(au.dur))+' · Voz sintética</p></div>'+
   '<button data-a="save" data-id="'+au.id+'" aria-pressed="'+sv+'" aria-label="'+(sv?'Quitar de guardados':'Guardar')+'">'+ic(sv?'markf':'mark',20,'#FFFCF6')+'</button>'+
   '<button data-a="play" data-id="'+au.id+'" aria-label="'+(st==='playing'?'Pausar':'Reproducir')+'"'+(st==='loading'?' aria-busy="true"':'')+'>'+(st==='loading'?'<span class="spin" aria-hidden="true"></span>':ic(st==='playing'?'pause':'play',20,'#FFFCF6'))+'</button>'+
   '<span class="bar" aria-hidden="true"><i style="width:'+Math.round(s.audio.t/au.dur*100)+'%"></i></span></div>'}

/* Círculos */
function unread(s){return s.threads.filter(function(t){return t.unread&&s.blocked.indexOf(t.with)<0}).length}
/* ---------- Círculos > Descubrir: the REAL circles (migration 0061, shared/circleTopics), photo covers, «Ver círculo» ----------
   id, group, Spanish name, one line and sections come from the product. Nothing here is invented except the cover brief,
   its alt text and its tone, which are PLACEHOLDERS until commissioned or licensed photography replaces them. */
var CIRCLES=[
 {id:'money',g:'area',n:'Claridad financiera',d:'Gastos, deudas, pareja, familia y lo que se siente detrás. No es asesoría financiera.',sec:['Deudas','Dinero en pareja','Familia y dinero','Ahorro','Sueldo y aumentos'],int:'money',tone:['#EFE0D4','#DDBBA4'],
  alt:'Manos sobre una libreta abierta y una taza de café en una mesa de cocina, con luz de la mañana.',brief:'Hands, a notebook and a coffee on a kitchen table; no faces; warm morning light.'},
 {id:'love',g:'area',n:'Amor y relaciones',d:'Parejas, amistades, decir que no y pedir lo que necesitas.',sec:['Pareja','Amistades','Límites','Volver a salir'],int:'love',tone:['#E2ECE5','#BBD3C3'],
  alt:'Dos tazas de café sobre una mesa pequeña, con dos manos cerca una de la otra.',brief:'Two cups on a small cafe table, two hands near each other; no faces.'},
 {id:'work',g:'area',n:'Trabajo y propósito',d:'El trabajo, los cambios y lo que quieres hacer después.',sec:['Cambiar de rumbo','Agotamiento','Volver a trabajar','Jefes y equipos'],int:'work',tone:['#E0E7F2','#BBCBE4'],
  alt:'Un escritorio junto a una ventana con una libreta abierta, una laptop y una planta.',brief:'A home desk by a window: open notebook, laptop, plant; someone mid-work, hands only.'},
 {id:'self',g:'area',n:'Confianza en ti',d:'Decidir sin preguntarle a todo el mundo primero.',sec:['Decidir','Perfeccionismo','Decir que no'],int:'self',tone:['#EEE0EA','#D9BBCD'],
  alt:'Un sendero de tierra que se bifurca entre árboles, visto desde arriba.',brief:'A dirt path forking between trees seen from above; no people.'},
 {id:'health',g:'area',n:'Salud y energía',d:'Descanso, rutinas y cómo es una semana normal. No es consejo médico.',sec:['Sueño','Rutinas','Días sin energía'],int:'health',tone:['#F3EACF','#E3D096'],
  alt:'Una cama con sábanas claras y una taza de té junto a una ventana, con luz suave.',brief:'Light bedding and a tea by a window in soft light; no people.'},
 {id:'family',g:'area',n:'Familia',d:'Madres, suegras, hermanos y la familia que cargas.',sec:['Suegros','Madres e hijas','Hermanos','Fiestas y visitas'],int:'family',tone:['#E6DEF0','#CBBBE0'],
  alt:'Una mesa de comida compartida con varias manos pasando una fuente.',brief:'A shared meal on a table, several hands passing a dish; no faces.'},
 {id:'college',g:'stage',n:'Empezar la universidad',d:'Primer semestre, primera generación, dinero y extrañar casa.',sec:['Primera generación','Dinero y becas','Extrañar casa'],tone:['#E3EBDC','#C5D6B6'],
  alt:'Una mochila, libros y una taza sobre un escritorio pequeño junto a una ventana.',brief:'A backpack, books and a mug on a small desk by a window; no faces.'},
 {id:'job',g:'stage',n:'Primer empleo',d:'Tu primer sueldo, tu primer jefe o jefa, tus primeras decisiones.',sec:['Primer sueldo','Negociar','Primer jefe o jefa'],tone:['#E8E4D7','#D5CDB2'],
  alt:'Una libreta nueva, un gafete y una taza de café sobre una mesa de madera.',brief:'A new notebook, a staff badge and a coffee on a wooden table; no faces.'},
 {id:'baby',g:'stage',n:'Embarazo y maternidad reciente',d:'El embarazo, el primer año y quién eres en medio de todo.',sec:['Embarazo','Sueño del bebé','Volver al trabajo','Posparto'],sens:1,tone:['#F3E5DD','#E7CBBB'],
  alt:'Una cobija tejida pequeña y una taza sobre un sillón, con luz cálida.',brief:'A small knitted blanket and a mug on an armchair in warm light; no people.'},
 {id:'divorce',g:'stage',n:'Divorcio y separación',d:'Antes, durante y después. Lo práctico y lo emocional.',sec:['Dinero y trámites','Hijos','Empezar de nuevo'],sens:1,tone:['#E0E5E8','#BECACF'],
  alt:'Un llavero y una taza sobre una mesa junto a una ventana abierta al amanecer.',brief:'A set of keys and a mug on a table by an open window at dawn; no people.'},
 {id:'care',g:'stage',n:'Cuidar a alguien',d:'Cuidar a mamá o papá, a una pareja, o a una hija o un hijo con necesidades especiales.',sec:['Cuidar a mamá o papá','Repartir con hermanos','Descanso y culpa'],sens:1,tone:['#E8E2DB','#D1C6B9'],
  alt:'Una mano joven sosteniendo una mano mayor sobre una manta de lana.',brief:'A younger hand holding an older hand on a wool blanket; no faces.'}
];
var CC_INTERESTS=[['money','Dinero'],['work','Trabajo'],['love','Pareja y amistades'],['family','Familia'],['self','Confianza en ti'],['health','Descanso y energía']];
var CC_STARTER=['money','love','work','family','self','health'];
function ccById(id){return CIRCLES.find(function(c){return c.id===id})}
function myNames(s){return s.joined.map(function(i){return ccById(i).n})}
/* what the real app does today (suggestedTopicIds): chosen interests -> their circles; none -> the starter set */
function ccSuggested(s){var ids=s.cint.length?CIRCLES.filter(function(c){return c.int&&s.cint.indexOf(c.int)>-1}).map(function(c){return c.id}):CC_STARTER.slice();ids=ids.filter(function(i){return s.joined.indexOf(i)<0});return{ids:ids,fromInterests:s.cint.length>0}}
function ccCover(c,mode){var im=IMG['cv-'+c.id],st='background:linear-gradient(150deg,'+c.tone[0]+','+c.tone[1]+')';
  var inner=im?'<img src="'+im+'" alt="'+(mode==='detail'?esc(c.alt):'')+'" loading="lazy" decoding="async">':'';
  return '<span class="cv cv-'+mode+'" style="'+st+'"'+(mode==='detail'&&!im?' role="img" aria-label="'+esc(c.alt)+'"':' aria-hidden="'+(mode==='detail'&&im?'false':'true')+'"')+'>'+inner+(im?'':'<em class="cv-ph">Foto pendiente</em>')+'</span>'}
function ccDCard(s,c,feat){var j=s.joined.indexOf(c.id)>-1;
  return '<button class="cd '+(feat?'cd-feat':'cd-cmp')+'" data-a="ccview" data-id="'+c.id+'" aria-label="Ver círculo: '+esc(c.n)+(j?'. Ya te uniste':'')+'. '+esc(c.d)+'">'+ccCover(c,feat?'feat':'thumb')+
    '<span class="cd-body"><span class="cd-name">'+esc(c.n)+(j?'<i class="cd-tag">Te uniste</i>':'')+'</span><span class="cd-desc">'+esc(c.d)+'</span><span class="cd-more">Ver círculo'+ic('chev',18)+'</span></span></button>'}
function ccDFilters(s){var f=s.dfilter||'todos',items=[['todos','Todos'],['area','Áreas de la vida'],['stage','Etapas de la vida']];
  return '<div class="cc-filters" role="group" aria-label="Explora por tema">'+items.map(function(x){return '<button class="cc-chip" data-a="ccdf" data-v="'+x[0]+'" aria-pressed="'+(f===x[0])+'"><span>'+x[1]+'</span></button>'}).join('')+'</div>'}
function vCcDiscover(s){var f=s.dfilter||'todos',sg=ccSuggested(s),out='';
  var intLine=s.cint.length?'<p class="cd-int"><span>Tus intereses: '+s.cint.map(function(i){return CC_INTERESTS.find(function(x){return x[0]===i})[1]}).join(', ')+'</span><button class="cd-edit" data-a="ccint" aria-label="Editar tus intereses">Editar</button></p>':'<p class="cd-int"><span>¿Quieres sugerencias?</span><button class="cd-edit" data-a="ccint">Elegir intereses</button></p>';
  if(f==='todos'){
    var sug=sg.ids.map(ccById),rest=CIRCLES.filter(function(c){return sg.ids.indexOf(c.id)<0});
    out=intLine+(sug.length?'<h2 class="cd-h">'+(sg.fromInterests?'Sugeridos para ti':'Para empezar')+'</h2><div class="cdlist" role="list">'+sug.map(function(c,i){return '<div role="listitem">'+ccDCard(s,c,i===0)+'</div>'}).join('')+'</div>':'')+
      (rest.length?'<h2 class="cd-h">'+(sug.length?'Todos los círculos':'Círculos')+'</h2><div class="cdlist" role="list">'+rest.map(function(c){return '<div role="listitem">'+ccDCard(s,c,false)+'</div>'}).join('')+'</div>':'')}
  else{var list=CIRCLES.filter(function(c){return c.g===f});out='<h2 class="cd-h">'+(f==='area'?'Áreas de la vida':'Etapas de la vida')+'</h2><div class="cdlist" role="list">'+list.map(function(c){return '<div role="listitem">'+ccDCard(s,c,false)+'</div>'}).join('')+'</div>'}
  return out+'<p class="cd-foot">Las imágenes son ilustrativas. No muestran a integrantes de los círculos.</p><div class="sr" role="status" aria-live="polite">'+(f==='todos'?'':'Mostrando '+(CIRCLES.filter(function(c){return c.g===f}).length)+' círculos')+'</div>'}
function vCcView(s,id){var c=ccById(id),j=s.joined.indexOf(id)>-1;
  var care=['Solo las mujeres que se unen a un círculo leen sus conversaciones.','Cada publicación y cada respuesta muestra tu nombre o «Anónima». Tú eliges cada vez.','Solo tú ves a qué círculos te uniste.','Puedes salir cuando quieras.'];
  if(c.sens)care.push('Este círculo habla de momentos delicados. Si necesitas ayuda ahora, usa «Buscar ayuda ahora» en Hoy.');
  return '<div class="sub"><button class="iconbtn round" data-a="exhome" aria-label="Volver a Descubrir">'+ic('back',22)+'</button><h1>Círculo</h1></div>'+
   '<div class="pad stack" style="gap:14px;padding-bottom:24px"><div class="cv-wrap">'+ccCover(c,'detail')+'</div><h2 class="cx-nm cc-vn">'+esc(c.n)+'</h2><p class="cc-vd">'+esc(c.d)+'</p>'+
   '<section aria-labelledby="ccs"><h3 id="ccs" class="cc-h3">Lo que se comparte aquí</h3><ul class="cx-chips">'+c.sec.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></section>'+
   '<section aria-labelledby="ccn"><h3 id="ccn" class="cc-h3">Cómo cuidamos este espacio</h3><ul class="cx-how" style="gap:8px">'+care.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></section>'+
   '<p class="cd-foot" style="padding:0">Imagen ilustrativa. No muestra a integrantes del círculo.</p></div>'+
   dock(j?'<p class="saved-note">'+ic('check',16)+'Te uniste. Solo tú lo ves.</p><button class="btn quiet" data-a="ccleave" data-id="'+id+'">Salir del círculo</button>':'<p class="small" style="text-align:center">Únete a este círculo para leer sus conversaciones y participar.</p><button class="btn" data-a="ccjoin" data-id="'+id+'">Unirme</button>')}
function ccSheet(s,sh){var b='';
  if(sh.k==='ccint'){b='<h2 id="shh">Tus intereses</h2><p class="small">Elegir un interés no te une a ningún círculo. Solo sirve para sugerirte por dónde empezar. Se queda en este teléfono.</p><div class="chips" role="group" aria-label="Intereses">'+CC_INTERESTS.map(function(x){var on=sh.sel.indexOf(x[0])>-1;return '<button class="chip" role="checkbox" data-a="ccintt" data-v="'+x[0]+'" aria-checked="'+on+'">'+x[1]+'</button>'}).join('')+'</div><button class="btn" data-a="ccintsave">Guardar</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  return '<div class="scrim" data-a="shclose"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="shh"><span class="grab" aria-hidden="true"></span>'+b+'</div>'}

/* Círculos list: slim sticky top (header that tucks away on scroll down, tabs, topic chips) and one-tap conversation previews */
function ccReplies(s,p){var n=p.r.filter(function(r){return s.blocked.indexOf(r.by)<0}).length;return n===0?'Sin respuestas':n===1?'1 respuesta':n+' respuestas'}
function ccCard(s,p){var m=MEMBERS[p.by]||{n:'Lucía'},nm=p.by==='me'?'Tú':m.n,rep=ccReplies(s,p),rpt=s.reported.indexOf(p.id)>-1;
  var face=p.by==='me'?'<span class="cx-ini" style="width:24px;height:24px;font-size:12px">L</span>':'<img src="'+IMG[m.img]+'" alt="">';
  return '<button class="pv" data-a="thread" data-id="'+p.id+'" aria-label="Conversación: '+esc(p.t)+', '+esc(p.c)+', '+nm+', '+p.ago+', '+rep+(p.photo&&!phHidden(s,p)?', con foto':'')+'">'+
    '<span class="pv-row1"><span class="pv-topic">'+esc(p.c)+'</span><span class="pv-rep">'+(p.photo&&!phHidden(s,p)?'<span class="pv-photo">'+ic('image',16)+'Foto</span>':'')+rep+ic('chev',18)+'</span></span>'+
    '<span class="pv-who">'+face+'<b>'+nm+'</b><span>· '+p.ago+'</span></span>'+
    '<span class="pv-title">'+esc(p.t)+'</span>'+
    '<span class="pv-prev">'+(rpt?'Reportaste esta publicación. El equipo la está revisando.':esc(p.b||'Sin más detalle.'))+'</span></button>'}
function ccFilters(s){var f=s.cfilter||'todos',items=[['todos','Todos']].concat(myNames(s).map(function(x){return[x,x]}));
  return '<div class="cc-filters" role="group" aria-label="Filtrar conversaciones por tema">'+items.map(function(x){return '<button class="cc-chip" data-a="cfilter" data-v="'+esc(x[0])+'" aria-pressed="'+(f===x[0])+'"><span>'+esc(x[1])+'</span></button>'}).join('')+'</div>'}
function vCirculos(s){
  var posts=s.posts.filter(function(p){return s.blocked.indexOf(p.by)<0}), u=unread(s), f=s.cfilter||'todos';
  var head='<header class="top cc" style="align-items:center"><h1>Círculos</h1><div style="display:flex;gap:10px;align-items:center"><button class="iconbtn round" data-a="msgs" aria-label="Mensajes'+(u?', '+u+' sin leer':'')+'">'+ic('chat',22)+(u?'<span class="dotbadge" aria-hidden="true"></span>':'')+'</button><button class="avatarL" data-a="profile" aria-label="Tu perfil">L</button></div></header>'+
    '<nav class="ctabs" aria-label="Círculos"><button data-a="ctab" data-v="mis" aria-pressed="'+(s.ctab==='mis')+'">Mis círculos</button><button data-a="ctab" data-v="desc" aria-pressed="'+(s.ctab==='desc')+'">Descubrir</button><button data-a="ctab" data-v="cx" aria-pressed="'+(s.ctab==='cx')+'">Conexiones</button></nav>';
  var stk=s.ctab==='mis'||s.ctab==='desc';var top='<div class="cc-top'+(stk?' stick':'')+(stk&&s.ccHid?' hid':'')+'" id="cctop">'+head+(s.ctab==='mis'?ccFilters(s):s.ctab==='desc'?ccDFilters(s):'')+'</div>';
  if(s.ctab==='cx')return top+vCx(s);
  if(s.ctab==='desc')return top+'<div class="cd-wrap">'+vCcDiscover(s)+'</div>';
  var list=posts.filter(function(p){return f==='todos'||p.c===f});
  return top+(list.length?'<div class="pvlist" role="list" aria-label="Conversaciones'+(f==='todos'?'':' de '+esc(f))+'">'+list.map(function(p){return '<div role="listitem">'+ccCard(s,p)+'</div>'}).join('')+'</div>':
    '<div class="empty cc-empty"><h2>No hay conversaciones en este tema</h2><p class="meta" style="color:var(--ink)">Cuando alguien comparta algo aquí, lo verás en esta lista.</p><button class="btn sec" data-a="cfilter" data-v="todos">Ver todos los temas</button></div>')+
    '<div class="sr" role="status" aria-live="polite">'+(f==='todos'?'':'Mostrando '+list.length+(list.length===1?' conversación':' conversaciones')+' de '+esc(f))+'</div>';
}
function vThread(s,id){var p=s.posts.find(function(x){return x.id===id});if(!p)return vCirculos(s);var m=MEMBERS[p.by]||{n:'Tú'};
  return '<div class="sub"><button class="iconbtn round" data-a="chome" aria-label="Volver a Círculos">'+ic('back',22)+'</button><h1>'+p.c+'</h1>'+'<button class="iconbtn round" data-a="pmenu" data-id="'+p.id+'" aria-label="Opciones de la publicación">'+ic('more',22)+'</button>'+'</div>'+
   '<div class="pad stack" style="padding-bottom:24px"><div class="who">'+(p.by==='me'?'<span class="nm">Tú</span>':'<button class="nm" data-a="member" data-id="'+p.by+'"><img src="'+IMG[m.img]+'" alt="">'+m.n+'</button>')+'<span>· '+p.ago+'</span></div><h2 style="font-size:var(--t22);line-height:1.3">'+esc(p.t)+'</h2><p style="font-size:var(--t17)">'+esc(p.b)+'</p>'+phAttach(s,p)+
   (s.reported.indexOf(p.id)>-1?'<p class="reported">Reportaste esta publicación. El equipo la está revisando.</p>':'')+
   '<div>'+p.r.filter(function(r){return s.blocked.indexOf(r.by)<0}).map(function(r){var rm=MEMBERS[r.by]||{n:'Tú'};return'<div class="reply"><span class="who"><b style="color:var(--ink)">'+rm.n+'</b></span><p>'+esc(r.t)+'</p></div>'}).join('')+'</div>'+
   '<label class="lbl" for="rp">Responder a '+m.n+'</label><textarea id="rp" data-in="reply" style="min-height:90px" placeholder="Escribe con cuidado. Todo el círculo lo ve.">'+esc(s.replyDraft||'')+'</textarea><button class="btn" data-a="sendreply" data-id="'+p.id+'"'+((s.replyDraft||'').trim()?'':' disabled')+'>Responder</button></div>'}
/* ---------- Photos in posts (PROTOTYPE: nothing is stored or sent; picking, re-encoding and EXIF removal run in this page only) ----------
   Real in this page: type/size/dimension validation, decode check, resize to 1600 px, JPEG re-encode through a canvas (which drops EXIF/GPS),
   the size cap after resize, the viewer, alt text. Simulated: upload progress and its outcomes (reviewer controls), the picker, permissions. */
var PH_MAX=10*1024*1024,PH_LONG=1600,PH_MIN=80,PH_AFTER=1.5*1024*1024;
var PH_OK=['image/jpeg','image/png','image/webp','image/heic','image/heif'];
var PH_SAMPLES=[['ph-portrait','Retrato','800 × 1067'],['ph-landscape','Paisaje','960 × 720'],['ph-square','Cuadrada','800 × 800'],['ph-panorama','Panorámica','1500 × 500'],['ph-tiny','Diminuta','120 × 90']];
var PH_BAD=[['gif','GIF animado','Prueba: tipo no permitido'],['big','Muy grande','Prueba: 12 MB'],['bad','Dañada','Prueba: no se abre']];
var PH_MSG={type:'Ese tipo de archivo no se puede usar. Elige una foto JPEG, PNG, WebP o HEIC.',big:'La foto pesa más de 10 MB. Elige una más ligera.',corrupt:'No pudimos abrir esa imagen. Prueba con otra foto.',small:'La foto es demasiado pequeña. Elige una de al menos 80 px por lado.',net:'No pudimos subir tu foto. Revisa tu conexión.',offline:'Sin conexión. Cuando vuelvas a conectarte podrás reintentar.'};
function phDenied(s){return s.plat==='and'?'Elara no tiene permiso para abrir tus fotos. Puedes dárselo en los ajustes del teléfono.':'Elara no tiene permiso para ver tus fotos. Puedes dárselo en Ajustes.'}
function phHidden(s,p){return s.reported.indexOf(p.id)>-1||(s.photoReported||[]).indexOf(p.id)>-1}
function phSize(b){return b>=1048576?(b/1048576).toFixed(1).replace('.',',')+' MB':Math.max(1,Math.round(b/1024))+' KB'}
function phCheck(m){if(PH_OK.indexOf((m.type||'').toLowerCase())<0)return 'type';if(m.size>PH_MAX)return 'big';return null}
function phLoad(src){return new Promise(function(res,rej){var im=new Image();im.onload=function(){res(im)};im.onerror=function(){rej(new Error('corrupt'))};im.src=src})}
/* decode, check, scale so the longest side is at most 1600 px and re-encode as JPEG through a canvas: the canvas carries pixels only,
   so EXIF (including GPS), maker notes and thumbnails are gone. The app must do the same on the device and the server must re-verify. */
function phProcess(src,meta){return phLoad(src).then(function(im){var w=im.naturalWidth,h=im.naturalHeight;if(!w||!h)throw new Error('corrupt');if(Math.min(w,h)<PH_MIN)throw new Error('small');
  var k=Math.min(1,PH_LONG/Math.max(w,h)),cw=Math.max(1,Math.round(w*k)),ch=Math.max(1,Math.round(h*k)),cv=document.createElement('canvas');cv.width=cw;cv.height=ch;var g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cw,ch);g.drawImage(im,0,0,cw,ch);
  var q=.82,out=cv.toDataURL('image/jpeg',q);while(out.length*.75>PH_AFTER&&q>.4){q-=.1;out=cv.toDataURL('image/jpeg',q)}
  return{src:out,w:cw,h:ch,bytes:Math.round(out.length*.75),from:{w:w,h:h,size:(meta&&meta.size)||0}}})}
function phPostPhoto(p){return p&&p.photo?p.photo:null}
function phAttach(s,p){var ph=p.photo;if(!ph)return'';
  if(phHidden(s,p))return '<p class="ph-hidden" role="note">'+ic('image',18)+'<span>Foto oculta mientras la revisamos.</span></p>';
  var r=Math.max(.8,Math.min(1.78,ph.w/ph.h)),tiny=Math.max(ph.w,ph.h)<260;
  return '<button class="ph-att" data-a="phview" data-id="'+p.id+'" aria-label="'+esc(ph.alt?'Foto: '+ph.alt+'. Abrir la foto':'Foto adjunta. Abrir la foto')+'" style="--r:'+r.toFixed(3)+(tiny?';--nat:'+ph.w+'px':'')+'"><img src="'+ph.src+'" alt="" loading="lazy" decoding="async"></button>'}
function phViewer(s){var v=s.viewer;if(!v)return'';var p=s.posts.find(function(x){return x.id===v.id});if(!p||!p.photo)return'';var ph=p.photo;
  return '<div class="phv" role="dialog" aria-modal="true" aria-label="Foto de la publicación"><div class="phv-bar"><button class="iconbtn round phv-x" data-a="phclose" aria-label="Cerrar la foto">'+ic('x',22)+'</button><button class="phv-z" data-a="phzoom" aria-pressed="'+!!v.z+'">'+(v.z?'Reducir':'Ampliar')+'</button></div>'+
   '<div class="phv-stage'+(v.z?' z':'')+'"><img src="'+ph.src+'" alt="'+esc(ph.alt||'Foto adjunta a la publicación')+'" data-dbl="1"></div><p class="phv-alt">'+(ph.alt?esc(ph.alt):'Sin descripción de la foto.')+'</p></div>'}
function phPicker(s,sh){var den=s.upSim==='denied',ios=s.plat!=='and';
  if(den)return '<h2 id="shh">'+(ios?'Fotos':'Selector de fotos')+'</h2><p class="ph-err" role="alert">'+phDenied(s)+'</p><button class="btn" data-a="phsettings">'+(ios?'Abrir Ajustes':'Abrir ajustes')+'</button><button class="btn quiet" data-a="phback">Volver</button><p class="small">Simulado: no se abre ninguna pantalla del sistema.</p>';
  return '<h2 id="shh">'+(ios?'Fototeca':'Selector de fotos')+'</h2><p class="small">'+(ios?'Elara solo ve las fotos que elijas.':'Selector del sistema: Elara solo recibe la foto que elijas.')+' Simulado en este prototipo: fotos de ejemplo sintéticas.</p>'+
   '<div class="ph-grid" role="group" aria-label="Fotos de ejemplo">'+PH_SAMPLES.map(function(x){return '<button class="ph-tile" data-a="phsample" data-v="'+x[0]+'" aria-label="Foto de ejemplo: '+x[1]+', '+x[2]+'"><img src="'+IMG[x[0]]+'" alt=""><span>'+x[1]+'</span></button>'}).join('')+PH_BAD.map(function(x){return '<button class="ph-tile bad" data-a="phsample" data-v="'+x[0]+'" aria-label="Archivo de prueba: '+x[1]+'. '+x[2]+'"><b aria-hidden="true">!</b><span>'+x[1]+'</span></button>'}).join('')+'</div>'+
   '<label class="opt ph-file"><input type="file" data-in="phfile" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" aria-label="Elegir una foto de tu dispositivo"><span>Elegir de tu dispositivo…</span></label><button class="btn quiet" data-a="phback">Cancelar</button>'}
function composeHTML(s,sh){var c=sh.c||'',t=sh.t||'',p=sh.ph,edit=!!sh.edit;
  if(sh.step==='pick')return phPicker(s,sh);
  var chips=edit?'<p class="lbl">En '+esc(c)+'</p>':'<div class="stack" style="gap:8px"><p class="lbl" id="cl">¿En qué círculo?</p><div class="chips" role="radiogroup" aria-labelledby="cl">'+myNames(s).map(function(x){return'<button class="chip" role="radio" data-a="ccircle" data-v="'+x+'" aria-checked="'+(c===x)+'" aria-pressed="'+(c===x)+'">'+x+'</button>'}).join('')+'</div></div>';
  var row='';
  if(!p)row='<div class="ph-row"><button class="ph-add" data-a="phadd">'+ic('image',22)+'<span>Añadir foto</span></button></div>'+(sh.phErr?'<p class="ph-err" role="alert">'+esc(sh.phErr)+'</p>':'');
  else{var st=p.status,thumb=p.src?'<img src="'+p.src+'" alt="">':'<span class="ph-spin" aria-hidden="true"></span>';
    row='<div class="ph-box" role="group" aria-label="Foto de tu publicación"><div class="ph-thumb">'+thumb+'</div><div class="ph-info"><p class="ph-name">'+esc(p.name||'Foto')+'</p><p class="ph-meta">'+(st==='processing'?'Preparando la foto…':p.bytes?phSize(p.bytes)+' · '+p.w+' × '+p.h:'')+'</p></div>'+
     '<div class="ph-acts">'+(st==='uploading'||st==='processing'?'':'<button class="ph-b" data-a="phreplace">Reemplazar</button>')+(st==='uploading'?'':'<button class="ph-b" data-a="phremove" aria-label="Quitar la foto">Quitar</button>')+'</div></div>';
    if(st==='uploading')row+='<div class="ph-prog"><div class="ph-bar" role="progressbar" aria-label="Subida de la foto" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+p.pct+'"><i id="upbar" style="width:'+p.pct+'%"></i></div><div class="ph-progrow"><p id="uptxt">Subiendo foto, '+p.pct+' %</p><button class="ph-b" data-a="phcancel">Cancelar</button></div></div><div class="sr" id="uplive" role="status" aria-live="polite"></div>';
    if(st==='error')row+='<p class="ph-err" role="alert">'+esc(PH_MSG[p.err]||PH_MSG.net)+'</p><div class="ph-errrow"><button class="ph-b strong" data-a="phretry">Reintentar</button><button class="ph-b" data-a="phremove">Quitar foto</button></div>';
    if(st==='ready'&&p.stripped)row+='<p class="small ph-strip">Quitamos la ubicación de tu foto.</p>';
    if(st==='ready'||st==='error'||st==='uploading')row+='<div class="stack" style="gap:6px"><label class="lbl" for="pha">Describe la foto (opcional)</label><textarea id="pha" data-in="phalt" maxlength="200" style="min-height:60px" aria-describedby="phah">'+esc(p.alt||'')+'</textarea><p class="small" id="phah"><span id="phac">'+(p.alt||'').length+'</span> de 200. Ayuda a quienes usan lector de pantalla a saber qué muestra.</p></div>'}
  var busy=p&&(p.status==='uploading'||p.status==='processing'),bad=p&&p.status==='error',ok=!!(c&&t.trim())&&!busy&&!bad;
  var aud=p?'<p class="ph-aud">Tu foto se verá igual que tu publicación: '+(c?'solo miembros de '+esc(c):'solo miembros del círculo que elijas')+'.</p>':'';
  return '<h2 id="shh">'+(edit?'Editar publicación':'Compartir en un círculo')+'</h2>'+chips+'<label class="lbl" for="ct">Tu pregunta o lo que quieres contar</label><textarea id="ct" data-in="ctext" style="min-height:120px" placeholder="Por ejemplo: ¿cómo le hacen para revisar el saldo sin angustiarse?">'+esc(t)+'</textarea>'+row+
   '<p class="small">Se publica con tu nombre, Lucía. Lo ve solo ese círculo.</p>'+aud+'<button class="btn" data-a="publish"'+(ok?'':' disabled')+'>'+(busy?'Subiendo foto…':edit?'Guardar cambios':'Publicar')+'</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}

/* ---------- Conexiones (Círculos > Conexiones) ----------
   Synthetic, adult, fictional profiles. Matching uses ONLY what a profile shows (name, photo choice, introduction,
   interests, what she seeks). Journal entries and daily answers are never read here (see cxPublic and the privacy check). */
var CX_INT=[['Caminatas','las caminatas',1],['Libros','los libros',1],['Café','el café',0],['Cocinar','cocinar',0],['Música','la música',0],['Yoga','el yoga',0],['Escribir','escribir',0],['Plantas','las plantas',1],['Cine','el cine',0],['Viajar','viajar',0],['Dibujar','dibujar',0],['Bailar','bailar',0]];
var CX_SEEKS={walk:'Busco una compañera de camino.',talk:'Quiero conversar con calma.',practice:'Busco alguien con quien practicar lo que aprendo.',share:'Me gustaría compartir lo que voy aprendiendo.'};
/* the first seven map 1:1 to REPORT_REASONS in the app (harassment, hate, sexual, violence, spam, self_harm, other); the eighth is NEW and needs a decision */
var CX_REASONS=['Acoso o intimidación','Discurso de odio','Contenido sexual','Violencia o amenazas','Spam o estafa','Me preocupa su bienestar','Parece un perfil falso o no es una mujer adulta','Otra razón'];
var CXP={
  xmarina:{n:'Marina', img:'cxmarina', pos:'50% 30%', alt:'Marina sonríe en un parque, con el cabello rizado y la mano apoyada en la mejilla',
    intro:'Estoy aprendiendo a poner límites y hacer espacio para mí.', ints:['Caminatas','Libros'], seeks:'walk', recip:'later',
    reply:'¡Hola, Lucía! Me dio gusto que conectáramos. ¿Cómo va tu semana?', first:'Hola, Lucía. Vi que también te gustan las caminatas. ¿Te animas a una esta semana?'},
  xvaleria:{n:'Valeria', intro:'Reorganizando mis finanzas, una cuenta a la vez.', ints:['Café','Escribir','Cine'], seeks:'talk', recip:'now',
    reply:'Qué bien saber de ti. Yo apenas estoy empezando a escribir un poco cada día.', first:'Hola, Lucía. Me alegra que conectáramos.'},
  xines:{n:'Inés', intro:'Después de los 50 estoy reaprendiendo a descansar.', ints:['Plantas','Yoga','Libros'], seeks:'share', recip:'later',
    reply:'Gracias por escribirme, Lucía. Hoy ando regando las plantas, ¿y tú?', first:'Hola, Lucía. Gracias por conectar.'},
  xluz:{n:'Luz', intro:'Cambié de trabajo y estoy cuidando mis ritmos.', ints:['Música','Cocinar','Caminatas'], seeks:'practice', recip:'now',
    reply:'¡Hola! Yo también estoy buscando ratos para caminar. ¿Cuál es el tuyo?', first:'Hola, Lucía. ¡Qué gusto conectar!'}
};
var CX_ORDER=['xmarina','xvaleria','xines','xluz'];
function cxFresh(){var st={};CX_ORDER.forEach(function(i){st[i]='new'});
  return {introSeen:false, saved:false, visible:false, profile:{n:'Lucía',photo:'initial',intro:'Aprendiendo a mirar mi dinero con calma.',ints:['Caminatas','Escribir','Café'],seeks:'walk'},
    draft:null, st:st, sim:{}, order:CX_ORDER.slice(), live:'', lastPass:null, simReply:true, reports:[], first:false}}
function P(id){return MEMBERS[id]||CXP[id]}
function cxIntInfo(n){for(var i=0;i<CX_INT.length;i++)if(CX_INT[i][0]===n)return CX_INT[i];return[n,n.toLowerCase(),0]}
/* the ONLY data that leaves the account for other people. Never add journal, answer or draft fields here. */
function cxPublic(s){var p=s.cx.profile;return{n:p.n,photo:p.photo,intro:p.intro,ints:p.ints.slice(),seeks:p.seeks}}
function cxDeck(s){return s.cx.order.filter(function(id){return s.cx.st[id]==='new'})}
function cxShared(s,id){var mine=s.cx.profile.ints;return CXP[id].ints.filter(function(x){return mine.indexOf(x)>-1})}
function cxStarter(s,id){var p=CXP[id],sh=cxShared(s,id);
  if(sh.length){var f=cxIntInfo(sh[0]);return 'Hola, '+p.n+'. Vi que a las dos '+(f[2]?'nos gustan ':'nos gusta ')+f[1]+'. ¿Qué es lo que más disfrutas de eso?'}
  return 'Hola, '+p.n+'. Me dio gusto conectar contigo. ¿Cómo va tu semana?'}
function cxThread(s,id){return s.threads.find(function(t){return t.with===id})}
function cxIni(n,sz){return '<span class="cx-ini" aria-hidden="true" style="width:'+sz+'px;height:'+sz+'px;font-size:'+Math.round(sz*.44)+'px">'+esc(n.charAt(0))+'</span>'}
function av(id,sz){var p=P(id);return p.img?'<img src="'+IMG[p.img]+'" alt="" style="width:'+sz+'px;height:'+sz+'px;border-radius:'+sz/2+'px;object-fit:cover;flex:none">':cxIni(p.n,sz)}
function cxChips(ints){return '<ul class="cx-chips">'+ints.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'}
/* the card, as the deck shows it (and, inert, as her own preview) */
function cxCard(p,o){o=o||{};var id=o.id;
  var photo=p.img?'<img class="cx-img" src="'+IMG[p.img]+'" alt="'+esc(p.alt||('Foto de '+p.n))+'" style="object-position:'+(p.pos||'50% 35%')+'">':
    '<div class="cx-ph" role="img" aria-label="'+esc(p.n)+(p.review?': foto en revisión, se muestra la inicial':': sin foto, se muestra la inicial')+'"><span aria-hidden="true">'+esc(p.n.charAt(0))+'</span>'+(p.review?'<em>Foto en revisión</em>':'')+'</div>';
  var nm=o.live?'<h2 class="cx-nm" id="cxn-'+id+'"><button class="cx-name" data-a="cxprof" data-id="'+id+'" aria-label="Ver perfil de '+esc(p.n)+'">'+esc(p.n)+'</button></h2>':'<h2 class="cx-nm">'+esc(p.n)+'</h2>';
  return '<article class="cx-card'+(o.live?' live':'')+(o.enter?' enter':'')+(o.mini?' mini':'')+'"'+(o.live?' tabindex="-1" data-drag="1" data-id="'+id+'" aria-labelledby="cxn-'+id+'" aria-describedby="cxhint"':'')+'>'+
    '<div class="cx-photo">'+photo+(o.live?'<span class="cx-stamp yes" aria-hidden="true">Conectar</span><span class="cx-stamp no" aria-hidden="true">Pasar</span>':'')+'</div>'+
    '<div class="cx-surface"'+(o.live?' data-a="cxprof" data-id="'+id+'"':'')+'>'+nm+'<p class="cx-intro">'+esc(p.intro)+'</p>'+cxChips(p.ints)+
    '<p class="cx-seeks">'+ic('people',22)+'<span>'+esc(CX_SEEKS[p.seeks])+'</span></p></div></article>'}
function cxCardOf(s,id){return cxCard(CXP[id],{live:true,id:id})}
function cxOwnCard(s,d){return cxCard({n:d.n||'Tu nombre',intro:d.intro||'Tu presentación',ints:d.ints,seeks:d.seeks,review:d.photo==='review'},{mini:true})}
var CX_HOW=['Ves un perfil a la vez. Tú decides si conectas o pasas.','Si conectas y ella también, pueden conversar. Si solo conectas tú, queda pendiente y nadie se entera.','Pasar es privado: ella no recibe aviso.','Tu perfil muestra solo lo que elijas aquí. Tu diario y tus respuestas diarias nunca se muestran ni se usan.','Puedes pausar, dejar de conectar, bloquear o reportar cuando quieras.'];
function cxHowList(){return '<ul class="cx-how">'+CX_HOW.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'}

function vCxIntro(s){
  return '<div class="pad stack cx-intro-pg" style="padding-top:20px;padding-bottom:20px"><h2 class="cx-h">Conocer a otras mujeres, con calma</h2><p class="meta" style="color:var(--ink)">Conexiones es una forma de encontrar a alguien con quien compartir el camino. Solo mujeres adultas, solo si las dos quieren.</p>'+cxHowList()+'</div>'+
    dock('<button class="btn" data-a="cxstart">Continuar</button><button class="btn quiet" data-a="cxstart">Saltar introducción</button>')}
function vCxState(h,p,btn,extra){return '<div class="empty cx-empty"><h2>'+h+'</h2><p class="meta" style="color:var(--ink)">'+p+'</p>'+(btn||'')+(extra||'')+'</div>'}
function vCx(s){var c=s.cx;
  if(!c.introSeen)return vCxIntro(s);
  if(!c.saved)return vCxState('Crea tu perfil para empezar','Antes de ver a otras mujeres, eliges cómo apareces. Puedes revisarlo y cambiarlo cuando quieras.','<button class="btn" data-a="cxedit">Crear mi perfil</button>','<button class="btn quiet" data-a="cxhow">Cómo funciona</button>');
  if(!c.visible)return vCxState('No eres visible en Conexiones','No ves perfiles y nadie te ve. Tus conexiones y tus mensajes siguen igual en el icono de mensajes.','<button class="btn" data-a="cxresume">Volver a ser visible</button>','<button class="btn quiet" data-a="cxedit">Ver mi perfil público</button>');
  var deck=cxDeck(s);
  if(!deck.length)return vCxState('Por hoy es todo','Cuando haya mujeres nuevas, las verás aquí. Vuelve mañana. Tus conexiones y mensajes están en el icono de mensajes.','<button class="btn sec" data-a="msgs">Ver mis mensajes</button>');
  var id=deck[0],p=CXP[id],enter=c.shown!==id;c.shown=id;
  return '<div class="cx-body"><div class="cx-introrow"><p>Encuentra a alguien con quien compartir.</p><button class="iconbtn round cx-me" data-a="cxme" aria-label="Opciones de Conexiones">'+ic('more',22)+'</button></div>'+
    '<div class="cx-stage"><span class="cx-layer t" aria-hidden="true"></span><span class="cx-layer b" aria-hidden="true"></span>'+cxCard(CXP[id],{live:true,id:id,enter:enter})+'</div>'+
    '<p id="cxhint" class="sr">Desliza a la derecha para conectar o a la izquierda para pasar. Con teclado, usa las flechas derecha e izquierda. También puedes usar los botones Conectar y Pasar.</p>'+
    '<div class="cx-dock"><div class="cx-acts"><button class="cx-btn out" data-a="cxpass" data-id="'+id+'" aria-label="Pasar, '+p.n+'">'+ic('x',22)+'<span>Pasar</span></button><button class="cx-btn fill" data-a="cxconnect" data-id="'+id+'" aria-label="Conectar con '+p.n+'">'+ic('people',22)+'<span>Conectar</span></button></div><p class="cx-cap">Cuando ambas conectan, pueden conversar.</p></div></div>'}

/* editor: she sees exactly what others will see before she is discoverable */
function vCxEdit(s){var d=s.cx.draft,first=!!(s.view&&s.view.first);
  var photo='<div class="stack" style="gap:8px"><p class="lbl" id="cxpl">Foto</p><div class="stack" role="radiogroup" aria-labelledby="cxpl" style="gap:8px"><button class="opt" role="radio" data-a="cxphoto" data-v="initial" aria-checked="'+(d.photo==='initial')+'">Mi inicial</button><button class="opt" role="radio" data-a="cxphoto" data-v="photo" aria-checked="'+(d.photo==='review')+'">Elegir una foto'+(d.photo==='review'?' · en revisión':'')+'</button></div></div>';
  var ints='<div class="stack" style="gap:8px"><p class="lbl" id="cxil">Lo que te interesa (hasta 5)</p><div class="chips" role="group" aria-labelledby="cxil">'+CX_INT.map(function(x){var on=d.ints.indexOf(x[0])>-1;return '<button class="chip" role="checkbox" data-a="cxint" data-v="'+x[0]+'" aria-checked="'+on+'"'+(!on&&d.ints.length>=5?' disabled':'')+'>'+x[0]+'</button>'}).join('')+'</div></div>';
  var seeks='<div class="stack" style="gap:8px"><p class="lbl" id="cxsl">Lo que buscas</p><div class="stack" role="radiogroup" aria-labelledby="cxsl" style="gap:8px">'+Object.keys(CX_SEEKS).map(function(k){return '<button class="opt" role="radio" data-a="cxseek" data-v="'+k+'" aria-checked="'+(d.seeks===k)+'">'+CX_SEEKS[k]+'</button>'}).join('')+'</div></div>';
  var ok=cxDraftOk(d);
  return '<div class="sub"><button class="iconbtn round" data-a="exhome" aria-label="Volver">'+ic('back',22)+'</button><h1>Tu perfil en Conexiones</h1></div>'+
    '<div class="pad stack cx-edit" style="padding-bottom:24px;gap:18px"><section class="stack" style="gap:8px" aria-labelledby="cxpv"><h2 id="cxpv" class="cx-lbl">Esto verán otras mujeres</h2><div id="cxprev" class="cx-prev">'+cxOwnCard(s,d)+'</div></section>'+
    '<div class="stack" style="gap:8px"><label class="lbl" for="cxn">Primer nombre</label><input id="cxn" type="text" data-in="cxname" maxlength="24" autocomplete="off" value="'+esc(d.n)+'"><p class="small">Solo tu primer nombre.</p></div>'+photo+
    '<div class="stack" style="gap:8px"><label class="lbl" for="cxi">Presentación</label><textarea id="cxi" data-in="cxintro" maxlength="120" style="min-height:84px">'+esc(d.intro)+'</textarea><p class="small" id="cxic">'+d.intro.length+' de 120. Escribe solo lo que quieras que lea otra mujer.</p></div>'+ints+seeks+
    '<div class="cx-vis"><div><p class="lbl" id="cxvl">Ser visible en Conexiones</p><p class="small">Si lo apagas, no ves perfiles y nadie te ve. Tus mensajes siguen igual.</p></div><button class="cx-sw" role="switch" data-a="cxvis" aria-checked="'+d.vis+'" aria-labelledby="cxvl"><i></i></button></div>'+
    '<p class="notice" role="note">Solo ven tu primer nombre, tu foto, lo que escribas aquí y lo que elijas. Tu diario y tus respuestas diarias nunca aparecen ni se usan para encontrarte con alguien.</p></div>'+
    dock('<button class="btn" data-a="cxsave"'+(ok?'':' disabled')+'>'+(first?'Guardar y empezar':'Guardar')+'</button>')}
function cxDraftOk(d){return !!d.n.trim()&&d.ints.length>=1&&d.ints.length<=5&&!!d.seeks}
function vCxProf(s,id){var p=CXP[id],st=s.cx.st[id];
  var photo=p.img?'<img class="cx-img" src="'+IMG[p.img]+'" alt="'+esc(p.alt||'Foto de '+p.n)+'" style="object-position:'+(p.pos||'50% 35%')+'">':'<div class="cx-ph" role="img" aria-label="'+p.n+': sin foto, se muestra la inicial"><span aria-hidden="true">'+p.n.charAt(0)+'</span></div>';
  var sh=cxShared(s,id),status={new:'',pending:'Conectaste. Esperando a que '+p.n+' también conecte.',matched:'Las dos conectaron. Ya pueden conversar.',passed:'Pasaste. Es privado.',withdrawn:'Retiraste tu interés.'}[st]||'';
  var act=st==='new'?'<div class="cx-acts"><button class="cx-btn out" data-a="cxpass" data-id="'+id+'" aria-label="Pasar, '+p.n+'">'+ic('x',22)+'<span>Pasar</span></button><button class="cx-btn fill" data-a="cxconnect" data-id="'+id+'" aria-label="Conectar con '+p.n+'">'+ic('people',22)+'<span>Conectar</span></button></div>':
    st==='pending'?'<button class="btn sec" data-a="cxwithdraw" data-id="'+id+'">Retirar mi interés</button>':st==='matched'?'<button class="btn" data-a="cxdm" data-id="'+id+'">'+(cxThread(s,id)&&cxThread(s,id).m.length?'Abrir conversación':'Enviar un saludo')+'</button>':'';
  return '<div class="sub"><button class="iconbtn round" data-a="exhome" aria-label="Volver">'+ic('back',22)+'</button><h1>Perfil de '+p.n+'</h1><button class="iconbtn round" data-a="cxmenu" data-id="'+id+'" aria-label="Opciones del perfil de '+p.n+'">'+ic('more',22)+'</button></div>'+
    '<div class="pad stack" style="gap:14px;padding-bottom:24px"><div class="cx-bigph">'+photo+'</div><h2 class="cx-nm" style="margin-top:2px">'+p.n+'</h2><p class="cx-intro" style="font-size:var(--t17)">'+esc(p.intro)+'</p>'+
    '<div><p class="lbl" style="margin-bottom:6px">Le interesa</p>'+cxChips(p.ints)+'</div><div><p class="lbl" style="margin-bottom:6px">Lo que busca</p><p class="cx-seeks">'+ic('people',22)+'<span>'+esc(CX_SEEKS[p.seeks])+'</span></p></div>'+
    (sh.length&&s.cx.visible?'<p class="meta">En común contigo: '+sh.join(', ')+'.</p>':'')+(status?'<p class="cx-status" role="status">'+status+'</p>':'')+'</div>'+(act?dock(act):'')}

/* inbox: the existing message icon. Circle DMs and Conexiones live here side by side */
function vMsgs(s){var tab=s.inbox||'conv',th=s.threads.filter(function(t){return s.blocked.indexOf(t.with)<0});
  var conv=th.filter(function(t){return !(t.cx&&!t.m.length)}),neu=th.filter(function(t){return t.cx&&!t.m.length}),pend=s.cx.order.filter(function(id){return s.cx.st[id]==='pending'});
  var nu=neu.some(function(t){return t.unread}),cu=conv.some(function(t){return t.unread});
  var pills=[['conv','Conversaciones',cu],['new','Nuevas',nu],['pend','Pendientes',false]];
  var seg='<div class="cx-seg" role="tablist" aria-label="Mensajes">'+pills.map(function(x){return '<button role="tab" data-a="inbox" data-v="'+x[0]+'" aria-selected="'+(tab===x[0])+'">'+x[1]+(x[2]?'<i class="cx-dot" aria-label="con novedades"></i>':'')+'</button>'}).join('')+'</div>';
  var rows=function(list,mode){return list.map(function(t){var m=P(t.with),last=t.m[t.m.length-1];
    return '<button class="row" data-a="'+(t.cx?'cxdm':'dm')+'" data-id="'+t.with+'">'+av(t.with,44)+'<span style="flex:1"><span class="rt">'+m.n+(t.unread?' <span class="tag dev" style="margin-left:4px">Nuevo</span>':'')+'</span><span class="rm clamp">'+(last?(last.me?'Tú: ':'')+esc(last.t):'Conectaron. Escribe tú o espera su saludo.')+'</span></span><span class="chev">'+ic('chev',20)+'</span></button>'}).join('')};
  var body;
  if(tab==='conv')body=conv.length?rows(conv):'<p class="meta cx-none">Aún no tienes conversaciones. Cuando conectes con alguien, aparecerá aquí.</p>';
  else if(tab==='new')body=neu.length?rows(neu):'<p class="meta cx-none">No hay conexiones nuevas por ahora.</p>';
  else body=pend.length?pend.map(function(id){var p=CXP[id];return '<div class="row cx-pend">'+av(id,44)+'<span style="flex:1"><span class="rt">'+p.n+'</span><span class="rm">Esperando a que ella también conecte.</span></span><button class="btn quiet" data-a="cxwithdraw" data-id="'+id+'" style="width:auto;min-height:44px;padding:0 6px">Retirar</button></div>'}).join(''):'<p class="meta cx-none">No tienes interés pendiente.</p>';
  return '<div class="sub"><button class="iconbtn round" data-a="chome" aria-label="Volver a Círculos">'+ic('back',22)+'</button><h1>Mensajes</h1></div><div class="pad" style="display:flex;flex-direction:column;gap:12px">'+seg+'<div class="rows" role="tabpanel">'+body+'</div></div>'}
function vDM(s,who){var t=s.threads.find(function(x){return x.with===who}),m=P(who);if(!t){t={with:who,m:[]};s.threads.push(t)}t.unread=false;
  var cx=!!t.cx,menu=cx?'<button class="iconbtn round" data-a="cxmenu" data-id="'+who+'" aria-label="Opciones de la conversación con '+m.n+'">'+ic('more',22)+'</button>':'<button class="iconbtn round" data-a="member" data-id="'+who+'" aria-label="Ver perfil de '+m.n+'">'+ic('more',22)+'</button>';
  var bubs=t.m.map(function(x){return '<p class="bub '+(x.me?'me':'them')+'">'+esc(x.t)+(x.sim?'<span class="cx-simtag">Respuesta simulada</span>':'')+'</p>'}).join('');
  return '<div class="sub"><button class="iconbtn round" data-a="'+(cx?'exhome':'msgs')+'" aria-label="'+(cx?'Volver':'Volver a Mensajes')+'">'+ic('back',22)+'</button><h1>'+m.n+'</h1>'+menu+'</div>'+
    '<div class="pad cx-chat" style="display:flex;flex-direction:column;gap:10px;padding-bottom:12px">'+(cx?'<p class="cx-safe" role="note">Cuídate: no compartas tu dirección, tu teléfono ni datos del banco con alguien que apenas conoces.</p>':'')+(t.m.length?'':'<p class="small">'+(cx?'Las dos conectaron. Cualquiera de las dos puede escribir primero.':'Empieza la conversación con '+m.n+'.')+'</p>')+bubs+'</div>'+
    '<div class="cx-compose">'+(s.dmStarter?'<p class="cx-sug" id="cxsug">Sugerencia según lo que comparten. Edítala o bórrala: no se envía sola.</p>':'')+'<label class="sr" for="dmx">Mensaje para '+m.n+'</label><div style="display:flex;gap:8px;align-items:flex-end"><textarea id="dmx" data-in="dm" style="min-height:52px;flex:1" placeholder="Escribe un mensaje"'+(s.dmStarter?' aria-describedby="cxsug"':'')+'>'+esc(s.dmDraft||'')+'</textarea><button class="iconbtn round" data-a="senddm" data-id="'+who+'" aria-label="Enviar"'+((s.dmDraft||'').trim()?'':' disabled')+' style="background:var(--forest);color:var(--onForest);border-color:var(--forest)">'+ic('send',20)+'</button></div></div>'}

/* sheets that belong to Conexiones */
function cxSheet(s,sh){var b='',id=sh.id,p=id?CXP[id]:null;
  if(sh.k==='cxme'){b='<h2 id="shh">Conexiones</h2><button class="opt" data-a="cxedit">Mi perfil público</button><button class="opt" data-a="cxhow">Cómo funciona</button>'+(s.cx.lastPass&&s.cx.st[s.cx.lastPass]==='passed'?'<button class="opt" data-a="cxundopass">Deshacer el último pase</button>':'')+'<button class="opt" data-a="cxpausea">Pausar Conexiones</button><button class="btn quiet" data-a="shclose">Cerrar</button>'}
  else if(sh.k==='cxhow'){b='<h2 id="shh">Cómo funciona Conexiones</h2>'+cxHowList()+'<button class="btn sec" data-a="shclose">Entendido</button>'}
  else if(sh.k==='cxpause'){b='<h2 id="shh">¿Pausar Conexiones?</h2><p style="font-size:var(--t16)">Dejarás de ser visible y de ver perfiles. Tus conexiones y tus mensajes siguen igual. Puedes volver cuando quieras.</p><button class="btn" data-a="cxdopause">Pausar</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='cxphoto'){b='<h2 id="shh">Elegir una foto</h2><p style="font-size:var(--t16)">Aquí elegirías una foto de tu galería. Antes de mostrarse, el equipo de Elara la revisa. Mientras tanto, otras mujeres ven tu inicial.</p><p class="small">Simulado: no se elige ninguna foto en este prototipo.</p><button class="btn" data-a="cxphotook">Entendido</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='cxmenu'){var st=s.cx.st[id];b='<h2 id="shh">'+p.n+'</h2>'+(st==='matched'?'<button class="opt" data-a="cxunm" data-id="'+id+'">Dejar de conectar</button>':'')+(st==='pending'?'<button class="opt" data-a="cxwithdraw" data-id="'+id+'">Retirar mi interés</button>':'')+'<button class="opt" data-a="cxrep" data-id="'+id+'">Reportar a '+p.n+'</button><button class="opt danger" data-a="cxblk" data-id="'+id+'">Bloquear a '+p.n+'</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='cxunm'){b='<h2 id="shh">¿Dejar de conectar con '+p.n+'?</h2><p style="font-size:var(--t16)">Se cierra la conversación para las dos. '+p.n+' no recibe aviso. Si cambias de opinión, no volverán a aparecer una a la otra.</p><button class="btn" data-a="cxdounm" data-id="'+id+'" style="background:#8A2A12">Dejar de conectar</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='cxblk'){b='<h2 id="shh">¿Bloquear a '+p.n+'?</h2><p style="font-size:var(--t16)">No verás su perfil ni sus mensajes, y ella no verá el tuyo. '+p.n+' no recibe aviso.</p><button class="btn" data-a="cxdoblk" data-id="'+id+'" style="background:#8A2A12">Bloquear</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='cxrep'){b='<h2 id="shh">¿Qué está pasando?</h2><p class="meta" style="color:var(--ink)">Tu reporte es privado. '+p.n+' no sabrá que fuiste tú. Lo revisa el equipo de Elara.</p><div class="stack" role="radiogroup" aria-labelledby="shh" style="gap:8px">'+CX_REASONS.map(function(r){return '<button class="opt" role="radio" data-a="cxreason" data-v="'+r+'" aria-checked="'+(sh.reason===r)+'">'+r+'</button>'}).join('')+'</div><button class="btn" data-a="cxsend" data-id="'+id+'"'+(sh.reason?'':' disabled')+'>Enviar reporte</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='cxmatch'){
    return '<div class="scrim" data-a="cxmatchclose"></div><div class="cx-match" role="dialog" aria-modal="true" aria-labelledby="mh"><div class="cx-pair" aria-hidden="true"><span class="cx-pl b"></span><span class="cx-pl t"></span><span class="cx-pa l">'+cxIni('Lucía',84)+'</span><span class="cx-pa r">'+(p.img?'<img src="'+IMG[p.img]+'" alt="" style="width:84px;height:84px;border-radius:42px;object-fit:cover">':cxIni(p.n,84))+'</span></div><h2 id="mh">Las dos conectaron.</h2><p style="font-size:var(--t16)">'+p.n+' y tú pueden conversar. Cualquiera de las dos puede escribir primero.</p><button class="btn" data-a="cxgreet" data-id="'+id+'">Enviar un saludo</button><button class="btn sec" data-a="cxmatchclose">Seguir descubriendo</button></div>'}
  return '<div class="scrim" data-a="shclose"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="shh"><span class="grab" aria-hidden="true"></span>'+b+'</div>'}

/* named starting points for the harness, the side-by-side page and the tests */
function cxPreset(s,name){var c=s.cx;s.tab='circulos';s.ctab='cx';s.view=null;s.sheet=null;s.viewer=null;
  var ready=function(){c.introSeen=true;c.saved=true;c.visible=true};
  var conn=function(id,st){c.st[id]=st;if(st==='matched'&&!cxThread(s,id))s.threads.push({with:id,cx:true,m:[],unread:true})};
  if(name==='intro'){}
  else if(name==='edit'){c.introSeen=true;c.draft=cxDraftOf(s);s.view={k:'cxedit',first:true}}
  else if(name==='deck'){ready()}
  else if(name==='mid'){ready();conn('xmarina','pending')}
  else if(name==='match'){ready();conn('xmarina','pending');conn('xvaleria','matched');s.sheet={k:'cxmatch',id:'xvaleria'}}
  else if(name==='active'){ready();conn('xmarina','pending');conn('xvaleria','matched')}
  else if(name==='inbox'){ready();conn('xmarina','pending');conn('xvaleria','matched');s.view={k:'msgs'};s.inbox='new'}
  else if(name==='chat'){ready();conn('xmarina','pending');conn('xvaleria','matched');s.view={k:'dm',id:'xvaleria'};s.dmDraft=cxStarter(s,'xvaleria');s.dmStarter=true}
  else if(name==='talk'){ready();conn('xvaleria','matched');var t=cxThread(s,'xvaleria');t.unread=false;t.m=[{me:true,t:cxStarter(s,'xvaleria')},{me:false,t:CXP.xvaleria.reply,sim:true}];s.view={k:'dm',id:'xvaleria'}}
  else if(name==='prof'){ready();s.view={k:'cxprof',id:'xmarina'}}
  else if(name==='hidden'){c.introSeen=true;c.saved=true;c.visible=false}
  else if(name==='empty'){ready();CX_ORDER.forEach(function(i){c.st[i]=i==='xmarina'?'pending':'passed'})}
  else if(name==='menu'){ready();s.sheet={k:'cxme'}}
  else if(name==='list'){s.ctab='mis'}
  else if(name==='desc'){s.ctab='desc'}
  else if(name==='descareas'){s.ctab='desc';s.dfilter='area'}
  else if(name==='cview'){s.ctab='desc';s.view={k:'ccview',id:'love'}}
  else if(name==='cmp'||name==='cmppick'||name==='cmpphoto'||name==='cmpup'||name==='cmperr'){s.ctab='mis';s.sheet={k:'compose',c:'Claridad financiera',t:'¿Cómo le hacen para llevar sus cuentas sin angustia?'};
    var PH0={src:IMG['ph-landscape'],w:960,h:720,bytes:48000,name:'paisaje.jpg',alt:'',stripped:true,token:1};
    if(name==='cmppick')s.sheet.step='pick';
    if(name==='cmpphoto')s.sheet.ph=Object.assign({status:'ready'},PH0);
    if(name==='cmpup')s.sheet.ph=Object.assign({status:'uploading',pct:60,_ann:2},PH0);
    if(name==='cmperr')s.sheet.ph=Object.assign({status:'error',err:'net',pct:60},PH0)}
  else if(name==='thread'){s.ctab='mis';s.view={k:'thread',id:'p2'}}
  else if(name==='threadportrait'){s.ctab='mis';s.view={k:'thread',id:'p3'}}
  else if(name==='viewer'){s.ctab='mis';s.view={k:'thread',id:'p2'};s.viewer={id:'p2',z:false}}
  return s}
function cxDraftOf(s){var p=s.cx.profile;return{n:p.n,photo:p.photo,intro:p.intro,ints:p.ints.slice(),seeks:p.seeks,vis:s.cx.saved?s.cx.visible:false}}

/* sheets */
function sheetHTML(s){var sh=s.sheet;if(!sh)return'';if(/^cx/.test(sh.k))return cxSheet(s,sh);if(/^cc/.test(sh.k))return ccSheet(s,sh);var b='';
  if(sh.k==='member'){var m=MEMBERS[sh.id];b='<div style="display:flex;gap:14px;align-items:center"><img src="'+IMG[m.img]+'" alt="" style="width:64px;height:64px;border-radius:32px"><div><h2 id="shh">'+m.n+'</h2><p class="meta">En Elara desde '+m.since+'</p></div></div><p class="meta" style="color:var(--ink)">Círculos: '+m.circles.join(' · ')+'</p>'+
    '<button class="btn" data-a="dm" data-id="'+sh.id+'">'+ic('chat',20)+'Enviar mensaje</button><button class="opt" data-a="report" data-id="'+sh.id+'" data-who="1">Reportar a '+m.n+'</button><button class="opt danger" data-a="block" data-id="'+sh.id+'">Bloquear a '+m.n+'</button>'}
  else if(sh.k==='pmenu'){var p=s.posts.find(function(x){return x.id===sh.id}),pm=MEMBERS[p.by];
    if(p.by==='me')b='<h2 id="shh">Tu publicación</h2><button class="opt" data-a="pedit" data-id="'+p.id+'">Editar publicación</button>'+(p.photo?'<button class="opt" data-a="pdelphoto" data-id="'+p.id+'">Quitar la foto</button>':'')+'<button class="opt danger" data-a="pdel" data-id="'+p.id+'">Eliminar publicación</button><button class="btn quiet" data-a="shclose">Cancelar</button>';
    else b='<h2 id="shh">Opciones</h2><button class="opt" data-a="report" data-id="'+p.id+'">Reportar esta publicación</button>'+(p.photo&&!phHidden(s,p)?'<button class="opt" data-a="report" data-id="'+p.id+'" data-photo="1">Reportar la foto</button>':'')+'<button class="opt danger" data-a="block" data-id="'+p.by+'">Bloquear a '+pm.n+'</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='pdel'){b='<h2 id="shh">¿Eliminar esta publicación?</h2><p style="font-size:var(--t16)">Se borra la publicación, sus respuestas y su foto. No se puede deshacer.</p><button class="btn" data-a="pdodel" data-id="'+sh.id+'" style="background:#8A2A12">Eliminar</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='report'){var R=['Me hace sentir insegura','Acoso o insultos','Spam o venta','Información falsa sobre dinero','Imagen inapropiada o que me incomoda','Otra razón'];if(sh.photo)R=['Imagen inapropiada o que me incomoda','Me hace sentir insegura','Otra razón'];b='<h2 id="shh">'+(sh.photo?'¿Qué pasa con la foto?':'¿Qué está pasando?')+'</h2><p class="meta" style="color:var(--ink)">Tu reporte es privado. '+(sh.who?MEMBERS[sh.id].n:'Quien publicó')+' no sabrá que fuiste tú.'+(sh.photo?' Mientras la revisamos, no verás la foto.':'')+'</p><div class="stack" role="radiogroup" aria-labelledby="shh" style="gap:8px">'+R.map(function(r){return'<button class="opt" role="radio" data-a="reason" data-v="'+r+'" aria-checked="'+(sh.reason===r)+'">'+r+'</button>'}).join('')+'</div><button class="btn" data-a="sendreport"'+(sh.reason?'':' disabled')+'>Enviar reporte</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='block'){var bm=MEMBERS[sh.id];b='<h2 id="shh">¿Bloquear a '+bm.n+'?</h2><p style="font-size:var(--t16)">Dejarás de ver sus publicaciones, respuestas y mensajes. '+bm.n+' no recibe aviso.</p><button class="btn" data-a="doblock" data-id="'+sh.id+'" style="background:#8A2A12">Bloquear</button><button class="btn quiet" data-a="shclose">Cancelar</button>'}
  else if(sh.k==='compose'){b=composeHTML(s,sh)}
  else if(sh.k==='opp'){var oo=OPPS.find(function(x){return x.id===sh.id});b='<div class="sheethead"><h2 id="shh">Esto es un ejemplo</h2><button class="iconbtn round sx" data-a="shclose" aria-label="Cerrar">'+ic('x',22)+'</button></div><p style="font-size:var(--t16)"><b>'+oo.role+' · '+oo.co+'</b></p><p style="font-size:var(--t16)">Esta oportunidad es ficticia: no acepta postulaciones y no tiene enlace.</p><button class="btn sec" data-a="shclose">Entendido</button>'}
  else if(sh.k==='switch'){var sw=AREAS.find(function(x){return x.id===sh.id});b='<h2 id="shh">¿Cambiar a '+sw.t+'?</h2><p style="font-size:var(--t16)">Tu camino actual, Claridad financiera, queda en pausa y guardamos todo tu avance. Puedes volver cuando quieras.</p><button class="btn" data-a="swconfirm" data-id="'+sh.id+'">Sí, cambiar de camino</button><button class="btn quiet" data-a="shclose">Seguir con Claridad financiera</button>'}
  else if(sh.k==='oos'){var O={clarity:['Ver dónde estás','Abre tu foto de las seis áreas. Se revisa en el pase de Hoy, no en este.'],help:['Buscar ayuda ahora','Abre las líneas de ayuda de tu país. Debe abrirse en un toque, desde cualquier pantalla de Hoy.'],revisit:['Lo que guardaste aquí','Muestra las respuestas y el recuerdo de cada día de ese lugar.'],recording:['Grabación','Abre el video de la grabación con subtítulos.'],pay:['Pago','La pantalla de pago es de la app nativa. Antes de llegar ahí, la persona ya vio el precio y que no está incluido en su beta.'],profile:['Tu perfil','Abre tu perfil y ajustes. Fuera de este pase.']}[sh.id];
    b='<h2 id="shh">'+O[0]+'</h2><p style="font-size:var(--t16)">'+O[1]+'</p><p class="small">Fuera de este pase de diseño. El comportamiento esperado está en la lista de entrega.</p><button class="btn sec" data-a="shclose">Entendido</button>'}
  return '<div class="scrim" data-a="shclose"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="shh"><span class="grab" aria-hidden="true"></span>'+b+'</div>'}

/* ---------- instance ---------- */
/* ---------- reference devices. These are examples: the real app reads safe areas, system bars and keyboard
   from the OS (iOS safeAreaInsets / keyboard frame; Android WindowInsets: systemBars, ime), never from these numbers. ---------- */
var DEV={ios15:{p:'ios',w:393,h:852,sat:63,sbh:58,app:49,inset:34,island:1,home:1,kb:291},
  iosse:{p:'ios',w:375,h:667,sat:28,sbh:20,app:49,inset:0,island:0,home:0,kb:260},
  ios320:{p:'ios',w:320,h:568,sat:28,sbh:20,app:49,inset:0,island:0,home:0,kb:253},
  pixel8:{p:'and',w:412,h:915,sat:44,sbh:36,app:80,kb:280},
  andsm:{p:'and',w:360,h:640,sat:36,sbh:28,app:80,kb:260}};
var CURD=DEV.ios15;
function devVars(s){var d=DEV[s.dev]||DEV.ios15;var inset=d.p==='and'?(s.navmode==='buttons'?48:24):d.inset;return{d:d,sat:d.sat,sbh:d.sbh,inset:inset,nav:d.app+inset,kb:s.kb?d.kb:0}}
function sysnavHTML(s){if(s.plat!=='and'||s.navmode!=='buttons')return'';
  return '<div class="sysnav" role="group" aria-label="Barra de navegación del sistema (simulada)"><button data-a="sysback" aria-label="Atrás"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 4v16L5 12z" fill="currentColor"/></svg></button><button data-a="syshome" aria-label="Inicio"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button><button data-a="sysrecents" aria-label="Recientes"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.4"/></svg></button></div>'}
function kbdHTML(s){return s.kb?'<div class="kbd" aria-hidden="true"><span>Teclado simulado</span>'+new Array(31).join('<i></i>')+'</div>':''}
function fabHTML(s){if(s.tab!=='circulos'||s.view||s.ctab!=='mis')return'';return '<button class="fab" data-a="compose" aria-label="Compartir en un círculo">'+ic('plus',24)+'</button>'}
function exOffHTML(){return '<div class="warm"><header class="exhead torn-foot"><h1>Explorar</h1></header></div><div class="pad stack" style="padding-top:18px"><div class="notice" role="note"><b>Explorar todavía no está abierto en la beta.</b> Los talleres, audios y guías llegarán más adelante. Tu camino de hoy sigue en Hoy.</div></div>'+dock('<button class="btn" data-a="home">Volver a Hoy</button>')}
function App(root,s,opt){this.root=root;this.s=s;this.opt=opt||{};this.timer=null;var me=this;
  if(!this.opt.inert){root.addEventListener('click',function(e){var el=e.target.closest('[data-a]');if(!el||!root.contains(el)||el.disabled)return;e.preventDefault();me.act(el.dataset.a,el.dataset,el)});
    root.addEventListener('input',function(e){var el=e.target.closest('[data-in]');if(el)me.input(el.dataset.in,el.value,el)});
    root.addEventListener('change',function(e){var el=e.target.closest('[data-in]');if(el&&el.tagName==='SELECT')me.input(el.dataset.in,el.value,el);if(el&&el.type==='file'&&el.files&&el.files[0])me.phFile(el.files[0])});
    root.addEventListener('dblclick',function(e){if(e.target.closest&&e.target.closest('[data-dbl]')&&me.s.viewer){me.s.viewer.z=!me.s.viewer.z;me.render('.phv-x')}});
    var vy=null;root.addEventListener('pointerdown',function(e){if(e.target.closest&&e.target.closest('.phv-stage')&&me.s.viewer&&!me.s.viewer.z)vy={x:e.clientX,y:e.clientY}});root.addEventListener('pointerup',function(e){if(vy&&me.s.viewer){var dy=e.clientY-vy.y,dx=e.clientX-vy.x;vy=null;if(dy>90&&Math.abs(dx)<70)me.back()}else vy=null});
    root.addEventListener('focusin',function(e){var el=e.target;if(me.opt.autokb&&el.matches&&el.matches('textarea,input[type=text],input[type=search]')&&!me.s.kb&&el.id){me.s.kb=true;me.render('#'+el.id)}});
    root.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();me.back();return}
      if(e.key==='Tab'&&me.s.sheet){var sh=root.querySelector('.sheet');if(!sh)return;var f=[].slice.call(sh.querySelectorAll('button,[href],select,textarea,input,[tabindex]:not([tabindex="-1"])')).filter(function(x){return !x.disabled});if(!f.length)return;var first=f[0],last=f[f.length-1],a=document.activeElement;if(e.shiftKey&&(a===first||!sh.contains(a))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(a===last||!sh.contains(a))){e.preventDefault();first.focus()}}
      var cd=e.target.closest&&e.target.closest('.cx-card[data-drag]');if(cd&&e.target===cd){if(e.key==='ArrowRight'){e.preventDefault();me.cxDecide(cd.dataset.id,'yes')}else if(e.key==='ArrowLeft'){e.preventDefault();me.cxDecide(cd.dataset.id,'no')}}});
    /* the card follows the finger with a slight tilt and settles; every swipe has a button, and reduced motion drops the tilt */
    root.addEventListener('pointerdown',function(e){var c=e.target.closest&&e.target.closest('.cx-card[data-drag]');if(!c||(e.button>0)||e.target.closest('button'))return;me.dr={c:c,x:e.clientX,y:e.clientY,dx:0,moved:false,id:c.dataset.id,pid:e.pointerId}});
    root.addEventListener('pointermove',function(e){var d=me.dr;if(!d)return;var dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.abs(dx)<8)return;if(!d.moved){try{d.c.setPointerCapture(d.pid)}catch(x){}}d.moved=true;d.dx=dx;me._moved=true;var nm=reducedMotion(me.s);d.c.style.transition='none';
      d.c.style.transform='translate('+dx+'px,'+(nm?0:Math.round(dy*.12))+'px)'+(nm?'':' rotate('+(dx/20).toFixed(2)+'deg)');var a=Math.min(1,Math.abs(dx)/90);d.c.style.setProperty('--yes',dx>0?a.toFixed(2):0);d.c.style.setProperty('--no',dx<0?a.toFixed(2):0);if(d.c.parentNode)d.c.parentNode.style.setProperty('--lay',(1-Math.min(.7,Math.abs(dx)/130)).toFixed(2))});
    var endDrag=function(){var d=me.dr;if(!d)return;me.dr=null;var dx=d.dx,c=d.c,nm=reducedMotion(me.s);if(!d.moved){me._moved=false;return}
      if(Math.abs(dx)>=90){var dir=dx>0?'yes':'no';if(nm)me.cxDecide(d.id,dir);else{c.style.transition='transform .22s ease-in,opacity .22s';c.style.transform='translate('+(dx>0?1:-1)*Math.round(c.offsetWidth*1.1)+'px,0) rotate('+(dx>0?14:-14)+'deg)';c.style.opacity='0';setTimeout(function(){me.cxDecide(d.id,dir)},me.opt.fastLoad?10:210)}}
      else{c.style.transition=nm?'none':'transform .3s cubic-bezier(.2,.8,.2,1)';c.style.transform='';c.style.setProperty('--yes',0);c.style.setProperty('--no',0);if(c.parentNode)c.parentNode.style.setProperty('--lay',1)}
      setTimeout(function(){me._moved=false},0)};
    root.addEventListener('pointerup',endDrag);root.addEventListener('pointercancel',endDrag)}
  (window.__apps=window.__apps||[]).push(this);
  if(!this.opt.inert&&!window.__onbListener){window.__onbListener=true;window.addEventListener('message',function(e){var d=e.data;if(!d||!d.elaraOnb)return;
    (window.__apps||[]).forEach(function(a){var fr=a.root.querySelector('#onbframe');if(!fr||e.source!==fr.contentWindow)return;
      if(d.type==='exit'){a.pop()}else if(d.type==='hoy'){a.s.onbHoy=true}else if(d.type==='screen'){a.s.onbScreen=d.screen}else if(d.type==='backed'){a.s.onbBack=d.r}})})}
  this.render();}
App.prototype.body=function(){var s=this.s,v=s.view;
  if(v){if(v.k==='ses')return vSes(s);if(v.k==='sesdone')return vSesDone(s);if(v.k==='practice')return vPractice(s);if(v.k==='review')return vReview(s);if(v.k==='week')return vWeek(s);if(v.k==='guide')return vGuide();if(v.k==='area')return vArea(s,v.id);if(v.k==='onb')return vOnb(s,v);if(v.k==='refl')return vRefl(s);
    if(v.k==='search')return vSearch(s);if(v.k==='saved')return vSaved(s);if(v.k==='ws')return vWorkshop(s,v.id);if(v.k==='thread')return vThread(s,v.id);if(v.k==='msgs')return vMsgs(s);if(v.k==='dm')return vDM(s,v.id);if(v.k==='ccview')return vCcView(s,v.id);if(v.k==='cxedit')return vCxEdit(s);if(v.k==='cxprof')return vCxProf(s,v.id)}
  return {hoy:vHoy,atlas:vAtlas,explorar:vExplorar,circulos:vCirculos}[s.tab](s)};
App.prototype.render=function(focusSel){var s=this.s,r=this.root,sc=r.querySelector('.scr'),key=s.tab+'|'+(s.view?s.view.k+(s.view.id||''):''),top=(sc&&this.key===key)?sc.scrollTop:0;this.key=key;
  var practice=s.view&&(s.view.k==='practice'||s.view.k==='ses');window.__plat=s.plat||'';var live=s.cx.live||'';var me0=this;if(live&&!this._lt)this._lt=setTimeout(function(){s.cx.live='';me0._lt=null},2600);
  var dv=devVars(s);CURD=dv.d;
  var tabs=[['hoy','Hoy','home'],['atlas','Atlas','globe'],['pregunta','Pregunta',null],['explorar','Explorar','compass'],['circulos','Círculos','people']];
  var cur=(s.view&&/^(practice|review|week|ses|sesdone)$/.test(s.view.k))?'pregunta':s.tab;
  var nav='<nav class="nav" aria-label="Navegación principal">'+tabs.map(function(t){return'<button data-a="tab" data-v="'+t[0]+'"'+(cur===t[0]?' aria-current="page"':'')+'>'+(t[2]?ic(t[2],24):'<img src="'+IMG.orb+'" alt="">')+'<span>'+t[1]+'</span></button>'}).join('')+'</nav>';
  var P=s.plat;if(P){nav='<nav class="nav" aria-label="Navegación principal">'+tabs.map(function(t){var on=cur===t[0];var icon=t[2]?ic(t[2],24):'<img src="'+IMG.orb+'" alt="">';return'<button data-a="tab" data-v="'+t[0]+'"'+(on?' aria-current="page"':'')+'>'+(P==='and'?'<span class="pillind">'+icon+'</span>':icon)+'<span class="lab">'+t[1]+'</span></button>'}).join('')+'</nav>'+((P==='ios'?dv.d.home:s.navmode!=='buttons')?'<i class="homebar" aria-hidden="true"></i>':'');}
  /* daily path (practice steps, scene view, completion/review): no bottom tab bar; the dock owns the bottom inset. Read-only reflection (refl) and the week view keep the bar. */
  var nonav=!!(s.view&&(s.view.k==='practice'||s.view.k==='review'||s.view.k==='onb'||s.view.k==='ses'||s.view.k==='sesdone'));if(nonav)nav=nav.replace(/<nav[\s\S]*?<\/nav>/,'');
  PXPREV=this.px==null?null:this.px;
  r.className='ph'+(s.cxStyle==='A'?' cxs-a':'')+(s.k>=1.25?' big':'')+(s.k>=1.5?' huge':'')+(s.tab==='circulos'&&s.ctab==='cx'&&!s.view&&s.cx.visible&&cxDeck(s).length?' cxdeck':'')+(practice?' phototop':'')+(nonav?' nonav':'')+(s.kb?' kb':'')+(P==='and'&&s.navmode==='buttons'?' nav3':'')+(s.nomo?' nomo':'')+(s.type==='finals'?' type-finals':'')+(s.hv==='n'&&s.tab==='hoy'&&!s.view?' hoyhdr':'')+(' dev-'+(s.dev||'ios15'))+(P?' plat plat-'+P:'')+(this.opt.inert?' inert':'')+(s.taps?' showtaps':'')+(this.opt.mini?' mini':'');
  r.style.setProperty('--k',s.k);r.style.setProperty('--w',s.w+'px');if(s.h)r.style.setProperty('--h',s.h+'px');
  if(P){r.style.setProperty('--sat',dv.sat+'px');r.style.setProperty('--sbh',dv.sbh+'px');r.style.setProperty('--nav',dv.nav+'px');r.style.setProperty('--inset',dv.inset+'px');r.style.setProperty('--app',dv.d.app+'px')}
  r.style.setProperty('--kb',(dv.kb||291)+'px');r.style.setProperty('--dockb',(P==='and'&&s.navmode==='buttons'?0:dv.inset)+'px');r.style.setProperty('--scrb',(P==='and'&&s.navmode==='buttons'?dv.inset:0)+'px');
  r.innerHTML=(P?statusBar(P):'')+'<div class="scr">'+this.body()+'</div>'+(s.audio.id&&s.tab==='explorar'?vPlayer(s):'')+nav+fabHTML(s)+sheetHTML(s)+phViewer(s)+sysnavHTML(s)+kbdHTML(s)+(s.toast?'<div class="toast" role="status"><span>'+s.toast.t+'</span>'+(s.toast.undo?'<button data-a="undo">Deshacer</button>':'')+'</div>':'')+'<div class="sr" role="status" aria-live="polite">'+esc(live)+'</div>';
  if(s.hv==='n'&&s.preset==='semana'&&!s.settled&&r.querySelector('.gface.settle')){var me2=this;clearTimeout(this.sT);this.sT=setTimeout(function(){s.settled=true;var f=r.querySelector('.gface.settle');if(f)f.classList.remove('settle')},1500)}
  if(this.opt.inert){r.setAttribute('inert','');r.setAttribute('aria-hidden','true')}
  var sk=s.sheet&&/^cx/.test(s.sheet.k)?s.sheet.k+(s.sheet.id||''):null;if(sk&&sk!==this._sk&&!focusSel)focusSel=s.sheet.k==='cxmatch'?'.cx-match .btn':'.sheet .opt,.sheet .btn';if(!sk&&this._sk&&!focusSel&&this._opener)focusSel=this._opener;this._sk=sk;
  var nsc=r.querySelector('.scr');nsc.scrollTop=top;
  if(P){var eh=r.querySelector('.exhead');var dk=function(){var light=!!eh&&nsc.scrollTop<eh.offsetHeight-(P==='ios'?60:34);r.classList.toggle('lighttop',light)};dk();nsc.addEventListener('scroll',dk,{passive:true})}
  if(s.hv==='n'&&s.tab==='hoy'&&!s.view){var hd=r.querySelector('.vtop');var hs=function(){r.classList.toggle('hoysolid',nsc.scrollTop>(hd?hd.offsetHeight:0)-dv.sbh-6)};hs();nsc.addEventListener('scroll',hs,{passive:true})}
  if(practice){var sc0=r.querySelector('.pr-scene');var us=function(){var lim=(sc0?sc0.offsetHeight:0)-(dv.sbh+6);r.classList.toggle('sbsolid',nsc.scrollTop>lim)};us();nsc.addEventListener('scroll',us,{passive:true})}
  var ct=r.querySelector('#cctop.stick');if(ct){var hd=ct.querySelector('.top');ct.style.setProperty('--cchd',Math.max(0,(hd?hd.offsetHeight:0)-dv.sbh)+'px');var lastC=nsc.scrollTop;if(lastC<=8&&s.ccHid){s.ccHid=false;ct.classList.remove('hid')}
    nsc.addEventListener('scroll',function(){var y=nsc.scrollTop,dy=y-lastC;if(y<=8){if(s.ccHid){s.ccHid=false;ct.classList.remove('hid')}}else if(dy>6&&y>60){if(!s.ccHid){s.ccHid=true;ct.classList.add('hid')}}else if(dy<-6){if(s.ccHid){s.ccHid=false;ct.classList.remove('hid')}}lastC=y},{passive:true})}
  var fab=r.querySelector('.fab');if(fab){var lastY=nsc.scrollTop;fab.classList.toggle('compact',lastY>40);nsc.addEventListener('scroll',function(){var y=nsc.scrollTop;if(y<=8)fab.classList.remove('compact');else if(y>lastY+4)fab.classList.add('compact');else if(y<lastY-4)fab.classList.remove('compact');lastY=y},{passive:true})}
  if(focusSel){var f=r.querySelector(focusSel);if(f){f.focus({preventScroll:true});if(f.setSelectionRange&&f.value!==undefined&&f.tagName==='TEXTAREA'){var L=f.value.length;f.setSelectionRange(L,L)}}}
  var hadSheet=this._sheetWas;this._sheetWas=!!s.sheet;
  if(s.sheet){r.querySelectorAll('.scr,.nav,.fab,.sbar,.player,.homebar,.sysnav').forEach(function(e){e.setAttribute('inert','')})}
  if(hadSheet&&!s.sheet&&this._opener){var op=r.querySelector(this._opener);if(op)op.focus({preventScroll:true});this._opener=null}
  this.afterPaint();
  if(s.taps)markSmall(r);
  if(this.opt.onChange)this.opt.onChange(this);};
/* a stable selector for the focused control, so focus can return after a re-render or a closed sheet */
function focusKey(root){var ae=document.activeElement;if(!ae||!root.contains(ae)||ae===root)return null;if(ae.id)return '#'+ae.id;if(ae.matches('.cx-card'))return '.cx-card';var d=ae.dataset||{};if(d.a)return '[data-a="'+d.a+'"]'+(d.v?'[data-v="'+String(d.v).replace(/"/g,'')+'"]':'')+(d.id?'[data-id="'+d.id+'"]':'');return null}
function navKey(s){return s.tab+'|'+(s.view?s.view.k+(s.view.id||''):'')}
App.prototype.go=function(patch,focus,o){var s=this.s,k0=navKey(s);if(patch&&patch.sheet&&!s.sheet)this._opener=focusKey(this.root);var old={tab:s.tab,view:s.view?JSON.parse(JSON.stringify(s.view)):null};
  Object.assign(s,patch);if(!(o&&o.replace)&&!this._back&&navKey(s)!==k0){s.hist.push(old);if(s.hist.length>30)s.hist.shift()}
  this.render(focus);this.persist()};
/* Back, per context (system Back on Android, edge swipe on iOS, the in-app arrow, Escape in this prototype):
   1 keyboard open -> hide it. 2 temporary overlay (sheet) -> close it. 3 «Ver paisaje» open -> back to the answer.
   4 practice step 2 or 3 -> previous step, answers kept. 5 practice step 1 -> close, draft kept, return to where she came from.
   6 any other pushed screen -> the previous screen in the real history. 7 top level: previous tab in history; at the root,
   Android closes the app (simulated), iOS has nothing to go back to. Never a blanket "leave the tab". */
App.prototype.say=function(m){if(!this._live){var l=document.createElement('div');l.id='opp-live';l.setAttribute('role','status');l.setAttribute('aria-live','polite');l.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';(this.root.parentNode||document.body).appendChild(l);this._live=l}var me=this;me._live.textContent='';setTimeout(function(){me._live.textContent=m},30)};
App.prototype.pop=function(){var s=this.s,p=s.hist.pop();this._back=true;
  if(p)this.go({tab:p.tab,view:p.view,sheet:null,land:false,kb:false});
  else if(s.view)this.go({view:null,sheet:null,land:false,kb:false});
  else{this._back=false;return s.plat==='and'?'exit':'none'}
  this._back=false;return 'pop'};
App.prototype.back=function(){var s=this.s,v=s.view,r;
  if(s.viewer){this.go({viewer:null},'[data-a="phview"][data-id="'+s.viewer.id+'"]');return 'viewer'}
  if(s.kb){this.go({kb:false});return 'kb'}
  if(s.sheet){this.go({sheet:null});return 'sheet'}
  if(s.tab==='explorar'&&!v&&s.ex.oppOpen){s.ex.oppOpen=false;this.go({},'#opp-filtros');return 'filtros'}
  if(s.tab==='explorar'&&!v&&s.ex.filter==='oportunidades'&&s.ex.oppFrom==='all'){s.ex.filter='todo';s.ex.oppFrom=null;s.ex.oppOpen=false;this.go({},'#oppAll');var _sc=this.root.querySelector('.scr');if(_sc)_sc.scrollTop=s.ex.todoY;return 'category'}
  if(v&&v.k==='onb'){var fr=this.root.querySelector('#onbframe');if(fr&&fr.contentWindow)fr.contentWindow.postMessage({elaraOnb:true,type:'back'},'*');else{this.pop()}return 'onb'}
  if(v&&v.k==='ses'){return this.sesBack()}
  if(v&&v.k==='practice'){
    if(s.land){this.go({land:false},'[data-a="land"]');return 'land'}
    if(s.draft&&s.draft.step>0){s.draft.step--;this.go({},'#pq');return 'step'}
    this.leavePractice();this.pop();return 'leave'}
  r=this.pop();
  if(r==='exit')this.toast('Simulado: en Android, Atrás aquí cierra la app.');
  return r};
App.prototype.afterPaint=function(){var r=this.root,s=this.s,img=r.querySelector('.pr-photo'),me=this;
  var place=function(){var xt=r.querySelector('.extabs'),xo=xt&&xt.querySelector('[aria-pressed="true"]');if(xt&&xo){xt.scrollLeft=0;xt.style.paddingRight='';
    /* category row: the selected label is always fully visible, the label before it too when it fits, and the row starts on a label boundary at the gutter (never half a word on the left) */
    var xb=[].slice.call(xt.children),xr=xt.getBoundingClientRect().left,pos=function(b){return b.getBoundingClientRect().left-xr+xt.scrollLeft},si=xb.indexOf(xo),pad=10,vis=xt.clientWidth,i=0;
    while(i<si&&pos(xo)+xo.offsetWidth-pos(xb[i])+pad>vis)i++;
    if(i===0){xt.scrollLeft=0}else{var tgt=Math.max(0,pos(xb[i])-pad),need=tgt+vis-xt.scrollWidth;if(need>0)xt.style.paddingRight=(pad+need)+'px';xt.scrollLeft=tgt}}};place();if(document.fonts&&document.fonts.ready&&!this._fontsOK){var me3=this;document.fonts.ready.then(function(){me3._fontsOK=true;place()})}else if(document.fonts&&this._fontsOK){}
  var dk0=r.querySelector('.dock'),scr0=r.querySelector('.scr');if(scr0)scr0.style.scrollPaddingBottom=(dk0?dk0.offsetHeight+8:0)+'px';
  if(!img){this.px=null;return}
  var dk=r.querySelector('.dock'),scr=r.querySelector('.scr');if(scr)scr.style.scrollPaddingBottom=(dk?dk.offsetHeight+8:0)+'px';
  var t=parseFloat(img.dataset.px),prev=this.px;
  if(prev!=null&&prev!==t&&!reducedMotion(s)){void img.offsetWidth;img.style.objectPosition=t+'% 42%'}
  this.px=t;
  var run=function(){me.tone(img)};if(img.complete&&img.naturalWidth)run();else if(img.decode)img.decode().then(run,function(){});
  if(s.kb){var a=r.querySelector('#ans,#due,#ct,#dmx,#q,#ssin');if(a&&a.scrollIntoView)a.scrollIntoView({block:'nearest'})}};
/* the clock and system icons sit on the photograph, so the scrim and the icon colour are chosen from the pixels actually
   behind the status bar for the current crop: the lighter option that reaches 4.5:1 for the worst 5% of those pixels */
App.prototype.tone=function(img){var r=this.root,sc=r.querySelector('.pr-scene');if(!sc||!img.naturalWidth)return;
  var lin=function(c){c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)},L=function(a){return .2126*lin(a[0])+.7152*lin(a[1])+.0722*lin(a[2])},cr=function(a,b){var x=L(a),y=L(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  var W=img.offsetWidth,H=img.offsetHeight,nw=img.naturalWidth,nh=img.naturalHeight,px=parseFloat(img.dataset.px),k=Math.max(W/nw,H/nh),ox=(W-nw*k)*px/100,oy=(H-nh*k)*42/100;
  var sb=r.querySelector('.sbar'),B=Math.min(H,Math.round(sb?sb.offsetHeight+6:64)),cw=96,ch=Math.max(6,Math.round(B*cw/W));
  var cv=document.createElement('canvas');cv.width=cw;cv.height=ch;var g=cv.getContext('2d');
  try{g.drawImage(img,-ox/k,-oy/k,W/k,B/k,0,0,cw,ch);var d=g.getImageData(0,0,cw,ch).data}catch(e){return}
  var opts=[{n:'light',fg:[255,252,246],sc:[23,36,28]},{n:'dark',fg:[23,36,28],sc:[255,252,246]}],best=null;
  [.45,.6,.75].forEach(function(a0){opts.forEach(function(o){if(best&&best.ok)return;var crs=[];
    for(var y=0;y<ch;y++){var al=a0*Math.max(0,1-(y*B/ch)/96);for(var x=0;x<cw;x++){var i=(y*cw+x)*4,p=[d[i]*(1-al)+o.sc[0]*al,d[i+1]*(1-al)+o.sc[1]*al,d[i+2]*(1-al)+o.sc[2]*al];crs.push(cr(o.fg,p))}}
    crs.sort(function(a,b){return a-b});var worst=crs[Math.floor(crs.length*.05)];
    if(!best||(worst>=4.5&&!best.ok)||(!best.ok&&worst>best.cr))best={n:o.n,a:a0,cr:worst,ok:worst>=4.5,fg:o.fg,sc:o.sc}})});
  sc.style.setProperty('--sba',best.a);sc.style.setProperty('--sbs',best.sc.join(','));r.style.setProperty('--sbfg','rgb('+best.fg.join(',')+')');
  sc.dataset.tone=best.n;sc.dataset.sbcr=best.cr.toFixed(1);sc.dataset.sbok=best.ok?'1':'0'};
App.prototype.persist=function(){if(!this.opt.persist)return;var s=this.s;try{localStorage.setItem('elara-final-pass',JSON.stringify({preset:s.preset,done:s.done,draft:s.draft,answer:s.answer,justDone:s.justDone,ex:{saved:s.ex.saved,reserved:s.ex.reserved},posts:s.posts,blocked:s.blocked,reported:s.reported,threads:s.threads}))}catch(e){}};
App.prototype.toast=function(t,undo){var me=this;this.s.toast={t:t,undo:undo||null};clearTimeout(this.tt);this.render();this.tt=setTimeout(function(){me.s.toast=null;var ae=document.activeElement,k=null;if(ae&&me.root.contains(ae)){k=ae.id?'#'+ae.id:ae.matches('.cx-card')?'.cx-card':ae.dataset&&ae.dataset.a?'[data-a="'+ae.dataset.a+'"]'+(ae.dataset.v?'[data-v="'+ae.dataset.v+'"]':''):null}me.render(k)},undo?6000:3200)};
App.prototype.openEntry=function(){var s=this.s,e=entry(s);this.s.atlas.sel=null;
  if(e.kind==='ses'){this.sesOpen(s.test.cur,false);return}if(e.kind==='sesdone'){this.go({view:{k:'sesdone'},sheet:null},'#pq');return}
  if(e.kind==='practice'){if(!s.draft)s.draft=newDraft();normDraft(s.draft);this.go({view:{k:'practice'},sheet:null,land:false},'#pq')}
  else this.go({view:{k:e.kind},sheet:null})};
App.prototype.leavePractice=function(msg){if(this.s.view&&this.s.view.k==='practice'&&this.s.draft&&(this.s.draft.a!=null||this.s.draft.b!=null||(this.s.draft.chk||[]).some(Boolean)||this.s.draft.skipped&&this.s.draft.skipped.length)){this.toast(msg||'Guardamos tus respuestas. Puedes seguir cuando quieras.')}};
App.prototype.act=function(a,d,el){var s=this.s,me=this;
  if(s.kb&&a!=='kb'&&a!=='sysback')s.kb=false;
  if(/^ss/.test(a)&&this.sesAct){this.sesAct(a,d,el);return}
  switch(a){
  case'tab':if(d.v==='pregunta'){this.openEntry();return}this.leavePractice();s.atlas.open=false;this.go({tab:d.v,view:null,sheet:null});break;
  case'entry':this.openEntry();break;
  case'leave':this.leavePractice();this.pop();break;
  case'sysback':this.back();break;
  case'syshome':case'sysrecents':this.toast('Simulado: sales de la app. Tu borrador se conserva.');break;
  case'kb':this.go({kb:!s.kb});break;
  case'land':this.go({land:!s.land},'[data-a="land"]');break;
  case'home':s.hist=[];this.go({view:null,tab:'hoy',land:false});break;
  case'pnext':if(!stepReady(s.draft))break;s.draft.skipped=s.draft.skipped.filter(function(x){return x!==s.draft.step});s.draft.step=Math.min(NSTEPS-1,s.draft.step+1);this.go({},'#pq');break;
  case'pskip':if(s.draft.skipped.indexOf(s.draft.step)<0)s.draft.skipped.push(s.draft.step);if(s.draft.step>=NSTEPS-1){this.act('pfinish',{});break}s.draft.step++;this.go({},'#pq');break;
  case'pback':s.draft.step=Math.max(0,s.draft.step-1);this.go({},'#pq');break;
  case'pick':s.draft[d.w]=+d.v;s.draft.skipped=s.draft.skipped.filter(function(x){return x!==s.draft.step});this.go({},'[data-a="pick"][data-w="'+d.w+'"][data-v="'+d.v+'"]');break;
  case'pfinish':var w=curWeek(s),dr=s.draft;s.done[w]=(s.done[w]||0)+1;s.answer={a:dr.a,b:dr.b,chk:dr.chk.slice(),skipped:dr.skipped.slice()};s.draft=null;s.justDone=true;s.preset='hecho';this.go({view:{k:'review'},land:false},null,{replace:true});this.toast('Día '+s.done[w]+' hecho. Guardaste la '+KEEPS[s.done[w]-1]+'.');break;
  case'guide':this.go({view:{k:'guide'}});break;
  case'area':this.go({view:{k:'area',id:d.id}});break;
  case'mirada':this.go({view:{k:'onb',mode:'mirada'}});break;
  case'onboarding':s.hist=[];this.go({tab:'hoy',view:{k:'onb',mode:'onboarding'},sheet:null,land:false});break;
  case'areastart':this._opener='[data-a="areastart"]';this.go({sheet:{k:'switch',id:d.id}},'.sheet .btn');break;
  case'swconfirm':this.go({sheet:null});this.toast('Simulado: la beta solo tiene Claridad financiera. No se cambió nada.');break;
  case'closeview':this.pop();break;
  case'refl':this.go({view:{k:'refl',day:+d.day}});break;
  case'profile':this.go({sheet:{k:'oos',id:'profile'}});break;
  case'oos':this.go({sheet:{k:'oos',id:d.k}});break;
  case'shclose':this.go({sheet:null});break;
  case'goAtlas':s.atlas={open:true,sel:d.sel,list:false};this.go({tab:'atlas',view:null});break;
  case'alist':s.atlas.list=!s.atlas.list;this.go({});break;
  case'aopen':s.atlas.open=true;this.go({},'.mk');break;
  case'aclose':s.atlas.open=false;s.atlas.sel=null;this.go({});break;
  case'asel':s.atlas.sel=s.atlas.sel===d.id&&!s.atlas.list?null:d.id;s.atlas.open=true;this.go({},'[data-id="'+d.id+'"]');break;
  case'exf':var _sc0=this.root.querySelector('.scr');if(d.from==='all'){s.ex.todoY=_sc0?_sc0.scrollTop:0;s.ex.oppFrom='all'}else{s.ex.oppFrom=null}s.ex.filter=d.v;s.ex.oppOpen=false;this.go({});var _sc=this.root.querySelector('.scr');if(_sc)_sc.scrollTop=0;break;
  case'opp':this._opener='[data-a="opp"][data-id="'+d.id+'"]';this.go({sheet:{k:'opp',id:d.id}},'.sheet .sx');break;
  case'oppdemo':this.toast('Demostración de diseño: aquí se abriría la publicación original, fuera de Elara.');break;
  case'oppinfo':s.ex.oppInfo=!s.ex.oppInfo;this.go({},'#opp-info-btn');break;
  case'oppfilt':s.ex.oppOpen=!s.ex.oppOpen;this.go({},s.ex.oppOpen?'#opp-cat':'#opp-filtros');break;
  case'oppfdone':s.ex.oppOpen=false;this.go({},'#opp-filtros');break;
  case'oppclear':s.ex.opp={c:'',cat:'',h:'',a:''};this.go({},'#opp-c');this.say('Filtros quitados. '+oppList(s).length+' oportunidades.');break;
  case'exsearch':this.go({view:{k:'search'}},'#q');break;
  case'exq':s.ex.q=d.v;this.go({},'#q');break;
  case'exhome':this.pop();break;
  case'exsaved':this.go({view:{k:'saved'}});break;
  case'ws':this.go({view:{k:'ws',id:d.id}});break;
  case'reserve':s.ex.reserved.push(d.id);this.go({});this.toast('Listo, tienes tu lugar.');break;
  case'unreserve':s.ex.reserved=s.ex.reserved.filter(function(x){return x!==d.id});this.go({});break;
  case'play':this.play(d.id);break;
  case'save':var i=s.ex.saved.indexOf(d.id);if(i>-1)s.ex.saved.splice(i,1);else s.ex.saved.push(d.id);this.go({});this.toast(i>-1?'Quitado de guardados':'Guardado en Explorar');break;
  case'cfilter':s.cfilter=d.v;this.go({},'[data-a="cfilter"][data-v="'+d.v+'"]');this.root.querySelector('.scr').scrollTop=0;break;
  case'ctab':this.go({ctab:d.v},d.v==='cx'?'[data-a="ctab"][data-v="cx"]':null);break;
  case'chome':this.pop();s.replyDraft='';break;
  case'thread':this.go({view:{k:'thread',id:d.id},replyDraft:''});break;
  case'sendreply':var p=s.posts.find(function(x){return x.id===d.id});p.r.push({by:'me',t:s.replyDraft});this.go({replyDraft:''});this.toast('Respuesta publicada');break;
  case'pmenu':this.go({sheet:{k:'pmenu',id:d.id}});break;
  case'member':this.go({sheet:{k:'member',id:d.id}});break;
  case'report':this.go({sheet:{k:'report',id:d.id,who:!!d.who,photo:!!d.photo}});break;
  case'reason':s.sheet.reason=d.v;this.go({},'[data-v="'+d.v+'"]');break;
  case'sendreport':if(s.sheet.photo){(s.photoReported=s.photoReported||[]).push(s.sheet.id)}else if(!s.sheet.who)s.reported.push(s.sheet.id);this.go({sheet:null});this.toast('Gracias. Revisamos tu reporte en privado.');break;
  case'block':this.go({sheet:{k:'block',id:d.id}});break;
  case'doblock':s.blocked.push(d.id);var bn=MEMBERS[d.id].n;this.go({sheet:null,view:s.view&&s.view.k==='dm'?{k:'msgs'}:s.view&&s.view.k==='thread'&&s.posts.find(function(x){return x.id===s.view.id}).by===d.id?null:s.view});this.toast('Bloqueaste a '+bn+'.',{k:'block',id:d.id});break;
  case'undo':var u=s.toast&&s.toast.undo;if(u&&u.k==='block')s.blocked=s.blocked.filter(function(x){return x!==u.id});if(u&&u.k==='pass'&&s.cx.st[u.id]==='passed'){s.cx.st[u.id]='new';s.cx.lastPass=null;s.cx.live='Deshiciste el pase. '+CXP[u.id].n+' vuelve a tu lista.'}s.toast=null;this.go({},u&&u.k==='pass'?'.cx-card':null);break;
  case'msgs':this.go({view:{k:'msgs'},tab:'circulos',sheet:null,dmDraft:'',dmStarter:false});break;
  case'dm':this.go({view:{k:'dm',id:d.id},tab:'circulos',sheet:null,dmDraft:'',dmStarter:false},'#dmx');break;
  case'senddm':var t=s.threads.find(function(x){return x.with===d.id});t.m.push({me:true,t:s.dmDraft});this.go({dmDraft:'',dmStarter:false},'#dmx');if(t.cx)this.cxSimReply(d.id);break;
  case'cxstart':s.cx.introSeen=true;s.cx.draft=cxDraftOf(s);this.go({view:{k:'cxedit',first:true}},'#cxn');break;
  case'cxedit':s.cx.introSeen=true;s.cx.draft=cxDraftOf(s);this.go({sheet:null,tab:'circulos',ctab:'cx',view:{k:'cxedit',first:!s.cx.saved}},'#cxn');break;
  case'cxhow':this.go({sheet:{k:'cxhow'}});break;
  case'cxme':this.go({sheet:{k:'cxme'}});break;
  case'cxphoto':if(d.v==='photo')this.go({sheet:{k:'cxphoto'}});else{s.cx.draft.photo='initial';this.go({},'[data-a="cxphoto"][data-v="initial"]')}break;
  case'cxphotook':s.cx.draft.photo='review';this.go({sheet:null},'[data-a="cxphoto"][data-v="photo"]');break;
  case'cxint':var di=s.cx.draft.ints,ix=di.indexOf(d.v);if(ix>-1)di.splice(ix,1);else if(di.length<5)di.push(d.v);this.go({},'[data-a="cxint"][data-v="'+d.v+'"]');break;
  case'cxseek':s.cx.draft.seeks=d.v;this.go({},'[data-a="cxseek"][data-v="'+d.v+'"]');break;
  case'cxvis':s.cx.draft.vis=!s.cx.draft.vis;this.go({},'[data-a="cxvis"]');break;
  case'cxsave':if(!cxDraftOk(s.cx.draft))break;var dr=s.cx.draft;s.cx.profile={n:dr.n.trim(),photo:dr.photo,intro:dr.intro.trim(),ints:dr.ints.slice(),seeks:dr.seeks};s.cx.saved=true;s.cx.visible=!!dr.vis;s.cx.draft=null;s.cx.live=s.cx.visible?'Guardado. Ya eres visible en Conexiones.':'Guardado. Todavía no eres visible.';
    this.pop();this.toast(s.cx.visible?'Guardado. Ya eres visible en Conexiones.':'Guardado. Todavía no eres visible.');this.go({},'.cx-card');break;
  case'cxresume':s.cx.visible=true;s.cx.live='Volviste a ser visible en Conexiones.';this.go({},'.cx-card');break;
  case'cxpausea':this.go({sheet:{k:'cxpause'}});break;
  case'cxdopause':s.cx.visible=false;s.cx.live='Conexiones en pausa.';this.go({sheet:null});this.toast('Conexiones en pausa. Ya no eres visible.');break;
  case'cxprof':if(this._moved){this._moved=false;break}this.go({view:{k:'cxprof',id:d.id}});break;
  case'cxconnect':this.cxDecide(d.id,'yes');break;
  case'cxpass':this.cxDecide(d.id,'no');break;
  case'cxundopass':var lp=s.cx.lastPass;if(lp&&s.cx.st[lp]==='passed'){s.cx.st[lp]='new';s.cx.lastPass=null;s.cx.live='Deshiciste el pase. '+CXP[lp].n+' vuelve a tu lista.'}this.go({sheet:null},'.cx-card');break;
  case'cxwithdraw':if(s.cx.st[d.id]==='pending'){s.cx.st[d.id]='withdrawn';s.cx.live='Retiraste tu interés en '+CXP[d.id].n+'.';this.go({sheet:null});this.toast('Retiraste tu interés en '+CXP[d.id].n+'.')}break;
  case'cxgreet':case'cxdm':var th0=cxThread(s,d.id),first0=!!th0&&!th0.m.length;this.go({view:{k:'dm',id:d.id},tab:'circulos',ctab:'cx',sheet:null,dmDraft:first0?cxStarter(s,d.id):'',dmStarter:first0},'#dmx');break;
  case'cxmatchclose':this.go({sheet:null},'.cx-card');break;
  case'inbox':s.inbox=d.v;this.go({},'[data-a="inbox"][data-v="'+d.v+'"]');break;
  case'cxmenu':this.go({sheet:{k:'cxmenu',id:d.id}});break;
  case'cxunm':this.go({sheet:{k:'cxunm',id:d.id}});break;
  case'cxdounm':s.cx.st[d.id]='unmatched';s.threads=s.threads.filter(function(x){return x.with!==d.id});s.cx.live='Dejaste de conectar con '+CXP[d.id].n+'.';this.go({sheet:null,view:s.view&&(s.view.k==='dm'||s.view.k==='cxprof')?{k:'msgs'}:s.view});this.toast('Dejaste de conectar con '+CXP[d.id].n+'.');break;
  case'cxblk':this.go({sheet:{k:'cxblk',id:d.id}});break;
  case'cxdoblk':s.cx.st[d.id]='blocked';s.threads=s.threads.filter(function(x){return x.with!==d.id});s.cx.live='Bloqueaste a '+CXP[d.id].n+'.';this.go({sheet:null,view:s.view&&(s.view.k==='dm'||s.view.k==='cxprof')?{k:'msgs'}:s.view});this.toast('Bloqueaste a '+CXP[d.id].n+'. No recibe aviso.');break;
  case'cxrep':this.go({sheet:{k:'cxrep',id:d.id}});break;
  case'cxreason':s.sheet.reason=d.v;this.go({},'[data-a="cxreason"][data-v="'+d.v.replace(/"/g,'')+'"]');break;
  case'cxsend':s.cx.reports.push({id:d.id,reason:s.sheet.reason});this.go({sheet:null});this.toast('Gracias. El equipo de Elara lo revisa en privado. Simulado: no se envió nada.');break;
  case'ccview':this.go({view:{k:'ccview',id:d.id}});break;
  case'ccdf':s.dfilter=d.v;this.go({},'[data-a="ccdf"][data-v="'+d.v+'"]');this.root.querySelector('.scr').scrollTop=0;break;
  case'ccint':this.go({sheet:{k:'ccint',sel:s.cint.slice()}});break;
  case'ccintt':var ix2=s.sheet.sel.indexOf(d.v);if(ix2>-1)s.sheet.sel.splice(ix2,1);else s.sheet.sel.push(d.v);this.go({},'[data-a="ccintt"][data-v="'+d.v+'"]');break;
  case'ccintsave':s.cint=s.sheet.sel.slice();this.go({sheet:null});break;
  case'ccjoin':if(s.joined.indexOf(d.id)<0)s.joined.push(d.id);s.cx.live='Te uniste a '+ccById(d.id).n+'.';this.toast('Te uniste a '+ccById(d.id).n+'. Solo tú lo ves.');this.go({},'[data-a="ccleave"]');break;
  case'ccleave':s.joined=s.joined.filter(function(x){return x!==d.id});s.cx.live='Saliste de este círculo.';this.toast('Saliste de este círculo.');this.go({},'[data-a="ccjoin"]');break;
  case'phadd':case'phreplace':s.sheet.step='pick';this.go({},s.upSim==='denied'?'[data-a="phsettings"]':'.ph-tile');break;
  case'phback':s.sheet.step='compose';this.go({},'[data-a="phadd"],[data-a="phreplace"]');break;
  case'phsettings':this.toast('Simulado: aquí se abrirían los ajustes del teléfono.');break;
  case'phsample':this.phSample(d.v);break;
  case'phremove':s.sheet.ph=null;s.sheet.phErr=null;s.cx.live='Foto quitada.';this.go({},'[data-a="phadd"]');break;
  case'phcancel':clearInterval(this._upT);s.sheet.ph=null;s.cx.live='Subida cancelada.';this.go({},'[data-a="phadd"]');break;
  case'phretry':var q0=s.sheet.ph;if(q0){q0.status='uploading';q0.pct=0;q0._ann=0;q0.err=null;this.go({},'#upbar');this.phUp()}break;
  case'phview':this.go({viewer:{id:d.id,z:false}},'.phv-x');break;
  case'phclose':this.back();break;
  case'phzoom':s.viewer.z=!s.viewer.z;this.go({},'[data-a="phzoom"]');break;
  case'pedit':var pe=s.posts.find(function(x){return x.id===d.id});this.go({sheet:{k:'compose',edit:pe.id,c:pe.c,t:pe.t+(pe.b?'\n'+pe.b:''),ph:pe.photo?{status:'ready',src:pe.photo.src,w:pe.photo.w,h:pe.photo.h,alt:pe.photo.alt||'',name:'Foto de tu publicación',bytes:Math.round(pe.photo.src.length*.75),token:1}:null}},'#ct');break;
  case'pdel':this.go({sheet:{k:'pdel',id:d.id}});break;
  case'pdodel':s.posts=s.posts.filter(function(x){return x.id!==d.id});s.cx.live='Publicación eliminada.';this.go({sheet:null,view:null});this.toast('Publicación eliminada. Su foto también.');break;
  case'pdelphoto':var pq=s.posts.find(function(x){return x.id===d.id});if(pq)delete pq.photo;s.cx.live='Quitaste la foto.';this.go({sheet:null});this.toast('Quitaste la foto de tu publicación.');break;
  case'compose':this.go({sheet:{k:'compose'}},'.chip');break;
  case'ccircle':s.sheet.c=d.v;this.go({},'[data-v="'+d.v+'"]');break;
  case'publish':var sh0=s.sheet,txt=sh0.t.trim(),nl=txt.indexOf('\n'),title=(nl>0?txt.slice(0,nl):txt).slice(0,120),bd=nl>0?txt.slice(nl+1).trim():'';
    var phn=sh0.ph&&sh0.ph.status==='ready'?{src:sh0.ph.src,w:sh0.ph.w,h:sh0.ph.h,alt:(sh0.ph.alt||'').trim()}:null;if(sh0.ph&&!phn)break;
    if(sh0.edit){var pe2=s.posts.find(function(x){return x.id===sh0.edit});pe2.t=title;pe2.b=bd;if(phn)pe2.photo=phn;else delete pe2.photo;this.go({sheet:null});this.toast('Cambios guardados');break}
    var np={id:'n'+Date.now(),by:'me',c:sh0.c,ago:'ahora',t:title,b:bd,r:[]};if(phn)np.photo=phn;s.posts.unshift(np);var cc=sh0.c;this.go({sheet:null,ctab:'mis'});this.root.querySelector('.scr').scrollTop=0;this.toast('Publicado en '+cc);break;
  }
  this.persist();};
App.prototype.input=function(k,v,el){var s=this.s;
  if(k==='ssin'){this.sesInput(v);return}
  if(k==='chk'){s.draft.chk[+el.dataset.i]=v;var n=this.root.querySelector('#svn');if(n)n.innerHTML=s.draft.chk.some(Boolean)?ic('check',16)+'Guardado':'Se guarda mientras escribes. Solo tú lo ves.'}
  else if(k==='oppc'||k==='oppcat'||k==='opph'||k==='oppa'){var mp={oppc:'c',oppcat:'cat',opph:'h',oppa:'a'};s.ex.opp[mp[k]]=v;this.go({},'#'+el.id);var _n=oppList(s).length;this.say(_n+(_n===1?' oportunidad':' oportunidades'))}
  else if(k==='q'){s.ex.q=v;var tmp=document.createElement('div');tmp.innerHTML=vSearch(s);this.root.querySelector('#sres').innerHTML=tmp.querySelector('#sres').innerHTML}
  else if(k==='reply'){s.replyDraft=v;this.root.querySelector('[data-a="sendreply"]').disabled=!v.trim()}
  else if(k==='dm'){s.dmDraft=v;this.root.querySelector('[data-a="senddm"]').disabled=!v.trim()}
  else if(k==='phalt'){if(s.sheet&&s.sheet.ph){s.sheet.ph.alt=v;var cn=this.root.querySelector('#phac');if(cn)cn.textContent=v.length}}
  else if(k==='cxname'){s.cx.draft.n=v;this.cxPrev()}
  else if(k==='cxintro'){s.cx.draft.intro=v;this.cxPrev();var ic0=this.root.querySelector('#cxic');if(ic0)ic0.textContent=v.length+' de 120. Escribe solo lo que quieras que lea otra mujer.'}
  else if(k==='ctext'){s.sheet.t=v;this.root.querySelector('[data-a="publish"]').disabled=!(s.sheet.c&&v.trim())}
  this.persist();};
App.prototype.play=function(id){var s=this.s,me=this,au=AUDIOS.find(function(a){return a.id===id});clearInterval(this.timer);
  if(s.audio.id===id&&s.audio.st==='playing'){s.audio.st='paused';this.go({});return}
  if(s.audio.id===id&&s.audio.st==='paused'){s.audio.st='playing';this.tick(au);this.go({});return}
  s.audio={id:id,st:'loading',t:0};this.go({});
  setTimeout(function(){if(s.audio.id!==id||s.audio.st!=='loading')return;s.audio.st='playing';me.tick(au);me.go({})},this.opt.fastLoad?50:900)};
App.prototype.tick=function(au){var s=this.s,me=this;clearInterval(this.timer);this.timer=setInterval(function(){if(s.audio.st!=='playing'){clearInterval(me.timer);return}s.audio.t+=1;if(s.audio.t>=au.dur){s.audio.t=au.dur;s.audio.st='paused';clearInterval(me.timer)}
  if(s.audio.st!=='playing'){me.render();return}me.paintAudio(au)},1000)};
// a playing tick only repaints the progress text, so typing, focus and scroll are left alone
App.prototype.paintAudio=function(au){var s=this.s,r=this.root,txt=mmss(s.audio.t)+' de '+mmss(au.dur);
  var ps=r.querySelector('.player .ps');if(ps)ps.textContent='Reproduciendo · '+txt+' · Voz sintética';
  var bar=r.querySelector('.player .bar i');if(bar)bar.style.width=Math.round(s.audio.t/au.dur*100)+'%';
  var b=r.querySelector('.play[data-id="'+au.id+'"]');if(b){var st=b.closest('.cov').querySelector('.st');if(st)st.textContent='Reproduciendo · '+txt}};
/* photo picking: a sample from the simulated picker, or a real file from this device (validated and re-encoded here, never uploaded) */
App.prototype.phSample=function(k){var NM={'ph-portrait':'retrato.jpg','ph-landscape':'paisaje.jpg','ph-square':'cuadrada.jpg','ph-panorama':'panoramica.jpg','ph-tiny':'diminuta.jpg'};
  if(k==='gif')return this.phPick('data:image/gif;base64,R0lGODlhAQABAAAAACw=',{type:'image/gif',size:2048,name:'animacion.gif'});
  if(k==='big')return this.phPick(IMG['ph-landscape'],{type:'image/jpeg',size:12*1024*1024,name:'foto-grande.jpg'});
  if(k==='bad')return this.phPick('data:image/jpeg;base64,/9j/4AAQSkZJRg==',{type:'image/jpeg',size:30000,name:'foto-danada.jpg'});
  this.phPick(IMG[k],{type:'image/webp',size:Math.round(IMG[k].length*.75),name:NM[k]})};
App.prototype.phFile=function(file){var me=this;
  var go=function(){var url=URL.createObjectURL(file);me.phPick(url,{type:file.type,size:file.size,name:file.name});setTimeout(function(){URL.revokeObjectURL(url)},8000)};
  if(file.type==='image/webp'&&file.slice){var fr=new FileReader();fr.onload=function(){if(/ANIM/.test(String(fr.result))){me.phPick('',{type:'image/gif',size:file.size,name:file.name})}else go()};fr.readAsText(file.slice(0,4096),'latin1')}else go()};
App.prototype.phPick=function(src,meta){var s=this.s,sh=s.sheet,me=this;if(!sh||sh.k!=='compose')return;clearInterval(this._upT);sh.step='compose';sh.phErr=null;
  var e=phCheck(meta);if(!e&&s.upSim==='invalid')e='corrupt';
  if(e){sh.ph=null;sh.phErr=PH_MSG[e];s.cx.live=PH_MSG[e];this.go({},'[data-a="phadd"]');return}
  var tok=Date.now()+Math.random();sh.ph={status:'processing',name:meta.name||'Foto',alt:'',token:tok,pct:0};this.go({});
  return phProcess(src,meta).then(function(r){var q=s.sheet&&s.sheet.ph;if(!q||q.token!==tok)return;Object.assign(q,{status:'uploading',pct:0,_ann:0,src:r.src,w:r.w,h:r.h,bytes:r.bytes,stripped:true,from:r.from});me.go({},'#upbar');me.phUp()})
   .catch(function(er){var q=s.sheet&&s.sheet.ph;if(!q||q.token!==tok)return;s.sheet.ph=null;s.sheet.phErr=PH_MSG[er.message]||PH_MSG.corrupt;s.cx.live=s.sheet.phErr;me.go({},'[data-a="phadd"]')})};
/* upload progress is SIMULATED: the reviewer controls choose the outcome (ok, net, offline, slow, invalid, denied) */
App.prototype.phUp=function(){var s=this.s,me=this,p=s.sheet&&s.sheet.ph;if(!p)return;clearInterval(this._upT);var step=s.upSim==='slow'?2:12,tok=p.token;
  this._upT=setInterval(function(){var q=s.sheet&&s.sheet.ph;if(!q||q.token!==tok||q.status!=='uploading'){clearInterval(me._upT);return}
    if(s.upSim==='offline'){clearInterval(me._upT);q.status='error';q.err='offline';s.cx.live=PH_MSG.offline;me.go({},'[data-a="phretry"]');return}
    q.pct=Math.min(100,q.pct+step);
    if(s.upSim==='net'&&q.pct>=60){clearInterval(me._upT);q.pct=60;q.status='error';q.err='net';s.cx.live=PH_MSG.net;me.go({},'[data-a="phretry"]');return}
    if(q.pct>=100){clearInterval(me._upT);q.status='ready';s.cx.live='Foto lista.';me.go({});return}
    me.phPaint(q)},this.opt.fastLoad?25:140)};
App.prototype.phPaint=function(p){var r=this.root,b=r.querySelector('#upbar'),t=r.querySelector('#uptxt'),bar=r.querySelector('.ph-bar');if(b)b.style.width=p.pct+'%';if(bar)bar.setAttribute('aria-valuenow',p.pct);if(t)t.textContent='Subiendo foto, '+p.pct+' %';
  var q=Math.floor(p.pct/25);if(q>(p._ann||0)){p._ann=q;var lv=r.querySelector('#uplive');if(lv)lv.textContent='Subiendo foto, '+p.pct+' %'}};
App.prototype.cxPrev=function(){var s=this.s,d=s.cx.draft,pv=this.root.querySelector('#cxprev');if(pv)pv.innerHTML=cxOwnCard(s,d);var b=this.root.querySelector('[data-a="cxsave"]');if(b)b.disabled=!cxDraftOk(d)};
/* one decision, whether it came from a swipe, a button, the keyboard or the profile screen */
App.prototype.cxDecide=function(id,dir){var s=this.s,c=s.cx,p=CXP[id];if(!p||c.st[id]!=='new')return;var inProf=!!(s.view&&s.view.k==='cxprof');
  if(inProf)this.pop();
  if(dir==='no'){c.st[id]='passed';c.lastPass=id;c.live='Pasaste. Es privado.';this.toast('Pasaste. Es privado.',{k:'pass',id:id});this.go({},'.cx-card');return}
  if(p.recip==='now'||c.sim[id]){c.st[id]='matched';if(!cxThread(s,id))s.threads.push({with:id,cx:true,m:[],unread:true});c.live='Las dos conectaron. '+p.n+' y tú pueden conversar.';this.go({sheet:{k:'cxmatch',id:id}},'.cx-match .btn');return}
  c.st[id]='pending';c.live='Conectaste con '+p.n+'. Queda pendiente hasta que ella también conecte.';this.toast('Conectaste con '+p.n+'. Queda pendiente hasta que ella también conecte.');this.go({},'.cx-card')};
/* simulated outcomes: only the reviewer panel and the tests call these. Nothing is sent anywhere. */
App.prototype.cxSimReply=function(id){var s=this.s,me=this;if(!s.cx.simReply)return;clearTimeout(this['_r'+id]);
  this['_r'+id]=setTimeout(function(){var t=cxThread(s,id);if(!t||s.cx.st[id]!=='matched')return;t.m.push({me:false,t:CXP[id].reply,sim:true});var here=!!(s.view&&s.view.k==='dm'&&s.view.id===id);if(!here)t.unread=true;s.cx.live=CXP[id].n+' respondió. Mensaje simulado.';me.render();if(here){var sc=me.root.querySelector('.scr');if(sc)sc.scrollTop=sc.scrollHeight}},this.opt.fastLoad?30:1300)};
App.prototype.cxSim=function(kind,id){var s=this.s,c=s.cx,p=CXP[id];if(!p&&kind!=='preset'&&kind!=='reset'&&kind!=='interests')return;
  if(kind==='recip'){if(c.st[id]==='pending'){c.st[id]='matched';if(!cxThread(s,id))s.threads.push({with:id,cx:true,m:[],unread:true});c.live=p.n+' también conectó. Ya pueden conversar.';this.render();this.toast(p.n+' también conectó. Ya pueden conversar. Simulado.')}else if(c.st[id]==='new'){c.sim[id]=true;this.render()}}
  else if(kind==='first'){if(c.st[id]==='pending')this.cxSim('recip',id);if(c.st[id]!=='matched')return;var t=cxThread(s,id);t.m.push({me:false,t:p.first,sim:true});var here=!!(s.view&&s.view.k==='dm'&&s.view.id===id);if(!here)t.unread=true;c.live=p.n+' te escribió. Mensaje simulado.';this.render()}
  else if(kind==='reset'){s.cx=cxFresh();s.threads=s.threads.filter(function(t){return!t.cx});s.view=null;s.sheet=null;s.dmDraft='';s.dmStarter=false;s.ctab='cx';s.tab='circulos';s.hist=[];s.toast=null;this.render()}
  else if(kind==='interests'){s.cint=id?id.slice():[];this.render()}
  else if(kind==='preset'){Object.assign(s,{view:null,sheet:null,dmDraft:'',dmStarter:false,hist:[],toast:null});s.cx=cxFresh();s.threads=s.threads.filter(function(t){return!t.cx});cxPreset(s,id);this.render()}};
function markSmall(r){r.querySelectorAll('button,a,input,textarea,select').forEach(function(el){var b=el.getBoundingClientRect();if(b.width&&(b.width<44||b.height<44))el.classList.add('small-tap')})}

/*SES-BEGIN*/
