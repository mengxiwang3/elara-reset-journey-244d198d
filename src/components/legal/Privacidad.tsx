import { Wordmark } from "../elara/Wordmark";

const WRAP = "mx-auto w-full max-w-6xl px-5 sm:px-8";

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-cream/95 backdrop-blur-[6px]">
      <div className={`${WRAP} flex h-[68px] items-center justify-between gap-4`}>
        <a href="/" className="text-ink" aria-label="Elara — inicio">
          <Wordmark size={34} />
        </a>
        <a href="/" className="e-label text-ink-72 transition-colors hover:text-ink">
          Volver al inicio
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="on-field e-field bg-forest py-10">
      <div className={`${WRAP} flex flex-wrap items-center justify-between gap-4`}>
        <Wordmark size={40} onDark />
        <nav className="flex items-center gap-5">
          <a href="/privacidad" className="e-label text-cream-72 transition-colors hover:text-cream">
            Privacidad
          </a>
          <a
            href="mailto:hola@holaelara.com"
            className="e-label text-cream-72 transition-colors hover:text-cream"
          >
            Contacto
          </a>
          <a
            href="https://instagram.com/alejandra.travels"
            target="_blank"
            rel="noreferrer"
            className="e-label text-cream-72 transition-colors hover:text-cream"
          >
            Instagram
          </a>
        </nav>
        <p className="e-caption">
          © {new Date().getFullYear()} Elara · Hecho por dos mujeres que también lo necesitaban.
        </p>
      </div>
    </footer>
  );
}

export function Privacidad() {
  return (
    <main className="min-h-screen bg-cream text-ink" lang="es">
      <Nav />
      <article className="pb-20 pt-28 sm:pb-28">
        <div className="mx-auto w-full max-w-2xl px-5 sm:px-8">
          <h1 className="e-h1 text-ink">
            Política de Privacidad — Elara
          </h1>
          <p className="e-caption mt-2">Última actualización: 7 de octubre de 2026</p>

          <div className="e-rule mt-8 pt-8">
            <section className="e-row py-5">
              <h2 className="e-h2 text-ink">Quiénes somos</h2>
              <p className="e-body mt-2">
                Elara ("nosotras") opera holaelara.com. Para cualquier asunto de privacidad, escríbenos a{" "}
                <a href="mailto:privacidad@holaelara.com" className="e-link">
                  privacidad@holaelara.com
                </a>
                .
              </p>
            </section>

            <section className="e-row py-5">
              <h2 className="e-h2 text-ink">Qué datos recopilamos</h2>
              <p className="e-body mt-2">
                Cuando te unes a la lista de espera: nombre, correo electrónico, número de WhatsApp
                y usuario de Instagram (opcionales según el formulario).
              </p>
            </section>

            <section className="e-row py-5">
              <h2 className="e-h2 text-ink">Para qué los usamos</h2>
              <ul className="e-body mt-2 list-inside list-disc space-y-1">
                <li>Avisarte cuando Elara esté disponible</li>
                <li>Enviarte correos sobre el lanzamiento y el reset de 7 días</li>
                <li>Entender quién forma parte de nuestra comunidad</li>
              </ul>
              <p className="e-body mt-2">
                Base legal (RGPD): tu consentimiento (art. 6.1.a). Puedes retirarlo en cualquier momento.
              </p>
            </section>

            <section className="e-row py-5">
              <h2 className="e-h2 text-ink">Con quién los compartimos</h2>
              <p className="e-body mt-2">Usamos proveedores para operar la lista de espera:</p>
              <ul className="e-body mt-2 list-inside list-disc space-y-1">
                <li>Loops (envío de correos) — datos procesados en EE. UU. bajo cláusulas contractuales tipo</li>
                <li>Cloudflare (alojamiento y seguridad)</li>
              </ul>
              <p className="e-body mt-2">No vendemos tus datos. Nunca.</p>
            </section>

            <section className="e-row py-5">
              <h2 className="e-h2 text-ink">Cuánto tiempo los guardamos</h2>
              <p className="e-body mt-2">Hasta que te des de baja o nos pidas eliminarlos.</p>
            </section>

            <section className="e-row py-5">
              <h2 className="e-h2 text-ink">Tus derechos</h2>
              <p className="e-body mt-2">
                Acceso, rectificación, supresión, portabilidad y oposición. Escríbenos a{" "}
                <a href="mailto:privacidad@holaelara.com" className="e-link">
                  privacidad@holaelara.com
                </a>
                . También puedes reclamar ante la autoridad de protección de datos de Berlín
                (Berliner Beauftragte für Datenschutz und Informationsfreiheit).
              </p>
            </section>

            <section className="e-row py-5">
              <h2 className="e-h2 text-ink">Cookies</h2>
              <p className="e-body mt-2">No usamos cookies de seguimiento.</p>
            </section>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
