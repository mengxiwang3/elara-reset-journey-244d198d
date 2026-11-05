p = 'body.html'; t = open(p).read()
def rep(x, y, cnt=1):
    global t
    assert t.count(x) == cnt, (x[:70], t.count(x)); t = t.replace(x, y)

# ---- copy (proposals) ----
rep('      weekT: "Tu semana en tu hilo", twoT: "Tus dos semanas"',
'''      weekT: "Tu semana en tu hilo", twoT: "Tus dos semanas",
      inst5: "Ideas pensadas para lo que buscabas.", inst6: "Tu otra forma",
      inst: [["Un té o una ducha caliente, sin prisa", "Una llamada con alguien que quiero", "Acostarme temprano"],
             ["Mirar mi saldo cinco minutos, sin juzgarme", "Ordenar una cosa pequeña de mi casa", "Planear mañana en tres líneas"],
             ["Algo que disfruto y es gratis: música, una serie, un paseo", "Un gusto pequeño que ya tenía planeado", "Contarle a alguien lo que logré"],
             ["Una caminata sin el celular", "Respirar tres veces antes de decidir", "Escribir lo que me tiene tensa"],
             ["Una llamada con alguien que quiero", "Un plan juntas que no cueste dinero", "Escribirle a una amiga"]],
      fuT: "Antes de seguir",
      fu12q: "El día 11 planeaste un gasto a propósito: {d11.plan|lower}. ¿Cómo te fue?",
      fu12r: ["Lo planeaste y pasó. Así se ve elegir a propósito.", "A medias también cuenta: notaste dónde se movió el plan.", "No llegó el momento. El plan sigue sirviendo para otra semana.", "Pasa. Ya sabes cómo planearlo cuando quieras."],
      fu14q: "El día 13 encontraste tus palabras: «Puedo {d13.words#1}». ¿Pudiste usarlas?",
      fu14o: ["Sí, las dije", "Todavía no"],
      fu14r: ["Las dijiste. Eso cuenta, salga como salga.", "Todavía no también cuenta: ya tienes las palabras.", "Está bien. Tus palabras siguen aquí para cuando quieras."],
      safeL: "Me siento presionada o amenazada por dinero",
      safeT: "Podemos dejarlo como un ensayo privado. Si hay amenazas o te sientes en peligro, abre Ayuda.",
      helpBtn: "Abrir Ayuda", endHere: "Terminar el día aquí", close: "Cerrar",
      helpBody: "En la app, aquí se abriría la ruta de ayuda y contacto. En este prototipo no está conectada: esta frase solo puede usarse cuando Codedale conecte esa ruta y se pruebe."''')
rep('      weekT: "Your week in your thread", twoT: "Your two weeks"',
'''      weekT: "Your week in your thread", twoT: "Your two weeks",
      inst5: "Ideas chosen for what you were reaching for.", inst6: "Your other way",
      inst: [["Tea or a warm shower, unhurried", "A call with someone I love", "An early night in bed"],
             ["Look at my balance for five minutes, without judging", "Tidy one small thing at home", "Plan tomorrow in three lines"],
             ["Something I enjoy that's free: music, a show, a walk", "A small treat I'd already planned", "Tell someone what I got done"],
             ["A walk without my phone", "Three breaths before deciding", "Write down what's making me tense"],
             ["A call with someone I love", "A plan together that doesn't cost money", "Message a friend"]],
      fuT: "Before you go on",
      fu12q: "On day 11 you planned a spend on purpose: {d11.plan|lower}. How did it go?",
      fu12r: ["You planned it and it happened. That's what choosing on purpose looks like.", "Halfway counts too: you noticed where the plan shifted.", "The moment didn't come. The plan still works for another week.", "That happens. You know how to plan it whenever you want."],
      fu14q: "On day 13 you found your words: “I can {d13.words#1}.” Did you get to use them?",
      fu14o: ["Yes, I said them", "Not yet"],
      fu14r: ["You said them. That counts, however it went.", "Not yet counts too: you already have the words.", "That's okay. Your words are here whenever you want them."],
      safeL: "I feel pressured or threatened about money",
      safeT: "We can keep this as a private rehearsal. If there are threats or you feel in danger, open Help.",
      helpBtn: "Open Help", endHere: "End the day here", close: "Close",
      helpBody: "In the app, this would open the help and contact route. It isn't connected in this prototype: this line can only be used once Codedale wires that route and it's tested."''')

# ---- 4. day 5: alternatives that fit the need ----
rep('''    var c = stepCopy(n, id), cf = cfg(n, id), list = [];''',
'''    var c = stepCopy(n, id), cf = cfg(n, id), list = [];
    if (S.layers && n === 5 && id === "instead") { var rr = (S.ans[5] || {}).reaching; if (rr && rr.k != null && PP().inst[rr.k]) return PP().inst[rr.k].slice(); }''')

# ---- 3. day 10: her own sentence joins the sort ----
rep('''  function prefill(n, id, c, cf) {''',
'''  function sortList(n, id) {
    var c = stepCopy(n, id), out = [];
    if (S.layers && n === 10 && id === "still") { var s = val(10, "sentence"); if (s) out.push({ key: "own", t: "«" + String(s).replace(/^[“"«]|[”"»]$/g, "") + "»", own: true }); }
    c.items.forEach(function (x, j) { out.push({ key: String(j), t: x }); });
    return out;
  }
  function prefill(n, id, c, cf) {''')
rep('''      h += '<div class="opts">' + c.items.map(function (t, j) { var off = n === 1 && id === "hands" && S.layers && m[j] != null && m[j] !== (j === 0 || j === 2 ? 0 : 1); return '<div class="sortrow' + (off ? " off" : "") + '"><p class="st">' + esc(t) + '</p><div class="sb">' + c.columns.map(function (col, ci) { return '<button type="button" data-act="sort" data-k="' + j + '" data-c="' + ci + '" aria-pressed="' + (m[j] === ci) + '">' + esc(col) + "</button>"; }).join("") + "</div></div>"; }).join("") + "</div>";''',
'''      h += '<div class="opts">' + sortList(n, id).map(function (it) { var j = it.key, off = n === 1 && id === "hands" && S.layers && m[j] != null && m[j] !== (j === "0" || j === "2" ? 0 : 1); return '<div class="sortrow' + (off ? " off" : "") + '"><p class="st">' + (it.own ? '<ins class="p">' + esc(it.t) + "</ins>" + tag() : esc(it.t)) + '</p><div class="sb">' + c.columns.map(function (col, ci) { return '<button type="button" data-act="sort" data-k="' + j + '" data-c="' + ci + '" aria-pressed="' + (m[j] === ci) + '">' + esc(col) + "</button>"; }).join("") + "</div></div>"; }).join("") + "</div>";''')
rep('''if (k === "sort") { var c = stepCopy(n, id); return Object.keys(v.m || {}).length === c.items.length; }''',
'''if (k === "sort") return sortList(n, id).every(function (it) { return v.m && v.m[it.key] != null; });''')
rep('''if (sm) Object.keys(sm).forEach(function (i) { if (sm[i] === 1) no.push(stepCopy(10, "still").items[i].replace(/\\.$/, "")); });''',
'''if (sm) Object.keys(sm).forEach(function (i) { if (sm[i] === 1) no.push(i === "own" ? "«" + String(main).replace(/^[“"«]|[”"»]$/g, "") + "»" : stepCopy(10, "still").items[i].replace(/\\.$/, "")); });''')

# ---- 1. day 14: only say she's letting go if she marked her sentence as no longer hers ----
rep('''    if (c.prefill) return T(c.prefill, c.prefillFallback, n) || "";''',
'''    if (c.prefill) {
      if (S.layers && n === 14) { var sm = val(10, "still", 14); if (!(sm && sm.own === 1)) return T(c.prefillFallback, null, n) || ""; }
      return T(c.prefill, c.prefillFallback, n) || "";
    }''')

# ---- 2. day 7: the three fixed rules don't claim to be built from her days ----
rep('''var on = v && v.k === j && v.ext == null, sb = subs[j] ? T(subs[j], null, n) : null;''',
'''var on = v && v.k === j && v.ext == null, sb = subs[j] && !(S.layers && n === 7 && id === "rule") ? T(subs[j], null, n) : null;''')

# ---- 4b. day 6 brings back her day-5 alternative; 5. follow-ups on days 12 and 14 ----
rep('''      h += '<div class="rec">' + (cf.recall || []).map(''', '''      var rec6 = "";
      if (S.layers && n === 6) { var ins = val(5, "instead", 6); if (ins) rec6 = '<div class="recitem"><span class="label">' + esc(p.inst6) + " · " + u.day + " 5" + tag() + '</span><span class="rv">«' + esc(ins) + "»</span></div>"; }
      h += '<div class="rec">' + (cf.recall || []).map(''')
rep('''u.noRecall + "</span>") + "</span></div>"; }).join("") + "</div>";''', '''u.noRecall + "</span>") + "</span></div>"; }).join("") + rec6 + "</div>";''')
rep('''      if (open) h += '<div class="yday"><p class="label">' + p.from.trim() + tag() + '</p><p class="voice">' + esc(open) + "</p></div>";''',
'''      if (open) h += '<div class="yday"><p class="label">' + p.from.trim() + tag() + '</p><p class="voice">' + esc(open) + "</p></div>";
      var fu = followUp(n);
      if (fu) h += '<div class="layer"><p class="lt">' + esc(p.fuT) + tag() + "</p><p>" + esc(fu.q) + '</p><div class="chips">' + fu.o.map(function (t, j) { return '<button type="button" class="chipbtn' + (a._fu === j ? " on" : "") + '" data-act="fu" data-k="' + j + '" aria-pressed="' + (a._fu === j) + '">' + esc(t) + "</button>"; }).join("") + "</div>" + (a._fu != null ? "<p>" + esc(fu.r[a._fu]) + "</p>" : "") + "</div>";''')
rep('''  function sortList(n, id) {''', '''  function followUp(n) {
    var p = PP();
    if (n === 12) { var q = T(p.fu12q, null, 12); return q ? { q: q, o: C(2).steps.followup.options, r: p.fu12r } : null; }
    if (n === 14) { var q2 = T(p.fu14q, null, 14); return q2 ? { q: q2, o: p.fu14o.concat([C(13).steps.when.options[2]]), r: p.fu14r } : null; }
    return null;
  }
  function sortList(n, id) {''')

# day 5 hint that the alternatives fit
rep('''      var rec = (n === 3 && id === "pause" && S.layers) ? fitPause() : -1;''',
'''      var rec = (n === 3 && id === "pause" && S.layers) ? fitPause() : -1;
      if (S.layers && n === 5 && id === "instead" && (S.ans[5] || {}).reaching && S.ans[5].reaching.k != null) h += '<p class="hint"><ins class="p">' + esc(p.inst5) + "</ins>" + tag() + "</p>";''')

# ---- 7. day 13: pressure or threats go to help, not to a rehearsal ----
rep('''      if (c.detailLabel && v && (v.k != null || v.other != null))''',
'''      if (S.layers && n === 13 && id === "who") {
        h += safeOpen ? '<div class="layer soft"><p class="lt">' + esc(p.safeL) + tag() + "</p><p>" + esc(p.safeT) + '</p><div class="row2b"><button type="button" class="btn" data-act="help">' + esc(p.helpBtn) + '</button></div><button type="button" class="link u" data-act="endnow"><span>' + esc(p.endHere) + "</span></button></div>"
          : '<button type="button" class="link u" data-act="safe"><span>' + esc(p.safeL) + "</span></button>" + tag();
      }
      if (c.detailLabel && v && (v.k != null || v.other != null))''')
rep('''  var lastScreen = "";''', '''  var lastScreen = "", safeOpen = false, helpOpen = false;''')
rep('''      (optional && !ok ? '<button type="button" class="skip" data-act="skip" style="align-self:center">' + esc(c.skipLabel || u.skip) + "</button>" : "") + "</div></div>";''',
'''      (optional && !ok ? '<button type="button" class="skip" data-act="skip" style="align-self:center">' + esc(c.skipLabel || u.skip) + "</button>" : "") + "</div>" +
      (helpOpen ? '<button type="button" class="ovl" data-act="closehelp" aria-label="' + esc(PP().close) + '"></button><div class="bsheet" role="dialog"><span class="grab"></span><p class="h2">' + esc(PP().helpBtn) + '</p><p class="voice">' + esc(PP().helpBody) + tag() + '</p><button type="button" class="btn" data-act="closehelp">' + esc(PP().close) + "</button></div>" : "") + "</div>";''')
rep('''      case "clearpad":''', '''      case "fu": a._fu = a._fu === +b.dataset.k ? null : +b.dataset.k; break;
      case "safe": safeOpen = true; break;
      case "help": helpOpen = true; break;
      case "closehelp": helpOpen = false; break;
      case "endnow": safeOpen = false; helpOpen = false; S.view = "end"; break;
      case "clearpad":''')
rep('''      case "start": if''', '''      case "start": safeOpen = false; if''')

# ---- 8. day 2: «nada me sorprendió» skips «¿Qué te sorprendió de eso?» ----
rep('''  function advance() { var list = steps(S.sday); if (S.si < list.length - 1) S.si++; else S.view = "end"; }''',
'''  function advance() {
    var list = steps(S.sday), a = A(S.sday), st = list[S.si];
    if (S.sday === 2 && st.id === "surprised") {
      var v = a.surprised, L = optsFor(2, "surprised");
      if (S.layers && v && v.k === L.length - 1) { a.why = { skip: true, auto: true }; S.si += 2; return; }
      if (a.why && a.why.auto) delete a.why;
    }
    if (S.si < list.length - 1) S.si++; else S.view = "end";
  }''')
rep('''      case "back": if (S.si > 0) S.si--; break;''', '''      case "back": if (S.si > 0) S.si--; if (S.si > 0 && (a[list[S.si].id] || {}).auto) S.si--; break;''')

# ---- 6. «La idea de hoy» only where it adds something new ----
rep('''      var idea = p.idea[n], it = typeof idea === "string" ? '<ins class="p">' + esc(idea) + "</ins>" + tag() : esc(idea.a);
      h += '<div class="layer mt10"><p class="lt">' + p.ideaT + (typeof idea === "string" ? "" : tag()) + "</p><p>" + it + "</p></div>";''',
'''      var idea = p.idea[n];
      if (typeof idea === "string") h += '<div class="layer mt10"><p class="lt">' + p.ideaT + tag() + '</p><p><ins class="p">' + esc(idea) + "</ins></p></div>";''')

# ---- WHY cards ----
rep('''Al cerrar cada día, <b>La idea de hoy</b>: una sola frase. En ocho días es una frase de Elara ya aprobada; en seis (1, 3, 8, 11, 12 y 14) es nueva.''',
'''En seis días (1, 3, 8, 11, 12 y 14), al cerrar, <b>La idea de hoy</b>: una sola frase nueva. En los otros ocho no se añade, porque repetiría una frase de Elara que ella ya leyó ese día.''')
rep('''At each day\\'s close, <b>Today\\'s idea</b>: one sentence. On eight days it\\'s an approved Elara line; on six (1, 3, 8, 11, 12 and 14) it\\'s new.''',
'''On six days (1, 3, 8, 11, 12 and 14), at the close, <b>Today\\'s idea</b>: one new sentence. The other eight don\\'t get one, because it would repeat an Elara line she already read that day.''')
rep('''<li>Día 7: además de las tres reglas aprobadas, una hecha con su día 3 y otra con su límite.</li></ul></div>''',
'''<li>Día 7: además de las tres reglas aprobadas, una hecha con su día 3 y otra con su límite. Las tres aprobadas ya no dicen «Hecha con tu día…», porque son iguales para todas.</li><li>Día 5: las alternativas cambian según lo que buscaba (consuelo, control, recompensa, alivio o pertenencia).</li></ul></div>''')
rep('''<li>Day 7: besides the three approved rules, one built from her day 3 and one from her boundary.</li></ul></div>''',
'''<li>Day 7: besides the three approved rules, one built from her day 3 and one from her boundary. The three approved rules no longer say “Built from your Day…”, since they\\'re the same for everyone.</li><li>Day 5: the alternatives change with what she was reaching for (comfort, control, reward, relief or belonging).</li></ul></div>''')
rep('''<li>Día 5: «Tu par» une lo que buscaba con otra forma de cubrirlo.</li></ul></div>''',
'''<li>Día 5: «Tu par» une lo que buscaba con otra forma de cubrirlo.</li><li>Día 2: si nada la sorprendió, no se le pregunta «¿Qué te sorprendió de eso?».</li><li>Día 10: su propia frase entra en «Todavía es mía / Ya no es mía».</li><li>Día 14: el borrador solo dice «Estoy soltando la frase anterior» si el día 10 la marcó como «Ya no es mía».</li><li>Día 13: «Me siento presionada o amenazada por dinero» lleva a Ayuda y permite terminar el día, sin ensayar ni guardar nada.</li></ul></div>''')
rep('''<li>Day 5: “Your pair” links what she was reaching for with another way to meet it.</li></ul></div>''',
'''<li>Day 5: “Your pair” links what she was reaching for with another way to meet it.</li><li>Day 2: if nothing surprised her, she isn\\'t asked “What surprised you about it?”.</li><li>Day 10: her own sentence joins “Still mine / No longer mine”.</li><li>Day 14: the draft only says “I\\'m letting go of the old sentence” if on day 10 she marked it “No longer mine”.</li><li>Day 13: “I feel pressured or threatened about money” leads to Help and lets her end the day, with no rehearsal and nothing saved.</li></ul></div>''')
rep('''<li>Los días 5, 10 y 13, que no tenían una referencia a días anteriores, abren con una.</li>''',
'''<li>Los días 5, 10 y 13, que no tenían una referencia a días anteriores, abren con una.</li><li>Lo que no se revisaba ahora vuelve: el día 6 trae su alternativa del día 5; el día 12 pregunta por el gasto planeado el día 11; el día 14, por la conversación del día 13. «No pasó» es una respuesta completa.</li>''')
rep('''<li>Days 5, 10 and 13, which had no link to earlier days, open with one.</li>''',
'''<li>Days 5, 10 and 13, which had no link to earlier days, open with one.</li><li>What was never revisited now comes back: day 6 brings her day-5 alternative; day 12 asks about the spend planned on day 11; day 14, about the day-13 conversation. “It didn\\'t happen” is a full answer.</li>''')
rep('''<li>Las frases nuevas: seis ideas del día, nombres de las piezas del hilo, las respuestas según su elección y las aperturas de los días 5, 10 y 13.</li>''',
'''<li>Las frases nuevas: seis ideas del día, nombres de las piezas del hilo, las respuestas según su elección, las alternativas del día 5, las preguntas de seguimiento y las aperturas de los días 5, 10 y 13.</li><li>Día 13: la ruta de Ayuda tiene que existir y probarse antes de usar «abre Ayuda».</li><li>Si alguna semana debería mirar un número real (por ejemplo, un monto aproximado opcional el día 2). Hoy no lo hace ninguno de los 14 días.</li>''')
rep('''<li>The new lines: six day ideas, the thread\\'s piece names, the choice-based replies and the openings on days 5, 10 and 13.</li>''',
'''<li>The new lines: six day ideas, the thread\\'s piece names, the choice-based replies, the day-5 alternatives, the follow-up questions and the openings on days 5, 10 and 13.</li><li>Day 13: the Help route has to exist and be tested before “open Help” is used.</li><li>Whether any week should look at a real number (for example, an optional rough amount on day 2). None of the 14 days does today.</li>''')

open(p, 'w').write(t)
open('app/index.html', 'w').write(t.replace('/*VENTANA_CSS*/', open('ventana.css').read()))
print("ok")
