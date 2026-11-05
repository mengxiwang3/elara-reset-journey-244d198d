/* English for the review: interface strings only. Lesson content comes from the English V4.1 (data-en.js). */
(function () {
  var D = window.I18N_EN_DICT || {};
  var PLACE = { "La orilla": "The riverbank", "El banco junto al agua": "The bench by the water", "El puente": "The bridge", "El río, desde el agua": "The river, from the water", "La calle del mercado": "The market street", "La entrada al bambú": "The edge of the bamboo forest", "El mirador": "The lookout" };
  var PLACE_LOW = { "la orilla": "the riverbank", "banco junto al agua": "the bench by the water", "puente": "the bridge", "río, desde el agua": "the river, from the water", "la calle del mercado": "the market street", "la entrada al bambú": "the edge of the bamboo forest", "mirador": "the lookout" };
  var SKILL = { "saber si un dinero llega antes de que venza un pago": "tell whether money arrives before a payment is due", "ponerle un para qué y un para cuándo a un dinero": "give money a what-for and a by-when", "pedir tiempo antes de comprometer dinero": "ask for time before committing money", "ver qué baja de verdad cuando pagas una deuda": "see what really goes down when you pay a debt", "leer las tres líneas de un estado de cuenta": "read the three lines of a statement", "comparar precios con la misma cantidad": "compare prices for the same amount", "parar y comprobar una oferta antes de enviar dinero": "stop and check an offer before sending money", "volver a lo que te sirvió esta semana": "come back to what helped you this week" };
  var PS = { "un imprevisto": "an unexpected expense", "un pago que viene": "a payment that's coming", "algo más adelante": "something further ahead", "algo que todavía no sé": "something I don't know yet" };
  var WS = { "en unas semanas": "in a few weeks", "en unos meses": "in a few months", "dentro de varios años": "in several years", "todavía no lo sé": "I don't know yet" };
  var XS = { "debería estar disponible por si lo necesito de repente": "it should be available in case I need it suddenly", "puede esperar sin que lo toque": "it can wait without me touching it" };
  var R = [
    [/^Dinero y estabilidad · Día (\d+) de 7$/, function (m) { return "Money and stability · Day " + m[1] + " of 7"; }],
    [/^Día (\d+) de 7$/, function (m) { return "Day " + m[1] + " of 7"; }],
    [/^(\d+) de 3$/, function (m) { return m[1] + " of 3"; }],
    [/^Día (\d+)$/, function (m) { return "Day " + m[1]; }],
    [/^día (\d+)$/, function (m) { return "day " + m[1]; }],
    [/^Día (\d+) hecho$/, function (m) { return "Day " + m[1] + " done"; }],
    [/^pausa (\d) de 3$/, function (m) { return "pause " + m[1] + " of 3"; }],
    [/^Pausa (\d) de 3: (.+)$/, function (m) { return "Pause " + m[1] + " of 3: " + (tr0(m[2]) || m[2]); }],
    [/^Pausa (\d)$/, function (m) { return "Pause " + m[1]; }],
    [/^Empezar el día (\d+)$/, function (m) { return "Start day " + m[1]; }],
    [/^Seguir con el día (\d+)$/, function (m) { return "Continue day " + m[1]; }],
    [/^Releer el día (\d+)$/, function (m) { return "Reread day " + m[1]; }],
    [/^Empezar en el día (\d+), con los días anteriores hechos y sin guardar nada$/, function (m) { return "Start at day " + m[1] + ", with the earlier days done and nothing saved"; }],
    [/^Llega el día (\d+)\.$/, function (m) { return "Arrives on day " + m[1] + "."; }],
    [/^Tu tema llega el día (\d+)\.$/, function (m) { return "Your topic arrives on day " + m[1] + "."; }],
    [/^Tu día (\d+) te espera\. No se pierde nada\.$/, function (m) { return "Your day " + m[1] + " is waiting. Nothing is lost."; }],
    [/^Te llevaste el día (\d+)$/, function (m) { return "You kept this on day " + m[1]; }],
    [/^Pantalla: (.+)$/, function (m) { return "Screen: " + (tr0(m[1]) || m[1]); }],
    [/^(.+?): ([\s\S]+?)\.?\. Abrir Tus días en Atlas$/, function (m) { return (tr0(m[1]) || m[1]) + ": " + m[2] + ". Open Your days in Atlas"; }],
    [/^Tu semana: (.+)$/, function (m) { return "Your week: " + (tr0(m[1]) || m[1]); }],
    [/^Tu tema de esta semana: ninguno$/, function () { return "Your topic this week: none"; }],
    [/^Tu tema de esta semana: (.+)$/, function (m) { return "Your topic this week: " + (tr0(m[1]) || m[1]); }],
    [/^Tu próximo paso: (.+)$/, function (m) { return "Your next step: " + (tr0(m[1]) || m[1]); }],
    [/^Día (\d+) ·$/, function (m) { return "Day " + m[1] + " ·"; }],
    [/^Día (\d+) hecho$/, function (m) { return "Day " + m[1] + " done"; }],
    [/^(\d+) · (.+)$/, function (m) { var x = tr0(m[2]); return x == null ? null : m[1] + " · " + x; }],
    [/^Cierre del día (\d+) si eligió «([\s\S]+)»$/, function (m) { return "Day " + m[1] + " close if she chose “" + m[2] + "”"; }],
    [/^(?:Tu tema llega el día \d+\.\s*)+$/, function (m) { return m[0].replace(/Tu tema llega el día (\d+)\./g, "Your topic arrives on day $1.").trim(); }],
    [/^[−+\-]?\s?US\$[\d.,]+$/, function (m) { return m[0]; }],
    [/^Llegaste (?:a |al )(.+)\.$/, function (m) { return "You arrived at " + (PLACE_LOW[m[1]] || m[1]) + "."; }],
    [/^Mañana: ([\s\S]+)$/, function (m) { return "Tomorrow: " + m[1]; }],
    [/^Regla: ([\s\S]+)$/, function (m) { return "Rule: " + m[1]; }],
    [/^Hoy practicaste cómo (.+)\.$/, function (m) { return SKILL[m[1]] ? "Today you practiced how to " + SKILL[m[1]] + "." : null; }],
    [/^Hoy viste cómo (.+)\.$/, function (m) { return SKILL[m[1]] ? "Today you saw how to " + SKILL[m[1]] + "." : null; }],
    [/^Disponible US\$(\d+)$/, function (m) { return "Available US$" + m[1]; }],
    [/^Faltan US\$(\d+)$/, function (m) { return "Short US$" + m[1]; }],
    [/^Debes US\$(\d+)$/, function (m) { return "You owe US$" + m[1]; }],
    [/^Llega el cobro · \+US\$(\d+)$/, function (m) { return "Your pay arrives · +US$" + m[1]; }],
    [/^El día (\d+)$/, function (m) { return "Day " + m[1]; }],
    [/^El día 10 faltan US\$(\d+)\. El cobro llega el día (\d+), después de la luz\. Es un desfase de fechas: un dinero que todavía no llegó no cuenta como disponible\.$/, function (m) { return "On day 10 you're US$" + m[1] + " short. Your pay arrives on day " + m[2] + ", after the electricity bill. That's a timing gap: money that hasn't arrived yet doesn't count as available."; }],
    [/^Con el cobro el día (\d+), la luz queda cubierta\. Es el mismo dinero: lo que cambió fue la fecha\.$/, function (m) { return "With your pay on day " + m[1] + ", the electricity bill is covered. It's the same money: what changed was the date."; }],
    [/^El cobro llega a tiempo, pero aun así faltan US\$(\d+)\. Eso es un faltante total: cambiar la fecha no lo resuelve\.$/, function (m) { return "Your pay arrives on time, but you're still US$" + m[1] + " short. That's a total shortfall: changing the date doesn't fix it."; }],
    [/^Aunque el cobro llegara a tiempo, faltarían US\$(\d+): eso es un faltante total, y cambiar la fecha no lo resuelve\. Además llega después de la luz, así que también hay un desfase de fechas\. Pueden pasar las dos cosas a la vez\.$/, function (m) { return "Even if your pay arrived on time, you'd be US$" + m[1] + " short: that's a total shortfall, and changing the date doesn't fix it. It also arrives after the electricity bill, so there's a timing gap too. Both can happen at once."; }],
    [/^Querría este dinero para (.+), lo necesitaría (.+) y (.+)\.$/, function (m) { return PS[m[1]] && WS[m[2]] && XS[m[3]] ? "I'd want this money for " + PS[m[1]] + ", I'd need it " + WS[m[2]] + ", and " + XS[m[3]] + "." : null; }],
    [/^«([\s\S]+)» llega el día (\d+)\.(.*)$/, null],
    [/^Nota de prueba del día (\d+)$/, function (m) { return "Test note for day " + m[1]; }]
  ];
  function topicsLine(t) {
    // «Topic» llega el día N. [«Topic» llega el día M.] La semana sigue el mismo orden…
    var out = t.replace(/«([^»]+)» llega el día (\d+)\./g, function (_, a, d) { return "“" + (D[a] || a) + "” arrives on day " + d + "."; });
    out = out.replace("La semana sigue el mismo orden, porque cada día se apoya en el anterior.", "The week keeps the same order, because each day builds on the one before.");
    return out !== t ? out : null;
  }
  function tr0(t) {
    if (D[t] != null) return D[t];
    if (PLACE[t]) return PLACE[t];
    if (/» llega el día \d+\./.test(t)) return topicsLine(t);
    for (var i = 0; i < R.length; i++) { if (!R[i][1]) continue; var m = t.match(R[i][0]); if (m) { var r = R[i][1](m); if (r != null) return r; } }
    var q = t.match(/^«([\s\S]+)»$/); if (q) { var x = tr0(q[1]); return "“" + (x == null ? q[1] : x) + "”"; }
    if (t.indexOf(" · ") > 0) {
      var parts = t.split(" · "), outp = [];
      for (var j = 0; j < parts.length; j++) { var y = tr0(parts[j]); if (y == null) return null; outp.push(y); }
      return outp.join(" · ");
    }
    return null;
  }
  function money(s) { return s.replace(/US\$(\d+),(\d\d)/g, "US$$$1.$2").replace(/(\d+),(\d\d) por kilo/g, "$1.$2 per kilo").replace(/ por kilo\b/g, " per kilo"); }
  window.trEN = function (s) {
    if (s == null) return s;
    var t = String(s).trim(); if (!t) return s;
    var lead = String(s).match(/^\s*/)[0], trail = String(s).match(/\s*$/)[0];
    var r = tr0(t);
    return lead + money(r == null ? t : r) + trail;
  };
  window.trEN_raw = tr0;
})();
