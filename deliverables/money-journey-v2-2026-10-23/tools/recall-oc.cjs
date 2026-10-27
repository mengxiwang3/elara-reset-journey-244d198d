const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const f of ['journey-oc.html']){
 const p=await b.newPage({viewport:{width:1100,height:900}});await p.goto('http://localhost:8160/'+f);await p.waitForTimeout(500);
 const x=await p.evaluate(()=>{const a=window.CUR_AREA[window.MJ_START.w];for(let c=0;c<5;c++)for(let d=0;d<7;d++){const s=window.CUR[a][c][d].steps[0];if(s.dep){const m=/W(\d)-D(\d)$/.exec(s.dep.on);if(+m[1]===c+1)return{c:c+1,d:d+1,od:+m[2]}}}});
 await p.goto('http://localhost:8160/'+f+'?c='+x.c);await p.waitForTimeout(400);
 await p.click(`#gd button[data-d="${x.od}"]`);await p.waitForTimeout(150);await p.click('[data-a="start"]');await p.waitForTimeout(150);
 if(await p.$('[data-a="nmulti"]'))await p.click('[data-a="nmulti"][data-i="0"]');else if(await p.$('[data-a="nopt"][data-i="0"]'))await p.click('[data-a="nopt"][data-i="0"]');else{await p.fill('textarea[data-field="gtext"]','mi respuesta anterior');await p.dispatchEvent('textarea[data-field="gtext"]','input');}
 await p.waitForTimeout(200);await p.click(`#gd button[data-d="${x.d}"]`);await p.waitForTimeout(150);await p.click('[data-a="start"]');await p.waitForTimeout(150);
 const rec=await p.$eval('.recall',e=>e.innerText).catch(()=>null);
 console.log((rec&&!(await p.$('.depnote'))?'PASS ':'FAIL ')+f+` recall on W${x.c}-D${x.d}: `+(rec||'none'));await p.close();}
await b.close()})();
