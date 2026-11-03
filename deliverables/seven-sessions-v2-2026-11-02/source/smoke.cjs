const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.cwd()+'/sesiones-v2.html');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const A=window.APP;const out=[];
 A.sesPreview(1);out.push(document.querySelector('#phone h2#pq')?.textContent);return out});
console.log(r,errs);await p.screenshot({path:'shot-a.png'});
const t=await b.newPage();t.on('pageerror',e=>errs.push('T:'+e.message));await t.goto('file://'+process.cwd()+'/tester.html#t3');await t.waitForTimeout(800);await t.screenshot({path:'shot-t.png'});console.log(errs);await b.close()})();
