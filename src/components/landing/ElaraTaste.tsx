import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import { Orb, type OrbState } from "../elara/Orb";

/**
 * "Un momento con Elara" — a single, warm taste of Elara's voice on the landing
 * page. The visitor writes one sentence about how they feel today; Elara replies
 * once, gently, then nudges toward the waitlist. This is a *taste*, not a chatbot:
 * one exchange, then a soft CTA.
 *
 * The reply is CANNED (no model call) for safety, cost, and speed. Everything
 * routes through `getElaraReply()` below, which is async on purpose — swapping to
 * a live Sonnet endpoint later means changing only the body of that one function
 * (see the note above it). Nothing else in this component needs to change.
 */

type ElaraReply = {
  /** Elara's short, warm response (1–3 sentences). */
  text: string;
  /** Optional single gentle reflection prompt. Omitted for crisis responses. */
  prompt?: string;
  /** True when the input signalled real distress — surfaces the support card. */
  crisis: boolean;
};

// --- Safety: crisis signals ------------------------------------------------
// Kept deliberately broad. On any match we do NOT try to counsel — we respond
// with warmth and point toward real, human support. Better a false positive
// (a caring message) than a missed one.
const CRISIS_PATTERNS = [
  /\bsuicid/i,
  /quitarme la vida|acabar con (mi vida|todo)|terminar con todo/i,
  /no quiero (seguir|vivir|existir|estar aqu[ií])/i,
  /ya no quiero (seguir|vivir|estar)/i,
  /(hacerme|lastimarme|herirme|da[ñn]arme)/i,
  /me quiero morir|quiero morir(me)?|mejor(no|no) estar/i,
  /no aguanto m[aá]s|no puedo m[aá]s con (la vida|todo|esto) y/i,
  /desaparecer para siempre/i,
];

// --- Theme buckets ---------------------------------------------------------
// Each bucket has a matcher, one or more replies, and a matching reflection
// prompt. First match wins, so order = priority.
type Bucket = {
  key: string;
  test: RegExp;
  replies: string[];
  prompt: string;
};

const BUCKETS: Bucket[] = [
  {
    key: "agotamiento",
    test: /agotad|exhaust|cansad|sin energ|no puedo parar|rendida|quemad|burnout|no doy m[aá]s/i,
    replies: [
      "Eres el punto de apoyo de todos… ¿y quién te sostiene a ti? Por hoy, aunque sea un momento, deja que sea yo.",
      "Sostener todo cansa de una forma que casi nadie ve. No tienes que estar entera para merecer descanso.",
    ],
    prompt: "¿Qué es lo más pequeño que podrías soltar hoy, solo por unas horas?",
  },
  {
    key: "vacio",
    test: /vac[ií]|triste|sola|desconectad|sin sentido|apagad|perdida|no me reconozco|desanimad/i,
    replies: [
      "Vacía es una palabra pesada para cargarla sola. Estoy aquí contigo en esto.",
      "A veces sentirse lejos de una misma no es un fallo. Es una señal de que algo pide atención. Vamos despacio.",
    ],
    prompt: "¿Desde cuándo se siente así? No para resolverlo, solo para nombrarlo.",
  },
  {
    key: "sobrecarga",
    test: /(fue|es) mucho|saturad|desbordad|abrumad|no s[eé] por d[oó]nde|ansiedad|estr[eé]s|demasiad|todo a la vez|en mi cabeza/i,
    replies: [
      "Hoy fue mucho, y está bien. No tienes que sostenerlo todo perfecto para merecer un respiro.",
      "Cuando todo pesa a la vez, no hay que ordenarlo entero. Busquemos un solo lugar pequeño por donde empezar.",
    ],
    prompt: "Si solo una cosa pudiera sentirse más ligera esta semana, ¿cuál sería?",
  },
  {
    key: "dinero",
    test: /dinero|plata|deuda|econ[oó]mic|finanz|gastos|no me alcanza|facturas/i,
    replies: [
      "El dinero rara vez es solo dinero: es seguridad, libertad, la sensación de poder respirar. Que pese tanto tiene sentido.",
      "Cargar la presión económica en silencio agota doble. Aquí lo puedes decir sin adornarlo.",
    ],
    prompt: "¿Qué parte de esto es número, y qué parte es el miedo que lo acompaña?",
  },
  {
    key: "familia",
    test: /familia|mam[aá]|pap[aá]|hijos|hija mayor|todos dependen|expectativ|qu[eé] dir[aá]n|cuidar a/i,
    replies: [
      "Traducir en casa, liderar afuera, sostener a todos: es mucho para un solo cuerpo. Aquí no tienes que traducirte.",
      "Querer a tu familia y querer tu propia vida no se contradicen, aunque a veces tiren en direcciones distintas.",
    ],
    prompt: "¿Dónde termina lo que es tuyo de verdad y empieza lo que cargas por otros?",
  },
  {
    key: "bienestar",
    test: /bien|tranquil|content|feliz|gracias|en paz|mejor|agradecid|esperanz/i,
    replies: [
      "Qué bueno leer eso. Los días suaves también merecen que nos detengamos en ellos.",
      "Me alegra que hoy haya algo de calma. Que no se te escape sin notarlo.",
    ],
    prompt: "¿Qué hizo posible este momento? Vale la pena recordarlo para los días difíciles.",
  },
];


// --- English set ------------------------------------------------------------
// Same behaviour as the Spanish demo: canned replies, broad crisis detection,
// one exchange. Drafts for the team to review in their own voice.
const CRISIS_PATTERNS_EN = [
  /\bsuicid/i,
  /kill myself|end my life|end it all|take my own life/i,
  /(don'?t|do not) want to (go on|live|exist|be here)/i,
  /(hurt|harm|cut) myself/i,
  /want to die|wish i (was|were) dead|better off (dead|without me)/i,
  /can'?t (take|do) (it|this) anymore/i,
  /disappear (forever|for good)/i,
];

const BUCKETS_EN: Bucket[] = [
  {
    key: "exhaustion",
    test: /exhaust|tired|drained|burn(ed|t)? ?out|no energy|can'?t stop|running on empty|worn out/i,
    replies: [
      "You are everyone's support… and who holds you up? For today, even for a moment, let it be me.",
      "Holding everything is tiring in a way almost no one sees. You don't have to be whole to deserve rest.",
    ],
    prompt: "What is the smallest thing you could put down today, even for a few hours?",
  },
  {
    key: "empty",
    test: /empty|sad|lonely|alone|disconnected|numb|lost|don'?t recognize myself|discouraged/i,
    replies: [
      "Empty is a heavy word to carry alone. I'm here with you in this.",
      "Sometimes feeling far from yourself isn't a failure. It's a sign that something is asking for attention. We'll go slowly.",
    ],
    prompt: "How long has it felt this way? Not to fix it, just to name it.",
  },
  {
    key: "overwhelm",
    test: /(was|is|so) much|overwhelm|too much|swamped|anxious|anxiety|stress|don'?t know where to start|everything at once|in my head/i,
    replies: [
      "Today was a lot, and that's okay. You don't have to hold it all perfectly to deserve a breath.",
      "When everything weighs at once, you don't have to sort it all out. Let's find one small place to begin.",
    ],
    prompt: "If only one thing could feel lighter this week, which would it be?",
  },
  {
    key: "money",
    test: /money|debt|financ|bills|rent|afford|paycheck|broke|expenses/i,
    replies: [
      "Money is rarely just money: it's safety, freedom, the feeling of being able to breathe. It makes sense that it weighs so much.",
      "Carrying money pressure in silence is tiring twice over. You can say it plainly here.",
    ],
    prompt: "Which part of this is a number, and which part is the fear that comes with it?",
  },
  {
    key: "family",
    test: /family|mom|mother|dad|father|kids|children|eldest|everyone depends|what will they say|caring for/i,
    replies: [
      "Translating at home, leading outside, holding everyone up: that is a lot for one body. You don't have to translate yourself here.",
      "Loving your family and wanting your own life don't contradict each other, even when they pull in different directions.",
    ],
    prompt: "Where does what is truly yours end, and what you carry for others begin?",
  },
  {
    key: "well",
    test: /good|calm|happy|thank|at peace|better|grateful|hopeful|okay|fine/i,
    replies: [
      "So good to read that. Soft days deserve a pause too.",
      "I'm glad there is some calm today. Don't let it slip by unnoticed.",
    ],
    prompt: "What made this moment possible? It's worth remembering for the harder days.",
  },
];

const DEFAULT_REPLIES_EN = [
  "Thank you for saying it out loud. You don't have to perform here. You can just be you.",
  "I read you. Whatever you're carrying today, you don't have to carry it alone right now.",
];

const SUPPORT_TEXT_EN =
  "What you are carrying sounds very heavy, and I'm glad you said it. You shouldn't go through this alone: please reach out to someone you trust or to a professional who can be close to you.";

const EXAMPLES_EN = [
  "today was a lot…",
  "i'm exhausted but i can't stop",
  "i don't know where to start",
  "fine on the outside, not so much inside",
];

type TasteLang = "es" | "en";
const UI = {
  es: {
    eyebrow: "Un momento con Elara",
    title: "Escríbele a Elara cómo te sientes hoy.",
    lead: "Una frase basta. Elara no te va a arreglar ni a darte tareas, solo quiere leerte. Esto es apenas una pequeña muestra de su voz.",
    label: "Cuéntale a Elara cómo te sientes hoy",
    withYou: "Elara está contigo…",
    private: "Privado. Una sola respuesta.",
    reading: "Elara te está leyendo…",
    send: "Enviar a Elara",
    replying: "Elara está respondiendo",
    emergency: "Si estás en peligro inmediato, contacta ahora mismo a los servicios de emergencia de tu país. No estás sola en esto.",
    stay: "Para quedarte un momento con esto",
    more: "Hay más dentro de Elara",
    crisisCta: "Conoce Elara cuando estés lista",
    again: "Escribir otra vez",
    fallbackPrompt: "¿Qué necesitarías escuchar hoy que nadie te ha dicho?",
    note: "Elara no es terapia ni un servicio médico. Es una compañera para acompañarte, no para diagnosticar.",
    cta: "#lista",
  },
  en: {
    eyebrow: "A moment with Elara",
    title: "Tell Elara how you feel today.",
    lead: "One sentence is enough. Elara won't fix you or hand you tasks, she just wants to read you. This is only a small taste of her voice.",
    label: "Tell Elara how you feel today",
    withYou: "Elara is with you…",
    private: "Private. One reply only.",
    reading: "Elara is reading you…",
    send: "Send to Elara",
    replying: "Elara is replying",
    emergency: "If you are in immediate danger, contact your local emergency services right now. You are not alone in this.",
    stay: "To stay with this for a moment",
    more: "There's more inside Elara",
    crisisCta: "Meet Elara when you're ready",
    again: "Write again",
    fallbackPrompt: "What would you need to hear today that no one has told you?",
    note: "Elara is not therapy or a medical service. She is a companion, not a diagnosis.",
    cta: "#waitlist",
  },
} as const;

const DEFAULT_REPLIES = [
  "Gracias por decirlo en voz alta. Aquí no tienes que actuar. Puedes ser tú.",
  "Te leo. Sea lo que sea que traes hoy, no tienes que cargarlo sola en este momento.",
];

const SUPPORT_TEXT =
  "Lo que estás cargando suena muy pesado, y me importa que lo hayas dicho. No deberías pasar por esto sola: por favor busca a alguien de confianza o a un profesional que pueda acompañarte de cerca ahora mismo. Yo soy solo una pequeña muestra, y tú mereces apoyo real.";

/** Deterministic pick so SSR and client agree (no Math.random hydration drift). */
function pick(list: string[], seed: number): string {
  return list[seed % list.length];
}

/**
 * The one seam for going live. To use Sonnet later, replace this function body
 * with a POST to a Worker route (e.g. /api/elara-taste) that calls the Anthropic
 * API with Elara's system prompt AND runs the same CRISIS_PATTERNS server-side.
 * Keep the ElaraReply shape and every caller stays untouched.
 */
async function getElaraReply(input: string, lang: TasteLang = "es"): Promise<ElaraReply> {
  const text = input.trim();
  const seed = text.length; // stable, no randomness

  const en = lang === "en";
  // Spanish patterns also run on the English page: a woman may write in either.
  if (CRISIS_PATTERNS.some((p) => p.test(text)) || (en && CRISIS_PATTERNS_EN.some((p) => p.test(text)))) {
    return { text: en ? SUPPORT_TEXT_EN : SUPPORT_TEXT, crisis: true };
  }

  const bucket = (en ? BUCKETS_EN : BUCKETS).find((b) => b.test.test(text));
  if (bucket) {
    return { text: pick(bucket.replies, seed), prompt: bucket.prompt, crisis: false };
  }

  return {
    text: pick(en ? DEFAULT_REPLIES_EN : DEFAULT_REPLIES, seed),
    prompt: UI[lang].fallbackPrompt,
    crisis: false,
  };
}

// --- Typed placeholder examples (frontend-only animation) ------------------
const EXAMPLES = [
  "hoy fue mucho…",
  "estoy agotada pero no puedo parar",
  "no sé por dónde empezar",
  "por fuera bien, por dentro no tanto",
];

function useTypedPlaceholder(active: boolean, EXAMPLES: readonly string[]): string {
  const [text, setText] = useState(EXAMPLES[0]);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setText(EXAMPLES[0]);
      return;
    }

    let phrase = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = EXAMPLES[phrase];
      char += deleting ? -1 : 1;
      setText(full.slice(0, char));

      let delay = deleting ? 35 : 55;
      if (!deleting && char === full.length) {
        deleting = true;
        delay = 1900; // hold the finished line
      } else if (deleting && char === 0) {
        deleting = false;
        phrase = (phrase + 1) % EXAMPLES.length;
        delay = 350;
      }
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 1400);
    return () => clearTimeout(timer);
  }, [active, EXAMPLES]);

  return text;
}

export function ElaraTaste({ lang = "es" }: { lang?: TasteLang }) {
  const u = UI[lang];
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<ElaraReply | null>(null);
  const [thinking, setThinking] = useState(false);
  const [focused, setFocused] = useState(false);

  // Typed examples run only while the field is empty and unfocused.
  const placeholder = useTypedPlaceholder(!focused && input.length === 0 && reply === null, lang === "en" ? EXAMPLES_EN : EXAMPLES);

  const orbState: OrbState = reply
    ? "replied"
    : thinking
      ? "thinking"
      : focused || input.trim().length > 0
        ? "listening"
        : "idle";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    setThinking(true);
    setReply(null);
    // A brief, human pause — Elara "taking it in" before answering.
    await new Promise((r) => setTimeout(r, 750));
    const result = await getElaraReply(text, lang);
    setReply(result);
    setThinking(false);
  }

  function reset() {
    setReply(null);
    setInput("");
    setThinking(false);
  }

  return (
    /*
      The "Ask Elara" brand moment (Paper at dusk §07): dark forest paper, the
      painted orb with its warm glow, Elara's voice in Fraunces italic and one
      terracotta action. One focus on this screen.
    */
    <section id={lang === "es" ? "elara" : "ask-elara"} className="e-field on-field relative overflow-hidden py-12 sm:py-16">
      <div className="mx-auto w-full max-w-2xl px-5 text-center sm:px-8">
        <Reveal>
          <div className="flex justify-center">
            <Orb state={orbState} size={132} glow />
          </div>
          <p className="e-eyebrow mt-10">{u.eyebrow}</p>
          <h2 className="e-h1 mt-4">{u.title}</h2>
          <p className="e-body mx-auto mt-4 max-w-xl">{u.lead}</p>
        </Reveal>

        <Reveal delay={70}>
          <form onSubmit={onSubmit} className="mt-10 text-left">
            <label htmlFor="elara-input" className="sr-only">{u.label}</label>
            <textarea
              id="elara-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={240}
              rows={2}
              disabled={thinking}
              placeholder={placeholder}
              className="e-input"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="e-caption">
                {thinking ? u.withYou : u.private}
              </span>
              {/* On dark paper the one warm action is terracotta. */}
              <button
                type="submit"
                disabled={thinking || input.trim().length === 0}
                className="e-btn e-btn--onfield e-btn--compact"
              >
                {thinking ? u.reading : u.send}
              </button>
            </div>
          </form>

          {thinking && (
            <p className="sr-only" role="status" aria-live="polite">{u.replying}</p>
          )}

          {reply && (
            <div className="e-arrive mt-8 text-left" aria-live="polite">
              <div className="e-inset-dark flex gap-4 p-5 sm:p-6">
                <Orb size={36} className="mt-1" />
                <div className="min-w-0">
                  {reply.crisis ? (
                    /* Safety copy stays upright and plain: clarity over voice. */
                    <>
                      <p className="text-[1.125rem] font-medium leading-relaxed">{reply.text}</p>
                      <p className="e-body mt-3">{u.emergency}</p>
                    </>
                  ) : (
                    <>
                      {/* Elara speaking: Fraunces italic, the system's only italic. */}
                      <p className="e-voice">{reply.text}</p>
                      <p className="e-eyebrow mt-3">
                        Elara
                      </p>
                    </>
                  )}
                </div>
              </div>

              {!reply.crisis && reply.prompt && (
                <div className="e-arrive-late mt-4 rounded-[20px] border border-[var(--hairline-on-field)] px-5 py-5 sm:px-6">
                  <p className="e-eyebrow">{u.stay}</p>
                  <p className="e-voice mt-2.5">{reply.prompt}</p>
                </div>
              )}

              <div className="e-arrive-late mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href={u.cta} className="e-btn e-btn--ghostfield e-btn--compact">
                  {reply.crisis ? u.crisisCta : u.more}
                </a>
                <button type="button" onClick={reset} className="e-textlink text-[1rem]">{u.again}</button>
              </div>
            </div>
          )}

          <p className="e-caption mt-8">{u.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
