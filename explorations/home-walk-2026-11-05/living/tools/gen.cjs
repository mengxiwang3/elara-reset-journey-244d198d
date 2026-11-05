const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path');
(async()=>{ const b=await chromium.launch({args:['--allow-file-access-from-files']}); const p=await b.newPage();
 await p.goto('file://'+path.resolve(__dirname,'gen.html')); const r=await p.evaluate(()=>run());
 for(const k of ['bg','mid','fg']){ fs.writeFileSync(path.resolve(__dirname,'../living/photos/d2-'+k+'.webp'), Buffer.from(r[k].split(',')[1],'base64')); }
 // preview: bg alone, and layers offset to show any seams
 await p.setContent(`<body style="margin:0;background:#f0f"><div style="position:relative;width:1280px;height:480px"><img src="file://${path.resolve(__dirname,'../living/photos/d2-bg.webp')}" style="position:absolute;left:0"></div><div style="position:relative;width:1280px;height:480px;overflow:hidden"><img src="file://${path.resolve(__dirname,'../living/photos/d2-bg.webp')}" style="position:absolute;left:0"><img src="file://${path.resolve(__dirname,'../living/photos/d2-mid.webp')}" style="position:absolute;left:-14px"><img src="file://${path.resolve(__dirname,'../living/photos/d2-fg.webp')}" style="position:absolute;left:-30px;top:4px"></div></body>`);
 await p.setViewportSize({width:1280,height:960}); await p.waitForTimeout(300); await p.screenshot({path:path.resolve(__dirname,'preview.png')}); await b.close(); })();
