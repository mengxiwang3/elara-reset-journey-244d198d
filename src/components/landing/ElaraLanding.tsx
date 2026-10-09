import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";
import { ElaraTaste } from "./ElaraTaste";
import { Waitlist } from "./Waitlist";
import { WaveField } from "./Waves";
import dayEs from "@/assets/app/daycard-es.webp";
import dayEn from "@/assets/app/daycard-en.webp";
import duskArt from "@/assets/env/dusk.webp";
import atlasMist from "@/assets/atlas/mist-meadow.webp";
import atlasNight from "@/assets/atlas/celestial-night.webp";
import atlasReed from "@/assets/atlas/reed-island.webp";
import atlasGuadua from "@/assets/atlas/guadua-roots.webp";
import atlasOverlook from "@/assets/atlas/the-overlook.webp";

import { Wordmark } from "../elara/Wordmark";
import { Orb } from "../elara/Orb";
import { Paper } from "./Paper";
import todayEs from "@/assets/app/today-es.webp";
import todayEn from "@/assets/app/today-en.webp";
import pathEn from "@/assets/app/path-en.webp";
import keptEn from "@/assets/app/kept-en.webp";
import pathEs from "@/assets/app/path-es.webp";
import keptEs from "@/assets/app/kept-es.webp";
import circlesEs from "@/assets/app/circles-es.webp";
import circlesEn from "@/assets/app/circles-en.webp";
import fragNear from "@/assets/meadow/near.webp";
import fragMist from "@/assets/meadow/mist.webp";
import exArtWorkshop from "@/assets/paper/explore-art-workshop.webp";
import exArtVoices from "@/assets/paper/explore-art-voices.webp";
import exArtListening from "@/assets/paper/explore-art-listening.webp";

import artToday from "@/assets/paper/landscape-today.webp";
import artJourney from "@/assets/paper/landscape-journey.webp";
import artUnsure from "@/assets/paper/mood-unsure-lg.webp";
import artNext from "@/assets/paper/path-next.webp";
import symSelf from "@/assets/paper/sym-self.webp";
import symEnergy from "@/assets/paper/sym-energy.webp";
import symMoney from "@/assets/paper/sym-money.webp";
import symPurpose from "@/assets/paper/sym-purpose.webp";
import symLove from "@/assets/paper/sym-love.webp";
import symEveryday from "@/assets/paper/sym-everyday.webp";

/**
 * holaelara.com, rebuilt on "Paper at dusk" (October 2026) and the in-app
 * illustrative asset library exported 3 October 2026. One component, two
 * languages: every string lives in COPY.
 *
 * Art rules this page holds to (brand §04, §05, §08):
 *   · Torn-paper landscapes are bands and headers; type never sits on hills.
 *   · Life-area art is the v2 set, one symbol per card.
 *   · Mood weather only where it means something (the check-in).
 *   · Moon and stars only on navy. Glow only on the orb, only on dark paper.
 *   · No art containing retired cobalt. Measured, not eyeballed: 13 of the
 *     Money Clarity practice pieces still carry it, so none of them are used.
 *   · No phone screenshots: the September screens show the retired glossy orb.
 *
 * Copy guardrails (see the Elara project docs before editing):
 *   · No pricing or free-access claims until the incentive model is chosen.
 *   · No "Blueprint", no scores, no question counts, no outcome or efficacy lines.
 *   · The 7-day path is where she starts, not the whole product.
 *   · Spanish strings are drafts for Alejandra to correct in her own voice.
 *   · No em dashes in visible copy.
 */

type Lang = "es" | "en";

const COPY = {
  es: {
    homeHref: "/",
    waitlistId: "lista",
    nav: [
      { href: "#como", label: "Cómo funciona" },
      { href: "#producto", label: "Dentro de Elara" },
      { href: "#cultura", label: "Por qué en español" },
    ],
    navCta: "Unirme",
    hero: {
      eyebrow: "Primera en español · Lista de espera abierta",
      title: "Para la mujer que sostiene todo, aunque nadie lo note.",
      body: "Elara te ayuda a ver dónde estás, entender qué está pidiendo atención y dar el siguiente paso pequeño, en español. Para mujeres ambiciosas que por fuera parecen estar bien, pero por dentro se sienten saturadas, dispersas o lejos de sí mismas.",
      cta: "Unirme a la lista de espera",
      secondary: "Ver cómo funciona",
      caption: "Abriendo pronto.",
      shot: "Pantalla Hoy de Elara: la tarjeta de la semana con su camino, el día 4 de 7 y el botón para empezar la práctica de hoy.",
    },
    stats: [
      { n: "1.8M+", l: "mujeres alcanzadas por la comunidad de Alejandra" },
      { n: "80K+", l: "en la comunidad de Alejandra" },
      { n: "4,600+", l: "mujeres respondieron nuestra encuesta" },
      { n: "6", l: "áreas de tu vida, un solo lugar" },
    ],
    built: {
      eyebrow: "Construido con ellas, no para ellas",
      title:
        "Más de 4,600 mujeres nos contaron, con honestidad, lo que estaban cargando.",
      body: "El dinero fue lo que más salió: casi 1 de cada 3 lo eligió como lo primero que resolvería. Por eso Elara lo toma en serio, no como números, sino como lo que se siente cargarlo. Y desde ahí se abre hacia el resto de tu vida.",
    },
    problem: {
      eyebrow: "Si esto te suena familiar",
      title: "No necesitas otra app. Necesitas un lugar donde aterrizar.",
      rows: [
        {
          title: "Funcionando al máximo, agotada en silencio",
          body: "Estás entregando para todos. El cansancio vive en un lugar donde solo tú puedes sentirlo.",
        },
        {
          title: "Estructura, sin la presión",
          body: "No es otro sistema de productividad. Empiezas desde donde estás de verdad esta semana, no desde donde crees que deberías estar.",
        },
        {
          title: "Suavidad y ambición, al mismo tiempo",
          body: "No tienes que elegir entre el descanso y el crecimiento. Elara sostiene los dos.",
        },
        {
          title: "Apoyo que entiende el contexto",
          body: "Tu cultura, tu familia, tus estándares. Una guía que no aplana nada de eso.",
        },
      ],
    },
    how: {
      eyebrow: "Cómo funciona",
      title: "Primero, claridad. Después, un paso a la vez.",
      steps: [
        {
          title: "Unas preguntas honestas",
          body: "La evaluación de claridad te pregunta cómo se sienten las cosas ahora mismo. No hay respuestas correctas ni puntuaciones, y puedes repetirla cuando quieras.",
        },
        {
          title: "Tu foto de claridad",
          body: "Elara te muestra qué área de tu vida está pidiendo atención y cómo se conecta con las demás. Si no te suena, eliges otra.",
        },
        {
          title: "Tu camino de 7 días",
          body: "Unos minutos al día dentro de esa área. Una práctica corta, a tu ritmo, y puedes pausar cuando quieras.",
        },
        {
          title: "Y después, sigues",
          body: "Cuando terminas un camino, eliges el siguiente. Seis áreas, un recorrido más largo, sin prisa.",
        },
      ],
      stepLabel: "Paso",
      evidence: "En la app: tu camino",
      evidenceAlt: "Tu camino en la app: la tarjeta de la semana con su día, el botón para continuar y tus semanas anteriores.",
    },
    areas: {
      eyebrow: "Las seis áreas",
      title: "Seis áreas de una misma vida.",
      evidence: "En la app: tus caminos",
      evidenceAlt: "Lista de caminos en la app: Confianza en ti, Reinicio de energía, Propósito, Amor y límites y Ritmo diario, uno a la vez.",
      body: "Cuando una pesa, tira de las demás. Elara no te pide arreglarlas todas: empiezas por la que más está pidiendo atención.",
      list: [
        { tag: "TÚ", name: "Confianza en ti", line: "Volver a confiar en tu propia voz, debajo del ruido." },
        { tag: "ENERGÍA", name: "Reinicio de energía", line: "Entender a dónde se va tu energía antes de que se acabe." },
        { tag: "DINERO", name: "Claridad con el dinero", line: "Bajar la carga mental que el dinero deja encima." },
        { tag: "PROPÓSITO", name: "Encontrar propósito", line: "Dirección y sentido para el siguiente paso real." },
        { tag: "VÍNCULOS", name: "Amor y límites", line: "Presencia y honestidad con quienes más importan." },
        { tag: "DÍA A DÍA", name: "Ritmo diario", line: "Días más estables, rutinas más suaves, menos fricción." },
      ],
    },
    explore: {
      eyebrow: "Explorar",
      // Headline options considered (recommended: the first):
      //   A  Para los días que piden un poco más.
      //   B  Cuando quieres quedarte un poco más.
      //   C  Algo para llevar contigo fuera de la pantalla.
      title: "Para los días que piden un poco más.",
      lead: "Elara no es solo una práctica diaria. Cuando quieres quedarte más tiempo con algo, Explorar irá abriéndose poco a poco en beta: talleres en vivo, voces que acompañan y escuchas pequeñas para el momento que vives.",
      intent: "Son lugares a los que vuelves a propósito, no contenido para consumir sin fin.",
      places: [
        {
          k: "Talleres en vivo",
          v: "Un taller destacado, con fecha y hora. Pronto disponible para el primer grupo.",
          alt: "Explorar en la app: el taller destacado de la semana, con su fecha.",
        },
        {
          k: "Voces que acompañan",
          v: "Voces de mujeres y conversaciones guiadas. Se irán abriendo en beta.",
          alt: "Explorar en la app: Voces en Elara, conversaciones guiadas con mujeres.",
        },
        {
          k: "La sala de escucha",
          v: "Audio corto para cocinar, caminar, descansar o aterrizar antes de dormir.",
          alt: "Explorar en la app: la sala de escucha, con audios cortos para cada momento.",
        },
      ],
    },
    product: {
      eyebrow: "Dentro de Elara",
      title: "Un espacio pequeño y hermoso para tu vida interior.",
      body: "Cada día es una conversación corta con Elara, no una lista de tareas.",
      note: "Capturas de la versión en desarrollo.",
      // Captions are drafts for Alejandra; the screens are the current build.
      screens: [
        { label: "Lo que guardas", caption: "Tu frase del día, tus días y lo que Elara recuerda de ti." },
      ],
      circles: {
        eyebrow: "Círculos",
        title: "No es una red social. Es un círculo pequeño.",
        body: "Unas pocas mujeres que van por el mismo camino, con una pregunta cada día. Una frase basta.",
        points: [
          { k: "Privado", v: "Solo tu círculo ve lo que escribes, y solo con tu nombre de pila." },
          { k: "Con intención", v: "Una pregunta al día, hecha por Elara. No hay nada que perseguir." },
          { k: "Lo que hacen", v: "Responden con una frase, leen a las demás y, si quieren, se escriben." },
        ],
        demo: {
          kicker: "La pregunta de hoy · Madres",
          question: "¿Qué estás cargando hoy que no se ve por fuera?",
          asked: "Pregunta de Elara",
          slips: [
            { n: "Luz", d: "Lun 5 oct", t: "Por fuera, todo en orden. Por dentro, cansada de fingir que puedo con todo." },
            { n: "Mariana", d: "Dom 4 oct", t: "Cansada. Y todavía no lo he dicho en voz alta." },
            { n: "Daniela", d: "Sáb 3 oct", t: "Que a veces solo quiero que alguien me pregunte cómo estoy." },
          ],
          sample: "Ejemplos de la versión en desarrollo.",
        },
      },
    },
    culture: {
      eyebrow: "Construido desde adentro",
      title: "No es inglés, traducido. Es español, entendido.",
      body: "Elara lee el tono, la emoción y la cultura, no solo las palabras. El peso de ser la hija mayor, la familia que llama, los dos mundos que habitas. Construida para eso, no adaptada a eso.",
      pairs: [
        { you: "“Hoy fue mucho.”", elara: "“Hoy fue mucho, y está bien.”" },
        { you: "“No sé por dónde empezar.”", elara: "“Busquemos un lugar pequeño para empezar.”" },
        { you: "“Aquí puedo ser yo.”", elara: "“Aquí no tienes que actuar.”" },
      ],
      youLabel: "Tú",
      elaraLabel: "Elara",
    },
    founders: {
      eyebrow: "Una nota de nosotras",
      note: "Veíamos lo mismo una y otra vez, en nuestra propia vida y en miles de mensajes: mujeres que por fuera parecen tenerlo todo resuelto, y por dentro funcionan en vacío. No encontrábamos el lugar suave que necesitábamos, así que empezamos a construirlo. Elara es para ti. (La verdad, también para nosotras.)",
      sign: "Mengxi y Ale",
      people: [
        { name: "Mengxi Wang", role: "Producto y diseño", ig: "karawang" },
        { name: "Alejandra Ramirez", role: "Creadora y comunidad", ig: "alejandra.travels" },
      ],
    },
    footer: {
      privacy: "Privacidad",
      privacyHref: "/privacidad",
      contact: "Contacto",
      line: "Hecho por dos mujeres que también lo necesitaban.",
      disclaimer: "Elara no es terapia ni un servicio médico.",
    },
  },
  en: {
    homeHref: "/en",
    waitlistId: "waitlist",
    nav: [
      { href: "#how", label: "How it works" },
      { href: "#product", label: "Inside Elara" },
      { href: "#culture", label: "Why Spanish-first" },
    ],
    navCta: "Join",
    hero: {
      eyebrow: "Spanish-first · Waitlist open",
      title: "For the woman who holds everything, even when no one notices.",
      body: "Elara helps you see where you are, understand what is asking for attention, and take the next small step. Built for ambitious women who look fine on the outside but feel stretched, scattered or far from themselves on the inside.",
      cta: "Join the waitlist",
      secondary: "See how it works",
      caption: "Opening soon.",
      shot: "Elara's Today screen: this week's card with its path, day 4 of 7, and the button to start today's practice.",
    },
    stats: [
      { n: "1.8M+", l: "women reached by Alejandra's community" },
      { n: "80K+", l: "in Alejandra's community" },
      { n: "4,600+", l: "women answered our survey" },
      { n: "6", l: "areas of your life, one place" },
    ],
    built: {
      eyebrow: "Built with women, not for them",
      title: "More than 4,600 women told us, honestly, what they were carrying.",
      body: "Money came up most: almost 1 in 3 chose it as the first thing they would fix. So Elara takes it seriously, not as numbers but as what it feels like to carry. From there it opens into the rest of your life.",
    },
    problem: {
      eyebrow: "If this sounds familiar",
      title: "You don't need another app. You need somewhere to land.",
      rows: [
        {
          title: "High-functioning, quietly depleted",
          body: "You're delivering for everyone. The tiredness lives somewhere only you can feel it.",
        },
        {
          title: "Structure, without the pressure",
          body: "Not another productivity system. You start from where you actually are this week, not where you think you should be.",
        },
        {
          title: "Softness and ambition, at the same time",
          body: "You don't have to choose between rest and growth. Elara holds both.",
        },
        {
          title: "Support that understands context",
          body: "Your culture, your family, your standards. Guidance that doesn't flatten any of it.",
        },
      ],
    },
    how: {
      eyebrow: "How it works",
      title: "Clarity first. Then one step at a time.",
      steps: [
        {
          title: "A few honest questions",
          body: "The Clarity Assessment asks how things feel right now. There are no right answers and no scores, and you can retake it anytime.",
        },
        {
          title: "Your clarity picture",
          body: "Elara shows you which area of your life is asking for attention and how it connects to the others. If it doesn't feel right, you pick another.",
        },
        {
          title: "Your 7-day path",
          body: "A few minutes a day inside that area. One short practice, at your pace, and you can pause anytime.",
        },
        {
          title: "Then you keep going",
          body: "When you finish a path, you choose the next one. Six areas, a longer journey, no rush.",
        },
      ],
      stepLabel: "Step",
      evidence: "In the app: your path",
      evidenceAlt: "Your path in the app: this week's card with its day, the button to continue, and your earlier weeks.",
    },
    areas: {
      eyebrow: "The six Life Areas",
      title: "Six areas of one life.",
      evidence: "In the app: your paths",
      evidenceAlt: "The list of paths in the app: Self-Trust, Energy Reset, Purpose Finding, Love & Boundaries and Daily Rhythm, one at a time.",
      body: "When one feels heavy, it pulls on the others. Elara doesn't ask you to fix them all: you start with the one asking for attention most.",
      list: [
        { tag: "SELF", name: "Self-Trust", line: "Trusting your own voice again, under the noise." },
        { tag: "ENERGY", name: "Energy Reset", line: "Seeing where your energy goes before it runs out." },
        { tag: "MONEY", name: "Money Clarity", line: "Lowering the mental load money leaves behind." },
        { tag: "PURPOSE", name: "Purpose Finding", line: "Direction and meaning for the next real step." },
        { tag: "LOVE", name: "Love & Boundaries", line: "Presence and honesty with the people who matter most." },
        { tag: "EVERYDAY", name: "Daily Rhythm", line: "Steadier days, softer routines, less friction." },
      ],
    },
    explore: {
      eyebrow: "Explore",
      title: "For the days that ask for a little more.",
      lead: "Elara is not only a daily practice. When you want to stay with something longer, you can join a live workshop, hear a voice that meets you where you are, or choose a small listening experience for the moment you are in.",
      intent: "These are places you return to on purpose, not content to consume without end.",
      places: [
        {
          k: "Live workshops",
          v: "One featured workshop, with a date and time. You reserve your place and we remind you before it starts.",
          alt: "Explore in the app: the week's featured workshop, with its date.",
        },
        {
          k: "Voices that keep you company",
          v: "Women's voices and guided conversations that meet you where you are.",
          alt: "Explore in the app: Voices on Elara, guided conversations with women.",
        },
        {
          k: "The Listening Room",
          v: "Short audio for cooking, walking, resting, or settling before sleep.",
          alt: "Explore in the app: the Listening Room, short audio for each moment.",
        },
      ],
    },
    product: {
      eyebrow: "Inside Elara",
      title: "A small, beautiful space for your inner life.",
      body: "Each day is a short conversation with Elara, not a to-do list.",
      note: "Captures from the build in progress.",
      screens: [
        { label: "What you keep", caption: "Your line of the day, your days, and what Elara remembers about you." },
      ],
      circles: {
        eyebrow: "Circles",
        title: "Not a social network. A small circle.",
        body: "A few women on the same path, with one question a day. A sentence is enough.",
        points: [
          { k: "Private", v: "Only your circle sees what you write, under your first name." },
          { k: "Intentional", v: "One question a day, asked by Elara. Nothing to chase." },
          { k: "What members do", v: "They answer in a sentence, read the others and, if they want, write back." },
        ],
        demo: {
          kicker: "Today's question · Mothers",
          question: "What are you carrying today that doesn’t show on the outside?",
          asked: "Asked by Elara",
          slips: [
            { n: "Luz", d: "Mon Oct 5", t: "On the outside, fine. On the inside, tired of pretending I can do it all." },
            { n: "Mariana", d: "Sun Oct 4", t: "Tired. And I haven’t said it out loud yet." },
            { n: "Daniela", d: "Sat Oct 3", t: "That some days I just want someone to ask how I am." },
          ],
          sample: "Samples from the build in progress.",
        },
      },
    },
    culture: {
      eyebrow: "Built from the inside",
      title: "Not English, translated. Spanish, understood.",
      body: "Elara reads tone, emotion and culture, not just words. The weight of being the eldest daughter, the family that calls, the two worlds you live in. Built for that, not adapted to it.",
      pairs: [
        { you: "“Hoy fue mucho.”", elara: "“Hoy fue mucho, y está bien.”" },
        { you: "“No sé por dónde empezar.”", elara: "“Busquemos un lugar pequeño para empezar.”" },
        { you: "“Aquí puedo ser yo.”", elara: "“Aquí no tienes que actuar.”" },
      ],
      youLabel: "You",
      elaraLabel: "Elara",
    },
    founders: {
      eyebrow: "A note from us",
      note: "We kept seeing the same thing, in our own lives and in thousands of messages: women who look like they have it all together on the outside, and are running on empty inside. We couldn't find the soft place we needed, so we started building it. Elara is for you. (Honestly, for us too.)",
      sign: "Mengxi and Ale",
      people: [
        { name: "Mengxi Wang", role: "Product and design", ig: "karawang" },
        { name: "Alejandra Ramirez", role: "Creator and community", ig: "alejandra.travels" },
      ],
    },
    footer: {
      privacy: "Privacy",
      privacyHref: "/privacidad",
      contact: "Contact",
      line: "Made by two women who needed it too.",
      disclaimer: "Elara is not therapy or a medical service.",
    },
  },
} as const;

const WRAP = "mx-auto w-full max-w-6xl px-5 sm:px-8";

const AREA_SYM = [symSelf, symEnergy, symMoney, symPurpose, symLove, symEveryday];
/** One picture per step, as the page always had: how it feels right now, the
 *  area that asks for attention, the path, and the next paths after it.
 *  "object" art is a Mode A sculpture on transparent ground, set on sand;
 *  "contain" keeps a wide collage whole instead of cropping its edges. */
const STEP_ART: { src: string; w: number; h: number; fit: "cover" | "contain" | "object" }[] = [
  { src: artUnsure, w: 520, h: 559, fit: "object" },
  { src: symSelf, w: 348, h: 520, fit: "object" },
  { src: artJourney, w: 1200, h: 675, fit: "cover" },
  { src: artNext, w: 1000, h: 500, fit: "contain" },
];

/** Decorative paper art. The words beside it carry the meaning, so alt is empty. */
function Art({ src, w, h, className = "", eager = false }: { src: string; w: number; h: number; className?: string; eager?: boolean }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={w}
      height={h}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`e-art ${className}`.trim()}
    />
  );
}

/* -------------------------------------------------------------------------- */

function Nav({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    // Brand §06: light, opaque, simple. Solid sheet, no blur.
    <header className="e-nav fixed inset-x-0 top-0 z-50">
      <div className={`${WRAP} flex h-[72px] items-center justify-between gap-4`}>
        <a href={t.homeHref} aria-label="Elara" className="-m-1 rounded-full p-1">
          <Wordmark size={28} />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {t.nav.map((l) => (
            <a key={l.href} href={l.href} className="e-label e-navlink whitespace-nowrap text-ink-72 transition-colors hover:text-forest">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="e-seg" role="group" aria-label={lang === "es" ? "Idioma" : "Language"}>
            {lang === "es" ? (
              <>
                <span className="e-seg__on" aria-current="true">ES</span>
                <a href="/en" className="e-seg__off" lang="en" hrefLang="en">
                  EN
                </a>
              </>
            ) : (
              <>
                <a href="/" className="e-seg__off" lang="es" hrefLang="es">
                  ES
                </a>
                <span className="e-seg__on" aria-current="true">EN</span>
              </>
            )}
          </div>
          <a href={`#${t.waitlistId}`} className="e-btn e-btn--primary e-btn--compact">
            {t.navCta}
          </a>
        </div>
      </div>
    </header>
  );
}

/** Stars for the living sky: [x %, y %, size, delay s, duration s]. Placed only in
 *  the sky part of the Today card's art band, clear of the tree and the orb. */
const SKY_STARS: [number, number, number, number, number][] = [
  [33.4, 10.4, 0.83, 0.4, 4.5],
  [37.4, 5.8, 0.75, 0.2, 4.2],
  [9.6, 7.4, 0.71, 5.0, 3.0],
  [24.0, 33.7, 0.97, 3.5, 4.0],
  [94.8, 5.3, 0.93, 1.7, 3.1],
  [14.1, 18.1, 0.91, 1.1, 4.7],
  [63.1, 21.2, 0.77, 0.4, 2.8],
  [22.4, 36.3, 0.71, 1.9, 4.7],
  [45.6, 17.7, 0.9, 4.2, 3.5],
  [57.0, 28.7, 0.94, 4.4, 3.6],
  [95.1, 8.8, 0.71, 4.5, 3.1],
  [49.0, 4.9, 0.83, 4.6, 4.7],
  [85.3, 18.4, 0.85, 3.6, 4.7],
  [45.9, 44.2, 0.97, 2.8, 5.0],
  [8.7, 37.4, 0.82, 6.0, 5.6],
  [29.8, 21.9, 0.83, 0.1, 4.3],
  [18.8, 8.7, 0.53, 4.6, 3.1],
  [26.3, 22.2, 0.94, 0.5, 4.2],
  [54.6, 46.3, 0.91, 5.2, 3.6],
  [42.0, 20.6, 0.94, 5.7, 3.1],
  [19.6, 14.4, 0.62, 2.9, 4.7],
  [27.7, 3.2, 0.71, 2.2, 4.6],
];

function Hero({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <section id="top" className="e-hero relative z-[1] pb-2 pt-[4.5rem] sm:pt-[4.75rem]">
      {/* The landscape is not framed: it melts into the page on three sides and
          runs on past the bottom of the hero into the next chapter. */}
      <Paper src={artToday} eager depth={10} sway={-8} className="e-hero__land" />
      <Paper src={fragNear} depth={18} sway={10} className="e-hero__grass" />

      {/* Phone: the product is in the first screen. On a phone it comes straight
          after the headline and button, with the explanation below it. */}
      <div className={`${WRAP} e-hero__grid relative`}>
        <div className="e-hero__head">
          <p className="e-eyebrow">{t.hero.eyebrow}</p>
          <h1 className="e-display-xl mt-3 text-ink">{t.hero.title}</h1>
        </div>

        <div className="e-hero__cta">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <a href={`#${t.waitlistId}`} className="e-btn e-btn--primary">
              {t.hero.cta}
            </a>
            <a href={t.nav[0].href} className="e-textlink">
              {t.hero.secondary}
            </a>
          </div>
          <p className="e-caption mt-4 flex items-center gap-2.5">
            <span className="e-dot" aria-hidden />
            {t.hero.caption}
          </p>
        </div>

        <p className="e-hero__body e-lead">{t.hero.body}</p>

        <figure className="e-hero__phone">
          <img
            src={lang === "es" ? todayEs : todayEn}
            alt={t.hero.shot}
            width={780}
            height={1696}
            loading="eager"
            decoding="async"
          />
          {/* The sky inside the real screen is alive: it sits only on the card's art
              band (never on text), and it is off under reduced motion. */}
          <span className="e-sky-fx" aria-hidden>
            <i className="e-sky-fx__tint" />
            {SKY_STARS.map(([x, y, sz, d, du], i) => (
              <i
                key={i}
                className="e-sky-fx__star"
                style={{ left: `${x}%`, top: `${y}%`, ["--sz" as string]: sz, animationDelay: `${d}s`, animationDuration: `${du}s` }}
              />
            ))}
            <i className="e-sky-fx__shoot" />
            <i className="e-sky-fx__glow" />
          </span>
        </figure>
      </div>
    </section>
  );
}

/** Torn grass that straddles the line between two sections: the real transparent
 *  foreground layer from the app's Mist Meadow, set across the seam. */
function Seam({ side = "r", className = "" }: { side?: "l" | "r"; className?: string }) {
  return <Paper src={fragNear} depth={10} sway={side === "r" ? 12 : -12} className={`e-seam e-seam--${side} ${className}`.trim()} />;
}

function Shot({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={`e-shot ${className}`.trim()}>
      <img src={src} alt={alt} width={780} height={1696} loading="lazy" decoding="async" />
    </figure>
  );
}

/* -- COMPACT: who this is built with, and why it is not another app ----------- */
function Passage({ lang }: { lang: Lang }) {
  const b = COPY[lang].built;
  return (
    <section className="relative z-[2] pb-9 pt-4 sm:pb-11 sm:pt-6">
      <Paper src={fragMist} depth={10} sway={28} className="e-frag-mist" />
      <div className={`${WRAP} relative`}>
        <div className="grid items-end gap-4 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-8">
            <p className="e-eyebrow">{b.eyebrow}</p>
            <h2 className="e-passage__title mt-3 text-ink">{b.title}</h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-4">
            <p className="e-body border-l border-hairline pl-5 text-ink-72">{b.body}</p>
          </Reveal>
        </div>

        {/* Reach, community and survey: compact proof, where the survey is told. */}
        <dl className="e-proof e-proof--wide mt-4">
          {COPY[lang].stats.slice(0, 3).map((s) => (
            <div key={s.l}>
              <dt data-numeral>{s.n}</dt>
              <dd>{s.l}</dd>
            </div>
          ))}
        </dl>

      </div>
      <Seam side="r" />
    </section>
  );
}

const WEEK = {
  es: {
    label: "Un camino de 7 días",
    alt: "La tarjeta de Hoy en la app: Día 4 de 7 y los siete días del camino, con el de mañana ya esbozado.",
    beats: ["Empiezas donde estás.", "Cada día, una práctica pequeña.", "Elara guarda lo que vas notando.", "La niebla baja. El camino aparece.", "Tu Atlas recuerda lo que caminaste."],
    when: ["Día 1", "Días 2 y 3", "Días 4 y 5", "Días 6 y 7", "Al final"],
  },
  en: {
    label: "A 7-day path",
    alt: "Today's card in the app: Day 4 of 7 and the seven days of the path, tomorrow's already sketched.",
    beats: ["You begin where you are.", "One small practice each day.", "Elara keeps what you notice.", "The mist lowers. The path appears.", "Your Atlas remembers what you walked."],
    when: ["Day 1", "Days 2 and 3", "Days 4 and 5", "Days 6 and 7", "At the end"],
  },
} as const;

/* -- WATER: "you do not need another app", on indigo paper waves --------------- */
function Water({ lang }: { lang: Lang }) {
  const p = COPY[lang].problem;
  return (
    <section className="e-water on-field relative">
      <div className={`${WRAP} e-water__grid relative z-[2]`}>
        <Reveal>
          <p className="e-eyebrow">{p.eyebrow}</p>
          <h2 className="e-display-l mt-3">{p.title}</h2>
        </Reveal>
        <ol className="e-water__list">
          {p.rows.map((r, i) => (
            <Reveal key={r.title} delay={i * 70}>
              <li className="e-water__row">
                <span data-numeral aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="e-body">
                  <strong>{r.title}.</strong> {r.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
      <WaveField />
    </section>
  );
}

/* -- PRODUCT-DENSE: how a path works, beside the real screens ------------------ */
function HowAndProduct({ lang }: { lang: Lang }) {
  const t = COPY[lang].how;
  const pr = COPY[lang].product;
  const id = lang === "es" ? "como" : "how";
  return (
    <section id={id} className="bg-tint relative py-9 sm:py-11">
      <div className={`${WRAP} relative grid items-center gap-7 lg:grid-cols-12 lg:gap-10`}>
        <div className="lg:col-span-7">
          <Reveal>
            <p className="e-eyebrow">{t.eyebrow}</p>
            <h2 className="e-h1 mt-3 text-ink">{t.title}</h2>
          </Reveal>
          <ol className="mt-6 grid gap-x-7 gap-y-5 sm:grid-cols-2">
            {t.steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <li className="e-stepcard flex gap-4">
                  <div className="e-stepcard__art">
                    <Art
                      src={STEP_ART[i].src}
                      w={STEP_ART[i].w}
                      h={STEP_ART[i].h}
                      className={STEP_ART[i].fit === "object" ? "h-full w-auto object-contain drop-shadow-[0_6px_8px_rgb(60_40_20/0.2)]" : "e-melt h-full w-full object-cover"}
                    />
                  </div>
                  <div>
                    <p className="e-eyebrow" data-numeral>
                      {t.stepLabel} {i + 1}
                    </p>
                    <h3 className="e-h3 mt-1 text-ink">{s.title}</h3>
                    <p className="e-body mt-1.5">{s.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal>
            <div className="e-week mt-8">
              <img src={lang === "es" ? dayEs : dayEn} alt={WEEK[lang].alt} width={900} height={259} loading="lazy" decoding="async" className="e-daycard" />
              <div>
                <p className="e-eyebrow">{WEEK[lang].label}</p>
                <ol className="e-week__beats mt-2">
                  {WEEK[lang].beats.map((b, i) => (
                    <li key={b}>
                      <span className="e-label" data-numeral>{WEEK[lang].when[i]}</span> <span className="e-body">{b}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Evidence: two real screens from the current build, overlapping. */}
        <div id={lang === "es" ? "producto" : "product"} className="lg:col-span-5">
          <Reveal>
            <p className="e-eyebrow mb-3 text-center lg:text-left">{t.evidence}</p>
            <div className="e-phones">
              <Shot src={lang === "es" ? keptEs : keptEn} alt={pr.screens[0].label + ". " + pr.screens[0].caption} className="e-phones__back" />
              <Shot src={lang === "es" ? pathEs : pathEn} alt={t.evidenceAlt} className="e-phones__front" />
            </div>
            <p className="e-caption mt-4 text-center lg:text-left">{pr.screens[0].caption}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -- OPEN: six areas as one free composition ----------------------------------- */
function Areas({ lang }: { lang: Lang }) {
  const t = COPY[lang].areas;
  return (
    <section className="relative z-[2] py-10 sm:py-12">
      <div className={WRAP}>
        <Reveal>
            <p className="e-eyebrow">{t.eyebrow}</p>
            <h2 className="e-h1 mt-3 text-ink">{t.title}</h2>
            <p className="e-lead mt-4 max-w-2xl">{t.body}</p>
        </Reveal>

        {/* The symbols are cut out of their paper and set loose, overlapping, on a
            gentle arc. One object each, no frames (brand §05). */}
        <ul className="e-const mt-5">
          {t.list.map((a, i) => (
            <Reveal key={a.tag} delay={i * 60} className="e-const__cell">
              <li className={`e-const__item e-const__item--${i}`}>
                <img src={AREA_SYM[i]} alt="" aria-hidden width={500} height={520} loading="lazy" decoding="async" className="e-const__sym" />
                <div className="e-const__cap">
                  <p className="e-eyebrow">{a.tag}</p>
                  <p className="e-label mt-1 text-ink">{a.name}</p>
                  <p className="e-caption mt-1">{a.line}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
      <Seam side="l" />
    </section>
  );
}

/* -- ATLAS: a map of what she has already walked ------------------------------- */
const ATLAS = {
  es: {
    eyebrow: "ATLAS",
    title: "Un mapa de lo que ya caminaste.",
    body: "Cada camino que terminas deja una huella. Atlas reúne tus territorios, tus frases y los momentos que Elara recuerda contigo, para que puedas mirar atrás sin sentir que empiezas de cero otra vez.",
    line: "No es una puntuación. Es una forma suave de ver que sí has avanzado.",
    points: [
      { k: "now", t: "Tu territorio actual, donde estás poniendo atención ahora." },
      { k: "walked", t: "Los caminos que ya completaste, guardados como lugares." },
      { k: "ahead", t: "Lo que viene después, visible sin presión." },
    ],
    alt: "El Atlas de la app: cinco territorios de un camino en un solo paisaje de papel. Dos ya recorridos, el actual en el centro y dos más lejanos, entre la bruma, unidos por un hilo.",
    caps: [
      { w: "Semana 1", x: "Sem. 1", n: "Mist Meadow", s: "Completada" },
      { w: "Semana 2", x: "Sem. 2", n: "Celestial Night", s: "Completada" },
      { w: "Ahora · Semana 3", x: "Ahora · Sem. 3", n: "Reed Island", s: "Aquí estás" },
      { w: "Semana 4", x: "Sem. 4", n: "", s: "" },
      { w: "Semana 5", x: "Sem. 5", n: "", s: "" },
    ],
  },
  en: {
    eyebrow: "ATLAS",
    title: "A map of what you’ve already walked.",
    body: "Every path you finish leaves a mark. Atlas gathers your territories, your lines and the moments Elara remembers with you, so you can look back without feeling you’re starting from zero again.",
    line: "It isn’t a score. It’s a gentle way to see that you have moved forward.",
    points: [
      { k: "now", t: "Your current territory, where you’re putting your attention now." },
      { k: "walked", t: "The paths you’ve finished, kept as places." },
      { k: "ahead", t: "What comes next, visible without pressure." },
    ],
    alt: "The app's Atlas: five territories of one path in a single paper landscape. Two already walked, the current one in the middle and two farther off in the haze, joined by a thread.",
    caps: [
      { w: "Week 1", x: "Wk 1", n: "Mist Meadow", s: "Completed" },
      { w: "Week 2", x: "Wk 2", n: "Celestial Night", s: "Completed" },
      { w: "Now · Week 3", x: "Now · Wk 3", n: "Reed Island", s: "You are here" },
      { w: "Week 4", x: "Wk 4", n: "", s: "" },
      { w: "Week 5", x: "Wk 5", n: "", s: "" },
    ],
  },
} as const;
const ATLAS_SLICES = [
  { src: atlasMist, weight: 94, kind: "walked" },
  { src: atlasNight, weight: 94, kind: "walked" },
  { src: atlasReed, weight: 112, kind: "now" },
  { src: atlasGuadua, weight: 50, kind: "ahead" },
  { src: atlasOverlook, weight: 44, kind: "ahead" },
] as const;
const ATLAS_TOTAL = ATLAS_SLICES.reduce((a, s) => a + s.weight, 0);
/** The pencil thread through the territories (x, y in % of the map), solid up to "now". */
const THREAD: [number, number][] = [[0, 80], [12, 76], [23.9, 71], [36, 73], [47.7, 66], [56, 61], [63, 62], [70, 66], [76.1, 64], [88.8, 58], [100, 61]];
const NOW_AT = 8; // the end of the territory she is in: solid ink up to here, pencil beyond
function threadPath(pts: [number, number][]) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function threadY(x: number) {
  return THREAD.reduce((b, p) => (Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b))[1];
}

function Atlas({ lang }: { lang: Lang }) {
  const t = ATLAS[lang];
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  let acc = 0;
  const nodes = ATLAS_SLICES.map((s) => (acc += s.weight) / ATLAS_TOTAL * 100);
  const nowPt = THREAD[NOW_AT];
  return (
    <section id="atlas" className="e-atlas relative">
      <div className={`${WRAP} e-atlas__top`}>
        <Reveal className="e-atlas__copy">
          <p className="e-eyebrow">{t.eyebrow}</p>
          <h2 className="e-h1 mt-3 text-ink">{t.title}</h2>
          <p className="e-lead mt-5">{t.body}</p>
          <p className="e-atlas__line mt-4">{t.line}</p>
        </Reveal>

      </div>
      <div ref={ref} className={`e-atlas__stage ${seen ? "is-in" : ""}`}>
          <div className="e-atlas__map" role="img" aria-label={t.alt}>
            {ATLAS_SLICES.map((s, i) => (
              <div key={i} className={`e-atlas__slice e-atlas__slice--${s.kind}`} style={{ flexGrow: s.weight }}>
                <img src={s.src} alt="" loading="lazy" decoding="async" />
              </div>
            ))}
            <svg className="e-atlas__thread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path className="e-atlas__pencil" d={threadPath(THREAD)} pathLength={1} />
              <path className="e-atlas__ink" d={threadPath(THREAD.slice(0, NOW_AT + 1))} pathLength={1} />
            </svg>
            {nodes.slice(0, 2).map((x, i) => (
              <i key={i} className="e-atlas__node e-atlas__node--walked" style={{ left: `${x}%`, top: `${threadY(x)}%` }} aria-hidden />
            ))}
            {nodes.slice(3, 5).map((x, i) => (
              <i key={i} className="e-atlas__node e-atlas__node--ahead" style={{ left: `${Math.min(x, 99)}%`, top: `${threadY(x)}%` }} aria-hidden />
            ))}
            <i className="e-atlas__now" style={{ left: `${nowPt[0]}%`, top: `${nowPt[1]}%` }} aria-hidden />
          </div>
          {/* The words sit under the picture, never on it. */}
          <ol className="e-atlas__caps">
            {t.caps.map((c, i) => (
              <li key={i} style={{ flexGrow: ATLAS_SLICES[i].weight }} className={i === 2 ? "is-now" : ""}>
                <span className="e-atlas__capw"><b className="e-long">{c.w}</b><b className="e-short">{c.x}</b></span>
                {c.n ? <span className="e-atlas__capn">{c.n}</span> : null}
                {c.s ? <span className="e-atlas__caps2">{c.s}</span> : null}
              </li>
            ))}
          </ol>
          {/* Legend — sits under the map, aligned with the visual it describes. */}
          <ul className="e-atlas__points">
            {t.points.map((p) => (
              <li key={p.k}>
                <i className={`e-atlas__glyph e-atlas__glyph--${p.k}`} aria-hidden />
                <span className="e-body">{p.t}</span>
              </li>
            ))}
          </ul>
      </div>
    </section>
  );
}

/* -- RESTRAINED: mid-page beta nudge between Atlas and Explore ----------------- */
const BETA_CTA = {
  es: { line: "Las primeras plazas son para quienes están en lista.", cta: "Quiero entrar al primer grupo" },
  en: { line: "First access goes to people already on the list.", cta: "Join the first group" },
};
function BetaCta({ lang }: { lang: Lang }) {
  const t = BETA_CTA[lang];
  const target = lang === "es" ? "#lista" : "#waitlist";
  return (
    <div className="e-beta-cta">
      <p className="e-beta-cta__line">{t.line}</p>
      <a href={target} className="e-btn e-btn--secondary e-btn--compact">{t.cta}</a>
    </div>
  );
}

/* Real Explore captures, if they have been added (drop them in src/assets/app/):
 *   explore-workshop-{es,en}.webp  explore-voices-{es,en}.webp  explore-listening-{es,en}.webp
 * With all three present the preview shows the app's screens; until then it shows
 * the app's own Explore paper art, never a drawn imitation of the UI. */
const EXPLORE_SHOTS = import.meta.glob("@/assets/app/explore-*-*.webp", { eager: true, import: "default" }) as Record<string, string>;
function exploreShot(kind: string, lang: Lang): string | undefined {
  const hit = Object.entries(EXPLORE_SHOTS).find(([k]) => k.endsWith(`explore-${kind}-${lang}.webp`));
  return hit?.[1];
}

/* -- OPEN, warm: Explore as one concise preview -------------------------------- */
function Explore({ lang }: { lang: Lang }) {
  const t = COPY[lang].explore;
  const kinds = ["workshop", "voices", "listening"] as const;
  const art = [exArtWorkshop, exArtVoices, exArtListening];
  const shots = kinds.map((k) => exploreShot(k, lang));
  const real = shots.every(Boolean);
  return (
    <section id={lang === "es" ? "explorar" : "explore"} className="e-warm relative py-9 sm:py-11">
      <div className={`${WRAP} grid items-center gap-7 lg:grid-cols-12 lg:gap-10`}>
        <Reveal className="lg:col-span-5">
          <p className="e-eyebrow">{t.eyebrow}</p>
          <h2 className="e-h1 mt-3 text-ink">{t.title}</h2>
          <p className="e-body mt-4">{t.lead}</p>
          <p className="e-explore-intent mt-5">{t.intent}</p>
        </Reveal>

        <div className="lg:col-span-7">
          {real ? (
            <div className="grid grid-cols-3 gap-4">
              {shots.map((src, i) => (
                <Shot key={i} src={src as string} alt={t.places[i].alt} />
              ))}
            </div>
          ) : (
            <div className="e-ex-cluster" aria-hidden>
              {art.map((src, i) => (
                <img key={i} src={src} alt="" width={900} height={i === 0 ? 900 : 507} loading="lazy" decoding="async" className={`e-ex-cluster__piece e-ex-cluster__piece--${i}`} />
              ))}
            </div>
          )}
          <ul className="e-ex-places mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-3">
            {t.places.map((p) => (
              <li key={p.k} className="e-place">
                <h3 className="e-h3 text-ink">{p.k}</h3>
                <p className="e-caption mt-1">{p.v}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -- HUMAN: Circles, shown rather than described ------------------------------- */
function Circles({ lang }: { lang: Lang }) {
  const t = COPY[lang].product.circles;
  const d = t.demo;
  return (
    <section id={lang === "es" ? "circulos" : "circles"} className="relative z-[2] py-10 sm:py-12">
      <div className={`${WRAP} relative grid items-center gap-8 lg:grid-cols-12 lg:gap-10`}>
        <div className="lg:col-span-5">
          <Reveal>
            <p className="e-eyebrow">{t.eyebrow}</p>
            <h2 className="e-display-l mt-3 text-ink">{t.title}</h2>
            <p className="e-lead mt-4 max-w-md">{t.body}</p>
            <ul className="e-circle-points mt-5">
              {t.points.map((p) => (
                <li key={p.k} className="e-point">
                  <span className="e-label text-ink">{p.k}.</span> <span className="e-body">{p.v}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* One question, three answers, and the real screen behind them. */}
        <div className="lg:col-span-7">
          <Reveal>
            <div className="e-circle-stage">
              <Shot src={lang === "es" ? circlesEs : circlesEn} alt={t.title} className="e-circle-stage__phone" />
              <div className="e-circle-stage__slips">
                <div className="e-sheet e-circle-q">
                  <p className="e-eyebrow">{d.kicker}</p>
                  <p className="e-circle-q__text">{d.question}</p>
                  <p className="e-caption mt-2">{d.asked}</p>
                </div>
                {d.slips.map((sl, i) => (
                  <div key={sl.n} className={`e-slip e-slip--${i}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="e-label text-ink">{sl.n}</span>
                      <span className="e-slip__stamp">{sl.d}</span>
                    </div>
                    <p className="e-slip__text">{sl.t}</p>
                  </div>
                ))}
                <p className="e-caption e-circle-stage__note">{d.sample}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <Seam side="r" className="e-seam--low" />
    </section>
  );
}

const QUOTE = {
  es: "No encontrábamos el lugar suave que necesitábamos, así que empezamos a construirlo.",
  en: "We couldn't find the soft place we needed, so we started building it.",
} as const;

import mxPortrait from "@/assets/founders/mengxi.webp";
import alPortrait from "@/assets/founders/alejandra.webp";

/* -- ONE CHAPTER, TWO BEATS: Spanish understood, then who built it ----------- */
function Exchange({ you, elara, label, big = false }: { you: string; elara: string; label: { you: string; elara: string }; big?: boolean }) {
  return (
    <div className={`e-cx ${big ? "e-cx--big" : "e-cx--small"}`} lang="es">
      <p className="e-cx__tu">{label.you}</p>
      <p className="e-cx__you">{you}</p>
      <div className="e-cx__el">
        <Orb size={big ? 34 : 26} className="mt-1" />
        <p className="e-voice" aria-label={label.elara}>{elara}</p>
      </div>
    </div>
  );
}

function Chapter({ lang }: { lang: Lang }) {
  const c = COPY[lang].culture;
  const f = COPY[lang].founders;
  const [t1, ...t2] = c.title.split(/(?<=\.)\s+/);
  const quote = QUOTE[lang];
  const rest = f.note.replace(quote, "").replace(/\s+/g, " ").trim();
  const label = { you: c.youLabel, elara: c.elaraLabel };
  const [big, ...small] = c.pairs;
  const people = f.people.map((p, i) => ({ ...p, img: [mxPortrait, alPortrait][i] }));

  const caption = (p: (typeof people)[number]) => (
    <figcaption className="e-fcap">
      <p className="e-fcap__name">{p.name}</p>
      <p className="e-fcap__role">{p.role}</p>
      <a href={`https://instagram.com/${p.ig}`} target="_blank" rel="noreferrer" className="e-fcap__ig">
        @{p.ig}
      </a>
    </figcaption>
  );
  const portrait = (i: number, cls: string) => (
    <figure className={`e-fig ${cls}`}>
      <div className="e-ph-shadow">
        <div className="e-ph-wrap">
          <img src={people[i].img} alt={people[i].name} loading="lazy" decoding="async" className="e-ph" />
        </div>
      </div>
      {caption(people[i])}
    </figure>
  );

  return (
    <section id={lang === "es" ? "cultura" : "culture"} className="e-chap relative">
      <Paper src={fragMist} depth={10} sway={-26} className="e-frag-mist e-frag-mist--low" />
      <div className={`${WRAP} relative z-[2]`}>
        {/* Beat 1: Spanish, understood */}
        <div className="e-chap__one">
          <Reveal className="e-chap__head">
            <p className="e-eyebrow">{c.eyebrow}</p>
            <h2 className="e-chap__title mt-4 text-ink">
              {t1} <em>{t2.join(" ")}</em>
            </h2>
            <p className="e-lead mt-5">{c.body}</p>
          </Reveal>
          <Reveal delay={90} className="e-chap__talk">
            <Exchange {...big} you={big.you} elara={big.elara} label={label} big />
            <div className="e-chap__slips">
              {small.map((p) => (
                <Exchange key={p.you} you={p.you} elara={p.elara} label={label} />
              ))}
            </div>
          </Reveal>
        </div>

        {/* Beat 2: who built it */}
        <div className="e-chap__two">
          <Reveal className="e-chap__words">
            <blockquote className="e-pq">“{quote}”</blockquote>
            <p className="e-chap__eyebrow e-eyebrow">{f.eyebrow}</p>
            <p className="e-chap__sup e-chap__letter">{rest}</p>
            <p className="e-label mt-3 text-ink">{f.sign}</p>
          </Reveal>
          <Reveal delay={90} className="e-chap__people">
            {portrait(0, "e-fig--sm")}
            {portrait(1, "e-fig--lg")}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -- DUSK: a short bridge in changing light, from the human section into the forest -- */
function Dusk() {
  return (
    <div className="e-dusk" aria-hidden>
      <img src={duskArt} alt="" width={1600} height={300} loading="lazy" decoding="async" />
    </div>
  );
}

function Footer({ lang }: { lang: Lang }) {
  const t = COPY[lang].footer;
  return (
    <footer className="e-field e-field--night on-field py-14">
      <div className={`${WRAP} flex flex-wrap items-center justify-between gap-8`}>
        <Wordmark size={30} onDark />
        <nav className="flex flex-wrap items-center gap-6">
          <a href={t.privacyHref} className="e-label text-cream-72 transition-colors hover:text-cream">
            {t.privacy}
          </a>
          <a href="mailto:hola@holaelara.com" className="e-label text-cream-72 transition-colors hover:text-cream">
            {t.contact}
          </a>
          <a
            href="https://instagram.com/holaelara"
            target="_blank"
            rel="noreferrer"
            className="e-label text-cream-72 transition-colors hover:text-cream"
          >
            Instagram
          </a>
        </nav>
        <div className="w-full sm:w-auto">
          <p className="e-caption">
            © {new Date().getFullYear()} Elara · {t.line}
          </p>
          <p className="e-caption mt-1">{t.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}

export function ElaraLanding({ lang }: { lang: Lang }) {
  return (
    <main className="min-h-screen overflow-x-clip text-ink" lang={lang}>
      <Nav lang={lang} />
      {/* immersive */}
      <Hero lang={lang} />
      {/* compact */}
      <Passage lang={lang} />
      {/* water: first strong tonal contrast */}
      <Water lang={lang} />
      {/* product-dense */}
      <HowAndProduct lang={lang} />
      {/* open */}
      <Areas lang={lang} />
      <Atlas lang={lang} />
      <BetaCta lang={lang} />
      <Explore lang={lang} />
      {/* human */}
      <Circles lang={lang} />
      <Chapter lang={lang} />
      {/* light -> dusk -> deep forest -> night */}
      <Dusk />
      <ElaraTaste lang={lang} />
      {/* conversion */}
      <Waitlist lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}
