// checks the three Daily Rhythm fixes on journey-oc.html (answers stay in memory, so one page throughout)
const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:900,height:900}});const er=[];p.on('pageerror',e=>er.push(e.message));
const R=[];const ok=(n,v,x)=>R.push((v?'PASS ':'FAIL ')+n+(x?'  ['+x+']':''));const w=t=>p.waitForTimeout(t);
await p.goto('http://localhost:8160/journey-oc.html');await w(900);
const open=async(c,d)=>{await p.click(`#gc button[data-c="${c}"]`);await w(250);await p.click(`#gd button[data-d="${d}"]`);await w(250);await p.click('[data-a="start"]');await w(250);};
const say=async t=>{await p.fill('textarea[data-field="gtext"]',t);await p.dispatchEvent('textarea[data-field="gtext"]','input');await w(150);};
const recall=async()=>{const r=await p.$('.recall');return r?(await r.innerText()):''};const fall=async()=>!!(await p.$('.depnote'));
// fallbacks before any answer
await open(4,7);ok('W4-D7 shows its fallback when W4-D2/3/4 were skipped',await fall()&&!(await recall()));
await open(5,1);ok('W5-D1 shows its fallback when no earlier change was written',await fall()&&!(await recall()));
// W1-D6 multiple choice
await open(1,6);const bs=await p.$$eval('[data-a="nmulti"]',x=>x.map(e=>e.innerText.trim()));
ok('W1-D6 is multiple choice',bs.length===6,bs.join(' / '));
await p.click('[data-a="nmulti"][data-i="0"]');await w(120);await p.click('[data-a="nmulti"][data-i="2"]');await w(120);
let on=await p.$$eval('[data-a="nmulti"]',x=>x.map(e=>e.getAttribute('aria-checked')));ok('two resources can be picked together',on[0]==='true'&&on[2]==='true',on.join(','));
await p.click('[data-a="nmulti"][data-i="4"]');await w(120);on=await p.$$eval('[data-a="nmulti"]',x=>x.map(e=>e.getAttribute('aria-checked')));
ok('«Nada por ahora» clears the others',on[4]==='true'&&on.filter(x=>x==='true').length===1,on.join(','));
await p.click('[data-a="nmulti"][data-i="1"]');await w(120);on=await p.$$eval('[data-a="nmulti"]',x=>x.map(e=>e.getAttribute('aria-checked')));
ok('picking a resource again clears «Nada por ahora»',on[1]==='true'&&on[4]!=='true',on.join(','));
// W4-D7 multi recall
await open(4,3);await say('dormir y comer');await open(4,4);await say('una frase de permiso');
await open(4,7);let r=await recall();ok('W4-D7 quotes both earlier answers when D2 was skipped',r.includes('dormir y comer')&&r.includes('una frase de permiso')&&!(await fall()),r);
await open(4,2);await p.click('[data-a="nopt"][data-i="0"]');await w(150);
await open(4,7);r=await recall();ok('W4-D7 quotes all three once D2 is answered',r.includes('dormir y comer')&&r.includes('una frase de permiso')&&/voy con retraso/i.test(r),r);
// W5-D1 multi recall
await open(1,5);await say('dejar la ropa lista');await open(3,6);await p.click('[data-a="nopt"][data-i="1"]');await w(150);
await open(5,1);r=await recall();ok('W5-D1 quotes the changes from week 1 and week 3',r.includes('dejar la ropa lista')&&/reducir alcance/i.test(r),r);
await p.screenshot({path:'/dev/shm/t/w5d1.jpg',type:'jpeg',quality:60});
ok('no page errors',!er.length,er.join(' | '));console.log(R.join('\n'));await b.close()})();
