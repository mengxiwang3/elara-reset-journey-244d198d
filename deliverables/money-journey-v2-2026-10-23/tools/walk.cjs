// node walk.cjs <journey-file>  — walks all 35 curriculum days of one area + dep and help checks
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const file=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const R=[];const ok=(n,v)=>R.push((v?'PASS ':'FAIL ')+n);let walked=0;const fails=[];const errs=[];
const T=(pr,ms=5000)=>Promise.race([pr,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))]);
for(let c=1;c<=5;c++){
  const p=await b.newPage({viewport:{width:1100,height:900}});p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://localhost:8160/${file}?c=${c}`);await p.waitForTimeout(500);
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await p.waitForTimeout(500);
  for(let d=1;d<=7;d++){
    try{
      await T(p.click(`#gd button[data-d="${d}"]`));await p.waitForTimeout(120);
      await T(p.click('[data-a="start"]'));await p.waitForTimeout(120);
      let ans;
      if(await p.$('[data-a="nmulti"]')){await T(p.click('[data-a="nmulti"][data-i="0"]'));ans=(await p.$eval('[data-a="nmulti"][data-i="0"]',e=>e.innerText)).replace('✓','').trim();}
      else if(await p.$('[data-a="nopt"][data-i="0"]')){await T(p.click('[data-a="nopt"][data-i="0"]'));ans=(await p.$eval('[data-a="nopt"][data-i="0"]',e=>e.innerText)).replace('✓','').trim();}
      else {ans=`resp ${c}-${d}`;await T(p.fill('textarea[data-field="gtext"]',ans));await p.dispatchEvent('textarea[data-field="gtext"]','input');}
      await p.waitForTimeout(80);
      if(await p.$eval('[data-a="primary"]',e=>e.disabled)) throw 'primary disabled after answer';
      await T(p.click('[data-a="primary"]'));await p.waitForTimeout(120);
      if(!(await p.$('.kicker'))) throw 'no optional step';
      if(await p.$eval('[data-a="primary"]',e=>e.disabled)) await T(p.click('[data-a="skip"]')); else await T(p.click('[data-a="primary"]'));
      await p.waitForTimeout(150);
      const sum=await T(p.$eval('.sum',e=>e.innerText));
      if(!sum.toLowerCase().includes(ans.slice(0,18).toLowerCase())) throw 'summary missing answer: '+ans.slice(0,30)+' | '+sum.slice(0,90).replace(/\n/g,' / ');
      walked++;
    }catch(e){fails.push(`c${c} d${d}: ${e.message||e}`);}
  }
  await p.close();
}
// dependency behaviour: fresh state → fallback shown; answered earlier day → recall shown
const deps=await (async()=>{const p=await b.newPage();await p.goto(`http://localhost:8160/${file}`);await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{const a=window.CUR_AREA[window.__w||0]||null;return null});await p.close();return r;})();
const p=await b.newPage({viewport:{width:1100,height:900}});p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:8160/${file}`);await p.waitForTimeout(500);
const info=await p.evaluate(()=>{const w=+(window.MJ_START&&window.MJ_START.w);const area=window.CUR_AREA[w];const out=[];
  window.CUR[area].forEach((wk,ci)=>wk.forEach((day,di)=>{const s=day.steps[0];if(s.dep)out.push({c:ci+1,d:di+1,on:s.dep.on,es:s.dep.es});if(s.help)out.push({c:ci+1,d:di+1,help:true});}));return out;});
const depList=info.filter(x=>x.on),helpList=info.filter(x=>x.help);
R.push(`  deps ${depList.length}, help days ${helpList.length}`);
let depOk=0,depBad=[];
for(const x of depList){
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});
  await p.goto(`http://localhost:8160/${file}?c=${x.c}`);await p.waitForTimeout(350);await T(p.click(`#gd button[data-d="${x.d}"]`));await p.waitForTimeout(150);
  try{await T(p.click('[data-a="start"]'));await p.waitForTimeout(120);
    const shown=await p.$eval('.depnote',e=>e.innerText).catch(()=>'');if(shown.trim()===x.es.trim())depOk++;else depBad.push(`c${x.c}d${x.d} fallback not shown`);}catch(e){depBad.push(`c${x.c}d${x.d} ${e.message}`)}
}
ok(`${file} fallback shown on every dep day when the earlier day was skipped (${depOk}/${depList.length})`,depOk===depList.length);depBad.slice(0,5).forEach(x=>R.push('  '+x));
// one recall check: answer the depended-on day, then visit the dep day
if(depList.length){const x=depList[0];const m=/W(\d)-D(\d)$/.exec(x.on);
  await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});
  await p.goto(`http://localhost:8160/${file}?c=${m[1]}`);await p.waitForTimeout(350);await T(p.click(`#gd button[data-d="${m[2]}"]`));await p.waitForTimeout(150);await T(p.click('[data-a="start"]'));await p.waitForTimeout(120);
  if(await p.$('[data-a="nmulti"]'))await p.click('[data-a="nmulti"][data-i="0"]');else if(await p.$('[data-a="nopt"][data-i="0"]'))await p.click('[data-a="nopt"][data-i="0"]');else{await p.fill('textarea[data-field="gtext"]','mi respuesta anterior');await p.dispatchEvent('textarea[data-field="gtext"]','input');}
  await p.waitForTimeout(150);await T(p.click('[data-a="primary"]'));await p.waitForTimeout(200);
  await p.goto(`http://localhost:8160/${file}?c=${x.c}`);await p.waitForTimeout(350);await T(p.click(`#gd button[data-d="${x.d}"]`));await p.waitForTimeout(150);await T(p.click('[data-a="start"]'));await p.waitForTimeout(150);
  ok(`${file} recall replaces fallback once ${x.on} is answered`,!!(await p.$('.recall'))&&!(await p.$('.depnote')));}
if(helpList.length){const x=helpList[0];await p.goto(`http://localhost:8160/${file}?c=${x.c}`);await p.waitForTimeout(350);await T(p.click(`#gd button[data-d="${x.d}"]`));await p.waitForTimeout(150);await T(p.click('[data-a="start"]'));await p.waitForTimeout(150);
  await T(p.click('[data-a="helpnow"]'));await p.waitForTimeout(150);ok(`${file} help button opens the /crisis-help note`,(await p.$eval('.helpnote',e=>e.innerText).catch(()=>'')).includes('/crisis-help'));}
ok(`${file} walked 35/35 days`,walked===35);fails.slice(0,8).forEach(f=>R.push('  '+f));
ok(`${file} no page errors`,errs.length===0);errs.slice(0,3).forEach(e=>R.push('  ERR '+e.slice(0,140)));
console.log(R.join('\n'));await b.close()})().catch(e=>{console.log('CRASH',e.message);process.exit(1)});
