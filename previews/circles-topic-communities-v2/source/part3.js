<script>
(function(){
var P=new URLSearchParams(location.search);
var I={
 lock:`<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,
 people:`<svg class="i" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19c.6-3 3-4.6 5.5-4.6s4.9 1.6 5.5 4.6M15 15.2c2.5-.4 4.6.9 5.5 3.8"/></svg>`,
 save:`<svg class="i" viewBox="0 0 24 24"><path d="M7 4h10v16l-5-3.6L7 20z"/></svg>`,
 saved:`<svg class="i f" viewBox="0 0 24 24"><path d="M7 4h10v16l-5-3.6L7 20z"/></svg>`,
 leaf:`<svg class="i" viewBox="0 0 24 24"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8"/></svg>`,
 leafon:`<svg class="i f" viewBox="0 0 24 24"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z"/></svg>`,
 reply:`<svg class="i" viewBox="0 0 24 24"><path d="M10 7 4 12l6 5M4 12h9c4 0 7 2 7 7"/></svg>`,
 dots:`<svg class="i" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/></svg>`,
 search:`<svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></svg>`,
 back:`<svg class="i" viewBox="0 0 24 24" style="width:22px;height:22px"><path d="M15 5 8 12l7 7"/></svg>`,
 plus:`<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
 check:`<svg class="i" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
 chev:`<svg class="i" viewBox="0 0 24 24" style="width:14px;height:14px"><path d="m9 6 6 6-6 6"/></svg>`,
 down:`<svg class="i" viewBox="0 0 24 24" style="width:14px;height:14px"><path d="m6 9 6 6 6-6"/></svg>`,
 shield:`<svg class="i" viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/></svg>`
};
/* ---------- data ---------- */
var C=[
 {id:'money',g:'area',name:'Money Clarity',one:'Spending, debt, partners, family and the feelings underneath. Not financial advice.',act:'Active today',tint:'#F1E7D6',c:'#E65A28',tags:['debt','rent','family-money','saving']},
 {id:'love',g:'area',name:'Love & Relationships',one:'Partners, friends, saying no and asking for what you need.',act:'Active today',tint:'#F6E8E1',c:'#D94F1D',tags:['boundaries','dating','friendship']},
 {id:'work',g:'area',name:'Work & Purpose',one:'Work, change, and what you want to do next.',act:'Active this week',tint:'#ECEAE3',c:'#1B4232',tags:['career-change','burnout','returning-to-work']},
 {id:'self',g:'area',name:'Self-Trust',one:'Deciding without asking everyone first.',act:'Active this week',tint:'#FCF7EE',c:'#16382A',tags:['decisions','perfectionism']},
 {id:'health',g:'area',name:'Health & Energy',one:'Rest, routines, and the shape of an ordinary week.',act:'Active this week',tint:'#E4ECE9',c:'#E5A93C',tags:['sleep','burnout','routines']},
 {id:'family',g:'area',name:'Family',one:'Parents, in-laws, siblings and the family you carry.',act:'Active today',tint:'#E4EADD',c:'#635A54',tags:['in-laws','boundaries','holidays']},
 {id:'college',g:'stage',name:'Starting College',one:'First term, first-generation, money and homesickness.',act:'Just starting',tint:'#F3E9D2',c:'#B58B2A',tags:['first-gen','student-loans']},
 {id:'job',g:'stage',name:'First Job',one:'Your first salary, first manager, first real decisions.',act:'Active this week',tint:'#E7E9DD',c:'#5C6B54',tags:['first-salary','negotiating']},
 {id:'baby',g:'stage',name:'Pregnancy & New Parenthood',one:'Pregnancy, the first year, and who you are in it.',act:'Active today',tint:'#F4E4DC',c:'#C9693E',tags:['newborn-sleep','returning-to-work','postpartum']},
 {id:'divorce',g:'stage',name:'Divorce & Separation',one:'Before, during and after. Practical and emotional.',act:'Active this week',tint:'#E9E4EB',c:'#7A5C86',tags:['co-parenting','legal-money']},
 {id:'care',g:'stage',name:'Caregiving',one:'Caring for a parent, a partner or a child with extra needs.',act:'Just starting',tint:'#E2E8E4',c:'#3F6A5B',tags:['siblings','guilt','respite']}
];
function CI(id){return C.filter(function(c){return c.id===id})[0]}
var W={S:['Sofía','t0'],V:['Valeria','t1'],C:['Camila','t2'],D:['Daniela','t3'],Ma:['Mariana','t4'],L:['Luz','t5'],X:['Ximena','t6'],Mo:['Marisol','t7']};
function av(k,c){var w=W[k];return `<i class="av ${c||''} ${w[1]}">${k==='Ma'||k==='Mo'?k:w[0][0]}</i>`}
var Q={
 q1:{c:'money',by:'X',ago:'2 days ago',n:9,title:"How did you tell family you couldn’t lend them money again?",tags:['family-money','boundaries'],
  body:["My brother asked again last week. It’s the third time in two years. The first two times I lent it, it wasn’t repaid, and I said nothing.","This time I said no, badly: I over-explained, apologised four times, and then lent half anyway because he cried. How have you actually said it, in words, without it turning into a fight? Especially when the no has to hold for next time."],
  sn:`Valeria: “I stopped explaining. Explaining gives the other person something to negotiate with.”`},
 q2:{c:'money',by:'D',ago:'1 day ago',n:4,title:'Is it normal to feel nothing after paying off a debt?',tags:['debt'],sn:`Luz: “Flat for about a month. I’d been bracing for years and didn’t know what to do with my hands.”`},
 q3:{c:'money',by:'Mo',ago:'5 hours ago',n:0,title:'How do you split rent with a partner who earns twice as much?',tags:['rent'],sn:''},
 q4:{c:'money',by:'C',ago:'8 hours ago',n:0,title:"I got a raise and I’m scared to change anything. Where do I start?",tags:['saving'],sn:''},
 q7:{c:'family',by:'V',ago:'1 day ago',n:6,title:"How do you handle your mother-in-law commenting on what you spend on the kids?",tags:['in-laws','boundaries'],sn:`Daniela: “One sentence, said calmly, every time: ‘We’ve decided, and it works for us.’”`},
 qf3:{c:'family',by:'L',ago:'6 hours ago',n:0,title:'How do you split holiday visits between two families without a fight?',tags:['holidays'],sn:''},
 qw1:{c:'work',by:'Ma',ago:'2 days ago',n:12,title:"I want to leave a stable job for something uncertain. How did you decide?",tags:['career-change'],sn:`Camila: “I wrote down what I’d regret not trying in five years, and what I’d regret losing. The second list was shorter.”`},
 qw2:{c:'work',by:'D',ago:'3 hours ago',n:0,title:'How do I stop apologising in every email at work?',tags:['perfectionism'],sn:''},
 ql1:{c:'love',by:'C',ago:'1 day ago',n:7,title:'How do you tell a partner you need time alone without it sounding like rejection?',tags:['boundaries'],sn:`Ximena: “I say what I’m going to do with the time, and when I’m back. The ‘when’ matters more than the ‘why’.”`},
 qs1:{c:'self',by:'L',ago:'2 days ago',n:8,title:'How do I stop asking three people before I decide anything?',tags:['decisions'],sn:`Valeria: “I give myself one question: would I still choose this if no one ever knew?”`},
 qh1:{c:'health',by:'Mo',ago:'1 day ago',n:9,title:'What do you do on the days when there is nothing left in the tank?',tags:['burnout','routines'],sn:`Mariana: “Three things only: water, one real meal, outside for ten minutes. Everything else waits.”`},
 qb1:{c:'baby',by:'D',ago:'2 days ago',n:14,title:'How did you decide when to go back to work after the baby?',tags:['returning-to-work'],sn:`Luz: “I picked a date that was a month later than I wanted, and moved it earlier only once I knew we could.”`},
 qb2:{c:'baby',by:'Ma',ago:'4 hours ago',n:0,title:'Is it normal to feel grief and joy at once in the first month?',tags:['postpartum'],sn:''},
 qd1:{c:'divorce',by:'X',ago:'3 days ago',n:6,title:'How do you handle money in the months between separating and the paperwork?',tags:['legal-money'],sn:`Daniela: “Separate accounts first, then a simple monthly list of shared bills. Boring, and it kept the peace.”`},
 qc1:{c:'care',by:'V',ago:'1 day ago',n:5,title:'How do you ask siblings to share care for a parent without it becoming a list of grievances?',tags:['siblings','boundaries'],sn:`Camila: “We made a shared calendar and each took a day. Nobody had to be asked twice.”`},
 qc2:{c:'care',by:'L',ago:'7 hours ago',n:0,title:'How do you stop feeling guilty when you need a weekend off?',tags:['guilt','respite'],sn:''},
 qco1:{c:'college',by:'Mo',ago:'4 days ago',n:4,title:'I’m the first in my family at university. How do you explain it at home?',tags:['first-gen'],sn:`Ximena: “Show them one thing you made, not the whole system.”`},
 qj1:{c:'job',by:'C',ago:'2 days ago',n:6,title:'My first salary arrived. How do I stop it disappearing by the 20th?',tags:['first-salary'],sn:`Daniela: “Move rent and one saving the day it lands. Spend what’s left, guilt-free.”`},
 qs:{c:'money',by:'S',ago:'3 days ago',n:2,title:"My mother keeps asking if I’m doing okay with money. How do I answer without lying or opening the whole thing?",tags:['family-money','boundaries'],
  body:["She isn’t prying, she’s worried, and she’d offer money I don’t want to owe. Last time I said “fine” and she saw straight through it.","I want one answer that’s true and closes the subject kindly."],sn:''}
};
var REP={
 q1:[
  {id:'r1',by:'V',ctx:'Walking Money Clarity · Week 3 (shown by her choice)',t:"I stopped explaining. Explaining gives the other person something to negotiate with. What worked: “I can’t lend money. I can help you look at the options if you want.” Then I said it again, the same sentence, when he pushed. The second time is the one that makes it stick."},
  {id:'r2',by:'C',ctx:'Here since March',t:"Decide the number before the call, not during. Mine is zero for loans and a small amount I’ll give and never expect back. A gift I can afford stopped the guilt, because I wasn’t refusing him. I was choosing what I give."},
  {id:'r4',by:'X',ctx:'Asked this question',asker:true,t:"Update, Sunday: I used Valeria’s sentence almost word for word. He was quiet, then said okay. I cried in the car afterwards. Thank you both."}
 ],
 qs:[
  {id:'s1',by:'V',ctx:'Walking Money Clarity · Week 3 (shown by her choice)',nw:true,t:"I give her one true sentence and one boundary: “It’s tight this month and I’m handling it. I’ll tell you if I need help.” Then I change the subject to something she can do, like Sunday lunch. Worry needs a job."},
  {id:'s2',by:'C',ctx:'Here since March',nw:true,t:"Ask her what she’s afraid of. Mine was afraid I’d end up where she did. When I said “I’m not where you were,” she stopped asking."}
 ]
};
var TAGS=['debt','rent','boundaries','in-laws','family-money','returning-to-work','newborn-sleep','siblings','first-salary','burnout'];
var KB=`<div class="kbd"><div class="kr0"><b>q</b><b>w</b><b>e</b><b>r</b><b>t</b><b>y</b><b>u</b><b>i</b><b>o</b><b>p</b></div><div class="kr1"><b>a</b><b>s</b><b>d</b><b>f</b><b>g</b><b>h</b><b>j</b><b>k</b><b>l</b></div><div class="kr2"><b>z</b><b>x</b><b>c</b><b>v</b><b>b</b><b>n</b><b>m</b></div><div class="kr3"><b class="w">123</b><b class="sp">space</b><b class="w">return</b></div></div>`;
function fresh(){return {screen:'home',stack:[],joined:{},cid:'money',q:'q1',tab:'useful',saved:{},helped:{},query:'',onlyUn:false,
 askC:null,askTitle:'',askBody:'',askAnon:false,askTags:[],replyText:'',composing:false,kb:false,sheet:null,sheetC:null,toast:'',replyTo:null,returning:false,replied:false,posted:false,exTab:null};}
var S=fresh();
var dev=+P.get('dev')||390, ts=+P.get('ts')||1;
/* ---------- scenes ---------- */
var SC={
 A:[['a1','1 Home, no Circles yet'],['a2','2 Explore Circles'],['a3','3 Preview, not joined'],['a4','4 Joined'],['a5','5 Home, two joined']],
 B:[['b1','6 Home, your Circles'],['b2','7 Unanswered'],['b3','8 Search'],['b4','9 A Circle'],['b5','10 Switch Circle'],['b6','11 Question thread'],['b7','12 Ask, destination'],['b8','13 Pick destination']],
 C:[['c1','14 Explore, later'],['c2','15 Preview a stage'],['c3','16 Home, four Circles']],
 D:[['d1','17 Join to reply'],['d2','18 All your Circles'],['d3','19 Rooms (optional)']]
};
function go(n){
 S=fresh();var J=function(a){a.forEach(function(x){S.joined[x]=true})};
 switch(n){
  case 'a1':break;
  case 'a2':S.screen='explore';break;
  case 'a3':S.screen='circle';S.cid='money';break;
  case 'a4':S.screen='circle';S.cid='money';S.joined.money=true;S.sheet='joined';S.sheetC='money';break;
  case 'a5':J(['money','self']);break;
  case 'b1':J(['money','family','work']);S.returning=true;S.posted=true;break;
  case 'b2':J(['money','family','work']);S.returning=true;S.posted=true;S.tab='un';break;
  case 'b3':J(['money','family','work']);S.screen='search';S.query='boundaries';break;
  case 'b4':J(['money','family','work']);S.screen='circle';S.cid='money';break;
  case 'b5':J(['money','family','work']);S.screen='circle';S.cid='money';S.sheet='switch';break;
  case 'b6':J(['money','family','work']);S.screen='thread';S.q='q1';S.helped.r1=true;break;
  case 'b7':J(['money','family','work']);S.screen='ask';S.askC='money';S.askTitle="My mother keeps asking if I’m doing okay with money. How do I answer without lying or opening the whole thing?";S.askBody="She isn’t prying, she’s worried, and she’d offer money I don’t want to owe.";S.askTags=['family-money'];break;
  case 'b8':J(['money','family','work']);S.screen='ask';S.askC='money';S.askTitle="My mother keeps asking if I’m doing okay with money. How do I answer without lying or opening the whole thing?";S.sheet='dest';break;
  case 'c1':J(['money','family','work']);S.screen='explore';break;
  case 'c2':J(['money','family','work']);S.screen='circle';S.cid='care';break;
  case 'c3':J(['money','family','work','care']);S.returning=true;S.posted=true;break;
  case 'd1':J(['family']);S.screen='thread';S.q='q1';S.composing=false;break;
  case 'd2':J(['money','family','work','care']);S.screen='mine';break;
  case 'd3':J(['money','family','work']);S.screen='rooms';break;
 }
 S.scene=n;render();
}
/* ---------- helpers ---------- */
function nJ(){return Object.keys(S.joined).filter(function(k){return S.joined[k]})}
function tabs(){return `<div class="tabs">`+['Today','Atlas','Ask Elara','Explore','Circles'].map(function(t){return `<span class="${t==='Circles'?'on':''}"><em></em>${t}</span>`}).join('')+`</div>`}
function topbar(title,right){return `<div class="topbar"><button class="bk" data-a="back" aria-label="Back">${I.back}</button><div class="tt">${title}</div>${right||''}</div>`}
function circTag(c){var k=CI(c);return `<span class="dot" style="--c:${k.c}"></span>${k.name}`}
function qrow(id,opts){
 var q=Q[id],k=CI(q.c),un=q.n===0;
 return `<div class="qrow" data-a="open" data-q="${id}"><div class="tag">${circTag(q.c)} · ${W[q.by][0]} · ${q.ago}</div><h3>${q.title}</h3>`+
  (q.sn?`<div class="sn">${q.sn}</div>`:'')+
  `<div class="meta">${un?`<span class="need">Unanswered. Be the first to reply</span>`:`<span>${q.n} replies</span>`}<span style="margin-left:auto" data-a="save" data-q="${id}">${S.saved[id]?I.saved:I.save}</span></div></div>`;
}
function listFor(tab,only){
 var ids=Object.keys(Q).filter(function(id){return !only||S.joined[Q[id].c]});
 if(only&&nJ().length===0)ids=[];
 if(tab==='un')ids=ids.filter(function(id){return Q[id].n===0});
 else if(tab==='useful')ids=ids.filter(function(id){return Q[id].n>0&&id!=='qs'});
 else ids=ids.slice().sort(function(a,b){return agoN(Q[a].ago)-agoN(Q[b].ago)});
 return ids;
}
function agoN(s){var m=s.match(/(\d+)\s*(hour|day)/);return m?(+m[1])*(m[2]==='hour'?1:24):0}
function jbtn(id){var j=S.joined[id];return `<button class="jbtn ${j?'on':''}" data-a="join" data-c="${id}">${j?'Joined':'Join'}</button>`}
function crow(k,extra){return `<div class="crow" data-a="circle" data-c="${k.id}"><span class="sw" style="background:${k.c}"></span><div class="tx"><b>${k.name}</b><span>${k.one}</span><em>${k.act}${extra||''}</em></div>${jbtn(k.id)}</div>`}
function groups(onlyUnjoined,withBtn){
 var h='';
 [['area','Life areas','What you care about'],['stage','Life stages','What you’re going through']].forEach(function(g){
  var rows=C.filter(function(c){return c.g===g[0]&&(!onlyUnjoined||!S.joined[c.id])});
  if(!rows.length)return;
  h+=`<div class="grp"><div class="gh"><b>${g[1]}</b><span>${g[2]}</span></div>`+rows.map(function(k){return withBtn?crow(k):`<span class="chipc" data-a="circle" data-c="${k.id}"><span class="dot" style="--c:${k.c}"></span>${k.name} ${I.plus}</span>`}).join(withBtn?'':'')+`</div>`;
 });
 return h;
}
function chipsGroups(){
 var h='';
 [['area','Life areas'],['stage','Life stages']].forEach(function(g){
  var rows=C.filter(function(c){return c.g===g[0]&&!S.joined[c.id]});
  if(!rows.length)return;
  h+=`<div class="grp"><div class="gh"><b>${g[1]}</b></div><div class="chiprow">`+rows.map(function(k){return `<span class="chipc" data-a="circle" data-c="${k.id}"><span class="dot" style="--c:${k.c}"></span>${k.name}</span>`}).join('')+`</div></div>`;
 });
 return h;
}
/* ---------- screens ---------- */
function masthead(){return `<div class="mast2"><h1>Circles</h1><span class="ibtn" data-a="search" aria-label="Search">${I.search}</span><button class="askpill" data-a="ask">${I.plus} Ask</button></div>`}
function searchfield(){return `<div class="searchf" data-a="search">${I.search}<span>Search Circles and questions</span></div>`}
function cmp(){return dev===320||ts>1}
function yourCircles(){
 var j=nJ();
 if(!j.length)return `<div class="empty"><b style="font:600 var(--s17) Fraunces,serif">Your Circles</b><span>${cmp()?'Join Circles that fit your life. Browsing is open; your Circles are private.':'You haven’t joined a Circle yet. Join the ones that fit what you care about or what you’re going through. Browsing is open, and your Circles are private to you.'}</span><button class="btn" data-a="explore">Explore Circles</button></div>`;
 var show=j.slice(0,dev===320||ts>1?3:4),more=j.length-show.length;
 return `<div class="hd"><h2>Your Circles</h2><a class="linkb" data-a="mine">${j.length>4?'All '+j.length+' ›':'Manage ›'}</a></div><div class="chiprow">`+
  show.map(function(id){var k=CI(id),unx=Object.keys(Q).filter(function(q){return Q[q].c===id&&Q[q].n===0&&q!=='qs'}).length;return `<span class="chipc" data-a="circle" data-c="${id}"><span class="dot" style="--c:${k.c}"></span>${k.name}${unx?`<i class="un" title="${unx} unanswered"></i>`:''}</span>`}).join('')+
  (more>0?`<span class="chipc" data-a="mine">+${more} more</span>`:'')+`<span class="chipc add" data-a="explore">${I.plus} Explore Circles</span></div>`+(cmp()?'':`<span class="mut" style="font-size:var(--s12);display:flex;gap:6px;align-items:center"><i style="width:7px;height:7px;border-radius:50%;background:var(--ember);display:inline-block"></i>has unanswered questions</span>`);
}
function home(){
 var j=nJ(),has=j.length>0;
 var tabsRow=has?`<div class="seg3">${[['useful','Useful'],['new','New'],['un','Unanswered']].map(function(t){return `<span class="${S.tab===t[0]?'on':''}" data-a="tab" data-t="${t[0]}">${t[1]}</span>`}).join('')}</div>`:'';
 var ids=has?listFor(S.tab,true):listFor('useful',false).slice(0,3);
 var hd=has?`<div class="hd"><h2>${cmp()?'From your Circles':'Questions in your Circles'}</h2></div>`:`<div class="hd"><h2>Worth reading</h2>${cmp()?'':'<span class="mut" style="font-size:var(--s12)">from across Circles</span>'}</div>`;
 var rows=ids.length?ids.slice(0,has?(dev===320||ts>1?3:4):3).map(function(i){return qrow(i)}).join(''):`<p class="mut" style="font-size:var(--s13);padding:6px 0">Nothing unanswered right now in your Circles. Browse another Circle to help someone.</p>`;
 var ban=(S.returning&&S.posted)?`<div class="banner" data-a="open" data-q="qs"><span class="dot" style="--c:#B8441A;margin-top:6px"></span><span><b>Valeria</b> ${cmp()?'replied to your question':'and 1 other replied to your question in Money Clarity'} ${I.chev}</span></div>`:'';
 var more=has?`<a class="linkb" data-a="circles-q">See all questions in your Circles ›</a>`:`<a class="linkb" data-a="explore">Browse all Circles ›</a>`;
 var ex=`<div class="hd" id="explore"><h2>Explore Circles</h2><a class="linkb" data-a="explore">See all ›</a></div>`+chipsGroups();
 var rm=`<div class="roomrow" data-a="rooms" style="padding:10px 12px"><span class="sechd">Optional</span><b style="font:600 var(--s15) Fraunces,serif">Small private rooms</b><span class="mut" style="font-size:var(--s12)">A room is a private group of up to ten women. Separate from Circles. ${I.chev}</span></div>`;
 return `<div class="scr">${masthead()}${cmp()?'':searchfield()}${yourCircles()}${ban}${hd}${tabsRow}<div>${rows}</div>${more}${ex}${rm}<div class="endmark">That’s the end of this list. Discover more in Explore Circles.</div></div>${tabs()}`;
}
function explore(){
 return topbar('Explore Circles','')+`<div class="scr">${searchfield()}<p class="mut" style="font-size:var(--s13)">Browse before you join. Join as many as you like. Your Circles are private to you.</p>${groups(false,true)}`+
  `<div class="grp"><div class="gh"><b>Narrower interests</b><span>Tags, until there’s a Circle</span></div><div class="chiprow">${TAGS.map(function(t){return `<span class="tagc" data-a="tag" data-t="${t}">#${t}</span>`}).join('')}</div><span class="mut" style="font-size:var(--s12)">A tag becomes its own Circle when enough women are talking about it.</span></div>`+
  `<div class="roomrow" data-a="rooms"><span class="sechd">Optional</span><b style="font:600 var(--s15) Fraunces,serif">Small private rooms</b><span class="mut" style="font-size:var(--s12)">Different from Circles: private, up to ten women who keep meeting. ${I.chev}</span></div></div>${tabs()}`;
}
function circle(){
 var k=CI(S.cid),j=S.joined[k.id];
 var tabsRow=`<div class="seg3">${[['new','New'],['un','Unanswered'],['useful','Helpful']].map(function(t){return `<span class="${(S.ctab||'new')===t[0]?'on':''}" data-a="ctab" data-t="${t[0]}">${t[1]}</span>`}).join('')}</div>`;
 var all=Object.keys(Q).filter(function(id){return Q[id].c===k.id&&id!=='qs'||id==='qs'&&k.id==='money'&&S.posted});
 var ct=S.ctab||'new';
 var ids=ct==='un'?all.filter(function(i){return Q[i].n===0}):ct==='useful'?all.filter(function(i){return Q[i].n>0}):all.slice().sort(function(a,b){return agoN(Q[a].ago)-agoN(Q[b].ago)});
 var rows=ids.map(function(i){return qrow(i)}).join('')||`<p class="mut" style="padding:10px 0;font-size:var(--s13)">No questions here yet. Be the first to ask.</p>`;
 var right=j?`<span class="chipc" data-a="switch" style="margin-left:auto">${I.down} Switch</span>`:'';
 var join=j?`<div class="rowb"><button class="jbtn on" data-a="join" data-c="${k.id}">${I.check} Joined</button><span class="mut" style="font-size:var(--s12)">In Your Circles</span></div>`:`<div class="rowb"><button class="btn sm" data-a="join" data-c="${k.id}">Join ${k.name}</button><span class="mut" style="font-size:var(--s12)">${k.act}</span></div>`;
 var note=!j?`<div class="banner" style="cursor:default"><span>${I.people}</span><span>You’re browsing. Join to get these questions in Your Circles, and to ask or reply here.</span></div>`:'';
 var tg=`<div class="rowb">${k.tags.map(function(t){return `<span class="tagc" data-a="tag" data-t="${t}">#${t}</span>`}).join('')}</div>`;
 return topbar(k.g==='area'?'Life area':'Life stage',right)+`<div class="scr" style="padding-bottom:80px"><div class="ctop" style="background:${k.tint}"><div class="eyebrow2">${k.g==='area'?'Life area':'Life stage'}</div><h1>${k.name}</h1><p>${k.one}</p>${join}</div>${note}${tg}${tabsRow}<div>${rows}</div><div class="roomrow" data-a="rooms" style="padding:10px 12px"><span class="sechd">Optional</span><b style="font:600 var(--s15) Fraunces,serif">Small private rooms in ${k.name}</b><span class="mut" style="font-size:var(--s12)">Private, up to ten women. ${I.chev}</span></div></div><div class="fab"><button class="btn" data-a="${j?'ask':'join'}" data-c="${k.id}" style="width:auto">${j?I.plus+(dev===320?' Ask':' Ask in '+k.name):'Join to ask'}</button></div>${tabs()}`;
}
function replyHTML(r){
 var isNew=r.nw&&S.returning;
 return `<div class="reply ${r.asker?'asker':''}${isNew?' newr':''}"><header>${av(r.by,'sm')}<div><div class="n">${W[r.by][0]}${r.asker?' <span class="mut" style="font-weight:400">· the asker</span>':''}</div>${r.ctx?`<div class="c">${r.ctx}</div>`:''}</div><button class="mn" aria-label="Options">${I.dots}</button></header><p class="t">${r.t}</p><div class="ra"><span class="act ${S.helped[r.id]?'on':''}" data-a="help" data-r="${r.id}">${S.helped[r.id]?I.leafon:I.leaf} This helped me</span><span class="act" data-a="replyto" data-r="${r.id}">${I.reply} Reply</span></div></div>`;
}
function thread(){
 var q=Q[S.q],k=CI(q.c),j=S.joined[q.c],isMine=S.q==='qs';
 if(S.composing){return topbar('Reply','')+`<div class="scr"><div class="paperc" style="gap:6px"><div class="eyebrow2">Replying in ${k.name}</div><div style="font:600 var(--s15)/1.3 Fraunces,serif;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${q.title}</div></div><div class="field focus"><label>Your reply</label><textarea id="replyTa" rows="${dev===320?4:5}" placeholder="Share what worked for you…">${esc(S.replyText)}</textarea><div style="font-size:var(--s12);color:var(--mut);display:flex;gap:6px;align-items:center">${I.people}Seen by women in Elara Circles, with your first name</div></div></div><div class="dock"><div style="display:flex;gap:8px"><button class="btn ghost" data-a="cancelreply" style="flex:1">Cancel</button><button class="btn" data-a="sendreply" style="flex:2">Send reply</button></div></div>${S.kb?KB:''}`}
 var reps=(REP[S.q]||[]);var html='',div=false;
 reps.forEach(function(r){if(r.nw&&S.returning&&!div){div=true;html+=`<div class="newdiv" id="newdiv">New since you were here</div>`}html+=replyHTML(r)});
 var body=(q.body||[]).map(function(p){return `<p>${p}</p>`}).join('');
 var bar=j?`<div class="replybar"><div class="fakein" data-a="compose">Write a reply…</div><div class="au">${I.people}Seen by women in Elara Circles, with your first name</div></div>`:`<div class="dock2"><button class="btn" data-a="join" data-c="${k.id}" data-then="reply">Join ${k.name} to reply</button><span class="mut" style="font-size:var(--s12);text-align:center">Joining is one tap and private to you.</span></div>`;
 return topbar(k.name,`<button class="mn" aria-label="Options">${I.dots}</button>`)+`<div class="scr"><div class="qbody"><div class="byline">${av(q.by,'sm')}<b>${isMine?'You':W[q.by][0]}</b><span class="mut">· ${q.ago}</span></div><span class="aud">${I.people}<b>Seen by women in Elara Circles</b><em>· listed in ${k.name}</em></span><h1>${q.title}</h1>${body}<div class="rowb">${q.tags.map(function(t){return `<span class="tagc">#${t}</span>`}).join('')}</div></div><div class="acts"><span class="act ${S.saved[S.q]?'on':''}" data-a="save" data-q="${S.q}">${S.saved[S.q]?I.saved:I.save} ${S.saved[S.q]?'Saved':'Save'}</span></div><div class="sechd">${q.n} replies</div>${html||''}${S.replied?replyHTML({id:'rs',by:'S',ctx:'You',t:S.replyText}):''}</div>${bar}`;
}
function ask(){
 var k=S.askC?CI(S.askC):null,ok=S.askTitle.trim().length>=12&&k;
 var dest=k?`<div class="destcard" data-a="pickdest"><span class="dot" style="--c:${k.c};width:12px;height:12px"></span><div class="tx"><small>Posting in</small><b>${k.name}</b></div><span class="mut" style="font-size:var(--s12)">Change ${I.down}</span></div>`:`<div class="destcard warnc" data-a="pickdest"><div class="tx"><small>Where should it go?</small><b>Choose a Circle</b></div><span class="mut" style="font-size:var(--s12)">Required ${I.chev}</span></div>`;
 var aud=k?`<div class="audbox" style="border:1px solid var(--hair);background:var(--paper);padding:9px 11px;display:grid;gap:4px;font-size:var(--s13)"><span style="display:flex;gap:6px;align-items:flex-start">${I.people}<span><b>Who can see this:</b> women in Elara Circles. It appears in <b>${k.name}</b> and in search${S.askAnon?', without your name':', with your first name'}.</span></span></div>`:'';
 var compact=S.kb&&(dev===320||ts>1);
 var tg=compact?'':`<div class="sechd">Tags (optional)</div><div class="chiprow">${(k?k.tags:[]).concat(['boundaries']).filter(function(v,i,a){return a.indexOf(v)===i}).slice(0,4).map(function(t){return `<span class="pill ${S.askTags.indexOf(t)>-1?'on':''}" data-a="atag" data-t="${t}">#${t}</span>`}).join('')}</div>`;
 var priv=compact?'':`<div class="paperc"><div style="display:flex;gap:8px;align-items:flex-start">${I.lock}<span style="font-size:var(--s13)"><b>Stays private:</b> your Ask Elara chats, Clarity answers and Path notes. Nothing from them is posted unless you choose a line yourself.</span></div></div>`;
 var anon=compact?'':`<div class="opt ${S.askAnon?'on':''}" data-a="anon"><span class="bx"></span><span>Ask without my name <span class="mut">(Elara’s team can still see who posted if it’s reported)</span></span></div>`;
 return topbar('Ask a question','')+`<div class="scr">${dest}<div class="field ${S.kb?'focus':''}"><label>Your question</label><textarea id="askTitle" rows="${compact?3:3}" style="font:600 var(--s17)/1.3 Fraunces,serif" placeholder="One question, in your own words" maxlength="160">${esc(S.askTitle)}</textarea><div class="cnt">${S.askTitle.length}/160</div></div>${compact?'':`<div class="field"><label>More detail (optional)</label><textarea id="askBody" rows="3" placeholder="What have you tried? What would help most?">${esc(S.askBody)}</textarea></div>`}${aud}${anon}${tg}${priv}</div><div class="dock"><button class="btn" id="postBtn" data-a="post" ${ok?'':'disabled style="opacity:.5"'}>${k?'Post in '+k.name:'Choose a Circle to post'}</button></div>${S.kb?KB:''}`;
}
function search(){
 var q=S.query.trim().toLowerCase();
 var cs=q?C.filter(function(c){return c.name.toLowerCase().indexOf(q)>-1||c.one.toLowerCase().indexOf(q)>-1||c.tags.some(function(t){return t.indexOf(q)>-1})}):[];
 var qs=q?Object.keys(Q).filter(function(id){var o=Q[id];return (o.title.toLowerCase().indexOf(q)>-1||o.tags.some(function(t){return t.indexOf(q)>-1}))&&(!S.onlyUn||o.n===0)}):[];
 var tg=q?TAGS.filter(function(t){return t.indexOf(q)>-1}):[];
 var body='';
 if(!q)body=`<p class="mut" style="font-size:var(--s13)">Search Circle names, questions and tags.</p><div class="sechd">Try</div><div class="chiprow">${['boundaries','rent','newborn-sleep','siblings'].map(function(t){return `<span class="tagc" data-a="tag" data-t="${t}">#${t}</span>`}).join('')}</div>`;
 else body=`<div class="sres">${cs.length?`<h4>Circles</h4>`+cs.map(function(k){return crow(k)}).join(''):''}${tg.length?`<h4>Tags</h4><div class="chiprow">${tg.map(function(t){return `<span class="tagc">#${t}</span>`}).join('')}</div>`:''}<h4>Questions${S.onlyUn?' · unanswered':''}</h4>${qs.length?qs.slice(0,dev===320||ts>1?3:4).map(function(i){return qrow(i)}).join(''):`<p class="mut" style="font-size:var(--s13);padding:6px 0">No questions match. Try a tag, or ask it yourself.</p>`}</div>`;
 return topbar('Search','')+`<div class="scr"><div class="searchf">${I.search}<input id="qin" value="${esc(S.query)}" placeholder="Search Circles and questions"></div><div class="chiprow"><span class="pill ${S.onlyUn?'on':''}" data-a="onlyun">Unanswered only</span><span class="pill">All Circles</span></div>${body}</div>${S.kb?KB:''}`;
}
function mine(){
 var j=nJ();
 return topbar('Your Circles','')+`<div class="scr"><p class="mut" style="font-size:var(--s13)">Only you see this list. Questions from these Circles appear on your Circles home.</p>`+
  j.map(function(id){var k=CI(id),un=Object.keys(Q).filter(function(q){return Q[q].c===id&&Q[q].n===0&&q!=='qs'}).length;return `<div class="crow" data-a="circle" data-c="${id}"><span class="sw" style="background:${k.c}"></span><div class="tx"><b>${k.name}</b><span>${k.g==='area'?'Life area':'Life stage'} · ${un?un+' unanswered':'nothing unanswered'}</span></div><span class="mut">${I.chev}</span></div>`}).join('')+
  `<button class="btn ghost" data-a="explore">Explore more Circles</button><span class="mut" style="font-size:var(--s12)">You can leave a Circle any time. Questions you asked stay where you asked them.</span></div>${tabs()}`;
}
function rooms(){
 return topbar('Small private rooms','')+`<div class="scr"><div class="paperc"><div class="eyebrow2">Optional</div><b style="font:600 var(--s20) Fraunces,serif">A room is not a Circle</b><span style="font-size:var(--s13);line-height:1.45">A Circle is an open topic community. A room is a private group of up to ten women who keep meeting, with a weekly question from Elara. You don’t need a room to use Circles.</span></div><div class="sechd">Rooms with seats open</div>`+
  [['Sunday Money Talks','Money Clarity','Private · 6 women','4 seats open','Active this week'],['Late Nights, New Baby','Pregnancy & New Parenthood','Private · 8 women','2 seats open','Active today']].map(function(r){return `<div class="roomrow" style="cursor:default"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font:600 var(--s15) Fraunces,serif">${r[0]}</b><span class="aud">${I.lock}<b>${r[2]}</b></span></div><span class="mut" style="font-size:var(--s12)">${r[1]} · ${r[3]} · ${r[4]}</span><button class="btn sm ghost" style="width:auto;align-self:start">Preview room</button></div>`}).join('')+
  `<span class="mut" style="font-size:var(--s13)">Or ask for a match: we’ll suggest a room that fits your Circles. Nothing joins until you say yes.</span></div>${tabs()}`;
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function overlays(){
 var o='';
 if(S.sheet==='joined'){var k=CI(S.sheetC);o=`<div class="dim" data-a="closesheet"></div><div class="sheet"><i class="grab"></i><h3>You joined ${k.name}</h3><p>Its questions now appear in Your Circles. Your Circles are private to you; nobody else sees which ones you’ve joined.</p><button class="btn" data-a="explore">Join another Circle</button><button class="btn ghost" data-a="gohome">See Your Circles</button><span class="mut" style="font-size:var(--s12);text-align:center">Join as many as you like. You can leave any time.</span></div>`}
 if(S.sheet==='switch'){o=`<div class="dim" data-a="closesheet"></div><div class="sheet"><i class="grab"></i><h3>Switch Circle</h3>`+nJ().map(function(id){var k=CI(id);return `<div class="crow" data-a="circle" data-c="${id}"><span class="sw" style="background:${k.c}"></span><div class="tx"><b>${k.name}</b><span>${k.g==='area'?'Life area':'Life stage'}</span></div>${id===S.cid?I.check:''}</div>`}).join('')+`<button class="btn ghost" data-a="explore">Explore Circles</button></div>`}
 if(S.sheet==='dest'){o=`<div class="dim" data-a="closesheet"></div><div class="sheet"><i class="grab"></i><h3>Where should this go?</h3><p class="mut">It will be listed in this Circle and show up in search.</p><div class="sechd">Your Circles</div>`+nJ().map(function(id){var k=CI(id);return `<div class="crow" data-a="pickc" data-c="${id}"><span class="sw" style="background:${k.c}"></span><div class="tx"><b>${k.name}</b><span>${k.g==='area'?'Life area':'Life stage'}</span></div>${S.askC===id?I.check:''}</div>`}).join('')+`<div class="sechd">Other Circles (join to post)</div>`+C.filter(function(c){return !S.joined[c.id]}).slice(0,3).map(function(k){return `<div class="crow" data-a="pickc" data-c="${k.id}"><span class="sw" style="background:${k.c}"></span><div class="tx"><b>${k.name}</b><span>${k.g==='area'?'Life area':'Life stage'} · joins when you post</span></div></div>`}).join('')+`</div>`}
 if(S.toast)o+=`<div class="toast">${S.toast}</div>`;
 return o;
}
var NOTES={
 a1:['1 · Home, no Circles yet','The first screen is useful without a post or a join: “Worth reading” shows real questions from across Circles. Your Circles is an invitation, not an empty box. The date and the large ask box are gone; Ask is a compact pill.',['Does she read a question before she joins anything?','Is “Explore Circles” easy to find, with Life areas and Life stages visibly separate?']],
 a2:['2 · Explore Circles','Two groups, named plainly: Life areas (what you care about) and Life stages (what you’re going through). Each row says what it is for and how active it is. Narrower interests are tags, not Circles.',['Do women understand the two groups without help?','Do they browse first, or tap Join straight away?']],
 a3:['3 · Browse before joining','A Circle can be read before she joins. A quiet banner says what joining gives her. Ask changes to “Join to ask”.',['Does the preview answer “is this for me?”','Do sample questions matter more than the purpose line?']],
 a4:['4 · Joined','One tap, a plain confirmation, and a promise: Your Circles are private to you. The next step is another Circle or home.',['Does she believe her Circles are private?','Does “Join another” feel inviting or pushy?']],
 a5:['5 · Home with two Circles','Your Circles leads. Useful questions from only those Circles follow. Unanswered counts are words, not red badges.',['Is it clear why these questions are here?','Does she still find Explore easily?']],
 b1:['6 · Home, your Circles','A returning woman: her Circles first, then useful questions from them with the best reply shown, and a slim line when someone has replied to her. Explore stays on the page with Life areas and Life stages separated.',['Does the first screen show useful content without a post?','Do replies to her stand out without becoming a task list?']],
 b2:['7 · Unanswered','Unanswered is one tap on Home. It turns reading into replying for women who aren’t ready to ask.',['Do women reply from here, or does it feel like homework?']],
 b3:['8 · Search','Search covers Circle names, questions and tags, grouped. “Unanswered only” filters the questions.',['Does she find an earlier question quickly?','Do tags help or add noise?']],
 b4:['9 · A Circle (joined)','Name, purpose, tags, and the ways to browse. “Switch” moves between her Circles without going home. Rooms are one slim, optional row.',['Can she tell which Circle she is in at a glance?']],
 b5:['10 · Switch Circle','With several Circles joined, a switcher keeps navigation clear. It lists only hers, then Explore.',['Is “Switch” discoverable?']],
 b6:['11 · Question thread','Every question names its Circle. Replies, “This helped me” (private to the author) and one reply action. The audience is stated in the question and the reply bar.',['Does she know who will read her reply?']],
 b7:['12 · Ask, destination clear','The composer opens with “Posting in” at the top. The audience says where the question will appear and that it shows in search. Tags are optional. Private Ask Elara and Clarity content stays private.',['Do women check the destination?','Do they choose “without my name”?']],
 b8:['13 · Pick destination','Her joined Circles first, then others she could join by posting. She must choose; there is no default she might miss.',['Do women pick the right Circle or the first one?']],
 c1:['14 · Explore, later','A returning woman sees what she has joined as “Joined” and what she hasn’t as “Join”. Life stages like Caregiving are right there.',['Does she notice a Circle that fits a new situation?']],
 c2:['15 · Preview a stage','Caregiving: not joined, readable, with a plain “Join to ask” action. A newer Circle says “Just starting” honestly.',['Does “Just starting” encourage or discourage?']],
 c3:['16 · Home, four Circles','After joining Caregiving, it appears in Your Circles. With four or more, the list shows three plus “+N more”, and “All” opens the full list.',['Can she find a question she read yesterday?']],
 d1:['17 · Join to reply','She can read a Circle she hasn’t joined. To reply, one tap joins it, then the composer opens.',['Does “join to reply” stop a woman who wanted to reply once?']],
 d2:['18 · All your Circles','Her whole list, private to her, with words not badges. Leave any time.',['Do women expect to see other women’s Circles?']],
 d3:['19 · Rooms (optional)','Rooms are deliberately secondary and named differently. The first line says a room is not a Circle. She never needs one to use Circles.',['Do women confuse Circle and room?']]
};
function render(){
 var app=document.getElementById('app'),h='';
 var m={home:home,explore:explore,circle:circle,thread:thread,ask:ask,search:search,mine:mine,rooms:rooms};
 h=(m[S.screen]||home)();
 app.innerHTML=h+overlays();
 var ph=document.getElementById('phone');ph.className='phone d'+dev;ph.style.width=dev+'px';ph.style.height=(dev===320?568:844)+'px';ph.style.setProperty('--ts',ts);
 document.getElementById('phonecol').className='phonecol'+(P.get('full')?' full':'');
 var nt=NOTES[S.scene]||NOTES.a1;
 document.getElementById('notes').innerHTML=`<h2>${nt[0]}</h2><p>${nt[1]}</p><h3>Look for</h3><ul>${nt[2].map(function(x){return `<li>${x}</li>`}).join('')}</ul>`;
 [].forEach.call(document.querySelectorAll('#chrome .chip[data-sc]'),function(c){c.setAttribute('aria-current',c.dataset.sc===S.scene?'true':'false')});
 [].forEach.call(document.querySelectorAll('#devseg button'),function(b){b.setAttribute('aria-pressed',String(+b.dataset.dev===dev))});
 [].forEach.call(document.querySelectorAll('#tsseg button'),function(b){b.setAttribute('aria-pressed',String(+b.dataset.ts===ts))});
 if(P.get('chrome')==='0'){var wrap=document.querySelector('.wrap');[].forEach.call(wrap.children,function(c){if(c.className.indexOf('stagewrap')<0)c.style.display='none'});document.getElementById('notes').style.display='none';document.querySelector('.stagewrap').style.display='block';document.body.style.background='transparent';wrap.style.padding='0'}
}
function nav(s,x){S.stack.push({screen:S.screen,cid:S.cid,q:S.q});S.screen=s;if(x)for(var k in x)S[k]=x[k];S.sheet=null;S.kb=false;S.composing=false;S.scene=null;render();var sc=document.querySelector('#app .scr');if(sc)sc.scrollTop=0}
function toast(t){S.toast=t;render();setTimeout(function(){S.toast='';render()},1900)}
document.addEventListener('click',function(e){
 var el=e.target.closest('[data-a]');if(!el)return;var a=el.dataset.a;
 if(a==='save'){e.stopPropagation();S.saved[el.dataset.q]=!S.saved[el.dataset.q];render();return}
 if(a==='open'){nav('thread',{q:el.dataset.q});return}
 if(a==='back'){var p=S.stack.pop();if(p){S.screen=p.screen;S.cid=p.cid;S.q=p.q}else S.screen='home';S.sheet=null;S.kb=false;S.composing=false;S.scene=null;render();return}
 if(a==='circle'){S.sheet=null;nav('circle',{cid:el.dataset.c,ctab:'new'});return}
 if(a==='explore'){S.sheet=null;nav('explore');return}
 if(a==='search'){nav('search',{query:S.query});return}
 if(a==='mine'){nav('mine');return}
 if(a==='rooms'){nav('rooms');return}
 if(a==='circles-q'){nav('search',{query:''});return}
 if(a==='gohome'){S.stack=[];S.screen='home';S.sheet=null;S.scene=null;render();return}
 if(a==='tab'){S.tab=el.dataset.t;S.scene=null;render();return}
 if(a==='ctab'){S.ctab=el.dataset.t;S.scene=null;render();return}
 if(a==='join'){var id=el.dataset.c;if(S.joined[id]){S.joined[id]=false;toast('Left '+CI(id).name+'. You can rejoin any time.');return}S.joined[id]=true;if(el.dataset.then==='reply'){S.composing=true;S.kb=true;render();return}S.sheet='joined';S.sheetC=id;S.scene=null;render();return}
 if(a==='switch'){S.sheet='switch';render();return}
 if(a==='closesheet'){S.sheet=null;render();return}
 if(a==='ask'){var c=el.dataset.c||(S.screen==='circle'?S.cid:null);nav('ask',{askC:c&&S.joined[c]?c:(S.askC&&S.joined[S.askC]?S.askC:null)});return}
 if(a==='pickdest'){S.sheet='dest';render();return}
 if(a==='pickc'){var cc=el.dataset.c;S.askC=cc;S.sheet=null;render();return}
 if(a==='anon'){S.askAnon=!S.askAnon;render();return}
 if(a==='atag'){var t=el.dataset.t,i=S.askTags.indexOf(t);if(i>-1)S.askTags.splice(i,1);else if(S.askTags.length<2)S.askTags.push(t);render();return}
 if(a==='tag'){nav('search',{query:el.dataset.t});return}
 if(a==='onlyun'){S.onlyUn=!S.onlyUn;render();var q=document.getElementById('qin');if(q)q.focus();return}
 if(a==='post'){if(S.askTitle.trim().length<12||!S.askC)return;S.joined[S.askC]=true;S.posted=true;Q.qs.title=S.askTitle;Q.qs.body=S.askBody?[S.askBody]:[];Q.qs.c=S.askC;Q.qs.ago='just now';Q.qs.n=0;Q.qs.tags=S.askTags.length?S.askTags.slice():[];S.stack=[];S.screen='thread';S.q='qs';S.kb=false;toast('Posted in '+CI(S.askC).name+'. We’ll tell you once a day when someone replies.');return}
 if(a==='compose'||a==='replyto'){S.composing=true;S.kb=true;render();var ta=document.getElementById('replyTa');if(ta)ta.focus();return}
 if(a==='cancelreply'){S.composing=false;S.kb=false;render();return}
 if(a==='sendreply'){if(S.replyText.length<8)return;S.replied=true;S.composing=false;S.kb=false;toast('Sent. We’ll tell you once a day if someone writes back.');return}
 if(a==='help'){S.helped[el.dataset.r]=!S.helped[el.dataset.r];render();return}
});
document.addEventListener('input',function(e){
 var t=e.target;
 if(t.id==='qin'){S.query=t.value;var pos=t.selectionStart;render();var n=document.getElementById('qin');n.focus();n.setSelectionRange(pos,pos)}
 if(t.id==='askTitle'){S.askTitle=t.value;var b=document.getElementById('postBtn');var ok=t.value.trim().length>=12&&S.askC;b.disabled=!ok;b.style.opacity=ok?1:.5}
 if(t.id==='askBody')S.askBody=t.value;
 if(t.id==='replyTa')S.replyText=t.value;
});
document.addEventListener('focusin',function(e){var id=e.target.id;if((id==='askTitle'||id==='askBody'||id==='qin')&&!S.kb){S.kb=true;render();var el=document.getElementById(id);if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}}});
['A','B','C','D'].forEach(function(g){document.getElementById('sc'+g).innerHTML=SC[g].map(function(s){return `<button class="chip" data-sc="${s[0]}">${s[1]}</button>`}).join('')});
document.getElementById('chrome').addEventListener('click',function(e){var b=e.target.closest('[data-sc]');if(b)go(b.dataset.sc)});
document.getElementById('devseg').addEventListener('click',function(e){var b=e.target.closest('[data-dev]');if(b){dev=+b.dataset.dev;render()}});
document.getElementById('tsseg').addEventListener('click',function(e){var b=e.target.closest('[data-ts]');if(b){ts=+b.dataset.ts;render()}});
document.getElementById('reset').addEventListener('click',function(){go('a1')});
go(P.get('scene')||'a1');
})();
</script>
