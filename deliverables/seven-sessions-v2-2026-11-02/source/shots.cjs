/* Screens per session × path × platform, plus variant states. node shots.cjs <dir> */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const DIR=path.resolve(process.argv[2]||'.');const O=path.join(DIR,'screens');fs.mkdirSync(O,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1000}});await p.goto('file://'+path.join(DIR,'sesiones-v2.html'));await p.waitForTimeout(500);
const scr=()=>p.evaluate(()=>{const r=Elara.sesRun(APP.s);return r?Elara.sesScreens(r)[r.i]:null});
const set=(plat)=>p.evaluate((plat)=>{[...document.querySelectorAll('#c-plat button')].find(b=>b.textContent===(plat==='ios'?'iOS':'Android')).click();[...document.querySelectorAll('#c-dev button')][0].click();[...document.querySelectorAll('#c-k button')][0].click()},plat);
const shot=n=>p.locator('#phone').screenshot({path:path.join(O,n+'.png')});
const SCN={empleo:{1:'a',2:'b',3:'a',4:'a',5:'a',6:'b',7:'a'},apoyo:{1:'b',2:'a',3:'b',4:'c',5:'d',6:'c',7:'c'},negocio:{1:'c',2:'c',3:'c',4:'d',5:'e',6:'d',7:'d'}};
for(const plat of ['ios','and']){await set(plat);
 for(const [pth,m] of Object.entries(SCN))for(const [n,k] of Object.entries(m)){
  await p.evaluate(({n,k})=>{APP.s.test.vr={s2:'A',recap:'A',reply:'A'};APP.sesScenario(+n,k)},{n,k});
  // advance past quiet camino
  let g=0;while(g++<6){const c=await scr();if(c!=='q:camino')break;await p.evaluate(()=>APP.act('ssnext',{}))}
  await shot(`${plat}-${pth}-s${n}-question`);
  g=0;while(g++<12){const c=await scr();if(!c||c==='end')break;await p.evaluate(()=>APP.act('ssnext',{}))}
  await shot(`${plat}-${pth}-s${n}-end`);}
}
await set('ios');
const st=async(name,fn,arg)=>{await p.evaluate(fn,arg);await shot('variant-'+name)};
await st('s2B-fold',()=>{APP.s.test.vr={s2:'B',recap:'A',reply:'A'};APP.sesScenario(2,'fold')});
await st('recapB-s4',()=>{APP.s.test.vr={s2:'A',recap:'B',reply:'A'};APP.sesScenario(4,'c')});
await st('recapB-gap',()=>{APP.s.test=Elara.sesFresh({s2:'A',recap:'B',reply:'A'});APP.sesAdvance(3,'apoyo');APP.sesGap();APP.go({view:null,tab:'hoy'});APP.openEntry()});
await st('replyA-step',()=>{APP.s.test.vr={s2:'A',recap:'A',reply:'A'};APP.sesScenario(3,'a');APP.act('ssnext',{});APP.act('ssnext',{})});
await st('replyB-end',()=>{APP.s.test.vr={s2:'A',recap:'A',reply:'B'};APP.sesScenario(3,'a');let g=0;while(g++<8){const r=Elara.sesRun(APP.s);if(Elara.sesScreens(r)[r.i]==='end')break;APP.act('ssnext',{})}});
await st('s6-apoyo-copy',()=>{APP.s.test.vr={s2:'A',recap:'A',reply:'A'};APP.sesScenario(6,'c');let g=0;while(g++<8){const r=Elara.sesRun(APP.s);if(Elara.sesScreens(r)[r.i]==='end')break;APP.act('ssnext',{})}});
await st('keyboard-s6',()=>{APP.sesScenario(6,'c');APP.act('ssnext',{});APP.go({kb:true})});
await p.evaluate(()=>APP.go({kb:false}));
await p.evaluate(()=>{[...document.querySelectorAll('#c-dev button')][1].click();[...document.querySelectorAll('#c-k button')][2].click();APP.sesScenario(4,'c');APP.act('ssnext',{})});await shot('iphonese-160-s4-apoyo-where');
await p.screenshot({path:path.join(O,'reviewer-page.png')});
await b.close();console.log(fs.readdirSync(O).length,'files')})();
