/* Week 6 · North America · Purpose & growth.
   PROPOSED copy (draft, pending Alejandra's review). Spanish first, English beside it.
   Each step: one question, short options, one quieter "soft" option, and a reply of at most two sentences.
   `note` is how the answer reads in the end-of-day note ({a} = her answer). */
(function () {
  function T(es, en) { return { es: es, en: en }; }
  window.NA = [
    {
      place: T('Lago Moraine', 'Moraine Lake'),
      title: T('Lo que te llama', 'What pulls you'),
      intro: T('Agua quieta antes de moverse. Esta semana es sobre hacia dónde quieres ir; hoy solo notamos qué te llama.', 'Still water before anything moves. This week is about where you want to go; today we only notice what pulls you.'),
      steps: [
        { id: 'pull', title: T('Cuando piensas en los próximos meses, ¿qué te llama más?', 'When you think about the next few months, what pulls you most?'),
          options: [T('Un trabajo que tenga más sentido', 'Work that means more'), T('Aprender algo nuevo', 'Learning something new'), T('Cambiar cómo uso mi tiempo', 'Changing how I use my time'), T('Terminar algo que dejé a medias', 'Finishing something I left halfway')],
          soft: T('No lo sé todavía', 'I don’t know yet'),
          replies: [T('Un trabajo con más sentido. Esta semana vemos qué significa eso para ti, en concreto.', 'Work that means more. This week we look at what that means for you, concretely.'), T('Aprender algo nuevo. Más adelante eliges qué y cuánto tiempo le das.', 'Learning something new. Later you choose what, and how much time it gets.'), T('Tu tiempo. Primero miramos a dónde se va, antes de cambiar nada.', 'Your time. First we look at where it goes, before changing anything.'), T('Algo a medias. Volver a algo que ya empezaste también es avanzar.', 'Something halfway. Going back to something you started is also moving forward.')],
          softReply: T('Está bien no saberlo. Esta semana sirve justo para eso.', 'It’s fine not to know. This week is for exactly that.'),
          note: T('lo que más te llama es: {a}', 'what pulls you most is: {a}') },
        { id: 'when', title: T('¿Cuándo lo sentiste con claridad por última vez?', 'When did you last feel it clearly?'),
          options: [T('Esta semana', 'This week'), T('Este mes', 'This month'), T('Hace tiempo', 'A while ago')],
          soft: T('No lo recuerdo', 'I don’t remember'),
          replies: [T('Está reciente, y eso ayuda: lo tienes cerca.', 'It’s recent, and that helps: it’s close.'), T('Este mes. Todavía está fresco.', 'This month. It’s still fresh.'), T('Hace tiempo, y sigue ahí. Eso dice algo.', 'A while ago, and it’s still there. That says something.')],
          softReply: T('No pasa nada. Lo iremos notando.', 'That’s fine. We’ll notice it as we go.'),
          note: T('la última vez que lo sentiste claro fue {a}', 'you last felt it clearly {a}') },
        { id: 'six', title: T('En pocas palabras, ¿qué te gustaría que fuera distinto en seis meses?', 'In a few words, what would you like to be different in six months?'),
          text: true, placeholder: T('Que mi trabajo…', 'That my work…'),
          ideas: [T('Tener más tiempo para mí', 'Having more time for myself'), T('Sentir que avanzo', 'Feeling that I’m moving forward'), T('Hacer algo que me importe', 'Doing something that matters to me')],
          elara: T('Guardado. Lo volvemos a leer el día 7.', 'Saved. We read it again on day 7.'),
          note: T('en seis meses te gustaría «{a}»', 'in six months you’d like “{a}”') }
      ],
      tomorrow: T('Mañana bajas al valle de Yosemite: miramos dónde estás hoy.', 'Tomorrow you go down into Yosemite Valley: we look at where you are today.')
    },
    {
      place: T('Yosemite', 'Yosemite'),
      title: T('Dónde estás hoy', 'Where you are today'),
      intro: T('Desde el valle se ve todo lo que te rodea. Hoy miramos dónde estás, sin juzgarlo.', 'From the valley you can see everything around you. Today we look at where you are, without judging it.'),
      steps: [
        { id: 'now', title: T('¿Cómo describirías tu trabajo o tu actividad principal ahora?', 'How would you describe your work or main activity right now?'),
          options: [T('Me gusta y quiero crecer ahí', 'I like it and want to grow there'), T('Está bien, pero me falta algo', 'It’s fine, but something is missing'), T('Lo hago porque lo necesito', 'I do it because I need to'), T('Ahora no tengo trabajo', 'I don’t have work right now')],
          soft: T('Prefiero no decirlo', 'I’d rather not say'),
          replies: [T('Te gusta y quieres crecer. Entonces el camino es hacia arriba, no hacia otro lado.', 'You like it and want to grow. Then the path is upward, not elsewhere.'), T('Te falta algo. Hoy intentamos ponerle nombre.', 'Something is missing. Today we try to name it.'), T('Lo necesitas, y esa es razón suficiente. Podemos buscar sentido alrededor.', 'You need it, and that’s reason enough. We can look for meaning around it.'), T('Sin trabajo ahora. Esta semana también sirve: miramos hacia dónde quieres ir.', 'No work right now. This week still works: we look at where you want to go.')],
          softReply: T('Está bien. Puedes seguir sin decirlo.', 'That’s fine. You can carry on without saying.'),
          note: T('hoy tu trabajo es así: {a}', 'right now your work is: {a}') },
        { id: 'gives', title: T('¿Qué parte de tu día te da más energía?', 'Which part of your day gives you the most energy?'),
          options: [T('Ayudar a alguien', 'Helping someone'), T('Resolver un problema', 'Solving a problem'), T('Crear algo', 'Making something'), T('Aprender', 'Learning'), T('Organizar', 'Organising')],
          soft: T('Ninguna por ahora', 'None right now'),
          replies: [T('Ayudar a alguien. Tenlo en cuenta cuando elijas tu paso.', 'Helping someone. Keep it in mind when you choose your step.'), T('Resolver problemas. Eso se lleva a casi cualquier trabajo.', 'Solving problems. That travels to almost any work.'), T('Crear algo. Vale la pena dejarle un rato fijo.', 'Making something. It’s worth giving it a fixed slot.'), T('Aprender. Mañana vemos qué te frena para hacerlo más.', 'Learning. Tomorrow we look at what stops you doing more of it.'), T('Organizar. Mucha gente lo necesita y pocas lo hacen bien.', 'Organising. Many people need it and few do it well.')],
          softReply: T('A veces pasa. Notarlo ya es un dato.', 'That happens sometimes. Noticing it is already useful.'),
          note: T('lo que te da energía es {a}', 'what gives you energy is {a}') },
        { id: 'takes', title: T('¿Y qué te quita más energía?', 'And what takes the most energy?'),
          options: [T('Tareas que se repiten', 'Tasks that repeat'), T('Sentir que no me valoran', 'Feeling undervalued'), T('No tener tiempo', 'Not having time'), T('No saber para qué sirve lo que hago', 'Not knowing what my work is for')],
          soft: T('No lo sé', 'I don’t know'),
          replies: [T('Las repeticiones. Saberlo ayuda a elegir qué cambiar primero.', 'Repetition. Knowing that helps you choose what to change first.'), T('No sentirte valorada. Eso pesa, y es una buena pista.', 'Feeling undervalued. That weighs a lot, and it’s a good clue.'), T('El tiempo. Lo miramos de nuevo mañana.', 'Time. We look at it again tomorrow.'), T('No saber para qué sirve. El día 5 hablamos justo de eso.', 'Not knowing what it’s for. Day 5 is about exactly that.')],
          softReply: T('Está bien. Puede que lo notes en los próximos días.', 'That’s fine. You may notice it in the next few days.'),
          note: T('lo que te la quita es {a}', 'what takes it is {a}') }
      ],
      tomorrow: T('Mañana cruzas el Golden Gate: lo que hay entre hoy y lo siguiente.', 'Tomorrow you cross the Golden Gate: what lies between today and what’s next.')
    },
    {
      place: T('Golden Gate', 'Golden Gate'),
      title: T('Entre hoy y lo siguiente', 'Between today and what’s next'),
      intro: T('Un puente une dos orillas. Hoy vemos qué te frena para cruzar.', 'A bridge joins two shores. Today we look at what stops you crossing.'),
      steps: [
        { id: 'block', title: T('¿Qué te frena más para dar el siguiente paso?', 'What holds you back most from the next step?'),
          options: [T('No tengo tiempo', 'I don’t have time'), T('No tengo dinero para eso', 'I don’t have the money for it'), T('Me da miedo equivocarme', 'I’m afraid of getting it wrong'), T('No sé por dónde empezar', 'I don’t know where to start'), T('Lo que piensen otras personas', 'What other people will think')],
          soft: T('Nada me frena', 'Nothing holds me back'),
          replies: [T('El tiempo. No buscamos horas nuevas, solo una.', 'Time. We aren’t looking for new hours, just one.'), T('El dinero. Vale la pena separar lo que cuesta de lo que es gratis.', 'Money. It’s worth separating what costs from what is free.'), T('Miedo a equivocarte. Un paso pequeño se puede deshacer, y eso baja el riesgo.', 'Fear of getting it wrong. A small step can be undone, and that lowers the risk.'), T('No saber por dónde empezar. Por eso el día 7 termina con un solo paso.', 'Not knowing where to start. That’s why day 7 ends with a single step.'), T('Lo que piensen. Tu primer paso puede ser algo que nadie vea todavía.', 'What others think. Your first step can be something nobody sees yet.')],
          softReply: T('Nada te frena. Entonces vamos directo a qué harías.', 'Nothing holds you back. Then let’s go straight to what you’d do.'),
          note: T('lo que más te frena es: {a}', 'what holds you back most is: {a}') },
        { id: 'first', title: T('Si ese freno fuera un poco más pequeño, ¿qué harías primero?', 'If that block were a little smaller, what would you do first?'),
          text: true, placeholder: T('Buscaría…', 'I would look for…'),
          ideas: [T('Preguntarle a alguien que ya lo hace', 'Ask someone who already does it'), T('Mirar un curso', 'Look at a course'), T('Escribir lo que quiero', 'Write down what I want')],
          elara: T('Eso ya es un primer paso posible. Lo guardamos.', 'That’s already a possible first step. We keep it.'),
          note: T('lo primero que harías es «{a}»', 'the first thing you’d do is “{a}”') },
        { id: 'who', title: T('¿Conoces a alguien que ya haya cruzado ese puente?', 'Do you know someone who has already crossed that bridge?'),
          options: [T('Sí, conozco a alguien', 'Yes, I know someone'), T('Quizás, tengo que pensarlo', 'Maybe, I need to think'), T('No conozco a nadie', 'I don’t know anyone')],
          soft: T('Prefiero hacerlo sola', 'I’d rather do it alone'),
          replies: [T('Bien. Una sola pregunta a esa persona puede ahorrarte meses.', 'Good. One question to that person can save you months.'), T('Piénsalo esta semana. No hace falta decidir hoy.', 'Think about it this week. No need to decide today.'), T('Está bien. Hay personas que cuentan lo que hicieron en libros o en grupos.', 'That’s fine. Some people share what they did in books or groups.')],
          softReply: T('Sola también se puede. Solo procura no cargar con todo.', 'You can do it alone too. Just try not to carry all of it.'),
          note: T('alguien a quien preguntar: {a}', 'someone to ask: {a}') }
      ],
      tomorrow: T('Mañana llegas al Gran Cañón: lo que importa a largo plazo.', 'Tomorrow you reach the Grand Canyon: what matters in the long run.')
    },
    {
      place: T('Gran Cañón', 'Grand Canyon'),
      title: T('Lo que importa a lo lejos', 'What matters far ahead'),
      intro: T('El río tardó millones de años en abrir este cañón. Hoy miramos lo que quieres que dure.', 'The river took millions of years to cut this canyon. Today we look at what you want to last.'),
      steps: [
        { id: 'five', title: T('Dentro de cinco años, ¿qué te gustaría que fuera verdad?', 'Five years from now, what would you like to be true?'),
          options: [T('Hacer un trabajo que me importe', 'Doing work that matters to me'), T('Tener más estabilidad', 'Having more stability'), T('Tener más libertad con mi tiempo', 'Having more freedom with my time'), T('Haber aprendido algo grande', 'Having learned something big'), T('Estar más cerca de mi gente', 'Being closer to my people')],
          soft: T('Es difícil verlo tan lejos', 'It’s hard to see that far'),
          replies: [T('Un trabajo que te importe. Esa es una dirección clara.', 'Work that matters to you. That’s a clear direction.'), T('Estabilidad. Crecer también puede ser sostener mejor lo que ya tienes.', 'Stability. Growing can also mean holding better what you already have.'), T('Libertad con tu tiempo. Cada paso que elijas puede medirse con eso.', 'Freedom with your time. Every step you choose can be measured against that.'), T('Algo grande que aprender. Lo grande empieza con una hora a la semana.', 'Something big to learn. Big things start with an hour a week.'), T('Tu gente. Un buen paso también puede ser llamar a alguien.', 'Your people. A good step can also be calling someone.')],
          softReply: T('Normal. Piensa solo en el año que viene, si te sirve.', 'That’s normal. Think only about next year, if that helps.'),
          note: T('en cinco años te gustaría: {a}', 'in five years you’d like: {a}') },
        { id: 'give', title: T('Para eso, ¿qué estarías dispuesta a dejar un poco?', 'For that, what would you be willing to give up a little?'),
          options: [T('Algo de tiempo libre', 'Some free time'), T('Algo de comodidad', 'Some comfort'), T('Algo de dinero ahora', 'Some money now'), T('Nada por ahora', 'Nothing for now')],
          soft: T('No lo sé', 'I don’t know'),
          replies: [T('Algo de tiempo libre. Que sea poco y con fecha, para que no te agote.', 'Some free time. Keep it small and dated, so it doesn’t wear you out.'), T('Algo de comodidad. Eso suele ser lo que más cambia las cosas.', 'Some comfort. That’s often what changes things most.'), T('Algo de dinero ahora. Antes de gastarlo, mira cuánto y cuándo.', 'Some money now. Before spending it, check how much and when.'), T('Nada por ahora, y está bien. Entonces el paso tiene que caber en lo que ya hay.', 'Nothing for now, and that’s fine. Then the step has to fit what’s already there.')],
          softReply: T('Está bien. Lo verás más claro cuando tengas el paso.', 'That’s fine. It’ll be clearer once you have the step.'),
          note: T('estarías dispuesta a dejar: {a}', 'you’d be willing to give up: {a}') },
        { id: 'build', title: T('Termina la frase: «Lo que quiero construir es…»', 'Finish the sentence: “What I want to build is…”'),
          text: true, placeholder: T('algo que…', 'something that…'),
          elara: T('Esa frase es tu dirección. No tiene que estar perfecta.', 'That sentence is your direction. It doesn’t have to be perfect.'),
          note: T('quieres construir «{a}»', 'you want to build “{a}”') }
      ],
      tomorrow: T('Mañana subes a las azoteas de Manhattan: el trabajo con sentido.', 'Tomorrow you go up to the Manhattan rooftops: work that means something.')
    },
    {
      place: T('Manhattan', 'Manhattan'),
      title: T('El trabajo con sentido', 'Work that means something'),
      intro: T('Desde arriba, la ciudad trabaja. Hoy vemos qué hace que un trabajo valga la pena para ti.', 'From up here, the city is at work. Today we look at what makes work worth it for you.'),
      steps: [
        { id: 'means', title: T('¿Qué haría que un trabajo tuviera sentido para ti?', 'What would make work meaningful for you?'),
          options: [T('Ver que ayudo a alguien', 'Seeing that I help someone'), T('Usar algo que se me da bien', 'Using something I’m good at'), T('Que me paguen lo justo', 'Being paid fairly'), T('Seguir aprendiendo', 'Keep learning'), T('Un horario que pueda sostener', 'Hours I can keep up')],
          soft: T('No lo he pensado', 'I haven’t thought about it'),
          replies: [T('Ayudar a alguien. Busca dónde se nota ese efecto.', 'Helping someone. Look for where that effect shows.'), T('Usar lo que se te da bien. Ahora mismo vemos qué es.', 'Using what you’re good at. We look at what that is next.'), T('Que te paguen lo justo. Eso también es sentido, no solo dinero.', 'Being paid fairly. That’s meaning too, not just money.'), T('Seguir aprendiendo. Un trabajo que te enseña vale más de lo que parece.', 'Keep learning. Work that teaches you is worth more than it looks.'), T('Un horario sostenible. Sin eso, lo demás cuesta el doble.', 'Sustainable hours. Without that, everything else costs double.')],
          softReply: T('Está bien. Puedes pensarlo mientras sigues.', 'That’s fine. You can think about it as you go.'),
          note: T('para ti un trabajo tiene sentido si: {a}', 'for you, work is meaningful if: {a}') },
        { id: 'good', title: T('¿Qué se te da bien, aunque no lo uses en tu trabajo?', 'What are you good at, even if you don’t use it at work?'),
          text: true, placeholder: T('Se me da bien…', 'I’m good at…'),
          ideas: [T('Escuchar', 'Listening'), T('Organizar', 'Organising'), T('Explicar cosas', 'Explaining things'), T('Hacer cuentas', 'Working with numbers'), T('Cuidar de otras personas', 'Looking after people')],
          elara: T('Anotado. Eso se puede llevar a muchos trabajos distintos.', 'Noted. That can go into many different kinds of work.'),
          note: T('se te da bien «{a}»', 'you’re good at “{a}”') },
        { id: 'has', title: T('Hoy, ¿tu trabajo tiene algo de eso?', 'Today, does your work have any of that?'),
          options: [T('Sí, bastante', 'Yes, quite a lot'), T('Un poco', 'A little'), T('Casi nada', 'Hardly any')],
          soft: T('Ahora no tengo trabajo', 'I don’t have work right now'),
          replies: [T('Bastante. Entonces el paso puede ser hacer más de lo que ya funciona.', 'Quite a lot. Then the step can be doing more of what already works.'), T('Un poco. Ese poco es por donde se empieza.', 'A little. That little is where to start.'), T('Casi nada. Eso es importante saberlo antes de elegir tu paso.', 'Hardly any. That’s important to know before choosing your step.')],
          softReply: T('Está bien. Lo que se te da bien sigue siendo tuyo.', 'That’s fine. What you’re good at is still yours.'),
          note: T('tu trabajo hoy tiene eso: {a}', 'your work today has that: {a}') }
      ],
      tomorrow: T('Mañana bajas a la costa de Big Sur: una decisión valiente.', 'Tomorrow you go down to the Big Sur coast: a brave decision.')
    },
    {
      place: T('Big Sur', 'Big Sur'),
      title: T('Una decisión valiente', 'A brave decision'),
      intro: T('La carretera va pegada al acantilado. Hoy hablamos de una decisión que te da un poco de miedo.', 'The road clings to the cliff. Today we talk about a decision that scares you a little.'),
      steps: [
        { id: 'decide', title: T('¿Hay una decisión que llevas tiempo posponiendo?', 'Is there a decision you’ve been putting off?'),
          options: [T('Sí, sobre mi trabajo', 'Yes, about my work'), T('Sí, sobre estudiar algo', 'Yes, about studying something'), T('Sí, sobre cómo uso mi tiempo', 'Yes, about how I use my time'), T('Sí, sobre otra cosa', 'Yes, about something else'), T('No, ahora no', 'No, not right now')],
          soft: T('Prefiero no decirlo', 'I’d rather not say'),
          replies: [T('Sobre tu trabajo. Hoy la hacemos un poco más pequeña.', 'About your work. Today we make it a little smaller.'), T('Sobre estudiar. Vale la pena saber cuánto tiempo y dinero pide de verdad.', 'About studying. It’s worth knowing how much time and money it really takes.'), T('Sobre tu tiempo. Esas decisiones suelen ser más reversibles de lo que parecen.', 'About your time. Those decisions are often more reversible than they seem.'), T('Otra cosa. No hace falta nombrarla para trabajar con ella.', 'Something else. You don’t need to name it to work with it.'), T('Ninguna ahora. Entonces hoy es un buen día para descansar del tema.', 'None right now. Then today is a good day to rest from it.')],
          softReply: T('Está bien. Puedes pensar en ella sin escribirla.', 'That’s fine. You can think of it without writing it.'),
          note: T('una decisión pendiente: {a}', 'a decision you’ve put off: {a}') },
        { id: 'worst', title: T('Si sale mal, ¿qué es lo peor realista que pasaría?', 'If it goes wrong, what is the realistic worst case?'),
          text: true, placeholder: T('Lo peor sería…', 'The worst would be…'),
          elara: T('Escrito así, suele verse más pequeño que en la cabeza.', 'Written down, it usually looks smaller than it does in your head.'),
          note: T('lo peor realista sería «{a}»', 'the realistic worst would be “{a}”') },
        { id: 'undo', title: T('¿Se podría deshacer si no funciona?', 'Could it be undone if it doesn’t work?'),
          options: [T('Sí, fácilmente', 'Yes, easily'), T('Con algo de esfuerzo', 'With some effort'), T('Sería difícil', 'It would be hard')],
          soft: T('No lo sé', 'I don’t know'),
          replies: [T('Si se puede deshacer, el riesgo es más pequeño de lo que parece.', 'If it can be undone, the risk is smaller than it looks.'), T('Con esfuerzo. Conviene saber cuánto antes de decidir.', 'With effort. It’s worth knowing how much before deciding.'), T('Difícil de deshacer. Entonces vale la pena un paso de prueba primero.', 'Hard to undo. Then a trial step first is worth it.')],
          softReply: T('Averiguarlo puede ser tu paso de mañana.', 'Finding out could be tomorrow’s step.'),
          note: T('¿se podría deshacer? {a}', 'could it be undone? {a}') }
      ],
      tomorrow: T('Mañana llegas a la ciudad de Quebec: eliges tu siguiente paso.', 'Tomorrow you reach Quebec City: you choose your next step.')
    },
    {
      place: T('Quebec', 'Quebec'),
      title: T('Tu siguiente paso', 'Your next step'),
      intro: T('Desde la ciudad alta se ve el camino recorrido. Hoy eliges un solo paso.', 'From the upper town you can see the road behind you. Today you choose one step.'),
      steps: [
        { id: 'look', title: T('El día 1 escribiste qué te gustaría que fuera distinto en seis meses.', 'On day 1 you wrote what you’d like to be different in six months.'),
          recall: { d: 1, id: 'six' }, cta: T('Seguir', 'Continue') },
        { id: 'step', title: T('¿Qué paso podrías dar esta semana?', 'What step could you take this week?'),
          options: [T('Preguntarle a alguien', 'Ask someone'), T('Buscar información durante 20 minutos', 'Look things up for 20 minutes'), T('Escribir en una página lo que quiero', 'Write one page about what I want'), T('Apartar una hora en mi calendario', 'Block one hour in my calendar'), T('Hablar con mi jefa o mi jefe', 'Talk to my manager')],
          soft: T('Todavía no', 'Not yet'),
          replies: [T('Una pregunta. Escríbela hoy y envíala cuando estés lista.', 'One question. Write it today and send it when you’re ready.'), T('Veinte minutos. Pon un temporizador y para cuando suene.', 'Twenty minutes. Set a timer and stop when it rings.'), T('Una página. No tiene que estar bien escrita.', 'One page. It doesn’t have to be well written.'), T('Una hora apartada. Ponle nombre en el calendario para que no se la lleve otra cosa.', 'One blocked hour. Name it in your calendar so nothing else takes it.'), T('Hablar con tu jefa o tu jefe. Lleva una sola pregunta, no un discurso.', 'Talk to your manager. Bring one question, not a speech.')],
          softReply: T('Está bien. Tu semana queda guardada y puedes elegir el paso otro día.', 'That’s fine. Your week is saved and you can choose the step another day.'),
          note: T('tu paso de esta semana: {a}', 'your step this week: {a}') },
        { id: 'when', title: T('¿Cuándo lo vas a hacer?', 'When will you do it?'),
          options: [T('Mañana', 'Tomorrow'), T('En dos o tres días', 'In two or three days'), T('Este fin de semana', 'This weekend')],
          soft: T('Aún no lo sé', 'I don’t know yet'),
          replies: [T('Mañana. Bien: así no se enfría.', 'Tomorrow. Good: it won’t cool off.'), T('En dos o tres días. Elige ya cuál, para que no se mueva.', 'In two or three days. Pick which one now, so it doesn’t drift.'), T('Este fin de semana. Que sea una hora concreta, no todo el día.', 'This weekend. Make it a specific hour, not the whole day.')],
          softReply: T('Está bien. Un paso sin fecha sigue siendo tuyo.', 'That’s fine. A step without a date is still yours.'),
          note: T('lo harás: {a}', 'you’ll do it: {a}') }
      ],
      tomorrow: T('Aquí termina Norteamérica. Tu paso queda guardado en tu mapa.', 'North America ends here. Your step stays on your map.')
    }
  ];
})();
