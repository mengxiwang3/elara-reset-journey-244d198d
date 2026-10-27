// one week on one page: recall on arrival, Elara always answers, day 7 week card, tomorrow teaser
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const [file,c]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:900,height:900}});const er=[];p.on('pageerror',e=>er.push(e.message));
const R=[];const ok=(n,v,x)=>R.push((v?'PASS ':'FAIL ')+file+' c'+c+' '+n+(x?'  ['+x+']':''));const w=t=>p.waitForTimeout(t);
await p.goto(`http://localhost:8160/${file}?c=${c}`);await w(800);let noAck=[],recallMiss=[];
for(let d=1;d<=7;d++){await p.click(`#gd button[data-d="${d}"]`);await w(300);
 const arr=await p.$eval('.pbody',e=>e.innerText);if(d>1&&d!==4&&!/Ayer dijiste/.test(arr))recallMiss.push(d);
 if(d===1)ok('arrival names the place and the week theme',/ESTA SEMANA|Esta semana/i.test(arr),arr.split('\n').slice(0,3).join(' / '));
 if(d===4)continue; // day 4 skipped on purpose
 await p.click('[data-a="start"]');await w(250);
 if(await p.$('[data-a="nopt"][data-i="0"]'))await p.click('[data-a="nopt"][data-i="0"]');else if(await p.$('[data-a="nmulti"][data-i="0"]'))await p.click('[data-a="nmulti"][data-i="0"]');else if(await p.$('textarea[data-field="gtext"]')){await p.fill('textarea[data-field="gtext"]','respuesta del día '+d);await p.dispatchEvent('textarea[data-field="gtext"]','input')}
 await w(250);const fb=await p.$eval('#fb',e=>e.innerText.trim()).catch(()=>'');if(!fb)noAck.push(d);
 for(let k=0;k<5;k++){if(await p.$('.sum'))break;const nx=await p.$('.pfoot .go:not([disabled])');if(nx){await nx.click();await w(300);continue}const sk=await p.$('.pfoot [data-a="skip"]');if(sk){await sk.click();await w(300);continue}break}
 const sm=await p.$eval('.pbody',e=>e.innerText);
 if(d===3)ok('summary teases tomorrow\'s place',/Mañana te espera/.test(sm),(sm.match(/Mañana te espera[^\n]*/)||[''])[0]);
 if(d===7){const rows=await p.$$eval('.weekcard li',x=>x.map(e=>e.innerText.replace(/\n/g,' — ')));ok('day 7 shows the whole week (7 rows)',rows.length===7,rows.length);
  ok('week card keeps her answers and marks the skipped day kindly',rows.filter(r=>/respuesta del día|—/.test(r)).length>=5&&/Lo pasaste/.test(rows[3]),rows[3]);
  await (await p.$('#ph')).screenshot({path:`/dev/shm/j/week-${file}-${c}.jpg`,type:'jpeg',quality:60});
  const pb=await p.$('.pbody');await pb.screenshot({path:`/dev/shm/j/weekcard-${file}-${c}.jpg`,type:'jpeg',quality:60})}}
ok('arrival recalls yesterday\'s answer (days 2,3,6,7; day 5 follows a skipped day)',recallMiss.filter(d=>d!==5).length===0,'missing on '+recallMiss.join(','));
ok('Elara answers every main question',!noAck.length,noAck.join(','));ok('no page errors',!er.length,er.join('|'));
console.log(R.join('\n'));await b.close()})();
