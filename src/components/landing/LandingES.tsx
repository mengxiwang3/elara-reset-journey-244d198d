import { useState } from "react";
import { ArrowRight, Sparkles, Heart, Compass, Users, MessageCircleHeart, Sun, CheckCircle2, Instagram } from "lucide-react";
import appToday from "@/assets/app-today.png";
import appCommunity from "@/assets/app-community.png";
import appClarity from "@/assets/app-clarity.png";
import appReflection from "@/assets/app-reflection.png";
import appPath from "@/assets/app-path.png";
import founderMengxi from "@/assets/founder-mengxi.jpg";
import founderAlejandra from "@/assets/founder-alejandra.jpg";

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="/es" className="font-serif text-2xl tracking-tight text-foreground">
          elara<span className="text-accent">.</span>
        </a>
        <nav className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#como" className="hover:text-foreground transition">Cómo funciona</a>
          <a href="#producto" className="hover:text-foreground transition">Dentro de Elara</a>
          <a href="#comunidad" className="hover:text-foreground transition">Comunidad</a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <a href="/" className="text-muted-foreground hover:text-foreground transition">EN</a>
            <span className="text-border/60">|</span>
            <span className="text-foreground">ES</span>
          </div>
          <a href="#lista" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition">
            Unirme a la lista
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" aria-hidden />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-12 items-center relative">
        <div className="lg:col-span-7 animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs tracking-wide uppercase text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Primera en español · Lista de espera fundadora abierta
          </span>
          <h1 className="mt-6 font-serif text-[2.5rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem] text-foreground text-balance">
            Para la mujer que sostiene todo, <em className="italic text-accent">aunque nadie lo note.</em>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Elara es un reset guiado de 7 días para mujeres ambiciosas que por fuera parecen estar bien,
            pero por dentro se sienten saturadas, dispersas o lejos de sí mismas.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#lista" className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-base font-medium shadow-soft hover:translate-y-[-1px] transition">
              Unirme a la lista de espera
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </a>
            <a href="#como" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 text-base font-medium text-foreground hover:bg-card transition">
              Ver cómo funciona
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Construido en silencio. Abriendo pronto. Gratis para fundadoras.</p>
          <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-6 max-w-xl border-t border-border/60 pt-7">
            {[
              ["1.8M+", "audiencia social"],
              ["80K", "comunidad directa"],
              ["4,600+", "respuestas de mujeres"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-serif text-2xl text-foreground">{n}</dt>
                <dd className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-sm animate-float">
            <div className="absolute -inset-6 bg-gradient-warm rounded-[2rem] blur-2xl opacity-60" aria-hidden />
            <div className="relative rounded-[2.4rem] p-3 bg-foreground/5 backdrop-blur shadow-soft border border-border/60">
              <img
                src={appToday}
                alt="App Elara — pantalla de inicio con brújula diaria"
                className="rounded-[1.9rem] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur rounded-2xl shadow-card p-4 max-w-[220px] border border-border/60">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-medium">
                <Sun className="h-3.5 w-3.5" /> Día 3 · Mañana
              </div>
              <p className="mt-2 text-sm text-foreground leading-snug">
                "¿Qué parte de ti necesita suavidad hoy?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="py-14 border-y border-border/50 bg-card/40">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Construido con — no para</p>
        <p className="mt-4 font-serif text-2xl sm:text-3xl text-foreground/90 max-w-3xl mx-auto leading-snug text-balance">
          Moldeado por 1,998 respuestas de mujeres y una comunidad directa de 80K latinas navegando
          presión económica, ambición, reinvención, familia y suavidad.
        </p>
        <p className="mt-6 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Empezamos con Claridad Financiera porque la presión económica fue lo que más resonó en nuestra comunidad — y desde ahí abrimos los sistemas de vida que la rodean: confianza, hábitos, familia, propósito y bienestar emocional.
        </p>
      </div>
    </section>
  );
}

const problems = [
  { icon: Sun, title: "Funcionando al máximo, agotada en silencio", body: "Estás entregando para todos. El cansancio vive en un lugar donde solo tú puedes sentirlo." },
  { icon: Compass, title: "Estructura, sin la presión", body: "No es otro sistema de productividad. Es algo que te recibe exactamente donde estás esta semana." },
  { icon: Heart, title: "Suavidad y ambición, al mismo tiempo", body: "No tienes que elegir entre el descanso y el crecimiento. Elara sostiene los dos." },
  { icon: MessageCircleHeart, title: "Apoyo que entiende el contexto", body: "Tu cultura, tu familia, tus estándares. Orientación que no aplana nada de eso." },
];

function Problem() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Si esto te suena familiar</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-foreground text-balance">
            No necesitas otra app. Necesitas un lugar donde aterrizar.
          </h2>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          {problems.map((p) => (
            <div key={p.title} className="group rounded-3xl border border-border/70 bg-card p-7 shadow-card hover:shadow-soft transition">
              <div className="h-11 w-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl text-foreground">{p.title}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const screens = [
  { src: appPath, label: "Tu camino personalizado", caption: "Tu contexto, no una plantilla." },
  { src: appToday, label: "Brújula diaria", caption: "Tres pequeños actos al día." },
  { src: appReflection, label: "Reflexión suave", caption: "Conciencia antes que acción." },
  { src: appCommunity, label: "El círculo de hoy", caption: "Caminando contigo." },
  { src: appClarity, label: "Mapa de claridad", caption: "En qué enfocarte primero." },
];

function PhoneMockup({ src, label, caption }: { src: string; label: string; caption: string }) {
  return (
    <div className="shrink-0 w-[220px] sm:w-[240px]">
      <div className="relative rounded-[2.2rem] p-2.5 bg-card border border-border/60 shadow-soft">
        <img src={src} alt={`Elara app — ${label}`} loading="lazy"
          className="rounded-[1.8rem] w-full object-cover" />
      </div>
      <p className="mt-4 text-center font-serif text-lg text-foreground">{label}</p>
      <p className="text-center text-xs text-muted-foreground mt-1">{caption}</p>
    </div>
  );
}

function Product() {
  return (
    <section id="producto" className="py-24 sm:py-32 bg-gradient-warm">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Dentro de Elara</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-foreground text-balance">
            Un espacio pequeño y hermoso para tu vida interior.
          </h2>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            Al final de la semana, sales con más claridad sobre lo que necesitas, un plan de reset personalizado y un ritmo diario más suave que sí puedes sostener.
          </p>
        </div>
      </div>
      <div className="mt-14 overflow-x-auto pb-6 scrollbar-hide">
        <div className="flex gap-5 sm:gap-7 px-5 sm:px-8 lg:justify-center min-w-max">
          {screens.map((s) => (
            <PhoneMockup key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Un check-in honesto de 4 minutos", body: "Sin puntuaciones. Sin vergüenza. Solo dónde estás realmente hoy." },
  { n: "02", title: "Un camino de 7 días hecho para tu momento", body: "Dinero, mente, cuerpo, personas, propósito — lo que esté más pesado, primero." },
  { n: "03", title: "Rituales diarios, IA suave, círculo real", body: "Estructura gentil que se sostiene, con mujeres caminando a tu lado." },
];

function HowItWorks() {
  return (
    <section id="como" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Cómo funciona</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-foreground text-balance">
            Siete días. Un cambio tranquilo a la vez.
          </h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="rounded-3xl border border-border/70 bg-card p-8 shadow-card">
              <div className="font-serif text-5xl text-accent/80">{s.n}</div>
              <h3 className="mt-4 font-serif text-2xl text-foreground leading-snug">{s.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section id="comunidad" className="py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="rounded-[2.5rem] bg-primary text-primary-foreground p-10 sm:p-16 shadow-soft relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" aria-hidden />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-3 py-1 text-xs uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" /> Comunidad Latina-first
            </div>
            <h2 className="mt-6 font-serif text-3xl sm:text-5xl text-balance leading-tight">
              Diseñada primero para mujeres latinas — porque la familia, la ambición y la suavidad viven en el mismo cuerpo.
            </h2>
            <p className="mt-6 text-base sm:text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
              Para las hijas mayores, las primeras en su familia en todo, las que traducen en casa y lideran en el trabajo.
              Para las reinventoras, las mentes bilingües, las mujeres aprendiendo que la independencia y la ternura pueden compartir una vida.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2 max-w-2xl">
              {["Expectativas familiares","Reinvención","Ambición","Crecimiento emocional","Identidad bilingüe","Independencia","Suavidad","Confianza","Cultura"].map((t) => (
                <li key={t} className="text-xs uppercase tracking-wider rounded-full border border-primary-foreground/25 px-3 py-1.5 text-primary-foreground/85">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const PAIN_OPTIONS_ES = [
  "Presión económica / independencia financiera",
  "Me siento dispersa o desbordada",
  "Agotada emocionalmente, funcionando al mínimo",
  "No sé qué quiero realmente",
  "Exitosa por fuera, sola por dentro",
  "Expectativas familiares vs. mi propia vida",
  "Estancada en una reinvención, sin saber hacia dónde",
];

function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", instagram: "", pain: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: "es" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Algo salió mal. Por favor, inténtalo de nuevo.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="lista" className="py-24 sm:py-32 bg-gradient-warm">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">Lista de espera fundadora</p>
        <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-foreground text-balance">
          Sé una de las primeras mujeres dentro de Elara.
        </h2>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
          Las fundadoras obtienen acceso gratuito a la primera cohorte, influencia temprana en lo que construimos y una bienvenida personal del equipo.
        </p>

        {submitted ? (
          <div className="mt-12 rounded-3xl border border-border bg-card p-10 shadow-card">
            <CheckCircle2 className="h-10 w-10 text-accent mx-auto" />
            <h3 className="mt-4 font-serif text-2xl text-foreground">Ya estás en la lista.</h3>
            <p className="mt-2 text-muted-foreground">Te escribiremos antes de abrir la primera cohorte de Elara. Bienvenida.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 grid gap-3 text-left bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-card">
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Nombre</span>
              <input
                required maxLength={80}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tu nombre"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
              <input
                required type="email" maxLength={120}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="tu@email.com"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp <span className="normal-case text-muted-foreground/70">(opcional)</span></span>
              <input
                maxLength={30}
                value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="+1 555 000 0000"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Instagram <span className="normal-case text-muted-foreground/70">(opcional)</span></span>
              <input
                maxLength={60}
                value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="@usuario"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">¿Qué se siente más pesado ahora mismo? <span className="normal-case text-muted-foreground/70">(opcional)</span></span>
              <select
                value={form.pain} onChange={(e) => setForm({ ...form, pain: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Elige una…</option>
                {PAIN_OPTIONS_ES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-base font-medium shadow-soft hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Uniéndome…" : "Unirme a la lista de espera fundadora"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            <p className="text-xs text-muted-foreground text-center">Sin spam. Nunca. Baja con un solo toque.</p>
          </form>
        )}
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <p className="text-sm uppercase tracking-[0.2em] text-accent text-center">Una nota del equipo</p>
        <blockquote className="mt-6 mx-auto max-w-3xl font-serif text-2xl sm:text-3xl text-foreground leading-snug text-balance text-center">
          "Elara fue construida para mujeres que por fuera parecen exitosas, pero en privado se sienten abrumadas,
          solas o sin saber qué quieren realmente."
        </blockquote>

        <div className="mt-16 grid sm:grid-cols-2 gap-10 sm:gap-14">
          {[
            { img: founderMengxi, name: "Mengxi Wang", role: "Producto y diseño", ig: "karawang", pos: "center top" },
            { img: founderAlejandra, name: "Alejandra Ramirez", role: "Creadora y comunidad", ig: "alejandra.travels", pos: "center 30%" },
          ].map((f) => (
            <figure key={f.name} className="flex flex-col items-center text-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                <div className="absolute -inset-3 bg-gradient-warm rounded-full blur-xl opacity-50" aria-hidden />
                <img src={f.img} alt={f.name} loading="lazy"
                  className="relative rounded-full object-cover w-full h-full shadow-card"
                  style={{ objectPosition: f.pos }} />
              </div>
              <figcaption className="mt-6">
                <p className="font-serif text-2xl text-foreground">{f.name}</p>
                <p className="text-sm uppercase tracking-wider text-muted-foreground mt-1">{f.role}</p>
                <a href={`https://instagram.com/${f.ig}`} target="_blank" rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:text-foreground transition">
                  <Instagram className="h-4 w-4" /> @{f.ig}
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-serif text-lg text-foreground">elara<span className="text-accent">.</span></p>
        <nav className="flex items-center gap-5">
          <a href="#" className="hover:text-foreground transition">Privacidad</a>
          <a href="#" className="hover:text-foreground transition">Contacto</a>
          <a href="https://instagram.com/alejandra.travels" target="_blank" rel="noreferrer" className="hover:text-foreground transition">Instagram</a>
        </nav>
        <p>© {new Date().getFullYear()} Elara</p>
      </div>
    </footer>
  );
}

export function LandingES() {
  return (
    <main className="min-h-screen bg-background text-foreground" lang="es">
      <Nav />
      <Hero />
      <SocialProof />
      <Problem />
      <Product />
      <HowItWorks />
      <Community />
      <Waitlist />
      <Founder />
      <Footer />
    </main>
  );
}
