import { EditorialScreenDeck } from "./EditorialScreenDeck";

export function SoftHero() {
  return (
    <section id="top" className="soft-hero editorial-hero">
      <div className="editorial-kicker uppercase text-muted-foreground">
        <span>Elara</span>
        <span>Hecha primero en español</span>
      </div>

      <div className="editorial-hero-grid">
        <div className="soft-hero-copy soft-entrance">
          <h1>
            Un lugar para todo lo que llevas
            <span> por dentro.</span>
          </h1>
          <p className="soft-hero-description">
            Cuando has estado pendiente de todos, puede ser difícil escucharte a ti.
            Elara te ayuda a hacer una pausa, ver qué necesita atención y empezar por algo pequeño.
          </p>
          <div className="soft-hero-actions">
            <a href="#lista" className="bg-primary text-primary-foreground hover:bg-accent transition-colors inline-flex items-center justify-center gap-3 px-7 py-3.5">
              Quiero conocer Elara <span aria-hidden="true">→</span>
            </a>
            <a href="#alejandra" className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground">
              Por qué la estamos creando
            </a>
          </div>
        </div>

        <EditorialScreenDeck />
      </div>

      <div className="editorial-proof">
        <span>Escuchamos antes de construir.</span>
        <strong>4,601</strong>
        <p>respuestas de mujeres sobre lo que están cargando y lo que necesitan ahora.</p>
      </div>
    </section>
  );
}
