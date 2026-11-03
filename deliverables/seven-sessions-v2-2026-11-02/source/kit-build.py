# Builds the printable kit pages (sheet, cards, script HTML). python3 kit-build.py
import re,html,os
_d=os.path.dirname(os.path.abspath(__file__));K=os.path.join(_d,'kit') if os.path.isdir(os.path.join(_d,'kit')) else os.path.join(_d,'..','kit')
CSS="""
:root{--ink:#1f2a24;--mute:#55635b;--line:#c9d1cb;--soft:#eef2ee;--acc:#2f4a3c;--warm:#b5532f;--bg:#fff}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#e8ece9;--mute:#aab5ae;--line:#3b4741;--soft:#1f2723;--acc:#9cc3ad;--warm:#e39a7b;--bg:#141917}}
:root[data-theme="dark"]{--ink:#e8ece9;--mute:#aab5ae;--line:#3b4741;--soft:#1f2723;--acc:#9cc3ad;--warm:#e39a7b;--bg:#141917}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
main{max-width:1050px;margin:0 auto;padding:24px 16px 60px}
h1{font:600 28px/1.2 Georgia,"Times New Roman",serif;margin:0 0 6px}h2{font:600 21px/1.25 Georgia,serif;margin:28px 0 8px}h3{font-size:16px;margin:20px 0 6px}
.prop{display:inline-block;border:1px solid var(--warm);color:var(--warm);border-radius:999px;padding:1px 10px;font-size:12px;font-weight:600;letter-spacing:.02em}
.en{color:var(--mute);font-style:italic;font-size:13px}
table{border-collapse:collapse;width:100%;margin:8px 0 14px}th,td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top;font-size:13.5px}th{background:var(--soft)}
blockquote{margin:10px 0;padding:8px 14px;border-left:3px solid var(--acc);background:var(--soft)}
code{font-size:12.5px;background:var(--soft);padding:0 4px;border-radius:4px}
a{color:var(--acc)}
.page{page-break-after:always;break-after:page;margin-bottom:36px}
.wrap{overflow-x:auto}
.box{height:46px}.tall{height:70px}
.opts{font-size:12px;color:var(--mute)}
.shots{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0}.shots figure{margin:0;flex:1 1 200px;max-width:260px}.shots img{width:100%;height:auto;border:1px solid var(--line);border-radius:14px}.shots figcaption{font-size:12px;color:var(--mute);margin-top:4px}
ol.q li{margin:4px 0}
.foot{margin-top:18px;font-size:12px;color:var(--mute)}
@media print{body{font-size:11.5px;background:#fff;color:#000}main{max-width:none;padding:0}th,td{font-size:10.5px;padding:4px 5px}.noprint{display:none}@page{size:A4 landscape;margin:12mm}}
"""
def page(title,body,desc=''):
    return f'<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><style>{CSS}</style></head><body><main>{body}</main></body></html>'
def inl(t):
    t=html.escape(t,quote=False)
    t=re.sub(r'`([^`]+)`',r'<code>\1</code>',t);t=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',t);t=re.sub(r'(?<![*\w])\*([^*]+)\*(?!\*)',r'<em>\1</em>',t)
    t=re.sub(r'(https://\S+)',r'<a href="\1">\1</a>',t);return t
def md2html(md):
    out=[];L=md.split('\n');i=0
    while i<len(L):
        l=L[i]
        if l.startswith('#'):
            n=len(l)-len(l.lstrip('#'));out.append(f'<h{n}>{inl(l[n:].strip())}</h{n}>');i+=1
        elif l.startswith('---'):out.append('<hr>');i+=1
        elif l.strip().startswith('|'):
            rows=[]
            while i<len(L) and L[i].strip().startswith('|'):rows.append(L[i].strip());i+=1
            cells=[[c.strip() for c in r.strip('|').split('|')] for r in rows if not re.match(r'^\|[\s\-|]+\|$',r)]
            out.append('<div class="wrap"><table><tr>'+''.join(f'<th>{inl(c)}</th>' for c in cells[0])+'</tr>'+''.join('<tr>'+''.join(f'<td>{inl(c)}</td>' for c in r)+'</tr>' for r in cells[1:])+'</table></div>')
        elif l.startswith('>'):
            b=[]
            while i<len(L) and L[i].startswith('>'):b.append(L[i][1:].strip());i+=1
            ps='</p><p>'.join(inl(x) for x in ' \n'.join(b).split('\n \n') ) if False else None
            paras=[];cur=[]
            for x in b:
                if x=='':paras.append(' '.join(cur));cur=[]
                else:cur.append(x)
            paras.append(' '.join(cur))
            out.append('<blockquote>'+''.join(f'<p>{inl(p)}</p>' for p in paras if p)+'</blockquote>')
        elif re.match(r'^\s*(- |\d+\. )',l):
            tag='ol' if re.match(r'^\s*\d+\. ',l) else 'ul';items=[]
            while i<len(L) and (re.match(r'^\s*(- |\d+\. )',L[i]) or (L[i].startswith('  ') and L[i].strip())):
                x=L[i]
                if re.match(r'^\s{2,}(- |\d+\. )',x):items.append('&nbsp;&nbsp;• '+inl(re.sub(r'^\s*(- |\d+\. )','',x)))
                elif re.match(r'^\s*(- |\d+\. )',x):items.append(inl(re.sub(r'^\s*(- |\d+\. )','',x)))
                else:items[-1]+=' '+inl(x.strip())
                i+=1
            out.append(f'<{tag}>'+''.join(f'<li>{x}</li>' for x in items)+f'</{tag}>')
        elif l.strip()=='':i+=1
        else:
            b=[]
            while i<len(L) and L[i].strip() and not re.match(r'^(#|>|\||\s*- |\s*\d+\. |---)',L[i]):b.append(L[i]);i+=1
            out.append('<p>'+inl(' '.join(b))+'</p>')
    return '\n'.join(out)
# script
md=open(os.path.join(K,'guion-facilitadora.md'),encoding='utf8').read()
open(os.path.join(K,'guion-facilitadora.html'),'w',encoding='utf8').write(page('Guion de facilitación','<p><span class="prop">Propuesta · español por aprobar</span></p>'+md2html(md)))
# sheet
A={'T1':'AAA','T2':'ABB','T3':'BAB','T4':'BBA','T5':'BBB','T6':'BAA','T7':'ABA','T8':'AAB'}
code="""<div class="page"><h1>Hoja de observación · siete sesiones v2</h1><p><span class="prop">Propuesta</span> <span class="en">Observation sheet. One page per participant for the sessions, one for the two concepts, and a summary with denominators. Same columns as <code>hoja-observacion.csv</code>.</span></p>
<h2>Cómo llenar</h2><table><tr><th>Columna</th><th>Valores</th><th>Cuándo</th></tr>
<tr><td>Comprensión</td><td><code>entendió</code> · <code>en parte</code> · <code>no</code> + cita</td><td>Tras «Antes de responder: ¿qué te pide esta pregunta y para qué te serviría?»</td></tr>
<tr><td>Utilidad</td><td><code>concreto</code> · <code>general</code> · <code>nada</code> + cita («me gustó» = general)</td><td>Tras «¿Qué de la respuesta salió de lo que escribiste y qué te aportó?»</td></tr>
<tr><td>Viabilidad</td><td><code>sí</code> · <code>depende</code> · <code>no</code> + qué lo impediría</td><td>Al final de la sesión</td></tr>
<tr><td>Recuerdo</td><td><code>nada</code> · <code>recordó</code> · <code>usó</code> · <code>intentó</code> + cita</td><td>Día siguiente, ANTES de abrir: «¿Qué recordaste, usaste o intentaste?»</td></tr>
<tr><td>Conducta</td><td>pasos saltados · «Hoy no puedo» · «No quise decir eso» · cambio de camino · minutos · pausa (días)</td><td>Durante</td></tr>
<tr><td>Sesión 2 B aplica</td><td><code>sí</code> solo si en la sesión 1 eligió «Cubrir algo básico ahora»; si no, <code>no</code></td><td>Sesión 2</td></tr></table>
<p>Variantes en orden: sesión 2 / recuerdo / respuestas. No se las digas a la participante.</p></div>"""
pages=[code]
for i,(c,v) in enumerate(A.items()):
    rows=''.join(f'<tr><td><strong>{n}</strong><br><span class="opts">{"en vivo" if n in (1,4,7) else "a solas"}</span></td><td class="box"></td>'+
      '<td><span class="opts">entendió · en parte · no</span></td><td><span class="opts">concreto · general · nada</span></td><td><span class="opts">sí · depende · no</span></td>'+
      ('<td><span class="opts">no aplica</span></td>' if n==1 else '<td><span class="opts">nada · recordó · usó · intentó</span></td>')+'<td class="tall"></td><td></td></tr>' for n in range(1,8))
    pages.append(f"""<div class="page"><h2>P{i+1} · código {c} · variantes {v[0]} / {v[1]} / {v[2]}</h2><p>Camino: ______________ &nbsp; Consentimiento: sí / no &nbsp; Audio: sí / no &nbsp; Sesión 2 B aplica: sí / no / —</p>
<div class="wrap"><table><tr><th style="width:6%">Sesión</th><th style="width:8%">Fecha · min</th><th style="width:11%">Comprensión</th><th style="width:11%">Utilidad</th><th style="width:11%">Viabilidad · qué lo impediría</th><th style="width:12%">Recuerdo (antes de abrir)</th><th>Citas textuales</th><th style="width:14%">Conducta (saltó, «Hoy no puedo», «No quise decir eso», cambió camino, pausa)</th></tr>{rows}</table></div></div>""")
    pages.append(f"""<div class="page"><h2>P{i+1} · código {c} · Valor de dos ideas (aparte, día 7, 6–8 min)</h2>
<p class="en">Behaviour first; screen second; open questions; 1–5 last. Record specifics: when, for what, what would stop her. A bare «sí, lo usaría» is weak evidence.</p>
<div class="wrap"><table><tr><th style="width:30%">Pregunta</th><th>Oportunidades remotas</th><th>Conexiones</th></tr>
<tr><td>Antes de mostrar: «La última vez que buscaste trabajo o ingresos, ¿dónde buscaste y qué pasó?» / «¿Hay alguien con quien hables de dinero o trabajo? ¿Cómo la conociste?»</td><td class="tall"></td><td class="tall"></td></tr>
<tr><td>Con sus palabras, ¿qué hace esto?</td><td class="box"></td><td class="box"></td></tr>
<tr><td>«¿En qué momento de tu semana usarías esto, si lo usarías?» · para qué</td><td class="box"></td><td class="box"></td></tr>
<tr><td>«¿Qué te haría no usarlo?»</td><td class="box"></td><td class="box"></td></tr>
<tr><td>¿Preguntó cómo postular? (recordar: ficticio, no se puede)</td><td>sí / no</td><td style="background:var(--soft)"></td></tr>
<tr><td>«¿Qué necesitarías saber o ver para sentirte segura conectando con otra mujer?»</td><td style="background:var(--soft)"></td><td class="box"></td></tr>
<tr><td>«¿Compartirías tu foto? ¿Por qué sí o no?»</td><td style="background:var(--soft)"></td><td>sí / no / depende ·</td></tr>
<tr><td>Al final: escala 1–5 y por qué</td><td>1 2 3 4 5 ·</td><td>1 2 3 4 5 ·</td></tr>
<tr><td>«Si Elara solo pudiera añadir una de estas dos este mes, ¿cuál elegirías y por qué?»</td><td colspan="2">Oportunidades / Conexiones / ninguna · por qué:</td></tr></table></div></div>""")
sm='<div class="page"><h2>Resumen con denominadores (n de N)</h2><p class="en">Fill as «n de N». N = participants who did that session with that variant. Session 2 B: only those who chose «Cubrir algo básico ahora». No significance claims.</p><div class="wrap"><table><tr><th>Sesión</th><th>Variante</th><th>Entendió</th><th>Utilidad concreta</th><th>Viable (sí)</th><th>Recuerdo: usó o intentó (día siguiente)</th><th>Saltó algún paso</th></tr>'
for n in range(1,8):
    for lab in (['Sesión 2: A','Sesión 2: B (aplica)'] if n==2 else [])+['Recuerdo: A','Recuerdo: B','Respuestas: A','Respuestas: B']:
        sm+=f'<tr><td>{n}</td><td>{lab}</td>'+'<td>__ de __</td>'*5+'</tr>'
sm+='</table></div><h3>Ideas (una fila por persona en el CSV)</h3><table><tr><th></th><th>Oportunidades</th><th>Conexiones</th><th>Ninguna</th></tr><tr><td>Elegida (n de N)</td><td>__ de __</td><td>__ de __</td><td>__ de __</td></tr><tr><td>Dio un momento concreto de su semana</td><td>__ de __</td><td>__ de __</td><td></td></tr><tr><td>Escala (lista de valores, sin promedio)</td><td></td><td></td><td></td></tr></table></div>'
pages.append(sm)
open(os.path.join(K,'hoja-observacion.html'),'w',encoding='utf8').write(page('Hoja de observación',''.join(pages)))
# cards
def card(title,intro,shots,qs,note):
    s=''.join(f'<figure><img src="concepto/{f}" alt="{html.escape(a)}"><figcaption>{i+1}. {html.escape(a)}</figcaption></figure>' for i,(f,a) in enumerate(shots))
    return page(title,'<style>@media print{@page{size:A4 portrait;margin:12mm}.shots figure{max-width:31%;flex:1 1 30%}.shots img{max-height:120mm;width:auto;max-width:100%}}</style>'+f'<div class="card"><p><span class="prop">Propuesta · prototipo</span></p><h1>{title}</h1><p>{intro}</p><div class="shots">{s}</div><h3>Orden de preguntas</h3><ol class="q">'+''.join(f'<li>{q}</li>' for q in qs)+f'</ol><p class="foot">{note}</p></div>')
open(os.path.join(K,'tarjeta-oportunidades.html'),'w',encoding='utf8').write(card('Oportunidades remotas',
 'Una lista de ofertas de trabajo remoto con pago, horario, modalidad e idiomas. <strong>Las ofertas son ejemplos ficticios: no se puede postular.</strong>',
 [('oportunidades-lista.png','La lista: una tarjeta de oferta'),('oportunidades-detalle.png','Al tocar «Ver ejemplo»')],
 ['<em>Antes de mostrar:</em> «La última vez que buscaste trabajo o ingresos, ¿dónde buscaste y qué pasó?»','Muestra la pantalla 1. «Con tus palabras, ¿qué crees que hace esto?»','Muestra la pantalla 2.','«¿En qué momento de tu semana usarías esto, si lo usarías?» (y para qué)','«¿Qué te haría no usarlo?»','<em>Al final:</em> «Del 1 al 5, ¿qué tan útil sería para ti? ¿Por qué ese número?»'],
 'Capturas reales del prototipo (Pruebas A/B · versión A, iPhone 15). Unos 3 minutos. Un «sí, lo usaría» solo vale poco: anota cuándo, para qué y qué la frenaría.'))
open(os.path.join(K,'tarjeta-conexiones.html'),'w',encoding='utf8').write(card('Conexiones',
 'Ver un perfil a la vez y conectar con otra mujer. Si las dos conectan, pueden conversar. Los perfiles son ejemplos.',
 [('conexiones-tarjeta.png','Un perfil: Pasar o Conectar'),('conexiones-mutua.png','Las dos conectaron'),('conexiones-bandeja.png','Mensajes: conexiones nuevas')],
 ['<em>Antes de mostrar:</em> «¿Hay alguien con quien hables de dinero o trabajo? ¿Cómo la conociste?»','Muestra la pantalla 1. «Con tus palabras, ¿qué crees que hace esto?»','Muestra las pantallas 2 y 3.','«¿En qué momento de tu semana usarías esto, si lo usarías?» (y para qué)','«¿Qué te haría no usarlo?»','«¿Qué necesitarías saber o ver para sentirte segura conectando con otra mujer?»','«¿Compartirías tu foto? ¿Por qué sí o no?»','<em>Al final:</em> «Del 1 al 5, ¿qué tan útil sería para ti? ¿Por qué ese número?»','<em>Después de las dos ideas:</em> «Si Elara solo pudiera añadir una de estas dos este mes, ¿cuál elegirías y por qué?»'],
 'Capturas reales del prototipo de Conexiones (estilo B por defecto, iPhone 15). Unos 3 minutos más 1–2 para elegir.'))
print('kit built')
