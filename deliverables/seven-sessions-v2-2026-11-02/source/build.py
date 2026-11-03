import sys,os
D=os.path.dirname(os.path.abspath(__file__));S=os.path.join(D,'src')
r=lambda f:open(os.path.join(S,f),encoding='utf-8').read()
css=r('style.css');img=r('script0.js');app=r('app.js')+r('ses.js');boot=r('boot.js')
for tpl,out in [('template.html','sesiones-v2.html'),('tester-template.html','tester.html')]:
    t=r(tpl).replace('/*@@CSS@@*/',css).replace('/*@@S0@@*/',img).replace('/*@@S1@@*/',app).replace('/*@@S2@@*/',boot)
    open(os.path.join(D,out),'w',encoding='utf-8').write(t);print(out,len(t))
