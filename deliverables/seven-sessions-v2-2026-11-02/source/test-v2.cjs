/* Seven sessions v2 · automated checks (headless Chromium). node test-v2.cjs <dir> */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const DIR=path.resolve(process.argv[2]||'.');const SHOTS=path.join(DIR,'screens');fs.mkdirSync(SHOTS,{recursive:true});
const results=[];let fails=0;function ok(name,cond,info){results.push({name,pass:!!cond,info:info||''});if(!cond){fails++;console.log('FAIL',name,info||'')}}
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(DIR,'sesiones-v2.html'));await p.waitForTimeout(600);
/* in-page helpers */
await p.evaluate(()=>{
 window.H={
  ph:()=>document.querySelector('#phone'),
  q:()=>{var h=document.querySelector('#phone #pq');return h?h.textContent:''},
  run:()=>Elara.sesRun?Elara.sesRun(APP.s):null,
  scr:()=>{var r=Elara.sesRun(APP.s);if(!r)return null;var sc=Elara.sesScreens(r);return sc[r.i]},
  prim:()=>[...document.querySelectorAll('#phone .dock .btn')].filter(b=>!b.classList.contains('sec')&&!b.classList.contains('quiet')).length,
  nav:()=>!!document.querySelector('#phone nav'),
  recap:()=>{var e=document.querySelector('#phone .ss-recap');return e?e.textContent:''},
  bubbles:()=>document.querySelectorAll('#phone .eres.reply').length,
  /* answer the current question: choose index, camino key, multi indexes or text */
  ans:(A)=>{var r=Elara.sesRun(APP.s);var cur=Elara.sesScreens(r)[r.i];if(cur[0]!=='q')return 'notq:'+cur;var id=cur.slice(2);var st=Elara.sesStepsOf(r).find(x=>x.id===id);
    if(st.kind==='info'){}else if(st.kind==='multi'){[0,1].forEach(i=>APP.act('ssmulti',{v:String(i)}))}else if(st.kind==='camino'){APP.act('sspick',{v:A.path})}else if(st.kind==='choose'){APP.act('sspick',{v:String(A[id]!==undefined?A[id]:0)})}else{APP.sesInput(A[id]||'Algo concreto que escribí')}
    APP.act('ssnext',{});return id}};
});
const PATHS={empleo:{s1:1,s4:'Llevaba el inventario y detectaba faltantes',s6:'Puedo ayudar con el inventario; lo demostré cuando detectaba faltantes en la tienda',s3:'Tengo experiencia en atención al cliente, pero solo puedo de 9 a 2',s5q:'oportunidad'},
 negocio:{s1:5,s4:'Hago pasteles para los cumpleaños de mi familia desde hace años',s6:'Ayudaría a familias del barrio a resolver los pasteles de cumpleaños sin salir de casa',s3:'Sé hacer pan y tengo horno; me falta saber si alguien lo compraría',s5q:'primera prueba'},
 apoyo:{s1:0,s4:0,s6:'Hola, quería saber si la ayuda para la renta aplica en mi ciudad. Mi situación es que crío sola a dos hijos.',s3:'Quiero aclarar una ayuda para la renta; tiene que poder hacerse por la mañana',s5q:'trámite o apoyo'}};
const COMBOS=[];for(const s2 of 'AB')for(const recap of 'AB')for(const reply of 'AB')COMBOS.push({s2,recap,reply});
/* full real path: every path × every variant combination, sessions 1–7 */
for(const pth of Object.keys(PATHS)){for(const vr of COMBOS){const tag=pth+' '+vr.s2+vr.recap+vr.reply;const P=PATHS[pth];
  const res=await p.evaluate(({pth,vr,P})=>{const out={};APP.s.test=Elara.sesFresh(vr);APP.s.done={1:7,2:0};APP.s.hist=[];APP.go({view:null,tab:'hoy',sheet:null});
   const log=[];const bub=[];const nav=[];const prim=[];const firstQ={};const recap={};
   function session(n,answers){APP.openEntry();nav.push(H.nav());recap[n]=H.recap();firstQ[n]=H.q();let guard=0;let ai=0;
     while(H.scr()!=='end'&&guard++<30){const cur=H.scr();prim.push(H.prim());if(cur[0]==='q'){H.ans(answers)}else{bub.push(n+':'+cur);APP.act('ssnext',{})}}
     const endBubbles=H.bubbles();const take=document.querySelector('#phone .ss-take')?.textContent||'';APP.act('ssfinish',{});const navAfter=H.nav();APP.sesNextDay();return{endBubbles,take,navAfter}}
   const s={};
   s[1]=session(1,{path:pth,tema:P.s1,pregunta:'¿Qué día me pagan?'});
   s[2]=session(2,{path:pth,situacion:2});
   s[3]=session(3,{path:pth,condicion:P.s3});
   s[4]=session(4,{path:pth,linea:P.s4,donde:0});
   s[5]=session(5,{path:pth,imprescindible:pth==='negocio'?'Que dos vecinas me digan que comprarían pan los sábados':'Que atiendan por la mañana y que no me pidan documentos que no tengo'});
   s[6]=session(6,{path:pth,frase:P.s6});
   s[7]=session(7,{path:pth,decision:0,ahora:'Ahora puedo explicar lo que sé hacer con un ejemplo'});
   return{s,bub,nav,prim,firstQ,recap,done:APP.s.test.done,path:APP.s.test.path,ans5:APP.s.test.ans[5],ans4:APP.s.test.ans[4]}},{pth,vr,P});
  ok(tag+' · all seven sessions completed',res.done===7,'done='+res.done);
  ok(tag+' · path kept',res.path===pth,res.path);
  ok(tag+' · nav hidden in every session',res.nav.every(x=>x===false));
  ok(tag+' · at most one primary action per screen',res.prim.every(x=>x<=1),JSON.stringify(res.prim));
  const s2fold=vr.s2==='B'&&pth==='apoyo';
  ok(tag+' · session 2 '+(s2fold?'folded':'asks'),s2fold?/Ya sabemos/.test(res.firstQ[2]):/cómo está tu situación/.test(res.firstQ[2]),res.firstQ[2]);
  ok(tag+' · recap '+(vr.recap==='B'?'shown':'absent')+' on 2–7',[2,3,4,5,6,7].every(n=>vr.recap==='B'?/^(Ayer|La última vez) te llevaste/.test(res.recap[n]):res.recap[n]===''),JSON.stringify(res.recap));
  ok(tag+' · no recap on session 1',res.recap[1]==='');
  if(vr.reply==='A')ok(tag+' · replies after steps (A)',res.bub.length>=8,res.bub.length+'');else{ok(tag+' · no mid-session replies (B)',res.bub.length===0,res.bub.join(','));ok(tag+' · one reply at the end (B)',[1,3,4,5,6,7].every(n=>res.s[n].endBubbles===1),JSON.stringify(Object.values(res.s).map(x=>x.endBubbles)))}
  if(vr.reply==='A')ok(tag+' · no end bubble (A)',Object.values(res.s).every(x=>x.endBubbles===0));
  ok(tag+' · nav restored after each session',Object.values(res.s).every(x=>x.navAfter===true));
  if(pth==='apoyo'){ok(tag+' · session 4 apoyo chooses where to ask (no evidence line)',res.ans4&&res.ans4.donde===0&&res.ans4.linea===undefined,JSON.stringify(res.ans4));ok(tag+' · session 6 apoyo takeaway is the message',/Tu mensaje/.test(res.s[6].take),res.s[6].take)}
  else ok(tag+' · session 4 '+pth+' writes a line',res.ans4&&typeof res.ans4.linea==='string');
  ok(tag+' · session 5 takeaway label fits path',pth==='negocio'?/Tu prueba/.test(res.s[5].take):/Tu filtro/.test(res.s[5].take),res.s[5].take.slice(0,80));
}}
/* session 5 and 7 content per path (preview scenarios) */
const s5=await p.evaluate(()=>{APP.s.test.vr={s2:'A',recap:'A',reply:'A'};const o={};[['a','empleo'],['d','apoyo'],['e','negocio']].forEach(([k,pth])=>{APP.sesScenario(5,k);APP.act('ssnext',{});o[pth]=H.q();APP.act('ssnext',{});APP.act('ssnext',{});o[pth+'_rep']=document.querySelector('#phone .eres.reply')?.textContent||''});return o});
ok('S5 empleo asks about an opportunity',/oportunidad/.test(s5.empleo),s5.empleo);ok('S5 apoyo asks about a trámite',/trámite o apoyo/.test(s5.apoyo),s5.apoyo);ok('S5 negocio asks about a first test',/primera prueba/.test(s5.negocio),s5.negocio);
const s7=await p.evaluate(()=>{const o={};[['a','empleo'],['c','apoyo'],['d','negocio']].forEach(([k,pth])=>{APP.sesScenario(7,k);APP.act('ssnext',{});o[pth]=document.querySelector('#phone .eres.reply')?.textContent||''});return o});
ok('S7 empleo reply mentions an offer',/oferta/.test(s7.empleo),s7.empleo);ok('S7 apoyo reply does not assume a job offer',!/oferta/.test(s7.apoyo)&&/mensaje/.test(s7.apoyo),s7.apoyo);ok('S7 negocio reply is a no-cost ask',/sin gastar/.test(s7.negocio)&&!/oferta/.test(s7.negocio),s7.negocio);
/* support path never names a local service */
const loc=await p.evaluate(()=>JSON.stringify(Elara.SES.map(d=>d.steps.filter(s=>s.onlyPath==='apoyo'||s.v&&s.v.apoyo))));
ok('Support path names no specific service, address or phone number',!/\d{3}[\s-]?\d{3,}|calle |avenida |www\.|http/i.test(loc));
/* change path mid-session swaps the step */
const ch=await p.evaluate(()=>{APP.sesScenario(4,'a');APP.act('ssnext',{});const before=H.q();APP.act('sschange',{});APP.act('sspick',{v:'apoyo'});APP.act('ssnext',{});const after=H.q();APP.act('sschange',{});APP.act('sspick',{v:'ninguno'});APP.act('ssnext',{});return{before,after,none:H.scr()}});
ok('Change path S4: empleo → apoyo swaps the question',/experiencia verdadera/.test(ch.before)&&/Dónde podrías preguntar/.test(ch.after),JSON.stringify(ch));ok('Change path to «Ninguno» skips the path question',ch.none==='end',ch.none);
/* skip, low capacity, stop/resume, gap, correction */
const k=await p.evaluate(()=>{const o={};APP.sesPreview(1);APP.act('ssskip',{});APP.act('ssskip',{});o.skipEnd=H.scr();o.skipTake=document.querySelector('#phone .ss-take')?.textContent;o.skipBubbles=H.bubbles();
 APP.sesPreview(2);APP.act('sslow',{});o.low=H.q();APP.act('ssstop',{});o.lowNav=H.nav();
 APP.s.test=Elara.sesFresh();APP.go({view:null,tab:'hoy'});APP.openEntry();APP.act('sspick',{v:'2'});APP.act('ssnext',{});APP.act('ssleave',{});o.resume=document.querySelector('#phone [data-a="entry"],#phone .btn')?.textContent||'';o.entry=Elara.sesScreens?1:0;
 APP.openEntry();o.resumeAt=H.scr();
 APP.sesAdvance(3,'apoyo');APP.s.test.vr.recap='B';APP.sesGap();APP.openEntry();o.gapRecap=H.recap();
 APP.s.test.vr.recap='A';APP.sesScenario(1,'c');APP.act('ssnext',{});APP.act('ssnext',{});APP.act('ssnext',{});APP.act('sscorrect',{});o.corrQ=H.scr();APP.act('ssnext',{});o.corrRep=document.querySelector('#phone .eres.reply')?.textContent||'';
 return o});
ok('Skip all of session 1: no reply, calm takeaway',k.skipEnd==='end'&&k.skipBubbles===0&&/No elegiste un tema/.test(k.skipTake||''),JSON.stringify(k));
ok('«Hoy no puedo» accepted with no task',/No se pierde nada/.test(k.low));
ok('Stop and resume returns to the same step',k.resumeAt==='r:tema'||k.resumeAt==='q:pregunta',k.resumeAt);
ok('Gap return uses «La última vez te llevaste»',/^La última vez te llevaste/.test(k.gapRecap),k.gapRecap);
ok('Correction updates the reply without argument',/^Entendido/.test(k.corrRep),k.corrRep);
/* variant B reply: correction from the end screen */
const eb=await p.evaluate(()=>{APP.s.test.vr.reply='B';APP.sesScenario(3,'a');APP.act('ssnext',{});APP.act('ssnext',{});const atEnd=H.scr();const n=H.bubbles();APP.act('sscorrect',{v:'condicion'});const back=H.scr();APP.s.test.vr.reply='A';return{atEnd,n,back}});
ok('Reply B: one bubble at the end, correction returns to that question',eb.atEnd==='end'&&eb.n===1&&eb.back==='q:condicion',JSON.stringify(eb));
/* copy button for the support message */
const cp=await p.evaluate(()=>{APP.sesScenario(6,'c');APP.act('ssnext',{});APP.act('ssnext',{});APP.act('ssnext',{});return !!document.querySelector('#phone [data-a="sscopy"]')});ok('S6 apoyo offers «Copiar mi mensaje»',cp);
/* layout: 4 devices × 100/160% text on key screens; keyboard */
const DEVS=[['ios',false,'iphone15'],['ios',true,'iphonese'],['and',false,'pixel8'],['and',true,'android360']];
const states=[[1,'b','q'],[2,'fold','q'],[4,'c','q'],[5,'d','q'],[6,'c','end'],[7,'c','end']];
for(const [plat,small,dn] of DEVS){for(const k2 of [1,1.6]){
  await p.evaluate(({plat,small,k2})=>{const btn=[...document.querySelectorAll('#c-plat button')].find(b=>b.textContent===(plat==='ios'?'iOS':'Android'));btn.click();[...document.querySelectorAll('#c-dev button')][small?1:0].click();[...document.querySelectorAll('#c-k button')][k2>1?2:0].click();APP.s.test.vr.s2='B'},{plat,small,k2});
  for(const [n,scn,where] of states){const m=await p.evaluate(({n,scn,where})=>{APP.sesScenario(n,scn);if(where==='end'){let g=0;while(H.scr()!=='end'&&g++<10)APP.act('ssnext',{})}
    const ph=document.querySelector('#phone .ph')||document.querySelector('#phone>div');const scr=document.querySelector('#phone .scr');
    const over=[...document.querySelectorAll('#phone .pr-body *')].some(e=>{const r=e.getBoundingClientRect(),pr=document.querySelector('#phone .pr-body').getBoundingClientRect();return r.width>0&&(r.right>pr.right+1||r.left<pr.left-1)});
    const small=[...document.querySelectorAll('#phone .pr-body button,#phone .dock button,#phone .pr-top button')].filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&(r.height<44||r.width<44)}).map(x=>x.textContent.trim().slice(0,30));
    const tiny=[];document.querySelectorAll('#phone .pr-body *, #phone .dock *').forEach(e=>{if(!e.childNodes.length)return;const hasText=[...e.childNodes].some(c=>c.nodeType===3&&c.textContent.trim());if(!hasText)return;const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<14)tiny.push(e.textContent.trim().slice(0,24)+':'+fs)});
    const body=document.querySelector('#phone .pr-body');const hs=document.documentElement.scrollWidth>document.documentElement.clientWidth;
    return{over,small,tiny,q:H.q().slice(0,40),hs}},{n,scn,where});
    const t=dn+' '+Math.round(k2*100)+'% · S'+n+' '+where;
    ok(t+' · no horizontal overflow',!m.over&&!m.hs);ok(t+' · targets ≥ 44',m.small.length===0,m.small.join('|'));ok(t+' · text ≥ 14 px',m.tiny.length===0,m.tiny.slice(0,4).join('|'));
    if(k2===1&&(dn==='iphone15'||dn==='pixel8'))await p.locator('#phone').screenshot({path:path.join(SHOTS,dn+'-s'+n+'-'+scn+'-'+where+'.png')});
  }}}
/* keyboard open on reflect steps: input stays above the keyboard and the action is visible */
for(const [plat,small,dn] of DEVS){const kb=await p.evaluate(({plat,small})=>{[...document.querySelectorAll('#c-plat button')].find(b=>b.textContent===(plat==='ios'?'iOS':'Android')).click();[...document.querySelectorAll('#c-dev button')][small?1:0].click();[...document.querySelectorAll('#c-k button')][0].click();
  APP.sesScenario(6,'c');APP.act('ssnext',{});APP.go({kb:true});const ta=document.querySelector('#phone #ssin'),k=document.querySelector('#phone .kbd'),btn=document.querySelector('#phone .dock .btn');if(!ta||!k)return{miss:true};
  const a=ta.getBoundingClientRect(),kk=k.getBoundingClientRect(),bb=btn.getBoundingClientRect();const res={taAbove:a.top<kk.top,btnAbove:bb.bottom<=kk.top+1};const back=APP.back();res.kbAfterBack=APP.s.kb;APP.go({kb:false});return res},{plat,small});
  ok(dn+' · keyboard: input and action above the keyboard',kb&&!kb.miss&&kb.taAbove&&kb.btnAbove,JSON.stringify(kb));ok(dn+' · keyboard: Back closes the keyboard first',kb&&kb.kbAfterBack===false,JSON.stringify(kb))}
/* tester page: assignment by code, no network, notes local */
const tp=await b.newPage();const net=[];tp.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))net.push(r.url())});tp.on('pageerror',e=>errs.push('tester:'+e.message));
for(const code of ['t1','t2','t3','t4','t5','t6','t7','t8']){await tp.goto('file://'+path.join(DIR,'tester.html')+'#'+code);await tp.waitForTimeout(250);await tp.reload();await tp.waitForTimeout(400);
  const v=await tp.evaluate((code)=>({vr:APP.s.test.vr,exp:SES_ASSIGN[code],code:document.getElementById('t-code').textContent,ctl:!!document.querySelector('.sv-ctl')}),code);
  ok('tester '+code+' gets its assigned variants',JSON.stringify(v.vr)===JSON.stringify(v.exp)&&v.code===code.toUpperCase()&&!v.ctl,JSON.stringify(v))}
await tp.screenshot({path:path.join(SHOTS,'tester-page.png')});
ok('tester page makes no network requests',net.filter(u=>!/fonts\.(googleapis|gstatic)/.test(u)).length===0,net.join(' '));
/* tester page: notes persist per code, random assignment, phone-width fit */
await tp.goto('file://'+path.join(DIR,'tester.html')+'#t3');await tp.waitForTimeout(300);
await tp.fill('#t-notes','nota de prueba');await tp.dispatchEvent('#t-notes','input');await tp.reload();await tp.waitForTimeout(400);
ok('tester notes stay in this browser for the same code',(await tp.inputValue('#t-notes'))==='nota de prueba');
ok('tester page has «Copiar notas» and the Prototipo label',await tp.evaluate(()=>!!document.querySelector('#t-copy')&&/Prototipo/.test(document.body.textContent)));
const tp2=await b.newPage();await tp2.goto('file://'+path.join(DIR,'tester.html'));await tp2.waitForTimeout(400);
const rnd=await tp2.evaluate(()=>{const pick=!document.getElementById('t-pick').hidden;document.getElementById('t-rand').click();return{pick,hash:location.hash}});await tp2.waitForTimeout(300);
const rcode=await tp2.evaluate(()=>location.hash);ok('no code: picker shown, «al azar» assigns a code in the URL',rnd.pick&&/^#t[1-8]$/.test(rcode),JSON.stringify(rnd)+rcode);
for(const [w,h] of [[390,844],[360,640]]){const m=await b.newPage({viewport:{width:w,height:h}});await m.goto('file://'+path.join(DIR,'tester.html')+'#t2');await m.waitForTimeout(400);
  const hs=await m.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok('tester page at '+w+' px wide: no horizontal scroll',hs<=0,'extra '+hs);await m.screenshot({path:path.join(SHOTS,'tester-on-phone-'+w+'.png'),fullPage:false});await m.close()}
/* balance of the assignment */
const bal=await tp.evaluate(()=>{const c={};['t1','t2','t3','t4'].forEach(t=>{Object.entries(SES_ASSIGN[t]).forEach(([k,v])=>{c[k+v]=(c[k+v]||0)+1})});return c});
ok('t1–t4 balance every variant 2/2',Object.values(bal).every(x=>x===2),JSON.stringify(bal));
ok('no page errors',errs.length===0,errs.join(' | '));
fs.writeFileSync(path.join(DIR,'check-results.json'),JSON.stringify({run:new Date().toISOString(),passed:results.length-fails,failed:fails,results},null,1));
console.log('passed',results.length-fails,'failed',fails);await b.close();process.exit(fails?1:0)})();
