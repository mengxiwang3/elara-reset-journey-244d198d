import nightDesk from "@/assets/env/night-desk.webp";
import nightMob from "@/assets/env/night-mob.webp";
import { useState } from "react";
import { Reveal } from "./Reveal";

/**
 * Founding waitlist — the one functional screen on the page. Light paper,
 * because it has a form (Paper at dusk §04). Fields are soft sheets, the label
 * sits 8px above its field, and the one primary action is a forest pill.
 * Terracotta appears once, as the live dot: it marks that something is
 * happening now, and it never asks for a tap.
 */

const COPY = {
  es: {
    label: "Lista de espera",
    title: "Sé una de las primeras mujeres dentro de Elara.",
    body: "Las primeras de la lista entran al primer grupo, opinan de verdad en lo que construimos y reciben un saludo personal de nosotras, no un correo de bienvenida genérico.",
    live: "Abriendo pronto",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    optional: "(opcional)",
    pain: "¿Qué se siente más pesado ahora mismo?",
    painPlaceholder: "Elige una…",
    submit: "Unirme a la lista de espera",
    loading: "Un segundo…",
    error: "Algo falló. Inténtalo otra vez o escríbenos a",
    note: "Leemos cada respuesta, de verdad.",
    privacy: "Sin spam. Nunca. Baja con un solo toque.",
    doneTitle: "Listo. Te escribimos pronto.",
    doneBody: "Te vamos a escribir a mano antes de abrir. Mientras tanto, no tienes que hacer nada.",
    options: [
      "Presión económica / independencia financiera",
      "Me siento dispersa o desbordada",
      "Agotada emocionalmente, funcionando al mínimo",
      "No sé qué quiero realmente",
      "Exitosa por fuera, sola por dentro",
      "Expectativas familiares vs. mi propia vida",
      "Estancada en una reinvención, sin saber hacia dónde",
    ],
  },
  en: {
    label: "Waitlist",
    title: "Be one of the first women inside Elara.",
    body: "The first women on the list join the first group, get a real say in what we build, and a personal hello from us, not a generic welcome email.",
    live: "Opening soon",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@email.com",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    optional: "(optional)",
    pain: "What feels heaviest right now?",
    painPlaceholder: "Choose one…",
    submit: "Join the waitlist",
    loading: "One second…",
    error: "Something went wrong. Try again or write to us at",
    note: "We read every reply, really.",
    privacy: "No spam. Ever. One tap to leave.",
    doneTitle: "You're on the list.",
    doneBody: "We'll write to you by hand before we open. Until then, there's nothing you need to do.",
    options: [
      "Money pressure / financial independence",
      "Feeling scattered or overwhelmed",
      "Emotionally drained, running on empty",
      "Unsure what I actually want next",
      "High-functioning but quietly lonely",
      "Family expectations vs. my own life",
      "Stuck in reinvention, unsure of next steps",
    ],
  },
} as const;

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      {/* Label -> content is 8px. Always. */}
      <span className="e-label mb-2 block text-ink-72">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-55">{optional}</span>}
      </span>
      {children}
    </label>
  );
}

export function Waitlist({ lang }: { lang: "es" | "en" }) {
  const t = COPY[lang];
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", instagram: "", pain: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          whatsapp: form.whatsapp.trim() || undefined,
          instagram: form.instagram.trim() || undefined,
          pain: form.pain || undefined,
          language: lang,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id={lang === "es" ? "lista" : "waitlist"} className="e-night on-field relative overflow-hidden py-14 sm:py-20">
      {/* The same Elara world at night: violet-blue sky, a crescent, a cream path home. */}
      <picture className="e-night__art" aria-hidden>
        <source media="(max-width: 767px)" srcSet={nightMob} />
        <img src={nightDesk} alt="" width={1600} height={988} loading="lazy" decoding="async" />
      </picture>
      <div className="e-night__grid relative z-[2] mx-auto grid w-full max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="e-night__copy max-w-[31rem] lg:col-span-5">
        <Reveal>
          <p className="e-eyebrow flex items-center gap-2.5">
            {/* The one rust mark on this screen: something is live. */}
            <span className="e-dot" aria-hidden />
            {t.live}
          </p>
          <h2 className="e-h1 mt-4">{t.title}</h2>
          <p className="e-lead mt-5">{t.body}</p>
        </Reveal>
        </div>

        <div className="e-night__form w-full max-w-[31rem] lg:col-span-6 lg:col-start-7 lg:max-w-none">

        {submitted ? (
          /* Completion: butter field, one calm line. No confetti, no badge,
             no points animation. */
          <div className="e-arrive e-card-forest on-field p-7 sm:p-9">
            <p className="e-h2">{t.doneTitle}</p>
            <p className="e-body mt-2">{t.doneBody}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="e-sheet grid gap-5 p-6 sm:p-8">
            <Field label={t.name}>
              <input
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="e-input"
                placeholder={t.namePlaceholder}
              />
            </Field>

            <Field label={t.email}>
              <input
                required
                type="email"
                maxLength={120}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="e-input"
                placeholder={t.emailPlaceholder}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.whatsapp} optional={t.optional}>
                <input
                  maxLength={30}
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="e-input"
                  placeholder="+1 555 000 0000"
                />
              </Field>
              <Field label={t.instagram} optional={t.optional}>
                <input
                  maxLength={60}
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  className="e-input"
                  placeholder="@usuario"
                />
              </Field>
            </div>

            <Field label={t.pain} optional={t.optional}>
              <select
                value={form.pain}
                onChange={(e) => setForm({ ...form, pain: e.target.value })}
                className="e-input"
              >
                <option value="">{t.painPlaceholder}</option>
                {t.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>

            {error && (
              <p className="e-small" style={{ color: "var(--error)" }} role="alert">
                {t.error}{" "}
                <a href="mailto:hola@holaelara.com" className="e-link">
                  hola@holaelara.com
                </a>
              </p>
            )}

            <button type="submit" disabled={loading} className="e-btn e-btn--primary mt-1 w-full">
              {loading ? t.loading : t.submit}
            </button>

            <p className="e-caption text-center">
              {t.note} {t.privacy}
            </p>
          </form>
        )}
        </div>
      </div>
    </section>
  );
}
