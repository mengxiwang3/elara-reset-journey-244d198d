import json,re,os,glob
days=json.load(open('days2.json')); weeks=json.load(open('weeks.json'))
rev={}
for f in glob.glob('review-*.json'):
    for r in json.load(open(f)): rev[r['code']]=r
WM=json.load(open('weekmeta.json'))
def wk(d):
    m=WM[d['area']+'-'+str(d['week'])]
    es,en=[x.strip() for x in m['title'].split(' / ',1)]
    tes,ten=[x.strip() for x in m['take'].split(' / ',1)]
    return es,en,tes,ten
EXCL=re.compile(r'^(ninguna|ninguno|ningún|no sé|no lo sé|aún no|todavía no|no tengo|nada|no estoy|no aplica|prefiero no|ahora no)',re.I)
FMT={'Una opción':'one','Varias opciones':'multi','Texto abierto':'text','Lista breve':'list','Voz o texto':'voice','Foto o texto':'photo','Dibujo o texto':'draw'}
FN={'voice':('Formato propuesto: voz o texto. En este prototipo, escribe tu respuesta.','Proposed format: voice or text. In this prototype, type your answer.'),
    'photo':('Formato propuesto: foto o texto. En este prototipo, describe el detalle con palabras.','Proposed format: photo or text. In this prototype, describe the detail in words.'),
    'draw':('Formato propuesto: dibujo o texto. En este prototipo, escribe una lista o flechas con palabras.','Proposed format: drawing or text. In this prototype, write a list or arrows in words.'),
    'list':('Hasta tres cosas, una por línea. Puedes dejar espacios vacíos.','Up to three items, one per line. You can leave blanks.')}
INTRO={'one':('Una pregunta corta. Elige lo que más se acerque, o pasa.','One short question. Pick what fits best, or skip.'),
       'multi':('Una pregunta corta. Marca todo lo que encaje, sin mínimo.','One short question. Mark everything that fits, no minimum.'),
       'text':('Una pregunta. Una frase puede bastar.','One question. A sentence can be enough.'),
       'list':('Una pregunta. Una lista breve basta.','One question. A short list is enough.'),
       'voice':('Una pregunta. Puedes decirlo o escribirlo.','One question. You can say it or write it.'),
       'photo':('Una pregunta. Un detalle, nunca documentos ni personas.','One question. One detail, never documents or people.'),
       'draw':('Una pregunta. Unos trazos o unas palabras bastan.','One question. A few marks or words are enough.')}
T=lambda es,en:{'es':es,'en':en}
def strip_step(s): return re.sub(r'^(Paso opcional / Para llevarte|Optional step / Takeaway):\s*','',s).strip()
OV={}
for f in sorted(glob.glob('overlay-*.json')):
    for o in json.load(open(f)):
        assert o['code'] not in OV, ('two overlays for', o['code'])
        OV[o['code']]=o
for d in days:
    o=OV.get(d['code'])
    if not o: continue
    for k,v in o.get('fields',{}).items():
        d.setdefault('v1',{})[k]=d.get(k) if k in d else None
        d[k]=v
json.dump({'overlays':len(OV)},open('gen-stats.json','w'))
out={}
for d in days:
    r=rev.get(d['code'],{})
    o=OV.get(d['code'],{})
    kind=FMT[d['fmt'].split(' / ')[0]]
    en_q=(o.get('fields',{}).get('en_q')) or r.get('en_q_new') or d['en_q']
    en_o=(o.get('fields',{}).get('en_o')) or r.get('en_o_new') or d['en_o']
    main={'id':'q','title':T(d['es_q'],en_q)}
    if kind in ('one','multi'):
        eo=[x.strip() for x in d['es_o'].split('•') if x.strip()]; no=[x.strip() for x in en_o.split('•') if x.strip()]
        if len(eo)!=len(no): no=(no+eo)[:len(eo)]; d.setdefault('warn',[]).append('option count mismatch')
        main['options']=[T(a,b) for a,b in zip(eo,no)]
        main['soft']=T('Prefiero pasar','Prefer to skip'); main['soft2']=T('No aplica','Not applicable')
        if kind=='multi':
            main['multi']=True; main['exclusive']=[i for i,x in enumerate(eo) if EXCL.match(x)]
    else:
        main['text']=True; main['hint']=T(d['es_o'],en_o); main['placeholder']=T('Escribe aquí…','Write here…')
        if kind in FN: main['fmtNote']=T(*FN[kind])
    if o.get('replies'): main['replies']=o['replies']
    if o.get('softReply'): main['softReply']=o['softReply']
    if o.get('help'): main['help']=True
    if o.get('dep'): main['dep']={'on':o['dep']['on'],'es':o['dep']['es'],'en':o['dep']['en']}
    step={'id':'paso','kicker':T('Paso opcional','Optional step'),'title':T(strip_step(d['es_s']),strip_step(d['en_s'])),'small':True,'text':True,'placeholder':T('Si quieres, anótalo aquí…','If you like, note it here…')}
    wes,wen,tes,ten=wk(d)
    intro=T('Para llevarte esta semana: '+tes, 'To take with you this week: '+ten) if d['dow']==1 else T(*INTRO[kind])
    if d['dow']<7: tom=T('Mañana, día %d de esta semana.'%(d['dow']+1),'Tomorrow, day %d of this week.'%(d['dow']+1))
    elif d['week']<5: tom=T('Semana completa. La semana %d sigue en este mismo lugar.'%(d['week']+1),'Week complete. Week %d continues in this same place.'%(d['week']+1))
    else: tom=T('Terminaste las cinco semanas de esta área.','You finished the five weeks of this area.')
    if o.get('replies') and main.get('options') and len(o['replies'])!=len(main['options']): d.setdefault('warn',[]).append('replies count != options')
    day={'cur':True,'code':d['code'],'title':T(wes,wen),'intro':intro,'tomorrow':tom,'steps':[main,step]}
    out.setdefault(d['area'],[[] for _ in range(5)])[d['week']-1].append(day)
for a,ws in out.items():
    for i,w in enumerate(ws): assert len(w)==7,(a,i,len(w))
json.dump({'days':days,'out':out,'ov':OV},open('days3.json','w'),ensure_ascii=False)
js='''/* Elara 210-day curriculum (draft of 21 Oct 2026, with the reviewer's Spanish edits applied).
   Generated from Elara_Curriculum_210_Days_ES_EN.pdf. Spanish first; English for edited days follows the new Spanish (draft).
   Journey weeks 6-9 read their area from here; Money (weeks 1-5) keeps its v4 build copy, Daily Rhythm is week 10 (Oceania). */
(function () {
  window.CUR = %s;
  window.CUR_AREA = { 6: 'purpose', 7: 'self', 8: 'love', 9: 'energy', 10: 'rhythm' };
  window.CUR_FOR = function (w, c) { var a = window.CUR_AREA[w]; return a && window.CUR[a] ? window.CUR[a][(c || 1) - 1] : null; };
})();
''' % json.dumps(out,ensure_ascii=False)
open('/home/user/elara-reset-journey-244d198d/deliverables/money-journey-v2-2026-10-23/cur.js','w').write(js)
print('areas',list(out),'reviews',len(rev),'warn',[d['code'] for d in days if d.get('warn')])
