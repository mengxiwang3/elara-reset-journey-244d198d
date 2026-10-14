<script>
(function(){
var P=new URLSearchParams(location.search);
var I={ // icons
 lock:'<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" class="f" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
 people:'<svg class="i" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19c.6-3 3-4.6 5.5-4.6s4.9 1.6 5.5 4.6M15 15.2c2.5-.4 4.6.9 5.5 3.8"/></svg>',
 save:'<svg class="i" viewBox="0 0 24 24"><path d="M7 4h10v16l-5-3.6L7 20z"/></svg>',
 saved:'<svg class="i f" viewBox="0 0 24 24"><path d="M7 4h10v16l-5-3.6L7 20z"/></svg>',
 leaf:'<svg class="i" viewBox="0 0 24 24"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8"/></svg>',
 leafon:'<svg class="i f" viewBox="0 0 24 24"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z"/></svg>',
 reply:'<svg class="i" viewBox="0 0 24 24"><path d="M10 7 4 12l6 5M4 12h9c4 0 7 2 7 7"/></svg>',
 dots:'<svg class="i" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/></svg>',
 search:'<svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></svg>',
 back:'<svg class="i" viewBox="0 0 24 24" style="width:22px;height:22px"><path d="M15 5 8 12l7 7"/></svg>',
 plus:'<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
 bell:'<svg class="i" viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/></svg>',
 flag:'<svg class="i" viewBox="0 0 24 24"><path d="M6 21V4M6 5h11l-2 4 2 4H6"/></svg>',
 eye:'<svg class="i" viewBox="0 0 24 24"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><path d="m4 4 16 16"/></svg>',
 block:'<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="m6.5 6.5 11 11"/></svg>',
 mute:'<svg class="i" viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4M4 4l16 16"/></svg>',
 shield:'<svg class="i" viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/></svg>'
};
var TOPICS=[
 {id:'money',name:'Money Clarity',tint:'#F1E7D6',c:'#E65A28',one:'Feeling calmer about money',purpose:'Everyday money and the feelings around it: spending, debt, partners, family. Practical and kind. Not financial advice.'},
 {id:'love',name:'Love & Boundaries',tint:'#F6E8E1',c:'#D94F1D',one:'Getting what you need from the people close to you',purpose:'Partners, friends, saying no, asking for what you need.'},
 {id:'family',name:'Motherhood & Family',tint:'#E4EADD',c:'#635A54',one:'Raising people while staying yourself',purpose:'Children, parents, in-laws, and the family you carry.'},
 {id:'self',name:'Self-Trust',tint:'#FCF7EE',c:'#16382A',one:'Trusting your own choices',purpose:'Deciding without asking everyone first.'},
 {id:'purpose',name:'Purpose & Work',tint:'#ECEAE3',c:'#1B4232',one:'Finding what actually pulls you',purpose:'Work, change, and what you want to do next.'},
 {id:'energy',name:'Energy & Daily Life',tint:'#E4ECE9',c:'#E5A93C',one:'Keeping enough for yourself; days that hold together',purpose:'Rest, routines, and the shape of an ordinary week.'}
];
var WOMEN={S:['Sofía','t0'],V:['Valeria','t1'],C:['Camila','t2'],D:['Daniela','t3'],Ma:['Mariana','t4'],L:['Luz','t5'],X:['Ximena','t6'],Mo:['Marisol','t7']};
function av(k,c){var w=WOMEN[k];return '<i class="av '+(c||'')+' '+w[1]+'">'+(k==='Ma'||k==='Mo'?k:w[0][0])+'</i>'}
function T(id){return TOPICS.filter(function(t){return t.id===id})[0]}
var Q={
 q1:{t:'money',by:'X',ago:'2 days ago',n:9,title:"How did you tell family you couldn’t lend them money again?",
  body:["My brother asked again last week. It’s the third time in two years. The first two times I lent it, it wasn’t repaid, and I said nothing.","This time I said no, badly: I over-explained, apologised four times, and then lent half anyway because he cried. How have you actually said it, in words, without it turning into a fight? Especially when the no has to hold for next time."],
  sn:'Valeria: “I stopped explaining. Explaining gives the other person something to negotiate with.”'},
 q2:{t:'money',by:'D',ago:'1 day ago',n:4,title:'Is it normal to feel nothing after paying off a debt?',sn:'Luz: “Flat for about a month. I’d been bracing for years and didn’t know what to do with my hands.”'},
 q3:{t:'money',by:'Mo',ago:'5 hours ago',n:0,title:'How do you split rent with a partner who earns twice as much?',sn:''},
 q4:{t:'money',by:'C',ago:'8 hours ago',n:0,title:"I got a raise and I’m scared to change anything. Where do I start?",sn:''},
 q5:{t:'money',by:'L',ago:'3 days ago',n:11,title:'What did you stop doing once you started tracking your spending?',sn:'Mariana: “Buying things when I was tired. Thursday at 9pm was my most expensive hour.”'},
 q6:{t:'money',by:'Ma',ago:'4 days ago',n:14,title:'Anyone else avoid opening their bank app on Sundays?',sn:'Camila: “I open it with the sound off and one hand over half the screen. It got easier when I made it a ten-minute date.”'},
 q7:{t:'family',by:'V',ago:'1 day ago',n:6,title:"How do you handle your mother-in-law commenting on what you spend on the kids?",sn:'Daniela: “One sentence, said calmly, every time: “We’ve decided, and it works for us.””'},
 qs:{t:'money',by:'S',ago:'just now',n:2,title:"My mother keeps asking if I’m doing okay with money. How do I answer without lying or opening the whole thing?",
  body:["She isn’t prying, she’s worried, and she’d offer money I don’t want to owe. Last time I said “fine” and she saw straight through it.","I want one answer that’s true and closes the subject kindly."],sn:''}
};
var REP={
 q1:[
  {id:'r1',by:'V',ctx:'Walking Money Clarity · Week 3 (shown by her choice)',t:"I stopped explaining. Explaining gives the other person something to negotiate with. What worked: “I can’t lend money. I can help you look at the options if you want.” Then I said it again, the same sentence, when he pushed. The second time is the one that makes it stick.",h:6},
  {id:'r2',by:'C',ctx:'Here since March',t:"Decide the number before the call, not during. Mine is zero for loans and a small amount I’ll give and never expect back. A gift I can afford stopped the guilt, because I wasn’t refusing him. I was choosing what I give.",h:4},
  {id:'r3',by:'D',ctx:'',t:"I’m in the same spot with my sister, so no advice. But “lent half anyway because he cried” is the most honest line I’ve read here. I did that too.",h:2},
  {id:'r4',by:'X',ctx:'Asked this question',asker:true,t:"Update, Sunday: I used Valeria’s sentence almost word for word. He was quiet, then said okay. I cried in the car afterwards. Thank you both.",h:5}
 ],
 qs:[
  {id:'s1',by:'V',ctx:'Walking Money Clarity · Week 3 (shown by her choice)',nw:true,t:"I give her one true sentence and one boundary: “It’s tight this month and I’m handling it. I’ll tell you if I need help.” Then I change the subject to something she can do, like Sunday lunch. Worry needs a job.",h:0},
  {id:'s2',by:'C',ctx:'Here since March',nw:true,t:"Ask her what she’s afraid of. Mine was afraid I’d end up where she did. When I said “I’m not where you were,” she stopped asking.",h:0}
 ]
};
var KB='<div class="kbd"><div class="kr0"><b>q</b><b>w</b><b>e</b><b>r</b><b>t</b><b>y</b><b>u</b><b>i</b><b>o</b><b>p</b></div><div class="kr1"><b>a</b><b>s</b><b>d</b><b>f</b><b>g</b><b>h</b><b>j</b><b>k</b><b>l</b></div><div class="kr2"><b>z</b><b>x</b><b>c</b><b>v</b><b>b</b><b>n</b><b>m</b></div><div class="kr3"><b class="w">123</b><b class="sp">space</b><b class="w">return</b></div></div>';
function fresh(){return {screen:'home',stack:[],returning:false,followed:{money:true,family:true},saved:{q6:true},helped:{},sort:'new',q:'q1',
 askTopic:'money',askTitle:'',askBody:'',askAnon:false,askPractice:false,replyText:'',composing:false,replied:false,posted:false,kb:false,menu:null,toast:'',
 roomPick:{V:true,C:true},roomSent:false,roomOpt:'rest',followRep:{},fullThread:false};}
var S=fresh();
var dev=+P.get('dev')||390, ts=+P.get('ts')||1;
var SCENES=[
 ['home','1 Home'],['home-ret','1b Home, replied to'],['topic','2 Topic'],['topic-un','2b Unanswered'],['thread','3 Thread'],['reply','3b Replying'],['ask-empty','4 Ask'],['ask','4b Ask, filled'],['return','5 Return to replies'],['menu','Report / block'],['room-start','6 Start a room'],['room-new','6b New room'],['room-quiet','6c Quiet room']
];
function go(name){
 S=fresh();
 switch(name){
  case 'home':break;
  case 'home-ret':S.returning=true;S.posted=true;S.replied=true;break;
  case 'topic':S.screen='topic';break;
  case 'topic-un':S.screen='topic';S.sort='un';break;
  case 'thread':S.screen='thread';S.q='q1';S.helped.r1=true;S.saved.q1=true;break;
  case 'reply':S.screen='thread';S.q='q1';S.replyTo='r1';S.composing=true;S.kb=true;S.replyText="The line “I can’t lend money, but I can help you look at the options” is going straight into my notes. Did the second time feel as awkward as the first?";break;
  case 'ask-empty':S.screen='ask';break;
  case 'ask':S.screen='ask';S.kb=true;S.askTitle="My mother keeps asking if I’m doing okay with money. How do I answer without lying or opening the whole thing?";S.askBody="She isn’t prying, she’s worried, and she’d offer money I don’t want to owe. Last time I said “fine” and she saw straight through it.";break;
  case 'return':S.screen='thread';S.q='qs';S.returning=true;S.posted=true;S.replied=true;break;
  case 'menu':S.screen='thread';S.q='q1';S.menu='r1';break;
  case 'room-start':S.screen='thread';S.q='qs';S.returning=true;S.posted=true;S.replied=true;S.menu='room';break;
  case 'room-new':S.screen='room-new';S.roomSent=true;break;
  case 'room-quiet':S.screen='room-quiet';S.roomSent=true;break;
 }
 S.scene=name;render();if(S.screen==='thread'&&S.returning&&!S.menu)scrollNew();
}
/* ---------- helpers ---------- */
function tabs(){return '<div class="tabs">'+['Today','Atlas','Ask Elara','Explore','Circles'].map(function(t){return '<span class="'+(t==='Circles'?'on':'')+'"><em></em>'+t+'</span>'}).join('')+'</div>'}
function topbar(title,right){return '<div class="topbar"><button class="bk" data-a="back" aria-label="Back">'+I.back+'</button><div class="tt">'+title+'</div>'+(right||'')+'</div>'}
function aud(txt,em){return '<span class="aud">'+I.people+'<b>'+txt+'</b>'+(em?'<em>'+em+'</em>':'')+'</span>'}
function audPriv(txt,em){return '<span class="aud">'+I.lock+'<b>'+txt+'</b>'+(em?'<em>'+em+'</em>':'')+'</span>'}
function repliesOf(id){
 var r=(REP[id]||[]).slice();
 if(id==='q1'){
  if(S.replied){r.splice(2,0,{id:'rs',by:'S',ctx:'You',mine:true,t:S.replyText||"The line “I can’t lend money, but I can help you look at the options” is going straight into my notes. Did the second time feel as awkward as the first?",h:2});
   if(S.returning)r.splice(3,0,{id:'rv',by:'V',ctx:'Walking Money Clarity · Week 3 (shown by her choice)',nw:true,t:"Honestly, more awkward. The first time I was angry, so it came out easy. The second time I was calm and it felt cold. It still worked. Tell me how the conversation with your mother goes.",h:0,toS:true});}
 }
 return r;
}
function questionRow(id,opts){
 var q=Q[id],t=T(q.t);opts=opts||{};
 var un=q.n===0;
 return '<div class="qrow" data-a="open" data-q="'+id+'"><div class="tag"><span class="dot" style="--c:'+t.c+'"></span>'+t.name+(opts.notopic?'':'')+' · '+WOMEN[q.by][0]+' · '+q.ago+'</div><h3>'+q.title+'</h3>'+
  (q.sn?'<div class="sn">'+q.sn+'</div>':'')+
  '<div class="meta">'+(un?'<span class="need">No replies yet. Be the first to reply</span>':'<span>'+q.n+' replies</span>')+
  '<span style="margin-left:auto" data-a="save" data-q="'+id+'">'+(S.saved[id]?I.saved:I.save)+'</span></div></div>';
}
/* ---------- screens ---------- */
function home(){
 var ret='';
 if(S.returning){
  ret='<div class="sechd">Replies to you</div>'+
  '<div class="rcard" data-a="open" data-q="qs"><span class="newdot"></span><div class="who">'+av('V','sm')+'<span><span class="nm">Valeria</span> and 1 other replied to your question</span></div><q>“I give her one true sentence and one boundary…”</q><div class="meta mut" style="font-size:var(--s12)">'+T('money').name+' · “My mother keeps asking if I\'m doing okay…”</div></div>'+
  '<div class="rcard" data-a="open" data-q="q1"><span class="newdot"></span><div class="who">'+av('V','sm')+'<span><span class="nm">Valeria</span> wrote back to your reply</span></div><q>“More awkward, honestly. It still worked…”</q><div class="meta mut" style="font-size:var(--s12)">'+T('money').name+' · “How did you tell family you couldn\'t lend…”</div></div>';
 }
 var ask='<div class="askcard"><h2>What\'s on your mind?</h2><div class="fakein" data-a="ask">Ask women who\'ve been there…</div><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="mut" style="font-size:var(--s12)">Seen by women in Elara Circles</span><button class="btn sm" data-a="ask">'+I.plus+'Ask</button></div></div>';
 var worth='<div class="sechd">Worth reading today</div>'+questionRow('q1')+questionRow('q7')+questionRow('q2');
 var yt='<div class="sechd">Your topics</div><div class="chiprow">'+
  '<span class="pill" data-a="topic" data-t="money"><span class="dot" style="--c:#E65A28"></span>Money Clarity <small>2 unanswered</small></span>'+
  '<span class="pill" data-a="topic" data-t="family"><span class="dot" style="--c:#635A54"></span>Motherhood &amp; Family</span></div>';
 var disc='<div class="sechd">Find a topic</div><div class="tg">'+TOPICS.filter(function(t){return !S.followed[t.id]}).map(function(t){return '<div class="tcard" style="background:'+t.tint+'" data-a="topic" data-t="'+t.id+'"><b>'+t.name+'</b><span>'+t.one+'</span><em>Browse ›</em></div>'}).join('')+'</div>';
 var rooms='<div class="sechd">Small private rooms</div><div class="roomrow" data-a="room-new"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font:600 var(--s15) Fraunces,serif">Mothers Circle</b>'+audPriv('Private · 8 women','2 seats open')+'</div><div class="mut" style="font-size:var(--s13)">This week\'s question is on the table.</div></div><span class="mut" style="font-size:var(--s13)">Rooms are optional. <b style="color:var(--forest)">Find or start one ›</b></span>';
 return '<div class="scr">'+
  '<div class="mast"><div class="eyebrow2">'+(S.returning?'Thursday 15 October':'Wednesday 14 October')+'</div><div class="r"><h1>Circles</h1><span class="ico">'+I.search+'</span></div><div class="rule2"></div></div>'+
  (S.returning?ret+ask:ask)+worth+'<a class="linkb" data-a="topic" data-t="money">More in your topics ›</a>'+yt+disc+rooms+
  '<div class="endmark">That\'s today\'s list.</div><div class="safety">'+I.shield+'<span>Circles aren\'t monitored overnight. If you need help right now, <b style="color:var(--forest)">get help now</b>.</span></div></div>'+tabs();
}
function topic(){
 var t=T('money'),sorts=[['new','New'],['un','Unanswered'],['help','Helpful this month'],['saved','Saved']];
 var ids=['q4','q3','q2','q1','q5','q6'];
 if(S.sort==='un')ids=['q4','q3'];
 if(S.sort==='help')ids=['q1','q6','q5','q2'];
 if(S.sort==='saved')ids=Object.keys(S.saved).filter(function(k){return S.saved[k]&&Q[k]});
 if(S.posted&&S.sort==='new')ids=['qs'].concat(ids);
 var rows=ids.length?ids.map(function(i){return questionRow(i)}).join(''):'<p class="mut" style="padding:14px 0">Nothing saved yet. Tap the bookmark on any question to keep it.</p>';
 return topbar(t.name,'<button class="mn" data-a="notif" aria-label="Notifications">'+I.bell+'</button>')+
 '<div class="scr" style="padding-bottom:84px"><div class="thead" style="background:'+t.tint+'"><div class="eyebrow2">Topic</div><h1>'+t.name+'</h1><p>'+t.purpose+'</p>'+
 '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn sm '+(S.followed.money?'ghost':'')+'" data-a="follow" data-t="money">'+(S.followed.money?'Following':'Follow')+'</button><span class="mut" style="font-size:var(--s12)">Hosted by the Elara team. <b style="color:var(--forest)">How this space works ›</b></span></div></div>'+
 '<div class="chiprow">'+sorts.map(function(s){return '<span class="pill '+(S.sort===s[0]?'on':'')+'" data-a="sort" data-s="'+s[0]+'">'+s[1]+'</span>'}).join('')+'</div>'+
 (S.sort==='un'?'<p class="mut" style="font-size:var(--s13)">Women are waiting for a reply. You don\'t need to be an expert. Telling what you did is enough.</p>':'')+
 '<div>'+rows+'</div>'+
 '<div class="roomrow" data-a="room-start"><b style="font:600 var(--s15) Fraunces,serif">Want a smaller place?</b><span class="mut" style="font-size:var(--s13)">Private rooms for up to ten women, in Money Clarity. Optional. <b style="color:var(--forest)">See how they work ›</b></span></div></div>'+
 '<div class="fab"><button class="btn" data-a="ask" style="width:auto">'+I.plus+(dev===320?' Ask':' Ask in '+t.name)+'</button></div>'+tabs();
}
function replyHTML(r,qid){
 var mine=r.mine,isNew=r.nw&&S.returning;
 var h=S.helped[r.id];
 var acts='';
 if(mine)acts='<span class="priv">Helped '+r.h+' women · only you see this</span>';
 else acts='<span class="act '+(h?'on':'')+'" data-a="help" data-r="'+r.id+'">'+(h?I.leafon:I.leaf)+' This helped me</span><span class="act" data-a="replyto" data-r="'+r.id+'">'+I.reply+' Reply</span>'+(h&&r.h!==undefined?'':'');
 return '<div class="reply '+(r.asker?'asker':'')+(isNew?' newr':'')+'" id="'+r.id+'"><header>'+av(r.by,'sm')+'<div><div class="n">'+WOMEN[r.by][0]+(r.asker?' <span class="mut" style="font-weight:400">· the asker</span>':'')+'</div>'+(r.ctx?'<div class="c">'+r.ctx+'</div>':'')+'</div><button class="mn" data-a="menu" data-r="'+r.id+'" aria-label="Options for '+WOMEN[r.by][0]+'\'s reply">'+I.dots+'</button></header>'+
 '<p class="t">'+r.t+'</p><div class="ra">'+acts+'</div></div>';
}
function thread(){
 var q=Q[S.q],t=T(q.t),isMine=S.q==='qs',reps=repliesOf(S.q);
 if(S.composing){
  var tr=reps.filter(function(r){return r.id===S.replyTo})[0];
  return topbar('Reply','')+'<div class="scr"><div class="paperc" style="gap:6px"><div class="eyebrow2">Replying to '+(tr?WOMEN[tr.by][0]+'\'s reply in':'')+' '+WOMEN[q.by][0]+'’s question</div><div style="font:600 var(--s15)/1.3 Fraunces,serif;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+q.title+'</div></div>'+
  '<div class="field focus"><label>Your reply</label><textarea id="replyTa" rows="'+(dev===320?4:5)+'" placeholder="Share what worked for you…">'+esc(S.replyText)+'</textarea><div style="font-size:var(--s12);color:var(--mut);display:flex;gap:6px;align-items:center">'+I.people+'Seen by women in Elara Circles, with your first name</div></div></div>'+
  '<div class="dock"><div style="display:flex;gap:8px"><button class="btn ghost" data-a="cancelreply" style="flex:1">Cancel</button><button class="btn" id="sendBtn" data-a="sendreply" style="flex:2;'+(S.replyText.length<8?'opacity:.5':'')+'" '+(S.replyText.length<8?'disabled':'')+'>Send reply</button></div></div>'+(S.kb?KB:'');
 }
 var body=q.body?q.body.map(function(p){return '<p>'+p+'</p>'}).join(''):'';
 var n=isMine?reps.length:q.n+(S.replied&&S.q==='q1'?1+(S.returning?1:0):0);
 var shown=reps;
 var html='',divDone=false;
 shown.forEach(function(r,i){ if(r.nw&&S.returning&&!divDone){divDone=true;html+='<div class="newdiv" id="newdiv">New since you were here</div>'}html+=replyHTML(r,S.q);});
 var more=(!isMine&&q.n>4)?'<button class="linkb" style="text-align:left">'+(q.n-4)+' more replies ›</button>':'';
 var bar;
 if(S.composing){
  bar='<div class="dock" style="gap:8px"><div class="field focus"><label>Your reply</label><textarea id="replyTa" rows="'+(dev===320?3:4)+'" placeholder="Share what worked for you…">'+esc(S.replyText)+'</textarea><div class="au" style="font-size:var(--s12);color:var(--mut);display:flex;gap:6px;align-items:center">'+I.people+'Seen by women in Elara Circles, with your first name</div></div><div style="display:flex;gap:8px"><button class="btn ghost" data-a="cancelreply" style="flex:1">Cancel</button><button class="btn" id="sendBtn" data-a="sendreply" style="flex:2" '+(S.replyText.length<8?'disabled style="flex:2;opacity:.5"':'')+'>Send reply</button></div></div>';
 }else{
  bar='<div class="replybar"><div class="fakein" data-a="compose">Write a reply…</div><div class="au">'+I.people+'Seen by women in Elara Circles, with your first name</div></div>';
 }
 var offerRoom=(isMine&&S.returning)?'<div class="roomrow" data-a="room-start"><b style="font:600 var(--s15) Fraunces,serif">Want to keep talking with Valeria and Camila?</b><span class="mut" style="font-size:var(--s13)">A small private room is a place for the same few women. They choose whether to join. <b style="color:var(--forest)">Start one ›</b></span></div>':'';
 return topbar(t.name,'<button class="mn" data-a="menu" data-r="post" aria-label="Options for this question">'+I.dots+'</button>')+
 '<div class="scr"><div class="qbody"><div class="byline">'+av(q.by,'sm')+'<b>'+(isMine?'You':WOMEN[q.by][0])+'</b><span class="mut">· '+q.ago+'</span><span class="pill" style="padding:2px 9px;cursor:default"><span class="dot" style="--c:'+t.c+'"></span>'+t.name+'</span></div>'+
 aud('Seen by women in Elara Circles',isMine?'· your first name':'· first names only')+
 '<h1>'+q.title+'</h1>'+body+'</div>'+
 '<div class="acts"><span class="act '+(S.saved[S.q]?'on':'')+'" data-a="save" data-q="'+S.q+'">'+(S.saved[S.q]?I.saved:I.save)+' '+(S.saved[S.q]?'Saved':'Save')+'</span><span class="act '+(S.followRep[S.q]||isMine?'on':'')+'" data-a="followrep" data-q="'+S.q+'">'+I.bell+' '+(S.followRep[S.q]||isMine?'Following replies':'Follow replies')+'</span></div>'+
 '<div style="display:flex;justify-content:space-between;align-items:baseline"><div class="sechd">'+n+' replies</div><button class="linkb">Helpful first ▾</button></div>'+html+more+offerRoom+
 (S.q==='q1'?'<div class="sechd">More in '+t.name+'</div>'+questionRow('q2')+questionRow('q5'):'')+'</div>'+bar+(S.kb&&S.composing?KB:'');
}
function ask(){
 var ok=S.askTitle.trim().length>=12;
 var compactAsk=S.kb&&(dev===320||ts>1);
 var topicPills=compactAsk?'<span class="pill on">'+T(S.askTopic).name+'</span><span class="mut" style="font-size:var(--s12)">tap to change</span>':TOPICS.map(function(t){return '<span class="pill '+(S.askTopic===t.id?'on':'')+'" data-a="asktopic" data-t="'+t.id+'">'+t.name+'</span>'}).join('');
 var sim=(S.askTitle.length>10&&S.askTopic==='money'&&!compactAsk)?'<div class="simq" id="sim"><b style="font-size:var(--s12);letter-spacing:.06em;text-transform:uppercase;color:var(--mut)">Women have asked similar things</b><a data-a="open" data-q="q1">'+Q.q1.title+'</a><a data-a="open" data-q="q7">'+Q.q7.title+'</a></div>':'<div class="simq" id="sim" style="display:none"></div>';
 var practice=S.askPractice?'<div class="simq"><b style="font-size:var(--s12);letter-spacing:.06em;text-transform:uppercase;color:var(--mut)">This exact line will be added</b>“A spend that felt right: the school shoes.” <a data-a="practice" style="color:var(--ember)">Remove it</a></div>':'';
 var comp=(dev===320&&S.kb)?'':'';
 return topbar('Ask a question','')+
 '<div class="scr"><div>'+(compactAsk?'':'<div class="sechd" style="margin-bottom:6px">Where should it go?</div>')+'<div class="chiprow">'+topicPills+'</div></div>'+
 '<div class="field '+(S.kb?'focus':'')+'"><label>Your question</label><textarea id="askTitle" rows="'+(compactAsk?4:(dev===320?2:3))+'" style="font:600 var(--s17)/1.3 Fraunces,serif" placeholder="One question, in your own words" maxlength="160">'+esc(S.askTitle)+'</textarea><div class="cnt" id="askCnt">'+S.askTitle.length+'/160</div></div>'+
 sim+
 '<div class="field"><label>More detail (optional)</label><textarea id="askBody" rows="'+(dev===320?3:4)+'" placeholder="What have you tried? What would help most?">'+esc(S.askBody)+'</textarea></div>'+
 '<div class="sechd">Who can see this</div>'+
 '<div class="radio '+(!S.askAnon?'sel':'')+'" data-a="anon" data-v="0"><b>Women in Elara Circles, with my first name</b><span class="mut">Anyone who has joined Circles can read and reply. Not just this topic.</span></div>'+
 '<div class="radio '+(S.askAnon?'sel':'')+'" data-a="anon" data-v="1"><b>Women in Elara Circles, without my name</b><span class="mut">Replies come to you quietly. The Elara team can still see who posted, if it is reported.</span></div>'+
 '<div class="paperc"><div style="display:flex;gap:8px;align-items:flex-start">'+I.lock+'<span style="font-size:var(--s13)"><b>Stays private:</b> your Ask Elara chats, Clarity answers and Path notes. Nothing from them is shared unless you choose a line below.</span></div><div class="opt '+(S.askPractice?'on':'')+'" data-a="practice"><span class="bx"></span><span>Bring in one line from today\'s practice <span class="mut">(optional)</span></span></div>'+practice+'</div>'+
 '<div class="safety">'+I.shield+'<span>Circles aren\'t monitored overnight. If you need help right now, <b style="color:var(--forest)">get help now</b>.</span></div></div>'+
 '<div class="dock"><button class="btn" id="postBtn" data-a="post" '+(ok?'':'disabled style="opacity:.5"')+'>Post to '+T(S.askTopic).name+'</button>'+(S.kb?'':'<span class="mut" style="font-size:var(--s12);text-align:center">You can delete this later. We\'ll tell you once a day when someone replies.</span>')+'</div>'+(S.kb?KB:'');
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function seat(k,st){return '<span class="seat '+(st||'')+'">'+(st==='o'?'<i class="av"></i>':av(k))+'</span>'}
function roomNew(){
 var inv=Object.keys(S.roomPick).filter(function(k){return S.roomPick[k]});
 return topbar('Sunday Money Talks','')+'<div class="scr"><div class="eyebrow2">Your room · new</div><h1 style="font-size:var(--s23)">Sunday Money Talks</h1>'+audPriv('Private · 1 woman','9 seats open')+
 '<div class="seats">'+seat('S')+seat('V','i')+seat('C','i')+'<span class="seat o"><i class="av"></i></span>'.repeat(7)+'</div>'+
 '<div class="paperc"><b style="font:600 var(--s17) Fraunces,serif">Waiting for Valeria and Camila</b><span style="font-size:var(--s13)">Invitations are private. Each woman chooses whether to come, and can say no. Elara asks the first question when three women are in.</span></div>'+
 '<div class="elara"><div class="eh"><span class="orb"></span>Elara <span class="chipai">AI</span></div><p>Nothing from the public thread moves into this room. It starts empty, and the thread stays where it is.</p></div>'+
 '<a class="linkb" data-a="topic" data-t="money">Back to Money Clarity ›</a></div>'+tabs();
}
function roomQuiet(){
 var opts=[['ask','Ask something lighter','Elara suggests: “What is one small thing that went right with money this week?” You can change it.'],['invite','Invite one more woman from Money Clarity','Seven seats are open. Invitations are private and she can say no.'],['rest','Let the room rest','Nobody is removed. Reminders stop and the shelf stays. If no one returns in 60 days, seats open to new women, and anyone can ask to come back.']];
 return topbar('Sunday Money Talks','')+'<div class="scr"><div class="eyebrow2">Quiet for three weeks</div>'+audPriv('Private · 3 women','7 seats open')+
 '<div class="seats">'+seat('S')+seat('V','q')+seat('C','q')+'<span class="seat o"><i class="av"></i></span>'.repeat(7)+'</div>'+
 '<div class="elara"><div class="eh"><span class="orb"></span>Elara <span class="chipai">AI</span> <span class="mut" style="font-weight:400">· only the women in this room see this</span></div><p>It has been quiet for three weeks. That happens, and nobody is behind. Here are three ways to go on.</p></div>'+
 opts.map(function(o){return '<div class="radio '+(S.roomOpt===o[0]?'sel':'')+'" data-a="roomopt" data-v="'+o[0]+'"><b>'+o[1]+'</b><span class="mut">'+o[2]+'</span></div>'}).join('')+
 '<button class="btn" data-a="roomgo">'+({ask:'Send the lighter question',invite:'Choose a woman to invite',rest:'Let the room rest'})[S.roomOpt]+'</button>'+
 '<span class="mut" style="font-size:var(--s12)">Your topics are still here: <b style="color:var(--forest)" data-a="topic" data-t="money">Money Clarity ›</b>. Leaving a room never removes what you wrote in a topic.</span></div>'+tabs();
}
function overlays(){
 var o='';
 if(S.menu==='room'){
  o='<div class="dim" data-a="closemenu"></div><div class="sheet"><i class="grab"></i><h3>Start a small private room</h3><p class="mut">For the few women you keep talking with. Optional, and separate from this thread.</p>'+
  '<div class="paperc" style="gap:6px"><span style="font-size:var(--s13)"><b>Up to ten women.</b> The same people each week, one Elara question a week, a shelf and a recap. Only the women in the room see it.</span></div>'+
  '<div class="sechd">Invite from this thread (they can say no)</div>'+
  ['V','C'].map(function(k){return '<div class="opt '+(S.roomPick[k]?'on':'')+'" data-a="pick" data-k="'+k+'"><span class="bx"></span><span style="display:flex;gap:8px;align-items:center">'+av(k,'sm')+WOMEN[k][0]+'</span></div>'}).join('')+
  '<span class="mut" style="font-size:var(--s12)">This thread stays public and nothing in it moves into the room.</span><button class="btn" data-a="sendroom">Send invitations</button><button class="btn ghost" data-a="closemenu">Not now</button></div>';
 }else if(S.menu){
  var own=S.menu==='post'&&S.q==='qs';
  var nm=S.menu==='post'?WOMEN[Q[S.q].by][0]:WOMEN[(REP[S.q]||[]).concat(REP.q1,REP.qs).filter(function(r){return r.id===S.menu})[0]?(REP[S.q]||[]).concat(REP.q1,REP.qs).filter(function(r){return r.id===S.menu})[0].by:'V'][0];
  o='<div class="dim" data-a="closemenu"></div><div class="sheet"><i class="grab"></i><h3>'+(S.menu==='post'?'This question':'This reply from '+nm)+'</h3>'+
  (own?'<div class="mi" data-a="closemenu">'+I.flag+'<div><b>Delete question</b><span>It leaves Circles for everyone.</span></div></div>':
  '<div class="mi" data-a="closemenu">'+I.flag+'<div><b>Report</b><span>A person on our team reads it. It disappears for you now.</span></div></div>'+
  '<div class="mi" data-a="closemenu">'+I.eye+'<div><b>Hide</b><span>Only you stop seeing it. Nobody is told.</span></div></div>'+
  '<div class="mi" data-a="closemenu">'+I.block+'<div><b>Block '+nm+'</b><span>You won\'t see each other\'s posts. You can undo this in Settings.</span></div></div>')+
  '<div class="mi" data-a="closemenu">'+I.mute+'<div><b>Mute this thread</b><span>No more notifications from it. You can still open it.</span></div></div>'+
  '<p class="mut" style="padding-top:6px">Reports are read by our team during the day. If you need help right now, <b style="color:var(--forest)">get help now</b>.</p></div>';
 }
 if(S.toast)o+='<div class="toast">'+S.toast+'</div>';
 return o;
}
var NOTES={
 home:['1 · Circles home','A woman should get value in the first minute, without posting. Home is finite: three useful questions with the best reply on show, her topics, and a quiet way to ask. Rooms are one small row, not the whole product.',['Does she find a question worth reading before she scrolls?','Does “Ask” read as safe? The audience is stated on the card.','Does she understand a room is something else?']],
 'home-ret':['5 · Returning after a reply','The human response is the first thing on Home: who replied, and the first line of what she said. Two kinds of reply are covered: an answer to her question, and a reply to her reply in someone else\'s thread. The app also sends one notification a day (proposal).',['Is the sender\'s name enough to bring her back?','Lock-screen text: “Valeria replied to your question in Money Clarity.” No reply text, so nothing private appears on a locked phone.']],
 topic:['2 · A topic space','Purpose first, then ways to browse that favour usefulness: New, Unanswered, Helpful this month, Saved. “Helpful” orders by private signals, and nobody sees a score.',['Do women read the purpose before browsing?','Is “Ask in Money Clarity” always in reach?','Does the optional room doorway feel like an offer, not a demotion?']],
 'topic-un':['2b · Unanswered','The unanswered view is the contribution path for a woman who isn\'t ready to ask. The copy lowers the bar: telling what you did is enough.',['Do women who have never posted reply from here?','Does “No replies yet” feel like an invitation or an empty room?']],
 thread:['3 · A question thread','A real personal question, thoughtful replies, and one clear reply action. “This helped me” is quiet and private to the author. Save and Follow replies are separate. The asker\'s update is marked, not pinned.',['Does “This helped me” feel natural? Does she know it is private?','Does the reply bar say who will read what she writes?']],
 reply:['3b · Replying','The composer states the audience again, shows the words she is writing, and keeps send above the keyboard. At 320 wide with larger text it keeps one clear action.',['Does she send, or save a draft and leave?','Do the audience words change what she writes?']],
 'ask-empty':['4 · Asking a question','Topic first, then one question in her words, then detail if she wants. Who can see it is stated before she posts, with an option to ask without her name.',['Does she know what “Women in Elara Circles” means?','Do women choose “without my name”, and for which questions?']],
 ask:['4b · Ask, filled','As she types, similar questions appear above the post button, which keeps the topic from filling with repeats and gives her an answer immediately. Private content stays out unless she brings in a line and sees it.',['Does the similar-questions nudge feel helpful or like a block?','Does she trust “Stays private”?']],
 return:['5 · Thread after replies','She arrives at the new reply, marked “New since you were here”. Valeria\'s reply is first because it is the newest, not because anyone ranked it. A room offer appears only after a real exchange.',['Does she reply, thank, or leave?','Does the room offer feel timely or pushy?']],
 menu:['Report, hide, block','One “⋯” on every post and reply. Plain verbs, what each one does, and who is told (nobody, except the team for a report). Crisis help is on the sheet, not hidden in settings.',['Do women expect hiding to tell the author?','Is this enough, or does it feel like too many choices?']],
 'room-start':['6 · From a thread to a small room','After a real exchange she can invite the women she was talking to. They opt in. Nothing from the thread moves into the room, and the thread stays public.',['Does she see a room as a deeper step, not an upsell?','What makes a woman say yes to an invitation?']],
 'room-new':['6b · A new room','The room starts small: she and two invited women. It says who is invited and what happens next. Elara asks the first question once three women are in. The cap of ten is visible as open seats.',['Is “waiting for Valeria and Camila” clear?','Does an empty room feel inviting?']],
 'room-quiet':['6c · A quiet room','Quiet is allowed. Elara offers three ways to go on, with nobody to blame: a lighter question, one more invitation, or rest. Resting stops reminders, removes nobody, and keeps the shelf. The 60 days and the minimum of three women are proposals to test.',['Do the three options match what women want?','Does “resting” feel kind, or like failure?']]
};
function render(){
 var app=document.getElementById('app'),h='';
 if(S.screen==='home')h=home();else if(S.screen==='topic')h=topic();else if(S.screen==='thread')h=thread();else if(S.screen==='ask')h=ask();else if(S.screen==='room-new')h=roomNew();else if(S.screen==='room-quiet')h=roomQuiet();
 app.innerHTML=h+overlays();
 var ph=document.getElementById('phone');
 ph.className='phone d'+dev;ph.style.width=dev+'px';ph.style.height=(dev===320?568:844)+'px';ph.style.setProperty('--ts',ts);
 document.getElementById('phonecol').className='phonecol'+(P.get('full')?' full':'');
 var nt=NOTES[S.scene||'home']||NOTES.home;
 document.getElementById('notes').innerHTML='<h2>'+nt[0]+'</h2><p>'+nt[1]+'</p><h3>Look for</h3><ul>'+nt[2].map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'+
  (S.scene==='home-ret'?'<h3>Lock-screen notification (proposal)</h3><div class="box" style="font-size:14px"><b>Elara</b> · now<br>Valeria replied to your question in Money Clarity.</div>':'');
 [].forEach.call(document.querySelectorAll('#scenes .chip'),function(c){c.setAttribute('aria-current',c.dataset.sc===S.scene?'true':'false')});
 [].forEach.call(document.querySelectorAll('#devseg button'),function(b){b.setAttribute('aria-pressed',String(+b.dataset.dev===dev))});
 [].forEach.call(document.querySelectorAll('#tsseg button'),function(b){b.setAttribute('aria-pressed',String(+b.dataset.ts===ts))});
 if(P.get('chrome')==='0'){var wrap=document.querySelector('.wrap');[].forEach.call(wrap.children,function(c){if(c.className.indexOf('stagewrap')<0)c.style.display='none'});document.getElementById('notes').style.display='none';document.querySelector('.stagewrap').style.display='block';document.body.style.background='transparent';wrap.style.padding='0'}
 var sc=document.querySelector('#app .scr');
}
function scrollNew(){var d=document.getElementById('newdiv'),sc=document.querySelector('#app .scr');if(d&&sc){sc.scrollTop=Math.max(0,d.offsetTop-sc.offsetTop-70)}}
function nav(s,extra){S.stack.push({screen:S.screen,q:S.q,sort:S.sort});S.screen=s;if(extra)for(var k in extra)S[k]=extra[k];S.menu=null;S.kb=false;S.composing=false;S.scene=null;render();var sc=document.querySelector('#app .scr');if(sc)sc.scrollTop=0;if(s==='thread'&&S.returning)scrollNew()}
document.addEventListener('click',function(e){
 var el=e.target.closest('[data-a]');if(!el)return;
 var a=el.dataset.a;
 if(a==='save'){e.stopPropagation();var q=el.dataset.q;S.saved[q]=!S.saved[q];S.toast=S.saved[q]?'Saved. Find it under “Saved” in the topic.':'';render();if(S.toast)setTimeout(function(){S.toast='';render()},1600);return}
 if(a==='open'){if(el.dataset.q==='qs'&&!S.posted){return}nav('thread',{q:el.dataset.q});return}
 if(a==='back'){var p=S.stack.pop();if(p){S.screen=p.screen;S.q=p.q;S.sort=p.sort}else S.screen='home';S.menu=null;S.kb=false;S.composing=false;S.scene=null;render();return}
 if(a==='topic'){nav('topic');return}
 if(a==='ask'){nav('ask');return}
 if(a==='follow'){S.followed[el.dataset.t]=!S.followed[el.dataset.t];render();return}
 if(a==='sort'){S.sort=el.dataset.s;S.scene=null;render();return}
 if(a==='help'){S.helped[el.dataset.r]=!S.helped[el.dataset.r];S.toast=S.helped[el.dataset.r]?'Thanks. '+WOMEN[(repliesOf(S.q).filter(function(r){return r.id===el.dataset.r})[0]||{by:'V'}).by][0]+' will see that this helped. No one else sees it.':'';render();if(S.toast)setTimeout(function(){S.toast='';render()},1800);return}
 if(a==='followrep'){S.followRep[el.dataset.q]=!S.followRep[el.dataset.q];render();return}
 if(a==='compose'||a==='replyto'){S.replyTo=el.dataset.r||null;S.composing=true;S.kb=true;render();var ta=document.getElementById('replyTa');if(ta)ta.focus();return}
 if(a==='cancelreply'){S.composing=false;S.kb=false;render();return}
 if(a==='sendreply'){if(S.replyText.length<8)return;S.replied=true;S.composing=false;S.kb=false;S.toast='Sent. We\'ll tell you once a day if someone writes back.';render();setTimeout(function(){S.toast='';render()},2200);return}
 if(a==='menu'){e.stopPropagation();S.menu=el.dataset.r;render();return}
 if(a==='closemenu'){S.menu=null;render();return}
 if(a==='asktopic'){S.askTopic=el.dataset.t;render();return}
 if(a==='anon'){S.askAnon=el.dataset.v==='1';render();return}
 if(a==='practice'){S.askPractice=!S.askPractice;render();return}
 if(a==='post'){if(S.askTitle.trim().length<12)return;S.posted=true;S.stack=[];S.screen='thread';S.q='qs';S.kb=false;S.toast='Posted to '+T(S.askTopic).name+'. We\'ll tell you once a day when someone replies.';render();setTimeout(function(){S.toast='';render()},2400);return}
 if(a==='room-start'){S.screen='thread';S.q='qs';S.posted=true;S.returning=true;S.replied=true;S.menu='room';S.scene=null;render();return}
 if(a==='room-new'){nav('room-quiet');return}
 if(a==='pick'){S.roomPick[el.dataset.k]=!S.roomPick[el.dataset.k];render();return}
 if(a==='sendroom'){nav('room-new',{roomSent:true});return}
 if(a==='roomopt'){S.roomOpt=el.dataset.v;render();return}
 if(a==='roomgo'){S.toast=({ask:'Question sent to the room.',invite:'Choose a woman from Money Clarity.',rest:'The room is resting. Nothing is lost.'})[S.roomOpt];render();setTimeout(function(){S.toast='';render()},2000);return}
});
document.addEventListener('input',function(e){
 var t=e.target;
 if(t.id==='askTitle'){S.askTitle=t.value;document.getElementById('askCnt').textContent=t.value.length+'/160';var b=document.getElementById('postBtn');var ok=t.value.trim().length>=12;b.disabled=!ok;b.style.opacity=ok?1:.5;var sim=document.getElementById('sim');if(sim){if(t.value.length>10&&S.askTopic==='money'){sim.style.display='grid';sim.innerHTML='<b style="font-size:var(--s12);letter-spacing:.06em;text-transform:uppercase;color:var(--mut)">Women have asked similar things</b><a data-a="open" data-q="q1">'+Q.q1.title+'</a><a data-a="open" data-q="q7">'+Q.q7.title+'</a>'}else sim.style.display='none'}}
 if(t.id==='askBody')S.askBody=t.value;
 if(t.id==='replyTa'){S.replyText=t.value;var b2=document.getElementById('sendBtn');if(b2){b2.disabled=t.value.length<8;b2.style.opacity=t.value.length<8?.5:1}}
});
document.addEventListener('focusin',function(e){var id=e.target.id;if((id==='askTitle'||id==='askBody')&&!S.kb){S.kb=true;render();var el=document.getElementById(id);if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}}});
document.getElementById('scenes').innerHTML=SCENES.map(function(s){return '<button class="chip" data-sc="'+s[0]+'">'+s[1]+'</button>'}).join('');
document.getElementById('scenes').addEventListener('click',function(e){var b=e.target.closest('[data-sc]');if(b)go(b.dataset.sc)});
document.getElementById('devseg').addEventListener('click',function(e){var b=e.target.closest('[data-dev]');if(b){dev=+b.dataset.dev;render()}});
document.getElementById('tsseg').addEventListener('click',function(e){var b=e.target.closest('[data-ts]');if(b){ts=+b.dataset.ts;render()}});
document.getElementById('reset').addEventListener('click',function(){go('home')});
go(P.get('scene')||'home');
})();
</script>
