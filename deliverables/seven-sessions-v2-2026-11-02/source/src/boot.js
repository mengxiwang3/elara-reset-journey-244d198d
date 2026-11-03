
(function(){
/* reviewer page and tester page share this boot. Tester mode: window.SES_TESTER === true (tester.html). */
var TESTER=!!window.SES_TESTER;
/* tester assignment: t1–t4 is a balanced half of the 2×2×2 design (each variant twice); t5–t8 is the other half */
var ASSIGN={t1:{s2:'A',recap:'A',reply:'A'},t2:{s2:'A',recap:'B',reply:'B'},t3:{s2:'B',recap:'A',reply:'B'},t4:{s2:'B',recap:'B',reply:'A'},
  t5:{s2:'B',recap:'B',reply:'B'},t6:{s2:'B',recap:'A',reply:'A'},t7:{s2:'A',recap:'B',reply:'A'},t8:{s2:'A',recap:'A',reply:'B'}};
window.SES_ASSIGN=ASSIGN;
var cfg={plat:'ios',small:false,k:1,kb:false,nav:'gesture',nomo:false,scn:1,path:'empleo',vr:{s2:'A',recap:'A',reply:'A'},code:null};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
if(TESTER){var h=(location.hash||'').replace('#','').toLowerCase();if(!ASSIGN[h]){var saved=ls('elara-ses-code');if(saved&&ASSIGN[saved])h=saved}
  if(ASSIGN[h]){cfg.code=h;cfg.vr=Object.assign({},ASSIGN[h]);ls('elara-ses-code',h)}}
var app=null,DEVS={ios:['ios15','iosse'],and:['pixel8','andsm']};
function make(keep){var dev=DEVS[cfg.plat][cfg.small?1:0],D=Elara.DEV[dev];var host=document.getElementById('phone');var old=app&&app.s;host.innerHTML='';var root=document.createElement('div');host.appendChild(root);
  var s=Elara.fresh('curso');s.plat=D.p;s.dev=dev;s.w=D.w;s.h=D.h;s.k=cfg.k;s.kb=cfg.kb;s.navmode=cfg.nav;s.nomo=cfg.nomo;s.hour=9;
  if(keep&&old){['test','done','date','tab','view','hist','sheet'].forEach(function(k){s[k]=old[k]})}else{s.test=Elara.sesFresh(cfg.vr);s.done={1:7,2:0}}
  app=new Elara.App(root,s,{autokb:true,onChange:paint});window.APP=app;
  document.getElementById('ttl').textContent=(D.p==='ios'?'iOS · ':'Android · ')+(dev==='ios15'?'iPhone 15 · 393 × 852':dev==='iosse'?'iPhone SE · 375 × 667':dev==='pixel8'?'Pixel 8 · 412 × 915':'Android pequeño · 360 × 640');paint(app)}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var VLAB={s2:{A:'A · se mantiene',B:'B · se pliega'},recap:{A:'A · sin recuerdo',B:'B · «Ayer te llevaste…»'},reply:{A:'A · tras cada paso',B:'B · una al final'}};
function paint(a){if(!a||!a.s.test)return;var T=a.s.test,pv=!!T.pv;var b=document.getElementById('pvbadge');b.classList.toggle('on',pv);document.getElementById('pvn').textContent=T.pv||'';
  var vl=document.getElementById('vline');if(vl)vl.textContent='Variantes activas · sesión 2: '+T.vr.s2+' · recuerdo: '+T.vr.recap+' · respuestas: '+T.vr.reply;
  if(TESTER){var st=document.getElementById('t-state');if(st)st.textContent='Sesiones hechas: '+T.done+' de 7'+(T.justDone?' · la siguiente se abre mañana':'');return}
  var L=T.last,box=document.getElementById('last');
  if(L)box.innerHTML='<dl style="margin:0"><dt>Sesión '+L.n+' · paso «'+esc(L.step)+'»</dt><dd>'+esc(L.q)+'</dd><dt>Regla</dt><dd>'+esc(L.rule)+(L.scripted?'<span class="sv-tag s">Ejemplo de prototipo</span>':'<span class="sv-tag g">No simulado</span>')+'</dd>'+(L.text?'<dt>Texto mostrado</dt><dd>«'+esc(L.text)+'»</dd>':'')+'<dt>Guía para generar la respuesta</dt><dd>'+esc(L.guidance)+'</dd>'+(L.scripted?'':'<dt>Nota</dt><dd>Respuesta libre: en la app la generaría Elara con la guía de este día (no simulada aquí).</dd>')+'</dl>';
  else box.innerHTML='<p style="margin:0">Responde una pregunta en el teléfono para ver aquí qué regla produjo la respuesta de Elara.</p>';
  var run=document.getElementById('c-run').querySelector('[data-k="state"]');if(run)run.textContent='Estado real: '+T.done+' de 7 hechas'+(T.justDone?' · la siguiente se abre mañana':'')+(T.gap?' · regreso tras 9 días':'');
  if(T.pv&&cfg.scn!==T.pv){cfg.scn=T.pv;drawScn()}}
function seg(id,items,get,set){var el=document.getElementById(id);if(!el)return function(){};function draw(){el.innerHTML='';items().forEach(function(it){var x=document.createElement('button');x.type='button';x.textContent=it[1];if(/^\d$/.test(it[1]))x.setAttribute('aria-label',(id==='c-pv'?'Ver sesión ':'Avanzar a la sesión ')+it[1]+(id==='c-pv'?' (vista previa)':''));x.style.minWidth='44px';if(get)x.setAttribute('aria-pressed',String(get()===it[0]));x.onclick=function(){set(it[0]);draw()};el.appendChild(x)})}draw();return draw}
var drawScn=function(){};
if(TESTER){
  /* tester page: code picker, the phone, notes that stay in this browser, facilitator day controls */
  var pick=document.getElementById('t-pick'),main=document.getElementById('t-main');
  if(!cfg.code){pick.hidden=false;main.hidden=true;
    var g=document.getElementById('t-codes');Object.keys(ASSIGN).forEach(function(k){var x=document.createElement('button');x.type='button';x.className='sv-btn';x.textContent=k.toUpperCase();x.onclick=function(){location.hash=k;location.reload()};g.appendChild(x)});
    document.getElementById('t-rand').onclick=function(){var ks=Object.keys(ASSIGN);var k=ks[Math.floor(Math.random()*ks.length)];location.hash=k;location.reload()};
    return}
  window.addEventListener('hashchange',function(){location.reload()});
  pick.hidden=true;main.hidden=false;document.getElementById('t-code').textContent=cfg.code.toUpperCase();
  var notes=document.getElementById('t-notes');var nk='elara-ses-notes-'+cfg.code;notes.value=ls(nk)||'';notes.oninput=function(){ls(nk,notes.value)};
  document.getElementById('t-copy').onclick=function(){var txt='Código '+cfg.code.toUpperCase()+'\n'+notes.value;var m=document.getElementById('t-msg');
    try{navigator.clipboard.writeText(txt).then(function(){m.textContent='Notas copiadas.'},function(){notes.select();m.textContent='No se pudo copiar automáticamente: las notas quedaron seleccionadas.'})}catch(e){notes.select();m.textContent='No se pudo copiar automáticamente: las notas quedaron seleccionadas.'}};
  document.getElementById('t-next').onclick=function(){app.sesNextDay()};
  document.getElementById('t-gap').onclick=function(){app.sesGap()};
  document.getElementById('t-plat').onclick=function(){cfg.plat=cfg.plat==='ios'?'and':'ios';make(true)};
  make(false);return}
seg('c-adv',function(){return [2,3,4,5,6,7].map(function(n){return[n,String(n)]})},null,function(n){app.sesAdvance(n,cfg.path)});
seg('c-advp',function(){return[['empleo','Empleo'],['negocio','Negocio'],['apoyo','Aclarar o apoyo']]},function(){return cfg.path},function(v){cfg.path=v});
seg('c-run',function(){return [['hoy','Ir a Hoy'],['next','Día siguiente'],['gap','Regreso tras 9 días']]},null,function(v){
  if(v==='hoy'){app.s.test.pv=null;app.s.hist=[];app.go({view:null,tab:'hoy',sheet:null})}else if(v==='next')app.sesNextDay();else if(v==='gap')app.sesGap()});
(function(){var el=document.getElementById('c-run');var p=document.createElement('p');p.className='sv-hint';p.setAttribute('data-k','state');el.appendChild(p)})();
['s2','recap','reply'].forEach(function(k){seg('c-v-'+k,function(){return[['A',VLAB[k].A],['B',VLAB[k].B]]},function(){return app?app.s.test.vr[k]:cfg.vr[k]},function(v){cfg.vr[k]=v;app.sesSetVar(k,v);paint(app)})});
seg('c-pv',function(){return [1,2,3,4,5,6,7].map(function(n){return[n,String(n)]})},function(){return app&&app.s.test.pv},function(n){cfg.scn=n;drawScn();app.sesPreview(n)});
function scnItems(){return (Elara.SES_SCEN[cfg.scn]||[]).map(function(x){return[x[0],x[1]]})}
var dS=seg('c-scn',scnItems,null,function(k){app.sesScenario(cfg.scn,k)});drawScn=function(){document.getElementById('c-scn-n').textContent=cfg.scn;dS()};
seg('c-case',function(){return [['skip','Saltar (sesión 1)'],['low','«Hoy no puedo» (sesión 2)'],['corr','Corrección (sesión 1, ejemplo c)'],['stop','Parar por hoy y retomar (sesión 1)'],['nos4','Sesión 6 sin la sesión 4 (apoyo)']]},null,function(v){
  var h=document.getElementById('c-case-h');
  if(v==='skip'){app.sesPreview(1);h.textContent='En el teléfono toca «Saltar»: no aparece respuesta de Elara y pasa a la siguiente pregunta; la conclusión propone una pregunta a partir de lo que elegiste o lo dice con calma si saltaste todo.'}
  if(v==='low'){app.sesPreview(2);app.act('sslow',{});h.textContent='«Hoy no puedo»: Elara lo acepta, ofrece «Parar por hoy» y dice que no se pierde nada. Sin tarea.'}
  if(v==='corr'){cfg.scn=1;drawScn();app.sesScenario(1,'c');h.textContent='Toca «Seguir» hasta la respuesta y luego «No quise decir eso»: la respuesta queda editable con «Es por mi hermana…» y Elara actualiza sin discutir.'}
  if(v==='stop'){app.sesAdvance(1);app.openEntry();h.textContent='Recorrido real: responde algo y toca la ✕ («Parar por hoy»). Hoy muestra «Seguir con la sesión 1» y retoma en el mismo paso.'}
  if(v==='nos4'){cfg.scn=6;drawScn();app.sesScenario(6,'f');h.textContent='Sin la sesión 4, la pregunta de la sesión 6 aparece sola, sin cita ni hueco. Con «Necesito ayuda» la respuesta pide decir qué ayuda.'}});
seg('c-plat',function(){return[['ios','iOS'],['and','Android']]},function(){return cfg.plat},function(v){cfg.plat=v;make(true)});
seg('c-dev',function(){return[[false,'Estándar'],[true,'Pequeña (SE / 360 × 640)']]},function(){return cfg.small},function(v){cfg.small=v;make(true)});
seg('c-k',function(){return[[1,'100%'],[1.3,'130%'],[1.6,'160%']]},function(){return cfg.k},function(v){cfg.k=v;app.go({k:v})});
seg('c-kb',function(){return[[false,'Cerrado'],[true,'Abierto']]},function(){return cfg.kb},function(v){cfg.kb=v;app.go({kb:v})});
seg('c-nav',function(){return[['gesture','Gestos'],['buttons','3 botones']]},function(){return cfg.nav},function(v){cfg.nav=v;app.go({navmode:v})});
seg('c-mo',function(){return[[false,'Normal'],[true,'Reducido']]},function(){return cfg.nomo},function(v){cfg.nomo=v;app.go({nomo:v})});
document.getElementById('c-reset').onclick=function(){cfg.scn=1;drawScn();make(false)};
document.getElementById('c-back').onclick=function(){app.back()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!document.getElementById('phone').contains(e.target)){e.preventDefault();app.back()}});
/* new Spanish (proposed) for María and Alejandra: built from the content flags */
var C=[];Elara.SES.forEach(function(d){['purposeBy','nextBy','titleBy'].forEach(function(k){if(d[k])Object.keys(d[k]).forEach(function(p){C.push(['Sesión '+d.n+' · '+({purposeBy:'para qué sirve',nextBy:'próxima sesión',titleBy:'título'})[k]+' · camino '+p,d[k][p]])})});
  d.steps.forEach(function(st){var tag='Sesión '+d.n+' · '+st.id+(st.onlyPath?' · '+st.onlyPath:'');
    if(st.nuevo){C.push([tag+' · pregunta',st.q]);if(st.opts)C.push([tag+' · opciones',st.opts.join(' · ')]);if(st.note)C.push([tag+' · nota',st.note]);if(st.replies)st.replies.forEach(function(x,i){C.push([tag+' · respuesta «'+st.opts[i]+'»',x])});if(st.tpl)C.push([tag+' · plantilla',st.tpl.join('…')])}
    if(st.repliesBy)Object.keys(st.repliesBy).forEach(function(p){st.repliesBy[p].forEach(function(x,i){C.push([tag+' · respuesta «'+st.opts[i]+'» · camino '+p,x])})});
    if(st.v)Object.keys(st.v).forEach(function(p){if(st.v[p].nuevo){C.push([tag+' · '+p+' · pregunta',st.v[p].q]);if(st.v[p].fmt)C.push([tag+' · '+p+' · formato',st.v[p].fmt])}})})});
C.push(['Sesión 2 · variante B (plegada)',Elara.SES_FOLD_TEXT],['Variante B · recuerdo','Ayer te llevaste · … / La última vez te llevaste · …'],['Sesión 6 · apoyo','Copiar mi mensaje · Copiado.']);
document.getElementById('copy').innerHTML=C.map(function(c){return'<li><b>'+esc(c[0])+'</b> <span class="new">[NUEVO · propuesta]</span><br>«'+esc(c[1])+'»</li>'}).join('')+'<li><b>Respuestas de Elara</b> <span class="new">[EJEMPLOS DE PROTOTIPO]</span><br>Escritas para esta revisión; no son copy aprobado.</li>';
make(false);
})();
