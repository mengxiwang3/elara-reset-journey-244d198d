const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const T=(pr,ms=5000)=>Promise.race([pr,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))]);
await p.goto('http://localhost:8160/index.html?w=1&d=1');await p.waitForTimeout(600);
const goDay=async d=>{await T(p.click(`#gd button[data-d="${d}"]`));await p.waitForTimeout(150);};
// day 1: answer focus fields
await goDay(1);await T(p.click('[data-a="start"]'));await p.waitForTimeout(150);
const heads=[];
for(let i=0;i<6;i++){const q=await p.$eval('h2.q, h2',e=>e.innerText).catch(()=>'');heads.push(q);
  if(await p.$('#gf0')){await p.fill('#gf0','pagar la renta');await p.dispatchEvent('#gf0','input');}
  else if(await p.$('.opts [data-a="gopt"]')){await p.click('.opts [data-a="gopt"]');}
  const prim=await p.$('[data-a="primary"]');if(!prim)break;if(await prim.isDisabled()){const sk=await p.$('[data-a="skip"]');if(sk)await sk.click();else break;}else await prim.click();await p.waitForTimeout(150);if(await p.$('.sum'))break;}
console.log('day1 steps:',heads.filter(Boolean).join(' | ').slice(0,300));
for(const [d,label] of [[2,'¿Qué dinero puedes usar ahora?'],[5,'¿Qué atraso podría hacer más daño pronto?']]){
  await goDay(d);await T(p.click('[data-a="start"]'));await p.waitForTimeout(150);
  for(let i=0;i<6;i++){const q=await p.$eval('h2',e=>e.innerText).catch(()=>'');if(q.includes(label))break;const prim=await p.$('[data-a="primary"]');const sk=await p.$('[data-a="skip"]');if(prim&&!(await prim.isDisabled()))await prim.click();else if(sk)await sk.click();await p.waitForTimeout(150);}
  const box=!!(await p.$('textarea[data-field="gtext"]'));console.log((box?'PASS ':'FAIL ')+`day ${d} "${label}" has an input box`);
}
await goDay(7);await T(p.click('[data-a="start"]'));await p.waitForTimeout(200);
const rec=await p.$eval('.opts',e=>e.innerText).catch(()=>'');console.log((rec.includes('pagar la renta')?'PASS ':'FAIL ')+'day 7 recall shows her day 1 answer: '+rec.replace(/\n/g,' / ').slice(0,200));
console.log(errs.length?'ERR '+errs[0]:'PASS no page errors');await b.close()})();
