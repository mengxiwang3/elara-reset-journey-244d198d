
(function(){
var cfg={plat:'ios',small:false,k:1,kb:false,nav:'gesture',nomo:false,scn:1};
var app=null,DEVS={ios:['ios15','iosse'],and:['pixel8','andsm']};
function make(keep){var dev=DEVS[cfg.plat][cfg.small?1:0],D=Elara.DEV[dev];var host=document.getElementById('phone');var old=app&&app.s;host.innerHTML='';var root=document.createElement('div');host.appendChild(root);
  var s=Elara.fresh('curso');s.plat=D.p;s.dev=dev;s.w=D.w;s.h=D.h;s.k=cfg.k;s.kb=cfg.kb;s.navmode=cfg.nav;s.nomo=cfg.nomo;s.hour=9;
  if(keep&&old){['test','done','date','tab','view','hist','sheet'].forEach(function(k){s[k]=old[k]})}else{s.test=Elara.sesFresh();s.done={1:7,2:0}}
  app=new Elara.App(root,s,{autokb:true,onChange:paint});window.APP=app;
  document.getElementById('ttl').textContent=(D.p==='ios'?'iOS · ':'Android · ')+(dev==='ios15'?'iPhone 15 · 393 × 852':dev==='iosse'?'iPhone SE · 375 × 667':dev==='pixel8'?'Pixel 8 · 412 × 915':'Android pequeño · 360 × 640');paint(app)}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function paint(a){if(!a||!a.s.test)return;var T=a.s.test,pv=!!T.pv;var b=document.getElementById('pvbadge');b.classList.toggle('on',pv);document.getElementById('pvn').textContent=T.pv||'';
  var L=T.last,box=document.getElementById('last');
  if(L)box.innerHTML='<dl style="margin:0"><dt>Sesión '+L.n+' · paso «'+esc(L.step)+'»</dt><dd>'+esc(L.q)+'</dd><dt>Regla</dt><dd>'+esc(L.rule)+(L.scripted?'<span class="sv-tag s">Ejemplo de prototipo</span>':'<span class="sv-tag g">No simulado</span>')+'</dd>'+(L.text?'<dt>Texto mostrado</dt><dd>«'+esc(L.text)+'»</dd>':'')+'<dt>Guía para generar la respuesta (DEV-HANDOFF §2)</dt><dd>'+esc(L.guidance)+'</dd>'+(L.scripted?'':'<dt>Nota</dt><dd>Respuesta libre: en la app la generaría Elara con la guía de este día (no simulada aquí).</dd>')+'</dl>';
  else box.innerHTML='<p style="margin:0">Responde una pregunta en el teléfono para ver aquí qué regla produjo la respuesta de Elara.</p>';
  var run=document.getElementById('c-run').querySelector('[data-k="state"]');if(run)run.textContent='Estado real: '+T.done+' de 7 hechas'+(T.justDone?' · la siguiente se abre mañana':'')+(T.gap?' · regreso tras 9 días':'');
  if(T.pv&&cfg.scn!==T.pv){cfg.scn=T.pv;drawScn()}}
function seg(id,items,get,set){var el=document.getElementById(id);function draw(){el.innerHTML='';items().forEach(function(it){var x=document.createElement('button');x.type='button';x.textContent=it[1];if(/^\d$/.test(it[1]))x.setAttribute('aria-label',(id==='c-pv'?'Ver sesión ':'Avanzar a la sesión ')+it[1]+(id==='c-pv'?' (vista previa)':''));x.style.minWidth='44px';if(get)x.setAttribute('aria-pressed',String(get()===it[0]));x.onclick=function(){set(it[0]);draw()};el.appendChild(x)})}draw();return draw}
seg('c-adv',function(){return [2,3,4,5,6,7].map(function(n){return[n,String(n)]})},null,function(n){app.sesAdvance(n)});
seg('c-run',function(){return [['hoy','Ir a Hoy'],['next','Día siguiente'],['gap','Regreso tras 9 días']]},null,function(v){
  if(v==='hoy'){app.s.test.pv=null;app.s.hist=[];app.go({view:null,tab:'hoy',sheet:null})}else if(v==='next')app.sesNextDay();else if(v==='gap')app.sesGap();else app.sesAdvance(+v.slice(3))});
(function(){var el=document.getElementById('c-run');var p=document.createElement('p');p.className='sv-hint';p.setAttribute('data-k','state');el.appendChild(p)})();
seg('c-pv',function(){return [1,2,3,4,5,6,7].map(function(n){return[n,String(n)]})},function(){return app&&app.s.test.pv},function(n){cfg.scn=n;drawScn();app.sesPreview(n)});
var drawScn;function scnItems(){return (Elara.SES_SCEN[cfg.scn]||[]).map(function(x){return[x[0],x[1]]})}
drawScn=function(){document.getElementById('c-scn-n').textContent=cfg.scn;dS()};var dS=seg('c-scn',scnItems,null,function(k){app.sesScenario(cfg.scn,k)});
seg('c-case',function(){return [['skip','Saltar (sesión 1)'],['low','«Hoy no puedo» (sesión 2)'],['corr','Corrección (sesión 1, ejemplo c)'],['stop','Parar por hoy y retomar (sesión 1)'],['nos4','Sesión 6 sin la frase de la sesión 4']]},null,function(v){
  var h=document.getElementById('c-case-h');
  if(v==='skip'){app.sesPreview(1);h.textContent='En el teléfono toca «Saltar»: no aparece respuesta de Elara y pasa a la siguiente pregunta; la conclusión propone una pregunta a partir de lo que elegiste o lo dice con calma si saltaste todo.'}
  if(v==='low'){app.sesPreview(2);app.act('sslow',{});h.textContent='«Hoy no puedo»: Elara lo acepta, ofrece «Parar por hoy» y dice que no se pierde nada. Sin tarea.'}
  if(v==='corr'){cfg.scn=1;drawScn();app.sesScenario(1,'c');h.textContent='Toca «Seguir» dos veces y luego «No quise decir eso»: la respuesta queda editable con «Es por mi hermana…» y Elara actualiza sin discutir.'}
  if(v==='stop'){app.sesAdvance(1);app.openEntry();h.textContent='Recorrido real: responde algo y toca la ✕ («Parar por hoy»). Hoy muestra «Seguir con la sesión 1» y retoma en el mismo paso.'}
  if(v==='nos4'){cfg.scn=6;drawScn();app.sesScenario(6,'c');h.textContent='Sin frase de la sesión 4, la pregunta de la sesión 6 aparece sola, sin cita ni hueco.'}});
seg('c-plat',function(){return[['ios','iOS'],['and','Android']]},function(){return cfg.plat},function(v){cfg.plat=v;make(true)});
seg('c-dev',function(){return[[false,'Estándar'],[true,'Pequeña (SE / 360 × 640)']]},function(){return cfg.small},function(v){cfg.small=v;make(true)});
seg('c-k',function(){return[[1,'100%'],[1.3,'130%'],[1.6,'160%']]},function(){return cfg.k},function(v){cfg.k=v;app.go({k:v})});
seg('c-kb',function(){return[[false,'Cerrado'],[true,'Abierto']]},function(){return cfg.kb},function(v){cfg.kb=v;app.go({kb:v})});
seg('c-nav',function(){return[['gesture','Gestos'],['buttons','3 botones']]},function(){return cfg.nav},function(v){cfg.nav=v;app.go({navmode:v})});
seg('c-mo',function(){return[[false,'Normal'],[true,'Reducido']]},function(){return cfg.nomo},function(v){cfg.nomo=v;app.go({nomo:v})});
document.getElementById('c-reset').onclick=function(){cfg.scn=1;drawScn();make(false)};
document.getElementById('c-back').onclick=function(){app.back()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!document.getElementById('phone').contains(e.target)){e.preventDefault();app.back()}});
/* copy list */
var C=[];Elara.SES.forEach(function(d){C.push(['Sesión '+d.n+' · título (tarjeta de Hoy)',d.title,true],['Sesión '+d.n+' · para qué sirve hoy',d.purpose,true],['Sesión '+d.n+' · próxima sesión',d.next,true])});
C.push(['Sesión 5 · paso 2','De lo que elegiste, ¿qué es imprescindible para ti?',true],['Sesiones 4 y 6 · paso de un toque','Sigues por:',false],['Enlaces','Hoy no puedo · No quise decir eso · Cambiar camino · Parar por hoy · Ver mi kit',true],['Respuesta a «Hoy no puedo»','Está bien. No se pierde nada: lo que respondiste queda guardado y puedes volver cuando quieras.',true],['Acuse de texto libre','Guardé tu frase.',true],['Pantalla final','Te llevas · Próxima sesión · Terminar la sesión N',true],['Hoy','Siete sesiones de prueba de Claridad financiera. · Aquí verás lo que te llevas de cada sesión.',true]);
document.getElementById('copy').innerHTML=C.map(function(c){return'<li><b>'+esc(c[0])+'</b>'+(c[2]?' <span class="new">[NUEVO]</span>':' <span class="new">[DEV-HANDOFF]</span>')+'<br>«'+esc(c[1])+'»</li>'}).join('')+'<li><b>Respuestas de Elara</b> <span class="new">[EJEMPLOS DE PROTOTIPO]</span><br>Escritas para esta revisión a partir de DEV-HANDOFF §2–3; no son copy aprobado.</li>';
make(false);
})();
