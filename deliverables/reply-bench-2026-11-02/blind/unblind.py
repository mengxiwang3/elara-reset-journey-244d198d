import json,glob,collections,os
D=os.path.dirname(os.path.abspath(__file__))
key=json.load(open(f'{D}/key.json'));gkey=json.load(open(f'{D}/gkey.json'))
scores=collections.defaultdict(list)
for f in sorted(glob.glob(f'{D}/judge*.json')):
    for s in json.load(open(f)):
        if s.get('rid') in key: scores[s['rid']].append(s)
F=['useful_move','generic_praise','unsupported_interpretation','new_task','uses_her_words','ends_with_question','natural_spanish','fits_path']
V=['V0','V1','V2','V3'];agg={v:{f:[0,0] for f in F} for v in V};q={v:[] for v in V};agree={f:[0,0] for f in F}
for rid,ss in scores.items():
    v=key[rid]['variant']
    for s in ss:
        for f in F:
            agg[v][f][0]+=bool(s.get(f));agg[v][f][1]+=1
        q[v].append(s.get('quality',0))
    if len(ss)>=2:
        for f in F:
            agree[f][1]+=1;agree[f][0]+= (bool(ss[0].get(f))==bool(ss[1].get(f)))
out={'n_replies_scored':len(scores),'double_scored':sum(len(s)>=2 for s in scores.values()),'per_variant':{v:{f:f"{a}/{b}" for f,(a,b) in agg[v].items()} for v in V},'mean_quality':{v:round(sum(q[v])/max(1,len(q[v])),2) for v in V},'agreement':{f:f"{a}/{b} ({round(100*a/max(1,b))}%)" for f,(a,b) in agree.items()}}
c=json.load(open(f'{D}/contrast.json'));cv={v:[0,0,0] for v in V}
for g in c:
    v=gkey[g['gid']]['variant'];cv[v][2]+=1;cv[v][0]+=bool(g.get('differ_in_substance'));cv[v][1]+=bool(g.get('each_fits_its_answer'))
out['contrast']={v:f"differ {a}/{n}, fit {b}/{n}" for v,(a,b,n) in cv.items()}
json.dump(out,open(f'{D}/BLIND-RESULTS.json','w'),indent=1);print(json.dumps(out,indent=1))
