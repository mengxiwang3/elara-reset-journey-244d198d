function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="/es" className="font-serif text-2xl tracking-tight text-foreground">
          elara<span className="text-accent">.</span>
        </a>
        <a href="/es" className="text-sm text-muted-foreground hover:text-foreground transition">
          Volver al inicio
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-serif text-lg text-foreground">elara<span className="text-accent">.</span></p>
        <nav className="flex items-center gap-5">
          <a href="/privacidad" className="hover:text-foreground transition">Privacidad</a>
          <a href="mailto:hola@holaelara.com" className="hover:text-foreground transition">Contacto</a>
          <a href="https://instagram.com/alejandra.travels" target="_blank" rel="noreferrer" className="hover:text-foreground transition">Instagram</a>
        </nav>
        <p>© {new Date().getFullYear()} Elara · Hecho por dos mujeres que también lo necesitaban.</p>
      </div>
    </footer>
  );
}

export function Privacidad() {
  return (
    <main className="min-h-screen bg-background text-foreground" lang="es">
      <Nav />
      <article className="pt-32 pb-24 sm:pb-32">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground text-balance">
            Política de Privacidad — Elara
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">Última actualización: 3 de julio de 2026</p>

          <div className="mt-12 space-y-10 text-base text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-foreground">Quiénes somos</h2>
              <p className="mt-3">
                Elara ("nosotras") opera holaelara.com. Responsable del tratamiento:{" "}
                {/* TODO: replace with the registered legal entity name and Berlin business address */}
                [Nombre legal de la entidad], [Dirección en Berlín]. Contacto: privacidad@holaelara.com
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-foreground">Qué datos recopilamos</h2>
              <p className="mt-3">
                Cuando te unes a la lista de espera: nombre, correo electrónico, número de WhatsApp
                y usuario de Instagram (opcionales según el formulario).
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-foreground">Para qué los usamos</h2>
              <ul className="mt-3 list-disc list-inside space-y-1.5">
                <li>Avisarte cuando Elara esté disponible</li>
                <li>Enviarte correos sobre el lanzamiento y el reset de 7 días</li>
                <li>Entender quién forma parte de nuestra comunidad</li>
              </ul>
              <p className="mt-3">
                Base legal (RGPD): tu consentimiento (art. 6.1.a). Puedes retirarlo en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-foreground">Con quién los compartimos</h2>
              <p className="mt-3">Usamos proveedores para operar la lista de espera:</p>
              <ul className="mt-3 list-disc list-inside space-y-1.5">
                <li>Loops (envío de correos) — datos procesados en EE. UU. bajo cláusulas contractuales tipo</li>
                <li>Cloudflare (alojamiento y seguridad)</li>
              </ul>
              <p className="mt-3">No vendemos tus datos. Nunca.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-foreground">Cuánto tiempo los guardamos</h2>
              <p className="mt-3">Hasta que te des de baja o nos pidas eliminarlos.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-foreground">Tus derechos</h2>
              <p className="mt-3">
                Acceso, rectificación, supresión, portabilidad y oposición. Escríbenos a{" "}
                <a href="mailto:privacidad@holaelara.com" className="text-accent hover:text-foreground transition">
                  privacidad@holaelara.com
                </a>
                . También puedes reclamar ante la autoridad de protección de datos de Berlín
                (Berliner Beauftragte für Datenschutz und Informationsfreiheit).
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-foreground">Cookies</h2>
              <p className="mt-3">No usamos cookies de seguimiento.</p>
            </section>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
