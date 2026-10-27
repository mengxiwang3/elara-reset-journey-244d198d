// Atlas start flow checks: first visit, unstarted area, Oceania, five weeks, beta hold
const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:900,height:950}});const er=[];p.on('pageerror',e=>er.push(e.message));
const R=[];const ok=(n,v,x)=>R.push((v?'PASS ':'FAIL ')+n+(x?'  ['+x+']':''));const w=t=>p.waitForTimeout(t);const ph='.phone';
const txt=async s=>(await p.$(s))?(await p.$eval(s,e=>e.innerText.trim())):'';
await p.goto('http://localhost:8170/final2.html');await w(1500);
// sample state
ok('six area chips, Oceania included',(await p.$$eval(ph+' .area',x=>x.map(e=>e.innerText.split('\n')[0]))).join('|')==='Dinero y seguridad|Propósito y crecimiento|Valor propio y placer|Amor y conexión|Bienestar y calma|Ritmo diario');
ok('counts are out of 5 weeks',/5 de 5/.test(await txt(ph+' .area[data-c="as"]'))&&/0 de 5/.test(await txt(ph+' .area[data-c="oc"]')),await txt(ph+' .area[data-c="as"]'));
ok('returning user keeps «Sigue donde lo dejaste»',/Sigue donde lo dejaste/.test(await txt(ph+' .resume')));
await p.screenshot({path:'/dev/shm/t/a-sample.jpg',type:'jpeg',quality:60});
// unstarted area: Europe
await p.click(ph+' .area[data-c="eu"]');await w(1200);
const cards=await p.$$eval(ph+' .zone .zc',x=>x.map(e=>e.innerText.replace(/\n/g,' ')));ok('Europe shows five weeks',cards.length===5,cards.length);
await p.click(ph+' .zone .zc[data-id="pa"]');await w(600);
let cta=await p.$eval(ph+' .scta',e=>({t:e.innerText,d:e.disabled}));ok('Europe week 1 can be started',cta.t==='Empezar este lugar'&&!cta.d,cta.t);
await p.screenshot({path:'/dev/shm/t/a-eu-sheet.jpg',type:'jpeg',quality:60});
await p.click(ph+' .scta');await w(500);ok('starting opens the arrival screen',/Empezar/.test(await txt(ph+' .arrv.on .go')),await txt(ph+' .arrv .dn'));
await p.click(ph+' .arrv .bk');await w(300);await p.click(ph+' .zone .zh button');await w(900);
// Oceania
await p.click(ph+' .area[data-c="oc"]');await w(1200);await p.screenshot({path:'/dev/shm/t/a-oc.jpg',type:'jpeg',quality:60});
await p.click(ph+' .zone .zc[data-id="ul"]');await w(600);cta=await p.$eval(ph+' .scta',e=>e.innerText);ok('Oceania week 1 (Uluru) can be started',cta==='Empezar este lugar',cta);
await p.click(ph+' .sx');await w(300);await p.click(ph+' .zone .zc[data-id="sy"]');await w(500);cta=await p.$eval(ph+' .scta',e=>({t:e.innerText,d:e.disabled}));ok('Oceania week 2 stays closed until week 1 is done',cta.d,cta.t);
// first visit
await p.click('#bnew');await w(1500);
ok('first visit shows «Empieza aquí» on Lan Hạ',/Empieza aquí[\s\S]*Bahía de Lan Hạ/.test(await txt(ph+' .resume')),await txt(ph+' .resume'));
ok('first visit header has no walked count',/Tu primer lugar te espera/.test(await txt(ph+' .ph-top')),await txt(ph+' .ph-top p'));
await p.screenshot({path:'/dev/shm/t/a-new.jpg',type:'jpeg',quality:60});
await p.click(ph+' .resume');await w(500);ok('«Empezar» goes straight to Lan Hạ day 1',/Día 1 de 7/i.test(await txt(ph+' .arrv .dn'))&&/Lan/.test(await txt(ph+' .arrv h3')),(await txt(ph+' .arrv .dn'))+' / h3='+(await txt(ph+' .arrv h3')));
await p.screenshot({path:'/dev/shm/t/a-new-arrive.jpg',type:'jpeg',quality:60});
await p.click(ph+' .arrv .bk');await w(300);
// beta hold
await p.click('#bbeta');await w(1500);await p.click(ph+' .area[data-c="sa"]');await w(1200);await p.click(ph+' .zone .zc[data-id="mp"]');await w(600);
cta=await p.$eval(ph+' .scta',e=>({t:e.innerText,d:e.disabled}));ok('beta: an unapproved area says «Pronto» and cannot start',cta.d&&/Pronto/.test(cta.t),cta.t);
await p.click(ph+' .sx');await w(300);await p.click(ph+' .zone .zh button');await w(900);
ok('beta: first visit still starts in Money',/Bahía de Lan Hạ/.test(await txt(ph+' .resume')));
await p.click('#b320');await w(1500);await p.screenshot({path:'/dev/shm/t/a-320.jpg',type:'jpeg',quality:60});
ok('no page errors',!er.length,er.join(' | '));console.log(R.join('\n'));await b.close()})();
