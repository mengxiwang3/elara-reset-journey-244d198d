import json,html,re,glob
H=html.escape
B='/tmp/claude-0/-home-user-elara-reset-journey-244d198d/bde4ef2a-95ea-5343-9927-13ba155eac38/scratchpad/cur/'
OUT='/home/user/elara-reset-journey-244d198d/explorations/curriculum-spanish-review-2026-10-26/'
D3=json.load(open(B+'days3.json')); days=D3['days']; OV=D3['ov']
out=D3['out']
rev={x['code']:x for x in json.load(open(B+'review-1.json'))+json.load(open(B+'review-2.json'))}
orig={d['code']:d for d in json.load(open(B+'days2.json'))}
WM=json.load(open(B+'weekmeta.json'))
AREAS=[('money','Claridad financiera'),('purpose','Encontrar propósito'),('self','Confianza en ti'),('love','Amor y límites'),('rhythm','Ritmo diario'),('energy','Energía')]
JOURNEY={'money':'Recorrido Asia (semanas 1–5 usan el texto v4; este currículo queda como fuente para v5)','purpose':'Recorrido Norteamérica · semana 6','self':'Recorrido Europa · semana 7','love':'Recorrido Sudamérica · semana 8','rhythm':'Sin recorrido todavía','energy':'Recorrido África · semana 9'}
HIGH=['MONEY-W1-D4','PURPOSE-W1-D5','SELF-W3-D6','LOVE-W4-D3']
def stepdict(code):
    a=code.split('-')[0].lower(); a={'money':'money','purpose':'purpose','self':'self','love':'love','rhythm':'rhythm','energy':'energy'}[a]
    m=re.match(r'.*-W(\d)-D(\d)',code); return out[a][int(m.group(1))-1][int(m.group(2))-1]
def opts(s): return [x.strip() for x in s.split('•') if x.strip()]
def strip(s): return re.sub(r'^(Paso opcional / Para llevarte|Optional step / Takeaway):\s*','',s or '').strip()
edited={d['code'] for d in days if d.get('edits')}
flagged={c for c,x in rev.items() if x['verdict']!='ok'}
changed=set(OV)
scope=edited|flagged|changed
rows=[]
byc={d['code']:d for d in days}
for d in days:
    c=d['code']
    if c not in scope: continue
    o=orig[c]; r=rev[c]; ov=OV.get(c,{}); day=stepdict(c); main=day['steps'][0]; step=day['steps'][1]
    pdf_q=o.get('es_q_orig',o['es_q']); pdf_o=o.get('es_o_orig',o['es_o'])
    red_q=o['es_q'] if o.get('es_q_orig') and o['es_q_orig']!=o['es_q'] else None
    red_o=o['es_o'] if o.get('es_o_orig') and o['es_o_orig']!=o['es_o'] else None
    # continuation: next day in the same area-week
    m=re.match(r'(\w+)-W(\d)-D(\d)',c); nxt=None
    if int(m.group(3))<7: nxt=byc.get(f"{m.group(1)}-W{m.group(2)}-D{int(m.group(3))+1}")
    elif int(m.group(2))<5: nxt=byc.get(f"{m.group(1)}-W{int(m.group(2))+1}-D1")
    reasons=[f['note_es']+(' (sugerencia: «'+f['suggestion_es'].strip('«»')+'»)' if f.get('suggestion_es') else '') for f in r['flags'] if f['sev']!='low' or c in changed]
    ovr=[x['es'] for x in ov.get('reasons',[])]
    rows.append(dict(code=c,area=d['area'],week=d['week'],dow=d['dow'],fmt=d['fmt'].split(' / ')[0],
      tags=[t for t,on in (('Editada por la revisora',c in edited),('Con aviso de la revisión',c in flagged),('Cambiada en esta pasada',c in changed),('Severidad alta',c in HIGH)) if on],
      pdf_q=pdf_q,pdf_o=pdf_o,red_q=red_q,red_o=red_o,
      q=main['title']['es'],q_en=main['title']['en'],
      options=[x['es'] for x in main.get('options',[])],hint=(main.get('hint') or {}).get('es'),
      replies=[x['es'] for x in main.get('replies',[])] if main.get('replies') else [],
      soft=(main.get('softReply') or {}).get('es'),help=bool(main.get('help')),
      dep=main.get('dep'),step=step['title']['es'],fmtnote=(main.get('fmtNote') or {}).get('es'),
      nextq=(stepdict(nxt['code'])['steps'][0]['title']['es'] if nxt else None),nextcode=(nxt['code'] if nxt else None),tomorrow=day['tomorrow']['es'],
      verdict=r['verdict'],review=reasons,ovr=ovr))
stats=dict(edited=len(edited),flagged=len(flagged),both=len(edited&flagged),edited_only=len(edited-flagged),flagged_only=len(flagged-edited),changed=len(changed),changed_new=len(changed-edited-flagged),scope=len(scope))
json.dump(rows,open(B+'review-rows.json','w'),ensure_ascii=False)
print(stats,len(rows))
def card(x):
    t=''.join(f'<span class="tag{" hi" if "alta" in g else ""}">{H(g)}</span>' for g in x['tags'])
    h=f'<article class="day" id="{x["code"]}"><div class="hd"><b>{x["code"]}</b> · Semana {x["week"]}, día {x["dow"]} · {H(x["fmt"])} {t}</div>'
    h+='<div class="cols"><div><div class="lbl">Original (PDF)</div>'+f'<p class="q old">{H(x["pdf_q"])}</p><p class="o old">{H(x["pdf_o"])}</p>'
    if x['red_q'] or x['red_o']: h+='<div class="lbl">Edición de la revisora (rojo)</div>'+(f'<p class="q red">{H(x["red_q"])}</p>' if x['red_q'] else '')+(f'<p class="o red">{H(x["red_o"])}</p>' if x['red_o'] else '')
    h+='</div><div><div class="lbl">Propuesta</div>'
    if x['dep']: h+=f'<p class="dep"><b>Si no respondió {H(", ".join(x["dep"]["on"]) if isinstance(x["dep"]["on"],list) else x["dep"]["on"])}:</b> {H(x["dep"]["es"])}<br><span class="mute">Si respondió, Elara le recuerda su respuesta.</span></p>'
    h+=f'<p class="q">{H(x["q"])}</p>'
    if x['options']:
        h+='<ol class="opts">'+''.join(f'<li>{H(op)}'+(f'<div class="rep">Elara: {H(x["replies"][i])}</div>' if i<len(x["replies"]) else '')+'</li>' for i,op in enumerate(x['options']))+'</ol>'
        h+='<p class="mute">Siempre disponibles: «Prefiero pasar» · «No aplica»'+(f' → Elara: {H(x["soft"])}' if x['soft'] else ' (sin respuesta de Elara)')+'</p>'
    if x['hint']: h+=f'<p class="o">{H(x["hint"])}</p>'
    if x['fmtnote']: h+=f'<p class="mute">{H(x["fmtnote"])}</p>'
    h+=f'<p class="s"><b>Paso opcional:</b> {H(x["step"])}</p>'
    if x['help']: h+='<p class="help">Muestra «Buscar ayuda ahora» → abre «Pedir ayuda ahora» (/crisis-help).</p>'
    h+=f'<p class="cont"><b>Después:</b> {H(x["tomorrow"])}'+(f' Siguiente pregunta ({H(x["nextcode"])}): «{H(x["nextq"])}»' if x['nextq'] else '')+'</p></div></div>'
    if x['review'] or x['ovr']:
        h+='<div class="why"><div class="lbl">Por qué</div><ul>'+''.join(f'<li>{H(s)}</li>' for s in x['ovr'])+''.join(f'<li class="mute">Revisión: {H(s)}</li>' for s in x['review'] if s not in x['ovr'])+'</ul></div>'
    return h+'</article>'
money=open(B+'money-v4.md').read(); purpose=open(B+'purpose-compare.md').read()
def md(s):
    s=H(s); s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s); s=re.sub(r'\*(.+?)\*',r'<i>\1</i>',s)
    lines=[];inl=False
    for ln in s.split('\n'):
        if ln.startswith('## '): lines.append(f'<h4>{ln[3:]}</h4>'); continue
        if ln.startswith('# '): continue
        if re.match(r'^(\d+\.|-) ',ln): lines.append('<p class="li">'+ln+'</p>'); continue
        if ln.strip(): lines.append('<p>'+ln+'</p>')
    return '\n'.join(lines)
css='''@font-face{font-family:Fraunces;src:url(fonts/Fraunces_600SemiBold.woff2)}@font-face{font-family:Inst;src:url(fonts/InstrumentSans_400Regular.woff2)}@font-face{font-family:Inst;font-weight:600;src:url(fonts/InstrumentSans_600SemiBold.woff2)}
:root{--bg:#F7F2EA;--paper:#FFFCF6;--ink:#1F2A24;--mute:#5E584F;--line:#E2D8C9;--forest:#1F3A2E;--ember:#B8461C;--hi:#9E2A16;--red:#B3261E}
:root[data-theme="dark"]{--bg:#141815;--paper:#1C211D;--ink:#EDE7DC;--mute:#B2AA9D;--line:#323A34;--forest:#9CC3A9;--ember:#F08A5D;--hi:#FF9C86;--red:#FF8A80}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141815;--paper:#1C211D;--ink:#EDE7DC;--mute:#B2AA9D;--line:#323A34;--forest:#9CC3A9;--ember:#F08A5D;--hi:#FF9C86;--red:#FF8A80}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Inst,system-ui,sans-serif}
main{max-width:1060px;margin:0 auto;padding:24px 16px 60px}h1{font:600 30px/1.15 Fraunces,Georgia,serif;margin:0 0 6px}h2{font:600 22px Fraunces,Georgia,serif;margin:34px 0 6px}h3{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);margin:20px 0 8px}h4{font-size:15px;margin:14px 0 4px}
.lede{color:var(--mute);max-width:780px}.box{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin:10px 0}table{border-collapse:collapse;width:100%;font-size:13.5px}td,th{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
.day{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:10px 0;break-inside:avoid}.hd{font-size:13px;color:var(--mute);display:flex;flex-wrap:wrap;gap:6px;align-items:center}.hd b{color:var(--ink)}
.tag{border:1px solid var(--line);border-radius:10px;padding:0 7px;font-size:11.5px}.tag.hi{border-color:var(--hi);color:var(--hi);font-weight:600}
.cols{display:grid;grid-template-columns:1fr 1.4fr;gap:6px 22px;margin-top:6px}.lbl{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute);font-weight:600;margin-top:6px}
.q{font-weight:600;margin:3px 0}.o,.s,.cont,.dep,.help{font-size:13.5px;margin:4px 0}.old{color:var(--mute)}.red{color:var(--red)}.opts{margin:4px 0 4px 18px;padding:0;font-size:13.5px}.opts li{margin:3px 0}.rep{color:var(--forest);font-size:12.5px}
.dep{border-left:3px solid var(--line);padding-left:8px}.help{color:var(--hi)}.mute{color:var(--mute);font-size:12.5px}.why ul{margin:2px 0 0 18px;padding:0;font-size:13px}.li{margin:2px 0 2px 10px}
.toc a{color:var(--forest)}@media (max-width:720px){.cols{grid-template-columns:1fr}}@media print{.dl,.toc{display:none}h2{break-before:page}}'''
rows_by={a:[x for x in rows if x['area']==a] for a,_ in AREAS}
body=f'''<h1>Revisión en español del currículo</h1>
<p class="lede">Para María y Alejandra. Cada tarjeta muestra el día completo: lo que decía el PDF, la edición en rojo de la revisora, la propuesta con sus opciones, la respuesta de Elara a cada opción, el paso opcional, qué pasa si no respondió un día anterior y cómo sigue. Borrador para revisar: nada de esto está en la app.</p>
<div class="box"><b>Qué versión se actualizó.</b> El único currículo disponible es «Elara | 210-day curriculum | Spanish &amp; English | Review draft» (PDF del 21 oct 2026, 64 páginas, 6 áreas × 5 semanas × 7 días). Se subió dos veces (23 y 26 oct); son el mismo archivo. No encontré en la sesión, en el repositorio ni en Google Drive una versión de 336 días (56 por área), así que no pude compararla. Si existe, al recibirla se compara día por día y se conservan las dos si tienen alcances distintos.</div>
<div class="box"><b>Cuántos días entran aquí y por qué.</b>
<table><tr><td>Editados por la revisora (texto en rojo)</td><td>{stats["edited"]}</td></tr><tr><td>Con aviso en la revisión (revisar o repensar)</td><td>{stats["flagged"]}</td></tr><tr><td>…en ambos grupos</td><td>{stats["both"]}</td></tr><tr><td>Solo editados · solo con aviso</td><td>{stats["edited_only"]} · {stats["flagged_only"]}</td></tr><tr><td>Cambiados en esta pasada (correcciones, Amor y límites, días que dependen de otros)</td><td>{stats["changed"]} (de ellos, {stats["changed_new"]} no estaban en ninguno de los dos grupos)</td></tr><tr><td><b>Total en esta revisión</b></td><td><b>{stats["scope"]}</b> de 210</td></tr></table></div>
<div class="box"><b>Los avisos de severidad alta.</b> La revisión marcó seis avisos altos en cuatro días: MONEY-W1-D4 (1), PURPOSE-W1-D5 (1), SELF-W3-D6 (2: culpa y duplicado con W3-D7) y LOVE-W4-D3 (2: la reescritura y la seguridad). No hay otros. Cada uno tiene su tarjeta abajo.</div>
<div class="toc box">{" · ".join(f'<a href="#{a}">{H(n)} ({len(rows_by[a])})</a>' for a,n in AREAS)} · <a href="#money-v4">Claridad financiera v4</a> · <a href="#purpose">Propósito: qué versión</a></div>'''
for a,n in AREAS:
    body+=f'<h2 id="{a}">{H(n)}</h2><p class="mute">{H(JOURNEY[a])}</p>'
    for w in range(1,6):
        ws=[x for x in rows_by[a] if x['week']==w]
        if ws: body+=f'<h3>Semana {w} · {H(WM[a+"-"+str(w)]["title"])}</h3>'+''.join(card(x) for x in ws)
body+=f'<h2 id="money-v4">Claridad financiera v4: correcciones en el recorrido</h2><p class="mute">Aplicadas en el prototipo (data.js / content.js), sin reemplazar el texto v4. La app real no cambió.</p><div class="box">{md(money)}</div>'
body+=f'<h2 id="purpose">Propósito: qué versión usar</h2><div class="box">{md(purpose)}</div>'
dl='<div class="dl" hidden style="margin:0 0 14px"><button type="button" data-pdf="revision-espanol-curriculo.pdf" style="font:600 14px system-ui,sans-serif;color:#FBF6EF;background:#1F3A2E;border:0;border-radius:22px;padding:10px 18px;min-height:44px;cursor:pointer">Descargar PDF</button> <span class="dlmsg" role="status" style="font:13px system-ui,sans-serif;color:#5E584F;margin-left:8px"></span></div><script>(async()=>{const w=document.querySelector(".dl"),b=w.querySelector("button"),m=w.querySelector(".dlmsg");const d=window.claude&&await window.claude.use("downloads").catch(()=>null);if(!d)return;w.hidden=false;b.onclick=async()=>{b.disabled=true;m.textContent="";try{const r=await fetch(b.dataset.pdf);if(!r.ok)throw{code:"unavailable"};await d.save({filename:b.dataset.pdf,data:await r.blob()});m.textContent="Listo.";}catch(e){const c=e&&e.code;if(c==="declined"){}else if(c==="rate_limited")m.textContent="Espera un momento y vuelve a intentarlo.";else{w.hidden=true;}}finally{b.disabled=false;}};})();</script>'
page=f'<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revisión en español</title><style>{css}</style></head><body><main>{body.replace("</h1>","</h1>"+dl,1)}</main></body></html>'
open(OUT+'index.html','w').write(page); print('written',len(page))
