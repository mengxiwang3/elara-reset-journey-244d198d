// sweeps every day of every journey: arrival screen and first question must have a loaded photo and visible text
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const J=[['index.html',[1,2,3,4,5],null],['journey-na.html',[6],5],['journey-eu.html',[7],5],['journey-sa.html',[8],5],['journey-af.html',[9],5],['journey-oc.html',[10],5]];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const bad=[];let n=0;
for(const [f,weeks,cws] of J){const p=await b.newPage({viewport:{width:900,height:900}});const er=[];p.on('pageerror',e=>er.push(e.message));const miss=new Set();p.on('response',r=>{if(r.status()>=400)miss.add(r.url().split('/').pop())});
 for(const w of weeks)for(let c=1;c<=(cws||1);c++){await p.goto(`http://localhost:8160/${f}?w=${w}${cws?'&c='+c:''}`);await p.waitForTimeout(500);
  for(let d=1;d<=7;d++){const btn=await p.$(`#gd button[data-d="${d}"]`);if(!btn){bad.push(`${f} w${w} c${c} d${d}: no day button`);continue}
   await btn.click();await p.waitForTimeout(350);n++;
   const chk=async(stage)=>{const r=await p.evaluate(async()=>{const pan=document.querySelector('.pan');const bg=pan?getComputedStyle(pan).backgroundImage:'';const u=(bg.match(/url\("?([^")]+)/)||[])[1];let ok=false;if(u){const im=new Image();im.src=u;try{await im.decode();ok=im.naturalWidth>100}catch(e){}}
     const body=document.querySelector('.pbody');const txt=(body?body.innerText:'').trim();return {u:(u||'').split('/').pop(),ok,len:txt.length}});
     if(!r.ok)bad.push(`${f} w${w} c${c} d${d} ${stage}: photo not loaded (${r.u||'none'})`);if(r.len<15)bad.push(`${f} w${w} c${c} d${d} ${stage}: panel nearly empty (${r.len} chars)`);};
   await chk('arrival');const st=await p.$('[data-a="start"]');if(st){await st.click();await p.waitForTimeout(300);await chk('question');}else bad.push(`${f} w${w} c${c} d${d}: no start button`);}}
 if(er.length)bad.push(`${f}: page errors ${er.join(' | ')}`);if(miss.size)bad.push(`${f}: missing files ${[...miss].join(', ')}`);await p.close();}
console.log('screens checked',n*2);console.log(bad.length?bad.join('\n'):'NO BLANK SCREENS');await b.close()})();
