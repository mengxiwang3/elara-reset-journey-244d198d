import { useState } from "react";
import { Sun, CheckCircle2, Instagram } from "lucide-react";
import { Reveal } from "./Reveal";

const underline =
  "relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full";
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
        <a href="#top" className="font-serif text-2xl tracking-tight text-foreground">
          elara<span className="text-accent">.</span>
        </a>
        <nav className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className={`hover:text-foreground transition ${underline}`}>How it works</a>
          <a href="#product" className={`hover:text-foreground transition ${underline}`}>Inside Elara</a>
          <a href="#community" className={`hover:text-foreground transition ${underline}`}>Community</a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span className="text-foreground">EN</span>
            <span className="text-border/60">|</span>
            <a href="/es" className="text-muted-foreground hover:text-foreground transition">ES</a>
          </div>
          <a href="#waitlist" className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition">
            Join waitlist
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none animate-breathe" aria-hidden />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-12 items-center relative">
        <div className="lg:col-span-7 animate-fade-up">
          <span className="inline-flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-muted-foreground">
            <span className="h-px w-8 bg-accent" aria-hidden /> Spanish-first · Founding waitlist open
          </span>
          <h1 className="mt-6 font-serif text-[2.5rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem] text-foreground text-balance">
            Daily AI support for money, clarity, and stability — <em className="italic text-accent">in her language, her voice.</em>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Elara is a Spanish-first 7-day AI reset for Latina women navigating money pressure, family expectations,
            ambition, and emotional overload — one honest check-in at a time.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#waitlist" className="group inline-flex items-center gap-2.5 rounded-lg bg-primary text-primary-foreground px-7 py-3.5 text-base font-medium shadow-soft hover:bg-accent transition-colors">
              Join the waitlist
              <span className="text-accent group-hover:text-primary-foreground transition-colors" aria-hidden>→</span>
            </a>
            <a href="#how" className="inline-flex items-center gap-2 rounded-lg border border-foreground/20 px-7 py-3.5 text-base font-medium text-foreground hover:border-foreground/40 transition">
              See how it works
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Built quietly. Launching soon. Free for founding members.</p>
          <p className="mt-2 text-sm text-muted-foreground/70 italic">Built first for Latina women — <a href="/es" className="text-accent hover:text-foreground transition not-italic underline underline-offset-2">en su idioma, con su voz, a su ritmo.</a></p>
          <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-6 max-w-xl border-t border-border/60 pt-7">
            {[
              ["1.8M+", "engaged audience"],
              ["80K", "direct community"],
              ["4,600+", "survey responses"],
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
                alt="Elara app — today screen with daily compass"
                className="rounded-[1.9rem] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur rounded-2xl shadow-card p-4 max-w-[220px] border border-border/60">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-medium">
                <Sun className="h-3.5 w-3.5" /> Day 3 · Morning
              </div>
              <p className="mt-2 text-sm text-foreground leading-snug">
                "What part of you needs softness today?"
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
      <Reveal className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Built with — not for</p>
        <p className="mt-4 font-serif text-2xl sm:text-3xl text-foreground/90 max-w-3xl mx-auto leading-snug text-balance">
          Shaped by 1,998 survey responses and an 80K direct community of Latina women navigating
          money pressure, ambition, reinvention, family, and softness.
        </p>
        <p className="mt-6 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We start with Money Clarity because financial pressure was the clearest pull in our community — then expand into the life systems around it: confidence, habits, family, purpose, and emotional wellbeing.
        </p>
      </Reveal>
    </section>
  );
}

const problems = [
  { title: "High-functioning, quietly depleted", body: "You're delivering for everyone. The exhaustion lives somewhere only you can feel it." },
  { title: "Structure, without the pressure", body: "Not another productivity system. Something that meets you where you actually are this week." },
  { title: "Softness and ambition, at once", body: "You don't have to choose between rest and reaching. Elara holds both." },
  { title: "Support that gets the context", body: "Your culture, your family, your standards. Guidance that doesn't flatten any of it." },
];

function Problem() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal className="lg:sticky lg:top-28">
            <p className="text-sm uppercase tracking-[0.2em] text-accent">If this sounds familiar</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-foreground text-balance">
              You don't need another app. You need a place to land.
            </h2>
          </Reveal>
        </div>
        <div className="lg:col-span-7 border-t border-foreground/10">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 90} className="flex gap-6 py-7 border-b border-foreground/10">
              <span className="shrink-0 w-9 font-serif text-2xl italic text-accent/70">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-serif text-2xl text-foreground">{p.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const screens = [
  { src: appPath, label: "Personalized path", caption: "Your context, not a template." },
  { src: appToday, label: "Daily compass", caption: "Three small acts a day." },
  { src: appReflection, label: "Gentle reflection", caption: "Awareness before action." },
  { src: appCommunity, label: "Today's circle", caption: "Walking with you." },
  { src: appClarity, label: "Clarity blueprint", caption: "Where to focus first." },
];

function PhoneMockup({ src, label, caption }: { src: string; label: string; caption: string }) {
  return (
    <div className="shrink-0 w-[220px] sm:w-[240px]">
      <div className="hover-lift relative rounded-[2.2rem] p-2.5 bg-card border border-border/60 shadow-soft hover:shadow-soft">
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
    <section id="product" className="py-24 sm:py-32 bg-gradient-warm">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <Reveal className="max-w-2xl ml-auto text-right">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Inside Elara</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-foreground text-balance">
            A small, beautiful place for your inner life.
          </h2>
        </Reveal>
      </div>
      <div className="mt-14 overflow-x-auto pb-6 scrollbar-hide">
        <div className="flex gap-5 sm:gap-7 px-5 sm:px-8 lg:justify-center min-w-max">
          {screens.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="shrink-0">
              <PhoneMockup {...s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "A 4-minute honest check-in", body: "No scoring. No shame. Just where you actually are today." },
  { n: "02", title: "A 7-day path made for your season", body: "Money, mind, body, people, purpose — whatever is loudest first." },
  { n: "03", title: "Daily rituals, gentle AI, real circle", body: "Soft structure that sticks, with women walking beside you." },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">How it works</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-foreground text-balance">
            Seven days. One quiet shift at a time.
          </h2>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-3 gap-12 md:gap-10">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="font-serif text-7xl text-accent/25 leading-none">{s.n}</div>
              <h3 className="mt-4 font-serif text-2xl text-foreground leading-snug">{s.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section id="community" className="py-24 sm:py-32">
      <Reveal className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="rounded-[2.5rem] bg-primary text-primary-foreground p-10 sm:p-16 shadow-soft relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl animate-breathe" aria-hidden />
          <div className="relative">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-primary-foreground/80">
              <span className="h-px w-8 bg-primary-foreground/40" aria-hidden /> Latina-first community
            </div>
            <h2 className="mt-6 font-serif text-3xl sm:text-5xl text-balance leading-tight">
              Launching first with Latina women — because family, ambition, and softness all live in the same body.
            </h2>
            <p className="mt-6 text-base sm:text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
              For the eldest daughters, the first-gen everything, the ones who translate at home and lead at work.
              For the reinventors, the bilingual minds, the women learning that independence and tenderness can share a life.
            </p>
            <ul className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-1.5 max-w-2xl font-serif text-lg sm:text-xl text-primary-foreground/65">
              {["Family expectations","Reinvention","Ambition","Emotional growth","Bilingual identity","Independence","Softness","Confidence","Culture"].map((t, i, arr) => (
                <li key={t} className="inline-flex items-center gap-3">
                  <span className="transition-colors hover:text-primary-foreground">{t}</span>
                  {i < arr.length - 1 && <span className="text-accent/60" aria-hidden>·</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const PAIN_OPTIONS = [
  "Money pressure / financial independence",
  "Feeling scattered or overwhelmed",
  "Emotionally drained, running on empty",
  "Unsure what I actually want next",
  "High-functioning but quietly lonely",
  "Family expectations vs. my own life",
  "Stuck in reinvention, unsure of next steps",
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
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="waitlist" className="py-24 sm:py-32 bg-gradient-warm">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Founding waitlist</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-foreground text-balance">
            Be one of the first women inside Elara.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Founding members get free access to the first cohort, early influence on what we build, and a personal welcome from the team.
          </p>
        </Reveal>

        {submitted ? (
          <div className="mt-12 rounded-3xl border border-border bg-card p-10 shadow-card">
            <CheckCircle2 className="h-10 w-10 text-accent mx-auto" />
            <h3 className="mt-4 font-serif text-2xl text-foreground">You're on the list.</h3>
            <p className="mt-2 text-muted-foreground">We'll be in touch soon, gently. Bienvenida.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 grid gap-3 text-left bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-card">
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Name</span>
              <input
                required maxLength={80}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your first name"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
              <input
                required type="email" maxLength={120}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp <span className="normal-case text-muted-foreground/70">(optional)</span></span>
              <input
                maxLength={30}
                value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="+1 555 000 0000"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Instagram <span className="normal-case text-muted-foreground/70">(optional)</span></span>
              <input
                maxLength={60}
                value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="@handle"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">What's loudest right now? <span className="normal-case text-muted-foreground/70">(optional)</span></span>
              <select
                value={form.pain} onChange={(e) => setForm({ ...form, pain: e.target.value })}
                className="rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Choose one…</option>
                {PAIN_OPTIONS.map((o) => (
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
              className="group mt-2 inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary text-primary-foreground px-7 py-3.5 text-base font-medium shadow-soft hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Joining…" : "Join the founding waitlist"}
              {!loading && <span className="text-accent group-hover:text-primary-foreground transition-colors" aria-hidden>→</span>}
            </button>
            <p className="text-xs text-muted-foreground text-center">No spam. Ever. Unsubscribe with one tap.</p>
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
        <Reveal>
          <p className="text-sm uppercase tracking-[0.2em] text-accent text-center">A note from the team</p>
          <blockquote className="mt-6 mx-auto max-w-3xl font-serif text-2xl sm:text-3xl text-foreground leading-snug text-balance text-center">
            "Elara was built for women who look successful from the outside, but privately feel overwhelmed,
            lonely, or unsure what they actually want next."
          </blockquote>
        </Reveal>

        <div className="mt-16 grid sm:grid-cols-2 gap-10 sm:gap-14">
          {[
            { img: founderMengxi, name: "Mengxi Wang", role: "Product & design", ig: "karawang", pos: "center top" },
            { img: founderAlejandra, name: "Alejandra Ramirez", role: "Creator & community", ig: "alejandra.travels", pos: "center 30%" },
          ].map((f, i) => (
            <Reveal key={f.name} delay={i * 120}>
              <figure className="flex flex-col items-center text-center">
                <div className="group relative w-48 h-48 sm:w-56 sm:h-56">
                  <div className="absolute -inset-3 bg-gradient-warm rounded-full blur-xl opacity-50 transition-opacity duration-500 group-hover:opacity-80" aria-hidden />
                  <div className="relative w-full h-full rounded-full overflow-hidden shadow-card">
                    <img src={f.img} alt={f.name} loading="lazy"
                      className="img-zoom w-full h-full object-cover"
                      style={{ objectPosition: f.pos }} />
                  </div>
                </div>
                <figcaption className="mt-6">
                  <p className="font-serif text-2xl text-foreground">{f.name}</p>
                  <p className="text-sm uppercase tracking-wider text-muted-foreground mt-1">{f.role}</p>
                  <a href={`https://instagram.com/${f.ig}`} target="_blank" rel="noreferrer"
                    className={`mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:text-foreground transition ${underline}`}>
                    <Instagram className="h-4 w-4" /> @{f.ig}
                  </a>
                </figcaption>
              </figure>
            </Reveal>
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
        <p>© {new Date().getFullYear()} Elara. Made with care.</p>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
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