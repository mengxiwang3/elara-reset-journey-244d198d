p = 'body.html'; t = open(p).read()
def rep(x, y, cnt=1):
    global t
    assert t.count(x) == cnt, (x[:70], t.count(x)); t = t.replace(x, y)

# ---- copy (proposals) ----
rep('      weekT: "Tu semana en tu hilo", twoT: "Tus dos semanas",',
'''      weekT: "Tu semana en tu hilo", twoT: "Tus dos semanas",
      willT: "Esta semana vas a aprender a…", learnedT: "Lo que aprendiste esta semana", preT: "Antes de empezar",
      out: { 1: [[1, "Separar lo que puedes cambiar de lo que no"], [3, "Encontrar el momento en que gastas en automático y ponerle una pausa"], [4, "Poner un límite pequeño que puedas cumplir"], [7, "Escribir una regla propia para los días pesados"]],
             2: [[9, "Decidir para qué quieres que sirva tu dinero"], [10, "Reconocer una frase heredada sobre el dinero y decidir si sigue siendo tuya"], [11, "Planear un gasto a propósito"], [13, "Encontrar palabras para un sí o un no sobre dinero"]] },
      wkLen: "Siete días, unos minutos cada uno. Puedes saltar cualquier pregunta.",
      topicQ: "¿Qué te gustaría entender mejor?", topicSub: "Elige hasta dos. Te decimos qué día llega cada uno. El orden de los días no cambia.",
      topics: [[1, "Entender qué me pesa con el dinero"], [2, "Saber a dónde se va mi dinero"], [3, "Dejar de gastar en automático"], [4, "Ponerme límites que pueda cumplir"], [5, "Entender por qué gasto cuando me siento mal"], [9, "Decidir para qué es mi dinero"], [13, "Hablar de dinero con mi familia o mi pareja"]],
      notSure: "Todavía no sé", arrives: "Llega el día {n}.", yourTopic: "Tu tema", topicLine: "Tu tema «{t}» llega el día {n}.",
      startWeek: "Empezar la semana", later: "Saltar por ahora", seeLearn: "Seguir",
      learnedSeen: "Lo viste", learnedSkip: "Todavía no", topicBack: "Querías entender «{t}»: lo trabajaste el día {n}.",''')
rep('      weekT: "Your week in your thread", twoT: "Your two weeks",',
'''      weekT: "Your week in your thread", twoT: "Your two weeks",
      willT: "This week you'll learn to…", learnedT: "What you learned this week", preT: "Before you start",
      out: { 1: [[1, "Separate what you can change from what you can't"], [3, "Find the moment you spend on autopilot and put a pause there"], [4, "Set a small limit you can keep"], [7, "Write your own rule for heavy days"]],
             2: [[9, "Decide what you want your money to do"], [10, "Spot an inherited money sentence and decide if it's still yours"], [11, "Plan a spend on purpose"], [13, "Find words for a yes or no about money"]] },
      wkLen: "Seven days, a few minutes each. You can skip any question.",
      topicQ: "What would you like to understand better?", topicSub: "Pick up to two. We'll tell you which day each one arrives. The order of the days doesn't change.",
      topics: [[1, "Understand what weighs on me about money"], [2, "Know where my money goes"], [3, "Stop spending on autopilot"], [4, "Set limits I can keep"], [5, "Understand why I spend when I feel bad"], [9, "Decide what my money is for"], [13, "Talk about money with my family or partner"]],
      notSure: "I don't know yet", arrives: "Arrives on day {n}.", yourTopic: "Your topic", topicLine: "Your topic “{t}” arrives on day {n}.",
      startWeek: "Start the week", later: "Skip for now", seeLearn: "Continue",
      learnedSeen: "You saw it", learnedSkip: "Not yet", topicBack: "You wanted to understand “{t}”: you worked on it on day {n}.",''')

# ---- state ----
rep('day: 1, done: {}, saved: {}, ans: {}, view: "home", tab: 0, si: 0, rep: {}, cm: {} }; }',
    'day: 1, done: {}, saved: {}, ans: {}, view: "home", tab: 0, si: 0, rep: {}, cm: {}, pre: { step: 0, picked: [], done: false } }; }')
rep('  function fill(s, o) {', '''  function myTopics() { return S.layers && S.pre && S.pre.done ? S.pre.picked.filter(function (i) { return i >= 0; }).map(function (i) { return { i: i, d: PP().topics[i][0], t: PP().topics[i][1] }; }) : []; }
  function topicFor(n) { return myTopics().filter(function (x) { return x.d === n; })[0] || null; }
  function topicTag(n) { return topicFor(n) ? ' <span class="topictag">' + esc(PP().yourTopic) + "</span>" : ""; }
  function fill(s, o) {''')

# ---- before the week, and what each week teaches ----
rep('''    if (!done) {
      var started = S.view === "home" && S.si > 0 && S.sday === n;''',
'''    var p = PP();
    var outList = function (w) { return '<ul class="read sm" style="padding-left:20px;display:flex;flex-direction:column;gap:6px;margin-top:8px">' + p.out[w].map(function (o) { return "<li><ins class=\\"p\\">" + esc(o[1]) + "</ins></li>"; }).join("") + "</ul>"; };
    if (!done && n === 1 && S.layers && !S.pre.done && !(S.ans[1] && Object.keys(S.ans[1]).length)) {
      if (S.pre.step === 0) {
        body = '<p class="eyebrow">' + esc(eyebrowTxt(1)) + "</p>" + '<h1 class="title">' + esc(p.willT) + "</h1>" + tag() + outList(1) +
          '<p class="meta">' + ico("lock", 14) + "<span>" + esc(p.wkLen) + "</span></p>" +
          '<button type="button" class="btn mt14" data-act="preNext">' + esc(p.seeLearn) + ico("arrow", 20) + "</button>";
      } else {
        var pk = S.pre.picked;
        body = '<p class="eyebrow">' + esc(p.preT) + "</p>" + '<h1 class="title">' + esc(p.topicQ) + "</h1>" + tag() + '<p class="hint mt10">' + esc(p.topicSub) + "</p>" +
          '<div class="chips col mt10">' + p.topics.map(function (o, j) { var on = pk.indexOf(j) >= 0; return '<button type="button" class="chipbtn tall' + (on ? " on" : "") + '" data-act="prePick" data-k="' + j + '" aria-pressed="' + on + '"' + (!on && pk.filter(function (x) { return x >= 0; }).length >= 2 ? " disabled" : "") + "><span>" + esc(o[1]) + "</span><small>" + esc(fill(p.arrives, { n: o[0] })) + "</small></button>"; }).join("") +
          '<button type="button" class="chipbtn' + (pk.indexOf(-1) >= 0 ? " on" : "") + '" data-act="prePick" data-k="-1" aria-pressed="' + (pk.indexOf(-1) >= 0) + '">' + esc(p.notSure) + "</button></div>" +
          '<button type="button" class="btn mt14" data-act="preDone"' + (pk.length ? "" : " disabled") + ">" + esc(p.startWeek) + ico("arrow", 20) + "</button>" +
          '<button type="button" class="link u" data-act="preSkip" style="align-self:center"><span>' + esc(p.later) + "</span></button>";
      }
      return '<div class="home">' + hero(n) + '<div class="scroll"><div class="col"><div class="spacer">' + header(n) + '</div><section class="page2">' + body + "</section></div></div>" + tabs(0) + "</div>";
    }
    if (!done) {
      var started = S.view === "home" && S.si > 0 && S.sday === n;''')
rep('''      body = '<p class="eyebrow">' + esc(eyebrowTxt(n)) + "</p>" +
        '<h1 class="title">' + esc(c.title) + "</h1>" +''',
'''      body = '<p class="eyebrow">' + esc(eyebrowTxt(n)) + (S.layers ? topicTag(n) : "") + "</p>" +
        '<h1 class="title">' + esc(c.title) + "</h1>" +''')
rep('''        '<button type="button" class="btn mt14" data-act="start">' + (started ? u.resume : u.start) + n + ico("arrow", 20) + "</button>";''',
'''        (S.layers && n === 1 && !started && myTopics().length ? '<p class="meta">' + esc(myTopics().map(function (x) { return fill(p.topicLine, { t: x.t, n: x.d }); }).join(" ")) + tag() + "</p>" : "") +
        '<button type="button" class="btn mt14" data-act="start">' + (started ? u.resume : u.start) + n + ico("arrow", 20) + "</button>" +
        (S.layers && n === 8 && !started ? '<div class="layer mt14"><p class="lt">' + esc(p.willT) + tag() + "</p>" + outList(2) + "</div>" : "");''')

# ---- after each week: what she learned, with her own pieces ----
rep('''      if (n === 7 || n === 14) { var lst = ""; for (var d = n - 6; d <= n; d++) { var kk = d === n ? k : (S.saved[d] !== false ? knot(d) : null); if (kk) lst += "<li class=\\"on\\"><span class=\\"kd\\">" + d + '</span><span><span class="hl1">' + esc(kk.label) + '</span><br><span class="hl2">' + esc(kk.main) + "</span></span></li>"; } if (lst) h += '<p class="label mt14">' + (n === 7 ? p.weekT : p.twoT) + tag() + '</p><ul class="hilo mt10">' + lst + "</ul>"; }''',
'''      if (n === 7 || n === 14) {
        var lst = p.out[n === 7 ? 1 : 2].map(function (o) { var d = o[0], kk = d === n ? k : (S.saved[d] !== false ? knot(d) : null), did = d === n || S.done[d]; return '<li class="' + (did ? "on" : "") + '"><span class="kd">' + d + '</span><span><span class="hl2"><ins class="p">' + esc(o[1]) + '</ins></span><br><span class="hl3">' + (kk ? esc(kk.label) + ": " + esc(kk.main) : esc(did ? p.learnedSeen : p.learnedSkip)) + "</span></span></li>"; }).join("");
        h += '<p class="label mt14">' + esc(p.learnedT) + tag() + '</p><ul class="hilo mt10">' + lst + "</ul>";
        myTopics().filter(function (x) { return n === 7 ? x.d <= 7 : x.d > 7; }).forEach(function (x) { h += '<p class="hint"><ins class="p">' + esc(fill(p.topicBack, { t: x.t, n: x.d })) + "</ins></p>"; });
      }''')

# ---- your topic in the thread ----
rep('''rows += '<li class="' + (k ? "on" : "") + '"><span class="kd">' + d + '</span><span><span class="hl1">' + esc(p.knot[d]) + '</span>''',
'''rows += '<li class="' + (k ? "on" : "") + '"><span class="kd">' + d + '</span><span><span class="hl1">' + esc(p.knot[d]) + "</span>" + topicTag(d) + "''')

# ---- events ----
rep('''      case "start": safeOpen = false;''', '''      case "preNext": S.pre.step = 1; break;
      case "prePick": var pk = S.pre.picked, j2 = +b.dataset.k, ix2 = pk.indexOf(j2);
        if (ix2 >= 0) pk.splice(ix2, 1); else if (j2 === -1) S.pre.picked = [-1]; else { S.pre.picked = pk.filter(function (x) { return x >= 0; }); if (S.pre.picked.length < 2) S.pre.picked.push(j2); }
        break;
      case "preDone": S.pre.done = true; break;
      case "preSkip": S.pre.done = true; S.pre.picked = []; break;
      case "start": safeOpen = false;''')
rep('''    if (pa === "day") { var n = +b.dataset.n;''', '''    if (pa === "day") { var n = +b.dataset.n; if (n > 1) { S.pre.done = true; }''')
rep('''  try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); if (o && o.ans) S = Object.assign(fresh(), o); } } catch (e) {}''',
'''  try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); if (o && o.ans) S = Object.assign(fresh(), o); } } catch (e) {}
  if (!S.pre) S.pre = { step: 0, picked: [], done: false };''')

# ---- review cards ----
rep('''<div class="revcard"><h3>1 · Entender</h3><p>''',
'''<div class="revcard"><h3>0 · Antes y después de cada semana</h3><ul><li>Antes del día 1: «Esta semana vas a aprender a…» (cuatro resultados) y «¿Qué te gustaría entender mejor?» (hasta dos temas, o «Todavía no sé», o saltar). Cada tema dice qué día llega y ese día aparece como «Tu tema». El orden no cambia.</li><li>El día 8 muestra los cuatro resultados de la semana 2.</li><li>Los días 7 y 14 cierran con «Lo que aprendiste esta semana»: los mismos resultados, cada uno con la pieza que ella hizo, y el tema que eligió.</li></ul></div>' +
      '<div class="revcard"><h3>1 · Entender</h3><p>''')
rep('''<div class="revcard"><h3>1 · Understand</h3><p>''',
'''<div class="revcard"><h3>0 · Before and after each week</h3><ul><li>Before day 1: “This week you\\'ll learn to…” (four outcomes) and “What would you like to understand better?” (up to two topics, “I don\\'t know yet”, or skip). Each topic says which day it arrives, and that day is tagged “Your topic”. The order doesn\\'t change.</li><li>Day 8 shows week 2\\'s four outcomes.</li><li>Days 7 and 14 close with “What you learned this week”: the same outcomes, each with the piece she made, and the topic she chose.</li></ul></div>' +
      '<div class="revcard"><h3>1 · Understand</h3><p>''')

open(p, 'w').write(t)
open('app/index.html', 'w').write(t.replace('/*VENTANA_CSS*/', open('ventana.css').read()))
print("ok")
