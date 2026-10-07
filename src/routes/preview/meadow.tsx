import { createFileRoute } from "@tanstack/react-router";
import { MeadowExplainer } from "@/components/meadow/MeadowExplainer";
import todayEs from "@/assets/meadow/today-es-day4.webp";
import todayEn from "@/assets/meadow/today-en-day4.webp";

/**
 * Preview only: Mist Meadow as a product explainer under a real Today hero.
 * Not linked from the production landing pages. ?lang=en switches to English.
 */
export const Route = createFileRoute("/preview/meadow")({
  validateSearch: (s: Record<string, unknown>): { lang: "es" | "en" } => ({
    lang: s.lang === "en" ? "en" : "es",
  }),
  head: () => ({
    meta: [{ title: "Elara · Mist Meadow (vista previa)" }, { name: "robots", content: "noindex" }],
  }),
  component: MeadowPreview,
});

const HERO = {
  es: {
    h1a: "Para la mujer que sostiene todo, ",
    h1b: "aunque nadie lo note.",
    sub: "Elara es un reset guiado de 7 días. Esta es la pantalla Hoy: el día de tu camino, una sola práctica y un botón para empezar.",
    cta: "Ver cómo se abre el camino",
    alt: "Pantalla Hoy de Elara en el día 4 de 7: saludo, mundo del camino, práctica del día y botón Empezar la práctica de hoy.",
    cap: "Pantalla Hoy de la app, día 4 de 7.",
    img: todayEs,
    toggle: { href: "/preview/meadow?lang=en", label: "EN" },
  },
  en: {
    h1a: "For the woman who holds it all together, ",
    h1b: "even when no one notices.",
    sub: "Elara is a guided 7-day reset. This is the Today screen: the day of your path, one practice and one button to begin.",
    cta: "See how the path opens",
    alt: "Elara Today screen on day 4 of 7: greeting, the path world, today's practice and the Start today's practice button.",
    cap: "The app's Today screen, day 4 of 7.",
    img: todayEn,
    toggle: { href: "/preview/meadow?lang=es", label: "ES" },
  },
} as const;

function MeadowPreview() {
  const { lang } = Route.useSearch();
  const h = HERO[lang];
  return (
    <main className="mm-page" lang={lang}>
      <header className="mm-top">
        <a href="/es" className="font-serif text-2xl tracking-tight text-foreground">
          elara<span className="text-accent">.</span>
        </a>
        <a
          href={h.toggle.href}
          className="rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          {h.toggle.label}
        </a>
      </header>
      <section className="mm-hero" aria-label="Elara">
        <div className="mm-hero-copy">
          <h1 className="font-serif text-[2.05rem] leading-[1.06] sm:text-6xl lg:text-[4.2rem] text-foreground text-balance">
            {h.h1a}
            <em className="italic text-accent">{h.h1b}</em>
          </h1>
          <p className="mt-4 text-base sm:mt-6 sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
            {h.sub}
          </p>
          <a
            href="#prado"
            className="mt-6 sm:mt-8 inline-flex items-center gap-2.5 rounded-lg bg-primary text-primary-foreground px-7 py-3.5 text-base font-medium shadow-soft hover:bg-accent transition-colors"
          >
            {h.cta}
            <span aria-hidden>↓</span>
          </a>
        </div>
        <figure className="mm-hero-shot">
          <img src={h.img} alt={h.alt} width={804} height={1748} fetchPriority="high" />
          <figcaption className="mt-3 text-sm text-muted-foreground">{h.cap}</figcaption>
        </figure>
      </section>
      <MeadowExplainer lang={lang} />
    </main>
  );
}
