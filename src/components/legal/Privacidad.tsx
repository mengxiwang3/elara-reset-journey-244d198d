import { Wordmark } from "../elara/Wordmark";

const WRAP = "mx-auto w-full max-w-6xl px-5 sm:px-8";

type Lang = "es" | "en";

const MAIL = "privacidad@holaelara.com";

const COPY = {
  es: {
    home: "/",
    back: "Volver al inicio",
    homeLabel: "Elara — inicio",
    privacyHref: "/privacidad",
    privacy: "Privacidad",
    contact: "Contacto",
    footer: "Hecho por dos mujeres que también lo necesitaban.",
    title: "Política de Privacidad — Elara",
    updated: "Última actualización: 11 de octubre de 2026",
    sections: [
      {
        h: "Quiénes somos",
        body: [
          { mail: true, before: 'Elara ("nosotras") opera holaelara.com. Para cualquier asunto de privacidad, escríbenos a ', after: "." },
        ],
      },
      {
        h: "Qué datos recopilamos",
        body: [
          { p: "Cuando te unes a la lista de espera: tu nombre, correo electrónico y el idioma de la página que estabas viendo. Si quieres, también tu número de WhatsApp, tu usuario de Instagram y qué se siente más pesado ahora mismo (una opción de una lista). Esas tres últimas son opcionales." },
          { p: "Lo que escribes en la sección «Escríbele a Elara» se queda en tu navegador: no lo enviamos ni lo guardamos." },
        ],
      },
      {
        h: "Para qué los usamos",
        list: ["Avisarte cuando Elara esté disponible", "Escribirte sobre el lanzamiento y el reset de 7 días", "Entender quién forma parte de nuestra comunidad"],
        body: [{ p: "Base legal (RGPD): tu consentimiento (art. 6.1.a). Puedes retirarlo en cualquier momento." }],
      },
      {
        h: "Con quién los compartimos",
        body: [
          { p: "Guardamos tus datos en Cloudflare (alojamiento, seguridad y base de datos). Por ahora no usamos ningún servicio de envío de correos: te escribimos nosotras directamente. Si eso cambia, lo diremos aquí antes de usar tus datos de otra manera." },
          { p: "No vendemos tus datos. Nunca." },
        ],
      },
      {
        h: "Cuánto tiempo los guardamos",
        body: [{ p: "Hasta que nos pidas darte de baja o eliminarlos." }],
      },
      {
        h: "Tus derechos",
        body: [
          { mail: true, before: "Acceso, rectificación, supresión, portabilidad y oposición. Escríbenos a ", after: " y te respondemos. También puedes reclamar ante la autoridad de protección de datos de Berlín (Berliner Beauftragte für Datenschutz und Informationsfreiheit)." },
        ],
      },
      {
        h: "Cookies",
        body: [{ p: "No usamos cookies de seguimiento." }],
      },
    ],
  },
  en: {
    home: "/en",
    back: "Back to home",
    homeLabel: "Elara — home",
    privacyHref: "/privacy",
    privacy: "Privacy",
    contact: "Contact",
    footer: "Made by two women who needed it too.",
    title: "Privacy Policy — Elara",
    updated: "Last updated: October 11, 2026",
    sections: [
      {
        h: "Who we are",
        body: [
          { mail: true, before: 'Elara ("we") operates holaelara.com. For anything about privacy, write to us at ', after: "." },
        ],
      },
      {
        h: "What we collect",
        body: [
          { p: "When you join the waitlist: your name, your email, and the language of the page you were viewing. If you choose, also your WhatsApp number, your Instagram handle, and what feels heaviest right now (one option from a list). Those last three are optional." },
          { p: "What you type in the “Write to Elara” section stays in your browser: we don’t send it or store it." },
        ],
      },
      {
        h: "What we use it for",
        list: ["To let you know when Elara is available", "To write to you about the launch and the 7-day reset", "To understand who is part of our community"],
        body: [{ p: "Legal basis (GDPR): your consent (Art. 6(1)(a)). You can withdraw it at any time." }],
      },
      {
        h: "Who we share it with",
        body: [
          { p: "We store your data with Cloudflare (hosting, security and database). For now we don’t use any email-sending service: we write to you ourselves. If that changes, we’ll say so here before using your data in a new way." },
          { p: "We don’t sell your data. Ever." },
        ],
      },
      {
        h: "How long we keep it",
        body: [{ p: "Until you ask us to remove you or delete it." }],
      },
      {
        h: "Your rights",
        body: [
          { mail: true, before: "Access, rectification, erasure, portability and objection. Write to us at ", after: " and we’ll reply. You can also complain to the Berlin data protection authority (Berliner Beauftragte für Datenschutz und Informationsfreiheit)." },
        ],
      },
      {
        h: "Cookies",
        body: [{ p: "We don’t use tracking cookies." }],
      },
    ],
  },
} as const;

function Nav({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-cream/95 backdrop-blur-[6px]">
      <div className={`${WRAP} flex h-[68px] items-center justify-between gap-4`}>
        <a href={t.home} className="text-ink" aria-label={t.homeLabel}>
          <Wordmark size={34} />
        </a>
        <a href={t.home} className="e-label text-ink-72 transition-colors hover:text-ink">
          {t.back}
        </a>
      </div>
    </header>
  );
}

function Footer({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <footer className="on-field e-field bg-forest py-10">
      <div className={`${WRAP} flex flex-wrap items-center justify-between gap-4`}>
        <Wordmark size={40} onDark />
        <nav className="flex items-center gap-5">
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
        <p className="e-caption">
          © {new Date().getFullYear()} Elara · {t.footer}
        </p>
      </div>
    </footer>
  );
}

export function Privacidad({ lang = "es" }: { lang?: Lang }) {
  const t = COPY[lang];
  return (
    <main className="min-h-screen bg-cream text-ink" lang={lang}>
      <Nav lang={lang} />
      <article className="pb-20 pt-28 sm:pb-28">
        <div className="mx-auto w-full max-w-2xl px-5 sm:px-8">
          <h1 className="e-h1 text-ink">{t.title}</h1>
          <p className="e-caption mt-2">{t.updated}</p>

          <div className="e-rule mt-8 pt-8">
            {t.sections.map((s) => (
              <section key={s.h} className="e-row py-5">
                <h2 className="e-h2 text-ink">{s.h}</h2>
                {"list" in s && s.list && (
                  <ul className="e-body mt-2 list-inside list-disc space-y-1">
                    {s.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                )}
                {s.body.map((b, i) =>
                  "mail" in b ? (
                    <p key={i} className="e-body mt-2">
                      {b.before}
                      <a href={`mailto:${MAIL}`} className="e-link">
                        {MAIL}
                      </a>
                      {b.after}
                    </p>
                  ) : (
                    <p key={i} className="e-body mt-2">
                      {b.p}
                    </p>
                  ),
                )}
              </section>
            ))}
          </div>
        </div>
      </article>
      <Footer lang={lang} />
    </main>
  );
}
