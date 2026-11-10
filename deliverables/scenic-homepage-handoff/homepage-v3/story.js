// Lower sections. Everything here is local and curated: nothing is sent, saved or generated.
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const press = (group, on) => group.forEach(x => x.setAttribute('aria-pressed', String(x === on)));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  // Practice: choose a response, see what it teaches.
  const replies = $$('[data-reply]');
  replies.forEach(b => b.addEventListener('click', () => { press(replies, b); $('#example-hint').textContent = 'Puedes elegir la otra respuesta para comparar.'; }));

  // Collection: each souvenir holds a phrase; "Guardar" moves it into the demo kit.
  const KEEP = {
    cup: 'Quiero ayudarte. Déjame revisar cuánto puedo aportar y mañana te respondo.',
    boat: 'Después del café, cinco minutos para mí.',
    flask: 'Voy a probar una parte pequeña antes de decidir.',
    bracelet: 'Hoy puedo escucharte un rato; después necesito descansar.',
  };
  const mementos = $$('[data-keep]'), kit = [];
  let current = 'cup';
  const renderKit = () => {
    $('#kit-count').textContent = kit.length;
    $('#kit-items').replaceChildren(...(kit.length ? kit.map(k => Object.assign(document.createElement('li'), { textContent: KEEP[k] }))
      : [Object.assign(document.createElement('li'), { className: 'empty', textContent: 'Aquí se juntan las frases que quieres volver a usar.' })]));
    const saved = kit.includes(current); $('#keep-save').disabled = saved; $('#keep-save').textContent = saved ? 'Guardada en tu kit' : 'Guardar en mi kit';
  };
  mementos.forEach(b => b.addEventListener('click', () => { press(mementos, b); current = b.dataset.keep; $('#keep-phrase').textContent = KEEP[current]; renderKit(); }));
  $('#keep-save').addEventListener('click', () => { if (!kit.includes(current)) kit.push(current); renderKit(); });

  // Six areas.
  const paths = $$('[data-path]'), panels = $$('[data-panel]');
  paths.forEach(b => b.addEventListener('click', () => { press(paths, b); panels.forEach(p => { p.hidden = p.dataset.panel !== b.dataset.path; }); }));

  // Explore: what each sample resource helps with.
  const RES = {
    taller: 'Ordenar una decisión que tienes pendiente y salir con un siguiente paso escrito.',
    l1: 'Parar dos minutos antes de avanzar y revisar si ese paso sigue teniendo sentido.',
    l2: 'Reconocer lo que ya sabes antes de preguntarle a alguien más.',
  };
  const res = $$('[data-res]');
  res.forEach(b => b.addEventListener('click', () => { press(res, b); $('#res-help').textContent = RES[b.dataset.res]; }));

  // Circles: a five-step miniature story. Plays once when it enters view, then stays still and usable.
  const TOPICS = {
    ciudad: ['Una nueva ciudad', 'Me mudé hace poco. ¿Cómo empezaron a hacer amigas sin conocer a nadie?', 'Me ayudó volver al mismo lugar cada semana. La conversación empezó después de vernos varias veces.'],
    uni: ['Vida universitaria', 'Trabajo y estudio. ¿Cómo eligen qué soltar en una semana pesada?', 'Elijo una sola cosa que sí hago ese día. Lo demás lo aviso con tiempo.'],
    mama: ['Soy mamá', '¿Cómo piden ayuda sin sentir que están fallando?', 'Empecé pidiendo una cosa concreta y con hora. Fue más fácil que pedir ayuda en general.'],
    amigas: ['Amistades adultas', '¿Cómo retoman una amistad después de meses sin hablar?', 'Yo escribí algo corto, sin explicaciones largas. Lo difícil era empezar.'],
  };
  const stage = $('#circle-stage'), topics = $$('[data-topic]'), openBtn = $('#circle-open'), thread = $('#circle-thread');
  const STEP_MS = [500, 1000, 1100, 1300];             // topics, selection, question, reply
  let step = 4, timer = null, running = false, played = false, inView = false;
  const setStep = n => { step = n; stage.dataset.step = n; };
  const setThread = open => { thread.hidden = !open; openBtn.setAttribute('aria-expanded', String(open)); openBtn.textContent = open ? 'Cerrar la conversación' : 'Abrir la conversación'; stage.classList.toggle('open', open); };
  const setTopic = k => { const [t, q, r] = TOPICS[k]; press(topics, topics.find(b => b.dataset.topic === k));
    $('#circle-q').textContent = q; $('#thread-q').textContent = q; $('#circle-r').textContent = r; $('#thread-r').textContent = r; $('#circle-topic').textContent = t; };
  const ui = () => { $('#circle-pause').hidden = !(running || (timer === null && step < 4)); $('#circle-pause').textContent = timer === null && step < 4 ? 'Continuar' : 'Pausar'; };
  const stop = () => { clearTimeout(timer); timer = null; };
  const next = () => { if (step >= 4) { running = false; timer = null; return ui(); } timer = setTimeout(() => { setStep(step + 1); next(); }, STEP_MS[step]); ui(); };
  const play = () => { stop(); played = true; if (reduced.matches) { setStep(4); running = false; return ui(); } setThread(false); setTopic('ciudad'); running = true; setStep(0); next(); };
  const hold = () => { if (running && timer !== null) { stop(); ui(); } };
  const carryOn = () => { if (running && timer === null && inView && !document.hidden) next(); };
  $('#circle-replay').addEventListener('click', play);
  $('#circle-pause').addEventListener('click', () => { if (timer !== null) { stop(); running = false; ui(); } else if (step < 4) { running = true; next(); } });
  topics.forEach(b => b.addEventListener('click', () => { stop(); running = false; setTopic(b.dataset.topic); setStep(4); ui(); }));
  openBtn.addEventListener('click', () => setThread(thread.hidden));
  new IntersectionObserver(es => { inView = es[0].isIntersecting; if (inView && !played) play(); else if (inView) carryOn(); else hold(); }, { threshold: .45 }).observe(stage);
  document.addEventListener('visibilitychange', () => (document.hidden ? hold() : carryOn()));
  window.__circles = { get step() { return step; }, get running() { return running; }, get ticking() { return timer !== null; } };
  renderKit(); ui();
})();
