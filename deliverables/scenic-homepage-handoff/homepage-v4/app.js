// Elara homepage: one connected practice. Everything is local and curated: nothing is sent, saved or generated,
// and nothing here is real app progress.
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const Stage = window.ElaraStage, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const el = (tag, props = {}, kids = []) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };

  // ---------------------------------------------------------------- Copy (es, en). Spanish is the default.
  const T = {
    'skip': ['Saltar al contenido', 'Skip to content'],
    'nav.you': ['Para ti', 'For you'], 'nav.circles': ['Círculos', 'Circles'], 'nav.us': ['Nosotras', 'About us'],
    'cta.short': ['Unirme a la lista', 'Join the list'], 'cta': ['Unirme a la lista de espera', 'Join the waitlist'],
    'h1.a': ['Una pregunta al día para dar', 'One question a day to take'], 'h1.b': ['tu siguiente paso.', 'your next step.'],
    'lead': ['Elige un destino, responde una pregunta sobre algo que estás viviendo y llévate una herramienta para usar en tu vida.', 'Choose a destination, answer one question about something you are living through, and leave with a tool you can use in your life.'],
    'pick': ['Elige un destino. Cada uno es un área de tu vida.', 'Choose a destination. Each one is an area of your life.'],
    'col.h': ['Lo que te llevas de esta visita', 'What you take from this visit'],
    'col.empty': ['Responde una pregunta arriba y guarda su recuerdo. Aparecerá aquí, junto a la frase que te llevas.', 'Answer a question above and keep its souvenir. It will appear here with the phrase you chose.'],
    'col.some': ['Toca un recuerdo guardado para volver a abrir lo que te llevaste.', 'Tap a kept souvenir to reopen what you took from it.'],
    'col.fine': ['Demostración: tus elecciones se recuerdan en este navegador durante tu visita. No se envían ni se guardan en una cuenta, y no cuentan como progreso en la app.', 'Demonstration: your choices are remembered in this browser during your visit. They are not sent or saved to an account, and they do not count as progress in the app.'],
    'hero.for': ['Para la mujer que sostiene todo, aunque nadie lo note.', 'For the woman who holds everything, even when no one notices.'],
    'reset': ['Empezar de nuevo', 'Start again'], 'reset.done': ['Listo, empezamos de nuevo.', 'Done, starting again.'],
    'week.h': ['Cada día empieza donde lo dejaste', 'Each day starts where the last one ended'], 'week.tag': ['Claridad financiera', 'Money Clarity'],
    'week.out': ['Al final de la semana: una regla sobre tu dinero que probaste y ajustaste a tu realidad.', 'At the end of the week: a rule about your money that you tried and adjusted to your reality.'],
    'week.y': ['Ayer te llevaste', 'Yesterday you took'], 'week.t': ['Hoy empiezas ahí', 'Today you start there'], 'week.tq': ['¿Qué pasó cuando lo probaste?', 'What happened when you tried it?'],
    'you.h1': ['Para la mujer que sostiene todo,', 'For the woman who holds everything,'], 'you.h2': ['aunque nadie lo note.', 'even when no one notices.'],
    'you.p': ['Elara te ayuda a ver dónde estás, qué está pidiendo atención y cuál es el siguiente paso pequeño. Cada destino es una pausa corta para mirar una situación como estas y salir con algo que puedas usar ese mismo día.', 'Elara helps you see where you are, what is asking for attention, and your next small step. Each destination is a short pause to look at a situation like these and leave with something you can use that same day.'],
    'you.1': ['Te piden dinero y todavía no sabes cuánto puedes dar.', 'Someone asks you for money and you do not yet know how much you can give.'],
    'you.2': ['Resuelves todo para todos, y casi nadie te pregunta cómo estás.', 'You solve things for everyone and almost no one asks how you are.'],
    'you.3': ['Quieres poner un límite sin pelearte con nadie.', 'You want to set a limit without a fight.'],
    'you.4': ['Por fuera, todo en orden. Por dentro, no sabes qué quieres ahora.', 'Fine on the outside; inside, unsure what you want next.'],
    'es.h': ['No es inglés, traducido. Es español, entendido.', 'Not English, translated. Spanish, understood.'],
    'es.p': ['El peso de ser la hija mayor, la familia que llama, los dos mundos que habitas. También está disponible en inglés.', 'The weight of being the eldest daughter, the family that calls, the two worlds you live in. Also available in English.'],
    'sv.h': ['Construido con ellas, no para ellas.', 'Built with them, not for them.'],
    'sv.p': ['Más de 4600 mujeres respondieron nuestra encuesta; casi 1 de cada 3 eligió el dinero como lo primero que resolvería. Por eso la práctica de arriba empieza ahí.', 'More than 4,600 women answered our survey; almost 1 in 3 chose money as the first thing they would fix. That is why the practice above starts there.'],
    'us.r1': ['Producto y diseño', 'Product and design'], 'us.r2': ['Creadora y comunidad', 'Creator and community'],
    'us.line': ['Hecho por dos mujeres que también lo necesitaban.', 'Made by two women who needed it too.'], 'us.link': ['Conoce a Mengxi y Alejandra', 'Meet Mengxi and Alejandra'],
    'circ.h': ['Círculos: tu pregunta puede abrir una conversación.', 'Circles: your question can open a conversation.'],
    'circ.p': ['Elige un tema que estés viviendo, lee o pregunta. Tú decides cuándo participar.', 'Pick a topic you are living through, read or ask. You decide when to take part.'],
    'circ.replay': ['Ver de nuevo', 'Play again'],
    'circ.fine': ['Demostración: los perfiles y mensajes son ilustrativos. No son personas reales ni conversaciones en vivo.', 'Demonstration: the profiles and messages are illustrative. These are not real people or live conversations.'],
    'circ.noreply': ['Aquí no puedes responder: es una demostración.', 'You cannot reply here: this is a demonstration.'],
        'circ.open': ['Abrir la conversación', 'Open the conversation'], 'circ.close': ['Cerrar la conversación', 'Close the conversation'],
    'circ.count': ['1 respuesta', '1 reply'], 'circ.pause': ['Pausar', 'Pause'], 'circ.resume': ['Continuar', 'Continue'],
    'topic.ciudad': ['Una nueva ciudad', 'A new city'], 'topic.uni': ['Vida universitaria', 'University life'], 'topic.mama': ['Soy mamá', 'I am a mum'], 'topic.amigas': ['Amistades adultas', 'Adult friendships'],
    'exp.h': ['Explorar: para los días que piden un poco más.', 'Explore: for the days that ask for a little more.'], 'exp.for': ['Te sirve para', 'It helps you'],
    'exp.fine': ['Recursos tomados de la versión de prueba.', 'Resources taken from the test version.'],
    'res.taller': ['<b>Tu próxima decisión, con más claridad</b>Taller · 45 min', '<b>Your next decision, with more clarity</b>Workshop · 45 min'],
    'res.l1': ['<b>Antes del siguiente paso</b>Lectura guiada · 2 min', '<b>Before the next step</b>Guided reading · 2 min'],
    'res.l2': ['<b>Antes de pedir otra opinión</b>Lectura guiada · 2 min', '<b>Before asking for another opinion</b>Guided reading · 2 min'],
    'faq.h': ['Preguntas prácticas', 'Practical questions'],
    'faq.q1': ['¿Qué pasa en una práctica diaria?', 'What happens in a daily practice?'],
    'faq.a1': ['Llegas a un lugar, lees una situación concreta, respondes una pregunta y te llevas una herramienta y un recuerdo. Como en la práctica de arriba.', 'You arrive somewhere, read a concrete situation, answer one question and leave with a tool and a souvenir. Like the practice above.'],
    'faq.q2': ['¿Cuánto tiempo necesito?', 'How much time do I need?'], 'faq.a2': ['Unos minutos al día. Vas a tu ritmo y puedes pausar cuando quieras.', 'A few minutes a day. You go at your own pace and can pause whenever you like.'],
    'faq.q3': ['¿Puedo usarla en español o en inglés?', 'Can I use it in Spanish or English?'], 'faq.a3': ['En los dos. Elara se piensa primero en español y también está en inglés.', 'Both. Elara is built in Spanish first and is also in English.'],
    'faq.q7': ['¿Qué pasa con mis respuestas y cómo las borro?', 'What happens to my answers, and how do I remove them?'],
    'faq.a7': ['Lo que eliges en la demostración de esta página se recuerda solo en tu navegador durante la visita, y puedes borrarlo con «Empezar de nuevo». No es progreso de la app. En la app puedes pedir que eliminemos tu cuenta y tus datos desde <a href="https://holaelara.com/request-account-deletion">esta página</a>. Los detalles están en la <a href="https://holaelara.com/privacidad">Política de Privacidad</a>. Elara no es terapia ni un servicio médico.',
      'What you choose in this page’s demonstration is remembered only in your browser during the visit, and you can clear it with “Start again”. It is not app progress. In the app you can ask us to delete your account and data from <a href="https://holaelara.com/request-account-deletion">this page</a>. Details are in the <a href="https://holaelara.com/privacy">Privacy Policy</a>. Elara is not therapy or a medical service.'],
    'join.h1': ['Tu próxima parada:', 'Your next stop:'], 'join.h2': ['algo para ti.', 'something for you.'],
    'join.after': ['Se abre el formulario en holaelara.com. Después de unirte, te escribimos antes de abrir; mientras tanto no tienes que hacer nada. Sin spam, y puedes darte de baja cuando quieras.', 'This opens the form on holaelara.com. After you join, we write to you before we open; until then there is nothing you need to do. No spam, and you can leave whenever you like.'],
    'ft.privacy': ['Privacidad', 'Privacy'], 'ft.terms': ['Términos', 'Terms'], 'ft.support': ['Soporte', 'Support'],
    // dynamic
    'card.change': ['Cambiar', 'Change'], 'card.chose': ['Elegiste', 'You chose'],
    'card.keep': ['Guardar', 'Keep'], 'card.kept': ['ya está en tu pasaporte', 'is in your passport'],
    'strip.kept': ['En tu pasaporte', 'In your passport'], 'strip.not': ['Te espera en', 'Waiting for you in'], 'strip.go': ['Ir a', 'Go to'],
    'pc.answer': ['Elegiste', 'You chose'], 'pc.learn': ['Lo que te deja', 'What it leaves you'], 'pc.suggest': ['Elara te sugiere', 'Elara suggests'], 'pc.open': ['Abrir la postal', 'Open the postcard'], 'pc.shut': ['Cerrar la postal', 'Close the postcard'], 'pc.pick': ['Tus postales', 'Your postcards'], 'pc.close': ['Cerrar', 'Close'], 'pc.from': ['Postal de', 'Postcard from'],
    'recap.none': ['Aún no tienes recuerdos. Elige un destino y prueba una pregunta.', 'No souvenirs yet. Choose a destination and try a question.'],
    'recap.top': ['Volver a los destinos', 'Back to the destinations'],
    'tour.pause': ['Pausar el recorrido', 'Pause the tour'], 'tour.play': ['Ver el recorrido', 'Play the tour'],
    'st.walk': ['Camina hacia', 'Walking to'], 'st.at': ['Estás en', 'You are in'],
    'atlas.p': ['Tu Atlas. Gira el globo o toca un destino para ir.', 'Your Atlas. Turn the globe or tap a destination to go there.'],
    'pass.h': ['Tu pasaporte', 'Your passport'], 'pass.stamp': ['Sellado', 'Stamped'],
    'ct.talk': ['Conversaciones', 'Conversations'], 'ct.people': ['Conexiones', 'Connections'],
    'cp.intro': ['Mujeres que están viviendo algo parecido.', 'Women living through something similar.'], 'cp.common': ['Ver qué tienen en común', 'See what you have in common'],
    'cp.1': ['También se mudó hace poco y busca planes entre semana.', 'She also moved recently and is looking for weekday plans.'],
    'cp.2': ['Estudia y trabaja; organiza su semana los domingos.', 'She studies and works; she plans her week on Sundays.'],
    'cp.3': ['Mamá de dos; busca conversaciones cortas y sin juicio.', 'Mum of two; looking for short conversations without judgement.'],
    'cp.t1': ['Una nueva ciudad', 'A new city'], 'cp.t2': ['Vida universitaria', 'University life'], 'cp.t3': ['Soy mamá', 'I am a mum'],
    'cp.fine': ['Demostración: perfiles ilustrativos. En esta página no se envían solicitudes ni se conecta a nadie.', 'Demonstration: illustrative profiles. No requests are sent and no one is connected on this page.'],
  };
  let lang = 'es';
  try { if (sessionStorage.getItem('elara-lang') === 'en') lang = 'en'; } catch (e) { /* storage unavailable: stay in Spanish */ }
  const t = k => T[k][lang === 'en' ? 1 : 0], L = pair => pair[lang === 'en' ? 1 : 0];

  // ---------------------------------------------------------------- Destinations: area, place, one short practice each
  // Practice copy per destination. Names, images and coordinates come from the shared list in destinations.js.
  const PRACTICE = {
    kyoto: { sit: ['Alguien de tu familia te pide dinero. Quieres ayudar, pero todavía no sabes cuánto puedes aportar.', 'Someone in your family asks you for money. You want to help, but you do not yet know how much you can give.'],
      q: ['¿Qué le dices?', 'What do you say?'],
      a: [{ label: ['Voy a revisar cuánto puedo aportar y te digo mañana.', 'I will check how much I can give and tell you tomorrow.'],
            fb: ['Dar un momento concreto para responder te permite revisar tus posibilidades sin dejar a la otra persona esperando.', 'Giving a specific time to answer lets you check what is possible without leaving the other person waiting.'],
            ph: ['Déjame revisar cuánto puedo aportar y mañana te respondo.', 'Let me check how much I can give and I will answer you tomorrow.'] },
          { label: ['Sí, después veo cómo me organizo.', 'Yes, I will figure it out later.'],
            fb: ['Quieres ayudar. Decir que sí antes de revisar puede dejarte con un compromiso que todavía no sabes si puedes cumplir.', 'You want to help. Saying yes before checking can leave you with a commitment you do not yet know you can keep.'],
            ph: ['Quiero ayudarte. Déjame revisar cuánto puedo aportar y mañana te respondo.', 'I want to help you. Let me check how much I can give and I will answer you tomorrow.'] }] },
    venice: { sit: ['Tu día cambió y la rutina que querías hacer ya no cabe.', 'Your day changed and the routine you planned no longer fits.'],
      q: ['¿Qué haces con ella hoy?', 'What do you do with it today?'],
      a: [{ label: ['Hago una versión corta, aunque sean cinco minutos.', 'I do a short version, even five minutes.'],
            fb: ['Una versión mínima mantiene la rutina viva cuando el día cambia. Es más fácil retomarla mañana.', 'A minimum version keeps the routine alive when the day changes. It is easier to pick up again tomorrow.'],
            ph: ['Hoy hago la versión de cinco minutos.', 'Today I do the five-minute version.'] },
          { label: ['La dejo para mañana y empiezo de cero.', 'I leave it for tomorrow and start from zero.'],
            fb: ['Tiene sentido soltarla hoy. Empezar de cero cada vez hace que la rutina dependa de días perfectos.', 'It makes sense to drop it today. Starting from zero each time makes the routine depend on perfect days.'],
            ph: ['Hoy no cabe entera: hago cinco minutos.', 'It does not fit whole today: I do five minutes.'] }] },
    andes: { sit: ['Tienes una idea que te interesa, pero no sabes si es lo tuyo.', 'You have an idea that interests you, but you are not sure it is for you.'],
      q: ['¿Cuál es tu siguiente paso?', 'What is your next step?'],
      a: [{ label: ['Pruebo una parte pequeña esta semana.', 'I try a small part this week.'],
            fb: ['Una prueba, no una decisión para siempre. Probar una parte te dice qué te interesa de verdad.', 'A test, not a forever decision. Trying one part tells you what really interests you.'],
            ph: ['Esta semana pruebo una parte pequeña y veo qué me dice.', 'This week I try a small part and see what it tells me.'] },
          { label: ['Espero a estar segura antes de moverme.', 'I wait until I am sure before I move.'],
            fb: ['Quieres decidir bien. Esperar la certeza suele dejar la idea igual que estaba; una prueba pequeña te da información real.', 'You want to decide well. Waiting for certainty usually leaves the idea where it was; a small test gives you real information.'],
            ph: ['No tengo que decidir todo: pruebo una parte.', 'I do not have to decide everything: I try one part.'] }] },
    mexico: { sit: ['Una amiga te pide un favor que este fin de semana no puedes hacer.', 'A friend asks for a favour you cannot do this weekend.'],
      q: ['¿Qué le respondes?', 'What do you answer?'],
      a: [{ label: ['Le digo qué sí puedo ofrecer.', 'I tell her what I can offer.'],
            fb: ['Distinguir lo que puedes ofrecer te deja cuidar la relación sin prometer de más.', 'Separating out what you can offer lets you care for the relationship without over-promising.'],
            ph: ['Este fin de semana no puedo, pero el martes sí te ayudo.', 'I cannot this weekend, but I can help you on Tuesday.'] },
          { label: ['Digo que sí y veo cómo le hago.', 'I say yes and work it out somehow.'],
            fb: ['Quieres estar para ella. Decir que sí sin poder cumplir suele terminar en cansancio o en cancelar a última hora.', 'You want to be there for her. Saying yes when you cannot follow through often ends in exhaustion or a last-minute cancel.'],
            ph: ['Quiero ayudarte. Este fin de semana no puedo; ¿te sirve el martes?', 'I want to help. I cannot this weekend; would Tuesday work?'] }] },
    giza: { sit: ['Tomaste una decisión y ahora tres personas opinan distinto.', 'You made a decision and now three people disagree.'],
      q: ['¿Qué haces primero?', 'What do you do first?'],
      a: [{ label: ['Escribo mis razones antes de preguntar.', 'I write down my reasons before asking.'],
            fb: ['Reconocer lo que ya sabes te permite revisar la decisión con razones, no con ruido.', 'Recognising what you already know lets you review the decision with reasons, not noise.'],
            ph: ['Antes de preguntar, anoto mis tres razones.', 'Before I ask, I write down my three reasons.'] },
          { label: ['Pregunto a alguien más para estar segura.', 'I ask someone else to be sure.'],
            fb: ['Otra opinión puede sumar. Si llega antes de saber qué piensas tú, es fácil que decida por ti.', 'Another opinion can help. If it comes before you know what you think, it can easily decide for you.'],
            ph: ['Primero anoto qué pienso yo; después pregunto.', 'First I write what I think; then I ask.'] }] },
    reef: { sit: ['Antes de seguir con el día, te detienes un momento a notar cómo estás.', 'Before carrying on with the day, you stop for a moment to notice how you are.'],
      q: ['¿Cómo describirías la energía que tienes disponible ahora?', 'How would you describe the energy available to you now?'],
      a: [{ label: ['Un poco.', 'A little.'],
            fb: ['Podemos observar una sola cosa, sin añadir una tarea para rendir más.', 'We can observe one thing without adding a task to perform more.'],
            ph: ['Mi energía de hoy es información; no es una nota sobre mí.', 'Today’s energy is information, not a grade on me.'] },
          { label: ['Cambia, o no sé cómo nombrarla.', 'It changes, or I do not know how to name it.'],
            fb: ['Puedes dejarla sin número y mirar un momento concreto.', 'You can leave it unnumbered and look at one concrete moment.'],
            ph: ['Mi energía de hoy es información; no es una nota sobre mí.', 'Today’s energy is information, not a grade on me.'] }] },
  };
  const DEST = window.ELARA_DEST.map(d => ({ key: d.key, place: d.place, area: d.area, region: d.region, item: d.souvenir.name, img: d.souvenir.img, plate: d.plate, ...PRACTICE[d.key] }));

  // ---------------------------------------------------------------- Single source of truth for the demonstration
  const state = { dest: 0, answers: {}, collected: [], editing: {}, open: null };   // answers: key -> 0|1; collected: keys in order
  // The demonstration survives a visit to another page (Nosotras, the legal pages) in the same tab. It is session-only,
  // lives in this browser, and is never sent anywhere.
  const STORE = 'elara-demo-v1';
  try { const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    if (saved) { const keys = window.ELARA_DEST.map(d => d.key);
      state.dest = Math.max(0, Math.min(keys.length - 1, saved.dest | 0));
      Object.entries(saved.answers || {}).forEach(([k, v]) => { if (keys.includes(k) && (v === 0 || v === 1)) state.answers[k] = v; });
      state.collected = [...new Set((saved.collected || []).filter(k => keys.includes(k) && k in state.answers))]; } } catch (e) { /* storage unavailable: start fresh */ }
  const persist = () => { try { sessionStorage.setItem(STORE, JSON.stringify({ dest: state.dest, answers: state.answers, collected: state.collected })); } catch (e) { /* fine */ } };
  const answerOf = d => (d.key in state.answers ? d.a[state.answers[d.key]] : null);
  const takeaway = d => { const a = answerOf(d); return a ? { label: L(a.label), fb: L(a.fb), ph: L(a.ph) } : null; };
  let autoplay = !Stage.still(), idle = 0, arrived = true;
  let busy = false;                                        // pointer or focus is on the practice card: do not walk away
  const interact = () => { idle = 0; if (autoplay) { autoplay = false; renderTour(); } };   // her first action ends the automatic tour for good; the button can restart it

  // ---------------------------------------------------------------- Rendering (always from state)
  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
    $$('[data-i18n-html]').forEach(n => { n.innerHTML = t(n.dataset.i18nHtml); });
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $$('[data-signup]').forEach(a => { a.href = lang === 'en' ? 'https://holaelara.com/en#waitlist' : 'https://holaelara.com/#lista'; });
    $$('[data-privacy]').forEach(a => { a.href = lang === 'en' ? 'https://holaelara.com/privacy' : 'https://holaelara.com/privacidad'; });
    $$('a[href^="nosotras.html"]').forEach(a => { a.href = lang === 'en' ? 'nosotras.html#en' : 'nosotras.html'; });
    renderAll(); circles.relabel(); explore.relabel();
  }
  function renderDests() {
    $('#dests').replaceChildren(...DEST.map((d, i) => el('button', { type: 'button', className: 'dest', onclick: () => { interact(); travel(i); } },
      [el('b', { textContent: L(d.area) }), el('span', { textContent: L(d.place) })])));
    $$('#dests .dest').forEach((b, i) => { if (i === state.dest) b.setAttribute('aria-current', 'true'); });
  }
  function renderCards() {
    const keep = document.activeElement && document.activeElement.closest('.card') ? document.activeElement.dataset.role : null;
    $('#cards').replaceChildren(...DEST.map((d, i) => {
      const box = Stage.cardBox(i), tk = takeaway(d), got = state.collected.includes(d.key), result = tk && !state.editing[d.key];
      const card = el('article', { className: 'card' + (i === state.dest && arrived ? ' on' : '') + (result ? ' result' : '') });
      card.style.cssText = `left:${box.left}px;top:${box.top}px;width:${box.width}px`;
      card.append(el('p', { className: 'where', textContent: `${L(d.place)} · ${L(d.area)}` }));
      if (!result) {
        card.append(el('p', { className: 'sit', textContent: L(d.sit) }), el('h3', { className: 'q', textContent: L(d.q) }),
          ...d.a.map((a, n) => { const b = el('button', { type: 'button', className: 'ans', textContent: L(a.label), onclick: () => choose(d, n) });
            b.setAttribute('aria-pressed', String(state.answers[d.key] === n)); b.dataset.role = 'ans' + n; return b; }));
      } else {
        const change = el('button', { type: 'button', className: 'change', textContent: t('card.change'), onclick: () => { interact(); state.editing[d.key] = true; renderAll('ans' + state.answers[d.key]); } });
        change.dataset.role = 'change';
        card.append(el('p', { className: 'picked' }, [el('span', { textContent: `${t('card.chose')}: ${tk.label}` }), change]),
          el('p', { className: 'fb', textContent: tk.fb }), el('p', { className: 'phrase', textContent: tk.ph }));
        const keepBtn = el('button', { type: 'button', className: 'collect' + (got ? ' got' : ''), onclick: () => collect(d) },
          [el('img', { src: 'assets/' + d.img, alt: '' }), el('span', { textContent: got ? `${L(d.item)} · ${t('card.kept')}` : `${t('card.keep')}: ${L(d.item)}` })]);
        keepBtn.dataset.role = 'collect'; if (got) keepBtn.setAttribute('aria-disabled', 'true');
        card.append(keepBtn);
        if (got) card.append(el('span', { className: 'stamp' + (fresh === d.key ? ' fresh' : ''), textContent: L(d.place) }));
      }
      return card;
    }));
    return keep;
  }
  function renderStrip() {
    $('#col-sub').textContent = t(state.collected.length ? 'col.some' : 'col.empty');
    $('#strip').replaceChildren(...DEST.map((d, i) => {
      const got = state.collected.includes(d.key);
      const b = el('button', { type: 'button', className: 'slot' + (got ? ' got' : ''), onclick: () => (got ? openCard(d.key) : (interact(), travel(i), $('#stage').scrollIntoView({ block: 'center', behavior: reduced.matches ? 'auto' : 'smooth' }))) },
        [el('img', { src: 'assets/' + d.img, alt: '', loading: 'lazy', className: fresh === d.key ? 'fresh' : '' }),
          el('span', {}, [el('b', { textContent: L(d.item) }), el('span', { className: 'state', textContent: got ? `✓ ${t('strip.kept')} · ${L(d.place)}` : `${t('strip.not')} ${L(d.place)}` })]),
          ...(got ? [el('span', { className: 'stamp' + (fresh === d.key ? ' fresh' : ''), textContent: L(d.place) })] : [])]);
      if (got) b.setAttribute('aria-expanded', String(state.open === d.key));
      b.dataset.key = d.key;
      return el('li', {}, [b]);
    }));
  }
  function renderPostcard() {
    const pc = $('#postcard'), d = DEST.find(x => x.key === state.open), tk = d && takeaway(d);
    if (!d || !tk || !state.collected.includes(d.key)) { state.open = null; pc.hidden = true; return; }
    pc.hidden = false;
    pc.replaceChildren(
      el('div', { className: 'pc-photo' }, [el('img', { src: 'assets/' + d.plate, alt: '', loading: 'lazy' }), el('span', { className: 'stamp', textContent: L(d.place) })]),
      el('div', { className: 'pc-text' }, [
        el('h3', { id: 'pc-title', textContent: `${t('pc.from')} ${L(d.place)} · ${L(d.area)}` }),
        el('p', { className: 'pc-phrase' }, [el('span', { textContent: t('pc.suggest') }), tk.ph]),
        el('p', {}, [el('span', { textContent: t('pc.learn') }), tk.fb]),
        el('p', {}, [el('span', { textContent: t('pc.answer') }), tk.label]),
        el('button', { type: 'button', className: 'btn small', textContent: t('pc.close'), onclick: () => { const k = state.open; state.open = null; renderAll(); const b = $(`.slot[data-key="${k}"]`); if (b) b.focus(); } }),
      ]));
  }
  function renderWeek() { const tk = takeaway(DEST[0]); $('#week-phrase').textContent = tk ? tk.ph : L(DEST[0].a[0].ph); }
  // Closing postcard: one card for one collected destination; a compact selector when there are several.
  let recapKey = null, recapOpen = false;
  function renderRecap() {
    const items = state.collected.map(k => DEST.find(d => d.key === k)).filter(d => takeaway(d)), box = $('#recap');
    if (!items.length) { recapKey = null; recapOpen = false;
      return box.replaceChildren(el('p', { className: 'recap-none', textContent: t('recap.none') }), el('a', { href: '#top', className: 'recap-link', textContent: t('recap.top') })); }
    if (!items.some(d => d.key === recapKey)) { recapKey = items[items.length - 1].key; recapOpen = false; }   // newest by default
    const d = items.find(x => x.key === recapKey), tk = takeaway(d);
    const toggle = el('button', { type: 'button', className: 'btn small', id: 'recap-toggle', textContent: t(recapOpen ? 'pc.shut' : 'pc.open'), onclick: () => { recapOpen = !recapOpen; renderRecap(); $('#recap-toggle').focus(); } });
    toggle.setAttribute('aria-expanded', String(recapOpen)); toggle.setAttribute('aria-controls', 'recap-inside');
    const inside = el('div', { id: 'recap-inside', className: 'pc-inside', hidden: !recapOpen }, [
      el('p', {}, [el('span', { textContent: t('pc.answer') }), tk.label]), el('p', {}, [el('span', { textContent: t('pc.learn') }), tk.fb])]);
    const card = el('article', { className: 'postcard closing' + (recapOpen ? ' is-open' : '') }, [
      el('div', { className: 'pc-photo' }, [el('img', { src: 'assets/' + d.plate, alt: '', loading: 'lazy' }), el('span', { className: 'stamp', textContent: L(d.place) })]),
      el('div', { className: 'pc-text' }, [
        el('h3', { textContent: `${t('pc.from')} ${L(d.place)} · ${L(d.area)}` }),
        el('p', { className: 'pc-keep' }, [el('img', { src: 'assets/' + d.img, alt: '' }), L(d.item)]),
        el('p', { className: 'pc-phrase' }, [el('span', { textContent: t('pc.suggest') }), tk.ph]),
        toggle, inside])]);
    const kids = [card];
    if (items.length > 1) { const sel = el('div', { className: 'pc-select', role: 'group' }, items.map(x => { const b = el('button', { type: 'button', onclick: () => { recapKey = x.key; recapOpen = false; renderRecap(); const n = $(`.pc-select [data-key="${x.key}"]`); if (n) n.focus(); } },
        [el('img', { src: 'assets/' + x.img, alt: '' }), el('span', { textContent: L(x.place) })]); b.dataset.key = x.key; b.setAttribute('aria-pressed', String(x.key === recapKey)); return b; }));
      sel.setAttribute('aria-label', t('pc.pick')); kids.push(sel); }
    box.replaceChildren(...kids);
  }
  function renderGlobe() { window.ElaraGlobe.set({ lang, current: state.dest, collected: state.collected.map(k => DEST.findIndex(d => d.key === k)) }); }
  function renderTour() { const b = $('#tour'); b.hidden = Stage.still(); b.textContent = t(autoplay ? 'tour.pause' : 'tour.play'); b.setAttribute('aria-pressed', String(!autoplay)); }
  function renderStatus() { $('#status').textContent = `${t(arrived ? 'st.at' : 'st.walk')} ${L(DEST[state.dest].place)} · ${L(DEST[state.dest].area)}`; }
  function renderAll(focusRole) {
    persist(); const keep = renderCards(); renderDests(); renderStrip(); renderPostcard(); renderWeek(); renderRecap(); renderGlobe(); renderTour(); renderStatus();
    const role = focusRole || keep; if (role) { const n = $(`.card.on [data-role="${role}"]`); if (n) n.focus({ preventScroll: true }); }
  }

  // ---------------------------------------------------------------- Actions
  let fresh = null;
  function choose(d, n) { interact(); state.answers[d.key] = n; state.editing[d.key] = false; renderAll('collect'); }
  function transfer(d) {                                   // the souvenir travels from the phone to its passport slot, once
    if (reduced.matches) return;
    const from = $('.card.on .collect img'), to = $(`.slot[data-key="${d.key}"] img`); if (!from || !to || !from.animate) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), seen = b.top < innerHeight && b.bottom > 0;
    const ghost = from.cloneNode(); ghost.className = 'flyer'; ghost.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`; document.body.append(ghost);
    const dx = seen ? b.left - a.left : 0, dy = seen ? b.top - a.top : innerHeight - a.top + 20, k = seen ? b.width / a.width : 1.4;
    if (seen) to.style.visibility = 'hidden';
    ghost.animate([{ transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 }, { transform: `translate(${dx * .5}px,${dy * .5 - 40}px) scale(${(1 + k) / 2 + .25}) rotate(-10deg)`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px,${dy}px) scale(${k}) rotate(0)`, opacity: seen ? 1 : 0 }], { duration: 650, easing: 'cubic-bezier(.3,.7,.3,1)' }).onfinish = () => { ghost.remove(); to.style.visibility = ''; };
  }
  function collect(d) { interact(); const isNew = !state.collected.includes(d.key); if (isNew) { state.collected.push(d.key); fresh = d.key; recapKey = d.key; recapOpen = false; } renderAll('collect'); if (isNew) transfer(d); fresh = null; }   // never a duplicate
  function openCard(key) { state.open = state.open === key ? null : key; renderAll(); if (state.open) $('#postcard').focus({ preventScroll: true }); $('#postcard').scrollIntoView({ block: 'nearest', behavior: reduced.matches ? 'auto' : 'smooth' }); }
  function travel(i) { if (i === state.dest && !Stage.moving) return; state.dest = i; arrived = false; idle = 0; Stage.goTo(i); if (!Stage.moving) arrived = true; renderAll(); }

  // ---------------------------------------------------------------- Circles: a five-step miniature story (plays once in view)
  const circles = (() => {
    const TOPICS = {
      ciudad: [['Me mudé hace poco. ¿Cómo empezaron a hacer amigas sin conocer a nadie?', 'I moved recently. How did you start making friends without knowing anyone?'], ['Me ayudó volver al mismo lugar cada semana. La conversación empezó después de vernos varias veces.', 'Going back to the same place every week helped. The conversation started after we had seen each other a few times.']],
      uni: [['Trabajo y estudio. ¿Cómo eligen qué soltar en una semana pesada?', 'I work and study. How do you choose what to drop in a heavy week?'], ['Elijo una sola cosa que sí hago ese día. Lo demás lo aviso con tiempo.', 'I pick one thing I will do that day. I give notice on the rest early.']],
      mama: [['¿Cómo piden ayuda sin sentir que están fallando?', 'How do you ask for help without feeling you are failing?'], ['Empecé pidiendo una cosa concreta y con hora. Fue más fácil que pedir ayuda en general.', 'I started by asking for one specific thing, with a time. It was easier than asking for help in general.']],
      amigas: [['¿Cómo retoman una amistad después de meses sin hablar?', 'How do you pick a friendship back up after months of silence?'], ['Yo escribí algo corto, sin explicaciones largas. Lo difícil era empezar.', 'I wrote something short, no long explanations. The hard part was starting.']],
    };
    const stage = $('#circle-stage'), topics = $$('[data-topic]'), openBtn = $('#circle-open'), thread = $('#circle-thread');
    const STEP_MS = [500, 1000, 1100, 1300];
    let step = 4, timer = null, running = false, played = false, inView = false, topic = 'ciudad';
    const setStep = n => { step = n; stage.dataset.step = n; };
    const relabel = () => { const [q, r] = TOPICS[topic]; topics.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.topic === topic)));
      $('#circle-q').textContent = L(q); $('#thread-q').textContent = L(q); $('#circle-r').textContent = L(r); $('#thread-r').textContent = L(r);
      $('#circle-topic').textContent = t('topic.' + topic); $('#circle-count').textContent = t('circ.count'); openBtn.textContent = t(thread.hidden ? 'circ.open' : 'circ.close'); ui(); };
    const setThread = open => { thread.hidden = !open; openBtn.setAttribute('aria-expanded', String(open)); stage.classList.toggle('open', open); openBtn.textContent = t(open ? 'circ.close' : 'circ.open'); };
    const ui = () => { const p = $('#circle-pause'); p.hidden = !(running || (timer === null && step < 4)); p.textContent = t(timer === null && step < 4 ? 'circ.resume' : 'circ.pause'); };
    const stop = () => { clearTimeout(timer); timer = null; };
    const next = () => { if (step >= 4) { running = false; timer = null; return ui(); } timer = setTimeout(() => { setStep(step + 1); next(); }, STEP_MS[step]); ui(); };
    const play = () => { stop(); played = true; const first = $('[data-ctab=talk]'); if (first.getAttribute('aria-selected') !== 'true') first.click(); if (reduced.matches) { setStep(4); running = false; return ui(); } setThread(false); topic = 'ciudad'; relabel(); running = true; setStep(0); next(); };
    const hold = () => { if (running && timer !== null) { stop(); ui(); } };
    const carryOn = () => { if (running && timer === null && inView && !document.hidden) next(); };
    $('#circle-replay').addEventListener('click', play);
    $('#circle-pause').addEventListener('click', () => { if (timer !== null) { stop(); running = false; ui(); } else if (step < 4) { running = true; next(); } });
    topics.forEach(b => b.addEventListener('click', () => { stop(); running = false; topic = b.dataset.topic; relabel(); setStep(4); ui(); }));
    openBtn.addEventListener('click', () => setThread(thread.hidden));
    const tabs = $$('[data-ctab]'), panes = $$('[data-cpane]');
    tabs.forEach(b => b.addEventListener('click', () => { stop(); running = false; setStep(4); setThread(false); ui(); tabs.forEach(x => x.setAttribute('aria-selected', String(x === b))); panes.forEach(p => { p.hidden = p.dataset.cpane !== b.dataset.ctab; }); stage.classList.toggle('tab-people', b.dataset.ctab === 'people'); }));
    $$('[data-common]').forEach(b => b.addEventListener('click', () => { const p = b.nextElementSibling, open = p.hidden; p.hidden = !open; b.setAttribute('aria-expanded', String(open)); }));
    new IntersectionObserver(es => { inView = es[0].isIntersecting; if (inView && !played) play(); else if (inView) carryOn(); else hold(); }, { threshold: .45 }).observe(stage);
    document.addEventListener('visibilitychange', () => (document.hidden ? hold() : carryOn()));
    window.__circles = { get step() { return step; }, get running() { return running; }, get ticking() { return timer !== null; } };
    return { relabel };
  })();

  // ---------------------------------------------------------------- Explore: what each sample resource helps with
  const explore = (() => {
    const RES = {
      taller: ['Ordenar una decisión que tienes pendiente y salir con un siguiente paso escrito.', 'Sort out a decision you have pending and leave with a written next step.'],
      l1: ['Parar dos minutos antes de avanzar y revisar si ese paso sigue teniendo sentido.', 'Stop for two minutes before moving on and check that the step still makes sense.'],
      l2: ['Reconocer lo que ya sabes antes de preguntarle a alguien más.', 'Recognise what you already know before asking someone else.'],
    };
    const res = $$('[data-res]'); let cur = 'taller';
    const relabel = () => { res.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.res === cur))); $('#res-help').textContent = L(RES[cur]); };
    res.forEach(b => b.addEventListener('click', () => { cur = b.dataset.res; relabel(); }));
    return { relabel };
  })();

  // ---------------------------------------------------------------- Wiring
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; try { sessionStorage.setItem('elara-lang', lang); } catch (e) { /* fine */ } applyLang(); }));
  $('#tour').addEventListener('click', () => { autoplay = !autoplay; idle = 0; if (autoplay && state.dest >= DEST.length - 1) travel(0); renderTour(); });
  const stageEl = $('#stage');
  $('#scene').addEventListener('click', e => { const i = Stage.phoneAt(e.clientX, e.clientY); if (i >= 0) { interact(); travel(i); } });
  let sx = 0, sy = 0;
  stageEl.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stageEl.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) { interact(); travel(Math.max(0, Math.min(DEST.length - 1, state.dest + (dx < 0 ? 1 : -1)))); } }, { passive: true });
  $('#cards').addEventListener('pointerdown', interact);
  window.ElaraGlobe.onPick(i => { interact(); travel(i); $('#stage').scrollIntoView({ block: 'center', behavior: reduced.matches ? 'auto' : 'smooth' }); });
  Stage.on('arrive', i => { state.dest = i; arrived = true; idle = 0; renderAll(); });
  // She walks on by herself. The wait depends on what the visitor is doing: longer while a question is unanswered,
  // no moving on while an answer is chosen but its souvenir is not kept yet, a short pause after collecting.
  Stage.on('frame', dt => {
    if (!autoplay || !arrived || Stage.moving || busy) return;
    const d = DEST[state.dest], answered = d.key in state.answers, got = state.collected.includes(d.key);
    if (answered && !got) return;
    idle += dt; if (idle < (got ? 3.5 : 9)) return;
    if (state.dest >= DEST.length - 1) { autoplay = false; return renderTour(); }
    travel(state.dest + 1);
  });
  $('#cards').addEventListener('pointerenter', () => { busy = true; }); $('#cards').addEventListener('pointerleave', () => { busy = false; idle = 0; });
  $('#cards').addEventListener('focusin', () => { busy = true; }); $('#cards').addEventListener('focusout', () => { busy = false; idle = 0; });
  $('#reset').addEventListener('click', () => { state.answers = {}; state.collected = []; state.editing = {}; state.open = null; recapKey = null; recapOpen = false; idle = 0;
    try { sessionStorage.removeItem(STORE); } catch (e) { /* fine */ } travel(0); renderAll(); $('#reset-note').textContent = t('reset.done'); });
  window.__elara = { state, DEST, takeaway, get lang() { return lang; }, get autoplay() { return autoplay; }, get arrived() { return arrived; } };
  const resumed = state.dest > 0 || state.collected.length > 0 || Object.keys(state.answers).length > 0;
  if (resumed) autoplay = false;                           // she comes back to where she left off; the tour does not restart on its own
  Stage.ready.then(() => { $('#tour').hidden = false; if (state.dest) Stage.goTo(state.dest, true); applyLang(); }, err => { console.error(err); applyLang(); });
})();
