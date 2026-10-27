// capture every screen of one day: arrival, each step (before/after answering), closing
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const [file,c,d,tag]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
await p.goto(`http://localhost:8160/${file}?c=${c}&d=${d}&w=${{'journey-oc.html':10,'journey-sa.html':8,'journey-na.html':6,'journey-eu.html':7,'journey-af.html':9}[file]}`);await p.waitForTimeout(900);
const ph=await p.$('#ph');let i=0;const shot=async n=>{await ph.screenshot({path:`/dev/shm/j/${tag}-${String(i++).padStart(2,'0')}-${n}.jpg`,type:'jpeg',quality:55})};
await shot('arrive');const log=[];
for(let k=0;k<12;k++){const t=await p.$eval('#ph',e=>e.innerText.replace(/\s+/g,' ').slice(0,260));log.push(t);
 const go=await p.$('[data-a="start"]')||null;
 if(await p.$('[data-a="nopt"][data-i="1"]')){await p.click('[data-a="nopt"][data-i="1"]');await p.waitForTimeout(400);await shot('answered')}
 else if(await p.$('[data-a="nmulti"][data-i="0"]')){await p.click('[data-a="nmulti"][data-i="0"]');await p.waitForTimeout(300);await shot('answered')}
 else if(await p.$('textarea[data-field="gtext"]')){await p.fill('textarea[data-field="gtext"]','Cuando llego a casa y todos necesitan algo a la vez');await p.dispatchEvent('textarea[data-field="gtext"]','input');await p.waitForTimeout(300);await shot('typed')}
 const nx=await p.$('.pfoot .go:not([disabled]), .strip .go:not([disabled])');if(!nx)break;const lab=await nx.innerText();await nx.click();await p.waitForTimeout(700);await shot(lab.replace(/\W+/g,'_').slice(0,14));if(/Volver|Seguir|Atlas/i.test(lab)&&k>2)break}
console.log(log.join('\n---\n'));await b.close()})();
