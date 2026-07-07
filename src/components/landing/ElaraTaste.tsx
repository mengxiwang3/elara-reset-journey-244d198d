import { useEffect, useRef, useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { Reveal } from "./Reveal";

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
      "A veces sentirse lejos de una misma no es un fallo — es una señal de que algo pide atención. Vamos despacio.",
    ],
    prompt: "¿Desde cuándo se siente así? No para resolverlo — solo para nombrarlo.",
  },
  {
    key: "sobrecarga",
    test: /(fue|es) mucho|saturad|desbordad|abrumad|no s[eé] por d[oó]nde|ansiedad|estr[eé]s|demasiad|todo a la vez|en mi cabeza/i,
    replies: [
      "Hoy fue mucho — y está bien. No tienes que sostenerlo todo perfecto para merecer un respiro.",
      "Cuando todo pesa a la vez, no hay que ordenarlo entero. Busquemos un solo lugar pequeño por donde empezar.",
    ],
    prompt: "Si solo una cosa pudiera sentirse más ligera esta semana, ¿cuál sería?",
  },
  {
    key: "dinero",
    test: /dinero|plata|deuda|econ[oó]mic|finanz|gastos|no me alcanza|facturas/i,
    replies: [
      "El dinero rara vez es solo dinero — es seguridad, libertad, la sensación de poder respirar. Que pese tanto tiene sentido.",
      "Cargar la presión económica en silencio agota doble. Aquí lo puedes decir sin adornarlo.",
    ],
    prompt: "¿Qué parte de esto es número, y qué parte es el miedo que lo acompaña?",
  },
  {
    key: "familia",
    test: /familia|mam[aá]|pap[aá]|hijos|hija mayor|todos dependen|expectativ|qu[eé] dir[aá]n|cuidar a/i,
    replies: [
      "Traducir en casa, liderar afuera, sostener a todos — es mucho para un solo cuerpo. Aquí no tienes que traducirte.",
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

const DEFAULT_REPLIES = [
  "Gracias por decirlo en voz alta. Aquí no tienes que actuar — puedes ser tú.",
  "Te leo. Sea lo que sea que traes hoy, no tienes que cargarlo sola en este momento.",
];

const SUPPORT_TEXT =
  "Lo que estás cargando suena muy pesado, y me importa que lo hayas dicho. No deberías pasar por esto sola: por favor busca a alguien de confianza o a un profesional que pueda acompañarte de cerca ahora mismo. Yo soy solo una pequeña muestra — tú mereces apoyo real.";

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
async function getElaraReply(input: string): Promise<ElaraReply> {
  const text = input.trim();
  const seed = text.length; // stable, no randomness

  if (CRISIS_PATTERNS.some((p) => p.test(text))) {
    return { text: SUPPORT_TEXT, crisis: true };
  }

  const bucket = BUCKETS.find((b) => b.test.test(text));
  if (bucket) {
    return { text: pick(bucket.replies, seed), prompt: bucket.prompt, crisis: false };
  }

  return {
    text: pick(DEFAULT_REPLIES, seed),
    prompt: "¿Qué necesitarías escuchar hoy que nadie te ha dicho?",
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

function useTypedPlaceholder(active: boolean): string {
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
  }, [active]);

  return text;
}

type ElaraOrbState = "idle" | "listening" | "thinking" | "replied";

/**
 * Elara's visual presence — a small breathing orb that shifts through
 * idle / listening / thinking / replied so the exchange feels like it's
 * with someone. Purely decorative (state is echoed in text for
 * prefers-reduced-motion and screen readers).
 */
function ElaraOrb({ state }: { state: ElaraOrbState }) {
  return (
    <span className={`elara-orb elara-orb--${state}`} aria-hidden>
      <span className="elara-orb-halo" />
      <span className="elara-orb-ring" />
      <span className="elara-orb-core" />
    </span>
  );
}

export function ElaraTaste() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<ElaraReply | null>(null);
  const [thinking, setThinking] = useState(false);
  const [focused, setFocused] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Typed examples run only while the field is empty and unfocused.
  const placeholder = useTypedPlaceholder(!focused && input.length === 0 && reply === null);

  const orbState: ElaraOrbState = reply
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
    const result = await getElaraReply(text);
    setReply(result);
    setThinking(false);
  }

  function reset() {
    setReply(null);
    setInput("");
    setThinking(false);
  }

  return (
    <section id="elara" className="py-20 sm:py-28">
      <Reveal className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">Un momento con Elara</p>
        <h2 className="mt-4 font-serif text-3xl sm:text-5xl text-foreground text-balance leading-[1.08]">
          Escríbele a Elara cómo te sientes hoy.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
          Una frase basta. Elara no te va a arreglar ni a darte tareas — solo quiere leerte. Esto es
          apenas una pequeña muestra de su voz.
        </p>
      </Reveal>

      <Reveal delay={80} className="mt-10 max-w-xl mx-auto px-5 sm:px-8">
        <div
          ref={cardRef}
          className="cta-glow relative rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-card"
        >
          <div className="mb-4 flex items-center gap-2.5">
            <ElaraOrb state={orbState} />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {thinking ? "Elara está contigo…" : "Elara"}
            </span>
          </div>
          <form onSubmit={onSubmit}>
            <label htmlFor="elara-input" className="sr-only">
              Cuéntale a Elara cómo te sientes hoy
            </label>
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
              className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3.5 text-base text-foreground leading-relaxed outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60 disabled:opacity-60"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5 text-accent/70" aria-hidden />
                Privado. Una sola respuesta.
              </span>
              <button
                type="submit"
                disabled={thinking || input.trim().length === 0}
                className="btn-tactile group inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-soft hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {thinking ? "Elara te está leyendo…" : "Enviar a Elara"}
                {!thinking && (
                  <span
                    className="text-accent group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-[color,transform] duration-300"
                    aria-hidden
                  >
                    →
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Thinking state is carried by the orb + header label above — no separate indicator needed */}
          {thinking && (
            <p className="sr-only" role="status" aria-live="polite">
              Elara está respondiendo
            </p>
          )}

          {/* Elara's reply blooms open */}
          {reply && (
            <div className="elara-bloom mt-5" aria-live="polite">
              <div
                className={`rounded-2xl border p-5 ${
                  reply.crisis
                    ? "border-accent/40 bg-accent/5"
                    : "border-border/70 bg-gradient-warm"
                }`}
              >
                <p className="font-serif text-xl sm:text-2xl text-foreground leading-snug text-balance">
                  {reply.text}
                </p>

                {reply.crisis ? (
                  <p className="elara-rise mt-4 text-sm text-muted-foreground leading-relaxed">
                    Si estás en peligro inmediato, contacta ahora mismo a los servicios de
                    emergencia de tu país. No estás sola en esto.
                  </p>
                ) : (
                  reply.prompt && (
                    <div className="elara-rise mt-4 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Para quedarte un momento con esto
                      </p>
                      <p className="mt-1.5 font-serif italic text-lg text-foreground leading-snug">
                        {reply.prompt}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="elara-rise mt-5 flex flex-wrap items-center justify-between gap-3">
                <a
                  href="#lista"
                  className="btn-tactile group inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-soft hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card transition-colors"
                >
                  {reply.crisis ? "Conoce Elara cuando estés lista" : "Los 7 días van más profundo"}
                  <ArrowRight
                    className="h-4 w-4 text-accent group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-[color,transform] duration-300"
                    aria-hidden
                  />
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition"
                >
                  Escribir otra vez
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground/80 leading-relaxed">
          Elara no es terapia ni un servicio médico. Es una compañera para acompañarte, no para
          diagnosticar.
        </p>
      </Reveal>
    </section>
  );
}
