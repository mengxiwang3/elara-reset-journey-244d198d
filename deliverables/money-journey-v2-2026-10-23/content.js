/* Content for the two upgraded days. Spanish first, English beside it.
   Source of truth for the unchanged V4 strings: Money Clarity V4 build edition (19 Oct 2026), as shipped in
   apps/mobile/src/i18n/locales/{es,en}/pathCopy/money.ts on ux/circles-clarity-2026-10-21 (cb7f602).
   Every string marked P() is NEW or REWRITTEN in this prototype and is a PROPOSAL for Alejandra's review.
   Strings marked V4() are taken from V4 as they stand. */
(function () {
  var PROPOSED = []; // collected for the review list
  function T(es, en) { return { es: es, en: en }; }
  function P(id, why, es, en) { PROPOSED.push({ id: id, why: why, es: es, en: en }); return { es: es, en: en, p: id }; }
  function V4(es, en) { return { es: es, en: en }; }

  var COMMON = {
    cont: T('Continuar', 'Continue'),
    check: P('common.check', 'Button on learning checks', 'Comprobar', 'Check'),
    understood: P('common.understood', 'Button on a read step', 'Entendido', 'Got it'),
    skip: P('common.skip', 'Skip link; V4 data says "Saltar por ahora / Skip for now", the TestFlight screen says "Prefer to skip"', 'Prefiero saltar', 'Prefer to skip'),
    help: P('common.help', 'Optional help link', 'Ayúdame a pensar', 'Help me think'),
    helpExplain: P('common.helpExplain', 'Help heading', 'En simple', 'In plain words'),
    helpExample: P('common.helpExample', 'Help heading', 'Un ejemplo', 'An example'),
    helpSmaller: P('common.helpSmaller', 'Help heading', 'Hazlo más pequeño', 'Make it smaller'),
    helpClose: P('common.helpClose', 'Help close', 'Cerrar ayuda', 'Close help'),
    summary: P('common.summary', 'Last-step button', 'Ver mi resumen', 'See my summary'),
    seeLandscape: P('panel.see', 'Panel control', 'Ver paisaje', 'See landscape'),
    backToQ: P('panel.back', 'Panel control', 'Volver a la pregunta', 'Back to the question'),
    expand: P('panel.expand', 'Panel control', 'Ampliar', 'Expand'),
    shrink: P('panel.shrink', 'Panel control', 'Reducir', 'Reduce'),
    stepOf: P('panel.stepOf', 'Progress, one indicator only', 'Paso {i} de {n}', 'Step {i} of {n}'),
    prefer: P('common.other', 'Other', 'Otra cosa', 'Something else')
  };

  /* ───────────── Week 1 · Day 4 ───────────── */
  var D4 = {
    no: 4, week: 1, stopIndex: 3,
    title: V4('¿Llega tarde, no alcanza o no se sabe?', 'Late, not enough, or unknown?'),
    intro: P('d4.intro', 'Arrival line. V4 has no day intro, only the title.', 'Hoy practicas separar tres problemas que se parecen: el dinero que llega tarde, el que no alcanza y el dato que falta.', 'Today you practise telling apart three problems that look alike: money that arrives late, money that is not enough, and a missing fact.')
  };

  D4.ctx = {
    id: 'ctx', type: 'ctx', optional: true,
    title: P('d4.ctx.title', 'ADDED step so the examples fit what is true for her (fixes the "no pending payment" branch). V4 goes straight to the examples.', 'Antes de los ejemplos: ¿qué es cierto para ti esta semana?', 'Before the examples: what is true for you this week?'),
    body: P('d4.ctx.body', 'ADDED', 'Elige lo que aplique. Así los ejemplos de hoy se ajustan a ti.', 'Pick what applies. That way today\'s examples fit you.'),
    options: [
      { id: 'pay', label: P('d4.ctx.pay', 'ADDED', 'Tengo un pago por vencer', 'A payment is coming due') },
      { id: 'inc', label: P('d4.ctx.inc', 'ADDED', 'Espero dinero', 'I am expecting money') },
      { id: 'none', excl: true, label: P('d4.ctx.none', 'ADDED', 'Ninguna de las dos', 'Neither') },
      { id: 'unsure', excl: true, label: V4('No estoy segura', 'Not sure') }
    ],
    detail: {
      pay: {
        q: P('d4.ctx.payq', 'ADDED', '¿Se sabe cuándo vence el pago?', 'Do you know when the payment is due?'),
        amountLabel: P('d4.ctx.payamt', 'ADDED', 'De cuánto es (opcional)', 'How much it is (optional)')
      },
      inc: {
        q: P('d4.ctx.incq', 'ADDED', '¿Se sabe cuándo llega el dinero?', 'Do you know when the money arrives?'),
        amountLabel: P('d4.ctx.incamt', 'ADDED', 'Cuánto es (opcional)', 'How much it is (optional)')
      }
    },
    help: {
      explain: P('d4.ctx.h1', 'Help', 'Un pago por vencer es algo que tienes que pagar pronto. “Espero dinero” es un ingreso que aún no llega. Pueden ser las dos, ninguna o no saberlo.', 'A payment coming due is something you have to pay soon. “Expecting money” is income that has not arrived yet. It can be both, neither, or you may not know.'),
      example: P('d4.ctx.h2', 'Help', 'Por ejemplo: la renta vence el 5 y tu pago llega el 8. Eso sería las dos.', 'For example: rent is due on the 5th and your pay arrives on the 8th. That would be both.'),
      smaller: { label: P('d4.ctx.h3', 'Help', '¿Hay algo que venza en las próximas dos semanas?', 'Is anything due in the next two weeks?'), buttons: [
        { label: T('Sí', 'Yes'), set: ['pay'] }, { label: T('No', 'No'), set: ['none'] }, { label: T('No sé', 'Not sure'), set: ['unsure'] }] }
    }
  };

  D4.sort = {
    id: 'sort', type: 'sort', optional: true,
    title: P('d4.sort.title', 'REWRITE of the V4 examples into a learning check (V4 asks which example is closest to her)', '¿Qué muestra cada ejemplo?', 'What does each example show?'),
    body: P('d4.sort.body', 'REWRITE', 'Son ejemplos inventados, no son sobre ti. Toca una opción en cada uno.', 'These are made-up examples, not about you. Tap an option on each one.'),
    cats: [
      { id: 'late', label: P('d4.sort.late', 'Category label from V4 teach ("dinero que llega tarde")', 'Llega tarde', 'Arrives late') },
      { id: 'amount', label: P('d4.sort.amount', 'Category label', 'No alcanza', 'Not enough') },
      { id: 'info', label: P('d4.sort.info', 'Category label', 'Falta un dato', 'Missing fact') }
    ],
    items: [
      { id: 'A', answer: 'late', text: V4('Un pago de 100 vence el martes; no hay dinero antes; se esperan 120 el viernes.', 'A payment of 100 is due Tuesday; no money before then; 120 is expected Friday.') },
      { id: 'B', answer: 'amount', text: V4('Se necesitan 150 esta semana; todo el dinero disponible o esperado suma 120.', '150 is needed this week; all available or expected money totals 120.') },
      { id: 'C', answer: 'info', text: V4('No se sabe la cantidad o la fecha en que llega el ingreso.', 'The amount or income date is unknown.') }
    ],
    right: {
      A: P('d4.sort.rA', 'Authored explanation', 'A: sí. El dinero (120) cubre el pago (100), pero llega el viernes y el pago vence el martes: son 3 días sin cubrir. Mover una fecha arregla el cuándo; no crea dinero.', 'A: yes. The money (120) covers the payment (100), but it arrives Friday and the payment is due Tuesday: 3 days uncovered. Moving a date fixes the timing; it does not create money.'),
      B: P('d4.sort.rB', 'Authored explanation', 'B: sí. 150 − 120 = 30 de menos. Aunque las fechas coincidieran, faltarían 30.', 'B: yes. 150 − 120 = 30 short. Even if the dates matched, 30 would still be missing.'),
      C: P('d4.sort.rC', 'Authored explanation', 'C: sí. Sin la cantidad o la fecha no se puede decir si alcanza ni si llega a tiempo. Un dato que falta no es lo mismo que cero.', 'C: yes. Without the amount or the date you cannot say if it is enough or on time. A missing fact is not the same as zero.')
    },
    wrong: {
      'A:amount': P('d4.sort.wAa', 'Authored explanation', 'A: no del todo. Ahí 120 cubre un pago de 100: la cantidad alcanza. Lo que falla es el cuándo, porque el dinero llega el viernes y el pago vence el martes.', 'A: not quite. There, 120 covers a payment of 100, so the amount is enough. What fails is the timing: the money arrives Friday and the payment is due Tuesday.'),
      'A:info': P('d4.sort.wAi', 'Authored explanation', 'A: no del todo. En A sí se conocen cantidades y fechas. Con esos datos se ve que el dinero llega tarde: el viernes, después del martes.', 'A: not quite. In A the amounts and dates are known. With those you can see the money arrives late: Friday, after Tuesday.'),
      'B:late': P('d4.sort.wBl', 'Authored explanation', 'B: no del todo. En B no se habla de fechas. Lo que se ve son las cantidades: 150 necesarios y 120 disponibles, o sea 30 de menos.', 'B: not quite. B gives no dates. What it shows is the amounts: 150 needed and 120 available, so 30 short.'),
      'B:info': P('d4.sort.wBi', 'Authored explanation', 'B: no del todo. En B ya hay cantidades: 150 y 120. Con esos datos se ve que faltan 30.', 'B: not quite. B already has amounts: 150 and 120. With those you can see 30 is missing.'),
      'C:late': P('d4.sort.wCl', 'Authored explanation', 'C: no del todo. En C no sabemos cuándo llega el ingreso, así que no se puede decir si llega tarde. Falta ese dato.', 'C: not quite. In C we do not know when the income arrives, so we cannot say if it is late. That fact is missing.'),
      'C:amount': P('d4.sort.wCa', 'Authored explanation', 'C: no del todo. En C no sabemos la cantidad, así que no se puede decir si alcanza. Falta ese dato.', 'C: not quite. In C we do not know the amount, so we cannot say if it is enough. That fact is missing.')
    },
    close: V4('Tu situación puede tener varios de estos problemas a la vez. Estos ejemplos explican las ideas; no son un diagnóstico de tus finanzas.', 'Your situation can include several of these problems. These examples explain the ideas; they do not diagnose your finances.'),
    unchosen: P('d4.sort.un', 'Shown for an example she left without an option', 'Sin elegir. Lo puedes dejar así.', 'Not chosen. You can leave it like that.'),
    help: {
      explain: P('d4.sort.h1', 'Help', 'Mira solo lo que dice cada ejemplo. “Llega tarde” es cuando el dinero llega después de que se necesita. “No alcanza” es cuando la suma es menor. “Falta un dato” es cuando no se sabe algo clave.', 'Look only at what each example says. “Arrives late” is when the money comes after it is needed. “Not enough” is when the total is smaller. “Missing fact” is when something key is unknown.'),
      example: P('d4.sort.h2', 'Help', 'Si pagas 100 el martes y cobras 100 el jueves, es “llega tarde”. Si pagas 100 y cobras 80, es “no alcanza”.', 'If you pay 100 on Tuesday and get paid 100 on Thursday, that is “arrives late”. If you pay 100 and get 80, that is “not enough”.')
    }
  };

  D4.closest = {
    id: 'closest', type: 'choice', optional: true,
    title: V4('¿Qué ejemplo se parece más a tu situación?', 'Which example feels closest to your situation?'),
    body: P('d4.closest.body', 'REWRITE: V4 body repeats the three examples; here they are on the step before.', 'Solo si algo se parece. Si no, puedes decir que ninguno.', 'Only if something fits. If not, you can say none.'),
    options: [
      { id: 'A', label: P('d4.closest.A', 'Option label', 'A · llega tarde', 'A · arrives late') },
      { id: 'B', label: P('d4.closest.B', 'Option label', 'B · no alcanza', 'B · not enough') },
      { id: 'C', label: P('d4.closest.C', 'Option label', 'C · falta un dato', 'C · missing fact') },
      { id: 'several', label: V4('Varios', 'Several') },
      { id: 'noneof', label: V4('Ninguno', 'None') },
      { id: 'unsure', label: V4('No estoy segura', 'Not sure') }
    ],
    help: {
      explain: P('d4.closest.h1', 'Help', 'Piensa en tu semana, no en un mes. ¿Algo se parece a un pago que llega después de cuando lo necesitas, a un total corto o a un dato que no tienes?', 'Think about this week, not a month. Does anything look like money arriving after you need it, a total that is short, or a fact you do not have?'),
      example: P('d4.closest.h2', 'Help', 'Si no sabes cuándo te pagan, se parece a C.', 'If you do not know when you get paid, it looks like C.')
    }
  };

  D4.fact = {
    id: 'fact', type: 'fact', optional: true,
    title: V4('¿Qué dato te ayudaría ahora?', 'What fact would help you next?'),
    body: P('d4.fact.body', 'ADDED (chips make the answer structured; V4 only has a free line)', 'Elige uno, o escríbelo con tus palabras.', 'Pick one, or write it in your own words.'),
    placeholder: V4('Opcional: necesito averiguar ____.', 'Optional: I need to find out ____.'),
    chips: [
      { id: 'date', label: P('d4.fact.date', 'Chip', 'La fecha en que llega', 'The date it arrives') },
      { id: 'amount', label: P('d4.fact.amount', 'Chip', 'La cantidad', 'The amount') },
      { id: 'covers', label: P('d4.fact.covers', 'Chip', 'Si alcanza para el pago', 'Whether it covers the payment') }
    ],
    chipReply: {
      date: P('d4.fact.rdate', 'Authored reply', 'Una fecha se confirma con quien paga. Mientras no la tengas, anótala como estimada, no como segura.', 'A date can be confirmed with whoever pays you. Until you have it, keep it marked as estimated, not certain.'),
      amount: P('d4.fact.ramount', 'Authored reply', 'Una cantidad también se puede confirmar. Si solo tienes un cálculo, márcalo como aproximado.', 'An amount can be confirmed too. If you only have a guess, mark it as approximate.'),
      covers: P('d4.fact.rcovers', 'Authored reply', 'Para saber si alcanza necesitas tres datos: cuánto hay, cuándo llega y cuándo vence el pago.', 'To know if it covers it you need three facts: how much there is, when it arrives, and when the payment is due.')
    },
    textSaved: P('d4.fact.saved', 'Fallback for free text (not interpreted)', 'Anotado con tus palabras.', 'Noted in your words.'),
    retry: P('d4.fact.retry', 'Retry invitation (mirrors the app\'s practice.retryInvite)', 'Eso no parece un dato. ¿Quieres intentarlo otra vez, o seguir sin escribir?', 'That does not look like a fact. Want to try again, or move on without writing?'),
    help: {
      explain: P('d4.fact.h1', 'Help', 'Un dato es algo que se puede confirmar con alguien o en un papel: una fecha, una cantidad, una condición.', 'A fact is something you can confirm with someone or on paper: a date, an amount, a condition.'),
      example: P('d4.fact.h2', 'Help', 'Ejemplos: “el día en que me pagan”, “cuánto es el pago mínimo”.', 'Examples: “the day I get paid”, “how much the minimum payment is”.')
    }
  };

  D4.kind = {
    id: 'kind', type: 'kind', optional: true,
    title: P('d4.kind.title', 'Takeaway step title (V4 uses "Para guardar")', 'Para guardar: ¿qué es lo tuyo?', 'To keep: which one is yours?'),
    fields1: V4('Puede ser (llega tarde / no alcanza / las dos cosas / no se sabe):', 'It may be (late / not enough / both / unknown):'),
    options: [
      { id: 'late', label: T('Llega tarde', 'Arrives late') },
      { id: 'enough', label: T('No alcanza', 'Not enough') },
      { id: 'both', label: T('Las dos cosas', 'Both') },
      { id: 'unknown', label: T('No se sabe', 'Unknown') }
    ],
    nextLabel: V4('El siguiente dato:', 'Next fact:'),
    replies: {
      late: P('d4.kind.rlate', 'Authored reply', 'Entonces la pregunta es de fechas: cuándo llega el dinero y cuándo vence el pago.', 'Then the question is about dates: when the money arrives and when the payment is due.'),
      enough: P('d4.kind.renough', 'Authored reply', 'Entonces la pregunta es de cantidades: cuánto necesitas y cuánto tienes o esperas.', 'Then the question is about amounts: how much you need and how much you have or expect.'),
      both: P('d4.kind.rboth', 'Authored reply', 'Pueden pasar las dos cosas a la vez. Empieza por el dato más fácil de confirmar.', 'Both can happen at once. Start with the fact that is easiest to confirm.'),
      unknown: P('d4.kind.runknown', 'Authored reply', 'Entonces el primer paso es el dato que falta. Todavía no hay nada que cuadrar.', 'Then the first step is the missing fact. There is nothing to line up yet.')
    },
    help: {
      explain: P('d4.kind.h1', 'Help', 'Elige la que mejor describe lo que sabes hoy, aunque sea provisional. Puedes cambiarla luego.', 'Pick the one that best describes what you know today, even if provisional. You can change it later.'),
      example: P('d4.kind.h2', 'Help', 'Si el dinero llega después del pago: “llega tarde”.', 'If the money arrives after the payment: “arrives late”.')
    }
  };

  /* ctx replies (depend on the combination) */
  D4.ctxReply = {
    none: P('d4.ctx.rnone', 'Authored reply', 'Entonces no hay pago ni ingreso que cruzar esta semana. Practicamos la idea con ejemplos inventados y dejamos tu situación para otro día.', 'Then there is no payment or income to line up this week. We will practise the idea with made-up examples and leave your own situation for another day.'),
    both: P('d4.ctx.rboth', 'Authored reply', 'Con un pago y dinero esperado se pueden comparar fechas: ¿llega el dinero antes de que venza el pago?', 'With a payment and expected money you can compare dates: does the money arrive before the payment is due?'),
    pay: P('d4.ctx.rpay', 'Authored reply', 'Con un pago por vencer, lo útil es ver su fecha junto a la del dinero. Los ejemplos de hoy practican justo eso.', 'With a payment coming due, what helps is seeing its date next to the money\'s. Today\'s examples practise exactly that.'),
    inc: P('d4.ctx.rinc', 'Authored reply', 'Con dinero esperado, la fecha importa tanto como la cantidad. Los ejemplos de hoy lo muestran.', 'With expected money, the date matters as much as the amount. Today\'s examples show that.'),
    unsure: P('d4.ctx.runsure', 'Authored reply', 'No pasa nada por no estar segura. Usamos ejemplos inventados, y al final puedes elegir qué dato averiguar.', 'It is fine not to be sure. We use made-up examples, and at the end you can choose which fact to find out.')
  };

  /* ───────────── Week 2 · Day 11 ───────────── */
  var D11 = {
    no: 11, week: 2, stopIndex: 3,
    title: V4('Compara en igualdad de condiciones', 'Compare on the same terms'),
    intro: P('d11.intro', 'Arrival line. V4 has no day intro.', 'Hoy comparas dos opciones de trabajo con los mismos datos: lo que recibes, lo que cuesta, el tiempo y cuándo te pagan.', 'Today you compare two work options on the same facts: what you receive, what it costs, the time, and when you are paid.')
  };

  D11.before = {
    id: 'before', type: 'compare', optional: true,
    title: V4('¿Qué revisarías antes de elegir?', 'What would you check before choosing?'),
    body: P('d11.before.body', 'REWRITE: V4 puts both offers in the body as one paragraph; here they are a table she can reveal.', 'Son dos ofertas inventadas para practicar; no son trabajos reales. Toca cada dato para verlo.', 'These are two made-up offers for practice; they are not real jobs. Tap each fact to see it.'),
    rows: [
      { id: 'recv', label: P('d11.row.recv', 'Row', 'Recibes', 'You receive'), a: 60, b: 48, kind: 'money', shown: true },
      { id: 'cost', label: P('d11.row.cost', 'Row', 'Costos', 'Costs'), a: 20, b: 8, kind: 'money' },
      { id: 'time', label: P('d11.row.time', 'Row', 'Tiempo total', 'Total time'), a: 10, b: 6, kind: 'hours' },
      { id: 'pay', label: P('d11.row.pay', 'Row', 'Día de pago', 'Payday'), a: 'fri', b: null, kind: 'payday' }
    ],
    payA: T('el viernes', 'Friday'), payB: T('no se sabe', 'unknown'),
    options: [
      { id: 'payday', label: V4('Qué día paga B', 'B\'s payday'), reply: V4('Sí. B deja los mismos 40 en menos tiempo, pero no se sabe qué día paga.', 'Yes. B leaves the same 40 in less time, but its payday is unknown.') },
      { id: 'perhour', label: V4('El dinero por hora', 'Money per hour'), reply: V4('B paga unos 6.67 por hora, contra 4. No se sabe qué día paga, así que eso no decide la elección.', 'B pays about 6.67 an hour against 4. Its payday is unknown, so that doesn\'t settle it.') },
      { id: 'nothing', label: V4('Nada, dejan el mismo dinero', 'Nothing, they leave the same money'), reply: V4('Los dos dejan 40, pero toman distinto tiempo, y no se sabe qué día paga B.', 'Both leave 40, but they differ in time, and B\'s payday is unknown.') },
      { id: 'unsure', label: V4('No estoy segura', 'Not sure'), reply: V4('60 menos 20 son 40, en 10 horas. 48 menos 8 son 40, en 6 horas. Lo que todavía no se sabe es qué día paga B.', '60 − 20 = 40 in 10 hours. 48 − 8 = 40 in 6 hours. What\'s still unknown is B\'s payday.') }
    ],
    revealRows: P('d11.before.hint', 'Prompt above the table', 'Antes de elegir, mira los datos que faltan por ver.', 'Before choosing, look at the facts you have not seen yet.'),
    revealed: {
      cost: P('d11.rev.cost', 'Authored line when costs are revealed', 'Con los costos, A deja 60 − 20 = 40 y B deja 48 − 8 = 40.', 'With the costs, A leaves 60 − 20 = 40 and B leaves 48 − 8 = 40.'),
      time: P('d11.rev.time', 'Authored line when time is revealed', 'El tiempo no es dinero: A usa 10 horas y B usa 6. Es otra cosa que comparar.', 'Time is not money: A uses 10 hours and B uses 6. It is a separate thing to compare.'),
      pay: P('d11.rev.pay', 'Authored line when payday is revealed', 'A paga el viernes. De B no se sabe: un dato desconocido no es cero ni “ya pagado”.', 'A pays on Friday. For B it is unknown: an unknown fact is not zero, and not “already paid”.')
    },
    mineToggle: P('d11.mine', 'Optional personal mode', 'Usar mis números', 'Use my own numbers'),
    mineBack: P('d11.mineback', 'Optional personal mode', 'Volver al ejemplo', 'Back to the example'),
    mineNote: P('d11.minenote', 'Optional personal mode, shown above the fields', 'Opcional. Deja en blanco lo que no sepas: un dato en blanco no cuenta como cero.', 'Optional. Leave blank what you do not know: a blank fact does not count as zero.'),
    help: {
      explain: P('d11.before.h1', 'Help', 'Comparar “en los mismos términos” es mirar lo mismo en las dos: lo que recibes, lo que cuesta, cuánto tiempo toma y cuándo te pagan.', 'Comparing “on the same terms” means looking at the same things in both: what you receive, what it costs, how long it takes, and when you are paid.'),
      example: P('d11.before.h2', 'Help', 'Si una paga 60 y cuesta 20, deja 40. Si otra paga 48 y cuesta 8, también deja 40. Ahí se igualan; las distingue lo que viene después.', 'If one pays 60 and costs 20, it leaves 40. If another pays 48 and costs 8, it also leaves 40. They tie there; what follows tells them apart.'),
      smaller: { label: P('d11.before.h3', 'Help', 'Empieza por una sola pregunta', 'Start with one question'), buttons: [
        { label: T('¿Cuánto me queda?', 'How much is left?'), pick: 'unsure' }, { label: T('¿Cuándo me pagan?', 'When am I paid?'), pick: 'payday' }] }
    }
  };

  D11.matters = {
    id: 'matters', type: 'choice', optional: true,
    title: V4('¿Qué diferencia te importa más?', 'Which difference matters most to you?'),
    body: V4('Opcional: usa tus propias opciones.', 'Optional: use your own options.'),
    options: [
      { id: 'money', label: V4('El dinero que queda', 'Money left'), reply: P('d11.m.money', 'Authored reply', 'Los dos dejan 40, así que el dinero no los distingue. Hay que mirar lo demás.', 'Both leave 40, so money does not tell them apart. Look at the rest.') },
      { id: 'time', label: V4('El tiempo o los cuidados', 'Time or care needs'), reply: P('d11.m.time', 'Authored reply', 'B usa 6 horas y A usa 10. Si cuidas a alguien, esas 4 horas pesan; no se pagan, pero cuentan.', 'B uses 6 hours and A uses 10. If you care for someone, those 4 hours matter; they are not paid, but they count.') },
      { id: 'date', label: V4('La fecha de pago', 'Payment date'), reply: P('d11.m.date', 'Authored reply', 'Una fecha desconocida es una pregunta pendiente. Preguntarla antes de decidir cuesta poco.', 'An unknown date is an open question. Asking it before deciding costs little.') },
      { id: 'cert', label: V4('Qué tan seguro es', 'Certainty'), reply: P('d11.m.cert', 'Authored reply', 'A tiene fecha de pago; B no. Con B, la pregunta es cuándo y cómo se paga.', 'A has a payday; B does not. With B, the question is when and how it is paid.') },
      { id: 'other', other: true, label: V4('Otra cosa', 'Something else'), reply: P('d11.m.other', 'Authored reply', 'Anotado. Eso también se puede comparar entre las dos.', 'Noted. That can be compared between the two as well.') }
    ],
    otherPlaceholder: P('d11.m.ph', 'Placeholder', 'Qué sería', 'What it would be'),
    help: {
      explain: P('d11.m.h1', 'Help', 'No hay una respuesta correcta: depende de tu semana. Elige lo que más te costaría perder.', 'There is no right answer: it depends on your week. Pick what you would find hardest to lose.'),
      example: P('d11.m.h2', 'Help', 'Quien cuida a alguien suele valorar el tiempo; quien tiene un pago cerca suele valorar la fecha.', 'Someone who cares for another person often values time; someone with a payment close by often values the date.')
    }
  };

  D11.teach = {
    id: 'teach', type: 'read',
    title: V4('Los dos dejan 40.', 'Both leave 40.'),
    body: V4('A toma 10 horas: 4 por hora. B toma 6: unos 6.67. No se sabe qué día paga B, así que una cifra más alta por hora no decide la elección. Compara costos, tiempo total, fechas y si encaja con lo demás que haces. Un costo que no conoces no es cero.', 'A uses 10 hours: 4 an hour. B uses 6: about 6.67. B\'s payday is unknown, so a higher hourly figure doesn\'t settle the choice. Compare costs, total time, dates, and fit. Unknown costs aren\'t zero.')
  };

  D11.ask = {
    id: 'ask', type: 'ask', optional: true,
    title: P('d11.ask.title', 'REWRITE of V4 takeaway field "Pregunta antes de decidir" into a choice + editable message', '¿Qué preguntarías antes de decidir?', 'What would you ask before deciding?'),
    body: P('d11.ask.body', 'ADDED', 'Elige hasta tres. Armamos un mensaje corto que puedes editar. No tienes que enviarlo.', 'Pick up to three. We build a short message you can edit. You do not have to send it.'),
    qs: [
      { id: 'pay', label: P('d11.ask.q1', 'Question', '¿Cuándo y cómo se paga?', 'When and how is it paid?'), line: P('d11.ask.l1', 'Message line', '¿Cuándo y cómo se paga?', 'When and how is it paid?') },
      { id: 'costs', label: P('d11.ask.q2', 'Question', '¿Hay costos por mi parte?', 'Are there costs on my side?'), line: P('d11.ask.l2', 'Message line', '¿Hay algún costo por mi parte?', 'Are there any costs on my side?') },
      { id: 'hours', label: P('d11.ask.q3', 'Question', '¿Cuántas horas son en total?', 'How many hours in total?'), line: P('d11.ask.l3', 'Message line', '¿Cuántas horas serían en total, contando el traslado?', 'How many hours would it be in total, including travel?') },
      { id: 'terms', label: P('d11.ask.q4', 'Question', '¿Qué pasa si cambia el horario?', 'What if the schedule changes?'), line: P('d11.ask.l4', 'Message line', '¿Qué pasa si cambia el horario?', 'What happens if the schedule changes?') }
    ],
    greet: P('d11.ask.greet', 'Message template, adapted from the V4 Day 12 payment template', 'Hola, antes de decidir quisiera confirmar:', 'Hello, before I decide I would like to confirm:'),
    bye: P('d11.ask.bye', 'Message template', 'Gracias.', 'Thank you.'),
    msgLabel: P('d11.ask.msg', 'Label', 'Tu mensaje (puedes editarlo)', 'Your message (you can edit it)'),
    copy: P('d11.ask.copy', 'Button', 'Copiar mensaje', 'Copy message'),
    copied: P('d11.ask.copied', 'Status', 'Copiado. No se envió a nadie.', 'Copied. Nothing was sent to anyone.'),
    empty: P('d11.ask.empty', 'Hint when nothing chosen', 'Elige una pregunta y aquí aparece el mensaje.', 'Choose a question and the message appears here.'),
    reply: P('d11.ask.reply', 'Authored reply', 'Una pregunta concreta se contesta más fácil que una general. Si contactar no se siente seguro, puedes dejar el mensaje preparado sin enviarlo.', 'A specific question is easier to answer than a general one. If contacting does not feel safe, you can leave the message prepared and not send it.'),
    help: {
      explain: P('d11.ask.h1', 'Help', 'Elige las preguntas cuya respuesta cambiaría tu decisión. Con una basta.', 'Pick the questions whose answer would change your decision. One is enough.'),
      example: P('d11.ask.h2', 'Help', 'Para B, la más útil es “¿Cuándo y cómo se paga?”, porque es lo que no se sabe.', 'For B, the most useful one is “When and how is it paid?”, because that is what is unknown.'),
      smaller: { label: P('d11.ask.h3', 'Help', 'Solo una pregunta', 'Just one question'), buttons: [{ label: T('¿Cuándo y cómo se paga?', 'When and how is it paid?'), setq: ['pay'] }] }
    }
  };

  D11.carry = {
    id: 'carry', type: 'carry', optional: true,
    title: P('d11.carry.title', 'REWRITE of "What consideration would you like to remember for your next money decision?"', '¿Qué vas a revisar antes de tu próxima decisión de dinero?', 'What will you check before your next money decision?'),
    body: P('d11.carry.body', 'ADDED', 'Una frase basta. También puedes elegir una de estas.', 'One sentence is enough. You can also pick one of these.'),
    placeholder: P('d11.carry.ph', 'Placeholder', 'Antes de decidir, reviso…', 'Before deciding, I check…'),
    chips: [
      { id: 'payday', label: P('d11.carry.c1', 'Chip', 'El día de pago', 'The payday') },
      { id: 'costs', label: P('d11.carry.c2', 'Chip', 'Los costos', 'The costs') },
      { id: 'time', label: P('d11.carry.c3', 'Chip', 'El tiempo total', 'The total time') },
      { id: 'who', label: P('d11.carry.c4', 'Chip', 'Quién ofrece', 'Who is offering') }
    ],
    chipReply: P('d11.carry.rchip', 'Authored reply', 'Es algo que puedes comprobar antes de decidir. Si se te olvida, vuelve a esta lista.', 'That is something you can check before deciding. If you forget, come back to this list.'),
    saved: P('d11.carry.saved', 'Fallback for free text (not interpreted)', 'Anotado con tus palabras.', 'Noted in your words.'),
    retry: P('d11.carry.retry', 'Retry invitation', 'Eso no parece algo para revisar. ¿Quieres intentarlo otra vez, o seguir sin escribir?', 'That does not look like something to check. Want to try again, or move on without writing?'),
    clar: {
      q: P('d11.carry.cq', 'Optional clarification, offered at most once and only when the text reads as a feeling', 'Gracias por decirlo. ¿Qué se siente raro: la pregunta, pensar en dinero u otra cosa?', 'Thanks for saying so. What feels off: the question, thinking about money, or something else?'),
      options: [
        { id: 'question', label: P('d11.carry.cq1', 'Option', 'La pregunta no se entiende', 'The question is confusing') },
        { id: 'money', label: P('d11.carry.cq2', 'Option', 'Pensar en dinero', 'Thinking about money') },
        { id: 'else', label: P('d11.carry.cq3', 'Option', 'Otra cosa', 'Something else') },
        { id: 'move', label: P('d11.carry.cq4', 'Option', 'Prefiero seguir', 'I would rather move on') }
      ],
      rQuestion: P('d11.carry.rq', 'Authored reply: rephrase', 'Otra forma: antes de aceptar o gastar, ¿qué dato mirarías? Por ejemplo, la fecha de pago, el costo total o quién cobra.', 'Another way to ask it: before accepting or spending, which fact would you look at? For example the payday, the total cost, or who is charging.'),
      rMoney: P('d11.carry.rm', 'Authored reply: neutral', 'Es común que pensar en dinero incomode. No hace falta resolver nada hoy. Puedes elegir una sola cosa pequeña, o dejarlo aquí por hoy.', 'It is common for thinking about money to be uncomfortable. Nothing has to be solved today. You can pick one small thing, or leave it here for today.'),
      rElse: P('d11.carry.re', 'Authored reply', 'Gracias. Lo dejo guardado como lo escribiste; no hace falta explicarlo.', 'Thank you. I keep it as you wrote it; you do not need to explain.'),
      rMove: P('d11.carry.rv', 'Authored reply', 'Está bien. Seguimos.', 'That is fine. Moving on.'),
      pause: P('d11.carry.pause', 'Button', 'Dejarlo aquí por hoy', 'Leave it here for today'),
      small: P('d11.carry.small', 'Button', 'Elegir una cosa pequeña', 'Pick one small thing'),
      second: P('d11.carry.second', 'Shown if it happens again; no second clarification', 'Gracias por decirlo. Lo dejamos aquí; puedes seguir o pausar cuando quieras.', 'Thank you for saying so. We leave it here; you can continue or pause whenever you want.')
    },
    help: {
      explain: P('d11.carry.h1', 'Help', 'Piensa en una decisión que viene: aceptar un trabajo, pagar algo, prestar dinero. ¿Qué dato mirarías primero?', 'Think of an upcoming decision: accepting a job, paying for something, lending money. Which fact would you look at first?'),
      example: P('d11.carry.h2', 'Help', 'Por ejemplo: “Reviso cuándo me pagan y si hay costos”.', 'For example: “I check when I get paid and whether there are costs.”')
    }
  };

  /* Shared pieces */
  var DATE = {
    confirmed: P('date.confirmed', 'Date widget', 'Fecha confirmada', 'Confirmed date'),
    approx: P('date.approx', 'Date widget', 'Aproximada', 'Approximate'),
    unknown: P('date.unknown', 'Date widget', 'No la sé', 'I don\'t know'),
    pick: P('date.pick', 'Date widget', 'Elige el día', 'Pick the day'),
    bad: P('date.bad', 'Validation message', 'Elige una fecha válida del calendario.', 'Choose a valid date from the calendar.'),
    far: P('date.far', 'Validation message', 'Esa fecha queda lejos. Revisa el año.', 'That date is far away. Check the year.'),
    windows: [
      { id: 'week', label: P('date.w1', 'Window', 'Esta semana', 'This week') },
      { id: 'next', label: P('date.w2', 'Window', 'La próxima semana', 'Next week') },
      { id: 'weeks', label: P('date.w3', 'Window', 'En 2 a 4 semanas', 'In 2 to 4 weeks') },
      { id: 'later', label: P('date.w4', 'Window', 'Más adelante', 'Later') }
    ],
    unknownNote: P('date.unknownnote', 'Note', 'Se queda como desconocida. No cuenta como cero.', 'It stays unknown. It does not count as zero.'),
    approxNote: P('date.approxnote', 'Note', 'Se queda como aproximada, no como fecha segura.', 'It stays approximate, not a certain date.')
  };
  var AMT = {
    bad: P('amt.bad', 'Validation message', 'Escribe un número, por ejemplo 120 o 85.50.', 'Enter a number, for example 120 or 1,250.50.'),
    cur: P('amt.cur', 'Optional currency field', 'Moneda (opcional)', 'Currency (optional)'),
    noneAns: P('amt.none', 'Amount helper', 'Déjalo en blanco si no lo sabes.', 'Leave it blank if you do not know.')
  };

  window.MJ2 = { T: T, COMMON: COMMON, D: { 4: D4, 11: D11 }, DATE: DATE, AMT: AMT, PROPOSED: PROPOSED };
})();
